import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Send, Award } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Discover & Risk Assessment',
    tag: 'LEARN',
    description: 'Learn about diabetes types, warning signs, and estimate your risk with our calm, evidence-based assessment.',
  },
  {
    number: '02',
    title: 'Health Companion Dashboard',
    tag: 'LOG',
    description: 'Keep track of daily glucose values, meal macro percentages, and health goals in your personal dashboard.',
  },
  {
    number: '03',
    title: 'Interactive Discussion Board',
    tag: 'CONNECT',
    description: 'Participate in forums, vote in community polls, write posts, and mark the absolute best answers.',
  },
  {
    number: '04',
    title: 'Secure Peer-to-Peer Chat',
    tag: 'SUPPORT',
    description: 'Start one-on-one or group private messages with others who understand the journey.',
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  /* --- Mock Dashboard State (Step 2) --- */
  const [mockSteps, setMockSteps] = useState(5500);
  const [mockGlucose, setMockGlucose] = useState(110);
  const [mockMeals, setMockMeals] = useState([
    { name: 'Oatmeal & Berries', carbs: 24 }
  ]);
  const [mockNewMeal, setMockNewMeal] = useState('');
  const [mockNewCarbs, setMockNewCarbs] = useState('');

  const addMockMeal = (e) => {
    e.preventDefault();
    if (!mockNewMeal || !mockNewCarbs) return;
    setMockMeals([...mockMeals, { name: mockNewMeal, carbs: parseInt(mockNewCarbs) }]);
    setMockNewMeal('');
    setMockNewCarbs('');
  };

  /* --- Mock Community State (Step 3) --- */
  const [votedOption, setVotedOption] = useState(null);
  const [pollVotes, setPollVotes] = useState({
    juice: 42,
    tablets: 28,
    candy: 15
  });

  const handleVote = (option) => {
    if (votedOption) return;
    setVotedOption(option);
    setPollVotes(prev => ({
      ...prev,
      [option]: prev[option] + 1
    }));
  };

  const totalVotes = pollVotes.juice + pollVotes.tablets + pollVotes.candy;

  /* --- Mock Chat State (Step 4) --- */
  const [messages, setMessages] = useState([
    { sender: 'emily', text: "Just got my CGM! Do you have any tips on placement?", time: '10:14 AM' },
    { sender: 'me', text: "Awesome! Back of the arm is great, less chance of catching it on doors.", time: '10:15 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const sendMockMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([...messages, { sender: 'me', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  return (
    <section id="about" className="relative overflow-hidden bg-[#1E2A24] px-6 py-24">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-[#BDCAA1]/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#E7DCCB]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Title */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#BDCAA1]">
            — Interactive Walkthrough
          </p>
          <h2 className="font-display text-4xl leading-tight text-white md:text-6xl font-light">
            How to use <span className="italic text-[#E7DCCB] font-normal">DiaBuddy.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[1rem] leading-relaxed text-white/60">
            Click through each piece — learning, logging, community, and chat — to see how DiaBuddy fits into daily life.
          </p>
        </div>

        {/* Multi-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT SIDE: Interactive Stepper Buttons */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {steps.map((step, index) => {
              const isActiveStep = activeStep === index;
              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left rounded-2xl p-6 border transition-all duration-300 ${
                    isActiveStep 
                      ? 'bg-white/10 border-white/20 shadow-xl translate-x-1' 
                      : 'bg-transparent border-transparent opacity-50 hover:opacity-80 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-serif text-[#BDCAA1] text-lg font-bold">{step.number}</span>
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-black/30 text-[#E7DCCB] uppercase">
                      {step.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                </button>
              );
            })}
          </div>

          {/* RIGHT SIDE: Dynamic Interactive Mockups */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[500px] min-h-[400px] rounded-3xl border-2 border-black bg-[#F6F3EE] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              
              {/* Top Bar Decoration */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C56A3E]" />

              {/* STEP 1: Risk Assessment — links to full page */}
              {activeStep === 0 && (
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Learn
                      </span>
                      <span className="rounded bg-[#1E2A24] px-2 py-0.5 text-[10px] font-bold text-[#BDCAA1]">
                        Full page
                      </span>
                    </div>

                    <h4 className="mb-2 font-serif text-xl font-semibold text-gray-900">
                      Know your diabetes risk
                    </h4>
                    <p className="mb-6 text-sm leading-relaxed text-gray-500">
                      Five calm questions. Personalized next steps. No sign-up
                      needed — open the full assessment whenever you are ready.
                    </p>

                    <ul className="space-y-3 text-sm text-gray-700">
                      {[
                        'Age, family history, activity, and more',
                        'Clear risk level with practical advice',
                        'Takes about 60 seconds',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#BDCAA1]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/learn/risk-assessment')}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1E2A24] py-3.5 text-sm font-semibold text-white transition hover:bg-[#C56A3E]"
                  >
                    Take the risk assessment
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* STEP 2: Health Companion Dashboard Mockup */}
              {activeStep === 1 && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">My Personal Logger</span>
                      <span className="text-[10px] font-bold text-[#BDCAA1] bg-[#1E2A24] px-2 py-0.5 rounded">Demo Session</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white border border-black/5 rounded-2xl p-3">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Glucose Avg</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-bold font-serif text-gray-900">{mockGlucose}</span>
                          <span className="text-[9px] text-gray-500">mg/dL</span>
                        </div>
                        <input 
                          type="range" 
                          min="80" 
                          max="180" 
                          value={mockGlucose}
                          onChange={(e) => setMockGlucose(parseInt(e.target.value))}
                          className="w-full mt-1 accent-[#BDCAA1]"
                        />
                      </div>

                      <div className="bg-white border border-black/5 rounded-2xl p-3 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-bold">Steps Goal</p>
                          <p className="text-xs font-bold mt-1 text-gray-800">
                            {mockSteps.toLocaleString()} / 8,000
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-[#BDCAA1] h-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, (mockSteps / 8000) * 100)}%` }}
                          />
                        </div>
                        <button 
                          onClick={() => setMockSteps(prev => prev + 1500)}
                          className="mt-2 text-[10px] font-bold bg-[#1E2A24] text-white py-1 rounded-lg"
                        >
                          +1.5k steps
                        </button>
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Meals Logged today</h5>
                    <div className="flex flex-col gap-2 max-h-[110px] overflow-y-auto pr-1">
                      {mockMeals.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white py-1.5 px-3 rounded-lg border border-black/5 text-xs text-gray-700">
                          <span>{m.name}</span>
                          <span className="font-bold text-[#C56A3E]">{m.carbs}g carbs</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={addMockMeal} className="mt-4 pt-3 border-t border-black/5 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Meal..." 
                      value={mockNewMeal}
                      onChange={(e) => setMockNewMeal(e.target.value)}
                      className="flex-1 text-xs border border-gray-300 rounded-lg p-2 bg-white"
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Carbs" 
                      value={mockNewCarbs}
                      onChange={(e) => setMockNewCarbs(e.target.value)}
                      className="w-16 text-xs border border-gray-300 rounded-lg p-2 bg-white"
                      required
                    />
                    <button type="submit" className="bg-[#1E2A24] text-white rounded-lg p-2 hover:bg-[#C56A3E] transition">
                      <Plus size={14} />
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 3: Discussion Board Mockup */}
              {activeStep === 2 && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Community Forum</span>
                      <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">Active Thread</span>
                    </div>

                    <div className="flex items-start gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        S
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">Sarah_T1D</span>
                          <span className="text-[8px] bg-[#BDCAA1]/30 text-emerald-950 px-1 py-0.2 rounded font-bold">Patient</span>
                        </div>
                        <p className="text-xs font-serif font-semibold text-gray-900 mt-1">What is your go-to snack for low blood sugars?</p>
                      </div>
                    </div>

                    {/* Interactive Poll */}
                    <div className="bg-white border border-black/10 rounded-2xl p-4 flex flex-col gap-2.5 mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cast Your Vote</p>
                      
                      {[
                        { key: 'juice', label: 'Orange Juice', base: pollVotes.juice },
                        { key: 'tablets', label: 'Glucose Tabs', base: pollVotes.tablets },
                        { key: 'candy', label: 'Skittles / Candy', base: pollVotes.candy }
                      ].map(opt => {
                        const pct = Math.round((opt.base / totalVotes) * 100);
                        return (
                          <button
                            key={opt.key}
                            disabled={votedOption !== null}
                            onClick={() => handleVote(opt.key)}
                            className="w-full text-left relative overflow-hidden rounded-xl border border-gray-200 p-2.5 transition hover:border-[#BDCAA1] disabled:cursor-default"
                          >
                            {/* Vote Fill animation */}
                            {votedOption !== null && (
                              <div 
                                className="absolute inset-0 bg-[#BDCAA1]/15 transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            )}
                            <div className="relative z-10 flex justify-between text-xs text-gray-700">
                              <span className="font-medium">{opt.label}</span>
                              {votedOption !== null && <span className="font-bold">{pct}%</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Best Answer Highlight */}
                  <div className="mt-2 pt-2 border-t border-black/5 bg-[#BDCAA1]/10 rounded-2xl p-3 border border-[#BDCAA1]/30">
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-emerald-900">
                      <Award size={13} className="text-[#C56A3E]" />
                      <span>BEST ANSWER MARKED BY AUTHOR</span>
                    </div>
                    <p className="text-xs text-gray-700 italic">"Always keep orange juice boxes nearby. Liquid glucose hits the bloodstream twice as fast as solid carbs."</p>
                    <p className="text-[10px] text-gray-500 mt-1.5 text-right">— Dr. David (Endocrinologist)</p>
                  </div>
                </div>
              )}

              {/* STEP 4: Peer-to-Peer Chat Mockup */}
              {activeStep === 3 && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1E2A24] text-white flex items-center justify-center font-bold text-xs">E</div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-none">Emily Watson</p>
                        <span className="text-[8px] text-gray-400">Active now</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Encrypted</span>
                  </div>

                  {/* Messages Bubble Panel */}
                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[220px] mb-4 pr-1">
                    {messages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[80%] ${m.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div className={`p-2.5 rounded-2xl text-xs ${
                          m.sender === 'me' 
                            ? 'bg-[#1E2A24] text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 border border-black/5 rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[8px] text-gray-400 mt-0.5">{m.time} {m.sender === 'me' && '· Read'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={sendMockMessage} className="pt-3 border-t border-black/5 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 text-xs border border-gray-300 rounded-xl p-2.5 bg-white outline-none"
                    />
                    <button type="submit" className="bg-[#1E2A24] text-white rounded-xl p-2.5 hover:bg-[#C56A3E] transition shrink-0">
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;