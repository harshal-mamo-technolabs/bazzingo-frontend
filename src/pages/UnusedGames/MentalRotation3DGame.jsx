import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { RotateCw, Lightbulb, CheckCircle, XCircle, Eye, Zap , ChevronUp, ChevronDown } from 'lucide-react';

const MentalRotation3DGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
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
  const [gameDuration, setGameDuration] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [showMentalRotationInstructions, setShowMentalRotationInstructions] = useState(true); 

  // Game state
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [usedShapes, setUsedShapes] = useState([]);
  

  // 3D Shape definitions
  const shapes = [
    {
      id: 'L_shape_1',
      name: 'L-Block',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
      ],
      color: '#3B82F6',
      symbol: '🔷'
    },
    {
      id: 'T_shape_1',
      name: 'T-Block',
      blocks: [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 }
      ],
      color: '#EF4444',
      symbol: '🔴'
    },
    {
      id: 'Z_shape_1',
      name: 'Z-Block',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 }
      ],
      color: '#10B981',
      symbol: '🟢'
    },
    {
      id: 'plus_shape_1',
      name: 'Plus-Block',
      blocks: [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 },
        { x: 1, y: 2, z: 0 }
      ],
      color: '#F59E0B',
      symbol: '🟡'
    },
    {
      id: 'corner_shape_1',
      name: 'Corner-Block',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 }
      ],
      color: '#8B5CF6',
      symbol: '🟣'
    },
    {
      id: 'step_shape_1',
      name: 'Step-Block',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 1, y: 1, z: 1 }
      ],
      color: '#EC4899',
      symbol: '🔺'
    },
    {
      id: 'pyramid_shape_1',
      name: 'Pyramid-Block',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 0.5, y: 0.5, z: 1 }
      ],
      color: '#06B6D4',
      symbol: '🔶'
    },
    {
      id: 'cross_shape_1',
      name: 'Cross-Block',
      blocks: [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 },
        { x: 1, y: 2, z: 0 },
        { x: 1, y: 1, z: 1 }
      ],
      color: '#84CC16',
      symbol: '✚'
    }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 300, lives: 5, hints: 3, rotationAngles: [60, 90, 120], maxQuestions: 15 },
    Moderate: { timeLimit: 240, lives: 4, hints: 2, rotationAngles: [45, 90, 135, 180], maxQuestions: 20 },
    Hard: { timeLimit: 180, lives: 3, hints: 1, rotationAngles: [30, 60, 90, 120, 150, 180], maxQuestions: 25 }
  };

  // Generate rotation for shape
  const generateRotation = (angleX, angleY, angleZ) => {
    return {
      x: angleX,
      y: angleY,
      z: angleZ,
      transform: `rotateX(${angleX}deg) rotateY(${angleY}deg) rotateZ(${angleZ}deg)`
    };
  };

  // Generate puzzle with target and options
  const generatePuzzle = useCallback(() => {
    const settings = difficultySettings[difficulty];
    
    // Select shape with duplicate prevention
    const availableShapes = shapes.filter(shape => !usedShapes.includes(shape.id));
    let selectedShape;
    
    if (availableShapes.length === 0) {
      setUsedShapes([]);
      selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
      setUsedShapes([selectedShape.id]);
    } else {
      selectedShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
      setUsedShapes(prev => [...prev.slice(-4), selectedShape.id]);
    }

    // Generate target rotation
    const targetRotation = generateRotation(
      settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)],
      settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)],
      settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)]
    );

    // Generate options (3 incorrect + 1 correct)
    const options = [];
    const correctOption = {
      id: 'correct',
      rotation: targetRotation,
      isCorrect: true
    };
    options.push(correctOption);

    // Generate 3 incorrect options
    for (let i = 0; i < 3; i++) {
      let incorrectRotation;
      let attempts = 0;
      
      do {
        incorrectRotation = generateRotation(
          settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)],
          settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)],
          settings.rotationAngles[Math.floor(Math.random() * settings.rotationAngles.length)]
        );
        attempts++;
      } while (
        (incorrectRotation.x === targetRotation.x && 
         incorrectRotation.y === targetRotation.y && 
         incorrectRotation.z === targetRotation.z) && 
        attempts < 10
      );

      options.push({
        id: `option_${i}`,
        rotation: incorrectRotation,
        isCorrect: false
      });
    }

    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      shape: selectedShape,
      targetRotation,
      options: shuffledOptions,
      correctAnswerId: correctOption.id
    };
  }, [difficulty, usedShapes]);

  // Render 3D shape
  const renderShape = (shape, rotation, size = 'medium') => {
    const blockSize = size === 'small' ? 8 : size === 'large' ? 20 : 12;
    const containerSize = blockSize * 5;

    return (
      <div
        className="relative mx-auto"
        style={{
          width: containerSize,
          height: containerSize,
          perspective: '300px',
          perspectiveOrigin: 'center center'
        }}
      >
        <div
          className="relative"
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: rotation.transform,
            transition: 'transform 0.3s ease'
          }}
        >
          {shape.blocks.map((block, index) => (
            <div
              key={index}
              className="absolute border border-gray-400 rounded-sm"
              style={{
                width: blockSize,
                height: blockSize,
                backgroundColor: shape.color,
                left: block.x * blockSize + containerSize / 4,
                top: block.y * blockSize + containerSize / 4,
                transform: `translateZ(${block.z * blockSize}px)`,
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                opacity: 0.9
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Calculate score
  const calculateScore = useCallback(() => {
    if (totalQuestions === 0 || gameState !== 'playing') return score;
    
    const settings = difficultySettings[difficulty];
    const accuracyRate = correctAnswers / totalQuestions;
    const avgResponseTime = totalResponseTime / totalQuestions / 1000;
    
    // Base score from accuracy (0-85 points)
    let baseScore = accuracyRate * 85;
    
    // Time bonus (max 25 points)
    const idealTime = difficulty === 'Easy' ? 8 : difficulty === 'Moderate' ? 10 : 12;
    const timeBonus = Math.max(0, Math.min(25, (idealTime - avgResponseTime) * 3));
    
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
    
    // Apply final modifier
    finalScore = finalScore * 0.85;
    
    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [correctAnswers, totalQuestions, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty, gameState, score]);

  // REMOVE or comment this out
// useEffect(() => {
//   if (gameState === 'playing') {
//     const newScore = calculateScore();
//     setScore(newScore);
//   }
// }, [calculateScore, gameState]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((optionId) => {
    if (gameState !== 'playing' || showFeedback || !currentPuzzle) return;
    
    const responseTime = Date.now() - questionStartTime;
    const selectedOption = currentPuzzle.options.find(opt => opt.id === optionId);
    
    setSelectedAnswer(optionId);
    setShowFeedback(true);
    setTotalQuestions(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);
    
    if (selectedOption?.isCorrect) {
  setFeedbackType('correct');
  setCorrectAnswers(prev => prev + 1);
  setStreak(prev => {
    const newStreak = prev + 1;
    setMaxStreak(current => Math.max(current, newStreak));
    return newStreak;
  });
  setCurrentLevel(prev => prev + 1);

  // Recalculate score only on correct answer
  const newScore = calculateScore();
  setScore(newScore);

  setTimeout(() => {
    generateNewPuzzle();
  }, 2000);
    } else {
      setFeedbackType('incorrect');
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          const endTime = Date.now();
          const duration = Math.floor((endTime - gameStartTime) / 1000);
          setGameDuration(duration);
          setFinalScore(score);
          setGameState('finished');
          setShowCompletionModal(true);
        }
        return newLives;
      });
      
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
      }, 2500);
    }
  }, [gameState, showFeedback, currentPuzzle, questionStartTime, gameStartTime, score]);

  // Generate new puzzle
  const generateNewPuzzle = () => {
    const newPuzzle = generatePuzzle();
    setCurrentPuzzle(newPuzzle);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowHint(false);
    setQuestionStartTime(Date.now());
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentPuzzle) return;
    
    setHintsUsed(prev => prev + 1);
    
    const correctOption = currentPuzzle.options.find(opt => opt.isCorrect);
    const hintMessages = [
      `Look for the ${currentPuzzle.shape.name} rotated around multiple axes.`,
      `The correct answer maintains the same spatial relationships between blocks.`,
      `Try to mentally rotate the target shape to match one of the options.`,
      `Focus on how the blocks connect to each other in 3D space.`
    ];
    
    setHintMessage(hintMessages[Math.floor(Math.random() * hintMessages.length)]);
    setShowHint(true);
    
    setTimeout(() => {
      setShowHint(false);
    }, 4000);
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
            setFinalScore(score);
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
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setTotalResponseTime(0);
    setUsedShapes([]);
    setGameDuration(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
    generateNewPuzzle();
  };

  const handleReset = () => {
    initializeGame();
    setCurrentPuzzle(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowHint(false);
    setShowCompletionModal(false);
  };

  const handleGameComplete = (payload) => {
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
    correctAnswers,
    totalQuestions,
    averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      
      <GameFramework
        gameTitle="Mental Rotation 3D"
        gameDescription={
        <div className="mx-auto px-4 lg:px-0 mb-0">
  <div className="bg-[#E8E8E8] rounded-lg p-6">
    {/* Toggle Header */}
    <div
      className="flex items-center justify-between cursor-pointer mb-4"
      onClick={() => setShowMentalRotationInstructions(!showMentalRotationInstructions)}
    >
      <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
        How to Play Mental Rotation 3D
      </h3>
      {showMentalRotationInstructions ? (
        <ChevronUp className="text-blue-900" size={20} />
      ) : (
        <ChevronDown className="text-blue-900" size={20} />
      )}
    </div>

    {/* Toggle Content */}
    {showMentalRotationInstructions && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            🎯 Objective
          </h4>
          <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            Test your spatial intelligence by identifying which 3D object matches the target rotation.
          </p>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            🔄 Mental Rotation
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• Study the target 3D shape</li>
            <li>• Mentally rotate it in 3D space</li>
            <li>• Compare with given options</li>
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
            <li>• Visualize 3D transformations</li>
            <li>• Focus on spatial relationships</li>
            <li>• Use systematic rotation approach</li>
          </ul>
        </div>
      </div>
    )}
  </div>
</div>
        }
        category="Problem Solving"
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
                {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Target Shape Display */}
          {currentPuzzle && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Target Shape: {currentPuzzle.shape.name}
                  </span>
                </div>
                <p className="text-blue-700 text-sm mb-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  Study this 3D shape and find the matching rotation below
                </p>
                <div className="flex justify-center">
                  <div className="bg-white rounded-lg p-6 border-2 border-blue-400">
                    {renderShape(currentPuzzle.shape, currentPuzzle.targetRotation, 'large')}
                  </div>
                </div>
              </div>
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

          {/* Answer Options */}
          {currentPuzzle && (
            <div className="w-full max-w-4xl mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Which option matches the target rotation?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentPuzzle.options.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={showFeedback}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedAnswer === option.id
                        ? option.isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-[#FF6B3E] hover:bg-orange-50'
                    } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                  >
                    <div className="text-center mb-2">
                      <div className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Option {String.fromCharCode(65 + index)}
                      </div>
                    </div>
                    
                    <div className="flex justify-center mb-2">
                      {renderShape(currentPuzzle.shape, option.rotation, 'medium')}
                    </div>

                    {/* Feedback Icons */}
                    {showFeedback && selectedAnswer === option.id && (
                      <div className="absolute top-2 right-2">
                        {option.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentPuzzle && (
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
                  ? 'Excellent spatial reasoning! You correctly identified the rotated shape.'
                  : 'Try to visualize the 3D rotation more carefully. Focus on how the blocks connect.'
                }
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Study the target 3D shape, then mentally rotate it to find which option matches. 
              Focus on the spatial relationships between blocks and how they connect in 3D space.
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
        score={finalScore}
        difficulty={difficulty}
        duration={gameDuration}
        customStats={{
          correctAnswers: correctAnswers,
          totalQuestions: totalQuestions
        }}
      />
    </div>
  );
};

export default MentalRotation3DGame;