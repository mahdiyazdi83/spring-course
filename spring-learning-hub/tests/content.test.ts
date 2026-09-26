import assert from 'node:assert/strict';
import test from 'node:test';
import {
  knowledgeSchema,
  provenanceSchema,
  repositorySchema,
  type Knowledge,
} from '../src/content/schemas/knowledge.ts';
import { validateContentGraph } from '../src/utils/content-integrity.ts';

function session(overrides: Record<string, unknown> = {}): Knowledge {
  return knowledgeSchema.parse({
    type: 'tuesday',
    id: 'tuesday-01',
    sessionNumber: 1,
    status: 'draft',
    createdAt: '2026-09-26',
    updatedAt: '2026-09-26',
    sources: {},
    changes: [{ date: '2026-09-26', type: 'initial', summary: 'Test fixture only.' }],
    ...overrides,
  });
}

function concept(id = 'dependency-injection', overrides: Record<string, unknown> = {}): Knowledge {
  return knowledgeSchema.parse({
    type: 'concept',
    id,
    status: 'draft',
    createdAt: '2026-09-26',
    updatedAt: '2026-09-26',
    sources: {},
    changes: [{ date: '2026-09-26', type: 'initial', summary: 'Test fixture only.' }],
    ...overrides,
  });
}

test('a source-less draft and independent Thursday event are valid', () => {
  assert.equal(session().type, 'tuesday');
  assert.equal(session({ type: 'thursday', id: 'thursday-01' }).type, 'thursday');
  assert.throws(() => session({ type: 'thursday' }));
  assert.throws(() => session({ status: 'complete' }));
  assert.throws(() => session({ sessionNumber: 0 }));
});

test('human attribution requires an artifact; generated content does not fake a recording', () => {
  assert.throws(() => session({ sources: { teacher: {} } }));
  assert.throws(() => session({ sources: { heydary: {} } }));
  assert.doesNotThrow(() => session({ sources: { gpt: {} }, status: 'complete' }));
});

test('a follow-up can share a recording ID with a different source without merging inventories', () => {
  const teacher = {
    recordings: [{ id: 'part-1', location: '../records/example.mp4', kind: 'video' }],
  };
  const heydari = {
    recordings: [{ id: 'part-1', location: '../records/example.mp3', kind: 'audio' }],
  };
  assert.doesNotThrow(() => session({ sources: { teacher, heydari } }));
  assert.throws(() =>
    session({
      sources: { teacher: { recordings: [...teacher.recordings, ...teacher.recordings] } },
    }),
  );
});

test('timeline supports topic-only order and approximate times with recording bounds', () => {
  const sources = {
    teacher: {
      recordings: [
        { id: 'part-1', location: '../records/example.mp4', kind: 'video', durationSeconds: 120 },
      ],
    },
  };
  const item = { topic: 'Fixture topic', source: 'teacher', recording: 'part-1' };
  assert.doesNotThrow(() =>
    session({ sources, timeline: [{ topic: 'Fixture topic', source: 'teacher' }] }),
  );
  assert.doesNotThrow(() =>
    session({ sources, timeline: [{ ...item, start: '00:30', end: '02:00', approximate: true }] }),
  );
  for (const invalid of [
    { ...item, start: '00:60' },
    { ...item, start: '02:01' },
    { ...item, start: '01:00', end: '00:30' },
    { ...item, end: '01:00' },
    { ...item, recording: 'missing' },
    { ...item, source: 'heydari' },
    { ...item, approximate: true },
  ]) {
    assert.throws(() => session({ sources, timeline: [invalid] }));
  }
  assert.equal(
    provenanceSchema.safeParse({ source: 'teacher', timestamp: '01:00' }).success,
    false,
  );
});

test('a moving branch cannot stand in for a historical repository snapshot', () => {
  assert.equal(
    repositorySchema.safeParse({ location: '../teacher-files/example', branch: 'main' }).success,
    false,
  );
  assert.equal(
    repositorySchema.safeParse({ location: '../teacher-files/example', commit: 'a'.repeat(40) })
      .success,
    true,
  );
  assert.equal(
    repositorySchema.safeParse({
      location: '../teacher-files/example',
      snapshotPath: '../teacher-files/snapshots/tuesday-01',
    }).success,
    true,
  );
});

test('editorial dates reject invalid calendars and undocumented updates', () => {
  assert.throws(() => session({ createdAt: '2026-02-30' }));
  assert.throws(() => session({ updatedAt: '2026-09-25' }));
  assert.throws(() => session({ updatedAt: '2026-09-27' }));
  assert.throws(() => session({ changes: [] }));
});

test('sessions reference canonical concepts and independent sessions by stable ID', () => {
  const tuesday = session({ concepts: [{ id: 'dependency-injection', relation: 'introduced' }] });
  const thursday = session({
    type: 'thursday',
    id: 'thursday-01',
    prerequisites: ['dependency-injection'],
    relatedSessions: ['tuesday-01'],
  });
  assert.deepEqual(
    validateContentGraph([
      { route: '/tuesday/session-01/', knowledge: tuesday },
      { route: '/thursday/session-01/', knowledge: thursday },
      { route: '/concepts/dependency-injection/', knowledge: concept() },
    ]),
    [],
  );
});

test('broken, duplicated, wrong-kind and self references fail graph validation', () => {
  const document = {
    route: '/tuesday/session-01/',
    knowledge: session({
      concepts: [{ id: 'missing', relation: 'introduced' }],
      relatedSessions: ['tuesday-01'],
    }),
  };
  assert.match(validateContentGraph([document]).join('\n'), /missing ID missing/);
  assert.match(validateContentGraph([document]).join('\n'), /cannot reference itself/);
  assert.match(validateContentGraph([document, document]).join('\n'), /duplicate content ID/);
  assert.match(
    validateContentGraph([{ ...document, route: '/tuesday/new-title/' }]).join('\n'),
    /stable route/,
  );
  const wrongKind = session({ prerequisites: ['tuesday-01', 'tuesday-01'] });
  const errors = validateContentGraph([
    { route: '/tuesday/session-01/', knowledge: wrongKind },
  ]).join('\n');
  assert.match(errors, /must reference a concept/);
  assert.match(errors, /duplicate prerequisites/);
});

test('prerequisite cycles fail but reciprocal related concepts remain valid', () => {
  const a = { route: '/concepts/a/', knowledge: concept('a', { prerequisites: ['b'] }) };
  const b = { route: '/concepts/b/', knowledge: concept('b', { prerequisites: ['a'] }) };
  assert.match(validateContentGraph([a, b]).join('\n'), /Prerequisite cycle/);
  assert.deepEqual(
    validateContentGraph([
      { ...a, knowledge: concept('a', { relatedConcepts: ['b'] }) },
      { ...b, knowledge: concept('b', { relatedConcepts: ['a'] }) },
    ]),
    [],
  );
});

test('real content cannot acquire a demo prerequisite silently', () => {
  const errors = validateContentGraph([
    {
      route: '/tuesday/session-01/',
      knowledge: session({ prerequisites: ['dependency-injection'] }),
    },
    {
      route: '/concepts/dependency-injection/',
      knowledge: concept('dependency-injection', { demo: true }),
    },
  ]);
  assert.match(errors.join('\n'), /real content cannot depend on demo/);
});
