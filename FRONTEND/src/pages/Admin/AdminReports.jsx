import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { API_URL } from '../../config/api';
import {
  Shield,
  Trash2,
  EyeOff,
  Check,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Ban,
  UserCog,
  FolderKanban,
  Plus,
  Bell,
  Pencil,
  VolumeX,
  Volume2,
  Megaphone,
  ArrowRightLeft,
} from 'lucide-react';

const t = theme;

const VALID_TABS = ['overview', 'users', 'reports', 'topics', 'notifications'];

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reports', label: 'Reports', icon: Shield },
  { id: 'topics', label: 'Topics', icon: FolderKanban },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const ACTION_LABELS = {
  dismiss: 'Dismissed',
  hide_content: 'Hidden',
  delete_content: 'Soft deleted',
  ban_user: 'Author banned',
};

const NOTIF_META = {
  new_report: { label: 'Content report', Icon: AlertTriangle, color: t.clayDeep, bg: t.claySoft },
};

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminReports() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab') || 'overview';
  const tab = VALID_TABS.includes(rawTab) ? rawTab : 'overview';

  const setTab = (id) => {
    if (id === 'overview') setSearchParams({});
    else setSearchParams({ tab: id });
  };

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [reports, setReports] = useState([]);
  const [reportView, setReportView] = useState('pending'); // pending | history
  const [topics, setTopics] = useState([]);
  const [topicForm, setTopicForm] = useState({ name: '', slug: '', description: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [moveFromId, setMoveFromId] = useState('');
  const [moveToId, setMoveToId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { message, type }
  const [confirmState, setConfirmState] = useState(null); // { title, message, confirmLabel, danger, onConfirm }
  const [promptState, setPromptState] = useState(null); // { title, message, placeholder, defaultValue, confirmLabel, onConfirm }
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const askConfirm = useCallback((options) => setConfirmState(options), []);
  const askPrompt = useCallback((options) => setPromptState(options), []);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', ...authHeaders() }),
    [authHeaders]
  );

  const fetchStats = useCallback(async () => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      credentials: 'include',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load stats');
    setStats(data.data);
  }, [headers]);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (userSearch.trim()) params.set('search', userSearch.trim());
    if (userStatus) params.set('status', userStatus);
    const res = await fetch(`${API_URL}/admin/users?${params}`, {
      credentials: 'include',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load users');
    setUsers(data.data?.users || []);
  }, [headers, userSearch, userStatus]);

  const fetchQueue = useCallback(async (view = reportView) => {
    const status = view === 'history' ? 'history' : 'pending';
    const res = await fetch(`${API_URL}/admin/reports?status=${status}`, {
      credentials: 'include',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch reports');
    setReports(Array.isArray(data) ? data : data.data || []);
  }, [headers, reportView]);

  const fetchTopics = useCallback(async () => {
    const res = await fetch(`${API_URL}/topics`, {
      credentials: 'include',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch topics');
    setTopics(Array.isArray(data) ? data : data.data || []);
  }, [headers]);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch(`${API_URL}/notifications?limit=50`, {
      credentials: 'include',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load notifications');
    setNotifications(data.notifications || []);
    setNotifUnread(data.unreadCount || 0);
  }, [headers]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview') await fetchStats();
      else if (tab === 'users') await fetchUsers();
      else if (tab === 'reports') await fetchQueue(reportView);
      else if (tab === 'topics') await fetchTopics();
      else if (tab === 'notifications') await fetchNotifications();
    } catch (err) {
      setError(err.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [tab, reportView, fetchStats, fetchUsers, fetchQueue, fetchTopics, fetchNotifications]);

  useEffect(() => {
    if (user?.role === 'admin') refresh();
  }, [user, refresh]);

  useEffect(() => {
    if (user?.role === 'admin' && !stats) {
      fetchStats().catch(() => {});
    }
  }, [user, stats, fetchStats]);

  useEffect(() => {
    if (user?.role !== 'admin' || tab === 'notifications') return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/unread-count`, {
          credentials: 'include',
          headers: headers(),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setNotifUnread(data.unreadCount || 0);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, tab, headers]);

  const performResolveReport = async (reportId, actionType) => {
    setActioningId(reportId);
    try {
      const res = await fetch(`${API_URL}/admin/reports/${reportId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: headers(),
        body: JSON.stringify({ status: 'reviewed', action: actionType }),
      });
      if (res.ok) {
        if (reportView === 'pending') {
          setReports((prev) => prev.filter((r) => r._id !== reportId));
        } else {
          await fetchQueue('history');
        }
        if (actionType === 'ban_user') await fetchUsers().catch(() => {});
        if (stats) setStats((s) => s && { ...s, reports: { ...s.reports, pending: Math.max(0, (s.reports?.pending || 1) - 1) } });
      } else {
        const data = await res.json();
        showToast(data.message || 'Resolution failed.', 'error');
      }
    } catch {
      showToast('Connection error resolving report.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const handleResolveReport = (reportId, actionType) => {
    const labels = {
      dismiss: 'Dismiss this report?',
      hide_content: 'Hide this content from the community?',
      delete_content: 'Soft-delete this content?',
      ban_user: 'Ban the author and hide their posts & comments?',
    };
    askConfirm({
      title: 'Resolve report',
      message: labels[actionType] || `Perform action: "${actionType}"?`,
      confirmLabel: actionType === 'ban_user' ? 'Ban author' : 'Confirm',
      danger: actionType === 'ban_user' || actionType === 'delete_content',
      onConfirm: () => performResolveReport(reportId, actionType),
    });
  };

  const performUpdateUser = async (id, body) => {
    setActioningId(id);
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: headers(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Update failed', 'error');
        return;
      }
      await fetchUsers();
      if (body.warnMessage) showToast('Warning sent.', 'success');
    } catch {
      showToast('Connection error updating user.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const updateUser = (id, body, confirmMsg) => {
    if (confirmMsg) {
      askConfirm({
        title: 'Confirm action',
        message: confirmMsg,
        danger: body.isActive === false || !!body.muteHours,
        onConfirm: () => performUpdateUser(id, body),
      });
      return;
    }
    performUpdateUser(id, body);
  };

  const performDeleteUser = async (id, hard) => {
    setActioningId(id);
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}${hard ? '?hard=true' : ''}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Delete failed', 'error');
        return;
      }
      await fetchUsers();
      if (tab === 'overview') await fetchStats().catch(() => {});
    } catch {
      showToast('Connection error deleting user.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const deleteUser = (id, hard = false) => {
    askConfirm({
      title: hard ? 'Delete user permanently' : 'Ban user',
      message: hard
        ? 'Permanently delete this user and scrub their content? This cannot be undone.'
        : 'Ban this user and hide their active posts?',
      confirmLabel: hard ? 'Delete forever' : 'Ban user',
      danger: true,
      onConfirm: () => performDeleteUser(id, hard),
    });
  };

  const resetTopicForm = () => {
    setTopicForm({ name: '', slug: '', description: '' });
    setSlugTouched(false);
    setEditingTopicId(null);
  };

  const handleTopicNameChange = (name) => {
    setTopicForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const startEditTopic = (topic) => {
    setEditingTopicId(topic._id);
    setTopicForm({
      name: topic.name || '',
      slug: topic.slug || '',
      description: topic.description || '',
    });
    setSlugTouched(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    const name = topicForm.name.trim();
    const slug = (topicForm.slug || slugify(name)).trim();
    if (!name || !slug) {
      showToast('Name and slug are required.', 'error');
      return;
    }
    setCreatingTopic(true);
    try {
      const url = editingTopicId ? `${API_URL}/topics/${editingTopicId}` : `${API_URL}/topics`;
      const res = await fetch(url, {
        method: editingTopicId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: headers(),
        body: JSON.stringify({
          name,
          slug,
          description: topicForm.description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || (editingTopicId ? 'Failed to update topic' : 'Failed to create topic'), 'error');
        return;
      }
      resetTopicForm();
      await fetchTopics();
      showToast(editingTopicId ? 'Topic updated.' : 'Topic created.', 'success');
    } catch {
      showToast(editingTopicId ? 'Connection error updating topic.' : 'Connection error creating topic.', 'error');
    } finally {
      setCreatingTopic(false);
    }
  };

  const performMoveTopicPosts = async (fromId, toId) => {
    setActioningId(fromId);
    try {
      const res = await fetch(`${API_URL}/topics/${fromId}/move-posts`, {
        method: 'POST',
        credentials: 'include',
        headers: headers(),
        body: JSON.stringify({ toTopicId: toId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Failed to move posts', 'error');
        return;
      }
      setMoveFromId('');
      setMoveToId('');
      await fetchTopics();
      showToast(data.message || 'Posts moved.', 'success');
    } catch {
      showToast('Connection error moving posts.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const moveTopicPosts = (fromId, toId) => {
    if (!fromId || !toId) {
      showToast('Choose a destination topic.', 'error');
      return;
    }
    if (fromId === toId) {
      showToast('Pick a different destination topic.', 'error');
      return;
    }
    const from = topics.find((x) => x._id === fromId);
    const to = topics.find((x) => x._id === toId);
    askConfirm({
      title: 'Move posts',
      message: `Move all posts from "${from?.name}" to "${to?.name}"? Threads stay intact.`,
      confirmLabel: 'Move posts',
      onConfirm: () => performMoveTopicPosts(fromId, toId),
    });
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        credentials: 'include',
        headers: headers(),
      });
      if (!res.ok) return;
      setNotifUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* ignore */
    }
  };

  const openAdminNotification = async (n) => {
    try {
      if (!n.isRead) {
        await fetch(`${API_URL}/notifications/${n._id}/read`, {
          method: 'PUT',
          credentials: 'include',
          headers: headers(),
        });
        setNotifUnread((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
        );
      }
    } catch {
      /* ignore */
    }

    // Admin alerts are report-queue only
    setTab('reports');
  };

  const performDeleteTopic = async (id) => {
    setActioningId(id);
    try {
      const res = await fetch(`${API_URL}/topics/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Delete failed', 'error');
        return;
      }
      setTopics((prev) => prev.filter((topic) => topic._id !== id));
    } catch {
      showToast('Connection error deleting topic.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const deleteTopic = (id, name, postsCount) => {
    if (postsCount > 0) {
      showToast('Cannot delete a topic that still has posts. Move or remove posts first.', 'error');
      return;
    }
    askConfirm({
      title: 'Delete topic',
      message: `Delete topic "${name}"? This cannot be undone.`,
      confirmLabel: 'Delete topic',
      danger: true,
      onConfirm: () => performDeleteTopic(id),
    });
  };

  const card = {
    background: t.surface,
    border: `1.5px solid ${t.line}`,
    borderRadius: 14,
    padding: 18,
    boxShadow: t.shadowCard,
    boxSizing: 'border-box',
  };

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: 10,
    border: `1.5px solid ${t.line}`,
    background: '#FFF',
    fontFamily: t.fontBody,
    fontSize: 14,
    color: t.ink,
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main className="db-admin-main">
        <div className="db-admin-wrap">
          <div className="db-admin-header">
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
                DiaBuddy Admin
              </p>
              <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 500, color: t.ink, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={26} color={t.clayDeep} style={{ flexShrink: 0 }} />
                {tabs.find((x) => x.id === tab)?.label || 'Overview'}
              </h1>
              <p style={{ margin: '8px 0 0', color: t.inkSoft, fontSize: 14, lineHeight: 1.45, maxWidth: 420 }}>
                {tab === 'overview' && 'Platform health at a glance.'}
                {tab === 'users' && 'Search, ban, mute, or promote accounts.'}
                {tab === 'reports' && 'Review flagged posts and comments.'}
                {tab === 'topics' && 'Organize the community feed.'}
                {tab === 'notifications' && 'New content reports waiting for review.'}
              </p>
            </div>
            <div className="db-admin-actions">
              <button
                type="button"
                onClick={() => navigate('/community')}
                style={{
                  background: t.surfaceSunken,
                  border: `1.5px solid ${t.line}`,
                  borderRadius: 10,
                  padding: '9px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: t.inkSoft,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: t.fontBody,
                }}
              >
                <MessageSquare size={14} /> Community
              </button>
              <button
                type="button"
                onClick={refresh}
                style={{
                  background: t.surface,
                  border: `1.5px solid ${t.line}`,
                  borderRadius: 10,
                  padding: '9px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.inkSoft,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: t.fontBody,
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          <div className="db-admin-tabs" role="tablist" aria-label="Admin sections">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className="db-admin-tab"
                style={{
                  border: `1.5px solid ${tab === id ? t.forest : t.line}`,
                  background: tab === id ? t.forest : '#FFF',
                  color: tab === id ? '#FFF' : t.inkSoft,
                }}
              >
                <Icon size={14} /> {label}
                {id === 'reports' && stats?.reports?.pending > 0 && (
                  <span style={{ background: tab === id ? 'rgba(255,255,255,0.22)' : t.clay, color: '#FFF', borderRadius: 999, fontSize: 11, padding: '1px 7px', fontWeight: 700 }}>
                    {stats.reports.pending}
                  </span>
                )}
                {id === 'notifications' && notifUnread > 0 && (
                  <span style={{ background: tab === id ? 'rgba(255,255,255,0.22)' : t.clay, color: '#FFF', borderRadius: 999, fontSize: 11, padding: '1px 7px', fontWeight: 700 }}>
                    {notifUnread > 99 ? '99+' : notifUnread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: t.clayTint, border: `1.5px solid ${t.clay}30`, borderRadius: 12, padding: 16, color: t.clayDeep, fontSize: 14, marginBottom: 24 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: t.inkSoft }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px' }} />
              <p style={{ margin: 0 }}>Loading…</p>
            </div>
          ) : tab === 'overview' && stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="db-admin-stats">
                {[
                  { label: 'Users', value: stats.users.total },
                  { label: 'Active', value: stats.users.active },
                  { label: 'Banned', value: stats.users.banned },
                  { label: 'Admins', value: stats.users.admins },
                  { label: 'Posts', value: stats.content.posts },
                  { label: 'Pending reports', value: stats.reports.pending, alert: stats.reports.pending > 0 },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="db-admin-stat"
                    style={{
                      ...card,
                      borderColor: s.alert ? `${t.clay}55` : t.line,
                      background: s.alert ? t.clayTint : t.surface,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 11, color: t.inkFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
                    <p className="db-admin-stat-value" style={{ color: s.alert ? t.clayDeep : t.ink }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, fontWeight: 500 }}>Recent signups</h3>
                  <button
                    type="button"
                    onClick={() => setTab('users')}
                    style={{ background: 'none', border: 'none', color: t.skyDeep, fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13, fontFamily: t.fontBody }}
                  >
                    Manage all →
                  </button>
                </div>
                {(stats.recentUsers || []).length === 0 ? (
                  <p style={{ margin: '12px 0 0', color: t.inkFaint, fontSize: 14 }}>No users yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
                    {stats.recentUsers.map((u) => (
                      <div key={u._id} className="db-admin-signup-row">
                        <div className="db-admin-signup-meta">
                          <span className="db-admin-signup-name">{u.name}</span>
                          <span className="db-admin-signup-handle">@{u.username}</span>
                        </div>
                        <span className="db-admin-signup-date">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : tab === 'users' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search name, username, email"
                  style={{ ...inputStyle, flex: 1, minWidth: 200, width: 'auto' }}
                />
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${t.line}`, background: '#FFF', fontFamily: t.fontBody }}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
                <button type="button" onClick={fetchUsers} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: t.forest, color: '#FFF', fontWeight: 600, cursor: 'pointer', fontFamily: t.fontBody }}>
                  Search
                </button>
              </div>

              {users.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: 40, color: t.inkSoft }}>No users match.</div>
              ) : (
                users.map((u) => (
                  <div key={u._id} style={{ ...card, opacity: actioningId === u._id ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: t.ink, fontSize: 15 }}>
                          {u.name}{' '}
                          <span style={{ color: t.inkFaint, fontWeight: 500 }}>@{u.username}</span>
                          {u.role === 'admin' && (
                            <span style={{ marginLeft: 8, fontSize: 11, background: t.clayTint, color: t.clayDeep, padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>ADMIN</span>
                          )}
                          {!u.isActive && (
                            <span style={{ marginLeft: 6, fontSize: 11, background: '#FFECEC', color: '#D32F2F', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>BANNED</span>
                          )}
                          {u.isActive && u.mutedUntil && new Date(u.mutedUntil) > new Date() && (
                            <span style={{ marginLeft: 6, fontSize: 11, background: t.goldSoft, color: t.gold, padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>MUTED</span>
                          )}
                          {(u.warnings?.length || 0) > 0 && (
                            <span style={{ marginLeft: 6, fontSize: 11, background: t.clayTint, color: t.clayDeep, padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                              {u.warnings.length} WARN{u.warnings.length === 1 ? '' : 'S'}
                            </span>
                          )}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: t.inkSoft }}>
                          {u.email} · {u.postsCount || 0} posts · joined {new Date(u.createdAt).toLocaleDateString()}
                          {u.isActive && u.mutedUntil && new Date(u.mutedUntil) > new Date()
                            ? ` · muted until ${new Date(u.mutedUntil).toLocaleString()}`
                            : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/users/${u._id}`)}
                        style={{ background: 'none', border: 'none', color: t.skyDeep, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        Profile <ExternalLink size={12} />
                      </button>
                    </div>
                    <div className="db-admin-user-actions">
                      {u.isActive && (
                        <>
                          <ActionBtn
                            color={t.clayDeep}
                            bg={t.claySoft}
                            border={`${t.clay}30`}
                            onClick={() =>
                              askPrompt({
                                title: 'Send warning',
                                message: `This moderation notice will be sent to ${u.name}.`,
                                placeholder: 'Warning message',
                                defaultValue: 'Please follow community guidelines — especially around medical advice.',
                                confirmLabel: 'Send warning',
                                required: true,
                                onConfirm: (value) => updateUser(u._id, { warnMessage: value.trim() }, null),
                              })
                            }
                            disabled={!!actioningId}
                          >
                            <Megaphone size={14} /> Warn
                          </ActionBtn>
                          <ActionBtn
                            color={t.gold}
                            bg={t.goldSoft}
                            border={`${t.gold}30`}
                            onClick={() =>
                              updateUser(u._id, { muteHours: 24 }, 'Mute this user for 24 hours? They can still browse.')
                            }
                            disabled={!!actioningId}
                          >
                            <VolumeX size={14} /> Mute 24h
                          </ActionBtn>
                          <ActionBtn
                            color={t.gold}
                            bg={t.goldSoft}
                            border={`${t.gold}30`}
                            onClick={() =>
                              updateUser(u._id, { muteHours: 168 }, 'Mute this user for 7 days? They can still browse.')
                            }
                            disabled={!!actioningId}
                          >
                            <VolumeX size={14} /> Mute 7d
                          </ActionBtn>
                          {u.mutedUntil && new Date(u.mutedUntil) > new Date() && (
                            <ActionBtn
                              color={t.sageDeep}
                              bg={t.sageSoft}
                              border={`${t.sage}40`}
                              onClick={() => updateUser(u._id, { unmute: true }, 'Lift this user’s mute?')}
                              disabled={!!actioningId}
                            >
                              <Volume2 size={14} /> Unmute
                            </ActionBtn>
                          )}
                        </>
                      )}
                      {u.isActive ? (
                        <ActionBtn
                          color="#D32F2F"
                          bg="#FFECEC"
                          border="#FFCDD2"
                          onClick={() =>
                            updateUser(
                              u._id,
                              { isActive: false },
                              'Ban this user and hide their posts & comments?'
                            )
                          }
                          disabled={!!actioningId}
                        >
                          <Ban size={14} /> Ban
                        </ActionBtn>
                      ) : (
                        <ActionBtn
                          color={t.sageDeep}
                          bg={t.sageSoft}
                          border={`${t.sage}40`}
                          onClick={() =>
                            updateUser(
                              u._id,
                              { isActive: true },
                              'Unban this user? Hidden content stays hidden until restored individually.'
                            )
                          }
                          disabled={!!actioningId}
                        >
                          <Check size={14} /> Unban
                        </ActionBtn>
                      )}
                      {u.role !== 'admin' ? (
                        <ActionBtn color={t.clayDeep} bg={t.claySoft} border={`${t.clay}30`} onClick={() => updateUser(u._id, { role: 'admin' }, 'Promote this user to admin?')} disabled={!!actioningId}>
                          <UserCog size={14} /> Make admin
                        </ActionBtn>
                      ) : (
                        <ActionBtn color={t.inkSoft} bg={t.surfaceSunken} border={t.line} onClick={() => updateUser(u._id, { role: 'patient' }, 'Demote this admin to patient?')} disabled={!!actioningId}>
                          <UserCog size={14} /> Demote
                        </ActionBtn>
                      )}
                      <ActionBtn color="#D32F2F" bg="#FFECEC" border="#FFCDD2" onClick={() => deleteUser(u._id, true)} disabled={!!actioningId}>
                        <Trash2 size={14} /> Delete forever
                      </ActionBtn>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : tab === 'topics' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <form onSubmit={handleSaveTopic} style={card}>
                <h3 style={{ margin: '0 0 16px', fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingTopicId ? <Pencil size={18} color={t.forest} /> : <Plus size={18} color={t.forest} />}
                  {editingTopicId ? 'Edit topic' : 'New topic'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label htmlFor="topic-name" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Name
                    </label>
                    <input
                      id="topic-name"
                      value={topicForm.name}
                      onChange={(e) => handleTopicNameChange(e.target.value)}
                      placeholder="e.g. Type 1 Life"
                      maxLength={50}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="topic-slug" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Slug
                    </label>
                    <input
                      id="topic-slug"
                      value={topicForm.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setTopicForm((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder="type-1-life"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="topic-desc" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Description
                  </label>
                  <textarea
                    id="topic-desc"
                    value={topicForm.description}
                    onChange={(e) => setTopicForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description shown in the community feed"
                    maxLength={300}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={creatingTopic}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: t.forest,
                      color: '#FFF',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: creatingTopic ? 'not-allowed' : 'pointer',
                      opacity: creatingTopic ? 0.7 : 1,
                      fontFamily: t.fontBody,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {editingTopicId ? <Pencil size={14} /> : <Plus size={14} />}
                    {creatingTopic ? 'Saving…' : editingTopicId ? 'Save changes' : 'Create topic'}
                  </button>
                  {editingTopicId && (
                    <button
                      type="button"
                      onClick={resetTopicForm}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 10,
                        border: `1.5px solid ${t.line}`,
                        background: '#FFF',
                        color: t.inkSoft,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: t.fontBody,
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {topics.length > 1 && (
                <div style={card}>
                  <h3 style={{ margin: '0 0 12px', fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ArrowRightLeft size={18} color={t.forest} /> Move posts between topics
                  </h3>
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: t.inkSoft, lineHeight: 1.45 }}>
                    Relocates every non-deleted thread. Post content stays the same — only the topic changes.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</label>
                      <select
                        value={moveFromId}
                        onChange={(e) => setMoveFromId(e.target.value)}
                        style={{ ...inputStyle, width: '100%' }}
                      >
                        <option value="">Select topic</option>
                        {topics.map((topic) => (
                          <option key={topic._id} value={topic._id}>
                            {topic.name} ({topic.postsCount || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</label>
                      <select
                        value={moveToId}
                        onChange={(e) => setMoveToId(e.target.value)}
                        style={{ ...inputStyle, width: '100%' }}
                      >
                        <option value="">Select topic</option>
                        {topics.filter((topic) => topic._id !== moveFromId).map((topic) => (
                          <option key={topic._id} value={topic._id}>
                            {topic.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => moveTopicPosts(moveFromId, moveToId)}
                    disabled={!moveFromId || !moveToId || !!actioningId}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: t.forest,
                      color: '#FFF',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: !moveFromId || !moveToId || actioningId ? 'not-allowed' : 'pointer',
                      opacity: !moveFromId || !moveToId || actioningId ? 0.65 : 1,
                      fontFamily: t.fontBody,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ArrowRightLeft size={14} /> Move posts
                  </button>
                </div>
              )}

              {topics.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: 40, color: t.inkSoft }}>
                  <FolderKanban size={40} color={t.inkFaint} style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No topics yet. Create one above.</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <div key={topic._id} style={{ ...card, opacity: actioningId === topic._id ? 0.6 : 1, borderColor: editingTopicId === topic._id ? t.forest : t.line }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: t.ink, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FolderKanban size={16} color={topic.color || t.sageDeep} />
                          {topic.name}
                          <span style={{ fontSize: 12, color: t.inkFaint, fontWeight: 500 }}>/{topic.slug}</span>
                        </p>
                        {topic.description && (
                          <p style={{ margin: '8px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>{topic.description}</p>
                        )}
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: t.inkFaint }}>
                          {topic.postsCount || 0} posts · created {new Date(topic.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/community?topic=${topic._id}`)}
                          style={{ background: 'none', border: 'none', color: t.skyDeep, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: t.fontBody }}
                        >
                          View in feed <ExternalLink size={12} />
                        </button>
                        <ActionBtn color={t.skyDeep} bg={t.skySoft} border={`${t.sky}40`} onClick={() => startEditTopic(topic)} disabled={!!actioningId}>
                          <Pencil size={14} /> Edit
                        </ActionBtn>
                        <ActionBtn
                          color="#D32F2F"
                          bg="#FFECEC"
                          border="#FFCDD2"
                          onClick={() => deleteTopic(topic._id, topic.name, topic.postsCount || 0)}
                          disabled={!!actioningId || (topic.postsCount || 0) > 0}
                        >
                          <Trash2 size={14} /> Delete
                        </ActionBtn>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : tab === 'notifications' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 18px' }}>
                <p style={{ margin: 0, fontSize: 13, color: t.inkSoft }}>
                  {notifUnread > 0 ? (
                    <>
                      <strong style={{ color: t.ink }}>{notifUnread}</strong> unread
                      {notifications.length > 0 && <> · {notifications.length} recent</>}
                    </>
                  ) : (
                    <>All caught up{notifications.length > 0 && <> · {notifications.length} recent</>}</>
                  )}
                </p>
                {notifUnread > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    style={{
                      background: t.forest,
                      color: '#FFF',
                      border: 'none',
                      borderRadius: 10,
                      padding: '8px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: t.fontBody,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ ...card, padding: '56px 24px', textAlign: 'center' }}>
                  <Bell size={40} color={t.inkFaint} style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontFamily: t.fontDisplay, fontSize: 20, margin: '0 0 8px', color: t.ink, fontWeight: 500 }}>No report alerts yet</h3>
                  <p style={{ color: t.inkSoft, fontSize: 14, margin: 0, maxWidth: 360, marginInline: 'auto', lineHeight: 1.5 }}>
                    When a member reports a post or comment, it will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notifications.map((n) => {
                    const meta = NOTIF_META[n.type] || { label: n.type, Icon: Bell, color: t.inkSoft, bg: t.surfaceSunken };
                    const Icon = meta.Icon;
                    return (
                      <button
                        key={n._id}
                        type="button"
                        onClick={() => openAdminNotification(n)}
                        style={{
                          ...card,
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          padding: 16,
                          borderColor: n.isRead ? t.line : `${t.forest}40`,
                          background: n.isRead ? t.surface : 'rgba(39,57,46,0.04)',
                          fontFamily: t.fontBody,
                        }}
                      >
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <span
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background: meta.bg,
                              color: meta.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={18} />
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: meta.color }}>
                                {meta.label}
                              </span>
                              <span style={{ fontSize: 12, color: t.inkFaint, whiteSpace: 'nowrap' }}>
                                {new Date(n.createdAt).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </span>
                            <span style={{ display: 'block', fontSize: 14, color: t.ink, fontWeight: n.isRead ? 500 : 700, lineHeight: 1.45 }}>
                              {n.message}
                            </span>
                            {n.senderId?.name && (
                              <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: t.inkFaint }}>
                                From {n.senderId.name}
                                {n.senderId.username ? ` @${n.senderId.username}` : ''}
                              </span>
                            )}
                          </span>
                          {!n.isRead && (
                            <span
                              aria-label="Unread"
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: t.clay,
                                marginTop: 6,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : tab === 'reports' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'pending', label: 'Pending queue' },
                  { id: 'history', label: 'History' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setReportView(v.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: `1.5px solid ${reportView === v.id ? t.forest : t.line}`,
                      background: reportView === v.id ? t.forest : '#FFF',
                      color: reportView === v.id ? '#FFF' : t.inkSoft,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: t.fontBody,
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {reports.length === 0 ? (
                <div style={{ ...card, padding: '60px 24px', textAlign: 'center' }}>
                  <Check size={48} color={t.sage} style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontFamily: t.fontDisplay, fontSize: 20, margin: '0 0 8px', color: t.ink }}>
                    {reportView === 'history' ? 'No history yet' : 'Clean slate'}
                  </h3>
                  <p style={{ color: t.inkSoft, fontSize: 14, margin: 0 }}>
                    {reportView === 'history' ? 'Resolved reports will show up here.' : 'No pending reports.'}
                  </p>
                </div>
              ) : (
                reports.map((report) => {
                  const viewPostId = report.viewPostId || (report.targetType === 'ForumPost' ? report.targetId : report.postId);
                  return (
                    <div key={report._id} style={{ ...card, opacity: actioningId === report._id ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.clayDeep, background: t.clayTint, padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> {report.reason}
                        </span>
                        <span style={{ fontSize: 12, color: t.inkFaint }}>
                          by {report.reporterId?.name || 'Anonymous'} · {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: t.ink, margin: '0 0 12px', lineHeight: 1.5, background: t.bg, padding: '12px 16px', borderRadius: 8 }}>
                        {report.description || 'No additional explanation.'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.surfaceSunken, padding: '12px 16px', borderRadius: 10, marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {report.targetType === 'ForumPost' ? <FileText size={18} color={t.skyDeep} /> : <MessageSquare size={18} color={t.sageDeep} />}
                          <span style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>
                            {report.targetType === 'ForumPost' ? 'Post' : 'Comment'} · {String(report.targetId).slice(-8)}
                          </span>
                        </div>
                        {viewPostId && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                report.targetType === 'Comment'
                                  ? `/community/posts/${viewPostId}#comment-${report.targetId}`
                                  : `/community/posts/${viewPostId}`
                              )
                            }
                            style={{ background: 'none', border: 'none', color: t.skyDeep, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                          >
                            View <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                      {reportView === 'history' ? (
                        <p style={{ margin: 0, fontSize: 13, color: t.inkSoft }}>
                          Action: <strong style={{ color: t.ink }}>{ACTION_LABELS[report.actionTaken] || report.actionTaken || 'Reviewed'}</strong>
                          {report.resolvedBy?.name ? ` · by ${report.resolvedBy.name}` : ''}
                          {report.resolvedAt ? ` · ${new Date(report.resolvedAt).toLocaleString()}` : ''}
                        </p>
                      ) : (
                        <div className="db-admin-user-actions" style={{ justifyContent: 'flex-end' }}>
                          <ActionBtn color={t.sageDeep} bg={t.sageSoft} border={`${t.sage}40`} onClick={() => handleResolveReport(report._id, 'dismiss')} disabled={!!actioningId}>
                            <Check size={14} /> Dismiss
                          </ActionBtn>
                          <ActionBtn color={t.gold} bg={t.goldSoft} border={`${t.gold}30`} onClick={() => handleResolveReport(report._id, 'hide_content')} disabled={!!actioningId}>
                            <EyeOff size={14} /> Hide
                          </ActionBtn>
                          <ActionBtn color={t.clayDeep} bg={t.claySoft} border={`${t.clay}30`} onClick={() => handleResolveReport(report._id, 'delete_content')} disabled={!!actioningId}>
                            <Trash2 size={14} /> Soft delete
                          </ActionBtn>
                          <ActionBtn color="#D32F2F" bg="#FFECEC" border="#FFCDD2" onClick={() => handleResolveReport(report._id, 'ban_user')} disabled={!!actioningId}>
                            <Ban size={14} /> Ban author
                          </ActionBtn>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : null}
        </div>
      </main>

      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        danger={confirmState?.danger}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          const action = confirmState?.onConfirm;
          setConfirmState(null);
          action?.();
        }}
      />

      <PromptDialog
        open={!!promptState}
        title={promptState?.title}
        message={promptState?.message}
        placeholder={promptState?.placeholder}
        defaultValue={promptState?.defaultValue}
        confirmLabel={promptState?.confirmLabel}
        required={promptState?.required}
        onCancel={() => setPromptState(null)}
        onConfirm={(value) => {
          const action = promptState?.onConfirm;
          setPromptState(null);
          action?.(value);
        }}
      />

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            padding: '12px 18px',
            borderRadius: 10,
            background: toast.type === 'error' ? t.claySoft : toast.type === 'success' ? t.sageSoft : t.forest,
            color: toast.type === 'error' ? t.clayDeep : toast.type === 'success' ? t.sageDeep : '#F7F3EC',
            fontSize: 13,
            fontWeight: 650,
            boxShadow: t.shadowLifted,
            maxWidth: '90vw',
            fontFamily: t.fontBody,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel, danger, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        fontFamily: theme.fontBody,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#FFF',
          border: `1.5px solid ${theme.lineStrong}`,
          borderRadius: 18,
          width: '100%',
          maxWidth: 420,
          padding: 24,
          boxShadow: theme.shadowLifted,
        }}
      >
        <h3 style={{ fontFamily: theme.fontDisplay, fontSize: 20, margin: '0 0 10px', color: theme.ink }}>
          {title || 'Confirm action'}
        </h3>
        <p style={{ margin: '0 0 22px', fontSize: 14, color: theme.inkSoft, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: `1px solid ${theme.line}`,
              borderRadius: 8,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: theme.fontBody,
              color: theme.inkSoft,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: danger ? '#D32F2F' : theme.forest,
              color: '#FFF',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: theme.fontBody,
            }}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptDialog({ open, title, message, placeholder, defaultValue, confirmLabel, required, onCancel, onConfirm }) {
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (open) {
      setValue(defaultValue || '');
      setFieldError('');
    }
  }, [open, defaultValue]);

  if (!open) return null;

  const handleSubmit = () => {
    if (required && !value.trim()) {
      setFieldError('This field is required.');
      return;
    }
    onConfirm(value);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        fontFamily: theme.fontBody,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#FFF',
          border: `1.5px solid ${theme.lineStrong}`,
          borderRadius: 18,
          width: '100%',
          maxWidth: 460,
          padding: 24,
          boxShadow: theme.shadowLifted,
        }}
      >
        <h3 style={{ fontFamily: theme.fontDisplay, fontSize: 20, margin: '0 0 10px', color: theme.ink }}>
          {title || 'Enter details'}
        </h3>
        {message && <p style={{ margin: '0 0 14px', fontSize: 14, color: theme.inkSoft, lineHeight: 1.5 }}>{message}</p>}
        <textarea
          autoFocus
          rows={3}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (fieldError) setFieldError('');
          }}
          placeholder={placeholder}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 10,
            borderRadius: 8,
            border: `1.5px solid ${fieldError ? '#D32F2F' : theme.line}`,
            fontSize: 13,
            fontFamily: theme.fontBody,
            resize: 'vertical',
          }}
        />
        {fieldError && (
          <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: '#D32F2F' }}>{fieldError}</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: `1px solid ${theme.line}`,
              borderRadius: 8,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: theme.fontBody,
              color: theme.inkSoft,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              background: theme.forest,
              color: '#FFF',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: theme.fontBody,
            }}
          >
            {confirmLabel || 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, disabled, color, bg, border }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color,
        border: `1.5px solid ${border}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: theme.fontBody,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
