# 0003 — Small repository-local agent memory

**Status:** Accepted, 2026-09-26.

**Context:** Repeated AI-assisted processing should not require the original prompt or
reanalysis of the entire course.

**Decision:** Project `AGENTS.md` points to `agent/README.md`, which routes agents to
small architecture/content/rules documents and task-specific workflows. Use ADRs for
durable decisions and dated logs for meaningful work units.

**Reason:** The reading path is predictable, incremental and reviewable alongside code.

**Consequences:** Update affected operational docs with schema/workflow changes. Do not
store full transcripts, duplicate requirements or create a log entry for every edit.
Phase boundaries remain explicit, so agents do not implement unapproved later milestones.
