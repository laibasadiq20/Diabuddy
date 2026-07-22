import React from 'react';
import { Search, Pencil, UserMinus, UserPlus, LogOut, X } from 'lucide-react';
import { theme } from '../../../theme';
import { idOf } from './messageHelpers';

const t = theme;

export default function GroupInfoPanel({
  open,
  activeConv,
  myId,
  renameValue,
  addMemberQuery,
  addMemberResults,
  groupBusy,
  groupError,
  onClose,
  onRenameValueChange,
  onRename,
  onAddMemberQueryChange,
  onAddMember,
  onRemoveMember,
  onLeaveGroup,
}) {
  if (!open || !activeConv?.isGroup) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 110,
        fontFamily: t.fontBody,
      }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} aria-hidden />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: 480,
          maxHeight: '88dvh',
          overflow: 'auto',
          padding: '20px 20px calc(28px + env(safe-area-inset-bottom, 0px))',
          boxShadow: t.shadowLifted,
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: t.lineStrong, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, color: t.ink }}>Group info</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: t.inkSoft }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {groupError && (
          <div style={{ background: t.clayTint, color: t.clayDeep, borderRadius: 10, padding: 10, fontSize: 12, marginBottom: 12 }}>
            {groupError}
          </div>
        )}

        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase', marginBottom: 6 }}>
          Group name
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <input
            value={renameValue}
            onChange={(e) => onRenameValueChange(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 10,
              border: `1.5px solid ${t.line}`,
              fontSize: 14,
              fontFamily: t.fontBody,
            }}
          />
          <button
            type="button"
            onClick={onRename}
            disabled={groupBusy || !renameValue.trim()}
            style={{
              background: t.sageDeep,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '0 14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Pencil size={14} /> Save
          </button>
        </div>

        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase' }}>
          Members ({activeConv.members?.length || 0})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
          {(activeConv.members || []).map((m) => {
            const mid = idOf(m);
            const isSelf = mid === myId;
            return (
              <div
                key={mid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 12,
                  background: '#FAF8F5',
                  border: `1px solid ${t.line}`,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: t.sageSoft,
                    color: t.sageDeep,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 12,
                    overflow: 'hidden',
                  }}
                >
                  {m.profileImageUrl ? (
                    <img src={m.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    m.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.ink }}>
                    {m.name}{isSelf ? ' (you)' : ''}
                  </p>
                  {m.username && (
                    <p style={{ margin: 0, fontSize: 11, color: t.inkFaint }}>@{m.username}</p>
                  )}
                </div>
                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(mid)}
                    disabled={groupBusy}
                    title="Remove"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: t.clay,
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase' }}>
          Add people
        </p>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
          <input
            value={addMemberQuery}
            onChange={(e) => onAddMemberQueryChange(e.target.value)}
            placeholder="Search name or username…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px 10px 34px',
              borderRadius: 10,
              border: `1.5px solid ${t.line}`,
              fontSize: 13,
              fontFamily: t.fontBody,
            }}
          />
        </div>
        {addMemberResults.length > 0 && (
          <div style={{ maxHeight: 140, overflowY: 'auto', marginBottom: 16, border: `1px solid ${t.line}`, borderRadius: 10 }}>
            {addMemberResults.map((peer) => (
              <button
                key={peer._id}
                type="button"
                onClick={() => onAddMember(peer._id)}
                disabled={groupBusy}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  border: 'none',
                  borderBottom: `1px solid ${t.line}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: t.ink }}>
                  {peer.name} <span style={{ color: t.inkFaint, fontWeight: 500 }}>@{peer.username}</span>
                </span>
                <UserPlus size={14} color={t.sageDeep} />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onLeaveGroup}
          disabled={groupBusy}
          style={{
            width: '100%',
            marginTop: 8,
            background: t.clayTint,
            color: t.clayDeep,
            border: `1px solid ${t.clay}40`,
            borderRadius: 12,
            padding: '12px 16px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: t.fontBody,
          }}
        >
          <LogOut size={15} /> Leave group
        </button>
      </div>
    </div>
  );
}
