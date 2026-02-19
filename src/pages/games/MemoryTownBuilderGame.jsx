import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

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
  easy:   { label: 'Easy',   gridSize: 4, buildingCount: 5,  studyTime: 12, timeLimit: 60,  typesUsed: 4,  color: '#4ade80', desc: 'Small Village' },
  medium: { label: 'Medium', gridSize: 5, buildingCount: 8,  studyTime: 10, timeLimit: 90,  typesUsed: 6,  color: '#facc15', desc: 'Growing Town' },
  hard:   { label: 'Hard',   gridSize: 6, buildingCount: 12, studyTime: 8,  timeLimit: 120, typesUsed: 8,  color: '#f87171', desc: 'Busy City' },
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
export default function MemoryTownBuilder({ onBack }) {
  const location = useLocation();
  const [phase, setPhase] = useState('menu'); // menu | study | recall | result | summary
  const [level, setLevel] = useState(null);
  const [targetGrid, setTargetGrid] = useState([]);
  const [playerGrid, setPlayerGrid] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [timer, setTimer] = useState(0);
  const [studyTimer, setStudyTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(3);
  const [roundResults, setRoundResults] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [combo, setCombo] = useState(0);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const closeInstructions = useCallback(() => setShowInstructions(false), []);

  useEffect(() => {
    if (!showInstructions) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') closeInstructions(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInstructions, closeInstructions]);

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
          const map = { easy: 'easy', medium: 'medium', moderate: 'medium', hard: 'hard' };
          if (map[d]) {
            setIsDailyGame(true);
            setDailyGameDifficulty(map[d]);
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
    if (phase === 'study') {
      const cfg = LEVELS[level];
      setStudyTimer(cfg.studyTime);
      timerRef.current = setInterval(() => {
        setStudyTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            audio.start();
            setPhase('recall');
            setTimer(cfg.timeLimit);
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
        setTimer(prev => {
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
  }, [phase, level, round]);

  // ─── START LEVEL ───
  const startLevel = (lv) => {
    setLevel(lv);
    setScore(0);
    setRound(0);
    setCombo(0);
    setRoundResults([]);
    audio.startMusic();
    startRound(lv, 0);
  };

  const startRound = (lv, r) => {
    const grid = generatePuzzle(lv);
    const cfg = LEVELS[lv];
    setTargetGrid(grid);
    setPlayerGrid(Array.from({ length: cfg.gridSize }, () => Array(cfg.gridSize).fill(null)));
    setSelectedBuilding(null);
    setComparison(null);
    setRound(r);
    setPhase('study');
    audio.reveal();
  };

  // ─── CHECK ANSWER ───
  const checkAnswer = useCallback(() => {
    clearInterval(timerRef.current);
    const cfg = LEVELS[level];
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
    const timeBonus = timer > 0 ? Math.floor((timer / LEVELS[level].timeLimit) * 10) : 0;
    const comboBonus = combo * 2;
    let roundScore = Math.floor(accuracy * roundMaxScore) + timeBonus + comboBonus;
    roundScore = Math.min(roundScore, roundMaxScore);

    const newCombo = accuracy >= 0.8 ? combo + 1 : 0;
    setCombo(newCombo);

    const newScore = Math.min(score + roundScore, MAX_SCORE);
    setScore(newScore);
    setComparison(comp);

    const result = { round: round + 1, correct, total, accuracy, roundScore };
    const newResults = [...roundResults, result];
    setRoundResults(newResults);

    if (accuracy >= 0.5) audio.correct(); else audio.wrong();

    setPhase('result');
  }, [level, targetGrid, playerGrid, timer, score, combo, round, roundResults, totalRounds]);

  // ─── NEXT ROUND / SUMMARY ───
  const nextRound = () => {
    if (round + 1 >= totalRounds) {
      audio.stopMusic();
      setPhase('summary');
    } else {
      startRound(level, round + 1);
    }
  };

  // Set completion data once when entering summary (for GameCompletionModal)
  useEffect(() => {
    if (phase !== 'summary' || level == null) return;
    const cfg = LEVELS[level];
    setCompletionData((prev) => prev != null ? prev : {
      score,
      isVictory: score >= 160,
      difficulty: cfg.label,
      timeElapsed: totalRounds * (cfg.studyTime + cfg.timeLimit),
    });
  }, [phase, level, score, totalRounds]);

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
  const availableTypes = level ? BUILDINGS.slice(0, LEVELS[level].typesUsed) : [];

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

  const cellSize = level ? Math.min(Math.floor((Math.min(window.innerWidth * 0.85, 860) - 40) / (phase === 'result' ? LEVELS[level].gridSize * 2 + 1 : LEVELS[level].gridSize)), 72) : 50;

  const tLoading = useTranslateText('Loading...');
  const tObjective = useTranslateText('Objective');
  const tObjectiveDesc = useTranslateText('Study the town layout shown on the grid, then recreate it from memory by placing the correct buildings in the right cells.');
  const tHowToPlay = useTranslateText('How to Play');
  const tStudyBullet = useTranslateText('Study — Memorize building positions on the grid during the study phase.');
  const tRecallBullet = useTranslateText('Recall — Select a building type from the palette, then click grid cells to place or remove.');
  const tMatchBullet = useTranslateText('Match — Recreate the layout as accurately as possible. Submit to see your accuracy and score.');
  const tLevels = useTranslateText('Levels');
  const tLevelsDesc = useTranslateText('Easy: 4×4, 5 buildings. Medium: 5×5, 8 buildings. Hard: 6×6, 12 buildings. Each round has a study time and a recall time limit.');
  const tGotIt = useTranslateText('Got it');
  const tBack = useTranslateText('← Back');
  const tMemoryTownTitle = useTranslateText('Memory Town Builder – How to Play');
  const tSubtitle = useTranslateText('Study the town layout, then recreate it from memory!');
  const tGameTitle = useTranslateText('Memory Town Builder');
  const tDailyChallenge = useTranslateText('Daily Challenge');
  const tPhase = useTranslateText('Phase');
  const tRound = useTranslateText('Round');
  const tTime = useTranslateText('Time');
  const tScore = useTranslateText('Score');
  const tStudy = useTranslateText('Study');
  const levelLabels = { easy: useTranslateText('Easy'), medium: useTranslateText('Medium'), hard: useTranslateText('Hard') };
  const levelDescs = { easy: useTranslateText('Small Village'), medium: useTranslateText('Growing Town'), hard: useTranslateText('Busy City') };

  // ─── RENDER GRID ───
  const renderGrid = (grid, isTarget = false, comp = null) => {
    const gs = LEVELS[level].gridSize;
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

  const handleReset = useCallback(() => {
    setPhase('menu');
    setCompletionData(null);
  }, []);

  // ─── MENU ───
  if (phase === 'menu') {
    if (checkingDailyGame) {
      return (
        <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#e2e8f0', fontSize: 16 }}>{tLoading}</div>
        </div>
      );
    }
    const levelEntries = isDailyGame && dailyGameDifficulty
      ? Object.entries(LEVELS).filter(([key]) => key === dailyGameDifficulty)
      : Object.entries(LEVELS);
    const instructionsModalContent = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <section style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#4ade80' }}>{tObjective}</h3>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#cbd5e1' }}>{tObjectiveDesc}</p>
        </section>
        <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{tHowToPlay}</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
            <li>{tStudyBullet}</li>
            <li>{tRecallBullet}</li>
            <li>{tMatchBullet}</li>
          </ul>
        </section>
        <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{tLevels}</h3>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#cbd5e1' }}>{tLevelsDesc}</p>
        </section>
      </div>
    );
    return (
      <div style={S.root}>
        <canvas ref={canvasRef} style={S.canvas} />
        <div style={S.content}>
          {onBack && <button style={S.backBtn} onClick={() => { audio.stopMusic(); onBack(); }}>{tBack}</button>}
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            aria-label="How to Play"
            style={{
              position: 'absolute', top: 12, right: 16, zIndex: 10,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10,
              border: '2px solid rgba(74,222,128,0.6)', background: 'rgba(74,222,128,0.15)',
              color: '#4ade80', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74,222,128,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(74,222,128,0.15)'; e.currentTarget.style.transform = ''; }}
          >
            <span style={{ fontSize: 16 }} aria-hidden>📖</span>
            {tHowToPlay}
          </button>
          <div style={{ fontSize: 48, marginTop: 30 }}>🏘️</div>
          <h1 style={S.title}>{tGameTitle}</h1>
          <p style={S.subtitle}>{tSubtitle}</p>
          {isDailyGame && (
            <div style={{ marginBottom: 16, padding: '6px 16px', background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.5)', borderRadius: 20, fontSize: 13, color: '#4ade80', fontWeight: 600 }}>{tDailyChallenge}</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 12 }}>
            {levelEntries.map(([key, lv]) => (
              <div key={key} style={S.levelCard(lv.color)}
                onClick={() => { audio.select(); startLevel(key); }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 8px 30px ${lv.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>
                  {key === 'easy' ? '🏡' : key === 'medium' ? '🏘️' : '🌆'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: lv.color }}>{levelLabels[key]}</div>
                <div style={{ fontSize: 13, opacity: 0.6, margin: '4px 0' }}>{levelDescs[key]}</div>
                <div style={{ fontSize: 12, opacity: 0.4 }}>{lv.gridSize}×{lv.gridSize} grid · {lv.buildingCount} buildings</div>
                <div style={{ fontSize: 12, opacity: 0.4 }}>{lv.studyTime}s study · {lv.timeLimit}s limit</div>
              </div>
            ))}
          </div>
          {showInstructions && (
            <div role="dialog" aria-modal="true" aria-labelledby="memory-town-instructions-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }} onClick={closeInstructions}>
              <div style={{ background: 'linear-gradient(180deg, #1e2e1e 0%, #0f1f0f 100%)', border: '2px solid rgba(74,222,128,0.5)', borderRadius: 20, padding: 0, maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
                  <h2 id="memory-town-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#4ade80' }}>{tMemoryTownTitle}</h2>
                  <button type="button" onClick={closeInstructions} aria-label="Close" style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{instructionsModalContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <button type="button" onClick={closeInstructions} style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{tGotIt}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── STUDY PHASE ───
  if (phase === 'study') {
    return (
      <div style={S.root}>
        <canvas ref={canvasRef} style={S.canvas} />
        <div style={S.content}>
          <button style={S.backBtn} onClick={() => { audio.stopMusic(); clearInterval(timerRef.current); setPhase('menu'); }}>{tBack}</button>
          <div style={{ ...S.hud, marginTop: 40 }}>
            <div style={S.hudItem}><div style={S.hudLabel}>{tPhase}</div><div style={{ ...S.hudValue, color: '#60a5fa' }}>📖 {tStudy}</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>{tRound}</div><div style={S.hudValue}>{round + 1}/{totalRounds}</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>{tTime}</div><div style={{ ...S.hudValue, color: studyTimer <= 3 ? '#f87171' : '#facc15', animation: studyTimer <= 3 ? 'pulse 0.5s infinite' : 'none' }}>{studyTimer}s</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>{tScore}</div><div style={{ ...S.hudValue, color: '#4ade80' }}>{score}</div></div>
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
          {/* Study timer bar */}
          <div style={{ width: '100%', maxWidth: 400, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: `${(studyTimer / LEVELS[level].studyTime) * 100}%`, height: '100%', background: studyTimer <= 3 ? '#f87171' : '#60a5fa', borderRadius: 3, transition: 'width 1s linear' }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── RECALL PHASE ───
  if (phase === 'recall') {
    return (
      <div style={S.root}>
        <canvas ref={canvasRef} style={S.canvas} />
        <div style={S.content}>
          <button style={S.backBtn} onClick={() => { audio.stopMusic(); clearInterval(timerRef.current); setPhase('menu'); }}>← Back</button>
          <div style={{ ...S.hud, marginTop: 40 }}>
            <div style={S.hudItem}><div style={S.hudLabel}>{tPhase}</div><div style={{ ...S.hudValue, color: '#facc15' }}>🔨 Build</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>{tRound}</div><div style={S.hudValue}>{round + 1}/{totalRounds}</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>{tTime}</div><div style={{ ...S.hudValue, color: timer <= 10 ? '#f87171' : '#4ade80' }}>{timer}s</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>{tScore}</div><div style={{ ...S.hudValue, color: '#4ade80' }}>{score}</div></div>
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
        </div>
      </div>
    );
  }

  // ─── RESULT PHASE ───
  if (phase === 'result') {
    const lastResult = roundResults[roundResults.length - 1];
    const pct = Math.round(lastResult.accuracy * 100);
    return (
      <div style={S.root}>
        <canvas ref={canvasRef} style={S.canvas} />
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
      </div>
    );
  }

  // ─── SUMMARY ───
  if (phase === 'summary') {
    const avgAcc = roundResults.reduce((s, r) => s + r.accuracy, 0) / roundResults.length;
    const rating = score >= 160 ? '⭐⭐⭐' : score >= 100 ? '⭐⭐' : score >= 40 ? '⭐' : '—';
    const c = completionData || {};
    const cfg = level != null ? LEVELS[level] : null;
    const gameTimeLimit = cfg ? totalRounds * (cfg.studyTime + cfg.timeLimit) : 0;
    return (
      <>
        <div style={{ ...S.root, zIndex: 1 }}>
          <canvas ref={canvasRef} style={S.canvas} />
          <div style={{ ...S.content, justifyContent: 'center', minHeight: '100vh' }}>
            <div style={S.summaryCard}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>🏘️</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Town Complete!</div>
              <div style={{ fontSize: 14, opacity: 0.5, marginBottom: 16 }}>{LEVELS[level].label} — {LEVELS[level].desc}</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#4ade80', marginBottom: 4 }}>{score}<span style={{ fontSize: 18, opacity: 0.5 }}>/{MAX_SCORE}</span></div>
              <div style={{ fontSize: 22, marginBottom: 16 }}>{rating}</div>

              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                {roundResults.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < roundResults.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ opacity: 0.6 }}>Round {r.round}</span>
                    <span>{r.correct}/{r.total} ({Math.round(r.accuracy * 100)}%)</span>
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>+{r.roundScore}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 16 }}>
                Average accuracy: {Math.round(avgAcc * 100)}%
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button style={{ ...S.serveBtn, background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }} onClick={() => { setCompletionData(null); startLevel(level); }}>
                  🔄 Retry
                </button>
                <button style={S.serveBtn} onClick={handleReset}>
                  📋 Levels
                </button>
              </div>
            </div>
          </div>
        </div>
        {completionData != null && (
          <GameCompletionModal
            isVisible
            onClose={handleReset}
            gameTitle={tGameTitle}
            score={c.score}
            timeElapsed={c.timeElapsed}
            gameTimeLimit={gameTimeLimit}
            isVictory={c.isVictory}
            difficulty={c.difficulty}
            customMessages={{ maxScore: MAX_SCORE }}
          />
        )}
      </>
    );
  }

  return null;
}
