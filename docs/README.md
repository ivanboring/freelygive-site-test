# Documentation

Documentation for this One Line Installer config source. The root
[README](../README.md) has the quick install; the pages below go deeper.

This repository is **not** a template you clone by hand — the One Line Installer
(`drupalaibp`) clones it, reads one of the configs in
[`.drupalaibp/`](../.drupalaibp), and scaffolds a fresh DDEV project from it.

## For users

- **[Install guide](install.md)** — picking between the `source` and
  `drupal-cms` configs, what each install does, unattended (`--yolo`) runs,
  pinning a branch or tag, connecting to a hosted Acquia Source site, and what
  you get when it finishes.

## For maintainers

- **[Installer flow](installer-flow.md)** — the events each config's hooks run
  on, why the two configs overlay the repo at different times, and the split
  between one-time install hooks and the per-start `.ddev/` provisioning.
- **[Installer test matrix](installer-test-matrix.md)** — the commands that
  exercise each install path, and what to check after each one.

### Testing this repo locally (before pushing)

To try a working copy without pushing to GitLab, force `--config-url` with the
**local repo path** — the installer git-clones it (committed content only), so
it gets the same whole-repo overlay as a real URL source:

```bash
# from a scratch directory, pointing at this repo
bash <(curl -fsSL https://project.pages.drupalcode.org/one_line_installer/drupalaibp) \
  --config-url /absolute/path/to/canvas-storybook-ai --config storybook
```

Commit your changes first — `git clone` only sees committed content.

## Contents

- `.drupalaibp/` — the installer configs and their hook scripts:
  - `storybook.json`, `drupal-cms.json` — the two named configs.
  - `reinit-git.sh`, `project-rename.sh`, `ddev-restart.sh`,
    `setup-canvas-connection.sh`, `finalize-project.sh` — install-time hooks.
- `.ddev/` — tracked DDEV config committed into the scaffolded project:
  - `config.storybook.yaml` — Storybook daemon, ports, environment, per-start
    provisioning hooks.
  - `web-build/Dockerfile.storybook` — chromium OS deps + `certutil`.
  - `commands/web/canvas-setup` — the hosted-Canvas credentials wizard.
- `skills/` — agent skills for the component workflow, installed generically.
- `src/`, `.storybook/`, `package.json`, `vite.config.js`, `vitest.config.ts`,
  `tsconfig.json`, `canvas.config.json` — the Storybook component library and
  its tooling.
- `.README.md` — becomes the scaffolded project's `README.md`.
