import { Link } from 'react-router-dom';
import { IconArrow, IconCheck } from './icons';

const dayOne = [
  'Your database created and backed up on your own server',
  'Roles and permissions for reception, clinician, cashier and owner',
  'Your logo, colours and invoice header applied',
  'Service prices, insurance schemes and tax settings configured',
  'Pharmacy stock loaded with opening balances',
  'Superuser training for your team, on site or remote',
];

export default function DayOne() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow text-azure-600">Onboarding</p>
            <h2 className="section-title mt-4 text-balance">What is done for you in week one</h2>
            <p className="mt-5 text-base leading-relaxed text-mist-700">
              Installation is part of the subscription, not an extra invoice. A TibaDesk engineer
              sets up the database on your server, loads your prices and works with your team until
              the front desk is comfortable taking a patient through a full visit.
            </p>

            <img
              src="/images/team-meeting.jpg"
              alt="Clinical staff in a hands-on training session"
              className="mt-8 h-56 w-full rounded-2xl object-cover sm:h-64"
              loading="lazy"
              width="1600"
              height="1067"
            />
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-4 sm:grid-cols-2">
              {dayOne.map((item) => (
                <li key={item} className="card card-hover flex h-full items-start gap-3 p-5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900">
                    <IconCheck className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="text-sm leading-relaxed text-navy-800">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-mist-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-mist-800">
                Not sure which edition fits? Tell us your departments and staff count and we will
                recommend one.
              </p>
              <Link to="/contact" className="btn-asaak shrink-0">
                Ask us
                <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
