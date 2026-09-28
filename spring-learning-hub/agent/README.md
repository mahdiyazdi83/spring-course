# Agent entry point

This folder is operational memory for maintaining the Spring knowledge base.
Current scope: the Phase 5 template plus user-authorized documentation of session 2.
Use `PROCESSING-CHECKLIST.md` for each real session and `workflows/local-transcription.md`
for authorized local ASR. The session-2 processing log records completed coverage and source limits;
do not infer completion from the presence of a recording in frontmatter.
The simulated Tuesday/Thursday session-01 pages are native drafts, retained only as
authoring examples. They are excluded from the built site, navigation and search;
published lessons currently start at session 02. Do not republish fake session 01.

## Read only what the task needs

1. Read this file first.
2. For content work: `DOCUMENTATION-RULES.md`, `CONTENT-MODEL.md`, and the relevant
   file under `workflows/`. `SESSION-WORKFLOW.md` provides the common sequence.
3. For framework/schema changes: `ARCHITECTURE.md` and affected ADRs as well.
4. Read the affected session, new source, and directly related concepts only.
5. For layout, typography, components or theme changes: `DESIGN-SYSTEM.md`.
6. For MDX authoring and filtering: `COMPONENTS.md`; preserve the tested component contract.

## Authority and upkeep

- The user's current instructions determine scope and override older plans.
- `src/content/schemas/knowledge.ts` is the executable metadata contract;
  `CONTENT-MODEL.md` explains its semantics. The validator enforces cross-file rules.
- `DOCUMENTATION-RULES.md` governs educational editing; workflows describe actions.
- Accepted ADRs explain architectural constraints. The lockfile records exact packages.
- If code and prose disagree, investigate; fix the cause and update both in the same task.
  Do not quietly rely on a stale description or loosen validation to bypass an error.

Update the relevant document when architecture, fields, source handling, or workflows
change. Add an ADR only for a durable choice with alternatives/consequences. Supersede
an old decision explicitly rather than accumulating contradictory rules.

Ordinary spelling fixes and small lesson edits need no new agent document. Meaningful
session changes need their own `kb.changes` entry. Log work units under `logs/`, not file
writes. Keep logs short; never copy full recordings/transcripts into this folder.

Before finishing: run the applicable checks described in the project README. Report the
actual milestone and limitations; do not claim later-phase features already exist.
