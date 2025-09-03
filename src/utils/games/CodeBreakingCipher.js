  // Cipher messages by difficulty
export const cipherMessages = {
    easy: [
      'HELLO WORLD',
      'GOOD LUCK',
      'WELL DONE',
      'NICE WORK',
      'GREAT JOB',
      'KEEP GOING',
      'ALMOST THERE',
      'SUCCESS'
    ],
    moderate: [
      'BREAK THE CODE',
      'CIPHER MASTER',
      'LOGIC PUZZLE',
      'DECODE THIS MESSAGE',
      'CRYPTOGRAPHY RULES',
      'PATTERN RECOGNITION',
      'ANALYTICAL THINKING',
      'PROBLEM SOLVING'
    ],
    hard: [
      'ADVANCED CRYPTANALYSIS TECHNIQUES',
      'FREQUENCY ANALYSIS REQUIRED',
      'MULTIPLE CIPHER LAYERS',
      'COMPLEX SUBSTITUTION PATTERNS',
      'HISTORICAL ENCRYPTION METHODS',
      'MATHEMATICAL CIPHER ALGORITHMS',
      'STEGANOGRAPHY AND CODES',
      'INTELLIGENCE GATHERING SKILLS'
    ]
  };

  // Caesar cipher implementation
export const caesarCipher = (text, shift) => {
    return text.split('').map(char => {
      if (char.match(/[A-Z]/)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
      }
      return char;
    }).join('');
  };

  // Substitution cipher implementation
export const substitutionCipher = (text, key) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return text.split('').map(char => {
      if (char.match(/[A-Z]/)) {
        const index = alphabet.indexOf(char);
        return key[index] || char;
      }
      return char;
    }).join('');
  };

  // Morse code implementation
export const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', ' ': '/'
  };

export const textToMorse = (text) => {
    return text.split('').map(char => morseCode[char] || char).join(' ');
  };

  // Binary implementation
export const textToBinary = (text) => {
    return text.split('').map(char => {
      if (char === ' ') return '00100000';
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };

  // Generate random substitution key
export const generateSubstitutionKey = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shuffled = alphabet.split('').sort(() => Math.random() - 0.5);
    return shuffled.join('');
  };

  // Difficulty settings
export const difficultySettings = {
    Easy: { timeLimit: 120, lives: 5, hints: 3, cipherTypes: ['caesar'] },
    Moderate: { timeLimit: 100, lives: 4, hints: 2, cipherTypes: ['caesar', 'substitution', 'morse'] },
    Hard: { timeLimit: 80, lives: 3, hints: 1, cipherTypes: ['caesar', 'substitution', 'morse', 'binary'] }
  };

export const getCipherTypeDescription = (type) => {
    switch (type) {
      case 'caesar': return 'Caesar Cipher - Letters shifted by a fixed number';
      case 'substitution': return 'Substitution Cipher - Each letter replaced with another';
      case 'morse': return 'Morse Code - Dots and dashes represent letters';
      case 'binary': return 'Binary Code - 8-bit sequences represent characters';
      default: return 'Unknown cipher type';
    }
  };