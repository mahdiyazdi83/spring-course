import { z } from 'astro/zod';

// Add future sources here; metadata, provenance and timeline types share this registry.
export const sourceIds = ['teacher', 'heydari', 'gpt'] as const;
export const sourceIdSchema = z.enum(sourceIds);
export type SourceId = z.infer<typeof sourceIdSchema>;
export const sourceLabels: Record<SourceId, string> = {
  teacher: 'استاد',
  heydari: 'آقای حیدری',
  gpt: 'GPT',
};

export const statusSchema = z.enum(['draft', 'in-progress', 'complete', 'needs-follow-up']);
export const relationshipSchema = z.enum([
  'introduced',
  'expanded',
  'reviewed',
  'used-in-code',
  'mentioned',
]);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a stable kebab-case ID.');
const sessionIdSchema = z.string().regex(/^(tuesday|thursday)-\d{2,}$/);
const textSchema = z.string().trim().min(1);
// Quote dates in YAML so every tool receives the same timezone-free string.
const dateSchema = z.iso.date();

export const timestampSchema = z
  .string()
  .regex(/^(?:\d{2,}:)?[0-5]\d:[0-5]\d$/, 'Use MM:SS or HH:MM:SS.');

export function timestampSeconds(value: string): number {
  return value.split(':').reduce((seconds, part) => seconds * 60 + Number(part), 0);
}

export const recordingSchema = z.strictObject({
  id: slugSchema,
  location: textSchema,
  kind: z.enum(['video', 'audio']),
  durationSeconds: z.number().int().positive().optional(),
});

export const repositorySchema = z
  .strictObject({
    location: textSchema,
    branch: textSchema.optional(),
    commit: z
      .string()
      .regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i)
      .optional(),
    snapshotPath: textSchema.optional(),
    capturedAt: dateSchema.optional(),
  })
  .refine((repo) => Boolean(repo.commit || repo.snapshotPath), {
    message: 'Pin a full commit or an immutable snapshotPath; a branch alone can change.',
  });

const sourceMaterialSchema = z.strictObject({
  recordings: z.array(recordingSchema).default([]),
  repository: repositorySchema.optional(),
  references: z.array(textSchema).default([]),
});

// Omit absent sources. Presence and recording counts are derived, never duplicated.
export const sourcesSchema = z.partialRecord(sourceIdSchema, sourceMaterialSchema);

// Shared by MDX validation, component rendering and the source-filter model.
export const provenanceSchema = z
  .strictObject({
    source: sourceIdSchema,
    recording: slugSchema.optional(),
    timestamp: timestampSchema.optional(),
  })
  .refine((block) => !block.timestamp || Boolean(block.recording), {
    message: 'A timestamp must identify its recording.',
    path: ['timestamp'],
  });
export type Provenance = z.infer<typeof provenanceSchema>;

export const timelineItemSchema = z
  .strictObject({
    topic: textSchema,
    source: sourceIdSchema,
    recording: slugSchema.optional(),
    start: timestampSchema.optional(),
    end: timestampSchema.optional(),
    approximate: z.boolean().default(false),
  })
  .superRefine((item, ctx) => {
    if ((item.start || item.end) && !item.recording) {
      ctx.addIssue({ code: 'custom', path: ['recording'], message: 'Identify the recording.' });
    }
    if (item.end && (!item.start || timestampSeconds(item.end) <= timestampSeconds(item.start))) {
      ctx.addIssue({ code: 'custom', path: ['end'], message: 'End must follow start.' });
    }
    if (item.approximate && !item.start) {
      ctx.addIssue({
        code: 'custom',
        path: ['approximate'],
        message: 'Approximate needs a start.',
      });
    }
  });

export const changeSchema = z.strictObject({
  date: dateSchema,
  type: z.enum(['initial', 'source-added', 'correction', 'content-update', 'concept-update']),
  summary: textSchema,
});

const editorialFields = {
  id: slugSchema,
  status: statusSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
  demo: z.boolean().default(false),
  sources: sourcesSchema,
  prerequisites: z.array(slugSchema).default([]),
  changes: z.array(changeSchema).min(1),
};

const sessionFields = {
  ...editorialFields,
  id: sessionIdSchema,
  sessionNumber: z.number().int().positive(),
  prerequisiteSessions: z.array(sessionIdSchema).default([]),
  concepts: z
    .array(
      z.strictObject({
        id: slugSchema,
        relation: relationshipSchema,
        anchor: slugSchema.optional(),
      }),
    )
    .default([]),
  relatedSessions: z.array(sessionIdSchema).default([]),
  timeline: z.array(timelineItemSchema).default([]),
};

export const knowledgeSchema = z
  .discriminatedUnion('type', [
    z.strictObject({
      type: z.literal('index'),
      section: z.enum(['home', 'tuesday', 'thursday', 'concepts']),
    }),
    z.strictObject({ type: z.literal('tuesday'), ...sessionFields }),
    z.strictObject({ type: z.literal('thursday'), ...sessionFields }),
    z.strictObject({
      type: z.literal('concept'),
      ...editorialFields,
      relatedConcepts: z.array(slugSchema).default([]),
    }),
  ])
  .superRefine((entry, ctx) => {
    if (entry.type === 'index') return;
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path, message });

    if (entry.updatedAt < entry.createdAt) {
      issue(['updatedAt'], 'updatedAt must not precede createdAt.');
    }
    entry.changes.forEach((change, i) => {
      if (change.date < entry.createdAt || change.date > entry.updatedAt) {
        issue(['changes', i, 'date'], 'Change date must be between createdAt and updatedAt.');
      }
    });
    if (!entry.changes.some((change) => change.date === entry.updatedAt)) {
      issue(['changes'], 'Record a meaningful change for updatedAt.');
    }
    for (const source of sourceIds) {
      const materials = entry.sources[source];
      if (!materials) continue;
      const ids = materials.recordings.map((recording) => recording.id);
      const locators = [
        ...materials.recordings.map(({ location }) => location),
        ...materials.references,
        materials.repository?.location,
        materials.repository?.snapshotPath,
      ].filter((value): value is string => Boolean(value));
      if (!entry.demo && locators.some((location) => location.startsWith('demo:'))) {
        issue(['sources', source], 'Demo locators are forbidden in real documentation.');
      }
      if (new Set(ids).size !== ids.length) {
        issue(['sources', source, 'recordings'], 'Recording IDs must be unique within a source.');
      }
      if (
        source !== 'gpt' &&
        !ids.length &&
        !materials.repository &&
        !materials.references.length
      ) {
        issue(['sources', source], 'A human source must identify an actual source artifact.');
      }
    }
    if (entry.status === 'complete' && !Object.keys(entry.sources).length) {
      issue(['sources'], 'Complete content needs source provenance.');
    }
    if (entry.type === 'concept') return;

    const expectedId = `${entry.type}-${String(entry.sessionNumber).padStart(2, '0')}`;
    if (entry.id !== expectedId) issue(['id'], `Expected stable session ID ${expectedId}.`);

    entry.timeline.forEach((item, i) => {
      const material = entry.sources[item.source];
      if (!material) issue(['timeline', i, 'source'], 'Timeline source is not declared.');
      if (!item.recording) return;
      const recording = material?.recordings.find((r) => r.id === item.recording);
      if (!recording) {
        issue(['timeline', i, 'recording'], 'Recording does not exist for this source.');
      } else if (
        recording.durationSeconds !== undefined &&
        [item.start, item.end].some(
          (time) => time && timestampSeconds(time) > recording.durationSeconds!,
        )
      ) {
        issue(['timeline', i], 'Timestamp exceeds the recording duration.');
      }
    });
  });

export type Knowledge = z.infer<typeof knowledgeSchema>;
export type Session = Extract<Knowledge, { type: 'tuesday' | 'thursday' }>;
export type Concept = Extract<Knowledge, { type: 'concept' }>;
