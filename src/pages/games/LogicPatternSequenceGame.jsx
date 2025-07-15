import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const LogicPatternSequenceGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 90, pointsPerCorrect: 10, patterns: 'basic' },
    Moderate: { timeLimit: 75, pointsPerCorrect: 15, patterns: 'intermediate' },
    Hard: { timeLimit: 60, pointsPerCorrect: 25, patterns: 'advanced' }
  };

  // Pattern generators for different difficulty levels
  const patternGenerators = {
    basic: [
      // Simple arithmetic sequences
      () => {
        const start = Math.floor(Math.random() * 10) + 1;
        const diff = Math.floor(Math.random() * 5) + 1;
        const sequence = [start, start + diff, start + 2*diff, start + 3*diff];
        const answer = start + 4*diff;
        const options = generateOptions(answer, 'arithmetic');
        return { sequence, answer, options, type: 'Arithmetic Sequence' };
      },
      // Simple geometric sequences
      () => {
        const start = Math.floor(Math.random() * 5) + 2;
        const ratio = Math.floor(Math.random() * 3) + 2;
        const sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
        const answer = start * Math.pow(ratio, 4);
        const options = generateOptions(answer, 'geometric');
        return { sequence, answer, options, type: 'Geometric Sequence' };
      },
      // Simple pattern sequences
      () => {
        const patterns = [
          { seq: [1, 3, 5, 7], ans: 9, type: 'Odd Numbers' },
          { seq: [2, 4, 6, 8], ans: 10, type: 'Even Numbers' },
          { seq: [5, 10, 15, 20], ans: 25, type: 'Multiples of 5' },
          { seq: [10, 20, 30, 40], ans: 50, type: 'Multiples of 10' }
        ];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const options = generateOptions(pattern.ans, 'basic');
        return { sequence: pattern.seq, answer: pattern.ans, options, type: pattern.type };
      }
    ],
    intermediate: [
      // Fibonacci-like sequences
      () => {
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 3) + 2;
        const sequence = [a, b, a + b, a + 2*b, 2*a + 3*b];
        const answer = 3*a + 5*b;
        const options = generateOptions(answer, 'fibonacci');
        return { sequence, answer, options, type: 'Fibonacci-like Sequence' };
      },
      // Square numbers with variations
      () => {
        const start = Math.floor(Math.random() * 3) + 1;
        const sequence = [start*start, (start+1)*(start+1), (start+2)*(start+2), (start+3)*(start+3)];
        const answer = (start+4)*(start+4);
        const options = generateOptions(answer, 'squares');
        return { sequence, answer, options, type: 'Square Numbers' };
      },
      // Alternating patterns
      () => {
        const base = Math.floor(Math.random() * 5) + 2;
        const sequence = [base, base*2, base*3, base*4];
        const answer = base*5;
        const options = generateOptions(answer, 'multiples');
        return { sequence, answer, options, type: 'Multiple Pattern' };
      }
    ],
    advanced: [
      // Complex mathematical sequences
      () => {
        const start = Math.floor(Math.random() * 3) + 1;
        const sequence = [start, start*start, start*start*start, start*start*start*start];
        const answer = Math.pow(start, 5);
        const options = generateOptions(answer, 'powers');
        return { sequence, answer, options, type: 'Power Sequence' };
      },
      // Prime number sequences
      () => {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
        const startIndex = Math.floor(Math.random() * 6);
        const sequence = primes.slice(startIndex, startIndex + 4);
        const answer = primes[startIndex + 4];
        const options = generateOptions(answer, 'primes');
        return { sequence, answer, options, type: 'Prime Numbers' };
      },
      // Complex arithmetic progressions
      () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const d1 = Math.floor(Math.random() * 3) + 1;
        const d2 = Math.floor(Math.random() * 2) + 1;
        const sequence = [a, a + d1, a + d1 + d1 + d2, a + d1 + d1 + d2 + d1 + 2*d2];
        const answer = a + d1 + d1 + d2 + d1 + 2*d2 + d1 + 3*d2;
        const options = generateOptions(answer, 'complex');
        return { sequence, answer, options, type: 'Complex Pattern' };
      }
    ]
  };

  // Generate answer options
  const generateOptions = (correctAnswer, type) => {
    const options = [correctAnswer];
    const range = Math.max(10, Math.abs(correctAnswer * 0.5));
    
    while (options.length < 4) {
      let option;
      if (type === 'arithmetic' || type === 'basic') {
        option = correctAnswer + (Math.floor(Math.random() * 20) - 10);
      } else if (type === 'geometric' || type === 'powers') {
        option = Math.floor(correctAnswer * (0.5 + Math.random()));
      } else {
        option = correctAnswer + (Math.floor(Math.random() * range) - range/2);
      }
      
      if (option > 0 && !options.includes(option)) {
        options.push(option);
      }
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

  // Generate new pattern
  const generateNewPattern = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const generators = patternGenerators[settings.patterns];
    const generator = generators[Math.floor(Math.random() * generators.length)];
    const pattern = generator();
    
    setCurrentPattern(pattern);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setTimeRemaining(settings.timeLimit);
    setSelectedAnswer(null);
    setShowFeedback(false);
    generateNewPattern();
  }, [difficulty, generateNewPattern]);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    initializeGame();
  }, [initializeGame]);

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null || showFeedback) return;
    
    setSelectedAnswer(answer);
    setTotalQuestions(prev => prev + 1);
    
    const isCorrect = answer === currentPattern.answer;
    const settings = difficultySettings[difficulty];
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => Math.min(200, prev + settings.pointsPerCorrect));
      setFeedback('Correct! Well done!');
    } else {
      setFeedback(`Incorrect. The answer was ${currentPattern.answer}`);
    }
    
    setShowFeedback(true);
    
    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (timeRemaining > 0) {
        generateNewPattern();
      }
    }, 2000);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Reset game
  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCurrentPattern(null);
  };

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      <GameFramework
        gameTitle="Logic Pattern Sequence"
        gameDescription="Identify the logical pattern in number sequences and predict the next number. Test your analytical thinking and pattern recognition skills!"
        category="Logic"
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={startGame}
        onReset={resetGame}
        customStats={{
          'Correct Answers': correctAnswers,
          'Total Questions': totalQuestions,
          'Accuracy': `${accuracy}%`
        }}
      >
        {gameState === 'playing' && currentPattern && (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
            {/* Pattern Display */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6 w-full max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Find the Next Number in the Sequence
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Pattern Type: {currentPattern.type}
              </p>
              
              {/* Sequence Display */}
              <div className="flex items-center justify-center mb-8">
                {currentPattern.sequence.map((num, index) => (
                  <React.Fragment key={index}>
                    <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 min-w-[60px] text-center">
                      <span className="text-xl font-bold text-blue-800">{num}</span>
                    </div>
                    {index < currentPattern.sequence.length - 1 && (
                      <div className="mx-3 text-gray-400">→</div>
                    )}
                  </React.Fragment>
                ))}
                <div className="mx-3 text-gray-400">→</div>
                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 min-w-[60px] text-center">
                  <span className="text-xl font-bold text-yellow-800">?</span>
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-4">
                {currentPattern.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ${
                      selectedAnswer === option
                        ? option === currentPattern.answer
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : 'bg-red-100 border-red-500 text-red-800'
                        : selectedAnswer !== null && option === currentPattern.answer
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-gray-50 border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-300'
                    } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
                  selectedAnswer === currentPattern.answer
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {feedback}
                </div>
              )}
            </div>

            {/* Game Stats */}
            <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </GameFramework>
    </div>
  );
};

export default LogicPatternSequenceGame;
