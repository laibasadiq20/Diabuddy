import React from 'react';

export default function PostDetailsStyles() {
  return (
    <style>{`
      @media (max-width: 640px) {
        .db-post-thread { padding: 16px !important; border-radius: 16px !important; }
        .db-post-comments { padding: 14px !important; border-radius: 16px !important; }
        .db-post-actions { flex-direction: column; align-items: stretch !important; gap: 14px !important; }
        .db-post-actions > div { width: 100%; }
        .db-post-actions > div:last-child {
          display: flex;
          flex-wrap: wrap;
          gap: 8px !important;
        }
        .db-post-stats-row { gap: 16px !important; }
        .db-post-thread [style*="grid-template-columns"] {
          grid-template-columns: 1fr !important;
        }
        .db-comment-depth-1 { margin-left: 10px !important; padding-left: 10px !important; }
        .db-comment-depth-2 { margin-left: 16px !important; padding-left: 10px !important; }
        .db-comment-depth-3 { margin-left: 20px !important; padding-left: 10px !important; }
        .db-comment-node [style*="display: flex"][style*="gap: 12px"] {
          flex-wrap: wrap;
        }
      }
    `}</style>
  );
}
