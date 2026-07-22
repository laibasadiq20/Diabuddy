import React from 'react';

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
      <div className="db-community-sort" role="tablist" aria-label="Sort posts">
        {[
          { id: 'latest', label: 'Latest' },
          { id: 'most_commented', label: 'Most commented' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={sortMode === opt.id}
            className={`db-sort-chip${sortMode === opt.id ? ' is-active' : ''}`}
            onClick={() => onSortSelect(opt.id)}
          >
            {opt.label}
          </button>
        ))}
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
