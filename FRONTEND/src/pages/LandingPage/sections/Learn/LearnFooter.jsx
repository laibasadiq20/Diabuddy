import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const LearnFooter = ({ className = '' }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { label: 'Home', path: '/', isHome: true },
    { label: 'Warning Signs', fullLabel: 'Warning Signs', path: '/learn/warning-signs' },
    { label: 'Risk Test', fullLabel: 'Risk Assessment', path: '/learn/risk-assessment' },
    { label: 'Types', fullLabel: 'Diabetes Types', path: '/learn/diabetes-types' },
    { label: 'Blogs', fullLabel: 'Wellness Blogs', path: '/learn/blog' },
  ];

  return (
    <footer
      className={`w-full bg-[#182C1E] border-t border-[#27392E] text-white sm:hidden ${className}`}
    >
      <div className="mx-auto w-full max-w-[1360px] px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand & Learning Hub Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-serif font-bold text-base sm:text-lg text-white tracking-tight">
            DiaBuddy
          </span>
          <span className="h-3 w-px bg-[#2E4A35]" />
          <span className="text-[#86EFAC] text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            Learning Hub
          </span>
        </div>

        {/* Navigation Links: Compact single-line pill row */}
        <nav className="flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold overflow-x-auto max-w-full no-scrollbar py-0.5">
          {links.map((link) => {
            const isActive =
              currentPath === link.path ||
              (link.path === '/learn/diabetes-types' && currentPath === '/learn');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2F6A4F] text-white font-bold shadow-xs'
                    : 'text-[#D1D5DB] hover:bg-[#27392E] hover:text-white'
                }`}
              >
                {link.isHome && <Home size={12} className="shrink-0" />}
                <span className="sm:hidden">{link.label}</span>
                <span className="hidden sm:inline">{link.fullLabel || link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Copyright (desktop only) */}
        <p className="text-[11px] text-[#9CA3AF] hidden lg:block shrink-0">
          © {new Date().getFullYear()} DiaBuddy
        </p>
      </div>
    </footer>
  );
};

export default LearnFooter;
