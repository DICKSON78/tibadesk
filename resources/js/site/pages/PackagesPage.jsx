import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogue } from '../lib/catalogue';
import { EDITION_IMAGES, LICENCE_TERMS } from '../config';
import { MODULE_ICONS, IconCheck, IconUsers, IconBriefcase, IconServer } from '../components/icons';
import MainCta from '../components/MainCta';

function ModuleIcon({ name, className = 'w-4 h-4' }) {
  const Icon = MODULE_ICONS[name] ?? IconCheck;

  return <Icon className={className} />;
}

export default function PackagesPage() {
  const {
    editions,
    sharedModules,
    allModules,
    deployment,
    nonFunctional,
    loading,
    error,
  } = useCatalogue();
  const [openEdition, setOpenEdition] = useState(null);

  return (
    <>
      <section className="relative py-28 lg:py-36 overflow-hidden bg-ink">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-dark bg-[size:56px_56px] opacity-60" />
          <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full bg-brand/[0.07] blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">PACKAGES</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl">
            ONE SUBSCRIPTION, <span className="text-brand">EVERY MODULE</span> YOU SUBSCRIBE FOR
          </h1>
          <p className="text-navy-100/80 text-base mt-6 leading-relaxed max-w-2xl">
            Each package runs on your own hardware over your local network. Subscribe once and you
            get every module that package covers, then pay and receive a signed licence for 3
            months, 6 months or one year.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
            <img
              src="/images/medical-team.jpg"
              alt="Health professionals working together in a hospital"
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
          {error && (
            <p className="text-red-600 text-sm">
              The package catalogue could not be loaded. Please refresh the page.
            </p>
          )}
          {loading && <p className="text-gray-500 text-sm">Loading packages...</p>}

          {!loading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-gray-100">
              <p className="text-gray-500 text-sm">
                Not sure which package fits? Compare them module by module.
              </p>
              <Link to="/compare" className="btn-asaak">
                COMPARE PACKAGES
              </Link>
            </div>
          )}

          {!loading && !error && (
            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              {editions.map((edition) => {
                const image = EDITION_IMAGES[edition.key] ?? EDITION_IMAGES.hospital;
                const isOpen = openEdition === edition.key;

                return (
                  <div
                    key={edition.key}
                    className={`flex flex-col bg-surface border rounded-2xl p-6 lg:p-8 transition-colors ${
                      edition.highlighted
                        ? 'border-brand ring-1 ring-brand/30'
                        : 'border-gray-100 hover:border-brand/40'
                    }`}
                  >
                    <div className="overflow-hidden rounded-xl mb-6">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                        width="1600"
                        height="1067"
                      />
                    </div>

                    <h2 className="text-xl font-extrabold text-ink">{edition.name}</h2>
                    <p className="text-gray-500 text-xs leading-relaxed mt-2">{edition.tagline}</p>

                    <div className="flex items-baseline gap-2 py-5 mt-5 border-y border-gray-100">
                      <span className="text-2xl font-extrabold text-ink">Price on request</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed -mt-3 mb-5">
                      We quote each facility. Subscriptions are billed for 3 months, 6 months or one
                      year.
                    </p>

                    <p className="text-ink font-bold text-sm mb-3">
                      Modules you get ({edition.modules.length})
                    </p>
                    <ul className="space-y-2.5 mb-6">
                      {edition.modules.map((module) => (
                        <li key={module.key} className="text-gray-600 text-sm flex gap-2.5 leading-relaxed">
                          <ModuleIcon name={module.icon} className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                          <span>{module.name}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-canvas rounded-xl p-3 text-center">
                        <IconUsers className="w-4 h-4 text-brand mx-auto mb-1.5" />
                        <p className="text-ink font-bold text-sm">{edition.limits.users}</p>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-1">Users</p>
                      </div>
                      <div className="bg-canvas rounded-xl p-3 text-center">
                        <IconBriefcase className="w-4 h-4 text-brand mx-auto mb-1.5" />
                        <p className="text-ink font-bold text-sm">{edition.limits.patients}</p>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-1">Patients</p>
                      </div>
                      <div className="bg-canvas rounded-xl p-3 text-center">
                        <IconServer className="w-4 h-4 text-brand mx-auto mb-1.5" />
                        <p className="text-ink font-bold text-sm text-xs leading-tight pt-1">
                          On-premise
                        </p>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-1">
                          Install
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                      <Link
                        to={`/checkout/${edition.key}`}
                        className={edition.highlighted ? 'btn-asaak-green flex-1' : 'btn-asaak flex-1'}
                      >
                        SUBSCRIBE
                      </Link>
                      <button
                        type="button"
                        onClick={() => setOpenEdition(isOpen ? null : edition.key)}
                        className="px-6 py-3 text-xs font-bold tracking-wider text-ink border border-gray-200 rounded-full hover:border-brand transition-colors"
                      >
                        {isOpen ? 'HIDE DETAILS' : 'MODULE DETAILS'}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-ink font-bold text-sm mb-3">What each module covers</p>
                        <ul className="space-y-4">
                          {edition.modules.map((module) => (
                            <li key={module.key}>
                              <p className="text-ink text-xs font-bold flex items-center gap-2">
                                <ModuleIcon name={module.icon} className="w-3.5 h-3.5 text-brand" />
                                {module.name}
                              </p>
                              <p className="text-gray-500 text-xs leading-relaxed mt-1">
                                {module.summary}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && allModules && (
            <div className="mt-8 bg-ink rounded-2xl p-8 lg:p-10">
              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">{allModules.name}</h2>
                  <p className="text-navy-100/80 text-sm mt-3 leading-relaxed">
                    {allModules.tagline} If your facility needs every module at once, we scope it with
                    you rather than making you pick a package.
                  </p>
                  <Link to="/contact" className="btn-asaak-green mt-6 inline-flex">
                    TALK TO US
                  </Link>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                  {allModules.modules.map((module) => (
                    <li key={module.key} className="text-navy-100/70 text-xs flex items-center gap-2">
                      <IconCheck className="w-3 h-3 text-brand shrink-0" />
                      {module.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!loading && !error && sharedModules.length > 0 && (
            <div className="mt-16">
              <p className="text-xs font-bold tracking-[2px] uppercase text-gray-400 mb-6">
                Included in every package
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedModules.map((module) => (
                  <div key={module.key} className="flex items-center gap-2.5 text-gray-600 text-sm">
                    <IconCheck className="w-4 h-4 text-brand shrink-0" />
                    {module.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <p className="text-xs font-bold tracking-[2px] uppercase text-brand mb-3">
              HOW IT IS INSTALLED
            </p>
            <h2 className="text-3xl font-extrabold text-ink leading-tight">
              Runs on your hardware, inside your building
            </h2>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              There is no cloud to depend on. Your records stay on the server in your own facility and
              the system keeps working when the internet does not.
            </p>
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
              WHAT WE COMMIT TO
            </p>
            <h2 className="text-3xl font-extrabold text-ink leading-tight">
              Built for the way a hospital actually runs
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
      </section>

      <section className="bg-canvas py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-bold tracking-[2px] uppercase text-gray-400 mb-4">
            LICENCE TERMS
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            {LICENCE_TERMS.map((term) => (
              <span
                key={term.key}
                className="px-5 py-2.5 bg-surface border border-gray-100 rounded-full text-sm font-bold text-ink"
              >
                {term.label}
              </span>
            ))}
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Choose a term when you subscribe. The signed licence you download after payment carries
            that term, and the system warns you 30 days before it expires.
          </p>
        </div>
      </section>

      <MainCta />
    </>
  );
}
