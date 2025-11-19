// Difficulty settings
export const difficultySettings = {
  Easy: { timeLimit: 300, lives: 5, hints: 3, pairCount: 8, pointsPerMatch: 25, penaltyPerMismatch: 10, previewTime: 5000 },
  Moderate: { timeLimit: 240, lives: 4, hints: 2, pairCount: 5, pointsPerMatch: 40, penaltyPerMismatch: 20, previewTime: 4000 },
  Hard: { timeLimit: 180, lives: 3, hints: 1, pairCount: 4, pointsPerMatch: 50, penaltyPerMismatch: 25, previewTime: 3000 }
};

// Carnival mask types with emojis
// Note: Mask names will be translated in the component using TranslatedText
export const maskTypes = [
  { id: 'venetian', emoji: '🎭', name: 'Venetian', color: 'purple' },
  { id: 'comedy', emoji: '😄', name: 'Comedy', color: 'yellow' },
  { id: 'tragedy', emoji: '😢', name: 'Tragedy', color: 'blue' },
  { id: 'devil', emoji: '😈', name: 'Devil', color: 'red' },
  { id: 'angel', emoji: '😇', name: 'Angel', color: 'white' },
  { id: 'clown', emoji: '🤡', name: 'Clown', color: 'rainbow' },
  { id: 'skull', emoji: '💀', name: 'Skull', color: 'black' },
  { id: 'cat', emoji: '🐱', name: 'Cat', color: 'orange' },
  { id: 'fox', emoji: '🦊', name: 'Fox', color: 'brown' },
  { id: 'wolf', emoji: '🐺', name: 'Wolf', color: 'gray' },
  { id: 'lion', emoji: '🦁', name: 'Lion', color: 'gold' },
  { id: 'tiger', emoji: '🐯', name: 'Tiger', color: 'orange' },
  { id: 'panda', emoji: '🐼', name: 'Panda', color: 'black' },
  { id: 'monkey', emoji: '🐵', name: 'Monkey', color: 'brown' },
  { id: 'robot', emoji: '🤖', name: 'Robot', color: 'silver' },
  { id: 'alien', emoji: '👽', name: 'Alien', color: 'green' }
];

// Generate mask pairs for the game
export const generateMaskPairs = (difficulty) => {
  const settings = difficultySettings[difficulty];
  const pairCount = settings.pairCount;
  
  // Shuffle available masks and take the required number
  const shuffledMasks = [...maskTypes].sort(() => Math.random() - 0.5);
  const selectedMasks = shuffledMasks.slice(0, pairCount);
  
  // Create pairs
  const pairs = [];
  selectedMasks.forEach((mask, index) => {
    // First card of the pair
    pairs.push({
      id: `${mask.id}_1`,
      maskId: mask.id,
      emoji: mask.emoji,
      name: mask.name,
      color: mask.color,
      pairIndex: index,
      isFlipped: false,
      isMatched: false,
      isSpecial: false
    });
    
    // Second card of the pair
    pairs.push({
      id: `${mask.id}_2`,
      maskId: mask.id,
      emoji: mask.emoji,
      name: mask.name,
      color: mask.color,
      pairIndex: index,
      isFlipped: false,
      isMatched: false,
      isSpecial: false
    });
  });
  
  // Shuffle the pairs
  return pairs.sort(() => Math.random() - 0.5);
};

// Generate special mask scenarios for Hard mode
export const generateSpecialMasks = (difficulty) => {
  if (difficulty !== 'Hard') return [];
  
  const settings = difficultySettings[difficulty];
  const specialCount = settings.pairCount;
  
  // Select random masks as special masks
  const shuffledMasks = [...maskTypes].sort(() => Math.random() - 0.5);
  const selectedMasks = shuffledMasks.slice(0, specialCount);
  
  const specialMasks = selectedMasks.map((mask, index) => ({
    id: `special_${mask.id}`,
    maskId: mask.id,
    emoji: mask.emoji,
    name: mask.name,
    color: mask.color,
    position: Math.floor(Math.random() * 16), // Random position in 4x4 grid
    isSpecial: true,
    isFound: false
  }));
  
  return specialMasks;
};

// Create game board layout
export const createGameBoard = (masks, difficulty) => {
  const boardSize = difficulty === 'Easy' ? 16 : difficulty === 'Moderate' ? 10 : 16;
  const board = Array(boardSize).fill(null);
  
  // Place masks on the board
  masks.forEach((mask, index) => {
    if (index < boardSize) {
      board[index] = mask;
    }
  });
  
  return board;
};

// Check if two cards match
export const checkMatch = (card1, card2) => {
  return card1.maskId === card2.maskId && card1.id !== card2.id;
};

// Calculate score
export const calculateScore = (difficulty, correctMatches, incorrectMatches) => {
  const settings = difficultySettings[difficulty];
  const positiveScore = correctMatches * settings.pointsPerMatch;
  const penalty = incorrectMatches * settings.penaltyPerMismatch;
  return Math.max(0, Math.min(200, positiveScore - penalty));
};

// Get game scenarios based on difficulty
export const getGameScenario = (difficulty) => {
  const settings = difficultySettings[difficulty];
  
  if (difficulty === 'Hard') {
    // Special mask recall mode
    const specialMasks = generateSpecialMasks(difficulty);
    const allMasks = [...maskTypes].sort(() => Math.random() - 0.5).slice(0, 16);
    
    // Place special masks at their designated positions
    specialMasks.forEach(specialMask => {
      allMasks[specialMask.position] = specialMask;
    });
    
    return {
      type: 'special',
      masks: allMasks,
      specialMasks: specialMasks,
      settings
    };
  } else {
    // Regular pair matching mode
    const maskPairs = generateMaskPairs(difficulty);
    const board = createGameBoard(maskPairs, difficulty);
    
    return {
      type: 'pairs',
      masks: board.filter(mask => mask !== null),
      board,
      settings
    };
  }
};

// Shuffle array utility
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Get hint for the player
// Note: These hint messages will be translated in the component
// The component should use TranslatedText to wrap these messages
export const getHint = (masks, flippedCards, difficulty) => {
  if (difficulty === 'Hard') {
    // Hint for special mask mode
    const unFoundSpecialMasks = masks.filter(mask => mask.isSpecial && !mask.isFound);
    if (unFoundSpecialMasks.length > 0) {
      const hintMask = unFoundSpecialMasks[0];
      return `Look for the ${hintMask.name} mask - it's one of the special masks you need to remember!`;
    }
  } else {
    // Hint for pair matching mode
    const unMatchedMasks = masks.filter(mask => !mask.isMatched && !flippedCards.includes(mask.id));
    if (unMatchedMasks.length > 0) {
      const hintMask = unMatchedMasks[0];
      return `Try to find the matching pair for the ${hintMask.name} mask!`;
    }
  }
  
  return "Keep looking for matches! Focus on the masks you've already seen.";
};