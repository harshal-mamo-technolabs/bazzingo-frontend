import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const MirrorMatchGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [originalPattern, setOriginalPattern] = useState(null);
  const [options, setOptions] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Professional asymmetric pattern definitions for clear mirror differences
  const patterns = [
    {
      id: 'l_shape',
      name: 'L-Shape',
      icon: '⌐',
      color: '#2563EB',
      gradient: 'from-blue-600 via-blue-700 to-blue-800',
      grid: [
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1]
      ]
    },
    {
      id: 'arrow_right',
      name: 'Arrow Right',
      icon: '►',
      color: '#059669',
      gradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
      grid: [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 1, 0],
        [0, 0, 1, 0, 0]
      ]
    },
    {
      id: 'step_pattern',
      name: 'Step Pattern',
      icon: '⌊',
      color: '#DC2626',
      gradient: 'from-red-600 via-red-700 to-red-800',
      grid: [
        [1, 1, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 1, 1, 1]
      ]
    },
    {
      id: 'flag_pattern',
      name: 'Flag Pattern',
      icon: '⚑',
      color: '#7C3AED',
      gradient: 'from-violet-600 via-violet-700 to-violet-800',
      grid: [
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0],
        [1, 1, 0, 0, 0],
        [1, 0, 0, 0, 0]
      ]
    },
    {
      id: 'corner_pattern',
      name: 'Corner Pattern',
      icon: '⌜',
      color: '#EA580C',
      gradient: 'from-orange-600 via-orange-700 to-orange-800',
      grid: [
        [1, 1, 1, 0, 0],
        [1, 0, 1, 0, 0],
        [1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
      ]
    },
    {
      id: 'diagonal_pattern',
      name: 'Diagonal Pattern',
      icon: '⟋',
      color: '#0891B2',
      gradient: 'from-cyan-600 via-cyan-700 to-cyan-800',
      grid: [
        [1, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1]
      ]
    }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: { optionsCount: 3, timeLimit: 60, includeRotations: false },
    Moderate: { optionsCount: 4, timeLimit: 50, includeRotations: false },
    Hard: { optionsCount: 4, timeLimit: 40, includeRotations: true }
  };

  // Create professional particle effect
  const createParticleEffect = useCallback((isCorrect) => {
    const particleCount = isCorrect ? 8 : 4;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
      color: isCorrect ? '#10B981' : '#EF4444',
      symbol: isCorrect ? '●' : '×'
    }));

    setSparkles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newParticles.find(ns => ns.id === s.id)));
    }, 1500);
  }, []);

  // Mirror pattern horizontally
  const mirrorHorizontal = (grid) => {
    return grid.map(row => [...row].reverse());
  };

  // Mirror pattern vertically
  const mirrorVertical = (grid) => {
    return [...grid].reverse();
  };

  // Rotate pattern 90 degrees clockwise
  const rotate90 = (grid) => {
    const size = grid.length;
    const rotated = Array(size).fill().map(() => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        rotated[j][size - 1 - i] = grid[i][j];
      }
    }

    return rotated;
  };

  // Check if two grids are identical
  const gridsAreEqual = (grid1, grid2) => {
    if (grid1.length !== grid2.length) return false;

    for (let i = 0; i < grid1.length; i++) {
      if (grid1[i].length !== grid2[i].length) return false;
      for (let j = 0; j < grid1[i].length; j++) {
        if (grid1[i][j] !== grid2[i][j]) return false;
      }
    }

    return true;
  };



  // Generate new round with guaranteed different options
  const generateNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];

    // Select random pattern
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    setOriginalPattern(randomPattern);

    // Generate correct mirror (horizontal mirror)
    const correctMirror = mirrorHorizontal(randomPattern.grid);

    // Generate all possible wrong options
    const allWrongOptions = [
      {
        id: 'vertical-mirror',
        grid: mirrorVertical(randomPattern.grid),
        isCorrect: false,
        type: 'Vertical Mirror'
      },
      {
        id: 'original',
        grid: randomPattern.grid,
        isCorrect: false,
        type: 'Original'
      },
      {
        id: 'rotated-90',
        grid: rotate90(randomPattern.grid),
        isCorrect: false,
        type: '90° Rotation'
      },
      {
        id: 'rotated-180',
        grid: rotate90(rotate90(randomPattern.grid)),
        isCorrect: false,
        type: '180° Rotation'
      },
      {
        id: 'rotated-270',
        grid: rotate90(rotate90(rotate90(randomPattern.grid))),
        isCorrect: false,
        type: '270° Rotation'
      },
      {
        id: 'rotated-mirror',
        grid: rotate90(correctMirror),
        isCorrect: false,
        type: 'Rotated Mirror'
      }
    ];

    // Filter out options that are identical to the correct answer
    const validWrongOptions = allWrongOptions.filter(option => {
      return !gridsAreEqual(option.grid, correctMirror);
    });

    // Shuffle and select the required number of wrong options
    const shuffledWrong = validWrongOptions.sort(() => Math.random() - 0.5);
    const selectedWrong = shuffledWrong.slice(0, settings.optionsCount - 1);

    // Add correct option
    const allOptions = [
      { id: 'correct-mirror', grid: correctMirror, isCorrect: true, type: 'Horizontal Mirror' },
      ...selectedWrong
    ].sort(() => Math.random() - 0.5);

    setOptions(allOptions);
    setSelectedOption(null);
    setShowResult(false);
  }, [difficulty]);

  // Handle option selection
  const handleOptionSelect = useCallback((selectedOption) => {
    if (gameState !== 'playing' || showResult) return;

    setSelectedOption(selectedOption);
    setAttempts(prev => prev + 1);
    setShowResult(true);

    if (selectedOption.isCorrect) {
      setCorrectMatches(prev => prev + 1);
      createParticleEffect(true);
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    } else {
      setErrors(prev => prev + 1);
      createParticleEffect(false);
    }

    // Generate next round after delay
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      generateNewRound();
    }, 2500);
  }, [gameState, showResult, createParticleEffect, generateNewRound]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setAttempts(0);
    setErrors(0);
    setCorrectMatches(0);
    setCurrentRound(1);
    setScore(0);
    setTimeRemaining(difficultySettings[difficulty].timeLimit);
    setSparkles([]);
    setPulseEffect(false);
  }, [difficulty]);

  // Calculate score using Spatial formula
  useEffect(() => {
    if (attempts > 0) {
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;

      let newScore = 200 - (errors * 15 + timeUsed * 0.8);
      newScore = Math.max(0, Math.min(200, newScore));

      setScore(newScore);
    }
  }, [attempts, errors, timeRemaining, difficulty]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  const handleStart = () => {
    initializeGame();
    generateNewRound();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    attempts,
    errors,
    time: difficultySettings[difficulty].timeLimit - timeRemaining
  };

  // Render beautiful grid pattern
  const renderGrid = (grid, pattern, size = 'normal', isSelected = false, isCorrect = null) => {
    const cellSize = size === 'large' ? 'w-10 h-10' : size === 'small' ? 'w-6 h-6' : 'w-8 h-8';
    const containerClass = size === 'large' ? 'p-6' : size === 'small' ? 'p-2' : 'p-4';

    let containerStyle = `${containerClass} rounded-2xl border-4 transition-all duration-500 transform-gpu`;

    if (isSelected && isCorrect !== null) {
      if (isCorrect) {
        containerStyle += ' border-green-400 bg-gradient-to-br from-green-50 to-emerald-100 shadow-2xl shadow-green-500/50 scale-105 ring-4 ring-green-300 ring-opacity-75';
      } else {
        containerStyle += ' border-red-400 bg-gradient-to-br from-red-50 to-rose-100 shadow-2xl shadow-red-500/50 scale-95 ring-4 ring-red-300 ring-opacity-75';
      }
    } else {
      containerStyle += ' border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 hover:shadow-xl hover:scale-105';
    }

    return (
      <div className={containerStyle}>
        <div className="grid grid-cols-5 gap-1">
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`${cellSize} rounded-lg border transition-all duration-300 ${cell
                  ? `bg-gradient-to-br ${pattern?.gradient || 'from-blue-400 to-blue-600'} border-white shadow-lg`
                  : 'bg-gray-100 border-gray-200'
                  }`}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header unreadCount={3} />

      {/* Professional Particle Effects */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {sparkles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-ping font-bold"
            style={{
              left: particle.x,
              top: particle.y,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              color: particle.color,
              fontSize: '28px'
            }}
          >
            {particle.symbol}
          </div>
        ))}
      </div>

      <GameFramework
        gameTitle="Mirror Match"
        gameDescription="Find the perfect horizontal mirror reflection of the beautiful pattern!"
        category="Spatial Awareness"
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        {/* Game Content */}
        <div className="flex flex-col items-center">
          {/* Enhanced Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs font-bold text-blue-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 ROUND
              </div>
              <div className="text-3xl font-black text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentRound}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-2xl p-4 shadow-xl border-2 border-green-200">
              <div className="text-xs font-bold text-green-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ✅ CORRECT
              </div>
              <div className="text-3xl font-black text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctMatches}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-red-50 via-rose-50 to-red-100 rounded-2xl p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs font-bold text-red-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ❌ ERRORS
              </div>
              <div className="text-3xl font-black text-red-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {errors}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs font-bold text-purple-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 ACCURACY
              </div>
              <div className="text-3xl font-black text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {attempts > 0 ? Math.round((correctMatches / attempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Original Pattern Display */}
          {originalPattern && (
            <div className={`mb-8 text-center transition-all duration-1000 ${pulseEffect ? 'animate-pulse scale-110' : ''}`}>
              <div className="mb-4">
                <div className="inline-flex items-center gap-4 bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 text-white px-8 py-4 rounded-xl shadow-2xl border border-slate-600">
                  <span className="text-3xl font-bold">{originalPattern.icon}</span>
                  <div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      SOURCE PATTERN
                    </div>
                    <div className="text-sm opacity-90 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {originalPattern.name}
                    </div>
                  </div>
                  <span className="text-3xl font-bold">{originalPattern.icon}</span>
                </div>
              </div>
              <div className="inline-block">
                {renderGrid(originalPattern.grid, originalPattern, 'large')}
              </div>
            </div>
          )}

          {/* Mirror Line Indicator */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="text-slate-700 font-bold text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>SOURCE</div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-1 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full shadow-lg"></div>
                <div className="text-slate-800 font-bold text-sm mt-1 px-3 py-1 bg-slate-200 rounded-full" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  ⟷ MIRROR AXIS
                </div>
                <div className="w-20 h-1 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full shadow-lg mt-1"></div>
              </div>
              <div className="text-slate-700 font-bold text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>REFLECTION</div>
            </div>
            <div className="bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 px-8 py-4 rounded-xl border-2 border-slate-300 shadow-lg">
              <div className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ⚡ IDENTIFY THE HORIZONTAL MIRROR REFLECTION
              </div>
            </div>
          </div>

          {/* Options Grid */}
          <div className={`grid gap-6 mb-8 ${difficultySettings[difficulty].optionsCount === 3 ? 'grid-cols-3' : 'grid-cols-2'} max-w-4xl`}>
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={showResult}
                className="transform transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="mb-3">
                    {renderGrid(
                      option.grid,
                      originalPattern,
                      'normal',
                      selectedOption?.id === option.id,
                      selectedOption?.id === option.id ? option.isCorrect : null
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-gray-200">
                    <div className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Option {index + 1}
                    </div>
                    {showResult && selectedOption?.id === option.id && (
                      <div className={`text-sm font-semibold mt-1 ${option.isCorrect ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {option.isCorrect ? '✅ Correct!' : `❌ ${option.type}`}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Professional Instructions */}
          <div className="text-center max-w-5xl">
            <div className="p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-2xl shadow-2xl border-2 border-slate-300">
              <div className="text-3xl font-bold text-slate-800 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ⚡ SPATIAL REASONING CHALLENGE
              </div>
              <p className="text-lg text-slate-700 leading-relaxed mb-8" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Analyze the source pattern above and identify its precise <span className="font-bold text-slate-900 bg-yellow-200 px-2 py-1 rounded">horizontal mirror reflection</span>.
                Visualize folding the pattern along a vertical axis - which option represents the exact mirrored transformation?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-blue-300 hover:border-blue-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-blue-600">◆</div>
                  <div className="font-bold text-blue-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>PRECISION ANALYSIS</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>Examine each cell position for exact horizontal mirror correspondence</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-emerald-300 hover:border-emerald-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-emerald-600">⟷</div>
                  <div className="font-bold text-emerald-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>SPATIAL TRANSFORMATION</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>Apply left-to-right reflection across the vertical mirror axis</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-orange-600">⚠</div>
                  <div className="font-bold text-orange-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>ELIMINATE DECOYS</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>Distinguish from rotations, vertical mirrors, and original patterns</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default MirrorMatchGame;
