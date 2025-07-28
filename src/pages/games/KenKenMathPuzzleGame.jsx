import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Plus, Target, Timer, Zap, Award, ChevronUp, ChevronDown, CheckCircle, Sparkles, TrendingUp, Flame } from 'lucide-react';

const KenKenMathPuzzleGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameDuration, setGameDuration] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Game-specific state
  const [grid, setGrid] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [currentSum, setCurrentSum] = useState(0);
  const [completedTargets, setCompletedTargets] = useState(0);
  const [totalTargets, setTotalTargets] = useState(10);
  const [targetsHistory, setTargetsHistory] = useState([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [particles, setParticles] = useState([]);
  const [lastScoreGain, setLastScoreGain] = useState(0);
  const [scoreAnimation, setScoreAnimation] = useState(0);

  const difficultySettings = {
    Easy: {
      timeLimit: 300, // 5 minutes
      gridSize: 4,
      maxHints: 5,
      numberRange: [1, 9],
      targetRange: [10, 20],
      targetsToComplete: 8,
      description: '4x4 grid with simple addition targets',
      scoreMultiplier: 0.8,
      color: 'from-green-400 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100'
    },
    Moderate: {
      timeLimit: 240, // 4 minutes
      gridSize: 5,
      maxHints: 3,
      numberRange: [1, 12],
      targetRange: [20, 35],
      targetsToComplete: 10,
      description: '5x5 grid with moderate addition targets',
      scoreMultiplier: 1.0,
      color: 'from-yellow-400 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100'
    },
    Hard: {
      timeLimit: 180, // 3 minutes
      gridSize: 6,
      maxHints: 2,
      numberRange: [1, 15],
      targetRange: [30, 50],
      targetsToComplete: 12,
      description: '6x6 grid with challenging addition targets',
      scoreMultiplier: 1.3,
      color: 'from-red-400 to-rose-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-100'
    }
  };

  // Particle system for visual feedback
  const createParticles = (type, count = 15) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10
        },
        life: 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const animateScore = (gain) => {
    setLastScoreGain(gain);
    setScoreAnimation(1);
    setTimeout(() => setScoreAnimation(0), 1000);
  };

  // Generate random grid numbers
  const generateGrid = useCallback((size, range) => {
    const newGrid = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push({
          value: Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0],
          row: i,
          col: j,
          selected: false,
          used: false
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  // Generate new target sum
  const generateTarget = useCallback((grid, range) => {
    const settings = difficultySettings[difficulty];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const newGrid = generateGrid(settings.gridSize, settings.numberRange);
    const newTarget = generateTarget(newGrid, settings.targetRange);
    
    setGrid(newGrid);
    setCurrentTarget(newTarget);
    setSelectedNumbers([]);
    setCurrentSum(0);
    setCompletedTargets(0);
    setTotalTargets(settings.targetsToComplete);
    setTargetsHistory([]);
    setConsecutiveCorrect(0);
    setBestStreak(0);
    setHintsUsed(0);
    setWrongAttempts(0);
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setParticles([]);
    setGameDuration(0);
  }, [difficulty, generateGrid, generateTarget]);

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameState !== 'playing') return;
    
    const cell = grid[row][col];
    if (cell.used) return; // Can't select used cells
    
    const newGrid = [...grid];
    const cellKey = `${row}-${col}`;
    
    if (cell.selected) {
      // Deselect cell
      newGrid[row][col].selected = false;
      setSelectedNumbers(prev => prev.filter(key => key !== cellKey));
      setCurrentSum(prev => prev - cell.value);
    } else {
      // Select cell
      newGrid[row][col].selected = true;
      setSelectedNumbers(prev => [...prev, cellKey]);
      setCurrentSum(prev => prev + cell.value);
    }
    
    setGrid(newGrid);
  };

  // Submit current selection
  const submitAnswer = () => {
    if (selectedNumbers.length === 0) return;
    
    if (currentSum === currentTarget) {
      // Correct answer!
      const newGrid = [...grid];
      selectedNumbers.forEach(cellKey => {
        const [row, col] = cellKey.split('-').map(Number);
        newGrid[row][col].used = true;
        newGrid[row][col].selected = false;
      });
      
      setGrid(newGrid);
      setSelectedNumbers([]);
      setCurrentSum(0);
      setCompletedTargets(prev => prev + 1);
      setConsecutiveCorrect(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      
      // Add to history
      setTargetsHistory(prev => [...prev, { target: currentTarget, numbers: selectedNumbers.length, correct: true }]);
      
      // Score calculation for correct answer
      const baseScore = 15;
      const streakBonus = Math.min(10, consecutiveCorrect * 2);
      const speedBonus = selectedNumbers.length === 2 ? 5 : 0; // Bonus for efficient solutions
      const totalGain = baseScore + streakBonus + speedBonus;
      
      animateScore(totalGain);
      createParticles('success', 20);
      
      // Generate new target if not finished
      if (completedTargets + 1 < totalTargets) {
        const settings = difficultySettings[difficulty];
        setCurrentTarget(generateTarget(newGrid, settings.targetRange));
      }
    } else {
      // Wrong answer
      setWrongAttempts(prev => prev + 1);
      setConsecutiveCorrect(0);
      
      // Clear selection
      const newGrid = [...grid];
      selectedNumbers.forEach(cellKey => {
        const [row, col] = cellKey.split('-').map(Number);
        newGrid[row][col].selected = false;
      });
      
      setGrid(newGrid);
      setSelectedNumbers([]);
      setCurrentSum(0);
      
      // Add to history
      setTargetsHistory(prev => [...prev, { target: currentTarget, numbers: selectedNumbers.length, correct: false }]);
      
      animateScore(-5); // Penalty for wrong answer
      createParticles('error', 10);
    }
  };

  // Get hint - highlight possible combinations
  const getHint = () => {
    if (hintsUsed >= difficultySettings[difficulty].maxHints) return;
    
    // Find a valid combination
    const availableCells = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (!cell.used && !cell.selected) {
          availableCells.push({ ...cell, row: rowIndex, col: colIndex });
        }
      });
    });
    
    // Try to find a 2-number combination first (most efficient)
    for (let i = 0; i < availableCells.length; i++) {
      for (let j = i + 1; j < availableCells.length; j++) {
        if (availableCells[i].value + availableCells[j].value === currentTarget) {
          // Highlight these two cells temporarily
          const newGrid = [...grid];
          newGrid[availableCells[i].row][availableCells[i].col].selected = true;
          newGrid[availableCells[j].row][availableCells[j].col].selected = true;
          setGrid(newGrid);
          setSelectedNumbers([
            `${availableCells[i].row}-${availableCells[i].col}`,
            `${availableCells[j].row}-${availableCells[j].col}`
          ]);
          setCurrentSum(currentTarget);
          setHintsUsed(prev => prev + 1);
          animateScore(-10); // Penalty for using hint
          createParticles('warning', 10);
          return;
        }
      }
    }
    
    // If no 2-number combination, try 3 numbers
    for (let i = 0; i < availableCells.length; i++) {
      for (let j = i + 1; j < availableCells.length; j++) {
        for (let k = j + 1; k < availableCells.length; k++) {
          if (availableCells[i].value + availableCells[j].value + availableCells[k].value === currentTarget) {
            const newGrid = [...grid];
            newGrid[availableCells[i].row][availableCells[i].col].selected = true;
            newGrid[availableCells[j].row][availableCells[j].col].selected = true;
            newGrid[availableCells[k].row][availableCells[k].col].selected = true;
            setGrid(newGrid);
            setSelectedNumbers([
              `${availableCells[i].row}-${availableCells[i].col}`,
              `${availableCells[j].row}-${availableCells[j].col}`,
              `${availableCells[k].row}-${availableCells[k].col}`
            ]);
            setCurrentSum(currentTarget);
            setHintsUsed(prev => prev + 1);
            animateScore(-10);
            createParticles('warning', 10);
            return;
          }
        }
      }
    }
  };

  // Clear current selection
  const clearSelection = () => {
    const newGrid = [...grid];
    selectedNumbers.forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number);
      newGrid[row][col].selected = false;
    });
    setGrid(newGrid);
    setSelectedNumbers([]);
    setCurrentSum(0);
  };

  // Calculate score
  const calculateScore = useCallback(() => {
    const settings = difficultySettings[difficulty];
    
    // Base score from completed targets
    const completionScore = (completedTargets / totalTargets) * 120;
    
    // Time bonus (remaining time as percentage of initial time)
    const timeBonus = Math.min(30, (timeRemaining / settings.timeLimit) * 30);
    
    // Accuracy bonus (correct vs wrong attempts)
    const totalAttempts = completedTargets + wrongAttempts;
    const accuracyBonus = totalAttempts > 0 ? (completedTargets / totalAttempts) * 25 : 0;
    
    // Streak bonus
    const streakBonus = Math.min(15, bestStreak * 2);
    
    // Hint penalty
    const hintPenalty = hintsUsed * 10;
    
    // Final calculation
    let finalScore = (completionScore + timeBonus + accuracyBonus + streakBonus - hintPenalty) * settings.scoreMultiplier;
    
    // Ensure score is between 0 and 200
    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [completedTargets, totalTargets, timeRemaining, difficulty, wrongAttempts, bestStreak, hintsUsed]);

  // Update score
  useEffect(() => {
    if (gameState === 'playing') {
      setScore(calculateScore());
    }
  }, [calculateScore, gameState]);

  // Check if game is completed
  useEffect(() => {
    if (gameState === 'playing' && completedTargets >= totalTargets) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - gameStartTime) / 1000);
      setGameDuration(duration);
      setFinalScore(calculateScore());
      setGameState('finished');
      setShowCompletionModal(true);
      createParticles('success', 50);
    }
  }, [completedTargets, totalTargets, gameState, gameStartTime, calculateScore]);

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            const endTime = Date.now();
            const duration = Math.floor((endTime - gameStartTime) / 1000);
            setGameDuration(duration);
            setFinalScore(calculateScore());
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, gameStartTime, calculateScore]);

  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
  };

  const handleReset = () => {
    initializeGame();
    setShowCompletionModal(false);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') {
      setDifficulty(newDifficulty);
    }
  };

  const customStats = {
    completedTargets,
    totalTargets,
    hintsUsed,
    maxHints: difficultySettings[difficulty].maxHints,
    wrongAttempts,
    consecutiveCorrect,
    bestStreak,
    accuracy: completedTargets + wrongAttempts > 0 ? Math.round((completedTargets / (completedTargets + wrongAttempts)) * 100) : 0
  };

  // Get grid cell size based on screen size and grid size
  const getGridCellSize = () => {
    const gridSize = difficultySettings[difficulty].gridSize;
    if (gridSize === 4) return 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24';
    if (gridSize === 5) return 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20';
    return 'w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16';
  };

  const getGridTextSize = () => {
    const gridSize = difficultySettings[difficulty].gridSize;
    if (gridSize === 4) return 'text-lg sm:text-xl lg:text-2xl';
    if (gridSize === 5) return 'text-base sm:text-lg lg:text-xl';
    return 'text-sm sm:text-base lg:text-lg';
  };

  return (
    <div className="relative overflow-hidden">
      <Header unreadCount={3} />
      
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-pulse"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Particle System */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                borderRadius: '50%',
                opacity: particle.life,
                transform: `translate(${particle.velocity.x * 20}px, ${particle.velocity.y * 20}px)`,
                animation: 'float 2s ease-out forwards'
              }}
            />
          ))}
        </div>
      )}

      <GameFramework
        gameTitle="🔢 Number Sum Puzzle"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-xl p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  How to Play Number Sum Puzzle
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions ? <ChevronUp className="h-5 w-5 text-blue-900" /> : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${showInstructions ? '' : 'hidden'}`}>
                <div className='bg-white p-4 rounded-xl shadow-sm border border-blue-100'>
                  <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1">
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700">
                    Select numbers from the grid that add up to the target sum. Complete all targets to win!
                  </p>
                </div>

                <div className='bg-white p-4 rounded-xl shadow-sm border border-blue-100'>
                  <h4 className="text-sm font-bold text-blue-800 mb-2">🔢 How to Play</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Click numbers to select them</li>
                    <li>• Watch the sum update</li>
                    <li>• Submit when sum equals target</li>
                  </ul>
                </div>

                <div className='bg-white p-4 rounded-xl shadow-sm border border-blue-100'>
                  <h4 className="text-sm font-bold text-blue-800 mb-2">📊 Scoring</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• +15 points per correct target</li>
                    <li>• Time & streak bonuses</li>
                    <li>• -5 points for wrong answers</li>
                  </ul>
                </div>

                <div className='bg-white p-4 rounded-xl shadow-sm border border-blue-100'>
                  <h4 className="text-sm font-bold text-blue-800 mb-2">🎚️ Difficulty</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Easy:</strong> 4×4 grid, 8 targets</li>
                    <li>• <strong>Medium:</strong> 5×5 grid, 10 targets</li>
                    <li>• <strong>Hard:</strong> 6×6 grid, 12 targets</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Arithmetic + Logic"
        gameState={gameState}
        setGameState={setGameState}
        score={gameState === 'finished' ? finalScore : score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={handleDifficultyChange}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        {/* Game Content */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 px-2 sm:px-4">
          {/* Score Animation */}
          {scoreAnimation > 0 && lastScoreGain !== 0 && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-xl sm:text-2xl font-bold animate-bounce z-10" 
                 style={{ color: lastScoreGain > 0 ? '#10B981' : '#EF4444' }}>
              {lastScoreGain > 0 ? '+' : ''}{lastScoreGain}
            </div>
          )}

          {/* Current Target Display - Gaming Style */}
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 rounded-2xl shadow-2xl text-center relative overflow-hidden">
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 rounded-2xl blur-sm opacity-75 -z-10"></div>
              
              {/* Streak fire effect */}
              {consecutiveCorrect > 2 && (
                <div className="absolute top-2 right-2 animate-pulse">
                  <Flame className="h-6 w-6 text-orange-300" />
                  <span className="text-xs font-bold text-orange-200 ml-1">{consecutiveCorrect}x</span>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-bold">TARGET SUM</h3>
              </div>
              
              <div className="text-3xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                {currentTarget}
              </div>
              
              <div className="flex items-center justify-center gap-4 text-xs sm:text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{completedTargets}/{totalTargets}</span>
                </div>
                <div className="w-full max-w-32 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-orange-300 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(completedTargets / totalTargets) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Selection Display - Enhanced Gaming Style */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-xs text-slate-400 mb-1">CURRENT SUM</div>
                  <div className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
                    currentSum === currentTarget ? 'text-green-400 animate-pulse' : 
                    currentSum > currentTarget ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {currentSum}
                  </div>
                </div>
                
                <div className="h-8 w-px bg-slate-600 mx-4"></div>
                
                <div className="text-center flex-1">
                  <div className="text-xs text-slate-400 mb-1">SELECTED</div>
                  <div className="text-lg sm:text-xl font-bold text-white">
                    {selectedNumbers.length} 
                    <span className="text-sm text-slate-400 ml-1">
                      {selectedNumbers.length === 1 ? 'number' : 'numbers'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="mt-3 text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  currentSum === currentTarget ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  currentSum > currentTarget ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {currentSum === currentTarget ? '✓ Perfect Match!' :
                   currentSum > currentTarget ? '⚠ Too High' : '→ Keep Adding'}
                </div>
              </div>
            </div>
          </div>

          {/* Game Controls - Modern Gaming Style */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full max-w-lg">
            <button
              onClick={submitAnswer}
              disabled={selectedNumbers.length === 0 || currentSum !== currentTarget}
              className={`
                px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base
                flex items-center gap-2 transition-all duration-200 transform
                ${currentSum === currentTarget && selectedNumbers.length > 0
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 hover:scale-105 animate-pulse'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <CheckCircle className="h-4 w-4" />
              SUBMIT ({currentSum})
            </button>
            
            <button
              onClick={clearSelection}
              disabled={selectedNumbers.length === 0}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              CLEAR
            </button>
            
        {/*    <button
              onClick={getHint}
              disabled={hintsUsed >= difficultySettings[difficulty].maxHints}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              HINT ({hintsUsed}/{difficultySettings[difficulty].maxHints})
            </button>
        */}
          </div>

          {/* Number Grid - Responsive Gaming Design */}
          <div className="w-full flex justify-center">
            <div className="bg-gradient-to-br from-slate-100 via-white to-slate-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-200/50 backdrop-blur-sm">
              <div 
                className={`grid gap-2 sm:gap-3 mx-auto`}
                style={{ 
                  gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridSize}, 1fr)`,
                  width: 'fit-content'
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelected = cell.selected;
                    const isUsed = cell.used;
                    const canSelect = !isUsed && gameState === 'playing';

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          ${getGridCellSize()} ${getGridTextSize()}
                          border-2 flex items-center justify-center font-black
                          relative transition-all duration-300 rounded-lg sm:rounded-xl
                          ${isUsed 
                            ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-400 border-gray-300 cursor-not-allowed opacity-50' 
                            : isSelected 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-400 shadow-lg shadow-blue-500/25 transform scale-105 animate-pulse' 
                              : canSelect
                                ? 'bg-gradient-to-br from-white to-slate-50 text-slate-800 border-slate-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:shadow-md cursor-pointer transform hover:scale-102'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border-gray-300 cursor-not-allowed'
                          }
                        `}
                        onClick={() => canSelect && handleCellClick(rowIndex, colIndex)}
                      >
                        {isUsed && (
                          <div className="absolute inset-0 bg-gray-400 opacity-20 rounded-lg sm:rounded-xl"></div>
                        )}
                        <span className="z-10 drop-shadow-sm">{cell.value}</span>
                        
                        {/* Glow effect for selected cells */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-400 opacity-20 rounded-lg sm:rounded-xl animate-pulse"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Game Stats - Enhanced Gaming Cards 
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-4xl">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-3 sm:p-4 text-center shadow-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="text-xs sm:text-sm font-medium opacity-90">STREAK</div>
              </div>
              <div className="text-lg sm:text-xl font-black">
                {consecutiveCorrect}
                <span className="text-xs sm:text-sm opacity-75 ml-1">
                  (Best: {bestStreak})
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-3 sm:p-4 text-center shadow-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="text-xs sm:text-sm font-medium opacity-90">ACCURACY</div>
              </div>
              <div className="text-lg sm:text-xl font-black">
                {completedTargets + wrongAttempts > 0 ? Math.round((completedTargets / (completedTargets + wrongAttempts)) * 100) : 0}%
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl p-3 sm:p-4 text-center shadow-lg">
              <div className="text-xs sm:text-sm font-medium opacity-90 mb-1">MISTAKES</div>
              <div className="text-lg sm:text-xl font-black">{wrongAttempts}</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-xl p-3 sm:p-4 text-center shadow-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="text-xs sm:text-sm font-medium opacity-90">HINTS LEFT</div>
              </div>
              <div className="text-lg sm:text-xl font-black">
                {difficultySettings[difficulty].maxHints - hintsUsed}
              </div>
            </div>
          </div> */}
        </div>
      </GameFramework>

      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
      />

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) scale(0) rotate(360deg); opacity: 0; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default KenKenMathPuzzleGame;