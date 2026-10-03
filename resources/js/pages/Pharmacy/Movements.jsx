import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import PharmacyTabs from '../../components/PharmacyTabs';
import { Button, Card, EmptyState, Pagination, Select, Table, Td, Th } from '../../components';

const money = (amount) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

const movementTypes = [
    'purchase',
    'sale',
    'transfer_out',
    'transfer_in',
    'return_in',
    'writeoff',
    'recall',
    'expiry',
    'adjustment',
];

const formatWhen = (iso) => {
    if (!iso) return '—';

    return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
};

export default function PharmacyMovements({ movements, filters, movementTypes: usedTypes }) {
    const changePage = (page) => {
        router.get('/pharmacy/movements', { ...filters, page }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Movements"
            subtitle="Every quantity change, in the order it happened"
        >
            <Head title="Pharmacy movements" />
            <PharmacyTabs current="/pharmacy/movements" />

            <Card className="mb-4">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        router.get(
                            '/pharmacy/movements',
                            { movement_type: event.target.movement_type.value },
                            { preserveState: true, replace: true },
                        );
                    }}
                    className="flex flex-wrap items-end gap-3"
                >
                    <Select
                        label="Movement type"
                        name="movement_type"
                        defaultValue={filters.movement_type || ''}
                        className="w-56"
                    >
                        <option value="">All movements</option>
                        {/* Offer every type the ledger knows about, not just the
                            ones that happen to appear on this page, so a filter
                            that would return nothing is still selectable. */}
                        {movementTypes.map((type) => (
                            <option key={type} value={type}>
                                {type.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </Select>
                    <Button type="submit" variant="secondary">
                        Apply
                    </Button>
                    {filters.movement_type && (
                        <Link
                            href="/pharmacy/movements"
                            className="pb-2 text-sm text-brand-700 hover:underline"
                        >
                            Clear
                        </Link>
                    )}
                    {usedTypes && usedTypes.length > 0 && (
                        <p className="ml-auto pb-2 text-xs text-slate-500">
                            {usedTypes.length} distinct type{usedTypes.length === 1 ? '' : 's'} in this ledger
                        </p>
                    )}
                </form>
            </Card>

            <Card>
                {movements.data.length === 0 ? (
                    <EmptyState title="No movements match" description="Try a different movement type." />
                ) : (
                    <Table>
                        <thead>
                            <tr className="border-b border-slate-100">
                                <Th>When</Th>
                                <Th>Medicine</Th>
                                <Th>Batch</Th>
                                <Th>Type</Th>
                                <Th align="right">Change</Th>
                                <Th align="right">Value</Th>
                                <Th>By</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                                {movements.data.map((movement) => (
                                    <tr key={movement.id} className="transition-colors hover:bg-slate-50/60">
                                        <Td className="whitespace-nowrap text-slate-500">
                                            {formatWhen(movement.occurred_at)}
                                        </Td>
                                        <Td className="font-medium text-slate-900">{movement.medicine?.name}</Td>
                                        <Td className="font-mono text-xs text-slate-600">
                                            {movement.batch?.batch_number || '—'}
                                        </Td>
                                        <Td>
                                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                                {String(movement.movement_type).replace(/_/g, ' ')}
                                            </span>
                                        </Td>
                                        <Td
                                            align="right"
                                            className={`font-semibold ${
                                                movement.direction === 'in' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}
                                        >
                                            {movement.direction === 'in' ? '+' : '−'}
                                            {Math.abs(movement.quantity)}
                                        </Td>
                                        <Td align="right" className="text-slate-600">{money(movement.value)}</Td>
                                        <Td className="text-slate-500">{movement.performed_by || '—'}</Td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                )}
            </Card>

            <div className="mt-4">
                <Pagination meta={movements.meta} links={movements.links} onPageChange={changePage} />
            </div>
        </AppLayout>
    );
}
