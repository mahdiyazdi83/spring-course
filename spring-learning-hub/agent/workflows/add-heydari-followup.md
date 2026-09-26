# Add a Heydari follow-up

**Input:** explicit target `tuesday-NN` and new follow-up recording/transcript/notes.
If the target is ambiguous, establish the mapping before modifying content.

**Order:** read target Tuesday page → inspect only the new material → add or extend
`sources.heydari` → integrate attributable explanations next to the relevant concepts →
update affected canonical concepts only where the follow-up adds useful understanding.
Keep teacher material separately attributable; preserve necessary surrounding context.

**Output:** updated existing Tuesday MDX and relevant concept pages, no new session.

**Metadata:** append source artifact IDs without renumbering old recordings; update
`updatedAt`, appropriate status, `changes` with `source-added`, and concept relationships
if coverage changes. Do not alter the original teacher timeline to fabricate a continuous
class; label separate recording/source entries explicitly if timeline additions are useful.

**Validate:** original session identity, retained teacher provenance, links and build via
`npm run check`. Log one follow-up work unit.

Use adjacent `<SourceBlock id="heydari-..." source="heydari" recording="..." context="teacher-...">`
blocks. `context` is optional and references existing block IDs; add a short standalone
`summary` to the referenced block if absent. Never copy the whole teacher explanation
into the Heydari block. Keep recording IDs stable and append new recordings. If a source
adds nothing to a section, do not create an empty block to make a filter option appear.

Test Heydari-only and teacher+Heydari modes: summaries should supply just the missing
background, not expose the complete deselected material. GptNote is only for remaining
junior-reader gaps. Record the new artifact under `sources.heydari`, then append a
`source-added` change and update `updatedAt`; ChangeLog renders it automatically.

Dry run: a follow-up for Tuesday 05 updates `tuesday/session-05.mdx` with the same
`tuesday-05` identity. Read only that page, the new follow-up and directly affected
concepts. If the base page is missing, report the gap and establish the source mapping;
do not invent the original teacher session or attach the follow-up to demo session 01.
