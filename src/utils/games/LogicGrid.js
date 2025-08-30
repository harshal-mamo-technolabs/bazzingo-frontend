// utils/logicGrid.js

// ---------------- Difficulty Settings ----------------
export const difficultySettings = {
  Easy: { 
    gridSize: 3, 
    timeLimit: 180, 
    lives: 5, 
    hints: 3, 
    symbols: ['🔴', '🔵', '🟡'], 
    ruleTypes: ['unique_row', 'unique_col'],
    prefilled: 3
  },
  Moderate: { 
    gridSize: 4, 
    timeLimit: 240, 
    lives: 4, 
    hints: 2, 
    symbols: ['🔴', '🔵', '🟡', '🟢'], 
    ruleTypes: ['unique_row', 'unique_col', 'adjacent_different'],
    prefilled: 4
  },
  Hard: { 
    gridSize: 5, 
    timeLimit: 300, 
    lives: 3, 
    hints: 1, 
    symbols: ['🔴', '🔵', '🟡', '🟢', '🟣'], 
    ruleTypes: ['unique_row', 'unique_col', 'adjacent_different', 'diagonal_constraint'],
    prefilled: 6
  }
};

// ---------------- Puzzle Generation ----------------
const isValid = (grid, row, col, symbol, gridSize, ruleTypes) => {
  // Check unique row
  if (ruleTypes.includes('unique_row')) {
    for (let c = 0; c < gridSize; c++) {
      if (c !== col && grid[row][c] === symbol) return false;
    }
  }

  // Check unique col
  if (ruleTypes.includes('unique_col')) {
    for (let r = 0; r < gridSize; r++) {
      if (r !== row && grid[r][col] === symbol) return false;
    }
  }

  // Check adjacent different
  if (ruleTypes.includes('adjacent_different')) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (let [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
        if (grid[newRow][newCol] === symbol) return false;
      }
    }
  }

  // Check diagonals
  if (ruleTypes.includes('diagonal_constraint')) {
    if (row === col) {
      for (let i = 0; i < gridSize; i++) {
        if (i !== row && grid[i][i] === symbol) return false;
      }
    }
    if (row + col === gridSize - 1) {
      for (let i = 0; i < gridSize; i++) {
        if (i !== row && grid[i][gridSize - 1 - i] === symbol) return false;
      }
    }
  }

  return true;
};

const fillGrid = (grid, row, col, symbols, gridSize, ruleTypes) => {
  if (row === gridSize) return true;

  const nextRow = col === gridSize - 1 ? row + 1 : row;
  const nextCol = col === gridSize - 1 ? 0 : col + 1;

  const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5);

  for (let symbol of shuffledSymbols) {
    if (isValid(grid, row, col, symbol, gridSize, ruleTypes)) {
      grid[row][col] = symbol;
      if (fillGrid(grid, nextRow, nextCol, symbols, gridSize, ruleTypes)) {
        return true;
      }
      grid[row][col] = '';
    }
  }

  return false;
};

export const generatePuzzle = (difficulty) => {
  const settings = difficultySettings[difficulty];
  const { gridSize, symbols, ruleTypes, prefilled } = settings;

  // Solution grid
  const solution = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
  fillGrid(solution, 0, 0, symbols, gridSize, ruleTypes);

  // Player grid
  const playerGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
  const prefilledCells = new Set();

  while (prefilledCells.size < prefilled) {
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
    const cellKey = `${row}-${col}`;
    if (!prefilledCells.has(cellKey)) {
      prefilledCells.add(cellKey);
      playerGrid[row][col] = solution[row][col];
    }
  }

  // Rule descriptions
  const rulesText = [];
  if (ruleTypes.includes('unique_row')) rulesText.push('Each row must contain each symbol exactly once');
  if (ruleTypes.includes('unique_col')) rulesText.push('Each column must contain each symbol exactly once');
  if (ruleTypes.includes('adjacent_different')) rulesText.push('Adjacent cells cannot have the same symbol');
  if (ruleTypes.includes('diagonal_constraint')) rulesText.push('Main diagonals cannot have duplicate symbols');

  return {
    puzzle: {
      gridSize,
      symbols,
      ruleTypes,
      rules: rulesText,
      prefilledCells: Array.from(prefilledCells),
      difficulty
    },
    playerGrid,
    solutionGrid: solution
  };
};

// ---------------- Validation ----------------
export const validateMove = (row, col, symbol, currentPuzzle, playerGrid) => {
  if (!currentPuzzle) return { isValid: true, violations: [] };
  const { gridSize, ruleTypes } = currentPuzzle;
  const violations = [];

  const tempGrid = playerGrid.map(r => [...r]);
  tempGrid[row][col] = symbol;

  if (ruleTypes.includes('unique_row')) {
    const rowSymbols = tempGrid[row].filter(s => s === symbol);
    if (rowSymbols.length > 1) violations.push(`Row ${row + 1} cannot have duplicate ${symbol}`);
  }

  if (ruleTypes.includes('unique_col')) {
    const colSymbols = tempGrid.map(r => r[col]).filter(s => s === symbol);
    if (colSymbols.length > 1) violations.push(`Column ${col + 1} cannot have duplicate ${symbol}`);
  }

  if (ruleTypes.includes('adjacent_different')) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (let [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
        if (tempGrid[newRow][newCol] === symbol) {
          violations.push(`Adjacent cells cannot have the same symbol`);
          break;
        }
      }
    }
  }

  if (ruleTypes.includes('diagonal_constraint')) {
    if (row === col) {
      const diagonalSymbols = tempGrid.map((r, i) => r[i]).filter(s => s === symbol);
      if (diagonalSymbols.length > 1) violations.push(`Main diagonal cannot have duplicate ${symbol}`);
    }
    if (row + col === gridSize - 1) {
      const antiDiagonalSymbols = tempGrid.map((r, i) => r[gridSize - 1 - i]).filter(s => s === symbol);
      if (antiDiagonalSymbols.length > 1) violations.push(`Anti-diagonal cannot have duplicate ${symbol}`);
    }
  }

  return { isValid: violations.length === 0, violations };
};

// ---------------- Scoring ----------------
export const calculateScore = ({
  puzzlesSolved,
  totalTime,
  lives,
  hintsUsed,
  maxStreak,
  timeRemaining,
  difficulty,
  totalMoves
}) => {
  if (puzzlesSolved === 0) return 0;
  const settings = difficultySettings[difficulty];
  const avgTimePerPuzzle = totalTime / puzzlesSolved / 1000;
  const accuracy = puzzlesSolved / Math.max(1, puzzlesSolved + (5 - lives));

  let baseScore = puzzlesSolved * 10;
  const idealTime = difficulty === 'Easy' ? 30 : difficulty === 'Moderate' ? 45 : 60;
  const speedBonus = Math.max(0, Math.min(40, (idealTime - avgTimePerPuzzle) * 2));
  const accuracyBonus = accuracy * 35;
  const streakBonus = Math.min(maxStreak * 3, 30);
  const livesBonus = (lives / settings.lives) * 20;
  const hintsPenalty = (hintsUsed / settings.hints) * 20;
  const expectedMoves = puzzlesSolved * settings.gridSize * settings.gridSize;
  const efficiencyBonus = Math.max(0, Math.min(15, ((expectedMoves - totalMoves) / expectedMoves) * 15));
  const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;
  const timeRemainingBonus = Math.min(10, (timeRemaining / settings.timeLimit) * 10);

  let finalScore = (
    baseScore +
    speedBonus +
    accuracyBonus +
    streakBonus +
    livesBonus +
    efficiencyBonus +
    timeRemainingBonus -
    hintsPenalty
  ) * difficultyMultiplier;

  return Math.round(Math.max(0, Math.min(200, finalScore * 0.85)));
};
