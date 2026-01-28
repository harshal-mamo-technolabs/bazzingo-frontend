import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const BlockStackingGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [targetStructure, setTargetStructure] = useState([]);
  const [playerStructure, setPlayerStructure] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [structuresCompleted, setStructuresCompleted] = useState(0);
  const [structuresAttempted, setStructuresAttempted] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [sparkles, setSparkles] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [perfectMatches, setPerfectMatches] = useState(0);
  const [blocksPlaced, setBlocksPlaced] = useState(0);

  // Professional block types with enhanced styling
  const blockTypes = [
    {
      id: 'ruby',
      color: '#DC2626',
      gradient: 'from-red-500 via-red-600 to-red-700',
      shadow: 'shadow-red-500/50',
      name: 'Ruby Block',
      icon: '🔴',
      description: 'Crimson foundation stone'
    },
    {
      id: 'sapphire',
      color: '#2563EB',
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      shadow: 'shadow-blue-500/50',
      name: 'Sapphire Block',
      icon: '🔵',
      description: 'Azure structural element'
    },
    {
      id: 'emerald',
      color: '#059669',
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      shadow: 'shadow-emerald-500/50',
      name: 'Emerald Block',
      icon: '🟢',
      description: 'Verdant building component'
    },
    {
      id: 'topaz',
      color: '#D97706',
      gradient: 'from-amber-500 via-amber-600 to-amber-700',
      shadow: 'shadow-amber-500/50',
      name: 'Topaz Block',
      icon: '🟡',
      description: 'Golden architectural piece'
    },
    {
      id: 'amethyst',
      color: '#7C3AED',
      gradient: 'from-violet-500 via-violet-600 to-violet-700',
      shadow: 'shadow-violet-500/50',
      name: 'Amethyst Block',
      icon: '🟣',
      description: 'Mystical construction unit'
    },
    {
      id: 'diamond',
      color: '#0891B2',
      gradient: 'from-cyan-500 via-cyan-600 to-cyan-700',
      shadow: 'shadow-cyan-500/50',
      name: 'Diamond Block',
      icon: '💎',
      description: 'Crystalline masterpiece'
    }
  ];

  // Enhanced difficulty settings
  const difficultySettings = {
    Easy: {
      gridWidth: 4,
      gridHeight: 3,
      blockTypes: 3,
      timeLimit: 60,
      structureComplexity: 'Simple',
      description: 'Perfect for beginners'
    },
    Moderate: {
      gridWidth: 5,
      gridHeight: 4,
      blockTypes: 4,
      timeLimit: 50,
      structureComplexity: 'Intermediate',
      description: 'Balanced challenge'
    },
    Hard: {
      gridWidth: 6,
      gridHeight: 5,
      blockTypes: 5,
      timeLimit: 40,
      structureComplexity: 'Complex',
      description: 'Master architect level'
    }
  };

  // Create professional sparkle effect
  const createSparkleEffect = useCallback((x, y, type = 'success') => {
    const sparkleCount = type === 'perfect' ? 15 : type === 'success' ? 8 : 5;
    const colors = {
      perfect: ['#10B981', '#059669', '#047857'],
      success: ['#F59E0B', '#D97706', '#B45309'],
      error: ['#EF4444', '#DC2626', '#B91C1C']
    };

    const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
      color: colors[type][Math.floor(Math.random() * colors[type].length)],
      symbol: type === 'perfect' ? '✨' : type === 'success' ? '⭐' : '💫',
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      }
    }));

    setSparkles(prev => [...prev, ...newSparkles]);

    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 2500);
  }, []);

  // Enhanced structure generation with architectural patterns
  const generateStructure = useCallback((width, height, numBlockTypes) => {
    const structure = Array(height).fill().map(() => Array(width).fill(null));
    const usedBlocks = blockTypes.slice(0, numBlockTypes);

    // Create more interesting architectural patterns
    const patterns = ['pyramid', 'tower', 'bridge', 'castle', 'stairs'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    switch (pattern) {
      case 'pyramid':
        // Build a pyramid structure
        for (let y = height - 1; y >= Math.floor(height / 2); y--) {
          const rowWidth = Math.min(width, (height - y) * 2 - 1);
          const startX = Math.floor((width - rowWidth) / 2);
          for (let x = startX; x < startX + rowWidth; x++) {
            if (Math.random() > 0.3) {
              const randomBlock = usedBlocks[Math.floor(Math.random() * usedBlocks.length)];
              structure[y][x] = randomBlock.id;
            }
          }
        }
        break;

      case 'tower':
        // Build vertical towers
        const numTowers = Math.min(3, Math.floor(width / 2));
        for (let t = 0; t < numTowers; t++) {
          const towerX = Math.floor(Math.random() * width);
          const towerHeight = Math.floor(Math.random() * height) + 1;
          for (let y = height - 1; y >= height - towerHeight; y--) {
            const randomBlock = usedBlocks[Math.floor(Math.random() * usedBlocks.length)];
            structure[y][towerX] = randomBlock.id;
          }
        }
        break;

      case 'bridge':
        // Build a bridge structure
        const bridgeY = height - 2;
        for (let x = 1; x < width - 1; x++) {
          const randomBlock = usedBlocks[Math.floor(Math.random() * usedBlocks.length)];
          structure[bridgeY][x] = randomBlock.id;
        }
        // Add support pillars
        if (width > 3) {
          structure[height - 1][0] = usedBlocks[0].id;
          structure[height - 1][width - 1] = usedBlocks[0].id;
        }
        break;

      case 'stairs':
        // Build stair-like structure
        for (let i = 0; i < Math.min(width, height); i++) {
          for (let j = 0; j <= i; j++) {
            if (i < width && height - 1 - j >= 0) {
              const randomBlock = usedBlocks[Math.floor(Math.random() * usedBlocks.length)];
              structure[height - 1 - j][i] = randomBlock.id;
            }
          }
        }
        break;

      default: // castle
        // Build a castle-like structure
        // Base foundation
        for (let x = 0; x < width; x++) {
          if (Math.random() > 0.2) {
            const randomBlock = usedBlocks[Math.floor(Math.random() * usedBlocks.length)];
            structure[height - 1][x] = randomBlock.id;
          }
        }
        // Add some upper levels
        for (let y = height - 2; y >= Math.floor(height / 2); y--) {
          for (let x = 0; x < width; x++) {
            if (structure[y + 1][x] && Math.random() > 0.5) {
              const randomBlock = usedBlocks[Math.floor(Math.random() * usedBlocks.length)];
              structure[y][x] = randomBlock.id;
            }
          }
        }
    }

    return structure;
  }, []);

  // Count blocks needed for structure
  const countBlocksNeeded = (structure) => {
    const counts = {};
    structure.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          counts[cell] = (counts[cell] || 0) + 1;
        }
      });
    });
    return counts;
  };

  // Generate available blocks
  const generateAvailableBlocks = (structure) => {
    const needed = countBlocksNeeded(structure);
    const blocks = [];

    Object.entries(needed).forEach(([blockId, count]) => {
      for (let i = 0; i < count + 2; i++) { // Extra blocks for challenge
        blocks.push(blockId);
      }
    });

    // Add some random extra blocks
    const settings = difficultySettings[difficulty];
    const usedBlockTypes = blockTypes.slice(0, settings.blockTypes);
    for (let i = 0; i < 3; i++) {
      const randomBlock = usedBlockTypes[Math.floor(Math.random() * usedBlockTypes.length)];
      blocks.push(randomBlock.id);
    }

    return blocks.sort(() => Math.random() - 0.5);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setStructuresCompleted(0);
    setStructuresAttempted(0);
    setCurrentRound(1);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setTargetStructure([]);
    setPlayerStructure([]);
    setAvailableBlocks([]);
  }, [difficulty]);

  // Generate new round
  const generateNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const newTarget = generateStructure(settings.gridWidth, settings.gridHeight, settings.blockTypes);
    const newPlayerStructure = Array(settings.gridHeight).fill().map(() => Array(settings.gridWidth).fill(null));
    const newAvailableBlocks = generateAvailableBlocks(newTarget);

    setTargetStructure(newTarget);
    setPlayerStructure(newPlayerStructure);
    setAvailableBlocks(newAvailableBlocks);
  }, [difficulty, generateStructure]);

  // Enhanced block placement with professional validation
  const placeBlock = useCallback((x, y, blockId) => {
    if (gameState !== 'playing') return false;

    const settings = difficultySettings[difficulty];

    // Enhanced validation
    if (x < 0 || x >= settings.gridWidth || y < 0 || y >= settings.gridHeight) return false;

    // Check if position has support (bottom row or block below)
    const hasSupport = y === settings.gridHeight - 1 || playerStructure[y + 1][x] !== null;
    if (!hasSupport) return false;

    // Check if position is empty
    if (playerStructure[y][x] !== null) return false;

    // Check if block is available
    const blockIndex = availableBlocks.indexOf(blockId);
    if (blockIndex === -1) return false;

    // Place the block
    const newPlayerStructure = playerStructure.map(row => [...row]);
    newPlayerStructure[y][x] = blockId;
    setPlayerStructure(newPlayerStructure);
    setBlocksPlaced(prev => prev + 1);

    // Remove block from available blocks
    const newAvailableBlocks = [...availableBlocks];
    newAvailableBlocks.splice(blockIndex, 1);
    setAvailableBlocks(newAvailableBlocks);

    // Create sparkle effect at placement position
    const gridElement = document.querySelector(`[data-cell="${x}-${y}"]`);
    if (gridElement) {
      const rect = gridElement.getBoundingClientRect();
      createSparkleEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, 'success');
    }

    // Check if structure matches target
    checkStructureMatch(newPlayerStructure);

    return true;
  }, [gameState, difficulty, playerStructure, availableBlocks, createSparkleEffect]);

  // Enhanced structure matching with detailed analysis
  const checkStructureMatch = useCallback((currentStructure) => {
    let matches = 0;
    let totalBlocks = 0;

    for (let y = 0; y < targetStructure.length; y++) {
      for (let x = 0; x < targetStructure[y].length; x++) {
        if (targetStructure[y][x] !== null) {
          totalBlocks++;
          if (currentStructure[y][x] === targetStructure[y][x]) {
            matches++;
          }
        }
      }
    }

    const accuracy = totalBlocks > 0 ? (matches / totalBlocks) * 100 : 0;

    // Perfect match
    if (matches === totalBlocks && totalBlocks > 0) {
      setPerfectMatches(prev => prev + 1);
      setStructuresCompleted(prev => prev + 1);
      setShowCompletion(true);

      // Create perfect completion effect
      createSparkleEffect(window.innerWidth / 2, window.innerHeight / 2, 'perfect');
      setPulseEffect('perfect');

      setTimeout(() => {
        setShowCompletion(false);
        setPulseEffect(null);
        generateNewRound();
      }, 3000);
    }

    return accuracy;
  }, [targetStructure, createSparkleEffect, generateNewRound]);

  // Remove block from player structure
  const removeBlock = (x, y) => {
    if (gameState !== 'playing') return;

    const blockId = playerStructure[y][x];
    if (!blockId) return;

    // Check if removing this block would make blocks above unsupported
    const settings = difficultySettings[difficulty];
    for (let checkY = y - 1; checkY >= 0; checkY--) {
      if (playerStructure[checkY][x] !== null) {
        return; // Can't remove if blocks are stacked above
      }
    }

    // Remove the block
    const newPlayerStructure = playerStructure.map(row => [...row]);
    newPlayerStructure[y][x] = null;
    setPlayerStructure(newPlayerStructure);

    // Add block back to available blocks
    setAvailableBlocks(prev => [...prev, blockId]);
  };

  // Check if structures match
  const structuresMatch = () => {
    for (let y = 0; y < targetStructure.length; y++) {
      for (let x = 0; x < targetStructure[y].length; x++) {
        if (targetStructure[y][x] !== playerStructure[y][x]) {
          return false;
        }
      }
    }
    return true;
  };

  // Submit structure
  const submitStructure = () => {
    if (gameState !== 'playing') return;

    setStructuresAttempted(prev => prev + 1);

    if (structuresMatch()) {
      setStructuresCompleted(prev => prev + 1);

      // Generate next round after delay
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        generateNewRound();
      }, 1000);
    }
  };

  // Calculate score
  useEffect(() => {
    if (structuresAttempted > 0) {
      const settings = difficultySettings[difficulty];
      const baseScore = structuresCompleted * 40;
      const timeBonus = timeRemaining * 0.3;

      const newScore = Math.min(200, baseScore + timeBonus);
      setScore(Math.max(0, newScore));
    }
  }, [structuresCompleted, structuresAttempted, timeRemaining, difficulty]);

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
    generateNewRound();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    structuresCompleted,
    structuresAttempted,
    currentRound
  };

  const getBlockColor = (blockId) => {
    const block = blockTypes.find(b => b.id === blockId);
    return block ? block.color : '#gray';
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Block Stacking"
        gameDescription="Recreate the target structure by stacking blocks correctly!"
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
                Round
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentRound}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Completed
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {structuresCompleted}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {structuresAttempted > 0 ? Math.round((structuresCompleted / structuresAttempted) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Structures Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6 w-full max-w-4xl">
            {/* Target Structure */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Target Structure
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 inline-block">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridWidth}, 1fr)` }}>
                  {targetStructure.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`target-${x}-${y}`}
                        className="w-8 h-8 border border-gray-300 rounded"
                        style={{ backgroundColor: cell ? getBlockColor(cell) : '#f3f4f6' }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Player Structure */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Your Structure
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 inline-block">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridWidth}, 1fr)` }}>
                  {playerStructure.map((row, y) =>
                    row.map((cell, x) => (
                      <button
                        key={`player-${x}-${y}`}
                        onClick={() => cell ? removeBlock(x, y) : null}
                        className="w-8 h-8 border border-gray-300 rounded hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: cell ? getBlockColor(cell) : '#f3f4f6' }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Available Blocks */}
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Available Blocks
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {availableBlocks.map((blockId, index) => (
                <div
                  key={index}
                  className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: getBlockColor(blockId) }}
                  onClick={() => {
                    // Simple placement - find first valid position
                    const settings = difficultySettings[difficulty];
                    for (let y = settings.gridHeight - 1; y >= 0; y--) {
                      for (let x = 0; x < settings.gridWidth; x++) {
                        const hasSupport = y === settings.gridHeight - 1 || playerStructure[y + 1][x] !== null;
                        if (playerStructure[y][x] === null && hasSupport) {
                          placeBlock(x, y, blockId);
                          return;
                        }
                      }
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitStructure}
            className="bg-[#FF6B3E] text-white px-6 py-3 rounded-lg hover:bg-[#e55a35] transition-colors font-medium"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Check Structure
          </button>

          {/* Instructions */}
          <div className="mt-6 text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Click available blocks to place them, or click placed blocks to remove them.
              Blocks must be supported from below. Match the target structure exactly!
            </p>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default BlockStackingGame;
