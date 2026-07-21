import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { API_URL } from '../../config/api';
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  ArrowLeft, 
  Check, 
  Trash2, 
  Flag, 
  Award,
  CornerDownRight,
  Send,
  Lock,
  Pin,
  Clock,
  Sparkles,
  Pencil,
  Unlock,
} from 'lucide-react';

const t = theme;

const REPORT_REASONS = [
  { value: 'offensive', label: 'Inappropriate / offensive content' },
  { value: 'spam', label: 'Spam or advertisement' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'misinformation', label: 'Medical misinformation' },
  { value: 'other', label: 'Other' },
];

export default function PostDetails() {
  const { id: postId } = useParams();
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();

  // State
  const [post, setPost] = useState(null);
  const [pollData, setPollData] = useState(null); // { poll, myOptionIndex }
  const [comments, setComments] = useState([]);
  const [commentsTree, setCommentsTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postLiked, setPostLiked] = useState(false);
  const [error, setError] = useState('');

  // Comment inputs
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Edit state
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // { type: 'ForumPost'|'Comment', id: string }
  const [reportReason, setReportReason] = useState('offensive');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...authHeaders() });

  // Fetch full details
  const fetchAll = async () => {
    try {
      // 1. Fetch Post details
      const postRes = await fetch(`${API_URL}/posts/${postId}`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (!postRes.ok) {
        throw new Error('Post not found or deleted');
      }
      const postData = await postRes.json();
      setPost(postData);

      // 2. If poll, fetch poll details
      if (postData.type === 'poll') {
        const pollRes = await fetch(`${API_URL}/posts/${postId}/poll`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        if (pollRes.ok) {
          const pData = await pollRes.json();
          setPollData(pData);
        }
      }

      // 3. Fetch comments
      const commentsRes = await fetch(`${API_URL}/posts/${postId}/comments`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
        buildTree(commentsData);
      }

      // 4. Fetch my reaction
      if (user) {
        const reactRes = await fetch(`${API_URL}/reactions/mine?targetType=ForumPost&targetId=${postId}`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        if (reactRes.ok) {
          const reactData = await reactRes.json();
          setPostLiked(reactData.liked);
        }
      }

    } catch (err) {
      setError(err.message || 'Error loading thread details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [postId, user]);

  // Tree build utility for recursive replies
  const buildTree = (flatComments) => {
    const map = {};
    const roots = [];
    
    flatComments.forEach(c => {
      map[c._id] = { ...c, replies: [] };
    });
    
    flatComments.forEach(c => {
      const mapped = map[c._id];
      if (c.parentCommentId) {
        const parent = map[c.parentCommentId];
        if (parent) {
          parent.replies.push(mapped);
        } else {
          roots.push(mapped);
        }
      } else {
        roots.push(mapped);
      }
    });

    setCommentsTree(roots);
  };

  // Toggle Post Like
  const handleTogglePostLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reactions`, {
        method: 'POST',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ targetType: 'ForumPost', targetId: postId })
      });
      const data = await res.json();
      if (res.ok) {
        setPostLiked(data.action === 'liked');
        setPost(prev => ({ ...prev, likesCount: data.likesCount }));
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  // Vote in Poll
  const handleVote = async (optionIndex) => {
    if (!user) { navigate('/login'); return; }
    if (!pollData || !pollData.poll) return;

    try {
      const res = await fetch(`${API_URL}/polls/${pollData.poll._id}/vote`, {
        method: 'POST',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ optionIndex })
      });
      const data = await res.json();
      if (res.ok) {
        setPollData({
          poll: data.poll,
          myOptionIndex: data.myOptionIndex
        });
      } else {
        alert(data.message || 'Failed to submit vote.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Comment
  const handleCreateComment = async (e, parentId = null) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }

    const contentToSend = parentId ? replyContent : newCommentContent;
    if (!contentToSend.trim()) return;

    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({
          content: contentToSend.trim(),
          parentCommentId: parentId
        })
      });
      const newComment = await res.json();

      if (res.ok) {
        const updated = [...comments, newComment];
        setComments(updated);
        buildTree(updated);
        
        if (parentId) {
          setReplyContent('');
          setReplyToCommentId(null);
        } else {
          setNewCommentContent('');
        }

        setPost(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
      } else {
        alert(newComment.message || 'Failed to post comment.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Comment Like
  const handleToggleCommentLike = async (commentId) => {
    if (!user) { navigate('/login'); return; }

    try {
      const res = await fetch(`${API_URL}/reactions`, {
        method: 'POST',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ targetType: 'Comment', targetId: commentId })
      });
      const data = await res.json();
      if (res.ok) {
        // Update local comment array
        const updated = comments.map(c => {
          if (c._id === commentId) {
            return { ...c, likesCount: data.likesCount };
          }
          return c;
        });
        setComments(updated);
        buildTree(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Set Best Answer
  const handleSetBestAnswer = async (commentId) => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/best-answer`, {
        method: 'POST',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ commentId })
      });
      const data = await res.json();
      if (res.ok) {
        setPost(prev => ({ ...prev, bestAnswerCommentId: commentId }));
        // Reload all to sync visual badges
        fetchAll();
      } else {
        alert(data.message || 'Error setting best answer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const updated = comments.filter(c => c._id !== commentId);
        setComments(updated);
        buildTree(updated);
        setPost(prev => ({ ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this thread?')) return;
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        navigate('/community');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditPost = () => {
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditingPost(true);
  };

  const saveEditPost = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPost((prev) => ({ ...prev, title: data.title, content: data.content }));
        setEditingPost(false);
      } else {
        alert(data.message || 'Failed to save edits');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const saveEditComment = async (commentId) => {
    if (!editCommentContent.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ content: editCommentContent.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = comments.map((c) =>
          c._id === commentId ? { ...c, content: data.content, isEdited: true } : c
        );
        setComments(updated);
        buildTree(updated);
        setEditingCommentId(null);
        setEditCommentContent('');
      } else {
        alert(data.message || 'Failed to save comment');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleModeration = async (field) => {
    if (!post) return;
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/moderation`, {
        method: 'PATCH',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ [field]: !post[field] }),
      });
      const data = await res.json();
      if (res.ok) {
        setPost((prev) => ({ ...prev, isPinned: data.isPinned, isLocked: data.isLocked }));
      } else {
        alert(data.message || 'Moderation update failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // File Report Modal Handler
  const triggerReport = (type, id) => {
    if (!user) { navigate('/login'); return; }
    setReportTarget({ type, id });
    setReportReason('offensive');
    setReportDesc('');
    setReportSuccess(false);
    setReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!reportTarget) return;

    try {
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({
          targetType: reportTarget.type,
          targetId: reportTarget.id,
          reason: reportReason,
          description: reportDesc
        })
      });
      
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportModalOpen(false);
        }, 1500);
      } else {
        const data = await res.json();
        alert(data.message || 'Report filing failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recursive Comment Component
  const CommentNode = ({ node, depth = 0 }) => {
    const isCommentAuthor = user && node.authorId?._id === user.id;
    const isPostAuthor = user && post && post.authorId?._id === user.id;
    const isAdmin = user && user.role === 'admin';
    const isBest = post && post.bestAnswerCommentId === node._id;

    return (
      <div
        className={`db-comment-node db-comment-depth-${Math.min(depth, 3)}`}
        style={{ 
        marginLeft: `${depth * 24}px`, 
        marginTop: '16px',
        borderLeft: depth > 0 ? `2px solid ${t.line}` : 'none',
        paddingLeft: depth > 0 ? '16px' : 0
      }}>
        <div style={{
          background: isBest ? t.goldTint : t.surface,
          border: `1.5px solid ${isBest ? t.gold : t.line}`,
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: t.shadowCard,
          position: 'relative'
        }}>
          {isBest && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: t.gold,
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              <Award size={14} /> Best Answer
            </div>
          )}

          {/* User details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <button
              type="button"
              onClick={() => {
                if (node.authorId?._id) {
                  navigate(`/users/${node.authorId._id}`, { state: { preview: node.authorId } });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: node.authorId?._id ? 'pointer' : 'default',
                fontFamily: t.fontBody,
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: t.sageSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '700',
                color: t.sageDeep,
                overflow: 'hidden'
              }}>
                {node.authorId?.profileImageUrl ? (
                  <img src={node.authorId.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : node.authorId?.name?.charAt(0).toUpperCase()}
              </div>
              
              <span style={{ fontSize: '13px', fontWeight: '600', color: t.ink }}>
                {node.authorId?.name || 'Deleted Account'}
                {node.authorId?.isVerifiedProfessional && (
                  <span style={{ marginLeft: '4px', fontSize: '9px', background: t.skyDeep, color: '#FFF', padding: '1px 4px', borderRadius: '3px', fontWeight: '700' }}>
                    PRO
                  </span>
                )}
              </span>
            </button>

            <span style={{ fontSize: '11px', color: t.inkFaint }}>
              {new Date(node.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Comment content */}
          {editingCommentId === node._id ? (
            <div style={{ marginBottom: 14 }}>
              <textarea
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: 10,
                  borderRadius: 10,
                  border: `1.5px solid ${t.line}`,
                  fontFamily: t.fontBody,
                  fontSize: 14,
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => saveEditComment(node._id)}
                  disabled={savingEdit}
                  style={{
                    background: t.forest,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditCommentContent('');
                  }}
                  style={{
                    background: 'none',
                    border: `1px solid ${t.line}`,
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: t.ink, margin: '0 0 14px 0', lineHeight: '1.5' }}>
              {node.content}
              {node.isEdited && (
                <span style={{ marginLeft: 6, fontSize: 11, color: t.inkFaint }}>(edited)</span>
              )}
            </p>
          )}

          {/* Comment Actions */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleToggleCommentLike(node._id)}
              style={{
                background: 'none',
                border: 'none',
                color: t.inkSoft,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              <Heart size={13} color={t.inkFaint} /> {node.likesCount || 0} Like
            </button>

            {depth < 3 && !post?.isLocked && (
              <button
                onClick={() => {
                  setReplyToCommentId(node._id);
                  setReplyContent('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: t.sageDeep,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <CornerDownRight size={13} /> Reply
              </button>
            )}

            {isPostAuthor && !isBest && (
              <button
                onClick={() => handleSetBestAnswer(node._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: t.gold,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <Check size={13} /> Set Best Answer
              </button>
            )}

            <button
              onClick={() => triggerReport('Comment', node._id)}
              style={{
                background: 'none',
                border: 'none',
                color: t.clay,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              <Flag size={12} /> Report
            </button>

            {isCommentAuthor && (
              <button
                onClick={() => {
                  setEditingCommentId(node._id);
                  setEditCommentContent(node.content || '');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: t.inkSoft,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <Pencil size={12} /> Edit
              </button>
            )}

            {(isCommentAuthor || isAdmin) && (
              <button
                onClick={() => handleDeleteComment(node._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: t.clayDeep,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  marginLeft: 'auto'
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
          
          {/* Inline Reply Form */}
          {replyToCommentId === node._id && (
            <form 
              onSubmit={(e) => handleCreateComment(e, node._id)}
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: `1px solid ${t.line}`
              }}
            >
              <input 
                type="text" 
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder={`Replying to ${node.authorId?.name}...`}
                required
                style={{
                  flexGrow: 1,
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1.5px solid ${t.line}`,
                  fontSize: '13px',
                  background: t.bg,
                  color: t.ink,
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                style={{
                  background: t.sageDeep,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Send size={12} /> Send
              </button>
              <button 
                type="button" 
                onClick={() => setReplyToCommentId(null)}
                style={{
                  background: 'none',
                  border: `1px solid ${t.line}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: t.inkSoft,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </form>
          )}

        </div>

        {/* Recursive rendering of replies */}
        {node.replies && node.replies.map(reply => (
          <CommentNode key={reply._id} node={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <p style={{ fontFamily: t.fontBody, color: t.inkSoft }}>Loading discussion details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: t.fontDisplay, color: t.clayDeep }}>Error</h2>
          <p style={{ fontFamily: t.fontBody, color: t.inkSoft }}>{error || 'Post not found.'}</p>
          <button onClick={() => navigate('/community')} style={{ background: t.sageDeep, color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', marginTop: '16px' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPostOwner = user && post.authorId?._id === user.id;
  const isPostAdmin = user && user.role === 'admin';
  const hasBestAnswerPointer = !!post.bestAnswerCommentId;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#E8E0D4' }}>
      <AppSidebar />
      
      <main className="db-post-main" style={{ flexGrow: 1, minWidth: 0, padding: '28px 24px 72px', fontFamily: t.fontBody }}>
        <div className="db-post-wrap" style={{ maxWidth: '720px', margin: '0 auto' }}>
          
          {/* Back btn */}
          <button 
            type="button"
            onClick={() => navigate('/community')}
            className="db-post-back"
            style={{
              background: '#FFF',
              border: `1.5px solid ${t.lineStrong}`,
              color: t.inkSoft,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
              padding: '8px 12px',
              borderRadius: 999,
              fontFamily: t.fontBody,
            }}
          >
            <ArrowLeft size={15} /> Back to forum
          </button>

          {/* Main Thread Card */}
          <article className="db-post-thread" style={{
            background: t.surface,
            border: `1.5px solid ${t.lineStrong}`,
            borderRadius: '20px',
            padding: '28px',
            boxShadow: t.shadowCard,
            marginBottom: '20px'
          }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  if (!post.isAnonymous && post.authorId?._id) {
                    navigate(`/users/${post.authorId._id}`, { state: { preview: post.authorId } });
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: !post.isAnonymous && post.authorId?._id ? 'pointer' : 'default',
                  textAlign: 'left',
                  fontFamily: t.fontBody,
                }}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: t.sageSoft, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: t.sageDeep,
                  overflow: 'hidden'
                }}>
                  {post.isAnonymous ? 'A' : (
                    post.authorId?.profileImageUrl ? (
                      <img src={post.authorId.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : post.authorId?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.ink, margin: 0 }}>
                    {post.isAnonymous ? 'Anonymous Buddy' : post.authorId?.name}
                    {!post.isAnonymous && post.authorId?.isVerifiedProfessional && (
                      <span style={{ marginLeft: '6px', fontSize: '9px', background: t.skyDeep, color: '#FFF', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', verticalAlign: 'middle' }}>
                        PRO
                      </span>
                    )}
                  </h3>
                  <p style={{ fontSize: '12px', color: t.inkFaint, margin: 0 }}>
                    {!post.isAnonymous && post.authorId?.diabetesType ? `${post.authorId.diabetesType} · ` : ''}
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: post.topicId?.color || t.sage, background: (post.topicId?.color || t.sage) + '15', padding: '4px 10px', borderRadius: '8px' }}>
                  {post.topicId?.name}
                </span>
              </div>
            </div>

            {/* Title */}
            {editingPost ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  fontFamily: t.fontDisplay,
                  fontSize: 'clamp(22px, 4vw, 28px)',
                  color: t.ink,
                  fontWeight: 500,
                  margin: '0 0 14px 0',
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: `1.5px solid ${t.lineStrong}`,
                }}
              />
            ) : (
              <h1 className="db-post-heading" style={{ 
                fontFamily: t.fontDisplay, 
                fontSize: 'clamp(22px, 4vw, 28px)', 
                color: t.ink, 
                fontWeight: '500',
                margin: '0 0 14px 0',
                lineHeight: '1.25'
              }}>
                {post.title}
              </h1>
            )}

            {/* Badges indicators */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {post.isPinned && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: t.sageDeep, background: t.sageTint, padding: '2px 8px', borderRadius: '4px' }}>
                  <Pin size={10} /> Pinned
                </span>
              )}
              {post.isLocked && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: t.clayDeep, background: t.clayTint, padding: '2px 8px', borderRadius: '4px' }}>
                  <Lock size={10} /> Locked
                </span>
              )}
              {hasBestAnswerPointer && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: t.gold, background: t.goldTint, padding: '2px 8px', borderRadius: '4px' }}>
                  <Award size={10} /> Solved
                </span>
              )}
            </div>

            {/* Body */}
            {editingPost ? (
              <div style={{ marginBottom: 24 }}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: 12,
                    borderRadius: 12,
                    border: `1.5px solid ${t.lineStrong}`,
                    fontSize: 15,
                    lineHeight: 1.6,
                    fontFamily: t.fontBody,
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={saveEditPost}
                    disabled={savingEdit}
                    style={{
                      background: t.forest,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '8px 14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {savingEdit ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPost(false)}
                    style={{
                      background: 'none',
                      border: `1px solid ${t.line}`,
                      borderRadius: 10,
                      padding: '8px 14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ 
                fontSize: '16px', 
                color: t.ink, 
                lineHeight: '1.7', 
                whiteSpace: 'pre-wrap',
                margin: '0 0 24px 0' 
              }}>
                {post.content}
              </p>
            )}

            {/* Attached Images */}
            {post.images && post.images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: post.images.length > 1 ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '24px' }}>
                {post.images.map((url, index) => (
                  <div key={index} style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${t.line}`, background: t.bg }}>
                    <img src={url} alt="" style={{ width: '100%', height: 'auto', maxHeight: '400px', display: 'block', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {post.tags.map((tag, i) => (
                  <span key={i} style={{ fontSize: '12px', color: t.inkSoft, background: t.surfaceSunken, padding: '4px 10px', borderRadius: '8px', fontWeight: '500' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* POLL DISPLAY */}
            {post.type === 'poll' && pollData && pollData.poll && (
              <div style={{ 
                background: t.bg, 
                borderRadius: '16px', 
                padding: '24px', 
                border: `1.5px solid ${t.line}`, 
                marginBottom: '28px' 
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: t.ink, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color={t.gold} /> {pollData.poll.question}
                </h3>
                
                {/* Poll Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pollData.poll.options.map((opt, idx) => {
                    const totalVotes = pollData.poll.totalVotes || 0;
                    const percent = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                    const hasVoted = pollData.myOptionIndex !== null;
                    const isMyVote = pollData.myOptionIndex === idx;
                    const isClosed = pollData.poll.expiresAt && new Date(pollData.poll.expiresAt) < new Date();

                    return (
                      <button
                        key={idx}
                        disabled={hasVoted || isClosed}
                        onClick={() => handleVote(idx)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: isMyVote ? t.sageSoft : t.surface,
                          border: `1.5px solid ${isMyVote ? t.sageDeep : t.line}`,
                          borderRadius: '10px',
                          padding: '12px 16px',
                          position: 'relative',
                          cursor: (hasVoted || isClosed) ? 'default' : 'pointer',
                          overflow: 'hidden',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Vote Percent background bar */}
                        {hasVoted && (
                          <div style={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            bottom: 0, 
                            width: `${percent}%`, 
                            background: isMyVote ? 'rgba(124, 148, 112, 0.25)' : 'rgba(43, 42, 40, 0.05)', 
                            zIndex: 1,
                            transition: 'width 0.5s'
                          }} />
                        )}

                        <span style={{ position: 'relative', zIndex: 2, fontSize: '14px', fontWeight: isMyVote ? '600' : '500', color: t.ink }}>
                          {opt.text} {isMyVote && ' ✓'}
                        </span>
                        
                        {hasVoted && (
                          <span style={{ position: 'relative', zIndex: 2, fontSize: '13px', fontWeight: '700', color: t.inkSoft }}>
                            {percent}% ({opt.votesCount})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '11px', color: t.inkFaint }}>
                  <span>Total Votes: {pollData.poll.totalVotes || 0}</span>
                  {pollData.poll.expiresAt && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> 
                      {new Date(pollData.poll.expiresAt) < new Date() ? 'Poll Closed' : `Closes: ${new Date(pollData.poll.expiresAt).toLocaleDateString()}`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="db-post-actions" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderTop: `1px solid ${t.line}`,
              paddingTop: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              
              <div className="db-post-stats-row" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleTogglePostLike}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: postLiked ? t.clayDeep : t.inkSoft,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0,
                    fontFamily: t.fontBody,
                  }}
                >
                  <Heart size={15} fill={postLiked ? t.clayDeep : 'none'} color={postLiked ? t.clayDeep : t.inkFaint} /> 
                  {post.likesCount || 0}
                </button>

                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: t.inkSoft }}>
                  <MessageSquare size={15} color={t.inkFaint} /> {post.commentsCount || 0}
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: t.inkSoft }}>
                  <Eye size={15} color={t.inkFaint} /> {post.viewsCount || 0}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {isPostOwner && (
                  <button
                    type="button"
                    onClick={startEditPost}
                    style={{
                      background: t.surfaceSunken,
                      border: `1px solid ${t.line}`,
                      borderRadius: 999,
                      color: t.inkSoft,
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      fontFamily: t.fontBody,
                    }}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                )}

                {isPostAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleModeration('isPinned')}
                      style={{
                        background: post.isPinned ? t.sageTint : t.surfaceSunken,
                        border: `1px solid ${t.line}`,
                        borderRadius: 999,
                        color: t.sageDeep,
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        fontFamily: t.fontBody,
                      }}
                    >
                      <Pin size={12} /> {post.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleModeration('isLocked')}
                      style={{
                        background: post.isLocked ? t.clayTint : t.surfaceSunken,
                        border: `1px solid ${t.line}`,
                        borderRadius: 999,
                        color: t.clayDeep,
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        fontFamily: t.fontBody,
                      }}
                    >
                      {post.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                      {post.isLocked ? 'Unlock' : 'Lock'}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => triggerReport('ForumPost', post._id)}
                  style={{
                    background: t.surfaceSunken,
                    border: `1px solid ${t.line}`,
                    borderRadius: 999,
                    color: t.clay,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    fontFamily: t.fontBody,
                  }}
                >
                  <Flag size={12} /> Report
                </button>

                {(isPostOwner || isPostAdmin) && (
                  <button
                    type="button"
                    onClick={handleDeletePost}
                    style={{
                      background: t.clayTint,
                      border: `1px solid ${t.clay}40`,
                      borderRadius: 999,
                      color: t.clayDeep,
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      fontFamily: t.fontBody,
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>

            </div>

          </article>

          {/* Comments section */}
          <section className="db-post-comments" style={{
            background: '#FFF',
            border: `1.5px solid ${t.lineStrong}`,
            borderRadius: 20,
            padding: '22px',
            boxShadow: t.shadowCard,
            marginBottom: 8,
          }}>
            <h2 style={{ fontFamily: t.fontDisplay, fontSize: 'clamp(20px, 4vw, 24px)', color: t.ink, margin: '0 0 16px 0', fontWeight: 500 }}>
              Discussion ({post.commentsCount || 0})
            </h2>

            {/* Comment composer */}
            {!post.isLocked ? (
              <form onSubmit={(e) => handleCreateComment(e, null)} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <textarea
                    value={newCommentContent}
                    onChange={e => setNewCommentContent(e.target.value)}
                    placeholder={user ? "Add a helpful answer or question..." : "Sign in to participate in discussion"}
                    disabled={!user}
                    rows={3}
                    style={{
                      flexGrow: 1,
                      boxSizing: 'border-box',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `1.5px solid ${t.line}`,
                      background: t.surface,
                      color: t.ink,
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: t.fontBody,
                      resize: 'vertical',
                      lineHeight: '1.5'
                    }}
                  />
                </div>
                {user && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        background: t.sageDeep,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Send size={14} /> Send Comment
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <div style={{ background: t.claySoft, borderRadius: '12px', padding: '12px 16px', color: t.clayDeep, fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <Lock size={16} /> This thread is locked and cannot receive further comments.
              </div>
            )}

            {/* Comments List tree */}
            {commentsTree.length === 0 ? (
              <p style={{ textAlign: 'center', color: t.inkFaint, padding: '24px 0', fontSize: '14px' }}>
                No comments yet. Start the conversation!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {commentsTree.map(rootNode => (
                  <CommentNode key={rootNode._id} node={rootNode} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .db-post-thread { padding: 16px !important; border-radius: 16px !important; }
          .db-post-comments { padding: 14px !important; border-radius: 16px !important; }
          .db-post-actions { flex-direction: column; align-items: stretch !important; gap: 14px !important; }
          .db-post-actions > div { width: 100%; }
          .db-post-actions > div:last-child {
            display: flex;
            flex-wrap: wrap;
            gap: 8px !important;
          }
          .db-post-stats-row { gap: 16px !important; }
          .db-post-thread [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          .db-comment-depth-1 { margin-left: 10px !important; padding-left: 10px !important; }
          .db-comment-depth-2 { margin-left: 16px !important; padding-left: 10px !important; }
          .db-comment-depth-3 { margin-left: 20px !important; padding-left: 10px !important; }
          .db-comment-node [style*="display: flex"][style*="gap: 12px"] {
            flex-wrap: wrap;
          }
        }
      `}</style>

      {/* Report Modal popup */}
      {reportModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          fontFamily: t.fontBody,
          padding: 16,
        }}>
          <div style={{
            background: '#FFF',
            border: `1.5px solid ${t.lineStrong}`,
            borderRadius: '18px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: t.shadowLifted
          }}>
            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                <h3 style={{ fontFamily: t.fontDisplay, margin: '0 0 8px 0' }}>Report Submitted</h3>
                <p style={{ color: t.inkSoft, fontSize: '14px', margin: 0 }}>Thank you, moderators will review this content.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: t.fontDisplay, fontSize: '22px', margin: '0 0 16px 0', color: t.ink }}>
                  Report Content
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: `1.5px solid ${t.line}`,
                      background: t.bg,
                      fontSize: '13px'
                    }}
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Additional Details
                  </label>
                  <textarea
                    value={reportDesc}
                    onChange={e => setReportDesc(e.target.value)}
                    placeholder="Describe why you believe this content is inappropriate..."
                    rows={4}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${t.line}`,
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    style={{
                      background: 'none',
                      border: `1px solid ${t.line}`,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={submitReport}
                    style={{
                      background: t.clayDeep,
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
