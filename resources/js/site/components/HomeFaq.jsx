import { useState } from 'react';
import { Link } from 'react-router-dom';
import { faqQuestions } from '../lib/faq';
import { IconArrow } from './icons';

const featured = ['General', 'Packages', 'Technical', 'Payment']
  .map((category) => faqQuestions.find((item) => item.category === category))
  .filter(Boolean);

export default function HomeFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow text-azure-600">Before you subscribe</p>
            <h2 className="section-title mt-4 text-balance">The questions we are asked first</h2>
            <p className="mt-5 text-base leading-relaxed text-mist-700">
              Editions, payments, installation and what happens to your data. The full list is on
              the FAQ page.
            </p>
            <Link to="/faq" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-azure-600 hover:text-ink">
              Read all questions
              <IconArrow className="h-4 w-4" />
            </Link>
          </div>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-mist-300 border-y border-mist-300">
              {featured.map(({ question, answer }, index) => {
                const isOpen = open === index;

                return (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left"
                    >
                      <span className="text-base font-semibold text-ink">{question}</span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isOpen
                            ? 'border-navy-900 bg-navy-900 text-white'
                            : 'border-mist-400 text-ink'
                        }`}
                      >
                        <svg
                          className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>

                    {isOpen && (
                      <p className="max-w-2xl pb-6 pr-12 text-sm leading-relaxed text-mist-700">
                        {answer}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
