import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, Award, Activity, ArrowRight } from 'lucide-react';

const exploreItems = [
  {
    to: '/learn/warning-signs',
    icon: AlertTriangle,
    eyebrow: 'Listen to your body',
    title: 'Warning signs',
    description:
      'Common symptoms to watch for — plus a full guide on when to take action, from monitoring at home to seeking care right away.',
    cta: 'Explore warning signs',
  },
  {
    to: '/learn/diabetes-types',
    icon: Activity,
    eyebrow: 'Know the types',
    title: 'Four kinds of diabetes',
    description:
      'Type 1, Type 2, gestational, and prediabetes — explained calmly, side by side, with no jargon.',
    cta: 'Learn about types',
  },
  {
    to: '/learn/risk-assessment',
    icon: Award,
    eyebrow: '60-second check',
    title: 'Risk assessment',
    description:
      'Answer five quick questions to understand your risk level and get practical next steps — no sign-up needed.',
    cta: 'Take the assessment',
  },
  {
    to: '/learn/blog',
    icon: BookOpen,
    eyebrow: 'Education portal',
    title: 'Diabetes resource blog',
    description:
      'Research-backed guides, recipes, and lifestyle tips from certified health coaches.',
    cta: 'Browse articles',
  },
];

const ExploreSection = () => {
  return (
    <section id="learn" className="bg-[var(--cream-soft)] px-6 py-24">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
            — 03 / Go deeper
          </p>

          <h2 className="mt-3 font-serif text-4xl md:text-6xl leading-[1.1] text-[var(--brown)]">
            Learn at your own pace,{' '}
            <span className="italic text-[var(--sage-deep)]">
              one topic at a time.
            </span>
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-[var(--brown-soft)]">
            Everything you need lives in structured guides — calm, clear, and focused.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

          {exploreItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className="group relative flex flex-col rounded-2xl bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-20px_rgba(0,0,0,0.25)]"
              >

                {/* ✨ Animated soft border */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent animate-borderPulse group-hover:border-[rgba(47,106,79,0.35)] group-hover:shadow-[0_0_0_4px_rgba(47,106,79,0.08)] transition-all duration-500" />

                {/* Icon */}
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-[var(--sage-deep)]">
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                {/* Text */}
                <span className="mb-1 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--brown-soft)]">
                  {item.eyebrow}
                </span>

                <h3 className="mb-2 font-serif text-[1.35rem] font-bold text-[var(--brown)]">
                  {item.title}
                </h3>

                <p className="mb-5 flex-1 text-[1.02rem] leading-[1.6] text-[var(--brown-soft)]">
                  {item.description}
                </p>

                <span className="inline-flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--sage-deep)] transition-all duration-200 group-hover:gap-3">
                  {item.cta}
                  <ArrowRight size={16} />
                </span>

              </Link>
            );
          })}

        </div>
      </div>
    </section>
  );
};

export default ExploreSection;