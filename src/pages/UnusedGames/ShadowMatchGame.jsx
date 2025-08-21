import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';

const ShadowMatchGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameMode, setGameMode] = useState('silhouette');
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(5);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);

  // Game objects
  const [currentSilhouette, setCurrentSilhouette] = useState(null);
  const [objectOptions, setObjectOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');

  

  // 3D Object library with silhouettes
  const objectLibrary = [
    {
      id: 1,
      name: 'Cube',
      category: 'geometric',
      silhouette: '⬛',
      shadow: '▪️',
      color: '#FF6B3E',
      difficulty: 'easy'
    },
    {
      id: 2,
      name: 'Sphere',
      category: 'geometric',
      silhouette: '⚫',
      shadow: '🔴',
      color: '#4CAF50',
      difficulty: 'easy'
    },
    {
      id: 3,
      name: 'Pyramid',
      category: 'geometric',
      silhouette: '🔺',
      shadow: '🔻',
      color: '#2196F3',
      difficulty: 'easy'
    },
    {
      id: 4,
      name: 'Cup',
      category: 'everyday',
      silhouette: '☕',
      shadow: '🥤',
      color: '#9C27B0',
      difficulty: 'medium'
    },
    {
      id: 5,
      name: 'Chair',
      category: 'furniture',
      silhouette: '🪑',
      shadow: '🛋️',
      color: '#FF9800',
      difficulty: 'medium'
    },
    {
      id: 6,
      name: 'Tree',
      category: 'nature',
      silhouette: '🌲',
      shadow: '🌳',
      color: '#4CAF50',
      difficulty: 'medium'
    },
    {
      id: 7,
      name: 'Guitar',
      category: 'instruments',
      silhouette: '🎸',
      shadow: '🎻',
      color: '#8BC34A',
      difficulty: 'hard'
    },
    {
      id: 8,
      name: 'Car',
      category: 'vehicles',
      silhouette: '🚗',
      shadow: '🚙',
      color: '#F44336',
      difficulty: 'hard'
    }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: { options: 3, timeLimit: 90, lives: 5, hints: 5 },
    Moderate: { options: 4, timeLimit: 75, lives: 4, hints: 3 },
    Hard: { options: 5, timeLimit: 60, lives: 3, hints: 2 }
  };

  // Generate new round
  const generateNewRound = useCallback(() => {
    const availableObjects = objectLibrary.filter(obj => {
      if (difficulty === 'Easy') return obj.difficulty === 'easy';
      if (difficulty === 'Moderate') return ['easy', 'medium'].includes(obj.difficulty);
      return true; // Hard includes all
    });

    const correct = availableObjects[Math.floor(Math.random() * availableObjects.length)];
    setCorrectAnswer(correct);
    setCurrentSilhouette(gameMode === 'silhouette' ? correct.silhouette : correct.shadow);

    // Generate options including the correct answer
    const options = [correct];
    const settings = difficultySettings[difficulty];
    while (options.length < Math.min(settings.options, availableObjects.length)) {
      const randomObj = availableObjects[Math.floor(Math.random() * availableObjects.length)];
      if (!options.find(opt => opt.id === randomObj.id)) {
        options.push(randomObj);
      }
    }

    // Shuffle options
    setObjectOptions(options.sort(() => Math.random() - 0.5));
    setSelectedObject(null);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
  }, [gameMode, difficulty]);

  // Calculate score based on multiple factors
  const calculateScore = useCallback(() => {
    if (totalQuestions === 0) return 0;
    
    const settings = difficultySettings[difficulty];
    const accuracyRate = correctAnswers / totalQuestions;
    const avgResponseTime = totalResponseTime / totalQuestions / 1000; // Convert to seconds
    
    // Base score from accuracy (0-100 points)
    let baseScore = accuracyRate * 100;
    
    // Time bonus based on average response time (max 30 points)
    const idealTime = difficulty === 'Easy' ? 5 : difficulty === 'Moderate' ? 4 : 3;
    const timeBonus = Math.max(0, Math.min(30, (idealTime - avgResponseTime) * 6));
    
    // Streak bonus (max 25 points)
    const streakBonus = Math.min(maxStreak * 2.5, 25);
    
    // Level progression bonus (max 20 points)
    const levelBonus = Math.min(currentLevel * 1.5, 20);
    
    // Lives remaining bonus (max 15 points)
    const livesBonus = (lives / settings.lives) * 15;
    
    // Hints penalty (subtract up to 10 points)
    const hintsPenalty = (hintsUsed / settings.hints) * 10;
    
    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.85 : difficulty === 'Moderate' ? 1.0 : 1.15;
    
    // Time remaining bonus (max 10 points)
    const timeRemainingBonus = Math.min(10, (timeRemaining / settings.timeLimit) * 10);
    
    let finalScore = (baseScore + timeBonus + streakBonus + levelBonus + livesBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;
    
    // Apply final modifier to make 200 very challenging but achievable
    finalScore = finalScore * 0.88;
    
    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [correctAnswers, totalQuestions, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle object selection
  const handleObjectSelect = useCallback((object) => {
    if (gameState !== 'playing' || showFeedback) return;

    const responseTime = Date.now() - questionStartTime;
    setSelectedObject(object);
    setShowFeedback(true);
    setTotalQuestions(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    if (object.id === correctAnswer?.id) {
      // Correct answer
      setFeedbackType('correct');
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setCurrentLevel(prev => prev + 1);

      setTimeout(() => {
        generateNewRound();
      }, 1500);
    } else {
      // Incorrect answer
      setFeedbackType('incorrect');
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('finished');
        }
        return newLives;
      });

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedObject(null);
      }, 1500);
    }
  }, [gameState, showFeedback, questionStartTime, correctAnswer, generateNewRound]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;

    setHintsUsed(prev => prev + 1);
    // Highlight correct answer briefly
    const correctElement = document.querySelector(`[data-object-id="${correctAnswer?.id}"]`);
    if (correctElement) {
      correctElement.style.boxShadow = '0 0 20px #FFD700';
      setTimeout(() => {
        correctElement.style.boxShadow = '';
      }, 2000);
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
    generateNewRound();
  };

  const handleReset = () => {
    initializeGame();
    setCurrentSilhouette(null);
    setObjectOptions([]);
    setCorrectAnswer(null);
    setSelectedObject(null);
    setShowFeedback(false);
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
      
      {/* How to Play Section - Horizontal Card */}
     

      <GameFramework
        gameTitle="3D Shadow Match"
        gameDescription={ 
        <div className="mx-auto px-4 lg:px-0 mb-0">
        <div className="bg-[#E8E8E8] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
            How to Play 3D Shadow Match
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className='bg-white p-3 rounded-lg'>
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 Objective
              </h4>
              <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Match the displayed silhouette or shadow with the correct 3D object from the options below.
              </p>
            </div>

            <div className='bg-white p-3 rounded-lg'>
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎮 Game Modes
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• <strong>Silhouette:</strong> Match black outlines</li>
                <li>• <strong>Shadow:</strong> Match cast shadows</li>
              </ul>
            </div>

            <div className='bg-white p-3 rounded-lg'>
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                📊 Scoring
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• Base: 100 points per match</li>
                <li>• Time & streak bonuses</li>
                <li>• Level progression rewards</li>
              </ul>
            </div>

            <div className='bg-white p-3 rounded-lg'>
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                💡 Tips
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• Use hints wisely - they're limited!</li>
                <li>• Work quickly for time bonuses</li>
                <li>• Build streaks for higher scores</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      }
        category="Spatial Awareness"
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
          {/* Game Mode and Additional Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              disabled={gameState === 'playing'}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <option value="silhouette">Silhouette Mode</option>
              <option value="shadow">Shadow Mode</option>
            </select>

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
                <Eye className="h-4 w-4" />
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
                Hints
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {maxHints - hintsUsed}
              </div>
            </div>
          </div>

          {/* Silhouette/Shadow Display */}
          {currentSilhouette && (
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {gameMode === 'silhouette' ? 'Match this silhouette:' : 'Match this shadow:'}
              </h3>
              <div className="bg-gray-100 rounded-lg p-8 inline-block">
                <div className="text-8xl">{currentSilhouette}</div>
              </div>
            </div>
          )}

          {/* Object Options */}
          {objectOptions.length > 0 && (
            <div className="w-full max-w-4xl mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {objectOptions.map((object) => (
                  <button
                    key={object.id}
                    data-object-id={object.id}
                    onClick={() => handleObjectSelect(object)}
                    disabled={showFeedback}
                    className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                      selectedObject?.id === object.id
                        ? feedbackType === 'correct'
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-white hover:border-[#FF6B3E] hover:bg-orange-50'
                    } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2" style={{ color: object.color }}>
                        {object.silhouette}
                      </div>
                      <div className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {object.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && correctAnswer && (
            <div className={`w-full max-w-2xl text-center p-4 rounded-lg ${
              feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="text-lg font-semibold mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {feedbackType === 'correct' ? '🎉 Correct!' : '❌ Try Again!'}
              </div>
              <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackType === 'correct'
                  ? `Great job! The answer was ${correctAnswer.name}.`
                  : `That's not right. The correct answer is ${correctAnswer.name}.`
                }
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Study the {gameMode} carefully and select the matching 3D object. 
              Use hints when needed, but remember they're limited!
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].options} options | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default ShadowMatchGame;