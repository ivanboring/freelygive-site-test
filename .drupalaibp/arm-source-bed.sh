#!/usr/bin/env bash
# arm-source-bed.sh - arm a storybook-only (source-evals) bed for grading.
#
# A source-evals bed has no local Drupal. The instrument's prepare-bed.sh
# arms it with --no-drush: the source capture, then .abp-eval/state.json
# with baseline_count "0" (on the remote arm the delta oracle takes its
# baseline from the frozen site inventory, SOURCE-ARM.md, never from this
# count). This script only finds the installed instrument and calls it.
#
# Arms the WORKSPACE plane only (capture + state). The SITE plane
# (push/deploy/served-page cases) additionally needs the operator
# credential handover per SOURCE-ARM.md - no script can provide that.
#
# Host-run, idempotent: an existing capture is kept, and so is an existing
# state.json (an instrument update re-runs this after a migration).
set -euo pipefail

# Same PROJECT resolution as setup-evals.sh: the installer stages hook
# scripts to the project root; a manual run may start inside .drupalaibp/.
if [ -d "$PWD/.drupalaibp/evals" ]; then
  PROJECT="$PWD"
else
  _script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT="$(cd "$_script_dir/.." && pwd)"
  [ -d "$PROJECT/.drupalaibp/evals" ] \
    || { echo "  [arm] FAIL: cannot locate .drupalaibp/evals from $PWD or $_script_dir" >&2; exit 1; }
fi
note() { printf '  [arm] %s\n' "$*"; }

SOURCE_URL="${ABP_SOURCE_SITE:-https://freelygive.io/}"
while [ $# -gt 0 ]; do
  case "$1" in
    --source-url) SOURCE_URL="$2"; shift 2 ;;
    *) echo "  [arm] unknown arg: $1 (only --source-url <url>)" >&2; exit 2 ;;
  esac
done

if [ -x "$PROJECT/vendor/bin/drush" ] || [ -x "$PROJECT/web/vendor/bin/drush" ]; then
  note "this bed has a local Drupal - use setup-evals.sh / prepare-bed.sh directly"
  exit 1
fi
command -v jq >/dev/null 2>&1 || { note "FAIL: jq is required"; exit 1; }

CORE="${ABP_CORE_DIR:-$PROJECT/.drupalaibp/evals/core}"
PREPARE="$CORE/evals/canvas-migration/harness/prepare-bed.sh"
[ -f "$PREPARE" ] || { note "FAIL: no instrument at $CORE - run: bash .drupalaibp/setup-evals.sh"; exit 1; }
grep -q -- '--no-drush' "$PREPARE" \
  || { note "FAIL: the instrument at $CORE predates prepare-bed --no-drush - move to a newer one: ddev eval-update"; exit 1; }

# prepare-bed does all of it: the capture, its completeness checks, and the
# state.json seed. An existing state.json is kept as it is.
bash "$PREPARE" -p "$PROJECT" --source-url "$SOURCE_URL" --no-drush

note "workspace plane armed - grade with: ddev eval grade"
note "site-plane cases (push/served-page) additionally need the operator handover: .drupalaibp/evals/SOURCE-ARM.md"
