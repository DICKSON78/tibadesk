import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import PharmacyTabs from '../../components/PharmacyTabs';
import { Button, Card, EmptyState, Pagination, Select, StatusBadge, Table, Td, Th } from '../../components';

const money = (amount) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

const statuses = ['draft', 'ordered', 'partially_received', 'received', 'cancelled'];

export default function PharmacyPurchases({ orders, filters }) {
    const changePage = (page) => {
        router.get('/pharmacy/purchases', { ...filters, page }, { preserveState: true });
    };

    return (
        <AppLayout title="Purchases" subtitle={`${orders.meta.total} purchase order${orders.meta.total === 1 ? '' : 's'}`}>
            <Head title="Pharmacy purchases" />
            <PharmacyTabs current="/pharmacy/purchases" />

            <Card className="mb-4">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        router.get(
                            '/pharmacy/purchases',
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

            {orders.data.length === 0 ? (
                <Card>
                    <EmptyState
                        title="No purchase orders"
                        description="Raise an order through the API, or import one from Phermex."
                    />
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.data.map((order) => (
                        <Card key={order.id}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-mono text-sm font-semibold text-slate-900">
                                            {order.order_number}
                                        </h2>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {order.supplier?.name || 'Unknown supplier'}
                                        {order.expected_on && ` · expected ${order.expected_on}`}
                                    </p>
                                </div>
                                <p className="text-sm font-semibold text-slate-900 tabular-nums">
                                    {money(order.total_value)}
                                </p>
                            </div>

                            <div className="mt-2">
                                <Table>
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <Th>Medicine</Th>
                                            <Th>Batch</Th>
                                            <Th>Expiry</Th>
                                            <Th align="right">Ordered</Th>
                                            <Th align="right">Received</Th>
                                            <Th align="right">Outstanding</Th>
                                            <Th align="right">Line total</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="transition-colors hover:bg-slate-50/60">
                                                <Td className="font-medium text-slate-900">{item.medicine?.name}</Td>
                                                <Td className="font-mono text-xs text-slate-600">
                                                    {item.batch_number || '—'}
                                                </Td>
                                                <Td className="text-slate-600">{item.expiry_date || '—'}</Td>
                                                <Td align="right" className="text-slate-600">
                                                    {item.quantity_ordered}
                                                </Td>
                                                <Td align="right" className="text-slate-600">
                                                    {item.quantity_received}
                                                </Td>
                                                <Td
                                                    align="right"
                                                    className={
                                                        item.quantity_outstanding > 0
                                                            ? 'font-semibold text-amber-700'
                                                            : 'text-slate-400'
                                                    }
                                                >
                                                    {item.quantity_outstanding}
                                                </Td>
                                                <Td align="right" className="text-slate-600">
                                                    {money(item.line_total)}
                                                </Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <Pagination meta={orders.meta} links={orders.links} onPageChange={changePage} />
            </div>
        </AppLayout>
    );
}
