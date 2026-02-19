import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

/* ─── constants ─── */
const MAX_SCORE = 200;
const TIME_LIMIT = 120;

const LEVELS = {
  easy:     { label: 'Easy',     gridSize: 8,  wordCount: 6,  emoji: '🟢' },
  moderate: { label: 'Moderate', gridSize: 10, wordCount: 8,  emoji: '🟡' },
  hard:     { label: 'Hard',     gridSize: 12, wordCount: 10, emoji: '🔴' },
};

const WORD_POOLS = {
  easy: ['CAT','DOG','SUN','RUN','HAT','CUP','BIG','RED','FUN','PEN','TOP','BOX','BUS','HIT','MAP','NET','JAM','LOG','BAT','FOG'],
  moderate: ['APPLE','BRICK','CRANE','DELTA','EAGLE','FLAME','GLOBE','HOUSE','JUICE','KNIFE','LEMON','MANGO','OCEAN','PLANT','RIVER','SNAKE','TIGER','UNCLE','WATCH','YIELD'],
  hard: ['PYTHON','GALAXY','BRIDGE','CASTLE','DRAGON','FLIGHT','GARDEN','HAMMER','ISLAND','JUNGLE','KNIGHT','LAPTOP','MIRROR','NEBULA','ORANGE','PENCIL','QUARTZ','ROCKET','SILVER','TROPHY'],
};

const DIRECTIONS = [
  [0,1],[1,0],[1,1],[-1,1],
  [0,-1],[-1,0],[-1,-1],[1,-1]
];

/* ─── audio helpers ─── */
let _actx = null;
const audioCtx = () => { if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)(); return _actx; };
const playTone = (freq, dur, type = 'sine', vol = 0.15) => {
  try {
    const ctx = audioCtx(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur); o.stop(ctx.currentTime + dur);
  } catch {}
};
const sfxSelect = () => playTone(520, 0.08);
const sfxFound = () => { playTone(660, 0.12); setTimeout(() => playTone(880, 0.15), 80); setTimeout(() => playTone(1100, 0.2), 160); };
const sfxWrong = () => playTone(220, 0.25, 'sawtooth', 0.08);
const sfxWin = () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.3, 'sine', 0.12), i * 120)); };
const sfxTick = () => playTone(1000, 0.04, 'square', 0.06);

/* ─── grid generation ─── */
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function generateGrid(size, words) {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const placed = [];
  const wordPositions = {};

  for (const word of words) {
    let attempts = 0, didPlace = false;
    while (attempts < 300 && !didPlace) {
      attempts++;
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const [dr, dc] = dir;
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      let ok = true;
      const cells = [];
      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) { ok = false; break; }
        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) { ok = false; break; }
        cells.push([nr, nc]);
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) grid[cells[i][0]][cells[i][1]] = word[i];
      placed.push(word);
      wordPositions[word] = cells;
      didPlace = true;
    }
  }

  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === '') grid[r][c] = alpha[Math.floor(Math.random() * 26)];

  return { grid, placed, wordPositions };
}

/* ─── main component ─── */
export default function WordSearchMaster({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [wordPositions, setWordPositions] = useState({});
  const [foundWords, setFoundWords] = useState(new Set());
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(TIME_LIMIT);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [foundCells, setFoundCells] = useState(new Set());
  const [flashCells, setFlashCells] = useState(new Set());
  const [shakeCells, setShakeCells] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 400, h: 400 });
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeRef = useRef(TIME_LIMIT);
  const location = useLocation();
  scoreRef.current = score;
  timeRef.current = time;

  /* ─── responsive ─── */
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [phase]);

  /* ─── start game ─── */
  const startGame = useCallback((lvl) => {
    const cfg = LEVELS[lvl];
    if (!cfg) return;
    setCompletionData(null);
    const pool = shuffle(WORD_POOLS[lvl]).slice(0, cfg.wordCount);
    const { grid: g, placed, wordPositions: wp } = generateGrid(cfg.gridSize, pool);
    setLevel(lvl); setGrid(g); setWords(placed); setWordPositions(wp);
    setFoundWords(new Set()); setScore(0); setTime(TIME_LIMIT);
    setSelectedCells([]); setFoundCells(new Set()); setFlashCells(new Set());
    setCombo(0); setPhase('playing');
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

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCompletionData(null);
    setPhase('menu');
  }, []);

  /* ─── timer ─── */
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTime(t => {
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
        if (t <= 11) sfxTick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, level]);

  const cellKey = (r, c) => `${r}-${c}`;

  const getCellFromEvent = useCallback((e) => {
    if (!gridRef.current || !level) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cfg = LEVELS[level];
    const cellSize = rect.width / cfg.gridSize;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const c = Math.floor((cx - rect.left) / cellSize);
    const r = Math.floor((cy - rect.top) / cellSize);
    if (r < 0 || r >= cfg.gridSize || c < 0 || c >= cfg.gridSize) return null;
    return [r, c];
  }, [level]);

  const isValidLine = (cells) => {
    if (cells.length < 2) return true;
    const dr = Math.sign(cells[1][0] - cells[0][0]);
    const dc = Math.sign(cells[1][1] - cells[0][1]);
    for (let i = 2; i < cells.length; i++) {
      if (Math.sign(cells[i][0] - cells[i - 1][0]) !== dr) return false;
      if (Math.sign(cells[i][1] - cells[i - 1][1]) !== dc) return false;
    }
    return true;
  };

  const handlePointerDown = useCallback((e) => {
    if (phase !== 'playing') return;
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;
    sfxSelect();
    setIsDragging(true);
    setSelectedCells([cell]);
  }, [phase, getCellFromEvent]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || phase !== 'playing') return;
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;
    const [r, c] = cell;
    setSelectedCells(prev => {
      const exists = prev.some(([pr, pc]) => pr === r && pc === c);
      if (exists) {
        if (prev.length >= 2 && prev[prev.length - 2][0] === r && prev[prev.length - 2][1] === c)
          return prev.slice(0, -1);
        return prev;
      }
      const [lr, lc] = prev[prev.length - 1];
      if (Math.abs(r - lr) > 1 || Math.abs(c - lc) > 1) return prev;
      const next = [...prev, cell];
      if (!isValidLine(next)) return prev;
      sfxSelect();
      return next;
    });
  }, [isDragging, phase, getCellFromEvent]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const selectedWord = selectedCells.map(([r, c]) => grid[r][c]).join('');
    const reversedWord = [...selectedWord].reverse().join('');
    let matchedWord = null;
    if (words.includes(selectedWord) && !foundWords.has(selectedWord)) matchedWord = selectedWord;
    else if (words.includes(reversedWord) && !foundWords.has(reversedWord)) matchedWord = reversedWord;

    if (matchedWord) {
      sfxFound();
      const newFound = new Set(foundWords);
      newFound.add(matchedWord);
      setFoundWords(newFound);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo >= 2) { setShowCombo(true); setTimeout(() => setShowCombo(false), 800); }

      const total = words.length;
      const perWord = Math.floor(MAX_SCORE / total);
      const isLast = newFound.size === total;
      const earned = isLast ? MAX_SCORE - perWord * (total - 1) : perWord;
      setScore(s => Math.min(s + earned, MAX_SCORE));

      const newFoundCells = new Set(foundCells);
      selectedCells.forEach(([r, c]) => newFoundCells.add(cellKey(r, c)));
      setFoundCells(newFoundCells);

      const flash = new Set();
      selectedCells.forEach(([r, c]) => flash.add(cellKey(r, c)));
      setFlashCells(flash);
      setTimeout(() => setFlashCells(new Set()), 600);

      if (isLast) {
        sfxWin();
        clearInterval(timerRef.current);
        const finalScore = Math.min(scoreRef.current + earned, MAX_SCORE);
        const elapsed = TIME_LIMIT - timeRef.current;
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
    } else if (selectedCells.length > 1) {
      sfxWrong();
      setShakeCells(true);
      setCombo(0);
      setTimeout(() => setShakeCells(false), 400);
    }
    setSelectedCells([]);
  }, [isDragging, selectedCells, grid, words, foundWords, foundCells, combo]);

  /* ─── computed ─── */
  const cfg = level ? LEVELS[level] : null;
  const gridDim = cfg ? cfg.gridSize : 0;

  const gridPixelSize = useMemo(() => {
    if (!cfg) return 300;
    const maxW = containerSize.w - 32;
    const maxH = containerSize.h - 120;
    return Math.min(maxW, maxH, 560);
  }, [containerSize, cfg]);

  const cellPx = gridDim ? gridPixelSize / gridDim : 0;
  const fontSize = Math.max(10, Math.min(cellPx * 0.48, 22));

  const selectedSet = useMemo(() => {
    const s = new Set();
    selectedCells.forEach(([r, c]) => s.add(cellKey(r, c)));
    return s;
  }, [selectedCells]);

  const selectionLine = useMemo(() => {
    if (selectedCells.length < 2) return null;
    const half = cellPx / 2;
    return selectedCells.map(([r, c]) => `${c * cellPx + half},${r * cellPx + half}`).join(' ');
  }, [selectedCells, cellPx]);

  const foundLines = useMemo(() => {
    const lines = [];
    const colors = ['#8b5cf6','#3b82f6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6366f1','#14b8a6','#f97316'];
    let idx = 0;
    foundWords.forEach(word => {
      const cells = wordPositions[word];
      if (!cells) return;
      const half = cellPx / 2;
      const points = cells.map(([r, c]) => `${c * cellPx + half},${r * cellPx + half}`).join(' ');
      lines.push({ word, points, color: colors[idx % colors.length] });
      idx++;
    });
    return lines;
  }, [foundWords, wordPositions, cellPx]);

  const pct = (time / TIME_LIMIT) * 100;
  const timerColor = time <= 10 ? '#ef4444' : time <= 30 ? '#f59e0b' : '#22c55e';

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, LEVELS[dailyGameDifficulty]]].filter(([, c]) => c)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : level;

  const tHowToPlay = useTranslateText('How to Play');
  const tGotIt = useTranslateText('Got it');
  const tDailyChallenge = useTranslateText('Daily Challenge');
  const tStartGame = useTranslateText('Start Game');
  const tGameTitle = useTranslateText('Word Search Master');
  const tHowToPlayTitle = useTranslateText('Word Search Master – How to Play');
  const tLevelLabels = { easy: useTranslateText('Easy'), moderate: useTranslateText('Moderate'), hard: useTranslateText('Hard') };
  const tWsmBullet1 = useTranslateText('Choose a difficulty (Easy / Moderate / Hard). Each has a grid and a set of hidden words.');
  const tWsmBullet2 = useTranslateText('Words are hidden in a straight line—horizontal, vertical, or diagonal (forward or backward).');
  const tWsmBullet3 = useTranslateText('Drag across letters to select a word. Release to submit.');
  const tWsmBullet4 = useTranslateText('Find all words before time runs out. You have 2 minutes and can score up to 200 points.');
  const tWsmBullet5 = useTranslateText('Consecutive finds build a combo for extra satisfaction. Wrong selections reset the combo.');

  const instructionsModalContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>{tHowToPlay}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>{tWsmBullet1}</li>
        <li>{tWsmBullet2}</li>
        <li>{tWsmBullet3}</li>
        <li>{tWsmBullet4}</li>
        <li>{tWsmBullet5}</li>
      </ul>
    </>
  );

  /* ─── inject keyframes ─── */
  useEffect(() => {
    const id = 'ws-master-kf';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes ws-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
      @keyframes ws-pop { 0%{transform:scale(1)} 50%{transform:scale(1.25)} 100%{transform:scale(1.15)} }
      @keyframes ws-fadeIn { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes ws-comboZoom { 0%{transform:translate(-50%,-50%) scale(0.3);opacity:0} 40%{transform:translate(-50%,-50%) scale(1.2);opacity:1} 100%{transform:translate(-50%,-50%) scale(1) translateY(-30px);opacity:0} }
      @keyframes ws-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes ws-winPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    `;
    document.head.appendChild(s);
  }, []);

  /* ─── shared styles ─── */
  const baseBtn = {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#e2e8f0', borderRadius: 10, padding: '6px 14px', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)', transition: 'all 0.2s',
  };
  const titleGrad = {
    fontWeight: 800, background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #34d399)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 1,
  };
  const wrapper = {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#e2e8f0',
    overflow: 'hidden', userSelect: 'none',
  };
  const menuCard = {
    background: 'rgba(30, 27, 75, 0.7)', border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: 24, padding: 'clamp(24px, 5vw, 48px)', textAlign: 'center',
    backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
    maxWidth: 420, width: '90%', animation: 'ws-fadeIn 0.5s ease',
  };
  const levelBtn = (color) => ({
    width: '100%', padding: '14px', borderRadius: 14, border: `1px solid ${color}55`,
    background: `linear-gradient(135deg, ${color}22, ${color}44)`,
    color: '#e2e8f0', fontSize: 'clamp(14px, 3vw, 17px)', fontWeight: 700,
    cursor: 'pointer', transition: 'all 0.25s', marginBottom: 10,
  });

  const colors = { easy: '#22c55e', moderate: '#f59e0b', hard: '#ef4444' };

  /* ─── single return: header + content + modal ─── */
  return (
    <div style={wrapper}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 700, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 10 }}>
        <h1 style={{ ...titleGrad, fontSize: 'clamp(16px, 4vw, 22px)', margin: 0 }}>🔤 {tGameTitle}</h1>
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
            <span aria-hidden>❓</span> {tHowToPlay}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 'clamp(12px, 2.5vw, 15px)', fontWeight: 600 }}>
            <span>⭐ {score}</span>
            <span style={{ color: timerColor }}>⏱ {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
            <span>📝 {foundWords.size}/{words.length}</span>
          </div>
        )}
      </div>

      {/* Menu */}
      {phase === 'menu' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="word-search-instructions-title"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(139,92,246,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <h2 id="word-search-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#a78bfa' }}>
                    🔤 {tHowToPlayTitle}
                  </h2>
                  <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close"
                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    ×
                  </button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{instructionsModalContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <button type="button" onClick={() => setShowInstructions(false)}
                    style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
                    {tGotIt}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={menuCard}>
            {isDailyGame && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.2)', color: '#a78bfa', fontSize: 12, fontWeight: 600 }}>
                📅 {tDailyChallenge}
              </div>
            )}
            <div style={{ fontSize: 'clamp(40px, 10vw, 64px)', marginBottom: 8, animation: 'ws-float 3s ease-in-out infinite' }}>🔤</div>
            <h2 style={{ ...titleGrad, fontSize: 'clamp(22px, 5vw, 32px)', marginBottom: 4 }}>{tGameTitle}</h2>
            <p style={{ color: 'rgba(226,232,240,0.6)', fontSize: 'clamp(12px, 2.5vw, 15px)', marginBottom: 24, lineHeight: 1.5 }}>
              Find hidden words in the grid.<br />Drag across letters to select!
            </p>
            {!checkingDailyGame && levelEntries.map(([key, val]) => (
              <button
                key={key}
                style={{
                  ...levelBtn(colors[key] || '#6366f1'),
                  opacity: selectedLevel === key ? 1 : 0.85,
                  border: selectedLevel === key ? `2px solid ${colors[key]}` : `1px solid ${(colors[key] || '#6366f1')}55`,
                }}
                onClick={() => !isDailyGame && setLevel(key)}
              >
                {val.emoji} {tLevelLabels[key]} — {val.gridSize}×{val.gridSize} · {val.wordCount} words
              </button>
            ))}
            <button
              style={{ ...levelBtn('#34d399'), marginTop: 8 }}
              disabled={!selectedLevel || checkingDailyGame}
              onClick={() => startGame(selectedLevel)}
            >
              {tStartGame}
            </button>
            {onBack && <button style={{ ...baseBtn, marginTop: 16, width: '100%', padding: '10px' }} onClick={onBack}>← Back to Games</button>}
          </div>
        </div>
      )}

      {/* Playing / Gameover */}
      {(phase === 'playing' || phase === 'gameover') && (
        <>
      <div style={{ width: '100%', maxWidth: 700, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ height: '100%', borderRadius: 3, transition: 'width 1s linear, background 0.5s', background: timerColor, width: `${pct}%` }} />
      </div>

      <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', maxWidth: 700, padding: '8px 16px', overflow: 'hidden', pointerEvents: phase === 'gameover' ? 'none' : 'auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: '8px 0', maxWidth: gridPixelSize, width: '100%' }}>
          {words.map(w => (
            <span key={w} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 'clamp(11px, 2vw, 14px)', fontWeight: 700,
              background: foundWords.has(w) ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${foundWords.has(w) ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255,255,255,0.12)'}`,
              color: foundWords.has(w) ? '#34d399' : 'rgba(226, 232, 240, 0.7)',
              textDecoration: foundWords.has(w) ? 'line-through' : 'none',
              transition: 'all 0.3s',
            }}>{w}</span>
          ))}
        </div>

        <div ref={gridRef} style={{
          position: 'relative', width: gridPixelSize, height: gridPixelSize,
          borderRadius: 12, overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.6)', border: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.15), inset 0 0 30px rgba(0,0,0,0.3)',
          touchAction: 'none', cursor: 'crosshair',
        }}
          onMouseDown={handlePointerDown} onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}
        >
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
            {foundLines.map(({ word, points, color }) => (
              <polyline key={word} points={points} stroke={color + '88'} strokeWidth={cellPx * 0.65}
                strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ))}
            {selectionLine && (
              <polyline points={selectionLine} stroke="rgba(251, 191, 36, 0.4)" strokeWidth={cellPx * 0.6}
                strokeLinecap="round" strokeLinejoin="round" fill="none" />
            )}
          </svg>

          {grid.map((row, r) => row.map((letter, c) => {
            const key = cellKey(r, c);
            const isSel = selectedSet.has(key);
            const isFnd = foundCells.has(key);
            const isFl = flashCells.has(key);
            return (
              <div key={key} style={{
                position: 'absolute', left: c * cellPx, top: r * cellPx, width: cellPx, height: cellPx,
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                fontSize, fontWeight: 700, letterSpacing: 0.5,
                color: isFnd ? '#fff' : isSel ? '#fbbf24' : 'rgba(226, 232, 240, 0.85)',
                background: isFl ? 'rgba(52, 211, 153, 0.5)' : isFnd ? 'rgba(139, 92, 246, 0.25)' : isSel ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                borderRight: c < gridDim - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                borderBottom: r < gridDim - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.2s, color 0.2s, transform 0.15s',
                transform: isFl ? 'scale(1.15)' : isSel ? 'scale(1.08)' : 'scale(1)',
                textShadow: isSel ? '0 0 12px rgba(251, 191, 36, 0.6)' : isFnd ? '0 0 8px rgba(139, 92, 246, 0.5)' : 'none',
                animation: shakeCells && isSel ? 'ws-shake 0.4s ease' : isFl ? 'ws-pop 0.5s ease' : 'none',
              }}>{letter}</div>
            );
          }))}

          {showCombo && combo >= 2 && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20,
              fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900,
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'ws-comboZoom 0.8s ease forwards', pointerEvents: 'none',
              filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
            }}>🔥 {combo}x Combo!</div>
          )}
        </div>
      </div>
        </>
      )}

      {phase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle={tGameTitle}
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
