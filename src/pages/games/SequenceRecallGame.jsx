import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

const MAX_SCORE = 200;
const TIME_LIMIT = 120;

const LEVELS = {
  easy: { label: 'Easy', startLen: 3, maxLen: 8, colors: 4, speedMs: 600 },
  moderate: { label: 'Moderate', startLen: 4, maxLen: 10, colors: 6, speedMs: 450 },
  hard: { label: 'Hard', startLen: 5, maxLen: 12, colors: 8, speedMs: 300 },
};

const COLOR_PALETTE = [
  { bg: '#ef4444', glow: '#fca5a5', name: 'Red' },
  { bg: '#3b82f6', glow: '#93c5fd', name: 'Blue' },
  { bg: '#22c55e', glow: '#86efac', name: 'Green' },
  { bg: '#eab308', glow: '#fde047', name: 'Yellow' },
  { bg: '#a855f7', glow: '#d8b4fe', name: 'Purple' },
  { bg: '#f97316', glow: '#fdba74', name: 'Orange' },
  { bg: '#06b6d4', glow: '#67e8f9', name: 'Cyan' },
  { bg: '#ec4899', glow: '#f9a8d4', name: 'Pink' },
];

const audioCtxRef = { current: null };
function getAudioCtx() {
  if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtxRef.current;
}

function playTone(freq, duration = 0.15, type = 'sine') {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

const NOTE_FREQS = [261, 329, 392, 523, 587, 659, 784, 880];

function playSuccess() {
  [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.12), i * 80));
}
function playFail() {
  [200, 150].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sawtooth'), i * 120));
}
function playWin() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 100));
}

export default function RecallSequence({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [round, setRound] = useState(0);
  const [showingIdx, setShowingIdx] = useState(-1);
  const [activeBtn, setActiveBtn] = useState(-1);
  const [feedback, setFeedback] = useState(null);
  const [combo, setCombo] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [result, setResult] = useState(null);
  const [containerSize, setContainerSize] = useState({ w: 400, h: 400 });
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const timerRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const processingRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(0);
  const timeLeftRef = useRef(TIME_LIMIT);
  const containerRef = useRef(null);
  const location = useLocation();

  timeLeftRef.current = timeLeft;

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [phase]);

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
          const map = { easy: 'easy', medium: 'moderate', moderate: 'moderate', hard: 'hard' };
          if (map[d] && LEVELS[map[d]]) {
            setIsDailyGame(true);
            setDailyGameDifficulty(map[d]);
            setLevel(map[d]);
          } else {
            setIsDailyGame(false);
            setDailyGameDifficulty(null);
            setLevel(null);
          }
        } else {
          setIsDailyGame(false);
          setDailyGameDifficulty(null);
          setLevel(null);
        }
      } catch (e) {
        console.error('Daily check failed', e);
        setIsDailyGame(false);
        setDailyGameDifficulty(null);
        setLevel(null);
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

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    timerRef.current = null;
    showTimeoutRef.current = null;
    processingRef.current = true;
    setCompletionData(null);
    setPhase('menu');
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('gameover');
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty: level,
            timeElapsed: TIME_LIMIT,
          });
          return 0;
        }
        if (t <= 11) playTone(880, 0.05);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, level]);

  const startGame = (lvl) => {
    const cfg = LEVELS[lvl];
    if (!cfg) return;
    setCompletionData(null);
    const rounds = cfg.maxLen - cfg.startLen + 1;
    setLevel(lvl);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setRound(0);
    setCombo(0);
    setTotalRounds(rounds);
    setResult(null);
    setFeedback(null);
    setPlayerInput([]);
    setPhase('playing');
    processingRef.current = false;
    setTimeout(() => startRound(lvl, 0), 600);
  };

  const startRound = (lvl, r) => {
    const cfg = LEVELS[lvl];
    const len = cfg.startLen + r;
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * cfg.colors));
    setSequence(seq);
    setPlayerInput([]);
    setFeedback(null);
    processingRef.current = true;
    showSequence(seq, cfg.speedMs);
  };

  const showSequence = (seq, speed) => {
    setShowingIdx(-1);
    let i = 0;
    const show = () => {
      if (i >= seq.length) {
        setShowingIdx(-1);
        processingRef.current = false;
        return;
      }
      setShowingIdx(seq[i]);
      playTone(NOTE_FREQS[seq[i]], 0.15);
      showTimeoutRef.current = setTimeout(() => {
        setShowingIdx(-1);
        i++;
        showTimeoutRef.current = setTimeout(show, speed * 0.3);
      }, speed);
    };
    showTimeoutRef.current = setTimeout(show, 400);
  };

  const handlePress = (colorIdx) => {
    if (processingRef.current || phase !== 'playing') return;
    playTone(NOTE_FREQS[colorIdx], 0.1);
    setActiveBtn(colorIdx);
    setTimeout(() => setActiveBtn(-1), 150);

    const newInput = [...playerInput, colorIdx];
    setPlayerInput(newInput);
    const pos = newInput.length - 1;

    if (sequence[pos] !== colorIdx) {
      playFail();
      setShakeWrong(true);
      setCombo(0);
      setFeedback('wrong');
      setTimeout(() => {
        setShakeWrong(false);
        setFeedback(null);
        setPlayerInput([]);
        processingRef.current = true;
        showSequence(sequence, LEVELS[level].speedMs);
      }, 800);
      return;
    }

    if (newInput.length === sequence.length) {
      processingRef.current = true;
      const newCombo = combo + 1;
      setCombo(newCombo);
      const currentRound = roundRef.current;
      const cfg = LEVELS[level];
      const rounds = cfg.maxLen - cfg.startLen + 1;
      const pointsPerRound = Math.floor(MAX_SCORE / rounds);
      const isLast = currentRound >= rounds - 1;
      const earned = isLast ? MAX_SCORE - pointsPerRound * (rounds - 1) : pointsPerRound;
      const bonus = Math.min(newCombo - 1, 3) * 2;
      const newScore = Math.min(scoreRef.current + earned + bonus, MAX_SCORE);
      setScore(newScore);
      setFeedback('correct');
      playSuccess();

      setTimeout(() => {
        setFeedback(null);
        if (isLast || newScore >= MAX_SCORE) {
          endGame('win');
        } else {
          const nextRound = currentRound + 1;
          setRound(nextRound);
          startRound(level, nextRound);
        }
      }, 800);
    }
  };

  const endGame = (reason) => {
    clearInterval(timerRef.current);
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = null;
    processingRef.current = true;
    if (reason === 'win') playWin();
    setResult(reason);
    setCompletionData({
      score: scoreRef.current,
      isVictory: reason === 'win',
      difficulty: level,
      timeElapsed: TIME_LIMIT - timeLeftRef.current,
    });
    setPhase('gameover');
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const numColors = level ? LEVELS[level].colors : 4;
  const colors = COLOR_PALETTE.slice(0, numColors);

  const minDim = Math.min(containerSize.w, containerSize.h);
  const btnSize = Math.max(48, Math.min(minDim * 0.18, 120));
  const gap = Math.max(8, btnSize * 0.15);

  const getGridLayout = () => {
    if (numColors <= 4) return { cols: 2, rows: 2 };
    if (numColors <= 6) return { cols: 3, rows: 2 };
    return { cols: 4, rows: 2 };
  };
  const { cols, rows } = getGridLayout();

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, LEVELS[dailyGameDifficulty]]].filter(([, c]) => c)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : level;

  const instructionsModalContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>Choose a difficulty (Easy / Moderate / Hard). Each level has more colors and longer sequences.</li>
        <li><strong>Watch</strong> the sequence as the game flashes the colored buttons in order.</li>
        <li><strong>Repeat</strong> the same sequence by tapping the buttons in the correct order.</li>
        <li>Complete all rounds before time runs out. You have <strong>2 minutes</strong> and can score up to <strong>200</strong> points.</li>
        <li>Consecutive correct rounds build a <strong>combo</strong> for bonus points. One wrong tap replays the sequence.</li>
      </ul>
    </>
  );

  const styles = {
    wrapper: {
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#e2e8f0', overflow: 'hidden',
    },
    header: {
      width: '100%', padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 10,
      flexShrink: 0,
    },
    backBtn: {
      background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e2e8f0',
      padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
    },
    scoreBox: {
      background: 'rgba(255,255,255,0.08)', padding: '4px 14px', borderRadius: 12,
      fontSize: 15, fontWeight: 700,
    },
    timerBox: (urgent) => ({
      padding: '4px 14px', borderRadius: 12, fontSize: 15, fontWeight: 700,
      background: urgent ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
      color: urgent ? '#fca5a5' : '#e2e8f0',
      animation: urgent ? 'rs-pulse 1s infinite' : 'none',
    }),
    content: {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      width: '100%', maxWidth: 700, padding: 16,
    },
    roundLabel: {
      fontSize: Math.max(14, minDim * 0.035), fontWeight: 600,
      marginBottom: 8, color: '#94a3b8', letterSpacing: 1,
    },
    feedbackLabel: {
      fontSize: Math.max(18, minDim * 0.05), fontWeight: 800,
      marginBottom: 12, minHeight: 36,
      transition: 'all 0.2s',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${btnSize}px)`,
      gap: gap,
      marginBottom: 16,
    },
    colorBtn: (color, isActive, isShowing) => ({
      width: btnSize, height: btnSize,
      borderRadius: btnSize * 0.2,
      border: '3px solid rgba(255,255,255,0.15)',
      background: color.bg,
      cursor: processingRef.current ? 'default' : 'pointer',
      transition: 'all 0.12s ease',
      transform: (isActive || isShowing) ? 'scale(1.12)' : 'scale(1)',
      boxShadow: (isActive || isShowing)
        ? `0 0 30px ${color.glow}, 0 0 60px ${color.glow}40, inset 0 0 20px rgba(255,255,255,0.3)`
        : `0 4px 15px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)`,
      opacity: (isActive || isShowing) ? 1 : 0.7,
      position: 'relative',
      overflow: 'hidden',
    }),
    btnShine: {
      position: 'absolute', top: '10%', left: '15%',
      width: '35%', height: '25%',
      background: 'radial-gradient(ellipse, rgba(255,255,255,0.4), transparent)',
      borderRadius: '50%', pointerEvents: 'none',
    },
    progressTrack: {
      width: '80%', maxWidth: 350, height: 8, borderRadius: 4,
      background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 8,
    },
    progressBar: {
      height: '100%', borderRadius: 4,
      background: 'linear-gradient(90deg, #6366f1, #a855f7)',
      transition: 'width 0.4s ease',
    },
    inputDots: {
      display: 'flex', gap: 6, marginTop: 8, minHeight: 20,
    },
    dot: (color, filled) => ({
      width: 14, height: 14, borderRadius: '50%',
      background: filled ? color.bg : 'rgba(255,255,255,0.15)',
      border: `2px solid ${filled ? color.glow : 'rgba(255,255,255,0.2)'}`,
      transition: 'all 0.2s',
      boxShadow: filled ? `0 0 8px ${color.glow}` : 'none',
    }),
    menuCard: {
      background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
      borderRadius: 24, padding: '40px 32px',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center', maxWidth: 420, width: '90%',
    },
    menuTitle: {
      fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900,
      background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: 8,
    },
    menuSub: {
      fontSize: 14, color: '#94a3b8', marginBottom: 28, lineHeight: 1.5,
    },
    levelBtn: (idx) => {
      const gradients = [
        'linear-gradient(135deg, #22c55e, #16a34a)',
        'linear-gradient(135deg, #eab308, #f59e0b)',
        'linear-gradient(135deg, #ef4444, #dc2626)',
      ];
      return {
        width: '100%', padding: '14px 0', borderRadius: 14,
        background: gradients[idx], border: 'none', color: '#fff',
        fontSize: 16, fontWeight: 700, cursor: 'pointer',
        marginBottom: 10, transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      };
    },
    levelDesc: { fontSize: 11, fontWeight: 400, opacity: 0.85 },
    resultCard: {
      background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
      borderRadius: 24, padding: '36px 28px',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center', maxWidth: 380, width: '90%',
    },
    resultEmoji: { fontSize: 56, marginBottom: 12 },
    resultTitle: { fontSize: 28, fontWeight: 800, marginBottom: 8 },
    resultScore: {
      fontSize: 40, fontWeight: 900,
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: 16,
    },
    playAgainBtn: {
      padding: '12px 32px', borderRadius: 14,
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      border: 'none', color: '#fff', fontSize: 16, fontWeight: 700,
      cursor: 'pointer', marginBottom: 8, width: '100%',
    },
    menuBtn: {
      padding: '10px 32px', borderRadius: 14,
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
      color: '#e2e8f0', fontSize: 14, cursor: 'pointer', width: '100%',
    },
    comboTag: {
      position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      padding: '2px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
      color: '#fff', whiteSpace: 'nowrap',
      animation: 'rs-comboPop 0.4s ease-out',
    },
  };

  const css = `
    @keyframes rs-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes rs-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
    @keyframes rs-comboPop { 0%{transform:translateX(-50%) scale(0.5);opacity:0} 50%{transform:translateX(-50%) scale(1.2)} 100%{transform:translateX(-50%) scale(1);opacity:1} }
    @keyframes rs-glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 40px rgba(99,102,241,0.6)} }
    @keyframes rs-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  `;

  return (
    <div style={styles.wrapper}>
      <style>{css}</style>
      <div style={styles.header}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🧠 Recall Sequence</span>
        {phase === 'menu' ? (
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
            <span aria-hidden>❓</span> How to Play
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={styles.scoreBox}>⭐ {score}/{MAX_SCORE}</div>
            <div style={styles.timerBox(timeLeft <= 10)}>⏱ {formatTime(timeLeft)}</div>
          </div>
        )}
      </div>

      {phase === 'menu' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sequence-recall-instructions-title"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(139,92,246,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <h2 id="sequence-recall-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#a855f7' }}>
                    🧠 Recall Sequence – How to Play
                  </h2>
                  <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close"
                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    ×
                  </button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{instructionsModalContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <button type="button" onClick={() => setShowInstructions(false)}
                    style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={styles.menuCard}>
            {isDailyGame && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(168,85,247,0.2)', color: '#c084fc', fontSize: 12, fontWeight: 600 }}>
                📅 Daily Challenge
              </div>
            )}
            <div style={styles.menuTitle}>Recall Sequence</div>
            <p style={styles.menuSub}>
              Watch the color sequence flash, then repeat it in order.<br />
              How far can your memory take you?
            </p>
            {!checkingDailyGame && levelEntries.map(([key, cfg], idx) => (
              <button
                key={key}
                style={{
                  ...styles.levelBtn(idx),
                  opacity: selectedLevel === key ? 1 : 0.85,
                  border: selectedLevel === key ? '3px solid rgba(255,255,255,0.5)' : 'none',
                }}
                onMouseEnter={e => { e.target.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
                onClick={() => !isDailyGame && setLevel(key)}
              >
                {cfg.label}
                <div style={styles.levelDesc}>
                  {cfg.colors} colors · Start at {cfg.startLen} · Up to {cfg.maxLen}
                </div>
              </button>
            ))}
            <button
              style={{ ...styles.levelBtn(0), marginTop: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              disabled={!selectedLevel || checkingDailyGame}
              onClick={() => startGame(selectedLevel)}
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {(phase === 'playing' || phase === 'gameover') && (
      <div ref={containerRef} style={{ ...styles.content, pointerEvents: phase === 'gameover' ? 'none' : 'auto' }}>
        <div style={styles.roundLabel}>
          ROUND {round + 1} / {totalRounds} · {sequence.length} ITEMS
        </div>

        <div style={styles.feedbackLabel}>
          {feedback === 'correct' && <span style={{ color: '#4ade80' }}>✓ Correct!</span>}
          {feedback === 'wrong' && <span style={{ color: '#f87171' }}>✗ Try again!</span>}
          {!feedback && processingRef.current && <span style={{ color: '#818cf8' }}>Watch carefully...</span>}
          {!feedback && !processingRef.current && <span style={{ color: '#c084fc' }}>Your turn!</span>}
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          {combo > 1 && <div style={styles.comboTag}>🔥 {combo}x Combo!</div>}
          <div style={{
            ...styles.gridContainer,
            animation: shakeWrong ? 'rs-shake 0.4s ease' : 'none',
          }}>
            {colors.map((color, idx) => (
              <button key={idx}
                style={styles.colorBtn(color, activeBtn === idx, showingIdx === idx)}
                onPointerDown={() => handlePress(idx)}
              >
                <div style={styles.btnShine} />
              </button>
            ))}
          </div>
        </div>

        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressBar, width: `${(score / MAX_SCORE) * 100}%` }} />
        </div>

        <div style={styles.inputDots}>
          {sequence.map((s, i) => (
            <div key={i} style={styles.dot(
              COLOR_PALETTE[playerInput[i] ?? -1] || COLOR_PALETTE[0],
              i < playerInput.length
            )} />
          ))}
        </div>
      </div>
      )}

      {phase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Recall Sequence"
          score={completionData.score}
          timeElapsed={completionData.timeElapsed ?? TIME_LIMIT}
          gameTimeLimit={TIME_LIMIT}
          isVictory={completionData.isVictory}
          difficulty={completionData.difficulty}
          customMessages={{ maxScore: MAX_SCORE }}
        />
      )}
    </div>
  );
}
