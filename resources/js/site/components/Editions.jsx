import { Link } from 'react-router-dom';
import { useCatalogue } from '../lib/catalogue';
import { IconCheck } from './icons';

export default function Editions() {
  const { editions, loading, error } = useCatalogue();

  return (
    <section className="bg-ink py-16 lg:py-24" id="packages">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-2">PACKAGES</p>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 max-w-2xl">
          Four packages. One <span className="text-brand">licence</span> per subscription.
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
          Subscribe for 3 months, 6 months or one year and every module in that package is unlocked
          on your own server. We quote the price for your facility.
        </p>

        {error && (
          <p className="text-brand text-sm mt-6">
            The package catalogue could not be loaded. Please refresh or contact us.
          </p>
        )}

        {loading && <p className="text-gray-400 text-sm mt-6">Loading packages...</p>}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {editions.map((edition) => (
              <div
                key={edition.key}
                className={`group relative flex flex-col bg-white/5 border p-5 transition-colors duration-300 rounded-2xl ${
                  edition.highlighted
                    ? 'border-brand/60 ring-1 ring-brand/30'
                    : 'border-white/10 hover:border-brand/50'
                }`}
              >
                <h3 className="text-white font-bold text-lg mb-2">{edition.name}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-5 min-h-[48px]">
                  {edition.tagline}
                </p>

                <div className="mb-5">
                  <p className="text-white text-xl font-extrabold">Price on request</p>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">
                    3, 6 or 12 months
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {edition.modules.slice(0, 3).map((module) => (
                    <li
                      key={module.key}
                      className="text-gray-300 text-xs leading-relaxed flex gap-2"
                    >
                      <IconCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      {module.name}
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/checkout/${edition.key}`}
                  className={
                    edition.highlighted ? 'btn-asaak-green w-full' : 'btn-outline-light w-full'
                  }
                >
                  SUBSCRIBE
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <Link to="/compare" className="btn-outline-light">
            COMPARE PACKAGES
          </Link>
          <Link to="/packages" className="btn-outline-light">
            SEE ALL MODULES
          </Link>
        </div>
      </div>
    </section>
  );
}
