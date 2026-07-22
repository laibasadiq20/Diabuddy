import React from 'react';

export default function DraftsBanner({ drafts, onOpenDraft }) {
  if (!drafts?.length) return null;

  return (
    <div className="db-drafts-banner">
      <p>
        You have <strong>{drafts.length}</strong> draft{drafts.length === 1 ? '' : 's'}.
      </p>
      <div className="db-drafts-list">
        {drafts.slice(0, 3).map((d) => (
          <button key={d._id} type="button" onClick={() => onOpenDraft(d._id)}>
            {d.title || 'Untitled draft'}
          </button>
        ))}
      </div>
    </div>
  );
}
