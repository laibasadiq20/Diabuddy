import React from 'react';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'most_commented', label: 'Most commented' },
];

export default function FeedFilters({
  sortMode,
  selectedTopic,
  topics,
  topicsLoading,
  onSortSelect,
  onTopicSelect,
}) {
  return (
    <div className="db-community-filters">
      <div className="db-community-filter-bar">
        <label className="db-community-sort-label" htmlFor="db-community-sort">
          Sort
        </label>
        <div className="db-community-sort-wrap">
          <select
            id="db-community-sort"
            className="db-community-sort-select"
            value={sortMode}
            onChange={(e) => onSortSelect(e.target.value)}
            aria-label="Sort posts"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="db-community-sort-chevron" aria-hidden />
        </div>
      </div>

      <div className="db-community-topics" role="tablist" aria-label="Topics">
        <button
          type="button"
          role="tab"
          aria-selected={selectedTopic === ''}
          className={`db-topic-chip${selectedTopic === '' ? ' is-active' : ''}`}
          onClick={() => onTopicSelect('')}
        >
          All
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
