import React from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import ThemedSelect from '../../../components/ThemedSelect';

const SORT_OPTIONS = [
  { id: 'latest', labelKey: 'community.sortLatest' },
  { id: 'most_commented', labelKey: 'community.sortMostCommented' },
];

export default function FeedFilters({
  sortMode,
  selectedTopic,
  topics,
  topicsLoading,
  onSortSelect,
  onTopicSelect,
}) {
  const { t: tr } = useI18n();
  return (
    <div className="db-community-filters">
      <div className="db-community-filter-bar">
        <label className="db-community-sort-label" htmlFor="db-community-sort">
          {tr('community.sort')}
        </label>
        <div className="db-community-sort-wrap">
          <ThemedSelect
            id="db-community-sort"
            value={sortMode}
            onChange={onSortSelect}
            aria-label={tr('community.sort')}
            options={SORT_OPTIONS.map((opt) => ({
              value: opt.id,
              label: tr(opt.labelKey),
            }))}
          />
        </div>
      </div>

      <div className="db-community-topics" role="tablist" aria-label={tr('nav.topics')}>
        <button
          type="button"
          role="tab"
          aria-selected={selectedTopic === ''}
          className={`db-topic-chip${selectedTopic === '' ? ' is-active' : ''}`}
          onClick={() => onTopicSelect('')}
        >
          {tr('community.topicsAll')}
        </button>
        {!topicsLoading &&
          topics.map((topic) => (
            <button
              key={topic._id}
              type="button"
              role="tab"
              aria-selected={selectedTopic === topic._id}
              className={`db-topic-chip${selectedTopic === topic._id ? ' is-active' : ''}`}
              onClick={() => onTopicSelect(topic._id)}
            >
              {topic.name}
            </button>
          ))}
      </div>
    </div>
  );
}
