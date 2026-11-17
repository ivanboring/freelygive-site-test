---
name: devpanel-deploy
description: Use when the user wants this project on DevPanel. Covers "push / deploy this project to DevPanel", hosting this Drupal CMS + Canvas site on DevPanel for the first time, moving the local DDEV content (pages, code components, media) to a DevPanel environment, and pushing later code or component changes to an existing DevPanel environment.
---

# Deploy this project to DevPanel

This is the repo's playbook on top of the DevPanel AI toolkit skill
`devpanel-project-lifecycle` (v0.2.0, installed in
`.claude/skills/devpanel-project-lifecycle/`). That skill owns the DevPanel MCP
protocol: plans, the `APPROVE`/`REJECT` approval, activity monitoring,
`check-site.sh`, execution records and the final report. **Load it and follow
its shared rules.** This file adds only what is specific to this project. It
never loosens those rules or the AGENTS.md settings.

## What has to travel, and how

| Part | Where it lives | How it reaches DevPanel |
|---|---|---|
| Drupal codebase (`composer.json`/`.lock`, `config/sync`, `recipes/`, web scaffold) | Git | GitHub repo. DevPanel deploys the branch and runs Composer |
| DevPanel glue (`.devpanel/`, `settings.php` include) | Added in §2 | Git, as above |
| Canvas code components (`src/components`, stored as `canvas.js_component.*`), pages, menus, media entities, users | **Local database.** `config/sync` does *not* hold the components or pages | First deploy: database import (§5). Later: `npx canvas push` to the DevPanel site (§7) |
| Uploaded files (`web/sites/default/files`) | Local disk, git-ignored | Files archive import (§5) |
| OAuth keys (`keys/`) | Git-ignored, per site | Generated on DevPanel (§5) |

So a code-only deploy shows Drupal's installer (`install_required`). That is
expected, not a failure.

## Settings and gates (AGENTS.md)

Read the settings first, and pass the resolved values to any subagent.

- **git-tracking** (`commit`): commit on a dedicated branch, never `main`. The
  index may hold staged files the user owns. Use `git commit -- <paths>` for
  your own changes, and commit the whole index only where §1 says so.
- **git-remote**: DevPanel deploys from GitHub, so the first deploy needs a
  push. If the value is `UNSET` or `none`, show what the push would publish
  (repository, branch, commit count, top-level directories). Ask the user to
  choose `push` or `merge-request`, or to keep `none`, which stops at §3.
  Persist the answer in AGENTS.md. Never push while it is `none`.
- **`git push` is denied to the agent** in `.claude/settings.json`. Even with
  `push`, the user runs it: `! git push -u origin <branch>`. Do not route
  around the rule (`gh repo create --push`, `gh api` ref updates, other
  wrappers), and do not edit the permission.
- **source-cli push authorisation** was granted for the site in `.env`
  (`CANVAS_SITE_URL`, the local DDEV site). A DevPanel site is a different,
  live CMS. Before the first `npx canvas push` to it, ask whether the setting
  also covers that host, and record the answer under the setting in AGENTS.md.
- **Every DevPanel MCP call needs the user's go-ahead**, including the
  read-only ones. The user asked for this, and `permissions.ask: ["mcp__devpanel"]`
  in `.claude/settings.json` makes Claude Code prompt for each call. Before a
  call, say what it is for and what it will read or change. Group the reads you
  need so the user is not prompted more than necessary.
- **DevPanel plans**: every DevPanel change goes through the lifecycle
  approval protocol. Show `plan_text` verbatim and wait for a literal
  `APPROVE`/`REJECT`. "Deploy it" is not approval of a plan the user has not
  seen. Subagents never create, approve or execute plans, never push, and never
  import data.

## 0. Preflight (read-only)

```bash
bash .agents/skills/devpanel-deploy/scripts/preflight.sh
```

`OK` = ready. `TODO` = a step below that is still open. `WARN` = needs the
user. `BLOCK` = stop and fix it first. Then:

1. **DevPanel MCP tools** (`mcp__devpanel__devpanel_*`) must be available.
   If they are not, check `claude mcp get devpanel`:
   - `Rejected (see disabledMcpjsonServers …)`: Claude Code hides a rejected
     `.mcp.json` server from `/mcp`, so it cannot be enabled there. The user
     either moves `devpanel` from `disabledMcpjsonServers` to
     `enabledMcpjsonServers` in `.claude/settings.local.json`, or runs
     `claude mcp reset-project-choices` and approves it at the next start.
     Then they restart the session. The agent must not make this change:
     approving an MCP server is the user's call, and auto mode denies it.
   - Needs authentication: Claude runs in the DDEV container, so signing in
     from `/mcp` fails at the browser redirect. The user runs
     `ddev mcp-login claude devpanel` on the host and pastes the redirect URL
     back when prompted. Then `/mcp`, or a new session, shows it connected.
2. **Lifecycle §1 preflight**: run `devpanel_whoami` (it must show a
   `githubUsername`), then `devpanel_list_workspaces` and
   `devpanel_list_git_owners`. For PAT problems, follow lifecycle §9: the user
   saves a PAT classic with `repo` scope in DevPanel, never through the chat.
3. **`gh`** is not in the DDEV web image, but the toolkit's `gh-branch.sh`
   needs it. If it is missing, offer to add `webimage_extra_packages: [gh]` to
   `.ddev/config.yaml`. The user then runs `ddev restart` on the host and
   `! gh auth login` here. Without `gh`, use `git ls-remote` for branch
   lookups, and the user creates the repository on github.com.

## 1. Commit the Drupal codebase

Check: `git cat-file -e HEAD:composer.json`. In this repo, the installer staged
the Drupal codebase but never committed it. HEAD held only `src/`, `AGENTS.md`
and `canvas.config.json`, so DevPanel would have deployed a repo with no
`composer.json`.

1. Create a dedicated branch from the current one. `git switch -c devpanel`
   keeps the index.
2. Preflight's gitleaks and forbidden-path checks must pass. Nothing under
   `.env`, `keys/`, `web/sites/*/settings*.php`, `web/sites/*/files/`, dumps
   or `.devpanel-export/` may be tracked or staged.
3. Show what the commit would contain: counts per top-level directory and
   `git diff --cached --shortstat`. Get the user's OK, because they own the
   staged set. Then commit the whole index with one descriptive message.
4. A file that is both staged and modified (`AM`, for example `.mcp.json` after
   the toolkit installer added `devpanel`) is committed in its staged version.
   Mention it rather than staging it silently.

## 2. Add the DevPanel glue

Follow lifecycle `references/add-devpanel-config.md` exactly. It adds the
pinned `drupalforge/devpanel-starter` via Composer scaffold and the
`DP_APP_ID`-guarded `settings.php` include. Specific to this repo:

- The web root is `web/`, one level below the project root, which meets the
  reference's precondition.
- `web/sites/default/settings.php` is git-ignored. On DevPanel, the scaffold
  hook creates it from `default.settings.php` and appends the include during
  `composer install`. Locally, the same hook appends the guarded block to
  DDEV's `settings.php`. That is harmless, because only DevPanel sets
  `DP_APP_ID`.
- Merge into the keys that already exist, and replace nothing:
  `extra.drupal-scaffold.allowed-packages` already lists three `drupal/drupal_cms_*`
  packages. `scripts` already has `post-install-cmd`/`post-update-cmd`. Add
  `post-drupal-scaffold-cmd` beside them.
- Run Composer in the web container: `composer …` here, `ddev composer …` from
  the host.
- Run the reference's local validation, then preflight again. Commit
  `composer.json composer.lock .devpanel/` with a path-limited commit.
- Tell the user the toolkit has verified this locally but not yet on a real
  DevPanel deployment.

## 3. GitHub repository and push

1. Ask for the owner and repository name (private is recommended). Creating the
   repository is an outward-facing action. Either the user creates it, or you
   run `gh repo create OWNER/NAME --private` after they confirm. Never pass
   `--source` or `--push`.
2. `git remote add origin <url>` (local only).
3. Apply the push gate (see Settings), then the user runs
   `! git push -u origin <branch>`.
4. Read back: `git ls-remote origin refs/heads/<branch>` must equal
   `git rev-parse HEAD`.

## 4. Create the DevPanel project

Follow lifecycle `references/create-project-from-repository.md`. Present the
values below as **suggestions**. The user selects the server configuration.

| Field | Suggestion | Why |
|---|---|---|
| Project type | `drupal11_v2` | `composer.lock` pins Drupal 11.4 |
| PHP image | `devpanel/php:8.4-base` | DDEV runs PHP 8.4. Drupal 11 needs at least 8.3 |
| Tier | `small_2` (0.5 CPU / 2 GB) | The toolkit's tested Drupal CMS tier. `medium_2` if the editor is slow |
| App root / web root | `/var/www/html` / `/var/www/html/web` | Imported config expects OAuth keys at `/var/www/html/keys` |
| Static files | `/var/www/html/web/sites/default/files` | Inspector's suggestion |
| Storage | 5 GiB | Files plus dump are well under that. Storage can never shrink |
| MySQL | Cluster default | Set at cluster level. The local DB is MariaDB 11.8, and the export is made MySQL-safe |
| Branch | The branch pushed in §3 | |

**Activation does not build the site** (verified 2026-11-17, deploy activity
log). DevPanel creates the database, clones the branch and reports `SUCCESS`.
It runs no `.devpanel` script, and its own readiness check 404s and is
ignored. Until `composer install` runs, the site answers 403 at `/` and 404 at
`/index.php`. The user then runs this once in the application's VS Code
terminal (so pass `isEnableEditor: true` on activation, because the tool
defaults it to off):

```bash
cd /var/www/html && bash .devpanel/re-config.sh
```

That runs `composer install` and creates the files, private and config folders.
Its `drush cron` step fails until a database exists. After that, `check-site.sh`
reports `install_required`. A testing workspace allows 3 running applications.

**Automating it** is not possible through the MCP: there is no
command-execution tool. The candidate is `.devpanel/config.yml` `git_hooks`.
It runs a `cmd` on push to a named branch, but only when the GitHub repo
calls DevPanel's git hook (a `DP_TOKEN` webhook, set up outside the MCP). The
scaffolded file only lists `main` and `develop`. This is unverified. Try it
only with the user, and record the result here.

## 5. Move the content (first deploy only)

The local DDEV database is the source of truth: the built pages, components and
media. Confirm with the user that it should become the DevPanel site's content.
It includes user accounts and OAuth consumers, whose secrets are stored hashed.

1. Export:
   `bash .agents/skills/devpanel-deploy/scripts/export-site-data.sh`. It
   writes `.devpanel-export/{db.sql.gz,files.tgz,SHA256SUMS}` (git-ignored)
   and strips MariaDB's sandbox line, which MySQL clients reject. Never commit
   these files or paste their contents.
2. Check that application storage is at least 2 × files + dump (lifecycle
   `deploy-existing-site.md`, "Data migration").
3. Give the user `references/import-on-devpanel.md` and the application URL.
   They run it in the application's VS Code terminal. Do not automate the
   import through Git, an image or `.devpanel/dumps/`.
4. When they say "data imported", verify (§6), then `rm -rf .devpanel-export`
   locally.

Only if the user asks: install fresh on DevPanel
(`drush si --existing-config`), push the components (§7) and rebuild the pages
through the DevPanel site's `/mcp`. That path loses the current content unless
it is rebuilt.

## 6. Verify

1. Lifecycle §5: `check-site.sh https://<hostname>` must return 200, not
   `install_required`.
2. Open the homepage with agent-browser at 375 px and 1280 px, beside the local
   site (`https://devpanelmcp.ddev.site/`). Cache-bust both with `?qa=<ts>`.
   Check the header and menu, hero, images (which prove the files import), the
   footer and the console. The Mercury theme's CSS overrides apply there too.
3. Ask the user for the `drush status` output from the import guide.
4. Report per lifecycle §8. Add "data imported manually by user" to the
   execution record.

## 7. Pushing later changes

| What changed | Route |
|---|---|
| PHP, Composer, `config/sync`, `.devpanel/` | Commit, the user pushes, then redeploy the application (below) |
| `src/components`, `global.css` | `npx canvas push` to the DevPanel site. A git push does nothing for these: they live in its database |
| Pages and content | The DevPanel site's Canvas editor or its `/mcp`. Re-syncing the local DB overwrites everything there, so only do it on explicit request, with a backup plan first |

**Redeploy.** Toolkit v0.2.0 documents no "deploy the latest commit" workflow,
and the live MCP has no tool for it either (checked 2026-11-17, 56 tools). The
only redeploy is `plan_upgrade_application`, which redeploys a running
application *with changed runtime settings* and regenerates the code-server
password. Whether it also pulls the newest commit is unverified. Do not
repurpose it, or `plan_activate_application` (only for undeployed
applications), just to ship code. Until a route is verified, use one of these:
- The user redeploys from the DevPanel UI.
- In the application's VS Code terminal: `git pull`, then `composer install`,
  then `drush deploy`. This route is also unverified.

Re-check the live tool list each time in case a redeploy tool has been added.
The scaffolded `.devpanel/re-config.sh` (pinned starter `d72d2e9`) runs
`composer install`, `drush cron` and a cache warm-up. It never runs
`drush updb` or `config:import` against an existing database. So after a code
change, the user runs `drush deploy` in the VS Code terminal. Record what
worked under **Verified update path**.

**Components to DevPanel:**

1. Preflight the remote set the way `acquia-source-publish` §1 does, but against
   `https://<devpanel-host>`. Get a `client_credentials` token with the `.env`
   client id and secret: that consumer came across with the database, and the
   import generated its keys. List `/canvas/api/v0/config/js_component` and
   compare with `src/components`. If a remote component would be deleted or
   overwritten and you did not create it, stop and ask.
2. Apply the push-authorisation gate for that host (see Settings).
3. Run `npx canvas push --site-url https://<devpanel-host> --no-pages --no-regions --no-content-templates`
   without `-y`. Credentials come from `.env`, never from the command line.
4. Read back: re-list components on the DevPanel host to confirm the change
   landed there, and that the local site did not change. Then load the page.

## Verified update path

None recorded yet. After the first successful redeploy, record the tool name,
its arguments and what the activity log showed.

## Known issues

- DDEV's MariaDB 11.8 dump starts with `/*M!999999\- enable the sandbox mode */`.
  MySQL clients reject it with `Unknown command '\-'`. The export script strips
  it.
- `.devpanel/re-config.sh` imports `.devpanel/dumps/db.sql.gz` and
  `files.tgz` automatically when the database is empty. Never put anything
  there: the folder is in Git, and the GitHub repo may be public.
- Local tables use `utf8mb4_unicode_520_ci`, which MySQL 8 supports. Collation
  errors are handled in the import guide's table.
- `.claude/skills/devpanel-project-lifecycle/` is untracked. Commit it, or
  install the toolkit at user scope, so that other clones have it.
- Lifecycle limits still apply: plans expire after 15 minutes, branch sync sees
  only the first 50 GitHub branches, and a `SUCCESS` job does not prove the
  site works.
