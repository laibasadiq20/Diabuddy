import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

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
    <section id="learn" className="w-full bg-[var(--cream-soft)] px-5 sm:px-8 lg:px-12 py-4 sm:py-6 scroll-mt-24">
      <div className="mx-auto w-full max-w-[1400px]">
        
        {/* Main Beige/Parchment Card with Crisp, Defined Borders */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] border-2 border-[#C9BDA8] bg-[#F8F5EE] px-6 py-7 sm:px-10 sm:py-9 lg:px-12 lg:py-10 shadow-[0_8px_32px_rgba(58,46,36,0.06)]">
          
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.35fr] lg:gap-10">
            
            {/* Left Column: Heading */}
            <div className="flex flex-col justify-center">
              {/* Kicker with Green Dot */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EFE5] border border-[#A8C4A5] w-fit mb-3 sm:mb-4 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2E6B3E]" />
                <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#2E6B3E]">
                  Learn at your pace
                </span>
              </div>

              {/* Big Title */}
              <h2 className="font-serif text-[2.25rem] sm:text-4xl lg:text-[3.25rem] font-normal leading-[1.12] tracking-tight text-[#1E2A24]">
                Knowledge that <br />
                <span className="italic font-semibold text-[#2E6B3E]">
                  empowers you.
                </span>
              </h2>

              <p className="mt-3 max-w-md text-xs sm:text-sm text-[var(--brown-soft)] leading-relaxed font-medium">
                Short, doctor-reviewed guides designed to help you understand diabetes, identify symptoms early, and manage daily health with confidence.
              </p>
            </div>

            {/* Right Column: 4 Clean White Stacked Cards with Visible Defined Borders */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {learnTopics.map((topic) => (
                <Link
                  key={topic.num}
                  to={topic.to}
                  className="group relative flex items-center justify-between rounded-2xl border border-[#C8BDAB] bg-white px-5 py-3 sm:px-6 sm:py-3.5 shadow-2xs transition-all duration-200 hover:border-[#2E6B3E]/60 hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Left: Number + Content */}
                  <div className="flex items-start gap-4 sm:gap-6 min-w-0 pr-3">
                    <span className="font-serif text-base sm:text-lg font-bold text-[#2E6B3E] mt-0.5 shrink-0">
                      {topic.num}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-serif text-[1.05rem] sm:text-[1.2rem] font-semibold text-[#1E2A24] transition-colors group-hover:text-[#2E6B3E]">
                        {topic.title}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-[13px] leading-relaxed text-[var(--brown-soft)] line-clamp-2 sm:line-clamp-1 font-medium">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Read CTA with animated arrow */}
                  <div className="flex shrink-0 items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1E2A24] transition-all duration-200 group-hover:text-[#2E6B3E] group-hover:gap-2.5">
                    <span>{tr('landing.explore.read') || 'Read'}</span>
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 text-[#2E6B3E]" />
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
