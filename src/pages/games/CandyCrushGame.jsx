import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Sparkles, Zap, Star, ChevronUp, ChevronDown } from 'lucide-react';

const CandyCrushGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [moves, setMoves] = useState(30);
  const [matches, setMatches] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [combos, setCombos] = useState(0);
  const [longestCombo, setLongestCombo] = useState(0);
  const [specialCandiesCreated, setSpecialCandiesCreated] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Game board state
  const [board, setBoard] = useState([]);
  const [gridSize, setGridSize] = useState(6);
  const [selectedCandy, setSelectedCandy] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [flashingCells, setFlashingCells] = useState([]);

  // Candy types and colors
  const candyTypes = {
    easy: ['🍎', '🍊', '🍋', '🍇', '🍓'],
    moderate: ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝'],
    hard: ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍑']
  };

  const candyColors = {
    '🍎': 'bg-red-400',
    '🍊': 'bg-orange-400',
    '🍋': 'bg-yellow-400',
    '🍇': 'bg-purple-400',
    '🍓': 'bg-pink-400',
    '🥝': 'bg-green-400',
    '🍑': 'bg-red-500'
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { gridSize: 5, timeLimit: 120, moves: 30, candyTypes: 5 },
    Moderate: { gridSize: 5, timeLimit: 100, moves: 25, candyTypes: 6 },
    Hard: { gridSize: 5, timeLimit: 80, moves: 20, candyTypes: 7 }
  };

  // Initialize board
  const initializeBoard = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const size = settings.gridSize;
    const types = candyTypes[difficulty.toLowerCase()];

    const newBoard = [];
    for (let row = 0; row < size; row++) {
      const boardRow = [];
      for (let col = 0; col < size; col++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        boardRow.push({
          type: randomType,
          id: `${row}-${col}`,
          row,
          col,
          matched: false,
          special: false
        });
      }
      newBoard.push(boardRow);
    }

    setBoard(newBoard);
    setGridSize(size);
  }, [difficulty]);

  // Check for matches
  const checkForMatches = useCallback(() => {
    if (!board.length) return [];

    const matches = [];
    const size = board.length;

    // Check horizontal matches
    for (let row = 0; row < size; row++) {
      let matchCount = 1;
      let currentType = board[row][0].type;

      for (let col = 1; col < size; col++) {
        if (board[row][col].type === currentType && !board[row][col].matched) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            for (let i = col - matchCount; i < col; i++) {
              matches.push({ row, col: i });
            }
          }
          matchCount = 1;
          currentType = board[row][col].type;
        }
      }

      if (matchCount >= 3) {
        for (let i = size - matchCount; i < size; i++) {
          matches.push({ row, col: i });
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < size; col++) {
      let matchCount = 1;
      let currentType = board[0][col].type;

      for (let row = 1; row < size; row++) {
        if (board[row][col].type === currentType && !board[row][col].matched) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            for (let i = row - matchCount; i < row; i++) {
              matches.push({ row: i, col });
            }
          }
          matchCount = 1;
          currentType = board[row][col].type;
        }
      }

      if (matchCount >= 3) {
        for (let i = size - matchCount; i < size; i++) {
          matches.push({ row: i, col });
        }
      }
    }

    return matches;
  }, [board]);

  // Remove matches and update score
  const removeMatches = useCallback((matchPositions) => {
    if (matchPositions.length === 0) return;

    const newBoard = [...board];
    let matchScore = 0;

    // Mark matched candies and calculate score
    matchPositions.forEach(({ row, col }) => {
      if (newBoard[row] && newBoard[row][col]) {
        newBoard[row][col].matched = true;
        matchScore += 10;
      }
    });

    // Apply combo multiplier
    if (comboCount > 0) {
      matchScore *= (1 + comboCount * 0.5);
    }

    setBoard(newBoard);
    setMatches(prev => prev + matchPositions.length);
    setTotalMatches(prev => prev + 1);

    // Flash the matched cells
    setFlashingCells(matchPositions);
    setTimeout(() => setFlashingCells([]), 300);

    // Update combo
    setComboCount(prev => {
      const newCombo = prev + 1;
      setLongestCombo(current => Math.max(current, newCombo));
      return newCombo;
    });

    // Apply gravity after a delay
    setTimeout(() => {
      applyGravity();
    }, 400);

    // Update score based on matches
    setScore(prev => prev + Math.round(matchScore));
  }, [board, comboCount]);

  // Apply gravity to fill empty spaces
  const applyGravity = useCallback(() => {
    const newBoard = [...board];
    const size = newBoard.length;
    const types = candyTypes[difficulty.toLowerCase()];

    for (let col = 0; col < size; col++) {
      // Find empty spaces (matched candies)
      const column = [];
      for (let row = size - 1; row >= 0; row--) {
        if (!newBoard[row][col].matched) {
          column.push(newBoard[row][col]);
        }
      }

      // Fill with new candies from top
      while (column.length < size) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        column.push({
          type: randomType,
          id: `new-${Date.now()}-${Math.random()}`,
          row: 0,
          col,
          matched: false,
          special: false
        });
      }

      // Place candies back in column
      for (let row = 0; row < size; row++) {
        newBoard[size - 1 - row][col] = {
          ...column[row],
          row: size - 1 - row,
          col,
          id: `${size - 1 - row}-${col}`
        };
      }
    }

    setBoard(newBoard);

    // Check for new matches after gravity
    setTimeout(() => {
      const newMatches = checkForMatches();
      if (newMatches.length > 0) {
        removeMatches(newMatches);
      } else {
        setComboCount(0);
        setIsAnimating(false);
      }
    }, 300);
  }, [board, difficulty, checkForMatches, removeMatches]);

  // Handle candy selection and swapping
  const handleCandyClick = useCallback((row, col) => {
    if (isAnimating || gameState !== 'playing') return;

    const clickedCandy = { row, col };

    if (!selectedCandy) {
      setSelectedCandy(clickedCandy);
    } else {
      // Check if candies are adjacent
      const rowDiff = Math.abs(selectedCandy.row - clickedCandy.row);
      const colDiff = Math.abs(selectedCandy.col - clickedCandy.col);

      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        // Swap candies
        swapCandies(selectedCandy, clickedCandy);
      }

      setSelectedCandy(null);
    }
  }, [selectedCandy, isAnimating, gameState]);

  // Swap two candies
  const swapCandies = useCallback((candy1, candy2) => {
    setIsAnimating(true);

    const newBoard = [...board];
    const temp = { ...newBoard[candy1.row][candy1.col] };

    newBoard[candy1.row][candy1.col] = {
      ...newBoard[candy2.row][candy2.col],
      row: candy1.row,
      col: candy1.col,
      id: `${candy1.row}-${candy1.col}`
    };

    newBoard[candy2.row][candy2.col] = {
      ...temp,
      row: candy2.row,
      col: candy2.col,
      id: `${candy2.row}-${candy2.col}`
    };

    setBoard(newBoard);
    setMoves(prev => Math.max(0, prev - 1));

    // Check for matches after swap
    setTimeout(() => {
      const matches = checkForMatches();
      if (matches.length > 0) {
        removeMatches(matches);
      } else {
        // No matches, swap back
        const revertBoard = [...board];
        const revertTemp = { ...revertBoard[candy1.row][candy1.col] };

        revertBoard[candy1.row][candy1.col] = {
          ...revertBoard[candy2.row][candy2.col],
          row: candy1.row,
          col: candy1.col,
          id: `${candy1.row}-${candy1.col}`
        };

        revertBoard[candy2.row][candy2.col] = {
          ...revertTemp,
          row: candy2.row,
          col: candy2.col,
          id: `${candy2.row}-${candy2.col}`
        };

        setBoard(revertBoard);
        setMoves(prev => prev + 1); // Give back the move
        setIsAnimating(false);
      }
    }, 300);
  }, [board, checkForMatches, removeMatches]);

  // Calculate score
  const calculateScore = useCallback(() => {
    if (totalMatches === 0) return 0;

    const settings = difficultySettings[difficulty];

    // Base score from matches (0-100 points)
    const matchScore = Math.min(100, matches * 2);

    // Combo bonus (0-40 points)
    const comboBonus = Math.min(40, longestCombo * 8);

    // Moves efficiency bonus (0-30 points)
    const movesUsed = settings.moves - moves;
    const moveEfficiency = movesUsed > 0 ? matches / movesUsed : 0;
    const moveBonus = Math.min(30, moveEfficiency * 15);

    // Time bonus (0-20 points)
    const timeBonus = Math.min(20, (timeRemaining / settings.timeLimit) * 20);

    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;

    let finalScore = (matchScore + comboBonus + moveBonus + timeBonus) * difficultyMultiplier;

    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [matches, longestCombo, moves, timeRemaining, difficulty, totalMatches]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0 && moves > 0) {
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
    } else if (moves <= 0 && gameState === 'playing') {
      setGameState('finished');
      setShowCompletionModal(true);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, moves]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setMoves(settings.moves);
    setMatches(0);
    setTotalMatches(0);
    setCombos(0);
    setLongestCombo(0);
    setSpecialCandiesCreated(0);
    setComboCount(0);
    setSelectedCandy(null);
    setIsAnimating(false);
    setFlashingCells([]);
    initializeBoard();
  }, [difficulty, initializeBoard]);

  const handleStart = () => {
    initializeGame();
  };

  const handleReset = () => {
    initializeGame();
    setBoard([]);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    matches,
    totalMatches,
    combos: longestCombo,
    movesRemaining: moves,
    specialCandiesCreated,
    efficiency: totalMatches > 0 ? Math.round((matches / totalMatches) * 100) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Candy Crush Master"
        modifiedPadding="p-2"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Candy Crush Master
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Toggle Content */}
              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Match 3 or more candies in a row or column to clear them and score points.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎮 How to Play
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Click a candy to select it</li>
                      <li>• Click adjacent candy to swap</li>
                      <li>• Create matches of 3+ candies</li>
                      <li>• Chain combos for bonus points</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Basic match: 10 points each</li>
                      <li>• Combo multipliers increase score</li>
                      <li>• Time and move bonuses</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      💡 Strategy
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Look for cascade opportunities</li>
                      <li>• Plan moves carefully</li>
                      <li>• Create combos for high scores</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Puzzle"
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
          {/* Game Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Moves
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {moves}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Matches
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {matches}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Combo
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {comboCount}x
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Best
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {longestCombo}x
              </div>
            </div>
          </div>

          {/* Combo Indicator */}
          {comboCount > 1 && (
            <div className="mb-4 animate-pulse">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="font-bold">COMBO {comboCount}x!</span>
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Game Board */}
          <div className="mb-6">
            <div
              className="grid gap-1 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-lg"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                maxWidth: '600px',
                aspectRatio: '1'
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((candy, colIndex) => {
                  const isSelected = selectedCandy && selectedCandy.row === rowIndex && selectedCandy.col === colIndex;
                  const isFlashing = flashingCells.some(cell => cell.row === rowIndex && cell.col === colIndex);

                  return (
                    <div
                      key={candy.id}
                      className={`
                        aspect-square rounded-lg cursor-pointer transition-all duration-200
                        flex items-center justify-center text-2xl font-bold
                        ${candyColors[candy.type] || 'bg-gray-300'}
                        ${isSelected ? 'ring-4 ring-yellow-400 scale-110' : ''}
                        ${isFlashing ? 'animate-pulse bg-white' : ''}
                        ${isAnimating ? 'pointer-events-none' : 'hover:scale-105'}
                        shadow-md hover:shadow-lg
                      `}
                      onClick={() => handleCandyClick(rowIndex, colIndex)}
                      style={{
                        fontSize: gridSize > 8 ? '1.2rem' : '1.5rem',
                        minHeight: gridSize > 8 ? '40px' : '50px'
                      }}
                    >
                      {candy.type}
                      {candy.special && (
                        <Star className="absolute h-3 w-3 text-yellow-300 top-0 right-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center max-w-2xl">
            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              {selectedCandy ?
                'Click an adjacent candy to swap and create matches!' :
                'Click a candy to select it, then click an adjacent candy to swap.'
              }
            </p>
            <div className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {gridSize}×{gridSize} grid | {difficultySettings[difficulty].moves} moves |
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit
            </div>
          </div>
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

export default CandyCrushGame;