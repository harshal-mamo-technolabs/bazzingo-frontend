import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2.jsx';

const COLORS = {
  orange: '#FF6B3E',
  gray: '#6B7280',
  cream: '#F5F5DC',
  white: '#FFFFFF',
  wood: '#C4884A',
  woodDark: '#A0522D',
};

const TILE_COLORS = [COLORS.orange, COLORS.gray, COLORS.cream];

const difficultySettings = {
  'Easy': { time: 180, totalRounds: 10, gridSize: 4, pointsPerMatch: 20 },
  'Moderate': { time: 150, totalRounds: 10, gridSize: 4, pointsPerMatch: 20 },
  'Hard': { time: 120, totalRounds: 10, gridSize: 5, pointsPerMatch: 20 },
};

const PatternMatchGame = () => {
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
  
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

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
  }, [settings, generateRoundTiles]);

  // Reset game
  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('ready');
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
      setGameState('finished');
    } else {
      setCurrentRound(prev => prev + 1);
      setTiles(generateRoundTiles());
      setSelectedTiles([]);
      setFeedbackState('none');
      setIsProcessing(false);
    }
  }, [currentRound, settings.totalRounds, generateRoundTiles, playSound]);

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
    if (gameState === 'playing' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            playSound('complete');
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, playSound]);

  useEffect(() => {
    if (gameState === 'playing' && score >= 200) {
      setGameState('finished');
    }
  }, [gameState, score]);
 
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
 
  const instructionsSection = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
      <div className="bg-white rounded-lg p-3">
        <div className="text-sm font-semibold text-blue-900">Rules</div>
        <ul className="text-sm text-blue-700 space-y-1 mt-2">
          <li>• Select exactly 2 tiles per round</li>
          <li>• Matching pair awards points; non-matching deducts</li>
          <li>• Ends on time out, 200 score, or all rounds</li>
        </ul>
      </div>
      <div className="bg-white rounded-lg p-3">
        <div className="text-sm font-semibold text-blue-900">Scoring</div>
        <ul className="text-sm text-blue-700 space-y-1 mt-2">
          <li>• Correct pair: +20 points</li>
          <li>• Wrong pair: -10 points (min 0)</li>
          <li>• Max score: 200</li>
        </ul>
      </div>
      <div className="bg-white rounded-lg p-3">
        <div className="text-sm font-semibold text-blue-900">Levels</div>
        <ul className="text-sm text-blue-700 space-y-1 mt-2">
          <li>• {settings.totalRounds} rounds total</li>
          <li>• Level increases after each attempt</li>
          <li>• Grid size: {settings.gridSize}×{settings.gridSize}</li>
        </ul>
      </div>
      <div className="bg-white rounded-lg p-3">
        <div className="text-sm font-semibold text-blue-900">Difficulty</div>
        <ul className="text-sm text-blue-700 space-y-1 mt-2">
          <li>• Easy: 180s, 4×4</li>
          <li>• Moderate: 150s, 4×4</li>
          <li>• Hard: 120s, 5×5</li>
        </ul>
      </div>
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
 
  const accuracy = (correctMatches + wrongAttempts) > 0
    ? Math.round((correctMatches / (correctMatches + wrongAttempts)) * 100)
    : 0;
 
  return (
    <GameFrameworkV2
      gameTitle="Pattern Match"
      gameShortDescription={`Find the 2 matching tiles among 4 tiles in each round. Complete ${settings.totalRounds} rounds!`}
      category="Pattern Recognition"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{
        correctMatches,
        wrongAttempts,
        roundsCompleted: Math.min(currentRound - 1, settings.totalRounds),
        totalRounds: settings.totalRounds,
        accuracy
      }}
      enableCompletionModal={true}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
};
 
export default PatternMatchGame;
