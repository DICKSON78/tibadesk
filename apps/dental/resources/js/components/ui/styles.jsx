/**
 * Drop-in replacements for the handful of `@mui/material/styles` exports still
 * referenced by pages: `useTheme`, `alpha`, `styled`, `createTheme`,
 * `ThemeProvider`, `css` and `keyframes`.
 *
 * They are backed by the shared TibaDesk tokens in `themes/app.js`, so any page
 * that is still mid-migration reads the new brand colours.
 */

import React, { createContext, useContext, useMemo } from "react";
import { appTheme, alpha as alphaColor } from "../../themes/app";
import { sxToProps } from "./sx";

const ThemeContext = createContext(appTheme);

export const useTheme = () => useContext(ThemeContext);

export const alpha = alphaColor;

export const createTheme = (overrides) => {
  if (!overrides) return appTheme;
  const { palette: p, typography: t, shape: s, ...rest } = overrides;
  return {
    ...appTheme,
    ...rest,
    palette: {
      ...appTheme.palette,
      ...(p || {}),
      ...(p
        ? Object.fromEntries(
            Object.entries(p).map(([k, v]) => [
              k,
              v && typeof v === "object" && !Array.isArray(v)
                ? { ...(appTheme.palette[k] || {}), ...v }
                : v,
            ])
          )
        : {}),
    },
    typography: { ...appTheme.typography, ...(t || {}) },
    shape: { ...appTheme.shape, ...(s || {}) },
  };
};

/** A no-op provider kept for source compatibility; tokens are static. */
export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={appTheme}>{children}</ThemeContext.Provider>
);

export const withTheme = (Component) => (props) => (
  <Component {...props} theme={appTheme} />
);

/** `keyframes` is accepted but emitted as a plain animation name. */
export const keyframes = (strings, ...values) => {
  const css =
    typeof strings === "function"
      ? strings(appTheme)
      : Array.isArray(strings)
        ? strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "")
        : String(strings);
  const name = `kf-${Math.abs(
    [...css].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)
  ).toString(36)}`;
  if (typeof document !== "undefined") {
    const id = "mui-sx-keyframes";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.appendChild(document.createTextNode(`@keyframes ${name}{${css}}`));
  }
  return name;
};

/** `css` helper: returns a style object usable via sxToProps. */
export const css = (strings, ...values) => ({
  __raw:
    typeof strings === "function"
      ? strings(appTheme)
      : Array.isArray(strings)
        ? strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "")
        : String(strings),
});

/**
 * Minimal `styled` implementation.
 *
 * Supports the single pattern still present in this codebase:
 *   styled(Box, { shouldForwardProp })(({ theme, ...ownProps }) => ({ ...css }))
 */
export const styled = (Component, options = {}) => (...styles) => {
  const Wrapped = ({ children, ...props }) => {
    const { theme: _ignored, ...ownProps } = props;
    const resolved = styles.map((s) =>
      typeof s === "function" ? s({ theme: appTheme, ...ownProps }) : s
    );
    const sxObject = resolved.find(
      (r) => r && typeof r === "object" && !r.__raw
    );
    const rawCss = resolved.find((r) => r && r.__raw)?.__raw;

    if (rawCss) {
      return <Component {...ownProps}>{children}</Component>;
    }
    if (!sxObject) {
      return <Component {...ownProps}>{children}</Component>;
    }

    const { className, style } = sxToProps(sxObject);
    return (
      <Component
        {...ownProps}
        className={[className, ownProps.className].filter(Boolean).join(" ")}
        style={{ ...ownProps.style, ...style }}
      >
        {children}
      </Component>
    );
  };
  Wrapped.displayName = `Styled(${
    Component?.displayName || Component?.name || "Component"
  })`;
  return Wrapped;
};

export default {
  useTheme,
  alpha,
  createTheme,
  ThemeProvider,
  withTheme,
  keyframes,
  css,
  styled,
};
