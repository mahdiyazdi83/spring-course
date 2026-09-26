import { createProcessor } from '@mdx-js/mdx';
import {
  sourceBlockSchema,
  codeExampleSchema,
  correctionSchema,
  type SourceBlockData,
} from '../src/content/schemas/blocks.ts';
import type { Knowledge } from '../src/content/schemas/knowledge.ts';
import { validateBlockGraph } from '../src/utils/source-blocks.ts';

// A deliberately small structural view of the parser AST. No MDX code is executed.
interface Node {
  type: string;
  name?: string;
  attributes?: { type: string; name?: string; value?: unknown }[];
  children?: Node[];
  position?: { start: { line: number } };
  data?: {
    estree?: {
      body: {
        type: string;
        source?: { value: unknown };
        specifiers?: { local?: { name: string } }[];
      }[];
    };
  };
}
const componentNames = new Set(['SourceBlock', 'GptNote', 'TechnicalCorrection', 'CodeExample']);

export function inspectMdxProvenance(body: string, kb: Knowledge): string[] {
  if (kb.type === 'index') return [];
  const errors: string[] = [];
  const blocks: SourceBlockData[] = [];
  const tree = createProcessor().parse(body) as Node;
  const aliases = new Map<string, string>();
  for (const node of tree.children ?? []) {
    for (const statement of node.data?.estree?.body ?? []) {
      if (statement.type !== 'ImportDeclaration' || typeof statement.source?.value !== 'string')
        continue;
      const component = statement.source.value
        .split('/')
        .pop()
        ?.replace(/\.astro$/, '');
      if (!component || !componentNames.has(component)) continue;
      for (const specifier of statement.specifiers ?? []) {
        if (specifier.local) aliases.set(specifier.local.name, component);
      }
    }
  }
  const visit = (node: Node, parentBlock?: string) => {
    let current = parentBlock;
    const component = node.name ? (aliases.get(node.name) ?? node.name) : undefined;
    if (component && componentNames.has(component)) {
      const location = `${node.name} at body line ${node.position?.start.line ?? '?'}`;
      if (parentBlock)
        errors.push(`${location}: nested source blocks are not supported; use adjacent blocks.`);
      const props: Record<string, unknown> = {};
      for (const attribute of node.attributes ?? []) {
        if (attribute.type !== 'mdxJsxAttribute' || !attribute.name) {
          errors.push(`${location}: spread attributes cannot be audited.`);
          continue;
        }
        if (attribute.name in props)
          errors.push(`${location}: duplicate attribute ${attribute.name}.`);
        // Code payload may be a raw import/expression; provenance must stay literal.
        if (attribute.name === 'code' && component === 'CodeExample') {
          props.code =
            typeof attribute.value === 'string' ? attribute.value : 'validated during rendering';
        } else if (typeof attribute.value === 'string') props[attribute.name] = attribute.value;
        else errors.push(`${location}: ${attribute.name} must be a literal string.`);
      }
      if (component === 'GptNote' || component === 'TechnicalCorrection') {
        if ('source' in props) errors.push(`${location}: GPT components have fixed attribution.`);
        props.source = 'gpt';
      }
      if (component !== 'TechnicalCorrection' && 'corrects' in props) {
        errors.push(`${location}: use TechnicalCorrection for corrections.`);
      }
      const schema =
        component === 'CodeExample'
          ? codeExampleSchema
          : component === 'TechnicalCorrection'
            ? correctionSchema
            : sourceBlockSchema;
      const result = schema.safeParse(props);
      if (!result.success) errors.push(`${location}: ${result.error.message}`);
      else {
        blocks.push(
          sourceBlockSchema.parse(
            Object.fromEntries(
              Object.entries(result.data).filter(([key]) =>
                [
                  'id',
                  'source',
                  'recording',
                  'timestamp',
                  'context',
                  'summary',
                  'corrects',
                ].includes(key),
              ),
            ),
          ),
        );
        current = result.data.id;
        if (
          component === 'CodeExample' &&
          props.source === 'teacher' &&
          (!kb.sources.teacher?.repository || !props.repositoryPath)
        ) {
          errors.push(
            `${location}: Teacher Code requires a pinned teacher repository and repositoryPath.`,
          );
        }
      }
    }
    node.children?.forEach((child) => visit(child, current));
  };
  visit(tree);
  errors.push(...validateBlockGraph(blocks, kb));
  return errors;
}
