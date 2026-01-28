import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from './GameCompletionModal';
import { 
  ChevronUp, 
  ChevronDown, 
  Target, 
  Zap, 
  Shield, 
  Heart,
  Coins,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Crosshair,
  Star,
  Trophy
} from 'lucide-react';

const PuzzleQuestAdventure = () => {
  // Game state
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes default
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Game resources and stats
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [coins, setCoins] = useState(50);
  const [ammunition, setAmmunition] = useState(20);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevels, setMaxLevels] = useState(8);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [perfectLevels, setPerfectLevels] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [efficientMoves, setEfficientMoves] = useState(0);

  // Adventure game state
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [gameGrid, setGameGrid] = useState([]);
  const [collectedItems, setCollectedItems] = useState([]);
  const [destroyedTargets, setDestroyedTargets] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [puzzleProgress, setPuzzleProgress] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameMode, setGameMode] = useState('adventure'); // 'adventure', 'puzzle', 'shooting'

  // Puzzle types
  const puzzleTypes = [
    {
      id: 'kofi_path',
      name: 'Kofi Path Finding',
      description: 'Guide Kofi through the optimal path',
      icon: '🗺️',
      difficulty: 'Easy',
      points: 15
    },
    {
      id: 'lolo_logic',
      name: 'Lolo Logic Puzzle',
      description: 'Solve the logical sequence',
      icon: '🧩',
      difficulty: 'Moderate',
      points: 25
    },
    {
      id: 'turn_navigation',
      name: 'Turn Left Challenge',
      description: 'Navigate using only left turns',
      icon: '↰',
      difficulty: 'Moderate',
      points: 20
    },
    {
      id: 'balloon_shooter',
      name: 'Balloon Target Practice',
      description: 'Pop balloons in the correct sequence',
      icon: '🎈',
      difficulty: 'Easy',
      points: 18
    },
    {
      id: 'tank_strategy',
      name: 'TankZ Strategy',
      description: 'Destroy targets with limited ammunition',
      icon: '🚗',
      difficulty: 'Hard',
      points: 30
    }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: {
      timeLimit: 1500, // 25 minutes
      maxLevels: 6,
      startingHealth: 120,
      startingEnergy: 120,
      startingCoins: 75,
      startingAmmo: 30,
      description: 'Generous resources, more time, easier puzzles'
    },
    Moderate: {
      timeLimit: 1200, // 20 minutes
      maxLevels: 8,
      startingHealth: 100,
      startingEnergy: 100,
      startingCoins: 50,
      startingAmmo: 20,
      description: 'Balanced resources and time, moderate challenges'
    },
    Hard: {
      timeLimit: 900, // 15 minutes
      maxLevels: 10,
      startingHealth: 80,
      startingEnergy: 80,
      startingCoins: 30,
      startingAmmo: 15,
      description: 'Limited resources, tight time, complex puzzles'
    }
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setMaxLevels(settings.maxLevels);
    setCurrentLevel(1);
    setPuzzlesSolved(0);
    setPerfectLevels(0);
    setTotalMoves(0);
    setEfficientMoves(0);
    
    setHealth(settings.startingHealth);
    setEnergy(settings.startingEnergy);
    setCoins(settings.startingCoins);
    setAmmunition(settings.startingAmmo);
    
    setPlayerPosition({ x: 1, y: 1 });
    setCollectedItems([]);
    setDestroyedTargets([]);
    setCurrentPuzzle(null);
    setPuzzleProgress(0);
    setLevelComplete(false);
    setGameMode('adventure');
    
    generateLevel(1);
  }, [difficulty]);

  // Generate level grid
  const generateLevel = (level) => {
    const gridSize = 6;
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('empty'));
    
    // Place walls randomly
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (Math.random() < 0.15 && !(i === 1 && j === 1)) {
          newGrid[i][j] = 'wall';
        }
      }
    }
    
    // Place items and targets
    const itemTypes = ['coin', 'health', 'energy', 'ammo', 'puzzle', 'target'];
    const itemCount = Math.min(8 + level, 15);
    
    for (let i = 0; i < itemCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
      } while (newGrid[x][y] !== 'empty' || (x === 1 && y === 1));
      
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      newGrid[x][y] = itemType;
    }
    
    // Place exit
    newGrid[gridSize - 2][gridSize - 2] = 'exit';
    
    setGameGrid(newGrid);
    setPlayerPosition({ x: 1, y: 1 });
    setLevelComplete(false);
  };

  // Move player
  const movePlayer = (direction) => {
    if (gameState !== 'playing' || gameMode !== 'adventure') return;
    
    const { x, y } = playerPosition;
    let newX = x, newY = y;
    
    switch (direction) {
      case 'up': newX = Math.max(0, x - 1); break;
      case 'down': newX = Math.min(gameGrid.length - 1, x + 1); break;
      case 'left': newY = Math.max(0, y - 1); break;
      case 'right': newY = Math.min(gameGrid[0].length - 1, y + 1); break;
    }
    
    // Check if move is valid
    if (gameGrid[newX] && gameGrid[newX][newY] !== 'wall') {
      setPlayerPosition({ x: newX, y: newY });
      setTotalMoves(prev => prev + 1);
      setEnergy(prev => Math.max(0, prev - 2));
      
      // Handle item collection
      handleItemInteraction(newX, newY);
    }
  };

  // Handle item interaction
  const handleItemInteraction = (x, y) => {
    const item = gameGrid[x][y];
    
    switch (item) {
      case 'coin':
        setCoins(prev => prev + 10);
        setCollectedItems(prev => [...prev, { type: 'coin', x, y }]);
        updateGrid(x, y, 'empty');
        break;
      case 'health':
        setHealth(prev => Math.min(100, prev + 20));
        setCollectedItems(prev => [...prev, { type: 'health', x, y }]);
        updateGrid(x, y, 'empty');
        break;
      case 'energy':
        setEnergy(prev => Math.min(100, prev + 25));
        setCollectedItems(prev => [...prev, { type: 'energy', x, y }]);
        updateGrid(x, y, 'empty');
        break;
      case 'ammo':
        setAmmunition(prev => prev + 5);
        setCollectedItems(prev => [...prev, { type: 'ammo', x, y }]);
        updateGrid(x, y, 'empty');
        break;
      case 'puzzle':
        startPuzzle();
        updateGrid(x, y, 'empty');
        break;
      case 'target':
        if (ammunition > 0) {
          setAmmunition(prev => prev - 1);
          setDestroyedTargets(prev => [...prev, { x, y }]);
          updateGrid(x, y, 'empty');
          setCoins(prev => prev + 15);
        }
        break;
      case 'exit':
        if (collectedItems.length >= 3) {
          completeLevel();
        }
        break;
    }
  };

  // Update grid
  const updateGrid = (x, y, newValue) => {
    const newGrid = [...gameGrid];
    newGrid[x][y] = newValue;
    setGameGrid(newGrid);
  };

  // Start puzzle mini-game
  const startPuzzle = () => {
    const randomPuzzle = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
    setCurrentPuzzle(randomPuzzle);
    setGameMode('puzzle');
    setPuzzleProgress(0);
  };

  // Solve puzzle step
  const solvePuzzleStep = () => {
    if (gameMode !== 'puzzle' || !currentPuzzle) return;
    
    setPuzzleProgress(prev => {
      const newProgress = prev + 20;
      if (newProgress >= 100) {
        // Puzzle completed
        setPuzzlesSolved(prev => prev + 1);
        setCoins(prev => prev + currentPuzzle.points);
        setCurrentPuzzle(null);
        setGameMode('adventure');
        setEfficientMoves(prev => prev + 1);
        return 0;
      }
      return newProgress;
    });
    
    setEnergy(prev => Math.max(0, prev - 5));
  };

  // Complete level
  const completeLevel = () => {
    const levelPerfect = health >= 80 && energy >= 50 && collectedItems.length >= 5;
    if (levelPerfect) {
      setPerfectLevels(prev => prev + 1);
    }
    
    setLevelComplete(true);
    
    if (currentLevel >= maxLevels) {
      endGame(true);
    } else {
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        generateLevel(currentLevel + 1);
        // Restore some resources for next level
        setHealth(prev => Math.min(100, prev + 10));
        setEnergy(prev => Math.min(100, prev + 15));
      }, 2000);
    }
  };

  // End game
  const endGame = (completed) => {
    setFinalScore(score);
    setGameState('finished');
    setShowCompletionModal(true);
  };

  // Calculate score
  const calculateScore = useCallback(() => {
    if (gameState !== 'playing') return score;

    const settings = difficultySettings[difficulty];

    // Level progression score (0-50 points)
    const levelScore = (currentLevel / settings.maxLevels) * 50;

    // Puzzle solving score (0-40 points)
    const puzzleScore = (puzzlesSolved / (settings.maxLevels * 1.5)) * 40;

    // Resource management score (0-30 points)
    const avgResourceLevel = (health + energy + (coins * 2) + (ammunition * 3)) / 400;
    const resourceScore = Math.min(30, avgResourceLevel * 30);

    // Perfect levels bonus (0-25 points)
    const perfectScore = (perfectLevels / settings.maxLevels) * 25;

    // Efficiency bonus (0-20 points)
    const efficiency = totalMoves > 0 ? efficientMoves / totalMoves : 0;
    const efficiencyBonus = efficiency * 20;

    // Time bonus (0-15 points)
    const timeUsed = settings.timeLimit - timeRemaining;
    const timeEfficiency = Math.max(0, 1 - (timeUsed / settings.timeLimit));
    const timeBonus = timeEfficiency * 15;

    // Collection bonus (0-10 points)
    const collectionBonus = Math.min(10, collectedItems.length * 0.5);

    // Strategy bonus (0-10 points)
    const strategyBonus = Math.min(10, destroyedTargets.length * 2);

    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;

    let finalScore = (levelScore + puzzleScore + resourceScore + perfectScore + efficiencyBonus + timeBonus + collectionBonus + strategyBonus) * difficultyMultiplier;

    // Apply scaling to make 200 very challenging but achievable
    finalScore = finalScore * 0.85;

    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [gameState, currentLevel, puzzlesSolved, health, energy, coins, ammunition, perfectLevels, totalMoves, efficientMoves, timeRemaining, collectedItems, destroyedTargets, difficulty, score]);

  // Update score
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endGame(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Handle start game
  const handleStart = () => {
    initializeGame();
  };

  // Handle reset game
  const handleReset = () => {
    initializeGame();
    setShowCompletionModal(false);
  };

  // Handle game complete
  const handleGameComplete = (payload) => {
  };

  // Get cell content
  const getCellContent = (item, x, y) => {
    const isPlayer = playerPosition.x === x && playerPosition.y === y;
    
    if (isPlayer) {
      return <div className="text-2xl animate-bounce">🧙‍♂️</div>;
    }
    
    switch (item) {
      case 'wall': return <div className="w-full h-full bg-gray-800 rounded"></div>;
      case 'coin': return <div className="text-2xl animate-pulse">🪙</div>;
      case 'health': return <div className="text-2xl animate-pulse">❤️</div>;
      case 'energy': return <div className="text-2xl animate-pulse">⚡</div>;
      case 'ammo': return <div className="text-2xl animate-pulse">🔫</div>;
      case 'puzzle': return <div className="text-2xl animate-spin">🧩</div>;
      case 'target': return <div className="text-2xl animate-bounce">🎯</div>;
      case 'exit': return <div className="text-2xl animate-pulse">🚪</div>;
      default: return null;
    }
  };

  // Get resource color
  const getResourceColor = (value, max = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Custom stats for framework
  const customStats = {
    currentLevel,
    maxLevels,
    puzzlesSolved,
    perfectLevels,
    totalMoves,
    efficiency: totalMoves > 0 ? Math.round((efficientMoves / totalMoves) * 100) : 100,
    itemsCollected: collectedItems.length,
    targetsDestroyed: destroyedTargets.length
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Puzzle Quest Adventure"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle icon */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <span className="text-2xl">🗺️</span>
                  How to Master Puzzle Quest Adventure
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Instructions */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <Target className="h-4 w-4" />
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Navigate through levels, solve puzzles, collect items, and reach the exit. Manage resources strategically!
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <Clock className="h-4 w-4" />
                    ⏱️ Difficulty Levels
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• <strong>Easy:</strong> 6 levels, 25min, generous resources</li>
                    <li>• <strong>Moderate:</strong> 8 levels, 20min, balanced challenge</li>
                    <li>• <strong>Hard:</strong> 10 levels, 15min, limited resources</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <Award className="h-4 w-4" />
                    📊 Scoring System
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Level progression (50pts max)</li>
                    <li>• Puzzle solving (40pts max)</li>
                    <li>• Resource management (30pts max)</li>
                    <li>• Perfect levels & efficiency bonuses</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <Zap className="h-4 w-4" />
                    🎮 Game Elements
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Adventure navigation (Kofi/Lolo style)</li>
                    <li>• Puzzle mini-games</li>
                    <li>• Target shooting (Balloons/TankZ)</li>
                    <li>• Strategic resource management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Problem Solving"
        gameState={gameState}
        setGameState={setGameState}
        score={gameState === 'finished' ? finalScore : score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        {/* Game Content */}
        <div className="space-y-6">
          {/* Level Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level {currentLevel} of {maxLevels}
              </h3>
              <div className="text-sm text-gray-600">
                Mode: <span className="font-semibold capitalize">{gameMode}</span>
              </div>
            </div>
            {levelComplete && (
              <div className="mt-2 text-green-600 font-semibold animate-pulse">
                🎉 Level Complete! Moving to next level...
              </div>
            )}
          </div>

          {/* Resources Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 text-center shadow-md">
              <Heart className="h-6 w-6 mx-auto mb-1 text-red-600" />
              <div className="text-sm text-gray-600">Health</div>
              <div className={`text-lg font-bold ${getResourceColor(health)}`}>{health}</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-md">
              <Zap className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <div className="text-sm text-gray-600">Energy</div>
              <div className={`text-lg font-bold ${getResourceColor(energy)}`}>{energy}</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-md">
              <Coins className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
              <div className="text-sm text-gray-600">Coins</div>
              <div className="text-lg font-bold text-yellow-600">{coins}</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-md">
              <Crosshair className="h-6 w-6 mx-auto mb-1 text-purple-600" />
              <div className="text-sm text-gray-600">Ammo</div>
              <div className="text-lg font-bold text-purple-600">{ammunition}</div>
            </div>
          </div>

          {/* Adventure Mode */}
          {gameMode === 'adventure' && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🗺️ Adventure Grid
              </h3>
              
              {/* Game Grid */}
              <div className="grid grid-cols-6 gap-1 max-w-md mx-auto mb-4">
                {gameGrid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-12 h-12 border border-gray-300 rounded flex items-center justify-center transition-all duration-300 ${
                        playerPosition.x === rowIndex && playerPosition.y === colIndex
                          ? 'bg-blue-200 border-blue-500 shadow-lg ring-2 ring-blue-300'
                          : cell === 'wall'
                          ? 'bg-gray-800'
                          : cell === 'exit'
                          ? 'bg-green-200 border-green-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {getCellContent(cell, rowIndex, colIndex)}
                    </div>
                  ))
                )}
              </div>

              {/* Movement Controls */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => movePlayer('up')}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => movePlayer('left')}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => movePlayer('down')}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ArrowDown className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => movePlayer('right')}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>🧙‍♂️</span>
                  <span>Player</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🪙</span>
                  <span>Coins</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🧩</span>
                  <span>Puzzle</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🎯</span>
                  <span>Target</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>❤️</span>
                  <span>Health</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⚡</span>
                  <span>Energy</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔫</span>
                  <span>Ammo</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🚪</span>
                  <span>Exit</span>
                </div>
              </div>
            </div>
          )}

          {/* Puzzle Mode */}
          {gameMode === 'puzzle' && currentPuzzle && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentPuzzle.icon} {currentPuzzle.name}
              </h3>
              <p className="text-gray-600 mb-4">{currentPuzzle.description}</p>
              
              {/* Puzzle Progress */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${puzzleProgress}%` }}
                ></div>
              </div>
              
              {/* Puzzle Interface */}
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">{currentPuzzle.icon}</div>
                <p className="text-gray-700">
                  Progress: {puzzleProgress}% | Reward: {currentPuzzle.points} coins
                </p>
                <button
                  onClick={solvePuzzleStep}
                  disabled={energy < 5}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    energy < 5
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Solve Step (-5 Energy)
                </button>
              </div>
            </div>
          )}

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white rounded-lg p-3 shadow-md">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Puzzles Solved
              </div>
              <div className="text-xl font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesSolved}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 shadow-md">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Perfect Levels
              </div>
              <div className="text-xl font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {perfectLevels}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 shadow-md">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Efficiency
              </div>
              <div className="text-xl font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.efficiency}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 shadow-md">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Items Found
              </div>
              <div className="text-xl font-semibold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {collectedItems.length}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {energy < 20 && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <p style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <strong>Low Energy!</strong> Find energy items or rest to recover.
                </p>
              </div>
            </div>
          )}

          {collectedItems.length >= 3 && gameMode === 'adventure' && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <p style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <strong>Ready to Exit!</strong> You've collected enough items. Find the exit door!
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Current Objective:</h4>
            <p className="text-gray-700 text-sm">
              {gameMode === 'adventure' 
                ? `Navigate the grid, collect items (need 3+ to exit), solve puzzles, and reach the exit door. Use arrow buttons to move.`
                : gameMode === 'puzzle'
                ? `Solve the ${currentPuzzle?.name} by clicking "Solve Step" until progress reaches 100%.`
                : 'Complete the current challenge to progress.'
              }
            </p>
          </div>
        </div>
      </GameFramework>

      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
      />
    </div>
  );
};

export default PuzzleQuestAdventure;