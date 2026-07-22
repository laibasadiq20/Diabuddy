import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { ArrowLeft } from 'lucide-react';
import usePostDetails from './components/usePostDetails';
import PostThreadCard from './components/PostThreadCard';
import CommentsSection from './components/CommentsSection';
import ReportModal from './components/ReportModal';
import PostDetailsStyles from './components/PostDetailsStyles';

const t = theme;

export default function PostDetails() {
  const { id: postId } = useParams();
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();

  const d = usePostDetails({ postId, user, authHeaders });

  if (d.loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <p style={{ fontFamily: t.fontBody, color: t.inkSoft }}>Loading discussion details...</p>
      </div>
    );
  }

  if (d.error || !d.post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: t.fontDisplay, color: t.clayDeep }}>Error</h2>
          <p style={{ fontFamily: t.fontBody, color: t.inkSoft }}>{d.error || 'Post not found.'}</p>
          <button onClick={() => navigate('/community')} style={{ background: t.sageDeep, color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', marginTop: '16px' }}>
            Go Back
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
    onNavigateAuthor: (author) =>
      navigate(`/users/${author._id}`, { state: { preview: author } }),
    onToggleLike: d.handleToggleCommentLike,
    onSetBestAnswer: d.handleSetBestAnswer,
    onReport: d.triggerReport,
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
    onStartReply: (id) => {
      d.setReplyToCommentId(id);
      d.setReplyContent('');
    },
    onReplyContentChange: d.setReplyContent,
    onSubmitReply: d.handleCreateComment,
    onCancelReply: () => d.setReplyToCommentId(null),
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#E8E0D4' }}>
      <AppSidebar />

      <main className="db-post-main" style={{ flexGrow: 1, minWidth: 0, padding: '28px 24px 72px', fontFamily: t.fontBody }}>
        <div className="db-post-wrap" style={{ maxWidth: '720px', margin: '0 auto' }}>
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
            onNavigateAuthor={(author) =>
              navigate(`/users/${author._id}`, { state: { preview: author } })
            }
            onEditTitleChange={d.setEditTitle}
            onEditContentChange={d.setEditContent}
            onSaveEdit={d.saveEditPost}
            onCancelEdit={() => d.setEditingPost(false)}
            onVote={d.handleVote}
            onToggleLike={d.handleTogglePostLike}
            onStartEdit={d.startEditPost}
            onToggleModeration={d.toggleModeration}
            onReport={d.triggerReport}
            onDelete={d.handleDeletePost}
          />

          <CommentsSection
            post={d.post}
            user={user}
            commentsTree={d.commentsTree}
            newCommentContent={d.newCommentContent}
            onNewCommentChange={d.setNewCommentContent}
            onCreateComment={d.handleCreateComment}
            commentNodeProps={commentNodeProps}
          />
        </div>
      </main>

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
}
