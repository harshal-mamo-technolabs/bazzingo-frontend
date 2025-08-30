import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { generateAlgebraic, generateArithmetic, generatePattern, calculateScore } from '../../utils/games/MathDeduction';
import { Lightbulb, Calculator, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react';

const MathDeductionGame = () => {
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
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);

  // Game state
  const [currentEquation, setCurrentEquation] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showMathDeductionInstructions, setShowMathDeductionInstructions] = useState(true);

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 120, lives: 5, hints: 3, types: ['arithmetic'] },
    Moderate: { timeLimit: 100, lives: 4, hints: 2, types: ['arithmetic', 'algebraic', 'pattern'] },
    Hard: { timeLimit: 80, lives: 3, hints: 1, types: ['arithmetic', 'algebraic', 'pattern'] }
  };

  // Generate new equation
  const generateNewEquation = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const types = settings.types;
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    let equationData;
    switch (selectedType) {
      case 'arithmetic':
        equationData = generateArithmetic(difficulty);
        break;
      case 'algebraic':
        equationData = generateAlgebraic(difficulty);
        break;
      case 'pattern':
        equationData = generatePattern(difficulty);
        break;
      default:
        equationData = generateArithmetic(difficulty);
    }
    
    setCurrentEquation(equationData);
    setUserInput('');
    setShowFeedback(false);
    setShowHint(false);
    setQuestionStartTime(Date.now());
  }, [difficulty]);


  useEffect(() => {
  const newScore = calculateScore({
    correctAnswers,
    totalQuestions,
    totalResponseTime,
    currentLevel,
    lives,
    hintsUsed,
    maxStreak,
    timeRemaining,
    difficulty
  });
  setScore(newScore);
}, [
  correctAnswers,
  totalQuestions,
  totalResponseTime,
  currentLevel,
  lives,
  hintsUsed,
  maxStreak,
  timeRemaining,
  difficulty
]);


  // Handle answer submission
  const handleSubmit = useCallback(() => {
  if (gameState !== 'playing' || showFeedback || !currentEquation) return;

  if (!userInput.trim()) {
    return;
  }

  const userAnswerRaw = parseFloat(userInput);
  if (isNaN(userAnswerRaw)) {
    return;
  }

  const responseTime = Date.now() - questionStartTime;
  const correctAnswer = currentEquation.answer;

  setShowFeedback(true);
  setTotalQuestions(prev => prev + 1);
  setTotalResponseTime(prev => prev + responseTime);

  const isCorrect = Math.abs(userAnswerRaw - correctAnswer) < 0.001;

  if (isCorrect) {
  setFeedbackType('correct');
  setCorrectAnswers(prev => prev + 1);
  setStreak(prev => {
    const newStreak = prev + 1;
    setMaxStreak(current => Math.max(current, newStreak));
    return newStreak;
  });

  setCurrentLevel(prev => {
    const newLevel = prev + 1;
    const maxLevels =
      difficulty === 'Easy' ? 8 :
      difficulty === 'Moderate' ? 5 : 4;

    if (newLevel > maxLevels) {
      setGameState('finished');
      setShowCompletionModal(true);
      return prev; // don’t increment past max
    }

    return newLevel;
  });

  setTimeout(() => {
    if (gameState === 'playing') {
      generateNewEquation();
    }
  }, 1500);
 }
 else {
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
}, [gameState, showFeedback, currentEquation, userInput, questionStartTime, generateNewEquation]);


  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;
    
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    
    setTimeout(() => {
      setShowHint(false);
    }, 4000);
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
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setTotalResponseTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    generateNewEquation();
  };

  const handleReset = () => {
    initializeGame();
    setCurrentEquation(null);
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
    correctAnswers,
    totalQuestions,
    averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      
      <GameFramework
        gameTitle="Mathematical Deduction"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
  <div className="bg-[#E8E8E8] rounded-lg p-6">
    {/* Header with toggle */}
    <div
      className="flex items-center justify-between mb-4 cursor-pointer"
      onClick={() => setShowMathDeductionInstructions(!showMathDeductionInstructions)}
    >
      <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
        How to Play Mathematical Deduction
      </h3>
      <span className="text-blue-900 text-xl">
        {showMathDeductionInstructions
  ? <ChevronUp className="h-5 w-5 text-blue-900" />
  : <ChevronDown className="h-5 w-5 text-blue-900" />}
      </span>
    </div>

    {/* Conditional Content */}
    {showMathDeductionInstructions && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            🎯 Objective
          </h4>
          <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            Solve mathematical equations, find missing numbers, and identify patterns through logical reasoning.
          </p>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            🔢 Equation Types
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• <strong>Arithmetic:</strong> Basic operations</li>
            <li>• <strong>Algebraic:</strong> Variable equations</li>
            <li>• <strong>Patterns:</strong> Number sequences</li>
          </ul>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            📊 Scoring
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• Accuracy and speed matter</li>
            <li>• Streak bonuses for consistency</li>
            <li>• Level progression rewards</li>
          </ul>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            💡 Strategy
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• Use hints sparingly</li>
            <li>• Think step-by-step</li>
            <li>• Maintain solving streaks</li>
          </ul>
        </div>
      </div>
    )}
  </div>
          </div>

        }
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
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {gameState === 'playing' && (
              <button
                onClick={useHint}
                disabled={hintsUsed >= maxHints}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  hintsUsed >= maxHints
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
                Accuracy
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Equation Display */}
          {currentEquation && (
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Solve the equation:
              </h3>
              <div className="bg-gray-100 rounded-lg p-8 inline-block">
                <div className="text-3xl font-mono text-gray-900 mb-4">
                  {currentEquation.equation}
                </div>
              </div>
            </div>
          )}

          {/* Hint Display */}
          {showHint && currentEquation && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hint:
                  </span>
                </div>
                <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentEquation.hint}
                </p>
              </div>
            </div>
          )}

          {/* Input Section */}
          {currentEquation && !showFeedback && (
            <div className="w-full max-w-md mb-6">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your answer"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B3E] focus:border-transparent"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    userInput.trim()
                      ? 'bg-[#FF6B3E] text-white hover:bg-[#e55a35]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <Calculator className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentEquation && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg ${
              feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Correct!' : 'Incorrect!'}
                </div>
              </div>
              <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackType === 'correct'
                  ? `Excellent! The answer is ${currentEquation.answer}.`
                  : `Answer is incorrect. You answered ${userInput}.`
                  //: `The correct answer is ${currentEquation.answer}. You answered ${userInput}.`
                }
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Solve each equation step by step. Use hints wisely - they're limited!
              Press Enter or click the calculator button to submit your answer.
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

export default MathDeductionGame;