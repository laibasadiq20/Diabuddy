import React from 'react';
import { useI18n } from '../../../i18n/I18nContext';

export default function FeedPager({ currentPage, totalPages, onPageChange }) {
  const { t: tr } = useI18n();
  if (totalPages <= 1) return null;

  return (
    <div className="db-community-pager">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {tr('community.pagerPrevious')}
      </button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {tr('community.pagerNext')}
      </button>
    </div>
  );
}
