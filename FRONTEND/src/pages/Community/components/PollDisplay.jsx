import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { theme } from '../../../theme';

const t = theme;

export default function PollDisplay({ pollData, onVote }) {
  if (!pollData?.poll) return null;

  const { poll, myOptionIndex } = pollData;

  return (
    <div style={{
      background: t.bg,
      borderRadius: '16px',
      padding: '24px',
      border: `1.5px solid ${t.line}`,
      marginBottom: '28px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: t.ink, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} color={t.gold} /> {poll.question}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {poll.options.map((opt, idx) => {
          const totalVotes = poll.totalVotes || 0;
          const percent = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
          const hasVoted = myOptionIndex !== null;
          const isMyVote = myOptionIndex === idx;
          const isClosed = poll.expiresAt && new Date(poll.expiresAt) < new Date();

          return (
            <button
              key={idx}
              disabled={hasVoted || isClosed}
              onClick={() => onVote(idx)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: isMyVote ? t.sageSoft : t.surface,
                border: `1.5px solid ${isMyVote ? t.sageDeep : t.line}`,
                borderRadius: '10px',
                padding: '12px 16px',
                position: 'relative',
                cursor: (hasVoted || isClosed) ? 'default' : 'pointer',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              {hasVoted && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${percent}%`,
                  background: isMyVote ? 'rgba(124, 148, 112, 0.25)' : 'rgba(43, 42, 40, 0.05)',
                  zIndex: 1,
                  transition: 'width 0.5s'
                }} />
              )}

              <span style={{ position: 'relative', zIndex: 2, fontSize: '14px', fontWeight: isMyVote ? '600' : '500', color: t.ink }}>
                {opt.text} {isMyVote && ' ✓'}
              </span>

              {hasVoted && (
                <span style={{ position: 'relative', zIndex: 2, fontSize: '13px', fontWeight: '700', color: t.inkSoft }}>
                  {percent}% ({opt.votesCount})
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '11px', color: t.inkFaint }}>
        <span>Total Votes: {poll.totalVotes || 0}</span>
        {poll.expiresAt && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={11} />
            {new Date(poll.expiresAt) < new Date() ? 'Poll Closed' : `Closes: ${new Date(poll.expiresAt).toLocaleDateString()}`}
          </span>
        )}
      </div>
    </div>
  );
}
