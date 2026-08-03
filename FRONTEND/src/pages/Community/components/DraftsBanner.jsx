import React from 'react';
import { useI18n } from '../../../i18n/I18nContext';

export default function DraftsBanner({ drafts, onOpenDraft }) {
  const { t: tr } = useI18n();
  if (!drafts?.length) return null;

  const template = tr(drafts.length === 1 ? 'community.draftsOne' : 'community.draftsMany');
  const [before, after] = template.split('{n}');

  return (
    <div className="db-drafts-banner">
      <p>
        {before}<strong>{drafts.length}</strong>{after}
      </p>
      <div className="db-drafts-list">
        {drafts.slice(0, 3).map((d) => (
          <button key={d._id} type="button" onClick={() => onOpenDraft(d._id)}>
            {d.title || tr('community.untitledDraft')}
          </button>
        ))}
      </div>
    </div>
  );
}
