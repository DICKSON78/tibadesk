/**
 * The session token, in one place.
 *
 * TibaDesk mounts this application at /apps/dental next to two other
 * applications that share its origin, and therefore its localStorage. So the
 * key this token lives under is not a detail that can be repeated inline: get
 * it wrong in one file and a user is signed out of a different application
 * than the one they were using.
 *
 * Every read and write of the token goes through here, which is what makes
 * "which key is this" a single question with a single answer.
 */
const KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY ?? 'tibadesk.eye.token';

export const TOKEN_STORAGE_KEY = KEY;

export const getToken = () => window.localStorage.getItem(KEY);

export const setToken = (token) => window.localStorage.setItem(KEY, token);

export const clearToken = () => window.localStorage.removeItem(KEY);

export const isAuthenticated = () => Boolean(getToken());
