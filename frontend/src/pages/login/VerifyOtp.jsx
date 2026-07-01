import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, HeartPulse, RefreshCw, Mail } from 'lucide-react';
import { theme } from '../../theme';

const t = theme;

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const isLoginFlow = location.state?.mode === 'login';
  const password = location.state?.password || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
      return;
    }
    inputRefs.current[0]?.focus();
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(tm => tm - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length) {
      const newOtp = [...otp];
      pasted.split('').forEach((d, i) => { if (i < 6) newOtp[i] = d; });
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    try {
      const endpoint = isLoginFlow ? '/api/auth/verify-login-otp' : '/api/auth/verify-email';
      const payload = isLoginFlow ? { email, otp: otpCode } : { email, code: otpCode };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (data.data && data.data.token) {
            localStorage.setItem('token', data.data.token);
          }
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Incorrect code. Try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      if (isLoginFlow) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          setTimeLeft(300);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } else {
          setError(data.message || 'Failed to resend code');
        }
      } else {
        const response = await fetch('/api/auth/resend-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          setTimeLeft(300);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } else {
          setError(data.message || 'Failed to resend code');
        }
      }
    } catch {
      setError('Connection error');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const filled = otp.filter(Boolean).length;
  const progress = (filled / 6) * 100;

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: t.fontBody }}>
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: `radial-gradient(circle, ${t.sky}10 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }} className="db-animate-in">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '36px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: t.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={18} color="#fff" />
          </div>
          <span style={{ color: t.ink, fontSize: '19px', fontWeight: '600', fontFamily: t.fontDisplay }}>DiaBuddy</span>
        </div>

        <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: '18px', padding: '40px 32px', boxShadow: t.shadowLifted }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: t.sageTint, border: `1px solid ${t.sage}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color={t.sageDeep} />
              </div>
              <h2 style={{ color: t.ink, fontSize: '23px', fontWeight: '500', marginBottom: '8px', fontFamily: t.fontDisplay }}>{isLoginFlow ? 'Signed in successfully!' : 'Email verified!'}</h2>
              <p style={{ color: t.inkSoft, fontSize: '14px' }}>Taking you to your dashboard…</p>
              <div style={{ marginTop: '24px', height: '3px', background: t.line, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: t.sage, animation: 'db-progress 2s linear forwards' }} />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: t.skyTint, border: `1px solid ${t.sky}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Mail size={24} color={t.skyDeep} />
                </div>
                <h1 style={{ color: t.ink, fontSize: '23px', fontWeight: '500', marginBottom: '8px', letterSpacing: '-0.2px', fontFamily: t.fontDisplay }}>
                  {isLoginFlow ? 'Complete sign in' : 'Check your email'}
                </h1>
                <p style={{ color: t.inkSoft, fontSize: '13px', lineHeight: '1.6' }}>
                  {isLoginFlow
                    ? 'Enter the 6-digit code sent to '
                    : 'We sent a 6-digit code to '}{' '}
                  <span style={{ color: t.skyDeep, fontWeight: '600' }}>{email || 'your email'}</span>
                </p>
              </div>

              {error && (
                <div style={{ background: t.clayTint, border: `1px solid ${t.clay}35`, borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', color: t.clayDeep, fontSize: '13px', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* OTP inputs */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '8px' }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      value={digit}
                      onChange={e => handleChange(e.target.value, i)}
                      onKeyDown={e => handleKeyDown(e, i)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      maxLength="1"
                      inputMode="numeric"
                      style={{
                        width: '46px', height: '56px',
                        textAlign: 'center', fontSize: '22px', fontWeight: '600',
                        fontFamily: t.fontDisplay,
                        background: digit ? t.skyTint : t.surfaceSunken,
                        border: `2px solid ${digit ? t.sky + '60' : t.line}`,
                        borderRadius: '12px', color: t.ink, outline: 'none',
                        transition: 'all 0.2s', cursor: 'text',
                      }}
                      onFocus={e => { e.target.style.borderColor = t.sky; e.target.style.boxShadow = `0 0 0 3px ${t.sky}1a`; }}
                      onBlur={e => { e.target.style.borderColor = digit ? t.sky + '60' : t.line; e.target.style.boxShadow = 'none'; }}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ height: '3px', background: t.line, borderRadius: '2px', margin: '16px 0 24px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: t.sky, transition: 'width 0.2s' }} />
                </div>

                {/* Timer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
                  <Clock size={14} color={timeLeft <= 60 ? t.clay : t.inkSoft} />
                  <span style={{ fontSize: '13px', color: timeLeft <= 60 ? t.clayDeep : t.inkSoft, fontWeight: '500' }}>
                    Code expires in {formatTime(timeLeft)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || filled < 6}
                  style={{
                    width: '100%', padding: '13px',
                    background: filled === 6 && !loading ? t.sky : t.surfaceSunken,
                    border: 'none', borderRadius: '10px',
                    color: filled === 6 && !loading ? '#fff' : t.inkFaint,
                    fontSize: '14px', fontWeight: '600',
                    cursor: filled === 6 && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Verifying…' : (isLoginFlow ? <>Verify & sign in <ArrowRight size={16} /></> : <>Verify code <ArrowRight size={16} /></>)}
                </button>
              </form>

              {/* Resend */}
              <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '24px', borderTop: `1px solid ${t.line}` }}>
                <p style={{ color: t.inkFaint, fontSize: '13px', marginBottom: '12px' }}>Didn't receive it?</p>
                <button
                  onClick={handleResend}
                  disabled={timeLeft > 0 || resending}
                  style={{
                    background: 'none', border: 'none', cursor: timeLeft > 0 ? 'not-allowed' : 'pointer',
                    color: timeLeft > 0 ? t.inkFaint : t.skyDeep,
                    fontSize: '13px', fontWeight: '600',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontFamily: 'inherit', padding: 0,
                  }}
                >
                  <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                  {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : resending ? 'Sending…' : 'Resend code'}
                </button>
              </div>

              {/* Tip */}
              <div style={{ marginTop: '20px', background: t.goldTint, border: `1px solid ${t.gold}30`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ color: '#8a6b22', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: t.gold }}>Tip:</strong> Check your spam folder if you don't see the email within 1 minute.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
