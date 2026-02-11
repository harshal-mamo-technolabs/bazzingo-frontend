import { useState, useCallback, useEffect, useRef } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

// ─── PUZZLE DATA (hand-crafted, guaranteed solvable) ──────────────────────────
const PUZZLES = {
  Easy: {
    colors: 3, par: 12,
    tubes: [
      ['red', 'blue', 'gold', 'red'],
      ['gold', 'red', 'blue', 'gold'],
      ['blue', 'gold', 'red', 'blue'],
      [], []
    ]
  },
  Moderate: {
    colors: 5, par: 20,
    tubes: [
      ['red', 'green', 'blue', 'purple'],
      ['gold', 'red', 'green', 'blue'],
      ['purple', 'gold', 'red', 'green'],
      ['blue', 'purple', 'gold', 'red'],
      ['green', 'blue', 'purple', 'gold'],
      [], []
    ]
  },
  Hard: {
    colors: 7, par: 30,
    tubes: [
      ['red', 'orange', 'blue', 'pink'],
      ['green', 'purple', 'gold', 'red'],
      ['blue', 'pink', 'orange', 'green'],
      ['purple', 'gold', 'red', 'blue'],
      ['pink', 'orange', 'green', 'purple'],
      ['gold', 'red', 'blue', 'pink'],
      ['orange', 'green', 'purple', 'gold'],
      [], []
    ]
  }
};

const BALL_COLORS = {
  red:    { bg: 'radial-gradient(circle at 35% 35%, #ff6b6b, #c0392b)', border: '#a93226' },
  blue:   { bg: 'radial-gradient(circle at 35% 35%, #74b9ff, #2980b9)', border: '#2471a3' },
  gold:   { bg: 'radial-gradient(circle at 35% 35%, #ffeaa7, #f39c12)', border: '#d4880f' },
  green:  { bg: 'radial-gradient(circle at 35% 35%, #55efc4, #00b894)', border: '#00a381' },
  purple: { bg: 'radial-gradient(circle at 35% 35%, #a29bfe, #6c5ce7)', border: '#5b4cdb' },
  orange: { bg: 'radial-gradient(circle at 35% 35%, #fab1a0, #e17055)', border: '#cf6348' },
  pink:   { bg: 'radial-gradient(circle at 35% 35%, #fd79a8, #e84393)', border: '#d63384' }
};

const MAX_BALLS = 4;
const TIME_LIMIT = 180; // 3 minutes

// ─── AUDIO ENGINE ─────────────────────────────────────────────────────────────
let audioCtx = null;
let masterGain = null;
let bgMusicOscillators = [];

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

function playPop() { playTone(600, 0.1, 'sine', 0.3); setTimeout(() => playTone(900, 0.08, 'sine', 0.15), 50); }
function playDrop() { playTone(300, 0.15, 'triangle', 0.25); setTimeout(() => playTone(200, 0.1, 'triangle', 0.15), 80); }
function playBuzz() { playTone(100, 0.25, 'sawtooth', 0.1); }

function startBackgroundMusic() {
  if (!audioCtx || bgMusicOscillators.length > 0) return;
  
  const bgGain = audioCtx.createGain();
  bgGain.gain.value = 0.08;
  bgGain.connect(masterGain);

  // Ambient chord progression
  const melody = [
    { freq: 261.63, duration: 2 }, // C4
    { freq: 329.63, duration: 2 }, // E4
    { freq: 392.00, duration: 2 }, // G4
    { freq: 329.63, duration: 2 }, // E4
  ];

  let currentNote = 0;
  
  function playNextNote() {
    if (bgMusicOscillators.length === 0) return;
    
    const note = melody[currentNote];
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = note.freq;
    noteGain.gain.setValueAtTime(0, audioCtx.currentTime);
    noteGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1);
    noteGain.gain.setValueAtTime(1, audioCtx.currentTime + note.duration - 0.1);
    noteGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + note.duration);
    
    osc.connect(noteGain);
    noteGain.connect(bgGain);
    osc.start();
    osc.stop(audioCtx.currentTime + note.duration);
    
    currentNote = (currentNote + 1) % melody.length;
    setTimeout(playNextNote, note.duration * 1000);
  }
  
  bgMusicOscillators.push(true);
  playNextNote();
}

function stopBackgroundMusic() {
  bgMusicOscillators = [];
}

// ─── STYLES (CSS keyframes injected once) ─────────────────────────────────────
const STYLE_ID = 'ballsort-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes bs-lift { 0% { transform: translateY(0); } 100% { transform: translateY(-60px); } }
    @keyframes bs-drop { 0% { transform: translateY(-60px); } 70% { transform: translateY(4px); } 100% { transform: translateY(0); } }
    @keyframes bs-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
    @keyframes bs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes bs-particle { 0% { opacity: 0.7; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); } }
    @keyframes bs-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); } 50% { box-shadow: 0 0 20px 8px rgba(255,255,255,0.15); } }
  `;
  document.head.appendChild(style);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const BallSortGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [tubes, setTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [shakeTube, setShakeTube] = useState(null);
  const [droppingTube, setDroppingTube] = useState(null);
  const [particles, setParticles] = useState([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const particleId = useRef(0);

  useEffect(() => { injectStyles(); }, []);

  // Track screen size for responsive tube sizing
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Stop music when game finishes
  useEffect(() => {
    if (gameState === 'finished') {
      stopBackgroundMusic();
    }
  }, [gameState]);

  const settings = PUZZLES[difficulty];

  const checkWin = useCallback((t) => {
    return t.every(tube => tube.length === 0 || (tube.length === MAX_BALLS && tube.every(b => b === tube[0])));
  }, []);

  const initGame = useCallback(() => {
    setTubes(settings.tubes.map(t => [...t]));
    setSelectedTube(null);
    setMoves(0);
    setScore(0);
    setShakeTube(null);
    setDroppingTube(null);
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

  // Check for victory
  useEffect(() => {
    if (gameState === 'playing' && tubes.length > 0 && checkWin(tubes)) {
      const par = settings.par;
      const s = Math.min(200, Math.round(200 * Math.min(1, par / Math.max(1, moves + 1))));
      setScore(s);
      setGameState('finished');
    }
  }, [tubes, gameState, checkWin, settings, moves]);

  const spawnParticles = useCallback((x, y, color) => {
    const newP = Array.from({ length: 6 }, () => ({
      id: particleId.current++,
      x, y, color,
      dx: (Math.random() - 0.5) * 60,
      dy: (Math.random() - 0.5) * 60
    }));
    setParticles(prev => [...prev, ...newP]);
    setTimeout(() => setParticles(prev => prev.filter(p => !newP.includes(p))), 600);
  }, []);

  const handleTubeTap = useCallback((idx, e) => {
    if (gameState !== 'playing') return;
    const tube = tubes[idx];

    if (selectedTube === null) {
      if (tube.length === 0) return;
      initAudio();
      playPop();
      setSelectedTube(idx);
    } else if (selectedTube === idx) {
      setSelectedTube(null);
    } else {
      const srcTube = tubes[selectedTube];
      const ball = srcTube[srcTube.length - 1];
      const canDrop = tube.length < MAX_BALLS && (tube.length === 0 || tube[tube.length - 1] === ball);

      if (canDrop) {
        const newTubes = tubes.map(t => [...t]);
        newTubes[selectedTube].pop();
        newTubes[idx].push(ball);
        setTubes(newTubes);
        setMoves(m => m + 1);
        setSelectedTube(null);
        setDroppingTube(idx);
        playDrop();
        if (e) {
          const rect = e.currentTarget.getBoundingClientRect();
          spawnParticles(rect.left + rect.width / 2, rect.top + 20, ball);
        }
        setTimeout(() => setDroppingTube(null), 300);
      } else {
        playBuzz();
        setShakeTube(idx);
        setTimeout(() => setShakeTube(null), 400);
      }
    }
  }, [gameState, tubes, selectedTube, spawnParticles]);

  // Instructions section
  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Sort all colored balls so each tube contains only one color
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tap a tube to select the top ball</li>
          <li>• Tap another tube to move it there</li>
          <li>• Balls can only go on same color or empty tubes</li>
          <li>• Use empty tubes strategically!</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Complete the puzzle to win</li>
          <li>• Fewer moves = higher score</li>
          <li>• Try to beat the par score</li>
          <li>• Maximum score: 200 points</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Difficulty
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Easy: 3 colors, 12 moves par</li>
          <li>• Moderate: 5 colors, 20 moves par</li>
          <li>• Hard: 7 colors, 30 moves par</li>
          <li>• Time limit: 3 minutes</li>
        </ul>
      </div>
    </div>
  );

  // Playing content
  // Responsive sizing: larger tubes for big screens, keep current size for small screens
  const tubeWidth = isLargeScreen ? 80 : 56;
  const ballSize = isLargeScreen ? 60 : 40;
  const tubeHeight = MAX_BALLS * (ballSize + 4) + 24;

  const playingContent = (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      padding: '16px',
      background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0d0d35 100%)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient particles */}
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: Math.random() * 3 + 1,
          height: Math.random() * 3 + 1,
          borderRadius: '50%',
          background: `rgba(255,255,255,${Math.random() * 0.2 + 0.05})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `bs-float ${3 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Particles from drops */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed',
          left: p.x,
          top: p.y,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: BALL_COLORS[p.color]?.bg || '#fff',
          '--dx': `${p.dx}px`,
          '--dy': `${p.dy}px`,
          animation: 'bs-particle 0.6s ease-out forwards',
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
            <span>👆</span>
            <span style={{ fontWeight: 600 }}>Moves: {moves}</span>
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
            <span style={{ fontWeight: 600 }}>Par: {settings.par}</span>
          </div>
        </div>

        {/* Tubes */}
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '90vw',
          padding: '24px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 20,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {tubes.map((tube, ti) => (
            <div key={ti} onClick={(e) => handleTubeTap(ti, e)} style={{
              width: tubeWidth,
              minHeight: tubeHeight,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              border: `2px solid ${selectedTube === ti ? 'rgba(116,185,255,0.7)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '8px 8px 24px 24px',
              display: 'flex',
              flexDirection: 'column-reverse',
              alignItems: 'center',
              padding: '8px 4px',
              gap: 4,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedTube === ti ? '0 0 20px rgba(116,185,255,0.3), inset 0 0 20px rgba(116,185,255,0.1)' : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              animation: shakeTube === ti ? 'bs-shake 0.4s ease' : (selectedTube === ti ? 'bs-pulse 2s ease-in-out infinite' : 'none'),
              backdropFilter: 'blur(10px)'
            }}>
              {tube.map((ball, bi) => {
                const isTop = bi === tube.length - 1;
                const isLifted = isTop && selectedTube === ti;
                const isDropping = isTop && droppingTube === ti;
                const c = BALL_COLORS[ball];
                return (
                  <div key={bi} style={{
                    width: ballSize,
                    height: ballSize,
                    borderRadius: '50%',
                    background: c.bg,
                    border: `2px solid ${c.border}`,
                    boxShadow: `inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.4)`,
                    animation: isLifted ? 'bs-lift 0.25s ease-out forwards' : isDropping ? 'bs-drop 0.3s ease-out' : 'none',
                    transition: 'transform 0.15s',
                    zIndex: isLifted ? 10 : 1
                  }} />
                );
              })}
              {tube.length === 0 && (
                <div style={{
                  width: ballSize - 8,
                  height: ballSize - 8,
                  borderRadius: '50%',
                  border: '2px dashed rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 16, opacity: 0.3, color: '#fff' }}>+</span>
                </div>
              )}
            </div>
          ))}
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
          {selectedTube !== null
            ? '👆 Tap another tube to place the ball, or tap the same tube to cancel'
            : '👆 Tap a tube to pick up the top ball'}
        </div>
      </div>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Ball Sort Puzzle"
      gameShortDescription="Sort colored balls into tubes by matching colors"
      category="Puzzle"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{ moves }}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
};

export default BallSortGame;
