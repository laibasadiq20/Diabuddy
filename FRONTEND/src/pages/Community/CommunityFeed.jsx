import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import Navbar from '../../components/Navbar';
import useCommunityFeed from './components/useCommunityFeed';
import CommunityGuidelinesBanner from './components/CommunityGuidelinesBanner';
import FeedHeader from './components/FeedHeader';
import FeedSearch from './components/FeedSearch';
import FeedFilters from './components/FeedFilters';
import DraftsBanner from './components/DraftsBanner';
import PostCard from './components/PostCard';
import FeedState from './components/FeedState';
import FeedPager from './components/FeedPager';
import AuthPromptModal from './components/AuthPromptModal';
import CommunityFeedStyles from './components/CommunityFeedStyles';
import { Sparkles, Users, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const t = theme;

export default function CommunityFeed() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const f = useCommunityFeed({ user, authHeaders });
  const [authModal, setAuthModal] = useState({ open: false, action: '' });

  const showFeed = !f.postsLoading && !f.error && f.posts.length > 0;
  
  // Public preview: Non-logged-in visitors see first 5 posts
  const displayPosts = user ? f.posts : f.posts.slice(0, 5);
  const isPublicPreview = !user && showFeed;

  const handleNewPostClick = () => {
    if (!user) {
      setAuthModal({ open: true, action: 'create a new post' });
      return;
    }
    f.navigate('/community/new-post');
  };

  const handleRequireAuth = (actionName) => {
    setAuthModal({ open: true, action: actionName });
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: t.pageFadeTop, fontFamily: t.fontBody }}>
      {/* If logged in, show AppSidebar. If logged out visitor, show top public Navbar */}
      {user ? (
        <div style={{ display: 'flex', flexGrow: 1, minHeight: '100dvh' }}>
          <AppSidebar />
          <main style={{ flexGrow: 1, minWidth: 0, padding: '28px 24px 72px' }} className="db-community-main">
            {renderFeedContent()}
          </main>
        </div>
      ) : (
        <div className="w-full flex flex-col flex-grow">
          <Navbar />
          
          {/* Visitor Public Preview Banner */}
          <div className="bg-[#182C1E] text-white px-4 py-3 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-[#8DB496]" />
            <span>You are viewing the <strong>Community Public Preview</strong> (First 5 posts).</span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="underline font-bold text-[#8DB496] hover:text-white ml-1 cursor-pointer"
            >
              Sign Up Free for Full Access →
            </button>
          </div>

          <main style={{ flexGrow: 1, minWidth: 0, padding: '28px 16px 72px' }} className="db-community-main">
            {renderFeedContent()}
          </main>
        </div>
      )}

      {/* Auth Prompt Pop-up Modal for Logged-Out Actions */}
      <AuthPromptModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, action: '' })}
        actionName={authModal.action}
      />

      <CommunityFeedStyles />
    </div>
  );

  function renderFeedContent() {
    return (
      <div className="db-community" style={{ maxWidth: 820, margin: '0 auto' }}>
        <FeedHeader onNewPost={handleNewPostClick} />

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

        {user && (
          <DraftsBanner
            drafts={f.drafts}
            onOpenDraft={(id) => f.navigate(`/community/new-post?draft=${id}`)}
          />
        )}

        {!showFeed ? (
          <FeedState
            loading={f.postsLoading}
            error={f.error}
            empty={!f.postsLoading && !f.error && f.posts.length === 0}
            onRetry={f.retryFeed}
            onCreatePost={handleNewPostClick}
          />
        ) : (
          <div className="db-community-feed space-y-4">
            {displayPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                user={user}
                dmLoadingId={f.dmLoadingId}
                onOpenPost={(id) => f.navigate(`/community/posts/${id}`)}
                onOpenAuthor={(author) => {
                  if (!user) {
                    handleRequireAuth('view member profiles');
                    return;
                  }
                  f.navigate(`/users/${author._id}`, { state: { preview: author } });
                }}
                onStartDm={(author) => {
                  if (!user) {
                    navigate('/register');
                    return;
                  }
                  const authorId = author?._id || author;
                  f.startDm(authorId);
                }}
              />
            ))}

            {/* 🌟 SOFT SIGN UP GATE FOR LOGGED-OUT VISITORS AFTER 5 POSTS */}
            {isPublicPreview && (
              <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#E7DFCE] bg-white/95 p-6 sm:p-9 text-center shadow-lg backdrop-blur-md">
                {/* Soft gradient background tint */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(141, 180, 150, 0.3), transparent 70%)',
                  }}
                />

                <div className="relative z-10 mx-auto max-w-lg">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DFE8DC] text-[#2E6B3E]">
                    <Lock size={22} />
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E2A24] tracking-tight">
                    Join DiaBuddy to read more
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#5F5446] font-medium">
                    You've reached the end of the public preview. Sign up in 30 seconds to unlock all community discussions, Pakistani recipes, and peer advice.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#182C1E] hover:bg-[#0E1B12] text-white px-7 py-3.5 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <span>Sign Up Free (Instant Access)</span>
                      <ArrowRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-white hover:bg-white/80 border border-[#E8E2D9] text-[#1E2A24] px-6 py-3.5 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      Already have an account? Sign In
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pager is only shown for logged in users */}
            {user && (
              <FeedPager
                currentPage={f.currentPage}
                totalPages={f.totalPages}
                onPageChange={f.handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}
