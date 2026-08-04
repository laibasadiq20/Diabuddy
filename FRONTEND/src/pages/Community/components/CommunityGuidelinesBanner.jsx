import React from 'react';
import { theme } from '../../../theme';
import { useI18n } from '../../../i18n/I18nContext';

const t = theme;

export default function CommunityGuidelinesBanner() {
  const { t: tr } = useI18n();
  return (
    <div
      className="db-community-guidelines"
      style={{
        background: t.sageTint,
        border: `1.5px solid ${t.lineStrong}`,
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 10,
        fontSize: 13,
        lineHeight: 1.65,
        color: t.inkSoft,
        fontWeight: 500,
      }}
    >
      {tr('community.guidelines')}
    </div>
  );
}
