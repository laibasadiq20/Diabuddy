import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const learnRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = [
    { label: 'Features', id: 'features' },
    { label: 'How it works', id: 'about' },
    { label: 'Community', id: 'community' },
  ];

  const learnLinks = [
    { label: 'Warning Signs', path: '/learn/warning-signs' },
    { label: 'Risk Assessment', path: '/learn/risk-assessment' },
    { label: 'Diabetes Types', path: '/learn/diabetes-types' },
    { label: 'Blog', path: '/learn/blog' },
  ];

  const profileLinks = user?.role === 'admin'
    ? [
        { label: 'Admin console', path: '/admin' },
        { label: 'Users', path: '/admin?tab=users' },
        { label: 'Reports', path: '/admin?tab=reports' },
        { label: 'Topics', path: '/admin?tab=topics' },
        { label: 'View community', path: '/community' },
        { label: 'Account', path: '/account' },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Community', path: '/community' },
        { label: 'Messages', path: '/messages' },
        { label: 'Account', path: '/account' },
      ];

  const scrollToSection = (id) => {
    if (id === 'community' && user) {
      navigate('/community');
      setOpen(false);
      return;
    }

    if (window.location.pathname !== '/') {
      navigate('/');
      setOpen(false);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setOpen(false);
  };

  useEffect(() => {
    if (!learnOpen) return;
    const handleClickOutside = (e) => {
      if (learnRef.current && !learnRef.current.contains(e.target)) {
        setLearnOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [learnOpen]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-black/5 bg-[#F6F3EE]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3.5">
          {/* Left: brand */}
          <button
            type="button"
            onClick={() => {
              if (window.location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('home')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }, 300);
                return;
              }
              document.getElementById('home')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            className="flex min-w-0 items-center gap-1.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] text-white sm:h-8 sm:w-8 sm:text-sm">
              ♥
            </span>
            <span className="truncate font-serif text-[1.05rem] tracking-wide text-[#2F2A25] sm:text-xl">
              Diabuddy
            </span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="text-sm text-[#5C524B] transition hover:text-black"
              >
                {link.label}
              </button>
            ))}

            <div className="relative" ref={learnRef}>
              <button
                type="button"
                onClick={() => setLearnOpen((v) => !v)}
                className="flex items-center gap-1 text-sm text-[#5C524B] transition hover:text-black"
              >
                Learn
                <span
                  className={`text-[10px] transition-transform duration-200 ${
                    learnOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              <div
                className={`absolute top-8 right-0 w-52 rounded-2xl border border-black/10 bg-white p-2 shadow-xl transition-all duration-200 ${
                  learnOpen
                    ? 'visible translate-y-0 opacity-100'
                    : 'invisible pointer-events-none -translate-y-2 opacity-0'
                }`}
              >
                {learnLinks.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      setLearnOpen(false);
                      navigate(item.path);
                    }}
                    className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-[#5C524B] transition hover:bg-black/5"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Right: auth + hamburger (opens right drawer) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hidden text-sm font-medium text-[#5C524B] transition hover:text-black md:inline-flex"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="rounded-full bg-[#27392E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a2820]"
                >
                  Sign up
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#27392E] text-xs font-semibold text-white md:flex"
                title={user?.name || 'Profile'}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>
            )}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-[3px] rounded-lg border border-black/10 bg-white/60 md:hidden"
              aria-label="Open menu"
            >
              <span className="h-[1.5px] w-3.5 bg-[#2F2A25]" />
              <span className="h-[1.5px] w-3.5 bg-[#2F2A25]" />
              <span className="h-[1.5px] w-3.5 bg-[#2F2A25]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — right-side drawer */}
      <div
        className={`fixed inset-0 z-50 transition ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[min(86vw,320px)] flex-col bg-[#F6F3EE] shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-5 py-4">
            <span className="font-serif text-lg text-[#2F2A25]">Menu</span>
            <button type="button" onClick={() => setOpen(false)} className="text-2xl leading-none" aria-label="Close menu">
              ✕
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-5 py-4">
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#27392E] text-sm font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#2F2A25]">{user?.name}</p>
                  <p className="truncate text-xs text-[#5C524B]">{user?.email}</p>
                </div>
              </div>
            )}

            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="rounded-xl px-3 py-2.5 text-left text-sm text-[#5C524B] transition hover:bg-black/5"
              >
                {link.label}
              </button>
            ))}

            <div className="mt-3 border-t border-black/10 pt-3">
              <p className="mb-1.5 px-3 text-[10px] uppercase tracking-[0.14em] text-gray-400">
                Learn
              </p>
              {learnLinks.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#5C524B] transition hover:bg-black/5"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {user && (
              <div className="mt-3 border-t border-black/10 pt-3">
                <p className="mb-1.5 px-3 text-[10px] uppercase tracking-[0.14em] text-gray-400">
                  Account
                </p>
                {profileLinks.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      setOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#5C524B] transition hover:bg-black/5"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-black/10 px-5 py-4">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white"
              >
                Log out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/register');
                    setOpen(false);
                  }}
                  className="w-full rounded-xl bg-[#27392E] py-3 text-sm font-semibold text-white"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/login');
                    setOpen(false);
                  }}
                  className="w-full rounded-xl border border-black/15 bg-white py-3 text-sm font-semibold text-[#2F2A25]"
                >
                  Already have an account? Sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop profile drawer */}
      <div
        className={`fixed inset-0 z-50 transition ${
          profileOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div
          onClick={() => setProfileOpen(false)}
          className="absolute inset-0 bg-black/30"
        />
        <div
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ${
            profileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <p className="font-semibold">My Profile</p>
              <p className="text-xs text-gray-500">Account & settings</p>
            </div>
            <button type="button" onClick={() => setProfileOpen(false)} className="text-2xl">
              ✕
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 rounded-2xl border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-black">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1">
              {profileLinks.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setProfileOpen(false);
                  }}
                  className="rounded-xl px-4 py-3 text-left transition hover:bg-black/5"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-xl bg-black py-3 font-semibold text-white"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
