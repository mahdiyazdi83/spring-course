import type { Knowledge, Concept, Session } from '../content/schemas/knowledge.ts';

export interface GraphEntry {
  route: string;
  title: string;
  knowledge: Knowledge;
  draft?: boolean;
}

/** Pagefind accepts plain metadata, so isolate technical runs without injecting HTML. */
export function searchTitle(title: string, knowledge: Knowledge): string {
  const isolated = title.replace(
    /@?[A-Za-z][A-Za-z0-9]*(?:[ ._-][A-Za-z][A-Za-z0-9]*)*/g,
    (term) => `\u2066${term}\u2069`,
  );
  return `${contentLabel(knowledge)} | ${isolated}`;
}
export const relationLabels: Record<Session['concepts'][number]['relation'], string> = {
  introduced: 'معرفی',
  expanded: 'تکمیل',
  reviewed: 'مرور',
  'used-in-code': 'کاربرد در کد',
  mentioned: 'اشاره',
};
export function contentLabel(kb: Knowledge): string {
  if (kb.type === 'index') return 'فهرست';
  if (kb.type === 'concept') return 'مفهوم';
  const number = new Intl.NumberFormat('fa-IR').format(kb.sessionNumber);
  return `${kb.type === 'tuesday' ? 'سه‌شنبه' : 'پنج‌شنبه'} · جلسهٔ ${number}`;
}
const visibleTo = (entry: GraphEntry, current: Concept | Session) =>
  !entry.draft && entry.knowledge.type !== 'index' && (current.demo || !entry.knowledge.demo);

/** Occurrences are derived exclusively from session-owned edges. */
export function conceptAppearances(entries: GraphEntry[], concept: Concept) {
  return entries
    .flatMap((entry) => {
      const kb = entry.knowledge;
      if (!visibleTo(entry, concept) || (kb.type !== 'tuesday' && kb.type !== 'thursday'))
        return [];
      const edge = kb.concepts.find(({ id }) => id === concept.id);
      return edge
        ? [
            {
              ...entry,
              knowledge: kb,
              relation: edge.relation,
              href: entry.route + (edge.anchor ? `#${edge.anchor}` : ''),
            },
          ]
        : [];
    })
    .sort(
      (a, b) =>
        a.knowledge.createdAt.localeCompare(b.knowledge.createdAt) ||
        (a.knowledge.type === b.knowledge.type
          ? a.knowledge.sessionNumber - b.knowledge.sessionNumber
          : a.knowledge.type === 'tuesday'
            ? -1
            : 1),
    );
}

/** One authored cross-session link supports discovery in both directions. */
export function relatedEntries(entries: GraphEntry[], current: Concept | Session): GraphEntry[] {
  return entries
    .filter((entry) => {
      const kb = entry.knowledge;
      if (!visibleTo(entry, current) || kb.type === 'index' || kb.id === current.id) return false;
      if (current.type === 'concept')
        return (
          kb.type === 'concept' &&
          (current.relatedConcepts.includes(kb.id) || kb.relatedConcepts.includes(current.id))
        );
      return (
        (kb.type === 'tuesday' || kb.type === 'thursday') &&
        (current.relatedSessions.includes(kb.id) || kb.relatedSessions.includes(current.id))
      );
    })
    .sort((a, b) => a.route.localeCompare(b.route, 'en', { numeric: true }));
}
