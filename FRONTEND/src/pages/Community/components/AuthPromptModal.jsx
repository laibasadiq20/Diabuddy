import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Sparkles, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

export default function AuthPromptModal({ isOpen, onClose, actionName = 'interact with this post' }) {
  const navigate = useNavigate();
  const { t: tr } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl border border-[#E8E2D9] bg-[#FAF7F2] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#554D43] hover:bg-white hover:text-black transition-colors cursor-pointer border border-[#E8E2D9]"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Icon Badge */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DFE8DC] text-[#2E6B3E] mb-4">
          <Users size={24} />
        </div>

        {/* Heading */}
        <h3 className="font-serif text-2xl font-bold text-[#1E2A24] tracking-tight">
          Join the Conversation
        </h3>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#5F5446] font-medium">
          Create a free account to {actionName}, share your Pakistani food recipes, and connect with people on the same journey.
        </p>

        {/* Trust Badges */}
        <div className="my-5 space-y-2 rounded-2xl bg-white/80 p-3.5 border border-[#E8E2D9]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2A24]">
            <Sparkles size={14} className="text-amber-600" />
            <span>100% Free — no credit card required</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2A24]">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Option to post 100% anonymously anytime</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full rounded-2xl bg-[#1E2A24] hover:bg-[#2A3B33] text-white py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>Sign Up Free in 30 Seconds</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-2xl bg-white hover:bg-white/80 text-[#1E2A24] border border-[#E8E2D9] py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
