import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../../theme';
import { Sparkles, Check, Droplets, Settings } from 'lucide-react';
import {
  resolveWaterUnit,
  waterUnitLabel,
  formatWater,
  getWaterQuickPresets,
  getWaterStepMl,
  getWaterStepLabel,
} from '../../../utils/waterUnits';

const t = theme;

function CupIcon({ type = 'plus', size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Cup Outline */}
      <path
        d="M5 4H27L24 33C23.8 35 22 36.5 20 36.5H12C10 36.5 8.2 35 8 33L5 4Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top Rim */}
      <path
        d="M3 4H29"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {type === 'plus' ? (
        <>
          {/* Plus Sign */}
          <path
            d="M16 14V26"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M10 20H22"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      ) : (
        /* Minus Sign */
        <path
          d="M10 20H22"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function WaterWaveTracker({
  preferredWaterUnit = 'ml',
  todayWaterMl,
  waterGoalMl,
  entries = [],
  onQuickAdd,
  onQuickRemove,
  submitting,
}) {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  const unit = resolveWaterUnit(preferredWaterUnit);
  const goal = Number(waterGoalMl) > 0 ? Number(waterGoalMl) : 2000;
  const current = Number(todayWaterMl) || 0;
  const waterPct = Math.min(100, Math.round((current / goal) * 100));

  const displayCurrent = formatWater(current, unit, { showUnit: false });
  const displayGoal = formatWater(goal, unit, { showUnit: false });
  const labelUnit = waterUnitLabel(unit, current);
  const presets = getWaterQuickPresets(unit);
  const stepMl = getWaterStepMl(unit);
  const stepLabel = getWaterStepLabel(unit);

  // Determine motivational guidance text based on progress percentage
  const getMotivationalMessage = () => {
    if (waterPct >= 100) return 'Hydration goal crushed! Outstanding job! 🎉';
    if (waterPct >= 75) return 'Almost at your daily goal! Keep going! 🌊';
    if (waterPct >= 40) return "You've got this, keep going!";
    if (waterPct > 0) return 'Great start! Have another glass to stay refreshed. 💧';
    return 'Ready to start hydrating? Log your first glass!';
  };

  const handleAdd = (amountMl) => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 900);
    if (onQuickAdd) onQuickAdd(amountMl);
  };

  const handleRemove = () => {
    if (onQuickRemove) onQuickRemove();
  };

  return (
    <div className="db-water-hero-tracker">
      {/* 1. Main Circular Wave Animated Visualizer */}
      <div className="db-water-circle-wrapper">
        <div className={`db-water-circle-container ${animating ? 'is-pulsing' : ''}`}>
          {/* Animated Water Fill Layer */}
          <div
            className="db-water-fill-box"
            style={{
              height: `${Math.min(100, Math.max(4, waterPct))}%`,
            }}
          >
            {/* Back Wave Layer */}
            <svg
              className="db-wave-svg db-wave-back"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path d="M0,45 C150,90 350,10 500,55 C650,100 850,15 1000,55 C1150,95 1250,30 1400,60 L1400,120 L0,120 Z" />
            </svg>

            {/* Front Wave Layer */}
            <svg
              className="db-wave-svg db-wave-front"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path d="M0,35 C180,5 320,75 500,40 C680,5 820,70 1000,35 C1180,5 1280,65 1400,40 L1400,120 L0,120 Z" />
            </svg>
          </div>

          {/* Centered Percentage Overlay */}
          <div className="db-water-pct-overlay">
            <span className="db-water-pct-number">{waterPct}%</span>
          </div>
        </div>

        {/* 2. Motivational Message */}
        <p className="db-water-motive-text">{getMotivationalMessage()}</p>
      </div>

      {/* 3. Interactive Intake Control Card */}
      <div className="db-water-control-card">
        <div className="db-water-control-left">
          <span className="db-water-intake-label">Your intake</span>
          <div className="db-water-intake-numbers">
            <strong className="db-water-current-liters">
              {displayCurrent}
            </strong>
            <span className="db-water-goal-liters">
              {' '}/ {displayGoal} {labelUnit}
            </span>
          </div>
          <span className="db-water-oz-subtitle">
            {displayCurrent} / {displayGoal} {labelUnit} logged today
          </span>
        </div>

        {/* Action Buttons [-] and [+] */}
        <div className="db-water-control-right">
          <button
            type="button"
            className="db-water-cup-btn is-minus"
            onClick={handleRemove}
            disabled={submitting || current <= 0}
            aria-label="Remove last water log"
            title={`Remove last log (-${stepLabel})`}
          >
            <CupIcon type="minus" size={26} />
          </button>

          <button
            type="button"
            className="db-water-cup-btn is-plus"
            onClick={() => handleAdd(stepMl)}
            disabled={submitting}
            aria-label={`Add ${stepLabel}`}
            title={`Add (+${stepLabel})`}
          >
            <CupIcon type="plus" size={26} />
          </button>
        </div>
      </div>

      {/* 4. Quick Preset Chips */}
      <div className="db-water-presets-row">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            className="db-water-preset-chip"
            onClick={() => handleAdd(p.amountMl)}
            disabled={submitting}
          >
            <Droplets size={14} />
            <span>{p.label} {p.sub ? `(${p.sub})` : ''}</span>
          </button>
        ))}
      </div>

      {/* 5. Change unit in Settings Link */}
      <button
        type="button"
        className="db-water-settings-link"
        onClick={() => navigate('/settings')}
        aria-label="Change water unit in Settings"
      >
        <Settings size={13} strokeWidth={2.2} />
        <span>Change unit in Settings</span>
      </button>

      <style jsx>{`
        .db-water-hero-tracker {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 20px;
          padding: 28px 24px 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          box-shadow: ${t.shadowCard};
          position: relative;
          overflow: hidden;
        }

        /* 1. Circular Visualizer */
        .db-water-circle-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .db-water-circle-container {
          width: 216px;
          height: 216px;
          border-radius: 50%;
          background: #E0F2FE;
          border: 6px solid #BAE6FD;
          outline: 2px solid rgba(2, 132, 199, 0.28);
          outline-offset: -2px;
          box-shadow:
            0 12px 32px -4px rgba(2, 132, 199, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.06),
            inset 0 2px 10px rgba(2, 132, 199, 0.12);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .db-water-circle-container.is-pulsing {
          transform: scale(1.04);
          box-shadow:
            0 16px 40px -4px rgba(2, 132, 199, 0.35),
            0 2px 8px rgba(0, 0, 0, 0.06),
            inset 0 2px 10px rgba(2, 132, 199, 0.18);
        }

        /* Water Fill Box & Wave Physics */
        .db-water-fill-box {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, #38BDF8 0%, #0284C7 55%, #0369A1 100%);
          transition: height 0.8s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .db-wave-svg {
          position: absolute;
          top: -24px;
          left: 0;
          width: 200%;
          height: 28px;
        }
        .db-wave-back {
          fill: #7DD3FC;
          opacity: 0.7;
          animation: dbWaveSlideBack 4.5s linear infinite;
        }
        .db-wave-front {
          fill: #38BDF8;
          opacity: 0.95;
          animation: dbWaveSlideFront 3s linear infinite;
        }

        @keyframes dbWaveSlideFront {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes dbWaveSlideBack {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        /* Centered Percentage Frosted Badge */
        .db-water-pct-overlay {
          position: relative;
          z-index: 10;
          pointer-events: none;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 6px 20px;
          border-radius: 999px;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.14);
        }
        .db-water-pct-number {
          font-family: ${t.fontBody};
          font-size: 36px;
          font-weight: 850;
          color: #0369A1;
          letter-spacing: -0.03em;
          line-height: 1;
          display: block;
        }

        /* Motivational Text */
        .db-water-motive-text {
          margin: 0;
          font-size: 15px;
          font-weight: 650;
          color: ${t.ink};
          text-align: center;
        }

        /* 3. Control Card */
        .db-water-control-card {
          width: 100%;
          background: ${t.surfaceSunken};
          border: 1px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-sizing: border-box;
          box-shadow: ${t.shadowCard};
        }
        .db-water-control-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .db-water-intake-label {
          font-size: 12px;
          font-weight: 750;
          color: ${t.forest};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .db-water-intake-numbers {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .db-water-current-liters {
          font-size: 28px;
          font-weight: 800;
          color: ${t.ink};
          font-family: ${t.fontDisplay};
          line-height: 1.1;
        }
        .db-water-goal-liters {
          font-size: 14.5px;
          font-weight: 650;
          color: ${t.inkSoft};
        }
        .db-water-oz-subtitle {
          font-size: 11.5px;
          font-weight: 600;
          color: ${t.inkFaint};
        }

        /* Action Buttons */
        .db-water-control-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .db-water-cup-btn {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: 1.8px solid ${t.forest};
          background: ${t.surface};
          color: ${t.forest};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 6px rgba(35, 59, 46, 0.1);
        }
        .db-water-cup-btn:hover:not(:disabled) {
          background: ${t.forest};
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(35, 59, 46, 0.25);
        }
        .db-water-cup-btn:active:not(:disabled) {
          transform: scale(0.94);
        }
        .db-water-cup-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          border-color: ${t.lineStrong};
          color: ${t.inkFaint};
        }

        /* Presets Row */
        .db-water-presets-row {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .db-water-preset-chip {
          padding: 11px 8px;
          border-radius: 12px;
          border: 1.5px solid ${t.lineStrong};
          background: ${t.surface};
          color: ${t.forest};
          font-size: 12.5px;
          font-weight: 750;
          font-family: ${t.fontBody};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
        }
        .db-water-preset-chip:hover:not(:disabled) {
          background: ${t.sageTint};
          border-color: ${t.forest};
          color: ${t.forest};
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(35, 59, 46, 0.12);
        }
        .db-water-preset-chip:active:not(:disabled) {
          transform: scale(0.97);
        }

        /* 5. Change unit in Settings Link */
        .db-water-settings-link {
          background: none;
          border: none;
          padding: 4px 8px;
          margin-top: -6px;
          font-size: 13.5px;
          font-weight: 700;
          color: ${t.forest};
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: ${t.fontBody};
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(35, 59, 46, 0.4);
          transition: all 0.15s ease;
        }
        .db-water-settings-link:hover {
          opacity: 0.8;
          text-decoration-color: ${t.forest};
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .db-water-hero-tracker {
            padding: 20px 16px 18px;
            border-radius: 16px;
            gap: 16px;
          }
          .db-water-circle-container {
            width: 184px;
            height: 184px;
            border: 5px solid #BAE6FD;
          }
          .db-water-pct-overlay {
            padding: 4px 16px;
          }
          .db-water-pct-number {
            font-size: 30px;
          }
          .db-water-motive-text {
            font-size: 14px;
          }
          .db-water-current-liters {
            font-size: 22px;
          }
          .db-water-cup-btn {
            width: 44px;
            height: 44px;
          }
          .db-water-presets-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
