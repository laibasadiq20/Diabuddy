import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '../../../i18n/I18nContext';

const FeaturesSection = () => {
  const { t: tr } = useI18n();
  return (
    <section id="features" className="bg-[var(--cream-soft)] px-6 py-24">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
          {tr('landing.features.kicker')}
        </p>

        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-2xl font-serif text-4xl leading-[1.05] tracking-tight text-[var(--brown)] md:text-6xl">
            {tr('landing.features.headingLine1')}
            <br />
            {tr('landing.features.headingStart')} <span className="italic text-[var(--sage-deep)]">{tr('landing.features.headingEmphasis')}</span>
          </h2>

          <p className="max-w-xs text-sm leading-relaxed text-[var(--brown-soft)]">
            {tr('landing.features.subtitle')}
          </p>
        </div>

        {/* ✅ REAL BENTO GRID */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">

          {/* CARD 1 — HERO */}
          <article className="md:col-span-7 group rounded-[1.5rem] border border-[var(--line)] bg-[var(--cream)] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.25)]">

            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
              {tr('landing.features.card1.kicker')}
            </p>

            <h3 className="font-serif text-3xl leading-tight text-[var(--brown)]">
              {tr('landing.features.card1.titleStart')}{' '}
              <span className="italic text-[var(--sage-deep)]">{tr('landing.features.card1.titleEmphasis')}</span>
            </h3>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--brown-soft)]">
              {tr('landing.features.card1.body')}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { k: tr('landing.features.card1.statGlucose'), v: '112', u: 'mg/dL' },
                { k: tr('landing.features.card1.statCarbs'), v: '42g', u: tr('landing.features.card1.unitLunch') },
                { k: tr('landing.features.card1.statSteps'), v: '6,240', u: tr('landing.features.card1.unitToday') },
                { k: tr('landing.features.card1.statSleep'), v: '7h 12m', u: tr('landing.features.card1.unitRested') },
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
                {tr('landing.features.card2.kicker')}
              </p>

              <div className="mt-6 h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: tr('landing.features.card2.days.mon'), value: 90 },
                      { name: tr('landing.features.card2.days.tue'), value: 120 },
                      { name: tr('landing.features.card2.days.wed'), value: 80 },
                      { name: tr('landing.features.card2.days.thu'), value: 140 },
                      { name: tr('landing.features.card2.days.fri'), value: 110 },
                      { name: tr('landing.features.card2.days.sat'), value: 160 },
                      { name: tr('landing.features.card2.days.sun'), value: 130 },
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
                {tr('landing.features.card2.titleStart')}{' '}
                <span className="italic text-[var(--sage-deep)]">{tr('landing.features.card2.titleEmphasis')}</span>
              </h3>

              <p className="mt-4 text-sm text-[var(--brown-soft)]">
                {tr('landing.features.card2.body')}
              </p>
            </div>
          </article>

          {/* CARD 3 — COMMUNITY */}
          <article className="md:col-span-8 group flex flex-col justify-between rounded-[1.5rem] border border-[var(--line)] bg-[var(--cream)] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.25)]">

            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
                {tr('landing.features.card3.kicker')}
              </p>
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--cream-soft)] p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sage-deep)]">
                  {tr('landing.features.card3.topicBadge')}
                </span>

                <span className="whitespace-nowrap text-[10px] font-semibold text-[var(--sage-deep)]">
                  {tr('landing.features.card3.bestAnswer')}
                </span>
              </div>

              <p className="mt-3 text-xs font-semibold text-[var(--brown)]">
                {tr('landing.features.card3.quote')}
              </p>

              <p className="mt-2 text-[11px] leading-relaxed text-[var(--brown-soft)]">
                {tr('landing.features.card3.reply')}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--brown-soft)]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--sage)]/60 text-[9px] font-semibold text-[var(--brown)]">
                    A
                  </span>
                  {tr('landing.features.card3.authorName')}
                </span>

                <span className="text-[10px] text-[var(--brown-soft)]">
                  {tr('landing.features.card3.repliesCount')}
                </span>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-serif text-3xl text-[var(--brown)]">
                {tr('landing.features.card3.titleStart')} <span className="italic text-[var(--sage-deep)]">{tr('landing.features.card3.titleEmphasis')}</span>
              </h3>

              <p className="mt-4 text-sm text-[var(--brown-soft)]">
                {tr('landing.features.card3.body')}
              </p>
            </div>
          </article>

          {/* CARD 4 — TOOLBOX */}
          <article className="md:col-span-4 group flex flex-col justify-between rounded-[1.5rem] border border-[var(--line)] bg-[var(--butter)]/35 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.25)]">

            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brown-soft)]">
                {tr('landing.features.card4.kicker')}
              </p>

            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--cream-soft)] px-4 py-3 text-sm text-[var(--brown)]">
                {tr('toolbox.tools.carb.title')}
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--cream-soft)] px-4 py-3 text-sm text-[var(--brown)]">
                {tr('toolbox.tools.glucose.title')}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-serif text-3xl text-[var(--brown)]">
                {tr('landing.features.card4.titleStart')} <span className="italic text-[var(--sage-deep)]">{tr('landing.features.card4.titleEmphasis')}</span>
              </h3>

              <p className="mt-4 text-sm text-[var(--brown-soft)]">
                {tr('landing.features.card4.body')}
              </p>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;