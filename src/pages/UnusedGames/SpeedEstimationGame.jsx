import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const SpeedEstimationGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [difficulty, setDifficulty] = useState('medium');

  // Test state
  const [currentPart, setCurrentPart] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions] = useState(16);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStartTime, setAnimationStartTime] = useState(null);

  // Animation refs
  const animationRef = useRef(null);
  const ballsRef = useRef([]);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      timeLimit: 420,
      speedRange: [1, 3],
      complexity: 'Easy',
      description: 'Slower speeds, clearer differences, more observation time'
    },
    medium: {
      timeLimit: 300,
      speedRange: [1.5, 4],
      complexity: 'Medium',
      description: 'Standard speeds and observation time'
    },
    hard: {
      timeLimit: 240,
      speedRange: [2, 5],
      complexity: 'Hard',
      description: 'Faster speeds, subtle differences, time pressure'
    }
  };

  // Ball colors for identification
  const ballColors = [
    { name: 'blue', color: '#3B82F6' },
    { name: 'green', color: '#10B981' },
    { name: 'red', color: '#EF4444' },
    { name: 'yellow', color: '#F59E0B' },
    { name: 'purple', color: '#8B5CF6' },
    { name: 'orange', color: '#F97316' }
  ];

  // Generate random speed within range
  const generateSpeed = useCallback(() => {
    const range = difficultySettings[difficulty].speedRange;
    return range[0] + Math.random() * (range[1] - range[0]);
  }, [difficulty]);

  // Generate task based on current part
  const generateTask = useCallback(() => {
    const taskGenerators = {
      1: () => {
        // Part 1: Which of two balls moves faster
        const speeds = [generateSpeed(), generateSpeed()];
        while (Math.abs(speeds[0] - speeds[1]) < 0.5) {
          speeds[1] = generateSpeed();
        }

        const balls = speeds.map((speed, index) => ({
          id: index,
          color: ballColors[index],
          speed,
          position: { x: 10, y: 30 + index * 40 },
          direction: 1,
          path: 'horizontal'
        }));

        const fasterBall = speeds[0] > speeds[1] ? 0 : 1;

        return {
          type: 'faster_of_two',
          balls,
          correctAnswer: fasterBall,
          question: 'Which ball moves faster?',
          animationDuration: 3000
        };
      },

      2: () => {
        // Part 2: Which of three balls moves faster
        const speeds = [generateSpeed(), generateSpeed(), generateSpeed()];
        const balls = speeds.map((speed, index) => ({
          id: index,
          color: ballColors[index],
          speed,
          position: { x: 10, y: 20 + index * 30 },
          direction: 1,
          path: 'horizontal'
        }));

        const fasterBall = speeds.indexOf(Math.max(...speeds));

        return {
          type: 'faster_of_three',
          balls,
          correctAnswer: fasterBall,
          question: 'Which ball moves fastest?',
          animationDuration: 3000
        };
      },

      3: () => {
        // Part 3: Which ball moves twice as fast as the red one
        const redSpeed = generateSpeed();
        const speeds = [
          redSpeed * 2 + (Math.random() - 0.5) * 0.3, // Close to 2x
          redSpeed * 1.5 + (Math.random() - 0.5) * 0.3, // 1.5x
          redSpeed, // Red ball (reference)
          redSpeed * 0.8 + (Math.random() - 0.5) * 0.3 // 0.8x
        ];

        const balls = speeds.map((speed, index) => ({
          id: index,
          color: index === 2 ? ballColors[2] : ballColors[index > 2 ? index + 1 : index],
          speed,
          position: { x: 10, y: 15 + index * 22 },
          direction: 1,
          path: 'horizontal'
        }));

        return {
          type: 'twice_as_fast',
          balls,
          correctAnswer: 0,
          question: 'Which ball moves approximately twice as fast as the red ball?',
          animationDuration: 4000
        };
      },

      4: () => {
        // Part 4: Which ball will arrive first at the finish line
        const paths = [
          { length: 80, complexity: 1 }, // Straight
          { length: 90, complexity: 1.2 }, // Slightly curved
          { length: 85, complexity: 1.1 }, // Medium curve
          { length: 95, complexity: 1.3 } // Most curved
        ];

        const balls = paths.map((path, index) => {
          const speed = generateSpeed();
          const arrivalTime = (path.length * path.complexity) / speed;

          return {
            id: index,
            color: ballColors[index],
            speed,
            position: { x: 10, y: 15 + index * 22 },
            direction: 1,
            path: 'curved',
            pathData: path,
            arrivalTime
          };
        });

        const firstToArrive = balls.reduce((prev, current) =>
          current.arrivalTime < prev.arrivalTime ? current : prev
        );

        return {
          type: 'first_to_arrive',
          balls,
          correctAnswer: firstToArrive.id,
          question: 'Which ball will reach the finish line first?',
          animationDuration: 5000
        };
      }
    };

    return taskGenerators[currentPart]();
  }, [currentPart, generateSpeed]);

  // Animate balls
  const animateBalls = useCallback(() => {
    if (!currentTask || !isAnimating || !animationStartTime) return;

    const elapsed = Date.now() - animationStartTime;
    const progress = Math.min(elapsed / currentTask.animationDuration, 1);

    ballsRef.current.forEach((ballElement, index) => {
      if (!ballElement || !currentTask.balls[index]) return;

      const ball = currentTask.balls[index];
      let newX = ball.position.x;

      if (ball.path === 'horizontal') {
        newX = 10 + (progress * ball.speed * 15);
      } else if (ball.path === 'curved') {
        newX = 10 + (progress * ball.speed * 12);
      }

      // Keep balls within bounds
      newX = Math.min(85, newX);

      ballElement.style.left = `${newX}%`;
    });

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateBalls);
    } else {
      setIsAnimating(false);
    }
  }, [currentTask, isAnimating, animationStartTime]);

  // Start animation
  const startAnimation = useCallback(() => {
    if (!currentTask) return;

    setIsAnimating(true);
    setAnimationStartTime(Date.now());
    setQuestionStartTime(Date.now());

    // Reset ball positions
    ballsRef.current.forEach((ballElement, index) => {
      if (ballElement && currentTask.balls[index]) {
        ballElement.style.left = '10%';
      }
    });

    animationRef.current = requestAnimationFrame(animateBalls);
  }, [currentTask, animateBalls]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setCurrentPart(1);
    setCurrentQuestion(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setReactionTimes([]);
    setCurrentTask(null);
    setIsAnimating(false);
    setAnimationStartTime(null);
  }, [difficulty]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer) => {
    if (!currentTask || !questionStartTime || showFeedback) return;

    const reactionTime = Date.now() - questionStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setSelectedAnswer(answer);

    const isCorrect = answer === currentTask.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + Math.max(10, 50 - Math.floor(reactionTime / 100)));
    }

    setShowFeedback(true);
    setIsAnimating(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      if (currentQuestion + 1 >= totalQuestions) {
        if (currentPart < 4) {
          setCurrentPart(prev => prev + 1);
          setCurrentQuestion(0);
        } else {
          setGameState('completed');
        }
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 2000);
  }, [currentTask, questionStartTime, showFeedback, currentQuestion, totalQuestions, currentPart]);

  // Generate new task when needed
  useEffect(() => {
    if (gameState === 'playing' && !showFeedback) {
      const task = generateTask();
      setCurrentTask(task);

      // Start animation after a brief delay
      setTimeout(() => {
        startAnimation();
      }, 1000);
    }
  }, [gameState, currentPart, currentQuestion, showFeedback, generateTask, startAnimation]);

  // Cleanup animation
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('completed');
    }
  }, [gameState, timeRemaining]);

  // Game handlers
  const handleStart = () => {
    setGameState('playing');
  };

  const handleReset = () => {
    setGameState('ready');
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  // Custom stats
  const customStats = {
    currentPart,
    questionsCompleted: currentQuestion + (currentPart - 1) * (totalQuestions / 4),
    accuracy: currentQuestion > 0 ? Math.round((correctAnswers / currentQuestion) * 100) : 0,
    averageReactionTime: reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0,
    totalQuestions: totalQuestions,
    correctAnswers
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Speed Estimation Test"
        gameDescription="Test your ability to perceive and compare the speed of moving objects"
        category="Perceptual Speed"
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
          {/* Professional Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-5xl">
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CURRENT PART
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentPart}/4
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                PROGRESS
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.questionsCompleted}/{totalQuestions}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ACCURACY
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.accuracy}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                REACTION TIME
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.averageReactionTime}ms
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CORRECT
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctAnswers}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="w-full max-w-6xl mb-6 sm:mb-8">
            {currentTask && gameState === 'playing' && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                {/* Question Header */}
                <div className="text-center mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Part {currentPart}: {currentTask.question}
                  </h3>
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Question {currentQuestion + 1} of {totalQuestions / 4} in this part
                  </div>
                </div>

                {/* Animation Area */}
                <div className="relative bg-gray-50 border-2 border-gray-300 rounded-lg mx-auto mb-6" style={{ width: '100%', maxWidth: '700px', height: '300px' }}>
                  {/* Finish line for part 4 */}
                  {currentTask.type === 'first_to_arrive' && (
                    <div className="absolute right-4 top-0 bottom-0 w-1 bg-red-500 flex items-center">
                      <div className="absolute -right-8 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        FINISH
                      </div>
                    </div>
                  )}

                  {/* Moving balls */}
                  {currentTask.balls.map((ball, index) => (
                    <div
                      key={ball.id}
                      ref={el => ballsRef.current[index] = el}
                      className="absolute w-6 h-6 rounded-full transition-all duration-100"
                      style={{
                        backgroundColor: ball.color.color,
                        left: '10%',
                        top: `${ball.position.y}%`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 10
                      }}
                    />
                  ))}

                  {/* Animation status */}
                  <div className="absolute top-4 left-4 bg-white/90 rounded-lg px-3 py-2">
                    <div className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {isAnimating ? 'Observing...' : showFeedback ? 'Complete' : 'Ready'}
                    </div>
                  </div>
                </div>

                {/* Ball Selection Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {currentTask.balls.map((ball, index) => (
                    <button
                      key={ball.id}
                      onClick={() => handleAnswerSelect(ball.id)}
                      disabled={isAnimating || showFeedback}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${selectedAnswer === ball.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        } ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}`}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: ball.color.color }}
                      />
                      <span className="font-semibold text-gray-700 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {ball.color.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Animation Controls */}
                {!isAnimating && !showFeedback && (
                  <div className="text-center mb-4">
                    <button
                      onClick={startAnimation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Start Animation
                    </button>
                  </div>
                )}

                {/* Feedback */}
                {showFeedback && (
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${selectedAnswer === currentTask.correctAnswer
                      ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {selectedAnswer === currentTask.correctAnswer ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className="font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {selectedAnswer === currentTask.correctAnswer ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Correct answer: {currentTask.balls.find(b => b.id === currentTask.correctAnswer)?.color.name}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Game State Display */}
            {gameState !== 'playing' && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready' ? 'Ready to Test Speed Estimation' : 'Test Complete'}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready'
                    ? 'Test your ability to perceive and compare moving object speeds'
                    : `Final Score: ${score} points with ${customStats.accuracy}% accuracy`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Speed Estimation Test Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your perceptual speed abilities through 4 progressive speed comparison tasks
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Part 1: Two Ball Comparison
                    </h4>
                    <p className="text-sm text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Watch two balls move and identify which one moves faster
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Part 2: Three Ball Comparison
                    </h4>
                    <p className="text-sm text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Compare three moving balls and select the fastest one
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Part 3: Speed Ratio Analysis
                    </h4>
                    <p className="text-sm text-yellow-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Find the ball that moves twice as fast as the red reference ball
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Part 4: Arrival Prediction
                    </h4>
                    <p className="text-sm text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Predict which ball will reach the finish line first on different paths
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Click "Start Animation" to begin • Select the correct colored ball after observation
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: Focus on relative motion and speed differences. Consider path length in arrival prediction tasks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default SpeedEstimationGame;
