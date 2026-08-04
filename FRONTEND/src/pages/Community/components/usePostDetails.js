import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config/api';
import { useI18n } from '../../../i18n/I18nContext';

export default function usePostDetails({ postId, user, authHeaders }) {
  const navigate = useNavigate();
  const { t: tr } = useI18n();

  const [post, setPost] = useState(null);
  const [pollData, setPollData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsTree, setCommentsTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postLiked, setPostLiked] = useState(false);
  const [error, setError] = useState('');

  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('offensive');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...authHeaders() });

  const buildTree = (flatComments) => {
    const map = {};
    const roots = [];

    flatComments.forEach((c) => {
      map[c._id] = { ...c, replies: [] };
    });

    flatComments.forEach((c) => {
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

  const fetchAll = async () => {
    try {
      const postRes = await fetch(`${API_URL}/posts/${postId}`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (!postRes.ok) {
        throw new Error(tr('postDetails.errors.postNotFound'));
      }
      const postData = await postRes.json();
      setPost(postData);

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

      const commentsRes = await fetch(`${API_URL}/posts/${postId}/comments`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
        buildTree(commentsData);
      }

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
      setError(err.message || tr('postDetails.errors.loadThreadFailed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [postId, user]);

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
        setPost((prev) => ({ ...prev, likesCount: data.likesCount }));
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

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
        alert(data.message || tr('postDetails.errors.voteFailed'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComment = async (e, parentId = null) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }

    const contentToSend = parentId ? replyContent : newCommentContent;
    if (!contentToSend.trim()) {
      alert('Please enter a comment.');
      return;
    }

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

        setPost((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
      } else {
        alert(newComment.message || tr('postDetails.errors.commentFailed'));
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        const updated = comments.map((c) => {
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
        setPost((prev) => ({ ...prev, bestAnswerCommentId: commentId }));
        fetchAll();
      } else {
        alert(data.message || tr('postDetails.errors.bestAnswerFailed'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm(tr('postDetails.errors.confirmDeleteComment'))) return;
    try {
      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const updated = comments.filter((c) => c._id !== commentId);
        setComments(updated);
        buildTree(updated);
        setPost((prev) => ({ ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm(tr('postDetails.errors.confirmDeletePost'))) return;
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
        alert(data.message || tr('postDetails.errors.saveEditFailed'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const saveEditComment = async (commentId) => {
    if (!editCommentContent.trim()) {
      alert('Please enter comment text.');
      return;
    }
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
        alert(data.message || tr('postDetails.errors.saveCommentFailed'));
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
        alert(data.message || tr('postDetails.errors.moderationFailed'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePostVisibility = async () => {
    if (!post) return;
    const next = post.status === 'hidden' ? 'active' : 'hidden';
    const label = next === 'hidden' ? tr('postDetails.errors.confirmHidePost') : tr('postDetails.errors.confirmRestorePost');
    if (!window.confirm(label)) return;
    try {
      const res = await fetch(`${API_URL}/admin/posts/${postId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (res.ok) {
        setPost((prev) => ({ ...prev, status: data.data?.status || next }));
      } else {
        alert(data.message || tr('postDetails.errors.visibilityUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCommentVisibility = async (commentId, currentStatus) => {
    const next = currentStatus === 'hidden' ? 'active' : 'hidden';
    const label = next === 'hidden' ? tr('postDetails.errors.confirmHideComment') : tr('postDetails.errors.confirmRestoreComment');
    if (!window.confirm(label)) return;
    try {
      const res = await fetch(`${API_URL}/admin/comments/${commentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: jsonHeaders(),
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = comments.map((c) =>
          c._id === commentId ? { ...c, status: data.data?.status || next } : c
        );
        setComments(updated);
        buildTree(updated);
      } else {
        alert(data.message || tr('postDetails.errors.commentVisibilityUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        alert(data.message || tr('postDetails.errors.reportFailed'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    post,
    pollData,
    commentsTree,
    loading,
    postLiked,
    error,
    newCommentContent,
    setNewCommentContent,
    replyToCommentId,
    setReplyToCommentId,
    replyContent,
    setReplyContent,
    editingPost,
    setEditingPost,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editingCommentId,
    setEditingCommentId,
    editCommentContent,
    setEditCommentContent,
    savingEdit,
    reportModalOpen,
    setReportModalOpen,
    reportReason,
    setReportReason,
    reportDesc,
    setReportDesc,
    reportSuccess,
    handleTogglePostLike,
    handleVote,
    handleCreateComment,
    handleToggleCommentLike,
    handleSetBestAnswer,
    handleDeleteComment,
    handleDeletePost,
    startEditPost,
    saveEditPost,
    saveEditComment,
    toggleModeration,
    togglePostVisibility,
    toggleCommentVisibility,
    triggerReport,
    submitReport,
  };
}
