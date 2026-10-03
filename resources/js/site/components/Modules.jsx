const modules = [
  {
    title: 'PATIENTS & RECORDS',
    desc: 'Registration, triage, clinical notes, attachments and one shared history per patient.',
  },
  {
    title: 'APPOINTMENTS',
    desc: 'Daily queues, doctor rosters, waiting lists and reminders that cut no-shows.',
  },
  {
    title: 'BILLING & CLAIMS',
    desc: 'Invoices, deposits, mobile money payments and NHIF or private insurance claims.',
  },
  {
    title: 'PHARMACY & LAB',
    desc: 'Dispensing, stock control, expiry alerts, lab requests and results in one flow.',
  },
];

export default function Modules() {
  return (
    <section className="bg-canvas py-20 lg:py-28" id="modules">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-2">MODULES</p>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4 max-w-2xl">
          Everything Your Facility Runs On, <span className="text-brand">Connected</span>.
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
          Every edition starts with patient records, appointments, billing, permissions and reporting.
          Add the clinical modules your specialty needs.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {modules.map((module) => (
            <div
              key={module.title}
              className="group relative overflow-hidden bg-surface border border-gray-100 hover:border-brand/50 transition-colors duration-300 rounded-2xl"
            >
              <div className="h-1 w-full bg-brand/20 group-hover:bg-brand transition-colors duration-300" />
              <div className="p-5">
                <h3 className="text-ink font-bold text-lg mb-3 pb-3 border-b border-gray-100">
                  {module.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">{module.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <a href="/modules" className="btn-asaak">
            VIEW ALL MODULES
          </a>
        </div>
      </div>
    </section>
  );
}
