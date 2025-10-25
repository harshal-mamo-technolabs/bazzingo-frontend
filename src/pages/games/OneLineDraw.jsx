import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import Header from '../../components/Header';
import { difficultySettings, puzzleLibrary, blobStyles, shuffleArray } from '../../utils/games/OneLineDraw';
import { Pen, RotateCcw, Lightbulb, ChevronUp, ChevronDown, Target, Timer, Zap, Award } from 'lucide-react';

const OneLineDrawGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameDuration, setGameDuration] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Game-specific state
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [shuffledPuzzles, setShuffledPuzzles] = useState([]);
  const [totalPuzzles, setTotalPuzzles] = useState(6);
  const [completedPuzzles, setCompletedPuzzles] = useState(0);
  const [skippedPuzzles, setSkippedPuzzles] = useState(0);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [visitedDots, setVisitedDots] = useState(new Set());
  const [drawnLines, setDrawnLines] = useState(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [particles, setParticles] = useState([]);
  const [lastScoreGain, setLastScoreGain] = useState(0);
  const [scoreAnimation, setScoreAnimation] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  // Particle system for visual feedback
  const createParticles = (type, count = 15) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10
        },
        life: 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  // Initialize game with shuffled puzzles
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const puzzles = puzzleLibrary[difficulty] || puzzleLibrary.Easy;
    
    // Shuffle puzzles to prevent repetition
    const shuffled = shuffleArray(puzzles);
    setShuffledPuzzles(shuffled);
    
    setTotalPuzzles(settings.puzzlesCount);
    setCompletedPuzzles(0);
    setSkippedPuzzles(0);
    setPuzzleIndex(0);
    setCurrentPuzzle(shuffled[0]);
    setCurrentPath([]);
    setIsDrawing(false);
    setVisitedDots(new Set());
    setDrawnLines(new Set());
    setHintsUsed(0);
    setWrongAttempts(0);
    setConsecutiveCorrect(0);
    setBestStreak(0);
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setParticles([]);
    setGameDuration(0);
    setGameStarted(false);
    setIsSkipping(false);
  }, [difficulty]);

  // Load next puzzle
  const loadNextPuzzle = useCallback(() => {
    const nextIndex = puzzleIndex + 1;
    
    if (nextIndex >= shuffledPuzzles.length) {
      // If we've used all puzzles, reshuffle them
      const puzzles = puzzleLibrary[difficulty] || puzzleLibrary.Easy;
      const newShuffled = shuffleArray(puzzles);
      setShuffledPuzzles(newShuffled);
      setPuzzleIndex(0);
      setCurrentPuzzle(newShuffled[0]);
    } else {
      setPuzzleIndex(nextIndex);
      setCurrentPuzzle(shuffledPuzzles[nextIndex]);
    }
    
    setCurrentPath([]);
    setIsDrawing(false);
    setVisitedDots(new Set());
    setDrawnLines(new Set());
    setIsSkipping(false);
  }, [difficulty, puzzleIndex, shuffledPuzzles]);

  // Skip current puzzle due to wrong attempt
  const skipCurrentPuzzle = useCallback(() => {
    setIsSkipping(true);
    setSkippedPuzzles(prev => prev + 1);
    
    setTimeout(() => {
      const totalProcessed = completedPuzzles + skippedPuzzles + 1;
      
      if (totalProcessed >= totalPuzzles) {
        // Game completed
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        setFinalScore(calculateScore(completedPuzzles));
        setGameState('finished');
        setShowCompletionModal(true);
      } else {
        loadNextPuzzle();
      }
    }, 1500);
  }, [completedPuzzles, skippedPuzzles, totalPuzzles, gameStartTime, loadNextPuzzle]);

  // Check if two dots are connected
  const areDotsConnected = (dot1Id, dot2Id) => {
    if (!currentPuzzle) return false;
    return currentPuzzle.connections.some(([a, b]) => 
      (a === dot1Id && b === dot2Id) || (a === dot2Id && b === dot1Id)
    );
  };

  // Handle dot click/touch
  const handleDotClick = (dotId) => {
    if (gameState !== 'playing' || isSkipping) return;

    if (!isDrawing) {
      // Start drawing from this dot
      setIsDrawing(true);
      setCurrentPath([dotId]);
      setVisitedDots(new Set([dotId]));
      setDrawnLines(new Set());
    } else {
      // Continue drawing to this dot
      const lastDot = currentPath[currentPath.length - 1];
      
      if (lastDot === dotId) {
        // Clicked same dot - do nothing
        return;
      }

      if (areDotsConnected(lastDot, dotId)) {
        const lineKey = `${Math.min(lastDot, dotId)}-${Math.max(lastDot, dotId)}`;
        
        if (drawnLines.has(lineKey)) {
          // Line already drawn - invalid move, skip puzzle
          setWrongAttempts(prev => prev + 1);
          setConsecutiveCorrect(0);
          createParticles('error', 8);
          skipCurrentPuzzle();
          return;
        }

        // Valid move
        const newPath = [...currentPath, dotId];
        const newVisitedDots = new Set([...visitedDots, dotId]);
        const newDrawnLines = new Set([...drawnLines, lineKey]);

        setCurrentPath(newPath);
        setVisitedDots(newVisitedDots);
        setDrawnLines(newDrawnLines);

        // Check if puzzle is solved
        if (newVisitedDots.size === currentPuzzle.dots.length && 
            newDrawnLines.size === currentPuzzle.connections.length) {
          // Puzzle completed successfully!
          const newCompletedCount = completedPuzzles + 1;
          setCompletedPuzzles(newCompletedCount);
          setConsecutiveCorrect(prev => {
            const newStreak = prev + 1;
            setBestStreak(current => Math.max(current, newStreak));
            return newStreak;
          });

          createParticles('success', 25);

          // Load next puzzle or finish game
          setTimeout(() => {
            const totalProcessed = newCompletedCount + skippedPuzzles;
            
            if (totalProcessed >= totalPuzzles) {
              // Game completed
              const endTime = Date.now();
              const duration = Math.floor((endTime - gameStartTime) / 1000);
              setGameDuration(duration);
              setFinalScore(calculateScore(newCompletedCount));
              setGameState('finished');
              setShowCompletionModal(true);
            } else {
              loadNextPuzzle();
            }
          }, 1000);
        }
      } else {
        // Invalid connection - skip puzzle
        setWrongAttempts(prev => prev + 1);
        setConsecutiveCorrect(0);
        createParticles('error', 8);
        skipCurrentPuzzle();
      }
    }
  };

  // Reset current puzzle
  const resetPuzzle = () => {
    setCurrentPath([]);
    setIsDrawing(false);
    setVisitedDots(new Set());
    setDrawnLines(new Set());
  };

  // Simple scoring calculation - just multiply completed puzzles by points per puzzle
  const calculateScore = useCallback((puzzlesCompleted = completedPuzzles) => {
    if (!gameStarted && puzzlesCompleted === 0) {
      return 0;
    }

    const settings = difficultySettings[difficulty];
    return puzzlesCompleted * settings.pointsPerPuzzle;
  }, [completedPuzzles, difficulty, gameStarted]);

  // Update score
  useEffect(() => {
    if (gameState === 'playing') {
      setScore(calculateScore());
    }
  }, [calculateScore, gameState]);

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            const endTime = Date.now();
            const duration = Math.floor((endTime - gameStartTime) / 1000);
            setGameDuration(duration);
            setFinalScore(calculateScore());
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, gameStartTime, calculateScore]);

  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
    setGameStarted(true);
  };

  const handleReset = () => {
    initializeGame();
    setShowCompletionModal(false);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') {
      setDifficulty(newDifficulty);
    }
  };

  const customStats = {
    completedPuzzles,
    totalPuzzles,
    skippedPuzzles,
    hintsUsed,
    maxHints: difficultySettings[difficulty].maxHints,
    wrongAttempts,
    consecutiveCorrect,
    bestStreak
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {gameState === 'ready' && <Header unreadCount={3}/>}
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-3 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-pulse"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Particle System */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                borderRadius: '50%',
                opacity: particle.life,
                transform: `translate(${particle.velocity.x * 20}px, ${particle.velocity.y * 20}px)`,
                animation: 'float 2s ease-out forwards'
              }}
            />
          ))}
        </div>
      )}

      <GameFramework
        gameTitle="✏️ One Line Draw"
        gameShortDescription="Draw continuous lines without lifting your finger. Challenge your spatial reasoning and planning skills!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
            <div className="bg-[#E8E8E8] rounded-lg p-3 sm:p-4 lg:p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-base sm:text-lg font-semibold text-blue-900">
                  How to Play One Line Draw
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions ? <ChevronUp className="h-5 w-5 text-blue-900" /> : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 ${showInstructions ? '' : 'hidden'}`}>
                <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm'>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">🎯 Objective</h4>
                  <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                    Connect all dots using a single continuous line without retracing paths.
                  </p>
                </div>

                <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm'>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">✏️ How to Play</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1">
                    <li>• Click a dot to start drawing</li>
                    <li>• Click connected dots to continue</li>
                    <li>• Wrong pattern skips puzzle</li>
                  </ul>
                </div>

                <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm'>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">📊 Scoring</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1">
                    <li>• <strong>Easy:</strong> 25 points per puzzle</li>
                    <li>• <strong>Moderate:</strong> 40 points per puzzle</li>
                    <li>• <strong>Hard:</strong> 50 points per puzzle</li>
                  </ul>
                </div>

                <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm'>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">🎚️ Difficulty</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1">
                    <li>• <strong>Easy:</strong> 8 puzzles (200 max)</li>
                    <li>• <strong>Moderate:</strong> 5 puzzles (200 max)</li>
                    <li>• <strong>Hard:</strong> 4 puzzles (200 max)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Logic"
        gameState={gameState}
        setGameState={setGameState}
        score={gameState === 'finished' ? finalScore : score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={handleDifficultyChange}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        {/* Game Content */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 px-2 sm:px-4">
          {/* Score Animation */}
          {scoreAnimation > 0 && lastScoreGain !== 0 && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-xl sm:text-2xl font-bold animate-bounce z-10" 
                 style={{ color: lastScoreGain > 0 ? '#10B981' : '#EF4444' }}>
              {lastScoreGain > 0 ? '+' : ''}{lastScoreGain}
            </div>
          )}

          {/* Enhanced Progress Display */}
          <div className="w-full max-w-sm sm:max-w-md">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 sm:p-6 rounded-2xl shadow-xl text-center relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-6 -right-6 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-full">
                    <Target className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold">Puzzle Progress</h3>
                </div>
                
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                  <span className="text-2xl sm:text-4xl font-extrabold tracking-tight">{completedPuzzles + skippedPuzzles}</span>
                  <span className="text-lg sm:text-xl font-medium opacity-75">/</span>
                  <span className="text-xl sm:text-2xl font-bold opacity-90">{totalPuzzles}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 mb-2 sm:mb-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${((completedPuzzles + skippedPuzzles) / totalPuzzles) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-xs sm:text-sm opacity-90 font-medium">
                  {isSkipping ? '⏭️ Skipping puzzle...' :
                   !isDrawing && completedPuzzles === 0 && skippedPuzzles === 0 ? 
                    '🎯 Click a dot to start drawing' : 
                    isDrawing ? 
                      `✏️ Drawing... (${currentPath.length} dots connected)` : 
                      `✅ Completed: ${completedPuzzles}, Skipped: ${skippedPuzzles}`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full max-w-md">
            <button
              onClick={resetPuzzle}
              disabled={isSkipping}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-1 sm:gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base flex-1 sm:flex-none justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              Reset Puzzle
            </button>
          </div>
          
          {/* Drawing Canvas */}
          {currentPuzzle && (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl p-2 sm:p-4 lg:p-8 shadow-2xl border border-slate-200/50 backdrop-blur-sm w-full max-w-sm sm:max-w-md lg:max-w-lg">
              {isSkipping && (
                <div className="absolute inset-0 bg-yellow-200/80 rounded-2xl sm:rounded-3xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏭️</div>
                    <div className="text-lg font-semibold text-gray-800">Skipping Puzzle...</div>
                  </div>
                </div>
              )}
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 300 300"
                className="border border-gray-200 rounded-lg bg-white w-full h-auto aspect-square max-w-[280px] sm:max-w-[320px] lg:max-w-[400px] mx-auto"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Draw connections (available paths) */}
                {currentPuzzle.connections.map(([dot1Id, dot2Id], index) => {
                  const dot1 = currentPuzzle.dots.find(d => d.id === dot1Id);
                  const dot2 = currentPuzzle.dots.find(d => d.id === dot2Id);
                  const lineKey = `${Math.min(dot1Id, dot2Id)}-${Math.max(dot1Id, dot2Id)}`;
                  const isDrawn = drawnLines.has(lineKey);
                  
                  return (
                    <line
                      key={index}
                      x1={dot1.x}
                      y1={dot1.y}
                      x2={dot2.x}
                      y2={dot2.y}
                      stroke={isDrawn ? "#3B82F6" : "#E5E7EB"}
                      strokeWidth={isDrawn ? "4" : "2"}
                      strokeDasharray={isDrawn ? "none" : "5,5"}
                      opacity={isDrawn ? "1" : "0.6"}
                    />
                  );
                })}
                {/* Draw path lines */}
                {currentPath.length > 1 && currentPath.map((dotId, index) => {
                  if (index === 0) return null;
                  const prevDot = currentPuzzle.dots.find(d => d.id === currentPath[index - 1]);
                  const currentDot = currentPuzzle.dots.find(d => d.id === dotId);
                  
                  return (
                    <line
                      key={`path-${index}`}
                      x1={prevDot.x}
                      y1={prevDot.y}
                      x2={currentDot.x}
                      y2={currentDot.y}
                      stroke="#10B981"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="drop-shadow-sm"
                    />
                  );
                })}
                {/* Draw dots */}
                {currentPuzzle.dots.map((dot) => {
                  const isVisited = visitedDots.has(dot.id);
                  const isStart = currentPath.length > 0 && currentPath[0] === dot.id;
                  const isCurrent = currentPath.length > 0 && currentPath[currentPath.length - 1] === dot.id;
                  
                  return (
                    <g key={dot.id}>
                      {/* Dot glow effect for current */}
                      {isCurrent && (
                        <circle
                          cx={dot.x}
                          cy={dot.y}
                          r="18"
                          fill="#3B82F6"
                          opacity="0.3"
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Main dot */}
                      <circle
                        data-dot-id={dot.id}
                        cx={dot.x}
                        cy={dot.y}
                        r={isVisited ? "14" : "12"}
                        fill={
                          isCurrent ? "#3B82F6" :
                          isStart ? "#10B981" :
                          isVisited ? "#6B7280" : "#F8FAFC"
                        }
                        stroke={
                          isCurrent ? "#1E40AF" :
                          isStart ? "#059669" :
                          isVisited ? "#374151" : "#CBD5E1"
                        }
                        strokeWidth="3"
                        className="cursor-pointer hover:r-16 transition-all duration-200 filter drop-shadow-md hover:drop-shadow-lg"
                        onClick={() => handleDotClick(dot.id)}
                      />
                      
                      {/* Dot number */}
                      <text
                        x={dot.x}
                        y={dot.y + 5}
                        textAnchor="middle"
                        className="text-sm font-bold pointer-events-none select-none"
                        fill={isVisited ? "white" : "#64748B"}
                      >
                        {dot.id + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </GameFramework>
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
      />
      <style jsx>{blobStyles}</style>
    </div>
  );
};

export default OneLineDrawGame;