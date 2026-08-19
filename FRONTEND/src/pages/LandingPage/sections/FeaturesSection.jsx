import React, { useState } from 'react';
import {
  ClipboardList,
  BarChart3,
  Bell,
  Users,
  CheckCircle2,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Heart,
  Footprints,
  Utensils,
  Pill,
  MessageSquare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useI18n } from '../../../i18n/I18nContext';

export default function FeaturesSection() {
  const { t: tr } = useI18n();
  const [activePill, setActivePill] = useState(0);
  const [mealType, setMealType] = useState('fasting');
  const [medTaken, setMedTaken] = useState(false);

  const chartData = [
    { label: 'Mon', avg: 104 },
    { label: 'Tue', avg: 118 },
    { label: 'Wed', avg: 108 },
    { label: 'Thu', avg: 122 },
    { label: 'Fri', avg: 110 },
    { label: 'Sat', avg: 115 },
    { label: 'Sun', avg: 108 },
  ];

  const pillars = [
    { id: 'logging', label: 'Daily Logging', icon: ClipboardList },
    { id: 'reports', label: 'Health Reports', icon: BarChart3 },
    { id: 'reminders', label: 'Smart Reminders', icon: Bell },
    { id: 'community', label: 'Peer Community', icon: Users },
  ];

  return (
    <section
      id="features"
      className="relative w-full px-5 sm:px-8 lg:px-12 py-14 sm:py-20 scroll-mt-24 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #F8F5EE 0%, rgba(216, 228, 218, 0.45) 35%, rgba(236, 230, 218, 0.55) 70%, #F8F5EE 100%)',
      }}
    >
      {/* Soft botanical ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-[#BDCAA1]/25 rounded-full blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7EFE5] border border-[#C5D8C3] mb-2.5">
            <span className="h-2 w-2 rounded-full bg-[#2E6B3E]" />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#2E6B3E]">
              WHY CHOOSE DIABUDDY
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl lg:text-[2.35rem] text-[var(--brown)] tracking-tight leading-snug">
            Simple tools for{' '}
            <span className="italic text-[var(--sage-deep)] font-medium">
              everyday diabetes care.
            </span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--brown-soft)] font-medium max-w-lg mx-auto">
            Explore the 4 core tools built to make your daily routine simple, visual, and stress-free.
          </p>
        </div>

        {/* Pill Switcher */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none mb-6 sm:mb-8 -mx-1 sm:mx-0">
          {pillars.map((pill, idx) => {
            const Icon = pill.icon;
            const isActive = activePill === idx;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActivePill(idx)}
                className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4.5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#182C1E] text-white shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-white/90 text-[var(--brown)] border border-[var(--line)] shadow-2xs hover:scale-[1.01]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#BDCAA1]' : 'text-[var(--sage-deep)]'} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Focus Deck — Clean, Unified, Responsive */}
        <div className="rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] border border-[#E3DACE] bg-white shadow-[0_20px_60px_-15px_rgba(30,45,35,0.10)] overflow-hidden">

          {/* -------------------------------------------------------
              1. DAILY LOGGING
          ------------------------------------------------------- */}
          {activePill === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 animate-in fade-in duration-300">

              {/* Copy column */}
              <div className="relative flex flex-col justify-between p-5 sm:p-9 lg:p-12 lg:pr-10 border-b lg:border-b-0 lg:border-r border-[#E8E2D4] bg-gradient-to-br from-[#FCFAF6] via-[#F8F5EE] to-[#F1ECE0]">
                <div>
                  <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[#2E6B3E] bg-[#E2ECE0] border border-[#C5D8C3] px-3 py-1 rounded-full w-fit">
                    01 · Daily Logging
                  </span>

                  <h3 className="mt-3.5 font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[var(--brown)] leading-snug">
                    Log sugar, meals &amp; insulin in seconds.
                  </h3>
                  <p className="mt-3 text-xs sm:text-[14.5px] text-[var(--brown-soft)] leading-relaxed font-medium">
                    Quickly record blood glucose, everyday meals (like roti, daal, and biryani), insulin doses, water, and activity. Fast, clean, and designed to make everyday tracking feel effortless.
                  </p>

                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-[#1E3626] font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#2E6B3E] shrink-0" />
                      <span>Instant color-coded target range feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#2E6B3E] shrink-0" />
                      <span>Pakistani food portions with estimated carbs</span>
                    </div>
                  </div>
                </div>

                {/* Bottom desktop badges */}
                <div className="hidden lg:flex mt-8 pt-5 border-t border-[#E3DACE]/80 items-center gap-3 text-xs text-[var(--brown-soft)] font-semibold">
                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#E3DACE] px-3 py-1.5 rounded-xl shadow-2xs">
                    5-Sec Quick Log
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#E3DACE] px-3 py-1.5 rounded-xl shadow-2xs">
                    100% Private Data
                  </span>
                </div>
              </div>

              {/* Live UI column */}
              <div className="bg-[#F7F4EE] p-4.5 sm:p-7 lg:p-12 flex flex-col gap-3 sm:gap-4">

                {/* Fasting / After Meal Segmented Control Switcher */}
                <div className="grid grid-cols-2 rounded-2xl bg-white p-1 border border-[#E0D8CA] text-xs sm:text-sm font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setMealType('fasting')}
                    className={`flex items-center justify-center py-2 sm:py-2.5 px-3 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                      mealType === 'fasting'
                        ? 'bg-[#182C1E] text-white shadow-sm font-bold'
                        : 'text-[var(--brown-soft)] hover:text-[var(--brown)]'
                    }`}
                  >
                    Fasting Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('postMeal')}
                    className={`flex items-center justify-center py-2 sm:py-2.5 px-3 rounded-xl transition-all duration-200 cursor-pointer select-none ${
                      mealType === 'postMeal'
                        ? 'bg-[#182C1E] text-white shadow-sm font-bold'
                        : 'text-[var(--brown-soft)] hover:text-[var(--brown)]'
                    }`}
                  >
                    After Meal Log
                  </button>
                </div>

                {/* Big glucose reading card */}
                <div className="rounded-2xl bg-white p-4 sm:p-6 border border-[#E0D8CA] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--brown-soft)] uppercase tracking-wider">
                      Blood Glucose Reading
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-[#2E6B3E] bg-[#E8F2E6] px-2.5 py-0.5 rounded-full border border-[#BDCAA1]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2E6B3E]" />
                      In Target Range
                    </span>
                  </div>

                  <div className="mt-2.5 sm:mt-3 flex items-baseline gap-2 relative z-10">
                    <span className="font-serif text-4xl sm:text-5xl font-extrabold text-[#1E2A24] tracking-tight">
                      {mealType === 'fasting' ? '108' : '136'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#2E6B3E] bg-[#E8F2E6] px-2 py-0.5 rounded-md">mg/dL</span>
                  </div>

                  <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-[var(--brown-soft)] font-medium relative z-10">
                    Target: <strong className="text-[#1E2A24]">{mealType === 'fasting' ? '70 – 130 mg/dL (Fasting)' : 'Less than 180 mg/dL (Post-Meal)'}</strong>
                  </p>
                </div>

                {/* 3 Theme-Aligned Quick-log pills */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <div className="rounded-2xl bg-white p-2.5 sm:p-3.5 border border-[#E0D8CA] shadow-xs text-center flex flex-col justify-between">
                    <div className="flex items-center justify-center gap-1 text-[var(--brown-soft)]">
                      <Utensils size={11} />
                      <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider">Meal</p>
                    </div>
                    <p className="font-serif text-xs sm:text-[15px] font-bold text-[#1E2A24] mt-1">Roti + Daal</p>
                    <p className="text-[9.5px] sm:text-[10.5px] text-[#554D43] font-bold mt-1 bg-[#F1ECE0] py-0.5 rounded-md">~48g carbs</p>
                  </div>

                  <div className="rounded-2xl bg-white p-2.5 sm:p-3.5 border border-[#E0D8CA] shadow-xs text-center flex flex-col justify-between">
                    <div className="flex items-center justify-center gap-1 text-[#2E6B3E]">
                      <Pill size={11} />
                      <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider">Insulin</p>
                    </div>
                    <p className="font-serif text-xs sm:text-[15px] font-bold text-[#1E2A24] mt-1">4 Units</p>
                    <p className="text-[9.5px] sm:text-[10.5px] text-[#2E6B3E] font-bold mt-1 bg-[#E8F2E6] py-0.5 rounded-md">Novorapid</p>
                  </div>

                  <div className="rounded-2xl bg-white p-2.5 sm:p-3.5 border border-[#E0D8CA] shadow-xs text-center flex flex-col justify-between">
                    <div className="flex items-center justify-center gap-1 text-[#1E3626]">
                      <Footprints size={11} />
                      <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider">Walk</p>
                    </div>
                    <p className="font-serif text-xs sm:text-[15px] font-bold text-[#1E2A24] mt-1">20 min</p>
                    <p className="text-[9.5px] sm:text-[10.5px] text-[#2E6B3E] font-bold mt-1 bg-[#E8F2E6] py-0.5 rounded-md">Post-dinner</p>
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
              <div className="relative flex flex-col justify-between p-5 sm:p-9 lg:p-12 lg:pr-10 border-b lg:border-b-0 lg:border-r border-[#E8E2D4] bg-gradient-to-br from-[#FCFAF6] via-[#F8F5EE] to-[#F1ECE0]">
                <div>
                  <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[#2E6B3E] bg-[#E2ECE0] border border-[#C5D8C3] px-3 py-1 rounded-full w-fit">
                    02 · Health Reports
                  </span>

                  <h3 className="mt-3.5 font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[var(--brown)] leading-snug">
                    Doctor-ready trends &amp; printable PDF summaries.
                  </h3>
                  <p className="mt-3 text-xs sm:text-[14.5px] text-[var(--brown-soft)] leading-relaxed font-medium">
                    Understand your weekly glucose patterns, fasting averages, and time-in-range percentage. Generate a clean PDF report for your doctor with one click.
                  </p>

                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-[#1E3626] font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#2E6B3E] shrink-0" />
                      <span>Replaces messy handwritten paper logs completely</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#2E6B3E] shrink-0" />
                      <span>Ready to print or send via WhatsApp to your doctor</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex mt-8 pt-5 border-t border-[#E3DACE]/80 items-center gap-3 text-xs text-[var(--brown-soft)] font-semibold">
                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#E3DACE] px-3 py-1.5 rounded-xl shadow-2xs">
                    1-Tap PDF Download
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#E3DACE] px-3 py-1.5 rounded-xl shadow-2xs">
                    Time-In-Range Visuals
                  </span>
                </div>
              </div>

              {/* Live UI column */}
              <div className="bg-[#F7F4EE] p-4.5 sm:p-7 lg:p-12 flex flex-col gap-3 sm:gap-4">

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-[#E0D8CA] shadow-sm text-center">
                    <p className="text-[10px] sm:text-[10.5px] font-bold text-[var(--brown-soft)] uppercase tracking-wider">7-Day Avg Sugar</p>
                    <p className="font-serif text-2xl sm:text-4xl font-bold text-[#1E2A24] mt-1">112</p>
                    <span className="inline-block text-[10px] sm:text-[11px] font-bold text-[#2E6B3E] bg-[#E8F2E6] px-2 py-0.5 rounded-md mt-1">mg/dL · Stable</span>
                  </div>
                  <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-[#E0D8CA] shadow-sm text-center">
                    <p className="text-[10px] sm:text-[10.5px] font-bold text-[var(--brown-soft)] uppercase tracking-wider">Time In Range</p>
                    <p className="font-serif text-2xl sm:text-4xl font-bold text-[#2E6B3E] mt-1">88%</p>
                    <span className="inline-block text-[10px] sm:text-[11px] font-bold text-[#2E6B3E] bg-[#E8F2E6] px-2 py-0.5 rounded-md mt-1">Target: &gt;70%</span>
                  </div>
                </div>

                {/* Sparkline chart */}
                <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-[#E0D8CA] shadow-sm">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[10.5px] sm:text-[11px] font-bold text-[var(--brown-soft)] uppercase tracking-wider">7-Day Glucose Curve</p>
                    <span className="text-[10px] sm:text-[10.5px] font-bold text-[#2E6B3E] bg-[#E8F2E6] px-2 py-0.5 rounded-full border border-[#BDCAA1]">Normal Range</span>
                  </div>
                  <div className="h-24 sm:h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2E6B3E" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#BDCAA1" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--brown-soft)' }} tickLine={false} axisLine={false} />
                        <ReferenceLine y={140} stroke="#C4A47C" strokeDasharray="4 4" strokeOpacity={0.7} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E2DCD0', borderRadius: '10px', fontSize: '11px', padding: '4px 10px' }} />
                        <Area type="monotone" dataKey="avg" stroke="#2E6B3E" fill="url(#rptGrad)" strokeWidth={2.5} dot={{ r: 2.5, fill: '#2E6B3E' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PDF Button */}
                <button
                  type="button"
                  className="w-full rounded-2xl bg-[#182C1E] hover:bg-[#0E1B12] text-white py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Download size={15} />
                  <span>Download PDF for Doctor Visit</span>
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
              <div className="relative flex flex-col justify-between p-5 sm:p-9 lg:p-12 lg:pr-10 border-b lg:border-b-0 lg:border-r border-[#E8E2D4] bg-gradient-to-br from-[#FCFAF6] via-[#F8F5EE] to-[#F1ECE0]">
                <div>
                  <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[#2E6B3E] bg-[#E2ECE0] border border-[#C5D8C3] px-3 py-1 rounded-full w-fit">
                    03 · Smart Reminders
                  </span>

                  <h3 className="mt-3.5 font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[var(--brown)] leading-snug">
                    Never miss medications, insulin, or hydration.
                  </h3>
                  <p className="mt-3 text-xs sm:text-[14.5px] text-[var(--brown-soft)] leading-relaxed font-medium">
                    Set gentle notifications for morning tablets, mealtime insulin, and water intake. Mark doses completed with a single tap.
                  </p>

                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-[#1E3626] font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#2E6B3E] shrink-0" />
                      <span>Gentle reminder schedules on your phone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-[#2E6B3E] shrink-0" />
                      <span>One-tap logging directly from reminder cards</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex mt-8 pt-5 border-t border-[#E3DACE]/80 items-center gap-3 text-xs text-[var(--brown-soft)] font-semibold">
                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#E3DACE] px-3 py-1.5 rounded-xl shadow-2xs">
                    Smart Push Alerts
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#E3DACE] px-3 py-1.5 rounded-xl shadow-2xs">
                    Water &amp; Dose Log
                  </span>
                </div>
              </div>

              {/* Live UI column */}
              <div className="bg-[#F7F4EE] p-4.5 sm:p-7 lg:p-12 flex flex-col gap-3 sm:gap-4">

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-[var(--brown)]">Today's Routine</span>
                  <span className="text-[11px] sm:text-xs font-bold text-[#2E6B3E] bg-white px-2.5 py-0.5 rounded-full border border-[#E0D8CA] shadow-2xs">
                    2 Scheduled
                  </span>
                </div>

                {/* Tappable morning tablet */}
                <button
                  type="button"
                  onClick={() => setMedTaken(!medTaken)}
                  className="w-full text-left rounded-2xl bg-white p-3.5 sm:p-5 border border-[#E0D8CA] shadow-sm flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-colors ${
                      medTaken ? 'bg-[#E8F2E6] text-[#2E6B3E]' : 'bg-[#F1ECE0] text-[#7A746B]'
                    }`}>
                      <CheckCircle2 size={18} />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--brown)]">Morning Tablet (Metformin)</p>
                      <p className="text-[10.5px] sm:text-xs text-[var(--brown-soft)] mt-0.5">8:00 AM · With breakfast</p>
                    </div>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-xl transition-all ${
                    medTaken
                      ? 'text-[#2E6B3E] bg-[#E8F2E6] border border-[#BDCAA1]'
                      : 'text-[#554D43] bg-[#F1ECE0] border border-[#D9D1C2]'
                  }`}>
                    {medTaken ? 'Taken ✓' : 'Tap to Done'}
                  </span>
                </button>

                {/* Night dose */}
                <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-[#E0D8CA] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-[#E8F2E6] text-[#2E6B3E]">
                      <Bell size={18} />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--brown)]">Night Dose / Insulin</p>
                      <p className="text-[10.5px] sm:text-xs text-[var(--brown-soft)] mt-0.5">8:30 PM · Bedtime Dose</p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-[#2E6B3E] bg-[#E8F2E6] px-2.5 py-1 rounded-xl border border-[#BDCAA1]">
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
              <div className="relative flex flex-col justify-between p-5 sm:p-9 lg:p-12 lg:pr-10 border-b lg:border-b-0 lg:border-r border-[#E8E2D4] bg-gradient-to-br from-[#FCFAF6] via-[#F8F5EE] to-[#F1ECE0]">
                <div>
                  <span className="inline-block text-[10.5px] font-bold uppercase tracking-wider text-[#2E6B3E] bg-[#E2ECE0] border border-[#C5D8C3] px-3 py-1 rounded-full w-fit">
                    04 · Peer Community
                  </span>

                  <h3 className="mt-3.5 font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[var(--brown)] leading-snug">
                    Safe peer discussions &amp; authentic food advice.
                  </h3>
                  <p className="mt-3 text-xs sm:text-[14.5px] text-[var(--brown-soft)] leading-relaxed font-medium">
                    Connect across 8 moderated topic spaces. Share portion tips for desi dishes, ask questions anonymously, and celebrate daily wins with peers.
                  </p>

                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-[#1E3626] font-bold">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-[#2E6B3E] shrink-0" />
                      <span>Post with your name or 100% anonymously</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-[#2E6B3E] shrink-0" />
                      <span>Zero medical judgment or unsolicited spam</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex mt-8 pt-5 border-t border-[#E3DACE]/80 items-center gap-3 text-xs text-[var(--brown-soft)] font-semibold">
                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#E3DACE] px-3 py-1.5 rounded-xl shadow-2xs">
                    8 Active Topic Hubs
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white border border-[#E3DACE] px-3 py-1.5 rounded-xl shadow-2xs">
                    Anonymous Posting
                  </span>
                </div>
              </div>

              {/* Live UI column */}
              <div className="bg-[#F7F4EE] p-4.5 sm:p-7 lg:p-12 flex flex-col gap-3 sm:gap-4">

                {/* Real Topics from Community Feed */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {[
                    { label: 'Glucose Management', count: '142 posts' },
                    { label: 'Nutrition & Meals',   count: '218 posts' },
                    { label: 'Exercise & Fitness',  count: '86 posts'  },
                    { label: 'Insulin & Meds',      count: '105 posts' },
                  ].map((t) => (
                    <div key={t.label} className="rounded-2xl bg-white p-3 sm:p-4 border border-[#E0D8CA] shadow-xs">
                      <p className="text-xs sm:text-sm font-bold text-[#1E2A24] leading-snug">{t.label}</p>
                      <p className="text-[10px] sm:text-[11px] text-[var(--brown-soft)] mt-0.5">{t.count}</p>
                    </div>
                  ))}
                </div>

                {/* Real Community Q&A Post from Feed */}
                <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-[#E0D8CA] shadow-sm">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#2E6B3E] uppercase tracking-wide">Nutrition &amp; Meals</span>
                    <span className="text-[9.5px] sm:text-[10.5px] font-bold text-[#2E6B3E] bg-[#E8F2E6] px-2.5 py-0.5 rounded-full border border-[#BDCAA1]">Anonymous</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#1E2A24]">
                    "Low-effort dinners that don’t wreck my numbers"
                  </p>
                  <p className="text-xs text-[var(--brown-soft)] mt-1.5 leading-relaxed bg-[#F8F5EE] p-2 sm:p-2.5 rounded-xl border border-[#E8E2D4]">
                    "Work days I’m exhausted and takeout is tempting. What are your go-to 15-minute meals that are carb-aware? Sharing what’s worked for you would help a lot."
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