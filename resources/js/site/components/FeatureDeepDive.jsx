import { Link } from 'react-router-dom';
import { IconArrow, IconCash, IconPill, IconStethoscope, IconUsers } from './icons';

const features = [
  {
    eyebrow: 'Front desk and records',
    title: 'A patient file that is complete before the patient sits down',
    body: 'Register once and the whole visit follows the record: queue position, the clinician who saw them, diagnoses, prescriptions, notes and the bill. Searching by name, phone or ID takes seconds instead of a morning spent in the filing cabinet.',
    points: [
      'Queue and appointment board with live waiting list',
      'One patient history across every department and branch',
      'Printable files, referral letters and discharge summaries',
    ],
    image: '/images/consult-room.jpg',
    alt: 'A nurse providing patient care in a treatment room',
    icon: IconStethoscope,
    to: '/modules',
    cta: 'See the clinical modules',
  },
  {
    eyebrow: 'Pharmacy and dispensing',
    title: 'Stock, prices and dispensing that agree with each other',
    body: 'Every item dispensed is deducted from stock and added to the patient bill in the same step, so the shelf count, the cash drawer and the income report stop telling three different stories at the end of the day.',
    points: [
      'Stock levels with reorder warnings and expiry dates',
      'Dispensing recorded straight onto the patient bill',
      'Purchase orders and supplier records per item',
    ],
    image: '/images/hospital-ward.jpg',
    alt: 'A nurse on a hospital ward',
    icon: IconPill,
    to: '/modules',
    cta: 'See pharmacy and lab',
  },
  {
    eyebrow: 'Billing and reporting',
    title: 'Know what the facility earned before you close the till',
    body: 'Consultation fees, procedures, laboratory results and pharmacy items land on one invoice with totals the front desk can read out loud. Shift, daily and monthly reports are generated from the same data, so the numbers always match.',
    points: [
      'One invoice per visit, with discounts and insurance fields',
      'Daily cash and revenue summaries per department',
      'Month-end reports ready for the board or the auditor',
    ],
    image: '/images/admin-desk.jpg',
    alt: 'A hospital reception and patient waiting area',
    icon: IconCash,
    to: '/modules',
    cta: 'See billing and reports',
  },
];

export default function FeatureDeepDive() {
  return (
    <section className="bg-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="eyebrow text-azure-600">
            <IconUsers className="h-4 w-4" />
            Built around the working day
          </p>
          <h2 className="section-title mt-4 text-balance">
            Three jobs a clinic does every day, handled by one system
          </h2>
          <p className="mt-5 text-base leading-relaxed text-mist-700">
            TibaDesk is not a general practice management template with a hospital label on it. It
            covers the sequence of a real visit, from the first question at reception to the report
            the facility has to produce at the end of the month.
          </p>
        </div>

        <div className="mt-16 space-y-20 lg:space-y-28">
          {features.map(({ eyebrow, title, body, points, image, alt, icon: Icon, to, cta }, index) => (
            <div
              key={title}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="overflow-hidden rounded-2xl shadow-card">
                  <img
                    src={image}
                    alt={alt}
                    className="h-64 w-full object-cover sm:h-80 lg:h-[26rem]"
                    loading="lazy"
                    width="1600"
                    height="1067"
                  />
                </div>
              </div>

              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-azure-600">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="eyebrow mt-6 text-azure-600">{eyebrow}</p>
                <h3 className="mt-3 text-balance text-2xl font-extrabold leading-tight text-ink sm:text-[1.75rem]">
                  {title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-mist-700">{body}</p>

                <ul className="mt-6 space-y-3">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed text-navy-800">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft">
                        <svg className="h-3 w-3 text-azure-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>

                <Link to={to} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-azure-600 hover:text-ink">
                  {cta}
                  <IconArrow className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
