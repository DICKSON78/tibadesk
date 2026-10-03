"""Repair default imports that the MUI codemod left pointing at named-only modules.

`import { Card } from "@mui/material/Card"` style statements were repointed at the
shim, which only has named exports, and deep per-icon imports became defaults:

    import PlayArrowIcon from "../../components/ui/icons.js";   // undefined

This script rewrites those to named imports and resolves the local alias to an
actual export (PlayArrowIcon -> PlayArrowRounded, Box -> Box, purple -> purple).
"""

import os
import re
import sys

JS_ROOT = os.path.abspath("resources/js")

# Exports available from each shim module.
EXPORTS = {
    "icons.jsx": set(),
    "colors.jsx": set(),
    "index.jsx": set(),
    "styles.jsx": {"useTheme", "alpha", "styled", "createTheme", "ThemeProvider",
                  "withTheme", "css", "keyframes"},
}
with open(os.path.join(JS_ROOT, "components", "ui", "icons.jsx")) as fh:
    EXPORTS["icons.jsx"] = set(re.findall(r"^export const (\w+)", fh.read(), re.M))
with open(os.path.join(JS_ROOT, "components", "ui", "colors.js")) as fh:
    EXPORTS["colors.js"] = set(re.findall(r"^export const (\w+)", fh.read(), re.M))
with open(os.path.join(JS_ROOT, "components", "ui", "index.jsx")) as fh:
    EXPORTS["index.jsx"] = set(re.findall(r"^\s{2}(\w+),$", fh.read(), re.M))

DEFAULT_RE = re.compile(
    r'^import\s+(?P<local>[A-Za-z_$][\w$]*)\s+from\s+(?P<q>["\'])(?P<path>[^"\']+)'
    r'(?P=q)\s*;?\s*$',
    re.M,
)


def module_key(path):
    tail = path.rsplit("/", 1)[-1]
    return tail if tail in EXPORTS else None


def resolve(local, exports):
    """Map a local alias onto a real export name."""
    if local in exports:
        return local
    base = re.sub(r"Icon$", "", local)
    for candidate in (base, f"{base}Rounded", f"{base}Outlined", f"{base}Sharp",
                      f"{base}TwoTone", f"{base}OutlinedRounded"):
        if candidate in exports:
            return candidate
    # Longest shared prefix, then shortest name for stability.
    matches = [e for e in exports if base and (e.startswith(base) or base.startswith(e))]
    if matches:
        matches.sort(key=lambda e: (-len(e), e))
        return matches[0]
    return None


def process(path):
    src = open(path).read()
    if "components/ui" not in src and "./ui/" not in src:
        return None

    renamed = {}          # (module_key) -> {local: export}
    per_file = []         # emitted import statements

    def flush():
        for key, mapping in renamed.items():
            if not mapping:
                continue
            spec = rel_spec(key, path)
            pairs = ", ".join(
                local if local == export else f"{export} as {local}"
                for local, export in sorted(mapping.items())
            )
            per_file.append(f'import {{ {pairs} }} from "{spec}";')
        renamed.clear()

    for match in DEFAULT_RE.finditer(src):
        local = match.group("local")
        key = module_key(match.group("path"))
        if key is None:
            continue
        export = resolve(local, EXPORTS[key])
        if export is None:
            print(f"  UNRESOLVED {local} in {key} ({os.path.relpath(path, JS_ROOT)})",
                  file=sys.stderr)
            continue
        renamed.setdefault(key, {})[local] = export

    if not renamed:
        return None

    # Remove the offending default-import lines, then insert one named import per module.
    kept = []
    for line in src.splitlines(keepends=True):
        m = DEFAULT_RE.match(line.rstrip("\n"))
        if m and module_key(m.group("path")) is not None:
            continue
        kept.append(line)

    flush()
    out = "".join(kept)
    lines = out.splitlines(keepends=True)

    # Insert after the complete leading import block, i.e. after the last import
    # statement (which may span several lines) that appears before any other code.
    last_import_end = 0
    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        if not stripped:
            i += 1
            continue
        if stripped.startswith("import "):
            # Walk to the statement's terminating semicolon line.
            while i < len(lines) and ";" not in lines[i]:
                i += 1
            i += 1
            last_import_end = i
            continue
        break

    merged = (
        "".join(lines[:last_import_end])
        + "\n".join(per_file)
        + "\n"
        + "".join(lines[last_import_end:])
    )
    return merged


def rel_spec(key, source):
    target = os.path.join(JS_ROOT, "components", "ui", key)
    rel = os.path.relpath(target, os.path.dirname(source))
    return rel if rel.startswith(".") else f"./{rel}"


def main():
    files = []
    for root in ("pages", "components", "layouts"):
        for dirpath, _d, filenames in os.walk(os.path.join(JS_ROOT, root)):
            files += [os.path.join(dirpath, f) for f in filenames
                      if f.endswith((".jsx", ".js"))]
    files += [os.path.join(JS_ROOT, f) for f in os.listdir(JS_ROOT)
              if f.endswith((".jsx", ".js"))]

    changed = 0
    for path in files:
        out = process(path)
        if out is not None:
            open(path, "w").write(out)
            changed += 1
    print(f"repaired default imports in {changed} files")


if __name__ == "__main__":
    main()
