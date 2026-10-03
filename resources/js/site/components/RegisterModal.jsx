import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SITE } from '../config';
import Modal from './Modal';

const inputClass =
  'w-full px-4 py-3 rounded-full text-sm border border-gray-200 focus:outline-none focus:border-ink transition-colors';

const errorClass = 'border-red-400 focus:border-red-500';

/**
 * The facility kinds an applicant can pick. These are labels for humans; the
 * values are the ones the API validates against.
 */
const FACILITY_TYPES = [
  { value: 'dental', label: 'Dental practice' },
  { value: 'eye', label: 'Eye or optical practice' },
  { value: 'pharmacy', label: 'Pharmacy / Dispensary' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'polyclinic', label: 'Polyclinic' },
  { value: 'clinic', label: 'General clinic' },
  { value: 'single_specialist', label: 'Single specialist practice' },
  { value: 'diagnostic_centre', label: 'Diagnostic centre' },
];

/** Maps each facility kind directly to its matching commercial package edition */
const FACILITY_TO_EDITION = {
  dental: 'dental-clinic',
  eye: 'eye-clinic',
  pharmacy: 'pharmacy',
  hospital: 'hospital',
  polyclinic: 'polyclinic',
  clinic: 'polyclinic',
  single_specialist: 'eye-clinic',
  diagnostic_centre: 'polyclinic',
};

const STEPS = [
  {
    title: 'Facility',
    blurb: 'Tell us who you are registering the system for.',
  },
  {
    title: 'Edition',
    blurb: 'Pick the edition that matches how your facility works.',
  },
  {
    title: 'Administrator',
    blurb: 'The person who will administer the system day to day.',
  },
  {
    title: 'Security',
    blurb: 'Choose the password this administrator will sign in with.',
  },
];

/** Which step each field belongs to, so a rejected post can jump back to it. */
const FIELD_STEP = {
  facility_name: 0,
  facility_type: 0,
  edition: 1,
  licence_term: 1,
  contact_name: 2,
  contact_email: 2,
  contact_phone: 2,
  username: 2,
  password: 3,
  password_confirmation: 3,
};

const EMPTY_FORM = {
  facility_name: '',
  facility_type: '',
  edition: '',
  licence_term: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  username: '',
  password: '',
  password_confirmation: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

/**
 * Check one step before letting the applicant move on. The API re-checks all of
 * it, so this is about pacing the form, not about being the authority.
 */
function validateStep(step, form) {
  const errors = {};

  if (step === 0) {
    if (!form.facility_name.trim()) {
      errors.facility_name = 'Enter the name your facility trades under.';
    }

    if (!form.facility_type) {
      errors.facility_type = 'Choose the kind of facility you run.';
    }
  }

  if (step === 1) {
    if (!form.edition) {
      errors.edition = 'Choose the TibaDesk edition you want to run.';
    }

    if (!form.licence_term) {
      errors.licence_term = 'Choose how long you need the licence for.';
    }
  }

  if (step === 2) {
    if (!form.contact_name.trim()) {
      errors.contact_name = 'Enter the administrator’s full name.';
    }

    if (!EMAIL_PATTERN.test(form.contact_email)) {
      errors.contact_email = 'Enter a valid email address so we can reply to you.';
    }

    if (!form.contact_phone.trim()) {
      errors.contact_phone = 'Enter a phone number we can reach you on.';
    }

    if (!form.username.trim()) {
      errors.username = 'Choose a username for the administrator account.';
    } else if (!USERNAME_PATTERN.test(form.username)) {
      errors.username = 'Use letters, numbers, dots, dashes and underscores only.';
    }
  }

  if (step === 3) {
    if (form.password.length < 8) {
      errors.password = 'Use at least 8 characters for the password.';
    }

    if (form.password !== form.password_confirmation) {
      errors.password_confirmation = 'The two passwords do not match.';
    }
  }

  return errors;
}

/**
 * The facility registration wizard, shown as an overlay on the marketing site.
 *
 * The form and the API it posts to are unchanged from when this was a page of
 * its own; only the frame around it is different. onSwitchToLogin is passed in
 * so the "Already registered?" line swaps overlays in place rather than sending
 * the visitor to another URL and losing the page they were reading.
 */
export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');
  const [feedback, setFeedback] = useState(null);
  const [catalogue, setCatalogue] = useState({ editions: [], licence_terms: [] });
  const [catalogueError, setCatalogueError] = useState(null);
  const [reference, setReference] = useState(null);

  /** Read preselected facility or package from URL parameters */
  useEffect(() => {
    const facilityParam = searchParams.get('facility');
    const editionParam = searchParams.get('edition') || searchParams.get('package');

    if (facilityParam || editionParam) {
      setForm((current) => {
        const next = { ...current };
        if (facilityParam && FACILITY_TYPES.some((type) => type.value === facilityParam)) {
          next.facility_type = facilityParam;
          if (FACILITY_TO_EDITION[facilityParam]) {
            next.edition = FACILITY_TO_EDITION[facilityParam];
          }
        }
        if (editionParam) {
          next.edition = editionParam;
        }
        return next;
      });
    }
  }, [searchParams]);

  /**
   * The editions and terms come from the same published catalogue the pricing
   * page sells from, so a registration can never name an edition the site does
   * not offer.
   */
  useEffect(() => {
    let cancelled = false;

    fetch('/api/packages', { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`catalogue request failed: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCatalogue({
            editions: data.editions ?? [],
            licence_terms: data.licence_terms ?? [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogueError('We could not load the editions. Please refresh the page to try again.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedEdition = useMemo(
    () => catalogue.editions.find((edition) => edition.key === form.edition),
    [catalogue.editions, form.edition],
  );

  const selectedTerm = useMemo(
    () => catalogue.licence_terms.find((term) => term.key === form.licence_term),
    [catalogue.licence_terms, form.licence_term],
  );

  const facilityTypeLabel = useMemo(
    () => FACILITY_TYPES.find((type) => type.value === form.facility_type)?.label,
    [form.facility_type],
  );

  const update = (field) => (event) => {
    const { value } = event.target;

    setForm((current) => {
      const next = { ...current, [field]: value };
      // When user chooses facility type, automatically direct them to the matching package
      if (field === 'facility_type' && FACILITY_TO_EDITION[value]) {
        next.edition = FACILITY_TO_EDITION[value];
      }
      return next;
    });

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const goTo = (next) => {
    setStep(next);
    setFeedback(null);
  };

  const handleNext = (event) => {
    event.preventDefault();

    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) {
      return;
    }

    goTo(step + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const stepErrors = validateStep(3, form);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) {
      return;
    }

    setState('sending');
    setFeedback(null);

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        // website is the honeypot: a bot that fills it is answered as though
        // the registration worked, but nothing is stored.
        body: JSON.stringify({ ...form, website: '' }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const fieldErrors = data.errors ?? {};
        setErrors(fieldErrors);
        setFeedback(
          response.status === 422
            ? 'Please check the highlighted fields and try again.'
            : 'Your registration could not be sent. Please try again, or email us directly.',
        );

        const firstStep = Object.keys(FIELD_STEP)
          .filter((field) => field in fieldErrors)
          .map((field) => FIELD_STEP[field])[0];

        if (firstStep !== undefined) {
          setStep(firstStep);
        }

        setState('idle');

        return;
      }

      setReference(data.reference);
      setState('sent');
    } catch {
      setFeedback('Your registration could not be sent. Please try again, or email us directly.');
      setState('idle');
    }
  };

  const fieldError = (field) =>
    errors[field] ? <span className="block text-red-600 text-xs mt-1.5">{errors[field][0]}</span> : null;

  if (state === 'sent') {
    return (
      <Modal labelledBy="register-success-title" onClose={onClose} width="max-w-md">
        <div className="text-center">
          <p className="eyebrow text-brand mb-3">REGISTRATION RECEIVED</p>
          <h1 id="register-success-title" className="text-3xl font-extrabold text-ink mb-3">Thank you, we have it</h1>
          <p className="text-gray-500 text-sm mb-6">{feedback ?? 'Your registration is in. We review it within one business day and email you when the account is active.'}</p>

          {reference && (
            <div className="card p-5 mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">
                Your reference
              </p>
              <p className="text-xl font-bold text-ink tracking-wide">{reference}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mb-8">
            Keep that reference for anything you email us about this registration. Your account is not
            active until we confirm by email, so signing in now will not work yet.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" onClick={onSwitchToLogin} className="btn-asaak">
              Go to sign in
            </button>
            <Link to="/packages" className="btn-outline-dark" onClick={onClose}>
              Read the packages
            </Link>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal labelledBy="register-title" onClose={onClose}>
      <div className="mb-8 pr-8 text-center">
        <p className="eyebrow text-brand mb-3">CREATE AN ACCOUNT</p>
        <h1 id="register-title" className="text-3xl md:text-4xl font-extrabold text-ink">
          Register your <span className="text-brand">TibaDesk</span> facility
        </h1>
        <p className="text-gray-500 text-sm mt-3">
          Four short steps. We review each registration before the account is activated.
        </p>
      </div>

        <ol className="flex items-center gap-2 md:gap-3 mb-8" aria-label="Registration progress">
          {STEPS.map((entry, index) => {
            const done = index < step;
            const current = index === step;

            return (
              <li key={entry.title} className="flex-1 min-w-0">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    done || current ? 'bg-brand' : 'bg-gray-200'
                  }`}
                />
                <p
                  className={`text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.15em] mt-2 truncate ${
                    current ? 'text-brand' : done ? 'text-ink-soft' : 'text-gray-400'
                  }`}
                >
                  {entry.title}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-gray-100 pt-6">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="text-xl font-bold text-ink">{STEPS[step].title}</h2>
            <p className="text-gray-500 text-sm mt-1">{STEPS[step].blurb}</p>
          </div>

          {catalogueError && (
            <div role="alert" className="bg-amber-50 text-amber-800 text-sm rounded-2xl px-4 py-3 mb-5">
              {catalogueError}
            </div>
          )}

          {feedback && (
            <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-2xl px-4 py-3 mb-5">
              {feedback}
            </div>
          )}

          <form onSubmit={step === STEPS.length - 1 ? handleSubmit : handleNext} className="grid gap-4" noValidate>
            {/* Honeypot. Hidden from people, irresistible to bots. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" readOnly />
            </div>

            {step === 0 && (
              <>
                <div>
                  <label
                    htmlFor="facility_name"
                    className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    Facility name
                  </label>
                  <input
                    id="facility_name"
                    name="facility_name"
                    value={form.facility_name}
                    onChange={update('facility_name')}
                    className={`${inputClass} ${errors.facility_name ? errorClass : ''}`}
                    placeholder="Mkwakwa Hospital"
                    required
                  />
                  {fieldError('facility_name')}
                </div>

                <div>
                  <label
                    htmlFor="facility_type"
                    className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    Kind of facility
                  </label>
                  <select
                    id="facility_type"
                    name="facility_type"
                    value={form.facility_type}
                    onChange={update('facility_type')}
                    className={`${inputClass} ${errors.facility_type ? errorClass : ''}`}
                    required
                  >
                    <option value="">Choose one...</option>
                    {FACILITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {fieldError('facility_type')}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                    Edition
                  </label>
                  <div className="grid gap-2">
                    {catalogue.editions.map((edition) => (
                      <label
                        key={edition.key}
                        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors ${
                          form.edition === edition.key
                            ? 'border-brand bg-brand-soft'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="edition"
                          value={edition.key}
                          checked={form.edition === edition.key}
                          onChange={update('edition')}
                          className="mt-1 accent-brand"
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-ink">{edition.name}</span>
                            {edition.highlighted && (
                              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand bg-brand-soft px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                          </span>
                          <span className="block text-xs text-gray-500 mt-1">{edition.tagline}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {fieldError('edition')}
                </div>

                <div>
                  <label
                    htmlFor="licence_term"
                    className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    Licence term
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {catalogue.licence_terms.map((term) => (
                      <label
                        key={term.key}
                        className={`rounded-full border px-4 py-3 text-center text-sm font-semibold cursor-pointer transition-colors ${
                          form.licence_term === term.key
                            ? 'border-brand bg-brand-soft text-brand'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="licence_term"
                          value={term.key}
                          checked={form.licence_term === term.key}
                          onChange={update('licence_term')}
                          className="sr-only"
                        />
                        {term.label}
                      </label>
                    ))}
                  </div>
                  {fieldError('licence_term')}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label
                    htmlFor="contact_name"
                    className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    Full name
                  </label>
                  <input
                    id="contact_name"
                    name="contact_name"
                    value={form.contact_name}
                    onChange={update('contact_name')}
                    className={`${inputClass} ${errors.contact_name ? errorClass : ''}`}
                    autoComplete="name"
                    required
                  />
                  {fieldError('contact_name')}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact_email"
                      className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                    >
                      Email address
                    </label>
                    <input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      value={form.contact_email}
                      onChange={update('contact_email')}
                      className={`${inputClass} ${errors.contact_email ? errorClass : ''}`}
                      autoComplete="email"
                      required
                    />
                    {fieldError('contact_email')}
                  </div>

                  <div>
                    <label
                      htmlFor="contact_phone"
                      className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                    >
                      Phone
                    </label>
                    <input
                      id="contact_phone"
                      name="contact_phone"
                      type="tel"
                      value={form.contact_phone}
                      onChange={update('contact_phone')}
                      className={`${inputClass} ${errors.contact_phone ? errorClass : ''}`}
                      autoComplete="tel"
                      placeholder="+255 754 000 111"
                      required
                    />
                    {fieldError('contact_phone')}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    Administrator username
                  </label>
                  <input
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={update('username')}
                    className={`${inputClass} ${errors.username ? errorClass : ''}`}
                    autoComplete="username"
                    required
                  />
                  {fieldError('username')}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    className={`${inputClass} ${errors.password ? errorClass : ''}`}
                    autoComplete="new-password"
                    required
                  />
                  {fieldError('password')}
                </div>

                <div>
                  <label
                    htmlFor="password_confirmation"
                    className="block text-ink text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    Repeat password
                  </label>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={form.password_confirmation}
                    onChange={update('password_confirmation')}
                    className={`${inputClass} ${errors.password_confirmation ? errorClass : ''}`}
                    autoComplete="new-password"
                    required
                  />
                  {fieldError('password_confirmation')}
                </div>

                <div className="rounded-2xl bg-surface border border-gray-100 p-5 mt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
                    Check this over
                  </p>
                  <dl className="grid gap-2 text-sm">
                    {[
                      ['Facility', form.facility_name],
                      ['Kind', facilityTypeLabel],
                      ['Edition', selectedEdition?.name],
                      ['Term', selectedTerm?.label],
                      ['Administrator', form.contact_name],
                      ['Email', form.contact_email],
                      ['Phone', form.contact_phone],
                      ['Username', form.username],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="font-semibold text-ink text-right break-all">{value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            )}

            <div className="flex items-center gap-3 mt-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="btn-outline-dark px-6 py-3"
                  disabled={state === 'sending'}
                >
                  Back
                </button>
              )}

              <button
                type="submit"
                className="btn-asaak flex-1"
                disabled={state === 'sending' || (step === 1 && catalogue.editions.length === 0)}
              >
                {state === 'sending'
                  ? 'Submitting...'
                  : step === STEPS.length - 1
                    ? 'Submit registration'
                    : 'Continue'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-brand font-semibold hover:underline">
            Sign in instead
          </button>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          Questions first? Call KADETECH on{' '}
          <a href={SITE.contact.phoneHref} className="text-brand font-semibold hover:underline">
            {SITE.contact.phone}
          </a>{' '}
          or email{' '}
          <a href={`mailto:${SITE.contact.email}`} className="text-brand font-semibold hover:underline">
            {SITE.contact.email}
          </a>
          .
        </p>
    </Modal>
  );
}
