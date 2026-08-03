import React from 'react';
import { theme } from '../../../theme';

const t = theme;

export default function CommunityFeedStyles() {
  return (
    <style>{`
        .db-community-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }
        @media (max-width: 640px) {
          .db-community-main {
            padding: 18px 14px 88px !important;
          }
        }
        .db-community-title {
          font-family: ${t.fontDisplay};
          font-size: clamp(24px, 4vw, 32px);
          margin: 0;
          font-weight: 500;
          color: ${t.ink};
          letter-spacing: -0.02em;
        }
        .db-community-lead {
          color: ${t.inkSoft};
          font-size: 13px;
          margin: 4px 0 0;
          max-width: 42ch;
          line-height: 1.4;
          font-weight: 500;
        }
        .db-community-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .db-community-cta {
          background: ${t.forest};
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 8px 18px rgba(22, 33, 25, 0.18);
          font-family: ${t.fontBody};
          white-space: nowrap;
          flex-shrink: 0;
        }
        .db-community-cta--ghost {
          background: ${t.surface};
          color: ${t.forest};
          border: 1.5px solid ${t.forest};
          box-shadow: none;
        }
        .db-community-search {
          position: relative;
          margin-bottom: 10px;
        }
        .db-community-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: ${t.inkSoft};
          pointer-events: none;
        }
        .db-community-search input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px 10px 38px;
          background: ${t.surfaceSunken};
          border: 1.5px solid ${t.lineStrong};
          border-radius: 10px;
          font-size: 14px;
          color: ${t.ink};
          font-weight: 500;
          outline: none;
          font-family: ${t.fontBody};
        }
        .db-community-search input:focus {
          border-color: ${t.forest};
        }
        .db-community-filters {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
          padding: 10px 12px;
          background: ${t.surface};
          border: 1.5px solid ${t.lineStrong};
          border-radius: 12px;
        }
        .db-community-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid ${t.line};
        }
        .db-community-sort-label {
          font-size: 12px;
          font-weight: 700;
          color: ${t.inkFaint};
          letter-spacing: 0.04em;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .db-community-sort-wrap {
          position: relative;
          min-width: 0;
          flex: 0 1 auto;
          max-width: 240px;
        }
        .db-drafts-banner {
          background: ${t.surface};
          border: 1.5px dashed ${t.lineStrong};
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 14px;
        }
        .db-drafts-banner p {
          margin: 0 0 8px;
          font-size: 13px;
          color: ${t.inkSoft};
        }
        .db-drafts-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .db-drafts-list button {
          border: 1px solid ${t.forest};
          background: transparent;
          color: ${t.forest};
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-community-topics {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          margin-bottom: 0;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .db-community-topics::-webkit-scrollbar { display: none; }
        .db-topic-chip {
          flex: 0 0 auto;
          border: 1.5px solid ${t.lineStrong};
          background: ${t.surface};
          color: ${t.inkSoft};
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .db-topic-chip.is-active {
          background: ${t.forest};
          border-color: ${t.forest};
          color: #fff;
        }
        .db-community-feed {
          display: flex;
          flex-direction: column;
          background: ${t.surface};
          border: 1.5px solid ${t.lineStrong};
          border-radius: 14px;
          overflow: hidden;
        }
        .db-post-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px 16px;
          align-items: start;
          background: ${t.surface};
          border: none;
          border-bottom: 1px solid ${t.line};
          border-radius: 0;
          padding: 12px 14px;
          cursor: pointer;
          box-shadow: none;
          transition: background 0.12s ease;
          outline: none;
        }
        .db-post-card:last-of-type {
          border-bottom: none;
        }
        .db-post-card:focus-visible {
          background: ${t.sageTint};
          box-shadow: inset 0 0 0 2px ${t.forest};
        }
        @media (hover: hover) and (pointer: fine) {
          .db-post-card:hover {
            background: ${t.surfaceSunken};
          }
        }
        .db-post-card-main {
          min-width: 0;
        }
        .db-post-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          margin-bottom: 4px;
        }
        .db-post-badges {
          display: inline-flex;
          flex-shrink: 0;
          gap: 4px;
        }
        .db-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          padding: 0;
          border-radius: 4px;
        }
        .db-badge--pin { color: ${t.sageDeep}; background: ${t.sageTint}; }
        .db-badge--lock { color: ${t.clayDeep}; background: ${t.clayTint}; }
        .db-badge--solved { color: ${t.gold}; background: ${t.goldTint}; }
        .db-post-topic {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 4px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .db-post-topic--desktop {
          margin-left: auto;
        }
        .db-post-topic--mobile {
          display: none;
        }
        .db-post-title {
          font-size: 15px;
          color: ${t.ink};
          font-weight: 600;
          margin: 0;
          font-family: ${t.fontBody};
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          flex: 1;
        }
        .db-post-excerpt {
          font-size: 13px;
          color: ${t.inkSoft};
          margin: 0 0 6px;
          line-height: 1.4;
          font-weight: 500;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .db-post-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          flex-wrap: wrap;
        }
        .db-post-meta-sep {
          color: ${t.inkFaint};
          font-size: 12px;
          line-height: 1;
        }
        .db-post-author {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }
        .db-post-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${t.sageSoft};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: ${t.sageDeep};
          overflow: hidden;
          flex-shrink: 0;
        }
        .db-post-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .db-post-author-name {
          font-size: 12px;
          font-weight: 600;
          color: ${t.ink};
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-post-date {
          font-size: 12px;
          color: ${t.inkFaint};
          margin: 0;
          white-space: nowrap;
        }
        .db-post-aside {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .db-post-stats {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          color: ${t.inkSoft};
          font-size: 12px;
          white-space: nowrap;
        }
        .db-post-stats span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          min-width: 2.25rem;
        }
        .db-post-dm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: 1px solid ${t.forest};
          background: ${t.forest};
          color: #fff;
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
          line-height: 1;
        }
        .db-post-dm:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .db-community-state {
          background: ${t.surface};
          border: 1.5px solid ${t.lineStrong};
          border-radius: 20px;
          padding: 48px 24px;
          text-align: center;
          color: ${t.inkSoft};
          box-shadow: ${t.shadowCard};
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .db-community-state .db-community-cta {
          width: auto;
        }
        .db-community-state h3 {
          font-family: ${t.fontDisplay};
          font-size: 20px;
          margin: 12px 0 8px;
          color: ${t.ink};
          font-weight: 500;
        }
        .db-community-state p { margin: 0 0 20px; font-size: 14px; }
        .db-community-state--empty p {
          max-width: 36ch;
          margin-left: auto;
          margin-right: auto;
        }
        .db-community-first-tips {
          list-style: none;
          margin: 0 0 20px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 360px;
          text-align: left;
        }
        .db-community-first-tips li {
          font-size: 13px;
          color: ${t.inkSoft};
          background: ${t.surfaceSunken};
          border-radius: 10px;
          padding: 10px 12px;
          line-height: 1.4;
          font-weight: 500;
        }
        .db-community-state--error {
          background: ${t.clayTint};
          border-color: ${t.clay}30;
          color: ${t.clayDeep};
        }
        .db-community-state--error button {
          background: ${t.clay};
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .db-community-pager {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin: 0;
          padding: 10px 14px;
          border-top: 1px solid ${t.line};
          background: ${t.surfaceRaised};
        }
        .db-community-pager button {
          background: ${t.surface};
          border: 1.5px solid ${t.lineStrong};
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
          color: ${t.ink};
          font-family: ${t.fontBody};
          font-weight: 600;
        }
        .db-community-pager button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .db-community-pager span {
          font-size: 13px;
          color: ${t.inkSoft};
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .db-community-header {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            margin-bottom: 12px;
          }
          .db-community-title {
            font-size: 1.45rem;
          }
          .db-community-lead {
            font-size: 13px;
            max-width: none;
          }
          .db-community-actions {
            flex-direction: row;
            width: 100%;
          }
          .db-community-cta {
            width: 100%;
            padding: 11px 14px;
            border-radius: 12px;
            justify-content: center;
          }
          .db-community-search input {
            font-size: 16px;
            padding: 11px 12px 11px 38px;
            border-radius: 12px;
          }
          .db-community-filters {
            padding: 10px;
            gap: 8px;
            border-radius: 12px;
          }
          .db-community-filter-bar {
            padding-bottom: 8px;
          }
          .db-community-sort-wrap {
            max-width: none;
            flex: 1;
          }
          .db-community-topics {
            margin: 0 -2px;
            padding: 0 2px 2px;
          }
          .db-drafts-banner {
            padding: 10px 12px;
          }
          .db-drafts-list {
            flex-direction: column;
          }
          .db-drafts-list button {
            width: 100%;
            text-align: left;
            border-radius: 10px;
          }
          .db-community-feed {
            border-radius: 12px;
          }
          .db-post-card {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 12px;
          }
          .db-post-title-row {
            align-items: flex-start;
            margin-bottom: 6px;
          }
          .db-post-title {
            font-size: 15px;
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.35;
          }
          .db-post-topic--desktop {
            display: none;
          }
          .db-post-topic--mobile {
            display: inline-flex;
            margin-left: 2px;
          }
          .db-post-excerpt {
            -webkit-line-clamp: 2;
            margin-bottom: 8px;
          }
          .db-post-aside {
            width: 100%;
            align-items: stretch;
            gap: 8px;
            padding-top: 8px;
            border-top: 1px solid ${t.line};
          }
          .db-post-stats {
            width: 100%;
            justify-content: flex-start;
            gap: 14px;
          }
          .db-post-stats span {
            min-width: 0;
          }
          .db-post-dm {
            width: 100%;
            padding: 9px 12px;
            border-radius: 10px;
            font-size: 12px;
          }
          .db-community-pager {
            flex-wrap: wrap;
            gap: 8px;
            padding: 10px 12px;
          }
          .db-community-pager button {
            flex: 1 1 auto;
            min-width: 0;
            padding: 10px 12px;
          }
        }
      `}</style>
  );
}
