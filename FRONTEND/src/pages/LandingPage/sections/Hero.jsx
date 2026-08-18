import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import {
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Users,
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

  return (
    <section
      id="home"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
      className="relative w-full min-h-[62vh] sm:min-h-[64vh] lg:min-h-[70vh] flex items-center overflow-hidden bg-[#F7F3EC] pt-16 sm:pt-20 pb-10 sm:pb-14"
    >
      {/* Gradient Overlay — authentic sage green tones preserved */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(189, 202, 177, 0.63) 0%, rgba(189, 202, 177, 0.63) 0%, rgba(233, 204, 204, 0.45) 65%, rgba(231, 220, 203, 0.1) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-[580px] lg:max-w-[620px] flex flex-col items-start">
          
          {/* Main Headline matching reference */}
          <h1 className="font-display font-normal leading-[1.04] text-[#1E2A24] text-[2.75rem] sm:text-[3.6rem] lg:text-[4.5rem] tracking-tight">
            {tr('landing.hero.titleStart') || 'A'}{' '}
            <span className="italic font-semibold text-[#3D5A45]">
              {tr('landing.hero.titleEmphasis') || 'softer'}
            </span>{' '}
            {tr('landing.hero.titleMid') || 'way'}
            <br />
            {tr('landing.hero.titleLine2') || 'to live with'}
            <br />
            {tr('landing.hero.titleEnd') || 'diabetes.'}
          </h1>

          {/* Subtitle / Lead text */}
          <p className="mt-5 sm:mt-6 text-[0.95rem] sm:text-[1.05rem] leading-[1.65] text-[#554D43] max-w-[460px] font-normal">
            {tr('landing.hero.lead') ||
              'Track your health, understand your patterns, stay consistent, and connect with people who understand you.'}
          </p>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={goStart}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-[#1E2A24] px-7 sm:px-8 py-3.5 sm:py-4 text-[0.95rem] font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#2A3B33] hover:shadow-md hover:-translate-y-0.5"
            >
              <span>{tr('landing.hero.startLogging') || 'Get Started Free'}</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={goExplore}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-[#1E2A24]/40 bg-white/40 backdrop-blur-sm px-7 sm:px-8 py-3.5 sm:py-4 text-[0.95rem] font-semibold text-[#1E2A24] transition-all duration-300 hover:border-[#1E2A24]/70 hover:bg-white/80 hover:-translate-y-0.5"
            >
              {tr('landing.hero.explore') || 'See How It Works'}
            </button>
          </div>

          {/* Bottom Trust Badges Strip */}
          <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-4 sm:gap-7">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#4A4237]">
              <ShieldCheck size={16} className="text-[#3D5A45]" strokeWidth={2.2} />
              <span>{tr('landing.hero.badgePrivate') || 'Private & Secure'}</span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#4A4237]">
              <BookOpen size={16} className="text-[#3D5A45]" strokeWidth={2.2} />
              <span>{tr('landing.hero.badgeEvidence') || 'Evidence-Informed'}</span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#4A4237]">
              <Users size={16} className="text-[#3D5A45]" strokeWidth={2.2} />
              <span>{tr('landing.hero.badgeMadeForYou') || 'Made for You'}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
