import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../../../config/api';
import { idOf } from './messageHelpers';

export default function useMessages({ user, authHeaders }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [messageText, setMessageText] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('pick');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [modalError, setModalError] = useState('');
  const [creating, setCreating] = useState(false);

  const [groupPanelOpen, setGroupPanelOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [addMemberQuery, setAddMemberQuery] = useState('');
  const [addMemberResults, setAddMemberResults] = useState([]);
  const [groupBusy, setGroupBusy] = useState(false);
  const [groupError, setGroupError] = useState('');

  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const messagesFingerprintRef = useRef('');
  const activeConvIdRef = useRef(null);
  const myId = idOf(user);

  const messagesFingerprint = (list) =>
    (list || []).map((m) => `${idOf(m)}:${m.createdAt || ''}:${(m.readBy || []).length}`).join('|');

  const isNearBottom = () => {
    const el = chatScrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const isMobileMessages = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches;

  const scrollToBottom = (smooth = true) => {
    if (!activeConvIdRef.current) return;
    chatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
  };

  const closeChat = () => {
    activeConvIdRef.current = null;
    setActiveConvId(null);
    setMessages([]);
    setGroupPanelOpen(false);
    if (isMobileMessages() && window.history.state?.diabuddyMsg) {
      window.history.replaceState({}, '');
    }
  };

  const openChat = (id) => {
    if (!id) {
      closeChat();
      return;
    }
    activeConvIdRef.current = id;
    setActiveConvId(id);
    if (isMobileMessages() && window.history.state?.diabuddyMsg !== id) {
      window.history.pushState({ diabuddyMsg: id }, '');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
    document.body.classList.toggle('db-msg-chat-open', Boolean(activeConvId));
    return () => document.body.classList.remove('db-msg-chat-open');
  }, [activeConvId]);

  // Mobile: hardware/browser back returns to conversation list, not out of Messages
  useEffect(() => {
    if (!isMobileMessages()) return undefined;
    const onPopState = () => {
      if (activeConvIdRef.current) {
        activeConvIdRef.current = null;
        setActiveConvId(null);
        setMessages([]);
        setGroupPanelOpen(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConvIdRef.current) {
          const desktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 861px)').matches;
          if (desktop) {
            activeConvIdRef.current = data[0]._id;
            setActiveConvId(data[0]._id);
          }
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
      fetchConversations();
      if (openId) {
        openChat(openId);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [user]);

  useEffect(() => {
    if (!activeConvId || !shouldStickToBottomRef.current) return;
    scrollToBottom(true);
  }, [messages, activeConvId]);

  const fetchMessagesSilent = async () => {
    const convId = activeConvIdRef.current;
    if (!convId) return;
    try {
      const res = await fetch(`${API_URL}/conversations/${convId}/messages`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        if (activeConvIdRef.current !== convId) return;
        const data = await res.json();
        const nextFp = messagesFingerprint(data);
        if (nextFp === messagesFingerprintRef.current) return;
        shouldStickToBottomRef.current = isNearBottom();
        messagesFingerprintRef.current = nextFp;
        setMessages(data);
      }
    } catch (err) {
      console.error('Silent fetch failed:', err);
    }
  };

  useEffect(() => {
    if (!activeConvId) return undefined;

    shouldStickToBottomRef.current = true;
    messagesFingerprintRef.current = '';
    const convId = activeConvId;

    const fetchMessages = async () => {
      setMsgLoading(true);
      try {
        const res = await fetch(`${API_URL}/conversations/${convId}/messages`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        if (activeConvIdRef.current !== convId) return;
        if (res.ok) {
          const data = await res.json();
          messagesFingerprintRef.current = messagesFingerprint(data);
          shouldStickToBottomRef.current = true;
          setMessages(data);
        }

        await fetch(`${API_URL}/conversations/${convId}/read`, {
          method: 'PUT',
          credentials: 'include',
          headers: { ...authHeaders() },
        });

        // Refresh list only — do NOT re-select chat (avoids reopen glitch after back)
        if (activeConvIdRef.current === convId) {
          fetchConversations();
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (activeConvIdRef.current === convId) {
          setMsgLoading(false);
        }
      }
    };

    fetchMessages();

    const interval = setInterval(() => {
      fetchMessagesSilent();
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConvId]);

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
        setMessages((prev) => {
          const next = [...prev, newMsg];
          messagesFingerprintRef.current = messagesFingerprint(next);
          return next;
        });
        shouldStickToBottomRef.current = true;
        setConversations((prev) => prev.map((c) => {
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

  const backToPick = () => {
    setModalError('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUserIds([]);
    setGroupName('');
    setModalMode('pick');
  };

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

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
        openChat(data._id);
        fetchConversations();
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
        openChat(data._id);
        fetchConversations();
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

  const activeConv = conversations.find((c) => c._id === activeConvId);

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
          closeChat();
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
        closeChat();
      } else {
        setGroupError(data.message || 'Could not leave group');
      }
    } catch (err) {
      setGroupError('Network error leaving group');
    } finally {
      setGroupBusy(false);
    }
  };

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

  return {
    conversations,
    activeConvId,
    openChat,
    closeChat,
    messages,
    convLoading,
    msgLoading,
    messageText,
    setMessageText,
    modalOpen,
    modalMode,
    setModalMode,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    selectedUserIds,
    groupName,
    setGroupName,
    modalError,
    creating,
    groupPanelOpen,
    setGroupPanelOpen,
    renameValue,
    setRenameValue,
    addMemberQuery,
    setAddMemberQuery,
    addMemberResults,
    groupBusy,
    groupError,
    chatEndRef,
    chatScrollRef,
    myId,
    activeConv,
    handleSendMessage,
    resetModal,
    openNewModal,
    backToPick,
    toggleSelectUser,
    startOneToOne,
    handleCreateGroup,
    openGroupPanel,
    handleRenameGroup,
    handleAddMember,
    handleRemoveMember,
    handleLeaveGroup,
  };
}
