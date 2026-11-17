# Installer test matrix

How to exercise this config source by hand. There is no environment file to
pre-fill any more — a run is fully described by its command line, so each
scenario below is one command plus what to check afterwards.

Run each from an **empty scratch directory**; the installer creates the project
directory itself.

`OLI` below is the installer one-liner:

```bash
OLI() { bash <(curl -fsSL https://aibp.drupalstarforge.ai/install.sh) "$@"; }
REPO=https://gitlab.com/freelygive/canvas-storybook-ai
```

## Coverage

| #   | Scenario                       | Covers                                                                  |
| --- | ------------------------------ | ----------------------------------------------------------------------- |
| 1   | `source`, interactive          | the default path, the config picker, the closing `canvas-setup` wizard  |
| 2   | `source`, `--yolo`             | unattended, no-terminal skips                                           |
| 3   | `drupal-cms`, interactive      | the Drupal scaffold, deferred overlay, the restart, Canvas OAuth wiring |
| 4   | `drupal-cms`, `--yolo`         | the same, unattended                                                    |
| 5   | local clone via `--config-url` | testing uncommitted-then-committed work                                 |
| 6   | pinned ref                     | `@<ref>` / `--ref`                                                      |
| 7   | picker                         | ordering and labels with no `--config`                                  |
| 8   | re-run over a built project    | hook idempotency                                                        |

---

## 1. `source`, interactive

```bash
OLI "$REPO" --config source
```

Check:

- the build never runs `composer create-project` or drush;
- Storybook answers at `https://<project>.ddev.site:6006` and the browser opens
  there at the end (`launch_path: ":6006"`);
- `ddev canvas-setup` runs as the last step, and skipping it still leaves a
  finished project;
- the project is a fresh git repo with exactly one commit and **no `origin`**;
- `.drupalaibp/` and `skills/` are gone from the project, `README.md` and
  `AGENTS.md` are the project's own (not this repo's), and `my-project` appears
  nowhere.

## 2. `source`, unattended

```bash
OLI "$REPO" --config source --yolo --name test-source-yolo
```

Check the same, plus: the `canvas-setup` wizard skipped with a "run it later"
message instead of hanging, and the run needed no keystrokes at all.

## 3. `drupal-cms`, interactive

```bash
OLI "$REPO" --config drupal-cms
```

Check:

- Drupal CMS installs and `https://<project>.ddev.site` logs in with admin /
  admin;
- the **repo overlay landed after the scaffold**: `package.json`, `src/`,
  `.storybook/` and the tracked `.ddev/` files are all present, _and_
  `composer.json` still has the installer's `allow-plugins` /
  `minimum-stability` (the overlay must not have replaced it);
- exactly **one** `ddev restart` happened, from `ddev-restart.sh`, and Storybook
  is up on 6006 after it;
- `.env` has `CANVAS_SITE_URL` / `CANVAS_CLIENT_ID` / `CANVAS_CLIENT_SECRET`,
  and `ddev npx canvas validate` succeeds against the local site;
- `.env` is **not** in the baseline commit.

## 4. `drupal-cms`, unattended

```bash
OLI "$REPO" --config drupal-cms --yolo --name test-cms-yolo
```

Same checks. Also confirm the glab extra skipped rather than blocking on its
token prompt.

## 5. A local working copy

```bash
git -C /path/to/canvas-storybook-ai commit -am 'wip'
OLI --config-url /path/to/canvas-storybook-ai --config source
```

`--config-url` with a path still git-clones, so this is the closest local
equivalent of a real URL run. Check that **uncommitted** changes do _not_ show
up in the project — that is the expected behaviour, and the usual reason a local
test "doesn't pick up my edit".

Contrast with the wrong form, worth reproducing once so the failure is
recognisable:

```bash
OLI /path/to/canvas-storybook-ai --config source     # resolves to --config-path
```

A local directory source resolves to `--config-path`, which does not do the
whole-repo overlay: expect a project with no `package.json`, a Storybook 404 and
a missing `./skills`.

## 6. A pinned ref

```bash
OLI "$REPO@some-branch" --config source
OLI "$REPO" --ref some-branch --config source
OLI "$REPO@!115" --config source      # a GitLab MR head; quote the '!'
```

Check the clone really is at that ref — e.g. a marker file added only on the
branch shows up in the project.

## 7. The picker

```bash
OLI "$REPO"
```

With no `--config`, expect exactly:

```text
Which config?
  ❯ Source (source)
    Drupal CMS (drupal-cms)
```

Ordering comes from `weight` (`source` 0, `drupal-cms` 1) and the row text from
`label`, with the file name in parentheses. Then:

```bash
OLI "$REPO" --yolo
```

must **fail** with an error naming both configs — an unattended run never picks
one for you.

## 8. Re-running over a built project

Re-run the installer inside a project it already built. It should enter
management mode rather than rebuild, and nothing destructive should happen: the
git history survives (`reinit-git.sh` stops at its
`.ddev/.drupalaibp-scaffolded` marker), the baseline commit is not duplicated,
and an existing Canvas consumer and secret are reused.

## Cleaning up

```bash
ddev delete -Oy && cd .. && rm -rf <project>
```
