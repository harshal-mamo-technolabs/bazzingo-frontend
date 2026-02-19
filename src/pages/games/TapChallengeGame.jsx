import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

const MAX_SCORE = 200;
const TIME_LIMIT = 120;

const LEVELS = {
  easy: { label: 'Easy', targetCount: 20, minSize: 70, maxSize: 90, spawnMs: 1800, lifeMs: 2500, maxActive: 2 },
  moderate: { label: 'Moderate', targetCount: 28, minSize: 50, maxSize: 70, spawnMs: 1200, lifeMs: 1800, maxActive: 3 },
  hard: { label: 'Hard', targetCount: 36, minSize: 35, maxSize: 55, spawnMs: 800, lifeMs: 1200, maxActive: 4 },
};

const TARGET_STYLES = [
  { bg: 'radial-gradient(circle at 35% 35%, #ff6b6b, #ee5a24)', glow: '#ff6b6b', emoji: '🎯' },
  { bg: 'radial-gradient(circle at 35% 35%, #48dbfb, #0abde3)', glow: '#48dbfb', emoji: '💎' },
  { bg: 'radial-gradient(circle at 35% 35%, #feca57, #ff9f43)', glow: '#feca57', emoji: '⭐' },
  { bg: 'radial-gradient(circle at 35% 35%, #ff9ff3, #f368e0)', glow: '#ff9ff3', emoji: '🌸' },
  { bg: 'radial-gradient(circle at 35% 35%, #55efc4, #00b894)', glow: '#55efc4', emoji: '🍀' },
  { bg: 'radial-gradient(circle at 35% 35%, #a29bfe, #6c5ce7)', glow: '#a29bfe', emoji: '🔮' },
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
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  } catch (e) {}
}
function playPop() { playTone(600 + Math.random() * 400, 0.08); }
function playMiss() { playTone(180, 0.15, 'sawtooth'); }
function playSuccess() { [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.12), i * 80)); }
function playWin() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.18), i * 100)); }

let idCounter = 0;

export default function TapChallenge({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [targets, setTargets] = useState([]);
  const [combo, setCombo] = useState(0);
  const [tapped, setTapped] = useState(0);
  const [missed, setMissed] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [spawned, setSpawned] = useState(0);
  const [result, setResult] = useState(null);
  const [ripples, setRipples] = useState([]);
  const [areaSize, setAreaSize] = useState({ w: 400, h: 400 });
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const areaRef = useRef(null);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const scoreRef = useRef(0);
  const tappedRef = useRef(0);
  const spawnedRef = useRef(0);
  const phaseRef = useRef('menu');
  const targetsRef = useRef([]);
  const timeLeftRef = useRef(TIME_LIMIT);
  const location = useLocation();

  timeLeftRef.current = timeLeft;

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { tappedRef.current = tapped; }, [tapped]);
  useEffect(() => { spawnedRef.current = spawned; }, [spawned]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { targetsRef.current = targets; }, [targets]);

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

  useEffect(() => {
    const measure = () => {
      if (!areaRef.current) return;
      const r = areaRef.current.getBoundingClientRect();
      setAreaSize({ w: r.width, h: r.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [phase]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearTimeout(spawnRef.current);
    timerRef.current = null;
    spawnRef.current = null;
    setCompletionData(null);
    setPhase('menu');
  }, []);

  const startGame = (lvl) => {
    const cfg = LEVELS[lvl];
    if (!cfg) return;
    setCompletionData(null);
    setLevel(lvl); setScore(0); setTimeLeft(TIME_LIMIT);
    setTargets([]); setCombo(0); setTapped(0); setMissed(0);
    setSpawned(0); setTotalTargets(cfg.targetCount);
    setResult(null); setRipples([]);
    scoreRef.current = 0; tappedRef.current = 0; spawnedRef.current = 0;
    targetsRef.current = [];
    setPhase('playing');
    setTimeout(() => beginSpawning(lvl), 500);
  };

  const beginSpawning = (lvl) => {
    const cfg = LEVELS[lvl];
    const spawn = () => {
      if (phaseRef.current !== 'playing') return;
      if (spawnedRef.current >= cfg.targetCount) {
        if (targetsRef.current.length === 0) endGame('win');
        return;
      }
      if (targetsRef.current.length < cfg.maxActive) {
        const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
        const style = TARGET_STYLES[Math.floor(Math.random() * TARGET_STYLES.length)];
        const id = ++idCounter;
        const t = {
          id, x: Math.random() * 80 + 5, y: Math.random() * 75 + 5,
          size, style, born: Date.now(), life: cfg.lifeMs,
        };
        setTargets(prev => { const n = [...prev, t]; targetsRef.current = n; return n; });
        setSpawned(s => s + 1);
        spawnedRef.current++;

        setTimeout(() => {
          if (phaseRef.current !== 'playing') return;
          setTargets(prev => {
            if (!prev.find(tt => tt.id === id)) return prev;
            setMissed(m => m + 1);
            setCombo(0);
            playMiss();
            const n = prev.filter(tt => tt.id !== id);
            targetsRef.current = n;
            if (spawnedRef.current >= cfg.targetCount && n.length === 0) {
              setTimeout(() => endGame('done'), 100);
            }
            return n;
          });
        }, cfg.lifeMs);
      }
      spawnRef.current = setTimeout(spawn, cfg.spawnMs * (0.8 + Math.random() * 0.4));
    };
    spawn();
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (spawnRef.current) clearTimeout(spawnRef.current);
          spawnRef.current = null;
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

  const handleTap = (target, e) => {
    if (phase !== 'playing') return;
    e.stopPropagation();
    playPop();
    const newCombo = combo + 1;
    setCombo(newCombo);

    const cfg = LEVELS[level];
    const ppr = Math.floor(MAX_SCORE / cfg.targetCount);
    const tappedNow = tappedRef.current + 1;
    const isLast = tappedNow >= cfg.targetCount;
    const earned = isLast ? MAX_SCORE - ppr * (cfg.targetCount - 1) : ppr;
    const bonus = Math.min(newCombo - 1, 5);
    const ns = Math.min(scoreRef.current + earned + bonus, MAX_SCORE);
    setScore(ns); scoreRef.current = ns;
    setTapped(tappedNow); tappedRef.current = tappedNow;

    const rect = areaRef.current?.getBoundingClientRect();
    if (rect) {
      const rx = e.clientX - rect.left, ry = e.clientY - rect.top;
      const rid = Date.now() + Math.random();
      setRipples(prev => [...prev, { id: rid, x: rx, y: ry, color: target.style.glow }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== rid)), 600);
    }

    setTargets(prev => {
      const n = prev.filter(t => t.id !== target.id);
      targetsRef.current = n;
      if (isLast || ns >= MAX_SCORE) {
        setTimeout(() => endGame('win'), 200);
      } else if (spawnedRef.current >= cfg.targetCount && n.length === 0) {
        setTimeout(() => endGame('done'), 200);
      }
      return n;
    });
  };

  const endGame = (reason) => {
    clearInterval(timerRef.current);
    if (spawnRef.current) clearTimeout(spawnRef.current);
    spawnRef.current = null;
    if (reason === 'win') playWin(); else playSuccess();
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
  const accuracy = tapped + missed > 0 ? Math.round((tapped / (tapped + missed)) * 100) : 0;

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, LEVELS[dailyGameDifficulty]]].filter(([, c]) => c)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : level;

  const tHowToPlay = useTranslateText('How to Play');
  const tGotIt = useTranslateText('Got it');
  const tDailyChallenge = useTranslateText('Daily Challenge');
  const tStartGame = useTranslateText('Start Game');
  const tGameTitle = useTranslateText('Tap Challenge');
  const tHowToPlayTitle = useTranslateText('Tap Challenge – How to Play');
  const tLevelLabels = { easy: useTranslateText('Easy'), moderate: useTranslateText('Moderate'), hard: useTranslateText('Hard') };
  const tTapBullet1 = useTranslateText('Choose a difficulty (Easy / Moderate / Hard). Each has more targets and shorter lifespans.');
  const tTapBullet2 = useTranslateText('Tap the colored targets as they appear before they disappear. Each target has a countdown ring.');
  const tTapBullet3 = useTranslateText('Tap as many as you can before time runs out. You have 2 minutes and can score up to 200 points.');
  const tTapBullet4 = useTranslateText('Consecutive taps build a combo for bonus points. Missing a target (letting it expire) resets the combo.');
  const tTapBullet5 = useTranslateText('Complete all targets in time for a win. Test your reaction time and accuracy!');

  const instructionsModalContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>{tHowToPlay}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>{tTapBullet1}</li>
        <li>{tTapBullet2}</li>
        <li>{tTapBullet3}</li>
        <li>{tTapBullet4}</li>
        <li>{tTapBullet5}</li>
      </ul>
    </>
  );

  const css = `
    @keyframes tc-pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes tc-pop{0%{transform:translate(-50%,-50%) scale(0);opacity:1}60%{transform:translate(-50%,-50%) scale(1.15)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
    @keyframes tc-ripple{0%{transform:translate(-50%,-50%) scale(0);opacity:.6}100%{transform:translate(-50%,-50%) scale(3);opacity:0}}
    @keyframes tc-float{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-6px)}}
    @keyframes tc-shrink{0%{stroke-dashoffset:0}100%{stroke-dashoffset:283}}
    @keyframes tc-comboPop{0%{transform:translateX(-50%) scale(.5);opacity:0}50%{transform:translateX(-50%) scale(1.2)}100%{transform:translateX(-50%) scale(1);opacity:1}}
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
      animation: u ? 'tc-pulse 1s infinite' : 'none',
    }),
    content: {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      width: '100%', maxWidth: 900, padding: 16,
    },
    area: {
      position: 'relative', width: '100%', flex: 1,
      borderRadius: 20, overflow: 'hidden',
      background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
      border: '1px solid rgba(255,255,255,0.06)',
      minHeight: 200,
    },
    target: (t) => {
      const age = (Date.now() - t.born) / t.life;
      const opacity = age > 0.7 ? 1 - (age - 0.7) / 0.3 : 1;
      return {
        position: 'absolute',
        left: `${t.x}%`, top: `${t.y}%`,
        transform: 'translate(-50%, -50%)',
        width: t.size, height: t.size,
        borderRadius: '50%',
        background: t.style.bg,
        boxShadow: `0 0 20px ${t.style.glow}60, 0 0 40px ${t.style.glow}30, inset 0 -3px 6px rgba(0,0,0,0.3)`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: t.size * 0.4,
        animation: 'tc-pop 0.3s ease-out, tc-float 2s ease-in-out infinite',
        opacity: Math.max(0.2, opacity),
        transition: 'opacity 0.2s',
        userSelect: 'none', WebkitTapHighlightColor: 'transparent',
        zIndex: 5,
      };
    },
    timerRing: (t) => ({
      position: 'absolute', inset: -3,
      pointerEvents: 'none',
    }),
    ripple: (r) => ({
      position: 'absolute', left: r.x, top: r.y,
      width: 40, height: 40, borderRadius: '50%',
      background: `${r.color}40`,
      border: `2px solid ${r.color}80`,
      animation: 'tc-ripple 0.6s ease-out forwards',
      pointerEvents: 'none', zIndex: 3,
    }),
    statsRow: {
      display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: '#94a3b8',
    },
    menuCard: {
      background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
      borderRadius: 24, padding: '40px 32px',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center', maxWidth: 420, width: '90%',
    },
    menuTitle: {
      fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900,
      background: 'linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: 8,
    },
    menuSub: { fontSize: 14, color: '#94a3b8', marginBottom: 28, lineHeight: 1.5 },
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
  };

  return (
    <div style={s.wrapper}>
      <style>{css}</style>
      <div style={s.header}>
        <button style={s.backBtn} onClick={phase === 'menu' ? (onBack ? () => onBack() : () => window.history.back()) : handleReset}>
          {phase === 'menu' ? '← Home' : '← Menu'}
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>👆 Tap Challenge</span>
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
            <span aria-hidden>❓</span> {tHowToPlay}
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
              aria-labelledby="tap-challenge-instructions-title"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(255,107,107,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <h2 id="tap-challenge-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#ff6b6b' }}>
                    👆 {tHowToPlayTitle}
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
                    {tGotIt}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div style={s.menuCard}>
            {isDailyGame && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,107,107,0.2)', color: '#fca5a5', fontSize: 12, fontWeight: 600 }}>
                📅 {tDailyChallenge}
              </div>
            )}
            <div style={s.menuTitle}>{tGameTitle}</div>
            <p style={s.menuSub}>
              Tap targets as fast as possible before they disappear!<br />
              Test your reaction time and accuracy.
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
                {tLevelLabels[key]}
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>
                  {cfg.targetCount} targets · {cfg.lifeMs / 1000}s lifespan · max {cfg.maxActive} active
                </div>
              </button>
            ))}
            <button
              style={{ ...s.levelBtn(0), marginTop: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              disabled={!selectedLevel || checkingDailyGame}
              onClick={() => startGame(selectedLevel)}
            >
              {tStartGame}
            </button>
          </div>
        </div>
      )}

      {(phase === 'playing' || phase === 'gameover') && (
      <div style={{ ...s.content, pointerEvents: phase === 'gameover' ? 'none' : 'auto' }}>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
          Tapped: {tapped}/{totalTargets} · Missed: {missed} · Accuracy: {accuracy}%
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
        <div ref={areaRef} style={s.area}>
          {targets.map(t => (
            <div key={t.id} style={s.target(t)} onPointerDown={(e) => handleTap(t, e)}>
              {t.style.emoji}
              <svg style={{ position: 'absolute', inset: -3, pointerEvents: 'none' }}
                width={t.size + 6} height={t.size + 6} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none"
                  stroke={t.style.glow} strokeWidth="2" strokeOpacity="0.4"
                  strokeDasharray="283"
                  style={{
                    animation: `tc-shrink ${t.life}ms linear forwards`,
                    animationDelay: `-${Date.now() - t.born}ms`,
                  }}
                />
              </svg>
            </div>
          ))}
          {ripples.map(r => <div key={r.id} style={s.ripple(r)} />)}
          {targets.length === 0 && spawnedRef.current < (level ? LEVELS[level].targetCount : 999) && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#64748b', fontSize: 16,
            }}>Get ready...</div>
          )}
        </div>
      </div>
      )}

      {phase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Tap Challenge"
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
