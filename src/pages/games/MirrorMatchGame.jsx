import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Carrot as Mirror, Lightbulb, CheckCircle, XCircle, RotateCw, ChevronUp, ChevronDown, Target } from 'lucide-react';

const MirrorMatchGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [solvedPatterns, setSolvedPatterns] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [patternStartTime, setPatternStartTime] = useState(0);

  // Game state
  const [originalPattern, setOriginalPattern] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Comprehensive pattern library with more variety
  const patterns = {
    easy: [
      {
        id: 'l_shape',
        name: 'L-Shape',
        icon: '⌐',
        color: '#2563EB',
        gradient: 'from-blue-600 via-blue-700 to-blue-800',
        grid: [
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 1, 1, 1, 1]
        ]
      },
      {
        id: 'arrow_right',
        name: 'Arrow Right',
        icon: '►',
        color: '#059669',
        gradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
        grid: [
          [0, 0, 1, 0, 0],
          [0, 0, 1, 1, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 1, 1, 0],
          [0, 0, 1, 0, 0]
        ]
      },
      {
        id: 'step_pattern',
        name: 'Step Pattern',
        icon: '⌊',
        color: '#DC2626',
        gradient: 'from-red-600 via-red-700 to-red-800',
        grid: [
          [1, 1, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 0, 1, 1, 0],
          [0, 0, 1, 1, 1]
        ]
      },
      {
        id: 'simple_corner',
        name: 'Simple Corner',
        icon: '⌜',
        color: '#7C3AED',
        gradient: 'from-violet-600 via-violet-700 to-violet-800',
        grid: [
          [1, 1, 1, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ]
      },
      {
        id: 'half_cross',
        name: 'Half Cross',
        icon: '⊢',
        color: '#EA580C',
        gradient: 'from-orange-600 via-orange-700 to-orange-800',
        grid: [
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [1, 1, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0]
        ]
      },
      {
        id: 'simple_line',
        name: 'Simple Line',
        icon: '─',
        color: '#0891B2',
        gradient: 'from-cyan-600 via-cyan-700 to-cyan-800',
        grid: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ]
      }
    ],
    moderate: [
      {
        id: 'flag_pattern',
        name: 'Flag Pattern',
        icon: '⚑',
        color: '#7C3AED',
        gradient: 'from-violet-600 via-violet-700 to-violet-800',
        grid: [
          [1, 0, 0, 0, 0],
          [1, 1, 1, 1, 0],
          [1, 1, 1, 0, 0],
          [1, 1, 0, 0, 0],
          [1, 0, 0, 0, 0]
        ]
      },
      {
        id: 'corner_pattern',
        name: 'Corner Pattern',
        icon: '⌜',
        color: '#EA580C',
        gradient: 'from-orange-600 via-orange-700 to-orange-800',
        grid: [
          [1, 1, 1, 0, 0],
          [1, 0, 1, 0, 0],
          [1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ]
      },
      {
        id: 'zigzag_pattern',
        name: 'Zigzag Pattern',
        icon: '⟋',
        color: '#0891B2',
        gradient: 'from-cyan-600 via-cyan-700 to-cyan-800',
        grid: [
          [1, 0, 0, 0, 1],
          [0, 1, 0, 1, 0],
          [0, 0, 1, 0, 0],
          [0, 1, 0, 1, 0],
          [1, 0, 0, 0, 1]
        ]
      },
      {
        id: 'cross_pattern',
        name: 'Cross Pattern',
        icon: '✚',
        color: '#7C2D12',
        gradient: 'from-amber-600 via-orange-700 to-red-800',
        grid: [
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0]
        ]
      },
      {
        id: 'house_pattern',
        name: 'House Pattern',
        icon: '⌂',
        color: '#059669',
        gradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
        grid: [
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [1, 1, 1, 1, 1],
          [1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1]
        ]
      },
      {
        id: 'triangle_pattern',
        name: 'Triangle Pattern',
        icon: '△',
        color: '#DC2626',
        gradient: 'from-red-600 via-red-700 to-red-800',
        grid: [
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ]
      },
      {
        id: 'chevron_pattern',
        name: 'Chevron Pattern',
        icon: '⌄',
        color: '#BE185D',
        gradient: 'from-pink-600 via-rose-700 to-red-800',
        grid: [
          [1, 0, 0, 0, 1],
          [0, 1, 0, 1, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ]
      },
      {
        id: 'bridge_pattern',
        name: 'Bridge Pattern',
        icon: '⌒',
        color: '#1E40AF',
        gradient: 'from-indigo-600 via-blue-700 to-cyan-800',
        grid: [
          [1, 0, 0, 0, 1],
          [1, 1, 0, 1, 1],
          [0, 1, 1, 1, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ]
      },
      {
        id: 'tower_pattern',
        name: 'Tower Pattern',
        icon: '🗼',
        color: '#7C3AED',
        gradient: 'from-violet-600 via-purple-700 to-indigo-800',
        grid: [
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [1, 1, 1, 1, 1]
        ]
      }
    ],
    hard: [
      {
        id: 'complex_asymmetric',
        name: 'Complex Asymmetric',
        icon: '◈',
        color: '#BE185D',
        gradient: 'from-pink-600 via-rose-700 to-red-800',
        grid: [
          [1, 0, 1, 0, 1],
          [0, 1, 0, 0, 0],
          [1, 0, 1, 1, 0],
          [0, 0, 0, 1, 0],
          [1, 1, 0, 0, 1]
        ]
      },
      {
        id: 'spiral_pattern',
        name: 'Spiral Pattern',
        icon: '◉',
        color: '#1E40AF',
        gradient: 'from-indigo-600 via-blue-700 to-cyan-800',
        grid: [
          [1, 1, 1, 1, 0],
          [0, 0, 0, 1, 0],
          [0, 1, 0, 1, 0],
          [0, 1, 0, 0, 0],
          [0, 1, 1, 1, 1]
        ]
      },
      {
        id: 'diamond_pattern',
        name: 'Diamond Pattern',
        icon: '◆',
        color: '#059669',
        gradient: 'from-teal-600 via-emerald-700 to-green-800',
        grid: [
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [1, 1, 0, 1, 1],
          [0, 1, 1, 1, 0],
          [0, 0, 1, 0, 0]
        ]
      },
      {
        id: 'maze_pattern',
        name: 'Maze Pattern',
        icon: '▦',
        color: '#7C3AED',
        gradient: 'from-violet-600 via-purple-700 to-indigo-800',
        grid: [
          [1, 1, 0, 1, 1],
          [1, 0, 0, 0, 1],
          [0, 0, 1, 0, 0],
          [1, 0, 0, 0, 1],
          [1, 1, 0, 1, 1]
        ]
      },
      {
        id: 'lightning_pattern',
        name: 'Lightning Pattern',
        icon: '⚡',
        color: '#FBBF24',
        gradient: 'from-yellow-600 via-amber-700 to-orange-800',
        grid: [
          [0, 1, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [0, 1, 1, 1, 0],
          [0, 0, 0, 1, 1],
          [0, 0, 0, 1, 0]
        ]
      },
      {
        id: 'castle_pattern',
        name: 'Castle Pattern',
        icon: '♜',
        color: '#6B7280',
        gradient: 'from-gray-600 via-slate-700 to-gray-800',
        grid: [
          [1, 0, 1, 0, 1],
          [1, 1, 1, 1, 1],
          [0, 1, 1, 1, 0],
          [0, 1, 0, 1, 0],
          [1, 1, 0, 1, 1]
        ]
      },
      {
        id: 'butterfly_pattern',
        name: 'Butterfly Pattern',
        icon: '🦋',
        color: '#EC4899',
        gradient: 'from-pink-600 via-rose-700 to-purple-800',
        grid: [
          [1, 0, 1, 0, 1],
          [1, 1, 0, 1, 1],
          [0, 1, 1, 1, 0],
          [1, 1, 0, 1, 1],
          [1, 0, 1, 0, 1]
        ]
      },
      {
        id: 'complex_cross',
        name: 'Complex Cross',
        icon: '✠',
        color: '#DC2626',
        gradient: 'from-red-600 via-red-700 to-rose-800',
        grid: [
          [0, 1, 1, 1, 0],
          [1, 1, 1, 1, 1],
          [1, 1, 0, 1, 1],
          [1, 1, 1, 1, 1],
          [0, 1, 1, 1, 0]
        ]
      },
      {
        id: 'star_pattern',
        name: 'Star Pattern',
        icon: '⭐',
        color: '#F59E0B',
        gradient: 'from-amber-600 via-yellow-700 to-orange-800',
        grid: [
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [1, 1, 1, 1, 1],
          [0, 1, 0, 1, 0],
          [1, 0, 0, 0, 1]
        ]
      },
      {
        id: 'wave_pattern',
        name: 'Wave Pattern',
        icon: '〜',
        color: '#0891B2',
        gradient: 'from-cyan-600 via-blue-700 to-teal-800',
        grid: [
          [1, 0, 0, 1, 0],
          [0, 1, 0, 0, 1],
          [0, 0, 1, 0, 0],
          [0, 1, 0, 0, 1],
          [1, 0, 0, 1, 0]
        ]
      },
      {
        id: 'hexagon_pattern',
        name: 'Hexagon Pattern',
        icon: '⬡',
        color: '#059669',
        gradient: 'from-emerald-600 via-green-700 to-teal-800',
        grid: [
          [0, 1, 1, 1, 0],
          [1, 1, 0, 1, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 0, 1, 1],
          [0, 1, 1, 1, 0]
        ]
      },
      {
        id: 'complex_spiral',
        name: 'Complex Spiral',
        icon: '🌀',
        color: '#7C3AED',
        gradient: 'from-violet-600 via-purple-700 to-indigo-800',
        grid: [
          [1, 1, 1, 1, 1],
          [0, 0, 0, 0, 1],
          [1, 1, 1, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1]
        ]
      }
    ]
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 120, lives: 5, hints: 3, optionsCount: 3, totalPatterns: 6, pointsPerPattern: 33 },
    Moderate: { timeLimit: 100, lives: 4, hints: 2, optionsCount: 4, totalPatterns: 9, pointsPerPattern: 22 },
    Hard: { timeLimit: 80, lives: 3, hints: 1, optionsCount: 4, totalPatterns: 12, pointsPerPattern: 16 }
  };

  // Mirror pattern horizontally
  const mirrorHorizontal = (grid) => {
    return grid.map(row => [...row].reverse());
  };

  // Mirror pattern vertically
  const mirrorVertical = (grid) => {
    return [...grid].reverse();
  };

  // Rotate pattern 90 degrees clockwise
  const rotate90 = (grid) => {
    const size = grid.length;
    const rotated = Array(size).fill().map(() => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        rotated[j][size - 1 - i] = grid[i][j];
      }
    }

    return rotated;
  };

  // Generate random variation of a grid
  const generateRandomVariation = (grid) => {
    const variation = grid.map(row => [...row]);
    // Add some random changes to create a different but similar pattern
    const changes = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < changes; i++) {
      const row = Math.floor(Math.random() * 5);
      const col = Math.floor(Math.random() * 5);
      variation[row][col] = variation[row][col] === 1 ? 0 : 1;
    }
    
    return variation;
  };

  // Check if two grids are identical
  const gridsAreEqual = (grid1, grid2) => {
    if (grid1.length !== grid2.length) return false;

    for (let i = 0; i < grid1.length; i++) {
      if (grid1[i].length !== grid2[i].length) return false;
      for (let j = 0; j < grid1[i].length; j++) {
        if (grid1[i][j] !== grid2[i][j]) return false;
      }
    }

    return true;
  };

  // Generate new pattern based on difficulty and level
  const generateNewPattern = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const difficultyLevel = difficulty.toLowerCase();
    const availablePatterns = patterns[difficultyLevel];

    // Select random pattern
    const randomPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    setOriginalPattern(randomPattern);

    // Generate correct mirror (horizontal mirror)
    const correctMirror = mirrorHorizontal(randomPattern.grid);

    // Generate comprehensive wrong options
    const potentialWrongOptions = [
      {
        id: 'vertical-mirror',
        grid: mirrorVertical(randomPattern.grid),
        isCorrect: false,
        type: 'Vertical Mirror'
      },
      {
        id: 'original',
        grid: randomPattern.grid,
        isCorrect: false,
        type: 'Original Pattern'
      },
      {
        id: 'rotated-90',
        grid: rotate90(randomPattern.grid),
        isCorrect: false,
        type: '90° Rotation'
      },
      {
        id: 'rotated-180',
        grid: rotate90(rotate90(randomPattern.grid)),
        isCorrect: false,
        type: '180° Rotation'
      },
      {
        id: 'rotated-270',
        grid: rotate90(rotate90(rotate90(randomPattern.grid))),
        isCorrect: false,
        type: '270° Rotation'
      },
      {
        id: 'rotated-mirror',
        grid: rotate90(correctMirror),
        isCorrect: false,
        type: 'Rotated Mirror'
      },
      {
        id: 'diagonal-flip',
        grid: randomPattern.grid[0].map((_, colIndex) => randomPattern.grid.map(row => row[colIndex])),
        isCorrect: false,
        type: 'Diagonal Flip'
      },
      {
        id: 'variation-1',
        grid: generateRandomVariation(randomPattern.grid),
        isCorrect: false,
        type: 'Similar Pattern'
      },
      {
        id: 'variation-2',
        grid: generateRandomVariation(correctMirror),
        isCorrect: false,
        type: 'Mirror Variation'
      }
    ];

    // Filter out options that are identical to the correct answer
    const validWrongOptions = potentialWrongOptions.filter(option => {
      return !gridsAreEqual(option.grid, correctMirror);
    });

    // If we don't have enough unique options, generate more variations
    while (validWrongOptions.length < settings.optionsCount - 1) {
      const basePattern = Math.random() > 0.5 ? randomPattern.grid : correctMirror;
      const newVariation = generateRandomVariation(basePattern);
      
      if (!gridsAreEqual(newVariation, correctMirror) && 
          !validWrongOptions.some(opt => gridsAreEqual(opt.grid, newVariation))) {
        validWrongOptions.push({
          id: `variation-${validWrongOptions.length}`,
          grid: newVariation,
          isCorrect: false,
          type: 'Pattern Variation'
        });
      }
    }

    // Shuffle and select the required number of wrong options
    const shuffledWrong = validWrongOptions.sort(() => Math.random() - 0.5);
    const selectedWrong = shuffledWrong.slice(0, settings.optionsCount - 1);

    // Add correct option
    const allOptions = [
      { id: 'correct-mirror', grid: correctMirror, isCorrect: true, type: 'Horizontal Mirror' },
      ...selectedWrong
    ].sort(() => Math.random() - 0.5);

    setOptions(allOptions);
    setSelectedOption(null);
    setShowFeedback(false);
    setPatternStartTime(Date.now());
  }, [difficulty]);

  // Calculate score using new simplified system
  const calculateScore = useCallback(() => {
    const settings = difficultySettings[difficulty];
    return solvedPatterns * settings.pointsPerPattern;
  }, [difficulty, solvedPatterns]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle option selection
  const handleOptionSelect = useCallback((option) => {
    if (gameState !== 'playing' || showFeedback) return;

    const responseTime = Date.now() - patternStartTime;
    setSelectedOption(option);
    setShowFeedback(true);
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    if (option.isCorrect) {
      setFeedbackType('correct');
      setSolvedPatterns(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setCurrentLevel(prev => prev + 1);

      // Check if game is complete
      const settings = difficultySettings[difficulty];
      if (solvedPatterns + 1 >= settings.totalPatterns) {
        setTimeout(() => {
          setGameState('finished');
          setShowCompletionModal(true);
        }, 2000);
      } else {
        setTimeout(() => {
          generateNewPattern();
        }, 2000);
      }
    } else {
      setFeedbackType('incorrect');
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('finished');
          setShowCompletionModal(true);
        }
        return Math.max(0, newLives);
      });

      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }
  }, [gameState, showFeedback, patternStartTime, generateNewPattern, difficulty, solvedPatterns]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !originalPattern) return;

    setHintsUsed(prev => prev + 1);
    
    const hintMessages = [
      "Look for the horizontal mirror reflection - imagine folding the pattern along a vertical line.",
      "Each filled cell on the left should appear on the right side at the same height.",
      "The correct mirror will have the exact opposite left-right arrangement of the original pattern.",
      "Focus on the edges - they should be perfectly mirrored horizontally.",
      "Ignore rotations and vertical flips - only horizontal mirroring is correct."
    ];

    setHintMessage(hintMessages[hintsUsed % hintMessages.length]);
    setShowHint(true);

    setTimeout(() => {
      setShowHint(false);
    }, 5000);
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
    setCurrentLevel(1);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setSolvedPatterns(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    generateNewPattern();
  };

  const handleReset = () => {
    initializeGame();
    setOriginalPattern(null);
    setOptions([]);
    setSelectedOption(null);
    setShowFeedback(false);
    setShowHint(false);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    lives,
    hintsUsed,
    solvedPatterns,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    patternType: originalPattern?.name || 'Unknown'
  };

  // Render grid pattern with responsive design
  const renderGrid = (grid, pattern, size = 'normal', isSelected = false, isCorrect = null) => {
    const getCellSize = () => {
      if (size === 'large') return 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12';
      if (size === 'small') return 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6';
      return 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8';
    };

    const getContainerPadding = () => {
      if (size === 'large') return 'p-3 sm:p-4 md:p-6';
      if (size === 'small') return 'p-1 sm:p-2';
      return 'p-2 sm:p-3 md:p-4';
    };

    const cellSize = getCellSize();
    const containerClass = getContainerPadding();

    let containerStyle = `${containerClass} rounded-xl sm:rounded-2xl border-2 sm:border-4 transition-all duration-500 transform-gpu`;

    if (isSelected && isCorrect !== null) {
      if (isCorrect) {
        containerStyle += ' border-green-400 bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl sm:shadow-2xl shadow-green-500/50 scale-105 ring-2 sm:ring-4 ring-green-300 ring-opacity-75';
      } else {
        containerStyle += ' border-red-400 bg-gradient-to-br from-red-50 to-rose-100 shadow-xl sm:shadow-2xl shadow-red-500/50 scale-95 ring-2 sm:ring-4 ring-red-300 ring-opacity-75';
      }
    } else {
      containerStyle += ' border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 hover:shadow-lg sm:hover:shadow-xl hover:scale-105';
    }

    return (
      <div className={containerStyle}>
        <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`${cellSize} rounded-sm sm:rounded-lg border transition-all duration-300 ${
                  cell
                    ? `bg-gradient-to-br ${pattern?.gradient || 'from-blue-400 to-blue-600'} border-white shadow-sm sm:shadow-lg`
                    : 'bg-gray-100 border-gray-200'
                }`}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Mirror Match"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-4 sm:p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-base sm:text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Mirror Match
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-900" />
                    : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-900" />}
                </span>
              </div>

              {/* Toggle Content */}
              {showInstructions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Objective
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Identify the correct horizontal mirror reflection of the given pattern.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🪞 Mirror Logic
                    </h4>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Horizontal reflection only</li>
                      <li>• Left becomes right</li>
                      <li>• Vertical position stays same</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 33 points per pattern</li>
                      <li>• Moderate: 22 points per pattern</li>
                      <li>• Hard: 16 points per pattern</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      💡 Strategy
                    </h4>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Visualize folding vertically</li>
                      <li>• Check edge patterns first</li>
                      <li>• Use hints for complex patterns</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Spatial Awareness"
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
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base ${
                  hintsUsed >= maxHints
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
              >
                <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Hint</span> ({maxHints - hintsUsed})
              </button>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-base sm:text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Lives
              </div>
              <div className="text-base sm:text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'❤️'.repeat(lives)}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Progress
              </div>
              <div className="text-base sm:text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {solvedPatterns}/{difficultySettings[difficulty].totalPatterns}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Success Rate
              </div>
              <div className="text-base sm:text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalAttempts > 0 ? Math.round((solvedPatterns / totalAttempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Pattern Type Info */}
          {originalPattern && (
            <div className="w-full max-w-4xl mb-4 sm:mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mirror className="h-4 w-4 sm:h-5 sm:w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {originalPattern.name} - Pattern {solvedPatterns + 1} of {difficultySettings[difficulty].totalPatterns}
                  </span>
                </div>
                <p className="text-blue-700 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  Find the correct horizontal mirror reflection of this pattern
                </p>
              </div>
            </div>
          )}

          {/* Original Pattern Display */}
          {originalPattern && (
            <div className="mb-6 sm:mb-8 text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Original Pattern:
              </h3>
              <div className="inline-block">
                {renderGrid(originalPattern.grid, originalPattern, 'large')}
              </div>
            </div>
          )}

          {/* Mirror Line Indicator */}
          {originalPattern && (
            <div className="mb-6 sm:mb-8 text-center">
              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
                <div className="text-slate-700 font-bold text-sm sm:text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>SOURCE</div>
                <div className="flex flex-col items-center">
                  <div className="w-12 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full shadow-lg"></div>
                  <div className="text-slate-800 font-bold text-xs sm:text-sm mt-1 px-2 sm:px-3 py-1 bg-slate-200 rounded-full" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    ⟷ MIRROR AXIS
                  </div>
                  <div className="w-12 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full shadow-lg mt-1"></div>
                </div>
                <div className="text-slate-700 font-bold text-sm sm:text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>REFLECTION</div>
              </div>
            </div>
          )}

          {/* Hint Display */}
          {showHint && (
            <div className="w-full max-w-2xl mb-4 sm:mb-6">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800 text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hint:
                  </span>
                </div>
                <p className="text-yellow-700 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {hintMessage}
                </p>
              </div>
            </div>
          )}

          {/* Options Grid */}
          {options.length > 0 && !showFeedback && (
            <div className={`grid gap-3 sm:gap-6 mb-6 sm:mb-8 w-full max-w-4xl ${
              difficultySettings[difficulty].optionsCount === 3 
                ? 'grid-cols-1 sm:grid-cols-3' 
                : 'grid-cols-1 sm:grid-cols-2'
            }`}>
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showFeedback}
                  className="transform transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    <div className="mb-2 sm:mb-3">
                      {renderGrid(
                        option.grid,
                        originalPattern,
                        'normal',
                        selectedOption?.id === option.id,
                        selectedOption?.id === option.id ? option.isCorrect : null
                      )}
                    </div>
                    <div className="bg-white rounded-xl p-2 sm:p-3 shadow-lg border-2 border-gray-200">
                      <div className="font-bold text-gray-800 text-sm sm:text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Option {index + 1}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Feedback */}
          {showFeedback && selectedOption && (
            <div className={`w-full max-w-2xl text-center p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 ${
              feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                )}
                <div className="text-lg sm:text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Perfect Match!' : 'Incorrect!'}
                </div>
              </div>
              <div className="text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackType === 'correct'
                  ? `Excellent! You earned ${difficultySettings[difficulty].pointsPerPattern} points! (${solvedPatterns}/${difficultySettings[difficulty].totalPatterns} patterns completed)`
                  : `That was a ${selectedOption.type}. Look for the horizontal mirror reflection.`
                }
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Study the original pattern and identify its horizontal mirror reflection.
              Imagine folding the pattern along a vertical line - the correct option shows what the folded pattern would look like.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              {difficultySettings[difficulty].pointsPerPattern} points per pattern
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

export default MirrorMatchGame;