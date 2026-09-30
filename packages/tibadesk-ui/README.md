# tibadesk-ui

`tailwind-preset.js` is the shared TibaDesk colour system. It is imported by:

- `apps/pharmacy/dashboard/tailwind.config.js`
- `apps/dental/tailwind.config.js`

The rebrand of an individual app's own files (components, layouts, themes) is not
kept here — those are verbatim copies captured per app under
`../tibadesk-overlay/`. See [../tibadesk-overlay/README.md](../tibadesk-overlay/README.md)
for how to edit and re-apply them.

`css/` and `js/` are empty placeholders with no consumers. Remove them if they
are not planned for use.
