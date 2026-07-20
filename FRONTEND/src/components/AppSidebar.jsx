import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import {
  LayoutDashboard,
  Users,
  Wrench,
  ClipboardList,
  Watch,
  Bell,
  UserRound,
  Shield,
  LogOut,
  Menu,
  X,
  Heart,
  MessageSquare,
} from 'lucide-react';

const t = theme;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Community', path: '/community', icon: Users },
  { label: 'Toolbox', path: '/toolbox', icon: Wrench },
  { label: 'Logs', path: '/logs', icon: ClipboardList },
  { label: 'Fitbit', path: '/fitbit', icon: Watch },
  { label: 'Reminders', path: '/reminders', icon: Bell },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'My Account', path: '/account', icon: UserRound },
];

const bottomTabs = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Community', path: '/community', icon: Users },
  { label: 'Tools', path: '/toolbox', icon: Wrench },
  { label: 'Reminders', path: '/reminders', icon: Bell },
  { label: 'Account', path: '/account', icon: UserRound },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  useEffect(() => {
    document.body.classList.add('db-app-active');
    const onMessages = location.pathname.startsWith('/messages');
    document.body.classList.toggle('db-app-messages', onMessages);
    return () => {
      document.body.classList.remove('db-app-active', 'db-app-messages');
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const SidebarInner = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: `linear-gradient(165deg, ${t.forestDeep} 0%, ${t.forest} 48%, #1f3a32 100%)`,
        color: '#F4F0E8',
        fontFamily: t.fontBody,
      }}
    >
      <div style={{ padding: '28px 22px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          type="button"
          onClick={() => go('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'inherit',
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(232,184,154,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(232,184,154,0.35)',
            }}
          >
            <Heart size={18} color={t.peach} fill={t.peach} />
          </span>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, letterSpacing: '0.02em' }}>
              Diabuddy
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(244,240,232,0.55)' }}>
              Your care companion
            </p>
          </div>
        </button>
      </div>

      <nav style={{ flex: 1, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        <p
          style={{
            margin: '0 10px 10px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(244,240,232,0.4)',
          }}
        >
          Navigate
        </p>
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              type="button"
              onClick={() => go(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                border: active ? '1px solid rgba(232,184,154,0.35)' : '1px solid transparent',
                background: active ? 'rgba(232,184,154,0.14)' : 'transparent',
                color: active ? '#FFF' : 'rgba(244,240,232,0.78)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </button>
          );
        })}

        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => go('/admin/reports')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 12,
              border: isActive('/admin/reports') ? '1px solid rgba(194,114,79,0.45)' : '1px solid transparent',
              background: isActive('/admin/reports') ? 'rgba(194,114,79,0.18)' : 'transparent',
              color: isActive('/admin/reports') ? '#FFF' : 'rgba(244,240,232,0.78)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              textAlign: 'left',
              marginTop: 4,
            }}
          >
            <Shield size={18} />
            Moderation
          </button>
        )}
      </nav>

      <div style={{ padding: '16px 14px 22px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          type="button"
          onClick={() => go('/account')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)',
            cursor: 'pointer',
            textAlign: 'left',
            marginBottom: 10,
            color: '#F4F0E8',
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: t.peach,
              color: t.forestDeep,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Account'}
            </span>
            <span style={{ display: 'block', fontSize: 11, color: 'rgba(244,240,232,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || 'Personalize profile'}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            color: 'rgba(244,240,232,0.75)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — participates in page flex row */}
      <aside className="db-app-sidebar" aria-label="Main navigation">
        <SidebarInner />
      </aside>

      {/* Mobile top bar — fixed, out of flex flow */}
      <header className="db-app-topbar">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="db-app-icon-btn"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <button
          type="button"
          onClick={() => go('/dashboard')}
          className="db-app-brand"
        >
          Diabuddy
        </button>
        <button
          type="button"
          onClick={() => go('/messages')}
          className={`db-app-icon-btn${isActive('/messages') ? ' is-active' : ''}`}
          aria-label="Messages"
        >
          <MessageSquare size={20} />
        </button>
      </header>

      {/* Mobile bottom tabs — app-style primary nav */}
      <nav className="db-app-tabs" aria-label="Primary">
        {bottomTabs.map(({ label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              type="button"
              onClick={() => go(path)}
              className={`db-app-tab${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.35 : 1.75} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="db-app-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="db-app-drawer-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="db-app-drawer-panel">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="db-app-drawer-close"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarInner />
          </div>
        </div>
      )}
    </>
  );
}
