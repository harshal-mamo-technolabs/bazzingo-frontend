// Difficulty settings for Adriatic Codebreaker
export const difficultySettings = {
  Easy: { 
    island: 'Pag',
    timeLimit: 300, 
    puzzlesPerIsland: 3, 
    pointsWithoutHint: 20,
    pointsWithHint: 10,
    wrongAttemptPenalty: 10,
    description: 'The salt-making island with ancient traditions'
  },
  Moderate: { 
    island: 'Hvar',
    timeLimit: 240, 
    puzzlesPerIsland: 3, 
    pointsWithoutHint: 20,
    pointsWithHint: 10,
    wrongAttemptPenalty: 10,
    description: 'The lavender island of noble heritage'
  },
  Hard: { 
    island: 'Brač',
    timeLimit: 180, 
    puzzlesPerIsland: 3, 
    pointsWithoutHint: 20,
    pointsWithHint: 10,
    wrongAttemptPenalty: 10,
    description: 'The white stone island of ancient quarries'
  }
};

// Caesar cipher utility functions
export const caesarEncode = (text, shift) => {
  return text.toUpperCase().replace(/[A-Z]/g, char => {
    return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
  });
};

export const caesarDecode = (text, shift) => {
  return caesarEncode(text, 26 - shift);
};

// Morse code mapping
export const morseCode = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/'
};

export const morseToText = (morse) => {
  const reverseMorse = Object.fromEntries(Object.entries(morseCode).map(([k, v]) => [v, k]));
  return morse.split(' ').map(code => reverseMorse[code] || '').join('');
};

export const textToMorse = (text) => {
  return text.toUpperCase().split('').map(char => morseCode[char] || '').join(' ');
};

// Symbol mapping for grid puzzles
export const symbolMappings = {
  '⚓': 'A', '🏰': 'B', '🌊': 'C', '🐟': 'D', '🦅': 'E', '🌸': 'F',
  '⛵': 'G', '🏛️': 'H', '🗿': 'I', '🦋': 'J', '🔱': 'K', '🏺': 'L',
  '🌙': 'M', '🐚': 'N', '🌞': 'O', '🏖️': 'P', '👑': 'Q', '🌿': 'R',
  '⭐': 'S', '🌴': 'T', '🏔️': 'U', '🍇': 'V', '🌺': 'W', '⚡': 'X',
  '🦉': 'Y', '🌈': 'Z'
};

// Puzzle data for each island
export const puzzleData = {
  Easy: [
    {
      id: 1,
      type: 'caesar',
      title: 'Salt Merchant\'s Message',
      description: 'A salt merchant from Pag sent this coded message. The shift is 3.',
      encryptedMessage: 'VDOW DUULYHV DW GDZQ',
      correctAnswer: 'SALT ARRIVES AT DAWN',
      hint: 'Each letter is shifted 3 positions forward in the alphabet.',
      shift: 3,
      context: 'Pag island is famous for its salt production since Roman times.'
    },
    {
      id: 2,
      type: 'morse',
      title: 'Lighthouse Signal',
      description: 'The lighthouse keeper is sending a morse code message.',
      encryptedMessage: '... .... .. .--. / .- .... --- -.--',
      correctAnswer: 'SHIP AHOY',
      hint: 'Dots and dashes represent letters. Each group of signals is one letter.',
      context: 'Croatian lighthouses have guided ships safely for centuries.'
    },
    {
      id: 3,
      type: 'symbols',
      title: 'Ancient Harbor Map',
      description: 'Decode the symbols on this ancient harbor map.',
      encryptedMessage: '🏰⚓🌞',
      correctAnswer: 'BAO',
      hint: 'Each symbol represents a letter. Check the symbol legend.',
      context: 'Ancient Croatian harbors used symbolic maps for navigation.'
    }
  ],
  Moderate: [
    {
      id: 4,
      type: 'caesar',
      title: 'Noble\'s Secret',
      description: 'A Hvar nobleman\'s encrypted letter. The shift is 7.',
      encryptedMessage: 'SHYLUALY OLKKLK PU JHZASL',
      correctAnswer: 'LAVENDER HIDDEN IN CASTLE',
      hint: 'The shift is 7 positions. Work backwards through the alphabet.',
      shift: 7,
      context: 'Hvar\'s lavender fields and Renaissance palaces hold many secrets.'
    },
    {
      id: 5,
      type: 'morse',
      title: 'Naval Commander\'s Orders',
      description: 'Urgent morse code from the naval commander.',
      encryptedMessage: '..-. .-.. . . - / .-. . .- -.. -.--',
      correctAnswer: 'FLEET READY',
      hint: 'Listen carefully to the rhythm. Short signals are dots, long ones are dashes.',
      context: 'The Venetian fleet often used Hvar as a strategic naval base.'
    },
    {
      id: 6,
      type: 'symbols',
      title: 'Monastery Manuscript',
      description: 'Symbols from an ancient monastery manuscript.',
      encryptedMessage: '🌸🗿🌸🌸',
      correctAnswer: 'FIFF',
      hint: 'Medieval monks used symbolic writing to preserve knowledge.',
      context: 'Hvar\'s monasteries preserved ancient knowledge through symbolic texts.'
    }
  ],
  Hard: [
    {
      id: 7,
      type: 'caesar',
      title: 'Stonemason\'s Code',
      description: 'Master stonemason\'s encrypted instructions. The shift is 13.',
      encryptedMessage: 'JUVGR FGBAR ERNQL SBE FUVCVAT',
      correctAnswer: 'WHITE STONE READY FOR SHIPING',
      hint: 'This is ROT13 - each letter is shifted exactly 13 positions.',
      shift: 13,
      context: 'Brač\'s white limestone was used to build Diocletian\'s Palace.'
    },
    {
      id: 8,
      type: 'morse',
      title: 'Quarry Master\'s Signal',
      description: 'Complex morse code from the quarry master.',
      encryptedMessage: '--.- ..- .- .-. .-. -.-- / -.-. --- -- .--. .-.. . - .',
      correctAnswer: 'QUARRY COMPLETE',
      hint: 'Break down each morse sequence carefully. Some letters have complex patterns.',
      context: 'Brač quarries have supplied stone for buildings worldwide.'
    },
    {
      id: 9,
      type: 'symbols',
      title: 'Dragon\'s Cave Inscription',
      description: 'Ancient symbols found in the famous Dragon\'s Cave.',
      encryptedMessage: '🐟🌈⚓🌞🌙',
      correctAnswer: 'DZAOM',
      hint: 'The Dragon\'s Cave hermit used these symbols to record his visions.',
      context: 'The Dragon\'s Cave on Brač contains mysterious 15th-century inscriptions.'
    }
  ]
};

// Get puzzles by difficulty
export const getPuzzlesByDifficulty = (difficulty) => {
  return puzzleData[difficulty] || puzzleData.Easy;
};

// Calculate final score and rank
export const calculateFinalScore = (correctAnswers, hintsUsed, wrongAttempts, difficulty) => {
  const settings = difficultySettings[difficulty];
  let score = 0;
  
  // Points for correct answers
  const answersWithoutHint = correctAnswers - hintsUsed;
  score += answersWithoutHint * settings.pointsWithoutHint;
  score += hintsUsed * settings.pointsWithHint;
  
  // Penalty for wrong attempts
  score -= wrongAttempts * settings.wrongAttemptPenalty;
  
  // Ensure score is non-negative and cap at 200
  score = Math.max(0, Math.min(200, score));
  
  // Determine rank
  let rank = 'Bronze';
  if (score >= 180) rank = 'Gold';
  else if (score >= 150) rank = 'Silver';
  
  return { score, rank };
};

// Validate answer
export const validateAnswer = (userAnswer, correctAnswer, puzzleType) => {
  const normalizedUser = userAnswer.toUpperCase().trim();
  const normalizedCorrect = correctAnswer.toUpperCase().trim();
  
  // Allow for minor variations in spacing and punctuation
  const cleanUser = normalizedUser.replace(/[^A-Z0-9]/g, '');
  const cleanCorrect = normalizedCorrect.replace(/[^A-Z0-9]/g, '');
  
  return cleanUser === cleanCorrect;
};

// Get hint for puzzle
export const getHintForPuzzle = (puzzle) => {
  return puzzle.hint;
};

// Decode puzzle based on type
export const decodePuzzle = (puzzle) => {
  switch (puzzle.type) {
    case 'caesar':
      return caesarDecode(puzzle.encryptedMessage, puzzle.shift);
    case 'morse':
      return morseToText(puzzle.encryptedMessage);
    case 'symbols':
      return puzzle.encryptedMessage.split('').map(symbol => symbolMappings[symbol] || '').join('');
    default:
      return puzzle.correctAnswer;
  }
};