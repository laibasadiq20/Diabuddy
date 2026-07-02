import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";

const questions = [
  {
    question: "What's your age range?",
    options: ["Under 45", "45 or older"],
  },
  {
    question: "Do you have a family history of diabetes?",
    options: ["Yes", "No"],
  },
  {
    question: "How active are you?",
    options: ["Active regularly", "Mostly inactive"],
  },
  {
    question: "Are you overweight or obese?",
    options: ["Yes", "No"],
  },
  {
    question: "Have you ever been told you have high blood pressure?",
    options: ["Yes", "No"],
  },
];

const RiskIcon = ({ type, className }) => {
  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "triangle") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M12 4l9 15H3l9-15z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 10v4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17" r="0.9" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" />
    </svg>
  );
};

const RiskAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  const [stats, setStats] = useState({
    diabetes: 0,
    undiagnosed: 0,
    prevented: 0,
  });

  useEffect(() => {
    const duration = 2000;
    const interval = 20;

    const diabetesTarget = 537;
    const undiagnosedTarget = 50;
    const preventedTarget = 80;

    let diabetes = 0;
    let undiagnosed = 0;
    let prevented = 0;

    const timer = setInterval(() => {
      diabetes += diabetesTarget / (duration / interval);
      undiagnosed += undiagnosedTarget / (duration / interval);
      prevented += preventedTarget / (duration / interval);

      setStats({
        diabetes: Math.min(Math.floor(diabetes), diabetesTarget),
        undiagnosed: Math.min(
          Math.floor(undiagnosed),
          undiagnosedTarget
        ),
        prevented: Math.min(
          Math.floor(prevented),
          preventedTarget
        ),
      });

      if (
        diabetes >= diabetesTarget &&
        undiagnosed >= undiagnosedTarget &&
        prevented >= preventedTarget
      ) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleSelect = (option) => {
    const updatedAnswers = [...answers, option];
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 300);
    } else {
      setCurrentQuestion(questions.length);
    }
  };

  const score = answers.filter(
    (answer) =>
      answer === "45 or older" ||
      answer === "Yes" ||
      answer === "Mostly inactive"
  ).length;

  const progress =
    (Math.min(currentQuestion + 1, questions.length) /
      questions.length) *
    100;

  const resetAssessment = () => {
    setAnswers([]);
    setCurrentQuestion(0);
  };

  const getRisk = () => {
    if (score <= 1) {
      return {
        title: "Low Risk",
        color: "text-green-600",
        badgeBg: "bg-green-100",
        badgeRing: "ring-green-200",
        iconColor: "text-green-600",
        icon: "shield",
        message:
          "Based on your answers, you currently appear to have a low risk of developing Type 2 diabetes.",
      };
    }

    if (score <= 3) {
      return {
        title: "Moderate Risk",
        color: "text-orange-500",
        badgeBg: "bg-orange-100",
        badgeRing: "ring-orange-200",
        iconColor: "text-orange-500",
        icon: "triangle",
        message:
          "Your responses suggest a moderate risk of developing Type 2 diabetes. Improving lifestyle habits may help reduce your risk.",
      };
    }

    return {
      title: "High Risk",
      color: "text-red-500",
      badgeBg: "bg-red-100",
      badgeRing: "ring-red-200",
      iconColor: "text-red-500",
      icon: "octagon",
      message:
        "Your responses suggest a high risk of developing Type 2 diabetes. Consider speaking with a healthcare professional for further evaluation.",
    };
  };

  const risk = getRisk();

  return (
    <>
      <Navbar />

      <section className="bg-[var(--cream-soft)] px-6 pt-28 pb-16 flex items-center justify-center">
        <div className="w-full max-w-5xl rounded-[28px] overflow-hidden bg-gradient-to-r from-[#022D20] via-[#013B2A] to-[#024030] shadow-2xl grid lg:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="p-8 md:p-10 text-white flex flex-col justify-center">
            <p className="uppercase tracking-[0.35em] text-[#67E7C5] text-xs mb-4">
              Awareness
            </p>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              Knowledge is your
              <br />
              superpower
            </h1>

            <p className="text-green-100 text-sm leading-6 max-w-lg">
              Most people with prediabetes don't know they have it.
              Take our quick 60-second assessment to understand
              where you stand — no sign-up needed.
            </p>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">

              <div className="h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex flex-col justify-center items-center text-center">
                <h3 className="text-3xl font-bold text-[#3CE6C1]">
                  {stats.diabetes}M
                </h3>

                <p className="text-green-200 text-xs mt-2 leading-5">
                  Adults living with diabetes worldwide
                </p>
              </div>

              <div className="h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex flex-col justify-center items-center text-center">
                <h3 className="text-3xl font-bold text-[#3CE6C1]">
                  {stats.undiagnosed}%
                </h3>

                <p className="text-green-200 text-xs mt-2 leading-5">
                  Cases remain undiagnosed today
                </p>
              </div>

              <div className="h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex flex-col justify-center items-center text-center">
                <h3 className="text-3xl font-bold text-[#3CE6C1]">
                  {stats.prevented}%
                </h3>

                <p className="text-green-200 text-xs mt-2 leading-5">
                  Type 2 cases can be delayed or prevented
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center p-6 md:p-8">
            <div className="w-full max-w-sm min-h-[440px] rounded-[24px] bg-white p-6 shadow-2xl flex flex-col justify-center">

              {currentQuestion < questions.length ? (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-xs uppercase tracking-[3px] text-gray-400 whitespace-nowrap">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>

                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#64E3C0] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 min-h-[90px] flex items-center">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-4">
                    {questions[currentQuestion].options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className="w-full rounded-full border-2 border-gray-200 bg-[#D8E6E1] px-6 py-4 text-left text-lg font-medium text-gray-700 transition-all duration-300 hover:bg-[#BFD5CE] hover:border-[#64E3C0]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ring-4 ${risk.badgeBg} ${risk.badgeRing}`}
                  >
                    <RiskIcon type={risk.icon} className={`h-8 w-8 ${risk.iconColor}`} />
                  </div>

                  <h2 className="text-3xl font-bold text-[#013B2A] mb-4">
                    Assessment Complete
                  </h2>

                  <p className="text-xl text-gray-700 mb-4">
                    Your score:
                    <span className="font-bold text-[#013B2A] ml-2">
                      {score}/5
                    </span>
                  </p>

                  <h3 className={`text-2xl font-bold mb-6 ${risk.color}`}>
                    {risk.title}
                  </h3>

                  <p className="text-gray-600 leading-8">
                    {risk.message}
                  </p>

                  <button
                    onClick={resetAssessment}
                    className="mt-10 rounded-full bg-[#013B2A] px-8 py-4 text-white font-semibold transition hover:bg-[#02543C]"
                  >
                    Take Assessment Again
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default RiskAssessment;