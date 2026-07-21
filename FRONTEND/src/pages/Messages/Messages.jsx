import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { API_URL } from '../../config/api';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  UserPlus, 
  RefreshCw,
  Inbox,
  Check,
  CheckCheck,
  ArrowLeft,
  MoreVertical,
  LogOut,
  X,
  Pencil,
  UserMinus,
} from 'lucide-react';

const t = theme;

const idOf = (value) => String(value?._id || value || '');

export default function Messages() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Conversations & Messages State
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [messageText, setMessageText] = useState('');

  // New Chat Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('pick'); // pick | chat | group
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [modalError, setModalError] = useState('');
  const [creating, setCreating] = useState(false);

  // Group info panel
  const [groupPanelOpen, setGroupPanelOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [addMemberQuery, setAddMemberQuery] = useState('');
  const [addMemberResults, setAddMemberResults] = useState([]);
  const [groupBusy, setGroupBusy] = useState(false);
  const [groupError, setGroupError] = useState('');

  const chatEndRef = useRef(null);
  const myId = idOf(user);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle('db-msg-chat-open', Boolean(activeConvId));
    return () => document.body.classList.remove('db-msg-chat-open');
  }, [activeConvId]);

  // Fetch all my conversations
  const fetchConversations = async (autoSelectId = null) => {
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        // If we want to auto-select a specific conversation
        if (autoSelectId) {
          setActiveConvId(autoSelectId);
        } else if (data.length > 0 && !activeConvId) {
          // Auto-select on desktop only — phones keep the list-first app pattern
          const desktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 861px)').matches;
          if (desktop) setActiveConvId(data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching DMs:', err);
    } finally {
      setConvLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const openId = location.state?.conversationId || null;
      fetchConversations(openId);
      if (openId) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [user]);

  // Scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    const fetchMessages = async () => {
      setMsgLoading(true);
      try {
        // 1. Fetch messages
        const res = await fetch(`${API_URL}/conversations/${activeConvId}/messages`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }

        // 2. Mark as read
        await fetch(`${API_URL}/conversations/${activeConvId}/read`, { 
          method: 'PUT',
          credentials: 'include',
          headers: { ...authHeaders() },
        });

        // 3. Refresh conversations to clear unread counts on list
        fetchConversations(activeConvId);

      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setMsgLoading(false);
      }
    };

    fetchMessages();

    // Setup polling for new messages every 4 seconds (simple fallback since no WebSockets)
    const interval = setInterval(() => {
      fetchMessagesSilent();
    }, 4000);

    return () => clearInterval(interval);

  }, [activeConvId]);

  // Silent refresh messages for polling
  const fetchMessagesSilent = async () => {
    if (!activeConvId) return;
    try {
      const res = await fetch(`${API_URL}/conversations/${activeConvId}/messages`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Silent fetch failed:', err);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;

    const text = messageText.trim();
    setMessageText('');

    try {
      const res = await fetch(`${API_URL}/conversations/${activeConvId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content: text })
      });
      const newMsg = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, newMsg]);
        // Update conversation last message preview locally
        setConversations(prev => prev.map(c => {
          if (c._id === activeConvId) {
            return {
              ...c,
              lastMessage: newMsg,
              lastMessageAt: newMsg.createdAt
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Send message failed:', err);
    }
  };

  // Search Users for new conversation DMs
  useEffect(() => {
    if (!modalOpen) return;
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setSearchLoading(true);
      setModalError('');
      try {
        const res = await fetch(`${API_URL}/auth/users?search=${encodeURIComponent(searchQuery)}`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.data || []);
        } else {
          setModalError(data.message || 'Error searching users');
        }
      } catch (err) {
        console.error(err);
        setModalError('Connection error');
      } finally {
        setSearchLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchUsers();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, modalOpen]);

  const resetModal = () => {
    setModalOpen(false);
    setModalMode('pick');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUserIds([]);
    setGroupName('');
    setModalError('');
    setCreating(false);
  };

  const openNewModal = (mode = 'pick') => {
    setModalError('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUserIds([]);
    setGroupName('');
    setModalMode(mode);
    setModalOpen(true);
  };

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  // Start 1:1 immediately (WhatsApp-style: tap contact → open chat)
  const startOneToOne = async (peerId) => {
    setCreating(true);
    setModalError('');
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ memberIds: [peerId], isGroup: false }),
      });
      const data = await res.json();
      if (res.ok) {
        resetModal();
        fetchConversations(data._id);
      } else {
        setModalError(data.message || 'Could not start chat.');
      }
    } catch (err) {
      console.error(err);
      setModalError('Network error starting chat.');
    } finally {
      setCreating(false);
    }
  };

  // Create group chat
  const handleCreateGroup = async () => {
    if (selectedUserIds.length === 0) {
      setModalError('Select at least one person for the group.');
      return;
    }
    if (!groupName.trim()) {
      setModalError('Enter a group name.');
      return;
    }

    setCreating(true);
    setModalError('');
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          memberIds: selectedUserIds,
          isGroup: true,
          name: groupName.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        resetModal();
        fetchConversations(data._id);
      } else {
        setModalError(data.message || 'Failed to create group.');
      }
    } catch (err) {
      console.error(err);
      setModalError('Network error creating group.');
    } finally {
      setCreating(false);
    }
  };

  // Get other members of the chat
  const getChatPartnerName = (conv) => {
    if (conv.isGroup) return conv.name || 'Group';
    const otherMember = conv.members.find((m) => idOf(m) !== myId);
    return otherMember ? otherMember.name : 'Unknown Buddy';
  };

  const getChatPartnerAvatar = (conv) => {
    if (conv.isGroup) return '👥';
    const otherMember = conv.members.find((m) => idOf(m) !== myId);
    return otherMember?.profileImageUrl ? (
      <img src={otherMember.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      otherMember?.name?.charAt(0).toUpperCase() || 'U'
    );
  };

  const getChatPartnerOnlineStatus = (conv) => {
    if (conv.isGroup) return false;
    const otherMember = conv.members.find((m) => idOf(m) !== myId);
    return otherMember ? otherMember.isOnline : false;
  };

  /** True when every other member has this message in readBy */
  const isMessageReadByOthers = (msg, conv) => {
    if (!msg?.readBy || !conv?.members) return false;
    const readers = new Set((msg.readBy || []).map(idOf));
    const others = conv.members.map(idOf).filter((id) => id && id !== myId);
    if (others.length === 0) return true;
    return others.every((id) => readers.has(id));
  };

  const openGroupPanel = () => {
    if (!activeConv?.isGroup) return;
    setRenameValue(activeConv.name || '');
    setAddMemberQuery('');
    setAddMemberResults([]);
    setGroupError('');
    setGroupPanelOpen(true);
  };

  const handleRenameGroup = async () => {
    if (!activeConvId || !renameValue.trim()) return;
    setGroupBusy(true);
    setGroupError('');
    try {
      const res = await fetch(`${API_URL}/conversations/${activeConvId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setConversations((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      } else {
        setGroupError(data.message || 'Could not rename group');
      }
    } catch (err) {
      setGroupError('Network error renaming group');
    } finally {
      setGroupBusy(false);
    }
  };

  const handleAddMember = async (peerId) => {
    if (!activeConvId) return;
    setGroupBusy(true);
    setGroupError('');
    try {
      const res = await fetch(`${API_URL}/conversations/${activeConvId}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ memberIds: [peerId] }),
      });
      const data = await res.json();
      if (res.ok) {
        setConversations((prev) => prev.map((c) => (c._id === data._id ? data : c)));
        setAddMemberQuery('');
        setAddMemberResults([]);
      } else {
        setGroupError(data.message || 'Could not add member');
      }
    } catch (err) {
      setGroupError('Network error adding member');
    } finally {
      setGroupBusy(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeConvId) return;
    if (!window.confirm('Remove this member from the group?')) return;
    setGroupBusy(true);
    setGroupError('');
    try {
      const res = await fetch(`${API_URL}/conversations/${activeConvId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      const data = await res.json();
      if (res.ok) {
        if (data.deleted) {
          setConversations((prev) => prev.filter((c) => c._id !== activeConvId));
          setActiveConvId(null);
          setGroupPanelOpen(false);
        } else {
          setConversations((prev) => prev.map((c) => (c._id === data._id ? data : c)));
        }
      } else {
        setGroupError(data.message || 'Could not remove member');
      }
    } catch (err) {
      setGroupError('Network error removing member');
    } finally {
      setGroupBusy(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeConvId) return;
    if (!window.confirm('Leave this group?')) return;
    setGroupBusy(true);
    setGroupError('');
    try {
      const res = await fetch(`${API_URL}/conversations/${activeConvId}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      const data = await res.json();
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c._id !== activeConvId));
        setActiveConvId(null);
        setGroupPanelOpen(false);
      } else {
        setGroupError(data.message || 'Could not leave group');
      }
    } catch (err) {
      setGroupError('Network error leaving group');
    } finally {
      setGroupBusy(false);
    }
  };

  // Search users to add to group
  useEffect(() => {
    if (!groupPanelOpen) return undefined;
    if (addMemberQuery.trim().length === 0) {
      setAddMemberResults([]);
      return undefined;
    }
    const tmr = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/users?search=${encodeURIComponent(addMemberQuery)}`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        const data = await res.json();
        if (res.ok) {
          const memberSet = new Set(
            (conversations.find((c) => c._id === activeConvId)?.members || []).map(idOf)
          );
          setAddMemberResults((data.data || []).filter((u) => !memberSet.has(idOf(u))));
        }
      } catch (err) {
        console.error(err);
      }
    }, 350);
    return () => clearTimeout(tmr);
  }, [addMemberQuery, groupPanelOpen, activeConvId, conversations]);

  const activeConv = conversations.find((c) => c._id === activeConvId);

  return (
    <div style={{ height: '100dvh', display: 'flex', background: '#E8E0D4', overflow: 'hidden' }}>
      <AppSidebar />
      
      <main style={{ flexGrow: 1, fontFamily: t.fontBody, minHeight: 0, display: 'flex', minWidth: 0 }}>
        <div style={{ width: '100%', margin: '0 auto', padding: '0', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          
          {/* App-like DM shell */}
          <div
            className={`db-msg-shell${activeConvId ? ' is-chat-open' : ''}`}
            style={{
            background: t.surface,
            borderLeft: `1px solid ${t.lineStrong}`,
            flexGrow: 1,
            display: 'flex',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            
            {/* Sidebar (Left column) */}
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
            }}>
              
              {/* Header inside sidebar */}
              <div style={{ padding: '16px 18px', borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: t.ink, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: t.fontDisplay }}>
                  Messages
                </h2>
                
                <button
                  onClick={() => openNewModal('pick')}
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

              {/* Conversation list */}
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
                    {conversations.map(conv => {
                      const active = conv._id === activeConvId;
                      const partnerOnline = getChatPartnerOnlineStatus(conv);
                      const isUnread =
                        conv.lastMessage &&
                        idOf(conv.lastMessage.senderId) !== myId &&
                        !(conv.lastMessage.readBy || []).some((r) => idOf(r) === myId);

                      return (
                        <button
                          key={conv._id}
                          onClick={() => {
                            setActiveConvId(conv._id);
                            setGroupPanelOpen(false);
                          }}
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
                          {/* Avatar with online bubble */}
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
                              {getChatPartnerAvatar(conv)}
                            </div>
                            
                            {partnerOnline && (
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#22C55E', // Green online dot
                                border: `2px solid #FFFFFF`
                              }} />
                            )}
                          </div>

                          {/* Preview details */}
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: isUnread || active ? '700' : '500', color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {getChatPartnerName(conv)}
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

                          {/* Unread indicator dot */}
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

            {/* Chat Box (Right column) */}
            <div className="db-msg-chat" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: t.surface, minWidth: 0 }}>
              {activeConv ? (
                <>
                  {/* Top Bar Partner Header */}
                  <div style={{ padding: '12px 16px', borderBottom: `1.5px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <button
                        type="button"
                        className="db-msg-back"
                        onClick={() => setActiveConvId(null)}
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
                        {getChatPartnerAvatar(activeConv)}
                      </div>
                      
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getChatPartnerName(activeConv)}
                        </h3>
                        
                        {activeConv.isGroup ? (
                          <p style={{ fontSize: '10px', color: t.inkFaint, margin: 0, fontWeight: 600 }}>
                            {activeConv.members?.length || 0} members
                          </p>
                        ) : (
                          <p style={{ fontSize: '10px', color: getChatPartnerOnlineStatus(activeConv) ? '#22C55E' : t.inkFaint, margin: 0, fontWeight: '600' }}>
                            {getChatPartnerOnlineStatus(activeConv) ? 'Online' : 'Offline'}
                          </p>
                        )}
                      </div>
                    </div>

                    {activeConv.isGroup && (
                      <button
                        type="button"
                        onClick={openGroupPanel}
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

                  {/* Messages Bubble History */}
                  <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {msgLoading && messages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: t.inkSoft }}><RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto' }} /></div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => {
                          const isMe = idOf(msg.senderId) === myId;
                          const readByOthers = isMe && isMessageReadByOthers(msg, activeConv);
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
                                
                                {/* Sender name for group chats */}
                                {activeConv.isGroup && !isMe && (
                                  <span style={{ fontSize: '10px', fontWeight: '600', color: t.inkSoft, marginLeft: '4px' }}>
                                    {msg.senderId?.name}
                                  </span>
                                )}

                                {/* Message bubble */}
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

                                {/* Message Footer */}
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

                  {/* Message Input Box Footer */}
                  <form 
                    className="db-msg-composer"
                    onSubmit={handleSendMessage}
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
                      onChange={e => setMessageText(e.target.value)}
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
                      onFocus={e => e.target.style.borderColor = t.sageDeep}
                      onBlur={e => e.target.style.borderColor = t.line}
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
                      onMouseEnter={(e) => e.currentTarget.style.background = t.olive}
                      onMouseLeave={(e) => e.currentTarget.style.background = t.sageDeep}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: t.inkSoft, textAlign: 'center' }}>
                  <Inbox size={48} color={t.inkFaint} style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontFamily: t.fontDisplay, fontSize: '20px', margin: '0 0 8px 0', color: t.ink }}>Your chats</h3>
                  <p style={{ fontSize: '14px', maxWidth: '320px', margin: '0 0 18px' }}>
                    Pick a conversation on the left, or start a new 1:1 chat or group — just like WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => openNewModal('pick')}
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
              )}
            </div>

          </div>
          
        </div>
      </main>

      {/* GROUP INFO PANEL */}
      {groupPanelOpen && activeConv?.isGroup && (
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
          <div onClick={() => setGroupPanelOpen(false)} style={{ position: 'absolute', inset: 0 }} aria-hidden />
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
                onClick={() => setGroupPanelOpen(false)}
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

            {/* Rename */}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase', marginBottom: 6 }}>
              Group name
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
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
                onClick={handleRenameGroup}
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

            {/* Members */}
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
                        onClick={() => handleRemoveMember(mid)}
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

            {/* Add members */}
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase' }}>
              Add people
            </p>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
              <input
                value={addMemberQuery}
                onChange={(e) => setAddMemberQuery(e.target.value)}
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
                    onClick={() => handleAddMember(peer._id)}
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
              onClick={handleLeaveGroup}
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
      )}

      {/* NEW CHAT MODAL — WhatsApp-style */}
      {modalOpen && (
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
        }}>
          <div
            onClick={resetModal}
            style={{ position: 'absolute', inset: 0 }}
            aria-hidden
          />
          <div
            className="db-newchat-sheet"
            style={{
            position: 'relative',
            background: '#FFF',
            borderRadius: '20px 20px 0 0',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '88dvh',
            padding: '20px 20px 28px',
            boxShadow: t.shadowLifted,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Handle + header */}
            <div style={{ width: 36, height: 4, borderRadius: 999, background: t.lineStrong, margin: '0 auto 16px', flexShrink: 0 }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {modalMode !== 'pick' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalError('');
                      setSearchQuery('');
                      setSearchResults([]);
                      setSelectedUserIds([]);
                      setGroupName('');
                      setModalMode('pick');
                    }}
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
                    aria-label="Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h3 style={{ fontFamily: t.fontDisplay, fontSize: 20, margin: 0, color: t.ink }}>
                  {modalMode === 'pick' && 'New'}
                  {modalMode === 'chat' && 'New chat'}
                  {modalMode === 'group' && 'New group'}
                </h3>
              </div>
              <button
                type="button"
                onClick={resetModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: t.inkSoft,
                  lineHeight: 1,
                  padding: 4,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {modalError && (
              <div style={{ background: t.clayTint, border: `1.5px solid ${t.clay}30`, borderRadius: 10, padding: 10, color: t.clayDeep, fontSize: 12, marginBottom: 12, flexShrink: 0 }}>
                {modalError}
              </div>
            )}

            {/* Step 1: Pick New chat or New group */}
            {modalMode === 'pick' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalMode('chat')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    textAlign: 'left',
                    background: '#FAF8F5',
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
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: t.ink }}>New chat</span>
                    <span style={{ display: 'block', fontSize: 12, color: t.inkSoft, marginTop: 2 }}>Message one person (1:1)</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalMode('group')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    textAlign: 'left',
                    background: '#FAF8F5',
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
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: t.ink }}>New group</span>
                    <span style={{ display: 'block', fontSize: 12, color: t.inkSoft, marginTop: 2 }}>Chat with several people</span>
                  </span>
                </button>
              </div>
            )}

            {/* Step 2a: New chat — tap a contact to open */}
            {modalMode === 'chat' && (
              <>
                <div style={{ position: 'relative', marginBottom: 12, flexShrink: 0 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or username…"
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
                  background: '#FAF8F5',
                }}>
                  {searchLoading || creating ? (
                    <div style={{ textAlign: 'center', padding: 28, color: t.inkSoft }}>
                      <RefreshCw className="animate-spin" size={18} style={{ margin: '0 auto' }} />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p style={{ textAlign: 'center', fontSize: 13, color: t.inkFaint, margin: '28px 12px' }}>
                      {searchQuery ? 'No one found.' : 'Search for someone to message.'}
                    </p>
                  ) : (
                    searchResults.map((peer) => (
                      <button
                        key={peer._id}
                        type="button"
                        onClick={() => startOneToOne(peer._id)}
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

            {/* Step 2b: New group — select people, name, create */}
            {modalMode === 'group' && (
              <>
                <div style={{ marginBottom: 12, flexShrink: 0 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Group name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Type 1 Support"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1.5px solid ${t.line}`,
                      fontSize: 14,
                      outline: 'none',
                      fontFamily: t.fontBody,
                    }}
                  />
                </div>

                <div style={{ position: 'relative', marginBottom: 12, flexShrink: 0 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Add people…"
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
                    {selectedUserIds.length} selected
                  </p>
                )}

                <div style={{
                  flex: 1,
                  minHeight: 140,
                  maxHeight: 240,
                  overflowY: 'auto',
                  borderRadius: 12,
                  border: `1px solid ${t.line}`,
                  background: '#FAF8F5',
                  marginBottom: 14,
                }}>
                  {searchLoading ? (
                    <div style={{ textAlign: 'center', padding: 24, color: t.inkSoft }}>
                      <RefreshCw className="animate-spin" size={16} style={{ margin: '0 auto' }} />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p style={{ textAlign: 'center', fontSize: 13, color: t.inkFaint, margin: '24px 12px' }}>
                      {searchQuery ? 'No one found.' : 'Search to add members.'}
                    </p>
                  ) : (
                    searchResults.map((peer) => {
                      const selected = selectedUserIds.includes(peer._id);
                      return (
                        <button
                          key={peer._id}
                          type="button"
                          onClick={() => toggleSelectUser(peer._id)}
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
                            background: '#fff',
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
                  onClick={handleCreateGroup}
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
                  {creating ? 'Creating…' : 'Create group'}
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
      )}
    </div>
  );
}
