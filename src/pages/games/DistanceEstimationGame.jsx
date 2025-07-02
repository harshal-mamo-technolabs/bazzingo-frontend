import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const DistanceEstimationGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [difficulty, setDifficulty] = useState('medium');

  // Test state
  const [currentPart, setCurrentPart] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions] = useState(20);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      timeLimit: 420,
      complexity: 'Easy',
      description: 'Larger objects, clearer distances, more time per question'
    },
    medium: {
      timeLimit: 300,
      complexity: 'Medium',
      description: 'Standard object sizes and distances'
    },
    hard: {
      timeLimit: 240,
      complexity: 'Hard',
      description: 'Smaller objects, subtle distance differences, time pressure'
    }
  };

  // Object types for the test
  const objectTypes = [
    { name: 'circle', color: '#3B82F6', shape: 'circle' },
    { name: 'square', color: '#10B981', shape: 'square' },
    { name: 'triangle', color: '#F59E0B', shape: 'triangle' },
    { name: 'diamond', color: '#8B5CF6', shape: 'diamond' },
    { name: 'star', color: '#EF4444', shape: 'star' },
    { name: 'hexagon', color: '#6B7280', shape: 'hexagon' }
  ];

  // Generate random position with depth perception
  const generatePosition = useCallback((minDistance = 20, maxDistance = 80) => {
    const distance = minDistance + Math.random() * (maxDistance - minDistance);
    const angle = Math.random() * 2 * Math.PI;
    const x = 50 + (distance * Math.cos(angle)) / 2;
    const y = 50 + (distance * Math.sin(angle)) / 2;
    const size = Math.max(15, 40 - distance * 0.3); // Smaller objects appear farther

    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
      distance,
      size,
      depth: distance
    };
  }, []);

  // Generate task based on current part
  const generateTask = useCallback(() => {
    const taskGenerators = {
      1: () => {
        // Part 1: Which object is farther from user
        const objects = Array.from({ length: 3 }, (_, i) => ({
          id: i,
          type: objectTypes[i % objectTypes.length],
          position: generatePosition()
        }));

        const farthestObject = objects.reduce((prev, current) =>
          current.position.distance > prev.position.distance ? current : prev
        );

        return {
          type: 'farther_from_user',
          objects,
          correctAnswer: farthestObject.id,
          question: 'Which object appears farther away from you?'
        };
      },

      2: () => {
        // Part 2: Which object is farther from pink ball
        const pinkBall = { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 };
        const objects = Array.from({ length: 3 }, (_, i) => {
          const pos = generatePosition();
          const distanceFromBall = Math.sqrt(
            Math.pow(pos.x - pinkBall.x, 2) + Math.pow(pos.y - pinkBall.y, 2)
          );
          return {
            id: i,
            type: objectTypes[i % objectTypes.length],
            position: pos,
            distanceFromBall
          };
        });

        const farthestFromBall = objects.reduce((prev, current) =>
          current.distanceFromBall > prev.distanceFromBall ? current : prev
        );

        return {
          type: 'farther_from_ball',
          objects,
          pinkBall,
          correctAnswer: farthestFromBall.id,
          question: 'Which object is farther away from the pink ball?'
        };
      },

      3: () => {
        // Part 3: Which two objects are same distance from pink ball
        const pinkBall = { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 };
        const objects = Array.from({ length: 4 }, (_, i) => {
          const pos = generatePosition();
          const distanceFromBall = Math.sqrt(
            Math.pow(pos.x - pinkBall.x, 2) + Math.pow(pos.y - pinkBall.y, 2)
          );
          return {
            id: i,
            type: objectTypes[i % objectTypes.length],
            position: pos,
            distanceFromBall
          };
        });

        // Make two objects have similar distance
        const targetDistance = objects[0].distanceFromBall;
        objects[1].distanceFromBall = targetDistance + (Math.random() - 0.5) * 2;

        return {
          type: 'same_distance_from_ball',
          objects,
          pinkBall,
          correctAnswer: [0, 1],
          question: 'Which two objects are approximately the same distance from the pink ball?'
        };
      },

      4: () => {
        // Part 4: Which object is NOT same distance from pink ball
        const pinkBall = { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 };
        const baseDistance = 25 + Math.random() * 20;
        const objects = Array.from({ length: 4 }, (_, i) => {
          const pos = generatePosition();
          const distanceFromBall = i === 3 ? baseDistance * 1.5 : baseDistance + (Math.random() - 0.5) * 3;
          return {
            id: i,
            type: objectTypes[i % objectTypes.length],
            position: pos,
            distanceFromBall
          };
        });

        return {
          type: 'different_distance_from_ball',
          objects,
          pinkBall,
          correctAnswer: 3,
          question: 'Which object is NOT at the same distance from the pink ball as the others?'
        };
      },

      5: () => {
        // Part 5: Which arrangement is different from model
        const modelArrangement = Array.from({ length: 3 }, (_, i) => ({
          id: i,
          type: objectTypes[i],
          position: generatePosition()
        }));

        const arrangements = Array.from({ length: 4 }, (_, arrIndex) => {
          if (arrIndex === 0) return modelArrangement;

          // Create variations
          return modelArrangement.map((obj, i) => ({
            ...obj,
            position: arrIndex === 2 ?
              { ...obj.position, x: obj.position.x + 10 } : // Different arrangement
              obj.position
          }));
        });

        return {
          type: 'different_arrangement',
          modelArrangement,
          arrangements,
          correctAnswer: 2,
          question: 'Which arrangement is spatially different from the model?'
        };
      }
    };

    return taskGenerators[currentPart]();
  }, [currentPart, generatePosition]);

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
  }, [difficulty]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer) => {
    if (!currentTask || !questionStartTime || showFeedback) return;

    const reactionTime = Date.now() - questionStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setSelectedAnswer(answer);

    let isCorrect = false;
    if (Array.isArray(currentTask.correctAnswer)) {
      isCorrect = Array.isArray(answer) &&
        answer.length === currentTask.correctAnswer.length &&
        answer.every(a => currentTask.correctAnswer.includes(a));
    } else {
      isCorrect = answer === currentTask.correctAnswer;
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + Math.max(10, 50 - Math.floor(reactionTime / 100)));
    }

    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      if (currentQuestion + 1 >= totalQuestions) {
        if (currentPart < 5) {
          setCurrentPart(prev => prev + 1);
          setCurrentQuestion(0);
        } else {
          setGameState('completed');
        }
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 1500);
  }, [currentTask, questionStartTime, showFeedback, currentQuestion, totalQuestions, currentPart]);

  // Generate new task when needed
  useEffect(() => {
    if (gameState === 'playing' && !showFeedback) {
      const task = generateTask();
      setCurrentTask(task);
      setQuestionStartTime(Date.now());
    }
  }, [gameState, currentPart, currentQuestion, showFeedback, generateTask]);

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
    console.log('Game completed:', payload);
  };

  // Custom stats
  const customStats = {
    currentPart,
    questionsCompleted: currentQuestion + (currentPart - 1) * (totalQuestions / 5),
    accuracy: currentQuestion > 0 ? Math.round((correctAnswers / currentQuestion) * 100) : 0,
    averageReactionTime: reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0,
    totalQuestions: totalQuestions,
    correctAnswers
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Distance Estimation Test"
        gameDescription="Test your spatial perception and distance judgment abilities through various visual estimation tasks"
        category="Spatial Cognition"
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
                {currentPart}/5
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
                    Question {currentQuestion + 1} of {totalQuestions / 5} in this part
                  </div>
                </div>

                {/* Task Display Area */}
                <div className="relative">
                  {currentTask.type === 'different_arrangement' ? (
                    // Part 5: Model comparison
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-700 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Model Arrangement:
                        </h4>
                        <div className="relative bg-gray-50 border-2 border-gray-300 rounded-lg mx-auto" style={{ width: '300px', height: '200px' }}>
                          {currentTask.modelArrangement.map((obj) => (
                            <div
                              key={obj.id}
                              className="absolute rounded-full"
                              style={{
                                left: `${obj.position.x}%`,
                                top: `${obj.position.y}%`,
                                width: `${obj.position.size}px`,
                                height: `${obj.position.size}px`,
                                backgroundColor: obj.type.color,
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <h4 className="font-semibold text-gray-700 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Choose the different arrangement:
                        </h4>
                        <div className="grid grid-cols-2 gap-4 justify-center">
                          {currentTask.arrangements.slice(1).map((arrangement, index) => (
                            <button
                              key={index}
                              onClick={() => handleAnswerSelect(index + 1)}
                              disabled={showFeedback}
                              className={`relative bg-gray-50 border-2 rounded-lg hover:border-blue-500 transition-colors mx-auto ${selectedAnswer === index + 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                              style={{ width: '200px', height: '150px' }}
                            >
                              {arrangement.map((obj) => (
                                <div
                                  key={obj.id}
                                  className="absolute rounded-full"
                                  style={{
                                    left: `${obj.position.x}%`,
                                    top: `${obj.position.y}%`,
                                    width: `${obj.position.size * 0.7}px`,
                                    height: `${obj.position.size * 0.7}px`,
                                    backgroundColor: obj.type.color,
                                    transform: 'translate(-50%, -50%)'
                                  }}
                                />
                              ))}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Parts 1-4: Single scene with objects
                    <div className="relative bg-gray-50 border-2 border-gray-300 rounded-lg mx-auto" style={{ width: '100%', maxWidth: '600px', height: '400px' }}>
                      {/* Pink ball for parts 2-4 */}
                      {currentTask.pinkBall && (
                        <div
                          className="absolute rounded-full bg-pink-500"
                          style={{
                            left: `${currentTask.pinkBall.x}%`,
                            top: `${currentTask.pinkBall.y}%`,
                            width: '20px',
                            height: '20px',
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
                          }}
                        />
                      )}

                      {/* Objects */}
                      {currentTask.objects.map((obj) => (
                        <button
                          key={obj.id}
                          onClick={() => {
                            if (currentTask.type === 'same_distance_from_ball') {
                              // Multi-select for part 3
                              const newSelection = selectedAnswer ? [...selectedAnswer] : [];
                              if (newSelection.includes(obj.id)) {
                                newSelection.splice(newSelection.indexOf(obj.id), 1);
                              } else if (newSelection.length < 2) {
                                newSelection.push(obj.id);
                              }
                              setSelectedAnswer(newSelection);
                              if (newSelection.length === 2) {
                                handleAnswerSelect(newSelection);
                              }
                            } else {
                              handleAnswerSelect(obj.id);
                            }
                          }}
                          disabled={showFeedback}
                          className={`absolute rounded-full transition-all duration-200 hover:scale-110 ${(Array.isArray(selectedAnswer) ? selectedAnswer.includes(obj.id) : selectedAnswer === obj.id)
                            ? 'ring-4 ring-blue-500 scale-110' : ''
                            }`}
                          style={{
                            left: `${obj.position.x}%`,
                            top: `${obj.position.y}%`,
                            width: `${obj.position.size}px`,
                            height: `${obj.position.size}px`,
                            backgroundColor: obj.type.color,
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className="mt-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${(Array.isArray(currentTask.correctAnswer)
                      ? Array.isArray(selectedAnswer) && selectedAnswer.length === currentTask.correctAnswer.length && selectedAnswer.every(a => currentTask.correctAnswer.includes(a))
                      : selectedAnswer === currentTask.correctAnswer)
                      ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {(Array.isArray(currentTask.correctAnswer)
                          ? Array.isArray(selectedAnswer) && selectedAnswer.length === currentTask.correctAnswer.length && selectedAnswer.every(a => currentTask.correctAnswer.includes(a))
                          : selectedAnswer === currentTask.correctAnswer) ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className="font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {(Array.isArray(currentTask.correctAnswer)
                          ? Array.isArray(selectedAnswer) && selectedAnswer.length === currentTask.correctAnswer.length && selectedAnswer.every(a => currentTask.correctAnswer.includes(a))
                          : selectedAnswer === currentTask.correctAnswer) ? 'Correct!' : 'Incorrect'}
                      </span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready' ? 'Ready to Test Distance Estimation' : 'Test Complete'}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready'
                    ? 'Test your spatial perception through 5 different distance estimation tasks'
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
                  Distance Estimation Test Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your spatial perception through 5 progressive distance estimation tasks
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Part 1: Distance from User
                  </h4>
                  <p className="text-sm text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Identify which object appears farther away from your viewpoint
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Part 2: Distance from Ball
                  </h4>
                  <p className="text-sm text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Determine which object is farther from the pink reference ball
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Part 3: Equal Distances
                  </h4>
                  <p className="text-sm text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Select two objects at approximately the same distance from the pink ball
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-yellow-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Part 4: Different Distance
                  </h4>
                  <p className="text-sm text-yellow-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Identify the object that is NOT at the same distance as the others
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200 md:col-span-2 lg:col-span-1">
                  <h4 className="font-bold text-red-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Part 5: Spatial Arrangement
                  </h4>
                  <p className="text-sm text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Compare arrangements and find the one that differs from the model
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Click on objects to select your answers • Use visual cues like size and position to judge distances
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: Objects that appear smaller are typically farther away. Pay attention to relative positioning and depth cues.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default DistanceEstimationGame;
