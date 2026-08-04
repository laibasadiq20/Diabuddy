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

      <div className="db-community-topics db-community-topics--desktop" role="tablist" aria-label={tr('nav.topics')}>
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

      <div className="db-community-topics--mobile">
        <label className="db-community-sort-label" htmlFor="db-community-topic-select" style={{ display: 'block', marginBottom: 6 }}>
          {tr('nav.topics') || 'Topic'}
        </label>
        <ThemedSelect
          id="db-community-topic-select"
          value={selectedTopic}
          onChange={onTopicSelect}
          options={[
            { value: '', label: tr('community.topicsAll') },
            ...(!topicsLoading ? topics.map((t) => ({ value: t._id, label: t.name })) : []),
          ]}
        />
      </div>
    </div>
  );
}
