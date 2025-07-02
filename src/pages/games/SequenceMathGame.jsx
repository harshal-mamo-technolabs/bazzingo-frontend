import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const SequenceMathGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [options, setOptions] = useState([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [sequenceType, setSequenceType] = useState('');

  // Difficulty settings
  const difficultySettings = {
    Easy: { sequenceLength: 4, timeLimit: 60, complexPatterns: false },
    Moderate: { sequenceLength: 5, timeLimit: 50, complexPatterns: true },
    Hard: { sequenceLength: 6, timeLimit: 40, complexPatterns: true }
  };

  // Sequence pattern generators
  const sequencePatterns = {
    arithmetic: {
      name: 'Arithmetic Progression',
      generate: (length, complex = false) => {
        const start = Math.floor(Math.random() * 10) + 1;
        const diff = complex ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 3) + 1;
        const sequence = [];
        for (let i = 0; i < length; i++) {
          sequence.push(start + (i * diff));
        }
        const nextValue = start + (length * diff);
        return { sequence, nextValue, rule: `Add ${diff}` };
      }
    },
    geometric: {
      name: 'Geometric Progression',
      generate: (length, complex = false) => {
        const start = Math.floor(Math.random() * 3) + 2;
        const ratio = complex ? Math.floor(Math.random() * 3) + 2 : 2;
        const sequence = [];
        for (let i = 0; i < length; i++) {
          sequence.push(start * Math.pow(ratio, i));
        }
        const nextValue = start * Math.pow(ratio, length);
        return { sequence, nextValue, rule: `Multiply by ${ratio}` };
      }
    },
    fibonacci: {
      name: 'Fibonacci-like',
      generate: (length) => {
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 3) + 1;
        const sequence = [a, b];
        for (let i = 2; i < length; i++) {
          sequence.push(sequence[i - 1] + sequence[i - 2]);
        }
        const nextValue = sequence[length - 1] + sequence[length - 2];
        return { sequence, nextValue, rule: 'Sum of previous two' };
      }
    },
    squares: {
      name: 'Perfect Squares',
      generate: (length) => {
        const start = Math.floor(Math.random() * 3) + 1;
        const sequence = [];
        for (let i = 0; i < length; i++) {
          sequence.push(Math.pow(start + i, 2));
        }
        const nextValue = Math.pow(start + length, 2);
        return { sequence, nextValue, rule: 'Perfect squares' };
      }
    },
    alternating: {
      name: 'Alternating Pattern',
      generate: (length, complex = false) => {
        const base1 = Math.floor(Math.random() * 5) + 1;
        const base2 = Math.floor(Math.random() * 5) + 1;
        const diff1 = complex ? Math.floor(Math.random() * 3) + 2 : 2;
        const diff2 = complex ? Math.floor(Math.random() * 3) + 2 : 3;
        const sequence = [];

        for (let i = 0; i < length; i++) {
          if (i % 2 === 0) {
            sequence.push(base1 + (Math.floor(i / 2) * diff1));
          } else {
            sequence.push(base2 + (Math.floor(i / 2) * diff2));
          }
        }

        let nextValue;
        if (length % 2 === 0) {
          nextValue = base1 + (Math.floor(length / 2) * diff1);
        } else {
          nextValue = base2 + (Math.floor(length / 2) * diff2);
        }

        return { sequence, nextValue, rule: 'Alternating pattern' };
      }
    }
  };

  // Generate new sequence
  const generateNewSequence = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const patternKeys = Object.keys(sequencePatterns);

    // Filter patterns based on difficulty
    let availablePatterns = patternKeys;
    if (!settings.complexPatterns) {
      availablePatterns = ['arithmetic', 'geometric', 'squares'];
    }

    const randomPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    const pattern = sequencePatterns[randomPattern];
    const result = pattern.generate(settings.sequenceLength, settings.complexPatterns);

    setCurrentSequence(result.sequence);
    setCorrectAnswer(result.nextValue);
    setSequenceType(pattern.name);

    // Generate multiple choice options
    const wrongAnswers = [];
    const correct = result.nextValue;

    // Generate plausible wrong answers
    for (let i = 0; i < 3; i++) {
      let wrongAnswer;
      do {
        const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
        wrongAnswer = correct + variation;
        if (wrongAnswer <= 0) wrongAnswer = correct + Math.abs(variation) + 1;
      } while (wrongAnswers.includes(wrongAnswer) || wrongAnswer === correct);
      wrongAnswers.push(wrongAnswer);
    }

    // Shuffle options
    const allOptions = [correct, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setUserAnswer('');
  }, [difficulty]);

  // Handle answer submission
  const handleAnswerSubmit = (selectedAnswer = null) => {
    const answer = selectedAnswer !== null ? selectedAnswer : parseInt(userAnswer);
    if (isNaN(answer)) return;

    setQuestionsAnswered(prev => prev + 1);

    if (answer === correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Generate next question after delay
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      generateNewSequence();
    }, 1500);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setCurrentRound(1);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setUserAnswer('');
  }, [difficulty]);

  // Calculate score using Problem-Solving formula
  useEffect(() => {
    if (questionsAnswered > 0) {
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;
      const errors = questionsAnswered - correctAnswers;

      // Treat each wrong answer as +1 move over optimal
      let newScore = 200 - (errors * 15 + timeUsed * 0.8);
      newScore = Math.max(20, Math.min(200, newScore));

      setScore(newScore);
    }
  }, [questionsAnswered, correctAnswers, timeRemaining, difficulty]);

  // Timer countdown
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

  const handleStart = () => {
    initializeGame();
    generateNewSequence();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    questions: questionsAnswered,
    correct: correctAnswers,
    timePerQuestion: questionsAnswered > 0 ? Math.round((difficultySettings[difficulty].timeLimit - timeRemaining) / questionsAnswered) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Sequence Math"
        gameDescription="Find the next number in the mathematical sequence!"
        category="Problem-Solving"
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
          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Round
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentRound}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Correct
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctAnswers}/{questionsAnswered}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Sequence Display */}
          {currentSequence.length > 0 && (
            <div className="mb-8 text-center">
              <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Pattern: {sequenceType}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                What comes next in this sequence?
              </div>

              <div className="flex justify-center items-center gap-3 mb-6">
                {currentSequence.map((num, index) => (
                  <div key={index} className="w-16 h-16 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {num}
                    </span>
                  </div>
                ))}
                <div className="w-16 h-16 bg-[#FF6B3E] rounded-lg border-2 border-[#FF6B3E] flex items-center justify-center">
                  <span className="text-lg font-semibold text-white" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    ?
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Answer Options */}
          {options.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSubmit(option)}
                  className="px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:border-[#FF6B3E] hover:bg-orange-50 transition-colors text-center"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {option}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Manual Input (Alternative) */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Or type your answer:
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter number"
                className="px-4 py-2 border border-gray-300 rounded-lg text-center"
                style={{ fontFamily: 'Roboto, sans-serif' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAnswerSubmit();
                  }
                }}
              />
              <button
                onClick={() => handleAnswerSubmit()}
                disabled={!userAnswer.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${!userAnswer.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FF6B3E] text-white hover:bg-[#e55a35]'
                  }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Analyze the mathematical pattern in the sequence and determine what number comes next.
              Look for arithmetic progressions, geometric progressions, or other mathematical relationships.
            </p>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default SequenceMathGame;
