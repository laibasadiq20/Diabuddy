import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import OrganicBackdrop from '../../components/OrganicBackdrop';
import LoginFormContent from '../../components/auth/LoginFormContent';
import RegisterFormContent from '../../components/auth/RegisterFormContent';
import { theme } from '../../theme';
import loginImage from '../../assets/login.png';

const t = theme;

/**
 * Shared auth screen for /login and /register.
 *
 * Both routes render this same component — only the `startFlipped` prop
 * differs — so visiting /register directly still lands on a real URL with
 * the register face showing, while clicking between the two in-app flips
 * the card instead of navigating. The browser URL is kept in sync via
 * history.replaceState (no navigate/remount) so a refresh on /register
 * still shows the register face without re-triggering the flip animation.
 *
 * Left branding panel is rendered once, outside the flip mechanism, and
 * never re-renders or animates when the card flips.
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
      style={{ 
        minHeight: '100vh', 
        background: '#1A1A1A',
        display: 'flex', 
        fontFamily: 'var(--font-body, Inter, sans-serif)'
      }}
    >
      {/* Left panel — Image background */}
      <div className="hidden lg:flex relative w-[38%] overflow-hidden flex-col justify-between p-12">
        {/* Background image */}
        <img
          src={loginImage}
          alt="DiaBuddy"
          className="absolute inset-0 h-full w-full object-fit
          "
        />
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />

        </div>

        
    
      {/* Right panel — warm flip cards */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 md:p-10 bg-[#efe7e0ce]">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="mb-7 lg:hidden">
            <Logo size={36} textSize={19} variant="light" />
          </div>

          {/* Perspective wrapper */}
          <div className="flip-perspective w-full">
            <div
              className={`flip-card-inner${isFlipped ? ' is-flipped' : ''}${!hasInteracted ? ' flip-no-transition' : ''}`}
              style={{ height: cardHeight === 'auto' ? undefined : cardHeight, minHeight: cardHeight === 'auto' ? '520px' : undefined }}
            >
              {/* Front face — Login - Sage Green */}
              <div
                ref={frontRef}
                className="flip-face flip-face-front"
                style={{
                  background: 'linear-gradient(145deg, #C9D3C4 0%, #E7EFE2 50%, #F1F5EE 100%)',
                  border: '1px solid rgba(168, 184, 154, 0.3)',
                  borderRadius: 'var(--radius, 16px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
                  padding: 'clamp(22px, 5vw, 36px) clamp(18px, 4vw, 32px)',
                }}
              >
                <LoginFormContent
                  navigate={navigate}
                  onForgotPassword={() => navigate('/forgot-password')}
                  onSwitchToRegister={goToRegister}
                />
              </div>

              {/* Back face — Register - Butter Yellow */}
              <div
                ref={backRef}
                className="flip-face flip-face-back"
                style={{
                  background: 'linear-gradient(145deg, #f1eee4 0%, #e8e5dd 30%, #e7eac5 100%)',
                  border: '1px solid rgba(232, 207, 122, 0.3)',
                  borderRadius: 'var(--radius, 16px)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.6)',
                  padding: 'clamp(22px, 5vw, 36px) clamp(18px, 4vw, 32px)',
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
    </div>
  );
}