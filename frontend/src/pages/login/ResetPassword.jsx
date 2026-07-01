import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, HeartPulse, Eye, EyeOff } from 'lucide-react';
import { theme } from '../../theme';

const t = theme;

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px',
  background: t.surfaceSunken, border: `1.5px solid ${t.line}`,
  borderRadius: '10px', color: t.ink, fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s, background 0.2s', fontFamily: 'inherit',
};

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!resetToken.trim()) {
      setError('Please enter the reset code from email.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          resetToken: resetToken.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Password updated successfully. Redirecting to login…');
        setTimeout(() => navigate('/login'), 1600);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const focus = (e) => { e.target.style.borderColor = t.sky; e.target.style.background = t.surface; };
  const blur = (e) => { e.target.style.borderColor = t.line; e.target.style.background = t.surfaceSunken; };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: t.fontBody }}>
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }} className="db-animate-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: t.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={18} color="#fff" />
          </div>
          <span style={{ color: t.ink, fontSize: '19px', fontWeight: '600', fontFamily: t.fontDisplay }}>DiaBuddy</span>
        </div>

        <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: '18px', padding: '36px 30px', boxShadow: t.shadowLifted }}>
          <h1 style={{ color: t.ink, fontSize: '24px', fontWeight: '500', marginBottom: '4px', fontFamily: t.fontDisplay }}>Enter your reset code</h1>
          <p style={{ color: t.inkSoft, fontSize: '13px', marginBottom: '24px' }}>Use the code emailed to you and create a new password.</p>

          {error && (
            <div style={{ background: t.clayTint, border: `1px solid ${t.clay}35`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: t.clayDeep, fontSize: '13px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: t.sageTint, border: `1px solid ${t.sage}35`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: t.sageDeep, fontSize: '13px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: t.inkSoft, fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.4px' }}>EMAIL ADDRESS</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                required
                style={inputStyle}
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: t.inkSoft, fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.4px' }}>RESET CODE</label>
              <input
                type='text'
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder='123456'
                inputMode='numeric'
                required
                style={inputStyle}
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ display: 'block', color: t.inkSoft, fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.4px' }}>NEW PASSWORD</label>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '38px', color: t.inkFaint }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='New password'
                required
                style={{ ...inputStyle, paddingLeft: '42px', paddingRight: '44px' }}
                onFocus={focus}
                onBlur={blur}
              />
              <button type='button' onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 0 }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div style={{ marginBottom: '26px', position: 'relative' }}>
              <label style={{ display: 'block', color: t.inkSoft, fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.4px' }}>CONFIRM PASSWORD</label>
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '38px', color: t.inkFaint }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm password'
                required
                style={{ ...inputStyle, paddingLeft: '42px', paddingRight: '44px' }}
                onFocus={focus}
                onBlur={blur}
              />
              <button type='button' onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 0 }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type='submit'
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? t.surfaceSunken : t.sky,
                border: 'none', borderRadius: '10px',
                color: loading ? t.inkFaint : '#fff',
                fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = t.skyDeep; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = t.sky; }}
            >
              {loading ? 'Resetting…' : <>Reset password <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: t.line }} />
            <span style={{ color: t.inkFaint, fontSize: '12px' }}>back to</span>
            <div style={{ flex: 1, height: '1px', background: t.line }} />
          </div>

          <Link
            to='/login'
            style={{
              display: 'block', textAlign: 'center', padding: '12px',
              border: `1.5px solid ${t.line}`, borderRadius: '10px',
              color: t.inkSoft, fontSize: '14px', fontWeight: '500',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = t.sky; e.target.style.color = t.skyDeep; }}
            onMouseLeave={(e) => { e.target.style.borderColor = t.line; e.target.style.color = t.inkSoft; }}
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
