import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

/* ───────── constants ───────── */
const TIME_LIMIT = 120;
const MAX_SCORE = 200;

const LEVELS = {
  easy:     { label: 'Easy',     emoji: '😊', count: 4,  studyTime: 8,  color: '#34d399' },
  moderate: { label: 'Moderate', emoji: '🤔', count: 6,  studyTime: 12, color: '#fbbf24' },
  hard:     { label: 'Hard',     emoji: '🧠', count: 8,  studyTime: 15, color: '#f87171' },
};

/* ───────── name pools ───────── */
const FIRST_NAMES = [
  'Alice','Bruno','Clara','Diego','Elena','Felix','Grace','Hugo',
  'Iris','James','Kayla','Leo','Maya','Nora','Oscar','Priya',
  'Quinn','Ravi','Sofia','Theo','Uma','Victor','Wendy','Xander',
];

/* ───────── face feature pools ───────── */
const SKIN_TONES = ['#FFDBB4','#E8B88A','#C68B59','#8D5524','#F5D0A9','#D4A574','#A0522D','#FFE0BD'];
const HAIR_COLORS = ['#2C1B0E','#5A3220','#8B4513','#D4A574','#C0392B','#F39C12','#1A1A2E','#6C3483'];
const HAIR_STYLES = ['short','medium','long','curly','bun','spiky','side','mohawk'];
const EYE_COLORS = ['#2E86C1','#27AE60','#8B4513','#1A1A2E','#6C3483','#D4AC0D'];
const ACCESSORIES = ['none','glasses','roundGlasses','earrings','headband','hat','bowtie','scarf'];
const MOUTH_STYLES = ['smile','grin','neutral','smirk','open','pout'];
const NOSE_STYLES = ['small','medium','wide','pointed','button'];
const FACE_SHAPES = ['round','oval','square','heart'];

function seededShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePeople(count) {
  const names = seededShuffle(FIRST_NAMES).slice(0, count);
  return names.map((name, i) => ({
    id: i,
    name,
    skin: SKIN_TONES[i % SKIN_TONES.length],
    hair: HAIR_COLORS[(i * 3) % HAIR_COLORS.length],
    hairStyle: HAIR_STYLES[i % HAIR_STYLES.length],
    eyes: EYE_COLORS[i % EYE_COLORS.length],
    accessory: ACCESSORIES[i % ACCESSORIES.length],
    mouth: MOUTH_STYLES[i % MOUTH_STYLES.length],
    nose: NOSE_STYLES[i % NOSE_STYLES.length],
    faceShape: FACE_SHAPES[i % FACE_SHAPES.length],
  }));
}

/* ───────── Audio helpers ───────── */
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);

    if (type === 'correct') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 523;
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.connect(g); o.start(); o.stop(ctx.currentTime + 0.3);
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 659;
      const g2 = ctx.createGain(); g2.connect(ctx.destination);
      g2.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o2.connect(g2); o2.start(ctx.currentTime + 0.1); o2.stop(ctx.currentTime + 0.4);
    } else if (type === 'wrong') {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 200;
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.connect(g); o.start(); o.stop(ctx.currentTime + 0.25);
    } else if (type === 'complete') {
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const gn = ctx.createGain(); gn.connect(ctx.destination);
        gn.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
        gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
        o.connect(gn); o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.35);
      });
    } else if (type === 'tick') {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      o.connect(g); o.start(); o.stop(ctx.currentTime + 0.08);
    } else if (type === 'study') {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 440;
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.connect(g); o.start(); o.stop(ctx.currentTime + 0.5);
    }
  } catch (e) { /* silent */ }
}

/* ───────── Face SVG component ───────── */
function FaceSVG({ person, size = 100 }) {
  const { skin, hair, hairStyle, eyes, accessory, mouth, faceShape } = person;
  const s = size;
  const cx = s / 2, cy = s / 2;
  const faceR = s * 0.36;

  const facePathMap = {
    round: `M${cx},${cy - faceR} A${faceR},${faceR} 0 1,1 ${cx},${cy + faceR} A${faceR},${faceR} 0 1,1 ${cx},${cy - faceR}`,
    oval: `M${cx},${cy - faceR * 1.1} A${faceR * 0.85},${faceR * 1.1} 0 1,1 ${cx},${cy + faceR * 1.1} A${faceR * 0.85},${faceR * 1.1} 0 1,1 ${cx},${cy - faceR * 1.1}`,
    square: `M${cx - faceR * 0.85},${cy - faceR * 0.9} Q${cx - faceR * 0.85},${cy - faceR} ${cx},${cy - faceR} Q${cx + faceR * 0.85},${cy - faceR} ${cx + faceR * 0.85},${cy - faceR * 0.9} L${cx + faceR * 0.85},${cy + faceR * 0.8} Q${cx + faceR * 0.85},${cy + faceR} ${cx},${cy + faceR} Q${cx - faceR * 0.85},${cy + faceR} ${cx - faceR * 0.85},${cy + faceR * 0.8} Z`,
    heart: `M${cx},${cy - faceR * 0.7} C${cx - faceR * 1.2},${cy - faceR * 1.4} ${cx - faceR * 1.2},${cy + faceR * 0.2} ${cx},${cy + faceR * 1.1} C${cx + faceR * 1.2},${cy + faceR * 0.2} ${cx + faceR * 1.2},${cy - faceR * 1.4} ${cx},${cy - faceR * 0.7}`,
  };

  const eyeY = cy - faceR * 0.1;
  const eyeSpacing = faceR * 0.35;
  const mouthY = cy + faceR * 0.45;

  const renderHair = () => {
    const topY = cy - faceR;
    switch (hairStyle) {
      case 'short':
        return <ellipse cx={cx} cy={topY + faceR * 0.15} rx={faceR * 0.95} ry={faceR * 0.45} fill={hair} />;
      case 'medium':
        return <>
          <ellipse cx={cx} cy={topY + faceR * 0.15} rx={faceR * 0.95} ry={faceR * 0.5} fill={hair} />
          <rect x={cx - faceR * 0.95} y={topY + faceR * 0.15} width={faceR * 0.25} height={faceR * 1.2} rx={faceR * 0.12} fill={hair} />
          <rect x={cx + faceR * 0.7} y={topY + faceR * 0.15} width={faceR * 0.25} height={faceR * 1.2} rx={faceR * 0.12} fill={hair} />
        </>;
      case 'long':
        return <>
          <ellipse cx={cx} cy={topY + faceR * 0.15} rx={faceR * 0.95} ry={faceR * 0.5} fill={hair} />
          <rect x={cx - faceR * 0.95} y={topY + faceR * 0.15} width={faceR * 0.25} height={faceR * 1.8} rx={faceR * 0.12} fill={hair} />
          <rect x={cx + faceR * 0.7} y={topY + faceR * 0.15} width={faceR * 0.25} height={faceR * 1.8} rx={faceR * 0.12} fill={hair} />
        </>;
      case 'curly':
        return <>
          {[-0.7, -0.35, 0, 0.35, 0.7].map((dx, i) => (
            <circle key={i} cx={cx + faceR * dx} cy={topY + faceR * 0.1} r={faceR * 0.28} fill={hair} />
          ))}
        </>;
      case 'bun':
        return <>
          <ellipse cx={cx} cy={topY + faceR * 0.15} rx={faceR * 0.9} ry={faceR * 0.4} fill={hair} />
          <circle cx={cx} cy={topY - faceR * 0.15} r={faceR * 0.3} fill={hair} />
        </>;
      case 'spiky':
        return <>
          {[-0.6, -0.3, 0, 0.3, 0.6].map((dx, i) => (
            <polygon key={i} points={`${cx + faceR * dx},${topY - faceR * 0.3} ${cx + faceR * dx - faceR * 0.12},${topY + faceR * 0.3} ${cx + faceR * dx + faceR * 0.12},${topY + faceR * 0.3}`} fill={hair} />
          ))}
        </>;
      case 'side':
        return <>
          <ellipse cx={cx - faceR * 0.2} cy={topY + faceR * 0.15} rx={faceR * 0.95} ry={faceR * 0.45} fill={hair} />
          <rect x={cx - faceR * 0.95} y={topY + faceR * 0.15} width={faceR * 0.3} height={faceR * 1.4} rx={faceR * 0.15} fill={hair} />
        </>;
      case 'mohawk':
        return <rect x={cx - faceR * 0.12} y={topY - faceR * 0.35} width={faceR * 0.24} height={faceR * 0.8} rx={faceR * 0.08} fill={hair} />;
      default:
        return <ellipse cx={cx} cy={topY + faceR * 0.15} rx={faceR * 0.9} ry={faceR * 0.4} fill={hair} />;
    }
  };

  const renderMouth = () => {
    switch (mouth) {
      case 'smile':
        return <path d={`M${cx - faceR * 0.25},${mouthY} Q${cx},${mouthY + faceR * 0.2} ${cx + faceR * 0.25},${mouthY}`} fill="none" stroke="#c0392b" strokeWidth={s * 0.02} strokeLinecap="round" />;
      case 'grin':
        return <path d={`M${cx - faceR * 0.3},${mouthY} Q${cx},${mouthY + faceR * 0.35} ${cx + faceR * 0.3},${mouthY}`} fill="#fff" stroke="#c0392b" strokeWidth={s * 0.02} />;
      case 'neutral':
        return <line x1={cx - faceR * 0.2} y1={mouthY} x2={cx + faceR * 0.2} y2={mouthY} stroke="#c0392b" strokeWidth={s * 0.02} strokeLinecap="round" />;
      case 'smirk':
        return <path d={`M${cx - faceR * 0.15},${mouthY} Q${cx + faceR * 0.1},${mouthY + faceR * 0.15} ${cx + faceR * 0.25},${mouthY - faceR * 0.05}`} fill="none" stroke="#c0392b" strokeWidth={s * 0.02} strokeLinecap="round" />;
      case 'open':
        return <ellipse cx={cx} cy={mouthY + faceR * 0.05} rx={faceR * 0.15} ry={faceR * 0.12} fill="#c0392b" />;
      case 'pout':
        return <path d={`M${cx - faceR * 0.2},${mouthY + faceR * 0.05} Q${cx},${mouthY - faceR * 0.1} ${cx + faceR * 0.2},${mouthY + faceR * 0.05}`} fill="none" stroke="#c0392b" strokeWidth={s * 0.025} strokeLinecap="round" />;
      default:
        return null;
    }
  };

  const renderAccessory = () => {
    switch (accessory) {
      case 'glasses':
        return <>
          <rect x={cx - eyeSpacing - faceR * 0.18} y={eyeY - faceR * 0.12} width={faceR * 0.36} height={faceR * 0.26} rx={faceR * 0.04} fill="none" stroke="#333" strokeWidth={s * 0.02} />
          <rect x={cx + eyeSpacing - faceR * 0.18} y={eyeY - faceR * 0.12} width={faceR * 0.36} height={faceR * 0.26} rx={faceR * 0.04} fill="none" stroke="#333" strokeWidth={s * 0.02} />
          <line x1={cx - eyeSpacing + faceR * 0.18} y1={eyeY} x2={cx + eyeSpacing - faceR * 0.18} y2={eyeY} stroke="#333" strokeWidth={s * 0.015} />
        </>;
      case 'roundGlasses':
        return <>
          <circle cx={cx - eyeSpacing} cy={eyeY} r={faceR * 0.18} fill="none" stroke="#8B4513" strokeWidth={s * 0.02} />
          <circle cx={cx + eyeSpacing} cy={eyeY} r={faceR * 0.18} fill="none" stroke="#8B4513" strokeWidth={s * 0.02} />
          <line x1={cx - eyeSpacing + faceR * 0.18} y1={eyeY} x2={cx + eyeSpacing - faceR * 0.18} y2={eyeY} stroke="#8B4513" strokeWidth={s * 0.015} />
        </>;
      case 'headband':
        return <rect x={cx - faceR * 0.9} y={cy - faceR * 0.75} width={faceR * 1.8} height={faceR * 0.15} rx={faceR * 0.07} fill="#E74C3C" />;
      case 'hat':
        return <>
          <rect x={cx - faceR * 1.1} y={cy - faceR * 1.05} width={faceR * 2.2} height={faceR * 0.12} rx={faceR * 0.06} fill="#2C3E50" />
          <rect x={cx - faceR * 0.55} y={cy - faceR * 1.55} width={faceR * 1.1} height={faceR * 0.55} rx={faceR * 0.1} fill="#2C3E50" />
        </>;
      case 'earrings':
        return <>
          <circle cx={cx - faceR * 0.9} cy={cy + faceR * 0.2} r={faceR * 0.07} fill="#F1C40F" />
          <circle cx={cx + faceR * 0.9} cy={cy + faceR * 0.2} r={faceR * 0.07} fill="#F1C40F" />
        </>;
      case 'bowtie':
        return <>
          <polygon points={`${cx},${cy + faceR * 0.85} ${cx - faceR * 0.25},${cy + faceR * 0.7} ${cx - faceR * 0.25},${cy + faceR * 1.0}`} fill="#E74C3C" />
          <polygon points={`${cx},${cy + faceR * 0.85} ${cx + faceR * 0.25},${cy + faceR * 0.7} ${cx + faceR * 0.25},${cy + faceR * 1.0}`} fill="#E74C3C" />
          <circle cx={cx} cy={cy + faceR * 0.85} r={faceR * 0.05} fill="#C0392B" />
        </>;
      default: return null;
    }
  };

  const noseX = cx, noseY = cy + faceR * 0.15;
  const renderNose = () => {
    switch (person.nose) {
      case 'small': return <circle cx={noseX} cy={noseY} r={faceR * 0.06} fill={skin} stroke="#00000020" strokeWidth={1} />;
      case 'medium': return <path d={`M${noseX},${noseY - faceR * 0.1} L${noseX - faceR * 0.08},${noseY + faceR * 0.05} L${noseX + faceR * 0.08},${noseY + faceR * 0.05} Z`} fill={skin} stroke="#00000020" strokeWidth={1} />;
      case 'wide': return <ellipse cx={noseX} cy={noseY} rx={faceR * 0.12} ry={faceR * 0.08} fill={skin} stroke="#00000020" strokeWidth={1} />;
      case 'pointed': return <path d={`M${noseX},${noseY - faceR * 0.15} L${noseX - faceR * 0.06},${noseY + faceR * 0.05} L${noseX + faceR * 0.06},${noseY + faceR * 0.05} Z`} fill={skin} stroke="#00000020" strokeWidth={1} />;
      case 'button': return <circle cx={noseX} cy={noseY} r={faceR * 0.09} fill={skin} stroke="#00000025" strokeWidth={1.5} />;
      default: return null;
    }
  };

  // Eyebrows
  const browY = eyeY - faceR * 0.22;

  return (
    <svg viewBox={`0 0 ${s} ${s}`} width="100%" height="100%" style={{ display: 'block' }}>
      {/* Neck */}
      <rect x={cx - faceR * 0.2} y={cy + faceR * 0.85} width={faceR * 0.4} height={faceR * 0.35} fill={skin} rx={faceR * 0.1} />
      {/* Face */}
      <path d={facePathMap[faceShape] || facePathMap.round} fill={skin} />
      {/* Hair */}
      {renderHair()}
      {/* Eyebrows */}
      <line x1={cx - eyeSpacing - faceR * 0.12} y1={browY} x2={cx - eyeSpacing + faceR * 0.12} y2={browY - faceR * 0.03} stroke={hair} strokeWidth={s * 0.025} strokeLinecap="round" />
      <line x1={cx + eyeSpacing - faceR * 0.12} y1={browY - faceR * 0.03} x2={cx + eyeSpacing + faceR * 0.12} y2={browY} stroke={hair} strokeWidth={s * 0.025} strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx={cx - eyeSpacing} cy={eyeY} rx={faceR * 0.13} ry={faceR * 0.1} fill="white" />
      <circle cx={cx - eyeSpacing} cy={eyeY} r={faceR * 0.07} fill={eyes} />
      <circle cx={cx - eyeSpacing + faceR * 0.02} cy={eyeY - faceR * 0.02} r={faceR * 0.025} fill="white" />
      <ellipse cx={cx + eyeSpacing} cy={eyeY} rx={faceR * 0.13} ry={faceR * 0.1} fill="white" />
      <circle cx={cx + eyeSpacing} cy={eyeY} r={faceR * 0.07} fill={eyes} />
      <circle cx={cx + eyeSpacing + faceR * 0.02} cy={eyeY - faceR * 0.02} r={faceR * 0.025} fill="white" />
      {/* Nose */}
      {renderNose()}
      {/* Mouth */}
      {renderMouth()}
      {/* Accessory */}
      {renderAccessory()}
    </svg>
  );
}

/* ───────── Main Component ───────── */
export default function FaceNameMemory({ onBack }) {
  const [level, setLevel] = useState(null);
  const [phase, setPhase] = useState('menu'); // menu | study | match | result | gameover
  const [people, setPeople] = useState([]);
  const [shuffledFaces, setShuffledFaces] = useState([]);
  const [shuffledNames, setShuffledNames] = useState([]);
  const [selectedFace, setSelectedFace] = useState(null);
  const [matches, setMatches] = useState({});
  const [wrongFlash, setWrongFlash] = useState(null);
  const [correctFlash, setCorrectFlash] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [studyTimeLeft, setStudyTimeLeft] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [containerSize, setContainerSize] = useState({ w: 400, h: 600 });
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const studyTimerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(TIME_LIMIT);
  const location = useLocation();
  scoreRef.current = score;
  timeLeftRef.current = timeLeft;

  // Responsive sizing
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerSize({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
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
          const map = { easy: 'easy', medium: 'moderate', moderate: 'moderate', hard: 'hard' };
          if (map[d] && LEVELS[map[d]]) {
            setIsDailyGame(true);
            setDailyGameDifficulty(map[d]);
            setLevel(map[d]);
          } else {
            setIsDailyGame(false);
            setDailyGameDifficulty(null);
            setLevel(null);
          }
        } else {
          setIsDailyGame(false);
          setDailyGameDifficulty(null);
          setLevel(null);
        }
      } catch (e) {
        console.error('Daily check failed', e);
        setIsDailyGame(false);
        setDailyGameDifficulty(null);
        setLevel(null);
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

  // Game timer
  useEffect(() => {
    if (phase !== 'match') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('gameover');
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty: level,
            timeElapsed: TIME_LIMIT,
          });
          return 0;
        }
        if (t <= 11) playSound('tick');
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Study timer
  useEffect(() => {
    if (phase !== 'study') return;
    studyTimerRef.current = setInterval(() => {
      setStudyTimeLeft(t => {
        if (t <= 1) {
          clearInterval(studyTimerRef.current);
          startMatchPhase();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(studyTimerRef.current);
  }, [phase]);

  const startGame = useCallback((lvl) => {
    const config = LEVELS[lvl];
    if (!config) return;
    setCompletionData(null);
    const newPeople = generatePeople(config.count);
    setPeople(newPeople);
    setLevel(lvl);
    setScore(0);
    setMatchCount(0);
    setCombo(0);
    setMatches({});
    setSelectedFace(null);
    setWrongFlash(null);
    setCorrectFlash(null);
    setTimeLeft(TIME_LIMIT);
    setStudyTimeLeft(config.studyTime);
    setPhase('study');
    playSound('study');
  }, []);

  const startMatchPhase = useCallback(() => {
    setShuffledFaces(seededShuffle([...people]));
    setShuffledNames(seededShuffle([...people]));
    setPhase('match');
  }, [people]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (studyTimerRef.current) clearInterval(studyTimerRef.current);
    timerRef.current = null;
    studyTimerRef.current = null;
    setCompletionData(null);
    setPhase('menu');
  }, []);

  const handleFaceClick = (person) => {
    if (matches[person.id] !== undefined) return;
    setSelectedFace(person);
    setWrongFlash(null);
  };

  const handleNameClick = (person) => {
    if (!selectedFace) return;
    if (matches[person.id] !== undefined) return;

    const config = LEVELS[level];
    const total = config.count;

    if (selectedFace.id === person.id) {
      // Correct
      const newCombo = combo + 1;
      const newMatchCount = matchCount + 1;
      const pointsPerMatch = Math.floor(MAX_SCORE / total);
      const isLast = newMatchCount === total;
      const earned = isLast ? MAX_SCORE - pointsPerMatch * (total - 1) : pointsPerMatch;
      const bonus = Math.min(newCombo - 1, 3) * 2;
      const finalEarned = Math.min(earned + bonus, MAX_SCORE - score);

      setMatches(prev => ({ ...prev, [person.id]: true }));
      setScore(s => Math.min(s + finalEarned, MAX_SCORE));
      setMatchCount(newMatchCount);
      setCombo(newCombo);
      setCorrectFlash(person.id);
      setSelectedFace(null);
      playSound('correct');
      setTimeout(() => setCorrectFlash(null), 500);

      if (newMatchCount === total) {
        clearInterval(timerRef.current);
        playSound('complete');
        const elapsed = TIME_LIMIT - timeLeftRef.current;
        const finalScore = Math.min(score + finalEarned, MAX_SCORE);
        setTimeout(() => {
          setCompletionData({
            score: finalScore,
            isVictory: true,
            difficulty: level,
            timeElapsed: elapsed,
          });
          setPhase('gameover');
        }, 800);
      }
    } else {
      // Wrong
      setCombo(0);
      setWrongFlash(person.id);
      playSound('wrong');
      setTimeout(() => setWrongFlash(null), 400);
    }
  };

  const isSmall = containerSize.w < 500;
  const isTiny = containerSize.w < 380;

  /* ───────── STYLES ───────── */
  const styles = {
    wrapper: {
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#fff', overflow: 'hidden',
    },
    header: {
      width: '100%', padding: isSmall ? '6px 10px' : '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(0,0,0,0.3)', flexShrink: 0, gap: 8, minHeight: 0,
    },
    backBtn: {
      background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
      borderRadius: 8, padding: isSmall ? '4px 8px' : '6px 12px',
      cursor: 'pointer', fontSize: isSmall ? 12 : 14, whiteSpace: 'nowrap',
    },
    title: {
      fontSize: isSmall ? 14 : 20, fontWeight: 700,
      background: 'linear-gradient(90deg, #f9a825, #ff6f00)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      textAlign: 'center', flex: 1,
    },
    statsRow: {
      display: 'flex', gap: isSmall ? 8 : 16, fontSize: isSmall ? 11 : 14,
      whiteSpace: 'nowrap',
    },
    content: {
      flex: 1, width: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', overflow: 'auto',
      padding: isSmall ? 8 : 16,
    },
    menuCard: {
      background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: isSmall ? 16 : 32,
      textAlign: 'center', maxWidth: 420, width: '100%', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    levelBtn: (color) => ({
      display: 'block', width: '100%', padding: isSmall ? '10px' : '14px',
      margin: '8px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
      fontSize: isSmall ? 14 : 18, fontWeight: 700, color: '#000',
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      transition: 'transform 0.15s, box-shadow 0.15s',
    }),
    faceCard: (isSelected, isMatched, isCorrect, isWrong) => ({
      borderRadius: 12, cursor: isMatched ? 'default' : 'pointer',
      border: `3px solid ${isCorrect ? '#34d399' : isSelected ? '#fbbf24' : isMatched ? '#34d39960' : 'rgba(255,255,255,0.15)'}`,
      background: isMatched ? 'rgba(52,211,153,0.1)' : isSelected ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
      opacity: isMatched ? 0.6 : 1,
      transition: 'all 0.2s',
      transform: isCorrect ? 'scale(1.05)' : isSelected ? 'scale(1.03)' : 'scale(1)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: isTiny ? 4 : isSmall ? 6 : 10,
      position: 'relative',
    }),
    nameBtn: (isMatched, isWrong, isCorrect) => ({
      padding: isTiny ? '6px 8px' : isSmall ? '8px 12px' : '10px 16px',
      borderRadius: 10, border: 'none', cursor: isMatched ? 'default' : 'pointer',
      fontSize: isTiny ? 11 : isSmall ? 13 : 16, fontWeight: 600,
      color: '#fff',
      background: isCorrect ? 'rgba(52,211,153,0.5)' : isWrong ? 'rgba(239,68,68,0.5)' : isMatched ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.1)',
      opacity: isMatched ? 0.5 : 1,
      transition: 'all 0.15s',
      animation: isWrong ? 'fnm-shake 0.3s' : isCorrect ? 'fnm-pop 0.3s' : 'none',
      width: '100%', textAlign: 'center',
    }),
    matchLabel: {
      position: 'absolute', top: -8, right: -8,
      background: '#34d399', color: '#000', borderRadius: '50%',
      width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700,
    },
  };

  /* ───────── CSS keyframes ───────── */
  const keyframes = `
    @keyframes fnm-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
    @keyframes fnm-pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
    @keyframes fnm-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes fnm-pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
    @keyframes fnm-fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fnm-countdown { 0%{transform:scale(1.2);opacity:1} 100%{transform:scale(1);opacity:0.7} }
  `;

  const config = level ? LEVELS[level] : null;
  const totalPeople = config ? config.count : 0;
  const faceSize = isTiny ? 54 : isSmall ? 68 : containerSize.w > 900 ? 110 : 90;
  const gridCols = isSmall
    ? (totalPeople <= 4 ? 2 : totalPeople <= 6 ? 3 : 4)
    : (totalPeople <= 4 ? 4 : totalPeople <= 6 ? 3 : 4);

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, LEVELS[dailyGameDifficulty]]].filter(([, c]) => c)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : level;

  const instructionsModalContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>Choose a difficulty (Easy = 4 faces, Moderate = 6, Hard = 8).</li>
        <li>In the <strong>Study</strong> phase, memorize each face and its name before time runs out.</li>
        <li>In the <strong>Match</strong> phase, select a face, then tap the correct name from the list.</li>
        <li>You have <strong>2 minutes</strong> to match all faces. Score up to <strong>200</strong> points.</li>
        <li>Correct matches build a <strong>combo</strong> for bonus points. Wrong picks reset the combo.</li>
      </ul>
    </>
  );

  return (
    <div ref={containerRef} style={styles.wrapper}>
      <style>{keyframes}</style>

      {/* HEADER */}
      <div style={styles.header}>
       
        <div style={styles.title}>👤 Face Name Memory</div>
        {phase === 'match' && (
          <div style={styles.statsRow}>
            <span>⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            <span style={{ color: '#fbbf24' }}>⭐ {score}</span>
            {combo > 1 && <span style={{ color: '#f87171', animation: 'fnm-pulse 0.5s infinite' }}>🔥x{combo}</span>}
          </div>
        )}
        {phase === 'study' && (
          <div style={{ fontSize: isSmall ? 12 : 16, color: '#fbbf24', animation: 'fnm-countdown 1s infinite' }}>
            📖 Study: {studyTimeLeft}s
          </div>
        )}
        {phase === 'menu' && (
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            aria-label="How to play"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(30,41,59,0.8)',
              color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <span aria-hidden>❓</span> How to Play
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {/* ─── MENU ─── */}
        {phase === 'menu' && (
          <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
            {showInstructions && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="face-name-memory-instructions-title"
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
                onClick={() => setShowInstructions(false)}
              >
                <div
                  style={{
                    background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                    border: '2px solid rgba(249,168,37,0.45)', borderRadius: 20, padding: 0,
                    maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                    <h2 id="face-name-memory-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f9a825' }}>
                      👤 Face Name Memory – How to Play
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowInstructions(false)}
                      aria-label="Close"
                      style={{
                        width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>
                    {instructionsModalContent}
                  </div>
                  <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => setShowInstructions(false)}
                      style={{
                        width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none',
                        background: 'linear-gradient(135deg, #f9a825, #ff6f00)', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 16,
                      }}
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div style={styles.menuCard}>
              {isDailyGame && (
                <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(249,168,37,0.2)', color: '#fbbf24', fontSize: 12, fontWeight: 600 }}>
                  📅 Daily Challenge
                </div>
              )}
              <div style={{ fontSize: isSmall ? 40 : 56, marginBottom: 8 }}>👤</div>
              <h2 style={{ fontSize: isSmall ? 18 : 24, marginBottom: 4 }}>Face Name Memory</h2>
              <p style={{ fontSize: isSmall ? 12 : 14, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
                Study faces & names, then match them from memory!
              </p>
              <div style={{ fontSize: isSmall ? 11 : 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.6 }}>
                ⏱ 2 min limit &nbsp;|&nbsp; ⭐ 200 max score &nbsp;|&nbsp; 🔥 Combo bonus
              </div>
              {!checkingDailyGame && levelEntries.map(([key, val]) => (
                <button
                  key={key}
                  style={{
                    ...styles.levelBtn(val.color),
                    opacity: selectedLevel === key ? 1 : 0.85,
                    border: selectedLevel === key ? `3px solid ${val.color}` : '3px solid transparent',
                  }}
                  onMouseOver={e => { e.target.style.transform = 'scale(1.03)'; e.target.style.boxShadow = `0 4px 20px ${val.color}50`; }}
                  onMouseOut={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}
                  onClick={() => !isDailyGame && setLevel(key)}
                >
                  {val.emoji} {val.label} — {val.count} faces
                </button>
              ))}
              <button
                style={{
                  ...styles.levelBtn('#34d399'),
                  marginTop: 12,
                }}
                disabled={!selectedLevel || checkingDailyGame}
                onClick={() => startGame(selectedLevel)}
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* ─── STUDY PHASE ─── */}
        {phase === 'study' && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: 700, animation: 'fnm-fadeIn 0.5s ease-out' }}>
            <p style={{ fontSize: isSmall ? 13 : 16, marginBottom: isSmall ? 8 : 16, color: 'rgba(255,255,255,0.8)' }}>
              📖 Memorize these faces and their names!
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: isSmall ? 8 : 14,
              justifyItems: 'center',
            }}>
              {people.map((p, i) => (
                <div key={p.id} style={{
                  animation: `fnm-fadeIn 0.4s ease-out ${i * 0.08}s both`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: 'rgba(255,255,255,0.07)', borderRadius: 12,
                  padding: isTiny ? 6 : isSmall ? 8 : 12, width: '100%',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ width: faceSize, height: faceSize }}>
                    <FaceSVG person={p} size={200} />
                  </div>
                  <div style={{
                    marginTop: 4, fontSize: isTiny ? 11 : isSmall ? 13 : 16,
                    fontWeight: 700, color: '#fbbf24',
                  }}>
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { clearInterval(studyTimerRef.current); startMatchPhase(); }}
              style={{
                marginTop: isSmall ? 10 : 16, padding: isSmall ? '8px 20px' : '10px 28px',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: isSmall ? 13 : 16, fontWeight: 600, color: '#000',
                background: 'linear-gradient(135deg, #34d399, #059669)',
              }}
            >
              Ready! Start Matching →
            </button>
          </div>
        )}

        {/* ─── MATCH PHASE ─── */}
        {(phase === 'match' || phase === 'gameover') && (
          <div style={{
            display: 'flex', flexDirection: isSmall ? 'column' : 'row',
            gap: isSmall ? 12 : 24, width: '100%', maxWidth: 900,
            alignItems: isSmall ? 'center' : 'flex-start',
            justifyContent: 'center', animation: 'fnm-fadeIn 0.4s ease-out',
            pointerEvents: phase === 'gameover' ? 'none' : 'auto',
          }}>
            {/* Faces grid */}
            <div style={{ flex: 1, width: '100%' }}>
              <div style={{
                fontSize: isSmall ? 12 : 14, color: 'rgba(255,255,255,0.5)',
                marginBottom: 6, textAlign: 'center',
              }}>
                👆 Select a face
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gap: isSmall ? 6 : 10,
              }}>
                {shuffledFaces.map(p => {
                  const isMatched = matches[p.id] !== undefined;
                  const isSelected = selectedFace?.id === p.id;
                  const isCorrect = correctFlash === p.id;
                  return (
                    <div
                      key={p.id}
                      style={styles.faceCard(isSelected, isMatched, isCorrect, false)}
                      onClick={() => handleFaceClick(p)}
                    >
                      {isMatched && <div style={styles.matchLabel}>✓</div>}
                      <div style={{ width: faceSize, height: faceSize }}>
                        <FaceSVG person={p} size={200} />
                      </div>
                      {isMatched && (
                        <div style={{ fontSize: isTiny ? 9 : 11, color: '#34d399', marginTop: 2 }}>
                          {p.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Names list */}
            <div style={{
              flex: isSmall ? undefined : 0.6, width: isSmall ? '100%' : undefined,
              maxWidth: isSmall ? '100%' : 220,
            }}>
              <div style={{
                fontSize: isSmall ? 12 : 14, color: 'rgba(255,255,255,0.5)',
                marginBottom: 6, textAlign: 'center',
              }}>
                👆 Then pick the name
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isSmall ? `repeat(${Math.min(totalPeople, 4)}, 1fr)` : '1fr',
                gap: isSmall ? 6 : 8,
              }}>
                {shuffledNames.map(p => {
                  const isMatched = matches[p.id] !== undefined;
                  const isWrong = wrongFlash === p.id;
                  const isCorrect = correctFlash === p.id;
                  return (
                    <button
                      key={p.id}
                      style={styles.nameBtn(isMatched, isWrong, isCorrect)}
                      onClick={() => handleNameClick(p)}
                      disabled={isMatched}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {phase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Face Name Memory"
          score={completionData.score}
          timeElapsed={completionData.timeElapsed ?? TIME_LIMIT}
          gameTimeLimit={TIME_LIMIT}
          isVictory={completionData.isVictory}
          difficulty={completionData.difficulty}
          customMessages={{ maxScore: MAX_SCORE }}
        />
      )}

      {/* Progress bar */}
      {phase === 'match' && (
        <div style={{
          width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', flexShrink: 0,
        }}>
          <div style={{
            height: '100%', background: 'linear-gradient(90deg, #34d399, #059669)',
            width: `${(matchCount / totalPeople) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
    </div>
  );
}
