/**
 * Shared design tokens for charts and canvas-rendered surfaces.
 *
 * These replace the former MUI `useTheme()` hook and `@mui/material/colors`
 * imports. The object shapes intentionally mirror the subset of the old MUI
 * API that pages relied on (`palette.text.primary`, `palette.divider`,
 * `palette.warning.main`, `typography.fontFamily`, plus a ramp lookup such as
 * `colors.teal[400]`) so existing chart option objects keep working.
 *
 * Hues are tuned to sit alongside the TibaDesk palette (navy #010736,
 * azure #2D4EA8) rather than MUI's defaults.
 */

const ramp = (h, s, l) => ({
  50: `hsl(${h} ${s}% ${l + 0.96 * 100 - 96}%)`,
  100: `hsl(${h} ${s}% ${l + 0.9 * 100 - 90}%)`,
  200: `hsl(${h} ${s}% ${l + 0.8 * 100 - 80}%)`,
  300: `hsl(${h} ${s}% ${l + 0.6 * 100 - 60}%)`,
  400: `hsl(${h} ${s}% ${l + 0.3 * 100 - 30}%)`,
  500: `hsl(${h} ${s}% ${l + 0.1 * 100 - 10}%)`,
  600: `hsl(${h} ${s}% ${l}%)`,
  700: `hsl(${h} ${s}% ${l - 8}%)`,
  800: `hsl(${h} ${s}% ${l - 16}%)`,
  900: `hsl(${h} ${s}% ${l - 24}%)`,
});

export const colors = {
  blue: ramp(214, 68, 42),
  cyan: ramp(190, 62, 40),
  deepOrange: ramp(20, 84, 48),
  green: ramp(150, 55, 38),
  indigo: ramp(226, 52, 44),
  lightBlue: ramp(205, 70, 48),
  lime: ramp(88, 52, 42),
  amber: ramp(40, 90, 50),
  orange: ramp(28, 84, 52),
  pink: ramp(330, 62, 52),
  purple: ramp(252, 44, 48),
  red: ramp(0, 72, 48),
  teal: ramp(176, 52, 40),
  yellow: ramp(46, 88, 56),
  grey: ramp(220, 12, 44),
};

colors.gray = colors.grey;

export const appTheme = {
  palette: {
    mode: "light",
    primary: { main: "#2D4EA8", light: "#6E88D9", dark: "#233E86", contrastText: "#fff" },
    secondary: { main: "#010736", light: "#26357C", dark: "#01052B", contrastText: "#fff" },
    info: { main: "#2D4EA8", contrastText: "#fff" },
    success: { main: "#22A06B", contrastText: "#fff" },
    warning: { main: "#D9822B", contrastText: "#fff" },
    error: { main: "#D64545", contrastText: "#fff" },
    text: { primary: "#010736", secondary: "#5A5A63", disabled: "#C9C9CE" },
    divider: "#EEEEF1",
    background: { default: "#EEEEF1", paper: "#FFFFFF" },
  },
  typography: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    h1: { fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  },
  shape: { borderRadius: 12 },
};

/** Ordered categorical series colours used for chart palettes. */
export const chartPalette = [
  "#2D4EA8",
  "#233E86",
  "#4A66C6",
  "#15254F",
  "#6E88D9",
  "#1B3168",
];

export const alpha = (color, value) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color || "");
  if (!match) return color;
  const [, r, g, b] = match;
  return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${value})`;
};

export default appTheme;
