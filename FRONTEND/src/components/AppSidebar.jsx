import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { API_URL } from '../config/api';
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
  BellRing,
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

const adminNavItems = [
  { label: 'Overview', path: '/admin', icon: Shield, tab: 'overview' },
  { label: 'Users', path: '/admin?tab=users', icon: Users, tab: 'users' },
  { label: 'Reports', path: '/admin?tab=reports', icon: BellRing, tab: 'reports' },
  { label: 'Topics', path: '/admin?tab=topics', icon: ClipboardList, tab: 'topics' },
  { label: 'View community', path: '/community', icon: MessageSquare, soft: true },
  { label: 'Account', path: '/account', icon: UserRound },
];

const bottomTabs = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Community', path: '/community', icon: Users },
  { label: 'Tools', path: '/toolbox', icon: Wrench },
  { label: 'Reminders', path: '/reminders', icon: Bell },
  { label: 'Account', path: '/account', icon: UserRound },
];

const adminBottomTabs = [
  { label: 'Home', path: '/admin', icon: Shield },
  { label: 'Users', path: '/admin?tab=users', icon: Users },
  { label: 'Reports', path: '/admin?tab=reports', icon: BellRing },
  { label: 'Community', path: '/community', icon: MessageSquare },
  { label: 'Account', path: '/account', icon: UserRound },
];

export default function AppSidebar() {
  const { user, logout, authHeaders } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = user?.role === 'admin';
  const items = isAdmin ? adminNavItems : navItems;
  const tabs = isAdmin ? adminBottomTabs : bottomTabs;
  const homePath = isAdmin ? '/admin' : '/dashboard';

  const adminTab = new URLSearchParams(location.search).get('tab') || 'overview';

  const isActive = (path, tab) => {
    if (path.startsWith('/admin')) {
      if (!location.pathname.startsWith('/admin')) return false;
      return adminTab === (tab || 'overview');
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
    setNotifOpen(false);
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/notifications?limit=20`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
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
    if (!user) return undefined;
    loadNotifications();
    const id = setInterval(loadNotifications, 20000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const openNotification = async (n) => {
    try {
      if (!n.isRead) {
        await fetch(`${API_URL}/notifications/${n._id}/read`, {
          method: 'PUT',
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
        );
      }
    } catch (err) {
      console.error(err);
    }

    setNotifOpen(false);
    setMobileOpen(false);
    if (n.referenceId && ['new_comment', 'comment_reply', 'post_like', 'comment_like', 'best_answer_selected'].includes(n.type)) {
      navigate(`/community/posts/${n.referenceId}`);
    } else if (n.type === 'new_message') {
      navigate('/messages', { state: { conversationId: n.referenceId } });
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const NotifPanel = () => (
    <>
      {notifOpen && (
        <button
          type="button"
          className="db-notif-backdrop"
          aria-label="Close notifications"
          onClick={() => setNotifOpen(false)}
        />
      )}
      <div
        className="db-notif-panel"
        style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: 320,
          maxWidth: 'min(320px, 92vw)',
          maxHeight: 420,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          border: `1.5px solid ${t.lineStrong}`,
          borderRadius: 16,
          boxShadow: '0 18px 40px rgba(0,0,0,0.16)',
          zIndex: 80,
        }}
      >
        <span className="db-notif-handle" aria-hidden />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${t.line}`, flexShrink: 0 }}>
          <strong style={{ fontSize: 14, color: t.ink }}>Notifications</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: t.forest, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              className="db-notif-close-m"
              onClick={() => setNotifOpen(false)}
              aria-label="Close"
              style={{ background: 'none', border: 'none', color: t.inkSoft, fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: 0 }}
            >
              ×
            </button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {notifications.length === 0 ? (
            <p style={{ margin: 0, padding: 20, fontSize: 13, color: t.inkFaint, textAlign: 'center' }}>
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => openNotification(n)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: `1px solid ${t.line}`,
                  background: n.isRead ? '#fff' : 'rgba(39,57,46,0.06)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'block', fontSize: 13, color: t.ink, fontWeight: n.isRead ? 500 : 700, lineHeight: 1.4 }}>
                  {n.message}
                </span>
                <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: t.inkFaint }}>
                  {new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );

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
          onClick={() => go(homePath)}
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
              {isAdmin ? 'Admin console' : 'Your care companion'}
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
          {isAdmin ? 'Admin' : 'Navigate'}
        </p>
        {items.map(({ label, path, icon: Icon, tab, soft }) => {
          const active = isActive(path, tab);
          return (
            <button
              key={`${path}-${label}`}
              type="button"
              onClick={() => go(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                border: active ? '1px solid rgba(232,184,154,0.35)' : '1px solid transparent',
                background: active ? 'rgba(232,184,154,0.14)' : soft ? 'rgba(255,255,255,0.03)' : 'transparent',
                color: active ? '#FFF' : soft ? 'rgba(244,240,232,0.58)' : 'rgba(244,240,232,0.78)',
                cursor: 'pointer',
                fontSize: soft ? 13 : 14,
                fontWeight: active ? 600 : 500,
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
                fontStyle: soft ? 'italic' : 'normal',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 14px 22px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              if (!notifOpen) loadNotifications();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 12px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: '#F4F0E8',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <BellRing size={16} />
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  minWidth: 20,
                  height: 20,
                  borderRadius: 999,
                  background: t.peach,
                  color: t.forestDeep,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && <NotifPanel />}
        </div>

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
      <aside className="db-app-sidebar" aria-label="Main navigation">
        <SidebarInner />
      </aside>

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
          onClick={() => go(homePath)}
          className="db-app-brand"
        >
          Diabuddy
        </button>
        <div style={{ position: 'relative', display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              if (!notifOpen) loadNotifications();
            }}
            className="db-app-icon-btn"
            aria-label="Notifications"
            style={{ position: 'relative' }}
          >
            <BellRing size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: t.peach,
                }}
              />
            )}
          </button>
          {!isAdmin && (
            <button
              type="button"
              onClick={() => go('/messages')}
              className={`db-app-icon-btn${isActive('/messages') ? ' is-active' : ''}`}
              aria-label="Messages"
            >
              <MessageSquare size={20} />
            </button>
          )}
          {notifOpen && <NotifPanel />}
        </div>
      </header>

      <nav className="db-app-tabs" aria-label="Primary">
        {tabs.map(({ label, path, icon: Icon }) => {
          const tabKey = path.includes('tab=') ? path.split('tab=')[1] : path.startsWith('/admin') ? 'overview' : undefined;
          const active = isActive(path, tabKey);
          return (
            <button
              key={`${path}-${label}`}
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
