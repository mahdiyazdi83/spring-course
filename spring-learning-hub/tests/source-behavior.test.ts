import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledgeSchema, sourceIds } from '../src/content/schemas/knowledge.ts';
import { sourceBlockSchema } from '../src/content/schemas/blocks.ts';
import { filterBlocks, type FilterBlock } from '../src/utils/source-filter.ts';
import { validateBlockGraph } from '../src/utils/source-blocks.ts';
import { inspectMdxProvenance } from '../scripts/mdx-provenance.ts';
import { validateContentGraph } from '../src/utils/content-integrity.ts';

function session(overrides: Record<string, unknown> = {}) {
  const parsed = knowledgeSchema.parse({
    type: 'tuesday',
    id: 'tuesday-01',
    sessionNumber: 1,
    demo: true,
    status: 'draft',
    createdAt: '2026-09-26',
    updatedAt: '2026-09-26',
    sources: {
      teacher: {
        recordings: [
          { id: 'teacher-01', location: 'demo:teacher', kind: 'video', durationSeconds: 120 },
        ],
        repository: { location: 'demo:repo', snapshotPath: 'fixtures/repo' },
      },
      heydari: { recordings: [{ id: 'heydari-01', location: 'demo:heydari', kind: 'audio' }] },
      gpt: {},
    },
    changes: [{ date: '2026-09-26', type: 'initial', summary: 'Test fixture' }],
    ...overrides,
  });
  if (parsed.type === 'index' || parsed.type === 'concept') throw new Error('Expected session');
  return parsed;
}

const model: FilterBlock[] = [
  { id: 'teacher', source: 'teacher', contexts: [] },
  { id: 'heydari', source: 'heydari', contexts: ['teacher'] },
  { id: 'gpt', source: 'gpt', contexts: ['teacher'] },
  { id: 'correction', source: 'gpt', contexts: [], corrects: 'teacher' },
];

test('all eight source combinations preserve only necessary context and corrections', () => {
  const expected = [
    ['hidden', 'hidden', 'hidden', 'hidden'],
    ['full', 'hidden', 'hidden', 'correction'],
    ['context', 'full', 'hidden', 'hidden'],
    ['full', 'full', 'hidden', 'correction'],
    ['context', 'hidden', 'full', 'full'],
    ['full', 'hidden', 'full', 'full'],
    ['context', 'full', 'full', 'full'],
    ['full', 'full', 'full', 'full'],
  ];
  for (let mask = 0; mask < 8; mask++) {
    const selected = new Set(sourceIds.filter((_, index) => mask & (1 << index)));
    assert.deepEqual(
      [...filterBlocks(model, selected).values()],
      expected[mask],
      `combination ${mask}`,
    );
  }
});

test('missing Heydari or GPT content and standalone summaries do not leak hidden bodies', () => {
  assert.deepEqual([...filterBlocks(model.slice(0, 1), new Set(['teacher'])).values()], ['full']);
  assert.deepEqual(
    [...filterBlocks(model.slice(0, 2), new Set(['heydari'])).values()],
    ['context', 'full'],
  );
  const chained: FilterBlock[] = [
    { id: 'old', source: 'teacher', contexts: [] },
    { id: 'middle', source: 'teacher', contexts: ['old'] },
    { id: 'followup', source: 'heydari', contexts: ['middle'] },
  ];
  assert.deepEqual(
    [...filterBlocks(chained, new Set(['heydari'])).values()],
    ['hidden', 'context', 'full'],
  );
});

test('provenance validates optional times against the correct source recording', () => {
  const block = (props: Record<string, unknown>) =>
    sourceBlockSchema.parse({ id: 'example', source: 'teacher', ...props });
  assert.deepEqual(validateBlockGraph([block({})], session()), []);
  assert.deepEqual(
    validateBlockGraph([block({ recording: 'teacher-01', timestamp: '02:00' })], session()),
    [],
  );
  assert.match(
    validateBlockGraph([block({ recording: 'heydari-01' })], session()).join(),
    /does not belong/,
  );
  assert.match(
    validateBlockGraph([block({ recording: 'teacher-01', timestamp: '02:01' })], session()).join(),
    /exceeds/,
  );
  assert.throws(() => block({ timestamp: '00:10' }));
  assert.throws(() => block({ source: 'unknown' }));
  assert.match(
    validateBlockGraph([block({ source: 'gpt' })], session({ sources: {} })).join(),
    /undeclared/,
  );
});

test('context graph rejects dangling, duplicated, self, cyclic and summary-free references', () => {
  const teacher = sourceBlockSchema.parse({
    id: 'teacher',
    source: 'teacher',
    summary: 'Standalone context.',
  });
  const heydari = sourceBlockSchema.parse({ id: 'heydari', source: 'heydari', context: 'teacher' });
  assert.deepEqual(validateBlockGraph([teacher, heydari], session()), []);
  assert.match(validateBlockGraph([heydari], session()).join(), /unknown context/);
  assert.match(
    validateBlockGraph([{ ...teacher, summary: undefined }, heydari], session()).join(),
    /standalone summary/,
  );
  assert.match(
    validateBlockGraph([teacher, { ...heydari, context: 'teacher teacher' }], session()).join(),
    /duplicate context/,
  );
  assert.match(validateBlockGraph([teacher, teacher], session()).join(), /Duplicate source block/);
  assert.match(
    validateBlockGraph([{ ...teacher, context: 'teacher' }], session()).join(),
    /itself/,
  );
  assert.match(
    validateBlockGraph(
      [
        { ...teacher, context: 'heydari' },
        { ...heydari, summary: 'Summary.' },
      ],
      session(),
    ).join(),
    /Context cycle/,
  );
  assert.match(
    validateBlockGraph([{ ...teacher, corrects: 'missing' }], session()).join(),
    /correction must identify/,
  );
});

test('MDX inspection rejects invalid props without executing expressions', () => {
  assert.match(
    inspectMdxProvenance(
      'import Attributed from "./SourceBlock.astro";\n\n<Attributed id="aliased" source="teacher" recording="missing" />',
      session(),
    ).join(),
    /does not belong/,
  );
  assert.deepEqual(
    inspectMdxProvenance('<SourceBlock id="sample" source="teacher">Text</SourceBlock>', session()),
    [],
  );
  assert.match(
    inspectMdxProvenance(
      '<SourceBlock id="sample" source={process.exit(99)}>Text</SourceBlock>',
      session(),
    ).join(),
    /literal string/,
  );
  assert.match(
    inspectMdxProvenance('<SourceBlock {...unknown}>Text</SourceBlock>', session()).join(),
    /spread attributes/,
  );
  assert.match(
    inspectMdxProvenance(
      '<SourceBlock id="a" source="teacher"><GptNote id="b">Note</GptNote></SourceBlock>',
      session(),
    ).join(),
    /nested/,
  );
  assert.match(
    inspectMdxProvenance('<GptNote id="sample" source="teacher">Note</GptNote>', session()).join(),
    /fixed attribution/,
  );
  assert.match(
    inspectMdxProvenance('<GptNote id="sample" context="missing">Note</GptNote>', session()).join(),
    /unknown context/,
  );
  assert.match(
    inspectMdxProvenance(
      '<SourceBlock id="sample" source="teacher" recording="missing" />',
      session(),
    ).join(),
    /does not belong/,
  );
});

test('Teacher Code needs a pinned repository and path; all required code languages parse', () => {
  const teacher =
    '<CodeExample id="code" source="teacher" lang="java" filename="App.java" code={rawCode} />';
  assert.match(inspectMdxProvenance(teacher, session()).join(), /repositoryPath/);
  const pinned = teacher.replace('code={rawCode}', 'repositoryPath="App.java" code={rawCode}');
  assert.deepEqual(inspectMdxProvenance(pinned, session()), []);
  assert.match(
    inspectMdxProvenance(
      pinned,
      session({ sources: { teacher: { references: ['notes.md'] } } }),
    ).join(),
    /pinned teacher repository/,
  );
  for (const lang of ['java', 'xml', 'yaml', 'properties', 'sql', 'bash', 'json']) {
    assert.deepEqual(
      inspectMdxProvenance(
        `<CodeExample id="sample" source="gpt" lang="${lang}" filename="Example" code={rawCode} />`,
        session(),
      ),
      [],
    );
  }
});

test('prior-session prerequisites validate targets and cycles; demos cannot become real sources', () => {
  const first = session({ prerequisiteSessions: ['tuesday-02'] });
  const second = session({
    id: 'tuesday-02',
    sessionNumber: 2,
    prerequisiteSessions: ['tuesday-01'],
  });
  assert.match(
    validateContentGraph([{ route: '/tuesday/session-01/', knowledge: first }]).join(),
    /missing ID/,
  );
  assert.match(
    validateContentGraph([
      { route: '/tuesday/session-01/', knowledge: first },
      { route: '/tuesday/session-02/', knowledge: second },
    ]).join(),
    /Prerequisite cycle/,
  );
  assert.throws(() => session({ demo: false }), /Demo locators/);
});
