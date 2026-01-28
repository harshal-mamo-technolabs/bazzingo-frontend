import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Target, Zap, Timer, ChevronUp, ChevronDown, CheckCircle, XCircle, Award, Lightbulb, Star, Flame, TrendingUp } from 'lucide-react';

const TapChallengeGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameDuration, setGameDuration] = useState(0);

  // Game statistics
  const [totalTaps, setTotalTaps] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [missedTargets, setMissedTargets] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalReactionTime, setTotalReactionTime] = useState(0);
  const [targetsHit, setTargetsHit] = useState(0);
  const [targetsSpawned, setTargetsSpawned] = useState(0);

  // Game state
  const [activeTargets, setActiveTargets] = useState([]);
  const [nextTargetId, setNextTargetId] = useState(0);
  const [targetSpawnRate, setTargetSpawnRate] = useState(2000);
  const [targetLifetime, setTargetLifetime] = useState(3000);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [hitEffects, setHitEffects] = useState([]);
  const [nextEffectId, setNextEffectId] = useState(0);
  const [gameAreaSize, setGameAreaSize] = useState({ width: 600, height: 400 });

  // Difficulty settings
  const difficultySettings = {
    Easy: {
      timeLimit: 90,
      spawnRate: 2500,
      targetLifetime: 4000,
      maxTargets: 3,
      targetSize: 'large',
      speedVariation: 0.5,
      description: 'Slow targets, 4s lifetime, max 3 on screen'
    },
    Moderate: {
      timeLimit: 75,
      spawnRate: 2000,
      targetLifetime: 3000,
      maxTargets: 4,
      targetSize: 'medium',
      speedVariation: 0.7,
      description: 'Medium speed, 3s lifetime, max 4 on screen'
    },
    Hard: {
      timeLimit: 60,
      spawnRate: 1500,
      targetLifetime: 2000,
      maxTargets: 5,
      targetSize: 'small',
      speedVariation: 1.0,
      description: 'Fast targets, 2s lifetime, max 5 on screen'
    }
  };

  // Generate random position for target
  const generateRandomPosition = () => {
    const settings = difficultySettings[difficulty];
    const targetSize = settings.targetSize === 'large' ? 80 : settings.targetSize === 'medium' ? 60 : 40;

    return {
      x: Math.random() * (gameAreaSize.width - targetSize),
      y: Math.random() * (gameAreaSize.height - targetSize),
    };
  };

  // Spawn new target
  const spawnTarget = useCallback(() => {
    if (gameState !== 'playing') return;

    const settings = difficultySettings[difficulty];
    if (activeTargets.length >= settings.maxTargets) return;

    const position = generateRandomPosition();
    const targetTypes = ['normal', 'bonus', 'penalty'];
    const typeWeights = [0.7, 0.25, 0.05]; // 70% normal, 25% bonus, 5% penalty

    let targetType = 'normal';
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < typeWeights.length; i++) {
      cumulative += typeWeights[i];
      if (random <= cumulative) {
        targetType = targetTypes[i];
        break;
      }
    }

    const newTarget = {
      id: nextTargetId,
      x: position.x,
      y: position.y,
      type: targetType,
      spawnTime: Date.now(),
      lifetime: settings.targetLifetime,
      size: settings.targetSize,
      points: targetType === 'bonus' ? 15 : targetType === 'penalty' ? -10 : 10,
      moving: Math.random() > 0.6, // 40% chance of moving targets
      direction: Math.random() * 2 * Math.PI,
      speed: (Math.random() * settings.speedVariation + 0.3) * 50,
    };

    setActiveTargets(prev => [...prev, newTarget]);
    setNextTargetId(prev => prev + 1);
    setTargetsSpawned(prev => prev + 1);
  }, [gameState, difficulty, activeTargets.length, nextTargetId]);

  // Update target positions and remove expired targets
  const updateTargets = useCallback(() => {
    if (gameState !== 'playing') return;

    setActiveTargets(prev => {
      const now = Date.now();

      return prev
        .map(target => {
          if (target.moving) {
            let newX = target.x + Math.cos(target.direction) * target.speed * 0.016;
            let newY = target.y + Math.sin(target.direction) * target.speed * 0.016;

            // Bounce off walls
            if (newX <= 0 || newX >= gameAreaSize.width - 60) {
              target.direction = Math.PI - target.direction;
              newX = Math.max(0, Math.min(gameAreaSize.width - 60, newX));
            }
            if (newY <= 0 || newY >= gameAreaSize.height - 60) {
              target.direction = -target.direction;
              newY = Math.max(0, Math.min(gameAreaSize.height - 60, newY));
            }

            return { ...target, x: newX, y: newY };
          }
          return target;
        })
        .filter(target => {
          const age = now - target.spawnTime;
          if (age > target.lifetime) {
            setMissedTargets(prev => prev + 1);
            setStreak(0);
            setComboMultiplier(1);
            return false;
          }
          return true;
        });
    });
  }, [gameState, gameAreaSize]);

  // Handle target tap
  const handleTargetTap = (targetId, event) => {
    event.stopPropagation();

    if (gameState !== 'playing') return;

    const target = activeTargets.find(t => t.id === targetId);
    if (!target) return;

    const now = Date.now();
    const reactionTime = now - target.spawnTime;
    setTotalReactionTime(prev => prev + reactionTime);
    setTotalTaps(prev => prev + 1);

    // Remove the tapped target
    setActiveTargets(prev => prev.filter(t => t.id !== targetId));

    // Add hit effect
    const rect = event.target.getBoundingClientRect();
    const gameArea = event.target.closest('.game-area');
    const gameRect = gameArea.getBoundingClientRect();

    const effect = {
      id: nextEffectId,
      x: rect.left - gameRect.left + rect.width / 2,
      y: rect.top - gameRect.top + rect.height / 2,
      type: target.type,
      points: target.points,
      timestamp: now
    };

    setHitEffects(prev => [...prev, effect]);
    setNextEffectId(prev => prev + 1);

    if (target.type === 'penalty') {
      // Penalty target
      setStreak(0);
      setComboMultiplier(1);
      setFeedbackMessage('Penalty Target! -10 points');
      setFeedbackType('error');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1000);
    } else {
      // Successful hit
      setCorrectTaps(prev => prev + 1);
      setTargetsHit(prev => prev + 1);

      // Update streak and combo
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));

      // Combo multiplier increases every 5 hits in quick succession
      if (now - lastHitTime < 1000 && newStreak % 5 === 0) {
        setComboMultiplier(prev => Math.min(prev + 0.5, 3));
      }
      setLastHitTime(now);

      // Level progression
      if (newStreak % 10 === 0) {
        setCurrentLevel(prev => prev + 1);
        setFeedbackMessage(`Level Up! Level ${currentLevel + 1}`);
        setFeedbackType('success');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 1500);
      }

      // Show feedback for bonus targets
      if (target.type === 'bonus') {
        setFeedbackMessage('Bonus Target! +15 points');
        setFeedbackType('bonus');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 1000);
      }
    }
  };

  // Clean up hit effects
  useEffect(() => {
    const interval = setInterval(() => {
      setHitEffects(prev => prev.filter(effect => Date.now() - effect.timestamp < 1000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Handle window resize for responsiveness
  useEffect(() => {
    const updateGameAreaSize = () => {
      const width = window.innerWidth;
      const padding = 32; // Account for container padding
      const maxWidth = Math.min(width - padding, 600);

      if (width < 480) {
        // Very small screens (phones in portrait)
        setGameAreaSize({ width: Math.max(280, maxWidth), height: 200 });
      } else if (width < 640) {
        // Small screens (phones in landscape)
        setGameAreaSize({ width: Math.max(320, maxWidth), height: 240 });
      } else if (width < 768) {
        // Tablets in portrait
        setGameAreaSize({ width: Math.max(400, maxWidth), height: 280 });
      } else if (width < 1024) {
        // Tablets in landscape
        setGameAreaSize({ width: Math.max(500, maxWidth), height: 320 });
      } else {
        // Desktop
        setGameAreaSize({ width: 600, height: 400 });
      }
    };

    updateGameAreaSize();
    window.addEventListener('resize', updateGameAreaSize);
    return () => window.removeEventListener('resize', updateGameAreaSize);
  }, []);

  // Handle missed tap (clicking empty area)
  const handleMissedTap = () => {
    if (gameState !== 'playing') return;

    setTotalTaps(prev => prev + 1);
    setStreak(0);
    setComboMultiplier(1);
  };

  // Calculate score
  const calculateScore = useCallback(() => {
    if (targetsSpawned === 0 || gameState !== 'playing') return score;

    const settings = difficultySettings[difficulty];
    const accuracy = targetsSpawned > 0 ? targetsHit / targetsSpawned : 0;
    const hitRate = totalTaps > 0 ? correctTaps / totalTaps : 0;
    const avgReactionTime = correctTaps > 0 ? totalReactionTime / correctTaps / 1000 : 0;

    // Base score from accuracy and hit rate (0-80 points)
    let baseScore = (accuracy * 0.6 + hitRate * 0.4) * 80;

    // Reaction time bonus (max 30 points)
    const idealTime = difficulty === 'Easy' ? 1.5 : difficulty === 'Moderate' ? 1.2 : 1.0;
    const reactionBonus = Math.max(0, Math.min(30, (idealTime * 2 - avgReactionTime) * 15));

    // Streak bonus (max 25 points)
    const streakBonus = Math.min(maxStreak * 1.5, 25);

    // Level progression bonus (max 20 points)
    const levelBonus = Math.min(currentLevel * 1.2, 20);

    // Combo multiplier bonus (max 15 points)
    const comboBonus = Math.min((comboMultiplier - 1) * 10, 15);

    // Time remaining bonus (max 15 points)
    const timeRemainingBonus = Math.min(15, (timeRemaining / settings.timeLimit) * 15);

    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.3;

    // Consistency bonus (max 10 points)
    const consistencyBonus = accuracy > 0.8 ? 10 : accuracy > 0.6 ? 5 : 0;

    // Miss penalty
    const missPenalty = Math.min(missedTargets * 2, 20);

    let finalScore = (baseScore + reactionBonus + streakBonus + levelBonus + comboBonus + timeRemainingBonus + consistencyBonus - missPenalty) * difficultyMultiplier;

    // Apply final modifier to make 200 very challenging
    finalScore = finalScore * 0.75;

    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [correctTaps, totalTaps, totalReactionTime, currentLevel, maxStreak, targetsHit, targetsSpawned, missedTargets, timeRemaining, difficulty, gameState, score, comboMultiplier]);

  // Update score during gameplay
  useEffect(() => {
    if (gameState === 'playing') {
      const newScore = calculateScore();
      setScore(newScore);
    }
  }, [calculateScore, gameState]);

  // Target spawning interval
  useEffect(() => {
    let spawnInterval;
    if (gameState === 'playing') {
      const settings = difficultySettings[difficulty];
      spawnInterval = setInterval(spawnTarget, settings.spawnRate);
    }
    return () => clearInterval(spawnInterval);
  }, [gameState, difficulty, spawnTarget]);

  // Target update interval
  useEffect(() => {
    let updateInterval;
    if (gameState === 'playing') {
      updateInterval = setInterval(updateTargets, 16); // ~60fps
    }
    return () => clearInterval(updateInterval);
  }, [gameState, updateTargets]);

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
    setTotalTaps(0);
    setCorrectTaps(0);
    setMissedTargets(0);
    setTotalReactionTime(0);
    setTargetsHit(0);
    setTargetsSpawned(0);
    setActiveTargets([]);
    setNextTargetId(0);
    setShowFeedback(false);
    setComboMultiplier(1);
    setLastHitTime(0);
    setTargetSpawnRate(settings.spawnRate);
    setTargetLifetime(settings.targetLifetime);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
  };

  const handleReset = () => {
    initializeGame();
    setShowCompletionModal(false);
  };

  const handleGameComplete = (payload) => {
  };

  // Prevent difficulty change during gameplay
  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') {
      setDifficulty(newDifficulty);
    }
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    totalTaps,
    correctTaps,
    missedTargets,
    targetsHit,
    targetsSpawned,
    accuracy: targetsSpawned > 0 ? Math.round((targetsHit / targetsSpawned) * 100) : 0,
    hitRate: totalTaps > 0 ? Math.round((correctTaps / totalTaps) * 100) : 0,
    averageReactionTime: correctTaps > 0 ? Math.round(totalReactionTime / correctTaps) : 0,
    comboMultiplier: comboMultiplier.toFixed(1)
  };

  const getTargetStyle = (target) => {
    const baseSizeMap = { large: 80, medium: 60, small: 40 };
    let size = baseSizeMap[target.size];

    // Responsive sizing
    if (gameAreaSize.width < 320) {
      size = Math.max(size * 0.6, 30); // Minimum 30px for touch targets
    } else if (gameAreaSize.width < 400) {
      size = Math.max(size * 0.7, 35);
    } else if (gameAreaSize.width < 500) {
      size = Math.max(size * 0.85, 40);
    }

    const age = Date.now() - target.spawnTime;
    const lifePercent = age / target.lifetime;

    let backgroundColor = '#3B82F6'; // Blue for normal
    if (target.type === 'bonus') backgroundColor = '#10B981'; // Green for bonus
    if (target.type === 'penalty') backgroundColor = '#EF4444'; // Red for penalty

    // Fade out as target ages
    const opacity = Math.max(0.4, 1 - lifePercent * 0.6);
    const scale = target.moving ? 1.05 + Math.sin(age * 0.01) * 0.05 : 1;
    const pulse = target.type === 'bonus' ? `scale(${1 + Math.sin(age * 0.008) * 0.1})` : `scale(${scale})`;

    // Ensure targets stay within bounds
    const maxX = gameAreaSize.width - size;
    const maxY = gameAreaSize.height - size;
    const constrainedX = Math.max(0, Math.min(target.x, maxX));
    const constrainedY = Math.max(0, Math.min(target.y, maxY));

    return {
      position: 'absolute',
      left: `${constrainedX}px`,
      top: `${constrainedY}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor,
      opacity,
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.max(size * 0.25, 12)}px`,
      fontWeight: 'bold',
      color: 'white',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: pulse,
      boxShadow: target.type === 'bonus' ? '0 0 20px rgba(16, 185, 129, 0.6), 0 4px 12px rgba(0,0,0,0.3)' :
        target.type === 'penalty' ? '0 0 20px rgba(239, 68, 68, 0.6), 0 4px 12px rgba(0,0,0,0.3)' :
          '0 0 15px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 10,
      filter: target.type === 'bonus' ? 'brightness(1.1)' : target.type === 'penalty' ? 'brightness(1.1)' : 'brightness(1)',
      // Improve touch targets on mobile
      minWidth: '44px',
      minHeight: '44px',
    };
  };

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}

      <GameFramework
        gameTitle="Tap Challenge"
        gameShortDescription="Tap targets as fast as possible. Challenge your reaction time and hand-eye coordination!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle icon */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer hover:bg-white hover:bg-opacity-50 rounded-lg p-2 transition-all duration-200"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Tap Challenge
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Instructions */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 transition-all duration-300 ${showInstructions ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Tap the targets as quickly as possible before they disappear. Avoid red penalty targets!
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎯 Target Types
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• <span className="text-blue-600">Blue:</span> Normal (+10 pts)</li>
                    <li>• <span className="text-green-600">Green:</span> Bonus (+15 pts)</li>
                    <li>• <span className="text-red-600">Red:</span> Penalty (-10 pts)</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    📊 Scoring
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Accuracy and speed bonuses</li>
                    <li>• Streak multipliers</li>
                    <li>• Combo bonuses for quick hits</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🧠 Strategy
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Focus on accuracy over speed</li>
                    <li>• Avoid penalty targets</li>
                    <li>• Build streaks for multipliers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Gameacy"
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
          {/* Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full max-w-4xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg sm:text-xl font-semibold text-[#FF6B3E] flex items-center justify-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <TrendingUp className="h-4 w-4" />
                {currentLevel}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg sm:text-xl font-semibold text-green-600 flex items-center justify-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <Flame className="h-4 w-4" />
                {streak}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg sm:text-xl font-semibold text-purple-600 flex items-center justify-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <Target className="h-4 w-4" />
                {customStats.accuracy}%
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Combo
              </div>
              <div className="text-lg sm:text-xl font-semibold text-blue-600 flex items-center justify-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <Star className="h-4 w-4" />
                {customStats.comboMultiplier}x
              </div>
            </div>
          </div>

          {/* Game Status */}
          <div className="w-full max-w-2xl mb-6 px-4 sm:px-0">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded-lg p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tap the Targets!
                </h3>
              </div>
              <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Hit: {targetsHit} | Missed: {missedTargets} | Active: {activeTargets.length}
              </p>
            </div>
          </div>

          {/* Game Area */}
          <div className="w-full mb-6 px-2 sm:px-4">
            <div
              className="game-area bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 rounded-xl shadow-xl border-2 border-gray-300 relative overflow-hidden cursor-crosshair mx-auto transition-all duration-300 hover:shadow-2xl touch-manipulation"
              style={{
                height: `${gameAreaSize.height}px`,
                width: `${gameAreaSize.width}px`,
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e0f2fe 50%, #e0e7ff 100%)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.15)',
                maxWidth: '100%'
              }}
              onClick={handleMissedTap}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid h-full w-full" style={{
                  gridTemplateColumns: `repeat(${Math.max(1, Math.floor(gameAreaSize.width / 40))}, 1fr)`,
                  gridTemplateRows: `repeat(${Math.max(1, Math.floor(gameAreaSize.height / 40))}, 1fr)`
                }}>
                  {Array.from({ length: Math.max(1, Math.floor(gameAreaSize.width / 40)) * Math.max(1, Math.floor(gameAreaSize.height / 40)) }).map((_, i) => (
                    <div key={i} className="border border-blue-200"></div>
                  ))}
                </div>
              </div>

              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: Math.min(8, Math.floor(gameAreaSize.width / 75)) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-30 animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>

              {/* Active Targets */}
              {activeTargets.map((target) => (
                <div
                  key={target.id}
                  style={getTargetStyle(target)}
                  onClick={(e) => handleTargetTap(target.id, e)}
                  className="hover:scale-110 active:scale-95 transition-transform duration-150 select-none"
                  onTouchStart={(e) => e.preventDefault()} // Prevent touch delay
                >
                  <div className="relative">
                    {target.type === 'bonus' ? (
                      <Star className="fill-current animate-spin" style={{
                        animationDuration: '2s',
                        width: `${Math.max(16, Math.min(24, gameAreaSize.width / 25))}px`,
                        height: `${Math.max(16, Math.min(24, gameAreaSize.width / 25))}px`
                      }} />
                    ) : target.type === 'penalty' ? (
                      <XCircle className="animate-pulse" style={{
                        width: `${Math.max(16, Math.min(24, gameAreaSize.width / 25))}px`,
                        height: `${Math.max(16, Math.min(24, gameAreaSize.width / 25))}px`
                      }} />
                    ) : (
                      <div
                        className="bg-white rounded-full opacity-90"
                        style={{
                          width: `${Math.max(12, Math.min(16, gameAreaSize.width / 37.5))}px`,
                          height: `${Math.max(12, Math.min(16, gameAreaSize.width / 37.5))}px`
                        }}
                      ></div>
                    )}
                  </div>
                  {target.moving && (
                    <div
                      className="absolute bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg flex items-center justify-center"
                      style={{
                        top: '-8px',
                        right: '-8px',
                        width: `${Math.max(16, Math.min(20, gameAreaSize.width / 30))}px`,
                        height: `${Math.max(16, Math.min(20, gameAreaSize.width / 30))}px`
                      }}
                    >
                      <Zap className="text-white" style={{
                        width: `${Math.max(10, Math.min(14, gameAreaSize.width / 42))}px`,
                        height: `${Math.max(10, Math.min(14, gameAreaSize.width / 42))}px`
                      }} />
                    </div>
                  )}
                </div>
              ))}

              {/* Hit Effects */}
              {hitEffects.map((effect) => {
                const age = Date.now() - effect.timestamp;
                const progress = age / 1000;
                const opacity = Math.max(0, 1 - progress);
                const scale = 1 + progress * 2;
                const effectSize = Math.max(20, Math.min(40, gameAreaSize.width / 15));

                return (
                  <div
                    key={effect.id}
                    className="absolute pointer-events-none flex items-center justify-center"
                    style={{
                      left: effect.x - effectSize / 2,
                      top: effect.y - effectSize / 2,
                      width: `${effectSize}px`,
                      height: `${effectSize}px`,
                      opacity,
                      transform: `scale(${scale})`,
                      transition: 'all 0.1s ease-out'
                    }}
                  >
                    <div className={`font-bold ${effect.type === 'bonus' ? 'text-green-600' :
                      effect.type === 'penalty' ? 'text-red-600' : 'text-blue-600'
                      }`} style={{ fontSize: `${Math.max(14, Math.min(18, gameAreaSize.width / 33))}px` }}>
                      {effect.points > 0 ? `+${effect.points}` : effect.points}
                    </div>
                  </div>
                );
              })}

              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                <div
                  className="border-2 border-blue-400 rounded-full animate-pulse"
                  style={{
                    width: `${Math.max(24, Math.min(32, gameAreaSize.width / 18.75))}px`,
                    height: `${Math.max(24, Math.min(32, gameAreaSize.width / 18.75))}px`
                  }}
                ></div>
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-400 rounded-full"
                  style={{
                    width: `${Math.max(6, Math.min(8, gameAreaSize.width / 75))}px`,
                    height: `${Math.max(6, Math.min(8, gameAreaSize.width / 75))}px`
                  }}
                ></div>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-2 left-2 border-l-2 border-t-2 border-blue-300 opacity-50" style={{
                width: `${Math.max(8, Math.min(12, gameAreaSize.width / 50))}px`,
                height: `${Math.max(8, Math.min(12, gameAreaSize.width / 50))}px`
              }}></div>
              <div className="absolute top-2 right-2 border-r-2 border-t-2 border-blue-300 opacity-50" style={{
                width: `${Math.max(8, Math.min(12, gameAreaSize.width / 50))}px`,
                height: `${Math.max(8, Math.min(12, gameAreaSize.width / 50))}px`
              }}></div>
              <div className="absolute bottom-2 left-2 border-l-2 border-b-2 border-blue-300 opacity-50" style={{
                width: `${Math.max(8, Math.min(12, gameAreaSize.width / 50))}px`,
                height: `${Math.max(8, Math.min(12, gameAreaSize.width / 50))}px`
              }}></div>
              <div className="absolute bottom-2 right-2 border-r-2 border-b-2 border-blue-300 opacity-50" style={{
                width: `${Math.max(8, Math.min(12, gameAreaSize.width / 50))}px`,
                height: `${Math.max(8, Math.min(12, gameAreaSize.width / 50))}px`
              }}></div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="w-full max-w-2xl mb-6 px-2 sm:px-4">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Level Progress
                </span>
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {streak}/10 to next level
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-[#FF6B3E] to-[#FF8A65] h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${(streak % 10) * 10}%` }}
                >
                  <div className="h-full bg-white bg-opacity-30 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-4 rounded-lg mb-4 mx-2 sm:mx-4 transform transition-all duration-300 animate-bounce ${feedbackType === 'success' ? 'bg-green-100 text-green-800' :
              feedbackType === 'bonus' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'success' ? (
                  <Award className="h-6 w-6 text-green-600" />
                ) : feedbackType === 'bonus' ? (
                  <Zap className="h-6 w-6 text-yellow-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'success' ? 'Level Up!' : feedbackType === 'bonus' ? 'Bonus!' : 'Penalty!'}
                </div>
              </div>
              <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackMessage}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-3xl px-2 sm:px-4">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Tap the colored targets before they disappear! Blue targets give 10 points, green bonus targets give 15 points,
              but avoid red penalty targets that subtract 10 points. Build streaks for combo multipliers!
            </p>
            <div className="mt-3 text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-center">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Normal (+10)
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Bonus (+15)
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Penalty (-10)
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  Moving
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 opacity-75" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].description} |
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit
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
          accuracy: customStats.accuracy,
          correctTaps: targetsHit
        }}
      />
    </div>
  );
};

export default TapChallengeGame;