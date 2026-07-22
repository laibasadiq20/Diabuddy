import React from 'react';
import { Search } from 'lucide-react';

export default function FeedSearch({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="db-community-search">
      <Search size={16} className="db-community-search-icon" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search discussions…"
        aria-label="Search discussions"
      />
    </form>
  );
}
