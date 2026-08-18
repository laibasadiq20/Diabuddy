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
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

export default function FeaturesSection() {
  const { t: tr } = useI18n();
  const [activePill, setActivePill] = useState(0);

  // Interactive live states inside the focus deck
  const [mealType, setMealType] = useState('fasting');
  const [medTaken, setMedTaken] = useState(true);

  const pillars = [
    {
      id: 'logging',
      icon: ClipboardList,
      label: 'Daily Logging',
    },
    {
      id: 'reports',
      icon: FileText,
      label: 'Health Reports',
    },
    {
      id: 'reminders',
      icon: Bell,
      label: 'Smart Reminders',
    },
    {
      id: 'community',
      icon: Users,
      label: 'Peer Community',
    },
  ];

  return (
    <section id="features" className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-8 py-12 sm:py-18">
      <div className="mx-auto max-w-4xl">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[var(--sage-deep)]">
            WHY CHOOSE DIABUDDY
          </p>
          <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl lg:text-[2.25rem] text-[var(--brown)] tracking-tight leading-snug">
            Everything you need to manage diabetes,{' '}
            <span className="italic text-[var(--sage-deep)] font-medium">
              in one calm space.
            </span>
          </h2>
          <p className="mt-2 text-xs sm:text-[13px] text-[var(--brown-soft)] font-medium">
            Explore the 4 core tools built to make your daily routine simple and stress-free.
          </p>
        </div>

        {/* =========================================================
            TOP PILL SWITCHER (4 Core Features)
        ========================================================== */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
          {pillars.map((pill, idx) => {
            const Icon = pill.icon;
            const isActive = activePill === idx;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActivePill(idx)}
                className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-xs sm:text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#182C1E] text-white shadow-md scale-[1.02]'
                    : 'bg-white/85 hover:bg-white text-[var(--brown)] border border-[var(--line)] shadow-2xs hover:scale-[1.01]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#8DB496]' : 'text-[var(--brown-soft)]'} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================
            THE FOCUS DECK
        ========================================================== */}
        <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-9 shadow-[0_15px_40px_-15px_rgba(30,45,35,0.08)] transition-all duration-300">

          {/* --------------------------------------------------------
              1. DAILY LOGGING
          --------------------------------------------------------- */}
          {activePill === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center animate-in fade-in duration-300">
              {/* Copy Side (6 cols) */}
              <div className="md:col-span-6 space-y-3">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--sage-deep)] bg-[#E4EFE2] px-2.5 py-0.5 rounded-full">
                  01 · Daily Logging
                </span>
                <h3 className="font-serif text-2xl sm:text-[1.75rem] font-bold text-[var(--brown)] leading-snug">
                  Log your sugar, meals, and insulin in 5 seconds.
                </h3>
                <p className="text-xs sm:text-[13px] text-[var(--brown-soft)] leading-relaxed font-medium">
                  Quickly record blood glucose, everyday meals (like roti and daal), insulin units, water, and activity. Fast, clean, and designed to eliminate tracking burnout.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-[#1E3626] font-bold">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Instant target range feedback for fasting & post-meal logs</span>
                </div>
              </div>

              {/* Interactive Widget Side (6 cols) */}
              <div className="md:col-span-6 rounded-2xl bg-[var(--cream-soft)] border border-[var(--line)] p-4 sm:p-5 space-y-3.5 shadow-2xs">
                {/* Fasting vs Post-Meal Switcher */}
                <div className="flex rounded-xl bg-white p-1 border border-[var(--line)] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMealType('fasting')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      mealType === 'fasting'
                        ? 'bg-[#182C1E] text-white shadow-2xs'
                        : 'text-[var(--brown-soft)] hover:text-[var(--brown)]'
                    }`}
                  >
                    Fasting Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('postMeal')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      mealType === 'postMeal'
                        ? 'bg-[#182C1E] text-white shadow-2xs'
                        : 'text-[var(--brown-soft)] hover:text-[var(--brown)]'
                    }`}
                  >
                    After Meal Log
                  </button>
                </div>

                {/* Sugar Reading Tile */}
                <div className="rounded-xl bg-white p-4 border border-[var(--line)] shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brown-soft)]">
                      {mealType === 'fasting' ? 'Fasting Glucose' : 'Post-Meal Glucose'}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-serif text-3xl font-bold text-[var(--brown)]">
                        {mealType === 'fasting' ? '108' : '138'}
                      </span>
                      <span className="text-xs font-semibold text-[var(--brown-soft)]">mg/dL</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10.5px] font-bold text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      In Target Range
                    </span>
                    <p className="text-[9.5px] text-[var(--brown-soft)] mt-1 font-medium">
                      {mealType === 'fasting' ? 'Target: 70–100 mg/dL' : 'Target: 70–140 mg/dL'}
                    </p>
                  </div>
                </div>

                {/* Quick Meal & Insulin Tile */}
                <div className="rounded-xl bg-white p-3 border border-[var(--line)] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAE5D8] text-[var(--brown)]">
                      <Utensils size={13} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[var(--brown)]">Lunch: 1 Roti + Daal Chana</p>
                      <p className="text-[10px] text-[var(--brown-soft)]">Carbs: ~38g · Insulin: 4u</p>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Logged ✓
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------
              2. HEALTH REPORTS
          --------------------------------------------------------- */}
          {activePill === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center animate-in fade-in duration-300">
              {/* Copy Side (6 cols) */}
              <div className="md:col-span-6 space-y-3">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--sage-deep)] bg-[#E4EFE2] px-2.5 py-0.5 rounded-full">
                  02 · Health Reports
                </span>
                <h3 className="font-serif text-2xl sm:text-[1.75rem] font-bold text-[var(--brown)] leading-snug">
                  Clear trend analytics & 1-click doctor PDF summaries.
                </h3>
                <p className="text-xs sm:text-[13px] text-[var(--brown-soft)] leading-relaxed font-medium">
                  Understand your weekly sugar patterns, time-in-range percentage, and average readings. Download a clean, clinical PDF report ready for your next doctor appointment.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-[#1E3626] font-bold">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Replaces messy handwritten paper logs completely</span>
                </div>
              </div>

              {/* Interactive Report Preview (6 cols) */}
              <div className="md:col-span-6 rounded-2xl bg-[var(--cream-soft)] border border-[var(--line)] p-4 sm:p-5 space-y-3 shadow-2xs">
                <div className="rounded-xl bg-white p-4 border border-[var(--line)] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText size={17} className="text-[var(--sage-deep)]" />
                      <span className="text-xs font-bold text-[var(--brown)]">Weekly Clinic Report</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Doctor-Ready (PDF)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-[var(--cream-soft)] p-2.5">
                      <p className="text-[9.5px] font-bold text-[var(--brown-soft)] uppercase">7-Day Avg Sugar</p>
                      <p className="font-serif text-lg font-bold text-[var(--brown)] mt-0.5">112 mg/dL</p>
                    </div>
                    <div className="rounded-lg bg-[var(--cream-soft)] p-2.5">
                      <p className="text-[9.5px] font-bold text-[var(--brown-soft)] uppercase">Time In Range</p>
                      <p className="font-serif text-lg font-bold text-emerald-700 mt-0.5">88% Normal</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-xl bg-[#182C1E] hover:bg-[#0E1B12] text-white py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download PDF for Doctor</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------
              3. SMART REMINDERS
          --------------------------------------------------------- */}
          {activePill === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center animate-in fade-in duration-300">
              {/* Copy Side (6 cols) */}
              <div className="md:col-span-6 space-y-3">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--sage-deep)] bg-[#E4EFE2] px-2.5 py-0.5 rounded-full">
                  03 · Smart Reminders
                </span>
                <h3 className="font-serif text-2xl sm:text-[1.75rem] font-bold text-[var(--brown)] leading-snug">
                  Never miss medications, insulin, or hydration.
                </h3>
                <p className="text-xs sm:text-[13px] text-[var(--brown-soft)] leading-relaxed font-medium">
                  Set automatic, gentle phone notifications for morning tablets, mealtime insulin, and water intake. Mark doses as completed with a single tap to build consistent daily habits.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-[#1E3626] font-bold">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Customizable daily schedules with on-screen tracking</span>
                </div>
              </div>

              {/* Interactive Reminders Checklist (6 cols) */}
              <div className="md:col-span-6 rounded-2xl bg-[var(--cream-soft)] border border-[var(--line)] p-4 sm:p-5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--brown)]">Today's Routine Checklist</span>
                  <span className="text-[10px] font-bold text-[var(--sage-deep)] bg-white px-2 py-0.5 rounded-md border border-[var(--line)]">
                    2 Scheduled
                  </span>
                </div>

                {/* Morning Tablet Item */}
                <button
                  type="button"
                  onClick={() => setMedTaken(!medTaken)}
                  className="w-full text-left rounded-xl bg-white p-3 border border-[var(--line)] shadow-2xs flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      medTaken ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <CheckCircle2 size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[var(--brown)]">Morning Tablet (Metformin)</p>
                      <p className="text-[10px] text-[var(--brown-soft)]">8:00 AM · Taken with breakfast</p>
                    </div>
                  </div>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded transition-all ${
                    medTaken
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border border-amber-200'
                  }`}>
                    {medTaken ? 'Taken ✓' : 'Tap to Mark Done'}
                  </span>
                </button>

                {/* Night Dose / Insulin Item */}
                <div className="rounded-xl bg-white p-3 border border-[var(--line)] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Bell size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[var(--brown)]">Night Dose / Insulin</p>
                      <p className="text-[10px] text-[var(--brown-soft)]">8:30 PM · Bedtime Dose</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Alert Set
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------
              4. PEER COMMUNITY
          --------------------------------------------------------- */}
          {activePill === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center animate-in fade-in duration-300">
              {/* Copy Side (6 cols) */}
              <div className="md:col-span-6 space-y-3">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--sage-deep)] bg-[#E4EFE2] px-2.5 py-0.5 rounded-full">
                  04 · Peer Community
                </span>
                <h3 className="font-serif text-2xl sm:text-[1.75rem] font-bold text-[var(--brown)] leading-snug">
                  Safe peer discussions & authentic food advice.
                </h3>
                <p className="text-xs sm:text-[13px] text-[var(--brown-soft)] leading-relaxed font-medium">
                  Connect across 8 moderated topic spaces. Learn portion sizes for desi dishes (like biryani and roti), ask questions with 100% privacy, and celebrate daily wins together.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-[#1E3626] font-bold">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  <span>Post named or completely anonymous whenever you choose</span>
                </div>
              </div>

              {/* Interactive Community Widget (6 cols) */}
              <div className="md:col-span-6 rounded-2xl bg-[var(--cream-soft)] border border-[var(--line)] p-4 sm:p-5 space-y-2.5 shadow-2xs">
                {/* Desi Pantry Card */}
                <div className="rounded-xl bg-white p-3 border border-[var(--line)] shadow-2xs">
                  <div className="flex items-center gap-2 text-[var(--brown)] font-bold text-xs">
                    <Utensils size={13} className="text-[var(--sage-deep)]" />
                    <span>Pakistani Pantry & Recipes</span>
                  </div>
                  <p className="text-[10.5px] text-[var(--brown-soft)] mt-1 leading-relaxed">
                    Tips on pairing wholewheat roti with lentils and salads to prevent post-meal sugar spikes.
                  </p>
                </div>

                {/* Community Q&A Question */}
                <div className="rounded-xl bg-white p-3 border border-[var(--line)] shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9.5px] font-bold text-[var(--sage-deep)]">Community Q&A</span>
                    <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Anonymous</span>
                  </div>
                  <p className="text-xs font-bold text-[var(--brown)]">
                    "What are the best low-sugar breakfast ideas?"
                  </p>
                  <p className="text-[10px] text-[var(--brown-soft)] mt-0.5">
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