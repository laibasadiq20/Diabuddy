import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const learnLinks = [
  { label: 'Warning signs', to: '/learn/warning-signs' },
  { label: 'Types of diabetes', to: '/learn/diabetes-types' },
  { label: 'Risk check', to: '/learn/risk-assessment' },
  { label: 'Blog', to: '/learn/blog' },
];

// Public contact for the marketing site
const CONTACT_EMAIL = 'hello@diabuddy.com';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToCommunity = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('community')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
      return;
    }

    document.getElementById('community')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <footer className="bg-[#0F1513] border-t border-white/10 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Top Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sage-deep)] text-[#0F1513]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21s-7-4.5-9.5-9.2C.8 8.2 3 4 7 4c2.1 0 3.5 1.1 5 3 1.5-1.9 2.9-3 5-3 4 0 6.2 4.2 4.5 7.8C19 16.5 12 21 12 21z"/>
                </svg>
              </span>

              <span className="font-serif text-xl text-white">
                DiaBuddy
              </span>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              A field guide to gentler care — written like a friend, for everyday living with diabetes.
            </p>
          </div>

          {/* Learn column */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              Learn
            </p>

            <ul className="space-y-2.5">
              {learnLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/60 transition-all duration-300 hover:text-[var(--sage)] hover:translate-x-1 inline-block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect column */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              Connect
            </p>

            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={scrollToCommunity}
                  className="text-sm text-white/60 transition-all duration-300 hover:text-[var(--sage)] hover:translate-x-1 inline-block text-left"
                >
                  Community
                </button>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-white/60 transition-all duration-300 hover:text-[var(--sage)] hover:translate-x-1 inline-block break-all"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-start">
          <p className="leading-relaxed">© {new Date().getFullYear()} DiaBuddy. Made quietly, in good company.</p>
          <p className="max-w-[420px] text-left leading-relaxed sm:text-right">
            Educational companion only — not medical advice, diagnosis, or emergency care.
            Always follow your clinician. Community posts are peer experiences, not prescriptions.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;