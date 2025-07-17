import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';

const NumberPatternMasterGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [difficulty, setDifficulty] = useState('Easy');

  // Game-specific state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentSequence, setCurrentSequence] = useState(null);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [currentOptions, setCurrentOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedSequences, setCompletedSequences] = useState(0);
  const [correctSequences, setCorrectSequences] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [sequenceType, setSequenceType] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [shuffledPatterns, setShuffledPatterns] = useState([]);

  function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}


  const allowedHintsByDifficulty = {
  Easy: 3,
  Medium: 2,
  Hard: 1
};

  // Pattern generators based on difficulty
  const generateSequence = useCallback(() => {
    const patterns = {
      Easy: [
        // Simple arithmetic progressions
        { type: 'arithmetic', min: 1, max: 50, step: { min: 2, max: 8 } },
        { type: 'arithmetic_negative', min: 50, max: 100, step: { min: 2, max: 8 } },
        { type: 'multiply_add', base: 2, constant: 1 },
      ],
      Medium: [
        // More complex patterns
        { type: 'geometric', ratio: 2, start: 1 },
        { type: 'geometric', ratio: 3, start: 1 },
        { type: 'squares', offset: 0 },
        { type: 'fibonacci_like', a: 1, b: 1 },
        { type: 'alternating_operations' },
      ],
      Hard: [
        // Advanced patterns
        { type: 'polynomial', degree: 2 },
        { type: 'factorial_based' },
        { type: 'prime_numbers' },
        { type: 'complex_formula' },
        { type: 'recursive_sequence' },
      ]
    };

    const patternOptions = patterns[difficulty];
    const selectedPattern = patternOptions[Math.floor(Math.random() * patternOptions.length)];
    
    return generateSequenceByType(selectedPattern);
  }, [difficulty]);

  const generateSequenceByType = (pattern) => {
    let sequence = [];
    let answer = 0;
    let explanation = '';
    let type = '';

    switch (pattern.type) {
      case 'arithmetic':
        const step = Math.floor(Math.random() * (pattern.step.max - pattern.step.min + 1)) + pattern.step.min;
        const start = Math.floor(Math.random() * (pattern.max - pattern.min + 1)) + pattern.min;
        for (let i = 0; i < 5; i++) {
          sequence.push(start + i * step);
        }
        answer = start + 5 * step;
        explanation = `Add ${step} to each number`;
        type = 'Arithmetic Sequence';
        break;

      case 'arithmetic_negative':
        const negStep = -(Math.floor(Math.random() * (pattern.step.max - pattern.step.min + 1)) + pattern.step.min);
        const negStart = Math.floor(Math.random() * (pattern.max - pattern.min + 1)) + pattern.min;
        for (let i = 0; i < 5; i++) {
          sequence.push(negStart + i * negStep);
        }
        answer = negStart + 5 * negStep;
        explanation = `Subtract ${Math.abs(negStep)} from each number`;
        type = 'Decreasing Sequence';
        break;

      case 'geometric':
        const ratio = pattern.ratio;
        const geoStart = pattern.start;
        for (let i = 0; i < 5; i++) {
          sequence.push(geoStart * Math.pow(ratio, i));
        }
        answer = geoStart * Math.pow(ratio, 5);
        explanation = `Multiply by ${ratio} each time`;
        type = 'Geometric Sequence';
        break;

      case 'squares':
        const offset = pattern.offset;
        for (let i = 1; i <= 5; i++) {
          sequence.push(i * i + offset);
        }
        answer = 36 + offset; // 6^2
        explanation = 'Perfect squares (n²)';
        type = 'Square Numbers';
        break;

      case 'fibonacci_like':
        sequence = [pattern.a, pattern.b];
        for (let i = 2; i < 5; i++) {
          sequence.push(sequence[i-1] + sequence[i-2]);
        }
        answer = sequence[3] + sequence[4];
        explanation = 'Each number = sum of previous two';
        type = 'Fibonacci-like Sequence';
        break;

      case 'polynomial':
        // n^2 + n + 1 pattern
        for (let i = 1; i <= 5; i++) {
          sequence.push(i * i + i + 1);
        }
        answer = 36 + 6 + 1; // 6^2 + 6 + 1
        explanation = 'Formula: n² + n + 1';
        type = 'Polynomial Sequence';
        break;

      case 'prime_numbers':
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
        sequence = primes.slice(0, 5);
        answer = primes[5];
        explanation = 'Prime numbers sequence';
        type = 'Prime Numbers';
        break;

      default:
        // Fallback to simple arithmetic
        const fallbackStep = 3;
        const fallbackStart = 2;
        for (let i = 0; i < 5; i++) {
          sequence.push(fallbackStart + i * fallbackStep);
        }
        answer = fallbackStart + 5 * fallbackStep;
        explanation = `Add ${fallbackStep} to each number`;
        type = 'Arithmetic Sequence';
    }

    return { sequence, answer, explanation, type };
  };

  const generateOptions = useCallback((correctAnswer) => {
    const options = [correctAnswer];
    const range = Math.max(10, Math.abs(correctAnswer * 0.3));
    
    while (options.length < 4) {
      const offset = (Math.random() - 0.5) * range;
      const option = Math.round(correctAnswer + offset);
      if (!options.includes(option) && option !== correctAnswer) {
        options.push(option);
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  }, []);

  const generateNewSequence = useCallback((patternList = shuffledPatterns) => {
  let newShuffledPatterns = [...patternList];

  if (newShuffledPatterns.length === 0) {
    // Reshuffle if empty
    const patterns = {
      Easy: [
        { type: 'arithmetic', min: 1, max: 50, step: { min: 2, max: 8 } },
        { type: 'arithmetic_negative', min: 50, max: 100, step: { min: 2, max: 8 } },
        { type: 'multiply_add', base: 2, constant: 1 },
      ],
      Medium: [
        { type: 'geometric', ratio: 2, start: 1 },
        { type: 'geometric', ratio: 3, start: 1 },
        { type: 'squares', offset: 0 },
        { type: 'fibonacci_like', a: 1, b: 1 },
        { type: 'alternating_operations' },
      ],
      Hard: [
        { type: 'polynomial', degree: 2 },
        { type: 'factorial_based' },
        { type: 'prime_numbers' },
        { type: 'complex_formula' },
        { type: 'recursive_sequence' },
      ]
    };

    newShuffledPatterns = shuffleArray(patterns[difficulty]);
  }

  const selectedPattern = newShuffledPatterns.shift();

  // Update patterns state so next time we pop the next pattern
  setShuffledPatterns(newShuffledPatterns);

  const { sequence, answer, explanation, type } = generateSequenceByType(selectedPattern);
  const options = generateOptions(answer);

  setCurrentSequence(sequence);
  setCorrectAnswer(answer);
  setCurrentOptions(options);
  setSelectedAnswer(null);
  setShowFeedback(false);
  setShowHint(false);
  setSequenceType(type);
  setCurrentExplanation(explanation);
}, [difficulty, generateOptions, generateSequenceByType, shuffledPatterns]);


  const handleAnswerSelect = useCallback((answer) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setCompletedSequences(prev => prev + 1);
    
    const isCorrect = answer === correctAnswer;
    
    if (isCorrect) {
      setCorrectSequences(prev => prev + 1);
      setStreakCount(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });
      
      // Calculate score
      const baseScore = 8;
      const difficultyMultiplier = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 1.5 : 2;
      const streakBonus = Math.min(streakCount * 2, 15);
      const hintPenalty = showHint ? 2 : 0;
      const timeBonus = timeRemaining > 120 ? 3 : timeRemaining > 60 ? 1 : 0;
      
      const finalScore = Math.floor((baseScore + streakBonus + timeBonus - hintPenalty) * difficultyMultiplier);
      setScore(prev => prev + finalScore);
    } else {
      setStreakCount(0);
    }
    
    // Update accuracy
    const newAccuracy = ((correctSequences + (isCorrect ? 1 : 0)) / (completedSequences + 1)) * 100;
    setAccuracy(newAccuracy);
    
    // Generate new sequence after feedback
    setTimeout(() => {
      generateNewSequence();
    }, 2500);
  }, [showFeedback, correctAnswer, correctSequences, completedSequences, streakCount, difficulty, timeRemaining, showHint, generateNewSequence]);

  const handleHint = () => {
  const maxHints = allowedHintsByDifficulty[difficulty];
  if (!showHint && hintsUsed < maxHints) {
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
  }
};


  // Initialize game
 const initializeGame = useCallback(() => {
  setScore(0);
  setCurrentLevel(1);
  setCompletedSequences(0);
  setCorrectSequences(0);
  setStreakCount(0);
  setMaxStreak(0);
  setAccuracy(0);
  setHintsUsed(0);
  setShowHint(false);
  setSelectedAnswer(null);
  setShowFeedback(false);

  const initialTime = difficulty === 'Easy' ? 180 : difficulty === 'Medium' ? 150 : 120;
  setTimeRemaining(initialTime);

  // New code: shuffle patterns
  const patterns = {
    Easy: [
      { type: 'arithmetic', min: 1, max: 50, step: { min: 2, max: 8 } },
      { type: 'arithmetic_negative', min: 50, max: 100, step: { min: 2, max: 8 } },
      { type: 'multiply_add', base: 2, constant: 1 },
    ],
    Medium: [
      { type: 'geometric', ratio: 2, start: 1 },
      { type: 'geometric', ratio: 3, start: 1 },
      { type: 'squares', offset: 0 },
      { type: 'fibonacci_like', a: 1, b: 1 },
      { type: 'alternating_operations' },
    ],
    Hard: [
      { type: 'polynomial', degree: 2 },
      { type: 'factorial_based' },
      { type: 'prime_numbers' },
      { type: 'complex_formula' },
      { type: 'recursive_sequence' },
    ]
  };

  const shuffled = shuffleArray(patterns[difficulty]);
  setShuffledPatterns(shuffled);

  generateNewSequence(shuffled);
}, [difficulty, generateNewSequence]);

  // Game timer
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

  // Level progression
  useEffect(() => {
    if (correctSequences > 0 && correctSequences % 5 === 0) {
      setCurrentLevel(prev => prev + 1);
    }
  }, [correctSequences]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
    console.log('Number Pattern Master completed:', payload);
  };

  const customStats = {
    currentLevel,
    completedSequences,
    correctSequences,
    accuracy: Math.round(accuracy),
    streakCount,
    maxStreak,
    hintsUsed
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Number Pattern Master"
        gameDescription="Challenge your numerical reasoning! Identify patterns in number sequences and predict the next number to test your mathematical intelligence."
        category="Numerical Reasoning"
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
          {/* Enhanced Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs sm:text-sm text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-emerald-200">
              <div className="text-xs sm:text-sm text-emerald-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Completed
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedSequences}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs sm:text-sm text-purple-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Correct
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctSequences}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-amber-200">
              <div className="text-xs sm:text-sm text-amber-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(accuracy)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streakCount}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-gray-200">
              <div className="text-xs sm:text-sm text-gray-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Hints Used
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {hintsUsed}
              </div>
            </div>
          </div>

          {/* Current Sequence Display */}
          {gameState === 'playing' && currentSequence && (
            <div className="w-full max-w-4xl">
              {/* Sequence Type Indicator */}
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-4 py-2 border border-blue-200">
                  <span className="text-sm font-medium text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Pattern Type: {sequenceType || 'Mathematical Sequence'}
                  </span>
                </div>
              </div>

              {/* Number Sequence */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  What comes next in this sequence?
                </h3>
                
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 flex-wrap">
                  {currentSequence.map((number, index) => (
                    <React.Fragment key={index}>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl px-4 py-3 sm:px-6 sm:py-4 shadow-lg">
                        <span className="text-2xl sm:text-3xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {number}
                        </span>
                      </div>
                      {index < currentSequence.length - 1 && (
                        <div className="text-gray-400 text-xl">→</div>
                      )}
                    </React.Fragment>
                  ))}
                  <div className="text-gray-400 text-xl">→</div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-100 border-2 border-dashed border-orange-300 rounded-xl px-4 py-3 sm:px-6 sm:py-4 shadow-lg">
                    <span className="text-2xl sm:text-3xl font-bold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      ?
                    </span>
                  </div>
                </div>

                {/* Hint Section */}
                <div className="flex justify-center mb-6">
                  {!showHint ? (
                    <button
                      onClick={handleHint}
                     disabled={showFeedback || hintsUsed >= allowedHintsByDifficulty[difficulty]}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                    >
                      <Lightbulb className="h-4 w-4" />
                      Need a Hint? ({allowedHintsByDifficulty[difficulty] - hintsUsed} left)
                    </button>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Hint:
                        </span>
                      </div>
                      <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {currentExplanation || 'Look for the mathematical relationship between consecutive numbers.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-4">
                  {currentOptions.map((option, index) => {
                    let buttonClass = "bg-gray-50 border-2 border-gray-200 text-gray-900 hover:bg-gray-100 hover:border-gray-300";
                    
                    if (showFeedback) {
                      if (option === correctAnswer) {
                        buttonClass = "bg-green-100 border-2 border-green-500 text-green-900";
                      } else if (option === selectedAnswer && option !== correctAnswer) {
                        buttonClass = "bg-red-100 border-2 border-red-500 text-red-900";
                      } else {
                        buttonClass = "bg-gray-100 border-2 border-gray-200 text-gray-500";
                      }
                    } else if (selectedAnswer === option) {
                      buttonClass = "bg-blue-100 border-2 border-blue-500 text-blue-900";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showFeedback}
                        className={`${buttonClass} rounded-xl px-6 py-4 text-xl font-bold transition-all duration-200 disabled:cursor-not-allowed`}
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className="mt-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      selectedAnswer === correctAnswer 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {selectedAnswer === correctAnswer ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Correct! Well done!
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5" />
                          <span className="font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Not quite. The answer was {correctAnswer}
                          </span>
                        </>
                      )}
                    </div>
                    {currentExplanation && (
                      <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Pattern: {currentExplanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🔢🧮</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Number Pattern Master
                </h3>

                <div className="text-left space-y-6 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {/* What is this game */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">🎯 What is Number Pattern Master?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Number Pattern Master is a numerical reasoning game that challenges your ability to identify mathematical 
                      patterns and relationships. You'll analyze sequences of numbers and predict what comes next, testing your 
                      logical thinking, pattern recognition, and mathematical intuition across various types of number sequences.
                    </p>
                  </div>

                  {/* How to play */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">📋 How to Play:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <strong>Analyze:</strong> Study the sequence of numbers presented. Look for mathematical relationships 
                          between consecutive numbers or positions.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <strong>Identify Pattern:</strong> Determine the mathematical rule or formula that generates the sequence.
                          This could be addition, multiplication, squares, or more complex relationships.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <strong>Predict:</strong> Choose the correct next number from four multiple-choice options based on 
                          the pattern you identified.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <strong>Learn:</strong> Get immediate feedback with explanations to understand the pattern and improve 
                          your numerical reasoning skills.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty levels */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">⚡ Difficulty Levels:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-100 rounded-lg p-4">
                        <h5 className="font-semibold text-green-900 mb-2">🟢 Easy</h5>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Simple arithmetic sequences</li>
                          <li>• Basic addition/subtraction patterns</li>
                          <li>• Smaller numbers (1-100)</li>
                          <li>• Clear, obvious patterns</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-100 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-900 mb-2">🟡 Medium</h5>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Geometric sequences</li>
                          <li>• Square numbers and formulas</li>
                          <li>• Fibonacci-like patterns</li>
                          <li>• Multiple operation types</li>
                        </ul>
                      </div>
                      <div className="bg-red-100 rounded-lg p-4">
                        <h5 className="font-semibold text-red-900 mb-2">🔴 Hard</h5>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• Complex polynomial formulas</li>
                          <li>• Prime number sequences</li>
                          <li>• Recursive relationships</li>
                          <li>• Advanced mathematical concepts</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Scoring and tips */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">🏆 Scoring & Tips:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-purple-900 mb-2">Scoring System:</h5>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Base: 8 points per correct answer</li>
                          <li>• Streak bonus: up to 15 points</li>
                          <li>• Time bonus: up to 3 points</li>
                          <li>• Hint penalty: -2 points</li>
                          <li>• Difficulty multiplier: 1x-2x</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-pink-900 mb-2">Pro Tips:</h5>
                        <ul className="text-sm text-pink-800 space-y-1">
                          <li>• Look for differences between numbers</li>
                          <li>• Check for multiplication patterns</li>
                          <li>• Consider position-based formulas</li>
                          <li>• Use hints when truly stuck</li>
                          <li>• Practice mental math daily</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Summary */}
          {gameState === 'finished' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Mathematical Excellence Achieved!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Final Score</div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{score}/200</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Sequences</div>
                    <div className="text-2xl font-bold text-green-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{completedSequences}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Accuracy</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{Math.round(accuracy)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Max Streak</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{maxStreak}</div>
                  </div>
                </div>
                <div className="space-y-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>Mathematical Intelligence: {accuracy > 85 ? 'Exceptional' : accuracy > 70 ? 'Advanced' : accuracy > 55 ? 'Proficient' : 'Developing'}</div>
                  <div>Pattern Recognition Level: {currentLevel}</div>
                  <div>Hints Used: {hintsUsed}</div>
                </div>
              </div>
            </div>
          )}
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

export default NumberPatternMasterGame;