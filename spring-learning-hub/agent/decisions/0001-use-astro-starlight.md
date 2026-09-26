# 0001 — Astro and Starlight static foundation

**Status:** Accepted, 2026-09-26.

**Context:** A private Persian documentation site needs native MDX, local assets,
maintainable navigation and future local search, without backend infrastructure.

**Decision:** Use Astro 7.3.5, Starlight 0.42.4 and static output. Use the current
Content Layer loader API, Persian root locale, and bundled MDX integration. Pagefind
stays disabled until Phase 4. No additional frontend framework or server adapter.

**Reason:** This follows framework conventions and supplies the documentation shell
without duplicating it. Official npm metadata checked before installation reports
Starlight peers `astro ^7.2.10`, `@astrojs/markdown-remark ^7.3.0`; selected 7.3.5/7.3.1
satisfy them. TypeScript 6.0.3 is the newest compatible stable major accepted by
`@astrojs/check 0.9.10` (`^5 || ^6`) and `typescript-eslint 8.70.1` (`<6.1`), so 7 is excluded.
Node 24 LTS satisfies Astro and supports native TypeScript maintenance scripts.

**Consequences:** Build once, serve local static files; registry access is needed for
installation only. Keep a lockfile, upgrade the compatible group deliberately, and
verify checks. Standard Starlight UI is sufficient for Phase 1; design comes later.

**References:** [Astro installation](https://docs.astro.build/en/install-and-setup/),
[Starlight frontmatter extension](https://starlight.astro.build/reference/frontmatter/#customize-frontmatter-schema),
[Starlight i18n](https://starlight.astro.build/guides/i18n/),
[official Starlight package metadata](https://registry.npmjs.org/@astrojs/starlight/0.42.4).
