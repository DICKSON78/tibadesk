const audiences = [
  'Dental clinics',
  'Eye clinics',
  'Polyclinics',
  'Private hospitals',
  'Diagnostic centres',
  'Pharmacies',
  'Medical labs',
  'Health centres',
];

export default function AudienceStrip() {
  return (
    <section className="border-b border-mist-300 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-7">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-mist-600">
          Built for facilities from a single room to a full hospital
        </p>
      </div>

      <div className="mask-fade-x overflow-hidden">
        <ul className="mx-auto flex w-max items-center gap-3 px-6 pb-7">
          {audiences.map((item) => (
            <li
              key={item}
              className="whitespace-nowrap rounded-full border border-mist-300 bg-mist-100 px-5 py-2.5 text-sm font-medium text-navy-800"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
