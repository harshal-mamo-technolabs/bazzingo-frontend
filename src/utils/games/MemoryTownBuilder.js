// Professional Memory Town Builder - Fixed scoring system with correct point values and round progression
export const difficultySettings = {
  Easy: {
    timeLimit: 300, // 5 minutes
    maxTurns: 10,
    pointsPerPlacement: 25, // 25 points per correct placement
    pointsPerObjective: 0,
    hints: 4,
    gridSize: 4,
    studyTime: 10,
    targetCount: 8, // 8 total buildings for 200 max (25 x 8 = 200)
    targetFrequency: 1,
    objectives: {
      round1: [
        { type: 'placeBuilding', value: 'library', text: "Place the Library correctly" },
        { type: 'placeBuilding', value: 'park', text: "Place the Park correctly" },
        { type: 'placeBuilding', value: 'school', text: "Place the School correctly" },
        { type: 'placeBuilding', value: 'hospital', text: "Place the Hospital correctly" },
        { type: 'placeBuilding', value: 'store', text: "Place the Store correctly" }
      ],
      round2: [
        { type: 'placeBuilding', value: 'house', text: "Place the House correctly" },
        { type: 'placeBuilding', value: 'library', text: "Place the second Library correctly" },
        { type: 'placeBuilding', value: 'park', text: "Place the second Park correctly" }
      ]
    }
  },
  Moderate: {
    timeLimit: 240, // 4 minutes
    maxTurns: 7,
    pointsPerPlacement: 40, // 40 points per correct placement
    pointsPerObjective: 0,
    hints: 3,
    gridSize: 5,
    studyTime: 12,
    targetCount: 5, // 5 total buildings for 200 max (40 x 5 = 200)
    targetFrequency: 1,
    objectives: {
      round1: [
        { type: 'placeBuilding', value: 'library', text: "Place the Library correctly" },
        { type: 'placeBuilding', value: 'park', text: "Place the Park correctly" },
        { type: 'placeBuilding', value: 'school', text: "Place the School correctly" }
      ],
      round2: [
        { type: 'placeBuilding', value: 'hospital', text: "Place the Hospital correctly" },
        { type: 'placeBuilding', value: 'store', text: "Place the Store correctly" }
      ]
    }
  },
  Hard: {
    timeLimit: 180, // 3 minutes
    maxTurns: 6,
    pointsPerPlacement: 50, // 50 points per correct placement
    pointsPerObjective: 0,
    hints: 2,
    gridSize: 6,
    studyTime: 15,
    targetCount: 4, // 4 total buildings for 200 max (50 x 4 = 200)
    targetFrequency: 1,
    objectives: {
      round1: [
        { type: 'placeBuilding', value: 'library', text: "Place the Library correctly" },
        { type: 'placeBuilding', value: 'hospital', text: "Place the Hospital correctly" },
        { type: 'placeBuilding', value: 'school', text: "Place the School correctly" },
        { type: 'placeBuilding', value: 'park', text: "Place the Park correctly" }
      ],
      round2: [
        // Hard mode has all buildings in round 1, round 2 is just for completion
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

// Predefined layouts for each difficulty with exact building counts
export const generatePredefinedLayout = (difficulty) => {
  const settings = difficultySettings[difficulty];
  const gridSize = settings.gridSize;

  // Create empty grid
  const targetGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('empty'));
  const negativeZones = [];

  if (difficulty === 'Easy') {
    // 4x4 grid - exactly 8 buildings for 25x8=200 max points
    const positions = [
      { building: 'library', row: 0, col: 1 },
      { building: 'park', row: 1, col: 2 },
      { building: 'school', row: 2, col: 0 },
      { building: 'hospital', row: 3, col: 3 },
      { building: 'store', row: 1, col: 0 },
      { building: 'house', row: 0, col: 3 },
      { building: 'library', row: 3, col: 0 },
      { building: 'park', row: 2, col: 2 }
    ];

    // Place exactly 8 buildings
    positions.forEach(pos => {
      targetGrid[pos.row][pos.col] = pos.building;
    });

    return {
      targetGrid,
      negativeZones: [],
      description: "Study the town layout and recreate it perfectly. 8 buildings to place across 2 rounds!",
      phase: 'study'
    };
  }

  if (difficulty === 'Moderate') {
    // 5x5 grid - exactly 5 buildings for 40x5=200 max points
    const positions = [
      { building: 'library', row: 0, col: 2 },
      { building: 'park', row: 1, col: 0 },
      { building: 'school', row: 1, col: 4 },
      { building: 'hospital', row: 2, col: 2 },
      { building: 'store', row: 3, col: 1 }
    ];

    // Place exactly 5 buildings
    positions.forEach(pos => {
      targetGrid[pos.row][pos.col] = pos.building;
    });

    return {
      targetGrid,
      negativeZones: [],
      description: "Memorize this complex town layout. 5 buildings across 2 rounds!",
      phase: 'study'
    };
  }

  if (difficulty === 'Hard') {
    // 6x6 grid - exactly 4 buildings for 50x4=200 max points
    const positions = [
      { building: 'library', row: 1, col: 1 },
      { building: 'hospital', row: 2, col: 4 },
      { building: 'school', row: 4, col: 2 },
      { building: 'park', row: 0, col: 3 }
    ];

    // Place exactly 4 buildings
    positions.forEach(pos => {
      targetGrid[pos.row][pos.col] = pos.building;
    });

    return {
      targetGrid,
      negativeZones: [],
      description: "Master-level challenge! Perfect placement required for all 4 buildings in round 1!",
      phase: 'study'
    };
  }

  return { targetGrid, negativeZones: [], description: "", phase: 'study' };
};

// Fixed scoring system - points per correct placement only
export const calculateScore = (difficulty, correctPlacements) => {
  const settings = difficultySettings[difficulty];
  
  // Simple calculation: correct placements × points per placement
  const score = correctPlacements * settings.pointsPerPlacement;
  
  // Cap at 200 points maximum
  return Math.min(200, Math.max(0, score));
};

// Check objectives with proper round support
export const checkObjectives = (playerGrid, targetGrid, difficulty, negativeZones, currentRound) => {
  const settings = difficultySettings[difficulty];
  const completed = [];

  // Count correct placements by building type
  const correctBuildings = {};
  
  for (let row = 0; row < playerGrid.length; row++) {
    for (let col = 0; col < playerGrid[row].length; col++) {
      if (targetGrid[row][col] !== 'empty' && playerGrid[row][col] === targetGrid[row][col]) {
        const building = targetGrid[row][col];
        correctBuildings[building] = (correctBuildings[building] || 0) + 1;
      }
    }
  }

  // Check both rounds of objectives
  const allObjectives = [...settings.objectives.round1, ...settings.objectives.round2];
  
  allObjectives.forEach((objective, index) => {
    let isComplete = false;

    switch (objective.type) {
      case 'placeBuilding':
        // Check if this specific building instance is placed correctly
        let foundInstances = 0;
        let requiredInstances = 0;
        
        // Count required instances in target grid
        for (let row = 0; row < targetGrid.length; row++) {
          for (let col = 0; col < targetGrid[row].length; col++) {
            if (targetGrid[row][col] === objective.value) {
              requiredInstances++;
              if (playerGrid[row][col] === objective.value) {
                foundInstances++;
              }
            }
          }
        }
        
        // For this specific objective, we need at least one correct placement
        isComplete = foundInstances > 0;
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