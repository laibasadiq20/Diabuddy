import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { API_URL } from '../../config/api';
import {
  ArrowLeft,
  MessageSquare,
  MapPin,
  RefreshCw,
  FolderOpen,
  Award,
  Eye,
  ThumbsUp,
} from 'lucide-react';

const t = theme;

async function readJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text?.slice(0, 120) || 'Unexpected server response' };
  }
}

export default function UserProfile() {
  const { id } = useParams();
  const location = useLocation();
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const preview = location.state?.preview;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dmLoading, setDmLoading] = useState(false);

  const isSelf = user && (String(user.id) === String(id) || String(user._id) === String(id));

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setError('Invalid profile link');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Prefer dedicated profile routes (new /api/users/:id, then legacy /api/auth/users/:id)
        const headers = { ...authHeaders() };
        let profileData = null;

        for (const path of [`${API_URL}/users/${id}`, `${API_URL}/auth/users/${id}`]) {
          const res = await fetch(path, { credentials: 'include', headers });
          const data = await readJson(res);
          if (res.ok && data.data) {
            profileData = data.data;
            break;
          }
          // Keep last meaningful error for display if all fail
          if (!res.ok) {
            setError(data.message || `Could not load profile (${res.status})`);
          }
        }

        // Fallback while backend redeploys: use author preview from navigation
        if (!profileData && preview && String(preview._id || preview.id) === String(id)) {
          profileData = {
            _id: preview._id || preview.id,
            id: preview._id || preview.id,
            name: preview.name,
            username: preview.username,
            profileImageUrl: preview.profileImageUrl,
            diabetesType: preview.diabetesType,
            isVerifiedProfessional: preview.isVerifiedProfessional,
            bio: preview.bio || '',
            location: preview.location || '',
          };
          setError('');
        }

        if (!profileData) {
          setProfile(null);
          setError((prev) => prev || 'User not found');
          return;
        }

        setProfile(profileData);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Could not load profile. Please try again.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadPosts = async () => {
      if (!id || id === 'undefined') return;
      setPostsLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/posts?authorId=${encodeURIComponent(id)}&sort=latest&limit=20`,
          {
            credentials: 'include',
            headers: { ...authHeaders() },
          }
        );
        const data = await readJson(res);
        if (res.ok) setPosts(data.posts || []);
        else setPosts([]);
      } catch {
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };
    loadPosts();
  }, [id]);

  const startDm = async () => {
    if (!profile || isSelf) return;
    setDmLoading(true);
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ memberIds: [String(profile._id || profile.id)], isGroup: false }),
      });
      const data = await readJson(res);
      if (res.ok) {
        navigate('/messages', { state: { conversationId: data._id } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDmLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#E8E0D4', fontFamily: t.fontBody }}>
      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 72px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: '#FFF',
              border: `1.5px solid ${t.lineStrong}`,
              color: t.inkSoft,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
              padding: '8px 12px',
              borderRadius: 999,
              fontFamily: t.fontBody,
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: t.inkSoft }}>
              <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 12px' }} />
              Loading profile…
            </div>
          ) : error || !profile ? (
            <div style={{ background: '#FFF', borderRadius: 20, border: `1.5px solid ${t.lineStrong}`, padding: 40, textAlign: 'center' }}>
              <p style={{ color: t.clayDeep, fontWeight: 600, margin: 0 }}>{error || 'User not found'}</p>
              <button
                type="button"
                onClick={() => navigate('/community')}
                style={{
                  marginTop: 16,
                  background: t.forest,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to community
              </button>
            </div>
          ) : (
            <>
              <section
                style={{
                  background: '#FFF',
                  border: `1.5px solid ${t.lineStrong}`,
                  borderRadius: 20,
                  padding: '22px 20px',
                  boxShadow: t.shadowCard,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: t.forest,
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      fontWeight: 700,
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {profile.profileImageUrl ? (
                      <img src={profile.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      profile.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 500, color: t.ink }}>
                        {profile.name}
                      </h1>
                      {profile.isVerifiedProfessional && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: t.skyDeep, color: '#FFF', padding: '2px 7px', borderRadius: 6 }}>
                          PRO
                        </span>
                      )}
                    </div>
                    {profile.username && (
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: t.inkFaint }}>@{profile.username}</p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 10, fontSize: 13, color: t.inkSoft }}>
                      {profile.diabetesType && <span>{profile.diabetesType}</span>}
                      {profile.location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} /> {profile.location}
                        </span>
                      )}
                      {profile.postsCount != null && <span>{profile.postsCount} posts</span>}
                    </div>
                    {profile.bio && (
                      <p style={{ margin: '12px 0 0', fontSize: 14, color: t.inkSoft, lineHeight: 1.55 }}>
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                  {isSelf ? (
                    <button
                      type="button"
                      onClick={() => navigate('/account')}
                      style={{
                        background: t.forest,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: 12,
                        padding: '11px 18px',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: t.fontBody,
                      }}
                    >
                      Edit my account
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startDm}
                      disabled={dmLoading}
                      style={{
                        background: t.forest,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: 12,
                        padding: '11px 18px',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: dmLoading ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        opacity: dmLoading ? 0.7 : 1,
                        fontFamily: t.fontBody,
                      }}
                    >
                      <MessageSquare size={15} />
                      {dmLoading ? 'Opening…' : 'Message'}
                    </button>
                  )}
                </div>
              </section>

              <h2 style={{ margin: '0 0 12px', fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 500, color: t.ink }}>
                Public posts
              </h2>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: t.inkFaint }}>
                Anonymous posts are never shown on profiles.
              </p>

              {postsLoading ? (
                <div style={{ textAlign: 'center', padding: 32, color: t.inkSoft }}>
                  <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                </div>
              ) : posts.length === 0 ? (
                <div style={{ background: '#FFF', borderRadius: 18, border: `1.5px solid ${t.lineStrong}`, padding: 36, textAlign: 'center', color: t.inkSoft }}>
                  <FolderOpen size={36} color={t.inkFaint} style={{ margin: '0 auto 10px' }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No public posts yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {posts.map((post) => (
                    <button
                      key={post._id}
                      type="button"
                      onClick={() => navigate(`/community/posts/${post._id}`)}
                      style={{
                        textAlign: 'left',
                        background: '#FFF',
                        border: `1.5px solid ${t.lineStrong}`,
                        borderRadius: 16,
                        padding: '16px 18px',
                        cursor: 'pointer',
                        boxShadow: t.shadowCard,
                        fontFamily: t.fontBody,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: post.topicId?.color || t.sage,
                            background: `${post.topicId?.color || t.sage}18`,
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {post.topicId?.name || 'General'}
                        </span>
                        {post.bestAnswerCommentId && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: t.gold }}>
                            <Award size={10} /> Solved
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: t.ink, lineHeight: 1.3 }}>
                        {post.title}
                      </p>
                      <p
                        style={{
                          margin: '0 0 12px',
                          fontSize: 13,
                          color: t.inkSoft,
                          lineHeight: 1.5,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {post.content}
                      </p>
                      <div style={{ display: 'flex', gap: 14, fontSize: 12, color: t.inkFaint }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ThumbsUp size={12} /> {post.likesCount || 0}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <MessageSquare size={12} /> {post.commentsCount || 0}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={12} /> {post.viewsCount || 0}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
