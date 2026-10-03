#!/usr/bin/env bash
#
# Capture the TibaDesk customisations for one app into a tracked overlay.
#
# apps/ is gitignored, so anything edited in place there is invisible to git
# and is destroyed by bin/sync-apps.sh. This script snapshots the files that
# differ from the upstream source into packages/tibadesk-overlay/<app>/ so the
# work is reviewable, committable, and re-appliable after a re-sync.
#
# Run it after editing an app in apps/ to record those changes.
#
# Usage: bin/capture-overlay.sh <app-name> <source-path>

set -euo pipefail

if [ $# -ne 2 ]; then
    echo "Usage: bin/capture-overlay.sh <app-name> <source-path>" >&2
    exit 1
fi

NAME="$1"
SRC="$(cd "$2" && pwd)"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CPY="$REPO_ROOT/apps/$NAME"
OVL="$REPO_ROOT/packages/tibadesk-overlay/$NAME"
MANIFEST="$REPO_ROOT/packages/tibadesk-overlay/$NAME.manifest"

if [ ! -d "$SRC" ]; then
    echo "!! missing source: $SRC" >&2
    exit 1
fi

if [ ! -d "$CPY" ]; then
    echo "!! $CPY does not exist — run bin/sync-apps.sh first" >&2
    exit 1
fi

# Build output, dependencies, caches and local env are regenerated or
# deliberately excluded, so they never belong in an overlay.
SKIP_DIRS=(
    ".git" "node_modules" "vendor" "dist" "build" "storage"
    "test-results" "playwright-report" "public/dashboard" "public/build"
    "public/hot" "public/storage" "bootstrap/cache"
)

SKIP_NAMES=(
    ".DS_Store" ".env" ".env.backup" "*.sql" "*.log"
    ".phpunit.result.cache" ".php-cs-fixer.cache"
    "*.sqlite" "*.sqlite3" "*.db"
)

list_files() {
    local root="$1" dir name
    local -a prune=()
    for dir in "${SKIP_DIRS[@]}"; do
        prune+=(-o -path "$root/*/$dir" -o -path "$root/$dir")
    done
    for name in "${SKIP_NAMES[@]}"; do
        prune+=(-o -name "$name")
    done
    find "$root" \( "${prune[@]:1}" \) -prune -o -type f -printf "%P\n" | sort
}

# Everything present in apps/ but absent upstream is a TibaDesk addition.
comm -13 <(list_files "$SRC") <(list_files "$CPY") > "$MANIFEST.new"

# Everything present in both that differs is a TibaDesk modification.
while read -r rel; do
    [ -z "$rel" ] && continue
    if ! cmp -s "$SRC/$rel" "$CPY/$rel" 2>/dev/null; then
        echo "$rel" >> "$MANIFEST.new"
    fi
done < <(comm -12 <(list_files "$SRC") <(list_files "$CPY"))

sort -u -o "$MANIFEST.new" "$MANIFEST.new"
mv "$MANIFEST.new" "$MANIFEST"

rm -rf "$OVL"
count=0
while read -r rel; do
    [ -z "$rel" ] && continue
    mkdir -p "$OVL/$(dirname "$rel")"
    cp -p "$CPY/$rel" "$OVL/$rel"
    count=$((count + 1))
done < "$MANIFEST"

printf '%s: captured %d file(s), %s\n' "$NAME" "$count" "$(du -sh "$OVL" | cut -f1)"
  echo "Review with: git status -- packages/tibadesk-overlay/$NAME.manifest packages/tibadesk-overlay/$NAME/"
