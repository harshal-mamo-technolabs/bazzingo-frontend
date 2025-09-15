import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { 
  difficultySettings, 
  generateCastleMap, 
  getScenariosByDifficulty, 
  calculateTurnResults,
  calculateScore,
  guardTypes,
//   CASTLE_SIZE
} from '../../utils/games/CastleDefender';
import { 
  Shield, 
  Swords, 
  ChevronUp, 
  ChevronDown, 
  Target,
  Users,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const CastleDefenderGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
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

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore(difficulty, successfulDefenses, totalBreaches);
    setScore(newScore);
  }, [difficulty, successfulDefenses, totalBreaches]);

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

  // Handle guard placement
  const handleCellClick = useCallback((row, col) => {
    if (gameState !== 'playing' || showTurnResult) return;
    
    const cell = castleMap[row][col];
    if (cell === 'wall' || cell === 'keep') return;
    
    // Check if there's already a guard here
    const existingGuard = guardPositions.find(guard => guard.row === row && guard.col === col);
    if (existingGuard) {
      // Remove guard
      setGuardPositions(prev => prev.filter(guard => !(guard.row === row && guard.col === col)));
      const guardType = guardTypes.find(type => type.id === existingGuard.type);
      setGuardsBudget(prev => prev + guardType.cost);
      return;
    }
    
    // Check if we have enough budget
    const guardType = guardTypes.find(type => type.id === selectedGuardType);
    if (guardsBudget < guardType.cost) return;
    
    // Place guard
    setGuardPositions(prev => [...prev, {
      row,
      col,
      type: selectedGuardType,
      id: `guard_${row}_${col}`
    }]);
    setGuardsBudget(prev => prev - guardType.cost);
  }, [gameState, showTurnResult, castleMap, guardPositions, selectedGuardType, guardsBudget]);

  // Execute turn
  const executeTurn = useCallback(() => {
    if (guardPositions.length === 0) return;
    
    const responseTime = Date.now() - turnStartTime;
    setTotalResponseTime(prev => prev + responseTime);
    
    const currentScenarioData = currentScenarios[currentTurn];
    const result = calculateTurnResults(currentScenarioData.enemies, guardPositions, castleMap);
    
    setTurnResult(result);
    setShowTurnResult(true);
    setCurrentEnemies(result.enemies);
    
    if (result.success) {
      setSuccessfulDefenses(prev => prev + 1);
    } else {
      setTotalBreaches(prev => prev + result.breachedCount);
      setLives(prev => {
        const newLives = prev - result.breachedCount;
        if (newLives <= 0) {
          setTimeout(() => {
            setGameState('finished');
            setShowCompletionModal(true);
          }, 3000);
        }
        return Math.max(0, newLives);
      });
    }
    
    setTimeout(() => {
      if (currentTurn + 1 >= currentScenarios.length) {
        setGameState('finished');
        setShowCompletionModal(true);
      } else {
        // Next turn
        setCurrentTurn(prev => prev + 1);
        setGuardPositions([]);
        setGuardsBudget(difficultySettings[difficulty].guardsPerTurn);
        setShowTurnResult(false);
        setTurnResult(null);
        setCurrentEnemies([]);
        setTurnStartTime(Date.now());
      }
    }, 3000);
  }, [guardPositions, turnStartTime, currentTurn, currentScenarios, castleMap, difficulty, lives]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;
    
    setHintsUsed(prev => prev + 1);
    
    // Simple hint: highlight a good defensive position
    const currentScenarioData = currentScenarios[currentTurn];
    const enemies = currentScenarioData.enemies;
    
    // Find strategic positions near enemy paths
    const hintPositions = [];
    enemies.forEach(enemy => {
      const row = enemy.row;
      const col = enemy.col;
      
      // Suggest positions that would block common paths
      if (row === 0) hintPositions.push({ row: 1, col });
      if (row === 7) hintPositions.push({ row: 6, col });
      if (col === 0) hintPositions.push({ row, col: 1 });
      if (col === 7) hintPositions.push({ row, col: 6 });
    });
    
    // Highlight hint positions temporarily
    setTimeout(() => {
      // Reset hint highlighting
    }, 3000);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
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
    setShowTurnResult(false);
    setTurnResult(null);
    setTotalResponseTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setTurnStartTime(Date.now());
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
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

  const getCellContent = (row, col) => {
    const cell = castleMap[row][col];
    const guard = guardPositions.find(g => g.row === row && g.col === col);
    const enemy = currentEnemies.find(e => e.row === row && e.col === col);
    
    if (guard) {
      const guardType = guardTypes.find(type => type.id === guard.type);
      return guardType.emoji;
    }
    
    if (enemy) {
      return enemy.emoji;
    }
    
    switch (cell) {
      case 'wall': return '🧱';
      case 'gate': return '🚪';
      case 'keep': return '🏰';
      case 'path': return '・';
      default: return '';
    }
  };

  const getCellClass = (row, col) => {
    const cell = castleMap[row][col];
    const guard = guardPositions.find(g => g.row === row && g.col === col);
    const enemy = currentEnemies.find(e => e.row === row && e.col === col);
    
    let baseClass = 'w-12 h-12 border border-gray-300 flex items-center justify-center text-lg cursor-pointer transition-colors ';
    
    if (cell === 'wall') baseClass += 'bg-stone-600 cursor-not-allowed ';
    else if (cell === 'keep') baseClass += 'bg-yellow-400 cursor-not-allowed ';
    else if (cell === 'gate') baseClass += 'bg-amber-200 hover:bg-amber-300 ';
    else if (cell === 'path') baseClass += 'bg-amber-100 hover:bg-amber-200 ';
    else baseClass += 'bg-green-100 hover:bg-green-200 ';
    
    if (guard) baseClass += 'bg-blue-300 ';
    if (enemy && enemy.blocked) baseClass += 'bg-red-200 ';
    if (enemy && enemy.reachedKeep) baseClass += 'bg-red-500 ';
    
    return baseClass;
  };

  return (
    <div>
      <Header unreadCount={3} />
      
      <GameFramework
        gameTitle="🏰 Castle Defender: Logic Siege"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Castle Defender
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🏰 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Defend your castle by strategically placing guards to block enemy paths to the central keep.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      ⚔️ Gameplay
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Place guards on the castle map</li>
                      <li>• Block enemy paths to the keep</li>
                      <li>• Each turn has limited guards</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: +25 points per success</li>
                      <li>• Moderate: +40 points per success</li>
                      <li>• Hard: +50 points per success</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
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
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
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
          {currentScenarioData && !showTurnResult && (
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

          {/* Turn Results */}
          {showTurnResult && turnResult && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg mb-6 ${
              turnResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {turnResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {turnResult.success ? 'Victory!' : 'Breach!'}
                </div>
              </div>
              <div className="text-sm mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {turnResult.success 
                  ? `All ${turnResult.blockedCount} enemies blocked successfully!`
                  : `${turnResult.breachedCount} enemies reached the keep! ${turnResult.blockedCount} blocked.`
                }
              </div>
              {turnResult.success && (
                <div className="text-green-700 font-medium mb-2">
                  +{difficultySettings[difficulty].pointsPerSuccess} points earned!
                </div>
              )}
              {!turnResult.success && (
                <div className="text-red-700 font-medium mb-2">
                  -{turnResult.breachedCount * difficultySettings[difficulty].penaltyPerBreach} points penalty
                </div>
              )}
            </div>
          )}

          {/* Guard Selection */}
          {!showTurnResult && (
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {guardTypes.map(guardType => (
                <button
                  key={guardType.id}
                  onClick={() => setSelectedGuardType(guardType.id)}
                  disabled={guardsBudget < guardType.cost}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedGuardType === guardType.id
                      ? 'bg-blue-500 text-white'
                      : guardsBudget < guardType.cost
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <span className="text-lg">{guardType.emoji}</span>
                  {guardType.name} (Cost: {guardType.cost})
                </button>
              ))}
            </div>
          )}

          {/* Castle Map */}
          <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300 mb-6">
            <div className="grid grid-cols-8 gap-1">
              {castleMap.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    title={`${rowIndex}, ${colIndex}`}
                  >
                    {getCellContent(rowIndex, colIndex)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enemy Information */}
          {currentScenarioData && !showTurnResult && (
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
          {!showTurnResult && guardPositions.length > 0 && (
            <button
              onClick={executeTurn}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold text-lg"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <Swords className="h-5 w-5 inline mr-2" />
              Execute Defense!
            </button>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              🏰 = Keep (protect at all costs) | 🚪 = Gates (enemy entry points) | 🧱 = Walls (impassable)
              <br />
              Click on empty spaces to place guards. Click on guards to remove them.
              Block enemy paths to prevent them from reaching the central keep!
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].turnCount} turns | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | 
              {difficultySettings[difficulty].guardsPerTurn} guards per turn
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

export default CastleDefenderGame;