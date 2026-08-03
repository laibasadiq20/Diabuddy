import React from 'react';
import { PlusCircle } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

export default function FeedHeader({ onNewPost }) {
  const { t: tr } = useI18n();
  return (
    <div className="db-community-header">
      <div style={{ minWidth: 0, flex: 1 }}>
        <h1 className="db-community-title">{tr('community.title')}</h1>
        <p className="db-community-lead">{tr('community.lead')}</p>
      </div>
      <div className="db-community-actions">
        <button type="button" className="db-community-cta" onClick={onNewPost}>
          <PlusCircle size={16} />
          <span>{tr('community.newPost')}</span>
        </button>
      </div>
    </div>
  );
}
