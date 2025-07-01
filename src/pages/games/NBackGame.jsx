import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const NBackGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [difficulty, setDifficulty] = useState('medium');

  // N-Back specific state
  const [nLevel, setNLevel] = useState(2);
  const [gameMode, setGameMode] = useState('visual'); // 'visual', 'auditory', 'dual'
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [userResponses, setUserResponses] = useState([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [correctRejections, setCorrectRejections] = useState(0);
  const [totalTrials, setTotalTrials] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Refs for timers
  const stimulusTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      nLevel: 1,
      sequenceLength: 20,
      stimulusDuration: 2000,
      intervalDuration: 3000,
      timeLimit: 420,
      complexity: 'Easy',
      description: '1-Back with slower timing'
    },
    medium: {
      nLevel: 2,
      sequenceLength: 30,
      stimulusDuration: 1500,
      intervalDuration: 2500,
      timeLimit: 300,
      complexity: 'Medium',
      description: '2-Back with standard timing'
    },
    hard: {
      nLevel: 3,
      sequenceLength: 40,
      stimulusDuration: 1000,
      intervalDuration: 2000,
      timeLimit: 240,
      complexity: 'Hard',
      description: '3-Back with fast timing'
    }
  };

  // Stimulus sets
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const gridPositions = [
    { row: 0, col: 0, id: 0 }, { row: 0, col: 1, id: 1 }, { row: 0, col: 2, id: 2 },
    { row: 1, col: 0, id: 3 }, { row: 1, col: 1, id: 4 }, { row: 1, col: 2, id: 5 },
    { row: 2, col: 0, id: 6 }, { row: 2, col: 1, id: 7 }, { row: 2, col: 2, id: 8 }
  ];

  // Generate sequence with target probability
  const generateSequence = useCallback((length, targetProbability = 0.3) => {
    const settings = difficultySettings[difficulty];
    const n = settings.nLevel;
    const newSequence = [];

    for (let i = 0; i < length; i++) {
      let stimulus;

      if (i >= n && Math.random() < targetProbability) {
        // Create a target (match with n-back)
        if (gameMode === 'visual') {
          stimulus = {
            visual: newSequence[i - n].visual,
            isTarget: true,
            index: i
          };
        } else if (gameMode === 'auditory') {
          stimulus = {
            auditory: newSequence[i - n].auditory,
            isTarget: true,
            index: i
          };
        } else { // dual
          const visualMatch = Math.random() < 0.5;
          const auditoryMatch = !visualMatch || Math.random() < 0.3; // Ensure at least one match
          stimulus = {
            visual: visualMatch ? newSequence[i - n].visual : gridPositions[Math.floor(Math.random() * gridPositions.length)],
            auditory: auditoryMatch ? newSequence[i - n].auditory : letters[Math.floor(Math.random() * letters.length)],
            isVisualTarget: visualMatch,
            isAuditoryTarget: auditoryMatch,
            isTarget: visualMatch || auditoryMatch,
            index: i
          };
        }
      } else {
        // Create a non-target
        let visual, auditory;

        if (gameMode === 'visual' || gameMode === 'dual') {
          // Ensure visual stimulus is different from n-back if possible
          do {
            visual = gridPositions[Math.floor(Math.random() * gridPositions.length)];
          } while (i >= n && visual.id === newSequence[i - n].visual?.id && Math.random() < 0.8);
        }

        if (gameMode === 'auditory' || gameMode === 'dual') {
          // Ensure auditory stimulus is different from n-back if possible
          do {
            auditory = letters[Math.floor(Math.random() * letters.length)];
          } while (i >= n && auditory === newSequence[i - n].auditory && Math.random() < 0.8);
        }

        if (gameMode === 'visual') {
          stimulus = { visual, isTarget: false, index: i };
        } else if (gameMode === 'auditory') {
          stimulus = { auditory, isTarget: false, index: i };
        } else { // dual
          stimulus = {
            visual,
            auditory,
            isVisualTarget: false,
            isAuditoryTarget: false,
            isTarget: false,
            index: i
          };
        }
      }

      newSequence.push(stimulus);
    }

    return newSequence;
  }, [difficulty, gameMode]);

  // Handle user response
  const handleResponse = useCallback((responseType = 'match') => {
    if (!isPlaying || !currentStimulus || !showStimulus) return;

    const currentStim = currentStimulus;

    // Clear the stimulus timeout since user responded
    if (stimulusTimeoutRef.current) {
      clearTimeout(stimulusTimeoutRef.current);
      stimulusTimeoutRef.current = null;
    }

    if (gameMode === 'dual') {
      // Handle dual n-back responses
      if (responseType === 'visual' && currentStim.isVisualTarget) {
        setHits(prev => prev + 1);
        setScore(prev => prev + 10);
        setFeedback({ type: 'hit', message: 'Visual Hit!' });
      } else if (responseType === 'auditory' && currentStim.isAuditoryTarget) {
        setHits(prev => prev + 1);
        setScore(prev => prev + 10);
        setFeedback({ type: 'hit', message: 'Auditory Hit!' });
      } else {
        setFalseAlarms(prev => prev + 1);
        setFeedback({ type: 'false_alarm', message: 'False Alarm!' });
      }
    } else {
      // Handle single modality responses
      if (currentStim.isTarget) {
        setHits(prev => prev + 1);
        setScore(prev => prev + 15);
        setFeedback({ type: 'hit', message: 'Correct Match!' });
      } else {
        setFalseAlarms(prev => prev + 1);
        setFeedback({ type: 'false_alarm', message: 'False Alarm!' });
      }
    }

    // Hide stimulus and continue
    setShowStimulus(false);

    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 800);
  }, [isPlaying, currentStimulus, showStimulus, gameMode]);

  // Handle stimulus timeout (no response)
  const handleStimulusTimeout = useCallback(() => {
    if (!isPlaying || !currentStimulus) return;

    const currentStim = currentStimulus;

    if (gameMode === 'dual') {
      if (!currentStim.isVisualTarget && !currentStim.isAuditoryTarget) {
        setCorrectRejections(prev => prev + 1);
        setScore(prev => prev + 5);
      } else {
        setMisses(prev => prev + 1);
        setFeedback({ type: 'miss', message: 'Missed Target!' });
        setTimeout(() => setFeedback(null), 800);
      }
    } else {
      if (currentStim.isTarget) {
        setMisses(prev => prev + 1);
        setFeedback({ type: 'miss', message: 'Missed Target!' });
        setTimeout(() => setFeedback(null), 800);
      } else {
        setCorrectRejections(prev => prev + 1);
        setScore(prev => prev + 5);
      }
    }
  }, [isPlaying, currentStimulus, gameMode]);



  // Start game sequence
  const startSequence = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const newSequence = generateSequence(settings.sequenceLength);
    setSequence(newSequence);
    setCurrentIndex(0);
    setIsPlaying(true);

    let currentIdx = 0;

    const showNextStimulus = () => {
      if (currentIdx >= newSequence.length) {
        setIsPlaying(false);
        setGameState('completed');
        return;
      }

      setCurrentIndex(currentIdx);
      setCurrentStimulus(newSequence[currentIdx]);
      setShowStimulus(true);
      setTotalTrials(prev => prev + 1);

      // Hide stimulus after duration
      stimulusTimeoutRef.current = setTimeout(() => {
        setShowStimulus(false);
        handleStimulusTimeout();

        currentIdx++;

        // Schedule next stimulus
        setTimeout(() => {
          showNextStimulus();
        }, 500); // Brief pause between stimuli

      }, settings.stimulusDuration);
    };

    // Start the sequence after a brief delay
    setTimeout(() => {
      showNextStimulus();
    }, 1000);

  }, [difficulty, generateSequence, handleStimulusTimeout]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setNLevel(settings.nLevel);
    setSequence([]);
    setCurrentIndex(0);
    setCurrentStimulus(null);
    setShowStimulus(false);
    setUserResponses([]);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setCorrectRejections(0);
    setTotalTrials(0);
    setIsPlaying(false);
    setFeedback(null);

    // Clear timers
    if (stimulusTimeoutRef.current) {
      clearTimeout(stimulusTimeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [difficulty]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isPlaying) return;

      if (gameMode === 'dual') {
        if (event.key === 'v' || event.key === 'V') {
          handleResponse('visual');
        } else if (event.key === 'a' || event.key === 'A') {
          handleResponse('auditory');
        }
      } else {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          handleResponse('match');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameMode, handleResponse]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('completed');
      setIsPlaying(false);
    }
  }, [gameState, timeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Game handlers
  const handleStart = () => {
    setGameState('playing');
    startSequence();
  };

  const handleReset = () => {
    setGameState('ready');
    setIsPlaying(false);

    // Clear all timers
    if (stimulusTimeoutRef.current) {
      clearTimeout(stimulusTimeoutRef.current);
      stimulusTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('N-Back Game completed:', payload);
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    const accuracy = totalTrials > 0 ? Math.round(((hits + correctRejections) / totalTrials) * 100) : 0;
    const hitRate = (hits + misses) > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
    const falseAlarmRate = (falseAlarms + correctRejections) > 0 ? Math.round((falseAlarms / (falseAlarms + correctRejections)) * 100) : 0;

    return { accuracy, hitRate, falseAlarmRate };
  };

  // Custom stats
  const metrics = calculateMetrics();
  const customStats = {
    nLevel,
    gameMode,
    currentTrial: Math.min(currentIndex + 1, difficultySettings[difficulty].sequenceLength),
    totalTrials: difficultySettings[difficulty].sequenceLength,
    hits,
    misses,
    falseAlarms,
    correctRejections,
    sequenceLength: sequence.length,
    isPlaying,
    showStimulus,
    ...metrics
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="N-Back Working Memory Test"
        gameDescription="Train your working memory by identifying stimuli that match those from N steps back"
        category="Working Memory"
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
                N-LEVEL
              </div>
              <div className="text-lg sm:text-xl font-bold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {nLevel}-Back
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                MODE
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {gameMode}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                TRIAL
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentIndex + 1}/{customStats.totalTrials}
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
                HIT RATE
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.hitRate}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                FALSE ALARMS
              </div>
              <div className="text-lg sm:text-xl font-bold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {falseAlarms}
              </div>
            </div>
          </div>

          {/* Game Mode Selector */}
          {gameState === 'ready' && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Select Game Mode
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setGameMode('visual')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${gameMode === 'visual'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div className="text-2xl mb-2">👁️</div>
                    <div className="font-semibold">Visual N-Back</div>
                    <div className="text-sm opacity-75">Grid positions</div>
                  </button>
                  <button
                    onClick={() => setGameMode('auditory')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${gameMode === 'auditory'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div className="text-2xl mb-2">🔊</div>
                    <div className="font-semibold">Auditory N-Back</div>
                    <div className="text-sm opacity-75">Letters</div>
                  </button>
                  <button
                    onClick={() => setGameMode('dual')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${gameMode === 'dual'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div className="text-2xl mb-2">🧠</div>
                    <div className="font-semibold">Dual N-Back</div>
                    <div className="text-sm opacity-75">Both modalities</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Game Area */}
          <div className="w-full max-w-4xl mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              {/* Game Status */}
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {nLevel}-Back {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Test
                </h3>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'playing'
                    ? `Identify matches with stimuli from ${nLevel} step${nLevel > 1 ? 's' : ''} back`
                    : gameState === 'ready'
                      ? 'Press the response button when current stimulus matches the one from N steps back'
                      : 'Working Memory Test Complete'
                  }
                </div>

                {/* Debug Info - Remove in production */}
                {gameState === 'playing' && (
                  <div className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Trial: {currentIndex + 1}/{sequence.length} |
                    Playing: {isPlaying ? 'Yes' : 'No'} |
                    Showing: {showStimulus ? 'Yes' : 'No'} |
                    {currentStimulus && (gameMode === 'visual' || gameMode === 'dual') && ` Pos: ${currentStimulus.visual?.id}`}
                    {currentStimulus && (gameMode === 'auditory' || gameMode === 'dual') && ` Letter: ${currentStimulus.auditory}`}
                    {currentStimulus && ` Target: ${currentStimulus.isTarget ? 'Yes' : 'No'}`}
                  </div>
                )}
              </div>

              {/* Stimulus Display Area */}
              <div className="relative bg-gray-50 border-2 border-gray-300 rounded-lg mx-auto mb-8" style={{ width: '100%', maxWidth: '400px', height: '400px' }}>
                {/* Visual Stimulus (Grid) */}
                {(gameMode === 'visual' || gameMode === 'dual') && (
                  <div className="absolute inset-4">
                    <div className="grid grid-cols-3 gap-2 h-full">
                      {gridPositions.map((position) => (
                        <div
                          key={position.id}
                          className={`rounded border-2 transition-all duration-200 ${showStimulus && currentStimulus &&
                            ((gameMode === 'visual' && currentStimulus.visual?.id === position.id) ||
                              (gameMode === 'dual' && currentStimulus.visual?.id === position.id))
                            ? 'bg-blue-500 border-blue-600 shadow-lg'
                            : 'bg-white border-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Auditory Stimulus Display */}
                {(gameMode === 'auditory' || gameMode === 'dual') && showStimulus && currentStimulus && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      {gameMode === 'auditory' && (
                        <div className="text-8xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {currentStimulus.auditory}
                        </div>
                      )}
                      {gameMode === 'dual' && (
                        <div className="absolute bottom-8 left-0 right-0 text-center">
                          <div className="text-4xl font-bold text-gray-900 bg-white rounded-lg px-4 py-2 inline-block shadow-md" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {currentStimulus.auditory}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Feedback Display */}
                {feedback && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className={`text-center p-2 rounded-lg text-sm font-semibold ${feedback.type === 'hit' ? 'bg-green-100 text-green-700' :
                      feedback.type === 'miss' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {feedback.message}
                    </div>
                  </div>
                )}

                {/* Instructions Overlay */}
                {gameState !== 'playing' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🧠</div>
                      <p className="text-gray-700 font-medium mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {gameState === 'ready' ? `${nLevel}-Back ${gameMode} Test` : 'Test Complete'}
                      </p>
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {gameState === 'ready'
                          ? `Match stimuli from ${nLevel} step${nLevel > 1 ? 's' : ''} back`
                          : `Final Score: ${score} points`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Buttons */}
              {gameState === 'playing' && (
                <div className="flex justify-center gap-4 mb-6">
                  {gameMode === 'dual' ? (
                    <>
                      <button
                        onClick={() => handleResponse('visual')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-200"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        👁️ Visual Match (V)
                      </button>
                      <button
                        onClick={() => handleResponse('auditory')}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-200"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        🔊 Audio Match (A)
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleResponse('match')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-lg font-bold text-xl transition-colors duration-200"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      ✓ MATCH (SPACE)
                    </button>
                  )}
                </div>
              )}

              {/* Performance Summary */}
              {gameState === 'playing' && totalTrials > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.accuracy}%
                    </div>
                    <div className="text-xs text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Accuracy
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.hitRate}%
                    </div>
                    <div className="text-xs text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
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
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {hits + correctRejections}
                    </div>
                    <div className="text-xs text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Correct Total
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
                  N-Back Working Memory Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Train your working memory by identifying stimuli that match those from N steps back
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600">👁️</span>
                    </div>
                    <h4 className="font-bold text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Visual N-Back
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Watch squares light up in a 3x3 grid</li>
                    <li>• Remember the position from N steps back</li>
                    <li>• Press MATCH when current position equals N-back position</li>
                    <li>• Trains spatial working memory</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600">🔊</span>
                    </div>
                    <h4 className="font-bold text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Auditory N-Back
                    </h4>
                  </div>
                  <ul className="text-sm text-green-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Listen to letters spoken aloud</li>
                    <li>• Remember the letter from N steps back</li>
                    <li>• Press MATCH when current letter equals N-back letter</li>
                    <li>• Trains verbal working memory</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600">🧠</span>
                    </div>
                    <h4 className="font-bold text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Dual N-Back
                    </h4>
                  </div>
                  <ul className="text-sm text-purple-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Both visual and auditory stimuli simultaneously</li>
                    <li>• Track both modalities independently</li>
                    <li>• Press V for visual matches, A for auditory matches</li>
                    <li>• Most challenging working memory training</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How N-Back Works
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>
                    <strong>1-Back (Easy):</strong> Compare current stimulus with the immediately previous one
                  </div>
                  <div>
                    <strong>2-Back (Medium):</strong> Compare current stimulus with the one shown 2 steps ago
                  </div>
                  <div>
                    <strong>3-Back (Hard):</strong> Compare current stimulus with the one shown 3 steps ago
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div><strong>Hits:</strong> Correctly identified matches</div>
                  <div><strong>Misses:</strong> Failed to identify matches</div>
                  <div><strong>False Alarms:</strong> Incorrectly identified non-matches as matches</div>
                  <div><strong>Correct Rejections:</strong> Correctly identified non-matches</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: SPACEBAR or ENTER for single mode matches • V for visual matches, A for auditory matches in dual mode
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: N-Back training can improve fluid intelligence and working memory capacity with regular practice.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default NBackGame;
