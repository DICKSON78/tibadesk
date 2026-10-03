import { Link } from 'react-router-dom';
import { useCatalogue } from '../lib/catalogue';
import { EDITION_IMAGES, LICENCE_TERMS } from '../config';
import { MODULE_ICONS, IconCheck, IconClose } from '../components/icons';
import MainCta from '../components/MainCta';

const ROWS = [
  { key: 'users', label: 'Users', kind: 'limit' },
  { key: 'patients', label: 'Patients', kind: 'limit' },
];

function ModuleIcon({ name, className = 'w-4 h-4' }) {
  const Icon = MODULE_ICONS[name] ?? IconCheck;

  return <Icon className={className} />;
}

/**
 * Side-by-side comparison of every package against every module, built from
 * the same catalogue the packages page uses, so the two can never disagree.
 */
export default function ComparePage() {
  const { editions, allModules, loading, error } = useCatalogue();

  const modules = allModules?.modules ?? [];

  return (
    <>
      <section className="relative py-28 lg:py-32 overflow-hidden bg-ink">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-dark bg-[size:56px_56px] opacity-60" />
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-brand/[0.07] blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">COMPARE</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl">
            SEE EXACTLY WHAT <span className="text-brand">EACH PACKAGE</span> GIVES YOU
          </h1>
          <p className="text-navy-100/80 text-base mt-6 leading-relaxed max-w-2xl">
            Every package is on-premise and unlocked by a single subscription. The table below shows
            which module each one includes, side by side.
          </p>
        </div>
      </section>

      <section className="bg-canvas py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          {error && <p className="text-red-600 text-sm">The comparison could not be loaded.</p>}
          {loading && <p className="text-gray-500 text-sm">Loading comparison...</p>}

          {!loading && !error && editions.length > 0 && (
            <>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[880px] border-collapse">
                  <thead>
                    <tr>
                      <th className="w-[240px] text-left align-bottom pb-6 pr-6">
                        <span className="text-xs font-bold tracking-[2px] uppercase text-gray-400">
                          Module
                        </span>
                      </th>
                      {editions.map((edition) => {
                        const image = EDITION_IMAGES[edition.key] ?? EDITION_IMAGES.hospital;

                        return (
                          <th key={edition.key} className="px-3 pb-6 align-bottom">
                            <div className="bg-surface border border-gray-100 rounded-2xl overflow-hidden">
                              <img
                                src={image.src}
                                alt={image.alt}
                                className="h-20 w-full object-cover"
                                loading="lazy"
                                width="1600"
                                height="1067"
                              />
                              <div className="p-4">
                                <p className="text-sm font-extrabold text-ink leading-tight">
                                  {edition.name}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">
                                  Price on request
                                </p>
                                <Link
                                  to={`/checkout/${edition.key}`}
                                  className="mt-3 block text-center px-3 py-2 text-[10px] font-bold tracking-wider rounded-full bg-ink text-white hover:bg-brand transition-colors"
                                >
                                  SUBSCRIBE
                                </Link>
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {ROWS.map((row) => (
                      <tr key={row.key} className="border-t border-gray-100">
                        <th className="py-4 pr-6 text-left text-sm font-semibold text-ink">
                          {row.label}
                        </th>
                        {editions.map((edition) => (
                          <td key={edition.key} className="px-3 py-4 text-center text-sm text-gray-600">
                            {edition.limits[row.key]}
                          </td>
                        ))}
                      </tr>
                    ))}

                    <tr className="border-t border-gray-100">
                      <th className="py-4 pr-6 text-left text-sm font-semibold text-ink">
                        Deployment
                      </th>
                      {editions.map((edition) => (
                        <td
                          key={edition.key}
                          className="px-3 py-4 text-center text-sm text-gray-600"
                        >
                          On-premise
                        </td>
                      ))}
                    </tr>

                    <tr className="border-t border-gray-100">
                      <th className="py-4 pr-6 pt-8 text-left">
                        <span className="text-xs font-bold tracking-[2px] uppercase text-gray-400">
                          Modules included
                        </span>
                      </th>
                      {editions.map((edition) => (
                        <td key={edition.key} className="px-3 pt-8 text-center">
                          <span className="inline-block px-3 py-1 bg-canvas rounded-full text-xs font-bold text-ink">
                            {edition.modules.length} of {modules.length}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {modules.map((module) => (
                      <tr key={module.key} className="border-t border-gray-100 hover:bg-surface">
                        <th className="py-4 pr-6 text-left">
                          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                            <ModuleIcon name={module.icon} className="w-4 h-4 text-brand shrink-0" />
                            {module.name}
                          </span>
                        </th>
                        {editions.map((edition) => {
                          const included = edition.module_keys.includes(module.key);

                          return (
                            <td key={edition.key} className="px-3 py-4 text-center">
                              {included ? (
                                <IconCheck
                                  className="w-4 h-4 text-brand mx-auto"
                                  aria-label="Included"
                                />
                              ) : (
                                <IconClose
                                  className="w-3.5 h-3.5 text-gray-300 mx-auto"
                                  aria-label="Not included"
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {allModules && (
                <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 bg-surface border border-gray-100 rounded-2xl p-6">
                  <div className="flex-1">
                    <p className="text-ink font-extrabold text-sm">Need every module at once?</p>
                    <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                      We scope an all-modules installation with your facility instead of making you
                      choose.
                    </p>
                  </div>
                  <Link to="/contact" className="btn-asaak-green shrink-0">
                    TALK TO US
                  </Link>
                </div>
              )}

              <div className="mt-10 text-center">
                <p className="text-xs font-bold tracking-[2px] uppercase text-gray-400 mb-4">
                  Licence terms
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {LICENCE_TERMS.map((term) => (
                    <span
                      key={term.key}
                      className="px-5 py-2.5 bg-surface border border-gray-100 rounded-full text-sm font-bold text-ink"
                    >
                      {term.label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <MainCta />
    </>
  );
}
