import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, MessageSquare, ThumbsUp, Eye, Award } from 'lucide-react';

const demoPosts = [
  {
    topic: 'Daily Life',
    topicColor: '#7D8F6F',
    title: 'Anyone else struggle with morning highs?',
    snippet: 'My fasting numbers have been climbing this week. Looking for gentle tips that actually worked for you…',
    author: 'Maya',
    replies: 24,
    likes: 18,
    views: 312,
    solved: true,
  },
  {
    topic: 'Nutrition',
    topicColor: '#C56A3E',
    title: 'Low-carb lunch ideas under 30g',
    snippet: 'Need something quick between work calls — share what you pack that keeps you steady.',
    author: 'Jordan',
    replies: 41,
    likes: 33,
    views: 580,
    solved: false,
  },
  {
    topic: 'Tech & CGM',
    topicColor: '#6B7550',
    title: 'Best CGM placement for active days?',
    snippet: 'Arm keeps catching on doors. What placement stays put during workouts?',
    author: 'Sam',
    replies: 16,
    likes: 12,
    views: 204,
    solved: false,
  },
];

const CommunityForumPreview = () => (
  <div className="relative w-full max-w-[420px] mx-auto lg:mx-0">
    <div className="absolute -inset-3 rounded-[28px] bg-black/20 blur-xl" aria-hidden />
    <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-[#F6F3EE] shadow-2xl">
      <div className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9C958B]">
            Community Forum
          </p>
          <p className="font-serif text-sm text-[#2B2A28]">Live discussions</p>
        </div>
        <span className="rounded-full bg-[#1F3A2E] px-2.5 py-1 text-[10px] font-semibold text-white">
          Preview
        </span>
      </div>

      <div className="flex gap-3 p-3">
        <aside className="hidden w-[88px] shrink-0 space-y-1.5 sm:block">
          {['All', 'Daily', 'Food', 'CGM'].map((t, i) => (
            <div
              key={t}
              className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold ${
                i === 0 ? 'bg-[#1F3A2E] text-white' : 'bg-white text-[#6B5645]'
              }`}
            >
              {t}
            </div>
          ))}
        </aside>

        <div className="min-w-0 flex-1 space-y-2">
          {demoPosts.map((post) => (
            <article
              key={post.title}
              className="rounded-xl border border-black/8 bg-white p-3 shadow-sm"
            >
              <div className="mb-1.5 flex items-center gap-2">
                {post.solved && (
                  <span className="inline-flex items-center gap-1 rounded bg-[#E8CF7A]/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#6B5645]">
                    <Award size={9} />
                    Solved
                  </span>
                )}
                <span
                  className="ml-auto rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                  style={{
                    color: post.topicColor,
                    background: `${post.topicColor}18`,
                  }}
                >
                  {post.topic}
                </span>
              </div>
              <h3 className="text-[12px] font-bold leading-snug text-[#2B2A28]">
                {post.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#6D675F]">
                {post.snippet}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[9px] font-semibold text-[#9C958B]">
                <span>{post.author}</span>
                <span className="inline-flex items-center gap-0.5">
                  <MessageSquare size={9} /> {post.replies}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <ThumbsUp size={9} /> {post.likes}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Eye size={9} /> {post.views}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CommunitySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section
      id="community"
      className="relative overflow-hidden bg-[var(--cream-soft)] px-6 py-20"
    >
      <div
        className="absolute -top-20 -left-20 h-96 w-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(168,184,154,0.18)' }}
      />
      <div
        className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(232,181,165,0.16)' }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1F3A2E] to-[#32493B] px-8 py-14 lg:grid-cols-[1fr_1.05fr] lg:px-14 lg:py-16">
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-[var(--sage)]">
              Community
            </p>

            <h2 className="max-w-xl font-serif text-4xl leading-[1.05] text-white md:text-5xl">
              Join people who{' '}
              <span className="italic text-[var(--sand)]">truly get it.</span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
              A calm space to ask questions, share experiences, and connect
              with others living with diabetes — no judgment, just genuine support.
            </p>

            <button
              onClick={() => navigate(user ? '/community' : '/login')}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[1rem] font-semibold text-[#1F3A2E] transition-all duration-300 hover:bg-[var(--sage)] hover:-translate-y-0.5"
            >
              {user ? 'Open the forum' : 'Join the community'}
              <ArrowRight size={18} />
            </button>
          </div>

          <CommunityForumPreview />
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
