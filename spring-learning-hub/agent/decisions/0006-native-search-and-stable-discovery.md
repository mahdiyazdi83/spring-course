# ADR 0006 — Native search and author-owned stable section links

- Status: accepted
- Date: 2026-09-26
- Scope: Phase 4, explicitly authorized by the user

## Decision

Enable Starlight's bundled Pagefind integration and restore its native Search. Add only
rendered title/type metadata, Persian i18n and styles. Search titles identify concept or
session day/number; native sub-results link to headings. No fork, database or remote service.

Use explicit MDX heading markers `[#stable-id]`, stripped by a small remark plugin before
Astro collects headings. MDX braces conflict with common `{#id}` conventions; this literal
suffix is simple to parse and audit without executing MDX. The existing unified package
is configured through Astro's current processor API. IDs remain stable across translation.

Extend a session-owned concept edge with optional local `anchor`. Derive appearances,
related concepts and bidirectional cross-session discovery at build time. Keep ordinary
arrays and typed helpers; no knowledge-graph database or runtime graph store is needed.

## Alternatives and consequences

A custom search modal duplicates keyboard/accessibility behavior and would need ongoing
maintenance. Native Pagefind covers local indexing, type filters and heading sub-results.
DOM metadata is sufficient; custom result rendering and synonym maps are deferred.

Translated auto-slugs are convenient but change when headings are rewritten. Explicit
anchors add one small authoring requirement. Validation now checks headings and occurrence
targets; a post-build audit verifies real emitted links and IDs. Earlier demo fragments
were migrated before publication. Future changes must preserve established IDs.

Pagefind requires production build assets served over HTTP. There is no service worker,
guaranteed remote-host offline cache, or `file://` support. Local serving needs no internet.

User direction also supersedes Phase 2's restrained home layout: an educational dashboard
with more cards and visual grouping is implemented while native navigation and readable
article widths remain. This is a presentation change, not a new application architecture.

## References

- [Starlight configuration](https://starlight.astro.build/reference/configuration/)
- [Pagefind metadata](https://pagefind.app/docs/metadata/)
- [Pagefind UI options](https://pagefind.app/docs/ui/)
