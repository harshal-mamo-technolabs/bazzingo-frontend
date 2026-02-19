import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import Button from '../../components/Form/Button';
import { ArrowLeft, Play, Volume2, VolumeX, RotateCcw, Trophy, ChevronRight, ChevronLeft, Clock } from 'lucide-react';

// ============================================================================
// CONSTANTS - Joyful dark theme with warm accents
// ============================================================================
const COLORS = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  backgroundAlt: 'linear-gradient(145deg, #2d3436 0%, #000000 100%)',
  surface: '#FFFFFF',
  surfaceLight: '#F8F9FA',
  border: '#DEE2E6',
  primary: '#FF6B3E',
  text: '#212529',
  textMuted: '#6C757D',
  success: '#28A745',
  pathColors: [
    '#FF6B3E', // Orange (primary)
    '#00D9FF', // Cyan
    '#FFD93D', // Golden Yellow
    '#6BCB77', // Fresh Green
    '#FF4757', // Vibrant Red
    '#9B59B6', // Purple
    '#3498DB', // Blue
    '#F39C12', // Amber
  ],
};

// Fun, gender-neutral emojis
const EMOJI_PAIRS = [
  { emoji: '🚀', color: COLORS.pathColors[0] },
  { emoji: '⚡', color: COLORS.pathColors[1] },
  { emoji: '🔥', color: COLORS.pathColors[2] },
  { emoji: '🎯', color: COLORS.pathColors[3] },
  { emoji: '💎', color: COLORS.pathColors[4] },
  { emoji: '🌟', color: COLORS.pathColors[5] },
  { emoji: '🎮', color: COLORS.pathColors[6] },
  { emoji: '⚽', color: COLORS.pathColors[7] },
];

const FLOATING_EMOJIS = ['✨', '🌙', '⭐', '💫', '🎲', '🎪', '🎨', '🏆'];

const DOT_RADIUS = 28;
const PATH_WIDTH = 10;
const HIT_TOLERANCE = 32;
const BOUNDARY_PADDING = 8;

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  Easy: { time: 180, label: 'Easy', levels: 5 },
  Moderate: { time: 120, label: 'Moderate', levels: 8 },
  Hard: { time: 90, label: 'Hard', levels: 10 },
};

// Using polar coordinates for safer positioning within circular boundary
const polarToCartesian = (angle, radiusPercent) => {
  const maxRadius = 38;
  const r = (radiusPercent / 100) * maxRadius;
  const x = 50 + r * Math.cos(angle * Math.PI / 180);
  const y = 50 + r * Math.sin(angle * Math.PI / 180);
  return { x, y };
};

const createLevels = () => [
  // Level 1: Simple 2 pairs - opposite corners
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(225, 80), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(45, 80), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(315, 80), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(135, 80), pairId: 1 },
    ],
  },
  // Level 2: 3 pairs
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(210, 85), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(30, 85), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(330, 85), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(150, 85), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(270, 75), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(90, 75), pairId: 2 },
    ],
  },
  // Level 3: 3 pairs scattered
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(225, 60), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(45, 60), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(180, 80), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(0, 80), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(270, 85), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(90, 85), pairId: 2 },
    ],
  },
  // Level 4: 4 pairs - compass points + diagonals
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(0, 80), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(180, 80), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(90, 80), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(270, 80), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(45, 55), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(225, 55), pairId: 2 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(135, 55), pairId: 3 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(315, 55), pairId: 3 },
    ],
  },
  // Level 5: 4 pairs tight
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(200, 75), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(20, 75), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(340, 75), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(160, 75), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(180, 40), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(0, 40), pairId: 2 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(270, 70), pairId: 3 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(90, 70), pairId: 3 },
    ],
  },
  // Level 6: 5 pairs
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(225, 90), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(45, 90), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(315, 90), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(135, 90), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(270, 85), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(90, 85), pairId: 2 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(180, 85), pairId: 3 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(0, 85), pairId: 3 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(225, 50), pairId: 4 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(45, 50), pairId: 4 },
    ],
  },
  // Level 7: 5 pairs challenge
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(240, 80), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(60, 80), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(270, 75), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(90, 75), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(180, 70), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(0, 70), pairId: 2 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(210, 45), pairId: 3 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(30, 45), pairId: 3 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(300, 80), pairId: 4 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(120, 80), pairId: 4 },
    ],
  },
  // Level 8: 6 pairs
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(210, 85), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(30, 85), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(270, 90), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(90, 90), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(330, 85), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(150, 85), pairId: 2 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(180, 80), pairId: 3 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(0, 80), pairId: 3 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(225, 45), pairId: 4 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(45, 45), pairId: 4 },
      { ...EMOJI_PAIRS[5], ...polarToCartesian(315, 45), pairId: 5 },
      { ...EMOJI_PAIRS[5], ...polarToCartesian(135, 45), pairId: 5 },
    ],
  },
  // Level 9: 6 pairs complex
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(200, 80), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(20, 80), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(250, 85), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(70, 85), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(290, 85), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(110, 85), pairId: 2 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(340, 80), pairId: 3 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(160, 80), pairId: 3 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(180, 50), pairId: 4 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(0, 50), pairId: 4 },
      { ...EMOJI_PAIRS[5], ...polarToCartesian(270, 40), pairId: 5 },
      { ...EMOJI_PAIRS[5], ...polarToCartesian(90, 40), pairId: 5 },
    ],
  },
  // Level 10: 7 pairs ultimate
  {
    dots: [
      { ...EMOJI_PAIRS[0], ...polarToCartesian(225, 90), pairId: 0 },
      { ...EMOJI_PAIRS[0], ...polarToCartesian(45, 90), pairId: 0 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(270, 95), pairId: 1 },
      { ...EMOJI_PAIRS[1], ...polarToCartesian(90, 95), pairId: 1 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(315, 90), pairId: 2 },
      { ...EMOJI_PAIRS[2], ...polarToCartesian(135, 90), pairId: 2 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(180, 90), pairId: 3 },
      { ...EMOJI_PAIRS[3], ...polarToCartesian(0, 90), pairId: 3 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(210, 55), pairId: 4 },
      { ...EMOJI_PAIRS[4], ...polarToCartesian(30, 55), pairId: 4 },
      { ...EMOJI_PAIRS[5], ...polarToCartesian(330, 55), pairId: 5 },
      { ...EMOJI_PAIRS[5], ...polarToCartesian(150, 55), pairId: 5 },
      { ...EMOJI_PAIRS[6], x: 50, y: 50, pairId: 6 },
      { ...EMOJI_PAIRS[6], ...polarToCartesian(270, 30), pairId: 6 },
    ],
  },
];

const LEVELS = createLevels();

// ============================================================================
// STYLES - Joyful dark theme with warm accents
// ============================================================================
const gameStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
    50% { transform: translateY(-15px) rotate(10deg); opacity: 0.3; }
  }

  @keyframes emoji-pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
  }

  @keyframes emoji-wiggle {
    0%, 100% { transform: translate(-50%, -50%) rotate(-3deg) scale(1); }
    25% { transform: translate(-50%, -50%) rotate(3deg) scale(1.02); }
    50% { transform: translate(-50%, -50%) rotate(-3deg) scale(1.05); }
    75% { transform: translate(-50%, -50%) rotate(3deg) scale(1.02); }
  }

  @keyframes connected-glow {
    0%, 100% { 
      transform: translate(-50%, -50%) scale(1); 
      filter: drop-shadow(0 0 8px currentColor);
    }
    50% { 
      transform: translate(-50%, -50%) scale(1.08); 
      filter: drop-shadow(0 0 16px currentColor);
    }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 62, 0.3); }
    50% { box-shadow: 0 0 40px rgba(255, 107, 62, 0.5); }
  }

  @keyframes border-dance {
    0% { border-color: rgba(255, 107, 62, 0.5); }
    33% { border-color: rgba(0, 217, 255, 0.5); }
    66% { border-color: rgba(255, 217, 61, 0.5); }
    100% { border-color: rgba(255, 107, 62, 0.5); }
  }

  @keyframes countdown-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animated-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0.25;
    background: linear-gradient(135deg, #0f3460, #16213e, #FF6B3E, #FFD93D, #00D9FF);
    background-size: 300% 300%;
    animation: gradient-shift 18s ease infinite;
  }

  .floating-shape {
    animation: float var(--duration) ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .emoji-pulse { animation: emoji-pulse 1.5s ease-in-out infinite; }
  .emoji-wiggle { animation: emoji-wiggle 2s ease-in-out infinite; }
  .connected-glow { animation: connected-glow 1.5s ease-in-out infinite; }
  .slide-up { animation: slide-up 0.3s ease-out; }
  .glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
  .border-dance { animation: border-dance 4s linear infinite; }
  .rotate-slow { animation: rotate-slow 20s linear infinite; }
  .twinkle { animation: twinkle 2s ease-in-out infinite; }
  .countdown-pulse { animation: countdown-pulse 0.5s ease infinite; }

  .btn-3d {
    transition: all 0.15s ease;
    transform-style: preserve-3d;
  }
  .btn-3d:hover { transform: translateY(-2px); }
  .btn-3d:active { transform: translateY(2px); }
`;

// ============================================================================
// SOUND UTILITIES
// ============================================================================
const createAudioContext = () => {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
};

const playSound = (audioContext, type, isMuted) => {
  if (!audioContext || isMuted) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;

  switch (type) {
    case 'draw':
      oscillator.frequency.setValueAtTime(440 + Math.random() * 100, now);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      oscillator.start(now);
      oscillator.stop(now + 0.04);
      break;
    case 'complete':
      oscillator.frequency.setValueAtTime(659, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      break;
    case 'levelComplete': {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.15, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
      break;
    }
    case 'cancel':
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      break;
    case 'select':
      oscillator.frequency.setValueAtTime(520, now);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      oscillator.start(now);
      oscillator.stop(now + 0.08);
      break;
    case 'timeout':
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      break;
    default:
      break;
  }
};

// ============================================================================
// GEOMETRY UTILITIES
// ============================================================================
const distance = (p1, p2) => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

const pointToSegmentDistance = (p, a, b) => {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ap = { x: p.x - a.x, y: p.y - a.y };
  const abLenSq = ab.x * ab.x + ab.y * ab.y;
  if (abLenSq === 0) return distance(p, a);
  let t = (ap.x * ab.x + ap.y * ab.y) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  const closest = { x: a.x + t * ab.x, y: a.y + t * ab.y };
  return distance(p, closest);
};

const segmentsIntersect = (a1, a2, b1, b2) => {
  const ccw = (A, B, C) => {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  };
  return ccw(a1, b1, b2) !== ccw(a2, b1, b2) && ccw(a1, a2, b1) !== ccw(a1, a2, b2);
};

const smoothPath = (points, tension = 0.5) => {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension / 6;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 6;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 6;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

const isInsideCircle = (point, centerX, centerY, radius) => {
  const dist = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
  return dist <= radius - BOUNDARY_PADDING;
};

const generateFloatingShapes = () => {
  const shapes = [];
  for (let i = 0; i < 15; i++) {
    shapes.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 16 + Math.random() * 24,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      emoji: FLOATING_EMOJIS[Math.floor(Math.random() * FLOATING_EMOJIS.length)],
    });
  }
  return shapes;
};

// ============================================================================
// COMPONENTS
// ============================================================================
const FloatingBackground = () => {
  const shapes = useMemo(() => generateFloatingShapes(), []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map(shape => (
        <div
          key={shape.id}
          className="floating-shape absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            fontSize: shape.size,
            '--delay': `${shape.delay}s`,
            '--duration': `${shape.duration}s`,
          }}
        >
          <span className="twinkle" style={{ animationDelay: `${shape.delay}s` }}>
            {shape.emoji}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const ColorMatchCircleGame = () => {
  const location = useLocation();
  const audioContextRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastSoundTimeRef = useRef(0);
  const scoreRef = useRef(0);
  const timeRemainingRef = useRef(180);

  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [isMuted, setIsMuted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [paths, setPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [canvasSize, setCanvasSize] = useState(300);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [score, setScore] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  scoreRef.current = score;
  timeRemainingRef.current = timeRemaining;

  const settings = DIFFICULTY_SETTINGS[difficulty];
  const maxLevels = settings.levels;
  const level = LEVELS[currentLevel];
  const circleRadius = canvasSize / 2;
  const circleCenter = { x: circleRadius, y: circleRadius };

  useEffect(() => {
    audioContextRef.current = createAudioContext();
    return () => { audioContextRef.current?.close(); };
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const maxW = window.innerWidth * 0.85;
      const maxH = (window.innerHeight - 200) * 0.75;
      const size = Math.min(maxW, maxH, 380);
      setCanvasSize(size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        setCheckingDailyGame(true);
        const result = await getDailySuggestions();
        const games = result?.data?.suggestion?.games || [];
        const pathname = location?.pathname || '';
        const normalizePath = (p = '') => (String(p).split('?')[0].split('#')[0].trim().replace(/\/+$/, '') || '/');
        const matched = games.find((g) => normalizePath(g?.gameId?.url) === normalizePath(pathname));
        if (matched?.difficulty) {
          const d = String(matched.difficulty).toLowerCase();
          const map = { easy: 'Easy', medium: 'Moderate', moderate: 'Moderate', hard: 'Hard' };
          if (map[d] && DIFFICULTY_SETTINGS[map[d]]) {
            setIsDailyGame(true);
            setDailyGameDifficulty(map[d]);
            setDifficulty(map[d]);
          }
        }
      } catch (e) {
        console.error('Daily check failed', e);
      } finally {
        setCheckingDailyGame(false);
      }
    };
    check();
  }, [location?.pathname]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowInstructions(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || showLevelComplete) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          playSound(audioContextRef.current, 'timeout', isMuted);
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty,
            timeElapsed: settings.time,
          });
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, showLevelComplete, isMuted, difficulty, settings.time]);

  const toPixel = useCallback((percent) => {
    return (percent / 100) * canvasSize;
  }, [canvasSize]);

  const getDotAtPosition = useCallback((x, y) => {
    return level.dots.find(dot => {
      const dotX = toPixel(dot.x);
      const dotY = toPixel(dot.y);
      return distance({ x, y }, { x: dotX, y: dotY }) <= DOT_RADIUS + 8;
    });
  }, [level.dots, toPixel]);

  const touchesOtherPath = useCallback((point, excludePairId) => {
    for (const path of paths) {
      if (path.pairId === excludePairId) continue;
      for (let i = 0; i < path.points.length - 1; i++) {
        const dist = pointToSegmentDistance(point, path.points[i], path.points[i + 1]);
        if (dist < PATH_WIDTH + 4) return true;
      }
    }
    return false;
  }, [paths]);

  const crossesOtherPath = useCallback((from, to, excludePairId) => {
    for (const path of paths) {
      if (path.pairId === excludePairId) continue;
      for (let i = 0; i < path.points.length - 1; i++) {
        if (segmentsIntersect(from, to, path.points[i], path.points[i + 1])) return true;
      }
    }
    return false;
  }, [paths]);

  const touchesOtherDot = useCallback((point, excludePairId) => {
    return level.dots.some(dot => {
      if (dot.pairId === excludePairId) return false;
      const dotX = toPixel(dot.x);
      const dotY = toPixel(dot.y);
      return distance(point, { x: dotX, y: dotY }) < DOT_RADIUS + PATH_WIDTH / 2;
    });
  }, [level.dots, toPixel]);

  const getPointerPos = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const cancelActivePath = useCallback(() => {
    playSound(audioContextRef.current, 'cancel', isMuted);
    setActivePath(null);
    isDrawingRef.current = false;
  }, [isMuted]);

  const handlePointerDown = useCallback((e) => {
    if (gameState !== 'playing' || showLevelComplete) return;
    const pos = getPointerPos(e);
    const dot = getDotAtPosition(pos.x, pos.y);
    if (!dot) return;

    setPaths(prev => prev.filter(p => p.pairId !== dot.pairId));
    const dotPos = { x: toPixel(dot.x), y: toPixel(dot.y) };
    const newPath = {
      color: dot.color,
      points: [dotPos],
      pairId: dot.pairId,
      isComplete: false,
    };
    setActivePath(newPath);
    isDrawingRef.current = true;
    playSound(audioContextRef.current, 'select', isMuted);
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
  }, [gameState, getDotAtPosition, toPixel, isMuted, getPointerPos, showLevelComplete]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawingRef.current || !activePath || gameState !== 'playing') return;

    const pos = getPointerPos(e);
    
    if (!isInsideCircle(pos, circleCenter.x, circleCenter.y, circleRadius)) {
      cancelActivePath();
      return;
    }

    const lastPoint = activePath.points[activePath.points.length - 1];
    
    const minDist = 6;
    if (distance(pos, lastPoint) < minDist) return;

    if (touchesOtherPath(pos, activePath.pairId)) return;
    if (crossesOtherPath(lastPoint, pos, activePath.pairId)) return;
    if (touchesOtherDot(pos, activePath.pairId)) return;

    const startDotPos = activePath.points[0];
    let isComplete = false;
    let finalPoint = pos;

    const pairDots = level.dots.filter(d => d.pairId === activePath.pairId);
    for (const dot of pairDots) {
      const dotPos = { x: toPixel(dot.x), y: toPixel(dot.y) };
      const isStartDot = distance(dotPos, startDotPos) < DOT_RADIUS;
      if (!isStartDot && distance(pos, dotPos) < HIT_TOLERANCE) {
        isComplete = true;
        finalPoint = dotPos;
        break;
      }
    }

    const now = Date.now();
    if (now - lastSoundTimeRef.current > 80) {
      playSound(audioContextRef.current, 'draw', isMuted);
      lastSoundTimeRef.current = now;
    }

    setActivePath(prev => ({
      ...prev,
      points: [...prev.points, finalPoint],
      isComplete,
    }));

    if (isComplete) {
      playSound(audioContextRef.current, 'complete', isMuted);
    }
  }, [activePath, gameState, getPointerPos, touchesOtherPath, crossesOtherPath, touchesOtherDot, level.dots, toPixel, isMuted, circleCenter, circleRadius, cancelActivePath]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current || !activePath) return;
    isDrawingRef.current = false;
    if (activePath.isComplete && activePath.points.length > 1) {
      setPaths(prev => [...prev.filter(p => p.pairId !== activePath.pairId), activePath]);
    }
    setActivePath(null);
  }, [activePath]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const totalPairs = level.dots.length / 2;
    const completedPairs = paths.filter(p => p.isComplete).length;

    if (completedPairs === totalPairs) {
      playSound(audioContextRef.current, 'levelComplete', isMuted);
      setLevelsCompleted(prev => prev + 1);
      // Add score for completing level (more points for harder levels)
      const levelBonus = 20 + currentLevel * 5;
      setScore(prev => Math.min(200, prev + levelBonus));
      setTimeout(() => {
        nextLevel();
      }, 500);
    }
  }, [paths, level.dots.length, gameState, currentLevel, isMuted]);

  const startGame = useCallback(() => {
    setCurrentLevel(0);
    setPaths([]);
    setActivePath(null);
    setShowLevelComplete(false);
    setTimeRemaining(settings.time);
    setScore(0);
    setLevelsCompleted(0);
    setCompletionData(null);
    setGameState('playing');
  }, [settings.time]);

  const handleReset = useCallback(() => {
    setCompletionData(null);
    setGameState('ready');
  }, []);

  const nextLevel = useCallback(() => {
    if (currentLevel < maxLevels - 1) {
      setCurrentLevel(prev => prev + 1);
      setPaths([]);
      setActivePath(null);
      setShowLevelComplete(false);
    } else {
      // Game complete - add time bonus
      const timeBonus = Math.floor(timeRemaining / 2);
      const finalScore = Math.min(200, score + timeBonus);
      setScore(finalScore);
      setCompletionData({
        score: finalScore,
        isVictory: true,
        difficulty,
        timeElapsed: settings.time - timeRemaining,
      });
      setGameState('finished');
    }
  }, [currentLevel, maxLevels, timeRemaining, score, difficulty, settings.time]);

  const resetLevel = useCallback(() => {
    setPaths([]);
    setActivePath(null);
    setShowLevelComplete(false);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPaths = useMemo(() => {
    const allPaths = [...paths];
    if (activePath && activePath.points.length > 0) allPaths.push(activePath);

    return allPaths.map((path, idx) => {
      if (path.points.length < 1) return null;
      const d = path.points.length === 1 
        ? `M ${path.points[0].x} ${path.points[0].y} L ${path.points[0].x} ${path.points[0].y}`
        : smoothPath(path.points);

      return (
        <path
          key={`${path.pairId}-${idx}`}
          d={d}
          stroke={path.color}
          strokeWidth={PATH_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={path.isComplete ? 1 : 0.75}
          style={{
            filter: path.isComplete ? `drop-shadow(0 0 8px ${path.color})` : undefined,
          }}
        />
      );
    });
  }, [paths, activePath]);

  const instructionsModalContent = (
    <>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Objective</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Connect matching emoji pairs by drawing paths between them. Complete all levels before time runs out.</p>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Press Start to begin.</li>
          <li>Drag from one emoji to its matching pair (same emoji).</li>
          <li>Release to complete the path.</li>
          <li>Paths cannot cross each other or leave the circle.</li>
        </ul>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Scoring</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Level bonus increases each level. Remaining time at the end adds a bonus. Max score 200.</p>
      </section>
      <section>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Levels & difficulty</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Easy: {DIFFICULTY_SETTINGS.Easy.levels} levels, {formatTime(DIFFICULTY_SETTINGS.Easy.time)}. Moderate: {DIFFICULTY_SETTINGS.Moderate.levels} levels, {formatTime(DIFFICULTY_SETTINGS.Moderate.time)}. Hard: {DIFFICULTY_SETTINGS.Hard.levels} levels, {formatTime(DIFFICULTY_SETTINGS.Hard.time)}.</p>
      </section>
    </>
  );

  const difficultyEntries = isDailyGame && dailyGameDifficulty
    ? Object.entries(DIFFICULTY_SETTINGS).filter(([k]) => k === dailyGameDifficulty)
    : Object.entries(DIFFICULTY_SETTINGS);
  const selectedDifficulty = isDailyGame ? dailyGameDifficulty : difficulty;

  const playingContent = (
    <div className="relative w-full min-h-screen overflow-hidden" style={{ background: COLORS.background, fontFamily: 'Roboto, sans-serif' }}>
      <style>{gameStyles}</style>
      <div className="animated-bg"></div>
      <FloatingBackground />
      <div className="relative z-10 flex items-center justify-between p-3 bg-black/30 backdrop-blur-sm rounded-lg">
        <Button variant="ghost" size="icon" onClick={handleReset} className="text-white hover:bg-white/20">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl ${timeRemaining <= 15 ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-white'}`} style={{ animation: timeRemaining <= 15 ? 'countdown-pulse 0.5s ease infinite' : 'none' }}>
            <Clock size={18} />
            <span className="font-bold text-lg sm:text-xl">{formatTime(timeRemaining)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-300">
            <Trophy size={18} />
            <span className="font-bold text-lg sm:text-xl">{score}/200</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={resetLevel} className="text-white hover:bg-white/20">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="text-white hover:bg-white/20">
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      <div className="relative z-10 flex justify-center py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled={currentLevel === 0} onClick={() => { setCurrentLevel(prev => prev - 1); resetLevel(); }} className="text-white hover:bg-white/20 disabled:opacity-30 h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-white font-bold text-sm px-3 py-1 bg-orange-500/30 rounded-lg border border-orange-500/50">
            Level {currentLevel + 1} / {maxLevels}
          </span>
          <Button variant="ghost" size="icon" disabled={currentLevel >= levelsCompleted || currentLevel === maxLevels - 1} onClick={() => { setCurrentLevel(prev => prev + 1); resetLevel(); }} className="text-white hover:bg-white/20 disabled:opacity-30 h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-center p-4 min-h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="absolute rounded-full rotate-slow pointer-events-none border-dance" style={{ width: canvasSize + 40, height: canvasSize + 40, left: -20, top: -20, border: '3px dashed rgba(255, 107, 62, 0.4)' }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: canvasSize + 20, height: canvasSize + 20, left: -10, top: -10, border: '2px solid rgba(0, 217, 255, 0.2)' }} />
          <div ref={canvasRef} className="relative rounded-full cursor-crosshair touch-none overflow-hidden" style={{ width: canvasSize, height: canvasSize, background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)', boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.05), 0 0 40px rgba(255, 107, 62, 0.15)', border: '2px solid rgba(255, 107, 62, 0.3)' }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onPointerCancel={handlePointerUp}>
            <div className="absolute inset-4 rounded-full pointer-events-none" style={{ border: '1px dashed rgba(255, 255, 255, 0.1)' }} />
            <div className="absolute inset-8 rounded-full pointer-events-none" style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }} />
            <svg className="absolute inset-0 pointer-events-none" width={canvasSize} height={canvasSize}>
              {renderPaths}
            </svg>
            {level.dots.map((dot, idx) => {
              const pathForDot = paths.find(p => p.pairId === dot.pairId && p.isComplete);
              const isConnected = !!pathForDot;
              return (
                <div key={idx} className={`absolute flex items-center justify-center ${isConnected ? 'connected-glow' : 'emoji-wiggle'}`} style={{ left: toPixel(dot.x), top: toPixel(dot.y), width: DOT_RADIUS * 2, height: DOT_RADIUS * 2, transform: 'translate(-50%, -50%)', fontSize: DOT_RADIUS * 1.4, color: dot.color, zIndex: 10, filter: isConnected ? `drop-shadow(0 0 12px ${dot.color})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                  {dot.emoji}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );

  if (gameState === 'ready') {
    return (
      <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center p-4" style={{ background: COLORS.background, fontFamily: 'Roboto, sans-serif' }}>
        <style>{gameStyles}</style>
        <div className="animated-bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
        <div className="relative z-10 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center border border-white/10 shadow-2xl" style={{ background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            aria-label="How to play"
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            <span aria-hidden>❓</span> How to Play
          </button>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="connect-quest-instructions-title"
              className="fixed inset-0 flex items-center justify-center p-4 z-[1000]"
              style={{ background: 'rgba(0,0,0,0.88)' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                className="rounded-2xl flex flex-col max-h-[90vh] w-full max-w-md text-left"
                style={{ background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)', border: '2px solid rgba(255, 107, 62, 0.45)', color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
                  <h2 id="connect-quest-instructions-title" className="m-0 text-lg font-extrabold" style={{ color: '#FF6B3E' }}>
                    Connect Quest – How to Play
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowInstructions(false)}
                    aria-label="Close"
                    className="w-10 h-10 rounded-xl border border-white/20 bg-white/10 text-white text-xl flex items-center justify-center cursor-pointer hover:bg-white/20"
                  >
                    ×
                  </button>
                </div>
                <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0">
                  {instructionsModalContent}
                </div>
                <div className="px-5 pb-5 pt-4 border-t border-white/10 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowInstructions(false)}
                    className="w-full py-3 rounded-xl border-none text-white text-[15px] font-bold cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #FF6B3E, #e55a2b)', boxShadow: '0 4px 16px rgba(255, 107, 62, 0.35)' }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Connect Quest</h1>
          <p className="text-white/70 text-sm mb-6">Draw paths to connect matching emojis without crossing lines. Complete all levels before time runs out.</p>
          {checkingDailyGame && (
            <p className="text-white/60 text-sm mb-4">Checking daily challenge…</p>
          )}
          {!checkingDailyGame && isDailyGame && (
            <div className="mb-4 py-2 px-4 rounded-full text-sm font-semibold inline-block" style={{ background: 'rgba(255, 107, 62, 0.2)', border: '1px solid rgba(255, 107, 62, 0.5)', color: '#FF6B3E' }}>
              Daily Challenge
            </div>
          )}
          {!checkingDailyGame && (
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {difficultyEntries.map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => !isDailyGame && setDifficulty(key)}
                  disabled={isDailyGame}
                  className="rounded-xl px-5 py-4 min-w-[120px] flex flex-col items-center gap-1 transition-all border-2 cursor-pointer disabled:cursor-default"
                  style={{
                    background: (isDailyGame ? key === dailyGameDifficulty : difficulty === key) ? `${COLORS.primary}22` : 'rgba(255,255,255,0.06)',
                    borderColor: `${COLORS.primary}44`,
                    color: '#fff',
                  }}
                >
                  <span className="text-2xl">{key === 'Easy' ? '🟢' : key === 'Moderate' ? '🟡' : '🔴'}</span>
                  <span className="font-bold">{val.label}</span>
                  <span className="text-xs opacity-70">{val.levels} levels · {formatTime(val.time)}</span>
                </button>
              ))}
            </div>
          )}
          {!checkingDailyGame && (
            <Button
              onClick={startGame}
              className="w-full mt-4 py-4 rounded-xl font-bold text-base border-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FF6B3E, #e55a2b)', color: '#fff', boxShadow: '0 4px 20px rgba(255, 107, 62, 0.4)' }}
            >
              <Play className="h-5 w-5 mr-2 inline" />
              Start Game
            </Button>
          )}
        </div>
      </div>
    );
  }

  const c = completionData || {};
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        {playingContent}
      </div>
      {gameState === 'finished' && completionData != null && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Connect Quest"
          score={c.score}
          timeElapsed={c.timeElapsed ?? settings.time}
          gameTimeLimit={settings.time}
          isVictory={c.isVictory}
          difficulty={c.difficulty}
          customMessages={{ maxScore: 200 }}
        />
      )}
    </>
  );
};

export default ColorMatchCircleGame;
