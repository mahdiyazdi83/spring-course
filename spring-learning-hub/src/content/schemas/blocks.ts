import { z } from 'astro/zod';
import { provenanceSchema } from './knowledge.ts';

const blockId = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
export const sourceBlockSchema = provenanceSchema.safeExtend({
  id: blockId,
  // Space-separated IDs keep MDX attribution static, readable and inspectable.
  context: z.string().trim().default(''),
  summary: z.string().trim().min(1).max(400).optional(),
  corrects: blockId.optional(),
});
export type SourceBlockData = z.infer<typeof sourceBlockSchema>;

export const codeLanguages = ['java', 'xml', 'yaml', 'properties', 'sql', 'bash', 'json'] as const;
export const codeExampleSchema = sourceBlockSchema.safeExtend({
  source: z.enum(['teacher', 'gpt']),
  code: z.string().trim().min(1),
  lang: z.enum(codeLanguages),
  filename: z.string().trim().min(1),
  repositoryPath: z.string().trim().min(1).optional(),
  caption: z.string().trim().min(1).optional(),
  mark: z
    .string()
    .regex(/^\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*$/)
    .optional(),
});

export const correctionSchema = sourceBlockSchema.safeExtend({
  source: z.literal('gpt'),
  corrects: blockId,
  statement: z.string().trim().min(1),
  correction: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});
