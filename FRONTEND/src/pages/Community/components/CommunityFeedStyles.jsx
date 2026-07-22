import React from 'react';
import { theme } from '../../../theme';

const t = theme;

export default function CommunityFeedStyles() {
  return (
    <style>{`
        .db-community-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }
        .db-community-eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${t.forest};
        }
        .db-community-title {
          font-family: ${t.fontDisplay};
          font-size: clamp(28px, 5vw, 40px);
          margin: 0;
          font-weight: 500;
          color: ${t.ink};
          letter-spacing: -0.02em;
        }
        .db-community-lead {
          color: ${t.inkSoft};
          font-size: 15px;
          margin: 8px 0 0;
          max-width: 42ch;
          line-height: 1.55;
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
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 10px 24px rgba(22, 33, 25, 0.22);
          font-family: ${t.fontBody};
          white-space: nowrap;
          flex-shrink: 0;
        }
        .db-community-cta--ghost {
          background: #fff;
          color: ${t.forest};
          border: 1.5px solid ${t.forest};
          box-shadow: none;
        }
        .db-post-dm {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1.5px solid ${t.forest};
          background: ${t.forest};
          color: #fff;
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
          line-height: 1;
        }
        .db-post-dm:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .db-community-search {
          position: relative;
          margin-bottom: 14px;
        }
        .db-community-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: ${t.inkSoft};
          pointer-events: none;
        }
        .db-community-search input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px 13px 42px;
          background: #fff;
          border: 1.5px solid ${t.lineStrong};
          border-radius: 14px;
          font-size: 14px;
          color: ${t.ink};
          font-weight: 500;
          outline: none;
          font-family: ${t.fontBody};
          box-shadow: ${t.shadowCard};
        }
        .db-community-search input:focus {
          border-color: ${t.forest};
        }
        .db-community-filters {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 18px;
          padding: 14px 16px;
          background: #fff;
          border: 1.5px solid ${t.lineStrong};
          border-radius: 16px;
          box-shadow: ${t.shadowCard};
        }
        .db-community-sort {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding-bottom: 12px;
          border-bottom: 1px solid ${t.line};
        }
        .db-sort-chip {
          border: 1.5px solid ${t.lineStrong};
          background: #fff;
          color: ${t.inkSoft};
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-sort-chip.is-active {
          background: ${t.forest};
          border-color: ${t.forest};
          color: #fff;
        }
        .db-drafts-banner {
          background: #fff;
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
          background: #fff;
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
          gap: 12px;
        }
        .db-post-card {
          background: #fff;
          border: 1.5px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 18px 20px;
          cursor: pointer;
          box-shadow: ${t.shadowCard};
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          outline: none;
        }
        .db-post-card:focus-visible {
          border-color: ${t.forest};
          box-shadow: 0 0 0 3px rgba(39, 57, 46, 0.15);
        }
        @media (hover: hover) and (pointer: fine) {
          .db-post-card:hover {
            border-color: ${t.forest};
            box-shadow: 0 14px 30px rgba(55, 45, 35, 0.1);
          }
        }
        .db-post-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .db-post-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          min-width: 0;
        }
        .db-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .db-badge--pin { color: ${t.sageDeep}; background: ${t.sageTint}; }
        .db-badge--lock { color: ${t.clayDeep}; background: ${t.clayTint}; }
        .db-badge--solved { color: ${t.gold}; background: ${t.goldTint}; }
        .db-post-topic {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .db-post-title {
          font-size: 17px;
          color: ${t.ink};
          font-weight: 700;
          margin: 0 0 8px;
          font-family: ${t.fontBody};
          line-height: 1.35;
        }
        .db-post-excerpt {
          font-size: 14px;
          color: ${t.inkSoft};
          margin: 0 0 16px;
          line-height: 1.55;
          font-weight: 500;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .db-post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          border-top: 1px solid ${t.line};
          padding-top: 14px;
        }
        .db-post-author {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .db-post-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${t.sageSoft};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
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
          font-size: 13px;
          font-weight: 600;
          color: ${t.ink};
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-pro-tag {
          margin-left: 4px;
          font-size: 10px;
          background: ${t.skyDeep};
          color: #fff;
          padding: 1px 5px;
          border-radius: 4px;
          vertical-align: middle;
          font-weight: 700;
        }
        .db-post-date {
          font-size: 11px;
          color: ${t.inkFaint};
          margin: 0;
        }
        .db-post-stats {
          display: flex;
          gap: 14px;
          color: ${t.inkSoft};
          font-size: 13px;
        }
        .db-post-stats span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .db-community-state {
          background: #fff;
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
          margin-top: 8px;
        }
        .db-community-pager button {
          background: #fff;
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
            gap: 14px;
          }
          .db-community-actions {
            flex-direction: column;
            width: 100%;
          }
          .db-community-cta {
            width: 100%;
            padding: 13px 16px;
            border-radius: 14px;
          }
          .db-community-filters {
            padding: 12px;
            gap: 10px;
            border-radius: 14px;
          }
          .db-community-sort {
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 10px;
          }
          .db-community-sort::-webkit-scrollbar { display: none; }
          .db-sort-chip {
            flex: 0 0 auto;
          }
          .db-drafts-banner {
            padding: 12px;
          }
          .db-drafts-list {
            flex-direction: column;
          }
          .db-drafts-list button {
            width: 100%;
            text-align: left;
            border-radius: 12px;
          }
          .db-post-card {
            padding: 16px;
            border-radius: 14px;
          }
          .db-post-title { font-size: 16px; }
          .db-post-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          .db-post-stats {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 10px;
            padding-top: 2px;
          }
          .db-post-dm {
            order: -1;
            width: 100%;
            justify-content: center;
            padding: 8px 12px;
            border-radius: 12px;
          }
        }
      `}</style>
  );
}
