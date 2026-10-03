import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Icon from '../components/Icon';
import { Alert } from '../components';

/**
 * The facility shell.
 *
 * Navigation is built from the modules the facility actually holds rather than
 * from a hard-coded list, so a clinic without pharmacy is never shown a
 * pharmacy link that would only fail when clicked. The same rule is enforced on
 * the server, so hiding it here is a courtesy, not the security boundary.
 *
 * The facility is displayed, never chosen. Which facility a request runs
 * against is bound from the signed-in session on the server; putting a picker
 * in the sidebar would be a tenant switcher, and every one of those is a
 * cross-facility data leak waiting for a mistimed click.
 */
const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [{ label: 'Today', href: '/', icon: 'layout-dashboard' }],
    },
    {
        label: 'Clinical',
        items: [
            { module: 'registration', label: 'Patients', href: '/patients', icon: 'users' },
            { module: 'registration', label: 'Encounters', href: '/encounters', icon: 'clipboard-list' },
        ],
    },
    {
        label: 'Modules',
        items: [
            { module: 'pharmacy', label: 'Pharmacy', href: '/pharmacy', icon: 'beaker' },
            { module: 'laboratory', label: 'Laboratory', href: '#', icon: 'flask', soon: true },
            { module: 'dental', label: 'Dental', href: '#', icon: 'tooth', soon: true },
            { module: 'eye', label: 'Eye clinic', href: '#', icon: 'eye', soon: true },
        ],
    },
    {
        label: 'Applications',
        items: [
            // The imported pharmacy, dental and eye packages. Each is a
            // separate application framed inside this shell.
            { module: 'pharmacy', label: 'Pharmacy app', href: '/apps/pharmacy/open', icon: 'beaker' },
            { module: 'dental', label: 'Dental app', href: '/apps/dental/open', icon: 'tooth' },
            { module: 'eye', label: 'Eye clinic app', href: '/apps/eye/open', icon: 'eye' },
        ],
    },
    {
        label: 'Business',
        items: [
            { module: 'billing', label: 'Billing', href: '#', icon: 'receipt', soon: true },
            { module: 'reporting', label: 'Reports', href: '#', icon: 'bar-chart', soon: true },
        ],
    },
];

function Brand() {
    return (
        <Link href="/" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-sm">
                <Icon name="stethoscope" className="size-5" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-[15px] leading-tight font-bold text-white">TibaDesk</p>
                <p className="truncate text-[11px] text-ink-300">Clinical ERP</p>
            </div>
        </Link>
    );
}

/**
 * One navigation row. The active row is marked by a filled brand background as
 * well as by colour, so the current page is still identifiable to someone who
 * cannot separate the hues.
 */
function NavItem({ link, onNavigate }) {
    const isSoon = Boolean(link.soon);

    return (
        <Link
            href={link.href}
            onClick={onNavigate}
            aria-current={undefined}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-200 transition-colors"
            active={!isSoon}
        >
            {({ isActive }) => (
                <span
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        isActive
                            ? 'bg-brand-500/15 font-semibold text-white ring-1 ring-brand-400/30 ring-inset'
                            : 'text-ink-200 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <Icon
                        name={link.icon}
                        className={`size-5 shrink-0 ${isActive ? 'text-brand-300' : 'text-ink-400 group-hover:text-ink-200'}`}
                    />
                    <span className="flex-1 truncate">{link.label}</span>
                    {isSoon && (
                        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-400 uppercase">
                            Soon
                        </span>
                    )}
                </span>
            )}
        </Link>
    );
}

export default function AppLayout({ title, subtitle, actions, children }) {
    const { auth, flash } = usePage().props;
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState({});

    const heldModules = auth?.facility?.modules || [];
    const close = () => setOpen(false);

    const groups = NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.module || heldModules.includes(item.module)),
    })).filter((group) => group.items.length > 0);

    const navigation = (
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
            {groups.map((group) => {
                const isCollapsed = collapsed[group.label];

                return (
                    <div key={group.label}>
                        <button
                            type="button"
                            onClick={() => setCollapsed((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                            aria-expanded={!isCollapsed}
                            className="flex w-full items-center gap-2 px-3 pb-1.5 text-[10px] font-bold tracking-[0.12em] text-ink-500 uppercase transition-colors hover:text-ink-300"
                        >
                            {group.label}
                            <Icon
                                name="chevron-down"
                                className={`ml-auto size-3.5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                            />
                        </button>

                        {!isCollapsed && (
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavItem key={item.label} link={item} onNavigate={close} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );

    const userPanel = (
        <div className="border-t border-white/5 p-3">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-200">
                    {auth?.user?.initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{auth?.user?.name}</p>
                    <p className="truncate text-xs text-ink-400">{auth?.user?.role_label}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => router.post('/logout')}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-white"
            >
                <Icon name="log-out" className="size-5 shrink-0" />
                Sign out
            </button>
        </div>
    );

    return (
        <div className="min-h-full bg-canvas">
            {/* Mobile bar */}
            <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Toggle navigation"
                    aria-expanded={open}
                >
                    <Icon name="menu" />
                </button>
                <span className="truncate text-sm font-semibold text-slate-900">{auth?.facility?.name}</span>
            </div>

            {open && (
                <div className="border-b border-ink-800 bg-ink-950 lg:hidden">
                    <div className="px-5 py-4">
                        <Brand />
                    </div>
                    {navigation}
                    {userPanel}
                </div>
            )}

            <div className="flex">
                <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-ink-950 lg:flex">
                    <div className="px-5 py-5">
                        <Brand />
                    </div>

                    {/* Which facility this is, and that it cannot be changed from
                        here. Labelled explicitly so a user moving between
                        tenants never assumes a click will switch them. */}
                    <div className="mx-3 mb-4 rounded-xl bg-white/5 px-3 py-2.5">
                        <p className="text-[10px] font-semibold tracking-wider text-ink-500 uppercase">
                            Current facility
                        </p>
                        <p className="truncate text-sm font-semibold text-white">{auth?.facility?.name}</p>
                        <p className="truncate text-[11px] text-ink-400">{auth?.facility?.edition_label}</p>
                    </div>

                    {navigation}
                    {userPanel}
                </aside>

                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur sm:px-8">
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold text-slate-900">{title}</h1>
                            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
                        </div>
                        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                    </header>

                    <main className="page-shell px-5 py-6 sm:px-8">
                        {(flash?.success || flash?.error) && (
                            <div className="mb-5">
                                <Alert variant={flash?.error ? 'error' : 'success'}>
                                    {flash?.error || flash?.success}
                                </Alert>
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
