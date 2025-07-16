import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Grid, Lightbulb, CheckCircle, XCircle, Target, Zap, Brain, RefreshCw } from 'lucide-react';

const LogicGridSolverGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [puzzleStartTime, setPuzzleStartTime] = useState(0);

  // Game state
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [playerGrid, setPlayerGrid] = useState([]);
  const [solutionGrid, setSolutionGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [violatedRules, setViolatedRules] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  

  // Difficulty settings
  const difficultySettings = {
    Easy: { 
      gridSize: 3, 
      timeLimit: 180, 
      lives: 5, 
      hints: 3, 
      symbols: ['🔴', '🔵', '🟡'], 
      ruleTypes: ['unique_row', 'unique_col'],
      prefilled: 3
    },
    Moderate: { 
      gridSize: 4, 
      timeLimit: 240, 
      lives: 4, 
      hints: 2, 
      symbols: ['🔴', '🔵', '🟡', '🟢'], 
      ruleTypes: ['unique_row', 'unique_col', 'adjacent_different'],
      prefilled: 4
    },
    Hard: { 
      gridSize: 5, 
      timeLimit: 300, 
      lives: 3, 
      hints: 1, 
      symbols: ['🔴', '🔵', '🟡', '🟢', '🟣'], 
      ruleTypes: ['unique_row', 'unique_col', 'adjacent_different', 'diagonal_constraint'],
      prefilled: 6
    }
  };

  // Generate logic puzzle
  const generatePuzzle = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const { gridSize, symbols, ruleTypes, prefilled } = settings;
    
    // Generate solution grid
    const solution = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    
    // Simple backtracking algorithm to generate valid solution
    const isValid = (grid, row, col, symbol) => {
      // Check unique row constraint
      if (ruleTypes.includes('unique_row')) {
        for (let c = 0; c < gridSize; c++) {
          if (c !== col && grid[row][c] === symbol) return false;
        }
      }
      
      // Check unique column constraint
      if (ruleTypes.includes('unique_col')) {
        for (let r = 0; r < gridSize; r++) {
          if (r !== row && grid[r][col] === symbol) return false;
        }
      }
      
      // Check adjacent different constraint
      if (ruleTypes.includes('adjacent_different')) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (let [dr, dc] of directions) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            if (grid[newRow][newCol] === symbol) return false;
          }
        }
      }
      
      // Check diagonal constraint (no same symbol on main diagonals)
      if (ruleTypes.includes('diagonal_constraint')) {
        if (row === col) {
          for (let i = 0; i < gridSize; i++) {
            if (i !== row && grid[i][i] === symbol) return false;
          }
        }
        if (row + col === gridSize - 1) {
          for (let i = 0; i < gridSize; i++) {
            if (i !== row && grid[i][gridSize - 1 - i] === symbol) return false;
          }
        }
      }
      
      return true;
    };
    
    const fillGrid = (grid, row, col) => {
      if (row === gridSize) return true;
      
      const nextRow = col === gridSize - 1 ? row + 1 : row;
      const nextCol = col === gridSize - 1 ? 0 : col + 1;
      
      const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5);
      
      for (let symbol of shuffledSymbols) {
        if (isValid(grid, row, col, symbol)) {
          grid[row][col] = symbol;
          if (fillGrid(grid, nextRow, nextCol)) {
            return true;
          }
          grid[row][col] = '';
        }
      }
      
      return false;
    };
    
    fillGrid(solution, 0, 0);
    
    // Create player grid with some prefilled cells
    const playerGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    const prefilledCells = new Set();
    
    while (prefilledCells.size < prefilled) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const cellKey = `${row}-${col}`;
      
      if (!prefilledCells.has(cellKey)) {
        prefilledCells.add(cellKey);
        playerGrid[row][col] = solution[row][col];
      }
    }
    
    // Generate rules description
    const rulesText = [];
    if (ruleTypes.includes('unique_row')) rulesText.push('Each row must contain each symbol exactly once');
    if (ruleTypes.includes('unique_col')) rulesText.push('Each column must contain each symbol exactly once');
    if (ruleTypes.includes('adjacent_different')) rulesText.push('Adjacent cells cannot have the same symbol');
    if (ruleTypes.includes('diagonal_constraint')) rulesText.push('Main diagonals cannot have duplicate symbols');
    
    const puzzle = {
      gridSize,
      symbols,
      ruleTypes,
      rules: rulesText,
      prefilledCells: Array.from(prefilledCells),
      difficulty
    };
    
    setCurrentPuzzle(puzzle);
    setPlayerGrid(playerGrid);
    setSolutionGrid(solution);
    setAvailableSymbols(symbols);
    setPuzzleStartTime(Date.now());
    setSelectedCell({ row: -1, col: -1 });
    setViolatedRules([]);
  }, [difficulty]);

  // Check if puzzle is solved
  const isPuzzleSolved = useCallback(() => {
    if (!currentPuzzle || !playerGrid.length) return false;
    
    const { gridSize } = currentPuzzle;
    
    // Check if all cells are filled
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!playerGrid[row][col]) return false;
      }
    }
    
    // Check if it matches solution
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (playerGrid[row][col] !== solutionGrid[row][col]) {
          return false;
        }
      }
    }
    
    return true;
  }, [currentPuzzle, playerGrid, solutionGrid]);

  // Validate move
  const validateMove = useCallback((row, col, symbol) => {
    if (!currentPuzzle) return { isValid: true, violations: [] };
    
    const { gridSize, ruleTypes } = currentPuzzle;
    const violations = [];
    
    // Create temporary grid with the new move
    const tempGrid = playerGrid.map(row => [...row]);
    tempGrid[row][col] = symbol;
    
    // Check unique row constraint
    if (ruleTypes.includes('unique_row')) {
      const rowSymbols = tempGrid[row].filter(s => s === symbol);
      if (rowSymbols.length > 1) {
        violations.push(`Row ${row + 1} cannot have duplicate ${symbol}`);
      }
    }
    
    // Check unique column constraint
    if (ruleTypes.includes('unique_col')) {
      const colSymbols = tempGrid.map(r => r[col]).filter(s => s === symbol);
      if (colSymbols.length > 1) {
        violations.push(`Column ${col + 1} cannot have duplicate ${symbol}`);
      }
    }
    
    // Check adjacent different constraint
    if (ruleTypes.includes('adjacent_different')) {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (let [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
          if (tempGrid[newRow][newCol] === symbol) {
            violations.push(`Adjacent cells cannot have the same symbol`);
            break;
          }
        }
      }
    }
    
    // Check diagonal constraint
    if (ruleTypes.includes('diagonal_constraint')) {
      if (row === col) {
        const diagonalSymbols = tempGrid.map((r, i) => r[i]).filter(s => s === symbol);
        if (diagonalSymbols.length > 1) {
          violations.push(`Main diagonal cannot have duplicate ${symbol}`);
        }
      }
      if (row + col === gridSize - 1) {
        const antiDiagonalSymbols = tempGrid.map((r, i) => r[gridSize - 1 - i]).filter(s => s === symbol);
        if (antiDiagonalSymbols.length > 1) {
          violations.push(`Anti-diagonal cannot have duplicate ${symbol}`);
        }
      }
    }
    
    return { isValid: violations.length === 0, violations };
  }, [currentPuzzle, playerGrid]);

  // Calculate score
  const calculateScore = useCallback(() => {
    if (puzzlesSolved === 0) return 0;
    
    const settings = difficultySettings[difficulty];
    const avgTimePerPuzzle = totalTime / puzzlesSolved / 1000;
    const accuracy = puzzlesSolved / Math.max(1, puzzlesSolved + (5 - lives));
    
    // Base score from puzzles solved (0-60 points)
    let baseScore = puzzlesSolved * 10;
    
    // Speed bonus (max 40 points)
    const idealTime = difficulty === 'Easy' ? 30 : difficulty === 'Moderate' ? 45 : 60;
    const speedBonus = Math.max(0, Math.min(40, (idealTime - avgTimePerPuzzle) * 2));
    
    // Accuracy bonus (max 35 points)
    const accuracyBonus = accuracy * 35;
    
    // Streak bonus (max 30 points)
    const streakBonus = Math.min(maxStreak * 3, 30);
    
    // Lives bonus (max 20 points)
    const livesBonus = (lives / settings.lives) * 20;
    
    // Hints penalty (subtract up to 20 points)
    const hintsPenalty = (hintsUsed / settings.hints) * 20;
    
    // Efficiency bonus (fewer moves = better score, max 15 points)
    const expectedMoves = puzzlesSolved * settings.gridSize * settings.gridSize;
    const efficiencyBonus = Math.max(0, Math.min(15, ((expectedMoves - totalMoves) / expectedMoves) * 15));
    
    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;
    
    // Time remaining bonus (max 10 points)
    const timeRemainingBonus = Math.min(10, (timeRemaining / settings.timeLimit) * 10);
    
    let finalScore = (baseScore + speedBonus + accuracyBonus + streakBonus + livesBonus + efficiencyBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;
    
    // Apply final modifier to make 200 very challenging
    finalScore = finalScore * 0.85;
    
    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [puzzlesSolved, totalTime, lives, hintsUsed, maxStreak, timeRemaining, difficulty, totalMoves]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle cell click
  const handleCellClick = useCallback((row, col) => {
    if (!currentPuzzle || gameState !== 'playing') return;
    
    // Check if cell is prefilled
    const cellKey = `${row}-${col}`;
    if (currentPuzzle.prefilledCells.includes(cellKey)) return;
    
    setSelectedCell({ row, col });
  }, [currentPuzzle, gameState]);

  // Handle symbol placement
  const handleSymbolPlace = useCallback((symbol) => {
    if (!currentPuzzle || gameState !== 'playing' || selectedCell.row === -1) return;
    
    const { row, col } = selectedCell;
    const validation = validateMove(row, col, symbol);
    
    setTotalMoves(prev => prev + 1);
    
    if (validation.isValid) {
      const newGrid = [...playerGrid];
      newGrid[row][col] = symbol;
      setPlayerGrid(newGrid);
      
      // Check if puzzle is solved
      const tempGrid = newGrid;
      let solved = true;
      for (let r = 0; r < currentPuzzle.gridSize; r++) {
        for (let c = 0; c < currentPuzzle.gridSize; c++) {
          if (!tempGrid[r][c] || tempGrid[r][c] !== solutionGrid[r][c]) {
            solved = false;
            break;
          }
        }
        if (!solved) break;
      }
      
      if (solved) {
        const puzzleTime = Date.now() - puzzleStartTime;
        setTotalTime(prev => prev + puzzleTime);
        setPuzzlesSolved(prev => prev + 1);
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(current => Math.max(current, newStreak));
          return newStreak;
        });
        setCurrentLevel(prev => prev + 1);
        
        setShowFeedback(true);
        setFeedbackType('correct');
        
        setTimeout(() => {
          setShowFeedback(false);
          generatePuzzle();
        }, 2000);
      }
      
      setViolatedRules([]);
    } else {
      setViolatedRules(validation.violations);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('finished');
          setShowCompletionModal(true);
        }
        return newLives;
      });
      setStreak(0);
      
      setTimeout(() => {
        setViolatedRules([]);
      }, 3000);
    }
    
    setSelectedCell({ row: -1, col: -1 });
  }, [currentPuzzle, gameState, selectedCell, validateMove, playerGrid, solutionGrid, puzzleStartTime, generatePuzzle]);

  // Use hint
  const useHint = useCallback(() => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentPuzzle) return;
    
    const { gridSize } = currentPuzzle;
    const emptyCells = [];
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!playerGrid[row][col]) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const correctSymbol = solutionGrid[randomCell.row][randomCell.col];
      
      setHintsUsed(prev => prev + 1);
      setHintMessage(`Try placing ${correctSymbol} at row ${randomCell.row + 1}, column ${randomCell.col + 1}`);
      setShowHint(true);
      
      setTimeout(() => {
        setShowHint(false);
      }, 5000);
    }
  }, [hintsUsed, maxHints, gameState, currentPuzzle, playerGrid, solutionGrid]);

  // Clear cell
  const clearCell = useCallback(() => {
    if (!currentPuzzle || gameState !== 'playing' || selectedCell.row === -1) return;
    
    const { row, col } = selectedCell;
    const cellKey = `${row}-${col}`;
    
    // Check if cell is prefilled
    if (currentPuzzle.prefilledCells.includes(cellKey)) return;
    
    const newGrid = [...playerGrid];
    newGrid[row][col] = '';
    setPlayerGrid(newGrid);
    
    setSelectedCell({ row: -1, col: -1 });
  }, [currentPuzzle, gameState, selectedCell, playerGrid]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentLevel(1);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setPuzzlesSolved(0);
    setTotalMoves(0);
    setTotalTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    generatePuzzle();
  };

  const handleReset = () => {
    initializeGame();
    setCurrentPuzzle(null);
    setPlayerGrid([]);
    setSolutionGrid([]);
    setSelectedCell({ row: -1, col: -1 });
    setShowFeedback(false);
    setViolatedRules([]);
    setShowHint(false);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    lives,
    hintsUsed,
    puzzlesSolved,
    totalMoves,
    averageTime: puzzlesSolved > 0 ? Math.round(totalTime / puzzlesSolved / 1000) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      
      <GameFramework
        gameTitle="Logic Grid Solver"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                How to Play Logic Grid Solver
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Fill the grid with symbols according to logical rules. Each puzzle has specific constraints that must be satisfied.
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🧩 Rules
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Each row/column must be unique</li>
                    <li>• Adjacent cells may have restrictions</li>
                    <li>• Diagonal constraints apply in harder levels</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    📊 Scoring
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Points for each puzzle solved</li>
                    <li>• Speed bonuses for quick solutions</li>
                    <li>• Streak multipliers for consecutive wins</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    💡 Strategy
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Start with obvious placements</li>
                    <li>• Use elimination process</li>
                    <li>• Consider all constraints simultaneously</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Logic"
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
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            <button
              onClick={useHint}
              disabled={hintsUsed >= maxHints}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                hintsUsed >= maxHints
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
            >
              <Lightbulb className="h-4 w-4" />
              Hint ({maxHints - hintsUsed})
            </button>
            
            <button
              onClick={clearCell}
              disabled={selectedCell.row === -1}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedCell.row === -1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
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
                Lives
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'❤️'.repeat(lives)}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streak}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Solved
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesSolved}
              </div>
            </div>
          </div>

          {/* Rules Display */}
          {currentPuzzle && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Puzzle Rules:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentPuzzle.rules.map((rule, index) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Hint Display */}
          {showHint && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hint:
                  </span>
                </div>
                <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {hintMessage}
                </p>
              </div>
            </div>
          )}

          {/* Rule Violations */}
          {violatedRules.length > 0 && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Rule Violations:
                  </span>
                </div>
                <ul className="text-red-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {violatedRules.map((violation, index) => (
                    <li key={index}>• {violation}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Game Grid */}
          {currentPuzzle && (
            <div className="mb-6">
              <div 
                className="grid gap-1 bg-gray-300 p-2 rounded-lg mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${currentPuzzle.gridSize}, 1fr)`,
                  maxWidth: `${currentPuzzle.gridSize * 60}px`
                }}
              >
                {playerGrid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`;
                    const isPrefilled = currentPuzzle.prefilledCells.includes(cellKey);
                    const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
                    
                    return (
                      <div
                        key={cellKey}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          w-12 h-12 flex items-center justify-center text-2xl font-bold rounded cursor-pointer transition-colors
                          ${isPrefilled 
                            ? 'bg-gray-200 text-gray-800' 
                            : isSelected 
                              ? 'bg-blue-200 border-2 border-blue-500' 
                              : 'bg-white hover:bg-gray-50'
                          }
                          ${!isPrefilled && !isSelected ? 'border border-gray-300' : ''}
                        `}
                      >
                        {cell}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Symbol Selector */}
          {currentPuzzle && selectedCell.row !== -1 && (
            <div className="mb-6">
              <div className="flex gap-2 justify-center">
                {availableSymbols.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => handleSymbolPlace(symbol)}
                    className="w-12 h-12 text-2xl bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Click a symbol to place it in the selected cell
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className="w-full max-w-2xl text-center p-6 rounded-lg bg-green-100 text-green-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Puzzle Solved!
                </div>
              </div>
              <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Great logical thinking! Moving to the next challenge...
              </div>
            </div>
          )}

          {/* Instructions */}
          {!currentPuzzle && (
            <div className="text-center max-w-2xl">
              <div className="text-6xl mb-4">🧩</div>
              <p className="text-lg text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Ready to challenge your logical reasoning skills?
              </p>
              <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Select your difficulty level and start solving logic grid puzzles!
              </p>
            </div>
          )}
        </div>
      </GameFramework>
       <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
        />
    </div>
  );
};

export default LogicGridSolverGame;