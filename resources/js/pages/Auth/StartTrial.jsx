import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, TextInput } from '../../components';

/**
 * Opening a trial, for somebody who has just watched the demo.
 *
 * Carries the same TibaDesk chrome as the sign-in page and the marketing site
 * — eyebrow, extrabold headline, cards, pill controls — but is wider, because
 * the only real decision here is which edition to try, and that choice is worth
 * showing properly rather than hiding in a dropdown.
 *
 * The password minimum is stated on the field rather than only in the error
 * that follows submitting something too short. Nobody should have to fail a
 * rule to be told what it is.
 */
export default function StartTrial({ trial, editions }) {
    const { data, setData, post, processing, errors } = useForm({
        edition: editions[0]?.key ?? '',
        facility_name: '',
        owner_name: '',
        owner_email: '',
        password: '',
        owner_phone: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/start-trial');
    };

    const selected = editions.find((edition) => edition.key === data.edition);

    return (
        <>
            <Head title="Start your free trial" />

            <div className="flex min-h-full flex-col justify-center bg-mist-100 px-6 py-12 md:py-20">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="mb-8 text-center">
                        <p className="eyebrow text-brand mb-3">FREE TRIAL</p>
                        <h1 className="text-ink-900 mb-3 text-3xl font-extrabold md:text-4xl">
                            Try <span className="text-brand">TibaDesk</span> for {trial.days} days
                        </h1>
                        <p className="text-sm text-mist-600">
                            Your own system, with your own patients and records. No card, and nothing to
                            uninstall.
                        </p>
                    </div>

                    <form onSubmit={submit} className="grid gap-5">
                        <fieldset className="surface-card p-6">
                            <legend className="text-ink-900 px-1 text-xs font-bold tracking-wider uppercase">
                                Which kind of practice is it?
                            </legend>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {editions.map((edition) => {
                                    const active = edition.key === data.edition;

                                    return (
                                        <label
                                            key={edition.key}
                                            className={[
                                                'cursor-pointer rounded-2xl border p-4 transition',
                                                active
                                                    ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                                                    : 'border-mist-200 hover:border-mist-400',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <input
                                                    type="radio"
                                                    name="edition"
                                                    value={edition.key}
                                                    checked={active}
                                                    onChange={(event) => setData('edition', event.target.value)}
                                                    className="accent-brand-600 mt-0.5 size-4 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-ink-900 text-sm font-semibold">
                                                        {edition.name}
                                                    </p>
                                                    {edition.tagline && (
                                                        <p className="mt-0.5 text-xs text-mist-600">
                                                            {edition.tagline}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            {errors.edition && <p className="mt-2 text-xs text-rose-600">{errors.edition}</p>}

                            {selected && (
                                <p className="border-mist-200 text-ink-900 mt-4 border-t pt-4 text-xs text-mist-600">
                                    <span className="text-ink-900 font-medium">Included: </span>
                                    {selected.modules.map((module) => module.name).join(', ')}
                                </p>
                            )}
                        </fieldset>

                        <div className="surface-card grid gap-4 p-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextInput
                                    label="Facility name"
                                    name="facility_name"
                                    required
                                    autoFocus
                                    placeholder="Mkwakwa Dental Centre"
                                    value={data.facility_name}
                                    onChange={(event) => setData('facility_name', event.target.value)}
                                    error={errors.facility_name}
                                />
                                <TextInput
                                    label="Your name"
                                    name="owner_name"
                                    required
                                    autoComplete="name"
                                    value={data.owner_name}
                                    onChange={(event) => setData('owner_name', event.target.value)}
                                    error={errors.owner_name}
                                />
                                <TextInput
                                    label="Email address"
                                    name="owner_email"
                                    type="email"
                                    required
                                    autoComplete="username"
                                    value={data.owner_email}
                                    onChange={(event) => setData('owner_email', event.target.value)}
                                    error={errors.owner_email}
                                />
                                <TextInput
                                    label="Phone"
                                    name="owner_phone"
                                    type="tel"
                                    autoComplete="tel"
                                    hint="optional"
                                    value={data.owner_phone}
                                    onChange={(event) => setData('owner_phone', event.target.value)}
                                    error={errors.owner_phone}
                                />
                            </div>

                            <TextInput
                                label="Password"
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                hint={`at least ${trial.password_min_length} characters, with a number`}
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                error={errors.password}
                            />

                            <Alert variant="info">
                                You will be signed straight in as the administrator. When the {trial.days} days
                                are up your records stay readable and nothing is deleted, but new entries
                                are paused until you take a licence.
                            </Alert>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <Link href="/login" className="text-sm font-medium text-mist-600 hover:text-ink-900">
                                    Already have an account? Sign in
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-asaak disabled:opacity-60"
                                >
                                    {processing ? 'Opening your trial…' : 'Open my trial'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
