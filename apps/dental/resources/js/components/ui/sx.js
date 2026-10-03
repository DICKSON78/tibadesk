/**
 * Translates MUI `sx` prop objects into real CSS so the Tailwind-based
 * component shims can keep rendering legacy page markup.
 *
 * Two output channels are used:
 *   - plain values become inline React styles (fast, no extra CSS)
 *   - responsive objects (`{ xs: 1, md: 2 }`), pseudo selectors (`"&:hover"`)
 *     and nested media/sibling selectors are compiled into a generated
 *     atomic class and injected once into a shared <style> element
 *
 * Every remaining `sx` usage in this codebase is a static object literal, so
 * no dynamic evaluation is required.
 */

import { appTheme } from "../../themes/app";

const UNITLESS = new Set([
  "flex",
  "flexGrow",
  "flexShrink",
  "fontWeight",
  "lineHeight",
  "opacity",
  "order",
  "zIndex",
  "zoom",
]);

const SPACING = {
  m: "margin",
  mt: "marginTop",
  mr: "marginRight",
  mb: "marginBottom",
  ml: "marginLeft",
  mx: "marginInline",
  my: "marginBlock",
  p: "padding",
  pt: "paddingTop",
  pr: "paddingRight",
  pb: "paddingBottom",
  pl: "paddingLeft",
  px: "paddingInline",
  py: "paddingBlock",
};

const RADIUS = {
  borderRadius: "borderRadius",
  borderTopLeftRadius: "borderTopLeftRadius",
  borderTopRightRadius: "borderTopRightRadius",
  borderBottomLeftRadius: "borderBottomLeftRadius",
  borderBottomRightRadius: "borderBottomRightRadius",
};

const SPACING_UNIT = 8;

/**
 * Populated from the maps below once they are declared. Everything listed here
 * follows MUI's 8px spacing unit, unlike `width`/`top`/etc. which are raw px.
 */
const SPACING_PROPS = new Set([
  ...Object.values(SPACING),
  "gap",
  "rowGap",
  "columnGap",
]);

const BORDER = {
  border: "border",
  borderTop: "borderTop",
  borderRight: "borderRight",
  borderBottom: "borderBottom",
  borderLeft: "borderLeft",
  borderColor: "borderColor",
  borderStyle: "borderStyle",
  borderWidth: "borderWidth",
};

const FLEX = {
  display: "display",
  flexDirection: "flexDirection",
  flexWrap: "flexWrap",
  flexGrow: "flexGrow",
  flexShrink: "flexShrink",
  flex: "flex",
  flexBasis: "flexBasis",
  alignItems: "alignItems",
  alignContent: "alignContent",
  alignSelf: "alignSelf",
  justifyContent: "justifyContent",
  justifyItems: "justifyItems",
  justifySelf: "justifySelf",
  placeItems: "placeItems",
  gap: "gap",
  columnGap: "columnGap",
  rowGap: "rowGap",
  gridTemplateColumns: "gridTemplateColumns",
  gridColumn: "gridColumn",
  gridRow: "gridRow",
  order: "order",
};

const BOX = {
  width: "width",
  height: "height",
  minWidth: "minWidth",
  minHeight: "minHeight",
  maxWidth: "maxWidth",
  maxHeight: "maxHeight",
  position: "position",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  inset: "inset",
  zIndex: "zIndex",
  overflow: "overflow",
  overflowX: "overflowX",
  overflowY: "overflowY",
  opacity: "opacity",
  cursor: "cursor",
  pointerEvents: "pointerEvents",
  userSelect: "userSelect",
  visibility: "visibility",
  content: "content",
  transform: "transform",
  transition: "transition",
  boxShadow: "boxShadow",
  listStyle: "listStyle",
  aspectRatio: "aspectRatio",
  whiteSpace: "whiteSpace",
  wordBreak: "wordBreak",
  verticalAlign: "verticalAlign",
};

const TYPOGRAPHY = {
  fontSize: "fontSize",  fontWeight: "fontWeight",
  fontFamily: "fontFamily",
  fontStyle: "fontStyle",
  lineHeight: "lineHeight",
  letterSpacing: "letterSpacing",
  textAlign: "textAlign",
  textTransform: "textTransform",
  textDecoration: "textDecoration",
  textOverflow: "textOverflow",
  whiteSpace: "whiteSpace",
};

/* ------------------------------------------------------------------ */
/* Value normalisation                                                 */
/* ------------------------------------------------------------------ */

const palettePath = (path) => {
  const value = path
    .split(".")
    .reduce((acc, key) => (acc == null ? acc : acc[key]), appTheme.palette);
  return typeof value === "string" ? value : undefined;
};

/** Resolves palette tokens such as "primary.main" and "text.secondary". */
export const resolveColor = (value) => {
  if (typeof value !== "string") return value;
  if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl")) {
    return value;
  }
  if (value === "currentColor" || value === "inherit" || value === "transparent") {
    return value;
  }
  if (/^[a-z]+\.[a-zA-Z]+$/.test(value)) {
    const resolved = palettePath(value);
    if (resolved) return resolved;
  }
  const flat = palettePath(value);
  if (flat) return flat;
  return value;
};

const toCss = (prop, value) => {
  if (value === null || value === undefined || value === false) return undefined;
  if (typeof value === "number") {
    if (UNITLESS.has(prop)) return value;
    // MUI multiplies spacing-like numbers by the 8px theme spacing unit.
    if (SPACING_PROPS.has(prop)) return `${value * SPACING_UNIT}px`;
    return `${value}px`;
  }
  return String(value);
};

const isBreakpointObject = (value) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).some((k) => ["xs", "sm", "md", "lg", "xl"].includes(k));

const isPseudoSelector = (key) =>
  typeof key === "string" &&
  (key.startsWith("&") || key.startsWith("@") || key.includes("&"));

/* ------------------------------------------------------------------ */
/* Atomic stylesheet                                                   */
/* ------------------------------------------------------------------ */

const styleElId = "mui-sx-atomic-styles";
let styleEl = null;
let counter = 0;

const getStyleEl = () => {
  if (typeof document === "undefined") return null;
  if (!styleEl || !styleEl.isConnected) {
    styleEl = document.getElementById(styleElId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleElId;
      document.head.appendChild(styleEl);
    }
  }
  return styleEl;
};

const MEDIA = {
  xs: "",
  sm: "@media (min-width:600px)",
  md: "@media (min-width:900px)",
  lg: "@media (min-width:1200px)",
  xl: "@media (min-width:1536px)",
};

/** Appends CSS text to the shared sheet. */
const injectCss = (css) => {
  const el = getStyleEl();
  if (!el) return;
  el.appendChild(document.createTextNode(css));
};

const camelToKebab = (prop) => prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const declsToCss = (decls) =>
  Object.entries(decls)
    .filter(([, v]) => v !== undefined)
    .map(([p, v]) => `${camelToKebab(p)}:${v}`)
    .join(";");

const hash = (input) => {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
};

/**
 * Compiles an sx object into a className.
 * Handles responsive objects and nested/pseudo selectors.
 */
const compileToClass = (sx) => {
  const key = JSON.stringify(sx);
  const cacheKey = `mui-sx-${hash(key)}`;
  if (compileToClass.cache?.[cacheKey]) return compileToClass.cache[cacheKey];

  const base = {};
  const rules = [];
  const sorted = Object.entries(sx);

  const buildResponsive = (prop, value) => {
    const merged = {};
    Object.entries(value).forEach(([bp, v]) => {
      const css = toCss(prop, v);
      if (css === undefined) return;
      if (!MEDIA[bp]) {
        merged[prop] = css;
      } else {
        rules.push(`${MEDIA[bp]}{.${cacheKey}{${camelToKebab(prop)}:${css}}}`);
      }
    });
    Object.assign(base, merged);
  };

  sorted.forEach(([key_, value]) => {
    // Nested selector blocks: "& .foo", "&:hover", "@media ..."
    if (isPseudoSelector(key_) && value && typeof value === "object") {
      const inner = resolveToDecls(value);
      if (Object.keys(inner).length) {
        rules.push(`${key_}{.${cacheKey}{${declsToCss(inner)}}}`);
      }
      return;
    }

    let prop;
    if (key_ in SPACING) {
      prop = SPACING[key_];
    } else if (key_ in RADIUS) {
      prop = RADIUS[key_];
    } else if (key_ in BORDER) {
      prop = BORDER[key_];
    } else if (key_ in FLEX) {
      prop = FLEX[key_];
    } else if (key_ in BOX) {
      prop = BOX[key_];
    } else if (key_ in TYPOGRAPHY) {
      prop = TYPOGRAPHY[key_];
    } else if (key_ === "color" || key_ === "bgcolor" || key_ === "backgroundColor") {
      prop = key_ === "color" ? "color" : "backgroundColor";
    } else if (key_ === "background") {
      prop = "background";
    } else {
      prop = key_;
    }

    if (isBreakpointObject(value)) {
      buildResponsive(prop, value);
      return;
    }

    const css =
      prop === "color" || prop === "backgroundColor" || prop === "background"
        ? toCss(prop, resolveColor(value))
        : toCss(prop, value);

    if (css !== undefined) base[prop] = css;
  });

  let css = "";
  if (Object.keys(base).length) css += `.${cacheKey}{${declsToCss(base)}}`;
  injectCss(css + rules.join(""));

  compileToClass.cache = compileToClass.cache || {};
  compileToClass.cache[cacheKey] = cacheKey;
  return cacheKey;
};
compileToClass.cache = {};

/** Recursively flattens nested selector objects into plain declarations. */
const resolveToDecls = (obj) => {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (isPseudoSelector(k)) return; // handled by the caller
    if (k in SPACING) out[SPACING[k]] = toCss(SPACING[k], v);
    else if (k in RADIUS) out[RADIUS[k]] = toCss(RADIUS[k], v);
    else if (k in BORDER) out[BORDER[k]] = toCss(BORDER[k], v);
    else if (k in FLEX) out[FLEX[k]] = toCss(FLEX[k], v);
    else if (k in BOX) out[BOX[k]] = toCss(BOX[k], v);
    else if (k in TYPOGRAPHY) out[TYPOGRAPHY[k]] = toCss(TYPOGRAPHY[k], v);
    else if (k === "color") out.color = toCss("color", resolveColor(v));
    else if (k === "bgcolor") out.backgroundColor = toCss("backgroundColor", resolveColor(v));
    else if (k === "backgroundColor") out.backgroundColor = toCss("backgroundColor", resolveColor(v));
    else if (k === "background") out.background = toCss("background", resolveColor(v));
    else out[k] = toCss(k, v);
  });
  return out;
};

/**
 * Converts an sx object into `{ className, style }` props for a shim component.
 */
export const sxToProps = (sx, baseClassName) => {
  if (!sx) {
    return { className: baseClassName, style: undefined };
  }
  if (typeof sx === "function") {
    // Defensive: a theme callback we can still evaluate.
    try {
      return sxToProps(sx(appTheme), baseClassName);
    } catch {
      return { className: baseClassName, style: undefined };
    }
  }
  return {
    className: [baseClassName, compileToClass(sx)].filter(Boolean).join(" "),
    style: undefined,
  };
};

/** Merges an sx object into a plain style object (for elements already styled inline). */
export const sxToStyle = (sx) => {
  if (!sx) return undefined;
  if (typeof sx === "function") {
    try {
      return sxToStyle(sx(appTheme));
    } catch {
      return undefined;
    }
  }
  const decls = resolveToDecls(sx);
  return Object.keys(decls).length ? decls : undefined;
};

export default sxToProps;
