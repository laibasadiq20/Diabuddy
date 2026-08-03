import React from 'react';
import {
  Heart,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Flag,
  Award,
  Lock,
  Pin,
  Pencil,
  Unlock,
} from 'lucide-react';
import { theme } from '../../../theme';
import PollDisplay from './PollDisplay';
import { useI18n } from '../../../i18n/I18nContext';

const t = theme;

export default function PostThreadCard({
  post,
  pollData,
  postLiked,
  editingPost,
  editTitle,
  editContent,
  savingEdit,
  isPostOwner,
  isPostAdmin,
  onNavigateAuthor,
  onEditTitleChange,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  onVote,
  onToggleLike,
  onStartEdit,
  onToggleModeration,
  onToggleVisibility,
  onReport,
  onDelete,
}) {
  const { t: tr } = useI18n();
  const hasBestAnswerPointer = !!post.bestAnswerCommentId;
  const isHidden = post.status === 'hidden';

  return (
    <article className="db-post-thread" style={{
      background: t.surface,
      border: `1.5px solid ${isHidden ? `${t.clay}55` : t.lineStrong}`,
      borderRadius: '20px',
      padding: '28px',
      boxShadow: t.shadowCard,
      marginBottom: '20px'
    }}>
      {isHidden && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          padding: '10px 14px',
          borderRadius: 12,
          background: t.clayTint,
          color: t.clayDeep,
          fontSize: 13,
          fontWeight: 600,
        }}>
          <EyeOff size={15} /> {tr('postThreadCard.hiddenNotice')}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => {
            if (!post.isAnonymous && post.authorId?._id) {
              onNavigateAuthor(post.authorId);
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
              {post.isAnonymous ? tr('postThreadCard.anonymousBuddy') : post.authorId?.name}
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

      {editingPost ? (
        <input
          value={editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {post.isPinned && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: t.sageDeep, background: t.sageTint, padding: '2px 8px', borderRadius: '4px' }}>
            <Pin size={10} /> {tr('postThreadCard.pinned')}
          </span>
        )}
        {post.isLocked && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: t.clayDeep, background: t.clayTint, padding: '2px 8px', borderRadius: '4px' }}>
            <Lock size={10} /> {tr('postThreadCard.locked')}
          </span>
        )}
        {hasBestAnswerPointer && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: t.gold, background: t.goldTint, padding: '2px 8px', borderRadius: '4px' }}>
            <Award size={10} /> {tr('postThreadCard.solved')}
          </span>
        )}
      </div>

      {editingPost ? (
        <div style={{ marginBottom: 24 }}>
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
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
              onClick={onSaveEdit}
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
              {savingEdit ? tr('postThreadCard.savingEllipsis') : tr('postThreadCard.saveChanges')}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                background: 'none',
                border: `1px solid ${t.line}`,
                borderRadius: 10,
                padding: '8px 14px',
                cursor: 'pointer',
              }}
            >
              {tr('common.cancel')}
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

      {post.images && post.images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: post.images.length > 1 ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '24px' }}>
          {post.images.map((url, index) => (
            <div key={index} style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${t.line}`, background: t.bg }}>
              <img src={url} alt="" style={{ width: '100%', height: 'auto', maxHeight: '400px', display: 'block', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {post.tags.map((tag, i) => (
            <span key={i} style={{ fontSize: '12px', color: t.inkSoft, background: t.surfaceSunken, padding: '4px 10px', borderRadius: '8px', fontWeight: '500' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {post.type === 'poll' && pollData && pollData.poll && (
        <PollDisplay pollData={pollData} onVote={onVote} />
      )}

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
            onClick={onToggleLike}
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
              onClick={onStartEdit}
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
              <Pencil size={12} /> {tr('postThreadCard.edit')}
            </button>
          )}

          {isPostAdmin && (
            <>
              <button
                type="button"
                onClick={() => onToggleModeration('isPinned')}
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
                <Pin size={12} /> {post.isPinned ? tr('postThreadCard.unpin') : tr('postThreadCard.pin')}
              </button>
              <button
                type="button"
                onClick={() => onToggleModeration('isLocked')}
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
                {post.isLocked ? tr('postThreadCard.unlock') : tr('postThreadCard.lock')}
              </button>
              <button
                type="button"
                onClick={onToggleVisibility}
                style={{
                  background: isHidden ? t.sageTint : t.surfaceSunken,
                  border: `1px solid ${t.line}`,
                  borderRadius: 999,
                  color: isHidden ? t.sageDeep : t.inkSoft,
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
                {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                {isHidden ? tr('postThreadCard.restore') : tr('postThreadCard.hide')}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onReport('ForumPost', post._id)}
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
            <Flag size={12} /> {tr('postThreadCard.report')}
          </button>

          {(isPostOwner || isPostAdmin) && (
            <button
              type="button"
              onClick={onDelete}
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
              <Trash2 size={12} /> {tr('postThreadCard.delete')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
