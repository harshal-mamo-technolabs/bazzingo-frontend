import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

/* ───────────────────── PUZZLE DATA ───────────────────── */
const PUZZLES = {
  Easy: [
    { grid: [[1,1,1,1],[1,1,1,1],[1,1,1,1]], start: [0,0] },
    { grid: [[1,1,1],[1,1,1],[1,1,1]], start: [0,0] },
    { grid: [[1,1,1],[1,1,1],[1,1,1],[0,0,1]], start: [0,0] },
    { grid: [[1,1,1,1],[1,1,1,1],[1,1,0,0]], start: [0,0] },
    { grid: [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,0,0]], start: [0,0] },
  ],
  Moderate: [
    { grid: [[1,1,1,1,1,1],[1,0,1,1,0,1],[1,1,1,1,1,1],[1,1,0,0,1,1],[1,1,1,1,1,1]], start: [0,0] },
    { grid: [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]], start: [0,0] },
    { grid: [[1,1,1,1,0,0],[1,1,1,1,0,0],[1,1,1,1,1,1],[0,0,1,1,1,1],[0,0,1,1,1,1]], start: [0,0] },
    { grid: [[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]], start: [0,0] },
    { grid: [[1,1,1,1,1,1],[1,1,1,1,1,1],[0,0,1,1,0,0],[1,1,1,1,1,1],[1,1,1,1,1,1]], start: [0,0] },
  ],
  Hard: [
    { grid: [[1,1,1,1,1,1,1,1],[1,0,1,1,1,1,0,1],[1,1,1,0,0,1,1,1],[1,1,1,1,1,1,1,1],[1,0,1,1,1,1,0,1],[1,1,1,1,1,1,1,1],[1,1,0,1,1,0,1,1]], start: [0,0] },
    { grid: [[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]], start: [0,0] },
    { grid: [[1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1]], start: [0,0] },
    { grid: [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]], start: [0,0] },
    { grid: [[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]], start: [0,0] },
  ],
};

const DIRS = { up: [-1,0], down: [1,0], left: [0,-1], right: [0,1] };
const TIME_LIMIT = 180;
const PTS_PER_PUZZLE = 40;

/* ───────────────────── AUDIO ───────────────────── */
let audioCtx = null;
let bgMusicAudio = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

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

function sfx(freq, dur, type='sine', vol=0.15) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + dur);
}

function playMove() { sfx(600, 0.08); }
function playUndo() { sfx(300, 0.1, 'triangle'); }
function playComplete() { sfx(523, 0.15); setTimeout(()=>sfx(659,0.15),100); setTimeout(()=>sfx(784,0.2),200); }

/* ───────────────────── STYLES ───────────────────── */
const STYLE_ID = 'fill-tracks-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes ft-pulse { 0%{transform:scale(1)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
  `;
  document.head.appendChild(style);
}

/* ───────────────────── COMPONENT ───────────────────── */
export default function FillTracks() {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [path, setPath] = useState([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [complete, setComplete] = useState(false);
  const touchRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (gameState === 'finished') {
      stopBackgroundMusic();
    }
  }, [gameState]);

  const puzzles = PUZZLES[difficulty] || PUZZLES.Easy;
  const puzzle = puzzles[puzzleIdx] || puzzles[0];
  const grid = puzzle.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  const openCount = useMemo(() => {
    let c = 0;
    for (let r = 0; r < rows; r++) for (let co = 0; co < cols; co++) if (grid[r][co]) c++;
    return c;
  }, [grid, rows, cols]);

  const tileSize = useMemo(() => {
    const maxW = Math.min(window.innerWidth * 0.85, 600);
    const maxH = Math.min(window.innerHeight * 0.45, 400);
    return Math.floor(Math.min(maxW / cols, maxH / rows));
  }, [rows, cols]);

  const initGame = useCallback(() => {
    setPuzzleIdx(0);
    setScore(0);
    setPath([puzzle.start]);
    setComplete(false);
  }, [puzzle]);

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

  // Init path for current puzzle
  useEffect(() => {
    if (gameState === 'playing') {
      setPath([puzzle.start]);
      setComplete(false);
    }
  }, [gameState, puzzleIdx, puzzle]);

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

  // Check win
  useEffect(() => {
    if (gameState === 'playing' && path.length === openCount && !complete) {
      setComplete(true);
      const newScore = score + PTS_PER_PUZZLE;
      setScore(newScore);
      playComplete();
      setTimeout(() => {
        if (puzzleIdx < puzzles.length - 1) {
          setPuzzleIdx(i => i + 1);
          setComplete(false);
        } else {
          setGameState('finished');
        }
      }, 800);
    }
  }, [path, openCount, complete, gameState, score, puzzleIdx, puzzles.length]);

  // Movement
  const move = useCallback((dir) => {
    if (complete) return;
    setPath(prev => {
      const [cr, cc] = prev[prev.length - 1];
      const [dr, dc] = DIRS[dir];
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return prev;
      if (!grid[nr][nc]) return prev;
      if (prev.some(([r,c]) => r === nr && c === nc)) return prev;
      playMove();
      return [...prev, [nr, nc]];
    });
  }, [complete, rows, cols, grid]);

  const undo = useCallback(() => {
    if (complete) return;
    setPath(prev => {
      if (prev.length <= 1) return prev;
      playUndo();
      return prev.slice(0, -1);
    });
  }, [complete]);

  const restart = useCallback(() => {
    setPath([puzzle.start]);
    setComplete(false);
  }, [puzzle]);

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp') { e.preventDefault(); move('up'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move('down'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); move('left'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move('right'); }
      else if (e.key === 'Backspace') { e.preventDefault(); undo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, move, undo]);

  // Touch swipe
  const onTouchStart = (e) => { const t = e.touches[0]; touchRef.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    const minDist = 20;
    if (Math.abs(dx) < minDist && Math.abs(dy) < minDist) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
    touchRef.current = null;
  };

  const pathSet = useMemo(() => new Set(path.map(([r,c]) => `${r},${c}`)), [path]);
  const current = path[path.length - 1];

  // Instructions section
  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Fill all open cells with one continuous track from start to finish
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use arrow keys or swipe to move</li>
          <li>• Fill every open cell exactly once</li>
          <li>• Can't revisit cells or cross obstacles</li>
          <li>• Complete all 5 puzzles to win!</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Each puzzle: 40 points</li>
          <li>• Complete all 5: 200 points</li>
          <li>• Use Undo if stuck</li>
          <li>• Time limit: 3 minutes</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Difficulty
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Easy: Small grids, simple paths</li>
          <li>• Moderate: Medium grids with obstacles</li>
          <li>• Hard: Large grids, complex patterns</li>
        </ul>
      </div>
    </div>
  );

  // Playing content
  const playingContent = (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      padding: '16px',
      background: 'linear-gradient(135deg, #1a1a4e 0%, #2d3561 100%)',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
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
            <span style={{ fontWeight: 600 }}>Score: {score}/200</span>
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
            <span>🧩</span>
            <span style={{ fontWeight: 600 }}>Puzzle {puzzleIdx + 1}/{puzzles.length}</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 12 }}>
          FILL ALL LEVEL SPACE
        </div>

        {/* Grid */}
        <div style={{ position: 'relative', width: cols * tileSize, height: rows * tileSize, margin: '0 auto 16px' }}>
          {/* cells */}
          {grid.map((row, ri) => row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} style={{
              position: 'absolute',
              left: ci * tileSize, top: ri * tileSize,
              width: tileSize, height: tileSize,
              background: cell ? (pathSet.has(`${ri},${ci}`) ? '#b86e3a' : '#d4834e') : 'transparent',
              border: cell ? '1px solid rgba(0,0,0,0.2)' : 'none',
              borderRadius: cell ? 3 : 0,
              boxSizing: 'border-box',
              transition: 'background 0.15s',
            }} />
          )))}

          {/* track lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {path.length > 1 && path.map((p, i) => {
              if (i === 0) return null;
              const [pr, pc] = path[i - 1];
              const [cr, cc] = p;
              return (
                <line key={i}
                  x1={pc * tileSize + tileSize / 2} y1={pr * tileSize + tileSize / 2}
                  x2={cc * tileSize + tileSize / 2} y2={cr * tileSize + tileSize / 2}
                  stroke="white" strokeWidth={4} strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* start marker */}
          <div style={{
            position: 'absolute',
            left: puzzle.start[1] * tileSize + tileSize / 2 - 5,
            top: puzzle.start[0] * tileSize + tileSize / 2 - 5,
            width: 10, height: 10, borderRadius: '50%',
            background: '#fff', boxShadow: '0 0 6px #fff',
          }} />

          {/* current position */}
          {current && (
            <div style={{
              position: 'absolute',
              left: current[1] * tileSize + tileSize / 2 - 7,
              top: current[0] * tileSize + tileSize / 2 - 7,
              width: 14, height: 14, borderRadius: '50%',
              background: '#fff', border: '2px solid #ffd700',
              boxShadow: '0 0 10px rgba(255,215,0,0.6)',
              transition: 'left 0.1s, top 0.1s',
            }} />
          )}
        </div>

        {/* Complete flash */}
        {complete && (
          <div style={{ textAlign: 'center', color: '#4eff4e', fontWeight: 'bold', fontSize: 18, marginBottom: 12, animation: 'ft-pulse 0.5s ease' }}>
            ✓ Puzzle Complete! +{PTS_PER_PUZZLE} pts
          </div>
        )}

        {/* D-pad & controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <DPadBtn dir="up" onClick={() => move('up')} />
            <div style={{ display: 'flex', gap: 4 }}>
              <DPadBtn dir="left" onClick={() => move('left')} />
              <DPadBtn dir="down" onClick={() => move('down')} />
              <DPadBtn dir="right" onClick={() => move('right')} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button style={S.ctrlBtn} onClick={undo}>↩ Undo</button>
            <button style={{...S.ctrlBtn, background: 'linear-gradient(135deg, #8b3a3a, #5a2020)'}} onClick={restart}>🔄 Restart</button>
          </div>
        </div>

        {/* Hint */}
        <div style={{
          marginTop: 16,
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          color: '#fff',
          fontSize: 14,
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          Use arrow keys or swipe to move • Backspace to undo
        </div>
      </div>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Fill Tracks"
      gameShortDescription="Fill all cells with one continuous track"
      category="Puzzle"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{ puzzle: `${puzzleIdx + 1}/${puzzles.length}` }}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
}

/* ─── D-PAD BUTTON ─── */
function DPadBtn({ dir, onClick }) {
  const arrows = { up: '▲', down: '▼', left: '◀', right: '▶' };
  return (
    <button
      style={S.dpad}
      onClick={onClick}
      onTouchEnd={(e) => { e.preventDefault(); onClick(); }}
    >
      <span style={{ color: '#ffd700', fontSize: 18 }}>{arrows[dir]}</span>
    </button>
  );
}

/* ─── STYLES ─── */
const S = {
  dpad: {
    width: 44, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #3a2a6e, #2a1a5e)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
  },
  ctrlBtn: {
    padding: '6px 16px', fontSize: 13, fontWeight: 'bold', border: 'none', borderRadius: 6,
    background: 'linear-gradient(135deg, #3a6e3a, #2a5e2a)', color: '#fff', cursor: 'pointer',
  },
};
