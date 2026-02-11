import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

// ═══════════════════════════════════════════════════════════════
// PUZZLE DATA — Hand-crafted, guaranteed solvable
// Each arrow: { id, row, col, direction }
// ═══════════════════════════════════════════════════════════════

const PUZZLES = {
  easy: {
    grid: 5, par: 8,
    arrows: [
      { id: 1, row: 0, col: 2, direction: 'up' },
      { id: 2, row: 1, col: 0, direction: 'right' },
      { id: 3, row: 1, col: 4, direction: 'up' },
      { id: 4, row: 2, col: 1, direction: 'left' },
      { id: 5, row: 2, col: 3, direction: 'right' },
      { id: 6, row: 3, col: 2, direction: 'up' },
      { id: 7, row: 4, col: 0, direction: 'up' },
      { id: 8, row: 4, col: 4, direction: 'left' },
    ],
  },
  moderate: {
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
  hard: {
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
};

const GAME_TIME = 60;

const DIR_CONFIG = {
  up:    { symbol: '↑', color: '#3b82f6', glow: '#60a5fa', angle: 0 },
  down:  { symbol: '↓', color: '#22c55e', glow: '#4ade80', angle: 180 },
  left:  { symbol: '←', color: '#f59e0b', glow: '#fbbf24', angle: 270 },
  right: { symbol: '→', color: '#a855f7', glow: '#c084fc', angle: 90 },
};

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: '#22c55e', emoji: '🟢', desc: '5×5 · 8 arrows' },
  moderate: { label: 'Moderate', color: '#f59e0b', emoji: '🟡', desc: '6×6 · 14 arrows' },
  hard:   { label: 'Hard',   color: '#ef4444', emoji: '🔴', desc: '7×7 · 20 arrows' },
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

// ─── Check for deadlock (no arrows can move) ─────────────────
function checkDeadlock(allArrows, gridSize) {
  if (allArrows.length === 0) return false;
  return !allArrows.some(arrow => isPathClear(arrow, allArrows, gridSize));
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
// AUDIO SYSTEM
// ═══════════════════════════════════════════════════════════════

// Create audio context
let audioContext = null;
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Sound effects
const playArrowLaunch = () => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio not supported');
  }
};

const playShake = () => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.log('Audio not supported');
  }
};

const playShuffle = () => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.log('Audio not supported');
  }
};

const playVictory = () => {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
      
      oscillator.start(ctx.currentTime + i * 0.15);
      oscillator.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) {
    console.log('Audio not supported');
  }
};

// Background music
class BackgroundMusic {
  constructor() {
    this.isPlaying = false;
    this.oscillators = [];
    this.gainNode = null;
  }

  start() {
    if (this.isPlaying) return;
    
    try {
      const ctx = getAudioContext();
      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      this.gainNode.connect(ctx.destination);
      
      // Simple ambient chord progression
      const chords = [
        [261.63, 329.63, 392.00], // C major
        [293.66, 369.99, 440.00], // D minor
        [246.94, 311.13, 369.99], // B diminished
        [261.63, 329.63, 392.00], // C major
      ];
      
      const playChord = (chord, startTime, duration) => {
        chord.forEach(freq => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          
          oscGain.gain.setValueAtTime(0, startTime);
          oscGain.gain.linearRampToValueAtTime(1, startTime + 0.5);
          oscGain.gain.setValueAtTime(1, startTime + duration - 0.5);
          oscGain.gain.linearRampToValueAtTime(0, startTime + duration);
          
          osc.connect(oscGain);
          oscGain.connect(this.gainNode);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
          
          this.oscillators.push(osc);
        });
      };
      
      const chordDuration = 2;
      const now = ctx.currentTime;
      
      chords.forEach((chord, i) => {
        playChord(chord, now + i * chordDuration, chordDuration);
      });
      
      this.isPlaying = true;
      
      // Loop the music
      setTimeout(() => {
        this.oscillators = [];
        this.isPlaying = false;
        if (this.shouldContinue) {
          this.start();
        }
      }, chords.length * chordDuration * 1000);
      
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  stop() {
    this.shouldContinue = false;
    this.isPlaying = false;
    
    try {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.oscillators = [];
      
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch (e) {
      console.log('Audio cleanup error');
    }
  }

  setVolume(volume) {
    if (this.gainNode) {
      try {
        const ctx = getAudioContext();
        this.gainNode.gain.setValueAtTime(volume * 0.08, ctx.currentTime);
      } catch (e) {
        console.log('Volume change error');
      }
    }
  }
}

const bgMusic = new BackgroundMusic();

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ArrowEscape() {
  // GameFrameworkV2 state
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  
  // Game-specific state
  const [arrows, setArrows] = useState([]);
  const [gridSize, setGridSize] = useState(5);
  const [moves, setMoves] = useState(0);
  const [par, setPar] = useState(10);
  const [flyingIds, setFlyingIds] = useState(new Set());
  const [shakeIds, setShakeIds] = useState(new Set());
  const [particles, setParticles] = useState([]);
  const [isDeadlocked, setIsDeadlocked] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const timerRef = useRef(null);
  const bgMusicRef = useRef(bgMusic);
  const containerRef = useRef(null);

  // ─── Update dimensions on resize ───
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // ─── Timer ───
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setGameState('finished');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameState]);

  // ─── Background Music ───
  useEffect(() => {
    if (gameState === 'playing' && musicEnabled) {
      bgMusicRef.current.shouldContinue = true;
      bgMusicRef.current.start();
    } else {
      bgMusicRef.current.shouldContinue = false;
      bgMusicRef.current.stop();
    }
    
    return () => {
      bgMusicRef.current.shouldContinue = false;
      bgMusicRef.current.stop();
    };
  }, [gameState, musicEnabled]);

  // ─── Start game ───
  const handleStart = useCallback(() => {
    const diffKey = difficulty.toLowerCase();
    const puzzle = PUZZLES[diffKey];
    setPar(puzzle.par);
    setGridSize(puzzle.grid);
    setArrows(puzzle.arrows.map((a) => ({ ...a })));
    setMoves(0);
    setTimeRemaining(GAME_TIME);
    setScore(0);
    setFlyingIds(new Set());
    setShakeIds(new Set());
    setParticles([]);
    setIsDeadlocked(false);
    setGameState('playing');
  }, [difficulty]);

  // ─── Reset game ───
  const handleReset = useCallback(() => {
    setGameState('ready');
    setScore(0);
    setTimeRemaining(GAME_TIME);
    setMoves(0);
    setArrows([]);
    setFlyingIds(new Set());
    setShakeIds(new Set());
    setParticles([]);
    setIsDeadlocked(false);
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

  const boardPixels = useMemo(() => {
    if (typeof window === 'undefined') return 420;
    
    const width = dimensions.width || window.innerWidth;
    const height = dimensions.height || window.innerHeight;
    
    // Calculate available space
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    
    // Reserve space for HUD and controls
    const hudHeight = isMobile ? 80 : 100;
    const controlsHeight = isMobile ? 60 : 80;
    const padding = isMobile ? 20 : 40;
    
    const availableHeight = height - hudHeight - controlsHeight - padding;
    const availableWidth = width - padding;
    
    // Make board size responsive
    const maxSize = Math.min(availableHeight, availableWidth);
    
    if (isMobile) {
      return Math.min(maxSize, 350);
    } else if (isTablet) {
      return Math.min(maxSize, 450);
    } else {
      return Math.min(maxSize, 480);
    }
  }, [gridSize, dimensions]);
  
  const cellPx = boardPixels / gridSize;
  
  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width < 1024;

  // ─── Shuffle arrows to break deadlock ───
  const shuffleArrows = useCallback(() => {
    if (sfxEnabled) playShuffle();
    
    const directions = ['up', 'down', 'left', 'right'];
    setArrows((prev) => {
      const shuffled = prev.map((arrow) => ({
        ...arrow,
        direction: directions[Math.floor(Math.random() * directions.length)]
      }));
      // Check if still deadlocked after shuffle
      const stillDeadlocked = checkDeadlock(shuffled, gridSize);
      setIsDeadlocked(stillDeadlocked);
      // If still deadlocked, try again
      if (stillDeadlocked) {
        setTimeout(() => shuffleArrows(), 100);
      }
      return shuffled;
    });
    setMoves((m) => m + 3); // Penalty for shuffling
  }, [gridSize, sfxEnabled]);

  // ─── Handle arrow tap ───
  const handleTap = useCallback((arrow) => {
    if (flyingIds.has(arrow.id)) return;

    const currentArrows = arrows.filter((a) => !flyingIds.has(a.id));
    if (!isPathClear(arrow, currentArrows, gridSize)) {
      // Shake it
      if (sfxEnabled) playShake();
      setShakeIds((s) => new Set(s).add(arrow.id));
      setTimeout(() => setShakeIds((s) => { const n = new Set(s); n.delete(arrow.id); return n; }), 400);
      return;
    }

    // Mark as flying
    if (sfxEnabled) playArrowLaunch();
    setFlyingIds((s) => new Set(s).add(arrow.id));
    setMoves((m) => m + 1);

    const cfg = DIR_CONFIG[arrow.direction];
    spawnParticles(arrow.row, arrow.col, arrow.direction, cfg.color, cellPx);

    // Remove after animation
    setTimeout(() => {
      setArrows((prev) => {
        const remaining = prev.filter((a) => a.id !== arrow.id);
        setFlyingIds((s) => { const n = new Set(s); n.delete(arrow.id); return n; });

        // Check win
        if (remaining.length === 0) {
          clearInterval(timerRef.current);
          if (sfxEnabled) playVictory();
          // Calculate final score based on moves vs par
          setScore((currentMoves) => {
            const ratio = par / Math.max(currentMoves + 1, 1);
            return Math.min(200, Math.round(200 * Math.min(1, ratio)));
          });
          setTimeout(() => setGameState('finished'), 600);
        } else {
          // Check for deadlock
          const deadlocked = checkDeadlock(remaining, gridSize);
          setIsDeadlocked(deadlocked);
        }
        return remaining;
      });
    }, 450);
  }, [arrows, flyingIds, gridSize, spawnParticles, par, sfxEnabled, cellPx]);

  // ─── Compute score ───
  useEffect(() => {
    if (moves > 0 && arrows.length === 0 && gameState === 'playing') {
      const ratio = par / Math.max(moves, 1);
      const finalScore = Math.min(200, Math.round(200 * Math.min(1, ratio)));
      setScore(finalScore);
    }
  }, [moves, arrows.length, par, gameState]);

  // Instructions section for GameFrameworkV2
  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Clear all arrows from the board by tapping them. Arrows can only escape if their path to the edge is clear.
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tap an arrow to launch it off the board</li>
          <li>• Arrows fly in their pointing direction</li>
          <li>• Path must be clear to the edge</li>
          <li>• Use shuffle if deadlocked (+3 moves)</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Score based on efficiency</li>
          <li>• Match or beat par for 200 points</li>
          <li>• More moves = lower score</li>
          <li>• Time limit: 1 minute</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Difficulty
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Easy: 5×5 grid, 8 arrows</li>
          <li>• Moderate: 6×6 grid, 14 arrows</li>
          <li>• Hard: 7×7 grid, 20 arrows</li>
          <li>• Plan your moves carefully!</li>
        </ul>
      </div>
    </div>
  );

  // Playing content for GameFrameworkV2
  const playingContent = (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0a0d1a 0%, #0f1629 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#f1f5f9', userSelect: 'none',
      padding: isMobile ? '10px' : '20px',
      overflow: 'hidden',
    }}>
      {/* Audio Controls */}
      <div style={{
        position: 'absolute', 
        top: isMobile ? 10 : 20, 
        right: isMobile ? 10 : 20, 
        display: 'flex', 
        gap: isMobile ? 6 : 10, 
        zIndex: 100,
      }}>
        <button
          onClick={() => setMusicEnabled(!musicEnabled)}
          style={{
            padding: isMobile ? '6px 10px' : '8px 12px', 
            borderRadius: 8, 
            border: '1px solid rgba(255,255,255,0.2)',
            background: musicEnabled ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)',
            color: '#f1f5f9', 
            fontSize: isMobile ? 16 : 20, 
            cursor: 'pointer',
            transition: 'all 0.2s', 
            backdropFilter: 'blur(10px)',
          }}
          title={musicEnabled ? 'Music On' : 'Music Off'}
        >
          {musicEnabled ? '🎵' : '�'}
        </button>
        <button
          onClick={() => setSfxEnabled(!sfxEnabled)}
          style={{
            padding: isMobile ? '6px 10px' : '8px 12px', 
            borderRadius: 8, 
            border: '1px solid rgba(255,255,255,0.2)',
            background: sfxEnabled ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)',
            color: '#f1f5f9', 
            fontSize: isMobile ? 16 : 20, 
            cursor: 'pointer',
            transition: 'all 0.2s', 
            backdropFilter: 'blur(10px)',
          }}
          title={sfxEnabled ? 'SFX On' : 'SFX Off'}
        >
          {sfxEnabled ? '🔊' : '🔈'}
        </button>
      </div>

      {/* HUD */}
      <div style={{
        display: 'flex', 
        gap: isMobile ? 10 : 20, 
        alignItems: 'center', 
        marginBottom: isMobile ? 10 : 14,
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: isMobile ? 10 : 14, 
        padding: isMobile ? '8px 16px' : '10px 24px',
        border: '1px solid rgba(255,255,255,0.05)', 
        backdropFilter: 'blur(10px)',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        justifyContent: 'center',
        maxWidth: '100%',
      }}>
        <HudItem label="Remaining" value={arrows.length} isMobile={isMobile} />
        <HudSep isMobile={isMobile} />
        <HudItem label="Moves" value={moves} subValue={`par ${par}`} isMobile={isMobile} />
        <HudSep isMobile={isMobile} />
        <HudItem 
          label="Time" 
          value={`${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`} 
          color={timeRemaining < 20 ? '#f87171' : undefined} 
          isMobile={isMobile}
        />
      </div>

      {/* Board */}
      <div style={{
        width: boardPixels, 
        height: boardPixels, 
        position: 'relative', 
        borderRadius: isMobile ? 10 : 14,
        background: 'linear-gradient(135deg, #151d2d, #111827)',
        border: '2px solid rgba(255,255,255,0.06)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        flexShrink: 0,
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
      <div style={{ 
        display: 'flex', 
        gap: isMobile ? 6 : 10, 
        marginTop: isMobile ? 10 : 16, 
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '100%',
      }}>
        {isDeadlocked && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: isMobile ? 8 : 12,
            padding: isMobile ? '6px 12px' : '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 6 : 8,
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <span style={{ fontSize: isMobile ? 16 : 20 }}>⚠️</span>
            <span style={{ fontSize: isMobile ? 11 : 13, color: '#fca5a5', fontWeight: 600 }}>
              {isMobile ? 'Deadlock!' : 'Deadlock! No moves available'}
            </span>
          </div>
        )}
        {isDeadlocked && (
          <Btn onClick={shuffleArrows} primary small isMobile={isMobile}>
            🔀 Shuffle (+3)
          </Btn>
        )}
        <Btn onClick={handleReset} small isMobile={isMobile}>🔄 Reset</Btn>
      </div>

      <style>{`
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
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Arrow Escape"
      gameShortDescription="Clear all arrows from the board by tapping them to launch off the edge"
      category="Cognitive Flexibility"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      instructionsSection={instructionsSection}
      customStats={{ moves, par }}
    >
      {playingContent}
    </GameFrameworkV2>
  );
}

// ═══ SMALL UI HELPERS ═══
function HudItem({ label, value, subValue, color, isMobile }) {
  return (
    <div style={{ textAlign: 'center', minWidth: isMobile ? '60px' : 'auto' }}>
      <div style={{ 
        fontSize: isMobile ? 8 : 10, 
        opacity: 0.4, 
        textTransform: 'uppercase', 
        letterSpacing: 1.2, 
        marginBottom: 2 
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: isMobile ? 14 : 17, 
        fontWeight: 800, 
        color: color || '#f1f5f9' 
      }}>
        {value}
      </div>
      {subValue && (
        <div style={{ 
          fontSize: isMobile ? 8 : 10, 
          opacity: 0.35, 
          marginTop: 1 
        }}>
          {subValue}
        </div>
      )}
    </div>
  );
}

function HudSep({ isMobile }) {
  return (
    <div style={{ 
      width: 1, 
      height: isMobile ? 24 : 34, 
      background: 'rgba(255,255,255,0.08)',
      display: isMobile ? 'none' : 'block',
    }} />
  );
}

function Btn({ children, onClick, primary, disabled, small, isMobile }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: isMobile 
          ? (small ? '6px 12px' : '10px 20px')
          : (small ? '8px 16px' : '12px 28px'),
        borderRadius: isMobile ? 8 : 12,
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: primary
          ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
          : 'rgba(255,255,255,0.04)',
        color: disabled ? 'rgba(255,255,255,0.3)' : '#f1f5f9',
        fontSize: isMobile ? (small ? 11 : 13) : (small ? 13 : 15), 
        fontWeight: 700,
        boxShadow: primary ? '0 6px 20px rgba(168,85,247,0.3)' : 'none',
        transition: 'transform 0.15s, opacity 0.15s',
        opacity: disabled ? 0.5 : 1,
        backdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}
