import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

const LEVELS = {
  easy: { gridSize: 6, candyTypes: 4, rounds: 8, label: 'Easy' },
  moderate: { gridSize: 7, candyTypes: 5, rounds: 10, label: 'Moderate' },
  hard: { gridSize: 8, candyTypes: 6, rounds: 12, label: 'Hard' },
};

const TOTAL_POINTS = 200;
const TIME_LIMIT = 120;

const CANDY_COLORS = [
  { bg: 'linear-gradient(135deg, #ff6b6b, #ee5a24)', glow: '#ff6b6b', icon: '🔴', shadow: 'rgba(255,107,107,0.6)' },
  { bg: 'linear-gradient(135deg, #48dbfb, #0abde3)', glow: '#48dbfb', icon: '🔵', shadow: 'rgba(72,219,251,0.6)' },
  { bg: 'linear-gradient(135deg, #feca57, #ff9f43)', glow: '#feca57', icon: '🟡', shadow: 'rgba(254,202,87,0.6)' },
  { bg: 'linear-gradient(135deg, #55efc4, #00b894)', glow: '#55efc4', icon: '🟢', shadow: 'rgba(85,239,196,0.6)' },
  { bg: 'linear-gradient(135deg, #a29bfe, #6c5ce7)', glow: '#a29bfe', icon: '🟣', shadow: 'rgba(162,155,254,0.6)' },
  { bg: 'linear-gradient(135deg, #fd79a8, #e84393)', glow: '#fd79a8', icon: '💗', shadow: 'rgba(253,121,168,0.6)' },
];

const CANDY_SHAPES = ['●', '◆', '★', '▲', '■', '♥'];

let cellIdCounter = 0;
const makeCell = (type) => ({ type, id: cellIdCounter++ });

export default function CandyCrush() {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [matchesFound, setMatchesFound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected] = useState(null);
  const [animatingCells, setAnimatingCells] = useState(new Set());
  const [removingCells, setRemovingCells] = useState(new Set());
  const [fallingCells, setFallingCells] = useState(new Set());
  const [comboCount, setComboCount] = useState(0);
  const [comboText, setComboText] = useState('');
  const [shakeCell, setShakeCell] = useState(null);
  const [hintCells, setHintCells] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 400, h: 600 });
  const audioCtx = useRef(null);
  const timerRef = useRef(null);
  const hintTimer = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(TIME_LIMIT);
  const location = useLocation();
  scoreRef.current = score;
  timeLeftRef.current = timeLeft;

  const config = level ? LEVELS[level] : null;

  // Responsive sizing
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
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
            return;
          }
        }
        // Not in daily list (or no match): show all levels and clear daily state
        setIsDailyGame(false);
        setDailyGameDifficulty(null);
        setLevel(null);
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

  // Audio
  const getAudio = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const playSound = useCallback((type) => {
    try {
      const ctx = getAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;

      if (type === 'swap') {
        osc.frequency.value = 500;
        osc.type = 'sine';
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'match') {
        osc.frequency.value = 700;
        osc.type = 'triangle';
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
        // Extra sparkle
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = 1100; o2.type = 'sine';
        g2.gain.value = 0.1;
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        o2.start(ctx.currentTime + 0.05);
        o2.stop(ctx.currentTime + 0.2);
      } else if (type === 'combo') {
        [800, 1000, 1200].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = f; o.type = 'triangle';
          g.gain.value = 0.12;
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1 * (i + 1) + 0.15);
          o.start(ctx.currentTime + 0.1 * i);
          o.stop(ctx.currentTime + 0.1 * (i + 1) + 0.15);
        });
      } else if (type === 'invalid') {
        osc.frequency.value = 200;
        osc.type = 'sawtooth';
        gain.gain.value = 0.08;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'win') {
        [523, 659, 784, 1047].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = f; o.type = 'sine';
          g.gain.value = 0.15;
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15 * (i + 1) + 0.3);
          o.start(ctx.currentTime + 0.15 * i);
          o.stop(ctx.currentTime + 0.15 * (i + 1) + 0.3);
        });
      } else if (type === 'tick') {
        osc.frequency.value = 880;
        osc.type = 'square';
        gain.gain.value = 0.05;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'select') {
        osc.frequency.value = 600;
        osc.type = 'sine';
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {}
  }, [getAudio]);

  // Create grid without initial matches
  const createGrid = useCallback((cfg) => {
    const { gridSize, candyTypes } = cfg;
    const g = [];
    for (let r = 0; r < gridSize; r++) {
      const row = [];
      for (let c = 0; c < gridSize; c++) {
        let type;
        do {
          type = Math.floor(Math.random() * candyTypes);
        } while (
          (c >= 2 && row[c - 1].type === type && row[c - 2].type === type) ||
          (r >= 2 && g[r - 1][c].type === type && g[r - 2][c].type === type)
        );
        row.push(makeCell(type));
      }
      g.push(row);
    }
    return g;
  }, []);

  // Find all matches in grid
  const findMatches = useCallback((g) => {
    const size = g.length;
    const matched = new Set();
    // Horizontal
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - 3; c++) {
        if (g[r][c].type === g[r][c + 1].type && g[r][c].type === g[r][c + 2].type) {
          let end = c + 2;
          while (end + 1 < size && g[r][end + 1].type === g[r][c].type) end++;
          for (let k = c; k <= end; k++) matched.add(`${r},${k}`);
        }
      }
    }
    // Vertical
    for (let c = 0; c < size; c++) {
      for (let r = 0; r <= size - 3; r++) {
        if (g[r][c].type === g[r + 1][c].type && g[r][c].type === g[r + 2][c].type) {
          let end = r + 2;
          while (end + 1 < size && g[end + 1][c].type === g[r][c].type) end++;
          for (let k = r; k <= end; k++) matched.add(`${k},${c}`);
        }
      }
    }
    return matched;
  }, []);

  // Check if any valid move exists
  const findHint = useCallback((g) => {
    const size = g.length;
    const dirs = [[0, 1], [1, 0]];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr < size && nc < size) {
            // Swap and check
            const copy = g.map(row => [...row]);
            [copy[r][c], copy[nr][nc]] = [copy[nr][nc], copy[r][c]];
            if (findMatches(copy).size > 0) {
              return [[r, c], [nr, nc]];
            }
          }
        }
      }
    }
    return null;
  }, [findMatches]);

  // Ensure grid has at least one valid move
  const ensureValidMoves = useCallback((g, cfg) => {
    let attempts = 0;
    let currentGrid = g;
    while (!findHint(currentGrid) && attempts < 20) {
      currentGrid = createGrid(cfg);
      attempts++;
    }
    return currentGrid;
  }, [findHint, createGrid]);

  // Start game
  const startGame = useCallback((lvl) => {
    const cfg = LEVELS[lvl];
    setLevel(lvl);
    const g = ensureValidMoves(createGrid(cfg), cfg);
    setGrid(g);
    setScore(0);
    setMatchesFound(0);
    setTimeLeft(TIME_LIMIT);
    setSelected(null);
    setComboCount(0);
    setComboText('');
    setProcessing(false);
    setHintCells([]);
    setCompletionData(null);
    setPhase('playing');
  }, [createGrid, ensureValidMoves]);

  const handleReset = useCallback(() => {
    clearInterval(timerRef.current);
    setCompletionData(null);
    setPhase('menu');
    setLevel(null);
  }, []);

  // Query param auto-start
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lvl = params.get('level');
    if (lvl && LEVELS[lvl]) startGame(lvl);
  }, [startGame]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty: level,
            timeElapsed: TIME_LIMIT,
          });
          setPhase('gameover');
          return 0;
        }
        if (prev <= 11) playSound('tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, playSound, level]);

  // Hint timer
  useEffect(() => {
    if (phase !== 'playing' || processing) {
      setHintCells([]);
      return;
    }
    hintTimer.current = setTimeout(() => {
      const hint = findHint(grid);
      if (hint) setHintCells(hint);
    }, 5000);
    return () => clearTimeout(hintTimer.current);
  }, [phase, grid, processing, findHint]);

  // Check win
  useEffect(() => {
    if (phase === 'playing' && score >= TOTAL_POINTS) {
      clearInterval(timerRef.current);
      setCompletionData({
        score: TOTAL_POINTS,
        isVictory: true,
        difficulty: level,
        timeElapsed: TIME_LIMIT - timeLeftRef.current,
      });
      playSound('win');
      setPhase('gameover');
    }
  }, [score, phase, playSound, level]);

  // Process matches after grid changes
  const processMatches = useCallback(async (g, currentScore, currentMatches, combo) => {
    const matched = findMatches(g);
    if (matched.size === 0) {
      // Check for valid moves, reshuffle if none
      if (!findHint(g) && config) {
        const newGrid = ensureValidMoves(createGrid(config), config);
        setGrid(newGrid);
      }
      setProcessing(false);
      setComboCount(0);
      return;
    }

    const newCombo = combo + 1;
    setComboCount(newCombo);
    if (newCombo > 1) {
      setComboText(newCombo >= 4 ? '🔥 INCREDIBLE!' : newCombo >= 3 ? '⚡ AMAZING!' : '✨ COMBO!');
      playSound('combo');
    } else {
      playSound('match');
    }

    // Points per match
    const pointsPerMatch = Math.ceil(TOTAL_POINTS / (config?.rounds || 10));
    const earnedRaw = matched.size * (newCombo >= 3 ? 3 : newCombo >= 2 ? 2 : 1);
    const earned = Math.min(earnedRaw, pointsPerMatch * newCombo);
    const newScore = Math.min(currentScore + earned, TOTAL_POINTS);
    const newMatches = currentMatches + matched.size;

    // Animate removal
    setRemovingCells(new Set(matched));
    await new Promise(r => setTimeout(r, 400));
    setRemovingCells(new Set());

    // Remove matched and drop
    const size = g.length;
    const newGrid = g.map(row => row.map(cell => ({ ...cell })));

    // Mark matched as null
    for (const key of matched) {
      const [r, c] = key.split(',').map(Number);
      newGrid[r][c] = null;
    }

    // Drop down
    const falling = new Set();
    for (let c = 0; c < size; c++) {
      let writeRow = size - 1;
      for (let r = size - 1; r >= 0; r--) {
        if (newGrid[r][c] !== null) {
          if (writeRow !== r) {
            newGrid[writeRow][c] = newGrid[r][c];
            newGrid[r][c] = null;
            falling.add(`${writeRow},${c}`);
          }
          writeRow--;
        }
      }
      // Fill top with new candies
      for (let r = writeRow; r >= 0; r--) {
        newGrid[r][c] = makeCell(Math.floor(Math.random() * (config?.candyTypes || 4)));
        falling.add(`${r},${c}`);
      }
    }

    setFallingCells(falling);
    setGrid(newGrid);
    setScore(newScore);
    setMatchesFound(newMatches);

    await new Promise(r => setTimeout(r, 350));
    setFallingCells(new Set());

    // Recurse for cascades
    setTimeout(() => processMatches(newGrid, newScore, newMatches, newCombo), 100);
  }, [config, findMatches, findHint, ensureValidMoves, createGrid, playSound]);

  // Handle cell click
  const handleCellClick = useCallback((r, c) => {
    if (phase !== 'playing' || processing) return;
    setHintCells([]);

    if (!selected) {
      setSelected([r, c]);
      playSound('select');
      return;
    }

    const [sr, sc] = selected;
    if (sr === r && sc === c) {
      setSelected(null);
      return;
    }

    // Check adjacency
    const isAdj = (Math.abs(sr - r) + Math.abs(sc - c)) === 1;
    if (!isAdj) {
      setShakeCell(`${r},${c}`);
      playSound('invalid');
      setTimeout(() => setShakeCell(null), 300);
      setSelected([r, c]);
      return;
    }

    // Swap
    playSound('swap');
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    [newGrid[sr][sc], newGrid[r][c]] = [newGrid[r][c], newGrid[sr][sc]];

    // Check if swap creates match
    const matches = findMatches(newGrid);
    if (matches.size === 0) {
      // Invalid swap - swap back with shake
      setAnimatingCells(new Set([`${sr},${sc}`, `${r},${c}`]));
      setGrid(newGrid);
      setTimeout(() => {
        const revert = newGrid.map(row => row.map(cell => ({ ...cell })));
        [revert[sr][sc], revert[r][c]] = [revert[r][c], revert[sr][sc]];
        setGrid(revert);
        setAnimatingCells(new Set());
        playSound('invalid');
      }, 300);
      setSelected(null);
      return;
    }

    // Valid swap
    setGrid(newGrid);
    setSelected(null);
    setProcessing(true);
    setTimeout(() => processMatches(newGrid, score, matchesFound, 0), 150);
  }, [phase, processing, selected, grid, findMatches, processMatches, score, matchesFound, playSound]);

  // Cell size
  const cellSize = useMemo(() => {
    if (!config) return 40;
    const padding = 20;
    const maxW = (dims.w - padding * 2) / config.gridSize;
    const headerH = dims.h < 500 ? 70 : 100;
    const maxH = (dims.h - headerH - padding * 2 - 60) / config.gridSize;
    return Math.floor(Math.min(maxW, maxH, 70));
  }, [dims, config]);

  const isSmall = dims.h < 500 || dims.w < 400;
  const gap = Math.max(2, Math.floor(cellSize * 0.06));
  const gridPx = config ? config.gridSize * (cellSize + gap) - gap : 0;

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const pct = (score / TOTAL_POINTS) * 100;
  const timePct = (timeLeft / TIME_LIMIT) * 100;

  const instructionsModalContent = (
    <>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Objective</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Match 3 or more candies of the same type by swapping adjacent candies. Reach {TOTAL_POINTS} points before time runs out!</p>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Tap or click a candy, then tap an adjacent candy to swap them.</li>
          <li>Only swaps that create a match of 3+ (horizontal or vertical) are valid.</li>
          <li>Chain combos for bonus points when new candies fall and match.</li>
          <li>You have {TIME_LIMIT} seconds. Match fast to score more!</li>
        </ul>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Scoring</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Points per match. Combos multiply your score. Max score {TOTAL_POINTS}.</p>
      </section>
      <section>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Levels</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Easy: 6×6, 4 candy types. Moderate: 7×7, 5 types. Hard: 8×8, 6 types.</p>
      </section>
    </>
  );

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? Object.entries(LEVELS).filter(([k]) => k === dailyGameDifficulty)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : (level || 'easy');

  // CSS keyframes
  const styleTag = `
    @keyframes cc-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
    @keyframes cc-remove { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:0.5} 100%{transform:scale(0);opacity:0} }
    @keyframes cc-fall { 0%{transform:translateY(-${cellSize * 2}px);opacity:0} 60%{opacity:1} 100%{transform:translateY(0)} }
    @keyframes cc-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
    @keyframes cc-hint { 0%,100%{box-shadow:0 0 4px rgba(255,255,255,0.3)} 50%{box-shadow:0 0 16px rgba(255,255,255,0.9)} }
    @keyframes cc-selected { 0%,100%{box-shadow:0 0 8px 2px rgba(255,255,255,0.7)} 50%{box-shadow:0 0 18px 6px rgba(255,255,255,1)} }
    @keyframes cc-combo-pop { 0%{transform:scale(0.5) translateY(0);opacity:0} 30%{transform:scale(1.2) translateY(-10px);opacity:1} 100%{transform:scale(1) translateY(-30px);opacity:0} }
    @keyframes cc-sparkle { 0%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
    @keyframes cc-bg-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes cc-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes cc-glow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.3)} }
  `;

  // Menu screen
  if (phase === 'menu') {
    return (
      <div ref={containerRef} style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #533483)',
        backgroundSize: '400% 400%', animation: 'cc-bg-shift 8s ease infinite',
        fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden',
      }}>
        <style>{styleTag}</style>
        {/* Floating decorative candies */}
        {['🍬', '🍭', '🍫', '🍩', '🧁', '🍪'].map((e, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${10 + (i * 15) % 70}%`,
            left: `${5 + (i * 18) % 85}%`,
            fontSize: isSmall ? '24px' : '36px',
            opacity: 0.15,
            animation: `cc-float ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            pointerEvents: 'none',
          }}>{e}</div>
        ))}

        {/* How to Play - fixed top-right so it's always visible */}
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          aria-label="How to play"
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.35)',
            background: 'rgba(30,41,59,0.9)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <span aria-hidden>❓</span> How to Play
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="candy-crush-instructions-title"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(255,107,107,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <h2 id="candy-crush-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#ff6b6b' }}>
                    🍬 Candy Crush – How to Play
                  </h2>
                  <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close"
                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{instructionsModalContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <button type="button" onClick={() => setShowInstructions(false)}
                    style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Got it</button>
                </div>
              </div>
            </div>
          )}
          <div style={{
            fontSize: isSmall ? '32px' : '52px', fontWeight: 900,
            background: 'linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #55efc4, #a29bfe, #fd79a8)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
            textShadow: 'none', marginBottom: '8px', letterSpacing: '-1px',
            animation: 'cc-glow 2s ease-in-out infinite',
          }}>🍬 Candy Crush</div>
          <div style={{
            color: 'rgba(255,255,255,0.7)', fontSize: isSmall ? '12px' : '16px',
            marginBottom: isSmall ? '20px' : '36px', textAlign: 'center', maxWidth: '340px',
          }}>Match 3+ candies to score! Swap adjacent candies to create matches. Chain combos for bonus points!</div>
          {checkingDailyGame && (
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16, fontSize: 13 }}>Checking daily challenge…</p>
          )}
          {!checkingDailyGame && isDailyGame && (
            <div style={{ marginBottom: 16, padding: '6px 16px', background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.5)', borderRadius: 20, fontSize: 13, color: '#ff6b6b', fontWeight: 600 }}>Daily Challenge</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isSmall ? '10px' : '14px', width: isSmall ? '220px' : '280px' }}>
            {!checkingDailyGame && levelEntries.map(([key, cfg]) => {
              const colors = {
                easy: { bg: 'linear-gradient(135deg, #55efc4, #00b894)', shadow: 'rgba(0,184,148,0.4)' },
                moderate: { bg: 'linear-gradient(135deg, #feca57, #ff9f43)', shadow: 'rgba(255,159,67,0.4)' },
                hard: { bg: 'linear-gradient(135deg, #ff6b6b, #ee5a24)', shadow: 'rgba(238,90,36,0.4)' },
              };
              return (
                <button key={key} onClick={() => !isDailyGame && setLevel(key)} disabled={isDailyGame} style={{
                  padding: isSmall ? '12px' : '16px', border: 'none', borderRadius: '16px', cursor: isDailyGame ? 'default' : 'pointer',
                  background: colors[key].bg, color: '#fff', fontSize: isSmall ? '15px' : '18px',
                  fontWeight: 700, boxShadow: `0 6px 20px ${colors[key].shadow}`,
                  transition: 'transform 0.2s, box-shadow 0.2s', letterSpacing: '0.5px',
                }}
                onMouseEnter={e => { if (!isDailyGame) { e.target.style.transform = 'translateY(-3px) scale(1.03)'; e.target.style.boxShadow = `0 10px 30px ${colors[key].shadow}`; } }}
                onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = `0 6px 20px ${colors[key].shadow}`; }}
                >
                  {cfg.label} — {cfg.gridSize}×{cfg.gridSize}
                </button>
              );
            })}
          </div>
          {!checkingDailyGame && (
            <button onClick={() => selectedLevel && startGame(selectedLevel)} style={{
              marginTop: 12, padding: isSmall ? '12px' : '16px', border: 'none', borderRadius: '16px', cursor: 'pointer',
              background: 'linear-gradient(135deg, #48dbfb, #0abde3)', color: '#fff', fontSize: isSmall ? '15px' : '18px',
              fontWeight: 700, boxShadow: '0 6px 20px rgba(72,219,251,0.4)', width: isSmall ? '220px' : '280px',
            }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.target.style.transform = ''; }}
            >Start Game</button>
          )}
        </div>

        <div style={{
          position: 'absolute', bottom: isSmall ? '10px' : '20px',
          color: 'rgba(255,255,255,0.3)', fontSize: '11px',
        }}>⏱ 2 min · 🏆 200 pts max</div>
      </div>
    );
  }

  // Playing or Game Over (gameover shows GameCompletionModal on top)
  const playingContent = (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #533483)',
      backgroundSize: '400% 400%', animation: 'cc-bg-shift 15s ease infinite',
      fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden',
      padding: isSmall ? '4px' : '8px',
    }}>
      <style>{styleTag}</style>

      {/* Header */}
      <div style={{
        width: '100%', maxWidth: `${gridPx + 40}px`,
        display: 'flex', flexDirection: 'column', gap: isSmall ? '3px' : '6px',
        padding: isSmall ? '6px 10px' : '10px 16px',
        background: 'rgba(255,255,255,0.08)', borderRadius: '14px',
        backdropFilter: 'blur(10px)', marginBottom: isSmall ? '4px' : '10px',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleReset} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
            borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: isSmall ? '11px' : '13px',
          }}>✕</button>
          <div style={{
            color: '#fff', fontSize: isSmall ? '14px' : '18px', fontWeight: 800,
            background: 'linear-gradient(135deg, #feca57, #ff9f43)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>🍬 {LEVELS[level].label}</div>
          <div style={{
            color: timeLeft <= 15 ? '#ff6b6b' : 'rgba(255,255,255,0.8)',
            fontSize: isSmall ? '13px' : '16px', fontWeight: 700,
            animation: timeLeft <= 10 ? 'cc-pulse 0.5s infinite' : 'none',
          }}>⏱ {formatTime(timeLeft)}</div>
        </div>

        {/* Score bar */}
        <div style={{ position: 'relative', height: isSmall ? '14px' : '18px', borderRadius: '9px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '9px', transition: 'width 0.4s ease',
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg, #55efc4, #00b894)'
              : 'linear-gradient(90deg, #48dbfb, #a29bfe, #fd79a8)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: isSmall ? '9px' : '11px', fontWeight: 700,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>{score} / {TOTAL_POINTS}</div>
        </div>

        {/* Timer bar */}
        <div style={{ height: isSmall ? '4px' : '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '3px', transition: 'width 1s linear',
            width: `${timePct}%`,
            background: timeLeft <= 15
              ? 'linear-gradient(90deg, #ff6b6b, #ee5a24)'
              : 'linear-gradient(90deg, #55efc4, #48dbfb)',
          }} />
        </div>
      </div>

      {/* Combo text */}
      {comboText && (
        <div key={comboCount} style={{
          position: 'absolute', top: isSmall ? '80px' : '120px', left: '50%',
          transform: 'translateX(-50%)',
          fontSize: isSmall ? '20px' : '28px', fontWeight: 900, color: '#feca57',
          textShadow: '0 0 20px rgba(254,202,87,0.8)',
          animation: 'cc-combo-pop 1s ease-out forwards', pointerEvents: 'none', zIndex: 20,
        }}>{comboText}</div>
      )}

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${config.gridSize}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${config.gridSize}, ${cellSize}px)`,
        gap: `${gap}px`,
        padding: `${gap * 2}px`,
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative',
      }}>
        {grid.map((row, r) => row.map((cell, c) => {
          const key = `${r},${c}`;
          const candy = CANDY_COLORS[cell.type];
          const isSelected = selected && selected[0] === r && selected[1] === c;
          const isRemoving = removingCells.has(key);
          const isFalling = fallingCells.has(key);
          const isShaking = shakeCell === key;
          const isHint = hintCells.some(([hr, hc]) => hr === r && hc === c);

          let anim = '';
          if (isRemoving) anim = 'cc-remove 0.4s ease-out forwards';
          else if (isFalling) anim = 'cc-fall 0.35s ease-out';
          else if (isShaking) anim = 'cc-shake 0.3s ease';
          else if (isSelected) anim = 'cc-selected 0.8s ease-in-out infinite';
          else if (isHint) anim = 'cc-hint 1.2s ease-in-out infinite';

          const radius = cellSize * 0.22;

          return (
            <div
              key={cell.id}
              onClick={() => handleCellClick(r, c)}
              style={{
                width: cellSize, height: cellSize, borderRadius: `${radius}px`,
                background: candy.bg,
                boxShadow: isSelected
                  ? `0 0 18px 6px ${candy.shadow}, inset 0 -3px 6px rgba(0,0,0,0.2)`
                  : `0 3px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.2)`,
                cursor: processing ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: `${cellSize * 0.45}px`, fontWeight: 900,
                color: 'rgba(255,255,255,0.9)',
                textShadow: `0 2px 4px rgba(0,0,0,0.3)`,
                animation: anim,
                transition: isRemoving || isFalling ? 'none' : 'transform 0.15s ease, box-shadow 0.15s ease',
                userSelect: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!processing) e.target.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.target.style.transform = ''; }}
            >
              {/* Shine effect */}
              <div style={{
                position: 'absolute', top: '15%', left: '20%',
                width: '30%', height: '25%', borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              {CANDY_SHAPES[cell.type]}
            </div>
          );
        }))}
      </div>

      {/* Bottom info */}
      <div style={{
        marginTop: isSmall ? '4px' : '10px',
        color: 'rgba(255,255,255,0.4)', fontSize: isSmall ? '10px' : '12px',
        textAlign: 'center',
      }}>
        Swap adjacent candies to match 3+
      </div>
    </div>
  );

  const c = completionData || {};
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        {playingContent}
      </div>
      {phase === 'gameover' && completionData != null && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Candy Crush"
          score={c.score}
          timeElapsed={c.timeElapsed ?? TIME_LIMIT}
          gameTimeLimit={TIME_LIMIT}
          isVictory={c.isVictory}
          difficulty={c.difficulty}
          customMessages={{ maxScore: TOTAL_POINTS }}
        />
      )}
    </>
  );
}
