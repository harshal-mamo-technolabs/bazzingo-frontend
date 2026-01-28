import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Visual effects
  const [equationAnimKey, setEquationAnimKey] = useState(0);
  const [shakeIncorrect, setShakeIncorrect] = useState(false);
  const [flashCorrect, setFlashCorrect] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 120, lives: 5, hints: 3, types: ['arithmetic'] },
    Moderate: { timeLimit: 100, lives: 4, hints: 2, types: ['arithmetic', 'algebraic', 'pattern'] },
    Hard: { timeLimit: 80, lives: 3, hints: 1, types: ['arithmetic', 'algebraic', 'pattern'] }
  };

  // ⏱️ Skip penalty per difficulty
  const skipPenaltyByDifficulty = { Easy: 5, Moderate: 7, Hard: 10 };

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
    setEquationAnimKey((k) => k + 1); // trigger pop-in
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
    if (!userInput.trim()) return;

    const userAnswerRaw = Number(userInput);
    if (isNaN(userAnswerRaw)) return;

    const responseTime = Date.now() - questionStartTime;
    const correctAnswer = currentEquation.answer;

    setShowFeedback(true);
    setTotalQuestions(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    const isCorrect = Math.abs(userAnswerRaw - Number(correctAnswer)) < 1e-6;

    if (isCorrect) {
      setFeedbackType('correct');
      setCorrectAnswers(prev => prev + 1);
      setFlashCorrect(true);
      setConfettiBurst((b) => b + 1);
      setTimeout(() => setFlashCorrect(false), 600);
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
    } else {
      setFeedbackType('incorrect');
      setShakeIncorrect(true);
      setTimeout(() => setShakeIncorrect(false), 600);
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
  }, [gameState, showFeedback, currentEquation, userInput, questionStartTime, generateNewEquation, difficulty]);

  // ➡️ Skip question (deduct time)
  // ➡️ Skip question (deduct time AND a life)
const handleSkip = useCallback(() => {
  if (gameState !== 'playing' || !currentEquation) return;

  const penalty = skipPenaltyByDifficulty[difficulty] ?? 5;

  // Count as attempted; break streak
  setTotalQuestions(prev => prev + 1);
  setStreak(0);

  // Track if game should end after life/time deductions
  let willEnd = false;

  // 1) Deduct a life
  setLives(prev => {
    const newLives = prev - 1;
    if (newLives <= 0) {
      willEnd = true;
      setGameState('finished');
      setShowCompletionModal(true);
    }
    return Math.max(0, newLives);
  });

  // 2) Deduct time; may also end game
  setTimeRemaining(prev => {
    const next = Math.max(0, prev - penalty);
    if (next === 0) {
      willEnd = true;
      setGameState('finished');
      setShowCompletionModal(true);
    }
    return next;
  });

  // If the game ended due to life/time, stop here
  if (willEnd) return;

  // Brief "skipped" feedback
  setFeedbackType('skipped');
  setShowFeedback(true);
  setTimeout(() => setShowFeedback(false), 1000);

  // Load next question
  setUserInput('');
  generateNewEquation();
}, [gameState, currentEquation, generateNewEquation, difficulty]);


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

  // Confetti pieces for short celebration on correct
  const confettiPieces = useMemo(() => {
    const count = 36;
    const colors = ['#FF6B3E', '#22C55E', '#3B82F6', '#F59E0B', '#A855F7'];
    return Array.from({ length: count }).map((_, i) => ({
      id: `${confettiBurst}-${i}`,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      color: colors[i % colors.length],
      duration: 900 + Math.random() * 700,
      delay: Math.random() * 150
    }));
  }, [confettiBurst]);

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}
      
      <GameFramework
        gameTitle="Mathematical Deduction"
        gameShortDescription="Solve mathematical problems using logical deduction. Challenge your analytical thinking and math skills!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
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

          {/* Game Stats - Lives only */}
          <div className="grid grid-cols-1 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Lives
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'❤️'.repeat(lives)}
              </div>
            </div>
          </div>

          {/* Equation Display */}
          {currentEquation && (
            <div className="text-center mb-8 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Solve the equation:
              </h3>
              <div className={`bg-gray-100 rounded-lg p-8 inline-block transition-all duration-500 ${flashCorrect ? 'flash-correct' : ''} ${shakeIncorrect ? 'shake' : ''}`} key={equationAnimKey}>
                <div className="text-3xl font-mono text-gray-900 mb-4 pop-in">
                  {currentEquation.equation}
                </div>
              </div>
              {/* Confetti */}
              {flashCorrect && (
                <div className="pointer-events-none absolute inset-0 overflow-visible">
                  {confettiPieces.map((p) => (
                    <span
                      key={p.id}
                      className="confetti-piece"
                      style={{
                        left: `${p.left}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        animationDuration: `${p.duration}ms`,
                        animationDelay: `${p.delay}ms`
                      }}
                    />
                  ))}
                </div>
              )}
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

          {/* Input + Buttons (Submit & Skip) */}
          {currentEquation && !showFeedback && (
            <div className="w-full max-w-md mb-6">
              <div className="flex flex-col items-center gap-3 w-full">
                <input
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your answer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B3E] focus:border-transparent"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
                <div className="flex gap-2 justify-center w-full">
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

                  <button
                    onClick={handleSkip}
                    className="px-6 py-3 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg ${
              feedbackType === 'correct'
                ? 'bg-green-100 text-green-800'
                : feedbackType === 'incorrect'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' && <CheckCircle className="h-6 w-6 text-green-600" />}
                {feedbackType === 'incorrect' && <XCircle className="h-6 w-6 text-red-600" />}
                {feedbackType === 'skipped' && <span className="text-lg font-semibold">Skipped</span>}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Correct!' : feedbackType === 'incorrect' ? 'Incorrect!' : 'Question Skipped'}
                </div>
              </div>
              {currentEquation && feedbackType !== 'skipped' && (
                <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {feedbackType === 'correct'
                    ? `Excellent! The answer is ${currentEquation.answer}.`
                    : `Incorrect. You answered ${userInput}. The correct answer is ${currentEquation.answer}.`
                  }
                </div>
              )}
              {feedbackType === 'skipped' && (
                <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {`Time penalty applied: ${skipPenaltyByDifficulty[difficulty] ?? 5}s`}
                </div>
              )}
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
      {/* Lightweight local styles for animations */}
      <style>{`
        .pop-in { animation: popIn 300ms ease-out; }
        .shake { animation: shakeX 400ms ease-in-out; }
        .flash-correct { box-shadow: 0 0 0 4px rgba(34,197,94,0.25); }
        .confetti-piece { position: absolute; top: 0; border-radius: 2px; display: inline-block; animation-name: confettiFall; animation-timing-function: ease-out; animation-fill-mode: forwards; }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes shakeX { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px);} 30%, 50%, 70% { transform: translateX(-6px);} 40%, 60% { transform: translateX(6px);} }
        @keyframes confettiFall { from { transform: translateY(-10px) rotate(0deg); opacity: 1; } to { transform: translateY(120px) rotate(240deg); opacity: 0; } }
      `}</style>
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
      />
    </div>
  );
};

export default MathDeductionGame;
