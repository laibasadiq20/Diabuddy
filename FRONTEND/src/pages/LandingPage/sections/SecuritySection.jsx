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
    <section className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px]">

        {/* Reassuring Card with Botanical Leaf Background & Protected Readability */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] border border-[#E7DFCE] bg-[#F8F5EE] shadow-[0_12px_40px_rgba(30,42,36,0.06)] min-h-[280px] flex items-center">
          
          {/* Subtle Botanical Leaf Artwork - delicate watermark on mobile, elegant right accent on desktop */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[60%] lg:w-[45%] select-none bg-no-repeat bg-right bg-cover lg:bg-contain opacity-15 sm:opacity-30 lg:opacity-75 mix-blend-multiply transition-opacity duration-300"
            style={{
              backgroundImage: `url(${secureBg})`,
              backgroundPosition: 'right center',
            }}
            aria-hidden="true"
          />

          {/* Soft Cream Gradient Overlay to guarantee high text contrast and legibility */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-[#F8F5EE] via-[#F8F5EE]/95 sm:via-[#F8F5EE]/80 to-transparent z-[1]"
            aria-hidden="true"
          />

          {/* Content container */}
          <div className="relative z-10 w-full flex flex-col gap-8 px-6 py-8 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:gap-12 lg:px-14 lg:py-14 lg:max-w-[84%]">
            
            {/* Left: Reassuring Human-Centered Heading */}
            <div className="shrink-0 max-w-[340px] lg:max-w-[290px]">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[2.25rem] font-normal leading-[1.18] tracking-tight text-[#1E2A24]">
                {tr('landing.trust.headingLine1') || 'Your health journey,'}{' '}
                <br />
                <span className="italic font-medium text-[#2E6B3E]">
                  {tr('landing.trust.headingLine2') || 'on your terms.'}
                </span>
              </h2>
            </div>

            {/* Subtle vertical divider on desktop */}
            <div className="hidden lg:block w-px self-stretch bg-[#1E2A24]/15 my-2" />

            {/* Right: 3 Clean, Strengthened Value Principles */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6 lg:gap-8 flex-1">
              {humanValues.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-start ${
                    index !== 0
                      ? 'sm:border-l sm:border-[#1E2A24]/15 sm:pl-6 lg:pl-8'
                      : ''
                  }`}
                >
                  {/* Clean Number Badge */}
                  <span className="font-serif text-sm sm:text-base font-bold text-[#2E6B3E] mb-1.5 block">
                    {item.num}
                  </span>

                  {/* Stronger Title */}
                  <h3 className="font-serif text-base sm:text-lg lg:text-[1.12rem] font-bold text-[#1E2A24] leading-snug">
                    {item.title}
                  </h3>

                  {/* Description with high-contrast text */}
                  <p className="mt-2 text-xs sm:text-[13.5px] leading-relaxed text-[#4A4339] font-normal">
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