import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import { ArrowRight, Sunrise, Salad, Activity } from 'lucide-react';

const CommunitySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t: tr } = useI18n();

  const topics = [
    { icon: Sunrise, text: tr('landing.community.topic1') },
    { icon: Salad, text: tr('landing.community.topic2') },
    { icon: Activity, text: tr('landing.community.topic3') },
  ];

  return (
    <section
      id="community"
      className="relative overflow-hidden bg-[var(--cream-soft)] px-4 py-16 sm:px-6 sm:py-20"
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
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1F3A2E] to-[#32493B] px-5 py-10 sm:rounded-[36px] sm:px-8 sm:py-12 lg:px-14 lg:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
            <div>
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.25em] text-[var(--sage)] sm:mb-4">
                {tr('landing.community.kicker')}
              </p>

              <h2 className="max-w-xl font-serif text-[2rem] leading-[1.1] text-white sm:text-4xl md:text-5xl md:leading-[1.05]">
                {tr('landing.community.headingStart')}{' '}
                <span className="italic text-[var(--sand)]">{tr('landing.community.headingEmphasis')}</span>
              </h2>

              <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-white/75 sm:mt-5 sm:text-base">
                {tr('landing.community.subtitle')}
              </p>

              <button
                onClick={() => navigate(user ? '/community' : '/register')}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[0.95rem] font-semibold text-[#1F3A2E] transition-all duration-300 hover:bg-[var(--sage)] hover:-translate-y-0.5 sm:mt-8 sm:w-auto"
              >
                {user ? tr('landing.community.openForum') : tr('landing.community.signUpToJoin')}
                <ArrowRight size={17} />
              </button>
            </div>

            {/* Sample discussion topics — not user quotes, just a preview of forum topics */}
            <div className="flex flex-col gap-2.5">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                {tr('landing.community.topicsKicker')}
              </p>
              {topics.map((topic, i) => {
                const Icon = topic.icon;
                return (
                  <div
                    key={topic.text}
                    className={[
                      'flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3.5 py-3 backdrop-blur-sm',
                      i === 1 ? 'lg:ml-5' : '',
                      i === 2 ? 'lg:ml-2' : '',
                    ].join(' ')}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--sand)] text-[#1F3A2E]">
                      <Icon size={16} strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] leading-snug text-white/80 sm:text-[13px]">
                        {topic.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
