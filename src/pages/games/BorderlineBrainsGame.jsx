import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

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

const MAX_SCORE = 200;

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function BorderlineBrains({ onBack }) {
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
  const [appPhase, setAppPhase] = useState('menu'); // menu | playing | gameover
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(timeLeft);
  const location = useLocation();
  scoreRef.current = score;
  timeLeftRef.current = timeLeft;

  // Update timeLeft when difficulty changes (for ready screen display)
  useEffect(() => {
    if (gameState === 'ready') {
      setTimeLeft(LEVELS[difficulty].timeLimit);
    }
  }, [difficulty, gameState]);

  // Daily game check
  useEffect(() => {
    const check = async () => {
      try {
        setCheckingDailyGame(true);
        const res = await getDailySuggestions();
        const games = res?.data?.suggestion?.games || [];
        const pathname = location?.pathname || '';
        const normalizePath = (p = '') => (String(p).split('?')[0].split('#')[0].trim().replace(/\/+$/, '') || '/');
        const matched = games.find((g) => normalizePath(g?.gameId?.url) === normalizePath(pathname));
        if (matched?.difficulty) {
          const d = String(matched.difficulty).toLowerCase();
          const map = { easy: 'Easy', medium: 'Moderate', moderate: 'Moderate', hard: 'Hard' };
          if (map[d]) {
            setIsDailyGame(true);
            setDailyGameDifficulty(map[d]);
            setDifficulty(map[d]);
          } else {
            setIsDailyGame(false);
            setDailyGameDifficulty(null);
          }
        } else {
          setIsDailyGame(false);
          setDailyGameDifficulty(null);
        }
      } catch (e) {
        console.error('Daily check failed', e);
        setIsDailyGame(false);
        setDailyGameDifficulty(null);
      } finally {
        setCheckingDailyGame(false);
      }
    };
    check();
  }, [location?.pathname]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowInstructions(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    if (!config) return;
    setCompletionData(null);
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
    setAppPhase('playing');
    startTimeRef.current = Date.now();
    audioRef.current?.levelStart();
    audioRef.current?.startBg();
  };

  const handleStart = useCallback(() => {
    startLevel(difficulty);
  }, [difficulty]);

  const handleReset = useCallback(() => {
    audioRef.current?.stopBg();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCompletionData(null);
    setAppPhase('menu');
    setGameState('ready');
    setScreen('menu');
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(LEVELS.Easy.timeLimit);
    setCurrentRound(0);
    setCombo(0);
    setStreak(0);
    setResults([]);
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase('summary');
    setGameState('finished');
    audioRef.current?.stopBg();
    const config = level ? LEVELS[level] : LEVELS.Easy;
    const finalScore = scoreRef.current;
    const elapsed = config ? config.timeLimit - timeLeftRef.current : 0;
    const diffLower = level ? (level === 'Easy' ? 'easy' : level === 'Moderate' ? 'moderate' : 'hard') : 'easy';
    setCompletionData({
      score: finalScore,
      isVictory: finalScore >= MAX_SCORE,
      difficulty: diffLower,
      timeElapsed: elapsed,
    });
    setAppPhase('gameover');
  }, [level]);

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

  const backToMenu = handleReset;

  // Check if game should end due to max score
  useEffect(() => {
    if (gameState === 'playing' && score >= 200) {
      endGame();
    }
  }, [gameState, score, endGame]);

  const accuracy = correctCount + wrongCount > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
    : 0;

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, { label: LEVELS[dailyGameDifficulty].label }]].filter(([, c]) => c)
    : Object.entries(LEVELS).map(([k, v]) => [k, { label: v.label }]);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : difficulty;

  const tHowToPlay = useTranslateText('How to Play');
  const tGotIt = useTranslateText('Got it');
  const tDailyChallenge = useTranslateText('Daily Challenge');
  const tStartGame = useTranslateText('Start Game');
  const tGameTitle = useTranslateText('Borderline Brains');
  const tHowToPlayTitle = useTranslateText('Borderline Brains – How to Play');
  const tSubtitle = useTranslateText('Identify the country of origin from travelers\' belongings. Build combos for bonus points!');
  const tLevelLabels = { Easy: useTranslateText('Easy'), Moderate: useTranslateText('Moderate'), Hard: useTranslateText('Hard') };
  const tRound = useTranslateText('Round');
  const tScore = useTranslateText('Score');
  const tTime = useTranslateText('Time');
  const tExit = useTranslateText('Exit');
  const tUpTo = useTranslateText('Up to 200 pts · Time limit by difficulty');

  const tBorderlineBullet1 = useTranslateText("You're a customs officer! Examine travelers' belongings and identify their country of origin from visual clues.");
  const tBorderlineBullet2 = useTranslateText('Inspect the clues, analyze cultural patterns, and select the correct country. Build combos (3+) for a 1.5x point multiplier.');
  const tBorderlineBullet3 = useTranslateText('Correct answers earn points. Reach 200 points to win. Higher difficulty = fewer clues and less time.');

  const tTravelerBelongings = useTranslateText("Traveler's Belongings — Inspection");
  const tApproved = useTranslateText('✓ APPROVED');
  const tDenied = useTranslateText('✕ DENIED');
  const tCorrectAnswer = useTranslateText('Correct answer:');
  const tIdentifyCountry = useTranslateText('🛂 Identify the Country of Origin');
  const tCorrect = useTranslateText('✅ Correct!');
  const tWrong = useTranslateText('❌ Wrong!');

  const instructionsContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>{tHowToPlay}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, color: '#e2e8f0' }}>
        <li>{tBorderlineBullet1}</li>
        <li>{tBorderlineBullet2}</li>
        <li>{tBorderlineBullet3}</li>
      </ul>
    </>
  );

  // ─── RENDER ─────────────────────────────────────────────────────
  const config = level ? LEVELS[level] : LEVELS[difficulty];
  const round = rounds[currentRound];

  const playingContent = (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
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
                }}>✕ {tExit}</button>
                <span style={{ color: '#64748b', fontSize: 13 }}>
                  {LEVELS[level].label.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{tRound}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0' }}>{currentRound + 1}/{config.rounds}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{tScore}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>{score}/200</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{tTime}</div>
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
                    {selectedAnswer === round.correct.name ? tApproved : tDenied}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>🧳</span>
                  <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>
                    {tTravelerBelongings} #{currentRound + 1}
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
                    {tCorrectAnswer} <strong style={{ color: '#22c55e' }}>{round.correct.flag} {round.correct.name}</strong>
                  </div>
                )}
              </div>

              {/* Choices */}
              <div style={{ maxWidth: 700, width: '100%' }}>
                <div style={{ color: '#64748b', fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, textAlign: 'center' }}>
                  {phase === 'inspect' ? tIdentifyCountry : phase === 'result' && selectedAnswer === round.correct.name ? tCorrect : tWrong}
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

  const wrapperStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" };

  return (
    <div style={wrapperStyle}>
      {/* Header */}
      <div style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(59,130,246,0.2)' }}>
        <button
          onClick={appPhase === 'menu' ? (onBack ? () => onBack() : () => window.history.back()) : handleReset}
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
        >
          {appPhase === 'menu' ? '←' : '✕'}
        </button>
        <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 'clamp(1rem,4vw,1.3rem)' }}>🛂 {tGameTitle}</div>
        {appPhase === 'menu' ? (
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            aria-label="How to play"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(30,41,59,0.8)',
              color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ❓ {tHowToPlay}
          </button>
        ) : (
          <div style={{ color: timeLeft <= 15 ? '#f87171' : '#94a3b8', fontWeight: 700, fontSize: 'clamp(0.85rem,3vw,1.1rem)' }}>
            ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {appPhase === 'menu' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(99,102,241,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#818cf8' }}>🛂 {tHowToPlayTitle}</h2>
                  <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close"
                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>{instructionsContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <button type="button" onClick={() => setShowInstructions(false)}
                    style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>{tGotIt}</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ background: '#1e293b', borderRadius: 20, padding: '32px 24px', maxWidth: 420, width: '100%', textAlign: 'center', border: '2px solid #334155' }}>
            {isDailyGame && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>📅 {tDailyChallenge}</div>
            )}
            <div style={{ fontSize: 48, marginBottom: 8 }}>🛂</div>
            <h1 style={{ color: '#f1f5f9', fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 800, margin: '0 0 8px' }}>{tGameTitle}</h1>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(0.8rem,3vw,0.95rem)', margin: '0 0 24px', lineHeight: 1.5 }}>
              {tSubtitle}
            </p>
            {!checkingDailyGame && levelEntries.map(([key, val]) => (
              <button
                key={key}
                onClick={() => !isDailyGame && setDifficulty(key)}
                style={{
                  width: '100%', padding: '14px 20px', marginBottom: 10, borderRadius: 12, border: selectedLevel === key ? '3px solid rgba(255,255,255,0.5)' : 'none',
                  fontSize: 'clamp(0.9rem,3vw,1.05rem)', fontWeight: 700, cursor: isDailyGame ? 'default' : 'pointer',
                  background: key === 'Easy' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : key === 'Moderate' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#fff', transition: 'transform 0.15s', opacity: selectedLevel === key ? 1 : 0.85,
                }}
                onMouseEnter={e => !isDailyGame && (e.target.style.transform = 'scale(1.03)')}
                onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
              >
                {tLevelLabels[key]}
              </button>
            ))}
            <button
              disabled={!selectedLevel || checkingDailyGame}
              onClick={() => startLevel(selectedLevel)}
              style={{
                width: '100%', marginTop: 8, padding: '14px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontSize: 'clamp(0.9rem,3vw,1.05rem)', fontWeight: 700, cursor: (!selectedLevel || checkingDailyGame) ? 'not-allowed' : 'pointer', opacity: (!selectedLevel || checkingDailyGame) ? 0.6 : 1,
              }}
            >
              {tStartGame}
            </button>
            <div style={{ marginTop: 20, color: '#64748b', fontSize: 'clamp(0.7rem,2.5vw,0.8rem)' }}>{tUpTo}</div>
          </div>
        </div>
      )}

      {(appPhase === 'playing' || appPhase === 'gameover') && (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', pointerEvents: appPhase === 'gameover' ? 'none' : 'auto' }}>
          {playingContent}
        </div>
      )}

      {appPhase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle={tGameTitle}
          score={completionData.score}
          timeElapsed={completionData.timeElapsed ?? (config?.timeLimit ?? 120)}
          gameTimeLimit={config?.timeLimit ?? 120}
          isVictory={completionData.isVictory}
          difficulty={completionData.difficulty}
          customMessages={{ maxScore: MAX_SCORE }}
        />
      )}
    </div>
  );
}
