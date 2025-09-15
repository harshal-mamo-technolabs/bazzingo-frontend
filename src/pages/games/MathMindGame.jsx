import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { 
  difficultySettings, 
  tileTypes, 
  createEmptyGrid, 
  isValidPlacement, 
  findEquations, 
  calculateScore, 
  checkObjectives,
  calculateAccuracy,
  getHint,
  generateRandomNumber,
  generateTargetNumbers,
  generateAvailableNumbers
} from '../../utils/games/MathMind';
import { 
  Lightbulb, 
  Target, 
  Calculator, 
  ChevronUp, 
  ChevronDown,
  Grid3X3,
  Brain,
  Sparkles,
  Hash,
  Trophy,
  Smartphone,
  Monitor
} from 'lucide-react';

const MathMindGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [maxTurns, setMaxTurns] = useState(25);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(5);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Game-specific state
  const [grid, setGrid] = useState(createEmptyGrid());
  const [selectedTileType, setSelectedTileType] = useState(tileTypes.NUMBER);
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [validEquations, setValidEquations] = useState(0);
  const [tilesPlaced, setTilesPlaced] = useState(0);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [hoveredCell, setHoveredCell] = useState({ row: -1, col: -1 });
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [isCompactView, setIsCompactView] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

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
    // Reset score when game is ready
    if (gameState === 'ready') {
      setScore(0);
      setValidEquations(0);
      setCompletedObjectives([]);
      setCurrentRound(1);
      return;
    }
    
    const equations = findEquations(grid);
    const validCount = equations.filter(eq => eq.isValid).length;
    setValidEquations(validCount);
    
    const accuracy = calculateAccuracy(grid, tilesPlaced);
    const newScore = calculateScore(difficulty, validCount, completedObjectives.length, tilesPlaced, accuracy, currentRound);
    setScore(newScore);
    
    const newCompleted = checkObjectives(grid, difficulty, validCount, tilesPlaced, targetNumbers, currentRound);
    setCompletedObjectives(newCompleted);
  }, [grid, difficulty, tilesPlaced, completedObjectives.length, targetNumbers, gameState, currentRound]);

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

  // Check for game completion and round progression
  useEffect(() => {
    if (gameState === 'playing') {
      const settings = difficultySettings[difficulty];
      
      // Check if out of turns
      if (currentTurn >= maxTurns) {
        setGameState('finished');
        setShowCompletionModal(true);
        return;
      }
      
      // Check for round progression and game completion
      const firstRoundObjectives = settings.objectives.round1.length;
      const totalObjectives = settings.objectives.round1.length + settings.objectives.round2.length;
      
      // Check if first round is complete
      if (currentRound === 1 && completedObjectives.length >= firstRoundObjectives) {
        setCurrentRound(2);
        return;
      }
      
      // Check if all objectives complete
      if (completedObjectives.length >= totalObjectives) {
        setGameState('finished');
        setShowCompletionModal(true);
        return;
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
    setGrid(createEmptyGrid());
    setTilesPlaced(0);
    setShowHint(false);
    setSelectedTileType(tileTypes.NUMBER);
    setSelectedNumber(1);
    setHoveredCell({ row: -1, col: -1 });
    setCurrentRound(1);
    
    // Generate target numbers and strategic available numbers
    const targets = generateTargetNumbers(difficulty);
    setTargetNumbers(targets);
    
    const numbers = generateAvailableNumbers(difficulty, targets);
    setAvailableNumbers(numbers);
    setSelectedNumber(numbers[0]); // Start with first available number
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    // Explicitly reset score and stats when starting
    setScore(0);
    setValidEquations(0);
    setCompletedObjectives([]);
    setCurrentRound(1);
  };

  const handleReset = () => {
    initializeGame();
    // Explicitly reset score and stats when resetting
    setScore(0);
    setValidEquations(0);
    setCompletedObjectives([]);
    setCurrentRound(1);
  };

  const handleGameComplete = (payload) => {
    console.log('MathMind Architect completed:', payload);
  };

  // Handle tile placement
  const handleCellClick = (row, col) => {
    if (gameState !== 'playing' || currentTurn >= maxTurns) return;
    
    const tileValue = selectedTileType.category === 'operand' ? selectedNumber.toString() : selectedTileType.symbol;
    
    if (isValidPlacement(grid, row, col, selectedTileType, tileValue)) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = {
        type: selectedTileType.id,
        category: selectedTileType.category,
        value: tileValue,
        turn: currentTurn + 1
      };
      
      setGrid(newGrid);
      setCurrentTurn(prev => prev + 1);
      setTilesPlaced(prev => prev + 1);
    }
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;

    setHintsUsed(prev => prev + 1);
    const currentObjectives = currentRound === 1 ? difficultySettings[difficulty].objectives.round1 : difficultySettings[difficulty].objectives.round2;
    const hint = getHint(grid, difficulty, currentObjectives, targetNumbers, validEquations);
    setHintMessage(hint);
    setShowHint(true);
    
    setTimeout(() => {
      setShowHint(false);
    }, 5000);
  };

  const customStats = {
    currentTurn: currentTurn,
    maxTurns: maxTurns,
    validEquations: validEquations,
    tilesPlaced: tilesPlaced,
    accuracy: calculateAccuracy(grid, tilesPlaced),
    objectivesComplete: completedObjectives.length,
    maxScore: 200,
    currentRound: currentRound
  };

  const settings = difficultySettings[difficulty];
  const currentObjectives = currentRound === 1 ? settings.objectives.round1 : settings.objectives.round2;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header unreadCount={2} />

      <GameFramework
        gameTitle="🧮✨ MathMind Architect"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 md:p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-base md:text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Build Your Mathematical Mind Palace
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
                      <Grid3X3 className="h-4 w-4" />
                      🎯 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Create math equations by placing numbers and operators on the grid horizontally, vertically, or diagonally.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg border border-blue-200'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <Calculator className="h-4 w-4" />
                      🧩 How to Play
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Place: Number → Operator → Number</li>
                      <li>• Then: Equals → Answer</li>
                      <li>• Example: 2 + 3 = 5</li>
                      <li>• Use your target numbers!</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg border border-blue-200'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <Sparkles className="h-4 w-4" />
                      💡 Tips
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Start with simple additions</li>
                      <li>• Target numbers are in your tiles</li>
                      <li>• Try diagonal equations too!</li>
                      <li>• Complete objectives to win</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg border border-blue-200'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <Trophy className="h-4 w-4" />
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: Round system (100→200pts)</li>
                      <li>• Moderate: 25pts per equation</li>
                      <li>• Hard: 50pts per equation</li>
                      <li>• Complete rounds to progress</li>
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
        <div className={`flex ${isCompactView ? 'flex-col' : 'flex-col lg:flex-row'} gap-4 md:gap-6`}>
          {/* Left Panel - Controls and Objectives */}
          <div className={`${isCompactView ? 'w-full' : 'lg:w-1/3'} space-y-4 md:space-y-6`}>
            {/* Tile Palette */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 md:p-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                <Calculator className="h-4 w-4 md:h-5 md:w-5" />
                Math Tiles
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                {Object.values(tileTypes).map((tileType) => (
                  <button
                    key={tileType.id}
                    onClick={() => setSelectedTileType(tileType)}
                    className={`p-2 md:p-3 rounded-lg border-2 transition-all ${
                      selectedTileType.id === tileType.id
                        ? `${tileType.color} ${tileType.borderColor} text-white shadow-lg`
                        : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="text-lg md:text-2xl mb-1">{tileType.emoji}</div>
                    <div className="text-xs font-medium">{tileType.name}</div>
                  </button>
                ))}
              </div>
              
              {/* Number Selector */}
              {selectedTileType.category === 'operand' && (
                <div className="mb-3 md:mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Numbers:</h4>
                  <div className="grid grid-cols-6 md:grid-cols-5 gap-1 md:gap-2">
                    {availableNumbers.map((num, index) => {
                      const isTargetNumber = targetNumbers.includes(num);
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedNumber(num)}
                          className={`p-1 md:p-2 rounded border text-xs md:text-sm font-medium transition-colors ${
                            selectedNumber === num
                              ? 'bg-blue-500 text-white border-blue-600'
                              : isTargetNumber
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-400 hover:border-yellow-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {num}
                          {isTargetNumber && <div className="text-xs">⭐</div>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    ⭐ = Target numbers (try to make these!)
                  </p>
                </div>
              )}
              
              {selectedTileType && (
                <div className="p-2 md:p-3 bg-white rounded-lg border">
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    Selected: {selectedTileType.name}
                    {selectedTileType.category === 'operand' && ` (${selectedNumber})`}
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectedTileType.description}
                  </div>
                </div>
              )}
            </div>

            {/* Target Numbers */}
            <div className="bg-yellow-50 rounded-lg p-3 md:p-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4 md:h-5 md:w-5" />
                Target Numbers 
                <span className="text-sm font-normal text-gray-600">
                  ({settings.targetFrequency}x each)
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {targetNumbers.map((target, index) => (
                  <div
                    key={index}
                    className="bg-yellow-200 text-yellow-800 px-2 md:px-3 py-1 md:py-2 rounded-lg font-bold text-base md:text-lg"
                  >
                    {target}
                  </div>
                ))}
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                These numbers appear {settings.targetFrequency} time{settings.targetFrequency > 1 ? 's' : ''} each in your available numbers. Use them as equation results!
              </p>
            </div>

            {/* Game Controls */}
            {gameState === 'playing' && (
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
            <div className="bg-gradient-to-br from-gray-100 to-purple-100 rounded-lg p-3 md:p-6">
              <div className={`grid grid-cols-7 gap-1 md:gap-2 aspect-square ${isCompactView ? 'max-w-sm' : 'max-w-md'} mx-auto`}>
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isHovered = hoveredCell.row === rowIndex && hoveredCell.col === colIndex;
                    const canPlace = gameState === 'playing' && isValidPlacement(grid, rowIndex, colIndex, selectedTileType);
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`aspect-square rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center text-xs md:text-sm font-bold ${
                          cell
                            ? `${tileTypes[cell.type]?.color || 'bg-gray-500'} ${tileTypes[cell.type]?.borderColor || 'border-gray-600'} text-white shadow-md`
                            : isHovered && canPlace
                            ? 'bg-blue-200 border-blue-400 shadow-md'
                            : canPlace
                            ? 'bg-white border-gray-300 hover:border-blue-300'
                            : 'bg-gray-100 border-gray-200'
                        }`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                        onMouseLeave={() => setHoveredCell({ row: -1, col: -1 })}
                      >
                        {cell ? (
                          <div className="text-center">
                            <div className="text-sm md:text-lg">{cell.value}</div>
                          </div>
                        ) : isHovered && canPlace ? (
                          <div className="text-blue-600 opacity-70 text-sm md:text-lg">
                            {selectedTileType.category === 'operand' ? selectedNumber : selectedTileType.emoji}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Grid Instructions */}
              <div className="text-center mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {isCompactView ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  <span>Click empty squares to place tiles</span>
                </div>
                <span className="font-semibold">
                  Selected: {selectedTileType.name} 
                  {selectedTileType.category === 'operand' ? ` (${selectedNumber})` : ` ${selectedTileType.emoji}`}
                </span>
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
                  Equations Made
                </div>
                <div className="text-lg md:text-xl font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {validEquations}
                </div>
              </div>
              
              <div className="text-center bg-green-50 rounded-lg p-2 md:p-3">
                <div className="text-xs md:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Success Rate
                </div>
                <div className="text-lg md:text-xl font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {calculateAccuracy(grid, tilesPlaced)}%
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
        gameTitle="MathMind Architect"
      />
    </div>
  );
};

export default MathMindGame;