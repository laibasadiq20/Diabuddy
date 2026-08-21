import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Leaf, Lock, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

const FeaturesSection = () => {
  const { t: tr } = useI18n();

  const chartData = [
    { name: tr('landing.features.card2.days.mon') || 'Mon', value: 100 },
    { name: tr('landing.features.card2.days.tue') || 'Tue', value: 125 },
    { name: tr('landing.features.card2.days.wed') || 'Wed', value: 95 },
    { name: tr('landing.features.card2.days.thu') || 'Thu', value: 140 },
    { name: tr('landing.features.card2.days.fri') || 'Fri', value: 110 },
    { name: tr('landing.features.card2.days.sat') || 'Sat', value: 165 },
    { name: tr('landing.features.card2.days.sun') || 'Sun', value: 130 },
  ];

  return (
    <section
      id="features"
      className="relative w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 scroll-mt-24"
    >
      <div className="mx-auto max-w-5xl">

        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFE5] border border-[#A8C4A5] mb-2 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E6B3E]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E6B3E]">
              {tr('landing.features.kicker') || 'WHY CHOOSE DIABUDDY'}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:gap-4 md:flex-row md:items-end">
            <h2 className="max-w-xl font-serif text-2xl sm:text-3xl lg:text-[2.1rem] leading-[1.15] tracking-tight text-[var(--brown)]">
              {tr('landing.features.headingLine1') || 'Designed for real life,'}
              <br />
              {tr('landing.features.headingStart') || 'not clinical'}{' '}
              <span className="italic font-semibold text-[var(--sage-deep)]">
                {tr('landing.features.headingEmphasis') || 'perfection.'}
              </span>
            </h2>

            <p className="max-w-xs text-xs sm:text-[13px] leading-relaxed text-[var(--brown-soft)] font-medium">
              {tr('landing.features.subtitle') || 'Logging, reports, a practical toolbox, and a peer community that gets it — each one made with care.'}
            </p>
          </div>
        </div>

        {/* =========================================================
            PIXEL-ACCURATE BENTO GRID (WITH SIGNATURE THEME COLORS)
        ========================================================= */}
        <div className="grid grid-cols-1 gap-4 sm:gap-4.5 md:grid-cols-12">

          {/* -------------------------------------------------------
              CARD 1: DAILY LOGGING (7 cols) — WARM CREAM
          ------------------------------------------------------- */}
          <article className="md:col-span-7 group flex flex-col justify-between rounded-2xl sm:rounded-[26px] border-2 border-[#C9BDA8] bg-[#F5EFE6] p-5 sm:p-6 shadow-[0_4px_20px_rgba(58,46,36,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2E6B3E]/60 hover:shadow-[0_14px_35px_-15px_rgba(30,42,36,0.12)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--brown-soft)]">
                {tr('landing.features.card1.kicker') || '01 · DAILY'}
              </p>

              <h3 className="mt-2.5 font-serif text-xl sm:text-2xl leading-snug font-bold text-[var(--brown)]">
                {tr('landing.features.card1.titleStart') || 'Logging that feels like'}{' '}
                <span className="italic font-semibold text-[var(--sage-deep)]">
                  {tr('landing.features.card1.titleEmphasis') || 'journaling.'}
                </span>
              </h3>

              <p className="mt-1 text-xs text-[var(--brown-soft)] leading-relaxed font-medium">
                {tr('landing.features.card1.body') || 'Glucose, insulin, meals, movement — captured in seconds, arranged like a softly-bound notebook.'}
              </p>
            </div>

            {/* 4 Stat Tiles */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { k: tr('landing.features.card1.statGlucose') || 'Glucose', v: '112', u: 'mg/dL' },
                { k: tr('landing.features.card1.statCarbs') || 'Carbs', v: '42g', u: tr('landing.features.card1.unitLunch') || 'lunch' },
                { k: tr('landing.features.card1.statSteps') || 'Steps', v: '6,240', u: tr('landing.features.card1.unitToday') || 'today' },
                { k: tr('landing.features.card1.statSleep') || 'Sleep', v: '7h 12m', u: tr('landing.features.card1.unitRested') || 'rested' },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl border border-[#C8BDAB] bg-white p-3 shadow-2xs transition-colors hover:border-[#2E6B3E]/60"
                >
                  <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--brown-soft)]">
                    ◇ {s.k}
                  </p>
                  <p className="mt-0.5 font-serif text-xl sm:text-2xl font-bold text-[var(--brown)]">
                    {s.v}
                  </p>
                  <p className="text-[10px] font-medium text-[var(--brown-soft)]">
                    {s.u}
                  </p>
                </div>
              ))}
            </div>
          </article>

          {/* -------------------------------------------------------
              CARD 2: INSIGHT (5 cols) — SAGE GREEN
          ------------------------------------------------------- */}
          <article className="md:col-span-5 group flex flex-col justify-between rounded-2xl sm:rounded-[26px] border-2 border-[#ADC0AB] bg-[#CDDACB] p-5 sm:p-6 shadow-[0_4px_20px_rgba(58,46,36,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2E6B3E]/80 hover:shadow-[0_14px_35px_-15px_rgba(30,42,36,0.12)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2E6B3E]">
                {tr('landing.features.card2.kicker') || '02 · INSIGHT'}
              </p>

              {/* Integrated Area Chart */}
              <div className="mt-2 h-28 sm:h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sageInsightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#245A33" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#537B5C" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="#4A614E"
                      tick={{ fontSize: 9, fill: '#3E5442', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#ADC0AB',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '3px 8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#245A33"
                      fill="url(#sageInsightGrad)"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#245A33' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-serif text-xl sm:text-2xl leading-snug font-bold text-[var(--brown)]">
                {tr('landing.features.card2.titleStart') || 'Clear trends, with a'}{' '}
                <span className="italic font-semibold text-[var(--sage-deep)]">
                  {tr('landing.features.card2.titleEmphasis') || 'warm note.'}
                </span>
              </h3>

              <p className="mt-1 text-xs text-[#3E5442] leading-relaxed font-medium">
                {tr('landing.features.card2.body') || 'Charts on your patterns, plus a short daily note in plain language — export it anytime.'}
              </p>
            </div>
          </article>

          {/* -------------------------------------------------------
              CARD 3: PEOPLE & COMMUNITY (8 cols) — DUSKY PINK
          ------------------------------------------------------- */}
          <article className="md:col-span-8 group flex flex-col justify-between rounded-2xl sm:rounded-[26px] border-2 border-[#DBC1BC] bg-[#F2DFDC] p-5 sm:p-6 shadow-[0_4px_20px_rgba(58,46,36,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B86B61]/80 hover:shadow-[0_14px_35px_-15px_rgba(30,42,36,0.12)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8C534B]">
                {tr('landing.features.card3.kicker') || '03 · PEOPLE & COMMUNITY'}
              </p>

              {/* 3 Value Strips */}
              <div className="mt-3.5 space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-[#DEC4BF] bg-white px-3.5 py-2.5 shadow-2xs transition-colors hover:border-[#B86B61]/60">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7E7E5] text-[#9E453A]">
                    <ShieldCheck size={15} strokeWidth={2.2} />
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold text-[var(--brown)]">
                    {tr('landing.features.card3.value1') || 'Peer support, never medical advice'}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#DEC4BF] bg-white px-3.5 py-2.5 shadow-2xs transition-colors hover:border-[#B86B61]/60">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7E7E5] text-[#9E453A]">
                    <Leaf size={15} strokeWidth={2.2} />
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold text-[var(--brown)]">
                    {tr('landing.features.card3.value2') || '8 moderated health topics'}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#DEC4BF] bg-white px-3.5 py-2.5 shadow-2xs transition-colors hover:border-[#B86B61]/60">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7E7E5] text-[#9E453A]">
                    <Lock size={15} strokeWidth={2.2} />
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold text-[var(--brown)]">
                    {tr('landing.features.card3.value3') || 'Anonymous or named posting — your choice'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-serif text-xl sm:text-2xl leading-snug font-bold text-[var(--brown)]">
                {tr('landing.features.card3.titleStart') || 'A community that'}{' '}
                <span className="italic font-semibold text-[#8C3D32]">
                  {tr('landing.features.card3.titleEmphasis') || 'gets it.'}
                </span>
              </h3>

              <p className="mt-1 text-xs text-[#6B4B46] leading-relaxed font-medium">
                {tr('landing.features.card3.body') || 'Eight dedicated topic spaces for peer sharing, thoughtful Q&A, and marked helpful answers — built around privacy and trust.'}
              </p>
            </div>
          </article>

          {/* -------------------------------------------------------
              CARD 4: TOOLS (4 cols) — BUTTER YELLOW
          ------------------------------------------------------- */}
          <article className="md:col-span-4 group flex flex-col justify-between rounded-2xl sm:rounded-[26px] border-2 border-[#DBCFA9] bg-[#F7EED5] p-5 sm:p-6 shadow-[0_4px_20px_rgba(58,46,36,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2E6B3E]/60 hover:shadow-[0_14px_35px_-15px_rgba(30,42,36,0.12)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--brown-soft)]">
                {tr('landing.features.card4.kicker') || '04 · TOOLS'}
              </p>

              {/* 2 Utility Pill Buttons */}
              <div className="mt-3.5 space-y-2">
                <div className="rounded-xl border border-[#D5C69C] bg-white px-3.5 py-2.5 text-xs font-bold text-[var(--brown)] shadow-2xs flex items-center justify-between">
                  <span>{tr('toolbox.tools.carb.title') || 'Nutrition Calculator'}</span>
                  <span className="text-[10px] text-[#2E6B3E] font-semibold">Carbs</span>
                </div>

                <div className="rounded-xl border border-[#D5C69C] bg-white px-3.5 py-2.5 text-xs font-bold text-[var(--brown)] shadow-2xs flex items-center justify-between">
                  <span>{tr('toolbox.tools.glucose.title') || 'Blood sugar context'}</span>
                  <span className="text-[10px] text-[#2E6B3E] font-semibold">mg/dL</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-serif text-xl sm:text-2xl leading-snug font-bold text-[var(--brown)]">
                {tr('landing.features.card4.titleStart') || 'A toolbox that stays'}{' '}
                <span className="italic font-semibold text-[var(--sage-deep)]">
                  {tr('landing.features.card4.titleEmphasis') || 'practical.'}
                </span>
              </h3>

              <p className="mt-1 text-xs text-[var(--brown-soft)] leading-relaxed font-medium">
                {tr('landing.features.card4.body') || 'Quick calculators for carbs, corrections, and glucose context — when you need a number, not a lecture.'}
              </p>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;