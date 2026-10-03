import MainCta from '../components/MainCta';
import ValueProps from '../components/ValueProps';
import { IconArrow } from '../components/icons';
import { Link } from 'react-router-dom';

const facilityTypes = [
  {
    name: 'Dental clinics',
    body: 'Chair-side charting, treatment plans, dental imaging attachments and recall lists for the patients who are overdue for a cleaning.',
    image: '/images/tanzania-dental.jpg',
    alt: 'Dentist working with a patient in a dental surgery room',
  },
  {
    name: 'Eye clinics',
    body: 'Visual acuity and refraction records, optical prescriptions, and dispensing linked to the visit that produced them.',
    image: '/images/tanzania-eye.jpg',
    alt: 'Ophthalmologist examining a patient at an eye clinic',
  },
  {
    name: 'Polyclinics',
    body: 'Multiple departments sharing one patient file, with a laboratory, pharmacy, insurance fields and a front desk that sees the whole queue.',
    image: '/images/tanzania-polyclinic.jpg',
    alt: 'Doctor and nurse attending to a patient in a consultation room',
  },
  {
    name: 'Private hospitals',
    body: 'Admissions, wards, bed occupancy, theatre scheduling and inpatient billing on top of the outpatient workflow.',
    image: '/images/hospital-building.jpg',
    alt: 'The exterior of a modern hospital building',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-grid-dark bg-[size:56px_56px] opacity-50" />
        <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-azure-600/20 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <p className="eyebrow text-azure-300">About TibaDesk</p>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-[3.4rem]">
            Clinical software that assumes a real clinic, not a demo
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-navy-100/80">
            TibaDesk is built around the sequence of an actual visit in a Tanzanian facility: the
            question at reception, the consultation, the prescription, the dispense, the bill, and
            the report the facility owes its board at the end of the month. Every module exists
            because a working day required it.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { value: 'Self-hosted', label: 'Installed on your server' },
              { value: '3 / 6 / 12', label: 'Months of licence' },
              { value: 'Tanzania', label: 'Built for local facilities' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-2xl font-extrabold text-white">{item.value}</p>
                <p className="mt-1.5 text-sm text-navy-100/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl bg-ink px-6 py-12 text-center lg:px-12 lg:py-16">
            <p className="eyebrow justify-center text-azure-300">Our mission</p>
            <p className="mx-auto mt-5 max-w-3xl text-balance text-xl font-semibold leading-snug text-white lg:text-2xl">
              Make every clinic in Tanzania as safe and as well-run as the best hospital in the
              country, regardless of its size or budget.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-azure-600">Who it is for</p>
            <h2 className="section-title mt-4 text-balance">One platform, sized to the facility</h2>
            <p className="mt-5 text-base leading-relaxed text-mist-700">
              The editions share a single codebase and database shape, so a clinic that grows into a
              polyclinic keeps its history instead of starting again.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {facilityTypes.map((type) => (
              <article key={type.name} className="card card-hover overflow-hidden">
                <img
                  src={type.image}
                  alt={type.alt}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                  width="1600"
                  height="1067"
                />
                <div className="p-7">
                  <h3 className="text-lg font-extrabold text-ink">{type.name}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-mist-700">{type.body}</p>
                </div>
              </article>
            ))}
          </div>

          <Link to="/packages" className="btn-asaak mt-10">
            Compare the editions
            <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <ValueProps />
      <MainCta />
    </>
  );
}
