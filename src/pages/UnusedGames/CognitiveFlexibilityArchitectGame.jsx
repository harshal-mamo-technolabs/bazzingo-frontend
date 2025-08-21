import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const CognitiveFlexibilityArchitectGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes
  const [difficulty, setDifficulty] = useState('Easy');

  // Game-specific state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentRule, setCurrentRule] = useState(null);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [completedTrials, setCompletedTrials] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [ruleChanges, setRuleChanges] = useState(0);
  const [adaptationSpeed, setAdaptationSpeed] = useState(0);
  const [flexibilityScore, setFlexibilityScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [trialsInCurrentRule, setTrialsInCurrentRule] = useState(0);

  // Rule types for cognitive flexibility testing
  const ruleTypes = [
    {
      id: 'color',
      name: 'Color Sorting',
      icon: '🎨',
      description: 'Sort by color (red, blue, green, yellow)',
      categories: ['red', 'blue', 'green', 'yellow'],
      getCategory: (stimulus) => stimulus.color
    },
    {
      id: 'shape',
      name: 'Shape Sorting',
      icon: '🔷',
      description: 'Sort by shape (circle, square, triangle, star)',
      categories: ['circle', 'square', 'triangle', 'star'],
      getCategory: (stimulus) => stimulus.shape
    },
    {
      id: 'size',
      name: 'Size Sorting',
      icon: '📏',
      description: 'Sort by size (small, medium, large)',
      categories: ['small', 'medium', 'large'],
      getCategory: (stimulus) => stimulus.size
    },
    {
      id: 'number',
      name: 'Number Sorting',
      icon: '🔢',
      description: 'Sort by quantity (1, 2, 3, 4)',
      categories: ['1', '2', '3', '4'],
      getCategory: (stimulus) => stimulus.number.toString()
    },
    {
      id: 'pattern',
      name: 'Pattern Sorting',
      icon: '🔄',
      description: 'Sort by pattern (solid, striped, dotted, gradient)',
      categories: ['solid', 'striped', 'dotted', 'gradient'],
      getCategory: (stimulus) => stimulus.pattern
    }
  ];

  // Stimulus properties
  const stimulusProperties = {
    colors: ['red', 'blue', 'green', 'yellow'],
    shapes: ['circle', 'square', 'triangle', 'star'],
    sizes: ['small', 'medium', 'large'],
    numbers: [1, 2, 3, 4],
    patterns: ['solid', 'striped', 'dotted', 'gradient']
  };

  // Get difficulty configuration
  const getDifficultyConfig = useCallback(() => {
    const configs = {
      Easy: {
        ruleChangeFrequency: 8,
        feedbackDelay: 1500,
        stimulusTime: 0,
        availableRules: 3
      },
      Moderate: {
        ruleChangeFrequency: 6,
        feedbackDelay: 1000,
        stimulusTime: 0,
        availableRules: 4
      },
      Hard: {
        ruleChangeFrequency: 4,
        feedbackDelay: 750,
        stimulusTime: 0,
        availableRules: 5
      }
    };
    return configs[difficulty];
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCurrentLevel(1);
    setCompletedTrials(0);
    setCorrectAnswers(0);
    setRuleChanges(0);
    setAdaptationSpeed(0);
    setFlexibilityScore(0);
    setStreakCount(0);
    setMaxStreak(0);
    setTrialsInCurrentRule(0);
    setShowFeedback(false);

    const initialTime = difficulty === 'Easy' ? 240 : difficulty === 'Moderate' ? 180 : 120;
    setTimeRemaining(initialTime);

    // Start with first rule
    changeRule();
  }, [difficulty]);

  // Generate new stimulus
  const generateStimulus = useCallback(() => {
    const stimulus = {
      id: Date.now(),
      color: stimulusProperties.colors[Math.floor(Math.random() * stimulusProperties.colors.length)],
      shape: stimulusProperties.shapes[Math.floor(Math.random() * stimulusProperties.shapes.length)],
      size: stimulusProperties.sizes[Math.floor(Math.random() * stimulusProperties.sizes.length)],
      number: stimulusProperties.numbers[Math.floor(Math.random() * stimulusProperties.numbers.length)],
      pattern: stimulusProperties.patterns[Math.floor(Math.random() * stimulusProperties.patterns.length)]
    };

    setCurrentStimulus(stimulus);
  }, [stimulusProperties]);

  // Change to new rule
  const changeRule = useCallback(() => {
    const config = getDifficultyConfig();
    const availableRules = ruleTypes.slice(0, config.availableRules);

    // Don't repeat the same rule immediately
    const newRule = availableRules.filter(rule => !currentRule || rule.id !== currentRule.id)[
      Math.floor(Math.random() * (availableRules.length - (currentRule ? 1 : 0)))
    ];

    setCurrentRule(newRule);
    setTrialsInCurrentRule(0);
    setRuleChanges(prev => prev + 1);
    generateStimulus();
  }, [currentRule, getDifficultyConfig, ruleTypes, generateStimulus]);

  // Handle category selection
  const handleCategorySelect = useCallback((selectedCategory) => {
    if (showFeedback || !currentRule || !currentStimulus) return;

    const correctCategory = currentRule.getCategory(currentStimulus);
    const isCorrect = selectedCategory === correctCategory;

    setCompletedTrials(prev => prev + 1);
    setTrialsInCurrentRule(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreakCount(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });

      // Calculate score
      const baseScore = 20;
      const streakBonus = Math.min(streakCount * 2, 20);
      const speedBonus = trialsInCurrentRule <= 2 ? 10 : 0; // Bonus for quick adaptation
      const difficultyMultiplier = difficulty === 'Easy' ? 1 : difficulty === 'Moderate' ? 1.5 : 2;
      const finalScore = Math.floor((baseScore + streakBonus + speedBonus) * difficultyMultiplier);

      setScore(prev => prev + finalScore);
      setFlexibilityScore(prev => prev + finalScore);
      setFeedbackMessage('✅ Correct! Great cognitive flexibility!');
    } else {
      setStreakCount(0);
      setFeedbackMessage(`❌ Incorrect. The rule is: ${currentRule.description}`);
    }

    // Calculate adaptation speed
    const accuracy = ((correctAnswers + (isCorrect ? 1 : 0)) / (completedTrials + 1)) * 100;
    setAdaptationSpeed(accuracy);

    setShowFeedback(true);

    // Auto-advance after feedback
    setTimeout(() => {
      setShowFeedback(false);

      const config = getDifficultyConfig();
      // Change rule based on frequency or after errors
      if (trialsInCurrentRule >= config.ruleChangeFrequency || (!isCorrect && trialsInCurrentRule >= 2)) {
        changeRule();
      } else {
        generateStimulus();
      }
    }, config.feedbackDelay);
  }, [showFeedback, currentRule, currentStimulus, completedTrials, correctAnswers, streakCount, trialsInCurrentRule, difficulty, getDifficultyConfig, changeRule, generateStimulus]);

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
    if (correctAnswers > 0 && correctAnswers % 10 === 0) {
      setCurrentLevel(prev => prev + 1);
    }
  }, [correctAnswers]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
    console.log('Cognitive Flexibility Architect completed:', payload);
  };

  const customStats = {
    currentLevel,
    completedTrials,
    correctAnswers,
    ruleChanges,
    adaptationSpeed: Math.round(adaptationSpeed),
    flexibilityScore,
    streakCount,
    maxStreak
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Cognitive Flexibility Architect"
        gameDescription="Master mental agility and adaptive thinking! Switch between different sorting rules and adapt quickly to changing cognitive demands."
        category="Cognitive Flexibility"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-7xl">
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
                Trials
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedTrials}
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
                Rule Changes
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {ruleChanges}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Adaptation
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(adaptationSpeed)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-cyan-200">
              <div className="text-xs sm:text-sm text-cyan-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Flexibility
              </div>
              <div className="text-lg sm:text-2xl font-bold text-cyan-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {flexibilityScore}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-orange-200">
              <div className="text-xs sm:text-sm text-orange-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-orange-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
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

          {/* Current Rule Display */}
          {gameState === 'playing' && currentRule && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
                <span className="text-2xl">{currentRule.icon}</span>
                <div className="text-left">
                  <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Current Rule: {currentRule.name}
                  </div>
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentRule.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stimulus and Response Area */}
          {gameState === 'playing' && currentStimulus && !showFeedback && (
            <div className="w-full max-w-4xl">
              {/* Stimulus Display */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 mb-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Categorize this stimulus according to the current rule:
                  </h3>
                  <StimulusDisplay stimulus={currentStimulus} />
                </div>

                {/* Category Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {currentRule.categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="bg-[#FF6B3E] text-white py-4 px-6 rounded-xl hover:bg-[#e55a35] transition-colors font-medium capitalize"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Display */}
          {gameState === 'playing' && showFeedback && (
            <div className="w-full max-w-2xl">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
                <div className="text-4xl mb-4">
                  {feedbackMessage.includes('✅') ? '🎉' : '💡'}
                </div>
                <div className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackMessage}
                </div>
                {currentStimulus && (
                  <div className="mb-4">
                    <StimulusDisplay stimulus={currentStimulus} />
                  </div>
                )}
                <div className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackMessage.includes('❌') ? 'Learn from this and adapt quickly!' : 'Keep up the mental flexibility!'}
                </div>
              </div>
            </div>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🧠⚡</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Cognitive Flexibility Architect
                </h3>

                <div className="text-left space-y-6 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {/* What is this game */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">🎯 What is Cognitive Flexibility Architect?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Cognitive Flexibility Architect is an advanced mental agility game that tests your ability to rapidly
                      switch between different cognitive frameworks and adapt to changing rules. You'll categorize stimuli
                      according to different sorting rules that change throughout the game, challenging your mental
                      set-shifting abilities and adaptive reasoning skills.
                    </p>
                  </div>

                  {/* How to play */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">📋 How to Play:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <strong>Learn the Rule:</strong> Each round starts with a sorting rule (color, shape, size, number, or pattern).
                          Pay attention to the current rule displayed at the top.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <strong>Categorize Stimuli:</strong> Look at each stimulus (colored shape with various properties)
                          and categorize it according to the current rule.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <strong>Adapt Quickly:</strong> Rules change frequently! When you notice the rule has changed,
                          quickly adapt your categorization strategy.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <strong>Build Flexibility:</strong> The faster you adapt to new rules, the higher your cognitive
                          flexibility score becomes.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rule types */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">🔄 Sorting Rules:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎨</span>
                          <div>
                            <div className="font-semibold">Color Sorting</div>
                            <div className="text-sm text-gray-600">Sort by color: red, blue, green, yellow</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🔷</span>
                          <div>
                            <div className="font-semibold">Shape Sorting</div>
                            <div className="text-sm text-gray-600">Sort by shape: circle, square, triangle, star</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📏</span>
                          <div>
                            <div className="font-semibold">Size Sorting</div>
                            <div className="text-sm text-gray-600">Sort by size: small, medium, large</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🔢</span>
                          <div>
                            <div className="font-semibold">Number Sorting</div>
                            <div className="text-sm text-gray-600">Sort by quantity: 1, 2, 3, 4</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🔄</span>
                          <div>
                            <div className="font-semibold">Pattern Sorting</div>
                            <div className="text-sm text-gray-600">Sort by pattern: solid, striped, dotted, gradient</div>
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
                          <div className="text-sm">3 rules, changes every 8 trials, 1.5s feedback</div>
                        </div>
                        <div>
                          <div className="font-semibold text-yellow-700">🟡 Moderate</div>
                          <div className="text-sm">4 rules, changes every 6 trials, 1s feedback</div>
                        </div>
                        <div>
                          <div className="font-semibold text-red-700">🔴 Hard</div>
                          <div className="text-sm">5 rules, changes every 4 trials, 0.75s feedback</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">💡 Pro Tips:</h4>
                      <div className="space-y-2 text-sm">
                        <div>• Pay attention to feedback patterns</div>
                        <div>• Notice when rules change</div>
                        <div>• Stay mentally flexible</div>
                        <div>• Don't get stuck on old rules</div>
                        <div>• Quick adaptation = higher scores</div>
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
                  Cognitive Flexibility Assessment Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Final Score</div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{score}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Trials</div>
                    <div className="text-2xl font-bold text-green-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{completedTrials}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Adaptation</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{Math.round(adaptationSpeed)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Rule Changes</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{ruleChanges}</div>
                  </div>
                </div>
                <div className="space-y-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>Cognitive Flexibility Score: {flexibilityScore}</div>
                  <div>Mental Agility Level: {adaptationSpeed > 85 ? 'Exceptional' : adaptationSpeed > 70 ? 'Advanced' : adaptationSpeed > 55 ? 'Proficient' : 'Developing'}</div>
                  <div>Max Streak: {maxStreak} consecutive correct</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GameFramework>
    </div>
  );
};

// Stimulus Display Component
const StimulusDisplay = ({ stimulus }) => {
  const getColorValue = (color) => {
    const colorMap = {
      red: '#EF4444',
      blue: '#3B82F6',
      green: '#10B981',
      yellow: '#F59E0B'
    };
    return colorMap[color] || '#6B7280';
  };

  const getSizeClass = (size) => {
    const sizeMap = {
      small: 'w-16 h-16',
      medium: 'w-24 h-24',
      large: 'w-32 h-32'
    };
    return sizeMap[size] || 'w-24 h-24';
  };

  const renderShape = () => {
    const color = getColorValue(stimulus.color);
    const sizeClass = getSizeClass(stimulus.size);
    const baseClasses = `${sizeClass} flex items-center justify-center mx-auto`;

    // Pattern styles
    const getPatternStyle = () => {
      switch (stimulus.pattern) {
        case 'solid':
          return { backgroundColor: color };
        case 'striped':
          return {
            background: `repeating-linear-gradient(45deg, ${color}, ${color} 4px, transparent 4px, transparent 8px)`,
            border: `2px solid ${color}`
          };
        case 'dotted':
          return {
            background: `radial-gradient(circle, ${color} 2px, transparent 2px)`,
            backgroundSize: '8px 8px',
            border: `2px solid ${color}`
          };
        case 'gradient':
          return {
            background: `linear-gradient(45deg, ${color}, ${color}80)`
          };
        default:
          return { backgroundColor: color };
      }
    };

    const patternStyle = getPatternStyle();

    switch (stimulus.shape) {
      case 'circle':
        return (
          <div className={`${baseClasses} rounded-full`} style={patternStyle}>
            <div className="flex flex-wrap gap-1 justify-center items-center">
              {Array.from({ length: stimulus.number }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-full opacity-80"></div>
              ))}
            </div>
          </div>
        );
      case 'square':
        return (
          <div className={`${baseClasses} rounded-lg`} style={patternStyle}>
            <div className="flex flex-wrap gap-1 justify-center items-center">
              {Array.from({ length: stimulus.number }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-sm opacity-80"></div>
              ))}
            </div>
          </div>
        );
      case 'triangle':
        return (
          <div className={baseClasses}>
            <div
              className="w-0 h-0 relative"
              style={{
                borderLeft: `${stimulus.size === 'small' ? '32px' : stimulus.size === 'medium' ? '48px' : '64px'} solid transparent`,
                borderRight: `${stimulus.size === 'small' ? '32px' : stimulus.size === 'medium' ? '48px' : '64px'} solid transparent`,
                borderBottom: `${stimulus.size === 'small' ? '56px' : stimulus.size === 'medium' ? '84px' : '112px'} solid ${color}`
              }}
            >
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-1 justify-center">
                {Array.from({ length: stimulus.number }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'star':
        return (
          <div className={baseClasses}>
            <div className="relative">
              <div
                className="text-6xl"
                style={{ color }}
              >
                ★
              </div>
              <div className="absolute inset-0 flex flex-wrap gap-1 justify-center items-center">
                {Array.from({ length: stimulus.number }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} rounded-full`} style={patternStyle}>
            <div className="flex flex-wrap gap-1 justify-center items-center">
              {Array.from({ length: stimulus.number }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-full opacity-80"></div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {renderShape()}

      {/* Stimulus Properties Display */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="text-center">
          <div className="font-semibold">Color</div>
          <div className="capitalize">{stimulus.color}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Shape</div>
          <div className="capitalize">{stimulus.shape}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Size</div>
          <div className="capitalize">{stimulus.size}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Number</div>
          <div>{stimulus.number}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Pattern</div>
          <div className="capitalize">{stimulus.pattern}</div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveFlexibilityArchitectGame;
