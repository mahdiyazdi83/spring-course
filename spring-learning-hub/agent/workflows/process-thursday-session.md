# Process a Thursday session

**Input:** explicit Thursday session number and supplied recordings/notes/code.
Identify the actual speaker/source; a weekday does not identify a person.

**Order:** create `thursday-NN` → inspect new source artifacts → preserve topic order →
organize independent learning body → link necessary prior concepts and related Tuesday
material → update only affected concepts and changelog.

**Output:** `src/content/docs/thursday/session-NN.mdx` with its own identity/navigation;
optional affected concept updates. Never merge it into a Tuesday event.

**Metadata:** required session fields, actual source map, timeline, prerequisites,
`concepts` relationships (often `reviewed` or `expanded`), relevant `relatedSessions`,
dates/status and `changes`. Remove demo markers only after replacing demo material.

**Validate:** independent route, truthful provenance, valid targets, build via
`npm run check`. Do not force multiple-source behavior when only one source exists.
Log the event and affected concepts concisely.

Use SourceBlock for the actual speaker, GptNote only when needed, and CodeExample with
truthful code attribution. Render PrerequisiteList, SessionTimeline and ChangeLog from
metadata. Do not add SourceFilter: it is Tuesday-only. Omit timestamps if unsupported.
For a repeated topic, link the concept and prior Tuesday session in a short attributed
recap, then show this event's added exercise/question. Use `prerequisiteSessions` for
required earlier sessions and `relatedSessions` for optional connections.

Dry run: Thursday 04 becomes `thursday/session-04.mdx`, `kb.id: thursday-04`,
`sessionNumber: 4`. Confirm the speaker and supplied file mapping. Do not assume it is
Tuesday 04's continuation. Preserve any verified cross-link without merging events.
