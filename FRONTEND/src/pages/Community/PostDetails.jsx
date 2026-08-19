import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import Navbar from '../../components/Navbar';
import { ArrowLeft, Sparkles, Lock } from 'lucide-react';
import usePostDetails from './components/usePostDetails';
import PostThreadCard from './components/PostThreadCard';
import CommentsSection from './components/CommentsSection';
import ReportModal from './components/ReportModal';
import AuthPromptModal from './components/AuthPromptModal';
import PostDetailsStyles from './components/PostDetailsStyles';
import { useI18n } from '../../i18n/I18nContext';

const t = theme;

export default function PostDetails() {
  const { id: postId } = useParams();
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t: tr } = useI18n();
  const [authModal, setAuthModal] = useState({ open: false, action: '' });

  const d = usePostDetails({ postId, user, authHeaders });

  useEffect(() => {
    if (d.loading || !location.hash) return undefined;
    const id = location.hash.slice(1);
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => clearTimeout(timer);
  }, [d.loading, d.commentsTree, location.hash]);

  const requireAuth = (actionName) => {
    setAuthModal({ open: true, action: actionName });
  };

  if (d.loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <p style={{ fontFamily: t.fontBody, color: t.inkSoft }}>{tr('postDetails.loading')}</p>
      </div>
    );
  }

  if (d.error || !d.post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: t.fontDisplay, color: t.clayDeep }}>{tr('postDetails.error')}</h2>
          <p style={{ fontFamily: t.fontBody, color: t.inkSoft }}>{d.error || tr('postDetails.notFound')}</p>
          <button onClick={() => navigate('/community')} style={{ background: t.sageDeep, color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', marginTop: '16px' }}>
            {tr('postDetails.goBack')}
          </button>
        </div>
      </div>
    );
  }

  const isPostOwner = user && d.post.authorId?._id === user.id;
  const isPostAdmin = user && user.role === 'admin';

  const commentNodeProps = {
    user,
    post: d.post,
    editingCommentId: d.editingCommentId,
    editCommentContent: d.editCommentContent,
    savingEdit: d.savingEdit,
    replyToCommentId: d.replyToCommentId,
    replyContent: d.replyContent,
    onNavigateAuthor: (author) => {
      if (!user) {
        requireAuth('view author profiles');
        return;
      }
      navigate(`/users/${author._id}`, { state: { preview: author } });
    },
    onToggleLike: (commentId) => {
      if (!user) {
        requireAuth('like comments');
        return;
      }
      d.handleToggleCommentLike(commentId);
    },
    onSetBestAnswer: d.handleSetBestAnswer,
    onReport: (c) => {
      if (!user) {
        requireAuth('report comments');
        return;
      }
      d.triggerReport(c);
    },
    onStartEdit: (node) => {
      d.setEditingCommentId(node._id);
      d.setEditCommentContent(node.content || '');
    },
    onEditContentChange: d.setEditCommentContent,
    onSaveEdit: d.saveEditComment,
    onCancelEdit: () => {
      d.setEditingCommentId(null);
      d.setEditCommentContent('');
    },
    onDelete: d.handleDeleteComment,
    onToggleVisibility: d.toggleCommentVisibility,
    onStartReply: (id) => {
      if (!user) {
        requireAuth('reply to this comment');
        return;
      }
      d.setReplyToCommentId(id);
      d.setReplyContent('');
    },
    onReplyContentChange: d.setReplyContent,
    onSubmitReply: d.handleCreateComment,
    onCancelReply: () => d.setReplyToCommentId(null),
  };

  const handleCreateCommentWithAuth = (e) => {
    if (!user) {
      requireAuth('leave a comment');
      return;
    }
    d.handleCreateComment(e);
  };

  const handleTogglePostLikeWithAuth = () => {
    if (!user) {
      requireAuth('like this post');
      return;
    }
    d.handleTogglePostLike();
  };

  const handleVoteWithAuth = (pollId, optIdx) => {
    if (!user) {
      requireAuth('vote in polls');
      return;
    }
    d.handleVote(pollId, optIdx);
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: t.bg }}>
      {user ? (
        <div style={{ display: 'flex', flexGrow: 1, minHeight: '100dvh' }}>
          <AppSidebar />
          <main className="db-post-main" style={{ flexGrow: 1, minWidth: 0, padding: '28px 24px 72px', fontFamily: t.fontBody }}>
            {renderPostContent()}
          </main>
        </div>
      ) : (
        <div className="w-full flex flex-col flex-grow">
          <Navbar />
          
          <div className="bg-[#182C1E] text-white px-4 py-3 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-[#8DB496]" />
            <span>Viewing post in <strong>Public Preview</strong> mode.</span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="underline font-bold text-[#8DB496] hover:text-white ml-1 cursor-pointer"
            >
              Sign Up Free to Reply &amp; Like →
            </button>
          </div>

          <main className="db-post-main" style={{ flexGrow: 1, minWidth: 0, padding: '28px 16px 72px', fontFamily: t.fontBody }}>
            {renderPostContent()}
          </main>
        </div>
      )}

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, action: '' })}
        actionName={authModal.action}
      />

      <PostDetailsStyles />

      <ReportModal
        open={d.reportModalOpen}
        success={d.reportSuccess}
        reason={d.reportReason}
        description={d.reportDesc}
        onReasonChange={d.setReportReason}
        onDescriptionChange={d.setReportDesc}
        onCancel={() => d.setReportModalOpen(false)}
        onSubmit={d.submitReport}
      />
    </div>
  );

  function renderPostContent() {
    return (
      <div className="db-post-wrap" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate('/community')}
          className="db-post-back"
          style={{
            background: t.surface,
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
          <ArrowLeft size={15} /> {tr('postDetails.backToForum')}
        </button>

        <PostThreadCard
          post={d.post}
          pollData={d.pollData}
          postLiked={d.postLiked}
          editingPost={d.editingPost}
          editTitle={d.editTitle}
          editContent={d.editContent}
          savingEdit={d.savingEdit}
          isPostOwner={isPostOwner}
          isPostAdmin={isPostAdmin}
          onNavigateAuthor={(author) => {
            if (!user) {
              requireAuth('view author profiles');
              return;
            }
            navigate(`/users/${author._id}`, { state: { preview: author } });
          }}
          onEditTitleChange={d.setEditTitle}
          onEditContentChange={d.setEditContent}
          onSaveEdit={d.saveEditPost}
          onCancelEdit={() => d.setEditingPost(false)}
          onVote={handleVoteWithAuth}
          onToggleLike={handleTogglePostLikeWithAuth}
          onStartEdit={d.startEditPost}
          onToggleModeration={d.toggleModeration}
          onToggleVisibility={d.togglePostVisibility}
          onReport={d.triggerReport}
          onDelete={d.handleDeletePost}
        />

        <CommentsSection
          post={d.post}
          user={user}
          commentsTree={d.commentsTree}
          newCommentContent={d.newCommentContent}
          onNewCommentChange={d.setNewCommentContent}
          onCreateComment={handleCreateCommentWithAuth}
          commentNodeProps={commentNodeProps}
        />
      </div>
    );
  }
}
