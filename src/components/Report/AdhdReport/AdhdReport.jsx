import React, { forwardRef, useMemo } from 'react';
import dayjs from 'dayjs';
import { getPlatformLogoPath, getPlatformName } from '../../../config/accessControl';
import { buildAdhdReportModel } from '../../../utils/adhdReportUtils.js';
import {
  AdhdGauge,
  AdhdRadar,
  CategoryBar,
  StatCard,
  TopSymptomRow,
  SeverityBadge,
  InsightCard,
  LifeImpactTile,
  CategoryHeatmap,
  RecommendationCard,
  StrengthCard,
  A4_WIDTH_PX,
} from './parts.jsx';

/**
 * Premium ADHD report — single tall page, no artificial page breaks.
 * Snapshot the root ref to get one PNG, then create a custom-height PDF.
 */
const AdhdReport = forwardRef(function AdhdReport({ apiData }, ref) {
  const model = useMemo(() => buildAdhdReportModel(apiData || {}), [apiData]);
  const {
    user,
    meta,
    normalized,
    overall,
    summaryParagraph,
    insights,
    lifeImpact,
    recommendations,
    strengths,
    tools,
    variant,
  } = model;

  const completedAt = meta?.completedAt ? dayjs(meta.completedAt) : dayjs();
  const dateStr = completedAt.format('DD MMM, YYYY');
  const displayName = [user?.firstName].filter(Boolean).join(' ').trim() || 'Friend';
  const ageStr = user?.age ? ` • Age ${user.age}` : '';
  const countryStr = user?.country ? ` • ${user.country}` : '';

  const accent = overall.severity.color;

  return (
    <div
      ref={ref}
      style={{
        width: A4_WIDTH_PX,
        background: '#ffffff',
        color: '#0f172a',
        fontFamily: "system-ui, -apple-system, 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── HEADER STRIP ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${accent}18 0%, #6366F108 100%)`,
          borderBottom: '1px solid #f1f5f9',
          padding: '32px 40px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent }}>
            Personal report • {variant === 'quick' ? 'Quick' : 'Full'} assessment
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
            <img src={getPlatformLogoPath()} alt="" style={{ height: 20 }} />
            <span style={{ fontWeight: 600 }}>ADHD Trait Report</span>
          </div>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.25 }}>
          {displayName}, here is your ADHD self-understanding snapshot
        </h1>
        <p style={{ fontSize: 11.5, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          Completed {dateStr}{ageStr}{countryStr}. This summary is generated from your own
          responses and is meant for reflection — not diagnosis.
        </p>
      </div>

      {/* ── SECTION 1: GAUGE + SUMMARY ── */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            borderRadius: 20,
            border: '1px solid #f1f5f9',
            background: `linear-gradient(135deg, #ffffff, ${accent}08, #6366F105)`,
            padding: 24,
            boxShadow: '0 8px 30px -12px rgba(15,23,42,0.10)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AdhdGauge percentage={overall.percentage} severity={overall.severity} size={210} stroke={20} label="Overall index" />
              <div style={{ marginTop: 6 }}>
                <SeverityBadge severity={overall.severity} size="lg" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
                What your responses suggest
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: '#1e293b', margin: '0 0 16px' }}>
                {summaryParagraph}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <StatCard kicker="Total" value={`${overall.rawTotal} / ${overall.maxOverall}`} sub={`Normalised to ${Math.round(overall.percentage)}%`} accent="#FF6B3E" />
                <StatCard kicker="Areas elevated" value={`${overall.elevatedCount} / 7`} sub="Severity ≥ High" accent="#6366F1" />
                <StatCard kicker="Dominant" value={overall.topAreas[0]?.short || '—'} sub={`${Math.round(overall.topAreas[0]?.percentage || 0)}% in ${overall.topAreas[0]?.label || ''}`} accent="#0EA5E9" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: RADAR + TOP 3 ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div style={{ borderRadius: 16, border: '1px solid #f1f5f9', background: '#ffffff', padding: 16, boxShadow: '0 4px 18px -12px rgba(15,23,42,0.10)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>Profile shape across categories</span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>All values normalised 0–100%</span>
            </div>
            <AdhdRadar normalized={normalized} width={360} height={230} accent={accent} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
              Top 3 strongest areas
            </div>
            {overall.topAreas.map((c, i) => (
              <TopSymptomRow key={c.key} index={i} category={c} />
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: CATEGORY BARS ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
          Category detail
        </div>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          All seven ADHD trait areas (normalised)
        </h2>
        <div style={{ borderRadius: 16, border: '1px solid #f1f5f9', background: '#ffffff', padding: 16, boxShadow: '0 4px 16px -12px rgba(15,23,42,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32 }}>
            {normalized.map((c) => <CategoryBar key={c.key} category={c} compact />)}
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ margin: '28px 40px 0', height: 1, background: '#f1f5f9' }} />

      {/* ── SECTION 4: INSIGHTS ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
          Deep insights
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          What this looks like in everyday life
        </h2>
        <p style={{ fontSize: 11.5, color: '#64748b', margin: '0 0 14px', lineHeight: 1.55 }}>
          These insights combine your category scores and translate symptoms into the behaviours and emotional consequences they tend to produce.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {insights.slice(0, 4).map((insight) => {
            const matched = normalized.find((c) => insight.id?.endsWith(c.key)) || overall.topAreas[0];
            return (
              <InsightCard key={insight.id} insight={insight} severity={matched?.severity || overall.severity} />
            );
          })}
        </div>
      </div>

      {/* ── SECTION 5: LIFE IMPACT ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
          Life impact
        </div>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          How these traits show up across four life areas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {lifeImpact.map((item) => <LifeImpactTile key={item.id} item={item} />)}
        </div>
      </div>

      {/* ── SECTION 6: HEATMAP ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
          Category heatmap
        </div>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          Normalised intensity across all seven traits
        </h2>
        <CategoryHeatmap normalized={normalized} />
        <p style={{ fontSize: 10.5, color: '#94a3b8', fontStyle: 'italic', marginTop: 10, lineHeight: 1.5 }}>
          Colours follow the severity scale: Low → Mild → Moderate → High → Very High. Only normalised percentages are compared here — never raw totals.
        </p>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ margin: '28px 40px 0', height: 1, background: '#f1f5f9' }} />

      {/* ── SECTION 7: RECOMMENDATIONS ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
          Action plan
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          Small structural shifts, designed for your profile
        </h2>
        <p style={{ fontSize: 11.5, color: '#64748b', margin: '0 0 14px', lineHeight: 1.55 }}>
          ADHD responds better to environment design than to willpower. These suggestions are picked based on the areas that came up strongest for you.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {recommendations.map((rec) => <RecommendationCard key={rec.id} rec={rec} accent={accent} />)}
        </div>
      </div>

      {/* ── SECTION 8: STRENGTHS ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
          Strengths profile
        </div>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          ADHD traits also bring real advantages
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {strengths.map((s) => <StrengthCard key={s.id} item={s} />)}
        </div>
      </div>

      {/* ── SECTION 9: TOOLKIT ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
          Recommended toolkit
        </div>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          Tools that make daily life noticeably easier
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {tools.map((t) => (
            <div key={t.name} style={{ borderRadius: 12, border: '1px solid #f1f5f9', background: '#ffffff', padding: '10px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>{t.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ borderRadius: 16, border: '1px solid #f1f5f9', background: 'linear-gradient(135deg,#f8fafc,#ffffff)', padding: '16px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
            Important note
          </div>
          <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.65, margin: 0 }}>
            This report is generated from a self-administered screening and is{' '}
            <strong>not a clinical diagnosis</strong>. ADHD looks different in every person
            and can overlap with anxiety, sleep issues, burnout and other conditions. If these
            traits are significantly affecting your work, relationships or well-being, consider
            speaking to a licensed mental-health professional for a formal evaluation.
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: '14px 40px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', borderTop: '1px solid #f1f5f9', marginTop: 20 }}>
        <span>Generated {dayjs().format('DD MMM, YYYY • HH:mm')}</span>
        <span>{getPlatformName()} • Confidential self-assessment summary</span>
      </div>
    </div>
  );
});

AdhdReport.displayName = 'AdhdReport';
export default AdhdReport;
