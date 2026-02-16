import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

// ─── COUNTRY DATA ───────────────────────────────────────────────────
const COUNTRIES = [
  {
    name: 'Japan', flag: '🇯🇵',
    clues: [
      { emoji: '🍣', label: 'Sushi' },
      { emoji: '🎎', label: 'Kokeshi Doll' },
      { emoji: '🏯', label: 'Castle Model' },
      { emoji: '👘', label: 'Kimono Fabric' },
      { emoji: '🍵', label: 'Matcha Tin' },
      { emoji: '⛩️', label: 'Torii Charm' },
    ],
  },
  {
    name: 'Italy', flag: '🇮🇹',
    clues: [
      { emoji: '🍕', label: 'Pizza Box' },
      { emoji: '🍝', label: 'Pasta Pack' },
      { emoji: '🏛️', label: 'Colosseum Figure' },
      { emoji: '🍷', label: 'Chianti Bottle' },
      { emoji: '🎭', label: 'Venice Mask' },
      { emoji: '☕', label: 'Espresso Maker' },
    ],
  },
  {
    name: 'Mexico', flag: '🇲🇽',
    clues: [
      { emoji: '🌮', label: 'Tacos' },
      { emoji: '🪇', label: 'Maracas' },
      { emoji: '💀', label: 'Sugar Skull' },
      { emoji: '🌵', label: 'Cactus Plant' },
      { emoji: '🫔', label: 'Tamales' },
      { emoji: '🎸', label: 'Guitarrón' },
    ],
  },
  {
    name: 'France', flag: '🇫🇷',
    clues: [
      { emoji: '🥐', label: 'Croissant' },
      { emoji: '🗼', label: 'Eiffel Keychain' },
      { emoji: '🧀', label: 'Camembert' },
      { emoji: '🍾', label: 'Champagne' },
      { emoji: '👨‍🍳', label: 'Chef Hat' },
      { emoji: '🥖', label: 'Baguette' },
    ],
  },
  {
    name: 'India', flag: '🇮🇳',
    clues: [
      { emoji: '🍛', label: 'Curry Bowl' },
      { emoji: '🪔', label: 'Diya Lamp' },
      { emoji: '🐘', label: 'Elephant Figure' },
      { emoji: '🧘', label: 'Yoga Mat' },
      { emoji: '💎', label: 'Gemstone' },
      { emoji: '🫖', label: 'Chai Set' },
    ],
  },
  {
    name: 'Brazil', flag: '🇧🇷',
    clues: [
      { emoji: '⚽', label: 'Football' },
      { emoji: '☕', label: 'Coffee Beans' },
      { emoji: '🦜', label: 'Macaw Toy' },
      { emoji: '🎭', label: 'Carnival Mask' },
      { emoji: '🩴', label: 'Havaianas' },
      { emoji: '🥁', label: 'Samba Drum' },
    ],
  },
  {
    name: 'Egypt', flag: '🇪🇬',
    clues: [
      { emoji: '🐪', label: 'Camel Figure' },
      { emoji: '🏺', label: 'Ancient Vase' },
      { emoji: '📜', label: 'Papyrus Scroll' },
      { emoji: '🔺', label: 'Pyramid Model' },
      { emoji: '🐈', label: 'Cat Statue' },
      { emoji: '👁️', label: 'Eye of Horus' },
    ],
  },
  {
    name: 'China', flag: '🇨🇳',
    clues: [
      { emoji: '🐉', label: 'Dragon Figure' },
      { emoji: '🥟', label: 'Dumplings' },
      { emoji: '🧧', label: 'Red Envelope' },
      { emoji: '🏮', label: 'Lantern' },
      { emoji: '🍜', label: 'Noodle Bowl' },
      { emoji: '🎋', label: 'Bamboo Fan' },
    ],
  },
  {
    name: 'Germany', flag: '🇩🇪',
    clues: [
      { emoji: '🍺', label: 'Beer Stein' },
      { emoji: '🥨', label: 'Pretzel' },
      { emoji: '🏰', label: 'Castle Snow Globe' },
      { emoji: '🌭', label: 'Bratwurst' },
      { emoji: '⚙️', label: 'Engineering Kit' },
      { emoji: '🎄', label: 'Nutcracker' },
    ],
  },
  {
    name: 'Australia', flag: '🇦🇺',
    clues: [
      { emoji: '🦘', label: 'Kangaroo Toy' },
      { emoji: '🪃', label: 'Boomerang' },
      { emoji: '🐨', label: 'Koala Plush' },
      { emoji: '🏄', label: 'Surfboard Charm' },
      { emoji: '🦎', label: 'Lizard Figure' },
      { emoji: '🍯', label: 'Eucalyptus Honey' },
    ],
  },
  {
    name: 'Russia', flag: '🇷🇺',
    clues: [
      { emoji: '🪆', label: 'Matryoshka' },
      { emoji: '🧣', label: 'Ushanka Hat' },
      { emoji: '🍵', label: 'Samovar Tea' },
      { emoji: '🐻', label: 'Bear Figure' },
      { emoji: '🩰', label: 'Ballet Shoes' },
      { emoji: '🪗', label: 'Accordion' },
    ],
  },
  {
    name: 'South Korea', flag: '🇰🇷',
    clues: [
      { emoji: '🍜', label: 'Ramyeon' },
      { emoji: '🎤', label: 'K-Pop Mic' },
      { emoji: '🥢', label: 'Metal Chopsticks' },
      { emoji: '🧴', label: 'Skincare Set' },
      { emoji: '🥬', label: 'Kimchi Jar' },
      { emoji: '🎮', label: 'Gaming Gear' },
    ],
  },
  {
    name: 'Turkey', flag: '🇹🇷',
    clues: [
      { emoji: '🧿', label: 'Evil Eye' },
      { emoji: '🫖', label: 'Turkish Tea Set' },
      { emoji: '🍬', label: 'Turkish Delight' },
      { emoji: '🧶', label: 'Carpet Sample' },
      { emoji: '🏺', label: 'Ceramic Pot' },
      { emoji: '☕', label: 'Turkish Coffee' },
    ],
  },
  {
    name: 'Greece', flag: '🇬🇷',
    clues: [
      { emoji: '🫒', label: 'Olive Oil' },
      { emoji: '🏛️', label: 'Parthenon Model' },
      { emoji: '🧀', label: 'Feta Cheese' },
      { emoji: '🐙', label: 'Octopus Figure' },
      { emoji: '🍯', label: 'Thyme Honey' },
      { emoji: '🏺', label: 'Greek Amphora' },
    ],
  },
  {
    name: 'Thailand', flag: '🇹🇭',
    clues: [
      { emoji: '🍜', label: 'Pad Thai Kit' },
      { emoji: '🐘', label: 'Elephant Carving' },
      { emoji: '🌺', label: 'Orchid' },
      { emoji: '🛕', label: 'Temple Figure' },
      { emoji: '🥊', label: 'Muay Thai Gloves' },
      { emoji: '🍋', label: 'Lemongrass' },
    ],
  },
  {
    name: 'Spain', flag: '🇪🇸',
    clues: [
      { emoji: '💃', label: 'Flamenco Fan' },
      { emoji: '🐂', label: 'Bull Figure' },
      { emoji: '🍊', label: 'Oranges' },
      { emoji: '🥘', label: 'Paella Pan' },
      { emoji: '🎸', label: 'Spanish Guitar' },
      { emoji: '🫒', label: 'Olive Jar' },
    ],
  },
  {
    name: 'Canada', flag: '🇨🇦',
    clues: [
      { emoji: '🍁', label: 'Maple Leaf Pin' },
      { emoji: '🧴', label: 'Maple Syrup' },
      { emoji: '🏒', label: 'Hockey Stick' },
      { emoji: '🫎', label: 'Moose Figure' },
      { emoji: '🧣', label: 'Plaid Scarf' },
      { emoji: '🥞', label: 'Pancake Mix' },
    ],
  },
  {
    name: 'Morocco', flag: '🇲🇦',
    clues: [
      { emoji: '🫖', label: 'Mint Tea Pot' },
      { emoji: '🧶', label: 'Berber Rug' },
      { emoji: '🌶️', label: 'Harissa Paste' },
      { emoji: '🏺', label: 'Tagine Pot' },
      { emoji: '🧴', label: 'Argan Oil' },
      { emoji: '🌹', label: 'Rose Water' },
    ],
  },
];

// ─── LEVEL CONFIGS ──────────────────────────────────────────────────
const LEVELS = {
  Easy: { label: 'Easy', rounds: 8, choices: 3, clueCount: 4, timeLimit: 120, pointsPerRound: 25, color: '#4ade80' },
  Moderate: { label: 'Moderate', rounds: 10, choices: 4, clueCount: 3, timeLimit: 100, pointsPerRound: 20, color: '#facc15' },
  Hard: { label: 'Hard', rounds: 12, choices: 5, clueCount: 2, timeLimit: 90, pointsPerRound: 17, color: '#f87171' },
};

// ─── AUDIO ENGINE ───────────────────────────────────────────────────
function createAudioEngine() {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  const playTone = (freq, dur, type = 'sine', vol = 0.15) => {
    try {
      const c = getCtx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g).connect(c.destination);
      o.start(); o.stop(c.currentTime + dur);
    } catch {}
  };

  return {
    correct: () => { playTone(523, 0.1); setTimeout(() => playTone(659, 0.1), 100); setTimeout(() => playTone(784, 0.2), 200); },
    wrong: () => { playTone(200, 0.3, 'sawtooth', 0.1); },
    stamp: () => { playTone(80, 0.08, 'square', 0.2); setTimeout(() => playTone(120, 0.05, 'square', 0.15), 60); },
    reveal: () => { playTone(440, 0.15, 'triangle', 0.1); setTimeout(() => playTone(550, 0.15, 'triangle', 0.1), 120); },
    tick: () => playTone(1000, 0.03, 'sine', 0.05),
    levelStart: () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.15, 'sine', 0.1), i*100)); },
    bgLoop: null,
    startBg: function() {
      if (this.bgLoop) return;
      const c = getCtx();
      const play = () => {
        const notes = [261,293,329,349,392,349,329,293];
        notes.forEach((f,i) => {
          setTimeout(() => playTone(f, 0.4, 'triangle', 0.03), i * 500);
        });
      };
      play();
      this.bgLoop = setInterval(play, 4000);
    },
    stopBg: function() {
      if (this.bgLoop) { clearInterval(this.bgLoop); this.bgLoop = null; }
    },
  };
}

// ─── SHUFFLE ────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function BorderlineBrains() {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [screen, setScreen] = useState('menu');
  const [level, setLevel] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS.Easy.timeLimit);
  const [phase, setPhase] = useState('inspect'); // inspect | result | summary
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState([]);
  const [conveyorAnim, setConveyorAnim] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Update timeLeft when difficulty changes (for ready screen display)
  useEffect(() => {
    if (gameState === 'ready') {
      setTimeLeft(LEVELS[difficulty].timeLimit);
    }
  }, [difficulty, gameState]);

  // ── Canvas background ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 3 + 1, a: Math.random() * 0.3 + 0.1,
      });
    }

    const draw = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // grid lines
      ctx.strokeStyle = 'rgba(59,130,246,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,192,255,${p.a})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // ── Timer ──
  useEffect(() => {
    if (gameState !== 'playing' || phase !== 'inspect') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        if (t <= 11) audioRef.current?.tick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, phase, currentRound]);

  // ── Audio init ──
  useEffect(() => {
    audioRef.current = createAudioEngine();
    return () => audioRef.current?.stopBg();
  }, []);

  // ── Generate rounds ──
  const generateRounds = useCallback((lvl) => {
    const config = LEVELS[lvl];
    const pool = shuffle(COUNTRIES);
    const r = [];
    for (let i = 0; i < config.rounds; i++) {
      const correct = pool[i % pool.length];
      const clues = shuffle(correct.clues).slice(0, config.clueCount);
      const wrongPool = shuffle(COUNTRIES.filter(c => c.name !== correct.name));
      const choices = shuffle([correct, ...wrongPool.slice(0, config.choices - 1)]);
      r.push({ correct, clues, choices });
    }
    return r;
  }, []);

  const startLevel = (lvl) => {
    const config = LEVELS[lvl];
    const r = generateRounds(lvl);
    setLevel(lvl);
    setRounds(r);
    setCurrentRound(0);
    setScore(0);
    setTimeLeft(config.timeLimit);
    setPhase('inspect');
    setSelectedAnswer(null);
    setCombo(0);
    setStreak(0);
    setResults([]);
    setCorrectCount(0);
    setWrongCount(0);
    setScreen('game');
    setGameState('playing');
    setConveyorAnim(true);
    audioRef.current?.levelStart();
    audioRef.current?.startBg();
  };

  const handleStart = useCallback(() => {
    startLevel(difficulty);
  }, [difficulty]);

  const handleReset = useCallback(() => {
    audioRef.current?.stopBg();
    clearInterval(timerRef.current);
    setGameState('ready');
    setScreen('menu');
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(0);
    setCurrentRound(0);
    setCombo(0);
    setStreak(0);
    setResults([]);
  }, []);

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    setPhase('summary');
    setGameState('finished');
    audioRef.current?.stopBg();
  }, []);

  const handleAnswer = (country) => {
    if (phase !== 'inspect') return;
    clearInterval(timerRef.current);
    audioRef.current?.stamp();

    const round = rounds[currentRound];
    const isCorrect = country.name === round.correct.name;
    const config = LEVELS[level];

    let earned = 0;
    let newCombo = combo;
    let newStreak = streak;
    if (isCorrect) {
      newCombo = combo + 1;
      newStreak = streak + 1;
      const multiplier = newCombo >= 3 ? 1.5 : 1;
      earned = Math.min(Math.round(config.pointsPerRound * multiplier), 200 - score);
      setCorrectCount(c => c + 1);
      audioRef.current?.correct();
    } else {
      newCombo = 0;
      setWrongCount(c => c + 1);
      audioRef.current?.wrong();
    }

    const newScore = Math.min(score + earned, 200);
    setScore(newScore);
    setCombo(newCombo);
    setStreak(newStreak);
    setSelectedAnswer(country.name);
    setResults(prev => [...prev, { round: currentRound, correct: isCorrect, answer: country.name, expected: round.correct.name }]);
    setPhase('result');

    setTimeout(() => {
      if (currentRound + 1 >= config.rounds || newScore >= 200) {
        setScore(newScore);
        endGame();
      } else {
        setCurrentRound(currentRound + 1);
        setSelectedAnswer(null);
        setPhase('inspect');
        setConveyorAnim(true);
        audioRef.current?.reveal();
      }
    }, 1800);
  };

  const backToMenu = () => {
    audioRef.current?.stopBg();
    clearInterval(timerRef.current);
    setScreen('menu');
    setGameState('ready');
  };

  // Check if game should end due to max score
  useEffect(() => {
    if (gameState === 'playing' && score >= 200) {
      endGame();
    }
  }, [gameState, score, endGame]);

  const accuracy = correctCount + wrongCount > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
    : 0;

  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          You're a customs officer! Examine travelers' belongings and identify their country of origin from visual clues.
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Inspect traveler's belongings</li>
          <li>• Analyze cultural clues</li>
          <li>• Select the correct country</li>
          <li>• Build combos for bonus points</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Correct answers earn points</li>
          <li>• 3+ combo = 1.5x multiplier</li>
          <li>• Reach 200 points to win</li>
          <li>• Time bonus for quick answers</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Strategy
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Study all clues carefully</li>
          <li>• Look for cultural patterns</li>
          <li>• Build streaks for multipliers</li>
          <li>• Higher difficulty = fewer clues</li>
        </ul>
      </div>
    </div>
  );

  // ─── RENDER ─────────────────────────────────────────────────────
  const config = level ? LEVELS[level] : LEVELS[difficulty];
  const round = rounds[currentRound];

  const playingContent = (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* ── GAME ── */}
        {round && phase !== 'summary' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* HUD */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px',
              background: 'rgba(15,23,42,0.85)', borderBottom: '1px solid rgba(59,130,246,0.2)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={backToMenu} style={{
                  background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)',
                  color: '#f87171', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
                }}>✕ Exit</button>
                <span style={{ color: '#64748b', fontSize: 13 }}>
                  {LEVELS[level].label.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Round</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0' }}>{currentRound + 1}/{config.rounds}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Score</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>{score}/200</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Time</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: timeLeft <= 15 ? '#f87171' : '#34d399' }}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                </div>
                {combo >= 2 && (
                  <div style={{
                    background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)',
                    borderRadius: 8, padding: '4px 12px', color: '#fbbf24', fontWeight: 700, fontSize: 14,
                    animation: 'pulse 1s infinite',
                  }}>🔥 x{combo}</div>
                )}
              </div>
            </div>

            {/* MAIN AREA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '20px 24px', overflow: 'auto' }}>

              {/* Traveler card */}
              <div style={{
                background: 'rgba(30,41,59,0.9)', borderRadius: 20, padding: '28px 36px',
                border: '1px solid rgba(59,130,246,0.2)', maxWidth: 700, width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative',
              }}>
                {/* Stamp overlay for result */}
                {phase === 'result' && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-12deg)',
                    fontSize: 64, fontWeight: 900, color: selectedAnswer === round.correct.name ? '#22c55e' : '#ef4444',
                    opacity: 0.25, textTransform: 'uppercase', letterSpacing: 4, pointerEvents: 'none',
                    textShadow: `0 0 30px ${selectedAnswer === round.correct.name ? '#22c55e' : '#ef4444'}`,
                  }}>
                    {selectedAnswer === round.correct.name ? '✓ APPROVED' : '✕ DENIED'}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>🧳</span>
                  <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>
                    Traveler's Belongings — Inspection #{currentRound + 1}
                  </span>
                </div>

                {/* Conveyor belt */}
                <div style={{
                  display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
                  padding: '20px 0',
                }}>
                  {round.clues.map((clue, i) => (
                    <div key={i} style={{
                      background: 'rgba(15,23,42,0.8)', borderRadius: 16, padding: '20px 24px',
                      border: '1px solid rgba(59,130,246,0.15)', textAlign: 'center', minWidth: 110,
                      animation: conveyorAnim ? `slideIn 0.4s ease-out ${i * 0.12}s both` : 'none',
                      transition: 'transform 0.2s', cursor: 'default',
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                       onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      <div style={{ fontSize: 48, marginBottom: 8, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{clue.emoji}</div>
                      <div style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 500 }}>{clue.label}</div>
                    </div>
                  ))}
                </div>

                {phase === 'result' && selectedAnswer !== round.correct.name && (
                  <div style={{ textAlign: 'center', marginTop: 8, color: '#94a3b8', fontSize: 14 }}>
                    Correct answer: <strong style={{ color: '#22c55e' }}>{round.correct.flag} {round.correct.name}</strong>
                  </div>
                )}
              </div>

              {/* Choices */}
              <div style={{ maxWidth: 700, width: '100%' }}>
                <div style={{ color: '#64748b', fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, textAlign: 'center' }}>
                  {phase === 'inspect' ? '🛂 Identify the Country of Origin' : phase === 'result' && selectedAnswer === round.correct.name ? '✅ Correct!' : '❌ Wrong!'}
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth < 640 ? 'repeat(2, 1fr)' : `repeat(${Math.min(round.choices.length, 3)}, 1fr)`, 
                  gap: 12 
                }}>
                  {round.choices.map((country, i) => {
                    const isCorrect = country.name === round.correct.name;
                    const isSelected = country.name === selectedAnswer;
                    let bg = 'rgba(30,41,59,0.7)';
                    let border = 'rgba(59,130,246,0.2)';
                    let textColor = '#e2e8f0';
                    if (phase === 'result') {
                      if (isCorrect) { bg = 'rgba(34,197,94,0.2)'; border = '#22c55e'; }
                      else if (isSelected) { bg = 'rgba(239,68,68,0.2)'; border = '#ef4444'; }
                      else { bg = 'rgba(30,41,59,0.3)'; textColor = '#475569'; }
                    }
                    return (
                      <button key={i} onClick={() => handleAnswer(country)} disabled={phase !== 'inspect'}
                        style={{
                          padding: '18px 16px', borderRadius: 14, border: `2px solid ${border}`,
                          background: bg, color: textColor, fontSize: 'clamp(15px, 3vw, 17px)', fontWeight: 700,
                          cursor: phase === 'inspect' ? 'pointer' : 'default', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                          opacity: phase === 'result' && !isCorrect && !isSelected ? 0.4 : 1,
                          minHeight: 60,
                        }}
                        onMouseEnter={e => { if (phase === 'inspect') { e.target.style.background = 'rgba(59,130,246,0.15)'; e.target.style.borderColor = '#3b82f6'; e.target.style.transform = 'translateY(-2px)'; } }}
                        onMouseLeave={e => { if (phase === 'inspect') { e.target.style.background = bg; e.target.style.borderColor = border; e.target.style.transform = 'translateY(0)'; } }}>
                        <span style={{ fontSize: 'clamp(24px, 5vw, 28px)' }}>{country.flag}</span>
                        <span style={{ wordBreak: 'break-word', textAlign: 'center' }}>{country.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Borderline Brains"
      gameShortDescription="You're a customs officer! Examine travelers' belongings and identify their country of origin from visual clues."
      category="Logic"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeLeft}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{ correctCount, wrongCount, accuracy, combo, streak }}
      enableCompletionModal={true}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
}
