// Enhanced MathMind Architect - Round-based system with proper scoring
export const difficultySettings = {
  Easy: { 
    timeLimit: 600, // 10 minutes
    maxTurns: 15,
    pointsPerEquation: 0, // No points per equation in Easy, uses round system
    pointsPerObjective: 0,
    hints: 5,
    numberRange: [1, 10],
    targetRange: [5, 15],
    targetCount: 6, // Increased to 6 target numbers
    targetFrequency: 2,
    maxTileReuse: 3,
    objectives: {
      round1: [
        { type: 'equationCount', value: 1, text: "Make 1 equation" },
        { type: 'useOperator', value: 'plus', text: "Use addition (+)" },
        { type: 'targetResultCount', value: 1, text: "Create 1 target number" }
      ],
      round2: [
        { type: 'equationCount', value: 3, text: "Make 3 equations total" },
        { type: 'operatorVariety', value: 2, text: "Use 2 different operations" },
        { type: 'targetResultCount', value: 2, text: "Create 2 target numbers" }
      ]
    }
  },
  Moderate: { 
    timeLimit: 480, // 8 minutes
    maxTurns: 20,
    pointsPerEquation: 25, // 25 points per equation
    pointsPerObjective: 0,
    hints: 4,
    numberRange: [1, 15],
    targetRange: [10, 25],
    targetCount: 8, // Increased to 8 target numbers
    targetFrequency: 2,
    maxTileReuse: 2,
    objectives: {
      round1: [
        { type: 'equationCount', value: 2, text: "Make 2 equations" },
        { type: 'operatorVariety', value: 2, text: "Use 2 different operations" },
        { type: 'targetResultCount', value: 2, text: "Create 2 target numbers" },
        { type: 'successRate', value: 75, text: "Get 75% success rate" }
      ],
      round2: [
        { type: 'equationCount', value: 4, text: "Make 4 equations total" },
        { type: 'operatorVariety', value: 3, text: "Use 3 different operations" },
        { type: 'targetResultCount', value: 4, text: "Create 4 target numbers" },
        { type: 'useOperator', value: 'multiply', text: "Use multiplication" }
      ]
    }
  },
  Hard: { 
    timeLimit: 360, // 6 minutes
    maxTurns: 25,
    pointsPerEquation: 50, // 50 points per equation
    pointsPerObjective: 0,
    hints: 3,
    numberRange: [1, 20],
    targetRange: [15, 40],
    targetCount: 4, // 4 target numbers
    targetFrequency: 1,
    maxTileReuse: 1,
    objectives: {
      round1: [
        { type: 'equationCount', value: 2, text: "Make 2 equations" },
        { type: 'operatorVariety', value: 2, text: "Use 2 different operations" }
      ],
      round2: [
        { type: 'equationCount', value: 4, text: "Make 4 equations total" },
        { type: 'targetResultCount', value: 3, text: "Create 3 target numbers" }
      ]
    }
  }
};

// Tile types with their properties
export const tileTypes = {
  NUMBER: {
    id: 'number',
    name: 'Number',
    emoji: '🔢',
    color: 'bg-blue-500',
    borderColor: 'border-blue-600',
    description: 'Numbers for your equations',
    category: 'operand'
  },
  PLUS: {
    id: 'plus',
    name: 'Addition',
    emoji: '➕',
    color: 'bg-green-500',
    borderColor: 'border-green-600',
    description: 'Add numbers together',
    category: 'operator',
    symbol: '+'
  },
  MINUS: {
    id: 'minus',
    name: 'Subtraction',
    emoji: '➖',
    color: 'bg-red-500',
    borderColor: 'border-red-600',
    description: 'Subtract numbers',
    category: 'operator',
    symbol: '-'
  },
  MULTIPLY: {
    id: 'multiply',
    name: 'Multiplication',
    emoji: '✖️',
    color: 'bg-purple-500',
    borderColor: 'border-purple-600',
    description: 'Multiply numbers',
    category: 'operator',
    symbol: '×'
  },
  DIVIDE: {
    id: 'divide',
    name: 'Division',
    emoji: '➗',
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-600',
    description: 'Divide numbers',
    category: 'operator',
    symbol: '÷'
  },
  EQUALS: {
    id: 'equals',
    name: 'Equals',
    emoji: '🟰',
    color: 'bg-teal-500',
    borderColor: 'border-teal-600',
    description: 'Equals sign for results',
    category: 'equals',
    symbol: '='
  }
};

// Game grid utilities
export const createEmptyGrid = (size = 7) => {
  return Array(size).fill(null).map(() => Array(size).fill(null));
};

export const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateTargetNumbers = (difficulty) => {
  const settings = difficultySettings[difficulty];
  let targetPool = [];
  
  // Generate achievable target numbers based on difficulty
  if (difficulty === 'Easy') {
    targetPool = [6, 8, 10, 12, 15, 18]; // 6 targets for Easy
  } else if (difficulty === 'Moderate') {
    targetPool = [10, 12, 15, 18, 20, 24, 25, 28]; // 8 targets for Moderate
  } else {
    targetPool = [18, 20, 24, 30]; // 4 targets for Hard
  }
  
  return targetPool.slice(0, settings.targetCount);
};

export const generateAvailableNumbers = (difficulty, targetNumbers) => {
  const settings = difficultySettings[difficulty];
  const numbers = [];
  const usageCount = {};
  
  // Add target numbers with proper frequency
  targetNumbers.forEach(target => {
    for (let i = 0; i < settings.targetFrequency; i++) {
      numbers.push(target);
      usageCount[target] = (usageCount[target] || 0) + 1;
    }
  });
  
  // Add strategic numbers that can help create target numbers
  let strategicNumbers = [];
  if (difficulty === 'Easy') {
    strategicNumbers = [1, 2, 3, 4, 5];
  } else if (difficulty === 'Moderate') {
    strategicNumbers = [3, 4, 5, 6, 7, 8];
  } else {
    strategicNumbers = [2, 3, 4, 6, 8, 9, 10, 12];
  }
  
  // Add strategic numbers with reuse constraints
  strategicNumbers.forEach(num => {
    const currentCount = usageCount[num] || 0;
    const maxAllowed = settings.maxTileReuse;
    
    for (let i = currentCount; i < maxAllowed; i++) {
      numbers.push(num);
      usageCount[num] = (usageCount[num] || 0) + 1;
    }
  });
  
  // Shuffle the array properly
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  return numbers;
};

export const isValidPlacement = (grid, row, col, tileType, tileValue = null) => {
  // Check if position is empty
  if (grid[row][col] !== null) return false;
  
  // Check bounds
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return false;
  
  return true;
};

export const findEquations = (grid) => {
  const equations = [];
  const gridSize = grid.length;
  
  // Check horizontal equations
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col <= gridSize - 4; col++) {
      const equation = checkEquationFromPosition(grid, row, col, 'horizontal');
      if (equation && equation.length >= 4) {
        const isValid = validateEquation(equation);
        if (isValid) {
          equations.push({
            cells: equation,
            row: row,
            startCol: col,
            direction: 'horizontal',
            isValid: true,
            result: getEquationResult(equation)
          });
        }
      }
    }
  }
  
  // Check vertical equations
  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row <= gridSize - 4; row++) {
      const equation = checkEquationFromPosition(grid, row, col, 'vertical');
      if (equation && equation.length >= 4) {
        const isValid = validateEquation(equation);
        if (isValid) {
          equations.push({
            cells: equation,
            row: row,
            startCol: col,
            direction: 'vertical',
            isValid: true,
            result: getEquationResult(equation)
          });
        }
      }
    }
  }
  
  // Check diagonal equations (top-left to bottom-right)
  for (let row = 0; row <= gridSize - 4; row++) {
    for (let col = 0; col <= gridSize - 4; col++) {
      const equation = checkEquationFromPosition(grid, row, col, 'diagonal-right');
      if (equation && equation.length >= 4) {
        const isValid = validateEquation(equation);
        if (isValid) {
          equations.push({
            cells: equation,
            row: row,
            startCol: col,
            direction: 'diagonal-right',
            isValid: true,
            result: getEquationResult(equation)
          });
        }
      }
    }
  }
  
  // Check diagonal equations (top-right to bottom-left)
  for (let row = 0; row <= gridSize - 4; row++) {
    for (let col = 3; col < gridSize; col++) {
      const equation = checkEquationFromPosition(grid, row, col, 'diagonal-left');
      if (equation && equation.length >= 4) {
        const isValid = validateEquation(equation);
        if (isValid) {
          equations.push({
            cells: equation,
            row: row,
            startCol: col,
            direction: 'diagonal-left',
            isValid: true,
            result: getEquationResult(equation)
          });
        }
      }
    }
  }
  
  return equations;
};

const checkEquationFromPosition = (grid, startRow, startCol, direction) => {
  const equation = [];
  const gridSize = grid.length;
  let hasEquals = false;
  let equalsIndex = -1;
  
  for (let i = 0; i < 6; i++) {
    let row, col;
    
    switch (direction) {
      case 'horizontal':
        row = startRow;
        col = startCol + i;
        break;
      case 'vertical':
        row = startRow + i;
        col = startCol;
        break;
      case 'diagonal-right':
        row = startRow + i;
        col = startCol + i;
        break;
      case 'diagonal-left':
        row = startRow + i;
        col = startCol - i;
        break;
      default:
        return null;
    }
    
    if (row >= gridSize || col >= gridSize || row < 0 || col < 0) break;
    
    const cell = grid[row][col];
    if (!cell) break;
    
    equation.push({
      ...cell,
      row: row,
      col: col
    });
    
    if (cell.type === 'equals') {
      hasEquals = true;
      equalsIndex = i;
      
      // FIXED: Strict check for result cell
      let resultRow, resultCol;
      switch (direction) {
        case 'horizontal':
          resultRow = startRow;
          resultCol = startCol + i + 1;
          break;
        case 'vertical':
          resultRow = startRow + i + 1;
          resultCol = startCol;
          break;
        case 'diagonal-right':
          resultRow = startRow + i + 1;
          resultCol = startCol + i + 1;
          break;
        case 'diagonal-left':
          resultRow = startRow + i + 1;
          resultCol = startCol - i - 1;
          break;
      }
      
      // Ensure result cell is within bounds and exists
      if (resultRow >= 0 && resultRow < gridSize && 
          resultCol >= 0 && resultCol < gridSize) {
        const resultCell = grid[resultRow][resultCol];
        if (resultCell && resultCell.category === 'operand') {
          equation.push({
            ...resultCell,
            row: resultRow,
            col: resultCol
          });
        } else {
          // Result cell doesn't exist or isn't a number - invalid equation
          return null;
        }
      } else {
        // Result would be out of bounds - invalid equation
        return null;
      }
      break;
    }
  }
  
  // Valid equation needs: operand, operator, operand, equals, result (minimum 5 elements)
  if (hasEquals && equation.length >= 5 && equalsIndex >= 2) {
    return equation;
  }
  
  return null;
};

export const validateEquation = (equation) => {
  if (!equation || equation.length < 5) return false;
  
  try {
    // Find equals sign
    const equalsIndex = equation.findIndex(cell => cell.type === 'equals');
    if (equalsIndex === -1 || equalsIndex < 2) return false;
    
    const leftSide = equation.slice(0, equalsIndex);
    const rightSide = equation.slice(equalsIndex + 1);
    
    // Right side should be exactly one number
    if (rightSide.length !== 1 || rightSide[0].category !== 'operand') return false;
    
    // Left side should have at least 3 elements (num op num) and odd length
    if (leftSide.length < 3 || leftSide.length % 2 === 0) return false;
    
    // Check pattern: number, operator, number, operator, number, etc.
    for (let i = 0; i < leftSide.length; i++) {
      if (i % 2 === 0) { // Should be operand
        if (leftSide[i].category !== 'operand') return false;
      } else { // Should be operator
        if (leftSide[i].category !== 'operator') return false;
      }
    }
    
    const leftResult = evaluateExpression(leftSide);
    const rightValue = parseFloat(rightSide[0].value);
    
    // Check if results match (allowing for small floating point errors)
    return Math.abs(leftResult - rightValue) < 0.001;
  } catch (error) {
    return false;
  }
};

export const evaluateExpression = (tokens) => {
  if (!tokens || tokens.length === 0) return 0;
  if (tokens.length === 1) return parseFloat(tokens[0].value);
  
  // Simple left-to-right evaluation (no operator precedence)
  let result = parseFloat(tokens[0].value);
  
  for (let i = 1; i < tokens.length; i += 2) {
    if (i + 1 >= tokens.length) break;
    
    const operator = tokens[i];
    const operand = parseFloat(tokens[i + 1].value);
    
    if (isNaN(operand)) break;
    
    switch (operator.type) {
      case 'plus':
        result += operand;
        break;
      case 'minus':
        result -= operand;
        break;
      case 'multiply':
        result *= operand;
        break;
      case 'divide':
        if (operand === 0) throw new Error('Division by zero');
        result /= operand;
        break;
      default:
        throw new Error('Unknown operator');
    }
  }
  
  return Math.round(result * 1000) / 1000; // Round to 3 decimal places
};

export const getEquationResult = (equation) => {
  const equalsIndex = equation.findIndex(cell => cell.type === 'equals');
  if (equalsIndex !== -1 && equalsIndex + 1 < equation.length) {
    return parseFloat(equation[equalsIndex + 1].value);
  }
  return null;
};

export const calculateScore = (difficulty, validEquations, objectivesComplete, tilesPlaced, accuracy, currentRound) => {
  const settings = difficultySettings[difficulty];
  
  let score = 0;
  
  if (difficulty === 'Easy') {
    // Easy: Round-based system
    if (currentRound === 1) {
      // Round 1: Progress toward 100 points
      const round1Objectives = settings.objectives.round1.length;
      if (objectivesComplete >= round1Objectives) {
        score = 100; // First round complete
      } else {
        // Partial progress in round 1
        score = Math.round((objectivesComplete / round1Objectives) * 100);
      }
    } else {
      // Round 2: Progress from 100 to 200 points
      const round1Objectives = settings.objectives.round1.length;
      const totalObjectives = round1Objectives + settings.objectives.round2.length;
      const round2Progress = Math.max(0, objectivesComplete - round1Objectives);
      const round2Total = settings.objectives.round2.length;
      
      if (objectivesComplete >= totalObjectives) {
        score = 200; // Game complete
      } else {
        score = 100 + Math.round((round2Progress / round2Total) * 100);
      }
    }
  } else {
    // Moderate and Hard: Points per equation
    score = validEquations * settings.pointsPerEquation;
    
    // Small bonus for efficiency (fewer tiles used)
    if (tilesPlaced > 0 && validEquations > 0) {
      const efficiency = Math.min(1, validEquations / (tilesPlaced / 5)); // Ideal: 5 tiles per equation
      score += Math.round(efficiency * 5); // Small bonus
    }
  }
  
  // Cap at 200 points maximum
  return Math.min(200, Math.max(0, score));
};

// FIXED: Use structured objectives with round support
export const checkObjectives = (grid, difficulty, validEquations, tilesPlaced, targetNumbers, currentRound) => {
  const settings = difficultySettings[difficulty];
  const completed = [];
  const equations = findEquations(grid);
  
  // Count different operations used
  const operationsUsed = new Set();
  const operationCount = { plus: 0, minus: 0, multiply: 0, divide: 0 };
  const results = new Set();
  
  equations.forEach(eq => {
    eq.cells.forEach(cell => {
      if (cell.category === 'operator') {
        operationsUsed.add(cell.type);
        operationCount[cell.type] = (operationCount[cell.type] || 0) + 1;
      }
    });
    
    if (eq.result !== null) {
      results.add(eq.result);
    }
  });
  
  // Check both rounds of objectives
  const allObjectives = [...settings.objectives.round1, ...settings.objectives.round2];
  
  allObjectives.forEach((objective, index) => {
    let isComplete = false;
    
    switch (objective.type) {
      case 'equationCount':
        isComplete = validEquations >= objective.value;
        break;
        
      case 'useOperator':
        isComplete = operationsUsed.has(objective.value);
        break;
        
      case 'operatorVariety':
        isComplete = operationsUsed.size >= objective.value;
        break;
        
      case 'targetResultCount':
        let targetsReached = 0;
        targetNumbers.forEach(target => {
          if (results.has(target)) {
            targetsReached++;
          }
        });
        isComplete = targetsReached >= objective.value;
        break;
        
      case 'successRate':
        const accuracy = calculateAccuracy(grid, tilesPlaced);
        isComplete = accuracy >= objective.value;
        break;
        
      default:
        isComplete = false;
    }
    
    if (isComplete) {
      completed.push(index);
    }
  });
  
  return completed;
};

export const calculateAccuracy = (grid, tilesPlaced) => {
  if (tilesPlaced === 0) return 100;
  
  const equations = findEquations(grid);
  const validEquations = equations.filter(eq => eq.isValid).length;
  
  // Count equals signs to estimate equation attempts
  let equalsCount = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (grid[row][col] && grid[row][col].type === 'equals') {
        equalsCount++;
      }
    }
  }
  
  if (equalsCount === 0) return 100;
  
  return Math.min(100, Math.round((validEquations / equalsCount) * 100));
};

export const getHint = (grid, difficulty, currentObjectives, targetNumbers, validEquations) => {
  const equations = findEquations(grid);
  
  // Give context-aware simple hints
  if (validEquations === 0) {
    return "🎯 Start simple! Try: 2 + 3 = 5. Place number → plus → number → equals → result";
  }
  
  if (validEquations === 1) {
    return "✨ Great! Now try making another equation using your target numbers.";
  }
  
  // Check what operations are missing
  const operationsUsed = new Set();
  equations.forEach(eq => {
    eq.cells.forEach(cell => {
      if (cell.category === 'operator') {
        operationsUsed.add(cell.type);
      }
    });
  });
  
  if (!operationsUsed.has('plus')) {
    return "➕ Try using addition (+) first! Look for numbers that add up to your targets.";
  }
  
  if (!operationsUsed.has('minus') && operationsUsed.size >= 1) {
    return "➖ Try subtraction! Example: 10 - 4 = 6";
  }
  
  if (!operationsUsed.has('multiply') && operationsUsed.size >= 2) {
    return "✖️ Try multiplication! Example: 3 × 4 = 12";
  }
  
  // Check target numbers
  const results = new Set();
  equations.forEach(eq => {
    if (eq.result !== null) results.add(eq.result);
  });
  
  const unmetTargets = targetNumbers.filter(target => !results.has(target));
  if (unmetTargets.length > 0) {
    const target = unmetTargets[0];
    return `🎯 Try to make ${target}! You have this number in your available tiles.`;
  }
  
  // Suggest using diagonals
  if (validEquations >= 2) {
    return "📐 Pro tip: You can make equations diagonally too! Try placing tiles diagonally for more options.";
  }
  
  // General hints
  const hints = [
    "💡 Remember: equations work left to right, like 2 + 3 = 5",
    "🔄 Use your target numbers from the available numbers!",
    "📐 You can make equations going down or diagonally too!",
    "⭐ Try to complete multiple objectives with one equation"
  ];
  
  return hints[Math.floor(Math.random() * hints.length)];
};