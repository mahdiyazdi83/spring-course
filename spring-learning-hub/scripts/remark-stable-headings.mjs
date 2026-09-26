/** Explicit author-owned IDs: ## عنوان [#stable-id]. Runs before Astro collects headings. */
export default function stableHeadings() {
  return (tree) => {
    const ids = new Set(['_top']);
    const visit = (node) => {
      if (node.type === 'heading') {
        const last = node.children?.at(-1);
        const match =
          last?.type === 'text' && /\s+\[#([a-z0-9]+(?:-[a-z0-9]+)*)\]$/.exec(last.value);
        if (match) {
          if (ids.has(match[1])) throw new Error(`Duplicate heading anchor: ${match[1]}`);
          ids.add(match[1]);
          last.value = last.value.slice(0, match.index);
          node.data ??= {};
          node.data.hProperties = { ...node.data.hProperties, id: match[1] };
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
