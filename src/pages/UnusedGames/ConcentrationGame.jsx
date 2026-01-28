import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const ConcentrationGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [difficulty, setDifficulty] = useState('medium');

  // Test state
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [stimulusCount, setStimulusCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [correctRejections, setCorrectRejections] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [stimulusStartTime, setStimulusStartTime] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      stimulusInterval: 2000,
      stimulusDuration: 1500,
      targetProbability: 0.3,
      timeLimit: 420,
      complexity: 'Easy',
      description: 'Slower presentation, longer stimulus duration, more targets'
    },
    medium: {
      stimulusInterval: 1500,
      stimulusDuration: 1000,
      targetProbability: 0.25,
      timeLimit: 300,
      complexity: 'Medium',
      description: 'Standard timing and target frequency'
    },
    hard: {
      stimulusInterval: 1000,
      stimulusDuration: 750,
      targetProbability: 0.2,
      timeLimit: 240,
      complexity: 'Hard',
      description: 'Fast presentation, brief duration, fewer targets'
    }
  };

  // Stimulus types
  const stimulusTypes = [
    { id: 'target', symbol: '●', color: '#EF4444', name: 'Red Circle', isTarget: true },
    { id: 'distractor1', symbol: '■', color: '#3B82F6', name: 'Blue Square', isTarget: false },
    { id: 'distractor2', symbol: '▲', color: '#10B981', name: 'Green Triangle', isTarget: false },
    { id: 'distractor3', symbol: '◆', color: '#F59E0B', name: 'Yellow Diamond', isTarget: false },
    { id: 'distractor4', symbol: '★', color: '#8B5CF6', name: 'Purple Star', isTarget: false },
    { id: 'distractor5', symbol: '♦', color: '#EC4899', name: 'Pink Diamond', isTarget: false }
  ];

  // Generate random stimulus
  const generateStimulus = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const isTarget = Math.random() < settings.targetProbability;

    if (isTarget) {
      return stimulusTypes[0]; // Target
    } else {
      const distractors = stimulusTypes.slice(1);
      return distractors[Math.floor(Math.random() * distractors.length)];
    }
  }, [difficulty]);

  // Handle response
  const handleResponse = useCallback(() => {
    if (!currentStimulus || !stimulusStartTime) return;

    const reactionTime = Date.now() - stimulusStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);

    if (currentStimulus.isTarget) {
      // Hit - correct response to target
      setHits(prev => prev + 1);
      setScore(prev => prev + Math.max(5, 25 - Math.floor(reactionTime / 50)));
      setFeedbackType('hit');
    } else {
      // False Alarm - incorrect response to distractor
      setFalseAlarms(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 5));
      setFeedbackType('falseAlarm');
    }

    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 300);
  }, [currentStimulus, stimulusStartTime]);

  // Handle stimulus timeout (no response)
  const handleStimulusTimeout = useCallback(() => {
    if (!currentStimulus) return;

    if (currentStimulus.isTarget) {
      // Miss - no response to target
      setMisses(prev => prev + 1);
      setFeedbackType('miss');
    } else {
      // Correct Rejection - no response to distractor
      setCorrectRejections(prev => prev + 1);
      setScore(prev => prev + 2);
      setFeedbackType('correctRejection');
    }

    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 300);
  }, [currentStimulus]);

  // Present stimulus
  const presentStimulus = useCallback(() => {
    if (gameState !== 'playing') return;

    const stimulus = generateStimulus();
    setCurrentStimulus(stimulus);
    setStimulusStartTime(Date.now());
    setStimulusCount(prev => prev + 1);

    if (stimulus.isTarget) {
      setTargetCount(prev => prev + 1);
    }

    // Hide stimulus after duration
    timeoutRef.current = setTimeout(() => {
      handleStimulusTimeout();
      setCurrentStimulus(null);
      setStimulusStartTime(null);
    }, difficultySettings[difficulty].stimulusDuration);

  }, [gameState, generateStimulus, handleStimulusTimeout, difficulty]);

  // Start stimulus presentation
  const startPresentation = useCallback(() => {
    if (gameState !== 'playing') return;

    setIsActive(true);
    presentStimulus();

    intervalRef.current = setInterval(() => {
      presentStimulus();
    }, difficultySettings[difficulty].stimulusInterval);
  }, [gameState, presentStimulus, difficulty]);

  // Stop presentation
  const stopPresentation = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setCurrentStimulus(null);
    setStimulusCount(0);
    setTargetCount(0);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setCorrectRejections(0);
    setReactionTimes([]);
    setStimulusStartTime(null);
    setShowFeedback(false);
    setFeedbackType('');
    setIsActive(false);
    stopPresentation();
  }, [difficulty, stopPresentation]);

  // Handle spacebar press
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && gameState === 'playing' && currentStimulus) {
        event.preventDefault();
        handleResponse();
        setCurrentStimulus(null);
        setStimulusStartTime(null);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentStimulus, handleResponse]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('completed');
      stopPresentation();
    }
  }, [gameState, timeRemaining, stopPresentation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPresentation();
    };
  }, [stopPresentation]);

  // Game handlers
  const handleStart = () => {
    setGameState('playing');
    setTimeout(() => {
      startPresentation();
    }, 1000);
  };

  const handleReset = () => {
    setGameState('ready');
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    const totalTargets = targetCount;
    const totalDistractors = stimulusCount - targetCount;

    const hitRate = totalTargets > 0 ? (hits / totalTargets) * 100 : 0;
    const falseAlarmRate = totalDistractors > 0 ? (falseAlarms / totalDistractors) * 100 : 0;
    const accuracy = stimulusCount > 0 ? ((hits + correctRejections) / stimulusCount) * 100 : 0;
    const averageRT = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;

    return {
      hitRate: Math.round(hitRate),
      falseAlarmRate: Math.round(falseAlarmRate),
      accuracy: Math.round(accuracy),
      averageRT: Math.round(averageRT)
    };
  };

  // Custom stats
  const metrics = calculateMetrics();
  const customStats = {
    stimulusCount,
    targetCount,
    hits,
    misses,
    falseAlarms,
    correctRejections,
    ...metrics
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Concentration Test"
        gameDescription="Test your sustained attention and response inhibition through continuous performance monitoring"
        category="Attention & Concentration"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                STIMULI
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {stimulusCount}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                TARGETS
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {targetCount}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                HITS
              </div>
              <div className="text-lg sm:text-xl font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {hits}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                MISSES
              </div>
              <div className="text-lg sm:text-xl font-bold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {misses}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                FALSE ALARMS
              </div>
              <div className="text-lg sm:text-xl font-bold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {falseAlarms}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                HIT RATE
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.hitRate}%
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
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                AVG RT
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.averageRT}ms
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="w-full max-w-4xl mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              {/* Game Status */}
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Continuous Performance Test
                </h3>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'playing'
                    ? (isActive ? 'Press SPACEBAR when you see the RED CIRCLE (●)' : 'Starting in 3 seconds...')
                    : gameState === 'ready'
                      ? 'Press SPACEBAR only when you see the target stimulus'
                      : 'Test Complete'
                  }
                </div>
              </div>

              {/* Stimulus Display Area */}
              <div className="relative bg-gray-50 border-2 border-gray-300 rounded-lg mx-auto mb-8" style={{ width: '100%', maxWidth: '400px', height: '300px' }}>
                {/* Current Stimulus */}
                {currentStimulus && gameState === 'playing' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="text-8xl sm:text-9xl font-bold transition-all duration-200 animate-pulse"
                      style={{ color: currentStimulus.color }}
                    >
                      {currentStimulus.symbol}
                    </div>
                  </div>
                )}

                {/* Feedback Display */}
                {showFeedback && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className={`text-center p-2 rounded-lg text-sm font-semibold ${feedbackType === 'hit' ? 'bg-green-100 text-green-700' :
                      feedbackType === 'miss' ? 'bg-red-100 text-red-700' :
                        feedbackType === 'falseAlarm' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                      }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {feedbackType === 'hit' ? '✓ Hit' :
                        feedbackType === 'miss' ? '✗ Miss' :
                          feedbackType === 'falseAlarm' ? '⚠ False Alarm' :
                            '✓ Correct Rejection'}
                    </div>
                  </div>
                )}

                {/* Instructions Overlay */}
                {gameState !== 'playing' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="text-2xl text-red-600 font-bold">●</div>
                      </div>
                      <p className="text-gray-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {gameState === 'ready' ? 'Target: Red Circle' : 'Test Complete'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {gameState === 'ready' ? 'Press SPACEBAR when you see this' : `Score: ${score} points`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Instructions */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-4 bg-gray-50 rounded-lg px-6 py-3">
                  <div className="text-2xl">⌨️</div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Press SPACEBAR
                    </div>
                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Only for red circles (●)
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              {gameState === 'playing' && stimulusCount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.hitRate}%
                    </div>
                    <div className="text-xs text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Hit Rate
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.falseAlarmRate}%
                    </div>
                    <div className="text-xs text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      False Alarm Rate
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.accuracy}%
                    </div>
                    <div className="text-xs text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Accuracy
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.averageRT}ms
                    </div>
                    <div className="text-xs text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Avg RT
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Concentration Test Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your sustained attention and response inhibition through continuous performance monitoring
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <div className="text-red-600 font-bold">●</div>
                    </div>
                    <h4 className="font-bold text-red-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Target Stimulus
                    </h4>
                  </div>
                  <ul className="text-sm text-red-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• RED CIRCLE (●) is the target</li>
                    <li>• Press SPACEBAR when you see it</li>
                    <li>• Respond as quickly as possible</li>
                    <li>• Missing targets reduces your score</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <div className="text-blue-600 font-bold">■</div>
                    </div>
                    <h4 className="font-bold text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Distractor Stimuli
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Other shapes and colors are distractors</li>
                    <li>• DO NOT press SPACEBAR for these</li>
                    <li>• Ignore all non-target stimuli</li>
                    <li>• False responses reduce your score</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>
                    <strong>Hit Rate:</strong> Percentage of targets correctly identified
                  </div>
                  <div>
                    <strong>False Alarm Rate:</strong> Percentage of incorrect responses to distractors
                  </div>
                  <div>
                    <strong>Accuracy:</strong> Overall percentage of correct responses
                  </div>
                  <div>
                    <strong>Reaction Time:</strong> Average speed of correct responses
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Press SPACEBAR only when you see the red circle (●) • Maintain focus throughout the test
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: Stay alert and focused. Respond quickly to targets but avoid responding to distractors.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default ConcentrationGame;
