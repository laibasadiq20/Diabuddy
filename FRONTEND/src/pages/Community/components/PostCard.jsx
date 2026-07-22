import React from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Award,
  Lock,
  Pin,
} from 'lucide-react';
import { theme } from '../../../theme';

const t = theme;

export default function PostCard({
  post,
  user,
  dmLoadingId,
  onOpenPost,
  onOpenAuthor,
  onStartDm,
}) {
  const postTopicColor = post.topicId?.color || t.sage;
  const hasBestAnswer = !!post.bestAnswerCommentId;
  const myId = String(user?.id || user?._id || '');
  const authorId = post.authorId?._id;
  const canMessage =
    !post.isAnonymous && authorId && String(authorId) !== myId;

  return (
    <article
      className="db-post-card"
      onClick={() => onOpenPost(post._id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenPost(post._id);
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
          role={!post.isAnonymous && authorId ? 'link' : undefined}
          tabIndex={!post.isAnonymous && authorId ? 0 : undefined}
          onClick={(e) => {
            if (post.isAnonymous || !authorId) return;
            e.stopPropagation();
            onOpenAuthor(post.authorId);
          }}
          onKeyDown={(e) => {
            if (post.isAnonymous || !authorId) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onOpenAuthor(post.authorId);
            }
          }}
          style={{ cursor: !post.isAnonymous && authorId ? 'pointer' : 'default' }}
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
          {canMessage && (
            <button
              type="button"
              className="db-post-dm"
              onClick={(e) => onStartDm(post.authorId, e)}
              disabled={dmLoadingId === authorId}
              aria-label={`Message ${post.authorId?.name || 'user'}`}
            >
              <MessageSquare size={14} />
              <span>{dmLoadingId === authorId ? '…' : 'Message'}</span>
            </button>
          )}
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
}
