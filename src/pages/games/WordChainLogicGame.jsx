import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

const TIME_LIMIT = 120;
const MAX_SCORE = 200;

const LEVELS = {
  easy: { label: 'Easy', chainLen: 4, totalChains: 5, poolSize: 6, hint: true },
  moderate: { label: 'Moderate', chainLen: 5, totalChains: 6, poolSize: 7, hint: false },
  hard: { label: 'Hard', chainLen: 6, totalChains: 7, poolSize: 8, hint: false },
};

const CHAIN_SETS = [
  { chain: ['Sun', 'Light', 'House', 'Hold', 'Fast', 'Track', 'Field', 'Work'], category: 'Compound words' },
  { chain: ['Fire', 'Fly', 'Wheel', 'Chair', 'Man', 'Kind', 'Heart', 'Beat'], category: 'Compound words' },
  { chain: ['Rain', 'Bow', 'Tie', 'Break', 'Down', 'Fall', 'Back', 'Bone'], category: 'Compound words' },
  { chain: ['Star', 'Fish', 'Pond', 'Water', 'Fall', 'Out', 'Side', 'Walk'], category: 'Compound words' },
  { chain: ['Snow', 'Ball', 'Room', 'Mate', 'Ship', 'Yard', 'Stick', 'Figure'], category: 'Compound words' },
  { chain: ['Book', 'Mark', 'Down', 'Town', 'Ship', 'Wreck', 'Ball', 'Game'], category: 'Compound words' },
  { chain: ['Head', 'Band', 'Stand', 'Point', 'Guard', 'Rail', 'Road', 'Block'], category: 'Compound words' },
  { chain: ['Day', 'Dream', 'Land', 'Lord', 'Ship', 'Board', 'Walk', 'Way'], category: 'Compound words' },
  { chain: ['Hand', 'Shake', 'Down', 'Hill', 'Top', 'Coat', 'Rack', 'Ball'], category: 'Compound words' },
  { chain: ['Back', 'Pack', 'Horse', 'Power', 'House', 'Boat', 'Yard', 'Sale'], category: 'Compound words' },
  { chain: ['Moon', 'Light', 'Bulb', 'Frog', 'Leap', 'Year', 'Book', 'Shelf'], category: 'Associations' },
  { chain: ['Key', 'Board', 'Game', 'Plan', 'Net', 'Work', 'Shop', 'Lift'], category: 'Associations' },
  { chain: ['Ice', 'Cream', 'Cake', 'Walk', 'Side', 'Line', 'Back', 'Door'], category: 'Compound words' },
  { chain: ['Gold', 'Mine', 'Craft', 'Work', 'Bench', 'Press', 'Box', 'Car'], category: 'Compound words' },
  { chain: ['Eye', 'Lid', 'Open', 'Air', 'Port', 'Hole', 'Punch', 'Line'], category: 'Compound words' },
  { chain: ['Foot', 'Ball', 'Park', 'Bench', 'Mark', 'Time', 'Line', 'Up'], category: 'Compound words' },
  { chain: ['Blue', 'Bird', 'Song', 'Book', 'Case', 'Load', 'Star', 'Dust'], category: 'Associations' },
  { chain: ['Wind', 'Mill', 'Stone', 'Wall', 'Paper', 'Clip', 'Board', 'Room'], category: 'Compound words' },
  { chain: ['Sea', 'Shell', 'Fish', 'Bowl', 'Game', 'Over', 'Time', 'Table'], category: 'Compound words' },
  { chain: ['Tree', 'House', 'Top', 'Soil', 'Pipe', 'Line', 'Dance', 'Floor'], category: 'Associations' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickChains(count, chainLen) {
  const shuffled = shuffle(CHAIN_SETS);
  const picked = [];
  for (const set of shuffled) {
    if (set.chain.length >= chainLen && picked.length < count) {
      picked.push({ ...set, chain: set.chain.slice(0, chainLen) });
    }
  }
  while (picked.length < count) {
    const base = CHAIN_SETS[picked.length % CHAIN_SETS.length];
    picked.push({ ...base, chain: base.chain.slice(0, chainLen) });
  }
  return picked;
}

function generateDistracters(chain, poolSize) {
  const extras = ['Top', 'Run', 'Fly', 'Box', 'Cup', 'Pen', 'Ink', 'Fog', 'Bay', 'Oak', 'Elm', 'Dew', 'Gem', 'Web', 'Rug', 'Jar', 'Pin', 'Hub', 'Tap', 'Vet'];
  const used = new Set(chain.map(w => w.toLowerCase()));
  const distractors = shuffle(extras.filter(w => !used.has(w.toLowerCase()))).slice(0, poolSize - chain.length);
  return shuffle([...chain, ...distractors]);
}

export default function WordChainLogic({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [chains, setChains] = useState([]);
  const [chainIdx, setChainIdx] = useState(0);
  const [pool, setPool] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(TIME_LIMIT);
  const [combo, setCombo] = useState(0);
  const [errors, setErrors] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [shakeWord, setShakeWord] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const timerRef = useRef(null);
  const audioCtx = useRef(null);
  const phaseRef = useRef(phase);
  const scoreRef = useRef(0);
  const timeRef = useRef(TIME_LIMIT);
  const location = useLocation();
  phaseRef.current = phase;
  scoreRef.current = score;
  timeRef.current = time;

  const cfg = level ? LEVELS[level] : null;

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

  const getAudio = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const playTone = useCallback((freq, dur, type = 'sine') => {
    try {
      const ctx = getAudio();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = 0.1;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g).connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch {}
  }, [getAudio]);

  const playPick = useCallback(() => playTone(440 + Math.random() * 200, 0.08), [playTone]);
  const playCorrect = useCallback(() => { playTone(523, 0.08); setTimeout(() => playTone(659, 0.08), 60); setTimeout(() => playTone(784, 0.12), 120); }, [playTone]);
  const playWrong = useCallback(() => playTone(180, 0.3, 'sawtooth'), [playTone]);
  const playWin = useCallback(() => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.18), i * 100)); }, [playTone]);

  const setupChain = useCallback((allChains, idx, poolSizeOverride) => {
    const c = allChains[idx];
    if (!c) return;
    const poolSize = poolSizeOverride ?? (level ? LEVELS[level].poolSize : 6);
    setPool(generateDistracters(c.chain, poolSize));
    setSelected([]);
    setFeedback(null);
    setShowHint(false);
    setShakeWord(null);
  }, [level]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCompletionData(null);
    setPhase('menu');
  }, []);

  const startGame = useCallback((lv) => {
    const c = LEVELS[lv];
    if (!c) return;
    setCompletionData(null);
    setLevel(lv);
    const picked = pickChains(c.totalChains, c.chainLen);
    setChains(picked);
    setChainIdx(0);
    setScore(0);
    setTime(TIME_LIMIT);
    setCombo(0);
    setErrors(0);
    setCompleted(0);
    setPhase('playing');
    setupChain(picked, 0, c.poolSize);
  }, [setupChain]);

  const endGame = useCallback((finalScore, isVictory = false) => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    if (isVictory || finalScore >= MAX_SCORE * 0.7) playWin();
    setCompletionData({
      score: finalScore,
      isVictory: isVictory || finalScore >= MAX_SCORE * 0.7,
      difficulty: level,
      timeElapsed: TIME_LIMIT - timeRef.current,
    });
    setPhase('gameover');
  }, [playWin, level]);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase('gameover');
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty: level,
            timeElapsed: TIME_LIMIT,
          });
          return 0;
        }
        if (prev === 11) playTone(880, 0.1);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, level, playTone]);

  const handleWordPick = useCallback((word) => {
    if (phase !== 'playing' || feedback) return;
    const chain = chains[chainIdx].chain;
    const nextIdx = selected.length;

    if (chain[nextIdx] === word) {
      const newSelected = [...selected, word];
      setSelected(newSelected);
      playPick();

      if (newSelected.length === chain.length) {
        const newCompleted = completed + 1;
        const newCombo = combo + 1;
        const basePoints = MAX_SCORE / cfg.totalChains;
        const comboBonus = Math.min(newCombo - 1, 3) * (basePoints * 0.1);
        let newScore = Math.min(score + basePoints + comboBonus, MAX_SCORE);
        if (newCompleted === cfg.totalChains && newScore > MAX_SCORE * 0.5) newScore = MAX_SCORE;
        newScore = Math.round(newScore * 10) / 10;

        setScore(newScore);
        setCombo(newCombo);
        setCompleted(newCompleted);
        setFeedback({ type: 'chainComplete' });
        playCorrect();

        setTimeout(() => {
          if (newCompleted >= cfg.totalChains) {
            endGame(newScore, true);
          } else {
            const nextChainIdx = chainIdx + 1;
            setChainIdx(nextChainIdx);
            setupChain(chains, nextChainIdx);
          }
        }, 1000);
      }
    } else {
      setErrors(e => e + 1);
      setCombo(0);
      setShakeWord(word);
      setFeedback({ type: 'wrong' });
      playWrong();
      setTimeout(() => { setShakeWord(null); setFeedback(null); }, 500);
    }
  }, [phase, feedback, chains, chainIdx, selected, completed, combo, score, cfg, playPick, playCorrect, playWrong, endGame, setupChain]);

  const handleUndo = useCallback(() => {
    if (selected.length > 0 && !feedback) {
      setSelected(prev => prev.slice(0, -1));
    }
  }, [selected, feedback]);

  const pct = (time / TIME_LIMIT) * 100;
  const low = time <= 15;
  const progress = cfg ? (completed / cfg.totalChains) * 100 : 0;
  const currentChain = chains[chainIdx];

  const styles = `
    @keyframes wcl-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
    @keyframes wcl-pop{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
    @keyframes wcl-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes wcl-chain-done{0%{transform:scale(0.9);opacity:0}50%{transform:scale(1.05);opacity:1}100%{transform:scale(1);opacity:1}}
  `;

  const levelEntries = isDailyGame && dailyGameDifficulty
    ? [[dailyGameDifficulty, LEVELS[dailyGameDifficulty]]].filter(([, c]) => c)
    : Object.entries(LEVELS);
  const selectedLevel = isDailyGame ? dailyGameDifficulty : level;

  const tHowToPlay = useTranslateText('How to Play');
  const tGotIt = useTranslateText('Got it');
  const tDailyChallenge = useTranslateText('Daily Challenge');
  const tStartGame = useTranslateText('Start Game');
  const tGameTitle = useTranslateText('Word Chain Logic');
  const tHowToPlayTitle = useTranslateText('Word Chain Logic – How to Play');
  const tSubtitle = useTranslateText('Build word chains by picking words in the correct order. Each word connects to the next!');
  const tLevelLabels = { easy: useTranslateText('Easy'), moderate: useTranslateText('Moderate'), hard: useTranslateText('Hard') };
  const tWordChainBullet1 = useTranslateText('Build word chains by picking words in the correct order. Each word connects to the next to form compound words or associations (e.g. Sun → Light → House).');
  const tWordChainBullet2 = useTranslateText("You'll see empty slots for the current chain. Tap a word from the pool to place it in the next slot. Use Undo to remove the last pick.");
  const tWordChainBullet3 = useTranslateText("On Easy, a Hint button shows the next word's first letter and length. Wrong picks reset your combo and add to errors.");
  const tWordChainBullet4 = useTranslateText('Complete all chains before time runs out. You have 2 minutes and can score up to 200 points. Consecutive chains build a combo for bonus points.');

  const instructionsContent = (
    <>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>{tHowToPlay}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>{tWordChainBullet1}</li>
        <li>{tWordChainBullet2}</li>
        <li>{tWordChainBullet3}</li>
        <li>{tWordChainBullet4}</li>
      </ul>
    </>
  );

  const wrapperStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px' };

  return (
    <div style={wrapperStyle}>
      <style>{styles}</style>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 560, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={phase === 'menu' ? (onBack ? () => onBack() : () => window.history.back()) : handleReset}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}
        >
          {phase === 'menu' ? '←' : '✕'}
        </button>
        <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 'clamp(1rem,4vw,1.3rem)' }}>🔗 {tGameTitle}</div>
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
            ❓ {tHowToPlay}
          </button>
        ) : (
          <div style={{ color: low ? '#ef4444' : '#94a3b8', fontWeight: 700, fontSize: 'clamp(0.85rem,3vw,1.1rem)', animation: low ? 'wcl-pulse 1s infinite' : undefined }}>
            ⏱ {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {phase === 'menu' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {showInstructions && (
            <div
              role="dialog"
              aria-modal="true"
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}
              onClick={() => setShowInstructions(false)}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)',
                  border: '2px solid rgba(99,102,241,0.45)', borderRadius: 20, padding: 0,
                  maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#818cf8' }}>🔗 {tHowToPlayTitle}</h2>
                  <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close"
                    style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>{instructionsContent}</div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <button type="button" onClick={() => setShowInstructions(false)}
                    style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>{tGotIt}</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ background: '#1e293b', borderRadius: 20, padding: '32px 24px', maxWidth: 420, width: '100%', textAlign: 'center', border: '2px solid #334155' }}>
            {isDailyGame && (
              <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>📅 {tDailyChallenge}</div>
            )}
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔗</div>
            <h1 style={{ color: '#f1f5f9', fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 800, margin: '0 0 8px' }}>{tGameTitle}</h1>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(0.8rem,3vw,0.95rem)', margin: '0 0 24px', lineHeight: 1.5 }}>
              {tSubtitle}
            </p>
            {!checkingDailyGame && levelEntries.map(([key, val]) => (
              <button
                key={key}
                onClick={() => !isDailyGame && setLevel(key)}
                style={{
                  width: '100%', padding: '14px 20px', marginBottom: 10, borderRadius: 12, border: selectedLevel === key ? '3px solid rgba(255,255,255,0.5)' : 'none',
                  fontSize: 'clamp(0.9rem,3vw,1.05rem)', fontWeight: 700, cursor: isDailyGame ? 'default' : 'pointer',
                  background: key === 'easy' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : key === 'moderate' ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#fff', transition: 'transform 0.15s', opacity: selectedLevel === key ? 1 : 0.85,
                }}
                onMouseEnter={e => !isDailyGame && (e.target.style.transform = 'scale(1.03)')}
                onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
              >
                {tLevelLabels[key]} — {val.totalChains} chains of {val.chainLen}
              </button>
            ))}
            <button
              disabled={!selectedLevel || checkingDailyGame}
              onClick={() => startGame(selectedLevel)}
              style={{
                width: '100%', marginTop: 8, padding: '14px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontSize: 'clamp(0.9rem,3vw,1.05rem)', fontWeight: 700, cursor: (!selectedLevel || checkingDailyGame) ? 'not-allowed' : 'pointer', opacity: (!selectedLevel || checkingDailyGame) ? 0.6 : 1,
              }}
            >
              {tStartGame}
            </button>
            <div style={{ marginTop: 20, color: '#64748b', fontSize: 'clamp(0.7rem,2.5vw,0.8rem)' }}>⏱ 2 min · 🏆 200 pts max</div>
          </div>
        </div>
      )}

      {(phase === 'playing' || phase === 'gameover') && (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pointerEvents: phase === 'gameover' ? 'none' : 'auto' }}>
      {/* Timer bar */}
      <div style={{ width: '100%', maxWidth: 560, height: 6, background: '#334155', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: low ? '#ef4444' : '#3b82f6', borderRadius: 3, transition: 'width 1s linear' }} />
      </div>

      {/* Score row */}
      <div style={{ width: '100%', maxWidth: 560, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 'clamp(0.85rem,3vw,1rem)' }}>
          🏆 {Math.round(score)}/{MAX_SCORE}
          {combo > 1 && <span style={{ color: '#f59e0b', marginLeft: 6 }}>🔥{combo}x</span>}
        </div>
        <div style={{ color: '#64748b', fontSize: 'clamp(0.7rem,2.5vw,0.85rem)' }}>
          Chain {chainIdx + 1}/{cfg?.totalChains ?? 0}
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 560, height: 4, background: '#334155', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#22c55e', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Chain complete overlay */}
      {feedback?.type === 'chainComplete' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', border: '3px solid #22c55e', borderRadius: 16, padding: '24px 32px', textAlign: 'center', animation: 'wcl-chain-done 0.5s forwards' }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>✅</div>
            <div style={{ color: '#22c55e', fontWeight: 800, fontSize: 'clamp(1.1rem,4vw,1.4rem)' }}>Chain Complete!</div>
            <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem,2.5vw,0.85rem)', marginTop: 4 }}>
              {currentChain?.chain.join(' → ')}
            </div>
          </div>
        </div>
      )}

      {/* Chain slots */}
      <div style={{ color: '#64748b', fontSize: 'clamp(0.7rem,2.5vw,0.8rem)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
        Build the chain ({currentChain?.category})
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
        width: '100%', maxWidth: 560, marginBottom: 16, minHeight: 44,
      }}>
        {currentChain?.chain.map((_, i) => {
          const word = selected[i];
          const isNext = i === selected.length;
          return (
            <div key={i} style={{
              minWidth: 'clamp(50px,14vw,80px)',
              height: 'clamp(36px,8vw,44px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: word ? '#0f4c2a' : isNext ? '#1e3a5f' : '#0f172a',
              border: word ? '2px solid #22c55e' : isNext ? '2px dashed #3b82f6' : '2px dashed #334155',
              borderRadius: 10,
              color: word ? '#86efac' : isNext ? '#60a5fa' : '#475569',
              fontWeight: 700,
              fontSize: 'clamp(0.75rem,2.8vw,0.95rem)',
              padding: '0 8px',
              transition: 'all 0.2s',
              animation: word && i === selected.length - 1 ? 'wcl-pop 0.3s' : undefined,
            }}>
              {word || (isNext ? '?' : (i + 1))}
            </div>
          );
        })}
      </div>

      {/* Connectors */}
      {selected.length >= 2 && (
        <div style={{ color: '#475569', fontSize: 'clamp(0.65rem,2vw,0.75rem)', marginBottom: 10, textAlign: 'center' }}>
          {selected.map((w, i) => (
            <span key={i}>{i > 0 && <span style={{ color: '#334155' }}> → </span>}<span style={{ color: '#86efac' }}>{w}</span></span>
          ))}
        </div>
      )}

      {/* Word pool */}
      <div style={{ color: '#64748b', fontSize: 'clamp(0.7rem,2.5vw,0.8rem)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
        Pick the next word
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 'clamp(6px,2vw,10px)', justifyContent: 'center',
        width: '100%', maxWidth: 560, marginBottom: 12,
      }}>
        {pool.map((word) => {
          const used = selected.includes(word);
          const isShake = shakeWord === word;
          return (
            <button key={word} onClick={() => !used && handleWordPick(word)} disabled={used}
              style={{
                padding: 'clamp(8px,2vw,12px) clamp(14px,3vw,20px)',
                borderRadius: 10,
                border: used ? '2px solid #1e3a2a' : '2px solid #475569',
                background: used ? '#0f172a' : '#1e293b',
                color: used ? '#334155' : '#e2e8f0',
                fontWeight: 700,
                fontSize: 'clamp(0.85rem,3vw,1.05rem)',
                cursor: used ? 'default' : 'pointer',
                transition: 'all 0.15s',
                opacity: used ? 0.3 : 1,
                animation: isShake ? 'wcl-shake 0.4s' : undefined,
                textDecoration: used ? 'line-through' : 'none',
              }}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <button onClick={handleUndo} disabled={selected.length === 0 || !!feedback}
          style={{
            padding: '8px 18px', borderRadius: 8, border: '2px solid #475569',
            background: 'transparent', color: selected.length > 0 && !feedback ? '#94a3b8' : '#334155',
            fontWeight: 700, fontSize: 'clamp(0.8rem,2.5vw,0.9rem)', cursor: selected.length > 0 ? 'pointer' : 'default',
          }}>
          ↩ Undo
        </button>
        {cfg.hint && (
          <button onClick={() => setShowHint(true)} disabled={showHint}
            style={{
              padding: '8px 18px', borderRadius: 8, border: '2px solid #f59e0b44',
              background: 'transparent', color: showHint ? '#334155' : '#f59e0b',
              fontWeight: 700, fontSize: 'clamp(0.8rem,2.5vw,0.9rem)', cursor: showHint ? 'default' : 'pointer',
            }}>
            💡 Hint
          </button>
        )}
      </div>

      {/* Hint display */}
      {showHint && currentChain && (
        <div style={{
          width: '100%', maxWidth: 560, background: '#1e3a5f', border: '1px solid #3b82f6',
          borderRadius: 10, padding: '8px 14px', marginBottom: 8, textAlign: 'center',
          color: '#93c5fd', fontSize: 'clamp(0.75rem,2.5vw,0.85rem)',
        }}>
          💡 Next word starts with "<strong>{currentChain.chain[selected.length]?.[0] || '?'}</strong>" and has {currentChain.chain[selected.length]?.length || '?'} letters
        </div>
      )}

      {/* Feedback */}
      <div style={{ minHeight: 24, textAlign: 'center' }}>
        {feedback?.type === 'wrong' && (
          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 'clamp(0.85rem,3vw,1rem)' }}>
            ❌ Wrong word — try another!
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 12, color: '#475569', fontSize: 'clamp(0.65rem,2vw,0.75rem)', textAlign: 'center', maxWidth: 450 }}>
        Words connect to form compound words or associations. Pick them in order!
      </div>
      </div>
      )}

      {phase === 'gameover' && completionData && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Word Chain Logic"
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
