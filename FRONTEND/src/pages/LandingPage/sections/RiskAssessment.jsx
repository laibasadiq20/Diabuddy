import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "What's your age range?",
    options: ["Under 45", "45 or older"],
    riskOption: "45 or older",
  },
  {
    question: "Do you have a family history of diabetes?",
    options: ["Yes", "No"],
    riskOption: "Yes",
  },
  {
    question: "How physically active are you?",
    options: ["Active regularly", "Mostly inactive"],
    riskOption: "Mostly inactive",
  },
  {
    question: "Are you overweight or obese?",
    options: ["Yes", "No"],
    riskOption: "Yes",
  },
  {
    question: "Have you ever been told you have high blood pressure?",
    options: ["Yes", "No"],
    riskOption: "Yes",
  },
];

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
    title: "Great News — Low Risk",
    subtitle: "Your responses suggest a low risk of developing Type 2 diabetes.",
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
    title: "Moderate Risk — Take Action",
    subtitle: "Your responses suggest a moderate risk. Making lifestyle changes now can significantly reduce your chances of developing diabetes.",
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
    title: "High Risk — Please See a Doctor",
    subtitle: "Your responses indicate a high risk. This is urgent — but not a diagnosis. A doctor can give you clarity and a real action plan.",
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
const AdviceCard = ({ emoji, title, body, accentColor }) => (
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
      width: "44px", height: "44px", borderRadius: "12px",
      background: accentColor + "18",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "22px", flexShrink: 0,
    }}>{emoji}</div>
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
        background: bgColor,
        borderRadius: "24px",
        padding: "40px",
        marginBottom: "32px",
        textAlign: "center",
        border: `2px solid ${color}30`,
      }}>
        <div style={{ color, marginBottom: "16px" }}><Icon /></div>
        <div style={{ display: "inline-block", background: color, color: "#fff", borderRadius: "20px", padding: "4px 16px", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
          Score {score}/5
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "700", color: "#1F2937", margin: "0 0 12px 0", lineHeight: "1.2" }}>{title}</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#4B5563", maxWidth: "540px", margin: "0 auto", lineHeight: "1.7" }}>{subtitle}</p>
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
          Join DiaBuddy Community ↗
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
  const [answers, setAnswers] = useState([]);
  const [showAlreadyDiagnosed, setShowAlreadyDiagnosed] = useState(false);

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
    const updatedAnswers = [...answers, option];
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    } else {
      setCurrentQuestion(questions.length); // done
    }
  };

  const score = answers.filter((answer, i) => answer === questions[i]?.riskOption).length;

  const getResultKey = () => {
    if (showAlreadyDiagnosed) return "diagnosed";
    if (score <= 1) return "low";
    if (score <= 3) return "moderate";
    return "high";
  };

  const progress = (Math.min(currentQuestion + 1, questions.length) / questions.length) * 100;

  const resetAssessment = () => {
    setAnswers([]);
    setCurrentQuestion(-1);
    setShowAlreadyDiagnosed(false);
  };

  const quizComplete = currentQuestion >= questions.length;

  return (
    <>
      <Navbar />

      <section style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #F0F9FF 100%)", minHeight: "100vh", paddingTop: "88px", paddingBottom: "64px" }}>
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
              Most people with prediabetes don't know they have it. Answer 5 questions and get personalized advice.
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
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🩺</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: "#022D20", margin: "0 0 12px 0" }}>Ready to check your risk?</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#6B7280", margin: "0 0 28px 0", lineHeight: "1.7" }}>5 simple questions, completely anonymous. We'll give you personalized advice based on your answers.</p>
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
                {currentQuestion >= 0 && !quizComplete && !showAlreadyDiagnosed && (
                  <>
                    {/* Progress */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                        {currentQuestion + 1} of {questions.length}
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
                      {questions[currentQuestion].question}
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {questions[currentQuestion].options.map(option => (
                        <button
                          key={option}
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
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Quiz complete — score summary inside the card */}
                {quizComplete && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#022D20", margin: "0 0 8px 0" }}>Assessment complete!</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#6B7280", margin: "0 0 20px 0" }}>
                      Your risk score: <strong style={{ color: "#022D20", fontSize: "20px" }}>{score}/5</strong>
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#9CA3AF" }}>← See your personalized advice on the left</p>
                    <button
                      onClick={resetAssessment}
                      style={{
                        marginTop: "24px", background: "transparent", color: "#6B7280",
                        border: "1.5px solid #E5E7EB", borderRadius: "50px", padding: "10px 24px",
                        fontSize: "14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Take again
                    </button>
                  </div>
                )}

                {/* Already diagnosed path in card */}
                {showAlreadyDiagnosed && !quizComplete && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>💙</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#1D4ED8", margin: "0 0 8px 0" }}>Living with diabetes</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#6B7280", margin: "0 0 20px 0", lineHeight: "1.7" }}>You're not alone. Millions manage it well every day — here are the most important things to focus on.</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#9CA3AF" }}>← See your personalized guide on the left</p>
                    <button
                      onClick={resetAssessment}
                      style={{
                        marginTop: "24px", background: "transparent", color: "#6B7280",
                        border: "1.5px solid #E5E7EB", borderRadius: "50px", padding: "10px 24px",
                        fontSize: "14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      ← Go back
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