import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Eye, Lightbulb, CheckCircle, XCircle, Lock, Unlock, Search, ChevronUp, ChevronDown, Shield, Key, MapPin, AlertTriangle, Clock } from 'lucide-react';

const EscapeGridGame = () => {
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
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState(0);
  const [currentLevels, setCurrentLevels] = useState([]);

  // Game state
  const [playerPosition, setPlayerPosition] = useState({ row: 0, col: 0 });
  const [guardPositions, setGuardPositions] = useState([]);
  const [showGuardPatterns, setShowGuardPatterns] = useState(false);
  const [patternMemoryTime, setPatternMemoryTime] = useState(0);
  const [unlockedCells, setUnlockedCells] = useState([]);
  const [collectedItems, setCollectedItems] = useState([]);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gamePhase, setGamePhase] = useState('memory'); // 'memory', 'playing', 'puzzle'
  const [guardMovementIntervals, setGuardMovementIntervals] = useState([]);

  // Fix for guard movement tracking - use useRef to persist across re-renders
  const guardPatternIndices = useRef([]);

  // Cell types and emojis
  const cellTypes = {
    empty: '⬜',
    player: '🚶',
    guard: '👮',
    gate: '🚪',
    codeLock: '🔐',
    exit: '🏃‍♂️',
    clue: '📄',
    keycard: '🔑',
    wall: '⬛',
    alarm: '🚨'
  };

  // All levels data for different difficulties
  const allLevels = {
    Easy: [
      {
        id: 1,
        name: "Cell Block A",
        description: "Your first escape attempt. Learn the basics of avoiding guards and solving simple puzzles.",
        gridSize: 4,
        grid: [
          ['empty', 'wall', 'clue', 'exit'],
          ['empty', 'guard', 'empty', 'wall'],
          ['empty', 'empty', 'gate', 'empty'],
          ['player', 'keycard', 'empty', 'empty']
        ],
        guardPatterns: [
          { id: 'guard1', positions: [{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 2 }, { row: 2, col: 1 }], speed: 2000 }
        ],
        puzzles: [
          {
            type: 'pattern',
            trigger: { row: 2, col: 2 },
            question: "Match the sequence to unlock the gate:",
            pattern: ['🟥', '🟩', '🟦'],
            options: [
              ['🟥', '🟩', '🟦'],
              ['🟦', '🟥', '🟩'],
              ['🟩', '🟦', '🟥']
            ],
            correctAnswer: 0,
            hint: "Red comes first in the sequence!"
          }
        ],
        requiredItems: ['keycard'],
        memoryTime: 5000
      },
      {
        id: 2,
        name: "Security Wing",
        description: "Navigate through a more complex security system with multiple guards.",
        gridSize: 4,
        grid: [
          ['wall', 'clue', 'empty', 'exit'],
          ['empty', 'wall', 'guard', 'empty'],
          ['guard', 'empty', 'codeLock', 'empty'],
          ['player', 'empty', 'keycard', 'wall']
        ],
        guardPatterns: [
          { id: 'guard1', positions: [{ row: 1, col: 2 }, { row: 1, col: 3 }, { row: 2, col: 3 }], speed: 1800 },
          { id: 'guard2', positions: [{ row: 2, col: 0 }, { row: 3, col: 0 }, { row: 3, col: 1 }], speed: 2200 }
        ],
        puzzles: [
          {
            type: 'logic',
            trigger: { row: 2, col: 2 },
            question: "Only one guard tells the truth. Guard A says 'The code is 123'. Guard B says 'The code is not 123'. What's the code?",
            options: ['123', '321', '132', '231'],
            correctAnswer: 0,
            hint: "If only one tells the truth, and they contradict each other, who's right?"
          }
        ],
        requiredItems: ['keycard'],
        memoryTime: 4000
      },
      {
        id: 3,
        name: "Main Corridor",
        description: "The final stretch! Avoid alarms and make your way to freedom.",
        gridSize: 5,
        grid: [
          ['wall', 'wall', 'exit', 'wall', 'wall'],
          ['empty', 'empty', 'gate', 'empty', 'empty'],
          ['guard', 'empty', 'empty', 'empty', 'alarm'],
          ['empty', 'clue', 'codeLock', 'empty', 'empty'],
          ['player', 'empty', 'keycard', 'empty', 'wall']
        ],
        guardPatterns: [
          { id: 'guard1', positions: [{ row: 2, col: 0 }, { row: 2, col: 1 }, { row: 3, col: 1 }, { row: 3, col: 0 }], speed: 1500 }
        ],
        puzzles: [
          {
            type: 'sequence',
            trigger: { row: 3, col: 2 },
            question: "Enter the 4-digit escape code. Clue: 'Year of first computer: 1946'",
            answer: "1946",
            hint: "The first electronic computer was built in 1946!"
          }
        ],
        requiredItems: ['keycard'],
        memoryTime: 3000
      }
    ],
    Moderate: [
      {
        id: 4,
        name: "High Security Block",
        description: "Advanced security measures require careful timing and multiple puzzle solutions.",
        gridSize: 5,
        grid: [
          ['wall', 'clue', 'empty', 'codeLock', 'exit'],
          ['empty', 'wall', 'guard', 'empty', 'wall'],
          ['guard', 'empty', 'empty', 'gate', 'empty'],
          ['empty', 'keycard', 'empty', 'guard', 'alarm'],
          ['player', 'wall', 'empty', 'empty', 'empty']
        ],
        guardPatterns: [
          { id: 'guard1', positions: [{ row: 1, col: 2 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 }], speed: 1400 },
          { id: 'guard2', positions: [{ row: 2, col: 0 }, { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 2, col: 1 }], speed: 1600 },
          { id: 'guard3', positions: [{ row: 3, col: 3 }, { row: 4, col: 3 }, { row: 4, col: 2 }], speed: 1200 }
        ],
        puzzles: [
          {
            type: 'logic',
            trigger: { row: 0, col: 3 },
            question: "Three switches control the gate. Red switch is fake. Blue is real if Green is fake. Green works only if Red works. Which switch opens the gate?",
            options: ['Red', 'Blue', 'Green', 'None'],
            correctAnswer: 1,
            hint: "Work backwards from what you know is true!"
          }
        ],
        requiredItems: ['keycard'],
        memoryTime: 3000
      },
      {
        id: 5,
        name: "Solitary Confinement",
        description: "Escape from maximum security with limited visibility and complex patterns.",
        gridSize: 5,
        grid: [
          ['empty', 'wall', 'wall', 'wall', 'exit'],
          ['empty', 'empty', 'clue', 'empty', 'empty'],
          ['guard', 'codeLock', 'empty', 'gate', 'guard'],
          ['empty', 'empty', 'keycard', 'empty', 'alarm'],
          ['player', 'empty', 'empty', 'empty', 'wall']
        ],
        guardPatterns: [
          { id: 'guard1', positions: [{ row: 2, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }], speed: 1300 },
          { id: 'guard2', positions: [{ row: 2, col: 4 }, { row: 3, col: 4 }, { row: 3, col: 3 }, { row: 2, col: 3 }], speed: 1500 }
        ],
        puzzles: [
          {
            type: 'sequence',
            trigger: { row: 2, col: 1 },
            question: "Enter the prisoner ID code. Clue: 'Your cell number times the guard count'",
            answer: "85", // assuming cell 5 * 2 guards, simplified for demo
            hint: "Look at your starting position and count the guards!"
          }
        ],
        requiredItems: ['keycard'],
        memoryTime: 2500
      }
    ],
    Hard: [
      {
        id: 6,
        name: "Maximum Security",
        description: "The ultimate challenge with multiple puzzle types and complex guard patterns.",
        gridSize: 6,
        grid: [
          ['wall', 'wall', 'clue', 'codeLock', 'empty', 'exit'],
          ['empty', 'empty', 'empty', 'empty', 'gate', 'empty'],
          ['guard', 'empty', 'alarm', 'empty', 'empty', 'guard'],
          ['empty', 'keycard', 'empty', 'codeLock', 'empty', 'empty'],
          ['guard', 'empty', 'empty', 'empty', 'clue', 'empty'],
          ['player', 'empty', 'wall', 'wall', 'empty', 'alarm']
        ],
        guardPatterns: [
          { id: 'guard1', positions: [{ row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 4, col: 1 }], speed: 1000 },
          { id: 'guard2', positions: [{ row: 2, col: 5 }, { row: 1, col: 5 }, { row: 1, col: 4 }, { row: 2, col: 4 }], speed: 1100 },
          { id: 'guard3', positions: [{ row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 3, col: 2 }], speed: 900 }
        ],
        puzzles: [
          {
            type: 'logic',
            trigger: { row: 0, col: 3 },
            question: "Master puzzle: If the red door is real, the blue is fake. If blue is real, green is fake. Green is real only if red is fake. Only one door leads to freedom.",
            options: ['Red Door', 'Blue Door', 'Green Door', 'All are fake'],
            correctAnswer: 2,
            hint: "Use logical contradiction to eliminate impossible options!"
          },
          {
            type: 'sequence',
            trigger: { row: 3, col: 3 },
            question: "Enter master override code. Clue: 'Sum of all guard speeds divided by 100'",
            answer: "30", // (1000+1100+900)/100 = 30
            hint: "Add up all the guard patrol speeds and divide!"
          }
        ],
        requiredItems: ['keycard'],
        memoryTime: 2000
      },
      {
        id: 7,
        name: "Warden's Core",
        description: "You're almost out — but the AI watches everything.",
        gridSize: 6,
        grid: [
          ['player', 'clue', 'codeLock', 'wall', 'empty', 'exit'],
          ['guard', 'empty', 'empty', 'empty', 'gate', 'wall'],
          ['empty', 'guard', 'empty', 'alarm', 'clue', 'empty'],
          ['wall', 'wall', 'keycard', 'empty', 'guard', 'wall'],
          ['empty', 'empty', 'guard', 'empty', 'empty', 'alarm'],
          ['wall', 'wall', 'empty', 'empty', 'wall', 'empty']
        ],
        guardPatterns: [
          { id: 'guard1', positions: [{ row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }], speed: 800 },
          { id: 'guard2', positions: [{ row: 2, col: 1 }, { row: 3, col: 2 }, { row: 4, col: 2 }], speed: 700 },
          { id: 'guard3', positions: [{ row: 3, col: 4 }, { row: 4, col: 4 }, { row: 4, col: 3 }], speed: 900 },
          { id: 'guard4', positions: [{ row: 4, col: 2 }, { row: 3, col: 2 }, { row: 2, col: 2 }], speed: 600 }
        ],
        puzzles: [
          {
            type: 'pattern',
            trigger: { row: 0, col: 2 },
            question: "AI Security Pattern Recognition:",
            pattern: ['🔴', '🟡', '🟢', '🔵'],
            options: [
              ['🔴', '🟡', '🟢', '🔵'],
              ['🔵', '🟢', '🟡', '🔴'],
              ['🟡', '🔴', '🔵', '🟢']
            ],
            correctAnswer: 0,
            hint: "Follow the rainbow sequence!"
          }
        ],
        requiredItems: ['keycard'],
        memoryTime: 1500
      },
      {
        id: 8,
        name: "Final Breach",
        description: "Every move matters. The final memory trap.",
        gridSize: 6,
        grid: [
          ['exit', 'alarm', 'wall', 'clue', 'guard', 'wall'],
          ['empty', 'codeLock', 'empty', 'empty', 'guard', 'empty'],
          ['player', 'empty', 'guard', 'empty', 'gate', 'keycard'],
          ['wall', 'empty', 'alarm', 'guard', 'wall', 'clue'],
          ['empty', 'guard', 'empty', 'wall', 'empty', 'wall'],
          ['wall', 'empty', 'wall', 'empty', 'wall', 'empty']
        ],
        guardPatterns: [
          { id: 'guard1', positions: [{ row: 0, col: 4 }, { row: 1, col: 4 }, { row: 2, col: 4 }], speed: 500 },
          { id: 'guard2', positions: [{ row: 1, col: 4 }, { row: 2, col: 2 }, { row: 3, col: 3 }], speed: 600 },
          { id: 'guard3', positions: [{ row: 2, col: 2 }, { row: 3, col: 3 }, { row: 4, col: 1 }], speed: 700 },
          { id: 'guard4', positions: [{ row: 4, col: 1 }, { row: 3, col: 1 }, { row: 2, col: 1 }], speed: 800 },
          { id: 'guard5', positions: [{ row: 3, col: 3 }, { row: 4, col: 2 }, { row: 3, col: 2 }], speed: 900 }
        ],
        puzzles: [
          {
            type: 'logic',
            trigger: { row: 1, col: 1 },
            question: "Final Logic Gate: If A OR B is true, and B AND C is false, and C is true, what is A?",
            options: ['True', 'False', 'Unknown', 'Invalid'],
            correctAnswer: 0,
            hint: "Work through the logic step by step!"
          }
        ],
        requiredItems: ['keycard'],
        memoryTime: 1000
      }
    ]
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 300, lives: 5, hints: 3, levelCount: 8, pointsPerPuzzle: 25 },
    Moderate: { timeLimit: 240, lives: 4, hints: 2, levelCount: 5, pointsPerPuzzle: 40 },
    Hard: { timeLimit: 180, lives: 3, hints: 1, levelCount: 4, pointsPerPuzzle: 50 }
  };

  // Track puzzles solved
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);

  // Calculate score
  const calculateScore = useCallback(() => {
    const settings = difficultySettings[difficulty];
    return puzzlesSolved * settings.pointsPerPuzzle;
  }, [puzzlesSolved, difficulty]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Clean up guard movement intervals
  const cleanupGuardMovement = useCallback(() => {
    guardMovementIntervals.forEach(interval => clearInterval(interval));
    setGuardMovementIntervals([]);
  }, [guardMovementIntervals]);

  // Guard movement animation - FIXED
  useEffect(() => {
    if (gameState !== 'playing' || gamePhase !== 'playing' || !currentLevels[currentLevel]) {
      cleanupGuardMovement();
      return;
    }

    const currentLevelData = currentLevels[currentLevel];
    if (!currentLevelData.guardPatterns || currentLevelData.guardPatterns.length === 0) return;

    // Clean up existing intervals
    cleanupGuardMovement();

    // Initialize pattern indices for each guard
    guardPatternIndices.current = currentLevelData.guardPatterns.map(() => 0);

    const intervals = currentLevelData.guardPatterns.map((guard, guardIndex) => {
      if (!guard || !guard.positions || guard.positions.length === 0) {
        return null;
      }
      
      return setInterval(() => {
        setGuardPositions(prev => {
          const newPositions = [...prev];
          
          // Ensure we have valid guard and positions
          if (guard && guard.positions && guard.positions.length > 0) {
            const currentIndex = guardPatternIndices.current[guardIndex] || 0;
            newPositions[guardIndex] = guard.positions[currentIndex];
            guardPatternIndices.current[guardIndex] = (currentIndex + 1) % guard.positions.length;
          }
          
          return newPositions;
        });
      }, guard.speed || 1000);
    }).filter(interval => interval !== null); // Remove null intervals

    setGuardMovementIntervals(intervals);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [gameState, gamePhase, currentLevel, currentLevels]);

  // Pattern memory timer
  useEffect(() => {
    if (gamePhase === 'memory' && patternMemoryTime > 0) {
      const timer = setTimeout(() => {
        setPatternMemoryTime(prev => prev - 100);
      }, 100);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'memory' && patternMemoryTime <= 0) {
      setShowGuardPatterns(false);
      setGamePhase('playing');
    }
  }, [gamePhase, patternMemoryTime]);

  // Main game timer
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

  // Handle player movement - FIXED guard collision logic
  const handleCellClick = useCallback((row, col) => {
    if (gameState !== 'playing' || gamePhase !== 'playing' || showPuzzle) return;

    const currentLevelData = currentLevels[currentLevel];
    if (!currentLevelData) return;

    // Check if move is valid (adjacent cell or same cell)
    const { row: playerRow, col: playerCol } = playerPosition;
    const isAdjacent = Math.abs(row - playerRow) + Math.abs(col - playerCol) === 1;
    const isSameCell = row === playerRow && col === playerCol;
    
    if (!isAdjacent && !isSameCell) return;

    const cellType = currentLevelData.grid[row] && currentLevelData.grid[row][col];
    if (!cellType) return;
    
    // Check if cell is blocked
    if (cellType === 'wall') return;

    // Check if guard is present - FIXED with null safety
    const guardPresent = guardPositions.some(guard => 
      guard && guard.row === row && guard.col === col
    );
    
    if (guardPresent) {
      setFeedbackType('caught');
      setFeedbackMessage('Caught by a guard! Try again.');
      setShowFeedback(true);
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
        setShowFeedback(false);
        if (lives > 1) {
          resetLevel();
        }
      }, 2000);
      return;
    }

    // Move player
    setPlayerPosition({ row, col });

    // Handle different cell types
    switch (cellType) {
      case 'keycard':
        if (!collectedItems.includes('keycard')) {
          setCollectedItems(prev => [...prev, 'keycard']);
          setFeedbackType('item');
          setFeedbackMessage('Keycard collected! You can now unlock doors.');
          setShowFeedback(true);
          setTimeout(() => setShowFeedback(false), 1500);
        }
        break;
        
      case 'clue':
        setFeedbackType('clue');
        setFeedbackMessage('Clue discovered: Look for patterns in guard movements!');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
        break;
        
      case 'gate':
        if (collectedItems.includes('keycard') || unlockedCells.includes(`${row}-${col}`)) {
          if (!unlockedCells.includes(`${row}-${col}`)) {
            setUnlockedCells(prev => [...prev, `${row}-${col}`]);
            setFeedbackType('unlock');
            setFeedbackMessage('Gate unlocked with keycard!');
            setShowFeedback(true);
            setTimeout(() => setShowFeedback(false), 1500);
          }
        } else {
          setFeedbackType('locked');
          setFeedbackMessage('You need a keycard to unlock this gate!');
          setShowFeedback(true);
          setTimeout(() => setShowFeedback(false), 1500);
          return; // Don't allow movement through locked gate
        }
        break;
        
      case 'codeLock':
        if (unlockedCells.includes(`${row}-${col}`)) {
          // Already unlocked, allow passage
          break;
        }
        const puzzle = currentLevelData.puzzles && currentLevelData.puzzles.find(p => 
          p.trigger && p.trigger.row === row && p.trigger.col === col
        );
        if (puzzle) {
          setCurrentPuzzle(puzzle);
          setShowPuzzle(true);
        }
        break;
        
      case 'exit':
        completeLevel();
        break;
        
      case 'alarm':
        setFeedbackType('alarm');
        setFeedbackMessage('Alarm triggered! Guards are coming!');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
        break;
    }
  }, [gameState, gamePhase, showPuzzle, playerPosition, guardPositions, collectedItems, currentLevel, currentLevels, lives, unlockedCells]);

  // Complete level
  const completeLevel = () => {
    const responseTime = Date.now() - levelStartTime;
    setLevelsCompleted(prev => prev + 1);
    setStreak(prev => {
      const newStreak = prev + 1;
      setMaxStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
    setTotalResponseTime(prev => prev + responseTime);
    
    setFeedbackType('success');
    setFeedbackMessage('Level completed! Well done, prisoner!');
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      if (currentLevel + 1 >= currentLevels.length) {
        setGameState('finished');
        setShowCompletionModal(true);
      } else {
        setCurrentLevel(prev => prev + 1);
        setTimeout(() => {
          // FIXED: Remove duplicate resetLevel call
          startLevel();
        }, 500);
      }
    }, 2500);
  };

  // Reset level
  const resetLevel = () => {
    if (!currentLevels[currentLevel]) return;
    
    const currentLevelData = currentLevels[currentLevel];
    
    // Find player starting position
    let playerFound = false;
    for (let row = 0; row < currentLevelData.gridSize && !playerFound; row++) {
      for (let col = 0; col < currentLevelData.gridSize && !playerFound; col++) {
        if (currentLevelData.grid[row] && currentLevelData.grid[row][col] === 'player') {
          setPlayerPosition({ row, col });
          playerFound = true;
        }
      }
    }
    
    // Initialize guard positions - FIXED with null safety
    if (currentLevelData.guardPatterns && currentLevelData.guardPatterns.length > 0) {
      setGuardPositions(currentLevelData.guardPatterns.map(guard => 
        (guard && guard.positions && guard.positions.length > 0) ? guard.positions[0] : { row: 0, col: 0 }
      ));
    } else {
      setGuardPositions([]);
    }
    
    setUnlockedCells([]);
    setCollectedItems([]);
    setShowPuzzle(false);
    setCurrentPuzzle(null);
    setShowFeedback(false);
  };

  // Start level
  const startLevel = () => {
    if (!currentLevels[currentLevel]) return;
    
    const currentLevelData = currentLevels[currentLevel];
    
    resetLevel();
    setGamePhase('memory');
    setShowGuardPatterns(true);
    setPatternMemoryTime(currentLevelData.memoryTime || 3000);
    setLevelStartTime(Date.now());
    setTotalAttempts(prev => prev + 1);
  };

  // Handle puzzle solution - FIXED sequence comparison
  const handlePuzzleSolution = (answer) => {
    if (!currentPuzzle) return;
    
    let isCorrect = false;
    
    if (currentPuzzle.type === 'pattern' || currentPuzzle.type === 'logic') {
      isCorrect = currentPuzzle.correctAnswer === answer;
    } else if (currentPuzzle.type === 'sequence') {
      // FIXED: Remove unnecessary toLowerCase() and add trim()
      isCorrect = currentPuzzle.answer === String(answer).trim();
    }
    
    if (isCorrect) {
      const [row, col] = [currentPuzzle.trigger.row, currentPuzzle.trigger.col];
      setUnlockedCells(prev => [...prev, `${row}-${col}`]);
      setFeedbackType('puzzle_success');
      setFeedbackMessage('Puzzle solved! The lock is open.');
      setStreak(prev => prev + 1);
      setPuzzlesSolved(prev => prev + 1);
    } else {
      setFeedbackType('puzzle_fail');
      setFeedbackMessage('Wrong answer! The alarm is sounding!');
      setLives(prev => Math.max(0, prev - 1));
      setStreak(0);
    }
    
    setShowPuzzle(false);
    setCurrentPuzzle(null);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;

    setHintsUsed(prev => prev + 1);
    
    if (showPuzzle && currentPuzzle) {
      setHintMessage(currentPuzzle.hint || "Think logically about the puzzle!");
    } else {
      setHintMessage("Guards follow predictable patterns. Watch their movement and time your moves carefully!");
    }

    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 4000);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const levels = allLevels[difficulty] || [];
    
    setCurrentLevels(levels);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentLevel(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setLevelsCompleted(0);
    setPuzzlesSolved(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
    setPlayerPosition({ row: 0, col: 0 });
    setGuardPositions([]);
    setUnlockedCells([]);
    setCollectedItems([]);
    setShowPuzzle(false);
    setCurrentPuzzle(null);
    setShowFeedback(false);
    setShowHint(false);
    setGamePhase('memory');
    cleanupGuardMovement();
  }, [difficulty, cleanupGuardMovement]);

  const handleStart = () => {
    setGameState('playing');
    initializeGame();
    // Use setTimeout to ensure state is updated before starting level
    setTimeout(() => {
      startLevel();
    }, 100);
  };

  const handleReset = () => {
    setGameState('ready');
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Escape Grid Game completed:', payload);
  };

  const customStats = {
    currentLevel: currentLevel + 1,
    totalLevels: difficultySettings[difficulty].levelCount,
    streak: maxStreak,
    lives,
    hintsUsed,
    levelsCompleted,
    puzzlesSolved,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    itemsCollected: collectedItems.length
  };

  const currentLevelData = currentLevels[currentLevel];

  // Render grid cell
  const renderCell = (row, col) => {
    if (!currentLevelData || !currentLevelData.grid[row] || !currentLevelData.grid[row][col]) return null;
    
    const cellType = currentLevelData.grid[row][col];
    const isPlayerHere = playerPosition.row === row && playerPosition.col === col;
    const isGuardHere = guardPositions.some(guard => guard && guard.row === row && guard.col === col);
    const isUnlocked = unlockedCells.includes(`${row}-${col}`);
    const isClickable = gameState === 'playing' && gamePhase === 'playing' && !showPuzzle;
    
    let cellContent = cellTypes[cellType] || cellTypes.empty;
    let cellClass = 'w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border border-gray-400 flex items-center justify-center text-lg sm:text-xl md:text-2xl cursor-pointer transition-all duration-200 ';
    
    // Override with player if player is here
    if (isPlayerHere) {
      cellContent = cellTypes.player;
      cellClass += 'bg-blue-200 ';
    }
    // Show guard if guard is here and guard patterns are visible
    else if (isGuardHere && (showGuardPatterns || gamePhase === 'playing')) {
      cellContent = cellTypes.guard;
      cellClass += 'bg-red-200 ';
    }
    // Show unlocked gates
    else if ((cellType === 'gate' || cellType === 'codeLock') && isUnlocked) {
      cellContent = cellTypes.empty;
      cellClass += 'bg-green-200 ';
    }
    // Hide collected items
    else if (cellType === 'keycard' && collectedItems.includes('keycard')) {
      cellContent = cellTypes.empty;
    }

    // Add hover effect for clickable cells
    if (isClickable) {
      cellClass += 'hover:bg-gray-100 ';
    }

    // Add background colors based on cell type
    if (cellType === 'wall') {
      cellClass += 'bg-gray-800 ';
    } else if (cellType === 'exit') {
      cellClass += 'bg-green-300 ';
    } else if (cellType === 'alarm') {
      cellClass += 'bg-red-100 ';
    } else {
      cellClass += 'bg-gray-50 ';
    }

    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => handleCellClick(row, col)}
      >
        {cellContent}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Escape Grid: Jail Break Logic"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-4 sm:p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Escape Grid: Jail Break Logic
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {showInstructions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🚓 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Escape from prison by navigating grid-based rooms, avoiding guards, and solving logic puzzles.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🧠 Memory Challenge
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Memorize guard patrol patterns</li>
                      <li>• Time your movements carefully</li>
                      <li>• Remember safe paths</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔓 Puzzle Types
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Pattern matching</li>
                      <li>• Logic deduction</li>
                      <li>• Sequence puzzles</li>
                      <li>• Code breaking</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 25 points per puzzle</li>
                      <li>• Moderate: 40 points per puzzle</li>
                      <li>• Hard: 50 points per puzzle</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Logic & Memory"
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
        <div className="flex flex-col items-center px-2 sm:px-4">
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            {gameState === 'playing' && (
              <button
                onClick={useHint}
                disabled={hintsUsed >= maxHints}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base ${hintsUsed >= maxHints
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
              >
                <Lightbulb className="h-4 w-4" />
                Hint ({maxHints - hintsUsed})
              </button>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6 w-full max-w-3xl">
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-sm sm:text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel + 1}/{difficultySettings[difficulty].levelCount}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Puzzles
              </div>
              <div className="text-sm sm:text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {puzzlesSolved}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Lives
              </div>
              <div className="text-sm sm:text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'❤️'.repeat(Math.max(0, lives))}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Items
              </div>
              <div className="text-sm sm:text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {collectedItems.map(item => item === 'keycard' ? '🔑' : '').join('') || '—'}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Phase
              </div>
              <div className="text-sm sm:text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {gamePhase === 'memory' ? '👁️' : gamePhase === 'playing' ? '🏃' : '🧩'}
              </div>
            </div>
          </div>

          {/* Level Info */}
          {currentLevelData && (
            <div className="w-full max-w-4xl mb-4 sm:mb-6">
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-orange-800" />
                  <span className="text-sm sm:text-base font-semibold text-orange-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentLevelData.name} - {difficulty} Security
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-orange-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentLevelData.description}
                </p>
                
                {gamePhase === 'memory' && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-xs sm:text-sm text-orange-700 font-medium">
                      Memorizing guard patterns... {Math.ceil(patternMemoryTime / 1000)}s
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hint Display */}
          {showHint && (
            <div className="w-full max-w-2xl mb-4 sm:mb-6">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  <span className="text-sm sm:text-base font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hint:
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {hintMessage}
                </p>
              </div>
            </div>
          )}

          {/* Game Grid */}
          {currentLevelData && gameState === 'playing' && (
            <div className="mb-4 sm:mb-6">
              <div 
                className="grid gap-1 p-2 sm:p-4 bg-gray-200 rounded-lg"
                style={{
                  gridTemplateColumns: `repeat(${currentLevelData.gridSize}, 1fr)`
                }}
              >
                {Array.from({ length: currentLevelData.gridSize }, (_, row) =>
                  Array.from({ length: currentLevelData.gridSize }, (_, col) =>
                    renderCell(row, col)
                  )
                )}
              </div>
              
              {/* Legend */}
              <div className="mt-4 text-center">
                <div className="text-xs sm:text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Game Legend:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 text-xs max-w-lg mx-auto">
                  <div>🚶 You</div>
                  <div>👮 Guard</div>
                  <div>🔑 Keycard</div>
                  <div>🚪 Gate</div>
                  <div>🔐 Code Lock</div>
                  <div>🏃‍♂️ Exit</div>
                  <div>📄 Clue</div>
                  <div>⬛ Wall</div>
                </div>
              </div>
            </div>
          )}

          {/* Puzzle Modal */}
          {showPuzzle && currentPuzzle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Security Puzzle
                  </h3>
                </div>
                
                <p className="text-gray-700 mb-4 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentPuzzle.question}
                </p>
                
                {currentPuzzle.type === 'pattern' && (
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <div className="text-base sm:text-lg font-semibold mb-2">Target Pattern:</div>
                      <div className="flex justify-center gap-2">
                        {currentPuzzle.pattern && currentPuzzle.pattern.map((color, index) => (
                          <div key={index} className="text-xl sm:text-2xl">{color}</div>
                        ))}
                      </div>
                    </div>
                    {currentPuzzle.options && currentPuzzle.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handlePuzzleSolution(index)}
                        className="w-full p-2 border rounded flex justify-center gap-2 hover:bg-gray-50"
                      >
                        {option.map((color, colorIndex) => (
                          <span key={colorIndex} className="text-lg sm:text-xl">{color}</span>
                        ))}
                      </button>
                    ))}
                  </div>
                )}
                
                {currentPuzzle.type === 'logic' && (
                  <div className="space-y-3">
                    {currentPuzzle.options && currentPuzzle.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handlePuzzleSolution(index)}
                        className="w-full p-2 sm:p-3 border rounded text-left hover:bg-gray-50 text-sm sm:text-base"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
                
                {currentPuzzle.type === 'sequence' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter code..."
                      className="w-full p-2 sm:p-3 border rounded text-center text-base sm:text-lg tracking-widest"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handlePuzzleSolution(e.target.value);
                        }
                      }}
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[type="text"]');
                        if (input) handlePuzzleSolution(input.value);
                      }}
                      className="w-full bg-blue-500 text-white p-2 sm:p-3 rounded hover:bg-blue-600 text-sm sm:text-base"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Submit Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-4 sm:p-6 rounded-lg ${
              feedbackType === 'success' ? 'bg-green-100 text-green-800' :
              feedbackType === 'caught' || feedbackType === 'alarm' ? 'bg-red-100 text-red-800' :
              feedbackType === 'item' || feedbackType === 'unlock' || feedbackType === 'puzzle_success' ? 'bg-blue-100 text-blue-800' :
              feedbackType === 'puzzle_fail' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'success' && <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
                {(feedbackType === 'caught' || feedbackType === 'alarm' || feedbackType === 'puzzle_fail') && <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
                {feedbackType === 'item' && <Key className="h-5 w-5 sm:h-6 sm:w-6" />}
                {(feedbackType === 'unlock' || feedbackType === 'puzzle_success') && <Unlock className="h-5 w-5 sm:h-6 sm:w-6" />}
                <div className="text-lg sm:text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackMessage}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Click adjacent cells to move. Memorize guard patterns, collect keycards, solve puzzles, and reach the exit.
              Avoid guards and alarms to maintain your lives!
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].levelCount} levels | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              {difficultySettings[difficulty].pointsPerPuzzle} points per puzzle
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

export default EscapeGridGame;