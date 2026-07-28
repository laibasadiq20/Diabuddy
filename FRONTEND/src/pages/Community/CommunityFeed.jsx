import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import useCommunityFeed from './components/useCommunityFeed';
import CommunityGuidelinesBanner from './components/CommunityGuidelinesBanner';
import FeedHeader from './components/FeedHeader';
import FeedSearch from './components/FeedSearch';
import FeedFilters from './components/FeedFilters';
import DraftsBanner from './components/DraftsBanner';
import PostCard from './components/PostCard';
import FeedState from './components/FeedState';
import FeedPager from './components/FeedPager';
import CommunityFeedStyles from './components/CommunityFeedStyles';

const t = theme;

export default function CommunityFeed() {
  const { user, authHeaders } = useAuth();
  const f = useCommunityFeed({ user, authHeaders });
  const showFeed = !f.postsLoading && !f.error && f.posts.length > 0;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#E8E0D4', fontFamily: t.fontBody }}>
      <AppSidebar />

      <main style={{ flexGrow: 1, minWidth: 0, padding: '28px 24px 72px' }} className="db-community-main">
        <div className="db-community" style={{ maxWidth: 820, margin: '0 auto' }}>
          <FeedHeader
            onNewPost={() => f.navigate('/community/new-post')}
          />

          <CommunityGuidelinesBanner />

          <FeedSearch
            value={f.searchInputValue}
            onChange={(e) => f.setSearchInputValue(e.target.value)}
            onSubmit={f.handleSearchSubmit}
          />

          <FeedFilters
            sortMode={f.sortMode}
            selectedTopic={f.selectedTopic}
            topics={f.topics}
            topicsLoading={f.topicsLoading}
            onSortSelect={f.handleSortSelect}
            onTopicSelect={f.handleTopicSelect}
          />

          <DraftsBanner
            drafts={f.drafts}
            onOpenDraft={(id) => f.navigate(`/community/new-post?draft=${id}`)}
          />

          {!showFeed ? (
            <FeedState
              loading={f.postsLoading}
              error={f.error}
              empty={!f.postsLoading && !f.error && f.posts.length === 0}
              onRetry={f.clearFilters}
              onCreatePost={() => f.navigate('/community/new-post')}
            />
          ) : (
            <div className="db-community-feed">
              {f.posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  dmLoadingId={f.dmLoadingId}
                  onOpenPost={(id) => f.navigate(`/community/posts/${id}`)}
                  onOpenAuthor={(author) =>
                    f.navigate(`/users/${author._id}`, { state: { preview: author } })
                  }
                  onStartDm={f.startDm}
                />
              ))}
              <FeedPager
                currentPage={f.currentPage}
                totalPages={f.totalPages}
                onPageChange={f.handlePageChange}
              />
            </div>
          )}
        </div>
      </main>

      <CommunityFeedStyles />
    </div>
  );
}
