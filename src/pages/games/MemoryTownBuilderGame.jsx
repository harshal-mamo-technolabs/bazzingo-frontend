import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { 
  difficultySettings, 
  buildingTypes, 
  generatePredefinedLayout, 
  calculateScore, 
  checkGridAccuracy,
  checkObjectives,
  getHint,
  calculateAccuracy
} from '../../utils/games/MemoryTownBuilder';
import { 
  Eye, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Building2,
  Timer,
  Target,
  Brain,
  Sparkles,
  Trophy,
  Smartphone,
  Monitor
} from 'lucide-react';

const MemoryTownBuilderGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [maxTurns, setMaxTurns] = useState(12);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(4);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // Game-specific state
  const [levelData, setLevelData] = useState(null);
  const [playerGrid, setPlayerGrid] = useState(null);
  const [gamePhase, setGamePhase] = useState('study'); // 'study', 'recall'
  const [studyTimeRemaining, setStudyTimeRemaining] = useState(10);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [placedBuildings, setPlacedBuildings] = useState(0);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [isCompactView, setIsCompactView] = useState(false);

  // Detect screen size and adjust layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsCompactView(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Update game state when dependencies change
  useEffect(() => {
    if (gameState === 'ready') {
      setScore(0);
      setCompletedObjectives([]);
      return;
    }
    
    if (levelData && playerGrid) {
      const newCompleted = checkObjectives(playerGrid, levelData.targetGrid, difficulty, levelData.negativeZones || [], currentRound);
      setCompletedObjectives(newCompleted);
      
      const { correct } = checkGridAccuracy(playerGrid, levelData.targetGrid);
      const newScore = calculateScore(difficulty, correct, placedBuildings, currentRound, newCompleted.length);
      setScore(newScore);
    }
  }, [playerGrid, levelData, difficulty, placedBuildings, currentRound, gameState]);

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

  // Study phase timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && gamePhase === 'study' && studyTimeRemaining > 0) {
      interval = setInterval(() => {
        setStudyTimeRemaining(prev => {
          if (prev <= 1) {
            setGamePhase('recall');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, gamePhase, studyTimeRemaining]);

  // Check for round progression and game completion
  useEffect(() => {
    if (gameState === 'playing') {
      const settings = difficultySettings[difficulty];
      
      // Check if out of turns
      if (currentTurn >= maxTurns) {
        setGameState('finished');
        setShowCompletionModal(true);
        return;
      }
      
      // Check round progression for Easy mode
      if (difficulty === 'Easy') {
        const round1Objectives = settings.objectives.round1.length;
        const totalObjectives = round1Objectives + settings.objectives.round2.length;
        
        if (currentRound === 1 && completedObjectives.length >= round1Objectives) {
          setCurrentRound(2);
        } else if (currentRound === 2 && completedObjectives.length >= totalObjectives) {
          setGameState('finished');
          setShowCompletionModal(true);
        }
      } else {
        // For Moderate and Hard, check if all objectives complete
        const totalObjectives = settings.objectives.round1.length + settings.objectives.round2.length;
        if (completedObjectives.length >= totalObjectives) {
          setGameState('finished');
          setShowCompletionModal(true);
        }
      }
    }
  }, [currentTurn, maxTurns, completedObjectives.length, gameState, difficulty, currentRound]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    
    setTimeRemaining(settings.timeLimit);
    setCurrentTurn(0);
    setMaxTurns(settings.maxTurns);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setPlacedBuildings(0);
    setShowHint(false);
    setSelectedBuilding(null);
    setCurrentRound(1);
    
    // Generate predefined layout
    const layout = generatePredefinedLayout(difficulty);
    setLevelData(layout);
    
    const gridSize = settings.gridSize;
    setPlayerGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill('empty')));
    
    setGamePhase('study');
    setStudyTimeRemaining(settings.studyTime);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setScore(0);
    setCompletedObjectives([]);
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setScore(0);
    setCompletedObjectives([]);
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
    console.log('Memory Town Builder completed:', payload);
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameState !== 'playing' || gamePhase === 'study' || currentTurn >= maxTurns) return;
    if (!selectedBuilding) return;

    const newGrid = playerGrid.map(r => [...r]);
    newGrid[row][col] = selectedBuilding;
    setPlayerGrid(newGrid);
    
    setCurrentTurn(prev => prev + 1);
    if (selectedBuilding !== 'empty') {
      setPlacedBuildings(prev => prev + 1);
    }
  };

  // Handle building selection
  const handleBuildingSelect = (buildingType) => {
    if (gamePhase === 'study') return;
    setSelectedBuilding(buildingType);
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;

    setHintsUsed(prev => prev + 1);
    const hint = getHint(playerGrid, levelData?.targetGrid, difficulty, completedObjectives, currentRound);
    setHintMessage(hint);
    setShowHint(true);
    
    setTimeout(() => {
      setShowHint(false);
    }, 5000);
  };

  const customStats = {
    currentTurn: currentTurn,
    maxTurns: maxTurns,
    placedBuildings: placedBuildings,
    accuracy: levelData ? calculateAccuracy(playerGrid, levelData.targetGrid) : 0,
    objectivesComplete: completedObjectives.length,
    maxScore: 200,
    currentRound: currentRound
  };

  const settings = difficultySettings[difficulty];
  
  // Get current objectives based on round
  const currentObjectives = currentRound === 1 ? 
    settings.objectives.round1 : 
    settings.objectives.round2;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header unreadCount={2} />

      <GameFramework
        gameTitle="🏗️✨ Memory Town Builder"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 md:p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-base md:text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Build Your Perfect Memory Town
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-blue-900" />
                    : <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-blue-900" />}
                </span>
              </div>

              {/* Toggle Content */}
              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className='bg-white p-3 rounded-lg border border-blue-200'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <Building2 className="h-4 w-4" />
                      🎯 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Study the town layout, then recreate it perfectly by placing buildings in their exact positions.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg border border-blue-200'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <Brain className="h-4 w-4" />
                      🧠 How to Play
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Study: Memorize the layout</li>
                      <li>• Recall: Select building type</li>
                      <li>• Place: Click grid to position</li>
                      <li>• Match: Recreate exactly</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg border border-blue-200'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <Sparkles className="h-4 w-4" />
                      💡 Tips
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Focus during study time</li>
                      <li>• Use visual landmarks</li>
                      <li>• Complete objectives in order</li>
                      <li>• Avoid negative zones</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg border border-blue-200'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <Trophy className="h-4 w-4" />
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: Round-based (100→200)</li>
                      <li>• Moderate: 25pts per placement</li>
                      <li>• Hard: 50pts per placement</li>
                      <li>• Bonus for accuracy & efficiency</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Memory"
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
        <div className={`flex ${isCompactView ? 'flex-col' : 'flex-col lg:flex-row'} gap-4 md:gap-6`}>
          {/* Left Panel - Controls and Objectives */}
          <div className={`${isCompactView ? 'w-full' : 'lg:w-1/3'} space-y-4 md:space-y-6`}>
            {/* Building Selector */}
            {gamePhase !== 'study' && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 md:p-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5" />
                  Building Types
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                  {Object.entries(buildingTypes).map(([key, building]) => (
                    <button
                      key={key}
                      onClick={() => handleBuildingSelect(key)}
                      className={`p-2 md:p-3 rounded-lg border-2 transition-all ${
                        selectedBuilding === key
                          ? 'border-blue-500 bg-blue-100 shadow-lg'
                          : `${building.color} hover:border-gray-400`
                      }`}
                    >
                      <div className="text-lg md:text-2xl mb-1">{building.icon}</div>
                      <div className="text-xs font-medium">{building.name}</div>
                    </button>
                  ))}
                </div>
                
                {selectedBuilding && (
                  <div className="p-2 md:p-3 bg-white rounded-lg border">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      Selected: {buildingTypes[selectedBuilding].name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Click on the grid to place this building
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Game Controls */}
            {gameState === 'playing' && gamePhase !== 'study' && (
              <div className="bg-yellow-50 rounded-lg p-3 md:p-4">
                <button
                  onClick={useHint}
                  disabled={hintsUsed >= maxHints}
                  className={`w-full px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    hintsUsed >= maxHints
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <Lightbulb className="h-4 w-4" />
                  Get Hint ({maxHints - hintsUsed} left)
                </button>
              </div>
            )}

            {/* Objectives */}
            <div className="bg-green-50 rounded-lg p-3 md:p-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 md:h-5 md:w-5" />
                Round {currentRound} Goals
                {currentRound === 2 && (
                  <span className="text-sm font-normal text-green-600">(Final Round!)</span>
                )}
              </h3>
              <div className="space-y-2">
                {currentObjectives.map((objective, index) => {
                  const globalIndex = currentRound === 1 ? index : settings.objectives.round1.length + index;
                  return (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm flex items-center gap-2 ${
                        completedObjectives.includes(globalIndex)
                          ? 'bg-green-200 text-green-800'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                        completedObjectives.includes(globalIndex)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300'
                      }`}>
                        {completedObjectives.includes(globalIndex) ? '✓' : index + 1}
                      </div>
                      {objective.text}
                    </div>
                  );
                })}
              </div>
              
              {/* Round Progress Indicator */}
              {currentRound === 1 && completedObjectives.length >= settings.objectives.round1.length && (
                <div className="mt-4 p-2 bg-blue-100 rounded-lg text-center">
                  <p className="text-blue-800 font-semibold text-sm">
                    🎉 Round 1 Complete! Moving to Round 2...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center Panel - Game Grid */}
          <div className={`${isCompactView ? 'w-full' : 'lg:w-2/3'}`}>
            {/* Study Phase Timer */}
            {gamePhase === 'study' && (
              <div className="mb-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800 text-sm md:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Study Time: {studyTimeRemaining}s
                  </span>
                </div>
                <p className="text-yellow-700 text-sm md:text-base text-center" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  Memorize the building positions! You'll need to recreate this layout.
                </p>
              </div>
            )}

            {/* Hint Display */}
            {showHint && (
              <div className="mb-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800 text-sm md:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hint:
                  </span>
                </div>
                <p className="text-yellow-700 text-sm md:text-base" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {hintMessage}
                </p>
              </div>
            )}

            {/* Game Grid */}
            <div className="bg-gradient-to-br from-gray-100 to-green-100 rounded-lg p-3 md:p-6">
              <div 
                className={`grid gap-1 md:gap-2 mx-auto ${isCompactView ? 'max-w-sm' : 'max-w-md'}`}
                style={{ 
                  gridTemplateColumns: `repeat(${settings.gridSize}, minmax(0, 1fr))`
                }}
              >
                {levelData && playerGrid && playerGrid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isStudyPhase = gamePhase === 'study';
                    const displayBuilding = isStudyPhase ? levelData.targetGrid[rowIndex][colIndex] : cell;
                    const building = buildingTypes[displayBuilding] || buildingTypes.empty;
                    const isNegativeZone = levelData.negativeZones?.some(zone => zone.row === rowIndex && zone.col === colIndex);
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`aspect-square rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-xs md:text-sm font-bold ${
                          isStudyPhase
                            ? `${building.color} border-gray-400`
                            : `${building.color} hover:border-blue-300 ${isNegativeZone ? 'ring-2 ring-red-300' : ''}`
                        }`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        <div className="text-lg md:text-2xl mb-1">{building.icon}</div>
                        <div className="text-xs text-center">{building.name.split(' ')[0]}</div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Grid Instructions */}
              <div className="text-center mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {isCompactView ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  <span>
                    {gamePhase === 'study' 
                      ? 'Study the layout carefully!' 
                      : 'Select a building type, then click to place'
                    }
                  </span>
                </div>
                {selectedBuilding && gamePhase !== 'study' && (
                  <span className="font-semibold">
                    Selected: {buildingTypes[selectedBuilding].name}
                  </span>
                )}
              </div>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-6">
              <div className="text-center bg-blue-50 rounded-lg p-2 md:p-3">
                <div className="text-xs md:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Moves Left
                </div>
                <div className="text-lg md:text-xl font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {maxTurns - currentTurn}
                </div>
              </div>
              
              <div className="text-center bg-purple-50 rounded-lg p-2 md:p-3">
                <div className="text-xs md:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Buildings Placed
                </div>
                <div className="text-lg md:text-xl font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {placedBuildings}
                </div>
              </div>
              
              <div className="text-center bg-green-50 rounded-lg p-2 md:p-3">
                <div className="text-xs md:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Accuracy
                </div>
                <div className="text-lg md:text-xl font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {levelData ? calculateAccuracy(playerGrid, levelData.targetGrid) : 0}%
                </div>
              </div>
              
              <div className="text-center bg-teal-50 rounded-lg p-2 md:p-3">
                <div className="text-xs md:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Score / 200
                </div>
                <div className="text-lg md:text-xl font-semibold text-teal-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {score}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
      
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
        customStats={customStats}
        gameTitle="Memory Town Builder"
      />
    </div>
  );
};

export default MemoryTownBuilderGame;