#!/usr/bin/env bash
# drupalaibp hook — runs INSIDE the DDEV web container (where=web),
# before_announce_complete, evals config ONLY.
#
# Same job as finalize-project.sh (which the evals config replaces in its
# hook list), with one difference: the standard finalizer deletes the whole
# .drupalaibp/ directory, and the eval harness LIVES there - custom/ sets,
# the fetched core/ instrument, setup-evals.sh for re-runs, and the README
# that `ddev eval` points at. So installer artifacts are cleared item by
# item and the eval runtime is preserved.
set -euo pipefail

# 1. Project README.
if [ -f .README.md ]; then
  mv -f .README.md README.md
  echo "Moved .README.md into place as README.md."
fi

# 2. Project AGENTS.
if [ -f .AGENTS.md ]; then
  mv -f .AGENTS.md AGENTS.md
  echo "Moved .AGENTS.md into place as AGENTS.md."
fi

# 3. Clean up installer artifacts - everything finalize-project.sh removes
#    EXCEPT the eval runtime (.drupalaibp/evals + setup-evals.sh + this
#    file's config). skills/ is still cleared like the standard finalizer.
echo "Clearing installer artifacts (keeping the eval runtime)..."
rm -rf skills/
# find, not a glob: dotfiles under .drupalaibp/ must be cleared too.
find .drupalaibp -mindepth 1 -maxdepth 1 -print | while IFS= read -r f; do
  case "$(basename "$f")" in
    evals|evals.json|source-evals.json|setup-evals.sh|arm-source-bed.sh|finalize-evals.sh) ;;  # keep
    *) rm -rf "$f" ;;
  esac
done

# 4. Baseline commit staging - identical to finalize-project.sh.
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "No git repository found; skipping baseline commit." >&2
  exit 0
fi

if [ -n "$(git log --oneline -1 2>/dev/null)" ]; then
  echo "Repository already has commits; skipping baseline commit."
  exit 0
fi

# Keep the eval tree out of the bed's git history. The web container sees
# it masked (tmpfs, .ddev/docker-compose.abp-eval.yaml), but a baseline
# commit made before the mask - or any later host-side commit - would put
# the datasets, rubrics and calibrated fixtures (the answer key) into a
# repo the SUT can read via `git show`. The generated compose file is
# machine-specific on top of that. Belt and braces with the mask: either
# alone can be absent (mask not yet applied, or a re-run without docker).
if ! grep -q '^/\.drupalaibp/evals/' .gitignore 2>/dev/null; then
  printf '\n%s\n%s\n%s\n' \
    "# Eval harness: never in bed history (the SUT reads history via git show)." \
    "/.drupalaibp/evals/" \
    "/.ddev/docker-compose.abp-eval.yaml" >> .gitignore
  echo "Excluded the eval tree from the bed's git history (.gitignore)."
fi

echo "Staging initial scaffold baseline..."
git add -A
