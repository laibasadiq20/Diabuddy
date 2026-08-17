import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  MessageSquare,
  Globe,
  Sparkles,
} from 'lucide-react';
import heroImage from '../../../assets/hero-illustration.png';

const Hero = () => {
  const { user } = useAuth();
  const { t: tr } = useI18n();
  const navigate = useNavigate();

  const goExplore = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return;
    }
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goStart = () => {
    navigate(user ? '/dashboard' : '/login');
  };

  const stats = [
    {
      icon: Activity,
      value: tr('landing.hero.stat1Value') || '8',
      label: tr('landing.hero.stat1Label') || 'Health metrics tracked',
    },
    {
      icon: MessageSquare,
      value: tr('landing.hero.stat2Value') || '8+',
      label: tr('landing.hero.stat2Label') || 'Peer forum topics',
    },
    {
      icon: Globe,
      value: tr('landing.hero.stat3Value') || '2',
      label: tr('landing.hero.stat3Label') || 'Languages (EN / اردو)',
    },
    {
      icon: Sparkles,
      value: tr('landing.hero.stat4Value') || '100%',
      label: tr('landing.hero.stat4Label') || 'Free forever · No ads',
    },
  ];

  return (
    <section id="home" className="relative w-full flex flex-col bg-[#F7F3EC]">
      
      {/* 1. Main Hero Image Banner */}
      <div
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
        className="relative w-full min-h-[72vh] sm:min-h-[76vh] lg:min-h-[89vh] flex items-center overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16"
      >
        {/* Gradient Overlay — authentic sage green tones */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(189, 202, 177, 0.63) 0%, rgba(189, 202, 177, 0.63) 0%, rgba(233, 204, 204, 0.45) 65%, rgba(231, 220, 203, 0.1) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="max-w-[640px] flex flex-col items-start">
            
            <p className="mb-3 sm:mb-4 font-display text-[3.2rem] sm:text-[4.2rem] lg:text-[5.2rem] font-semibold leading-[0.95] tracking-tight text-[#1E2A24]">
              DiaBuddy
            </p>

            <h1 className="font-display font-light leading-[1.15] text-[#1E2A24] text-[1.65rem] sm:text-[2.05rem] lg:text-[2.5rem] mb-4 sm:mb-6">
              {tr('landing.hero.titleStart')}{' '}
              <span className="italic font-semibold text-[#3D5A45]">
                {tr('landing.hero.titleEmphasis')}
              </span>{' '}
              {tr('landing.hero.titleEnd')}
            </h1>

            <p className="text-[0.95rem] sm:text-[1.08rem] leading-[1.8] text-[#5C524B] max-w-[490px] mb-8 sm:mb-10 font-normal">
              {tr('landing.hero.lead')}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={goStart}
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-[#27392E] px-8 py-3.5 text-[0.95rem] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#1E2A24] hover:-translate-y-0.5"
              >
                {tr('landing.hero.startLogging')}
              </button>

              <button
                type="button"
                onClick={goExplore}
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border border-[#27392E]/25 bg-white/50 backdrop-blur px-8 py-3.5 text-[0.95rem] font-semibold text-[#27392E] transition-all duration-300 hover:bg-white/80 hover:border-[#27392E]/50 hover:-translate-y-0.5"
              >
                {tr('landing.hero.explore')}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Clean Sage Green Stats Bar */}
      <div className="w-full border-y border-[#3D5A45]/15 bg-[#EAE4D9]/90 backdrop-blur-sm py-5 sm:py-6 px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1400px] grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`flex items-center gap-3.5 ${
                  index !== 0 ? 'lg:border-l lg:border-[#3D5A45]/15 lg:pl-6' : ''
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DFE7DC] text-[#27392E] border border-[#3D5A45]/10">
                  <Icon size={19} className="text-[#356E46]" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-2xl sm:text-[1.65rem] font-bold leading-none text-[#1E2A24]">
                    {item.value}
                  </p>
                  <p className="text-xs sm:text-[0.82rem] font-normal text-[#5A544C] mt-1 leading-snug">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};

export default Hero;
