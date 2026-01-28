import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const TemporalReasoningArchitectGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes
  const [difficulty, setDifficulty] = useState('Easy');

  // Game-specific state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeType, setChallengeType] = useState('duration');
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [averageAccuracy, setAverageAccuracy] = useState(0);
  const [temporalScore, setTemporalScore] = useState(0);

  // Challenge types with temporal reasoning focus
  const challengeTypes = [
    {
      id: 'duration',
      name: 'Duration Estimation',
      icon: '⏱️',
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-700',
      description: 'Estimate time intervals accurately'
    },
    {
      id: 'sequence',
      name: 'Event Sequencing',
      icon: '📅',
      color: '#10B981',
      gradient: 'from-emerald-500 to-emerald-700',
      description: 'Order events chronologically'
    },
    {
      id: 'rhythm',
      name: 'Rhythm Matching',
      icon: '🎵',
      color: '#8B5CF6',
      gradient: 'from-violet-500 to-violet-700',
      description: 'Match temporal patterns'
    },
    {
      id: 'planning',
      name: 'Temporal Planning',
      icon: '🗓️',
      color: '#F59E0B',
      gradient: 'from-amber-500 to-amber-700',
      description: 'Plan optimal time sequences'
    },
    {
      id: 'prediction',
      name: 'Time Prediction',
      icon: '🔮',
      color: '#EF4444',
      gradient: 'from-red-500 to-red-700',
      description: 'Predict future time points'
    }
  ];

  // Get difficulty configuration
  const getDifficultyConfig = useCallback(() => {
    const configs = {
      Easy: {
        durationRange: [2, 8],
        sequenceLength: [3, 5],
        rhythmComplexity: 3,
        planningSteps: 4,
        tolerance: 20
      },
      Moderate: {
        durationRange: [1, 12],
        sequenceLength: [4, 7],
        rhythmComplexity: 5,
        planningSteps: 6,
        tolerance: 15
      },
      Hard: {
        durationRange: [0.5, 15],
        sequenceLength: [5, 9],
        rhythmComplexity: 7,
        planningSteps: 8,
        tolerance: 10
      }
    };
    return configs[difficulty];
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCurrentLevel(1);
    setCompletedChallenges(0);
    setCorrectAnswers(0);
    setStreakCount(0);
    setMaxStreak(0);
    setAverageAccuracy(0);
    setTemporalScore(0);

    const initialTime = difficulty === 'Easy' ? 240 : difficulty === 'Moderate' ? 180 : 120;
    setTimeRemaining(initialTime);

    generateNewChallenge();
  }, [difficulty]);

  // Generate new temporal challenge
  const generateNewChallenge = useCallback(() => {
    const types = challengeTypes.map(t => t.id);
    const randomType = types[Math.floor(Math.random() * types.length)];
    setChallengeType(randomType);

    const config = getDifficultyConfig();
    let challenge = {};

    switch (randomType) {
      case 'duration':
        challenge = generateDurationChallenge(config);
        break;
      case 'sequence':
        challenge = generateSequenceChallenge(config);
        break;
      case 'rhythm':
        challenge = generateRhythmChallenge(config);
        break;
      case 'planning':
        challenge = generatePlanningChallenge(config);
        break;
      case 'prediction':
        challenge = generatePredictionChallenge(config);
        break;
      default:
        challenge = generateDurationChallenge(config);
    }

    setCurrentChallenge(challenge);
  }, [challengeTypes, getDifficultyConfig]);

  // Duration estimation challenge
  const generateDurationChallenge = (config) => {
    const targetDuration = Math.random() * (config.durationRange[1] - config.durationRange[0]) + config.durationRange[0];
    const options = [
      targetDuration,
      targetDuration * 0.7,
      targetDuration * 1.3,
      targetDuration * 1.6
    ].sort(() => Math.random() - 0.5);

    return {
      type: 'duration',
      targetDuration: targetDuration * 1000, // Convert to milliseconds
      question: 'Watch the timer and estimate the duration',
      options: options.map(opt => `${opt.toFixed(1)}s`),
      correctAnswer: `${targetDuration.toFixed(1)}s`,
      tolerance: config.tolerance,
      phase: 'waiting' // waiting, timing, answering
    };
  };

  // Event sequencing challenge
  const generateSequenceChallenge = (config) => {
    const events = [
      { id: 1, text: 'Wake up', time: '7:00 AM', order: 1 },
      { id: 2, text: 'Eat breakfast', time: '8:00 AM', order: 2 },
      { id: 3, text: 'Go to work', time: '9:00 AM', order: 3 },
      { id: 4, text: 'Lunch break', time: '12:00 PM', order: 4 },
      { id: 5, text: 'Finish work', time: '5:00 PM', order: 5 },
      { id: 6, text: 'Dinner', time: '7:00 PM', order: 6 },
      { id: 7, text: 'Watch TV', time: '8:00 PM', order: 7 },
      { id: 8, text: 'Go to bed', time: '10:00 PM', order: 8 }
    ];

    const selectedEvents = events
      .sort(() => Math.random() - 0.5)
      .slice(0, config.sequenceLength[1])
      .sort((a, b) => a.order - b.order);

    const shuffledEvents = [...selectedEvents].sort(() => Math.random() - 0.5);

    return {
      type: 'sequence',
      question: 'Arrange these daily events in chronological order',
      events: shuffledEvents,
      correctOrder: selectedEvents.map(e => e.id),
      userOrder: []
    };
  };

  // Rhythm matching challenge
  const generateRhythmChallenge = (config) => {
    const pattern = Array.from({ length: config.rhythmComplexity }, () =>
      Math.random() > 0.5 ? 'short' : 'long'
    );

    return {
      type: 'rhythm',
      question: 'Listen to the rhythm pattern and reproduce it',
      pattern,
      userPattern: [],
      phase: 'listening' // listening, reproducing, complete
    };
  };

  // Temporal planning challenge
  const generatePlanningChallenge = (config) => {
    const tasks = [
      { id: 1, name: 'Meeting A', duration: 60, priority: 'high' },
      { id: 2, name: 'Email replies', duration: 30, priority: 'medium' },
      { id: 3, name: 'Project work', duration: 120, priority: 'high' },
      { id: 4, name: 'Coffee break', duration: 15, priority: 'low' },
      { id: 5, name: 'Phone calls', duration: 45, priority: 'medium' },
      { id: 6, name: 'Documentation', duration: 90, priority: 'medium' }
    ];

    const selectedTasks = tasks.slice(0, config.planningSteps);
    const timeSlots = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      time: `${9 + i}:00`,
      duration: 60,
      assigned: null
    }));

    return {
      type: 'planning',
      question: 'Schedule these tasks optimally within the time slots',
      tasks: selectedTasks,
      timeSlots,
      userSchedule: {},
      constraints: {
        totalTime: 480, // 8 hours
        mustComplete: selectedTasks.filter(t => t.priority === 'high')
      }
    };
  };

  // Time prediction challenge
  const generatePredictionChallenge = (config) => {
    const scenarios = [
      {
        context: 'Traffic jam during rush hour',
        normalTime: 20,
        factors: ['Heavy traffic', 'Road construction'],
        multiplier: 1.8
      },
      {
        context: 'Cooking pasta',
        normalTime: 12,
        factors: ['Al dente preference', 'Boiling water'],
        multiplier: 1.1
      },
      {
        context: 'Downloading a large file',
        normalTime: 300,
        factors: ['Slow internet', 'Peak hours'],
        multiplier: 2.2
      }
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const predictedTime = scenario.normalTime * scenario.multiplier;
    const options = [
      predictedTime,
      predictedTime * 0.6,
      predictedTime * 1.4,
      predictedTime * 0.8
    ].sort(() => Math.random() - 0.5);

    return {
      type: 'prediction',
      question: `Given the factors, how long will this take?`,
      scenario,
      options: options.map(opt => `${Math.round(opt)} ${opt > 60 ? 'minutes' : 'seconds'}`),
      correctAnswer: `${Math.round(predictedTime)} ${predictedTime > 60 ? 'minutes' : 'seconds'}`
    };
  };

  // Handle challenge completion
  const handleChallengeComplete = useCallback((isCorrect, userAnswer = null) => {
    setCompletedChallenges(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreakCount(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });

      // Calculate score based on challenge type and difficulty
      const baseScore = challengeType === 'duration' ? 15 :
        challengeType === 'sequence' ? 20 :
          challengeType === 'rhythm' ? 25 :
            challengeType === 'planning' ? 30 : 20;

      const difficultyMultiplier = difficulty === 'Easy' ? 1 : difficulty === 'Moderate' ? 1.5 : 2;
      const streakBonus = Math.min(streakCount * 2, 20);
      const finalScore = Math.floor(baseScore * difficultyMultiplier + streakBonus);

      setScore(prev => prev + finalScore);
      setTemporalScore(prev => prev + finalScore);
    } else {
      setStreakCount(0);
    }

    // Update accuracy
    const newAccuracy = ((correctAnswers + (isCorrect ? 1 : 0)) / (completedChallenges + 1)) * 100;
    setAverageAccuracy(newAccuracy);

    // Generate next challenge after delay
    setTimeout(() => {
      generateNewChallenge();
    }, 2000);
  }, [challengeType, difficulty, streakCount, correctAnswers, completedChallenges, generateNewChallenge]);

  // Game timer
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

  // Level progression
  useEffect(() => {
    if (completedChallenges > 0 && completedChallenges % 8 === 0) {
      setCurrentLevel(prev => prev + 1);
    }
  }, [completedChallenges]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    currentLevel,
    completedChallenges,
    correctAnswers,
    streakCount,
    maxStreak,
    averageAccuracy: Math.round(averageAccuracy),
    temporalScore
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Temporal Reasoning Architect"
        gameDescription="Master the perception of time! Test your temporal reasoning through duration estimation, event sequencing, and time-based planning challenges."
        category="Temporal Reasoning"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-7xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs sm:text-sm text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-emerald-200">
              <div className="text-xs sm:text-sm text-emerald-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Completed
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedChallenges}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs sm:text-sm text-purple-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Correct
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctAnswers}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-amber-200">
              <div className="text-xs sm:text-sm text-amber-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(averageAccuracy)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streakCount}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-orange-200">
              <div className="text-xs sm:text-sm text-orange-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Max Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-orange-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {maxStreak}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-gray-200">
              <div className="text-xs sm:text-sm text-gray-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Temporal Score
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {temporalScore}
              </div>
            </div>
          </div>

          {/* Current Challenge Display */}
          {gameState === 'playing' && currentChallenge && (
            <div className="w-full max-w-4xl">
              {/* Challenge Type Header */}
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
                  <span className="text-2xl">
                    {challengeTypes.find(t => t.id === challengeType)?.icon}
                  </span>
                  <div className="text-left">
                    <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {challengeTypes.find(t => t.id === challengeType)?.name}
                    </div>
                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {challengeTypes.find(t => t.id === challengeType)?.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Content */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <ChallengeComponent
                  challenge={currentChallenge}
                  challengeType={challengeType}
                  onComplete={handleChallengeComplete}
                  gameState={gameState}
                />
              </div>
            </div>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">⏰🧠</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Temporal Reasoning Architect
                </h3>
                <div className="text-left space-y-4 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">⏱️ Duration Estimation</h4>
                      <p className="text-sm">Watch timers and estimate durations accurately</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">📅 Event Sequencing</h4>
                      <p className="text-sm">Arrange daily events in chronological order</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">🎵 Rhythm Matching</h4>
                      <p className="text-sm">Listen and reproduce temporal patterns</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 mb-2">🗓️ Temporal Planning</h4>
                      <p className="text-sm">Schedule tasks optimally within time constraints</p>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-red-900 mb-2">🔮 Time Prediction</h4>
                    <p className="text-sm">Predict how long activities will take given various factors</p>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm"><strong>🎯 Goal:</strong> Master temporal reasoning across multiple time-based cognitive challenges</p>
                    <p className="text-sm"><strong>📊 Scoring:</strong> Higher accuracy and longer streaks earn more points</p>
                    <p className="text-sm"><strong>⚡ Progression:</strong> Complete 8 challenges to advance to the next level</p>
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
                  Temporal Analysis Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Final Score</div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{score}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Challenges</div>
                    <div className="text-2xl font-bold text-green-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{completedChallenges}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Accuracy</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{Math.round(averageAccuracy)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Max Streak</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{maxStreak}</div>
                  </div>
                </div>
                <div className="space-y-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>Temporal Reasoning Score: {temporalScore}</div>
                  <div>Time Perception Rating: {averageAccuracy > 80 ? 'Excellent' : averageAccuracy > 60 ? 'Good' : 'Developing'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GameFramework>
    </div>
  );
};

// Challenge Component
const ChallengeComponent = ({ challenge, challengeType, onComplete, gameState }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userSequence, setUserSequence] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Duration estimation timer
  useEffect(() => {
    let interval;
    if (challengeType === 'duration' && isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [challengeType, isTimerRunning]);

  // Auto-start duration timer
  useEffect(() => {
    if (challengeType === 'duration' && challenge.phase === 'waiting') {
      const timer = setTimeout(() => {
        setIsTimerRunning(true);
        challenge.phase = 'timing';
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [challengeType, challenge]);

  // Auto-stop duration timer
  useEffect(() => {
    if (challengeType === 'duration' && isTimerRunning && elapsedTime >= challenge.targetDuration) {
      setIsTimerRunning(false);
      challenge.phase = 'answering';
    }
  }, [challengeType, isTimerRunning, elapsedTime, challenge]);

  const handleAnswer = (answer) => {
    if (showFeedback) return;

    let isCorrect = false;
    let feedback = '';

    switch (challengeType) {
      case 'duration':
        isCorrect = answer === challenge.correctAnswer;
        feedback = isCorrect ? 'Perfect timing!' : `Close! The actual duration was ${challenge.correctAnswer}`;
        break;
      case 'sequence':
        isCorrect = JSON.stringify(userSequence) === JSON.stringify(challenge.correctOrder);
        feedback = isCorrect ? 'Perfect chronological order!' : 'Not quite the right sequence. Try again!';
        break;
      case 'rhythm':
        isCorrect = JSON.stringify(userSequence) === JSON.stringify(challenge.pattern);
        feedback = isCorrect ? 'Perfect rhythm match!' : 'Rhythm doesn\'t match. Listen again!';
        break;
      case 'planning':
        // Simple validation for planning
        isCorrect = Object.keys(challenge.userSchedule).length >= challenge.constraints.mustComplete.length;
        feedback = isCorrect ? 'Good scheduling!' : 'Make sure to schedule all high-priority tasks!';
        break;
      case 'prediction':
        isCorrect = answer === challenge.correctAnswer;
        feedback = isCorrect ? 'Excellent prediction!' : `Close! The predicted time was ${challenge.correctAnswer}`;
        break;
      default:
        isCorrect = false;
    }

    setFeedbackMessage(feedback);
    setShowFeedback(true);

    setTimeout(() => {
      onComplete(isCorrect, answer);
      setShowFeedback(false);
      setUserAnswer('');
      setUserSequence([]);
      setElapsedTime(0);
      setIsTimerRunning(false);
    }, 2000);
  };

  const handleSequenceClick = (eventId) => {
    if (challengeType === 'sequence') {
      const newSequence = [...userSequence, eventId];
      setUserSequence(newSequence);

      if (newSequence.length === challenge.events.length) {
        challenge.userOrder = newSequence;
        handleAnswer(newSequence);
      }
    }
  };

  const handleRhythmInput = (type) => {
    if (challengeType === 'rhythm') {
      const newPattern = [...userSequence, type];
      setUserSequence(newPattern);

      if (newPattern.length === challenge.pattern.length) {
        handleAnswer(newPattern);
      }
    }
  };

  if (showFeedback) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">
          {feedbackMessage.includes('Perfect') || feedbackMessage.includes('Excellent') || feedbackMessage.includes('Good') ? '✅' : '❌'}
        </div>
        <div className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {feedbackMessage}
        </div>
        <div className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Next challenge loading...
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold text-gray-900 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
        {challenge.question}
      </h3>

      {/* Duration Estimation Challenge */}
      {challengeType === 'duration' && (
        <div>
          {challenge.phase === 'waiting' && (
            <div className="text-lg text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Get ready... Timer will start in 1 second
            </div>
          )}

          {challenge.phase === 'timing' && (
            <div className="mb-6">
              <div className="text-6xl font-bold text-[#FF6B3E] mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ⏱️
              </div>
              <div className="text-lg text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Timer is running... Watch carefully!
              </div>
            </div>
          )}

          {challenge.phase === 'answering' && (
            <div>
              <div className="text-lg text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                How long was that duration?
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {challenge.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="bg-[#FF6B3E] text-white py-3 px-4 rounded-lg hover:bg-[#e55a35] transition-colors"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Sequencing Challenge */}
      {challengeType === 'sequence' && (
        <div>
          <div className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Click events in chronological order ({userSequence.length}/{challenge.events.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {challenge.events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleSequenceClick(event.id)}
                disabled={userSequence.includes(event.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${userSequence.includes(event.id)
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-white border-gray-300 hover:border-[#FF6B3E] hover:bg-orange-50'
                  }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <div className="font-semibold">{event.text}</div>
                <div className="text-sm text-gray-600">{event.time}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rhythm Matching Challenge */}
      {challengeType === 'rhythm' && (
        <div>
          <div className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Reproduce the rhythm pattern ({userSequence.length}/{challenge.pattern.length})
          </div>
          <div className="mb-6">
            <div className="text-lg font-semibold mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Pattern: {challenge.pattern.map(p => p === 'short' ? '●' : '●●').join(' ')}
            </div>
            <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Your input: {userSequence.map(p => p === 'short' ? '●' : '●●').join(' ')}
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleRhythmInput('short')}
              className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Short Beat ●
            </button>
            <button
              onClick={() => handleRhythmInput('long')}
              className="bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Long Beat ●●
            </button>
          </div>
        </div>
      )}

      {/* Time Prediction Challenge */}
      {challengeType === 'prediction' && (
        <div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-lg font-semibold mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Scenario: {challenge.scenario.context}
            </div>
            <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Normal time: {challenge.scenario.normalTime} {challenge.scenario.normalTime > 60 ? 'minutes' : 'seconds'}
            </div>
            <div className="text-sm text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Factors: {challenge.scenario.factors.join(', ')}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {challenge.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="bg-[#FF6B3E] text-white py-3 px-4 rounded-lg hover:bg-[#e55a35] transition-colors"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Planning Challenge */}
      {challengeType === 'planning' && (
        <div>
          <div className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Drag tasks to time slots to create an optimal schedule
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tasks */}
            <div>
              <h4 className="font-semibold mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>Available Tasks</h4>
              <div className="space-y-2">
                {challenge.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${task.priority === 'high' ? 'border-red-300 bg-red-50' :
                        task.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                          'border-gray-300 bg-gray-50'
                      }`}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div className="font-semibold">{task.name}</div>
                    <div className="text-sm text-gray-600">{task.duration} min • {task.priority} priority</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h4 className="font-semibold mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>Time Slots</h4>
              <div className="space-y-2">
                {challenge.timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-lg border-2 border-dashed border-gray-300 bg-white min-h-[60px] flex items-center justify-center"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{slot.time}</div>
                      <div className="text-sm text-gray-600">{slot.duration} min slot</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleAnswer('completed')}
            className="mt-6 bg-[#FF6B3E] text-white py-3 px-6 rounded-lg hover:bg-[#e55a35] transition-colors"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Complete Schedule
          </button>
        </div>
      )}
    </div>
  );
};

export default TemporalReasoningArchitectGame;
