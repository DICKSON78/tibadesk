/**
 * Named colour ramps with the same 50–900 keys as `@mui/material/colors`, so
 * legacy `import { purple, teal } from "./colors.js"` statements can be
 * repointed here without touching any usage site.
 *
 * Hues are tuned to sit with the TibaDesk palette (navy #010736 / azure #2D4EA8).
 */

const ramp = (h, s, l) => {
  const step = (delta) => `hsl(${h} ${s}% ${Math.min(98, Math.max(12, l + delta))}%)`;
  return {
    50: step(46),
    100: step(38),
    200: step(28),
    300: step(17),
    400: step(8),
    500: step(0),
    600: step(-6),
    700: step(-13),
    800: step(-19),
    900: step(-25),
    A100: step(40),
    A200: step(30),
    A400: step(5),
    A700: step(-14),
  };
};

export const blue = ramp(214, 68, 42);
export const cyan = ramp(190, 62, 40);
export const teal = ramp(176, 52, 40);
export const green = ramp(150, 55, 38);
export const lightGreen = ramp(140, 52, 44);
export const lime = ramp(88, 52, 42);
export const yellow = ramp(46, 88, 56);
export const amber = ramp(40, 90, 50);
export const orange = ramp(28, 84, 52);
export const deepOrange = ramp(20, 84, 48);
export const red = ramp(0, 72, 48);
export const pink = ramp(330, 62, 52);
export const purple = ramp(252, 44, 48);
export const indigo = ramp(226, 52, 44);
export const lightBlue = ramp(205, 70, 48);
export const brown = ramp(24, 38, 34);
export const grey = ramp(220, 12, 44);
export const gray = grey;

/** Combined namespace, mirrors `colors` in `themes/app.js`. */
export const colors = {
  blue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  red,
  pink,
  purple,
  indigo,
  lightBlue,
  brown,
  grey,
  gray,
};

export default colors;
