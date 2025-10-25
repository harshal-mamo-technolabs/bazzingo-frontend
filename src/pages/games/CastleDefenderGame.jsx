import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework.jsx';
import Header from '../../components/Header.jsx';
import GameCompletionModal from '../../components/games/GameCompletionModal.jsx';
import {
  difficultySettings,
  generateCastleMap,
  getScenariosByDifficulty,
  calculateTurnResults,
  calculateScore,
  guardTypes,
  isValidGuardPlacement,
  generateHint,
  getEnemyPreviewPaths,
  moveEnemyStep,
} from '../../utils/games/CastleDefender.js';
import {
  Shield,
  Swords,
  ChevronUp,
  ChevronDown,
  Lightbulb,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';

/**
 * NOTE: This updated component:
 * - Visually distinguishes gates with labels: 🚪N, 🚪S, 🚪E, 🚪W
 * - Adds accessible/clear titles on gate cells: "North Gate", etc.
 */

const CastleDefenderGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [successfulDefenses, setSuccessfulDefenses] = useState(0);
  const [totalBreaches, setTotalBreaches] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [guardsBudget, setGuardsBudget] = useState(3);
  const [currentScenarios, setCurrentScenarios] = useState([]);

  // Game state
  const [castleMap, setCastleMap] = useState([]);
  const [guardPositions, setGuardPositions] = useState([]);
  const [selectedGuardType, setSelectedGuardType] = useState('guard');
  const [currentEnemies, setCurrentEnemies] = useState([]);
  const [showTurnResult, setShowTurnResult] = useState(false);
  const [turnResult, setTurnResult] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [turnStartTime, setTurnStartTime] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [hintPosition, setHintPosition] = useState(null);
  const [isExecutingTurn, setIsExecutingTurn] = useState(false);

  // Enhanced UI states
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showPathPreviews, setShowPathPreviews] = useState(false);
  const [enemyPreviewPaths, setEnemyPreviewPaths] = useState([]);
  const [animatingEnemies, setAnimatingEnemies] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [placementLocked, setPlacementLocked] = useState(false);

  // Refs for cleanup
  const timeoutRefs = useRef([]);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore(difficulty, successfulDefenses, totalBreaches);
    setScore(newScore);
  }, [difficulty, successfulDefenses, totalBreaches]);

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameState, timeRemaining]);

  // Update enemy preview paths when guard positions change
  useEffect(() => {
    if (showPathPreviews && currentScenarios[currentTurn]) {
      const paths = getEnemyPreviewPaths(
        currentScenarios[currentTurn].enemies,
        guardPositions,
        castleMap
      );
      setEnemyPreviewPaths(paths);
    }
  }, [guardPositions, showPathPreviews, currentScenarios, currentTurn, castleMap]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Animate enemy movement
  const animateEnemyMovement = useCallback((enemies, onComplete) => {
    let currentEnemies = [...enemies];
    let animationStep = 0;
    const maxSteps = Math.max(...enemies.map(e => e.path.length || 0), 0);

    setIsAnimating(true);
    setAnimatingEnemies([...currentEnemies]);

    const stepAnimation = () => {
      if (animationStep >= maxSteps) {
        setIsAnimating(false);
        if (onComplete) onComplete(currentEnemies);
        return;
      }

      currentEnemies = currentEnemies.map(enemy => {
        if (enemy.blocked || enemy.pathIndex >= enemy.path.length) {
          return enemy;
        }
        return moveEnemyStep(enemy);
      });

      setAnimatingEnemies([...currentEnemies]);
      animationStep++;

      animationRef.current = setTimeout(stepAnimation, 250);
    };

    stepAnimation();
  }, []);

  // Handle guard placement
  const handleCellClick = useCallback(
    (row, col) => {
      if (gameState !== 'playing' || showTurnResult || isExecutingTurn || placementLocked || isAnimating) return;

      if (!isValidGuardPlacement(row, col, castleMap, guardPositions)) return;

      const existingGuard = guardPositions.find(guard => guard.row === row && guard.col === col);
      if (existingGuard) {
        setGuardPositions(prev => prev.filter(guard => !(guard.row === row && guard.col === col)));
        const guardType = guardTypes.find(type => type.id === existingGuard.type);
        setGuardsBudget(prev => prev + guardType.cost);
        return;
      }

      const guardType = guardTypes.find(type => type.id === selectedGuardType);
      if (guardsBudget < guardType.cost) return;

      setGuardPositions(prev => [
        ...prev,
        {
          row,
          col,
          type: selectedGuardType,
          id: `guard_${row}_${col}_${Date.now()}`
        }
      ]);
      setGuardsBudget(prev => prev - guardType.cost);

      if (hintPosition && hintPosition.row === row && hintPosition.col === col) {
        setHintPosition(null);
      }
    },
    [
      gameState,
      showTurnResult,
      isExecutingTurn,
      placementLocked,
      isAnimating,
      castleMap,
      guardPositions,
      selectedGuardType,
      guardsBudget,
      hintPosition
    ]
  );

  // Execute turn
  const executeTurn = useCallback(() => {
    if (guardPositions.length === 0 || isExecutingTurn || isAnimating) return;

    setIsExecutingTurn(true);
    setPlacementLocked(true);
    const responseTime = Date.now() - turnStartTime;
    setTotalResponseTime(prev => prev + responseTime);

    const currentScenarioData = currentScenarios[currentTurn];
    const result = calculateTurnResults(currentScenarioData.enemies, guardPositions, castleMap);

    // Start enemy movement animation
    animateEnemyMovement(result.enemies, (finalEnemies) => {
      setTurnResult({ ...result, enemies: finalEnemies });
      setShowTurnResult(true);
      setCurrentEnemies(finalEnemies);
      setHintPosition(null);

      if (result.success) {
        setSuccessfulDefenses(prev => prev + 1);
      } else {
        setTotalBreaches(prev => prev + result.breachedCount);
        setLives(prev => {
          const newLives = prev - result.breachedCount;
          if (newLives <= 0) {
            const timeout = setTimeout(() => {
              setGameState('finished');
              setShowCompletionModal(true);
            }, 3000);
            timeoutRefs.current.push(timeout);
          }
          return Math.max(0, newLives);
        });
      }

      const timeout = setTimeout(() => {
        if (currentTurn + 1 >= currentScenarios.length) {
          setGameState('finished');
          setShowCompletionModal(true);
        } else {
          setCurrentTurn(prev => prev + 1);
          setGuardPositions([]);
          setGuardsBudget(difficultySettings[difficulty].guardsPerTurn);
          setShowTurnResult(false);
          setTurnResult(null);
          setCurrentEnemies([]);
          setAnimatingEnemies([]);
          setTurnStartTime(Date.now());
          setIsExecutingTurn(false);
          setPlacementLocked(false);
        }
      }, 3000);

      timeoutRefs.current.push(timeout);
    });
  }, [
    guardPositions,
    isExecutingTurn,
    isAnimating,
    turnStartTime,
    currentTurn,
    currentScenarios,
    castleMap,
    difficulty,
    animateEnemyMovement
  ]);

  // Use hint
  const useHint = useCallback(() => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || showTurnResult || placementLocked) return;

    setHintsUsed(prev => prev + 1);

    const currentScenarioData = currentScenarios[currentTurn];
    if (!currentScenarioData) return;

    const hintSuggestion = generateHint(currentScenarioData.enemies, guardPositions, castleMap);

    if (hintSuggestion) {
      setHintPosition(hintSuggestion);

      const timeout = setTimeout(() => {
        setHintPosition(null);
      }, 5000);

      timeoutRefs.current.push(timeout);
    }
  }, [hintsUsed, maxHints, gameState, showTurnResult, placementLocked, currentScenarios, currentTurn, guardPositions, castleMap]);

  // Initialize game
  const initializeGame = useCallback(() => {
    cleanup();

    const settings = difficultySettings[difficulty];
    const scenarios = getScenariosByDifficulty(difficulty);
    const map = generateCastleMap();

    setCurrentScenarios(scenarios);
    setCastleMap(map);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentTurn(0);
    setSuccessfulDefenses(0);
    setTotalBreaches(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setGuardsBudget(settings.guardsPerTurn);
    setGuardPositions([]);
    setCurrentEnemies([]);
    setAnimatingEnemies([]);
    setShowTurnResult(false);
    setTurnResult(null);
    setTotalResponseTime(0);
    setHintPosition(null);
    setIsExecutingTurn(false);
    setPlacementLocked(false);
    setIsAnimating(false);
    setShowPathPreviews(false);
    setEnemyPreviewPaths([]);
    setHoveredCell(null);
  }, [difficulty, cleanup]);

  const handleStart = () => {
    initializeGame();
    setTurnStartTime(Date.now());
  };

  const handleReset = () => {
    cleanup();
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    cleanup();
    console.log('Castle Defender Game completed:', payload);
  };

  const customStats = {
    currentTurn: currentTurn + 1,
    totalTurns: currentScenarios.length,
    successfulDefenses,
    totalBreaches,
    lives,
    hintsUsed,
    averageResponseTime: currentTurn > 0 ? Math.round(totalResponseTime / currentTurn / 1000) : 0,
    guardsDeployed: guardPositions.length
  };

  const currentScenarioData = currentScenarios[currentTurn] || currentScenarios[0];

  // NEW: Clear, labeled gate content
  const getGateLabel = (cell) => {
    switch (cell) {
      case 'gate_north': return '🚪N';
      case 'gate_south': return '🚪S';
      case 'gate_east':  return '🚪E';
      case 'gate_west':  return '🚪W';
      default: return '🚪';
    }
  };

  const getCellContent = (row, col) => {
    const cell = castleMap[row]?.[col];

    if (isAnimating) {
      const animatedEnemy = animatingEnemies.find(e => e.currentRow === row && e.currentCol === col);
      if (animatedEnemy) return animatedEnemy.emoji;
    } else {
      const enemy = currentEnemies.find(e => e.currentRow === row && e.currentCol === col);
      if (enemy) return enemy.emoji;
    }

    const guard = guardPositions.find(g => g.row === row && g.col === col);
    if (guard) {
      const guardType = guardTypes.find(type => type.id === guard.type);
      return guardType.emoji;
    }

    switch (cell) {
      case 'wall': return '🧱';
      case 'gate_north':
      case 'gate_south':
      case 'gate_east':
      case 'gate_west':
        return getGateLabel(cell); // Labeled gates
      case 'keep': return '🏰';
      case 'path': return '・';
      default: return '';
    }
  };

  // NEW: Titles that name the gates clearly
  const getCellTitle = (row, col) => {
    const cell = castleMap[row]?.[col];
    if (cell === 'gate_north') return 'North Gate';
    if (cell === 'gate_south') return 'South Gate';
    if (cell === 'gate_east')  return 'East Gate';
    if (cell === 'gate_west')  return 'West Gate';
    if (cell === 'keep') return 'Keep';
    if (cell === 'wall') return 'Wall';
    return `Row ${row + 1}, Col ${col + 1}`;
  };

  const getCellClass = (row, col) => {
    const cell = castleMap[row]?.[col];
    const guard = guardPositions.find(g => g.row === row && g.col === col);
    const enemy = currentEnemies.find(e => e.currentRow === row && e.currentCol === col);
    const animatedEnemy = isAnimating ? animatingEnemies.find(e => e.currentRow === row && e.currentCol === col) : null;
    const isHintPosition = hintPosition && hintPosition.row === row && hintPosition.col === col;
    const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;

    let baseClass =
      'relative w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border border-gray-300 flex items-center justify-center text-sm md:text-base lg:text-lg cursor-pointer transition-all duration-300 select-none ';

    // Base cell types
    if (cell === 'wall') baseClass += 'bg-stone-600 text-white cursor-not-allowed ';
    else if (cell === 'keep') baseClass += 'bg-yellow-400 cursor-not-allowed ';
    else if (cell && cell.startsWith('gate_')) {
      // Color-coded gates
      if (cell === 'gate_north') baseClass += 'bg-blue-200 border-blue-300 text-blue-900 cursor-not-allowed ';
      else if (cell === 'gate_south') baseClass += 'bg-red-200 border-red-300 text-red-900 cursor-not-allowed ';
      else if (cell === 'gate_east') baseClass += 'bg-green-200 border-green-300 text-green-900 cursor-not-allowed ';
      else if (cell === 'gate_west') baseClass += 'bg-purple-200 border-purple-300 text-purple-900 cursor-not-allowed ';
    } else if (cell === 'path') baseClass += 'bg-green-50 hover:bg-green-100 border-green-200 ';
    else baseClass += 'bg-green-100 hover:bg-green-200 border-green-300 ';

    // Guard and enemy states
    if (guard) baseClass += 'bg-blue-300 border-blue-400 ';
    if (enemy && enemy.blocked) baseClass += 'bg-red-200 border-red-300 ';
    if (enemy && enemy.reachedKeep) baseClass += 'bg-red-500 border-red-600 ';
    if (animatedEnemy) baseClass += 'bg-orange-200 border-orange-400 animate-pulse ';

    // Special states
    if (isHintPosition) baseClass += 'bg-yellow-300 animate-pulse border-2 border-yellow-500 shadow-lg ';

    // Ghost guard preview on hover
    if (
      isHovered &&
      !guard &&
      !enemy &&
      !animatedEnemy &&
      isValidGuardPlacement(row, col, castleMap, guardPositions)
    ) {
      const guardType = guardTypes.find(type => type.id === selectedGuardType);
      if (guardsBudget >= guardType.cost && !placementLocked && !isAnimating) {
        baseClass += 'bg-blue-100 border-2 border-blue-300 shadow-inner ';
      }
    }

    // Path preview highlights
    if (showPathPreviews && enemyPreviewPaths.length > 0) {
      const isOnPath = enemyPreviewPaths.some(pathData =>
        pathData.path.some(pathCell => pathCell.row === row && pathCell.col === col)
      );
      if (isOnPath && !guard) {
        baseClass += 'bg-red-100 border-red-200 ';
      }
    }

    return baseClass;
  };

  const handleCellHover = (row, col) => {
    if (!placementLocked && !isAnimating) {
      setHoveredCell({ row, col });
    }
  };

  const handleCellLeave = () => setHoveredCell(null);

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}

      <GameFramework
        gameTitle="🏰 Castle Defender: Logic Siege"
        gameShortDescription="Defend your castle from invaders. Challenge your strategic planning and resource management skills!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Castle Defender
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions ? <ChevronUp className="h-5 w-5 text-blue-900" /> : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🏰 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Defend your castle by strategically placing guards to block enemy paths to the central keep.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      ⚔️ Gameplay
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Place guards on the castle map</li>
                      <li>• Block enemy paths to the keep</li>
                      <li>• Each turn has limited guards</li>
                      <li>• Use hints when stuck</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: +25 points per success (no penalties)</li>
                      <li>• Moderate: +40 points per success</li>
                      <li>• Hard: +50 points per success</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🛡️ Turns
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 turns</li>
                      <li>• Moderate: 5 turns</li>
                      <li>• Hard: 4 turns</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Problem Solving"
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
        <div className="flex flex-col items-center">
          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Turn
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentTurn + 1}/{difficultySettings[difficulty].turnCount}
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
                Guards Left
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {guardsBudget}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Defenses
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {successfulDefenses}
              </div>
            </div>
          </div>

          {/* Turn Information */}
          {currentScenarioData && !showTurnResult && !isAnimating && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Turn {currentTurn + 1} - {difficulty} Level
                  </span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentScenarioData.description}
                </h3>
                <p className="text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentScenarioData.briefing}
                </p>
              </div>
            </div>
          )}

          {/* Animation Status */}
          {isAnimating && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Enemies Moving...
                  </span>
                </div>
                <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  Watch as enemies attempt to reach your keep!
                </p>
              </div>
            </div>
          )}

          {/* Turn Results */}
          {showTurnResult && turnResult && (
            <div
              className={`w-full max-w-2xl text-center p-6 rounded-lg mb-6 ${
                turnResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {turnResult.success ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {turnResult.success ? 'Victory!' : 'Breach!'}
                </div>
              </div>
              <div className="text-sm mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {turnResult.success
                  ? `All ${turnResult.blockedCount} enemies blocked successfully!`
                  : `${turnResult.breachedCount} enemies reached the keep! ${turnResult.blockedCount} blocked.`}
              </div>
              {turnResult.success && (
                <div className="text-green-700 font-medium mb-2">
                  +{difficultySettings[difficulty].pointsPerSuccess} points earned!
                </div>
              )}
              {!turnResult.success && difficulty !== 'Easy' && (
                <div className="text-red-700 font-medium mb-2">
                  -{turnResult.breachedCount * difficultySettings[difficulty].penaltyPerBreach} points penalty
                </div>
              )}
            </div>
          )}

          {/* Guard Selection and Enhanced Controls */}
          {!showTurnResult && !isAnimating && (
            <div className="w-full max-w-4xl mb-6">
              <div className="flex flex-wrap justify-center gap-4">
                {guardTypes.map(guardType => (
                  <button
                    key={guardType.id}
                    onClick={() => setSelectedGuardType(guardType.id)}
                    disabled={guardsBudget < guardType.cost || placementLocked}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedGuardType === guardType.id
                        ? 'bg-blue-500 text-white'
                        : guardsBudget < guardType.cost || placementLocked
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                    style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                  >
                    <span className="text-lg">{guardType.emoji}</span>
                    {guardType.name} (Cost: {guardType.cost})
                  </button>
                ))}

                {/* Hint Button */}
                <button
                  onClick={useHint}
                  disabled={hintsUsed >= maxHints || gameState !== 'playing' || showTurnResult || placementLocked}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    hintsUsed >= maxHints || gameState !== 'playing' || showTurnResult || placementLocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <Lightbulb className="h-4 w-4" />
                  Hint ({hintsUsed}/{maxHints})
                </button>

                {/* Path Preview Toggle */}
                <button
                  onClick={() => setShowPathPreviews(!showPathPreviews)}
                  disabled={placementLocked || isAnimating}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    showPathPreviews
                      ? 'bg-purple-500 text-white'
                      : placementLocked || isAnimating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <Eye className="h-4 w-4" />
                  Preview Paths
                </button>
              </div>
            </div>
          )}

          {/* Castle Map */}
          <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300 mb-6">
            <div className="grid grid-cols-7 gap-1">
              {castleMap.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                    onMouseLeave={handleCellLeave}
                    title={getCellTitle(rowIndex, colIndex)}
                  >
                    <span className="leading-none">{getCellContent(rowIndex, colIndex)}</span>

                    {/* Ghost guard preview */}
                    {hoveredCell &&
                      hoveredCell.row === rowIndex &&
                      hoveredCell.col === colIndex &&
                      !guardPositions.find(g => g.row === rowIndex && g.col === colIndex) &&
                      !currentEnemies.find(e => e.currentRow === rowIndex && e.currentCol === colIndex) &&
                      !animatingEnemies.find(e => e.currentRow === rowIndex && e.currentCol === colIndex) &&
                      isValidGuardPlacement(rowIndex, colIndex, castleMap, guardPositions) &&
                      !placementLocked &&
                      !isAnimating && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-60 text-blue-500">
                          {guardsBudget >= guardTypes.find(type => type.id === selectedGuardType).cost &&
                            guardTypes.find(type => type.id === selectedGuardType).emoji}
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enemy Information */}
          {currentScenarioData && !showTurnResult && !isAnimating && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Incoming Enemies:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentScenarioData.enemies.map((enemy, index) => (
                    <div key={index} className="text-center bg-white rounded-lg p-2">
                      <div className="text-2xl mb-1">{enemy.emoji}</div>
                      <div className="text-xs text-red-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {enemy.name}
                      </div>
                      <div className="text-xs text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {enemy.spawnName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Execute Turn Button */}
          {!showTurnResult && guardPositions.length > 0 && !isExecutingTurn && !isAnimating && (
            <button
              onClick={executeTurn}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold text-lg"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <Swords className="h-5 w-5 inline mr-2" />
              Execute Defense!
            </button>
          )}

          {/* Executing Turn Indicator */}
          {(isExecutingTurn || isAnimating) && (
            <div className="text-center p-4">
              <div className="text-lg font-semibold text-gray-800 mb-2">
                {isAnimating ? 'Enemies Moving...' : 'Executing Turn...'}
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </div>
          )}

          
        </div>
      </GameFramework>

      <GameCompletionModal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)} score={score} />
    </div>
  );
};

export default CastleDefenderGame;