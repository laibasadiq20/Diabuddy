import { fromMgdl, glucoseUnitLabel, resolveGlucoseUnit } from '../../utils/glucoseUnits';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function reportKindFromLabel(rawLabel, tr) {
  const lower = String(rawLabel || '').toLowerCase();
  const kind = (key) => ({
    badge: tr(`reports.pdfExport.kinds.${key}.badge`),
    title: tr(`reports.pdfExport.kinds.${key}.title`),
  });
  if (lower.includes('daily')) return { ...kind('daily'), tone: 'daily' };
  if (lower.includes('weekly')) return { ...kind('weekly'), tone: 'weekly' };
  if (lower.includes('monthly')) return { ...kind('monthly'), tone: 'monthly' };
  if (lower.includes('3-month') || lower.includes('3 month')) {
    return { ...kind('threeMonth'), tone: 'quarter' };
  }
  const custom = kind('custom');
  return { badge: rawLabel || custom.badge, title: custom.title, tone: 'custom' };
}

/**
 * SVG glucose trend line — shows shape, not just the average.
 * Prefers individual readings when the set is small; otherwise daily averages.
 */
function glucoseTrendSvg(charts, tirTarget = { low: 70, high: 180 }, tr, glucoseUnit = 'mg/dL') {
  const series = (charts?.glucoseSeries || [])
    .filter((p) => p.valueMgDl != null && Number.isFinite(Number(p.valueMgDl)))
    .map((p) => ({
      value: fromMgdl(Number(p.valueMgDl), glucoseUnit),
      label: p.label || '',
      at: p.at,
    }));

  const daily = (charts?.daily || [])
    .filter((d) => d.avgGlucose != null && Number.isFinite(Number(d.avgGlucose)))
    .map((d) => ({
      value: fromMgdl(Number(d.avgGlucose), glucoseUnit),
      label: d.label || d.date || '',
    }));

  let points = [];
  let modeLabel = tr('reports.pdfExport.trend.dailyAverage');

  if (series.length >= 2 && series.length <= 40) {
    points = series.map((p, i) => {
      let label = p.label;
      if (p.at) {
        const dt = new Date(p.at);
        if (!Number.isNaN(dt.getTime())) {
          label = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (series.length <= 14) {
            label += ` ${dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
          }
        }
      }
      return { value: p.value, label: label || String(i + 1) };
    });
    modeLabel = tr('reports.pdfExport.trend.eachReading');
  } else if (daily.length >= 2) {
    points = daily;
    modeLabel = tr('reports.pdfExport.trend.dailyAverage');
  } else if (series.length >= 2) {
    // Many readings: fall back to daily if possible, else downsample
    if (daily.length >= 2) {
      points = daily;
      modeLabel = tr('reports.pdfExport.trend.dailyAverage');
    } else {
      const step = Math.ceil(series.length / 36);
      points = series.filter((_, i) => i % step === 0).map((p, i) => ({
        value: p.value,
        label: p.label || String(i + 1),
      }));
      modeLabel = tr('reports.pdfExport.trend.sampledReadings');
    }
  }

  if (points.length < 2) {
    return `<div class="trend empty">${escapeHtml(tr('reports.pdfExport.trend.notEnoughData'))}</div>`;
  }

  const W = 640;
  const H = 200;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const values = points.map((p) => p.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const bandLow = fromMgdl(tirTarget.low ?? 70, glucoseUnit);
  const bandHigh = fromMgdl(tirTarget.high ?? 180, glucoseUnit);
  const padY = glucoseUnit === 'mmol/L' ? 0.8 : 15;
  let yMin = Math.min(dataMin, bandLow) - padY;
  let yMax = Math.max(dataMax, bandHigh) + padY;
  if (yMax - yMin < 40) {
    yMin -= 20;
    yMax += 20;
  }
  yMin = Math.max(0, Math.floor(yMin / 10) * 10);
  yMax = Math.ceil(yMax / 10) * 10;

  const xAt = (i) => padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yAt = (v) => padT + ((yMax - v) / (yMax - yMin)) * innerH;

  const bandY1 = yAt(bandHigh);
  const bandY2 = yAt(bandLow);
  const bandTop = Math.min(bandY1, bandY2);
  const bandHeight = Math.abs(bandY2 - bandY1);

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p.value).toFixed(1)}`)
    .join(' ');

  const dots = points
    .map((p, i) => {
      const cx = xAt(i).toFixed(1);
      const cy = yAt(p.value).toFixed(1);
      const inRange = p.value >= bandLow && p.value <= bandHigh;
      const fill = inRange ? '#7C9470' : p.value > bandHigh ? '#C2724F' : '#496D82';
      return `<circle cx="${cx}" cy="${cy}" r="3.2" fill="${fill}" stroke="#fff" stroke-width="1" />`;
    })
    .join('');

  // Sparse x labels
  const labelIdx = new Set([0, points.length - 1]);
  if (points.length > 2) labelIdx.add(Math.floor((points.length - 1) / 2));
  if (points.length > 6) {
    labelIdx.add(Math.floor((points.length - 1) / 4));
    labelIdx.add(Math.floor(((points.length - 1) * 3) / 4));
  }
  const xLabels = [...labelIdx]
    .sort((a, b) => a - b)
    .map((i) => {
      const x = xAt(i);
      const text = escapeHtml(String(points[i].label).slice(0, 14));
      return `<text x="${x.toFixed(1)}" y="${H - 8}" text-anchor="middle" class="axis">${text}</text>`;
    })
    .join('');

  const yTicks = [yMin, Math.round((yMin + yMax) / 2), yMax];
  const yLabels = yTicks
    .map((v) => {
      const y = yAt(v);
      return `<text x="${padL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" class="axis">${v}</text>
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" class="grid" />`;
    })
    .join('');

  return `
    <div class="trend">
      <div class="trend-meta">
        <span>${escapeHtml(modeLabel)}</span>
        <span>${escapeHtml(
          tr('reports.pdfExport.trend.shadedBandTemplate')
            .replace('{low}', bandLow)
            .replace('{high}', bandHigh)
            .replace('{unit}', glucoseUnitLabel(glucoseUnit))
        )}</span>
      </div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="200" role="img" aria-label="${escapeHtml(tr('reports.pdfExport.trend.ariaLabel'))}">
        <rect x="${padL}" y="${bandTop.toFixed(1)}" width="${innerW}" height="${bandHeight.toFixed(1)}" class="band" />
        ${yLabels}
        <path d="${path}" class="line" fill="none" />
        ${dots}
        ${xLabels}
      </svg>
    </div>`;
}

/** CSS conic-gradient donut for Time in Range */
function tirDonutHtml(tir, tr) {
  const inR = Number(tir?.inRange) || 0;
  const high = Number(tir?.high) || 0;
  const low = Number(tir?.low) || 0;
  const total = inR + high + low;
  if (!total) {
    return `<div class="donut empty"><span>${escapeHtml(tr('reports.pdfExport.donut.noReadings'))}</span></div>`;
  }
  const inPct = (inR / total) * 100;
  const highPct = (high / total) * 100;
  const lowPct = (low / total) * 100;
  const endIn = inPct;
  const endHigh = inPct + highPct;
  const gradient = `conic-gradient(#7C9470 0% ${endIn}%, #C2724F ${endIn}% ${endHigh}%, #496D82 ${endHigh}% 100%)`;
  const center = Math.round((inR / total) * 100);
  return `
    <div class="donut-wrap">
      <div class="donut" style="background: ${gradient}">
        <div class="donut-hole">
          <strong>${center}%</strong>
          <span>${escapeHtml(tr('reports.pdfExport.donut.inRangeCenter'))}</span>
        </div>
      </div>
      <ul class="donut-legend">
        <li><i class="dot in"></i> ${escapeHtml(tr('reports.pdfExport.donut.inRange'))} <strong>${inR}</strong></li>
        <li><i class="dot high"></i> ${escapeHtml(tr('reports.pdfExport.donut.high'))} <strong>${high}</strong></li>
        <li><i class="dot low"></i> ${escapeHtml(tr('reports.pdfExport.donut.low'))} <strong>${low}</strong></li>
      </ul>
    </div>`;
}

function formatDeltaLine(delta, { unit = '', invert = false, against, tr }) {
  const againstLabel = against || tr('reports.pdfExport.delta.previousPeriod');
  if (delta == null || Number.isNaN(Number(delta)) || Number(delta) === 0) {
    if (delta === 0) {
      const text = tr('reports.pdfExport.delta.noChangeFromTemplate').replace('{against}', againstLabel);
      return `<span class="delta flat">${escapeHtml(text)}</span>`;
    }
    return '';
  }
  const n = Number(delta);
  const better = invert ? n < 0 : n > 0;
  const arrow = n > 0 ? '↑' : '↓';
  const abs = Math.abs(n);
  const cls = better ? 'better' : 'worse';
  const text = tr('reports.pdfExport.delta.changeFromTemplate')
    .replace('{arrow}', arrow)
    .replace('{value}', abs)
    .replace('{unit}', unit)
    .replace('{against}', againstLabel);
  return `<span class="delta ${cls}">${escapeHtml(text)}</span>`;
}

/**
 * Opens the system print dialog (choose "Save as PDF") via a same-page iframe.
 */
export function downloadReportPdf(report, { userName, tr, glucoseUnit: glucoseUnitPref } = {}) {
  const period = report?.period;
  const metrics = period?.metrics || {};
  const charts = period?.charts || {};
  const story = report?.story || {};
  const deltas = report?.deltas || {};
  const against = report?.compareAgainst || tr('reports.pdfExport.delta.previousPeriod');
  const tirTargetRaw = report?.tirTarget || { low: 70, high: 180 };
  const glucoseUnit = resolveGlucoseUnit(glucoseUnitPref);
  const unitLabel = glucoseUnitLabel(glucoseUnit);
  const tirTarget = {
    low: fromMgdl(tirTargetRaw.low ?? 70, glucoseUnit),
    high: fromMgdl(tirTargetRaw.high ?? 180, glucoseUnit),
  };
  const avgGlucoseDisplay = fromMgdl(metrics.avgGlucose, glucoseUnit);
  const stdDevDisplay = fromMgdl(metrics.glucoseStdDev, glucoseUnit);
  const avgGlucoseDelta = deltas.avgGlucose != null ? fromMgdl(deltas.avgGlucose, glucoseUnit) : deltas.avgGlucose;
  const stdDevDelta = deltas.glucoseStdDev != null ? fromMgdl(deltas.glucoseStdDev, glucoseUnit) : deltas.glucoseStdDev;
  const reportKind = reportKindFromLabel(period?.label, tr);

  const variabilityDisplay =
    story.variabilityLabel ||
    (stdDevDisplay != null ? `${stdDevDisplay} ${unitLabel}` : '—');

  // Keep PDF lean: care letter covers encouragement; skip separate "What went well" + care-area dump.
  const goals = (story.recommendations || []).slice(0, 3);
  const goalsHtml = goals.length
    ? `<section class="block goals">
        <h2>${escapeHtml(story.goalsTitle || tr('reports.pdfExport.goalsTitleFallback'))}</h2>
        <ol>${goals.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ol>
      </section>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8" />
  <title>DiaBuddy ${escapeHtml(reportKind.badge)}</title>
  <style>
    @page { margin: 12mm; size: A4; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      color: #1f1e1c;
      background: #fff;
      font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    }
    .brand {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #27392e;
      margin-bottom: 10px;
    }
    .banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      background: #27392e;
      color: #f3eee2;
      margin-bottom: 14px;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 5px 10px;
      border-radius: 999px;
      background: #b8902e;
      color: #1f1e1c;
    }
    .banner.tone-weekly .badge { background: #dce7ea; color: #27392e; }
    .banner.tone-monthly .badge { background: #b8902e; color: #1f1e1c; }
    .banner.tone-daily .badge { background: #e3e8da; color: #27392e; }
    .banner h1 {
      margin: 8px 0 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
    }
    .banner .dates { font-size: 13px; font-weight: 600; opacity: 0.9; padding-top: 4px; }
    .care-letter {
      border: 1px solid #d6cfc0;
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 14px;
      background: linear-gradient(180deg, #fcfaf5 0%, #f3eee2 100%);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .care-letter .eyebrow {
      margin: 0 0 6px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #7a746a;
    }
    .care-letter .rating {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 4px 9px;
      border-radius: 999px;
      margin: 0 0 10px 8px;
      vertical-align: middle;
      background: #e3e8da;
      color: #27392e;
    }
    .care-letter .rating.is-excellent { background: #e3e8da; color: #27392e; }
    .care-letter .rating.is-good { background: #dce7ea; color: #27392e; }
    .care-letter .rating.is-fair { background: #f3ebcb; color: #6a5410; }
    .care-letter .rating.is-needs_attention { background: #f3dfd4; color: #a65d3d; }
    .care-letter h2 {
      margin: 0 0 10px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #1f1e1c;
      border: 0;
      text-transform: none;
      display: inline;
    }
    .care-letter p {
      margin: 12px 0 0;
      font-size: 14px;
      line-height: 1.7;
      color: #3d3428;
      max-width: none;
      text-align: justify;
      text-justify: inter-word;
    }
    .care-letter .signoff {
      margin-top: 12px;
      font-size: 12px;
      font-weight: 700;
      color: #27392e;
      text-align: left;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .kpi {
      border: 1px solid #d6cfc0;
      border-radius: 14px;
      padding: 16px 14px;
      background: #fff;
      min-height: 108px;
    }
    .kpi label {
      display: block;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #7a746a;
      margin-bottom: 8px;
    }
    .kpi strong {
      display: block;
      font-size: 28px;
      font-weight: 750;
      letter-spacing: -0.03em;
      color: #1f1e1c;
      line-height: 1.1;
    }
    .kpi strong .unit {
      display: inline;
      font-size: 14px;
      font-weight: 600;
      color: #7a746a;
      letter-spacing: 0;
    }
    .kpi span {
      display: block;
      margin-top: 6px;
      font-size: 12px;
      color: #7a746a;
      font-weight: 600;
    }
    .row-2.visuals {
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .row-2.visuals .trend-card,
    .row-2.visuals .tir-card {
      height: 100%;
    }
    .kpi .delta {
      display: block;
      margin-top: 8px;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.35;
    }
    .kpi .delta.better { color: #62795a; }
    .kpi .delta.worse { color: #a65d3d; }
    .kpi .delta.flat { color: #7a746a; }
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 12px;
      margin-bottom: 14px;
      align-items: stretch;
    }
    .card {
      border: 1px solid #d6cfc0;
      border-radius: 14px;
      padding: 14px 16px;
      background: #fff;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .tir-card {
      display: block;
      width: 100%;
      overflow: hidden;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
      -webkit-column-break-inside: avoid;
    }
    .trend-card {
      border: 1px solid #d6cfc0;
      border-radius: 14px;
      padding: 14px 16px;
      background: #fff;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .trend-card h2 {
      margin: 0 0 6px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #27392e;
    }
    .trend-card .sub {
      margin: 0 0 10px;
      font-size: 12px;
      color: #7a746a;
      line-height: 1.4;
    }
    .trend-meta {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      font-size: 11px;
      font-weight: 600;
      color: #7a746a;
      margin-bottom: 4px;
    }
    .trend.empty {
      padding: 28px 12px;
      text-align: center;
      font-size: 13px;
      color: #7a746a;
      background: #f7f3ec;
      border-radius: 10px;
    }
    .trend svg .band { fill: rgba(124, 148, 112, 0.16); }
    .trend svg .grid { stroke: #ece6da; stroke-width: 1; }
    .trend svg .line { stroke: #496d82; stroke-width: 2.4; stroke-linejoin: round; stroke-linecap: round; }
    .trend svg .axis { fill: #8a806e; font-size: 10px; font-family: system-ui, sans-serif; }
    .card h2, .block h2 {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #27392e;
      border: 0;
      padding: 0;
    }
    .donut-wrap {
      display: flex;
      align-items: center;
      gap: 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .donut {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .donut.empty {
      background: #efeae0;
      color: #7a746a;
      font-size: 12px;
      font-weight: 600;
    }
    .donut-hole {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .donut-hole strong { font-size: 22px; color: #1f1e1c; }
    .donut-hole span { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #7a746a; }
    .donut-legend { list-style: none; margin: 0; padding: 0; font-size: 13px; color: #4f4a44; }
    .donut-legend li { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
    .donut-legend strong { margin-left: auto; color: #1f1e1c; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.in { background: #7C9470; }
    .dot.high { background: #C2724F; }
    .dot.low { background: #496D82; }
    .sections-wrap {
      border: 1px solid #d6cfc0;
      border-radius: 14px;
      padding: 14px 16px;
      background: #fff;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .sections-wrap > h2 {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #27392e;
    }
    .sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 0;
    }
    .section-card {
      border: 1px solid #d6cfc0;
      border-radius: 12px;
      padding: 12px 14px;
      background: #fcfaf5;
      min-height: 78px;
    }
    .section-card h3 {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #27392e;
    }
    .section-card p {
      margin: 0;
      font-size: 12.5px;
      line-height: 1.5;
      color: #4f4a44;
    }
    .block {
      border: 1px solid #d6cfc0;
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .block.encourage { background: #eff2e9; border-color: #c9d4bc; }
    .block.goals { background: #eef4f6; border-color: #c5d5dc; }
    .block ul, .block ol {
      margin: 0;
      padding-left: 18px;
      font-size: 13px;
      line-height: 1.55;
      color: #3d3428;
    }
    .block li { margin: 6px 0; }
    .meta {
      font-size: 11px;
      color: #7a746a;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .note {
      margin-top: 10px;
      font-size: 10px;
      color: #8a806e;
      line-height: 1.4;
    }
    @media print {
      .banner, .kpi, .card, .block, .section-card, .care-letter, .sections-wrap, .trend-card, .trend svg .band {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .banner,
      .care-letter,
      .kpi-grid,
      .trend-card,
      .card,
      .tir-card,
      .sections-wrap,
      .block,
      .donut-wrap {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      /* Prefer moving a whole block to the next page instead of slicing it */
      .tir-card,
      .sections-wrap,
      .block.encourage,
      .block.goals {
        break-before: auto;
        page-break-before: auto;
      }
      h2, h3 {
        break-after: avoid;
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="brand">DiaBuddy</div>
  <div class="banner tone-${escapeHtml(reportKind.tone)}">
    <div>
      <span class="badge">${escapeHtml(reportKind.badge)}</span>
      <h1>${escapeHtml(reportKind.title)}</h1>
    </div>
    <div class="dates">${escapeHtml(period?.shortLabel || '')}</div>
  </div>

  <div class="meta">
    <strong>${escapeHtml(tr('reports.pdfExport.patientLabel'))}</strong> ${escapeHtml(userName || tr('reports.pdfExport.patientFallback'))}
    · ${escapeHtml(tr('reports.pdfExport.targetLabel'))} ${escapeHtml(tirTarget.low)}–${escapeHtml(tirTarget.high)} ${escapeHtml(unitLabel)}
    · ${escapeHtml(tr('reports.pdfExport.exportedLabel'))} ${escapeHtml(new Date().toLocaleString())}
  </div>

  <section class="care-letter">
    <p class="eyebrow">${escapeHtml(tr('reports.pdfExport.fromDiaBuddy'))}</p>
    <h2>${escapeHtml(story.careLetterTitle || story.headline || tr('reports.pdfExport.careLetterFallback'))}</h2>
    <span class="rating is-${escapeHtml(story.rating || 'fair')}">${escapeHtml(story.ratingLabel || tr('reports.pdfExport.summaryFallback'))}</span>
    <p>${escapeHtml(story.careLetter || story.narrative || story.summary || '')}</p>
    <p class="signoff">${escapeHtml(tr('reports.pdfExport.signoff'))}</p>
  </section>

  <div class="kpi-grid">
    <div class="kpi">
      <label>${escapeHtml(tr('reports.pdfExport.kpis.timeInRange'))}</label>
      <strong>${escapeHtml(metrics.timeInRangePercent != null ? `${metrics.timeInRangePercent}%` : '—')}</strong>
      ${formatDeltaLine(deltas.timeInRangePercent, { unit: '%', invert: false, against, tr })}
    </div>
    <div class="kpi">
      <label>${escapeHtml(tr('reports.pdfExport.kpis.avgGlucose'))}</label>
      <strong>${
        avgGlucoseDisplay != null
          ? `${escapeHtml(avgGlucoseDisplay)}<span class="unit"> ${escapeHtml(unitLabel)}</span>`
          : '—'
      }</strong>
      ${formatDeltaLine(avgGlucoseDelta, { unit: ` ${unitLabel}`, invert: true, against, tr })}
    </div>
    <div class="kpi">
      <label>${escapeHtml(tr('reports.pdfExport.kpis.estimatedA1c'))}</label>
      <strong>${escapeHtml(metrics.estimatedA1c != null ? `${metrics.estimatedA1c}%` : '—')}</strong>
      ${formatDeltaLine(deltas.estimatedA1c, { unit: '%', invert: true, against, tr })}
    </div>
    <div class="kpi">
      <label>${escapeHtml(tr('reports.pdfExport.kpis.variability'))}</label>
      <strong>${escapeHtml(variabilityDisplay)}</strong>
      ${formatDeltaLine(stdDevDelta, { unit: ` ${unitLabel}`, invert: true, against, tr })}
    </div>
  </div>

  <div class="row-2 visuals">
    <section class="trend-card" style="margin:0;">
      <h2>${escapeHtml(tr('reports.pdfExport.glucoseTrendTitle'))}</h2>
      ${glucoseTrendSvg(charts, tirTargetRaw, tr, glucoseUnit)}
    </section>
    <div class="card tir-card" style="margin:0;">
      <h2>${escapeHtml(tr('reports.pdfExport.timeInRangeTitle'))}</h2>
      ${tirDonutHtml(charts.tir, tr)}
    </div>
  </div>

  ${goalsHtml}

  <p class="note">${escapeHtml(tr('reports.pdfExport.disclaimer'))}</p>
</body>
</html>`;

  const existing = document.getElementById('db-rep-pdf-frame');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'db-rep-pdf-frame';
  iframe.title = tr('reports.pdfExport.iframeTitle');
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '1024px',
    height: '1400px',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-1',
  });
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.remove();
    }, 1500);
  };

  const triggerPrint = () => {
    const win = iframe.contentWindow;
    if (!win) {
      iframe.remove();
      throw new Error(tr('reports.pdfExport.exportError'));
    }
    win.focus();
    win.print();
    cleanup();
  };

  iframe.onload = () => {
    setTimeout(triggerPrint, 120);
  };
  iframe.srcdoc = html;
}
