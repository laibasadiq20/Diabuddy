import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-[var(--cream-soft)] px-6 py-24">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
          — 02 / What's inside
        </p>

        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-2xl font-serif text-4xl leading-[1.05] tracking-tight text-[var(--brown)] md:text-6xl">
            Four small things,
            <br />
            done <span className="italic text-[var(--sage-deep)]">beautifully.</span>
          </h2>

          <p className="max-w-xs text-sm leading-relaxed text-[var(--brown-soft)]">
            We resisted the urge to do everything. Instead — four essentials, made with care.
          </p>
        </div>

        {/* ✅ REAL BENTO GRID */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">

          {/* CARD 1 — HERO */}
          <article className="md:col-span-7 group rounded-[1.5rem] border border-[var(--line)] bg-[var(--cream)] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.25)]">

            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
              01 · Daily
            </p>

            <h3 className="font-serif text-3xl leading-tight text-[var(--brown)]">
              Logging that feels like{' '}
              <span className="italic text-[var(--sage-deep)]">journaling.</span>
            </h3>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--brown-soft)]">
              Glucose, insulin, meals, movement — captured in seconds, arranged like a softly-bound notebook.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { k: 'Glucose', v: '112', u: 'mg/dL' },
                { k: 'Carbs', v: '42g', u: 'lunch' },
                { k: 'Steps', v: '6,240', u: 'today' },
                { k: 'Sleep', v: '7h 12m', u: 'rested' },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl border border-[var(--line)] bg-[var(--cream-soft)] p-4"
                >
                  <p className="text-[10px] uppercase tracking-widest text-[var(--brown-soft)]">
                    ◇ {s.k}
                  </p>

                  <p className="mt-1 font-serif text-2xl text-[var(--brown)]">
                    {s.v}
                  </p>

                  <p className="text-[10px] text-[var(--brown-soft)]">
                    {s.u}
                  </p>
                </div>
              ))}
            </div>
          </article>

          {/* CARD 2 — GRAPH */}
          <article className="md:col-span-5 group flex flex-col justify-between rounded-[1.5rem] border border-[var(--line)] bg-[var(--sage)]/35 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.25)]">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
                02 · Insight
              </p>

              <div className="mt-6 h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: 'Mon', value: 90 },
                      { name: 'Tue', value: 120 },
                      { name: 'Wed', value: 80 },
                      { name: 'Thu', value: 140 },
                      { name: 'Fri', value: 110 },
                      { name: 'Sat', value: 160 },
                      { name: 'Sun', value: 130 },
                    ]}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--sage-deep)" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="var(--sage)" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis dataKey="name" stroke="var(--brown-soft)" />
                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--sage-deep)"
                      fill="url(#colorValue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-serif text-3xl leading-tight text-[var(--brown)]">
                Reports that read like{' '}
                <span className="italic text-[var(--sage-deep)]">letters.</span>
              </h3>

              <p className="mt-4 text-sm text-[var(--brown-soft)]">
                Weekly notes about your patterns — in plain, warm language.
              </p>
            </div>
          </article>

          {/* CARD 3 — COMMUNITY */}
          <article className="md:col-span-8 group flex flex-col justify-between rounded-[1.5rem] border border-[var(--line)] bg-[var(--cream)] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.25)]">

            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
                03 · People
              </p>
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--cream-soft)] p-5">
              <p className="text-xs font-semibold text-[var(--brown)]">
                “I stopped feeling alone in my numbers.”
              </p>

              <p className="mt-2 text-[11px] text-[var(--brown-soft)]">
                The app helped me understand patterns instead of stressing over single readings.
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-[var(--brown-soft)]">
                  — Community member
                </span>

                <span className="text-[10px] text-[var(--sage-deep)]">
                  ★★★★★
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {["calm", "no judgement", "real support", "diabetes friendly", "low stress"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--line)] bg-[var(--cream-soft)] px-3 py-1 text-[10px] text-[var(--brown-soft)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="font-serif text-3xl text-[var(--brown)]">
                A community that <span className="italic text-[var(--sage-deep)]">gets it.</span>
              </h3>

              <p className="mt-4 text-sm text-[var(--brown-soft)]">
                Quiet forums. Real conversations. Shared experiences.
              </p>
            </div>
          </article>

          {/* CARD 4 — REMINDERS */}
          <article className="md:col-span-4 group flex flex-col justify-between rounded-[1.5rem] border border-[var(--line)] bg-[var(--butter)]/35 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.25)]">

            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
                04 · Gentle
              </p>

            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--cream-soft)] px-4 py-3 text-sm text-[var(--brown)]">
                Time for your glucose check
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--cream-soft)] px-4 py-3 text-sm text-[var(--brown)]">
                You're two glasses away from your goal
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-serif text-3xl text-[var(--brown)]">
                Reminders that don't <span className="italic text-[var(--sage-deep)]">shout.</span>
              </h3>

              <p className="mt-4 text-sm text-[var(--brown-soft)]">
                Soft nudges at the right time — never guilt, never pressure.
              </p>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;