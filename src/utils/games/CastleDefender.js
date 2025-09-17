// Difficulty settings - Fixed according to requirements
export const difficultySettings = {
  Easy: { 
    timeLimit: 150, 
    lives: 5, 
    hints: 3, 
    turnCount: 8, 
    pointsPerSuccess: 25, 
    penaltyPerBreach: 0, // No penalty for Easy mode
    guardsPerTurn: 3 
  },
  Moderate: { 
    timeLimit: 120, 
    lives: 4, 
    hints: 2, 
    turnCount: 5, 
    pointsPerSuccess: 40, 
    penaltyPerBreach: 20, 
    guardsPerTurn: 2 
  },
  Hard: { 
    timeLimit: 90, 
    lives: 3, 
    hints: 1, 
    turnCount: 4, 
    pointsPerSuccess: 50, 
    penaltyPerBreach: 25, 
    guardsPerTurn: 2 
  }
};

// Castle map dimensions
export const CASTLE_SIZE = 8;

// Enemy types
export const enemyTypes = [
  { id: 'soldier', name: 'Soldier', emoji: '⚔️', speed: 1 },
  { id: 'archer', name: 'Archer', emoji: '🏹', speed: 1 },
  { id: 'knight', name: 'Knight', emoji: '🛡️', speed: 1 },
  { id: 'assassin', name: 'Assassin', emoji: '🗡️', speed: 2 }
];

// Guard types - Enhanced with upgrade system
export const guardTypes = [
  { id: 'guard', name: 'Guard', emoji: '💂', cost: 1, strength: 1 },
  { id: 'archer_guard', name: 'Archer', emoji: '🏹', cost: 1, strength: 1 },
  { id: 'knight_guard', name: 'Knight', emoji: '🛡️', cost: 2, strength: 2 }
];

// Gate colors for better visualization
export const gateColors = {
  north: '🚪', // You can replace with colored door emojis if available
  south: '🚪',
  east: '🚪',
  west: '🚪'
};

// Generate castle map - Fixed to have one door on each side with better gate identification
export const generateCastleMap = () => {
  const map = Array(CASTLE_SIZE).fill(null).map(() => Array(CASTLE_SIZE).fill('empty'));
  
  // Create castle walls (outer perimeter)
  for (let i = 0; i < CASTLE_SIZE; i++) {
    for (let j = 0; j < CASTLE_SIZE; j++) {
      if (i === 0 || i === CASTLE_SIZE - 1 || j === 0 || j === CASTLE_SIZE - 1) {
        map[i][j] = 'wall';
      }
    }
  }
  
  // Create gates (one on each side) with identifiers
  const centerPos = Math.floor(CASTLE_SIZE / 2);
  map[0][centerPos] = 'gate_north'; // North gate
  map[CASTLE_SIZE - 1][centerPos] = 'gate_south'; // South gate
  map[centerPos][0] = 'gate_west'; // West gate
  map[centerPos][CASTLE_SIZE - 1] = 'gate_east'; // East gate
  
  // Create central keep (single castle)
  map[centerPos][centerPos] = 'keep';
  
  // Create inner pathways for better navigation
  for (let i = 1; i < CASTLE_SIZE - 1; i++) {
    for (let j = 1; j < CASTLE_SIZE - 1; j++) {
      if (map[i][j] === 'empty') {
        map[i][j] = 'path';
      }
    }
  }
  
  return map;
};

// Generate enemy scenarios for each turn
export const generateEnemyScenarios = (difficulty) => {
  const settings = difficultySettings[difficulty];
  const scenarios = [];
  
  // Fixed spawn points - one on each side
  const spawnPoints = [
    { row: 0, col: Math.floor(CASTLE_SIZE / 2), direction: 'south', name: 'North Gate', gate: 'gate_north' },
    { row: CASTLE_SIZE - 1, col: Math.floor(CASTLE_SIZE / 2), direction: 'north', name: 'South Gate', gate: 'gate_south' },
    { row: Math.floor(CASTLE_SIZE / 2), col: 0, direction: 'east', name: 'West Gate', gate: 'gate_west' },
    { row: Math.floor(CASTLE_SIZE / 2), col: CASTLE_SIZE - 1, direction: 'west', name: 'East Gate', gate: 'gate_east' }
  ];
  
  for (let turn = 0; turn < settings.turnCount; turn++) {
    const enemyCount = Math.min(2 + Math.floor(turn / 2), 4); // Balanced enemy count
    const enemies = [];
    
    for (let i = 0; i < enemyCount; i++) {
      const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      
      enemies.push({
        id: `enemy_${turn}_${i}`,
        type: enemyType.id,
        emoji: enemyType.emoji,
        name: enemyType.name,
        speed: enemyType.speed,
        row: spawnPoint.row,
        col: spawnPoint.col,
        currentRow: spawnPoint.row,
        currentCol: spawnPoint.col,
        direction: spawnPoint.direction,
        spawnName: spawnPoint.name,
        gate: spawnPoint.gate,
        blocked: false,
        reachedKeep: false,
        path: [],
        pathIndex: 0,
        isMoving: false
      });
    }
    
    scenarios.push({
      turn: turn + 1,
      enemies,
      description: `Turn ${turn + 1}: ${enemies.length} enemies approaching from multiple directions!`,
      briefing: generateTurnBriefing(turn + 1, enemies, difficulty)
    });
  }
  
  return scenarios;
};

const generateTurnBriefing = (turnNumber, enemies, difficulty) => {
  const spawnCounts = {};
  enemies.forEach(enemy => {
    spawnCounts[enemy.spawnName] = (spawnCounts[enemy.spawnName] || 0) + 1;
  });
  
  const spawns = Object.entries(spawnCounts).map(([gate, count]) => `${count} from ${gate}`).join(', ');
  const totalEnemies = enemies.length;
  const guardsAvailable = difficultySettings[difficulty].guardsPerTurn;
  
  return `${totalEnemies} enemies incoming: ${spawns}. You have ${guardsAvailable} guards to deploy strategically.`;
};

// Fixed pathfinding algorithm using A* approach
const findPathToKeep = (startRow, startCol, castleMap, guardPositions) => {
  const target = { row: Math.floor(CASTLE_SIZE / 2), col: Math.floor(CASTLE_SIZE / 2) };
  
  // Simple A* implementation
  const openSet = [{ row: startRow, col: startCol, g: 0, h: 0, f: 0, parent: null }];
  const closedSet = new Set();
  const guardSet = new Set(guardPositions.map(g => `${g.row},${g.col}`));
  
  const heuristic = (row, col) => Math.abs(row - target.row) + Math.abs(col - target.col);
  
  const getNeighbors = (row, col) => [
    { row: row - 1, col }, // North
    { row: row + 1, col }, // South
    { row, col: col - 1 }, // West
    { row, col: col + 1 }  // East
  ].filter(neighbor => 
    neighbor.row >= 0 && neighbor.row < CASTLE_SIZE &&
    neighbor.col >= 0 && neighbor.col < CASTLE_SIZE &&
    castleMap[neighbor.row][neighbor.col] !== 'wall' &&
    !guardSet.has(`${neighbor.row},${neighbor.col}`)
  );
  
  while (openSet.length > 0) {
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    
    closedSet.add(`${current.row},${current.col}`);
    
    // Check if we reached the keep
    if (current.row === target.row && current.col === target.col) {
      // Reconstruct path
      const path = [];
      let node = current;
      while (node) {
        path.unshift({ row: node.row, col: node.col });
        node = node.parent;
      }
      return path;
    }
    
    const neighbors = getNeighbors(current.row, current.col);
    
    for (const neighbor of neighbors) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (closedSet.has(key)) continue;
      
      const tentativeG = current.g + 1;
      const existingNode = openSet.find(n => n.row === neighbor.row && n.col === neighbor.col);
      
      if (!existingNode) {
        const h = heuristic(neighbor.row, neighbor.col);
        openSet.push({
          row: neighbor.row,
          col: neighbor.col,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current
        });
      } else if (tentativeG < existingNode.g) {
        existingNode.g = tentativeG;
        existingNode.f = tentativeG + existingNode.h;
        existingNode.parent = current;
      }
    }
  }
  
  return []; // No path found
};

// Calculate enemy paths - FIXED to properly check if enemies reach the keep
export const calculateEnemyPaths = (enemies, guardPositions, castleMap) => {
  const targetRow = Math.floor(CASTLE_SIZE / 2);
  const targetCol = Math.floor(CASTLE_SIZE / 2);
  
  const updatedEnemies = enemies.map(enemy => {
    const path = findPathToKeep(enemy.row, enemy.col, castleMap, guardPositions);
    const blocked = path.length === 0;
    
    // FIXED: Actually check if the path reaches the keep
    const reachedKeep = !blocked && path.length > 0 &&
      path[path.length - 1].row === targetRow &&
      path[path.length - 1].col === targetCol;
    
    return {
      ...enemy,
      path,
      blocked,
      reachedKeep,
      pathIndex: 0,
      currentRow: enemy.row,
      currentCol: enemy.col
    };
  });
  
  return updatedEnemies;
};

// Calculate turn results - Fixed logic
export const calculateTurnResults = (enemies, guardPositions, castleMap) => {
  const updatedEnemies = calculateEnemyPaths(enemies, guardPositions, castleMap);
  
  const blockedCount = updatedEnemies.filter(enemy => enemy.blocked).length;
  const breachedCount = updatedEnemies.filter(enemy => enemy.reachedKeep).length;
  
  return {
    enemies: updatedEnemies,
    blockedCount,
    breachedCount,
    success: breachedCount === 0
  };
};

// Calculate score - Fixed according to requirements
export const calculateScore = (difficulty, successfulDefenses, breaches) => {
  const settings = difficultySettings[difficulty];
  const positiveScore = successfulDefenses * settings.pointsPerSuccess;
  
  // Only apply penalty if not Easy mode
  const penalty = difficulty === 'Easy' ? 0 : breaches * settings.penaltyPerBreach;
  
  return Math.max(0, Math.min(200, positiveScore - penalty));
};

// Get scenarios based on difficulty
export const getScenariosByDifficulty = (difficulty) => {
  return generateEnemyScenarios(difficulty);
};

// Validation functions
export const isValidGuardPlacement = (row, col, castleMap, guardPositions) => {
  if (row < 0 || row >= CASTLE_SIZE || col < 0 || col >= CASTLE_SIZE) return false;
  
  const cell = castleMap[row][col];
  const hasGuard = guardPositions && guardPositions.some(guard => guard.row === row && guard.col === col);
  
  return (cell === 'path' || cell === 'empty') && !hasGuard;
};

// Hint system implementation - Enhanced
export const generateHint = (currentEnemies, guardPositions, castleMap) => {
  const suggestions = [];
  
  currentEnemies.forEach(enemy => {
    // Calculate path for this enemy
    const path = findPathToKeep(enemy.row, enemy.col, castleMap, guardPositions);
    
    if (path.length > 1) {
      // Suggest blocking early in the path (but not the spawn point)
      const suggestedIndex = Math.min(2, path.length - 1);
      const suggestion = path[suggestedIndex];
      
      if (isValidGuardPlacement(suggestion.row, suggestion.col, castleMap, guardPositions)) {
        suggestions.push({
          ...suggestion,
          priority: path.length, // Higher priority for longer paths
          enemy: enemy.name
        });
      }
    }
  });
  
  // Return the best suggestion (highest priority)
  suggestions.sort((a, b) => b.priority - a.priority);
  return suggestions.length > 0 ? suggestions[0] : null;
};

// NEW: Get preview paths for enemies (for visual feedback)
export const getEnemyPreviewPaths = (enemies, guardPositions, castleMap) => {
  const allPaths = [];
  
  enemies.forEach(enemy => {
    const path = findPathToKeep(enemy.row, enemy.col, castleMap, guardPositions);
    if (path.length > 0) {
      allPaths.push({
        enemyId: enemy.id,
        path: path.slice(1), // Exclude starting position
        blocked: path.length === 0
      });
    }
  });
  
  return allPaths;
};

// NEW: Move enemy along path animation helper
export const moveEnemyStep = (enemy, onComplete) => {
  if (!enemy.path || enemy.pathIndex >= enemy.path.length) {
    if (onComplete) onComplete(enemy);
    return enemy;
  }
  
  const nextPosition = enemy.path[enemy.pathIndex];
  return {
    ...enemy,
    currentRow: nextPosition.row,
    currentCol: nextPosition.col,
    pathIndex: enemy.pathIndex + 1,
    isMoving: true
  };
};