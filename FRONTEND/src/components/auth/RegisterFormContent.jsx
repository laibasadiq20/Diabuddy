import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { API_URL } from '../../config/api';

export default function RegisterFormContent({ navigate, onSwitchToLogin }) {
  const { t: tr } = useI18n();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const neutralGlassInputStyle = {
    background: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1.5px solid rgba(255, 255, 255, 0.7)',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.03)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError(tr('auth.register.passwordsNoMatch') || 'Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError(tr('auth.register.passwordMinLength') || 'Password must be at least 8 characters long');
      return;
    }
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
        setError(data.message || tr('auth.register.registrationFailed') || 'Registration failed');
      }
    } catch (err) {
      console.error('Register connection error:', err);
      setError(err.name === 'AbortError' ? tr('auth.register.requestTimedOut') : tr('auth.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full select-none font-sans">
      {/* Brand Header */}
      <div className="mb-4 text-center">
        <h1 className="font-serif text-2xl sm:text-[1.85rem] font-bold text-[#1A1A1A] tracking-tight">
          Sign Up
        </h1>
        <p className="mt-0.5 text-xs text-[#444444] font-semibold">
          Join DiaBuddy to manage your health
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-800 animate-in fade-in duration-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#222222] mb-0.5">
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]">
              <User size={15} />
            </div>
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
              className="w-full rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-[13px] font-semibold text-[#1A1A1A] outline-none transition-all focus:bg-white/80 focus:border-[#1A1A1A]"
              style={neutralGlassInputStyle}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#222222] mb-0.5">
            Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]">
              <Mail size={15} />
            </div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full rounded-2xl pl-9 pr-3 py-2.5 text-xs sm:text-[13px] font-semibold text-[#1A1A1A] outline-none transition-all focus:bg-white/80 focus:border-[#1A1A1A]"
              style={neutralGlassInputStyle}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#222222] mb-0.5">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]">
              <Lock size={15} />
            </div>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars"
              required
              className="w-full rounded-2xl pl-9 pr-9 py-2.5 text-xs sm:text-[13px] font-semibold text-[#1A1A1A] outline-none transition-all focus:bg-white/80 focus:border-[#1A1A1A]"
              style={neutralGlassInputStyle}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#1A1A1A] p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#222222] mb-0.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]">
              <Lock size={15} />
            </div>
            <input
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
              className="w-full rounded-2xl pl-9 pr-9 py-2.5 text-xs sm:text-[13px] font-semibold text-[#1A1A1A] outline-none transition-all focus:bg-white/80 focus:border-[#1A1A1A]"
              style={neutralGlassInputStyle}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#1A1A1A] p-1 cursor-pointer"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-1.5 pt-0.5 text-[11px] text-[#222222] font-semibold cursor-pointer">
          <input type="checkbox" required className="mt-0.5 rounded accent-[#1A1A1A]" />
          <span>
            I agree to the <a href="#" className="underline font-bold text-[#1A1A1A]">Terms</a> & <a href="#" className="underline font-bold text-[#1A1A1A]">Privacy Policy</a>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#1A1A1A] hover:bg-black text-white py-3 text-xs sm:text-[13.5px] font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-1"
        >
          {loading ? (
            <span>Creating account...</span>
          ) : (
            <>
              <span>Sign Up</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Switch to login */}
      <div className="mt-4 text-center text-xs text-[#222222] font-semibold">
        <span>Already have an account?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="ml-1.5 font-bold text-[#1A1A1A] underline hover:text-black cursor-pointer"
        >
          Sign In
        </button>
      </div>

    </div>
  );
}
