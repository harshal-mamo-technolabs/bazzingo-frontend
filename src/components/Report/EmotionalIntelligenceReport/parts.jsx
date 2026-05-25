import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

/** A4 page size at 96 DPI — used by the PDF snapshot pipeline. */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

/* ============================================================
   Level Badge
   ============================================================ */
export function LevelBadge({ level, size = 'md' }) {
  if (!level) return null;
  const cls =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5'
      : size === 'lg'
        ? 'text-sm px-3 py-1'
        : 'text-[11px] px-2.5 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide border ${cls}`}
      style={{
        backgroundColor: level.soft,
        color: level.text,
        borderColor: level.border,
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, backgroundColor: level.color }}
      />
      {level.label}
    </span>
  );
}

/* ============================================================
   Premium EQ semicircular gauge
   ============================================================ */
export function EQGauge({
  percentage = 0,
  size = 220,
  stroke = 22,
  level,
  label = 'Overall EQ',
  showValue = true,
}) {
  const value = Math.max(0, Math.min(100, Number(percentage) || 0));
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const cx = size / 2;
  const cy = size / 2;
  const color = level?.color || '#6366F1';
  const gradId = `eq-gauge-grad-${Math.round(value * 10)}`;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size / 2 + stroke}
        viewBox={`0 0 ${size} ${size / 2 + stroke}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="50%" stopColor={color} stopOpacity={0.85} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>
        <path
          d={`M ${stroke / 2},${cy} A ${radius},${radius} 0 0 1 ${size - stroke / 2},${cy}`}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2},${cy} A ${radius},${radius} 0 0 1 ${size - stroke / 2},${cy}`}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showValue && (
        <div className="-mt-10 flex flex-col items-center">
          <div
            className="text-[40px] leading-none font-bold tabular-nums"
            style={{ color }}
          >
            {Math.round(value)}
            <span className="text-xl text-slate-400 font-semibold">%</span>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Mini ring score (for stat / leadership pillar cards)
   ============================================================ */
export function MiniRing({ value = 0, size = 56, stroke = 6, color = '#6366F1' }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#F1F5F9"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${dash} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.30}
        fontWeight={700}
        fill="#0F172A"
      >
        {Math.round(v)}
      </text>
    </svg>
  );
}

/* ============================================================
   EQ Radar chart
   ============================================================ */
export function EQRadar({
  normalized = [],
  width = 360,
  height = 250,
  accent = '#6366F1',
}) {
  const data = normalized.map((c) => ({
    subject: c.short || c.label,
    value: c.percentage,
    full: 100,
  }));
  return (
    <div style={{ width, height }}>
      <RadarChart width={width} height={height} data={data} outerRadius="74%">
        <defs>
          <linearGradient id="ei-radar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.55} />
            <stop offset="100%" stopColor={accent} stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: '#94A3B8' }}
          axisLine={false}
        />
        <Radar
          dataKey="value"
          stroke={accent}
          strokeWidth={2}
          fill="url(#ei-radar-fill)"
          fillOpacity={1}
          isAnimationActive={false}
        />
      </RadarChart>
    </div>
  );
}

/* ============================================================
   Category Progress Bar
   ============================================================ */
export function CategoryBar({ category, compact = false }) {
  if (!category) return null;
  const { label, raw, max, percentage, level, accent, blurb } = category;
  return (
    <div className={compact ? 'py-1.5' : 'py-2.5'}>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded-full"
            style={{ width: 8, height: 8, background: accent }}
          />
          <span className="text-[12px] font-semibold text-slate-800">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500 tabular-nums">
            {raw}/{max}
          </span>
          <span
            className="text-[12px] font-bold tabular-nums"
            style={{ color: level.color }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <div className="relative w-full h-2 rounded-full overflow-hidden bg-slate-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.max(2, percentage)}%`,
            background: `linear-gradient(90deg, ${accent}AA 0%, ${accent} 100%)`,
          }}
        />
      </div>
      {!compact && blurb ? (
        <p className="mt-1.5 text-[10.5px] text-slate-500 leading-snug">{blurb}</p>
      ) : null}
    </div>
  );
}

/* ============================================================
   Glassmorphic stat card
   ============================================================ */
export function StatCard({ kicker, value, sub, accent = '#6366F1' }) {
  return (
    <div
      className="rounded-2xl border bg-white/70 backdrop-blur-sm px-4 py-3.5 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)]"
      style={{ borderColor: `${accent}33` }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {kicker}
      </div>
      <div
        className="mt-1 text-[22px] leading-none font-bold tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </div>
      {sub ? <div className="mt-1.5 text-[11px] text-slate-500">{sub}</div> : null}
    </div>
  );
}

/* ============================================================
   Strength / Growth row (Page 1)
   ============================================================ */
export function TopCategoryRow({ index, category, mode = 'strength' }) {
  const accent = category.accent;
  const tone = mode === 'strength' ? '#10B981' : '#0EA5E9';
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${tone})`,
          }}
        >
          #{index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[12px] font-semibold text-slate-900 leading-tight">
              {category.label}
            </div>
            <div
              className="text-[14px] font-bold tabular-nums leading-none whitespace-nowrap"
              style={{ color: category.level.color }}
            >
              {Math.round(category.percentage)}%
            </div>
          </div>
          <div
            className="mt-1 text-[10px] text-slate-500 leading-snug"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {category.blurb}
          </div>
          <div className="mt-1.5">
            <LevelBadge level={category.level} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Insight card  (Page 2)
   ============================================================ */
export function InsightCard({ insight, level }) {
  const accent = level?.color || (insight.tone === 'strength' ? '#10B981' : '#6366F1');
  const toneLabel = insight.tone === 'strength' ? 'Strength' : 'Growth';
  const toneSoft = insight.tone === 'strength' ? '#ECFDF5' : '#EEF2FF';
  const toneText = insight.tone === 'strength' ? '#047857' : '#4338CA';
  return (
    <div
      className="rounded-2xl border bg-white p-4 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.10)]"
      style={{ borderColor: `${accent}26` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-[14px] font-semibold text-slate-900 leading-tight">
          {insight.title}
        </h3>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide border"
          style={{ background: toneSoft, color: toneText, borderColor: `${accent}22` }}
        >
          {toneLabel}
        </span>
      </div>
      {level ? (
        <div className="mb-2">
          <LevelBadge level={level} size="sm" />
        </div>
      ) : null}
      <p className="text-[11.5px] leading-relaxed text-slate-700 mb-2">
        {insight.interpretation}
      </p>
      {Array.isArray(insight.examples) && insight.examples.length > 0 ? (
        <ul className="space-y-1 mb-2.5">
          {insight.examples.slice(0, 3).map((ex, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-slate-600">
              <span
                className="mt-1 inline-block h-1 w-1 rounded-full shrink-0"
                style={{ background: accent }}
              />
              <span>{ex}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {insight.growth ? (
        <div
          className="rounded-lg px-2.5 py-2 text-[10.5px] leading-snug"
          style={{ background: toneSoft, color: toneText }}
        >
          <span className="font-bold mr-1">Try this:</span> {insight.growth}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   Life impact tile (Page 2)
   ============================================================ */
export function LifeImpactTile({ item }) {
  const level = item.level;
  return (
    <div
      className="rounded-2xl border bg-white p-4 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)]"
      style={{ borderColor: `${level.color}22` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[12.5px] font-semibold text-slate-900">{item.area}</div>
        <LevelBadge level={level} size="sm" />
      </div>
      <p className="text-[11px] leading-relaxed text-slate-600">{item.headline}</p>
      <div className="mt-3 relative h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.max(8, Math.min(100, item.percentage))}%`,
            background: `linear-gradient(90deg, ${level.color}77, ${level.color})`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   Category heatmap (Page 2)
   ============================================================ */
export function CategoryHeatmap({ normalized = [] }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {normalized.map((c) => (
        <div
          key={c.key}
          className="rounded-xl border p-2 flex flex-col items-center text-center"
          style={{
            background: c.level.soft,
            borderColor: c.level.border,
          }}
        >
          <div
            className="text-[12px] font-bold leading-none mb-1 tabular-nums"
            style={{ color: c.level.text }}
          >
            {Math.round(c.percentage)}%
          </div>
          <div
            className="text-[9px] font-semibold uppercase tracking-wide leading-tight"
            style={{ color: c.level.text }}
          >
            {c.short}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Recommendation card (Page 3)
   ============================================================ */
export function RecommendationCard({ rec, accent = '#6366F1' }) {
  return (
    <div
      className="rounded-2xl border bg-white p-4 h-full shadow-[0_4px_16px_-10px_rgba(15,23,42,0.12)]"
      style={{ borderColor: `${accent}26` }}
    >
      <div
        className="inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] mb-2"
        style={{ background: `${accent}1A`, color: accent }}
      >
        {rec.title}
      </div>
      <p className="text-[11.5px] text-slate-600 mb-2.5 leading-relaxed">{rec.blurb}</p>
      <ul className="space-y-1.5">
        {rec.items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-[11.5px] text-slate-800">
            <span
              className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full shrink-0"
              style={{ background: accent }}
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   Strength chip (Page 3)
   ============================================================ */
export function StrengthCard({ item }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 p-3.5 h-full">
      <div className="text-[12.5px] font-semibold text-slate-900">{item.title}</div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{item.blurb}</p>
    </div>
  );
}

/* ============================================================
   Leadership pillar mini-card
   ============================================================ */
export function LeadershipPillar({ pillar, color = '#6366F1' }) {
  const statusLabel =
    pillar.value >= 65
      ? 'Showing strongly'
      : pillar.value >= 40
        ? 'Emerging'
        : 'Room to grow';
  return (
    <div
      className="rounded-xl border border-slate-100 bg-white px-2.5 py-2 flex items-center gap-2 min-w-0 h-full shadow-[0_2px_10px_-6px_rgba(15,23,42,0.10)]"
      title={`${pillar.label}: ${pillar.value}% — ${statusLabel}`}
    >
      <div className="shrink-0">
        <MiniRing value={pillar.value} color={color} size={40} stroke={4} />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 truncate"
          title={pillar.label}
        >
          {pillar.label}
        </div>
        <div
          className="text-[10px] text-slate-500 mt-0.5 leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {statusLabel}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Section title
   ============================================================ */
export function SectionTitle({ kicker, title, subtitle, accent = '#94a3b8' }) {
  return (
    <div className="px-10">
      {kicker ? (
        <div
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5"
          style={{ color: accent }}
        >
          {kicker}
        </div>
      ) : null}
      <h2 className="text-[18px] font-bold tracking-tight text-slate-900 leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1.5 text-[11.5px] text-slate-600 max-w-[640px] leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* ============================================================
   Confidence note (Quick screening banner)
   ============================================================ */
export function ConfidenceNote({ variant }) {
  if (variant !== 'quick') return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-[11px] flex items-start gap-2"
      style={{ background: '#F0F9FF', borderColor: '#BAE6FD', color: '#0369A1' }}
    >
      <span
        className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-bold text-white"
        style={{ background: '#0EA5E9' }}
      >
        i
      </span>
      <span>
        <strong className="font-semibold">Quick screening.</strong>{' '}
        This is a 10-question snapshot. Treat it as an early reflection — not a definitive picture.
        For deeper insight, take the full 30-question assessment.
      </span>
    </div>
  );
}
