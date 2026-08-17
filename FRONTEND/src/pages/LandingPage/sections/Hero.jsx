import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
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
      className="relative min-h-screen flex items-center overflow-hidden bg-[#F7F3EC]"
    >
      <img
        src={heroImage}
        alt={tr('landing.hero.imageAlt')}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(189, 202, 177, 0.63) 0%, rgba(189, 202, 177, 0.63) 0%, rgba(233, 204, 204, 0.45) 65%, rgba(231, 220, 203, 0.1) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] py-12">
        <div className="max-w-[650px] px-6 sm:px-10 md:px-20 flex flex-col items-start">

          <p className="mb-4 font-display text-[3.2rem] sm:text-[4.5rem] lg:text-[6rem] font-semibold leading-[0.95] tracking-tight text-[#1E2A24]">
            DiaBuddy
          </p>

          <h1 className="font-display font-light leading-[1.15] text-[#1E2A24] text-[1.65rem] sm:text-[2.1rem] lg:text-[2.5rem] mb-6">
            {tr('landing.hero.titleStart')}{' '}
            <span className="italic font-semibold text-[#3D5A45]">
              {tr('landing.hero.titleEmphasis')}
            </span>{' '}
            {tr('landing.hero.titleEnd')}
          </h1>

          <p className="text-[0.95rem] sm:text-[1.1rem] leading-[1.85] text-[#6B5645] max-w-[480px] mb-10">
            {tr('landing.hero.lead')}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={goStart}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-[#1E2A24] px-7 py-3.5 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:bg-[#C56A3E] hover:-translate-y-0.5"
            >
              {tr('landing.hero.startLogging')}
            </button>

            <button
              onClick={goExplore}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border-2 border-[#1E2A24]/30 bg-white/40 backdrop-blur px-7 py-3.5 text-[0.95rem] font-semibold text-[#1E2A24] transition-all duration-300 hover:border-[#C56A3E] hover:text-[#C56A3E] hover:-translate-y-0.5"
            >
              {tr('landing.hero.explore')}
            </button>
          </div>

          <p className="mt-3 text-[0.8rem] text-[#6B5645]">
            {tr('landing.hero.freeNote')}
          </p>

          <div className="mt-10 flex flex-wrap items-start gap-8 sm:gap-12">
            {['stat1', 'stat2', 'stat3'].map((key) => (
              <div key={key}>
                <p className="font-display text-2xl sm:text-3xl font-semibold text-[#1E2A24]">
                  {tr(`landing.hero.${key}Value`)}
                </p>
                <p className="mt-1 max-w-[9rem] text-[0.75rem] leading-snug text-[#6B5645]">
                  {tr(`landing.hero.${key}Label`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
