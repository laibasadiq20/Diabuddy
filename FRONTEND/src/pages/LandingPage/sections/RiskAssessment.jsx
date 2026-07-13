import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    id: 'age',
    question: 'How old are you?',
    options: [
      { label: 'Less than 40 years', points: 0 },
      { label: '40–49 years', points: 1 },
      { label: '50–59 years', points: 2 },
      { label: '60 years or older', points: 3 },
    ],
  },
  {
    id: 'sex',
    question: 'Are you a man or a woman?',
    options: [
      { label: 'Man', points: 1 },
      { label: 'Woman', points: 0 },
    ],
  },
  {
    id: 'gestational',
    question: 'Have you ever been diagnosed with gestational diabetes, or given birth to a baby weighing 9 pounds or more?',
    onlyIfSex: 'Woman',
    options: [
      { label: 'Yes', points: 1 },
      { label: 'No', points: 0 },
    ],
  },
  {
    id: 'family',
    question: 'Do you have a mother, father, sister, or brother with diabetes?',
    options: [
      { label: 'Yes', points: 1 },
      { label: 'No', points: 0 },
    ],
  },
  {
    id: 'bp',
    question: 'Have you ever been diagnosed with high blood pressure?',
    options: [
      { label: 'Yes', points: 1 },
      { label: 'No', points: 0 },
    ],
  },
  {
    id: 'activity',
    question: 'Are you physically active?',
    options: [
      { label: 'Yes', points: 0 },
      { label: 'No', points: 1 },
    ],
  },
  {
    id: 'weight',
    question: 'What best describes your weight status?',
    options: [
      { label: 'Normal or underweight (BMI under 25)', points: 0 },
      { label: 'Overweight (BMI 25–29.9)', points: 1 },
      { label: 'Obese (BMI 30–39.9)', points: 2 },
      { label: 'Severely obese (BMI 40 or higher)', points: 3 },
    ],
  },
];

const MAX_SCORE = 11;

function buildQuizFlow(sexLabel) {
  return questions.filter((q) => {
    if (!q.onlyIfSex) return true;
    return sexLabel === q.onlyIfSex;
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

/* ── advice cards per risk level ── */
const RESULT_DATA = {
  low: {
    title: "Lower Risk — Keep Going",
    subtitle: "Based on the ADA-style risk factors, your score is under the high-risk threshold. Stay active, eat well, and recheck if anything changes.",
    color: "#2D6A4F",
    bgColor: "#D8F3DC",
    Icon: ShieldIcon,
    advice: [
      {
        emoji: "🥦",
        title: "Keep eating well",
        body: "A diet rich in vegetables, whole grains, lean proteins, and healthy fats is your best long-term defense. Limit processed sugar and refined carbs.",
      },
      {
        emoji: "🏃",
        title: "Stay active",
        body: "Aim for at least 150 minutes of moderate exercise per week — brisk walks, cycling, swimming. Physical activity keeps insulin sensitivity high.",
      },
      {
        emoji: "🩺",
        title: "Annual checkups",
        body: "Even at low risk, get a fasting blood glucose test every 1–3 years, especially after age 35. Early detection is everything.",
      },
      {
        emoji: "💤",
        title: "Prioritize sleep & stress",
        body: "Poor sleep and chronic stress raise cortisol, which can spike blood glucose. Aim for 7–9 hours nightly and find healthy stress outlets.",
      },
    ],
  },
  moderate: {
    title: "Borderline — Stay Alert",
    subtitle: "You're approaching the ADA high-risk cutoff (5+). Small lifestyle changes now can make a real difference. Consider talking with a clinician.",
    color: "#B45309",
    bgColor: "#FEF3C7",
    Icon: WarningIcon,
    advice: [
      {
        emoji: "🧑‍⚕️",
        title: "Get a fasting glucose test",
        body: "Ask your doctor for a fasting plasma glucose or HbA1c test. This gives you a real baseline and detects prediabetes before it progresses.",
      },
      {
        emoji: "🥗",
        title: "Cut refined carbs & sugar",
        body: "Swap white bread, rice, and sugary drinks for whole-grain alternatives. Focus on low-glycemic foods that don't spike blood sugar.",
      },
      {
        emoji: "🏋️",
        title: "Add 30 min of exercise daily",
        body: "Regular moderate exercise — even brisk walking — can reduce insulin resistance by up to 58% in people with prediabetes (CDC, 2023).",
      },
      {
        emoji: "⚖️",
        title: "Target 5–7% weight loss",
        body: "If you're overweight, losing even a small percentage of body weight dramatically reduces your diabetes risk. Small changes, big impact.",
      },
    ],
  },
  high: {
    title: "Higher Risk — Get Tested",
    subtitle: "A score of 5 or higher on the ADA Diabetes Risk Test means you should ask your doctor about blood glucose or HbA1c testing. This is not a diagnosis.",
    color: "#B91C1C",
    bgColor: "#FEE2E2",
    Icon: AlertIcon,
    advice: [
      {
        emoji: "📋",
        title: "Schedule a doctor's appointment",
        body: "Ask for an HbA1c test (shows 3-month blood sugar average) and a fasting glucose test. Both together give the clearest picture of your risk.",
      },
      {
        emoji: "🚫",
        title: "Stop smoking & limit alcohol",
        body: "Both significantly increase diabetes risk and complications. Quitting smoking improves insulin sensitivity within weeks.",
      },
      {
        emoji: "🍽️",
        title: "Follow a diabetes-prevention diet",
        body: "The DASH diet and Mediterranean diet are clinically proven to reduce diabetes risk. Focus on fiber, healthy fats, lean protein — not restriction.",
      },
      {
        emoji: "💊",
        title: "Ask about Metformin or a program",
        body: "If you have prediabetes, your doctor may recommend metformin or a structured Diabetes Prevention Program (DPP) — both proven to help.",
      },
    ],
  },
  diagnosed: {
    title: "Living Well With Diabetes",
    subtitle: "A diabetes diagnosis isn't the end — millions of people manage it successfully every day. Here's how to take control.",
    color: "#1D4ED8",
    bgColor: "#DBEAFE",
    Icon: HeartIcon,
    advice: [
      {
        emoji: "📊",
        title: "Monitor your blood glucose regularly",
        body: "Know your target range (usually 80–130 mg/dL fasting, <180 mg/dL post-meal). Use a CGM or glucometer consistently. Patterns reveal everything.",
      },
      {
        emoji: "💉",
        title: "Follow your medication plan",
        body: "Never skip doses. If you're on insulin, learn carb-counting to dose correctly. Work with your endocrinologist to find the right routine.",
      },
      {
        emoji: "🥑",
        title: "Eat to control blood sugar",
        body: "Choose low-GI foods, eat at consistent times, control portions. Avoid sugary drinks entirely. Fiber slows sugar absorption — eat more of it.",
      },
      {
        emoji: "👥",
        title: "Join a support community",
        body: "People who engage with diabetes communities have better outcomes. DiaBuddy connects you with patients who truly understand what you're going through.",
      },
    ],
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

const ResultPanel = ({ resultKey, score, onRetake, navigate }) => {
  const data = RESULT_DATA[resultKey];
  const { title, subtitle, color, bgColor, Icon, advice } = data;

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Result hero banner */}
      <div style={{
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
          Score {score}
        </div>
        <h2 style={{ position: "relative", fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "700", color: "#F7F3EC", margin: "0 0 12px 0", lineHeight: "1.2" }}>{title}</h2>
        <p style={{ position: "relative", fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "rgba(247,243,236,0.72)", maxWidth: "540px", margin: "0 auto", lineHeight: "1.7" }}>{subtitle}</p>
      </div>

      {/* Advice heading */}
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "600", color: "#1F2937", margin: "0 0 20px 0" }}>
        What you should do
      </h3>

      {/* Advice cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {advice.map(a => (
          <AdviceCard key={a.title} {...a} accentColor={color} />
        ))}
      </div>

      {/* CTA row */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/register")}
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
          Join DiaBuddy Community
        </button>
        <button
          onClick={onRetake}
          style={{
            background: "transparent", color: "#6B7280",
            border: "1.5px solid #D1D5DB", borderRadius: "50px", padding: "14px 28px",
            fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#9CA3AF"; e.currentTarget.style.color = "#374151"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.color = "#6B7280"; }}
        >
          Take Again
        </button>
      </div>
    </div>
  );
};

/* ── main component ── */
const RiskAssessment = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(-1); // -1 = intro screen
  const [answers, setAnswers] = useState([]); // { id, label, points }
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
    const nextAnswers = [...answers, { id: q.id, label: option.label, points: option.points }];

    let nextFlow = quizFlow;
    if (q.id === 'sex') {
      nextFlow = buildQuizFlow(option.label);
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

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--cream-soft, #F6EFDD)", minHeight: "100vh", paddingTop: "88px", paddingBottom: "64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

          {/* Page header */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ display: "inline-block", background: "#022D20", color: "#64E3C0", borderRadius: "20px", padding: "6px 18px", fontSize: "12px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif" }}>
              Free · 60 seconds · No sign-up needed
            </span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "700", color: "#022D20", margin: "0 0 16px 0", lineHeight: "1.15" }}>
              Know Your Diabetes Risk
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", color: "#374151", maxWidth: "560px", margin: "0 auto", lineHeight: "1.7" }}>
              Aligned with the ADA Type 2 Diabetes Risk Test. Answer a few questions — a score of 5+ means talk to your doctor about screening.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)", gap: "40px", alignItems: "start" }}>

            {/* ── LEFT: Stats + Result panel ── */}
            <div>
              {/* Stats banner */}
              <div style={{
                background: "linear-gradient(135deg, #022D20 0%, #013B2A 60%, #024030 100%)",
                borderRadius: "24px", padding: "32px", marginBottom: "32px",
                boxShadow: "0 12px 40px rgba(2,45,32,0.3)",
              }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "3px", color: "#67E7C5", fontSize: "11px", margin: "0 0 12px 0", fontWeight: "600" }}>Global Diabetes Stats</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#fff", margin: "0 0 8px 0", lineHeight: "1.3" }}>Knowledge is your superpower</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#86EFAC", margin: "0 0 24px 0", lineHeight: "1.6" }}>Understanding your risk is the most powerful thing you can do for your future health.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  {[
                    { val: `${stats.diabetes}M`, label: "Adults living with diabetes" },
                    { val: `${stats.undiagnosed}%`, label: "Cases undiagnosed today" },
                    { val: `${stats.prevented}%`, label: "T2D cases preventable" },
                  ].map(s => (
                    <div key={s.label} style={{
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
                />
              )}

              {/* Already diagnosed path */}
              {showAlreadyDiagnosed && !quizComplete && (
                <ResultPanel
                  resultKey="diagnosed"
                  score={0}
                  onRetake={resetAssessment}
                  navigate={navigate}
                />
              )}
            </div>

            {/* ── RIGHT: Quiz card ── */}
            <div style={{ position: "sticky", top: "108px" }}>
              <div style={{
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
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#022D20", margin: "0 0 12px 0" }}>Ready to check your risk?</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#6B7280", margin: "0 0 28px 0", lineHeight: "1.7" }}>Based on the ADA Diabetes Risk Test — age, sex, family history, blood pressure, activity, and weight. Anonymous and free.</p>
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
                        Start the Assessment
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
                        I already have diabetes
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
                        {currentQuestion + 1} of {quizFlow.length}
                      </span>
                      <div style={{ flexGrow: 1, height: "6px", background: "#F3F4F6", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", background: "linear-gradient(90deg, #022D20, #2D6A4F)",
                          borderRadius: "10px", width: `${progress}%`,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>

                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "600", color: "#1F2937", margin: "0 0 24px 0", minHeight: "80px", lineHeight: "1.4" }}>
                      {quizFlow[currentQuestion].question}
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {quizFlow[currentQuestion].options.map(option => (
                        <button
                          key={option.label}
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
                          {option.label}
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
                      Score
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
                      {score >= 5 ? "Higher risk" : score >= 3 ? "Borderline" : "Lower risk"}
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
                      Take again
                    </button>
                  </div>
                )}

                {/* Already diagnosed path in card */}
                {showAlreadyDiagnosed && !quizComplete && (
                  <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#1D4ED8", margin: "0 0 8px 0" }}>Living with diabetes</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#6B7280", margin: "0 0 20px 0", lineHeight: "1.7" }}>You're not alone. Millions manage it well every day — here are the most important things to focus on.</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#9CA3AF" }}>See your personalized guide on the left</p>
                    <button
                      onClick={resetAssessment}
                      style={{
                        marginTop: "24px", background: "transparent", color: "#6B7280",
                        border: "1.5px solid #E5E7EB", borderRadius: "50px", padding: "10px 24px",
                        fontSize: "14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Go back
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default RiskAssessment;