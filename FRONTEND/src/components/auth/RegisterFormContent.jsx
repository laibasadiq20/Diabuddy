import { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';

const t = theme;

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  paddingLeft: '34px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px',
  background: t.surfaceSunken, border: `1.5px solid ${t.line}`,
  borderRadius: '8px', color: t.ink, fontSize: '12px', outline: 'none',
  transition: 'border-color 0.2s, background 0.2s', fontFamily: t.fontBody,
};
const focus = (e) => { e.target.style.borderColor = t.sageDeep; e.target.style.background = t.surface; };
const blur = (e) => { e.target.style.borderColor = t.line; e.target.style.background = t.surfaceSunken; };

function Field({ label, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'block', color: t.inkSoft, fontSize: '11px', fontWeight: '500', marginBottom: '3px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: t.inkFaint, pointerEvents: 'none' }} />
        {children}
      </div>
    </div>
  );
}

export default function RegisterFormContent({ navigate, onSwitchToLogin }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
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

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
  const strengthColor = ['', t.clay, t.gold, t.sage, t.sageDeep][pwStrength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
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
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register connection error:', err);
      setError(err.name === 'AbortError' ? 'Request timed out. Please try again.' : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={onSwitchToLogin}
        aria-label="Back to sign in"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '12px',
          padding: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: t.inkSoft,
          fontSize: '12px',
          fontWeight: 500,
          fontFamily: t.fontBody,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = t.sageDeep; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = t.inkSoft; }}
      >
        <ArrowLeft size={16} />
        Sign in
      </button>

      <h1 style={{ color: t.ink, fontSize: '20px', fontWeight: '500', marginBottom: '2px', letterSpacing: '-0.2px', fontFamily: t.fontDisplay }}>
        Create account
      </h1>
      <p style={{ color: t.inkSoft, fontSize: '12px', marginBottom: '14px' }}>
        Start managing your diabetes
      </p>

      {error ? (
        <div style={{ background: t.clayTint, border: `1px solid ${t.clay}35`, borderRadius: '8px', padding: '6px 12px', marginBottom: '12px', color: t.clayDeep, fontSize: '11px' }}>
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <Field label="Full name" icon={User}>
          <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Jane Doe" required style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Email" icon={Mail}>
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Phone" icon={Phone}>
          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+92 300 1234567" required style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Password" icon={Lock}>
          <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Min. 8 chars" required style={{ ...inputStyle, paddingRight: '38px' }} onFocus={focus} onBlur={blur} />
          <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 0 }}>
            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </Field>

        {formData.password && (
          <div style={{ marginTop: '-4px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '2px', marginBottom: '1px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ flex: 1, height: '2px', borderRadius: '2px', background: i <= pwStrength ? strengthColor : t.line, transition: 'background 0.3s' }} />
              ))}
            </div>
            <span style={{ fontSize: '9px', color: strengthColor, fontWeight: 500 }}>{strengthLabel}</span>
          </div>
        )}

        <Field label="Confirm password" icon={Lock}>
          <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: '38px' }} onFocus={focus} onBlur={blur} />
          <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 0 }}>
            {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <Check size={13} style={{ position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)', color: t.sageDeep }} />
          )}
        </Field>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', cursor: 'pointer', marginBottom: '12px' }}>
          <input type="checkbox" required style={{ accentColor: t.sageDeep, marginTop: '1px', width: '12px', height: '12px' }} />
          <span style={{ color: t.inkSoft, fontSize: '10px', lineHeight: '1.4' }}>
            I agree to <a href="#" style={{ color: t.sageDeep, textDecoration: 'none' }}>Terms</a> & <a href="#" style={{ color: t.sageDeep, textDecoration: 'none' }}>Privacy</a>
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
          {loading ? 'Creating…' : <>Create account <ArrowRight size={12} /></>}
        </button>
      </form>
    </div>
  );
}