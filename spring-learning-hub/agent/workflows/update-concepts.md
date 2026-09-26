# Update canonical concepts

**Input:** changed session, new source-backed insight and affected stable concept IDs.

**Order:** read only those concept pages → consolidate new insight without copying whole
session sections → retain useful prior attribution → update prerequisites/related concepts
only when educationally meaningful → ensure the originating session owns its occurrence edge.

**Output:** `src/content/docs/concepts/<id>.mdx` updates, and session `concepts` metadata.
A new concept page must contain an explanation when real content is authorized, not only
an index. Do not generate empty pages solely to make a broken reference pass.

**Metadata:** stable `id`, sources for explanations, status, `updatedAt`, `changes`,
prerequisites and related concepts. Existing occurrences remain in session metadata;
never duplicate a separate occurrence list in the concept frontmatter.

**Validate:** no prerequisite cycles, missing targets, self-links or real-to-demo links;
run `npm run check`. Use SourceBlock for explanations, and ConceptAppearances beneath
the “ارتباط با جلسه‌ها” heading to derive occurrences automatically. Do not maintain a
second manual occurrence list. ChangeLog renders the concept's meaningful updates.

**Phase 4 incremental steps:**

1. Reuse the canonical concept's stable ID; add a real explanation only for a meaningful new concept.
2. Summarize the new session insight in the concept without duplicating the session body.
3. Add/update the originating session's `concepts` edge with its dominant relation and
   optional `anchor` pointing to the relevant local heading/block. Do not edit a reverse list.
4. Add meaningful `relatedConcepts` or `relatedSessions` links; reverse discovery is derived.
5. Preserve explicit `[#stable-id]` heading suffixes when rewriting Persian titles.
6. Update only affected `updatedAt`/`changes` and the relevant operational log.
7. Run `npm run check`, then verify the changed topic in production preview search and
   click its section result. The normal build regenerates Pagefind; never edit its output.

SessionConcepts and KnowledgeFooter are automatic. ConceptAppearances remains beneath
an explicit occurrences heading. ConceptExplorer automatically lists/filter-enables all
published concept pages. Do not add a second relationship store or a client search service.
