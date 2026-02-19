import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

// ─── PUZZLE DATA (hand-crafted, guaranteed solvable) ──────────────────────────
const PUZZLES = {
  easy: {
    colors: 3, par: 12,
    // 3 filled tubes + 2 empty, 4 balls each color
    tubes: [
      ['red', 'blue', 'gold', 'red'],
      ['gold', 'red', 'blue', 'gold'],
      ['blue', 'gold', 'red', 'blue'],
      [], []
    ]
  },
  medium: {
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
  hard: {
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

function playPop() { playTone(600, 0.1, 'sine', 0.4); setTimeout(() => playTone(900, 0.08, 'sine', 0.2), 50); }
function playDrop() { playTone(300, 0.15, 'triangle', 0.35); setTimeout(() => playTone(200, 0.1, 'triangle', 0.2), 80); }
function playBuzz() { playTone(100, 0.25, 'sawtooth', 0.15); playTone(120, 0.25, 'sawtooth', 0.15); }
function playChime() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.4, 'sine', 0.3), i * 120));
}

function startMusic() {
  if (!audioCtx) return;
  stopMusic();
  const chords = [[261, 329, 392], [293, 349, 440], [329, 392, 493], [261, 329, 392]];
  let chordIdx = 0;
  function playChord() {
    const chord = chords[chordIdx % chords.length];
    chord.forEach(f => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.04, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.8);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 4);
      musicNodes.push(osc);
    });
    chordIdx++;
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
    @keyframes bs-confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(400px) rotate(720deg); opacity: 0; } }
    @keyframes bs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes bs-particle { 0% { opacity: 0.7; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); } }
    @keyframes bs-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); } 50% { box-shadow: 0 0 20px 8px rgba(255,255,255,0.15); } }
    @keyframes bs-star { 0% { transform: scale(0) rotate(0); opacity: 0; } 50% { transform: scale(1.3) rotate(180deg); opacity: 1; } 100% { transform: scale(1) rotate(360deg); opacity: 1; } }
  `;
  document.head.appendChild(style);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BallSort() {
  const location = useLocation();
  const [screen, setScreen] = useState('menu'); // menu | game | finished
  const [difficulty, setDifficulty] = useState(null);
  const [tubes, setTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [muted, setMutedState] = useState(false);
  const [shakeTube, setShakeTube] = useState(null);
  const [droppingTube, setDroppingTube] = useState(null);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [isLandscape, setIsLandscape] = useState(true);
  const [particles, setParticles] = useState([]);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const timerRef = useRef(null);
  const particleId = useRef(0);
  const playingRef = useRef({ moves: 0, timeLeft: TIME_LIMIT, difficulty: null, par: 12 });
  playingRef.current = { moves, timeLeft, difficulty, par: difficulty ? PUZZLES[difficulty].par : 12 };

  const tRotateDevice = useTranslateText('Please Rotate Your Device');
  const tLandscapeMode = useTranslateText('This game is best played in landscape mode');
  const tLoading = useTranslateText('Loading...');
  const tHowToPlay = useTranslateText('How to Play');
  const tGameTitle = useTranslateText('Ball Sort Puzzle');
  const tHowToPlayTitle = useTranslateText('Ball Sort Puzzle – How to Play');
  const tObjective = useTranslateText('Objective');
  const tObjectiveDesc = useTranslateText('Sort all colored balls into tubes so each tube contains only one color.');
  const tRules = useTranslateText('Rules');
  const tRulesDesc = useTranslateText('You can only move the top ball of a tube. You can place a ball on an empty tube or on top of the same color. Complete in fewer moves than par for a higher score.');
  const tScoring = useTranslateText('Scoring');
  const tScoringDesc = useTranslateText('Score up to 200. Fewer moves than par = better score. You have 3 minutes; if time runs out, the game ends.');
  const tSubtitle = useTranslateText('Sort the colored balls into tubes');
  const tDailyChallenge = useTranslateText('Daily Challenge');
  const tEasy = useTranslateText('Easy');
  const tMedium = useTranslateText('Medium');
  const tHard = useTranslateText('Hard');
  const tDescEasy = useTranslateText('3 colors · 5 tubes');
  const tDescMedium = useTranslateText('5 colors · 7 tubes');
  const tDescHard = useTranslateText('7 colors · 9 tubes');
  const tStartGame = useTranslateText('Start Game');
  const tMoves = useTranslateText('Moves:');
  const tPar = useTranslateText('Par:');
  const tMovesLabel = useTranslateText('Moves');
  const tParLabel = useTranslateText('par');
  const tReset = useTranslateText('Reset');
  const tMenu = useTranslateText('Menu');

  useEffect(() => { injectStyles(); }, []);

  // Landscape check
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setIsLandscape(w >= 600 || w > h);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Daily game detection
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

  // Timer (time-up -> finished with completionData)
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

  const checkWin = useCallback((t) => {
    return t.every(tube => tube.length === 0 || (tube.length === MAX_BALLS && tube.every(b => b === tube[0])));
  }, []);

  const endGame = useCallback((won) => {
    clearInterval(timerRef.current);
    stopMusic();
    if (won) {
      const s = Math.min(200, Math.round(200 * Math.min(1, par / Math.max(1, moves + 1))));
      setScore(s);
      setStars(s >= 180 ? 3 : s >= 120 ? 2 : 1);
      playChime();
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
    setTubes(PUZZLES[diff].tubes.map(t => [...t]));
    setSelectedTube(null);
    setMoves(0);
    setTimeLeft(TIME_LIMIT);
    setShakeTube(null);
    setDroppingTube(null);
    setCompletionData(null);
    setScreen('game');
    if (!muted) startMusic();
  }, [muted]);

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
    if (screen !== 'game') return;
    const tube = tubes[idx];

    if (selectedTube === null) {
      // Pick up
      if (tube.length === 0) return;
      initAudio();
      playPop();
      setSelectedTube(idx);
    } else if (selectedTube === idx) {
      // Cancel
      setSelectedTube(null);
    } else {
      // Try to drop
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
        // Particles at drop location
        if (e) {
          const rect = e.currentTarget.getBoundingClientRect();
          spawnParticles(rect.left + rect.width / 2, rect.top + 20, ball);
        }
        setTimeout(() => setDroppingTube(null), 300);
        // Check win after state update
        setTimeout(() => {
          if (checkWin(newTubes)) endGame(true);
        }, 350);
      } else {
        playBuzz();
        setShakeTube(idx);
        setTimeout(() => setShakeTube(null), 400);
      }
    }
  }, [screen, tubes, selectedTube, checkWin, endGame, spawnParticles]);

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
    setTubes(PUZZLES[difficulty].tubes.map(t => [...t]));
    setSelectedTube(null);
    setMoves(0);
    setTimeLeft(TIME_LIMIT);
  }, [difficulty]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ─── LANDSCAPE OVERLAY ────────────────────────────────────────────────
  if (!isLandscape) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0a2e, #1a1a4e)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📱</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{tRotateDevice}</div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>{tLandscapeMode}</div>
      </div>
    );
  }

  // ─── MENU SCREEN ──────────────────────────────────────────────────────
  if (screen === 'menu') {
    if (checkingDailyGame) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div>{tLoading}</div>
        </div>
      );
    }
    const levels = [
      { key: 'easy', label: tEasy, desc: tDescEasy, emoji: '🟢', color: '#00b894' },
      { key: 'medium', label: tMedium, desc: tDescMedium, emoji: '🟡', color: '#f39c12' },
      { key: 'hard', label: tHard, desc: tDescHard, emoji: '🔴', color: '#e74c3c' }
    ];
    const availableLevels = isDailyGame && dailyGameDifficulty ? levels.filter(l => l.key === dailyGameDifficulty) : levels;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0d0d35 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden' }}>
        <button
          onClick={() => setShowInstructions(true)}
          style={{ position: 'absolute', top: 20, right: 20, padding: '10px 20px', borderRadius: 12, border: '2px solid rgba(116,185,255,0.6)', background: 'rgba(116,185,255,0.15)', color: '#74b9ff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
        >
          {tHowToPlay}
        </button>
        {showInstructions && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowInstructions(false)}>
            <div style={{ background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)', border: '2px solid rgba(116,185,255,0.5)', borderRadius: 20, padding: 28, maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', color: '#e2e8f0' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowInstructions(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#e2e8f0' }}>×</button>
              <h2 style={{ marginTop: 0, color: '#74b9ff' }}>{tHowToPlayTitle}</h2>
              <p><strong>{tObjective}:</strong> {tObjectiveDesc}</p>
              <p><strong>{tRules}:</strong> {tRulesDesc}</p>
              <p><strong>{tScoring}:</strong> {tScoringDesc}</p>
            </div>
          </div>
        )}
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            borderRadius: '50%',
            background: `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `bs-float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }} />
        ))}
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧪</div>
        <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 800, margin: '0 0 6px', letterSpacing: -1, textShadow: '0 0 40px rgba(116,185,255,0.4)' }}>{tGameTitle}</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 8px' }}>{tSubtitle}</p>
        {isDailyGame && (
          <div style={{ marginBottom: 20, padding: '6px 16px', background: 'rgba(116,185,255,0.2)', border: '1px solid rgba(116,185,255,0.5)', borderRadius: 20, fontSize: 13, color: '#74b9ff', fontWeight: 600 }}>
            {tDailyChallenge}
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {availableLevels.map(l => (
            <button key={l.key} onClick={() => !isDailyGame && startGame(l.key)} style={{
              background: isDailyGame ? `${l.color}22` : 'rgba(255,255,255,0.06)',
              border: `2px solid ${l.color}44`,
              borderRadius: 16,
              padding: '24px 32px',
              cursor: isDailyGame ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              minWidth: 160,
              transition: 'all 0.2s',
              color: '#fff'
            }}
            onMouseEnter={e => { if (!isDailyGame) { e.currentTarget.style.background = `${l.color}22`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${l.color}88`; } }}
            onMouseLeave={e => { e.currentTarget.style.background = isDailyGame ? `${l.color}22` : 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${l.color}44`; }}
            >
              <span style={{ fontSize: 32 }}>{l.emoji}</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{l.label}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>{l.desc}</span>
            </button>
          ))}
        </div>
        {isDailyGame && (
          <button onClick={() => startGame(dailyGameDifficulty)} style={{ marginTop: 20, padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #74b9ff, #0984e3)', color: '#fff', boxShadow: '0 4px 20px rgba(116,185,255,0.4)' }}>
            {tStartGame}
          </button>
        )}
      </div>
    );
  }

  // ─── GAME SCREEN (and finished: game visible behind modal) ─────────────────
  const tubeWidth = 56;
  const ballSize = 40;
  const tubeHeight = MAX_BALLS * (ballSize + 4) + 24;
  const timeElapsedForModal = completionData?.timeElapsed ?? (screen === 'finished' ? TIME_LIMIT : TIME_LIMIT - timeLeft);

  return (
    <>
      {(screen === 'game' || screen === 'finished') && (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0d0d35 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden', userSelect: 'none', zIndex: 1 }}>
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
          animationDelay: `${Math.random() * 5}s`
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

      {/* HUD */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, color: '#fff', fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⏱</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: timeLeft < 30 ? '#ff6b6b' : '#ffeaa7', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>👆</span>
          <span style={{ fontWeight: 600 }}>{tMoves} {moves}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🎯</span>
          <span style={{ fontWeight: 600 }}>{tPar} {par}</span>
        </div>
        <button onClick={toggleMute} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 18 }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Tubes */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '90vw' }}>
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
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: selectedTube === ti ? '0 0 20px rgba(116,185,255,0.3), inset 0 0 20px rgba(116,185,255,0.1)' : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: shakeTube === ti ? 'bs-shake 0.4s ease' : droppingTube === ti ? 'none' : (selectedTube === ti ? 'bs-pulse 2s ease-in-out infinite' : 'none'),
            position: 'relative',
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
            {/* Empty tube indicator */}
            {tube.length === 0 && (
              <div style={{ width: ballSize - 8, height: ballSize - 8, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, opacity: 0.3 }}>+</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom controls */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={resetPuzzle} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
          🔄 {tReset}
        </button>
        <button onClick={() => { stopMusic(); handleReset(); }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
          🏠 {tMenu}
        </button>
      </div>
    </div>
      )}
      <GameCompletionModal
        isVisible={screen === 'finished' && completionData != null}
        onClose={handleReset}
        gameTitle={tGameTitle}
        score={completionData?.score ?? score}
        moves={completionData?.moves ?? moves}
        timeElapsed={timeElapsedForModal}
        gameTimeLimit={TIME_LIMIT}
        isVictory={completionData?.isVictory ?? false}
        difficulty={completionData?.difficulty ?? difficulty}
        customMessages={{
          maxScore: 200,
          stats: completionData != null ? `${tMovesLabel} ${completionData.moves} / ${tParLabel} ${completionData.par} • ${Math.floor((completionData.timeElapsed ?? 0) / 60)}:${String((completionData.timeElapsed ?? 0) % 60).padStart(2, '0')}` : '',
        }}
      />
    </>
  );
}
