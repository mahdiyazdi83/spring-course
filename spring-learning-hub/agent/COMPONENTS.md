# Documentation component vocabulary

Components read the current document from Starlight route data. Import them directly
from `src/components/` using the correct relative path. Full examples live in the demo
Tuesday/Thursday/concept pages. The simulated people, recordings and code are not real
course sources. Process real input only when authorized.

## Attribution and context

```mdx
<SourceBlock id="teacher-di" source="teacher" recording="teacher-01" timestamp="12:40"
  summary="The service receives its message sender through the constructor.">

A meaningful explanation, in Persian, with ordinary Markdown.

</SourceBlock>

<SourceBlock id="heydari-test" source="heydari" recording="heydari-01" context="teacher-di">

The follow-up explaining how this dependency can be replaced in a test.

</SourceBlock>
```

IDs are stable within the page and must not collide with headings. `source` is one of
teacher/heydari/gpt. Recording IDs belong to that source's `kb.sources` inventory;
timestamps are optional and must fit the known recording duration. Omit unavailable
recordings/timestamps instead of guessing. Source labels show the recording's position
in its source inventory; do not reorder old recordings when adding new ones.

`context` is a space-separated list of block IDs. Each target needs a standalone plain
text `summary` (maximum 400 characters), written as a faithful editorial paraphrase.
Heydari-only mode replaces excluded teacher bodies with just those summaries. Context
does not recursively expand other contexts; summaries must make sense by themselves.
Duplicate/missing IDs, unsupported sources, cycles, missing summaries and nested source
blocks fail validation. Keep related explanations as adjacent attributed blocks.

Attribution and presentation props are literal strings, not JavaScript expressions or
spreads. The parser recognizes direct component imports, including aliases. The `code`
payload may use an expression/raw import because Astro validates its resolved value.
Arbitrary MDX-generated wrappers or dynamically generated source blocks are outside this
authoring contract. MDX is trusted repository code, not user-supplied executable input.

## GPT and meaningful correction

```mdx
<GptNote id="gpt-di" context="teacher-di">

A short practical clarification for a real junior-reader gap.

</GptNote>

<TechnicalCorrection id="scope-correction" corrects="teacher-scope"
  statement="The inaccurate classroom statement, accurately represented."
  correction="The correct behavior for the actual library version."
  reason="Why this difference matters in practice.">

[Supporting primary reference](https://docs.spring.io/)

</TechnicalCorrection>
```

Both have fixed GPT attribution. GptNote renders **یک کلام از GPT**. Use it selectively;
do not repeat an already-good explanation. Correction is neutral, not accusatory. Its
`corrects` target must be an existing teacher/Heydari block. It stays visible with a
selected original even if GPT is off, labeled as a necessary correction. Do not correct
harmless simplifications or explicitly historical approaches with this component.

## SourceFilter and headings

Place one `<SourceFilter />` on a Tuesday page before the structured learning body.
Timeline, prerequisites, metadata and history remain outside filtering. Put each
teaching heading and its attributed blocks inside `<section data-source-group>`.
This lets empty headings and their TOC links disappear with the filtered body.

All sources start enabled. Missing source bodies produce disabled labeled choices.
All eight combinations are valid, including none (an explicit empty-state message).
`نمایش همه` restores the page. Filter state is local to the current page and not saved.
Anchors into hidden content restore all sources so their targets remain readable.
Without JavaScript all text remains visible. Do not force this filter onto Thursdays.

## CodeExample and repository references

```mdx
import teacherCode from './verified-snippet.java?raw';

<CodeExample
  id="teacher-code"
  source="teacher"
  lang="java"
  filename="UserService.java"
  repositoryPath="src/main/java/example/UserService.java"
  code={teacherCode}
  mark="3-5,9"
  caption="A short explanation of the relevant lines."
/>

<CodeExample
  id="gpt-code"
  source="gpt"
  lang="java"
  filename="Example.java"
  code="class Example {}"
  caption="Generated example, not a repository extract."
/>
```

CodeExample is itself an attributed block; do not nest it inside SourceBlock. It displays
**Teacher Code** or **GPT Example** independently from the filename. Teacher Code requires
`sources.teacher.repository` with an immutable pin and `repositoryPath`; the author must
verify the snippet against that snapshot. A declared pin alone cannot prove correctness.
Repository paths are plain LTR text, not a file browser or automatic filesystem links.
Generated examples must never be relabeled as teacher code. For actual Heydari code, use
an attributed Heydari SourceBlock with a fenced snippet and explicit Heydari label; do not
misuse Teacher Code (CodeExample's code origins are deliberately teacher/gpt).

Supported languages: java, xml, yaml, properties, sql, bash, json. `mark` highlights line
numbers/ranges. Caption is optional. Starlight's native Code/Expressive Code handles
highlighting, frames and copy; direction stays LTR and long lines scroll locally.
See [Starlight Code](https://starlight.astro.build/components/code/) and
[Expressive Code props](https://expressive-code.com/key-features/code-component/).

## Metadata-driven components

| Component            | Data and behavior                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `SessionMeta`        | Receives `document`; compact number, status, updated date, derived source availability. PageTitle uses it automatically.                   |
| `DocumentStatus`     | Receives `status`; supports draft/in-progress/complete/needs-follow-up with a text label.                                                  |
| `PrerequisiteList`   | Resolves `kb.prerequisites` concepts and session-only `kb.prerequisiteSessions`; no copied arrays.                                         |
| `SessionTimeline`    | Reads `kb.timeline`; ordered topics with optional start/end/approximate timing and source/recording captions. No automatic playback links. |
| `ChangeLog`          | Reads `kb.changes`, newest date first; later array entry wins equal dates.                                                                 |
| `ConceptAppearances` | Concept pages only; derives session links and relationship labels from session-owned concept edges.                                        |

Use Markdown headings before these components so the native TOC remains correct.
No timestamps are required. A timeline keeps source presentation order and is distinct
from the structured learning path. Add a brief transition explaining that difference.

## Lightweight conventions

For supplementation use **موضوعی که خوب است گفته شود** and one GPT SourceBlock per
item, normally 2–3 short paragraphs. For repeated topics, use an attributed short recap:
link the canonical concept and prior session, then describe this session's addition.
These prose patterns need no extra components. ReadingNote and ScrollableTable remain
available inside attributed explanations. Keep code/file-tree snippets small and relevant.

## Phase 4 discovery and heading conventions

- `SessionConcepts` is inserted by PageTitle; do not manually duplicate session concept tags.
- `KnowledgeFooter` wraps native Footer and derives related sessions/concepts plus an index
  return link. One metadata edge gives navigation in both directions.
- `ConceptAppearances` shows relation labels, session type/number and optional section links.
  The session owns the edge; concept MDX includes only the component, never a copied list.
- `ConceptExplorer` belongs to the concepts index. It renders every card on the server and
  enhances a disabled search input on load; without JS the full list remains usable.
- All authored Markdown headings require `[#stable-id]` suffixes. Do not use raw h2/h3
  HTML to bypass the native TOC. A stable anchor can also target a literal SourceBlock ID.
- Search is the native Starlight component; customize tokens, i18n and Pagefind DOM metadata,
  not a copied Search implementation. Ignore UI-only content in the index.
