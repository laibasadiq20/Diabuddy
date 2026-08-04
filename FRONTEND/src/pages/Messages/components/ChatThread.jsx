import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  RefreshCw,
  Inbox,
  Check,
  CheckCheck,
  ArrowLeft,
  MoreVertical,
  UserPlus,
} from 'lucide-react';
import { theme } from '../../../theme';
import { useI18n } from '../../../i18n/I18nContext';
import {
  idOf,
  getChatPartnerName,
  isMessageReadByOthers,
} from './messageHelpers';
import { ConversationAvatar } from './ConversationList';

const t = theme;

function formatMessageClock(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function dayKey(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDaySeparator(iso, tr) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMsg = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startToday - startMsg) / 86400000);
  if (diffDays === 0) return tr('messages.today') !== 'messages.today' ? tr('messages.today') : 'Today';
  if (diffDays === 1) return tr('messages.yesterday') !== 'messages.yesterday' ? tr('messages.yesterday') : 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function ChatThread({
  activeConv,
  messages,
  msgLoading,
  messageText,
  sendError,
  myId,
  chatEndRef,
  chatScrollRef,
  onBack,
  onOpenGroupPanel,
  onMessageTextChange,
  onSendMessage,
  onOpenNew,
}) {
  const navigate = useNavigate();
  const { t: tr } = useI18n();
  if (!activeConv) {
    return (
      <div className="db-msg-chat" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: t.surface, minWidth: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.line}`, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/dashboard');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              background: 'none',
              color: t.inkSoft,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              padding: 0,
            }}
          >
            <ArrowLeft size={16} />
            {tr('common.back')}
          </button>
        </div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: t.inkSoft, textAlign: 'center' }}>
          <Inbox size={48} color={t.inkFaint} style={{ marginBottom: '16px' }} />
          <h3 style={{ fontFamily: t.fontDisplay, fontSize: '20px', margin: '0 0 8px 0', color: t.ink }}>{tr('messages.yourChats')}</h3>
          <p style={{ fontSize: '14px', maxWidth: '320px', margin: '0 0 18px' }}>
            {tr('messages.pickConversation')}
          </p>
          <button
            type="button"
            onClick={onOpenNew}
            style={{
              background: t.sageDeep,
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <UserPlus size={14} /> {tr('messages.newChat')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="db-msg-chat" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: t.surface, minWidth: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1.5px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button
            type="button"
            className="db-msg-back"
            onClick={onBack}
            aria-label={tr('messages.backToConversations')}
            style={{
              display: 'none',
              background: t.surfaceSunken,
              border: `1px solid ${t.line}`,
              borderRadius: 10,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: t.ink,
              flexShrink: 0,
              padding: 0,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: t.sageSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '700',
            color: t.sageDeep,
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <ConversationAvatar conv={activeConv} myId={myId} />
          </div>

          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getChatPartnerName(activeConv, myId, { group: tr('messages.group'), unknown: tr('messages.unknownBuddy') })}
            </h3>

            {activeConv.isGroup && (
              <p style={{ fontSize: '10px', color: t.inkFaint, margin: 0, fontWeight: 600 }}>
                {tr('messages.membersTemplate').replace('{n}', activeConv.members?.length || 0)}
              </p>
            )}
          </div>
        </div>

        {activeConv.isGroup && (
          <button
            type="button"
            onClick={onOpenGroupPanel}
            aria-label={tr('messages.groupInfo')}
            style={{
              background: t.surfaceSunken,
              border: `1px solid ${t.line}`,
              borderRadius: 10,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: t.ink,
              flexShrink: 0,
            }}
          >
            <MoreVertical size={18} />
          </button>
        )}
      </div>

      <div
        ref={chatScrollRef}
        style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        {msgLoading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: t.inkSoft }}><RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isMe = idOf(msg.senderId) === myId;
              const readByOthers = isMe && isMessageReadByOthers(msg, activeConv, myId);
              const timeLabel = formatMessageClock(msg.createdAt);
              const prev = idx > 0 ? messages[idx - 1] : null;
              const showDaySep = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
              return (
                <React.Fragment key={msg._id || idx}>
                  {showDaySep ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        margin: '4px 0 2px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: t.inkSoft,
                          background: t.surfaceSunken,
                          border: `1px solid ${t.line}`,
                          borderRadius: 999,
                          padding: '4px 12px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {formatDaySeparator(msg.createdAt, tr)}
                      </span>
                    </div>
                  ) : null}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      width: '100%',
                    }}
                  >
                    <div className="db-msg-bubble" style={{ display: 'flex', gap: '8px', maxWidth: 'min(78%, 420px)', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {activeConv.isGroup && !isMe && (
                        <span style={{ fontSize: '10px', fontWeight: '600', color: t.inkSoft, marginLeft: '4px' }}>
                          {msg.senderId?.name}
                        </span>
                      )}

                      <div style={{
                        background: isMe ? t.sageDeep : t.surfaceSunken,
                        color: isMe ? '#FFFFFF' : t.ink,
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 14px 8px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}>
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 5,
                            marginTop: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            opacity: isMe ? 0.85 : 1,
                            color: isMe ? 'rgba(255,255,255,0.88)' : t.inkFaint,
                          }}
                        >
                          {timeLabel ? <span>{timeLabel}</span> : null}
                          {isMe && (
                            readByOthers
                              ? <CheckCheck size={13} color={isMe ? 'rgba(255,255,255,0.95)' : t.sageDeep} title={tr('messages.read')} />
                              : <Check size={13} color={isMe ? 'rgba(255,255,255,0.75)' : t.inkFaint} title={tr('messages.sent')} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      <form
        className="db-msg-composer"
        onSubmit={onSendMessage}
        style={{
          padding: '12px 14px',
          borderTop: `1.5px solid ${t.line}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: t.surfaceRaised,
          flexShrink: 0,
        }}
      >
        {sendError ? (
          <p style={{ margin: 0, fontSize: 12, color: t.clay, fontWeight: 600 }}>{sendError}</p>
        ) : null}
        <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => onMessageTextChange(e.target.value)}
          placeholder={tr('messages.typeMessage')}
          required
          style={{
            flexGrow: 1,
            boxSizing: 'border-box',
            padding: '12px 18px',
            borderRadius: '12px',
            border: `1.5px solid ${t.line}`,
            background: t.bg,
            color: t.ink,
            fontSize: '14px',
            outline: 'none',
            fontFamily: t.fontBody
          }}
          onFocus={(e) => { e.target.style.borderColor = t.sageDeep; }}
          onBlur={(e) => { e.target.style.borderColor = t.line; }}
        />

        <button
          type="submit"
          style={{
            background: t.sageDeep,
            color: '#FFF',
            border: 'none',
            borderRadius: '12px',
            padding: '0 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.olive; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = t.sageDeep; }}
        >
          <Send size={16} />
        </button>
        </div>
      </form>
    </div>
  );
}
