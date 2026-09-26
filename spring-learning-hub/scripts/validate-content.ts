import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, JSON_SCHEMA } from 'js-yaml';
import { z } from 'astro/zod';
import { knowledgeSchema } from '../src/content/schemas/knowledge.ts';
import { validateContentGraph, type KnowledgeDocument } from '../src/utils/content-integrity.ts';
import { inspectMdxProvenance } from './mdx-provenance.ts';
import { inspectAnchors } from './mdx-anchors.ts';

const root = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const documents: KnowledgeDocument[] = [];
const errors: string[] = [];
const frontmatterSchema = z.object({
  title: z.string().trim().min(1),
  kb: knowledgeSchema,
  draft: z.boolean().default(false),
  // File locations are the single routing authority. No title/slug-based overrides.
  slug: z.never().optional(),
});

async function inspect(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspect(path);
      continue;
    }
    if (!['.md', '.mdx'].includes(extname(entry.name))) continue;
    const name = relative(root, path).split(sep).join('/');
    try {
      const text = await readFile(path, 'utf8');
      const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
      if (!match?.[1]) throw new Error('Missing YAML frontmatter.');
      const data = frontmatterSchema.parse(load(match[1], { schema: JSON_SCHEMA }));
      const slug = name.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
      const route = `/${slug.replace(/\/$/, '')}${slug ? '/' : ''}`;
      const inspection = inspectAnchors(text.slice(match[0].length));
      documents.push({ route, knowledge: data.kb, anchors: inspection.anchors, draft: data.draft });
      errors.push(...inspection.errors.map((error) => `${name}: ${error}`));
      errors.push(
        ...inspectMdxProvenance(text.slice(match[0].length), data.kb).map(
          (error) => `${name}: ${error}`,
        ),
      );
    } catch (error) {
      errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await inspect(root);
errors.push(...validateContentGraph(documents));
if (!documents.length) errors.push('No documents found.');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${documents.length} documents: schemas, stable routes, references and MDX provenance.`,
  );
}
