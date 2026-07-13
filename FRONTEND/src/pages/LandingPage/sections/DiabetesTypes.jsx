import React from 'react';
import { Droplet, Activity, HeartPulse, AlertCircle, ArrowUpRight } from 'lucide-react';

const getArcValue = (stat) => {
  if (stat === '1 in 3') return 33;
  if (stat === '5–10%') return 8;
  if (stat === '90–95%') return 92;
  if (stat === '2–10%') return 6;
  return 50;
};

const ITEMS = [
  {
    chip: 'Autoimmune',
    name: 'Type 1',
    tag: 'The body stops making insulin.',
    desc: 'An immune response halts insulin production. Lifelong insulin support is essential.',
    stat: '5–10%',
    Icon: Droplet,
    color: '#2F6A4F',
    link: 'https://en.wikipedia.org/wiki/Type_1_diabetes',
  },
  {
    chip: 'Most common',
    name: 'Type 2',
    tag: 'Insulin works — just not well enough.',
    desc: 'The body resists insulin. Often managed through lifestyle, food, and medication.',
    stat: '90–95%',
    Icon: Activity,
    color: '#7D8F5D',
    link: 'https://en.wikipedia.org/wiki/Type_2_diabetes',
  },
  {
    chip: 'Pregnancy',
    name: 'Gestational',
    tag: 'Glucose shifts during pregnancy.',
    desc: 'Appears during pregnancy and usually resolves after birth, but worth watching.',
    stat: '2–10%',
    Icon: HeartPulse,
    color: '#2F6A4F',
    link: 'https://en.wikipedia.org/wiki/Gestational_diabetes',
  },
  {
    chip: 'Early signal',
    name: 'Prediabetes',
    tag: 'Higher than normal — not yet diabetes.',
    desc: 'A reversible window. Small daily shifts can quietly turn the trend around.',
    stat: '1 in 3',
    Icon: AlertCircle,
    color: '#556B2F',
    link: 'https://en.wikipedia.org/wiki/Prediabetes',
  },
];

const DiabetesTypes = ({ showHeader = true }) => {
  return (
    <section id="types" className={`font-body px-6 ${showHeader ? 'py-20 sm:py-28' : 'pt-8'}`} style={{ background: 'var(--cream-soft)' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.6s ease forwards;
        }
      `}</style>
      <div className="mx-auto max-w-[1200px]">
        {showHeader && (
          <header className="mb-14 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.24em] text-[var(--brown-soft)] before:h-px before:w-7 before:bg-current before:opacity-55">
                Know the types
              </span>
              <h2 className="mt-4 font-display text-[2.2rem] sm:text-[3.2rem] font-light leading-[1.05] text-[var(--brown)]">
                Four types of diabetes, <em className="italic font-light text-[var(--sage-deep)]">gently explained.</em>
              </h2>
            </div>
            <p className="max-w-[32ch] text-[1rem] leading-[1.65] text-[var(--brown-soft)] md:justify-self-end">
              Each type begins differently and asks for different care. Here's a calm,
              side-by-side look — no jargon, no alarm.
            </p>
          </header>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ITEMS.map((it, i) => {
            const arcValue = getArcValue(it.stat);
            return (
              <article
                key={it.name}
                className="group flex flex-col rounded-3xl border border-line bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-lifted opacity-0 animate-fade-up"
                style={{ animationDelay: `${i * 110}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-[0.85rem] text-ink-soft">0{i + 1}</span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.18em]"
                    style={{ background: `${it.color}1f`, color: it.color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: it.color }} />
                    {it.chip}
                  </span>
                </div>

                <div
                  className="mt-7 flex h-[52px] w-[52px] items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                  style={{ background: `${it.color}1f`, color: it.color }}
                >
                  <it.Icon size={22} strokeWidth={1.5} />
                </div>

                <h3 className="mt-5 font-display text-[1.7rem] font-medium text-ink">{it.name}</h3>
                <p className="mb-2.5 text-[0.85rem] font-medium text-sage-deep">{it.tag}</p>
                <p className="text-[0.88rem] leading-[1.6] text-ink-soft">{it.desc}</p>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-line pt-4">
                  <div className="flex items-center gap-2.5 text-[0.74rem] text-ink-soft">
                    <svg className="h-[34px] w-[34px] -rotate-90" viewBox="0 0 32 32" aria-hidden>
                      <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(47,74,58,0.10)" strokeWidth="2.5" />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke={it.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="88"
                        strokeDashoffset={88 - (88 * arcValue) / 100}
                        className="transition-[stroke-dashoffset] duration-1000"
                      />
                    </svg>
                    <span>
                      <b className="block font-display text-[0.95rem] font-medium text-ink">{it.stat}</b>
                      <span className="text-[0.65rem] uppercase tracking-[0.14em]">Prevalence</span>
                    </span>
                  </div>

                  <a
                    href={it.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold"
                    style={{ color: it.color }}
                  >
                    Learn
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DiabetesTypes;