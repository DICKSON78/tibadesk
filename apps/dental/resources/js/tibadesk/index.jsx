/**
 * TIBADesk shell primitives.
 *
 * Ported from the Pharmex design language: the same anatomy, spacing, radii
 * and weight scale, rebuilt in Tailwind with the TIBADesk palette and clinical
 * context. No MUI anywhere in here.
 */

const cx = (...parts) => parts.filter(Boolean).join(' ');

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

export function Card({ as: Tag = 'div', className, children, ...props }) {
    return (
        <Tag
            className={cx('rounded-card border border-line bg-surface shadow-card', className)}
            {...props}
        >
            {children}
        </Tag>
    );
}

export function SectionHeading({ title, action, className }) {
    return (
        <div className={cx('flex items-center justify-between gap-4', className)}>
            <h2 className="text-[15px] font-extrabold text-ink">{title}</h2>
            {action ? (
                <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 transition hover:text-navy-800"
                >
                    {action.label}
                    <i className="fa-solid fa-chevron-right text-[13px]" aria-hidden="true" />
                </button>
            ) : null}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Badges                                                                     */
/* -------------------------------------------------------------------------- */

const STATUS_TONES = {
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
    neutral: 'bg-navy-50 text-navy-700',
};

export function StatusPill({ tone = 'neutral', className, children }) {
    return (
        <span
            className={cx(
                'inline-flex items-center rounded-full px-3 py-1 text-[10.5px] font-bold',
                STATUS_TONES[tone] ?? STATUS_TONES.neutral,
                className,
            )}
        >
            {children}
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/* Icon tile                                                                  */
/* -------------------------------------------------------------------------- */

export function IconTile({ icon, tone = 'brand', size = 'md', className }) {
    const tones = {
        brand: 'bg-navy-50 text-navy-600 border-line',
        success: 'bg-success-soft text-success border-success/15',
        warning: 'bg-warning-soft text-warning border-warning/15',
        danger: 'bg-danger-soft text-danger border-danger/15',
        info: 'bg-info-soft text-info border-info/15',
    };

    const dimensions = size === 'lg' ? 'h-14 w-14 rounded-panel' : 'h-10 w-10 rounded-tile';
    const glyph = size === 'lg' ? 'text-[26px]' : 'text-[20px]';

    return (
        <span
            className={cx(
                'inline-flex shrink-0 items-center justify-center border',
                dimensions,
                tones[tone] ?? tones.brand,
                className,
            )}
        >
            <i className={cx('fa-solid', icon, glyph)} aria-hidden="true" />
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

const NAV_SECTIONS = [
    {
        label: 'Overview',
        items: [{ label: 'Dashboard', icon: 'fa-table-columns', href: '#dashboard' }],
    },
    {
        label: 'Clinical',
        items: [
            { label: 'Patients', icon: 'fa-users', href: '#patients' },
            { label: 'Appointments', icon: 'fa-calendar-check', href: '#appointments', badge: '8' },
            { label: 'Admissions', icon: 'fa-bed', href: '#admissions' },
            { label: 'Laboratory', icon: 'fa-flask-vial', href: '#laboratory', badge: '3' },
        ],
    },
    {
        label: 'Management',
        items: [
            { label: 'Billing', icon: 'fa-file-invoice-dollar', href: '#billing' },
            { label: 'Inventory', icon: 'fa-boxes-stacked', href: '#inventory' },
            { label: 'Reports', icon: 'fa-chart-line', href: '#reports' },
        ],
    },
    {
        label: 'Account',
        items: [
            { label: 'Settings', icon: 'fa-gear', href: '#settings' },
            { label: 'Subscription', icon: 'fa-id-card-clip', href: '#subscription' },
        ],
    },
];

export function Sidebar({ name = 'TIBADesk User', email, licenceId, activeHref = '#dashboard', onNavigate }) {
    const initial = name.trim().charAt(0).toUpperCase() || '?';

    return (
        <div className="flex h-full w-[272px] shrink-0 flex-col bg-header-gradient text-white">
            <div className="px-6 pb-6 pt-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                    TIBADesk
                </p>
                <h1 className="mt-1.5 text-[18px] font-extrabold leading-tight">
                    Hospital Management
                </h1>
            </div>

            <div className="mx-4 mb-5 flex items-center gap-3 rounded-card bg-white/[0.06] p-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/[0.06] text-base font-extrabold">
                    {initial}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold">{name}</p>
                    <p className="truncate text-[11.5px] text-white/55">{email}</p>
                    {licenceId ? (
                        <p className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[9.5px] font-bold tracking-wide">
                            ID: {licenceId}
                        </p>
                    ) : null}
                </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-6" aria-label="Main">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label}>
                        <p className="mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/40">
                            {section.label}
                        </p>
                        <ul className="space-y-0.5" role="list">
                            {section.items.map((item) => {
                                const isActive = item.href === activeHref;

                                return (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            onClick={(event) => {
                                                if (!onNavigate) {
                                                    return;
                                                }
                                                event.preventDefault();
                                                onNavigate(item);
                                            }}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={cx(
                                                'flex items-center gap-3 rounded-tile px-3 py-2.5 text-[13px] transition',
                                                isActive
                                                    ? 'bg-white/10 font-bold text-white'
                                                    : 'font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white',
                                            )}
                                        >
                                            <i
                                                className={cx('fa-solid w-4 text-center', item.icon)}
                                                aria-hidden="true"
                                            />
                                            <span className="flex-1 truncate">{item.label}</span>
                                            {item.badge ? (
                                                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9.5px] font-bold">
                                                    {item.badge}
                                                </span>
                                            ) : null}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="border-t border-white/10 p-4">
                <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-tile px-3 py-2.5 text-[13px] font-bold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                >
                    <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center" aria-hidden="true" />
                    Sign out
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Hero header                                                                */
/* -------------------------------------------------------------------------- */

export function HeroHeader({
    name = 'TIBADesk User',
    subtitle = 'Patient care, admissions, and laboratory in one place',
    searchPlaceholder = 'Search patients, records, or invoices',
    notifications = 0,
    onOpenMenu,
}) {
    const initial = name.trim().charAt(0).toUpperCase() || '?';

    return (
        <header className="bg-header-gradient px-6 pb-[22px] pt-3 text-white">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/35 bg-white/[0.06] text-base font-extrabold">
                        {initial}
                    </span>
                    <div>
                        <p className="text-[12.5px] text-white/60">Good morning</p>
                        <p className="mt-0.5 text-xl font-extrabold leading-tight">{name}</p>
                        <p className="mt-1.5 max-w-[220px] text-[12.5px] leading-snug text-white/55">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onOpenMenu ? (
                        <button
                            type="button"
                            onClick={onOpenMenu}
                            aria-label="Open navigation"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] transition hover:bg-white/15"
                        >
                            <i className="fa-solid fa-bars text-[18px]" aria-hidden="true" />
                        </button>
                    ) : null}
                    <button
                        type="button"
                        aria-label={`Notifications${notifications ? `, ${notifications} unread` : ''}`}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] transition hover:bg-white/15"
                    >
                        <i className="fa-solid fa-bell text-[18px]" aria-hidden="true" />
                        {notifications ? (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold">
                                {notifications}
                            </span>
                        ) : null}
                    </button>
                </div>
            </div>

            <div className="mt-[18px] flex items-center gap-2.5 rounded-card bg-surface px-4 py-3.5">
                <i className="fa-solid fa-magnifying-glass text-[18px] text-muted" aria-hidden="true" />
                <input
                    type="search"
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-muted"
                />
            </div>
        </header>
    );
}

/* -------------------------------------------------------------------------- */
/* Banner                                                                     */
/* -------------------------------------------------------------------------- */

export function Banner({ title, subtitle, actionLabel, icon = 'fa-user-doctor', onAction }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-panel bg-banner-gradient px-4 py-3.5 text-white">
            <div className="min-w-0">
                <p className="text-[15px] font-extrabold">{title}</p>
                {subtitle ? <p className="mt-0.5 text-[11px] text-white/75">{subtitle}</p> : null}
                {actionLabel ? (
                    <button
                        type="button"
                        onClick={onAction}
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-[11px] font-bold text-navy-800 transition hover:bg-navy-50"
                    >
                        <i className="fa-solid fa-phone text-[13px]" aria-hidden="true" />
                        {actionLabel}
                    </button>
                ) : null}
            </div>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-tile bg-white/[0.12]">
                <i className={cx('fa-solid', icon, 'text-[26px]')} aria-hidden="true" />
            </span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Stat card                                                                  */
/* -------------------------------------------------------------------------- */

export function StatCard({ label, value, delta, icon, tone = 'brand' }) {
    const deltaTone =
        delta?.direction === 'up'
            ? 'text-success'
            : delta?.direction === 'down'
              ? 'text-danger'
              : 'text-muted';

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">
                        {label}
                    </p>
                    <p className="mt-1.5 text-2xl font-extrabold leading-none text-ink">{value}</p>
                </div>
                <IconTile icon={icon} tone={tone} />
            </div>
            {delta ? (
                <p className={cx('mt-3 text-[11px] font-bold', deltaTone)}>
                    <i
                        className={cx(
                            'fa-solid mr-1 text-[10px]',
                            delta.direction === 'down' ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up',
                        )}
                        aria-hidden="true"
                    />
                    {delta.value} <span className="font-semibold text-muted">vs last week</span>
                </p>
            ) : null}
        </Card>
    );
}

/* -------------------------------------------------------------------------- */
/* Chart shell                                                                */
/* -------------------------------------------------------------------------- */

export function ChartCard({ title, caption, action, children, className }) {
    return (
        <Card className={cx('p-5', className)}>
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-[15px] font-extrabold text-ink">{title}</h2>
                    {caption ? <p className="mt-0.5 text-[11.5px] text-muted">{caption}</p> : null}
                </div>
                {action}
            </div>
            {children}
        </Card>
    );
}

/* -------------------------------------------------------------------------- */
/* Media card                                                                 */
/* -------------------------------------------------------------------------- */

export function MediaCard({ title, meta, metaIcon = 'fa-location-dot', tag, icon = 'fa-hospital' }) {
    return (
        <Card className="overflow-hidden">
            <div className="relative flex h-28 items-center justify-center bg-media-gradient">
                {tag ? (
                    <span className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-1 text-[10px] font-bold text-white">
                        {tag}
                    </span>
                ) : null}
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface">
                    <i className={cx('fa-solid', icon, 'text-[20px] text-navy-700')} aria-hidden="true" />
                </span>
            </div>
            <div className="p-2.5">
                <p className="truncate text-[12.5px] font-bold text-ink">{title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted">
                    <i className={cx('fa-solid', metaIcon, 'text-[10px]')} aria-hidden="true" />
                    <span className="truncate">{meta}</span>
                </p>
            </div>
        </Card>
    );
}

export { cx };
