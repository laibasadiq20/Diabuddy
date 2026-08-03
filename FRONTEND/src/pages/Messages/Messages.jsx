import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import useMessages from './components/useMessages';
import ConversationList from './components/ConversationList';
import ChatThread from './components/ChatThread';
import NewChatModal from './components/NewChatModal';
import GroupInfoPanel from './components/GroupInfoPanel';

const t = theme;

export default function Messages() {
  const { user, authHeaders } = useAuth();
  const m = useMessages({ user, authHeaders });

  return (
    <div style={{ height: '100dvh', display: 'flex', background: t.bg, overflow: 'hidden' }}>
      <AppSidebar />

      <main style={{ flexGrow: 1, fontFamily: t.fontBody, minHeight: 0, display: 'flex', minWidth: 0 }}>
        <div style={{ width: '100%', margin: '0 auto', padding: '0', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div
            className={`db-msg-shell${m.activeConvId ? ' is-chat-open' : ''}`}
            style={{
              background: t.surface,
              borderLeft: `1px solid ${t.lineStrong}`,
              flexGrow: 1,
              display: 'flex',
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            <ConversationList
              conversations={m.conversations}
              convLoading={m.convLoading}
              activeConvId={m.activeConvId}
              myId={m.myId}
              onSelect={(id) => {
                m.openChat(id);
                m.setGroupPanelOpen(false);
              }}
              onOpenNew={() => m.openNewModal('pick')}
            />

            <ChatThread
              activeConv={m.activeConv}
              messages={m.messages}
              msgLoading={m.msgLoading}
              messageText={m.messageText}
              sendError={m.sendError}
              myId={m.myId}
              chatEndRef={m.chatEndRef}
              chatScrollRef={m.chatScrollRef}
              onBack={m.closeChat}
              onOpenGroupPanel={m.openGroupPanel}
              onMessageTextChange={m.setMessageText}
              onSendMessage={m.handleSendMessage}
              onOpenNew={() => m.openNewModal('pick')}
            />
          </div>
        </div>
      </main>

      <GroupInfoPanel
        open={m.groupPanelOpen}
        activeConv={m.activeConv}
        myId={m.myId}
        renameValue={m.renameValue}
        addMemberQuery={m.addMemberQuery}
        addMemberResults={m.addMemberResults}
        groupBusy={m.groupBusy}
        groupError={m.groupError}
        onClose={() => m.setGroupPanelOpen(false)}
        onRenameValueChange={m.setRenameValue}
        onRename={m.handleRenameGroup}
        onAddMemberQueryChange={m.setAddMemberQuery}
        onAddMember={m.handleAddMember}
        onRemoveMember={m.handleRemoveMember}
        onLeaveGroup={m.handleLeaveGroup}
      />

      <NewChatModal
        open={m.modalOpen}
        modalMode={m.modalMode}
        searchQuery={m.searchQuery}
        searchResults={m.searchResults}
        searchLoading={m.searchLoading}
        selectedUserIds={m.selectedUserIds}
        groupName={m.groupName}
        modalError={m.modalError}
        creating={m.creating}
        onReset={m.resetModal}
        onBackToPick={m.backToPick}
        onSetMode={m.setModalMode}
        onSearchChange={m.setSearchQuery}
        onGroupNameChange={m.setGroupName}
        onToggleSelectUser={m.toggleSelectUser}
        onStartOneToOne={m.startOneToOne}
        onCreateGroup={m.handleCreateGroup}
      />
    </div>
  );
}
