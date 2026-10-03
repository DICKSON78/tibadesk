/**
 * TIBADesk data table.
 *
 * Mirrors the Pharmex list pattern - white surface, hairline border, soft
 * shadow, 16px radius, muted uppercase column labels - in Tailwind only.
 */

import { cx, StatusPill } from './index.jsx';

const TONES = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    neutral: 'neutral',
};

export function DataTable({ columns, rows, caption, emptyMessage = 'Nothing to show yet.' }) {
    return (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <table className="w-full border-collapse text-left">
                {caption ? <caption className="sr-only">{caption}</caption> : null}
                <thead>
                    <tr className="border-b border-line bg-subtle">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={cx(
                                    'px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted',
                                    column.align === 'right' && 'text-right',
                                )}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-10 text-center text-[12.5px] text-muted"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr
                                key={row.id ?? row.key}
                                className="border-b border-line/70 transition last:border-0 hover:bg-subtle"
                            >
                                {columns.map((column) => {
                                    const value = row[column.key];

                                    return (
                                        <td
                                            key={column.key}
                                            className={cx(
                                                'px-4 py-3 text-[12.5px] text-navy-700',
                                                column.align === 'right' && 'text-right',
                                                column.strong && 'font-bold text-ink',
                                            )}
                                        >
                                            {column.status && value ? (
                                                <StatusPill tone={TONES[value] ?? 'neutral'}>
                                                    {column.statusLabel?.[value] ?? value}
                                                </StatusPill>
                                            ) : (
                                                value
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function TIBADeskShell({ sidebar, header, children, className }) {
    return (
        <div className={cx('flex min-h-screen bg-canvas font-sans text-ink', className)}>
            <div className="hidden lg:block">{sidebar}</div>

            <div className="flex min-w-0 flex-1 flex-col">
                {header}
                <main className="flex-1 px-6 py-4">{children}</main>
            </div>
        </div>
    );
}
