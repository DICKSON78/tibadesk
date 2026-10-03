import { Link } from 'react-router-dom';
import { SITE } from '../config';
import { IconArrow, IconCheck } from './icons';

const assurances = [
  'No setup fee',
  'Cancel any month',
  'Works offline',
];

function ProductPreview() {
  const rows = [
    { name: 'Walk-in consultation', tag: 'General', tone: 'bg-navy-100 text-navy-700' },
    { name: 'Paediatric review', tag: 'Paediatrics', tone: 'bg-azure-100 text-azure-700' },
    { name: 'Dental scaling', tag: 'Dental', tone: 'bg-mist-200 text-mist-700' },
    { name: 'Post-op follow-up', tag: 'Follow-up', tone: 'bg-navy-100 text-navy-700' },
  ];

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-500">
            Today
          </p>
          <p className="text-lg font-extrabold leading-tight text-ink">Front desk queue</p>
        </div>
        <span className="rounded-full bg-navy-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          Live
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-xl border border-mist-200 bg-mist-50 px-3.5 py-3"
          >
            <span className="text-sm font-medium text-ink">{row.name}</span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${row.tone}`}>
              {row.tag}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-mist-200 pt-4 text-center">
        {[
          { label: 'Waiting', value: '3' },
          { label: 'In consult', value: '2' },
          { label: 'Unpaid', value: '1' },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xl font-extrabold text-ink">{item.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-mist-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink" id="hero">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-dark bg-[size:56px_56px] opacity-60" />
        <div className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-azure-600/25 blur-[130px]" />
        <div className="absolute -bottom-52 right-0 h-[460px] w-[460px] rounded-full bg-azure-500/20 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow text-azure-300">
              <span className="h-1.5 w-1.5 rounded-full bg-azure-300" />
              Hospital and clinic management
            </p>

            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.6rem]">
              Every patient, every payment,
              <span className="text-azure-300"> in one system</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-100/80">
              TibaDesk replaces the paper register, the shoebox of receipts and the WhatsApp
              appointment list. Register patients, run the clinic, dispense from the pharmacy and
              close the day&rsquo;s billing from a single dashboard &mdash; on your own server,
              even when the internet is down.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/packages" className="btn-asaak-green">
                See editions and pricing
                <IconArrow />
              </Link>
              <Link to="/modules" className="btn-outline-light">
                Explore the modules
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
              {assurances.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-navy-100/70">
                  <IconCheck className="h-4 w-4 text-azure-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <img
                  src="/images/hero-clinician.jpg"
                  alt="A clinician providing care to a patient during a consultation"
                  className="h-[320px] w-full object-cover object-center sm:h-[420px] lg:h-[500px]"
                  loading="eager"
                  width="1600"
                  height="1067"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              </div>

              <div className="absolute -bottom-10 left-0 w-[min(100%,26rem)] sm:-bottom-12 sm:left-6">
                <ProductPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
