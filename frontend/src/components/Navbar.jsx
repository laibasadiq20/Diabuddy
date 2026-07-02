import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const [learnOpen, setLearnOpen] = useState(false);
  const learnRef = useRef(null);
  const { user, logout } = useAuth();

const links = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "About", id: "about" },
  { label: "Community", id: "community" },
];
const learnLinks = [
  { label: "Warning Signs", path: "/learn/warning-signs" },
  { label: "Risk Assessment", path: "/learn/risk-assessment" },
  { label: "Diabetes Types", path: "/learn/diabetes-types" },
  { label: "Blog", path: "/learn/blog" },
];

  const scrollToSection = (id) => {
  // If we're not on the homepage, the section doesn't exist on this page yet.
  // Navigate home first, then scroll once it has mounted.
  if (window.location.pathname !== "/") {
    navigate("/");
    setOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
    return;
  }

  const el = document.getElementById(id);

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setOpen(false);
  }
};

  // Close the Learn dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!learnOpen) return;

    const handleClickOutside = (e) => {
      if (learnRef.current && !learnRef.current.contains(e.target)) {
        setLearnOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [learnOpen]);

  const goToLearnPage = (path) => {
    setLearnOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-black/5 bg-[#F6F3EE]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
              ♥
            </span>

            <span className="font-serif text-xl text-[#2F2A25] tracking-wide">
              Diabuddy
            </span>
          </div>

          {/* Desktop Links */}
        
<nav className="hidden md:flex items-center gap-8">
  {links.map((link) => (
    <button
      key={link.id}
      onClick={() => scrollToSection(link.id)}
      className="text-sm text-[#5C524B] hover:text-black transition"
    >
      {link.label}
    </button>
  ))}

  {/* Learn Dropdown */}
  <div className="relative" ref={learnRef}>
    <button
      onClick={() => setLearnOpen((v) => !v)}
      className="flex items-center gap-1 text-sm text-[#5C524B] hover:text-black transition"
    >
      Learn
      <span className={`transition-transform duration-200 ${learnOpen ? "rotate-180" : ""}`}>
        ▼
      </span>
    </button>

    <div
      className={`absolute top-8 left-0 w-56 rounded-2xl border border-black/10 bg-white p-2 shadow-xl transition-all duration-200 ${
        learnOpen
          ? "visible translate-y-0 opacity-100"
          : "invisible -translate-y-2 opacity-0 pointer-events-none"
      }`}
    >
      {learnLinks.map((item) => (
        <button
          key={item.path}
          onClick={() => goToLearnPage(item.path)}
          className="w-full rounded-xl px-4 py-3 text-left text-sm text-[#5C524B] hover:bg-black/5 transition"
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
</nav>
          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* SIGN IN (only if NOT logged in) */}
            {!user && (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:inline-flex rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 transition"
              >
                Sign in
              </button>
            )}

            {/* PROFILE ICON (only if logged in) */}
            {user && (
              <button
                onClick={() => setProfileOpen(true)}
                className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-black text-white"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden flex flex-col gap-1"
            >
              <span className="h-0.5 w-6 bg-black"></span>
              <span className="h-0.5 w-6 bg-black"></span>
              <span className="h-0.5 w-6 bg-black"></span>
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 z-50 transition ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        <div
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-[#F6F3EE] shadow-2xl transform transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/10 p-6">
            <span className="font-serif text-lg text-[#2F2A25]">Menu</span>
            <button onClick={() => setOpen(false)} className="text-2xl">✕</button>
          </div>

         <div className="flex flex-col gap-2 p-6">
  {links.map((link) => (
    <button
      key={link.id}
      onClick={() => scrollToSection(link.id)}
      className="text-left rounded-xl px-3 py-3 text-[#5C524B] hover:bg-black/5 transition"
    >
      {link.label}
    </button>
  ))}


  <div className="mt-4 border-t border-black/10 pt-4">
  <p className="px-3 text-xs uppercase tracking-[2px] text-gray-400 mb-2">
    Learn
  </p>

  {learnLinks.map((item) => (
    <button
      key={item.path}
      onClick={() => {
        navigate(item.path);
        setOpen(false);
      }}
      className="w-full text-left rounded-xl px-3 py-3 text-[#5C524B] hover:bg-black/5 transition"
    >
      {item.label}
    </button>
  ))}
</div>
</div>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-black py-3 text-white font-semibold"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* PROFILE DRAWER */}
      <div className={`fixed inset-0 z-50 transition ${profileOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div
          onClick={() => setProfileOpen(false)}
          className="absolute inset-0 bg-black/30"
        />

        <div
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ${
            profileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <p className="font-semibold">My Profile</p>
              <p className="text-xs text-gray-500">Account & settings</p>
            </div>

            <button onClick={() => setProfileOpen(false)} className="text-2xl">
              ✕
            </button>
          </div>

          {/* REAL USER DATA (NO DUMMY) */}
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

            {/* Menu */}
            <div className="mt-6 flex flex-col gap-2">
              {[
                { label: "My Dashboard", icon: "📊" },
                { label: "Community", icon: "👥" },
                { label: "Health Insights", icon: "🧠" },
                { label: "Settings", icon: "⚙️" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-black/5 transition"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* LOGOUT (REAL) */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={logout}
              className="w-full rounded-xl bg-black text-white py-3 font-semibold"
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