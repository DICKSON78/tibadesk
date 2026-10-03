import { IconCalendar, IconLayers, IconShield, IconWifi } from './icons';

const facts = [
  {
    value: '4',
    label: 'Editions, one platform',
    detail: 'Dental, eye, polyclinic and hospital, so you never outgrow the system.',
    icon: IconLayers,
  },
  {
    value: '30 days',
    label: 'Minimum commitment',
    detail: 'Subscribe for 3, 6 or 12 months. Nothing is charged automatically.',
    icon: IconCalendar,
  },
  {
    value: 'Offline',
    label: 'Keeps working',
    detail: 'Runs on your own server, so a dropped connection never stops the clinic.',
    icon: IconWifi,
  },
  {
    value: 'Signed',
    label: 'Licence, not a phone call home',
    detail: 'Each installation is verified offline against a public key.',
    icon: IconShield,
  },
];

export default function FactsBand() {
  return (
    <section className="bg-surface py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-mist-300 bg-mist-300 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ value, label, detail, icon: Icon }) => (
            <div key={label} className="bg-surface p-7">
              <Icon className="h-6 w-6 text-azure-600" />
              <p className="mt-5 text-3xl font-extrabold leading-none text-ink">{value}</p>
              <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
              <p className="mt-2 text-sm leading-relaxed text-mist-700">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
