import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { API_URL } from '../../config/api';
import {
  Search,
  MessageSquare,
  ThumbsUp,
  Eye,
  PlusCircle,
  Award,
  Lock,
  Pin,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

const t = theme;

export default function CommunityFeed() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedTopic = searchParams.get('topic') || '';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchInputValue, setSearchInputValue] = useState(searchQuery);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_URL}/topics`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      setPostsLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams({
          sort: 'latest',
          page: currentPage.toString(),
          limit: '10',
        });
        if (selectedTopic) queryParams.append('topic', selectedTopic);
        if (searchQuery) queryParams.append('search', searchQuery);

        const res = await fetch(`${API_URL}/posts?${queryParams.toString()}`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        const data = await res.json();

        if (res.ok) {
          setPosts(data.posts || []);
          setTotalPages(data.pages || 1);
        } else {
          setError(data.message || 'Failed to load discussions');
        }
      } catch (err) {
        setError('Network error loading discussions');
        console.error(err);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchFeed();
  }, [selectedTopic, searchQuery, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchInputValue.trim()) {
        prev.set('search', searchInputValue.trim());
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleTopicSelect = (topicId) => {
    setSearchParams((prev) => {
      if (topicId) {
        prev.set('topic', topicId);
      } else {
        prev.delete('topic');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (pageNum) => {
    setSearchParams((prev) => {
      prev.set('page', pageNum.toString());
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchInputValue('');
    setSearchParams({});
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#E8E0D4', fontFamily: t.fontBody }}>
      <AppSidebar />

      <main style={{ flexGrow: 1, minWidth: 0, padding: '28px 24px 72px' }}>
        <div className="db-community" style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Header */}
          <div className="db-community-header">
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="db-community-eyebrow">Community</p>
              <h1 className="db-community-title">Forum</h1>
              <p className="db-community-lead">
                Ask questions, share routines, and learn with people who get it.
              </p>
            </div>
            <button
              type="button"
              className="db-community-cta"
              onClick={() => navigate('/community/new-post')}
            >
              <PlusCircle size={16} />
              <span>New post</span>
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="db-community-search">
            <Search size={16} className="db-community-search-icon" />
            <input
              type="search"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="Search discussions…"
              aria-label="Search discussions"
            />
          </form>

          {/* Simple topic chips */}
          <div className="db-community-topics" role="tablist" aria-label="Topics">
            <button
              type="button"
              role="tab"
              aria-selected={selectedTopic === ''}
              className={`db-topic-chip${selectedTopic === '' ? ' is-active' : ''}`}
              onClick={() => handleTopicSelect('')}
            >
              All
            </button>
            {!topicsLoading &&
              topics.map((topic) => (
                <button
                  key={topic._id}
                  type="button"
                  role="tab"
                  aria-selected={selectedTopic === topic._id}
                  className={`db-topic-chip${selectedTopic === topic._id ? ' is-active' : ''}`}
                  onClick={() => handleTopicSelect(topic._id)}
                >
                  {topic.name}
                </button>
              ))}
          </div>

          {/* Feed */}
          {postsLoading ? (
            <div className="db-community-state">
              <RefreshCw className="animate-spin" size={28} />
              <p>Loading discussions…</p>
            </div>
          ) : error ? (
            <div className="db-community-state db-community-state--error">
              <p>{error}</p>
              <button type="button" onClick={clearFilters}>
                Try again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="db-community-state">
              <FolderOpen size={40} color={t.inkFaint} />
              <h3>No posts yet</h3>
              <p>Be the first to start a discussion in this space.</p>
              <button type="button" className="db-community-cta" onClick={() => navigate('/community/new-post')}>
                <PlusCircle size={16} />
                <span>Create a post</span>
              </button>
            </div>
          ) : (
            <div className="db-community-feed">
              {posts.map((post) => {
                const postTopicColor = post.topicId?.color || t.sage;
                const hasBestAnswer = !!post.bestAnswerCommentId;

                return (
                  <article
                    key={post._id}
                    className="db-post-card"
                    onClick={() => navigate(`/community/posts/${post._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/community/posts/${post._id}`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <div className="db-post-meta-row">
                      <div className="db-post-badges">
                        {post.isPinned && (
                          <span className="db-badge db-badge--pin">
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                        {post.isLocked && (
                          <span className="db-badge db-badge--lock">
                            <Lock size={10} /> Locked
                          </span>
                        )}
                        {hasBestAnswer && (
                          <span className="db-badge db-badge--solved">
                            <Award size={10} /> Solved
                          </span>
                        )}
                      </div>
                      <span
                        className="db-post-topic"
                        style={{ color: postTopicColor, background: `${postTopicColor}18` }}
                      >
                        {post.topicId?.name || 'General'}
                      </span>
                    </div>

                    <h2 className="db-post-title">{post.title}</h2>
                    <p className="db-post-excerpt">{post.content}</p>

                    <div className="db-post-footer">
                      <div
                        className="db-post-author"
                        role={!post.isAnonymous && post.authorId?._id ? 'link' : undefined}
                        tabIndex={!post.isAnonymous && post.authorId?._id ? 0 : undefined}
                        onClick={(e) => {
                          if (post.isAnonymous || !post.authorId?._id) return;
                          e.stopPropagation();
                          navigate(`/users/${post.authorId._id}`, { state: { preview: post.authorId } });
                        }}
                        onKeyDown={(e) => {
                          if (post.isAnonymous || !post.authorId?._id) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/users/${post.authorId._id}`, { state: { preview: post.authorId } });
                          }
                        }}
                        style={{ cursor: !post.isAnonymous && post.authorId?._id ? 'pointer' : 'default' }}
                      >
                        <div className="db-post-avatar">
                          {post.isAnonymous ? (
                            'A'
                          ) : post.authorId?.profileImageUrl ? (
                            <img src={post.authorId.profileImageUrl} alt="" />
                          ) : (
                            post.authorId?.name?.charAt(0).toUpperCase() || '?'
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p className="db-post-author-name">
                            {post.isAnonymous ? 'Anonymous Buddy' : post.authorId?.name}
                            {!post.isAnonymous && post.authorId?.isVerifiedProfessional && (
                              <span className="db-pro-tag">PRO</span>
                            )}
                          </p>
                          <p className="db-post-date">
                            {!post.isAnonymous && post.authorId?.diabetesType
                              ? `${post.authorId.diabetesType} · `
                              : ''}
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="db-post-stats">
                        <span>
                          <ThumbsUp size={14} /> {post.likesCount || 0}
                        </span>
                        <span>
                          <MessageSquare size={14} /> {post.commentsCount || 0}
                        </span>
                        <span>
                          <Eye size={14} /> {post.viewsCount || 0}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}

              {totalPages > 1 && (
                <div className="db-community-pager">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .db-community-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }
        .db-community-eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${t.forest};
        }
        .db-community-title {
          font-family: ${t.fontDisplay};
          font-size: clamp(28px, 5vw, 40px);
          margin: 0;
          font-weight: 500;
          color: ${t.ink};
          letter-spacing: -0.02em;
        }
        .db-community-lead {
          color: ${t.inkSoft};
          font-size: 15px;
          margin: 8px 0 0;
          max-width: 42ch;
          line-height: 1.55;
          font-weight: 500;
        }
        .db-community-cta {
          background: ${t.forest};
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 10px 24px rgba(22, 33, 25, 0.22);
          font-family: ${t.fontBody};
          white-space: nowrap;
          flex-shrink: 0;
        }
        .db-community-search {
          position: relative;
          margin-bottom: 14px;
        }
        .db-community-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: ${t.inkSoft};
          pointer-events: none;
        }
        .db-community-search input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px 13px 42px;
          background: #fff;
          border: 1.5px solid ${t.lineStrong};
          border-radius: 14px;
          font-size: 14px;
          color: ${t.ink};
          font-weight: 500;
          outline: none;
          font-family: ${t.fontBody};
          box-shadow: ${t.shadowCard};
        }
        .db-community-search input:focus {
          border-color: ${t.forest};
        }
        .db-community-topics {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 18px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .db-community-topics::-webkit-scrollbar { display: none; }
        .db-topic-chip {
          flex: 0 0 auto;
          border: 1.5px solid ${t.lineStrong};
          background: #fff;
          color: ${t.inkSoft};
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .db-topic-chip.is-active {
          background: ${t.forest};
          border-color: ${t.forest};
          color: #fff;
        }
        .db-community-feed {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .db-post-card {
          background: #fff;
          border: 1.5px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 18px 20px;
          cursor: pointer;
          box-shadow: ${t.shadowCard};
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          outline: none;
        }
        .db-post-card:focus-visible {
          border-color: ${t.forest};
          box-shadow: 0 0 0 3px rgba(39, 57, 46, 0.15);
        }
        @media (hover: hover) and (pointer: fine) {
          .db-post-card:hover {
            border-color: ${t.forest};
            box-shadow: 0 14px 30px rgba(55, 45, 35, 0.1);
          }
        }
        .db-post-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .db-post-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          min-width: 0;
        }
        .db-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .db-badge--pin { color: ${t.sageDeep}; background: ${t.sageTint}; }
        .db-badge--lock { color: ${t.clayDeep}; background: ${t.clayTint}; }
        .db-badge--solved { color: ${t.gold}; background: ${t.goldTint}; }
        .db-post-topic {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .db-post-title {
          font-size: 17px;
          color: ${t.ink};
          font-weight: 700;
          margin: 0 0 8px;
          font-family: ${t.fontBody};
          line-height: 1.35;
        }
        .db-post-excerpt {
          font-size: 14px;
          color: ${t.inkSoft};
          margin: 0 0 16px;
          line-height: 1.55;
          font-weight: 500;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .db-post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          border-top: 1px solid ${t.line};
          padding-top: 14px;
        }
        .db-post-author {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .db-post-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${t.sageSoft};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: ${t.sageDeep};
          overflow: hidden;
          flex-shrink: 0;
        }
        .db-post-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .db-post-author-name {
          font-size: 13px;
          font-weight: 600;
          color: ${t.ink};
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-pro-tag {
          margin-left: 4px;
          font-size: 10px;
          background: ${t.skyDeep};
          color: #fff;
          padding: 1px 5px;
          border-radius: 4px;
          vertical-align: middle;
          font-weight: 700;
        }
        .db-post-date {
          font-size: 11px;
          color: ${t.inkFaint};
          margin: 0;
        }
        .db-post-stats {
          display: flex;
          gap: 14px;
          color: ${t.inkSoft};
          font-size: 13px;
        }
        .db-post-stats span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .db-community-state {
          background: #fff;
          border: 1.5px solid ${t.lineStrong};
          border-radius: 20px;
          padding: 48px 24px;
          text-align: center;
          color: ${t.inkSoft};
          box-shadow: ${t.shadowCard};
        }
        .db-community-state h3 {
          font-family: ${t.fontDisplay};
          font-size: 20px;
          margin: 12px 0 8px;
          color: ${t.ink};
          font-weight: 500;
        }
        .db-community-state p { margin: 0 0 20px; font-size: 14px; }
        .db-community-state--error {
          background: ${t.clayTint};
          border-color: ${t.clay}30;
          color: ${t.clayDeep};
        }
        .db-community-state--error button {
          background: ${t.clay};
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .db-community-pager {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }
        .db-community-pager button {
          background: #fff;
          border: 1.5px solid ${t.lineStrong};
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
          color: ${t.ink};
          font-family: ${t.fontBody};
          font-weight: 600;
        }
        .db-community-pager button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .db-community-pager span {
          font-size: 13px;
          color: ${t.inkSoft};
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .db-community-header {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }
          .db-community-cta {
            width: 100%;
            padding: 13px 16px;
            border-radius: 14px;
          }
          .db-post-card {
            padding: 16px;
            border-radius: 14px;
          }
          .db-post-title { font-size: 16px; }
          .db-post-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          .db-post-stats {
            width: 100%;
            justify-content: flex-start;
            padding-top: 2px;
          }
        }
      `}</style>
    </div>
  );
}
