import { IconCash, IconChart, IconDatabase, IconShield, IconUsers, IconWifi } from './icons';

const reasons = [
  {
    icon: IconUsers,
    title: 'Built for the whole facility',
    body: 'Reception, clinicians, laboratory, pharmacy and the owner all work in the same system, so nobody is retyping what another department already recorded.',
  },
  {
    icon: IconCash,
    title: 'Billing that closes cleanly',
    body: 'Consultations, procedures, laboratory results and dispensed items accumulate onto one invoice per visit, with a daily summary that matches the cash in the drawer.',
  },
  {
    icon: IconChart,
    title: 'Reports you can defend',
    body: 'Revenue by department, debtors, stock movement and clinician productivity come from the same records, so a figure quoted in a meeting is the figure in the database.',
  },
  {
    icon: IconWifi,
    title: 'Offline capable',
    body: 'The package runs on your own server, so an internet outage slows nothing down. Patient records stay available to whoever needs them.',
  },
  {
    icon: IconShield,
    title: 'Roles and audit trail',
    body: 'Each user sees only what their role allows, and every change to a record is logged with the user and time, which matters when a bill is disputed.',
  },
  {
    icon: IconDatabase,
    title: 'Yours to keep',
    body: 'Your database lives on your infrastructure. If you stop subscribing, the records remain readable and exportable, because they were never held hostage on our servers.',
  },
];

export default function ValueProps() {
  return (
    <section className="bg-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="eyebrow text-azure-600">Why facilities choose it</p>
          <h2 className="section-title mt-4 text-balance">
            Less reconciliation, more time with patients
          </h2>
          <p className="mt-5 text-base leading-relaxed text-mist-700">
            Most of the cost of running a clinic on paper is paid in hours spent reconstructing what
            happened. TibaDesk removes the reconstruction, because the record is written once, at
            the point of care.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, body }) => (
            <article key={title} className="card card-hover p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-azure-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-extrabold text-ink">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-mist-700">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
