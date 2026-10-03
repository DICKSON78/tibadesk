"""Repoint `@mui/*` imports at the Tailwind component shim.

Rewrites module specifiers only, leaving every JSX usage untouched:

    @mui/material            -> <rel>/components/ui        (index.jsx)
    @mui/material/<Name>     -> <rel>/components/ui        (deep per-component import)
    @mui/icons-material      -> <rel>/components/ui/icons
    @mui/material/colors     -> <rel>/components/ui/colors
    @mui/material/styles     -> <rel>/components/ui/styles

`@mui/x-date-pickers` is deliberately left alone: the DatePicker shim is built by
hand because the MUI one relies on adapter/typing behaviour.
"""

import os
import re
import sys

JS_ROOT = os.path.abspath("resources/js")
UI = os.path.join(JS_ROOT, "components", "ui")

TARGETS = {
    "@mui/material": os.path.join(UI, "index.jsx"),
    "@mui/icons-material": os.path.join(UI, "icons.jsx"),
    "@mui/material/colors": os.path.join(UI, "colors.js"),
    "@mui/material/styles": os.path.join(UI, "styles.jsx"),
}

# Deep imports are rewritten by pattern, but only for the two subpackages that
# re-export individual components; `colors`/`styles` have their own targets.
DEEP_PREFIXES = {
    "@mui/material": os.path.join(UI, "index.jsx"),
    "@mui/icons-material": os.path.join(UI, "icons.jsx"),
}

# Longest specifier first so "styles"/"colors" win over the bare package.
ORDER = sorted(TARGETS, key=len, reverse=True)


def rel_specifier(target, source):
    rel = os.path.relpath(target, os.path.dirname(source))
    return rel if rel.startswith(".") else f"./{rel}"


def collect_files():
    roots = ["pages", "components", "layouts", "contexts", "hooks"]
    files = []
    for root in roots:
        base = os.path.join(JS_ROOT, root)
        for dirpath, _dirnames, filenames in os.walk(base):
            for name in filenames:
                if name.endswith((".jsx", ".js")):
                    files.append(os.path.join(dirpath, name))
    for name in os.listdir(JS_ROOT):
        if name.endswith((".jsx", ".js")):
            files.append(os.path.join(JS_ROOT, name))
    return files


def main():
    check = "--check" in sys.argv
    changed = []
    skipped_datepicker = []

    for path in collect_files():
        src = open(path).read()
        if "@mui" not in src:
            continue

        out = src
        for spec in ORDER:
            target = TARGETS[spec]
            replacement = rel_specifier(target, path)
            out = re.sub(
                rf'([\'"]){re.escape(spec)}([\'"])', rf'\g<1>{replacement}\g<2>', out
            )

        # Deep per-component imports, e.g. `@mui/material/Card`.
        for prefix, target in DEEP_PREFIXES.items():
            replacement = rel_specifier(target, path)
            out = re.sub(
                rf'([\'"]){re.escape(prefix)}/(?!colors|styles)([A-Za-z]\w*)([\'"])',
                rf'\g<1>{replacement}\g<3>',
                out,
            )

        if "@mui/x-date-pickers" in out:
            skipped_datepicker.append(path)

        remaining = re.findall(r'from\s*["\'](@mui[^"\']*)["\']', out)
        if remaining:
            print(f"UNMAPPED in {os.path.relpath(path, JS_ROOT)}: {sorted(set(remaining))}",
                  file=sys.stderr)

        if out != src:
            changed.append(os.path.relpath(path, JS_ROOT))
            if not check:
                open(path, "w").write(out)

    print(f"{'would rewrite' if check else 'rewrote'} {len(changed)} files")
    if skipped_datepicker:
        print("still referencing @mui/x-date-pickers:")
        for p in skipped_datepicker:
            print(f"  {os.path.relpath(p, JS_ROOT)}")


if __name__ == "__main__":
    main()
