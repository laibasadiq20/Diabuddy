import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Award,
  Lock,
  Pin,
  Languages,
} from 'lucide-react';
import { theme } from '../../../theme';
import { useI18n } from '../../../i18n/I18nContext';
import { translateTextToUrdu } from '../../../utils/postTranslator';

const t = theme;

export default function PostCard({
  post,
  user,
  dmLoadingId,
  onOpenPost,
  onOpenAuthor,
  onStartDm,
}) {
  const { t: tr } = useI18n();
  const [translatedText, setTranslatedText] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  const postTopicColor = post.topicId?.color || t.sage;
  const hasBestAnswer = !!post.bestAnswerCommentId;
  const myId = String(user?.id || user?._id || '');
  const authorId = post.authorId?._id;
  const canMessage =
    !post.isAnonymous && authorId && String(authorId) !== myId;
  const authorName = post.isAnonymous
    ? tr('postCard.anonymousBuddy')
    : post.authorId?.name || tr('postCard.member');
  const isUrduLang = typeof document !== 'undefined' && document.documentElement.getAttribute('data-lang') === 'ur';
  const dateLabel = new Date(post.createdAt).toLocaleDateString(isUrduLang ? 'ur-PK' : undefined, {
    month: 'short',
    day: 'numeric',
  });

  const handleToggleTranslate = async (e) => {
    e.stopPropagation();
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }
    if (translatedText) {
      setShowTranslated(true);
      return;
    }
    setTranslating(true);
    const result = await translateTextToUrdu(post.content || post.title);
    setTranslatedText(result);
    setShowTranslated(true);
    setTranslating(false);
  };

  const isTitleEn = /[a-zA-Z]/.test(post.title || '');
  const isContentEn = /[a-zA-Z]/.test(post.content || '');

  const translateBtnLabel = translating
    ? (isUrduLang ? 'ترجمہ ہو رہا ہے…' : 'Translating…')
    : showTranslated
      ? (isUrduLang ? 'اصل متن دکھائیں' : 'Show Original')
      : (isUrduLang ? 'اردو میں ترجمہ کریں' : 'Translate to Urdu');

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
                <span className="db-badge db-badge--pin" title={tr('postCard.pinned')}>
                  <Pin size={10} />
                </span>
              )}
              {post.isLocked && (
                <span className="db-badge db-badge--lock" title={tr('postCard.locked')}>
                  <Lock size={10} />
                </span>
              )}
              {hasBestAnswer && (
                <span className="db-badge db-badge--solved" title={tr('postCard.solved')}>
                  <Award size={10} />
                </span>
              )}
            </span>
          )}
          <h2
            className="db-post-title"
            style={{
              direction: isTitleEn ? 'ltr' : 'rtl',
              textAlign: isTitleEn ? 'left' : 'right',
              fontFamily: isTitleEn ? "'DM Sans', sans-serif" : 'inherit',
            }}
          >
            {post.title}
          </h2>
          <span
            className="db-post-topic db-post-topic--desktop"
            style={{ color: postTopicColor, background: `${postTopicColor}18` }}
          >
            {post.topicId?.name || tr('postCard.general')}
          </span>
        </div>

        {post.content ? (
          <p
            className="db-post-excerpt"
            style={{
              direction: showTranslated ? 'rtl' : isContentEn ? 'ltr' : 'rtl',
              textAlign: showTranslated ? 'right' : isContentEn ? 'left' : 'right',
              fontFamily: showTranslated ? "'Noto Nastaliq Urdu', sans-serif" : isContentEn ? "'DM Sans', sans-serif" : 'inherit',
              lineHeight: showTranslated ? 1.65 : 1.5,
            }}
          >
            {showTranslated ? translatedText : post.content}
          </p>
        ) : null}

        <button
          type="button"
          className="db-post-translate-btn"
          onClick={handleToggleTranslate}
          disabled={translating}
          style={{
            background: t.skyTint,
            border: `1px solid ${t.skySoft}`,
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 12,
            fontWeight: 650,
            color: t.skyDeep,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            margin: '4px 0 10px',
            fontFamily: isUrduLang ? 'var(--font-body)' : 'inherit',
          }}
        >
          <Languages size={13} />
          <span>{translateBtnLabel}</span>
        </button>

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
            {post.topicId?.name || tr('postCard.general')}
          </span>
        </div>
      </div>

      <div className="db-post-aside">
        <div className="db-post-stats">
          <span title={tr('postCard.likes')}>
            <ThumbsUp size={13} /> {post.likesCount || 0}
          </span>
          <span title={tr('postCard.comments')}>
            <MessageSquare size={13} /> {post.commentsCount || 0}
          </span>
          <span title={tr('postCard.views')}>
            <Eye size={13} /> {post.viewsCount || 0}
          </span>
        </div>
        {canMessage && (
          <button
            type="button"
            className="db-post-dm"
            onClick={(e) => {
              e.stopPropagation();
              onStartDm(post.authorId, e);
            }}
            disabled={dmLoadingId === authorId}
            aria-label={tr('postCard.messageUserTemplate').replace('{name}', post.authorId?.name || tr('postCard.fallbackUser'))}
          >
            <MessageSquare size={13} />
            <span>{dmLoadingId === authorId ? '…' : tr('postCard.dm')}</span>
          </button>
        )}
      </div>
    </article>
  );
}
