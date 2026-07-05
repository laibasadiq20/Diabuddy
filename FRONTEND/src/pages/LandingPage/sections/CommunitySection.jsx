import React from 'react';
import { Sparkles } from 'lucide-react';

const CommunitySection = () => {
  return (
    <section
      id="community"
      className="relative overflow-hidden bg-[var(--cream-soft)] px-6 py-20"
    >
      {/* Background glow */}
      <div
        className="absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(168,184,154,0.18)' }}
      />

      <div
        className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(232,181,165,0.16)' }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1F3A2E] to-[#32493B] p-10 lg:grid-cols-[1.2fr_1fr] lg:p-14">

          {/* LEFT SIDE */}
          <div>
            <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.25em] text-[var(--sage)]">
              <Sparkles size={14} />
              Our Community Forum
            </div>

            <h2 className="font-serif text-5xl leading-[1.05] text-white md:text-6xl">
              Join people who{' '}
              <span className="italic text-[var(--sand)]">
                truly get it.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
              A calm space to ask questions, share experiences,
              and connect with others living with diabetes —
              no judgment, just genuine support.
            </p>

            <div className="mt-10 flex flex-wrap gap-10">
              {[
                ['10K+', 'Members'],
                ['50K+', 'Discussions'],
                ['24/7', 'Support'],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-serif text-5xl text-[var(--sage)]">
                    {value}
                  </p>

                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/50">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="rounded-[28px] bg-white p-8 shadow-[0_30px_70px_rgba(0,0,0,0.25)]">
            <h3 className="mb-6 text-center font-serif text-3xl text-[var(--brown)]">
              Join Community
            </h3>

            {/* Inputs in row */}
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="email"
                placeholder="Email address"
                className="rounded-xl border border-[var(--line)] bg-[var(--cream-soft)] px-4 py-3 text-[var(--brown)] placeholder:text-[var(--brown-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/20"
              />

              <input
                type="password"
                placeholder="Password"
                className="rounded-xl border border-[var(--line)] bg-[var(--cream-soft)] px-4 py-3 text-[var(--brown)] placeholder:text-[var(--brown-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/20"
              />
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-[var(--sage)] to-[var(--sage-deep)] py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1"
            >
              Sign In & Join
            </button>

            <div className="my-5 flex items-center gap-4 text-sm text-[var(--brown-soft)]">
              <div className="h-px flex-1 bg-[var(--line)]"></div>
              or
              <div className="h-px flex-1 bg-[var(--line)]"></div>
            </div>

            {/* Social buttons side-by-side */}
            <div className="grid gap-3 md:grid-cols-2">
              <button
                className="rounded-xl border border-[var(--line)] bg-white py-3 font-medium text-[var(--brown)] transition hover:bg-[var(--cream-soft)]"
              >
                Google
              </button>

              <button
                className="rounded-xl border border-[var(--line)] bg-white py-3 font-medium text-[var(--brown)] transition hover:bg-[var(--cream-soft)]"
              >
                Apple
              </button>
            </div>

            <p className="mt-5 text-center text-sm text-[var(--brown-soft)]">
              No account yet?{' '}
              <a
                href="#"
                className="font-semibold text-[var(--sage-deep)]"
              >
                Create one free
              </a>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CommunitySection;