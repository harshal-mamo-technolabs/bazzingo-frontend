import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { ChevronUp, ChevronDown, CheckCircle, XCircle, Lightbulb, Target } from 'lucide-react';

const GAME_TIME_LIMIT = 90; // 90 seconds for all levels
const MAX_SCORE = 200;

const CardSortingGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(GAME_TIME_LIMIT);
    const [showInstructions, setShowInstructions] = useState(true);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);

    // Animation states
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [isTargetPulsing, setIsTargetPulsing] = useState(false);
    const [feedbackAnimation, setFeedbackAnimation] = useState('');
    const [statsAnimation, setStatsAnimation] = useState({});

    // Game state
    const [cards, setCards] = useState([]);
    const [currentRule, setCurrentRule] = useState('color');
    const [targetCard, setTargetCard] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [feedbackTimer, setFeedbackTimer] = useState(null);
    const [ruleChanges, setRuleChanges] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [correctAttempts, setCorrectAttempts] = useState(0);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [adaptationTime, setAdaptationTime] = useState(0);
    const [lastRuleChangeTime, setLastRuleChangeTime] = useState(0);
    const [adaptationRecorded, setAdaptationRecorded] = useState(false);
    const [sortHistory, setSortHistory] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);

    // Card properties
    const colors = ['red', 'blue', 'green', 'yellow'];
    const shapes = ['circle', 'square', 'triangle', 'diamond'];
    const numbers = [1, 2, 3, 4];
    const rules = ['color', 'shape', 'number'];

    // Difficulty settings (only rule change + hints; time is global now)
    const difficultySettings = {
        Easy: {
            ruleChangeInterval: 6,
            hints: 3,
            feedbackDelay: 1500,
            description: 'Rule changes every 6 correct sorts'
        },
        Moderate: {
            ruleChangeInterval: 4,
            hints: 2,
            feedbackDelay: 1200,
            description: 'Rule changes every 4 correct sorts'
        },
        Hard: {
            ruleChangeInterval: 3,
            hints: 1,
            feedbackDelay: 1000,
            description: 'Rule changes every 3 correct sorts'
        }
    };

    // Animate stats when they change
    useEffect(() => {
        const animateId = Math.random().toString();
        setStatsAnimation({ [animateId]: true });

        const timer = setTimeout(() => {
            setStatsAnimation({});
        }, 600);

        return () => clearTimeout(timer);
    }, [totalAttempts, correctAttempts, ruleChanges]);

    // Generate random card
    const generateCard = () => {
        return {
            id: Math.random().toString(36).substr(2, 9),
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            number: numbers[Math.floor(Math.random() * numbers.length)]
        };
    };

    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Guarantee a correct answer every round
    const generateNewRound = useCallback(() => {
        const newTarget = generateCard();
        setTargetCard(null);
        setCards([]);

        // Build a card that matches the rule
        let matchCard = { ...generateCard(), id: Math.random().toString(36).substr(2, 9) };
        switch (currentRule) {
            case 'color':
                matchCard.color = newTarget.color;
                break;
            case 'shape':
                matchCard.shape = newTarget.shape;
                break;
            case 'number':
                matchCard.number = newTarget.number;
                break;
        }

        // Try to vary other attributes
        if (currentRule !== 'color') matchCard.color = randomChoice(colors);
        if (currentRule !== 'shape') matchCard.shape = randomChoice(shapes);
        if (currentRule !== 'number') matchCard.number = randomChoice(numbers);

        const newCards = [matchCard];
        while (newCards.length < 4) {
            newCards.push(generateCard());
        }

        // Shuffle
        for (let i = newCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
        }

        setTimeout(() => setTargetCard(newTarget), 100);
        setTimeout(() => setCards(newCards), 200);
    }, [currentRule]);

    // Check if card matches current rule
    const cardMatchesRule = (card, targetCard, rule) => {
        switch (rule) {
            case 'color':
                return card.color === targetCard.color;
            case 'shape':
                return card.shape === targetCard.shape;
            case 'number':
                return card.number === targetCard.number;
            default:
                return false;
        }
    };

    // Finish the game helper
    const finishGame = (final) => {
        setFinalScore(final);
        setGameState('finished');
        setShowCompletionModal(true);
    };

    // Handle card selection with animations and simple scoring
    const handleCardSelect = (selectedCard) => {
        if (gameState !== 'playing' || feedback || !targetCard) return;

        setSelectedCardId(selectedCard.id);
        const isCorrect = cardMatchesRule(selectedCard, targetCard, currentRule);
        const currentTime = Date.now();
        const settings = difficultySettings[difficulty];

        setTotalAttempts(prev => prev + 1);

        if (feedbackTimer) {
            clearTimeout(feedbackTimer);
        }

        if (isCorrect) {
            // Scoring: +10 (cap 200)
            const newScore = Math.min(MAX_SCORE, score + 10);
            setScore(newScore);
            setCorrectAttempts(prev => prev + 1);
            setFeedbackAnimation('correct');

            if (!adaptationRecorded && lastRuleChangeTime > 0) {
                setAdaptationTime(prev => prev + (currentTime - lastRuleChangeTime));
                setAdaptationRecorded(true);
            }

            // End game immediately if score hits 200
            if (newScore >= MAX_SCORE) {
                setFeedback({ type: 'correct', message: `Correct! Score reached ${MAX_SCORE}.` });
                finishGame(newScore);
                return;
            }

            setConsecutiveCorrect(prev => {
                const newCount = prev + 1;
                const willChangeRule = newCount >= settings.ruleChangeInterval;

                if (willChangeRule) {
                    setTimeout(() => {
                        changeRule();
                    }, settings.feedbackDelay);
                } else {
                    setTimeout(() => {
                        generateNewRound();
                    }, settings.feedbackDelay);
                }
                return newCount;
            });

            setFeedback({ type: 'correct', message: `Correct! Matching by ${currentRule}` });

            const willChangeRule = consecutiveCorrect + 1 >= settings.ruleChangeInterval;
            if (!willChangeRule) {
                const timer = setTimeout(() => {
                    setFeedback(null);
                    setFeedbackAnimation('');
                    setSelectedCardId(null);
                }, settings.feedbackDelay);
                setFeedbackTimer(timer);
            }
        } else {
            // Scoring: -15 (not below 0)
            setScore(prev => Math.max(0, prev - 15));
            setConsecutiveCorrect(0);
            setFeedbackAnimation('incorrect');
            setFeedback({ type: 'incorrect', message: 'Incorrect! Try a different match.' });

            setTimeout(() => {
                generateNewRound();
            }, difficultySettings[difficulty].feedbackDelay);

            const timer = setTimeout(() => {
                setFeedback(null);
                setFeedbackAnimation('');
                setSelectedCardId(null);
            }, difficultySettings[difficulty].feedbackDelay);
            setFeedbackTimer(timer);
        }

        setSortHistory(prev => [...prev, {
            targetCard,
            selectedCard,
            rule: currentRule,
            correct: isCorrect,
            timestamp: currentTime
        }]);
    };

    // Change the sorting rule
    const changeRule = () => {
        const availableRules = rules.filter(rule => rule !== currentRule);
        const newRule = availableRules[Math.floor(Math.random() * availableRules.length)];

        setCurrentRule(newRule);
        setConsecutiveCorrect(0);
        setRuleChanges(prev => prev + 1);
        setLastRuleChangeTime(Date.now());
        setAdaptationRecorded(false);
        setIsTargetPulsing(true);

        setFeedback({ type: 'hint', message: '🔄 Rule changed! Adapt your strategy.' });
        setFeedbackAnimation('rule-change');

        setTimeout(() => {
            setFeedback(null);
            setFeedbackAnimation('');
            setIsTargetPulsing(false);
            generateNewRound();
        }, 2000);
    };

    // Hint
    const useHint = () => {
        if (hintsUsed >= maxHints || gameState !== 'playing' || !targetCard) return;

        setHintsUsed(prev => prev + 1);
        let hintMessage = '';
        switch (currentRule) {
            case 'color':
                hintMessage = `💡 Look for cards with ${targetCard.color} color`;
                break;
            case 'shape':
                hintMessage = `💡 Look for cards with ${targetCard.shape} shape`;
                break;
            case 'number':
                hintMessage = `💡 Look for cards with ${targetCard.number} symbols`;
                break;
        }

        setFeedback({ type: 'hint', message: hintMessage });
        setFeedbackAnimation('hint');

        setTimeout(() => {
            setFeedback(null);
            setFeedbackAnimation('');
        }, 3000);
    };

    // Timer countdown
    useEffect(() => {
        let interval;
        if (gameState === 'playing' && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        const endTime = Date.now();
                        const duration = Math.floor((endTime - gameStartTime) / 1000);
                        setGameDuration(duration);
                        finishGame(score);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timeRemaining, gameStartTime, score]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(GAME_TIME_LIMIT);
        setMaxHints(settings.hints);
        setHintsUsed(0);
        setTotalAttempts(0);
        setCorrectAttempts(0);
        setConsecutiveCorrect(0);
        setRuleChanges(0);
        setAdaptationTime(0);
        setLastRuleChangeTime(0);
        setAdaptationRecorded(false);
        setSortHistory([]);
        setFeedback(null);
        setFeedbackAnimation('');
        setSelectedCardId(null);
        setIsTargetPulsing(false);
        setCurrentRule(rules[Math.floor(Math.random() * rules.length)]);
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        setGameState('playing');
        setGameStartTime(Date.now());
        generateNewRound();
    };

    const handleReset = () => {
        initializeGame();
        setGameState('ready');
        setCards([]);
        setTargetCard(null);
        setShowCompletionModal(false);
        if (feedbackTimer) {
            clearTimeout(feedbackTimer);
        }
    };

    const handleGameComplete = (payload) => {
        console.log('Game completed:', payload);
    };

    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
        }
    };

    const getCardStyle = (card) => {
        return {
            backgroundColor: card.color === 'red' ? '#EF4444' :
                card.color === 'blue' ? '#3B82F6' :
                    card.color === 'green' ? '#10B981' :
                        card.color === 'yellow' ? '#F59E0B' : '#6B7280'
        };
    };

    const renderShape = (shape, size = 'w-8 h-8') => {
        const shapeClasses = `${size} text-white`;
        switch (shape) {
            case 'circle':
                return <div className={`${shapeClasses} rounded-full bg-current`}></div>;
            case 'square':
                return <div className={`${shapeClasses} bg-current`}></div>;
            case 'triangle':
                return <div className={`${size} text-white flex items-center justify-center text-2xl`}>▲</div>;
            case 'diamond':
                return (
                    <div className={`${size} text-white transform rotate-45 flex items-center justify-center`}>
                        <div className="w-6 h-6 bg-current"></div>
                    </div>
                );
            default:
                return <div className={shapeClasses}></div>;
        }
    };

    const customStats = {
        totalAttempts,
        correctAttempts,
        ruleChanges,
        adaptationTime: Math.round(adaptationTime / 1000),
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        adaptations: ruleChanges
    };

    return (
        <div>
            <Header unreadCount={3} />
            <GameFramework
                gameTitle="Card Sorting Flexibility"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Card Sorting Flexibility
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showInstructions
                                        ? <ChevronUp className="h-5 w-5 text-blue-900" />
                                        : <ChevronDown className="h-5 w-5 text-blue-900" />}
                                </span>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 Objective
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Match cards to the target card based on a hidden rule. The rule could be COLOR, SHAPE, or NUMBER - you must figure it out!
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🔄 Hidden Rules
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>COLOR:</strong> Match cards with same color</li>
                                        <li>• <strong>SHAPE:</strong> Match cards with same shape</li>
                                        <li>• <strong>NUMBER:</strong> Match cards with same number</li>
                                        <li>• Rules change without warning!</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎮 How to Play
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Look at the target card at the top</li>
                                        <li>• Click a card that matches the rule</li>
                                        <li>• Get "Correct" or "Incorrect" feedback</li>
                                        <li>• Adapt when the rule changes!</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💡 Strategy
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Start by testing one attribute</li>
                                        <li>• If wrong, try a different attribute</li>
                                        <li>• Watch for rule change notifications</li>
                                        <li>• Adapt quickly to maintain streaks</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Critical Thinking"
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
                <div className="flex flex-col items-center space-y-6">
                    {/* Game Controls */}
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        {gameState === 'playing' && (
                            <button
                                onClick={useHint}
                                disabled={hintsUsed >= maxHints || !targetCard}
                                className={`px-4 py-2 rounded-lg transition-all duration-300 transform flex items-center gap-2 ${hintsUsed >= maxHints
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:scale-105 hover:shadow-lg active:scale-95 animate-pulse'
                                    }`}
                                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                            >
                                <Lightbulb className="h-4 w-4" />
                                Hint ({maxHints - hintsUsed})
                            </button>
                        )}
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                        <div className={`text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${Object.keys(statsAnimation).length > 0 ? 'scale-105 bg-orange-200' : ''}`}>
                            <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Accuracy
                            </div>
                            <div className="text-lg font-semibold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {customStats.accuracy}%
                            </div>
                        </div>
                        <div className={`text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${Object.keys(statsAnimation).length > 0 ? 'scale-105 bg-purple-200' : ''}`}>
                            <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Rule Changes
                            </div>
                            <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {ruleChanges}
                            </div>
                        </div>
                        <div className={`text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${Object.keys(statsAnimation).length > 0 ? 'scale-105 bg-blue-200' : ''}`}>
                            <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Attempts
                            </div>
                            <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {totalAttempts}
                            </div>
                        </div>
                        <div className={`text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${Object.keys(statsAnimation).length > 0 ? 'scale-105 bg-green-200' : ''}`}>
                            <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Correct
                            </div>
                            <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {correctAttempts}
                            </div>
                        </div>
                    </div>

                    {/* Target Card */}
                    {targetCard && (
                        <div className="w-full max-w-2xl animate-fade-in">
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-xl p-6 text-center shadow-lg">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center justify-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    <Target className="h-5 w-5" />
                                    Target Card - Find cards that match this one
                                </h3>
                                <div className="flex justify-center">
                                    <div
                                        className={`w-28 h-36 rounded-xl border-3 border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 shadow-xl ${isTargetPulsing ? 'animate-pulse scale-110 ring-4 ring-blue-300' : 'hover:scale-105'
                                            }`}
                                        style={getCardStyle(targetCard)}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            {renderShape(targetCard.shape, 'w-12 h-12')}
                                            <div className="text-white font-bold text-2xl mt-2">
                                                {targetCard.number}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-sm text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Color: {targetCard.color} | Shape: {targetCard.shape} | Number: {targetCard.number}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cards Grid */}
                    {cards.length > 0 && (
                        <div className="w-full max-w-2xl">
                            <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Select a card that matches the rule
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
                                    {cards.map((card, index) => (
                                        <div
                                            key={card.id}
                                            onClick={() => handleCardSelect(card)}
                                            className={`w-24 h-32 rounded-xl border-2 border-gray-300 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 hover:-translate-y-2 animate-slide-up ${selectedCardId === card.id ? 'ring-4 ring-blue-400 scale-110' : ''
                                                }`}
                                            style={{
                                                ...getCardStyle(card),
                                                animationDelay: `${index * 0.1}s`
                                            }}
                                        >
                                            <div className="flex flex-col items-center justify-center h-full">
                                                {renderShape(card.shape, 'w-10 h-10')}
                                                <div className="text-white font-bold text-xl mt-2">
                                                    {card.number}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {feedback && (
                        <div className={`w-full max-w-2xl text-center p-4 rounded-xl mb-4 transition-all duration-500 transform animate-bounce-in shadow-lg ${feedback.type === 'correct' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300' :
                            feedback.type === 'incorrect' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300' :
                                'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300'
                            }`}>
                            <div className="flex items-center justify-center gap-3">
                                {feedback.type === 'correct' ? (
                                    <CheckCircle className="h-8 w-8 text-green-600 animate-bounce" />
                                ) : feedback.type === 'incorrect' ? (
                                    <XCircle className="h-8 w-8 text-red-600 animate-pulse" />
                                ) : (
                                    <Lightbulb className="h-8 w-8 text-yellow-600 animate-pulse" />
                                )}
                                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    {feedback.message}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions / Footer */}
                    <div className="text-center max-w-2xl animate-fade-in">
                        <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                            <strong>How to Play:</strong> Look at the target card above, then click on any card below that matches it.
                            The matching rule could be COLOR, SHAPE, or NUMBER. Figure out the rule from the feedback!
                        </p>
                        <div className="text-xs text-gray-500 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {difficulty} Mode: {difficultySettings[difficulty].description} | 1:30 time limit | {difficultySettings[difficulty].hints} hints available
                        </div>

                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-md">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Quick Start Guide:</h4>
                            <div className="text-xs text-blue-700 space-y-1 text-left">
                                <div>1. Look at the <strong>target card</strong> (shows color, shape, number)</div>
                                <div>2. Click a card below that you think matches the hidden rule</div>
                                <div>3. Correct = +10 points, Incorrect = -15 (never below 0)</div>
                                <div>4. Game ends when time runs out or you reach 200 points</div>
                                <div>5. After several correct answers, the rule changes - adapt quickly!</div>
                            </div>
                        </div>
                    </div>
                </div>
            </GameFramework>

            <GameCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                score={finalScore}
            />

            {/* Custom CSS */}
            <style jsx>{`
        @keyframes bounce-in {
          0% { 
              opacity: 0; 
              transform: scale(0.3) translateY(-50px); 
          }
          50% { 
              opacity: 1; 
              transform: scale(1.05) translateY(-10px); 
          }
          70% { 
              transform: scale(0.95) translateY(0); 
          }
          100% { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
          }
        }
        
        @keyframes slide-up {
          from { 
              opacity: 0; 
              transform: translateY(30px); 
          }
          to { 
              opacity: 1; 
              transform: translateY(0); 
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

export default CardSortingGame;
