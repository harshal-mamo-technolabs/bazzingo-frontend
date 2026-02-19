import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

// ─── SUSPECT POOL ───
const NAMES = ['Alex','Jordan','Morgan','Casey','Riley','Sam','Taylor','Quinn','Drew','Blake','Avery','Charlie','Frankie','Harper','Jesse','Logan','Parker','Reese','Skyler','Dakota'];
const JOBS = ['Chef','Teacher','Doctor','Artist','Banker','Driver','Nurse','Pilot','Lawyer','Writer','Clerk','Guard','Baker','Tailor','Singer'];
const APPEARANCES = [
  { hair: '🧑‍🦰', desc: 'red hair' },
  { hair: '👱', desc: 'blonde hair' },
  { hair: '🧑‍🦱', desc: 'curly hair' },
  { hair: '👩‍🦳', desc: 'gray hair' },
  { hair: '🧑', desc: 'brown hair' },
  { hair: '👨‍🦲', desc: 'bald' },
  { hair: '👩‍🦰', desc: 'auburn hair' },
  { hair: '🧔', desc: 'bearded' },
];
const ACCESSORIES = ['glasses 🤓','a hat 🎩','a watch ⌚','a scarf 🧣','gloves 🧤','a ring 💍','earrings','a badge 📛','a tattoo','a cane'];
const LOCATIONS = ['kitchen','garden','library','garage','office','hallway','rooftop','basement','balcony','lobby','gym','pool','attic','chapel','lab'];

// ─── SCENARIO TEMPLATES ───
const SCENARIOS = [
  { type: 'theft', icon: '💎', title: 'The Missing Diamond', desc: 'A priceless diamond has vanished from the museum vault!' },
  { type: 'theft', icon: '🎨', title: 'The Stolen Painting', desc: 'A masterpiece was taken from the gallery overnight!' },
  { type: 'theft', icon: '📦', title: 'The Lost Package', desc: 'A top-secret package disappeared from the mailroom!' },
  { type: 'lie', icon: '🤥', title: 'The False Alibi', desc: 'Someone is lying about where they were last night!' },
  { type: 'lie', icon: '📝', title: 'The Forged Document', desc: 'A critical document has been tampered with!' },
  { type: 'lie', icon: '🔑', title: 'The Fake Key', desc: 'Someone made a copy of the master key!' },
  { type: 'sabotage', icon: '⚙️', title: 'The Broken Machine', desc: 'The power generator was deliberately sabotaged!' },
  { type: 'sabotage', icon: '🧪', title: 'The Poisoned Well', desc: 'Someone contaminated the water supply!' },
  { type: 'theft', icon: '💰', title: 'The Bank Heist', desc: 'Money vanished from the vault during the night shift!' },
  { type: 'lie', icon: '🕵️', title: 'The Double Agent', desc: 'One of the team members is working for the enemy!' },
  { type: 'sabotage', icon: '🚂', title: 'The Train Delay', desc: 'Someone tampered with the railway signals!' },
  { type: 'theft', icon: '👑', title: 'The Crown Jewels', desc: 'The royal crown has disappeared from the tower!' },
  { type: 'lie', icon: '📱', title: 'The Leaked Secret', desc: 'Classified info was shared with an outsider!' },
  { type: 'sabotage', icon: '🔬', title: 'The Lab Incident', desc: 'Research data was deliberately corrupted!' },
  { type: 'theft', icon: '🗝️', title: 'The Vault Break-In', desc: 'The high-security vault was breached from inside!' },
];

// ─── LEVEL CONFIG ───
const LEVELS = {
  easy:   { label: 'Easy',   suspects: 3, clues: 4, rounds: 4, timeLimit: 120, color: '#4ade80', desc: 'Junior Detective', icon: '🔍' },
  medium: { label: 'Medium', suspects: 4, clues: 3, rounds: 4, timeLimit: 150, color: '#facc15', desc: 'Senior Inspector', icon: '🕵️' },
  hard:   { label: 'Hard',   suspects: 5, clues: 3, rounds: 4, timeLimit: 180, color: '#f87171', desc: 'Master Sleuth', icon: '🏆' },
};

const MAX_SCORE = 200;

// ─── AUDIO ENGINE ───
function createAudioEngine() {
  let ctx = null;
  const getCtx = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
  let musicInterval = null;

  const playTone = (freq, dur = 0.15, type = 'square', vol = 0.1) => {
    try {
      const c = getCtx(), o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
    } catch(e){}
  };

  return {
    select:  () => playTone(500, 0.08, 'sine', 0.1),
    correct: () => { playTone(523,0.12,'sine',0.15); setTimeout(()=>playTone(659,0.12,'sine',0.15),100); setTimeout(()=>playTone(784,0.2,'sine',0.15),200); },
    wrong:   () => { playTone(200,0.25,'sawtooth',0.1); setTimeout(()=>playTone(160,0.3,'sawtooth',0.1),150); },
    clue:    () => playTone(660,0.15,'triangle',0.08),
    tick:    () => playTone(900,0.03,'sine',0.03),
    reveal:  () => { playTone(440,0.1,'sine',0.1); setTimeout(()=>playTone(554,0.1,'sine',0.1),80); setTimeout(()=>playTone(659,0.15,'sine',0.12),160); },
    accuse:  () => playTone(300,0.3,'square',0.08),
    startMusic: () => {
      try {
        const c = getCtx();
        const notes = [220,247,262,294,262,247,220,196];
        let i = 0;
        musicInterval = setInterval(() => {
          const o = c.createOscillator(), g = c.createGain();
          o.type = 'triangle'; o.frequency.setValueAtTime(notes[i%notes.length], c.currentTime);
          g.gain.setValueAtTime(0.03, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
          o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.55);
          i++;
        }, 600);
      } catch(e){}
    },
    stopMusic: () => { if (musicInterval) { clearInterval(musicInterval); musicInterval = null; } },
  };
}

// ─── SHUFFLE ───
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// ─── GENERATE CASE ───
function generateCase(level) {
  const cfg = LEVELS[level];
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const names = shuffle(NAMES).slice(0, cfg.suspects);
  const jobs = shuffle(JOBS).slice(0, cfg.suspects);
  const apps = shuffle(APPEARANCES).slice(0, cfg.suspects);
  const accs = shuffle(ACCESSORIES).slice(0, cfg.suspects);
  const locs = shuffle(LOCATIONS).slice(0, cfg.suspects);
  const guiltyIdx = Math.floor(Math.random() * cfg.suspects);

  const suspects = names.map((name, i) => ({
    id: i,
    name,
    job: jobs[i],
    appearance: apps[i],
    accessory: accs[i],
    location: locs[i],
    guilty: i === guiltyIdx,
    alibi: i === guiltyIdx
      ? `Was supposedly in the ${locs[(i+1)%cfg.suspects]} but no one saw them there.`
      : `Was seen in the ${locs[i]} by multiple witnesses.`,
  }));

  const guilty = suspects[guiltyIdx];

  // Build clues that point toward the guilty suspect
  const allClues = [
    { text: `The culprit has ${guilty.appearance.desc}.`, icon: '👤', weight: 3 },
    { text: `A witness saw someone with ${guilty.accessory} near the scene.`, icon: '👁️', weight: 3 },
    { text: `The culprit works as a ${guilty.job}.`, icon: '💼', weight: 4 },
    { text: `${guilty.name}'s alibi doesn't check out.`, icon: '❌', weight: 5 },
    { text: `The culprit was NOT in the ${locs.find(l => l !== guilty.location) || 'garden'}.`, icon: '📍', weight: 2 },
    { text: `Security footage shows someone with ${guilty.appearance.desc} leaving the area.`, icon: '📹', weight: 3 },
    { text: `A ${guilty.accessory.split(' ')[0]} was found at the crime scene.`, icon: '🔎', weight: 3 },
    { text: `The culprit's profession requires access to restricted areas.`, icon: '🚪', weight: 1 },
    { text: `Witnesses confirm the culprit is NOT ${suspects.find(s=>!s.guilty)?.name}.`, icon: '✅', weight: 2 },
    { text: `The culprit left traces near the ${guilty.location}.`, icon: '👣', weight: 3 },
  ];

  const clues = shuffle(allClues).slice(0, cfg.clues + 2); // extra clues revealed over time

  return { scenario, suspects, guiltyIdx, clues, cfg };
}

// ─── MAIN COMPONENT ───
export default function WhoIs({ onBack }) {
  const location = useLocation();
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(null);
  const [currentCase, setCurrentCase] = useState(null);
  const [revealedClues, setRevealedClues] = useState([]);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const [accused, setAccused] = useState(null);
  const [combo, setCombo] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [showSuspectDetail, setShowSuspectDetail] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const closeInstructions = useCallback(() => setShowInstructions(false), []);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const clueTimerRef = useRef(null);

  useEffect(() => {
    if (!showInstructions) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') closeInstructions(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInstructions, closeInstructions]);

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
          const map = { easy: 'easy', medium: 'medium', moderate: 'medium', hard: 'hard' };
          if (map[d]) {
            setIsDailyGame(true);
            setDailyGameDifficulty(map[d]);
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

  if (!audioRef.current) audioRef.current = createAudioEngine();
  const audio = audioRef.current;

  // ─── CANVAS BACKGROUND ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.getContext('2d');
    let animId;
    let particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.25 + 0.05,
    }));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      cx.clearRect(0, 0, canvas.width, canvas.height);
      cx.strokeStyle = 'rgba(80,120,200,0.05)';
      cx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, canvas.height); cx.stroke(); }
      for (let y = 0; y < canvas.height; y += 50) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(canvas.width, y); cx.stroke(); }
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        cx.beginPath(); cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cx.fillStyle = `rgba(100, 140, 255, ${p.alpha})`; cx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  // ─── TIMER ───
  useEffect(() => {
    if (phase !== 'investigate') return;
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); clearInterval(clueTimerRef.current); autoFail(); return 0; }
        if (prev <= 10) audio.tick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, round]);

  // ─── PROGRESSIVE CLUE REVEAL ───
  useEffect(() => {
    if (phase !== 'investigate' || !currentCase) return;
    const initialClues = currentCase.clues.slice(0, LEVELS[level].clues);
    setRevealedClues(initialClues);
    setClueIndex(LEVELS[level].clues);

    // Reveal extra clues over time
    clueTimerRef.current = setInterval(() => {
      setClueIndex(prev => {
        if (prev >= currentCase.clues.length) { clearInterval(clueTimerRef.current); return prev; }
        setRevealedClues(rc => [...rc, currentCase.clues[prev]]);
        audio.clue();
        return prev + 1;
      });
    }, 12000);
    return () => clearInterval(clueTimerRef.current);
  }, [phase, round, currentCase]);

  const autoFail = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(clueTimerRef.current);
    const result = { round: round + 1, correct: false, timeTaken: 0, score: 0 };
    setRoundResults(prev => [...prev, result]);
    setAccused({ suspect: null, correct: false });
    setCombo(0);
    audio.wrong();
    setPhase('result');
  }, [round, audio]);

  // ─── START LEVEL ───
  const startLevel = (lv) => {
    setLevel(lv);
    setScore(0);
    setRound(0);
    setCombo(0);
    setRoundResults([]);
    audio.startMusic();
    startRound(lv, 0);
  };

  const startRound = (lv, r) => {
    const newCase = generateCase(lv);
    setCurrentCase(newCase);
    setSelectedSuspect(null);
    setAccused(null);
    setShowSuspectDetail(null);
    setRound(r);
    setTimer(LEVELS[lv].timeLimit);
    setPhase('investigate');
    audio.reveal();
  };

  // ─── ACCUSE ───
  const accuseSuspect = useCallback(() => {
    if (selectedSuspect === null || !currentCase) return;
    clearInterval(timerRef.current);
    clearInterval(clueTimerRef.current);
    audio.accuse();

    const suspect = currentCase.suspects[selectedSuspect];
    const correct = suspect.guilty;
    const cfg = LEVELS[level];
    const roundMax = Math.floor(MAX_SCORE / cfg.rounds);
    const timeBonus = Math.floor((timer / cfg.timeLimit) * 15);
    const comboBonus = combo * 3;
    let roundScore = correct ? Math.min(roundMax, roundMax - 5 + timeBonus + comboBonus) : 0;

    const newCombo = correct ? combo + 1 : 0;
    setCombo(newCombo);
    const newScore = Math.min(score + roundScore, MAX_SCORE);
    setScore(newScore);

    const result = { round: round + 1, correct, timeTaken: cfg.timeLimit - timer, score: roundScore, suspectName: suspect.name };
    setRoundResults(prev => [...prev, result]);
    setAccused({ suspect, correct });

    if (correct) audio.correct(); else audio.wrong();
    setPhase('result');
  }, [selectedSuspect, currentCase, timer, score, combo, round, level, audio]);

  // ─── NEXT ROUND / FINISHED ───
  const handleReset = useCallback(() => {
    setPhase('menu');
    setCompletionData(null);
  }, []);

  const nextRound = () => {
    const cfg = LEVELS[level];
    if (round + 1 >= cfg.rounds) {
      audio.stopMusic();
      const solved = roundResults.filter(r => r.correct).length;
      const total = roundResults.length;
      const timeElapsed = roundResults.reduce((acc, r) => acc + (r.timeTaken || 0), 0);
      setCompletionData({
        score,
        isVictory: score >= 100,
        difficulty: level,
        timeElapsed,
        gameTimeLimit: cfg.rounds * cfg.timeLimit,
        casesSolved: solved,
        totalRounds: total,
      });
      setPhase('finished');
    } else {
      startRound(level, round + 1);
    }
  };

  // ─── STYLES ───
  const S = {
    root: { position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #0a0e1a 0%, #111827 40%, #0f172a 100%)', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#e2e8f0', overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    canvas: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
    content: { position: 'relative', zIndex: 1, width: '100%', maxWidth: 1100, padding: '10px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' },
    backBtn: { position: 'absolute', top: 12, left: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, zIndex: 10 },
    title: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, textAlign: 'center', margin: '8px 0 4px', textShadow: '0 0 20px rgba(100,140,255,0.35)' },
    subtitle: { fontSize: 'clamp(0.8rem, 2vw, 1rem)', opacity: 0.55, textAlign: 'center', marginBottom: 14 },
    hud: { display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10, background: 'rgba(0,0,0,0.35)', borderRadius: 12, padding: '8px 20px', backdropFilter: 'blur(8px)' },
    hudItem: { textAlign: 'center', minWidth: 55 },
    hudLabel: { fontSize: 10, opacity: 0.45, textTransform: 'uppercase', letterSpacing: 1 },
    hudValue: { fontSize: 18, fontWeight: 700 },
    levelCard: (color) => ({ background: `linear-gradient(135deg, ${color}15, ${color}08)`, border: `2px solid ${color}35`, borderRadius: 16, padding: '20px 24px', cursor: 'pointer', transition: 'all 0.2s', width: '100%', maxWidth: 260, textAlign: 'center' }),
    btn: (bg = '#3b82f6') => ({ background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 20px ${bg}40`, transition: 'all 0.2s' }),
    overlay: { position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' },
    card: { background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: 20, padding: '24px 28px', maxWidth: 500, width: '92%', textAlign: 'center', border: '1px solid rgba(100,140,255,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' },
  };

  const tLoading = useTranslateText('Loading...');
  const tHowToPlay = useTranslateText('How to Play');
  const tWhoIsHowToPlay = useTranslateText('Who Is? – How to Play');
  const tObjective = useTranslateText('Objective');
  const tSolveCase = useTranslateText('Solve each case by analyzing the crime scenario, suspects, and clues to find the guilty party before time runs out.');
  const tRead = useTranslateText('Read — Study the crime scenario and title at the top.');
  const tInvestigate = useTranslateText('Investigate — Examine suspects and review clues as they appear. New clues unlock over time.');
  const tDeduce = useTranslateText('Deduce — Tap a suspect to open their profile (job, appearance, alibi, location).');
  const tAccuseBullet = useTranslateText('Accuse — When you\'re sure, select the guilty suspect and press Accuse! Correct = points; wrong = penalty.');
  const tScoringLevels = useTranslateText('Scoring & Levels');
  const tScoringLevelsText = useTranslateText('Correct accusations earn points; combos multiply your score. Easy: 3 suspects, 4 clues. Medium: 4 suspects, 3 clues. Hard: 5 suspects, 3 clues. Each difficulty has a time limit per case.');
  const tGotIt = useTranslateText('Got it');
  const tWhoIs = useTranslateText('Who Is?');
  const tAnalyzeSuspects = useTranslateText('Analyze suspects & clues to find the guilty party!');
  const tDailyChallenge = useTranslateText('Daily Challenge');
  const tCase = useTranslateText('Case');
  const tTime = useTranslateText('Time');
  const tScore = useTranslateText('Score');
  const tStreak = useTranslateText('Streak');
  const tSuspects = useTranslateText('Suspects');
  const tEvidenceBoard = useTranslateText('Evidence Board');
  const tMoreEvidence = useTranslateText('More evidence arriving...');
  const tAccusing = useTranslateText('Accusing:');
  const tAccuse = useTranslateText('Accuse!');
  const tAppearance = useTranslateText('Appearance:');
  const tAccessory = useTranslateText('Accessory:');
  const tLastSeen = useTranslateText('Last seen:');
  const tAlibi = useTranslateText('Alibi:');
  const tClose = useTranslateText('Close');
  const tSelectAsSuspect = useTranslateText('Select as Suspect');
  const tCaseSolved = useTranslateText('Case Solved!');
  const tWrongSuspect = useTranslateText('Wrong Suspect!');
  const tYouCorrectlyIdentified = useTranslateText('You correctly identified');
  const tAsCulprit = useTranslateText('as the culprit!');
  const tRealCulpritWas = useTranslateText('The real culprit was');
  const tHad = useTranslateText('Had');
  const tSeenNear = useTranslateText('Seen near');
  const tViewResults = useTranslateText('View Results');
  const tCaseNum = useTranslateText('▶ Case');
  const tBack = useTranslateText('← Back');
  const levelLabels = { easy: useTranslateText('Easy'), medium: useTranslateText('Medium'), hard: useTranslateText('Hard') };
  const levelDescs = { easy: useTranslateText('Junior Detective'), medium: useTranslateText('Senior Inspector'), hard: useTranslateText('Master Sleuth') };

  // ─── MENU ───
  if (phase === 'menu') {
    if (checkingDailyGame) {
      return (
        <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#e2e8f0', fontSize: 16 }}>{tLoading}</div>
        </div>
      );
    }
    const levelEntries = isDailyGame && dailyGameDifficulty
      ? Object.entries(LEVELS).filter(([key]) => key === dailyGameDifficulty)
      : Object.entries(LEVELS);
    return (
      <div style={S.root}>
        <canvas ref={canvasRef} style={S.canvas} />
        <div style={S.content}>
          {onBack && <button style={S.backBtn} onClick={() => { audio.stopMusic(); onBack(); }}>{tBack}</button>}
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            aria-label="How to Play"
            style={{
              position: 'absolute', top: 12, right: 16, zIndex: 10,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10,
              border: '2px solid rgba(100,140,255,0.6)', background: 'rgba(100,140,255,0.15)',
              color: '#93c5fd', cursor: 'pointer', fontSize: 14, fontWeight: 700,
              transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100,140,255,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(100,140,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100,140,255,0.15)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <span style={{ fontSize: 16 }} aria-hidden>📖</span>
            {tHowToPlay}
          </button>
          {showInstructions && (
            <div role="dialog" aria-modal="true" aria-labelledby="who-is-brain-instructions-title" style={{ ...S.overlay, zIndex: 1000 }} onClick={closeInstructions}>
              <div style={{ ...S.card, padding: 0, maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
                  <h2 id="who-is-brain-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#93c5fd' }}>🕵️ {tWhoIsHowToPlay}</h2>
                  <button type="button" onClick={closeInstructions} aria-label="Close" style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <section style={{ background: 'rgba(147,197,253,0.1)', border: '1px solid rgba(147,197,253,0.3)', borderRadius: 12, padding: 16 }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#93c5fd' }}>🎯 {tObjective}</h3>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#cbd5e1' }}>{tSolveCase}</p>
                    </section>
                    <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>🎮 {tHowToPlay}</h3>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                        <li>{tRead}</li>
                        <li>{tInvestigate}</li>
                        <li>{tDeduce}</li>
                        <li>{tAccuseBullet}</li>
                      </ul>
                    </section>
                    <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>📊 {tScoringLevels}</h3>
                      <p style={{ margin: '0 0 8px', fontSize: 14, color: '#cbd5e1' }}>{tScoringLevelsText}</p>
                    </section>
                  </div>
                </div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <button type="button" onClick={closeInstructions} style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(96,165,250,0.4)' }}>{tGotIt}</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ fontSize: 52, marginTop: 28 }}>🕵️</div>
          <h1 style={S.title}>{tWhoIs}</h1>
          <p style={S.subtitle}>{tAnalyzeSuspects}</p>
          {isDailyGame && (
            <div style={{ marginBottom: 16, padding: '6px 16px', background: 'rgba(116,185,255,0.2)', border: '1px solid rgba(116,185,255,0.5)', borderRadius: 20, fontSize: 13, color: '#74b9ff', fontWeight: 600 }}>
              {tDailyChallenge}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            {levelEntries.map(([key, lv]) => (
              <div key={key} style={S.levelCard(lv.color)}
                onClick={() => { audio.select(); startLevel(key); }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 8px 30px ${lv.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>{lv.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: lv.color }}>{levelLabels[key]}</div>
                <div style={{ fontSize: 13, opacity: 0.55, margin: '4px 0' }}>{levelDescs[key]}</div>
                <div style={{ fontSize: 12, opacity: 0.35 }}>{lv.suspects} suspects · {lv.clues} initial clues</div>
                <div style={{ fontSize: 12, opacity: 0.35 }}>{lv.rounds} cases · {lv.timeLimit}s per case</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── INVESTIGATE PHASE ───
  if (phase === 'investigate' && currentCase) {
    const { scenario, suspects, clues } = currentCase;
    const cfg = LEVELS[level];
    return (
      <div style={{ ...S.root, zIndex: 1 }}>
        <canvas ref={canvasRef} style={S.canvas} />
        <div style={S.content}>
          <button style={S.backBtn} onClick={() => { audio.stopMusic(); clearInterval(timerRef.current); clearInterval(clueTimerRef.current); setPhase('menu'); }}>{tBack}</button>

          {/* HUD */}
          <div style={{ ...S.hud, marginTop: 36 }}>
            <div style={S.hudItem}><div style={S.hudLabel}>{tCase}</div><div style={S.hudValue}>{round+1}/{cfg.rounds}</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>{tTime}</div><div style={{ ...S.hudValue, color: timer <= 15 ? '#f87171' : '#60a5fa' }}>{timer}s</div></div>
            <div style={S.hudItem}><div style={S.hudLabel}>{tScore}</div><div style={{ ...S.hudValue, color: '#4ade80' }}>{score}</div></div>
            {combo > 1 && <div style={S.hudItem}><div style={S.hudLabel}>{tStreak}</div><div style={{ ...S.hudValue, color: '#fb923c' }}>🔥 x{combo}</div></div>}
          </div>

          {/* Scenario Banner */}
          <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '14px 20px', marginBottom: 12, textAlign: 'center', width: '100%', maxWidth: 700 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{scenario.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fca5a5' }}>{scenario.title}</div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>{scenario.desc}</div>
          </div>

          {/* Main layout: Suspects + Clues side by side on desktop */}
          <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 960, flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>

            {/* Suspects Grid */}
            <div style={{ flex: '1 1 400px', minWidth: 300 }}>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.6, marginBottom: 8, textAlign: 'center' }}>👥 {tSuspects}</div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`, gap: 10 }}>
                {suspects.map((s, i) => {
                  const isSelected = selectedSuspect === i;
                  return (
                    <div key={i}
                      onClick={() => { setSelectedSuspect(i); setShowSuspectDetail(i); audio.select(); }}
                      style={{
                        background: isSelected ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                        border: isSelected ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.08)',
                        borderRadius: 14, padding: '14px 10px', cursor: 'pointer', textAlign: 'center',
                        transition: 'all 0.2s', position: 'relative',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 4 }}>{s.appearance.hair}</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.5 }}>{s.job}</div>
                      <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>Has {s.accessory}</div>
                      {isSelected && <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 14 }}>🎯</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clues Panel */}
            <div style={{ flex: '1 1 280px', minWidth: 260, maxWidth: 360 }}>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.6, marginBottom: 8, textAlign: 'center' }}>🔎 {tEvidenceBoard}</div>
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {revealedClues.map((clue, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, lineHeight: 1.5,
                    animation: i === revealedClues.length - 1 ? 'fadeSlideIn 0.4s ease' : 'none',
                  }}>
                    <span style={{ marginRight: 6, fontSize: 16 }}>{clue.icon}</span>
                    {clue.text}
                  </div>
                ))}
                {clueIndex < currentCase.clues.length && (
                  <div style={{ fontSize: 11, opacity: 0.3, textAlign: 'center', padding: 4 }}>
                    ⏳ {tMoreEvidence}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accuse Button */}
          <div style={{ marginTop: 12, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {selectedSuspect !== null && (
              <div style={{ fontSize: 14, opacity: 0.6 }}>
                {tAccusing} <b style={{ color: '#60a5fa' }}>{suspects[selectedSuspect].name}</b>
              </div>
            )}
            <button
              style={{ ...S.btn(selectedSuspect !== null ? '#ef4444' : '#4b5563'), opacity: selectedSuspect !== null ? 1 : 0.5, cursor: selectedSuspect !== null ? 'pointer' : 'not-allowed' }}
              onClick={selectedSuspect !== null ? accuseSuspect : undefined}
            >
              ⚖️ {tAccuse}
            </button>
          </div>

          {/* Suspect Detail Modal */}
          {showSuspectDetail !== null && (
            <div style={S.overlay} onClick={() => setShowSuspectDetail(null)}>
              <div style={S.card} onClick={e => e.stopPropagation()}>
                {(() => {
                  const s = suspects[showSuspectDetail];
                  return (
                    <>
                      <div style={{ fontSize: 52, marginBottom: 6 }}>{s.appearance.hair}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 14, opacity: 0.5, marginBottom: 12 }}>{s.job}</div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 16px', textAlign: 'left', marginBottom: 12, fontSize: 13, lineHeight: 1.7 }}>
                        <div><b>{tAppearance}</b> {s.appearance.desc}</div>
                        <div><b>{tAccessory}</b> {s.accessory}</div>
                        <div><b>{tLastSeen}</b> {s.location}</div>
                        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                          <b>{tAlibi}</b> "{s.alibi}"
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button style={S.btn('#3b82f6')} onClick={() => setShowSuspectDetail(null)}>{tClose}</button>
                        <button style={S.btn('#ef4444')} onClick={() => { setSelectedSuspect(showSuspectDetail); setShowSuspectDetail(null); }}>
                          🎯 {tSelectAsSuspect}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
        <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    );
  }

  // ─── RESULT PHASE (and finished: same frame behind modal) ───
  if (phase === 'result' || phase === 'finished') {
    const lastResult = roundResults[roundResults.length - 1];
    const guilty = currentCase?.suspects?.[currentCase.guiltyIdx];
    const isFinished = phase === 'finished';
    return (
      <>
        <div style={{ ...S.root, zIndex: 1 }}>
          <canvas ref={canvasRef} style={S.canvas} />
          <div style={S.overlay}>
            <div style={S.card}>
              <div style={{ fontSize: 52, marginBottom: 6 }}>{lastResult?.correct ? '✅' : '❌'}</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                {lastResult?.correct ? tCaseSolved : tWrongSuspect}
              </div>
              <div style={{ fontSize: 14, opacity: 0.55, marginBottom: 8 }}>
                {lastResult?.correct
                  ? `${tYouCorrectlyIdentified} ${guilty?.name} ${tAsCulprit}`
                  : `${tRealCulpritWas} ${guilty?.name} the ${guilty?.job}.`}
              </div>
              {guilty && (
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{guilty.appearance.hair}</div>
                  <div><b>{guilty.name}</b> — {guilty.job}</div>
                  <div style={{ opacity: 0.5, marginTop: 4 }}>{tHad} {guilty.accessory} · {tSeenNear} {guilty.location}</div>
                </div>
              )}
              <div style={{ fontSize: 28, fontWeight: 800, color: lastResult?.correct ? '#4ade80' : '#f87171', marginBottom: 14 }}>
                +{lastResult?.score ?? 0} pts
              </div>
              {!isFinished && (
                <button style={S.btn('#3b82f6')} onClick={() => { audio.select(); nextRound(); }}>
                  {round + 1 >= LEVELS[level].rounds ? `📊 ${tViewResults}` : `${tCaseNum} ${round + 2}`}
                </button>
              )}
            </div>
          </div>
        </div>
        {isFinished && completionData != null && (
          <GameCompletionModal
            isVisible
            onClose={handleReset}
            gameTitle={tWhoIs}
            score={completionData.score}
            timeElapsed={completionData.timeElapsed}
            gameTimeLimit={completionData.gameTimeLimit}
            isVictory={completionData.isVictory}
            difficulty={completionData.difficulty}
            customMessages={{
              maxScore: MAX_SCORE,
              stats: completionData.casesSolved != null && completionData.totalRounds != null
                ? `Cases solved: ${completionData.casesSolved}/${completionData.totalRounds}`
                : undefined,
            }}
          />
        )}
      </>
    );
  }

  return null;
}
