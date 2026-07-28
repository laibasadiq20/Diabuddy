import React from 'react';

export default function PostDetailsStyles() {
  return (
    <style>{`
      .db-post-main {
        box-sizing: border-box;
      }
      .db-post-wrap {
        width: 100%;
        box-sizing: border-box;
      }

      @media (max-width: 640px) {
        .db-post-main {
          padding: 16px 12px 88px !important;
        }
        .db-post-wrap {
          max-width: 100% !important;
        }
        .db-post-wrap > button {
          margin-bottom: 12px !important;
          min-height: 40px;
        }
        .db-post-thread {
          padding: 14px !important;
          border-radius: 14px !important;
          margin-bottom: 14px !important;
        }
        .db-post-thread h1 {
          font-size: 1.25rem !important;
          line-height: 1.35 !important;
          word-break: break-word;
        }
        .db-post-thread img {
          max-height: 240px !important;
          border-radius: 10px !important;
        }
        .db-post-comments {
          padding: 12px !important;
          border-radius: 14px !important;
        }
        .db-post-actions {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 12px !important;
        }
        .db-post-actions > div {
          width: 100%;
        }
        .db-post-actions > div:last-child {
          display: flex;
          flex-wrap: wrap;
          gap: 8px !important;
        }
        .db-post-actions > div:last-child button {
          flex: 1 1 auto;
          min-width: calc(50% - 4px);
        }
        .db-post-stats-row {
          gap: 14px !important;
          flex-wrap: wrap;
        }
        .db-post-thread [style*="grid-template-columns"] {
          grid-template-columns: 1fr !important;
        }
        .db-comment-depth-1 { margin-left: 8px !important; padding-left: 8px !important; }
        .db-comment-depth-2 { margin-left: 12px !important; padding-left: 8px !important; }
        .db-comment-depth-3 { margin-left: 14px !important; padding-left: 8px !important; }
        .db-comment-node [style*="display: flex"][style*="gap: 12px"] {
          flex-wrap: wrap;
        }
        .db-post-comments textarea,
        .db-post-comments input,
        .db-comment-node textarea {
          font-size: 16px !important;
        }
      }
    `}</style>
  );
}
