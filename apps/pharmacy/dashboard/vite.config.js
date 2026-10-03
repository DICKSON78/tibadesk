import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The mount is needed in the served HTML as well as in the bundle: the service
 * worker has to be registered at a path that keeps its scope inside this
 * application. A build-time constant is injected rather than read from
 * `import.meta.env` in the page, because the inline script that registers the
 * worker runs before any module.
 */
const mountConstant = () => ({
  name: 'tibadesk-mount-constant',
  transformIndexHtml(html) {
    const mount = process.env.VITE_APP_MOUNT ?? ''
    const base = `${mount}/dashboard/`

    return html
      .replace(
        '/*__TIBADESK_MOUNT__*/',
        `window.__TIBADESK_MOUNT__ = ${JSON.stringify(mount)};`,
      )
      // Vite rewrites the bundle and stylesheet to absolute, mounted paths, but
      // leaves these alone — and a browser resolves a relative reference
      // against the current document URL, which is not always the directory the
      // dashboard lives in. Spelling them out removes the dependency on the
      // URL entirely, so the icons load whether the application was entered at
      // "/dashboard" or at one of its inner client-side routes.
      .replaceAll('./icon-192.png', `${base}icon-192.png`)
      .replaceAll('./manifest.json', `${base}manifest.json`)
  },
})

// Where the API lives when the dashboard is run on its own, outside TibaDesk.
// Only the dev and preview servers need this; when mounted, the browser calls
// the API through the same origin and this proxy is not involved at all.
const apiProxy = {
  '/api': {
    target: process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8011',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react(), mountConstant()],
  // Where the built assets are requested from. Mounted inside TibaDesk this
  // becomes /apps/pharmacy/dashboard/, and VITE_APP_MOUNT is set at build time
  // to match; run on its own it stays /dashboard/ and needs no configuration.
  base: `${process.env.VITE_APP_MOUNT ?? ''}/dashboard/`,
  build: {
    sourcemap: false,
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    proxy: apiProxy,
  },
  preview: {
    host: '0.0.0.0',
    port: 3001,
    proxy: apiProxy,
  },
})
