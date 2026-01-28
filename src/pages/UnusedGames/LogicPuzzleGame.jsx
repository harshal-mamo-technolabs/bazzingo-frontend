import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const LogicPuzzleGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [puzzlesAttempted, setPuzzlesAttempted] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState({ base: 0, time: 0, streak: 0, total: 0 });

  // Puzzle types and generators
  const puzzleTypes = {
    sequence: {
      name: 'Number Sequence',
      generate: (difficulty) => {
        const patterns = {
          Easy: [
            { sequence: [2, 4, 6, 8], answer: 10, rule: 'Add 2' },
            { sequence: [1, 3, 5, 7], answer: 9, rule: 'Add 2' },
            { sequence: [5, 10, 15, 20], answer: 25, rule: 'Add 5' },
            { sequence: [10, 20, 30, 40], answer: 50, rule: 'Add 10' },
            { sequence: [3, 6, 9, 12], answer: 15, rule: 'Add 3' },
            { sequence: [1, 4, 7, 10], answer: 13, rule: 'Add 3' }
          ],
          Moderate: [
            { sequence: [1, 4, 9, 16], answer: 25, rule: 'Square numbers (n²)' },
            { sequence: [2, 6, 18, 54], answer: 162, rule: 'Multiply by 3' },
            { sequence: [1, 1, 2, 3, 5], answer: 8, rule: 'Fibonacci sequence' },
            { sequence: [3, 6, 12, 24], answer: 48, rule: 'Multiply by 2' },
            { sequence: [2, 8, 18, 32], answer: 50, rule: 'n² × 2' },
            { sequence: [1, 8, 27, 64], answer: 125, rule: 'Cube numbers (n³)' }
          ],
          Hard: [
            { sequence: [1, 8, 27, 64], answer: 125, rule: 'Cube numbers (n³)' },
            { sequence: [2, 3, 5, 8, 13], answer: 21, rule: 'Fibonacci starting with 2,3' },
            { sequence: [1, 4, 13, 40], answer: 121, rule: '3n² + 1 pattern' },
            { sequence: [2, 8, 32, 128], answer: 512, rule: 'Multiply by 4' },
            { sequence: [1, 3, 7, 15, 31], answer: 63, rule: '2ⁿ - 1 pattern' },
            { sequence: [2, 6, 24, 120], answer: 720, rule: 'Factorial × n' }
          ]
        };

        const puzzles = patterns[difficulty];
        return puzzles[Math.floor(Math.random() * puzzles.length)];
      }
    },
    logic: {
      name: 'Logic Problem',
      generate: (difficulty) => {
        const problems = {
          Easy: [
            {
              question: "If all cats are animals, and Fluffy is a cat, what is Fluffy?",
              answer: "animal",
              options: ["animal", "dog", "bird", "fish"],
              explanation: "Since all cats are animals and Fluffy is a cat, Fluffy must be an animal."
            },
            {
              question: "If it's sunny, then people wear sunglasses. People are wearing sunglasses. What can we conclude?",
              answer: "maybe sunny",
              options: ["definitely sunny", "not sunny", "maybe sunny", "unknown"],
              explanation: "This is affirming the consequent - we can't be certain it's sunny just because people wear sunglasses."
            },
            {
              question: "All birds can fly. Penguins are birds. Can penguins fly?",
              answer: "no",
              options: ["yes", "no", "maybe", "unknown"],
              explanation: "This is a trick question - the premise 'all birds can fly' is actually false in reality."
            }
          ],
          Moderate: [
            {
              question: "A farmer has 17 sheep. All but 9 die. How many are left?",
              answer: "9",
              options: ["8", "9", "10", "17"],
              explanation: "'All but 9' means 9 remain alive - the rest died."
            },
            {
              question: "If A > B and B > C, then A __ C",
              answer: ">",
              options: [">", "<", "=", "≠"],
              explanation: "This is the transitive property: if A > B and B > C, then A > C."
            },
            {
              question: "Some doctors are teachers. All teachers are educated. Therefore, some doctors are:",
              answer: "educated",
              options: ["educated", "not educated", "teachers", "students"],
              explanation: "Since some doctors are teachers, and all teachers are educated, those doctors must be educated."
            }
          ],
          Hard: [
            {
              question: "In a race, you overtake the person in 2nd place. What position are you in?",
              answer: "2nd",
              options: ["1st", "2nd", "3rd", "4th"],
              explanation: "If you overtake the person in 2nd place, you take their position - 2nd place."
            },
            {
              question: "If some X are Y, and all Y are Z, then some X are definitely:",
              answer: "Z",
              options: ["Z", "not Z", "X", "Y"],
              explanation: "Since some X are Y, and all Y are Z, those X that are Y must also be Z."
            },
            {
              question: "A man lives on the 20th floor. Every day he takes the elevator down to ground floor. When he comes back, he takes the elevator to the 10th floor and walks the rest, except on rainy days when he takes it all the way up. Why?",
              answer: "he's short",
              options: ["he's short", "exercise", "broken elevator", "saves money"],
              explanation: "He's too short to reach the button for the 20th floor, except when he has an umbrella on rainy days."
            }
          ]
        };

        const puzzles = problems[difficulty];
        return puzzles[Math.floor(Math.random() * puzzles.length)];
      }
    }
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 90, basePoints: 15, multiplier: 1.0 },
    Moderate: { timeLimit: 75, basePoints: 25, multiplier: 1.5 },
    Hard: { timeLimit: 60, basePoints: 35, multiplier: 2.0 }
  };

  // Calculate score for a solved puzzle
  const calculatePuzzleScore = useCallback((isCorrect, timeWhenSolved) => {
    if (!isCorrect) return 0;

    const settings = difficultySettings[difficulty];
    const baseScore = settings.basePoints;
    
    // Time bonus: more points for solving quickly (up to 10 bonus points)
    const timeBonus = Math.min(10, Math.floor(timeWhenSolved / 10));
    
    // Streak bonus: up to 15 bonus points for consecutive correct answers
    const streakBonus = Math.min(15, streakCount * 2);
    
    // Apply difficulty multiplier
    const totalScore = Math.floor((baseScore + timeBonus + streakBonus) * settings.multiplier);
    
    return {
      base: Math.floor(baseScore * settings.multiplier),
      time: Math.floor(timeBonus * settings.multiplier),
      streak: Math.floor(streakBonus * settings.multiplier),
      total: totalScore
    };
  }, [difficulty, streakCount]);

  // Generate new puzzle
  const generateNewPuzzle = useCallback(() => {
    const puzzleTypeKeys = Object.keys(puzzleTypes);
    const randomType = puzzleTypeKeys[Math.floor(Math.random() * puzzleTypeKeys.length)];
    const puzzleGenerator = puzzleTypes[randomType];

    const puzzle = puzzleGenerator.generate(difficulty);
    setCurrentPuzzle({
      type: randomType,
      typeName: puzzleGenerator.name,
      ...puzzle
    });
    setUserAnswer('');
    setShowFeedback(false);
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setPuzzlesSolved(0);
    setPuzzlesAttempted(0);
    setCurrentRound(1);
    setScore(0);
    setStreakCount(0);
    setMaxStreak(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentPuzzle(null);
    setUserAnswer('');
    setShowFeedback(false);
    setLastAnswerCorrect(false);
    setScoreBreakdown({ base: 0, time: 0, streak: 0, total: 0 });
  }, [difficulty]);

  // Handle answer submission
  const handleSubmitAnswer = useCallback(() => {
    if (!currentPuzzle || !userAnswer.trim()) return;

    setPuzzlesAttempted(prev => prev + 1);

    const isCorrect = userAnswer.toLowerCase().trim() ===
      currentPuzzle.answer.toString().toLowerCase().trim();

    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      setPuzzlesSolved(prev => prev + 1);
      
      // Calculate and add score immediately
      const puzzleScore = calculatePuzzleScore(true, timeRemaining);
      setScore(prev => Math.min(200, prev + puzzleScore.total));
      setScoreBreakdown(puzzleScore);
      
      // Update streak
      setStreakCount(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      // Reset streak on wrong answer
      setStreakCount(0);
      setScoreBreakdown({ base: 0, time: 0, streak: 0, total: 0 });
    }

    // Generate next puzzle after feedback delay
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      generateNewPuzzle();
    }, 3000);
  }, [currentPuzzle, userAnswer, timeRemaining, calculatePuzzleScore, generateNewPuzzle]);

  // Handle option selection (for multiple choice)
  const handleOptionSelect = useCallback((option) => {
    setUserAnswer(option);
    
    // Auto-submit after short delay
    setTimeout(() => {
      if (!showFeedback) {
        handleSubmitAnswer();
      }
    }, 100);
  }, [handleSubmitAnswer, showFeedback]);

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
    setGameState('playing');
    generateNewPuzzle();
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    puzzlesSolved,
    puzzlesAttempted,
    currentRound,
    streakCount,
    maxStreak,
    accuracy: puzzlesAttempted > 0 ? Math.round((puzzlesSolved / puzzlesAttempted) * 100) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Logic Puzzle Master"
        gameDescription="Challenge your logical reasoning with number sequences and logic problems! Solve puzzles quickly to maximize your score."
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
          {/* Enhanced Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs sm:text-sm text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Round
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentRound}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-emerald-200">
              <div className="text-xs sm:text-sm text-emerald-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Solved
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesSolved}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs sm:text-sm text-purple-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesAttempted > 0 ? Math.round((puzzlesSolved / puzzlesAttempted) * 100) : 0}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-amber-200">
              <div className="text-xs sm:text-sm text-amber-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streakCount}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Max Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {maxStreak}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-gray-200">
              <div className="text-xs sm:text-sm text-gray-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Attempted
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesAttempted}
              </div>
            </div>
          </div>

          {/* Score Breakdown (shown after solving a puzzle) */}
          {showFeedback && lastAnswerCorrect && scoreBreakdown.total > 0 && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  🎉 Correct! +{scoreBreakdown.total} points
                </div>
                <div className="text-sm text-green-700 space-x-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <span>Base: +{scoreBreakdown.base}</span>
                  <span>Time: +{scoreBreakdown.time}</span>
                  <span>Streak: +{scoreBreakdown.streak}</span>
                </div>
              </div>
            </div>
          )}

          {/* Puzzle Display */}
          {currentPuzzle && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentPuzzle.typeName}
                  </div>

                  {currentPuzzle.type === 'sequence' && (
                    <div>
                      <div className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        What comes next in this sequence?
                      </div>
                      <div className="flex justify-center items-center gap-4 mb-6">
                        {currentPuzzle.sequence.map((num, index) => (
                          <div key={index} className="w-12 h-12 bg-blue-50 rounded-lg border-2 border-blue-200 flex items-center justify-center shadow-md">
                            <span className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                              {num}
                            </span>
                          </div>
                        ))}
                        <div className="text-gray-400 text-xl">→</div>
                        <div className="w-12 h-12 bg-[#FF6B3E] rounded-lg border-2 border-[#FF6B3E] flex items-center justify-center shadow-md">
                          <span className="text-lg font-semibold text-white" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            ?
                          </span>
                        </div>
                      </div>

                      {!showFeedback && (
                        <input
                          type="number"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Enter your answer"
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-center focus:border-[#FF6B3E] focus:outline-none"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                        />
                      )}
                    </div>
                  )}

                  {currentPuzzle.type === 'logic' && (
                    <div>
                      <div className="text-lg font-semibold text-gray-900 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {currentPuzzle.question}
                      </div>

                      {!showFeedback && (
                        <div className="grid grid-cols-2 gap-3">
                          {currentPuzzle.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleOptionSelect(option)}
                              className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-[#FF6B3E] hover:bg-orange-50 transition-colors font-medium"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback Display */}
                  {showFeedback && (
                    <div className={`mt-6 p-4 rounded-lg ${lastAnswerCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className={`text-lg font-semibold mb-2 ${lastAnswerCorrect ? 'text-green-800' : 'text-red-800'}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {lastAnswerCorrect ? '✅ Correct!' : '❌ Incorrect'}
                      </div>
                      <div className={`text-sm ${lastAnswerCorrect ? 'text-green-700' : 'text-red-700'}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <div className="mb-2">
                          <strong>Answer:</strong> {currentPuzzle.answer}
                        </div>
                        {currentPuzzle.rule && (
                          <div className="mb-2">
                            <strong>Rule:</strong> {currentPuzzle.rule}
                          </div>
                        )}
                        {currentPuzzle.explanation && (
                          <div>
                            <strong>Explanation:</strong> {currentPuzzle.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button for sequence puzzles */}
          {currentPuzzle && currentPuzzle.type === 'sequence' && !showFeedback && (
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${!userAnswer.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#FF6B3E] text-white hover:bg-[#e55a35]'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Submit Answer
            </button>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🧩🔢</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Logic Puzzle Master
                </h3>

                <div className="text-left space-y-6 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {/* What is this game */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">🎯 What is Logic Puzzle Master?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Logic Puzzle Master combines number sequence recognition with logical reasoning challenges. 
                      You'll solve mathematical patterns and answer logic problems that test your analytical thinking, 
                      pattern recognition, and deductive reasoning skills. Each puzzle type challenges different 
                      aspects of logical intelligence.
                    </p>
                  </div>

                  {/* How to play */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">📋 How to Play:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <strong>Number Sequences:</strong> Analyze the pattern in the given numbers and determine 
                          what comes next. Look for arithmetic, geometric, or more complex mathematical relationships.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <strong>Logic Problems:</strong> Read the scenario carefully and apply logical reasoning 
                          to select the correct answer from multiple choices.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <strong>Speed Matters:</strong> Solve puzzles quickly to earn time bonuses. Build streaks 
                          for additional points and aim for the highest score possible.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <strong>Learn & Improve:</strong> Get detailed explanations for each answer to understand 
                          the logic and improve your reasoning skills.
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
                          <li>• Basic logic problems</li>
                          <li>• 90 seconds time limit</li>
                          <li>• 15 base points per puzzle</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-100 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-900 mb-2">🟡 Moderate</h5>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Geometric & Fibonacci sequences</li>
                          <li>• Intermediate logic puzzles</li>
                          <li>• 75 seconds time limit</li>
                          <li>• 25 base points per puzzle</li>
                        </ul>
                      </div>
                      <div className="bg-red-100 rounded-lg p-4">
                        <h5 className="font-semibold text-red-900 mb-2">🔴 Hard</h5>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• Complex mathematical patterns</li>
                          <li>• Advanced logical reasoning</li>
                          <li>• 60 seconds time limit</li>
                          <li>• 35 base points per puzzle</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Scoring and tips */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">🏆 Scoring System:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-purple-900 mb-2">Point Calculation:</h5>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Base points per correct answer</li>
                          <li>• Time bonus: up to 10 points</li>
                          <li>• Streak bonus: up to 15 points</li>
                          <li>• Difficulty multiplier: 1x-2x</li>
                          <li>• Maximum score: 200 points</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-pink-900 mb-2">Pro Tips:</h5>
                        <ul className="text-sm text-pink-800 space-y-1">
                          <li>• Look for common patterns first</li>
                          <li>• Read logic problems carefully</li>
                          <li>• Build streaks for bonus points</li>
                          <li>• Balance speed with accuracy</li>
                          <li>• Learn from explanations</li>
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
                  Logic Challenge Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Final Score</div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{score}/200</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Puzzles Solved</div>
                    <div className="text-2xl font-bold text-green-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{puzzlesSolved}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Accuracy</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{customStats.accuracy}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Max Streak</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{maxStreak}</div>
                  </div>
                </div>
                <div className="space-y-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>Logic Reasoning: {customStats.accuracy > 85 ? 'Exceptional' : customStats.accuracy > 70 ? 'Advanced' : customStats.accuracy > 55 ? 'Proficient' : 'Developing'}</div>
                  <div>Total Rounds: {currentRound - 1}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GameFramework>
    </div>
  );
};

export default LogicPuzzleGame;