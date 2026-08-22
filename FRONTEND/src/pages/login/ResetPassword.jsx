import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, HeartPulse } from 'lucide-react';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { homePathFor } from '../../utils/homePath';

const t = theme;

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  paddingLeft: '34px',
  paddingRight: '14px',
  paddingTop: '8px',
  paddingBottom: '8px',
  background: t.surfaceSunken,
  border: `1.5px solid ${t.line}`,
  borderRadius: '8px',
  color: t.ink,
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  fontFamily: t.fontBody,
  fontWeight: '500',
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { t: tr } = useI18n();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && user) navigate(homePathFor(user), { replace: true });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !code.trim() || !password) {
      setError(tr('auth.resetPassword.fieldsRequired'));
      return;
    }
    if (password.length < 8) {
      setError(tr('auth.register.passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(tr('auth.register.passwordsNoMatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          code: code.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSuccess(data.message || tr('auth.resetPassword.successMessage'));
        setTimeout(() => navigate('/login'), 1400);
      } else {
        setError(data.message || tr('auth.resetPassword.failedToReset'));
      }
    } catch {
      setError(tr('auth.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const focus = (e) => {
    e.target.style.borderColor = t.sageDeep;
    e.target.style.background = '#FFFFFF';
  };
  const blur = (e) => {
    e.target.style.borderColor = 'rgba(0, 0, 0, 0.25)';
    e.target.style.background = '#F5F5F5';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        fontFamily: t.fontBody,
        background: 'radial-gradient(ellipse at center, #e2ecdb 0%, #92a87c 45%, #819175 70%, #485e3d 100%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={16} color={t.sageDeep} />
          </div>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '600', fontFamily: t.fontDisplay }}>DiaBuddy</span>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid rgba(0, 0, 0, 0.3)',
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            aria-label={tr('common.back')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              padding: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={16} />
            {tr('common.back')}
          </button>

          <h1 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '700', marginBottom: '4px', fontFamily: t.fontDisplay }}>
            {tr('auth.resetPassword.title')}
          </h1>
          <p style={{ color: '#333333', fontSize: '12px', marginBottom: '18px', fontWeight: '500' }}>
            {tr('auth.resetPassword.subtitle')}
          </p>

          {error && (
            <div style={{ background: t.clayTint, border: `1px solid ${t.clay}35`, borderRadius: '8px', padding: '8px 12px', marginBottom: '14px', color: '#8B0000', fontSize: '11px', fontWeight: '600' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: t.sageTint, border: `1px solid ${t.sage}35`, borderRadius: '8px', padding: '8px 12px', marginBottom: '14px', color: t.sageDeep, fontSize: '11px', fontWeight: '600' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: '#333', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>{tr('auth.emailUpper')}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: '#333', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>{tr('auth.resetPassword.resetCodeUpper')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={tr('auth.resetPassword.sixDigitCode')}
                required
                style={{ ...inputStyle, paddingLeft: '14px' }}
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: '#333', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>{tr('auth.resetPassword.newPasswordUpper')}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '38px' }}
                  onFocus={focus}
                  onBlur={blur}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}>
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#333', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>{tr('auth.resetPassword.confirmPasswordUpper')}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '38px' }}
                  onFocus={focus}
                  onBlur={blur}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}>
                  {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: loading ? '#E0E0E0' : t.sageDeep,
                border: '2px solid rgba(0, 0, 0, 0.25)',
                borderRadius: '8px',
                color: loading ? '#666' : '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontFamily: 'inherit',
              }}
            >
              {loading ? tr('auth.resetPassword.saving') : <>{tr('auth.resetPassword.resetPasswordButton')} <ArrowRight size={12} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
