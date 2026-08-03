import React from 'react';
import { RefreshCw, MessageSquarePlus, PlusCircle } from 'lucide-react';
import { theme } from '../../../theme';
import { useI18n } from '../../../i18n/I18nContext';

const t = theme;

export default function FeedState({
  loading,
  error,
  empty,
  onRetry,
  onCreatePost,
}) {
  const { t: tr } = useI18n();
  const FIRST_POST_IDEAS = [
    tr('community.state.idea1'),
    tr('community.state.idea2'),
    tr('community.state.idea3'),
  ];

  if (loading) {
    return (
      <div className="db-community-state">
        <RefreshCw className="animate-spin" size={28} />
        <p>{tr('community.state.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-community-state db-community-state--error">
        <p>{error}</p>
        <button type="button" onClick={onRetry}>
          {tr('common.retry')}
        </button>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="db-community-state db-community-state--empty">
        <MessageSquarePlus size={36} color={t.sageDeep} strokeWidth={1.6} />
        <h3>{tr('community.state.emptyTitle')}</h3>
        <p>
          {tr('community.state.emptyBody')}
        </p>
        <ul className="db-community-first-tips">
          {FIRST_POST_IDEAS.map((idea) => (
            <li key={idea}>{idea}</li>
          ))}
        </ul>
        <button type="button" className="db-community-cta" onClick={onCreatePost}>
          <PlusCircle size={16} />
          <span>{tr('community.state.writeFirstPost')}</span>
        </button>
      </div>
    );
  }

  return null;
}
