import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const snippets = [
  { initial: 'M', name: 'Maya', text: 'Morning highs finally making sense…' },
  { initial: 'J', name: 'Jordan', text: 'Anyone have a go-to low-carb lunch?' },
  { initial: 'S', name: 'Sam', text: 'CGM placement tip that saved my week.' },
];

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
        <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1F3A2E] to-[#32493B] px-8 py-12 lg:px-14 lg:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-[var(--sage)]">
                Community
              </p>

              <h2 className="max-w-xl font-serif text-4xl leading-[1.05] text-white md:text-5xl">
                Join people who{' '}
                <span className="italic text-[var(--sand)]">truly get it.</span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
                A calm space to ask questions, share experiences, and connect
                with others living with diabetes — no judgment, just genuine support.
              </p>

              <button
                onClick={() => navigate(user ? '/community' : '/login')}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[0.95rem] font-semibold text-[#1F3A2E] transition-all duration-300 hover:bg-[var(--sage)] hover:-translate-y-0.5"
              >
                {user ? 'Open the forum' : 'Join the community'}
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Compact conversation strip */}
            <div className="space-y-2.5">
              {snippets.map((s, i) => (
                <div
                  key={s.name}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3.5 py-3 backdrop-blur-sm"
                  style={{ marginLeft: i === 1 ? '1.25rem' : i === 2 ? '0.5rem' : 0 }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--sand)] text-sm font-bold text-[#1F3A2E]">
                    {s.initial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-white/90">{s.name}</p>
                    <p className="truncate text-[12px] text-white/65">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
