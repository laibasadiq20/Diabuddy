import React from 'react';
import { RefreshCw, MessageSquarePlus, PlusCircle } from 'lucide-react';
import { theme } from '../../../theme';

const t = theme;

const FIRST_POST_IDEAS = [
  'A question about meals, meds, or a recent reading',
  'What helped you in the first weeks after diagnosis',
  'A routine that made logging easier',
];

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
      <div className="db-community-state db-community-state--empty">
        <MessageSquarePlus size={36} color={t.sageDeep} strokeWidth={1.6} />
        <h3>Start the first post</h3>
        <p>
          This space is quiet right now. One clear question or tip helps the next person feel less alone.
        </p>
        <ul className="db-community-first-tips">
          {FIRST_POST_IDEAS.map((idea) => (
            <li key={idea}>{idea}</li>
          ))}
        </ul>
        <button type="button" className="db-community-cta" onClick={onCreatePost}>
          <PlusCircle size={16} />
          <span>Write your first post</span>
        </button>
      </div>
    );
  }

  return null;
}
