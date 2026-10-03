import { forwardRef } from 'react';

/**
 * The clinical forms are long and a receptionist fills them in a hurry, so the
 * base elements are deliberately plain and consistent: one focus ring, one
 * disabled treatment, one error treatment. Anything cleverer per screen tends
 * to drift away from the rest.
 */

const controlClasses = (hasError, extra = '') => [
    'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-xs transition',
    'placeholder:text-slate-400',
    'focus:outline-none focus:ring-2',
    hasError
        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
        : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200',
    'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
    extra,
].join(' ');

export const Label = ({ htmlFor, children, required, hint }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {children}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
        {hint && <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>}
    </label>
);

export const FieldError = ({ children }) => {
    if (!children) return null;

    return <p className="mt-1 text-xs text-rose-600">{children}</p>;
};

export const TextInput = forwardRef(function TextInput(
    { label, error, hint, required, className = '', ...props },
    ref,
) {
    const id = props.id || props.name;

    return (
        <div className={className}>
            {label && (
                <Label htmlFor={id} required={required} hint={hint}>
                    {label}
                </Label>
            )}
            <input
                ref={ref}
                id={id}
                aria-invalid={Boolean(error)}
                className={`mt-1.5 ${controlClasses(Boolean(error))}`}
                {...props}
            />
            <FieldError>{error}</FieldError>
        </div>
    );
});

export const TextArea = forwardRef(function TextArea(
    { label, error, hint, rows = 3, className = '', ...props },
    ref,
) {
    const id = props.id || props.name;

    return (
        <div className={className}>
            {label && (
                <Label htmlFor={id} required={props.required} hint={hint}>
                    {label}
                </Label>
            )}
            <textarea
                ref={ref}
                id={id}
                rows={rows}
                aria-invalid={Boolean(error)}
                className={`mt-1.5 ${controlClasses(Boolean(error))}`}
                {...props}
            />
            <FieldError>{error}</FieldError>
        </div>
    );
});

export const Select = forwardRef(function Select(
    { label, error, hint, children, className = '', ...props },
    ref,
) {
    const id = props.id || props.name;

    return (
        <div className={className}>
            {label && (
                <Label htmlFor={id} required={props.required} hint={hint}>
                    {label}
                </Label>
            )}
            <select
                ref={ref}
                id={id}
                aria-invalid={Boolean(error)}
                className={`mt-1.5 ${controlClasses(Boolean(error))}`}
                {...props}
            >
                {children}
            </select>
            <FieldError>{error}</FieldError>
        </div>
    );
});

const variants = {
    primary:
        'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 shadow-sm active:translate-y-px',
    secondary:
        'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 focus-visible:outline-slate-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600 shadow-sm active:translate-y-px',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
};

export const Button = forwardRef(function Button(
    { variant = 'primary', size = 'md', className = '', loading = false, children, disabled, ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={[
                'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-60',
                variants[variant],
                sizes[size],
                className,
            ].join(' ')}
            {...props}
        >
            {loading && (
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            )}
            {children}
        </button>
    );
});

export const Card = ({ title, description, actions, children, className = '' }) => (
    <section className={`surface-card ${className}`}>
        {(title || actions) && (
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                    {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
                    {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </header>
        )}
        {/* Padded on the body rather than the section, so a card with no header
            still lines up with one that has a title bar. */}
        <div className="p-5">{children}</div>
    </section>
);

/**
 * A single headline number.
 *
 * The icon carries a tinted background rather than a coloured glyph, which
 * keeps a wall of stats readable when several of them are warnings.
 */
export const StatCard = ({ icon: IconGlyph, label, value, hint, tone = 'brand' }) => {
    const tones = {
        brand: 'bg-brand-50 text-brand-700',
        amber: 'bg-amber-50 text-amber-700',
        rose: 'bg-rose-50 text-rose-700',
        slate: 'bg-slate-100 text-slate-600',
    };

    return (
        <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        {label}
                    </p>
                    <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
                    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
                </div>
                {IconGlyph && (
                    <div className={`stat-icon ${tones[tone] || tones.brand}`}>
                        <IconGlyph className="size-5" />
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * The shared table chrome: header row, zebra-free dividers and a consistent
 * cell rhythm, so every list in the app reads as one system.
 *
 * Column widths stay with the caller. Sorting and paging are deliberately not
 * handled here — those are server concerns, and a client-side sort over a
 * partial result set quietly lies to the user.
 */
export const Table = ({ children, className = '' }) => (
    <div className={`overflow-x-auto ${className}`}>
        <table className="w-full text-sm">{children}</table>
    </div>
);

export const Th = ({ children, align = 'left', className = '' }) => (
    <th
        scope="col"
        className={`px-3 py-2.5 text-[11px] font-semibold tracking-wider whitespace-nowrap text-slate-400 uppercase ${
            align === 'right' ? 'text-right' : 'text-left'
        } ${className}`}
    >
        {children}
    </th>
);

export const Td = ({ children, align = 'left', className = '' }) => (
    <td
        className={`px-3 py-3 align-middle ${
            align === 'right' ? 'text-right tabular-nums' : 'text-left'
        } ${className}`}
    >
        {children}
    </td>
);


const statusStyles = {
    registered: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    in_progress: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    draft: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    suspended: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    expired: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    // Pharmacy lifecycle states. A short delivery lands on partially_received,
    // and goods in transit must not look settled, so both are amber.
    ordered: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    partially_received: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    received: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    approved: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    in_transit: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const statusLabels = {
    registered: 'Waiting',
    in_progress: 'In consultation',
    completed: 'Completed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    pending: 'Pending',
    active: 'Active',
    suspended: 'Suspended',
    expired: 'Expired',
    ordered: 'Ordered',
    partially_received: 'Part received',
    received: 'Received',
    approved: 'Approved',
    in_transit: 'In transit',
    rejected: 'Rejected',
};

export const StatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
            statusStyles[status] || statusStyles.draft
        }`}
    >
        {statusLabels[status] || status}
    </span>
);

export const Alert = ({ variant = 'info', children }) => {
    const styles = {
        success: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
        error: 'bg-rose-50 text-rose-800 ring-rose-600/20',
        info: 'bg-sky-50 text-sky-800 ring-sky-600/20',
    };

    if (!children) return null;

    return (
        <div className={`rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${styles[variant]}`}>
            {children}
        </div>
    );
};

export const EmptyState = ({ title, description, action }) => (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        </div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
    </div>
);

export const Pagination = ({ meta, links, onPageChange }) => {
    if (!meta || meta.last_page <= 1) return null;

    return (
        <nav className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
            <p className="text-xs text-slate-500">
                Showing <span className="font-medium text-slate-700">{meta.from}</span> to{' '}
                <span className="font-medium text-slate-700">{meta.to}</span> of{' '}
                <span className="font-medium text-slate-700">{meta.total}</span>
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page <= 1}
                    onClick={() => onPageChange(meta.current_page - 1)}
                >
                    Previous
                </Button>
                <span className="px-2 text-xs text-slate-500">
                    Page {meta.current_page} of {meta.last_page}
                </span>
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                >
                    Next
                </Button>
            </div>
        </nav>
    );
};
