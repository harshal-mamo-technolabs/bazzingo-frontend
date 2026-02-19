import React, { useState, useEffect, useRef, useCallback } from 'react';

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

export default function StopSignalReaction() {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [trialIndex, setTrialIndex] = useState(0);
  const [trialPhase, setTrialPhase] = useState('wait'); // wait, go, stop, feedback
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

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { trialPhaseRef.current = trialPhase; }, [trialPhase]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { trialIndexRef.current = trialIndex; }, [trialIndex]);
  useEffect(() => { trialsRef.current = trials; }, [trials]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lvl = params.get('level');
    if (lvl && LEVELS[lvl]) startGame(lvl);
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

  const startGame = (lvl) => {
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
        if (t <= 1) { clearInterval(timerRef.current); endGame('time'); return 0; }
        if (t <= 11) playTone(880, 0.05);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const endGame = (reason) => {
    clearInterval(timerRef.current);
    clearTimeout(trialTimerRef.current);
    clearTimeout(goTimerRef.current);
    clearTimeout(stopTimerRef.current);
    playWin();
    setResult(reason);
    setPhase('result');
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const avgRt = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;
  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

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

  // MENU
  if (phase === 'menu') {
    return (
      <div style={s.wrapper}>
        <style>{css}</style>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => window.history.back()}>← Back</button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🛑 Stop Signal</span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={s.menuCard}>
            <div style={s.menuTitle}>Stop Signal</div>
            <p style={s.menuSub}>
              Tap when you see the <b style={{ color: '#22c55e' }}>GO</b> signal.<br />
              But <b style={{ color: '#ef4444' }}>STOP</b> yourself if the red signal appears!<br />
              Test your impulse control and reaction speed.
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px',
              marginBottom: 20, fontSize: 13, color: '#94a3b8', lineHeight: 1.6, textAlign: 'left',
            }}>
              <b style={{ color: '#e2e8f0' }}>How to play:</b><br />
              • A shape appears — tap/click quickly to respond<br />
              • If a 🛑 STOP signal flashes — do NOT tap<br />
              • Earn points for correct responses & successful inhibitions<br />
              • Lose streak for mistakes
            </div>
            {Object.entries(LEVELS).map(([key, cfg], idx) => (
              <button key={key} style={s.levelBtn(idx)}
                onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                onClick={() => startGame(key)}>
                {cfg.label}
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>
                  {cfg.trials} trials · {cfg.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RESULT
  if (phase === 'result') {
    const won = result === 'win';
    return (
      <div style={s.wrapper}>
        <style>{css}</style>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => setPhase('menu')}>← Menu</button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🛑 Stop Signal</span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={s.resultCard}>
            <div style={s.resultEmoji}>{won ? '🎉' : '⏰'}</div>
            <div style={s.resultTitle}>{won ? 'Great Control!' : 'Time\'s Up!'}</div>
            <div style={s.resultScore}>{score} / {MAX_SCORE}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 6, fontSize: 13, color: '#94a3b8' }}>
              <span>✅ {correct}</span>
              <span>❌ {wrong}</span>
              <span>🛑 {inhibited}</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
              Accuracy: {accuracy}% · Avg RT: {avgRt}ms
            </div>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 20 }}>
              {LEVELS[level]?.label} · {trialIndex}/{LEVELS[level]?.trials} trials
            </div>
            <button style={s.playAgainBtn} onClick={() => startGame(level)}>Play Again</button>
            <button style={s.menuBtnSmall} onClick={() => setPhase('menu')}>Back to Menu</button>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING
  const shapeSize = Math.min(window.innerWidth * 0.28, 160);
  const isStopShowing = trialPhase === 'stop';
  const showShape = trialPhase === 'go' || trialPhase === 'stop';

  return (
    <div style={s.wrapper}>
      <style>{css}</style>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setPhase('menu')}>← Menu</button>
        <div style={s.scoreBox}>⭐ {score}/{MAX_SCORE}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {combo > 1 && (
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
            }}>🔥 {combo}x</span>
          )}
          <div style={s.timerBox(timeLeft <= 10)}>⏱ {fmt(timeLeft)}</div>
        </div>
      </div>
      <div style={s.content}>
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
    </div>
  );
}
