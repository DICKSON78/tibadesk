#!/usr/bin/env bash
#
# Start (or stop) the TibaDesk local dev stack: ERP -> pharmacy -> dental -> eye.
#
# This is a development convenience only. `php artisan serve` is not a
# production server; use PHP-FPM, Octane or Laravel Cloud for anything real.
#
#   bin/serve-dev.sh          restart the stack and report health
#   bin/serve-dev.sh --stop   stop all of them
#
# PHP_CLI_SERVER_WORKERS is not optional. The built-in server is single
# threaded without it, so one slow request (a large built asset, a test run)
# makes every other client on the proxy chain see a 502.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ERP_DIR="${ERP_DIR:-$REPO_ROOT}"
PHARMACY_DIR="${PHARMACY_DIR:-$ERP_DIR/apps/pharmacy}"
DENTAL_DIR="${DENTAL_DIR:-$ERP_DIR/apps/dental}"
EYE_DIR="${EYE_DIR:-$ERP_DIR/apps/eye}"
LOG_DIR="${LOG_DIR:-/tmp/tibadesk-logs}"

ERP_PORT="${ERP_PORT:-8000}"
PHARMACY_PORT="${PHARMACY_PORT:-8011}"
DENTAL_PORT="${DENTAL_PORT:-8012}"
EYE_PORT="${EYE_PORT:-8013}"
WORKERS="${WORKERS:-10}"

# name:port:directory
STACK=(
    "erp:$ERP_PORT:$ERP_DIR"
    "pharmacy:$PHARMACY_PORT:$PHARMACY_DIR"
    "dental:$DENTAL_PORT:$DENTAL_DIR"
    "eye:$EYE_PORT:$EYE_DIR"
)

port_pid() {
    ss -lptn "sport = :$1" 2>/dev/null \
        | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2
}

stop() {
    local entry name port dir pid
    for entry in "${STACK[@]}"; do
        IFS=: read -r name port dir <<< "$entry"
        pid="$(port_pid "$port")"
        if [ -n "$pid" ]; then
            kill "$pid" 2>/dev/null
            printf '  %-9s :%s stopped\n' "$name" "$port"
        else
            printf '  %-9s :%s not running\n' "$name" "$port"
        fi
    done
}

if [ "${1:-}" = "--stop" ]; then
    stop
    exit 0
fi

for entry in "${STACK[@]}"; do
    IFS=: read -r name port dir <<< "$entry"
    if [ ! -d "$dir" ]; then
        echo "!! missing app directory for $name: $dir" >&2
        exit 1
    fi
done

mkdir -p "$LOG_DIR"

for entry in "${STACK[@]}"; do
    IFS=: read -r name port dir <<< "$entry"
    pid="$(port_pid "$port")"
    if [ -n "$pid" ]; then
        kill "$pid" 2>/dev/null
        sleep 1
    fi
    (
        cd "$dir" || exit 1
        PHP_CLI_SERVER_WORKERS="$WORKERS" setsid nohup \
            php artisan serve --host=127.0.0.1 --port="$port" \
            > "$LOG_DIR/$name.log" 2>&1 < /dev/null &
    )
done

sleep 4

status=0
for entry in "${STACK[@]}"; do
    IFS=: read -r name port dir <<< "$entry"
    printf '  %-9s :%s => ' "$name" "$port"
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
        "http://127.0.0.1:$port/" || echo DEAD)"
    echo "$code"
    case "$code" in
        DEAD | 000) status=1 ;;
    esac
done

echo
echo "Logs: $LOG_DIR/{erp,pharmacy,dental,eye}.log"
[ "$status" -eq 0 ] || echo "At least one service is not responding." >&2
exit "$status"
