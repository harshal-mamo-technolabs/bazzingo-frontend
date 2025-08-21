// Difficulty settings for Dalmatian Maze Run
export const difficultySettings = {
  Easy: { 
    timeLimit: 90, 
    lives: 3, 
    hints: 2, 
    gridSize: 4, 
    relics: 2, 
    traps: 1, 
    vanishingWalls: 2,
    riddles: 1,
    pointsPerRelic: 15,
    mapPenalty: 5,
    trapPenalty: 10,
    riddleBonus: 10
  },
  Moderate: { 
    timeLimit: 75, 
    lives: 3, 
    hints: 2, 
    gridSize: 5, 
    relics: 3, 
    traps: 2, 
    vanishingWalls: 3,
    riddles: 1,
    pointsPerRelic: 15,
    mapPenalty: 5,
    trapPenalty: 10,
    riddleBonus: 10
  },
  Hard: { 
    timeLimit: 60, 
    lives: 2, 
    hints: 1, 
    gridSize: 5, 
    relics: 3, 
    traps: 3, 
    vanishingWalls: 4,
    riddles: 2,
    pointsPerRelic: 15,
    mapPenalty: 5,
    trapPenalty: 10,
    riddleBonus: 10
  }
};

// Riddles for gate puzzles
export const riddleQuestions = [
  {
    id: 1,
    question: "I have streets but no cars, walls but no roof, and I'm surrounded by the Adriatic. What am I?",
    options: ["Dubrovnik", "Split", "Zadar", "Pula"],
    correct: 0,
    explanation: "Dubrovnik's Old City has ancient streets and walls but is open to the sky, surrounded by the Adriatic Sea."
  },
  {
    id: 2,
    question: "Which Croatian emperor built a palace that became a city?",
    options: ["Diocletian", "Constantine", "Augustus", "Trajan"],
    correct: 0,
    explanation: "Emperor Diocletian built his retirement palace in what is now Split, which grew into the modern city."
  },
  {
    id: 3,
    question: "I'm white stone from Brač island, used in famous buildings worldwide. What am I?",
    options: ["Marble", "Limestone", "Granite", "Sandstone"],
    correct: 1,
    explanation: "Brač limestone was used in Diocletian's Palace and even the White House in Washington D.C."
  },
  {
    id: 4,
    question: "How many gates lead into Dubrovnik's Old City?",
    options: ["2", "3", "4", "5"],
    correct: 1,
    explanation: "Dubrovnik has three main gates: Pile Gate (west), Ploče Gate (east), and Buža Gate (north)."
  },
  {
    id: 5,
    question: "What connects Dubrovnik's mainland to the walls?",
    options: ["Bridge", "Tunnel", "Ferry", "Cable car"],
    correct: 0,
    explanation: "A stone bridge connects the mainland to Dubrovnik's fortified Old City walls."
  }
];

// Generate maze layout based on difficulty
export const generateMazeLayout = (difficulty) => {
  const settings = difficultySettings[difficulty];
  const size = settings.gridSize;
  const maze = Array(size).fill(null).map(() => Array(size).fill('empty'));
  
  // Set player start position (always top-left)
  maze[0][0] = 'player';
  
  // Set exit position (always bottom-right)
  maze[size-1][size-1] = 'exit';
  
  // Add walls strategically
  const wallPositions = [];
  if (size === 4) {
    // 4x4 Easy layout
    wallPositions.push([1,1], [1,2], [2,2], [0,3], [3,0], [3,1]);
  } else {
    // 5x5 Moderate/Hard layout  
    wallPositions.push([1,1], [1,3], [2,1], [2,3], [3,1], [3,2], [0,4], [4,0], [1,4], [4,1]);
  }
  
  wallPositions.forEach(([row, col]) => {
    if (row < size && col < size && maze[row][col] === 'empty') {
      maze[row][col] = 'wall';
    }
  });
  
  // Designate some walls as vanishing
  const vanishingCount = Math.min(settings.vanishingWalls, wallPositions.length);
  const vanishingWalls = [];
  for (let i = 0; i < vanishingCount; i++) {
    vanishingWalls.push(wallPositions[i]);
  }
  
  // Add relics
  const availableSpots = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (maze[row][col] === 'empty') {
        availableSpots.push([row, col]);
      }
    }
  }
  
  // Shuffle and place relics
  const shuffled = [...availableSpots].sort(() => Math.random() - 0.5);
  const relicTypes = ['necklace', 'scroll', 'artifact'];
  
  for (let i = 0; i < Math.min(settings.relics, shuffled.length); i++) {
    const [row, col] = shuffled[i];
    maze[row][col] = relicTypes[i % relicTypes.length];
  }
  
  // Add traps
  const remainingSpots = shuffled.slice(settings.relics);
  for (let i = 0; i < Math.min(settings.traps, remainingSpots.length); i++) {
    const [row, col] = remainingSpots[i];
    maze[row][col] = 'trap';
  }
  
  // Add riddle gates
  if (remainingSpots.length > settings.traps) {
    const gateSpots = remainingSpots.slice(settings.traps);
    for (let i = 0; i < Math.min(settings.riddles, gateSpots.length); i++) {
      const [row, col] = gateSpots[i];
      maze[row][col] = 'gate';
    }
  }
  
  return {
    maze,
    vanishingWalls,
    size
  };
};

// Calculate final score with tier
export const calculateFinalScore = (difficulty, relicsCollected, trapsHit, mapHintsUsed, riddlesSolvedWithoutHint) => {
  const settings = difficultySettings[difficulty];
  
  let score = 0;
  score += relicsCollected * settings.pointsPerRelic;
  score -= trapsHit * settings.trapPenalty;
  score -= mapHintsUsed * settings.mapPenalty;
  score += riddlesSolvedWithoutHint * settings.riddleBonus;
  
  // Ensure score is non-negative
  score = Math.max(0, score);
  
  // Determine tier
  let tier = "Trapped in Time";
  if (score >= 150) tier = "Maze Master";
  else if (score >= 100) tier = "Coastal Navigator";
  else if (score >= 50) tier = "Lost Tourist";
  
  return { score, tier };
};

// Get random riddle
export const getRandomRiddle = () => {
  return riddleQuestions[Math.floor(Math.random() * riddleQuestions.length)];
};