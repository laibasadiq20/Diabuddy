import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import learnIllustration from '../../../assets/learn.png';

const ExploreSection = () => {
  const { t: tr } = useI18n();

  const learnTopics = [
    {
      num: '01',
      to: '/learn/warning-signs',
      title: tr('landing.explore.items.warningSigns.title') || 'Warning signs',
      description:
        tr('landing.explore.items.warningSigns.description') ||
        'Recognize the early signs and know when to take action.',
    },
    {
      num: '02',
      to: '/learn/diabetes-types',
      title: tr('landing.explore.items.diabetesTypes.title') || 'Types of Diabetes',
      description:
        tr('landing.explore.items.diabetesTypes.description') ||
        'Learn about Type 1, Type 2, and gestational diabetes.',
    },
    {
      num: '03',
      to: '/learn/risk-assessment',
      title: tr('landing.explore.items.riskAssessment.title') || 'Risk assessment',
      description:
        tr('landing.explore.items.riskAssessment.description') ||
        'Understand risk factors and how to manage them.',
    },
    {
      num: '04',
      to: '/learn/blog',
      title: tr('landing.explore.items.blog.title') || 'Measuring & tracking',
      description:
        tr('landing.explore.items.blog.description') ||
        'Learn how to track your numbers the right way.',
    },
  ];

  return (
    <section id="learn" className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px]">
        
        {/* Main Beige/Parchment Card matching the Reference Design */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] border border-[#E7DFCE] bg-[#F8F5EE] px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14 shadow-[0_12px_40px_rgba(30,42,36,0.06)]">
          
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-14">
            
            {/* Left Column: Heading & Illustration */}
            <div className="flex flex-col justify-between h-full">
              <div>
                {/* Kicker with Green Dot */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-[#3D5A45]" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#3D5A45]">
                    Learn at your pace
                  </span>
                </div>

                {/* Big Title */}
                <h2 className="font-serif text-[2.25rem] sm:text-4xl lg:text-[3.25rem] font-normal leading-[1.12] tracking-tight text-[#1E2A24]">
                  Knowledge that <br />
                  <span className="italic font-semibold text-[#3D5A45]">
                    empowers you.
                  </span>
                </h2>
              </div>

              {/* Bottom Illustration (Books + Mug + Leaves) */}
              <div className="mt-8 sm:mt-10 max-w-[320px] sm:max-w-[360px]">
                <img
                  src={learnIllustration}
                  alt="Knowledge and learning illustration"
                  className="w-full h-auto object-contain pointer-events-none select-none drop-shadow-sm"
                />
              </div>
            </div>

            {/* Right Column: 4 Clean White Stacked Cards */}
            <div className="flex flex-col gap-3.5 sm:gap-4">
              {learnTopics.map((topic) => (
                <Link
                  key={topic.num}
                  to={topic.to}
                  className="group relative flex items-center justify-between rounded-2xl border border-black/5 bg-white px-5 py-4 sm:px-7 sm:py-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-[#3D5A45]/30 hover:shadow-[0_8px_24px_rgba(46,107,62,0.08)] hover:-translate-y-0.5"
                >
                  {/* Left: Number + Content */}
                  <div className="flex items-start gap-4 sm:gap-6 min-w-0 pr-3">
                    <span className="font-serif text-base sm:text-lg font-bold text-[#7A8B7B] mt-0.5 shrink-0">
                      {topic.num}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-serif text-[1.05rem] sm:text-[1.2rem] font-semibold text-[#1E2A24] transition-colors group-hover:text-[#3D5A45]">
                        {topic.title}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-[13px] leading-relaxed text-[#6B5645] line-clamp-2 sm:line-clamp-1">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Read CTA with animated arrow */}
                  <div className="flex shrink-0 items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1E2A24] transition-all duration-200 group-hover:text-[#3D5A45] group-hover:gap-2.5">
                    <span>{tr('landing.explore.read') || 'Read'}</span>
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ExploreSection;
