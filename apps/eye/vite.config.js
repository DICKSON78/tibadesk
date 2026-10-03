import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // The mount has to be read with loadEnv rather than import.meta.env: the
  // config file runs in Node before Vite has populated the env for the bundle,
  // and the base path it produces is needed to build the bundle in the first
  // place.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      laravel({
        input: ['resources/css/app.css', 'resources/js/app.jsx'],
        refresh: true,
      }),
      react(),
    ],

    // TibaDesk mounts this application at /apps/eye, so every asset it
    // emits has to be requested from under that path. Without this the built
    // bundles are requested from the TibaDesk root, where they do not exist,
    // and the application loads as an unstyled, non-functional page.
    //
    // Read from the environment rather than hardcoded, so one set of built
    // assets can serve both the mounted path and a standalone checkout at the
    // root of its own origin.
    base: `${env.VITE_APP_MOUNT ?? ''}/`.replace('//', '/'),

    server: {
      watch: {
        ignored: ['**/storage/framework/views/**'],
      },
    },
  };
});
