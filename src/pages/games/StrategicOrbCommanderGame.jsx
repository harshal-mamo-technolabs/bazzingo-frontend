import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Target, Zap, Shield, ChevronUp, ChevronDown, Star, Flame, Sparkles } from 'lucide-react';

// Game logic classes
class OrbGame {
  constructor(difficulty = 'Easy') {
    this.difficulty = difficulty;
    this.gridSize = this.getGridSize(difficulty);
    this.orbTypes = ['🔴', '🟡', '🟢', '🔵', '🟣', '🟠'];
    this.specialOrbs = ['💥', '⚡', '🛡️', '⭐'];
    this.grid = [];
    this.score = 0;
    this.moves = 0;
    this.targetScore = this.getTargetScore(difficulty);
    this.combos = 0;
    this.powerUps = { bombs: 2, lightning: 2, shields: 1 };
  }

  getGridSize(difficulty) {
    switch (difficulty) {
      case 'Easy': return 6;
      case 'Moderate': return 8;
      case 'Hard': return 10;
      default: return 6;
    }
  }

  getTargetScore(difficulty) {
    switch (difficulty) {
      case 'Easy': return 1000;
      case 'Moderate': return 2000;
      case 'Hard': return 3500;
      default: return 1000;
    }
  }

  initializeGrid() {
    this.grid = Array(this.gridSize).fill(null).map(() =>
      Array(this.gridSize).fill(null).map(() => ({
        type: this.orbTypes[Math.floor(Math.random() * this.orbTypes.length)],
        selected: false,
        matched: false,
        special: Math.random() < 0.05 ? this.specialOrbs[Math.floor(Math.random() * this.specialOrbs.length)] : null
      }))
    );

    // Ensure no initial matches
    this.removeInitialMatches();
  }

  removeInitialMatches() {
    let hasMatches = true;
    while (hasMatches) {
      hasMatches = false;
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          if (this.hasMatch(row, col)) {
            this.grid[row][col].type = this.orbTypes[Math.floor(Math.random() * this.orbTypes.length)];
            hasMatches = true;
          }
        }
      }
    }
  }

  hasMatch(row, col) {
    const currentType = this.grid[row][col].type;

    // Check horizontal matches
    let horizontalCount = 1;
    for (let c = col - 1; c >= 0 && this.grid[row][c].type === currentType; c--) horizontalCount++;
    for (let c = col + 1; c < this.gridSize && this.grid[row][c].type === currentType; c++) horizontalCount++;

    // Check vertical matches
    let verticalCount = 1;
    for (let r = row - 1; r >= 0 && this.grid[r][col].type === currentType; r--) verticalCount++;
    for (let r = row + 1; r < this.gridSize && this.grid[r][col].type === currentType; r++) verticalCount++;

    return horizontalCount >= 3 || verticalCount >= 3;
  }

  selectOrb(row, col) {
    if (this.grid[row][col].matched) return false;

    // Clear previous selections
    this.clearSelections();

    // Select current orb and connected orbs of same type
    this.selectConnectedOrbs(row, col, this.grid[row][col].type);

    return this.getSelectedCount() >= 3;
  }

  selectConnectedOrbs(row, col, targetType, visited = new Set()) {
    const key = `${row}-${col}`;
    if (visited.has(key) || row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return;
    if (this.grid[row][col].type !== targetType || this.grid[row][col].matched) return;

    visited.add(key);
    this.grid[row][col].selected = true;

    // Check adjacent cells (4-directional)
    this.selectConnectedOrbs(row - 1, col, targetType, visited);
    this.selectConnectedOrbs(row + 1, col, targetType, visited);
    this.selectConnectedOrbs(row, col - 1, targetType, visited);
    this.selectConnectedOrbs(row, col + 1, targetType, visited);
  }

  clearSelections() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col].selected = false;
      }
    }
  }

  getSelectedCount() {
    let count = 0;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].selected) count++;
      }
    }
    return count;
  }

  popSelectedOrbs() {
    const selectedCount = this.getSelectedCount();
    if (selectedCount < 3) return { score: 0, combo: false };

    let score = selectedCount * 100;
    let hasSpecial = false;

    // Mark selected orbs as matched and check for special orbs
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].selected) {
          this.grid[row][col].matched = true;
          if (this.grid[row][col].special) {
            hasSpecial = true;
            score += 500;
          }
        }
      }
    }

    // Combo bonus
    if (selectedCount >= 5) {
      this.combos++;
      score *= (1 + this.combos * 0.2);
    }

    // Apply gravity and fill gaps
    this.applyGravity();
    this.fillGaps();

    this.moves++;
    this.score += Math.round(score);

    return { score: Math.round(score), combo: selectedCount >= 5, special: hasSpecial };
  }

  applyGravity() {
    for (let col = 0; col < this.gridSize; col++) {
      let writeIndex = this.gridSize - 1;
      for (let row = this.gridSize - 1; row >= 0; row--) {
        if (!this.grid[row][col].matched) {
          if (writeIndex !== row) {
            this.grid[writeIndex][col] = { ...this.grid[row][col] };
            this.grid[row][col] = { type: '', selected: false, matched: true, special: null };
          }
          writeIndex--;
        }
      }
    }
  }

  fillGaps() {
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize; row++) {
        if (this.grid[row][col].matched) {
          this.grid[row][col] = {
            type: this.orbTypes[Math.floor(Math.random() * this.orbTypes.length)],
            selected: false,
            matched: false,
            special: Math.random() < 0.03 ? this.specialOrbs[Math.floor(Math.random() * this.specialOrbs.length)] : null
          };
        }
      }
    }
  }

  usePowerUp(type, row, col) {
    if (this.powerUps[type] <= 0) return false;

    this.powerUps[type]--;

    switch (type) {
      case 'bombs':
        this.explodeBomb(row, col);
        break;
      case 'lightning':
        this.lightningStrike(row, col);
        break;
      case 'shields':
        this.activateShield();
        break;
    }

    return true;
  }

  explodeBomb(row, col) {
    const radius = 2;
    let score = 0;
    for (let r = Math.max(0, row - radius); r <= Math.min(this.gridSize - 1, row + radius); r++) {
      for (let c = Math.max(0, col - radius); c <= Math.min(this.gridSize - 1, col + radius); c++) {
        if (!this.grid[r][c].matched) {
          this.grid[r][c].matched = true;
          score += 50;
        }
      }
    }
    this.score += score;
    this.applyGravity();
    this.fillGaps();
  }

  lightningStrike(row, col) {
    const orbType = this.grid[row][col].type;
    let count = 0;

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.grid[r][c].type === orbType && !this.grid[r][c].matched) {
          this.grid[r][c].matched = true;
          count++;
        }
      }
    }

    this.score += count * 150;
    this.applyGravity();
    this.fillGaps();
  }

  activateShield() {
    // Shield prevents losing a turn on no matches for next 3 moves
    this.shieldActive = 3;
  }

  getCompletionPercentage() {
    return Math.min(100, (this.score / this.targetScore) * 100);
  }

  isGameWon() {
    return this.score >= this.targetScore;
  }
}

const StrategicOrbCommanderGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes default
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Game specific state
  const [orbGame, setOrbGame] = useState(null);
  const [gameGrid, setGameGrid] = useState([]);
  const [selectedOrbs, setSelectedOrbs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [combos, setCombos] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [lastMove, setLastMove] = useState(null);
  const [powerUps, setPowerUps] = useState({ bombs: 2, lightning: 2, shields: 1 });

  // Difficulty settings
  const difficultySettings = {
    Easy: {
      timeLimit: 480, // 8 minutes
      targetScore: 1000,
      description: '6x6 grid, generous time and power-ups',
      gridSize: 6
    },
    Moderate: {
      timeLimit: 360, // 6 minutes
      targetScore: 2000,
      description: '8x8 grid, moderate time and strategy required',
      gridSize: 8
    },
    Hard: {
      timeLimit: 240, // 4 minutes
      targetScore: 3500,
      description: '10x10 grid, limited time, advanced strategy',
      gridSize: 10
    }
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setMoves(0);
    setCombos(0);
    setSelectedOrbs(0);
    setLastMove(null);
    setPowerUps({ bombs: 2, lightning: 2, shields: 1 });

    const newGame = new OrbGame(difficulty);
    newGame.initializeGrid();
    setOrbGame(newGame);
    setGameGrid([...newGame.grid]);
  }, [difficulty]);

  // Handle orb click
  const handleOrbClick = (row, col) => {
    if (gameState !== 'playing' || !orbGame) return;

    const canSelect = orbGame.selectOrb(row, col);
    const selectedCount = orbGame.getSelectedCount();

    setSelectedOrbs(selectedCount);
    setGameGrid([...orbGame.grid]);

    if (canSelect && selectedCount >= 3) {
      // Auto-pop after a short delay to show selection
      setTimeout(() => {
        const result = orbGame.popSelectedOrbs();
        setGameGrid([...orbGame.grid]);
        setMoves(orbGame.moves);
        setCombos(orbGame.combos);
        setLastMove(result);

        // Check win condition
        if (orbGame.isGameWon()) {
          endGame(true);
        }
      }, 500);
    }
  };

  // Use power-up
  const usePowerUp = (type, row, col) => {
    if (gameState !== 'playing' || !orbGame) return;

    if (orbGame.usePowerUp(type, row, col)) {
      setGameGrid([...orbGame.grid]);
      setPowerUps({ ...orbGame.powerUps });
      setMoves(orbGame.moves + 1);
    }
  };

  // Calculate score
  const calculateScore = useCallback(() => {
    if (!orbGame || gameState !== 'playing') return score;

    const settings = difficultySettings[difficulty];

    // Base game score
    const gameScore = orbGame.score;

    // Progress bonus (0-50 points)
    const progress = orbGame.getCompletionPercentage() / 100;
    const progressBonus = progress * 50;

    // Efficiency bonus (0-40 points)
    const efficiency = moves > 0 ? Math.min(1, gameScore / (moves * 100)) : 0;
    const efficiencyBonus = efficiency * 40;

    // Time bonus (0-30 points)
    const timeUsed = settings.timeLimit - timeRemaining;
    const timeEfficiency = Math.max(0, 1 - (timeUsed / settings.timeLimit));
    const timeBonus = timeEfficiency * 30;

    // Combo bonus (0-25 points)
    const comboBonus = Math.min(25, combos * 5);

    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;

    let finalScore = (progressBonus + efficiencyBonus + timeBonus + comboBonus) * difficultyMultiplier;

    // Add a portion of game score
    finalScore += Math.min(55, gameScore / 100); // Cap game score contribution

    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [orbGame, gameState, difficulty, timeRemaining, moves, combos, score]);

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

  // End game
  const endGame = (success) => {
    setFinalScore(score);
    setGameState('finished');
    setShowCompletionModal(true);
  };

  // Handle start game
  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
  };

  // Handle reset game
  const handleReset = () => {
    initializeGame();
    setShowCompletionModal(false);
  };

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') {
      setDifficulty(newDifficulty);
    }
  };

  // Handle game complete
  const handleGameComplete = (payload) => {
    console.log('Strategic Orb Commander completed:', payload);
  };

  // Get orb class name
  const getOrbClassName = (row, col) => {
    const orb = gameGrid[row] && gameGrid[row][col];
    if (!orb) return '';

    const baseClass = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 border-2';

    let className = baseClass;

    if (orb.selected) {
      className += ' ring-4 ring-yellow-400 ring-opacity-75 animate-pulse scale-110 shadow-lg';
    }

    if (orb.matched) {
      className += ' opacity-50 scale-75';
    } else {
      className += ' hover:shadow-lg';
    }

    // Add color-specific styling
    if (orb.type === '🔴') className += ' bg-red-100 border-red-300';
    else if (orb.type === '🟡') className += ' bg-yellow-100 border-yellow-300';
    else if (orb.type === '🟢') className += ' bg-green-100 border-green-300';
    else if (orb.type === '🔵') className += ' bg-blue-100 border-blue-300';
    else if (orb.type === '🟣') className += ' bg-purple-100 border-purple-300';
    else if (orb.type === '🟠') className += ' bg-orange-100 border-orange-300';
    else className += ' bg-gray-100 border-gray-300';

    return className;
  };

  // Custom stats for the framework
  const customStats = {
    moves,
    combos,
    selectedOrbs,
    targetScore: orbGame ? orbGame.targetScore : 0,
    completionPercentage: orbGame ? Math.round(orbGame.getCompletionPercentage()) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Strategic Orb Commander"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle icon */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Strategic Orb Commander
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
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Click connected orbs of the same color to pop them. Reach the target score before time runs out!
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎚️ Strategy
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Plan your moves carefully. Larger groups give more points, and combos multiply your score!
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    ⚡ Power-ups
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• 💥 Bomb: Explodes area</li>
                    <li>• ⚡ Lightning: Removes all same color</li>
                    <li>• 🛡️ Shield: Extra protection</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🏆 Scoring
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• 3+ orbs: 100 points each</li>
                    <li>• Special orbs: +500 points</li>
                    <li>• 5+ combo: Score multiplier</li>
                    <li>• Efficiency & time bonuses</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Critical Thinking"
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
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-4xl px-2">
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Target Score
              </div>
              <div className="text-sm sm:text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {orbGame ? orbGame.targetScore : 0}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Moves
              </div>
              <div className="text-sm sm:text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {moves}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Combos
              </div>
              <div className="text-sm sm:text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {combos}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Selected
              </div>
              <div className="text-sm sm:text-lg font-semibold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {selectedOrbs}
              </div>
            </div>
          </div>

          {/* Power-ups */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 px-2">
            <button
              onClick={() => usePowerUp('bombs')}
              disabled={!powerUps.bombs}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-2 ${!powerUps.bombs
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
            >
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              Bomb ({powerUps.bombs})
            </button>

            <button
              onClick={() => usePowerUp('lightning')}
              disabled={!powerUps.lightning}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-2 ${!powerUps.lightning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              Lightning ({powerUps.lightning})
            </button>

            <button
              onClick={() => usePowerUp('shields')}
              disabled={!powerUps.shields}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-2 ${!powerUps.shields
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              Shield ({powerUps.shields})
            </button>
          </div>

          {/* Orb Grid */}
          {gameGrid.length > 0 && (
            <div className="bg-white p-2 sm:p-4 rounded-lg shadow-xl border-2 border-gray-300 transition-all duration-500 hover:shadow-2xl">
              <div
                className="grid gap-1 sm:gap-2 max-w-2xl mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridSize}, minmax(0, 1fr))`
                }}
              >
                {gameGrid.map((row, rowIndex) =>
                  row.map((orb, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={getOrbClassName(rowIndex, colIndex)}
                      onClick={() => handleOrbClick(rowIndex, colIndex)}
                    >
                      <span className="relative">
                        {orb.type}
                        {orb.special && (
                          <span className="absolute -top-1 -right-1 text-xs">
                            {orb.special}
                          </span>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Game Progress */}
          {orbGame && (
            <div className="w-full max-w-2xl px-2">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out relative"
                  style={{ width: `${orbGame.getCompletionPercentage()}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center mt-2 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Progress: {Math.round(orbGame.getCompletionPercentage())}%
                ({orbGame.score} / {orbGame.targetScore})
              </div>
            </div>
          )}

          {/* Last Move Info */}
          {lastMove && lastMove.score > 0 && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-bounce shadow-lg">
              {lastMove.combo && <Star className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />}
              {lastMove.special && <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />}
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                +{lastMove.score} points!
                {lastMove.combo && ' COMBO!'}
                {lastMove.special && ' SPECIAL!'}
              </span>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl text-xs sm:text-sm text-gray-600 px-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <p className="mb-2 leading-relaxed">
              Click connected orbs of the same color to select and pop them. Minimum 3 orbs required.
              Plan your strategy to reach the target score!
            </p>
            <p className="leading-relaxed">
              {difficulty} Mode: {difficultySettings[difficulty].description}
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

export default StrategicOrbCommanderGame;