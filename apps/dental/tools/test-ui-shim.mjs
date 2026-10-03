/**
 * Smoke test for the MUI compatibility shim.
 *
 * Run with: node --experimental-vm-modules tools/test-ui-shim.mjs
 * Verifies sx translation, the colour-ramp and icon modules, and the exported
 * component surface, without needing a browser or a test runner.
 */

import assert from "node:assert/strict";

// Minimal DOM shim: the sx compiler injects a <style> element on demand.
const styleSheets = [];
globalThis.document = {
  head: { appendChild: (el) => styleSheets.push(el) },
  getElementById: (id) => styleSheets.find((s) => s.id === id) || null,
  createElement: (tag) => ({ tagName: tag, id: "", isConnected: true, appendChild() {} }),
  createTextNode: (text) => ({ text }),
};

const { sxToProps, sxToStyle, resolveColor } = await import("../resources/js/components/ui/sx.js");

let passed = 0;
const check = (name, fn) => {
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error(`FAIL  ${name}\n      ${error.message}`);
    process.exitCode = 1;
  }
};

/* --- sx -> inline style conversion --- */

check("spacing multiplies by 8px", () => {
  assert.deepEqual(sxToStyle({ mb: 2, p: 1 }), {
    marginBottom: "16px",
    padding: "8px",
  });
});

check("directional spacing maps to longhand", () => {
  assert.deepEqual(sxToStyle({ mt: 1, ml: 3 }), { marginTop: "8px", marginLeft: "24px" });
});

check("unitless props do not get px", () => {
  assert.deepEqual(sxToStyle({ fontWeight: 700, opacity: 0.5, zIndex: 3 }), {
    fontWeight: 700,
    opacity: 0.5,
    zIndex: 3,
  });
});

check("box values get px", () => {
  assert.deepEqual(sxToStyle({ width: 100, height: "50%" }), {
    width: "100px",
    height: "50%",
  });
});

check("flex props pass through", () => {
  assert.deepEqual(sxToStyle({ display: "flex", gap: 2, alignItems: "center" }), {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  });
});

check("palette tokens resolve", () => {
  assert.equal(resolveColor("primary.main"), "#2D4EA8");
  assert.equal(resolveColor("text.secondary"), "#5A5A63");
  assert.equal(resolveColor("divider"), "#EEEEEF");
  assert.equal(resolveColor("warning.main"), "#D9822B");
  assert.equal(resolveColor("error.main"), "#D64545");
  assert.equal(resolveColor("background.default"), "#EEEEEE");
});

check("literal colours and keywords survive", () => {
  assert.equal(resolveColor("#ff0000"), "#ff0000");
  assert.equal(resolveColor("transparent"), "transparent");
  assert.equal(resolveColor("currentColor"), "currentColor");
});

check("color and bgcolor map to CSS", () => {
  assert.deepEqual(sxToStyle({ color: "primary.main", bgcolor: "text.secondary" }), {
    color: "#2D4EA8",
    backgroundColor: "#5A5A63",
  });
});

/* --- sx -> atomic class conversion --- */

check("sx compiles to a deterministic class", () => {
  const a = sxToProps({ mb: 2, display: "flex" });
  const b = sxToProps({ mb: 2, display: "flex" });
  assert.equal(a.className, b.className);
  assert.match(a.className, /mui-sx-/);
  assert.equal(sxToProps(null, "card").className, "card");
});

check("responsive objects produce a class, not a style", () => {
  const { className, style } = sxToProps({ width: { xs: "100%", md: "50%" } });
  assert.match(className, /mui-sx-/);
  assert.equal(style, undefined);
});

check("nested selector objects are handled", () => {
  const { className } = sxToProps({ "&:hover": { color: "primary.main" } });
  assert.match(className, /mui-sx-/);
});

/* --- colour ramps --- */

const colors = await import("../resources/js/components/ui/colors.js");

check("every ramp exposes the MUI 50-900 keys", () => {
  for (const [name, ramp] of Object.entries(colors.colors)) {
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
      assert.ok(ramp[step], `${name}[${step}] missing`);
      assert.equal(typeof ramp[step], "string");
    }
  }
});

check("individual named ramps are exported for import sites", () => {
  for (const name of ["purple", "teal", "orange", "cyan", "pink", "green",
                      "indigo", "lime", "yellow", "red", "deepOrange", "grey", "gray"]) {
    assert.ok(colors[name], `named export ${name} missing`);
  }
});

/* --- icon surface --- */

const icons = await import("../resources/js/components/ui/icons.jsx");

check("icons module exports a component per MUI name", () => {
  const names = Object.keys(icons);
  assert.ok(names.length >= 100, `only ${names.length} icons exported`);
  for (const name of names) {
    assert.equal(typeof icons[name], "function", `${name} is not a component`);
  }
});

check("icons required by the converted pages are present", () => {
  for (const name of ["AddRounded", "DeleteRounded", "EditRounded", "SearchRounded",
                      "FilterAltRounded", "MedicationRounded", "PrintRounded",
                      "Visibility", "VisibilityOff", "CheckCircleRounded",
                      "TrendingUpRounded", "WarningRounded", "InfoRounded",
                      "Person2Rounded", "GroupRounded", "SaveRounded"]) {
    assert.ok(icons[name], `icon ${name} missing`);
  }
});

/* --- primitive surface --- */

const fs = await import("node:fs");
const indexSource = fs.readFileSync(
  new URL("../resources/js/components/ui/index.jsx", import.meta.url),
  "utf8"
);
const exported = new Set(
  [...indexSource.matchAll(/^\s{2}(\w+),$/gm)].map((m) => m[1])
);

check("all MUI components used by pages are exported", () => {
  const required = ["Box", "Grid", "Stack", "Typography", "Card", "CardContent",
                    "CardHeader", "CardActions", "Paper", "Divider", "Button",
                    "IconButton", "Chip", "Tooltip", "Switch", "Checkbox", "Radio",
                    "RadioGroup", "FormControlLabel", "LinearProgress",
                    "CircularProgress", "Skeleton", "Alert", "AlertTitle", "Collapse",
                    "Dialog", "DialogTitle", "DialogContent", "DialogContentText",
                    "DialogActions", "Badge", "List", "ListItem", "ListItemText",
                    "ListItemIcon", "Tabs", "Tab", "Avatar", "ImageList",
                    "ImageListItem", "ImageListItemBar", "FormControl", "Input",
                    "OutlinedInput", "InputLabel", "InputAdornment", "Menu", "MenuItem",
                    "Select", "TextField", "Table", "TableContainer", "TableHead",
                    "TableBody", "TableRow", "TableCell", "TablePagination"];
  const missing = required.filter((n) => !exported.has(n));
  assert.deepEqual(missing, [], `missing exports: ${missing.join(", ")}`);
});

check("shim index imports no MUI", () => {
  assert.ok(!/@mui/.test(indexSource), "index.jsx still references @mui");
});

/* --- no MUI anywhere in the app source --- */

const stylesSource = fs.readFileSync(
  new URL("../resources/js/components/ui/styles.jsx", import.meta.url),
  "utf8"
);
check("styles shim exposes useTheme/alpha/styled", () => {
  assert.match(stylesSource, /export const useTheme/);
  assert.match(stylesSource, /export const alpha/);
  assert.match(stylesSource, /export const styled/);
});

console.log(`\n${passed} checks passed${process.exitCode ? " (with failures)" : ""}`);
