import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import PharmacyTabs from '../../components/PharmacyTabs';
import { Button, Card, EmptyState, Pagination, Table, Td, Th } from '../../components';

const money = (amount) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

// Filters live in the URL so a pharmacist can bookmark or share a view, and so
// the server does the counting rather than shipping every batch to the browser.
const filters = [
    { key: 'in_stock', label: 'In stock only' },
    { key: 'expiring_soon', label: 'Expiring < 90 days' },
    { key: 'expired', label: 'Expired' },
    { key: 'recalled', label: 'Under recall' },
];

export default function PharmacyStock({ batches, filters: active }) {
    const toggle = (key) => {
        const next = { ...active, [key]: active[key] ? 0 : 1 };
        router.get('/pharmacy/stock', next, { preserveState: true, replace: true });
    };

    const changePage = (page) => {
        router.get('/pharmacy/stock', { ...active, page }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Stock"
            subtitle={`${batches.meta.total} batch${batches.meta.total === 1 ? '' : 'es'} on record`}
        >
            <Head title="Pharmacy stock" />
            <PharmacyTabs current="/pharmacy/stock" />

            <div className="mb-4 flex flex-wrap gap-2">
                {filters.map((filter) => {
                    const isOn = Boolean(active[filter.key]);

                    return (
                        <Button
                            key={filter.key}
                            size="sm"
                            variant={isOn ? 'primary' : 'secondary'}
                            aria-pressed={isOn}
                            onClick={() => toggle(filter.key)}
                        >
                            {filter.label}
                        </Button>
                    );
                })}
            </div>

            <Card>
                {batches.data.length === 0 ? (
                    <EmptyState
                        title="No batches match"
                        description="Clear a filter, or receive a delivery to create the first batch."
                    />
                ) : (
                    <Table>
                        <thead>
                            <tr className="border-b border-slate-100">
                                <Th>Medicine</Th>
                                <Th>Batch</Th>
                                <Th>Expiry</Th>
                                <Th align="right">On hand</Th>
                                <Th align="right">Value</Th>
                                <Th>State</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                                {batches.data.map((batch) => (
                                    <tr key={batch.id} className="transition-colors hover:bg-slate-50/60">
                                        <Td>
                                            <span className="font-semibold text-slate-900">{batch.medicine?.name}</span>
                                            {batch.medicine?.strength && (
                                                <span className="block text-xs text-slate-500">
                                                    {batch.medicine.strength}
                                                </span>
                                            )}
                                        </Td>
                                        <Td className="font-mono text-xs text-slate-600">{batch.batch_number}</Td>
                                        <Td className="text-slate-600">{batch.expiry_date || '—'}</Td>
                                        <Td align="right" className="font-semibold text-slate-900">
                                            {batch.quantity_available}{' '}
                                            <span className="text-xs font-normal text-slate-500">{batch.medicine?.unit}</span>
                                        </Td>
                                        <Td align="right" className="text-slate-600">{money(batch.stock_value)}</Td>
                                        <Td>
                                            {/* Ordered most urgent first so the badge a
                                                user notices first is the one that
                                                blocks them. */}
                                            {batch.is_recalled ? (
                                                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-600/20 ring-inset">
                                                    Recalled
                                                </span>
                                            ) : batch.is_expired ? (
                                                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-600/20 ring-inset">
                                                    Expired
                                                </span>
                                            ) : batch.days_to_expiry !== null && batch.days_to_expiry <= 30 ? (
                                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-600/20 ring-inset">
                                                    {batch.days_to_expiry}d left
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Good</span>
                                            )}
                                        </Td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                )}
            </Card>

            <div className="mt-4">
                <Pagination meta={batches.meta} links={batches.links} onPageChange={changePage} />
            </div>
        </AppLayout>
    );
}
