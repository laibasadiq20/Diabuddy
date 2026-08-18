import React from 'react';
import { ShieldCheck, Lock, BookOpen } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import secureBg from '../../../assets/secure.png';

const SecuritySection = () => {
  const { t: tr } = useI18n();

  const trustItems = [
    {
      icon: ShieldCheck,
      title: tr('landing.trust.card1Title') || 'Private by design',
      desc:
        tr('landing.trust.card1Desc') ||
        'Your information belongs to you. We never share your data.',
    },
    {
      icon: Lock,
      title: tr('landing.trust.card2Title') || 'Secure & protected',
      desc:
        tr('landing.trust.card2Desc') ||
        'Industry-standard security to keep your data safe.',
    },
    {
      icon: BookOpen,
      title: tr('landing.trust.card3Title') || 'Evidence-informed',
      desc:
        tr('landing.trust.card3Desc') ||
        'Content reviewed by experts and based on reliable sources.',
    },
  ];

  return (
    <section className="w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1400px]">

        {/* Main Security Card */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] border border-[#E7DFCE] bg-[#F8F5EE] shadow-[0_10px_35px_rgba(30,42,36,0.05)]">

          {/* Secure Image */}
          <img
            src={secureBg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Optional subtle overlay for readability */}
          <div className="absolute inset-0 bg-[#F8F5EE]/20" />

          {/* Content */}
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_2fr] lg:gap-10 lg:px-12 lg:py-12">

            {/* Heading */}
            <div className="max-w-[360px]">
              <h2 className="font-serif text-2xl font-normal leading-[1.2] tracking-tight text-[#1E2A24] sm:text-3xl lg:text-[2rem]">
                {tr('landing.trust.headingLine1') || 'Your health data'}{' '}
                <br className="hidden sm:inline" />

                <span className="text-[#3D5A45]">
                  {tr('landing.trust.headingLine2') ||
                    'deserves to stay yours.'}
                </span>
              </h2>
            </div>

            {/* Trust Items */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4 lg:gap-6">
              {trustItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-start ${
                      index !== 0
                        ? 'sm:border-l sm:border-[#1E2A24]/10 sm:pl-5 lg:pl-6'
                        : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-white/80 text-[#3D5A45] shadow-sm">
                      <Icon size={22} strokeWidth={1.8} />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-[#1E2A24] sm:text-[0.92rem]">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1 max-w-[210px] text-xs leading-relaxed text-[#6B5645] sm:text-[12.5px]">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;