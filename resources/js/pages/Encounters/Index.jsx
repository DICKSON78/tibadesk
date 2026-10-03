import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Card, EmptyState, Pagination, Select, StatusBadge } from '../../components';

/**
 * Renders an ISO timestamp for a table cell.
 *
 * The server sends ISO strings because this is a JavaScript page; formatting
 * has to happen here rather than with a PHP formatter on the other side.
 */
function formatWhen(value) {
    if (!value) return '—';

    return new Date(value).toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function EncountersIndex({ encounters, filters, statuses }) {
    const { auth } = usePage().props;
    const canCreate = (auth?.user?.capabilities || []).includes('encounters.create');

    const changePage = (page) => {
        router.get('/encounters', { ...filters, page }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Encounters"
            subtitle={`${encounters.meta.total} visits opened at this facility`}
            actions={
                canCreate && (
                    <Link href="/encounters/create">
                        <Button>Open encounter</Button>
                    </Link>
                )
            }
        >
            <Head title="Encounters" />

            <Card>
                <div className="mb-4 max-w-xs">
                    <Select
                        label="Filter by status"
                        name="status"
                        value={filters.status}
                        onChange={(event) =>
                            router.get(
                                '/encounters',
                                { status: event.target.value },
                                { preserveState: true, replace: true },
                            )
                        }
                    >
                        <option value="">All visits</option>
                        {Object.entries(statuses).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </Select>
                </div>

                {encounters.data.length === 0 ? (
                    <EmptyState
                        title="No visits found"
                        description={
                            filters.status
                                ? 'No visits match that status.'
                                : 'Open an encounter from the patient register to see it here.'
                        }
                    />
                ) : (
                    <>
                        <div className="-mx-5 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-sm">
                                <thead>
                                    <tr className="text-left text-xs tracking-wide text-slate-500 uppercase">
                                        <th className="px-5 py-2 font-medium">Visit</th>
                                        <th className="px-5 py-2 font-medium">Patient</th>
                                        <th className="px-5 py-2 font-medium">Type</th>
                                        <th className="px-5 py-2 font-medium">Reason</th>
                                        <th className="px-5 py-2 font-medium">Status</th>
                                        <th className="px-5 py-2 text-right font-medium">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {encounters.data.map((encounter) => (
                                        <tr key={encounter.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-2.5 font-medium">
                                                <Link
                                                    href={`/encounters/${encounter.id}`}
                                                    className="text-slate-900 hover:text-brand-700"
                                                >
                                                    {encounter.encounter_number}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <span className="text-slate-900">
                                                    {encounter.patient?.full_name}
                                                </span>
                                                <span className="ml-2 text-xs text-slate-400">
                                                    {encounter.patient?.patient_number}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600 uppercase">
                                                {encounter.type}
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600">
                                                {encounter.reason_for_visit || '—'}
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <StatusBadge status={encounter.status} />
                                            </td>
                                            <td className="px-5 py-2.5 text-right text-slate-500 tabular-nums">
                                                {formatWhen(encounter.registered_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination meta={encounters.meta} links={encounters.links} onPageChange={changePage} />
                    </>
                )}
            </Card>
        </AppLayout>
    );
}
