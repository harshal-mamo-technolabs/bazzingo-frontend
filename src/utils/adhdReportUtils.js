/**
 * ADHD Report Utilities
 * --------------------------------------------------------------------
 * Pure, JSON-driven helpers powering the premium ADHD report.
 *
 * Hard rules:
 *  - Raw category totals MUST NEVER be compared directly.
 *  - All severity / radar / recommendation logic uses a NORMALIZED
 *    percentage: rawScore / maxPossibleScore * 100.
 *  - Question distribution is fixed (full or quick variant).
 */

/* ---------------- Distribution ---------------- */

export const CATEGORY_KEYS = [
  'inattention',
  'executive_dysfunction',
  'hyperactivity',
  'impulsivity',
  'emotional_regulation',
  'memory',
  'functional_impact',
];

export const FULL_DISTRIBUTION = {
  inattention: 7,
  executive_dysfunction: 6,
  hyperactivity: 4,
  impulsivity: 4,
  emotional_regulation: 3,
  memory: 3,
  functional_impact: 3,
};

export const QUICK_DISTRIBUTION = {
  inattention: 3,
  executive_dysfunction: 2,
  hyperactivity: 1,
  impulsivity: 1,
  emotional_regulation: 1,
  memory: 1,
  functional_impact: 1,
};

const PER_QUESTION_MAX = 4;

/* ---------------- Category metadata ---------------- */

export const CATEGORY_META = {
  inattention: {
    label: 'Inattention',
    short: 'Focus',
    blurb: 'Sustaining attention on routine or low-stimulation tasks.',
    accent: '#6366F1',
    soft: '#EEF2FF',
  },
  executive_dysfunction: {
    label: 'Executive Dysfunction',
    short: 'Executive',
    blurb: 'Planning, starting tasks, and switching between them.',
    accent: '#0EA5E9',
    soft: '#ECFEFF',
  },
  hyperactivity: {
    label: 'Hyperactivity',
    short: 'Restlessness',
    blurb: 'Physical or mental restlessness, difficulty settling.',
    accent: '#10B981',
    soft: '#ECFDF5',
  },
  impulsivity: {
    label: 'Impulsivity',
    short: 'Impulse',
    blurb: 'Acting or speaking quickly, sometimes before fully thinking it through.',
    accent: '#F59E0B',
    soft: '#FFFBEB',
  },
  emotional_regulation: {
    label: 'Emotional Regulation',
    short: 'Emotion',
    blurb: 'Intensity, speed and recovery of emotional responses.',
    accent: '#EC4899',
    soft: '#FDF2F8',
  },
  memory: {
    label: 'Memory',
    short: 'Recall',
    blurb: 'Short-term recall during everyday tasks and conversations.',
    accent: '#8B5CF6',
    soft: '#F5F3FF',
  },
  functional_impact: {
    label: 'Functional Impact',
    short: 'Impact',
    blurb: 'How these traits show up in work, study, and relationships.',
    accent: '#EF4444',
    soft: '#FEF2F2',
  },
};

/* ---------------- Severity ---------------- */

export const SEVERITY_BANDS = [
  { level: 0, label: 'Low',       min: 0,  max: 20,  color: '#10B981', text: '#047857', soft: '#ECFDF5', border: '#A7F3D0' },
  { level: 1, label: 'Mild',      min: 21, max: 40,  color: '#84CC16', text: '#4D7C0F', soft: '#F7FEE7', border: '#D9F99D' },
  { level: 2, label: 'Moderate',  min: 41, max: 60,  color: '#F59E0B', text: '#B45309', soft: '#FFFBEB', border: '#FCD34D' },
  { level: 3, label: 'High',      min: 61, max: 80,  color: '#F97316', text: '#C2410C', soft: '#FFF7ED', border: '#FED7AA' },
  { level: 4, label: 'Very High', min: 81, max: 100, color: '#EF4444', text: '#B91C1C', soft: '#FEF2F2', border: '#FECACA' },
];

export function severityForPercentage(pct) {
  const safe = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    SEVERITY_BANDS.find((b) => safe >= b.min && safe <= b.max) || SEVERITY_BANDS[0]
  );
}

/* ---------------- Detection & normalization ---------------- */

/**
 * Heuristically detect whether the response came from a full or quick test.
 * Falls back to FULL when unclear.
 */
export function detectDistribution({ totalScore = 0, byCategoryScores = {} } = {}) {
  const overQuickLimit = CATEGORY_KEYS.some((k) => {
    const max = (QUICK_DISTRIBUTION[k] || 0) * PER_QUESTION_MAX;
    return (byCategoryScores[k] || 0) > max;
  });
  if (overQuickLimit) return { kind: 'full', distribution: FULL_DISTRIBUTION };
  if (Number(totalScore) > sumMax(QUICK_DISTRIBUTION)) {
    return { kind: 'full', distribution: FULL_DISTRIBUTION };
  }
  // If all categories are 0 or unknown, default to full so visuals stay rich.
  return { kind: 'quick', distribution: QUICK_DISTRIBUTION };
}

function sumMax(distribution) {
  return Object.values(distribution).reduce(
    (acc, q) => acc + q * PER_QUESTION_MAX,
    0,
  );
}

/**
 * Normalize per-category raw scores into a complete, ordered array of
 * { key, label, raw, max, percentage, severity, accent, soft, blurb }.
 */
export function normalizeCategories(byCategoryScores = {}, distribution = FULL_DISTRIBUTION) {
  return CATEGORY_KEYS.map((key) => {
    const questions = distribution[key] || 0;
    const max = questions * PER_QUESTION_MAX;
    const raw = clampNonNeg(byCategoryScores[key]);
    const percentage = max > 0 ? round((raw / max) * 100) : 0;
    const severity = severityForPercentage(percentage);
    const meta = CATEGORY_META[key];
    return {
      key,
      label: meta.label,
      short: meta.short,
      blurb: meta.blurb,
      accent: meta.accent,
      soft: meta.soft,
      questions,
      raw,
      max,
      percentage,
      severity,
    };
  });
}

/* ---------------- Overall metrics ---------------- */

export function buildOverall({ totalScore = 0, normalized = [] } = {}) {
  const maxOverall = normalized.reduce((acc, c) => acc + c.max, 0) || 1;
  const rawTotal =
    typeof totalScore === 'number' && Number.isFinite(totalScore)
      ? totalScore
      : normalized.reduce((acc, c) => acc + c.raw, 0);
  const percentage = round((rawTotal / maxOverall) * 100);
  const severity = severityForPercentage(percentage);
  const elevatedCount = normalized.filter((c) => c.severity.level >= 3).length;
  const sortedByPct = [...normalized].sort((a, b) => b.percentage - a.percentage);
  return {
    rawTotal,
    maxOverall,
    percentage,
    severity,
    elevatedCount,
    topAreas: sortedByPct.slice(0, 3),
    sortedByPct,
  };
}

/* ---------------- Narrative engine ---------------- */

const CATEGORY_NARRATIVE = {
  inattention: {
    high: 'Sustaining focus on routine or low-stimulation tasks often feels effortful — even on light workdays, the mental cost is high. You may find yourself rereading the same sentence, drifting between tabs, or losing the thread of a conversation.',
    mid: 'You can lock in when something is interesting, but attention slips more easily on repetitive or admin-style tasks. Small interruptions tend to derail you longer than you expect.',
    low: 'Your attention regulation looks largely intact, with occasional drifts that are normal for most people.',
  },
  executive_dysfunction: {
    high: 'Starting and switching between tasks can feel disproportionately hard, even when you genuinely want to begin. Plans look clear in your head, yet the first concrete step stalls — that gap between intention and action is real, not laziness.',
    mid: 'Planning and prioritisation work most days, but stacking demands or unclear briefs can create stalls. You may rely on last-minute pressure to actually finish.',
    low: 'You generally translate intention into action with steady follow-through.',
  },
  hyperactivity: {
    high: "You may often feel an internal restlessness — thoughts and energy that don't fully settle even in quiet moments. Long meetings or sit-down tasks can feel physically uncomfortable.",
    mid: 'Periods of restlessness show up during longer sit-down tasks but typically pass with movement or a change of scene.',
    low: 'Physical and mental stillness come fairly easily to you.',
  },
  impulsivity: {
    high: 'Decisions can feel urgent in the moment, leading to quick choices, purchases or words that you sometimes reconsider afterwards. Waiting is harder than the situation often requires.',
    mid: "You're mostly deliberate, with occasional snap reactions in high-pressure or fast social moments.",
    low: 'Your decision pacing feels measured and considered.',
  },
  emotional_regulation: {
    high: 'Emotional intensity can swing quickly, and small frustrations sometimes feel disproportionately heavy. Recovering after a setback can take longer than you expect — this is a real feature of ADHD, not over-sensitivity.',
    mid: 'Most emotional shifts feel manageable, with some lingering reactivity under stress or sleep loss.',
    low: 'Your emotional baseline appears resilient and self-regulating.',
  },
  memory: {
    high: 'Short-term recall — appointments, names, where you set things — often slips. This adds an invisible mental load throughout the day and can quietly fuel anxiety.',
    mid: 'Memory mostly holds up, with occasional drop-offs during busy or multitasking periods.',
    low: 'Day-to-day recall feels reliable.',
  },
  functional_impact: {
    high: "These traits noticeably touch work, study, or relationships. Fatigue, friction and last-minute scrambles may show up more than you'd want.",
    mid: 'Daily life flows in general, but specific areas — deadlines, transitions, organisation — feel heavier than they should.',
    low: 'Your day-to-day functioning looks intact, with no significant ripple effects.',
  },
};

function bandKey(level) {
  if (level >= 3) return 'high';
  if (level === 2) return 'mid';
  return 'low';
}

export function narrativeFor(category) {
  if (!category) return '';
  return CATEGORY_NARRATIVE[category.key]?.[bandKey(category.severity.level)] || '';
}

/**
 * Build the personalized summary paragraph for page 1.
 */
export function buildSummaryParagraph({ firstName, overall, normalized }) {
  const name = (firstName || '').trim();
  const greet = name ? `${name}, your` : 'Your';
  const top = overall.topAreas
    .filter((c) => c.severity.level >= 2)
    .slice(0, 3)
    .map((c) => c.label.toLowerCase());
  const sev = overall.severity.label.toLowerCase();

  if (top.length === 0) {
    return `${greet} responses suggest a generally regulated ADHD profile (${sev}). A few traits showed up gently, but nothing points to a strongly elevated pattern across multiple areas.`;
  }

  const list =
    top.length === 1
      ? top[0]
      : top.slice(0, -1).join(', ') + ' and ' + top[top.length - 1];

  return `${greet} responses suggest a ${sev} ADHD-related pattern, with the clearest signal around ${list}. The detail on the next pages translates each area into the behaviours and emotional consequences they tend to produce in real life.`;
}

/* ---------------- Combination insights (Page 2) ---------------- */

const COMBOS = [
  {
    id: 'overwhelm-cycle',
    when: (m) => m.inattention >= 60 && m.executive_dysfunction >= 55,
    title: 'The procrastination–paralysis loop',
    explanation:
      "When attention slips and executive load is already high, even simple tasks start to look like a wall. You stare at them, switch to something easier, and the unfinished one quietly grows in weight.",
    feeling:
      'It often feels like laziness from the outside, but inside it is closer to overwhelm. The drain isn’t the task — it’s the constant effort of trying to start.',
    examples: [
      'Reading the same email three times before replying',
      'Postponing a 10-minute admin task for days',
      'Cleaning everything except the thing on the list',
    ],
  },
  {
    id: 'fast-decisions',
    when: (m) => m.impulsivity >= 55 && m.functional_impact >= 55,
    title: 'Quick decisions, lasting consequences',
    explanation:
      "High in-the-moment urgency combined with strong functional impact suggests choices made under pressure are showing up in deadlines, money, or relationships.",
    feeling:
      "There can be real relief in just acting — until the cost is felt later. This pattern responds well to a small built-in pause rather than willpower.",
    examples: [
      'Saying yes to things you immediately regret',
      'Late-night purchases that don’t survive the morning',
      'Sending messages you’d phrase differently after a walk',
    ],
  },
  {
    id: 'restless-mood',
    when: (m) => m.hyperactivity >= 55 && m.emotional_regulation >= 55,
    title: 'Restless energy spilling into mood',
    explanation:
      "Unsettled physical or mental energy is a heavy tax on emotional bandwidth. Small frustrations land harder when the system never quite gets to ‘calm’.",
    feeling:
      "You can feel both wired and depleted at the same time — and that combination is genuinely exhausting, not a personality flaw.",
    examples: [
      'Snappier reactions on long, focus-heavy days',
      'Difficulty falling asleep with a busy mind',
      'Needing movement before you can feel okay again',
    ],
  },
  {
    id: 'memory-load',
    when: (m) => m.memory >= 55 && m.executive_dysfunction >= 55,
    title: 'Working memory under siege',
    explanation:
      "When recall and executive control are both stretched, every plan needs a second copy somewhere outside your head — otherwise the system overflows.",
    feeling:
      "It’s the invisible part of ADHD: looking organised while running on constant low-grade anxiety about what you might be forgetting.",
    examples: [
      'Opening a tab and immediately forgetting why',
      'Remembering tasks only when you see the object',
      'Mentally rehearsing simple plans on repeat',
    ],
  },
  {
    id: 'focus-emotion',
    when: (m) => m.inattention >= 55 && m.emotional_regulation >= 55,
    title: 'Attention switching has an emotional cost',
    explanation:
      "Frequent context switches don’t just cost productivity — they leak into emotional state. By the end of the day the mind has done many small grief cycles for each lost thread.",
    feeling:
      "It can feel like being ‘fine’ in the morning and overwhelmed by 4pm without anything obviously dramatic having happened.",
    examples: [
      'Feeling drained after a meeting-heavy day',
      'Snapping at small things in the evening',
      'Needing a buffer before transitioning home/work',
    ],
  },
  {
    id: 'action-first',
    when: (m) => m.impulsivity >= 55 && m.hyperactivity >= 55,
    title: 'Action-first energy',
    explanation:
      "There’s a strong ‘move first, think later’ engine. It powers creativity and momentum, but without structure it can also stack up half-finished projects.",
    feeling:
      "When this is harnessed, it looks like courage and speed. When it isn’t, it looks like chaos — to you and to the people around you.",
    examples: [
      'Starting projects with great enthusiasm, dropping them fast',
      'Talking over people when an idea hits',
      'Constant tab-opening across interests',
    ],
  },
];

export function buildCombinationInsights(normalized = []) {
  const pcts = normalized.reduce((acc, c) => {
    acc[c.key] = c.percentage;
    return acc;
  }, {});
  const matched = COMBOS.filter((combo) => combo.when(pcts)).slice(0, 4);
  if (matched.length > 0) return matched;

  // Fallback: synthesise per top-2 category narratives so Page 2 never empties.
  const top = [...normalized].sort((a, b) => b.percentage - a.percentage).slice(0, 2);
  return top.map((c) => ({
    id: `single-${c.key}`,
    title: `${c.label} signal`,
    explanation: narrativeFor(c),
    feeling:
      c.severity.level >= 3
        ? 'This is the area most likely to be quietly costing you energy across the week.'
        : 'This shows up occasionally and is manageable with light structure.',
    examples: [],
  }));
}

/* ---------------- Life impact (Page 2 lower block) ---------------- */

export function buildLifeImpact(normalized = []) {
  const map = mapByKey(normalized);
  const pct = (k) => (map[k]?.percentage ?? 0);
  const high = (k) => pct(k) >= 55;
  return [
    {
      id: 'work',
      area: 'Work & Study',
      headline:
        high('inattention') || high('executive_dysfunction')
          ? 'Output is uneven — bursts of strong work mixed with stretches that take more effort than they should.'
          : 'Generally steady output, with normal dips on heavy or unclear work.',
      severity: severityForPercentage(
        Math.max(pct('inattention'), pct('executive_dysfunction'), pct('functional_impact')),
      ),
    },
    {
      id: 'routines',
      area: 'Routines & Organisation',
      headline:
        high('executive_dysfunction') || high('memory')
          ? 'Daily rhythms benefit from external anchors — calendars, alarms, and visible cues do a lot of the heavy lifting.'
          : 'Routines hold up most of the time, with occasional reshuffles.',
      severity: severityForPercentage(
        Math.max(pct('executive_dysfunction'), pct('memory')),
      ),
    },
    {
      id: 'relationships',
      area: 'Relationships',
      headline:
        high('impulsivity') || high('emotional_regulation')
          ? 'Closeness is strong, but heat-of-the-moment reactions can leave small bruises that need repair.'
          : 'Relational steadiness looks intact, with everyday wobbles only.',
      severity: severityForPercentage(
        Math.max(pct('impulsivity'), pct('emotional_regulation')),
      ),
    },
    {
      id: 'stress',
      area: 'Stress & Energy',
      headline:
        high('hyperactivity') || high('emotional_regulation') || high('functional_impact')
          ? 'A "wired and tired" pattern is likely — high baseline activation, slow downshifts, and harder recoveries.'
          : 'Stress recovery looks workable, with normal post-effort fatigue.',
      severity: severityForPercentage(
        Math.max(pct('hyperactivity'), pct('emotional_regulation'), pct('functional_impact')),
      ),
    },
  ];
}

/* ---------------- Recommendations (Page 3) ---------------- */

const REC_LIBRARY = {
  focus: {
    title: 'Focus optimisation',
    blurb: 'Lower the cost of starting and protect your deepest hour.',
    items: [
      'Use 25/5 timers for any task you have been avoiding for over a day.',
      'Pick a single "first action" so small it feels almost silly.',
      'Reserve one screen-clear hour for high-load work before notifications.',
    ],
  },
  executive: {
    title: 'Task starting & switching',
    blurb: 'Replace willpower with structure.',
    items: [
      'Write tomorrow’s top 3 the night before, not in the morning.',
      'When stuck, narrate the next step out loud — it bypasses the freeze.',
      'Batch similar admin tasks into a single 20-minute window.',
    ],
  },
  energy: {
    title: 'Restlessness & energy',
    blurb: 'Give your nervous system a place to land.',
    items: [
      'Move every 60–90 minutes — even 90 seconds resets focus.',
      'Use a standing desk or pacing call for hyperactivity-friendly meetings.',
      'Cap caffeine after early afternoon to protect downshift.',
    ],
  },
  impulse: {
    title: 'Decision pacing',
    blurb: 'Put a small pause between urge and action.',
    items: [
      'Use a 10-minute rule for any purchase over a personal threshold.',
      'Draft emotional messages in notes — send only after a walk.',
      'Say "let me come back to you" instead of an immediate yes.',
    ],
  },
  emotion: {
    title: 'Emotional regulation',
    blurb: 'Reduce the size of the swing, not the feeling itself.',
    items: [
      'Name the emotion out loud — naming halves the spike.',
      'Five slow exhales (twice as long as the inhale) before responding.',
      'Track sleep — under-sleep amplifies every other ADHD trait.',
    ],
  },
  memory: {
    title: 'External memory',
    blurb: 'Move load out of your head and into your environment.',
    items: [
      'Capture every commitment in one place within 30 seconds.',
      'Use visible cues for must-do tasks (paper, sticky note, kitchen).',
      'Voice-memo ideas in the moment instead of trying to remember.',
    ],
  },
  environment: {
    title: 'Environment design',
    blurb: 'Make focus the default, not the fight.',
    items: [
      'Hide your phone in another room during deep work.',
      'Set a "launch pad" by the door for keys, wallet, charger.',
      'Use noise-cancelling or brown noise during focus blocks.',
    ],
  },
  routine: {
    title: 'ADHD-friendly routines',
    blurb: 'Stack new habits onto existing anchors.',
    items: [
      'Pair vitamins / water with brushing teeth.',
      'Use a "shutdown ritual" to close the workday cleanly.',
      'Plan one non-negotiable joyful thing per day.',
    ],
  },
};

/**
 * Returns the most relevant 6 recommendation cards for this profile,
 * always including environment + routine as universal anchors.
 */
export function buildRecommendations(normalized = []) {
  const map = mapByKey(normalized);
  const out = [];
  const push = (key) => {
    if (!REC_LIBRARY[key]) return;
    if (out.some((r) => r.id === key)) return;
    out.push({ id: key, ...REC_LIBRARY[key] });
  };

  if ((map.inattention?.percentage ?? 0) >= 40) push('focus');
  if ((map.executive_dysfunction?.percentage ?? 0) >= 40) push('executive');
  if ((map.hyperactivity?.percentage ?? 0) >= 40) push('energy');
  if ((map.impulsivity?.percentage ?? 0) >= 40) push('impulse');
  if ((map.emotional_regulation?.percentage ?? 0) >= 40) push('emotion');
  if ((map.memory?.percentage ?? 0) >= 40) push('memory');

  push('environment');
  push('routine');

  while (out.length < 6) {
    const fallback = Object.keys(REC_LIBRARY).find(
      (k) => !out.some((r) => r.id === k),
    );
    if (!fallback) break;
    push(fallback);
  }
  return out.slice(0, 6);
}

export const ADHD_STRENGTHS = [
  {
    id: 'creativity',
    title: 'Creative leaps',
    blurb: 'Unusual associations and fresh angles when given space to wander.',
  },
  {
    id: 'curiosity',
    title: 'Deep curiosity',
    blurb: 'A genuine appetite for new ideas, topics and skills.',
  },
  {
    id: 'adaptability',
    title: 'Adaptability',
    blurb: 'Comfort in change and novelty where others stall.',
  },
  {
    id: 'hyperfocus',
    title: 'Hyperfocus potential',
    blurb: 'Capacity for very deep, long sessions on the right problem.',
  },
];

export const SUGGESTED_TOOLS = [
  { name: 'Calendar with reminders', why: 'External memory for every commitment.' },
  { name: 'Pomodoro / Focus timer', why: 'Pre-decided start/stop kills task paralysis.' },
  { name: 'Quick-capture notes', why: 'Catch ideas before they evaporate.' },
  { name: 'Habit tracker',         why: 'Compounds small wins without willpower.' },
];

/* ---------------- Helpers ---------------- */

function mapByKey(normalized) {
  return normalized.reduce((acc, c) => {
    acc[c.key] = c;
    return acc;
  }, {});
}

function clampNonNeg(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 0) return 0;
  return x;
}

function round(n) {
  return Math.round((Number(n) + Number.EPSILON) * 10) / 10;
}

/* ---------------- One-shot builder ---------------- */

/**
 * Build the entire view model for the report from raw API data.
 */
export function buildAdhdReportModel(apiData = {}) {
  const totalScore = Number(apiData.totalScore) || 0;
  const byCategoryScores = apiData.byCategoryScores || {};
  const userInfo = apiData.userInfo || {};
  const meta = apiData.assessmentMeta || {};

  const { kind, distribution } = detectDistribution({ totalScore, byCategoryScores });
  const normalized = normalizeCategories(byCategoryScores, distribution);
  const overall = buildOverall({ totalScore, normalized });
  const summaryParagraph = buildSummaryParagraph({
    firstName: userInfo.firstName,
    overall,
    normalized,
  });
  const insights = buildCombinationInsights(normalized);
  const lifeImpact = buildLifeImpact(normalized);
  const recommendations = buildRecommendations(normalized);

  return {
    variant: kind,
    distribution,
    user: userInfo,
    meta,
    normalized,
    overall,
    summaryParagraph,
    insights,
    lifeImpact,
    recommendations,
    strengths: ADHD_STRENGTHS,
    tools: SUGGESTED_TOOLS,
  };
}
