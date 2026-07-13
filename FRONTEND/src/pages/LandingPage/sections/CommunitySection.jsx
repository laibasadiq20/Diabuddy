import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const CommunitySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section
      id="community"
      className="relative overflow-hidden bg-[var(--cream-soft)] px-6 py-20"
    >
      <div
        className="absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(168,184,154,0.18)' }}
      />
      <div
        className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(232,181,165,0.16)' }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1F3A2E] to-[#32493B] px-10 py-16 lg:px-16 lg:py-20">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-[var(--sage)]">
            Community
          </p>

          <h2 className="max-w-2xl font-serif text-4xl leading-[1.05] text-white md:text-6xl">
            Join people who{' '}
            <span className="italic text-[var(--sand)]">truly get it.</span>
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
            A calm space to ask questions, share experiences, and connect
            with others living with diabetes — no judgment, just genuine support.
          </p>

          <button
            onClick={() => navigate(user ? '/community' : '/login')}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[1rem] font-semibold text-[#1F3A2E] transition-all duration-300 hover:bg-[var(--sage)] hover:-translate-y-0.5"
          >
            {user ? 'Open the forum' : 'Join the community'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
