import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

// ─── PUZZLE DATA (hand-crafted, guaranteed solvable) ──────────────────────────
const PUZZLES = {
  easy: {
    colors: 3, par: 12,
    tubes: [
      ['coral', 'ocean', 'mango', 'coral'],
      ['mango', 'coral', 'ocean', 'mango'],
      ['ocean', 'mango', 'coral', 'ocean'],
      [], []
    ]
  },
  medium: {
    colors: 5, par: 20,
    tubes: [
      ['coral', 'lime', 'ocean', 'grape'],
      ['pineapple', 'coral', 'lime', 'ocean'],
      ['grape', 'pineapple', 'coral', 'lime'],
      ['ocean', 'grape', 'pineapple', 'coral'],
      ['lime', 'ocean', 'grape', 'pineapple'],
      [], []
    ]
  },
  hard: {
    colors: 7, par: 30,
    tubes: [
      ['coral', 'mango', 'ocean', 'berry'],
      ['lime', 'grape', 'pineapple', 'coral'],
      ['ocean', 'berry', 'mango', 'lime'],
      ['grape', 'pineapple', 'coral', 'ocean'],
      ['berry', 'mango', 'lime', 'grape'],
      ['pineapple', 'coral', 'ocean', 'berry'],
      ['mango', 'lime', 'grape', 'pineapple'],
      [], []
    ]
  }
};

const LIQUID_COLORS = {
  coral:     { bg: 'linear-gradient(180deg, #ff8a80, #e53935)', glow: '#ff5252' },
  ocean:     { bg: 'linear-gradient(180deg, #80d8ff, #0288d1)', glow: '#40c4ff' },
  mango:     { bg: 'linear-gradient(180deg, #ffcc80, #ef6c00)', glow: '#ffa726' },
  lime:      { bg: 'linear-gradient(180deg, #b9f6ca, #2e7d32)', glow: '#69f0ae' },
  grape:     { bg: 'linear-gradient(180deg, #ce93d8, #7b1fa2)', glow: '#ba68c8' },
  pineapple: { bg: 'linear-gradient(180deg, #fff59d, #f9a825)', glow: '#ffee58' },
  berry:     { bg: 'linear-gradient(180deg, #f48fb1, #c2185b)', glow: '#f06292' }
};

const MAX_LAYERS = 4;
const TIME_LIMIT = 180;

// ─── AUDIO ENGINE ─────────────────────────────────────────────────────────────
let audioCtx = null;
let masterGain = null;
let musicNodes = [];

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.value = 0.5;
}

function setMuted(muted) {
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.5;
}

function playTone(freq, duration, type = 'sine', vol = 0.3) {
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

function playPour() {
  // Liquid pouring sound: noise-like burst
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 1.5;
  const g = audioCtx.createGain();
  g.gain.value = 0.25;
  src.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  src.start();
}

function playSplash() {
  playTone(400, 0.12, 'sine', 0.3);
  setTimeout(() => playTone(300, 0.15, 'triangle', 0.2), 60);
  setTimeout(() => playTone(500, 0.08, 'sine', 0.15), 100);
}

function playThud() { playTone(80, 0.2, 'triangle', 0.2); playTone(100, 0.15, 'sine', 0.1); }

function playVictoryChime() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.5, 'sine', 0.25), i * 100));
}

function startMusic() {
  if (!audioCtx) return;
  stopMusic();
  // Tropical major-key progression: C-E-G, F-A-C, G-B-D, C-E-G (higher register)
  const chords = [[523, 659, 784], [349, 440, 523], [392, 493, 587], [523, 659, 784]];
  let idx = 0;
  function playChord() {
    const chord = chords[idx % chords.length];
    chord.forEach(f => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      // Add slight vibrato
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 4;
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      g.gain.setValueAtTime(0.035, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.8);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 4);
      lfo.stop(audioCtx.currentTime + 4);
      musicNodes.push(osc, lfo);
    });
    idx++;
  }
  playChord();
  const interval = setInterval(playChord, 4000);
  musicNodes._interval = interval;
}

function stopMusic() {
  if (musicNodes._interval) clearInterval(musicNodes._interval);
  musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
  musicNodes = [];
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLE_ID = 'cocktail-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes cs-lift { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-70px); opacity: 1; } }
    @keyframes cs-drop { 0% { transform: translateY(-70px); } 70% { transform: translateY(4px); } 100% { transform: translateY(0); } }
    @keyframes cs-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
    @keyframes cs-confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(500px) rotate(720deg); opacity: 0; } }
    @keyframes cs-wave { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-30px); } }
    @keyframes cs-cloud { 0% { transform: translateX(-200px); } 100% { transform: translateX(calc(100vw + 200px)); } }
    @keyframes cs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes cs-glow { 0%,100% { box-shadow: 0 0 8px rgba(255,255,255,0.2); } 50% { box-shadow: 0 0 24px rgba(255,255,255,0.5); } }
    @keyframes cs-star { 0% { transform: scale(0) rotate(0); opacity: 0; } 50% { transform: scale(1.3) rotate(180deg); opacity: 1; } 100% { transform: scale(1) rotate(360deg); opacity: 1; } }
    @keyframes cs-ripple { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.5); opacity: 0; } }
    @keyframes cs-pour-arc {
      0% { transform: translate(0, 0) scale(1); opacity: 1; }
      30% { transform: translate(var(--pour-dx-mid), -80px) scale(1.2); opacity: 1; }
      70% { transform: translate(var(--pour-dx), -40px) scale(1); opacity: 0.9; }
      100% { transform: translate(var(--pour-dx), var(--pour-dy)) scale(0.8); opacity: 0; }
    }
    @keyframes cs-splash {
      0% { transform: scale(0); opacity: 0.8; }
      50% { transform: scale(1.5); opacity: 0.5; }
      100% { transform: scale(2); opacity: 0; }
    }
    @keyframes cs-bubble {
      0% { transform: translateY(0) scale(1); opacity: 0.6; }
      100% { transform: translateY(-20px) scale(0.3); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CocktailSort() {
  const location = useLocation();
  const [screen, setScreen] = useState('menu');
  const [difficulty, setDifficulty] = useState(null);
  const [glasses, setGlasses] = useState([]);
  const [selectedGlass, setSelectedGlass] = useState(null);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [muted, setMutedState] = useState(false);
  const [shakeGlass, setShakeGlass] = useState(null);
  const [droppingGlass, setDroppingGlass] = useState(null);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [isLandscape, setIsLandscape] = useState(true);
  const [pourAnim, setPourAnim] = useState(null); // { color, fromIdx, toIdx }
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const timerRef = useRef(null);
  const glassRefs = useRef({});
  const playingRef = useRef({ moves: 0, timeLeft: TIME_LIMIT, difficulty: null, par: 12 });
  playingRef.current = { moves, timeLeft, difficulty, par: difficulty ? PUZZLES[difficulty].par : 12 };

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setIsLandscape(w >= 600 || w > h);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
          const map = { easy: 'easy', medium: 'medium', hard: 'hard' };
          if (map[d]) {
            setIsDailyGame(true);
            setDailyGameDifficulty(map[d]);
            setDifficulty(map[d]);
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

  useEffect(() => {
    if (screen !== 'game') { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopMusic();
          const ref = playingRef.current;
          setCompletionData({
            score: 0,
            moves: ref.moves,
            isVictory: false,
            difficulty: ref.difficulty,
            timeElapsed: TIME_LIMIT,
            par: ref.par,
          });
          setScreen('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const par = difficulty ? PUZZLES[difficulty].par : 1;

  const checkWin = useCallback((g) => {
    return g.every(glass => glass.length === 0 || (glass.length === MAX_LAYERS && glass.every(l => l === glass[0])));
  }, []);

  const endGame = useCallback((won) => {
    clearInterval(timerRef.current);
    stopMusic();
    if (won) {
      const s = Math.min(200, Math.round(200 * Math.min(1, par / Math.max(1, moves + 1))));
      setScore(s);
      setStars(s >= 180 ? 3 : s >= 120 ? 2 : 1);
      playVictoryChime();
      setCompletionData({
        score: s,
        moves,
        isVictory: true,
        difficulty,
        timeElapsed: TIME_LIMIT - timeLeft,
        par,
      });
    }
    setScreen('finished');
  }, [par, moves, difficulty, timeLeft]);

  const handleReset = useCallback(() => {
    setScreen('menu');
    setCompletionData(null);
  }, []);

  const startGame = useCallback((diff) => {
    initAudio();
    setDifficulty(diff);
    setGlasses(PUZZLES[diff].tubes.map(t => [...t]));
    setSelectedGlass(null);
    setMoves(0);
    setTimeLeft(TIME_LIMIT);
    setShakeGlass(null);
    setDroppingGlass(null);
    setCompletionData(null);
    setScreen('game');
    if (!muted) startMusic();
  }, [muted]);

  const handleGlassTap = useCallback((idx) => {
    if (screen !== 'game' || pourAnim) return;
    const glass = glasses[idx];

    if (selectedGlass === null) {
      if (glass.length === 0) return;
      initAudio();
      playPour();
      setSelectedGlass(idx);
    } else if (selectedGlass === idx) {
      setSelectedGlass(null);
    } else {
      const srcGlass = glasses[selectedGlass];
      const layer = srcGlass[srcGlass.length - 1];
      const canDrop = glass.length < MAX_LAYERS && (glass.length === 0 || glass[glass.length - 1] === layer);

      if (canDrop) {
        // Trigger pour animation
        const c = LIQUID_COLORS[layer];
        setPourAnim({ color: layer, fromIdx: selectedGlass, toIdx: idx });
        playSplash();

        const newGlasses = glasses.map(g => [...g]);
        newGlasses[selectedGlass].pop();
        // Don't add to target yet — wait for animation
        setGlasses(newGlasses);
        setSelectedGlass(null);

        setTimeout(() => {
          // Now add to target
          const finalGlasses = newGlasses.map(g => [...g]);
          finalGlasses[idx].push(layer);
          setGlasses(finalGlasses);
          setDroppingGlass(idx);
          setMoves(m => m + 1);
          setPourAnim(null);
          setTimeout(() => setDroppingGlass(null), 300);
          setTimeout(() => {
            if (checkWin(finalGlasses)) endGame(true);
          }, 350);
        }, 500);
      } else {
        playThud();
        setShakeGlass(idx);
        setTimeout(() => setShakeGlass(null), 400);
      }
    }
  }, [screen, glasses, selectedGlass, checkWin, endGame, pourAnim]);

  const toggleMute = useCallback(() => {
    initAudio();
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    if (next) stopMusic();
    else if (screen === 'game') startMusic();
  }, [muted, screen]);

  const resetPuzzle = useCallback(() => {
    if (!difficulty) return;
    setGlasses(PUZZLES[difficulty].tubes.map(t => [...t]));
    setSelectedGlass(null);
    setMoves(0);
    setTimeLeft(TIME_LIMIT);
  }, [difficulty]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ─── Beach Background Component ──────────────────────────────────────
  const BeachBG = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {/* Sky */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(180deg, #4fc3f7 0%, #81d4fa 40%, #b3e5fc 70%, #e0f7fa 100%)' }} />
      {/* Sun */}
      <div style={{ position: 'absolute', top: '8%', right: '15%', width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, #fff9c4, #ffee58, #ffa726)', boxShadow: '0 0 40px rgba(255,238,88,0.6), 0 0 80px rgba(255,167,38,0.3)' }} />
      {/* Clouds */}
      {[
        { top: '10%', size: 80, dur: 45, delay: 0 },
        { top: '18%', size: 60, dur: 55, delay: 10 },
        { top: '6%', size: 50, dur: 65, delay: 25 },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: c.top, width: c.size, height: c.size * 0.5,
          borderRadius: '50%', background: 'rgba(255,255,255,0.85)',
          boxShadow: `${c.size * 0.4}px ${c.size * 0.1}px 0 rgba(255,255,255,0.7), ${-c.size * 0.3}px ${c.size * 0.05}px 0 rgba(255,255,255,0.6)`,
          animation: `cs-cloud ${c.dur}s linear infinite`,
          animationDelay: `${c.delay}s`
        }} />
      ))}
      {/* Seagulls */}
      {[{ top: '12%', left: '30%' }, { top: '16%', left: '55%' }, { top: '9%', left: '70%' }].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: 16, height: 6,
          borderTop: '2px solid rgba(50,50,50,0.5)',
          borderRadius: '50% 50% 0 0',
          transform: 'rotate(-5deg)',
          animation: `cs-float ${2 + i}s ease-in-out infinite`
        }}>
          <div style={{
            position: 'absolute', right: -8, top: 0,
            width: 10, height: 6,
            borderTop: '2px solid rgba(50,50,50,0.5)',
            borderRadius: '50% 50% 0 0',
            transform: 'scaleX(-1)'
          }} />
        </div>
      ))}
      {/* Ocean */}
      <div style={{ position: 'absolute', top: '55%', left: '-10%', right: '-10%', height: '25%', background: 'linear-gradient(180deg, #039be5, #0277bd, #01579b)', borderRadius: '50% 50% 0 0 / 20% 20% 0 0', animation: 'cs-wave 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '58%', left: '-10%', right: '-10%', height: '22%', background: 'linear-gradient(180deg, rgba(3,155,229,0.6), rgba(2,119,189,0.4))', borderRadius: '50% 50% 0 0 / 30% 30% 0 0', animation: 'cs-wave 8s ease-in-out infinite reverse' }} />
      {/* Sailboat */}
      <div style={{ position: 'absolute', top: '50%', left: '20%', animation: 'cs-float 4s ease-in-out infinite' }}>
        <div style={{ width: 30, height: 10, background: '#5d4037', borderRadius: '0 0 8px 8px' }} />
        <div style={{ position: 'absolute', bottom: 10, left: 13, width: 3, height: 30, background: '#4e342e' }} />
        <div style={{ position: 'absolute', bottom: 15, left: 16, width: 0, height: 0, borderLeft: '18px solid rgba(255,255,255,0.9)', borderTop: '12px solid transparent', borderBottom: '12px solid transparent' }} />
      </div>
      {/* Sand */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%', background: 'linear-gradient(180deg, #ffcc80, #ffe0b2, #fff3e0)' }} />
      {/* Palm tree */}
      <div style={{ position: 'absolute', bottom: '20%', left: '8%' }}>
        <div style={{ width: 8, height: 80, background: 'linear-gradient(90deg, #5d4037, #795548, #5d4037)', borderRadius: 4, transform: 'rotate(-5deg)' }} />
        {/* Leaves */}
        {[-60, -30, 0, 30, 60].map((angle, i) => (
          <div key={i} style={{
            position: 'absolute', top: -15, left: -20,
            width: 50, height: 12,
            background: 'linear-gradient(90deg, #2e7d32, #43a047, #66bb6a)',
            borderRadius: '50%',
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'right center'
          }} />
        ))}
      </div>
      {/* Palm tree right */}
      <div style={{ position: 'absolute', bottom: '20%', right: '6%' }}>
        <div style={{ width: 7, height: 70, background: 'linear-gradient(90deg, #5d4037, #795548, #5d4037)', borderRadius: 4, transform: 'rotate(3deg)' }} />
        {[-50, -20, 10, 40, 70].map((angle, i) => (
          <div key={i} style={{
            position: 'absolute', top: -12, left: -18,
            width: 45, height: 10,
            background: 'linear-gradient(90deg, #2e7d32, #43a047, #66bb6a)',
            borderRadius: '50%',
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'right center'
          }} />
        ))}
      </div>
    </div>
  );

  // ─── LANDSCAPE OVERLAY ────────────────────────────────────────────────
  if (!isLandscape) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #4fc3f7, #0288d1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📱</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Please Rotate Your Device</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>This game is best played in landscape mode</div>
      </div>
    );
  }

  // ─── Shared button style ──────────────────────────────────────────────
  const btnStyle = (bg = 'rgba(255,255,255,0.2)') => ({
    background: bg,
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: 14,
    padding: '10px 24px',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    textShadow: '0 1px 3px rgba(0,0,0,0.3)'
  });

  // ─── MENU SCREEN ──────────────────────────────────────────────────────
  if (screen === 'menu') {
    if (checkingDailyGame) {
      return (
        <div style={{ position: 'fixed', inset: 0, fontFamily: "'Segoe UI', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <BeachBG />
          <div style={{ position: 'relative', zIndex: 1 }}>Loading...</div>
        </div>
      );
    }
    const levels = [
      { key: 'easy', label: 'Easy', desc: '3 colors · 5 glasses', emoji: '🍹', color: '#69f0ae' },
      { key: 'medium', label: 'Medium', desc: '5 colors · 7 glasses', emoji: '🍸', color: '#ffa726' },
      { key: 'hard', label: 'Hard', desc: '7 colors · 9 glasses', emoji: '🥃', color: '#ef5350' }
    ];
    const availableLevels = isDailyGame && dailyGameDifficulty ? levels.filter(l => l.key === dailyGameDifficulty) : levels;
    return (
      <div style={{ position: 'fixed', inset: 0, fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden' }}>
        <BeachBG />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <button
            onClick={() => setShowInstructions(true)}
            style={{ position: 'absolute', top: 20, right: 20, padding: '10px 20px', borderRadius: 12, border: '2px solid rgba(255,167,38,0.6)', background: 'rgba(255,167,38,0.15)', color: '#ffa726', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
          >
            How to Play
          </button>
          {showInstructions && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowInstructions(false)}>
              <div style={{ background: 'linear-gradient(180deg, #1e2a38 0%, #0f172a 100%)', border: '2px solid rgba(255,167,38,0.5)', borderRadius: 20, padding: 28, maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', color: '#e2e8f0' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowInstructions(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#e2e8f0' }}>×</button>
                <h2 style={{ marginTop: 0, color: '#ffa726' }}>Cocktail Sort – How to Play</h2>
                <p><strong>Objective:</strong> Sort the liquid layers so each glass contains only one color (like a layered cocktail).</p>
                <p><strong>Rules:</strong> Tap a glass to select it, then tap another to pour the top layer. You can only pour onto an empty glass or on top of the same color. Complete in fewer moves than par for a higher score.</p>
                <p><strong>Scoring:</strong> Score up to 200. Fewer moves than par = better score. You have 3 minutes; if time runs out, the game ends.</p>
              </div>
            </div>
          )}
          <div style={{ fontSize: 56, marginBottom: 8 }}>🍹</div>
          <h1 style={{ color: '#fff', fontSize: 38, fontWeight: 800, margin: '0 0 6px', letterSpacing: -1, textShadow: '0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,167,38,0.3)' }}>Cocktail Sort</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: '0 0 8px', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>Sort the cocktails by color — pour and match!</p>
          {isDailyGame && (
            <div style={{ marginBottom: 20, padding: '6px 16px', background: 'rgba(255,167,38,0.2)', border: '1px solid rgba(255,167,38,0.5)', borderRadius: 20, fontSize: 13, color: '#ffa726', fontWeight: 600 }}>
              Daily Challenge
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {availableLevels.map(l => (
              <button key={l.key} onClick={() => !isDailyGame && startGame(l.key)} style={{
                background: isDailyGame ? `${l.color}33` : 'rgba(255,255,255,0.15)',
                border: `2px solid ${l.color}88`,
                borderRadius: 18,
                padding: '24px 32px',
                cursor: isDailyGame ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                minWidth: 160,
                transition: 'all 0.25s',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={e => { if (!isDailyGame) { e.currentTarget.style.background = `${l.color}33`; e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.borderColor = l.color; } }}
              onMouseLeave={e => { e.currentTarget.style.background = isDailyGame ? `${l.color}33` : 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = `${l.color}88`; }}
              >
                <span style={{ fontSize: 36 }}>{l.emoji}</span>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{l.label}</span>
                <span style={{ fontSize: 12, opacity: 0.8 }}>{l.desc}</span>
              </button>
            ))}
          </div>
          {isDailyGame && (
            <button onClick={() => startGame(dailyGameDifficulty)} style={{ marginTop: 20, padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #ffa726, #ef6c00)', color: '#fff', boxShadow: '0 4px 20px rgba(255,167,38,0.4)' }}>
              Start Game
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── GAME SCREEN (and finished: game visible behind modal) ──────────────
  const glassWidth = 80;
  const layerHeight = 42;
  const glassHeight = MAX_LAYERS * (layerHeight + 4) + 36;
  const glassGap = 18;
  const timeElapsedForModal = completionData?.timeElapsed ?? (screen === 'finished' ? TIME_LIMIT : TIME_LIMIT - timeLeft);

  // Calculate pour animation position
  const pourElement = (() => {
    if (!pourAnim) return null;
    const fromEl = glassRefs.current[pourAnim.fromIdx];
    const toEl = glassRefs.current[pourAnim.toIdx];
    if (!fromEl || !toEl) return null;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;
    const c = LIQUID_COLORS[pourAnim.color];
    return { x: fromRect.left + fromRect.width / 2 - 18, y: fromRect.top - 30, dx, dy, c };
  })();

  return (
    <>
      {(screen === 'game' || screen === 'finished') && (
    <div style={{ position: 'fixed', inset: 0, fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden', userSelect: 'none', zIndex: 1 }}>
      <BeachBG />

      {/* Pour animation blob */}
      {pourElement && (
        <div style={{
          position: 'fixed',
          left: pourElement.x,
          top: pourElement.y,
          width: 36,
          height: 28,
          borderRadius: '50% 50% 50% 50%',
          background: pourElement.c.bg,
          boxShadow: `0 0 20px ${pourElement.c.glow}88, 0 4px 12px rgba(0,0,0,0.3)`,
          '--pour-dx': `${pourElement.dx}px`,
          '--pour-dx-mid': `${pourElement.dx / 2}px`,
          '--pour-dy': `${pourElement.dy + 60}px`,
          animation: 'cs-pour-arc 0.5s ease-in-out forwards',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          {/* Liquid drip trail */}
          <div style={{
            position: 'absolute', bottom: -6, left: '30%', width: '40%', height: 8,
            borderRadius: '50%', background: pourElement.c.glow,
            opacity: 0.5, filter: 'blur(2px)'
          }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        {/* HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 14, padding: '10px 28px', background: 'rgba(0,0,0,0.3)', borderRadius: 20, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 15 }}>
            <span>⏱</span>
            <span style={{ fontWeight: 700, fontSize: 20, color: timeLeft < 30 ? '#ff8a80' : '#fff59d', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 15 }}>
            <span>👆</span>
            <span style={{ fontWeight: 600 }}>Moves: {moves}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 15 }}>
            <span>🎯</span>
            <span style={{ fontWeight: 600 }}>Par: {par}</span>
          </div>
          <button onClick={toggleMute} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 20 }}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Glasses */}
        <div style={{ display: 'flex', gap: glassGap, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '95vw', padding: '0 10px' }}>
          {glasses.map((glass, gi) => {
            const isSelected = selectedGlass === gi;
            const isShaking = shakeGlass === gi;
            return (
              <div
                key={gi}
                ref={el => glassRefs.current[gi] = el}
                onClick={() => handleGlassTap(gi)}
                style={{
                  width: glassWidth,
                  minHeight: glassHeight + 24,
                  cursor: 'pointer',
                  position: 'relative',
                  animation: isShaking ? 'cs-shake 0.4s ease' : isSelected ? 'cs-float 1.5s ease-in-out infinite' : 'none',
                  transition: 'filter 0.2s, transform 0.2s',
                  filter: isSelected ? 'drop-shadow(0 0 18px rgba(255,255,255,0.6))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {/* Glass rim — elliptical top */}
                <div style={{
                  width: glassWidth - 4,
                  height: 10,
                  margin: '0 auto',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.35)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                  position: 'relative',
                  zIndex: 3
                }} />
                {/* Glass body - tapered */}
                <div style={{
                  width: '100%',
                  height: glassHeight,
                  clipPath: 'polygon(5% 0%, 95% 0%, 85% 100%, 15% 100%)',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.15) 70%, rgba(255,255,255,0.06) 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  marginTop: -5,
                }}>
                  {/* Left glass edge reflection */}
                  <div style={{
                    position: 'absolute', top: 0, left: '8%', width: '3px', height: '90%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), transparent)',
                    borderRadius: 2, zIndex: 5
                  }} />
                  {/* Right glass edge subtle */}
                  <div style={{
                    position: 'absolute', top: '5%', right: '10%', width: '2px', height: '70%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)',
                    borderRadius: 2, zIndex: 5
                  }} />
                  {/* Main glass highlight / reflection */}
                  <div style={{
                    position: 'absolute', top: '5%', left: '18%', width: '12%', height: '75%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08), transparent)',
                    borderRadius: 6, zIndex: 5,
                    filter: 'blur(1px)'
                  }} />
                  {/* Liquid layers - stacked from bottom */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    display: 'flex', flexDirection: 'column-reverse',
                    alignItems: 'center', padding: '6px 0'
                  }}>
                    {glass.map((layer, li) => {
                      const isTop = li === glass.length - 1;
                      const isLifted = isTop && isSelected;
                      const isDropping = isTop && droppingGlass === gi;
                      const c = LIQUID_COLORS[layer];
                      // Width narrows toward bottom following the glass taper
                      const widthPct = 62 + ((li + 1) / MAX_LAYERS) * 22;
                      return (
                        <div key={li} style={{
                          width: `${widthPct}%`,
                          height: layerHeight,
                          background: c.bg,
                          borderRadius: li === 0 ? '0 0 6px 6px' : '3px',
                          margin: '1.5px 0',
                          boxShadow: `inset 0 3px 8px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.2), 0 0 12px ${c.glow}55`,
                          animation: isLifted ? 'cs-lift 0.25s ease-out forwards' : isDropping ? 'cs-drop 0.3s ease-out' : 'none',
                          zIndex: isLifted ? 10 : 1,
                          position: 'relative',
                          transition: 'box-shadow 0.2s'
                        }}>
                          {/* Liquid surface shine */}
                          <div style={{
                            position: 'absolute', top: 3, left: '8%', width: '55%', height: 4,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
                            borderRadius: 3
                          }} />
                          {/* Bubble details on liquid */}
                          {li === glass.length - 1 && (
                            <>
                              <div style={{
                                position: 'absolute', top: 6, right: '20%', width: 5, height: 5,
                                borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.1)'
                              }} />
                              <div style={{
                                position: 'absolute', top: 10, right: '35%', width: 3, height: 3,
                                borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)'
                              }} />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Empty glass indicator */}
                  {glass.length === 0 && (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: 24, opacity: 0.2, color: '#fff' }}>+</span>
                    </div>
                  )}
                </div>
                {/* Glass stem */}
                <div style={{
                  width: 8, height: 18, background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.3), rgba(255,255,255,0.15))',
                  margin: '0 auto', borderRadius: '0 0 3px 3px'
                }} />
                {/* Glass base */}
                <div style={{
                  width: glassWidth * 0.65, height: 6,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15))',
                  margin: '0 auto', borderRadius: '0 0 4px 4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }} />
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
          <button onClick={resetPuzzle} style={btnStyle()}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
            🔄 Reset
          </button>
          <button onClick={() => { stopMusic(); handleReset(); }} style={btnStyle()}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
      )}
      <GameCompletionModal
        isVisible={screen === 'finished' && completionData != null}
        onClose={handleReset}
        gameTitle="Cocktail Sort"
        score={completionData?.score ?? score}
        moves={completionData?.moves ?? moves}
        timeElapsed={timeElapsedForModal}
        gameTimeLimit={TIME_LIMIT}
        isVictory={completionData?.isVictory ?? false}
        difficulty={completionData?.difficulty ?? difficulty}
        customMessages={{
          maxScore: 200,
          stats: completionData != null ? `Moves: ${completionData.moves} / par ${completionData.par} • ${Math.floor((completionData.timeElapsed ?? 0) / 60)}:${String((completionData.timeElapsed ?? 0) % 60).padStart(2, '0')}` : '',
        }}
      />
    </>
  );
}
