import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Key, Lightbulb, CheckCircle, XCircle, Lock, Unlock, RotateCw, ChevronUp, ChevronDown } from 'lucide-react';

const CodeBreakingCipherGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [solvedCiphers, setSolvedCiphers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [cipherStartTime, setCipherStartTime] = useState(0);

  // Game state
  const [currentCipher, setCurrentCipher] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [cipherType, setCipherType] = useState('caesar');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showCipherInstructions, setShowCipherInstructions] = useState(true);

  // Cipher messages by difficulty
  const cipherMessages = {
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
  const caesarCipher = (text, shift) => {
    return text.split('').map(char => {
      if (char.match(/[A-Z]/)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
      }
      return char;
    }).join('');
  };

  // Substitution cipher implementation
  const substitutionCipher = (text, key) => {
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
  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', ' ': '/'
  };

  const textToMorse = (text) => {
    return text.split('').map(char => morseCode[char] || char).join(' ');
  };

  // Binary implementation
  const textToBinary = (text) => {
    return text.split('').map(char => {
      if (char === ' ') return '00100000';
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };

  // Generate random substitution key
  const generateSubstitutionKey = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shuffled = alphabet.split('').sort(() => Math.random() - 0.5);
    return shuffled.join('');
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 120, lives: 5, hints: 3, cipherTypes: ['caesar'] },
    Moderate: { timeLimit: 100, lives: 4, hints: 2, cipherTypes: ['caesar', 'substitution', 'morse'] },
    Hard: { timeLimit: 80, lives: 3, hints: 1, cipherTypes: ['caesar', 'substitution', 'morse', 'binary'] }
  };

  // Generate new cipher
  const generateNewCipher = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const availableTypes = settings.cipherTypes;
    const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    setCipherType(selectedType);

    // Get message based on difficulty
    const difficultyLevel = difficulty.toLowerCase();
    const messages = cipherMessages[difficultyLevel];
    const originalMessage = messages[Math.floor(Math.random() * messages.length)];

    let encryptedMessage = '';
    let hint = '';
    let key = null;

    switch (selectedType) {
      case 'caesar':
        key = Math.floor(Math.random() * 25) + 1; // 1-25 shift
        encryptedMessage = caesarCipher(originalMessage, key);
        hint = `Caesar cipher with shift of ${key}. Each letter is shifted ${key} positions in the alphabet.`;
        break;

      case 'substitution':
        key = generateSubstitutionKey();
        encryptedMessage = substitutionCipher(originalMessage, key);
        hint = `Substitution cipher. Each letter is replaced with another letter consistently.`;
        break;

      case 'morse':
        encryptedMessage = textToMorse(originalMessage);
        hint = `Morse code. Dots (.) and dashes (-) represent letters. / represents space.`;
        break;

      case 'binary':
        encryptedMessage = textToBinary(originalMessage);
        hint = `Binary code. Each 8-bit sequence represents one character.`;
        break;

      default:
        key = 3;
        encryptedMessage = caesarCipher(originalMessage, key);
        hint = `Caesar cipher with shift of 3.`;
    }

    setCurrentCipher({
      original: originalMessage,
      encrypted: encryptedMessage,
      type: selectedType,
      key: key,
      hint: hint
    });

    setUserInput('');
    setShowFeedback(false);
    setShowHint(false);
    setCipherStartTime(Date.now());
  }, [difficulty]);

  // Calculate score
  const calculateScore = useCallback(() => {
    if (totalAttempts === 0 || solvedCiphers === 0) return 0;

    const settings = difficultySettings[difficulty];
    const successRate = solvedCiphers / totalAttempts;
    const avgResponseTime = totalResponseTime / totalAttempts / 1000;

    // Base score from success rate (0-85 points)
    let baseScore = successRate * 85;

    // Time bonus (max 25 points)
    const idealTime = difficulty === 'Easy' ? 25 : difficulty === 'Moderate' ? 35 : 45;
    const timeBonus = Math.max(0, Math.min(25, (idealTime - avgResponseTime) * 1.2));

    // Streak bonus (max 30 points)
    const streakBonus = Math.min(maxStreak * 2.8, 30);

    // Level progression bonus (max 20 points)
    const levelBonus = Math.min(currentLevel * 1.1, 20);

    // Lives bonus (max 15 points)
    const livesBonus = (lives / settings.lives) * 15;

    // Hints penalty (subtract up to 15 points)
    const hintsPenalty = (hintsUsed / settings.hints) * 15;

    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;

    // Time remaining bonus (max 15 points)
    const timeRemainingBonus = Math.min(15, (timeRemaining / settings.timeLimit) * 15);

    let finalScore = (baseScore + timeBonus + streakBonus + levelBonus + livesBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;

    finalScore = finalScore * 0.84;

    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [solvedCiphers, totalAttempts, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty]);


  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle cipher submission
  const handleSubmit = useCallback(() => {
    if (gameState !== 'playing' || showFeedback || !currentCipher) return;

    if (!userInput.trim()) {
      return;
    }

    const responseTime = Date.now() - cipherStartTime;
    const userAnswer = userInput.toUpperCase().trim();
    const correctAnswer = currentCipher.original;

    setShowFeedback(true);
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    if (userAnswer === correctAnswer) {
      setFeedbackType('correct');
      setSolvedCiphers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setCurrentLevel(prev => prev + 1);

      setTimeout(() => {
        generateNewCipher();
      }, 2000);
    } else {
      setFeedbackType('incorrect');
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('finished');
          setShowCompletionModal(true);
        }
        return Math.max(0, newLives);
      });

      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }
  }, [gameState, showFeedback, currentCipher, userInput, cipherStartTime, generateNewCipher]);


  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentCipher) return;

    setHintsUsed(prev => prev + 1);
    setHintMessage(currentCipher.hint);
    setShowHint(true);

    setTimeout(() => {
      setShowHint(false);
    }, 5000);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentLevel(1);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setSolvedCiphers(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    generateNewCipher();
  };

  const handleReset = () => {
    initializeGame();
    setCurrentCipher(null);
    setUserInput('');
    setShowFeedback(false);
    setShowHint(false);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    lives,
    hintsUsed,
    solvedCiphers,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    cipherType
  };

  const getCipherTypeDescription = (type) => {
    switch (type) {
      case 'caesar': return 'Caesar Cipher - Letters shifted by a fixed number';
      case 'substitution': return 'Substitution Cipher - Each letter replaced with another';
      case 'morse': return 'Morse Code - Dots and dashes represent letters';
      case 'binary': return 'Binary Code - 8-bit sequences represent characters';
      default: return 'Unknown cipher type';
    }
  };

  const getCipherIcon = (type) => {
    switch (type) {
      case 'caesar': return <RotateCw className="h-5 w-5" />;
      case 'substitution': return <Key className="h-5 w-5" />;
      case 'morse': return <Lock className="h-5 w-5" />;
      case 'binary': return <Unlock className="h-5 w-5" />;
      default: return <Key className="h-5 w-5" />;
    }
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Code Breaking Cipher"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
  <div className="bg-[#E8E8E8] rounded-lg p-6">
    {/* Header with toggle */}
    <div
      className="flex items-center justify-between mb-4 cursor-pointer"
      onClick={() => setShowCipherInstructions(!showCipherInstructions)}
    >
      <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
        How to Play Code Breaking Cipher
      </h3>
      <span className="text-blue-900 text-xl">
        {showCipherInstructions
  ? <ChevronUp className="h-5 w-5 text-blue-900" />
  : <ChevronDown className="h-5 w-5 text-blue-900" />}
      </span>
    </div>

    {/* Toggle Content */}
    {showCipherInstructions && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            🎯 Objective
          </h4>
          <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            Decode encrypted messages using logical deduction and pattern recognition skills.
          </p>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            🔐 Cipher Types
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• <strong>Caesar:</strong> Letter shifting</li>
            <li>• <strong>Substitution:</strong> Letter replacement</li>
            <li>• <strong>Morse:</strong> Dots and dashes</li>
            <li>• <strong>Binary:</strong> 8-bit sequences</li>
          </ul>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            📊 Scoring
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• Decoding accuracy matters</li>
            <li>• Speed bonuses for quick solving</li>
            <li>• Streak multipliers</li>
          </ul>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            💡 Strategy
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• Look for patterns</li>
            <li>• Use frequency analysis</li>
            <li>• Save hints for tough codes</li>
          </ul>
        </div>
      </div>
      
    )}
  </div>
          </div>

        }
        category="Logic"
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        {/* Game Content */}
        <div className="flex flex-col items-center">
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {gameState === 'playing' && (
              <button
                onClick={useHint}
                disabled={hintsUsed >= maxHints}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
              >
                <Lightbulb className="h-4 w-4" />
                Hint ({maxHints - hintsUsed})
              </button>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Lives
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'❤️'.repeat(lives)}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streak}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Success Rate
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalAttempts > 0 ? Math.round((solvedCiphers / totalAttempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Cipher Type Info */}
          {currentCipher && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getCipherIcon(cipherType)}
                  <span className="font-semibold text-blue-800 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {cipherType} Cipher
                  </span>
                </div>

                {cipherType === 'caesar' && (
                  <p className="text-blue-900 text-sm font-semibold">
                    Shift&nbsp;=&nbsp;{currentCipher.key}
                  </p>
                )}


                <p className="text-blue-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {getCipherTypeDescription(cipherType)}
                </p>
              </div>
            </div>
          )}

          {/* Encrypted Message Display */}
          {currentCipher && (
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Decode this message:
              </h3>
              <div className="bg-gray-100 rounded-lg p-6 inline-block max-w-4xl">
                <div className="text-xl font-mono text-gray-900 break-all" style={{ lineHeight: '1.6' }}>
                  {currentCipher.encrypted}
                </div>
              </div>
            </div>
          )}

          {/* Hint Display */}
          {showHint && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hint:
                  </span>
                </div>
                <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {hintMessage}
                </p>
              </div>
            </div>
          )}

          {/* Input Section */}
          {currentCipher && !showFeedback && (
            <div className="w-full max-w-md mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter decoded message"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B3E] focus:border-transparent"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${userInput.trim()
                      ? 'bg-[#FF6B3E] text-white hover:bg-[#e55a35]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <Key className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentCipher && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg ${feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Code Broken!' : 'Incorrect!'}
                </div>
              </div>
              <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackType === 'correct'
                  ? `Excellent! The decoded message was "${currentCipher.original}".`
                  : `You entered "${userInput}".`
                }
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Analyze the encrypted message and use logical deduction to decode it.
              Look for patterns, letter frequencies, and use hints when stuck.
              Press Enter or click the key button to submit your answer.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints
            </div>
          </div>
        </div>
      </GameFramework>
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
      />
    </div>
  );
};

export default CodeBreakingCipherGame;