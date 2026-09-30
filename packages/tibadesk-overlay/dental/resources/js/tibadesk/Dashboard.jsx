/**
 * TIBADesk dashboard.
 *
 * The Pharmex home screen rebuilt for a hospital: the dark gradient header and
 * greeting block, the gradient call banner, the department tiles, and the
 * media cards all keep their original anatomy and weight scale.
 */

import { useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import {
    Banner,
    Card,
    ChartCard,
    HeroHeader,
    IconTile,
    MediaCard,
    SectionHeading,
    Sidebar,
    StatCard,
} from './index.jsx';
import { DataTable, TIBADeskShell } from './DataTable.jsx';

const DEPARTMENTS = [
    { label: ['Out-', 'patient'], icon: 'fa-stethoscope' },
    { label: ['In-', 'patient'], icon: 'fa-bed' },
    { label: ['Laboratory'], icon: 'fa-flask-vial' },
    { label: ['Pharmacy'], icon: 'fa-capsules' },
    { label: ['Emergency'], icon: 'fa-truck-medical' },
];

const STATS = [
    {
        label: 'Patients today',
        value: '184',
        icon: 'fa-users',
        tone: 'brand',
        delta: { direction: 'up', value: '12%' },
    },
    {
        label: 'Appointments',
        value: '62',
        icon: 'fa-calendar-check',
        tone: 'info',
        delta: { direction: 'up', value: '8%' },
    },
    {
        label: 'Admissions',
        value: '27',
        icon: 'fa-bed',
        tone: 'success',
        delta: { direction: 'down', value: '3%' },
    },
    {
        label: 'Revenue today',
        value: 'TZS 4.2M',
        icon: 'fa-file-invoice-dollar',
        tone: 'warning',
    },
];

const WARDS = [
    { title: 'General Ward', meta: '12 beds free', tag: '12 free', icon: 'fa-hospital' },
    { title: 'Maternity Ward', meta: '4 beds free', tag: '4 free', icon: 'fa-baby' },
];

const PATIENT_COLUMNS = [
    { key: 'patient', label: 'Patient', strong: true },
    { key: 'department', label: 'Department' },
    { key: 'admitted', label: 'Admitted' },
    { key: 'status', label: 'Status', status: true, statusLabel: {
        Admitted: 'Admitted', Discharged: 'Discharged', 'Awaiting lab': 'Awaiting lab', Critical: 'Critical',
    } },
];

const PATIENTS = [
    { id: 1, patient: 'Amina S. Juma', department: 'Out-patient', admitted: '08:20', status: 'Admitted' },
    { id: 2, patient: 'Peter M. Kileo', department: 'Maternity', admitted: '07:55', status: 'Awaiting lab' },
    { id: 3, patient: 'Grace A. Mushi', department: 'General Ward', admitted: 'Yesterday', status: 'Critical' },
    { id: 4, patient: 'Joseph T. Ndosi', department: 'Laboratory', admitted: 'Yesterday', status: 'Discharged' },
];

const VISITS = {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
        { name: 'Out-patient', data: [132, 148, 141, 176, 184, 96, 74] },
        { name: 'In-patient', data: [41, 38, 44, 39, 47, 52, 49] },
    ],
};

export default function TIBADeskDashboard() {
    const [activeHref, setActiveHref] = useState('#dashboard');
    const [name] = useState('Dr. Dickson Kade');

    const chartOptions = useMemo(
        () => ({
            chart: { type: 'area', toolbar: { show: false }, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
            colors: ['#010736', '#2D4EA8'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2.5 },
            fill: {
                type: 'gradient',
                gradient: { opacityFrom: 0.28, opacityTo: 0.02, stops: [0, 95, 100] },
            },
            grid: { borderColor: '#EEEFF1', strokeDashArray: 4 },
            xaxis: {
                categories: VISITS.categories,
                labels: { style: { colors: '#5A5A65', fontSize: '11px' } },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: { style: { colors: '#5A5A65', fontSize: '11px' } },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '11px',
                labels: { colors: '#5A5A65' },
                markers: { size: 5 },
            },
        }),
        [],
    );

    const series = useMemo(
        () => VISITS.series.map((entry) => ({ name: entry.name, data: entry.data })),
        [],
    );

    return (
        <TIBADeskShell
            sidebar={
                <Sidebar
                    name={name}
                    email="dickson@kadetech.co.tz"
                    licenceId="TBD-DENTAL-001"
                    activeHref={activeHref}
                    onNavigate={(item) => setActiveHref(item.href)}
                />
            }
            header={
                <HeroHeader
                    name={name}
                    subtitle="Admissions, laboratory, and billing across every department"
                    searchPlaceholder="Search patients, records, or invoices"
                    notifications={5}
                />
            }
        >
            <div className="space-y-6">
                <Banner
                    title="On-call doctor available"
                    subtitle="Night shift cover until 07:00"
                    actionLabel="Call now"
                    icon="fa-user-doctor"
                />

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {STATS.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </section>

                <Card className="p-5">
                    <SectionHeading title="Departments" />
                    <div className="mt-4 flex items-start justify-between gap-4">
                        {DEPARTMENTS.map((department) => (
                            <div key={department.label} className="flex flex-col items-center">
                                <IconTile icon={department.icon} />
                                <p className="mt-1.5 w-14 text-center text-[9.5px] font-bold leading-tight text-ink">
                                    {department.label.map((line) => (
                                        <span key={line} className="block">
                                            {line}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <ChartCard
                        title="Attendance this week"
                        caption="Out-patient against in-patient"
                        className="xl:col-span-2"
                        action={
                            <button
                                type="button"
                                className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 transition hover:text-navy-800"
                            >
                                View all
                                <i className="fa-solid fa-chevron-right text-[13px]" aria-hidden="true" />
                            </button>
                        }
                    >
                        <Chart options={chartOptions} series={series} type="area" height={260} />
                    </ChartCard>

                    <div>
                        <SectionHeading title="Ward availability" />
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            {WARDS.map((ward) => (
                                <MediaCard key={ward.title} {...ward} />
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <SectionHeading title="Recent admissions" />
                    <div className="mt-3">
                        <DataTable
                            columns={PATIENT_COLUMNS}
                            rows={PATIENTS}
                            caption="Recent admissions"
                        />
                    </div>
                </div>
            </div>
        </TIBADeskShell>
    );
}
