"use client";

import { Download, History, SlidersHorizontal } from "lucide-react";
import { computeGraphData } from "@/lib/computeGraphData";

function formatName(name) { return String(name || "Parameter").replace(/_/g, " "); }
function formatTime(timestamp) { return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(timestamp)); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }
function studyPrompt(name, direction) { return `Predict how ${formatName(name)} being ${direction} changes the curve, then explain the physics in one sentence.`; }

function sparkline(values) {
  const width = 500; const height = 92; const pad = 14;
  const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = pad + ((width - pad * 2) * index) / Math.max(1, values.length - 1);
    const y = height - pad - ((height - pad * 2) * (value - min)) / range;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Parameter adjustment trend"><line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#d9e1ea"/><polyline fill="none" stroke="#111827" stroke-width="2.5" points="${points}"/>${values.map((value, index) => { const [x, y] = points.split(" ")[index].split(","); return `<circle cx="${x}" cy="${y}" r="3.5" fill="#14b8a6"/>`; }).join("")}</svg>`;
}

function comparisonGraph(beforeChart, afterChart) {
  const beforeSeries = beforeChart?.series?.[0];
  const afterSeries = afterChart?.series?.[0];
  if (!beforeSeries || !afterSeries) return "";
  const before = beforeChart.data.filter((point) => Number.isFinite(point[beforeChart.xKey]) && Number.isFinite(point[beforeSeries.key])).slice(0, 120);
  const after = afterChart.data.filter((point) => Number.isFinite(point[afterChart.xKey]) && Number.isFinite(point[afterSeries.key])).slice(0, 120);
  if (!before.length || !after.length) return "";
  const width = 500; const height = 176; const pad = 25;
  const xs = [...before, ...after].map((point) => Number(point[beforeChart.xKey]));
  const ys = [...before.map((point) => Number(point[beforeSeries.key])), ...after.map((point) => Number(point[afterSeries.key]))];
  const xMin = Math.min(...xs); const xRange = Math.max(...xs) - xMin || 1;
  const yMin = Math.min(...ys); const yRange = Math.max(...ys) - yMin || 1;
  const points = (data, key) => data.map((point) => `${(pad + ((width - pad * 2) * (Number(point[beforeChart.xKey]) - xMin)) / xRange).toFixed(1)},${(height - pad - ((height - pad * 2) * (Number(point[key]) - yMin)) / yRange).toFixed(1)}`).join(" ");
  return `<div class="comparison"><div class="legend"><span><i class="before-dot"></i>Before</span><span><i class="after-dot"></i>After</span></div><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Before and after computed physics graph"><line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#d9e1ea"/><polyline fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="7 5" points="${points(before, beforeSeries.key)}"/><polyline fill="none" stroke="#111827" stroke-width="2.5" points="${points(after, afterSeries.key)}"/></svg><p class="chart-caption">${escapeHtml(afterChart.title)} - ${escapeHtml(afterSeries.label || afterSeries.name || afterSeries.key)}</p></div>`;
}

function exportRevisionPdf(entries, simConfig, topic, simType, currentParams) {
  const units = Object.fromEntries((simConfig?.params || []).map((param) => [param.name, param.unit || ""]));
  const groups = Object.values(entries.reduce((all, entry) => { (all[entry.key] ||= []).push(entry); return all; }, {}));
  const studySections = groups.map((group, index) => {
    const values = [group[0].previousValue, ...group.map((entry) => entry.value)].filter((value) => Number.isFinite(Number(value))).map(Number);
    const latest = group.at(-1); const unit = units[latest.key] || "";
    const first = values[0]; const last = values.at(-1);
    const direction = last > first ? "increased" : last < first ? "decreased" : "unchanged";
    const change = first === 0 ? null : ((last - first) / Math.abs(first)) * 100;
    const beforeCharts = computeGraphData(simType, { ...currentParams, [latest.key]: latest.previousValue });
    const afterCharts = computeGraphData(simType, currentParams);
    const chartIndex = afterCharts.findIndex((chart) => chart.paramKey === latest.key);
    const beforeChart = beforeCharts[chartIndex >= 0 ? chartIndex : 0];
    const afterChart = afterCharts[chartIndex >= 0 ? chartIndex : 0];
    return `<section class="experiment"><div class="section-head"><span class="number">${String(index + 1).padStart(2, "0")}</span><div><h2>${escapeHtml(formatName(latest.key))}</h2><p>${group.length} adjustment${group.length === 1 ? "" : "s"} recorded</p></div><span class="change ${direction}">${direction === "increased" ? "+" : direction === "decreased" ? "-" : "="}${change == null ? "" : `${Math.abs(change).toFixed(1)}%`}</span></div><div class="value-row"><div><span>Starting value</span><strong>${escapeHtml(first)} ${escapeHtml(unit)}</strong></div><div class="arrow">to</div><div><span>Latest value</span><strong>${escapeHtml(last)} ${escapeHtml(unit)}</strong></div></div>${values.length > 1 ? `<div class="mini-title">Adjustment trail</div>${sparkline(values)}` : ""}${comparisonGraph(beforeChart, afterChart)}<div class="revision-prompt"><span>Exam prompt</span><p>${escapeHtml(studyPrompt(latest.key, direction))}</p></div></section>`;
  }).join("");
  const rows = [...entries].reverse().map((entry, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(formatName(entry.key))}</td><td>${escapeHtml(entry.previousValue ?? "-")}</td><td>${escapeHtml(entry.value)} ${escapeHtml(units[entry.key])}</td><td>${escapeHtml(entry.source)}</td><td>${escapeHtml(formatTime(entry.ts))}</td></tr>`).join("");
  const title = escapeHtml(topic || simConfig?.displayName || "Physics simulation");
  const generated = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const popup = window.open("", "_blank", "width=960,height=840");
  if (!popup) return;
  popup.document.write(`<!doctype html><html><head><title>${title} - revision handout</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;color:#111827;font-family:Georgia,"Times New Roman",serif;font-size:12px;line-height:1.55}.cover{padding:18px 20px;border:1.5px solid #111827;border-radius:0;background:#fff;color:#111827}.brand{font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#374151;font-family:Arial,sans-serif;font-weight:700}.cover h1{font-size:26px;line-height:1.15;margin:9px 0 5px;font-weight:700}.cover p{margin:0;color:#4b5563;font-size:13px}.meta{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.meta span{padding:5px 8px;background:#fff;border:1px solid #9ca3af;border-radius:0;font-family:Arial,sans-serif;font-size:9px;color:#374151}.guide{margin:16px 0;padding:12px 14px;border:1px solid #6b7280;border-left:4px solid #111827;background:#fff;border-radius:0}.guide strong{display:block;color:#111827;margin-bottom:2px}.guide p{margin:0;color:#374151}.section-label{font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.1px;color:#111827;font-weight:800;text-transform:uppercase;margin:25px 0 8px;padding-bottom:5px;border-bottom:1px solid #111827}.experiment{border:1px solid #374151;border-radius:0;padding:15px 16px;margin:12px 0;break-inside:avoid;page-break-inside:avoid}.section-head{display:flex;align-items:center;gap:10px}.number{display:grid;place-items:center;width:28px;height:28px;border:1px solid #111827;border-radius:0;background:#fff;color:#111827;font-family:Arial,sans-serif;font-size:10px;font-weight:800}.section-head h2{margin:0;font-size:16px;color:#111827}.section-head p{margin:1px 0 0;color:#64748b;font-size:10px}.change{margin-left:auto;border:1px solid #6b7280;border-radius:0;padding:4px 7px;font-family:Arial,sans-serif;font-size:9px;font-weight:800;color:#111827}.change.increased,.change.decreased,.change.unchanged{background:#fff;color:#111827}.value-row{display:flex;align-items:center;gap:16px;margin:15px 0 8px;padding:9px 11px;background:#fff;border:1px solid #d1d5db;border-radius:0}.value-row div{display:flex;flex-direction:column}.value-row span{font-size:9px;letter-spacing:.7px;text-transform:uppercase;color:#64748b}.value-row strong{font-size:14px;color:#111827}.value-row .arrow{font-size:12px;color:#111827;font-weight:700}.mini-title{margin-top:12px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:.7px;text-transform:uppercase;font-weight:800;color:#374151}.comparison{margin-top:8px}.legend{display:flex;gap:14px;font-size:10px;font-weight:700;color:#475569}.legend span{display:flex;align-items:center;gap:5px}.legend i{display:inline-block;width:8px;height:8px;border-radius:50%}.before-dot{background:#94a3b8}.after-dot{background:#111827}.chart-caption{margin:0;color:#64748b;font-size:10px}svg{display:block;width:100%;max-height:150px;margin:5px 0}.revision-prompt{margin-top:12px;padding:10px 12px;border-radius:0;background:#fff;border:1px solid #9ca3af}.revision-prompt span{font-family:Arial,sans-serif;font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:#111827;font-weight:800}.revision-prompt p{margin:2px 0 0;color:#374151;font-size:11px}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#f3f4f6;color:#111827;text-align:left;font-family:Arial,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.5px}th,td{padding:8px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#fafafa}.footer{margin-top:20px;padding-top:9px;border-top:1px solid #e2e8f0;color:#64748b;font-size:9px;display:flex;justify-content:space-between}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.cover{break-inside:avoid}thead{display:table-header-group}}</style></head><body><header class="cover"><div class="brand">Fulcrum | Exam revision lab</div><h1>${title}</h1><p>Physics simulation evidence sheet</p><div class="meta"><span>${entries.length} recorded changes</span><span>${groups.length} parameter${groups.length === 1 ? "" : "s"} explored</span><span>Generated ${escapeHtml(generated)}</span></div></header><section class="guide"><strong>How to use this sheet</strong><p>Study the grey dashed curve first, then the indigo curve. State the cause of the change before checking the values. Use the exam prompt beneath each graph for active recall.</p></section><div class="section-label">Parameter impact analysis</div>${studySections}<div class="section-label">Complete experiment history</div><table><thead><tr><th>#</th><th>Parameter</th><th>Before</th><th>After</th><th>Changed in</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table><footer class="footer"><span>Fulcrum revision handout</span><span>${title}</span></footer></body></html>`);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => popup.print(), 250);
}

export default function RevisionPanel({ entries = [], simConfig, topic, simType, currentParams }) {
  const units = Object.fromEntries((simConfig?.params || []).map((param) => [param.name, param.unit]));
  const recent = [...entries].reverse();
  return <div className="h-full min-h-0 overflow-y-auto fulcrum-scroll px-4 py-4">
    <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.07] p-4"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-indigo-200"><History className="h-4 w-4" /><h2 className="text-sm font-semibold">Experiment revision log</h2></div><p className="mt-1 text-[11px] leading-5 text-white/55">Export a polished evidence sheet with graph comparisons and active-recall prompts.</p></div><button type="button" disabled={!entries.length} onClick={() => exportRevisionPdf(entries, simConfig, topic, simType, currentParams)} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-500/20 px-2.5 py-2 text-[10px] font-semibold text-indigo-200 ring-1 ring-indigo-400/30 transition hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-3.5 w-3.5" />Export study PDF</button></div></div>
    {recent.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-white/12 px-4 py-8 text-center"><SlidersHorizontal className="mx-auto h-5 w-5 text-white/25" /><p className="mt-2 text-xs text-white/55">Adjust a simulation control to start your revision trail.</p></div> : <div className="mt-4 space-y-2">{recent.map((entry) => { const unit = units[entry.key] || ""; return <div key={entry.id} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold capitalize text-white/85">{formatName(entry.key)}</span><span className="text-[10px] text-white/35">{formatTime(entry.ts)}</span></div><div className="mt-1 flex items-center gap-2 text-[11px] font-mono"><span className="text-white/45">{entry.previousValue ?? "-"}</span><span className="text-indigo-300">to</span><span className="font-semibold text-cyan-300">{entry.value}{unit ? ` ${unit}` : ""}</span><span className="ml-auto text-[9px] uppercase tracking-wide text-white/30">{entry.source}</span></div></div>; })}</div>}
  </div>;
}
