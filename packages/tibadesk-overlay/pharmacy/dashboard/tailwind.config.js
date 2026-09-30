/**
 * Phermex's dashboard, re-pointed at the TibaDesk design language.
 *
 * The approach is deliberately a remap rather than a rewrite. This app has
 * hundreds of `bg-primary-*` and `text-dark-*` call sites that are correct as
 * written; repointing `primary` at the TibaDesk azure ramp and `dark` at the
 * navy ramp recolours all of them at once. Replacing them by hand would be a
 * large diff touching every screen, with no visible benefit and a long tail of
 * mistakes.
 *
 * The shared tokens themselves live in packages/tibadesk-ui/tailwind-preset.js
 * and are pulled in below, so the canonical palette is defined once for the
 * whole product rather than twice in two files.
 */

/** @type {import('tailwindcss').Config} */
import tibadesk from '../../../packages/tibadesk-ui/tailwind-preset.js';

export default {
  presets: [tibadesk],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /*
         * Phermex green, now carrying TibaDesk azure. Anything in this app
         * that means "act here" follows automatically.
         */
        primary: {
          DEFAULT: '#2D4EA8',
          50: '#F2F5FD',
          100: '#E6EBFA',
          200: '#C6D2F3',
          300: '#9DB0E8',
          400: '#6E88D9',
          500: '#4A66C6',
          600: '#2D4EA8',
          700: '#233E86',
          800: '#1B3168',
          900: '#15254F',
        },

        // The sidebar and other dark surfaces, now navy.
        dark: {
          DEFAULT: '#010736',
          50: '#F3F5FB',
          100: '#E2E7F5',
          200: '#C0C9E8',
          300: '#8E9DD2',
          400: '#5A6CB4',
          500: '#37479A',
          600: '#26357C',
          700: '#1A2660',
          800: '#0E1743',
          900: '#010736',
          950: '#01052B',
        },

        // The page behind every card. Cards themselves are white.
        surface: '#EEEEF1',

        'primary-dark': '#233E86',
        'primary-light': '#E6EBFA',

        // The deep greens this app used for its darkest chrome.
        forest: {
          DEFAULT: '#010736',
          dark: '#0E1743',
          darker: '#01052B',
        },

        // Kept as-is: this is a semantic accent for a specific treatment, not
        // part of the brand ramp, and recolouring it would lose its meaning.
        gold: '#D4A853',
      },
      fontFamily: {
        // System stack rather than Poppins, matching the ERP shell. A remote
        // font resolver would make this build depend on the network, and the
        // two halves of the same product should not disagree about type.
        poppins: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
