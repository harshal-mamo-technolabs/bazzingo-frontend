import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const ColorRushGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentColor, setCurrentColor] = useState(null);
  const [targetColor, setTargetColor] = useState(null);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [incorrectResponses, setIncorrectResponses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [stimulusStartTime, setStimulusStartTime] = useState(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  // Available colors
  const colors = [
    { id: 'red', name: 'Red', color: '#EF4444' },
    { id: 'blue', name: 'Blue', color: '#3B82F6' },
    { id: 'green', name: 'Green', color: '#10B981' },
    { id: 'yellow', name: 'Yellow', color: '#F59E0B' },
    { id: 'purple', name: 'Purple', color: '#8B5CF6' },
    { id: 'orange', name: 'Orange', color: '#F97316' }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: { interval: 2000, matchProbability: 0.7, timeLimit: 60 },
    Moderate: { interval: 1500, matchProbability: 0.6, timeLimit: 50 },
    Hard: { interval: 1000, matchProbability: 0.5, timeLimit: 40 }
  };

  // Generate new stimulus
  const generateStimulus = useCallback(() => {
    if (gameState !== 'playing') return;

    const settings = difficultySettings[difficulty];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Determine if this should be a match or not
    const shouldMatch = Math.random() < settings.matchProbability;
    const displayColor = shouldMatch ? targetColor : randomColor;

    setCurrentColor(displayColor);
    setStimulusStartTime(Date.now());
    setIsWaitingForResponse(true);

    // Auto-advance after a timeout (counts as missed)
    setTimeout(() => {
      if (isWaitingForResponse) {
        handleResponse(false); // Timeout = incorrect
      }
    }, 1500);
  }, [gameState, difficulty, targetColor, isWaitingForResponse]);

  // Handle user response
  const handleResponse = (userSaysMatch) => {
    if (!isWaitingForResponse || gameState !== 'playing') return;

    const reactionTime = Date.now() - stimulusStartTime;
    const actualMatch = currentColor?.id === targetColor?.id;
    const isCorrect = userSaysMatch === actualMatch;

    setReactionTimes(prev => [...prev, reactionTime]);
    setIsWaitingForResponse(false);

    if (isCorrect) {
      setCorrectResponses(prev => prev + 1);
    } else {
      setIncorrectResponses(prev => prev + 1);
    }

    // Clear current color and schedule next stimulus
    setTimeout(() => {
      setCurrentColor(null);
      setTimeout(generateStimulus, Math.random() * 1000 + 500);
    }, 500);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const randomTarget = colors[Math.floor(Math.random() * colors.length)];

    setTargetColor(randomTarget);
    setCurrentColor(null);
    setCorrectResponses(0);
    setIncorrectResponses(0);
    setReactionTimes([]);
    setStimulusStartTime(null);
    setIsWaitingForResponse(false);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
  }, [difficulty]);

  // Start stimulus sequence
  const startStimulusSequence = useCallback(() => {
    setTimeout(generateStimulus, 1000);
  }, [generateStimulus]);

  // Calculate score
  useEffect(() => {
    const totalResponses = correctResponses + incorrectResponses;
    if (totalResponses > 0) {
      const accuracy = correctResponses / totalResponses;
      const avgReactionTime = reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 1000;

      // Score based on accuracy and reaction time
      let reactionFactor = 1;
      if (avgReactionTime <= 300) reactionFactor = 2;
      else if (avgReactionTime <= 500) reactionFactor = 1.5;
      else if (avgReactionTime <= 700) reactionFactor = 1.2;

      const newScore = Math.min(200, accuracy * 100 * reactionFactor + correctResponses * 5);
      setScore(Math.max(0, newScore));
    }
  }, [correctResponses, incorrectResponses, reactionTimes]);

  // Timer countdown
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'enter':
          e.preventDefault();
          handleResponse(true); // Space/Enter = Match
          break;
        case 'x':
        case 'n':
          e.preventDefault();
          handleResponse(false); // X/N = No Match
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleResponse]);

  const handleStart = () => {
    initializeGame();
    startStimulusSequence();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const customStats = {
    correctResponses,
    incorrectResponses,
    avgReactionMs: avgReactionTime
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Color Rush"
        gameDescription="React quickly when the displayed color matches the target color!"
        category="Reflexes"
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
          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-lg">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Correct
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctResponses}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Incorrect
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {incorrectResponses}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {(correctResponses + incorrectResponses) > 0
                  ? Math.round((correctResponses / (correctResponses + incorrectResponses)) * 100)
                  : 0}%
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Avg Time
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {avgReactionTime}ms
              </div>
            </div>
          </div>

          {/* Target Color Display */}
          {targetColor && (
            <div className="mb-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Target Color:
              </h3>
              <div className="flex items-center justify-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg border-4 border-gray-300"
                  style={{ backgroundColor: targetColor.color }}
                />
                <div className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {targetColor.name}
                </div>
              </div>
            </div>
          )}

          {/* Stimulus Display */}
          <div className="mb-8 text-center">
            <div className="w-32 h-32 mx-auto rounded-lg border-4 border-gray-300 flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: currentColor ? currentColor.color : '#f3f4f6',
                transform: currentColor ? 'scale(1.1)' : 'scale(1)'
              }}>
              {!currentColor && (
                <div className="text-gray-500 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Ready...
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleResponse(true)}
              disabled={!isWaitingForResponse}
              className={`px-6 py-4 rounded-lg font-semibold transition-colors ${!isWaitingForResponse
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              MATCH
              <div className="text-sm opacity-75">(Space/Enter)</div>
            </button>
            <button
              onClick={() => handleResponse(false)}
              disabled={!isWaitingForResponse}
              className={`px-6 py-4 rounded-lg font-semibold transition-colors ${!isWaitingForResponse
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              NO MATCH
              <div className="text-sm opacity-75">(X/N)</div>
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              When a color appears, quickly decide if it matches the target color.
              Use the buttons or keyboard shortcuts to respond as fast as possible!
            </p>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default ColorRushGame;
