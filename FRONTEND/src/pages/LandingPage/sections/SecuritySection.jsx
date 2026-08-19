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
    <section className="w-full bg-[var(--cream-soft)] px-5 sm:px-8 lg:px-12 py-14 sm:py-20 scroll-mt-24">
      <div className="mx-auto w-full max-w-[1400px]">

        {/* Reassuring Card with Botanical Leaf Background & Protected Readability */}
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] lg:rounded-[44px] border border-[#E7DFCE] bg-[#F8F5EE] shadow-[0_12px_40px_rgba(30,42,36,0.06)] min-h-[280px] flex items-center">
          
          {/* Natural Botanical Leaf Artwork - soft, light, and airy sage green */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[60%] lg:w-[40%] select-none bg-no-repeat bg-right bg-cover lg:bg-contain opacity-45 sm:opacity-60 lg:opacity-75 transition-opacity duration-300"
            style={{
              backgroundImage: `url(${secureBg})`,
              backgroundPosition: 'right center',
            }}
            aria-hidden="true"
          />

          {/* Gentle Left-to-Right Fade (ensures heading area stays clean while leaving leaves bright on right) */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F8F5EE] via-[#F8F5EE]/70 to-transparent sm:w-2/3 z-[1]"
            aria-hidden="true"
          />

          {/* Content container */}
          <div className="relative z-10 w-full flex flex-col gap-8 px-6 py-8 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:gap-12 lg:px-14 lg:py-14 lg:max-w-[82%]">
            
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

            {/* Right: 3 Clean Value Principles (soft card backdrops on mobile for flawless readability, airy columns on desktop) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 lg:gap-8 flex-1">
              {humanValues.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-start rounded-2xl p-4.5 sm:p-0 bg-white/80 sm:bg-transparent border border-[#E7DFCE]/90 sm:border-0 shadow-2xs sm:shadow-none backdrop-blur-[2px] sm:backdrop-blur-none ${
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