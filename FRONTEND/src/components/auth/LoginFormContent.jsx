import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { API_URL } from '../../config/api';
import { homePathFor } from '../../utils/homePath';

export default function LoginFormContent({
  navigate,
  onForgotPassword,
  onSwitchToRegister,
}) {
  const { fetchUser, saveSession } = useAuth();
  const { t: tr } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      setError(tr('auth.errorInvalidEmail') || 'Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const loggedInUser = data?.data?.user;
        if (loggedInUser) {
          saveSession(null, loggedInUser);
          navigate(homePathFor(loggedInUser));
        } else {
          const me = await fetchUser();
          navigate(homePathFor(me));
        }
        try {
          localStorage.removeItem('diabuddy_user');
          localStorage.removeItem('token');
        } catch (_) {}
      } else {
        setError(data.message || tr('auth.loginFailed') || 'Invalid email or password.');
      }
    } catch (err) {
      setError(tr('auth.connectionError') || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setError('Google Sign-In is configured for the production deployment.');
  };

  const neutralGlassInputStyle = {
    background: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1.5px solid rgba(255, 255, 255, 0.7)',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.03)',
  };

  return (
    <div className="w-full select-none font-sans">
      
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] tracking-tight">
          Login
        </h1>
        <p className="mt-1.5 text-xs text-[#444444] font-semibold">
          Welcome back to DiaBuddy
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-300/80 bg-red-50/95 px-3.5 py-2 text-xs text-red-800 animate-in fade-in duration-200 shadow-sm backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#222222] mb-1.5">
            Email
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555555]">
              <Mail size={16} strokeWidth={2} />
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-[13.5px] font-semibold text-[#1A1A1A] placeholder:text-[#666666] outline-none transition-all duration-200 focus:bg-white/80 focus:border-[#1A1A1A]"
              style={neutralGlassInputStyle}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#222222] mb-1.5">
            Password
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555555]">
              <Lock size={16} strokeWidth={2} />
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-[13.5px] font-semibold text-[#1A1A1A] placeholder:text-[#666666] outline-none transition-all duration-200 focus:bg-white/80 focus:border-[#1A1A1A]"
              style={neutralGlassInputStyle}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#1A1A1A] transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#222222] font-semibold">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded accent-[#1A1A1A] cursor-pointer h-3.5 w-3.5"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-bold text-[#1A1A1A] hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#1A1A1A] hover:bg-black text-white py-3.5 text-xs sm:text-[13.5px] font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Login</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* Social Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-white/60" />
        <span
          className="absolute px-3 py-0.5 rounded-full text-[10.5px] font-bold text-[#333333]"
          style={{
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.75)',
          }}
        >
          or continue with
        </span>
      </div>

      {/* Google Login Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full rounded-2xl py-3 text-xs sm:text-[12.5px] font-bold text-[#1A1A1A] flex items-center justify-center gap-2.5 transition-all hover:bg-white/80 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.75)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Switch to Register */}
      <div className="mt-5 text-center text-xs text-[#222222] font-semibold">
        <span>Don't have an account?</span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="ml-1.5 font-bold text-[#1A1A1A] underline hover:text-black cursor-pointer"
        >
          Register
        </button>
      </div>

    </div>
  );
}