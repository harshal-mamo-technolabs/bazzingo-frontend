import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

const LEVELS = {
  easy: { label: 'Easy', emoji: '🟢', gridSize: 4, options: 3, rounds: 8, hue: 140 },
  moderate: { label: 'Moderate', emoji: '🟡', gridSize: 5, options: 4, rounds: 10, hue: 45 },
  hard: { label: 'Hard', emoji: '🔴', gridSize: 6, options: 5, rounds: 12, hue: 0 },
};

const TOTAL_POINTS = 200;
const TIME_LIMIT = 120;

const PALETTES = [
  ['#3b82f6', '#60a5fa', '#93c5fd'],
  ['#22c55e', '#4ade80', '#86efac'],
  ['#f59e0b', '#fbbf24', '#fcd34d'],
  ['#ef4444', '#f87171', '#fca5a5'],
  ['#8b5cf6', '#a78bfa', '#c4b5fd'],
  ['#06b6d4', '#22d3ee', '#67e8f9'],
  ['#ec4899', '#f472b6', '#f9a8d4'],
];

function createAudioContext() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
}

function playSound(ctx, type) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'correct') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'wrong') {
      osc.type = 'square'; osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'win') {
      [0, 0.12, 0.24, 0.36].forEach((d, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime([523, 659, 784, 1047][i], ctx.currentTime + d);
        g.gain.setValueAtTime(0.15, ctx.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.2);
        o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.2);
      });
    } else if (type === 'tick') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.03);
    } else if (type === 'select') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    }
  } catch {}
}

function generatePattern(size, palette) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => {
      const filled = Math.random() > 0.35;
      return { filled, color: filled ? palette[Math.floor(Math.random() * palette.length)] : 'transparent' };
    })
  );
}

function mirrorHorizontal(pattern) {
  return [...pattern].reverse().map(row => [...row]);
}

function mutatePattern(pattern, mutations) {
  const size = pattern.length;
  const result = pattern.map(row => row.map(cell => ({ ...cell })));
  let changed = 0;
  const positions = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) positions.push([r, c]);
  
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  for (const [r, c] of positions) {
    if (changed >= mutations) break;
    if (result[r][c].filled) {
      result[r][c] = { filled: false, color: 'transparent' };
      changed++;
    } else {
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      result[r][c] = { filled: true, color: palette[Math.floor(Math.random() * palette.length)] };
      changed++;
    }
  }
  return result;
}

function generateRound(config) {
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const original = generatePattern(config.gridSize, palette);
  const correctMirror = mirrorHorizontal(original);
  
  const mutations = Math.max(2, Math.floor(config.gridSize * 0.6));
  const options = [{ pattern: correctMirror, isCorrect: true }];
  
  for (let i = 1; i < config.options; i++) {
    options.push({ pattern: mutatePattern(correctMirror, mutations + i), isCorrect: false });
  }
  
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return { original, options };
}

export default function MirrorMatch({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(0);
  const [roundData, setRoundData] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(TIME_LIMIT);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const location = useLocation();
  const autoStartedRef = useRef(false);
  scoreRef.current = score;
  timeLeftRef.current = timeLeft;

  const queryLevel = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const l = p.get('level');
    return l && LEVELS[l] ? l : null;
  }, []);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setDims({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
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
          const map = { easy: 'easy', medium: 'moderate', moderate: 'moderate', hard: 'hard' };
          if (map[d] && LEVELS[map[d]]) {
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
    const onKey = (e) => { if (e.key === 'Escape') setShowInstructions(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const config = difficulty ? LEVELS[difficulty] : null;

  const startGame = useCallback((level) => {
    if (!audioRef.current) audioRef.current = createAudioContext();
    const cfg = LEVELS[level];
    setDifficulty(level);
    setRound(0);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setSelected(null);
    setFeedback(null);
    setGameResult(null);
    setCompletionData(null);
    setRoundData(generateRound(cfg));
    setPhase('playing');
  }, []);

  const handleReset = useCallback(() => {
    clearInterval(timerRef.current);
    setCompletionData(null);
    setPhase('menu');
  }, []);

  useEffect(() => {
    if (queryLevel && !autoStartedRef.current && phase === 'menu' && dims.w > 100) {
      autoStartedRef.current = true;
      startGame(queryLevel);
    }
  }, [queryLevel, phase, dims, startGame]);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase('gameover');
          setGameResult('timeout');
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty,
            timeElapsed: TIME_LIMIT,
          });
          playSound(audioRef.current, 'wrong');
          return 0;
        }
        if (prev <= 11) playSound(audioRef.current, 'tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, difficulty]);

  const handleSelect = useCallback((idx) => {
    if (phase !== 'playing' || feedback !== null) return;
    playSound(audioRef.current, 'select');
    setSelected(idx);
    const isCorrect = roundData.options[idx].isCorrect;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    playSound(audioRef.current, isCorrect ? 'correct' : 'wrong');

    const cfg = LEVELS[difficulty];
    const currentRound = round;
    const nextRound = currentRound + 1;

    const perRound = Math.floor(TOTAL_POINTS / cfg.rounds);
    const remainder = TOTAL_POINTS - perRound * cfg.rounds;
    const pts = nextRound === cfg.rounds ? perRound + remainder : perRound;
    if (isCorrect) {
      setScore(s => Math.min(TOTAL_POINTS, s + pts));
    }

    setTimeout(() => {
      if (nextRound >= cfg.rounds) {
        clearInterval(timerRef.current);
        const finalScore = isCorrect ? Math.min(TOTAL_POINTS, score + pts) : score;
        setCompletionData({
          score: finalScore,
          isVictory: true,
          difficulty,
          timeElapsed: TIME_LIMIT - timeLeftRef.current,
        });
        setPhase('gameover');
        setGameResult('complete');
        playSound(audioRef.current, 'win');
      } else {
        setRound(nextRound);
        setRoundData(generateRound(cfg));
        setSelected(null);
        setFeedback(null);
      }
    }, 800);
  }, [phase, feedback, roundData, round, difficulty, score]);

  const isSmall = dims.w < 550;
  const isMedium = dims.w < 900;

  const patternCellSize = useMemo(() => {
    if (!config) return 28;
    const availW = dims.w - 40;
    const availH = dims.h - 260;
    const sourceW = availW * (isSmall ? 0.45 : 0.25);
    const optionAreaW = availW * (isSmall ? 0.9 : 0.7);
    const optionsPerRow = isSmall ? 2 : config.options;
    const singleOptionW = (optionAreaW / optionsPerRow) - 16;
    const maxFromSource = Math.floor(sourceW / config.gridSize);
    const maxFromOption = Math.floor(singleOptionW / config.gridSize);
    const maxFromH = Math.floor((availH * (isSmall ? 0.28 : 0.4)) / config.gridSize);
    return Math.max(12, Math.min(40, Math.min(maxFromSource, maxFromOption, maxFromH)));
  }, [config, dims, isSmall]);

  const progressPct = config ? Math.round((round / config.rounds) * 100) : 0;
  const timePct = (timeLeft / TIME_LIMIT) * 100;

  const instructionsModalContent = (
    <>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Objective</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Identify the correct horizontal mirror reflection of the given pattern. Complete all rounds before time runs out.</p>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>How to Play</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Look at the &quot;Original Pattern&quot; grid at the top.</li>
          <li>Imagine flipping it horizontally (top row becomes bottom, etc.).</li>
          <li>Select the option (A, B, C…) that matches the correct mirror image.</li>
          <li>Complete all rounds before the timer runs out to maximize your score.</li>
        </ul>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Scoring</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Points per round. Max score {TOTAL_POINTS}. You have {TIME_LIMIT} seconds total.</p>
      </section>
      <section>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Levels</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>Easy: 4×4 grid, 3 choices, 8 rounds. Moderate: 5×5, 4 choices, 10 rounds. Hard: 6×6, 5 choices, 12 rounds.</p>
      </section>
    </>
  );

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? Object.entries(LEVELS).filter(([k]) => k === dailyGameDifficulty)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : (difficulty || 'easy');

  const renderPattern = (pattern, size, highlight, border) => (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${pattern[0].length}, ${size}px)`,
      gap: isSmall ? 1 : 2, padding: isSmall ? 3 : 6, borderRadius: isSmall ? 6 : 10,
      background: 'rgba(15,23,42,0.8)',
      border: border || '2px solid rgba(100,116,139,0.3)',
      boxShadow: highlight ? `0 0 20px ${highlight}` : '0 4px 16px rgba(0,0,0,0.3)',
      transition: 'all 0.3s',
    }}>
      {pattern.map((row, r) => row.map((cell, c) => (
        <div key={`${r}-${c}`} style={{
          width: size, height: size, borderRadius: 3,
          background: cell.filled ? cell.color : 'rgba(30,41,59,0.6)',
          border: `1px solid ${cell.filled ? 'rgba(255,255,255,0.15)' : 'rgba(100,116,139,0.15)'}`,
          transition: 'all 0.2s',
        }} />
      )))}
    </div>
  );

  if (phase === 'menu') {
    return (
      <div ref={containerRef} style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <div style={{
          position: 'relative',
          background: 'rgba(30,41,59,0.95)', borderRadius: 16, padding: isSmall ? 24 : 40,
          border: '1px solid rgba(100,116,139,0.3)', maxWidth: 420, width: '90%',
          textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            aria-label="How to play"
            style={{
              position: 'absolute', top: 16, right: 16,
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(30,41,59,0.8)',
              color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <span aria-hidden>❓</span> How to Play
          </button>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mirror-match-instructions-title"
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
                  <h2 id="mirror-match-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#8b5cf6' }}>
                    🪞 Mirror Match – How to Play
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowInstructions(false)}
                    aria-label="Close"
                    style={{
                      width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>
                  {instructionsModalContent}
                </div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShowInstructions(false)}
                    style={{
                      width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff',
                      fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
                    }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={{ fontSize: 48, marginBottom: 8 }}>🪞</div>
          <h1 style={{ fontSize: isSmall ? 24 : 32, fontWeight: 800, marginBottom: 4 }}>Mirror Match</h1>
          <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
            Identify the correct horizontal mirror reflection of the given pattern.
          </p>
          {checkingDailyGame && (
            <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: 13 }}>Checking daily challenge…</p>
          )}
          {!checkingDailyGame && isDailyGame && (
            <div style={{ marginBottom: 20, padding: '6px 16px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.5)', borderRadius: 20, fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>
              Daily Challenge
            </div>
          )}
          {!checkingDailyGame && levelEntries.map(([key, val]) => (
            <button
              key={key}
              onClick={() => !isDailyGame && setDifficulty(key)}
              disabled={isDailyGame}
              onMouseEnter={e => { if (!isDailyGame) e.target.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, hsl(${val.hue},70%,35%), hsl(${val.hue},70%,25%))`,
                color: '#e2e8f0', fontSize: 16, fontWeight: 600, cursor: isDailyGame ? 'default' : 'pointer',
                marginBottom: 12, transition: 'transform 0.15s',
              }}
            >
              {val.emoji} {val.label}
              <span style={{ display: 'block', fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                {val.gridSize}×{val.gridSize} patterns · {val.options} choices · {val.rounds} rounds
              </span>
            </button>
          ))}
          {!checkingDailyGame && (
            <button
              onClick={() => selectedLevel && startGame(selectedLevel)}
              onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, hsl(210,70%,35%), hsl(210,70%,25%))',
                color: '#e2e8f0', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 12, transition: 'transform 0.15s',
              }}
            >
              Start Game
            </button>
          )}
          {onBack && (
            <button onClick={onBack} style={{
              marginTop: 12, width: '100%', justifyContent: 'center',
              background: 'rgba(100,116,139,0.3)', border: '1px solid rgba(100,116,139,0.4)',
              color: '#e2e8f0', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            }}>← Back to Menu</button>
          )}
        </div>
      </div>
    );
  }

  const playingContent = (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isSmall ? '8px 12px' : '12px 24px', background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(100,116,139,0.3)', flexShrink: 0, minHeight: 50,
        flexWrap: 'wrap', gap: 8,
      }}>
        <button onClick={() => { clearInterval(timerRef.current); setCompletionData(null); setPhase('menu'); }} style={{
          background: 'rgba(100,116,139,0.3)', border: '1px solid rgba(100,116,139,0.4)',
          color: '#e2e8f0', padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
          fontSize: isSmall ? 12 : 14, display: 'flex', alignItems: 'center', gap: 6,
        }}>← Back</button>
        <div style={{ fontSize: isSmall ? 15 : 20, fontWeight: 700 }}>🪞 Mirror Match</div>
        <div style={{ display: 'flex', gap: isSmall ? 6 : 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: isSmall ? 11 : 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>⏱️</span>
            <span style={{ color: timeLeft <= 15 ? '#ef4444' : '#e2e8f0', fontWeight: 700 }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: isSmall ? 11 : 14 }}>⭐ {score}/{TOTAL_POINTS}</div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: isSmall ? 11 : 14 }}>📋 {round + 1}/{config?.rounds}</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progressPct}%`, transition: 'width 0.3s', background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }} />
      </div>
      <div style={{ height: 3, background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${timePct}%`, transition: 'width 1s linear', background: timeLeft <= 15 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#06b6d4' }} />
      </div>

      {/* Game area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: isSmall ? '6px 6px' : 20, gap: isSmall ? 6 : 20, overflow: 'auto' }}>
        {roundData && (
          <>
            {/* Source pattern */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isSmall ? 10 : 14, color: '#94a3b8', marginBottom: isSmall ? 2 : 6, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                Original Pattern
              </div>
              {renderPattern(roundData.original, patternCellSize, null, '2px solid rgba(139,92,246,0.5)')}
            </div>

            {/* Mirror line indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: isSmall ? 10 : 13,
            }}>
              <div style={{ height: 1, width: isSmall ? 20 : 40, background: 'linear-gradient(90deg, transparent, #8b5cf6)' }} />
              <span>↕ mirror ↕</span>
              <div style={{ height: 1, width: isSmall ? 20 : 40, background: 'linear-gradient(90deg, #8b5cf6, transparent)' }} />
            </div>

            {/* Options */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isSmall ? 10 : 14, color: '#94a3b8', marginBottom: isSmall ? 4 : 8, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                Select the correct mirror
              </div>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: isSmall ? 8 : 14,
                justifyContent: 'center', alignItems: 'center',
              }}>
                {roundData.options.map((opt, idx) => {
                  let border = '2px solid rgba(100,116,139,0.3)';
                  let glow = null;
                  if (feedback !== null && idx === selected) {
                    border = feedback === 'correct' ? '3px solid #22c55e' : '3px solid #ef4444';
                    glow = feedback === 'correct' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
                  } else if (feedback === 'wrong' && opt.isCorrect) {
                    border = '3px solid #22c55e';
                    glow = 'rgba(34,197,94,0.3)';
                  } else if (selected === idx && feedback === null) {
                    border = '2px solid #8b5cf6';
                  }
                  return (
                    <div key={idx} onClick={() => handleSelect(idx)}
                      style={{ cursor: feedback === null ? 'pointer' : 'default', transition: 'transform 0.15s', position: 'relative' }}
                      onMouseEnter={e => { if (!feedback) e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      <div style={{
                        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(30,41,59,0.9)', borderRadius: 10, padding: '1px 8px',
                        fontSize: 11, color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)',
                      }}>{String.fromCharCode(65 + idx)}</div>
                      {renderPattern(opt.pattern, patternCellSize, glow, border)}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 24px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(100,116,139,0.3)',
        textAlign: 'center', fontSize: 12, color: '#94a3b8', flexShrink: 0,
      }}>
        Find the horizontal mirror reflection of the pattern above
      </div>
    </div>
  );

  const c = completionData || {};
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        {playingContent}
      </div>
      {phase === 'gameover' && completionData != null && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Mirror Match"
          score={c.score}
          timeElapsed={c.timeElapsed ?? TIME_LIMIT}
          gameTimeLimit={TIME_LIMIT}
          isVictory={c.isVictory}
          difficulty={c.difficulty}
          customMessages={{ maxScore: TOTAL_POINTS }}
        />
      )}
    </>
  );
}
