# Content model

Executable contract: `src/content/schemas/knowledge.ts`; collection binding:
`src/content.config.ts`. Types are inferred from schemas. All dates are quoted ISO
`'YYYY-MM-DD'` strings (calendar dates, no timezone). Unknown `kb` fields are rejected.

## Identity and page kinds

Every page requires a top-level Starlight `title` and a `kb` object.
`description` and native Starlight sidebar fields are optional. Do not set `slug`.

| `kb.type`  | Identity                                           | File / permanent route    |
| ---------- | -------------------------------------------------- | ------------------------- |
| `index`    | Required `section`: home/tuesday/thursday/concepts | Corresponding `index.mdx` |
| `tuesday`  | Required `id: tuesday-NN`, `sessionNumber`         | `tuesday/session-NN.mdx`  |
| `thursday` | Required `id: thursday-NN`, `sessionNumber`        | `thursday/session-NN.mdx` |
| `concept`  | Required stable kebab-case `id`                    | `concepts/<id>.mdx`       |

Numbers have a minimum width of two (`01`, `07`, `100`); IDs must match type and number.
Titles never determine identity. Astro's collection ID identifies a route, while `kb.id`
identifies a learning object. Never silently rename either after publication.

## Session and concept editorial fields

Required: `id`, `status`, `createdAt`, `updatedAt`, `sources`, and nonempty `changes`.
Sessions also require `sessionNumber`. Index pages need only `type` and `section`.

Optional/defaulted:

- `demo` defaults to false; examples explicitly set true. Real pages cannot reference demos.
- `prerequisites` defaults to `[]`: stable concept IDs, not URLs or session titles.
- Sessions: `concepts`, `relatedSessions`, `prerequisiteSessions`, `timeline` default to `[]`.
- Concepts: `relatedConcepts` defaults to `[]`.

Status is `draft | in-progress | complete | needs-follow-up`. This is editorial state,
not publication control: `status: draft` still builds. Native Starlight `draft: true`
hides a page in production; do not link published content to such pages. No transition
engine is needed. `complete` requires a declared source, but editorial review remains
necessary; structural validity is not factual verification.

`updatedAt >= createdAt`; change dates must be inside that interval. At least one change
must describe the latest `updatedAt`. Keep all useful previous changes.

## Sources and block provenance

`sources` is a partial map of `teacher | heydari | gpt` to material records. Add another
source centrally through `sourceIds` and `sourceLabels`; the derived schemas then accept it.
Do not add arbitrary misspelled keys. Omit a source that is absent. `{}` is valid for a
draft awaiting material. `gpt: {}` declares generated content without inventing a recording.

Each material record accepts:

- `recordings` (optional, default `[]`): each requires unique `id`, `location`, and
  `kind: video | audio`; optional positive integer `durationSeconds`.
- `repository` (optional): see snapshot contract below.
- `references` (optional, default `[]`): nonempty URLs or project-relative paths to
  transcripts, supplied notes or primary technical references.

A human source entry must identify at least one artifact. Counts and availability are
derived from this map; do not store redundant `available` flags or recording counts.
Paths resolve relative to this site project (e.g. `../records/...`), never a machine-specific
absolute path. These are source locators, not instructions to fetch or publish assets.
Explicitly fictional `demo:` locators are reserved for pages with `demo: true`; the schema
rejects them in real documentation. Demo UI labels every simulated source accordingly.

`provenanceSchema` defines a block's `source`, optional `recording` ID and optional
`timestamp`; a timestamp needs its recording ID. Apply attribution to meaningful blocks.
`blocks.ts` extends this contract with page-unique `id`, optional short `summary`, and
`context` (space-separated block IDs). Every referenced context needs a standalone
summary of at most 400 characters. Missing references, duplicate IDs, cycles and nested
source blocks fail MDX validation. A TechnicalCorrection has a `corrects` target and
fixed GPT source. CodeExample checks language, payload, filename and attribution;
Teacher Code additionally requires a repository pin and repository-relative path.

The CLI parses static MDX attribution (including directly imported component aliases)
and validates recordings/durations against the enclosing source map. Attribution props
must be literal strings; spreads and executable expressions are rejected. Code payload
expressions are allowed and checked as strings during Astro rendering. This is a
structural/editorial contract, not a sandbox for executing untrusted MDX.

## Timeline and repository history

Session `timeline` is an ordered array, preserving the actual class flow, including
returns to earlier topics. Each item requires `topic`, `source`; optionally `recording`,
`start`, `end`, `approximate` (default false). Timestamps use `MM:SS` or `HH:MM:SS` within
the identified recording. Any timestamp requires a recording. End must follow start;
known recording duration bounds timestamps. Source/recording references must exist.
Without reliable timings omit times and preserve array order. Approximation needs `start`.
Do not derive the pedagogical body order from this array.

`SessionTimeline` now reads `kb.timeline` directly. Phase 2's disconnected design fixtures
were replaced by an explicitly demo inventory, so the example exercises the same
reference validation as real content. Never reuse these fictional recordings/timings
as real source metadata. Timeline stays visible while the learning body is filtered.

A repository reference requires `location` and at least one immutable pin:
full 40/64-character `commit` or `snapshotPath` to a preserved directory/archive.
`branch` and `capturedAt` are optional context; a moving branch alone is insufficient.
Never fabricate a commit or call a mutable checkout a snapshot. Omit the repository if
its historical state cannot be established and record the gap. Hashes stay out of prominent UI.

## Relationships and changelog

Sessions own `concepts: [{ id, relation, anchor? }]`. Optional `anchor` is a stable local
heading or source-block ID (no `#`); validation checks it exists in that session. Relation is
`introduced | expanded | reviewed | used-in-code | mentioned` (one dominant relation per
concept per session). ConceptAppearances derives its list from these edges, not
stored again in concepts. `relatedSessions` holds session IDs; Thursday stays independent.
`prerequisiteSessions` identifies required earlier sessions, distinct from merely related
sessions. Related links are displayed in both directions by the shared graph helper; author one
edge for a shared relationship, not two duplicate lists. Concept related links use
`relatedConcepts` with the same discovery rule. Native unpublished drafts are excluded. Prerequisites cannot contain cycles. Duplicate, missing,
self, wrong-kind, real-to-demo and published-to-native-draft references fail validation.

`changes` contains `{ date, type, summary }`. Type is
`initial | source-added | correction | content-update | concept-update`. Summaries are
short, reader-facing Persian descriptions of meaningful changes, not file-write logs.
The home page shows one latest change per document; ChangeLog renders full history
newest-first. For equal dates, later array entries display first. The array is not a substitute for
`agent/logs/`, which records maintenance work at project level.

Use the existing demo MDX files as minimal structural templates. Replace demo claims and
inventories only when actual sources are provided; never copy fictional sources into a real lesson.

## Stable heading and discovery contract

Write all MDX Markdown headings with an explicit suffix, e.g. `## تعریف Bean [#overview]`.
The suffix is removed during compilation; native TOC and Pagefind receive `overview`.
IDs are lowercase kebab-case, unique across headings and literal component IDs, and
independent of translated title text. Keep them stable after publication. `_top` is reserved.

A canonical concept consolidates source-backed insights rather than copying sessions.
Use relevant overview/why/how/Spring usage/example/pitfalls sections, followed by derived
appearances. Sections are optional, but a concept must teach something. Repeated session
coverage summarizes its new angle and links the canonical explanation.

Discovery components resolve IDs at build time, not through hardcoded UI maps. The
concept explorer searches actual titles/descriptions, not a Persian–English synonym map.
Global search indexes rendered prose, code and headings plus readable title/type metadata.
Never place raw repository locators or implementation IDs in search title metadata.
