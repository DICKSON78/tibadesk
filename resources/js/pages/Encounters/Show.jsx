import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { Alert, Button, Card, StatusBadge, TextArea, TextInput } from '../../components';

/**
 * The consultation screen.
 *
 * Two rules shape this page. First, a signed consultation is read-only, and
 * the server refuses edits to it as well, so the form is disabled rather than
 * hidden: a clinician needs to see what was recorded and when. Second, the
 * allergies box sits at the top rather than in a history tab, because it is
 * the one field that has to be read before prescribing.
 */
function Detail({ label, value }) {
    return (
        <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
            <dd className="mt-0.5 text-sm text-slate-900">{value || '—'}</dd>
        </div>
    );
}

export default function EncounterShow({ encounter, patient }) {
    const { auth } = usePage().props;
    const capabilities = auth?.user?.capabilities || [];

    const canStart = capabilities.includes('consultations.view') && encounter.status === 'registered';
    const canWrite = capabilities.includes('consultations.create');
    const canComplete = capabilities.includes('consultations.complete');

    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(!encounter.status || encounter.status === 'registered');
    const [loadError, setLoadError] = useState(null);

    // The consultation is fetched on the client because the page is reached
    // from the waiting list as well as from the dashboard, and a patient with
    // no consultation yet must not 404 the whole visit screen.
    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setLoadError(null);

        window.axios
            .get(`/encounters/${encounter.id}/consultation`)
            .then(({ data }) => {
                if (!cancelled) setConsultation(data.data);
            })
            .catch((error) => {
                if (cancelled) return;

                // 404 simply means no consultation has been opened yet, which
                // is the normal state of a freshly registered visit.
                if (error.response?.status !== 404) {
                    setLoadError('The consultation could not be loaded.');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [encounter.id, encounter.status]);

    const locked = consultation?.is_locked === true;

    const { data, setData, post, processing, errors } = useForm({
        chief_complaint: consultation?.chief_complaint || '',
        history_present_illness: consultation?.history_present_illness || '',
        past_medical_history: consultation?.past_medical_history || '',
        drug_history: consultation?.drug_history || '',
        family_history: consultation?.family_history || '',
        allergy_history: consultation?.allergy_history || '',
        examination: consultation?.examination || '',
        clinical_notes: consultation?.clinical_notes || '',
        plan: consultation?.plan || '',
        remarks: consultation?.remarks || '',
        diagnoses: consultation?.diagnoses?.map((d) => ({ description: d.description, code: d.code, type: d.type })) || [],
        prescriptions: consultation?.prescriptions?.map((p) => ({
            medicine: p.medicine,
            dose: p.dose,
            route: p.route,
            frequency: p.frequency,
            duration: p.duration,
            quantity: p.quantity,
        })) || [],
    });

    useEffect(() => {
        if (!consultation) return;

        setData({
            chief_complaint: consultation.chief_complaint || '',
            history_present_illness: consultation.history_present_illness || '',
            past_medical_history: consultation.past_medical_history || '',
            drug_history: consultation.drug_history || '',
            family_history: consultation.family_history || '',
            allergy_history: consultation.allergy_history || '',
            examination: consultation.examination || '',
            clinical_notes: consultation.clinical_notes || '',
            plan: consultation.plan || '',
            remarks: consultation.remarks || '',
            diagnoses: consultation.diagnoses?.map((d) => ({ description: d.description, code: d.code, type: d.type })) || [],
            prescriptions: consultation.prescriptions?.map((p) => ({
                medicine: p.medicine,
                dose: p.dose,
                route: p.route,
                frequency: p.frequency,
                duration: p.duration,
                quantity: p.quantity,
            })) || [],
        });
    }, [consultation]);

    const save = (event) => {
        event.preventDefault();
        post(`/encounters/${encounter.id}/consultation`, { preserveScroll: true });
    };

    // One submit, not "save then complete". Sending two requests means the
    // notes on screen can be lost if the second one races the first, and the
    // button says the notes are saved, so they have to be.
    const saveAndComplete = () => {
        post(
            `/encounters/${encounter.id}/consultation`,
            { complete: true, preserveScroll: true },
        );
    };

    const start = () => {
        router.post(`/encounters/${encounter.id}/start`, {}, { preserveScroll: true });
    };

    const updateRow = (key, index, field, value) => {
        const rows = [...data[key]];
        rows[index] = { ...rows[index], [field]: value };
        setData(key, rows);
    };

    const removeRow = (key, index) => {
        setData(
            key,
            data[key].filter((_, position) => position !== index),
        );
    };

    const addRow = (key, blank) => setData(key, [...data[key], blank]);

    return (
        <AppLayout
            title={`${encounter.encounter_number} · ${patient.full_name}`}
            subtitle={`${encounter.type?.toUpperCase()} · ${encounter.reason_for_visit || 'General complaint'}`}
            actions={
                <>
                    <Link href="/encounters">
                        <Button variant="secondary">Back to visits</Button>
                    </Link>
                    <StatusBadge status={encounter.status} />
                </>
            }
        >
            <Head title={`${encounter.encounter_number} · ${patient.full_name}`} />

            <div className="space-y-6">
                {/* Allergies first. This is the field that has to be read
                    before anything is prescribed. */}
                {patient.allergy_history && (
                    <Alert variant="error">
                        <span className="font-semibold">Allergy note on file:</span> {patient.allergy_history}
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card title="Patient" className="lg:col-span-1">
                        <dl className="space-y-3">
                            <Detail label="Patient number" value={patient.patient_number} />
                            <Detail label="Name" value={patient.full_name} />
                            <Detail label="Age" value={patient.age ? `${patient.age} years` : null} />
                            <Detail label="Gender" value={patient.gender} />
                            <Detail label="Phone" value={patient.phone} />
                        </dl>
                        <Link
                            href={`/patients/${patient.id}`}
                            className="mt-4 inline-block text-xs font-medium text-brand-700 hover:underline"
                        >
                            Open full patient record
                        </Link>
                    </Card>

                    <Card title="Visit" className="lg:col-span-2">
                        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Detail label="Visit number" value={encounter.encounter_number} />
                            <Detail label="Payment mode" value={encounter.payment_mode} />
                            <Detail label="Department" value={encounter.department} />
                            <Detail label="Registered" value={encounter.registered_at} />
                            <Detail label="Started" value={encounter.started_at} />
                            <Detail label="Completed" value={encounter.completed_at} />
                        </dl>

                        {canStart && (
                            <Button onClick={start} className="mt-4">
                                Start consultation
                            </Button>
                        )}
                    </Card>
                </div>

                {loadError && <Alert variant="error">{loadError}</Alert>}
                {loading && <p className="text-sm text-slate-500">Loading consultation…</p>}

                {!loading && !consultation && (
                    <Card title="Consultation">
                        {canWrite ? (
                            <p className="text-sm text-slate-600">
                                No consultation has been written for this visit yet. Start the visit above, then
                                record the consultation below.
                            </p>
                        ) : (
                            <p className="text-sm text-slate-600">
                                No consultation has been written for this visit yet.
                            </p>
                        )}
                    </Card>
                )}

                {!loading && consultation && (
                    <>
                        {locked && (
                            <Alert variant="info">
                                This consultation was completed on{' '}
                                {new Date(consultation.completed_at).toLocaleString()}. It is now part of the
                                record and cannot be edited — raise a follow-up encounter for anything new.
                            </Alert>
                        )}

                        <form onSubmit={save} className="space-y-6">
                            <Card
                                title="Consultation notes"
                                actions={
                                    consultation.status === 'draft' && <StatusBadge status="draft" />
                                }
                            >
                                <div className="space-y-4">
                                    <TextInput
                                        label="Chief complaint"
                                        name="chief_complaint"
                                        disabled={locked}
                                        value={data.chief_complaint}
                                        onChange={(e) => setData('chief_complaint', e.target.value)}
                                        error={errors.chief_complaint}
                                    />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <TextArea
                                            label="History of present illness"
                                            name="history_present_illness"
                                            rows={4}
                                            disabled={locked}
                                            value={data.history_present_illness}
                                            onChange={(e) => setData('history_present_illness', e.target.value)}
                                        />
                                        <TextArea
                                            label="Examination"
                                            name="examination"
                                            rows={4}
                                            disabled={locked}
                                            value={data.examination}
                                            onChange={(e) => setData('examination', e.target.value)}
                                        />
                                        <TextArea
                                            label="Past medical history"
                                            name="past_medical_history"
                                            rows={3}
                                            disabled={locked}
                                            value={data.past_medical_history}
                                            onChange={(e) => setData('past_medical_history', e.target.value)}
                                        />
                                        <TextArea
                                            label="Drug history"
                                            name="drug_history"
                                            rows={3}
                                            disabled={locked}
                                            value={data.drug_history}
                                            onChange={(e) => setData('drug_history', e.target.value)}
                                        />
                                        <TextArea
                                            label="Family history"
                                            name="family_history"
                                            rows={3}
                                            disabled={locked}
                                            value={data.family_history}
                                            onChange={(e) => setData('family_history', e.target.value)}
                                        />
                                        <TextArea
                                            label="Allergy history"
                                            name="allergy_history"
                                            rows={3}
                                            disabled={locked}
                                            value={data.allergy_history}
                                            onChange={(e) => setData('allergy_history', e.target.value)}
                                        />
                                        <TextArea
                                            label="General health"
                                            name="general_health"
                                            rows={3}
                                            disabled={locked}
                                            value={data.general_health}
                                            onChange={(e) => setData('general_health', e.target.value)}
                                        />
                                        <TextArea
                                            label="Clinical notes"
                                            name="clinical_notes"
                                            rows={4}
                                            disabled={locked}
                                            value={data.clinical_notes}
                                            onChange={(e) => setData('clinical_notes', e.target.value)}
                                            error={errors.clinical_notes}
                                        />
                                        <TextArea
                                            label="Plan"
                                            name="plan"
                                            rows={3}
                                            disabled={locked}
                                            value={data.plan}
                                            onChange={(e) => setData('plan', e.target.value)}
                                        />
                                        <TextArea
                                            label="Remarks"
                                            name="remarks"
                                            rows={3}
                                            disabled={locked}
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card
                                title="Diagnoses"
                                description={locked ? undefined : 'The first entry is treated as the working diagnosis.'}
                            >
                                <div className="space-y-3">
                                    {data.diagnoses.map((diagnosis, index) => (
                                        <div key={index} className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
                                            <TextInput
                                                label={index === 0 ? 'Diagnosis' : null}
                                                name={`diagnoses.${index}.description`}
                                                disabled={locked}
                                                value={diagnosis.description}
                                                onChange={(e) =>
                                                    updateRow('diagnoses', index, 'description', e.target.value)
                                                }
                                            />
                                            <TextInput
                                                label={index === 0 ? 'Code' : null}
                                                name={`diagnoses.${index}.code`}
                                                disabled={locked}
                                                value={diagnosis.code || ''}
                                                onChange={(e) => updateRow('diagnoses', index, 'code', e.target.value)}
                                            />
                                            {!locked && (
                                                <div className={index === 0 ? 'pt-7' : ''}>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRow('diagnoses', index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {!locked && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() =>
                                                addRow('diagnoses', { description: '', code: '', type: 'preliminary' })
                                            }
                                        >
                                            Add diagnosis
                                        </Button>
                                    )}
                                </div>
                            </Card>

                            <Card title="Prescription" description={locked ? undefined : 'Dispensing is handled in the pharmacy module.'}>
                                <div className="space-y-4">
                                    {data.prescriptions.map((prescription, index) => (
                                        <div
                                            key={index}
                                            className="rounded-lg border border-slate-200 p-3"
                                        >
                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                <TextInput
                                                    label="Medicine"
                                                    className="lg:col-span-2"
                                                    name={`prescriptions.${index}.medicine`}
                                                    disabled={locked}
                                                    value={prescription.medicine}
                                                    onChange={(e) =>
                                                        updateRow('prescriptions', index, 'medicine', e.target.value)
                                                    }
                                                />
                                                <TextInput
                                                    label="Dose"
                                                    name={`prescriptions.${index}.dose`}
                                                    disabled={locked}
                                                    value={prescription.dose || ''}
                                                    onChange={(e) => updateRow('prescriptions', index, 'dose', e.target.value)}
                                                />
                                                <TextInput
                                                    label="Route"
                                                    name={`prescriptions.${index}.route`}
                                                    disabled={locked}
                                                    value={prescription.route || ''}
                                                    onChange={(e) => updateRow('prescriptions', index, 'route', e.target.value)}
                                                />
                                                <TextInput
                                                    label="Frequency"
                                                    name={`prescriptions.${index}.frequency`}
                                                    disabled={locked}
                                                    value={prescription.frequency || ''}
                                                    onChange={(e) =>
                                                        updateRow('prescriptions', index, 'frequency', e.target.value)
                                                    }
                                                />
                                                <TextInput
                                                    label="Duration"
                                                    name={`prescriptions.${index}.duration`}
                                                    disabled={locked}
                                                    value={prescription.duration || ''}
                                                    onChange={(e) =>
                                                        updateRow('prescriptions', index, 'duration', e.target.value)
                                                    }
                                                />
                                                <TextInput
                                                    label="Quantity"
                                                    type="number"
                                                    name={`prescriptions.${index}.quantity`}
                                                    disabled={locked}
                                                    value={prescription.quantity || 1}
                                                    onChange={(e) =>
                                                        updateRow('prescriptions', index, 'quantity', e.target.value)
                                                    }
                                                />
                                            </div>
                                            {!locked && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => removeRow('prescriptions', index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    {!locked && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() =>
                                                addRow('prescriptions', {
                                                    medicine: '',
                                                    dose: '',
                                                    route: 'Oral',
                                                    frequency: '',
                                                    duration: '',
                                                    quantity: 1,
                                                })
                                            }
                                        >
                                            Add medicine
                                        </Button>
                                    )}
                                </div>
                            </Card>

                            {!locked && canWrite && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button type="submit" loading={processing}>
                                        Save consultation
                                    </Button>
                                    {canComplete && consultation.status === 'draft' && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={saveAndComplete}
                                            loading={processing}
                                        >
                                            Save and complete
                                        </Button>
                                    )}
                                </div>
                            )}
                        </form>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
