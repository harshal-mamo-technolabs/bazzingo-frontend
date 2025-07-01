import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const TileSwitchGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [tiles, setTiles] = useState([]);
  const [emptyPosition, setEmptyPosition] = useState({ row: 0, col: 0 });
  const [moves, setMoves] = useState(0);
  const [optimalMoves, setOptimalMoves] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState(1);

  // Difficulty settings
  const difficultySettings = {
    Easy: { gridSize: 3, timeLimit: 60, puzzleType: 'numbers' },
    Moderate: { gridSize: 4, timeLimit: 50, puzzleType: 'numbers' },
    Hard: { gridSize: 4, timeLimit: 40, puzzleType: 'image' }
  };

  // Generate solved state
  const generateSolvedState = useCallback((size, type) => {
    const solved = [];
    for (let row = 0; row < size; row++) {
      const tileRow = [];
      for (let col = 0; col < size; col++) {
        if (row === size - 1 && col === size - 1) {
          tileRow.push(null); // Empty space
        } else {
          const tileNumber = row * size + col + 1;
          if (type === 'numbers') {
            tileRow.push({ id: tileNumber, display: tileNumber.toString(), color: '#3B82F6' });
          } else {
            // For image puzzles, use colored tiles with patterns
            const colors = ['#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4'];
            tileRow.push({
              id: tileNumber,
              display: '●',
              color: colors[tileNumber % colors.length]
            });
          }
        }
      }
      solved.push(tileRow);
    }
    return solved;
  }, []);

  // Shuffle tiles by making random valid moves
  const shuffleTiles = useCallback((solvedState, size) => {
    const shuffled = solvedState.map(row => [...row]);
    let emptyRow = size - 1;
    let emptyCol = size - 1;

    // Make 100 random valid moves to shuffle
    for (let i = 0; i < 100; i++) {
      const possibleMoves = [];

      // Check all four directions
      if (emptyRow > 0) possibleMoves.push({ row: emptyRow - 1, col: emptyCol });
      if (emptyRow < size - 1) possibleMoves.push({ row: emptyRow + 1, col: emptyCol });
      if (emptyCol > 0) possibleMoves.push({ row: emptyRow, col: emptyCol - 1 });
      if (emptyCol < size - 1) possibleMoves.push({ row: emptyRow, col: emptyCol + 1 });

      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

      // Swap tile with empty space
      shuffled[emptyRow][emptyCol] = shuffled[randomMove.row][randomMove.col];
      shuffled[randomMove.row][randomMove.col] = null;

      emptyRow = randomMove.row;
      emptyCol = randomMove.col;
    }

    return { shuffled, emptyPosition: { row: emptyRow, col: emptyCol } };
  }, []);

  // Calculate Manhattan distance (heuristic for optimal moves)
  const calculateOptimalMoves = useCallback((currentState, size) => {
    let distance = 0;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const tile = currentState[row][col];
        if (tile !== null) {
          const targetRow = Math.floor((tile.id - 1) / size);
          const targetCol = (tile.id - 1) % size;
          distance += Math.abs(row - targetRow) + Math.abs(col - targetCol);
        }
      }
    }

    return Math.ceil(distance / 2); // Rough estimate
  }, []);

  // Check if puzzle is solved
  const isPuzzleSolved = useCallback((currentState, size) => {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (row === size - 1 && col === size - 1) {
          if (currentState[row][col] !== null) return false;
        } else {
          const expectedId = row * size + col + 1;
          if (!currentState[row][col] || currentState[row][col].id !== expectedId) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  // Handle tile click
  const handleTileClick = (row, col) => {
    if (gameState !== 'playing') return;

    const settings = difficultySettings[difficulty];
    const size = settings.gridSize;

    // Check if clicked tile is adjacent to empty space
    const rowDiff = Math.abs(row - emptyPosition.row);
    const colDiff = Math.abs(col - emptyPosition.col);

    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      // Valid move - swap tile with empty space
      const newTiles = tiles.map(tileRow => [...tileRow]);
      newTiles[emptyPosition.row][emptyPosition.col] = newTiles[row][col];
      newTiles[row][col] = null;

      setTiles(newTiles);
      setEmptyPosition({ row, col });
      setMoves(prev => prev + 1);

      // Check if puzzle is solved
      if (isPuzzleSolved(newTiles, size)) {
        setPuzzlesSolved(prev => prev + 1);

        // Generate new puzzle after delay
        setTimeout(() => {
          setCurrentPuzzle(prev => prev + 1);
          generateNewPuzzle();
        }, 1500);
      }
    }
  };

  // Generate new puzzle
  const generateNewPuzzle = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const size = settings.gridSize;

    const solvedState = generateSolvedState(size, settings.puzzleType);
    const { shuffled, emptyPosition: newEmptyPos } = shuffleTiles(solvedState, size);

    setTiles(shuffled);
    setEmptyPosition(newEmptyPos);
    setMoves(0);
    setOptimalMoves(calculateOptimalMoves(shuffled, size));
  }, [difficulty, generateSolvedState, shuffleTiles, calculateOptimalMoves]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setPuzzlesSolved(0);
    setCurrentPuzzle(1);
    setScore(0);
    setTimeRemaining(difficultySettings[difficulty].timeLimit);
  }, [difficulty]);

  // Calculate score using Problem-Solving formula
  useEffect(() => {
    if (moves > 0) {
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;

      let newScore = 200 - ((moves - optimalMoves) * 5 + timeUsed * 0.5);
      newScore = Math.max(20, Math.min(200, newScore));

      setScore(newScore);
    }
  }, [moves, optimalMoves, timeRemaining, difficulty]);

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
    generateNewPuzzle();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    moves,
    optimalMoves,
    time: difficultySettings[difficulty].timeLimit - timeRemaining
  };

  const getTileClass = (row, col) => {
    const tile = tiles[row] && tiles[row][col];
    const isAdjacent = Math.abs(row - emptyPosition.row) + Math.abs(col - emptyPosition.col) === 1;

    let baseClass = 'aspect-square border-2 rounded-lg transition-all duration-200 flex items-center justify-center font-bold text-white cursor-pointer';

    if (tile) {
      baseClass += isAdjacent
        ? ' border-[#FF6B3E] hover:scale-105 shadow-md'
        : ' border-gray-300 hover:border-gray-400';
    } else {
      baseClass += ' border-gray-300 bg-gray-100 cursor-default';
    }

    return baseClass;
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Tile Switch"
        gameDescription="Rearrange sliding tiles to form the correct sequence!"
        category="Problem-Solving"
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
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-lg">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Puzzle
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentPuzzle}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Moves
              </div>
              <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {moves}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Optimal
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ~{optimalMoves}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Solved
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesSolved}
              </div>
            </div>
          </div>

          {/* Puzzle Grid */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div
              className="grid gap-2 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridSize}, 1fr)`,
                maxWidth: '320px'
              }}
            >
              {tiles.map((row, rowIndex) =>
                row.map((tile, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleTileClick(rowIndex, colIndex)}
                    className={getTileClass(rowIndex, colIndex)}
                    style={{
                      backgroundColor: tile ? tile.color : 'transparent',
                      width: `${Math.min(70, 320 / difficultySettings[difficulty].gridSize)}px`,
                      height: `${Math.min(70, 320 / difficultySettings[difficulty].gridSize)}px`
                    }}
                  >
                    {tile && (
                      <span className="text-lg font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {tile.display}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Target Pattern Display */}
          <div className="mb-6 text-center">
            <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Target Pattern:
            </div>
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridSize}, 1fr)`,
                maxWidth: '160px'
              }}
            >
              {generateSolvedState(difficultySettings[difficulty].gridSize, difficultySettings[difficulty].puzzleType).map((row, rowIndex) =>
                row.map((tile, colIndex) => (
                  <div
                    key={`target-${rowIndex}-${colIndex}`}
                    className="aspect-square border border-gray-300 rounded flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      backgroundColor: tile ? tile.color : '#f3f4f6',
                      width: '30px',
                      height: '30px'
                    }}
                  >
                    {tile && tile.display}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Click tiles adjacent to the empty space to slide them.
              Arrange the tiles to match the target pattern shown above.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Grid size: {difficultySettings[difficulty].gridSize}×{difficultySettings[difficulty].gridSize} |
              Type: {difficultySettings[difficulty].puzzleType}
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default TileSwitchGame;
