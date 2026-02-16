import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

// ─── BUILDING TYPES ───
const BUILDINGS = [
  { id: 'house',    emoji: '🏠', label: 'House',    color: '#4ade80' },
  { id: 'shop',     emoji: '🏪', label: 'Shop',     color: '#60a5fa' },
  { id: 'tree',     emoji: '🌳', label: 'Tree',     color: '#22c55e' },
  { id: 'hospital', emoji: '🏥', label: 'Hospital', color: '#f87171' },
  { id: 'school',   emoji: '🏫', label: 'School',   color: '#facc15' },
  { id: 'church',   emoji: '⛪', label: 'Church',   color: '#c084fc' },
  { id: 'factory',  emoji: '🏭', label: 'Factory',  color: '#94a3b8' },
  { id: 'park',     emoji: '🏞️', label: 'Park',     color: '#34d399' },
  { id: 'station',  emoji: '🚉', label: 'Station',  color: '#fb923c' },
  { id: 'tower',    emoji: '🗼', label: 'Tower',    color: '#e879f9' },
];

// ─── LEVEL CONFIG ───
const LEVELS = {
  Easy:     { label: 'Easy',     gridSize: 4, buildingCount: 5,  studyTime: 12, timeLimit: 60,  typesUsed: 4,  color: '#4ade80', desc: 'Small Village' },
  Moderate: { label: 'Moderate', gridSize: 5, buildingCount: 8,  studyTime: 10, timeLimit: 90,  typesUsed: 6,  color: '#facc15', desc: 'Growing Town' },
  Hard:     { label: 'Hard',     gridSize: 6, buildingCount: 12, studyTime: 8,  timeLimit: 120, typesUsed: 8,  color: '#f87171', desc: 'Busy City' },
};

const MAX_SCORE = 200;

// ─── AUDIO ENGINE ───
function createAudioEngine() {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  let musicOsc = null, musicGain = null, musicInterval = null;

  const playTone = (freq, dur = 0.15, type = 'square', vol = 0.12) => {
    try {
      const c = getCtx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, c.currentTime);
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur);
    } catch (e) {}
  };

  return {
    place:   () => playTone(520, 0.1, 'sine', 0.15),
    remove:  () => playTone(300, 0.1, 'sawtooth', 0.08),
    correct: () => { playTone(523, 0.12, 'sine', 0.18); setTimeout(() => playTone(659, 0.12, 'sine', 0.18), 100); setTimeout(() => playTone(784, 0.2, 'sine', 0.18), 200); },
    wrong:   () => { playTone(200, 0.25, 'sawtooth', 0.12); setTimeout(() => playTone(160, 0.3, 'sawtooth', 0.12), 150); },
    select:  () => playTone(440, 0.06, 'sine', 0.1),
    tick:    () => playTone(800, 0.03, 'sine', 0.04),
    start:   () => { playTone(440, 0.1, 'sine', 0.12); setTimeout(() => playTone(554, 0.1, 'sine', 0.12), 80); setTimeout(() => playTone(659, 0.15, 'sine', 0.15), 160); },
    reveal:  () => playTone(350, 0.4, 'triangle', 0.1),
    startMusic: () => {
      try {
        const c = getCtx();
        const notes = [262, 294, 330, 349, 392, 349, 330, 294];
        let i = 0;
        musicGain = c.createGain();
        musicGain.gain.setValueAtTime(0.04, c.currentTime);
        musicGain.connect(c.destination);
        musicInterval = setInterval(() => {
          const o = c.createOscillator();
          o.type = 'sine';
          o.frequency.setValueAtTime(notes[i % notes.length], c.currentTime);
          const g = c.createGain();
          g.gain.setValueAtTime(0.04, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
          o.connect(g);
          g.connect(c.destination);
          o.start();
          o.stop(c.currentTime + 0.45);
          i++;
        }, 500);
      } catch (e) {}
    },
    stopMusic: () => {
      if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
    },
  };
}

// ─── GENERATE PUZZLE ───
function generatePuzzle(level) {
  const cfg = LEVELS[level];
  const { gridSize, buildingCount, typesUsed } = cfg;
  const usedTypes = BUILDINGS.slice(0, typesUsed);
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  const positions = [];
  for (let r = 0; r < gridSize; r++)
    for (let c = 0; c < gridSize; c++)
      positions.push([r, c]);
  // Shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const chosen = positions.slice(0, buildingCount);
  chosen.forEach(([r, c]) => {
    const b = usedTypes[Math.floor(Math.random() * usedTypes.length)];
    grid[r][c] = b.id;
  });
  return grid;
}

// ─── MAIN COMPONENT ───
export default function MemoryTownBuilder() {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [phase, setPhase] = useState('study'); // study | recall | result
  const [targetGrid, setTargetGrid] = useState([]);
  const [playerGrid, setPlayerGrid] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [studyTimer, setStudyTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(3);
  const [roundResults, setRoundResults] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [combo, setCombo] = useState(0);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  if (!audioRef.current) audioRef.current = createAudioEngine();
  const audio = audioRef.current;

  // ─── CANVAS BACKGROUND ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.getContext('2d');
    let animId;
    let particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.3 + 0.1,
    }));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      cx.clearRect(0, 0, canvas.width, canvas.height);
      // Grid pattern
      cx.strokeStyle = 'rgba(100,200,150,0.06)';
      cx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, canvas.height); cx.stroke(); }
      for (let y = 0; y < canvas.height; y += 40) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(canvas.width, y); cx.stroke(); }
      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        cx.beginPath();
        cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cx.fillStyle = `rgba(100, 220, 160, ${p.alpha})`;
        cx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  // ─── TIMER ───
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (phase === 'study') {
      const cfg = LEVELS[difficulty];
      setStudyTimer(cfg.studyTime);
      timerRef.current = setInterval(() => {
        setStudyTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            audio.start();
            setPhase('recall');
            setTimeLeft(cfg.timeLimit);
            return 0;
          }
          if (prev <= 4) audio.tick();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    if (phase === 'recall') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            checkAnswer();
            return 0;
          }
          if (prev <= 10) audio.tick();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameState, phase, difficulty, round]);
  
  // Update timeLeft when difficulty changes
  useEffect(() => {
    if (gameState === 'ready') {
      setTimeLeft(LEVELS[difficulty].timeLimit);
    }
  }, [difficulty, gameState]);

  // ─── START LEVEL ───
  const handleStart = useCallback(() => {
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setRound(0);
    setCombo(0);
    setRoundResults([]);
    setTimeLeft(LEVELS[difficulty].timeLimit);
    audio.startMusic();
    startRound(0);
    setGameState('playing');
  }, [difficulty]);

  const startRound = (r) => {
    const grid = generatePuzzle(difficulty);
    const cfg = LEVELS[difficulty];
    setTargetGrid(grid);
    setPlayerGrid(Array.from({ length: cfg.gridSize }, () => Array(cfg.gridSize).fill(null)));
    setSelectedBuilding(null);
    setComparison(null);
    setRound(r);
    setPhase('study');
    audio.reveal();
  };
  
  const handleReset = useCallback(() => {
    audio.stopMusic();
    clearInterval(timerRef.current);
    setGameState('ready');
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(LEVELS[difficulty].timeLimit);
    setPhase('study');
    setRound(0);
    setRoundResults([]);
  }, [difficulty]);

  // ─── CHECK ANSWER ───
  const checkAnswer = useCallback(() => {
    clearInterval(timerRef.current);
    const cfg = LEVELS[difficulty];
    let correct = 0;
    let total = 0;
    const comp = Array.from({ length: cfg.gridSize }, () => Array(cfg.gridSize).fill('empty'));

    for (let r = 0; r < cfg.gridSize; r++) {
      for (let c = 0; c < cfg.gridSize; c++) {
        if (targetGrid[r][c]) {
          total++;
          if (playerGrid[r][c] === targetGrid[r][c]) {
            correct++;
            comp[r][c] = 'correct';
          } else if (playerGrid[r][c]) {
            comp[r][c] = 'wrong';
          } else {
            comp[r][c] = 'missed';
          }
        } else if (playerGrid[r][c]) {
          comp[r][c] = 'extra';
        }
      }
    }

    const accuracy = total > 0 ? correct / total : 0;
    const roundMaxScore = Math.floor(MAX_SCORE / totalRounds);
    const timeBonus = timeLeft > 0 ? Math.floor((timeLeft / LEVELS[difficulty].timeLimit) * 10) : 0;
    const comboBonus = combo * 2;
    let roundScore = Math.floor(accuracy * roundMaxScore) + timeBonus + comboBonus;
    roundScore = Math.min(roundScore, roundMaxScore);

    const newCombo = accuracy >= 0.8 ? combo + 1 : 0;
    setCombo(newCombo);

    const newScore = Math.min(score + roundScore, MAX_SCORE);
    setScore(newScore);
    setComparison(comp);
    
    setCorrectCount(prev => prev + correct);
    setWrongCount(prev => prev + (total - correct));

    const result = { round: round + 1, correct, total, accuracy, roundScore };
    const newResults = [...roundResults, result];
    setRoundResults(newResults);

    if (accuracy >= 0.5) audio.correct(); else audio.wrong();

    setPhase('result');
  }, [difficulty, targetGrid, playerGrid, timeLeft, score, combo, round, roundResults, totalRounds]);

  // ─── NEXT ROUND / SUMMARY ───
  const nextRound = () => {
    if (round + 1 >= totalRounds) {
      audio.stopMusic();
      setGameState('finished');
    } else {
      startRound(round + 1);
    }
  };

  // ─── CELL CLICK ───
  const handleCellClick = (r, c) => {
    if (phase !== 'recall') return;
    const newGrid = playerGrid.map(row => [...row]);
    if (newGrid[r][c] === selectedBuilding) {
      newGrid[r][c] = null;
      audio.remove();
    } else if (selectedBuilding) {
      newGrid[r][c] = selectedBuilding;
      audio.place();
    } else if (newGrid[r][c]) {
      newGrid[r][c] = null;
      audio.remove();
    }
    setPlayerGrid(newGrid);
  };

  // ─── GET BUILDING ───
  const getBuilding = (id) => BUILDINGS.find(b => b.id === id);

  // ─── AVAILABLE TYPES ───
  const availableTypes = BUILDINGS.slice(0, LEVELS[difficulty].typesUsed);

  // ─── COUNT PLACED ───
  const placedCount = playerGrid.flat().filter(Boolean).length;
  const targetCount = targetGrid.flat().filter(Boolean).length;

  // ─── STYLES ───
  const S = {
    root: {
      position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0f1a12 0%, #162016 40%, #1a2a1e 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#e0f0e4', overflow: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    canvas: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
    content: { position: 'relative', zIndex: 1, width: '100%', maxWidth: 900, padding: '10px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' },
    title: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, textAlign: 'center', margin: '10px 0 4px', textShadow: '0 0 20px rgba(100,220,160,0.4)' },
    subtitle: { fontSize: 'clamp(0.8rem, 2vw, 1rem)', opacity: 0.6, textAlign: 'center', marginBottom: 16 },
    backBtn: {
      position: 'absolute', top: 12, left: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
      color: '#e0f0e4', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, zIndex: 10,
    },
    levelCard: (color) => ({
      background: `linear-gradient(135deg, ${color}18, ${color}08)`,
      border: `2px solid ${color}40`, borderRadius: 16, padding: '20px 24px', cursor: 'pointer',
      transition: 'all 0.2s', width: '100%', maxWidth: 260, textAlign: 'center',
    }),
    hud: {
      display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12,
      background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '8px 20px', backdropFilter: 'blur(8px)',
    },
    hudItem: { textAlign: 'center', minWidth: 60 },
    hudLabel: { fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 },
    hudValue: { fontSize: 20, fontWeight: 700 },
    gridContainer: {
      display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', flex: 1, width: '100%',
    },
    gridPanel: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    gridLabel: { fontSize: 14, fontWeight: 600, marginBottom: 8, opacity: 0.7 },
    palette: {
      display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12,
      background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '10px 14px',
    },
    paletteBtn: (active, color) => ({
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      background: active ? `${color}30` : 'rgba(255,255,255,0.06)',
      border: active ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '6px 10px', cursor: 'pointer', transition: 'all 0.15s',
      minWidth: 52,
    }),
    paletteBtnEmoji: { fontSize: 22 },
    paletteBtnLabel: { fontSize: 9, opacity: 0.7 },
    serveBtn: {
      background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#0a1a0e',
      border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 16, fontWeight: 700,
      cursor: 'pointer', marginTop: 8, boxShadow: '0 4px 20px rgba(74,222,128,0.3)',
    },
    resultOverlay: {
      position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
    },
    resultCard: {
      background: 'linear-gradient(135deg, #1a2a1e, #0f1a12)', borderRadius: 20,
      padding: '28px 32px', maxWidth: 420, width: '90%', textAlign: 'center',
      border: '1px solid rgba(100,220,160,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    },
    summaryCard: {
      background: 'linear-gradient(135deg, #1a2a1e, #0f1a12)', borderRadius: 20,
      padding: '28px 32px', maxWidth: 500, width: '90%', textAlign: 'center',
      border: '1px solid rgba(100,220,160,0.2)',
    },
  };

  const cellSize = Math.min(Math.floor((Math.min(window.innerWidth * 0.85, 860) - 40) / (phase === 'result' ? LEVELS[difficulty].gridSize * 2 + 1 : LEVELS[difficulty].gridSize)), 72);
  
  const accuracy = correctCount + wrongCount > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
    : 0;

  // ─── RENDER GRID ───
  const renderGrid = (grid, isTarget = false, comp = null) => {
    const gs = LEVELS[difficulty].gridSize;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gs}, ${cellSize}px)`, gap: 3 }}>
        {grid.map((row, r) => row.map((cell, c) => {
          const b = cell ? getBuilding(cell) : null;
          let bg = 'rgba(255,255,255,0.04)';
          let border = '2px solid rgba(255,255,255,0.08)';
          if (comp) {
            const st = comp[r][c];
            if (st === 'correct') { bg = 'rgba(74,222,128,0.2)'; border = '2px solid #4ade80'; }
            else if (st === 'wrong') { bg = 'rgba(248,113,113,0.2)'; border = '2px solid #f87171'; }
            else if (st === 'missed') { bg = 'rgba(250,204,21,0.15)'; border = '2px dashed #facc15'; }
            else if (st === 'extra') { bg = 'rgba(248,113,113,0.1)'; border = '2px dashed #f87171'; }
          }
          return (
            <div
              key={`${r}-${c}`}
              onClick={() => !isTarget && handleCellClick(r, c)}
              style={{
                width: cellSize, height: cellSize, borderRadius: 8, background: bg, border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isTarget ? 'default' : 'pointer', transition: 'all 0.15s',
                fontSize: Math.max(cellSize * 0.5, 18),
              }}
            >
              {b ? b.emoji : ''}
            </div>
          );
        }))}
      </div>
    );
  };

  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Study the town layout during the study phase, then recreate it from memory as accurately as possible.
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Study: Memorize building positions</li>
          <li>• Recall: Select buildings from palette</li>
          <li>• Place: Click grid cells to position</li>
          <li>• Submit: Complete 3 rounds</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Points for correct placements</li>
          <li>• Time bonus for quick completion</li>
          <li>• Combo bonus for 80%+ accuracy</li>
          <li>• Max 200 points across 3 rounds</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Strategy
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Focus during study phase</li>
          <li>• Remember building patterns</li>
          <li>• Use eraser to fix mistakes</li>
          <li>• Build combos for bonus points</li>
        </ul>
      </div>
    </div>
  );

  const playingContent = (
    <div style={S.root}>
        <canvas ref={canvasRef} style={S.canvas} />
        <div style={S.content}>
          <button style={S.backBtn} onClick={handleReset}>← Back</button>
          {phase === 'study' && (
            <>
          <div style={{ ...S.hud, marginTop: 40 }}>
            <div style={S.hudItem}><div style={S.hudLabel}>Phase</div><div style={{ ...S.hudValue, color: '#60a5fa' }}>📖 Study</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>Round</div><div style={S.hudValue}>{round + 1}/{totalRounds}</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>Time</div><div style={{ ...S.hudValue, color: studyTimer <= 3 ? '#f87171' : '#facc15', animation: studyTimer <= 3 ? 'pulse 0.5s infinite' : 'none' }}>{studyTimer}s</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>Score</div><div style={{ ...S.hudValue, color: '#4ade80' }}>{score}</div></div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#60a5fa', textAlign: 'center' }}>
            📋 Memorize this layout!
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 16, border: '2px solid rgba(96,165,250,0.3)' }}>
            {renderGrid(targetGrid, true)}
          </div>
          <div style={{ fontSize: 13, opacity: 0.4, marginTop: 8, textAlign: 'center' }}>
            {targetCount} buildings to remember
          </div>
            <div style={{ width: '100%', maxWidth: 400, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ width: `${(studyTimer / LEVELS[difficulty].studyTime) * 100}%`, height: '100%', background: studyTimer <= 3 ? '#f87171' : '#60a5fa', borderRadius: 3, transition: 'width 1s linear' }} />
            </div>
          </>
        )}
        {phase === 'recall' && (
          <>
          <div style={{ ...S.hud, marginTop: 40 }}>
            <div style={S.hudItem}><div style={S.hudLabel}>Phase</div><div style={{ ...S.hudValue, color: '#facc15' }}>🔨 Build</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>Round</div><div style={S.hudValue}>{round + 1}/{totalRounds}</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>Time</div><div style={{ ...S.hudValue, color: timeLeft <= 10 ? '#f87171' : '#4ade80' }}>{timeLeft}s</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>Score</div><div style={{ ...S.hudValue, color: '#4ade80' }}>{score}</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>Placed</div><div style={S.hudValue}>{placedCount}/{targetCount}</div></div>
            {combo > 1 && <div style={S.hudItem}><div style={S.hudLabel}>Combo</div><div style={{ ...S.hudValue, color: '#fb923c' }}>🔥 x{combo}</div></div>}
          </div>

          {/* Building palette */}
          <div style={S.palette}>
            {availableTypes.map(b => (
              <div
                key={b.id}
                style={S.paletteBtn(selectedBuilding === b.id, b.color)}
                onClick={() => { setSelectedBuilding(selectedBuilding === b.id ? null : b.id); audio.select(); }}
              >
                <span style={S.paletteBtnEmoji}>{b.emoji}</span>
                <span style={S.paletteBtnLabel}>{b.label}</span>
              </div>
            ))}
            <div
              style={S.paletteBtn(false, '#f87171')}
              onClick={() => { setSelectedBuilding(null); audio.select(); }}
            >
              <span style={S.paletteBtnEmoji}>🧹</span>
              <span style={S.paletteBtnLabel}>Eraser</span>
            </div>
          </div>

          {/* Player grid */}
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 16, border: `2px solid ${selectedBuilding ? getBuilding(selectedBuilding).color + '40' : 'rgba(255,255,255,0.1)'}` }}>
            {renderGrid(playerGrid)}
          </div>

            <button style={S.serveBtn} onClick={checkAnswer}>
              ✅ Submit Layout ({placedCount}/{targetCount})
            </button>
          </>
        )}
        {phase === 'result' && (() => {
          const lastResult = roundResults[roundResults.length - 1];
          const pct = Math.round(lastResult.accuracy * 100);
          return (
          <>
            <div style={S.resultOverlay}>
              <div style={{ ...S.resultCard, maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '😅'}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              Round {lastResult.round} Complete
            </div>
            <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 12 }}>
              {lastResult.correct}/{lastResult.total} correct — {pct}% accuracy
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#4ade80', marginBottom: 16 }}>
              +{lastResult.roundScore} pts
            </div>

            {/* Comparison grids */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={S.gridPanel}>
                <div style={S.gridLabel}>Target</div>
                {renderGrid(targetGrid, true)}
              </div>
              <div style={S.gridPanel}>
                <div style={S.gridLabel}>Yours</div>
                {renderGrid(playerGrid, true, comparison)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: 11, opacity: 0.5, marginBottom: 14 }}>
              <span>🟩 Correct</span><span>🟥 Wrong</span><span>🟨 Missed</span>
            </div>

                <button
                  style={S.serveBtn}
                  onClick={() => { audio.select(); nextRound(); }}
                >
                  {round + 1 >= totalRounds ? '📊 View Results' : `▶ Round ${round + 2}`}
                </button>
              </div>
            </div>
          </>
          );
        })()}
      </div>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Memory Town Builder"
      gameShortDescription="Study the town layout, then recreate it from memory!"
      category="Memory"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeLeft}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{ correctCount, wrongCount, accuracy, round: round + 1, totalRounds, combo }}
      enableCompletionModal={true}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
}
