import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, HeartPulse } from 'lucide-react';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';

const t = theme;

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  paddingLeft: '34px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px',
  background: '#F5F5F5', border: '1.5px solid rgba(0, 0, 0, 0.25)',
  borderRadius: '8px', color: '#1A1A1A', fontSize: '13px', outline: 'none',
  transition: 'border-color 0.2s, background 0.2s', fontFamily: 'inherit',
  fontWeight: '500',
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
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json().catch(() => ({}));
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

  const focus = (e) => { e.target.style.borderColor = t.sageDeep; e.target.style.background = '#FFFFFF'; };
  const blur = (e) => { e.target.style.borderColor = 'rgba(0, 0, 0, 0.25)'; e.target.style.background = '#F5F5F5'; };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 16px', 
      fontFamily: t.fontBody,
      background: 'radial-gradient(ellipse at center, #e2ecdb 0%, #92a87c 45%, #819175 70%, #485e3d 100%)',
    }}>
      {/* Ambient glow overlay */}
      <div style={{ 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: '700px', 
        height: '700px', 
        background: 'radial-gradient(circle, rgba(125, 143, 111, 0.3) 0%, transparent 70%)', 
        borderRadius: '50%', 
        pointerEvents: 'none' 
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }} className="db-animate-in">
        {/* Logo - Light version for dark background */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={16} color={t.sageDeep} />
          </div>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '600', fontFamily: t.fontDisplay }}>DiaBuddy</span>
        </div>

        {/* Card - Compact */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '2px solid rgba(0, 0, 0, 0.3)', 
          borderRadius: '16px', 
          padding: '28px 24px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
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
              color: '#555555',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.sageDeep; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555555'; }}
          >
            <ArrowLeft size={16} />
            Sign in
          </button>

          <h1 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '700', marginBottom: '4px', fontFamily: t.fontDisplay }}>Reset password</h1>
          <p style={{ color: '#333333', fontSize: '12px', marginBottom: '18px', fontWeight: '500' }}>Enter your email to receive a reset code</p>

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
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#333333', fontSize: '11px', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.3px' }}>EMAIL</label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666666' }} />
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
                width: '100%', padding: '10px',
                background: loading ? '#E0E0E0' : t.sageDeep,
                border: '2px solid rgba(0, 0, 0, 0.25)',
                borderRadius: '8px',
                color: loading ? '#666666' : '#FFFFFF',
                fontSize: '13px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = t.olive; } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = t.sageDeep; } }}
            >
              {loading ? 'Sending…' : <>Send code <ArrowRight size={12} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}