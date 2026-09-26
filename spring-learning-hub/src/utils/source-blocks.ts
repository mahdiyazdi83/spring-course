import { sourceLabels, timestampSeconds, type Knowledge } from '../content/schemas/knowledge.ts';
import type { SourceBlockData } from '../content/schemas/blocks.ts';
import { persianNumber } from './content-presentation.ts';

export type EditorialDocument = Exclude<Knowledge, { type: 'index' }>;

export function requireDocument(kb: Knowledge | undefined): EditorialDocument {
  if (!kb || kb.type === 'index')
    throw new Error('Documentation components require a session or concept.');
  return kb;
}

export function contextIds(block: Pick<SourceBlockData, 'context'>): string[] {
  return block.context.split(/\s+/).filter(Boolean);
}

export function provenanceErrors(block: SourceBlockData, kb: EditorialDocument): string[] {
  const errors: string[] = [];
  const material = kb.sources[block.source];
  if (!material) errors.push(`${block.id}: undeclared source ${block.source}.`);
  if (block.recording) {
    const recording = material?.recordings.find(({ id }) => id === block.recording);
    if (!recording)
      errors.push(`${block.id}: recording ${block.recording} does not belong to ${block.source}.`);
    else if (
      block.timestamp &&
      recording.durationSeconds !== undefined &&
      timestampSeconds(block.timestamp) > recording.durationSeconds
    ) {
      errors.push(`${block.id}: timestamp exceeds recording duration.`);
    }
  }
  return errors;
}

export function sourceCaption(
  block: Pick<SourceBlockData, 'source' | 'recording' | 'timestamp'>,
  kb: EditorialDocument,
): string {
  const parts = [sourceLabels[block.source] + (kb.demo ? ' · نمایشی' : '')];
  if (block.recording) {
    const index =
      kb.sources[block.source]?.recordings.findIndex(({ id }) => id === block.recording) ?? -1;
    parts.push(`فایل ${persianNumber(index + 1)}`);
  }
  return parts.join(' · ');
}

export function validateBlockGraph(blocks: SourceBlockData[], kb: EditorialDocument): string[] {
  const errors = blocks.flatMap((block) => provenanceErrors(block, kb));
  const byId = new Map(blocks.map((block) => [block.id, block]));
  if (byId.size !== blocks.length) errors.push('Duplicate source block ID.');
  for (const block of blocks) {
    const refs = contextIds(block);
    if (new Set(refs).size !== refs.length)
      errors.push(`${block.id}: duplicate context reference.`);
    for (const id of refs) {
      if (!byId.has(id)) errors.push(`${block.id}: unknown context block ${id}.`);
      else if (!byId.get(id)?.summary)
        errors.push(`${block.id}: context ${id} needs a standalone summary.`);
      if (id === block.id) errors.push(`${block.id}: context cannot refer to itself.`);
    }
    if (block.corrects) {
      const original = byId.get(block.corrects);
      if (block.source !== 'gpt' || !original || original.source === 'gpt') {
        errors.push(`${block.id}: a correction must identify a teacher/Heydari block.`);
      }
    }
  }
  const active = new Set<string>();
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (active.has(id)) {
      errors.push(`Context cycle at ${id}.`);
      return;
    }
    if (seen.has(id)) return;
    active.add(id);
    const block = byId.get(id);
    if (block) contextIds(block).forEach(visit);
    active.delete(id);
    seen.add(id);
  };
  blocks.forEach(({ id }) => visit(id));
  return errors;
}
