import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            /*
             * Two front doors, one build.
             *
             * resources/js/app.jsx and resources/css/app.css are the console,
             * which is mounted at /tibadesk. resources/js/site/main.jsx and
             * resources/css/site.css are the public marketing site at the root,
             * which used to be a separate application and was moved in here.
             * They are separate entries rather than one bundle so a visitor to
             * the marketing site never downloads React Router and the console,
             * and the console never ships the marketing stylesheet.
             */
            input: [
                'resources/css/app.css',
                'resources/js/app.jsx',
                'resources/css/site.css',
                'resources/js/site/main.jsx',
            ],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
