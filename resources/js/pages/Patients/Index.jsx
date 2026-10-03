import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Card, EmptyState, Pagination, TextInput } from '../../components';

export default function PatientsIndex({ patients, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const canRegister = (auth?.user?.capabilities || []).includes('patients.register');

    // Debounced so typing does not fire a request per keystroke against the
    // patient register, which is the busiest table in the system.
    useEffect(() => {
        if (search === (filters.search || '')) return;

        const timer = setTimeout(() => {
            router.get('/patients', { search }, { preserveState: true, replace: true });
        }, 350);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const changePage = (page) => {
        router.get('/patients', { ...filters, page }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Patients"
            subtitle={`${patients.meta.total} registered at this facility`}
            actions={
                canRegister && (
                    <Link href="/patients/create">
                        <Button>Register patient</Button>
                    </Link>
                )
            }
        >
            <Head title="Patients" />

            <Card>
                <form onSubmit={(event) => event.preventDefault()} className="mb-4 max-w-sm">
                    <TextInput
                        label="Search the register"
                        name="search"
                        placeholder="Name or patient number"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </form>

                {patients.data.length === 0 ? (
                    <EmptyState
                        title={filters.search ? 'No patients match that search' : 'No patients registered yet'}
                        description={
                            filters.search
                                ? 'Try part of a surname or a patient number.'
                                : 'Register the first patient to start building the facility’s patient file.'
                        }
                        action={
                            canRegister && (
                                <Link href="/patients/create">
                                    <Button variant="secondary">Register patient</Button>
                                </Link>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="-mx-5 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-sm">
                                <thead>
                                    <tr className="text-left text-xs tracking-wide text-slate-500 uppercase">
                                        <th className="px-5 py-2 font-medium">Number</th>
                                        <th className="px-5 py-2 font-medium">Name</th>
                                        <th className="px-5 py-2 font-medium">Age</th>
                                        <th className="px-5 py-2 font-medium">Gender</th>
                                        <th className="px-5 py-2 font-medium">Phone</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {patients.data.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-2.5 font-medium text-slate-500 tabular-nums">
                                                <Link href={`/patients/${patient.id}`} className="hover:text-brand-700">
                                                    {patient.patient_number}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <Link
                                                    href={`/patients/${patient.id}`}
                                                    className="font-medium text-slate-900 hover:text-brand-700"
                                                >
                                                    {patient.full_name}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600 tabular-nums">
                                                {patient.age ?? '—'}
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600 capitalize">
                                                {patient.gender || '—'}
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600 tabular-nums">
                                                {patient.phone || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination meta={patients.meta} links={patients.links} onPageChange={changePage} />
                    </>
                )}
            </Card>
        </AppLayout>
    );
}
