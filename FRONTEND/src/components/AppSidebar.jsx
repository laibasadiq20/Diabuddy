import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { theme } from '../theme';
import { API_URL } from '../config/api';
import AlarmPopupModal from './AlarmPopupModal';
import { formatClock12 } from '../utils/timezone';
import {
  LayoutDashboard,
  Users,
  Wrench,
  ClipboardList,
  Bell,
  UserRound,
  Shield,
  Menu,
  X,
  Heart,
  MessageSquare,
  BellRing,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';

const t = theme;

export default function AppSidebar() {
  const { user, authHeaders } = useAuth();
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  /** Mobile sheet only — desktop uses /notifications page */
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  const isAdmin = user?.role === 'admin';

  const navItems = [
    { label: tr('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: tr('nav.logs'), path: '/logs', icon: ClipboardList },
    { label: tr('nav.reports'), path: '/reports', icon: BarChart3 },
    { label: tr('nav.reminders'), path: '/reminders', icon: Bell },
    { label: tr('nav.community'), path: '/community', icon: Users },
    { label: tr('nav.messages'), path: '/messages', icon: MessageSquare },
    { label: tr('nav.toolbox'), path: '/toolbox', icon: Wrench },
    { label: tr('nav.notifications'), path: '/notifications', icon: BellRing },
    { label: tr('nav.account'), path: '/account', icon: UserRound },
    { label: tr('nav.settings'), path: '/settings', icon: SettingsIcon },
  ];

  const adminNavItems = [
    { label: tr('nav.overview'), path: '/admin', icon: Shield, tab: 'overview' },
    { label: tr('nav.users'), path: '/admin?tab=users', icon: Users, tab: 'users' },
    { label: tr('nav.reports'), path: '/admin?tab=reports', icon: BellRing, tab: 'reports' },
    { label: tr('nav.topics'), path: '/admin?tab=topics', icon: ClipboardList, tab: 'topics' },
    { label: tr('nav.notifications'), path: '/admin?tab=notifications', icon: Bell, tab: 'notifications' },
    { label: tr('nav.viewCommunity'), path: '/community', icon: MessageSquare, soft: true },
    { label: tr('nav.account'), path: '/account', icon: UserRound },
    { label: tr('nav.settings'), path: '/settings', icon: SettingsIcon },
  ];

  const bottomTabs = [
    { label: tr('nav.home'), path: '/dashboard', icon: LayoutDashboard },
    { label: tr('nav.logs'), path: '/logs', icon: ClipboardList },
    { label: tr('nav.reports'), path: '/reports', icon: BarChart3 },
    { label: tr('nav.community'), path: '/community', icon: Users },
    { label: tr('nav.account'), path: '/account', icon: UserRound },
  ];

  const adminBottomTabs = [
    { label: tr('nav.home'), path: '/admin', icon: Shield },
    { label: tr('nav.users'), path: '/admin?tab=users', icon: Users },
    { label: tr('nav.reports'), path: '/admin?tab=reports', icon: BellRing },
    { label: tr('nav.alerts'), path: '/admin?tab=notifications', icon: Bell },
    { label: tr('nav.account'), path: '/account', icon: UserRound },
  ];

  const items = isAdmin ? adminNavItems : navItems;
  const tabs = isAdmin ? adminBottomTabs : bottomTabs;

  const adminTab = new URLSearchParams(location.search).get('tab') || 'overview';

  const isActive = (path, tab) => {
    if (path.startsWith('/admin')) {
      if (!location.pathname.startsWith('/admin')) return false;
      return adminTab === (tab || 'overview');
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isDesktopNotifs = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;

  const closeNotifs = () => {
    setNotifOpen(false);
    setNotifAnchor(null);
  };

  const openNotifsOrPage = (anchor) => {
    if (isAdmin) {
      go('/admin?tab=notifications');
      return;
    }
    if (isDesktopNotifs()) {
      go('/notifications');
      return;
    }
    setMobileOpen(false);
    if (notifOpen && notifAnchor === anchor) {
      closeNotifs();
      return;
    }
    setNotifAnchor(anchor);
    setNotifOpen(true);
    loadNotifications();
  };

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
    closeNotifs();
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
        // Read notifications are dismissed on read, so the list is effectively an unread inbox.
        setNotifications((data.notifications || []).filter((n) => !n.isRead));
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadUnreadMessages = async () => {
    if (!user || isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        const myId = String(user._id || user.id || '');
        const count = (data || []).filter((conv) => {
          const last = conv.lastMessage;
          if (!last) return false;
          const senderId = String(last.senderId?._id || last.senderId || '');
          if (senderId === myId) return false;
          return !(last.readBy || []).some((r) => String(r?._id || r) === myId);
        }).length;
        setUnreadMsgCount(count);
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
    loadUnreadMessages();
    const id = setInterval(() => {
      loadNotifications();
      loadUnreadMessages();
    }, 20000);
    const onRefresh = () => {
      loadNotifications();
      loadUnreadMessages();
    };
    window.addEventListener('diabuddy:notifs-refresh', onRefresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('diabuddy:notifs-refresh', onRefresh);
    };
  }, [user]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!notifOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeNotifs();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [notifOpen]);

  const openNotification = async (n) => {
    try {
      if (!n.isRead) {
        await fetch(`${API_URL}/notifications/${n._id}/read`, {
          method: 'PUT',
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) => prev.filter((x) => x._id !== n._id));
      }
    } catch (err) {
      console.error(err);
    }

    closeNotifs();
    setMobileOpen(false);
    if (isAdmin || n.type === 'new_report') {
      navigate('/admin?tab=reports');
    } else if (n.type === 'moderation_notice') {
      navigate('/account');
    } else if (n.referenceId && ['new_comment', 'comment_reply', 'post_like', 'comment_like', 'best_answer_selected'].includes(n.type)) {
      navigate(`/community/posts/${n.referenceId}`);
    } else if (n.type === 'new_message') {
      navigate('/messages', { state: { conversationId: n.referenceId } });
    } else {
      navigate('/community');
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
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const NotifPanel = ({ placement = 'sidebar' }) => (
    <>
      <button
        type="button"
        className="db-notif-backdrop"
        aria-label={tr('common.close')}
        onClick={closeNotifs}
      />
      <div
        className={`db-notif-panel${placement === 'sidebar' ? ' db-notif-panel--sidebar' : ' db-notif-panel--topbar'}`}
        role="dialog"
        aria-label={tr('notifications.title')}
        style={{
          position: 'absolute',
          left: placement === 'sidebar' ? 0 : 'auto',
          right: 0,
          bottom: placement === 'sidebar' ? 'calc(100% + 8px)' : 'auto',
          top: placement === 'sidebar' ? 'auto' : 'calc(100% + 8px)',
          width: placement === 'sidebar' ? '100%' : 320,
          maxWidth: placement === 'sidebar' ? '100%' : 'min(320px, 92vw)',
          maxHeight: placement === 'sidebar' ? 'min(420px, calc(100dvh - 120px))' : 420,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: t.surface,
          border: `1.5px solid ${t.lineStrong}`,
          borderRadius: 16,
          boxShadow: '0 18px 40px rgba(0,0,0,0.16)',
          zIndex: 80,
        }}
      >
        <span className="db-notif-handle" aria-hidden />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${t.line}`, flexShrink: 0 }}>
          <strong style={{ fontSize: 14, color: t.ink }}>{tr('notifications.title')}</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: t.forest, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                {tr('common.markAllRead')}
              </button>
            )}
            <button
              type="button"
              className="db-notif-close-m"
              onClick={closeNotifs}
              aria-label={tr('common.close')}
              style={{ background: 'none', border: 'none', color: t.inkSoft, fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: 0 }}
            >
              ×
            </button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {notifications.length === 0 ? (
            <p style={{ margin: 0, padding: 20, fontSize: 13, color: t.inkFaint, textAlign: 'center' }}>
              {tr('notifications.empty')}
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
                  background: n.isRead ? t.surface : 'rgba(39,57,46,0.06)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'block', fontSize: 13, color: t.ink, fontWeight: n.isRead ? 500 : 700, lineHeight: 1.4 }}>
                  {n.message}
                </span>
                <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: t.inkFaint }}>
                  {`${new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${formatClock12(n.createdAt)}`}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );

  /** @param {{ allowNotifPanel?: boolean }} props */
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
              DiaBuddy
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(244,240,232,0.55)' }}>
              {isAdmin ? tr('nav.adminConsole') : tr('nav.careCompanion')}
            </p>
          </div>
        </button>
      </div>

      <nav
        className="db-app-sidebar-nav"
        style={{ flex: 1, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}
      >
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
          {isAdmin ? tr('nav.admin') : tr('nav.navigate')}
        </p>
        {items.map(({ label, path, icon: Icon, tab, soft }) => {
          const active = isActive(path, tab);
          const showNotifBadge = (tab === 'notifications' || path === '/notifications') && unreadCount > 0;
          const showMsgBadge = path === '/messages' && unreadMsgCount > 0;
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
              <span style={{ flex: 1 }}>{label}</span>
              {(showNotifBadge || showMsgBadge) && (
                <span
                  style={{
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
                  {showNotifBadge
                    ? (unreadCount > 99 ? '99+' : unreadCount)
                    : (unreadMsgCount > 99 ? '99+' : unreadMsgCount)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '14px 14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          type="button"
          onClick={() => go('/account')}
          aria-label={tr('nav.account')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 6,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)',
            cursor: 'pointer',
            textAlign: 'left',
            color: '#F4F0E8',
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: t.peach,
              color: t.forestDeep,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || tr('nav.account')}
            </span>
            <span style={{ display: 'block', fontSize: 11, color: 'rgba(244,240,232,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || tr('nav.viewProfile')}
            </span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="db-app-sidebar" aria-label={tr('nav.mainNavigation')}>
        <SidebarInner />
      </aside>

      <header className="db-app-topbar">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="db-app-icon-btn"
          aria-label={tr('nav.openMenu')}
        >
          <Menu size={22} />
        </button>
        <button
          type="button"
          onClick={() => go('/')}
          className="db-app-brand"
        >
          DiaBuddy
        </button>
        <div style={{ position: 'relative', display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => {
              if (isAdmin) {
                go('/admin?tab=notifications');
              } else {
                openNotifsOrPage('topbar');
              }
            }}
            className={`db-app-icon-btn${
              (isAdmin && isActive('/admin?tab=notifications', 'notifications'))
              || (!isAdmin && ((notifOpen && notifAnchor === 'topbar') || isActive('/notifications')))
                ? ' is-active'
                : ''
            }`}
            aria-label={tr('notifications.title')}
            aria-expanded={!isAdmin && notifOpen && notifAnchor === 'topbar'}
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
              aria-label={tr('nav.messages')}
              style={{ position: 'relative' }}
            >
              <MessageSquare size={20} />
              {unreadMsgCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    background: t.peach,
                    color: t.forestDeep,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                </span>
              )}
            </button>
          )}
          {!isAdmin && notifOpen && notifAnchor === 'topbar' && (
            <NotifPanel placement="topbar" />
          )}
        </div>
      </header>

      <nav className="db-app-tabs" aria-label={tr('nav.primary')}>
        {tabs.map(({ label, path, icon: Icon }) => {
          const tabKey = path.includes('tab=') ? path.split('tab=')[1] : path.startsWith('/admin') ? 'overview' : undefined;
          const active = isActive(path, tabKey);
          const showMsgBadge = !isAdmin && path === '/messages' && unreadMsgCount > 0;
          return (
            <button
              key={`${path}-${label}`}
              type="button"
              onClick={() => go(path)}
              className={`db-app-tab${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              style={{ position: 'relative' }}
            >
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon size={22} strokeWidth={active ? 2.35 : 1.75} />
                {showMsgBadge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      minWidth: 14,
                      height: 14,
                      borderRadius: 999,
                      background: t.peach,
                      color: t.forestDeep,
                      fontSize: 9,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      lineHeight: 1,
                    }}
                  >
                    {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {mobileOpen && (
        <div className="db-app-drawer" role="dialog" aria-modal="true" aria-label={tr('nav.navigationMenu')}>
          <button
            type="button"
            className="db-app-drawer-backdrop"
            aria-label={tr('nav.closeMenu')}
            onClick={() => setMobileOpen(false)}
          />
          <div className="db-app-drawer-panel">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="db-app-drawer-close"
              aria-label={tr('nav.closeMenu')}
            >
              <X size={18} />
            </button>
            <SidebarInner />
          </div>
        </div>
      )}

      <AlarmPopupModal />
    </>
  );
}
