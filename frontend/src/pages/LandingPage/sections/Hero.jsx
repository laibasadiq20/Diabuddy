import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import heroImage from '../../../assets/hero-illustration.png';

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#F7F3EC]"
    >
      {/* Background Image */}
      <img
        src={heroImage}
        alt="DiaBuddy hero illustration"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Soft cream overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(189, 202, 177, 0.63) 0%, rgba(189, 202, 177, 0.63) 0%, rgba(233, 204, 204, 0.45) 65%, rgba(231, 220, 203, 0.1) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] py-12">
        <div className="max-w-[650px] px-6 sm:px-10 md:px-20 flex flex-col items-start">

          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-[#6B7550]" />
            <span className="text-[0.78rem] font-semibold uppercase tracking-[3px] text-[#6B5645]">
              A quiet companion · Est. 2026
            </span>
          </div>

          <h1 className="font-display font-light leading-[1.05] text-black text-[2.7rem] sm:text-[3.8rem] lg:text-[5rem] mb-6">
            A{' '}
            <span className="italic font-bold text-green-900 text-[3.5rem] sm:text-[4.8rem] lg:text-[6rem] leading-[0.9]">
              softer
            </span>{' '}
            way
            <br />
            to live with diabetes.
          </h1>

          <p className="text-[0.95rem] sm:text-[1.15rem] leading-[1.85] text-[#6B5645] max-w-[520px] mb-10">
            DiaBuddy is a calm, beautifully made companion for living with
            diabetes — log a reading, notice a pattern, breathe a little
            easier. A community that{' '}
            <strong className="italic font-semibold text-[#C56A3E]">
              actually gets it.
            </strong>
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full sm:w-auto">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-[#1E2A24] px-8 py-4 text-[1rem] font-semibold text-white transition-all duration-300 hover:bg-[#C56A3E] hover:-translate-y-0.5"
                >
                  Go to Dashboard 📊
                </button>

                <button
                  onClick={() => navigate('/community')}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border border-black/15 bg-white/40 backdrop-blur px-8 py-4 text-[1rem] font-semibold text-[#1E2A24] transition-all duration-300 hover:bg-black/5 hover:-translate-y-0.5"
                >
                  Community Forum 👥
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-[#1E2A24] px-8 py-4 text-[1rem] font-semibold text-white transition-all duration-300 hover:bg-[#C56A3E] hover:-translate-y-0.5"
                >
                  Join our community ↗
                </button>

                <button
                  onClick={() => navigate('/learn/risk-assessment')}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border-2 border-[#1E2A24]/30 bg-[#1E2A24]/8 backdrop-blur px-8 py-4 text-[1rem] font-semibold text-[#1E2A24] transition-all duration-300 hover:border-[#C56A3E] hover:text-[#C56A3E] hover:-translate-y-0.5"
                >
                  Take the Risk Test →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;