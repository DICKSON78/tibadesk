import { Link } from 'react-router-dom';
import { IconArrow, IconPhone } from './icons';
import { SITE } from '../config';

export default function MainCta() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <img
          src="/images/hospital-building.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="lazy"
          width="1600"
          height="1067"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/50 to-ink/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-extrabold leading-[1.15] text-white sm:text-4xl">
            Start with the edition your facility needs today
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy-100/75">
            Subscribe for a month, install it on your own server, and switch to a larger edition
            later without changing anything you have already entered. Cancelling is a message, not
            a phone call.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/packages" className="btn-asaak-green">
              Compare editions
              <IconArrow />
            </Link>
            <a href={SITE.contact.phoneHref} className="btn-outline-light">
              <IconPhone className="h-4 w-4" />
              {SITE.contact.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
