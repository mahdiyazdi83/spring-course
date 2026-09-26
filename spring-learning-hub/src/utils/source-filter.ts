import type { SourceId } from '../content/schemas/knowledge.ts';

export interface FilterBlock {
  id: string;
  source: SourceId;
  contexts: string[];
  corrects?: string;
}
export type BlockVisibility = 'full' | 'context' | 'correction' | 'hidden';

/** Summaries are standalone: preserve only direct context, never entire excluded sources. */
export function filterBlocks(
  blocks: FilterBlock[],
  selected: ReadonlySet<SourceId>,
): Map<string, BlockVisibility> {
  const result = new Map<string, BlockVisibility>(
    blocks.map((block) => [block.id, selected.has(block.source) ? 'full' : 'hidden']),
  );
  // A known false statement must not lose its correction when GPT is deselected.
  for (const block of blocks) {
    if (
      block.corrects &&
      result.get(block.corrects) === 'full' &&
      result.get(block.id) === 'hidden'
    ) {
      result.set(block.id, 'correction');
    }
  }
  for (const block of blocks) {
    if (result.get(block.id) !== 'full' && result.get(block.id) !== 'correction') continue;
    for (const id of block.contexts) {
      if (result.get(id) === 'hidden') result.set(id, 'context');
    }
  }
  return result;
}
