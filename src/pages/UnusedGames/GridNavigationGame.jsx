import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const GridNavigationGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [grid, setGrid] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [walls, setWalls] = useState(new Set());
  const [path, setPath] = useState([]);
  const [collisions, setCollisions] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Difficulty settings
  const difficultySettings = {
    Easy: { gridSize: 8, wallDensity: 0.15, timeLimit: 60 },
    Moderate: { gridSize: 10, wallDensity: 0.20, timeLimit: 50 },
    Hard: { gridSize: 12, wallDensity: 0.25, timeLimit: 40 }
  };

  // Generate maze with walls
  const generateMaze = useCallback((size, wallDensity) => {
    const newWalls = new Set();
    const totalCells = size * size;
    const wallCount = Math.floor(totalCells * wallDensity);

    // Generate random walls, ensuring start and end are accessible
    const startPos = { x: 0, y: 0 };
    const endPos = { x: size - 1, y: size - 1 };

    while (newWalls.size < wallCount) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const wallKey = `${x},${y}`;

      // Don't place walls on start, end, or their immediate neighbors
      if ((x === startPos.x && y === startPos.y) ||
        (x === endPos.x && y === endPos.y) ||
        (Math.abs(x - startPos.x) <= 1 && Math.abs(y - startPos.y) <= 1) ||
        (Math.abs(x - endPos.x) <= 1 && Math.abs(y - endPos.y) <= 1)) {
        continue;
      }

      newWalls.add(wallKey);
    }

    return { walls: newWalls, start: startPos, end: endPos };
  }, []);

  // Check if path exists using BFS
  const hasValidPath = useCallback((walls, start, end, size) => {
    const queue = [start];
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);

    const directions = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
    ];

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.x === end.x && current.y === end.y) {
        return true;
      }

      for (const dir of directions) {
        const newX = current.x + dir.x;
        const newY = current.y + dir.y;
        const key = `${newX},${newY}`;

        if (newX >= 0 && newX < size && newY >= 0 && newY < size &&
          !walls.has(key) && !visited.has(key)) {
          visited.add(key);
          queue.push({ x: newX, y: newY });
        }
      }
    }

    return false;
  }, []);

  // Generate new level
  const generateNewLevel = useCallback(() => {
    const settings = difficultySettings[difficulty];
    let mazeData;

    // Keep generating until we have a valid path
    do {
      mazeData = generateMaze(settings.gridSize, settings.wallDensity);
    } while (!hasValidPath(mazeData.walls, mazeData.start, mazeData.end, settings.gridSize));

    setWalls(mazeData.walls);
    setPlayerPosition(mazeData.start);
    setTargetPosition(mazeData.end);
    setPath([mazeData.start]);
    setCollisions(0);
  }, [difficulty, generateMaze, hasValidPath]);

  // Handle player movement
  const handleMove = useCallback((direction) => {
    if (gameState !== 'playing') return;

    const settings = difficultySettings[difficulty];
    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    const dir = directions[direction];
    if (!dir) return;

    const newX = playerPosition.x + dir.x;
    const newY = playerPosition.y + dir.y;

    // Check bounds
    if (newX < 0 || newX >= settings.gridSize || newY < 0 || newY >= settings.gridSize) {
      setCollisions(prev => prev + 1);
      return;
    }

    // Check walls
    if (walls.has(`${newX},${newY}`)) {
      setCollisions(prev => prev + 1);
      return;
    }

    // Valid move
    const newPosition = { x: newX, y: newY };
    setPlayerPosition(newPosition);
    setPath(prev => [...prev, newPosition]);

    // Check if reached target
    if (newX === targetPosition.x && newY === targetPosition.y) {
      setLevelsCompleted(prev => prev + 1);

      // Generate next level after delay
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        generateNewLevel();
      }, 1500);
    }
  }, [gameState, playerPosition, targetPosition, walls, difficulty, generateNewLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleMove]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setLevelsCompleted(0);
    setCurrentLevel(1);
    setScore(0);
    setTimeRemaining(difficultySettings[difficulty].timeLimit);
  }, [difficulty]);

  // Calculate score using Spatial formula
  useEffect(() => {
    if (collisions > 0 || path.length > 1) {
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;

      let newScore = 200 - (collisions * 15 + timeUsed * 0.8);
      newScore = Math.max(0, Math.min(200, newScore));

      setScore(newScore);
    }
  }, [collisions, timeRemaining, difficulty, path.length]);

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
    generateNewLevel();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    collisions,
    time: difficultySettings[difficulty].timeLimit - timeRemaining
  };

  const getCellClass = (x, y) => {
    const isWall = walls.has(`${x},${y}`);
    const isPlayer = playerPosition.x === x && playerPosition.y === y;
    const isTarget = targetPosition.x === x && targetPosition.y === y;
    const isPath = path.some(p => p.x === x && p.y === y);

    let baseClass = 'aspect-square border border-gray-300 transition-all duration-200';

    if (isWall) {
      baseClass += ' bg-gray-800';
    } else if (isPlayer) {
      baseClass += ' bg-[#FF6B3E] border-[#FF6B3E]';
    } else if (isTarget) {
      baseClass += ' bg-green-500 border-green-600';
    } else if (isPath) {
      baseClass += ' bg-orange-200 border-orange-300';
    } else {
      baseClass += ' bg-white';
    }

    return baseClass;
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Grid Navigation"
        gameDescription="Navigate through the grid maze from start to end without hitting walls!"
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
                Collisions
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {collisions}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Completed
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {levelsCompleted}
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridSize}, 1fr)`,
                maxWidth: '400px'
              }}
            >
              {Array(difficultySettings[difficulty].gridSize).fill().map((_, y) =>
                Array(difficultySettings[difficulty].gridSize).fill().map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={getCellClass(x, y)}
                    style={{
                      width: `${Math.min(30, 400 / difficultySettings[difficulty].gridSize)}px`,
                      height: `${Math.min(30, 400 / difficultySettings[difficulty].gridSize)}px`
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div></div>
            <button
              onClick={() => handleMove('up')}
              className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-xl"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              ↑
            </button>
            <div></div>
            <button
              onClick={() => handleMove('left')}
              className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-xl"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              ←
            </button>
            <div></div>
            <button
              onClick={() => handleMove('right')}
              className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-xl"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              →
            </button>
            <div></div>
            <button
              onClick={() => handleMove('down')}
              className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-xl"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              ↓
            </button>
            <div></div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FF6B3E] rounded"></div>
              <span style={{ fontFamily: 'Roboto, sans-serif' }}>Player</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span style={{ fontFamily: 'Roboto, sans-serif' }}>Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 rounded"></div>
              <span style={{ fontFamily: 'Roboto, sans-serif' }}>Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded"></div>
              <span style={{ fontFamily: 'Roboto, sans-serif' }}>Wall</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Navigate from the orange start position to the green target.
              Use arrow keys, WASD, or the control buttons. Avoid hitting walls!
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Grid: {difficultySettings[difficulty].gridSize}×{difficultySettings[difficulty].gridSize} |
              Wall density: {Math.round(difficultySettings[difficulty].wallDensity * 100)}%
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default GridNavigationGame;
