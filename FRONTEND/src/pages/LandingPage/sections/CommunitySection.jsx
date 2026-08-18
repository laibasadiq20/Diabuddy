import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import {
  ArrowRight,
  Bell,
  Menu,
  Droplets,
  Utensils,
  Activity,
} from 'lucide-react';
import contactBg from '../../../assets/contact.png';

const CommunitySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t: tr } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const handleExplore = () => {
    const el = document.getElementById('features') || document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/learn/warning-signs');
    }
  };

  const userName = user?.displayName || user?.name || 'Laiba';

  return (
    <section
      id="community"
      className="relative w-full overflow-visible bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 pt-8 pb-12 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-16"
    >
      {/* Inline styles for custom phone floating animations */}
      <style>{`
        @keyframes floatPhoneSlender {
          0%, 100% {
            transform: rotate(6.5deg) translateY(0px);
          }
          50% {
            transform: rotate(7.8deg) translateY(-14px);
          }
        }
        @keyframes pulseGlowSoft {
          0%, 100% {
            opacity: 0.85;
            filter: drop-shadow(0 0 2px rgba(53,110,70,0.35));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 5px rgba(53,110,70,0.75));
          }
        }
        .animate-phone-float-slender {
          animation: floatPhoneSlender 5.5s ease-in-out infinite;
        }
        .animate-glow-soft {
          animation: pulseGlowSoft 3s ease-in-out infinite;
        }
      `}</style>

      {/* Screen-Fitted Long Banner Wrapper */}
      <div className="relative mx-auto w-full max-w-[1400px]">
        

        {/* Main Banner Card (Fitted to screen, using contact.png background) */}
        <div
          className="relative w-full overflow-visible rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] shadow-[0_16px_50px_rgba(25,38,28,0.11)] px-6 py-5 sm:px-10 sm:py-6 lg:px-16 lg:py-7 min-h-[200px] lg:min-h-[220px] flex items-center bg-cover bg-center"
          style={{
            backgroundImage: `url(${contactBg})`,
            backgroundColor: '#C5D8BE',
          }}
        >
          <div className="w-full grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            
            {/* Left Column: Heading, Subtitle & Action Buttons */}
            <div className="flex flex-col items-start z-10 max-w-xl">
              <h2 className="font-serif text-[2.2rem] font-normal leading-[1.12] tracking-tight text-[#14231A] sm:text-4xl md:text-[2.75rem] lg:text-[3.15rem]">
                Ready to take control <br className="hidden sm:inline" />
                of your health?
              </h2>

              <p className="mt-4 max-w-[450px] text-[0.95rem] leading-relaxed text-[#334639] sm:mt-5 sm:text-base md:text-[1.05rem]">
                {tr('landing.connectBanner.subtitle') === 'landing.connectBanner.subtitle'
                  ? 'Join a welcoming community to track logs, share experiences, and receive gentle guidance on your diabetes journey.'
                  : tr('landing.connectBanner.subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-9 sm:gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#14231A] px-7 py-3.5 text-[0.95rem] font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#27392E] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto"
                >
                  <span>
                    {tr('landing.connectBanner.getStarted') === 'landing.connectBanner.getStarted'
                      ? 'Get Started Free'
                      : tr('landing.connectBanner.getStarted')}
                  </span>
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={handleExplore}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#14231A]/30 bg-white/60 backdrop-blur-sm px-7 py-3.5 text-[0.95rem] font-semibold text-[#14231A] transition-all duration-300 hover:border-[#14231A]/60 hover:bg-white/90 hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto"
                >
                  {tr('landing.connectBanner.exploreFeatures') === 'landing.connectBanner.exploreFeatures'
                    ? 'Explore Features'
                    : tr('landing.connectBanner.exploreFeatures')}
                </button>
              </div>
            </div>

            {/* Right Column: Thin & Long Mobile Mockup Centered Directly on the Image Circle (Desktop only, hidden on mobile) */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div
                className="relative z-20 flex items-center justify-center lg:-mt-16 xl:-mt-20 lg:-mb-8 -translate-x-6 lg:-translate-x-15 xl:-translate-x-8 pointer-events-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Thin & Long Flagship Aspect Ratio Smartphone (Slender 240px - 260px width) */}
                <div
                  className={`relative w-[210px] sm:w-[222px] lg:w-[230px] transition-all duration-500 ${
                    isHovered
                      ? 'scale-[1.03] rotate-[5.5deg] -translate-y-2'
                      : 'animate-phone-float-slender'
                  }`}
                >
                  {/* Ultra-Slim Champagne Gold Bezel Chassis */}
                  <div className="rounded-[38px] bg-gradient-to-b from-[#EBDCC7] via-[#D5C0A3] to-[#B39371] p-[3px] shadow-[0_25px_55px_-10px_rgba(15,28,20,0.42)]">
                    {/* Inner Black OLED Bezel */}
                    <div className="rounded-[35px] bg-[#121214] p-[5px]">
                      {/* App Screen Canvas (Elongated Vertical Aspect Ratio) */}
                      <div className="overflow-hidden rounded-[30px] bg-[#FAF8F5] px-3.5 py-3 text-[#1E2A24] shadow-inner select-none flex flex-col justify-between min-h-[420px]">
                        
                        {/* 1. Top Header */}
                        <div>
                          <div className="flex items-center justify-between">
                            <Menu size={15} className="text-[#4F4A42]" />
                            <div className="flex items-center gap-1.5">
                              <div className="relative">
                                <Bell size={14} className="text-[#4F4A42]" />
                                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#C25B3E] animate-ping" />
                                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#C25B3E]" />
                              </div>
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DED6C7] text-[9.5px] font-bold text-[#4A4237]">
                                {userName.charAt(0)}
                              </div>
                            </div>
                          </div>

                          {/* App Greeting */}
                          <div className="mt-2.5">
                            <p className="text-[12px] font-bold text-[#1E2A24] leading-tight">
                              Good morning, {userName}! 🌿
                            </p>
                            <p className="text-[8.5px] text-[#7A746B] mt-0.5">
                              Here's your health overview for today.
                            </p>
                          </div>
                        </div>

                        {/* 2. Today's Glucose Card */}
                        <div className="my-2 rounded-2xl border border-[#ECE5DB] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-semibold text-[#5A544C]">
                              Today's Glucose
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6EFE5] px-2 py-0.5 text-[8.5px] font-bold text-[#2E6B3E]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#2E6B3E] animate-pulse" />
                              In Range
                            </span>
                          </div>

                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold tracking-tight text-[#1E2A24]">
                              108
                            </span>
                            <span className="text-[9.5px] font-medium text-[#7A746B]">
                              mg/dL
                            </span>
                          </div>

                          {/* Smooth Glucose Wave Curve */}
                          <div className="mt-1.5">
                            <svg
                              viewBox="0 0 200 46"
                              className="h-10 w-full overflow-visible"
                            >
                              <defs>
                                <linearGradient
                                  id="slenderChartGradient"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="#356E46"
                                    stopOpacity="0.25"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="#356E46"
                                    stopOpacity="0.0"
                                  />
                                </linearGradient>
                              </defs>
                              <path
                                d="M0,32 C35,28 65,12 100,16 C135,20 165,8 200,14 L200,46 L0,46 Z"
                                fill="url(#slenderChartGradient)"
                              />
                              <path
                                d="M0,32 C35,28 65,12 100,16 C135,20 165,8 200,14"
                                fill="none"
                                stroke="#356E46"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              />
                              <circle
                                cx="165"
                                cy="10"
                                r="3.5"
                                fill="#356E46"
                                className="animate-glow-soft"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* 3. Quick Metrics 2-Column Grid */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="rounded-xl border border-[#ECE5DB] bg-white p-2 shadow-sm">
                            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-[#7A746B]">
                              <Droplets size={10} className="text-[#3E7B99]" />
                              <span>Insulin</span>
                            </div>
                            <p className="mt-0.5 text-xs font-bold text-[#1E2A24]">
                              4.5 <span className="text-[7.5px] font-normal text-[#7A746B]">units</span>
                            </p>
                          </div>

                          <div className="rounded-xl border border-[#ECE5DB] bg-white p-2 shadow-sm">
                            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-[#7A746B]">
                              <Utensils size={10} className="text-[#C2724F]" />
                              <span>Carbs</span>
                            </div>
                            <p className="mt-0.5 text-xs font-bold text-[#1E2A24]">
                              42 <span className="text-[7.5px] font-normal text-[#7A746B]">grams</span>
                            </p>
                          </div>
                        </div>

                        {/* 4. Activity / Routine Summary Card */}
                        <div className="mt-1.5 rounded-xl border border-[#ECE5DB] bg-white p-2.5 shadow-sm">
                          <div className="flex items-center justify-between text-[8.5px] font-semibold text-[#7A746B]">
                            <div className="flex items-center gap-1">
                              <Activity size={10} className="text-[#356E46]" />
                              <span>Activity Score</span>
                            </div>
                            <span className="text-[8px] font-bold text-[#2E6B3E]">82 / 100 · Great</span>
                          </div>
                          {/* Progress Bars */}
                          <div className="mt-1.5 flex gap-1 h-1.5 w-full">
                            <div className="h-full w-2/3 rounded-full bg-[#356E46]" />
                            <div className="h-full w-1/3 rounded-full bg-[#D4E2D1]" />
                          </div>
                        </div>

                        {/* 5. Sleek Bottom Home Indicator Bar */}
                        <div className="mt-2.5 flex justify-center">
                          <div className="h-1 w-16 rounded-full bg-[#D6CEC2]" />
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
