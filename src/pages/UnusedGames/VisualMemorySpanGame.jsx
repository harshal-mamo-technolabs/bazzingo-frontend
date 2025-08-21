import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const VisualMemorySpanGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [difficulty, setDifficulty] = useState('medium');

  // Test state
  const [phase, setPhase] = useState('immediate'); // 'immediate', 'delayed'
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentSpan, setCurrentSpan] = useState(3);
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [showDelay, setShowDelay] = useState(false);
  const [delayTimeRemaining, setDelayTimeRemaining] = useState(4);
  const [correctTrials, setCorrectTrials] = useState(0);
  const [totalTrials, setTotalTrials] = useState(0);
  const [spanResults, setSpanResults] = useState({});
  const [maxSpanReached, setMaxSpanReached] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  // Refs
  const sequenceTimeoutRef = useRef(null);
  const delayTimeoutRef = useRef(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      gridSize: 3, // 3x3 grid
      startingSpan: 2,
      maxSpan: 6,
      sequenceSpeed: 1200,
      trialsPerSpan: 2,
      timeLimit: 720,
      complexity: 'Easy',
      description: 'Smaller grid, slower sequence, shorter spans'
    },
    medium: {
      gridSize: 4, // 4x4 grid
      startingSpan: 3,
      maxSpan: 8,
      sequenceSpeed: 1000,
      trialsPerSpan: 3,
      timeLimit: 600,
      complexity: 'Medium',
      description: 'Standard grid size and timing'
    },
    hard: {
      gridSize: 5, // 5x5 grid
      startingSpan: 4,
      maxSpan: 10,
      sequenceSpeed: 800,
      trialsPerSpan: 3,
      timeLimit: 480,
      complexity: 'Hard',
      description: 'Larger grid, faster sequence, longer spans'
    }
  };

  // Generate grid positions
  const generateGridPositions = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const positions = [];
    for (let row = 0; row < settings.gridSize; row++) {
      for (let col = 0; col < settings.gridSize; col++) {
        positions.push({ row, col, id: row * settings.gridSize + col });
      }
    }
    return positions;
  }, [difficulty]);

  // Generate random sequence
  const generateSequence = useCallback((length) => {
    const positions = generateGridPositions();
    const shuffled = [...positions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, length);
  }, [generateGridPositions]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setPhase('immediate');
    setCurrentTrial(0);
    setCurrentSpan(settings.startingSpan);
    setSequence([]);
    setUserSequence([]);
    setShowingSequence(false);
    setSequenceIndex(0);
    setWaitingForInput(false);
    setShowDelay(false);
    setDelayTimeRemaining(4);
    setCorrectTrials(0);
    setTotalTrials(0);
    setSpanResults({});
    setMaxSpanReached(0);
    setConsecutiveFailures(0);
  }, [difficulty]);

  // Start new trial
  const startNewTrial = useCallback(() => {
    const newSequence = generateSequence(currentSpan);
    setSequence(newSequence);
    setUserSequence([]);
    setSequenceIndex(0);
    setShowingSequence(true);
    setWaitingForInput(false);
    setShowDelay(false);
    setDelayTimeRemaining(4);

    // Start showing sequence
    showSequenceStep(newSequence, 0);
  }, [currentSpan, generateSequence]);

  // Show sequence step by step
  const showSequenceStep = useCallback((seq, index) => {
    if (index >= seq.length) {
      setShowingSequence(false);

      if (phase === 'delayed') {
        // Start delay period
        setShowDelay(true);
        setDelayTimeRemaining(4);

        const delayInterval = setInterval(() => {
          setDelayTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(delayInterval);
              setShowDelay(false);
              setWaitingForInput(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        delayTimeoutRef.current = delayInterval;
      } else {
        setWaitingForInput(true);
      }
      return;
    }

    setSequenceIndex(index);

    sequenceTimeoutRef.current = setTimeout(() => {
      showSequenceStep(seq, index + 1);
    }, difficultySettings[difficulty].sequenceSpeed);
  }, [phase, difficulty]);

  // Handle circle click
  const handleCircleClick = useCallback((position) => {
    if (!waitingForInput || showingSequence || showDelay) return;

    const newUserSequence = [...userSequence, position];
    setUserSequence(newUserSequence);

    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      // Check if sequence is correct
      const isCorrect = newUserSequence.every((pos, index) =>
        pos.id === sequence[index].id
      );

      setTotalTrials(prev => prev + 1);

      if (isCorrect) {
        setCorrectTrials(prev => prev + 1);
        setScore(prev => prev + currentSpan * 10);
        setConsecutiveFailures(0);

        // Update span results
        setSpanResults(prev => ({
          ...prev,
          [currentSpan]: (prev[currentSpan] || 0) + 1
        }));

        if (currentSpan > maxSpanReached) {
          setMaxSpanReached(currentSpan);
        }
      } else {
        setConsecutiveFailures(prev => prev + 1);
      }

      // Move to next trial or span
      setTimeout(() => {
        const settings = difficultySettings[difficulty];
        const trialsAtCurrentSpan = spanResults[currentSpan] || 0;
        const totalTrialsAtSpan = Math.ceil(totalTrials / settings.trialsPerSpan) * settings.trialsPerSpan;

        if (isCorrect && trialsAtCurrentSpan + 1 >= settings.trialsPerSpan) {
          // Move to next span
          if (currentSpan < settings.maxSpan) {
            setCurrentSpan(prev => prev + 1);
            setCurrentTrial(0);
          } else {
            // Switch to delayed phase or end game
            if (phase === 'immediate') {
              setPhase('delayed');
              setCurrentSpan(settings.startingSpan);
              setCurrentTrial(0);
              setSpanResults({});
            } else {
              setGameState('completed');
              return;
            }
          }
        } else if (consecutiveFailures >= 2) {
          // Too many failures, switch phase or end
          if (phase === 'immediate') {
            setPhase('delayed');
            setCurrentSpan(settings.startingSpan);
            setCurrentTrial(0);
            setSpanResults({});
            setConsecutiveFailures(0);
          } else {
            setGameState('completed');
            return;
          }
        } else {
          setCurrentTrial(prev => prev + 1);
        }

        startNewTrial();
      }, 1500);
    }
  }, [waitingForInput, showingSequence, showDelay, userSequence, sequence, currentSpan, totalTrials, spanResults, maxSpanReached, consecutiveFailures, phase, difficulty, startNewTrial]);

  // Cleanup timeouts
  const cleanupTimeouts = useCallback(() => {
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
    if (delayTimeoutRef.current) {
      clearInterval(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('completed');
      cleanupTimeouts();
    }
  }, [gameState, timeRemaining, cleanupTimeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimeouts();
    };
  }, [cleanupTimeouts]);

  // Game handlers
  const handleStart = () => {
    setGameState('playing');
    setTimeout(() => {
      startNewTrial();
    }, 1000);
  };

  const handleReset = () => {
    setGameState('ready');
    cleanupTimeouts();
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    const accuracy = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;
    const averageSpan = Object.keys(spanResults).length > 0
      ? Object.entries(spanResults).reduce((sum, [span, trials]) => sum + (parseInt(span) * trials), 0) / correctTrials
      : 0;

    return {
      accuracy,
      averageSpan: Math.round(averageSpan * 10) / 10,
      maxSpan: maxSpanReached,
      totalCorrect: correctTrials
    };
  };

  // Custom stats
  const metrics = calculateMetrics();
  const customStats = {
    phase,
    currentSpan,
    currentTrial: currentTrial + 1,
    totalTrials,
    correctTrials,
    ...metrics
  };

  // Get grid positions
  const gridPositions = generateGridPositions();
  const settings = difficultySettings[difficulty];

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Visual Working Memory Span Test"
        gameDescription="Test your visual-spatial working memory through sequence reproduction tasks"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-5xl">
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                PHASE
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {phase}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                SPAN LENGTH
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentSpan}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                TRIAL
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentTrial + 1}
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
                MAX SPAN
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.maxSpan}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CORRECT
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctTrials}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="w-full max-w-4xl mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              {/* Game Status */}
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {phase === 'immediate' ? 'Immediate Recall' : 'Delayed Recall'}
                </h3>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {showingSequence ? `Watch the sequence (${sequenceIndex + 1}/${sequence.length})` :
                    showDelay ? `Remember the sequence... ${delayTimeRemaining}s` :
                      waitingForInput ? `Click circles in the same order (${userSequence.length}/${sequence.length})` :
                        gameState === 'ready' ? 'Watch the sequence, then reproduce it in order' :
                          'Test Complete'}
                </div>
              </div>

              {/* Corsi Block Grid */}
              <div className="flex justify-center mb-8">
                <div
                  className="grid gap-3 sm:gap-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-300"
                  style={{
                    gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
                    maxWidth: '400px',
                    aspectRatio: '1'
                  }}
                >
                  {gridPositions.map((position) => {
                    const isCurrentlyLit = showingSequence && sequenceIndex < sequence.length &&
                      sequence[sequenceIndex].id === position.id;
                    const isInUserSequence = userSequence.some(pos => pos.id === position.id);
                    const userSequenceIndex = userSequence.findIndex(pos => pos.id === position.id);

                    return (
                      <button
                        key={position.id}
                        onClick={() => handleCircleClick(position)}
                        disabled={!waitingForInput}
                        className={`
                          relative w-full aspect-square rounded-full border-2 transition-all duration-300 font-bold text-sm
                          ${isCurrentlyLit
                            ? 'bg-blue-500 border-blue-600 shadow-lg scale-110'
                            : isInUserSequence
                              ? 'bg-green-400 border-green-500 shadow-md'
                              : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm'
                          }
                          ${waitingForInput && !isInUserSequence ? 'cursor-pointer' : 'cursor-default'}
                        `}
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        {isInUserSequence && (
                          <span className="text-white font-bold">
                            {userSequenceIndex + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Indicator */}
              {waitingForInput && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Click {userSequence.length + 1} of {sequence.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Delay Counter */}
              {showDelay && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 bg-yellow-50 rounded-lg px-6 py-4">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-yellow-800 font-bold text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {delayTimeRemaining}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Remember the sequence...
                      </div>
                      <div className="text-sm text-yellow-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Delayed recall in {delayTimeRemaining} seconds
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Summary */}
              {gameState === 'playing' && totalTrials > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.accuracy}%
                    </div>
                    <div className="text-xs text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Accuracy
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.maxSpan}
                    </div>
                    <div className="text-xs text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Max Span
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {metrics.averageSpan}
                    </div>
                    <div className="text-xs text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Avg Span
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {correctTrials}/{totalTrials}
                    </div>
                    <div className="text-xs text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Trials
                    </div>
                  </div>
                </div>
              )}

              {/* Game State Display */}
              {gameState !== 'playing' && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {gameState === 'ready' ? 'Ready to Test Visual Memory' : 'Memory Span Test Complete'}
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {gameState === 'ready'
                      ? 'Watch sequences and reproduce them in the correct order'
                      : `Final Score: ${score} points • Max Span: ${metrics.maxSpan}`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Visual Working Memory Span Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your visual-spatial working memory through sequence reproduction tasks
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Immediate Recall
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Watch circles light up in sequence</li>
                    <li>• Immediately reproduce the sequence</li>
                    <li>• Click circles in the same order</li>
                    <li>• Sequences get progressively longer</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Delayed Recall
                    </h4>
                  </div>
                  <ul className="text-sm text-yellow-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Watch the sequence as before</li>
                    <li>• Wait through a 4-second delay</li>
                    <li>• Then reproduce the sequence</li>
                    <li>• Tests working memory retention</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test Objectives
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>
                    <strong>Span Length:</strong> Maximum sequence length you can accurately reproduce
                  </div>
                  <div>
                    <strong>Working Memory:</strong> Ability to hold and manipulate visual-spatial information
                  </div>
                  <div>
                    <strong>Attention:</strong> Sustained focus during sequence presentation and recall
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Watch the sequence carefully • Click circles in the exact same order
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: Focus on the spatial pattern and try to create a mental map of the sequence.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default VisualMemorySpanGame;
