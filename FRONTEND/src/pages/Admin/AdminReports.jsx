import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { API_URL } from '../../config/api';
import {
  Shield,
  Trash2,
  EyeOff,
  UserX,
  Check,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  BadgeCheck,
  Ban,
  UserCog,
  FolderKanban,
  Plus,
} from 'lucide-react';

const t = theme;

const VALID_TABS = ['overview', 'users', 'reports', 'topics'];

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reports', label: 'Reports', icon: Shield },
  { id: 'topics', label: 'Topics', icon: FolderKanban },
];

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
  const [topics, setTopics] = useState([]);
  const [topicForm, setTopicForm] = useState({ name: '', slug: '', description: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');

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

  const fetchQueue = useCallback(async () => {
    const res = await fetch(`${API_URL}/admin/reports?status=pending`, {
      credentials: 'include',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch reports');
    setReports(Array.isArray(data) ? data : data.data || []);
  }, [headers]);

  const fetchTopics = useCallback(async () => {
    const res = await fetch(`${API_URL}/topics`, {
      credentials: 'include',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch topics');
    setTopics(Array.isArray(data) ? data : data.data || []);
  }, [headers]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview') await fetchStats();
      else if (tab === 'users') await fetchUsers();
      else if (tab === 'reports') await fetchQueue();
      else if (tab === 'topics') await fetchTopics();
    } catch (err) {
      setError(err.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [tab, fetchStats, fetchUsers, fetchQueue, fetchTopics]);

  useEffect(() => {
    if (user?.role === 'admin') refresh();
  }, [user, refresh]);

  useEffect(() => {
    if (user?.role === 'admin' && !stats) {
      fetchStats().catch(() => {});
    }
  }, [user, stats, fetchStats]);

  const handleResolveReport = async (reportId, actionType) => {
    if (!window.confirm(`Perform action: "${actionType}"?`)) return;
    setActioningId(reportId);
    try {
      const res = await fetch(`${API_URL}/admin/reports/${reportId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: headers(),
        body: JSON.stringify({ status: 'reviewed', action: actionType }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
        if (actionType === 'ban_user') await fetchUsers().catch(() => {});
        if (stats) setStats((s) => s && { ...s, reports: { ...s.reports, pending: Math.max(0, (s.reports?.pending || 1) - 1) } });
      } else {
        const data = await res.json();
        alert(data.message || 'Resolution failed.');
      }
    } catch {
      alert('Connection error resolving report.');
    } finally {
      setActioningId(null);
    }
  };

  const updateUser = async (id, body, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
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
        alert(data.message || 'Update failed');
        return;
      }
      await fetchUsers();
    } catch {
      alert('Connection error updating user.');
    } finally {
      setActioningId(null);
    }
  };

  const deleteUser = async (id, hard = false) => {
    const msg = hard
      ? 'Permanently delete this user and scrub their content? This cannot be undone.'
      : 'Ban this user and hide their active posts?';
    if (!window.confirm(msg)) return;
    setActioningId(id);
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}${hard ? '?hard=true' : ''}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Delete failed');
        return;
      }
      await fetchUsers();
      if (tab === 'overview') await fetchStats().catch(() => {});
    } catch {
      alert('Connection error deleting user.');
    } finally {
      setActioningId(null);
    }
  };

  const handleTopicNameChange = (name) => {
    setTopicForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    const name = topicForm.name.trim();
    const slug = (topicForm.slug || slugify(name)).trim();
    if (!name || !slug) {
      alert('Name and slug are required.');
      return;
    }
    setCreatingTopic(true);
    try {
      const res = await fetch(`${API_URL}/topics`, {
        method: 'POST',
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
        alert(data.message || 'Failed to create topic');
        return;
      }
      setTopicForm({ name: '', slug: '', description: '' });
      setSlugTouched(false);
      await fetchTopics();
    } catch {
      alert('Connection error creating topic.');
    } finally {
      setCreatingTopic(false);
    }
  };

  const deleteTopic = async (id, name, postsCount) => {
    if (postsCount > 0) {
      alert('Cannot delete a topic that still has posts. Move or remove posts first.');
      return;
    }
    if (!window.confirm(`Delete topic "${name}"? This cannot be undone.`)) return;
    setActioningId(id);
    try {
      const res = await fetch(`${API_URL}/topics/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Delete failed');
        return;
      }
      setTopics((prev) => prev.filter((topic) => topic._id !== id));
    } catch {
      alert('Connection error deleting topic.');
    } finally {
      setActioningId(null);
    }
  };

  const card = {
    background: t.surface,
    border: `1.5px solid ${t.line}`,
    borderRadius: 16,
    padding: 20,
    boxShadow: t.shadowCard,
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
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
                Admin
              </p>
              <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 500, color: t.ink, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={28} color={t.clayDeep} /> Site console
              </h1>
              <p style={{ margin: '8px 0 0', color: t.inkSoft, fontSize: 14 }}>
                Manage users, reports, topics, and platform health.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/community')}
                style={{
                  background: t.surfaceSunken,
                  border: `1.5px solid ${t.line}`,
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: t.inkFaint,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: t.fontBody,
                }}
              >
                <MessageSquare size={14} /> View community
              </button>
              <button
                type="button"
                onClick={refresh}
                style={{
                  background: t.surface,
                  border: `1.5px solid ${t.line}`,
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.inkSoft,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: t.fontBody,
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 999,
                  border: `1.5px solid ${tab === id ? t.forest : t.line}`,
                  background: tab === id ? t.forest : '#FFF',
                  color: tab === id ? '#FFF' : t.inkSoft,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: t.fontBody,
                }}
              >
                <Icon size={14} /> {label}
                {id === 'reports' && stats?.reports?.pending > 0 && (
                  <span style={{ background: t.clay, color: '#FFF', borderRadius: 999, fontSize: 11, padding: '1px 7px' }}>
                    {stats.reports.pending}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Users', value: stats.users.total },
                  { label: 'Active', value: stats.users.active },
                  { label: 'Banned', value: stats.users.banned },
                  { label: 'Admins', value: stats.users.admins },
                  { label: 'Posts', value: stats.content.posts },
                  { label: 'Pending reports', value: stats.reports.pending },
                ].map((s) => (
                  <div key={s.label} style={card}>
                    <p style={{ margin: 0, fontSize: 12, color: t.inkFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                    <p style={{ margin: '8px 0 0', fontFamily: t.fontDisplay, fontSize: 28, color: t.ink, fontWeight: 600 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={card}>
                <h3 style={{ margin: '0 0 12px', fontFamily: t.fontDisplay, fontSize: 18, color: t.ink }}>Recent signups</h3>
                {(stats.recentUsers || []).length === 0 ? (
                  <p style={{ margin: 0, color: t.inkFaint, fontSize: 14 }}>No users yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stats.recentUsers.map((u) => (
                      <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '8px 0', borderBottom: `1px solid ${t.line}` }}>
                        <span style={{ color: t.ink, fontWeight: 600 }}>{u.name} <span style={{ color: t.inkFaint, fontWeight: 400 }}>@{u.username}</span></span>
                        <span style={{ color: t.inkSoft }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setTab('users')}
                  style={{ marginTop: 14, background: 'none', border: 'none', color: t.skyDeep, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: t.fontBody }}
                >
                  Manage all users →
                </button>
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
                          {u.isVerifiedProfessional && (
                            <span style={{ marginLeft: 6, fontSize: 11, background: t.sageSoft, color: t.sageDeep, padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>PRO</span>
                          )}
                          {!u.isActive && (
                            <span style={{ marginLeft: 6, fontSize: 11, background: '#FFECEC', color: '#D32F2F', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>BANNED</span>
                          )}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: t.inkSoft }}>
                          {u.email} · {u.postsCount || 0} posts · joined {new Date(u.createdAt).toLocaleDateString()}
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: `1px solid ${t.line}`, paddingTop: 12 }}>
                      {u.isActive ? (
                        <ActionBtn color="#D32F2F" bg="#FFECEC" border="#FFCDD2" onClick={() => updateUser(u._id, { isActive: false }, 'Ban this user?')} disabled={!!actioningId}>
                          <Ban size={14} /> Ban
                        </ActionBtn>
                      ) : (
                        <ActionBtn color={t.sageDeep} bg={t.sageSoft} border={`${t.sage}40`} onClick={() => updateUser(u._id, { isActive: true }, 'Restore this user?')} disabled={!!actioningId}>
                          <Check size={14} /> Unban
                        </ActionBtn>
                      )}
                      <ActionBtn
                        color={t.sageDeep}
                        bg={t.sageSoft}
                        border={`${t.sage}40`}
                        onClick={() =>
                          updateUser(
                            u._id,
                            { isVerifiedProfessional: !u.isVerifiedProfessional },
                            u.isVerifiedProfessional ? 'Remove verified-pro badge?' : 'Mark as verified professional?'
                          )
                        }
                        disabled={!!actioningId}
                      >
                        <BadgeCheck size={14} /> {u.isVerifiedProfessional ? 'Unverify pro' : 'Verify pro'}
                      </ActionBtn>
                      {u.role !== 'admin' ? (
                        <ActionBtn color={t.clayDeep} bg={t.claySoft} border={`${t.clay}30`} onClick={() => updateUser(u._id, { role: 'admin' }, 'Promote this user to admin?')} disabled={!!actioningId}>
                          <UserCog size={14} /> Make admin
                        </ActionBtn>
                      ) : (
                        <ActionBtn color={t.inkSoft} bg={t.surfaceSunken} border={t.line} onClick={() => updateUser(u._id, { role: 'patient' }, 'Demote this admin to patient?')} disabled={!!actioningId}>
                          <UserCog size={14} /> Demote
                        </ActionBtn>
                      )}
                      <ActionBtn color={t.clayDeep} bg={t.claySoft} border={`${t.clay}30`} onClick={() => deleteUser(u._id, false)} disabled={!!actioningId}>
                        <UserX size={14} /> Ban + hide posts
                      </ActionBtn>
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
              <form onSubmit={handleCreateTopic} style={card}>
                <h3 style={{ margin: '0 0 16px', fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Plus size={18} color={t.forest} /> New topic
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
                  <Plus size={14} /> {creatingTopic ? 'Creating…' : 'Create topic'}
                </button>
              </form>

              {topics.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', padding: 40, color: t.inkSoft }}>
                  <FolderKanban size={40} color={t.inkFaint} style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No topics yet. Create one above.</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <div key={topic._id} style={{ ...card, opacity: actioningId === topic._id ? 0.6 : 1 }}>
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
                          onClick={() => navigate(`/community?topic=${topic.slug}`)}
                          style={{ background: 'none', border: 'none', color: t.skyDeep, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: t.fontBody }}
                        >
                          View in feed <ExternalLink size={12} />
                        </button>
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
          ) : reports.length === 0 ? (
            <div style={{ ...card, padding: '60px 24px', textAlign: 'center' }}>
              <Check size={48} color={t.sage} style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: t.fontDisplay, fontSize: 20, margin: '0 0 8px', color: t.ink }}>Clean slate</h3>
              <p style={{ color: t.inkSoft, fontSize: 14, margin: 0 }}>No pending reports.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reports.map((report) => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.surfaceSunken, padding: '12px 16px', borderRadius: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {report.targetType === 'ForumPost' ? <FileText size={18} color={t.skyDeep} /> : <MessageSquare size={18} color={t.sageDeep} />}
                      <span style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>
                        {report.targetType === 'ForumPost' ? 'Post' : 'Comment'} · {String(report.targetId).slice(-8)}
                      </span>
                    </div>
                    {report.targetType === 'ForumPost' && (
                      <button type="button" onClick={() => navigate(`/community/posts/${report.targetId}`)} style={{ background: 'none', border: 'none', color: t.skyDeep, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                        View <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${t.line}`, paddingTop: 12 }}>
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
                      <UserX size={14} /> Ban author
                    </ActionBtn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
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
