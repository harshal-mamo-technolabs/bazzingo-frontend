import React, { forwardRef, useMemo } from 'react';
import dayjs from 'dayjs';
import { getPlatformLogoPath, getPlatformName } from '../../../config/accessControl';
import { buildEiReportModel } from '../../../utils/eiReportUtils.js';
import {
  A4_WIDTH_PX,
  LevelBadge,
  EQGauge,
  EQRadar,
  CategoryBar,
  StatCard,
  TopCategoryRow,
  InsightCard,
  LifeImpactTile,
  CategoryHeatmap,
  RecommendationCard,
  StrengthCard,
  LeadershipPillar,
  ConfidenceNote,
} from './parts.jsx';

/**
 * Premium Emotional Intelligence (EQ) report — a single tall printable
 * artefact: dashboard, deep insights, growth & action plan.
 *
 * The component is purely presentational. All scoring, narrative and
 * recommendation logic lives in `utils/eiReportUtils.js`. The PDF
 * pipeline (html-to-image + jsPDF) snapshots this node at full height.
 */
const EmotionalIntelligenceReport = forwardRef(function EmotionalIntelligenceReport(
  { apiData },
  ref,
) {
  const model = useMemo(() => buildEiReportModel(apiData || {}), [apiData]);
  const {
    user,
    meta,
    confidence,
    variant,
    normalized,
    overall,
    summaryParagraph,
    insights,
    lifeImpact,
    recommendations,
    habits,
    leadership,
    strengths,
    tools,
  } = model;

  const completedAt = meta?.completedAt ? dayjs(meta.completedAt) : dayjs();
  const dateStr = completedAt.format('DD MMM, YYYY');
  const displayName =
    [user?.firstName].filter(Boolean).join(' ').trim() || 'Friend';
  const ageStr = user?.age ? ` • Age ${user.age}` : '';
  const countryStr = user?.country ? ` • ${user.country}` : '';

  const accent = overall.level.color;
  const variantLabel = variant === 'quick' ? 'Quick screening' : 'Full assessment';

  return (
    <div
      ref={ref}
      style={{
        width: A4_WIDTH_PX,
        background: '#ffffff',
        color: '#0f172a',
        fontFamily:
          "system-ui, -apple-system, 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ─────────────────────── HEADER ─────────────────────── */}
      <div
        style={{
          background: `
            radial-gradient(1200px 600px at -10% -30%, ${accent}1A, transparent 60%),
            radial-gradient(900px 500px at 110% -10%, #EC489918, transparent 60%),
            linear-gradient(135deg, #ffffff 0%, ${accent}0E 100%)
          `,
          borderBottom: '1px solid #f1f5f9',
          padding: '36px 40px 28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: accent,
            }}
          >
            Personal report • {variantLabel}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              color: '#64748b',
            }}
          >
            <img src={getPlatformLogoPath()} alt="" style={{ height: 20 }} />
            <span style={{ fontWeight: 600 }}>Emotional Intelligence Report</span>
          </div>
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px',
            lineHeight: 1.22,
            letterSpacing: '-0.01em',
          }}
        >
          {displayName}, here is how your emotional intelligence is showing up
        </h1>
        <p style={{ fontSize: 11.5, color: '#64748b', margin: 0, lineHeight: 1.65 }}>
          Completed {dateStr}{ageStr}{countryStr}. {confidence.summary} This report is a
          self-awareness tool — not a clinical or diagnostic assessment.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════
          PAGE 1 — EMOTIONAL INTELLIGENCE DASHBOARD
          ════════════════════════════════════════════════════════ */}

      {/* SECTION 1 — Overall gauge + summary + stat cards */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            borderRadius: 22,
            border: '1px solid #f1f5f9',
            background: `
              linear-gradient(135deg, #ffffff 0%, ${accent}0A 50%, #EC489908 100%)
            `,
            padding: 24,
            boxShadow: '0 12px 36px -16px rgba(15,23,42,0.14)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '240px 1fr',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <EQGauge
                percentage={overall.percentage}
                level={overall.level}
                size={220}
                stroke={22}
                label="Overall EQ"
              />
              <div style={{ marginTop: 6 }}>
                <LevelBadge level={overall.level} size="lg" />
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: 8,
                }}
              >
                Your emotional intelligence snapshot
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: '#1e293b', margin: '0 0 16px' }}>
                {summaryParagraph}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
                <StatCard
                  kicker="Weighted EQ"
                  value={`${Math.round(overall.percentage)}%`}
                  sub={`${overall.level.label} band`}
                  accent={accent}
                />
                <StatCard
                  kicker="Strong areas"
                  value={`${overall.strongCount} / ${normalized.length}`}
                  sub="Score ≥ 61%"
                  accent="#10B981"
                />
                <StatCard
                  kicker="Dominant"
                  value={overall.topAreas[0]?.short || '—'}
                  sub={`${Math.round(overall.topAreas[0]?.percentage || 0)}% in ${overall.topAreas[0]?.label || ''}`}
                  accent={overall.topAreas[0]?.accent || '#6366F1'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {variant === 'quick' ? (
        <div style={{ padding: '14px 40px 0' }}>
          <ConfidenceNote variant={variant} />
        </div>
      ) : null}

      {/* SECTION 2 — Radar + top strengths + growth opportunities */}
      <div style={{ padding: '20px 40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div
            style={{
              borderRadius: 16,
              border: '1px solid #f1f5f9',
              background: '#ffffff',
              padding: 16,
              boxShadow: '0 4px 18px -12px rgba(15,23,42,0.10)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                Profile shape across all six EQ categories
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                All values normalised 0–100%
              </span>
            </div>
            <EQRadar normalized={normalized} width={360} height={230} accent={accent} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#94a3b8',
              }}
            >
              Top emotional strengths
            </div>
            {overall.topAreas.map((c, i) => (
              <TopCategoryRow key={c.key} index={i} category={c} mode="strength" />
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3 — Category progress bars */}
      <div style={{ padding: '20px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Category detail
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          All six emotional intelligence areas (normalised)
        </h2>
        <div
          style={{
            borderRadius: 16,
            border: '1px solid #f1f5f9',
            background: '#ffffff',
            padding: 18,
            boxShadow: '0 4px 16px -12px rgba(15,23,42,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: 32,
            }}
          >
            {normalized.map((c) => (
              <CategoryBar key={c.key} category={c} compact />
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4 — Leadership snapshot card */}
      <div style={{ padding: '20px 40px 0' }}>
        <div
          style={{
            borderRadius: 18,
            border: '1px solid #f1f5f9',
            background:
              'linear-gradient(135deg, #ffffff 0%, #EEF2FF 60%, #F5F3FF 100%)',
            padding: 18,
            boxShadow: '0 6px 24px -16px rgba(99,102,241,0.18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#6366F1',
                  marginBottom: 3,
                }}
              >
                Leadership & communication
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                How your profile translates into influence
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: leadership.level.color,
                  }}
                >
                  {leadership.score}%
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 600,
                    color: '#64748b',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}
                >
                  Leadership index
                </div>
              </div>
              <LevelBadge level={leadership.level} size="md" />
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '10px 12px',
              width: '100%',
            }}
          >
            {leadership.pillars.map((p) => (
              <div key={p.key} style={{ minWidth: 0 }}>
                <LeadershipPillar pillar={p} color="#6366F1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ margin: '30px 40px 0', height: 1, background: '#f1f5f9' }} />

      {/* ════════════════════════════════════════════════════════
          PAGE 2 — DEEP EMOTIONAL INSIGHTS
          ════════════════════════════════════════════════════════ */}

      <div style={{ padding: '22px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Deep emotional insights
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px',
            letterSpacing: '-0.01em',
          }}
        >
          What this looks like in everyday life
        </h2>
        <p
          style={{
            fontSize: 11.5,
            color: '#64748b',
            margin: '0 0 14px',
            lineHeight: 1.6,
          }}
        >
          {confidence.your.replace(/^./, (c) => c.toUpperCase())} a set of distinctive patterns.
          The cards below combine your category scores into how they tend to show up in real
          behaviour, relationships and decisions.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {insights.slice(0, 4).map((insight) => {
            const matched =
              normalized.find((c) => c.key === insight.anchorKey) || overall.topAreas[0];
            return (
              <InsightCard
                key={insight.title}
                insight={insight}
                level={matched?.level || overall.level}
              />
            );
          })}
        </div>
      </div>

      {/* LIFE IMPACT */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Life impact
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          How your EQ profile lands across four key life areas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {lifeImpact.map((item) => (
            <LifeImpactTile key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* HEATMAP */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Category heatmap
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          Normalised intensity across all six EQ categories
        </h2>
        <CategoryHeatmap normalized={normalized} />
        <p
          style={{
            fontSize: 10.5,
            color: '#94a3b8',
            fontStyle: 'italic',
            marginTop: 10,
            lineHeight: 1.55,
          }}
        >
          Bands follow a positive scale: Emerging → Developing → Moderate → Strong → Exceptional.
          Only normalised percentages are compared here — never raw category totals.
        </p>
      </div>

      {/* DIVIDER */}
      <div style={{ margin: '30px 40px 0', height: 1, background: '#f1f5f9' }} />

      {/* ════════════════════════════════════════════════════════
          PAGE 3 — PERSONAL GROWTH & ACTION PLAN
          ════════════════════════════════════════════════════════ */}

      <div style={{ padding: '22px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Personal growth & action plan
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px',
            letterSpacing: '-0.01em',
          }}
        >
          Small daily moves — designed for your profile
        </h2>
        <p
          style={{
            fontSize: 11.5,
            color: '#64748b',
            margin: '0 0 14px',
            lineHeight: 1.6,
          }}
        >
          Emotional intelligence grows in repetition, not intensity. These recommendations are
          chosen from the areas where your profile would benefit most.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} accent={accent} />
          ))}
        </div>
      </div>

      {/* GROWTH OPPORTUNITIES quick row */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Emotional growth opportunities
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          Three highest-leverage growth areas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {overall.growthAreas.map((c, i) => (
            <TopCategoryRow key={c.key} index={i} category={c} mode="growth" />
          ))}
        </div>
      </div>

      {/* STRENGTHS */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Strengths profile
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          Qualities your responses point toward
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {strengths.map((s) => (
            <StrengthCard key={s.id} item={s} />
          ))}
        </div>
      </div>

      {/* DAILY EMOTIONAL HABITS */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Daily emotional habits
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          Habits that compound your EQ over time
        </h2>
        <div
          style={{
            borderRadius: 16,
            border: '1px solid #f1f5f9',
            background: 'linear-gradient(135deg, #ffffff, #F8FAFC)',
            padding: 18,
            boxShadow: '0 4px 16px -10px rgba(15,23,42,0.08)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {habits.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 11.5,
                  color: '#334155',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: 8,
                    background: `${accent}1A`,
                    color: accent,
                    fontWeight: 700,
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ lineHeight: 1.55, paddingTop: 2 }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECOMMENDED TOOLKIT */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          Recommended toolkit
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          Books, apps and practices to support your growth
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {tools.map((t) => (
            <div
              key={t.name}
              style={{
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                background: '#ffffff',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>{t.why}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ENCOURAGEMENT */}
      <div style={{ padding: '24px 40px 0' }}>
        <div
          style={{
            borderRadius: 18,
            padding: '20px 24px',
            background:
              'linear-gradient(135deg, #EEF2FF 0%, #FDF2F8 50%, #F5F3FF 100%)',
            border: '1px solid #E2E8F0',
            boxShadow: '0 6px 24px -16px rgba(99,102,241,0.20)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#6366F1',
              marginBottom: 6,
            }}
          >
            A note before you close this
          </div>
          <p style={{ fontSize: 12, color: '#1e293b', margin: 0, lineHeight: 1.7 }}>
            {displayName}, emotional intelligence is not a fixed score — it is a practice. Whatever
            your profile looks like today, the same small acts of noticing, naming, pausing and
            choosing will keep moving it forward. Be generous with yourself on the way.
          </p>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div style={{ padding: '20px 40px 0' }}>
        <div
          style={{
            borderRadius: 16,
            border: '1px solid #f1f5f9',
            background: 'linear-gradient(135deg,#f8fafc,#ffffff)',
            padding: '16px 20px',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              marginBottom: 6,
            }}
          >
            Important note
          </div>
          <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.65, margin: 0 }}>
            This report is a <strong>self-awareness tool</strong> generated from your own
            responses. It is not a clinical assessment, a diagnostic instrument, or an
            employment evaluation. Emotional intelligence is influenced by context, season of
            life, sleep and many other factors — use this as a starting point for reflection,
            not as a fixed verdict.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          padding: '18px 40px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10,
          color: '#94a3b8',
          borderTop: '1px solid #f1f5f9',
          marginTop: 22,
        }}
      >
        <span>Generated {dayjs().format('DD MMM, YYYY • HH:mm')}</span>
        <span>{getPlatformName()} • Confidential emotional intelligence report</span>
      </div>
    </div>
  );
});

EmotionalIntelligenceReport.displayName = 'EmotionalIntelligenceReport';
export default EmotionalIntelligenceReport;
