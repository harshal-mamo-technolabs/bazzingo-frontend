import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import happyShopkeeper from '/happy-shopkeeper.png'
import confusedShopkeeper from '/confused-shopkeeper.png';
import happyCustomer from '/happy-customer.png';
import angryCustomer from '/angry-customer.png';
import freshMarketShop from '/fresh-market-shop.png';

// ─── constants ───────────────────────────────────────────────────
const MAX_SCORE = 200;
const TIME_LIMIT = 150;

const ITEMS = [
  { name: 'Apples', emoji: '🍎', color: '#e74c3c', shelfColor: '#c0392b' },
  { name: 'Bread', emoji: '🍞', color: '#e67e22', shelfColor: '#d35400' },
  { name: 'Cheese', emoji: '🧀', color: '#f1c40f', shelfColor: '#d4ac0d' },
  { name: 'Fish', emoji: '🐟', color: '#3498db', shelfColor: '#2980b9' },
  { name: 'Grapes', emoji: '🍇', color: '#9b59b6', shelfColor: '#8e44ad' },
  { name: 'Milk', emoji: '🥛', color: '#ecf0f1', shelfColor: '#bdc3c7' },
  { name: 'Eggs', emoji: '🥚', color: '#fdebd0', shelfColor: '#f0d9b5' },
  { name: 'Honey', emoji: '🍯', color: '#f39c12', shelfColor: '#e67e22' },
  { name: 'Peppers', emoji: '🌶️', color: '#c0392b', shelfColor: '#96281b' },
  { name: 'Carrots', emoji: '🥕', color: '#e67e22', shelfColor: '#ca6f1e' },
  { name: 'Herbs', emoji: '🌿', color: '#27ae60', shelfColor: '#1e8449' },
  { name: 'Spices', emoji: '🫚', color: '#d35400', shelfColor: '#a04000' },
  { name: 'Tea', emoji: '🍵', color: '#1abc9c', shelfColor: '#16a085' },
  { name: 'Cake', emoji: '🍰', color: '#e91e8e', shelfColor: '#c2185b' },
  { name: 'Nuts', emoji: '🥜', color: '#8d6e63', shelfColor: '#6d4c41' },
];

const CUSTOMERS = [
  { name: 'Jenifer' },
  { name: 'Priya' },
  { name: 'ammy' },
  { name: 'Meera' },
  { name: 'Kiran' },
];

const LEVELS = {
  Easy: { name: 'Easy', subtitle: 'Morning Market', orderSize: 2, totalRounds: 5, peekTime: 6000, maxQty: 2, itemPool: 6, accent: '#27ae60', description: 'Small orders, longer peek time' },
  Moderate: { name: 'Moderate', subtitle: 'Afternoon Bazaar', orderSize: 3, totalRounds: 5, peekTime: 5000, maxQty: 3, itemPool: 10, accent: '#e67e22', description: 'Bigger orders, moderate peek time' },
  Hard: { name: 'Hard', subtitle: 'Festival Rush', orderSize: 4, totalRounds: 5, peekTime: 4000, maxQty: 4, itemPool: 15, accent: '#e43f5a', description: 'Large orders, short peek time' },
};

// ─── Audio ───────────────────────────────────────────────────────
const audioCtxRef = { current: null };
function getAudioCtx() {
  if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtxRef.current;
}
function playTone(freq, dur = 0.12, type = 'triangle', vol = 0.15) {
  try {
    const ctx = getAudioCtx(); const g = ctx.createGain(); const o = ctx.createOscillator();
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  } catch (_) {}
}
function sfx(name) {
  const m = {
    select: () => playTone(660, 0.08, 'sine', 0.12),
    correct: () => { playTone(523, 0.1, 'sine', 0.15); setTimeout(() => playTone(659, 0.1, 'sine', 0.15), 100); setTimeout(() => playTone(784, 0.15, 'sine', 0.15), 200); },
    wrong: () => { playTone(200, 0.25, 'sawtooth', 0.12); },
    win: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.15), i * 150)); },
    lose: () => { [400, 350, 300, 250].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sawtooth', 0.1), i * 200)); },
    peek: () => playTone(880, 0.06, 'sine', 0.1),
    bell: () => { playTone(1200, 0.15, 'sine', 0.12); setTimeout(() => playTone(1600, 0.1, 'sine', 0.1), 100); },
    footstep: () => playTone(120, 0.05, 'square', 0.06),
    serve: () => { playTone(500, 0.08, 'sine', 0.1); setTimeout(() => playTone(700, 0.1, 'sine', 0.12), 80); },
  };
  m[name]?.();
}

// ─── Speech Bubble ───────────────────────────────────────────────
function SpeechBubble({ children, direction = 'right', visible }) {
  return (
    <div style={{
      position: 'relative', background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '12px 16px',
      color: '#1a1a2e', maxWidth: 240, minWidth: 130,
      boxShadow: '0 6px 24px rgba(0,0,0,0.3)', transition: 'all 0.4s',
      transform: visible ? 'scale(1)' : 'scale(0)', opacity: visible ? 1 : 0,
      transformOrigin: direction === 'right' ? 'bottom left' : 'bottom right',
    }}>
      {children}
      <div style={{
        position: 'absolute', bottom: -10, [direction === 'right' ? 'left' : 'right']: 24,
        width: 0, height: 0,
        borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
        borderTop: '12px solid rgba(255,255,255,0.95)',
      }} />
    </div>
  );
}

// ─── Inventory Shelf ─────────────────────────────────────────────
function InventoryShelf({ items, onSelect, selectedItem }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(90,60,30,0.8), rgba(60,40,20,0.9))',
      borderRadius: 14, padding: '12px',
      border: '2px solid rgba(139,69,19,0.6)',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '0 4px' }}>
        <span style={{ fontSize: 16 }}>🗄️</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Inventory</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 8 }}>
        {items.map((item, i) => {
          const sel = selectedItem?.name === item.name;
          return (
            <button key={i} onClick={() => { onSelect(item); sfx('select'); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                border: sel ? `2px solid ${item.color}` : '2px solid rgba(255,255,255,0.08)',
                background: sel ? `${item.color}25` : 'rgba(255,255,255,0.06)',
                transition: 'all 0.2s', transform: sel ? 'scale(1.1)' : 'none',
                boxShadow: sel ? `0 0 14px ${item.color}40` : 'none',
              }}>
              <span style={{ fontSize: 26 }}>{item.emoji}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 600, lineHeight: 1 }}>{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Serving Tray ────────────────────────────────────────────────
function ServingTray({ served, onRemove }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(60,40,20,0.8), rgba(90,60,30,0.7))',
      borderRadius: 14, padding: '10px 12px', border: '2px solid rgba(139,69,19,0.4)',
      minHeight: 56,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>🍽️</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Serving Tray</span>
      </div>
      {served.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', margin: 0, textAlign: 'center', padding: '10px 0' }}>Pick items from the shelf...</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {served.map((s, i) => (
            <div key={i} onClick={() => onRemove(i)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
              background: `${s.item.color}20`, borderRadius: 10, border: `1px solid ${s.item.color}50`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 20 }}>{s.item.emoji}</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>×{s.qty}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>✕</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Animated Canvas Background ──────────────────────────────────
function BazaarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let raf; const particles = [];
    const resize = () => { c.width = c.offsetWidth * (window.devicePixelRatio || 1); c.height = c.offsetHeight * (window.devicePixelRatio || 1); };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 50; i++) particles.push({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 2.5 + 0.5, vx: (Math.random() - 0.5) * 0.4, vy: -Math.random() * 0.5 - 0.1,
      a: Math.random() * 0.4 + 0.1, hue: Math.random() * 60 + 15,
    });
    function draw(t) {
      const grd = ctx.createLinearGradient(0, 0, 0, c.height);
      grd.addColorStop(0, '#0d1b2a'); grd.addColorStop(0.4, '#1b2838'); grd.addColorStop(1, '#2c1810');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < 50; i++) {
        const sx = (Math.sin(i * 127.1 + i) * 0.5 + 0.5) * c.width;
        const sy = (Math.cos(i * 311.7 + i) * 0.5 + 0.5) * c.height * 0.35;
        const tw = Math.sin(t / 1000 + i) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255,255,220,${tw * 0.5})`; ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill();
      }
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = c.height + 10; p.x = Math.random() * c.width; }
        if (p.x < -10) p.x = c.width + 10; if (p.x > c.width + 10) p.x = -10;
        const fl = Math.sin(t / 500 + p.a * 80) * 0.3 + 0.7;
        ctx.fillStyle = `hsla(${p.hue},90%,65%,${p.a * fl})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />;
}

// ─── Main Game Component ─────────────────────────────────────────
export default function MarketRush() {
  const location = useLocation();
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [phase, setPhase] = useState('peek');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [order, setOrder] = useState([]);
  const [served, setServed] = useState([]);
  const [currentSelect, setCurrentSelect] = useState(null);
  const [currentQty, setCurrentQty] = useState(1);
  const [roundFeedback, setRoundFeedback] = useState(null);
  const [peekProgress, setPeekProgress] = useState(100);
  const [availableItems, setAvailableItems] = useState([]);
  const [combo, setCombo] = useState(0);
  const [customer, setCustomer] = useState(CUSTOMERS[0]);
  const [customerMood, setCustomerMood] = useState('neutral');
  const [shopkeeperMood, setShopkeeperMood] = useState('neutral');
  const [shopkeeperBusy, setShopkeeperBusy] = useState(false);
  const [customerVisible, setCustomerVisible] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const closeInstructions = useCallback(() => setShowInstructions(false), []);

  useEffect(() => {
    if (!showInstructions) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') closeInstructions(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInstructions, closeInstructions]);

  const timerRef = useRef(null);
  const peekTimerRef = useRef(null);
  const scoreRef = useRef(0);
  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);
  scoreRef.current = score;
  correctCountRef.current = correctCount;
  wrongCountRef.current = wrongCount;

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
          const map = { easy: 'Easy', moderate: 'Moderate', hard: 'Hard' };
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
    if (gameState !== 'playing') return;
    if (phase !== 'peek' && phase !== 'serve') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { 
        if (t <= 1) { 
          clearInterval(timerRef.current); 
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty,
            timeElapsed: TIME_LIMIT,
            correctCount: correctCountRef.current,
            wrongCount: wrongCountRef.current,
          });
          setGameState('finished');
          sfx('lose'); 
          return 0; 
        } 
        return t - 1; 
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, phase, difficulty]);

  const generateOrder = useCallback((lvl) => {
    const pool = ITEMS.slice(0, lvl.itemPool);
    const used = new Set(); const o = [];
    for (let i = 0; i < lvl.orderSize; i++) {
      let idx; do { idx = Math.floor(Math.random() * pool.length); } while (used.has(idx));
      used.add(idx); o.push({ item: pool[idx], qty: Math.floor(Math.random() * lvl.maxQty) + 1 });
    }
    return o;
  }, []);

  const handleStart = useCallback(() => {
    const lvl = LEVELS[difficulty];
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(TIME_LIMIT);
    setCombo(0);
    setRound(0);
    setAvailableItems(ITEMS.slice(0, lvl.itemPool));
    setGameState('playing');
    startRound(lvl, 0);
    sfx('bell');
  }, [difficulty]);

  const handleReset = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(peekTimerRef.current);
    setGameState('ready');
    setPhase('peek');
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(TIME_LIMIT);
    setRound(0);
    setCombo(0);
    setCompletionData(null);
  }, []);

  const startRound = (lvl, rnd) => {
    const o = generateOrder(lvl);
    const c = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    setCustomer(c); setOrder(o); setServed([]); setCurrentSelect(null); setCurrentQty(1);
    setRoundFeedback(null); setCustomerMood('neutral'); setShopkeeperMood('neutral');
    setShopkeeperBusy(false); setBubbleVisible(false); setCustomerVisible(false);
    setPeekProgress(100);

    setTimeout(() => { setCustomerVisible(true); sfx('footstep'); }, 200);
    setTimeout(() => { setBubbleVisible(true); setPhase('peek'); sfx('peek'); }, 800);

    const startT = Date.now() + 800;
    const dur = lvl.peekTime;
    clearInterval(peekTimerRef.current);
    peekTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startT;
      if (elapsed < 0) return;
      const pct = Math.max(0, 100 - (elapsed / dur) * 100);
      setPeekProgress(pct);
      if (elapsed >= dur) {
        clearInterval(peekTimerRef.current);
        setBubbleVisible(false);
        setShopkeeperMood('thinking');
        setShopkeeperBusy(true);
        setTimeout(() => { setPhase('serve'); sfx('bell'); }, 400);
      }
    }, 30);
  };

  const addToServed = () => {
    if (!currentSelect) return;
    sfx('select'); setShopkeeperBusy(true);
    setTimeout(() => setShopkeeperBusy(false), 300);
    setServed(prev => [...prev, { item: currentSelect, qty: currentQty }]);
    setCurrentSelect(null); setCurrentQty(1);
  };

  const submitOrder = () => {
    let correct = 0;
    for (let i = 0; i < order.length; i++) {
      if (served[i] && served[i].item.name === order[i].item.name && served[i].qty === order[i].qty) correct++;
    }
    const allCorrect = correct === order.length && served.length === order.length;
    const lvl = LEVELS[difficulty]; 
    const perRound = MAX_SCORE / lvl.totalRounds;

    setShopkeeperMood('serving'); setShopkeeperBusy(false);
    if (allCorrect) {
      const newCombo = combo + 1; setCombo(newCombo);
      const bonus = Math.min(perRound, perRound * (0.7 + newCombo * 0.1));
      setScore(s => Math.min(MAX_SCORE, Math.round(s + bonus)));
      setRoundFeedback({ success: true, correct, total: order.length });
      setCustomerMood('happy'); 
      setCorrectCount(c => c + 1);
      sfx('correct');
    } else {
      setCombo(0);
      const partial = perRound * (correct / order.length) * 0.5;
      setScore(s => Math.min(MAX_SCORE, Math.round(s + partial)));
      setRoundFeedback({ success: false, correct, total: order.length });
      setCustomerMood('sad'); 
      setWrongCount(c => c + 1);
      sfx('wrong');
    }
    setBubbleVisible(true);
    setPhase('roundResult');
  };

  const continueGame = () => {
    const lvl = LEVELS[difficulty]; 
    const nextRound = round + 1;
    if (nextRound >= lvl.totalRounds || score >= MAX_SCORE) {
      setCompletionData({
        score,
        isVictory: true,
        difficulty,
        timeElapsed: TIME_LIMIT - timeLeft,
        correctCount,
        wrongCount,
      });
      setGameState('finished'); 
      sfx('win'); 
    }
    else { 
      setRound(nextRound); 
      startRound(lvl, nextRound); 
    }
  };

  const removeServed = (idx) => { setServed(prev => prev.filter((_, i) => i !== idx)); sfx('select'); };
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const btn = (bg = '#e94560') => ({
    padding: '12px 28px', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700,
    color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
    background: `linear-gradient(135deg, ${bg}, ${bg}dd)`,
    boxShadow: `0 4px 15px rgba(0,0,0,0.3)`,
  });

  const glass = {
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
    borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '16px',
  };

  // Determine character images
  const getCustomerImage = () => {
    if (customerMood === 'happy') return happyCustomer;
    if (customerMood === 'sad') return angryCustomer;
    return happyCustomer;
  };

  const getShopkeeperImage = () => {
    if (shopkeeperMood === 'thinking') return confusedShopkeeper;
    if (phase === 'serve') return confusedShopkeeper;
    if (roundFeedback && !roundFeedback.success) return confusedShopkeeper;
    return happyShopkeeper;
  };

  const lvl = LEVELS[difficulty];
  const accuracy = correctCount + wrongCount > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
    : 0;

  // Check if game should end due to max score
  useEffect(() => {
    if (gameState === 'playing' && score >= MAX_SCORE) {
      setCompletionData({
        score,
        isVictory: true,
        difficulty,
        timeElapsed: TIME_LIMIT - timeLeft,
        correctCount,
        wrongCount,
      });
      setGameState('finished');
      sfx('win');
    }
  }, [gameState, score, difficulty, timeLeft]);

  const instructionsModalContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section style={{ background: 'rgba(116,185,255,0.1)', border: '1px solid rgba(116,185,255,0.3)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#74b9ff' }}>🎯 Objective</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#cbd5e1' }}>Memorize customer orders and serve them correctly from your shop inventory before time runs out. Reach 200 points to win!</p>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>🎮 How to Play</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li>The customer shows their order in a speech bubble during <strong>peek time</strong> (watch the timer).</li>
          <li>Memorize each item and quantity. When peek ends, the order hides.</li>
          <li>Select items from the <strong>inventory shelf</strong>, set quantity with +/−, then <strong>Add to Tray</strong>.</li>
          <li>When your tray matches the order, tap <strong>Serve to Customer</strong>. Perfect order = full points!</li>
        </ul>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>📊 Scoring</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li>Perfect orders earn full points; partial credit when some items are correct.</li>
          <li>Build a <strong>combo</strong> (consecutive correct orders) for a score multiplier.</li>
          <li>Wrong or incomplete orders break the combo. Reach 200 points to win!</li>
        </ul>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>💡 Strategy</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li>Focus during peek time — remember both <strong>item and quantity</strong>.</li>
          <li>Higher difficulty = bigger orders, shorter peek time, and less time per round.</li>
        </ul>
      </section>
    </div>
  );

  const playingContent = (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes characterBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shopkeeperBusy { 0%,100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(-3px) rotate(-2deg); } 75% { transform: translateX(3px) rotate(2deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
      `}</style>
      
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <BazaarCanvas />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderBottom: `3px solid ${lvl.accent}50` }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: lvl.accent }}>{lvl.name}</span>
              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Round {round + 1}/{lvl.totalRounds}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {combo > 1 && <span style={{ color: '#f39c12', fontWeight: 800, fontSize: '0.9rem', animation: 'pulse 0.6s ease-in-out infinite' }}>🔥x{combo}</span>}
              <span style={{ color: '#f1c40f', fontWeight: 800, fontSize: '1rem' }}>⭐{score}</span>
              <span style={{ color: timeLeft < 30 ? '#e74c3c' : 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.95rem' }}>⏱{fmt(timeLeft)}</span>
            </div>
          </div>

          {/* CENTERED GAME AREA */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

              {/* SCENE: Shop + Characters */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 0' }}>
                {/* Shop backdrop */}
                <div style={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto' }}>
                  <img src={freshMarketShop} alt="Market Shop" style={{
                    width: '100%', height: 'auto', maxHeight: 200, objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))',
                  }} />

                  {/* Characters overlaid on shop */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    padding: '0 10px',
                  }}>
                    {/* Customer side */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: customerVisible ? 'translateX(0) scale(1)' : 'translateX(-80px) scale(0.6)',
                      opacity: customerVisible ? 1 : 0,
                    }}>
                      <img src={getCustomerImage()} alt="Customer" style={{
                        height: 'clamp(130px, 15vw, 200px)', width: 'auto', objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                        transition: 'all 0.3s ease',
                        animation: phase === 'peek' ? 'characterBounce 1.5s ease-in-out infinite' : 'none',
                      }} />
                      <div style={{
                        padding: '3px 10px', borderRadius: 8,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                        color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                      }}>{customer.name}</div>
                    </div>

                    {/* Shopkeeper side */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
                      <img src={getShopkeeperImage()} alt="Shopkeeper" style={{
                        height: 'clamp(130px, 15vw, 200px)', width: 'auto', objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                        transition: 'all 0.3s ease',
                        animation: shopkeeperBusy ? 'shopkeeperBusy 0.4s ease-in-out infinite' : 'none',
                      }} />
                      <div style={{
                        padding: '3px 10px', borderRadius: 8,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                        color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                      }}>Shopkeeper</div>
                    </div>
                  </div>
                </div>

                {/* Speech bubbles row — below the shop image */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 500, marginTop: 10, padding: '0 10px' }}>
                  {/* Customer bubble */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    {phase === 'peek' && (
                      <SpeechBubble direction="right" visible={bubbleVisible}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', marginBottom: 6 }}>I need:</div>
                        {order.map((o, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                            <span style={{ fontSize: 18 }}>{o.item.emoji}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>{o.item.name}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: o.item.color, marginLeft: 'auto' }}>×{o.qty}</span>
                          </div>
                        ))}
                        <div style={{ width: '100%', height: 5, borderRadius: 3, background: '#eee', marginTop: 8 }}>
                          <div style={{ width: `${peekProgress}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${lvl.accent}, #f39c12)`, transition: 'width 0.05s linear' }} />
                        </div>
                      </SpeechBubble>
                    )}
                    {phase === 'roundResult' && (
                      <SpeechBubble direction="right" visible={bubbleVisible}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 32 }}>{roundFeedback?.success ? '😄' : '😞'}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: roundFeedback?.success ? '#27ae60' : '#e74c3c', marginTop: 4 }}>
                            {roundFeedback?.success ? 'Perfect! Thank you!' : 'That\'s not right...'}
                          </div>
                        </div>
                      </SpeechBubble>
                    )}
                  </div>

                  {/* Shopkeeper bubble */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {phase === 'serve' && (
                      <SpeechBubble direction="left" visible={true}>
                        <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                          🤔 Let me find those items...
                        </div>
                      </SpeechBubble>
                    )}
                    {phase === 'roundResult' && (
                      <SpeechBubble direction="left" visible={true}>
                        <div style={{ fontSize: '0.8rem', color: '#555', textAlign: 'center' }}>
                          {roundFeedback?.success ? '😊 Happy to help!' : '😅 Sorry about that!'}
                        </div>
                      </SpeechBubble>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM PANEL */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0 16px' }}>
                {/* Waiting message during peek */}
                {phase === 'peek' && (
                  <div style={{ ...glass, textAlign: 'center', animation: 'fadeIn 0.3s' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>
                      🧏 Listen carefully to the customer's order...
                    </p>
                  </div>
                )}

                {/* SERVE PHASE */}
                {phase === 'serve' && (
                  <>
                    <ServingTray served={served} onRemove={removeServed} />
                    <InventoryShelf items={availableItems} onSelect={setCurrentSelect} selectedItem={currentSelect} />
                    {currentSelect && (
                      <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 24 }}>{currentSelect.emoji}</span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{currentSelect.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => setCurrentQty(q => Math.max(1, q - 1))} style={{ ...btn('rgba(255,255,255,0.15)'), padding: '6px 14px', fontSize: '1.1rem' }}>−</button>
                          <span style={{ color: currentSelect.color, fontWeight: 800, fontSize: '1.3rem', minWidth: 28, textAlign: 'center' }}>{currentQty}</span>
                          <button onClick={() => setCurrentQty(q => Math.min(lvl.maxQty, q + 1))} style={{ ...btn('rgba(255,255,255,0.15)'), padding: '6px 14px', fontSize: '1.1rem' }}>+</button>
                        </div>
                        <button onClick={addToServed} style={{ ...btn(lvl.accent), padding: '8px 18px' }}>Add to Tray</button>
                      </div>
                    )}
                    {served.length === order.length && (
                      <button onClick={submitOrder} style={{
                        ...btn('#27ae60'), width: '100%', padding: '14px', fontSize: '1.1rem',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}>
                        🍽️ Serve to Customer
                      </button>
                    )}
                  </>
                )}

                {/* ROUND RESULT */}
                {phase === 'roundResult' && roundFeedback && (
                  <div style={{ ...glass, textAlign: 'center', animation: 'fadeIn 0.3s' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', fontSize: '0.85rem' }}>
                      {roundFeedback.correct}/{roundFeedback.total} items correct
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '10px 0' }}>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>Correct order:</span>
                      {order.map((o, i) => {
                        const ok = served[i] && served[i].item.name === o.item.name && served[i].qty === o.qty;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: '0.9rem', color: '#fff' }}>
                            {o.item.emoji} {o.item.name} ×{o.qty}
                            <span style={{ color: ok ? '#27ae60' : '#e74c3c', fontWeight: 700 }}>{ok ? '✓' : '✗'}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ color: '#f1c40f', fontWeight: 700, fontSize: '1.1rem' }}>Score: {score}/{MAX_SCORE}</p>
                    <button onClick={continueGame} style={{ ...btn(lvl.accent), marginTop: 10 }}>
                      {round + 1 >= lvl.totalRounds ? '🏆 See Results' : '→ Next Customer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Menu when ready
  if (gameState === 'ready') {
    if (checkingDailyGame) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0a2e, #1a1a4e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div>Loading...</div>
        </div>
      );
    }
    const difficulties = [
      { key: 'Easy', label: 'Easy', desc: 'Fewer items, more time', emoji: '🟢', color: '#00b894' },
      { key: 'Moderate', label: 'Moderate', desc: 'Medium challenge', emoji: '🟡', color: '#f39c12' },
      { key: 'Hard', label: 'Hard', desc: 'More items, less time', emoji: '🔴', color: '#e74c3c' },
    ];
    const availableDifficulties = isDailyGame && dailyGameDifficulty ? difficulties.filter(d => d.key === dailyGameDifficulty) : difficulties;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0d0d35 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          aria-label="How to Play"
          style={{
            position: 'absolute', top: 16, right: 16,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 12,
            border: '2px solid rgba(116,185,255,0.6)', background: 'rgba(116,185,255,0.15)',
            color: '#74b9ff', cursor: 'pointer', fontSize: 15, fontWeight: 700,
            transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(116,185,255,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(116,185,255,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(116,185,255,0.15)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          <span style={{ fontSize: 18 }} aria-hidden>📖</span>
          How to Play
        </button>
        {showInstructions && (
          <div role="dialog" aria-modal="true" aria-labelledby="market-rush-instructions-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }} onClick={closeInstructions}>
            <div style={{ background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)', border: '2px solid rgba(116,185,255,0.5)', borderRadius: 20, padding: 0, maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <h2 id="market-rush-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#74b9ff' }}>🏪 Market Rush – How to Play</h2>
                <button type="button" onClick={closeInstructions} aria-label="Close" style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{instructionsModalContent}</div>
              <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                <button type="button" onClick={closeInstructions} style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #74b9ff, #0984e3)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(116,185,255,0.4)' }}>Got it</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
        <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 800, margin: '0 0 6px', letterSpacing: -1, textShadow: '0 0 40px rgba(116,185,255,0.4)' }}>Market Rush</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 8px' }}>Memorize customer orders and serve them correctly!</p>
        {isDailyGame && (
          <div style={{ marginBottom: 20, padding: '6px 16px', background: 'rgba(116,185,255,0.2)', border: '1px solid rgba(116,185,255,0.5)', borderRadius: 20, fontSize: 13, color: '#74b9ff', fontWeight: 600 }}>
            Daily Challenge
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {availableDifficulties.map(d => (
            <button
              key={d.key}
              onClick={() => !isDailyGame && setDifficulty(d.key)}
              style={{
                background: (isDailyGame ? d.key === dailyGameDifficulty : difficulty === d.key) ? `${d.color}22` : 'rgba(255,255,255,0.06)',
                border: `2px solid ${d.color}44`,
                borderRadius: 16,
                padding: '24px 32px',
                cursor: isDailyGame ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                minWidth: 160,
                transition: 'all 0.2s',
                color: '#fff'
              }}
              onMouseEnter={e => { if (!isDailyGame) { e.currentTarget.style.background = `${d.color}22`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${d.color}88`; } }}
              onMouseLeave={e => { e.currentTarget.style.background = (isDailyGame ? d.key === dailyGameDifficulty : difficulty === d.key) ? `${d.color}22` : 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${d.color}44`; }}
            >
              <span style={{ fontSize: 32 }}>{d.emoji}</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{d.label}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>{d.desc}</span>
            </button>
          ))}
        </div>
        {isDailyGame ? (
          <button onClick={() => handleStart()} style={{ marginTop: 20, padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #74b9ff, #0984e3)', color: '#fff', boxShadow: '0 4px 20px rgba(116,185,255,0.4)' }}>
            Start Game
          </button>
        ) : (
          <button onClick={() => handleStart()} style={{ marginTop: 20, padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #74b9ff, #0984e3)', color: '#fff', boxShadow: '0 4px 20px rgba(116,185,255,0.4)' }}>
            Start Game
          </button>
        )}
      </div>
    );
  }

  // Playing or finished: game layer with zIndex 1
  const timeElapsedForModal = completionData?.timeElapsed ?? (gameState === 'finished' ? TIME_LIMIT : TIME_LIMIT - timeLeft);
  const c = completionData || {};
  const statsStr = [c.correctCount != null && c.wrongCount != null && `Correct: ${c.correctCount} · Wrong: ${c.wrongCount}`].filter(Boolean).join(' ');

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        {playingContent}
        {gameState === 'playing' && (
          <button onClick={handleReset} style={{ position: 'absolute', top: 12, left: 12, padding: '8px 16px', borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Menu
          </button>
        )}
      </div>
      {gameState === 'finished' && completionData != null && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Market Rush"
          score={c.score}
          timeElapsed={timeElapsedForModal}
          gameTimeLimit={TIME_LIMIT}
          isVictory={c.isVictory}
          difficulty={c.difficulty}
          customMessages={{ maxScore: MAX_SCORE, stats: statsStr }}
        />
      )}
    </>
  );
}
