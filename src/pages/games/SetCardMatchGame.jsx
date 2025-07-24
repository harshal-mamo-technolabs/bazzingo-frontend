import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Lightbulb, Eraser, Eye, EyeOff, ChevronUp, ChevronDown, AlertCircle, CheckCircle, Target, Shuffle } from 'lucide-react';

class SetGameEngine {
    constructor() {
        this.shapes = ['oval', 'diamond', 'squiggle'];
        this.colors = ['red', 'green', 'purple'];
        this.shadings = ['solid', 'striped', 'outline'];
        this.numbers = [1, 2, 3];
        
        this.colorHex = {
            red: '#EF4444',
            green: '#10B981',
            purple: '#8B5CF6'
        };
    }

    // Generate a complete deck of 81 cards
    generateDeck() {
        const deck = [];
        for (let shape of this.shapes) {
            for (let color of this.colors) {
                for (let shading of this.shadings) {
                    for (let number of this.numbers) {
                        deck.push({
                            id: `${shape}-${color}-${shading}-${number}`,
                            shape,
                            color,
                            shading,
                            number
                        });
                    }
                }
            }
        }
        return this.shuffleArray(deck);
    }

    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Deal cards based on difficulty
    dealCards(difficulty) {
        const deck = this.generateDeck();
        const cardCounts = {
            'Easy': 9,      // 3x3 grid
            'Medium': 12,   // 3x4 grid
            'Hard': 15      // 3x5 grid
        };
        
        const cardCount = cardCounts[difficulty] || 12;
        return deck.slice(0, cardCount);
    }

    // Check if three cards form a valid set
    isValidSet(card1, card2, card3) {
        const features = ['shape', 'color', 'shading', 'number'];
        
        for (let feature of features) {
            const values = [card1[feature], card2[feature], card3[feature]];
            const uniqueValues = [...new Set(values)];
            
            // Each feature must be either all same (1 unique) or all different (3 unique)
            if (uniqueValues.length !== 1 && uniqueValues.length !== 3) {
                return false;
            }
        }
        
        return true;
    }

    // Find all valid sets in current cards
    findAllSets(cards) {
        const sets = [];
        
        for (let i = 0; i < cards.length - 2; i++) {
            for (let j = i + 1; j < cards.length - 1; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    if (this.isValidSet(cards[i], cards[j], cards[k])) {
                        sets.push([cards[i], cards[j], cards[k]]);
                    }
                }
            }
        }
        
        return sets;
    }

    // Get hint for finding a set
    generateHint(cards, foundSets) {
        const allSets = this.findAllSets(cards);
        const remainingSets = allSets.filter(set => 
            !foundSets.some(foundSet => 
                foundSet.every(card => set.some(setCard => setCard.id === card.id))
            )
        );

        if (remainingSets.length === 0) {
            return "No more sets available! Great job finding them all!";
        }

        const randomSet = remainingSets[Math.floor(Math.random() * remainingSets.length)];
        const hintCard = randomSet[Math.floor(Math.random() * 3)];
        
        const hints = [
            `Look for a set involving the ${hintCard.color} ${hintCard.shape}`,
            `Try focusing on cards with ${hintCard.number} symbol${hintCard.number > 1 ? 's' : ''}`,
            `Consider the ${hintCard.shading} shading pattern`,
            `Check combinations around the ${hintCard.color} cards`
        ];

        return hints[Math.floor(Math.random() * hints.length)];
    }

    // Check if more sets are possible
    hasAvailableSets(cards, foundSets) {
        const allSets = this.findAllSets(cards);
        return allSets.some(set => 
            !foundSets.some(foundSet => 
                foundSet.every(card => set.some(setCard => setCard.id === card.id))
            )
        );
    }

    // Replace found set with new cards
    replaceCards(currentCards, foundSet, deck, usedCardIds) {
        const newCards = [...currentCards];
        const availableCards = deck.filter(card => !usedCardIds.has(card.id));
        
        if (availableCards.length >= 3) {
            // Replace the found set with new cards
            foundSet.forEach((setCard, index) => {
                const cardIndex = newCards.findIndex(card => card.id === setCard.id);
                if (cardIndex !== -1 && availableCards[index]) {
                    newCards[cardIndex] = availableCards[index];
                }
            });
        }
        
        return newCards;
    }
}

const SetCardMatchGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes default
    const [mistakes, setMistakes] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);
    const [maxMistakes, setMaxMistakes] = useState(5);
    const [gameDuration, setGameDuration] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Set game state
    const [setEngine] = useState(new SetGameEngine());
    const [deck, setDeck] = useState([]);
    const [currentCards, setCurrentCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [foundSets, setFoundSets] = useState([]);
    const [usedCardIds, setUsedCardIds] = useState(new Set());
    const [lastHint, setLastHint] = useState('');
    const [showValidSets, setShowValidSets] = useState(false);
    const [validSets, setValidSets] = useState([]);
    const [correctSets, setCorrectSets] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [targetSets, setTargetSets] = useState(10);

    // Difficulty settings
    const difficultySettings = {
        Easy: {
            timeLimit: 1800, // 30 minutes
            maxHints: 5,
            maxMistakes: 8,
            cardCount: 9,
            targetSets: 8,
            description: '9 cards (3x3), find 8 sets, generous time and hints'
        },
        Medium: {
            timeLimit: 1200, // 20 minutes
            maxHints: 3,
            maxMistakes: 5,
            cardCount: 12,
            targetSets: 12,
            description: '12 cards (3x4), find 12 sets, moderate time and hints'
        },
        Hard: {
            timeLimit: 900, // 15 minutes
            maxHints: 2,
            maxMistakes: 3,
            cardCount: 15,
            targetSets: 15,
            description: '15 cards (3x5), find 15 sets, limited time and hints'
        }
    };

    // Initialize game with difficulty settings
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setMaxHints(settings.maxHints);
        setMaxMistakes(settings.maxMistakes);
        setTargetSets(settings.targetSets);
        setMistakes(0);
        setHintsUsed(0);
        setCorrectSets(0);
        setTotalAttempts(0);
        setCompletionPercentage(0);
        setSelectedCards([]);
        setFoundSets([]);
        setUsedCardIds(new Set());
        setLastHint('');
        setValidSets([]);
    }, [difficulty]);

    // Generate new game
    const generateNewGame = useCallback(() => {
        const newDeck = setEngine.generateDeck();
        const newCards = setEngine.dealCards(difficulty);
        
        setDeck(newDeck);
        setCurrentCards(newCards);
        setUsedCardIds(new Set(newCards.map(card => card.id)));
        
        // Find all valid sets
        const allSets = setEngine.findAllSets(newCards);
        setValidSets(allSets);
    }, [difficulty, setEngine]);

    // Handle card selection
    const handleCardClick = (card) => {
        if (gameState !== 'playing') return;
        
        const isSelected = selectedCards.some(selected => selected.id === card.id);
        
        if (isSelected) {
            // Deselect card
            setSelectedCards(prev => prev.filter(selected => selected.id !== card.id));
        } else if (selectedCards.length < 3) {
            // Select card
            const newSelection = [...selectedCards, card];
            setSelectedCards(newSelection);
            
            // Auto-check if 3 cards selected
            if (newSelection.length === 3) {
                setTimeout(() => checkSet(newSelection), 300);
            }
        }
    };

    // Check if selected cards form a valid set
    const checkSet = (cardsToCheck = selectedCards) => {
        if (cardsToCheck.length !== 3) return;
        
        setTotalAttempts(prev => prev + 1);
        
        const isValid = setEngine.isValidSet(cardsToCheck[0], cardsToCheck[1], cardsToCheck[2]);
        
        if (isValid) {
            // Valid set found
            setCorrectSets(prev => prev + 1);
            setFoundSets(prev => [...prev, cardsToCheck]);
            
            // Replace cards with new ones
            const newCards = setEngine.replaceCards(currentCards, cardsToCheck, deck, usedCardIds);
            setCurrentCards(newCards);
            
            // Update used cards
            const newUsedIds = new Set(usedCardIds);
            newCards.forEach(card => newUsedIds.add(card.id));
            setUsedCardIds(newUsedIds);
            
            // Update valid sets
            const allSets = setEngine.findAllSets(newCards);
            setValidSets(allSets);
            
            // Check if target reached
            if (correctSets + 1 >= targetSets) {
                endGame(true);
            }
        } else {
            // Invalid set
            setMistakes(prev => {
                const newMistakes = prev + 1;
                if (newMistakes >= maxMistakes) {
                    endGame(false);
                }
                return newMistakes;
            });
        }
        
        // Clear selection
        setSelectedCards([]);
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedCards([]);
    };

    // Use hint
    const useHint = () => {
        if (gameState !== 'playing' || hintsUsed >= maxHints) return;
        
        const hint = setEngine.generateHint(currentCards, foundSets);
        setLastHint(hint);
        setHintsUsed(prev => prev + 1);
        
        // Show hint for 5 seconds
        setTimeout(() => setLastHint(''), 5000);
    };

    // Shuffle current cards
    const shuffleCards = () => {
        if (gameState !== 'playing') return;
        
        const shuffled = setEngine.shuffleArray(currentCards);
        setCurrentCards(shuffled);
        setSelectedCards([]);
    };

    // End game
    const endGame = (success) => {
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        setFinalScore(score);
        setGameState('finished');
        setShowCompletionModal(true);
    };

    // Calculate completion percentage
    useEffect(() => {
        const progress = Math.min(100, (correctSets / targetSets) * 100);
        setCompletionPercentage(progress);
    }, [correctSets, targetSets]);

    // Calculate score
    const calculateScore = useCallback(() => {
        if (gameState !== 'playing') return score;

        const settings = difficultySettings[difficulty];
        
        // Base completion score (0-70 points)
        const completionScore = (completionPercentage / 100) * 70;

        // Accuracy bonus (0-40 points)
        const accuracy = totalAttempts > 0 ? correctSets / totalAttempts : 0;
        const accuracyBonus = accuracy * 40;

        // Time bonus (0-30 points)
        const timeUsed = settings.timeLimit - timeRemaining;
        const timeEfficiency = Math.max(0, 1 - (timeUsed / settings.timeLimit));
        const timeBonus = timeEfficiency * 30;

        // Speed bonus for quick recognition (0-25 points)
        const avgTimePerSet = correctSets > 0 ? timeUsed / correctSets : 0;
        const speedBonus = Math.max(0, Math.min(25, (60 - avgTimePerSet) * 0.4));

        // Pattern recognition bonus (0-20 points)
        const recognitionBonus = correctSets > 0 ? Math.min(20, correctSets * 1.5) : 0;

        // Mistake penalty (subtract up to 15 points)
        const mistakePenalty = (mistakes / settings.maxMistakes) * 15;

        // Hint penalty (subtract up to 10 points)
        const hintPenalty = (hintsUsed / settings.maxHints) * 10;

        // Difficulty multiplier
        const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Medium' ? 1.0 : 1.2;

        let finalScore = (completionScore + accuracyBonus + timeBonus + speedBonus + recognitionBonus - mistakePenalty - hintPenalty) * difficultyMultiplier;

        // Apply scaling to make 200 very challenging
        finalScore = finalScore * 0.85;

        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [gameState, completionPercentage, totalAttempts, correctSets, timeRemaining, mistakes, hintsUsed, difficulty, score]);

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
                        endGame(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timeRemaining, gameStartTime]);

    // Handle start game
    const handleStart = () => {
        initializeGame();
        generateNewGame();
        setGameStartTime(Date.now());
    };

    // Handle reset game
    const handleReset = () => {
        initializeGame();
        setDeck([]);
        setCurrentCards([]);
        setShowCompletionModal(false);
    };

    // Handle difficulty change
    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
        }
    };

    // Handle game complete
    const handleGameComplete = (payload) => {
        console.log('Set Card Match game completed:', payload);
    };

    // Render card shape
    const renderShape = (card) => {
        const { shape, color, shading, number } = card;
        const baseColor = setEngine.colorHex[color];
        
        const shapes = [];
        for (let i = 0; i < number; i++) {
            let shapeElement;
            const key = `${card.id}-${i}`;
            
            if (shape === 'oval') {
                shapeElement = (
                    <ellipse
                        key={key}
                        cx="20"
                        cy={10 + i * 15}
                        rx="15"
                        ry="6"
                        fill={shading === 'solid' ? baseColor : shading === 'outline' ? 'none' : `url(#stripe-${color})`}
                        stroke={baseColor}
                        strokeWidth="2"
                    />
                );
            } else if (shape === 'diamond') {
                shapeElement = (
                    <polygon
                        key={key}
                        points={`20,${4 + i * 15} 30,${10 + i * 15} 20,${16 + i * 15} 10,${10 + i * 15}`}
                        fill={shading === 'solid' ? baseColor : shading === 'outline' ? 'none' : `url(#stripe-${color})`}
                        stroke={baseColor}
                        strokeWidth="2"
                    />
                );
            } else { // squiggle
                shapeElement = (
                    <path
                        key={key}
                        d={`M 8,${8 + i * 15} Q 15,${4 + i * 15} 25,${8 + i * 15} Q 32,${12 + i * 15} 25,${12 + i * 15} Q 15,${16 + i * 15} 8,${12 + i * 15} Q 5,${8 + i * 15} 8,${8 + i * 15}`}
                        fill={shading === 'solid' ? baseColor : shading === 'outline' ? 'none' : `url(#stripe-${color})`}
                        stroke={baseColor}
                        strokeWidth="2"
                    />
                );
            }
            shapes.push(shapeElement);
        }
        
        return (
            <svg width="40" height={number * 15 + 5} viewBox={`0 0 40 ${number * 15 + 5}`}>
                <defs>
                    {setEngine.colors.map(colorName => (
                        <pattern
                            key={`stripe-${colorName}`}
                            id={`stripe-${colorName}`}
                            patternUnits="userSpaceOnUse"
                            width="4"
                            height="4"
                        >
                            <rect width="2" height="4" fill={setEngine.colorHex[colorName]} />
                            <rect x="2" width="2" height="4" fill="white" />
                        </pattern>
                    ))}
                </defs>
                {shapes}
            </svg>
        );
    };

    // Get card class names
    const getCardClassName = (card) => {
        const baseClass = 'w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg';
        const isSelected = selectedCards.some(selected => selected.id === card.id);
        
        if (isSelected) {
            return baseClass + ' border-blue-500 bg-blue-100 ring-2 ring-blue-300 animate-pulse shadow-xl';
        } else {
            return baseClass + ' border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400';
        }
    };

    // Custom stats for the framework
    const customStats = {
        correctSets,
        targetSets,
        hintsUsed,
        completionPercentage: Math.round(completionPercentage),
        accuracy: totalAttempts > 0 ? Math.round((correctSets / totalAttempts) * 100) : 100,
        mistakes,
        availableSets: validSets.length
    };

    return (
        <div>
            <Header unreadCount={3} />

            <GameFramework
                gameTitle="Set Card Match"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Set Card Match
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showInstructions
                                        ? <ChevronUp className="h-5 w-5 text-blue-900" />
                                        : <ChevronDown className="h-5 w-5 text-blue-900" />}
                                </span>
                            </div>

                            {/* Instructions */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 Objective
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Find sets of 3 cards where each feature (shape, color, shading, number) is either all same or all different.
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎚️ Difficulty Levels
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Easy:</strong> 9 cards, find 8 sets</li>
                                        <li>• <strong>Medium:</strong> 12 cards, find 12 sets</li>
                                        <li>• <strong>Hard:</strong> 15 cards, find 15 sets</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Set Rules
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Shape: oval, diamond, squiggle</li>
                                        <li>• Color: red, green, purple</li>
                                        <li>• Shading: solid, striped, outline</li>
                                        <li>• Number: 1, 2, or 3 symbols</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎮 How to Play
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Click 3 cards to select them</li>
                                        <li>• Valid sets auto-submit</li>
                                        <li>• Cards replace after valid sets</li>
                                        <li>• Use pattern recognition skills!</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Pattern Recognition"
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
                <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                    {/* Game Controls */}
                    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 px-2">
                        <button
                            onClick={useHint}
                            disabled={hintsUsed >= maxHints}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                            Hint ({maxHints - hintsUsed})
                        </button>

                        <button
                            onClick={clearSelection}
                            disabled={selectedCards.length === 0}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCards.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            <Eraser className="h-3 w-3 sm:h-4 sm:w-4" />
                            Clear ({selectedCards.length})
                        </button>

                        <button
                            onClick={shuffleCards}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-purple-500 text-white hover:bg-purple-600 shadow-lg hover:shadow-xl"
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            <Shuffle className="h-3 w-3 sm:h-4 sm:w-4" />
                            Shuffle
                        </button>

                        <button
                            onClick={() => setShowValidSets(!showValidSets)}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showValidSets
                                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                                : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-xl'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            {showValidSets ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                            Sets ({validSets.length})
                        </button>
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-2xl px-2">
                        <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Sets Found
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {correctSets}/{targetSets}
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Accuracy
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {customStats.accuracy}%
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Available
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {validSets.length} sets
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Mistakes
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {mistakes}/{maxMistakes}
                            </div>
                        </div>
                    </div>

                    {/* Card Grid */}
                    {currentCards.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-gray-300 max-w-4xl">
                            <div className={`grid gap-3 sm:gap-4 ${
                                difficulty === 'Easy' ? 'grid-cols-3' : 
                                difficulty === 'Medium' ? 'grid-cols-3 sm:grid-cols-4' : 
                                'grid-cols-3 sm:grid-cols-5'
                            } justify-items-center`}>
                                {currentCards.map((card, index) => (
                                    <div
                                        key={card.id}
                                        className={getCardClassName(card)}
                                        onClick={() => handleCardClick(card)}
                                        style={{
                                            animation: `fadeInScale 0.3s ease-out ${index * 0.1}s both`
                                        }}
                                    >
                                        {renderShape(card)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selection Display */}
                    {selectedCards.length > 0 && (
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 max-w-md">
                            <h4 className="text-center text-sm font-semibold text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Selected Cards ({selectedCards.length}/3)
                            </h4>
                            <div className="flex justify-center gap-2">
                                {selectedCards.map((card, index) => (
                                    <div key={card.id} className="w-16 h-20 border border-blue-400 rounded-lg bg-white flex items-center justify-center">
                                        <div style={{ transform: 'scale(0.7)' }}>
                                            {renderShape(card)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Valid Sets Display (when peeking) */}
                    {showValidSets && validSets.length > 0 && (
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 max-w-2xl">
                            <h4 className="text-center text-sm font-semibold text-green-800 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Available Sets ({validSets.length})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {validSets.slice(0, 3).map((set, setIndex) => (
                                    <div key={setIndex} className="flex justify-center gap-1">
                                        {set.map((card, cardIndex) => (
                                            <div key={card.id} className="w-12 h-16 border border-green-400 rounded bg-white flex items-center justify-center">
                                                <div style={{ transform: 'scale(0.5)' }}>
                                                    {renderShape(card)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                {validSets.length > 3 && (
                                    <div className="text-center text-xs text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        +{validSets.length - 3} more sets available
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hint Display */}
                    {lastHint && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md animate-bounce">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    <strong>Hint:</strong> {lastHint}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Status Messages */}
                    {selectedCards.length === 3 && (
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-pulse shadow-lg">
                            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                Checking your selection...
                            </span>
                        </div>
                    )}

                    {mistakes > maxMistakes * 0.6 && gameState === 'playing' && (
                        <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-pulse shadow-lg">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                Be careful! You're running out of mistakes.
                            </span>
                        </div>
                    )}

                    {correctSets >= targetSets && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-pulse shadow-lg">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                Target reached! Excellent pattern recognition!
                            </span>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="text-center max-w-2xl text-xs sm:text-sm text-gray-600 px-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                        <p className="mb-2 leading-relaxed">
                            Click 3 cards to form a set. Each feature must be all same or all different across the three cards.
                        </p>
                        <p className="leading-relaxed">
                            {difficulty} Mode: {difficultySettings[difficulty].description}
                        </p>
                    </div>
                </div>
            </GameFramework>

            <GameCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                score={finalScore}
                difficulty={difficulty}
                duration={gameDuration}
                customStats={{
                    correctAnswers: correctSets,
                    totalQuestions: totalAttempts
                }}
            />
        </div>
    );
};

export default SetCardMatchGame;