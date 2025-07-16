import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb, CheckCircle, XCircle, BarChart3, DollarSign } from 'lucide-react';

const ResourceAllocationStrategyGame = () => {
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
  const [completedScenarios, setCompletedScenarios] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [scenarioStartTime, setScenarioStartTime] = useState(0);

  // Game state
  const [currentScenario, setCurrentScenario] = useState(null);
  const [allocations, setAllocations] = useState({});
  const [totalBudget, setTotalBudget] = useState(100);
  const [usedBudget, setUsedBudget] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [constraints, setConstraints] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Scenario templates
  const scenarioTemplates = {
    easy: [
      {
        id: 1,
        title: "School Budget Planning",
        description: "Allocate the school's annual budget across different departments",
        budget: 100,
        categories: [
          { id: 'education', name: 'Education', min: 30, max: 60, optimal: 45, weight: 0.4, icon: '📚' },
          { id: 'facilities', name: 'Facilities', min: 15, max: 40, optimal: 25, weight: 0.3, icon: '🏫' },
          { id: 'sports', name: 'Sports', min: 10, max: 30, optimal: 20, weight: 0.2, icon: '⚽' },
          { id: 'admin', name: 'Administration', min: 5, max: 20, optimal: 10, weight: 0.1, icon: '📋' }
        ],
        constraints: [
          { type: 'minimum', category: 'education', value: 30, message: 'Education must receive at least 30% of budget' },
          { type: 'ratio', categories: ['education', 'sports'], ratio: 2, message: 'Education should get at least 2x more than Sports' }
        ]
      },
      {
        id: 2,
        title: "Family Monthly Budget",
        description: "Distribute monthly income across household expenses",
        budget: 100,
        categories: [
          { id: 'housing', name: 'Housing', min: 25, max: 50, optimal: 35, weight: 0.35, icon: '🏠' },
          { id: 'food', name: 'Food', min: 15, max: 30, optimal: 20, weight: 0.25, icon: '🍽️' },
          { id: 'transport', name: 'Transport', min: 10, max: 25, optimal: 15, weight: 0.2, icon: '🚗' },
          { id: 'savings', name: 'Savings', min: 10, max: 40, optimal: 20, weight: 0.15, icon: '💰' },
          { id: 'entertainment', name: 'Entertainment', min: 5, max: 20, optimal: 10, weight: 0.05, icon: '🎬' }
        ],
        constraints: [
          { type: 'minimum', category: 'savings', value: 10, message: 'Must save at least 10% of income' },
          { type: 'maximum', category: 'entertainment', value: 15, message: 'Entertainment should not exceed 15%' }
        ]
      }
    ],
    moderate: [
      {
        id: 3,
        title: "Startup Investment Strategy",
        description: "Allocate investment funds across business areas for maximum growth",
        budget: 100,
        categories: [
          { id: 'product', name: 'Product Development', min: 20, max: 50, optimal: 35, weight: 0.3, icon: '💡' },
          { id: 'marketing', name: 'Marketing', min: 15, max: 40, optimal: 25, weight: 0.25, icon: '📢' },
          { id: 'hiring', name: 'Hiring', min: 15, max: 35, optimal: 20, weight: 0.2, icon: '👥' },
          { id: 'operations', name: 'Operations', min: 10, max: 25, optimal: 15, weight: 0.15, icon: '⚙️' },
          { id: 'legal', name: 'Legal & Compliance', min: 3, max: 15, optimal: 5, weight: 0.1, icon: '⚖️' }
        ],
        constraints: [
          { type: 'minimum', category: 'product', value: 25, message: 'Product development needs at least 25%' },
          { type: 'ratio', categories: ['marketing', 'hiring'], ratio: 1.2, message: 'Marketing should be 20% more than hiring' },
          { type: 'combined_max', categories: ['legal', 'operations'], value: 25, message: 'Legal + Operations should not exceed 25%' }
        ]
      },
      {
        id: 4,
        title: "Hospital Resource Management",
        description: "Distribute hospital resources to optimize patient care",
        budget: 100,
        categories: [
          { id: 'medical', name: 'Medical Staff', min: 35, max: 55, optimal: 45, weight: 0.4, icon: '👨‍⚕️' },
          { id: 'equipment', name: 'Equipment', min: 20, max: 35, optimal: 25, weight: 0.25, icon: '🏥' },
          { id: 'research', name: 'Research', min: 5, max: 20, optimal: 10, weight: 0.15, icon: '🔬' },
          { id: 'admin', name: 'Administration', min: 8, max: 20, optimal: 12, weight: 0.1, icon: '📊' },
          { id: 'maintenance', name: 'Maintenance', min: 5, max: 15, optimal: 8, weight: 0.1, icon: '🔧' }
        ],
        constraints: [
          { type: 'minimum', category: 'medical', value: 40, message: 'Medical staff must get at least 40%' },
          { type: 'ratio', categories: ['medical', 'admin'], ratio: 3, message: 'Medical should get 3x more than admin' }
        ]
      }
    ],
    hard: [
      {
        id: 5,
        title: "National Defense Budget",
        description: "Allocate defense budget across military branches and priorities",
        budget: 100,
        categories: [
          { id: 'army', name: 'Army', min: 20, max: 40, optimal: 30, weight: 0.25, icon: '🪖' },
          { id: 'navy', name: 'Navy', min: 15, max: 35, optimal: 25, weight: 0.2, icon: '⚓' },
          { id: 'airforce', name: 'Air Force', min: 15, max: 35, optimal: 25, weight: 0.2, icon: '✈️' },
          { id: 'cyber', name: 'Cyber Security', min: 8, max: 25, optimal: 15, weight: 0.15, icon: '🛡️' },
          { id: 'intelligence', name: 'Intelligence', min: 5, max: 20, optimal: 10, weight: 0.1, icon: '🕵️' },
          { id: 'veterans', name: 'Veterans Affairs', min: 3, max: 15, optimal: 8, weight: 0.1, icon: '🎖️' }
        ],
        constraints: [
          { type: 'balanced', categories: ['army', 'navy', 'airforce'], tolerance: 10, message: 'Military branches should be balanced (within 10%)' },
          { type: 'minimum', category: 'cyber', value: 10, message: 'Cyber security needs at least 10%' },
          { type: 'combined_min', categories: ['intelligence', 'cyber'], value: 20, message: 'Intelligence + Cyber must be at least 20%' }
        ]
      },
      {
        id: 6,
        title: "Climate Action Fund",
        description: "Distribute climate funding across environmental initiatives",
        budget: 100,
        categories: [
          { id: 'renewable', name: 'Renewable Energy', min: 25, max: 45, optimal: 35, weight: 0.3, icon: '🌱' },
          { id: 'transport', name: 'Green Transport', min: 15, max: 30, optimal: 20, weight: 0.2, icon: '🚊' },
          { id: 'forest', name: 'Forest Conservation', min: 10, max: 25, optimal: 15, weight: 0.15, icon: '🌳' },
          { id: 'research', name: 'Climate Research', min: 8, max: 20, optimal: 12, weight: 0.15, icon: '🔬' },
          { id: 'adaptation', name: 'Climate Adaptation', min: 10, max: 25, optimal: 15, weight: 0.15, icon: '🏔️' },
          { id: 'education', name: 'Environmental Education', min: 3, max: 12, optimal: 8, weight: 0.05, icon: '📚' }
        ],
        constraints: [
          { type: 'minimum', category: 'renewable', value: 30, message: 'Renewable energy needs at least 30%' },
          { type: 'ratio', categories: ['renewable', 'research'], ratio: 2.5, message: 'Renewable should get 2.5x more than research' },
          { type: 'combined_max', categories: ['education', 'research'], value: 25, message: 'Education + Research should not exceed 25%' }
        ]
      }
    ]
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 120, lives: 5, hints: 3, categories: 4, constraints: 2 },
    Moderate: { timeLimit: 100, lives: 4, hints: 2, categories: 5, constraints: 3 },
    Hard: { timeLimit: 80, lives: 3, hints: 1, categories: 6, constraints: 4 }
  };

  // Generate new scenario
  const generateNewScenario = useCallback(() => {
    const difficultyLevel = difficulty.toLowerCase();
    const scenarios = scenarioTemplates[difficultyLevel];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    setCurrentScenario(scenario);
    setTotalBudget(scenario.budget);
    setConstraints(scenario.constraints);
    
    // Initialize allocations
    const initialAllocations = {};
    scenario.categories.forEach(category => {
      initialAllocations[category.id] = category.min;
    });
    setAllocations(initialAllocations);
    
    // Calculate initial used budget
    const initialUsed = Object.values(initialAllocations).reduce((sum, val) => sum + val, 0);
    setUsedBudget(initialUsed);
    
    setShowFeedback(false);
    setPerformanceMetrics({});
    setScenarioStartTime(Date.now());
  }, [difficulty]);

  // Handle allocation change
  const handleAllocationChange = (categoryId, value) => {
    if (gameState !== 'playing' || showFeedback) return;
    
    const numValue = parseInt(value) || 0;
    const category = currentScenario.categories.find(cat => cat.id === categoryId);
    
    // Enforce min/max constraints
    const clampedValue = Math.max(category.min, Math.min(category.max, numValue));
    
    const newAllocations = { ...allocations, [categoryId]: clampedValue };
    const newUsedBudget = Object.values(newAllocations).reduce((sum, val) => sum + val, 0);
    
    // Don't allow exceeding budget
    if (newUsedBudget <= totalBudget) {
      setAllocations(newAllocations);
      setUsedBudget(newUsedBudget);
    }
  };

  // Validate constraints
  const validateConstraints = (allocs) => {
    const violations = [];
    
    constraints.forEach(constraint => {
      switch (constraint.type) {
        case 'minimum':
          if (allocs[constraint.category] < constraint.value) {
            violations.push(constraint.message);
          }
          break;
          
        case 'maximum':
          if (allocs[constraint.category] > constraint.value) {
            violations.push(constraint.message);
          }
          break;
          
        case 'ratio':
          const [cat1, cat2] = constraint.categories;
          if (allocs[cat1] < allocs[cat2] * constraint.ratio) {
            violations.push(constraint.message);
          }
          break;
          
        case 'combined_min':
          const combinedMin = constraint.categories.reduce((sum, cat) => sum + allocs[cat], 0);
          if (combinedMin < constraint.value) {
            violations.push(constraint.message);
          }
          break;
          
        case 'combined_max':
          const combinedMax = constraint.categories.reduce((sum, cat) => sum + allocs[cat], 0);
          if (combinedMax > constraint.value) {
            violations.push(constraint.message);
          }
          break;
          
        case 'balanced':
          const values = constraint.categories.map(cat => allocs[cat]);
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
          const isBalanced = values.every(val => Math.abs(val - avg) <= constraint.tolerance);
          if (!isBalanced) {
            violations.push(constraint.message);
          }
          break;
      }
    });
    
    return violations;
  };

  // Calculate performance score
  const calculatePerformance = (allocs) => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const categoryScores = {};
    
    currentScenario.categories.forEach(category => {
      const allocation = allocs[category.id];
      const optimal = category.optimal;
      const weight = category.weight;
      
      // Calculate distance from optimal (0-1, where 1 is optimal)
      const maxDistance = Math.max(optimal - category.min, category.max - optimal);
      const actualDistance = Math.abs(allocation - optimal);
      const normalizedScore = Math.max(0, 1 - (actualDistance / maxDistance));
      
      const weightedScore = normalizedScore * weight * 100;
      categoryScores[category.id] = {
        score: Math.round(weightedScore),
        optimal: optimal,
        actual: allocation,
        efficiency: Math.round(normalizedScore * 100)
      };
      
      totalScore += weightedScore;
      maxPossibleScore += weight * 100;
    });
    
    return {
      totalScore: Math.round(totalScore),
      maxScore: Math.round(maxPossibleScore),
      percentage: Math.round((totalScore / maxPossibleScore) * 100),
      categoryScores
    };
  };

  // Submit allocation
  const handleSubmit = () => {
    if (gameState !== 'playing' || showFeedback) return;
    
    const responseTime = Date.now() - scenarioStartTime;
    const violations = validateConstraints(allocations);
    const performance = calculatePerformance(allocations);
    
    setShowFeedback(true);
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);
    setPerformanceMetrics(performance);
    
    // Check if allocation is successful (no violations and decent performance)
    const isSuccessful = violations.length === 0 && performance.percentage >= 70;
    
    if (isSuccessful) {
      setFeedbackType('success');
      setFeedbackMessage(`Excellent allocation! Performance: ${performance.percentage}%`);
      setCompletedScenarios(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setCurrentLevel(prev => prev + 1);
      
      setTimeout(() => {
        generateNewScenario();
      }, 3000);
    } else {
      setFeedbackType('failure');
      if (violations.length > 0) {
        setFeedbackMessage(`Constraint violations: ${violations.join(', ')}`);
      } else {
        setFeedbackMessage(`Poor allocation efficiency: ${performance.percentage}%. Try to get closer to optimal values.`);
      }
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('finished');
          setShowCompletionModal(true);
        }
        return newLives;
      });
      
      setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    }
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;
    
    setHintsUsed(prev => prev + 1);
    
    // Find the category that's furthest from optimal
    let maxDeviation = 0;
    let hintCategory = null;
    
    currentScenario.categories.forEach(category => {
      const deviation = Math.abs(allocations[category.id] - category.optimal);
      if (deviation > maxDeviation) {
        maxDeviation = deviation;
        hintCategory = category;
      }
    });
    
    if (hintCategory) {
      const direction = allocations[hintCategory.id] < hintCategory.optimal ? 'increase' : 'decrease';
      alert(`Hint: Try to ${direction} allocation for ${hintCategory.name}. Optimal is around ${hintCategory.optimal}%.`);
    }
  };

  // Calculate score
  const calculateScore = useCallback(() => {
    if (totalAttempts === 0) return 0;
    
    const settings = difficultySettings[difficulty];
    const successRate = completedScenarios / totalAttempts;
    const avgResponseTime = totalResponseTime / totalAttempts / 1000;
    
    // Base score from success rate (0-90 points)
    let baseScore = successRate * 90;
    
    // Time bonus (max 25 points)
    const idealTime = difficulty === 'Easy' ? 30 : difficulty === 'Moderate' ? 35 : 40;
    const timeBonus = Math.max(0, Math.min(25, (idealTime - avgResponseTime) * 1.5));
    
    // Streak bonus (max 30 points)
    const streakBonus = Math.min(maxStreak * 3, 30);
    
    // Level progression bonus (max 20 points)
    const levelBonus = Math.min(currentLevel * 1.5, 20);
    
    // Lives bonus (max 15 points)
    const livesBonus = (lives / settings.lives) * 15;
    
    // Hints penalty (subtract up to 15 points)
    const hintsPenalty = (hintsUsed / settings.hints) * 15;
    
    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;
    
    // Time remaining bonus (max 15 points)
    const timeRemainingBonus = Math.min(15, (timeRemaining / settings.timeLimit) * 15);
    
    let finalScore = (baseScore + timeBonus + streakBonus + levelBonus + livesBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;
    
    // Apply final modifier to make 200 very challenging
    finalScore = finalScore * 0.81;
    
    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [completedScenarios, totalAttempts, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

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
    setCompletedScenarios(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    generateNewScenario();
  };

  const handleReset = () => {
    initializeGame();
    setCurrentScenario(null);
    setAllocations({});
    setUsedBudget(0);
    setShowFeedback(false);
    setPerformanceMetrics({});
    setConstraints([]);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    lives,
    hintsUsed,
    completedScenarios,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    successRate: totalAttempts > 0 ? Math.round((completedScenarios / totalAttempts) * 100) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      
      <GameFramework
        gameTitle="Resource Allocation Strategy"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                How to Play Resource Allocation Strategy
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Strategically distribute limited resources across competing demands while satisfying constraints and maximizing efficiency.
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    ⚖️ Strategy Elements
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Budget constraints</li>
                    <li>• Minimum/maximum limits</li>
                    <li>• Ratio requirements</li>
                    <li>• Optimal efficiency targets</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    📊 Scoring
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Efficiency optimization</li>
                    <li>• Constraint compliance</li>
                    <li>• Speed bonuses</li>
                    <li>• Streak multipliers</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    💡 Strategy Tips
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Balance all constraints</li>
                    <li>• Aim for optimal values</li>
                    <li>• Use hints for guidance</li>
                    <li>• Plan before allocating</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Critical Thinking"
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
                  onClick={handleSubmit}
                  disabled={usedBudget !== totalBudget}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    usedBudget === totalBudget
                      ? 'bg-[#FF6B3E] text-white hover:bg-[#e55a35]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <Target className="h-4 w-4" />
                  Submit Allocation
                </button>
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
                {currentLevel}
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
                Success Rate
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalAttempts > 0 ? Math.round((completedScenarios / totalAttempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          {currentScenario && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Budget: {usedBudget}/{totalBudget}
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${usedBudget === totalBudget ? 'text-green-600' : usedBudget > totalBudget ? 'text-red-600' : 'text-yellow-600'}`}>
                    {usedBudget === totalBudget ? 'Complete' : usedBudget > totalBudget ? 'Over Budget!' : `${totalBudget - usedBudget} Remaining`}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      usedBudget > totalBudget ? 'bg-red-500' : usedBudget === totalBudget ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((usedBudget / totalBudget) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Scenario Display */}
          {currentScenario && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentScenario.title}
                </h3>
                <p className="text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentScenario.description}
                </p>
                
                {/* Constraints */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Constraints:
                  </h4>
                  <div className="space-y-1">
                    {constraints.map((constraint, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                          {constraint.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Allocation Controls */}
          {currentScenario && (
            <div className="w-full max-w-4xl mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentScenario.categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Range: {category.min}% - {category.max}% | Optimal: {category.optimal}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {allocations[category.id] || 0}%
                        </div>
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min={category.min}
                      max={category.max}
                      value={allocations[category.id] || category.min}
                      onChange={(e) => handleAllocationChange(category.id, e.target.value)}
                      disabled={showFeedback}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <span>{category.min}%</span>
                      <span className="text-green-600 font-medium">{category.optimal}%</span>
                      <span>{category.max}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {showFeedback && performanceMetrics.categoryScores && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Performance Analysis
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(performanceMetrics.categoryScores).map(([categoryId, metrics]) => {
                    const category = currentScenario.categories.find(cat => cat.id === categoryId);
                    return (
                      <div key={categoryId} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {category.name}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Allocated:</span>
                            <span className="font-medium">{metrics.actual}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Optimal:</span>
                            <span className="text-green-600">{metrics.optimal}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Efficiency:</span>
                            <span className={`font-medium ${metrics.efficiency >= 80 ? 'text-green-600' : metrics.efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {metrics.efficiency}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Overall Performance: {performanceMetrics.percentage}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg ${
              feedbackType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'success' ? 'Allocation Successful!' : 'Allocation Failed!'}
                </div>
              </div>
              <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackMessage}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Adjust the sliders to allocate your budget across categories. 
              Satisfy all constraints while maximizing efficiency. Submit when budget is fully allocated.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].categories} categories | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints
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

export default ResourceAllocationStrategyGame;