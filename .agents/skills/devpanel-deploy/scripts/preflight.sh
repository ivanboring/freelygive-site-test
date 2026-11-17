#!/usr/bin/env bash
# Read-only readiness report for deploying this project to DevPanel.
#
# Prints one line per check:
#   OK     ready
#   TODO   a step of the devpanel-deploy skill that has not been done yet
#   WARN   needs the user (a setting, a sign-in, a missing optional tool)
#   BLOCK  stop and fix before anything else
# Exit 0 = no BLOCK lines, 1 = at least one BLOCK.
# Never prints secret values: only paths, counts and exit codes.
set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "BLOCK  not inside a git repository"; exit 1; }
cd "$ROOT" || exit 1

blockers=0
ok()      { printf 'OK     %s\n' "$*"; }
todo()    { printf 'TODO   %s\n' "$*"; }
warn()    { printf 'WARN   %s\n' "$*"; }
block()   { printf 'BLOCK  %s\n' "$*"; blockers=$((blockers + 1)); }
section() { printf '\n== %s\n' "$*"; }

# The value of a setting in AGENTS.md ("- **name** ... value: `x`").
setting() {
  awk -v k="**$1**" 'index($0, k) { f = 1 }
    f && /value: `/ { match($0, /value: `[^`]*`/); print substr($0, RSTART + 8, RLENGTH - 9); exit }' AGENTS.md
}

section "Tools"
for t in git node composer gitleaks; do
  if command -v "$t" >/dev/null 2>&1; then ok "$t"; else block "$t missing"; fi
done
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then ok "gh authenticated"; else warn "gh installed but not signed in (user runs: gh auth login)"; fi
else
  warn "gh missing: the toolkit's gh-branch.sh needs it (SKILL.md section 0)"
fi
DRUSH=vendor/bin/drush
[ -x "$DRUSH" ] || DRUSH=drush

section "DevPanel toolkit and MCP"
if [ -f .claude/skills/devpanel-project-lifecycle/SKILL.md ] ||
   [ -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/devpanel-project-lifecycle/SKILL.md" ]; then
  ok "devpanel-project-lifecycle skill installed"
else
  block "devpanel-project-lifecycle skill not installed (DevPanel AI toolkit)"
fi
if [ -f .mcp.json ] && node -e 'process.exit(require("./.mcp.json").mcpServers?.devpanel ? 0 : 1)' 2>/dev/null; then
  ok "devpanel MCP server declared in .mcp.json"
else
  warn "devpanel MCP server not declared in .mcp.json"
fi
if [ -f .claude/settings.local.json ] &&
   node -e 'process.exit((require("./.claude/settings.local.json").disabledMcpjsonServers || []).includes("devpanel") ? 0 : 1)' 2>/dev/null; then
  warn "devpanel MCP server is disabled in .claude/settings.local.json (user enables it with /mcp)"
fi

section "Session settings (AGENTS.md)"
remote="$(setting git-remote)"
case "$remote" in
  push|merge-request) ok "git-remote: $remote" ;;
  *) warn "git-remote: ${remote:-missing}; the first deploy needs a push to GitHub, ask the user (SKILL.md, Settings and gates)" ;;
esac
printf '       git-tracking: %s; source-cli push authorisation: %s\n' "$(setting git-tracking)" "$(setting 'source-cli push authorisation')"
if grep -qs '"Bash(git push' .claude/settings.json; then
  warn "git push is denied to the agent in .claude/settings.json: the user runs pushes"
fi

section "Git"
branch="$(git branch --show-current)"
printf '       branch: %s\n' "${branch:-detached}"
case "$branch" in main|master) warn "on $branch: git-tracking wants a dedicated branch" ;; esac
if [ -n "$(git remote)" ]; then ok "remote: $(git remote | tr '\n' ' ')"; else todo "no git remote (SKILL.md section 3)"; fi
missing=()
for f in composer.json composer.lock config/sync/core.extension.yml; do
  git cat-file -e "HEAD:$f" 2>/dev/null || missing+=("$f")
done
if [ ${#missing[@]} -eq 0 ]; then
  ok "Drupal codebase is in HEAD"
else
  todo "not committed in HEAD: ${missing[*]} (SKILL.md section 1)"
fi
printf '       staged: %s, modified: %s, untracked: %s\n' \
  "$(git diff --cached --name-only | wc -l)" "$(git diff --name-only | wc -l)" "$(git ls-files --others --exclude-standard | wc -l)"

# Never in Git: env files, OAuth keys, settings with credentials, uploaded files, dumps, exports.
forbidden="$(git ls-files | grep -E '(^|/)\.env$|(^|/)\.env\.[^/]*\.local$|^keys/|^web/sites/[^/]+/settings(\.local|\.ddev)?\.php$|^web/sites/[^/]+/(files|private)/|\.sql(\.gz)?$|^\.devpanel-export/|\.(key|pem)$' || true)"
if [ -n "$forbidden" ]; then
  block "tracked or staged paths that must never be committed:"
  printf '         %s\n' $forbidden
else
  ok "no env files, keys, settings.php, uploaded files or dumps tracked or staged"
fi
gitleaks git --pre-commit --staged --no-banner --redact --log-level error --exit-code 2 . >/dev/null 2>&1
rc=$?
case $rc in
  0) ok "gitleaks: staged changes clean" ;;
  2) block "gitleaks found secrets in staged changes (run it with -v --redact to see paths)" ;;
  *) warn "gitleaks staged scan errored (exit $rc)" ;;
esac
gitleaks git --no-banner --redact --log-level error --exit-code 2 . >/dev/null 2>&1
rc=$?
case $rc in
  0) ok "gitleaks: history clean" ;;
  2) block "gitleaks found secrets in git history (run it with -v --redact to see commits)" ;;
  *) warn "gitleaks history scan errored (exit $rc)" ;;
esac
if git check-ignore -q .devpanel-export/db.sql.gz; then ok ".devpanel-export/ is git-ignored"; else block ".devpanel-export/ is not git-ignored"; fi

section "DevPanel glue (lifecycle add-devpanel-config.md)"
have=0
node -e 'process.exit(require("./composer.json").require?.["drupalforge/devpanel-starter"] ? 0 : 1)' 2>/dev/null && have=$((have + 1))
[ -f .devpanel/settings-include.txt ] && have=$((have + 1))
[ -x .devpanel/re-config.sh ] && have=$((have + 1))
case $have in
  3) ok "drupalforge/devpanel-starter required, .devpanel/ scaffolded, settings include present" ;;
  0) todo "DevPanel glue not added yet (SKILL.md section 2)" ;;
  *) warn "DevPanel glue partly present ($have of 3: composer require, .devpanel/settings-include.txt, executable .devpanel/re-config.sh)" ;;
esac
if [ -d .devpanel ] && ! git cat-file -e HEAD:.devpanel 2>/dev/null; then
  todo ".devpanel/ exists but is not committed"
fi

section "Local site content (moves with the database, not Git)"
if "$DRUSH" status --field=bootstrap 2>/dev/null | grep -q Successful; then
  comps="$("$DRUSH" sqlq "SELECT COUNT(*) FROM config WHERE name LIKE 'canvas.js_component.%'" 2>/dev/null | tr -d '[:space:]')"
  pages="$("$DRUSH" sqlq "SELECT COUNT(*) FROM canvas_page_field_data" 2>/dev/null | tr -d '[:space:]')"
  files="$(du -sh web/sites/default/files 2>/dev/null | cut -f1)"
  ok "local site: ${comps:-?} code components, ${pages:-?} Canvas page rows, files ${files:-?}"
else
  warn "local Drupal site does not bootstrap (is DDEV running?)"
fi

printf '\n'
if [ "$blockers" -gt 0 ]; then
  echo "Result: $blockers blocker(s)."
  exit 1
fi
echo "Result: no blockers."
