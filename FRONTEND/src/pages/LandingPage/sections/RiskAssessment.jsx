import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n/I18nContext";
import secureBg from "../../../assets/secure.png";
import LearnFooter from "./Learn/LearnFooter";
import {
  Users,
  TrendingUp,
  ShieldCheck,
  Activity,
  ArrowRight,
  ChevronLeft,
  Lock,
  RotateCcw,
  CheckCircle2,
  Printer,
  Info,
  Stethoscope,
  ChevronDown,
} from "lucide-react";

const questions = [
  {
    id: 'age',
    helper: 'Age is a primary factor because insulin sensitivity naturally shifts over time.',
    options: [
      { value: 'under40', points: 0 },
      { value: 'from40to49', points: 1 },
      { value: 'from50to59', points: 2 },
      { value: 'over60', points: 3 },
    ],
  },
  {
    id: 'sex',
    helper: 'Men are statistically diagnosed at slightly lower BMI thresholds due to fat distribution.',
    options: [
      { value: 'man', points: 1 },
      { value: 'woman', points: 0 },
    ],
  },
  {
    id: 'gestational',
    onlyIfSex: 'woman',
    helper: 'Gestational diabetes signals temporary insulin resistance during pregnancy that may recur later.',
    options: [
      { value: 'yes', points: 1 },
      { value: 'no', points: 0 },
    ],
  },
  {
    id: 'family',
    helper: 'First-degree genetics (parents/siblings) significantly influence inherited metabolic traits.',
    options: [
      { value: 'yes', points: 1 },
      { value: 'no', points: 0 },
    ],
  },
  {
    id: 'bp',
    helper: 'High blood pressure and insulin resistance frequently co-occur in metabolic health.',
    options: [
      { value: 'yes', points: 1 },
      { value: 'no', points: 0 },
    ],
  },
  {
    id: 'activity',
    helper: 'Physical activity stimulates muscle glucose uptake without requiring extra insulin.',
    options: [
      { value: 'yes', points: 0 },
      { value: 'no', points: 1 },
    ],
  },
  {
    id: 'weight',
    helper: 'Higher body mass index (BMI) is strongly correlated with increased insulin resistance.',
    options: [
      { value: 'normal', points: 0 },
      { value: 'overweight', points: 1 },
      { value: 'obese', points: 2 },
      { value: 'severelyObese', points: 3 },
    ],
  },
];

function buildQuizFlow(sexValue) {
  return questions.filter((q) => {
    if (!q.onlyIfSex) return true;
    return sexValue === q.onlyIfSex;
  });
}

const RESULT_META = {
  low: {
    color: "#2E6B3E",
    bgColor: "#E8F2E6",
    badgeLabel: "Lower Risk",
    adviceKeys: ['diet', 'activity', 'checkups', 'sleep'],
  },
  moderate: {
    color: "#A87132",
    bgColor: "#FDF4E7",
    badgeLabel: "Moderate / Borderline Risk",
    adviceKeys: ['test', 'diet', 'exercise', 'weight'],
  },
  high: {
    color: "#B44C3D",
    bgColor: "#FDF0EE",
    badgeLabel: "Higher Risk Indicated",
    adviceKeys: ['appointment', 'smoking', 'diet', 'medication'],
  },
  diagnosed: {
    color: "#2E6B3E",
    bgColor: "#E8F2E6",
    badgeLabel: "Living with Diabetes",
    adviceKeys: ['monitor', 'medication', 'diet', 'community'],
  },
};

const AdviceCard = ({ title, body, accentColor }) => (
  <div className="flex gap-3.5 items-start p-4 sm:p-5 rounded-2xl bg-white border border-[#E2DCD0] shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
    <div
      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
      style={{ background: accentColor }}
    />
    <div>
      <p className="font-serif text-sm sm:text-base font-bold text-[#1E2A24] leading-snug">
        {title}
      </p>
      <p className="text-xs sm:text-[13px] text-[var(--brown-soft)] leading-relaxed mt-1 font-normal">
        {body}
      </p>
    </div>
  </div>
);

const RiskAssessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t: tr } = useI18n();

  const [currentQuestion, setCurrentQuestion] = useState(-1); // -1 = intro screen
  const [answers, setAnswers] = useState([]); // { id, value, points }
  const [selectedOptionValue, setSelectedOptionValue] = useState(null); // tactile feedback
  const [showAlreadyDiagnosed, setShowAlreadyDiagnosed] = useState(false);
  const [showClinicalDisclaimer, setShowClinicalDisclaimer] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [quizFlow, setQuizFlow] = useState(() => buildQuizFlow(null));

  // Animated counters on mount
  const [stats, setStats] = useState({ diabetes: 0, undiagnosed: 0, prevented: 0 });

  useEffect(() => {
    const duration = 1600;
    const interval = 20;
    const targets = { diabetes: 537, undiagnosed: 50, prevented: 80 };
    let current = { diabetes: 0, undiagnosed: 0, prevented: 0 };

    const timer = setInterval(() => {
      let done = true;
      Object.keys(targets).forEach((key) => {
        current[key] += targets[key] / (duration / interval);
        if (current[key] < targets[key]) {
          done = false;
        }
      });

      setStats({
        diabetes: Math.min(Math.floor(current.diabetes), targets.diabetes),
        undiagnosed: Math.min(Math.floor(current.undiagnosed), targets.undiagnosed),
        prevented: Math.min(Math.floor(current.prevented), targets.prevented),
      });

      if (done) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleSelect = (option) => {
    setSelectedOptionValue(option.value);
    const q = quizFlow[currentQuestion];
    const nextAnswers = [...answers, { id: q.id, value: option.value, points: option.points }];

    let nextFlow = quizFlow;
    if (q.id === 'sex') {
      nextFlow = buildQuizFlow(option.value);
      setQuizFlow(nextFlow);
    }

    setAnswers(nextAnswers);

    // Tactile delay so user sees selected state
    setTimeout(() => {
      setSelectedOptionValue(null);
      setShowHelper(false);
      if (currentQuestion < nextFlow.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setCurrentQuestion(nextFlow.length);
      }
    }, 240);
  };

  const handleBack = () => {
    setSelectedOptionValue(null);
    setShowHelper(false);
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setAnswers((prev) => prev.slice(0, -1));
    } else if (currentQuestion === 0) {
      setCurrentQuestion(-1);
      setAnswers([]);
    }
  };

  const score = answers.reduce((sum, a) => sum + (a.points || 0), 0);

  const getResultKey = () => {
    if (showAlreadyDiagnosed) return "diagnosed";
    if (score >= 5) return "high";
    if (score >= 3) return "moderate";
    return "low";
  };

  const resetAssessment = () => {
    setAnswers([]);
    setCurrentQuestion(-1);
    setSelectedOptionValue(null);
    setShowHelper(false);
    setShowAlreadyDiagnosed(false);
    setQuizFlow(buildQuizFlow(null));
  };

  const handlePrint = () => {
    window.print();
  };

  const quizComplete = currentQuestion >= quizFlow.length && currentQuestion >= 0 && answers.length > 0;
  const isFinished = quizComplete || showAlreadyDiagnosed;
  const resultKey = getResultKey();
  const meta = RESULT_META[resultKey];
  const base = `landing.learn.riskAssessment.results.${resultKey}`;
  const resultTitle = tr(`${base}.title`);
  const resultSubtitle = tr(`${base}.subtitle`);

  return (
    <div
      className="min-h-screen bg-[#EDEAD9] relative overflow-x-hidden flex flex-col justify-between bg-no-repeat bg-right-top bg-cover sm:bg-[length:auto_650px] lg:bg-cover"
      style={{
        backgroundImage: `url(${secureBg})`,
      }}
    >
      <Navbar />

      {/* Gentle gradient fade on the left to ensure crisp text legibility */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#EDEAD9] via-[#EDEAD9]/95 sm:via-[#EDEAD9]/70 to-transparent z-[1]"
        aria-hidden="true"
      />

      {/* Subtle Bottom-Left Dotted Grid Pattern */}
      <div
        className="pointer-events-none absolute bottom-8 left-8 z-[2] w-28 sm:w-36 h-28 sm:h-36 opacity-30 hidden sm:block select-none"
        style={{
          backgroundImage: 'radial-gradient(#BDCAA1 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-24 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20">

        {/* -------------------------------------------------------------------------
            VIEW A: ASSESSMENT & NUMBERS CARD
        -------------------------------------------------------------------------- */}
        {!isFinished ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 sm:gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Heading & Numbers Card */}
            <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 pt-1">
              <div>
                <h1 className="font-serif text-2xl sm:text-4xl lg:text-[3.25rem] font-bold text-[#1E2A24] tracking-tight leading-[1.14]">
                  Know Your <br className="hidden sm:inline" />
                  <span className="italic text-[#2E6B3E] font-medium">
                    Diabetes Risk
                  </span>
                </h1>

                <p className="mt-3 sm:mt-4 text-xs sm:text-sm lg:text-[15px] text-[var(--brown-soft)] leading-relaxed max-w-xl font-medium">
                  Inspired by the ADA Type 2 Diabetes Risk Test. Answer a few questions — a score of 5+ means talk to your doctor about screening.
                </p>
              </div>

              {/* "Diabetes by the Numbers" Card */}
              <div className="rounded-[24px] sm:rounded-[32px] bg-[#FAF8F3]/90 backdrop-blur-[2px] p-5 sm:p-6 border border-[#DDD5C5] shadow-xs relative overflow-hidden text-[#1E2A24]">
                <div className="min-w-0">
                  <p className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#2E6B3E]">
                    DIABETES BY THE NUMBERS
                  </p>
                  <h2 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#1E2A24] mt-0.5 leading-snug">
                    Knowledge today, healthier tomorrow.
                  </h2>
                  <div className="w-8 h-0.5 bg-[#B8AFA0] my-2.5 rounded-full" />

                  {/* 3 Animated Stats Columns */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2">
                    {/* Stat 1 */}
                    <div className="flex flex-col items-start">
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#EAE5D8] text-[#2E6B3E] shadow-2xs mb-1.5 border border-[#DDD5C5]">
                        <Users size={13} className="sm:w-4 sm:h-4" />
                      </span>
                      <p className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#1E2A24] leading-none tabular-nums">
                        {stats.diabetes}M+
                      </p>
                      <p className="text-[9.5px] sm:text-[11px] text-[#4A4339] mt-1 leading-tight font-medium">
                        Adults living with diabetes
                      </p>
                    </div>

                    {/* Stat 2 */}
                    <div className="flex flex-col items-start">
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#EAE5D8] text-[#2E6B3E] shadow-2xs mb-1.5 border border-[#DDD5C5]">
                        <TrendingUp size={13} className="sm:w-4 sm:h-4" />
                      </span>
                      <p className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#1E2A24] leading-none tabular-nums">
                        {stats.undiagnosed}%
                      </p>
                      <p className="text-[9.5px] sm:text-[11px] text-[#4A4339] mt-1 leading-tight font-medium">
                        Cases undiagnosed today
                      </p>
                    </div>

                    {/* Stat 3 */}
                    <div className="flex flex-col items-start">
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#EAE5D8] text-[#2E6B3E] shadow-2xs mb-1.5 border border-[#DDD5C5]">
                        <ShieldCheck size={13} className="sm:w-4 sm:h-4" />
                      </span>
                      <p className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#2E6B3E] leading-none tabular-nums">
                        {stats.prevented}%
                      </p>
                      <p className="text-[9.5px] sm:text-[11px] text-[#4A4339] mt-1 leading-tight font-medium">
                        Type 2 cases preventable
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Quiz Card */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-[440px] min-h-[460px] sm:min-h-[520px] rounded-[28px] sm:rounded-[36px] bg-white p-5 sm:p-9 lg:p-10 shadow-[0_20px_50px_-15px_rgba(30,42,36,0.10)] border border-[#E2D8C7] flex flex-col justify-between">
                
                {/* Intro Screen */}
                {currentQuestion === -1 && (
                  <div className="flex flex-col w-full text-left">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#E8F0E6] text-[#2E6B3E] mb-5 sm:mb-6 shadow-2xs">
                      <Activity size={20} className="sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                    </div>

                    <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#1E2A24] tracking-tight">
                      Let's check in.
                    </h2>
                    <p className="mt-2 text-xs sm:text-[14px] text-[var(--brown-soft)] leading-relaxed font-medium">
                      A few simple questions can help you understand your risk. It takes about a minute.
                    </p>

                    <div className="mt-6 sm:mt-8 flex flex-col gap-2.5 sm:gap-3 w-full">
                      {/* Primary Button */}
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(0)}
                        className="w-full flex items-center justify-between rounded-full bg-[#182C1E] hover:bg-[#27392E] text-white py-3.5 sm:py-4 px-5 sm:px-6 font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99]"
                      >
                        <span>Start assessment</span>
                        <ArrowRight size={16} />
                      </button>

                      {/* Secondary Centered Outlined Button */}
                      <button
                        type="button"
                        onClick={() => setShowAlreadyDiagnosed(true)}
                        className="w-full flex items-center justify-center text-center rounded-full border border-[#D9D1C2] bg-white hover:bg-[#F8F5EE] text-[#4A4339] py-3 sm:py-3.5 px-5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-2xs"
                      >
                        <span>I already live with diabetes</span>
                      </button>
                    </div>

                    <div className="mt-6 sm:mt-7 flex items-center justify-center gap-1.5 w-full text-center text-[10px] sm:text-[11.5px] text-[#7A746B] font-medium">
                      <Lock size={12} className="shrink-0 text-[#2E6B3E]" />
                      <span>Anonymous. Private. Secure. Your answers are never shared.</span>
                    </div>
                  </div>
                )}

                {/* Active Question Screen */}
                {currentQuestion >= 0 && quizFlow[currentQuestion] && (
                  <div className="flex flex-col text-left h-full justify-between animate-in fade-in duration-200">
                    <div>
                      {/* Step Header */}
                      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brown-soft)] hover:text-[#1E2A24] cursor-pointer py-1"
                        >
                          <ChevronLeft size={15} />
                          <span>Back</span>
                        </button>
                        <span className="text-[10.5px] sm:text-[11px] font-bold text-[#2E6B3E] bg-[#E8F0E6] px-2.5 sm:px-3 py-0.5 rounded-full border border-[#C5D8C3]">
                          Step {currentQuestion + 1} of {quizFlow.length}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-[#EAE5D8] rounded-full overflow-hidden mb-4 sm:mb-5">
                        <div
                          className="h-full bg-[#2E6B3E] transition-all duration-300 rounded-full"
                          style={{ width: `${((currentQuestion + 1) / quizFlow.length) * 100}%` }}
                        />
                      </div>

                      {/* Question Text */}
                      <h2 className="font-serif text-base sm:text-xl font-bold text-[#1E2A24] mb-3 leading-snug">
                        {tr(`landing.learn.riskAssessment.questions.${quizFlow[currentQuestion].id}.question`)}
                      </h2>

                      {/* Contextual Clinical Helper Note Toggle */}
                      {quizFlow[currentQuestion].helper && (
                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={() => setShowHelper(!showHelper)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E6B3E] hover:underline cursor-pointer"
                          >
                            <Info size={12} />
                            <span>{showHelper ? 'Hide clinical context' : 'Why we ask this?'}</span>
                          </button>
                          {showHelper && (
                            <p className="mt-1.5 text-[11.5px] text-[#554D43] bg-[#F7F4EE] p-2.5 rounded-xl border border-[#E0D8CA] leading-relaxed">
                              {quizFlow[currentQuestion].helper}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Selectable Options List with Tactile Selection State */}
                      <div className="flex flex-col gap-2 sm:gap-2.5">
                        {quizFlow[currentQuestion].options.map((option) => {
                          const isSelected = selectedOptionValue === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleSelect(option)}
                              className={`w-full text-left rounded-2xl border p-3 sm:p-3.5 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-between select-none ${
                                isSelected
                                  ? 'bg-[#182C1E] text-white border-[#182C1E] scale-[1.01]'
                                  : 'bg-[#FAF8F3] hover:bg-[#E8F0E6] hover:border-[#BDCAA1] hover:text-[#182C1E] border-[#E0D8CA] text-[#1E2A24]'
                              }`}
                            >
                              <span>
                                {tr(`landing.learn.riskAssessment.questions.${quizFlow[currentQuestion].id}.options.${option.value}`)}
                              </span>
                              {isSelected ? (
                                <CheckCircle2 size={15} className="text-[#BDCAA1]" />
                              ) : (
                                <ArrowRight size={14} className="opacity-40" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-[#7A746B] font-medium">
                      <Lock size={11} className="shrink-0 text-[#2E6B3E]" />
                      <span>Private &amp; anonymous screening</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        ) : (
          /* -------------------------------------------------------------------------
              VIEW B: COMPREHENSIVE OVERVIEW AFTER THE TEST
          -------------------------------------------------------------------------- */
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            
            {/* Top Result Banner */}
            <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-gradient-to-br from-[#182C1E] via-[#213828] to-[#122216] p-6 sm:p-10 text-white shadow-xl mb-6 sm:mb-8 border border-[#3D5A45]">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <span
                    className="inline-block text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-2.5"
                    style={{ background: meta.bgColor, color: meta.color }}
                  >
                    {showAlreadyDiagnosed ? 'Living With Diabetes' : `Score: ${score} Points · ${meta.badgeLabel}`}
                  </span>
                  <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
                    {resultTitle}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                    {resultSubtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={resetAssessment}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Retake</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#182C1E] px-4 py-2 text-xs sm:text-sm font-bold shadow-sm transition-all hover:bg-[#F8F5EE] cursor-pointer"
                    title="Print or Save PDF for Doctor Visit"
                  >
                    <Printer size={13} />
                    <span className="hidden sm:inline">Print Summary</span>
                  </button>
                </div>
              </div>
            </div>

            {/* "What You Should Do" Header */}
            <div className="mb-3.5 sm:mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#1E2A24]">
                {tr('landing.learn.riskAssessment.whatYouShouldDo') || 'What you should do next'}
              </h3>
              <span className="text-[11px] sm:text-xs text-[#2E6B3E] bg-[#E8F2E6] px-2.5 py-0.5 rounded-full font-bold">
                Clinical Steps
              </span>
            </div>

            {/* 4 Clinical Advice Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {meta.adviceKeys.map((key) => {
                const advice = tr(`${base}.advice.${key}`);
                return (
                  <AdviceCard
                    key={key}
                    title={`${advice.emoji} ${advice.title}`}
                    body={advice.body}
                    accentColor={meta.color}
                  />
                );
              })}
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                className="w-full sm:w-auto rounded-full bg-[#182C1E] hover:bg-[#27392E] text-white py-3.5 px-8 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{user ? 'Go to Dashboard' : (tr('landing.learn.riskAssessment.joinCommunity') || 'Get Started Free on DiaBuddy')}</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/community')}
                className="w-full sm:w-auto rounded-full border border-[#D9D1C2] bg-white hover:bg-[#F8F5EE] text-[#4A4339] py-3.5 px-7 text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center"
              >
                {tr('landing.learn.riskAssessment.openCommunity') || 'Explore Community'}
              </button>
            </div>

            {/* Clinical Evidence Accordion at Bottom */}
            <div className="mt-8 pt-6 border-t border-[#E0D8CA]">
              <button
                type="button"
                onClick={() => setShowClinicalDisclaimer(!showClinicalDisclaimer)}
                className="flex items-center justify-between w-full text-left text-xs text-[var(--brown-soft)] hover:text-[#1E2A24] font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-[#2E6B3E]" />
                  <span>Clinical References &amp; Scientific Methodology</span>
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showClinicalDisclaimer ? 'rotate-180' : ''}`} />
              </button>

              {showClinicalDisclaimer && (
                <div className="mt-3 p-4 rounded-2xl bg-[#F8F5EE] border border-[#E3DACE] text-xs text-[var(--brown-soft)] leading-relaxed space-y-2 animate-in fade-in duration-200">
                  <p>
                    <strong>American Diabetes Association (ADA) 7-Point Screening:</strong> The risk scoring algorithm is based on clinical guidelines from the American Diabetes Association (ADA) and CDC Diabetes Prevention Program (DPP).
                  </p>
                  <p>
                    <strong>Educational Screener Notice:</strong> This assessment evaluates statistical risk indicators and does not constitute a clinical medical diagnosis. Please consult a qualified endocrinologist or healthcare provider for diagnostic laboratory tests (Fasting Plasma Glucose or HbA1c).
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        <div className="mt-12 w-full">
          <LearnFooter />
        </div>

      </main>
    </div>
  );
};

export default RiskAssessment;
