import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import {candyTypes, candyColors, difficultySettings, blobStyles } from "../../utils/games/CandyConstants"
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
  const [explodingCells, setExplodingCells] = useState([]);
  const [fallingCandies, setFallingCandies] = useState([]);
  const [particles, setParticles] = useState([]);

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
          special: false,
          isNew: false,
          fallDistance: 0
        });
      }
      newBoard.push(boardRow);
    }

    setBoard(newBoard);
    setGridSize(size);
  }, [difficulty]);

  // Create particles for animation
  const createParticles = useCallback((positions) => {
    const newParticles = [];
    positions.forEach(({ row, col }, index) => {
      for (let i = 0; i < 5; i++) {
        newParticles.push({
          id: `particle-${row}-${col}-${i}-${Date.now()}`,
          x: col * 60 + 30 + (Math.random() - 0.5) * 20,
          y: row * 60 + 30 + (Math.random() - 0.5) * 20,
          color: ['#FFD700', '#FF6B35', '#FF1744', '#9C27B0', '#2196F3'][Math.floor(Math.random() * 5)],
          size: Math.random() * 6 + 4,
          life: 1.0,
          decay: 0.02 + Math.random() * 0.01,
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: (Math.random() - 0.5) * 4 - 2
        });
      }
    });
    
    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => 
        !newParticles.some(np => np.id === p.id)
      ));
    }, 2000);
  }, []);

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

  // Remove matches and update score with enhanced animations
  const removeMatches = useCallback((matchPositions) => {
    if (matchPositions.length === 0) return;

    const newBoard = [...board];
    let matchScore = 0;

    // Create explosion animation for matched candies
    setExplodingCells(matchPositions);
    
    // Create particles at match positions
    createParticles(matchPositions);

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

    // Flash and explode animation sequence
    setFlashingCells(matchPositions);
    
    setTimeout(() => {
      setFlashingCells([]);
      setExplodingCells([]);
    }, 600);

    // Update combo with enhanced feedback
    setComboCount(prev => {
      const newCombo = prev + 1;
      setLongestCombo(current => Math.max(current, newCombo));
      
      // Show combo celebration
      if (newCombo > 2) {
        setTimeout(() => {
          // Add screen shake effect or other celebration
        }, 100);
      }
      
      return newCombo;
    });

    // Apply gravity after explosion animation
    setTimeout(() => {
      applyGravity();
    }, 700);

    // Update score based on matches
    setScore(prev => prev + Math.round(matchScore));
  }, [board, comboCount, createParticles]);

  // Apply gravity with smooth falling animation
  const applyGravity = useCallback(() => {
    const newBoard = [...board];
    const size = newBoard.length;
    const types = candyTypes[difficulty.toLowerCase()];
    const fallingAnimations = [];

    for (let col = 0; col < size; col++) {
      // Count empty spaces from bottom
      let emptySpaces = 0;
      for (let row = size - 1; row >= 0; row--) {
        if (newBoard[row][col].matched) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          // Move candy down
          const candy = newBoard[row][col];
          const newRow = row + emptySpaces;
          
          fallingAnimations.push({
            from: { row, col },
            to: { row: newRow, col },
            candy: { ...candy }
          });

          newBoard[newRow][col] = {
            ...candy,
            row: newRow,
            id: `${newRow}-${col}`,
            fallDistance: emptySpaces
          };
          
          newBoard[row][col] = {
            type: '',
            matched: true,
            row,
            col,
            id: `empty-${row}-${col}`
          };
        }
      }

      // Fill empty spaces at top with new candies
      for (let row = 0; row < size; row++) {
        if (newBoard[row][col].matched || newBoard[row][col].type === '') {
          const randomType = types[Math.floor(Math.random() * types.length)];
          newBoard[row][col] = {
            type: randomType,
            id: `new-${Date.now()}-${row}-${col}`,
            row,
            col,
            matched: false,
            special: false,
            isNew: true,
            fallDistance: emptySpaces + (size - row)
          };

          fallingAnimations.push({
            from: { row: row - (emptySpaces + (size - row)), col },
            to: { row, col },
            candy: newBoard[row][col],
            isNew: true
          });
        }
      }
    }

    setFallingCandies(fallingAnimations);
    setBoard(newBoard);

    // Clear falling animation after completion
    setTimeout(() => {
      setFallingCandies([]);
      const clearedBoard = newBoard.map(row => 
        row.map(candy => ({ ...candy, isNew: false, fallDistance: 0 }))
      );
      setBoard(clearedBoard);
    }, 500);

    // Check for new matches after gravity settles
    setTimeout(() => {
      const newMatches = checkForMatches();
      if (newMatches.length > 0) {
        removeMatches(newMatches);
      } else {
        setComboCount(0);
        setIsAnimating(false);
      }
    }, 600);
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

  // Swap two candies with animation
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
        // No matches, swap back with animation
        const revertBoard = [...newBoard];
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
    setExplodingCells([]);
    setFallingCandies([]);
    setParticles([]);
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
      {gameState === 'ready' && <Header unreadCount={3} />}

      <GameFramework
        gameTitle="Candy Crush Master"
        gameShortDescription="Match colorful candies to clear the board. Challenge your pattern recognition and strategic thinking!"
        modifiedPadding="p-2"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
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

          {/* Enhanced Combo Indicator */}
          {comboCount > 1 && (
            <div className="mb-4 relative">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6 py-3 rounded-full flex items-center gap-2 animate-bounce shadow-lg">
                <Zap className="h-5 w-5 animate-pulse" />
                <span className="font-bold text-lg">
                  {comboCount >= 5 ? 'SUPER COMBO!' : comboCount >= 3 ? 'MEGA COMBO!' : 'COMBO'} {comboCount}x
                </span>
                <Sparkles className="h-5 w-5 animate-spin" />
              </div>
              {comboCount >= 3 && (
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-full blur opacity-75 animate-pulse"></div>
              )}
            </div>
          )}

          {/* Game Board with Enhanced Animations */}
          <div className="mb-6 relative">
            <div
              className="grid gap-1 p-4 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-xl shadow-2xl relative overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                maxWidth: '600px',
                aspectRatio: '1'
              }}
            >
              {/* Particle Effects */}
              {particles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute pointer-events-none animate-ping"
                  style={{
                    left: `${particle.x}px`,
                    top: `${particle.y}px`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    borderRadius: '50%',
                    opacity: particle.life,
                    transform: `translate(${particle.velocityX * 10}px, ${particle.velocityY * 10}px)`,
                    animation: `particleFloat 2s ease-out forwards`
                  }}
                />
              ))}

              {board.map((row, rowIndex) =>
                row.map((candy, colIndex) => {
                  const isSelected = selectedCandy && selectedCandy.row === rowIndex && selectedCandy.col === colIndex;
                  const isFlashing = flashingCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
                  const isExploding = explodingCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
                  const isFalling = fallingCandies.some(f => f.to.row === rowIndex && f.to.col === colIndex);

                  return (
                    <div
                      key={candy.id}
                      className={`
                        aspect-square rounded-lg cursor-pointer transition-all duration-300
                        flex items-center justify-center text-2xl font-bold relative
                        ${candyColors[candy.type] || 'bg-gray-300'}
                        ${isSelected ? 'ring-4 ring-yellow-400 scale-110 shadow-xl' : ''}
                        ${isFlashing ? 'animate-pulse bg-white scale-110' : ''}
                        ${isExploding ? 'animate-ping scale-150 opacity-75' : ''}
                        ${isFalling ? 'animate-bounce' : ''}
                        ${candy.isNew ? 'animate-bounce scale-110' : ''}
                        ${isAnimating && !isSelected ? 'pointer-events-none' : 'hover:scale-105 hover:rotate-3'}
                        shadow-lg hover:shadow-xl
                        ${comboCount > 2 ? 'animate-pulse' : ''}
                      `}
                      onClick={() => handleCandyClick(rowIndex, colIndex)}
                      style={{
                        fontSize: gridSize > 8 ? '1.2rem' : '1.5rem',
                        minHeight: gridSize > 8 ? '40px' : '50px',
                        animationDelay: `${(rowIndex + colIndex) * 0.1}s`,
                        filter: isExploding ? 'brightness(2) saturate(2)' : 'none',
                        transform: `
                          ${isExploding ? 'scale(1.3) rotate(360deg)' : ''}
                          ${isSelected ? 'scale(1.1) translateY(-5px)' : ''}
                          ${candy.fallDistance > 0 ? `translateY(-${candy.fallDistance * 20}px)` : ''}
                        `
                      }}
                    >
                      {candy.type}
                      {candy.special && (
                        <Star className="absolute h-3 w-3 text-yellow-300 top-0 right-0 animate-spin" />
                      )}
                      
                      {/* Glow effect for selected candy */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-lg bg-yellow-400 opacity-30 animate-pulse"></div>
                      )}
                      
                      {/* Explosion effect */}
                      {isExploding && (
                        <div className="absolute inset-0 rounded-lg bg-white opacity-80 animate-ping"></div>
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
                '✨ Click an adjacent candy to swap and create matches!' :
                '🎯 Click a candy to select it, then click an adjacent candy to swap.'
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

      {/* Custom CSS for enhanced animations */}
      <style jsx>{blobStyles}</style>
    </div>
  );
};

export default CandyCrushGame;