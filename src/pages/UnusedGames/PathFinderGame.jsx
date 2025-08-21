import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const PathFinderGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [waypoints, setWaypoints] = useState([]);
  const [obstacles, setObstacles] = useState(new Set());
  const [path, setPath] = useState([]);
  const [moves, setMoves] = useState(0);
  const [optimalMoves, setOptimalMoves] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const [waypointsCollected, setWaypointsCollected] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sparkles, setSparkles] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(null);

  // Difficulty settings
  const difficultySettings = {
    Easy: { gridSize: 8, obstacleRatio: 0.15, waypointCount: 2, timeLimit: 60 },
    Moderate: { gridSize: 10, obstacleRatio: 0.20, waypointCount: 3, timeLimit: 50 },
    Hard: { gridSize: 12, obstacleRatio: 0.25, waypointCount: 4, timeLimit: 40 }
  };

  // Create sparkle effect
  const createSparkleEffect = useCallback((x, y, type = 'waypoint') => {
    const sparkleCount = type === 'target' ? 12 : 6;
    const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      color: type === 'target' ? '#10B981' : '#F59E0B'
    }));

    setSparkles(prev => [...prev, ...newSparkles]);

    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1500);
  }, []);

  // Calculate Manhattan distance for optimal path estimation
  const calculateManhattanDistance = (pos1, pos2) => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  };

  // Generate level with waypoints and obstacles
  const generateLevel = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const { gridSize, obstacleRatio, waypointCount } = settings;

    // Clear previous state
    setObstacles(new Set());
    setWaypoints([]);
    setPath([]);

    // Set start and end positions
    const startPos = { x: 0, y: 0 };
    const endPos = { x: gridSize - 1, y: gridSize - 1 };
    setPlayerPos(startPos);
    setTargetPos(endPos);

    // Generate waypoints
    const newWaypoints = [];
    for (let i = 0; i < waypointCount; i++) {
      let waypoint;
      do {
        waypoint = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
          id: i + 1,
          collected: false
        };
      } while (
        (waypoint.x === startPos.x && waypoint.y === startPos.y) ||
        (waypoint.x === endPos.x && waypoint.y === endPos.y) ||
        newWaypoints.some(w => w.x === waypoint.x && w.y === waypoint.y)
      );
      newWaypoints.push(waypoint);
    }
    setWaypoints(newWaypoints);

    // Generate obstacles
    const newObstacles = new Set();
    const obstacleCount = Math.floor(gridSize * gridSize * obstacleRatio);

    while (newObstacles.size < obstacleCount) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const obstacleKey = `${x},${y}`;

      // Don't place obstacles on important positions
      const isImportantPosition =
        (x === startPos.x && y === startPos.y) ||
        (x === endPos.x && y === endPos.y) ||
        newWaypoints.some(w => w.x === x && w.y === y) ||
        newObstacles.has(obstacleKey);

      if (!isImportantPosition) {
        newObstacles.add(obstacleKey);
      }
    }
    setObstacles(newObstacles);

    // Calculate optimal moves (rough estimation)
    let totalOptimal = calculateManhattanDistance(startPos, endPos);
    newWaypoints.forEach(waypoint => {
      totalOptimal += calculateManhattanDistance(startPos, waypoint);
    });
    setOptimalMoves(Math.ceil(totalOptimal * 0.8)); // Account for obstacles

  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setMoves(0);
    setCollisions(0);
    setWaypointsCollected(0);
    setCurrentLevel(1);
    setScore(0);
    setTimeRemaining(difficultySettings[difficulty].timeLimit);
    setSparkles([]);
    setPulseEffect(null);
  }, [difficulty]);

  // Handle player movement
  const movePlayer = useCallback((direction) => {
    if (gameState !== 'playing') return;

    const settings = difficultySettings[difficulty];
    const { gridSize } = settings;
    const { x, y } = playerPos;
    let newX = x;
    let newY = y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, y - 1);
        break;
      case 'down':
        newY = Math.min(gridSize - 1, y + 1);
        break;
      case 'left':
        newX = Math.max(0, x - 1);
        break;
      case 'right':
        newX = Math.min(gridSize - 1, x + 1);
        break;
      default:
        return;
    }

    // Check if new position is an obstacle
    if (obstacles.has(`${newX},${newY}`)) {
      setCollisions(prev => prev + 1);
      return;
    }

    // Update position and path
    const newPos = { x: newX, y: newY };
    setPlayerPos(newPos);
    setPath(prev => [...prev, newPos]);
    setMoves(prev => prev + 1);

    // Check for waypoint collection
    const waypointIndex = waypoints.findIndex(w =>
      w.x === newX && w.y === newY && !w.collected
    );

    if (waypointIndex !== -1) {
      setWaypoints(prev => prev.map((w, i) =>
        i === waypointIndex ? { ...w, collected: true } : w
      ));
      setWaypointsCollected(prev => prev + 1);

      // Create sparkle effect
      const rect = document.querySelector(`[data-cell="${newX}-${newY}"]`)?.getBoundingClientRect();
      if (rect) {
        createSparkleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, 'waypoint');
      }

      setPulseEffect(`${newX}-${newY}`);
      setTimeout(() => setPulseEffect(null), 1000);
    }

    // Check if reached target (only if all waypoints collected)
    const allWaypointsCollected = waypoints.every(w => w.collected) && waypointsCollected === waypoints.length;

    if (newX === targetPos.x && newY === targetPos.y && allWaypointsCollected) {
      setGameState('finished');

      // Create target sparkle effect
      const rect = document.querySelector(`[data-cell="${newX}-${newY}"]`)?.getBoundingClientRect();
      if (rect) {
        createSparkleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, 'target');
      }

      // Generate next level after delay
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        generateLevel();
        setGameState('playing');
      }, 2000);
    }
  }, [gameState, playerPos, obstacles, targetPos, waypoints, waypointsCollected, difficulty, createSparkleEffect, generateLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, movePlayer]);

  // Calculate score using Problem-Solving formula
  useEffect(() => {
    if (moves > 0) {
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;
      const extraMoves = Math.max(0, moves - optimalMoves);

      let newScore = 200 - (extraMoves * 5 + collisions * 10 + timeUsed * 0.5);
      newScore = Math.max(20, Math.min(200, newScore));

      setScore(newScore);
    }
  }, [moves, optimalMoves, collisions, timeRemaining, difficulty]);

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

  // Game handlers
  const handleStart = () => {
    initializeGame();
    generateLevel();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  // Get cell styling
  const getCellClass = (x, y) => {
    const isPlayer = playerPos.x === x && playerPos.y === y;
    const isTarget = targetPos.x === x && targetPos.y === y;
    const isObstacle = obstacles.has(`${x},${y}`);
    const isPath = path.some(pos => pos.x === x && pos.y === y);
    const waypoint = waypoints.find(w => w.x === x && w.y === y);
    const isPulsing = pulseEffect === `${x}-${y}`;

    let baseClass = 'aspect-square border-2 rounded-lg transition-all duration-300 flex items-center justify-center text-lg font-bold transform-gpu';

    if (isPlayer) {
      baseClass += ' bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 border-orange-300 text-white shadow-lg scale-110 ring-2 ring-orange-300 ring-opacity-75';
    } else if (isTarget) {
      const allWaypointsCollected = waypoints.every(w => w.collected);
      if (allWaypointsCollected) {
        baseClass += ' bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 border-green-300 text-white shadow-lg animate-pulse ring-2 ring-green-300 ring-opacity-75';
      } else {
        baseClass += ' bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 border-gray-300 text-white shadow-md opacity-50';
      }
    } else if (waypoint) {
      if (waypoint.collected) {
        baseClass += ' bg-gradient-to-br from-yellow-200 via-amber-300 to-yellow-400 border-yellow-300 text-yellow-800 shadow-md opacity-60';
      } else {
        baseClass += ' bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-yellow-300 text-white shadow-lg animate-pulse ring-2 ring-yellow-300 ring-opacity-75';
      }
    } else if (isObstacle) {
      baseClass += ' bg-gradient-to-br from-slate-700 via-gray-800 to-slate-900 border-slate-600 shadow-lg';
    } else if (isPath) {
      baseClass += ' bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 border-orange-300 shadow-sm';
    } else {
      baseClass += ' bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 border-slate-300 hover:border-slate-400 hover:shadow-md';
    }

    if (isPulsing) {
      baseClass += ' animate-pulse scale-125';
    }

    return baseClass;
  };

  // Get cell content (emoji/icon)
  const getCellContent = (x, y) => {
    const isPlayer = playerPos.x === x && playerPos.y === y;
    const isTarget = targetPos.x === x && targetPos.y === y;
    const waypoint = waypoints.find(w => w.x === x && w.y === y);

    if (isPlayer) return '🎯';
    if (isTarget) {
      const allWaypointsCollected = waypoints.every(w => w.collected);
      return allWaypointsCollected ? '🏆' : '🔒';
    }
    if (waypoint) {
      return waypoint.collected ? '✅' : waypoint.id;
    }
    return '';
  };

  const customStats = {
    moves,
    optimalMoves,
    collisions,
    waypointsCollected
  };

  return (
    <div>
      <Header unreadCount={3} />

      {/* Professional Particle Effects */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {sparkles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-ping font-bold"
            style={{
              left: particle.x,
              top: particle.y,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              color: particle.color,
              fontSize: '24px'
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <GameFramework
        gameTitle="Path Finder"
        gameDescription="Navigate through waypoints to reach the target while avoiding obstacles!"
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
          {/* Enhanced Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs font-bold text-blue-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 LEVEL
              </div>
              <div className="text-3xl font-black text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 rounded-2xl p-4 shadow-xl border-2 border-orange-200">
              <div className="text-xs font-bold text-orange-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                👣 MOVES
              </div>
              <div className="text-3xl font-black text-orange-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {moves}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 rounded-2xl p-4 shadow-xl border-2 border-yellow-200">
              <div className="text-xs font-bold text-yellow-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ⭐ WAYPOINTS
              </div>
              <div className="text-3xl font-black text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {waypointsCollected}/{waypoints.length}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-red-50 via-rose-50 to-red-100 rounded-2xl p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs font-bold text-red-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                💥 COLLISIONS
              </div>
              <div className="text-3xl font-black text-red-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {collisions}
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="mb-8 p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-3xl shadow-2xl border-4 border-slate-200">
            <div
              className="grid gap-2 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridSize}, 1fr)`,
                maxWidth: '480px'
              }}
            >
              {Array(difficultySettings[difficulty].gridSize).fill().map((_, y) =>
                Array(difficultySettings[difficulty].gridSize).fill().map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    data-cell={`${x}-${y}`}
                    className={getCellClass(x, y)}
                    style={{
                      width: `${Math.min(50, 480 / difficultySettings[difficulty].gridSize)}px`,
                      height: `${Math.min(50, 480 / difficultySettings[difficulty].gridSize)}px`
                    }}
                  >
                    {getCellContent(x, y)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions Panel */}
          <div className="w-full lg:w-80">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                How to Play
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Objective
                  </h4>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Navigate from the orange start position to the green target position.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Controls
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Arrow keys or WASD to move</li>
                    <li>• Avoid dark obstacles</li>
                    <li>• Find the shortest path for higher score</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Scoring
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Base score: 1000 points</li>
                    <li>• Time bonus: 2 points per second saved</li>
                    <li>• Move bonus: 10 points per move saved</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Legend
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#FF6B3E] rounded border"></div>
                      <span className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                        Player
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded border"></div>
                      <span className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                        Target
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-800 rounded border"></div>
                      <span className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                        Obstacle
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-200 rounded border border-orange-300"></div>
                      <span className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                        Path taken
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <button
              onClick={() => movePlayer('up')}
              disabled={gameState !== 'playing'}
              className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '600' }}
            >
              ⬆️ UP
            </button>
            <button
              onClick={() => movePlayer('down')}
              disabled={gameState !== 'playing'}
              className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '600' }}
            >
              ⬇️ DOWN
            </button>
            <button
              onClick={() => movePlayer('left')}
              disabled={gameState !== 'playing'}
              className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '600' }}
            >
              ⬅️ LEFT
            </button>
            <button
              onClick={() => movePlayer('right')}
              disabled={gameState !== 'playing'}
              className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '600' }}
            >
              ➡️ RIGHT
            </button>
          </div>

          {/* Beautiful Legend */}
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-2 border-gray-200 max-w-2xl">
            <div className="text-center mb-4">
              <div className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🗺️ Navigation Guide
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                <div className="text-2xl">🎯</div>
                <div>
                  <div className="font-bold text-orange-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    PLAYER
                  </div>
                  <div className="text-xs text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Your position
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
                <div className="text-2xl">⭐</div>
                <div>
                  <div className="font-bold text-yellow-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    WAYPOINTS
                  </div>
                  <div className="text-xs text-yellow-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Collect all first
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="font-bold text-green-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    TARGET
                  </div>
                  <div className="text-xs text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Final destination
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200">
                <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded"></div>
                <div>
                  <div className="font-bold text-slate-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    OBSTACLES
                  </div>
                  <div className="text-xs text-slate-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Avoid these
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-200 to-orange-400 rounded border border-orange-300"></div>
                <div>
                  <div className="font-bold text-orange-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    PATH
                  </div>
                  <div className="text-xs text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Your trail
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="text-2xl">✅</div>
                <div>
                  <div className="font-bold text-green-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    COLLECTED
                  </div>
                  <div className="text-xs text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Completed waypoint
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Instructions */}
          <div className="text-center max-w-4xl">
            <div className="p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-2xl shadow-2xl border-2 border-slate-300">
              <div className="text-3xl font-bold text-slate-800 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🧭 STRATEGIC PATHFINDING CHALLENGE
              </div>
              <p className="text-lg text-slate-700 leading-relaxed mb-8" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Navigate through the grid to collect all <span className="font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">numbered waypoints</span> before reaching the final target.
                Plan your route carefully to avoid obstacles and minimize moves for maximum score!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-blue-300 hover:border-blue-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-blue-600">🎯</div>
                  <div className="font-bold text-blue-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>SEQUENTIAL COLLECTION</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>Collect all waypoints in any order before the target unlocks</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-emerald-300 hover:border-emerald-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-emerald-600">⚡</div>
                  <div className="font-bold text-emerald-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>OPTIMAL ROUTING</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>Plan efficient paths to minimize moves and maximize score</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-orange-600">🚧</div>
                  <div className="font-bold text-orange-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>OBSTACLE AVOIDANCE</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>Navigate around barriers while maintaining efficient movement</div>
                </div>
              </div>
              <div className="mt-6 text-sm text-slate-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                💡 Use arrow keys, WASD, or the control buttons to move. Grid size and complexity increase with difficulty!
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default PathFinderGame;
