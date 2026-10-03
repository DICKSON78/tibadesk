import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import PharmacyTabs from '../../components/PharmacyTabs';
import { Button, Card, EmptyState, Pagination, Table, Td, Th, TextInput } from '../../components';

const money = (amount) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

export default function PharmacySuppliers({ suppliers, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounced: the supplier list is short, but this search is also used from
    // the purchase-order screen, where a keystroke per request would pile up.
    useEffect(() => {
        if (search === (filters.search || '')) return;

        const timer = setTimeout(() => {
            router.get('/pharmacy/suppliers', { search }, { preserveState: true, replace: true });
        }, 350);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const changePage = (page) => {
        router.get('/pharmacy/suppliers', { ...filters, page }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Suppliers"
            subtitle={`${suppliers.meta.total} supplier${suppliers.meta.total === 1 ? '' : 's'}`}
        >
            <Head title="Pharmacy suppliers" />
            <PharmacyTabs current="/pharmacy/suppliers" />

            <Card>
                <form onSubmit={(event) => event.preventDefault()} className="mb-4 max-w-sm">
                    <TextInput
                        label="Search suppliers"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Name"
                    />
                </form>

                {suppliers.data.length === 0 ? (
                    <EmptyState
                        title="No suppliers"
                        description={
                            filters.search
                                ? 'Nothing matches that search.'
                                : 'Add a supplier before raising the first purchase order.'
                        }
                    />
                ) : (
                    <Table>
                        <thead>
                            <tr className="border-b border-slate-100">
                                <Th>Supplier</Th>
                                <Th>Contact</Th>
                                <Th>Terms</Th>
                                <Th align="right">Purchased</Th>
                                <Th>Status</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                                {suppliers.data.map((supplier) => (
                                    <tr key={supplier.id} className="transition-colors hover:bg-slate-50/60">
                                        <Td>
                                            <span className="font-semibold text-slate-900">{supplier.name}</span>
                                            {supplier.city && (
                                                <span className="block text-xs text-slate-500">{supplier.city}</span>
                                            )}
                                        </Td>
                                        <Td className="text-slate-600">
                                            {supplier.contact_person || '—'}
                                            {supplier.phone && (
                                                <span className="block text-xs text-slate-500">{supplier.phone}</span>
                                            )}
                                        </Td>
                                        <Td className="text-slate-500">{supplier.payment_terms || '—'}</Td>
                                        <Td align="right" className="text-slate-600">
                                            {money(supplier.total_purchased)}
                                        </Td>
                                        <Td>
                                            {supplier.is_active ? (
                                                <span className="text-xs font-medium text-emerald-700">Active</span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Inactive</span>
                                            )}
                                        </Td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                )}
            </Card>

            <div className="mt-4">
                <Pagination meta={suppliers.meta} links={suppliers.links} onPageChange={changePage} />
            </div>
        </AppLayout>
    );
}
