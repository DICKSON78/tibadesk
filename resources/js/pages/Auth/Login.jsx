import { Head, useForm } from '@inertiajs/react';

/**
 * TibaDesk's own sign-in, matching the design the website already ships so
 * that the two doors are indistinguishable. The website is the front door and
 * posts to /tibadesk/login; this page is what a tenant hits when the proxy is
 * bypassed, so it has to look like the same product rather than a bare
 * backend form. Structure mirrors site/pages/LoginPage.jsx: the eyebrow, the
 * headline, the card, pill inputs, the pill submit.
 */
const inputClass =
    'w-full rounded-full border border-mist-200 px-4 py-3 text-sm transition-colors focus:border-ink-900-900 focus:outline-none';

export default function Login({ email, contact }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Sign in" />

            <div className="flex min-h-full items-center justify-center bg-mist-100 px-6 py-12 md:py-20">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <p className="eyebrow text-brand mb-3">SIGN IN</p>
                        <h1 className="text-ink-900 mb-3 text-3xl font-extrabold md:text-4xl">
                            Open your <span className="text-brand">TibaDesk</span> Dashboard
                        </h1>
                        <p className="text-sm text-mist-600">
                            Use the email address and password for your facility.
                        </p>
                    </div>

                    <form onSubmit={submit} className="surface-card p-6 md:p-8">
                        {errors.email && (
                            <div
                                role="alert"
                                className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {errors.email}
                            </div>
                        )}

                        {errors.password && (
                            <div
                                role="alert"
                                className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {errors.password}
                            </div>
                        )}

                        <div className="grid gap-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="text-ink-900 mb-2 block text-xs font-bold tracking-wider uppercase"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="username"
                                    required
                                    autoFocus
                                    className={inputClass}
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="text-ink-900 mb-2 block text-xs font-bold tracking-wider uppercase"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className={inputClass}
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                />
                            </div>
                        </div>

                        <label className="mt-4 flex items-center gap-2 text-sm text-mist-600">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(event) => setData('remember', event.target.checked)}
                                className="accent-brand-600 size-4"
                            />
                            Keep me signed in
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-asaak mt-6 w-full disabled:opacity-60"
                        >
                            {processing ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-mist-600">
                        No account yet?{' '}
                        <a href="/start-trial" className="text-brand font-semibold hover:underline">
                            Start your trial
                        </a>
                    </p>

                    {contact?.phone && (
                        <p className="mt-4 text-center text-xs text-mist-500">
                            Having trouble? Call{' '}
                            <a href={contact.phoneHref} className="text-brand font-semibold hover:underline">
                                {contact.phone}
                            </a>{' '}
                            or email{' '}
                            <a
                                href={`mailto:${contact.email}`}
                                className="text-brand font-semibold hover:underline"
                            >
                                {contact.email}
                            </a>
                            .
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
