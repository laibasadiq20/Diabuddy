import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import LoginFormContent from '../../components/auth/LoginFormContent';
import RegisterFormContent from '../../components/auth/RegisterFormContent';
import loginImage from '../../assets/login.png';

/**
 * Shared auth screen for /login and /register.
 * Locked to the viewport (no page scroll); the form column can scroll
 * internally only when the register face is taller than the screen.
 */
export default function AuthFlipCard({ startFlipped = false }) {
  const [isFlipped, setIsFlipped] = useState(startFlipped);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cardHeight, setCardHeight] = useState('auto');
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const navigate = useNavigate();

  const syncCardHeight = () => {
    const el = isFlipped ? backRef.current : frontRef.current;
    if (el) {
      setCardHeight(`${el.offsetHeight}px`);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    syncCardHeight();
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(() => syncCardHeight());
    observer.observe(front);
    observer.observe(back);
    return () => observer.disconnect();
  }, [isFlipped]);

  const goToRegister = () => {
    setHasInteracted(true);
    setIsFlipped(true);
    window.history.replaceState(null, '', '/register');
  };

  const goToLogin = () => {
    setHasInteracted(true);
    setIsFlipped(false);
    window.history.replaceState(null, '', '/login');
  };

  return (
    <div
      className="db-auth-shell"
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        background: '#1A1A1A',
        display: 'flex',
        fontFamily: 'var(--font-body, Inter, sans-serif)',
      }}
    >
      {/* Left panel — Image background */}
      <div className="hidden lg:flex relative w-[38%] overflow-hidden flex-col justify-between p-12">
        <img
          src={loginImage}
          alt="DiaBuddy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Right panel — warm flip cards */}
      <div className="db-auth-panel flex-1 flex items-center justify-center bg-[#efe7e0ce]">
        <div className="db-auth-inner w-full max-w-[440px]">
          <div className="mb-4 lg:hidden">
            <Logo size={30} textSize={17} variant="light" />
          </div>

          <div className="flip-perspective w-full">
            <div
              className={`flip-card-inner${isFlipped ? ' is-flipped' : ''}${!hasInteracted ? ' flip-no-transition' : ''}`}
              style={{
                height: cardHeight === 'auto' ? undefined : cardHeight,
                minHeight: cardHeight === 'auto' ? '420px' : undefined,
              }}
            >
              <div
                ref={frontRef}
                className="flip-face flip-face-front"
                style={{
                  background: 'linear-gradient(145deg, #C9D3C4 0%, #E7EFE2 50%, #F1F5EE 100%)',
                  border: '1px solid rgba(168, 184, 154, 0.3)',
                  borderRadius: 'var(--radius, 16px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
                  padding: 'clamp(18px, 4vw, 32px) clamp(16px, 3.5vw, 28px)',
                }}
              >
                <LoginFormContent
                  navigate={navigate}
                  onForgotPassword={() => navigate('/forgot-password')}
                  onSwitchToRegister={goToRegister}
                />
              </div>

              <div
                ref={backRef}
                className="flip-face flip-face-back"
                style={{
                  background: 'linear-gradient(145deg, #f1eee4 0%, #e8e5dd 30%, #e7eac5 100%)',
                  border: '1px solid rgba(232, 207, 122, 0.3)',
                  borderRadius: 'var(--radius, 16px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.6)',
                  padding: 'clamp(16px, 3.5vw, 28px) clamp(14px, 3vw, 26px)',
                }}
              >
                <RegisterFormContent
                  navigate={navigate}
                  onSwitchToLogin={goToLogin}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .db-auth-panel {
          height: 100%;
          min-height: 0;
          overflow: hidden;
          padding: 16px;
        }
        .db-auth-inner {
          max-height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          padding: 4px 2px;
        }
        @media (min-width: 640px) {
          .db-auth-panel { padding: 24px 32px; }
        }
        @media (min-width: 1024px) {
          .db-auth-panel { padding: 40px; }
          .db-auth-inner { overflow: visible; max-height: none; }
        }
      `}</style>
    </div>
  );
}
