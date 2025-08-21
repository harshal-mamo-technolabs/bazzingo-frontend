import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const DividedAttentionGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [difficulty, setDifficulty] = useState('medium');

  // Ball tracking state
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [ballDirection, setBallDirection] = useState({ x: 2, y: 1.5 });
  const [ballSpeed, setBallSpeed] = useState(1);
  const [isTrackingBall, setIsTrackingBall] = useState(false);
  const [ballTrackingAccuracy, setBallTrackingAccuracy] = useState(0);
  const [ballTrackingAttempts, setBallTrackingAttempts] = useState(0);

  // Stroop test state
  const [currentStroopTask, setCurrentStroopTask] = useState(null);
  const [stroopResponse, setStroopResponse] = useState('');
  const [stroopCorrect, setStroopCorrect] = useState(0);
  const [stroopTotal, setStroopTotal] = useState(0);
  const [stroopReactionTimes, setStroopReactionTimes] = useState([]);
  const [stroopStartTime, setStroopStartTime] = useState(null);

  // Game statistics
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [averageReactionTime, setAverageReactionTime] = useState(0);

  // Refs
  const gameAreaRef = useRef(null);
  const ballRef = useRef(null);
  const animationRef = useRef(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      ballSpeed: 0.8,
      stroopInterval: 4000,
      timeLimit: 180,
      complexity: 'Easy',
      description: 'Slower ball movement, longer time for Stroop responses'
    },
    medium: {
      ballSpeed: 1.2,
      stroopInterval: 3000,
      timeLimit: 120,
      complexity: 'Medium',
      description: 'Moderate ball speed, standard response time'
    },
    hard: {
      ballSpeed: 1.8,
      stroopInterval: 2000,
      timeLimit: 90,
      complexity: 'Hard',
      description: 'Fast ball movement, quick Stroop responses required'
    }
  };

  // Stroop test colors and words
  const stroopColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const stroopWords = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];

  // Color mapping for display
  const colorMap = {
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    orange: '#F97316'
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setBallPosition({ x: 50, y: 50 });
    setBallDirection({ x: 2, y: 1.5 });
    setBallSpeed(settings.ballSpeed);
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setIsTrackingBall(false);
    setBallTrackingAccuracy(0);
    setBallTrackingAttempts(0);
    setCurrentStroopTask(null);
    setStroopResponse('');
    setStroopCorrect(0);
    setStroopTotal(0);
    setStroopReactionTimes([]);
    setTotalTasks(0);
    setCompletedTasks(0);
    setAverageReactionTime(0);
  }, [difficulty]);

  // Generate new Stroop task
  const generateStroopTask = useCallback(() => {
    const word = stroopWords[Math.floor(Math.random() * stroopWords.length)];
    const color = stroopColors[Math.floor(Math.random() * stroopColors.length)];
    const isCongruent = word.toLowerCase() === color;

    setCurrentStroopTask({
      word,
      color,
      isCongruent,
      correctAnswer: color // Always respond with the color, not the word
    });
    setStroopStartTime(Date.now());
    setStroopTotal(prev => prev + 1);
    setTotalTasks(prev => prev + 1);
  }, []);

  // Handle Stroop response
  const handleStroopResponse = useCallback((selectedColor) => {
    if (!currentStroopTask || !stroopStartTime) return;

    const reactionTime = Date.now() - stroopStartTime;
    const isCorrect = selectedColor === currentStroopTask.correctAnswer;

    if (isCorrect) {
      setStroopCorrect(prev => prev + 1);
      setScore(prev => prev + (currentStroopTask.isCongruent ? 10 : 20)); // More points for incongruent
    }

    setStroopReactionTimes(prev => [...prev, reactionTime]);
    setCompletedTasks(prev => prev + 1);

    // Calculate average reaction time
    const newAverage = [...stroopReactionTimes, reactionTime].reduce((a, b) => a + b, 0) / (stroopReactionTimes.length + 1);
    setAverageReactionTime(Math.round(newAverage));

    setCurrentStroopTask(null);
    setStroopStartTime(null);
  }, [currentStroopTask, stroopStartTime, stroopReactionTimes]);

  // Ball animation
  const animateBall = useCallback(() => {
    if (gameState !== 'playing') return;

    setBallPosition(prev => {
      const gameArea = gameAreaRef.current;
      if (!gameArea) return prev;

      const rect = gameArea.getBoundingClientRect();
      const ballSize = 20; // Ball diameter

      let newX = prev.x + ballDirection.x * ballSpeed;
      let newY = prev.y + ballDirection.y * ballSpeed;

      // Bounce off walls
      if (newX <= 0 || newX >= 100 - (ballSize / rect.width * 100)) {
        setBallDirection(prevDir => ({ ...prevDir, x: -prevDir.x }));
        newX = Math.max(0, Math.min(100 - (ballSize / rect.width * 100), newX));
      }

      if (newY <= 0 || newY >= 100 - (ballSize / rect.height * 100)) {
        setBallDirection(prevDir => ({ ...prevDir, y: -prevDir.y }));
        newY = Math.max(0, Math.min(100 - (ballSize / rect.height * 100), newY));
      }

      return { x: newX, y: newY };
    });

    animationRef.current = requestAnimationFrame(animateBall);
  }, [gameState, ballDirection, ballSpeed]);

  // Handle ball tracking
  const handleBallClick = useCallback((event) => {
    if (gameState !== 'playing') return;

    const ball = ballRef.current;
    const gameArea = gameAreaRef.current;
    if (!ball || !gameArea) return;

    const ballRect = ball.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    const clickX = event.clientX - gameRect.left;
    const clickY = event.clientY - gameRect.top;

    const ballCenterX = ballRect.left - gameRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top - gameRect.top + ballRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(clickX - ballCenterX, 2) + Math.pow(clickY - ballCenterY, 2)
    );

    setBallTrackingAttempts(prev => prev + 1);

    if (distance <= 30) { // 30px tolerance
      setBallTrackingAccuracy(prev => {
        const newCorrect = (prev * (ballTrackingAttempts - 1) + 1) / ballTrackingAttempts;
        return newCorrect;
      });
      setScore(prev => prev + 5);
      setIsTrackingBall(true);
      setTimeout(() => setIsTrackingBall(false), 200);
    }
  }, [gameState, ballTrackingAttempts]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('completed');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [gameState, timeRemaining]);

  // Start ball animation
  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(animateBall);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, animateBall]);

  // Stroop task generation
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        if (!currentStroopTask) {
          generateStroopTask();
        }
      }, difficultySettings[difficulty].stroopInterval);

      return () => clearInterval(interval);
    }
  }, [gameState, currentStroopTask, difficulty, generateStroopTask]);

  // Game handlers
  const handleStart = () => {
    setGameState('playing');
    generateStroopTask();
  };

  const handleReset = () => {
    setGameState('ready');
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  // Custom stats for GameFramework
  const customStats = {
    ballAccuracy: Math.round(ballTrackingAccuracy * 100),
    stroopAccuracy: stroopTotal > 0 ? Math.round((stroopCorrect / stroopTotal) * 100) : 0,
    averageReactionTime,
    tasksCompleted: completedTasks,
    totalTasks,
    efficiency: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Divided Attention Test"
        gameDescription="Test your ability to track a moving ball while performing color-word Stroop tasks simultaneously"
        category="Attention & Focus"
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
                BALL ACCURACY
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.ballAccuracy}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                STROOP ACCURACY
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.stroopAccuracy}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                REACTION TIME
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {averageReactionTime}ms
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                COMPLETED
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedTasks}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                TOTAL TASKS
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalTasks}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                EFFICIENCY
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.efficiency}%
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="w-full max-w-6xl mb-6 sm:mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Ball Tracking Area */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Ball Tracking Task
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Click on the moving ball to track it accurately
                  </p>
                </div>

                <div
                  ref={gameAreaRef}
                  className="relative w-full bg-gray-50 border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
                  style={{ height: '300px', minHeight: '250px' }}
                  onClick={handleBallClick}
                >
                  {/* Moving Ball */}
                  {gameState === 'playing' && (
                    <div
                      ref={ballRef}
                      className={`absolute w-5 h-5 rounded-full transition-all duration-100 ${isTrackingBall ? 'bg-green-500 scale-125' : 'bg-blue-500'
                        }`}
                      style={{
                        left: `${ballPosition.x}%`,
                        top: `${ballPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    />
                  )}

                  {/* Game State Overlay */}
                  {gameState !== 'playing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {gameState === 'ready' ? 'Ready to Track' : 'Tracking Complete'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ball Tracking Stats */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      ATTEMPTS
                    </div>
                    <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {ballTrackingAttempts}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      ACCURACY
                    </div>
                    <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {Math.round(ballTrackingAccuracy * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Stroop Test Area */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Stroop Color Test
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Click the color of the text, not what the word says
                  </p>
                </div>

                {/* Current Stroop Task */}
                <div className="min-h-[200px] flex flex-col justify-center">
                  {currentStroopTask ? (
                    <div className="text-center mb-6">
                      <div
                        className="text-4xl sm:text-5xl font-bold mb-6"
                        style={{
                          color: colorMap[currentStroopTask.color],
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      >
                        {currentStroopTask.word}
                      </div>

                      {/* Color Response Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {stroopColors.map(color => (
                          <button
                            key={color}
                            onClick={() => handleStroopResponse(color)}
                            className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 shadow-md"
                            style={{
                              backgroundColor: colorMap[color],
                              fontFamily: 'Roboto, sans-serif'
                            }}
                          >
                            {color.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {gameState === 'ready' ? 'Ready for Stroop Test' : 'Waiting for next task...'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stroop Test Stats */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      CORRECT
                    </div>
                    <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {stroopCorrect}/{stroopTotal}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      AVG TIME
                    </div>
                    <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {averageReactionTime}ms
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Instructions */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Divided Attention Test Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your ability to perform two cognitive tasks simultaneously
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
                      Ball Tracking Task
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Track the moving blue ball with your eyes</li>
                    <li>• Click on the ball when you can accurately target it</li>
                    <li>• The ball will turn green briefly when clicked successfully</li>
                    <li>• Maintain focus while performing the Stroop test</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Stroop Color Test
                    </h4>
                  </div>
                  <ul className="text-sm text-purple-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Read the color of the text, not the word itself</li>
                    <li>• Click the button matching the text color</li>
                    <li>• Ignore what the word says - focus on the color</li>
                    <li>• Respond quickly and accurately</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test Objectives
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>
                    <strong>Divided Attention:</strong> Ability to focus on multiple tasks simultaneously
                  </div>
                  <div>
                    <strong>Cognitive Flexibility:</strong> Switching between different cognitive demands
                  </div>
                  <div>
                    <strong>Processing Speed:</strong> Quick and accurate responses under pressure
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Click the moving ball while simultaneously responding to color-word tasks
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: Maintain peripheral vision on the ball while focusing on the Stroop test for optimal performance.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default DividedAttentionGame;
