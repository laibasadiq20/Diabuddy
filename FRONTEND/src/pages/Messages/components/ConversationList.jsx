import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, RefreshCw, Inbox, ArrowLeft } from 'lucide-react';
import { theme } from '../../../theme';
import { useI18n } from '../../../i18n/I18nContext';
import {
  idOf,
  getChatPartner,
  getChatPartnerName,
} from './messageHelpers';
import { formatClock12 } from '../../../utils/timezone';

const t = theme;

function formatConversationTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = formatClock12(d);
  if (sameDay) return time;
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${date} · ${time}`;
}

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
  const navigate = useNavigate();
  const { t: tr } = useI18n();
  return (
    <div
      className="db-msg-list"
      style={{
        width: '340px',
        maxWidth: '40%',
        borderRight: `1px solid ${t.line}`,
        display: 'flex',
        flexDirection: 'column',
        background: t.surfaceRaised,
        minHeight: 0,
      }}
    >
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
            marginBottom: 10,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: t.ink, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: t.fontDisplay }}>
            {tr('messages.title')}
          </h2>

          <button
            type="button"
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
              color: '#fff',
            }}
          >
            <UserPlus size={14} /> {tr('messages.new')}
          </button>
        </div>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        {convLoading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: t.inkFaint }}>
            <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto' }} />
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: t.inkFaint }}>
            <Inbox size={28} style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '13px', margin: 0 }}>{tr('messages.noChatsYet')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {conversations.map((conv) => {
              const active = conv._id === activeConvId;
              const isUnread =
                conv.lastMessage &&
                idOf(conv.lastMessage.senderId) !== myId &&
                !(conv.lastMessage.readBy || []).some((r) => idOf(r) === myId);
              const stamp = conv.lastMessage?.createdAt || conv.lastMessageAt;

              return (
                <button
                  key={conv._id}
                  type="button"
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
                    width: '100%',
                  }}
                >
                  <div style={{ position: 'relative', width: '38px', height: '38px' }}>
                    <div
                      style={{
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
                        border: `1.5px solid ${t.lineStrong}`,
                      }}
                    >
                      <ConversationAvatar conv={conv} myId={myId} />
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', gap: 8 }}>
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: isUnread || active ? '700' : '500',
                          color: t.ink,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getChatPartnerName(conv, myId, { group: tr('messages.group'), unknown: tr('messages.unknownBuddy') })}
                      </span>

                      <span style={{ fontSize: '11px', color: t.inkFaint, flexShrink: 0, fontWeight: 600 }}>
                        {formatConversationTime(stamp)}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '12px',
                        color: isUnread ? t.ink : t.inkSoft,
                        fontWeight: isUnread ? '700' : '400',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conv.lastMessage?.content || tr('messages.noMessagesYet')}
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
