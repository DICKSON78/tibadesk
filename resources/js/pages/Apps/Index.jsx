import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import Icon from '../../components/Icon';
import { Card, EmptyState } from '../../components';

/**
 * The launcher for the imported applications.
 *
 * Each package is a separate application, so this page is a directory rather
 * than a dashboard: it says what each app is for, whether it has been pointed
 * at a deployment yet, and gives a way in.
 */
export default function AppsIndex({ apps }) {
    return (
        <AppLayout
            title="Applications"
            subtitle="Packages connected to this workspace."
        >
            <Head title="Applications" />

            {apps.length === 0 ? (
                <Card>
                    <EmptyState
                        title="No applications available"
                        description="Your facility does not hold any package modules. Ask an administrator about the edition this workspace is licensed for."
                    />
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {apps.map((app) => (
                        <AppTile key={app.key} app={app} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}

function AppTile({ app }) {
    const body = (
        <>
            <div
                className={`stat-icon ${
                    app.configured
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-mist-100 text-mist-600'
                }`}
            >
                <Icon name={app.icon} className="size-6" />
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-900">{app.label}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-500">{app.summary}</p>

            {app.configured ? (
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                    Open
                    <Icon name="arrow-right" className="size-4" />
                </span>
            ) : (
                <span className="mt-4 text-sm font-medium text-slate-400">Not set up</span>
            )}
        </>
    );

    const className = 'surface-card flex flex-col p-5 text-left';

    // An unconfigured app is shown but not linked. Rendering a frame pointed at
    // nothing is worse than saying plainly that it needs a deployment.
    return app.configured ? (
        <Link href={`/apps/${app.key}/open`} className={className}>
            {body}
        </Link>
    ) : (
        <div className={`${className} border-dashed`}>{body}</div>
    );
}
