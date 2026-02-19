import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

const MAX_SCORE = 200;
const TIME_LIMIT = 120;

const LEVELS = {
  easy: { label: 'Easy', gridSize: 4, targets: 5, maxNum: 9, desc: '4×4 grid · 5 targets' },
  moderate: { label: 'Moderate', gridSize: 5, targets: 7, maxNum: 15, desc: '5×5 grid · 7 targets' },
  hard: { label: 'Hard', gridSize: 6, targets: 9, maxNum: 20, desc: '6×6 grid · 9 targets' },
};

const audioCtxRef = { current: null };
function getAudioCtx() {
  if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtxRef.current;
}
function playTone(freq, dur = 0.12, type = 'sine') {
  try {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch (e) {}
}
function playSelect() { playTone(520, 0.06); }
function playCorrect() { [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.12), i * 70)); }
function playWrong() { [300, 200].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sawtooth'), i * 100)); }
function playWin() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 100)); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTargets(grid, gridSize, count) {
  const total = gridSize * gridSize;
  const targets = [];
  const used = new Set();

  for (let t = 0; t < count; t++) {
    let attempts = 0;
    while (attempts < 200) {
      attempts++;
      const numCells = randInt(2, Math.min(4, total));
      const indices = [];
      const available = Array.from({ length: total }, (_, i) => i).filter(i => !used.has(i));
      if (available.length < numCells) break;
      const shuffled = shuffle(available);
      for (let i = 0; i < numCells && i < shuffled.length; i++) indices.push(shuffled[i]);
      const sum = indices.reduce((s, idx) => s + grid[idx], 0);
      if (sum >= 5 && !targets.some(tt => tt.sum === sum)) {
        targets.push({ sum, cells: indices, cellCount: numCells });
        indices.forEach(i => used.add(i));
        break;
      }
    }
  }

  if (targets.length < count) {
    for (let t = targets.length; t < count; t++) {
      const numCells = randInt(2, 3);
      const all = Array.from({ length: total }, (_, i) => i);
      const shuffled = shuffle(all);
      const indices = shuffled.slice(0, numCells);
      const sum = indices.reduce((s, idx) => s + grid[idx], 0);
      targets.push({ sum, cells: indices, cellCount: numCells });
    }
  }

  return targets;
}

function generatePuzzle(cfg) {
  const total = cfg.gridSize * cfg.gridSize;
  const grid = Array.from({ length: total }, () => randInt(1, cfg.maxNum));
  const targets = generateTargets(grid, cfg.gridSize, cfg.targets);
  return { grid, targets };
}

const GRADIENT_BG = 'linear-gradient(135deg, #0a0f1e 0%, #1a0a2e 40%, #0d1a2f 100%)';

const TILE_COLORS = [
  { base: '#6366f1', light: '#818cf8', glow: 'rgba(99,102,241,.5)' },
  { base: '#8b5cf6', light: '#a78bfa', glow: 'rgba(139,92,246,.5)' },
  { base: '#06b6d4', light: '#22d3ee', glow: 'rgba(6,182,212,.5)' },
  { base: '#10b981', light: '#34d399', glow: 'rgba(16,185,129,.5)' },
  { base: '#f59e0b', light: '#fbbf24', glow: 'rgba(245,158,11,.5)' },
  { base: '#ef4444', light: '#f87171', glow: 'rgba(239,68,68,.5)' },
  { base: '#ec4899', light: '#f472b6', glow: 'rgba(236,72,153,.5)' },
];

function getTileColor(val, maxNum) {
  const idx = Math.floor(((val - 1) / maxNum) * TILE_COLORS.length);
  return TILE_COLORS[Math.min(idx, TILE_COLORS.length - 1)];
}

const css = `
  @keyframes nsp-pulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes nsp-pop{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
  @keyframes nsp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  @keyframes nsp-glow{0%,100%{box-shadow:0 0 10px rgba(99,102,241,.3)}50%{box-shadow:0 0 30px rgba(99,102,241,.7)}}
  @keyframes nsp-shine{0%{left:-100%}100%{left:200%}}
  @keyframes nsp-correctPop{0%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.7}100%{transform:scale(0.95);opacity:.5}}
  @keyframes nsp-fadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
  @keyframes nsp-comboZoom{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
  .nsp-pop{animation:nsp-pop .3s ease-out}
  .nsp-shake{animation:nsp-shake .4s ease-out}
  .nsp-correct-pop{animation:nsp-correctPop .5s ease-out forwards}
  .nsp-combo{animation:nsp-comboZoom .4s ease-out}
`;

export default function NumberSumPuzzle({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(4);
  const [maxNum, setMaxNum] = useState(9);
  const [targets, setTargets] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [result, setResult] = useState(null);
  const [combo, setCombo] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [solvedCells, setSolvedCells] = useState(new Set());
  const [flashCorrect, setFlashCorrect] = useState([]);
  const [containerSize, setContainerSize] = useState({ w: 400, h: 400 });
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(TIME_LIMIT);
  const containerRef = useRef(null);
  const location = useLocation();

  timeLeftRef.current = timeLeft;

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setContainerSize({ w: r.width, h: r.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [phase]);

  useEffect(() => {
    const check = async () => {
      try {
        setCheckingDailyGame(true);
        const res = await getDailySuggestions();
        const games = res?.data?.suggestion?.games || [];
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

  useEffect(() => { scoreRef.current = score; }, [score]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCompletionData(null);
    setPhase('menu');
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
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
        if (t <= 11) playTone(880, 0.04);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, level]);

  const startGame = useCallback((lvl) => {
    const cfg = LEVELS[lvl];
    if (!cfg) return;
    setCompletionData(null);
    const puzzle = generatePuzzle(cfg);
    setLevel(lvl);
    setGridSize(cfg.gridSize);
    setMaxNum(cfg.maxNum);
    setGrid(puzzle.grid);
    setTargets(puzzle.targets);
    setCurrentTarget(0);
    setSelected([]);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setResult(null);
    setCombo(0);
    setShaking(false);
    setSolvedCells(new Set());
    setFlashCorrect([]);
    setPhase('playing');
  }, []);

  const currentSum = selected.reduce((s, idx) => s + grid[idx], 0);
  const targetObj = targets[currentTarget] || null;
  const targetSum = targetObj ? targetObj.sum : 0;

  const handleCellClick = (idx) => {
    if (phase !== 'playing' || shaking) return;
    if (solvedCells.has(idx)) return;

    if (selected.includes(idx)) {
      playTone(400, 0.05);
      setSelected(selected.filter(i => i !== idx));
      return;
    }

    playSelect();
    const newSelected = [...selected, idx];
    const newSum = newSelected.reduce((s, i) => s + grid[i], 0);
    setSelected(newSelected);

    if (newSum === targetSum) {
      setTimeout(() => handleCorrect(newSelected), 200);
    } else if (newSum > targetSum) {
      setTimeout(() => handleWrong(), 200);
    }
  };

  const handleCorrect = (cells) => {
    playCorrect();
    setFlashCorrect(cells);
    setTimeout(() => setFlashCorrect([]), 500);

    const newSolved = new Set(solvedCells);
    cells.forEach(c => newSolved.add(c));
    setSolvedCells(newSolved);

    const newCombo = combo + 1;
    setCombo(newCombo);

    const totalTargets = targets.length;
    const nextIdx = currentTarget + 1;
    const isLast = nextIdx >= totalTargets;

    if (isLast) {
      const remaining = MAX_SCORE - scoreRef.current;
      setScore(s => s + remaining);
      setSelected([]);
      setCurrentTarget(nextIdx);
      setTimeout(() => endGame('win'), 500);
    } else {
      const basePoints = Math.floor(MAX_SCORE / totalTargets);
      const comboBonus = Math.min(newCombo, 5) * 2;
      const gained = Math.min(basePoints + comboBonus, MAX_SCORE - scoreRef.current);
      setScore(s => Math.min(s + gained, MAX_SCORE));
      setSelected([]);
      setCurrentTarget(nextIdx);
    }
  };

  const handleWrong = () => {
    playWrong();
    setCombo(0);
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      setSelected([]);
    }, 400);
  };

  const endGame = (reason) => {
    clearInterval(timerRef.current);
    if (reason === 'win') playWin();
    setResult(reason);
    setCompletionData({
      score: scoreRef.current,
      isVictory: reason === 'win',
      difficulty: level,
      timeElapsed: TIME_LIMIT - timeLeftRef.current,
    });
    setPhase('gameover');
  };

  const clearSelection = () => {
    setSelected([]);
    playTone(350, 0.06);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const minDim = Math.min(containerSize.w, containerSize.h);
  const maxGridPx = Math.min(minDim * 0.7, 480);
  const cellPx = Math.max(38, Math.floor((maxGridPx - (gridSize - 1) * 6) / gridSize));
  const gridPx = cellPx * gridSize + (gridSize - 1) * 6;

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, LEVELS[dailyGameDifficulty]]].filter(([, c]) => c)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : level;

  const instructionsModalContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>Choose a difficulty (Easy / Moderate / Hard). Each has a grid size and number of target sums.</li>
        <li>A <strong>target sum</strong> is shown. Select cells in the grid whose numbers <strong>add up</strong> to that target.</li>
        <li>Tap cells to select; tap again to deselect. Use &quot;Clear&quot; to reset your selection.</li>
        <li>Complete all targets before time runs out. You have <strong>2 minutes</strong> and can score up to <strong>200</strong> points.</li>
        <li>Consecutive correct targets build a <strong>combo</strong> for bonus points. Wrong sums (over target) reset the combo.</li>
      </ul>
    </>
  );

  const S = {
    wrapper: {
      position: 'fixed', inset: 0, background: GRADIENT_BG,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#e2e8f0', overflow: 'hidden',
    },
    header: {
      width: '100%', padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,.08)', zIndex: 10, flexShrink: 0,
    },
    backBtn: {
      background: 'rgba(255,255,255,.1)', border: 'none', color: '#e2e8f0',
      padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
    },
    badge: (urgent) => ({
      padding: '4px 14px', borderRadius: 12, fontSize: 15, fontWeight: 700,
      background: urgent ? 'rgba(239,68,68,.3)' : 'rgba(255,255,255,.08)',
      color: urgent ? '#fca5a5' : '#e2e8f0',
      animation: urgent ? 'nsp-pulse 1s infinite' : 'none',
    }),
    content: {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      width: '100%', maxWidth: 700, padding: 16,
    },
    card: {
      background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(16px)',
      borderRadius: 24, padding: '40px 32px',
      border: '1px solid rgba(255,255,255,.1)',
      textAlign: 'center', maxWidth: 440, width: '90%',
    },
    title: {
      fontSize: 'clamp(24px, 6vw, 38px)', fontWeight: 900,
      background: 'linear-gradient(135deg, #818cf8, #c084fc, #22d3ee)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: 8,
    },
    subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 28, lineHeight: 1.6 },
    lvlBtn: (idx) => {
      const gs = ['linear-gradient(135deg,#22c55e,#16a34a)', 'linear-gradient(135deg,#eab308,#f59e0b)', 'linear-gradient(135deg,#ef4444,#dc2626)'];
      return {
        width: '100%', padding: '14px 0', borderRadius: 14,
        background: gs[idx], border: 'none', color: '#fff',
        fontSize: 16, fontWeight: 700, cursor: 'pointer',
        marginBottom: 10, transition: 'transform .15s, box-shadow .15s',
        boxShadow: '0 4px 15px rgba(0,0,0,.3)',
      };
    },
    targetBox: {
      background: 'rgba(99,102,241,.15)', border: '2px solid rgba(99,102,241,.4)',
      borderRadius: 16, padding: '12px 20px', marginBottom: 12,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    },
    targetNum: {
      fontSize: 'clamp(28px, 7vw, 44px)', fontWeight: 900,
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    currentSumBar: {
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
      fontSize: 15, fontWeight: 600,
    },
    cell: (val, idx, isSelected, isSolved, isFlashCorrect) => {
      const tc = getTileColor(val, maxNum);
      return {
        width: cellPx, height: cellPx, borderRadius: Math.max(8, cellPx * 0.15),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(14, cellPx * 0.35), fontWeight: 800,
        cursor: isSolved ? 'default' : 'pointer',
        userSelect: 'none', position: 'relative', overflow: 'hidden',
        background: isSolved
          ? 'rgba(255,255,255,.04)'
          : isSelected
            ? `linear-gradient(135deg, ${tc.light}, ${tc.base})`
            : `linear-gradient(145deg, ${tc.base}cc, ${tc.base}88)`,
        border: isSelected
          ? '3px solid rgba(255,255,255,.9)'
          : isSolved
            ? '3px solid rgba(255,255,255,.05)'
            : '3px solid rgba(255,255,255,.1)',
        color: isSolved ? 'rgba(255,255,255,.15)' : '#fff',
        textShadow: isSolved ? 'none' : '0 2px 4px rgba(0,0,0,.4)',
        boxShadow: isSelected
          ? `0 0 20px ${tc.glow}, inset 0 1px 2px rgba(255,255,255,.2)`
          : isSolved
            ? 'none'
            : '0 4px 12px rgba(0,0,0,.4), inset 0 1px 2px rgba(255,255,255,.08)',
        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
        transition: 'all .15s ease',
        opacity: isSolved ? 0.35 : 1,
      };
    },
    clearBtn: {
      padding: '6px 18px', borderRadius: 10, border: 'none',
      background: 'rgba(239,68,68,.2)', color: '#fca5a5',
      fontSize: 13, fontWeight: 600, cursor: 'pointer',
    },
    progressTrack: {
      width: '80%', maxWidth: 350, height: 8, borderRadius: 4,
      background: 'rgba(255,255,255,.1)', overflow: 'hidden', marginTop: 12,
    },
    progressBar: {
      height: '100%', borderRadius: 4,
      background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
      transition: 'width .4s ease',
    },
    resultEmoji: { fontSize: 56, marginBottom: 12 },
    resultTitle: { fontSize: 28, fontWeight: 800, marginBottom: 8 },
    resultScore: {
      fontSize: 42, fontWeight: 900,
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: 16,
    },
    playBtn: {
      padding: '12px 32px', borderRadius: 14,
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      border: 'none', color: '#fff', fontSize: 16, fontWeight: 700,
      cursor: 'pointer', marginBottom: 8, width: '100%',
    },
    menuBtnSm: {
      padding: '10px 32px', borderRadius: 14,
      background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
      color: '#e2e8f0', fontSize: 14, cursor: 'pointer', width: '100%',
    },
  };

  return (
    <div style={S.wrapper}>
      <style>{css}</style>
      <div style={S.header}>
        <button style={S.backBtn} onClick={phase === 'menu' ? (onBack ? () => onBack() : () => window.history.back()) : handleReset}>
          {phase === 'menu' ? '← Home' : '← Menu'}
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🔢 Number Sum</span>
        {phase === 'menu' ? (
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
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={S.badge(false)}>⭐ {score}/{MAX_SCORE}</div>
            <div style={{ ...S.badge(false), fontSize: 13 }}>{currentTarget}/{targets.length}</div>
            <div style={S.badge(timeLeft <= 10)}>⏱ {formatTime(timeLeft)}</div>
          </div>
        )}
      </div>

      {phase === 'menu' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="number-puzzle-instructions-title"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(99,102,241,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <h2 id="number-puzzle-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#818cf8' }}>
                    🔢 Number Sum Puzzle – How to Play
                  </h2>
                  <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close"
                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    ×
                  </button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{instructionsModalContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <button type="button" onClick={() => setShowInstructions(false)}
                    style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={S.card}>
            {isDailyGame && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>
                📅 Daily Challenge
              </div>
            )}
            <div style={S.title}>Number Sum Puzzle</div>
            <p style={S.subtitle}>
              Select numbers from the grid that add up to the target sum.<br />
              Complete all targets before time runs out!
            </p>
            {!checkingDailyGame && levelEntries.map(([key, cfg], idx) => (
              <button
                key={key}
                style={{
                  ...S.lvlBtn(idx),
                  opacity: selectedLevel === key ? 1 : 0.85,
                  border: selectedLevel === key ? '3px solid rgba(255,255,255,0.5)' : 'none',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                onClick={() => !isDailyGame && setLevel(key)}
              >
                {cfg.label}
                <div style={{ fontSize: 11, fontWeight: 400, opacity: .85 }}>{cfg.desc}</div>
              </button>
            ))}
            <button
              style={{ ...S.lvlBtn(0), marginTop: 8, background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
              disabled={!selectedLevel || checkingDailyGame}
              onClick={() => startGame(selectedLevel)}
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {(phase === 'playing' || phase === 'gameover') && (
      <div ref={containerRef} style={{ ...S.content, pointerEvents: phase === 'gameover' ? 'none' : 'auto' }}>
        {targetObj && (
          <div style={S.targetBox}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>TARGET SUM</div>
            <div style={S.targetNum}>{targetSum}</div>
          </div>
        )}

        <div style={S.currentSumBar}>
          <span style={{ color: '#94a3b8' }}>Selected:</span>
          <span style={{
            color: currentSum > targetSum ? '#f87171' : currentSum === targetSum ? '#34d399' : '#fbbf24',
            fontSize: 18, fontWeight: 800,
          }}>{currentSum}</span>
          <span style={{ color: '#64748b' }}>/ {targetSum}</span>
          {selected.length > 0 && (
            <button style={S.clearBtn} onClick={clearSelection}>Clear</button>
          )}
        </div>

        {combo > 1 && (
          <div className="nsp-combo" style={{
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            padding: '3px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            color: '#fff', marginBottom: 6,
          }}>🔥 {combo}x Combo!</div>
        )}

        <div className={shaking ? 'nsp-shake' : ''} style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellPx}px)`,
          gap: 6,
        }}>
          {grid.map((val, idx) => {
            const isSel = selected.includes(idx);
            const isSolved = solvedCells.has(idx);
            const isFlash = flashCorrect.includes(idx);
            return (
              <div
                key={idx}
                className={`${isFlash ? 'nsp-correct-pop' : ''} ${isSel ? 'nsp-pop' : ''}`}
                style={S.cell(val, idx, isSel, isSolved, isFlash)}
                onClick={() => handleCellClick(idx)}
              >
                {isSel && (
                  <div style={{
                    position: 'absolute', top: 0, left: '-100%',
                    width: '50%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent)',
                    animation: 'nsp-shine 2s infinite',
                    pointerEvents: 'none',
                  }} />
                )}
                {val}
              </div>
            );
          })}
        </div>

        <div style={S.progressTrack}>
          <div style={{ ...S.progressBar, width: `${(score / MAX_SCORE) * 100}%` }} />
        </div>

        <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
          Tap numbers that add up to {targetSum}
        </div>
      </div>
      )}

      {phase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Number Sum Puzzle"
          score={completionData.score}
          timeElapsed={completionData.timeElapsed ?? TIME_LIMIT}
          gameTimeLimit={TIME_LIMIT}
          isVictory={completionData.isVictory}
          difficulty={completionData.difficulty}
          customMessages={{ maxScore: MAX_SCORE }}
        />
      )}
    </div>
  );
}
