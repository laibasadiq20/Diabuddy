import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, HeartPulse } from 'lucide-react';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';

const t = theme;

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

  return (
    <div className="min-h-screen flex items-center justify-center p-10 font-body" style={{ 
      background: 'radial-gradient(ellipse at center, #e2ecdb 0%, #92a87c 45%, #819175 70%, #485e3d 100%)' 
    }}>
      {/* Ambient glow overlay */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ 
        background: 'radial-gradient(circle, rgba(125, 143, 111, 0.3) 0%, transparent 70%)' 
      }} />

      <div className="w-full max-w-[400px] relative db-animate-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <HeartPulse size={16} color={t.sageDeep} />
          </div>
          <span className="text-white text-[17px] font-semibold font-display">DiaBuddy</span>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-[10px] border-2 border-black/30 rounded-2xl p-7 shadow-2xl">
          <h1 className="text-[#1A1A1A] text-xl font-bold mb-1 font-display">Reset password</h1>
          <p className="text-[#333333] text-xs font-medium mb-5">Enter your email to receive a reset code</p>

          {error && (
            <div className="bg-[#FDE8E8] border border-red-200 rounded-lg px-3 py-2 mb-4 text-[#8B0000] text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[#E8F5E9] border border-green-200 rounded-lg px-3 py-2 mb-4 text-[#2E7D32] text-xs font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[#333333] text-[11px] font-bold mb-1 tracking-wide">EMAIL</label>
              <div className="relative">
                <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666666]" />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='you@example.com'
                  required
                  className="w-full pl-[34px] pr-3 py-2 bg-[#F5F5F5] border-[1.5px] border-black/25 rounded-lg text-[#1A1A1A] text-[13px] font-medium outline-none transition-all duration-200 focus:border-[#7D8F6F] focus:bg-white"
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className="w-full py-2.5 border-2 border-black/25 rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all duration-200"
              style={{
                background: loading ? '#E0E0E0' : t.sageDeep,
                color: loading ? '#666666' : '#FFFFFF',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = t.olive; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = t.sageDeep; }}
            >
              {loading ? 'Sending…' : <>Send code <ArrowRight size={12} /></>}
            </button>
          </form>

          <div className="flex items-center gap-2.5 my-4">
            <div className="flex-1 h-px bg-black/20" />
            <span className="text-[#666666] text-[10px] font-medium">remembered it?</span>
            <div className="flex-1 h-px bg-black/20" />
          </div>

          <Link
            to='/login'
            className="block text-center py-2.5 border-2 border-black/25 rounded-lg text-[#333333] text-xs font-semibold no-underline transition-all duration-200 hover:border-[#7D8F6F] hover:text-[#7D8F6F]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}