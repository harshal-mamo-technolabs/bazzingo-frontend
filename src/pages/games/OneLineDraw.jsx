import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import Header from '../../components/Header';
import { Pen, RotateCcw, Lightbulb, ChevronUp, ChevronDown, Target, Timer, Zap, Award } from 'lucide-react';

const OneLineDrawGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameDuration, setGameDuration] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Game-specific state
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [totalPuzzles, setTotalPuzzles] = useState(6);
  const [completedPuzzles, setCompletedPuzzles] = useState(0);
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

  const difficultySettings = {
    Easy: {
      timeLimit: 300, // 5 minutes
      maxHints: 5,
      puzzlesCount: 6,
      pointsPerPuzzle: 32,
      description: 'Simple shapes with 4-6 dots',
      color: 'from-green-400 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100'
    },
    Moderate: {
      timeLimit: 240, // 4 minutes
      maxHints: 3,
      puzzlesCount: 5,
      pointsPerPuzzle: 40,
      description: 'Moderate complexity with 6-8 dots',
      color: 'from-yellow-400 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100'
    },
    Hard: {
      timeLimit: 180, // 3 minutes
      maxHints: 2,
      puzzlesCount: 4,
      pointsPerPuzzle: 50,
      description: 'Complex patterns with 8-12 dots',
      color: 'from-red-400 to-rose-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-100'
    }
  };

  // Predefined puzzles for each difficulty
  const puzzleLibrary = {
    Easy: [
      // 1) Square (Eulerian circuit)
      {
        dots: [
          { id: 0, x: 100, y: 100 },
          { id: 1, x: 200, y: 100 },
          { id: 2, x: 200, y: 200 },
          { id: 3, x: 100, y: 200 }
        ],
        connections: [[0,1],[1,2],[2,3],[3,0]],
        solution: [0,1,2,3,0]
      },

      // 2) Kite (odd nodes: 1 and 2) – Euler path
      {
        dots: [
          { id: 0, x: 150, y: 80 },
          { id: 1, x: 100, y: 150 },
          { id: 2, x: 200, y: 150 },
          { id: 3, x: 150, y: 220 }
        ],
        connections: [[0,1],[0,2],[1,2],[1,3],[2,3]],
        solution: [1,0,2,3,1,2]
      },

      // 3) Hexagon + one diagonal (odd: 0 and 3) – Euler path
      {
        dots: [
          { id: 0, x: 80,  y: 120 },
          { id: 1, x: 150, y: 80  },
          { id: 2, x: 220, y: 120 },
          { id: 3, x: 220, y: 200 },
          { id: 4, x: 150, y: 240 },
          { id: 5, x: 80,  y: 200 }
        ],
        connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3]],
        solution: [0,1,2,3,0,5,4,3]
      },

      // 4) Diamond (square rotated) – Eulerian circuit
      {
        dots: [
          { id: 0, x: 150, y: 80  },
          { id: 1, x: 200, y: 150 },
          { id: 2, x: 150, y: 220 },
          { id: 3, x: 100, y: 150 }
        ],
        connections: [[0,1],[1,2],[2,3],[3,0]],
        solution: [0,1,2,3,0]
      },

      // 5) Triangle with a tail (odd: 1 and 3) – Euler path
      {
        dots: [
          { id: 0, x: 150, y: 80  }, // top
          { id: 1, x: 100, y: 180 }, // left
          { id: 2, x: 200, y: 180 }, // right
          { id: 3, x: 150, y: 240 }  // tail
        ],
        connections: [[0,1],[1,2],[2,0],[1,3]],
        solution: [3,1,2,0,1]
      },

      // 6) Pentagon ring + spoke (odd: 0 and 2) – Euler path
      {
        dots: [
          { id: 0, x: 150, y: 70  },
          { id: 1, x: 210, y: 110 },
          { id: 2, x: 190, y: 190 },
          { id: 3, x: 110, y: 190 },
          { id: 4, x: 90,  y: 110 }
        ],
        connections: [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2]],
        solution: [0,1,2,3,4,0,2]
      }
    ],

    Moderate: [
      // 1) Ladder (3 rungs) – odd: 2 and 3 – Euler path
      {
        dots: [
          { id: 0, x: 100, y: 90  },
          { id: 1, x: 200, y: 90  },
          { id: 2, x: 100, y: 150 },
          { id: 3, x: 200, y: 150 },
          { id: 4, x: 100, y: 210 },
          { id: 5, x: 200, y: 210 }
        ],
        connections: [
          [0,2],[2,4],      // left rail
          [1,3],[3,5],      // right rail
          [0,1],[2,3],[4,5] // rungs
        ],
        solution: [2,0,1,3,5,4,2,3]
      },

      // 2) Hexagon + two spokes (odd: 0 and 3) – Euler path
      {
        dots: [
          { id: 0, x: 120, y: 80  },
          { id: 1, x: 180, y: 80  },
          { id: 2, x: 220, y: 140 },
          { id: 3, x: 180, y: 200 },
          { id: 4, x: 120, y: 200 },
          { id: 5, x: 80,  y: 140 },
          { id: 6, x: 150, y: 140 }
        ],
        connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[3,6]],
        solution: [0,1,2,3,6,0,5,4,3]
      },

      // 3) Ladder + one diagonal (odd: 1 and 3) – Euler path
      {
        dots: [
          { id: 0, x: 100, y: 90  },
          { id: 1, x: 200, y: 90  },
          { id: 2, x: 100, y: 150 },
          { id: 3, x: 200, y: 150 },
          { id: 4, x: 100, y: 210 },
          { id: 5, x: 200, y: 210 }
        ],
        connections: [
          [0,2],[2,4],      // left rail
          [1,3],[3,5],      // right rail
          [0,1],[2,3],[4,5],// rungs
          [1,2]             // extra diagonal rung
        ],
        solution: [1,0,2,1,3,5,4,2,3]
      },

      // 4) Pentagon ring + two spokes to 0 (odd: 2 and 3) – Euler path
      {
        dots: [
          { id: 0, x: 150, y: 70  },
          { id: 1, x: 210, y: 110 },
          { id: 2, x: 190, y: 190 },
          { id: 3, x: 110, y: 190 },
          { id: 4, x: 90,  y: 110 }
        ],
        connections: [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[0,3]],
        solution: [2,0,1,2,3,4,0,3]
      },

      // 5) "Roof" with crossbar (odd: 3 and 4) – Euler path
      {
        dots: [
          { id: 0, x: 150, y: 60  }, // roof apex
          { id: 1, x: 100, y: 120 }, // left roof base
          { id: 2, x: 200, y: 120 }, // right roof base
          { id: 3, x: 100, y: 200 }, // left floor
          { id: 4, x: 200, y: 200 }  // right floor
        ],
        // roof edges + walls + floor + one diagonal (1-4)
        connections: [[0,1],[0,2],[1,3],[2,4],[3,4],[1,4]],
        solution: [3,1,0,2,4,3]
      }
    ],

    Hard: [
      // 1) 9-node path (odd: 0 and 8) – Euler path
      {
        dots: [
          { id: 0, x: 150, y: 50 },
          { id: 1, x: 100, y: 100 },
          { id: 2, x: 200, y: 100 },
          { id: 3, x: 80,  y: 150 },
          { id: 4, x: 150, y: 150 },
          { id: 5, x: 220, y: 150 },
          { id: 6, x: 100, y: 200 },
          { id: 7, x: 200, y: 200 },
          { id: 8, x: 150, y: 250 }
        ],
        connections: [
          [0,1],[0,2],     // top V
          [1,3],[2,5],     // sides
          [3,4],[4,5],     // middle bar
          [3,6],[4,7],[7,8]// bottom path
        ],
        solution: [0,1,3,4,5,2,0]
      },

      // 2) Octagon ring + two spokes to center (odd: 0 and 4) – Euler path
      {
        dots: [
          { id: 0, x: 150, y: 60  },
          { id: 1, x: 200, y: 90  },
          { id: 2, x: 220, y: 140 },
          { id: 3, x: 200, y: 190 },
          { id: 4, x: 150, y: 220 },
          { id: 5, x: 100, y: 190 },
          { id: 6, x: 80,  y: 140 },
          { id: 7, x: 100, y: 90  },
          { id: 8, x: 150, y: 140 }  // center
        ],
        connections: [
          [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0], // ring
          [0,8],[4,8]                                       // spokes
        ],
        solution: [0,1,2,3,4,5,6,7,0,8,4]
      },

      // 3) Cross + ring + one diagonal (odd: 1 and 3) – Euler path
      {
        dots: [
          { id: 0, x: 150, y: 60  }, // top
          { id: 1, x: 220, y: 140 }, // right
          { id: 2, x: 150, y: 220 }, // bottom
          { id: 3, x: 80,  y: 140 }, // left
          { id: 4, x: 150, y: 140 }  // center
        ],
        connections: [
          [0,1],[1,2],[2,3],[3,0],   // ring
          [0,4],[1,4],[2,4],[3,4],   // spokes to center
          [0,2]                       // one diagonal across
        ],
        solution: [1,0,3,2,1,4,0,2,4,3]
      },

      // 4) Ladder + two diagonals (odd: 0 and 5) – Euler path
      {
        dots: [
          { id: 0, x: 100, y: 90  },
          { id: 1, x: 200, y: 90  },
          { id: 2, x: 100, y: 150 },
          { id: 3, x: 200, y: 150 },
          { id: 4, x: 100, y: 210 },
          { id: 5, x: 200, y: 210 }
        ],
        connections: [
          [0,2],[2,4],      // left rail
          [1,3],[3,5],      // right rail
          [0,1],[2,3],[4,5],// rungs
          [0,3],[2,5]       // diagonals
        ],
        solution: [0,1,3,5,4,2,0,3,2,5]
      }
    ]
  };

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

  const animateScore = (gain) => {
    setLastScoreGain(gain);
    setScoreAnimation(1);
    setTimeout(() => setScoreAnimation(0), 1000);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const puzzles = puzzleLibrary[difficulty] || puzzleLibrary.Easy;
    
    setTotalPuzzles(settings.puzzlesCount);
    setCompletedPuzzles(0);
    setPuzzleIndex(0);
    setCurrentPuzzle(puzzles[0]);
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
  }, [difficulty]);

  // Load next puzzle
  const loadNextPuzzle = useCallback(() => {
    const puzzles = puzzleLibrary[difficulty] || puzzleLibrary.Easy;
    const nextIndex = (puzzleIndex + 1) % puzzles.length;
    setPuzzleIndex(nextIndex);
    setCurrentPuzzle(puzzles[nextIndex]);
    setCurrentPath([]);
    setIsDrawing(false);
    setVisitedDots(new Set());
    setDrawnLines(new Set());
  }, [difficulty, puzzleIndex]);

  // Check if two dots are connected
  const areDotsConnected = (dot1Id, dot2Id) => {
    if (!currentPuzzle) return false;
    return currentPuzzle.connections.some(([a, b]) => 
      (a === dot1Id && b === dot2Id) || (a === dot2Id && b === dot1Id)
    );
  };

  // Handle dot click/touch
  const handleDotClick = (dotId) => {
    if (gameState !== 'playing') return;

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
          // Line already drawn - invalid move
          setWrongAttempts(prev => prev + 1);
          setConsecutiveCorrect(0);
          createParticles('error', 8);
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
          // Puzzle completed!
          setCompletedPuzzles(prev => prev + 1);
          setConsecutiveCorrect(prev => {
            const newStreak = prev + 1;
            setBestStreak(current => Math.max(current, newStreak));
            return newStreak;
          });

          createParticles('success', 25);

          // Load next puzzle or finish game
          setTimeout(() => {
            if (completedPuzzles + 1 >= totalPuzzles) {
              // Game completed
              const endTime = Date.now();
              const duration = Math.floor((endTime - gameStartTime) / 1000);
              setGameDuration(duration);
              setFinalScore(calculateScore(completedPuzzles + 1));
              setGameState('finished');
              setShowCompletionModal(true);
            } else {
              loadNextPuzzle();
            }
          }, 1000);
        }
      } else {
        // Invalid connection
        setWrongAttempts(prev => prev + 1);
        setConsecutiveCorrect(0);
        createParticles('error', 8);
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

  // Get hint - show next move in solution
  const getHint = () => {
    if (hintsUsed >= difficultySettings[difficulty].maxHints || !currentPuzzle) return;

    const solution = currentPuzzle.solution;
    const nextMoveIndex = currentPath.length;
    
    if (nextMoveIndex < solution.length) {
      const nextDot = solution[nextMoveIndex];
      
      // Highlight the next dot temporarily
      const dotElement = document.querySelector(`[data-dot-id="${nextDot}"]`);
      if (dotElement) {
        dotElement.style.animation = 'pulse 1s ease-in-out 3';
      }

      setHintsUsed(prev => prev + 1);
      createParticles('warning', 10);
    }
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
    hintsUsed,
    maxHints: difficultySettings[difficulty].maxHints,
    wrongAttempts,
    consecutiveCorrect,
    bestStreak
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      <Header unreadCount={3}/>
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
        gameDescription={
          <div className="mx-auto px-2 sm:px-4 lg:px-0 mb-0">
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
                    Connect all dots using a single continuous line without lifting your finger or retracing paths.
                  </p>
                </div>

                <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm'>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">✏️ How to Play</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1">
                    <li>• Click a dot to start drawing</li>
                    <li>• Click connected dots to continue</li>
                    <li>• Visit all dots without retracing</li>
                  </ul>
                </div>

                <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm'>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">📊 Scoring</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1">
                    <li>• <strong>Easy:</strong> 32 points per puzzle</li>
                    <li>• <strong>Moderate:</strong> 40 points per puzzle</li>
                    <li>• <strong>Hard:</strong> 50 points per puzzle</li>
                  </ul>
                </div>

                <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm'>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">🎚️ Difficulty</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1">
                    <li>• <strong>Easy:</strong> 6 puzzles (192 max)</li>
                    <li>• <strong>Moderate:</strong> 5 puzzles (200 max)</li>
                    <li>• <strong>Hard:</strong> 4 puzzles (200 max)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Logic + Spatial"
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
                  <span className="text-2xl sm:text-4xl font-extrabold tracking-tight">{completedPuzzles}</span>
                  <span className="text-lg sm:text-xl font-medium opacity-75">/</span>
                  <span className="text-xl sm:text-2xl font-bold opacity-90">{totalPuzzles}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 mb-2 sm:mb-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${(completedPuzzles / totalPuzzles) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-xs sm:text-sm opacity-90 font-medium">
                  {!isDrawing && completedPuzzles === 0 ? 
                    '🎯 Click a dot to start drawing' : 
                    isDrawing ? 
                      `✏️ Drawing... (${currentPath.length} dots connected)` : 
                      `🎉 Puzzle ${completedPuzzles} completed!`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full max-w-md">
            <button
              onClick={resetPuzzle}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-1 sm:gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base flex-1 sm:flex-none justify-center"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              Reset Puzzle
            </button>
            
        {/* <button
              onClick={getHint}
              disabled={hintsUsed >= difficultySettings[difficulty].maxHints}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1 sm:gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 text-sm sm:text-base flex-1 sm:flex-none justify-center"
            >
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Hint </span>({hintsUsed}/{difficultySettings[difficulty].maxHints})
            </button> */}
          </div>

          {/* Drawing Canvas */}
          {currentPuzzle && (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-3xl p-2 sm:p-4 lg:p-8 shadow-2xl border border-slate-200/50 backdrop-blur-sm w-full max-w-sm sm:max-w-md lg:max-w-lg">
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

          {/* Game Stats 
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full max-w-4xl">
            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-2 sm:p-4 shadow-md border border-purple-200">
              <div className="text-xs sm:text-sm text-purple-600 font-medium">Streak</div>
              <div className="text-lg sm:text-xl font-bold text-purple-700">
                {consecutiveCorrect}
              </div>
              <div className="text-xs text-purple-500">
                Best: {bestStreak}
              </div>
            </div>
            
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2 sm:p-4 shadow-md border border-blue-200">
              <div className="text-xs sm:text-sm text-blue-600 font-medium">Points Per Puzzle</div>
              <div className="text-lg sm:text-xl font-bold text-blue-700">
                {difficultySettings[difficulty].pointsPerPuzzle}
              </div>
            </div>
            
            <div className="text-center bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-2 sm:p-4 shadow-md border border-red-200">
              <div className="text-xs sm:text-sm text-red-600 font-medium">Wrong Moves</div>
              <div className="text-lg sm:text-xl font-bold text-red-700">{wrongAttempts}</div>
            </div>
            
            <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-2 sm:p-4 shadow-md border border-yellow-200">
              <div className="text-xs sm:text-sm text-yellow-600 font-medium">Hints Left</div>
              <div className="text-lg sm:text-xl font-bold text-yellow-700">
                {difficultySettings[difficulty].maxHints - hintsUsed}
              </div>
            </div>
          </div> */}
        </div>
      </GameFramework>

      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
      />

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) scale(0) rotate(360deg); opacity: 0; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default OneLineDrawGame;