import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const MetacognitiveStrategyNavigatorGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [difficulty, setDifficulty] = useState('Easy');

  // Game-specific state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [challengePhase, setChallengePhase] = useState('strategy'); // strategy, execute, reflect
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [correctStrategies, setCorrectStrategies] = useState(0);
  const [metacognitionScore, setMetacognitionScore] = useState(0);
  const [strategyEfficiency, setStrategyEfficiency] = useState(0);
  const [selfAwarenessLevel, setSelfAwarenessLevel] = useState(0);
  const [adaptiveThinking, setAdaptiveThinking] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [challengeStartTime, setChallengeStartTime] = useState(null);
  const [executionTime, setExecutionTime] = useState(0);
  const [confidenceRating, setConfidenceRating] = useState(3);
  const [actualPerformance, setActualPerformance] = useState(0);

  // Challenge types for metacognitive testing
  const challengeTypes = [
    {
      id: 'memory',
      name: 'Memory Challenge',
      icon: '🧠',
      description: 'Remember and recall information',
      strategies: [
        { id: 'rehearsal', name: 'Repetition', description: 'Repeat items mentally', effectiveness: 0.7 },
        { id: 'chunking', name: 'Chunking', description: 'Group items together', effectiveness: 0.9 },
        { id: 'visualization', name: 'Visualization', description: 'Create mental images', effectiveness: 0.8 },
        { id: 'association', name: 'Association', description: 'Link to known information', effectiveness: 0.85 }
      ]
    },
    {
      id: 'attention',
      name: 'Attention Challenge',
      icon: '👁️',
      description: 'Focus on relevant information',
      strategies: [
        { id: 'selective', name: 'Selective Focus', description: 'Focus on one thing', effectiveness: 0.8 },
        { id: 'divided', name: 'Divided Attention', description: 'Monitor multiple sources', effectiveness: 0.6 },
        { id: 'sustained', name: 'Sustained Focus', description: 'Maintain concentration', effectiveness: 0.9 },
        { id: 'switching', name: 'Attention Switching', description: 'Rapidly shift focus', effectiveness: 0.7 }
      ]
    },
    {
      id: 'problem',
      name: 'Problem Solving',
      icon: '🧩',
      description: 'Find solutions to complex problems',
      strategies: [
        { id: 'systematic', name: 'Systematic Approach', description: 'Step-by-step analysis', effectiveness: 0.85 },
        { id: 'creative', name: 'Creative Thinking', description: 'Think outside the box', effectiveness: 0.75 },
        { id: 'analogical', name: 'Analogical Reasoning', description: 'Use similar problems', effectiveness: 0.8 },
        { id: 'trial', name: 'Trial and Error', description: 'Test different solutions', effectiveness: 0.6 }
      ]
    },
    {
      id: 'learning',
      name: 'Learning Challenge',
      icon: '📚',
      description: 'Acquire new information effectively',
      strategies: [
        { id: 'elaboration', name: 'Elaboration', description: 'Connect to existing knowledge', effectiveness: 0.9 },
        { id: 'organization', name: 'Organization', description: 'Structure information', effectiveness: 0.85 },
        { id: 'practice', name: 'Distributed Practice', description: 'Space out learning', effectiveness: 0.8 },
        { id: 'testing', name: 'Self-Testing', description: 'Quiz yourself', effectiveness: 0.95 }
      ]
    },
    {
      id: 'decision',
      name: 'Decision Making',
      icon: '⚖️',
      description: 'Make optimal choices under uncertainty',
      strategies: [
        { id: 'rational', name: 'Rational Analysis', description: 'Weigh pros and cons', effectiveness: 0.8 },
        { id: 'intuitive', name: 'Intuitive Judgment', description: 'Trust your gut feeling', effectiveness: 0.7 },
        { id: 'satisficing', name: 'Satisficing', description: 'Find good enough solution', effectiveness: 0.75 },
        { id: 'optimization', name: 'Optimization', description: 'Find the best solution', effectiveness: 0.85 }
      ]
    }
  ];

  // Get difficulty configuration
  const getDifficultyConfig = useCallback(() => {
    const configs = {
      Easy: {
        challengeComplexity: 'basic',
        timePerChallenge: 45,
        strategyHints: true,
        reflectionRequired: false
      },
      Moderate: {
        challengeComplexity: 'intermediate',
        timePerChallenge: 35,
        strategyHints: false,
        reflectionRequired: true
      },
      Hard: {
        challengeComplexity: 'advanced',
        timePerChallenge: 25,
        strategyHints: false,
        reflectionRequired: true
      }
    };
    return configs[difficulty];
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCurrentLevel(1);
    setCompletedChallenges(0);
    setCorrectStrategies(0);
    setMetacognitionScore(0);
    setStrategyEfficiency(0);
    setSelfAwarenessLevel(0);
    setAdaptiveThinking(0);
    setStreakCount(0);
    setMaxStreak(0);
    setExecutionTime(0);
    setConfidenceRating(3);
    setActualPerformance(0);
    setChallengePhase('strategy');

    const initialTime = difficulty === 'Easy' ? 300 : difficulty === 'Moderate' ? 240 : 180;
    setTimeRemaining(initialTime);

    generateNewChallenge();
  }, [difficulty]);

  // Generate new metacognitive challenge
  const generateNewChallenge = useCallback(() => {
    const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    const config = getDifficultyConfig();

    const challenge = {
      type: randomType,
      complexity: config.challengeComplexity,
      timeLimit: config.timePerChallenge,
      content: generateChallengeContent(randomType, config),
      optimalStrategy: getOptimalStrategy(randomType, config),
      startTime: Date.now()
    };

    setCurrentChallenge(challenge);
    setSelectedStrategy(null);
    setChallengePhase('strategy');
    setChallengeStartTime(Date.now());
    setConfidenceRating(3);
  }, [challengeTypes, getDifficultyConfig]);

  // Generate challenge content based on type
  const generateChallengeContent = (type, config) => {
    switch (type.id) {
      case 'memory':
        return generateMemoryChallenge(config);
      case 'attention':
        return generateAttentionChallenge(config);
      case 'problem':
        return generateProblemChallenge(config);
      case 'learning':
        return generateLearningChallenge(config);
      case 'decision':
        return generateDecisionChallenge(config);
      default:
        return generateMemoryChallenge(config);
    }
  };

  // Memory challenge generator
  const generateMemoryChallenge = (config) => {
    const complexity = config.challengeComplexity;
    const itemCount = complexity === 'basic' ? 6 : complexity === 'intermediate' ? 8 : 10;
    const items = Array.from({ length: itemCount }, (_, i) =>
      Math.floor(Math.random() * 100).toString().padStart(2, '0')
    );

    return {
      task: 'Memorize these numbers in order',
      items,
      studyTime: complexity === 'basic' ? 8000 : complexity === 'intermediate' ? 6000 : 4000,
      recallType: 'sequence'
    };
  };

  // Attention challenge generator
  const generateAttentionChallenge = (config) => {
    const complexity = config.challengeComplexity;
    const distractorCount = complexity === 'basic' ? 3 : complexity === 'intermediate' ? 5 : 7;

    return {
      task: 'Find all red circles among distractors',
      targetCount: complexity === 'basic' ? 2 : complexity === 'intermediate' ? 3 : 4,
      distractorCount,
      timeLimit: complexity === 'basic' ? 15000 : complexity === 'intermediate' ? 12000 : 10000
    };
  };

  // Problem solving challenge generator
  const generateProblemChallenge = (config) => {
    const complexity = config.challengeComplexity;
    const problems = {
      basic: [
        { question: 'If 2 + 2 = 4, what is 4 + 4?', answer: '8', steps: 2 },
        { question: 'Complete the pattern: 2, 4, 6, ?', answer: '8', steps: 2 }
      ],
      intermediate: [
        { question: 'If a train travels 60 mph for 2 hours, how far does it go?', answer: '120', steps: 3 },
        { question: 'What comes next: 1, 1, 2, 3, 5, ?', answer: '8', steps: 4 }
      ],
      advanced: [
        { question: 'A farmer has chickens and cows. Total: 30 animals, 74 legs. How many chickens?', answer: '23', steps: 5 },
        { question: 'If 3x + 7 = 22, what is x?', answer: '5', steps: 4 }
      ]
    };

    const problemSet = problems[complexity];
    return problemSet[Math.floor(Math.random() * problemSet.length)];
  };

  // Learning challenge generator
  const generateLearningChallenge = (config) => {
    const complexity = config.challengeComplexity;
    const concepts = {
      basic: [
        { concept: 'Photosynthesis', facts: ['Plants make food', 'Uses sunlight', 'Produces oxygen'] },
        { concept: 'Water Cycle', facts: ['Evaporation', 'Condensation', 'Precipitation'] }
      ],
      intermediate: [
        { concept: 'Mitosis', facts: ['Cell division', 'Identical cells', 'Growth and repair', 'Four phases'] },
        { concept: 'Democracy', facts: ['People vote', 'Representative government', 'Majority rule', 'Individual rights'] }
      ],
      advanced: [
        { concept: 'Quantum Physics', facts: ['Wave-particle duality', 'Uncertainty principle', 'Superposition', 'Entanglement', 'Observer effect'] },
        { concept: 'Cognitive Load Theory', facts: ['Working memory limits', 'Intrinsic load', 'Extraneous load', 'Germane load', 'Schema formation'] }
      ]
    };

    const conceptSet = concepts[complexity];
    return conceptSet[Math.floor(Math.random() * conceptSet.length)];
  };

  // Decision making challenge generator
  const generateDecisionChallenge = (config) => {
    const complexity = config.challengeComplexity;
    const scenarios = {
      basic: [
        {
          scenario: 'Choose a restaurant for dinner',
          options: ['Fast food (quick, cheap)', 'Fine dining (expensive, slow)', 'Home cooking (effort, healthy)'],
          factors: ['time', 'cost', 'health']
        }
      ],
      intermediate: [
        {
          scenario: 'Choose a college major',
          options: ['Engineering (high salary, difficult)', 'Art (fulfilling, uncertain income)', 'Business (versatile, competitive)'],
          factors: ['passion', 'income', 'job security', 'difficulty']
        }
      ],
      advanced: [
        {
          scenario: 'Investment portfolio allocation',
          options: ['Stocks (high risk/reward)', 'Bonds (stable, low return)', 'Real estate (moderate risk)', 'Cash (safe, inflation risk)'],
          factors: ['risk tolerance', 'time horizon', 'liquidity needs', 'inflation protection']
        }
      ]
    };

    const scenarioSet = scenarios[complexity];
    return scenarioSet[Math.floor(Math.random() * scenarioSet.length)];
  };

  // Get optimal strategy for challenge type
  const getOptimalStrategy = (type, config) => {
    const strategies = type.strategies;
    // Return the strategy with highest effectiveness for this challenge type
    return strategies.reduce((best, current) =>
      current.effectiveness > best.effectiveness ? current : best
    );
  };

  // Handle strategy selection
  const handleStrategySelect = useCallback((strategy) => {
    setSelectedStrategy(strategy);
    setChallengePhase('execute');
    setChallengeStartTime(Date.now());
  }, []);

  // Handle challenge execution completion
  const handleExecutionComplete = useCallback((performance) => {
    const endTime = Date.now();
    const executionDuration = endTime - challengeStartTime;
    setExecutionTime(executionDuration);
    setActualPerformance(performance);

    const config = getDifficultyConfig();
    if (config.reflectionRequired) {
      setChallengePhase('reflect');
    } else {
      processResults(performance, executionDuration);
    }
  }, [challengeStartTime, getDifficultyConfig]);

  // Handle reflection completion
  const handleReflectionComplete = useCallback(() => {
    processResults(actualPerformance, executionTime);
  }, [actualPerformance, executionTime]);

  // Process challenge results
  const processResults = useCallback((performance, duration) => {
    setCompletedChallenges(prev => prev + 1);

    const isOptimalStrategy = selectedStrategy && selectedStrategy.id === currentChallenge.optimalStrategy.id;
    const strategyEffectiveness = selectedStrategy ? selectedStrategy.effectiveness : 0;
    const timeEfficiency = Math.max(0, 1 - (duration / (currentChallenge.timeLimit * 1000)));
    const confidenceAccuracy = Math.abs(confidenceRating - performance) / 5; // 0 = perfect calibration

    if (isOptimalStrategy) {
      setCorrectStrategies(prev => prev + 1);
      setStreakCount(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });
    } else {
      setStreakCount(0);
    }

    // Calculate metacognitive scores
    const strategyScore = strategyEffectiveness * 100;
    const efficiencyScore = timeEfficiency * 100;
    const awarenessScore = (1 - confidenceAccuracy) * 100;
    const adaptationScore = performance * 100;

    const totalScore = Math.floor(
      (strategyScore + efficiencyScore + awarenessScore + adaptationScore) / 4 *
      (difficulty === 'Easy' ? 1 : difficulty === 'Moderate' ? 1.5 : 2)
    );

    setScore(prev => prev + totalScore);
    setMetacognitionScore(prev => prev + totalScore);
    setStrategyEfficiency(strategyEffectiveness * 100);
    setSelfAwarenessLevel(awarenessScore);
    setAdaptiveThinking(adaptationScore);

    // Generate next challenge after delay
    setTimeout(() => {
      generateNewChallenge();
    }, 2000);
  }, [selectedStrategy, currentChallenge, confidenceRating, difficulty, generateNewChallenge]);

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
    if (correctStrategies > 0 && correctStrategies % 5 === 0) {
      setCurrentLevel(prev => prev + 1);
    }
  }, [correctStrategies]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
    console.log('Metacognitive Strategy Navigator completed:', payload);
  };

  const customStats = {
    currentLevel,
    completedChallenges,
    correctStrategies,
    metacognitionScore,
    strategyEfficiency: Math.round(strategyEfficiency),
    selfAwarenessLevel: Math.round(selfAwarenessLevel),
    adaptiveThinking: Math.round(adaptiveThinking),
    streakCount,
    maxStreak
  };

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}
      <GameFramework
        gameTitle="Metacognitive Strategy Navigator"
        gameShortDescription="Master the art of thinking about thinking! Choose optimal strategies, monitor your performance, and develop metacognitive awareness."
        gameDescription="Master the art of thinking about thinking! Choose optimal strategies, monitor your performance, and develop metacognitive awareness."
        category="Gameacy"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-8xl">
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
                Challenges
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedChallenges}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs sm:text-sm text-purple-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Optimal
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctStrategies}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-amber-200">
              <div className="text-xs sm:text-sm text-amber-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Metacognition
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metacognitionScore}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Strategy
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(strategyEfficiency)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-cyan-200">
              <div className="text-xs sm:text-sm text-cyan-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Awareness
              </div>
              <div className="text-lg sm:text-2xl font-bold text-cyan-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(selfAwarenessLevel)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-orange-200">
              <div className="text-xs sm:text-sm text-orange-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Adaptive
              </div>
              <div className="text-lg sm:text-2xl font-bold text-orange-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(adaptiveThinking)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-pink-200">
              <div className="text-xs sm:text-sm text-pink-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-pink-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streakCount}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-gray-200">
              <div className="text-xs sm:text-sm text-gray-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Max Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {maxStreak}
              </div>
            </div>
          </div>

          {/* Strategy Selection Phase */}
          {gameState === 'playing' && currentChallenge && challengePhase === 'strategy' && (
            <div className="w-full max-w-5xl">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 mb-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{currentChallenge.type.icon}</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentChallenge.type.name}
                  </h3>
                  <p className="text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentChallenge.type.description}
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Challenge Preview:
                    </h4>
                    <ChallengePreview challenge={currentChallenge} />
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🧠 Choose Your Strategy:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentChallenge.type.strategies.map((strategy) => (
                      <button
                        key={strategy.id}
                        onClick={() => handleStrategySelect(strategy)}
                        className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-[#FF6B3E] hover:bg-orange-50 transition-all duration-200"
                      >
                        <div className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {strategy.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {strategy.description}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Effectiveness:
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#FF6B3E] h-2 rounded-full"
                              style={{ width: `${strategy.effectiveness * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {Math.round(strategy.effectiveness * 100)}%
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Challenge Execution Phase */}
          {gameState === 'playing' && currentChallenge && challengePhase === 'execute' && (
            <div className="w-full max-w-4xl">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{currentChallenge.type.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Executing: {selectedStrategy?.name}
                  </h3>
                  <p className="text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {selectedStrategy?.description}
                  </p>
                </div>

                <ChallengeExecution
                  challenge={currentChallenge}
                  strategy={selectedStrategy}
                  onComplete={handleExecutionComplete}
                />
              </div>
            </div>
          )}

          {/* Reflection Phase */}
          {gameState === 'playing' && currentChallenge && challengePhase === 'reflect' && (
            <div className="w-full max-w-4xl">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🤔</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Metacognitive Reflection
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      How confident were you in your strategy choice? (1-5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setConfidenceRating(rating)}
                          className={`w-12 h-12 rounded-full border-2 font-semibold transition-colors ${confidenceRating === rating
                            ? 'bg-[#FF6B3E] border-[#FF6B3E] text-white'
                            : 'border-gray-300 text-gray-600 hover:border-[#FF6B3E]'
                            }`}
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Strategy Analysis:
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Your Strategy:
                          </div>
                          <div className="font-medium text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {selectedStrategy?.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Optimal Strategy:
                          </div>
                          <div className="font-medium text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {currentChallenge.optimalStrategy?.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Your Effectiveness:
                          </div>
                          <div className="font-medium text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {Math.round((selectedStrategy?.effectiveness || 0) * 100)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Execution Time:
                          </div>
                          <div className="font-medium text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {Math.round(executionTime / 1000)}s
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleReflectionComplete}
                    className="w-full bg-[#FF6B3E] text-white py-3 px-6 rounded-xl hover:bg-[#e55a35] transition-colors font-medium"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Continue to Next Challenge
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🧠🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Metacognitive Strategy Navigator
                </h3>

                <div className="text-left space-y-6 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {/* What is this game */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">🎯 What is Metacognitive Strategy Navigator?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Metacognitive Strategy Navigator is the first game in your collection to test metacognition -
                      thinking about thinking. You'll face various cognitive challenges and must choose the optimal
                      strategy for each one, then reflect on your performance. This game develops self-awareness
                      of your cognitive processes and strategic thinking abilities.
                    </p>
                  </div>

                  {/* How to play */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">📋 How to Play:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <strong>Analyze the Challenge:</strong> Each round presents a cognitive challenge (memory, attention,
                          problem-solving, learning, or decision-making). Study the task requirements carefully.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <strong>Choose Your Strategy:</strong> Select from 4 different cognitive strategies, each with
                          different effectiveness ratings. Consider which approach would work best for this specific challenge.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <strong>Execute the Challenge:</strong> Apply your chosen strategy to complete the cognitive task.
                          Your performance will be measured based on accuracy and efficiency.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <strong>Reflect and Learn:</strong> Evaluate your strategy choice, compare it to the optimal approach,
                          and rate your confidence. This builds metacognitive awareness.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Challenge types */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">🧩 Five Challenge Types:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🧠</span>
                          <div>
                            <div className="font-semibold">Memory Challenge</div>
                            <div className="text-sm text-gray-600">Remember and recall information</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">👁️</span>
                          <div>
                            <div className="font-semibold">Attention Challenge</div>
                            <div className="text-sm text-gray-600">Focus on relevant information</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🧩</span>
                          <div>
                            <div className="font-semibold">Problem Solving</div>
                            <div className="text-sm text-gray-600">Find solutions to complex problems</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📚</span>
                          <div>
                            <div className="font-semibold">Learning Challenge</div>
                            <div className="text-sm text-gray-600">Acquire new information effectively</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⚖️</span>
                          <div>
                            <div className="font-semibold">Decision Making</div>
                            <div className="text-sm text-gray-600">Make optimal choices under uncertainty</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty and tips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">⚡ Difficulty Levels:</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="font-semibold text-green-700">🟢 Easy</div>
                          <div className="text-sm">Basic challenges, 45s per task, strategy hints</div>
                        </div>
                        <div>
                          <div className="font-semibold text-yellow-700">🟡 Moderate</div>
                          <div className="text-sm">Intermediate challenges, 35s per task, reflection required</div>
                        </div>
                        <div>
                          <div className="font-semibold text-red-700">🔴 Hard</div>
                          <div className="text-sm">Advanced challenges, 25s per task, full metacognition</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">💡 Pro Tips:</h4>
                      <div className="space-y-2 text-sm">
                        <div>• Match strategy to challenge type</div>
                        <div>• Consider effectiveness ratings</div>
                        <div>• Reflect honestly on performance</div>
                        <div>• Learn from optimal strategies</div>
                        <div>• Build metacognitive awareness</div>
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
                  Metacognitive Assessment Complete!
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
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Strategy Efficiency</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{Math.round(strategyEfficiency)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Self-Awareness</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{Math.round(selfAwarenessLevel)}%</div>
                  </div>
                </div>
                <div className="space-y-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>Metacognitive Level: {selfAwarenessLevel > 85 ? 'Exceptional' : selfAwarenessLevel > 70 ? 'Advanced' : selfAwarenessLevel > 55 ? 'Proficient' : 'Developing'}</div>
                  <div>Strategic Thinking: {strategyEfficiency > 80 ? 'Expert' : strategyEfficiency > 65 ? 'Skilled' : strategyEfficiency > 50 ? 'Competent' : 'Learning'}</div>
                  <div>Max Streak: {maxStreak} optimal strategies</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GameFramework>
    </div>
  );
};

// Challenge Preview Component
const ChallengePreview = ({ challenge }) => {
  const { type, content } = challenge;

  switch (type.id) {
    case 'memory':
      return (
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {content.task}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {content.items.slice(0, 4).map((item, index) => (
              <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-mono">
                {item}
              </div>
            ))}
            {content.items.length > 4 && (
              <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                +{content.items.length - 4} more
              </div>
            )}
          </div>
        </div>
      );
    case 'attention':
      return (
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {content.task}
          </div>
          <div className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Find {content.targetCount} targets among {content.distractorCount} distractors
          </div>
        </div>
      );
    case 'problem':
      return (
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Problem to solve:
          </div>
          <div className="bg-gray-100 p-3 rounded-lg text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {content.question}
          </div>
        </div>
      );
    case 'learning':
      return (
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Learn about: {content.concept}
          </div>
          <div className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {content.facts.length} key facts to remember
          </div>
        </div>
      );
    case 'decision':
      return (
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Decision scenario:
          </div>
          <div className="bg-gray-100 p-3 rounded-lg text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {content.scenario}
          </div>
        </div>
      );
    default:
      return <div>Challenge preview not available</div>;
  }
};

// Challenge Execution Component
const ChallengeExecution = ({ challenge, strategy, onComplete }) => {
  const [executionState, setExecutionState] = useState('ready');
  const [userResponse, setUserResponse] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [studyItems, setStudyItems] = useState([]);
  const [showStudy, setShowStudy] = useState(false);

  useEffect(() => {
    if (challenge.type.id === 'memory') {
      setShowStudy(true);
      setStudyItems(challenge.content.items);
      setStartTime(Date.now());

      setTimeout(() => {
        setShowStudy(false);
        setExecutionState('recall');
      }, challenge.content.studyTime);
    } else {
      setExecutionState('active');
      setStartTime(Date.now());
    }
  }, [challenge]);

  const handleSubmit = () => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Calculate performance based on challenge type
    let performance = 0;

    switch (challenge.type.id) {
      case 'memory':
        const correctItems = userResponse.split(',').map(s => s.trim()).filter(item =>
          challenge.content.items.includes(item)
        );
        performance = correctItems.length / challenge.content.items.length;
        break;
      case 'problem':
        performance = userResponse.toLowerCase().trim() === challenge.content.answer.toLowerCase() ? 1 : 0;
        break;
      case 'attention':
      case 'learning':
      case 'decision':
        // Simplified performance calculation
        performance = Math.random() * 0.4 + 0.6; // 60-100% range
        break;
      default:
        performance = 0.8;
    }

    onComplete(performance);
  };

  if (challenge.type.id === 'memory' && showStudy) {
    return (
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Study these items:
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-4">
          {studyItems.map((item, index) => (
            <div key={index} className="bg-blue-100 text-blue-800 p-3 rounded-lg font-mono text-lg">
              {item}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Memorizing using: {strategy.name}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {challenge.type.id === 'memory' ? 'Recall the items in order:' : 'Complete the challenge:'}
        </div>

        {challenge.type.id === 'problem' && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {challenge.content.question}
            </div>
          </div>
        )}

        {challenge.type.id === 'learning' && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {challenge.content.concept}
            </div>
            <div className="space-y-1">
              {challenge.content.facts.map((fact, index) => (
                <div key={index} className="text-sm text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  • {fact}
                </div>
              ))}
            </div>
          </div>
        )}

        {challenge.type.id === 'decision' && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="text-gray-800 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {challenge.content.scenario}
            </div>
            <div className="space-y-2">
              {challenge.content.options.map((option, index) => (
                <div key={index} className="text-sm text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {String.fromCharCode(65 + index)}. {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Your Response:
        </label>
        <textarea
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B3E] focus:border-transparent"
          rows={3}
          placeholder={
            challenge.type.id === 'memory' ? 'Enter items separated by commas...' :
              challenge.type.id === 'problem' ? 'Enter your answer...' :
                challenge.type.id === 'decision' ? 'Enter your choice (A, B, C, etc.)...' :
                  'Enter your response...'
          }
          style={{ fontFamily: 'Roboto, sans-serif' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!userResponse.trim()}
        className="w-full bg-[#FF6B3E] text-white py-3 px-6 rounded-xl hover:bg-[#e55a35] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        Submit Response
      </button>
    </div>
  );
};

export default MetacognitiveStrategyNavigatorGame;
