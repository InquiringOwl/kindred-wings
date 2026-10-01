#!/usr/bin/env bash
# Release a new version of Kindred Wings.
#   scripts/release.sh patch "Fixed the junco colors"
#   scripts/release.sh minor "Trees of San Francisco"
#   scripts/release.sh 2.3.0 "Specific version"
# Bumps js/version.js, sw.js and version.json, adds a CHANGELOG entry, commits, tags and pushes.
# GitHub Actions then deploys to Pages, and open copies of the app show an update banner.
set -euo pipefail
cd "$(dirname "$0")/.."

KIND="${1:-}"; NOTES="${2:-}"
[ -n "$KIND" ] && [ -n "$NOTES" ] || { echo 'Usage: scripts/release.sh <patch|minor|major|X.Y.Z> "What changed"'; exit 1; }

git fetch origin --quiet
if [ -n "$(git log HEAD..origin/main --oneline 2>/dev/null)" ]; then
  echo "GitHub has commits this folder doesn't. Run: git pull   (then try again)"; exit 1
fi

CUR=$(sed -nE 's/.*APP_VERSION="([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p' js/version.js)
IFS=. read -r MA MI PA <<< "$CUR"
case "$KIND" in
  patch) V="$MA.$MI.$((PA+1))" ;;
  minor) V="$MA.$((MI+1)).0" ;;
  major) V="$((MA+1)).0.0" ;;
  *) [[ "$KIND" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Version must be patch, minor, major or like 2.1.0"; exit 1; }; V="$KIND" ;;
esac

perl -pi -e "s/const APP_VERSION=\"[^\"]*\"/const APP_VERSION=\"$V\"/" js/version.js
perl -pi -e "s/const VERSION=\"[^\"]*\"/const VERSION=\"$V\"/" sw.js
ESC=$(printf '%s' "$NOTES" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
printf '{\n  "version": "%s",\n  "date": "%s",\n  "notes": "%s"\n}\n' "$V" "$(date +%Y-%m-%d)" "$ESC" > version.json
{ printf '## v%s (%s)\n- %s\n\n' "$V" "$(date +%m/%d/%y)" "$NOTES"; cat CHANGELOG.md; } > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md

git add -A
git commit -m "v$V: $NOTES"
git tag "v$V"
git push
git push origin "v$V"
echo "Released v$V ($CUR → $V). Pages deploys in about a minute: https://inquiringowl.github.io/kindred-wings/"
