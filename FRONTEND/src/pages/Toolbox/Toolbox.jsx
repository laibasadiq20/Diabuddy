import React, { useState } from 'react';
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

export default function Toolbox() {
  const [active, setActive] = useState(null);
  const ActiveView = active ? TOOL_VIEWS[active] : null;
  const meta = TOOLS.find((x) => x.id === active);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {!active ? (
            <>
              <header style={{ marginBottom: 22 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
                  Toolbox
                </p>
                <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 500, color: t.ink }}>
                  Diabetes tools
                </h1>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>
                  Calculators and lookups for day-to-day diabetes management. Estimates only — not medical advice.
                </p>
              </header>

              <div style={{ display: 'grid', gap: 12 }}>
                {TOOLS.map(({ id, title, desc, icon: Icon, tint, accent }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActive(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '18px 16px',
                      borderRadius: 18,
                      border: `1.5px solid ${t.lineStrong}`,
                      background: '#FFF',
                      boxShadow: t.shadowCard,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: t.fontBody,
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = accent;
                      e.currentTarget.style.boxShadow = t.shadowLifted;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = t.lineStrong;
                      e.currentTarget.style.boxShadow = t.shadowCard;
                    }}
                  >
                    <span
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: tint,
                        color: accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} />
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 16, color: t.ink }}>{title}</span>
                      <span style={{ display: 'block', fontSize: 13, color: t.inkSoft, marginTop: 2 }}>{desc}</span>
                    </span>
                    <ChevronRight size={18} color={t.inkFaint} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActive(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 18,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${t.lineStrong}`,
                  background: '#FFF',
                  color: t.inkSoft,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                <ArrowLeft size={15} /> All tools
              </button>

              <section
                style={{
                  background: '#FFF',
                  borderRadius: 20,
                  border: `1.5px solid ${t.lineStrong}`,
                  boxShadow: t.shadowCard,
                  padding: 22,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: meta.tint,
                      color: meta.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <meta.icon size={18} />
                  </span>
                  <h2 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, fontWeight: 600 }}>
                    {meta.title}
                  </h2>
                </div>
                <ActiveView />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
