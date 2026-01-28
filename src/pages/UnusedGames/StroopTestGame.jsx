import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const StroopTestGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [difficulty, setDifficulty] = useState('medium');

  // Test state
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [stimulusCount, setStimulusCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [stimulusStartTime, setStimulusStartTime] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [testPhase, setTestPhase] = useState('congruent'); // 'congruent', 'incongruent', 'mixed'
  const [congruentTrials, setCongruentTrials] = useState(0);
  const [incongruentTrials, setIncongruentTrials] = useState(0);
  const [congruentCorrect, setCongruentCorrect] = useState(0);
  const [incongruentCorrect, setIncongruentCorrect] = useState(0);

  // Refs
  const stimulusTimeoutRef = useRef(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      stimulusInterval: 2500,
      stimulusDuration: 3000,
      congruentTrials: 20,
      incongruentTrials: 20,
      mixedTrials: 20,
      timeLimit: 180,
      complexity: 'Easy',
      description: 'Slower pace, longer response time, fewer trials'
    },
    medium: {
      stimulusInterval: 2000,
      stimulusDuration: 2500,
      congruentTrials: 30,
      incongruentTrials: 30,
      mixedTrials: 30,
      timeLimit: 120,
      complexity: 'Medium',
      description: 'Standard timing and trial count'
    },
    hard: {
      stimulusInterval: 1500,
      stimulusDuration: 2000,
      congruentTrials: 40,
      incongruentTrials: 40,
      mixedTrials: 40,
      timeLimit: 90,
      complexity: 'Hard',
      description: 'Fast pace, shorter response time, more trials'
    }
  };

  // Color definitions
  const colors = [
    { name: 'RED', color: '#EF4444', id: 'red' },
    { name: 'BLUE', color: '#3B82F6', id: 'blue' },
    { name: 'GREEN', color: '#10B981', id: 'green' },
    { name: 'YELLOW', color: '#F59E0B', id: 'yellow' },
    { name: 'PURPLE', color: '#8B5CF6', id: 'purple' },
    { name: 'ORANGE', color: '#F97316', id: 'orange' }
  ];

  // Generate stimulus based on test phase
  const generateStimulus = useCallback(() => {
    const settings = difficultySettings[difficulty];
    let isCongruent;

    // Determine if stimulus should be congruent based on phase
    if (testPhase === 'congruent') {
      isCongruent = true;
    } else if (testPhase === 'incongruent') {
      isCongruent = false;
    } else { // mixed
      isCongruent = Math.random() < 0.5;
    }

    const wordColor = colors[Math.floor(Math.random() * colors.length)];
    let displayColor;

    if (isCongruent) {
      displayColor = wordColor;
    } else {
      // Ensure different color for incongruent trials
      const otherColors = colors.filter(c => c.id !== wordColor.id);
      displayColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    }

    return {
      word: wordColor.name,
      wordColorId: wordColor.id,
      displayColor: displayColor.color,
      displayColorId: displayColor.id,
      isCongruent,
      correctAnswer: displayColor.id // Answer should be the color, not the word
    };
  }, [difficulty, testPhase]);

  // Handle color selection
  const handleColorSelect = useCallback((selectedColorId) => {
    if (!currentStimulus || !stimulusStartTime || showFeedback) return;

    const reactionTime = Date.now() - stimulusStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);

    const isCorrect = selectedColorId === currentStimulus.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + Math.max(5, 25 - Math.floor(reactionTime / 100)));
      setFeedbackType('correct');

      if (currentStimulus.isCongruent) {
        setCongruentCorrect(prev => prev + 1);
      } else {
        setIncongruentCorrect(prev => prev + 1);
      }
    } else {
      setIncorrectAnswers(prev => prev + 1);
      setFeedbackType('incorrect');
    }

    // Update trial counts
    if (currentStimulus.isCongruent) {
      setCongruentTrials(prev => prev + 1);
    } else {
      setIncongruentTrials(prev => prev + 1);
    }

    setStimulusCount(prev => prev + 1);
    setShowFeedback(true);

    // Clear stimulus and show next after delay
    setTimeout(() => {
      setShowFeedback(false);
      setCurrentStimulus(null);
      setStimulusStartTime(null);

      // Check if phase should change or game should end
      const settings = difficultySettings[difficulty];
      const totalTrials = congruentTrials + incongruentTrials + 1; // +1 for current trial

      if (testPhase === 'congruent' && congruentTrials + 1 >= settings.congruentTrials) {
        setTestPhase('incongruent');
      } else if (testPhase === 'incongruent' && incongruentTrials + 1 >= settings.incongruentTrials) {
        setTestPhase('mixed');
      } else if (testPhase === 'mixed' && totalTrials >= settings.congruentTrials + settings.incongruentTrials + settings.mixedTrials) {
        setGameState('completed');
        return;
      }

      // Present next stimulus after interval
      setTimeout(() => {
        presentNextStimulus();
      }, difficultySettings[difficulty].stimulusInterval);

    }, 1000);
  }, [currentStimulus, stimulusStartTime, showFeedback, difficulty, testPhase, congruentTrials, incongruentTrials]);

  // Present next stimulus
  const presentNextStimulus = useCallback(() => {
    if (gameState !== 'playing') return;

    const stimulus = generateStimulus();
    setCurrentStimulus(stimulus);
    setStimulusStartTime(Date.now());

    // Auto-advance if no response within time limit
    stimulusTimeoutRef.current = setTimeout(() => {
      if (currentStimulus) {
        handleColorSelect('timeout'); // Handle as incorrect
      }
    }, difficultySettings[difficulty].stimulusDuration);

  }, [gameState, generateStimulus, handleColorSelect, difficulty]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setCurrentStimulus(null);
    setStimulusCount(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setReactionTimes([]);
    setStimulusStartTime(null);
    setShowFeedback(false);
    setFeedbackType('');
    setTestPhase('congruent');
    setCongruentTrials(0);
    setIncongruentTrials(0);
    setCongruentCorrect(0);
    setIncongruentCorrect(0);

    if (stimulusTimeoutRef.current) {
      clearTimeout(stimulusTimeoutRef.current);
      stimulusTimeoutRef.current = null;
    }
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
      if (stimulusTimeoutRef.current) {
        clearTimeout(stimulusTimeoutRef.current);
        stimulusTimeoutRef.current = null;
      }
    }
  }, [gameState, timeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stimulusTimeoutRef.current) {
        clearTimeout(stimulusTimeoutRef.current);
      }
    };
  }, []);

  // Game handlers
  const handleStart = () => {
    setGameState('playing');
    setTimeout(() => {
      presentNextStimulus();
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
    const accuracy = stimulusCount > 0 ? Math.round((correctAnswers / stimulusCount) * 100) : 0;
    const averageRT = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;
    const congruentAccuracy = congruentTrials > 0 ? Math.round((congruentCorrect / congruentTrials) * 100) : 0;
    const incongruentAccuracy = incongruentTrials > 0 ? Math.round((incongruentCorrect / incongruentTrials) * 100) : 0;
    const stroopEffect = averageRT > 0 && congruentTrials > 0 && incongruentTrials > 0 ?
      Math.round(((incongruentTrials / incongruentCorrect) - (congruentTrials / congruentCorrect)) * averageRT) : 0;

    return {
      accuracy,
      averageRT,
      congruentAccuracy,
      incongruentAccuracy,
      stroopEffect
    };
  };

  // Custom stats
  const metrics = calculateMetrics();
  const customStats = {
    testPhase,
    stimulusCount,
    correctAnswers,
    incorrectAnswers,
    congruentTrials,
    incongruentTrials,
    congruentCorrect,
    incongruentCorrect,
    ...metrics
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Stroop Test"
        gameDescription="Test your cognitive flexibility and selective attention through color-word interference tasks"
        category="Cognitive Control"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                PHASE
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {testPhase}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                TRIALS
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {stimulusCount}
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
                AVG RT
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.averageRT}ms
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CONGRUENT
              </div>
              <div className="text-lg sm:text-xl font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.congruentAccuracy}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                INCONGRUENT
              </div>
              <div className="text-lg sm:text-xl font-bold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.incongruentAccuracy}%
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="w-full max-w-4xl mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              {/* Game Status */}
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {testPhase === 'congruent' ? 'Congruent Phase' :
                    testPhase === 'incongruent' ? 'Incongruent Phase' : 'Mixed Phase'}
                </h3>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'playing'
                    ? 'Click the color of the text, not what the word says'
                    : gameState === 'ready'
                      ? 'Identify the COLOR of the text, ignore the word meaning'
                      : 'Test Complete'
                  }
                </div>
              </div>

              {/* Stimulus Display Area */}
              <div className="relative bg-gray-50 border-2 border-gray-300 rounded-lg mx-auto mb-8" style={{ width: '100%', maxWidth: '500px', height: '200px' }}>
                {/* Current Stimulus */}
                {currentStimulus && gameState === 'playing' && !showFeedback && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="text-6xl sm:text-7xl font-bold transition-all duration-200"
                      style={{
                        color: currentStimulus.displayColor,
                        fontFamily: 'Roboto, sans-serif',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {currentStimulus.word}
                    </div>
                  </div>
                )}

                {/* Feedback Display */}
                {showFeedback && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-center p-4 rounded-lg ${feedbackType === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      <div className="text-4xl mb-2">
                        {feedbackType === 'correct' ? '✓' : '✗'}
                      </div>
                      <div className="font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {feedbackType === 'correct' ? 'Correct!' : 'Incorrect'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions Overlay */}
                {gameState !== 'playing' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                    <div className="text-center">
                      <div className="text-4xl mb-3" style={{ color: '#EF4444' }}>RED</div>
                      <p className="text-gray-700 font-medium mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {gameState === 'ready' ? 'Click the COLOR, not the word' : 'Test Complete'}
                      </p>
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {gameState === 'ready' ? 'This word is RED, so click RED' : `Final Score: ${score} points`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Response Buttons */}
              {gameState === 'playing' && currentStimulus && !showFeedback && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color.id)}
                      className="px-6 py-4 rounded-lg font-bold text-white text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                      style={{
                        backgroundColor: color.color,
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Phase Progress */}
              {gameState === 'playing' && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-4 bg-gray-50 rounded-lg px-6 py-3">
                    <div className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Phase Progress:
                    </div>
                    <div className="flex gap-2">
                      <div className={`w-3 h-3 rounded-full ${testPhase === 'congruent' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${testPhase === 'incongruent' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${testPhase === 'mixed' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Summary */}
              {gameState === 'playing' && stimulusCount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.accuracy}%
                    </div>
                    <div className="text-xs text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Overall Accuracy
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.congruentAccuracy}%
                    </div>
                    <div className="text-xs text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Congruent
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.incongruentAccuracy}%
                    </div>
                    <div className="text-xs text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Incongruent
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
                  Stroop Test Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your cognitive flexibility and selective attention through color-word interference tasks
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-bold text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Congruent Phase
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Word and color match</li>
                    <li>• Example: <span style={{ color: '#EF4444' }}>RED</span> in red color</li>
                    <li>• Easier to process</li>
                    <li>• Builds baseline performance</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600 font-bold">2</span>
                    </div>
                    <h4 className="font-bold text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Incongruent Phase
                    </h4>
                  </div>
                  <ul className="text-sm text-yellow-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Word and color conflict</li>
                    <li>• Example: <span style={{ color: '#3B82F6' }}>RED</span> in blue color</li>
                    <li>• Requires cognitive control</li>
                    <li>• Tests interference resistance</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-bold text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Mixed Phase
                    </h4>
                  </div>
                  <ul className="text-sm text-purple-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Random mix of both types</li>
                    <li>• Unpredictable presentation</li>
                    <li>• Tests cognitive flexibility</li>
                    <li>• Measures adaptation ability</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Key Instructions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>
                    <strong>Always respond to the COLOR:</strong> Click the button that matches the color of the text, not what the word says
                  </div>
                  <div>
                    <strong>Respond quickly:</strong> You have limited time for each stimulus, so respond as fast as possible while staying accurate
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Click the color button that matches the text color • Ignore what the word says
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: The Stroop effect makes it harder to ignore word meaning. Stay focused on the actual color!
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default StroopTestGame;
