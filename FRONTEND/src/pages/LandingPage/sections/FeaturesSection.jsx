import React, { useState } from 'react';
import {
  ClipboardList,
  FileText,
  Bell,
  Users,
  Utensils,
  Syringe,
  CheckCircle2,
  Download,
  ShieldCheck,
  Droplets,
  Activity,
  GlassWater,
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useI18n } from '../../../i18n/I18nContext';

export default function FeaturesSection() {
  const { t: tr } = useI18n();
  const [activePill, setActivePill] = useState(0);
  const [mealType, setMealType] = useState('fasting');
  const [medTaken, setMedTaken] = useState(true);

  const chartData = [
    { label: 'Mon', avg: 104 },
    { label: 'Tue', avg: 118 },
    { label: 'Wed', avg: 98  },
    { label: 'Thu', avg: 132 },
    { label: 'Fri', avg: 110 },
    { label: 'Sat', avg: 122 },
    { label: 'Sun', avg: 108 },
  ];

  const pillars = [
    { id: 'logging',    icon: ClipboardList, label: 'Daily Logging'    },
    { id: 'reports',    icon: FileText,      label: 'Health Reports'   },
    { id: 'reminders',  icon: Bell,          label: 'Smart Reminders'  },
    { id: 'community',  icon: Users,         label: 'Peer Community'   },
  ];

  return (
    <section id="features" className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-9">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[var(--sage-deep)]">
            WHY CHOOSE DIABUDDY
          </p>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl lg:text-[2.25rem] text-[var(--brown)] tracking-tight leading-snug">
            Simple tools for{' '}
            <span className="italic text-[var(--sage-deep)] font-medium">
              everyday diabetes care.
            </span>
          </h2>
          <p className="mt-2 text-sm text-[var(--brown-soft)] font-medium">
            Explore the 4 core tools built to make your daily routine simple and stress-free.
          </p>
        </div>

        {/* Pill Switcher */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none mb-7">
          {pillars.map((pill, idx) => {
            const Icon = pill.icon;
            const isActive = activePill === idx;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActivePill(idx)}
                className={`inline-flex items-center gap-2 shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#182C1E] text-white shadow-md scale-[1.02]'
                    : 'bg-white/85 hover:bg-white text-[var(--brown)] border border-[var(--line)] shadow-2xs hover:scale-[1.01]'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#8DB496]' : 'text-[var(--brown-soft)]'} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Focus Deck — wide, airy, product-forward */}
        <div className="rounded-[32px] border border-[var(--line)] bg-white shadow-[0_20px_60px_-20px_rgba(30,45,35,0.10)] overflow-hidden">

          {/* -------------------------------------------------------
              1. DAILY LOGGING
          ------------------------------------------------------- */}
          {activePill === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 animate-in fade-in duration-300">

              {/* Copy column */}
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:pr-10 border-b lg:border-b-0 lg:border-r border-[var(--line)]">
                <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[var(--sage-deep)] bg-[#E4EFE2] px-3 py-1 rounded-full w-fit">
                  01 · Daily Logging
                </span>
                <h3 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-[var(--brown)] leading-tight">
                  Log sugar, meals & insulin in seconds.
                </h3>
                <p className="mt-4 text-sm sm:text-[15px] text-[var(--brown-soft)] leading-relaxed font-medium">
                  Quickly record blood glucose, everyday meals (like roti and daal), insulin units, water, and activity. Fast, clean, and designed to make everyday tracking feel easier.
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-[#1E3626] font-bold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Instant target range feedback for fasting &amp; post-meal logs</span>
                </div>
              </div>

              {/* Live UI column */}
              <div className="bg-[var(--cream-soft)] p-8 sm:p-12 flex flex-col gap-4">

                {/* Fasting / After Meal switcher */}
                <div className="flex rounded-2xl bg-white p-1.5 border border-[var(--line)] text-sm font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setMealType('fasting')}
                    className={`flex-1 py-2 rounded-xl transition-all ${
                      mealType === 'fasting'
                        ? 'bg-[#182C1E] text-white shadow-sm'
                        : 'text-[var(--brown-soft)] hover:text-[var(--brown)]'
                    }`}
                  >
                    Fasting Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('postMeal')}
                    className={`flex-1 py-2 rounded-xl transition-all ${
                      mealType === 'postMeal'
                        ? 'bg-[#182C1E] text-white shadow-sm'
                        : 'text-[var(--brown-soft)] hover:text-[var(--brown)]'
                    }`}
                  >
                    After Meal Log
                  </button>
                </div>

                {/* Big glucose reading card */}
                <div className="rounded-2xl bg-white p-6 border border-[var(--line)] shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brown-soft)]">
                      {mealType === 'fasting' ? 'Fasting Glucose' : 'Post-Meal Glucose'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-5xl font-bold text-[var(--brown)]">
                        {mealType === 'fasting' ? '108' : '138'}
                      </span>
                      <span className="text-base font-semibold text-[var(--brown-soft)]">mg/dL</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      In Target Range
                    </span>
                    <p className="text-[11px] text-[var(--brown-soft)] mt-1.5 font-medium">
                      {mealType === 'fasting' ? 'Target: 70–100 mg/dL' : 'Target: 70–140 mg/dL'}
                    </p>
                  </div>
                </div>

                {/* Quick log row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm text-center">
                    <Utensils size={18} className="mx-auto text-[var(--brown-soft)] mb-1.5" />
                    <p className="text-xs font-bold text-[var(--brown)]">1 Roti + Daal</p>
                    <p className="text-[10px] text-[var(--brown-soft)] mt-0.5">~38g carbs</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm text-center">
                    <Syringe size={18} className="mx-auto text-[var(--brown-soft)] mb-1.5" />
                    <p className="text-xs font-bold text-[var(--brown)]">4u Insulin</p>
                    <p className="text-[10px] text-[var(--brown-soft)] mt-0.5">Mealtime dose</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm text-center">
                    <GlassWater size={18} className="mx-auto text-[var(--sage-deep)] mb-1.5" />
                    <p className="text-xs font-bold text-[var(--brown)]">2.1 L</p>
                    <p className="text-[10px] text-[var(--brown-soft)] mt-0.5">Water today</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              2. HEALTH REPORTS
          ------------------------------------------------------- */}
          {activePill === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 animate-in fade-in duration-300">

              {/* Copy column */}
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:pr-10 border-b lg:border-b-0 lg:border-r border-[var(--line)]">
                <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[var(--sage-deep)] bg-[#E4EFE2] px-3 py-1 rounded-full w-fit">
                  02 · Health Reports
                </span>
                <h3 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-[var(--brown)] leading-tight">
                  See your weekly patterns. Share with your doctor.
                </h3>
                <p className="mt-4 text-sm sm:text-[15px] text-[var(--brown-soft)] leading-relaxed font-medium">
                  Understand your weekly sugar patterns and average readings. Download a clean PDF report ready for your next doctor appointment — no paper diaries needed.
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-[#1E3626] font-bold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Replaces messy handwritten paper logs completely</span>
                </div>
              </div>

              {/* Live UI column */}
              <div className="bg-[var(--cream-soft)] p-8 sm:p-12 flex flex-col gap-4">

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-5 border border-[var(--line)] shadow-sm text-center">
                    <p className="text-[10.5px] font-bold text-[var(--brown-soft)] uppercase tracking-wider">7-Day Avg Sugar</p>
                    <p className="font-serif text-4xl font-bold text-[var(--brown)] mt-1">112</p>
                    <p className="text-xs text-[var(--brown-soft)] mt-0.5">mg/dL</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 border border-[var(--line)] shadow-sm text-center">
                    <p className="text-[10.5px] font-bold text-[var(--brown-soft)] uppercase tracking-wider">Time In Range</p>
                    <p className="font-serif text-4xl font-bold text-emerald-700 mt-1">88%</p>
                    <p className="text-xs text-[var(--brown-soft)] mt-0.5">Normal readings</p>
                  </div>
                </div>

                {/* Sparkline chart */}
                <div className="rounded-2xl bg-white p-5 border border-[var(--line)] shadow-sm">
                  <p className="text-[11px] font-bold text-[var(--brown-soft)] uppercase tracking-wider mb-3">7-Day Glucose Curve</p>
                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--sage-deep)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="var(--sage)" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--brown-soft)' }} tickLine={false} axisLine={false} />
                        <ReferenceLine y={140} stroke="#C4A47C" strokeDasharray="4 4" strokeOpacity={0.6} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E2DCD0', borderRadius: '10px', fontSize: '11px', padding: '4px 10px' }} />
                        <Area type="monotone" dataKey="avg" stroke="var(--sage-deep)" fill="url(#rptGrad)" strokeWidth={2.5} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PDF Button */}
                <button
                  type="button"
                  className="w-full rounded-2xl bg-[#182C1E] hover:bg-[#0E1B12] text-white py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download PDF for Doctor</span>
                </button>

              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              3. SMART REMINDERS
          ------------------------------------------------------- */}
          {activePill === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 animate-in fade-in duration-300">

              {/* Copy column */}
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:pr-10 border-b lg:border-b-0 lg:border-r border-[var(--line)]">
                <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[var(--sage-deep)] bg-[#E4EFE2] px-3 py-1 rounded-full w-fit">
                  03 · Smart Reminders
                </span>
                <h3 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-[var(--brown)] leading-tight">
                  Never miss medications, insulin, or hydration.
                </h3>
                <p className="mt-4 text-sm sm:text-[15px] text-[var(--brown-soft)] leading-relaxed font-medium">
                  Set gentle phone notifications for morning tablets, mealtime insulin, and water intake. Mark doses as completed with a single tap to build consistent daily habits.
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-[#1E3626] font-bold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Customizable daily schedules with on-screen tracking</span>
                </div>
              </div>

              {/* Live UI column */}
              <div className="bg-[var(--cream-soft)] p-8 sm:p-12 flex flex-col gap-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--brown)]">Today's Routine</span>
                  <span className="text-xs font-bold text-[var(--sage-deep)] bg-white px-3 py-1 rounded-full border border-[var(--line)]">
                    2 Scheduled
                  </span>
                </div>

                {/* Tappable morning tablet */}
                <button
                  type="button"
                  onClick={() => setMedTaken(!medTaken)}
                  className="w-full text-left rounded-2xl bg-white p-5 border border-[var(--line)] shadow-sm flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                      medTaken ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <CheckCircle2 size={22} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--brown)]">Morning Tablet (Metformin)</p>
                      <p className="text-xs text-[var(--brown-soft)] mt-0.5">8:00 AM · With breakfast</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                    medTaken
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border border-amber-200'
                  }`}>
                    {medTaken ? 'Taken ✓' : 'Tap to Mark Done'}
                  </span>
                </button>

                {/* Night dose */}
                <div className="rounded-2xl bg-white p-5 border border-[var(--line)] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Bell size={22} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--brown)]">Night Dose / Insulin</p>
                      <p className="text-xs text-[var(--brown-soft)] mt-0.5">8:30 PM · Bedtime Dose</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    Alert Set
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              4. PEER COMMUNITY
          ------------------------------------------------------- */}
          {activePill === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 animate-in fade-in duration-300">

              {/* Copy column */}
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:pr-10 border-b lg:border-b-0 lg:border-r border-[var(--line)]">
                <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[var(--sage-deep)] bg-[#E4EFE2] px-3 py-1 rounded-full w-fit">
                  04 · Peer Community
                </span>
                <h3 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-[var(--brown)] leading-tight">
                  Safe peer discussions &amp; authentic food advice.
                </h3>
                <p className="mt-4 text-sm sm:text-[15px] text-[var(--brown-soft)] leading-relaxed font-medium">
                  Connect across 8 moderated topic spaces. Learn portion sizes for desi dishes, ask questions with 100% privacy, and celebrate daily wins with people who truly understand.
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-[#1E3626] font-bold">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Post named or completely anonymous whenever you choose</span>
                </div>
              </div>

              {/* Live UI column */}
              <div className="bg-[var(--cream-soft)] p-8 sm:p-12 flex flex-col gap-4">

                {/* Topic chips */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Pakistani Pantry', count: '124 posts' },
                    { label: 'Daily Wins',        count: '89 posts'  },
                    { label: 'Ask a Question',    count: '211 posts' },
                    { label: 'Ramadan & Fasting', count: '56 posts'  },
                  ].map((t) => (
                    <div key={t.label} className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm">
                      <p className="text-sm font-bold text-[var(--brown)] truncate">{t.label}</p>
                      <p className="text-[11px] text-[var(--brown-soft)] mt-0.5">{t.count}</p>
                    </div>
                  ))}
                </div>

                {/* Community Q&A card */}
                <div className="rounded-2xl bg-white p-5 border border-[var(--line)] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[var(--sage-deep)] uppercase tracking-wide">Community Q&amp;A</span>
                    <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Anonymous</span>
                  </div>
                  <p className="text-sm font-bold text-[var(--brown)]">
                    "What are good low-sugar breakfast ideas?"
                  </p>
                  <p className="text-xs text-[var(--brown-soft)] mt-1.5">
                    8 helpful responses from peer members
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}