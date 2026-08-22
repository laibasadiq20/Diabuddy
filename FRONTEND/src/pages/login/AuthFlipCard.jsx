import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import LoginFormContent from '../../components/auth/LoginFormContent';
import RegisterFormContent from '../../components/auth/RegisterFormContent';
import loginScenery from '../../assets/login-scenery.jpg';
import { useAuth } from '../../context/AuthContext';
import { homePathFor } from '../../utils/homePath';

/**
 * Pure Neutral Frosted Glassmorphism 3D Book Flip Auth Modal:
 * - Crystal clear neutral frosted glass with zero color tint
 * - Deep optical refraction blur and specular light highlights
 * - 3D Book Flip animation with forward-facing readable text
 */
export default function AuthFlipCard({ startFlipped = false }) {
  const [isFlipped, setIsFlipped] = useState(startFlipped);
  const [cardHeight, setCardHeight] = useState('auto');
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const syncHeight = () => {
    requestAnimationFrame(() => {
      const el = isFlipped ? backRef.current : frontRef.current;
      if (el) {
        setCardHeight(`${el.offsetHeight}px`);
      }
    });
  };

  useEffect(() => {
    if (!loading && user) navigate(homePathFor(user), { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    syncHeight();
    const handleResize = () => syncHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFlipped]);

  const goToRegister = () => {
    setIsFlipped(true);
    window.history.replaceState(null, '', '/register');
  };

  const goToLogin = () => {
    setIsFlipped(false);
    window.history.replaceState(null, '', '/login');
  };

  // Pure Neutral Frosted Glass (Zero Color Tint)
  const neutralGlassStyle = {
    background: 'rgba(255, 255, 255, 0.32)',
    backdropFilter: 'blur(30px) saturate(160%)',
    WebkitBackdropFilter: 'blur(30px) saturate(160%)',
    border: '1.5px solid rgba(255, 255, 255, 0.65)',
    boxShadow: `
      0 30px 80px -10px rgba(0, 0, 0, 0.22),
      0 12px 30px -5px rgba(0, 0, 0, 0.10),
      inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.85),
      inset 0 -1px 1px 0 rgba(255, 255, 255, 0.25)
    `,
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden font-sans select-none px-4 py-4 sm:py-6"
      style={{
        backgroundImage: `url(${loginScenery})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle Atmospheric Dimming */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* =========================================================
          TOP NAVBAR
      ========================================================== */}
      <header className="relative z-20 flex items-center justify-between px-2 sm:px-6">
        
        {/* Brand Logo Glass Pill */}
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-full px-4 py-2 transition-transform hover:scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)]"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255, 255, 255, 0.75)',
          }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-xs">
            <Heart size={13} fill="#FFFFFF" color="#FFFFFF" />
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-[#1A1A1A]">
            DiaBuddy
          </span>
        </Link>

        {/* Back to Home Glass Link */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#1A1A1A] transition-all hover:scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)]"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

      </header>

      {/* =========================================================
          CENTER: 3D BOOK FLIP NEUTRAL GLASS MODAL
      ========================================================== */}
      <main className="relative z-20 flex flex-1 items-center justify-center py-6">
        
        {/* 3D Perspective Viewport */}
        <div
          className="relative w-full max-w-[430px]"
          style={{
            perspective: '1600px',
            height: cardHeight,
            transition: 'height 0.4s ease-in-out',
          }}
        >
          
          {/* Flipping 3D Book Container */}
          <div
            className="relative w-full transition-transform duration-700 ease-in-out"
            style={{
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformOrigin: 'center center',
            }}
          >
            
            {/* FRONT PAGE: LOGIN (Pure Neutral Glass) */}
            <div
              ref={frontRef}
              className="w-full rounded-[32px] sm:rounded-[38px] p-7 sm:p-9"
              style={{
                ...neutralGlassStyle,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
              }}
            >
              <LoginFormContent
                navigate={navigate}
                onForgotPassword={() => navigate('/forgot-password')}
                onSwitchToRegister={goToRegister}
              />
            </div>

            {/* BACK PAGE: REGISTER (Pure Neutral Glass) */}
            <div
              ref={backRef}
              className="absolute top-0 left-0 w-full min-h-full rounded-[32px] sm:rounded-[38px] p-6 sm:p-8 flex flex-col justify-center"
              style={{
                ...neutralGlassStyle,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <RegisterFormContent
                navigate={navigate}
                onSwitchToLogin={goToLogin}
              />
            </div>

          </div>

        </div>

      </main>

      {/* =========================================================
          BOTTOM FOOTER BAR
      ========================================================== */}
      <footer className="relative z-20 pb-2 text-center text-xs font-bold text-[#1A1A1A] drop-shadow-xs">
        <span>© {new Date().getFullYear()} DiaBuddy · Your Daily Diabetes Care Companion</span>
      </footer>

    </div>
  );
}
