import { IconDownload, IconShield, IconCash } from './icons';

const steps = [
  {
    icon: IconCash,
    title: 'Subscribe and pay',
    body: 'Pick the edition that matches your facility, enter your details and pay the month with ClickPesa. Nothing is charged automatically after that.',
  },
  {
    icon: IconDownload,
    title: 'Download your package',
    body: 'As soon as the payment clears, the installer and your signed licence appear on the checkout page and in your email.',
  },
  {
    icon: IconShield,
    title: 'Install and go live',
    body: 'We set up the database on your server, load your prices and stock, and train your team until a full patient visit runs end to end.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="eyebrow text-azure-600">Getting started</p>
          <h2 className="section-title mt-4 text-balance">From payment to first patient in three steps</h2>
          <p className="mt-5 text-base leading-relaxed text-mist-700">
            No sales call is required to start. The whole purchase is handled on this site, and the
            licence is issued the moment the payment is confirmed.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="card card-hover relative p-7">
              <span className="absolute right-6 top-6 text-4xl font-extrabold text-mist-200">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-lg font-extrabold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-700">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
