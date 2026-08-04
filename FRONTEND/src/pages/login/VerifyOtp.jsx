import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, HeartPulse, RefreshCw, Mail } from 'lucide-react';
import { theme } from '../../theme';
import { API_URL } from "../../config/api";
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { homePathFor } from '../../utils/homePath';
const t = theme;

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUser, saveSession } = useAuth();
  const { t: tr } = useI18n();
  const email = location.state?.email || '';
  const isLoginFlow = location.state?.mode === 'login';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLeft, setResendLeft] = useState(60);
  const [expireLeft, setExpireLeft] = useState(15 * 60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
  inputRefs.current[0]?.focus();
}, []);

  useEffect(() => {
    if (resendLeft <= 0) return;
    const timer = setTimeout(() => setResendLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendLeft]);

  useEffect(() => {
    if (expireLeft <= 0) return;
    const timer = setTimeout(() => setExpireLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [expireLeft]);

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
    if (otpCode.length !== 6) { setError(tr('auth.verifyOtp.enterAllDigits')); return; }
    setLoading(true);
    setError('');
    try {
const endpoint = `${API_URL}/auth/verify-email`;
const payload = {
  email,
  code: otpCode,
};
      const response = await fetch(endpoint, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        let nextUser = data?.data || null;
        if (nextUser) {
          saveSession(null, nextUser);
        } else {
          nextUser = await fetchUser();
        }
        setTimeout(() => {
          navigate(homePathFor(nextUser));
        }, 1200);
      } else {
        setError(data.message || tr('auth.verifyOtp.incorrectCode'));
      }
    } catch {
      setError(tr('auth.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/resend-code`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setResendLeft(30);
        setExpireLeft(15 * 60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || tr('auth.verifyOtp.failedToResend'));
      }
    } catch {
      setError(tr('auth.verifyOtp.connectionErrorShort'));
    } finally {
      setResending(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const filled = otp.filter(Boolean).length;
  const progress = (filled / 6) * 100;

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 16px', 
      fontFamily: t.fontBody,
      background: t.bg,
    }}>
      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }} className="db-animate-in">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: t.forest, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={16} color="#FFFFFF" />
          </div>
          <span style={{ color: t.ink, fontSize: '17px', fontWeight: '600', fontFamily: t.fontDisplay }}>DiaBuddy</span>
        </div>

        {/* Card */}
        <div style={{ 
          background: t.surface, 
          border: `1.5px solid ${t.lineStrong}`, 
          borderRadius: '16px', 
          padding: '28px 24px', 
          boxShadow: t.shadowLifted,
        }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: t.sageTint, border: `1px solid ${t.sage}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={28} color={t.sageDeep} />
              </div>
              <h2 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '700', marginBottom: '6px', fontFamily: t.fontDisplay }}>{isLoginFlow ? tr('auth.verifyOtp.signedIn') : tr('auth.verifyOtp.emailVerified')}</h2>
              <p style={{ color: '#333333', fontSize: '13px', fontWeight: '500' }}>{tr('auth.verifyOtp.takingToDashboard')}</p>
              <div style={{ marginTop: '20px', height: '3px', background: t.line, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: t.sageDeep, animation: 'db-progress 2s linear forwards' }} />
              </div>
            </div>
          ) : (
            <>
              {/* Header - Compact */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: t.sageTint, border: `1px solid ${t.sage}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Mail size={20} color={t.sageDeep} />
                </div>
                <h1 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.2px', fontFamily: t.fontDisplay }}>
                  {isLoginFlow ? tr('auth.verifyOtp.completeSignIn') : tr('auth.verifyOtp.checkYourEmail')}
                </h1>
                <p style={{ color: '#333333', fontSize: '12px', lineHeight: '1.5', fontWeight: '500' }}>
                  {isLoginFlow
                    ? tr('auth.verifyOtp.codeSentTo')
                    : tr('auth.verifyOtp.weSentCodeTo')}{' '}
                  <span style={{ color: t.sageDeep, fontWeight: '700' }}>{email || tr('auth.verifyOtp.yourEmail')}</span>
                </p>
              </div>

              {error && (
                <div style={{ background: t.clayTint, border: `1px solid ${t.clay}35`, borderRadius: '8px', padding: '8px 12px', marginBottom: '16px', color: '#8B0000', fontSize: '11px', textAlign: 'center', fontWeight: '600' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* OTP inputs - Compact */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '6px' }}>
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
                        width: '40px', height: '48px',
                        textAlign: 'center', fontSize: '20px', fontWeight: '700',
                        fontFamily: t.fontDisplay,
                        background: digit ? t.sageTint : '#F5F5F5',
                        border: `2px solid ${digit ? t.sageDeep : 'rgba(0, 0, 0, 0.25)'}`,
                        borderRadius: '10px', color: '#1A1A1A', outline: 'none',
                        transition: 'all 0.2s', cursor: 'text',
                      }}
                      onFocus={e => { e.target.style.borderColor = t.sageDeep; e.target.style.boxShadow = `0 0 0 3px ${t.sageDeep}1a`; }}
                      onBlur={e => { e.target.style.borderColor = digit ? t.sageDeep : 'rgba(0, 0, 0, 0.25)'; e.target.style.boxShadow = 'none'; }}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ height: '2px', background: '#CCCCCC', borderRadius: '2px', margin: '12px 0 16px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: t.sageDeep, transition: 'width 0.2s' }} />
                </div>

                {/* Timer - Compact */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '16px' }}>
                  <Clock size={12} color={expireLeft <= 60 ? '#8B0000' : '#333333'} />
                  <span style={{ fontSize: '12px', color: expireLeft <= 60 ? '#8B0000' : '#333333', fontWeight: '600' }}>
                    {tr('auth.verifyOtp.codeExpiresIn')} {formatTime(expireLeft)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || filled < 6}
                  style={{
                    width: '100%', padding: '10px',
                    background: filled === 6 && !loading ? t.sageDeep : '#E0E0E0',
                    border: '2px solid rgba(0, 0, 0, 0.25)',
                    borderRadius: '8px',
                    color: filled === 6 && !loading ? '#FFFFFF' : '#666666',
                    fontSize: '13px', fontWeight: '700',
                    cursor: filled === 6 && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { if (filled === 6 && !loading) { e.currentTarget.style.background = t.olive; e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.25)'; } }}
                  onMouseLeave={(e) => { if (filled === 6 && !loading) { e.currentTarget.style.background = t.sageDeep; e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.25)'; } }}
                >
                  {loading ? tr('auth.verifyOtp.verifying') : (isLoginFlow ? <>{tr('auth.verifyOtp.verifyAndSignIn')} <ArrowRight size={12} /></> : <>{tr('auth.verifyOtp.verifyCode')} <ArrowRight size={12} /></>)}
                </button>
              </form>

              {/* Resend - Compact */}
              <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: `2px solid rgba(0, 0, 0, 0.2)` }}>
                <p style={{ color: '#333333', fontSize: '11px', marginBottom: '8px', fontWeight: '500' }}>{tr('auth.verifyOtp.didntReceiveIt')}</p>
                <button
                  onClick={handleResend}
                  disabled={resendLeft > 0 || resending}
                  style={{
                    background: 'none', border: 'none', cursor: resendLeft > 0 ? 'not-allowed' : 'pointer',
                    color: resendLeft > 0 ? '#999999' : t.sageDeep,
                    fontSize: '12px', fontWeight: '700',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontFamily: 'inherit', padding: 0,
                  }}
                >
                  <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                  {resendLeft > 0 ? `${tr('auth.verifyOtp.resendIn')} ${formatTime(resendLeft)}` : resending ? tr('auth.verifyOtp.sending') : tr('auth.verifyOtp.resendCode')}
                </button>
              </div>

              {/* Tip - Compact */}
              <div style={{ marginTop: '16px', background: t.goldTint, border: `2px solid rgba(139, 105, 20, 0.3)`, borderRadius: '8px', padding: '8px 12px' }}>
                <p style={{ color: '#5C4510', fontSize: '10px', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                  <strong style={{ color: '#8B6914', fontWeight: '700' }}>{tr('auth.verifyOtp.tipLabel')}</strong> {tr('auth.verifyOtp.tipBody')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}