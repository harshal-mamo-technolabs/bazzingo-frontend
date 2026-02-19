import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

// ═══════════════════════════════════════════════════════════════
// PUZZLE DATA — Hand-crafted, guaranteed solvable
// Each arrow: { id, row, col, direction }
// ═══════════════════════════════════════════════════════════════

const PUZZLES = {
  easy: [
    {
      grid: 5, par: 8,
      arrows: [
        { id: 1, row: 0, col: 2, direction: 'down' },
        { id: 2, row: 1, col: 0, direction: 'right' },
        { id: 3, row: 1, col: 4, direction: 'up' },
        { id: 4, row: 2, col: 1, direction: 'left' },
        { id: 5, row: 2, col: 3, direction: 'right' },
        { id: 6, row: 3, col: 2, direction: 'up' },
        { id: 7, row: 4, col: 0, direction: 'up' },
        { id: 8, row: 4, col: 4, direction: 'left' },
      ],
    },
    {
      grid: 5, par: 9,
      arrows: [
        { id: 1, row: 0, col: 0, direction: 'down' },
        { id: 2, row: 0, col: 3, direction: 'left' },
        { id: 3, row: 1, col: 1, direction: 'right' },
        { id: 4, row: 1, col: 4, direction: 'down' },
        { id: 5, row: 2, col: 2, direction: 'up' },
        { id: 6, row: 3, col: 0, direction: 'right' },
        { id: 7, row: 3, col: 3, direction: 'left' },
        { id: 8, row: 4, col: 1, direction: 'up' },
        { id: 9, row: 4, col: 4, direction: 'left' },
      ],
    },
    {
      grid: 5, par: 10,
      arrows: [
        { id: 1, row: 0, col: 1, direction: 'right' },
        { id: 2, row: 0, col: 4, direction: 'down' },
        { id: 3, row: 1, col: 0, direction: 'down' },
        { id: 4, row: 1, col: 3, direction: 'left' },
        { id: 5, row: 2, col: 2, direction: 'right' },
        { id: 6, row: 3, col: 1, direction: 'up' },
        { id: 7, row: 3, col: 4, direction: 'up' },
        { id: 8, row: 4, col: 0, direction: 'right' },
        { id: 9, row: 4, col: 2, direction: 'up' },
        { id: 10, row: 4, col: 3, direction: 'left' },
      ],
    },
  ],
  medium: [
    {
      grid: 6, par: 14,
      arrows: [
        { id: 1, row: 0, col: 0, direction: 'right' },
        { id: 2, row: 0, col: 3, direction: 'down' },
        { id: 3, row: 0, col: 5, direction: 'left' },
        { id: 4, row: 1, col: 1, direction: 'down' },
        { id: 5, row: 1, col: 4, direction: 'left' },
        { id: 6, row: 2, col: 0, direction: 'down' },
        { id: 7, row: 2, col: 2, direction: 'right' },
        { id: 8, row: 2, col: 5, direction: 'up' },
        { id: 9, row: 3, col: 1, direction: 'up' },
        { id: 10, row: 3, col: 3, direction: 'left' },
        { id: 11, row: 4, col: 0, direction: 'right' },
        { id: 12, row: 4, col: 4, direction: 'up' },
        { id: 13, row: 5, col: 2, direction: 'left' },
        { id: 14, row: 5, col: 5, direction: 'up' },
      ],
    },
    {
      grid: 6, par: 16,
      arrows: [
        { id: 1, row: 0, col: 1, direction: 'down' },
        { id: 2, row: 0, col: 4, direction: 'left' },
        { id: 3, row: 1, col: 0, direction: 'right' },
        { id: 4, row: 1, col: 2, direction: 'down' },
        { id: 5, row: 1, col: 5, direction: 'down' },
        { id: 6, row: 2, col: 1, direction: 'right' },
        { id: 7, row: 2, col: 3, direction: 'up' },
        { id: 8, row: 3, col: 0, direction: 'up' },
        { id: 9, row: 3, col: 4, direction: 'left' },
        { id: 10, row: 3, col: 5, direction: 'up' },
        { id: 11, row: 4, col: 2, direction: 'right' },
        { id: 12, row: 4, col: 3, direction: 'down' },
        { id: 13, row: 5, col: 0, direction: 'right' },
        { id: 14, row: 5, col: 1, direction: 'up' },
        { id: 15, row: 5, col: 4, direction: 'left' },
        { id: 16, row: 5, col: 5, direction: 'up' },
      ],
    },
    {
      grid: 6, par: 18,
      arrows: [
        { id: 1, row: 0, col: 0, direction: 'down' },
        { id: 2, row: 0, col: 2, direction: 'right' },
        { id: 3, row: 0, col: 5, direction: 'down' },
        { id: 4, row: 1, col: 1, direction: 'right' },
        { id: 5, row: 1, col: 3, direction: 'down' },
        { id: 6, row: 1, col: 4, direction: 'left' },
        { id: 7, row: 2, col: 0, direction: 'right' },
        { id: 8, row: 2, col: 2, direction: 'up' },
        { id: 9, row: 2, col: 5, direction: 'left' },
        { id: 10, row: 3, col: 1, direction: 'down' },
        { id: 11, row: 3, col: 3, direction: 'right' },
        { id: 12, row: 3, col: 4, direction: 'up' },
        { id: 13, row: 4, col: 0, direction: 'up' },
        { id: 14, row: 4, col: 2, direction: 'left' },
        { id: 15, row: 4, col: 5, direction: 'up' },
        { id: 16, row: 5, col: 1, direction: 'right' },
        { id: 17, row: 5, col: 3, direction: 'left' },
        { id: 18, row: 5, col: 4, direction: 'up' },
      ],
    },
  ],
  hard: [
    {
      grid: 7, par: 20,
      arrows: [
        { id: 1, row: 0, col: 0, direction: 'down' },
        { id: 2, row: 0, col: 3, direction: 'right' },
        { id: 3, row: 0, col: 6, direction: 'left' },
        { id: 4, row: 1, col: 1, direction: 'down' },
        { id: 5, row: 1, col: 4, direction: 'left' },
        { id: 6, row: 1, col: 5, direction: 'down' },
        { id: 7, row: 2, col: 0, direction: 'right' },
        { id: 8, row: 2, col: 2, direction: 'up' },
        { id: 9, row: 2, col: 6, direction: 'down' },
        { id: 10, row: 3, col: 1, direction: 'right' },
        { id: 11, row: 3, col: 3, direction: 'up' },
        { id: 12, row: 3, col: 5, direction: 'left' },
        { id: 13, row: 4, col: 0, direction: 'up' },
        { id: 14, row: 4, col: 2, direction: 'down' },
        { id: 15, row: 4, col: 4, direction: 'right' },
        { id: 16, row: 4, col: 6, direction: 'up' },
        { id: 17, row: 5, col: 1, direction: 'up' },
        { id: 18, row: 5, col: 3, direction: 'left' },
        { id: 19, row: 5, col: 5, direction: 'up' },
        { id: 20, row: 6, col: 0, direction: 'right' },
      ],
    },
    {
      grid: 7, par: 22,
      arrows: [
        { id: 1, row: 0, col: 1, direction: 'right' },
        { id: 2, row: 0, col: 4, direction: 'down' },
        { id: 3, row: 0, col: 6, direction: 'down' },
        { id: 4, row: 1, col: 0, direction: 'down' },
        { id: 5, row: 1, col: 2, direction: 'right' },
        { id: 6, row: 1, col: 5, direction: 'left' },
        { id: 7, row: 2, col: 1, direction: 'up' },
        { id: 8, row: 2, col: 3, direction: 'down' },
        { id: 9, row: 2, col: 6, direction: 'left' },
        { id: 10, row: 3, col: 0, direction: 'right' },
        { id: 11, row: 3, col: 2, direction: 'down' },
        { id: 12, row: 3, col: 4, direction: 'up' },
        { id: 13, row: 3, col: 5, direction: 'down' },
        { id: 14, row: 4, col: 1, direction: 'left' },
        { id: 15, row: 4, col: 3, direction: 'right' },
        { id: 16, row: 4, col: 6, direction: 'up' },
        { id: 17, row: 5, col: 0, direction: 'up' },
        { id: 18, row: 5, col: 2, direction: 'right' },
        { id: 19, row: 5, col: 5, direction: 'up' },
        { id: 20, row: 6, col: 1, direction: 'right' },
        { id: 21, row: 6, col: 3, direction: 'up' },
        { id: 22, row: 6, col: 6, direction: 'left' },
      ],
    },
    {
      grid: 7, par: 25,
      arrows: [
        { id: 1, row: 0, col: 0, direction: 'right' },
        { id: 2, row: 0, col: 2, direction: 'down' },
        { id: 3, row: 0, col: 5, direction: 'down' },
        { id: 4, row: 1, col: 1, direction: 'down' },
        { id: 5, row: 1, col: 3, direction: 'left' },
        { id: 6, row: 1, col: 4, direction: 'right' },
        { id: 7, row: 1, col: 6, direction: 'left' },
        { id: 8, row: 2, col: 0, direction: 'down' },
        { id: 9, row: 2, col: 2, direction: 'right' },
        { id: 10, row: 2, col: 5, direction: 'up' },
        { id: 11, row: 3, col: 1, direction: 'up' },
        { id: 12, row: 3, col: 3, direction: 'down' },
        { id: 13, row: 3, col: 6, direction: 'down' },
        { id: 14, row: 4, col: 0, direction: 'right' },
        { id: 15, row: 4, col: 2, direction: 'up' },
        { id: 16, row: 4, col: 4, direction: 'left' },
        { id: 17, row: 4, col: 5, direction: 'down' },
        { id: 18, row: 5, col: 1, direction: 'right' },
        { id: 19, row: 5, col: 3, direction: 'up' },
        { id: 20, row: 5, col: 6, direction: 'up' },
        { id: 21, row: 6, col: 0, direction: 'up' },
        { id: 22, row: 6, col: 2, direction: 'right' },
        { id: 23, row: 6, col: 4, direction: 'up' },
        { id: 24, row: 6, col: 5, direction: 'left' },
        { id: 25, row: 6, col: 6, direction: 'up' },
      ],
    },
  ],
};

const GAME_TIME = 300;

const DIR_CONFIG = {
  up:    { symbol: '↑', color: '#3b82f6', glow: '#60a5fa', angle: 0 },
  down:  { symbol: '↓', color: '#22c55e', glow: '#4ade80', angle: 180 },
  left:  { symbol: '←', color: '#f59e0b', glow: '#fbbf24', angle: 270 },
  right: { symbol: '→', color: '#a855f7', glow: '#c084fc', angle: 90 },
};

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: '#22c55e', emoji: '🟢', desc: '5×5 · 8-10 arrows' },
  medium: { label: 'Medium', color: '#f59e0b', emoji: '🟡', desc: '6×6 · 14-18 arrows' },
  hard:   { label: 'Hard',   color: '#ef4444', emoji: '🔴', desc: '7×7 · 20-25 arrows' },
};

// ─── Check if path is clear ──────────────────────────────────
function isPathClear(arrow, allArrows, gridSize) {
  const others = allArrows.filter((a) => a.id !== arrow.id);
  switch (arrow.direction) {
    case 'up':
      for (let r = arrow.row - 1; r >= 0; r--) {
        if (others.some((a) => a.row === r && a.col === arrow.col)) return false;
      }
      return true;
    case 'down':
      for (let r = arrow.row + 1; r < gridSize; r++) {
        if (others.some((a) => a.row === r && a.col === arrow.col)) return false;
      }
      return true;
    case 'left':
      for (let c = arrow.col - 1; c >= 0; c--) {
        if (others.some((a) => a.row === arrow.row && a.col === c)) return false;
      }
      return true;
    case 'right':
      for (let c = arrow.col + 1; c < gridSize; c++) {
        if (others.some((a) => a.row === arrow.row && a.col === c)) return false;
      }
      return true;
    default:
      return false;
  }
}

// ─── Fly-off target position ─────────────────────────────────
function getFlyTarget(direction) {
  switch (direction) {
    case 'up':    return { x: 0, y: -800 };
    case 'down':  return { x: 0, y: 800 };
    case 'left':  return { x: -800, y: 0 };
    case 'right': return { x: 800, y: 0 };
    default:      return { x: 0, y: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ArrowEscape() {
  const location = useLocation();
  const [screen, setScreen] = useState('menu');
  const [difficulty, setDifficulty] = useState(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [arrows, setArrows] = useState([]);
  const [gridSize, setGridSize] = useState(5);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [par, setPar] = useState(10);
  const [score, setScore] = useState(0);
  const [flyingIds, setFlyingIds] = useState(new Set());
  const [shakeIds, setShakeIds] = useState(new Set());
  const [isLandscape, setIsLandscape] = useState(true);
  const [completedLevels, setCompletedLevels] = useState({ easy: 0, medium: 0, hard: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState([]);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const timerRef = useRef(null);
  const playingRef = useRef({ moves: 0, timeLeft: GAME_TIME, par: 10, difficulty: 'easy' });
  playingRef.current = { moves, timeLeft, par, difficulty, levelIndex };

  // ─── Orientation ───
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight || window.innerWidth >= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Daily game detection ───
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
          const map = { easy: 'easy', medium: 'medium', hard: 'hard' };
          if (map[d]) {
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

  // ─── Timer (and time-up → finished) ───
  useEffect(() => {
    if (screen === 'game') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            const ref = playingRef.current;
            const timeElapsed = GAME_TIME;
            const finalScore = ref.par && ref.moves != null
              ? Math.min(200, Math.round(200 * Math.min(1, ref.par / Math.max(ref.moves, 1))))
              : 0;
            setCompletionData({
              score: finalScore,
              moves: ref.moves,
              isVictory: false,
              difficulty: ref.difficulty,
              timeElapsed,
              par: ref.par,
            });
            setScreen('finished');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [screen]);

  // ─── Start game ───
  const startGame = useCallback((diff, idx) => {
    const puzzles = PUZZLES[diff];
    const i = idx !== undefined ? idx : 0;
    const puzzle = puzzles[i];
    setDifficulty(diff);
    setLevelIndex(i);
    setPar(puzzle.par);
    setGridSize(puzzle.grid);
    setArrows(puzzle.arrows.map((a) => ({ ...a })));
    setMoves(0);
    setTimeLeft(GAME_TIME);
    setScore(0);
    setFlyingIds(new Set());
    setShakeIds(new Set());
    setShowConfetti(false);
    setParticles([]);
    setCompletionData(null);
    setScreen('game');
  }, []);

  const handleReset = useCallback(() => {
    setScreen('menu');
    setCompletionData(null);
  }, []);

  // ─── Spawn particles ───
  const spawnParticles = useCallback((row, col, direction, color, cellPx) => {
    const cx = col * cellPx + cellPx / 2;
    const cy = row * cellPx + cellPx / 2;
    const newParticles = Array.from({ length: 8 }).map((_, i) => {
      const baseAngle = { up: -90, down: 90, left: 180, right: 0 }[direction];
      const angle = (baseAngle + (Math.random() - 0.5) * 80) * (Math.PI / 180);
      const speed = 60 + Math.random() * 100;
      return {
        id: `${Date.now()}-${i}`,
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color, life: 1, size: 3 + Math.random() * 4,
      };
    });
    setParticles((p) => [...p, ...newParticles]);
    // Decay particles
    setTimeout(() => setParticles((p) => p.filter((pt) => !newParticles.find((n) => n.id === pt.id))), 800);
  }, []);

  // ─── Handle arrow tap ───
  const handleTap = useCallback((arrow) => {
    if (flyingIds.has(arrow.id)) return;

    const currentArrows = arrows.filter((a) => !flyingIds.has(a.id));
    if (!isPathClear(arrow, currentArrows, gridSize)) {
      // Shake it
      setShakeIds((s) => new Set(s).add(arrow.id));
      setTimeout(() => setShakeIds((s) => { const n = new Set(s); n.delete(arrow.id); return n; }), 400);
      return;
    }

    // Mark as flying
    setFlyingIds((s) => new Set(s).add(arrow.id));
    setMoves((m) => m + 1);

    const cfg = DIR_CONFIG[arrow.direction];
    const boardPx = Math.min(window.innerHeight * 0.6, window.innerWidth * 0.5, 480);
    const cellPx = boardPx / gridSize;
    spawnParticles(arrow.row, arrow.col, arrow.direction, cfg.color, cellPx);

    // Remove after animation
    setTimeout(() => {
      setArrows((prev) => {
        const remaining = prev.filter((a) => a.id !== arrow.id);
        setFlyingIds((s) => { const n = new Set(s); n.delete(arrow.id); return n; });

        // Check win
        if (remaining.length === 0) {
          clearInterval(timerRef.current);
          setShowConfetti(true);
          const ref = playingRef.current;
          const finalMoves = ref.moves + 1;
          const timeElapsed = GAME_TIME - ref.timeLeft;
          const finalScore = Math.min(200, Math.round(200 * Math.min(1, ref.par / finalMoves)));
          setTimeout(() => {
            setScore(finalScore);
            setCompletedLevels((c) => ({
              ...c,
              [ref.difficulty]: Math.max(c[ref.difficulty], ref.levelIndex + 1),
            }));
            setCompletionData({
              score: finalScore,
              moves: finalMoves,
              isVictory: true,
              difficulty: ref.difficulty,
              timeElapsed,
              par: ref.par,
            });
            setScreen('finished');
          }, 600);
        }
        return remaining;
      });
    }, 450);
  }, [arrows, flyingIds, gridSize, spawnParticles]);

  // ─── Compute score ───
  const currentScore = useMemo(() => {
    if (moves === 0) return 200;
    const ratio = par / Math.max(moves, 1);
    return Math.min(200, Math.round(200 * Math.min(1, ratio)));
  }, [moves, par]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const availableDifficulties = isDailyGame && dailyGameDifficulty ? [dailyGameDifficulty] : Object.keys(DIFFICULTY_CONFIG);

  const boardPixels = useMemo(() => {
    if (typeof window === 'undefined') return 420;
    return Math.min(window.innerHeight * 0.6, window.innerWidth * 0.5, 480);
  }, [screen, gridSize]);
  const cellPx = boardPixels / gridSize;

  // ═══ LANDSCAPE PROMPT ═══
  if (!isLandscape) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#f1f5f9', fontFamily: "'Segoe UI', system-ui, sans-serif", zIndex: 9999,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'spin 3s linear infinite' }}>📱</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Please Rotate Your Device</div>
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 8 }}>This game requires landscape mode</div>
        <style>{`@keyframes spin { 0%{transform:rotate(0)} 50%{transform:rotate(90deg)} 100%{transform:rotate(90deg)} }`}</style>
      </div>
    );
  }

  // ═══ MENU SCREEN ═══
  if (screen === 'menu') {
    if (checkingDailyGame) {
      return (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'linear-gradient(135deg, #0a0d1a 0%, #0f1629 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#f1f5f9',
        }}>
          <div>Loading...</div>
        </div>
      );
    }
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #0a0d1a 0%, #0f1629 40%, #120e24 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#f1f5f9', overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowInstructions(true)}
          style={{
            position: 'absolute', top: 20, right: 20,
            padding: '10px 20px', borderRadius: 12, border: '2px solid rgba(168,85,247,0.6)',
            background: 'rgba(168,85,247,0.15)', color: '#c084fc', cursor: 'pointer',
            fontSize: 14, fontWeight: 700,
          }}
        >
          📖 How to Play
        </button>

        {showInstructions && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowInstructions(false)}
          >
            <div
              style={{ background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)', border: '2px solid rgba(168,85,247,0.5)', borderRadius: 20, padding: 28, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', color: '#f1f5f9' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowInstructions(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#f1f5f9' }}>×</button>
              <h2 style={{ marginTop: 0, color: '#a855f7' }}>🎯 Arrow Escape – How to Play</h2>
              <h3 style={{ fontSize: 16, color: '#94a3b8', marginTop: 16 }}>Objective</h3>
              <p>Clear all arrows from the grid by launching them off the board in their facing direction.</p>
              <h3 style={{ fontSize: 16, color: '#94a3b8', marginTop: 16 }}>How to Play</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>Tap an arrow to launch it off the board in its direction (up, down, left, right).</li>
                <li>You can only launch an arrow if nothing blocks its path to the edge.</li>
                <li>Plan the order: clear blocking arrows first.</li>
                <li>Complete in fewer moves than par for a higher score.</li>
              </ul>
              <h3 style={{ fontSize: 16, color: '#94a3b8', marginTop: 16 }}>Scoring</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>Score up to 200 points. Better score when your moves are at or below par.</li>
                <li>You have 5 minutes. If time runs out, the game ends with your current score.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Animated BG */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        {['↑', '↓', '←', '→'].map((sym, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 40}%`,
            fontSize: 60, opacity: 0.04, color: Object.values(DIR_CONFIG)[i].color,
            animation: `float${i} ${4 + i}s ease-in-out infinite`,
            pointerEvents: 'none',
          }}>{sym}</div>
        ))}

        <div style={{ fontSize: 56, marginBottom: 4, filter: 'drop-shadow(0 4px 16px rgba(168,85,247,0.4))' }}>🎯</div>
        <h1 style={{
          fontSize: 48, fontWeight: 900, margin: 0, letterSpacing: -2,
          background: 'linear-gradient(135deg, #3b82f6, #a855f7, #ec4899)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Arrow Escape
        </h1>
        <p style={{ fontSize: 13, opacity: 0.4, marginTop: 6, marginBottom: 8, letterSpacing: 3, textTransform: 'uppercase' }}>
          Tap • Clear • Escape
        </p>
        {isDailyGame && (
          <div style={{ marginBottom: 24, padding: '6px 16px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: 20, fontSize: 13, color: '#c084fc', fontWeight: 600 }}>
            🎯 Daily Challenge
          </div>
        )}

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {availableDifficulties.map((key) => {
            const cfg = DIFFICULTY_CONFIG[key];
            const levels = PUZZLES[key].length;
            const completed = completedLevels[key];
            return (
              <button
                key={key}
                onClick={() => !isDailyGame && startGame(key, Math.min(completed, levels - 1))}
                style={{
                  padding: '20px 36px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
                  cursor: isDailyGame ? 'default' : 'pointer', minWidth: 160, textAlign: 'center',
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                  color: '#fff', fontSize: 18, fontWeight: 700,
                  boxShadow: `0 0 30px ${cfg.color}15, inset 0 1px 0 rgba(255,255,255,0.06)`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  if (!isDailyGame) {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                    e.currentTarget.style.boxShadow = `0 8px 40px ${cfg.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 0 30px ${cfg.color}15, inset 0 1px 0 rgba(255,255,255,0.06)`;
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{cfg.emoji}</div>
                <div>{cfg.label}</div>
                <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{cfg.desc}</div>
                <div style={{ fontSize: 11, opacity: 0.4, marginTop: 8, display: 'flex', gap: 4, justifyContent: 'center' }}>
                  {Array.from({ length: levels }).map((_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: i < completed ? cfg.color : 'rgba(255,255,255,0.15)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {isDailyGame && (
          <button
            onClick={() => startGame(dailyGameDifficulty, 0)}
            style={{
              marginTop: 24, padding: '14px 48px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: '#fff', boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
            }}
          >
            🚀 Start Game
          </button>
        )}

        <div style={{ marginTop: 32, fontSize: 12, opacity: 0.25, textAlign: 'center', lineHeight: 2 }}>
          Tap an arrow to launch it off the board<br />
          Only works if nothing blocks its path to the edge
        </div>

        <style>{`
          @keyframes float0 { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
          @keyframes float1 { 0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(15px) rotate(-3deg)} }
          @keyframes float2 { 0%,100%{transform:translateY(0) rotate(3deg)} 50%{transform:translateY(-15px) rotate(-5deg)} }
          @keyframes float3 { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(20px) rotate(3deg)} }
        `}</style>
      </div>
    );
  }

  // ═══ GAME SCREEN (and finished: game visible behind modal) ═══
  const cfg = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;
  const timeElapsedForModal = completionData?.timeElapsed ?? (screen === 'finished' ? GAME_TIME : GAME_TIME - timeLeft);

  return (
    <>
      {(screen === 'game' || screen === 'finished') && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'linear-gradient(135deg, #0a0d1a 0%, #0f1629 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#f1f5f9', userSelect: 'none',
          zIndex: 1,
        }}>
          {showConfetti && screen === 'finished' && Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${10 + Math.random() * 80}%`,
                top: '-5%',
                width: 8 + Math.random() * 8,
                height: 8 + Math.random() * 8,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                background: ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#f87171'][i % 6],
                animation: `confettiFall ${2 + Math.random() * 3}s ease-in ${Math.random() * 0.8}s forwards`,
                opacity: 0.9,
                pointerEvents: 'none',
              }}
            />
          ))}
          {/* HUD */}
          <div style={{
            display: 'flex', gap: 20, alignItems: 'center', marginBottom: 14,
            background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '10px 24px',
            border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
          }}>
            <HudItem label="Level" value={`${cfg?.emoji ?? ''} ${cfg?.label ?? ''} ${levelIndex + 1}`} color={cfg?.color} />
            <HudSep />
            <HudItem label="Remaining" value={arrows.length} />
            <HudSep />
            <HudItem label="Moves" value={moves} subValue={`par ${par}`} />
            <HudSep />
            <HudItem label="Time" value={formatTime(timeLeft)} color={timeLeft < 60 ? '#f87171' : undefined} />
            <HudSep />
            <HudItem label="Score" value={currentScore} color="#fbbf24" />
          </div>

          {/* Board */}
          <div style={{
            width: boardPixels, height: boardPixels, position: 'relative', borderRadius: 14,
            background: 'linear-gradient(135deg, #151d2d, #111827)',
            border: '2px solid rgba(255,255,255,0.06)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            {/* Grid lines */}
            {Array.from({ length: gridSize - 1 }).map((_, i) => (
              <React.Fragment key={i}>
                <div style={{ position: 'absolute', left: (i + 1) * cellPx, top: 0, width: 1, height: '100%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ position: 'absolute', top: (i + 1) * cellPx, left: 0, height: 1, width: '100%', background: 'rgba(255,255,255,0.04)' }} />
              </React.Fragment>
            ))}

            {/* Particles */}
            {particles.map((p) => (
              <div key={p.id} style={{
                position: 'absolute', left: p.x, top: p.y,
                width: p.size, height: p.size, borderRadius: '50%',
                background: p.color, opacity: 0.8,
                animation: 'particleFade 0.7s ease-out forwards',
                pointerEvents: 'none',
              }} />
            ))}

            {/* Arrow tiles */}
            {arrows.map((arrow) => {
          const dir = DIR_CONFIG[arrow.direction];
          const isFlying = flyingIds.has(arrow.id);
          const isShaking = shakeIds.has(arrow.id);
          const fly = getFlyTarget(arrow.direction);
          const pad = 3;

              return (
                <div
                  key={arrow.id}
                  onClick={() => !isFlying && handleTap(arrow)}
                  style={{
                    position: 'absolute',
                    left: arrow.col * cellPx + pad,
                    top: arrow.row * cellPx + pad,
                    width: cellPx - pad * 2,
                    height: cellPx - pad * 2,
                    borderRadius: 10,
                    background: `linear-gradient(${135 + DIR_CONFIG[arrow.direction].angle * 0.3}deg, ${dir.color}dd, ${dir.color}88)`,
                    border: '2px solid rgba(255,255,255,0.12)',
                    boxShadow: `0 2px 12px ${dir.color}44, inset 0 1px 0 rgba(255,255,255,0.15)`,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                    transition: isFlying
                      ? 'transform 0.4s cubic-bezier(0.4, 0, 1, 1), opacity 0.4s ease-out'
                      : 'transform 0.15s ease-out',
                    transform: isFlying
                      ? `translate(${fly.x}px, ${fly.y}px) scale(0.5) rotate(${DIR_CONFIG[arrow.direction].angle + 180}deg)`
                      : isShaking
                        ? 'translateX(0)'
                        : 'scale(1)',
                    opacity: isFlying ? 0 : 1,
                    animation: isShaking ? 'tileShake 0.35s ease-out' : 'none',
                    zIndex: isFlying ? 50 : 10,
                    overflow: 'hidden',
                  }}
                >
                  {/* Glossy top highlight */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)',
                    borderRadius: '10px 10px 0 0', pointerEvents: 'none',
                  }} />
                  {/* Arrow symbol */}
                  <span style={{
                    fontSize: cellPx * 0.45,
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.95)',
                    textShadow: `0 2px 8px ${dir.color}88`,
                    zIndex: 1,
                    lineHeight: 1,
                    transform: `rotate(${dir.angle}deg)`,
                  }}>
                    ▲
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom controls */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Btn onClick={() => startGame(difficulty, levelIndex)} small>🔄 Reset</Btn>
            <Btn onClick={handleReset} small>📋 Menu</Btn>
          </div>

          <style>{`
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes tileShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px) rotate(-2deg); }
          30% { transform: translateX(5px) rotate(2deg); }
          45% { transform: translateX(-4px) rotate(-1deg); }
          60% { transform: translateX(3px) rotate(1deg); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(1px); }
        }
        @keyframes particleFade {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(0.2) translateY(-20px); opacity: 0; }
        }
      `}</style>
        </div>
      )}

      <GameCompletionModal
        isVisible={screen === 'finished' && completionData != null}
        onClose={handleReset}
        gameTitle="Arrow Escape"
        score={completionData?.score ?? score}
        moves={completionData?.moves ?? moves}
        timeElapsed={timeElapsedForModal}
        gameTimeLimit={GAME_TIME}
        isVictory={completionData?.isVictory ?? false}
        difficulty={completionData?.difficulty ?? difficulty}
        customMessages={{
          maxScore: 200,
          stats: `📊 Moves: ${completionData?.moves ?? moves} / par ${completionData?.par ?? par} • ⏱ ${Math.floor(timeElapsedForModal / 60)}:${(timeElapsedForModal % 60).toString().padStart(2, '0')}`,
        }}
      />
    </>
  );
}

// ═══ SMALL UI HELPERS ═══
function HudItem({ label, value, subValue, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, opacity: 0.4, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: color || '#f1f5f9' }}>{value}</div>
      {subValue && <div style={{ fontSize: 10, opacity: 0.35, marginTop: 1 }}>{subValue}</div>}
    </div>
  );
}

function HudSep() {
  return <div style={{ width: 1, height: 34, background: 'rgba(255,255,255,0.08)' }} />;
}

function Btn({ children, onClick, primary, disabled, small }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? '8px 16px' : '12px 28px',
        borderRadius: 12,
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: primary
          ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
          : 'rgba(255,255,255,0.04)',
        color: disabled ? 'rgba(255,255,255,0.3)' : '#f1f5f9',
        fontSize: small ? 13 : 15, fontWeight: 700,
        boxShadow: primary ? '0 6px 20px rgba(168,85,247,0.3)' : 'none',
        transition: 'transform 0.15s, opacity 0.15s',
        opacity: disabled ? 0.5 : 1,
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </button>
  );
}
