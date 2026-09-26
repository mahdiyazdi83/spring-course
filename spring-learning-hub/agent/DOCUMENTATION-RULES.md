# Educational documentation rules

- Preserve actual class topic order separately from the main pedagogical body. Reorder
  the body to establish prerequisites first; do not blindly transcribe the teacher.
- Keep Tuesday teacher material and Heydari follow-up in the same Tuesday unit, with
  distinguishable block provenance. Thursday is an independent event, even when reviewing Tuesday.
- Every meaningful educational block must be attributable. Use SourceBlock or one of
  its specialized wrappers from `COMPONENTS.md`; do not wrap every sentence separately.
- GPT clarification is selective, short, accurate and practical, titled **یک کلام از GPT**.
  Use it for an actual learning gap, not mechanically in every section.
- GPT-generated code must say **GPT Example**; repository-derived code says **Teacher Code**
  only when verified against that session's repository snapshot. Never invent attribution.
- Explain Spring concepts for junior Java developers without repeating elementary Java
  unnecessarily. Make prerequisites explicit; do not oversimplify technical truth.
- Link repeated topics to canonical concepts. Capture what this session adds instead of
  duplicating whole definitions. A concept page consolidates explanations, not just tags.
- Fix obvious minor slips silently. For an important technical error, preserve the claim,
  explain correct behavior and why it matters, respectfully. Preserve genuinely historical
  explanations; do not label an explicitly historical approach a mistake.
- Inspect relevant repository files and actual dependency versions. Show only useful snippets
  and configuration, not the entire codebase. Never substitute a later commit silently.
- Prefer approximate timestamps or ordered topics to expensive second-level extraction.
- If adding missing related material, keep each item to roughly 2–3 short paragraphs;
  do not expand the course without purpose. Attribute supplementation as GPT.
- Preserve uncertainty and missing sources explicitly. Demo content must say it is demo,
  have `kb.demo: true`, and never pretend to be a real class event.
- Meaningful session updates require `updatedAt` and a human-readable `changes` entry.

Follow `DESIGN-SYSTEM.md` for visual conventions. Phase 2 adds presentation-only
ReadingNote and ScrollableTable helpers. Place them inside the attributed explanation
when they contain educational material. Phase 3's SourceBlock is the provenance boundary.
Real source processing still requires a separate user request.

- Use `summary` only for the minimum standalone context another block actually needs;
  a dependent block points to its ID using `context`. Summaries are editorial paraphrases,
  not invented quotations. Do not preserve a whole hidden source as context.
- Keep technical corrections attached with `corrects`. Explain the statement, precise
  behavior and significance neutrally. Verify against the actual course/library version.
  Filtering must not separate a known inaccurate statement from its essential correction.
- Use the heading **موضوعی که خوب است گفته شود** for supplementation and a GPT
  SourceBlock per item, generally 2–3 short paragraphs. Do not force GptNote everywhere.
- For repeated topics, link the canonical concept and prior session in a short attributed
  recap, then explain only what this session adds. A dedicated component is unnecessary.
- Do not reread all sessions, regenerate unrelated concepts, chase exact timestamps at
  unreasonable cost, duplicate long explanations or inspect the entire teacher repository.
  Prefer new sources → affected session → directly related concepts → required links →
  changelog → one concise agent log.
