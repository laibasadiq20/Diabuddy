import React from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import secureBg from '../../../assets/secure.png';

const SecuritySection = () => {
  const { t: tr } = useI18n();

  const humanValues = [
    {
      num: '01',
      title: tr('landing.trust.card1Title') || 'Private by Design',
      desc:
        tr('landing.trust.card1Desc') ||
        'Your health information stays personal, protected, and under your control. We never sell your data.',
    },
    {
      num: '02',
      title: tr('landing.trust.card2Title') || 'Clear, Practical Guidance',
      desc:
        tr('landing.trust.card2Desc') ||
        'Plain-language patterns and doctor-ready summaries designed to make daily health easier to understand.',
    },
    {
      num: '03',
      title: tr('landing.trust.card3Title') || 'Judgment-Free Space',
      desc:
        tr('landing.trust.card3Desc') ||
        'Track, ask questions, and connect with peer members without feeling overwhelmed or judged.',
    },
  ];

  return (
    <section className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 scroll-mt-24">
      <div className="mx-auto w-full max-w-[1360px]">

        {/* Sleek, Horizontal Panoramic Card with Integrated Botanical Leaf Background */}
        <div
          className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] border border-[#E7DFCE] shadow-[0_8px_32px_rgba(30,42,36,0.05)] flex items-center bg-[#EDEAD9] bg-no-repeat bg-cover bg-[position:95%_center] sm:bg-right"
          style={{
            backgroundImage: `url(${secureBg})`,
          }}
        >
          {/* Gentle soft gradient fade on the left to keep text ultra crisp */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#EDEAD9] via-[#EDEAD9]/90 sm:via-[#EDEAD9]/60 to-transparent sm:w-3/4 z-[1]"
            aria-hidden="true"
          />

          {/* Content container - compact vertical padding, wide horizontal spread */}
          <div className="relative z-10 w-full flex flex-col gap-5 px-5 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:gap-8 lg:px-10 lg:py-6 lg:max-w-[80%]">
            
            {/* Left: Heading */}
            <div className="shrink-0 max-w-[280px] lg:max-w-[230px]">
              <h2 className="font-serif text-xl sm:text-2xl lg:text-[1.75rem] font-normal leading-[1.16] tracking-tight text-[#1E2A24]">
                {tr('landing.trust.headingLine1') || 'Your health data'}{' '}
                <br />
                <span className="italic font-medium text-[#2E6B3E]">
                  {tr('landing.trust.headingLine2') || 'deserves to stay yours.'}
                </span>
              </h2>
            </div>

            {/* Subtle vertical divider between heading and values */}
            <div className="hidden lg:block w-px self-stretch bg-[#1E2A24]/15 my-0.5" />

            {/* Right: 3 Clean, Compact Value Principles */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5 flex-1">
              {humanValues.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-start ${
                    index !== 0
                      ? 'sm:border-l sm:border-[#1E2A24]/15 sm:pl-4 lg:pl-5'
                      : ''
                  }`}
                >
                  {/* Clean Number Badge */}
                  <span className="font-serif text-xs font-bold text-[#2E6B3E] mb-0.5 block">
                    {item.num}
                  </span>

                  {/* Title */}
                  <h3 className="font-serif text-sm sm:text-[15px] font-bold text-[#1E2A24] leading-snug">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1 text-xs sm:text-[12.5px] leading-relaxed text-[#4A4339] font-normal">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default SecuritySection;