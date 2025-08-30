import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import {cipherMessages, caesarCipher, substitutionCipher, textToMorse, textToBinary, generateSubstitutionKey, difficultySettings, getCipherTypeDescription} from "../../utils/games/CodeBreakingCipher";
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
  let maxQuestions = 0;
  let pointsPerCorrect = 0;

  if (difficulty === "Easy") {
    maxQuestions = 8;
    pointsPerCorrect = 25;
  } else if (difficulty === "Moderate") {
    maxQuestions = 5;
    pointsPerCorrect = 40;
  } else if (difficulty === "Hard") {
    maxQuestions = 4;
    pointsPerCorrect = 50;
  }

  const score = Math.min(solvedCiphers, maxQuestions) * pointsPerCorrect;
  return Math.min(score, 200);
}, [solvedCiphers, difficulty]);


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
    setSolvedCiphers(prev => {
      const newSolved = prev + 1;

      // ✅ End game when max questions reached
      const maxQuestions =
        difficulty === "Easy" ? 8 :
        difficulty === "Moderate" ? 5 : 4;

      if (newSolved >= maxQuestions) {
        setGameState('finished');
        setShowCompletionModal(true);
      } else {
        // Only generate next cipher if game not finished
        setTimeout(() => {
          generateNewCipher();
        }, 2000);
      }

      return newSolved;
    });

    setStreak(prev => {
      const newStreak = prev + 1;
      setMaxStreak(current => Math.max(current, newStreak));
      return newStreak;
    });

    setCurrentLevel(prev => prev + 1);

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
}, [gameState, showFeedback, currentCipher, userInput, cipherStartTime, generateNewCipher, difficulty]);



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