import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Leaf, Lock, Activity, Sparkles, Utensils, Heart, CheckCircle2, FileText } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

const FeaturesSection = () => {
  const { t: tr } = useI18n();

  const chartData = [
    { name: tr('landing.features.card2.days.mon') || 'Mon', value: 98 },
    { name: tr('landing.features.card2.days.tue') || 'Tue', value: 115 },
    { name: tr('landing.features.card2.days.wed') || 'Wed', value: 102 },
    { name: tr('landing.features.card2.days.thu') || 'Thu', value: 128 },
    { name: tr('landing.features.card2.days.fri') || 'Fri', value: 110 },
    { name: tr('landing.features.card2.days.sat') || 'Sat', value: 122 },
    { name: tr('landing.features.card2.days.sun') || 'Sun', value: 106 },
  ];

  return (
    <section id="features" className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">

        {/* Section Eyebrow & Editorial Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--sage-deep)]">
              {tr('landing.features.kicker') || '— 02 / WHY CHOOSE DIABUDDY'}
            </p>
            <h2 className="max-w-2xl font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.12] tracking-tight text-[var(--brown)]">
              {tr('landing.features.headingLine1') || 'Designed for real life,'}{' '}
              <br />
              {tr('landing.features.headingStart') || 'done'}{' '}
              <span className="italic text-[var(--sage-deep)] font-medium">
                {tr('landing.features.headingEmphasis') || 'beautifully.'}
              </span>
            </h2>
          </div>

          <p className="max-w-md text-xs sm:text-sm leading-relaxed text-[var(--brown-soft)] font-medium">
            {tr('landing.features.subtitle') || 'Most health apps feel like cold clinical spreadsheets. DiaBuddy is crafted to feel like a warm, reassuring daily companion.'}
          </p>
        </div>

        {/* High-Impact Editorial Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">

          {/* CARD 1 — EFFORTLESS LOGGING (7 cols) */}
          <article className="md:col-span-7 group flex flex-col justify-between rounded-[2rem] border border-[var(--line)] bg-[var(--cream)] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.18)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-[var(--brown-soft)]">
                  {tr('landing.features.card1.kicker') || '01 · CALM TRACKING'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E3ECE1] px-2.5 py-0.5 text-[10px] font-bold text-[var(--sage-deep)]">
                  <Sparkles size={11} />
                  5-Second Log
                </span>
              </div>

              <h3 className="mt-4 font-serif text-2xl sm:text-3xl leading-snug text-[var(--brown)]">
                {tr('landing.features.card1.titleStart') || 'Logging that feels like'}{' '}
                <span className="italic text-[var(--sage-deep)]">
                  {tr('landing.features.card1.titleEmphasis') || 'journaling.'}
                </span>
              </h3>

              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[var(--brown-soft)] max-w-lg">
                {tr('landing.features.card1.body') || 'Capture blood glucose, Pakistani meals, insulin dosages, and hydration in seconds. Zero clutter, zero burnout.'}
              </p>
            </div>

            {/* Live Micro-UI Stat Chips */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--brown-soft)]">
                    Glucose
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                </div>
                <p className="mt-1 font-serif text-2xl font-bold text-[var(--brown)]">
                  108 <span className="text-xs font-normal font-sans text-[var(--brown-soft)]">mg/dL</span>
                </p>
                <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                  ✓ In Target Range
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--brown-soft)]">
                    Lunch
                  </span>
                  <Utensils size={13} className="text-[var(--brown-soft)]" />
                </div>
                <p className="mt-1 font-serif text-2xl font-bold text-[var(--brown)]">
                  38g <span className="text-xs font-normal font-sans text-[var(--brown-soft)]">carbs</span>
                </p>
                <p className="text-[10px] font-semibold text-[var(--brown-soft)] mt-0.5 truncate">
                  1 Roti + Daal
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--brown-soft)]">
                    Steps
                  </span>
                  <Activity size={13} className="text-[var(--sage-deep)]" />
                </div>
                <p className="mt-1 font-serif text-2xl font-bold text-[var(--brown)]">
                  6,240
                </p>
                <p className="text-[10px] font-semibold text-[var(--sage-deep)] mt-0.5">
                  78% of daily goal
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--brown-soft)]">
                    Sleep
                  </span>
                  <Heart size={13} className="text-amber-600" />
                </div>
                <p className="mt-1 font-serif text-2xl font-bold text-[var(--brown)]">
                  7h 15m
                </p>
                <p className="text-[10px] font-semibold text-amber-700 mt-0.5">
                  Restful & regular
                </p>
              </div>
            </div>
          </article>

          {/* CARD 2 — CLEAR TRENDS & INSIGHTS (5 cols) */}
          <article className="md:col-span-5 group flex flex-col justify-between rounded-[2rem] border border-[var(--line)] bg-[var(--sage)]/25 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.18)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-[var(--brown-soft)]">
                  {tr('landing.features.card2.kicker') || '02 · CLARITY & INSIGHT'}
                </span>
                <span className="rounded-full bg-white/90 border border-[var(--line)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--sage-deep)]">
                  88% in range
                </span>
              </div>

              {/* Weekly Mini Sparkline Chart */}
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white/85 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[var(--brown-soft)] uppercase tracking-wider">
                    Weekly Glucose Curve
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">
                    Stable
                  </span>
                </div>
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="sageGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--sage-deep)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--sage)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="var(--brown-soft)" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2DCD0',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--sage-deep)"
                        fill="url(#sageGradient)"
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-serif text-2xl sm:text-[1.65rem] leading-tight text-[var(--brown)]">
                {tr('landing.features.card2.titleStart') || 'Clear trends, with a'}{' '}
                <span className="italic text-[var(--sage-deep)]">
                  {tr('landing.features.card2.titleEmphasis') || 'warm note.'}
                </span>
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[var(--brown-soft)] leading-relaxed">
                {tr('landing.features.card2.body') || 'Visual pattern recognition with plain-language care summaries — exportable anytime for your doctor.'}
              </p>
            </div>
          </article>

          {/* CARD 3 — WARM PEER COMMUNITY (6 cols) */}
          <article className="md:col-span-6 group flex flex-col justify-between rounded-[2rem] border border-[var(--line)] bg-[var(--cream)] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.18)]">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-[var(--brown-soft)]">
                {tr('landing.features.card3.kicker') || '03 · PEOPLE & COMMUNITY'}
              </span>

              <h3 className="mt-4 font-serif text-2xl sm:text-3xl leading-snug text-[var(--brown)]">
                {tr('landing.features.card3.titleStart') || 'A community that'}{' '}
                <span className="italic text-[var(--sage-deep)]">
                  {tr('landing.features.card3.titleEmphasis') || 'gets it.'}
                </span>
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[var(--brown-soft)] leading-relaxed">
                {tr('landing.features.card3.body') || 'Eight dedicated topic spaces for peer sharing, thoughtful Q&A, and marked helpful answers — built around privacy and trust.'}
              </p>
            </div>

            {/* Community Safety Principles */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/80 p-3 transition-colors hover:bg-white shadow-2xs">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#DFE7DC] text-[#2E6B3E]">
                  <ShieldCheck size={16} strokeWidth={2.2} />
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-[var(--brown)]">
                  {tr('landing.features.card3.value1') || 'Peer support, never medical advice'}
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/80 p-3 transition-colors hover:bg-white shadow-2xs">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#DFE7DC] text-[#2E6B3E]">
                  <Leaf size={16} strokeWidth={2.2} />
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-[var(--brown)]">
                  {tr('landing.features.card3.value2') || '8 moderated health topics & pantry discussions'}
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/80 p-3 transition-colors hover:bg-white shadow-2xs">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#DFE7DC] text-[#2E6B3E]">
                  <Lock size={16} strokeWidth={2.2} />
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-[var(--brown)]">
                  {tr('landing.features.card3.value3') || 'Anonymous or named posting — your choice'}
                </span>
              </div>
            </div>
          </article>

          {/* CARD 4 — PRACTICAL TOOLS & PRIVACY (6 cols) */}
          <article className="md:col-span-6 group flex flex-col justify-between rounded-[2rem] border border-[var(--line)] bg-[var(--butter)]/30 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(58,46,36,0.18)]">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-[var(--brown-soft)]">
                {tr('landing.features.card4.kicker') || '04 · PRACTICAL TOOLS & TRUST'}
              </span>

              <h3 className="mt-4 font-serif text-2xl sm:text-3xl leading-snug text-[var(--brown)]">
                {tr('landing.features.card4.titleStart') || 'A toolbox that stays'}{' '}
                <span className="italic text-[var(--sage-deep)]">
                  {tr('landing.features.card4.titleEmphasis') || 'practical.'}
                </span>
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[var(--brown-soft)] leading-relaxed">
                {tr('landing.features.card4.body') || 'Quick calculators for carbs, corrections, and glucose context — when you need a number, not a lecture.'}
              </p>
            </div>

            {/* Practical Toolbox Micro-Cards & Doctor PDF */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--line)] bg-white/85 p-3.5 shadow-2xs flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--sage)]/30 text-[var(--sage-deep)]">
                  <CheckCircle2 size={15} />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--brown)]">Carb Calculator</p>
                  <p className="text-[10px] text-[var(--brown-soft)]">Pakistani portion estimation</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white/85 p-3.5 shadow-2xs flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--sage)]/30 text-[var(--sage-deep)]">
                  <FileText size={15} />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--brown)]">Doctor PDF Export</p>
                  <p className="text-[10px] text-[var(--brown-soft)]">1-click clinic summaries</p>
                </div>
              </div>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;