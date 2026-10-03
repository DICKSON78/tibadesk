import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { faqCategories as categories, faqQuestions as questions } from '../lib/faq';

export default function FaqPage() {
  const [active, setActive] = useState('All');
  const [open, setOpen] = useState(null);

  const visible = useMemo(
    () => (active === 'All' ? questions : questions.filter((item) => item.category === active)),
    [active],
  );

  return (
    <>
      <section className="relative py-24 lg:py-32 overflow-hidden bg-ink text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-dark bg-[size:56px_56px] opacity-60" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand/[0.06] blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">FAQ</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Questions, <span className="text-brand">Answered</span>
          </h1>
            <p className="text-navy-100/80 text-base mt-6 leading-relaxed">
              Everything about editions, subscriptions, payments and installation.
            </p>
          </div>

          <div className="max-w-5xl mx-auto px-6 relative z-10 mt-14">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { src: '/images/consult-room.jpg', alt: 'A nurse providing patient care in a treatment room' },
                { src: '/images/admin-desk.jpg', alt: 'A hospital reception and patient waiting area' },
                { src: '/images/office-hallway.jpg', alt: 'A corridor inside a health facility' },
              ].map((shot) => (
                <div key={shot.src} className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="h-40 w-full object-cover sm:h-48"
                    loading="lazy"
                    width="1600"
                    height="1067"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

      <section className="bg-canvas py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActive(category);
                  setOpen(null);
                }}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${
                  active === category
                    ? 'bg-ink text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {visible.map((item) => {
              const isOpen = open === item.question;

              return (
                <div key={item.question} className="border border-gray-100 rounded-2xl overflow-hidden bg-surface">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : item.question)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-ink font-bold text-sm pr-4">{item.question}</span>
                    <span className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                      <svg
                        className={`w-4 h-4 text-ink transition-transform duration-150 ${isOpen ? 'rotate-45' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">{item.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 lg:py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4">
            Still Have <span className="text-brand">Questions</span>?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Tell us what your facility needs and we will recommend the right edition.
          </p>
          <Link to="/contact" className="btn-asaak-green">
            CONTACT US
          </Link>
        </div>
      </section>
    </>
  );
}
