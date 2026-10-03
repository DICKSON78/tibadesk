#!/usr/bin/env bash
#
# Re-sync the imported applications into apps/.
#
# apps/ is gitignored, so this script is the record of how each copy was made.
# Run it after pulling changes in a source repository. The TibaDesk
# customisations are NOT kept in apps/ — they live in
# packages/tibadesk-overlay/<app>/ and this script re-applies them on every
# sync, so a re-sync can never silently drop them.
#
# The sources are only ever read. Nothing here writes to a source repository.
#
# Usage:
#   bin/sync-apps.sh            re-sync every app, then re-apply overlays
#   bin/sync-apps.sh --verify   report overlay drift, change nothing

set -euo pipefail

SOURCE_ROOT="${SOURCE_ROOT:-/home/dickson/Documents/Work}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPS_DIR="$REPO_ROOT/apps"
OVERLAY_ROOT="$REPO_ROOT/packages/tibadesk-overlay"

MODE="sync"
[ "${1:-}" = "--verify" ] && MODE="verify"

copy_app() {
    local src="$1" name="$2"

    if [ ! -d "$src" ]; then
        echo "  !! missing source: $src" >&2
        return 1
    fi

    mkdir -p "$APPS_DIR/$name"

    # Excluded on purpose:
    #   .env                 real credentials, never copied
    #   node_modules/vendor  rebuilt from each app's own lockfiles
    #   dist/, public/build,
    #   public/dashboard/    build output, not source. The last is the copy of
    #                         the SPA that Laravel serves; it is regenerated on
    #                         deploy, and the version checked in is stale.
    #   storage/*            logs, sessions and compiled views
    #   *.sql                a 17 MB patient data dump living at the repo root
    #   TibaDesk-erp/        a stale nested copy of this repository that two of
    #                        the source repos carry. It is not part of either
    #                        application, and mirroring it would put a second
    #                        copy of this repo — including its overlays — inside
    #                        every one of them.
    #
    # node_modules is excluded too, so run `npm ci` inside an app before
    # building it. The pharmacy dashboard's tree alone is about 250 MB, which
    # is more than the whole point of keeping this directory out of git.
    rsync -a --delete \
        --exclude='.git/' \
        --exclude='TibaDesk-erp/' \
        --exclude='node_modules/' \
        --exclude='vendor/' \
        --exclude='.env' \
        --exclude='.env.backup' \
        --exclude='.phpunit.result.cache' \
        --exclude='.php-cs-fixer.cache' \
        --exclude='bootstrap/cache/*.php' \
        --exclude='public/build/' \
        --exclude='public/hot' \
        --exclude='public/storage/' \
        --exclude='dist/' \
        --exclude='public/dashboard/' \
        --exclude='test-results/' \
        --exclude='playwright-report/' \
        --exclude='storage/logs/' \
        --exclude='storage/framework/cache/' \
        --exclude='storage/framework/sessions/' \
        --exclude='storage/framework/testing/' \
        --exclude='storage/framework/views/' \
        --exclude='storage/app/public/' \
        --exclude='*.log' \
        --exclude='.DS_Store' \
        --exclude='*.sql' \
        "$src/" "$APPS_DIR/$name/"

    # Restore the writable directories a Laravel app needs at runtime, which
    # rsync's exclude list necessarily skips.
    mkdir -p \
        "$APPS_DIR/$name/storage/framework/cache/data" \
        "$APPS_DIR/$name/storage/framework/sessions" \
        "$APPS_DIR/$name/storage/framework/views" \
        "$APPS_DIR/$name/storage/framework/testing" \
        "$APPS_DIR/$name/storage/logs" \
        "$APPS_DIR/$name/storage/app/public" \
        "$APPS_DIR/$name/bootstrap/cache"

    for dir in storage/framework/cache storage/framework/sessions storage/framework/views \
        storage/framework/testing storage/logs storage/app/public bootstrap/cache; do
        printf '*\n!.gitignore\n' > "$APPS_DIR/$name/$dir/.gitignore"
    done

    printf '  %-9s %s\n' "$name" "$(du -sh "$APPS_DIR/$name" | cut -f1)"
}

# Every TibaDesk customisation for an app: the files that differ from the
# upstream source, stored verbatim. Build output (dashboard/dist,
# public/dashboard) is deliberately absent — `npm run build` regenerates it.
apply_overlay() {
    local name="$1"
    local ovl="$OVERLAY_ROOT/$name"

    if [ ! -d "$ovl" ]; then
        printf '  %-9s no overlay yet (upstream copy only)\n' "$name"
        return 0
    fi

    local count=0
    while IFS= read -r -d '' rel; do
        mkdir -p "$APPS_DIR/$name/$(dirname "$rel")"
        cp -p "$ovl/$rel" "$APPS_DIR/$name/$rel"
        count=$((count + 1))
    done < <(cd "$ovl" && find . -type f -print0)

    printf '  %-9s overlay re-applied (%d files)\n' "$name" "$count"
}

# Removals: upstream files this integration deliberately does not ship.
#
# An overlay can only add or overwrite files, so a file that has to *disappear*
# has nowhere to live in the mirrored tree above — and copy_app's rsync would
# restore it on every sync. The list of paths to delete therefore lives beside
# the overlay, in <app>.removals, one app-relative path per line. Blank lines
# and lines starting with # are ignored.
#
# This is not a convenience: eye is a module inside TibaDesk rather than a
# product with its own public face, and its sixteen marketing pages would
# otherwise reappear on the next sync and put a second website back on screen.
apply_removals() {
    local name="$1"
    local list="$OVERLAY_ROOT/$name.removals"
    local removed=0 skipped=0 rel

    if [ ! -f "$list" ]; then
        return 0
    fi

    while IFS= read -r rel || [ -n "$rel" ]; do
        case "$rel" in
            ''|'#'*) continue ;;
        esac

        # A committed list is still an input to rm -rf, so it is not trusted
        # blindly: an absolute path or a parent reference could delete outside
        # this app's directory, which is exactly the kind of thing that turns a
        # routine sync into an incident.
        case "$rel" in
            /*|*..*)
                printf '  ! %-9s refusing unsafe removal path: %s\n' "$name" "$rel" >&2
                skipped=$((skipped + 1))
                continue
                ;;
        esac

        if [ -e "$APPS_DIR/$name/$rel" ]; then
            rm -rf "${APPS_DIR:?}/$name/$rel"
            removed=$((removed + 1))
        fi
    done < "$list"

    if [ "$removed" -gt 0 ] || [ "$skipped" -gt 0 ]; then
        printf '  %-9s removals applied (%d removed' "$name" "$removed"
        [ "$skipped" -gt 0 ] && printf ', %d skipped' "$skipped"
        printf ')\n'
    fi
}

# Drift = an overlay file that no longer matches what is on disk in apps/.
# This is what catches hand edits made directly in apps/ that would be lost on
# the next sync.
verify_overlay() {
    local name="$1"
    local ovl="$OVERLAY_ROOT/$name" list="$OVERLAY_ROOT/$name.removals"
    local drift=0 rel

    if [ ! -d "$ovl" ] && [ ! -f "$list" ]; then
        printf '  %-9s no overlay\n' "$name"
        return 0
    fi

    while IFS= read -r -d '' rel; do
        if ! cmp -s "$ovl/$rel" "$APPS_DIR/$name/$rel" 2>/dev/null; then
            printf '  %-9s drift: %s\n' "$name" "$rel"
            drift=$((drift + 1))
        fi
    done < <(cd "$ovl" 2>/dev/null && find . -type f -print0)

    # A removed file that is back is drift too, and a more confusing one: it
    # looks like the removal never happened rather than like something to
    # re-apply.
    while IFS= read -r rel || [ -n "$rel" ]; do
        case "$rel" in
            ''|'#'*|/*|*..*) continue ;;
        esac

        if [ -e "$APPS_DIR/$name/$rel" ]; then
            printf '  %-9s restored upstream file that should be removed: %s\n' "$name" "$rel"
            drift=$((drift + 1))
        fi
    done < <([ -f "$list" ] && cat "$list")

    if [ "$drift" -eq 0 ]; then
        printf '  %-9s overlay clean\n' "$name"
    else
        printf '  %-9s %d file(s) drifted — re-apply with bin/sync-apps.sh\n' "$name" "$drift"
    fi
}

if [ "$MODE" = "verify" ]; then
    echo "Verifying overlays against $APPS_DIR (no changes will be made):"
    verify_overlay pharmacy
    verify_overlay dental
    verify_overlay eye
    exit 0
fi

echo "Syncing imported applications from $SOURCE_ROOT"

copy_app "$SOURCE_ROOT/Phermex/pharmex-app" pharmacy
copy_app "$SOURCE_ROOT/Medicore" dental
copy_app "$SOURCE_ROOT/bestvision" eye

echo
echo "Re-applying TibaDesk overlays:"
apply_overlay pharmacy
apply_overlay dental
apply_overlay eye

echo
echo "Applying TibaDesk removals:"
apply_removals pharmacy
apply_removals dental
apply_removals eye

echo
echo "Done. Overlays live in packages/tibadesk-overlay/ and are re-applied"
echo "automatically on every sync. Edit the overlay, not apps/."
echo "Files the integration does not ship are listed in <app>.removals."
echo "Check for drift with: bin/sync-apps.sh --verify"
