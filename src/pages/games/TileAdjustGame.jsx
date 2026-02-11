import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

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

/* ───────── main component ───────── */
const TileAdjustGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [particles, setParticles] = useState([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const particleId = useRef(0);

  useEffect(() => { injectStyles(); }, []);

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
    initGame();
    setTimeRemaining(TIME_LIMIT);
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeRemaining]);

  // Check for game over
  useEffect(() => {
    if (gameState === 'playing' && grid.length > 0) {
      if (!hasValidMoves(grid, settings.rows, settings.cols) || score >= 200) {
        setGameState('finished');
      }
    }
  }, [grid, gameState, settings, score]);

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

  // Instructions section
  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Clear groups of 2+ matching tiles to score points before time runs out
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tap groups of 2+ matching tiles</li>
          <li>• Tiles fall down to fill gaps</li>
          <li>• Columns collapse when empty</li>
          <li>• Larger groups = more points!</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Points = tiles × tiles × 0.5</li>
          <li>• 2 tiles = 2 points</li>
          <li>• 5 tiles = 12 points</li>
          <li>• Maximum score: 200 points</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Difficulty
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Easy: 8×8 grid, 3 colors</li>
          <li>• Moderate: 10×10 grid, 4 colors</li>
          <li>• Hard: 12×12 grid, 5 colors</li>
          <li>• Time limit: 3 minutes</li>
        </ul>
      </div>
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

  return (
    <GameFrameworkV2
      gameTitle="Tile Adjust"
      gameShortDescription="Clear matching tile groups to score points"
      category="Puzzle"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
};

export default TileAdjustGame;
