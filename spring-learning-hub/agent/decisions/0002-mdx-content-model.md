# 0002 — One typed MDX collection, stable identities

**Status:** Accepted, 2026-09-26.

**Context:** Sessions, timelines and consolidated concepts must stay connected as titles
and explanations evolve. Independent HTML pages would duplicate structure and behavior.

**Decision:** Extend native Starlight `docsSchema` with a discriminated `kb` object.
Keep title and presentation in native fields; place specialized facts in `kb`. Fixed
file routes and semantic IDs are separate. Infer types from Zod. Session metadata owns
concept occurrences; derive reverse appearances later. Validate graph integrity before build.

**Reason:** A namespace avoids collision with native Astro IDs/frontmatter. One collection
preserves standard routing, sidebar generation and future search. No secondary metadata
database or duplicated hand-maintained TypeScript interfaces are needed.

**Consequences:** Each content page declares its kind. Changing a title is safe; changing
an ID or route requires deliberate migration. YAML inventory/date validation and graph
validation complement native MDX compilation. Display components are later-phase work.
