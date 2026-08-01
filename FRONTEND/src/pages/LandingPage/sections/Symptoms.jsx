import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { ArrowRight, ArrowLeft, Info, Activity } from 'lucide-react';

/**
 * Symptoms page — restyled to match the DiaBuddy design tokens
 * defined in your global CSS:
 *   --sage / --sage-deep / --olive  → primary greens
 *   --butter / --rust / --pink      → warm accents
 *   --cream / --bg                  → surfaces
 *   --brown / --ink                 → text
 *   Fonts: Fraunces (display/serif) + Inter (body)
 *
 * v4 notes (Tailwind port):
 * - All inline `style` objects have been converted to Tailwind utility
 *   classes. Design-token colors (--sage-deep, --brown, --line, etc.)
 *   are referenced via Tailwind's arbitrary value syntax, e.g.
 *   `bg-[var(--sage-deep)]`, so the same locally-scoped CSS variable
 *   overrides defined in `.dbx-symptoms` still drive the palette.
 * - Values that Tailwind can't express as a utility (custom keyframes,
 *   the .dbx-symptoms variable block, per-row hover choreography) stay
 *   in the scoped <style> tag at the bottom.
 * - Behavior, structure, and copy are unchanged from the previous version.
 */

const symptoms = [
  {
    title: 'Increased Thirst',
    description:
      'Feeling thirsty more often than usual, even after drinking water.',
    accent: 'text-[var(--sage-deep)]',
    tag: 'Hydration',
    stat: '01',
  },
  {
    title: 'Frequent Urination',
    description:
      'Needing to use the bathroom more often, especially at night.',
    accent: 'text-[var(--rust)]',
    tag: 'Routine',
    stat: '02',
  },
  {
    title: 'Extreme Fatigue',
    description:
      "Feeling tired and low on energy, even after a full night's sleep.",
    accent: 'text-[var(--olive)]',
    tag: 'Energy',
    stat: '03',
  },
  {
    title: 'Blurred Vision',
    description:
      'Eyesight that comes and goes, or feels fuzzy and unclear.',
    accent: 'text-[var(--sage-deep)]',
    tag: 'Senses',
    stat: '04',
  },
  {
    title: 'Unexplained Weight Loss',
    description:
      'Losing weight without trying, even when eating normally.',
    accent: 'text-[var(--butter)]',
    tag: 'Body',
    stat: '05',
  },
  {
    title: 'Slow Healing',
    description:
      'Cuts and bruises that take longer than usual to heal.',
    accent: 'text-[var(--rust)]',
    tag: 'Recovery',
    stat: '06',
  },
];

const warningLevels = [
  {
    level: 'Immediate Attention',
    short: 'Urgent',
    description:
      'Seek medical help right away if you experience these symptoms.',
    accent: 'text-[var(--rust)]',
    items: [
      'Severe abdominal pain',
      'Difficulty breathing',
      'Extreme confusion',
      'Loss of consciousness',
    ],
  },
  {
    level: 'Keep Monitoring',
    short: 'Watch',
    description: 'Stay aware and track any changes in your symptoms.',
    accent: 'text-[var(--sage)]',
    items: [
      'Mild thirst',
      'Occasional fatigue',
      'Minor changes in appetite',
    ],
  },
];

const Symptoms = ({
  showHeader = true,
  eyebrow = 'Body signals',
  showNavbar = true,
  backTo = '/',
  backLabel = 'Back',
}) => {
  const [activeLevel, setActiveLevel] = useState(0);
  const active = warningLevels[activeLevel];

  return (
    <>
      {showNavbar && <Navbar />}

      <section
        className="dbx-symptoms relative overflow-hidden pb-[120px] font-sans text-[var(--brown)]"
        style={{ background: 'var(--cream-soft)' }}
      >
        {/* Back button */}
        <Link
          to={backTo}
          className="dbx-back-link absolute left-6 top-[88px] z-10 inline-flex items-center gap-2 font-sans text-sm font-bold tracking-[0.02em] text-[var(--brown)] no-underline transition-transform duration-200 ease-out hover:-translate-x-1 hover:opacity-75"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          {backLabel}
        </Link>

        <div
          className="container relative"
          style={{ paddingTop: '140px' }}
        >
          {showHeader && (
            <header
              className="dbx-fade-item mb-24 grid gap-10 md:grid-cols-12"
              style={{ animationDelay: '0ms' }}
            >
              <div className="md:col-span-7">
                {eyebrow && (
                  <div className="mb-6 inline-flex items-center gap-2 font-sans text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--sage-deep)]">
                    <span className="h-[1.5px] w-7 bg-[var(--sage-deep)]" />
                    {eyebrow}
                  </div>
                )}
                <h1 className="m-0 font-serif text-[clamp(48px,7vw,96px)] font-bold leading-[0.95] tracking-[-0.035em] text-[var(--brown)]">
                  Warning signs
                  <br />
                  <em className="font-semibold not-italic italic text-[var(--olive)]">
                    worth noticing.
                  </em>
                </h1>
              </div>

              <div className="flex flex-col justify-end md:col-span-5 md:pt-6">
                <p className="max-w-[38ch] font-sans text-[17px] font-semibold leading-relaxed text-[var(--brown-soft)]">
                  Your body speaks in quiet signals. Below are the most common
                  ones — and a simple guide to knowing when to act.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  <Activity size={14} strokeWidth={2.5} />
                  06 signals · 02 response levels
                </div>
              </div>
            </header>
          )}

          {/* SYMPTOM LIST */}
          <div className="mb-28">
            <div className="mb-8 flex items-baseline justify-between border-b-2 border-[var(--line)] pb-4">
              <h2 className="m-0 font-serif text-[22px] font-bold tracking-[-0.02em] text-[var(--brown)]">
                The signals
              </h2>
              <span className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                Scroll to explore
              </span>
            </div>

            <ul className="grid gap-0">
              {symptoms.map((s, idx) => (
                  <li
                    key={s.title}
                    className="dbx-symptom-row dbx-fade-item group grid grid-cols-12 items-start gap-4 border-b border-[var(--line)] py-7 md:gap-6 md:py-8"
                    style={{ animationDelay: `${100 + idx * 80}ms` }}
                  >
                    <div className="col-span-2 md:col-span-1">
                      <span
                        className={`font-serif text-[20px] font-semibold italic md:text-[22px] ${s.accent}`}
                      >
                        {s.stat}
                      </span>
                    </div>

                    <div className="col-span-10 md:col-span-5">
                      <div className="mb-1.5 font-sans text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                        {s.tag}
                      </div>
                      <h3 className="m-0 font-serif text-[22px] font-bold tracking-[-0.02em] text-[var(--brown)] md:text-[26px]">
                        {s.title}
                      </h3>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <p className="m-0 max-w-[52ch] font-sans text-base font-semibold leading-relaxed text-[var(--brown-soft)]">
                        {s.description}
                      </p>
                    </div>
                  </li>
              ))}
            </ul>
          </div>

          {/* RESPONSE GUIDE */}
          <div className="mb-28 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="mb-5 inline-flex items-center gap-2 font-sans text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--sage-deep)]">
                <Info size={14} strokeWidth={2.5} />
                Response guide
              </div>
              <h2 className="m-0 mb-[18px] font-serif text-[clamp(34px,4.4vw,52px)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--brown)]">
                When should you take action?
              </h2>
              <p className="mb-8 max-w-[42ch] font-sans text-base font-semibold leading-relaxed text-[var(--brown-soft)]">
                Choose a level to see what belongs there — and how urgently to
                move.
              </p>

              <ul className="mt-2">
                {warningLevels.map((lvl, i) => {
                  const isActive = activeLevel === i;
                  return (
                    <li key={lvl.level}>
                      <button
                        onClick={() => setActiveLevel(i)}
                        className={`dbx-level-btn group flex w-full cursor-pointer items-center justify-between border-b border-[var(--line)] bg-transparent py-4 text-left font-serif text-[22px] font-bold tracking-[-0.015em] transition-transform duration-200 ease-out hover:translate-x-1 ${
                          isActive ? lvl.accent : 'text-[var(--brown)]'
                        }`}
                      >
                        <span className="inline-flex items-center gap-4">
                          <span
                            className={`font-sans text-xs font-extrabold tracking-[0.2em] ${
                              isActive ? lvl.accent : 'text-[var(--ink-faint)]'
                            }`}
                          >
                            0{i + 1}
                          </span>
                          <span>{lvl.level}</span>
                        </span>
                        <ArrowRight
                          size={18}
                          strokeWidth={2.5}
                          className={`transition-all duration-200 ease-out ${
                            isActive
                              ? 'translate-x-1 opacity-100'
                              : 'translate-x-0 opacity-40'
                          }`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="md:col-span-7">
              <div
                key={activeLevel}
                className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--cream-soft)] p-8 [animation:fadeSlide_320ms_ease_both] md:p-10"
              >
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1.5 font-sans text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                      Level {activeLevel + 1} · {active.short}
                    </div>
                    <h3 className="m-0 font-serif text-[26px] font-bold tracking-[-0.02em] text-[var(--brown)] md:text-[30px]">
                      {active.level}
                    </h3>
                    <p className="m-0 mt-2 max-w-[46ch] font-sans text-[15px] font-semibold leading-snug text-[var(--brown-soft)]">
                      {active.description}
                    </p>
                  </div>
                  <span
                    className={`font-serif text-[36px] font-semibold italic leading-none md:text-[44px] ${active.accent}`}
                  >
                    0{activeLevel + 1}
                  </span>
                </div>

                <ul className="grid gap-3">
                  {active.items.map((item, i) => (
                    <li
                      key={item}
                      className="dbx-fade-item flex items-start gap-3 border-t border-[var(--line)] py-2 font-sans text-base font-semibold text-[var(--brown)]"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <span className={`font-extrabold ${active.accent}`}>
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
                  <span className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                    Informational only — not a substitute for medical advice.
                  </span>
                  <Link
                    to="/learn/risk-assessment"
                    className={`dbx-text-link inline-flex items-center gap-2 font-sans text-sm font-bold no-underline transition-transform duration-200 ease-out hover:translate-x-1 ${active.accent}`}
                  >
                    Take the risk assessment
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CTA band — dark green risk assessment box */}
          <div className="dbx-cta-band group relative overflow-hidden rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--cream)_12%,transparent)] bg-[var(--sage-deep)] p-10 shadow-[0_28px_60px_-36px_rgba(42,33,23,0.55)] md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_20%,rgba(185,143,58,0.22),transparent_42%),radial-gradient(ellipse_at_92%_88%,rgba(220,231,204,0.14),transparent_48%),linear-gradient(135deg,#24361e_0%,var(--sage-deep)_48%,#3a552f_100%)]"
            />
            <div
              aria-hidden
              className="dbx-cta-grain pointer-events-none absolute inset-0 opacity-[0.07]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-[color-mix(in_srgb,var(--cream)_18%,transparent)] transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 -right-10 h-80 w-80 rounded-full border border-[color-mix(in_srgb,var(--butter)_28%,transparent)] transition-transform duration-700 ease-out group-hover:scale-110"
            />

            <div className="relative z-[1] grid items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-8">
                <div className="mb-5 inline-flex items-center gap-2.5 font-sans text-xs font-extrabold uppercase tracking-[0.22em] text-[color-mix(in_srgb,var(--cream)_88%,transparent)]">
                  <span className="h-[1.5px] w-7 bg-[var(--butter)]" />
                  Next step
                </div>
                <h2 className="m-0 font-serif text-[clamp(34px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.03em] text-[var(--cream)]">
                  Not sure if you&apos;re
                  <br />
                  <em className="font-semibold italic text-[#D4A84A]">
                    experiencing warning signs?
                  </em>
                </h2>
                <p className="mt-5 max-w-[48ch] font-sans text-base font-semibold leading-relaxed text-[color-mix(in_srgb,var(--cream)_86%,transparent)]">
                  Take our quick self-assessment — it only takes a couple of
                  minutes.
                </p>
                <p className="mt-4 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--cream)_55%,transparent)]">
                  Free · 2–3 minutes · No account needed
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:items-end md:justify-end">
                <Link
                  to="/learn/risk-assessment"
                  className="dbx-cta-solid inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--cream)] px-7 py-3.5 font-sans text-sm font-bold tracking-[0.04em] text-[var(--sage-deep)] no-underline shadow-[0_12px_28px_-16px_rgba(42,33,23,0.55)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-[var(--butter)] hover:text-[var(--brown)] hover:shadow-[0_18px_36px_-14px_rgba(42,33,23,0.45)] sm:w-auto"
                >
                  Take Assessment
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
                    strokeWidth={2.5}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          /* Darker, deeper palette scoped to this page only */
          .dbx-symptoms {
            --sage: #5C7A4E;
            --sage-deep: #2F4527;
            --sage-tint: #DCE7CC;
            --sage-soft: #CBDCB3;
            --olive: #4C5A26;
            --butter: #B98F3A;
            --rust: #8C4324;
            --pink: #A85C6B;
            --brown: #2A2117;
            --brown-soft: #46392A;
            --cream: #F3EEE2;
            --cream-soft: #E9E2D2;
            --ink: #2A2117;
            --ink-soft: #52493A;
            --ink-faint: #8A806E;
            --line: rgba(42, 33, 23, 0.18);
          }

          @keyframes fadeSlide {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          @keyframes iconPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.12); }
          }

          .dbx-fade-item {
            animation: fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .dbx-symptom-row {
            transition: transform 260ms ease, background 260ms ease;
          }
          .dbx-symptom-row:hover {
            transform: translateX(8px);
            background: var(--sage-tint);
          }

          .dbx-cta-grain {
            background-image:
              radial-gradient(rgba(243, 238, 226, 0.55) 0.6px, transparent 0.6px);
            background-size: 3px 3px;
          }
        `}</style>
      </section>
    </>
  );
};

export default Symptoms;