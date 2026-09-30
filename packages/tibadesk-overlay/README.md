# TibaDesk overlays

`apps/` is gitignored, so everything you change in an imported app is invisible
to git and is destroyed by `bin/sync-apps.sh`. This directory is the answer:
it holds, verbatim, every file that differs from its upstream source.

## The model

1. An app is imported from an upstream source repository (`Medicore`, `bestvision`,
   `Phermex`) by `bin/sync-apps.sh`, which runs `rsync -a --delete`.
2. The TibaDesk customisations live here, as `packages/tibadesk-overlay/<app>/`.
3. Every sync re-applies the overlay afterwards, so a re-sync is safe and
   idempotent. The sources are only ever read.

| app | source repository | overlay |
| --- | --- | --- |
| pharmacy | `Phermex/pharmex-app` | `pharmacy/` (145 files) |
| dental | `Medicore` | `dental/` (28 files) |
| eye | `bestvision` | `eye/` (22 files) |

The overlays carry the TibaDesk single sign-on layer (`app/Support/TibadeskSso/`,
`app/Http/Controllers/Auth/SsoController.php`, `config/tibadesk_sso.php`, the
identity migration) plus each app's rebrand and mount changes.

## Editing an app

Edit in `apps/`, then record the change:

```bash
apps/pharmacy/...            # make the change
bin/capture-overlay.sh pharmacy /home/dickson/Documents/Work/Phermex/pharmex-app
git add packages/tibadesk-overlay && git commit -m "..."
```

`capture-overlay.sh` diffs the app against its upstream source and rewrites the
overlay from what it finds — both modified files and files TibaDesk added. It
excludes dependencies, build output, caches, `.env`, and `*.sqlite` databases,
because those are regenerated or are local state.

**Edit the overlay, not `apps/`, for anything that must survive a sync.** An
edit made only in `apps/` is drift.

## Checking for drift

```bash
bin/sync-apps.sh --verify
```

Prints `overlay clean` per app, or lists every file that has drifted. This
changes nothing. Run it before a re-sync to catch edits made in `apps/` that
have not been captured yet.

## What is deliberately not in an overlay

- `vendor/`, `node_modules/` — rebuilt from each app's own lockfiles
- `dashboard/dist/`, `public/dashboard/`, `public/build/` — build output;
  regenerate with `npm ci && npm run build`, then copy the SPA to
  `public/dashboard/`
- `storage/`, `bootstrap/cache/` — runtime state
- `.env` — real credentials, never copied
- `*.sqlite`, `*.db` — local databases

An overlay stores *source*. If you change a build or a lockfile, commit that
decision somewhere it survives: the app's own source repository, or this repo's
build/deploy step.

## Local dev stack

```bash
bin/serve-dev.sh          # start website :8000, ERP :8010, pharmacy :8011
bin/serve-dev.sh --stop
```

`PHP_CLI_SERVER_WORKERS` is required. Without it `php artisan serve` is single
threaded and one slow request makes every other client on the proxy chain see a
502. This is a development convenience, not a production server.
