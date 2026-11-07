#!/usr/bin/env bash
# Removes the dev "Preview" button before a PR merges (coding-conventions): every line marked DEV-PREVIEW in mobile/src/app/.
set -euo pipefail
cd "$(dirname "$0")/../.."
files=$(grep -rl 'DEV-PREVIEW' src/app || true)
if [ -z "$files" ]; then echo "no DEV-PREVIEW lines"; exit 0; fi
for f in $files; do
  perl -ni -e 'print unless /DEV-PREVIEW/' "$f"
  echo "cleaned $f"
done
