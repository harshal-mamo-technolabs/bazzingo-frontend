import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

const SYMBOLS = ['●', '▲', '■', '◆', '★', '⬟'];
const SYM_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#e879f9', '#fb923c'];

const LEVELS = {
  easy: { label: 'Easy', size: 4, symbols: 3, prefilled: 6 },
  moderate: { label: 'Moderate', size: 5, symbols: 4, prefilled: 6 },
  hard: { label: 'Hard', size: 6, symbols: 5, prefilled: 7 },
};

const TIME_LIMIT = 120;
const MAX_SCORE = 200;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLatinSquare(n) {
  const grid = Array.from({ length: n }, () => Array(n).fill(-1));

  function solve(pos) {
    if (pos === n * n) return true;
    const r = Math.floor(pos / n), c = pos % n;
    const order = shuffle(Array.from({ length: n }, (_, i) => i));
    for (const val of order) {
      if (grid[r].includes(val)) continue;
      if (grid.some(row => row[c] === val)) continue;
      grid[r][c] = val;
      if (solve(pos + 1)) return true;
      grid[r][c] = -1;
    }
    return false;
  }

  solve(0);
  return grid;
}

function hasUniqueSolution(grid, prefilled, n) {
  const test = Array.from({ length: n }, () => Array(n).fill(-1));
  prefilled.forEach(({ r, c, v }) => { test[r][c] = v; });
  let count = 0;

  function solve(pos) {
    if (count > 1) return;
    if (pos === n * n) { count++; return; }
    const r = Math.floor(pos / n), c = pos % n;
    if (test[r][c] !== -1) { solve(pos + 1); return; }
    for (let v = 0; v < n; v++) {
      if (test[r].includes(v)) continue;
      if (test.some(row => row[c] === v)) continue;
      test[r][c] = v;
      solve(pos + 1);
      test[r][c] = -1;
    }
  }

  solve(0);
  return count === 1;
}

function generatePuzzle(size, prefilledCount) {
  const solution = generateLatinSquare(size);
  const allCells = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      allCells.push({ r, c, v: solution[r][c] });

  const shuffled = shuffle(allCells);
  const prefilled = [];

  // Start with enough to ensure unique solution
  for (const cell of shuffled) {
    prefilled.push(cell);
    if (prefilled.length >= prefilledCount) {
      if (hasUniqueSolution(solution, prefilled, size)) break;
    }
    if (prefilled.length >= size * size - 2) break;
  }

  // If not unique yet, add more
  while (!hasUniqueSolution(solution, prefilled, size) && prefilled.length < size * size - 1) {
    const remaining = shuffled.filter(c => !prefilled.some(p => p.r === c.r && p.c === c.c));
    if (remaining.length === 0) break;
    prefilled.push(remaining[0]);
  }

  return { solution, prefilled };
}

export default function LogicGridSolver({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [solution, setSolution] = useState([]);
  const [prefilled, setPrefilled] = useState([]);
  const [grid, setGrid] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(TIME_LIMIT);
  const [errors, setErrors] = useState(0);
  const [filled, setFilled] = useState(0);
  const [totalToFill, setTotalToFill] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [shakeCell, setShakeCell] = useState(null);
  const [finished, setFinished] = useState(false);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const timerRef = useRef(null);
  const audioCtx = useRef(null);
  const phaseRef = useRef(phase);
  const scoreRef = useRef(0);
  const timeRef = useRef(TIME_LIMIT);
  const location = useLocation();
  phaseRef.current = phase;
  scoreRef.current = score;
  timeRef.current = time;

  const cfg = level ? LEVELS[level] : null;

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

  const getAudio = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const playTone = useCallback((freq, dur, type = 'sine') => {
    try {
      const ctx = getAudio();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = 0.1;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch {}
  }, [getAudio]);

  const playPlace = useCallback(() => {
    playTone(523, 0.08);
    setTimeout(() => playTone(659, 0.1), 60);
  }, [playTone]);

  const playError = useCallback(() => playTone(180, 0.3, 'sawtooth'), [playTone]);

  const playWin = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 100));
  }, [playTone]);

  const isPrefilled = useCallback((r, c) => prefilled.some(p => p.r === r && p.c === c), [prefilled]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCompletionData(null);
    setPhase('menu');
  }, []);

  const startGame = useCallback((lv) => {
    const c = LEVELS[lv];
    if (!c) return;
    setCompletionData(null);
    setLevel(lv);
    const { solution: sol, prefilled: pre } = generatePuzzle(c.size, c.prefilled);
    setSolution(sol);
    setPrefilled(pre);
    const g = Array.from({ length: c.size }, () => Array(c.size).fill(-1));
    pre.forEach(p => { g[p.r][p.c] = p.v; });
    setGrid(g);
    setSelected(null);
    setScore(0);
    setTime(TIME_LIMIT);
    setErrors(0);
    const toFill = c.size * c.size - pre.length;
    setTotalToFill(toFill);
    setFilled(0);
    setFeedback(null);
    setShakeCell(null);
    setFinished(false);
    setPhase('playing');
  }, []);

  const endGame = useCallback((finalScore, isVictory = false) => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setFinished(true);
    if (isVictory || finalScore >= MAX_SCORE * 0.7) playWin();
    setCompletionData({
      score: finalScore,
      isVictory: isVictory || finalScore >= MAX_SCORE * 0.7,
      difficulty: level,
      timeElapsed: TIME_LIMIT - timeRef.current,
    });
    setPhase('gameover');
  }, [playWin, level]);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase('gameover');
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty: level,
            timeElapsed: TIME_LIMIT,
          });
          return 0;
        }
        if (prev === 11) playTone(880, 0.1);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, level, playTone]);

  const handleCellClick = useCallback((r, c) => {
    if (phase !== 'playing' || isPrefilled(r, c)) return;
    setSelected({ r, c });
  }, [phase, isPrefilled]);

  const handleSymbolPick = useCallback((sym) => {
    if (!selected || phase !== 'playing') return;
    const { r, c } = selected;

    if (solution[r][c] === sym) {
      const newGrid = grid.map(row => [...row]);
      newGrid[r][c] = sym;
      setGrid(newGrid);
      const newFilled = filled + 1;
      setFilled(newFilled);

      const basePoints = MAX_SCORE / totalToFill;
      let newScore = Math.min(score + basePoints, MAX_SCORE);
      if (newFilled === totalToFill) {
        newScore = Math.max(newScore, MAX_SCORE - errors * 5);
        newScore = Math.min(newScore, MAX_SCORE);
        if (newScore > MAX_SCORE * 0.5) newScore = MAX_SCORE;
      }
      newScore = Math.round(newScore * 10) / 10;
      setScore(newScore);

      playPlace();
      setFeedback({ type: 'correct', r, c });
      setSelected(null);
      setTimeout(() => setFeedback(null), 400);

      if (newFilled === totalToFill) {
        setTimeout(() => endGame(newScore, true), 500);
      }
    } else {
      setErrors(e => e + 1);
      setShakeCell({ r, c });
      setFeedback({ type: 'wrong', r, c });
      playError();
      setTimeout(() => { setShakeCell(null); setFeedback(null); }, 500);
    }
  }, [selected, phase, solution, grid, filled, totalToFill, score, errors, playPlace, playError, endGame]);

  const handleClear = useCallback(() => {
    if (!selected || phase !== 'playing') return;
    const { r, c } = selected;
    if (isPrefilled(r, c) || grid[r][c] === -1) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = -1;
    setGrid(newGrid);
    setFilled(f => f - 1);
    setScore(s => Math.max(0, s - MAX_SCORE / totalToFill));
    setSelected(null);
  }, [selected, phase, isPrefilled, grid, totalToFill]);

  const isConflict = useCallback((r, c) => {
    if (!cfg || grid[r][c] === -1) return false;
    const v = grid[r][c];
    for (let i = 0; i < cfg.size; i++) {
      if (i !== c && grid[r][i] === v) return true;
      if (i !== r && grid[i][c] === v) return true;
    }
    return false;
  }, [grid, cfg]);

  const pct = (time / TIME_LIMIT) * 100;
  const low = time <= 15;
  const progress = totalToFill > 0 ? (filled / totalToFill) * 100 : 0;

  const styles = `
    @keyframes lgs-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
    @keyframes lgs-pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
    @keyframes lgs-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  `;

  const cellSize = useMemo(() => {
    if (!cfg) return 60;
    const maxW = Math.min(window.innerWidth - 32, 500);
    const maxH = window.innerHeight * 0.42;
    return Math.floor(Math.min(maxW, maxH) / cfg.size) - 4;
  }, [cfg]);

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, LEVELS[dailyGameDifficulty]]].filter(([, c]) => c)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : level;

  const instructionsContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>Fill the grid so each <strong>row</strong> and <strong>column</strong> contains each symbol exactly once (like Sudoku with symbols).</li>
        <li>Tap an empty cell to select it, then pick a symbol from the palette below. Use ✕ to clear your guess.</li>
        <li>Cells marked 🔒 are given clues and cannot be changed.</li>
        <li>You have <strong>2 minutes</strong>. Maximum score is <strong>200</strong> points. Wrong guesses don’t remove filled cells but add to your error count.</li>
      </ul>
    </>
  );

  const wrapperStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px' };

  return (
    <div style={wrapperStyle}>
      <style>{styles}</style>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={phase === 'menu' ? (onBack ? () => onBack() : () => window.history.back()) : handleReset}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}
        >
          {phase === 'menu' ? '←' : '✕'}
        </button>
        <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 'clamp(1rem,4vw,1.3rem)' }}>🧩 Logic Grid</div>
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
            ❓ How to Play
          </button>
        ) : (
          <div style={{ color: low ? '#ef4444' : '#94a3b8', fontWeight: 700, fontSize: 'clamp(0.85rem,3vw,1.1rem)', animation: low ? 'lgs-pulse 1s infinite' : undefined }}>
            ⏱ {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {phase === 'menu' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(99,102,241,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#818cf8' }}>🧩 Logic Grid Solver – How to Play</h2>
                  <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close"
                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>{instructionsContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <button type="button" onClick={() => setShowInstructions(false)}
                    style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>Got it</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ background: '#1e293b', borderRadius: 20, padding: '32px 24px', maxWidth: 420, width: '100%', textAlign: 'center', border: '2px solid #334155' }}>
            {isDailyGame && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>📅 Daily Challenge</div>
            )}
            <div style={{ fontSize: 48, marginBottom: 8 }}>🧩</div>
            <h1 style={{ color: '#f1f5f9', fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 800, margin: '0 0 8px' }}>Logic Grid Solver</h1>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(0.8rem,3vw,0.95rem)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Fill the grid so each row and column contains each symbol exactly once!
            </p>
            {!checkingDailyGame && levelEntries.map(([key, val]) => (
              <button
                key={key}
                onClick={() => !isDailyGame && setLevel(key)}
                style={{
                  width: '100%', padding: '14px 20px', marginBottom: 10, borderRadius: 12, border: selectedLevel === key ? '3px solid rgba(255,255,255,0.5)' : 'none',
                  fontSize: 'clamp(0.9rem,3vw,1.05rem)', fontWeight: 700, cursor: isDailyGame ? 'default' : 'pointer',
                  background: key === 'easy' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : key === 'moderate' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#fff', transition: 'transform 0.15s', opacity: selectedLevel === key ? 1 : 0.85,
                }}
                onMouseEnter={e => !isDailyGame && (e.target.style.transform = 'scale(1.03)')}
                onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
              >
                {val.label} — {val.size}×{val.size} grid
              </button>
            ))}
            <button
              disabled={!selectedLevel || checkingDailyGame}
              onClick={() => startGame(selectedLevel)}
              style={{
                width: '100%', marginTop: 8, padding: '14px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontSize: 'clamp(0.9rem,3vw,1.05rem)', fontWeight: 700, cursor: (!selectedLevel || checkingDailyGame) ? 'not-allowed' : 'pointer', opacity: (!selectedLevel || checkingDailyGame) ? 0.6 : 1,
              }}
            >
              Start Game
            </button>
            <div style={{ marginTop: 20, color: '#64748b', fontSize: 'clamp(0.7rem,2.5vw,0.8rem)' }}>⏱ 2 min · 🏆 200 pts max</div>
          </div>
        </div>
      )}

      {(phase === 'playing' || phase === 'gameover') && (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pointerEvents: phase === 'gameover' ? 'none' : 'auto' }}>
      {/* Timer bar */}
      <div style={{ width: '100%', maxWidth: 520, height: 6, background: '#334155', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: low ? '#ef4444' : '#3b82f6', borderRadius: 3, transition: 'width 1s linear' }} />
      </div>

      {/* Score */}
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 'clamp(0.85rem,3vw,1rem)' }}>
          🏆 {Math.round(score)}/{MAX_SCORE}
        </div>
        <div style={{ color: '#64748b', fontSize: 'clamp(0.7rem,2.5vw,0.85rem)' }}>
          {filled}/{totalToFill} filled · {errors} errors
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 520, height: 4, background: '#334155', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#22c55e', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cfg.size}, ${cellSize}px)`,
        gap: 3,
        marginBottom: 16,
      }}>
        {grid.map((row, r) => row.map((val, c) => {
          const pre = isPrefilled(r, c);
          const sel = selected?.r === r && selected?.c === c;
          const conflict = val !== -1 && isConflict(r, c);
          const isFeedback = feedback?.r === r && feedback?.c === c;
          const isShake = shakeCell?.r === r && shakeCell?.c === c;

          return (
            <div
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              style={{
                width: cellSize,
                height: cellSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: sel ? '#1e3a5f' : pre ? '#0f172a' : conflict ? '#3b111122' : '#1e293b',
                border: sel ? '2px solid #3b82f6' : isFeedback && feedback.type === 'correct' ? '2px solid #22c55e' : isFeedback && feedback.type === 'wrong' ? '2px solid #ef4444' : '2px solid #334155',
                borderRadius: 8,
                cursor: pre ? 'default' : 'pointer',
                fontSize: Math.max(cellSize * 0.45, 14),
                color: pre ? '#64748b' : val !== -1 ? SYM_COLORS[val] : '#475569',
                fontWeight: 700,
                transition: 'all 0.15s',
                animation: isShake ? 'lgs-shake 0.4s' : isFeedback && feedback.type === 'correct' ? 'lgs-pop 0.3s' : undefined,
                userSelect: 'none',
                position: 'relative',
              }}
            >
              {val !== -1 ? SYMBOLS[val] : (sel ? '·' : '')}
              {pre && (
                <div style={{ position: 'absolute', top: 2, right: 4, fontSize: 8, color: '#475569' }}>🔒</div>
              )}
            </div>
          );
        }))}
      </div>

      {/* Symbol picker */}
      <div style={{ color: '#64748b', fontSize: 'clamp(0.7rem,2.5vw,0.8rem)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
        {selected ? 'Pick a symbol' : 'Tap a cell to fill'}
      </div>
      <div style={{ display: 'flex', gap: 'clamp(6px,2vw,10px)', marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: cfg.size }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleSymbolPick(i)}
            disabled={!selected}
            style={{
              width: Math.max(cellSize * 0.85, 40),
              height: Math.max(cellSize * 0.85, 40),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: selected ? '#1e293b' : '#0f172a',
              border: `2px solid ${selected ? SYM_COLORS[i] : '#334155'}`,
              borderRadius: 10,
              fontSize: Math.max(cellSize * 0.38, 16),
              color: SYM_COLORS[i],
              cursor: selected ? 'pointer' : 'default',
              opacity: selected ? 1 : 0.4,
              fontWeight: 700,
              transition: 'all 0.15s',
            }}
          >
            {SYMBOLS[i]}
          </button>
        ))}
        <button
          onClick={handleClear}
          disabled={!selected}
          style={{
            width: Math.max(cellSize * 0.85, 40),
            height: Math.max(cellSize * 0.85, 40),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1e293b',
            border: '2px solid #64748b',
            borderRadius: 10,
            fontSize: 16,
            color: '#94a3b8',
            cursor: selected ? 'pointer' : 'default',
            opacity: selected ? 1 : 0.4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Rules reminder */}
      <div style={{ marginTop: 'auto', paddingTop: 12, color: '#475569', fontSize: 'clamp(0.65rem,2vw,0.75rem)', textAlign: 'center', maxWidth: 400 }}>
        Each row and column must contain each symbol exactly once. 🔒 = given clue.
      </div>
      </div>
      )}

      {phase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Logic Grid Solver"
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
