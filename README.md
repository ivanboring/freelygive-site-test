# devpanelmcp

A campaign microsite built with React components on [Acquia Source|Drupal CMS]
(Drupal Canvas).

## Getting Started

Prerequisites: [DDEV](https://ddev.readthedocs.io/)

```sh
git clone https://gitlab.com/your-group/devpanelmcp.git
cd devpanelmcp
ddev start
```

`ddev start` installs dependencies and browsers and brings up Storybook
automatically — no extra init step. Storybook runs inside the container at
<https://devpanelmcp.ddev.site:6006>.

The coding agent (`ddev claude`) and browser automation (`agent-browser`, in the
web container) are set up by DDEV as well.

### Canvas Credentials

For the Storybook-only variant, connect to a hosted Acquia Source site with the
interactive wizard, which writes your `.env` file. It offers a "set up now / add
the data later" choice, so you can skip it and configure the connection
whenever:

```sh
ddev canvas-setup
```

For the Drupal CMS variant, the local Drupal site is already wired as the Canvas
source — `.env` is written for you during install, so `npx canvas validate` /
`npx canvas pull` / `npx canvas push` work out of the box.

The project uses two URL concepts:

- **CMS / API URL** (`CANVAS_SITE_URL` in `.env`): The Drupal backend used by
  Canvas CLI for authentication and API requests.
- **Public URL**: The public-facing URL visitors see (e.g.
  `https://www.example.com`). For Drupal Canvas these are usually the same; for
  Acquia Source they may differ.

### Agent Access over MCP

The Drupal CMS variant also serves an MCP endpoint, so Claude Code (or any MCP
client that speaks OAuth) can build Canvas pages through the site itself. It is
set up for you during install: the
[agent_access](https://www.drupal.org/project/agent_access) stack is applied,
[canvas_tools](https://www.drupal.org/project/canvas_tools) is enabled, and
every Canvas operation is exposed at `https://<project>.ddev.site/mcp`. Re-run
it after updating those modules — it is idempotent:

```sh
ddev mcp-setup
```

The in-container agents are registered automatically — `.mcp.json` for Claude
Code, `opencode.json` for OpenCode, and `.codex/config.toml` for Codex (which is
why `.ddev/config.codex.yaml` points `CODEX_HOME` at the project). Each still
authenticates once.

That last step needs help, because the agents run inside DDEV: their OAuth
callback listener binds the container's loopback on a random port, so the
browser on your machine cannot reach it and the final redirect always fails.
`ddev mcp-login` bridges the gap — it prints the authorization URL, then takes
the failed `127.0.0.1` URL back from you and delivers it from inside the
container, which is where the listener is:

```sh
ddev mcp-login claude      # or codex, or opencode
```

`ddev mcp-setup` also pre-approves the `.mcp.json` servers for Claude Code — it
writes the workspace-trust flag and the approved-server list into
`~/.claude.json`, since without both a project server stays at _Pending
approval_.

Check the result any time with `ddev exec opencode mcp list`, which reports each
server as connected or `needs authentication`.

To reach it from an agent running on the host instead:

```sh
claude mcp add --transport http drupal https://<project>.ddev.site/mcp
```

Requests run as the account that approves the connection, and every page change
lands as a Canvas draft until it is explicitly published.

## Code Checks & Tests

Lint and format:

```sh
npm run code:check    # check for issues
npm run code:fix      # auto-fix issues
```

Run tests:

```sh
npm run test          # run once
npm run test:watch    # watch mode
npm run test:ui       # interactive UI
```

## Running Evals

Below are the steps you need to go through to run the "Evals" for this project.
They will guide you through getting setup from scratch, running a demo migration
(the FreelyGive website) followed by running the evals and seeing a report.
Evals are a list of criteria for us to use AI to judge the output of AI. This is
great for:

- Evaluating how good AI is at the migration generally
- Evaluating how useful the specific skills and tools in this repo are to
  vanilla AI
- Comparing this set of skills to another
- Or comparing different AI models to each other

Notes:

- This URL is subject to change as it curerently uses a fork of this repo.
- This currently migrates everything into Storybook only. It is then ready for
  migration into Acquia Source. We will follow up with evals for moving it into
  Source and also Drupal CMS. The destination for this is Canvas.

**Steps:**

1. `bash <(curl -fsSL https://aibp.drupalstarforge.ai/install.sh) https://gitlab.com/gkastanis.gr/canvas-storybook-ai@drupalaibp-evals --config evals`
2. Choose a directory name and let it run (takes 5-10 minutes)
3. In that directory run ddev claude and set it up
4. In claude run
   `/building-ui https://freelygive.io/ and name the storybook page example-pages-freelygive--freely-give`
   (This performs a full migration, uses quite a lot of tokens and likely will
   take an hour. You can skip this step and go straight to 6.)
5. exit claude
6. Run `ddev eval grade` (takes 5-10 minutes. Actually runs the Evals)
7. Run `ddev eval view` to see results in terminal.
8. Run `ddev eval export` to export this as a prettier HTML report.

## IDE Setup (JetBrains)

Configure PhpStorm / WebStorm to use the Node.js inside the DDEV container:

1. Open **Settings > Languages & Frameworks > Node.js**.
2. Click the Node interpreter dropdown and select **Add**.
3. Select **Add Remote** > **Docker**.
4. Select the running DDEV web container.

Then do the same for TypeScript:

1. Open **Settings > Languages & Frameworks > TypeScript**.
2. Click the TypeScript dropdown and select **Add**.
3. Select **Add Remote** > **Docker**.
4. Select the running DDEV web container.
