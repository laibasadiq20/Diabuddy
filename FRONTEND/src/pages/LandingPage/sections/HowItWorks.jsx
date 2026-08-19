import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Home,
  PlusCircle,
  Users,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  X,
  Footprints,
  Clock,
  ArrowRight,
  Maximize2,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import { useAuth } from '../../../context/AuthContext';

const HowItWorks = ({ videoSrc }) => {
  const { t: tr } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active step (0 to 3)
  const [activeStep, setActiveStep] = useState(0);
  // View mode inside right frame: 'dashboard' or 'video'
  const [viewMode, setViewMode] = useState('dashboard');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const videoTimerRef = useRef(null);
  const videoElementRef = useRef(null);

  const stepsData = [
    {
      id: 1,
      number: '01',
      title: tr('landing.howItWorks.steps.step1.title') || 'Track your health',
      description:
        tr('landing.howItWorks.steps.step1.description') ||
        'Log your glucose, meals, medication and how you feel.',
      timestamp: '0:00',
    },
    {
      id: 2,
      number: '02',
      title: tr('landing.howItWorks.steps.step2.title') || 'Understand your patterns',
      description:
        tr('landing.howItWorks.steps.step2.description') ||
        'DiaBuddy turns your data into easy to understand insights.',
      timestamp: '0:35',
    },
    {
      id: 3,
      number: '03',
      title: tr('landing.howItWorks.steps.step3.title') || 'Learn and grow',
      description:
        tr('landing.howItWorks.steps.step3.description') ||
        'Explore clear, evidence-informed articles and tips at your own pace.',
      timestamp: '1:10',
    },
    {
      id: 4,
      number: '04',
      title: tr('landing.howItWorks.steps.step4.title') || 'Connect and stay motivated',
      description:
        tr('landing.howItWorks.steps.step4.description') ||
        'Join conversations and support others on the same journey.',
      timestamp: '1:45',
    },
  ];

  // Video progress simulation if no real video is loaded
  useEffect(() => {
    if (isVideoPlaying && !videoSrc) {
      videoTimerRef.current = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 150);
    } else {
      clearInterval(videoTimerRef.current);
    }
    return () => clearInterval(videoTimerRef.current);
  }, [isVideoPlaying, videoSrc]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const orig = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handlePrev = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : stepsData.length - 1));
  };

  const handleNext = () => {
    setActiveStep((prev) => (prev < stepsData.length - 1 ? prev + 1 : 0));
  };

  const handleStepClick = (index, openMobileModal = true) => {
    setActiveStep(index);
    if (openMobileModal && window.innerWidth < 1024) {
      setIsModalOpen(true);
      setIsVideoPlaying(true);
    }
  };

  const toggleVideoPlay = () => {
    if (videoElementRef.current && videoSrc) {
      if (videoElementRef.current.paused) {
        videoElementRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoElementRef.current.pause();
        setIsVideoPlaying(false);
      }
    } else {
      setIsVideoPlaying((prev) => !prev);
    }
  };

  // Video Player Component (Shared between frame and modal)
  const renderVideoPlayer = (isInsideModal = false) => {
    return (
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-xl bg-[#0F1712] text-white">
        {/* Real video if provided, or animated mockup walkthrough video */}
        {videoSrc ? (
          <video
            ref={videoElementRef}
            src={videoSrc}
            className="h-full w-full object-contain"
            controls
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          />
        ) : (
          <div className="relative flex flex-1 flex-col items-center justify-center p-6 text-center">
            {/* Background animated grid / glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#233D2D]/60 via-[#132018]/80 to-[#0A120E]" />

            {/* Content overlay */}
            <div className="relative z-10 max-w-md">
              <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-[#BDCAA1] text-[#14231A] shadow-lg shadow-[#BDCAA1]/20">
                <Play size={24} className="ml-1" fill="#14231A" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#BDCAA1] backdrop-blur-sm">
                <Film size={12} /> Video Mockup Preview · 2 mins
              </span>

              <h4 className="mt-3 font-serif text-lg sm:text-xl font-normal text-white">
                How to Use DiaBuddy Walkthrough
              </h4>

              <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
                Instructional walkthrough video placeholder. Once generated, your custom video file will play seamlessly right here.
              </p>

              {/* Step indicator pills */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {stepsData.map((s, idx) => (
                  <span
                    key={s.id}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeStep === idx ? 'w-6 bg-[#BDCAA1]' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4">
              {/* Scrubber */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  setVideoProgress(pct);
                }}
                className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/20 overflow-hidden mb-2.5"
              >
                <div
                  className="h-full rounded-full bg-[#BDCAA1] transition-all duration-100"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/80">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleVideoPlay}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                  >
                    {isVideoPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVideoProgress(0);
                      setIsVideoPlaying(true);
                    }}
                    className="text-white/60 hover:text-white"
                    title="Restart"
                  >
                    <RotateCcw size={12} />
                  </button>

                  <span className="font-mono text-[11px] text-white/70">
                    {Math.floor((videoProgress / 100) * 135)}s / 2:15
                  </span>
                </div>

                {!isInsideModal && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-white hover:bg-white/20"
                  >
                    <Maximize2 size={11} />
                    <span>Fullscreen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // The Exact High-Fidelity App Dashboard Mockup (Matching the reference screenshot)
  const renderDashboardScreen = () => {
    return (
      <div className="flex h-full w-full rounded-xl bg-[#F6F4EE] text-[#1E2A24] overflow-hidden shadow-inner select-none font-sans">
        {/* Left Mini Sidebar Strip */}
        <div className="flex flex-col items-center justify-between border-r border-[#E6E0D2] bg-[#EBE7DC]/60 py-3.5 px-2 sm:px-3">
          <div className="flex flex-col items-center gap-4">
            {/* DiaBuddy Heart Logo */}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-xs">
              <Heart size={12} fill="#FFFFFF" color="#FFFFFF" />
            </div>

            {/* Sidebar Icons */}
            <div className="flex flex-col items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#243B2C] shadow-xs">
                <Home size={13} strokeWidth={2.2} />
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5A544A] hover:bg-black/5 transition-colors">
                <PlusCircle size={13} />
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5A544A] hover:bg-black/5 transition-colors">
                <Users size={13} />
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5A544A] hover:bg-black/5 transition-colors">
                <BookOpen size={13} />
              </span>
            </div>
          </div>

          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5A544A]">
            <Settings size={13} />
          </span>
        </div>

        {/* Main Dashboard Canvas */}
        <div className="flex-1 p-3.5 sm:p-4.5 overflow-hidden flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#1E2A24]">
              Dashboard
            </h4>
            <span className="rounded-full bg-[#E5DFCE] px-2.5 py-0.5 text-[9px] font-bold tracking-wide text-[#3D5A45]">
              Live Preview
            </span>
          </div>

          {/* Grid Layout inside Dashboard */}
          <div className="grid grid-cols-12 gap-2.5 flex-1 items-start">
            
            {/* Left Area (8 Cols): Top 3 Metric Cards + Bottom Trends Chart */}
            <div className="col-span-12 sm:col-span-8 flex flex-col gap-2.5">
              {/* 3 Metric Cards Row */}
              <div className="grid grid-cols-3 gap-2">
                
                {/* Glucose Card */}
                <div className="rounded-xl border border-[#E8E2D4] bg-white p-2.5 shadow-xs">
                  <div className="flex items-center justify-between text-[8.5px] font-semibold text-[#7A746B]">
                    <span>Glucose (mg/dL)</span>
                    <span>▾</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-serif text-lg sm:text-xl font-extrabold text-[#1E2A24]">
                      108
                    </span>
                    <span className="rounded-full bg-[#E3EDE0] px-1.5 py-0.2 text-[8px] font-bold text-[#2E6B3E]">
                      Normal
                    </span>
                  </div>
                  {/* Mini Sparkline */}
                  <div className="mt-1.5 h-4 w-full">
                    <svg viewBox="0 0 80 18" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                      <path
                        d="M0,12 Q20,16 40,8 T80,10"
                        fill="none"
                        stroke="#5A8A67"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Carbs Card */}
                <div className="rounded-xl border border-[#E8E2D4] bg-white p-2.5 shadow-xs flex flex-col justify-between">
                  <span className="text-[8.5px] font-semibold text-[#7A746B]">Carbs (g)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-serif text-lg sm:text-xl font-extrabold text-[#1E2A24]">
                      142
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5E8D8] text-[#C2724F]">
                      <Heart size={10} fill="currentColor" />
                    </span>
                  </div>
                </div>

                {/* Steps Card */}
                <div className="rounded-xl border border-[#E8E2D4] bg-white p-2.5 shadow-xs flex flex-col justify-between">
                  <span className="text-[8.5px] font-semibold text-[#7A746B]">Steps</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-serif text-lg sm:text-xl font-extrabold text-[#1E2A24]">
                      4,350
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E0EBE2] text-[#3D7A50]">
                      <Footprints size={10} />
                    </span>
                  </div>
                </div>

              </div>

              {/* Trends Chart Card */}
              <div className="rounded-xl border border-[#E8E2D4] bg-white p-2.5 sm:p-3 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-bold text-[#1E2A24]">Your trends</span>
                  <span className="rounded-md bg-[#F2EDE2] px-2 py-0.5 text-[8.5px] font-semibold text-[#665F52]">
                    This Week ▾
                  </span>
                </div>

                {/* Spline Graph */}
                <div className="relative h-20 sm:h-24 w-full my-1">
                  <svg viewBox="0 0 280 80" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="dashboardTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4A7E58" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#4A7E58" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="20" x2="280" y2="20" stroke="#ECE6D8" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="50" x2="280" y2="50" stroke="#ECE6D8" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Gradient fill below wave */}
                    <path
                      d="M 10 58 Q 45 42 80 50 T 150 25 T 215 54 T 270 36 L 270 80 L 10 80 Z"
                      fill="url(#dashboardTrendGradient)"
                    />

                    {/* Main smooth curved green spline */}
                    <path
                      d="M 10 58 Q 45 42 80 50 T 150 25 T 215 54 T 270 36"
                      fill="none"
                      stroke="#3D704C"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    {/* 7 Data points */}
                    <circle cx="10" cy="58" r="3.2" fill="#FFFFFF" stroke="#3D704C" strokeWidth="2" />
                    <circle cx="50" cy="46" r="3.2" fill="#FFFFFF" stroke="#3D704C" strokeWidth="2" />
                    <circle cx="95" cy="52" r="3.2" fill="#FFFFFF" stroke="#3D704C" strokeWidth="2" />
                    <circle cx="150" cy="25" r="3.5" fill="#3D704C" />
                    <circle cx="190" cy="40" r="3.2" fill="#FFFFFF" stroke="#3D704C" strokeWidth="2" />
                    <circle cx="230" cy="52" r="3.2" fill="#FFFFFF" stroke="#3D704C" strokeWidth="2" />
                    <circle cx="270" cy="36" r="3.2" fill="#FFFFFF" stroke="#3D704C" strokeWidth="2" />
                  </svg>
                </div>

                {/* X-axis days */}
                <div className="flex items-center justify-between pt-1 text-[8.5px] font-medium text-[#7A746B]">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span className="font-bold text-[#2E6B3E]">Sun</span>
                </div>
              </div>
            </div>

            {/* Right Area (4 Cols): Upcoming & Recent Log & New Log Button */}
            <div className="col-span-12 sm:col-span-4 flex flex-col gap-2">
              
              {/* Upcoming Box */}
              <div className="rounded-xl border border-[#E8E2D4] bg-white p-2.5 shadow-xs">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#7A746B] mb-1.5">
                  Upcoming
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-lg bg-[#FAF8F3] p-1.5 text-[9px]">
                    <div>
                      <p className="font-bold text-[#1E2A24]">Take medication</p>
                      <p className="text-[7.5px] text-[#7A746B]">After breakfast · 10:00 AM</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#FAF8F3] p-1.5 text-[9px]">
                    <div>
                      <p className="font-bold text-[#1E2A24]">Log your lunch</p>
                      <p className="text-[7.5px] text-[#7A746B]">2:00 PM</p>
                    </div>
                    <ChevronRight size={11} className="text-[#7A746B]" />
                  </div>
                </div>
              </div>

              {/* Recent Log Box */}
              <div className="rounded-xl border border-[#E8E2D4] bg-white p-2.5 shadow-xs">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#7A746B] mb-1.5">
                  Recent log
                </p>
                <div className="space-y-1 text-[9px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E2A24]">Breakfast</p>
                      <p className="text-[7.5px] text-[#7A746B]">Oatmeal, Egg, Milk</p>
                    </div>
                    <span className="text-[7.5px] text-[#7A746B]">8:30 AM</span>
                  </div>
                  <div className="h-px bg-black/5" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1E2A24]">Glucose</p>
                      <p className="text-[7.5px] text-[#2E6B3E] font-bold">108 mg/dL</p>
                    </div>
                    <span className="text-[7.5px] text-[#7A746B]">7:15 AM</span>
                  </div>
                </div>
              </div>

              {/* New Log Action Button */}
              <button
                type="button"
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="w-full rounded-xl bg-[#1E2E24] py-2 text-center text-[10px] font-bold text-white shadow-xs transition-colors hover:bg-[#283F31]"
              >
                + New log
              </button>

            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="about"
      className="relative w-full bg-[var(--cream-soft)] px-4 sm:px-6 lg:px-10 py-10 sm:py-16"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        
        {/* =========================================================
            MAIN HOW IT WORKS CARD (Matching Reference Image)
            Dark forest green container with rounded corners and carousel arrows
        ========================================================== */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[38px] lg:rounded-[48px] border border-[#2B4434] bg-[#1B2C21] p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(15,28,20,0.3)]">
          
          {/* Subtle background ambient light */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#BDCAA1]/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#E7DCCB]/10 blur-[100px]" />

          {/* Inner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* =====================================================
                LEFT COLUMN: Kicker, Title & 4 Connected Timeline Steps
            ====================================================== */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              
              {/* Kicker & Main Headline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-[#BDCAA1]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#BDCAA1]">
                    {tr('landing.howItWorks.kicker') || 'HOW IT WORKS'}
                  </span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-normal leading-[1.12] tracking-tight text-white">
                  {tr('landing.howItWorks.headingStart') || 'A simple way to'}{' '}
                  <br className="hidden sm:inline" />
                  <span className="italic font-light text-[#E8DFD0]">
                    {tr('landing.howItWorks.headingEmphasis') || 'better health.'}
                  </span>
                </h2>
              </div>

              {/* 4-Step Vertical Connected Timeline */}
              <div className="relative mt-8 sm:mt-10 space-y-6 sm:space-y-7 before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[1.5px] before:bg-white/20">
                {stepsData.map((step, index) => {
                  const isActive = activeStep === index;

                  return (
                    <div
                      key={step.id}
                      onClick={() => handleStepClick(index, true)}
                      className={`group relative flex items-start gap-4 cursor-pointer transition-all duration-300 ${
                        isActive ? 'opacity-100 translate-x-1' : 'opacity-70 hover:opacity-90'
                      }`}
                    >
                      {/* Step Number Circle (Over the continuous timeline) */}
                      <div
                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-[#BDCAA1] text-[#14231A] ring-4 ring-[#1B2C21] shadow-md scale-110'
                            : 'border border-white/40 bg-[#1B2C21] text-white/90 group-hover:border-white'
                        }`}
                      >
                        {step.number}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3
                          className={`text-base sm:text-[1.05rem] font-semibold tracking-tight transition-colors ${
                            isActive ? 'text-white' : 'text-white/90 group-hover:text-white'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-white/65 max-w-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Video Action Trigger */}
              <div className="mt-8 flex sm:hidden items-center justify-between rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/10">
                <div>
                  <p className="text-xs font-bold text-white">Watch Tutorial Video</p>
                  <p className="text-[10px] text-white/60">2 mins step-by-step walkthrough</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsVideoPlaying(true);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-[#BDCAA1] px-3.5 py-1.5 text-xs font-bold text-[#14231A]"
                >
                  <Play size={11} fill="#14231A" />
                  <span>Play</span>
                </button>
              </div>

            </div>

            {/* =====================================================
                RIGHT COLUMN: Tablet Mockup Frame with Dashboard & Video Toggle
            ====================================================== */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              
              {/* Outer Tablet / Device Screen Frame */}
              <div className="relative w-full rounded-2xl sm:rounded-3xl border border-white/15 bg-[#142219] p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-md">
                
                {/* Mode Switcher Pills (Dashboard View vs Mockup Video View) */}
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 rounded-lg bg-black/30 p-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() => setViewMode('dashboard')}
                      className={`rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                        viewMode === 'dashboard'
                          ? 'bg-[#2E4A37] text-white shadow-xs'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Interactive Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('video')}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                        viewMode === 'video'
                          ? 'bg-[#2E4A37] text-white shadow-xs'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Film size={11} />
                      <span>Video Mode</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(true);
                      setIsVideoPlaying(true);
                    }}
                    className="hidden sm:flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#BDCAA1] hover:bg-white/15"
                  >
                    <Play size={10} fill="currentColor" />
                    <span>Watch Fullscreen</span>
                  </button>
                </div>

                {/* Display Screen */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9.5] w-full overflow-hidden rounded-xl bg-[#F6F4EE]">
                  {viewMode === 'dashboard' ? renderDashboardScreen() : renderVideoPlayer(false)}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =========================================================
            CENTERED VIDEO MODAL / POP-UP (Mobile & Desktop)
        ========================================================== */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Modal Box */}
            <div
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-[#BDCAA1]/30 bg-[#14211A] shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-black/30">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#BDCAA1] font-serif text-xs font-bold text-[#14231A]">
                    {stepsData[activeStep].number}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      {stepsData[activeStep].title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-white/60">
                      DiaBuddy Instructional Video Walkthrough
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close video"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full">
                {renderVideoPlayer(true)}
              </div>

              {/* Bottom Step Switcher */}
              <div className="border-t border-white/10 bg-black/40 p-3 sm:p-4">
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {stepsData.map((step, idx) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleStepClick(idx, false)}
                      className={`flex flex-col items-center justify-center rounded-xl p-2 transition-all ${
                        activeStep === idx
                          ? 'bg-[#2E4A37] text-white ring-1 ring-[#BDCAA1]/40'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-[9px] sm:text-[10px] font-bold opacity-75">
                        Step {step.number}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold truncate w-full text-center">
                        {step.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default HowItWorks;
