import type { Knowledge } from '../content/schemas/knowledge.ts';

export interface KnowledgeDocument {
  route: string;
  knowledge: Knowledge;
  anchors?: string[];
  draft?: boolean;
}

/** Validate semantic IDs across documents without coupling metadata to display titles. */
export function validateContentGraph(documents: KnowledgeDocument[]): string[] {
  const errors: string[] = [];
  const byId = new Map<string, KnowledgeDocument>();
  const routes = new Set<string>();

  for (const document of documents) {
    const { route, knowledge: entry } = document;
    if (routes.has(route)) errors.push(`${route}: duplicate route.`);
    routes.add(route);
    if (entry.type === 'index') {
      const expected = entry.section === 'home' ? '/' : `/${entry.section}/`;
      if (route !== expected) errors.push(`${route}: index must live at ${expected}.`);
      continue;
    }
    if (byId.has(entry.id)) errors.push(`${route}: duplicate content ID ${entry.id}.`);
    byId.set(entry.id, document);
    const expected =
      entry.type === 'concept'
        ? `/concepts/${entry.id}/`
        : `/${entry.type}/session-${String(entry.sessionNumber).padStart(2, '0')}/`;
    if (route !== expected) errors.push(`${route}: stable route must be ${expected}.`);
  }

  for (const { route, knowledge: entry, anchors, draft } of documents) {
    if (entry.type === 'index') continue;
    const check = (ids: string[], field: string, targetType: 'concept' | 'session') => {
      if (new Set(ids).size !== ids.length) errors.push(`${route}: duplicate ${field} reference.`);
      for (const id of ids) {
        const target = byId.get(id)?.knowledge;
        if (id === entry.id) errors.push(`${route}: ${field} cannot reference itself.`);
        if (!target || target.type === 'index') {
          errors.push(`${route}: ${field} references missing ID ${id}.`);
        } else if (
          targetType === 'concept'
            ? target.type !== 'concept'
            : target.type !== 'tuesday' && target.type !== 'thursday'
        ) {
          errors.push(`${route}: ${field} must reference a ${targetType}: ${id}.`);
        } else if (!entry.demo && target.demo) {
          errors.push(`${route}: real content cannot depend on demo ${id}.`);
        }
        if (!draft && byId.get(id)?.draft) {
          errors.push(`${route}: published content cannot reference unpublished draft ${id}.`);
        }
      }
    };
    check(entry.prerequisites, 'prerequisites', 'concept');
    if (entry.type === 'concept') {
      check(entry.relatedConcepts, 'relatedConcepts', 'concept');
    } else {
      check(entry.prerequisiteSessions, 'prerequisiteSessions', 'session');
      check(
        entry.concepts.map((concept) => concept.id),
        'concepts',
        'concept',
      );
      check(entry.relatedSessions, 'relatedSessions', 'session');
      for (const edge of entry.concepts) {
        if (edge.anchor && !anchors?.includes(edge.anchor)) {
          errors.push(
            `${route}: concept ${edge.id} references missing local anchor ${edge.anchor}.`,
          );
        }
      }
    }
  }

  // Prerequisites form a learning order. Related links may be reciprocal, prerequisites may not.
  const visited = new Set<string>();
  const active = new Set<string>();
  const visit = (id: string, path: string[]) => {
    if (active.has(id)) {
      errors.push(`Prerequisite cycle: ${[...path, id].join(' -> ')}.`);
      return;
    }
    if (visited.has(id)) return;
    const entry = byId.get(id)?.knowledge;
    if (!entry || entry.type === 'index') return;
    active.add(id);
    entry.prerequisites.forEach((prerequisite) => visit(prerequisite, [...path, id]));
    if (entry.type !== 'concept') {
      entry.prerequisiteSessions.forEach((prerequisite) => visit(prerequisite, [...path, id]));
    }
    active.delete(id);
    visited.add(id);
  };
  byId.forEach((_, id) => visit(id, []));
  return errors;
}
