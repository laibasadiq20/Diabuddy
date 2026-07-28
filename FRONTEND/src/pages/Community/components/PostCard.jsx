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
  const authorName = post.isAnonymous
    ? 'Anonymous Buddy'
    : post.authorId?.name || 'Member';
  const dateLabel = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

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
      <div className="db-post-card-main">
        <div className="db-post-title-row">
          {(post.isPinned || post.isLocked || hasBestAnswer) && (
            <span className="db-post-badges">
              {post.isPinned && (
                <span className="db-badge db-badge--pin" title="Pinned">
                  <Pin size={10} />
                </span>
              )}
              {post.isLocked && (
                <span className="db-badge db-badge--lock" title="Locked">
                  <Lock size={10} />
                </span>
              )}
              {hasBestAnswer && (
                <span className="db-badge db-badge--solved" title="Solved">
                  <Award size={10} />
                </span>
              )}
            </span>
          )}
          <h2 className="db-post-title">{post.title}</h2>
          <span
            className="db-post-topic db-post-topic--desktop"
            style={{ color: postTopicColor, background: `${postTopicColor}18` }}
          >
            {post.topicId?.name || 'General'}
          </span>
        </div>

        {post.content ? (
          <p className="db-post-excerpt">{post.content}</p>
        ) : null}

        <div className="db-post-meta">
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
            <span className="db-post-author-name">
              {authorName}
              {!post.isAnonymous && post.authorId?.isVerifiedProfessional && (
                <span className="db-pro-tag">PRO</span>
              )}
            </span>
          </div>
          <span className="db-post-meta-sep" aria-hidden>
            ·
          </span>
          <span className="db-post-date">{dateLabel}</span>
          <span
            className="db-post-topic db-post-topic--mobile"
            style={{ color: postTopicColor, background: `${postTopicColor}18` }}
          >
            {post.topicId?.name || 'General'}
          </span>
        </div>
      </div>

      <div className="db-post-aside">
        <div className="db-post-stats">
          <span title="Likes">
            <ThumbsUp size={13} /> {post.likesCount || 0}
          </span>
          <span title="Comments">
            <MessageSquare size={13} /> {post.commentsCount || 0}
          </span>
          <span title="Views">
            <Eye size={13} /> {post.viewsCount || 0}
          </span>
        </div>
        {canMessage && (
          <button
            type="button"
            className="db-post-dm"
            onClick={(e) => onStartDm(post.authorId, e)}
            disabled={dmLoadingId === authorId}
            aria-label={`Message ${post.authorId?.name || 'user'}`}
          >
            <MessageSquare size={13} />
            <span>{dmLoadingId === authorId ? '…' : 'DM'}</span>
          </button>
        )}
      </div>
    </article>
  );
}
