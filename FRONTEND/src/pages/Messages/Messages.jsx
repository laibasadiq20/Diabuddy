import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import Navbar from '../../components/Navbar';
import { API_URL } from '../../config/api';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  UserPlus, 
  RefreshCw,
  Clock,
  Sparkles,
  Inbox,
  CheckCheck
} from 'lucide-react';

const t = theme;

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Conversations & Messages State
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [messageText, setMessageText] = useState('');

  // New Chat Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [modalError, setModalError] = useState('');

  const chatEndRef = useRef(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  // Fetch all my conversations
  const fetchConversations = async (autoSelectId = null) => {
    try {
      const res = await fetch(`${API_URL}/conversations`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        // If we want to auto-select a specific conversation
        if (autoSelectId) {
          setActiveConvId(autoSelectId);
        } else if (data.length > 0 && !activeConvId) {
          // don't auto select on mobile, but on desktop we can select the first
          setActiveConvId(data[0]._id);
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
      fetchConversations();
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
        const res = await fetch(`${API_URL}/conversations/${activeConvId}/messages`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }

        // 2. Mark as read
        await fetch(`${API_URL}/conversations/${activeConvId}/read`, { 
          method: 'PUT',
          credentials: 'include' 
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
      const res = await fetch(`${API_URL}/conversations/${activeConvId}/messages`, { credentials: 'include' });
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
        headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`${API_URL}/auth/users?search=${encodeURIComponent(searchQuery)}`, { credentials: 'include' });
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

  const toggleSelectUser = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Create Conversation
  const handleCreateConversation = async () => {
    if (selectedUserIds.length === 0) {
      setModalError('Please select at least one user to message.');
      return;
    }
    if (isGroup && !groupName.trim()) {
      setModalError('Please enter a name for the group chat.');
      return;
    }

    setSearchLoading(true);
    setModalError('');

    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberIds: selectedUserIds,
          isGroup: isGroup || selectedUserIds.length > 1,
          name: isGroup ? groupName.trim() : undefined
        })
      });
      const data = await res.json();

      if (res.ok) {
        setModalOpen(false);
        // Clear search inputs
        setSearchQuery('');
        setSelectedUserIds([]);
        setGroupName('');
        setIsGroup(false);
        // Load conversations and auto-select new chat
        fetchConversations(data._id);
      } else {
        setModalError(data.message || 'Failed to start conversation.');
      }
    } catch (err) {
      console.error(err);
      setModalError('Network error starting conversation.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Get other members of the chat
  const getChatPartnerName = (conv) => {
    if (conv.isGroup) return conv.name || 'Group Discussion';
    const otherMember = conv.members.find(m => m._id !== user?.id);
    return otherMember ? otherMember.name : 'Unknown Buddy';
  };

  const getChatPartnerAvatar = (conv) => {
    if (conv.isGroup) return '👥';
    const otherMember = conv.members.find(m => m._id !== user?.id);
    return otherMember?.profileImageUrl ? (
      <img src={otherMember.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      otherMember?.name?.charAt(0).toUpperCase() || 'U'
    );
  };

  const getChatPartnerOnlineStatus = (conv) => {
    if (conv.isGroup) return false;
    const otherMember = conv.members.find(m => m._id !== user?.id);
    return otherMember ? otherMember.isOnline : false;
  };

  const activeConv = conversations.find(c => c._id === activeConvId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F4F1EC', overflow: 'hidden' }}>
      <Navbar />
      
      <main style={{ flexGrow: 1, paddingTop: '76px', fontFamily: t.fontBody, minHeight: 0, display: 'flex' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          
          {/* App-like DM shell — edge to edge under navbar */}
          <div style={{
            background: t.surface,
            borderTop: `1px solid ${t.line}`,
            flexGrow: 1,
            display: 'flex',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            
            {/* Sidebar (Left column) */}
            <div style={{ 
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
                  onClick={() => {
                    setModalError('');
                    setModalOpen(true);
                  }}
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
                    <p style={{ fontSize: '13px', margin: 0 }}>No conversations yet. Click "New" to start a secure chat.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {conversations.map(conv => {
                      const active = conv._id === activeConvId;
                      const partnerOnline = getChatPartnerOnlineStatus(conv);
                      const isUnread = conv.lastMessage && !conv.lastMessage.readBy.includes(user?.id);

                      return (
                        <button
                          key={conv._id}
                          onClick={() => setActiveConvId(conv._id)}
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
                              {conv.lastMessage?.content || 'Started a new discussion'}
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
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: t.surface }}>
              {activeConv ? (
                <>
                  {/* Top Bar Partner Header */}
                  <div style={{ padding: '16px 24px', borderBottom: `1.5px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                        overflow: 'hidden'
                      }}>
                        {getChatPartnerAvatar(activeConv)}
                      </div>
                      
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.ink, margin: 0 }}>
                          {getChatPartnerName(activeConv)}
                        </h3>
                        
                        {!activeConv.isGroup && (
                          <p style={{ fontSize: '10px', color: getChatPartnerOnlineStatus(activeConv) ? '#22C55E' : t.inkFaint, margin: 0, fontWeight: '600' }}>
                            {getChatPartnerOnlineStatus(activeConv) ? 'Online' : 'Offline'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages Bubble History */}
                  <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {msgLoading && messages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: t.inkSoft }}><RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto' }} /></div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => {
                          const isMe = msg.senderId?._id === user?.id;
                          return (
                            <div 
                              key={msg._id || idx}
                              style={{
                                display: 'flex',
                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                                width: '100%'
                              }}
                            >
                              <div style={{ display: 'flex', gap: '8px', maxWidth: '70%', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                
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
                                  {isMe && <CheckCheck size={11} color={t.sage} />}
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
                    onSubmit={handleSendMessage}
                    style={{ 
                      padding: '16px 24px', 
                      borderTop: `1.5px solid ${t.line}`, 
                      display: 'flex', 
                      gap: '12px',
                      background: t.surfaceRaised
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
                  <h3 style={{ fontFamily: t.fontDisplay, fontSize: '20px', margin: '0 0 8px 0', color: t.ink }}>Start a discussion</h3>
                  <p style={{ fontSize: '14px', maxWidth: '320px', margin: 0 }}>
                    Select an active conversation on the left, or compose a new chat to exchange logs & health updates.
                  </p>
                </div>
              )}
            </div>

          </div>
          
        </div>
      </main>

      {/* NEW CHAT MODAL */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          fontFamily: t.fontBody
        }}>
          <div style={{
            background: '#FFF',
            border: `2.5px solid ${t.ink}`,
            borderRadius: '24px',
            width: '90%',
            maxWidth: '460px',
            padding: '28px',
            boxShadow: t.shadowLifted
          }}>
            <h3 style={{ fontFamily: t.fontDisplay, fontSize: '22px', margin: '0 0 16px 0', color: t.ink }}>
              Start Discussion / Chat
            </h3>

            {modalError && (
              <div style={{ background: t.clayTint, border: `1.5px solid ${t.clay}30`, borderRadius: '8px', padding: '10px', color: t.clayDeep, fontSize: '12px', marginBottom: '12px' }}>
                {modalError}
              </div>
            )}

            {/* Chat Type Toggles */}
            <div style={{ display: 'flex', gap: '8px', background: t.bg, padding: '4px', borderRadius: '10px', marginBottom: '16px', border: `1px solid ${t.line}` }}>
              <button
                type="button"
                onClick={() => {
                  setIsGroup(false);
                  setSelectedUserIds([]);
                  setGroupName('');
                }}
                style={{
                  flex: 1,
                  background: !isGroup ? '#FFFFFF' : 'none',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: !isGroup ? t.ink : t.inkSoft,
                  cursor: 'pointer',
                  boxShadow: !isGroup ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                1:1 Chat
              </button>
              <button
                type="button"
                onClick={() => setIsGroup(true)}
                style={{
                  flex: 1,
                  background: isGroup ? '#FFFFFF' : 'none',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isGroup ? t.ink : t.inkSoft,
                  cursor: 'pointer',
                  boxShadow: isGroup ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Group Chat
              </button>
            </div>

            {/* Group Name Field */}
            {isGroup && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Group Name
                </label>
                <input 
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="e.g. Type 1 Support Group"
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1.5px solid ${t.line}`,
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            {/* User Search Input */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', marginBottom: '6px' }}>
                Search Peers / Professionals
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type name, username or email..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px 10px 34px',
                    borderRadius: '8px',
                    border: `1.5px solid ${t.line}`,
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* User Search Results */}
            <div style={{ 
              maxHeight: '180px', 
              overflowY: 'auto', 
              border: `1.5px solid ${t.line}`, 
              borderRadius: '10px',
              padding: '8px',
              background: t.bg,
              marginBottom: '20px'
            }}>
              {searchLoading ? (
                <div style={{ textAlign: 'center', padding: '12px', color: t.inkSoft }}><RefreshCw className="animate-spin" size={16} style={{ margin: '0 auto' }} /></div>
              ) : searchResults.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '12px', color: t.inkFaint, margin: '8px 0' }}>
                  {searchQuery ? 'No matching peers found.' : 'Type query to find peers.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {searchResults.map(peer => {
                    const selected = selectedUserIds.includes(peer._id);
                    return (
                      <button
                        key={peer._id}
                        type="button"
                        onClick={() => toggleSelectUser(peer._id)}
                        style={{
                          background: selected ? t.sageSoft : '#FFFFFF',
                          border: `1px solid ${selected ? t.sageDeep : t.line}`,
                          borderRadius: '8px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%'
                        }}
                      >
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          background: t.sageSoft, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: '700',
                          color: t.sageDeep,
                          overflow: 'hidden'
                        }}>
                          {peer.profileImageUrl ? <img src={peer.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : peer.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div style={{ flexGrow: 1 }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: t.ink }}>
                            {peer.name}
                          </span>
                          <span style={{ fontSize: '11px', color: t.inkSoft, marginLeft: '6px' }}>
                            @{peer.username}
                          </span>
                        </div>
                        
                        <input 
                          type="checkbox"
                          checked={selected}
                          readOnly
                          style={{ accentColor: t.sageDeep }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Counter */}
            <p style={{ fontSize: '12px', color: t.inkSoft, margin: '0 0 20px 0', fontWeight: '500' }}>
              Selected peers: {selectedUserIds.length}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedUserIds([]);
                  setSearchQuery('');
                  setGroupName('');
                  setIsGroup(false);
                }}
                style={{
                  background: 'none',
                  border: `1px solid ${t.line}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateConversation}
                disabled={selectedUserIds.length === 0}
                style={{
                  background: selectedUserIds.length > 0 ? t.sageDeep : t.lineStrong,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: selectedUserIds.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
