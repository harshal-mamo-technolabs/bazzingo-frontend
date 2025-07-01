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
            { sequence: [10, 20, 30, 40], answer: 50, rule: 'Add 10' }
          ],
          Moderate: [
            { sequence: [1, 4, 9, 16], answer: 25, rule: 'Square numbers' },
            { sequence: [2, 6, 18, 54], answer: 162, rule: 'Multiply by 3' },
            { sequence: [1, 1, 2, 3, 5], answer: 8, rule: 'Fibonacci' },
            { sequence: [3, 6, 12, 24], answer: 48, rule: 'Multiply by 2' }
          ],
          Hard: [
            { sequence: [1, 8, 27, 64], answer: 125, rule: 'Cube numbers' },
            { sequence: [2, 3, 5, 8, 13], answer: 21, rule: 'Fibonacci starting with 2,3' },
            { sequence: [1, 4, 13, 40], answer: 121, rule: '3n+1 pattern' },
            { sequence: [2, 8, 32, 128], answer: 512, rule: 'Multiply by 4' }
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
              options: ["animal", "dog", "bird", "fish"]
            },
            {
              question: "If it's raining, then the ground is wet. The ground is wet. Is it raining?",
              answer: "maybe",
              options: ["yes", "no", "maybe", "unknown"]
            }
          ],
          Moderate: [
            {
              question: "A farmer has 17 sheep. All but 9 die. How many are left?",
              answer: "9",
              options: ["8", "9", "10", "17"]
            },
            {
              question: "If A > B and B > C, then A __ C",
              answer: ">",
              options: [">", "<", "=", "≠"]
            }
          ],
          Hard: [
            {
              question: "In a race, you overtake the person in 2nd place. What position are you in?",
              answer: "2nd",
              options: ["1st", "2nd", "3rd", "4th"]
            },
            {
              question: "If some X are Y, and all Y are Z, then some X are definitely:",
              answer: "Z",
              options: ["Z", "not Z", "X", "Y"]
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
    Easy: { timeLimit: 60, pointsPerSolve: 20 },
    Moderate: { timeLimit: 50, pointsPerSolve: 30 },
    Hard: { timeLimit: 40, pointsPerSolve: 40 }
  };

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
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setPuzzlesSolved(0);
    setPuzzlesAttempted(0);
    setCurrentRound(1);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentPuzzle(null);
    setUserAnswer('');
  }, [difficulty]);

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!currentPuzzle || !userAnswer.trim()) return;

    setPuzzlesAttempted(prev => prev + 1);

    const isCorrect = userAnswer.toLowerCase().trim() ===
      currentPuzzle.answer.toString().toLowerCase().trim();

    if (isCorrect) {
      setPuzzlesSolved(prev => prev + 1);
    }

    // Generate next puzzle after delay
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      generateNewPuzzle();
    }, 1500);
  };

  // Handle option selection (for multiple choice)
  const handleOptionSelect = (option) => {
    setUserAnswer(option);

    setTimeout(() => {
      handleSubmitAnswer();
    }, 100);
  };

  // Calculate score
  useEffect(() => {
    if (puzzlesAttempted > 0) {
      const settings = difficultySettings[difficulty];
      const baseScore = puzzlesSolved * settings.pointsPerSolve;
      const timeBonus = timeRemaining * 0.5;

      const newScore = Math.min(200, baseScore + timeBonus);
      setScore(Math.max(0, newScore));
    }
  }, [puzzlesSolved, puzzlesAttempted, timeRemaining, difficulty]);

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
    generateNewPuzzle();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    puzzlesSolved,
    puzzlesAttempted,
    currentRound
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Logic Puzzle"
        gameDescription="Solve various logic problems and number sequences!"
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
                Solved
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesSolved}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesAttempted > 0 ? Math.round((puzzlesSolved / puzzlesAttempted) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Puzzle Display */}
          {currentPuzzle && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentPuzzle.typeName}
                  </div>

                  {currentPuzzle.type === 'sequence' && (
                    <div>
                      <div className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        What comes next in this sequence?
                      </div>
                      <div className="flex justify-center items-center gap-4 mb-4">
                        {currentPuzzle.sequence.map((num, index) => (
                          <div key={index} className="w-12 h-12 bg-white rounded border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                              {num}
                            </span>
                          </div>
                        ))}
                        <div className="w-12 h-12 bg-[#FF6B3E] rounded border-2 border-[#FF6B3E] flex items-center justify-center">
                          <span className="text-lg font-semibold text-white" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            ?
                          </span>
                        </div>
                      </div>

                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        className="w-32 px-3 py-2 border border-gray-300 rounded text-center"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      />
                    </div>
                  )}

                  {currentPuzzle.type === 'logic' && (
                    <div>
                      <div className="text-lg font-semibold text-gray-900 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {currentPuzzle.question}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {currentPuzzle.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            className="px-4 py-3 bg-white border-2 border-gray-300 rounded hover:border-[#FF6B3E] hover:bg-orange-50 transition-colors"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button for sequence puzzles */}
          {currentPuzzle && currentPuzzle.type === 'sequence' && (
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

          {/* Instructions */}
          <div className="mt-6 text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Solve as many puzzles as you can before time runs out.
              Each puzzle type tests different logical reasoning skills.
            </p>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default LogicPuzzleGame;
