import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const MazeLogicGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [exitPos, setExitPos] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [optimalMoves, setOptimalMoves] = useState(0);
  const [path, setPath] = useState([]);

  // Difficulty settings
  const difficultySettings = {
    Easy: { size: 8, timeLimit: 60 },
    Moderate: { size: 12, timeLimit: 50 },
    Hard: { size: 16, timeLimit: 40 }
  };

  // Generate maze using recursive backtracking
  const generateMaze = useCallback((size) => {
    const maze = Array(size).fill().map(() => Array(size).fill(1)); // 1 = wall, 0 = path

    // Simple maze generation - create a path from start to end
    const stack = [];
    const visited = Array(size).fill().map(() => Array(size).fill(false));

    // Start position
    const startX = 1;
    const startY = 1;
    maze[startY][startX] = 0;
    visited[startY][startX] = true;
    stack.push({ x: startX, y: startY });

    const directions = [
      { x: 0, y: -2 }, // up
      { x: 2, y: 0 },  // right
      { x: 0, y: 2 },  // down
      { x: -2, y: 0 }  // left
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];

      // Find unvisited neighbors
      directions.forEach(dir => {
        const newX = current.x + dir.x;
        const newY = current.y + dir.y;

        if (newX > 0 && newX < size - 1 && newY > 0 && newY < size - 1 && !visited[newY][newX]) {
          neighbors.push({ x: newX, y: newY });
        }
      });

      if (neighbors.length > 0) {
        // Choose random neighbor
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Remove wall between current and next
        const wallX = current.x + (next.x - current.x) / 2;
        const wallY = current.y + (next.y - current.y) / 2;
        maze[wallY][wallX] = 0;
        maze[next.y][next.x] = 0;

        visited[next.y][next.x] = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    return maze;
  }, []);

  // Find shortest path using BFS
  const findShortestPath = useCallback((maze, start, end) => {
    const queue = [{ ...start, path: [start] }];
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);

    const directions = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
    ];

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.x === end.x && current.y === end.y) {
        return current.path.length - 1; // Number of moves
      }

      directions.forEach(dir => {
        const newX = current.x + dir.x;
        const newY = current.y + dir.y;
        const key = `${newX},${newY}`;

        if (
          newX >= 0 && newX < maze[0].length &&
          newY >= 0 && newY < maze.length &&
          maze[newY][newX] === 0 &&
          !visited.has(key)
        ) {
          visited.add(key);
          queue.push({
            x: newX,
            y: newY,
            path: [...current.path, { x: newX, y: newY }]
          });
        }
      });
    }

    return -1; // No path found
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const newMaze = generateMaze(settings.size);

    // Set start and end positions
    const start = { x: 1, y: 1 };
    const end = { x: settings.size - 2, y: settings.size - 2 };

    // Ensure end position is accessible
    newMaze[end.y][end.x] = 0;

    // Calculate optimal path
    const optimal = findShortestPath(newMaze, start, end);

    setMaze(newMaze);
    setPlayerPos(start);
    setExitPos(end);
    setMoves(0);
    setOptimalMoves(optimal);
    setPath([start]);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
  }, [difficulty, generateMaze, findShortestPath]);

  // Handle player movement
  const handleMove = useCallback((direction) => {
    if (gameState !== 'playing') return;

    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    const dir = directions[direction];
    if (!dir) return;

    const newX = playerPos.x + dir.x;
    const newY = playerPos.y + dir.y;

    // Check bounds and walls
    if (
      newX >= 0 && newX < maze[0].length &&
      newY >= 0 && newY < maze.length &&
      maze[newY][newX] === 0
    ) {
      const newPos = { x: newX, y: newY };
      setPlayerPos(newPos);
      setPath(prev => [...prev, newPos]);
      setMoves(prev => prev + 1);

      // Check if reached exit
      if (newX === exitPos.x && newY === exitPos.y) {
        setGameState('finished');
      }
    }
  }, [gameState, playerPos, maze, exitPos]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
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
  }, [handleMove]);

  // Calculate score
  useEffect(() => {
    if (moves > 0 && optimalMoves > 0) {
      const efficiency = Math.max(0, optimalMoves / moves);
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
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    moves,
    optimalMoves,
    time: difficultySettings[difficulty].timeLimit - timeRemaining
  };

  const getCellClass = (x, y) => {
    if (playerPos.x === x && playerPos.y === y) return 'bg-[#FF6B3E]';
    if (exitPos.x === x && exitPos.y === y) return 'bg-green-500';
    if (path.some(p => p.x === x && p.y === y)) return 'bg-orange-200';
    if (maze[y] && maze[y][x] === 0) return 'bg-white';
    return 'bg-gray-800';
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Maze Logic"
        gameDescription="Navigate from start to exit in the shortest path possible!"
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
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md">
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
                {optimalMoves}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Efficiency
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {moves > 0 ? Math.round((optimalMoves / moves) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Maze Grid */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${difficultySettings[difficulty].size}, 1fr)`,
                maxWidth: '400px'
              }}
            >
              {maze.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`aspect-square border border-gray-300 ${getCellClass(x, y)}`}
                    style={{
                      width: `${Math.min(20, 400 / difficultySettings[difficulty].size)}px`,
                      height: `${Math.min(20, 400 / difficultySettings[difficulty].size)}px`
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div></div>
            <button
              onClick={() => handleMove('up')}
              className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              ↑
            </button>
            <div></div>
            <button
              onClick={() => handleMove('left')}
              className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              ←
            </button>
            <div></div>
            <button
              onClick={() => handleMove('right')}
              className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              →
            </button>
            <div></div>
            <button
              onClick={() => handleMove('down')}
              className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              ↓
            </button>
            <div></div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FF6B3E] rounded"></div>
              <span style={{ fontFamily: 'Roboto, sans-serif' }}>Player</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span style={{ fontFamily: 'Roboto, sans-serif' }}>Exit</span>
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
          <div className="mt-4 text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Use arrow keys or WASD to move. Find the shortest path to the green exit!
            </p>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default MazeLogicGame;
