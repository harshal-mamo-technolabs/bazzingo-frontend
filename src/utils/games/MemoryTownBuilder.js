// Professional Memory Town Builder - Round-based system with predefined layouts
export const difficultySettings = {
  Easy: { 
    timeLimit: 300, // 5 minutes
    maxTurns: 12,
    pointsPerEquation: 0, // Round-based scoring
    pointsPerObjective: 0,
    hints: 4,
    gridSize: 4,
    studyTime: 10,
    targetCount: 6, // 6 target positions
    targetFrequency: 1,
    objectives: {
      round1: [
        { type: 'placeBuilding', value: 'library', text: "Place the Library correctly" },
        { type: 'placeBuilding', value: 'park', text: "Place the Park correctly" },
        { type: 'placeBuilding', value: 'school', text: "Place the School correctly" }
      ],
      round2: [
        { type: 'placeBuilding', value: 'hospital', text: "Place the Hospital correctly" },
        { type: 'placeBuilding', value: 'store', text: "Place the Store correctly" },
        { type: 'avoidNegative', value: 1, text: "Avoid placing buildings on negative zones" }
      ]
    }
  },
  Moderate: { 
    timeLimit: 240, // 4 minutes
    maxTurns: 16,
    pointsPerEquation: 25, // 25 points per correct placement
    pointsPerObjective: 0,
    hints: 3,
    gridSize: 5,
    studyTime: 12,
    targetCount: 8, // 8 target positions
    targetFrequency: 1,
    objectives: {
      round1: [
        { type: 'placeBuilding', value: 'library', text: "Place the Library correctly" },
        { type: 'placeBuilding', value: 'park', text: "Place the Park correctly" },
        { type: 'placeBuilding', value: 'school', text: "Place the School correctly" },
        { type: 'placeBuilding', value: 'hospital', text: "Place the Hospital correctly" }
      ],
      round2: [
        { type: 'placeBuilding', value: 'store', text: "Place the Store correctly" },
        { type: 'placeBuilding', value: 'house', text: "Place the House correctly" },
        { type: 'avoidNegative', value: 2, text: "Avoid negative zones (2 total)" },
        { type: 'accuracy', value: 80, text: "Achieve 80% accuracy" }
      ]
    }
  },
  Hard: { 
    timeLimit: 180, // 3 minutes
    maxTurns: 20,
    pointsPerEquation: 50, // 50 points per correct placement
    pointsPerObjective: 0,
    hints: 2,
    gridSize: 6,
    studyTime: 15,
    targetCount: 4, // 4 target positions
    targetFrequency: 1,
    objectives: {
      round1: [
        { type: 'placeBuilding', value: 'library', text: "Place the Library correctly" },
        { type: 'placeBuilding', value: 'hospital', text: "Place the Hospital correctly" }
      ],
      round2: [
        { type: 'placeBuilding', value: 'school', text: "Place the School correctly" },
        { type: 'accuracy', value: 90, text: "Achieve 90% accuracy" }
      ]
    }
  }
};

// Building types with enhanced properties
export const buildingTypes = {
  library: { 
    icon: '🏛️', 
    name: 'Library', 
    color: 'bg-blue-100 border-blue-300', 
    positive: true,
    category: 'building'
  },
  park: { 
    icon: '🌳', 
    name: 'Park', 
    color: 'bg-green-100 border-green-300', 
    positive: true,
    category: 'building'
  },
  school: { 
    icon: '🏫', 
    name: 'School', 
    color: 'bg-purple-100 border-purple-300', 
    positive: true,
    category: 'building'
  },
  hospital: { 
    icon: '🏥', 
    name: 'Hospital', 
    color: 'bg-red-100 border-red-300', 
    positive: true,
    category: 'building'
  },
  store: { 
    icon: '🏪', 
    name: 'Store', 
    color: 'bg-yellow-100 border-yellow-300', 
    positive: true,
    category: 'building'
  },
  house: { 
    icon: '🏠', 
    name: 'House', 
    color: 'bg-orange-100 border-orange-300', 
    positive: true,
    category: 'building'
  },
  trash: { 
    icon: '🗑️', 
    name: 'Trash Site', 
    color: 'bg-gray-200 border-gray-400', 
    positive: false,
    category: 'negative'
  },
  factory: { 
    icon: '🏭', 
    name: 'Factory', 
    color: 'bg-gray-300 border-gray-500', 
    positive: false,
    category: 'negative'
  },
  empty: { 
    icon: '⬜', 
    name: 'Empty', 
    color: 'bg-gray-50 border-gray-200', 
    positive: true,
    category: 'empty'
  }
};

// Predefined layouts for each difficulty
export const generatePredefinedLayout = (difficulty) => {
  const settings = difficultySettings[difficulty];
  const gridSize = settings.gridSize;
  
  // Create empty grid
  const targetGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('empty'));
  const negativeZones = [];
  
  if (difficulty === 'Easy') {
    // 4x4 grid - Simple layout
    const layouts = [
      {
        positions: [
          { building: 'library', row: 0, col: 1 },
          { building: 'park', row: 1, col: 2 },
          { building: 'school', row: 2, col: 0 },
          { building: 'hospital', row: 3, col: 3 },
          { building: 'store', row: 1, col: 0 },
          { building: 'trash', row: 3, col: 1 }
        ],
        negativeZones: [{ row: 3, col: 1 }]
      },
      {
        positions: [
          { building: 'library', row: 0, col: 0 },
          { building: 'park', row: 0, col: 3 },
          { building: 'school', row: 2, col: 1 },
          { building: 'hospital', row: 3, col: 2 },
          { building: 'store', row: 1, col: 1 },
          { building: 'trash', row: 2, col: 3 }
        ],
        negativeZones: [{ row: 2, col: 3 }]
      }
    ];
    
    const selectedLayout = layouts[Math.floor(Math.random() * layouts.length)];
    selectedLayout.positions.forEach(pos => {
      targetGrid[pos.row][pos.col] = pos.building;
    });
    
    return {
      targetGrid,
      negativeZones: selectedLayout.negativeZones,
      description: "Study the town layout and recreate it perfectly. Avoid negative zones!",
      phase: 'study'
    };
  }
  
  if (difficulty === 'Moderate') {
    // 5x5 grid - Medium complexity
    const layouts = [
      {
        positions: [
          { building: 'library', row: 0, col: 2 },
          { building: 'park', row: 1, col: 0 },
          { building: 'school', row: 1, col: 4 },
          { building: 'hospital', row: 2, col: 2 },
          { building: 'store', row: 3, col: 1 },
          { building: 'house', row: 4, col: 3 },
          { building: 'trash', row: 0, col: 0 },
          { building: 'factory', row: 4, col: 0 }
        ],
        negativeZones: [{ row: 0, col: 0 }, { row: 4, col: 0 }]
      }
    ];
    
    const selectedLayout = layouts[0];
    selectedLayout.positions.forEach(pos => {
      targetGrid[pos.row][pos.col] = pos.building;
    });
    
    return {
      targetGrid,
      negativeZones: selectedLayout.negativeZones,
      description: "Memorize this complex town layout. Place all buildings in their exact positions!",
      phase: 'study'
    };
  }
  
  if (difficulty === 'Hard') {
    // 6x6 grid - High complexity
    const layouts = [
      {
        positions: [
          { building: 'library', row: 1, col: 1 },
          { building: 'hospital', row: 2, col: 4 },
          { building: 'school', row: 4, col: 2 },
          { building: 'park', row: 0, col: 3 }
        ],
        negativeZones: []
      }
    ];
    
    const selectedLayout = layouts[0];
    selectedLayout.positions.forEach(pos => {
      targetGrid[pos.row][pos.col] = pos.building;
    });
    
    return {
      targetGrid,
      negativeZones: selectedLayout.negativeZones,
      description: "Master-level challenge! Perfect placement required for all buildings.",
      phase: 'study'
    };
  }
  
  return { targetGrid, negativeZones: [], description: "", phase: 'study' };
};

// Calculate score with round-based system
export const calculateScore = (difficulty, correctPlacements, totalPlacements, currentRound, completedObjectives) => {
  const settings = difficultySettings[difficulty];
  
  let score = 0;
  
  if (difficulty === 'Easy') {
    // Easy: Round-based system
    if (currentRound === 1) {
      // Round 1: Progress toward 100 points
      const round1Objectives = settings.objectives.round1.length;
      if (completedObjectives >= round1Objectives) {
        score = 100; // First round complete
      } else {
        // Partial progress in round 1
        score = Math.round((completedObjectives / round1Objectives) * 100);
      }
    } else {
      // Round 2: Progress from 100 to 200 points
      const round1Objectives = settings.objectives.round1.length;
      const totalObjectives = round1Objectives + settings.objectives.round2.length;
      const round2Progress = Math.max(0, completedObjectives - round1Objectives);
      const round2Total = settings.objectives.round2.length;
      
      if (completedObjectives >= totalObjectives) {
        score = 200; // Game complete
      } else {
        score = 100 + Math.round((round2Progress / round2Total) * 100);
      }
    }
  } else {
    // Moderate and Hard: Points per correct placement
    score = correctPlacements * settings.pointsPerEquation;
    
    // Small bonus for efficiency
    if (totalPlacements > 0 && correctPlacements > 0) {
      const efficiency = correctPlacements / totalPlacements;
      score += Math.round(efficiency * 10); // Small bonus
    }
  }
  
  // Cap at 200 points maximum
  return Math.min(200, Math.max(0, score));
};

// Check objectives with round support
export const checkObjectives = (playerGrid, targetGrid, difficulty, negativeZones, currentRound) => {
  const settings = difficultySettings[difficulty];
  const completed = [];
  
  // Count correct placements
  let correctPlacements = 0;
  let totalTargets = 0;
  let negativeZonePlacements = 0;
  
  for (let row = 0; row < playerGrid.length; row++) {
    for (let col = 0; col < playerGrid[row].length; col++) {
      if (targetGrid[row][col] !== 'empty') {
        totalTargets++;
        if (playerGrid[row][col] === targetGrid[row][col]) {
          correctPlacements++;
        }
      }
      
      // Check negative zone placements
      if (negativeZones.some(zone => zone.row === row && zone.col === col)) {
        if (playerGrid[row][col] !== 'empty' && buildingTypes[playerGrid[row][col]]?.positive) {
          negativeZonePlacements++;
        }
      }
    }
  }
  
  const accuracy = totalTargets > 0 ? (correctPlacements / totalTargets) * 100 : 0;
  
  // Check both rounds of objectives
  const allObjectives = [...settings.objectives.round1, ...settings.objectives.round2];
  
  allObjectives.forEach((objective, index) => {
    let isComplete = false;
    
    switch (objective.type) {
      case 'placeBuilding':
        // Check if specific building is placed correctly
        for (let row = 0; row < playerGrid.length; row++) {
          for (let col = 0; col < playerGrid[row].length; col++) {
            if (targetGrid[row][col] === objective.value && 
                playerGrid[row][col] === objective.value) {
              isComplete = true;
              break;
            }
          }
          if (isComplete) break;
        }
        break;
        
      case 'avoidNegative':
        isComplete = negativeZonePlacements <= (2 - objective.value); // Reverse logic
        break;
        
      case 'accuracy':
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

// Check grid accuracy
export const checkGridAccuracy = (playerGrid, targetGrid) => {
  let correct = 0;
  let total = 0;
  
  for (let row = 0; row < playerGrid.length; row++) {
    for (let col = 0; col < playerGrid[row].length; col++) {
      if (targetGrid[row][col] !== 'empty') {
        total++;
        if (playerGrid[row][col] === targetGrid[row][col]) {
          correct++;
        }
      }
    }
  }
  
  return { correct, total, accuracy: total > 0 ? (correct / total) * 100 : 0 };
};

// Get hint based on current state
export const getHint = (playerGrid, targetGrid, difficulty, completedObjectives, currentRound) => {
  const settings = difficultySettings[difficulty];
  
  // Get current round objectives
  const currentObjectives = currentRound === 1 ? 
    settings.objectives.round1 : 
    settings.objectives.round2;
  
  // Find incomplete objectives
  const round1Length = settings.objectives.round1.length;
  const incompleteObjectives = currentObjectives.filter((_, index) => {
    const globalIndex = currentRound === 1 ? index : round1Length + index;
    return !completedObjectives.includes(globalIndex);
  });
  
  if (incompleteObjectives.length > 0) {
    const objective = incompleteObjectives[0];
    
    if (objective.type === 'placeBuilding') {
      // Find the correct position for this building
      for (let row = 0; row < targetGrid.length; row++) {
        for (let col = 0; col < targetGrid[row].length; col++) {
          if (targetGrid[row][col] === objective.value) {
            return `💡 Place the ${buildingTypes[objective.value].name} at row ${row + 1}, column ${col + 1}`;
          }
        }
      }
    } else if (objective.type === 'avoidNegative') {
      return "⚠️ Avoid placing positive buildings on negative zones (trash/factory areas)";
    } else if (objective.type === 'accuracy') {
      return `🎯 You need ${objective.value}% accuracy. Double-check your building placements!`;
    }
  }
  
  // General hints
  const hints = [
    "🧠 Study the layout carefully during the study phase",
    "📍 Each building has a specific correct position",
    "⭐ Complete objectives in order for maximum points",
    "🎯 Accuracy is key - take your time to place correctly"
  ];
  
  return hints[Math.floor(Math.random() * hints.length)];
};

// Calculate accuracy percentage
export const calculateAccuracy = (playerGrid, targetGrid) => {
  const { accuracy } = checkGridAccuracy(playerGrid, targetGrid);
  return Math.round(accuracy);
};