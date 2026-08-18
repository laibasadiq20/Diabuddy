import React from 'react';
import { Heart, Home, Plus, Users, BookOpen, Settings } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

const HowItWorks = () => {
  const { t: tr } = useI18n();

  const steps = [
    { number: '01', title: tr('landing.howItWorks.steps.login.title'), description: tr('landing.howItWorks.steps.login.description') },
    { number: '02', title: tr('landing.howItWorks.steps.dashboard.title'), description: tr('landing.howItWorks.steps.dashboard.description') },
    { number: '03', title: tr('landing.howItWorks.steps.logs.title'), description: tr('landing.howItWorks.steps.logs.description') },
    { number: '04', title: tr('landing.howItWorks.steps.reports.title'), description: tr('landing.howItWorks.steps.reports.description') },
    { number: '05', title: tr('landing.howItWorks.steps.reminders.title'), description: tr('landing.howItWorks.steps.reminders.description') },
  ];

  const sidebarIcons = [Heart, Home, Plus, Users, BookOpen, Settings];

  // Simple static trend path — illustrative only, paired with the "Sample data" label
  const trendPoints = '0,55 20,40 40,48 60,20 80,35 100,10 120,30 140,15';

  return (
    <section id="about" className="relative overflow-hidden bg-[#1E2A24] px-6 py-5">
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-[#BDCAA1]/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#E7DCCB]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* LEFT: Kicker, heading, steps */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#BDCAA1]">
                {tr('landing.howItWorks.kicker')}
              </p>
              <h2 className="font-display text-2xl leading-tight text-white md:text-4xl font-light">
                {tr('landing.howItWorks.headingStart')}{' '}
                <span className="italic text-[#E7DCCB] font-normal">{tr('landing.howItWorks.headingEmphasis')}</span>
              </h2>
              <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-white/60">
                {tr('landing.howItWorks.subtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              {steps.map((step) => (
                <div key={step.number} className="flex items-start gap-3.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#BDCAA1]/40 font-serif text-[13px] font-semibold text-[#BDCAA1]">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-[0.95rem] text-white font-semibold">{step.title}</h3>
                    <p className="mt-0.5 text-[0.8rem] leading-snug text-white/60">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Static dashboard visual */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[560px] rounded-2xl bg-[#16211B] p-2.5 shadow-2xl flex gap-2.5">

              {/* Mini sidebar strip */}
              <div className="flex flex-col items-center gap-3 py-3 px-1.5">
                {sidebarIcons.map((Icon, i) => (
                  <span
                    key={i}
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${i === 0 ? 'bg-white/10 text-[#BDCAA1]' : 'text-white/40'}`}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </span>
                ))}
              </div>

              {/* Dashboard card */}
              <div className="flex-1 rounded-xl bg-[#F6F3EE] p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-serif text-base font-semibold text-gray-900">
                    {tr('landing.howItWorks.mockDashboard.title')}
                  </h4>
                  <span className="rounded bg-[#1E2A24] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#BDCAA1]">
                    {tr('landing.howItWorks.sampleDataLabel')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  <div className="rounded-lg border border-black/5 bg-white p-2">
                    <p className="text-[8px] uppercase font-bold text-gray-400">{tr('landing.howItWorks.mockDashboard.glucose')}</p>
                    <p className="mt-0.5 font-serif text-base font-bold text-gray-900">108</p>
                    <p className="text-[8px] font-semibold text-emerald-700">{tr('landing.howItWorks.mockDashboard.glucoseStatus')}</p>
                  </div>
                  <div className="rounded-lg border border-black/5 bg-white p-2">
                    <p className="text-[8px] uppercase font-bold text-gray-400">{tr('landing.howItWorks.mockDashboard.carbs')}</p>
                    <p className="mt-0.5 font-serif text-base font-bold text-gray-900">142</p>
                  </div>
                  <div className="rounded-lg border border-black/5 bg-white p-2">
                    <p className="text-[8px] uppercase font-bold text-gray-400">{tr('landing.howItWorks.mockDashboard.steps')}</p>
                    <p className="mt-0.5 font-serif text-base font-bold text-gray-900">4,350</p>
                  </div>
                </div>

                <div className="rounded-lg border border-black/5 bg-white p-2 mb-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase text-gray-500">{tr('landing.howItWorks.mockDashboard.trends')}</p>
                    <span className="text-[8px] font-semibold text-gray-400">{tr('landing.howItWorks.mockDashboard.thisWeek')}</span>
                  </div>
                  <svg viewBox="0 0 140 40" className="w-full h-9" preserveAspectRatio="none">
                    <polyline points={trendPoints} fill="none" stroke="#8FA37E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-black/5 bg-white p-2">
                    <p className="mb-1 text-[8px] font-bold uppercase text-gray-500">{tr('landing.howItWorks.mockDashboard.upcoming')}</p>
                    <p className="text-[10px] font-semibold text-gray-800">{tr('landing.howItWorks.mockDashboard.upcomingItem1')}</p>
                    <p className="text-[8px] text-gray-400">{tr('landing.howItWorks.mockDashboard.upcomingItem1Sub')}</p>
                    <div className="my-1 h-px bg-black/5" />
                    <p className="text-[10px] font-semibold text-gray-800">{tr('landing.howItWorks.mockDashboard.upcomingItem2')}</p>
                    <p className="text-[8px] text-gray-400">{tr('landing.howItWorks.mockDashboard.upcomingItem2Sub')}</p>
                  </div>
                  <div className="rounded-lg border border-black/5 bg-white p-2 flex flex-col justify-between">
                    <div>
                      <p className="mb-1 text-[8px] font-bold uppercase text-gray-500">{tr('landing.howItWorks.mockDashboard.recentLog')}</p>
                      <p className="text-[10px] font-semibold text-gray-800">{tr('landing.howItWorks.mockDashboard.recentItem1')}</p>
                      <p className="text-[8px] text-gray-400">{tr('landing.howItWorks.mockDashboard.recentItem1Sub')}</p>
                    </div>
                    <button type="button" className="mt-1.5 rounded-md bg-[#1E2A24] py-1 text-[8px] font-bold text-white">
                      {tr('landing.howItWorks.mockDashboard.newLog')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
