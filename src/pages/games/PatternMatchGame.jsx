import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

const COLORS = {
  orange: '#FF6B3E',
  gray: '#6B7280',
  cream: '#F5F5DC',
  white: '#FFFFFF',
  wood: '#C4884A',
  woodDark: '#A0522D',
};

const TILE_COLORS = [COLORS.orange, COLORS.gray, COLORS.cream];

const MAX_SCORE = 200;

const difficultySettings = {
  'Easy': { time: 180, totalRounds: 10, gridSize: 4, pointsPerMatch: 20 },
  'Moderate': { time: 150, totalRounds: 10, gridSize: 4, pointsPerMatch: 20 },
  'Hard': { time: 120, totalRounds: 10, gridSize: 5, pointsPerMatch: 20 },
};

const PatternMatchGame = () => {
  const location = useLocation();
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [tiles, setTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showInstruction, setShowInstruction] = useState(true);
  const [currentInstruction, setCurrentInstruction] = useState('Find the matching tiles!');
  const [feedbackState, setFeedbackState] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const scoreRef = useRef(0);
  const timeRemainingRef = useRef(180);

  const closeInstructions = useCallback(() => setShowInstructions(false), []);

  useEffect(() => {
    scoreRef.current = score;
    timeRemainingRef.current = timeRemaining;
  }, [score, timeRemaining]);

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
          const map = { easy: 'Easy', medium: 'Moderate', moderate: 'Moderate', hard: 'Hard' };
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

  const settings = difficultySettings[difficulty];

  // Check if two patterns match
  const patternsMatch = useCallback((p1, p2) => {
    if (p1.length !== p2.length) return false;
    for (let i = 0; i < p1.length; i++) {
      if (p1[i].length !== p2[i].length) return false;
      for (let j = 0; j < p1[i].length; j++) {
        if (p1[i][j] !== p2[i][j]) return false;
      }
    }
    return true;
  }, []);

  // Generate random pattern
  const generatePattern = useCallback((gridSize) => {
    const pattern = [];
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        row.push(Math.floor(Math.random() * 3));
      }
      pattern.push(row);
    }
    return pattern;
  }, []);

  // Generate 4 tiles: 2 matching + 2 unique
  const generateRoundTiles = useCallback(() => {
    const { gridSize } = settings;
    const newTiles = [];
    
    // Generate the matching pattern
    const matchingPattern = generatePattern(gridSize);
    
    // Generate 2 unique non-matching patterns
    const uniquePatterns = [];
    while (uniquePatterns.length < 2) {
      const newPattern = generatePattern(gridSize);
      // Make sure it's different from matching pattern and other unique patterns
      const isDifferent = !patternsMatch(newPattern, matchingPattern) && 
        !uniquePatterns.some(p => patternsMatch(p, newPattern));
      if (isDifferent) {
        uniquePatterns.push(newPattern);
      }
    }
    
    // Create 4 tiles: 2 matching + 2 unique
    newTiles.push({ id: 0, pattern: matchingPattern.map(row => [...row]), isMatching: true });
    newTiles.push({ id: 1, pattern: matchingPattern.map(row => [...row]), isMatching: true });
    newTiles.push({ id: 2, pattern: uniquePatterns[0], isMatching: false });
    newTiles.push({ id: 3, pattern: uniquePatterns[1], isMatching: false });
    
    // Shuffle tiles
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }
    
    // Re-assign IDs after shuffle
    return newTiles.map((tile, index) => ({ ...tile, id: index }));
  }, [settings, generatePattern, patternsMatch]);

  // Sound effects
  const playSound = useCallback((type) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      switch (type) {
        case 'select':
          oscillator.frequency.value = 500;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);
          break;
        case 'match':
          oscillator.frequency.value = 700;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.4);
          // Play second note for harmony
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 900;
          osc2.type = 'sine';
          gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc2.start(ctx.currentTime + 0.1);
          osc2.stop(ctx.currentTime + 0.5);
          break;
        case 'wrong':
          oscillator.frequency.value = 200;
          oscillator.type = 'sawtooth';
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
          break;
        case 'complete':
          const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.3);
          });
          break;
        default:
          break;
      }
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  // Start game
  const handleStart = useCallback(() => {
    setScore(0);
    setTimeRemaining(settings.time);
    setTiles(generateRoundTiles());
    setSelectedTiles([]);
    setCurrentRound(1);
    setCorrectMatches(0);
    setWrongAttempts(0);
    setShowInstruction(true);
    setCurrentInstruction('Tiles can contain multiple colors, find the matching tiles.');
    setFeedbackState('none');
    setIsProcessing(false);
    setGameState('playing');
  }, [settings, generateRoundTiles]);

  // Reset / back to menu
  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('ready');
    setCompletionData(null);
    setScore(0);
    setTimeRemaining(settings.time);
    setTiles([]);
    setSelectedTiles([]);
    setCurrentRound(1);
    setCorrectMatches(0);
    setWrongAttempts(0);
    setShowInstruction(false);
    setFeedbackState('none');
    setIsProcessing(false);
  }, [settings]);

  // Load next round
  const loadNextRound = useCallback(() => {
    if (currentRound >= settings.totalRounds) {
      playSound('complete');
      setCompletionData({
        score: scoreRef.current,
        isVictory: scoreRef.current >= MAX_SCORE,
        difficulty,
        timeElapsed: settings.time - timeRemainingRef.current,
      });
      setGameState('finished');
    } else {
      setCurrentRound(prev => prev + 1);
      setTiles(generateRoundTiles());
      setSelectedTiles([]);
      setFeedbackState('none');
      setIsProcessing(false);
    }
  }, [currentRound, settings.totalRounds, settings.time, difficulty, generateRoundTiles, playSound]);

  // Handle tile click
  const handleTileClick = useCallback((tileIndex) => {
    if (gameState !== 'playing' || isProcessing) return;
    if (selectedTiles.includes(tileIndex)) return;
    
    playSound('select');
    
    const newSelected = [...selectedTiles, tileIndex];
    setSelectedTiles(newSelected);
    
    if (newSelected.length === 2) {
      setIsProcessing(true);
      const [first, second] = newSelected;
      const tile1 = tiles[first];
      const tile2 = tiles[second];
      
      // Check if both selected tiles are the matching ones
      if (tile1.isMatching && tile2.isMatching) {
        // Correct match!
        playSound('match');
        setFeedbackState('correct');
        setCorrectMatches(prev => prev + 1);
        setScore(prev => Math.min(200, prev + settings.pointsPerMatch));
        setCurrentInstruction('🎉 Great match! Keep going!');
        
        // Load next round after delay
        setTimeout(() => {
          loadNextRound();
        }, 800);
      } else {
        // Wrong match
        playSound('wrong');
        setFeedbackState('wrong');
        setWrongAttempts(prev => prev + 1);
        setScore(prev => Math.max(0, prev - 10)); // Deduct 10 points, min 0
        setCurrentInstruction('❌ Not a match. Try again!');
        
        // Load next round after delay
        setTimeout(() => {
          loadNextRound();
        }, 800);
      }
    }
  }, [gameState, tiles, selectedTiles, isProcessing, settings.pointsPerMatch, playSound, loadNextRound]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeRemaining <= 0) return;
    const id = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCompletionData({
            score: scoreRef.current,
            isVictory: false,
            difficulty,
            timeElapsed: settings.time,
          });
          playSound('complete');
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = id;
    return () => { clearInterval(id); timerRef.current = null; };
  }, [gameState, timeRemaining, playSound, difficulty, settings.time]);

  useEffect(() => {
    if (gameState !== 'playing' || score < MAX_SCORE) return;
    setCompletionData({
      score: MAX_SCORE,
      isVictory: true,
      difficulty,
      timeElapsed: settings.time - timeRemainingRef.current,
    });
    setGameState('finished');
  }, [gameState, score, difficulty, settings.time]);
 
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
 
  const instructionsModalContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section style={{ background: 'rgba(255,107,62,0.1)', border: '1px solid rgba(255,107,62,0.3)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#FF6B3E' }}>Objective</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#cbd5e1' }}>Find the two tiles that have the same pattern among four tiles each round. Complete all rounds or reach 200 points before time runs out.</p>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>How to Play</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li>Select exactly <strong>2 tiles</strong> per round. A matching pair awards points; a wrong pair deducts points.</li>
          <li>Game ends on time out, 200 score, or when all rounds are completed.</li>
        </ul>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Scoring</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li>Correct pair: +20 points. Wrong pair: -10 points (score never goes below 0). Max score: 200.</li>
        </ul>
      </section>
      <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Difficulty</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
          <li>Easy: 180s, 4×4 grid. Moderate: 150s, 4×4. Hard: 120s, 5×5 grid.</li>
        </ul>
      </section>
    </div>
  );

  const playingContent = (
    <>
      <style>{`
        @keyframes tile-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes tile-select {
          0% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
          100% { transform: scale(1.05); box-shadow: 0 8px 25px rgba(255,107,62,0.5); }
        }
        @keyframes correct-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          50% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
        }
        @keyframes wrong-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        @keyframes tile-appear {
          0% { opacity: 0; transform: scale(0.5) rotateY(90deg); }
          100% { opacity: 1; transform: scale(1) rotateY(0deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .tile-pop {
          animation: tile-pop 0.2s ease-out;
        }
        .tile-selected {
          animation: tile-select 0.3s ease-out forwards;
        }
        .tile-correct {
          animation: correct-pulse 0.5s ease-out;
          background: linear-gradient(180deg, #BBF7D0 0%, #86EFAC 100%) !important;
        }
        .tile-wrong {
          animation: wrong-shake 0.4s ease-out;
          background: linear-gradient(180deg, #FECACA 0%, #FCA5A5 100%) !important;
        }
        .tile-appear {
          animation: tile-appear 0.4s ease-out forwards;
        }
        .wood-bg {
          background: linear-gradient(135deg, ${COLORS.wood} 0%, ${COLORS.woodDark} 50%, ${COLORS.wood} 100%);
          background-size: 200px 200px;
        }
        .sparkle {
          animation: sparkle 0.6s ease-out forwards;
        }
      `}</style>
      
      <div className="min-h-screen wood-bg flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
              <span className="text-sm opacity-80">Level</span>{' '}
              <span className="font-bold">{currentRound}/{settings.totalRounds}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
              <span className="text-sm opacity-80">Time</span>{' '}
              <span className={`font-bold ${timeRemaining <= 10 ? 'text-red-300' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
              <span className="text-sm opacity-80">Score</span>{' '}
              <span className="font-bold">{score}</span>
            </div>
          </div>
          <div className="text-white text-sm opacity-80">
            Difficulty: <span className="font-bold">{difficulty}</span>
          </div>
        </div>
        {showInstruction && (
          <div className="text-center px-4 py-2">
            <p className={`text-lg md:text-xl font-medium italic transition-colors ${
              feedbackState === 'correct' ? 'text-green-200' : 
              feedbackState === 'wrong' ? 'text-red-200' : 
              'text-white'
            }`}>
              {currentInstruction}
            </p>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {tiles.map((tile, index) => (
              <div
                key={`${currentRound}-${tile.id}`}
                onClick={() => handleTileClick(index)}
                className={`
                  relative cursor-pointer rounded-xl shadow-lg transition-all duration-200 tile-appear
                  ${selectedTiles.includes(index) ? 'tile-selected' : 'hover:scale-105'}
                  ${feedbackState === 'correct' && selectedTiles.includes(index) ? 'tile-correct' : ''}
                  ${feedbackState === 'wrong' && selectedTiles.includes(index) ? 'tile-wrong' : ''}
                `}
                style={{
                  width: 'clamp(100px, 25vw, 160px)',
                  height: 'clamp(100px, 25vw, 160px)',
                  background: selectedTiles.includes(index) 
                    ? 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)' 
                    : 'linear-gradient(180deg, #F5F0E6 0%, #E8E0D0 100%)',
                  boxShadow: selectedTiles.includes(index) 
                    ? '0 8px 25px rgba(255,107,62,0.4)' 
                    : '0 4px 12px rgba(0,0,0,0.3)',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {selectedTiles.includes(index) && (
                  <div 
                    className="absolute inset-0 rounded-xl border-4 pointer-events-none"
                    style={{ 
                      borderColor: feedbackState === 'correct' ? '#22C55E' : 
                                  feedbackState === 'wrong' ? '#EF4444' : 
                                  COLORS.orange 
                    }}
                  />
                )}
                
                <div 
                  className="absolute inset-3 grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${settings.gridSize}, 1fr)`,
                  }}
                >
                  {tile.pattern.flat().map((colorIndex, cellIndex) => (
                    <div
                      key={cellIndex}
                      className="rounded-full transition-transform duration-200"
                      style={{
                        backgroundColor: TILE_COLORS[colorIndex],
                        transform: selectedTiles.includes(index) ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
 
                {feedbackState === 'correct' && selectedTiles.includes(index) && (
                  <>
                    <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-300 rounded-full sparkle" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full sparkle" style={{ animationDelay: '0.1s' }} />
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-yellow-300 rounded-full sparkle" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-300 rounded-full sparkle" style={{ animationDelay: '0.15s' }} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
 
  if (gameState === 'ready') {
    if (checkingDailyGame) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div>Loading...</div>
        </div>
      );
    }
    const difficulties = [
      { key: 'Easy', label: 'Easy', desc: '180s · 4×4', emoji: '🟢', color: '#22C55E' },
      { key: 'Moderate', label: 'Moderate', desc: '150s · 4×4', emoji: '🟡', color: '#EAB308' },
      { key: 'Hard', label: 'Hard', desc: '120s · 5×5', emoji: '🔴', color: '#EF4444' },
    ];
    const availableDifficulties = isDailyGame && dailyGameDifficulty ? difficulties.filter((d) => d.key === dailyGameDifficulty) : difficulties;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          aria-label="How to Play"
          style={{
            position: 'absolute', top: 16, right: 16,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 12,
            border: '2px solid rgba(255,107,62,0.6)', background: 'rgba(255,107,62,0.15)',
            color: '#FF6B3E', cursor: 'pointer', fontSize: 15, fontWeight: 700,
            transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,107,62,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,107,62,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,107,62,0.15)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          <span style={{ fontSize: 18 }} aria-hidden>📖</span>
          How to Play
        </button>
        {showInstructions && (
          <div role="dialog" aria-modal="true" aria-labelledby="pattern-match-instructions-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }} onClick={closeInstructions}>
            <div style={{ background: 'linear-gradient(180deg, #1e1e2e 0%, #0f1629 100%)', border: '2px solid rgba(255,107,62,0.5)', borderRadius: 20, padding: 0, maxWidth: 480, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', color: '#e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <h2 id="pattern-match-instructions-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#FF6B3E' }}>Pattern Match – How to Play</h2>
                <button type="button" onClick={closeInstructions} aria-label="Close" style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 22, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <div style={{ padding: 20, overflowY: 'auto', flex: 1, minHeight: 0 }}>{instructionsModalContent}</div>
              <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                <button type="button" onClick={closeInstructions} style={{ width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6B3E, #e55a2b)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,62,0.4)' }}>Got it</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧩</div>
        <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 800, margin: '0 0 6px', letterSpacing: -1, textShadow: '0 0 40px rgba(255,107,62,0.4)' }}>Pattern Match</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 8px' }}>Find the 2 matching tiles among 4 in each round!</p>
        {isDailyGame && (
          <div style={{ marginBottom: 20, padding: '6px 16px', background: 'rgba(255,107,62,0.2)', border: '1px solid rgba(255,107,62,0.5)', borderRadius: 20, fontSize: 13, color: '#FF6B3E', fontWeight: 600 }}>Daily Challenge</div>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {availableDifficulties.map((d) => (
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
                color: '#fff',
              }}
              onMouseEnter={(e) => { if (!isDailyGame) { e.currentTarget.style.background = `${d.color}22`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${d.color}88`; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = (isDailyGame ? d.key === dailyGameDifficulty : difficulty === d.key) ? `${d.color}22` : 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${d.color}44`; }}
            >
              <span style={{ fontSize: 32 }}>{d.emoji}</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{d.label}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>{d.desc}</span>
            </button>
          ))}
        </div>
        <button onClick={handleStart} style={{ marginTop: 20, padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #FF6B3E, #e55a2b)', color: '#fff', boxShadow: '0 4px 20px rgba(255,107,62,0.4)' }}>Start Game</button>
      </div>
    );
  }

  const c = completionData || {};
  const timeElapsedForModal = c.timeElapsed ?? (gameState === 'finished' ? settings.time : settings.time - timeRemaining);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        {playingContent}
        {gameState === 'playing' && (
          <button onClick={handleReset} style={{ position: 'absolute', top: 12, left: 12, padding: '8px 16px', borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, zIndex: 20 }}>Menu</button>
        )}
      </div>
      {gameState === 'finished' && completionData != null && (
        <GameCompletionModal
          isVisible
          onClose={handleReset}
          gameTitle="Pattern Match"
          score={c.score}
          timeElapsed={timeElapsedForModal}
          gameTimeLimit={settings.time}
          isVictory={c.isVictory}
          difficulty={c.difficulty}
          customMessages={{ maxScore: MAX_SCORE }}
        />
      )}
    </>
  );
};
 
export default PatternMatchGame;
