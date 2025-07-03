import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const CognitivePatternWeaverGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [difficulty, setDifficulty] = useState('Easy');

  // Game-specific state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [userPattern, setUserPattern] = useState([]);
  const [completedPatterns, setCompletedPatterns] = useState(0);
  const [correctPatterns, setCorrectPatterns] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [showPattern, setShowPattern] = useState(true);
  const [patternPhase, setPatternPhase] = useState('study'); // study, recreate, feedback

  // Pattern colors and shapes
  const colors = ['#FF6B3E', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
  const shapes = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon'];

  // Get difficulty configuration
  const getDifficultyConfig = useCallback(() => {
    const configs = {
      Easy: {
        gridSize: 4,
        patternLength: 4,
        studyTime: 4000,
        colors: 3,
        shapes: 2
      },
      Moderate: {
        gridSize: 5,
        patternLength: 6,
        studyTime: 3000,
        colors: 4,
        shapes: 3
      },
      Hard: {
        gridSize: 6,
        patternLength: 8,
        studyTime: 2500,
        colors: 5,
        shapes: 4
      }
    };
    return configs[difficulty];
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCurrentLevel(1);
    setCompletedPatterns(0);
    setCorrectPatterns(0);
    setStreakCount(0);
    setMaxStreak(0);
    setAccuracy(0);
    setUserPattern([]);
    setPatternPhase('study');
    setShowPattern(true);

    const initialTime = difficulty === 'Easy' ? 180 : difficulty === 'Moderate' ? 150 : 120;
    setTimeRemaining(initialTime);

    generateNewPattern();
  }, [difficulty]);

  // Generate new pattern
  const generateNewPattern = useCallback(() => {
    const config = getDifficultyConfig();
    const availableColors = colors.slice(0, config.colors);
    const availableShapes = shapes.slice(0, config.shapes);

    const pattern = [];
    for (let i = 0; i < config.patternLength; i++) {
      const row = Math.floor(Math.random() * config.gridSize);
      const col = Math.floor(Math.random() * config.gridSize);
      const color = availableColors[Math.floor(Math.random() * availableColors.length)];
      const shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];

      // Ensure no duplicate positions
      const position = `${row}-${col}`;
      if (!pattern.some(p => `${p.row}-${p.col}` === position)) {
        pattern.push({
          id: i,
          row,
          col,
          color,
          shape,
          order: i + 1
        });
      } else {
        i--; // Retry this iteration
      }
    }

    setCurrentPattern(pattern);
    setUserPattern([]);
    setPatternPhase('study');
    setShowPattern(true);

    // Hide pattern after study time
    setTimeout(() => {
      setShowPattern(false);
      setPatternPhase('recreate');
    }, config.studyTime);
  }, [getDifficultyConfig, colors, shapes]);

  // Handle cell click during recreation
  const handleCellClick = useCallback((row, col) => {
    if (patternPhase !== 'recreate' || !currentPattern) return;

    const config = getDifficultyConfig();
    const cellId = `${row}-${col}`;

    // Check if cell already selected
    if (userPattern.some(p => `${p.row}-${p.col}` === cellId)) return;

    // Find the correct pattern element for this position
    const correctElement = currentPattern.find(p => p.row === row && p.col === col);

    if (correctElement) {
      const newUserPattern = [...userPattern, {
        row,
        col,
        order: userPattern.length + 1,
        correctOrder: correctElement.order,
        color: correctElement.color,
        shape: correctElement.shape
      }];

      setUserPattern(newUserPattern);

      // Check if pattern is complete
      if (newUserPattern.length === currentPattern.length) {
        checkPatternCorrectness(newUserPattern);
      }
    }
  }, [patternPhase, currentPattern, userPattern, getDifficultyConfig]);

  // Check if recreated pattern is correct
  const checkPatternCorrectness = useCallback((userPat) => {
    if (!currentPattern) return;

    let isCorrect = true;
    let correctSequence = 0;

    // Check if positions and order are correct
    for (let i = 0; i < userPat.length; i++) {
      const userElement = userPat[i];
      const correctElement = currentPattern.find(p =>
        p.row === userElement.row && p.col === userElement.col
      );

      if (correctElement && correctElement.order === userElement.order) {
        correctSequence++;
      } else {
        isCorrect = false;
      }
    }

    setPatternPhase('feedback');
    setCompletedPatterns(prev => prev + 1);

    if (isCorrect) {
      setCorrectPatterns(prev => prev + 1);
      setStreakCount(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });

      // Calculate score
      const baseScore = 50;
      const difficultyMultiplier = difficulty === 'Easy' ? 1 : difficulty === 'Moderate' ? 1.5 : 2;
      const accuracyBonus = Math.floor((correctSequence / currentPattern.length) * 20);
      const streakBonus = Math.min(streakCount * 5, 25);
      const finalScore = Math.floor((baseScore + accuracyBonus + streakBonus) * difficultyMultiplier);

      setScore(prev => prev + finalScore);
    } else {
      setStreakCount(0);
    }

    // Update accuracy
    const newAccuracy = ((correctPatterns + (isCorrect ? 1 : 0)) / (completedPatterns + 1)) * 100;
    setAccuracy(newAccuracy);

    // Show feedback and generate next pattern
    setTimeout(() => {
      generateNewPattern();
    }, 2500);
  }, [currentPattern, correctPatterns, completedPatterns, streakCount, difficulty, generateNewPattern]);

  // Game timer
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

  // Level progression
  useEffect(() => {
    if (correctPatterns > 0 && correctPatterns % 5 === 0) {
      setCurrentLevel(prev => prev + 1);
    }
  }, [correctPatterns]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
    console.log('Cognitive Pattern Weaver completed:', payload);
  };

  const customStats = {
    currentLevel,
    completedPatterns,
    correctPatterns,
    accuracy: Math.round(accuracy),
    streakCount,
    maxStreak
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Cognitive Pattern Weaver"
        gameDescription="Master spatial memory and pattern recognition! Study complex patterns and recreate them from memory to test your visual-spatial intelligence."
        category="Pattern Recognition"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs sm:text-sm text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-emerald-200">
              <div className="text-xs sm:text-sm text-emerald-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Completed
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedPatterns}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs sm:text-sm text-purple-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Correct
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctPatterns}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-amber-200">
              <div className="text-xs sm:text-sm text-amber-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(accuracy)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streakCount}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-gray-200">
              <div className="text-xs sm:text-sm text-gray-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Max Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {maxStreak}
              </div>
            </div>
          </div>

          {/* Game Phase Indicator */}
          {gameState === 'playing' && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${patternPhase === 'study' ? 'bg-[#FF6B3E]' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>Study</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${patternPhase === 'recreate' ? 'bg-[#FF6B3E]' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>Recreate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${patternPhase === 'feedback' ? 'bg-[#FF6B3E]' : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>Feedback</span>
                </div>
              </div>
            </div>
          )}

          {/* Pattern Grid */}
          {gameState === 'playing' && currentPattern && (
            <div className="w-full max-w-2xl">
              {/* Phase Instructions */}
              <div className="mb-4 text-center">
                {patternPhase === 'study' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📚 Study Phase
                    </h3>
                    <p className="text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Memorize the pattern! Note the positions, colors, shapes, and sequence numbers.
                    </p>
                  </div>
                )}
                {patternPhase === 'recreate' && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Recreate Phase
                    </h3>
                    <p className="text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Click the grid cells in the same order as the original pattern!
                    </p>
                    <p className="text-sm text-green-600 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Progress: {userPattern.length}/{currentPattern.length}
                    </p>
                  </div>
                )}
                {patternPhase === 'feedback' && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      ✨ Feedback Phase
                    </h3>
                    <p className="text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {userPattern.length === currentPattern.length &&
                        userPattern.every((up, i) => {
                          const correct = currentPattern.find(cp => cp.row === up.row && cp.col === up.col);
                          return correct && correct.order === up.order;
                        }) ?
                        '🎉 Perfect! You recreated the pattern correctly!' :
                        '💡 Not quite right. Study the correct pattern and try again!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Grid Display */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <PatternGrid
                  currentPattern={currentPattern}
                  userPattern={userPattern}
                  showPattern={showPattern}
                  patternPhase={patternPhase}
                  onCellClick={handleCellClick}
                  gridSize={getDifficultyConfig().gridSize}
                />
              </div>
            </div>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🧩🎨</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Cognitive Pattern Weaver
                </h3>

                <div className="text-left space-y-6 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {/* What is this game */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">🎯 What is Cognitive Pattern Weaver?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Cognitive Pattern Weaver is an advanced spatial memory and pattern recognition game that challenges your
                      visual-spatial intelligence. You'll study complex patterns of colored shapes arranged on a grid, then
                      recreate them from memory in the exact same sequence. This game tests your ability to encode, store,
                      and recall spatial information while maintaining attention to detail.
                    </p>
                  </div>

                  {/* How to play */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">📋 How to Play:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <strong>Study Phase:</strong> A pattern of colored shapes appears on the grid with sequence numbers.
                          Memorize the positions, colors, shapes, and the order they should be clicked.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <strong>Memorize:</strong> Pay attention to each element's position, color, shape, and sequence number.
                          You have 2.5-4 seconds depending on difficulty level.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <strong>Recreate Phase:</strong> The pattern disappears. Click the grid cells in the exact same
                          order as shown in the original pattern.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <strong>Feedback:</strong> See if you got it right! Correct patterns earn points and build your streak.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty levels */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">⚡ Difficulty Levels:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-100 rounded-lg p-4">
                        <h5 className="font-semibold text-green-900 mb-2">🟢 Easy</h5>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• 4×4 grid</li>
                          <li>• 4 elements per pattern</li>
                          <li>• 4 seconds study time</li>
                          <li>• 3 colors, 2 shapes</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-100 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-900 mb-2">🟡 Moderate</h5>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• 5×5 grid</li>
                          <li>• 6 elements per pattern</li>
                          <li>• 3 seconds study time</li>
                          <li>• 4 colors, 3 shapes</li>
                        </ul>
                      </div>
                      <div className="bg-red-100 rounded-lg p-4">
                        <h5 className="font-semibold text-red-900 mb-2">🔴 Hard</h5>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• 6×6 grid</li>
                          <li>• 8 elements per pattern</li>
                          <li>• 2.5 seconds study time</li>
                          <li>• 5 colors, 4 shapes</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Scoring and tips */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">🏆 Scoring & Tips:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-purple-900 mb-2">Scoring System:</h5>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Base: 50 points per pattern</li>
                          <li>• Accuracy bonus: up to 20 points</li>
                          <li>• Streak bonus: up to 25 points</li>
                          <li>• Difficulty multiplier: 1x-2x</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-pink-900 mb-2">Pro Tips:</h5>
                        <ul className="text-sm text-pink-800 space-y-1">
                          <li>• Create mental associations</li>
                          <li>• Use spatial chunking</li>
                          <li>• Focus on sequence order</li>
                          <li>• Practice visual rehearsal</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Summary */}
          {gameState === 'finished' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Pattern Mastery Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Final Score</div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{score}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Patterns</div>
                    <div className="text-2xl font-bold text-green-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{completedPatterns}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Accuracy</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{Math.round(accuracy)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Max Streak</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{maxStreak}</div>
                  </div>
                </div>
                <div className="space-y-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>Spatial Memory Rating: {accuracy > 85 ? 'Exceptional' : accuracy > 70 ? 'Advanced' : accuracy > 55 ? 'Proficient' : 'Developing'}</div>
                  <div>Pattern Recognition Level: {currentLevel}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GameFramework>
    </div>
  );
};

// Pattern Grid Component
const PatternGrid = ({ currentPattern, userPattern, showPattern, patternPhase, onCellClick, gridSize }) => {
  const renderShape = (shape, color, size = 'w-8 h-8') => {
    const baseClasses = `${size} flex items-center justify-center`;

    switch (shape) {
      case 'circle':
        return <div className={`${baseClasses} rounded-full`} style={{ backgroundColor: color }}></div>;
      case 'square':
        return <div className={`${baseClasses} rounded-sm`} style={{ backgroundColor: color }}></div>;
      case 'triangle':
        return (
          <div className={baseClasses}>
            <div
              className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent"
              style={{ borderBottomColor: color }}
            ></div>
          </div>
        );
      case 'diamond':
        return (
          <div className={baseClasses}>
            <div
              className="w-6 h-6 transform rotate-45"
              style={{ backgroundColor: color }}
            ></div>
          </div>
        );
      case 'star':
        return (
          <div className={baseClasses}>
            <div className="text-2xl" style={{ color }}>★</div>
          </div>
        );
      case 'hexagon':
        return (
          <div className={baseClasses}>
            <div className="text-2xl" style={{ color }}>⬡</div>
          </div>
        );
      default:
        return <div className={`${baseClasses} rounded-full`} style={{ backgroundColor: color }}></div>;
    }
  };

  const getCellContent = (row, col) => {
    // During study phase, show the pattern with sequence numbers
    if (showPattern && patternPhase === 'study') {
      const patternElement = currentPattern.find(p => p.row === row && p.col === col);
      if (patternElement) {
        return (
          <div className="relative">
            {renderShape(patternElement.shape, patternElement.color)}
            <div className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-gray-300">
              {patternElement.order}
            </div>
          </div>
        );
      }
    }

    // During recreate phase, show user's selections
    if (patternPhase === 'recreate') {
      const userElement = userPattern.find(p => p.row === row && p.col === col);
      if (userElement) {
        return (
          <div className="relative">
            {renderShape(userElement.shape, userElement.color)}
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {userElement.order}
            </div>
          </div>
        );
      }
    }

    // During feedback phase, show both correct and user patterns
    if (patternPhase === 'feedback') {
      const patternElement = currentPattern.find(p => p.row === row && p.col === col);
      const userElement = userPattern.find(p => p.row === row && p.col === col);

      if (patternElement) {
        const isCorrect = userElement && userElement.order === patternElement.order;
        return (
          <div className="relative">
            {renderShape(patternElement.shape, patternElement.color)}
            <div className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}>
              {patternElement.order}
            </div>
            {!isCorrect && userElement && (
              <div className="absolute -bottom-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {userElement.order}
              </div>
            )}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="flex justify-center">
      <div
        className="grid gap-2 p-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          maxWidth: '400px'
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const cellContent = getCellContent(row, col);
          const isClickable = patternPhase === 'recreate' && !userPattern.some(p => p.row === row && p.col === col);

          return (
            <div
              key={`${row}-${col}`}
              className={`
                w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-lg flex items-center justify-center transition-all duration-200
                ${isClickable ? 'border-gray-300 hover:border-[#FF6B3E] hover:bg-orange-50 cursor-pointer' : 'border-gray-200'}
                ${cellContent ? 'bg-gray-50' : 'bg-white'}
              `}
              onClick={() => isClickable && onCellClick(row, col)}
            >
              {cellContent}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CognitivePatternWeaverGame;
