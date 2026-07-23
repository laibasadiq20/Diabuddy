import React from 'react';
import { UserPlus, RefreshCw, Inbox } from 'lucide-react';
import { theme } from '../../../theme';
import {
  idOf,
  getChatPartner,
  getChatPartnerName,
} from './messageHelpers';

const t = theme;

function ConversationAvatar({ conv, myId }) {
  if (conv.isGroup) {
    return '👥';
  }
  const otherMember = getChatPartner(conv, myId);
  if (otherMember?.profileImageUrl) {
    return (
      <img
        src={otherMember.profileImageUrl}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  return otherMember?.name?.charAt(0).toUpperCase() || 'U';
}

export default function ConversationList({
  conversations,
  convLoading,
  activeConvId,
  myId,
  onSelect,
  onOpenNew,
}) {
  return (
    <div
      className="db-msg-list"
      style={{
        width: '340px',
        maxWidth: '40%',
        borderRight: `1px solid ${t.line}`,
        display: 'flex',
        flexDirection: 'column',
        background: '#FAF8F5',
        minHeight: 0,
      }}
    >
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: t.ink, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: t.fontDisplay }}>
          Messages
        </h2>

        <button
          onClick={onOpenNew}
          style={{
            background: t.sageDeep,
            border: 'none',
            borderRadius: '999px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#fff'
          }}
        >
          <UserPlus size={14} /> New
        </button>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        {convLoading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: t.inkFaint }}><RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto' }} /></div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: t.inkFaint }}>
            <Inbox size={28} style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '13px', margin: 0 }}>No chats yet. Tap New to start a 1:1 or group.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {conversations.map((conv) => {
              const active = conv._id === activeConvId;
              const isUnread =
                conv.lastMessage &&
                idOf(conv.lastMessage.senderId) !== myId &&
                !(conv.lastMessage.readBy || []).some((r) => idOf(r) === myId);

              return (
                <button
                  key={conv._id}
                  onClick={() => onSelect(conv._id)}
                  style={{
                    background: active ? t.surfaceSunken : 'none',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                >
                  <div style={{ position: 'relative', width: '38px', height: '38px' }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: t.sageSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: t.sageDeep,
                      overflow: 'hidden',
                      border: `1.5px solid ${t.lineStrong}`
                    }}>
                      <ConversationAvatar conv={conv} myId={myId} />
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: isUnread || active ? '700' : '500', color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getChatPartnerName(conv, myId)}
                      </span>

                      <span style={{ fontSize: '10px', color: t.inkFaint }}>
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '12px',
                      color: isUnread ? t.ink : t.inkSoft,
                      fontWeight: isUnread ? '700' : '400',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>

                  {isUnread && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.skyDeep, flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export { ConversationAvatar };
