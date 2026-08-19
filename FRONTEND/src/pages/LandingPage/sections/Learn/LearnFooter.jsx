import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const LearnFooter = ({ className = '' }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { label: 'Wellness Blog', path: '/learn/blog' },
    { label: 'Warning Signs', path: '/learn/warning-signs' },
    { label: 'Diabetes Types', path: '/learn/diabetes-types' },
    { label: 'Risk Assessment', path: '/learn/risk-assessment' },
  ];

  return (
    <div
      className={`mx-auto w-full max-w-[1360px] rounded-[22px] sm:rounded-[28px] border-2 border-[#5B7E67]/35 bg-white/95 p-4 sm:p-5 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 ${className}`}
    >
      {/* Medical Note with Top-aligned Icon */}
      <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
        <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-[#E3EBDD] text-[#2E6B3E] mt-0.5">
          <Sparkles size={15} />
        </span>
        <p className="text-xs sm:text-[13px] text-[#5F5446] font-medium leading-relaxed">
          <span className="font-bold text-[#1E2A24]">Medical Note:</span> All curated articles are for educational wellness awareness. Always consult your doctor for personalized health advice.
        </p>
      </div>

      {/* Navigation: Responsive 2x2 Grid on Mobile, Clean Links on Desktop */}
      <div className="w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#E7DFCE]/80 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#7A746A] md:hidden block mb-2">
          Explore Learning Hub:
        </span>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 md:gap-3.5 text-xs font-bold">
          {links.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 md:p-0 rounded-xl md:rounded-none text-center transition-all ${
                  isActive
                    ? 'bg-[#2E6B3E] text-white md:bg-transparent md:text-[#1E2A24] md:underline md:underline-offset-4 pointer-events-none font-bold'
                    : 'bg-[#F6F3EB] hover:bg-[#E3EBDD] text-[#2E6B3E] md:bg-transparent md:hover:text-[#1E2A24]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearnFooter;
