import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import PharmacyTabs from '../../components/PharmacyTabs';
import { Button, Card, EmptyState, Pagination, Select, StatusBadge, Table, Td, Th } from '../../components';

const statuses = ['pending', 'approved', 'in_transit', 'completed', 'rejected'];

export default function PharmacyTransfers({ transfers, filters }) {
    const changePage = (page) => {
        router.get('/pharmacy/transfers', { ...filters, page }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Transfers"
            subtitle={`${transfers.meta.total} transfer${transfers.meta.total === 1 ? '' : 's'}`}
        >
            <Head title="Pharmacy transfers" />
            <PharmacyTabs current="/pharmacy/transfers" />

            <Card className="mb-4">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        router.get(
                            '/pharmacy/transfers',
                            { status: event.target.status.value },
                            { preserveState: true, replace: true },
                        );
                    }}
                    className="flex flex-wrap items-end gap-3"
                >
                    <Select label="Status" name="status" defaultValue={filters.status || ''} className="w-56">
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </Select>
                    <Button type="submit" variant="secondary">
                        Apply
                    </Button>
                </form>
            </Card>

            {transfers.data.length === 0 ? (
                <Card>
                    <EmptyState
                        title="No transfers"
                        description="A transfer moves stock through transit so nothing leaves a location before it arrives."
                    />
                </Card>
            ) : (
                <div className="space-y-4">
                    {transfers.data.map((transfer) => {
                        const short = transfer.items.filter((item) => item.quantity_received !== null && item.quantity_received < item.quantity_sent);

                        return (
                            <Card key={transfer.id}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-mono text-sm font-semibold text-slate-900">
                                                {transfer.transfer_number}
                                            </h2>
                                            <StatusBadge status={transfer.status} />
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {transfer.from_location?.name || '—'} &rarr;{' '}
                                            {transfer.to_location?.name || '—'}
                                        </p>
                                    </div>
                                    {transfer.notes && (
                                        <p className="max-w-sm text-sm text-slate-500">{transfer.notes}</p>
                                    )}
                                </div>

                                <div className="mt-2">
                                    <Table>
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <Th>Medicine</Th>
                                                <Th align="right">Sent</Th>
                                                <Th align="right">Received</Th>
                                                <Th align="right">Short</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {transfer.items.map((item) => {
                                                const isShort =
                                                    item.quantity_received !== null &&
                                                    item.quantity_received < item.quantity_sent;

                                                return (
                                                    <tr key={item.id} className="transition-colors hover:bg-slate-50/60">
                                                        <Td className="font-medium text-slate-900">
                                                            {item.medicine?.name}
                                                        </Td>
                                                        <Td align="right" className="text-slate-600">
                                                            {item.quantity_sent}
                                                        </Td>
                                                        <Td align="right" className="text-slate-600">
                                                            {item.quantity_received === null
                                                                ? '—'
                                                                : item.quantity_received}
                                                        </Td>
                                                        <Td align="right">
                                                            {isShort ? (
                                                                <span className="font-semibold text-rose-600">
                                                                    {item.quantity_sent - item.quantity_received}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">—</span>
                                                            )}
                                                        </Td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>

                                {short.length > 0 && (
                                    <p className="mt-3 text-xs text-slate-500">
                                        Short quantities were written off from transit when this transfer was
                                        received, so the ledger still balances.
                                    </p>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="mt-4">
                <Pagination meta={transfers.meta} links={transfers.links} onPageChange={changePage} />
            </div>
        </AppLayout>
    );
}
