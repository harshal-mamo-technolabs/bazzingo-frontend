import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

/*
  River Crossing Challenge – Carnival Quest
  3 levels, 200-point cap, 3-minute timer, Web Audio API, fully self-contained JSX.
  Rules: Move items across the river on a raft. Certain items can't be left alone together.
*/

/* ───── LEVEL DEFINITIONS ───── */
const LEVELS = [
  {
    id: 1,
    name: 'Farm Crossing',
    subtitle: 'The Classic Puzzle',
    desc: 'Get the Farmer, Fox, Chicken & Grain across. Fox eats Chicken if alone. Chicken eats Grain if alone.',
    raftCapacity: 2, // farmer + 1
    items: [
      { id: 'farmer', label: 'Farmer', emoji: '👨‍🌾', required: true },
      { id: 'fox', label: 'Fox', emoji: '🦊' },
      { id: 'chicken', label: 'Chicken', emoji: '🐔' },
      { id: 'grain', label: 'Grain', emoji: '🌾' },
    ],
    conflicts: [
      { a: 'fox', b: 'chicken', msg: 'Fox ate the Chicken!' },
      { a: 'chicken', b: 'grain', msg: 'Chicken ate the Grain!' },
    ],
    bg: ['#1a3a2a', '#0d2818'],
    water: ['#1565C0', '#0D47A1'],
    sky: ['#4a90d9', '#1a3a6a'],
  },
  {
    id: 2,
    name: 'Jungle Expedition',
    subtitle: 'Dangerous Cargo',
    desc: 'Transport Explorer, Lion, Zebra, Antelope & Supplies. Lion eats Zebra. Zebra eats Supplies. Lion eats Antelope if alone.',
    raftCapacity: 2,
    items: [
      { id: 'explorer', label: 'Explorer', emoji: '🧑‍🔬', required: true },
      { id: 'lion', label: 'Lion', emoji: '🦁' },
      { id: 'zebra', label: 'Zebra', emoji: '🦓' },
      { id: 'antelope', label: 'Antelope', emoji: '🦌' },
      { id: 'supplies', label: 'Supplies', emoji: '📦' },
    ],
    conflicts: [
      { a: 'lion', b: 'zebra', msg: 'Lion attacked the Zebra!' },
      { a: 'lion', b: 'antelope', msg: 'Lion attacked the Antelope!' },
      { a: 'zebra', b: 'supplies', msg: 'Zebra ate the Supplies!' },
    ],
    bg: ['#2d1b00', '#1a1000'],
    water: ['#00695C', '#004D40'],
    sky: ['#ff8f00', '#4e342e'],
  },
  {
    id: 3,
    name: 'Royal Transport',
    subtitle: 'Kingdom at Stake',
    desc: 'Move King, Queen, Prince, Dragon, Treasure & Guard. Dragon attacks anyone without Guard. Prince steals Treasure without King.',
    raftCapacity: 2,
    items: [
      { id: 'guard', label: 'Guard', emoji: '💂', required: true },
      { id: 'king', label: 'King', emoji: '👑' },
      { id: 'queen', label: 'Queen', emoji: '👸' },
      { id: 'prince', label: 'Prince', emoji: '🤴' },
      { id: 'dragon', label: 'Dragon', emoji: '🐉' },
      { id: 'treasure', label: 'Treasure', emoji: '💎' },
    ],
    conflicts: [
      { a: 'dragon', b: 'king', guard: 'guard', msg: 'Dragon attacked the King!' },
      { a: 'dragon', b: 'queen', guard: 'guard', msg: 'Dragon attacked the Queen!' },
      { a: 'dragon', b: 'prince', guard: 'guard', msg: 'Dragon attacked the Prince!' },
      { a: 'prince', b: 'treasure', guard: 'king', msg: 'Prince stole the Treasure!' },
    ],
    bg: ['#1a0a2e', '#0d0520'],
    water: ['#4A148C', '#311B92'],
    sky: ['#7c4dff', '#1a0a2e'],
  },
];

const TIME_LIMIT = 180;
const MAX_SCORE = 200;
const POINTS_PER_LEVEL = 67;

/* ───── AUDIO ───── */
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'select': osc.frequency.value = 520; gain.gain.value = 0.12; osc.type = 'sine'; osc.start(); osc.stop(ctx.currentTime + 0.1); break;
      case 'deselect': osc.frequency.value = 380; gain.gain.value = 0.1; osc.type = 'sine'; osc.start(); osc.stop(ctx.currentTime + 0.08); break;
      case 'sail': {
        osc.frequency.value = 300; gain.gain.value = 0.15; osc.type = 'triangle';
        osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.4); break;
      }
      case 'conflict': {
        osc.frequency.value = 200; gain.gain.value = 0.2; osc.type = 'sawtooth';
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5); break;
      }
      case 'win': {
        osc.type = 'sine'; gain.gain.value = 0.15;
        [523, 659, 784, 1047].forEach((f, i) => { osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.15); });
        osc.start(); osc.stop(ctx.currentTime + 0.6); break;
      }
      case 'lose': {
        osc.type = 'sawtooth'; gain.gain.value = 0.15;
        osc.frequency.value = 400;
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.8);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        osc.start(); osc.stop(ctx.currentTime + 0.8); break;
      }
      case 'splash': {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.15;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.value = 800;
        src.connect(filt); filt.connect(ctx.destination);
        src.start(); osc.disconnect(); return;
      }
      case 'levelup': {
        osc.type = 'sine'; gain.gain.value = 0.15;
        [440, 554, 659, 880].forEach((f, i) => osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12));
        osc.start(); osc.stop(ctx.currentTime + 0.5); break;
      }
      default: osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) { /* silent */ }
}

/* ───── COMPONENT ───── */
export default function RiverCrossing({ onBack }) {
  const location = useLocation();
  const [phase, setPhase] = useState('menu'); // menu | playing | conflict | levelWin | gameWin | gameOver | finished
  const [levelIdx, setLevelIdx] = useState(0);
  const [menuLevelIdx, setMenuLevelIdx] = useState(0); // selected level on menu
  const [leftBank, setLeftBank] = useState([]);
  const [rightBank, setRightBank] = useState([]);
  const [raftItems, setRaftItems] = useState([]);
  const [raftSide, setRaftSide] = useState('left'); // left | right | moving
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [conflictMsg, setConflictMsg] = useState('');
  const [muted, setMuted] = useState(false);
  const [particles, setParticles] = useState([]);
  const [raftAnim, setRaftAnim] = useState(0); // 0-1 for animation
  const [shake, setShake] = useState(false);
  const [dailyGameLevel, setDailyGameLevel] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [completionData, setCompletionData] = useState(null); // { score, isVictory, isLevelWin, levelIdx, moves, timeElapsed }
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const raftAnimRef = useRef(null);
  const waveOffset = useRef(0);
  const canvasRef = useRef(null);
  const playingStateRef = useRef({ score: 0, moves: 0, levelIdx: 0 });

  const lvl = LEVELS[levelIdx];
  playingStateRef.current = { score, moves, levelIdx };

  /* ── Daily game detection ── */
  useEffect(() => {
    const check = async () => {
      try {
        setCheckingDailyGame(true);
        const result = await getDailySuggestions();
        const games = result?.data?.suggestion?.games || [];
        const pathname = location.pathname || '';
        const normalizePath = (p = '') => {
          const base = String(p).split('?')[0].split('#')[0].trim();
          return (base.replace(/\/+$/, '') || '/');
        };
        const matched = games.find((g) => normalizePath(g?.gameId?.url) === normalizePath(pathname));
        if (matched?.difficulty) {
          const d = String(matched.difficulty).toLowerCase();
          const map = { easy: 0, moderate: 1, hard: 2 };
          if (map[d] !== undefined) {
            setIsDailyGame(true);
            setDailyGameLevel(map[d]);
            setMenuLevelIdx(map[d]);
          }
        }
      } catch (e) {
        console.error('Daily check failed', e);
      } finally {
        setCheckingDailyGame(false);
      }
    };
    check();
  }, [location.pathname]);

  const play = useCallback((t) => { if (!muted) playSound(t); }, [muted]);

  /* ── Init level ── */
  const initLevel = useCallback((idx) => {
    const l = LEVELS[idx];
    setLevelIdx(idx);
    setLeftBank(l.items.map(it => it.id));
    setRightBank([]);
    setRaftItems([]);
    setRaftSide('left');
    setSelected([]);
    setMoves(0);
    setConflictMsg('');
    setRaftAnim(0);
    setPhase('playing');
    setGameStartTime(Date.now());
    setCompletionData(null);
  }, []);

  /* ── Timer ── */
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            play('lose');
            const { score: s, moves: m, levelIdx: li } = playingStateRef.current;
            setCompletionData({
              score: s,
              isVictory: false,
              isLevelWin: false,
              levelIdx: li,
              moves: m,
              timeElapsed: TIME_LIMIT,
            });
            setPhase('finished');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, play]);

  /* ── Water Animation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let running = true;

    const draw = () => {
      if (!running) return;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      waveOffset.current += 0.02;

      // Draw water
      const waterColors = lvl.water;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, waterColors[0]);
      grad.addColorStop(1, waterColors[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Waves
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        const amp = 6 + layer * 3;
        const freq = 0.015 + layer * 0.005;
        const speed = waveOffset.current * (1 + layer * 0.3);
        const yBase = h * 0.15 + layer * (h * 0.25);
        for (let x = 0; x <= w; x += 2) {
          const y = yBase + Math.sin(x * freq + speed) * amp + Math.sin(x * freq * 2.3 + speed * 1.5) * (amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${0.03 + layer * 0.02})`;
        ctx.fill();
      }

      // Sparkles
      for (let i = 0; i < 8; i++) {
        const sx = (Math.sin(waveOffset.current * 0.7 + i * 2.3) * 0.5 + 0.5) * w;
        const sy = (Math.sin(waveOffset.current * 0.5 + i * 3.1) * 0.5 + 0.5) * h;
        const sparkAlpha = Math.sin(waveOffset.current * 2 + i) * 0.3 + 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${sparkAlpha})`;
        ctx.fill();
      }

      // Bubbles
      for (let i = 0; i < 5; i++) {
        const bx = (i * 237 + waveOffset.current * 20) % w;
        const by = h - ((waveOffset.current * 30 + i * 87) % h);
        const br = 2 + Math.sin(i + waveOffset.current) * 1;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [lvl]);

  /* ── Conflict Check ── */
  const checkConflicts = useCallback((bank, guardians) => {
    for (const c of lvl.conflicts) {
      const aIn = bank.includes(c.a);
      const bIn = bank.includes(c.b);
      if (aIn && bIn) {
        // If conflict has a guard requirement, check if guard is present
        if (c.guard) {
          if (!bank.includes(c.guard)) return c.msg;
        } else {
          // The required person (farmer/explorer/guard) is the guardian
          const req = lvl.items.find(it => it.required);
          if (req && !bank.includes(req.id)) return c.msg;
        }
      }
    }
    return null;
  }, [lvl]);

  /* ── Select item on bank ── */
  const toggleSelect = (itemId) => {
    if (phase !== 'playing' || raftSide === 'moving') return;
    const currentBank = raftSide === 'left' ? leftBank : rightBank;
    if (!currentBank.includes(itemId)) return;

    if (selected.includes(itemId)) {
      setSelected(s => s.filter(x => x !== itemId));
      play('deselect');
    } else {
      if (selected.length >= lvl.raftCapacity) return;
      // Ensure required person is on raft
      const req = lvl.items.find(it => it.required);
      if (req && selected.length === 0 && itemId !== req.id && currentBank.includes(req.id)) {
        // Auto-select required person first
        setSelected([req.id, itemId]);
        play('select');
        return;
      }
      setSelected(s => [...s, itemId]);
      play('select');
    }
  };

  /* ── Sail ── */
  const sail = () => {
    if (phase !== 'playing' || raftSide === 'moving') return;
    if (selected.length === 0) return;
    const req = lvl.items.find(it => it.required);
    if (req && !selected.includes(req.id)) return;

    play('sail');

    // Remove from current bank
    const fromBank = raftSide === 'left' ? [...leftBank] : [...rightBank];
    const newFrom = fromBank.filter(x => !selected.includes(x));
    
    // Check conflicts on departing bank
    const conflict = checkConflicts(newFrom);
    if (conflict) {
      setConflictMsg(conflict);
      setPhase('conflict');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      play('conflict');
      return;
    }

    // Animate raft
    setRaftSide('moving');
    setRaftItems([...selected]);
    if (raftSide === 'left') setLeftBank(newFrom); else setRightBank(newFrom);

    const targetSide = raftSide === 'left' ? 'right' : 'left';
    let progress = 0;
    const animInterval = setInterval(() => {
      progress += 0.025;
      setRaftAnim(raftSide === 'left' ? progress : 1 - progress);
      if (progress >= 1) {
        clearInterval(animInterval);
        play('splash');
        // Add to target bank
        const toBank = targetSide === 'left' ? [...leftBank] : [...rightBank];
        // Need fresh state
        if (targetSide === 'right') {
          setRightBank(rb => [...rb, ...selected]);
        } else {
          setLeftBank(lb => [...lb, ...selected]);
        }
        setRaftItems([]);
        setRaftSide(targetSide);
        setSelected([]);
        setMoves(m => m + 1);

        // Check win
        setTimeout(() => {
          setRightBank(rb => {
            if (rb.length === lvl.items.length) {
              const timeBonus = Math.floor((timer / TIME_LIMIT) * POINTS_PER_LEVEL * 0.5);
              const moveBonus = Math.max(0, POINTS_PER_LEVEL * 0.5 - (moves + 1) * 2);
              const pts = Math.min(Math.floor(timeBonus + moveBonus), POINTS_PER_LEVEL);
              const isLastLevel = levelIdx >= LEVELS.length - 1;
              const timeElapsed = TIME_LIMIT - (timer - 1 >= 0 ? timer - 1 : 0);
              setScore(s => {
                const newScore = Math.min(s + pts, MAX_SCORE);
                setCompletionData({
                  score: newScore,
                  isVictory: true,
                  isLevelWin: !isLastLevel,
                  levelIdx,
                  moves: moves + 1,
                  timeElapsed: timeElapsed || TIME_LIMIT - timer,
                });
                setPhase('finished');
                return newScore;
              });
              play('levelup');
              if (isLastLevel) play('win');
            }
            return rb;
          });
        }, 100);
      }
    }, 16);
  };

  /* ── Retry after conflict ── */
  const retryLevel = () => {
    initLevel(levelIdx);
  };

  const nextLevel = () => {
    initLevel(levelIdx + 1);
  };

  const startGame = (selectedIdx) => {
    setScore(0);
    setTimer(TIME_LIMIT);
    initLevel(selectedIdx ?? menuLevelIdx);
  };

  const goMenu = () => {
    setPhase('menu');
    setCompletionData(null);
    clearInterval(timerRef.current);
  };

  const handleCloseModal = () => {
    if (completionData?.isLevelWin) {
      setCompletionData(null);
      setPhase('playing');
      initLevel(levelIdx + 1);
    } else {
      goMenu();
    }
  };

  /* ── Format time ── */
  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  /* ── Stars ── */
  const getStars = (sc) => sc >= 180 ? 3 : sc >= 120 ? 2 : sc > 0 ? 1 : 0;

  /* ── Find item data ── */
  const getItem = (id) => lvl.items.find(it => it.id === id);

  /* ── Styles ── */
  const S = {
    full: {
      position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: `linear-gradient(180deg, ${lvl.sky[0]}, ${lvl.sky[1]})`,
      color: '#fff', userSelect: 'none',
    },
    menu: {
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a1628, #1a3a6a, #0d2818)',
      color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif", userSelect: 'none', padding: '1rem',
    },
    glass: {
      background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px',
    },
    btn: {
      padding: '12px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer',
      fontWeight: 700, fontSize: 'clamp(0.85rem, 2vw, 1rem)', transition: 'all 0.2s',
      background: 'linear-gradient(135deg, #4fc3f7, #0288d1)', color: '#fff',
      boxShadow: '0 4px 15px rgba(2,136,209,0.4)',
    },
    btnDanger: {
      background: 'linear-gradient(135deg, #ef5350, #c62828)',
      boxShadow: '0 4px 15px rgba(198,40,40,0.4)',
    },
    btnSuccess: {
      background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
      boxShadow: '0 4px 15px rgba(46,125,50,0.4)',
    },
    itemCircle: (isSelected, isOnRaft) => ({
      width: 'clamp(50px, 14vw, 80px)', height: 'clamp(50px, 14vw, 80px)',
      borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.3s',
      background: isSelected ? 'rgba(76,175,80,0.4)' : isOnRaft ? 'rgba(255,193,7,0.3)' : 'rgba(255,255,255,0.1)',
      border: isSelected ? '3px solid #4caf50' : isOnRaft ? '3px solid #ffc107' : '2px solid rgba(255,255,255,0.2)',
      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
      boxShadow: isSelected ? '0 0 20px rgba(76,175,80,0.5)' : 'none',
    }),
  };

  /* ════════ MENU ════════ */
  if (phase === 'menu') {
    const availableLevels = isDailyGame && dailyGameLevel !== null ? [LEVELS[dailyGameLevel]] : LEVELS;
    const levelIndices = isDailyGame && dailyGameLevel !== null ? [dailyGameLevel] : [0, 1, 2];

    if (checkingDailyGame) {
      return (
        <div style={S.menu}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚣</div>
          <div style={{ opacity: 0.8 }}>Loading...</div>
        </div>
      );
    }

    return (
      <div style={S.menu}>
        <button
          onClick={() => setShowInstructions(true)}
          style={{
            position: 'absolute', top: 20, right: 20, zIndex: 10,
            padding: '10px 20px', background: 'rgba(79,195,247,0.2)', border: '2px solid rgba(79,195,247,0.5)',
            borderRadius: 10, color: '#81d4fa', cursor: 'pointer', fontSize: 14, fontWeight: 700,
          }}
        >
          📖 How to Play
        </button>

        {showInstructions && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowInstructions(false)}>
            <div style={{ background: 'linear-gradient(180deg, #0a1628, #1a3a6a)', border: '2px solid #4fc3f7', borderRadius: 20, padding: 28, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', color: '#fff' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowInstructions(false)} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>×</button>
              <h2 style={{ marginTop: 0, color: '#4fc3f7' }}>🚣 How to Play River Crossing</h2>
              <h3 style={{ fontSize: 16, color: '#81d4fa' }}>Objective</h3>
              <p>Get everyone and everything from the left bank to the right bank using the raft. Never leave conflicting items alone together without the guardian!</p>
              <h3 style={{ fontSize: 16, color: '#81d4fa' }}>Rules</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>Select items on the current bank (click them). The raft holds the driver + one or more items.</li>
                <li>You must take the required person (Farmer / Explorer / Guard) on the raft to row it.</li>
                <li>Click &quot;Sail Right&quot; or &quot;Sail Left&quot; to cross. When you leave a bank, no conflicting pair can be left alone (e.g. Fox + Chicken without Farmer).</li>
                <li>If you break a rule, a conflict occurs and you must retry the level.</li>
              </ul>
              <h3 style={{ fontSize: 16, color: '#81d4fa' }}>Scoring</h3>
              <p>Score up to 200 points across 3 levels. Finish in fewer moves and with time left for bonus points.</p>
            </div>
          </div>
        )}

        <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '0.3rem' }}>🚣</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 900, margin: 0,
          background: 'linear-gradient(135deg, #4fc3f7, #81d4fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          River Crossing
        </h1>
        <p style={{ opacity: 0.7, margin: '0.3rem 0 0.5rem', fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>Challenge</p>
        {isDailyGame && (
          <div style={{ marginBottom: '1rem', padding: '6px 16px', background: 'rgba(79,195,247,0.2)', border: '1px solid rgba(79,195,247,0.4)', borderRadius: 20, fontSize: 13, color: '#81d4fa', fontWeight: 600 }}>
            🎯 Daily Challenge
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', maxWidth: '380px' }}>
          {availableLevels.map((l, i) => {
            const idx = levelIndices[i];
            const isSelected = menuLevelIdx === idx;
            return (
              <div
                key={l.id}
                style={{
                  ...S.glass,
                  padding: 'clamp(12px, 3vw, 20px)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  border: isSelected ? '2px solid #4fc3f7' : undefined,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
                onClick={() => setMenuLevelIdx(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{l.items[0].emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)' }}>Level {l.id}: {l.name}</div>
                    <div style={{ opacity: 0.6, fontSize: 'clamp(0.7rem, 2vw, 0.85rem)' }}>{l.subtitle}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button style={{ ...S.btn, marginTop: '1.5rem', fontSize: 'clamp(1rem, 3vw, 1.2rem)', padding: '14px 48px' }}
          onClick={() => startGame()}>
          🚀 Start Game
        </button>

        {onBack && (
          <button style={{ ...S.btn, marginTop: '0.8rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={onBack}>
            ← Back
          </button>
        )}
      </div>
    );
  }

  /* ════════ CONFLICT ════════ */
  if (phase === 'conflict') {
    return (
      <div style={{ ...S.menu, background: 'linear-gradient(180deg, #1a0000, #4a0000)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 1s infinite' }}>💥</div>
        <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', margin: '0 0 0.5rem', color: '#ff5252' }}>Conflict!</h2>
        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', opacity: 0.9, textAlign: 'center', maxWidth: '300px' }}>{conflictMsg}</p>
        <button style={{ ...S.btnDanger, ...S.btn, marginTop: '1.5rem' }} onClick={retryLevel}>🔄 Retry Level</button>
        <button style={{ ...S.btn, marginTop: '0.8rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }} onClick={goMenu}>Menu</button>
        <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }`}</style>
      </div>
    );
  }

  /* ════════ PLAYING (or finished: show game + completion modal) ════════ */
  const currentBank = raftSide === 'left' ? leftBank : rightBank;
  const reqItem = lvl.items.find(it => it.required);
  const canSail = phase === 'playing' && selected.length > 0 && (!reqItem || selected.includes(reqItem.id));
  const raftX = raftSide === 'moving' ? raftAnim : (raftSide === 'left' ? 0 : 1);
  const timeElapsed = completionData?.timeElapsed ?? (gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0);
  const difficultyLabel = completionData?.levelIdx === 0 ? 'Easy' : completionData?.levelIdx === 1 ? 'Moderate' : 'Hard';

  return (
    <>
    <div style={{ ...S.full, display: 'flex', flexDirection: 'column', animation: shake ? 'shakeAnim 0.4s' : 'none' }}>
      <style>{`
        @keyframes shakeAnim { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        @keyframes bobFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ripple { 0%{transform:scale(0);opacity:0.6} 100%{transform:scale(3);opacity:0} }
      `}</style>

      {/* ── HUD ── */}
      <div style={{ ...S.glass, margin: 'clamp(6px,1.5vw,12px)', padding: 'clamp(8px,2vw,14px)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 'clamp(8px,2vw,16px)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 'clamp(0.75rem,2vw,0.95rem)' }}>
            Lv.{levelIdx + 1} {lvl.name}
          </span>
          <span style={{ fontSize: 'clamp(0.75rem,2vw,0.9rem)' }}>⏱ {fmt(timer)}</span>
          <span style={{ fontSize: 'clamp(0.75rem,2vw,0.9rem)' }}>🎯 {score}/{MAX_SCORE}</span>
          <span style={{ fontSize: 'clamp(0.75rem,2vw,0.9rem)' }}>📊 Moves: {moves}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setMuted(!muted)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={goMenu} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', opacity: 0.7 }}>
            ☰
          </button>
        </div>
      </div>

      {/* ── Rules hint ── */}
      <div style={{ textAlign: 'center', fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)', opacity: 0.6, padding: '0 1rem', lineHeight: 1.3 }}>
        {lvl.desc}
      </div>

      {/* ── GAME AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', position: 'relative', minHeight: 0 }}>

        {/* Left Bank */}
        <div style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 'clamp(6px,1.5vw,12px)', padding: 'clamp(4px,1vw,12px)', zIndex: 5,
          background: `linear-gradient(180deg, ${lvl.bg[0]}, ${lvl.bg[1]})`,
          borderRight: '3px solid rgba(139,119,42,0.4)',
        }}>
          <div style={{ fontSize: 'clamp(0.65rem,1.8vw,0.8rem)', fontWeight: 700, opacity: 0.7, marginBottom: '0.3rem' }}>
            🏕️ Left Bank
          </div>
          {leftBank.map(id => {
            const it = getItem(id);
            const isSel = selected.includes(id) && raftSide === 'left';
            return (
              <div key={id} style={S.itemCircle(isSel, false)} onClick={() => raftSide === 'left' && toggleSelect(id)}>
                <span style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)' }}>{it.emoji}</span>
                <span style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)', opacity: 0.8 }}>{it.label}</span>
              </div>
            );
          })}
        </div>

        {/* River */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

          {/* Raft */}
          <div style={{
            position: 'absolute', bottom: '30%',
            left: `${5 + raftX * 60}%`,
            transition: raftSide === 'moving' ? 'none' : 'left 0.3s',
            animation: 'bobFloat 2s ease-in-out infinite',
            zIndex: 5,
          }}>
            {/* Raft body */}
            <div style={{
              width: 'clamp(60px,18vw,120px)', height: 'clamp(35px,8vw,55px)',
              background: 'linear-gradient(180deg, #8d6e63, #5d4037)',
              borderRadius: '8px 8px 30% 30%',
              border: '2px solid #4e342e',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
              position: 'relative',
            }}>
              {/* Raft planks */}
              {[0,1,2].map(i => (
                <div key={i} style={{ position: 'absolute', top: i * 33 + '%', left: 0, right: 0, height: '2px', background: 'rgba(0,0,0,0.15)' }} />
              ))}
              {raftItems.map(id => {
                const it = getItem(id);
                return <span key={id} style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>{it?.emoji}</span>;
              })}
              {raftItems.length === 0 && <span style={{ fontSize: 'clamp(0.9rem,2.5vw,1.3rem)' }}>🚣</span>}
            </div>

            {/* Water ripples */}
            <div style={{
              position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
              width: 'clamp(80px,22vw,140px)', height: '12px',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
            }} />
          </div>

          {/* Fish swimming */}
          {[0,1,2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              top: `${50 + i * 15}%`,
              left: `${(Date.now() / (30 + i * 10) + i * 200) % 110 - 5}%`,
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              opacity: 0.4,
              transform: 'scaleX(-1)',
              transition: 'left 0.5s linear',
            }}>
              🐟
            </div>
          ))}
        </div>

        {/* Right Bank */}
        <div style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 'clamp(6px,1.5vw,12px)', padding: 'clamp(4px,1vw,12px)', zIndex: 5,
          background: `linear-gradient(180deg, ${lvl.bg[0]}, ${lvl.bg[1]})`,
          borderLeft: '3px solid rgba(139,119,42,0.4)',
        }}>
          <div style={{ fontSize: 'clamp(0.65rem,1.8vw,0.8rem)', fontWeight: 700, opacity: 0.7, marginBottom: '0.3rem' }}>
            🏰 Right Bank
          </div>
          {rightBank.map(id => {
            const it = getItem(id);
            const isSel = selected.includes(id) && raftSide === 'right';
            return (
              <div key={id} style={S.itemCircle(isSel, false)} onClick={() => raftSide === 'right' && toggleSelect(id)}>
                <span style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)' }}>{it.emoji}</span>
                <span style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)', opacity: 0.8 }}>{it.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ ...S.glass, margin: 'clamp(6px,1.5vw,12px)', marginTop: 0, padding: 'clamp(10px,2vw,16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px,2vw,16px)', flexWrap: 'wrap', zIndex: 10 }}>
        <div style={{ fontSize: 'clamp(0.7rem,2vw,0.85rem)', opacity: 0.7 }}>
          Selected: {selected.map(id => getItem(id)?.emoji).join(' ') || 'None'}
        </div>
        <button style={{ ...S.btn, opacity: canSail ? 1 : 0.4, pointerEvents: canSail ? 'auto' : 'none',
          padding: 'clamp(8px,2vw,12px) clamp(16px,4vw,32px)' }}
          onClick={sail}>
          {raftSide === 'left' ? '→ Sail Right' : '← Sail Left'}
        </button>
        <button style={{ ...S.btn, background: 'rgba(255,255,255,0.1)', boxShadow: 'none', fontSize: 'clamp(0.75rem,2vw,0.85rem)' }}
          onClick={retryLevel}>
          🔄 Reset
        </button>
      </div>
    </div>

    <GameCompletionModal
      isVisible={phase === 'finished' && completionData != null}
      onClose={handleCloseModal}
      gameTitle="River Crossing"
      score={completionData?.score ?? score}
      moves={completionData?.moves ?? moves}
      timeElapsed={timeElapsed}
      gameTimeLimit={TIME_LIMIT}
      isVictory={completionData?.isVictory ?? false}
      difficulty={difficultyLabel}
      customMessages={{
        perfectScore: 180,
        goodScore: 120,
        maxScore: MAX_SCORE,
        stats: `📊 Moves: ${completionData?.moves ?? moves} • ⏱ Time: ${Math.floor((completionData?.timeElapsed ?? timeElapsed) / 60)}:${((completionData?.timeElapsed ?? timeElapsed) % 60).toString().padStart(2, '0')}`,
      }}
    />
    </>
  );
}
