import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Play, Pause, Trophy, Eye, Clock, Target } from 'lucide-react';
import Header from '../../components/Header';

const ShadowMatchGame = () => {
  // Game state
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, won, lost
  const [gameMode, setGameMode] = useState('silhouette'); // silhouette, shadow, rotation
  const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard, expert
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLimit, setTimeLimit] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  // Game objects
  const [currentSilhouette, setCurrentSilhouette] = useState(null);
  const [objectOptions, setObjectOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(''); // correct, incorrect
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);

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

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && gameState === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= timeLimit) {
            setGameState('lost');
            setIsTimerRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameState, timeLimit]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const difficultySettings = {
      easy: { options: 3, timeLimit: 90, lives: 5, hints: 5 },
      medium: { options: 4, timeLimit: 75, lives: 4, hints: 3 },
      hard: { options: 5, timeLimit: 60, lives: 3, hints: 2 },
      expert: { options: 6, timeLimit: 45, lives: 2, hints: 1 }
    };

    const settings = difficultySettings[difficulty];
    setTimeLimit(settings.timeLimit);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setTimeElapsed(0);
    setScore(0);
    setStreak(0);
    setCurrentLevel(1);
    setGameState('ready');
    setIsTimerRunning(false);
    generateNewRound();
  }, [difficulty]);

  // Generate new round
  const generateNewRound = useCallback(() => {
    const availableObjects = objectLibrary.filter(obj => {
      if (difficulty === 'easy') return obj.difficulty === 'easy';
      if (difficulty === 'medium') return ['easy', 'medium'].includes(obj.difficulty);
      return true; // hard and expert include all
    });

    const correct = availableObjects[Math.floor(Math.random() * availableObjects.length)];
    setCorrectAnswer(correct);
    setCurrentSilhouette(gameMode === 'silhouette' ? correct.silhouette : correct.shadow);

    // Generate options including the correct answer
    const options = [correct];
    while (options.length < Math.min(4, availableObjects.length)) {
      const randomObj = availableObjects[Math.floor(Math.random() * availableObjects.length)];
      if (!options.find(opt => opt.id === randomObj.id)) {
        options.push(randomObj);
      }
    }

    // Shuffle options
    setObjectOptions(options.sort(() => Math.random() - 0.5));
    setSelectedObject(null);
    setShowFeedback(false);
  }, [gameMode, difficulty]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setIsTimerRunning(true);
    generateNewRound();
  };

  // Handle object selection
  const handleObjectSelect = (object) => {
    if (gameState !== 'playing' || showFeedback) return;

    setSelectedObject(object);
    setShowFeedback(true);

    if (object.id === correctAnswer.id) {
      // Correct answer
      setFeedbackType('correct');
      const timeBonus = Math.max(0, timeLimit - timeElapsed) * 2;
      const streakBonus = streak * 50;
      const levelBonus = currentLevel * 100;
      const newScore = score + 100 + timeBonus + streakBonus + levelBonus;

      setScore(newScore);
      setStreak(prev => prev + 1);
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
          setGameState('lost');
          setIsTimerRunning(false);
        }
        return newLives;
      });

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedObject(null);
      }, 1500);
    }
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;

    setHintsUsed(prev => prev + 1);
    // Highlight correct answer briefly
    const correctElement = document.querySelector(`[data-object-id="${correctAnswer.id}"]`);
    if (correctElement) {
      correctElement.style.boxShadow = '0 0 20px #FFD700';
      setTimeout(() => {
        correctElement.style.boxShadow = '';
      }, 2000);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <Header unreadCount={3} />

      {/* Page Header */}
      <div className="mx-auto px-4 lg:px-12 py-4 lg:py-8">
        <div className="flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-2 text-gray-600" />
          <h1 className="text-gray-900 font-medium lg:font-bold" style={{ fontSize: 'clamp(18px, 2vw, 20px)' }}>
            3D Shadow Match Game
          </h1>
        </div>
        <p className="text-gray-600 text-base" style={{ fontWeight: '400' }}>
          Match the silhouette or shadow with the correct 3D object. Test your spatial awareness and shape recognition skills!
        </p>
      </div>

      {/* Game Container */}
      <div className="mx-auto px-4 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Game Area */}
          <div className="flex-1">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Game Controls */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex gap-4">
                  {/* Game Mode Selector */}
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value)}
                    disabled={gameState === 'playing'}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <option value="silhouette">Silhouette Mode</option>
                    <option value="shadow">Shadow Mode</option>
                  </select>

                  {/* Difficulty Selector */}
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={gameState === 'playing'}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2">
                  {gameState === 'ready' && (
                    <button
                      onClick={startGame}
                      className="bg-[#FF6B3E] text-white px-4 py-2 rounded-lg hover:bg-[#e55a35] transition-colors flex items-center gap-2"
                      style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                    >
                      <Play className="h-4 w-4" />
                      Start Game
                    </button>
                  )}

                  <button
                    onClick={initializeGame}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>

                  {gameState === 'playing' && (
                    <button
                      onClick={useHint}
                      disabled={hintsUsed >= maxHints}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints
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
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Score
                  </div>
                  <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {score.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Level
                  </div>
                  <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentLevel}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Time
                  </div>
                  <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {formatTime(timeLimit - timeElapsed)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Lives
                  </div>
                  <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {'❤️'.repeat(lives)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Streak
                  </div>
                  <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {streak}
                  </div>
                </div>
              </div>

              {/* Game Area */}
              {gameState !== 'ready' && (
                <div className="bg-white rounded-lg p-6 mb-6">
                  {/* Silhouette/Shadow Display */}
                  <div className="text-center mb-8">
                    <h3 className="text-base font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {gameMode === 'silhouette' ? 'Match this silhouette:' : 'Match this shadow:'}
                    </h3>
                    <div className="bg-gray-100 rounded-lg p-8 inline-block">
                      <div className="text-8xl">{currentSilhouette}</div>
                    </div>
                  </div>

                  {/* Object Options */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {objectOptions.map((object) => (
                      <button
                        key={object.id}
                        data-object-id={object.id}
                        onClick={() => handleObjectSelect(object)}
                        disabled={showFeedback}
                        className={`p-6 rounded-lg border-2 transition-all duration-300 ${selectedObject?.id === object.id
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

                  {/* Feedback */}
                  {showFeedback && (
                    <div className={`mt-6 text-center p-4 rounded-lg ${feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
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
                </div>
              )}

              {/* Game Over States */}
              {(gameState === 'won' || gameState === 'lost') && (
                <div className="text-center">
                  <div className={`rounded-lg p-6 ${gameState === 'won' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                    <div className="text-4xl mb-4">
                      {gameState === 'won' ? <Trophy className="h-16 w-16 text-green-600 mx-auto" /> : '💔'}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${gameState === 'won' ? 'text-green-800' : 'text-red-800'}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {gameState === 'won' ? 'Congratulations!' : 'Game Over!'}
                    </h3>
                    <p className={`mb-4 ${gameState === 'won' ? 'text-green-700' : 'text-red-700'}`} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      {gameState === 'won'
                        ? `You completed ${currentLevel - 1} levels with a score of ${score.toLocaleString()}!`
                        : `You reached level ${currentLevel} with a score of ${score.toLocaleString()}.`
                      }
                    </p>
                    <button
                      onClick={initializeGame}
                      className="bg-[#FF6B3E] text-white px-6 py-3 rounded-lg hover:bg-[#e55a35] transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions Panel */}
          <div className="w-full lg:w-80">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                How to Play
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Objective
                  </h4>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Match the displayed silhouette or shadow with the correct 3D object from the options below.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Game Modes
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• <strong>Silhouette:</strong> Match black outlines</li>
                    <li>• <strong>Shadow:</strong> Match cast shadows</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Difficulty Levels
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• <strong>Easy:</strong> Basic shapes, 3 options</li>
                    <li>• <strong>Medium:</strong> Complex objects, 4 options</li>
                    <li>• <strong>Hard:</strong> Similar objects, 5 options</li>
                    <li>• <strong>Expert:</strong> Challenging shapes, 6 options</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Scoring
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Base score: 100 points per match</li>
                    <li>• Time bonus: 2 points per second remaining</li>
                    <li>• Streak bonus: 50 points per consecutive match</li>
                    <li>• Level bonus: 100 points × level number</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Tips
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Use hints wisely - they're limited!</li>
                    <li>• Work quickly for time bonuses</li>
                    <li>• Build streaks for higher scores</li>
                    <li>• Study object shapes carefully</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowMatchGame;
