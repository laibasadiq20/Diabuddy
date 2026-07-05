import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <Navbar />
      
      <main style={{ flexGrow: 1, paddingTop: '100px', paddingBottom: '60px', fontFamily: t.fontBody }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Forum Header Banner */}
          <div style={{ 
            background: 'linear-gradient(135deg, #27392E 0%, #162119 100%)',
            borderRadius: '24px',
            padding: '36px 32px',
            color: '#FFFFFF',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: t.shadowLifted
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'rgba(255,255,255,0.1)', 
                padding: '6px 12px', 
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: t.sageSoft,
                marginBottom: '16px'
              }}>
                <FolderOpen size={13} /> DiaBuddy Support Network
              </div>
              <h1 style={{ fontFamily: t.fontDisplay, fontSize: '38px', margin: 0, fontWeight: '500' }}>
                DiaBuddy Community Forum
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', marginTop: '8px', margin: '8px 0 0 0', maxWidth: '600px', lineHeight: '1.5' }}>
                A respectful, secure space to exchange medical questions, lifestyle logs, recipes, and personal tips for diabetes management.
              </p>
            </div>
            
            {/* Background design elements */}
            <div style={{ 
              position: 'absolute', 
              right: '-10%', 
              bottom: '-20%', 
              width: '300px', 
              height: '300px', 
              background: 'radial-gradient(circle, rgba(124, 148, 112, 0.2) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', gridTemplateRows: 'auto' }}>
            
            {/* Columns Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }} className="db-responsive-grid">
              
              {/* Left Column: Topics Sidebar */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <button 
                  onClick={() => navigate('/community/new-post')}
                  style={{
                    background: t.sageDeep,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '14px 20px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: t.shadowCard,
                    transition: 'transform 0.2s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <PlusCircle size={16} /> Compose New Post
                </button>

                <div style={{ 
                  background: t.surface, 
                  borderRadius: '20px', 
                  padding: '24px', 
                  border: `1.5px solid ${t.line}`,
                  boxShadow: t.shadowCard
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: t.ink, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px 0', borderBottom: `1px solid ${t.line}`, paddingBottom: '10px' }}>
                    Discussion Topics
                  </h3>
                  
                  {loading ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: t.inkFaint }}><RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto' }} /></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button 
                        onClick={() => handleTopicSelect('')}
                        style={{
                          background: selectedTopic === '' ? t.surfaceSunken : 'none',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: selectedTopic === '' ? '600' : '500',
                          color: selectedTopic === '' ? t.ink : t.inkSoft,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>🌐 All categories</span>
                        <span style={{ fontSize: '11px', background: t.lineStrong, padding: '2px 6px', borderRadius: '10px', color: t.inkSoft }}>
                          {posts.length ? `${posts.length}+` : '0'}
                        </span>
                      </button>
                      
                      {topics.map(topic => (
                        <button 
                          key={topic._id}
                          onClick={() => handleTopicSelect(topic._id)}
                          style={{
                            background: selectedTopic === topic._id ? t.surfaceSunken : 'none',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontSize: '14px',
                            fontWeight: selectedTopic === topic._id ? '600' : '500',
                            color: selectedTopic === topic._id ? t.ink : t.inkSoft,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: topic.color || t.sage }} />
                            {topic.name}
                          </span>
                          <span style={{ fontSize: '11px', background: t.lineStrong, padding: '2px 6px', borderRadius: '10px', color: t.inkSoft }}>
                            {topic.postsCount || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
              
              {/* Right Column: Search, Filter, Posts List */}
              <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Search & Sort Panel */}
                <div style={{ 
                  background: t.surface, 
                  borderRadius: '20px', 
                  padding: '18px 24px', 
                  border: `1.5px solid ${t.line}`,
                  boxShadow: t.shadowCard,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  {/* Search Form */}
                  <form onSubmit={handleSearchSubmit} style={{ flexGrow: 1, position: 'relative', minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
                    <input 
                      type="text" 
                      value={searchInputValue}
                      onChange={e => setSearchInputValue(e.target.value)}
                      placeholder="Search discussions, tags, titles..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 16px 10px 40px',
                        background: t.bg,
                        border: `1.5px solid ${t.line}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: t.ink,
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontFamily: t.fontBody
                      }}
                      onFocus={e => e.target.style.borderColor = t.sageDeep}
                      onBlur={e => e.target.style.borderColor = t.line}
                    />
                  </form>
                  
                  {/* Sort Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={14} color={t.inkSoft} />
                    <span style={{ fontSize: '13px', color: t.inkSoft, fontWeight: '500' }}>Sort:</span>
                    <div style={{ display: 'flex', background: t.bg, padding: '4px', borderRadius: '10px', border: `1.5px solid ${t.line}` }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {posts.map(post => {
                      const postTopicColor = post.topicId?.color || t.sage;
                      const hasBestAnswer = !!post.bestAnswerCommentId;

                      return (
                        <article 
                          key={post._id}
                          onClick={() => navigate(`/community/posts/${post._id}`)}
                          style={{
                            background: t.surface,
                            border: `1.5px solid ${t.line}`,
                            borderRadius: '20px',
                            padding: '24px',
                            boxShadow: t.shadowCard,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = t.sage;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = t.line;
                            e.currentTarget.style.transform = 'translateY(0)';
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

      <Footer />
    </div>
  );
}
