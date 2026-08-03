import React from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

export default function FeedSearch({ value, onChange, onSubmit }) {
  const { t: tr } = useI18n();
  return (
    <form onSubmit={onSubmit} className="db-community-search">
      <Search size={16} className="db-community-search-icon" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={tr('community.searchPlaceholder')}
        aria-label={tr('community.searchPlaceholder')}
      />
    </form>
  );
}
