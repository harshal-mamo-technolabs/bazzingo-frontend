// Difficulty settings
export const difficultySettings = {
  Easy: { timeLimit: 300, lives: 5, hints: 3, turnCount: 8, pointsPerSuccess: 25, penaltyPerBreach: 10, guardsPerTurn: 3 },
  Moderate: { timeLimit: 240, lives: 4, hints: 2, turnCount: 5, pointsPerSuccess: 40, penaltyPerBreach: 20, guardsPerTurn: 2 },
  Hard: { timeLimit: 180, lives: 3, hints: 1, turnCount: 4, pointsPerSuccess: 50, penaltyPerBreach: 25, guardsPerTurn: 2 }
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

// Guard types
export const guardTypes = [
  { id: 'guard', name: 'Guard', emoji: '💂', cost: 1 },
  { id: 'archer_guard', name: 'Archer', emoji: '🏹', cost: 1 },
  { id: 'knight_guard', name: 'Knight', emoji: '🛡️', cost: 2 }
];

// Generate castle map
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
  
  // Create gates (entry points)
  map[0][3] = 'gate'; // North gate
  map[0][4] = 'gate';
  map[CASTLE_SIZE - 1][3] = 'gate'; // South gate
  map[CASTLE_SIZE - 1][4] = 'gate';
  map[3][0] = 'gate'; // West gate
  map[4][0] = 'gate';
  map[3][CASTLE_SIZE - 1] = 'gate'; // East gate
  map[4][CASTLE_SIZE - 1] = 'gate';
  
  // Create central keep
  map[3][3] = 'keep';
  map[3][4] = 'keep';
  map[4][3] = 'keep';
  map[4][4] = 'keep';
  
  // Create inner pathways
  for (let i = 2; i < CASTLE_SIZE - 2; i++) {
    map[2][i] = 'path';
    map[5][i] = 'path';
    map[i][2] = 'path';
    map[i][5] = 'path';
  }
  
  return map;
};

// Generate enemy scenarios for each turn
export const generateEnemyScenarios = (difficulty) => {
  const settings = difficultySettings[difficulty];
  const scenarios = [];
  
  const spawnPoints = [
    { row: 0, col: 3, direction: 'south', name: 'North Gate' },
    { row: 0, col: 4, direction: 'south', name: 'North Gate' },
    { row: 7, col: 3, direction: 'north', name: 'South Gate' },
    { row: 7, col: 4, direction: 'north', name: 'South Gate' },
    { row: 3, col: 0, direction: 'east', name: 'West Gate' },
    { row: 4, col: 0, direction: 'east', name: 'West Gate' },
    { row: 3, col: 7, direction: 'west', name: 'East Gate' },
    { row: 4, col: 7, direction: 'west', name: 'East Gate' }
  ];
  
  for (let turn = 0; turn < settings.turnCount; turn++) {
    const enemyCount = Math.min(3 + Math.floor(turn / 2), 6);
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
        direction: spawnPoint.direction,
        spawnName: spawnPoint.name,
        blocked: false,
        reachedKeep: false
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

// Calculate enemy paths
export const calculateEnemyPaths = (enemies, guardPositions, castleMap) => {
  const updatedEnemies = enemies.map(enemy => {
    const path = findPathToKeep(enemy.row, enemy.col, enemy.direction, castleMap, guardPositions);
    const blocked = path.length === 0 || isPathBlocked(path, guardPositions);
    const reachedKeep = !blocked && path.length > 0 && 
      (path[path.length - 1].row >= 3 && path[path.length - 1].row <= 4 && 
       path[path.length - 1].col >= 3 && path[path.length - 1].col <= 4);
    
    return {
      ...enemy,
      path,
      blocked,
      reachedKeep: !blocked && reachedKeep
    };
  });
  
  return updatedEnemies;
};

const findPathToKeep = (startRow, startCol, direction, castleMap, guardPositions) => {
  const path = [];
  let currentRow = startRow;
  let currentCol = startCol;
  
  // Simple pathfinding - move towards center
  const targetRow = 3.5;
  const targetCol = 3.5;
  
  const maxSteps = 20;
  let steps = 0;
  
  while (steps < maxSteps) {
    path.push({ row: currentRow, col: currentCol });
    
    // Check if we reached the keep area
    if (currentRow >= 3 && currentRow <= 4 && currentCol >= 3 && currentCol <= 4) {
      break;
    }
    
    // Calculate next move towards target
    const rowDiff = targetRow - currentRow;
    const colDiff = targetCol - currentCol;
    
    let nextRow = currentRow;
    let nextCol = currentCol;
    
    if (Math.abs(rowDiff) > Math.abs(colDiff)) {
      nextRow = currentRow + (rowDiff > 0 ? 1 : -1);
    } else {
      nextCol = currentCol + (colDiff > 0 ? 1 : -1);
    }
    
    // Check bounds and valid movement
    if (nextRow < 0 || nextRow >= CASTLE_SIZE || nextCol < 0 || nextCol >= CASTLE_SIZE) {
      break;
    }
    
    if (castleMap[nextRow][nextCol] === 'wall') {
      // Try alternative direction
      if (Math.abs(rowDiff) > Math.abs(colDiff)) {
        nextCol = currentCol + (colDiff > 0 ? 1 : -1);
        nextRow = currentRow;
      } else {
        nextRow = currentRow + (rowDiff > 0 ? 1 : -1);
        nextCol = currentCol;
      }
    }
    
    currentRow = nextRow;
    currentCol = nextCol;
    steps++;
  }
  
  return path;
};

const isPathBlocked = (path, guardPositions) => {
  return path.some(position => 
    guardPositions.some(guard => 
      guard.row === position.row && guard.col === position.col
    )
  );
};

// Calculate turn results
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

// Calculate score
export const calculateScore = (difficulty, successfulDefenses, breaches) => {
  const settings = difficultySettings[difficulty];
  const positiveScore = successfulDefenses * settings.pointsPerSuccess;
  const penalty = breaches * settings.penaltyPerBreach;
  return Math.max(0, Math.min(200, positiveScore - penalty));
};

// Get scenarios based on difficulty
export const getScenariosByDifficulty = (difficulty) => {
  return generateEnemyScenarios(difficulty);
};