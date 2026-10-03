import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import Icon from '../../components/Icon';
import { Button, Card } from '../../components';

/**
 * Frames one imported application inside the TibaDesk shell.
 *
 * The frame fills the working area, but the shell stays: a user who lands here
 * keeps the ERP navigation above and to the left, so moving between the core
 * system and a package never feels like leaving the product.
 *
 * The package is mounted on this application's own origin at /apps/{key}, which
 * is what makes the sign-in below work. Before the frame is created the shell
 * asks this application for a token for that package, writes it to the
 * package's own key in localStorage, and only then points the frame at the
 * mount. Because the two share an origin, the storage write is visible to the
 * package as it boots, so it starts already authenticated. The frame is never
 * shown a login the user has already satisfied somewhere else.
 *
 * The token is written rather than appended to the frame URL on purpose. A URL
 * is a thing that gets copied, logged and bookmarked, and a bearer token in one
 * is a credential in places it should not be. Storage also survives the
 * package's own redirects, which a query parameter would not.
 *
 * Each application gets its own key. They share one localStorage, so a single
 * "token" key would let signing in to dental silently sign the user out of eye.
 */
export default function AppShow({ app, sso_endpoint: ssoEndpoint }) {
    const [state, setState] = useState({ status: 'loading', error: null });

    useEffect(() => {
        let cancelled = false;

        async function signIn() {
            try {
                const response = await fetch(ssoEndpoint, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(payload.message ?? 'Sign-in could not be completed.');
                }

                // Written under the package's key, not this application's, so
                // the two never overwrite each other's session.
                window.localStorage.setItem(payload.storage_key, payload.token);

                if (!cancelled) {
                    setState({ status: 'ready', error: null });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({ status: 'failed', error: error.message });
                }
            }
        }

        signIn();

        return () => {
            cancelled = true;
        };
    }, [ssoEndpoint]);

    if (!app.configured) {
        return (
            <AppLayout title={app.label} subtitle="Not configured">
                <Head title={app.label} />

                <Card className="max-w-2xl">
                    <div className="flex items-start gap-4">
                        <div className="stat-icon bg-mist-100 text-mist-600">
                            <Icon name={app.icon} className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {app.label} is not connected yet
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">{app.summary}</p>
                            <p className="mt-3 text-sm text-slate-500">
                                This package runs as its own application. Point TibaDesk at it by
                                setting the matching{' '}
                                <code className="rounded bg-mist-100 px-1 py-0.5 text-xs text-slate-700">
                                    EMBEDDED_{app.module.toUpperCase()}_ORIGIN
                                </code>{' '}
                                environment variable, then reload this page.
                            </p>
                            <div className="mt-5">
                                <Link href="/apps">
                                    <Button variant="secondary">All applications</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Card>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title={app.label}
            subtitle={app.summary}
            actions={
                <>
                    <a href={app.frame_url} target="_blank" rel="noreferrer noopener">
                        <Button variant="secondary">
                            <Icon name="external-link" className="size-4" />
                            Open in a new tab
                        </Button>
                    </a>
                </>
            }
        >
            <Head title={app.label} />

            <div className="relative overflow-hidden rounded-2xl border border-mist-200 bg-surface shadow-card">
                {state.status === 'loading' && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface text-center">
                        <Icon name="loader" className="size-6 animate-spin text-brand-600" />
                        <p className="text-sm font-medium text-slate-600">
                            Signing you in to {app.label}…
                        </p>
                    </div>
                )}

                {/*
                  A failure here is shown in the shell rather than inside the
                  frame, because the cause — the package being unreachable, or
                  not configured — is an operator problem, and a blank panel
                  would leave a user waiting on something that will never load.
                */}
                {state.status === 'failed' && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
                        <div className="stat-icon bg-mist-100 text-mist-600">
                            <Icon name="alert" className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                {app.label} could not be opened
                            </p>
                            <p className="mt-1 max-w-sm text-xs text-slate-500">{state.error}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <Button variant="secondary" onClick={() => window.location.reload()}>
                                Try again
                            </Button>
                            <Link href="/apps">
                                <Button variant="secondary">All applications</Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/*
                  Mounted only once the token is in place. Creating the frame
                  earlier would boot the package unauthenticated, and it would
                  settle on its login screen before the storage write landed.
                */}
                {state.status === 'ready' && (
                    <iframe
                        src={app.frame_url}
                        title={app.label}
                        className="h-[calc(100vh-13rem)] min-h-[32rem] w-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="clipboard-write"
                    />
                )}
            </div>
        </AppLayout>
    );
}
