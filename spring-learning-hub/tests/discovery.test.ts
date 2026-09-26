import assert from 'node:assert/strict';
import test from 'node:test';
import { createProcessor } from '@mdx-js/mdx';
import stableHeadings from '../scripts/remark-stable-headings.mjs';
import { inspectAnchors } from '../scripts/mdx-anchors.ts';
import { knowledgeSchema, type Concept, type Session } from '../src/content/schemas/knowledge.ts';
import {
  conceptAppearances,
  relatedEntries,
  contentLabel,
  type GraphEntry,
} from '../src/utils/knowledge-graph.ts';
import { validateContentGraph } from '../src/utils/content-integrity.ts';

const base = {
  status: 'draft',
  createdAt: '2026-09-26',
  updatedAt: '2026-09-26',
  sources: {},
  changes: [{ date: '2026-09-26', type: 'initial', summary: 'Fixture' }],
};
const concept = knowledgeSchema.parse({ ...base, type: 'concept', id: 'bean' }) as Concept;
const session = knowledgeSchema.parse({
  ...base,
  type: 'tuesday',
  id: 'tuesday-01',
  sessionNumber: 1,
  concepts: [{ id: 'bean', relation: 'introduced', anchor: 'beans' }],
}) as Session;
const entries: GraphEntry[] = [
  { route: '/concepts/bean/', title: 'Bean', knowledge: concept },
  { route: '/tuesday/session-01/', title: 'First', knowledge: session },
];

test('published relationship edges reject unpublished targets before rendering', () => {
  const docs = entries.map((e) => ({
    route: e.route,
    knowledge: e.knowledge,
    anchors: ['_top', 'beans'],
    draft: e.knowledge.type === 'concept',
  }));
  assert.match(validateContentGraph(docs).join(), /unpublished draft bean/);
  docs[1]!.draft = true;
  assert.deepEqual(validateContentGraph(docs), []);
});

test('occurrences derive relation, stable deep link and chronological order from sessions', () => {
  const thursday = knowledgeSchema.parse({
    ...base,
    type: 'thursday',
    id: 'thursday-01',
    sessionNumber: 1,
    concepts: [{ id: 'bean', relation: 'reviewed' }],
  }) as Session;
  const appearances = conceptAppearances(
    [{ route: '/thursday/session-01/', title: 'Review', knowledge: thursday }, ...entries],
    concept,
  );
  assert.deepEqual(
    appearances.map((e) => [e.relation, e.href]),
    [
      ['introduced', '/tuesday/session-01/#beans'],
      ['reviewed', '/thursday/session-01/'],
    ],
  );
});

test('unpublished pages and demo sessions cannot leak into real concept appearances', () => {
  assert.equal(
    conceptAppearances(
      [
        ...entries.map((e) => ({ ...e, draft: true })),
        { ...entries[1]!, knowledge: { ...session, demo: true } },
      ],
      concept,
    ).length,
    0,
  );
});

test('a single Thursday cross-link is discoverable from both sessions without duplication', () => {
  const review = knowledgeSchema.parse({
    ...base,
    type: 'thursday',
    id: 'thursday-01',
    sessionNumber: 1,
    relatedSessions: ['tuesday-01'],
  }) as Session;
  const graph = [
    ...entries,
    { route: '/thursday/session-01/', title: 'Review', knowledge: review },
  ];
  assert.equal(relatedEntries(graph, session)[0]?.knowledge.type, 'thursday');
  assert.equal(relatedEntries(graph, review)[0]?.knowledge.type, 'tuesday');
  assert.equal(relatedEntries(graph, concept).length, 0);
  assert.match(contentLabel(review), /پنج‌شنبه · جلسهٔ ۱/);
});

test('stable anchors survive heading text changes and ignore code examples', () => {
  const a = '## عنوان [#overview]\n\n```md\n## Example\n```';
  assert.deepEqual(inspectAnchors(a), { anchors: ['_top', 'overview'], errors: [] });
  assert.deepEqual(inspectAnchors('## عنوان تازه [#overview]').anchors, inspectAnchors(a).anchors);
  assert.equal(inspectAnchors('## بدون شناسه').errors.length, 1);
  assert.equal(inspectAnchors('## A [#same]\n\n<SourceBlock id="same" />').errors.length, 1);
});

test('remark removes the author marker and gives Astro an explicit heading ID', () => {
  const tree = createProcessor().parse('## عنوان [#overview]');
  stableHeadings()(tree);
  const heading = tree.children[0];
  assert.equal(heading?.data?.hProperties?.id, 'overview');
  assert.equal(heading?.type, 'heading');
  if (heading?.type === 'heading')
    assert.deepEqual(heading.children, [
      { type: 'text', value: 'عنوان', position: heading.children[0]?.position },
    ]);
});

test('an occurrence cannot silently point to a missing session heading', () => {
  const docs = entries.map((e) => ({ route: e.route, knowledge: e.knowledge, anchors: ['_top'] }));
  assert.match(validateContentGraph(docs).join(), /missing local anchor beans/);
  docs[1]!.anchors.push('beans');
  assert.deepEqual(validateContentGraph(docs), []);
});
