import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

const LEVELS = {
  easy: { rows: 8, cols: 8, mines: 10, label: 'Easy', emoji: '🟢' },
  moderate: { rows: 12, cols: 12, mines: 30, label: 'Moderate', emoji: '🟡' },
  hard: { rows: 16, cols: 16, mines: 55, label: 'Hard', emoji: '🔴' },
};

const TOTAL_POINTS = 200;
const TIME_LIMIT = 120;

const CELL_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#1e1e1e', '#6b7280'];

function createAudioContext() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
}

function playSound(ctx, type) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'reveal') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'flag') {
      osc.type = 'square'; osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'boom') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'win') {
      [0, 0.1, 0.2, 0.3].forEach((d, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime([523, 659, 784, 1047][i], ctx.currentTime + d);
        g.gain.setValueAtTime(0.15, ctx.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.2);
        o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.2);
      });
    } else if (type === 'tick') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.03);
    }
  } catch {}
}

function generateBoard(rows, cols, mines, firstR, firstC) {
  const board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  );
  const exclude = new Set();
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = firstR + dr, nc = firstC + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) exclude.add(nr * cols + nc);
    }
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine && !exclude.has(r * cols + c)) { board[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let cnt = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) cnt++;
        }
      board[r][c].count = cnt;
    }
  return board;
}

function floodReveal(board, r, c, rows, cols) {
  const stack = [[r, c]];
  let revealed = 0;
  while (stack.length) {
    const [cr, cc] = stack.pop();
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = board[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    revealed++;
    if (cell.count === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) stack.push([cr + dr, cc + dc]);
    }
  }
  return revealed;
}

export default function MineSweeper({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [difficulty, setDifficulty] = useState(null);
  const [board, setBoard] = useState([]);
  const [firstClick, setFirstClick] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [gameResult, setGameResult] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const timeLeftRef = useRef(TIME_LIMIT);
  const scoreRef = useRef(0);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const location = useLocation();
  timeLeftRef.current = timeLeft;
  scoreRef.current = score;

  const queryLevel = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const l = p.get('level');
    return l && LEVELS[l] ? l : null;
  }, []);
  const autoStartedRef = useRef(false);

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

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const config = difficulty ? LEVELS[difficulty] : null;
  const totalSafe = config ? config.rows * config.cols - config.mines : 0;

  const startGame = useCallback((level) => {
    if (!audioRef.current) audioRef.current = createAudioContext();
    setDifficulty(level);
    setBoard([]);
    setFirstClick(true);
    setTimeLeft(TIME_LIMIT);
    setScore(0);
    setFlagMode(false);
    setRevealedCount(0);
    setFlagCount(0);
    setGameResult(null);
    setCompletionData(null);
    setPhase('playing');
  }, []);

  const handleReset = useCallback(() => {
    clearInterval(timerRef.current);
    setCompletionData(null);
    setPhase('menu');
  }, []);

  useEffect(() => {
    if (queryLevel && !autoStartedRef.current && phase === 'menu' && dims.w > 100) {
      autoStartedRef.current = true;
      startGame(queryLevel);
    }
  }, [queryLevel, phase, dims, startGame]);

  useEffect(() => {
    if (phase !== 'playing' || firstClick) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase('gameover');
          setGameResult('timeout');
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty,
            timeElapsed: TIME_LIMIT,
          });
          playSound(audioRef.current, 'boom');
          return 0;
        }
        if (prev <= 11) playSound(audioRef.current, 'tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, firstClick, difficulty]);

  const checkWin = useCallback((newRevealed, ts) => {
    if (newRevealed >= ts) {
      clearInterval(timerRef.current);
      setScore(TOTAL_POINTS);
      setPhase('gameover');
      setGameResult('win');
      setCompletionData({
        score: TOTAL_POINTS,
        isVictory: true,
        difficulty,
        timeElapsed: TIME_LIMIT - timeLeftRef.current,
      });
      playSound(audioRef.current, 'win');
    }
  }, [difficulty]);

  const handleCellClick = useCallback((r, c) => {
    if (phase !== 'playing') return;
    setBoard(prev => {
      const cfg = LEVELS[difficulty];
      const rows = (prev.length > 0 && prev[0]) ? prev.length : cfg.rows;
      const cols = (prev.length > 0 && prev[0]) ? prev[0].length : cfg.cols;
      let b = prev;
      let isFirst = false;

      if (firstClick || prev.length === 0) {
        const cfg = LEVELS[difficulty];
        b = generateBoard(cfg.rows, cfg.cols, cfg.mines, r, c);
        isFirst = true;
        setFirstClick(false);
      } else {
        b = prev.map(row => row.map(cell => ({ ...cell })));
      }

      const cell = b[r][c];

      if (flagMode) {
        if (cell.revealed) return b;
        cell.flagged = !cell.flagged;
        setFlagCount(fc => fc + (cell.flagged ? 1 : -1));
        playSound(audioRef.current, 'flag');
        return b;
      }

      if (cell.flagged || cell.revealed) return b;

      if (cell.mine) {
        b.forEach(row => row.forEach(c2 => { if (c2.mine) c2.revealed = true; }));
        clearInterval(timerRef.current);
        setPhase('gameover');
        setGameResult('mine');
        setCompletionData({
          score: scoreRef.current,
          isVictory: false,
          difficulty,
          timeElapsed: TIME_LIMIT - timeLeftRef.current,
        });
        playSound(audioRef.current, 'boom');
        return b;
      }

      const newlyRevealed = floodReveal(b, r, c, rows, cols);
      playSound(audioRef.current, 'reveal');
      
      setRevealedCount(prev2 => {
        const total = prev2 + newlyRevealed;
        const cfg = LEVELS[difficulty];
        const ts = cfg.rows * cfg.cols - cfg.mines;
        const perCell = Math.floor(TOTAL_POINTS / ts);
        const pts = Math.min(TOTAL_POINTS, total === ts ? TOTAL_POINTS : total * perCell);
        setScore(pts);
        checkWin(total, ts);
        return total;
      });
      return b;
    });
  }, [phase, firstClick, difficulty, flagMode, checkWin]);

  const handleContextMenu = useCallback((e, r, c) => {
    e.preventDefault();
    if (phase !== 'playing') return;
    if (board.length === 0) return;
    setBoard(prev => {
      const b = prev.map(row => row.map(cell => ({ ...cell })));
      const cell = b[r][c];
      if (cell.revealed) return b;
      cell.flagged = !cell.flagged;
      setFlagCount(fc => fc + (cell.flagged ? 1 : -1));
      playSound(audioRef.current, 'flag');
      return b;
    });
  }, [phase, board]);

  const cellSize = useMemo(() => {
    if (!config) return 32;
    const headerH = 80;
    const footerH = 60;
    const pad = 20;
    const availW = dims.w - pad * 2;
    const availH = dims.h - headerH - footerH - pad * 2;
    const maxCW = Math.floor(availW / config.cols);
    const maxCH = Math.floor(availH / config.rows);
    return Math.max(20, Math.min(56, Math.min(maxCW, maxCH)));
  }, [config, dims]);

  const isSmall = dims.w < 500;

  const styles = {
    container: {
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isSmall ? '8px 12px' : '12px 24px', background: 'rgba(0,0,0,0.3)',
      borderBottom: '1px solid rgba(100,116,139,0.3)', flexShrink: 0, minHeight: 56,
      flexWrap: 'wrap', gap: 8,
    },
    backBtn: {
      background: 'rgba(100,116,139,0.3)', border: '1px solid rgba(100,116,139,0.4)',
      color: '#e2e8f0', padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
      fontSize: isSmall ? 12 : 14, display: 'flex', alignItems: 'center', gap: 6,
    },
    title: { fontSize: isSmall ? 16 : 22, fontWeight: 700, textAlign: 'center' },
    statBar: {
      display: 'flex', gap: isSmall ? 8 : 16, alignItems: 'center', flexWrap: 'wrap',
    },
    stat: {
      background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '4px 12px',
      fontSize: isSmall ? 12 : 14, display: 'flex', alignItems: 'center', gap: 4,
    },
    boardArea: {
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: config ? `repeat(${config.cols}, ${cellSize}px)` : 'none',
      gap: 2, background: 'rgba(0,0,0,0.4)', padding: 4, borderRadius: 8,
      border: '2px solid rgba(100,116,139,0.3)',
    },
    cell: (cell) => ({
      width: cellSize, height: cellSize, display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 4, cursor: 'pointer', fontWeight: 700, userSelect: 'none',
      fontSize: cellSize > 36 ? 18 : cellSize > 28 ? 14 : 11, transition: 'all 0.1s',
      ...(cell.revealed
        ? {
            background: cell.mine ? '#dc2626' : 'rgba(30,41,59,0.8)',
            border: '1px solid rgba(100,116,139,0.2)',
          }
        : {
            background: 'linear-gradient(145deg, #475569, #334155)',
            border: '1px solid rgba(148,163,184,0.3)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)',
          }),
    }),
    flagBtn: {
      position: 'fixed', bottom: 16, right: 16, width: 56, height: 56, borderRadius: '50%',
      border: flagMode ? '3px solid #f59e0b' : '2px solid rgba(100,116,139,0.4)',
      background: flagMode ? 'rgba(245,158,11,0.3)' : 'rgba(51,65,85,0.8)',
      color: '#e2e8f0', fontSize: 24, cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 10,
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    },
    footer: {
      padding: '8px 24px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(100,116,139,0.3)',
      textAlign: 'center', fontSize: 12, color: '#94a3b8', flexShrink: 0,
    },
    menuOverlay: {
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      zIndex: 20,
    },
    menuCard: {
      position: 'relative',
      background: 'rgba(30,41,59,0.95)', borderRadius: 16, padding: isSmall ? 24 : 40,
      border: '1px solid rgba(100,116,139,0.3)', maxWidth: 420, width: '90%',
      textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    },
    levelBtn: (hue) => ({
      width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
      background: `linear-gradient(135deg, hsl(${hue},70%,35%), hsl(${hue},70%,25%))`,
      color: '#e2e8f0', fontSize: 16, fontWeight: 600, cursor: 'pointer',
      marginBottom: 12, transition: 'transform 0.15s',
    }),
    resultOverlay: {
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', zIndex: 30, backdropFilter: 'blur(4px)',
    },
    resultCard: {
      background: 'rgba(30,41,59,0.98)', borderRadius: 16, padding: isSmall ? 24 : 40,
      border: '1px solid rgba(100,116,139,0.3)', maxWidth: 400, width: '90%',
      textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    },
  };

  const getCellContent = (cell) => {
    if (cell.flagged && !cell.revealed) return '🚩';
    if (!cell.revealed) return '';
    if (cell.mine) return '💣';
    if (cell.count === 0) return '';
    return cell.count;
  };

  const getCellColor = (cell) => {
    if (!cell.revealed || cell.mine || cell.count === 0) return 'inherit';
    return CELL_COLORS[cell.count - 1] || '#e2e8f0';
  };

  const progressPct = totalSafe > 0 ? Math.round((revealedCount / totalSafe) * 100) : 0;
  const timePct = (timeLeft / TIME_LIMIT) * 100;

  const instructionsModalContent = (
    <>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Objective</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Clear all safe cells without revealing any mines. Use numbers and flags to deduce mine positions.</p>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Left-click (or tap) a cell to reveal it.</li>
          <li>Numbers show how many mines are in the 8 surrounding cells.</li>
          <li>Right-click or use the flag button to mark cells you think contain mines.</li>
          <li>Reveal all non-mine cells before time runs out to win.</li>
        </ul>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Scoring & Time</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Score up to {TOTAL_POINTS} points based on revealed cells. You have {TIME_LIMIT} seconds. Hitting a mine or running out of time ends the game.</p>
      </section>
      <section>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Levels</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Easy (8×8, 10 mines), Moderate (12×12, 30 mines), Hard (16×16, 55 mines).</p>
      </section>
    </>
  );

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? Object.entries(LEVELS).filter(([k]) => k === dailyGameDifficulty)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : (difficulty || 'easy');

  if (phase === 'menu') {
    return (
      <div ref={containerRef} style={styles.menuOverlay}>
        <div style={styles.menuCard}>
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            aria-label="How to play"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.4)',
              background: 'rgba(30,41,59,0.8)',
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span aria-hidden>❓</span> How to Play
          </button>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="minesweeper-instructions-title"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(245,158,11,0.45)',
                  borderRadius: 20,
                  padding: 0,
                  maxWidth: 480,
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#e2e8f0',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <h2 id="minesweeper-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>
                    💣 Mine Sweeper – How to Play
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowInstructions(false)}
                    aria-label="Close"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#e2e8f0',
                      fontSize: 22,
                      lineHeight: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
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
                      width: '100%',
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: 'none',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                    }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={{ fontSize: 48, marginBottom: 8 }}>💣</div>
          <h1 style={{ fontSize: isSmall ? 24 : 32, fontWeight: 800, marginBottom: 4 }}>Mine Sweeper</h1>
          <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
            Clear the board without hitting mines. Right-click or use flag mode to mark mines.
          </p>
          {checkingDailyGame && (
            <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: 13 }}>Checking daily challenge…</p>
          )}
          {!checkingDailyGame && isDailyGame && (
            <div style={{ marginBottom: 20, padding: '6px 16px', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', borderRadius: 20, fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
              Daily Challenge
            </div>
          )}
          {!checkingDailyGame && levelEntries.map(([key, val]) => (
            <button key={key} style={styles.levelBtn(key === 'easy' ? 140 : key === 'moderate' ? 45 : 0)}
              onClick={() => !isDailyGame && setDifficulty(key)}
              disabled={isDailyGame}
              onMouseEnter={e => { if (!isDailyGame) e.target.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
              {val.emoji} {val.label}
              <span style={{ display: 'block', fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                {val.rows}×{val.cols} · {val.mines} mines
              </span>
            </button>
          ))}
          {!checkingDailyGame && (
            <button
              style={styles.levelBtn(210)}
              onClick={() => (selectedLevel && startGame(selectedLevel))}
              onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              Start Game
            </button>
          )}
          {onBack && (
            <button style={{ ...styles.backBtn, marginTop: 12, width: '100%', justifyContent: 'center' }}
              onClick={onBack}>← Back to Menu</button>
          )}
        </div>
      </div>
    );
  }

  const playingContent = (
    <div ref={containerRef} style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => { clearInterval(timerRef.current); setCompletionData(null); setPhase('menu'); }}>
          ← Back
        </button>
        <div style={styles.title}>💣 Mine Sweeper</div>
        <div style={styles.statBar}>
          <div style={styles.stat}>
            <span>⏱️</span>
            <span style={{ color: timeLeft <= 15 ? '#ef4444' : '#e2e8f0', fontWeight: 700 }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div style={styles.stat}>⭐ {score}/{TOTAL_POINTS}</div>
          <div style={styles.stat}>🚩 {flagCount}/{config?.mines || 0}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <div style={{
          height: '100%', width: `${progressPct}%`, transition: 'width 0.3s',
          background: 'linear-gradient(90deg, #3b82f6, #22c55e)',
        }} />
      </div>

      {/* Timer bar */}
      <div style={{ height: 3, background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <div style={{
          height: '100%', width: `${timePct}%`, transition: 'width 1s linear',
          background: timeLeft <= 15 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#06b6d4',
        }} />
      </div>

      {/* Board */}
      <div style={styles.boardArea}>
        <div style={styles.grid}>
          {(board.length > 0 ? board : Array.from({ length: config.rows }, () =>
            Array.from({ length: config.cols }, () => ({ revealed: false, flagged: false, mine: false, count: 0 }))
          )).map((row, r) =>
            row.map((cell, c) => (
              <div key={`${r}-${c}`} style={styles.cell(cell)}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleContextMenu(e, r, c)}>
                <span style={{ color: getCellColor(cell) }}>{getCellContent(cell)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile flag toggle */}
      <button style={styles.flagBtn} onClick={() => setFlagMode(f => !f)}>
        {flagMode ? '🚩' : '👆'}
      </button>

      {/* Footer */}
      <div style={styles.footer}>
        {isSmall ? 'Tap cell to reveal · Toggle 🚩 for flags' : 'Left-click to reveal · Right-click to flag · Toggle 🚩 button on mobile'}
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
          gameTitle="Mine Sweeper"
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
