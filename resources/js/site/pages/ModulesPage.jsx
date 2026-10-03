import { Link } from 'react-router-dom';
import { useCatalogue } from '../lib/catalogue';
import { MODULE_ICONS, IconCheck, IconUsers, IconNetwork, IconShield } from '../components/icons';
import MainCta from '../components/MainCta';

const ROLES = [
  { icon: 'shield', name: 'Super Admin', detail: 'Full control, settings, users and backups.' },
  { icon: 'clipboard', name: 'Reception', detail: 'Registration, appointments, queue and invoices.' },
  { icon: 'doctor', name: 'Doctor', detail: 'Consultations, prescriptions, lab and imaging orders.' },
  { icon: 'nurse', name: 'Nurse', detail: 'Vitals, ward rounds, admissions and bed status.' },
  { icon: 'pill', name: 'Pharmacy', detail: 'Dispensing, stock, expiry and purchase orders.' },
  { icon: 'flask', name: 'Laboratory', detail: 'Lab orders, results and release to the doctor.' },
  { icon: 'receipt', name: 'Billing / Cashier', detail: 'Invoices, receipts, insurance and daily income.' },
  { icon: 'users', name: 'HR / Payroll', detail: 'Staff records, payroll and attendance.' },
];

const COVERAGE = [
  {
    title: 'The clinical core',
    body: 'The register, the queue and the consultation record, built so a busy outpatient desk never needs the paper book again.',
    keys: ['registration', 'consultation'],
  },
  {
    title: 'Diagnostics and dispensing',
    body: 'Order a test or a prescription, receive the result or the stock, and keep the shelf and the patient bill in agreement.',
    keys: ['pharmacy', 'laboratory', 'dental', 'eye'],
  },
  {
    title: 'Whole-hospital operations',
    body: 'Inpatient beds, polyclinic departments and staff records for facilities that run more than a single consulting room.',
    keys: ['polyclinic', 'ipd', 'hr'],
  },
  {
    title: 'Money and oversight',
    body: 'Invoices, receipts, the reporting your board actually reads, and the licence that keeps the installation legal.',
    keys: ['billing', 'reporting', 'licensing'],
  },
];

const ROLE_ICONS = {
  shield: IconShield,
  clipboard: MODULE_ICONS.clipboard,
  doctor: MODULE_ICONS.stethoscope,
  nurse: MODULE_ICONS.stethoscope,
  pill: MODULE_ICONS.pill,
  flask: MODULE_ICONS.flask,
  receipt: MODULE_ICONS.receipt,
  users: IconUsers,
};

function ModuleGlyph({ name, className = 'w-5 h-5' }) {
  const Icon = MODULE_ICONS[name] ?? IconCheck;

  return <Icon className={className} />;
}

export default function ModulesPage() {
  const { modules, deployment, nonFunctional, loading, error } = useCatalogue();

  return (
    <>
      <section className="relative py-28 lg:py-36 overflow-hidden bg-ink">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-dark bg-[size:56px_56px] opacity-60" />
          <div className="absolute -top-32 left-1/3 w-[600px] h-[600px] rounded-full bg-brand/[0.07] blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">MODULES</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold text-white leading-[1.1] max-w-2xl">
              EVERY MODULE, <span className="text-brand">ONE PATIENT RECORD</span>
            </h1>
            <p className="text-navy-100/80 text-base mt-6 leading-relaxed max-w-xl">
              Reception, consultation, pharmacy, laboratory, billing and reporting all read and write
              the same file. Your team enters a detail once, and it appears everywhere it belongs.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img
              src="/images/medical-team.jpg"
              alt="Clinical team of health professionals at work in a hospital"
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
          {error && <p className="text-red-600 text-sm">The module list could not be loaded.</p>}
          {loading && <p className="text-gray-500 text-sm">Loading modules...</p>}

          {!loading && !error && modules.length > 0 && (
            <>
              <div className="max-w-2xl mb-14">
                <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">
                  WHAT IS IN TibaDesk
                </p>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-ink leading-tight">
                  Twelve modules, grouped by what your facility actually does
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mt-4">
                  Each package unlocks the modules it covers. The badge shows when a module lands, so
                  you know exactly what you are getting.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {modules.map((module) => (
                  <article
                    key={module.key}
                    className="bg-surface border border-gray-100 rounded-2xl p-6 lg:p-7 hover:border-brand/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <span className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                        <ModuleGlyph name={module.icon} className="w-5 h-5 text-brand" />
                      </span>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shrink-0 bg-brand/10 text-brand">
                        Complete
                      </span>
                    </div>

                    <h3 className="text-ink font-extrabold text-lg">{module.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mt-2">{module.summary}</p>

                    <details className="group mt-4">
                      <summary className="text-xs font-bold text-ink cursor-pointer hover:text-brand transition-colors inline-flex items-center gap-1.5">
                        {Object.keys(module.requirements).length} requirements
                        <IconCheck className="w-3 h-3 rotate-90 transition-transform group-open:rotate-0 text-gray-400" />
                      </summary>
                      <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                        {Object.entries(module.requirements).map(([code, text]) => (
                          <li key={code} className="text-xs text-gray-500 leading-relaxed flex gap-2">
                            <span className="text-brand font-bold shrink-0">{code}</span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-surface py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">
            WHO USES IT
          </p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4">
            Every role sees only what it needs
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mb-10">
            Roles and permissions come with the system. Staff see the modules their work needs, and
            support engineers get time-limited access instead of a permanent door.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((role) => {
              const Icon = ROLE_ICONS[role.icon] ?? IconUsers;

              return (
                <div
                  key={role.name}
                  className="bg-canvas border border-gray-100 rounded-2xl p-5"
                >
                  <Icon className="w-5 h-5 text-brand mb-3" />
                  <p className="text-ink font-bold text-sm">{role.name}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mt-1.5">{role.detail}</p>
                </div>
              );
            })}
          </div>

          <p className="text-gray-500 text-xs leading-relaxed mt-6 flex items-start gap-2 max-w-3xl">
            <IconNetwork className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            Vendor support engineers receive temporary, permission-based access to the specific module
            under fault. They never hold a standing account into patient data.
          </p>
        </div>
      </section>

      <section className="bg-canvas py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">WHAT YOU GET</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4">
            Everything is built, nothing is promised later
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mb-12">
            TibaDesk is not sold as a roadmap. Every module below is finished and running in the
            edition you subscribe to, so you are never asked to buy a half-built system and wait for a
            later version to become usable.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COVERAGE.map((group) => (
              <div key={group.title} className="bg-surface border border-gray-100 rounded-2xl p-6">
                <h3 className="text-ink font-extrabold text-lg mb-2">{group.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{group.body}</p>
                <ul className="mt-4 space-y-1.5 border-t border-gray-100 pt-4">
                  {group.keys.map((key) => {
                    const module = modules.find((item) => item.key === key);

                    return module ? (
                      <li key={key} className="text-xs text-gray-500 flex items-center gap-2">
                        <ModuleGlyph name={module.icon} className="w-3.5 h-3.5 text-brand shrink-0" />
                        {module.name}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <p className="text-xs font-bold tracking-[2px] uppercase text-brand mb-3">DEPLOYMENT</p>
            <h2 className="text-3xl font-extrabold text-ink leading-tight">
              Installed inside your facility
            </h2>
            <ul className="mt-8 space-y-3">
              {deployment.map((item) => (
                <li key={item.code} className="flex gap-3 text-gray-600 text-sm leading-relaxed">
                  <IconCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[2px] uppercase text-brand mb-3">
              NON-FUNCTIONAL
            </p>
            <h2 className="text-3xl font-extrabold text-ink leading-tight">
              What we hold ourselves to
            </h2>
            <ul className="mt-8 space-y-3">
              {nonFunctional.map((item) => (
                <li key={item.code} className="flex gap-3 text-gray-600 text-sm leading-relaxed">
                  <IconCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 text-center">
          <Link to="/compare" className="btn-asaak">
            COMPARE WHAT EACH PACKAGE GIVES YOU
          </Link>
        </div>
      </section>

      <MainCta />
    </>
  );
}
