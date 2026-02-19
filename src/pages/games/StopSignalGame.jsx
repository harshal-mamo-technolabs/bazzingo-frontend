import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

const MAX_SCORE = 200;
const TIME_LIMIT = 120;

const LEVELS = {
  easy: { label: 'Easy', trials: 20, stopRatio: 0.25, stopDelay: 300, goWindow: 1200, desc: '25% stop · 300ms delay' },
  moderate: { label: 'Moderate', trials: 28, stopRatio: 0.3, stopDelay: 200, goWindow: 1000, desc: '30% stop · 200ms delay' },
  hard: { label: 'Hard', trials: 36, stopRatio: 0.35, stopDelay: 120, goWindow: 800, desc: '35% stop · 120ms delay' },
};

const SHAPES = [
  { shape: '▶', color: '#22c55e', glow: '#22c55e' },
  { shape: '◆', color: '#3b82f6', glow: '#3b82f6' },
  { shape: '●', color: '#a855f7', glow: '#a855f7' },
  { shape: '★', color: '#eab308', glow: '#eab308' },
];

const audioCtxRef = { current: null };
function getAudioCtx() {
  if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtxRef.current;
}
function playTone(freq, dur = 0.1, type = 'sine') {
  try {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.13, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  } catch (e) {}
}
function playGo() { playTone(880, 0.08); }
function playStop() { playTone(220, 0.2, 'sawtooth'); }
function playCorrect() { playTone(660, 0.1); playTone(880, 0.1); }
function playWrong() { playTone(180, 0.18, 'square'); }
function playWin() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.15), i * 90)); }

export default function StopSignalReaction({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [trialIndex, setTrialIndex] = useState(0);
  const [trialPhase, setTrialPhase] = useState('wait');
  const [currentShape, setCurrentShape] = useState(null);
  const [isStop, setIsStop] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [inhibited, setInhibited] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [result, setResult] = useState(null);
  const [trials, setTrials] = useState([]);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const timerRef = useRef(null);
  const trialTimerRef = useRef(null);
  const goTimerRef = useRef(null);
  const stopTimerRef = useRef(null);
  const phaseRef = useRef('menu');
  const trialPhaseRef = useRef('wait');
  const goStartRef = useRef(0);
  const scoreRef = useRef(0);
  const trialIndexRef = useRef(0);
  const trialsRef = useRef([]);
  const respondedRef = useRef(false);
  const timeLeftRef = useRef(TIME_LIMIT);
  const location = useLocation();

  timeLeftRef.current = timeLeft;

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { trialPhaseRef.current = trialPhase; }, [trialPhase]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { trialIndexRef.current = trialIndex; }, [trialIndex]);
  useEffect(() => { trialsRef.current = trials; }, [trials]);

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

  const generateTrials = (lvl) => {
    const cfg = LEVELS[lvl];
    const stopCount = Math.round(cfg.trials * cfg.stopRatio);
    const arr = [];
    for (let i = 0; i < cfg.trials; i++) arr.push({ isStop: false, shape: SHAPES[Math.floor(Math.random() * SHAPES.length)] });
    const indices = Array.from({ length: cfg.trials }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
    for (let i = 0; i < stopCount; i++) arr[indices[i]].isStop = true;
    return arr;
  };

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current);
    if (goTimerRef.current) clearTimeout(goTimerRef.current);
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    timerRef.current = null;
    trialTimerRef.current = null;
    goTimerRef.current = null;
    stopTimerRef.current = null;
    setCompletionData(null);
    setPhase('menu');
  }, []);

  const startGame = (lvl) => {
    const cfg = LEVELS[lvl];
    if (!cfg) return;
    setCompletionData(null);
    const t = generateTrials(lvl);
    setLevel(lvl); setScore(0); setTimeLeft(TIME_LIMIT);
    setTrialIndex(0); setTrialPhase('wait'); setCurrentShape(null);
    setIsStop(false); setFeedback(null); setCombo(0);
    setCorrect(0); setWrong(0); setInhibited(0);
    setReactionTimes([]); setResult(null); setTrials(t);
    scoreRef.current = 0; trialIndexRef.current = 0; trialsRef.current = t;
    setPhase('playing');
    setTimeout(() => runTrial(0, t, lvl), 800);
  };

  const runTrial = (idx, trialList, lvl) => {
    if (phaseRef.current !== 'playing') return;
    const cfg = LEVELS[lvl];
    if (idx >= cfg.trials) { endGame('win'); return; }

    const trial = trialList[idx];
    respondedRef.current = false;
    setCurrentShape(trial.shape);
    setIsStop(false);
    setTrialPhase('wait');
    setFeedback(null);

    // Show fixation cross briefly
    trialTimerRef.current = setTimeout(() => {
      if (phaseRef.current !== 'playing') return;
      setTrialPhase('go');
      goStartRef.current = Date.now();
      playGo();

      if (trial.isStop) {
        stopTimerRef.current = setTimeout(() => {
          if (phaseRef.current !== 'playing' || respondedRef.current) return;
          setTrialPhase('stop');
          setIsStop(true);
          playStop();
        }, cfg.stopDelay);
      }

      // Auto-advance if no response
      goTimerRef.current = setTimeout(() => {
        if (phaseRef.current !== 'playing' || respondedRef.current) return;
        respondedRef.current = true;
        if (trial.isStop) {
          // Correctly inhibited
          handleResult(true, idx, trialList, lvl, true);
        } else {
          // Failed to respond to go - wrong
          handleResult(false, idx, trialList, lvl, false, true);
        }
      }, cfg.goWindow);
    }, 600 + Math.random() * 400);
  };

  const handleResponse = () => {
    if (phase !== 'playing' || respondedRef.current) return;
    if (trialPhaseRef.current !== 'go' && trialPhaseRef.current !== 'stop') return;
    respondedRef.current = true;
    clearTimeout(goTimerRef.current);
    clearTimeout(stopTimerRef.current);

    const trial = trialsRef.current[trialIndexRef.current];
    const rt = Date.now() - goStartRef.current;

    if (trial.isStop && (trialPhaseRef.current === 'stop' || trial.isStop)) {
      // Responded on a stop trial - wrong
      handleResult(false, trialIndexRef.current, trialsRef.current, level, false);
    } else {
      // Responded on go trial - correct
      setReactionTimes(prev => [...prev, rt]);
      handleResult(true, trialIndexRef.current, trialsRef.current, level, false);
    }
  };

  const handleResult = (isCorrect, idx, trialList, lvl, wasInhibit = false, wasMiss = false) => {
    const cfg = LEVELS[lvl];

    if (isCorrect) {
      playCorrect();
      const newCombo = combo + 1;
      setCombo(c => c + 1);
      const ppr = Math.floor(MAX_SCORE / cfg.trials);
      const corrNow = correct + 1;
      const isLast = corrNow >= cfg.trials || scoreRef.current + ppr >= MAX_SCORE;
      const earned = isLast ? Math.min(MAX_SCORE - scoreRef.current, ppr + (MAX_SCORE - ppr * cfg.trials)) : ppr;
      const bonus = Math.min(newCombo - 1, 3);
      const ns = Math.min(scoreRef.current + earned + bonus, MAX_SCORE);
      setScore(ns); scoreRef.current = ns;
      setCorrect(c => c + 1);
      if (wasInhibit) setInhibited(i => i + 1);
      setFeedback({ type: 'correct', msg: wasInhibit ? '🛑 Inhibited!' : '✅ Correct!' });
    } else {
      playWrong();
      setCombo(0);
      setWrong(w => w + 1);
      setFeedback({ type: 'wrong', msg: wasMiss ? '⏰ Too Slow!' : '❌ Should\'ve Stopped!' });
    }

    setTrialPhase('feedback');
    const nextIdx = idx + 1;
    setTrialIndex(nextIdx); trialIndexRef.current = nextIdx;

    setTimeout(() => {
      if (phaseRef.current !== 'playing') return;
      if (scoreRef.current >= MAX_SCORE) { endGame('win'); return; }
      if (nextIdx >= cfg.trials) { endGame('done'); return; }
      runTrial(nextIdx, trialList, lvl);
    }, 900);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (trialTimerRef.current) clearTimeout(trialTimerRef.current);
          if (goTimerRef.current) clearTimeout(goTimerRef.current);
          if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
          trialTimerRef.current = null;
          goTimerRef.current = null;
          stopTimerRef.current = null;
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

  const endGame = (reason) => {
    clearInterval(timerRef.current);
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current);
    if (goTimerRef.current) clearTimeout(goTimerRef.current);
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    trialTimerRef.current = null;
    goTimerRef.current = null;
    stopTimerRef.current = null;
    playWin();
    setResult(reason);
    setCompletionData({
      score: scoreRef.current,
      isVictory: reason === 'win' || reason === 'done',
      difficulty: level,
      timeElapsed: TIME_LIMIT - timeLeftRef.current,
    });
    setPhase('gameover');
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const avgRt = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;
  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, LEVELS[dailyGameDifficulty]]].filter(([, c]) => c)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : level;

  const instructionsModalContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>Tap when you see the <strong style={{ color: '#22c55e' }}>GO</strong> signal (a colored shape).</li>
        <li>If a <strong style={{ color: '#ef4444' }}>STOP</strong> signal (red with 🛑) appears, do <strong>not</strong> tap.</li>
        <li>Earn points for correct GO responses and for successfully inhibiting on STOP trials.</li>
        <li>You have <strong>2 minutes</strong> and can score up to <strong>200</strong> points. Consecutive correct trials build a combo.</li>
      </ul>
    </>
  );

  const css = `
    @keyframes ssr-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
    @keyframes ssr-glow{0%,100%{box-shadow:0 0 30px var(--g,#22c55e)40,0 0 60px var(--g,#22c55e)20}50%{box-shadow:0 0 50px var(--g,#22c55e)60,0 0 100px var(--g,#22c55e)30}}
    @keyframes ssr-stopFlash{0%,100%{opacity:1}50%{opacity:0.6}}
    @keyframes ssr-feedPop{0%{transform:translate(-50%,-50%) scale(0.5);opacity:0}50%{transform:translate(-50%,-50%) scale(1.15)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
    @keyframes ssr-shake{0%,100%{transform:translate(-50%,-50%)}20%{transform:translate(calc(-50% + 8px),-50%)}40%{transform:translate(calc(-50% - 8px),-50%)}60%{transform:translate(calc(-50% + 4px),-50%)}80%{transform:translate(calc(-50% - 4px),-50%)}}
    @keyframes ssr-ring{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.5);opacity:0}}
    @keyframes ssr-breathe{0%,100%{opacity:0.4}50%{opacity:1}}
    @keyframes ssr-timerPulse{0%,100%{opacity:1}50%{opacity:0.5}}
  `;

  const s = {
    wrapper: {
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 40%, #0d0d2b 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#e2e8f0', overflow: 'hidden',
    },
    header: {
      width: '100%', padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 10, flexShrink: 0,
    },
    backBtn: {
      background: 'rgba(255,255,255,0.1)', border: 'none', color: '#e2e8f0',
      padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
    },
    scoreBox: {
      background: 'rgba(255,255,255,0.08)', padding: '4px 14px', borderRadius: 12,
      fontSize: 15, fontWeight: 700,
    },
    timerBox: (u) => ({
      padding: '4px 14px', borderRadius: 12, fontSize: 15, fontWeight: 700,
      background: u ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
      color: u ? '#fca5a5' : '#e2e8f0',
      animation: u ? 'ssr-timerPulse 1s infinite' : 'none',
    }),
    content: {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      width: '100%', maxWidth: 700, padding: 16,
    },
    arena: {
      position: 'relative', width: '100%', flex: 1,
      borderRadius: 24, overflow: 'hidden',
      background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)',
      border: '1px solid rgba(255,255,255,0.06)',
      minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: trialPhase === 'go' || trialPhase === 'stop' ? 'pointer' : 'default',
      userSelect: 'none', WebkitTapHighlightColor: 'transparent',
    },
    menuCard: {
      background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
      borderRadius: 24, padding: '40px 32px',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center', maxWidth: 440, width: '90%',
    },
    menuTitle: {
      fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900,
      background: 'linear-gradient(135deg, #ef4444, #f59e0b, #22c55e)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: 8,
    },
    menuSub: { fontSize: 14, color: '#94a3b8', marginBottom: 28, lineHeight: 1.6 },
    levelBtn: (i) => {
      const g = [
        'linear-gradient(135deg, #22c55e, #16a34a)',
        'linear-gradient(135deg, #eab308, #f59e0b)',
        'linear-gradient(135deg, #ef4444, #dc2626)',
      ];
      return {
        width: '100%', padding: '14px 0', borderRadius: 14,
        background: g[i], border: 'none', color: '#fff',
        fontSize: 16, fontWeight: 700, cursor: 'pointer',
        marginBottom: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        transition: 'transform 0.15s',
      };
    },
    resultCard: {
      background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
      borderRadius: 24, padding: '36px 28px',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center', maxWidth: 400, width: '90%',
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
    menuBtnSmall: {
      padding: '10px 32px', borderRadius: 14,
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
      color: '#e2e8f0', fontSize: 14, cursor: 'pointer', width: '100%',
    },
  };

  const shapeSize = Math.min(window.innerWidth * 0.28, 160);
  const isStopShowing = trialPhase === 'stop';
  const showShape = trialPhase === 'go' || trialPhase === 'stop';

  return (
    <div style={s.wrapper}>
      <style>{css}</style>
      <div style={s.header}>
        <button style={s.backBtn} onClick={phase === 'menu' ? (onBack ? () => onBack() : () => window.history.back()) : handleReset}>
          {phase === 'menu' ? '← Home' : '← Menu'}
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🛑 Stop Signal</span>
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={s.scoreBox}>⭐ {score}/{MAX_SCORE}</div>
            {combo > 1 && (
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              }}>🔥 {combo}x</span>
            )}
            <div style={s.timerBox(timeLeft <= 10)}>⏱ {fmt(timeLeft)}</div>
          </div>
        )}
      </div>

      {phase === 'menu' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="stop-signal-instructions-title"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(239,68,68,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <h2 id="stop-signal-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#ef4444' }}>
                    🛑 Stop Signal – How to Play
                  </h2>
                  <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close"
                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    ×
                  </button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{instructionsModalContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <button type="button" onClick={() => setShowInstructions(false)}
                    style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={s.menuCard}>
            {isDailyGame && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 12, fontWeight: 600 }}>
                📅 Daily Challenge
              </div>
            )}
            <div style={s.menuTitle}>Stop Signal</div>
            <p style={s.menuSub}>
              Tap when you see the <b style={{ color: '#22c55e' }}>GO</b> signal.<br />
              But <b style={{ color: '#ef4444' }}>STOP</b> yourself if the red signal appears!<br />
              Test your impulse control and reaction speed.
            </p>
            {!checkingDailyGame && levelEntries.map(([key, cfg], idx) => (
              <button
                key={key}
                style={{
                  ...s.levelBtn(idx),
                  opacity: selectedLevel === key ? 1 : 0.85,
                  border: selectedLevel === key ? '3px solid rgba(255,255,255,0.5)' : 'none',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                onClick={() => !isDailyGame && setLevel(key)}
              >
                {cfg.label}
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>
                  {cfg.trials} trials · {cfg.desc}
                </div>
              </button>
            ))}
            <button
              style={{ ...s.levelBtn(0), marginTop: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              disabled={!selectedLevel || checkingDailyGame}
              onClick={() => startGame(selectedLevel)}
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {(phase === 'playing' || phase === 'gameover') && (
      <div style={{ ...s.content, pointerEvents: phase === 'gameover' ? 'none' : 'auto' }}>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, textAlign: 'center' }}>
          Trial {Math.min(trialIndex + 1, LEVELS[level]?.trials || 0)}/{LEVELS[level]?.trials} · ✅ {correct} · ❌ {wrong} · Accuracy: {accuracy}%
        </div>
        <div style={{
          width: '80%', maxWidth: 400, height: 6, borderRadius: 3,
          background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 12,
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            transition: 'width 0.3s', width: `${(score / MAX_SCORE) * 100}%`,
          }} />
        </div>
        <div
          style={s.arena}
          onClick={handleResponse}
          onTouchStart={(e) => { e.preventDefault(); handleResponse(); }}
        >
          {/* Fixation cross during wait */}
          {trialPhase === 'wait' && (
            <div style={{
              fontSize: Math.max(shapeSize * 0.5, 32), color: '#475569',
              animation: 'ssr-breathe 1.5s ease-in-out infinite',
            }}>+</div>
          )}

          {/* GO shape */}
          {showShape && currentShape && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Expanding ring on stop */}
              {isStopShowing && (
                <div style={{
                  position: 'absolute', width: shapeSize, height: shapeSize,
                  borderRadius: '50%', border: '3px solid #ef4444',
                  animation: 'ssr-ring 0.8s ease-out infinite',
                }} />
              )}
              <div style={{
                width: shapeSize, height: shapeSize, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: shapeSize * 0.45,
                background: isStopShowing
                  ? 'radial-gradient(circle at 35% 35%, #ef4444, #991b1b)'
                  : `radial-gradient(circle at 35% 35%, ${currentShape.color}, ${currentShape.color}88)`,
                boxShadow: isStopShowing
                  ? '0 0 40px #ef444460, 0 0 80px #ef444430'
                  : `0 0 40px ${currentShape.glow}40, 0 0 80px ${currentShape.glow}20`,
                animation: isStopShowing
                  ? 'ssr-stopFlash 0.3s ease-in-out infinite, ssr-pulse 0.5s ease-in-out'
                  : 'ssr-pulse 0.6s ease-out',
                '--g': isStopShowing ? '#ef4444' : currentShape.glow,
                transition: 'background 0.15s, box-shadow 0.15s',
              }}>
                {isStopShowing ? '🛑' : currentShape.shape}
              </div>
              {/* Label */}
              <div style={{
                position: 'absolute', bottom: -36,
                fontSize: 18, fontWeight: 800, letterSpacing: 3,
                color: isStopShowing ? '#ef4444' : '#22c55e',
                textShadow: isStopShowing ? '0 0 12px #ef444480' : '0 0 12px #22c55e80',
                animation: isStopShowing ? 'ssr-stopFlash 0.3s ease-in-out infinite' : 'none',
              }}>
                {isStopShowing ? 'STOP!' : 'GO!'}
              </div>
            </div>
          )}

          {/* Feedback */}
          {trialPhase === 'feedback' && feedback && (
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: feedback.type === 'correct' ? 'ssr-feedPop 0.4s ease-out' : 'ssr-shake 0.4s ease-out',
              fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: 800,
              color: feedback.type === 'correct' ? '#22c55e' : '#ef4444',
              textShadow: feedback.type === 'correct' ? '0 0 20px #22c55e60' : '0 0 20px #ef444460',
              whiteSpace: 'nowrap',
            }}>
              {feedback.msg}
            </div>
          )}

          {/* Tap instruction */}
          {(trialPhase === 'go') && (
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              fontSize: 13, color: '#64748b', whiteSpace: 'nowrap',
            }}>
              Tap anywhere to respond!
            </div>
          )}
        </div>
      </div>
      )}

      {phase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Stop Signal"
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
