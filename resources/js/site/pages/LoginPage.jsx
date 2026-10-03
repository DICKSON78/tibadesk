import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SITE } from '../config';

const inputClass =
  'w-full px-4 py-3 rounded-full text-sm border border-gray-200 focus:outline-none focus:border-ink transition-colors';

/**
 * The console lives at /tibadesk and authenticates itself, so the form posts
 * there rather than to this page's own handler. Both are served by the same
 * application and share one session, so the console's CSRF token is this
 * site's token too, read from /csrf-token. A rejected attempt comes back to
 * /login?error=credentials.
 */
export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState(null);

  const rejected = searchParams.get('error') === 'credentials';

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

  return (
    <section className="min-h-screen bg-surface flex items-center justify-center px-6 py-12 md:py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <p className="eyebrow text-brand mb-3">SIGN IN</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink mb-3">
            Open your <span className="text-brand">TibaDesk</span> Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Use the email address and password for your facility.
          </p>
        </div>

        <div className="card p-6 md:p-8">
          {rejected && (
            <div
              role="alert"
              className="bg-red-50 text-red-700 text-sm rounded-2xl px-4 py-3 mb-4"
            >
              That email address and password do not match an account. Please try again.
            </div>
          )}

          {tokenError && (
            <div
              role="alert"
              className="bg-amber-50 text-amber-800 text-sm rounded-2xl px-4 py-3 mb-4"
            >
              {tokenError}
            </div>
          )}

          <form method="post" action="/tibadesk/login" className="grid gap-4">
            <input type="hidden" name="_token" value={token} />

            <div>
              <label
                htmlFor="email"
                className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
              >
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
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="w-4 h-4 accent-brand"
              />
              <label htmlFor="remember">Keep me signed in</label>
            </div>

            <button type="submit" className="btn-asaak w-full" disabled={!token}>
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account yet?{' '}
          <Link to="/register" className="text-brand font-semibold hover:underline">
            Register your facility
          </Link>
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
      </div>
    </section>
  );
}
