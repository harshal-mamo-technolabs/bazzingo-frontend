import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

/* ───────── constants ───────── */
const COLORS = [
  { name: 'red',    bg: 'linear-gradient(135deg,#ff2d55,#ff6b6b)', glow: '#ff2d55', border: '#cc0033' },
  { name: 'blue',   bg: 'linear-gradient(135deg,#00d4ff,#0099ff)', glow: '#00d4ff', border: '#006aaa' },
  { name: 'green',  bg: 'linear-gradient(135deg,#39ff14,#7fff00)', glow: '#39ff14', border: '#22aa00' },
  { name: 'yellow', bg: 'linear-gradient(135deg,#ffd700,#ffaa00)', glow: '#ffd700', border: '#cc9900' },
  { name: 'pink',   bg: 'linear-gradient(135deg,#ff69b4,#ff1493)', glow: '#ff69b4', border: '#cc1177' },
];

const DIFFICULTIES = {
  Easy:     { rows: 8,  cols: 8,  numColors: 3, maxRaw: 350,  label: 'Easy' },
  Moderate: { rows: 10, cols: 10, numColors: 4, maxRaw: 800,  label: 'Moderate' },
  Hard:     { rows: 12, cols: 12, numColors: 5, maxRaw: 1600, label: 'Hard' },
};

const TIME_LIMIT = 120;
let tileIdCounter = 0;

/* ───────── helpers ───────── */
function buildGrid(rows, cols, numColors) {
  tileIdCounter = 0;
  const g = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({ color: Math.floor(Math.random() * numColors), id: tileIdCounter++ });
    }
    g.push(row);
  }
  return g;
}

function floodFill(grid, r, c, rows, cols) {
  if (!grid[r] || !grid[r][c]) return [];
  const color = grid[r][c].color;
  if (color == null) return [];
  const visited = new Set();
  const queue = [[r, c]];
  const group = [];
  visited.add(`${r},${c}`);
  while (queue.length) {
    const [cr, cc] = queue.shift();
    group.push([cr, cc]);
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = cr + dr, nc = cc + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(key) && grid[nr] && grid[nr][nc] && grid[nr][nc].color === color) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return group;
}

function applyGravity(grid, rows, cols) {
  for (let c = 0; c < cols; c++) {
    const col = [];
    for (let r = 0; r < rows; r++) {
      if (grid[r][c]) col.push(grid[r][c]);
    }
    for (let r = 0; r < rows; r++) {
      grid[r][c] = col[r] || null;
    }
  }
}

function collapseColumns(grid, rows, cols) {
  const nonEmpty = [];
  for (let c = 0; c < cols; c++) {
    let hasAny = false;
    for (let r = 0; r < rows; r++) {
      if (grid[r][c]) { hasAny = true; break; }
    }
    if (hasAny) nonEmpty.push(c);
  }
  const newGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (let nc = 0; nc < nonEmpty.length; nc++) {
    const oc = nonEmpty[nc];
    for (let r = 0; r < rows; r++) {
      newGrid[r][nc] = grid[r][oc];
    }
  }
  return newGrid;
}

function hasValidMoves(grid, rows, cols) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] && floodFill(grid, r, c, rows, cols).length >= 2) return true;
    }
  }
  return false;
}

/* ───────── audio ───────── */
let audioCtx = null;
let masterGain = null;
let bgMusicAudio = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.value = 0.3;
}

function playTone(freq, duration, type = 'sine', vol = 0.2) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(g);
  g.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playPop(count) {
  const base = 400 + count * 20;
  playTone(base, 0.08, 'sine', 0.25);
  setTimeout(() => playTone(base + 200, 0.06, 'sine', 0.15), 40);
}

function playBuzz() { playTone(100, 0.2, 'sawtooth', 0.1); }

function startBackgroundMusic() {
  if (bgMusicAudio) return;
  
  bgMusicAudio = new Audio('/music/lofi.mp3');
  bgMusicAudio.volume = 0.3;
  bgMusicAudio.loop = true;
  bgMusicAudio.play().catch(err => console.log('Audio play failed:', err));
}

function stopBackgroundMusic() {
  if (bgMusicAudio) {
    bgMusicAudio.pause();
    bgMusicAudio.currentTime = 0;
    bgMusicAudio = null;
  }
}

/* ───────── styles ───────── */
const STYLE_ID = 'tile-adjust-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes ta-pop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(0); opacity: 0; } }
    @keyframes ta-fall { 0% { transform: translateY(-100px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
    @keyframes ta-particle { 0% { opacity: 0.8; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); } }
    @keyframes ta-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); } 50% { box-shadow: 0 0 15px 5px rgba(255,255,255,0.2); } }
  `;
  document.head.appendChild(style);
}

const MAX_SCORE = 200;

/* ───────── main component ───────── */
const TileAdjustGame = () => {
  const location = useLocation();
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [particles, setParticles] = useState([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const particleId = useRef(0);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  useEffect(() => { injectStyles(); }, []);

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
          const map = { easy: 'Easy', moderate: 'Moderate', medium: 'Moderate', hard: 'Hard' };
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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (gameState === 'finished') {
      stopBackgroundMusic();
    }
  }, [gameState]);

  const settings = DIFFICULTIES[difficulty];

  const initGame = useCallback(() => {
    setGrid(buildGrid(settings.rows, settings.cols, settings.numColors));
    setScore(0);
    setParticles([]);
  }, [settings]);

  const handleStart = useCallback(() => {
    initAudio();
    startBackgroundMusic();
    initGame();
    setTimeRemaining(TIME_LIMIT);
    setGameState('playing');
  }, [initGame]);

  const handleReset = useCallback(() => {
    stopBackgroundMusic();
    setGameState('ready');
    initGame();
    setTimeRemaining(TIME_LIMIT);
    setCompletionData(null);
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty,
            timeElapsed: TIME_LIMIT,
          });
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeRemaining, difficulty]);

  // Check for game over (no moves or max score)
  useEffect(() => {
    if (gameState !== 'playing' || grid.length === 0) return;
    if (!hasValidMoves(grid, settings.rows, settings.cols) || score >= MAX_SCORE) {
      setCompletionData({
        score: Math.min(MAX_SCORE, score),
        isVictory: score >= MAX_SCORE,
        difficulty,
        timeElapsed: TIME_LIMIT - timeRemaining,
      });
      setGameState('finished');
    }
  }, [grid, gameState, settings, score, timeRemaining, difficulty]);

  const spawnParticles = useCallback((x, y, color) => {
    const newP = Array.from({ length: 8 }, () => ({
      id: particleId.current++,
      x, y, color,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.5) * 80
    }));
    setParticles(prev => [...prev, ...newP]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newP.includes(p))), 600);
  }, []);

  const handleTileClick = useCallback((r, c, e) => {
    if (gameState !== 'playing' || !grid[r] || !grid[r][c]) return;
    
    const group = floodFill(grid, r, c, settings.rows, settings.cols);
    if (group.length < 2) {
      playBuzz();
      return;
    }

    initAudio();
    playPop(group.length);

    const newGrid = grid.map(row => [...row]);
    group.forEach(([gr, gc]) => { newGrid[gr][gc] = null; });
    applyGravity(newGrid, settings.rows, settings.cols);
    const collapsed = collapseColumns(newGrid, settings.rows, settings.cols);
    
    const pts = Math.round(group.length * group.length * 0.5);
    setScore(s => Math.min(200, s + pts));
    setGrid(collapsed);

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, grid[r][c].color);
    }
  }, [gameState, grid, settings, spawnParticles]);

  const closeInstructions = useCallback(() => setShowInstructions(false), []);

  useEffect(() => {
    if (!showInstructions) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') closeInstructions(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInstructions, closeInstructions]);

  // How to Play modal content – dark theme, readable
  const instructionsModalContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#00d4ff' }}>🎯 Objective</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#cbd5e1' }}>
          Clear groups of 2 or more matching tiles to score points before time runs out. Reach 200 points to win!
        </p>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>🎮 How to Play</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li>Tap any tile that is part of a group of 2+ same-color tiles to clear the whole group.</li>
          <li>Tiles above fall down to fill gaps; empty columns collapse to the left.</li>
          <li>Larger groups give more points — aim for big clusters!</li>
          <li>You have 3 minutes. No valid moves or max score ends the game.</li>
        </ul>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>📊 Scoring</h3>
        <p style={{ margin: '0 0 8px', fontSize: 14, color: '#cbd5e1' }}>Points = tiles × tiles × 0.5 (rounded).</p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li>2 tiles → 2 pts · 5 tiles → 12 pts · Max score: 200</li>
        </ul>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>💡 Difficulty</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li><strong>Easy:</strong> 8×8 grid, 3 colors</li>
          <li><strong>Moderate:</strong> 10×10 grid, 4 colors</li>
          <li><strong>Hard:</strong> 12×12 grid, 5 colors</li>
          <li>Time limit: 3 minutes for all</li>
        </ul>
      </section>
    </div>
  );

  // Playing content - responsive sizing based on difficulty and screen size
  const getTileSize = () => {
    if (isLargeScreen) return 48;
    // For small screens, adjust based on difficulty
    if (difficulty === 'Hard') return 24; // 12×12 grid
    if (difficulty === 'Moderate') return 28; // 10×10 grid
    return 32; // 8×8 grid (Easy)
  };
  
  const getGap = () => {
    if (isLargeScreen) return 6;
    // Smaller gaps for harder difficulties on small screens
    if (difficulty === 'Hard') return 2;
    if (difficulty === 'Moderate') return 3;
    return 4;
  };
  
  const tileSize = getTileSize();
  const gap = getGap();

  const playingContent = (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      padding: '16px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed',
          left: p.x,
          top: p.y,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: COLORS[p.color]?.bg || '#fff',
          '--dx': `${p.dx}px`,
          '--dy': `${p.dy}px`,
          animation: 'ta-particle 0.6s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 100
        }} />
      ))}

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 20,
          color: '#fff',
          fontSize: 14,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: timeRemaining <= 30 ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            border: timeRemaining <= 30 ? '2px solid rgba(255,59,48,0.5)' : 'none',
          }}>
            <span>⏱️</span>
            <span style={{ fontWeight: 600, color: timeRemaining <= 30 ? '#ff3b30' : '#fff' }}>
              Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
          }}>
            <span>🎯</span>
            <span style={{ fontWeight: 600 }}>Score: {Math.round(score)}/200</span>
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${settings.cols}, ${tileSize}px)`,
          gap: gap,
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {grid.map((row, r) => row.map((tile, c) => {
            if (!tile) return <div key={`${r}-${c}`} style={{ width: tileSize, height: tileSize }} />;
            const color = COLORS[tile.color];
            return (
              <div
                key={tile.id}
                onClick={(e) => handleTileClick(r, c, e)}
                style={{
                  width: tileSize,
                  height: tileSize,
                  background: color.bg,
                  border: `2px solid ${color.border}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: `0 0 10px ${color.glow}44, inset 0 2px 4px rgba(255,255,255,0.3)`,
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  animation: 'ta-fall 0.3s ease-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            );
          }))}
        </div>

        {/* Hint */}
        <div style={{
          marginTop: 20,
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          color: '#fff',
          fontSize: 14,
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          👆 Tap groups of 2+ matching tiles to clear them
        </div>
      </div>
    </div>
  );

  // Menu when ready
  if (gameState === 'ready') {
    if (checkingDailyGame) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div>Loading...</div>
        </div>
      );
    }
    const difficulties = [
      { key: 'Easy', label: 'Easy', desc: '8×8 · 3 colors', emoji: '🟢', color: '#22c55e' },
      { key: 'Moderate', label: 'Moderate', desc: '10×10 · 4 colors', emoji: '🟡', color: '#eab308' },
      { key: 'Hard', label: 'Hard', desc: '12×12 · 5 colors', emoji: '🔴', color: '#ef4444' },
    ];
    const availableDifficulties = isDailyGame && dailyGameDifficulty ? difficulties.filter(d => d.key === dailyGameDifficulty) : difficulties;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          aria-label="How to Play"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            borderRadius: 12,
            border: '2px solid rgba(0,212,255,0.6)',
            background: 'rgba(0,212,255,0.12)',
            color: '#00d4ff',
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 700,
            transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.25)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,212,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.12)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1)'; }}
        >
          <span style={{ fontSize: 18 }} aria-hidden>📖</span>
          How to Play
        </button>
        {showInstructions && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tile-adjust-instructions-title"
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
            onClick={closeInstructions}
          >
            <div
              style={{
                background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                border: '2px solid rgba(0,212,255,0.45)',
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
                <h2 id="tile-adjust-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#00d4ff' }}>
                  🧩 Tile Adjust – How to Play
                </h2>
                <button
                  type="button"
                  onClick={closeInstructions}
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
                  onClick={closeInstructions}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #00d4ff, #0099ff)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,212,255,0.35)',
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧩</div>
        <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 800, margin: '0 0 6px', letterSpacing: -1, textShadow: '0 0 40px rgba(0,212,255,0.4)' }}>Tile Adjust</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 8px' }}>Clear matching tile groups to score points!</p>
        {isDailyGame && (
          <div style={{ marginBottom: 20, padding: '6px 16px', background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.5)', borderRadius: 20, fontSize: 13, color: '#00d4ff', fontWeight: 600 }}>
            Daily Challenge
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {availableDifficulties.map(d => (
            <button
              key={d.key}
              onClick={() => !isDailyGame && setDifficulty(d.key)}
              style={{
                background: (isDailyGame ? d.key === dailyGameDifficulty : difficulty === d.key) ? `${d.color}22` : 'rgba(255,255,255,0.06)',
                border: `2px solid ${d.color}44`,
                borderRadius: 16,
                padding: '24px 32px',
                cursor: isDailyGame ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                minWidth: 160,
                transition: 'all 0.2s',
                color: '#fff'
              }}
              onMouseEnter={e => { if (!isDailyGame) { e.currentTarget.style.background = `${d.color}22`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${d.color}88`; } }}
              onMouseLeave={e => { e.currentTarget.style.background = (isDailyGame ? d.key === dailyGameDifficulty : difficulty === d.key) ? `${d.color}22` : 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${d.color}44`; }}
            >
              <span style={{ fontSize: 32 }}>{d.emoji}</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{d.label}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>{d.desc}</span>
            </button>
          ))}
        </div>
        <button onClick={() => handleStart()} style={{ marginTop: 20, padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #00d4ff, #0099ff)', color: '#fff', boxShadow: '0 4px 20px rgba(0,212,255,0.4)' }}>
          Start Game
        </button>
      </div>
    );
  }

  // Playing or finished: game layer with zIndex 1
  const timeElapsedForModal = completionData?.timeElapsed ?? (gameState === 'finished' ? TIME_LIMIT : TIME_LIMIT - timeRemaining);
  const c = completionData || {};

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        {playingContent}
        {gameState === 'playing' && (
          <button onClick={handleReset} style={{ position: 'absolute', top: 12, left: 12, padding: '8px 16px', borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, zIndex: 20 }}>
            Menu
          </button>
        )}
      </div>
      {gameState === 'finished' && completionData != null && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Tile Adjust"
          score={c.score}
          timeElapsed={timeElapsedForModal}
          gameTimeLimit={TIME_LIMIT}
          isVictory={c.isVictory}
          difficulty={c.difficulty}
          customMessages={{ maxScore: MAX_SCORE }}
        />
      )}
    </>
  );
};

export default TileAdjustGame;
