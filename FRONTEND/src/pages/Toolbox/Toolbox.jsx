import React, { useEffect, useRef, useState } from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import {
  Calculator,
  Activity,
  Wheat,
  Syringe,
  ArrowLeftRight,
  Search,
  Droplet,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import BmiTool from './tools/BmiTool';
import CalorieTool from './tools/CalorieTool';
import CarbTool from './tools/CarbTool';
import InsulinHelperTool from './tools/InsulinHelperTool';
import Hba1cTool from './tools/Hba1cTool';
import GiLookupTool from './tools/GiLookupTool';
import GlucoseZoneTool from './tools/GlucoseZoneTool';

const t = theme;

const TOOLS = [
  {
    id: 'glucose',
    title: 'Blood sugar zone',
    desc: 'Check a reading and get next steps',
    icon: Droplet,
    tint: t.skyTint,
    accent: t.skyDeep,
  },
  {
    id: 'carb',
    title: 'Carb calculator',
    desc: 'Track carbs vs your daily allowance',
    icon: Wheat,
    tint: t.sageTint,
    accent: t.sageDeep,
  },
  {
    id: 'hba1c',
    title: 'HbA1c converter',
    desc: 'HbA1c ↔ estimated average glucose',
    icon: ArrowLeftRight,
    tint: t.skyTint,
    accent: t.sky,
  },
  {
    id: 'gi',
    title: 'Glycemic index',
    desc: 'Look up Pakistani foods by GI',
    icon: Search,
    tint: t.goldTint,
    accent: t.gold,
  },
  {
    id: 'insulin',
    title: 'Insulin dose helper',
    desc: 'Educational correction estimate',
    icon: Syringe,
    tint: t.clayTint,
    accent: t.clay,
  },
  {
    id: 'bmi',
    title: 'BMI calculator',
    desc: 'Body mass index & healthy range',
    icon: Calculator,
    tint: t.skyTint,
    accent: t.skyDeep,
  },
  {
    id: 'calorie',
    title: 'Calorie estimate',
    desc: 'Daily needs from age, size & activity',
    icon: Activity,
    tint: t.goldTint,
    accent: t.gold,
  },
];

const TOOL_VIEWS = {
  glucose: GlucoseZoneTool,
  carb: CarbTool,
  hba1c: Hba1cTool,
  gi: GiLookupTool,
  insulin: InsulinHelperTool,
  bmi: BmiTool,
  calorie: CalorieTool,
};

const isMobileToolbox = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches;

export default function Toolbox() {
  const [active, setActive] = useState(null);
  const activeRef = useRef(null);
  const ActiveView = active ? TOOL_VIEWS[active] : null;
  const meta = TOOLS.find((x) => x.id === active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!isMobileToolbox()) return undefined;
    const onPopState = () => {
      if (activeRef.current) {
        activeRef.current = null;
        setActive(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openTool = (id) => {
    activeRef.current = id;
    setActive(id);
    if (isMobileToolbox()) {
      window.history.pushState({ diabuddyTool: id }, '');
    }
  };

  const closeTool = () => {
    activeRef.current = null;
    setActive(null);
    if (isMobileToolbox() && window.history.state?.diabuddyTool) {
      window.history.replaceState({}, '');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '24px 18px 88px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {!active ? (
            <>
              <header style={{ marginBottom: 18 }}>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: t.fontDisplay,
                    fontSize: 'clamp(24px, 4vw, 30px)',
                    fontWeight: 500,
                    color: t.ink,
                  }}
                >
                  Toolbox
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.45 }}>
                  Quick calculators. Estimates only — not medical advice.
                </p>
              </header>

              <div style={{ display: 'grid', gap: 8 }}>
                {TOOLS.map(({ id, title, desc, icon: Icon, tint, accent }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openTool(id)}
                    className="db-toolbox-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px',
                      borderRadius: 12,
                      border: `1px solid ${t.lineStrong}`,
                      background: '#FFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: t.fontBody,
                    }}
                  >
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: tint,
                        color: accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 15, color: t.ink }}>
                        {title}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 12,
                          color: t.inkSoft,
                          marginTop: 2,
                          lineHeight: 1.35,
                        }}
                      >
                        {desc}
                      </span>
                    </span>
                    <ChevronRight size={16} color={t.inkFaint} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={closeTool}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 14,
                  padding: '7px 10px',
                  borderRadius: 10,
                  border: `1px solid ${t.lineStrong}`,
                  background: '#FFF',
                  color: t.inkSoft,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                <ArrowLeft size={14} /> All tools
              </button>

              <section
                className="db-tool-panel"
                style={{
                  background: '#FFF',
                  borderRadius: 14,
                  border: `1px solid ${t.lineStrong}`,
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: meta.tint,
                      color: meta.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <meta.icon size={16} />
                  </span>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: t.fontDisplay,
                      fontSize: 20,
                      color: t.ink,
                      fontWeight: 500,
                    }}
                  >
                    {meta.title}
                  </h2>
                </div>
                <ActiveView />
              </section>
            </>
          )}
        </div>
      </main>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .db-toolbox-row:hover { border-color: ${t.forest}; }
        }
        @media (max-width: 560px) {
          .db-tool-panel { padding: 14px !important; border-radius: 12px !important; }
        }
      `}</style>
    </div>
  );
}
