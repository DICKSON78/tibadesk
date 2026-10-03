import { Link } from '@inertiajs/react';

/**
 * Secondary navigation for the pharmacy screens.
 *
 * The pharmacy is a single module spread over six tables, so each page links
 * back to the others rather than making the sidebar grow. The current page is
 * marked with aria-current rather than colour alone.
 */
const tabs = [
    { label: 'Overview', href: '/pharmacy' },
    { label: 'Stock', href: '/pharmacy/stock' },
    { label: 'Movements', href: '/pharmacy/movements' },
    { label: 'Purchases', href: '/pharmacy/purchases' },
    { label: 'Transfers', href: '/pharmacy/transfers' },
    { label: 'Suppliers', href: '/pharmacy/suppliers' },
];

export default function PharmacyTabs({ current }) {
    return (
        <nav aria-label="Pharmacy sections" className="mb-5 border-b border-slate-200">
            <ul className="-mb-px flex flex-wrap gap-x-1">
                {tabs.map((tab) => {
                    const isCurrent = tab.href === current;

                    return (
                        <li key={tab.href}>
                            <Link
                                href={tab.href}
                                aria-current={isCurrent ? 'page' : undefined}
                                className={`inline-block border-b-2 px-3.5 py-2.5 text-sm font-medium transition ${
                                    isCurrent
                                        ? 'border-brand-600 text-brand-700'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
