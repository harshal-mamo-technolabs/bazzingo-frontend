import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

const DIFFICULTIES = {
  Easy: 0,
  Moderate: 1,
  Hard: 2,
};

// ─── CONSTANTS ────────────────────────────────────────────
const MAX_SCORE = 200;
const TIME_LIMIT = 180;
const LEVELS = [
  {
    name: 'Calm Lagoon',
    icon: '🏝️',
    timeLimit: 60,
    targetCount: 8,
    spawnRate: 1.2,
    fishTypes: ['blue', 'yellow'],
    junkTypes: ['tire'],
    waterColor1: '#3b9ed9',
    waterColor2: '#1a6fb5',
    skyColor1: '#87ceeb',
    skyColor2: '#5ba3d9',
    maxPoints: 67,
    description: 'Catch 8 target fish in calm waters',
  },
  {
    name: 'Open Sea',
    icon: '🌊',
    timeLimit: 75,
    targetCount: 12,
    spawnRate: 0.9,
    fishTypes: ['blue', 'yellow', 'puffer'],
    junkTypes: ['tire', 'boot'],
    waterColor1: '#2980b9',
    waterColor2: '#1a5276',
    skyColor1: '#5dade2',
    skyColor2: '#2e86c1',
    maxPoints: 67,
    description: 'Catch 12 fish & avoid junk',
  },
  {
    name: 'Deep Abyss',
    icon: '🐙',
    timeLimit: 90,
    targetCount: 16,
    spawnRate: 0.7,
    fishTypes: ['blue', 'yellow', 'puffer', 'shark'],
    junkTypes: ['tire', 'boot', 'jellyfish'],
    waterColor1: '#1b4f72',
    waterColor2: '#0b2545',
    skyColor1: '#2c3e50',
    skyColor2: '#1a252f',
    maxPoints: 66,
    description: 'Brave the deep for 16 catches',
  },
];

const FISH_DEFS = {
  blue: { emoji: '🐟', name: 'Blue Fish', points: 10, speed: 1.2, size: 36, color: '#5dade2' },
  yellow: { emoji: '🐠', name: 'Tropical Fish', points: 15, speed: 1.5, size: 32, color: '#f4d03f' },
  puffer: { emoji: '🐡', name: 'Puffer Fish', points: 20, speed: 0.8, size: 40, color: '#e67e22' },
  shark: { emoji: '🦈', name: 'Shark', points: 30, speed: 2.0, size: 48, color: '#7f8c8d' },
};

const JUNK_DEFS = {
  tire: { emoji: '🛞', name: 'Tire', points: -15, speed: 0.5, size: 38, color: '#2c3e50' },
  boot: { emoji: '👢', name: 'Old Boot', points: -10, speed: 0.4, size: 30, color: '#6d4c41' },
  jellyfish: { emoji: '🪼', name: 'Jellyfish', points: -20, speed: 0.9, size: 36, color: '#c39bd3' },
};

let audioCtx = null;
const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

const playSound = (type) => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'cast') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'catch') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
      // bonus chime
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.type = 'sine'; o2.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      g2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
      g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      o2.start(ctx.currentTime + 0.1); o2.stop(ctx.currentTime + 0.3);
    } else if (type === 'junk') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'reel') {
      osc.type = 'square'; osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'splash') {
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 800;
      src.connect(filt); filt.connect(g); g.connect(ctx.destination);
      src.start(); return;
    } else if (type === 'win') {
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.15 + 0.3);
        o.start(ctx.currentTime + i * 0.15); o.stop(ctx.currentTime + i * 0.15 + 0.3);
      }); return;
    } else if (type === 'lose') {
      [400, 350, 300, 200].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sawtooth'; o.frequency.value = f;
        g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.2);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.3);
        o.start(ctx.currentTime + i * 0.2); o.stop(ctx.currentTime + i * 0.2 + 0.3);
      }); return;
    }
  } catch (e) {}
};

/* ─────────────────── MAIN WRAPPER COMPONENT ─────────────────── */
export default function FishermansCatchGame() {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);

  const levelIdx = DIFFICULTIES[difficulty];

  const handleStart = useCallback(() => {
    getAudioCtx();
    setScore(0);
    setTimeRemaining(TIME_LIMIT);
    setGameState('playing');
  }, []);

  const handleReset = useCallback(() => {
    setScore(0);
    setTimeRemaining(TIME_LIMIT);
  }, []);

  useEffect(() => {
    if (gameState === 'finished') {
      // Cleanup if needed
    }
  }, [gameState]);

  // Instructions section
  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Cast your fishing line and catch the target number of fish before time runs out!
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click on water to cast your line</li>
          <li>• Use ← → or A/D to move boat</li>
          <li>• Press Space for quick cast</li>
          <li>• Catch fish, avoid junk!</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 🐟 Blue Fish: +10 pts</li>
          <li>• 🐠 Tropical: +15 pts</li>
          <li>• 🐡 Puffer: +20 pts</li>
          <li>• 🦈 Shark: +30 pts</li>
          <li>• Junk items: negative points!</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Difficulty
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Easy: 🏝️ Calm Lagoon (8 fish)</li>
          <li>• Moderate: 🌊 Open Sea (12 fish)</li>
          <li>• Hard: 🐙 Deep Abyss (16 fish)</li>
          <li>• Build combos for bonus points!</li>
        </ul>
      </div>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Fisherman's Catch"
      gameShortDescription="Cast your line and catch fish before time runs out"
      category="Arcade"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      instructionsSection={instructionsSection}
      showHeader={false}
    >
      <FishermansCatchCore
        key={levelIdx}
        levelIdx={levelIdx}
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        setScore={setScore}
        timeRemaining={timeRemaining}
        setTimeRemaining={setTimeRemaining}
      />
    </GameFrameworkV2>
  );
}

/* ─────────────────── CORE GAME COMPONENT (preserves all original CSS & graphics) ─────────────────── */
function FishermansCatchCore({ levelIdx, gameState, setGameState, score, setScore, timeRemaining, setTimeRemaining }) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const stateRef = useRef(null);
  const keysRef = useRef({});
  const [, forceUpdate] = useState(0);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  const play = useCallback((t) => { if (!mutedRef.current) playSound(t); }, []);

  // ─── GAME STATE ──────────────────────────────────────
  const initGame = useCallback((levelIdx) => {
    const lvl = LEVELS[levelIdx];
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      phase: 'playing',
      level: levelIdx,
      w, h,
      timeLeft: lvl.timeLimit,
      score: 0,
      caught: 0,
      targetCount: lvl.targetCount,
      boat: { x: w / 2, vx: 0 },
      line: null, // { y, targetY, hookedItem, reeling }
      items: [],
      spawnTimer: 0,
      bubbles: [],
      popups: [],
      waves: Array.from({ length: 5 }, (_, i) => ({
        y: h * 0.18 + i * (h * 0.16),
        offset: Math.random() * 1000,
        amplitude: 8 + Math.random() * 6,
        speed: 0.3 + Math.random() * 0.4,
      })),
      combo: 0,
      comboTimer: 0,
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !stateRef.current) {
      stateRef.current = initGame(levelIdx);
      lastTimeRef.current = 0;
      forceUpdate(n => n + 1);
    }
  }, [gameState, levelIdx, initGame]);

  // ─── INPUT ────────────────────────────────────────────
  useEffect(() => {
    const kd = (e) => { keysRef.current[e.key] = true; };
    const ku = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  // ─── TOUCH CONTROLS ──────────────────────────────────
  const touchRef = useRef({ active: false, x: 0 });

  // ─── SPAWN ITEM ──────────────────────────────────────
  const spawnItem = useCallback((s) => {
    const lvl = LEVELS[s.level];
    const allTypes = [...lvl.fishTypes, ...lvl.junkTypes];
    const type = allTypes[Math.floor(Math.random() * allTypes.length)];
    const def = FISH_DEFS[type] || JUNK_DEFS[type];
    const isFish = !!FISH_DEFS[type];
    const waterTop = s.h * 0.2;
    const fromLeft = Math.random() > 0.5;
    return {
      id: Math.random(),
      type,
      isFish,
      def,
      x: fromLeft ? -50 : s.w + 50,
      y: waterTop + 40 + Math.random() * (s.h * 0.65),
      vx: (fromLeft ? 1 : -1) * def.speed * (0.8 + Math.random() * 0.4) * 60,
      vy: 0,
      wobbleOffset: Math.random() * Math.PI * 2,
      caught: false,
      size: def.size,
    };
  }, []);

  // ─── GAME LOOP ────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const s = stateRef.current;
      if (!s || s.phase !== 'playing') { rafRef.current = requestAnimationFrame(loop); return; }

      const lvl = LEVELS[s.level];

      // Resize
      s.w = window.innerWidth;
      s.h = window.innerHeight;
      const waterTop = s.h * 0.2;
      const boatY = waterTop - 10;

      // Timer
      s.timeLeft -= dt;
      setTimeRemaining(Math.ceil(s.timeLeft));
      if (s.timeLeft <= 0) {
        s.timeLeft = 0;
        s.phase = 'done';
        play('lose');
        setGameState('finished');
      }

      // Combo timer
      if (s.comboTimer > 0) {
        s.comboTimer -= dt;
        if (s.comboTimer <= 0) { s.combo = 0; s.comboTimer = 0; }
      }

      // Boat movement
      const boatSpeed = 350;
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) s.boat.vx = -boatSpeed;
      else if (keysRef.current['ArrowRight'] || keysRef.current['d']) s.boat.vx = boatSpeed;
      else if (touchRef.current.active) {
        const diff = touchRef.current.x - s.boat.x;
        s.boat.vx = Math.sign(diff) * Math.min(Math.abs(diff) * 3, boatSpeed);
      } else {
        s.boat.vx *= 0.9;
      }
      s.boat.x += s.boat.vx * dt;
      s.boat.x = Math.max(40, Math.min(s.w - 40, s.boat.x));

      // Line logic
      if (s.line) {
        if (s.line.reeling) {
          s.line.y -= 400 * dt;
          if (s.line.hookedItem) {
            s.line.hookedItem.x += (s.boat.x - s.line.hookedItem.x) * 3 * dt;
            s.line.hookedItem.y = s.line.y;
          }
          if (s.line.y <= boatY) {
            // Caught!
            if (s.line.hookedItem) {
              const item = s.line.hookedItem;
              let pts = item.def.points;
              if (item.isFish) {
                s.combo++;
                s.comboTimer = 3;
                if (s.combo >= 3) pts = Math.floor(pts * 1.5);
                s.caught++;
                play('catch');
              } else {
                s.combo = 0;
                play('junk');
              }
              s.score = Math.max(0, s.score + pts);
              setScore(s.score);
              s.popups.push({
                x: s.boat.x, y: boatY - 20,
                text: pts > 0 ? `+${pts}` : `${pts}`,
                color: pts > 0 ? '#2ecc71' : '#e74c3c',
                life: 1.5,
              });
              if (s.combo >= 3) {
                s.popups.push({
                  x: s.boat.x, y: boatY - 50,
                  text: `🔥 x${s.combo} COMBO!`,
                  color: '#f39c12',
                  life: 2,
                });
              }
              s.items = s.items.filter(i => i.id !== item.id);
            }
            play('splash');
            // Add bubbles
            for (let i = 0; i < 6; i++) {
              s.bubbles.push({
                x: s.boat.x + (Math.random() - 0.5) * 30,
                y: boatY + 20,
                vy: -(30 + Math.random() * 40),
                size: 3 + Math.random() * 5,
                life: 1 + Math.random(),
              });
            }
            s.line = null;

            // Check win
            if (s.caught >= s.targetCount) {
              s.phase = 'done';
              play('win');
              setGameState('finished');
            }
          }
        } else {
          // Dropping
          s.line.y += 300 * dt;
          s.line.x = s.boat.x; // follow boat horizontally
          if (s.line.y >= s.line.targetY) {
            s.line.y = s.line.targetY;
            // Check for catch
            const hookX = s.line.x;
            const hookY = s.line.y;
            let closest = null;
            let closestDist = 40;
            for (const item of s.items) {
              if (item.caught) continue;
              const dx = item.x - hookX;
              const dy = item.y - hookY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < closestDist) { closest = item; closestDist = dist; }
            }
            if (closest) {
              closest.caught = true;
              s.line.hookedItem = closest;
              play('reel');
            }
            s.line.reeling = true;
          }
        }
      }

      // Spawn items
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        s.items.push(spawnItem(s));
        s.spawnTimer = lvl.spawnRate * (0.7 + Math.random() * 0.6);
      }

      // Move items
      for (const item of s.items) {
        if (item.caught) continue;
        item.x += item.vx * dt;
        item.y += Math.sin(Date.now() * 0.003 + item.wobbleOffset) * 0.5;
      }
      s.items = s.items.filter(i => i.caught || (i.x > -100 && i.x < s.w + 100));

      // Bubbles
      for (const b of s.bubbles) {
        b.y += b.vy * dt;
        b.life -= dt;
      }
      s.bubbles = s.bubbles.filter(b => b.life > 0);

      // Popups
      for (const p of s.popups) {
        p.y -= 40 * dt;
        p.life -= dt;
      }
      s.popups = s.popups.filter(p => p.life > 0);

      forceUpdate(n => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [gameState, play, spawnItem, setGameState, setScore, setTimeRemaining]);

  // ─── CAST LINE ────────────────────────────────────────
  const castLine = useCallback((targetY) => {
    const s = stateRef.current;
    if (!s || s.line || s.phase !== 'playing') return;
    const waterTop = s.h * 0.2;
    if (targetY < waterTop) return;
    s.line = { x: s.boat.x, y: waterTop - 10, targetY, hookedItem: null, reeling: false };
    play('cast');
  }, [play]);

  const handleClick = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = e.clientY - rect.top;
    castLine(y);
  }, [castLine]);

  // Space to cast
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        const s = stateRef.current;
        if (s) castLine(s.h * 0.55);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, castLine]);

  // Touch
  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchRef.current = { active: true, x: t.clientX };
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) castLine(t.clientY - rect.top);
  }, [castLine]);
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length) touchRef.current.x = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(() => { touchRef.current.active = false; }, []);

  // ─── RENDER ───────────────────────────────────────────
  const s = stateRef.current;

  if (!s || gameState !== 'playing') return null;
  const lvl = LEVELS[s.level];
  const waterTop = s.h * 0.2;
  const boatY = waterTop - 10;
  const timePercent = s.timeLeft / lvl.timeLimit;
  const catchPercent = s.caught / lvl.targetCount;

  return (
    <div ref={containerRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', cursor: 'crosshair',
        background: `linear-gradient(180deg, ${lvl.skyColor1} 0%, ${lvl.skyColor2} ${20}%, ${lvl.waterColor1} ${22}%, ${lvl.waterColor2} 100%)`,
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        userSelect: 'none',
      }}
    >
      {/* Sun/Moon */}
      <div style={{
        position: 'absolute', top: 20, right: 80,
        width: 50, height: 50, borderRadius: '50%',
        background: s.level === 2
          ? 'radial-gradient(circle, #ecf0f1 40%, transparent 70%)'
          : 'radial-gradient(circle, #f9e547 30%, #f39c12 70%, transparent 100%)',
        boxShadow: s.level === 2
          ? '0 0 30px rgba(236,240,241,0.4)'
          : '0 0 40px rgba(243,156,18,0.5)',
      }} />

      {/* Clouds */}
      {[0.1, 0.35, 0.65, 0.85].map((xr, i) => (
        <div key={i} style={{
          position: 'absolute', top: 15 + i * 20, left: `${xr * 100}%`,
          width: 80 + i * 20, height: 24 + i * 4,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.25)',
          filter: 'blur(2px)',
        }} />
      ))}

      {/* Water waves */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {s.waves.map((wave, i) => {
          const t = Date.now() * 0.001 * wave.speed + wave.offset;
          const points = [];
          for (let x = -20; x <= s.w + 20; x += 30) {
            const y = wave.y + Math.sin(x * 0.01 + t) * wave.amplitude + Math.sin(x * 0.02 + t * 1.5) * (wave.amplitude * 0.5);
            points.push(`${x},${y}`);
          }
          points.push(`${s.w + 20},${s.h}`);
          points.push(`-20,${s.h}`);
          return (
            <polygon key={i} points={points.join(' ')}
              fill={`rgba(${30 + i * 15}, ${100 + i * 20}, ${180 + i * 10}, 0.08)`}
            />
          );
        })}
      </svg>

      {/* Water surface line */}
      <div style={{
        position: 'absolute', top: waterTop, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
      }} />

      {/* Items (fish / junk) */}
      {s.items.map(item => (
        <div key={item.id} style={{
          position: 'absolute',
          left: item.x - item.size / 2,
          top: item.y - item.size / 2,
          fontSize: item.size,
          lineHeight: '1',
          transform: item.vx < 0 ? 'scaleX(-1)' : '',
          filter: item.caught ? 'brightness(1.5)' : '',
          transition: 'filter 0.15s',
          pointerEvents: 'none',
        }}>
          {item.def.emoji}
          {!item.isFish && (
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              fontSize: 14, lineHeight: '1',
            }}>⚠️</div>
          )}
        </div>
      ))}

      {/* Fishing line */}
      {s.line && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line
            x1={s.boat.x} y1={boatY + 5}
            x2={s.line.x || s.boat.x} y2={s.line.y}
            stroke="rgba(255,255,255,0.6)" strokeWidth={2}
            strokeDasharray={s.line.reeling ? '4,4' : 'none'}
          />
          {/* Hook */}
          <circle cx={s.line.x || s.boat.x} cy={s.line.y} r={5}
            fill="none" stroke="#bdc3c7" strokeWidth={2}
          />
          {s.line.hookedItem && (
            <text x={(s.line.x || s.boat.x)} y={s.line.y + 6} textAnchor="middle" fontSize={s.line.hookedItem.size * 0.8}>
              {s.line.hookedItem.def.emoji}
            </text>
          )}
        </svg>
      )}

      {/* Boat */}
      <div style={{
        position: 'absolute',
        left: s.boat.x - 35,
        top: boatY - 25,
        pointerEvents: 'none',
        fontSize: 40,
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
        transform: s.boat.vx > 20 ? 'scaleX(-1)' : '',
        transition: 'transform 0.3s',
      }}>
        {/* Boat body */}
        <svg width="70" height="50" viewBox="0 0 70 50">
          {/* Hull */}
          <path d="M5 30 Q10 45 35 45 Q60 45 65 30 Z" fill="#8B4513" stroke="#5D2E0C" strokeWidth="2" />
          <path d="M10 30 Q12 40 35 40 Q58 40 60 30 Z" fill="#A0522D" />
          {/* Deck */}
          <rect x="15" y="26" width="40" height="6" rx="2" fill="#CD853F" />
          {/* Mast */}
          <line x1="35" y1="26" x2="35" y2="6" stroke="#8B4513" strokeWidth="2" />
          {/* Fisherman */}
          <circle cx="30" cy="18" r="5" fill="#FDBCB4" />
          <rect x="27" y="23" width="6" height="4" rx="1" fill="#e74c3c" />
          {/* Hat */}
          <ellipse cx="30" cy="14" rx="7" ry="3" fill="#f4d03f" />
          {/* Fishing rod */}
          <line x1="36" y1="20" x2="55" y2="8" stroke="#8B4513" strokeWidth="1.5" />
          <line x1="55" y1="8" x2="58" y2="12" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Bubbles */}
      {s.bubbles.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.x, top: b.y,
          width: b.size, height: b.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.5)',
          pointerEvents: 'none',
          opacity: b.life,
        }} />
      ))}

      {/* Popups */}
      {s.popups.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          fontSize: 20, fontWeight: 800,
          color: p.color,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          opacity: Math.min(p.life, 1),
          transform: 'translateX(-50%)',
        }}>{p.text}</div>
      ))}

      {/* HUD */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '8px 16px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
        display: 'flex', alignItems: 'center', gap: 16,
        color: '#fff', fontSize: 14, fontWeight: 600,
        pointerEvents: 'auto',
      }}>
        {/* Timer */}
        <div style={{ flex: 1, maxWidth: 160 }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>⏱ TIME</div>
          <div style={{
            height: 8, borderRadius: 4,
            background: 'rgba(255,255,255,0.15)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${timePercent * 100}%`,
              background: timePercent > 0.3
                ? 'linear-gradient(90deg, #2ecc71, #27ae60)'
                : 'linear-gradient(90deg, #e74c3c, #c0392b)',
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>{Math.ceil(s.timeLeft)}s</div>
        </div>

        {/* Catch progress */}
        <div style={{ flex: 1, maxWidth: 160 }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>🐟 CAUGHT</div>
          <div style={{
            height: 8, borderRadius: 4,
            background: 'rgba(255,255,255,0.15)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${Math.min(catchPercent, 1) * 100}%`,
              background: 'linear-gradient(90deg, #3498db, #2980b9)',
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 12, marginTop: 2 }}>{s.caught}/{lvl.targetCount}</div>
        </div>

        {/* Score */}
        <div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>SCORE</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f4d03f' }}>{s.score}</div>
        </div>

        {/* Combo */}
        {s.combo >= 2 && (
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e67e22', animation: 'fishPulse 0.5s ease-in-out infinite' }}>
            🔥 x{s.combo}
          </div>
        )}

        {/* Level */}
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {lvl.icon} Lv.{s.level + 1}
        </div>

        {/* Mute */}
        <button onClick={(e) => {
          e.stopPropagation();
          mutedRef.current = !mutedRef.current;
          setMuted(m => !m);
        }} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
          padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 16,
        }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Bottom hint */}
      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        fontSize: 12, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none',
      }}>
        Click water to cast · ← → or A/D to move boat · Space for quick cast
      </div>

      {/* Target list */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
        borderRadius: 12, padding: '8px 12px',
        display: 'flex', gap: 8, color: '#fff', fontSize: 12,
        pointerEvents: 'none',
      }}>
        <span style={{ fontWeight: 700, opacity: 0.7 }}>TARGETS:</span>
        {lvl.fishTypes.map(ft => (
          <span key={ft}>{FISH_DEFS[ft].emoji} +{FISH_DEFS[ft].points}</span>
        ))}
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ fontWeight: 700, opacity: 0.7, color: '#e74c3c' }}>AVOID:</span>
        {lvl.junkTypes.map(jt => (
          <span key={jt}>{JUNK_DEFS[jt].emoji} {JUNK_DEFS[jt].points}</span>
        ))}
      </div>

      <style>{`
        @keyframes fishPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
