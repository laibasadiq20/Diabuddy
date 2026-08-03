import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../../config/api';
import { useI18n } from '../../../i18n/I18nContext';

export default function useCommunityFeed({ user, authHeaders }) {
  const navigate = useNavigate();
  const { t: tr } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dmLoadingId, setDmLoadingId] = useState(null);

  const selectedTopic = searchParams.get('topic') || '';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortMode = (() => {
    const s = searchParams.get('sort') || 'latest';
    return s === 'most_commented' ? 'most_commented' : 'latest';
  })();

  const [searchInputValue, setSearchInputValue] = useState(searchQuery);
  const [totalPages, setTotalPages] = useState(1);
  const [drafts, setDrafts] = useState([]);
  // Bumped by retryFeed() so "Try again" can force a refetch even when filters
  // (which the fetch effect already depends on) haven't changed.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_URL}/topics`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/mine/drafts`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        if (res.ok) {
          const data = await res.json();
          setDrafts(data.drafts || []);
        }
      } catch (err) {
        console.error('Error fetching drafts:', err);
      }
    };
    fetchDrafts();
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      setPostsLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams({
          sort: sortMode,
          page: currentPage.toString(),
          limit: '10',
        });
        if (selectedTopic) queryParams.append('topic', selectedTopic);
        if (searchQuery) queryParams.append('search', searchQuery);

        const res = await fetch(`${API_URL}/posts?${queryParams.toString()}`, {
          credentials: 'include',
          headers: { ...authHeaders() },
        });
        const data = await res.json();

        if (res.ok) {
          setPosts(data.posts || []);
          setTotalPages(data.pages || 1);
        } else {
          setError(data.message || tr('community.state.errors.loadFailed'));
        }
      } catch (err) {
        setError(tr('community.state.errors.networkError'));
        console.error(err);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, searchQuery, currentPage, sortMode, refreshKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchInputValue.trim()) {
        prev.set('search', searchInputValue.trim());
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleTopicSelect = (topicId) => {
    setSearchParams((prev) => {
      if (topicId) {
        prev.set('topic', topicId);
      } else {
        prev.delete('topic');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSortSelect = (sort) => {
    setSearchParams((prev) => {
      if (sort && sort !== 'latest') {
        prev.set('sort', sort);
      } else {
        prev.delete('sort');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (pageNum) => {
    setSearchParams((prev) => {
      prev.set('page', pageNum.toString());
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchInputValue('');
    setSearchParams({});
  };

  // Refetches the feed as-is (same filters/page) — used by the error state's
  // "Try again", which should retry the failed request rather than reset filters.
  const retryFeed = () => setRefreshKey((k) => k + 1);

  const startDm = async (author, e) => {
    e?.stopPropagation?.();
    if (!author?._id) return;
    const myId = String(user?.id || user?._id || '');
    if (myId && String(author._id) === myId) return;

    setDmLoadingId(author._id);
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ memberIds: [String(author._id)], isGroup: false }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/messages', { state: { conversationId: data._id } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDmLoadingId(null);
    }
  };

  return {
    posts,
    topics,
    topicsLoading,
    postsLoading,
    error,
    dmLoadingId,
    selectedTopic,
    currentPage,
    sortMode,
    searchInputValue,
    setSearchInputValue,
    totalPages,
    drafts,
    handleSearchSubmit,
    handleTopicSelect,
    handleSortSelect,
    handlePageChange,
    clearFilters,
    retryFeed,
    startDm,
    navigate,
  };
}
