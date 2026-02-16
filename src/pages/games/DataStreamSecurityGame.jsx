import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

/* ───── CONSTANTS ───── */
const TIME_LIMIT = 120;
const MAX_SCORE = 200;

const LEVELS = {
  Easy: {
    name: 'Easy',
    subtitle: 'Basic Packets',
    desc: 'Remember a short sequence of data packets flowing through the stream.',
    seqLength: 4,
    symbols: ['🔴', '🟢', '🔵', '🟡'],
    speed: 1800,
    bg: ['#0a1628', '#162544'],
    accent: '#00e5ff',
  },
  Moderate: {
    name: 'Moderate',
    subtitle: 'Encrypted Flow',
    desc: 'Longer sequences with more packet types. Stay sharp!',
    seqLength: 6,
    symbols: ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'],
    speed: 1400,
    bg: ['#1a0a2e', '#2d1b4e'],
    accent: '#b388ff',
  },
  Hard: {
    name: 'Hard',
    subtitle: 'Firewall Breach',
    desc: 'Long sequences, more types, faster flow. Can you crack it?',
    seqLength: 8,
    symbols: ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠', '⚪', '🟤'],
    speed: 1000,
    bg: ['#2e0a0a', '#4e1b1b'],
    accent: '#ff5252',
  },
};

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
export default function DataStreamSecurity() {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [phase, setPhase] = useState('menu'); // menu | watching | answering | win | lose
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
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const timerRef = useRef(null);

  const level = LEVELS[difficulty];

  // Update timeLeft when difficulty changes (for ready screen display)
  useEffect(() => {
    if (gameState === 'ready') {
      setTimeLeft(TIME_LIMIT);
    }
  }, [difficulty, gameState]);

  /* Generate a sequence */
  const genSeq = useCallback((len, symbols) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    return seq;
  }, []);

  /* Start a level */
  const startLevel = (diff) => {
    playSound('click');
    setDifficulty(diff);
    setPhase('watching');
    setScore(0);
    setRound(1);
    setTimeLeft(TIME_LIMIT);
    setPlayerSeq([]);
    setFeedback(null);
    setCorrectCount(0);
    setWrongCount(0);
    const lvl = LEVELS[diff];
    const len = lvl.seqLength;
    setRoundSeqLen(len);
    const seq = genSeq(len, lvl.symbols);
    setSequence(seq);
    setCurrentShow(0);
    setGameState('playing');
  };

  const handleStart = useCallback(() => {
    startLevel(difficulty);
  }, [difficulty]);

  const handleReset = useCallback(() => {
    setGameState('ready');
    setPhase('menu');
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(TIME_LIMIT);
    setRound(1);
    setPlayerSeq([]);
    setFeedback(null);
    clearInterval(timerRef.current);
  }, []);

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
    if (gameState !== 'playing') return;
    if (phase !== 'watching' && phase !== 'answering') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase('lose');
          setGameState('finished');
          playSound('lose');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, phase]);

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
      setWrongCount(c => c + 1);
      setTimeout(() => {
        setFeedback(null);
        // Move to next round or end
        if (round >= totalRounds) {
          if (score > 0) {
            setPhase('win');
            setGameState('finished');
            playSound('win');
          } else {
            setPhase('lose');
            setGameState('finished');
            playSound('lose');
          }
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
      setCorrectCount(c => c + 1);
      const roundScore = Math.round((MAX_SCORE / totalRounds) * (timeLeft / TIME_LIMIT + 0.5));
      const newScore = Math.min(MAX_SCORE, score + roundScore);
      setScore(newScore);

      setTimeout(() => {
        if (round >= totalRounds || newScore >= MAX_SCORE) {
          setPhase('win');
          setGameState('finished');
          playSound('win');
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
    setGameState('ready');
    clearInterval(timerRef.current);
  };

  // Check if game should end due to max score
  useEffect(() => {
    if (gameState === 'playing' && score >= MAX_SCORE) {
      setPhase('win');
      setGameState('finished');
      playSound('win');
    }
  }, [gameState, score]);

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
          Watch data packets flow across the stream, memorize their order, then reproduce the exact sequence!
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Watch packets flow in sequence</li>
          <li>• Memorize the exact order</li>
          <li>• Tap symbols to reproduce</li>
          <li>• Complete {totalRounds} rounds to win</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Correct sequences earn points</li>
          <li>• Faster completion = more points</li>
          <li>• Max {MAX_SCORE} points per level</li>
          <li>• Wrong answer moves to next round</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Strategy
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Focus during packet flow</li>
          <li>• Use memory techniques</li>
          <li>• Sequences grow longer each round</li>
          <li>• Higher difficulty = faster flow</li>
        </ul>
      </div>
    </div>
  );

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

  const playingContent = (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      color: '#fff',
      userSelect: 'none',
    }}>
      <StreamCanvas colors={currentColors} accent={currentAccent} />

      {/* HUD */}
      {(phase === 'watching' || phase === 'answering') && (
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
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Data Stream Security"
      gameShortDescription="Watch data packets flow across the stream, memorize their order, then reproduce the exact sequence!"
      category="Memory"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeLeft}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{ correctCount, wrongCount, accuracy, round, totalRounds }}
      enableCompletionModal={true}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
}
