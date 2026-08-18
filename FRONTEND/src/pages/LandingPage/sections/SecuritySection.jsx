import React from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import secureBg from '../../../assets/secure.png';

const SecuritySection = () => {
  const { t: tr } = useI18n();

  const humanValues = [
    {
      num: '01',
      title: tr('landing.trust.card1Title') || 'Your privacy',
      desc:
        tr('landing.trust.card1Desc') ||
        'Your health information stays personal, protected, and under your control.',
    },
    {
      num: '02',
      title: tr('landing.trust.card2Title') || 'Thoughtful guidance',
      desc:
        tr('landing.trust.card2Desc') ||
        'Clear, practical information designed to help you understand your health.',
    },
    {
      num: '03',
      title: tr('landing.trust.card3Title') || 'A space that listens',
      desc:
        tr('landing.trust.card3Desc') ||
        'Track, learn, and connect without feeling judged or overwhelmed.',
    },
  ];

  return (
    <section className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[1400px]">

        {/* Reassuring, Human Card with Leaf Art Background */}
        <div
          className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] border border-[#E7DFCE] shadow-[0_10px_35px_rgba(30,42,36,0.05)]"
          style={{
            backgroundColor: '#EDEAD9',
            backgroundImage: `url(${secureBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/*
            Content is framed within the left ~76% so the right-side leaf branch
            breathes naturally with no overlap.
          */}
          <div
            className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-12 lg:py-10"
            style={{ maxWidth: '78%' }}
          >
            {/* Left: Reassuring Human-Centered Heading */}
            <div className="shrink-0 max-w-[320px] lg:max-w-[280px]">
              <h2 className="font-serif text-2xl font-normal leading-[1.18] tracking-tight text-[#1E2A24] sm:text-3xl lg:text-[2rem]">
                {tr('landing.trust.headingLine1') || 'Your health journey,'}{' '}
                <br />
                <span className="italic font-medium text-[#3D5A45]">
                  {tr('landing.trust.headingLine2') || 'on your terms.'}
                </span>
              </h2>
            </div>

            {/* Subtle vertical divider on desktop */}
            <div className="hidden lg:block w-px self-stretch bg-[#1E2A24]/10 my-1" />

            {/* Right: 3 Clean, Uncomplicated Value Cards (No icons, no dashes) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4 lg:gap-6 flex-1">
              {humanValues.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-start ${
                    index !== 0
                      ? 'sm:border-l sm:border-[#1E2A24]/10 sm:pl-4 lg:pl-5'
                      : ''
                  }`}
                >
                  {/* Clean Number */}
                  <span className="font-serif text-sm sm:text-base font-bold text-[#7A8B7B] mb-1 block">
                    {item.num}
                  </span>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#1E2A24] sm:text-[0.92rem]">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1 text-xs leading-relaxed text-[#5F5446] sm:text-[12.5px]">
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