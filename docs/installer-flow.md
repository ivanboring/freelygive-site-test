# Installer flow

Maintainer reference: what actually happens when the One Line Installer builds a
project from this repo, and why the two configs differ.

There is no installer code in this repository any more — `drupalaibp` owns the
pipeline, and this repo contributes a config plus hook scripts that ride on its
events. See the installer's own
[config reference](https://project.pages.drupalcode.org/one_line_installer/drupalaibp-json/)
for the schema and the full event list.

## The one structural difference: when the repo is overlaid

A `--config-url` build copies the **whole clone** (including `.git`) into the
new project. _When_ that happens depends on `is_drupal`, and it is the reason
the two configs hang their hooks on different events:

|                         | `source` (`is_drupal: false`)                                   | `drupal-cms` (`is_drupal: true`)                                                                   |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Overlay lands           | at `create_project_dir_done`, **before** the first `ddev start` | at `create_drupal_site_done`, **after** the Drupal scaffold                                        |
| First `ddev start` sees | the tracked `.ddev/` — daemon, ports, post-start hooks          | a vanilla DDEV config; none of this repo's `.ddev/`                                                |
| Therefore               | no restart needed                                               | `ddev-restart.sh` does one `ddev restart` to rebuild the web image and re-run the post-start hooks |

The deferred overlay is what lets `composer create-project` scaffold into an
empty directory; it deliberately preserves the scaffold's own
`composer.json`/`composer.lock`, so this repo must contribute Drupal packages
through the config's `composer_projects` / `install_modules` — never through a
root `composer.json`.

## `source`

```
drupalaibp <this repo> --config source
│
├─ installer pipeline: DDEV, project dir, repo overlay, .ddev/.env,
│                      coding agent add-on, ddev start, skills
│                      (no extras — see below)
│
├─ ddev_started
│   ├─ w5  reinit-git.sh      (web)  fresh git repo, marker .ddev/.drupalaibp-scaffolded
│   └─ w8  project-rename.sh  (web)  my-project → $DDEV_SITENAME across the template files
│
└─ before_announce_complete
    ├─ w10 finalize-project.sh   (web)  .README.md → README.md, .AGENTS.md → AGENTS.md,
    │                                   drop .drupalaibp/ + skills/, baseline commit
    └─ w20 hosted-canvas-setup.sh (host) interactive `ddev canvas-setup` → .env
```

`hosted-canvas-setup.sh` runs **after** the baseline commit on purpose: the
credentials the wizard writes into `.env` stay uncommitted. It also needs a real
terminal, so it checks `/dev/tty` and skips cleanly when there isn't one.

## `drupal-cms`

```
drupalaibp <this repo> --config drupal-cms
│
├─ installer pipeline: DDEV, project dir, .ddev/.env, coding agent add-on,
│                      ddev start, composer create-project (Drupal CMS),
│                      core-dev + ai_best_practices, glab extra
│
├─ create_drupal_site_done          (repo overlay lands first, at weight -100)
│   ├─ w5  reinit-git.sh      (web)
│   ├─ w8  project-rename.sh  (web)
│   └─ w10 ddev-restart.sh    (host) the one `ddev restart` — brings up the
│                                    Storybook daemon and the web image changes
│
├─ provision_from_config_done       (canvas + canvas_oauth are installed by now)
│   └─ w10 setup-canvas-connection.sh (web)  simple_oauth keys, a `canvas-ai`
│                                            client-credentials consumer, .env
│
└─ before_announce_complete
    └─ w10 finalize-project.sh (web)  as above
```

No `hosted-canvas-setup.sh` here — the local Drupal site _is_ the Canvas source,
so `setup-canvas-connection.sh` has already written `.env`. That script is
best-effort: `drupal/canvas` is alpha, so if the modules aren't enabled it warns
and tells the user to run `ddev canvas-setup` instead of failing the build.

## One-time vs. every-start

The split matters when changing anything:

- **`.drupalaibp/*.sh` — one-time scaffold steps.** Git re-init, the rename, the
  Canvas wiring, the baseline commit. They run during the install and are then
  deleted from the project by `finalize-project.sh`.
- **`.ddev/config.storybook.yaml` — recurring per-start setup.** `npm ci`, the
  Playwright chromium, the container CA trust, and the Storybook daemon restart.
  Anything the project needs on _every_ `ddev start` belongs here, not in a
  hook, or the scaffolded project stops standing up on its own.

`config.storybook.yaml` is merged with the `config.yaml` the installer generates
(which owns project type and docroot), and its post-start block is guarded on
`package.json` so the `drupal-cms` first start — which happens before the
overlay — is a clean no-op.

## Decisions and where they are made

| Decision          | Values                           | Where                                                        |
| ----------------- | -------------------------------- | ------------------------------------------------------------ |
| Which config      | `source` / `drupal-cms`          | `--config`, or the weight-ordered picker                     |
| Drupal or not     | `is_drupal`                      | the chosen config                                            |
| Overlay timing    | before start / after scaffold    | derived from `is_drupal` by the installer                    |
| Coding agent      | `claude`, `codex`, `opencode`    | `agents` in every config                                     |
| OpenCode provider | Featherless, when a key is given | `questions` + the `setup-featherless.sh` hook                |
| Extras            | `glab`                           | `extra_scripts` — **`drupal-cms` only in practice**          |
| Canvas connection | local Drupal / hosted Source     | the chosen config                                            |
| Storybook port    | 6006                             | `.ddev/config.storybook.yaml`, `launch_path` in both configs |

## Extras are Drupal-only

`extra_scripts` is applied by the installer's `install_extras` step, which is
`is_drupal`-gated — it returns immediately on a non-Drupal build. So the
`"extra_scripts": ["glab"]` in **`source.json` has no effect**: the `source`
project gets no glab. It is harmless (unknown or skipped extras never fail a
build), but it is not doing what it looks like it is doing. Either drop it from
`source.json`, or install glab from the `.ddev/` side if the Storybook-only
project genuinely needs it.

## The Featherless question is deliberately plain `text`

`FEATHERLESS_API_KEY` is asked as a `text` question with an empty default, not
as a `password` behind a "use Featherless? y/n" gate, because of two facts about
the installer's `ask_config_questions`:

- It reuses an answer already present in `.ddev/.env` — asking nothing — but
  **only when no question in the config declares `depends_on`** (the
  `CONFIG_HAS_CONDITIONAL_QUESTION` guard). One conditional question turns that
  reuse off for the whole config, `CANVAS_MCP_LOGIN` included.
- `ask()`'s `password` branch has no unattended guard, unlike every other type:
  with a terminal attached it prompts even under `--yolo`. A hidden key prompt
  therefore has to be gated by a `depends_on` to keep unattended runs from
  hanging — which is exactly what would kill the reuse above.

So: no `depends_on` anywhere in these configs, and no `password` type. A key
already in `.ddev/.env` is picked up silently, `--yolo` takes the empty default,
and the cost is that the key is echoed while it is typed.

`step_answers_to_env` rewrites the `FEATHERLESS_API_KEY` line in `.ddev/.env`
from the answer, so the same rule is what stops a re-run from wiping a stored
key with an empty reply.

## Conventions worth keeping

- **Hooks are idempotent.** `reinit-git.sh` bails on its marker file,
  `finalize-project.sh` skips the baseline commit if the repo already has
  commits, `setup-canvas-connection.sh` reuses an existing consumer and secret.
  Re-running the installer over a built project must never destroy work.
- **Hook script paths are relative to `.drupalaibp/`** (`"./reinit-git.sh"`),
  because that is where the config file lives.
- **`where` picks the side.** `web` runs inside the container (drush, npm, git
  on the project); `host` is for anything that drives DDEV itself
  (`ddev restart`) or needs the user's terminal (`ddev canvas-setup`).
- **The picker keys are `label` and `weight`** in each config — `weight` sorts
  the list (lower first), `label` names the row. Adding a third config means
  giving it both.
