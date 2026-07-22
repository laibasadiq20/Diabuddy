import React from 'react';
import { RefreshCw, FolderOpen, PlusCircle } from 'lucide-react';
import { theme } from '../../../theme';

const t = theme;

export default function FeedState({
  loading,
  error,
  empty,
  onRetry,
  onCreatePost,
}) {
  if (loading) {
    return (
      <div className="db-community-state">
        <RefreshCw className="animate-spin" size={28} />
        <p>Loading discussions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-community-state db-community-state--error">
        <p>{error}</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="db-community-state">
        <FolderOpen size={40} color={t.inkFaint} />
        <h3>No posts yet</h3>
        <p>Be the first to start a discussion in this space.</p>
        <button type="button" className="db-community-cta" onClick={onCreatePost}>
          <PlusCircle size={16} />
          <span>Create a post</span>
        </button>
      </div>
    );
  }

  return null;
}
