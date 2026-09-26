# 0005 — Explicit context summaries and progressive source filtering

**Status:** Accepted, 2026-09-26.

**Context:** A Heydari-only reading mode can lose the teacher's necessary background.
Blindly hiding paragraphs breaks meaning; retaining all teacher text defeats filtering.
Known incorrect statements must not lose their essential correction either.

**Decision:** Give each source block a page-unique ID. Authors write a short standalone
`summary` only when another block explicitly references it through `context`. Filtering
shows selected blocks in full and only direct referenced summaries from excluded sources.
TechnicalCorrection links to its original via `corrects` and remains alongside a selected
original, with an explicit supporting label, even when GPT is deselected.

**Alternatives:** Automatic context inference is unpredictable; duplicated inline context
drifts; preserving entire ancestor chains is noisy. Standalone summaries avoid needing
recursive preservation at runtime. Static validation rejects cycles and missing summaries.

**Consequences:** A small pure TypeScript model is tested for all eight combinations. A
browser adapter updates hidden groups, native desktop/mobile TOC and a live result count.
All content renders on the server; JavaScript progressively enables the controls. No React,
stored filter preference, content database or alternative Starlight shell is required.

The official MDX parser validates literal attribution and context edges before build;
runtime component schemas validate resolved code strings. Parsing does not execute MDX.
Authors still verify factual attribution and repository snippets; validation cannot prove
a speaker actually said something. Existing schema gains optional `prerequisiteSessions`
to distinguish mandatory earlier sessions from merely related ones, with cycle validation.
