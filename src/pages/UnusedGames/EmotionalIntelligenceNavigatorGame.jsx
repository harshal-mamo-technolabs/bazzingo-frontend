import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const EmotionalIntelligenceNavigatorGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [difficulty, setDifficulty] = useState('Easy');

  // Game-specific state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [scenarioType, setScenarioType] = useState('emotion');
  const [completedScenarios, setCompletedScenarios] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [empathyScore, setEmpathyScore] = useState(0);
  const [socialScore, setSocialScore] = useState(0);
  const [emotionalAccuracy, setEmotionalAccuracy] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Scenario types for emotional intelligence testing
  const scenarioTypes = [
    {
      id: 'emotion',
      name: 'Emotion Recognition',
      icon: '😊',
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-700',
      description: 'Identify emotions from facial expressions and context'
    },
    {
      id: 'empathy',
      name: 'Empathy Assessment',
      icon: '🤝',
      color: '#10B981',
      gradient: 'from-emerald-500 to-emerald-700',
      description: 'Understand others\' perspectives and feelings'
    },
    {
      id: 'social',
      name: 'Social Situations',
      icon: '👥',
      color: '#8B5CF6',
      gradient: 'from-violet-500 to-violet-700',
      description: 'Navigate complex social interactions'
    },
    {
      id: 'conflict',
      name: 'Conflict Resolution',
      icon: '⚖️',
      color: '#F59E0B',
      gradient: 'from-amber-500 to-amber-700',
      description: 'Resolve interpersonal conflicts effectively'
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: '💬',
      color: '#EF4444',
      gradient: 'from-red-500 to-red-700',
      description: 'Choose appropriate communication styles'
    }
  ];

  // Get difficulty configuration
  const getDifficultyConfig = useCallback(() => {
    const configs = {
      Easy: {
        emotionComplexity: 'basic',
        contextClues: 3,
        distractors: 2,
        timePerScenario: 30
      },
      Moderate: {
        emotionComplexity: 'mixed',
        contextClues: 2,
        distractors: 3,
        timePerScenario: 25
      },
      Hard: {
        emotionComplexity: 'complex',
        contextClues: 1,
        distractors: 4,
        timePerScenario: 20
      }
    };
    return configs[difficulty];
  }, [difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCurrentLevel(1);
    setCompletedScenarios(0);
    setCorrectAnswers(0);
    setEmpathyScore(0);
    setSocialScore(0);
    setEmotionalAccuracy(0);
    setStreakCount(0);
    setMaxStreak(0);

    const initialTime = difficulty === 'Easy' ? 300 : difficulty === 'Moderate' ? 240 : 180;
    setTimeRemaining(initialTime);

    generateNewScenario();
  }, [difficulty]);

  // Generate new emotional intelligence scenario
  const generateNewScenario = useCallback(() => {
    const types = scenarioTypes.map(t => t.id);
    const randomType = types[Math.floor(Math.random() * types.length)];
    setScenarioType(randomType);

    const config = getDifficultyConfig();
    let scenario = {};

    switch (randomType) {
      case 'emotion':
        scenario = generateEmotionScenario(config);
        break;
      case 'empathy':
        scenario = generateEmpathyScenario(config);
        break;
      case 'social':
        scenario = generateSocialScenario(config);
        break;
      case 'conflict':
        scenario = generateConflictScenario(config);
        break;
      case 'communication':
        scenario = generateCommunicationScenario(config);
        break;
      default:
        scenario = generateEmotionScenario(config);
    }

    setCurrentScenario(scenario);
  }, [scenarioTypes, getDifficultyConfig]);

  // Emotion recognition scenarios
  const generateEmotionScenario = (config) => {
    const emotions = {
      basic: ['happy', 'sad', 'angry', 'surprised'],
      mixed: ['happy', 'sad', 'angry', 'surprised', 'confused', 'excited', 'worried', 'proud'],
      complex: ['happy', 'sad', 'angry', 'surprised', 'confused', 'excited', 'worried', 'proud', 'disappointed', 'relieved', 'embarrassed', 'grateful']
    };

    const contexts = [
      { situation: 'Just received exam results', emotion: 'happy', context: 'Got an A+' },
      { situation: 'Lost their favorite toy', emotion: 'sad', context: 'Can\'t find it anywhere' },
      { situation: 'Someone cut in line', emotion: 'angry', context: 'Been waiting for 20 minutes' },
      { situation: 'Unexpected birthday party', emotion: 'surprised', context: 'Friends organized it secretly' },
      { situation: 'Trying to solve a puzzle', emotion: 'confused', context: 'Instructions are unclear' },
      { situation: 'Won the lottery', emotion: 'excited', context: 'First time playing' },
      { situation: 'Job interview tomorrow', emotion: 'worried', context: 'Really wants this position' },
      { situation: 'Completed marathon', emotion: 'proud', context: 'Trained for 6 months' }
    ];

    const selectedContext = contexts[Math.floor(Math.random() * contexts.length)];
    const availableEmotions = emotions[config.emotionComplexity];
    const correctEmotion = selectedContext.emotion;

    // Generate options including correct answer and distractors
    const options = [correctEmotion];
    while (options.length <= config.distractors) {
      const randomEmotion = availableEmotions[Math.floor(Math.random() * availableEmotions.length)];
      if (!options.includes(randomEmotion)) {
        options.push(randomEmotion);
      }
    }

    return {
      type: 'emotion',
      question: 'What emotion is this person most likely feeling?',
      situation: selectedContext.situation,
      context: selectedContext.context,
      character: {
        name: 'Alex',
        emoji: getEmotionEmoji(correctEmotion),
        expression: correctEmotion
      },
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer: correctEmotion,
      explanation: `Given the context "${selectedContext.context}", the person would most likely feel ${correctEmotion}.`
    };
  };

  // Empathy assessment scenarios
  const generateEmpathyScenario = (config) => {
    const scenarios = [
      {
        situation: 'Your friend just failed an important exam they studied hard for',
        perspective: 'friend',
        emotion: 'disappointed',
        responses: [
          { text: 'At least you tried your best!', empathy: 'high', explanation: 'Acknowledges effort and provides comfort' },
          { text: 'Don\'t worry, it\'s just one exam', empathy: 'medium', explanation: 'Minimizes the situation' },
          { text: 'I told you that you should have studied more', empathy: 'low', explanation: 'Blames and criticizes' },
          { text: 'I understand how disappointed you must feel', empathy: 'high', explanation: 'Shows emotional understanding' }
        ]
      },
      {
        situation: 'A colleague is stressed about a presentation tomorrow',
        perspective: 'colleague',
        emotion: 'anxious',
        responses: [
          { text: 'You\'ll be fine, everyone gets nervous', empathy: 'medium', explanation: 'Normalizes but doesn\'t help' },
          { text: 'Would you like to practice with me?', empathy: 'high', explanation: 'Offers practical support' },
          { text: 'Presentations are easy, just relax', empathy: 'low', explanation: 'Dismisses their feelings' },
          { text: 'I can see you\'re really worried about this', empathy: 'high', explanation: 'Validates their emotions' }
        ]
      }
    ];

    const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const correctResponse = selectedScenario.responses.find(r => r.empathy === 'high');

    return {
      type: 'empathy',
      question: 'How would you respond with the highest empathy?',
      situation: selectedScenario.situation,
      perspective: selectedScenario.perspective,
      targetEmotion: selectedScenario.emotion,
      options: selectedScenario.responses.map(r => r.text),
      correctAnswer: correctResponse.text,
      explanation: correctResponse.explanation,
      responses: selectedScenario.responses
    };
  };

  // Social situation scenarios
  const generateSocialScenario = (config) => {
    const scenarios = [
      {
        situation: 'At a party where you don\'t know many people',
        challenge: 'Making new connections',
        options: [
          { text: 'Stay close to the few people you know', social: 'low' },
          { text: 'Introduce yourself to someone standing alone', social: 'high' },
          { text: 'Wait for others to approach you first', social: 'medium' },
          { text: 'Leave early because it\'s uncomfortable', social: 'low' }
        ]
      },
      {
        situation: 'Group project where one member isn\'t contributing',
        challenge: 'Addressing team dynamics',
        options: [
          { text: 'Do their work to avoid conflict', social: 'low' },
          { text: 'Complain to the teacher immediately', social: 'medium' },
          { text: 'Have a private conversation with them first', social: 'high' },
          { text: 'Ignore it and hope it gets better', social: 'low' }
        ]
      }
    ];

    const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const correctOption = selectedScenario.options.find(o => o.social === 'high');

    return {
      type: 'social',
      question: 'What would be the most socially intelligent approach?',
      situation: selectedScenario.situation,
      challenge: selectedScenario.challenge,
      options: selectedScenario.options.map(o => o.text),
      correctAnswer: correctOption.text,
      explanation: 'This approach demonstrates social awareness and effective interpersonal skills.'
    };
  };

  // Conflict resolution scenarios
  const generateConflictScenario = (config) => {
    const conflicts = [
      {
        situation: 'Two friends are arguing about where to go for dinner',
        conflict: 'Decision-making disagreement',
        approaches: [
          { text: 'Suggest a compromise location', effectiveness: 'high' },
          { text: 'Let them figure it out themselves', effectiveness: 'low' },
          { text: 'Pick a side and support one friend', effectiveness: 'low' },
          { text: 'Suggest taking turns choosing', effectiveness: 'high' }
        ]
      }
    ];

    const selectedConflict = conflicts[Math.floor(Math.random() * conflicts.length)];
    const correctApproach = selectedConflict.approaches.find(a => a.effectiveness === 'high');

    return {
      type: 'conflict',
      question: 'How would you best help resolve this conflict?',
      situation: selectedConflict.situation,
      conflict: selectedConflict.conflict,
      options: selectedConflict.approaches.map(a => a.text),
      correctAnswer: correctApproach.text,
      explanation: 'This approach promotes fairness and maintains relationships.'
    };
  };

  // Communication scenarios
  const generateCommunicationScenario = (config) => {
    const scenarios = [
      {
        situation: 'Giving feedback to someone who made a mistake',
        context: 'Professional setting',
        styles: [
          { text: 'Point out what they did wrong directly', effectiveness: 'low' },
          { text: 'Focus on the behavior, not the person', effectiveness: 'high' },
          { text: 'Ignore it to avoid hurting feelings', effectiveness: 'low' },
          { text: 'Give feedback publicly as a learning example', effectiveness: 'low' }
        ]
      }
    ];

    const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const correctStyle = selectedScenario.styles.find(s => s.effectiveness === 'high');

    return {
      type: 'communication',
      question: 'What communication approach would be most effective?',
      situation: selectedScenario.situation,
      context: selectedScenario.context,
      options: selectedScenario.styles.map(s => s.text),
      correctAnswer: correctStyle.text,
      explanation: 'This approach is constructive and maintains dignity.'
    };
  };

  // Helper function to get emotion emoji
  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      happy: '😊', sad: '😢', angry: '😠', surprised: '😲',
      confused: '😕', excited: '🤩', worried: '😰', proud: '😌',
      disappointed: '😞', relieved: '😌', embarrassed: '😳', grateful: '🙏'
    };
    return emojiMap[emotion] || '😐';
  };

  // Handle scenario completion
  const handleScenarioComplete = useCallback((isCorrect, userAnswer = null) => {
    setCompletedScenarios(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreakCount(prev => {
        const newStreak = prev + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });

      // Calculate score based on scenario type and difficulty
      const baseScore = scenarioType === 'emotion' ? 15 :
        scenarioType === 'empathy' ? 25 :
          scenarioType === 'social' ? 20 :
            scenarioType === 'conflict' ? 30 : 20;

      const difficultyMultiplier = difficulty === 'Easy' ? 1 : difficulty === 'Moderate' ? 1.5 : 2;
      const streakBonus = Math.min(streakCount * 3, 30);
      const finalScore = Math.floor(baseScore * difficultyMultiplier + streakBonus);

      setScore(prev => prev + finalScore);

      // Update specific scores
      if (scenarioType === 'empathy') {
        setEmpathyScore(prev => prev + finalScore);
      } else if (scenarioType === 'social' || scenarioType === 'conflict' || scenarioType === 'communication') {
        setSocialScore(prev => prev + finalScore);
      }
    } else {
      setStreakCount(0);
    }

    // Update accuracy
    const newAccuracy = ((correctAnswers + (isCorrect ? 1 : 0)) / (completedScenarios + 1)) * 100;
    setEmotionalAccuracy(newAccuracy);

    // Generate next scenario after delay
    setTimeout(() => {
      generateNewScenario();
    }, 3000);
  }, [scenarioType, difficulty, streakCount, correctAnswers, completedScenarios, generateNewScenario]);

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
    if (completedScenarios > 0 && completedScenarios % 6 === 0) {
      setCurrentLevel(prev => prev + 1);
    }
  }, [completedScenarios]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
    console.log('Emotional Intelligence Navigator completed:', payload);
  };

  const customStats = {
    currentLevel,
    completedScenarios,
    correctAnswers,
    empathyScore,
    socialScore,
    emotionalAccuracy: Math.round(emotionalAccuracy),
    streakCount,
    maxStreak
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Emotional Intelligence Navigator"
        gameDescription="Navigate complex social and emotional situations! Test your ability to understand emotions, show empathy, and handle interpersonal challenges."
        category="Social Cognition"
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
                Scenarios
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedScenarios}
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
                EQ Accuracy
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(emotionalAccuracy)}%
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Empathy
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {empathyScore}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-cyan-200">
              <div className="text-xs sm:text-sm text-cyan-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Social
              </div>
              <div className="text-lg sm:text-2xl font-bold text-cyan-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {socialScore}
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

          {/* Current Scenario Display */}
          {gameState === 'playing' && currentScenario && (
            <div className="w-full max-w-4xl">
              {/* Scenario Type Header */}
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
                  <span className="text-2xl">
                    {scenarioTypes.find(t => t.id === scenarioType)?.icon}
                  </span>
                  <div className="text-left">
                    <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {scenarioTypes.find(t => t.id === scenarioType)?.name}
                    </div>
                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {scenarioTypes.find(t => t.id === scenarioType)?.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario Content */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <ScenarioComponent
                  scenario={currentScenario}
                  scenarioType={scenarioType}
                  onComplete={handleScenarioComplete}
                  gameState={gameState}
                />
              </div>
            </div>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🧠💝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Emotional Intelligence Navigator
                </h3>
                <div className="text-left space-y-4 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        😊 Emotion Recognition
                      </h4>
                      <p className="text-sm">Identify emotions from facial expressions and situational context</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        🤝 Empathy Assessment
                      </h4>
                      <p className="text-sm">Understand others' perspectives and respond with appropriate empathy</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        👥 Social Situations
                      </h4>
                      <p className="text-sm">Navigate complex social interactions with emotional intelligence</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        ⚖️ Conflict Resolution
                      </h4>
                      <p className="text-sm">Resolve interpersonal conflicts using emotional awareness</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        💬 Communication
                      </h4>
                      <p className="text-sm">Choose appropriate communication styles for different situations</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">📋 How to Play:</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>1. Read the Scenario:</strong> Carefully analyze the social or emotional situation presented</p>
                      <p><strong>2. Consider Context:</strong> Look for emotional cues, body language, and situational factors</p>
                      <p><strong>3. Apply EQ Skills:</strong> Use empathy, social awareness, and emotional understanding</p>
                      <p><strong>4. Choose Wisely:</strong> Select the response that shows highest emotional intelligence</p>
                      <p><strong>5. Learn & Improve:</strong> Review explanations to enhance your EQ skills</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <p className="text-sm"><strong>🎯 Goal:</strong> Develop emotional intelligence through realistic social scenarios</p>
                    <p className="text-sm"><strong>📊 Scoring:</strong> Higher empathy and social awareness earn more points</p>
                    <p className="text-sm"><strong>⚡ Progression:</strong> Complete 6 scenarios to advance to the next level</p>
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
                  EQ Assessment Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Final Score</div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{score}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Scenarios</div>
                    <div className="text-2xl font-bold text-green-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{completedScenarios}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>EQ Accuracy</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{Math.round(emotionalAccuracy)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Max Streak</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{maxStreak}</div>
                  </div>
                </div>
                <div className="space-y-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div className="flex justify-between">
                    <span>Empathy Score:</span>
                    <span className="font-semibold">{empathyScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Intelligence:</span>
                    <span className="font-semibold">{socialScore}</span>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="font-semibold text-gray-900">
                      EQ Level: {emotionalAccuracy > 85 ? 'Exceptional' : emotionalAccuracy > 70 ? 'High' : emotionalAccuracy > 55 ? 'Moderate' : 'Developing'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {emotionalAccuracy > 85 ? 'Outstanding emotional intelligence!' :
                        emotionalAccuracy > 70 ? 'Strong emotional awareness and empathy' :
                          emotionalAccuracy > 55 ? 'Good foundation with room for growth' :
                            'Keep practicing to enhance your EQ skills'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GameFramework>
    </div>
  );
};
