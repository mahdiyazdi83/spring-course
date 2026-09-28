# Design system

The user explicitly requested a richer appearance in Phase 4 and selected **an educational
dashboard with more cards and visual grouping**. This supersedes Phase 2's restriction on
cards, larger radii and a prominent introductory panel. Keep Persian readability, pale
blue identity and native documentation navigation.

## Visual direction

The home page is a wide study dashboard: a pale-blue introductory panel, a simple linked
learning map drawn with HTML/SVG, content-derived counts, three study-path cards, latest
session and recent changes. Never invent user progress, completion percentages or activity.
Sample content stays visibly marked. Section indexes use cards; the concepts index includes
a lightweight text filter. Articles use a narrower reading column with an information
panel, concept chips, grouped source controls and a related-reading panel.

Cards have a purpose: a study destination, a content summary, a source control or a
relationship. Keep long explanations as prose rather than boxing every paragraph.

## Tokens and assets

All palette/surface variables live in `src/styles/theme.css`, including the Phase 4
dashboard token block. `documentation.css` styles provenance behavior;
`dashboard.css` owns the richer presentation and consumes those variables.
Do not scatter literal palette colors in Astro components.

- Pale blue accent remains `#b1cee3`.
- Light background/card/heading/link: `#f3f6fa` / `#fff` / `#20384e` / `#3b6484`.
- Dark dashboard/card/heading/link: `#121a24` / `#1c2632` / `#f0f3f6` / `#b1cee3`.
- Hero surface: light `#deebf5`, dark `#223d52`.
- Teal and violet accents distinguish review/concepts; text labels always carry meaning.
- Cards use roughly 12–16px radii, a 1px border and a subtle shadow; hero radius is 20px.
- Shared spacing remains 4, 8, 12, 16, 24, 32 and 48px.

Vazirmatn Variable is bundled locally from Fontsource. Preserve its OFL license in
`public/licenses/`. No CDN font or runtime image service. HubIcon is a small repository-native
SVG set, not an icon-font dependency. Code uses Consolas/Liberation Mono.
Native sidebar links use local SVG masks under `public/icons/`, with distinct home,
class, practice and concept symbols. Labels remain visible; icons are decorative.
Session metadata and dashboard actions use the matching HubIcon stroke style.

## Reading and RTL

Persian root `lang="fa" dir="rtl"` remains native. Use logical CSS properties. Navigation
is on the right, article TOC on the left. Body is 17px desktop/16px mobile with line-height 2.
Sidebar links keep an RTL, right-aligned container even for English-only labels;
only their text spans derive bidi direction from the label. Do not apply plaintext bidi
to the whole navigation link, which can move English entries to the left.
Article width stays capped at 46rem; indexes/dashboard can grow to 72rem.
Dashboard headings may be larger/heavier; ordinary article headings stay compact.

Code is LTR, isolated and locally scrollable. Use Markdown code or `bdi` for technical
identifiers. Content authors should not insert manual directional control characters.
The generated Pagefind plain-text title uses programmatic isolates for technical runs;
native search fields/result links use plaintext bidi behavior. Dates display in Persian
from ISO metadata. Preserve semantic tables and ScrollableTable for wide content.

## Native boundaries

Override only SiteTitle, PageTitle and Footer. PageTitle retains native `_top` H1 and adds
readable metadata plus SessionConcepts. KnowledgeFooter derives related destinations and
wraps native Footer. Keep sidebar, mobile menu, TOC, theme selector, search dialog,
keyboard shortcut and routing in Starlight.

All MDX headings use explicit `[#stable-id]` suffixes. Native TOC/search then share stable
anchors. Source filtering still preserves context/corrections and hides empty groups with
their desktop/mobile TOC links. Opening a filtered-out anchor restores sources.

Pagefind UI is styled with tokens, compact filters and result cards. Type and session
number appear in result titles. UI-only metadata must not pollute excerpts.
ConceptExplorer uses SSR cards plus one local text input; no user state or client framework.
It opens with a first-visit guide and real course concepts; a separate opt-in checkbox
reveals template demos. Demo concepts stay out of the native sidebar but retain their routes.
Desktop header columns are symmetric around search. Navigation group labels use weight 800.
Short entry and hover animations run only with `prefers-reduced-motion: no-preference`.

## Responsive behavior and accessibility

- Native Starlight shell: three columns at 1152px+, sidebar/article at 800px+, mobile below.
- Dashboard reduces its three path cards to stacked cards at compact widths; the decorative
  linked map hides when it would crowd the copy. Counts stay concise.
- Concept cards use three/two/one columns; article text never stretches to dashboard width.
- At 320px the header, source controls, search and technical content must remain usable.
- Keep visible keyboard focus, native labels/checkboxes, live filter counts and reduced motion.
- Theme state belongs to Starlight; reset temporary test preferences after browser QA.
- Without JavaScript all lessons and cards remain readable; enhancement controls are disabled.
- Never hide overflow at the document level to conceal a broken layout; constrain the component.

## Verification

Run `npm run check` and inspect the built preview, because Pagefind is production-only.
Verify light/dark home and article layouts, 320/390px mobile and desktop widths, concept
filter clear/no-results, native search clear/Escape/focus return, type filtering and actual
heading navigation. Recheck source filtering when heading or grouping changes.
Do not claim a full accessibility audit from these targeted checks.
