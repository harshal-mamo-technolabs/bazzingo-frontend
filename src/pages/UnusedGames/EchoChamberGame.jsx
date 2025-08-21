import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Brain, 
  ChevronUp, 
  ChevronDown,
  Zap,
  Timer
} from 'lucide-react';

const EchoChamberGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [solvedLevels, setSolvedLevels] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState(0);

  // Game state
  const [currentPhase, setCurrentPhase] = useState('observation'); // 'observation' or 'prediction'
  const [buttonSignals, setButtonSignals] = useState([]);
  const [echoHistory, setEchoHistory] = useState([]);
  const [activeSignal, setActiveSignal] = useState(null);
  const [predictionSequence, setPredictionSequence] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [chamberRules, setChamberRules] = useState({});
  const [observationCount, setObservationCount] = useState(0);
  const [requiredObservations, setRequiredObservations] = useState(3);

  // Button configurations
  const buttonConfigs = [
    { id: 'alpha', symbol: 'α', color: '#3B82F6', name: 'Alpha' },
    { id: 'beta', symbol: 'β', color: '#EF4444', name: 'Beta' },
    { id: 'gamma', symbol: 'γ', color: '#10B981', name: 'Gamma' },
    { id: 'delta', symbol: 'δ', color: '#F59E0B', name: 'Delta' },
    { id: 'epsilon', symbol: 'ε', color: '#8B5CF6', name: 'Epsilon' },
    { id: 'zeta', symbol: 'ζ', color: '#EC4899', name: 'Zeta' }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: { 
      timeLimit: 300, 
      lives: 5, 
      hints: 3, 
      levelCount: 8, 
      pointsPerLevel: 25,
      buttonCount: 4,
      maxEchoes: 2,
      echoDelay: 1000
    },
    Moderate: { 
      timeLimit: 240, 
      lives: 4, 
      hints: 2, 
      levelCount: 7, 
      pointsPerLevel: 28,
      buttonCount: 5,
      maxEchoes: 3,
      echoDelay: 800
    },
    Hard: { 
      timeLimit: 180, 
      lives: 3, 
      hints: 1, 
      levelCount: 5, 
      pointsPerLevel: 40,
      buttonCount: 6,
      maxEchoes: 4,
      echoDelay: 600
    }
  };

  // Generate chamber rules based on difficulty
  const generateChamberRules = useCallback((level, difficulty) => {
    const settings = difficultySettings[difficulty];
    const buttons = buttonConfigs.slice(0, settings.buttonCount);
    const rules = {};

    // Easy: Simple transformations
    if (difficulty === 'Easy') {
      buttons.forEach((button, index) => {
        const nextButton = buttons[(index + 1) % buttons.length];
        rules[button.id] = [
          { delay: 1000, transform: button.id, intensity: 0.8 },
          { delay: 2000, transform: nextButton.id, intensity: 0.6 }
        ];
      });
    }
    // Moderate: More complex patterns
    else if (difficulty === 'Moderate') {
      buttons.forEach((button, index) => {
        const nextButton = buttons[(index + 1) % buttons.length];
        const prevButton = buttons[(index - 1 + buttons.length) % buttons.length];
        rules[button.id] = [
          { delay: 800, transform: button.id, intensity: 0.9 },
          { delay: 1600, transform: nextButton.id, intensity: 0.7 },
          { delay: 2400, transform: prevButton.id, intensity: 0.5 }
        ];
      });
    }
    // Hard: Cascading and conditional rules
    else {
      buttons.forEach((button, index) => {
        const rules_for_button = [];
        for (let i = 0; i < settings.maxEchoes; i++) {
          const targetButton = buttons[(index + i) % buttons.length];
          rules_for_button.push({
            delay: (i + 1) * settings.echoDelay,
            transform: targetButton.id,
            intensity: Math.max(0.3, 1 - (i * 0.2))
          });
        }
        rules[button.id] = rules_for_button;
      });
    }

    return rules;
  }, []);

  // Calculate score
  const calculateScore = useCallback(() => {
    const settings = difficultySettings[difficulty];
    return solvedLevels * settings.pointsPerLevel;
  }, [solvedLevels, difficulty]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle button press
  const handleButtonPress = useCallback((buttonId) => {
    if (gameState !== 'playing' || showFeedback) return;

    if (currentPhase === 'observation') {
      // During observation phase, show the echo pattern
      const rules = chamberRules[buttonId] || [];
      setActiveSignal(buttonId);
      
      // Create echo sequence
      const newEcho = {
        id: Date.now(),
        originalButton: buttonId,
        timestamp: Date.now(),
        echoes: rules
      };
      
      setEchoHistory(prev => [...prev, newEcho]);
      
      // Animate the echoes
      rules.forEach((rule, index) => {
        setTimeout(() => {
          setActiveSignal(rule.transform);
          setTimeout(() => setActiveSignal(null), 300);
        }, rule.delay);
      });

      setObservationCount(prev => {
        const newCount = prev + 1;
        if (newCount >= requiredObservations) {
          setTimeout(() => {
            setCurrentPhase('prediction');
            setActiveSignal(null);
          }, 3000); // Wait for last echo to finish
        }
        return newCount;
      });
    } else if (currentPhase === 'prediction') {
      // During prediction phase, player selects expected sequence
      setPredictionSequence(prev => [...prev, buttonId]);
    }
  }, [gameState, showFeedback, currentPhase, chamberRules, observationCount, requiredObservations]);

  // Submit prediction
  const submitPrediction = useCallback(() => {
    if (currentPhase !== 'prediction' || predictionSequence.length === 0) return;

    const responseTime = Date.now() - levelStartTime;
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    // Generate test sequence based on current level
    const testButton = buttonConfigs[Math.floor(Math.random() * difficultySettings[difficulty].buttonCount)].id;
    const expectedSequence = [testButton];
    
    if (chamberRules[testButton]) {
      chamberRules[testButton].forEach(rule => {
        expectedSequence.push(rule.transform);
      });
    }

    // Check if prediction matches expected sequence
    const isCorrect = predictionSequence.length === expectedSequence.length &&
      predictionSequence.every((button, index) => button === expectedSequence[index]);

    setShowFeedback(true);

    if (isCorrect) {
      setFeedbackType('correct');
      setSolvedLevels(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });

      setTimeout(() => {
        if (currentLevel + 1 >= difficultySettings[difficulty].levelCount) {
          setGameState('finished');
          setShowCompletionModal(true);
        } else {
          setCurrentLevel(prev => prev + 1);
          initializeLevel(currentLevel + 1);
        }
      }, 2500);
    } else {
      setFeedbackType('incorrect');
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            setGameState('finished');
            setShowCompletionModal(true);
          }, 2000);
        }
        return Math.max(0, newLives);
      });

      setTimeout(() => {
        if (lives > 1) {
          setShowFeedback(false);
          initializeLevel(currentLevel);
        }
      }, 2500);
    }
  }, [currentPhase, predictionSequence, levelStartTime, currentLevel, lives, chamberRules, difficulty]);

  // Initialize level
  const initializeLevel = useCallback((level) => {
    const rules = generateChamberRules(level, difficulty);
    setChamberRules(rules);
    setCurrentPhase('observation');
    setObservationCount(0);
    setPredictionSequence([]);
    setEchoHistory([]);
    setActiveSignal(null);
    setShowFeedback(false);
    setLevelStartTime(Date.now());
    setRequiredObservations(difficultySettings[difficulty].maxEchoes);
  }, [difficulty, generateChamberRules]);

  // Use hint
  const useHint = useCallback(() => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;

    setHintsUsed(prev => prev + 1);
    
    let message = '';
    if (currentPhase === 'observation') {
      message = 'Watch carefully how each button creates echoes. Look for patterns in timing and transformations.';
    } else {
      const firstButton = Object.keys(chamberRules)[0];
      if (chamberRules[firstButton] && chamberRules[firstButton].length > 0) {
        const firstEcho = chamberRules[firstButton][0];
        message = `Pressing ${buttonConfigs.find(b => b.id === firstButton)?.name} creates an echo as ${buttonConfigs.find(b => b.id === firstEcho.transform)?.name}`;
      } else {
        message = 'Try to predict the complete sequence of echoes for each button press.';
      }
    }

    setHintMessage(message);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 4000);
  }, [hintsUsed, maxHints, gameState, currentPhase, chamberRules]);

  // Reset current level
  const resetLevel = () => {
    if (gameState === 'playing') {
      initializeLevel(currentLevel);
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
            setShowCompletionModal(true);
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
    setCurrentLevel(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setSolvedLevels(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
    setShowFeedback(false);
    setShowHint(false);
    
    initializeLevel(0);
  }, [difficulty, initializeLevel]);

  const handleStart = () => {
    initializeGame();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Echo Chamber Game completed:', payload);
  };

  const customStats = {
    currentLevel: currentLevel + 1,
    totalLevels: difficultySettings[difficulty].levelCount,
    streak: maxStreak,
    lives,
    hintsUsed,
    solvedLevels,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    phase: currentPhase,
    observations: observationCount
  };

  const activeButtons = buttonConfigs.slice(0, difficultySettings[difficulty].buttonCount);

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Echo Chamber"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Echo Chamber
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Toggle Content */}
              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🧪 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Learn the hidden rules of the echo chamber by observing patterns, then predict future echo sequences.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔬 Phases
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Observation: Press buttons to see echo patterns</li>
                      <li>• Prediction: Predict the complete echo sequence</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 25 points per level</li>
                      <li>• Moderate: 28 points per level</li>
                      <li>• Hard: 40 points per level</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Levels
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 levels, 4 buttons, 2 echoes</li>
                      <li>• Moderate: 7 levels, 5 buttons, 3 echoes</li>
                      <li>• Hard: 5 levels, 6 buttons, 4 echoes</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Cognitive Reasoning"
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
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {gameState === 'playing' && (
              <>
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
                <button
                  onClick={resetLevel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Level
                </button>
                {currentPhase === 'prediction' && predictionSequence.length > 0 && (
                  <button
                    onClick={submitPrediction}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Submit Prediction
                  </button>
                )}
              </>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel + 1}/{difficultySettings[difficulty].levelCount}
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
                Phase
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentPhase === 'observation' ? 'Observe' : 'Predict'}
              </div>
            </div>
          </div>

          {/* Phase Instructions */}
          <div className="w-full max-w-4xl mb-6">
            <div className={`border rounded-lg p-4 text-center ${
              currentPhase === 'observation' 
                ? 'bg-blue-100 border-blue-300' 
                : 'bg-purple-100 border-purple-300'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {currentPhase === 'observation' ? (
                  <>
                    <Brain className="h-5 w-5 text-blue-800" />
                    <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Observation Phase - Level {currentLevel + 1}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 text-purple-800" />
                    <span className="font-semibold text-purple-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Prediction Phase - Level {currentLevel + 1}
                    </span>
                  </>
                )}
              </div>
              <p className={`${currentPhase === 'observation' ? 'text-blue-700' : 'text-purple-700'}`} 
                 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {currentPhase === 'observation' 
                  ? `Press buttons to observe echo patterns. ${observationCount}/${requiredObservations} observations completed.`
                  : 'Based on your observations, predict the complete echo sequence by clicking buttons in order.'
                }
              </p>
            </div>
          </div>

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

          {/* Echo Chamber Interface */}
          <div className="relative w-full max-w-4xl mb-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-4 border-gray-600">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Echo Chamber
                </h3>
                <div className="text-gray-300 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {difficulty} Mode - {activeButtons.length} Active Buttons
                </div>
              </div>

              {/* Signal Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {activeButtons.map((button, index) => (
                  <button
                    key={button.id}
                    onClick={() => handleButtonPress(button.id)}
                    disabled={showFeedback}
                    className={`relative h-24 w-24 mx-auto rounded-full border-4 transition-all duration-300 transform hover:scale-110 ${
                      activeSignal === button.id
                        ? 'animate-pulse shadow-2xl'
                        : 'hover:shadow-xl'
                    }`}
                    style={{
                      backgroundColor: activeSignal === button.id ? button.color : 'transparent',
                      borderColor: button.color,
                      boxShadow: activeSignal === button.id ? `0 0 30px ${button.color}` : 'none'
                    }}
                  >
                    <div 
                      className="text-2xl font-bold"
                      style={{ 
                        color: activeSignal === button.id ? 'white' : button.color,
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    >
                      {button.symbol}
                    </div>
                    <div 
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs"
                      style={{ 
                        color: button.color,
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    >
                      {button.name}
                    </div>
                  </button>
                ))}
              </div>

              {/* Prediction Sequence Display */}
              {currentPhase === 'prediction' && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="text-white text-center mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Your Prediction Sequence:
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {predictionSequence.length === 0 ? (
                      <div className="text-gray-400 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Click buttons to build your prediction...
                      </div>
                    ) : (
                      predictionSequence.map((buttonId, index) => {
                        const button = buttonConfigs.find(b => b.id === buttonId);
                        return (
                          <div
                            key={index}
                            className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-bold"
                            style={{
                              borderColor: button?.color || '#gray',
                              color: button?.color || '#gray'
                            }}
                          >
                            {button?.symbol}
                          </div>
                        );
                      })
                    )}
                    {predictionSequence.length > 0 && (
                      <button
                        onClick={() => setPredictionSequence([])}
                        className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Echo History Display */}
              {echoHistory.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-white text-center mb-2 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Echo History (Recent Observations):
                  </div>
                  <div className="space-y-2 max-h-20 overflow-y-auto">
                    {echoHistory.slice(-3).map((echo, index) => {
                      const originalButton = buttonConfigs.find(b => b.id === echo.originalButton);
                      return (
                        <div key={echo.id} className="text-xs text-gray-300 flex items-center gap-2" 
                             style={{ fontFamily: 'Roboto, sans-serif' }}>
                          <span style={{ color: originalButton?.color }}>
                            {originalButton?.symbol}
                          </span>
                          <span>→</span>
                          {echo.echoes.map((echoRule, echoIndex) => {
                            const echoButton = buttonConfigs.find(b => b.id === echoRule.transform);
                            return (
                              <span key={echoIndex} style={{ color: echoButton?.color }}>
                                {echoButton?.symbol}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
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
                  {feedbackType === 'correct' ? 'Pattern Mastered!' : 'Pattern Not Recognized!'}
                </div>
              </div>
              {feedbackType === 'correct' && (
                <div className="text-green-700 font-medium mb-2">
                  +{difficultySettings[difficulty].pointsPerLevel} points earned!
                </div>
              )}
              {feedbackType === 'correct' && currentLevel + 1 < difficultySettings[difficulty].levelCount && (
                <p className="text-green-700 font-medium">
                  Advancing to next chamber level...
                </p>
              )}
              {feedbackType === 'incorrect' && lives > 1 && (
                <p className="text-red-700 font-medium">
                  Lives remaining: {lives - 1}. Study the patterns more carefully.
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              {currentPhase === 'observation' 
                ? 'Click buttons to see how they create echo patterns. Each button follows hidden rules.'
                : 'Based on your observations, predict the complete sequence of echoes.'
              }
            </p>
            <div className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].levelCount} levels | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              {difficultySettings[difficulty].pointsPerLevel} points per level
            </div>
          </div>
        </div>
      </GameFramework>
      
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
      />
    </div>
  );
};

export default EchoChamberGame;