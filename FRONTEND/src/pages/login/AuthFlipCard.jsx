import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import LoginFormContent from '../../components/auth/LoginFormContent';
import RegisterFormContent from '../../components/auth/RegisterFormContent';
import loginImage from '../../assets/login.png';

/**
 * Shared auth screen for /login and /register.
 * Viewport is locked (no page scroll). On small screens the card
 * scales down to fit so Create account never needs scrolling.
 */
export default function AuthFlipCard({ startFlipped = false }) {
  const [isFlipped, setIsFlipped] = useState(startFlipped);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cardHeight, setCardHeight] = useState('auto');
  const [fitScale, setFitScale] = useState(1);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const panelRef = useRef(null);
  const fitRef = useRef(null);
  const navigate = useNavigate();

  const syncCardHeight = () => {
    const el = isFlipped ? backRef.current : frontRef.current;
    if (el) setCardHeight(`${el.offsetHeight}px`);
  };

  const fitToViewport = () => {
    const panel = panelRef.current;
    const fit = fitRef.current;
    if (!panel || !fit) return;

    fit.style.transform = 'scale(1)';
    const available = panel.clientHeight - 12;
    const needed = fit.scrollHeight;
    if (needed > available && available > 0) {
      setFitScale(Math.max(0.72, available / needed));
    } else {
      setFitScale(1);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    syncCardHeight();
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(() => {
      syncCardHeight();
    });
    observer.observe(front);
    observer.observe(back);
    return () => observer.disconnect();
  }, [isFlipped]);

  useLayoutEffect(() => {
    fitToViewport();
  }, [isFlipped, cardHeight]);

  useEffect(() => {
    const onResize = () => fitToViewport();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isFlipped, cardHeight]);

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
      <div className="hidden lg:flex relative w-[38%] overflow-hidden flex-col justify-between p-12">
        <img
          src={loginImage}
          alt="DiaBuddy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div
        ref={panelRef}
        className="db-auth-panel flex-1 flex items-center justify-center bg-[#efe7e0ce]"
        style={{ height: '100%', minHeight: 0, overflow: 'hidden', padding: '8px 12px' }}
      >
        <div
          ref={fitRef}
          className="db-auth-fit w-full max-w-[400px]"
          style={{
            transform: `scale(${fitScale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          <div className="mb-3 lg:hidden">
            <Logo size={28} textSize={16} variant="light" />
          </div>

          <div className="flip-perspective w-full">
            <div
              className={`flip-card-inner${isFlipped ? ' is-flipped' : ''}${!hasInteracted ? ' flip-no-transition' : ''}`}
              style={{
                height: cardHeight === 'auto' ? undefined : cardHeight,
                minHeight: cardHeight === 'auto' ? '380px' : undefined,
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
                  padding: '20px 18px',
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
                  padding: '16px 16px',
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
