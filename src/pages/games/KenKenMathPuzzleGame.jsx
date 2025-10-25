import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Plus, Target, Timer, Zap, Award, ChevronUp, ChevronDown, CheckCircle, Sparkles, TrendingUp, Flame, Heart } from 'lucide-react';

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
  const [lives, setLives] = useState(3); // Added lives state
  const [wrongAnswerMessage, setWrongAnswerMessage] = useState('');

  // Game-specific state
  const [grid, setGrid] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [currentSum, setCurrentSum] = useState(0);
  const [completedTargets, setCompletedTargets] = useState(0);
  const [totalTargets, setTotalTargets] = useState(8); // Default to Easy
  const [targetsHistory, setTargetsHistory] = useState([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [particles, setParticles] = useState([]);
  const [lastScoreGain, setLastScoreGain] = useState(0);
  const [scoreAnimation, setScoreAnimation] = useState(0);
  const [timeoutIds, setTimeoutIds] = useState([]); // For cleanup

  const difficultySettings = {
    Easy: {
      timeLimit: 300, // 5 minutes
      gridSize: 4,
      maxHints: 5,
      numberRange: [1, 9],
      targetRange: [10, 20],
      targetsToComplete: 8,
      pointsPerCorrect: 25,
      description: '4x4 grid with simple addition targets',
      scoreMultiplier: 1.0,
      color: 'from-green-400 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100'
    },
    Moderate: {
      timeLimit: 240, // 4 minutes
      gridSize: 5,
      maxHints: 3,
      numberRange: [1, 12],
      targetRange: [20, 35],
      targetsToComplete: 5,
      pointsPerCorrect: 40,
      description: '5x5 grid with moderate addition targets',
      scoreMultiplier: 1.2,
      color: 'from-yellow-400 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100'
    },
    Hard: {
      timeLimit: 180, // 3 minutes
      gridSize: 6,
      maxHints: 2,
      numberRange: [1, 15],
      targetRange: [30, 50],
      targetsToComplete: 4,
      pointsPerCorrect: 50,
      description: '6x6 grid with challenging addition targets',
      scoreMultiplier: 1.5,
      color: 'from-red-400 to-rose-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-100'
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [timeoutIds]);

  // Particle system for visual feedback with cleanup
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
    const id = setTimeout(() => setParticles([]), 2000);
    setTimeoutIds(prev => [...prev, id]);
  };

  const animateScore = (gain) => {
    setLastScoreGain(gain);
    setScoreAnimation(1);
    const id = setTimeout(() => setScoreAnimation(0), 1000);
    setTimeoutIds(prev => [...prev, id]);
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

  // Generate valid target based on available numbers
  const generateTarget = useCallback((grid, range) => {
    // Get all available numbers
    const availableNumbers = [];
    grid.forEach(row => {
      row.forEach(cell => {
        if (!cell.used) {
          availableNumbers.push(cell.value);
        }
      });
    });
    
    // Try to generate a target that's achievable
    let attempts = 0;
    while (attempts < 50) { // Limit attempts to prevent infinite loop
      const target = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
      
      // Check if this target can be achieved with available numbers
      if (isTargetAchievable(availableNumbers, target)) {
        return target;
      }
      attempts++;
    }
    
    // Fallback: return a random target within range
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }, []);

  // Helper function to check if a target is achievable with available numbers
  const isTargetAchievable = (numbers, target) => {
    // Simple check: see if any number is <= target and at least one other number can complement it
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] <= target) {
        for (let j = i + 1; j < numbers.length; j++) {
          if (numbers[i] + numbers[j] === target) {
            return true;
          }
        }
      }
    }
    return false;
  };

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
    setLives(3); // Reset lives
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setParticles([]);
    setGameDuration(0);
    setWrongAnswerMessage(''); // Add this line to clear the wrong answer message
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

  // Check if game should end
  const checkGameEnd = useCallback(() => {
    if (lives <= 0 || completedTargets >= totalTargets) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - gameStartTime) / 1000);
      setGameDuration(duration);
      setFinalScore(score);
      setGameState('finished');
      setShowCompletionModal(true);
      createParticles('success', 50);
      return true;
    }
    return false;
  }, [lives, completedTargets, totalTargets, gameStartTime, score]);

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
      
      // Score calculation for correct answer - updated logic
      const settings = difficultySettings[difficulty];
      const pointsGained = settings.pointsPerCorrect;
      
      setScore(prev => prev + pointsGained);
      animateScore(pointsGained);
      createParticles('success', 20);
      
      // Check if game should end
      if (!checkGameEnd()) {
        // Generate new target if not finished
        const settings = difficultySettings[difficulty];
        setCurrentTarget(generateTarget(newGrid, settings.targetRange));
      }
      setWrongAnswerMessage(''); // Clear wrong message if any
    } else {
      // Wrong answer
      setWrongAnswerMessage('Wrong answer entered! Try again.'); // Add this line
      setWrongAttempts(prev => prev + 1);  
      setConsecutiveCorrect(0);
      setLives(prev => prev - 1);
      
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
      
      animateScore(0); // No penalty, just lose a life
      createParticles('error', 10);
      
      // Check if game should end
      checkGameEnd();
    }
  };

  // Get hint - highlight possible combinations
  const getHint = () => {
    if (hintsUsed >= difficultySettings[difficulty].maxHints) return;
    setWrongAnswerMessage(''); // Add this line
    
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
          animateScore(0); // No score penalty, just use hint
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
            animateScore(0);
            createParticles('warning', 10);
            return;
          }
        }
      }
    }
  };

  // Clear current selection
  const clearSelection = () => {
    setWrongAnswerMessage(''); // Add this line
    const newGrid = [...grid];
    selectedNumbers.forEach(cellKey => {
      const [row, col] = cellKey.split('-').map(Number);
      newGrid[row][col].selected = false;
    });
    setGrid(newGrid);
    setSelectedNumbers([]);
    setCurrentSum(0);
  };

  // Check if game is completed
  useEffect(() => {
    if (gameState === 'playing') {
      checkGameEnd();
    }
  }, [gameState, completedTargets, totalTargets, lives, checkGameEnd]);

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setFinalScore(score);
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, score]);

  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
    setGameState('playing');
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
    lives, // Added lives to stats
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
      {gameState === 'ready' && <Header unreadCount={3} />}
      
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
        gameShortDescription="Solve KenKen puzzles using arithmetic operations. Challenge your mathematical reasoning and logical thinking!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
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
                    <li>• You have 3 lives - game ends if you lose all</li>
                  </ul>
                </div>

                <div className='bg-white p-4 rounded-xl shadow-sm border border-blue-100'>
                  <h4 className="text-sm font-bold text-blue-800 mb-2">📊 Scoring</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Easy:</strong> 25 points per target (8 targets)</li>
                    <li>• <strong>Medium:</strong> 40 points per target (5 targets)</li>
                    <li>• <strong>Hard:</strong> 50 points per target (4 targets)</li>
                  </ul>
                </div>

                <div className='bg-white p-4 rounded-xl shadow-sm border border-blue-100'>
                  <h4 className="text-sm font-bold text-blue-800 mb-2">🎚️ Difficulty</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Easy:</strong> 4×4 grid, 8 targets</li>
                    <li>• <strong>Medium:</strong> 5×5 grid, 5 targets</li>
                    <li>• <strong>Hard:</strong> 6×6 grid, 4 targets</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Logic"
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

          {/* Lives Display */}
          <div className="flex items-center justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                className={`h-6 w-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          {/* Wrong Answer Message */}
{wrongAnswerMessage && (
  <div className="w-full max-w-md mx-auto animate-shake">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
      {wrongAnswerMessage}
    </div>
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
              className={`
                px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base
                flex items-center gap-2 transition-all duration-200 transform
                ${selectedNumbers.length > 0
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
            
            <button
              onClick={getHint}
              disabled={hintsUsed >= difficultySettings[difficulty].maxHints}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              HINT ({hintsUsed}/{difficultySettings[difficulty].maxHints})
            </button>
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

          {/* Game Stats - Enhanced Gaming Cards */}
          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-4xl">
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
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="text-xs sm:text-sm font-medium opacity-90">LIVES</div>
              </div>
              <div className="text-lg sm:text-xl font-black">
                {lives}
              </div>
            </div>
          </div> */}
        </div>
      </GameFramework>

      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
        message={lives <= 0 ? "You ran out of lives!" : "Congratulations! You completed all targets!"}
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
        @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
      `}</style>
    </div>
  );
};

export default KenKenMathPuzzleGame;