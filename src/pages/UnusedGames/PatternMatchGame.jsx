import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const PatternMatchGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [pattern, setPattern] = useState([]);
  const [playerPattern, setPlayerPattern] = useState([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gridSize, setGridSize] = useState(4);

  // Difficulty settings
  const difficultySettings = {
    Easy: { gridSize: 4, patternLength: 4, showTime: 3000, timeLimit: 60 },
    Moderate: { gridSize: 5, patternLength: 6, showTime: 2500, timeLimit: 50 },
    Hard: { gridSize: 6, patternLength: 8, showTime: 2000, timeLimit: 40 }
  };

  // Generate random pattern
  const generatePattern = useCallback((size, length) => {
    const totalCells = size * size;
    const pattern = [];
    const usedPositions = new Set();

    while (pattern.length < length) {
      const position = Math.floor(Math.random() * totalCells);
      if (!usedPositions.has(position)) {
        usedPositions.add(position);
        pattern.push(position);
      }
    }

    return pattern.sort((a, b) => a - b);
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setGridSize(settings.gridSize);
    setCurrentLevel(1);
    setCorrectMatches(0);
    setTotalAttempts(0);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setPattern([]);
    setPlayerPattern([]);
    setIsShowingPattern(false);
  }, [difficulty]);

  // Start new round
  const startNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const patternLength = Math.min(settings.patternLength + currentLevel - 1, settings.gridSize * settings.gridSize - 2);
    const newPattern = generatePattern(settings.gridSize, patternLength);

    setPattern(newPattern);
    setPlayerPattern([]);
    setIsShowingPattern(true);

    // Show pattern for specified time
    setTimeout(() => {
      setIsShowingPattern(false);
    }, settings.showTime);
  }, [difficulty, currentLevel, generatePattern]);

  // Handle cell click
  const handleCellClick = (position) => {
    if (gameState !== 'playing' || isShowingPattern) return;

    const newPlayerPattern = [...playerPattern];
    const index = newPlayerPattern.indexOf(position);

    if (index > -1) {
      // Remove if already selected
      newPlayerPattern.splice(index, 1);
    } else {
      // Add if not selected
      newPlayerPattern.push(position);
    }

    setPlayerPattern(newPlayerPattern);
  };

  // Submit pattern
  const submitPattern = () => {
    if (gameState !== 'playing' || isShowingPattern) return;

    setTotalAttempts(prev => prev + 1);

    // Check if patterns match
    const sortedPattern = [...pattern].sort((a, b) => a - b);
    const sortedPlayerPattern = [...playerPattern].sort((a, b) => a - b);

    const isCorrect = sortedPattern.length === sortedPlayerPattern.length &&
      sortedPattern.every((pos, index) => pos === sortedPlayerPattern[index]);

    if (isCorrect) {
      setCorrectMatches(prev => prev + 1);
      setCurrentLevel(prev => prev + 1);

      // Start next round after delay
      setTimeout(() => {
        startNewRound();
      }, 1000);
    } else {
      // Show correct pattern briefly, then start new round
      setTimeout(() => {
        startNewRound();
      }, 2000);
    }
  };

  // Calculate score
  useEffect(() => {
    if (totalAttempts > 0) {
      const accuracy = correctMatches / totalAttempts;
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;

      let newScore = accuracy * 200 - (timeUsed * 0.5);
      newScore = Math.max(0, Math.min(200, newScore));

      setScore(newScore);
    }
  }, [correctMatches, totalAttempts, timeRemaining, difficulty]);

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
    setTimeout(() => {
      startNewRound();
    }, 500);
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    correctMatches,
    totalAttempts,
    currentLevel
  };

  const getCellClass = (position) => {
    const isInPattern = pattern.includes(position);
    const isSelected = playerPattern.includes(position);
    const isShowing = isShowingPattern && isInPattern;

    if (isShowing) return 'bg-[#FF6B3E] border-[#FF6B3E]';
    if (isSelected) return 'bg-blue-200 border-blue-400';
    return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Pattern Match"
        gameDescription="Memorize the highlighted pattern and recreate it!"
        category="Memory"
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
          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Correct
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctMatches}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalAttempts > 0 ? Math.round((correctMatches / totalAttempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Status Display */}
          <div className="mb-6 text-center">
            {isShowingPattern && (
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Memorize this pattern...
              </div>
            )}
            {!isShowingPattern && pattern.length > 0 && (
              <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Recreate the pattern ({playerPattern.length}/{pattern.length})
              </div>
            )}
          </div>

          {/* Grid */}
          <div
            className="grid gap-2 mb-6 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              maxWidth: '320px'
            }}
          >
            {Array(gridSize * gridSize).fill().map((_, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={isShowingPattern}
                className={`
                  aspect-square border-2 rounded transition-all duration-200
                  ${getCellClass(index)}
                  ${isShowingPattern ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{
                  width: `${Math.min(60, 320 / gridSize)}px`,
                  height: `${Math.min(60, 320 / gridSize)}px`
                }}
              />
            ))}
          </div>

          {/* Submit Button */}
          {!isShowingPattern && pattern.length > 0 && (
            <button
              onClick={submitPattern}
              disabled={playerPattern.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${playerPattern.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#FF6B3E] text-white hover:bg-[#e55a35]'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Submit Pattern
            </button>
          )}

          {/* Instructions */}
          <div className="mt-6 text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              {isShowingPattern
                ? 'Watch carefully and memorize the highlighted cells.'
                : 'Click the cells to recreate the pattern you saw. Click again to deselect.'
              }
            </p>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default PatternMatchGame;
