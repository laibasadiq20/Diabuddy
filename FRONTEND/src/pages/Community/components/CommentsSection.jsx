import React from 'react';
import { Send, Lock } from 'lucide-react';
import { theme } from '../../../theme';
import CommentNode from './CommentNode';

const t = theme;

export default function CommentsSection({
  post,
  user,
  commentsTree,
  newCommentContent,
  onNewCommentChange,
  onCreateComment,
  commentNodeProps,
}) {
  return (
    <section className="db-post-comments" style={{
      background: '#FFF',
      border: `1.5px solid ${t.lineStrong}`,
      borderRadius: 20,
      padding: '22px',
      boxShadow: t.shadowCard,
      marginBottom: 8,
    }}>
      <h2 style={{ fontFamily: t.fontDisplay, fontSize: 'clamp(20px, 4vw, 24px)', color: t.ink, margin: '0 0 16px 0', fontWeight: 500 }}>
        Discussion ({post.commentsCount || 0})
      </h2>

      {!post.isLocked ? (
        <form onSubmit={(e) => onCreateComment(e, null)} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <textarea
              value={newCommentContent}
              onChange={(e) => onNewCommentChange(e.target.value)}
              placeholder={user ? "Add a helpful answer or question..." : "Sign in to participate in discussion"}
              disabled={!user}
              rows={3}
              style={{
                flexGrow: 1,
                boxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${t.line}`,
                background: t.surface,
                color: t.ink,
                fontSize: '14px',
                outline: 'none',
                fontFamily: t.fontBody,
                resize: 'vertical',
                lineHeight: '1.5'
              }}
            />
          </div>
          {user && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                style={{
                  background: t.sageDeep,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={14} /> Send Comment
              </button>
            </div>
          )}
        </form>
      ) : (
        <div style={{ background: t.claySoft, borderRadius: '12px', padding: '12px 16px', color: t.clayDeep, fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Lock size={16} /> This thread is locked and cannot receive further comments.
        </div>
      )}

      {commentsTree.length === 0 ? (
        <p style={{ textAlign: 'center', color: t.inkFaint, padding: '24px 0', fontSize: '14px' }}>
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {commentsTree.map((rootNode) => (
            <CommentNode key={rootNode._id} node={rootNode} {...commentNodeProps} />
          ))}
        </div>
      )}
    </section>
  );
}
