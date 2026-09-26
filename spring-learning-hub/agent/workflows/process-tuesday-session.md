# Process a Tuesday session

**Input:** explicit session number, teacher recordings/notes, session repository pin if
provided, optional matching Heydari follow-up. Do not assume missing sources exist.

**Order:** identify `tuesday-NN` → inspect new sources and relevant repository files →
record inventory and actual timeline → organize prerequisites and learning body →
update only affected canonical concepts → record meaningful changes.

**Output:** one `src/content/docs/tuesday/session-NN.mdx`; any related concept updates.
Heydari remains inside this unit. Never create another session for the follow-up.

**Metadata:** stable `id`/`sessionNumber`, status, dates, sources, timeline, prerequisites,
session-owned concept relationships, related sessions and changelog. Set `demo: false`
only when demo material is replaced by verified real documentation. Infer the title
from dominant topics; do not rename the route when the title improves.

**Validate:** source attribution, historical repository pin, references and changelog;
run `npm run check`. Record source coverage and gaps in one concise agent log entry.

**MDX pattern:** import the components listed in `../COMPONENTS.md`. Use one SourceFilter
after the timeline and before the learning body. Inside a `<section data-source-group>`,
place the Markdown heading and adjacent SourceBlock/GptNote/CodeExample blocks. Teacher
blocks use `source="teacher"`; add `recording="<actual-id>"` for recorded material,
and omit it for notes-only material. Timestamps are optional. Heydari
blocks use their own source/recording and `context="<teacher-block-id>"` only when needed.
Provide a short standalone `summary` on that teacher block. Never nest source blocks.

Use PrerequisiteList (concepts plus optional `prerequisiteSessions`), SessionTimeline and
ChangeLog without repeating their arrays in MDX. Teacher Code needs a verified historical
repository pin, `repositoryPath`, and a matching snippet. Generated code is `source="gpt"`.
Use TechnicalCorrection only for meaningful errors and link it to the original block.
The example Tuesday page uses simulated roles; copy its structure, never its fake sources.

Dry run: Tuesday 07 becomes `tuesday/session-07.mdx`, `kb.id: tuesday-07`,
`sessionNumber: 7`. Confirm which supplied files belong to 07; do not ingest 01–06.
Missing Heydari/GPT material stays absent; no repository means no Teacher Code claim.
Apply the demo-transition rules in `../PROCESSING-CHECKLIST.md` to referenced concepts.
