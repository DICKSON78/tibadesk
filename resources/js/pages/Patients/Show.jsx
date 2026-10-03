import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Card, EmptyState, StatusBadge } from '../../components';

function Detail({ label, value }) {
    return (
        <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
            <dd className="mt-0.5 text-sm text-slate-900">{value || '—'}</dd>
        </div>
    );
}

export default function PatientShow({ patient, encounters }) {
    const { auth } = usePage().props;
    const canUpdate = (auth?.user?.capabilities || []).includes('patients.update');
    const canOpenEncounter = (auth?.user?.capabilities || []).includes('encounters.create');

    return (
        <AppLayout
            title={patient.full_name}
            subtitle={`Patient ${patient.patient_number}${patient.age ? ` · ${patient.age} years` : ''}`}
            actions={
                <>
                    <Link href="/patients">
                        <Button variant="secondary">Back to register</Button>
                    </Link>
                    {canUpdate && (
                        <Link href={`/patients/${patient.id}/edit`}>
                            <Button variant="secondary">Edit</Button>
                        </Link>
                    )}
                    {canOpenEncounter && (
                        <Link href={`/encounters/create?patient=${patient.id}`}>
                            <Button>Open encounter</Button>
                        </Link>
                    )}
                </>
            }
        >
            <Head title={patient.full_name} />

            <div className="space-y-6">
                <Card title="Patient details">
                    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Detail label="Patient number" value={patient.patient_number} />
                        <Detail label="Date of birth" value={patient.date_of_birth} />
                        <Detail label="Age" value={patient.age ? `${patient.age} years` : null} />
                        <Detail label="Gender" value={patient.gender} />
                        <Detail label="Phone" value={patient.phone} />
                        <Detail label="Email" value={patient.email} />
                        <Detail label="Registered" value={patient.registered_at} />
                        <Detail label="Registered by" value={patient.registered_by} />
                    </dl>

                    {patient.address && (
                        <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                            {patient.address}
                        </p>
                    )}
                </Card>

                {(patient.next_of_kin_name || patient.notes) && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {patient.next_of_kin_name && (
                            <Card title="Next of kin">
                                <dl className="grid gap-4 sm:grid-cols-3">
                                    <Detail label="Name" value={patient.next_of_kin_name} />
                                    <Detail label="Relationship" value={patient.next_of_kin_relationship} />
                                    <Detail label="Phone" value={patient.next_of_kin_phone} />
                                </dl>
                            </Card>
                        )}

                        {patient.notes && (
                            <Card title="Reception notes">
                                <p className="text-sm whitespace-pre-line text-slate-700">{patient.notes}</p>
                            </Card>
                        )}
                    </div>
                )}

                <Card
                    title="Visit history"
                    description="Every encounter opened for this patient at this facility."
                >
                    {encounters.length === 0 ? (
                        <EmptyState
                            title="No visits yet"
                            description="Open an encounter to start this patient’s clinical record."
                        />
                    ) : (
                        <div className="-mx-5 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-sm">
                                <thead>
                                    <tr className="text-left text-xs tracking-wide text-slate-500 uppercase">
                                        <th className="px-5 py-2 font-medium">Visit</th>
                                        <th className="px-5 py-2 font-medium">Type</th>
                                        <th className="px-5 py-2 font-medium">Reason</th>
                                        <th className="px-5 py-2 font-medium">Consultation</th>
                                        <th className="px-5 py-2 font-medium">Status</th>
                                        <th className="px-5 py-2 text-right font-medium">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {encounters.map((encounter) => (
                                        <tr key={encounter.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-2.5 font-medium">
                                                <Link
                                                    href={`/encounters/${encounter.id}`}
                                                    className="text-slate-900 hover:text-brand-700"
                                                >
                                                    {encounter.encounter_number}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600 uppercase">
                                                {encounter.type}
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600">
                                                {encounter.reason || '—'}
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-600">
                                                {encounter.has_consultation ? (
                                                    <StatusBadge status={encounter.consultation_status} />
                                                ) : (
                                                    <span className="text-xs text-slate-400">Not started</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <StatusBadge status={encounter.status} />
                                            </td>
                                            <td className="px-5 py-2.5 text-right text-slate-500 tabular-nums">
                                                {encounter.registered_at}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
