import React from 'react';
import { theme } from '../../../theme';

const t = theme;

export default function CommunityGuidelinesBanner() {
  return (
    <div
      className="db-community-guidelines"
      style={{
        background: t.sageTint,
        border: `1.5px solid ${t.lineStrong}`,
        borderRadius: 10,
        padding: '8px 12px',
        marginBottom: 10,
        fontSize: 12,
        lineHeight: 1.4,
        color: t.inkSoft,
        fontWeight: 500,
      }}
    >
      Peer support only; never treat peer posts as medical advice; for emergencies contact
      local emergency services / your clinician.
    </div>
  );
}
