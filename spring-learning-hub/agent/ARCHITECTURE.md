# Architecture

## Stack and rendering

Astro 7.3.5 + Starlight 0.42.4 generate a static Persian site. Starlight supplies routing,
navigation, MDX integration, native RTL and theme state. TypeScript 6.0.3 is
selected because `@astrojs/check` and `typescript-eslint` do not yet accept TypeScript 7.
Dependencies were checked against official npm peer metadata on 2026-09-26; see ADR 0001.

`src/content.config.ts` uses native `docsLoader()` and `docsSchema({ extend })`.
All pages are one `docs` collection under `src/content/docs/`. A `kb.type` discriminant
distinguishes index, Tuesday session, Thursday session, and canonical concept. Starlight
still owns `title`, `description`, sidebar settings and rendering.
The native `i18n` collection holds the small Persian UI-label overrides in
`src/content/i18n/fa.json`; other labels use Starlight's bundled Persian translation.

The content body is readable MDX, not independent HTML documents. YAML contains facts
and references. Phase 2 adds Astro presentation components; Phase 3 adds validated
block provenance and a small progressive-enhancement source filter. No
React, backend, database, CMS, user accounts or external runtime services are added.

## Directory boundaries

- `src/content/docs/{tuesday,thursday,concepts}/`: public, reviewed documentation.
- `src/content/schemas/`: knowledge and block Zod schemas with inferred types.
- `src/utils/`: content integrity and shared presentation helpers.
- `src/components/common/`: site identity and reusable code-native SVG icons.
- `src/components/documentation/`: metadata/status, prerequisites, changelog, concept
  appearances, learning hub, lists, notes, tables and timeline.
- `src/components/source/`: SourceBlock, SourceFilter, GptNote and TechnicalCorrection.
- `src/components/code/`: CodeExample wrapping Starlight's Expressive Code component.
- `src/scripts/`: the browser adapter for the framework-independent filter model.
- `src/styles/theme.css`: centralized tokens, Starlight mappings and responsive styles.
- `src/styles/documentation.css`: behavior component styles using the same design tokens.
- `src/styles/dashboard.css`: dashboard, cards, relationship and native search presentation.
- `src/data/fixtures/`: explicitly generated code and a simulated teacher snapshot.
- `src/data/course/`: verified excerpts of real course code, with immutable repository
  pins and original paths in comments; builds do not depend on ignored raw inputs.
- `scripts/`: development-time validation using the same schemas as Astro.
- `tests/`: Node's built-in test runner; no separate test framework.
- `public/`: local public assets only. Never copy private/raw sources here by default.
- `agent/`: maintenance instructions, decisions, workflows and concise logs.
- `../records/`, `../teacher-files/`: private course inputs, excluded from publication.
  Session-2 transcripts are private derived evidence under `../records/transcripts/`;
  original recordings and the teacher repository are preserved unchanged.

Do not create empty component directories or alternative content stores.

## Content relationships

The session ID (`tuesday-01`) is distinct from Astro's route ID (`tuesday/session-01`).
Routes come from fixed filenames. Titles can evolve without breaking links. Heydari
follow-ups extend the matching Tuesday session; Thursday is always an independent event.
Session `concepts` owns occurrence relationships. Concepts do not duplicate that list.

Schemas check individual records. `npm run validate:content` checks stable paths,
unique IDs, relationship targets and prerequisite cycles (concepts and prior sessions).
It also parses MDX with the official `@mdx-js/mdx` parser, without executing expressions,
to validate literal block attribution, recording references, context summaries/cycles,
correction targets and Teacher Code requirements. `npm run build` runs it before
Astro; Astro additionally validates native frontmatter and compiles every MDX page.
The small CLI reads YAML with an explicit `js-yaml` development dependency; it is not a
second content store. Use Node 24.16+ (below 25), satisfying native TypeScript execution
and the Astro ESLint plugin. The exact verified Node version is in `.node-version`.

## Presentation boundary

Only three Starlight components are overridden in `astro.config.mjs`: `SiteTitle`,
`PageTitle` and `Footer`. PageTitle wraps the native heading to preserve its `_top`
skip-link target, then adds compact metadata derived from `kb`. Sidebar, mobile menu,
table of contents, theme selector and routing stay native. See `DESIGN-SYSTEM.md`.

The home and index components derive lists/counts from the build-time docs collection,
excluding native drafts. Home prefers real content when present; until then, it labels
its examples. It shows one latest change per document (last entry wins equal dates).
Dates are stored as Gregorian ISO strings and displayed using `Intl.DateTimeFormat('fa-IR')`
with UTC, yielding Solar Hijri dates without timezone drift. No client data store exists.

Vazirmatn is bundled locally through `@fontsource-variable/vazirmatn`, with its OFL
license under `public/licenses/`. No remote font URL is used. Variable weights avoid
separate weight files; unicode subsets are requested as needed by the browser.
Astro source files now participate in Prettier and ESLint via their official plugins.

## Documentation behavior

SourceBlock is the attribution/rendering primitive. GptNote, TechnicalCorrection and
CodeExample compose it; nested attribution blocks are rejected. Component rendering
also checks its own props and source/recording inventory. `COMPONENTS.md` is the author API.

The pure filter model maps each block to full, supporting context, necessary correction
or hidden. Context uses direct block IDs with short standalone summaries; it does not
duplicate a teacher paragraph inside every Heydari block. A correction stays with its
selected original statement even when GPT is off. Empty groups and their native desktop/
mobile TOC links hide together. Incoming anchors to hidden material restore all sources.
There is no persisted filter preference; each document starts with all sources enabled.
Without JavaScript all content remains readable and the unavailable controls are disabled.
See ADR 0005 for this durable decision.

Timeline and changelog read validated `kb` directly. Timeline preserves actual order,
source/recording identity and optional timestamps; it does not create fake media links.
ConceptAppearances derives reverse links from published session edges, without new
frontmatter. PrerequisiteList resolves concepts and optional `prerequisiteSessions`.
Full code rendering/copy/highlighting remains Expressive Code; no custom highlighter.

## Hosting and future work

`output: 'static'`, no server adapter. Serve `dist/` at a host's root over local/internal
HTTP. No `site` hostname is invented; deployment-specific canonical URLs can be configured
when a host is selected. Subpath hosting needs an explicit base/link review later.
No required remote asset exists. Initial package installation needs registry access.

Pagefind is enabled with `pagefind: true`. The temporary SearchShell was removed. Starlight's native Search owns its dialog,
keyboard shortcut, focus handling and bundled Pagefind UI; no fork or replacement engine.
Production builds create `dist/pagefind/` from rendered HTML. Search is unavailable in
Astro dev; verify with build + preview. Generated PageTitle metadata supplies a title
prefixed with content type/session number and a native type filter. English runs in
search title metadata are programmatically isolated for RTL display (plain text, no HTML).
UI chrome, hidden context summaries, source-filter controls and changelog are excluded
with `data-pagefind-ignore`; full educational content remains indexed regardless of
runtime filter selection. Persian labels use the native i18n collection.

`remark-stable-headings.mjs` runs in the configured Astro unified processor before
heading collection. Authors write `## عنوان [#stable-id]`; the marker disappears and the
ID feeds native TOC, heading links and Pagefind sub-results. The MDX validator rejects
missing/duplicate IDs and session occurrence anchors that do not exist. Preserve IDs
when retitling sections. Legacy Phase 3 title-derived fragments were replaced in this
prepublication demo; new explicit fragments are the ongoing public contract.

`knowledge-graph.ts` derives concept appearances and bidirectional related links from
typed metadata. A session owns each concept occurrence, optionally targeting a local
heading/source-block anchor. SessionConcepts appears automatically in session headers.
KnowledgeFooter derives related sessions/concepts and a link back to the corresponding
index. The concept index is server-rendered; ConceptExplorer adds a small text filter.
No client graph store, synonym mapping, external search service or database exists.

Real session-2 and session-3 documentation is tracked separately from the template fixtures.
`demo:` recording locators are accepted only for
demo pages, never rendered as media links. The four Phase 4 concept fixtures were replaced
with real, source-backed session-3 concepts on 2026-09-28; their routes and heading anchors
remain stable. Unrelated demos remain explicitly labeled.
No service worker or browser offline cache is promised. Without internet, keep serving
`dist/` over local HTTP; direct `file://` loading is not supported. `verify:build` checks
internal URLs/fragments, duplicate HTML IDs, external runtime assets and the Persian
Pagefind index after build. See ADR 0006.

Phase 5 extends the static audit to CSS imports/URLs, local font/image/media existence,
HTML resource attributes and the exact count of indexable Persian pages. It is a static
resource check, not a general JavaScript network analyzer; client imports were also reviewed.
Published documents cannot reference native unpublished drafts. The reusable manual edge
fixture stays under `tests/fixtures/`, outside production content. See the Phase 5 log.

Local transcription is an optional maintenance tool, not a browser/server feature.
`scripts/transcribe-recording.py` uses a separately installed Python environment and
local model, processes bounded audio chunks, and writes private resumable JSONL evidence.
The npm build does not install or run ASR. See `workflows/local-transcription.md`.
