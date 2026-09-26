# Common processing sequence

These instructions apply to future authorized content work. Implementing the platform
does not authorize processing recordings. Use the actual patterns in `COMPONENTS.md`.

1. Identify the event and stable session ID from the user's new material. Locate only
   the corresponding inputs in `../records/` or `../teacher-files/` (or supplied locations).
   Do not guess a session from file modification dates; request a mapping if ambiguous.
2. Read `README.md`, the content model/rules and the relevant workflow below.
3. Read the affected session and directly relevant concepts; inspect only new/changed sources.
4. Record source inventory and historical repository pin. Extract efficient real timeline.
5. Organize learning order, prerequisites and attribution. Use SourceBlock IDs and literal
   source/recording props. Add standalone summaries and `context` only where needed.
   Consolidate only affected concepts. Keep timeline order separate from teaching order.
6. Update session-owned concept edges, related links, status, `updatedAt` and `changes`.
7. Use PrerequisiteList, SessionTimeline and ChangeLog to render metadata. On Tuesdays,
   add one SourceFilter before the learning body and group related headings/blocks in
   `<section data-source-group>`. Concepts use ConceptAppearances for reverse links.
8. Run `npm run check`; fix broken references. Exercise all available source combinations,
   context-only summaries and required corrections in the built preview.
9. Complete `PROCESSING-CHECKLIST.md`. Log one meaningful work unit with source coverage,
   changed concepts and remaining gaps.

| Event                 | Workflow                                |
| --------------------- | --------------------------------------- |
| New Tuesday class     | `workflows/process-tuesday-session.md`  |
| Heydari addition      | `workflows/add-heydari-followup.md`     |
| New Thursday event    | `workflows/process-thursday-session.md` |
| Concept consolidation | `workflows/update-concepts.md`          |

Never re-read the whole course, regenerate unaffected pages, store huge transcripts under
`agent/`, or repeat analysis merely to fill logs. Reading/checking metadata across the small
content graph is distinct from reprocessing every historical source.
