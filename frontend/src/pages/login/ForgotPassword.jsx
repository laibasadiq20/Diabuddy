import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, HeartPulse } from 'lucide-react';
import { theme } from '../../theme';

const t = theme;

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  paddingLeft: '42px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px',
  background: t.surfaceSunken, border: `1.5px solid ${t.line}`,
  borderRadius: '10px', color: t.ink, fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s, background 0.2s', fontFamily: 'inherit',
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('A reset code has been sent to your email.');
        setTimeout(() => {
          navigate('/reset-password', { state: { email: normalizedEmail } });
        }, 1400);
      } else {
        setError(data.message || 'Failed to send reset code.');
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
          <h1 style={{ color: t.ink, fontSize: '24px', fontWeight: '500', marginBottom: '6px', fontFamily: t.fontDisplay }}>Reset your password</h1>
          <p style={{ color: t.inkSoft, fontSize: '13px', marginBottom: '26px' }}>Enter the email address for your DiaBuddy account.</p>

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
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: t.inkSoft, fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.4px' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
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
              {loading ? 'Sending…' : <>Send reset code <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: t.line }} />
            <span style={{ color: t.inkFaint, fontSize: '12px' }}>remembered it?</span>
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
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
