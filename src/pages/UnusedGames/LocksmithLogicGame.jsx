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
  Lock, 
  Unlock, 
  Settings, 
  ChevronUp, 
  ChevronDown,
  Zap,
  Timer,
  Key,
  Shield
} from 'lucide-react';

const LocksmithLogicGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [currentLock, setCurrentLock] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [solvedLocks, setSolvedLocks] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [lockStartTime, setLockStartTime] = useState(0);

  // Game state
  const [currentCombination, setCurrentCombination] = useState({});
  const [lockConfiguration, setLockConfiguration] = useState({});
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [lockUnlocked, setLockUnlocked] = useState(false);
  const [animatingUnlock, setAnimatingUnlock] = useState(false);

  // Lock control types
  const controlTypes = {
    dial: { name: 'Rotating Dial', values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] },
    color: { name: 'Color Dial', values: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'] },
    symbol: { name: 'Symbol Dial', values: ['★', '♦', '♠', '♣', '♥', '◆'] },
    toggle: { name: 'Toggle Switch', values: ['OFF', 'ON'] },
    slider: { name: 'Slider', values: ['1', '2', '3', '4', '5'] }
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { 
      timeLimit: 300, 
      lives: 5, 
      hints: 3, 
      lockCount: 8, 
      pointsPerLock: 25,
      controlCount: 3,
      maxAttempts: 8,
      feedbackDetail: 'high'
    },
    Moderate: { 
      timeLimit: 240, 
      lives: 4, 
      hints: 2, 
      lockCount: 5, 
      pointsPerLock: 40,
      controlCount: 4,
      maxAttempts: 6,
      feedbackDetail: 'medium'
    },
    Hard: { 
      timeLimit: 180, 
      lives: 3, 
      hints: 1, 
      lockCount: 4, 
      pointsPerLock: 50,
      controlCount: 5,
      maxAttempts: 4,
      feedbackDetail: 'low'
    }
  };

  //predefined locks
  const predefinedLocks = {
    Easy: [
    {
      controls: [
        { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
        { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] }
      ],
      solution: { control_0: '3', control_1: 'Blue', control_2: '♠' }
    },
    {
      controls: [
        { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
        { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] }
      ],
      solution: { control_0: '7', control_1: 'Green', control_2: '♥' }
    },
    {
      controls: [
        { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
        { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] }
      ],
      solution: { control_0: '1', control_1: 'Red', control_2: '♦' }
    },
    {
      controls: [
        { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
        { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] }
      ],
      solution: { control_0: '6', control_1: 'Yellow', control_2: '♣' }
    },
    {
      controls: [
        { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
        { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] }
      ],
      solution: { control_0: '0', control_1: 'Purple', control_2: '◆' }
    },
    {
      controls: [
        { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
        { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] }
      ],
      solution: { control_0: '5', control_1: 'Orange', control_2: '★' }
    },
    {
      controls: [
        { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
        { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] }
      ],
      solution: { control_0: '8', control_1: 'Blue', control_2: '♠' }
    },
    {
      controls: [
        { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
        { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
        { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] }
      ],
      solution: { control_0: '2', control_1: 'Green', control_2: '♣' }
    }
    ],
    Moderate : [
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] }
    ],
    solution: { control_0: '4', control_1: 'Red', control_2: '♠', control_3: 'ON' }
  },
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] }
    ],
    solution: { control_0: '9', control_1: 'Blue', control_2: '♦', control_3: 'OFF' }
  },
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] }
    ],
    solution: { control_0: '2', control_1: 'Yellow', control_2: '♥', control_3: 'ON' }
  },
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] }
    ],
    solution: { control_0: '6', control_1: 'Green', control_2: '★', control_3: 'OFF' }
  },
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] }
    ],
    solution: { control_0: '1', control_1: 'Orange', control_2: '◆', control_3: 'ON' }
  }
    ],
    Hard : [
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] },
      { id: 'control_4', type: 'slider', label: 'Slider', values: ['1','2','3','4','5'] }
    ],
    solution: { control_0: '7', control_1: 'Red', control_2: '♣', control_3: 'ON', control_4: '3' }
  },
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] },
      { id: 'control_4', type: 'slider', label: 'Slider', values: ['1','2','3','4','5'] }
    ],
    solution: { control_0: '2', control_1: 'Blue', control_2: '♦', control_3: 'OFF', control_4: '5' }
  },
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] },
      { id: 'control_4', type: 'slider', label: 'Slider', values: ['1','2','3','4','5'] }
    ],
    solution: { control_0: '0', control_1: 'Yellow', control_2: '★', control_3: 'ON', control_4: '2' }
  },
  {
    controls: [
      { id: 'control_0', type: 'dial', label: 'Rotating Dial', values: ['0','1','2','3','4','5','6','7','8','9'] },
      { id: 'control_1', type: 'color', label: 'Color Dial', values: ['Red','Blue','Green','Yellow','Purple','Orange'] },
      { id: 'control_2', type: 'symbol', label: 'Symbol Dial', values: ['★','♦','♠','♣','♥','◆'] },
      { id: 'control_3', type: 'toggle', label: 'Toggle Switch', values: ['OFF', 'ON'] },
      { id: 'control_4', type: 'slider', label: 'Slider', values: ['1','2','3','4','5'] }
    ],
    solution: { control_0: '9', control_1: 'Green', control_2: '♥', control_3: 'OFF', control_4: '4' }
  }
    ],
  };

  // Generate lock configuration
  const generateLockConfiguration = useCallback((lockNumber, difficulty) => {
  const lockData = predefinedLocks[difficulty][lockNumber];
  return {
    controls: lockData.controls,
    solution: lockData.solution,
    rules: {},  // No dynamic rules for now
    attempts: 0
  };
}, []);


  // Calculate score
  const calculateScore = useCallback(() => {
    const settings = difficultySettings[difficulty];
    return solvedLocks * settings.pointsPerLock;
  }, [solvedLocks, difficulty]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle control change
  const handleControlChange = useCallback((controlId, value) => {
    if (gameState !== 'playing' || lockUnlocked) return;

    setCurrentCombination(prev => ({
      ...prev,
      [controlId]: value
    }));
  }, [gameState, lockUnlocked]);

  // Check combination against solution
  const checkCombination = useCallback((combination, config) => {
    const { solution, rules } = config;
    let correctPositions = 0;
    let correctValuesWrongPosition = 0;
    let feedback = [];

    // Check basic correctness
    const solutionValues = Object.values(solution);
    const combinationValues = Object.values(combination);

    Object.keys(solution).forEach(controlId => {
      if (combination[controlId] === solution[controlId]) {
        correctPositions++;
      } else if (solutionValues.includes(combination[controlId])) {
        correctValuesWrongPosition++;
      }
    });

    // Check rules
    let ruleViolations = [];
    if (rules.dependency) {
      const dep = rules.dependency;
      if (dep.type === 'sum_equals') {
        const sum = dep.controls.reduce((acc, controlId) => {
          return acc + parseInt(combination[controlId] || '0');
        }, 0);
        if (sum % 10 !== dep.target) {
          ruleViolations.push(`Sum of dials must equal ${dep.target} (mod 10)`);
        }
      }
    }

    if (rules.conditional) {
      const cond = rules.conditional;
      if (combination[cond.condition.control] === cond.condition.value) {
        if (combination[cond.effect.control] !== cond.effect.mustBe) {
          ruleViolations.push(`When ${cond.condition.control} is ${cond.condition.value}, ${cond.effect.control} must be ${cond.effect.mustBe}`);
        }
      }
    }

    // Generate feedback based on difficulty
    const settings = difficultySettings[difficulty];
    if (settings.feedbackDetail === 'high') {
      feedback.push(`${correctPositions} correct positions`);
      if (correctValuesWrongPosition > 0) {
        feedback.push(`${correctValuesWrongPosition} correct values in wrong positions`);
      }
      feedback = feedback.concat(ruleViolations);
    } else if (settings.feedbackDetail === 'medium') {
      if (correctPositions > 0) feedback.push(`${correctPositions} positions correct`);
      if (ruleViolations.length > 0) feedback.push('Rule violation detected');
    } else {
      if (correctPositions === Object.keys(solution).length && ruleViolations.length === 0) {
        feedback.push('Perfect match!');
      } else if (correctPositions > Object.keys(solution).length / 2) {
        feedback.push('Getting closer...');
      } else {
        feedback.push('Try a different approach');
      }
    }

    const isCorrect = correctPositions === Object.keys(solution).length && ruleViolations.length === 0;
    
    return {
      isCorrect,
      feedback: feedback.join('. '),
      correctPositions,
      correctValuesWrongPosition,
      ruleViolations
    };
  }, [difficulty]);

  // Submit combination
  const submitCombination = useCallback(() => {
    if (gameState !== 'playing' || lockUnlocked) return;

    const responseTime = Date.now() - lockStartTime;
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    const result = checkCombination(currentCombination, lockConfiguration);
    
    // Add to attempt history
    const attempt = {
      combination: { ...currentCombination },
      feedback: result.feedback,
      timestamp: Date.now(),
      attemptNumber: lockConfiguration.attempts + 1
    };

    setAttemptHistory(prev => [...prev, attempt]);
    setLockConfiguration(prev => ({ ...prev, attempts: prev.attempts + 1 }));

    setFeedback(result.feedback);
    setShowFeedback(true);

    if (result.isCorrect) {
      setFeedbackType('correct');
      setLockUnlocked(true);
      setAnimatingUnlock(true);
      setSolvedLocks(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });

      setTimeout(() => {
        setAnimatingUnlock(false);
        if (currentLock + 1 >= difficultySettings[difficulty].lockCount) {
          setGameState('finished');
          setShowCompletionModal(true);
        } else {
          setCurrentLock(prev => prev + 1);
          initializeLock(currentLock + 1);
        }
      }, 3000);
    } else {
      setFeedbackType('incorrect');
      
      // Check if max attempts reached
      if (lockConfiguration.attempts + 1 >= difficultySettings[difficulty].maxAttempts) {
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
            setCurrentLock(prev => prev + 1);
            initializeLock(currentLock + 1);
          }
        }, 2500);
      }

      setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    }
  }, [gameState, lockUnlocked, currentCombination, lockConfiguration, lockStartTime, currentLock, lives, checkCombination]);

  // Initialize lock
  const initializeLock = useCallback((lockNumber) => {
    const config = generateLockConfiguration(lockNumber, difficulty);
    setLockConfiguration(config);
    
    // Initialize combination with first values
    const initialCombination = {};
    config.controls.forEach(control => {
      initialCombination[control.id] = control.values[0];
    });
    setCurrentCombination(initialCombination);
    
    setAttemptHistory([]);
    setShowFeedback(false);
    setLockUnlocked(false);
    setAnimatingUnlock(false);
    setLockStartTime(Date.now());
  }, [difficulty, generateLockConfiguration]);

  // Use hint
  const useHint = useCallback(() => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || lockUnlocked) return;

    setHintsUsed(prev => prev + 1);
    
    const { solution, controls, rules } = lockConfiguration;
    let message = '';

    // Provide different types of hints
    if (hintsUsed === 0) {
      // First hint: reveal one correct position
      const randomControl = controls[Math.floor(Math.random() * controls.length)];
      message = `${randomControl.label} should be set to ${solution[randomControl.id]}`;
    } else if (hintsUsed === 1 && rules.dependency) {
      // Second hint: reveal dependency rule
      message = 'Some controls are mathematically related. Check if their sum has significance.';
    } else {
      // General hint
      message = 'Pay attention to the feedback patterns. Each clue builds on the previous attempts.';
    }

    setHintMessage(message);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 4000);
  }, [hintsUsed, maxHints, gameState, lockUnlocked, lockConfiguration]);

  // Reset current lock
  const resetLock = () => {
    if (gameState === 'playing' && !lockUnlocked) {
      initializeLock(currentLock);
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
    setCurrentLock(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setSolvedLocks(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
    setShowFeedback(false);
    setShowHint(false);
    
    initializeLock(0);
  }, [difficulty, initializeLock]);

  const handleStart = () => {
    initializeGame();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    currentLock: currentLock + 1,
    totalLocks: difficultySettings[difficulty].lockCount,
    streak: maxStreak,
    lives,
    hintsUsed,
    solvedLocks,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    attemptsOnCurrentLock: lockConfiguration.attempts || 0,
    maxAttemptsPerLock: difficultySettings[difficulty].maxAttempts
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Locksmith Logic"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Locksmith Logic
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
                      🔐 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Crack digital locks by deducing the correct combination through logical feedback and pattern recognition.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Controls
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Rotating dials with numbers/colors/symbols</li>
                      <li>• Toggle switches (ON/OFF)</li>
                      <li>• Sliders with position values</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 25 points per lock</li>
                      <li>• Moderate: 28 points per lock</li>
                      <li>• Hard: 40 points per lock</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔓 Difficulty
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 3 controls, detailed feedback</li>
                      <li>• Moderate: 4 controls, dependencies</li>
                      <li>• Hard: 5 controls, conditional logic</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Logic Puzzle"
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
                  disabled={hintsUsed >= maxHints || lockUnlocked}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    hintsUsed >= maxHints || lockUnlocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <Lightbulb className="h-4 w-4" />
                  Hint ({maxHints - hintsUsed})
                </button>
                <button
                  onClick={resetLock}
                  disabled={lockUnlocked}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    lockUnlocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Lock
                </button>
                <button
                  onClick={submitCombination}
                  disabled={lockUnlocked}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                    lockUnlocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <Key className="h-4 w-4" />
                  Try Combination
                </button>
              </>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Lock
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLock + 1}/{difficultySettings[difficulty].lockCount}
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
                Attempts
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {lockConfiguration.attempts || 0}/{difficultySettings[difficulty].maxAttempts}
              </div>
            </div>
          </div>

          {/* Lock Status */}
          <div className="w-full max-w-4xl mb-6">
            <div className={`border rounded-lg p-4 text-center transition-all duration-500 ${
              lockUnlocked 
                ? 'bg-green-100 border-green-300' 
                : 'bg-gray-100 border-gray-300'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {lockUnlocked ? (
                  <>
                    <Unlock className={`h-6 w-6 text-green-800 ${animatingUnlock ? 'animate-bounce' : ''}`} />
                    <span className="font-semibold text-green-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Lock #{currentLock + 1} - UNLOCKED!
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="h-6 w-6 text-gray-800" />
                    <span className="font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Lock #{currentLock + 1} - {difficulty} Level
                    </span>
                  </>
                )}
              </div>
              <p className={`${lockUnlocked ? 'text-green-700' : 'text-gray-700'}`} 
                 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {lockUnlocked 
                  ? 'Excellent deduction! Moving to next lock...'
                  : `Adjust the controls and submit your combination. ${difficultySettings[difficulty].maxAttempts - (lockConfiguration.attempts || 0)} attempts remaining.`
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

          {/* Lock Interface */}
          <div className="relative w-full max-w-4xl mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-4 border-gray-600">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Digital Lock #{currentLock + 1}
                </h3>
                <div className="text-gray-300 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {difficulty} Mode - {lockConfiguration.controls?.length || 0} Controls
                </div>
              </div>

              {/* Lock Controls */}
              {lockConfiguration.controls && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {lockConfiguration.controls.map((control) => (
                    <div key={control.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="text-white text-center mb-3 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {control.label}
                      </div>
                      
                      {control.type === 'toggle' ? (
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleControlChange(control.id, currentCombination[control.id] === 'ON' ? 'OFF' : 'ON')}
                            disabled={lockUnlocked}
                            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                              currentCombination[control.id] === 'ON'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            } ${lockUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            {currentCombination[control.id] || 'OFF'}
                          </button>
                        </div>
                      ) : control.type === 'slider' ? (
                        <div className="px-2">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={parseInt(currentCombination[control.id] || '1')}
                            onChange={(e) => handleControlChange(control.id, e.target.value)}
                            disabled={lockUnlocked}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-center text-white mt-2 text-lg font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {currentCombination[control.id] || '1'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-2">
                          {control.values.map((value) => (
                            <button
                              key={value}
                              onClick={() => handleControlChange(control.id, value)}
                              disabled={lockUnlocked}
                              className={`px-3 py-2 rounded transition-all duration-200 font-medium ${
                                currentCombination[control.id] === value
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                              } ${lockUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Current Combination Display */}
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-white text-center mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Current Combination:
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                  {lockConfiguration.controls?.map((control) => (
                    <div key={control.id} className="text-center">
                      <div className="text-gray-400 text-xs mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {control.label}
                      </div>
                      <div className="bg-gray-700 px-3 py-2 rounded text-white font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {currentCombination[control.id] || control.values[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg mb-6 ${
              feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Settings className="h-6 w-6 text-blue-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Lock Cracked!' : 'Analysis Results'}
                </div>
              </div>
              <div className="text-sm mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedback}
              </div>
              {feedbackType === 'correct' && (
                <div className="text-green-700 font-medium mb-2">
                  +{difficultySettings[difficulty].pointsPerLock} points earned!
                </div>
              )}
            </div>
          )}

          {/* Attempt History */}
          {attemptHistory.length > 0 && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-gray-800 text-center mb-3 font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Attempt History:
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {attemptHistory.slice(-3).map((attempt, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-white rounded p-2" 
                         style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Attempt #{attempt.attemptNumber}:</span>
                        <span className="text-gray-500">
                          {Object.values(attempt.combination).join(' - ')}
                        </span>
                      </div>
                      <div className="text-gray-700 mt-1">{attempt.feedback}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Adjust each control to find the correct combination. Use the feedback from each attempt to deduce the lock's hidden rules and constraints.
            </p>
            <div className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].lockCount} locks | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              {difficultySettings[difficulty].maxAttempts} attempts per lock |
              {difficultySettings[difficulty].pointsPerLock} points per lock
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

export default LocksmithLogicGame;