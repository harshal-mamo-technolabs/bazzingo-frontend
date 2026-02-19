import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

/* ───── CONSTANTS ───── */
const TIME_LIMIT = 120;
const MAX_SCORE = 200;

const LEVELS = [
  {
    name: 'Easy',
    subtitle: 'Basic Packets',
    desc: 'Remember a short sequence of data packets flowing through the stream.',
    seqLength: 4,
    symbols: ['🔴', '🟢', '🔵', '🟡'],
    speed: 1800,
    bg: ['#0a1628', '#162544'],
    accent: '#00e5ff',
  },
  {
    name: 'Medium',
    subtitle: 'Encrypted Flow',
    desc: 'Longer sequences with more packet types. Stay sharp!',
    seqLength: 6,
    symbols: ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'],
    speed: 1400,
    bg: ['#1a0a2e', '#2d1b4e'],
    accent: '#b388ff',
  },
  {
    name: 'Hard',
    subtitle: 'Firewall Breach',
    desc: 'Long sequences, more types, faster flow. Can you crack it?',
    seqLength: 8,
    symbols: ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠', '⚪', '🟤'],
    speed: 1000,
    bg: ['#2e0a0a', '#4e1b1b'],
    accent: '#ff5252',
  },
];

/* ───── AUDIO ───── */
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;

    if (type === 'packet') {
      osc.type = 'sine';
      osc.frequency.value = 600 + Math.random() * 400;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.value = 200;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.value = 523;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.type = 'sine'; o2.frequency.value = 784; g2.gain.value = 0.12;
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      o2.start(ctx.currentTime + 0.15); o2.stop(ctx.currentTime + 0.8);
    } else if (type === 'lose') {
      osc.type = 'sawtooth';
      osc.frequency.value = 150;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.value = 1000;
      gain.gain.value = 0.08;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {}
}

/* ───── PARTICLE CANVAS ───── */
function StreamCanvas({ colors, accent }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const anim = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.3) * 1.5,
        vy: -(Math.random() * 0.5 + 0.3),
        a: Math.random() * 0.6 + 0.2,
      });
    }

    const draw = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = accent + '15';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent + Math.floor(p.a * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      anim.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(anim.current);
      window.removeEventListener('resize', resize);
    };
  }, [colors, accent]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ───── MAIN COMPONENT ───── */
export default function DataStreamSecurity({ onBack }) {
  const location = useLocation();
  const [phase, setPhase] = useState('menu'); // menu | watching | answering | finished
  const [levelIdx, setLevelIdx] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [currentShow, setCurrentShow] = useState(-1);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(5);
  const [roundSeqLen, setRoundSeqLen] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong', idx }
  const [showRules, setShowRules] = useState(false);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyLevelIndex, setDailyLevelIndex] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [completionData, setCompletionData] = useState(null);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  const level = LEVELS[levelIdx];

  /* Daily game detection */
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
          const map = { easy: 0, medium: 1, moderate: 1, hard: 2 };
          if (map[d] != null) {
            setIsDailyGame(true);
            setDailyLevelIndex(map[d]);
            setLevelIdx(map[d]);
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

  /* Generate a sequence */
  const genSeq = useCallback((len, symbols) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    return seq;
  }, []);

  /* Start a level */
  const startLevel = (idx) => {
    playSound('click');
    setLevelIdx(idx);
    setPhase('watching');
    setScore(0);
    setRound(1);
    setTimeLeft(TIME_LIMIT);
    setPlayerSeq([]);
    setFeedback(null);
    const lvl = LEVELS[idx];
    const len = lvl.seqLength;
    setRoundSeqLen(len);
    const seq = genSeq(len, lvl.symbols);
    setSequence(seq);
    setCurrentShow(0);
  };

  /* Show sequence one by one */
  useEffect(() => {
    if (phase !== 'watching' || currentShow < 0) return;
    if (currentShow >= sequence.length) {
      // Done showing, switch to answering
      setTimeout(() => {
        setCurrentShow(-1);
        setPhase('answering');
      }, 500);
      return;
    }
    playSound('packet');
    const t = setTimeout(() => setCurrentShow(prev => prev + 1), level.speed);
    return () => clearTimeout(t);
  }, [phase, currentShow, sequence.length, level.speed]);

  /* Timer */
  useEffect(() => {
    if (phase !== 'watching' && phase !== 'answering') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          playSound('lose');
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty: level.name,
            timeElapsed: TIME_LIMIT,
          });
          setPhase('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, score, level.name]);

  /* Handle player tap */
  const handleTap = (symbol) => {
    if (phase !== 'answering') return;
    playSound('click');
    const idx = playerSeq.length;
    const newSeq = [...playerSeq, symbol];
    setPlayerSeq(newSeq);

    if (symbol !== sequence[idx]) {
      // Wrong
      playSound('wrong');
      setFeedback({ type: 'wrong', idx });
      setTimeout(() => {
        setFeedback(null);
        if (round >= totalRounds) {
          if (score > 0) {
            playSound('win');
            setCompletionData({ score, isVictory: true, difficulty: level.name, timeElapsed: TIME_LIMIT - timeLeft });
          } else {
            playSound('lose');
            setCompletionData({ score: 0, isVictory: false, difficulty: level.name, timeElapsed: TIME_LIMIT - timeLeft });
          }
          setPhase('finished');
        } else {
          nextRound(score);
        }
      }, 800);
      return;
    }

    // Correct so far
    setFeedback({ type: 'correct', idx });
    setTimeout(() => setFeedback(null), 300);

    if (newSeq.length === sequence.length) {
      // Full sequence correct!
      playSound('correct');
      const roundScore = Math.round((MAX_SCORE / totalRounds) * (timeLeft / TIME_LIMIT + 0.5));
      const newScore = Math.min(MAX_SCORE, score + roundScore);
      setScore(newScore);

      setTimeout(() => {
        if (round >= totalRounds) {
          playSound('win');
          setCompletionData({ score: newScore, isVictory: true, difficulty: level.name, timeElapsed: TIME_LIMIT - timeLeft });
          setPhase('finished');
        } else {
          nextRound(newScore);
        }
      }, 600);
    }
  };

  const nextRound = (currentScore) => {
    const newRound = round + 1;
    setRound(newRound);
    setPlayerSeq([]);
    setFeedback(null);
    // Slightly increase length each round
    const newLen = roundSeqLen + (newRound > 3 ? 1 : 0);
    setRoundSeqLen(newLen);
    const seq = genSeq(newLen, level.symbols);
    setSequence(seq);
    setPhase('watching');
    setCurrentShow(0);
    setScore(currentScore);
  };

  const goMenu = () => {
    playSound('click');
    setPhase('menu');
    setCompletionData(null);
    clearInterval(timerRef.current);
  };

  const handleReset = goMenu;

  /* ───── STYLES ───── */
  const containerStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#fff',
    userSelect: 'none',
  };

  const glassStyle = {
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(12px)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.1)',
    padding: 24,
  };

  const btnStyle = (color = '#00e5ff') => ({
    padding: '12px 28px',
    border: `2px solid ${color}`,
    borderRadius: 12,
    background: color + '22',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const symbolBtnStyle = (isActive) => ({
    width: 64,
    height: 64,
    fontSize: 32,
    borderRadius: 14,
    border: `2px solid ${isActive ? level.accent : 'rgba(255,255,255,0.2)'}`,
    background: isActive ? level.accent + '33' : 'rgba(255,255,255,0.08)',
    cursor: phase === 'answering' ? 'pointer' : 'default',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isActive ? `0 0 20px ${level.accent}55` : 'none',
  });

  const currentColors = phase === 'menu' ? ['#0a1628', '#162544'] : level.bg;
  const currentAccent = phase === 'menu' ? '#00e5ff' : level.accent;

  /* Format time */
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  /* ───── RENDER ───── */
  const timeElapsedForModal = completionData?.timeElapsed ?? (phase === 'finished' ? TIME_LIMIT : TIME_LIMIT - timeLeft);

  return (
    <>
    <div style={{ ...containerStyle, zIndex: phase === 'menu' ? undefined : 1 }}>
      <StreamCanvas colors={currentColors} accent={currentAccent} />

      {/* HUD */}
      {(phase === 'watching' || phase === 'answering' || phase === 'finished') && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 20px',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
        }}>
          <button onClick={goMenu} style={{ ...btnStyle(level.accent), padding: '8px 16px', fontSize: 14 }}>
            ← Menu
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{level.name} — Round {round}/{totalRounds}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: level.accent }}>
              {phase === 'watching' ? '👁️ MEMORIZE' : '🎯 PREDICT'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: timeLeft < 30 ? '#ff5252' : '#fff' }}>
              ⏱ {formatTime(timeLeft)}
            </div>
            <div style={{ fontSize: 14, color: level.accent }}>Score: {score}/{MAX_SCORE}</div>
          </div>
        </div>
      )}

      {/* ─── MENU ─── */}
      {phase === 'menu' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          {checkingDailyGame ? (
            <div style={{ color: '#fff', fontSize: 18 }}>Loading...</div>
          ) : (
            <>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🛡️</div>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900,
              background: 'linear-gradient(135deg, #00e5ff, #b388ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 8,
            }}>
              Data Stream Security
            </h1>
            <p style={{ opacity: 0.7, fontSize: 15, maxWidth: 400 }}>
              Watch the data packets flow, memorize the pattern, then predict the sequence!
            </p>
            <button
              onClick={() => setShowRules(true)}
              style={{ ...btnStyle('#b388ff'), marginTop: 12, padding: '8px 20px', fontSize: 14 }}
            >
              📜 How to Play
            </button>
          </div>

          {isDailyGame && (
            <div style={{ marginBottom: 16, padding: '6px 16px', background: 'rgba(0,229,255,0.2)', border: '1px solid rgba(0,229,255,0.5)', borderRadius: 20, fontSize: 13, color: '#00e5ff', fontWeight: 600 }}>
              Daily Challenge
            </div>
          )}

          {onBack && (
            <button onClick={onBack} style={{ ...btnStyle('#888'), marginBottom: 20, padding: '8px 20px', fontSize: 14 }}>
              ← Back
            </button>
          )}

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16, width: '100%', maxWidth: 750,
          }}>
            {(isDailyGame && dailyLevelIndex != null ? [LEVELS[dailyLevelIndex]] : LEVELS).map((lv, i) => {
              const idx = isDailyGame ? dailyLevelIndex : i;
              return (
              <div key={idx} onClick={() => startLevel(idx)} style={{
                ...glassStyle,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textAlign: 'center',
                border: `1px solid ${lv.accent}44`,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = `0 0 30px ${lv.accent}33`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>
                  {i === 0 ? '📡' : i === 1 ? '🔐' : '🔥'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: lv.accent }}>{lv.name}</div>
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>{lv.subtitle}</div>
                <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 12 }}>{lv.desc}</div>
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 12,
                }}>
                  {lv.symbols.map((s, j) => (
                    <span key={j} style={{ fontSize: 18 }}>{s}</span>
                  ))}
                </div>
                <div style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: lv.accent + '22', border: `1px solid ${lv.accent}`,
                  fontSize: 14, fontWeight: 700,
                }}>
                  ▶ Play
                </div>
              </div>
            ); })}
          </div>
            </>
          )}
        </div>
      )}

      {/* ─── WATCHING PHASE ─── */}
      {phase === 'watching' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 20, paddingTop: 80,
        }}>
          <div style={{ ...glassStyle, textAlign: 'center', minWidth: 280, maxWidth: 500 }}>
            <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 16 }}>
              Watch the sequence carefully...
            </div>

            {/* Stream visualization */}
            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center',
              minHeight: 100, flexWrap: 'wrap', padding: 16,
            }}>
              {sequence.map((sym, i) => (
                <div key={i} style={{
                  width: 60, height: 60,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30,
                  background: i === currentShow
                    ? level.accent + '44'
                    : i < currentShow
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.03)',
                  border: i === currentShow
                    ? `2px solid ${level.accent}`
                    : '2px solid rgba(255,255,255,0.08)',
                  transform: i === currentShow ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.3s',
                  boxShadow: i === currentShow ? `0 0 25px ${level.accent}66` : 'none',
                  opacity: i <= currentShow ? 1 : 0.3,
                }}>
                  {i <= currentShow ? sym : '?'}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 12, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: level.accent,
                width: `${((currentShow + 1) / sequence.length) * 100}%`,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── ANSWERING PHASE ─── */}
      {phase === 'answering' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 20, paddingTop: 80,
        }}>
          <div style={{ ...glassStyle, textAlign: 'center', minWidth: 280, maxWidth: 500 }}>
            <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 12 }}>
              Reproduce the sequence! ({playerSeq.length}/{sequence.length})
            </div>

            {/* Player progress */}
            <div style={{
              display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
              marginBottom: 20, minHeight: 50,
            }}>
              {sequence.map((_, i) => {
                const filled = i < playerSeq.length;
                const isCorrect = filled && playerSeq[i] === sequence[i];
                const isWrong = feedback && feedback.type === 'wrong' && feedback.idx === i;
                return (
                  <div key={i} style={{
                    width: 44, height: 44, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    background: isWrong ? '#ff525244' : filled ? level.accent + '33' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isWrong ? '#ff5252' : filled ? level.accent : 'rgba(255,255,255,0.15)'}`,
                    transition: 'all 0.2s',
                  }}>
                    {filled ? playerSeq[i] : '·'}
                  </div>
                );
              })}
            </div>

            {/* Symbol buttons */}
            <div style={{
              display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
            }}>
              {level.symbols.map((sym, i) => (
                <button
                  key={i}
                  onClick={() => handleTap(sym)}
                  style={symbolBtnStyle(false)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = level.accent;
                    e.currentTarget.style.background = level.accent + '33';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── RULES OVERLAY ─── */}
      {showRules && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
          padding: 20,
        }} onClick={() => setShowRules(false)}>
          <div style={{ ...glassStyle, maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>
              📜 How to Play
            </h2>
            <div style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.9 }}>
              <p><strong>1. Watch</strong> — Data packets flow across the stream. Memorize their order!</p>
              <p><strong>2. Predict</strong> — Once the stream ends, tap the symbols in the exact order you saw them.</p>
              <p><strong>3. Score</strong> — Correct sequences earn points. Faster = more points. Max {MAX_SCORE} per level.</p>
              <p><strong>4. Rounds</strong> — Each level has {totalRounds} rounds. Sequences may grow longer!</p>
              <p><strong>5. Time</strong> — You have {TIME_LIMIT / 60} minutes. If time runs out, the game ends.</p>
            </div>
            <button onClick={() => setShowRules(false)} style={{
              ...btnStyle('#00e5ff'), width: '100%', marginTop: 16, textAlign: 'center',
            }}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
    <GameCompletionModal
      isVisible={phase === 'finished' && completionData != null}
      onClose={handleReset}
      gameTitle="Data Stream Security"
      score={completionData?.score ?? score}
      timeElapsed={timeElapsedForModal}
      gameTimeLimit={TIME_LIMIT}
      isVictory={completionData?.isVictory ?? false}
      difficulty={completionData?.difficulty ?? level?.name}
      customMessages={{
        maxScore: MAX_SCORE,
        stats: completionData != null ? `${level?.name ?? ''} • Round ${round}/${totalRounds} • ${Math.floor((completionData.timeElapsed ?? 0) / 60)}:${String((completionData.timeElapsed ?? 0) % 60).padStart(2, '0')}` : '',
      }}
    />
    </>
  );
}
