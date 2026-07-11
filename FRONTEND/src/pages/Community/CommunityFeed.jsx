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
  Filter, 
  Award,
  Lock,
  Pin,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const t = theme;

export default function CommunityFeed() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filtering
  const selectedTopic = searchParams.get('topic') || '';
  const sortBy = searchParams.get('sort') || 'latest';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch topics
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
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // Fetch posts feed
  useEffect(() => {
    const fetchFeed = async () => {
      setPostsLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams({
          sort: sortBy,
          page: currentPage.toString(),
          limit: '10'
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
          setError(data.message || 'Failed to fetch discussion feed');
        }
      } catch (err) {
        setError('Network error loading discussion feed');
        console.error(err);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchFeed();
  }, [selectedTopic, sortBy, searchQuery, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchInputValue) {
        prev.set('search', searchInputValue);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleTopicSelect = (topicId) => {
    setSearchParams(prev => {
      if (topicId) {
        prev.set('topic', topicId);
      } else {
        prev.delete('topic');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSortChange = (sortType) => {
    setSearchParams(prev => {
      prev.set('sort', sortType);
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (pageNum) => {
    setSearchParams(prev => {
      prev.set('page', pageNum.toString());
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchInputValue('');
    setSearchParams({});
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#E8E0D4', fontFamily: t.fontBody }}>
      <AppSidebar />
      
      <main style={{ flexGrow: 1, minWidth: 0, padding: '28px 24px 72px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          
          {/* Forum Header */}
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ 
                margin: '0 0 8px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: t.forest,
              }}>
                Community
              </p>
              <h1 style={{ fontFamily: t.fontDisplay, fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, fontWeight: 500, color: t.ink, letterSpacing: '-0.02em' }}>
                Forum
              </h1>
              <p style={{ color: t.inkSoft, fontSize: '15px', margin: '8px 0 0', maxWidth: '480px', lineHeight: 1.55, fontWeight: 500 }}>
                Ask questions, share routines, and learn with people who get it.
              </p>
            </div>
            <button 
              onClick={() => navigate('/community/new-post')}
              style={{
                background: t.forest,
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 24px rgba(22, 33, 25, 0.22)',
              }}
            >
              <PlusCircle size={16} /> New post
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }} className="db-responsive-grid">
              
              {/* Left Column: Topics */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
                <div style={{ 
                  background: '#FFF', 
                  borderRadius: '16px', 
                  padding: '18px', 
                  border: `1.5px solid ${t.lineStrong}`,
                  boxShadow: t.shadowCard,
                }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: t.ink, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                    Topics
                  </h3>
                  
                  {loading ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: t.inkFaint }}><RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto' }} /></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button 
                        onClick={() => handleTopicSelect('')}
                        style={{
                          background: selectedTopic === '' ? t.forest : 'transparent',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: selectedTopic === '' ? 700 : 600,
                          color: selectedTopic === '' ? '#FFF' : t.ink,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>All</span>
                      </button>
                      
                      {topics.map(topic => (
                        <button 
                          key={topic._id}
                          onClick={() => handleTopicSelect(topic._id)}
                          style={{
                            background: selectedTopic === topic._id ? t.forest : 'transparent',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: selectedTopic === topic._id ? 700 : 600,
                            color: selectedTopic === topic._id ? '#FFF' : t.ink,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: selectedTopic === topic._id ? t.peach : (topic.color || t.sage) }} />
                            {topic.name}
                          </span>
                          <span style={{ fontSize: '11px', color: selectedTopic === topic._id ? 'rgba(255,255,255,0.7)' : t.inkFaint, fontWeight: 600 }}>
                            {topic.postsCount || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
              
              {/* Right Column */}
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ 
                  background: '#FFF', 
                  borderRadius: '16px', 
                  padding: '12px 14px', 
                  border: `1.5px solid ${t.lineStrong}`,
                  boxShadow: t.shadowCard,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <form onSubmit={handleSearchSubmit} style={{ flexGrow: 1, position: 'relative', minWidth: '220px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: t.inkSoft }} />
                    <input 
                      type="text" 
                      value={searchInputValue}
                      onChange={e => setSearchInputValue(e.target.value)}
                      placeholder="Search discussions..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px 10px 36px',
                        background: t.surfaceSunken,
                        border: `1.5px solid ${t.lineStrong}`,
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: t.ink,
                        fontWeight: 500,
                        outline: 'none',
                        fontFamily: t.fontBody
                      }}
                    />
                  </form>
                  
                  {/* Sort Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={14} color={t.ink} />
                    <span style={{ fontSize: '13px', color: t.ink, fontWeight: '600' }}>Sort:</span>
                    <div style={{ display: 'flex', background: t.surfaceSunken, padding: '4px', borderRadius: '10px', border: `1.5px solid ${t.lineStrong}` }}>
                      {[
                        ['latest', 'Latest'],
                        ['most_commented', 'Activity'],
                        ['best_answers', 'Verified Q&A']
                      ].map(([type, label]) => (
                        <button
                          key={type}
                          onClick={() => handleSortChange(type)}
                          style={{
                            background: sortBy === type ? t.forest : 'none',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: sortBy === type ? '700' : '600',
                            color: sortBy === type ? '#FFF' : t.inkSoft,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                {postsLoading ? (
                  <div style={{ padding: '60px 0', textAlign: 'center', color: t.inkSoft }}>
                    <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px' }} />
                    <p style={{ margin: 0 }}>Loading discussions...</p>
                  </div>
                ) : error ? (
                  <div style={{ background: t.clayTint, border: `1.5px solid ${t.clay}30`, borderRadius: '16px', padding: '24px', color: t.clayDeep, textAlign: 'center' }}>
                    <p style={{ margin: '0 0 16px 0', fontWeight: '500' }}>{error}</p>
                    <button onClick={clearFilters} style={{ background: t.clay, color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                      Reset filters
                    </button>
                  </div>
                ) : posts.length === 0 ? (
                  <div style={{ background: t.surface, border: `1.5px solid ${t.line}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', boxShadow: t.shadowCard }}>
                    <FolderOpen size={48} color={t.inkFaint} style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontFamily: t.fontDisplay, fontSize: '20px', margin: '0 0 8px 0', color: t.ink }}>No posts found</h3>
                    <p style={{ color: t.inkSoft, fontSize: '14px', margin: '0 0 24px 0', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
                      There are no active discussions here matching your filters. Why not start one yourself?
                    </p>
                    <button 
                      onClick={() => navigate('/community/new-post')}
                      style={{ background: t.sageDeep, color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <PlusCircle size={16} /> Create the first post
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {posts.map(post => {
                      const postTopicColor = post.topicId?.color || t.sage;
                      const hasBestAnswer = !!post.bestAnswerCommentId;

                      return (
                        <article 
                          key={post._id}
                          onClick={() => navigate(`/community/posts/${post._id}`)}
                          style={{
                            background: '#FFF',
                            border: `1.5px solid ${t.lineStrong}`,
                            borderRadius: '16px',
                            padding: '20px 22px',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: t.shadowCard,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = t.forest;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 14px 30px rgba(55,45,35,0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = t.lineStrong;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = t.shadowCard;
                          }}
                        >
                          {/* Thread badges (Pin, Lock, Best Answer) */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            {post.isPinned && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', color: t.sageDeep, background: t.sageTint, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                <Pin size={10} /> Pinned
                              </span>
                            )}
                            {post.isLocked && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', color: t.clayDeep, background: t.clayTint, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                <Lock size={10} /> Locked
                              </span>
                            )}
                            {hasBestAnswer && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', color: t.gold, background: t.goldTint, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                <Award size={10} /> Solved / Best Answer
                              </span>
                            )}
                            
                            {/* Topic tag */}
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: '600', 
                              color: postTopicColor, 
                              background: postTopicColor + '15',
                              padding: '2px 8px', 
                              borderRadius: '6px',
                              marginLeft: 'auto'
                            }}>
                              {post.topicId?.name || 'General'}
                            </span>
                          </div>

                          {/* Post Title */}
                          <h2 style={{ 
                            fontSize: '19px', 
                            color: t.ink, 
                            fontWeight: '700', 
                            margin: '0 0 10px 0',
                            fontFamily: t.fontBody,
                            lineHeight: '1.3'
                          }}>
                            {post.title}
                          </h2>

                          {/* Post snippet */}
                          <p style={{ 
                            fontSize: '14px', 
                            color: t.inkSoft, 
                            margin: '0 0 20px 0', 
                            lineHeight: '1.55',
                            fontWeight: 500,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {post.content}
                          </p>

                          {/* Author & Footer stats */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            flexWrap: 'wrap', 
                            gap: '12px',
                            borderTop: `1px solid ${t.line}`,
                            paddingTop: '16px'
                          }}>
                            
                            {/* Author */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                background: t.sageSoft, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: t.sageDeep,
                                overflow: 'hidden'
                              }}>
                                {post.isAnonymous ? '👤' : (
                                  post.authorId?.profileImageUrl ? (
                                    <img src={post.authorId.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : post.authorId?.name?.charAt(0).toUpperCase()
                                )}
                              </div>
                              
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: t.ink, margin: 0 }}>
                                  {post.isAnonymous ? 'Anonymous Buddy' : post.authorId?.name}
                                  {!post.isAnonymous && post.authorId?.isVerifiedProfessional && (
                                    <span style={{ marginLeft: '4px', fontSize: '10px', background: t.skyDeep, color: '#FFF', padding: '1px 5px', borderRadius: '4px', verticalAlign: 'middle', fontWeight: '700' }}>
                                      PRO
                                    </span>
                                  )}
                                </p>
                                <p style={{ fontSize: '11px', color: t.inkFaint, margin: 0 }}>
                                  {!post.isAnonymous && post.authorId?.diabetesType ? `${post.authorId.diabetesType} · ` : ''}
                                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            {/* Feed Stats */}
                            <div style={{ display: 'flex', gap: '16px', color: t.inkSoft, fontSize: '13px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ThumbsUp size={14} color={t.inkFaint} /> {post.likesCount || 0}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MessageSquare size={14} color={t.inkFaint} /> {post.commentsCount || 0}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Eye size={14} color={t.inkFaint} /> {post.viewsCount || 0}
                              </span>
                            </div>

                          </div>
                        </article>
                      );
                    })}

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          style={{
                            background: t.surface,
                            border: `1.5px solid ${t.line}`,
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            color: currentPage === 1 ? t.inkFaint : t.ink,
                            opacity: currentPage === 1 ? 0.6 : 1
                          }}
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            style={{
                              background: pageNum === currentPage ? t.sageDeep : t.surface,
                              border: `1.5px solid ${pageNum === currentPage ? t.sageDeep : t.line}`,
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              color: pageNum === currentPage ? '#FFF' : t.ink,
                              fontWeight: pageNum === currentPage ? '600' : '400'
                            }}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          style={{
                            background: t.surface,
                            border: `1.5px solid ${t.line}`,
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            color: currentPage === totalPages ? t.inkFaint : t.ink,
                            opacity: currentPage === totalPages ? 0.6 : 1
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}

                  </div>
                )}
                
              </section>

            </div>
          </div>
          
        </div>
      </main>
      <style>{`
        @media (max-width: 860px) {
          .db-responsive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
