import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';

const t = theme;

export default function Notifications() {
  const { user, authHeaders } = useAuth();
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/notifications?limit=40`, {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

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

    if (user?.role === 'admin' || n.type === 'new_report') {
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

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: t.bg, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 24px 72px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.forest }}>
                {tr('notifications.inbox')}
              </p>
              <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 500, color: t.ink }}>
                {tr('notifications.title')}
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: 15, color: t.inkSoft, lineHeight: 1.5 }}>
                {tr('notifications.subtitle')}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  border: `1.5px solid ${t.lineStrong}`,
                  background: t.surface,
                  borderRadius: 999,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.forest,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {tr('common.markAllRead')}
              </button>
            )}
          </div>

          <div
            style={{
              background: t.surface,
              border: `1.5px solid ${t.lineStrong}`,
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: t.shadowCard,
            }}
          >
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: t.inkFaint }}>
                <RefreshCw className="animate-spin" size={22} style={{ margin: '0 auto' }} />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: t.inkFaint }}>
                <BellRing size={28} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: 14 }}>{tr('notifications.empty')}</p>
              </div>
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
                    padding: '16px 18px',
                    cursor: 'pointer',
                    fontFamily: t.fontBody,
                  }}
                >
                  <span style={{ display: 'block', fontSize: 14, color: t.ink, fontWeight: n.isRead ? 500 : 700, lineHeight: 1.45 }}>
                    {n.message}
                  </span>
                  <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: t.inkFaint }}>
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
