import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function FeedHeader({ onNewPost }) {
  return (
    <div className="db-community-header">
      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="db-community-eyebrow">Community</p>
        <h1 className="db-community-title">Forum</h1>
        <p className="db-community-lead">
          Ask questions, share routines, and learn with people who get it.
        </p>
      </div>
      <div className="db-community-actions">
        <button type="button" className="db-community-cta" onClick={onNewPost}>
          <PlusCircle size={16} />
          <span>New post</span>
        </button>
      </div>
    </div>
  );
}
