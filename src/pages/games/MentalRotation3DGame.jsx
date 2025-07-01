import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const MentalRotation3DGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [difficulty, setDifficulty] = useState('medium');

  // Game state
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalTrials, setTotalTrials] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [trialStartTime, setTrialStartTime] = useState(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      totalTrials: 12,
      rotationAngles: [60, 90, 120],
      timeLimit: 420,
      complexity: 'Easy',
      description: 'Simple shapes with basic rotations'
    },
    medium: {
      totalTrials: 18,
      rotationAngles: [45, 90, 135, 180],
      timeLimit: 300,
      complexity: 'Medium',
      description: 'Moderate complexity with varied rotations'
    },
    hard: {
      totalTrials: 24,
      rotationAngles: [30, 60, 90, 120, 150, 180],
      timeLimit: 240,
      complexity: 'Hard',
      description: 'Complex shapes with challenging rotations'
    }
  };

  // 3D Shape definitions (using CSS transforms to simulate 3D)
  const shapes = [
    {
      id: 'L_shape',
      name: 'L-Block',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
      ],
      color: '#3B82F6'
    },
    {
      id: 'T_shape',
      name: 'T-Block',
      blocks: [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 }
      ],
      color: '#EF4444'
    },
    {
      id: 'Z_shape',
      name: 'Z-Block',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 }
      ],
      color: '#10B981'
    },
    {
      id: 'plus_shape',
      name: 'Plus-Block',
      blocks: [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 },
        { x: 1, y: 2, z: 0 }
      ],
      color: '#F59E0B'
    },
    {
      id: 'corner_shape',
      name: 'Corner-Block',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 }
      ],
      color: '#8B5CF6'
    }
  ];

  // Generate rotation matrix for given angles
  const generateRotation = (angleX, angleY, angleZ) => {
    const radX = (angleX * Math.PI) / 180;
    const radY = (angleY * Math.PI) / 180;
    const radZ = (angleZ * Math.PI) / 180;

    return {
      rotateX: angleX,
      rotateY: angleY,
      rotateZ: angleZ,
      transform: `rotateX(${angleX}deg) rotateY(${angleY}deg) rotateZ(${angleZ}deg)`
    };
  };

  // Generate puzzle with target and options
  const generatePuzzle = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // Generate target rotation
    const targetRotation = {
      x: settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)],
      y: settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)],
      z: settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)]
    };

    // Generate options (3 incorrect + 1 correct)
    const options = [];

    // Add correct answer
    const correctOption = {
      id: 'correct',
      rotation: targetRotation,
      isCorrect: true
    };
    options.push(correctOption);

    // Add incorrect options
    for (let i = 0; i < 3; i++) {
      const incorrectRotation = {
        x: settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)],
        y: settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)],
        z: settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)]
      };

      // Ensure it's different from the correct answer
      if (incorrectRotation.x !== targetRotation.x ||
        incorrectRotation.y !== targetRotation.y ||
        incorrectRotation.z !== targetRotation.z) {
        options.push({
          id: `option_${i}`,
          rotation: incorrectRotation,
          isCorrect: false
        });
      } else {
        i--; // Try again
      }
    }

    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      shape,
      targetRotation,
      options: shuffledOptions,
      correctAnswerId: correctOption.id
    };
  }, [difficulty]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((optionId) => {
    if (showFeedback) return;

    const reactionTime = Date.now() - trialStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setSelectedAnswer(optionId);

    const isCorrect = currentPuzzle.options.find(opt => opt.id === optionId)?.isCorrect;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + Math.max(10, 50 - Math.floor(reactionTime / 100)));
    }

    setTotalTrials(prev => prev + 1);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      const settings = difficultySettings[difficulty];
      if (currentTrial + 1 >= settings.totalTrials) {
        setGameState('completed');
      } else {
        setCurrentTrial(prev => prev + 1);
        const newPuzzle = generatePuzzle();
        setCurrentPuzzle(newPuzzle);
        setTrialStartTime(Date.now());
      }
    }, 2000);
  }, [showFeedback, currentPuzzle, trialStartTime, currentTrial, difficulty, generatePuzzle]);

  // Render 3D shape
  const renderShape = (shape, rotation, size = 'medium') => {
    const blockSize = size === 'small' ? 12 : size === 'large' ? 24 : 16;
    const containerSize = blockSize * 4;

    return (
      <div
        className="relative mx-auto"
        style={{
          width: containerSize,
          height: containerSize,
          perspective: '200px',
          perspectiveOrigin: 'center center'
        }}
      >
        <div
          className="relative"
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: generateRotation(rotation.x, rotation.y, rotation.z).transform,
            transition: 'transform 0.3s ease'
          }}
        >
          {shape.blocks.map((block, index) => (
            <div
              key={index}
              className="absolute border border-gray-400"
              style={{
                width: blockSize,
                height: blockSize,
                backgroundColor: shape.color,
                left: block.x * blockSize,
                top: block.y * blockSize,
                transform: `translateZ(${block.z * blockSize}px)`,
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setCurrentTrial(0);
    setCurrentPuzzle(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCorrectAnswers(0);
    setTotalTrials(0);
    setReactionTimes([]);
    setTrialStartTime(null);
  }, [difficulty]);

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
    const newPuzzle = generatePuzzle();
    setCurrentPuzzle(newPuzzle);
    setTrialStartTime(Date.now());
  };

  const handleReset = () => {
    setGameState('ready');
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Mental Rotation 3D Game completed:', payload);
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    const accuracy = totalTrials > 0 ? Math.round((correctAnswers / totalTrials) * 100) : 0;
    const averageRT = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;

    return { accuracy, averageRT };
  };

  // Custom stats
  const metrics = calculateMetrics();
  const customStats = {
    currentTrial: currentTrial + 1,
    totalTrials: difficultySettings[difficulty].totalTrials,
    correctAnswers,
    accuracy: metrics.accuracy,
    averageRT: metrics.averageRT
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Mental Rotation 3D"
        gameDescription="Test your spatial intelligence by identifying rotated 3D objects"
        category="Spatial Reasoning"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-4xl">
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                TRIAL
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.currentTrial}/{customStats.totalTrials}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CORRECT
              </div>
              <div className="text-lg sm:text-xl font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctAnswers}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ACCURACY
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.accuracy}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                AVG TIME
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.averageRT}ms
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="w-full max-w-5xl mb-6 sm:mb-8">
            {gameState === 'playing' && currentPuzzle && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                {/* Question Header */}
                <div className="text-center mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Which object matches the target rotation?
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Study the target shape, then select the matching rotated version
                  </p>
                </div>

                {/* Target Shape */}
                <div className="mb-8">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Target Shape
                    </h4>
                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {currentPuzzle.shape.name}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-blue-300">
                      {renderShape(currentPuzzle.shape, currentPuzzle.targetRotation, 'large')}
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Select the Matching Rotation
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {currentPuzzle.options.map((option, index) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(option.id)}
                        disabled={showFeedback}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${selectedAnswer === option.id
                          ? option.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                          }`}
                      >
                        <div className="text-center mb-2">
                          <div className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Option {String.fromCharCode(65 + index)}
                          </div>
                        </div>
                        {renderShape(currentPuzzle.shape, option.rotation, 'medium')}

                        {/* Feedback Icons */}
                        {showFeedback && selectedAnswer === option.id && (
                          <div className="absolute top-2 right-2">
                            {option.isCorrect ? (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✗</span>
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className="text-center">
                    <div className={`inline-block p-4 rounded-lg ${currentPuzzle.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                      ? 'bg-green-100 border border-green-200'
                      : 'bg-red-100 border border-red-200'
                      }`}>
                      <div className="text-2xl mb-2">
                        {currentPuzzle.options.find(opt => opt.id === selectedAnswer)?.isCorrect ? '🎉' : '❌'}
                      </div>
                      <div className={`font-bold text-lg ${currentPuzzle.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                        ? 'text-green-700' : 'text-red-700'
                        }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {currentPuzzle.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                          ? 'Correct!' : 'Incorrect'}
                      </div>
                      <p className={`text-sm mt-1 ${currentPuzzle.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                        ? 'text-green-600' : 'text-red-600'
                        }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {currentPuzzle.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                          ? 'Great spatial reasoning!'
                          : 'Try to visualize the rotation more carefully'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Game State Display */}
            {gameState !== 'playing' && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🧊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready' ? 'Ready to Test Spatial Intelligence?' : 'Mental Rotation Test Complete!'}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready'
                    ? 'Identify rotated 3D objects using your spatial reasoning skills'
                    : `Final Score: ${score} points • Accuracy: ${metrics.accuracy}%`
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
                  Mental Rotation 3D Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your spatial intelligence by identifying rotated 3D objects
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600">🎯</span>
                    </div>
                    <h4 className="font-bold text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Study Target
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Examine the target 3D shape carefully</li>
                    <li>• Note its orientation and structure</li>
                    <li>• Visualize how it would look rotated</li>
                    <li>• Remember the spatial relationships</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600">🔄</span>
                    </div>
                    <h4 className="font-bold text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Mental Rotation
                    </h4>
                  </div>
                  <ul className="text-sm text-green-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Mentally rotate the target shape</li>
                    <li>• Consider rotations in X, Y, and Z axes</li>
                    <li>• Visualize the shape from different angles</li>
                    <li>• Compare with the given options</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600">✓</span>
                    </div>
                    <h4 className="font-bold text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Select Match
                    </h4>
                  </div>
                  <ul className="text-sm text-purple-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Choose the option that matches the target</li>
                    <li>• Consider all possible rotations</li>
                    <li>• Trust your spatial intuition</li>
                    <li>• Work quickly but accurately</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Spatial Intelligence Skills
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div><strong>Mental Rotation:</strong> Ability to rotate objects mentally in 3D space</div>
                  <div><strong>Spatial Visualization:</strong> Visualizing how objects appear from different viewpoints</div>
                  <div><strong>3D Reasoning:</strong> Understanding spatial relationships in three dimensions</div>
                  <div><strong>Pattern Recognition:</strong> Identifying matching shapes despite rotation</div>
                  <div><strong>Visual Processing:</strong> Rapid analysis of complex spatial information</div>
                  <div><strong>Geometric Thinking:</strong> Understanding transformations and orientations</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Click on the option that matches the target shape's rotation
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: Mental rotation ability is crucial for STEM fields, engineering, and spatial problem-solving tasks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default MentalRotation3DGame;
