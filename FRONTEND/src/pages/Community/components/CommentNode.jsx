import React from 'react';
import {
  Heart,
  Check,
  Trash2,
  Flag,
  Award,
  CornerDownRight,
  Send,
  Pencil,
} from 'lucide-react';
import { theme } from '../../../theme';

const t = theme;

export default function CommentNode({
  node,
  depth = 0,
  user,
  post,
  editingCommentId,
  editCommentContent,
  savingEdit,
  replyToCommentId,
  replyContent,
  onNavigateAuthor,
  onToggleLike,
  onSetBestAnswer,
  onReport,
  onStartEdit,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onStartReply,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
}) {
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
      }}
    >
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <button
            type="button"
            onClick={() => {
              if (node.authorId?._id) {
                onNavigateAuthor(node.authorId);
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

        {editingCommentId === node._id ? (
          <div style={{ marginBottom: 14 }}>
            <textarea
              value={editCommentContent}
              onChange={(e) => onEditContentChange(e.target.value)}
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
                onClick={() => onSaveEdit(node._id)}
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
                onClick={onCancelEdit}
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

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onToggleLike(node._id)}
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
              onClick={() => onStartReply(node._id)}
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
              onClick={() => onSetBestAnswer(node._id)}
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
            onClick={() => onReport('Comment', node._id)}
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
              onClick={() => onStartEdit(node)}
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
              onClick={() => onDelete(node._id)}
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

        {replyToCommentId === node._id && (
          <form
            onSubmit={(e) => onSubmitReply(e, node._id)}
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
              onChange={(e) => onReplyContentChange(e.target.value)}
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
              onClick={onCancelReply}
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

      {node.replies && node.replies.map((reply) => (
        <CommentNode
          key={reply._id}
          node={reply}
          depth={depth + 1}
          user={user}
          post={post}
          editingCommentId={editingCommentId}
          editCommentContent={editCommentContent}
          savingEdit={savingEdit}
          replyToCommentId={replyToCommentId}
          replyContent={replyContent}
          onNavigateAuthor={onNavigateAuthor}
          onToggleLike={onToggleLike}
          onSetBestAnswer={onSetBestAnswer}
          onReport={onReport}
          onStartEdit={onStartEdit}
          onEditContentChange={onEditContentChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onStartReply={onStartReply}
          onReplyContentChange={onReplyContentChange}
          onSubmitReply={onSubmitReply}
          onCancelReply={onCancelReply}
        />
      ))}
    </div>
  );
}
