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
      <img
        src={heroImage}
        alt="DiaBuddy hero illustration"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(189, 202, 177, 0.63) 0%, rgba(189, 202, 177, 0.63) 0%, rgba(233, 204, 204, 0.45) 65%, rgba(231, 220, 203, 0.1) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] py-12">
        <div className="max-w-[650px] px-6 sm:px-10 md:px-20 flex flex-col items-start">

          <p className="mb-4 font-display text-[3.2rem] sm:text-[4.5rem] lg:text-[6rem] font-semibold leading-[0.95] tracking-tight text-[#1E2A24]">
            DiaBuddy
          </p>

          <h1 className="font-display font-light leading-[1.15] text-[#1E2A24] text-[1.65rem] sm:text-[2.1rem] lg:text-[2.5rem] mb-6">
            A{' '}
            <span className="italic font-semibold text-[#3D5A45]">
              softer
            </span>{' '}
            way to live with diabetes.
          </h1>

          <p className="text-[0.95rem] sm:text-[1.1rem] leading-[1.85] text-[#6B5645] max-w-[480px] mb-10">
            Log a reading, notice a pattern, breathe a little easier —
            with a community that actually gets it.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full sm:w-auto">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-[#1E2A24] px-8 py-4 text-[1rem] font-semibold text-white transition-all duration-300 hover:bg-[#C56A3E] hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </button>

                <button
                  onClick={() => navigate('/community')}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border border-black/15 bg-white/40 backdrop-blur px-8 py-4 text-[1rem] font-semibold text-[#1E2A24] transition-all duration-300 hover:bg-black/5 hover:-translate-y-0.5"
                >
                  Community Forum
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-[#1E2A24] px-8 py-4 text-[1rem] font-semibold text-white transition-all duration-300 hover:bg-[#C56A3E] hover:-translate-y-0.5"
                >
                  Join our community
                </button>

                <button
                  onClick={() => navigate('/learn/risk-assessment')}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border-2 border-[#1E2A24]/30 bg-[#1E2A24]/8 backdrop-blur px-8 py-4 text-[1rem] font-semibold text-[#1E2A24] transition-all duration-300 hover:border-[#C56A3E] hover:text-[#C56A3E] hover:-translate-y-0.5"
                >
                  Take the Risk Test
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
