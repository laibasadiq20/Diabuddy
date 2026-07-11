import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserRound,
  Shield,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react';

const t = theme;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Community', path: '/community', icon: Users },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'My Account', path: '/account', icon: UserRound },
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
          onClick={() => go('/dashboard')}
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

      <nav style={{ flex: 1, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
      {/* Desktop sidebar */}
      <aside
        className="db-app-sidebar"
        style={{
          width: 260,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'none',
        }}
      >
        <SidebarInner />
      </aside>

      {/* Mobile top bar */}
      <div
        className="db-app-mobile-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: t.forest,
          color: '#F4F0E8',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span style={{ fontFamily: t.fontDisplay, fontSize: 18 }}>Diabuddy</span>
        <button
          type="button"
          onClick={() => go('/messages')}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}
          aria-label="Messages"
        >
          <MessageSquare size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
          />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 'min(288px, 86vw)' }}>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 2,
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                width: 36,
                height: 36,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarInner />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .db-app-sidebar { display: block !important; }
          .db-app-mobile-bar { display: none !important; }
        }
      `}</style>
    </>
  );
}
