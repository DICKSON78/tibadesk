import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faLinkedinIn, faFacebookF, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { SITE } from '../config';

const inputClass =
  'w-full px-4 py-3 rounded-full text-sm border border-gray-200 focus:outline-none focus:border-ink transition-colors';

export default function ContactPage() {
  const [state, setState] = useState('idle');
  const [feedback, setFeedback] = useState(null);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    setState('sending');
    setErrors({});
    setFeedback(null);

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, website: '' }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setFeedback(
          response.status === 422
            ? 'Please check the highlighted fields and try again.'
            : 'Your message could not be sent. Please try again, or email us directly.',
        );
        setState('idle');

        return;
      }

      setFeedback(data.message);
      setState('sent');
      form.reset();
    } catch {
      setFeedback('Your message could not be sent. Please try again, or email us directly.');
      setState('idle');
    }
  };

  const fieldError = (field) =>
    errors[field] ? (
      <span className="block text-red-600 text-xs mt-1.5">{errors[field][0]}</span>
    ) : null;

  return (
    <>
      <section className="relative py-24 lg:py-32 overflow-hidden bg-ink">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-dark bg-[size:56px_56px] opacity-60" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand/[0.06] blur-[100px]" />
        </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center text-left">
            <div>
              <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">CONTACT</p>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Let&apos;s Talk About <span className="text-brand">Your Facility</span>
              </h1>
              <p className="text-navy-100/80 text-base mt-6 leading-relaxed max-w-lg">
                Ask for a demo, request help choosing an edition, or arrange installation. Tell us
                your departments and staff count and we will recommend the right starting point.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src="/images/team-meeting.jpg"
                alt="Clinical staff in a hands-on training session"
                className="h-56 w-full object-cover sm:h-72 lg:h-80"
                loading="eager"
                width="1600"
                height="1067"
              />
            </div>
          </div>
        </section>

      <section className="bg-canvas py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-3 bg-surface border border-gray-100 rounded-2xl p-6 lg:p-8">
              {state === 'sent' ? (
                <div className="text-center py-10">
                  <span className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <h3 className="text-ink font-extrabold text-xl mb-2">Thank you</h3>
                  <p className="text-gray-500 text-sm">{feedback}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4" noValidate>
                  <div>
                    <label htmlFor="name" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Full name
                    </label>
                    <input id="name" name="name" className={inputClass} required />
                    {fieldError('name')}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input id="email" name="email" type="email" className={inputClass} required />
                    {fieldError('email')}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input id="phone" name="phone" className={inputClass} required />
                    {fieldError('phone')}
                  </div>
                  <div>
                    <label htmlFor="facility" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Facility name
                    </label>
                    <input id="facility" name="facility" className={inputClass} />
                    {fieldError('facility')}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-ink text-xs font-bold uppercase tracking-wider mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      className={`${inputClass} rounded-2xl resize-none`}
                      placeholder="Tell us about your facility and which edition you are considering."
                      required
                    />
                    {fieldError('message')}
                  </div>
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </div>
                  {feedback && (
                    <p className="sm:col-span-2 text-red-600 text-sm" role="alert">
                      {feedback}
                    </p>
                  )}
                  <div className="sm:col-span-2">
                    <button type="submit" className="btn-asaak" disabled={state === 'sending'}>
                      {state === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-ink text-white rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 pb-3 border-b border-white/20">
                  GET IN TOUCH
                </h3>
                <ul className="space-y-4 text-sm">
                  {SITE.contact.phones.map((phone) => (
                    <li key={phone.number} className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faPhone} className="text-brand" />
                      <a
                        href={phone.href}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        <span className="block text-white/40 text-xs">{phone.label}</span>
                        <span className="font-semibold">{phone.number}</span>
                      </a>
                    </li>
                  ))}
                  <li className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faEnvelope} className="text-brand" />
                    <a href={`mailto:${SITE.contact.email}`} className="text-gray-300 hover:text-white transition-colors">
                      {SITE.contact.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faLocationDot} className="text-brand mt-1" />
                    <a
                      href={SITE.contact.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {SITE.contact.address.line1}
                      <br />
                      {SITE.contact.address.line2}
                      <br />
                      <span className="text-white font-semibold">
                        {SITE.contact.address.city}
                      </span>{' '}
                      {SITE.contact.address.country}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-canvas rounded-2xl p-6">
                <h3 className="text-ink font-bold text-lg mb-4">FOLLOW US</h3>
                <div className="flex gap-3">
                  {[
                    { label: 'LinkedIn', href: SITE.social.linkedin, icon: faLinkedinIn },
                    { label: 'Facebook', href: SITE.social.facebook, icon: faFacebookF },
                    { label: 'X', href: SITE.social.x, icon: faXTwitter },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-brand hover:text-brand transition-all"
                    >
                      <FontAwesomeIcon icon={social.icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
