import { Link } from 'react-router-dom';
import { IconArrow, IconDownload, IconShield, IconWifi } from './icons';

const points = [
  {
    icon: IconWifi,
    title: 'Runs on your own hardware',
    body: 'The package installs on a server in your facility or on a small local machine. A dropped internet connection does not stop registration, billing or dispensing.',
  },
  {
    icon: IconShield,
    title: 'Verified offline, signed once',
    body: 'Each subscription issues an Ed25519 signed licence naming the facility and its edition. The installation verifies the signature with the public key baked into the product. No callback, no external service.',
  },
  {
    icon: IconDownload,
    title: 'Your records stay yours',
    body: 'Patient data lives in your database on your server. Nothing is locked behind our infrastructure, so you can back it up, move it, or keep running it after a subscription ends.',
  },
];

export default function OfflineSection() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 lg:py-28">
      <div className="absolute inset-0 bg-grid-dark bg-[size:56px_56px] opacity-40" />
      <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-azure-600/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-azure-300">
              <IconWifi className="h-4 w-4" />
              Offline first
            </p>
            <h2 className="mt-4 text-balance text-3xl font-extrabold leading-[1.15] text-white sm:text-4xl">
              The internet is not a requirement for treating a patient
            </h2>
            <p className="mt-5 text-base leading-relaxed text-navy-100/75">
              Most clinical software assumes a clinic with constant connectivity. Tanzanian
              facilities often do not have that. TibaDesk is installed on your own server and keeps
              working through an outage, and the licence that unlocks it is verified locally instead
              of phoning home on every login.
            </p>

            <Link to="/packages" className="btn-asaak-green mt-9">
              Choose your edition
              <IconArrow />
            </Link>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src="/images/office-hallway.jpg"
                alt="A clinic corridor inside a modern medical facility"
                className="h-64 w-full object-cover sm:h-80 lg:h-[24rem]"
                loading="lazy"
                width="1600"
                height="1067"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            </div>

            <div className="mt-6 space-y-4">
              {points.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-azure-500/15 text-azure-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-100/70">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
