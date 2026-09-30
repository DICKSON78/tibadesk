import axios from 'axios';

window.APP_NAME = 'TibaDesk Eye Clinic';

/**
 * Where TibaDesk mounts this application, and therefore where everything this
 * application requests has to be requested from.
 *
 * The same bundle has to work two ways: standalone at the root of its own
 * origin, and mounted under the TibaDesk origin at /apps/eye. Those need
 * different bases, and getting it wrong is not a cosmetic failure — a bundle
 * that asks for /api/auth/user at the root reaches the ERP instead of this
 * application, and is refused by it.
 */
const MOUNT = (import.meta.env.VITE_APP_MOUNT ?? '').replace(/\/$/, '');

/**
 * The key this application's token is stored under.
 *
 * Namespaced, because TibaDesk mounts this application alongside two others
 * that share its origin and therefore its localStorage. Under a plain "token"
 * key, signing in to eye would overwrite the dental session and vice versa,
 * and a user would be silently signed out of whichever they used second.
 */
const TOKEN_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY ?? 'tibadesk.eye.token';

window.TIBADESK = { mount: MOUNT, tokenKey: TOKEN_KEY };

/**
 * Prefix a root-relative path with the mount, leaving absolute URLs, and paths
 * that already carry the mount, alone.
 */
const withMount = (path) => {
  if (!MOUNT) return path;
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path)) return path;
  if (!path.startsWith('/')) return path;
  if (path === MOUNT || path.startsWith(`${MOUNT}/`)) return path;
  return `${MOUNT}${path}`;
};

window.axios = axios;

// Relative and root-relative requests are resolved against this, which is what
// carries them under the mount. The interceptor below deliberately does not
// prefix these as well: axios joins a baseURL that already ends in the mount
// with the path it was given, so doing both would ask for
// "/apps/eye/apps/eye/api/…".
window.axios.defaults.baseURL = `${window.location.origin}${MOUNT}`;
window.axios.defaults.timeout = 45000;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';
window.axios.defaults.headers.common['Content-Type'] = 'application/json';

/**
 * Remove one leading mount from a path, so that the baseURL can put it back.
 */
const stripMount = (path) => {
  if (!MOUNT) return path;
  if (path === MOUNT) return '/';
  if (path.startsWith(`${MOUNT}/`)) return path.slice(MOUNT.length);
  return path;
};

/**
 * Work out what an absolute URL should become.
 *
 * Only URLs aimed at this machine or the current origin are touched. One to
 * somewhere genuinely external — a payment gateway, a CDN — is left exactly as
 * it is, because rewriting one of those would send the request to a host that
 * has never heard of this application.
 *
 * The result is returned absolute, which is what makes axios use it verbatim
 * instead of joining it to the baseURL a second time.
 */
const withMountAbsolute = (url) => {
  if (!MOUNT) return url;

  let parsed;
  try {
    parsed = new URL(url, window.location.origin);
  } catch {
    return url;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return url;

  const localHost = ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(parsed.hostname);
  if (!localHost && parsed.host !== window.location.host) return url;

  return `${window.location.origin}${MOUNT}${stripMount(parsed.pathname)}${parsed.search}${parsed.hash}`;
};

window.axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof config.url === 'string') {
    if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(config.url)) {
      config.url = withMountAbsolute(config.url);
    } else {
      // Handed back without the mount, because the baseURL carries it and
      // axios would otherwise join the two and ask for the mount twice.
      config.url = stripMount(config.url);
    }
  }

  return config;
});

window.axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !window.location.pathname.endsWith('/login')) {
      // The token is gone or expired. Cleared under this application's own
      // key, so an expired dental session does not log the user out of the
      // eye application that shares the origin.
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = withMount('/login');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

/**
 * Apply the mount and the bearer token to raw fetch calls.
 *
 * A window.fetch shim rather than editing the ~14 files that call it directly.
 * Those calls are the same requests axios makes, written out longhand, and the
 * ones that break first under the mount are exactly the ones least likely to
 * be revisited. Centralising the fix here means a new fetch call is correct by
 * default without anyone having to remember anything about the mount.
 */
const nativeFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
  const applyToken = (headers) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');

    return headers;
  };

  // A string or URL: rewrite the path, then attach headers.
  if (typeof input === 'string' || input instanceof URL) {
    const url = typeof input === 'string' ? input : input.toString();

    return nativeFetch(withMount(url), {
      ...init,
      headers: applyToken(new Headers(init.headers ?? {})),
    });
  }

  // A Request: the body has to be read before it can be rebuilt with new
  // headers, and only once, which is why this is async.
  return input.clone().arrayBuffer().then((buffer) =>
    nativeFetch(withMount(input.url), {
      method: input.method,
      headers: applyToken(new Headers(input.headers)),
      body: buffer.byteLength ? buffer : undefined,
      ...init,
    }),
  );
};
