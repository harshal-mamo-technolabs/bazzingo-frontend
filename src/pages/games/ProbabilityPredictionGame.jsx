import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { TrendingUp, Calculator, Lightbulb, CheckCircle, XCircle, BarChart3, Dice1 } from 'lucide-react';

const ProbabilityPredictionGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0); // Lock final score
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [correctPredictions, setCorrectPredictions] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [gameDuration, setGameDuration] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  // Game state
  const [currentScenario, setCurrentScenario] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerType, setAnswerType] = useState('percentage'); // percentage, fraction, decimal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]); // Track used questions

  // Probability scenario generators
  const generateDiceScenario = (difficulty) => {
    let scenario, correctAnswer, hint, explanation;
    
    switch (difficulty) {
      case 'Easy':
        const outcomes = [
          {
            id: 'dice_easy_1',
            question: "What's the probability of rolling a 6 on a standard die?",
            answer: 1/6,
            hint: "There's 1 favorable outcome (rolling 6) out of 6 possible outcomes",
            explanation: "P(6) = 1/6 ≈ 16.67%"
          },
          {
            id: 'dice_easy_2',
            question: "What's the probability of rolling an even number on a standard die?",
            answer: 3/6,
            hint: "Count the even numbers: 2, 4, 6. That's 3 out of 6 possible outcomes",
            explanation: "P(even) = 3/6 = 1/2 = 50%"
          },
          {
            id: 'dice_easy_3',
            question: "What's the probability of rolling a number greater than 4?",
            answer: 2/6,
            hint: "Numbers greater than 4 are: 5, 6. That's 2 out of 6 outcomes",
            explanation: "P(>4) = 2/6 = 1/3 ≈ 33.33%"
          },
          {
            id: 'dice_easy_4',
            question: "What's the probability of rolling a 1 or 2 on a standard die?",
            answer: 2/6,
            hint: "Count favorable outcomes: 1, 2. That's 2 out of 6 possible outcomes",
            explanation: "P(1 or 2) = 2/6 = 1/3 ≈ 33.33%"
          },
          {
            id: 'dice_easy_5',
            question: "What's the probability of rolling an odd number on a standard die?",
            answer: 3/6,
            hint: "Count the odd numbers: 1, 3, 5. That's 3 out of 6 possible outcomes",
            explanation: "P(odd) = 3/6 = 1/2 = 50%"
          }
        ];
        const selected = outcomes[Math.floor(Math.random() * outcomes.length)];
        return { ...selected, type: 'dice', visual: '🎲' };
        
      case 'Moderate':
        const scenarios = [
          {
            id: 'dice_mod_1',
            question: "What's the probability of rolling two 6s in a row with two dice?",
            answer: (1/6) * (1/6),
            hint: "Multiply the individual probabilities: P(6) × P(6)",
            explanation: "P(6,6) = (1/6) × (1/6) = 1/36 ≈ 2.78%"
          },
          {
            id: 'dice_mod_2',
            question: "What's the probability of getting a sum of 7 with two dice?",
            answer: 6/36,
            hint: "Count combinations that sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)",
            explanation: "P(sum=7) = 6/36 = 1/6 ≈ 16.67%"
          },
          {
            id: 'dice_mod_3',
            question: "What's the probability of rolling at least one 6 with two dice?",
            answer: 1 - (5/6) * (5/6),
            hint: "Use complement: 1 - P(no 6s) = 1 - P(not 6) × P(not 6)",
            explanation: "P(at least one 6) = 1 - (5/6)² = 1 - 25/36 = 11/36 ≈ 30.56%"
          },
          {
            id: 'dice_mod_4',
            question: "What's the probability of getting a sum of 8 with two dice?",
            answer: 5/36,
            hint: "Count combinations that sum to 8: (2,6), (3,5), (4,4), (5,3), (6,2)",
            explanation: "P(sum=8) = 5/36 ≈ 13.89%"
          }
        ];
        const selectedMod = scenarios[Math.floor(Math.random() * scenarios.length)];
        return { ...selectedMod, type: 'dice', visual: '🎲🎲' };
        
      case 'Hard':
        const hardScenarios = [
          {
            id: 'dice_hard_1',
            question: "What's the probability of rolling exactly two 6s in three dice throws?",
            answer: 3 * (1/6) * (1/6) * (5/6),
            hint: "Use binomial probability: C(3,2) × P(6)² × P(not 6)¹",
            explanation: "P(exactly 2 sixes) = 3 × (1/6)² × (5/6) = 15/216 ≈ 6.94%"
          },
          {
            id: 'dice_hard_2',
            question: "What's the probability of getting all different numbers in 3 dice rolls?",
            answer: (6/6) * (5/6) * (4/6),
            hint: "First die: any number (6/6), second: different (5/6), third: different from both (4/6)",
            explanation: "P(all different) = 1 × (5/6) × (4/6) = 20/36 ≈ 55.56%"
          }
        ];
        const selectedHard = hardScenarios[Math.floor(Math.random() * hardScenarios.length)];
        return { ...selectedHard, type: 'dice', visual: '🎲🎲🎲' };
    }
  };

  const generateCardScenario = (difficulty) => {
    let scenario, correctAnswer, hint, explanation;
    
    switch (difficulty) {
      case 'Easy':
        const cardScenarios = [
          {
            id: 'card_easy_1',
            question: "What's the probability of drawing a heart from a standard deck?",
            answer: 13/52,
            hint: "There are 13 hearts in a 52-card deck",
            explanation: "P(heart) = 13/52 = 1/4 = 25%"
          },
          {
            id: 'card_easy_2',
            question: "What's the probability of drawing an Ace?",
            answer: 4/52,
            hint: "There are 4 Aces in a standard deck",
            explanation: "P(Ace) = 4/52 = 1/13 ≈ 7.69%"
          },
          {
            id: 'card_easy_3',
            question: "What's the probability of drawing a red card?",
            answer: 26/52,
            hint: "There are 26 red cards (13 hearts + 13 diamonds) in a 52-card deck",
            explanation: "P(red) = 26/52 = 1/2 = 50%"
          }
        ];
        const selected = cardScenarios[Math.floor(Math.random() * cardScenarios.length)];
        return { ...selected, type: 'cards', visual: '🃏' };
        
      case 'Moderate':
        const modScenarios = [
          {
            id: 'card_mod_1',
            question: "What's the probability of drawing two hearts in a row (without replacement)?",
            answer: (13/52) * (12/51),
            hint: "First heart: 13/52, then second heart: 12/51 (one less heart, one less card)",
            explanation: "P(2 hearts) = (13/52) × (12/51) = 156/2652 ≈ 5.88%"
          },
          {
            id: 'card_mod_2',
            question: "What's the probability of drawing a face card (J, Q, K)?",
            answer: 12/52,
            hint: "There are 3 face cards per suit × 4 suits = 12 face cards",
            explanation: "P(face card) = 12/52 = 3/13 ≈ 23.08%"
          }
        ];
        const selectedMod = modScenarios[Math.floor(Math.random() * modScenarios.length)];
        return { ...selectedMod, type: 'cards', visual: '🃏🃏' };
        
      case 'Hard':
        const hardScenarios = [
          {
            id: 'card_hard_1',
            question: "What's the probability of getting exactly 2 Aces in a 5-card hand?",
            answer: (4 * 3 * 48 * 47 * 46) / (52 * 51 * 50 * 49 * 48) * 10,
            hint: "Use combinations: C(4,2) × C(48,3) / C(52,5)",
            explanation: "P(exactly 2 Aces) = C(4,2) × C(48,3) / C(52,5) ≈ 3.99%"
          }
        ];
        const selectedHard = hardScenarios[Math.floor(Math.random() * hardScenarios.length)];
        return { ...selectedHard, type: 'cards', visual: '🃏🃏🃏🃏🃏' };
    }
  };

  const generateCoinScenario = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        const easyScenarios = [
          {
            id: 'coin_easy_1',
            question: "What's the probability of getting heads on a fair coin flip?",
            answer: 0.5,
            hint: "A fair coin has equal chances for heads and tails",
            explanation: "P(heads) = 1/2 = 50%"
          },
          {
            id: 'coin_easy_2',
            question: "What's the probability of getting tails twice in a row?",
            answer: 0.25,
            hint: "Multiply the probabilities: P(tails) × P(tails)",
            explanation: "P(TT) = (1/2) × (1/2) = 1/4 = 25%"
          },
          {
            id: 'coin_easy_3',
            question: "What's the probability of getting heads twice in a row?",
            answer: 0.25,
            hint: "Multiply the probabilities: P(heads) × P(heads)",
            explanation: "P(HH) = (1/2) × (1/2) = 1/4 = 25%"
          }
        ];
        const selected = easyScenarios[Math.floor(Math.random() * easyScenarios.length)];
        return { ...selected, type: 'coin', visual: '🪙' };
        
      case 'Moderate':
        const modScenarios = [
          {
            id: 'coin_mod_1',
            question: "What's the probability of getting exactly 2 heads in 3 coin flips?",
            answer: 3/8,
            hint: "Count favorable outcomes: HHT, HTH, THH. That's 3 out of 8 total outcomes",
            explanation: "P(exactly 2H) = C(3,2) × (1/2)³ = 3/8 = 37.5%"
          },
          {
            id: 'coin_mod_2',
            question: "What's the probability of getting at least 1 head in 3 flips?",
            answer: 7/8,
            hint: "Use complement: 1 - P(all tails) = 1 - (1/2)³",
            explanation: "P(at least 1H) = 1 - (1/2)³ = 1 - 1/8 = 7/8 = 87.5%"
          }
        ];
        const selectedMod = modScenarios[Math.floor(Math.random() * modScenarios.length)];
        return { ...selectedMod, type: 'coin', visual: '🪙🪙🪙' };
        
      case 'Hard':
        const hardScenarios = [
          {
            id: 'coin_hard_1',
            question: "What's the probability of getting exactly 3 heads in 5 coin flips?",
            answer: 10/32,
            hint: "Use binomial: C(5,3) × (1/2)⁵",
            explanation: "P(exactly 3H) = C(5,3) × (1/2)⁵ = 10 × (1/32) = 10/32 = 31.25%"
          }
        ];
        const selectedHard = hardScenarios[Math.floor(Math.random() * hardScenarios.length)];
        return { ...selectedHard, type: 'coin', visual: '🪙🪙🪙🪙🪙' };
    }
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 120, lives: 5, hints: 3, tolerance: 0.02 },
    Moderate: { timeLimit: 100, lives: 4, hints: 2, tolerance: 0.015 },
    Hard: { timeLimit: 80, lives: 3, hints: 1, tolerance: 0.01 }
  };

  // Generate new scenario with duplicate prevention
  const generateNewScenario = useCallback(() => {
    const scenarioTypes = ['dice', 'cards', 'coin'];
    let allScenarios = [];
    
    // Collect all scenarios for current difficulty
    scenarioTypes.forEach(type => {
      let scenarios;
      switch (type) {
        case 'dice':
          scenarios = generateDiceScenario(difficulty);
          break;
        case 'cards':
          scenarios = generateCardScenario(difficulty);
          break;
        case 'coin':
          scenarios = generateCoinScenario(difficulty);
          break;
      }
      if (scenarios) allScenarios.push(scenarios);
    });
    
    // Filter out recently used questions
    const availableScenarios = allScenarios.filter(scenario => 
      !usedQuestions.includes(scenario.id)
    );
    
    // If all questions have been used, reset the used questions list
    if (availableScenarios.length === 0) {
      setUsedQuestions([]);
      const scenario = allScenarios[Math.floor(Math.random() * allScenarios.length)];
      setUsedQuestions([scenario.id]);
      setCurrentScenario(scenario);
    } else {
      const scenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
      setUsedQuestions(prev => [...prev.slice(-4), scenario.id]); // Keep last 5 questions
      setCurrentScenario(scenario);
    }
    
    setUserAnswer('');
    setShowFeedback(false);
    setShowHint(false);
    setQuestionStartTime(Date.now());
  }, [difficulty, usedQuestions]);

  // Calculate score - only during active gameplay
  const calculateScore = useCallback(() => {
    if (totalQuestions === 0 || gameState !== 'playing') return score;
    
    const settings = difficultySettings[difficulty];
    const accuracyRate = correctPredictions / totalQuestions;
    const avgResponseTime = totalResponseTime / totalQuestions / 1000;
    
    // Base score from accuracy (0-85 points)
    let baseScore = accuracyRate * 85;
    
    // Time bonus (max 25 points)
    const idealTime = difficulty === 'Easy' ? 15 : difficulty === 'Moderate' ? 20 : 25;
    const timeBonus = Math.max(0, Math.min(25, (idealTime - avgResponseTime) * 2));
    
    // Streak bonus (max 30 points)
    const streakBonus = Math.min(maxStreak * 2.5, 30);
    
    // Level progression bonus (max 20 points)
    const levelBonus = Math.min(currentLevel * 1.2, 20);
    
    // Lives bonus (max 15 points)
    const livesBonus = (lives / settings.lives) * 15;
    
    // Hints penalty (subtract up to 15 points)
    const hintsPenalty = (hintsUsed / settings.hints) * 15;
    
    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;
    
    // Time remaining bonus (max 15 points)
    const timeRemainingBonus = Math.min(15, (timeRemaining / settings.timeLimit) * 15);
    
    let finalScore = (baseScore + timeBonus + streakBonus + levelBonus + livesBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;
    
    // Apply final modifier to make 200 very challenging
    finalScore = finalScore * 0.83;
    
    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [correctPredictions, totalQuestions, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty, gameState, score]);

  // Update score only during active gameplay
  useEffect(() => {
    if (gameState === 'playing') {
      const newScore = calculateScore();
      setScore(newScore);
    }
  }, [calculateScore, gameState]);

  // Handle answer submission
const handleSubmit = useCallback(() => {
  if (gameState !== 'playing' || showFeedback || !currentScenario) return;

  // ✅ Check for blank input
  if (!userAnswer.trim()) {
    return;
  }

  const userValueRaw = parseFloat(userAnswer);
  if (isNaN(userValueRaw)) {
    return;
  }

  const userValue = userValueRaw / 100; // Convert percentage to decimal
  const correctValue = currentScenario.answer;
  const tolerance = difficultySettings[difficulty].tolerance;

  setShowFeedback(true);
  setTotalQuestions(prev => prev + 1);
  setTotalResponseTime(prev => prev + (Date.now() - questionStartTime));

  // Check if answer is within tolerance
  const isCorrect = Math.abs(userValue - correctValue) <= tolerance;

  if (isCorrect) {
    setFeedbackType('correct');
    setCorrectPredictions(prev => prev + 1);
    setStreak(prev => {
      const newStreak = prev + 1;
      setMaxStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
    setCurrentLevel(prev => prev + 1);

    setTimeout(() => {
      generateNewScenario();
    }, 2500);
  } else {
    setFeedbackType('incorrect');
    setStreak(0);
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        setFinalScore(score); // Lock the final score
        setGameState('finished');
        setShowCompletionModal(true);
      }
      return newLives;
    });

    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  }
}, [gameState, showFeedback, currentScenario, userAnswer, questionStartTime, difficulty, generateNewScenario, gameStartTime, score]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentScenario) return;
    
    setHintsUsed(prev => prev + 1);
    setHintMessage(currentScenario.hint);
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
            const endTime = Date.now();
            const duration = Math.floor((endTime - gameStartTime) / 1000);
            setGameDuration(duration);
            setFinalScore(score); // Lock the final score
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, gameStartTime, score]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentLevel(1);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setCorrectPredictions(0);
    setTotalQuestions(0);
    setTotalResponseTime(0);
    setUsedQuestions([]);
    setGameDuration(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
    generateNewScenario();
  };

  const handleReset = () => {
    initializeGame();
    setCurrentScenario(null);
    setUserAnswer('');
    setShowFeedback(false);
    setShowHint(false);
    setShowCompletionModal(false);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  // Prevent difficulty change during gameplay or when game is finished
  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') {
      setDifficulty(newDifficulty);
    }
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    lives,
    hintsUsed,
    correctPredictions,
    totalQuestions,
    averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      
      <GameFramework
        gameTitle="Probability Prediction"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                How to Play Probability Prediction
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Calculate and predict probabilities for various scenarios involving dice, cards, coins, and real-world events.
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎲 Scenario Types
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• <strong>Dice:</strong> Single and multiple rolls</li>
                    <li>• <strong>Cards:</strong> Drawing from standard deck</li>
                    <li>• <strong>Coins:</strong> Flip sequences and patterns</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    📊 Scoring
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Accuracy within tolerance range</li>
                    <li>• Speed bonuses for quick calculations</li>
                    <li>• Streak multipliers for consistency</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    💡 Strategy
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Use fundamental probability rules</li>
                    <li>• Apply combinatorics for complex scenarios</li>
                    <li>• Consider conditional probabilities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Numerical Reasoning"
        gameState={gameState}
        setGameState={setGameState}
        score={gameState === 'finished' ? finalScore : score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={handleDifficultyChange}
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
                {totalQuestions > 0 ? Math.round((correctPredictions / totalQuestions) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Scenario Display */}
          {currentScenario && (
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{currentScenario.visual}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentScenario.question}
              </h3>
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
          {currentScenario && !showFeedback && (
            <div className="w-full max-w-md mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter probability"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B3E] focus:border-transparent"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    userAnswer.trim()
                      ? 'bg-[#FF6B3E] text-white hover:bg-[#e55a35]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <Calculator className="h-5 w-5" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Enter your answer as a percentage (e.g., 25 for 25%)
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentScenario && (
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
              <div className="text-sm mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackType === 'correct'
                  ? `Great job! You calculated the probability correctly.`
                  : `Your answer: ${userAnswer}% is incorrect`
                }
              </div>
              {/*<div className="text-xs text-gray-600 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentScenario.explanation}
              </div>*/}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Calculate the probability for each scenario and enter your answer as a percentage. 
              Use fundamental probability rules, combinations, and statistical reasoning.
              Press Enter or click the calculator button to submit.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: ±{difficultySettings[difficulty].tolerance * 100}% tolerance | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints
            </div>
          </div>
        </div>
      </GameFramework>
      
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
        difficulty={difficulty}
        duration={gameDuration}
        customStats={{
          correctAnswers: correctPredictions,
          totalQuestions: totalQuestions
        }}
      />
    </div>
  );
};

export default ProbabilityPredictionGame;