import { createProcessor } from '@mdx-js/mdx';

interface Node {
  type: string;
  value?: string;
  children?: Node[];
  attributes?: { name?: string; value?: unknown }[];
}

/** Parse structure, never execute MDX. Code fences and example strings are not anchors. */
export function inspectAnchors(body: string): { anchors: string[]; errors: string[] } {
  const tree = createProcessor().parse(body) as Node;
  const anchors = ['_top'];
  const errors: string[] = [];
  const add = (id: string) => {
    if (anchors.includes(id)) errors.push(`Duplicate anchor ${id}.`);
    anchors.push(id);
  };
  const visit = (node: Node) => {
    if (node.type === 'heading') {
      const last = node.children?.at(-1);
      const id =
        last?.type === 'text' && /\s+\[#([a-z0-9]+(?:-[a-z0-9]+)*)\]$/.exec(last.value ?? '')?.[1];
      if (id) add(id);
      else errors.push('Every Markdown heading requires an explicit [#stable-id] suffix.');
    }
    for (const attr of node.attributes ?? []) {
      if (attr.name === 'id' && typeof attr.value === 'string') add(attr.value);
    }
    node.children?.forEach(visit);
  };
  visit(tree);
  return { anchors, errors };
}
