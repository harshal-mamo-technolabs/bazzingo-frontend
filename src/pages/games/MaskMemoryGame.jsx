import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

/* ============================================================
   Mask Memory: Carnival Quest
   - Memory card-matching game with carnival mask theme
   - 3 levels, 200 max score, 3-minute time limit
   - High-fidelity CSS graphics, flip animations, particles
   - Web Audio API procedural sounds
   - Fully responsive with landscape enforcement
   ============================================================ */

const MASKS = [
  { id: 'jester', name: 'Jester', bg: 'linear-gradient(135deg,#e74c3c,#f39c12)', eyes: '#fff', accent: '#8e44ad', shape: 'diamond', pattern: 'zigzag' },
  { id: 'phantom', name: 'Phantom', bg: 'linear-gradient(135deg,#ecf0f1,#bdc3c7)', eyes: '#2c3e50', accent: '#c0392b', shape: 'half', pattern: 'none' },
  { id: 'peacock', name: 'Peacock', bg: 'linear-gradient(135deg,#1abc9c,#3498db)', eyes: '#fff', accent: '#f1c40f', shape: 'feather', pattern: 'dots' },
  { id: 'sun', name: 'Sun King', bg: 'linear-gradient(135deg,#f39c12,#e74c3c)', eyes: '#fff', accent: '#f1c40f', shape: 'sun', pattern: 'rays' },
  { id: 'moon', name: 'Moon Lady', bg: 'linear-gradient(135deg,#2c3e50,#8e44ad)', eyes: '#ecf0f1', accent: '#3498db', shape: 'crescent', pattern: 'stars' },
  { id: 'harlequin', name: 'Harlequin', bg: 'linear-gradient(135deg,#e74c3c,#2ecc71)', eyes: '#f1c40f', accent: '#fff', shape: 'split', pattern: 'checks' },
  { id: 'venetian', name: 'Venetian', bg: 'linear-gradient(135deg,#8e44ad,#c0392b)', eyes: '#f1c40f', accent: '#e74c3c', shape: 'classic', pattern: 'swirl' },
  { id: 'cat', name: 'Cat Mask', bg: 'linear-gradient(135deg,#2c3e50,#34495e)', eyes: '#2ecc71', accent: '#f39c12', shape: 'cat', pattern: 'whiskers' },
  { id: 'butterfly', name: 'Butterfly', bg: 'linear-gradient(135deg,#e91e63,#9c27b0)', eyes: '#fff', accent: '#ff9800', shape: 'butterfly', pattern: 'wings' },
  { id: 'dragon', name: 'Dragon', bg: 'linear-gradient(135deg,#b71c1c,#ff6f00)', eyes: '#ffeb3b', accent: '#4caf50', shape: 'dragon', pattern: 'scales' },
  { id: 'owl', name: 'Owl', bg: 'linear-gradient(135deg,#5d4037,#795548)', eyes: '#ff9800', accent: '#ffeb3b', shape: 'owl', pattern: 'feathers' },
  { id: 'frost', name: 'Frost Queen', bg: 'linear-gradient(135deg,#00bcd4,#e0f7fa)', eyes: '#fff', accent: '#b2ebf2', shape: 'crystal', pattern: 'snowflakes' },
];

const LEVELS = [
  { name: 'Village Fair', pairs: 4, cols: 4, rows: 2, peekTime: 3000, bg: '#1a1a2e', accent: '#e94560', desc: '4 pairs • Easy' },
  { name: 'Grand Carnival', pairs: 6, cols: 4, rows: 3, peekTime: 2500, bg: '#16213e', accent: '#f9a825', desc: '6 pairs • Medium' },
  { name: 'Masquerade Ball', pairs: 8, cols: 4, rows: 4, peekTime: 2000, bg: '#0f0f23', accent: '#e040fb', desc: '8 pairs • Hard' },
];

const TIME_LIMIT = 180;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---- Audio Engine ---- */
function createAudio() {
  let ctx = null;
  const init = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
  const play = (freq, dur, type = 'sine', vol = 0.15) => {
    try {
      const c = init();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur);
    } catch (e) {}
  };
  return {
    flip: () => play(600, 0.1, 'sine', 0.1),
    match: () => { play(523, 0.15); setTimeout(() => play(659, 0.15), 100); setTimeout(() => play(784, 0.2), 200); },
    miss: () => play(200, 0.3, 'sawtooth', 0.08),
    combo: () => { play(784, 0.1); setTimeout(() => play(988, 0.1), 80); setTimeout(() => play(1175, 0.15), 160); },
    levelWin: () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => play(f, 0.3), i * 150)); },
    gameOver: () => { [400,350,300,250].forEach((f,i) => setTimeout(() => play(f, 0.4, 'sawtooth', 0.1), i * 200)); },
    victory: () => { [523,587,659,784,880,1047].forEach((f,i) => setTimeout(() => play(f, 0.25), i * 120)); },
    click: () => play(440, 0.05, 'square', 0.05),
  };
}

/* ---- Mask SVG Drawing ---- */
function MaskFace({ mask, size }) {
  const s = size || 60;
  const hs = s / 2;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      {/* Base mask shape */}
      <defs>
        <radialGradient id={`mg-${mask.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </radialGradient>
      </defs>
      {/* Mask outline */}
      <ellipse cx="50" cy="52" rx="40" ry="38" fill="url(#mg-${mask.id})" stroke={mask.accent} strokeWidth="2" />
      <ellipse cx="50" cy="52" rx="38" ry="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Eyes */}
      <ellipse cx="35" cy="45" rx="10" ry="7" fill={mask.eyes} stroke={mask.accent} strokeWidth="1.5" />
      <ellipse cx="65" cy="45" rx="10" ry="7" fill={mask.eyes} stroke={mask.accent} strokeWidth="1.5" />
      <circle cx="35" cy="45" r="3" fill="#111" />
      <circle cx="65" cy="45" r="3" fill="#111" />
      <circle cx="36" cy="44" r="1" fill="rgba(255,255,255,0.8)" />
      <circle cx="66" cy="44" r="1" fill="rgba(255,255,255,0.8)" />
      {/* Decorations based on shape */}
      {mask.shape === 'diamond' && <>
        <polygon points="50,15 58,25 50,35 42,25" fill={mask.accent} opacity="0.8" />
        <polygon points="50,17 56,25 50,33 44,25" fill="none" stroke="#fff" strokeWidth="0.5" />
      </>}
      {mask.shape === 'feather' && <>
        <path d="M75,30 Q85,20 90,25 Q85,35 75,35 Z" fill={mask.accent} opacity="0.7" />
        <path d="M25,30 Q15,20 10,25 Q15,35 25,35 Z" fill={mask.accent} opacity="0.7" />
        <circle cx="50" cy="28" r="4" fill={mask.accent} />
      </>}
      {mask.shape === 'sun' && <>
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a} x1="50" y1="10" x2="50" y2="5"
            stroke={mask.accent} strokeWidth="2"
            transform={`rotate(${a} 50 52)`} />
        ))}
      </>}
      {mask.shape === 'crescent' && <>
        <path d="M70,25 Q80,40 70,55" fill="none" stroke={mask.accent} strokeWidth="2" opacity="0.8" />
        <circle cx="72" cy="28" r="2" fill={mask.accent} />
        <circle cx="75" cy="40" r="1.5" fill={mask.accent} />
      </>}
      {mask.shape === 'cat' && <>
        <polygon points="25,25 20,8 35,22" fill={mask.accent} />
        <polygon points="75,25 80,8 65,22" fill={mask.accent} />
      </>}
      {mask.shape === 'butterfly' && <>
        <path d="M15,40 Q5,25 20,20 Q30,30 35,42" fill={mask.accent} opacity="0.6" />
        <path d="M85,40 Q95,25 80,20 Q70,30 65,42" fill={mask.accent} opacity="0.6" />
      </>}
      {mask.shape === 'dragon' && <>
        <path d="M25,20 L20,8 L30,15 L25,5 L35,18" fill={mask.accent} opacity="0.8" />
        <path d="M75,20 L80,8 L70,15 L75,5 L65,18" fill={mask.accent} opacity="0.8" />
      </>}
      {mask.shape === 'owl' && <>
        <ellipse cx="35" cy="45" rx="14" ry="11" fill="none" stroke={mask.accent} strokeWidth="2" />
        <ellipse cx="65" cy="45" rx="14" ry="11" fill="none" stroke={mask.accent} strokeWidth="2" />
        <polygon points="50,55 46,65 54,65" fill={mask.accent} />
      </>}
      {mask.shape === 'crystal' && <>
        <polygon points="50,12 55,22 50,28 45,22" fill={mask.accent} opacity="0.7" />
        <polygon points="40,18 44,24 38,28" fill={mask.accent} opacity="0.5" />
        <polygon points="60,18 56,24 62,28" fill={mask.accent} opacity="0.5" />
      </>}
      {mask.shape === 'classic' && <>
        <path d="M20,48 Q15,60 25,65" fill="none" stroke={mask.accent} strokeWidth="2" />
        <circle cx="50" cy="25" r="5" fill={mask.accent} opacity="0.6" />
      </>}
      {mask.shape === 'split' && <>
        <line x1="50" y1="15" x2="50" y2="85" stroke={mask.accent} strokeWidth="1.5" opacity="0.6" />
        <rect x="20" y="62" width="12" height="8" rx="2" fill={mask.accent} opacity="0.4" />
        <rect x="68" y="62" width="12" height="8" rx="2" fill={mask.accent} opacity="0.4" />
      </>}
      {mask.shape === 'half' && <>
        <rect x="10" y="38" width="35" height="25" rx="4" fill="none" stroke={mask.accent} strokeWidth="1.5" opacity="0.5" />
      </>}
      {/* Nose */}
      <path d="M47,55 L50,62 L53,55" fill="none" stroke={mask.accent} strokeWidth="1.5" />
      {/* Mouth */}
      <path d="M38,72 Q50,80 62,72" fill="none" stroke={mask.accent} strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

/* ---- Particles ---- */
function useParticles() {
  const [particles, setParticles] = useState([]);
  const idRef = useRef(0);

  const burst = useCallback((x, y, color, count = 12) => {
    const newP = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      newP.push({
        id: idRef.current++,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 3 + Math.random() * 5,
      });
    }
    setParticles(prev => [...prev, ...newP]);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, life: p.life - 0.03 }))
        .filter(p => p.life > 0)
      );
    }, 30);
    return () => clearInterval(timer);
  }, [particles.length > 0]);

  return { particles, burst };
}

/* ---- Confetti ---- */
function useConfetti() {
  const [pieces, setPieces] = useState([]);
  const idRef = useRef(0);

  const launch = useCallback(() => {
    const newC = [];
    const colors = ['#e74c3c','#f39c12','#2ecc71','#3498db','#9b59b6','#e91e63','#ff9800','#00bcd4'];
    for (let i = 0; i < 60; i++) {
      newC.push({
        id: idRef.current++,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random() * 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        life: 1,
      });
    }
    setPieces(prev => [...prev, ...newC]);
  }, []);

  useEffect(() => {
    if (pieces.length === 0) return;
    const timer = setInterval(() => {
      setPieces(prev => prev
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, rot: p.rot + p.rotSpeed, life: p.life - 0.008 }))
        .filter(p => p.life > 0)
      );
    }, 30);
    return () => clearInterval(timer);
  }, [pieces.length > 0]);

  return { pieces, launch };
}

export default function MaskMemory({ onBack }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState('menu'); // menu | peek | playing | levelComplete | gameOver | victory
  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [muted, setMuted] = useState(false);
  const [shakeClass, setShakeClass] = useState('');
  const [popups, setPopups] = useState([]);
  const [levelScores, setLevelScores] = useState([0, 0, 0]);
  const [dailyGameLevel, setDailyGameLevel] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);

  const tHowToPlayMask = useTranslateText('How to Play Mask Memory');
  const tHowToPlay = useTranslateText('How to Play');
  const tObjective = useTranslateText('Objective');
  const tObjectiveDesc = useTranslateText('Memorize the positions of colorful carnival masks, then match pairs by flipping cards. Complete all levels to win!');
  const tBullet1 = useTranslateText('Cards are shown face-up briefly at the start');
  const tBullet2 = useTranslateText('Click cards to flip and reveal masks');
  const tBullet3 = useTranslateText('Match two identical masks to score');
  const tBullet4 = useTranslateText('Build combos for bonus points!');
  const tScoring = useTranslateText('Scoring');
  const tBaseMatch = useTranslateText('Base match: +10 points');
  const tComboBonus = useTranslateText('Combo bonus: +3 per streak');
  const tMaxScore = useTranslateText('Maximum score: 200 points');
  const tTimeLimit3 = useTranslateText('Time limit: 3 minutes');
  const tDifficultyLevels = useTranslateText('Difficulty Levels');
  const tVillageFair = useTranslateText('Village Fair: 4 pairs, easy');
  const tGrandCarnival = useTranslateText('Grand Carnival: 6 pairs, medium');
  const tMasqueradeBall = useTranslateText('Masquerade Ball: 8 pairs, hard');
  const tCompleteAll3 = useTranslateText('Complete all 3 levels to win!');
  const tProTip = useTranslateText('Pro Tip: Pay attention during the peek phase! Remember mask positions and colors. Building combos (matching multiple pairs in a row) gives you bonus points!');
  const tGotItPlay = useTranslateText("Got it! Let's Play 🎭");
  const tDailyChallenge = useTranslateText('Daily Challenge');
  const tMaskMemory = useTranslateText('Mask Memory');
  const tCarnivalQuest = useTranslateText('Carnival Quest');
  const tStudyMasksDesc = useTranslateText('Study the masks, then match them from memory!');
  const tBack = useTranslateText('← Back');
  const tLoading = useTranslateText('Loading...');
  const tLevelNames = [useTranslateText('Village Fair'), useTranslateText('Grand Carnival'), useTranslateText('Masquerade Ball')];
  const tLevelDescs = [useTranslateText('4 pairs • Easy'), useTranslateText('6 pairs • Medium'), useTranslateText('8 pairs • Hard')];
  const tMemorizeMasks = useTranslateText('Memorize the Masks!');
  const tCardsFlipIn = useTranslateText('Cards will flip in');
  const tCardsFlipSuffix = useTranslateText('s...');
  const tFlip = useTranslateText('FLIP');
  const tLevelComplete = useTranslateText('Level Complete!');
  const tMovesLabel = useTranslateText('Moves:');
  const tBestCombo = useTranslateText('Best Combo:');
  const tScoreLabel = useTranslateText('Score:');
  const tNextLevel = useTranslateText('Next Level →');
  const tTotalMoves = useTranslateText('Total Moves:');
  const tTimeLabel = useTranslateText('Time:');
  const audioRef = useRef(null);
  const lockRef = useRef(false);
  const popupIdRef = useRef(0);
  const { particles, burst } = useParticles();
  const { pieces, launch } = useConfetti();

  if (!audioRef.current) audioRef.current = createAudio();
  const audio = audioRef.current;

  const playSound = useCallback((name) => {
    if (!muted && audio[name]) audio[name]();
  }, [muted, audio]);


  const initLevel = useCallback((lvl) => {
    const config = LEVELS[lvl];
    const selected = shuffle(MASKS).slice(0, config.pairs);
    const deck = shuffle([...selected, ...selected].map((m, i) => ({
      uid: i,
      mask: m,
    })));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setCombo(0);
    setBestCombo(0);
    setMoves(0);
    setLevel(lvl);
    setPhase('peek');
    lockRef.current = false;
  }, []);

  const startGame = useCallback((lvl) => {
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setLevelScores([0, 0, 0]);
    initLevel(lvl);
    playSound('click');
  }, [initLevel, playSound]);

  // Check if game is in daily suggestions
  useEffect(() => {
    const checkDailyGame = async () => {
      try {
        setCheckingDailyGame(true);
        const result = await getDailySuggestions();
        const games = result?.data?.suggestion?.games || [];
        const pathname = location.pathname || '';
        
        const normalizePath = (p = '') => {
          const base = String(p).split('?')[0].split('#')[0].trim();
          const noTrailing = base.replace(/\/+$/, '');
          return noTrailing || '/';
        };
        
        const matchedGame = games.find(
          (g) => normalizePath(g?.gameId?.url) === normalizePath(pathname)
        );
        
        if (matchedGame && matchedGame.difficulty) {
          const difficulty = matchedGame.difficulty.toLowerCase();
          // Map difficulty to level index: easy=0, moderate=1, hard=2
          const levelMap = { easy: 0, moderate: 1, hard: 2 };
          const levelIndex = levelMap[difficulty];
          
          if (levelIndex !== undefined) {
            setIsDailyGame(true);
            setDailyGameLevel(levelIndex);
          }
        }
      } catch (error) {
        console.error('Error checking daily game:', error);
      } finally {
        setCheckingDailyGame(false);
      }
    };
    
    checkDailyGame();
  }, [location.pathname]);

  // Handle URL parameter for auto-start (only if not daily game)
  useEffect(() => {
    if (isDailyGame || checkingDailyGame) return;
    
    const levelParam = searchParams.get('level');
    if (levelParam && ['easy', 'moderate', 'hard'].includes(levelParam.toLowerCase())) {
      const levelIndex = levelParam.toLowerCase() === 'easy' ? 0 : levelParam.toLowerCase() === 'moderate' ? 1 : 2;
      startGame(levelIndex);
    }
  }, [searchParams, startGame, isDailyGame, checkingDailyGame]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          playSound('gameOver');
          setPhase('gameOver');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, playSound]);

  // Peek timer
  useEffect(() => {
    if (phase !== 'peek') return;
    const t = setTimeout(() => {
      setPhase('playing');
    }, LEVELS[level].peekTime);
    return () => clearTimeout(t);
  }, [phase, level]);

  // Popups decay
  useEffect(() => {
    if (popups.length === 0) return;
    const t = setInterval(() => {
      setPopups(prev => prev.filter(p => Date.now() - p.time < 1200));
    }, 100);
    return () => clearInterval(t);
  }, [popups.length]);

  const addPopup = useCallback((x, y, text, color) => {
    setPopups(prev => [...prev, { id: popupIdRef.current++, x, y, text, color, time: Date.now() }]);
  }, []);

  const handleCardClick = useCallback((index, e) => {
    if (phase !== 'playing' || lockRef.current) return;
    if (flipped.includes(index) || matched.includes(index)) return;

    playSound('flip');
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);
      const [a, b] = newFlipped;

      if (cards[a].mask.id === cards[b].mask.id) {
        // Match!
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > bestCombo) setBestCombo(newCombo);

        const basePoints = 10;
        const comboBonus = Math.min(newCombo - 1, 4) * 3;
        const pts = basePoints + comboBonus;

        setTimeout(() => {
          const newMatched = [...matched, a, b];
          setMatched(newMatched);
          setFlipped([]);
          setScore(s => Math.min(s + pts, 200));
          lockRef.current = false;

          if (newCombo >= 3) playSound('combo');
          else playSound('match');

          // Particle burst
          const rect = e?.currentTarget?.getBoundingClientRect?.();
          if (rect) {
            burst(rect.left + rect.width / 2, rect.top + rect.height / 2, cards[b].mask.accent, 15);
            addPopup(rect.left + rect.width / 2, rect.top, `+${pts}`, '#2ecc71');
            if (newCombo >= 2) addPopup(rect.left + rect.width / 2, rect.top - 25, `🔥 x${newCombo}`, '#f39c12');
          }

          // Check level complete
          const totalPairs = LEVELS[level].pairs;
          if (newMatched.length / 2 === totalPairs) {
            const newScores = [...levelScores];
            const levelPts = Math.min(pts + score, 200) - levelScores.reduce((a,b) => a+b, 0);
            newScores[level] = Math.max(levelPts, 0);
            setLevelScores(newScores);

            if (level < 2) {
              playSound('levelWin');
              launch();
              setPhase('levelComplete');
            } else {
              playSound('victory');
              launch();
              setTimeout(() => launch(), 500);
              setPhase('victory');
            }
          }
        }, 400);
      } else {
        // Mismatch
        setCombo(0);
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
          playSound('miss');
          setShakeClass('shake');
          setTimeout(() => setShakeClass(''), 300);
        }, 800);
      }
    }
  }, [phase, flipped, matched, cards, combo, bestCombo, score, level, levelScores, burst, addPopup, launch, playSound]);

  const nextLevel = useCallback(() => {
    playSound('click');
    initLevel(level + 1);
  }, [level, initLevel, playSound]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const isFlipped = (i) => phase === 'peek' || flipped.includes(i) || matched.includes(i);
  const isMatched = (i) => matched.includes(i);

  const lvl = LEVELS[level] || LEVELS[0];
  const totalPairs = lvl.pairs;

  /* ---- STYLES ---- */
  const styles = {
    container: {
      position: 'fixed', inset: 0, overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: phase === 'menu' ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)' : `linear-gradient(135deg, ${lvl.bg} 0%, ${lvl.bg}dd 100%)`,
      color: '#fff',
      transition: 'background 0.8s ease',
    },
    landscape: {
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f0f23', color: '#fff', fontSize: '1.2rem', textAlign: 'center', padding: '2rem',
    },
  };

  const css = `
    @keyframes cardFlip { 0%{transform:rotateY(0)} 100%{transform:rotateY(180deg)} }
    @keyframes cardUnflip { 0%{transform:rotateY(180deg)} 100%{transform:rotateY(0)} }
    @keyframes matchPulse { 0%{transform:scale(1);box-shadow:0 0 0 0 rgba(46,204,113,0.5)} 50%{transform:scale(1.08);box-shadow:0 0 20px 5px rgba(46,204,113,0.3)} 100%{transform:scale(1);box-shadow:0 0 0 0 rgba(46,204,113,0)} }
    @keyframes popFloat { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-50px) scale(1.3)} }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes peekGlow { 0%,100%{box-shadow:0 0 15px rgba(241,196,15,0.4)} 50%{box-shadow:0 0 30px rgba(241,196,15,0.8)} }
    @keyframes starTwinkle { 0%,100%{opacity:0.3} 50%{opacity:1} }
    @keyframes confettiDrop { from{transform:translateY(-10vh)} to{transform:translateY(110vh)} }
    @keyframes slideDown { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes maskBob { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-5px) rotate(2deg)} }
    .shake { animation: shake 0.3s ease; }
    .card-grid { perspective: 1000px; }
    .card-inner { transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); position:relative; width:100%; height:100%; }
    .card-inner.flipped { transform: rotateY(180deg); }
    .card-front, .card-back { position:absolute; inset:0; backface-visibility:hidden; border-radius:12px; display:flex; align-items:center; justify-content:center; }
    .card-back { transform:rotateY(180deg); }
  `;

  const getCardGridLayout = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isPortrait = vh > vw;
    
    if (isPortrait) {
      const cols = lvl.cols <= 2 ? 2 : lvl.cols === 3 ? 2 : 3;
      const cardSize = Math.max(Math.min((vw - 40) / cols - 8, 90), 55);
      return { cols, cardW: cardSize, cardH: cardSize * 1.3 };
    } else {
      const cardSize = Math.max(Math.min((vw - 80) / lvl.cols - 12, 120), 60);
      return { cols: lvl.cols, cardW: cardSize, cardH: cardSize * 1.3 };
    }
  };

  /* ---- MENU ---- */
  if (phase === 'menu' && !checkingDailyGame) {
    // Filter levels based on daily game
    const availableLevels = isDailyGame && dailyGameLevel !== null 
      ? [LEVELS[dailyGameLevel]]
      : LEVELS;
    const availableLevelIndices = isDailyGame && dailyGameLevel !== null
      ? [dailyGameLevel]
      : [0, 1, 2];

    return (
      <div style={styles.container}>
        <style>{css}</style>
        {/* Animated stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 2 + Math.random() * 3, height: 2 + Math.random() * 3,
            borderRadius: '50%',
            background: '#fff',
            left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%`,
            animation: `starTwinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.4,
          }} />
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
          {/* Title */}
          <div style={{ animation: 'float 3s ease-in-out infinite', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, background: 'linear-gradient(135deg, #f39c12, #e74c3c, #9b59b6, #3498db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: 'none', letterSpacing: '-0.02em' }}>
              🎭 {tMaskMemory}
            </span>
          </div>
          <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', color: '#f39c12', fontWeight: 600, marginBottom: '0.3rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {tCarnivalQuest}
          </div>
          <div style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
            {tStudyMasksDesc}
          </div>

          {/* Daily Game Badge */}
          {isDailyGame && dailyGameLevel !== null && (
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              padding: '8px 20px',
              borderRadius: '20px',
              marginBottom: '20px',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
            }}>
              {tDailyChallenge}: {LEVELS[dailyGameLevel].name}
            </div>
          )}

          {/* How to Play Button */}
          <button
            onClick={() => setShowInstructions(true)}
            style={{
              position: 'absolute',
              top: 'clamp(16px, 3vw, 24px)',
              right: 'clamp(16px, 3vw, 24px)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)',
              color: '#fff',
              fontSize: 'clamp(13px, 2vw, 15px)',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            📖 {tHowToPlay}
          </button>

          {/* Level cards */}
          <div style={{ display: 'flex', gap: 'clamp(0.8rem, 2vw, 1.5rem)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {availableLevels.map((l, idx) => {
              const i = availableLevelIndices[idx];
              return (
              <button key={i} onClick={() => startGame(i)} style={{
                background: `linear-gradient(135deg, ${l.bg}, ${l.accent}33)`,
                border: `2px solid ${l.accent}88`,
                borderRadius: '16px',
                padding: 'clamp(1rem, 2vw, 1.5rem) clamp(1.2rem, 3vw, 2rem)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: `fadeIn 0.5s ease ${i * 0.15}s both`,
                minWidth: 'clamp(140px, 20vw, 180px)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = `0 10px 30px ${l.accent}44`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${l.accent}22, transparent)`, backgroundSize: '200% 100%', animation: 'shimmer 3s infinite' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{['🏡', '🎪', '💃'][i]}</div>
                  <div style={{ fontWeight: 700, fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', marginBottom: '0.3rem' }}>{tLevelNames[i]}</div>
                  <div style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)', opacity: 0.7 }}>{tLevelDescs[i]}</div>
                </div>
              </button>
            );
            })}
          </div>

          {/* Floating masks */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', animation: 'maskBob 4s ease-in-out infinite' }}>
            {MASKS.slice(0, 5).map(m => (
              <div key={m.id} style={{ background: m.bg, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${m.accent}`, opacity: 0.6 }}>
                <MaskFace mask={m} size={30} />
              </div>
            ))}
          </div>

          {onBack && (
            <button onClick={onBack} style={{
              marginTop: '1.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px', padding: '0.6rem 1.5rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
            }}>{tBack}</button>
          )}
        </div>

        {/* Instructions Modal */}
        {showInstructions && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }} onClick={() => setShowInstructions(false)}>
            <div style={{
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 40px)',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#ffffff',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              position: 'relative',
            }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowInstructions(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  color: '#fff',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ✕
              </button>

              <h2 style={{
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 'bold',
                marginBottom: '8px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f39c12, #e74c3c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                🎭 {tHowToPlayMask}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '24px',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#4CAF50',
                  }}>
                    🎯 {tObjective}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    opacity: 0.9,
                  }}>
                    {tObjectiveDesc}
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#2196F3',
                  }}>
                    🎮 {tHowToPlay}
                  </h3>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    opacity: 0.9,
                    paddingLeft: '20px',
                  }}>
                    <li>{tBullet1}</li>
                    <li>{tBullet2}</li>
                    <li>{tBullet3}</li>
                    <li>{tBullet4}</li>
                  </ul>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#FF9800',
                  }}>
                    📊 {tScoring}
                  </h3>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    opacity: 0.9,
                    paddingLeft: '20px',
                  }}>
                    <li>{tBaseMatch}</li>
                    <li>{tComboBonus}</li>
                    <li>{tMaxScore}</li>
                    <li>{tTimeLimit3}</li>
                  </ul>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#9C27B0',
                  }}>
                    💡 {tDifficultyLevels}
                  </h3>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    opacity: 0.9,
                    paddingLeft: '20px',
                  }}>
                    <li>{tVillageFair}</li>
                    <li>{tGrandCarnival}</li>
                    <li>{tMasqueradeBall}</li>
                    <li>{tCompleteAll3}</li>
                  </ul>
                </div>
              </div>

              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(243, 156, 18, 0.15)',
                borderRadius: '12px',
                border: '1px solid rgba(243, 156, 18, 0.3)',
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  opacity: 0.95,
                  textAlign: 'center',
                  fontWeight: 500,
                }}>
                  💡 {tProTip}
                </p>
              </div>

              <button
                onClick={() => setShowInstructions(false)}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                {tGotItPlay}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---- LOADING STATE ---- */
  if (checkingDailyGame && phase === 'menu') {
    return (
      <div style={styles.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
          <div style={{ fontSize: '18px', opacity: 0.8 }}>{tLoading}</div>
        </div>
      </div>
    );
  }

  /* ---- GAME VIEW ---- */
  const gridLayout = getCardGridLayout();
  const cardW = gridLayout.cardW;
  const cardH = gridLayout.cardH;
  const displayCols = gridLayout.cols;

  return (
    <div style={{ ...styles.container, display: 'flex', flexDirection: 'column' }} className={shakeClass}>
      <style>{css}</style>

      {/* HUD */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(0.4rem, 1vw, 0.8rem) clamp(0.8rem, 2vw, 1.5rem)',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderBottom: `2px solid ${lvl.accent}44`,
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 1.5vw, 1rem)', flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', color: lvl.accent }}>
            {tLevelNames[level]}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.2rem 0.6rem',
            fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
          }}>
            ⭐ {score}/200
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.2rem 0.6rem',
            fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
          }}>
            🃏 {matched.length / 2}/{totalPairs}
          </div>
          {combo >= 2 && (
            <div style={{
              background: 'linear-gradient(135deg, #f39c12, #e74c3c)', borderRadius: '8px', padding: '0.2rem 0.6rem',
              fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)', fontWeight: 700, animation: 'matchPulse 0.6s ease',
            }}>
              🔥 x{combo}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            fontWeight: 700, fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
            color: timeLeft <= 30 ? '#e74c3c' : timeLeft <= 60 ? '#f39c12' : '#2ecc71',
          }}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button onClick={() => setMuted(!muted)} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
            padding: '0.3rem 0.5rem', color: '#fff', cursor: 'pointer', fontSize: '1rem',
          }}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={() => { setPhase('menu'); playSound('click'); }} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px',
            padding: '0.3rem 0.5rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem',
          }}>
            ☰
          </button>
        </div>
      </div>

      {/* Peek banner */}
      {phase === 'peek' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          zIndex: 100, animation: 'fadeIn 0.4s ease',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          borderRadius: '16px', padding: '1rem 2rem', textAlign: 'center',
          border: '2px solid #f1c40f88',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>👀</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1c40f' }}>{tMemorizeMasks}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{tCardsFlipIn} {(LEVELS[level].peekTime / 1000).toFixed(0)}{tCardsFlipSuffix}</div>
        </div>
      )}

      {/* Card Grid */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative' }}>
        <div className="card-grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${displayCols}, ${cardW}px)`,
          gap: 'clamp(6px, 1vw, 12px)',
          justifyContent: 'center',
        }}>
          {cards.map((card, i) => {
            const flip = isFlipped(i);
            const match = isMatched(i);
            return (
              <div key={card.uid} onClick={(e) => handleCardClick(i, e)} style={{
                width: cardW, height: cardH, cursor: phase === 'playing' && !flip ? 'pointer' : 'default',
                animation: match ? 'matchPulse 0.6s ease' : `fadeIn 0.4s ease ${i * 0.03}s both`,
                opacity: match ? 0.7 : 1,
              }}>
                <div className={`card-inner ${flip ? 'flipped' : ''}`}>
                  {/* Front (hidden) */}
                  <div className="card-front" style={{
                    background: `linear-gradient(135deg, ${lvl.accent}44, ${lvl.bg})`,
                    border: `2px solid ${lvl.accent}66`,
                    boxShadow: `0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                    flexDirection: 'column',
                  }}>
                    <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>🎭</div>
                    <div style={{ fontSize: 'clamp(0.5rem, 1vw, 0.7rem)', opacity: 0.5, marginTop: '0.3rem', letterSpacing: '0.1em' }}>{tFlip}</div>
                    {/* Card back pattern */}
                    <div style={{
                      position: 'absolute', inset: 6, borderRadius: 8,
                      border: `1px solid ${lvl.accent}33`,
                      background: `repeating-linear-gradient(45deg, transparent, transparent 8px, ${lvl.accent}11 8px, ${lvl.accent}11 9px)`,
                    }} />
                  </div>
                  {/* Back (mask face) */}
                  <div className="card-back" style={{
                    background: card.mask.bg,
                    border: `2px solid ${card.mask.accent}`,
                    boxShadow: match ? `0 0 20px ${card.mask.accent}66` : `0 4px 15px rgba(0,0,0,0.3)`,
                    flexDirection: 'column',
                    animation: phase === 'peek' ? 'peekGlow 1.5s ease-in-out infinite' : 'none',
                  }}>
                    <MaskFace mask={card.mask} size={Math.min(cardW * 0.7, 70)} />
                    <div style={{
                      fontSize: 'clamp(0.5rem, 0.9vw, 0.7rem)', fontWeight: 600,
                      marginTop: '0.3rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      letterSpacing: '0.05em',
                    }}>
                      {card.mask.name}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Popups */}
        {popups.map(p => (
          <div key={p.id} style={{
            position: 'fixed', left: p.x, top: p.y, transform: 'translateX(-50%)',
            color: p.color, fontWeight: 800, fontSize: '1.1rem', pointerEvents: 'none',
            animation: 'popFloat 1.2s ease-out forwards',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)', zIndex: 200,
          }}>
            {p.text}
          </div>
        ))}

        {/* Particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'fixed', left: p.x, top: p.y, width: p.size, height: p.size,
            borderRadius: '50%', background: p.color, opacity: p.life,
            pointerEvents: 'none', zIndex: 150,
          }} />
        ))}

        {/* Confetti */}
        {pieces.map(p => (
          <div key={p.id} style={{
            position: 'fixed', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size * 0.6,
            background: p.color, opacity: p.life,
            transform: `rotate(${p.rot}deg)`,
            pointerEvents: 'none', zIndex: 300,
            borderRadius: '1px',
          }} />
        ))}
      </div>

      {/* Level Complete Overlay */}
      {phase === 'levelComplete' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 500,
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', borderRadius: '20px',
            padding: 'clamp(1.5rem, 3vw, 2.5rem)', textAlign: 'center', maxWidth: '400px',
            border: '2px solid #f39c1288',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f39c12', marginBottom: '0.5rem' }}>{tLevelComplete}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>
              {tMovesLabel} {moves} • {tBestCombo} {bestCombo}x • {tScoreLabel} {score}/200
            </div>
            <button onClick={nextLevel} style={{
              background: 'linear-gradient(135deg, #f39c12, #e74c3c)', border: 'none', borderRadius: '12px',
              padding: '0.8rem 2rem', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            }}>
              {tNextLevel}
            </button>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      <GameCompletionModal
        isVisible={phase === 'victory'}
        onClose={() => setPhase('menu')}
        gameTitle={tMaskMemory}
        score={score}
        moves={moves}
        timeElapsed={TIME_LIMIT - timeLeft}
        gameTimeLimit={TIME_LIMIT}
        isVictory={true}
        customMessages={{
          perfectScore: 180,
          goodScore: 120,
          maxScore: 200,
          stats: `${tTotalMoves} ${moves} • ${tTimeLabel} ${formatTime(TIME_LIMIT - timeLeft)}`
        }}
      />

      {/* Game Over */}
      <GameCompletionModal
        isVisible={phase === 'gameOver'}
        onClose={() => setPhase('menu')}
        gameTitle={tMaskMemory}
        score={score}
        moves={moves}
        timeElapsed={TIME_LIMIT - timeLeft}
        gameTimeLimit={TIME_LIMIT}
        isVictory={false}
        customMessages={{
          icon: '⏰',
          title: "Time's Up!",
          maxScore: 200,
          stats: `${tTotalMoves} ${moves} • ${tTimeLabel} ${formatTime(TIME_LIMIT - timeLeft)}`
        }}
      />
    </div>
  );
}
