import tibadesk from '../../packages/tibadesk-ui/tailwind-preset.js';

/**
 * The whole TibaDesk colour system lives in packages/tibadesk-ui so that the
 * three imported apps and the ERP monolith render the same navy, azure and
 * mist. This file previously re-declared those ramps here; keeping a second
 * copy is how three utilities used by resources/js/tibadesk (bg-header-gradient,
 * rounded-card, border-line) silently compiled to nothing when one of the two
 * copies drifted. It has not drifted since.
 */
export default {
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.{js,jsx}',
  ],
  presets: [tibadesk],
  theme: {
    extend: {},
  },
  plugins: [],
};