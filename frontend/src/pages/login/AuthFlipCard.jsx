import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import OrganicBackdrop from '../../components/OrganicBackdrop';
import LoginFormContent from '../../components/auth/LoginFormContent';
import RegisterFormContent from '../../components/auth/RegisterFormContent';
import { theme } from '../../theme';

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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', fontFamily: t.fontBody }}>
      {/* Left panel — branding, fixed and unchanged regardless of flip state */}
      <div
        style={{
          flex: '0 0 42%',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
        }}
        className="hidden md:flex"
      >
        <OrganicBackdrop tone="deep" />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={40} textSize={21} variant="light" />
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(247,243,236,0.12)',
            border: '1px solid rgba(247,243,236,0.2)', borderRadius: '20px',
            padding: '4px 12px', marginBottom: '22px',
          }}>
            <span style={{ color: '#F3DFD4', fontSize: '12px', fontWeight: '500', letterSpacing: '0.5px' }}>
              TRUSTED BY 12,000+ PATIENTS
            </span>
          </div>
          <h2 style={{ color: '#F7F3EC', fontSize: '34px', fontWeight: '500', lineHeight: '1.25', marginBottom: '16px', letterSpacing: '-0.3px', fontFamily: t.fontDisplay }}>
            Your health,<br />gently in check.
          </h2>
          <p style={{ color: 'rgba(247,243,236,0.65)', fontSize: '15px', lineHeight: '1.7', maxWidth: '290px' }}>
            Track glucose, medication, meals and activity — all in one calm place, made for everyday life with diabetes.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '40px' }}>
            {[['98%', 'Adherence rate'], ['4.9★', 'App rating'], ['24/7', 'Support']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ color: '#F7F3EC', fontSize: '21px', fontWeight: '600', fontFamily: t.fontDisplay }}>{val}</div>
                <div style={{ color: 'rgba(247,243,236,0.5)', fontSize: '12px', marginTop: '2px' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(247,243,236,0.15)', paddingTop: '24px' }}>
          <p style={{ color: 'rgba(247,243,236,0.7)', fontSize: '13px', fontStyle: 'italic', lineHeight: '1.6', fontFamily: t.fontDisplay }}>
            "DiaBuddy helped me lower my A1C by 1.2 points in 3 months."
          </p>
          <p style={{ color: 'rgba(247,243,236,0.4)', fontSize: '12px', marginTop: '8px' }}>— Sarah M., Type 2 Diabetic</p>
        </div>
      </div>

      {/* Right panel — the flipping auth card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: t.bg }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Mobile logo — sits above the card, outside the flip */}
          <div style={{ marginBottom: '28px' }} className="md:hidden">
            <Logo size={36} textSize={19} />
          </div>

          {/* Perspective wrapper: gives the 3D rotation depth */}
          <div className="flip-perspective" style={{ width: '100%' }}>
            <div
              className={`flip-card-inner${isFlipped ? ' is-flipped' : ''}${!hasInteracted ? ' flip-no-transition' : ''}`}
              style={{ minHeight: '600px' }}
            >
              {/* Front face — Login */}
              <div
                className="flip-face flip-face-front"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.line}`,
                  borderRadius: '18px',
                  boxShadow: t.shadowLifted,
                  padding: '36px 32px',
                }}
              >
                <LoginFormContent
                  navigate={navigate}
                  onForgotPassword={() => navigate('/forgot-password')}
                  onSwitchToRegister={goToRegister}
                />
              </div>

              {/* Back face — Register */}
              <div
                className="flip-face flip-face-back"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.line}`,
                  borderRadius: '18px',
                  boxShadow: t.shadowLifted,
                  padding: '36px 32px',
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
