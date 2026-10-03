import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCatalogue } from '../lib/catalogue';
import { LICENCE_TERMS } from '../config';
import { IconCheck, IconDownload, IconShield } from '../components/icons';
import {
  createSubscription,
  fetchSubscription,
  simulatePayment,
  downloadUrl,
} from '../lib/subscriptions';

const inputClass =
  'w-full px-4 py-3 rounded-full text-sm border border-gray-200 focus:outline-none focus:border-ink transition-colors';

const STATUS_COPY = {
  awaiting_quote: 'We have your request and will email you a quote with a payment link shortly.',
  awaiting_payment: 'Your quote is ready. Open the payment link to unlock your package.',
  paid: 'Payment received. Your package and licence are ready to download.',
  licence_issued: 'Payment received. Your package and licence are ready to download.',
  failed: 'The payment was not completed. You can start again below.',
  expired: 'This payment link has expired. Please start a new subscription.',
};

function OrderSummary({ edition, term }) {
  return (
    <div className="bg-ink text-white rounded-2xl p-6 lg:p-8">
      <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-2">ORDER SUMMARY</p>
      <h3 className="text-white font-bold text-lg mb-4 pb-4 border-b border-white/20">
        {edition.name}
      </h3>

      <dl className="space-y-3 text-sm mb-6">
        <div className="flex items-center justify-between">
          <dt className="text-gray-400">Licence term</dt>
          <dd className="text-white font-semibold">{term.label}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-400">Users included</dt>
          <dd className="text-white font-semibold">{edition.limits.users}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-400">Modules unlocked</dt>
          <dd className="text-white font-semibold">{edition.modules.length}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-400">Installation</dt>
          <dd className="text-white font-semibold">On-premise</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-400">Support</dt>
          <dd className="text-white font-semibold">Email and phone</dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between pt-5 border-t border-white/20">
        <span className="text-gray-300 text-sm font-semibold">Total due today</span>
        <span className="text-white text-xl font-extrabold">Quoted for your facility</span>
      </div>

      <p className="text-gray-500 text-xs leading-relaxed mt-6">
        We quote every facility individually, so no price is published here. Once the quote is
        ready you will receive a secure payment link by email. The licence covers the{' '}
        {term.label.toLowerCase()} you select and nothing is charged automatically.
      </p>

      <ul className="mt-5 space-y-2">
        {edition.modules.map((module) => (
          <li key={module.key} className="text-gray-400 text-xs flex items-center gap-2">
            <IconCheck className="w-3 h-3 text-brand shrink-0" />
            {module.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DownloadPanel({ reference, status }) {
  return (
    <div className="bg-surface border border-brand/40 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <IconShield className="w-5 h-5 text-brand" />
        </span>
        <h3 className="text-ink font-bold text-lg">Your downloads are ready</h3>
      </div>

      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        Install the package on your server first, then upload the licence file in Settings &rarr;
        Licence. Both downloads stay available for this subscription.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <a href={downloadUrl(reference, 'package')} className="btn-asaak">
          <IconDownload className="w-5 h-5" />
          DOWNLOAD PACKAGE
        </a>
        <a href={downloadUrl(reference, 'licence')} className="btn-outline-light border-gray-200 text-ink hover:bg-ink">
          DOWNLOAD LICENCE
        </a>
      </div>

      <p className="text-gray-400 text-xs mt-6">Reference: {reference}</p>
    </div>
  );
}

export default function CheckoutPage() {
  const { edition: editionKey } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { editions, loading } = useCatalogue();
  const [form, setForm] = useState({
    licence_term: LICENCE_TERMS[1].key,
    customer_name: '',
    email: '',
    phone: '',
    facility_name: '',
    tin: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const term = useMemo(
    () => LICENCE_TERMS.find((item) => item.key === form.licence_term) ?? LICENCE_TERMS[0],
    [form.licence_term],
  );

  const edition = useMemo(
    () => editions.find((item) => item.key === editionKey) ?? null,
    [editions, editionKey],
  );

  const status = subscription?.status ?? null;
  const isPaid = status === 'paid' || status === 'licence_issued';
  const isSimulated = subscription?.payment_mode === 'fake';
  const linkedReference = searchParams.get('reference');

  useEffect(() => {
    if (!linkedReference) {
      return;
    }

    let cancelled = false;

    fetchSubscription(linkedReference)
      .then((loaded) => {
        if (!cancelled) {
          setSubscription((current) => ({ ...current, ...loaded }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActionError('We could not find that order. Start a new subscription below.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [linkedReference]);

  useEffect(() => {
    if (!subscription || isPaid || status === 'failed' || status === 'expired') {
      return;
    }

    const timer = setInterval(async () => {
      try {
        const latest = await fetchSubscription(subscription.reference);
        setSubscription((current) => ({ ...current, ...latest }));
      } catch {
        /* keep polling; the next tick will report transport errors */
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [subscription, isPaid, status]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const track = (reference) => {
    navigate(`/checkout/${editionKey}?reference=${encodeURIComponent(reference)}`, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const created = await createSubscription({ ...form, edition: editionKey });
      setSubscription(created);
      setActionError(null);
      track(created.reference);

      if (created.payment_mode !== 'fake' && created.checkout_url) {
        window.location.href = created.checkout_url;
      }
    } catch (error) {
      setFieldErrors(error.fields ?? {});
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resumePayment = useCallback(() => {
    if (subscription?.checkout_url) {
      window.location.href = subscription.checkout_url;
    }
  }, [subscription]);

  const runSimulatedPayment = async () => {
    setSimulating(true);
    setActionError(null);

    try {
      await simulatePayment(subscription.reference);
      setSubscription(await fetchSubscription(subscription.reference));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-surface py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gray-500 text-sm">Loading checkout...</p>
        </div>
      </section>
    );
  }

  if (!edition) {
    return (
      <section className="bg-surface py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">CHECKOUT</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4">Edition Not Found</h1>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            That package is not available. Pick an edition from the packages page to continue.
          </p>
          <Link to="/packages" className="btn-asaak">
            VIEW PACKAGES
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-canvas py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">CHECKOUT</p>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4">
          Subscribe To <span className="text-brand">{edition.name}</span>
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl mb-12">
          Choose a licence term and tell us where to send the licence. We quote your facility
          individually and email you a secure payment link, so nothing is charged until you have
          seen the amount. Your package and signed licence unlock as soon as the payment clears.
        </p>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-3">
            {isPaid ? (
              <DownloadPanel reference={subscription.reference} status={status} />
            ) : (
              <div className="bg-surface border border-gray-100 rounded-2xl p-6 lg:p-8">
                {subscription && (
                  <div className="bg-canvas rounded-xl p-4 mb-6">
                    <p className="text-ink font-bold text-sm">
                      {status === 'failed'
                        ? 'Payment not completed'
                        : status === 'awaiting_quote'
                          ? 'Waiting for your quote'
                          : 'Waiting for your payment'}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-1">
                      {subscription.next_step ?? STATUS_COPY[status] ?? STATUS_COPY.awaiting_quote}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">Reference: {subscription.reference}</p>
                    {actionError && (
                      <p className="text-red-600 text-xs mt-2">{actionError}</p>
                    )}
                    {isSimulated && status === 'awaiting_payment' ? (
                      <button
                        type="button"
                        onClick={runSimulatedPayment}
                        disabled={simulating}
                        className="btn-asaak mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {simulating ? 'PROCESSING...' : 'SIMULATE PAYMENT'}
                      </button>
                    ) : (
                      subscription.checkout_url && (
                        <button type="button" onClick={resumePayment} className="btn-asaak mt-4">
                          PAY WITH CLICKPESA
                        </button>
                      )
                    )}
                    {isSimulated && (
                      <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                        Local test mode: the fake gateway marks this order paid so you can walk the
                        whole flow without a ClickPesa account. Quote the order first.
                      </p>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                  <fieldset className="sm:col-span-2">
                    <legend className="block text-ink text-xs font-bold uppercase tracking-wider mb-3">
                      Licence term
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      {LICENCE_TERMS.map((option) => (
                        <label
                          key={option.key}
                          className={`cursor-pointer rounded-xl border px-3 py-3 text-center transition-colors ${
                            form.licence_term === option.key
                              ? 'border-brand bg-brand/5 text-ink'
                              : 'border-gray-200 text-gray-500 hover:border-brand/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="licence_term"
                            value={option.key}
                            checked={form.licence_term === option.key}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="block text-sm font-bold">{option.label}</span>
                          <span className="block text-[10px] uppercase tracking-wider text-gray-400 mt-1">
                            Licence
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="sm:col-span-2">
                    <label htmlFor="customer_name" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Full name
                    </label>
                    <input
                      id="customer_name"
                      name="customer_name"
                      className={inputClass}
                      value={form.customer_name}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.customer_name && (
                      <p className="text-red-600 text-xs mt-2">{fieldErrors.customer_name[0]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Work email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={inputClass}
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.email && (
                      <p className="text-red-600 text-xs mt-2">{fieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Phone number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      className={inputClass}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+255 700 000 000"
                      required
                    />
                    {fieldErrors.phone && <p className="text-red-600 text-xs mt-2">{fieldErrors.phone[0]}</p>}
                  </div>

                  <div>
                    <label htmlFor="facility_name" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Facility name
                    </label>
                    <input
                      id="facility_name"
                      name="facility_name"
                      className={inputClass}
                      value={form.facility_name}
                      onChange={handleChange}
                      placeholder="Mwanza Dental Centre"
                      required
                    />
                    {fieldErrors.facility_name && (
                      <p className="text-red-600 text-xs mt-2">{fieldErrors.facility_name[0]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="tin" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      TIN (optional)
                    </label>
                    <input
                      id="tin"
                      name="tin"
                      className={inputClass}
                      value={form.tin}
                      onChange={handleChange}
                      placeholder="000-000-000"
                    />
                    {fieldErrors.tin && <p className="text-red-600 text-xs mt-2">{fieldErrors.tin[0]}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-gray-400 text-xs leading-relaxed">
                      By subscribing you agree to a {term.label.toLowerCase()} licence for this
                      package. Your licence covers that term only, and we warn you 30 days before
                      it expires.
                    </p>
                  </div>

                  {formError && (
                    <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-700 text-xs">{formError}</p>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <button type="submit" disabled={submitting} className="btn-asaak-green w-full sm:w-auto disabled:opacity-60">
                      {submitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                          </svg>
                          STARTING CHECKOUT
                        </>
                      ) : (
                        <>
                          <IconShield className="w-5 h-5" />
                          SUBSCRIBE FOR {term.label.toUpperCase()}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <OrderSummary edition={edition} term={term} />
            <div className="card mt-6 overflow-hidden">
              <img
                src="/images/admin-desk.jpg"
                alt="A hospital reception and patient waiting area"
                className="h-40 w-full object-cover"
                loading="lazy"
                width="1600"
                height="1067"
              />
              <div className="p-5">
                <p className="text-sm font-bold text-ink">Included with your subscription</p>
                <p className="mt-1.5 text-xs leading-relaxed text-mist-700">
                  Installation on your own server, database setup, your logo and invoice header,
                  role permissions, opening balances and team training.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
