import { useEffect, useState } from 'react';
import { SITE } from '../config';
import Modal from './Modal';

const inputClass =
  'w-full px-4 py-3 rounded-full text-sm border border-gray-200 focus:outline-none focus:border-ink transition-colors';

/**
 * Sign-in, shown as an overlay on the marketing site.
 *
 * The console lives at /tibadesk and owns the session, so the credentials go
 * there rather than to any handler of the site's own. Both are served by the
 * same application and share one session, so the console's CSRF token is this
 * site's token too, read from /csrf-token.
 *
 * This used to post through a native <form>, which cannot work here. A failed
 * sign-in is a ValidationException on the server, so a plain form post comes
 * back as a redirect to /tibadesk/login — the overlay would shut and dump the
 * visitor on the console's own page, mid-site. Posting with fetch and
 * Accept: application/json makes that a 422 with the reason in the body, so the
 * reason can be shown inside the panel and the page underneath stays put.
 */
export default function LoginModal({ onClose, onSwitchToRegister }) {
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState(null);
  const [rejected, setRejected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/csrf-token', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`token request failed: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setToken(data.token);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTokenError('We could not reach the sign-in service. Please try again in a moment.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setRejected(null);

    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch('/tibadesk/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          email: data.get('email'),
          password: data.get('password'),
          remember: data.get('remember') === 'on',
        }),
      });

      if (response.ok) {
        // The post redirected to the dashboard, which fetch followed, so the
        // final URL is where the console wants this visitor to land.
        window.location.assign(response.url || '/tibadesk/dashboard');
        return;
      }

      const payload = await response.json().catch(() => ({}));

      // Laravel keys its errors by field; every rejection here is about the
      // email address, whether it is wrong, disabled, or not yet active.
      setRejected(
        payload?.errors?.email?.[0] ??
          'We could not sign you in. Please try again in a moment.'
      );
    } catch {
      setRejected('We could not reach the sign-in service. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal labelledBy="login-title" onClose={onClose} width="max-w-md">
      <div className="mb-8 pr-8 text-center">
        <p className="eyebrow text-brand mb-3">SIGN IN</p>
        <h1 id="login-title" className="text-3xl font-extrabold text-ink mb-3">
          Open your <span className="text-brand">TibaDesk</span> Dashboard
        </h1>
        <p className="text-gray-500 text-sm">Use the email address and password for your facility.</p>
      </div>

      {rejected && (
        <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-2xl px-4 py-3 mb-4">
          {rejected}
        </div>
      )}

      {tokenError && (
        <div role="alert" className="bg-amber-50 text-amber-800 text-sm rounded-2xl px-4 py-3 mb-4">
          {tokenError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label htmlFor="email" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            required
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input id="remember" name="remember" type="checkbox" className="w-4 h-4 accent-brand" />
          <label htmlFor="remember">Keep me signed in</label>
        </div>

        <button type="submit" className="btn-asaak w-full" disabled={!token || submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        No account yet?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-brand font-semibold hover:underline">
          Register your facility
        </button>
      </p>

      <p className="text-center text-xs text-gray-400 mt-4">
        Having trouble? Call KADETECH on{' '}
        <a href={SITE.contact.phoneHref} className="text-brand font-semibold hover:underline">
          {SITE.contact.phone}
        </a>{' '}
        or email{' '}
        <a href={`mailto:${SITE.contact.email}`} className="text-brand font-semibold hover:underline">
          {SITE.contact.email}
        </a>
        .
      </p>
    </Modal>
  );
}
