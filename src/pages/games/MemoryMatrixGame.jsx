import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, RotateCcw, Eye, Brain, Zap, Volume2, VolumeX } from 'lucide-react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

// Audio system using Web Audio API
const createAudioContext = () => {
  if (typeof window !== 'undefined') {
    return new (window.AudioContext || window.webkitAudioContext)();
  }
  return null;
};

const playTone = (audioContext, frequency, duration, type = 'sine', volume = 0.3) => {
  if (!audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.log('Audio playback failed:', e);
  }
};

const playClickSound = (audioContext) => {
  playTone(audioContext, 440, 0.1, 'sine', 0.2);
};

const playShowTileSound = (audioContext, index) => {
  const baseFreq = 300 + (index * 50);
  playTone(audioContext, baseFreq, 0.15, 'sine', 0.15);
};

const playCorrectSound = (audioContext) => {
  if (!audioContext) return;
  setTimeout(() => playTone(audioContext, 523, 0.15, 'sine', 0.25), 0);
  setTimeout(() => playTone(audioContext, 659, 0.15, 'sine', 0.25), 100);
  setTimeout(() => playTone(audioContext, 784, 0.2, 'sine', 0.3), 200);
};

const playWrongSound = (audioContext) => {
  if (!audioContext) return;
  playTone(audioContext, 200, 0.3, 'sawtooth', 0.2);
  setTimeout(() => playTone(audioContext, 150, 0.3, 'sawtooth', 0.15), 150);
};

const playGameStartSound = (audioContext) => {
  if (!audioContext) return;
  setTimeout(() => playTone(audioContext, 392, 0.1, 'sine', 0.2), 0);
  setTimeout(() => playTone(audioContext, 523, 0.1, 'sine', 0.2), 100);
  setTimeout(() => playTone(audioContext, 659, 0.15, 'sine', 0.25), 200);
};

const playGameOverSound = (audioContext) => {
  if (!audioContext) return;
  setTimeout(() => playTone(audioContext, 659, 0.2, 'sine', 0.25), 0);
  setTimeout(() => playTone(audioContext, 523, 0.2, 'sine', 0.25), 200);
  setTimeout(() => playTone(audioContext, 392, 0.3, 'sine', 0.3), 400);
};

const DIFFICULTY_SETTINGS = {
  Easy: { gridSize: 3, patternSize: 3, showTime: 2000, rounds: 8, timeLimit: 120 },
  Moderate: { gridSize: 4, patternSize: 5, showTime: 1500, rounds: 10, timeLimit: 150 },
  Hard: { gridSize: 5, patternSize: 7, showTime: 1000, rounds: 12, timeLimit: 180 },
};

const MemoryMatrix = () => {
  const audioContextRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [pattern, setPattern] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [correctTiles, setCorrectTiles] = useState([]);
  const [wrongTiles, setWrongTiles] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const totalTiles = settings.gridSize * settings.gridSize;

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playSound = useCallback((soundFn) => {
    if (soundEnabled && audioContextRef.current) {
      soundFn(audioContextRef.current);
    }
  }, [soundEnabled]);

  // Generate random pattern
  const generatePattern = useCallback(() => {
    const indices = [];
    while (indices.length < settings.patternSize) {
      const randomIndex = Math.floor(Math.random() * totalTiles);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    return indices;
  }, [settings.patternSize, totalTiles]);

  // Start new round
  const startNewRound = useCallback(() => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    setSelectedTiles([]);
    setCorrectTiles([]);
    setWrongTiles([]);
    setGameState('showing');
    
    // Play show tile sounds with delay
    if (soundEnabled && audioContextRef.current) {
      newPattern.forEach((_, i) => {
        setTimeout(() => {
          playShowTileSound(audioContextRef.current, i);
        }, i * 100);
      });
    }
    
    // Hide pattern after show time
    setTimeout(() => {
      setGameState('playing');
    }, settings.showTime);
  }, [generatePattern, settings.showTime, soundEnabled]);

  // Start game
  const handleStart = () => {
    initAudio();
    playSound(playGameStartSound);
    setScore(0);
    setRound(1);
    setStreak(0);
    setTimeRemaining(settings.timeLimit);
    setStartTime(Date.now());
    startNewRound();
  };

  // Reset game
  const handleReset = () => {
    setGameState('ready');
    setScore(0);
    setRound(1);
    setStreak(0);
    setPattern([]);
    setSelectedTiles([]);
    setCorrectTiles([]);
    setWrongTiles([]);
    setTimeRemaining(settings.timeLimit);
    setStartTime(null);
  };

  // Handle tile click
  const handleTileClick = (index) => {
    if (gameState !== 'playing') return;
    if (selectedTiles.includes(index)) return;
    
    playSound(playClickSound);
    const newSelected = [...selectedTiles, index];
    setSelectedTiles(newSelected);
    
    // Check if we've selected enough tiles
    if (newSelected.length === settings.patternSize) {
      checkAnswer(newSelected);
    }
  };

  // Check answer
  const checkAnswer = (selected) => {
    setGameState('checking');
    
    const correct = selected.filter(tile => pattern.includes(tile));
    const wrong = selected.filter(tile => !pattern.includes(tile));
    
    setCorrectTiles(correct);
    setWrongTiles(wrong);
    
    const accuracy = correct.length / settings.patternSize;
    const isSuccess = accuracy >= 0.8; // 80% threshold
    
    if (isSuccess) {
      playSound(playCorrectSound);
      const roundScore = Math.round((accuracy * 20) + (streak * 2));
      setScore(prev => Math.min(200, prev + roundScore));
      setStreak(prev => prev + 1);
      setShowFeedback('correct');
    } else {
      playSound(playWrongSound);
      setStreak(0);
      setShowFeedback('wrong');
    }
    
    // Move to next round or finish
    setTimeout(() => {
      setShowFeedback(null);
      if (round >= settings.rounds) {
        playSound(playGameOverSound);
        setGameState('finished');
      } else {
        setRound(prev => prev + 1);
        startNewRound();
      }
    }, 1500);
  };

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'showing') return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  // Calculate dynamic cell size
  const cellSize = useMemo(() => {
    const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5);
    return Math.floor(maxSize / settings.gridSize) - 8;
  }, [settings.gridSize]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Memorize the pattern of highlighted tiles and recreate it accurately to train your spatial memory.
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Watch the highlighted tiles carefully</li>
          <li>• Memorize their positions</li>
          <li>• Tap the tiles you remember</li>
          <li>• Get 80%+ correct to score points</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Points based on accuracy (80%+ needed)</li>
          <li>• Streak bonus for consecutive rounds</li>
          <li>• Maximum score: 200 points</li>
          <li>• Complete all rounds for best score</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Strategy
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use visual patterns and shapes</li>
          <li>• Create mental landmarks</li>
          <li>• Focus on corners and edges first</li>
          <li>• Practice improves spatial memory</li>
        </ul>
      </div>
    </div>
  );

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-stone-400 bg-stone-700/50 border-stone-600';
    }
  };

  // Render grid
  const renderGrid = () => {
    const tiles = [];
    for (let i = 0; i < totalTiles; i++) {
      const isPattern = pattern.includes(i);
      const isSelected = selectedTiles.includes(i);
      const isCorrect = correctTiles.includes(i);
      const isWrong = wrongTiles.includes(i);
      const showPattern = gameState === 'showing' && isPattern;
      
      let tileClass = 'transition-all duration-200 rounded-lg border-2 ';
      
      if (showPattern) {
        tileClass += 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-lg shadow-orange-500/50 scale-105';
      } else if (isCorrect) {
        tileClass += 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-lg shadow-green-500/50';
      } else if (isWrong) {
        tileClass += 'bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-lg shadow-red-500/50 animate-shake';
      } else if (isSelected) {
        tileClass += 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-lg shadow-blue-500/30';
      } else {
        tileClass += 'bg-gradient-to-br from-stone-600 to-stone-700 border-stone-500/50 hover:from-stone-500 hover:to-stone-600 hover:border-stone-400/50 cursor-pointer';
      }
      
      tiles.push(
        <button
          key={i}
          onClick={() => handleTileClick(i)}
          disabled={gameState !== 'playing'}
          className={tileClass}
          style={{
            width: `${cellSize}px`,
            height: `${cellSize}px`,
          }}
        />
      );
    }
    return tiles;
  };

  const playingContent = (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 relative overflow-hidden">
      {/* Beautiful gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-indigo-50/30" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Stats Bar */}
        <div className="flex items-center justify-between w-full max-w-md mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 shadow-lg">
              <div className="text-xs text-gray-600">Round</div>
              <div className="text-lg font-bold text-gray-800">{round}/{settings.rounds}</div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 shadow-lg">
              <div className="text-xs text-gray-600">Score</div>
              <div className="text-lg font-bold text-orange-600">{Math.round(score)}/200</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {streak > 1 && (
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 backdrop-blur-sm rounded-lg px-3 py-2 border border-orange-200 flex items-center gap-1 shadow-lg">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-orange-600 font-bold">{streak}x</span>
              </div>
            )}
            <div className={`bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border shadow-lg ${
              timeRemaining <= 10 ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}>
              <div className="text-xs text-gray-600">Time</div>
              <div className={`text-lg font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-800'}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Phase Indicator */}
        <div className="mb-6">
          {gameState === 'showing' && (
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-4 py-2 rounded-full border border-orange-200 flex items-center gap-2 animate-pulse shadow-lg">
              <Eye className="h-4 w-4" />
              Memorize the pattern!
            </div>
          )}
          {gameState === 'playing' && (
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full border border-blue-200 shadow-lg">
              Select {settings.patternSize - selectedTiles.length} more tiles
            </div>
          )}
          {gameState === 'checking' && showFeedback === 'correct' && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full border border-green-200 animate-bounce shadow-lg">
              ✓ Correct!
            </div>
          )}
          {gameState === 'checking' && showFeedback === 'wrong' && (
            <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-4 py-2 rounded-full border border-red-200 shadow-lg">
              ✗ Try again!
            </div>
          )}
        </div>
        
        {/* Game Grid */}
        <div 
          className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-700 shadow-2xl"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${settings.gridSize}, ${cellSize}px)`,
            gap: '8px',
          }}
        >
          {renderGrid()}
        </div>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Memory Matrix"
      gameShortDescription="Train your spatial recall by remembering and recreating tile patterns. Watch carefully, memorize, and recreate!"
      category="Memory"
      gameState={gameState}
      setGameState={setGameState}
      score={Math.round(score)}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{ round, streak, selectedTiles: selectedTiles.length, patternSize: settings.patternSize }}
      enableCompletionModal={true}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
};

export default MemoryMatrix;
