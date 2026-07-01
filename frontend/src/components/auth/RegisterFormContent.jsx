import { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { theme } from '../../theme';

const t = theme;

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  paddingLeft: '42px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px',
  background: t.surfaceSunken, border: `1.5px solid ${t.line}`,
  borderRadius: '10px', color: t.ink, fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s, background 0.2s', fontFamily: t.fontBody,
};
const focus = (e) => { e.target.style.borderColor = t.sky; e.target.style.background = t.surface; };
const blur = (e) => { e.target.style.borderColor = t.line; e.target.style.background = t.surfaceSunken; };

function Field({ label, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: t.inkSoft, fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: t.inkFaint, pointerEvents: 'none' }} />
        {children}
      </div>
    </div>
  );
}

/**
 * Pure register form content — same padding/typography scale as
 * LoginFormContent (16px field labels at 13px/500, 16px input padding-left
 * of 42px, identical button height/radius) so the two faces of the flip
 * card read as one continuous card, not two different designs stitched
 * together.
 */
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.fullName, email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ color: t.ink, fontSize: '28px', fontWeight: '500', marginBottom: '6px', letterSpacing: '-0.2px', fontFamily: t.fontDisplay }}>
        Create your account
      </h1>
      <p style={{ color: t.inkSoft, fontSize: '14px', marginBottom: '28px' }}>
        Start managing your diabetes with confidence
      </p>

      {error && (
        <div style={{ background: t.clayTint, border: `1px solid ${t.clay}35`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: t.clayDeep, fontSize: '13px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Field label="Full name" icon={User}>
          <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Jane Doe" required style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Email address" icon={Mail}>
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Phone number" icon={Phone}>
          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+92 300 1234567" required style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Password" icon={Lock}>
          <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" required style={{ ...inputStyle, paddingRight: '44px' }} onFocus={focus} onBlur={blur} />
          <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 0 }}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </Field>

        {/* Password strength */}
        {formData.password && (
          <div style={{ marginTop: '-10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= pwStrength ? strengthColor : t.line, transition: 'background 0.3s' }} />
              ))}
            </div>
            <span style={{ fontSize: '11px', color: strengthColor, fontWeight: 500 }}>{strengthLabel}</span>
          </div>
        )}

        <Field label="Confirm password" icon={Lock}>
          <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: '44px' }} onFocus={focus} onBlur={blur} />
          <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 0 }}>
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <Check size={16} style={{ position: 'absolute', right: '38px', top: '50%', transform: 'translateY(-50%)', color: t.sage }} />
          )}
        </Field>

        {/* Terms */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', marginBottom: '28px' }}>
          <input type="checkbox" required style={{ accentColor: t.sky, marginTop: '2px', width: '14px', height: '14px' }} />
          <span style={{ color: t.inkSoft, fontSize: '13px', lineHeight: '1.6' }}>
            I agree to DiaBuddy's{' '}
            <a href="#" style={{ color: t.sky, textDecoration: 'none' }}>Terms of Service</a> and{' '}
            <a href="#" style={{ color: t.sky, textDecoration: 'none' }}>Privacy Policy</a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '13px',
            background: loading ? t.surfaceSunken : t.sky,
            border: 'none', borderRadius: '10px',
            color: loading ? t.inkFaint : '#fff',
            fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s', letterSpacing: '0.1px', fontFamily: t.fontBody,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = t.skyDeep; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = t.sky; }}
        >
          {loading ? 'Creating account…' : <>Create account <ArrowRight size={16} /></>}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
        <div style={{ flex: 1, height: '1px', background: t.line }} />
        <span style={{ color: t.inkFaint, fontSize: '12px' }}>already have an account?</span>
        <div style={{ flex: 1, height: '1px', background: t.line }} />
      </div>

      <button
        type="button"
        onClick={onSwitchToLogin}
        style={{
          display: 'block', width: '100%', boxSizing: 'border-box',
          padding: '13px', textAlign: 'center',
          border: `1.5px solid ${t.line}`, borderRadius: '10px',
          color: t.inkSoft, fontSize: '14px', fontWeight: '500',
          background: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.sky; e.currentTarget.style.color = t.skyDeep; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.line; e.currentTarget.style.color = t.inkSoft; }}
      >
        Already have an account? Sign In
      </button>
    </div>
  );
}
