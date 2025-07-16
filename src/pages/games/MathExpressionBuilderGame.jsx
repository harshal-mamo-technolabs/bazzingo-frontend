import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Calculator, Lightbulb, CheckCircle, XCircle, Plus, Minus, X, Divide } from 'lucide-react';

const MathExpressionBuilderGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [lives, setLives] = useState(3);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalResponseTime, setTotalResponseTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);

    // Game state
    const [targetValue, setTargetValue] = useState(0);
    const [availableNumbers, setAvailableNumbers] = useState([]);
    const [availableOperators, setAvailableOperators] = useState([]);
    const [currentExpression, setCurrentExpression] = useState([]);
    const [expressionResult, setExpressionResult] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [hintRevealed, setHintRevealed] = useState(false);
    const [possibleSolutions, setPossibleSolutions] = useState([]);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Operators with their symbols and functions
    const operators = {
        '+': { symbol: '+', icon: Plus, func: (a, b) => a + b, precedence: 1 },
        '-': { symbol: '-', icon: Minus, func: (a, b) => a - b, precedence: 1 },
        '*': { symbol: '×', icon: X, func: (a, b) => a * b, precedence: 2 },
        '/': { symbol: '÷', icon: Divide, func: (a, b) => b !== 0 ? a / b : null, precedence: 2 }
    };

    // Difficulty settings
    const difficultySettings = {
        Easy: {
            timeLimit: 120,
            lives: 3,
            hints: 3,
            numberCount: 4,
            numberRange: [1, 12],
            targetRange: [5, 50],
            operators: ['+', '-']
        },
        Moderate: {
            timeLimit: 100,
            lives: 3,
            hints: 2,
            numberCount: 5,
            numberRange: [1, 20],
            targetRange: [10, 100],
            operators: ['+', '-', '*']
        },
        Hard: {
            timeLimit: 80,
            lives: 2,
            hints: 1,
            numberCount: 6,
            numberRange: [1, 25],
            targetRange: [15, 200],
            operators: ['+', '-', '*', '/']
        }
    };

    // Evaluate mathematical expression with proper order of operations
    const evaluateExpression = useCallback((expression) => {
        if (expression.length === 0) return null;
        if (expression.length === 1 && typeof expression[0] === 'number') return expression[0];
        if (expression.length % 2 === 0) return null; // Must be odd length (number op number op number...)

        try {
            // Convert to postfix notation and evaluate
            const tokens = [...expression];
            const output = [];
            const operatorStack = [];

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];

                if (typeof token === 'number') {
                    output.push(token);
                } else if (operators[token]) {
                    while (
                        operatorStack.length > 0 &&
                        operators[operatorStack[operatorStack.length - 1]] &&
                        operators[operatorStack[operatorStack.length - 1]].precedence >= operators[token].precedence
                    ) {
                        output.push(operatorStack.pop());
                    }
                    operatorStack.push(token);
                }
            }

            while (operatorStack.length > 0) {
                output.push(operatorStack.pop());
            }

            // Evaluate postfix expression
            const stack = [];
            for (const token of output) {
                if (typeof token === 'number') {
                    stack.push(token);
                } else if (operators[token]) {
                    if (stack.length < 2) return null;
                    const b = stack.pop();
                    const a = stack.pop();
                    const result = operators[token].func(a, b);
                    if (result === null || !isFinite(result)) return null;
                    stack.push(result);
                }
            }

            return stack.length === 1 ? Math.round(stack[0] * 100) / 100 : null;
        } catch (error) {
            return null;
        }
    }, []);

    // Find all possible solutions for the current puzzle
    const findPossibleSolutions = useCallback((numbers, ops, target) => {
        const solutions = [];

        // Generate all possible expressions with the given numbers and operators
        const generateExpressions = (nums, operators, maxLength = 7) => {
            const expressions = [];

            const backtrack = (current, usedNums, usedOps) => {
                if (current.length >= maxLength || current.length > nums.length * 2 - 1) {
                    if (current.length % 2 === 1 && current.length >= 3) {
                        const result = evaluateExpression(current);
                        if (result === target) {
                            expressions.push([...current]);
                        }
                    }
                    return;
                }

                if (current.length % 2 === 0) {
                    // Add number
                    for (let i = 0; i < nums.length; i++) {
                        if (!usedNums[i]) {
                            usedNums[i] = true;
                            current.push(nums[i]);
                            backtrack(current, usedNums, usedOps);
                            current.pop();
                            usedNums[i] = false;
                        }
                    }
                } else {
                    // Add operator
                    for (const op of operators) {
                        current.push(op);
                        backtrack(current, usedNums, usedOps);
                        current.pop();
                    }
                }
            };

            backtrack([], new Array(nums.length).fill(false), {});
            return expressions;
        };

        return generateExpressions(numbers, ops).slice(0, 5); // Limit to 5 solutions
    }, [evaluateExpression]);

    // Generate new puzzle
    const generateNewPuzzle = useCallback(() => {
        const settings = difficultySettings[difficulty];

        // Generate random numbers
        const numbers = [];
        for (let i = 0; i < settings.numberCount; i++) {
            const num = Math.floor(Math.random() * (settings.numberRange[1] - settings.numberRange[0] + 1)) + settings.numberRange[0];
            numbers.push(num);
        }

        // Generate target value
        let target, solutions;
        let attempts = 0;

        do {
            target = Math.floor(Math.random() * (settings.targetRange[1] - settings.targetRange[0] + 1)) + settings.targetRange[0];
            solutions = findPossibleSolutions(numbers, settings.operators, target);
            attempts++;
        } while (solutions.length === 0 && attempts < 50);

        // If no solution found, create a simple one
        if (solutions.length === 0) {
            target = numbers[0] + numbers[1];
            solutions = [[numbers[0], '+', numbers[1]]];
        }

        setTargetValue(target);
        setAvailableNumbers(numbers);
        setAvailableOperators(settings.operators);
        setCurrentExpression([]);
        setExpressionResult(null);
        setShowFeedback(false);
        setHintRevealed(false);
        setPossibleSolutions(solutions);
        setQuestionStartTime(Date.now());
    }, [difficulty, findPossibleSolutions]);

    // Handle adding item to expression
    const addToExpression = (item) => {
        if (gameState !== 'playing' || showFeedback) return;

        const newExpression = [...currentExpression];
        const isNumber = typeof item === 'number';
        const needsNumber = newExpression.length % 2 === 0;

        if ((isNumber && needsNumber) || (!isNumber && !needsNumber)) {
            newExpression.push(item);
            setCurrentExpression(newExpression);

            // Calculate result
            const result = evaluateExpression(newExpression);
            setExpressionResult(result);
        }
    };

    // Remove last item from expression
    const removeLastItem = () => {
        if (gameState !== 'playing' || showFeedback || currentExpression.length === 0) return;

        const newExpression = currentExpression.slice(0, -1);
        setCurrentExpression(newExpression);
        setExpressionResult(evaluateExpression(newExpression));
    };

    // Clear expression
    const clearExpression = () => {
        if (gameState !== 'playing' || showFeedback) return;

        setCurrentExpression([]);
        setExpressionResult(null);
    };

    // Submit expression
    const submitExpression = useCallback(() => {
        if (gameState !== 'playing' || showFeedback || expressionResult === null) return;

        const responseTime = Date.now() - questionStartTime;
        setShowFeedback(true);
        setTotalQuestions(prev => prev + 1);
        setTotalResponseTime(prev => prev + responseTime);

        if (Math.abs(expressionResult - targetValue) < 0.01) {
            setFeedbackType('correct');
            setCorrectAnswers(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                setMaxStreak(current => Math.max(current, newStreak));
                return newStreak;
            });
            setCurrentLevel(prev => prev + 1);

            setTimeout(() => {
                generateNewPuzzle();
            }, 2500);
        } else {
            setFeedbackType('incorrect');
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
            }, 2000);
        }
    }, [gameState, showFeedback, expressionResult, targetValue, questionStartTime, generateNewPuzzle]);

    // Use hint
    const useHint = () => {
        if (hintsUsed >= maxHints || gameState !== 'playing' || hintRevealed) return;

        setHintsUsed(prev => prev + 1);
        setHintRevealed(true);
    };

    // Calculate score
    const calculateScore = useCallback(() => {
        if (totalQuestions === 0) return 0;

        const settings = difficultySettings[difficulty];
        const accuracyRate = correctAnswers / totalQuestions;
        const avgResponseTime = totalResponseTime / totalQuestions / 1000;

        // Base score from accuracy (0-110 points)
        let baseScore = accuracyRate * 110;

        // Time bonus (max 30 points)
        const idealTime = difficulty === 'Easy' ? 20 : difficulty === 'Moderate' ? 15 : 12;
        const timeBonus = Math.max(0, Math.min(30, (idealTime - avgResponseTime) * 2));

        // Streak bonus (max 25 points)
        const streakBonus = Math.min(maxStreak * 3, 25);

        // Level progression bonus (max 15 points)
        const levelBonus = Math.min(currentLevel * 1, 15);

        // Lives remaining bonus (max 10 points)
        const livesBonus = (lives / settings.lives) * 10;

        // Hints penalty (subtract up to 15 points)
        const hintsPenalty = (hintsUsed / settings.hints) * 15;

        // Difficulty multiplier
        const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.25;

        // Time remaining bonus (max 10 points)
        const timeRemainingBonus = Math.min(10, (timeRemaining / settings.timeLimit) * 10);

        let finalScore = (baseScore + timeBonus + streakBonus + levelBonus + livesBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;

        // Apply final modifier to make 200 very challenging
        finalScore = finalScore * 0.8;

        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [correctAnswers, totalQuestions, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty]);

    // Update score
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
        setCorrectAnswers(0);
        setTotalQuestions(0);
        setTotalResponseTime(0);
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        generateNewPuzzle();
    };

    const handleReset = () => {
        initializeGame();
        setTargetValue(0);
        setAvailableNumbers([]);
        setAvailableOperators([]);
        setCurrentExpression([]);
        setExpressionResult(null);
        setShowFeedback(false);
    };

    const handleGameComplete = (payload) => {
        console.log('Game completed:', payload);
    };

    const customStats = {
        currentLevel,
        streak: maxStreak,
        lives,
        hintsUsed,
        correctAnswers,
        totalQuestions,
        averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0
    };

    return (
        <div>
            <Header unreadCount={3} />

            <GameFramework
                gameTitle="Mathematical Expression Builder"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                How to Play Mathematical Expression Builder
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 Objective
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Use the given numbers and operators to build a mathematical expression that equals the target value.
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🔢 How to Play
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Click numbers and operators to build expression</li>
                                        <li>• Follow order of operations (PEMDAS)</li>
                                        <li>• Submit when result matches target</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Scoring
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Accuracy-based scoring</li>
                                        <li>• Time & streak bonuses</li>
                                        <li>• Difficulty multipliers</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💡 Tips
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Remember order of operations</li>
                                        <li>• Try different combinations</li>
                                        <li>• Use hints for complex puzzles</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Problem Solving"
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
                            <button
                                onClick={useHint}
                                disabled={hintsUsed >= maxHints || hintRevealed}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints || hintRevealed
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
                                Hints
                            </div>
                            <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {maxHints - hintsUsed}
                            </div>
                        </div>
                    </div>

                    {/* Target Value */}
                    {targetValue > 0 && (
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Target Value
                            </h3>
                            <div className="bg-blue-100 rounded-lg p-4 inline-block border-2 border-blue-300">
                                <div className="text-3xl font-bold text-blue-800">{targetValue}</div>
                            </div>
                        </div>
                    )}

                    {/* Expression Builder */}
                    <div className="w-full max-w-4xl mb-6">
                        <h4 className="text-center text-md font-medium text-gray-700 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Build Your Expression
                        </h4>

                        {/* Current Expression Display */}
                        <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[80px] flex items-center justify-center">
                            <div className="flex items-center gap-2 flex-wrap">
                                {currentExpression.length === 0 ? (
                                    <span className="text-gray-500 text-lg">Click numbers and operators below...</span>
                                ) : (
                                    currentExpression.map((item, index) => (
                                        <span
                                            key={index}
                                            className="bg-white px-3 py-2 rounded-lg border-2 border-gray-300 text-xl font-semibold"
                                        >
                                            {typeof item === 'number' ? item : operators[item]?.symbol}
                                        </span>
                                    ))
                                )}
                                {expressionResult !== null && currentExpression.length > 0 && (
                                    <>
                                        <span className="text-2xl font-bold text-gray-600 mx-2">=</span>
                                        <span className={`text-2xl font-bold px-3 py-2 rounded-lg ${Math.abs(expressionResult - targetValue) < 0.01
                                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                            : 'bg-red-100 text-red-800 border-2 border-red-300'
                                            }`}>
                                            {expressionResult}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Expression Controls */}
                        <div className="flex justify-center gap-2 mb-4">
                            <button
                                onClick={removeLastItem}
                                disabled={currentExpression.length === 0}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                            >
                                Remove Last
                            </button>
                            <button
                                onClick={clearExpression}
                                disabled={currentExpression.length === 0}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                            >
                                Clear All
                            </button>
                            <button
                                onClick={submitExpression}
                                disabled={expressionResult === null || Math.abs(expressionResult - targetValue) >= 0.01}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                            >
                                <Calculator className="h-4 w-4" />
                                Submit
                            </button>
                        </div>
                    </div>

                    {/* Available Numbers */}
                    {availableNumbers.length > 0 && (
                        <div className="w-full max-w-4xl mb-4">
                            <h4 className="text-center text-md font-medium text-gray-700 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Available Numbers
                            </h4>
                            <div className="flex justify-center gap-3 flex-wrap">
                                {availableNumbers.map((number, index) => (
                                    <button
                                        key={index}
                                        onClick={() => addToExpression(number)}
                                        disabled={showFeedback || (currentExpression.length > 0 && currentExpression.length % 2 === 1)}
                                        className="w-16 h-16 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-xl font-bold transition-colors"
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Available Operators */}
                    {availableOperators.length > 0 && (
                        <div className="w-full max-w-4xl mb-6">
                            <h4 className="text-center text-md font-medium text-gray-700 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Available Operators
                            </h4>
                            <div className="flex justify-center gap-3 flex-wrap">
                                {availableOperators.map((op, index) => {
                                    const OpIcon = operators[op].icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => addToExpression(op)}
                                            disabled={showFeedback || currentExpression.length === 0 || currentExpression.length % 2 === 0}
                                            className="w-16 h-16 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-xl font-bold transition-colors flex items-center justify-center"
                                        >
                                            <OpIcon className="h-6 w-6" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Hint Display */}
                    {hintRevealed && possibleSolutions.length > 0 && (
                        <div className="w-full max-w-4xl mb-6">
                            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-800">Hint - Possible Solution:</span>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white rounded-lg p-3 inline-block">
                                        <span className="text-lg font-mono text-gray-800">
                                            {possibleSolutions[0].map((item, index) => (
                                                <span key={index}>
                                                    {typeof item === 'number' ? item : ` ${operators[item]?.symbol} `}
                                                </span>
                                            ))} = {targetValue}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {showFeedback && (
                        <div className={`w-full max-w-2xl text-center p-4 rounded-lg ${feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                {feedbackType === 'correct' ? (
                                    <CheckCircle className="h-5 w-5" />
                                ) : (
                                    <XCircle className="h-5 w-5" />
                                )}
                                <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    {feedbackType === 'correct' ? 'Excellent!' : 'Not Quite Right!'}
                                </div>
                            </div>
                            <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                {feedbackType === 'correct'
                                    ? `Perfect! Your expression equals ${targetValue}.`
                                    : `Your expression equals ${expressionResult}, but the target is ${targetValue}.`
                                }
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="text-center max-w-2xl mt-6">
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                            Build mathematical expressions using the available numbers and operators.
                            Remember to follow the order of operations (multiplication and division before addition and subtraction).
                        </p>
                        <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {difficulty} Mode: {difficultySettings[difficulty].numberCount} numbers |
                            {difficultySettings[difficulty].operators.map(op => operators[op].symbol).join(', ')} operators |
                            {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit
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

export default MathExpressionBuilderGame;