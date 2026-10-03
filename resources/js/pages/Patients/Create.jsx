import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Alert, Button, Card, Select, TextArea, TextInput } from '../../components';

export default function PatientCreate({ genders }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        next_of_kin_name: '',
        next_of_kin_phone: '',
        next_of_kin_relationship: '',
        notes: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/patients');
    };

    return (
        <AppLayout
            title="Register a patient"
            subtitle="The patient number is issued automatically when you save."
            actions={
                <Link href="/patients">
                    <Button variant="secondary">Cancel</Button>
                </Link>
            }
        >
            <Head title="Register a patient" />

            <form onSubmit={submit} className="max-w-4xl space-y-6">
                {Object.keys(errors).length > 0 && (
                    <Alert variant="error">
                        Some details need attention. Check the highlighted fields and try again.
                    </Alert>
                )}

                <Card title="Patient details">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <TextInput
                            label="First name"
                            name="first_name"
                            required
                            autoFocus
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            error={errors.first_name}
                        />
                        <TextInput
                            label="Middle name"
                            name="middle_name"
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            error={errors.middle_name}
                        />
                        <TextInput
                            label="Surname"
                            name="last_name"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            error={errors.last_name}
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
                            error={errors.gender}
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
                            error={errors.phone}
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
                            error={errors.address}
                        />
                    </div>
                </Card>

                <Card
                    title="Next of kin"
                    description="Used only when the facility has to reach someone on the patient’s behalf."
                >
                    <div className="grid gap-4 sm:grid-cols-3">
                        <TextInput
                            label="Name"
                            name="next_of_kin_name"
                            value={data.next_of_kin_name}
                            onChange={(e) => setData('next_of_kin_name', e.target.value)}
                            error={errors.next_of_kin_name}
                        />
                        <TextInput
                            label="Relationship"
                            name="next_of_kin_relationship"
                            value={data.next_of_kin_relationship}
                            onChange={(e) => setData('next_of_kin_relationship', e.target.value)}
                            error={errors.next_of_kin_relationship}
                        />
                        <TextInput
                            label="Phone"
                            name="next_of_kin_phone"
                            type="tel"
                            value={data.next_of_kin_phone}
                            onChange={(e) => setData('next_of_kin_phone', e.target.value)}
                            error={errors.next_of_kin_phone}
                        />
                    </div>
                </Card>

                <Card title="Notes" description="Anything the reception desk should know on arrival.">
                    <TextArea
                        name="notes"
                        rows={3}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        error={errors.notes}
                    />
                </Card>

                <div className="flex items-center gap-2">
                    <Button type="submit" loading={processing}>
                        Register patient
                    </Button>
                    <Link href="/patients">
                        <Button type="button" variant="ghost">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
