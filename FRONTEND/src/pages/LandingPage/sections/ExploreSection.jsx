import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const exploreItems = [
  {
    to: '/learn/warning-signs',
    title: 'Warning signs',
    description: 'Symptoms to watch for, and when to take action.',
  },
  {
    to: '/learn/diabetes-types',
    title: 'Types of diabetes',
    description: 'Type 1, Type 2, gestational, and prediabetes — calmly explained.',
  },
  {
    to: '/learn/risk-assessment',
    title: 'Risk assessment',
    description: 'Five quick questions. Practical next steps. No sign-up.',
  },
  {
    to: '/learn/blog',
    title: 'Resource blog',
    description: 'Guides, recipes, and lifestyle tips from health coaches.',
  },
];

const ExploreSection = () => {
  return (
    <section id="learn" className="bg-[var(--cream-soft)] px-6 py-24">
      <div className="mx-auto max-w-6xl">

        <div className="mb-12 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
            — 03 / Go deeper
          </p>

          <h2 className="mt-3 font-serif text-4xl md:text-5xl leading-[1.1] text-[var(--brown)]">
            Learn at your own pace,{' '}
            <span className="italic text-[var(--sage-deep)]">
              one topic at a time.
            </span>
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-[var(--brown-soft)]">
            Structured guides — calm, clear, and focused.
          </p>
        </div>

        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {exploreItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="group flex flex-col gap-2 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 transition-colors hover:bg-[var(--cream)]/60 -mx-2 px-2 sm:-mx-4 sm:px-4 rounded-lg"
              >
                <div className="min-w-0">
                  <h3 className="font-serif text-[1.35rem] text-[var(--brown)] group-hover:text-[var(--sage-deep)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--brown-soft)]">
                    {item.description}
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--sage-deep)] transition-all duration-200 group-hover:gap-3">
                  Read
                  <ArrowRight size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ExploreSection;
