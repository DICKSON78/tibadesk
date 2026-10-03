import { Head, Link } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout';
import Icon from '../components/Icon';
import { Button, Card, EmptyState, StatCard, StatusBadge, Table, Td, Th } from '../components';

const tiles = [
    { key: 'patients', label: 'Registered today', icon: 'users', tone: 'brand' },
    { key: 'encounters', label: 'Visits today', icon: 'stethoscope', tone: 'brand' },
    { key: 'waiting', label: 'Waiting to be seen', icon: 'clock', tone: 'amber' },
    { key: 'in_consultation', label: 'In consultation', icon: 'activity', tone: 'brand' },
];

export default function Dashboard({ stats, recentEncounters, can, licence }) {
    return (
        <AppLayout title="Today" subtitle={licence?.edition}>
            <Head title="Today" />

            <div className="space-y-6">
                {/* Counters. A receptionist lives on this screen between patients. */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {tiles.map((tile) => (
                        <StatCard
                            key={tile.key}
                            icon={() => <Icon name={tile.icon} className="size-6" />}
                            label={tile.label}
                            value={stats[tile.key]}
                            tone={stats[tile.key] > 0 ? tile.tone : 'slate'}
                        />
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {can.registerPatient && (
                        <Link href="/patients/create">
                            <Button>Register a patient</Button>
                        </Link>
                    )}
                    <Link href="/encounters/create">
                        <Button variant="secondary">Open an encounter</Button>
                    </Link>
                </div>

                <Card
                    title="Recent visits"
                    description="The last eight encounters opened at this facility."
                >
                    {recentEncounters.length === 0 ? (
                        <EmptyState
                            title="No visits yet today"
                            description="Registered patients appear here as soon as an encounter is opened."
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <Th>Visit</Th>
                                    <Th>Patient</Th>
                                    <Th>Reason</Th>
                                    <Th>Status</Th>
                                    <Th align="right">Time</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentEncounters.map((encounter) => (
                                    <tr key={encounter.id} className="transition-colors hover:bg-slate-50/60">
                                        <Td>
                                            <Link
                                                href={`/encounters/${encounter.id}`}
                                                className="font-semibold text-slate-900 hover:text-brand-700"
                                            >
                                                {encounter.encounter_number}
                                            </Link>
                                        </Td>
                                        <Td>
                                            <span className="font-medium text-slate-900">
                                                {encounter.patient_name}
                                            </span>
                                            <span className="ml-2 text-xs text-slate-400">
                                                {encounter.patient_number}
                                            </span>
                                        </Td>
                                        <Td className="text-slate-600">{encounter.reason || '—'}</Td>
                                        <Td>
                                            <StatusBadge status={encounter.status} />
                                        </Td>
                                        <Td align="right" className="text-slate-500">
                                            {encounter.registered_at}
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card>

                {licence?.days_remaining !== null && licence?.days_remaining !== undefined && (
                    <p className="text-xs text-slate-400">
                        {licence.edition} licence
                        {licence.expires_at ? ` · expires ${licence.expires_at}` : ''}
                        {licence.days_remaining < 30
                            ? ` · ${licence.days_remaining} days remaining`
                            : ''}
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
