/**
 * TibaDesk design tokens, for the imported Tailwind 3 applications.
 *
 * The ERP itself runs Tailwind 4 and declares these same values in
 * resources/css/app.css under @theme. That file is the source of truth for the
 * monolith; this preset mirrors it so the pharmacy, dental and eye apps render
 * the same colours as the shell that frames them. If one changes, change both.
 *
 * Usage, in an imported app's tailwind.config.js:
 *
 *   import tibadesk from '../../../packages/tibadesk-ui/tailwind-preset.js';
 *   export default {
 *       content: ['./resources/**\/*.{js,jsx,blade.php}'],
 *       presets: [tibadesk],
 *       theme: { extend: { colors: { ...appSpecific } } },
 *   };
 */

/** @type {import('tailwindcss').Config} */
export default {
    theme: {
        extend: {
            colors: {
                // The sidebar ink, and the darkest text in the product.
                navy: {
                    50: '#f3f5fb',
                    100: '#e2e7f5',
                    200: '#c0c9e8',
                    300: '#8e9dd2',
                    400: '#5a6cb4',
                    500: '#37479a',
                    600: '#26357c',
                    700: '#1a2660',
                    800: '#0e1743',
                    900: '#010736',
                    950: '#01052b',
                },

                // The one colour that means "act here". Tinted from the navy so
                // the accent and the sidebar never look like separate products.
                azure: {
                    50: '#f2f5fd',
                    100: '#e6ebfa',
                    200: '#c6d2f3',
                    300: '#9db0e8',
                    400: '#6e88d9',
                    500: '#4a66c6',
                    600: '#2d4ea8',
                    700: '#233e86',
                    800: '#1b3168',
                    900: '#15254f',
                },

                // Neutral chrome. Cards sit on white; mist carries the rest.
                mist: {
                    50: '#fafafb',
                    100: '#f4f4f5',
                    200: '#eeeef1',
                    300: '#e2e2e6',
                    400: '#c9c9d0',
                    500: '#a6a6b0',
                    600: '#7c7c88',
                    700: '#5a5a65',
                    800: '#3a3a44',
                    900: '#22222a',
                },

                /*
                 * Aliases. Imported apps predate the shared kit and refer to
                 * these names throughout, so they are kept as the public surface
                 * rather than renaming every call site in three codebases.
                 */
                ink: '#010736',
                'ink-soft': '#26357c',
                'ink-muted': '#5a5a65',
                brand: '#2d4ea8',
                'brand-soft': '#e6ebfa',

                // The page background, and the card that sits on it.
                canvas: '#eeeef1',
                surface: '#ffffff',

                // A hairline that reads as a divider rather than a border.
                line: '#eeeef1',

                accent: {
                    DEFAULT: '#2d4ea8',
                    soft: '#e6ebfa',
                    deep: '#233e86',
                },

                /*
                 * Semantic status colours, tuned against the navy rather than
                 * stock defaults. In MUI terms these are the values formerly
                 * under palette.success.main etc., and several imported
                 * components reference them as Tailwind utilities (bg-danger,
                 * text-success, border-warning) that the stock ramp does not
                 * provide. The -soft variant is the same hue washed across a
                 * white card, used as a status tint in alerts and rows.
                 */
                danger: {
                    DEFAULT: '#d64545',
                    soft: '#fae9e9',
                },
                info: {
                    DEFAULT: '#2d4ea8',
                    soft: '#e6ebfa',
                },
                success: {
                    DEFAULT: '#22a06b',
                    soft: '#e4f4ec',
                },
                warning: {
                    DEFAULT: '#d9822b',
                    soft: '#fbf0e4',
                },
            },

            fontFamily: {
                sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },

            borderRadius: {
                card: '1rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },

            boxShadow: {
                card: '0 1px 2px rgba(1, 7, 54, 0.04), 0 8px 24px rgba(1, 7, 54, 0.06)',
                lift: '0 2px 4px rgba(1, 7, 54, 0.06), 0 18px 40px rgba(1, 7, 54, 0.1)',
                glow: '0 24px 60px rgba(1, 7, 54, 0.28)',
                sidebar: '0 8px 24px rgba(1, 7, 54, 0.24)',
            },

            backgroundImage: {
                /*
                 * The sidebar and the dashboard header. A full-height dark
                 * column in flat ink reads as a black void on a bright screen;
                 * the gradient gives it a direction and a top edge.
                 */
                'header-gradient':
                    'linear-gradient(180deg, #0e1743 0%, #010736 55%, #01052b 100%)',
                'accent-gradient': 'linear-gradient(135deg, #2d4ea8 0%, #233e86 100%)',

                'grid-light':
                    'linear-gradient(to right, rgba(1,7,54,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(1,7,54,0.05) 1px, transparent 1px)',
                'grid-dark':
                    'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
            },
        },
    },
    plugins: [],
};
