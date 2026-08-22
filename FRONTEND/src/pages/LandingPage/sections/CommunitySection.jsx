import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import { ArrowRight, Users } from 'lucide-react';

import contactBg from '../../../assets/contact.png';
import PhoneMockup from './components/PhoneMockup';

const CommunitySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t: tr } = useI18n();

  const userName = user?.displayName || user?.name || 'Laiba';

  return (
    <section
      id="community"
      className="relative w-full overflow-visible bg-[var(--cream-soft)] px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-10 lg:px-10 lg:pt-9 lg:pb-12"
    >
      {/* Phone animations & 3D Glass Specular Effects */}
      <style>{`
        @keyframes floatPhoneSlender {
          0%, 100% {
            transform: rotate(6deg) translateY(0px);
          }
          50% {
            transform: rotate(7.5deg) translateY(-12px);
          }
        }

        @keyframes pulseGlowSoft {
          0%, 100% {
            opacity: 0.85;
            filter: drop-shadow(0 0 2px rgba(53,110,70,0.35));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 6px rgba(53,110,70,0.85));
          }
        }

        @keyframes glassShimmerSweep {
          0% {
            transform: translateX(-160%) translateY(-160%) rotate(38deg);
            opacity: 0;
          }
          20% {
            opacity: 0.55;
          }
          45% {
            transform: translateX(160%) translateY(160%) rotate(38deg);
            opacity: 0;
          }
          100% {
            transform: translateX(160%) translateY(160%) rotate(38deg);
            opacity: 0;
          }
        }

        .animate-phone-float-slender {
          animation: floatPhoneSlender 5.5s ease-in-out infinite;
        }

        .animate-glow-soft {
          animation: pulseGlowSoft 3s ease-in-out infinite;
        }

        .animate-glass-sweep {
          animation: glassShimmerSweep 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Main wrapper */}
      <div className="relative mx-auto w-full max-w-[1400px]">

        {/* MAIN BANNER */}
        <div
          className="
            relative
            min-h-[150px]
            w-full
            rounded-[24px]
            sm:rounded-[30px]
            lg:min-h-[170px]
            lg:rounded-[36px]
            shadow-[0_12px_40px_rgba(25,38,28,0.09)]
            overflow-visible
          "
        >
          {/* Background image & gradient overlay */}
          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-[24px]
              sm:rounded-[30px]
              lg:rounded-[36px]
              bg-[#DCE7D8]
              bg-cover
              bg-right
              bg-no-repeat
            "
            style={{
              backgroundImage: `url(${contactBg})`,
            }}
          >
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-[#BDCAA1]
                via-[#BDCAA1]/90
                to-transparent
                sm:w-4/5
                lg:w-3/4
              "
            />
          </div>

          {/* Banner content */}
          <div
            className="
              relative
              z-10
              px-5
              py-3.5
              sm:px-8
              sm:py-4.5
              md:px-10
              lg:px-12
              lg:py-5
            "
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">

              {/* LEFT SIDE TEXT */}
              <div className="flex flex-col items-start justify-center">

                {/* Tag pill */}
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#3D5A45]/30
                    bg-white/40
                    px-2.5
                    py-0.5
                    text-[10.5px]
                    font-bold
                    uppercase
                    tracking-widest
                    text-[#273B2C]
                    backdrop-blur-xs
                    shadow-2xs
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#273B2C] animate-pulse" />
                  <span>
                    {tr('landing.connectBanner.tag') === 'landing.connectBanner.tag'
                      ? 'COMMUNITY & SUPPORT'
                      : tr('landing.connectBanner.tag')}
                  </span>
                </div>

                {/* Heading */}
                <h2
                  className="
                    mt-2
                    font-serif
                    text-[1.6rem]
                    font-normal
                    leading-[1.08]
                    tracking-tight
                    text-[#14231A]
                    sm:text-[1.95rem]
                    md:text-[2.2rem]
                    lg:text-[2.35rem]
                  "
                >
                  {tr('landing.connectBanner.title') || 'Connect with people who truly understand.'}
                </h2>

                <p
                  className="
                    mt-2
                    max-w-[450px]
                    text-[0.85rem]
                    leading-relaxed
                    text-[#334639]
                    sm:text-[0.9rem]
                  "
                >
                  {tr('landing.connectBanner.subtitle') === 'landing.connectBanner.subtitle'
                    ? 'Join a supportive peer community to share daily routines, exchange recipes & tips, ask questions, and never feel alone on your journey.'
                    : tr('landing.connectBanner.subtitle')}
                </p>

                {/* Buttons */}
                <div
                  className="
                    mt-4
                    flex
                    w-full
                    flex-wrap
                    items-center
                    gap-2.5
                    sm:mt-4.5
                    sm:w-auto
                  "
                >
                  <button
                    type="button"
                    onClick={() => navigate('/community')}
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2.5
                      rounded-full
                      bg-[#14231A]
                      px-7
                      py-3.5
                      text-[0.95rem]
                      font-semibold
                      text-white
                      shadow-md
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-[#27392E]
                      hover:shadow-lg
                      active:scale-[0.98]
                      sm:w-auto
                      cursor-pointer
                    "
                  >
                    <Users size={16} />
                    <span>
                      {user
                        ? 'Open Community Feed'
                        : 'Explore Community Preview'}
                    </span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(user ? '/dashboard' : '/register')}
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#14231A]/30
                      bg-white/60
                      px-7
                      py-3.5
                      text-[0.95rem]
                      font-semibold
                      text-[#14231A]
                      backdrop-blur-sm
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-[#14231A]/60
                      hover:bg-white/90
                      active:scale-[0.98]
                      sm:w-auto
                      cursor-pointer
                    "
                  >
                    <span>{user ? 'My Dashboard' : 'Sign Up Free'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE PHONE (Modular 3D Parallax Subcomponent) */}
              <PhoneMockup userName={userName} />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;