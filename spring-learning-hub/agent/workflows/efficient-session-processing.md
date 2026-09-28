# Efficient session processing

Use this workflow for each newly authorized session. It reduces repeated reads and
tool output; it does not relax the documentation rules or guarantee a quota saving.
No new service, model download or API key is required.

## Prepare one recording at a time

Reuse the existing local ASR environment and completed outputs. Do not retranscribe
unchanged recordings. From the site directory, using Python 3.10 or newer:

```sh
python scripts/prepare-session.py ../records/transcripts/session3/teacher-1 .cache/session-packets/session3/teacher-1
```

Replace the session and recording paths with the authorized source. This example
uses existing session-3 evidence solely to illustrate the command. The input must
be one completed output directory from `transcribe-recording.py`, containing its
manifest and chunk JSONL files. Legacy single-file transcripts and refined excerpts
are not implicitly merged; inspect those separately and record which evidence wins.

The command prints only counts and an index path. The fingerprinted output contains
`INDEX.md`, `index.json` and packets capped at 12,000 characters by default. This is
a character limit, not an exact token count, particularly for Persian. Change it
with `--max-chars 8000`. Packets preserve all text, repetitions, approximate times
and source file/line references. Long segments may span packets with the same reference.
No summary, speaker classification or confidence judgment is generated.

The fingerprint changes when the input bytes, path, manifest or packet size changes.
An identical rerun recreates the same generated files without overwriting separate
notes. Keep all output under ignored `.cache/` or private `../records/`, never public assets.

## Read once, retain coverage

1. Read the index, then each packet once in order. Do not dump all packets into one
   tool result. Search alone cannot establish complete recording coverage.
2. Keep a short private `coverage.md` alongside the packets: packet filename,
   reviewed status, topic headings, approximate time ranges, source references and
   unresolved terms. Mark reviewed only after actually reading that packet.
3. Use these notes to plan the lesson and re-open only uncertain evidence. For example:

   ```sh
   rg -n -i -C 2 'Bean|بین' .cache/session-packets/session3/teacher-1 -g 'packet-*.txt'
   ```

4. Compare technical claims with the relevant pinned code. Re-transcribe only
   ambiguous ranges where needed. Keep Thursday and speaker attribution independent.
5. Write a concise handoff with source paths/fingerprints, coverage, affected pages
   and remaining questions. A fresh chat can start from that handoff and the agent
   entry point without replaying previous sessions. Never claim review from packet existence.

For routine formatting or established MDX patterns, prefer a lighter available model
and low/medium reasoning when the user selects it. Reserve deeper reasoning for
technical ambiguity and difficult fixes. These scripts do not change Codex's model,
reasoning settings or usage limits, and do not launch additional agents.

## Verify with bounded output

Use `npm run check:quiet` for the same complete pipeline as `npm run check`. Full
stdout/stderr stays in `.cache/checks/`; success prints a short result, failure prints
the final 50 lines and returns a nonzero exit code. Inspect the saved log for earlier
errors or warnings as needed. Do not treat concise output as reduced test coverage.

Use targeted checks while editing and one full check on the final state. Repeat
checks after fixes as needed; do not repeat successful checks on unchanged code.
For browser QA, inspect the affected component or a screenshot; avoid full-page
accessibility dumps of long lessons. Keep the required source-filter coverage.

Packet utility regression tests: `npm run test:packets` (requires Python).
