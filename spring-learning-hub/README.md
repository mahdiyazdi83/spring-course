# Spring Learning Hub

A Persian, right-to-left Spring learning hub built with **Astro, Starlight, TypeScript and MDX**.

Explore Tuesday classes, independent Thursday sessions and a linked concept reference through an educational dashboard. Teacher, Heydari and GPT explanations retain separate attribution.

> **Content status:** All five template phases are complete. Tuesday sessions 2–5 and independent Thursday sessions 2–3 are documented, with recording timelines and twelve real concept references. Session 5 covers mixed configuration, optional dependencies, custom scanning, properties, Bean lifecycle and collections. Both session-5 videos were reviewed against a same-day teacher-code snapshot; no session-5 Heydari or Thursday recording was supplied. Code caveats and technical corrections are documented alongside the lessons. The per-session logs under `agent/logs/` record verification and source limits. Simulated session-1 lessons remain unpublished; other demo material is explicitly labeled.

## Features

- Educational dashboard, prerequisites, recording timelines and change history
- Source filters that preserve necessary context summaries and corrections
- Local Persian/English Pagefind search with direct section links
- Concept-to-session relationships and related reading
- Light/dark themes, local Vazirmatn fonts and right-aligned navigation, including English labels
- LTR code blocks with highlighting, copying and independent horizontal scrolling
- Static output with no database or external search service

## Requirements

- **Node.js 24 LTS:** at least `24.16.0`, below `25`. The tested version is recorded in `spring-learning-hub/.node-version`.
- npm, included with Node.js
- Git to clone the repository

Check your installation:

```sh
node --version
npm --version
git --version
```

## Quick start

```sh
git clone https://github.com/mahdiyazdi83/spring-course.git
cd spring-course/spring-learning-hub
npm ci
npm run dev
```

Open the URL printed in the terminal, normally [http://localhost:4321/](http://localhost:4321/).
Development mode refreshes the page when files change.

**Run every npm command below from the `spring-learning-hub` directory.**
The initial dependency installation requires internet access.

## Build and preview with search

Pagefind requires a built search index. Use build + preview to test search:

```sh
npm run build
npm run preview
```

Open the preview URL printed in the terminal. Use the search button or `Ctrl+K` / `Cmd+K`.
After editing content, rebuild to update both pages and the search index.

Stop a foreground server with `Ctrl+C`. If Astro reports an existing preview server, stop it explicitly:

```sh
npx astro preview stop
```

This is also useful when restarting preview with a different host or port.

## Share the site on your local network (LAN)

Run the built site on the host computer so other computers or phones on the same network can open it.
Client devices only need a browser; they do not need Node.js or a copy of the repository.

### 1. Build and start the network preview

```sh
npm run build
npx astro preview stop
npm run preview -- --host 0.0.0.0 --port 4321
```

The stop command is needed only if another preview instance is already running.
Binding to `0.0.0.0` makes the server listen on the host's IPv4 network interfaces,
instead of accepting only localhost connections. This is a command-line setting;
no change to `astro.config.mjs` is required.

Keep the host computer awake and the server process running while others use the site.
This preview is suitable for temporary LAN sharing; it is not configured as an always-on service.

### 2. Find the host's LAN address

On Windows, run:

```powershell
ipconfig
```

Find the **IPv4 Address** for the active Ethernet or Wi-Fi adapter. Ignore loopback,
disconnected adapters and unrelated VPN/virtual adapters.

Other devices should open:

```text
http://HOST_LAN_IP:4321/
```

For example, if the host address is `192.168.1.50`, open `http://192.168.1.50:4321/`.
Use your own host's address, not the example. The server also prints its network URL.

Do **not** enter `0.0.0.0` in the client browser. On another device,
`localhost` and `127.0.0.1` refer to that device, not the host computer.
DHCP can change the host's IP address after a reconnect or restart; check it again if the old URL stops working.

### 3. Check connectivity and the firewall

- Connect the host and clients to a network that permits communication between devices.
  Guest Wi-Fi or client isolation may block access even when both devices have internet.
- First open the LAN URL on the host, then test it from another device.
- If a Windows client cannot connect, check the port from that client:

```powershell
Test-NetConnection -ComputerName HOST_LAN_IP -Port 4321
```

Replace `HOST_LAN_IP` with the host's actual IPv4 address before running the command.

If the firewall blocks access, an administrator can allow inbound TCP port `4321`,
restricted to the local subnet and the intended network interface/profile.
Do not disable the firewall or configure internet/router port forwarding for LAN access.
**No firewall rule is installed by this project.** Starting the server does not automatically
grant access through Windows Firewall.

### Change the port or use development mode

If another application occupies port 4321, stop the existing preview and select a different port:

```sh
npx astro preview stop
npm run preview -- --host 0.0.0.0 --port 4322
```

Clients must then use `:4322`, and any firewall allowance must match that port.
For live development over the LAN, use:

```sh
npm run dev -- --host 0.0.0.0 --port 4321
```

Use **build + preview** when clients need working Pagefind search.
LAN access does not require configuring `site` or deploying to GitHub Pages.

## Quality checks

| Command                    | Purpose                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| `npm run check`            | Formatting, lint, types, tests, content validation, build and output verification |
| `npm run format`           | Format project files                                                              |
| `npm run lint`             | Run ESLint                                                                        |
| `npm run typecheck`        | Check Astro and TypeScript                                                        |
| `npm test`                 | Test content, relationships, source behavior and asset checks                     |
| `npm run validate:content` | Validate IDs, routes, references and MDX provenance                               |
| `npm run verify:build`     | Check existing dist output; run build first                                       |

Run `npm run check` before publishing code or content changes.

## Repository layout

```text
spring-course/
├── README.md
└── spring-learning-hub/
    ├── src/content/docs/
    │   ├── tuesday/          # Classes and their matching follow-ups
    │   ├── thursday/         # Independent Thursday sessions
    │   └── concepts/         # Canonical concept reference
    ├── src/components/      # Educational and source components
    ├── src/styles/          # Tokens, RTL and dashboard styles
    ├── src/content/schemas/ # Content contracts
    ├── scripts/             # Validation and output audits
    ├── tests/               # Tests and layout stress fixtures
    ├── public/              # Public assets and font license
    └── agent/               # Architecture and maintenance workflows
```

Local `records/` and `teacher-files/` directories are raw inputs and are not published.
Dependencies, generated output, caches and environment files are also excluded from Git.

## Add real course content

For lower-overhead recording processing, use the
[efficient session workflow](agent/workflows/efficient-session-processing.md).
`scripts/prepare-session.py` creates source-preserving reading packets locally using
only Python's standard library (Python 3.10+). No API key or extra package is needed.
Keep generated transcripts and packets private and excluded from Git.

Run `npm run check:quiet` for the complete verification pipeline with compact console
output; full logs are saved under `.cache/checks/`. Failures retain a nonzero exit code.
Run `npm run test:packets` to test the optional Python preparation utility.

Start with the [maintenance guide](agent/README.md) and [processing checklist](agent/PROCESSING-CHECKLIST.md).

- Tuesday lessons live in `src/content/docs/tuesday/session-NN.mdx`; Heydari follow-ups extend the matching page.
- Thursday sessions keep their own identities and routes.
- Keep file IDs and section anchors stable even when titles change.
- Store dates, sources, prerequisites and concept relationships in frontmatter; write the learning body in MDX.
- Do not invent source attribution, recording timestamps or repository revisions. Generated code must be labeled GPT Example.
- Replace simulated material with verified documentation before removing demo markers.

See the [content model](agent/CONTENT-MODEL.md), [MDX components](agent/COMPONENTS.md),
[session workflow](agent/SESSION-WORKFLOW.md), [architecture](agent/ARCHITECTURE.md)
and [design system](agent/DESIGN-SYSTEM.md).

## Static hosting and offline use

For permanent hosting, build and serve **all contents of `dist/`** from a static server.
Include `_astro/`, `pagefind/` and the generated font assets.

Configure directory URLs to resolve to `index.html`, serve `.wasm` files as
`application/wasm`, and optionally use `404.html` for missing pages.

Fonts, CSS, JavaScript and the search index are local. Once installed and built, the site
works over local HTTP without an external runtime service. External documentation links still require internet.
Direct `file://` access and service-worker offline caching are not supported.

Set `site` in `astro.config.mjs` when a permanent deployment URL is known.
Subpath hosting, such as `/spring-course/`, requires a `base` and link review.
The current site targets the host root; pushing to GitHub does not automatically deploy it to GitHub Pages.

## Troubleshooting

- **Node version error:** activate a supported Node 24 version and run `npm ci` again.
- **Search unavailable:** use build + preview and preserve the entire `pagefind/` directory.
- **Stale preview content:** rebuild, then refresh the browser.
- **Another preview is already running:** run `npx astro preview stop` before starting a new instance.
- **LAN URL fails:** verify the IP, server process, port, firewall and network client isolation.
- **PowerShell blocks npm.ps1:** use `npm.cmd` instead of `npm`, or `npx.cmd` instead of `npx`.
- **No sitemap:** expected until a permanent `site` URL is configured.

Two other known build warnings concern the generated MDX `use astro:head-inject` directive
and Starlight's missing custom 404 lookup. Builds succeed and the default 404 page is generated.
These warnings are not suppressed. See the [Phase 5 report](agent/logs/2026-09-26-phase-5.md)
for validation coverage and limitations.

Vazirmatn is distributed under the OFL; see [Vazirmatn-OFL.txt](public/licenses/Vazirmatn-OFL.txt).
