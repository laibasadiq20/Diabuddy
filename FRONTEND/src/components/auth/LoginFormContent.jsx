import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

const t = theme;

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  paddingLeft: '42px',
  paddingRight: '16px',
  paddingTop: '12px',
  paddingBottom: '12px',
  background: t.surfaceSunken,
  border: `1.5px solid ${t.line}`,
  borderRadius: '10px',
  color: t.ink,
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  fontFamily: t.fontBody,
};

const focus = (e) => {
  e.target.style.borderColor = t.sky;
  e.target.style.background = t.surface;
};

const blur = (e) => {
  e.target.style.borderColor = t.line;
  e.target.style.background = t.surfaceSunken;
};

export default function LoginFormContent({
  navigate,
  onForgotPassword,
  onSwitchToRegister,
}) {
  const { fetchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {

      const response = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: normalizedEmail,
    password
  }),
});

      const data = await response.json();

      console.log('Login response:', data);

      if (response.ok) {
        await fetchUser();   // ← hydrate AuthContext so Navbar shows avatar
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          color: t.ink,
          fontSize: '28px',
          fontWeight: '500',
          marginBottom: '6px',
          letterSpacing: '-0.2px',
          fontFamily: t.fontDisplay,
        }}
      >
        Welcome back
      </h1>

      <p
        style={{
          color: t.inkSoft,
          fontSize: '14px',
          marginBottom: '28px',
        }}
      >
        Sign in to continue managing your health
      </p>

      {error && (
        <div
          style={{
            background: t.clayTint,
            border: `1px solid ${t.clay}35`,
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: t.clayDeep,
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              color: t.inkSoft,
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px',
            }}
          >
            Email address
          </label>

          <div style={{ position: 'relative' }}>
            <Mail
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: t.inkFaint,
              }}
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={focus}
              onBlur={blur}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'block',
              color: t.inkSoft,
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px',
            }}
          >
            Password
          </label>

          <div style={{ position: 'relative' }}>
            <Lock
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: t.inkFaint,
              }}
            />

            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                ...inputStyle,
                paddingRight: '44px',
              }}
              onFocus={focus}
              onBlur={blur}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: t.inkFaint,
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Options */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              style={{
                accentColor: t.sageDeep,
                width: '14px',
                height: '14px',
              }}
            />

            <span
              style={{
                color: t.inkSoft,
                fontSize: '13px',
              }}
            >
              Remember me
            </span>
          </label>

          <button
            type="button"
            onClick={onForgotPassword}
            style={{
              color: t.sageDeep,
              fontSize: '13px',
              textDecoration: 'none',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
            }}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit - Updated to Dark Green */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            background: loading ? t.surfaceSunken : t.sageDeep,
            border: 'none',
            borderRadius: '10px',
            color: loading ? t.inkFaint : '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            letterSpacing: '0.1px',
            fontFamily: t.fontBody,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = t.olive;
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = t.sageDeep;
          }}
        >
          {loading ? (
            'Signing in…'
          ) : (
            <>
              Sign in <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '28px 0',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            background: t.line,
          }}
        />

        <span
          style={{
            color: t.inkFaint,
            fontSize: '12px',
          }}
        >
          no account yet?
        </span>

        <div
          style={{
            flex: 1,
            height: '1px',
            background: t.line,
          }}
        />
      </div>

      {/* Register */}
      <button
        type="button"
        onClick={onSwitchToRegister}
        style={{
          display: 'block',
          width: '100%',
          boxSizing: 'border-box',
          padding: '13px',
          textAlign: 'center',
          border: `1.5px solid ${t.line}`,
          borderRadius: '10px',
          color: t.inkSoft,
          fontSize: '14px',
          fontWeight: '500',
          background: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = t.sageDeep;
          e.currentTarget.style.color = t.sageDeep;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = t.line;
          e.currentTarget.style.color = t.inkSoft;
        }}
      >
        Create a free account
      </button>

      <p
        style={{
          color: t.inkFaint,
          fontSize: '12px',
          textAlign: 'center',
          marginTop: '24px',
        }}
      >
        By signing in you agree to our{' '}
        <a
          href="#"
          style={{
            color: t.sageDeep,
            textDecoration: 'none',
          }}
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          href="#"
          style={{
            color: t.sageDeep,
            textDecoration: 'none',
          }}
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}