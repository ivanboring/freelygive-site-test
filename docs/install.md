# Install guide

Everything here runs through the
[One Line Installer](https://www.drupal.org/project/one_line_installer)
(`drupalaibp`) with this repository as the **config source**. There is no
project-specific installer script and no environment file to pre-fill any more —
the installer clones this repo, reads a config from `.drupalaibp/`, and builds
the project.

```bash
bash <(curl -fsSL https://aibp.drupalstarforge.ai/install.sh) \
  https://gitlab.com/freelygive/canvas-storybook-ai
```

A git URL as the positional source resolves to `--config-url`, which is what
this repo needs: the component library (`package.json`, `src/`, `.storybook/`,
`skills/`) and the tracked `.ddev/` config live at the repo root, and only
`--config-url`'s whole-repo overlay stages them. Pointing the installer at a
**local directory** instead resolves to `--config-path`, which copies far less
and leaves you with an empty project — see
[Testing a working copy](#testing-a-working-copy) for how to test locally.

## Choosing a config

`.drupalaibp/` holds two configs, so the installer shows a picker. It is ordered
by each config's `weight`, and each row shows its `label`:

```text
Which config?
  ❯ Source (source)
    Drupal CMS (drupal-cms)
```

Skip the picker by naming the config file (the basename, no `.json`):

| Config     | `--config`            | Shape                                                                        |
| ---------- | --------------------- | ---------------------------------------------------------------------------- |
| Source     | `--config source`     | Storybook component library only, no Drupal site                             |
| Drupal CMS | `--config drupal-cms` | The same library **plus** a local Drupal CMS site wired as the Canvas source |

```bash
bash <(curl -fsSL https://aibp.drupalstarforge.ai/install.sh) \
  https://gitlab.com/freelygive/canvas-storybook-ai --config drupal-cms
```

### `source` — Storybook only

A DDEV **`php`** project (`is_drupal: false`), so none of the installer's Drupal
steps run. Its job is to serve Storybook on port 6006 and give the coding agent
a browser to look at the rendered components with.

There is no local CMS, so Canvas talks to a **hosted Acquia Source** site. The
install finishes by running the interactive `ddev canvas-setup` wizard, which
writes `.env`. The wizard offers "set up now / add the data later", so you can
skip it and re-run `ddev canvas-setup` whenever you have the credentials.

### `drupal-cms` — Storybook plus a local Canvas source

`is_drupal: true`, Drupal CMS on Drupal 11 (`launch_path: ":6006"`, so the
browser still opens on Storybook). On top of the library it requires
`drupal/canvas` + `drupal/simple_oauth:^6`, enables `canvas` and `canvas_oauth`,
and then wires the OAuth connection for you: RSA keys, a `canvas-ai`
client-credentials consumer scoped to `canvas:*`, and the resulting credentials
written to `.env`. `npx canvas validate` / `pull` / `push` work against the
local site out of the box.

The Drupal site is at `https://<project>.ddev.site` (admin / admin); Storybook
is at `https://<project>.ddev.site:6006`.

## What both installs set up

- **DDEV**, with a Storybook dev-server daemon on port 6006 and the per-start
  hooks in `.ddev/config.storybook.yaml` that install npm dependencies and the
  Playwright chromium, trust the DDEV CA inside the container, and bring the
  daemon up. Those hooks are what make plain `ddev start` work afterwards — the
  installer never has to be re-run.
- **Claude Code**, **Codex** and **OpenCode** in the web container
  (`ddev claude`, `ddev codex`, `ddev opencode`).
- **Featherless for OpenCode (optional).** The installer asks for a _Featherless
  API key_ (from https://featherless.ai/account/api-keys) and takes an empty
  answer as "skip". Given a key, the `setup-featherless.sh` hook wires OpenCode
  to `https://api.featherless.ai/v1` following
  [Featherless's OpenCode guide](https://featherless.ai/blog/how-to-use-opencode-with-open-source-models-on-featherless-no-token-bills),
  with `zai-org/GLM-5.3` as the default model and `zai-org/GLM-5.2`,
  `Qwen/Qwen3.8-27B` and `meta-models/Muse-Glimmer-30B` available via `/models`.
  The key lives in `.ddev/.env` (gitignored, injected into the web container)
  and `opencode.json` only references it as `{env:FEATHERLESS_API_KEY}`, so the
  committed config carries no secret. A key already recorded in `.ddev/.env` is
  reused without asking again — see
  [installer-flow](installer-flow.md#the-featherless-question-is-deliberately-plain-text)
  for why that rules out a hidden password prompt. Rotate the key later with
  `ddev dotenv set .ddev/.env --featherless-api-key=<key> && ddev restart`.
- **Agent skills** for whichever agent you chose: this repo's own `skills/`
  (`building-ui`, `component-authoring`, `create-component`, `qa-review`,
  `stories`), plus `superpowers`, `find-skills`, `agent-browser`, and
  `canvas-utils`.
- **agent-browser**, reusing the chromium DDEV already downloaded (both read
  `PLAYWRIGHT_BROWSERS_PATH`, a DDEV global-cache mount), so there is no second
  browser download.
- **glab**, the GitLab CLI, via the installer's `glab` extra — **on `drupal-cms`
  only**. Extras are a Drupal-build step, so the `extra_scripts` entry in
  `source.json` never runs (see
  [installer-flow](installer-flow.md#extras-are-drupal-only)). It is also
  interactive — it asks for a token — so it is skipped on unattended runs.
- **A clean git repository.** The scaffold replaces this repo's history and
  `origin` with a fresh, origin-less repo and commits the finished project as a
  single baseline, so your first diff is against a sensible starting point.

## Unattended installs

`--yolo` takes every installer default silently. Every custom question defaults
to empty — the Featherless API key in all four configs, and the MCP agent picker
in the two Drupal ones — so an unattended run has nothing project-specific left
to ask:

```bash
bash <(curl -fsSL https://aibp.drupalstarforge.ai/install.sh) \
  https://gitlab.com/freelygive/canvas-storybook-ai --config source --yolo --name my-site
```

Two steps stand down when there is no terminal, by design:

- the **glab** extra warns and skips;
- the `source` config's closing **`ddev canvas-setup`** wizard skips with a
  message telling you to run it later.

`--config` is required with `--yolo`: a multi-config source with no `--config`
is a hard error in an unattended run rather than a silent pick.

Note that a `--config-url` build never asks about **GitHub** — the installer
skips its GitHub setup entirely so the clone's own remote handling is left
alone.

An unattended install never wires **Featherless** either: the key question takes
its empty default, and an exported `FEATHERLESS_API_KEY` does not reach the
hook, which runs in the web container and only sees what DDEV injects from
`.ddev/.env`. To add it to a finished project, store the key and paste the
provider block into `opencode.json` yourself:

```bash
ddev dotenv set .ddev/.env --featherless-api-key=<key>
ddev restart
```

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "featherless": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "https://api.featherless.ai/v1",
        "apiKey": "{env:FEATHERLESS_API_KEY}"
      },
      "models": {
        "zai-org/GLM-5.3": { "name": "GLM-5.3" },
        "zai-org/GLM-5.2": { "name": "GLM-5.2" },
        "Qwen/Qwen3.8-27B": { "name": "Qwen3.8-27B" },
        "meta-models/Muse-Glimmer-30B": { "name": "Muse Glimmer-30B" }
      }
    }
  },
  "model": "featherless/zai-org/GLM-5.3"
}
```

## Pinning a branch or tag

Add an `@<ref>` suffix to the source, or pass `--ref`:

```bash
bash <(curl -fsSL https://aibp.drupalstarforge.ai/install.sh) \
  https://gitlab.com/freelygive/canvas-storybook-ai@my-branch --config source
```

A ref may be a branch, a tag, a full `refs/…` ref, or `!<iid>` for a GitLab
merge request (`!115` → `refs/merge-requests/115/head`; quote it in an
interactive shell).

## Testing a working copy

To try local changes without pushing, force `--config-url` with the **absolute
path** to this repo. The installer git-clones it, so it gets the same whole-repo
overlay a real URL source would:

```bash
bash <(curl -fsSL https://aibp.drupalstarforge.ai/install.sh) \
  --config-url /absolute/path/to/canvas-storybook-ai --config source
```

Commit first — `git clone` only sees committed content.

## After the install

```sh
ddev npm run dev          # Storybook on port 6006
ddev npm run restart      # restart the Storybook daemon if it stops responding
ddev npm run build        # build the static Storybook site
ddev npm test             # Vitest
ddev npm run code:check   # prettier, eslint, typecheck
ddev claude               # the coding agent, in the container
ddev canvas-setup         # (re)write .env for a hosted Acquia Source site
```

Canvas credentials live in `.env`, which is gitignored and never committed — the
baseline commit is made before the connection wizard writes it.
