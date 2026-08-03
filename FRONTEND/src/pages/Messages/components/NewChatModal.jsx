import React from 'react';
import {
  MessageSquare,
  Search,
  Users,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { theme } from '../../../theme';
import { useI18n } from '../../../i18n/I18nContext';

const t = theme;

export default function NewChatModal({
  open,
  modalMode,
  searchQuery,
  searchResults,
  searchLoading,
  selectedUserIds,
  groupName,
  modalError,
  creating,
  onReset,
  onBackToPick,
  onSetMode,
  onSearchChange,
  onGroupNameChange,
  onToggleSelectUser,
  onStartOneToOne,
  onCreateGroup,
}) {
  const { t: tr } = useI18n();
  if (!open) return null;

  return (
    <div
      className="db-newchat-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
        fontFamily: t.fontBody,
        padding: '0',
      }}
    >
      <div
        onClick={onReset}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden
      />
      <div
        className="db-newchat-sheet"
        style={{
          position: 'relative',
          background: t.surface,
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '88dvh',
          padding: '20px 20px 28px',
          boxShadow: t.shadowLifted,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: t.lineStrong, margin: '0 auto 16px', flexShrink: 0 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {modalMode !== 'pick' && (
              <button
                type="button"
                onClick={onBackToPick}
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
                  padding: 0,
                  color: t.ink,
                }}
                aria-label={tr('common.back')}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 style={{ fontFamily: t.fontDisplay, fontSize: 20, margin: 0, color: t.ink }}>
              {modalMode === 'pick' && tr('messages.new')}
              {modalMode === 'chat' && tr('messages.newChat')}
              {modalMode === 'group' && tr('messages.newGroup')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: t.inkSoft,
              lineHeight: 1,
              padding: 4,
            }}
            aria-label={tr('common.close')}
          >
            ×
          </button>
        </div>

        {modalError && (
          <div style={{ background: t.clayTint, border: `1.5px solid ${t.clay}30`, borderRadius: 10, padding: 10, color: t.clayDeep, fontSize: 12, marginBottom: 12, flexShrink: 0 }}>
            {modalError}
          </div>
        )}

        {modalMode === 'pick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={() => onSetMode('chat')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                textAlign: 'left',
                background: t.surfaceSunken,
                border: `1.5px solid ${t.line}`,
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
              }}
            >
              <span style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: t.sageSoft,
                color: t.sageDeep,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MessageSquare size={18} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: t.ink }}>{tr('messages.newChat')}</span>
                <span style={{ display: 'block', fontSize: 12, color: t.inkSoft, marginTop: 2 }}>{tr('messages.messageOnePerson')}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSetMode('group')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                textAlign: 'left',
                background: t.surfaceSunken,
                border: `1.5px solid ${t.line}`,
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
              }}
            >
              <span style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: t.sageSoft,
                color: t.sageDeep,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Users size={18} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: t.ink }}>{tr('messages.newGroup')}</span>
                <span style={{ display: 'block', fontSize: 12, color: t.inkSoft, marginTop: 2 }}>{tr('messages.chatWithSeveral')}</span>
              </span>
            </button>
          </div>
        )}

        {modalMode === 'chat' && (
          <>
            <div style={{ position: 'relative', marginBottom: 12, flexShrink: 0 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={tr('messages.searchNameUsername')}
                autoFocus
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px 12px 36px',
                  borderRadius: 12,
                  border: `1.5px solid ${t.line}`,
                  fontSize: 14,
                  outline: 'none',
                  background: t.bg,
                  fontFamily: t.fontBody,
                }}
              />
            </div>

            <div style={{
              flex: 1,
              minHeight: 180,
              maxHeight: 320,
              overflowY: 'auto',
              borderRadius: 12,
              border: `1px solid ${t.line}`,
              background: t.surfaceSunken,
            }}>
              {searchLoading || creating ? (
                <div style={{ textAlign: 'center', padding: 28, color: t.inkSoft }}>
                  <RefreshCw className="animate-spin" size={18} style={{ margin: '0 auto' }} />
                </div>
              ) : searchResults.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 13, color: t.inkFaint, margin: '28px 12px' }}>
                  {searchQuery ? tr('messages.noOneFound') : tr('messages.searchToMessage')}
                </p>
              ) : (
                searchResults.map((peer) => (
                  <button
                    key={peer._id}
                    type="button"
                    onClick={() => onStartOneToOne(peer._id)}
                    disabled={creating}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      border: 'none',
                      borderBottom: `1px solid ${t.line}`,
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: t.sageSoft,
                      color: t.sageDeep,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {peer.profileImageUrl
                        ? <img src={peer.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : peer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.ink }}>{peer.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: t.inkSoft }}>@{peer.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {modalMode === 'group' && (
          <>
            <div style={{ marginBottom: 12, flexShrink: 0 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {tr('messages.groupName')}
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => onGroupNameChange(e.target.value)}
                placeholder={tr('messages.groupNamePlaceholder')}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${t.line}`,
                  fontSize: 14,
                  outline: 'none',
                  background: t.bg,
                  color: t.ink,
                  fontFamily: t.fontBody,
                }}
              />
            </div>

            <div style={{ position: 'relative', marginBottom: 12, flexShrink: 0 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={tr('messages.addPeople')}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px 12px 36px',
                  borderRadius: 12,
                  border: `1.5px solid ${t.line}`,
                  fontSize: 14,
                  outline: 'none',
                  background: t.bg,
                  fontFamily: t.fontBody,
                }}
              />
            </div>

            {selectedUserIds.length > 0 && (
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: t.sageDeep, flexShrink: 0 }}>
                {tr('messages.selectedTemplate').replace('{n}', selectedUserIds.length)}
              </p>
            )}

            <div style={{
              flex: 1,
              minHeight: 140,
              maxHeight: 240,
              overflowY: 'auto',
              borderRadius: 12,
              border: `1px solid ${t.line}`,
              background: t.surfaceSunken,
              marginBottom: 14,
            }}>
              {searchLoading ? (
                <div style={{ textAlign: 'center', padding: 24, color: t.inkSoft }}>
                  <RefreshCw className="animate-spin" size={16} style={{ margin: '0 auto' }} />
                </div>
              ) : searchResults.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 13, color: t.inkFaint, margin: '24px 12px' }}>
                  {searchQuery ? tr('messages.noOneFound') : tr('messages.searchToAddMembers')}
                </p>
              ) : (
                searchResults.map((peer) => {
                  const selected = selectedUserIds.includes(peer._id);
                  return (
                    <button
                      key={peer._id}
                      type="button"
                      onClick={() => onToggleSelectUser(peer._id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        border: 'none',
                        borderBottom: `1px solid ${t.line}`,
                        background: selected ? t.sageSoft : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: t.surface,
                        color: t.sageDeep,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: `1px solid ${t.line}`,
                      }}>
                        {peer.profileImageUrl
                          ? <img src={peer.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : peer.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.ink }}>{peer.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: t.inkSoft }}>@{peer.username}</p>
                      </div>
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: `2px solid ${selected ? t.sageDeep : t.lineStrong}`,
                        background: selected ? t.sageDeep : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {selected ? '✓' : ''}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={onCreateGroup}
              disabled={creating || selectedUserIds.length === 0 || !groupName.trim()}
              style={{
                width: '100%',
                background: selectedUserIds.length > 0 && groupName.trim() ? t.sageDeep : t.lineStrong,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '13px 16px',
                fontSize: 14,
                fontWeight: 700,
                cursor: selectedUserIds.length > 0 && groupName.trim() ? 'pointer' : 'not-allowed',
                fontFamily: t.fontBody,
                flexShrink: 0,
              }}
            >
              {creating ? tr('messages.creating') : tr('messages.createGroup')}
            </button>
          </>
        )}
      </div>
      <style>{`
        @media (min-width: 640px) {
          .db-newchat-overlay {
            align-items: center !important;
            padding: 24px !important;
          }
          .db-newchat-sheet {
            border-radius: 20px !important;
            max-height: min(640px, 85vh) !important;
          }
        }
      `}</style>
    </div>
  );
}
