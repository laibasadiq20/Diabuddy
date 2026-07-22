import React from 'react';
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
import {
  idOf,
  getChatPartnerName,
  getChatPartnerOnlineStatus,
  isMessageReadByOthers,
} from './messageHelpers';
import { ConversationAvatar } from './ConversationList';

const t = theme;

export default function ChatThread({
  activeConv,
  messages,
  msgLoading,
  messageText,
  myId,
  chatEndRef,
  onBack,
  onOpenGroupPanel,
  onMessageTextChange,
  onSendMessage,
  onOpenNew,
}) {
  if (!activeConv) {
    return (
      <div className="db-msg-chat" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: t.surface, minWidth: 0 }}>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: t.inkSoft, textAlign: 'center' }}>
          <Inbox size={48} color={t.inkFaint} style={{ marginBottom: '16px' }} />
          <h3 style={{ fontFamily: t.fontDisplay, fontSize: '20px', margin: '0 0 8px 0', color: t.ink }}>Your chats</h3>
          <p style={{ fontSize: '14px', maxWidth: '320px', margin: '0 0 18px' }}>
            Pick a conversation on the left, or start a new 1:1 chat or group — just like WhatsApp.
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
            <UserPlus size={14} /> New chat
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
            aria-label="Back to conversations"
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
              {getChatPartnerName(activeConv, myId)}
            </h3>

            {activeConv.isGroup ? (
              <p style={{ fontSize: '10px', color: t.inkFaint, margin: 0, fontWeight: 600 }}>
                {activeConv.members?.length || 0} members
              </p>
            ) : (
              <p style={{ fontSize: '10px', color: getChatPartnerOnlineStatus(activeConv, myId) ? '#22C55E' : t.inkFaint, margin: 0, fontWeight: '600' }}>
                {getChatPartnerOnlineStatus(activeConv, myId) ? 'Online' : 'Offline'}
              </p>
            )}
          </div>
        </div>

        {activeConv.isGroup && (
          <button
            type="button"
            onClick={onOpenGroupPanel}
            aria-label="Group info"
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

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {msgLoading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: t.inkSoft }}><RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isMe = idOf(msg.senderId) === myId;
              const readByOthers = isMe && isMessageReadByOthers(msg, activeConv, myId);
              return (
                <div
                  key={msg._id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    width: '100%'
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
                      padding: '10px 16px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      {msg.content}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: t.inkFaint }}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
                        readByOthers
                          ? <CheckCheck size={12} color={t.sageDeep} title="Read" />
                          : <Check size={12} color={t.inkFaint} title="Sent" />
                      )}
                    </div>
                  </div>
                </div>
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
          gap: '10px',
          background: t.surfaceRaised,
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={messageText}
          onChange={(e) => onMessageTextChange(e.target.value)}
          placeholder="Type a secure message..."
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
      </form>
    </div>
  );
}
