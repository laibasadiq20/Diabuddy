import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { theme } from '../../theme';
import { useI18n } from '../../i18n/I18nContext';
import { API_URL } from '../../config/api';

const t = theme;

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  paddingLeft: '32px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px',
  background: t.surfaceSunken, border: `1.5px solid ${t.line}`,
  borderRadius: '8px', color: t.ink, fontSize: '12px', outline: 'none',
  transition: 'border-color 0.2s, background 0.2s', fontFamily: t.fontBody,
};
const focus = (e) => { e.target.style.borderColor = t.sageDeep; e.target.style.background = t.surface; };
const blur = (e) => { e.target.style.borderColor = t.line; e.target.style.background = t.surfaceSunken; };

function Field({ label, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <label style={{ display: 'block', color: t.inkSoft, fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: t.inkFaint, pointerEvents: 'none' }} />
        {children}
      </div>
    </div>
  );
}

export default function RegisterFormContent({ navigate, onSwitchToLogin }) {
  const { t: tr } = useI18n();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const pwStrength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', tr('auth.register.strengthWeak'), tr('auth.register.strengthFair'), tr('auth.register.strengthGood'), tr('auth.register.strengthStrong')][pwStrength];
  const strengthColor = ['', t.clay, t.gold, t.sage, t.sageDeep][pwStrength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError(tr('auth.register.passwordsNoMatch')); return; }
    if (formData.password.length < 8) { setError(tr('auth.register.passwordMinLength')); return; }
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.fullName, email: formData.email, password: formData.password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        setError(data.message || tr('auth.register.registrationFailed'));
      }
    } catch (err) {
      console.error('Register connection error:', err);
      setError(err.name === 'AbortError' ? tr('auth.register.requestTimedOut') : tr('auth.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="db-register-form" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={onSwitchToLogin}
        aria-label={tr('auth.register.backToSignIn')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          marginBottom: '8px',
          padding: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: t.inkSoft,
          fontSize: '11px',
          fontWeight: 500,
          fontFamily: t.fontBody,
        }}
      >
        <ArrowLeft size={14} />
        {tr('auth.login.signIn')}
      </button>

      <h1 style={{ color: t.ink, fontSize: '18px', fontWeight: '500', margin: '0 0 2px', letterSpacing: '-0.2px', fontFamily: t.fontDisplay }}>
        {tr('auth.register.title')}
      </h1>
      <p style={{ color: t.inkSoft, fontSize: '11px', margin: '0 0 10px' }}>
        {tr('auth.register.subtitle')}
      </p>

      {error ? (
        <div style={{ background: t.clayTint, border: `1px solid ${t.clay}35`, borderRadius: '8px', padding: '5px 10px', marginBottom: '8px', color: t.clayDeep, fontSize: '11px' }}>
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <Field label={tr('auth.register.fullNameLabel')} icon={User}>
          <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Jane Doe" required style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label={tr('auth.login.emailLabel')} icon={Mail}>
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label={tr('auth.login.passwordLabel')} icon={Lock}>
          <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder={tr('auth.register.minCharsPlaceholder')} required style={{ ...inputStyle, paddingRight: '36px' }} onFocus={focus} onBlur={blur} />
          <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 0 }}>
            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </Field>

        {formData.password ? (
          <div style={{ marginTop: '-2px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', gap: '2px', marginBottom: '1px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ flex: 1, height: '2px', borderRadius: '2px', background: i <= pwStrength ? strengthColor : t.line, transition: 'background 0.3s' }} />
              ))}
            </div>
            <span style={{ fontSize: '9px', color: strengthColor, fontWeight: 500 }}>{strengthLabel}</span>
          </div>
        ) : null}

        <Field label={tr('auth.register.confirmPasswordLabel')} icon={Lock}>
          <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: '36px' }} onFocus={focus} onBlur={blur} />
          <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 0 }}>
            {showConfirm ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <Check size={12} style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', color: t.sageDeep }} />
          )}
        </Field>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', cursor: 'pointer', marginBottom: '10px' }}>
          <input type="checkbox" required style={{ accentColor: t.sageDeep, marginTop: '1px', width: '11px', height: '11px' }} />
          <span style={{ color: t.inkSoft, fontSize: '10px', lineHeight: '1.35' }}>
            {tr('auth.register.agreeTo')} <a href="#" style={{ color: t.sageDeep, textDecoration: 'none' }}>{tr('auth.terms')}</a> {tr('auth.and')} <a href="#" style={{ color: t.sageDeep, textDecoration: 'none' }}>{tr('auth.register.privacy')}</a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '9px',
            background: loading ? t.surfaceSunken : t.sageDeep,
            border: 'none', borderRadius: '8px',
            color: loading ? t.inkFaint : '#FFFFFF',
            fontSize: '12px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            transition: 'all 0.2s', letterSpacing: '0.1px', fontFamily: t.fontBody,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = t.olive; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = t.sageDeep; }}
        >
          {loading ? tr('auth.register.creating') : <>{tr('auth.register.createAccount')} <ArrowRight size={12} /></>}
        </button>
      </form>
    </div>
  );
}
