import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const NeuralNetworkBuilderGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [difficulty, setDifficulty] = useState('Easy');

  // Game-specific state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [networkGrid, setNetworkGrid] = useState([]);
  const [connections, setConnections] = useState([]);
  const [inputNodes, setInputNodes] = useState([]);
  const [outputNodes, setOutputNodes] = useState([]);
  const [availableConnections, setAvailableConnections] = useState(10);
  const [signalFlow, setSignalFlow] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedNetworks, setCompletedNetworks] = useState(0);
  const [efficiency, setEfficiency] = useState(0);
  const [totalSignals, setTotalSignals] = useState(0);
  const [successfulSignals, setSuccessfulSignals] = useState(0);

  // Network configurations based on difficulty
  const getNetworkConfig = useCallback(() => {
    const configs = {
      Easy: { gridSize: 6, inputs: 2, outputs: 2, maxConnections: 12, signalsPerLevel: 5 },
      Moderate: { gridSize: 8, inputs: 3, outputs: 3, maxConnections: 16, signalsPerLevel: 8 },
      Hard: { gridSize: 10, inputs: 4, outputs: 4, maxConnections: 20, signalsPerLevel: 12 }
    };
    return configs[difficulty];
  }, [difficulty]);

  // Node types with different properties
  const nodeTypes = [
    {
      id: 'input',
      name: 'Input',
      icon: '📥',
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-700',
      description: 'Receives signals'
    },
    {
      id: 'output',
      name: 'Output',
      icon: '📤',
      color: '#EF4444',
      gradient: 'from-red-500 to-red-700',
      description: 'Delivers signals'
    },
    {
      id: 'processor',
      name: 'Processor',
      icon: '⚡',
      color: '#10B981',
      gradient: 'from-emerald-500 to-emerald-700',
      description: 'Processes signals'
    },
    {
      id: 'amplifier',
      name: 'Amplifier',
      icon: '📶',
      color: '#8B5CF6',
      gradient: 'from-violet-500 to-violet-700',
      description: 'Boosts signal strength'
    },
    {
      id: 'filter',
      name: 'Filter',
      icon: '🔍',
      color: '#F59E0B',
      gradient: 'from-amber-500 to-amber-700',
      description: 'Filters signals'
    }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCurrentLevel(1);
    setConnections([]);
    setSignalFlow([]);
    setCompletedNetworks(0);
    setEfficiency(0);
    setTotalSignals(0);
    setSuccessfulSignals(0);

    const config = getNetworkConfig();
    const initialTime = difficulty === 'Easy' ? 180 : difficulty === 'Moderate' ? 150 : 120;
    setTimeRemaining(initialTime);
    setAvailableConnections(config.maxConnections);

    generateNewNetwork();
  }, [difficulty, getNetworkConfig]);

  // Generate new network layout
  const generateNewNetwork = useCallback(() => {
    const config = getNetworkConfig();
    const grid = [];

    // Initialize empty grid
    for (let row = 0; row < config.gridSize; row++) {
      const gridRow = [];
      for (let col = 0; col < config.gridSize; col++) {
        gridRow.push({
          id: `${row}-${col}`,
          row,
          col,
          type: 'empty',
          isActive: false,
          hasSignal: false,
          connections: []
        });
      }
      grid.push(gridRow);
    }

    // Place input nodes (left side)
    const inputs = [];
    for (let i = 0; i < config.inputs; i++) {
      const row = Math.floor((config.gridSize / (config.inputs + 1)) * (i + 1));
      grid[row][0].type = 'input';
      grid[row][0].isActive = true;
      inputs.push({ row, col: 0, id: `input-${i}` });
    }

    // Place output nodes (right side)
    const outputs = [];
    for (let i = 0; i < config.outputs; i++) {
      const row = Math.floor((config.gridSize / (config.outputs + 1)) * (i + 1));
      grid[row][config.gridSize - 1].type = 'output';
      grid[row][config.gridSize - 1].isActive = true;
      outputs.push({ row, col: config.gridSize - 1, id: `output-${i}` });
    }

    // Add some processor nodes in the middle
    const processorCount = Math.floor(config.gridSize / 2);
    for (let i = 0; i < processorCount; i++) {
      const row = Math.floor(Math.random() * config.gridSize);
      const col = Math.floor(Math.random() * (config.gridSize - 4)) + 2;
      if (grid[row][col].type === 'empty') {
        grid[row][col].type = 'processor';
        grid[row][col].isActive = true;
      }
    }

    setNetworkGrid(grid);
    setInputNodes(inputs);
    setOutputNodes(outputs);
    setConnections([]);
  }, [getNetworkConfig]);

  // Handle node click for connection
  const handleNodeClick = useCallback((row, col) => {
    if (gameState !== 'playing' || availableConnections <= 0) return;

    const node = networkGrid[row][col];
    if (!node.isActive && node.type === 'empty') {
      // Place a new processor node
      const newGrid = [...networkGrid];
      newGrid[row][col] = {
        ...node,
        type: 'processor',
        isActive: true
      };
      setNetworkGrid(newGrid);
      setAvailableConnections(prev => prev - 1);
    }
  }, [gameState, networkGrid, availableConnections]);

  // Create connection between nodes
  const createConnection = useCallback((fromNode, toNode) => {
    if (availableConnections <= 0) return false;

    const connectionId = `${fromNode.row}-${fromNode.col}_${toNode.row}-${toNode.col}`;
    const reverseId = `${toNode.row}-${toNode.col}_${fromNode.row}-${fromNode.col}`;

    // Check if connection already exists
    if (connections.some(conn => conn.id === connectionId || conn.id === reverseId)) {
      return false;
    }

    // Check if nodes are adjacent (horizontal, vertical, or diagonal)
    const rowDiff = Math.abs(fromNode.row - toNode.row);
    const colDiff = Math.abs(fromNode.col - toNode.col);
    if (rowDiff > 1 || colDiff > 1) return false;

    const newConnection = {
      id: connectionId,
      from: fromNode,
      to: toNode,
      strength: 1,
      isActive: false
    };

    setConnections(prev => [...prev, newConnection]);
    setAvailableConnections(prev => prev - 1);
    return true;
  }, [connections, availableConnections]);

  // Process signal through network
  const processSignal = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setTotalSignals(prev => prev + 1);

    // Start signal from random input
    const startInput = inputNodes[Math.floor(Math.random() * inputNodes.length)];
    const signalPath = [startInput];
    let currentNode = startInput;
    let pathFound = false;

    // Trace path through network
    for (let step = 0; step < 20; step++) { // Max 20 steps to prevent infinite loops
      const possibleConnections = connections.filter(conn =>
        (conn.from.row === currentNode.row && conn.from.col === currentNode.col) ||
        (conn.to.row === currentNode.row && conn.to.col === currentNode.col)
      );

      if (possibleConnections.length === 0) break;

      // Choose random connection
      const chosenConnection = possibleConnections[Math.floor(Math.random() * possibleConnections.length)];
      const nextNode = chosenConnection.from.row === currentNode.row && chosenConnection.from.col === currentNode.col
        ? chosenConnection.to
        : chosenConnection.from;

      signalPath.push(nextNode);
      currentNode = nextNode;

      // Check if reached output
      if (outputNodes.some(output => output.row === currentNode.row && output.col === currentNode.col)) {
        pathFound = true;
        break;
      }
    }

    // Animate signal flow
    for (let i = 0; i < signalPath.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSignalFlow(signalPath.slice(0, i + 1));
    }

    if (pathFound) {
      setSuccessfulSignals(prev => prev + 1);
      const pathEfficiency = Math.max(0, 100 - (signalPath.length * 5));
      setScore(prev => prev + Math.floor(pathEfficiency));
      setEfficiency(pathEfficiency);
    }

    setTimeout(() => {
      setSignalFlow([]);
      setIsProcessing(false);
    }, 1000);
  }, [isProcessing, inputNodes, outputNodes, connections]);

  // Auto-process signals
  useEffect(() => {
    if (gameState === 'playing' && !isProcessing) {
      const interval = setInterval(() => {
        processSignal();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [gameState, isProcessing, processSignal]);

  // Game timer
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

  // Level progression
  useEffect(() => {
    if (successfulSignals > 0 && successfulSignals % 10 === 0) {
      setCurrentLevel(prev => prev + 1);
      setCompletedNetworks(prev => prev + 1);
      generateNewNetwork();
    }
  }, [successfulSignals, generateNewNetwork]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    currentLevel,
    completedNetworks,
    efficiency: Math.round(efficiency),
    successfulSignals,
    totalSignals,
    availableConnections
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Neural Network Builder"
        gameDescription="Build and optimize neural pathways! Connect nodes to create efficient signal transmission networks and test your systems thinking."
        category="Systems Thinking"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs sm:text-sm text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-emerald-200">
              <div className="text-xs sm:text-sm text-emerald-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Networks
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedNetworks}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-amber-200">
              <div className="text-xs sm:text-sm text-amber-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Efficiency
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(efficiency)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs sm:text-sm text-purple-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Success Rate
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalSignals > 0 ? Math.round((successfulSignals / totalSignals) * 100) : 0}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Connections
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {availableConnections}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-gray-200">
              <div className="text-xs sm:text-sm text-gray-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Signals
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {successfulSignals}/{totalSignals}
              </div>
            </div>
          </div>

          {/* Network Grid Display */}
          {gameState === 'playing' && (
            <div className="w-full max-w-4xl">
              {/* Network Controls */}
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Click empty spaces to add processors • Signals auto-flow every 3 seconds
                  </div>
                  <button
                    onClick={processSignal}
                    disabled={isProcessing}
                    className="bg-[#FF6B3E] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a35] disabled:opacity-50"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {isProcessing ? 'Processing...' : 'Send Signal'}
                  </button>
                </div>
              </div>

              {/* Network Grid */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 relative">
                <div
                  className="grid gap-2 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${networkGrid.length}, 1fr)`,
                    maxWidth: '600px'
                  }}
                >
                  {networkGrid.map((row, rowIndex) =>
                    row.map((node, colIndex) => (
                      <NetworkNode
                        key={`${rowIndex}-${colIndex}`}
                        node={node}
                        onClick={() => handleNodeClick(rowIndex, colIndex)}
                        isInSignalPath={signalFlow.some(signal => signal.row === rowIndex && signal.col === colIndex)}
                        nodeTypes={nodeTypes}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Node Legend */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {nodeTypes.slice(0, 3).map((type) => (
                  <div key={type.id} className="flex items-center gap-2 bg-white rounded-lg p-2 shadow border border-gray-200">
                    <span className="text-lg">{type.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {type.name}
                      </div>
                      <div className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {type.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🧠🔗</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Neural Network Builder
                </h3>
                <div className="text-left space-y-3 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <p><strong>🎯 Objective:</strong> Build efficient neural pathways from inputs to outputs</p>
                  <p><strong>📥 Input Nodes:</strong> Blue nodes on the left generate signals</p>
                  <p><strong>📤 Output Nodes:</strong> Red nodes on the right receive signals</p>
                  <p><strong>⚡ Processors:</strong> Click empty spaces to add green processing nodes</p>
                  <p><strong>🔗 Auto-Connect:</strong> Adjacent nodes automatically connect</p>
                  <p><strong>📊 Efficiency:</strong> Shorter signal paths = higher scores</p>
                  <p><strong>🎮 Strategy:</strong> Create multiple pathways for redundancy</p>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Summary */}
          {gameState === 'finished' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Network Analysis Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Final Score</div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{score}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Networks Built</div>
                    <div className="text-2xl font-bold text-green-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{completedNetworks}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Success Rate</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {totalSignals > 0 ? Math.round((successfulSignals / totalSignals) * 100) : 0}%
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Avg Efficiency</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{Math.round(efficiency)}%</div>
                  </div>
                </div>
                <div className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Systems Thinking Score: {Math.round((score / Math.max(totalSignals, 1)) * 10)}/100
                </div>
              </div>
            </div>
          )}
        </div>
      </GameFramework>
    </div>
  );
};

// Network Node Component
const NetworkNode = ({ node, onClick, isInSignalPath, nodeTypes }) => {
  const getNodeStyle = () => {
    if (node.type === 'empty') {
      return {
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        cursor: 'pointer'
      };
    }

    const nodeType = nodeTypes.find(type => type.id === node.type);
    if (!nodeType) return {};

    return {
      backgroundColor: isInSignalPath ? '#FFE4B5' : nodeType.color,
      border: `2px solid ${nodeType.color}`,
      color: 'white',
      cursor: node.type === 'empty' ? 'pointer' : 'default'
    };
  };

  const getNodeIcon = () => {
    if (node.type === 'empty') return '';
    const nodeType = nodeTypes.find(type => type.id === node.type);
    return nodeType ? nodeType.icon : '';
  };

  return (
    <div
      className={`
        w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200
        ${isInSignalPath ? 'animate-pulse shadow-lg' : ''}
        ${node.type === 'empty' ? 'hover:bg-gray-200' : ''}
      `}
      style={{
        ...getNodeStyle(),
        fontFamily: 'Roboto, sans-serif'
      }}
      onClick={onClick}
    >
      {getNodeIcon()}
    </div>
  );
};

export default NeuralNetworkBuilderGame;
