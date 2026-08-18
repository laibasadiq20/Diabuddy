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
  Users,
} from 'lucide-react';

import contactBg from '../../../assets/contact.png';

const CommunitySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t: tr } = useI18n();

  const [isHovered, setIsHovered] = useState(false);

  const handleExplore = () => {
    const el =
      document.getElementById('features') ||
      document.getElementById('about');

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      navigate('/learn/warning-signs');
    }
  };

  const userName = user?.displayName || user?.name || 'Laiba';

  return (
    <section
      id="community"
      className="relative w-full overflow-visible bg-[var(--cream-soft)] px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-14 lg:px-10 lg:pt-12 lg:pb-16"
    >
      {/* Phone animations */}
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

      {/* Main wrapper */}
      <div className="relative mx-auto w-full max-w-[1400px]">

        {/* =========================================================
            MAIN BANNER
        ========================================================== */}
        <div
          className="
            relative
            min-h-[200px]
            w-full
            rounded-[28px]
            sm:rounded-[36px]
            lg:min-h-[220px]
            lg:rounded-[42px]
            shadow-[0_16px_50px_rgba(25,38,28,0.11)]
            overflow-visible
          "
        >

          {/* =====================================================
              BACKGROUND IMAGE
              This layer fills the banner properly.
          ====================================================== */}
          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-[28px]
              sm:rounded-[36px]
              lg:rounded-[42px]
              border
              border-[#B5CBB0]
            "
            style={{
              backgroundImage: `url(${contactBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#C5D8BE',
            }}
          />

          {/* Subtle readability overlay */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-[28px]
              sm:rounded-[36px]
              lg:rounded-[42px]
            "
            style={{
              background:
                'linear-gradient(90deg, rgba(197,216,190,0.12) 0%, rgba(197,216,190,0.03) 60%, rgba(197,216,190,0) 100%)',
            }}
          />

          {/* =====================================================
              CONTENT
          ====================================================== */}
          <div
            className="
              relative
              z-10
              flex
              min-h-[200px]
              w-full
              items-center
              px-6
              py-5
              sm:px-10
              sm:py-6
              lg:min-h-[220px]
              lg:px-16
              lg:py-7
            "
          >
            <div
              className="
                grid
                w-full
                items-center
                gap-8
                lg:grid-cols-[1.1fr_0.9fr]
                lg:gap-12
              "
            >

              {/* =================================================
                  LEFT CONTENT
              ================================================== */}
              <div className="z-10 flex max-w-xl flex-col items-start">

                {/* Kicker badge */}
                <div className="mb-3 flex items-center gap-2 rounded-full border border-[#14231A]/15 bg-white/50 px-3 py-1 backdrop-blur-sm">
                  <Users size={13} className="text-[#255230]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#255230]">
                    Diabuddy Community
                  </span>
                </div>

                <h2
                  className="
                    font-serif
                    text-[2.2rem]
                    font-normal
                    leading-[1.12]
                    tracking-tight
                    text-[#14231A]
                    sm:text-4xl
                    md:text-[2.75rem]
                    lg:text-[3.15rem]
                  "
                >
                  Connect with people who
                  <br className="hidden sm:inline" />
                  {' '}truly understand.
                </h2>

                <p
                  className="
                    mt-4
                    max-w-[460px]
                    text-[0.95rem]
                    leading-relaxed
                    text-[#334639]
                    sm:mt-5
                    sm:text-base
                    md:text-[1.05rem]
                  "
                >
                  {tr('landing.connectBanner.subtitle') ===
                  'landing.connectBanner.subtitle'
                    ? 'Join a supportive peer community to share daily routines, exchange recipes & tips, ask questions, and never feel alone on your journey.'
                    : tr('landing.connectBanner.subtitle')}
                </p>

                {/* Buttons */}
                <div
                  className="
                    mt-8
                    flex
                    w-full
                    flex-wrap
                    items-center
                    gap-3.5
                    sm:mt-9
                    sm:w-auto
                    sm:gap-4
                  "
                >
                  {/* Join Community CTA */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(user ? '/community' : '/login')
                    }
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
                    "
                  >
                    <Users size={16} />
                    <span>
                      {user
                        ? 'Open Community Feed'
                        : 'Join the Community'}
                    </span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Explore / Feed Preview */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(user ? '/dashboard' : '/login')
                    }
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
                    "
                  >
                    <span>{user ? 'My Dashboard' : 'Member Sign In'}</span>
                  </button>
                </div>
              </div>

              {/* =================================================
                  RIGHT SIDE PHONE
              ================================================== */}
              <div className="relative hidden items-center justify-center lg:flex">

                <div
                  className="
                    relative
                    z-20
                    flex
                    -translate-x-6
                    items-center
                    justify-center
                    pointer-events-auto
                    lg:-mt-10
                    lg:-mb-5
                    xl:-translate-x-8
                    xl:-mt-12
                    xl:-mb-5
                  "
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >

                  {/* Phone */}
                  <div
                    className={`
                      relative
                      w-[210px]
                      transition-all
                      duration-500
                      sm:w-[222px]
                      lg:w-[230px]
                      ${
                        isHovered
                          ? 'scale-[1.03] -translate-y-2 rotate-[5.5deg]'
                          : 'animate-phone-float-slender'
                      }
                    `}
                  >

                    {/* Champagne gold outer frame */}
                    <div
                      className="
                        rounded-[38px]
                        bg-gradient-to-b
                        from-[#EBDCC7]
                        via-[#D5C0A3]
                        to-[#B39371]
                        p-[3px]
                        shadow-[0_25px_55px_-10px_rgba(15,28,20,0.42)]
                      "
                    >

                      {/* Black OLED bezel */}
                      <div className="rounded-[35px] bg-[#121214] p-[5px]">

                        {/* Screen */}
                        <div
                          className="
                            flex
                            min-h-[420px]
                            flex-col
                            justify-between
                            overflow-hidden
                            rounded-[30px]
                            bg-[#FAF8F5]
                            px-3.5
                            py-3
                            text-[#1E2A24]
                            shadow-inner
                            select-none
                          "
                        >

                          {/* ================================
                              HEADER
                          ================================= */}
                          <div>

                            <div className="flex items-center justify-between">

                              <Menu
                                size={15}
                                className="text-[#4F4A42]"
                              />

                              <div className="flex items-center gap-1.5">

                                {/* Notification */}
                                <div className="relative">

                                  <Bell
                                    size={14}
                                    className="text-[#4F4A42]"
                                  />

                                  <span
                                    className="
                                      absolute
                                      -right-0.5
                                      -top-0.5
                                      h-1.5
                                      w-1.5
                                      rounded-full
                                      bg-[#C25B3E]
                                      animate-ping
                                    "
                                  />

                                  <span
                                    className="
                                      absolute
                                      -right-0.5
                                      -top-0.5
                                      h-1.5
                                      w-1.5
                                      rounded-full
                                      bg-[#C25B3E]
                                    "
                                  />

                                </div>

                                {/* User */}
                                <div
                                  className="
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#DED6C7]
                                    text-[9.5px]
                                    font-bold
                                    text-[#4A4237]
                                  "
                                >
                                  {userName.charAt(0)}
                                </div>

                              </div>
                            </div>

                            {/* Greeting */}
                            <div className="mt-2.5">

                              <p
                                className="
                                  text-[12px]
                                  font-bold
                                  leading-tight
                                  text-[#1E2A24]
                                "
                              >
                                Good morning, {userName}! 🌿
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  text-[8.5px]
                                  text-[#7A746B]
                                "
                              >
                                Here's your health overview for today.
                              </p>

                            </div>
                          </div>

                          {/* ================================
                              GLUCOSE
                          ================================= */}
                          <div
                            className="
                              my-2
                              rounded-2xl
                              border
                              border-[#ECE5DB]
                              bg-white
                              p-3
                              shadow-[0_2px_8px_rgba(0,0,0,0.03)]
                            "
                          >

                            <div className="flex items-center justify-between">

                              <span
                                className="
                                  text-[10.5px]
                                  font-semibold
                                  text-[#5A544C]
                                "
                              >
                                Today's Glucose
                              </span>

                              <span
                                className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  bg-[#E6EFE5]
                                  px-2
                                  py-0.5
                                  text-[8.5px]
                                  font-bold
                                  text-[#2E6B3E]
                                "
                              >
                                <span
                                  className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-[#2E6B3E]
                                    animate-pulse
                                  "
                                />

                                In Range
                              </span>

                            </div>

                            <div className="mt-1 flex items-baseline gap-1">

                              <span
                                className="
                                  text-2xl
                                  font-extrabold
                                  tracking-tight
                                  text-[#1E2A24]
                                "
                              >
                                108
                              </span>

                              <span
                                className="
                                  text-[9.5px]
                                  font-medium
                                  text-[#7A746B]
                                "
                              >
                                mg/dL
                              </span>

                            </div>

                            {/* Chart */}
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
                                      stopOpacity="0"
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

                          {/* ================================
                              QUICK METRICS
                          ================================= */}
                          <div className="grid grid-cols-2 gap-1.5">

                            {/* Insulin */}
                            <div
                              className="
                                rounded-xl
                                border
                                border-[#ECE5DB]
                                bg-white
                                p-2
                                shadow-sm
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-1
                                  text-[8.5px]
                                  font-semibold
                                  text-[#7A746B]
                                "
                              >
                                <Droplets
                                  size={10}
                                  className="text-[#3E7B99]"
                                />

                                <span>Insulin</span>
                              </div>

                              <p
                                className="
                                  mt-0.5
                                  text-xs
                                  font-bold
                                  text-[#1E2A24]
                                "
                              >
                                4.5{' '}
                                <span
                                  className="
                                    text-[7.5px]
                                    font-normal
                                    text-[#7A746B]
                                  "
                                >
                                  units
                                </span>
                              </p>

                            </div>

                            {/* Carbs */}
                            <div
                              className="
                                rounded-xl
                                border
                                border-[#ECE5DB]
                                bg-white
                                p-2
                                shadow-sm
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-1
                                  text-[8.5px]
                                  font-semibold
                                  text-[#7A746B]
                                "
                              >
                                <Utensils
                                  size={10}
                                  className="text-[#C2724F]"
                                />

                                <span>Carbs</span>
                              </div>

                              <p
                                className="
                                  mt-0.5
                                  text-xs
                                  font-bold
                                  text-[#1E2A24]
                                "
                              >
                                42{' '}
                                <span
                                  className="
                                    text-[7.5px]
                                    font-normal
                                    text-[#7A746B]
                                  "
                                >
                                  grams
                                </span>
                              </p>

                            </div>

                          </div>

                          {/* ================================
                              ACTIVITY
                          ================================= */}
                          <div
                            className="
                              mt-1.5
                              rounded-xl
                              border
                              border-[#ECE5DB]
                              bg-white
                              p-2.5
                              shadow-sm
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                text-[8.5px]
                                font-semibold
                                text-[#7A746B]
                              "
                            >

                              <div className="flex items-center gap-1">

                                <Activity
                                  size={10}
                                  className="text-[#356E46]"
                                />

                                <span>Activity Score</span>

                              </div>

                              <span
                                className="
                                  text-[8px]
                                  font-bold
                                  text-[#2E6B3E]
                                "
                              >
                                82 / 100 · Great
                              </span>

                            </div>

                            <div className="mt-1.5 flex h-1.5 w-full gap-1">

                              <div
                                className="
                                  h-full
                                  w-2/3
                                  rounded-full
                                  bg-[#356E46]
                                "
                              />

                              <div
                                className="
                                  h-full
                                  w-1/3
                                  rounded-full
                                  bg-[#D4E2D1]
                                "
                              />

                            </div>

                          </div>

                          {/* Home indicator */}
                          <div className="mt-2.5 flex justify-center">

                            <div
                              className="
                                h-1
                                w-16
                                rounded-full
                                bg-[#D6CEC2]
                              "
                            />

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
      </div>
    </section>
  );
};

export default CommunitySection;