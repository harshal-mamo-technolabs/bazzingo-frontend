import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import {
    Brain,
    Lightbulb,
    CheckCircle,
    XCircle,
    Grid3X3,
    Zap,
    ChevronUp,
    ChevronDown,
    Target,
    Clock,
    Star,
    Award,
    TrendingUp
} from 'lucide-react';

const MatrixReasoningGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(300);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [lives, setLives] = useState(5);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalResponseTime, setTotalResponseTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);

    // Game state
    const [currentMatrix, setCurrentMatrix] = useState(null);
    const [answerOptions, setAnswerOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showMatrixInstructions, setShowMatrixInstructions] = useState(true);
    const [isAnswering, setIsAnswering] = useState(false);
    const [patternType, setPatternType] = useState('');

    // Difficulty settings
    const difficultySettings = {
        Easy: {
            timeLimit: 300,
            lives: 5,
            hints: 3,
            questionTime: 45,
            patterns: ['sequence', 'color', 'size'],
            description: 'Simple single-attribute patterns'
        },
        Medium: {
            timeLimit: 240,
            lives: 4,
            hints: 2,
            questionTime: 35,
            patterns: ['sequence', 'color', 'size', 'rotation', 'combination'],
            description: 'Two-attribute pattern combinations'
        },
        Hard: {
            timeLimit: 180,
            lives: 3,
            hints: 1,
            questionTime: 25,
            patterns: ['sequence', 'color', 'size', 'rotation', 'combination', 'complex'],
            description: 'Complex multi-attribute patterns'
        }
    };

    // Enhanced pattern elements
    const shapes = [
        { name: 'circle', symbol: '●', color: 'currentColor' },
        { name: 'square', symbol: '■', color: 'currentColor' },
        { name: 'triangle', symbol: '▲', color: 'currentColor' },
        { name: 'diamond', symbol: '♦', color: 'currentColor' },
        { name: 'star', symbol: '★', color: 'currentColor' },
        { name: 'heart', symbol: '♥', color: 'currentColor' }
    ];

    const colors = [
        { name: 'red', value: '#EF4444', light: '#FEE2E2' },
        { name: 'blue', value: '#3B82F6', light: '#DBEAFE' },
        { name: 'green', value: '#10B981', light: '#D1FAE5' },
        { name: 'purple', value: '#8B5CF6', light: '#EDE9FE' },
        { name: 'orange', value: '#F97316', light: '#FED7AA' },
        { name: 'pink', value: '#EC4899', light: '#FCE7F3' }
    ];

    const sizes = ['small', 'medium', 'large'];

    // Render a shape cell
    const renderShape = (shapeData, cellIndex, isOption = false, isAnimated = false, forceSize = null) => {
        if (!shapeData) return null;

        const { shape, color, size, count = 1 } = shapeData;
        const appliedSize = forceSize || size;

        const shapeObj = shapes.find(s => s.name === shape);
        const colorObj = colors.find(c => c.name === color);
        if (!shapeObj || !colorObj) return null;

        const sizeClasses = {
            small: isOption ? 'text-3xl' : 'text-4xl',
            medium: isOption ? 'text-4xl' : 'text-5xl',
            large: isOption ? 'text-5xl' : 'text-6xl'
        };

        const containerClass = `
      flex items-center justify-center gap-1 transition-all duration-300
      ${isAnimated ? 'animate-pulse' : ''}
    `;

        const shapeClass = `
      ${sizeClasses[size]} font-bold transition-all duration-300
      ${isAnimated ? 'transform hover:scale-110' : ''}
    `;

        const renderSingleShape = (idx = 0) => (
            <span
                key={idx}
                className={shapeClass}
                style={{
                    color: colorObj.value,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transform: isAnimated ? `rotate(${idx * 15}deg)` : 'none'
                }}
            >
                {shapeObj.symbol}
            </span>
        );

        if (count === 1) {
            return <div className={containerClass}>{renderSingleShape()}</div>;
        }
        return (
            <div className={containerClass}>
                {Array.from({ length: Math.min(count, 4) }, (_, i) => renderSingleShape(i))}
            </div>
        );
    };

    // Generate the matrix and correct answer
    const generateMatrix = useCallback(() => {
        const settings = difficultySettings[difficulty];
        const patternTypes = settings.patterns;
        const selectedPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        setPatternType(selectedPattern);

        let matrix = Array(9).fill(null);
        let correctAnswerData = null;

        switch (selectedPattern) {
            case 'sequence': {
                const shapeSequence = shapes.slice(0, 3);
                const baseColor = colors[Math.floor(Math.random() * colors.length)];
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const idx = row * 3 + col;
                        if (idx !== 8) {
                            matrix[idx] = {
                                shape: shapeSequence[col].name,
                                color: baseColor.name,
                                size: 'medium',
                                count: 1
                            };
                        }
                    }
                }
                correctAnswerData = {
                    shape: shapeSequence[2].name,
                    color: baseColor.name,
                    size: 'medium',
                    count: 1
                };
                break;
            }
            case 'color': {
                const colorSequence = colors.slice(0, 3);
                const baseShape = shapes[Math.floor(Math.random() * shapes.length)];
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const idx = row * 3 + col;
                        if (idx !== 8) {
                            matrix[idx] = {
                                shape: baseShape.name,
                                color: colorSequence[col].name,
                                size: 'medium',
                                count: 1
                            };
                        }
                    }
                }
                correctAnswerData = {
                    shape: baseShape.name,
                    color: colorSequence[2].name,
                    size: 'medium',
                    count: 1
                };
                break;
            }
            case 'size': {
                const sizeSequence = ['small', 'medium', 'large'];
                const shapeForSize = shapes[Math.floor(Math.random() * shapes.length)];
                const colorForSize = colors[Math.floor(Math.random() * colors.length)];
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const idx = row * 3 + col;
                        if (idx !== 8) {
                            matrix[idx] = {
                                shape: shapeForSize.name,
                                color: colorForSize.name,
                                size: sizeSequence[col],
                                count: 1
                            };
                        }
                    }
                }
                correctAnswerData = {
                    shape: shapeForSize.name,
                    color: colorForSize.name,
                    size: sizeSequence[2],
                    count: 1
                };
                break;
            }
            case 'rotation': {
                const countSequence = [1, 2, 3];
                const shapeForCount = shapes[Math.floor(Math.random() * shapes.length)];
                const colorForCount = colors[Math.floor(Math.random() * colors.length)];
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const idx = row * 3 + col;
                        if (idx !== 8) {
                            matrix[idx] = {
                                shape: shapeForCount.name,
                                color: colorForCount.name,
                                size: 'small',
                                count: countSequence[col]
                            };
                        }
                    }
                }
                correctAnswerData = {
                    shape: shapeForCount.name,
                    color: colorForCount.name,
                    size: 'small',
                    count: countSequence[2]
                };
                break;
            }
            case 'combination': {
                const comboShapes = shapes.slice(0, 3);
                const comboColors = colors.slice(0, 3);
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const idx = row * 3 + col;
                        if (idx !== 8) {
                            matrix[idx] = {
                                shape: comboShapes[col].name,
                                color: comboColors[col].name,
                                size: 'medium',
                                count: 1
                            };
                        }
                    }
                }
                correctAnswerData = {
                    shape: comboShapes[2].name,
                    color: comboColors[2].name,
                    size: 'medium',
                    count: 1
                };
                break;
            }
            case 'complex': {
                const complexShapes = shapes.slice(0, 3);
                const complexColors = colors.slice(0, 3);
                const complexSizes = ['small', 'medium', 'large'];
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const idx = row * 3 + col;
                        if (idx !== 8) {
                            matrix[idx] = {
                                shape: complexShapes[col].name,
                                color: complexColors[col].name,
                                size: complexSizes[col],
                                count: col + 1
                            };
                        }
                    }
                }
                correctAnswerData = {
                    shape: complexShapes[2].name,
                    color: complexColors[2].name,
                    size: complexSizes[2],
                    count: 3
                };
                break;
            }
            default:
                correctAnswerData = {
                    shape: shapes[0].name,
                    color: colors[0].name,
                    size: 'medium',
                    count: 1
                };
        }

        return { matrix, correctAnswer: correctAnswerData };
    }, [difficulty]);

    // Generate answer options
    const generateAnswerOptions = useCallback((correctAnswer) => {
        const options = [correctAnswer];
        while (options.length < 6) {
            const variation = { ...correctAnswer };
            const changeType = Math.floor(Math.random() * 4);
            switch (changeType) {
                case 0: {
                    const wrongShape = shapes[Math.floor(Math.random() * shapes.length)];
                    if (wrongShape.name !== correctAnswer.shape) variation.shape = wrongShape.name;
                    break;
                }
                case 1: {
                    const wrongColor = colors[Math.floor(Math.random() * colors.length)];
                    if (wrongColor.name !== correctAnswer.color) variation.color = wrongColor.name;
                    break;
                }
                case 2: {
                    const wrongSize = sizes[Math.floor(Math.random() * sizes.length)];
                    if (wrongSize !== correctAnswer.size) variation.size = wrongSize;
                    break;
                }
                case 3: {
                    const wrongCount = Math.floor(Math.random() * 3) + 1;
                    if (wrongCount !== correctAnswer.count) variation.count = wrongCount;
                    break;
                }
            }
            const exists = options.some(opt =>
                opt.shape === variation.shape &&
                opt.color === variation.color &&
                opt.size === variation.size &&
                opt.count === variation.count
            );
            if (!exists) options.push(variation);
        }
        return options.sort(() => Math.random() - 0.5);
    }, []);

    // New question
    const generateNewQuestion = useCallback(() => {
        const { matrix, correctAnswer } = generateMatrix();
        const options = generateAnswerOptions(correctAnswer);
        setCurrentMatrix(matrix);
        setCorrectAnswer(correctAnswer);
        setAnswerOptions(options);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowHint(false);
        setIsAnswering(false);
        setQuestionStartTime(Date.now());
    }, [generateMatrix, generateAnswerOptions]);

    // Handle answer select
    const handleAnswerSelect = (selectedOption, optionIndex) => {
        if (selectedAnswer !== null || showFeedback || isAnswering) return;
        setIsAnswering(true);
        setSelectedAnswer(optionIndex);
        const responseTime = Date.now() - questionStartTime;
        setTotalResponseTime(prev => prev + responseTime);
        setTotalQuestions(prev => prev + 1);

        const isCorrect =
            selectedOption.shape === correctAnswer.shape &&
            selectedOption.color === correctAnswer.color &&
            selectedOption.size === correctAnswer.size &&
            selectedOption.count === correctAnswer.count;

        setTimeout(() => {
            if (isCorrect) {
                setCorrectAnswers(prev => prev + 1);
                setStreak(prev => {
                    const newStreak = prev + 1;
                    setMaxStreak(current => Math.max(current, newStreak));
                    return newStreak;
                });
                setCurrentLevel(prev => prev + 1);
                setFeedbackType('correct');
                setFeedbackMessage('Perfect! You identified the pattern correctly!');
            } else {
                setStreak(0);
                setLives(prev => {
                    const newLives = prev - 1;
                    if (newLives <= 0) {
                        const endTime = Date.now();
                        const duration = Math.floor((endTime - gameStartTime) / 1000);
                        setGameDuration(duration);
                        setFinalScore(score);
                        setGameState('finished');
                        setShowCompletionModal(true);
                    }
                    return newLives;
                });
                setFeedbackType('incorrect');
                setFeedbackMessage(`Not quite right. The pattern was ${patternType}. Keep practicing!`);
            }
            setShowFeedback(true);
            setTimeout(() => {
                if (lives > 1 || isCorrect) generateNewQuestion();
            }, 2500);
        }, 500);
    };

    // Hint
    const useHint = () => {
        if (hintsUsed >= maxHints || showHint || selectedAnswer !== null) return;
        setHintsUsed(prev => prev + 1);
        setShowHint(true);
        setTimeout(() => setShowHint(false), 5000);
    };

    // Score calc
    const calculateScore = useCallback(() => {
        if (totalQuestions === 0 || gameState !== 'playing') return score;
        const settings = difficultySettings[difficulty];
        const accuracy = correctAnswers / totalQuestions;
        const avgResponseTime = totalResponseTime / totalQuestions / 1000;
        let baseScore = accuracy * 100;
        const idealTime = settings.questionTime * 0.5;
        const speedBonus = Math.max(0, Math.min(40, (idealTime - avgResponseTime) * 3));
        const streakBonus = Math.min(maxStreak * 2.5, 30);
        const levelBonus = Math.min(currentLevel * 0.6, 20);
        const livesBonus = (lives / settings.lives) * 10;
        const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Medium' ? 1.0 : 1.3;
        let finalScore = (baseScore + speedBonus + streakBonus + levelBonus + livesBonus) * difficultyMultiplier;
        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [correctAnswers, totalQuestions, totalResponseTime, currentLevel, lives, maxStreak, difficulty, gameState, score]);

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
                        setFinalScore(score);
                        setGameState('finished');
                        setShowCompletionModal(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timeRemaining, gameStartTime, score]);

    // Init
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];
        setScore(0);
        setFinalScore(0);
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
        setGameDuration(0);
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
        generateNewQuestion();
    };

    const handleReset = () => {
        initializeGame();
        setCurrentMatrix(null);
        setAnswerOptions([]);
        setCorrectAnswer(null);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowHint(false);
        setShowCompletionModal(false);
        setIsAnswering(false);
    };

    const handleGameComplete = (payload) => {
        console.log('Game completed:', payload);
    };

    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') setDifficulty(newDifficulty);
    };

    const customStats = {
        currentLevel,
        streak: maxStreak,
        lives,
        hintsUsed,
        correctAnswers,
        totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header unreadCount={3} />

            <GameFramework
                gameTitle="Matrix Reasoning Game"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowMatrixInstructions(!showMatrixInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Matrix Reasoning Game
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showMatrixInstructions ? <ChevronUp className="h-5 w-5 text-blue-900" /> : <ChevronDown className="h-5 w-5 text-blue-900" />}
                                </span>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showMatrixInstructions ? '' : 'hidden'}`}>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🧩 Objective
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Complete the 3x3 matrix by identifying the pattern and selecting the missing piece from multiple choice options.
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🔍 Pattern Types
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Easy:</strong> Shape or color patterns</li>
                                        <li>• <strong>Medium:</strong> Combined attributes</li>
                                        <li>• <strong>Hard:</strong> Complex multi-dimensional patterns</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Scoring
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Accuracy and response speed</li>
                                        <li>• Streak bonuses for consecutive correct answers</li>
                                        <li>• Lives system with difficulty scaling</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💡 Strategy
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Look for patterns across rows and columns</li>
                                        <li>• Consider shape, color, size, and rotation</li>
                                        <li>• Use hints wisely for learning</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Reasoning"
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
                modifiedPadding="p-8"
            >
                <div className="flex flex-col items-center space-y-8">

                    {/* Combined panels: stack on mobile, side-by-side on lg */}
                    {currentMatrix && answerOptions.length > 0 && (
                        <div className="w-full flex flex-col lg:flex-row lg:items-start lg:justify-center lg:space-x-8">

                            {/* Complete the Pattern */}
                            <div className="w-full lg:w-1/2 mx-auto lg:max-w-md">
                                <div className="bg-white rounded-3xl p-8 lg:p-6 shadow-2xl border border-gray-100">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            Complete the Pattern
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                            <Brain className="h-4 w-4" />
                                            <span>Pattern Type: {patternType}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 lg:gap-2 bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-3 rounded-2xl shadow-inner">
                                        {currentMatrix.map((cell, idx) => (
                                            <div
                                                key={idx}
                                                className={`
                          aspect-square rounded-xl flex items-center justify-center border-2 transition-all duration-500
                          transform hover:scale-105
                          ${idx === 8
                                                        ? 'border-dashed border-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse'
                                                        : 'border-gray-200 bg-white shadow-md hover:shadow-lg'
                                                    }
                          ${showHint && idx === 8 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 animate-bounce' : ''}
                        `}
                                            >
                                                {idx === 8 ? (
                                                    <div className="text-5xl text-gray-400 font-light animate-pulse">?</div>
                                                ) : (
                                                    renderShape(cell, idx, false, true)
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {showHint && (
                                        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 animate-fadeIn">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="bg-yellow-400 rounded-full p-2">
                                                    <Lightbulb className="h-5 w-5 text-white" />
                                                </div>
                                                <span className="text-lg font-semibold text-yellow-800">Pattern Hint</span>
                                            </div>
                                            <p className="text-yellow-700 leading-relaxed">
                                                Look carefully at how the {patternType} changes across each row and column.
                                                The missing piece should follow the same logical sequence!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Choose the Missing Piece */}
                            <div className="w-full lg:w-1/2 mx-auto px-4 lg:px-0 lg:max-w-xl">
                                <div className="bg-white rounded-3xl p-8 lg:p-4 shadow-2xl border border-gray-100">
                                    <h3 className="text-2xl font-bold text-center mb-8 text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        Choose the Missing Piece
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-3">
                                        {answerOptions.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerSelect(option, idx)}
                                                disabled={selectedAnswer !== null || showFeedback || isAnswering}
                                                className={`
                          aspect-square rounded-2xl flex items-center justify-center border-2
                          transition-all duration-300 transform hover:scale-105 active:scale-95
                          disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl
                          ${selectedAnswer === idx
                                                        ? (
                                                            answerOptions[idx].shape === correctAnswer.shape &&
                                                                answerOptions[idx].color === correctAnswer.color &&
                                                                answerOptions[idx].size === correctAnswer.size &&
                                                                answerOptions[idx].count === correctAnswer.count
                                                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-green-200'
                                                                : 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-red-200'
                                                        )
                                                        : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100'
                                                    }
                          ${isAnswering ? 'animate-pulse' : ''}
                        `}
                                            >
                                                {renderShape(option, idx, true, true)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {showFeedback && (
                        <div className={`
              w-full max-w-2xl text-center p-6 rounded-2xl shadow-xl transform animate-slideUp
              ${feedbackType === 'correct'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200'
                                : 'bg-gradient-to-r from-red-100 to-pink-100 border border-red-200'
                            }
            `}>
                            <div className="flex items-center justify-center gap-3 mb-4">
                                {feedbackType === 'correct' ? (
                                    <div className="bg-green-500 rounded-full p-3">
                                        <CheckCircle className="h-8 w-8 text-white" />
                                    </div>
                                ) : (
                                    <div className="bg-red-500 rounded-full p-3">
                                        <XCircle className="h-8 w-8 text-white" />
                                    </div>
                                )}
                                <div className={`text-2xl font-bold ${feedbackType === 'correct' ? 'text-green-800' : 'text-red-800'}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    {feedbackType === 'correct' ? 'Excellent!' : 'Try Again!'}
                                </div>
                            </div>
                            <div className={`text-lg ${feedbackType === 'correct' ? 'text-green-700' : 'text-red-700'}`} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                {feedbackMessage}
                            </div>
                        </div>
                    )}
                </div>
            </GameFramework>

            <GameCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                score={finalScore}
                difficulty={difficulty}
                duration={gameDuration}
                customStats={{
                    correctAnswers,
                    totalQuestions,
                    streak: maxStreak
                }}
            />

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .shape-small  { opacity: 0.7; }
        .shape-medium { opacity: 1;   }
        .shape-large  { opacity: 1.2; transform: scale(1.2); }
      `}</style>
        </div>
    );
};

export default MatrixReasoningGame;
