/**
 * Emotional Intelligence (EQ) Report Utilities
 * --------------------------------------------------------------------
 * JSON-driven scoring + narrative engine for the EQ report.
 *
 * Hard rules:
 *  - Raw category totals are NEVER compared directly. Categories carry
 *    different question counts and therefore different maximums.
 *  - All grading, charts, comparisons and narrative selection use a
 *    NORMALISED percentage:  rawScore / maxPossibleScore * 100.
 *  - Weights influence the OVERALL EQ score and recommendation priority.
 *    They never warp per-category percentages.
 *  - Reverse-scored questions never create negative totals (server-side
 *    reverses the 0–4 scale).
 *  - Tone is growth-oriented. No clinical / disorder framing.
 */

/* ============================================================
   Categories
   ============================================================ */

export const EI_CATEGORY_KEYS = [
  'self_awareness',
  'self_regulation',
  'empathy',
  'social_skills',
  'stress_management',
  'motivation',
];

/** Per-category metadata: visual + copy + relative importance. */
export const EI_CATEGORY_META = {
  self_awareness: {
    label: 'Self-Awareness',
    short: 'Awareness',
    blurb: 'How clearly you read your own emotions, reactions and inner state.',
    weight: 0.25,
    accent: '#6366F1', // indigo
    soft: '#EEF2FF',
    border: '#C7D2FE',
    text: '#4338CA',
  },
  self_regulation: {
    label: 'Self-Regulation',
    short: 'Regulation',
    blurb: 'How well you pause, recover, and stay in choice under pressure.',
    weight: 0.25,
    accent: '#0EA5E9', // sky
    soft: '#F0F9FF',
    border: '#BAE6FD',
    text: '#0369A1',
  },
  empathy: {
    label: 'Empathy',
    short: 'Empathy',
    blurb: 'How attuned you are to what others feel and need.',
    weight: 0.20,
    accent: '#EC4899', // pink
    soft: '#FDF2F8',
    border: '#FBCFE8',
    text: '#BE185D',
  },
  social_skills: {
    label: 'Social Skills',
    short: 'Social',
    blurb: 'How fluently you communicate, connect and influence others.',
    weight: 0.15,
    accent: '#14B8A6', // teal
    soft: '#F0FDFA',
    border: '#99F6E4',
    text: '#0F766E',
  },
  stress_management: {
    label: 'Stress Management',
    short: 'Resilience',
    blurb: 'How you metabolise pressure and return to baseline.',
    weight: 0.10,
    accent: '#8B5CF6', // violet
    soft: '#F5F3FF',
    border: '#DDD6FE',
    text: '#6D28D9',
  },
  motivation: {
    label: 'Motivation',
    short: 'Drive',
    blurb: 'Your internal pull toward meaningful goals and effort.',
    weight: 0.05,
    accent: '#F59E0B', // amber
    soft: '#FFFBEB',
    border: '#FDE68A',
    text: '#B45309',
  },
};

/* ============================================================
   Question distribution
   ============================================================ */

export const FULL_DISTRIBUTION = {
  self_awareness: 6,
  self_regulation: 6,
  empathy: 5,
  social_skills: 5,
  stress_management: 4,
  motivation: 4,
};

export const QUICK_DISTRIBUTION = {
  self_awareness: 2,
  self_regulation: 2,
  empathy: 2,
  social_skills: 2,
  stress_management: 1,
  motivation: 1,
};

const PER_QUESTION_MAX = 4;

/* ============================================================
   Level bands  (positive, growth-oriented language)
   ============================================================ */

export const EI_LEVEL_BANDS = [
  { level: 0, label: 'Emerging',    min: 0,  max: 20,  color: '#F59E0B', text: '#B45309', soft: '#FFFBEB', border: '#FDE68A' },
  { level: 1, label: 'Developing',  min: 21, max: 40,  color: '#38BDF8', text: '#0369A1', soft: '#F0F9FF', border: '#BAE6FD' },
  { level: 2, label: 'Moderate',    min: 41, max: 60,  color: '#6366F1', text: '#4338CA', soft: '#EEF2FF', border: '#C7D2FE' },
  { level: 3, label: 'Strong',      min: 61, max: 80,  color: '#10B981', text: '#047857', soft: '#ECFDF5', border: '#A7F3D0' },
  { level: 4, label: 'Exceptional', min: 81, max: 100, color: '#8B5CF6', text: '#6D28D9', soft: '#F5F3FF', border: '#DDD6FE' },
];

export function levelForPercentage(pct) {
  const safe = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    EI_LEVEL_BANDS.find((b) => safe >= b.min && safe <= b.max) || EI_LEVEL_BANDS[0]
  );
}

/* ============================================================
   Detection & normalisation
   ============================================================ */

/**
 * Heuristically detect whether the response came from a full (30Q) or
 * quick (10Q) assessment. Prefers the explicit meta value when present.
 */
export function detectDistribution({
  totalScore = 0,
  byCategoryScores = {},
  assessmentType,
} = {}) {
  if (assessmentType === 'full') return { kind: 'full', distribution: FULL_DISTRIBUTION };
  if (assessmentType === 'quick') return { kind: 'quick', distribution: QUICK_DISTRIBUTION };

  const overQuickLimit = EI_CATEGORY_KEYS.some((k) => {
    const max = (QUICK_DISTRIBUTION[k] || 0) * PER_QUESTION_MAX;
    return (byCategoryScores[k] || 0) > max;
  });
  if (overQuickLimit) return { kind: 'full', distribution: FULL_DISTRIBUTION };

  if (Number(totalScore) > sumMax(QUICK_DISTRIBUTION)) {
    return { kind: 'full', distribution: FULL_DISTRIBUTION };
  }
  return { kind: 'quick', distribution: QUICK_DISTRIBUTION };
}

function sumMax(distribution) {
  return Object.values(distribution).reduce(
    (acc, q) => acc + q * PER_QUESTION_MAX,
    0,
  );
}

/**
 * Normalise per-category raw scores into a complete, ordered list of
 * `{ key, label, short, blurb, accent, soft, border, weight, raw, max,
 *    percentage, level, questions }` objects, sorted in the canonical
 * category order.
 */
export function normalizeCategories(byCategoryScores = {}, distribution = FULL_DISTRIBUTION) {
  return EI_CATEGORY_KEYS.map((key) => {
    const meta = EI_CATEGORY_META[key];
    const questions = distribution[key] || 0;
    const max = questions * PER_QUESTION_MAX;
    const raw = clampNonNeg(byCategoryScores[key]);
    const percentage = max > 0 ? round((raw / max) * 100) : 0;
    const level = levelForPercentage(percentage);
    return {
      key,
      label: meta.label,
      short: meta.short,
      blurb: meta.blurb,
      accent: meta.accent,
      soft: meta.soft,
      border: meta.border,
      text: meta.text,
      weight: meta.weight,
      questions,
      raw,
      max,
      percentage,
      level,
    };
  });
}

/* ============================================================
   Overall (weighted) EQ index
   ============================================================ */

export function buildOverall({ normalized = [] } = {}) {
  if (!normalized.length) {
    return {
      percentage: 0,
      level: levelForPercentage(0),
      rawTotal: 0,
      maxOverall: 0,
      weightedPercentage: 0,
      simplePercentage: 0,
      topAreas: [],
      growthAreas: [],
      strongCount: 0,
    };
  }

  const rawTotal = normalized.reduce((acc, c) => acc + c.raw, 0);
  const maxOverall = normalized.reduce((acc, c) => acc + c.max, 0);
  const simplePercentage = maxOverall > 0 ? round((rawTotal / maxOverall) * 100) : 0;

  const totalWeight =
    normalized.reduce((acc, c) => acc + (c.weight || 0), 0) || 1;
  const weightedPercentage = round(
    normalized.reduce((acc, c) => acc + c.percentage * (c.weight || 0), 0) / totalWeight,
  );

  const percentage = weightedPercentage;
  const level = levelForPercentage(percentage);

  const sortedDesc = [...normalized].sort((a, b) => b.percentage - a.percentage);
  const sortedAsc = [...normalized].sort((a, b) => a.percentage - b.percentage);

  return {
    rawTotal,
    maxOverall,
    percentage,
    weightedPercentage,
    simplePercentage,
    level,
    topAreas: sortedDesc.slice(0, 3),
    growthAreas: sortedAsc.slice(0, 3),
    strongCount: normalized.filter((c) => c.level.level >= 3).length,
  };
}

/* ============================================================
   Confidence framing  (10Q reports use softer language)
   ============================================================ */

const CONFIDENCE = {
  full: {
    suggests: 'indicates',
    appears: 'consistently shows',
    likely: 'reliably',
    your: 'Your responses indicate',
    summary: 'This report reflects clear patterns across your responses.',
  },
  quick: {
    suggests: 'suggests',
    appears: 'appears to',
    likely: 'often',
    your: 'Your responses suggest',
    summary: 'This is a quick screening — read it as an early indicator, not a definitive picture.',
  },
};

export function confidenceFor(variant) {
  return CONFIDENCE[variant] || CONFIDENCE.full;
}

/* ============================================================
   Per-category narrative copy
   ============================================================ */

const CATEGORY_NARRATIVE = {
  self_awareness: {
    high: 'You appear to read your own emotions with real clarity. Even mid-reaction, you can usually name what you are feeling — which gives you the rare power to choose a response instead of being chosen by it.',
    mid: 'You notice your emotions most of the time, especially after the moment has passed. With a small pause habit, you can move from reactive to reflective faster.',
    low: 'Emotions sometimes register more as energy than as language. Naming the feeling — even silently — is the single biggest unlock here.',
  },
  self_regulation: {
    high: 'Under pressure, your reactions feel chosen, not hijacked. You can hold tension without spilling it onto people around you — that is leadership behaviour.',
    mid: 'You generally stay measured, with occasional snap reactions when stress stacks. Tiny resets (breath, water, walk) turn those moments into wins.',
    low: 'Strong emotions can feel like they take the steering wheel. Building a 90-second pause before responding will change a surprising amount of your life.',
  },
  empathy: {
    high: 'You pick up on what others are feeling before they say it out loud. People feel seen around you — that is a quiet superpower in any room.',
    mid: 'You read people well in familiar contexts and may miss subtler cues when stressed or busy. Slowing down in conversations sharpens this fast.',
    low: 'You may default to logic when people need feeling. Asking "how is this landing for you?" twice a day will compound enormously.',
  },
  social_skills: {
    high: 'You move through social situations with fluency — connecting, influencing and de-escalating without forcing it. People naturally orient around you.',
    mid: 'You communicate well one-on-one and may dial down in larger or unfamiliar groups. Practising one direct "ask" per day expands your range quickly.',
    low: 'Social moments sometimes cost more energy than they should. Starting with low-stakes interactions builds the muscle without depleting you.',
  },
  stress_management: {
    high: 'You recover quickly. Hard days do not bleed into the next morning, because you have ways — even small ones — of metabolising tension.',
    mid: 'You handle ordinary pressure well but feel it accumulate during stacked weeks. A reliable shutdown ritual would buy you back hours.',
    low: 'Stress tends to linger in the body and mind, even when the trigger is over. Small daily release habits matter more than big monthly ones.',
  },
  motivation: {
    high: 'You are pulled forward by purpose more than pushed by pressure. That intrinsic engine is rare and worth protecting.',
    mid: 'You can get going on most things and may stall when goals feel abstract. Translating wants into the next concrete step keeps your momentum.',
    low: 'Effort feels heaviest when the "why" is unclear. Reconnecting any task to a personal meaning — even a tiny one — restarts the engine.',
  },
};

export function categoryNarrative(key, percentage) {
  const meta = CATEGORY_NARRATIVE[key];
  if (!meta) return '';
  if (percentage >= 65) return meta.high;
  if (percentage >= 40) return meta.mid;
  return meta.low;
}

/* ============================================================
   Personalised summary paragraph (Page 1)
   ============================================================ */

export function buildSummaryParagraph({
  firstName,
  overall,
  normalized,
  variant = 'full',
}) {
  const c = confidenceFor(variant);
  const top = overall.topAreas?.[0];
  const grow = overall.growthAreas?.[0];
  const greet = firstName ? `${firstName}, ` : '';

  if (!top || !grow) {
    return `${greet}your responses ${c.suggests} a meaningful emotional intelligence profile. The pages ahead translate it into language you can act on.`;
  }

  const overallLevelLabel = overall.level.label.toLowerCase();

  const topLabel = top.label.toLowerCase();
  const growLabel = grow.label.toLowerCase();

  const middle =
    overall.percentage >= 61
      ? `Your responses ${c.appears} demonstrate solid emotional intelligence overall, with a particular strength in ${topLabel}.`
      : overall.percentage >= 41
        ? `${c.your} a balanced emotional profile, with notable signal in ${topLabel} and meaningful room to grow in ${growLabel}.`
        : `${c.your} an emerging emotional profile — there is real upside here, with ${growLabel} as the highest-leverage place to begin.`;

  const tail =
    variant === 'quick'
      ? ' This is a short screening, so think of it as a starting reflection rather than a final verdict.'
      : ' The pages ahead translate these patterns into specific behaviours, real-world moments and small daily moves.';

  return `${greet}your overall EQ profile sits in the ${overallLevelLabel} range. ${middle}${tail}`;
}

/* ============================================================
   Combination insights engine (Page 2 — the most important)
   ============================================================ */

function high(c) { return (c?.percentage ?? 0) >= 65; }
function low(c) { return (c?.percentage ?? 0) <= 40; }
function pct(c) { return c?.percentage ?? 0; }

/**
 * Library of combination insights. Each entry returns true when its
 * pattern is present and produces a card with title / interpretation /
 * real-world examples / growth note.
 */
const INSIGHT_RULES = [
  {
    id: 'relationship_intelligence',
    when: (m) => high(m.empathy) && high(m.social_skills),
    build: (m) => ({
      title: 'Relationship Intelligence',
      tone: 'strength',
      anchorKey: 'empathy',
      interpretation:
        'You combine deep attunement with natural communication. People feel both understood and able to move forward with you — a rare combination that sits at the heart of trusted leadership and lasting friendships.',
      examples: [
        'Friends bring you their real problems, not just the surface version.',
        'In tense meetings, you tend to be the one who reframes without flattening anyone.',
        'You sense unspoken tension and can name it gently.',
      ],
      growth:
        'Protect this strength from over-functioning for others. Let people sit in their own moment before you smooth it.',
      sourceScore: Math.max(pct(m.empathy), pct(m.social_skills)),
    }),
  },
  {
    id: 'inner_compass',
    when: (m) => high(m.self_awareness) && high(m.self_regulation),
    build: (m) => ({
      title: 'Inner Compass',
      tone: 'strength',
      anchorKey: 'self_awareness',
      interpretation:
        'You see your reactions clearly and you can stay in choice about them. That combination is what makes a person feel grounded — to themselves and to the people around them.',
      examples: [
        'You can disagree without dysregulating.',
        'You notice when you are tired or activated before it shapes a decision.',
        'You can revisit a moment honestly without shame spirals.',
      ],
      growth:
        'Share more of your inner reasoning out loud — people benefit from seeing how you arrive at calm.',
      sourceScore: Math.max(pct(m.self_awareness), pct(m.self_regulation)),
    }),
  },
  {
    id: 'sustained_drive',
    when: (m) => high(m.motivation) && high(m.self_regulation),
    build: (m) => ({
      title: 'Sustained Drive',
      tone: 'strength',
      anchorKey: 'motivation',
      interpretation:
        'You are pulled forward by what matters to you and you can hold a steady pace getting there. This is the engine behind long-arc work — books, businesses, healing, careers.',
      examples: [
        'You keep moving on goals after the initial excitement fades.',
        'You can defer immediate comfort for outcomes you value.',
        'You return to plans after disruptions instead of abandoning them.',
      ],
      growth:
        'Schedule active rest, not just collapse — the engine lasts longer when it is intentionally cooled.',
      sourceScore: Math.max(pct(m.motivation), pct(m.self_regulation)),
    }),
  },
  {
    id: 'empathic_overwhelm',
    when: (m) => high(m.empathy) && low(m.stress_management),
    build: (m) => ({
      title: 'Empathic Overwhelm',
      tone: 'growth',
      anchorKey: 'stress_management',
      interpretation:
        'You feel deeply, but you may absorb more than you release. Without emotional boundaries, the same sensitivity that makes you a great friend can quietly drain you.',
      examples: [
        'You replay other people’s problems after the conversation ends.',
        'You feel responsible for fixing moods you did not create.',
        'You finish social days unusually tired even when nothing went wrong.',
      ],
      growth:
        'Build a short decompression ritual after emotional conversations — a walk, a journal line, a song. Small, predictable, daily.',
      sourceScore: 100 - pct(m.stress_management),
    }),
  },
  {
    id: 'pressure_reset',
    when: (m) => low(m.self_regulation) && low(m.stress_management),
    build: (m) => ({
      title: 'Pressure Reset',
      tone: 'growth',
      anchorKey: 'self_regulation',
      interpretation:
        'When pressure stacks, your system tends to stay activated. This is not a flaw — it is a nervous system asking for better tools. Resilience is built in small, repeatable ways.',
      examples: [
        'Hard days bleed into the next morning.',
        'A small frustration sometimes lands like a big one.',
        'It is hard to fully clock out, mentally.',
      ],
      growth:
        'Pick one daily reset (10 slow breaths, a walk without your phone, a short stretch). Anchor it to something you already do.',
      sourceScore: Math.max(100 - pct(m.self_regulation), 100 - pct(m.stress_management)),
    }),
  },
  {
    id: 'quiet_insight',
    when: (m) => high(m.self_awareness) && low(m.social_skills),
    build: (m) => ({
      title: 'Quiet Insight',
      tone: 'growth',
      anchorKey: 'social_skills',
      interpretation:
        'You have a rich inner world and you read yourself well, but you may keep more of it inside than you need to. Sharing even small portions out loud strengthens both connection and clarity.',
      examples: [
        'You often realise the right thing to say after the moment has passed.',
        'You feel things deeply but communicate them sparingly.',
        'You journal or think more than you talk.',
      ],
      growth:
        'Practice one honest sentence per day with someone safe — small disclosures, not big ones. Range grows from there.',
      sourceScore: 100 - pct(m.social_skills),
    }),
  },
  {
    id: 'discipline_first',
    when: (m) => high(m.self_regulation) && low(m.empathy),
    build: (m) => ({
      title: 'Discipline-First Style',
      tone: 'growth',
      anchorKey: 'empathy',
      interpretation:
        'You stay composed and outcome-focused under pressure — that is real strength. The opportunity is to add warmth to that composure, so people feel met as well as managed.',
      examples: [
        'You can hold the plan, but people sometimes feel "handled" rather than heard.',
        'You may default to logic in moments that needed feeling first.',
        'Tough conversations land more efficiently than gently.',
      ],
      growth:
        'Start tough conversations with one acknowledging sentence ("I can see this matters to you") before the practical part.',
      sourceScore: 100 - pct(m.empathy),
    }),
  },
  {
    id: 'meaning_engine',
    when: (m) => high(m.motivation) && high(m.self_awareness),
    build: (m) => ({
      title: 'Meaning Engine',
      tone: 'strength',
      anchorKey: 'motivation',
      interpretation:
        'You know what you value and you act from there. That alignment is what makes effort feel sustainable rather than performative.',
      examples: [
        'Your wins tend to feel earned rather than accidental.',
        'You can say no to good things to protect great things.',
        'You return to your "why" when motivation dips, not just to hype.',
      ],
      growth:
        'Document this clearly somewhere visible — values drift quietly when they are not written.',
      sourceScore: Math.max(pct(m.motivation), pct(m.self_awareness)),
    }),
  },
  {
    id: 'leadership_potential',
    when: (m) =>
      pct(m.self_regulation) >= 60 &&
      pct(m.empathy) >= 55 &&
      pct(m.social_skills) >= 55,
    build: (m) => ({
      title: 'Leadership Potential',
      tone: 'strength',
      anchorKey: 'social_skills',
      interpretation:
        'Composure, attunement and communication are pointing in the same direction. This is the shape of someone people would willingly follow — at work, in family, in community.',
      examples: [
        'People bring you decisions, not just complaints.',
        'You can hold tension in a room without escalating it.',
        'You translate emotion into next steps without dismissing it.',
      ],
      growth:
        'Look for one place each month to use this on purpose — mentorship, facilitation, advocacy. Skills atrophy when unused.',
      sourceScore: Math.min(pct(m.self_regulation), pct(m.empathy), pct(m.social_skills)),
    }),
  },
  {
    id: 'self_reflection_opportunity',
    when: (m) => low(m.self_awareness) && pct(m.self_regulation) >= 50,
    build: (m) => ({
      title: 'Self-Reflection Opportunity',
      tone: 'growth',
      anchorKey: 'self_awareness',
      interpretation:
        'You manage yourself well externally, but you may move past your own signals before they fully register. Naming the feeling earlier makes regulation cost less effort.',
      examples: [
        'You realise you were upset after the conversation has ended.',
        'You can describe what happened more easily than how it felt.',
        'You sometimes "power through" feelings that needed a pause.',
      ],
      growth:
        'A 30-second body scan twice a day brings the volume up on signals you are already half-noticing.',
      sourceScore: 100 - pct(m.self_awareness),
    }),
  },
];

/**
 * Generates a prioritised, deduped list of combination insights tailored
 * to the user's profile. We always return at least 4 cards to keep the
 * page visually balanced — falling back to top + growth categories.
 */
export function buildCombinationInsights(normalized = []) {
  const map = mapByKey(normalized);

  const matched = INSIGHT_RULES
    .filter((r) => r.when(map))
    .map((r) => r.build(map))
    .sort((a, b) => b.sourceScore - a.sourceScore);

  if (matched.length >= 4) return matched.slice(0, 6);

  // Fall back: top categories => "strength of the X" / "growth of the Y"
  const used = new Set(matched.map((m) => m.title));
  const fallback = [];

  const topSorted = [...normalized].sort((a, b) => b.percentage - a.percentage);
  for (const c of topSorted) {
    if (matched.length + fallback.length >= 4) break;
    if (c.percentage >= 60) {
      const t = `Strength: ${c.label}`;
      if (used.has(t)) continue;
      used.add(t);
      fallback.push({
        title: t,
        tone: 'strength',
        anchorKey: c.key,
        interpretation: categoryNarrative(c.key, c.percentage),
        examples: behaviourExamples(c.key, 'high'),
        growth: 'Make this an explicit part of how you describe yourself — strengths grow when they are claimed.',
        sourceScore: c.percentage,
      });
    }
  }
  const lowSorted = [...normalized].sort((a, b) => a.percentage - b.percentage);
  for (const c of lowSorted) {
    if (matched.length + fallback.length >= 4) break;
    const t = `Growth: ${c.label}`;
    if (used.has(t)) continue;
    used.add(t);
    fallback.push({
      title: t,
      tone: 'growth',
      anchorKey: c.key,
      interpretation: categoryNarrative(c.key, c.percentage),
      examples: behaviourExamples(c.key, c.percentage >= 40 ? 'mid' : 'low'),
      growth: 'Pick one small, daily practice tied to this area — repetition compounds far faster than intensity.',
      sourceScore: 100 - c.percentage,
    });
  }

  return [...matched, ...fallback].slice(0, 6);
}

const BEHAVIOUR_EXAMPLES = {
  self_awareness: {
    high: [
      'You can name an emotion before it names you.',
      'You catch internal shifts during conversations, not just after.',
      'You revisit your own behaviour without spiralling.',
    ],
    mid: [
      'You usually identify the feeling after the moment passes.',
      'You notice patterns over weeks more than within hours.',
      'You can describe what happened more readily than what you felt.',
    ],
    low: [
      'Feelings sometimes register as physical energy first.',
      'It is easier to describe events than the emotions inside them.',
      'You realise you were upset after — not during.',
    ],
  },
  self_regulation: {
    high: [
      'You can disagree without escalating.',
      'You hold tension without spilling it.',
      'You delay reaction long enough to choose response.',
    ],
    mid: [
      'You are measured on ordinary days and reactive on stacked ones.',
      'You can pause sometimes but not always.',
      'Stress occasionally borrows your tone of voice.',
    ],
    low: [
      'Strong feelings can take the wheel quickly.',
      'You may say something in the moment you would not say later.',
      'Recovery after a flare takes longer than you would like.',
    ],
  },
  empathy: {
    high: [
      'People feel seen around you.',
      'You read what is unsaid in the room.',
      'You sense moods before words confirm them.',
    ],
    mid: [
      'You read familiar people well, less so strangers.',
      'You notice cues more in calm than in stress.',
      'Friends sometimes describe you as a "good listener when present".',
    ],
    low: [
      'Logic shows up before feeling in your responses.',
      'You may move to solutions faster than people are ready for.',
      'Emotional cues feel like noise more than information.',
    ],
  },
  social_skills: {
    high: [
      'You connect quickly across different kinds of people.',
      'You can de-escalate a room.',
      'You influence without performing.',
    ],
    mid: [
      'You are warm one-on-one and quieter in groups.',
      'You can lead familiar conversations and stall in unfamiliar ones.',
      'You may rehearse important conversations more than feels normal.',
    ],
    low: [
      'Social situations cost more energy than they should.',
      'Important things get said by message instead of in person.',
      'Group dynamics feel hard to track in real time.',
    ],
  },
  stress_management: {
    high: [
      'Hard days do not leak into tomorrow.',
      'You have small reliable ways of releasing tension.',
      'You know your warning signs and respect them.',
    ],
    mid: [
      'You handle ordinary pressure well.',
      'Stacked weeks accumulate in your body.',
      'You sometimes mistake exhaustion for laziness.',
    ],
    low: [
      'Stress lingers after the trigger is gone.',
      'Sleep, food or temper shifts during pressure.',
      'You can find it hard to fully switch off.',
    ],
  },
  motivation: {
    high: [
      'You can do hard things without being pushed.',
      'You return to plans after disruptions.',
      'Your work tends to align with what you value.',
    ],
    mid: [
      'You get started easily when goals are concrete.',
      'You stall when the "why" is vague.',
      'Initial excitement carries you further than long-term intent.',
    ],
    low: [
      'Effort feels heaviest when meaning is unclear.',
      'You start more things than you finish.',
      'External pressure motivates you more than internal pull.',
    ],
  },
};

function behaviourExamples(key, band /* 'high' | 'mid' | 'low' */) {
  return (BEHAVIOUR_EXAMPLES[key] && BEHAVIOUR_EXAMPLES[key][band]) || [];
}

/* ============================================================
   Real-world Life Impact tiles
   ============================================================ */

const LIFE_AREAS = [
  {
    id: 'communication',
    area: 'Communication',
    drivers: ['social_skills', 'empathy', 'self_regulation'],
    high: 'You communicate with warmth and structure — people leave conversations feeling clearer, not just heard.',
    mid: 'You communicate well on calm days; pressure narrows your range. Small slowing-down habits help most.',
    low: 'Important things sometimes get said wrong, late, or not at all. Naming the feeling before the request is the unlock.',
  },
  {
    id: 'leadership',
    area: 'Leadership & Influence',
    drivers: ['self_regulation', 'empathy', 'social_skills', 'motivation'],
    high: 'You influence by composure and connection — people follow you because they feel safe and aligned, not pressured.',
    mid: 'You lead well when you can prepare; spontaneous leadership feels harder. Practising small live moments builds it fastest.',
    low: 'Leadership currently costs you more than it gives back. Build one strength at a time before stacking responsibility.',
  },
  {
    id: 'relationships',
    area: 'Relationships',
    drivers: ['empathy', 'self_awareness', 'social_skills'],
    high: 'You bring presence and curiosity into your relationships. People trust you with the real version of themselves.',
    mid: 'You connect deeply with the right people. Widening that circle is more about consistency than charisma.',
    low: 'Relationships sometimes feel transactional or tiring. Start with reliability — small, predictable warmth compounds.',
  },
  {
    id: 'resilience',
    area: 'Resilience & Well-being',
    drivers: ['stress_management', 'self_regulation', 'self_awareness'],
    high: 'You recover well from setbacks and you protect your nervous system on purpose. That is the long game done right.',
    mid: 'You hold up under ordinary pressure but feel worn by long ones. A boring, repeatable recovery routine matters most.',
    low: 'Stress lingers in your body and choices. Tiny, daily release habits move this faster than monthly retreats.',
  },
];

function bandForAvg(avg) {
  if (avg >= 65) return 'high';
  if (avg >= 40) return 'mid';
  return 'low';
}

export function buildLifeImpact(normalized = []) {
  const map = mapByKey(normalized);
  return LIFE_AREAS.map((a) => {
    const vals = a.drivers.map((k) => map[k]?.percentage ?? 0);
    const avg = vals.length ? Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) : 0;
    const band = bandForAvg(avg);
    const headline = a[band];
    const level = levelForPercentage(avg);
    return {
      id: a.id,
      area: a.area,
      headline,
      percentage: avg,
      level,
    };
  });
}

/* ============================================================
   Recommendation engine
   ============================================================ */

const REC_LIBRARY = {
  self_awareness: {
    title: 'Sharpen self-awareness',
    blurb: 'Tiny moves that turn the volume up on signals you are already half-noticing.',
    items: [
      'Two daily 30-second body scans — once mid-morning, once before bed.',
      'Label one emotion in one sentence after every meaningful conversation.',
      'Keep a "what surprised me about myself today" line in your notes app.',
    ],
  },
  self_regulation: {
    title: 'Build the 90-second pause',
    blurb: 'Most emotional spikes pass in 90 seconds — the goal is to outlast them, not suppress them.',
    items: [
      'Inhale 4 / exhale 6, three times, before high-charge replies.',
      'Drink a full glass of water during any escalating conversation.',
      'Pre-decide one phrase ("let me think and come back") for high-pressure moments.',
    ],
  },
  empathy: {
    title: 'Deepen empathy without absorbing',
    blurb: 'Stay attuned to others without taking on what is not yours to carry.',
    items: [
      'Ask "how is this landing for you?" once a day, then actually wait.',
      'Reflect what you heard before responding to anything emotional.',
      'Notice the urge to fix — replace with one validating sentence first.',
    ],
  },
  social_skills: {
    title: 'Expand social range',
    blurb: 'Build comfort across different rooms by practising small, repeatable moves.',
    items: [
      'Initiate one low-stakes interaction per day with a new person.',
      'Practise one direct request per day, even if small.',
      'Send a "thinking of you" message once a week — relational fitness compounds.',
    ],
  },
  stress_management: {
    title: 'Reset the nervous system daily',
    blurb: 'Resilience is built in small, boring, repeatable ways — not in extreme breaks.',
    items: [
      'A 10-minute screen-free walk most days, ideally outdoors.',
      'A consistent wind-down ritual 60 minutes before sleep.',
      'A weekly "off-shore" hour with no inputs, no goals, no phone.',
    ],
  },
  motivation: {
    title: 'Reconnect to your why',
    blurb: 'Sustained drive is built on meaning more than discipline.',
    items: [
      'Write your top three "why I bother" statements somewhere visible.',
      'Pick the next single concrete step for any goal that feels stuck.',
      'Pair every hard task with one source of immediate, honest reward.',
    ],
  },
  communication: {
    title: 'Communicate emotion clearly',
    blurb: 'Most emotional issues are communication issues in disguise.',
    items: [
      'Begin tough conversations by acknowledging the other person’s feeling.',
      'Use "I felt … when …" framing instead of "you always / you never".',
      'Send one appreciative message per day without expecting a reply.',
    ],
  },
  leadership: {
    title: 'Lead from grounded warmth',
    blurb: 'People follow composure with care, not control without it.',
    items: [
      'Open hard meetings by naming the emotional reality, not just the agenda.',
      'Ask "what would help you do your best work this week?" weekly.',
      'Praise specifically; correct privately; thank often.',
    ],
  },
  daily_habits: {
    title: 'Daily emotional habits',
    blurb: 'Small, daily, boring — that is where emotional intelligence actually grows.',
    items: [
      'Two minutes of stillness before opening your phone in the morning.',
      'One feeling labelled honestly each evening.',
      'One act of attention to someone you care about — every day.',
    ],
  },
};

/**
 * Builds a six-card recommendation set tailored to the user's profile,
 * de-duplicated, with universal habits always included at the end.
 */
export function buildRecommendations(normalized = []) {
  const map = mapByKey(normalized);
  const out = [];
  const used = new Set();
  const push = (id) => {
    if (used.has(id)) return;
    const rec = REC_LIBRARY[id];
    if (!rec) return;
    used.add(id);
    out.push({ id, ...rec });
  };

  // Pick growth categories first (low → mid).
  const sortedAsc = [...normalized].sort((a, b) => a.percentage - b.percentage);
  for (const c of sortedAsc) {
    if (out.length >= 4) break;
    if (c.percentage < 60) push(c.key);
  }

  // Combination boosters.
  if (
    (map.empathy?.percentage ?? 0) >= 55 &&
    (map.social_skills?.percentage ?? 0) < 65
  ) push('communication');
  if (
    (map.self_regulation?.percentage ?? 0) >= 55 &&
    (map.social_skills?.percentage ?? 0) >= 50
  ) push('leadership');

  // Universal closers.
  push('self_awareness');
  push('daily_habits');

  while (out.length < 6) {
    const fallback = Object.keys(REC_LIBRARY).find((k) => !used.has(k));
    if (!fallback) break;
    push(fallback);
  }
  return out.slice(0, 6);
}

/* ============================================================
   Strengths profile
   ============================================================ */

export const EI_STRENGTHS = [
  {
    id: 'self_understanding',
    title: 'Self-understanding',
    blurb: 'You learn from your own behaviour faster than most.',
  },
  {
    id: 'presence',
    title: 'Presence',
    blurb: 'You make people feel they have your full attention.',
  },
  {
    id: 'resilience',
    title: 'Resilience',
    blurb: 'You bounce back from setbacks without losing yourself.',
  },
  {
    id: 'authenticity',
    title: 'Authenticity',
    blurb: 'You communicate honestly without needing to perform.',
  },
];

/** Personalised tools / app suggestions. */
export const EI_TOOLS = [
  { name: 'Daily journal (3 lines)', why: 'Captures emotional patterns without overhead.' },
  { name: 'Breath app or timer',     why: 'Gives the 90-second pause a real on-ramp.' },
  { name: 'Calm / Headspace',        why: 'Trains attention regulation in small daily doses.' },
  { name: 'Therapy or coaching',     why: 'Single biggest accelerator for self-awareness.' },
];

/* ============================================================
   Page 3 — Daily habits and leadership snapshot
   ============================================================ */

export function buildDailyHabits(normalized = []) {
  const map = mapByKey(normalized);
  const habits = [
    'Two minutes of stillness before your phone, every morning.',
    'One feeling labelled honestly, every evening.',
    'One act of attention to someone you love, every day.',
  ];
  if ((map.stress_management?.percentage ?? 0) < 50) habits.push('One screen-free walk per day.');
  if ((map.self_awareness?.percentage ?? 0) < 50) habits.push('A 30-second body scan twice a day.');
  if ((map.empathy?.percentage ?? 0) >= 60) habits.push('One reflective listening pause per conversation.');
  if ((map.motivation?.percentage ?? 0) < 50) habits.push('Re-read your "why" statement at lunch.');
  return habits.slice(0, 6);
}

export function buildLeadershipSnapshot(normalized = []) {
  const map = mapByKey(normalized);
  const composure = pct(map.self_regulation);
  const attunement = pct(map.empathy);
  const communication = pct(map.social_skills);
  const drive = pct(map.motivation);
  const score = Math.round(
    composure * 0.35 + attunement * 0.30 + communication * 0.25 + drive * 0.10,
  );
  return {
    score,
    level: levelForPercentage(score),
    pillars: [
      { key: 'composure', label: 'Composure', value: composure },
      { key: 'attunement', label: 'Attunement', value: attunement },
      { key: 'communication', label: 'Communication', value: communication },
      { key: 'drive', label: 'Drive', value: drive },
    ],
  };
}

/* ============================================================
   Helpers
   ============================================================ */

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

/* ============================================================
   One-shot view model builder
   ============================================================ */

/**
 * Builds the full view-model the report component will consume.
 * The component itself stays purely presentational.
 */
export function buildEiReportModel(apiData = {}) {
  const totalScore = Number(apiData.totalScore) || 0;
  const byCategoryScores = apiData.byCategoryScores || {};
  const userInfo = apiData.userInfo || {};
  const meta = apiData.assessmentMeta || {};

  const { kind, distribution } = detectDistribution({
    totalScore,
    byCategoryScores,
    assessmentType: meta.assessmentType,
  });

  const normalized = normalizeCategories(byCategoryScores, distribution);
  const overall = buildOverall({ normalized });
  const confidence = confidenceFor(kind);
  const summaryParagraph = buildSummaryParagraph({
    firstName: userInfo.firstName,
    overall,
    normalized,
    variant: kind,
  });
  const insights = buildCombinationInsights(normalized);
  const lifeImpact = buildLifeImpact(normalized);
  const recommendations = buildRecommendations(normalized);
  const habits = buildDailyHabits(normalized);
  const leadership = buildLeadershipSnapshot(normalized);

  return {
    variant: kind,
    distribution,
    user: userInfo,
    meta,
    confidence,
    normalized,
    overall,
    summaryParagraph,
    insights,
    lifeImpact,
    recommendations,
    habits,
    leadership,
    strengths: EI_STRENGTHS,
    tools: EI_TOOLS,
  };
}
