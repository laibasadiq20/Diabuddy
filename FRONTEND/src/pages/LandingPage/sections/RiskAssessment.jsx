import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n/I18nContext";

const questions = [
  {
    id: 'age',
    options: [
      { value: 'under40', points: 0 },
      { value: 'from40to49', points: 1 },
      { value: 'from50to59', points: 2 },
      { value: 'over60', points: 3 },
    ],
  },
  {
    id: 'sex',
    options: [
      { value: 'man', points: 1 },
      { value: 'woman', points: 0 },
    ],
  },
  {
    id: 'gestational',
    onlyIfSex: 'woman',
    options: [
      { value: 'yes', points: 1 },
      { value: 'no', points: 0 },
    ],
  },
  {
    id: 'family',
    options: [
      { value: 'yes', points: 1 },
      { value: 'no', points: 0 },
    ],
  },
  {
    id: 'bp',
    options: [
      { value: 'yes', points: 1 },
      { value: 'no', points: 0 },
    ],
  },
  {
    id: 'activity',
    options: [
      { value: 'yes', points: 0 },
      { value: 'no', points: 1 },
    ],
  },
  {
    id: 'weight',
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

/* ── icon components ── */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
    <path d="M12 4l9 15H3l9-15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="17" r="0.9" fill="currentColor" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
    <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16" r="0.9" fill="currentColor" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
    <path d="M12 21C12 21 3 13.5 3 8a4 4 0 018-1.5A4 4 0 0121 8c0 5.5-9 13-9 13z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

/* ── presentational config per risk level (copy comes from i18n) ── */
const RESULT_META = {
  low: {
    color: "#2D6A4F",
    bgColor: "#D8F3DC",
    Icon: ShieldIcon,
    adviceKeys: ['diet', 'activity', 'checkups', 'sleep'],
  },
  moderate: {
    color: "#B45309",
    bgColor: "#FEF3C7",
    Icon: WarningIcon,
    adviceKeys: ['test', 'diet', 'exercise', 'weight'],
  },
  high: {
    color: "#B91C1C",
    bgColor: "#FEE2E2",
    Icon: AlertIcon,
    adviceKeys: ['appointment', 'smoking', 'diet', 'medication'],
  },
  diagnosed: {
    color: "#1D4ED8",
    bgColor: "#DBEAFE",
    Icon: HeartIcon,
    adviceKeys: ['monitor', 'medication', 'diet', 'community'],
  },
};

/* ── subcomponents ── */
const AdviceCard = ({ title, body, accentColor }) => (
  <div style={{
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    border: "1.5px solid #E5E7EB",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
  >
    <div style={{
      width: "10px", height: "10px", borderRadius: "50%",
      background: accentColor,
      marginTop: "6px", flexShrink: 0,
    }} />
    <div>
      <p style={{ margin: "0 0 6px 0", fontWeight: "600", fontSize: "15px", color: "#1F2937", fontFamily: "'Playfair Display', serif" }}>{title}</p>
      <p style={{ margin: 0, fontSize: "13px", color: "#6B7280", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif" }}>{body}</p>
    </div>
  </div>
);

const ResultPanel = ({ resultKey, score, onRetake, navigate, isLoggedIn, tr }) => {
  const meta = RESULT_META[resultKey];
  const { color, bgColor, Icon, adviceKeys } = meta;
  const base = `landing.learn.riskAssessment.results.${resultKey}`;
  const title = tr(`${base}.title`);
  const subtitle = tr(`${base}.subtitle`);

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Result hero banner */}
      <div className="ra-result-banner" style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg, #1F3A2E 0%, #32493B 60%, #3d5c4a 100%)",
        borderRadius: "24px",
        padding: "40px",
        marginBottom: "32px",
        textAlign: "center",
        color: "#F7F3EC",
        boxShadow: "0 16px 40px rgba(22,33,25,0.22)",
      }}>
        <div aria-hidden style={{ position: "absolute", right: -30, top: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(232,184,154,0.16)" }} />
        <div aria-hidden style={{ position: "absolute", left: -20, bottom: -40, width: 130, height: 130, borderRadius: "50%", background: "rgba(168,184,154,0.18)" }} />
        <div style={{ position: "relative", color: "#BDCAA1", marginBottom: "16px" }}><Icon /></div>
        <div style={{ position: "relative", display: "inline-block", background: "rgba(247,243,236,0.12)", color: "#E8CF7A", border: "1px solid rgba(232,207,122,0.35)", borderRadius: "20px", padding: "4px 16px", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
          {tr('landing.learn.riskAssessment.scorePillTemplate').replace('{n}', score)}
        </div>
        <h2 style={{ position: "relative", fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "700", color: "#F7F3EC", margin: "0 0 12px 0", lineHeight: "1.2" }}>{title}</h2>
        <p style={{ position: "relative", fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "rgba(247,243,236,0.72)", maxWidth: "540px", margin: "0 auto", lineHeight: "1.7" }}>{subtitle}</p>
      </div>

      {/* Advice heading */}
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "600", color: "#1F2937", margin: "0 0 20px 0" }}>
        {tr('landing.learn.riskAssessment.whatYouShouldDo')}
      </h3>

      {/* Advice cards grid */}
      <div className="ra-advice-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {adviceKeys.map((key) => {
          const advice = tr(`${base}.advice.${key}`);
          return (
            <AdviceCard key={key} title={`${advice.emoji} ${advice.title}`} body={advice.body} accentColor={color} />
          );
        })}
      </div>

      {/* CTA row */}
      <div className="ra-cta-row" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate(isLoggedIn ? "/community" : "/register")}
          className="ra-cta-primary"
          style={{
            background: "#022D20", color: "#fff", border: "none",
            borderRadius: "50px", padding: "14px 32px", fontSize: "15px", fontWeight: "600",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "background 0.2s, transform 0.2s",
            boxShadow: "0 4px 16px rgba(2,45,32,0.25)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#C56A3E"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#022D20"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {isLoggedIn ? tr('landing.learn.riskAssessment.openCommunity') : tr('landing.learn.riskAssessment.joinCommunity')}
        </button>
        <button
          onClick={onRetake}
          className="ra-cta-secondary"
          style={{
            background: "transparent", color: "#6B7280",
            border: "1.5px solid #D1D5DB", borderRadius: "50px", padding: "14px 28px",
            fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#9CA3AF"; e.currentTarget.style.color = "#374151"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.color = "#6B7280"; }}
        >
          {tr('landing.learn.riskAssessment.takeAgain')}
        </button>
      </div>
    </div>
  );
};

/* ── main component ── */
const RiskAssessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t: tr } = useI18n();
  const [currentQuestion, setCurrentQuestion] = useState(-1); // -1 = intro screen
  const [answers, setAnswers] = useState([]); // { id, value, points }
  const [showAlreadyDiagnosed, setShowAlreadyDiagnosed] = useState(false);
  const [quizFlow, setQuizFlow] = useState(() => buildQuizFlow(null));

  const [stats, setStats] = useState({ diabetes: 0, undiagnosed: 0, prevented: 0 });

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const targets = { diabetes: 537, undiagnosed: 50, prevented: 80 };
    let current = { diabetes: 0, undiagnosed: 0, prevented: 0 };

    const timer = setInterval(() => {
      let done = true;
      Object.keys(targets).forEach(key => {
        current[key] += targets[key] / (duration / interval);
        if (current[key] < targets[key]) done = false;
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
    const q = quizFlow[currentQuestion];
    const nextAnswers = [...answers, { id: q.id, value: option.value, points: option.points }];

    let nextFlow = quizFlow;
    if (q.id === 'sex') {
      nextFlow = buildQuizFlow(option.value);
      setQuizFlow(nextFlow);
    }

    setAnswers(nextAnswers);

    if (currentQuestion < nextFlow.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 280);
    } else {
      setCurrentQuestion(nextFlow.length);
    }
  };

  const score = answers.reduce((sum, a) => sum + (a.points || 0), 0);

  const getResultKey = () => {
    if (showAlreadyDiagnosed) return "diagnosed";
    // ADA high-risk threshold is 5+
    if (score >= 5) return "high";
    if (score >= 3) return "moderate";
    return "low";
  };

  const progress = quizFlow.length
    ? (Math.min(currentQuestion + 1, quizFlow.length) / quizFlow.length) * 100
    : 0;

  const resetAssessment = () => {
    setAnswers([]);
    setCurrentQuestion(-1);
    setShowAlreadyDiagnosed(false);
    setQuizFlow(buildQuizFlow(null));
  };

  const quizComplete = currentQuestion >= quizFlow.length && currentQuestion >= 0 && answers.length > 0;

  const riskLabel = score >= 5
    ? tr('landing.learn.riskAssessment.riskHigher')
    : score >= 3
      ? tr('landing.learn.riskAssessment.riskBorderline')
      : tr('landing.learn.riskAssessment.riskLower');

  return (
    <>
      <Navbar />

      <section className="ra-page" style={{ background: "var(--cream-soft, #F6EFDD)", minHeight: "100vh", paddingTop: "88px", paddingBottom: "64px" }}>
        <div className="ra-wrap" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

          {/* Page header */}
          <div className="ra-header" style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="ra-pill" style={{ display: "inline-block", background: "#022D20", color: "#64E3C0", borderRadius: "20px", padding: "6px 18px", fontSize: "12px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif" }}>
              {tr('landing.learn.riskAssessment.pageTag')}
            </span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 6vw, 52px)", fontWeight: "700", color: "#022D20", margin: "0 0 16px 0", lineHeight: "1.15" }}>
              {tr('landing.learn.riskAssessment.title')}
            </h1>
            <p className="ra-header-lead" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", color: "#374151", maxWidth: "560px", margin: "0 auto", lineHeight: "1.7" }}>
              {tr('landing.learn.riskAssessment.lead')}
            </p>
          </div>

          <div className="ra-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)", gap: "40px", alignItems: "start" }}>

            {/* ── LEFT: Stats + Result panel ── */}
            <div className={`ra-col-info${(quizComplete || showAlreadyDiagnosed) ? ' ra-col-info--open' : ''}`}>
              {/* Stats banner */}
              <div className="ra-stats" style={{
                background: "linear-gradient(135deg, #022D20 0%, #013B2A 60%, #024030 100%)",
                borderRadius: "24px", padding: "32px", marginBottom: "32px",
                boxShadow: "0 12px 40px rgba(2,45,32,0.3)",
              }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "3px", color: "#67E7C5", fontSize: "11px", margin: "0 0 12px 0", fontWeight: "600" }}>{tr('landing.learn.riskAssessment.statsKicker')}</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 4vw, 24px)", fontWeight: "700", color: "#fff", margin: "0 0 8px 0", lineHeight: "1.3" }}>{tr('landing.learn.riskAssessment.statsHeading')}</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#86EFAC", margin: "0 0 24px 0", lineHeight: "1.6" }}>{tr('landing.learn.riskAssessment.statsLead')}</p>

                <div className="ra-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  {[
                    { val: `${stats.diabetes}M`, label: tr('landing.learn.riskAssessment.statAdults') },
                    { val: `${stats.undiagnosed}%`, label: tr('landing.learn.riskAssessment.statUndiagnosed') },
                    { val: `${stats.prevented}%`, label: tr('landing.learn.riskAssessment.statPreventable') },
                  ].map(s => (
                    <div key={s.label} className="ra-stat-cell" style={{
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "16px", padding: "16px 12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      textAlign: "center",
                    }}>
                      <p style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: "700", color: "#3CE6C1", fontFamily: "'Playfair Display', serif" }}>{s.val}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#A7F3D0", lineHeight: "1.5", fontFamily: "'DM Sans', sans-serif" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result panel — shown after quiz */}
              {quizComplete && (
                <ResultPanel
                  resultKey={getResultKey()}
                  score={score}
                  onRetake={resetAssessment}
                  navigate={navigate}
                  isLoggedIn={!!user}
                  tr={tr}
                />
              )}

              {/* Already diagnosed path */}
              {showAlreadyDiagnosed && !quizComplete && (
                <ResultPanel
                  resultKey="diagnosed"
                  score={0}
                  onRetake={resetAssessment}
                  navigate={navigate}
                  isLoggedIn={!!user}
                  tr={tr}
                />
              )}
            </div>

            {/* ── RIGHT: Quiz card ── */}
            <div className="ra-col-quiz" style={{ position: "sticky", top: "108px" }}>
              <div className="ra-quiz-card" style={{
                background: "#fff",
                borderRadius: "28px",
                padding: "36px 32px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                minHeight: "460px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>

                {/* Intro screen */}
                {currentQuestion === -1 && !showAlreadyDiagnosed && (
                  <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#022D20", margin: "0 0 12px 0" }}>{tr('landing.learn.riskAssessment.introHeading')}</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#6B7280", margin: "0 0 28px 0", lineHeight: "1.7" }}>{tr('landing.learn.riskAssessment.introLead')}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <button
                        onClick={() => setCurrentQuestion(0)}
                        style={{
                          background: "#022D20", color: "#fff", border: "none",
                          borderRadius: "50px", padding: "14px 32px", fontSize: "16px", fontWeight: "600",
                          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#C56A3E"}
                        onMouseLeave={e => e.currentTarget.style.background = "#022D20"}
                      >
                        {tr('landing.learn.riskAssessment.startButton')}
                      </button>
                      <button
                        onClick={() => setShowAlreadyDiagnosed(true)}
                        style={{
                          background: "transparent", color: "#4B5563",
                          border: "1.5px solid #E5E7EB", borderRadius: "50px", padding: "12px 28px",
                          fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#022D20"; e.currentTarget.style.color = "#022D20"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#4B5563"; }}
                      >
                        {tr('landing.learn.riskAssessment.alreadyDiagnosedButton')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quiz questions */}
                {currentQuestion >= 0 && !quizComplete && !showAlreadyDiagnosed && quizFlow[currentQuestion] && (
                  <>
                    {/* Progress */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                        {tr('landing.learn.riskAssessment.progressTemplate').replace('{current}', currentQuestion + 1).replace('{total}', quizFlow.length)}
                      </span>
                      <div style={{ flexGrow: 1, height: "6px", background: "#F3F4F6", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", background: "linear-gradient(90deg, #022D20, #2D6A4F)",
                          borderRadius: "10px", width: `${progress}%`,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>

                    <h2 className="ra-question" style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "600", color: "#1F2937", margin: "0 0 24px 0", minHeight: "80px", lineHeight: "1.4" }}>
                      {tr(`landing.learn.riskAssessment.questions.${quizFlow[currentQuestion].id}.question`)}
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {quizFlow[currentQuestion].options.map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(option)}
                          style={{
                            width: "100%", padding: "14px 20px",
                            borderRadius: "14px", textAlign: "left",
                            fontSize: "15px", fontWeight: "500",
                            fontFamily: "'DM Sans', sans-serif",
                            background: "#F9FAFB", color: "#374151",
                            border: "2px solid #E5E7EB", cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#ECFDF5"; e.currentTarget.style.borderColor = "#6EE7B7"; e.currentTarget.style.color = "#022D20"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
                        >
                          {tr(`landing.learn.riskAssessment.questions.${quizFlow[currentQuestion].id}.options.${option.value}`)}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Quiz complete — score summary inside the card */}
                {quizComplete && (
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "24px",
                      padding: "40px 28px",
                      textAlign: "center",
                      background: "linear-gradient(145deg, #1F3A2E 0%, #32493B 55%, #3d5c4a 100%)",
                      color: "#F7F3EC",
                      boxShadow: "0 16px 40px rgba(22,33,25,0.25)",
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        right: -36,
                        top: -40,
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        background: "rgba(232,184,154,0.18)",
                      }}
                    />
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: -30,
                        bottom: -50,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: "rgba(168,184,154,0.2)",
                      }}
                    />

                    <p
                      style={{
                        position: "relative",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        fontWeight: "700",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#BDCAA1",
                        margin: "0 0 12px",
                      }}
                    >
                      {tr('landing.learn.riskAssessment.scoreLabel')}
                    </p>
                    <p
                      style={{
                        position: "relative",
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "72px",
                        fontWeight: "600",
                        color: score >= 5 ? "#E8CF7A" : "#F7F3EC",
                        margin: "0 0 8px",
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {score}
                    </p>
                    <p
                      style={{
                        position: "relative",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        color: "rgba(247,243,236,0.65)",
                        margin: "0 0 28px",
                      }}
                    >
                      {riskLabel}
                    </p>
                    <button
                      onClick={resetAssessment}
                      style={{
                        position: "relative",
                        background: "#F7F3EC",
                        color: "#1F3A2E",
                        border: "none",
                        borderRadius: "50px",
                        padding: "12px 28px",
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {tr('landing.learn.riskAssessment.takeAgain')}
                    </button>
                  </div>
                )}

                {/* Already diagnosed path in card */}
                {showAlreadyDiagnosed && !quizComplete && (
                  <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#1D4ED8", margin: "0 0 8px 0" }}>{tr('landing.learn.riskAssessment.livingWithDiabetesTitle')}</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#6B7280", margin: "0 0 20px 0", lineHeight: "1.7" }}>{tr('landing.learn.riskAssessment.livingWithDiabetesLead')}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#9CA3AF" }}>
                      <span className="ra-hint-desktop">{tr('landing.learn.riskAssessment.seeGuideDesktop')}</span>
                      <span className="ra-hint-mobile">{tr('landing.learn.riskAssessment.seeGuideMobile')}</span>
                    </p>
                    <button
                      onClick={resetAssessment}
                      style={{
                        marginTop: "24px", background: "transparent", color: "#6B7280",
                        border: "1.5px solid #E5E7EB", borderRadius: "50px", padding: "10px 24px",
                        fontSize: "14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {tr('landing.learn.riskAssessment.goBack')}
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        .ra-hint-mobile { display: none; }
        .ra-hint-desktop { display: inline; }

        @media (max-width: 900px) {
          .ra-page {
            min-height: auto !important;
            padding-top: 96px !important;
            padding-bottom: 32px !important;
          }
          .ra-wrap {
            padding: 0 16px !important;
          }
          .ra-header {
            margin-bottom: 20px !important;
            padding-top: 8px !important;
            text-align: center !important;
          }
          .ra-header h1 {
            font-size: clamp(1.55rem, 7vw, 2rem) !important;
            margin-bottom: 10px !important;
          }
          .ra-header-lead {
            font-size: 13.5px !important;
            line-height: 1.55 !important;
            margin: 0 auto !important;
            max-width: 34ch !important;
            color: #4B5563 !important;
          }
          .ra-pill {
            letter-spacing: 0.08em !important;
            padding: 5px 12px !important;
            font-size: 10px !important;
            margin-bottom: 14px !important;
          }
          .ra-layout {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
          }
          .ra-col-quiz { order: 1; position: static !important; top: auto !important; }
          .ra-col-info { order: 2; }
          .ra-col-info:not(.ra-col-info--open) { display: none !important; }
          .ra-quiz-card {
            padding: 24px 18px !important;
            border-radius: 20px !important;
            min-height: 0 !important;
            justify-content: flex-start !important;
            box-shadow: 0 10px 32px rgba(0,0,0,0.08) !important;
          }
          .ra-quiz-card h2 {
            font-size: 1.25rem !important;
          }
          .ra-stats {
            display: none !important;
          }
          .ra-question {
            font-size: 17px !important;
            min-height: 0 !important;
            margin-bottom: 16px !important;
          }
          .ra-result-banner {
            padding: 24px 16px !important;
            border-radius: 18px !important;
          }
          .ra-advice-grid {
            grid-template-columns: 1fr !important;
          }
          .ra-cta-row {
            flex-direction: column !important;
          }
          .ra-cta-primary,
          .ra-cta-secondary {
            width: 100% !important;
            text-align: center !important;
            justify-content: center;
          }
          .ra-hint-mobile { display: inline; }
          .ra-hint-desktop { display: none; }
        }
      `}</style>
    </>
  );
};

export default RiskAssessment;
