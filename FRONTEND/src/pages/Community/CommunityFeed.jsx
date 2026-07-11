import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import Navbar from '../../components/Navbar';
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
  const { user } = useAuth();
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
        const res = await fetch(`${API_URL}/topics`, { credentials: 'include' });
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

        const res = await fetch(`${API_URL}/posts?${queryParams.toString()}`, { credentials: 'include' });
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #F7F3EC 0%, #EFE8DF 100%)' }}>
      <Navbar />
      
      <main style={{ flexGrow: 1, paddingTop: '96px', paddingBottom: '80px', fontFamily: t.fontBody }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Forum Header */}
          <div style={{ 
            marginBottom: '28px',
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
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: t.sageDeep,
              }}>
                Community
              </p>
              <h1 style={{ fontFamily: t.fontDisplay, fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, fontWeight: 500, color: t.ink, letterSpacing: '-0.02em' }}>
                Forum
              </h1>
              <p style={{ color: t.inkSoft, fontSize: '15px', margin: '8px 0 0', maxWidth: '480px', lineHeight: 1.55 }}>
                Ask questions, share routines, and learn with people who get it.
              </p>
            </div>
            <button 
              onClick={() => navigate('/community/new-post')}
              style={{
                background: t.sageDeep,
                color: '#FFF',
                border: 'none',
                borderRadius: '999px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 24px rgba(61, 90, 64, 0.22)',
              }}
            >
              <PlusCircle size={16} /> New post
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '28px', alignItems: 'start' }} className="db-responsive-grid">
              
              {/* Left Column: Topics */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '100px' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.72)', 
                  borderRadius: '18px', 
                  padding: '18px', 
                  border: `1px solid ${t.line}`,
                }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                    Topics
                  </h3>
                  
                  {loading ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: t.inkFaint }}><RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto' }} /></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button 
                        onClick={() => handleTopicSelect('')}
                        style={{
                          background: selectedTopic === '' ? t.sageTint : 'transparent',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: selectedTopic === '' ? 600 : 500,
                          color: selectedTopic === '' ? t.sageDeep : t.inkSoft,
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
                            background: selectedTopic === topic._id ? t.sageTint : 'transparent',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontSize: '13px',
                            fontWeight: selectedTopic === topic._id ? 600 : 500,
                            color: selectedTopic === topic._id ? t.sageDeep : t.inkSoft,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: topic.color || t.sage }} />
                            {topic.name}
                          </span>
                          <span style={{ fontSize: '11px', color: t.inkFaint }}>
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
                  background: 'rgba(255,255,255,0.8)', 
                  borderRadius: '16px', 
                  padding: '12px 14px', 
                  border: `1px solid ${t.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <form onSubmit={handleSearchSubmit} style={{ flexGrow: 1, position: 'relative', minWidth: '220px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
                    <input 
                      type="text" 
                      value={searchInputValue}
                      onChange={e => setSearchInputValue(e.target.value)}
                      placeholder="Search discussions..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px 10px 36px',
                        background: t.bg,
                        border: `1px solid ${t.line}`,
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: t.ink,
                        outline: 'none',
                        fontFamily: t.fontBody
                      }}
                    />
                  </form>
                  
                  {/* Sort Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={14} color={t.inkSoft} />
                    <span style={{ fontSize: '13px', color: t.inkSoft, fontWeight: '500' }}>Sort:</span>
                    <div style={{ display: 'flex', background: t.bg, padding: '4px', borderRadius: '10px', border: `1px solid ${t.line}` }}>
                      {[
                        ['latest', 'Latest'],
                        ['most_commented', 'Activity'],
                        ['best_answers', 'Verified Q&A']
                      ].map(([type, label]) => (
                        <button
                          key={type}
                          onClick={() => handleSortChange(type)}
                          style={{
                            background: sortBy === type ? t.surface : 'none',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: sortBy === type ? '600' : '500',
                            color: sortBy === type ? t.ink : t.inkSoft,
                            cursor: 'pointer',
                            boxShadow: sortBy === type ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
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
                            background: 'rgba(255,255,255,0.88)',
                            border: `1px solid ${t.line}`,
                            borderRadius: '16px',
                            padding: '20px 22px',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${t.sage}66`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 14px 30px rgba(55,45,35,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = t.line;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
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
                            fontWeight: '600', 
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
                            lineHeight: '1.5',
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
    </div>
  );
}
