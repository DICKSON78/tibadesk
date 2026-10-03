import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import PharmacyTabs from '../../components/PharmacyTabs';
import Icon from '../../components/Icon';
import { Alert, Button, Card, EmptyState, StatCard, Table, Td, Th } from '../../components';

const money = (amount) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

/**
 * The pharmacist's morning screen: what is about to expire, what has been
 * recalled, and the last few things that moved. Counts are links so the
 * numbers are not a dead end.
 */
export default function PharmacyIndex({ alerts, counts, recentMovements }) {
    const expiring = alerts.expiring_soon || [];
    const recalled = alerts.recalled || [];

    return (
        <AppLayout title="Pharmacy" subtitle="Stock, expiry and recall watch">
            <Head title="Pharmacy" />
            <PharmacyTabs current="/pharmacy" />

            {(recalled.length > 0 || expiring.length > 0) && (
                <div className="mb-5 space-y-3">
                    {recalled.length > 0 && (
                        <Alert variant="error">
                            <strong>
                                {recalled.length} batch{recalled.length === 1 ? '' : 'es'} pulled by an open recall.
                            </strong>{' '}
                            These cannot be dispensed until the recall is closed.
                        </Alert>
                    )}
                    {expiring.length > 0 && (
                        <Alert variant="info">
                            {expiring.length} batch{expiring.length === 1 ? '' : 'es'} expiring within 90 days.
                        </Alert>
                    )}
                </div>
            )}

            <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    icon={() => <Icon name="package" />}
                    label="Batches in stock"
                    value={counts.batches}
                    tone="brand"
                />
                <StatCard
                    icon={() => <Icon name="clock" />}
                    label="Expiring < 90 days"
                    value={counts.expiring}
                    tone={counts.expiring > 0 ? 'amber' : 'slate'}
                />
                <StatCard
                    icon={() => <Icon name="alert-triangle" />}
                    label="Open recalls"
                    value={counts.recalled}
                    tone={counts.recalled > 0 ? 'rose' : 'slate'}
                />
                <StatCard
                    icon={() => <Icon name="truck" />}
                    label="Open purchase orders"
                    value={counts.open_orders}
                    tone="brand"
                />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <Card
                    title="Expiring soon"
                    description="Oldest expiry first"
                    actions={
                        <Link href="/pharmacy/stock?expiring_soon=1&in_stock=1">
                            <Button variant="secondary" size="sm">
                                View all
                            </Button>
                        </Link>
                    }
                >
                    {expiring.length === 0 ? (
                        <EmptyState
                            title="Nothing expiring soon"
                            description="No batch on hand lapses within the next 90 days."
                        />
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {expiring.map((batch) => (
                                <li key={batch.id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-900">
                                            {batch.medicine?.name} {batch.medicine?.strength}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Batch {batch.batch_number} &middot; {batch.quantity_available}{' '}
                                            {batch.medicine?.unit}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 text-sm font-medium ${
                                            batch.days_to_expiry <= 30 ? 'text-rose-600' : 'text-amber-600'
                                        }`}
                                    >
                                        {batch.days_to_expiry}d
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card
                    title="Under recall"
                    description="Stock withdrawn from the shelf"
                    actions={
                        <Link href="/pharmacy/stock?recalled=1">
                            <Button variant="secondary" size="sm">
                                View all
                            </Button>
                        </Link>
                    }
                >
                    {recalled.length === 0 ? (
                        <EmptyState title="No open recalls" description="Nothing is currently withdrawn." />
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {recalled.map((batch) => (
                                <li key={batch.id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-900">
                                            {batch.medicine?.name} {batch.medicine?.strength}
                                        </p>
                                        <p className="text-xs text-slate-500">Batch {batch.batch_number}</p>
                                    </div>
                                    <span className="shrink-0 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-600/20 ring-inset">
                                        Blocked
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <Card className="mt-5" title="Recent stock movements" description="The ledger, most recent first">
                {recentMovements.length === 0 ? (
                    <EmptyState title="No movements yet" description="Stock will appear here once something is received." />
                ) : (
                    <Table>
                        <thead>
                            <tr className="border-b border-slate-100">
                                <Th>Medicine</Th>
                                <Th>Batch</Th>
                                <Th>Type</Th>
                                <Th align="right">Change</Th>
                                <Th align="right">Value</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentMovements.map((movement) => (
                                <tr key={movement.id} className="transition-colors hover:bg-slate-50/60">
                                    <Td className="font-medium text-slate-900">{movement.medicine?.name}</Td>
                                    <Td className="font-mono text-xs text-slate-500">
                                        {movement.batch?.batch_number || '—'}
                                    </Td>
                                    <Td className="text-slate-500">{movement.movement_type}</Td>
                                    <Td
                                        align="right"
                                        className={`font-semibold ${
                                            movement.direction === 'in' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}
                                    >
                                        {movement.direction === 'in' ? '+' : '−'}
                                        {Math.abs(movement.quantity)}
                                    </Td>
                                    <Td align="right" className="text-slate-500">
                                        {money(movement.value)}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                <div className="mt-4">
                    <Link href="/pharmacy/movements">
                        <Button variant="secondary" size="sm">
                            Full movement history
                        </Button>
                    </Link>
                </div>
            </Card>
        </AppLayout>
    );
}
