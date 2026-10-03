import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { Alert, Button, Card, Select, TextInput } from '../../components';

export default function EncounterCreate({ patients, filters, types, paymentModes, preselected }) {
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, processing, errors } = useForm({
        patient_id: preselected ? String(preselected) : '',
        type: 'opd',
        payment_mode: 'cash',
        reason_for_visit: '',
        department: '',
    });

    useEffect(() => {
        if (search === (filters.search || '')) return;

        const timer = setTimeout(() => {
            router.get(
                '/encounters/create',
                { search, patient: preselected },
                { preserveState: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search, filters.search, preselected]);

    const submit = (event) => {
        event.preventDefault();
        post('/encounters');
    };

    const selected = patients.find((patient) => String(patient.id) === String(data.patient_id));

    return (
        <AppLayout
            title="Open an encounter"
            subtitle="The visit number is issued automatically when you save."
            actions={
                <Link href="/encounters">
                    <Button variant="secondary">Cancel</Button>
                </Link>
            }
        >
            <Head title="Open an encounter" />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                {Object.keys(errors).length > 0 && (
                    <Alert variant="error">Some details need attention. Check the highlighted fields.</Alert>
                )}

                <Card
                    title="Patient"
                    description="Search the register, then choose who this visit is for."
                >
                    <div className="mb-4 max-w-sm">
                        <TextInput
                            label="Search the register"
                            name="search"
                            placeholder="Name or patient number"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    {patients.length === 0 ? (
                        <p className="py-4 text-sm text-slate-500">
                            No patients match that search.{' '}
                            <Link href="/patients/create" className="font-medium text-brand-700 hover:underline">
                                Register a new patient
                            </Link>{' '}
                            instead.
                        </p>
                    ) : (
                        <fieldset className="divide-y divide-slate-100">
                            <legend className="sr-only">Choose a patient</legend>
                            {patients.map((patient) => (
                                <label
                                    key={patient.id}
                                    className="flex cursor-pointer items-center gap-3 py-2.5"
                                >
                                    <input
                                        type="radio"
                                        name="patient_id"
                                        value={patient.id}
                                        checked={String(data.patient_id) === String(patient.id)}
                                        onChange={(event) => setData('patient_id', event.target.value)}
                                        className="size-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-slate-900">
                                            {patient.full_name}
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            {patient.patient_number}
                                            {patient.age ? ` · ${patient.age} years` : ''}
                                            {patient.gender ? ` · ${patient.gender}` : ''}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                    )}

                    {errors.patient_id && <p className="mt-2 text-xs text-rose-600">{errors.patient_id}</p>}

                    {selected && (
                        <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                            Selected <span className="font-medium text-slate-900">{selected.full_name}</span>{' '}
                            ({selected.patient_number}).
                        </p>
                    )}
                </Card>

                <Card title="Visit">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Select
                            label="Visit type"
                            name="type"
                            value={data.type}
                            onChange={(event) => setData('type', event.target.value)}
                        >
                            {Object.entries(types).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                        <Select
                            label="Payment mode"
                            name="payment_mode"
                            value={data.payment_mode}
                            onChange={(event) => setData('payment_mode', event.target.value)}
                        >
                            {Object.entries(paymentModes).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                        <TextInput
                            label="Reason for visit"
                            name="reason_for_visit"
                            className="sm:col-span-2"
                            placeholder="What the patient has come for"
                            value={data.reason_for_visit}
                            onChange={(event) => setData('reason_for_visit', event.target.value)}
                            error={errors.reason_for_visit}
                        />
                        <TextInput
                            label="Department"
                            name="department"
                            value={data.department}
                            onChange={(event) => setData('department', event.target.value)}
                            error={errors.department}
                        />
                    </div>
                </Card>

                <div className="flex items-center gap-2">
                    <Button type="submit" loading={processing} disabled={!data.patient_id}>
                        Open encounter
                    </Button>
                    <Link href="/encounters">
                        <Button type="button" variant="ghost">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
