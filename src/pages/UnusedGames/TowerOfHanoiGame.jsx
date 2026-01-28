import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const TowerOfHanoiGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [towers, setTowers] = useState([[], [], []]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [selectedDisk, setSelectedDisk] = useState(null);
  const [moves, setMoves] = useState(0);
  const [optimalMoves, setOptimalMoves] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sparkles, setSparkles] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [perfectSolutions, setPerfectSolutions] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [draggedDisk, setDraggedDisk] = useState(null);
  const [draggedFromTower, setDraggedFromTower] = useState(null);
  const [dragOverTower, setDragOverTower] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Professional disk definitions with clean, business-appropriate styling
  const diskStyles = [
    {
      id: 1,
      size: 'w-12 sm:w-16',
      width: 64,
      color: '#1F2937',
      name: 'Disk 1',
      label: '1'
    },
    {
      id: 2,
      size: 'w-16 sm:w-20',
      width: 80,
      color: '#374151',
      name: 'Disk 2',
      label: '2'
    },
    {
      id: 3,
      size: 'w-20 sm:w-24',
      width: 96,
      color: '#4B5563',
      name: 'Disk 3',
      label: '3'
    },
    {
      id: 4,
      size: 'w-24 sm:w-28',
      width: 112,
      color: '#6B7280',
      name: 'Disk 4',
      label: '4'
    },
    {
      id: 5,
      size: 'w-28 sm:w-32',
      width: 128,
      color: '#9CA3AF',
      name: 'Disk 5',
      label: '5'
    },
    {
      id: 6,
      size: 'w-32 sm:w-36',
      width: 144,
      color: '#D1D5DB',
      name: 'Disk 6',
      label: '6'
    }
  ];

  // Enhanced difficulty settings
  const difficultySettings = {
    Easy: {
      disks: 3,
      timeLimit: 120,
      description: 'Perfect for beginners',
      complexity: 'Simple'
    },
    Moderate: {
      disks: 4,
      timeLimit: 180,
      description: 'Balanced challenge',
      complexity: 'Intermediate'
    },
    Hard: {
      disks: 5,
      timeLimit: 300,
      description: 'Master level puzzle',
      complexity: 'Expert'
    }
  };

  // Mouse tracking for drag and drop
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (isDragging && draggedDisk && draggedFromTower !== null) {
        if (dragOverTower !== null && dragOverTower !== draggedFromTower) {
          // Attempt to drop the disk
          moveDisk(draggedFromTower, dragOverTower);
        }
        // Reset drag state
        setIsDragging(false);
        setDraggedDisk(null);
        setDraggedFromTower(null);
        setDragOverTower(null);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedDisk, draggedFromTower, dragOverTower]);

  // Create subtle professional feedback effect
  const createFeedbackEffect = useCallback((type = 'success') => {
    if (type === 'perfect') {
      setPulseEffect('perfect');
      setTimeout(() => setPulseEffect(null), 1000);
    } else if (type === 'success') {
      setPulseEffect('success');
      setTimeout(() => setPulseEffect(null), 500);
    }
  }, []);

  // Handle disk drag start
  const handleDiskDragStart = useCallback((diskId, towerIndex, event) => {
    if (gameState !== 'playing') return;

    const tower = towers[towerIndex];
    const topDisk = tower[tower.length - 1];

    // Only allow dragging the top disk
    if (topDisk !== diskId) return;

    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    setDraggedDisk(diskId);
    setDraggedFromTower(towerIndex);
    setIsDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
  }, [gameState, towers]);

  // Handle tower drag over
  const handleTowerDragOver = useCallback((towerIndex) => {
    if (isDragging && draggedDisk && draggedFromTower !== null) {
      setDragOverTower(towerIndex);
    }
  }, [isDragging, draggedDisk, draggedFromTower]);

  // Handle tower drag leave
  const handleTowerDragLeave = useCallback(() => {
    setDragOverTower(null);
  }, []);

  // Calculate optimal moves (2^n - 1)
  const calculateOptimalMoves = useCallback((numDisks) => {
    return Math.pow(2, numDisks) - 1;
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const numDisks = settings.disks;

    // Create initial tower with all disks on first tower (largest to smallest)
    const initialTower = [];
    for (let i = numDisks; i >= 1; i--) {
      initialTower.push(i);
    }

    setTowers([initialTower, [], []]);
    setSelectedTower(null);
    setSelectedDisk(null);
    setMoves(0);
    setOptimalMoves(calculateOptimalMoves(numDisks));
    setCurrentLevel(1);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setSparkles([]);
    setPulseEffect(null);
    setShowCompletion(false);
    setPerfectSolutions(0);
    setHintsUsed(0);
    setShowHint(false);
  }, [difficulty, calculateOptimalMoves]);

  // Check if game is won
  const checkWinCondition = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const targetTower = towers[2];

    if (targetTower.length === settings.disks) {
      // Check if disks are in correct order (largest to smallest from bottom to top)
      for (let i = 0; i < targetTower.length - 1; i++) {
        if (targetTower[i] < targetTower[i + 1]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }, [towers, difficulty]);

  // Enhanced disk movement with drag and drop support
  const moveDisk = useCallback((fromTower, toTower) => {
    if (gameState !== 'playing') return false;

    const newTowers = [...towers];
    const sourceTower = newTowers[fromTower];
    const targetTower = newTowers[toTower];

    // Check if source tower has disks
    if (sourceTower.length === 0) return false;

    const diskToMove = sourceTower[sourceTower.length - 1];

    // Check if move is valid (smaller disk on larger disk or empty tower)
    if (targetTower.length === 0 || diskToMove < targetTower[targetTower.length - 1]) {
      // Make the move
      sourceTower.pop();
      targetTower.push(diskToMove);

      setTowers(newTowers);
      setMoves(prev => prev + 1);

      // Create subtle feedback effect
      createFeedbackEffect('success');

      // Check win condition
      const newWinCondition = checkWinCondition();
      if (newWinCondition) {
        setShowCompletion(true);
        const isPerfect = moves + 1 === optimalMoves;

        if (isPerfect) {
          setPerfectSolutions(prev => prev + 1);
          createFeedbackEffect('perfect');
        } else {
          createFeedbackEffect('success');
        }

        setTimeout(() => {
          setShowCompletion(false);
          setCurrentLevel(prev => prev + 1);
          initializeGame();
        }, 3000);
      }

      return true;
    } else {
      return false;
    }
  }, [gameState, towers, moves, optimalMoves, mousePosition, createFeedbackEffect, checkWinCondition, initializeGame]);

  // Handle tower click
  const handleTowerClick = useCallback((towerIndex) => {
    if (gameState !== 'playing') return;

    if (selectedTower === null) {
      // Select tower if it has disks
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex);
        setSelectedDisk(towers[towerIndex][towers[towerIndex].length - 1]);
      }
    } else {
      // Try to move disk
      if (selectedTower === towerIndex) {
        // Deselect if clicking same tower
        setSelectedTower(null);
        setSelectedDisk(null);
      } else {
        // Attempt move
        const success = moveDisk(selectedTower, towerIndex);
        setSelectedTower(null);
        setSelectedDisk(null);
      }
    }
  }, [gameState, selectedTower, towers, moveDisk]);

  // Enhanced scoring using Problem-Solving formula
  useEffect(() => {
    if (moves > 0) {
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;
      const efficiency = optimalMoves > 0 ? Math.min(1, optimalMoves / moves) : 0;
      const perfectBonus = perfectSolutions * 25;

      // Enhanced formula: Base score + efficiency bonus + perfect bonus - time penalty - hint penalty
      const extraMoves = Math.max(0, moves - optimalMoves);
      let newScore = 50 + (efficiency * 50) + perfectBonus - (timeUsed * 0.5) - (hintsUsed * 5) - (extraMoves * 5);
      newScore = Math.max(0, Math.min(200, newScore));

      setScore(Math.round(newScore));
    }
  }, [moves, optimalMoves, perfectSolutions, hintsUsed, timeRemaining, difficulty]);

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
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  // Show hint function
  const showHintFunction = () => {
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
  };

  const customStats = {
    moves,
    optimalMoves,
    perfectSolutions,
    hintsUsed,
    efficiency: optimalMoves > 0 ? Math.round((optimalMoves / Math.max(moves, 1)) * 100) : 0,
    time: difficultySettings[difficulty].timeLimit - timeRemaining
  };

  // Professional disk rendering with clean, responsive design
  const renderDisk = (diskId, towerIndex, diskIndex, isTop = false) => {
    const diskStyle = diskStyles.find(d => d.id === diskId);
    if (!diskStyle) return null;

    const isBeingDragged = draggedDisk === diskId && isDragging;
    const isSelected = selectedDisk === diskId;
    const canDrag = isTop && gameState === 'playing';

    let containerClass = `h-6 sm:h-8 md:h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center relative ${diskStyle.size} ${isBeingDragged ? 'scale-105 z-50 shadow-lg' :
      isSelected ? 'scale-105 ring-2 ring-blue-500 z-20' :
        canDrag ? 'hover:scale-105 cursor-grab active:cursor-grabbing' : ''
      }`;

    const diskElement = (
      <div
        className={containerClass}
        style={{
          backgroundColor: diskStyle.color,
          borderColor: isBeingDragged ? '#3B82F6' : isSelected ? '#3B82F6' : '#E5E7EB',
          boxShadow: isBeingDragged
            ? '0 8px 20px rgba(0,0,0,0.15)'
            : isSelected
              ? '0 4px 12px rgba(59,130,246,0.3)'
              : '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onMouseDown={canDrag ? (e) => handleDiskDragStart(diskId, towerIndex, e) : undefined}
        data-disk-id={diskId}
        data-tower={towerIndex}
      >
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>

        {/* Disk label */}
        <div className="text-xs sm:text-sm md:text-base font-semibold text-white relative z-10" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {diskStyle.label}
        </div>

        {/* Selection indicator */}
        {isSelected && !isBeingDragged && (
          <div className="absolute inset-0 rounded-lg border-2 border-blue-400"></div>
        )}

        {/* Hover effect */}
        {canDrag && !isBeingDragged && (
          <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
        )}
      </div>
    );

    // If being dragged, render at mouse position
    if (isBeingDragged) {
      return (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: mousePosition.x - dragOffset.x - diskStyle.width / 2,
            top: mousePosition.y - dragOffset.y - 20,
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))'
          }}
        >
          {diskElement}
        </div>
      );
    }

    return diskElement;
  };

  // Professional tower rendering with beautiful base
  const renderTower = (towerIndex) => {
    const tower = towers[towerIndex];
    const isSelected = selectedTower === towerIndex;
    const isEmpty = tower.length === 0;

    return (
      <div
        className="flex flex-col items-center cursor-pointer relative"
        onClick={() => handleTowerClick(towerIndex)}
        onMouseEnter={() => handleTowerDragOver(towerIndex)}
        onMouseLeave={handleTowerDragLeave}
        data-tower={towerIndex}
      >
        {/* Professional Tower pole */}
        <div className={`w-2 sm:w-3 bg-gradient-to-b from-slate-600 to-slate-800 rounded-t-lg shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''
          } ${dragOverTower === towerIndex && isDragging && draggedDisk && (towers[towerIndex].length === 0 || draggedDisk < towers[towerIndex][towers[towerIndex].length - 1]) ? 'ring-2 ring-green-500 scale-105' : ''}
        ${dragOverTower === towerIndex && isDragging && draggedDisk && towers[towerIndex].length > 0 && draggedDisk >= towers[towerIndex][towers[towerIndex].length - 1] ? 'ring-2 ring-red-500' : ''}`}
          style={{ height: '140px' }}>
          {/* Subtle pole shine effect */}
          <div className="w-0.5 sm:w-1 h-full bg-gradient-to-b from-white/30 to-transparent rounded-t-lg ml-0.5"></div>
        </div>

        {/* Responsive Disks container */}
        <div className="absolute bottom-12 sm:bottom-14 flex flex-col-reverse items-center gap-0.5 sm:gap-1">
          {tower.map((diskId, index) => (
            <div key={`${towerIndex}-${diskId}-${index}`} className="relative">
              {renderDisk(
                diskId,
                towerIndex,
                index,
                index === tower.length - 1
              )}
            </div>
          ))}

          {/* Professional drop zone indicator */}
          {isDragging && dragOverTower === towerIndex && (
            <div className={`w-28 sm:w-36 h-6 sm:h-8 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200 ${draggedDisk && (towers[towerIndex].length === 0 || draggedDisk < towers[towerIndex][towers[towerIndex].length - 1])
              ? 'border-green-500 bg-green-50'
              : 'border-red-500 bg-red-50'
              }`}>
              <span className={`font-medium text-xs sm:text-sm ${draggedDisk && (towers[towerIndex].length === 0 || draggedDisk < towers[towerIndex][towers[towerIndex].length - 1]) ? 'text-green-700' : 'text-red-700'
                }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                {draggedDisk && (towers[towerIndex].length === 0 || draggedDisk < towers[towerIndex][towers[towerIndex].length - 1]) ? 'Drop Here' : 'Invalid'}
              </span>
            </div>
          )}

          {/* Empty tower hint */}
          {isEmpty && !isDragging && (
            <div className="w-20 sm:w-28 h-5 sm:h-6 border border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
              <span className="text-slate-400 font-medium text-xs" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Empty
              </span>
            </div>
          )}
        </div>

        {/* Professional Tower base */}
        <div className={`w-28 sm:w-36 h-3 sm:h-4 bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg shadow-lg border border-slate-600 transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''
          } ${dragOverTower === towerIndex && isDragging && draggedDisk && (towers[towerIndex].length === 0 || draggedDisk < towers[towerIndex][towers[towerIndex].length - 1]) ? 'ring-2 ring-green-500 scale-110' : ''}
        ${dragOverTower === towerIndex && isDragging && draggedDisk && towers[towerIndex].length > 0 && draggedDisk >= towers[towerIndex][towers[towerIndex].length - 1] ? 'ring-2 ring-red-500' : ''}`}>
          {/* Subtle base shine effect */}
          <div className="w-full h-1 sm:h-2 bg-gradient-to-b from-white/20 to-transparent rounded-t-lg"></div>
        </div>

        {/* Professional Tower label */}
        <div className="mt-2 sm:mt-3 text-center">
          <div className={`text-sm sm:text-base font-bold transition-colors duration-200 ${dragOverTower === towerIndex && isDragging && draggedDisk && (towers[towerIndex].length === 0 || draggedDisk < towers[towerIndex][towers[towerIndex].length - 1]) ? 'text-green-600' :
            dragOverTower === towerIndex && isDragging && draggedDisk && towers[towerIndex].length > 0 && draggedDisk >= towers[towerIndex][towers[towerIndex].length - 1] ? 'text-red-600' : 'text-slate-700'
            }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
            {towerIndex === 0 ? 'SOURCE' : towerIndex === 1 ? 'AUXILIARY' : 'TARGET'}
          </div>
          <div className="text-xs sm:text-sm text-slate-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {tower.length} disk{tower.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header unreadCount={3} />

      {/* Professional Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xl border border-gray-200 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Puzzle Completed
            </div>
            <div className="text-base sm:text-lg text-gray-700 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {moves === optimalMoves ? 'Perfect Solution!' : 'Well Done!'}
            </div>
            <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Moves: {moves} / Optimal: {optimalMoves}
            </div>
            <div className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Efficiency: {optimalMoves > 0 ? Math.round((optimalMoves / moves) * 100) : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Professional Hint Modal */}
      {showHint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-200 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Strategy Tip
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Move smaller disks first to create space. Use the auxiliary tower as temporary storage.
              Remember: never place a larger disk on a smaller one.
            </div>
          </div>
        </div>
      )}

      <GameFramework
        gameTitle="Tower of Hanoi"
        gameDescription="Master the ancient puzzle of strategic disk movement and logical thinking!"
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
          {/* Professional Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-5xl">
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                LEVEL
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                MOVES
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {moves}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                OPTIMAL
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {optimalMoves}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                PERFECT
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {perfectSolutions}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                EFFICIENCY
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.efficiency}%
              </div>
            </div>
          </div>

          {/* Professional Game Status */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-3 sm:gap-4 bg-white border border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-md">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tower of Hanoi
                </div>
                <div className="text-sm text-gray-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {difficultySettings[difficulty].complexity} • {difficultySettings[difficulty].disks} Disks
                </div>
              </div>
            </div>
          </div>

          {/* Professional Towers Display */}
          <div className="mb-6 sm:mb-8 relative">
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-12 justify-items-center relative" style={{ minHeight: '200px' }}>
                {[0, 1, 2].map(towerIndex => (
                  <div key={towerIndex} className="relative">
                    {renderTower(towerIndex)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Professional Game Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-2xl">
            <button
              onClick={showHintFunction}
              disabled={gameState !== 'playing'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '600' }}
            >
              Show Hint
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-200 shadow-md"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '600' }}
            >
              Reset Puzzle
            </button>
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center shadow-md sm:col-span-2 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                EFFICIENCY
              </div>
              <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.efficiency}%
              </div>
            </div>
          </div>

          {/* Professional Move Counter */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  CURRENT MOVES
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {moves}
                </div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  OPTIMAL SOLUTION
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {optimalMoves}
                </div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  STATUS
                </div>
                <div className={`text-sm sm:text-base font-bold ${moves <= optimalMoves ? 'text-green-600' :
                  moves <= optimalMoves * 1.5 ? 'text-yellow-600' : 'text-red-600'
                  }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {moves <= optimalMoves ? 'Perfect' : moves <= optimalMoves * 1.5 ? 'Good' : 'Practice'}
                </div>
              </div>
            </div>
          </div>

          {/* Beautiful Legend */}
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-2 border-gray-200 max-w-4xl">
            <div className="text-center mb-4">
              <div className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🗼 Tower of Hanoi Guide
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-bold text-blue-700 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    OBJECTIVE
                  </div>
                </div>
                <div className="text-sm text-blue-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Move all disks from the SOURCE tower to the TARGET tower using the AUXILIARY tower as temporary storage.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">📏</div>
                  <div className="font-bold text-emerald-700 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    RULES
                  </div>
                </div>
                <div className="text-sm text-emerald-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Only move one disk at a time. Never place a larger disk on top of a smaller disk. Use strategic thinking!
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="font-bold text-amber-700 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    MASTERY
                  </div>
                </div>
                <div className="text-sm text-amber-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Achieve the optimal solution in minimum moves. Perfect efficiency earns maximum points and recognition!
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Instructions */}
          <div className="text-center max-w-5xl">
            <div className="p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-2xl shadow-2xl border-2 border-slate-300">
              <div className="text-3xl font-bold text-slate-800 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🧠 ANCIENT WISDOM CHALLENGE
              </div>
              <p className="text-lg text-slate-700 leading-relaxed mb-8" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Master the legendary Tower of Hanoi puzzle that has challenged minds for centuries.
                <span className="font-bold text-slate-900 bg-yellow-200 px-2 py-1 rounded">Think strategically and plan your moves</span> to achieve the perfect solution with mathematical precision.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-blue-300 hover:border-blue-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-blue-600">🧮</div>
                  <div className="font-bold text-blue-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>MATHEMATICAL THINKING</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Apply recursive logic and mathematical principles to solve the puzzle efficiently
                  </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-emerald-300 hover:border-emerald-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-emerald-600">🎯</div>
                  <div className="font-bold text-emerald-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>STRATEGIC PLANNING</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Plan multiple moves ahead and use the auxiliary tower strategically for optimal solutions
                  </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-orange-600">⚡</div>
                  <div className="font-bold text-orange-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>LOGICAL MASTERY</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Develop problem-solving skills and logical reasoning through ancient puzzle wisdom
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Drag & drop disks between towers or click to select and move
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: The minimum moves for n disks is 2^n - 1. Plan your moves strategically.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default TowerOfHanoiGame;
