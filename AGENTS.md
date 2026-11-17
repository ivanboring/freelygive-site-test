# Project overview

This is a local repository to track and develop the components for devpanelmcp.

This project uses Drupal Canvas for page building. This works by having React
based components (@src/components) that are combined on a page.

The '@src/components/global.css' file contains the global styles for the site.

The site is mobile first and responsive.

# Session settings to resolve

Some project decisions are deliberately left open and recorded here rather than
hard-coded. Each setting lists its options and the **default** used until
someone chooses otherwise.

- `ask each session` is a valid value for any setting — it means "re-ask at the
  start of every session"; leave it as-is, never silently persist a different
  one.
- When the user resolves a setting to a durable value, **persist it by editing
  this file**.
- **Never act more permissively than a setting allows** — in particular, do not
  push local git history, or `push` to the CMS, unless the relevant setting
  explicitly permits it.
- **Pass the resolved values to every subagent you spawn** (include them in the
  brief). Subagents must never re-ask, change, or override them.

Settings:

- **git-tracking** — local git handling of your changes.
  - value: `commit` · default: `commit`
  - options: `none` (never touch git) · `stage` (stage, don't commit) · `commit`
    (commit each self-contained chunk of work on a dedicated branch — local and
    reversible) · `commit-on-default` (commit each chunk directly on the
    default/main branch) · `ask each session`

- **git-remote** — whether local git history is published.
  - value: `UNSET` · default: `none`
  - options: `none` (never push) · `push` (push the working branch to the source
    repo) · `merge-request` (push the branch and open an MR/PR) ·
    `ask each session`

- **source-cli tracking** — which Canvas artifact groups the project syncs
  locally (the `sync` scope in `canvas.config.json`). The trackable groups are
  `components + global CSS` (always tracked together, as one unit), `pages`,
  `regions`, `content-templates`, and `brand-kit`.
  - value: `see canvas.config.json`
  - `canvas.config.json` is the source of truth. A session may still override
    the scope for that session via the CLI `--include-*` flags without editing
    the file.
  - options: any subset of the groups above · `ask each session`

- **source-cli push authorisation** — consent to `npx canvas push` to the live
  CMS (refines, and never loosens, "Deploying to the live site is gated" below).
  - value: `UNSET` · default: `never`
  - options: `never` · `ask per push` (confirm every push) · `ask each session`
    (confirm once at session start, then authorised for that session) ·
    `always allow` (may push without asking)

- **build-approach** — how the UI build relates to its source or design. **Ask
  the user which approach applies before building any UI**, then persist the
  answer (and its sub-choices) here so you don't ask again. Whichever approach
  and fidelity apply, **content and imagery are always preserved exactly** —
  fidelity governs only the visual/behavioural match, never the content.
  - value: `like-for-like` · fidelity: `close-match` · default: `ask` (ask on
    the first UI build, then persist the resolved value)
  - options:
    - `like-for-like` — faithfully rebuild an existing source site.
    - `design-system` — build to a design system rather than copying a source;
      also record the **design-system source** (derived from this site, an
      external source e.g. a Figma file, or an existing component library) and
      the **allowed divergence** (`none` · `theme only` · `custom components` ·
      `core divergence`).
    - `ask each session`
  - **fidelity** (record alongside the approach) — how closely the visual build
    matches its reference (the source site, or the design source):
    `pixel-perfect` (match the reference exactly — styling, spacing, and all
    animations/behaviours) or `close-match` (preserve branding, layout,
    functionality, and exact content/imagery, but not down to the pixel or every
    embellishment).
  - See the `building-ui` skill.

- **component-reuse** — how to choose between existing and new components.
  - value: `prefer reuse`
  - options: `prefer reuse` (use and adapt existing components, keeping
    adaptations **backwards-compatible** so other pages/usages don't break;
    create a new component only when nothing existing fits) · `prefer new`
    (build new components rather than adapt existing ones) · `ask each session`

# Available MCP servers & tools

## Storybook MCP

The storybook MCP server is available to provide links and instructions for the
components in src/components. It is served by the Storybook dev server, so it is
only available while that daemon is running (restart it with `npm run restart`,
or `ddev npm run restart` from the host).

When viewing components, you will need to translate the links: `localhost:6006`
to `https://devpanelmcp.ddev.site:6006` (from the host) or
`http://localhost:6006` (from inside the DDEV web container).

The storybook component pages will include descriptions of controls, as well as
stories, which give example collections of control input.

When evaluating the rendered version of a component, it is important to view the
isolated view mode, so you are only getting the component, not the storybook UI.
This is particularly required to ensure screen size breakpoints are correctly
rendered. This can be translated from the component URL as follows:

- Url with custom control arguments:
  https://devpanelmcp.ddev.site:6006/?path=/docs/components-blockquote--docs&args=text:Test
- Find the variation you want to look at (e.g. "dark") and any args (controls).
- Isolated url:
  https://devpanelmcp.ddev.site:6006/index.html?idcomponents-blockquote--dark&args=text:Test&viewMode=story

## Drupal MCP endpoint (Canvas Tools)

The Drupal CMS variant serves its own MCP endpoint at `<site>/mcp`, so an agent
builds Canvas pages through the site's own Tool API instead of through the
Canvas CLI. It is set up during install; re-run `ddev mcp-setup` after a module
update, or if the install-time setup did not complete (see "Available
Commands").

All three in-container agents are already pointed at it — `ddev mcp-setup`
registers the endpoint in `.mcp.json` (Claude Code), `.codex/config.toml`
(Codex) and `opencode.json` (OpenCode, merged in beside its bash denylist).
These files are project-scoped and committed, which is the only durable place
for them: the `ddev-assistant-*` add-ons mirror the host's agent config into the
container on every start and clear the target first, so anything written to the
container's `~/.claude` or `~/.codex` is gone after the next `ddev start`. For
Codex this works because `.ddev/config.codex.yaml` sets
`CODEX_HOME=/var/www/html/.codex`; the flip side is that `ddev codex` does not
inherit a host login, so authenticate it once with `ddev codex login`.

Registration is not authentication. Each agent still approves the OAuth
connection once, and that is the part DDEV gets in the way of: the agents run in
the container, so their OAuth callback listener binds the _container's_ loopback
on a random port, and the browser on your machine cannot reach it. The redirect
at the end of the flow always fails.

`ddev mcp-login <agent>` works around it. For codex and opencode it starts the
flow, prints the authorization URL, and asks you to paste back the `127.0.0.1`
URL the browser could not open — the code is already in that URL, so delivering
it from inside the container completes the exchange. For claude it hands over to
`claude mcp login --no-browser`, which implements the same paste-back itself.

A server declared in `.mcp.json` is inert until Claude Code both trusts the
workspace and has that server approved, and both flags live in `~/.claude.json`
— `enabledMcpjsonServers` in `.claude/settings.json` does not clear the gate on
its own, which is why the project's own `storybook` server sat at _Pending
approval_. `ddev mcp-setup` seeds the pair (`hasTrustDialogAccepted` plus every
server `.mcp.json` declares), the same trick
`.ddev/commands/web/claude-isolated` uses for the eval harness. A server you
have explicitly put in `disabledMcpjsonServers` is left alone.

The endpoint exposes every
[canvas_tools](https://www.drupal.org/project/canvas_tools) operation as
`tool_api__canvas_*` — `canvas_list_targets`, `canvas_list_components`,
`canvas_get_component_schema`, `canvas_get_page_tree`, `canvas_create_page`,
`canvas_add_component`, `canvas_update_component_props`,
`canvas_bind_component_props`, `canvas_publish_auto_saves` and the rest —
alongside `tool_api__entity_list` and `tool_api__entity_metadata` from
`tool_belt`.

Two things to know before using it:

- **Every mutation is a draft.** Canvas Tools writes to the same auto-save store
  the Canvas editor uses, so nothing is live until `canvas_publish_auto_saves`
  runs. That publish is a write to the CMS, and the "Deploying to the live site
  is gated" rule below covers it exactly as it covers `npx canvas push`.
- **It is the site's authority, not a bypass.** Requests run as the account that
  approved the OAuth connection, under that account's permissions, and every
  operation is entity-access checked.

Components still come from this repo: build and push them with the Canvas CLI as
usual, then use the MCP tools to compose pages out of them.

## agent-browser

The `agent-browser` command is available in the web container to navigate the
Storybook UI and view rendered components. Use the agent-browser skill for full
usage. Typical flow:

- `agent-browser open <url>` — launch and navigate to a page. From inside the
  container use `http://localhost:6006`; from the host use
  `https://devpanelmcp.ddev.site:6006`.
- `agent-browser snapshot` — a structured accessibility-tree description of the
  rendered page, with refs (`@e1`, `@e2`, …) you can act on.
- `agent-browser screenshot [path]` — capture what the page looks like.
- `agent-browser click @e1` (and the other interaction commands) — act on refs
  from a snapshot, e.g. to expand a mobile menu or dismiss an overlay.

Wait a moment (about 1s) after opening for the JavaScript components to render
before taking a snapshot or screenshot.

agent-browser can also be used to inspect a source site you are migrating from,
including both its content and visual rendering. Where relevant, actions can be
performed on both the source site and the rendered components.

When taking screenshots, store them somewhere outside the component source, e.g.
a scratch directory in the project root.

# URLs

This project distinguishes between two URLs:

- **CMS / API URL** (`CANVAS_SITE_URL`): The Drupal backend URL used by Canvas
  CLI for authentication and API requests.
- **Public URL**: The public-facing site URL visitors see. For Drupal Canvas
  these are the same; for Acquia Source they may differ.

For the Drupal CMS variant of this project, the local Drupal site is the Canvas
source and `CANVAS_SITE_URL` in `.env` already points at it. For the
Storybook-only variant, connect to a hosted Acquia Source site with
`ddev canvas-setup` (which can also be skipped and configured later).

# Available Commands

In addition to the MCP servers, you also have the following commands available:

- `ddev canvas-setup`: Interactive wizard to connect to a hosted Acquia Source
  site and write the `.env` file. Offers a "set up now / add the data later"
  choice, so you can skip the prompts and configure it whenever.

- `ddev mcp-setup`: Set up the local Drupal site's `/mcp` endpoint — installs
  and applies the [agent_access](https://www.drupal.org/project/agent_access)
  stack (Simple OAuth + Tool API + MCP Server), enables
  [canvas_tools](https://www.drupal.org/project/canvas_tools), puts all of its
  operations on the wire, and creates the OAuth scopes for the Canvas
  permissions they need. Run for you at install time; idempotent, so re-run it
  after updating those modules. Needs the local Drupal site, so it does nothing
  in the Storybook-only variant.

- `ddev mcp-login [claude|codex|opencode]`: Complete an agent's OAuth flow
  against the `/mcp` endpoint from inside DDEV, where the callback listener
  actually lives. Needed because the browser cannot reach the container's
  loopback.

- `npm run dev`: Start the Storybook dev server (also run automatically as a
  DDEV daemon on port 6006).
- `npm run restart`: Restart the Storybook dev-server daemon.
- `npm run code:check`: Run code checks on the components.
- `npm run code:fix`: Run code checks on the components and attempt to fix them.
- `npm run test`: Execute Vitest tests (Storybook browser-mode component tests).
- `npx canvas validate`: Validate the local components (and configured pages /
  content-templates) against the Canvas schema. Safe to run anytime.
- `npx canvas push`: Build and push local components (plus the configured `sync`
  groups) to the connected Canvas site. Writes to a live CMS — see "Deploying to
  the live site is gated".
- `npx canvas-jsonapi`: Interact with content in the Drupal site. See the
  `content-management` skill for full usage.

Run these through `ddev` from the host (`ddev npm run …`, `ddev npx …`), or
directly when you are inside the web container.

# Available skills

- `create-component`: Guide for creating new components.
- `component-authoring`: Guide for authoring new and existing components.
- `stories`: Guide on how to build stories.
- `building-ui`: How to build pages/UI to a source (like-for-like) or a design
  system, per the `build-approach` setting.
- `qa-review`: How to QA a built/migrated UI against its source or reference in
  a real browser — content, responsive visuals, animation & motion fidelity,
  layout/overflow, accessibility, and SEO.
- `content-management`: Guide on how to manage content via `npx canvas-jsonapi`.
- `acquia-source-publish`: How to take a QA'd page live on the connected Acquia
  Source site (safe push, page creation, publish, front page, verification),
  with a troubleshooting reference for 503s, dead sessions, duplicates and the
  staged homepage.

# Important notes

## Assets

When using existing assets (e.g. logos), these should be downloaded (for files)
or copied verbatim (for svg). Only SVGs can be directly added to components and
and should only be done for icons or site-wide items such as logos. All other
assets should be part of stories, and should be stored in the storybook assets
folder rather than the component folder.

## Component creation & authoring

See the `create-component` and `component-authoring` skills.

## Story creation

See the `stories` skill for full details. Stories MUST be component-based and
MUST only use props and slots as defined in `<component_name>.component.yml`.

## Building UI (matching a source or design system)

See the `building-ui` skill. The `build-approach` session setting selects the
path — faithfully rebuilding a source (like-for-like) vs building to a design
system.

**After building or changing any page/UI, QA it with the `qa-review` skill
before treating it as done** — and again after any change that touches layout,
animation, or interaction. It is a required step, not optional polish.

## Deploying to the live site is gated

Validating locally (`npx canvas validate`) is always fine. **Pushing to the
connected Canvas / Acquia Source site is not.** `npx canvas push` and
`canvas-jsonapi` media uploads write to a live CMS and are hard to reverse, so
only deploy with the user's explicit go-ahead for that specific action —
approval to build or edit locally is never approval to deploy. **Subagents and
background tasks must never push, upload, or otherwise mutate the remote**; the
person (or the top-level agent acting on an explicit instruction) gates every
deploy, and a completing background task is not consent. This is about deploying
to the CMS — distinct from committing code to the source repository.

## Publishing to Acquia Source ("put it on my site", "make it live", "front page")

When the user wants the built page on their site, Storybook is not the finish
line. After the `qa-review` pass, follow the `acquia-source-publish` skill,
which walks through push, page creation, publishing and verification. The
invariants below hold whatever the skill says:

- **Scope of a homepage migration**: the page includes the site's header and
  footer as built components. Do not ask whether to migrate them; ask only which
  fidelity to build them to, if that setting is unresolved.
- **"Onto my site" is intent, not consent.** It does not change the
  `source-cli push authorisation` setting. If that setting resolves to `never`,
  show the exact live changes the push would make and ask the user to pick
  `ask per push`, `ask each session` or `always allow`; persist the answer as
  the settings section requires. Do not push while it is `never`.
- **Push components only, and never lose the site's existing ones.** Publishing
  pushes with `--no-pages --no-regions --no-content-templates`. Before the push,
  list the components already on the site and compare with `src/components`: any
  remote component that would be deleted or overwritten and that you did not
  create in this session means stop and ask. User confirmation of a push is not
  consent to collateral deletions.
- **Never replay an uncertain write.** After a timeout, connection error, 401 or
  5xx on any write (create, update, delete, publish, homepage, region,
  auto-save), get a fresh token and session, read the current state, and retry
  only if the read proves the write did not land. The site is known to return
  503 after a write has succeeded. Validation and `insufficient_scope` errors
  are not a dead session: stop and report them, do not retry or invent scopes.
- **Do not modify** regions, pages or components you did not create. Never write
  an empty or null value into a global region.
- **Claim success only from a read-back**: the front page is set when the site
  reports it and the public URL shows the migrated page, not when a call
  returned 200.
- **Secrets never enter output or transcripts**: no client secret or token in a
  command line, log, verbose HTTP output or report. Load them from `.env`
  without displaying them and report status codes only.

## Rendering differences & verifying interactivity

Components can render and behave differently in the real site than in Storybook.
Author them to degrade safely, and verify animation, hover, and interactivity in
the real render — see the `component-authoring` and `stories` skills. Verifying
a built page (across breakpoints, scroll-linked motion, overflow, and
accessibility) is the `qa-review` skill's job — use it. In particular, motion
fidelity must be checked by observing the source **over time and across
scroll**, not from static screenshots; and after adding decorative/animated
elements, confirm they add no phantom page overflow (`scrollHeight` vs the
content bottom).

## CMS-editable by default

Everything an author sees must be editable in the CMS via author-friendly props
(booleans/enums, never raw pixel/number values for design tuning) — see the
`component-authoring` skill.
