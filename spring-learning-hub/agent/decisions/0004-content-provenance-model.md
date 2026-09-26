# 0004 — Source inventory and block provenance

**Status:** Accepted, 2026-09-26.

**Context:** Teacher explanations, Heydari follow-up and generated clarification have
different origins. Source recording order differs from the best learning sequence.

**Decision:** A central source registry types per-document inventories, timeline items
and the future block provenance contract. Source presence/counts are derived. Use stable
recording IDs, optional efficient timestamps, and a commit or immutable repository snapshot.
Keep Heydari in the target Tuesday unit and Thursday in its own unit.

**Reason:** Block attribution avoids visual noise while preserving trust. Historical
repository pins prevent later code from silently rewriting an earlier session's context.

**Consequences:** New sources require an explicit registry addition, not a schema redesign.
Unknown provenance and missing historical state must be recorded honestly. Phase 3 must
implement components and context-preserving filters; Phase 1 only defines their data contract.
