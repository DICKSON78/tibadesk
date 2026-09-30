/**
 * Where this application lives.
 *
 * Run on its own, this dashboard is served at /dashboard/ and talks to an API
 * at /api. Mounted inside TibaDesk, both of those move up under
 * /apps/pharmacy, and every absolute path in the bundle — the router's
 * basename, the API base, the Vite asset base — has to move with them or the
 * application loads and then fails to find itself.
 *
 * The mount is read from the environment rather than hardcoded, so the same
 * build serves either arrangement and nothing has to be edited to switch.
 */

const rawMount = import.meta.env.VITE_APP_MOUNT ?? ''

// A trailing slash here would double up when joined to /api or /dashboard, so
// it is trimmed once here instead of at every call site.
export const MOUNT = rawMount.replace(/\/+$/, '')

/** The directory this SPA is served from, which is /dashboard within the mount. */
export const BASE_PATH = `${MOUNT}/dashboard`

/**
 * The API is a sibling of the SPA rather than a child of it, so it hangs off
 * the mount itself and not off BASE_PATH.
 */
export const API_BASE = `${MOUNT}/api`

/**
 * The three packages share one browser origin, so they share one localStorage.
 * A namespaced key is what stops signing in to the eye clinic from silently
 * ending the pharmacy session. The legacy key is still read, so a browser that
 * signed in before the mount was introduced keeps working.
 */
export const TOKEN_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY ?? 'tibadesk.pharmacy.token'
export const USER_KEY = import.meta.env.VITE_USER_STORAGE_KEY ?? 'tibadesk.pharmacy.user'
const LEGACY_TOKEN_KEY = 'pharmex_token'
const LEGACY_USER_KEY = 'pharmex_user'

/**
 * Prefix a root-relative path with the mount. Absolute URLs and paths that
 * already carry the mount are left alone.
 */
export const withMount = (path) => {
  if (!MOUNT) return path
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path)) return path
  if (!path.startsWith('/')) return path
  if (path === MOUNT || path.startsWith(`${MOUNT}/`)) return path
  return `${MOUNT}${path}`
}

export const readToken = () =>
  localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY)

export const readUser = () => {
  const stored = localStorage.getItem(USER_KEY) ?? localStorage.getItem(LEGACY_USER_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export const writeToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export const writeUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)
}
