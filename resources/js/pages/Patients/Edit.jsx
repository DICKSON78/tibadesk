import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Alert, Button, Card, Select, TextArea, TextInput } from '../../components';

export default function PatientEdit({ patient, genders }) {
    const { data, setData, put, processing, errors } = useForm({ ...patient });

    const submit = (event) => {
        event.preventDefault();
        put(`/patients/${patient.id}`);
    };

    return (
        <AppLayout
            title={`Edit ${patient.first_name}`}
            subtitle={`Patient ${patient.patient_number ?? ''}`}
            actions={
                <Link href={`/patients/${patient.id}`}>
                    <Button variant="secondary">Cancel</Button>
                </Link>
            }
        >
            <Head title="Edit patient" />

            <form onSubmit={submit} className="max-w-4xl space-y-6">
                {Object.keys(errors).length > 0 && (
                    <Alert variant="error">Some details need attention. Check the highlighted fields.</Alert>
                )}

                <Card title="Patient details">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <TextInput
                            label="First name"
                            name="first_name"
                            required
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            error={errors.first_name}
                        />
                        <TextInput
                            label="Middle name"
                            name="middle_name"
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                        />
                        <TextInput
                            label="Surname"
                            name="last_name"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                        />
                        <TextInput
                            label="Date of birth"
                            name="date_of_birth"
                            type="date"
                            value={data.date_of_birth}
                            onChange={(e) => setData('date_of_birth', e.target.value)}
                            error={errors.date_of_birth}
                        />
                        <Select
                            label="Gender"
                            name="gender"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                        >
                            <option value="">Not stated</option>
                            {genders.map((gender) => (
                                <option key={gender} value={gender}>
                                    {gender[0].toUpperCase() + gender.slice(1)}
                                </option>
                            ))}
                        </Select>
                    </div>
                </Card>

                <Card title="Contact">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <TextInput
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <TextInput
                            label="Email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                        />
                        <TextInput
                            label="Address"
                            name="address"
                            className="sm:col-span-2 lg:col-span-3"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                    </div>
                </Card>

                <Card title="Notes">
                    <TextArea
                        name="notes"
                        rows={3}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                </Card>

                <div className="flex items-center gap-2">
                    <Button type="submit" loading={processing}>
                        Save changes
                    </Button>
                    <Link href={`/patients/${patient.id}`}>
                        <Button type="button" variant="ghost">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
