import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Lightbulb, Eraser, Eye, EyeOff, ChevronUp, ChevronDown, AlertCircle, CheckCircle, Target } from 'lucide-react';

class MastermindEngine {
    constructor() {
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
        this.colorNames = {
            red: 'Red',
            blue: 'Blue', 
            green: 'Green',
            yellow: 'Yellow',
            purple: 'Purple',
            orange: 'Orange',
            pink: 'Pink',
            cyan: 'Cyan'
        };
        this.colorHex = {
            red: '#EF4444',
            blue: '#3B82F6',
            green: '#10B981',
            yellow: '#F59E0B',
            purple: '#8B5CF6',
            orange: '#F97316',
            pink: '#EC4899',
            cyan: '#06B6D4'
        };
    }

    // Generate secret code based on difficulty
    generateSecretCode(difficulty) {
        const codeLength = this.getCodeLength(difficulty);
        const availableColors = this.getAvailableColors(difficulty);
        const allowDuplicates = this.getAllowDuplicates(difficulty);
        
        const code = [];
        const usedColors = new Set();

        for (let i = 0; i < codeLength; i++) {
            let color;
            do {
                color = availableColors[Math.floor(Math.random() * availableColors.length)];
            } while (!allowDuplicates && usedColors.has(color));
            
            code.push(color);
            usedColors.add(color);
        }

        return code;
    }

    // Get code length based on difficulty
    getCodeLength(difficulty) {
        switch (difficulty) {
            case 'Easy': return 4;
            case 'Medium': return 5;
            case 'Hard': return 6;
            default: return 4;
        }
    }

    // Get available colors based on difficulty
    getAvailableColors(difficulty) {
        switch (difficulty) {
            case 'Easy': return this.colors.slice(0, 6); // 6 colors
            case 'Medium': return this.colors.slice(0, 7); // 7 colors
            case 'Hard': return this.colors; // 8 colors
            default: return this.colors.slice(0, 6);
        }
    }

    // Get if duplicates are allowed
    getAllowDuplicates(difficulty) {
        return difficulty === 'Hard';
    }

    // Evaluate a guess against the secret code
    evaluateGuess(guess, secretCode) {
        const feedback = {
            exactMatches: 0, // Correct color in correct position (black pegs)
            colorMatches: 0, // Correct color in wrong position (white pegs)
            totalCorrect: 0
        };

        const secretCodeCopy = [...secretCode];
        const guessCopy = [...guess];

        // First pass: find exact matches
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === secretCode[i]) {
                feedback.exactMatches++;
                secretCodeCopy[i] = null;
                guessCopy[i] = null;
            }
        }

        // Second pass: find color matches (wrong position)
        for (let i = 0; i < guessCopy.length; i++) {
            if (guessCopy[i] !== null) {
                const colorIndex = secretCodeCopy.indexOf(guessCopy[i]);
                if (colorIndex !== -1) {
                    feedback.colorMatches++;
                    secretCodeCopy[colorIndex] = null;
                }
            }
        }

        feedback.totalCorrect = feedback.exactMatches + feedback.colorMatches;
        return feedback;
    }

    // Check if guess is completely correct
    isWinningGuess(guess, secretCode) {
        return guess.length === secretCode.length && 
               guess.every((color, index) => color === secretCode[index]);
    }

    // Generate hint for current guess
    generateHint(currentGuess, secretCode, previousGuesses, previousFeedbacks) {
        const codeLength = secretCode.length;
        
        // If no guess yet, give a general hint
        if (currentGuess.every(color => color === null)) {
            const secretColors = [...new Set(secretCode)];
            const randomColor = secretColors[Math.floor(Math.random() * secretColors.length)];
            return `Try using ${this.colorNames[randomColor]} - it's in the secret code!`;
        }

        // Find a position that needs improvement
        for (let i = 0; i < codeLength; i++) {
            if (currentGuess[i] === null) {
                return `Position ${i + 1} needs a color. Try different combinations!`;
            }
            
            if (currentGuess[i] !== secretCode[i]) {
                if (secretCode.includes(currentGuess[i])) {
                    return `${this.colorNames[currentGuess[i]]} is in the code but not in position ${i + 1}!`;
                } else {
                    return `${this.colorNames[currentGuess[i]]} is not in the secret code at all.`;
                }
            }
        }

        return "You're very close! Double-check your color positions.";
    }

    // Get color statistics for hints
    getColorStatistics(guesses, feedbacks) {
        const stats = {};
        this.colors.forEach(color => {
            stats[color] = { tried: false, confirmed: false, ruled_out: false };
        });

        guesses.forEach((guess, guessIndex) => {
            const feedback = feedbacks[guessIndex];
            guess.forEach(color => {
                if (color) {
                    stats[color].tried = true;
                    if (feedback && feedback.totalCorrect > 0) {
                        // This is a rough heuristic - in a real game you'd need more sophisticated logic
                        stats[color].confirmed = true;
                    }
                }
            });
        });

        return stats;
    }
}

const MastermindDeductionGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes default
    const [mistakes, setMistakes] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);
    const [maxAttempts, setMaxAttempts] = useState(10);
    const [gameDuration, setGameDuration] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Mastermind game state
    const [mastermindEngine] = useState(new MastermindEngine());
    const [secretCode, setSecretCode] = useState([]);
    const [currentGuess, setCurrentGuess] = useState([]);
    const [guessHistory, setGuessHistory] = useState([]);
    const [feedbackHistory, setFeedbackHistory] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(0);
    const [availableColors, setAvailableColors] = useState([]);
    const [codeLength, setCodeLength] = useState(4);
    const [showSecretCode, setShowSecretCode] = useState(false);
    const [currentAttempt, setCurrentAttempt] = useState(1);
    const [correctGuesses, setCorrectGuesses] = useState(0);
    const [totalGuesses, setTotalGuesses] = useState(0);
    const [lastHint, setLastHint] = useState('');

    // Difficulty settings
    const difficultySettings = {
        Easy: {
            timeLimit: 1800, // 30 minutes
            maxHints: 5,
            maxAttempts: 12,
            codeLength: 4,
            colorCount: 6,
            allowDuplicates: false,
            description: '4 colors, 6 options, no duplicates, 12 attempts'
        },
        Medium: {
            timeLimit: 1200, // 20 minutes
            maxHints: 3,
            maxAttempts: 10,
            codeLength: 5,
            colorCount: 7,
            allowDuplicates: false,
            description: '5 colors, 7 options, no duplicates, 10 attempts'
        },
        Hard: {
            timeLimit: 900, // 15 minutes
            maxHints: 2,
            maxAttempts: 8,
            codeLength: 6,
            colorCount: 8,
            allowDuplicates: true,
            description: '6 colors, 8 options, duplicates allowed, 8 attempts'
        }
    };

    // Initialize game with difficulty settings
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setMaxHints(settings.maxHints);
        setMaxAttempts(settings.maxAttempts);
        setMistakes(0);
        setHintsUsed(0);
        setCorrectGuesses(0);
        setTotalGuesses(0);
        setCompletionPercentage(0);
        setCurrentAttempt(1);
        setSelectedPosition(0);
        setGuessHistory([]);
        setFeedbackHistory([]);
        setLastHint('');
        setCodeLength(settings.codeLength);
        setAvailableColors(mastermindEngine.getAvailableColors(difficulty));
        setCurrentGuess(new Array(settings.codeLength).fill(null));
    }, [difficulty, mastermindEngine]);

    // Generate new puzzle
    const generateNewPuzzle = useCallback(() => {
        const newSecretCode = mastermindEngine.generateSecretCode(difficulty);
        setSecretCode(newSecretCode);
        setShowSecretCode(false);
    }, [difficulty, mastermindEngine]);

    // Handle color selection
    const handleColorSelect = (color) => {
        if (gameState !== 'playing') return;
        
        const newGuess = [...currentGuess];
        newGuess[selectedPosition] = color;
        setCurrentGuess(newGuess);

        // Auto-advance to next empty position
        const nextEmptyIndex = newGuess.findIndex((c, index) => index > selectedPosition && c === null);
        if (nextEmptyIndex !== -1) {
            setSelectedPosition(nextEmptyIndex);
        } else if (selectedPosition < codeLength - 1) {
            setSelectedPosition(selectedPosition + 1);
        }
    };

    // Handle position selection
    const handlePositionSelect = (position) => {
        if (gameState !== 'playing') return;
        setSelectedPosition(position);
    };

    // Clear selected position
    const handleClearPosition = () => {
        if (gameState !== 'playing') return;
        const newGuess = [...currentGuess];
        newGuess[selectedPosition] = null;
        setCurrentGuess(newGuess);
    };

    // Submit current guess
    const submitGuess = () => {
        if (gameState !== 'playing') return;
        if (currentGuess.some(color => color === null)) {
            alert('Please complete your guess before submitting!');
            return;
        }

        const feedback = mastermindEngine.evaluateGuess(currentGuess, secretCode);
        const newGuessHistory = [...guessHistory, [...currentGuess]];
        const newFeedbackHistory = [...feedbackHistory, feedback];
        
        setGuessHistory(newGuessHistory);
        setFeedbackHistory(newFeedbackHistory);
        setTotalGuesses(prev => prev + 1);

        // Check if guess is correct
        if (mastermindEngine.isWinningGuess(currentGuess, secretCode)) {
            setCorrectGuesses(prev => prev + 1);
            endGame(true);
            return;
        }

        // Check if out of attempts
        if (currentAttempt >= maxAttempts) {
            endGame(false);
            return;
        }

        // Track mistakes (guesses with low accuracy)
        const accuracy = (feedback.exactMatches / codeLength) * 100;
        if (accuracy < 25) {
            setMistakes(prev => prev + 1);
        }

        // Prepare for next guess
        setCurrentAttempt(prev => prev + 1);
        setCurrentGuess(new Array(codeLength).fill(null));
        setSelectedPosition(0);
    };

    // Use hint
    const useHint = () => {
        if (gameState !== 'playing' || hintsUsed >= maxHints) return;

        const hint = mastermindEngine.generateHint(currentGuess, secretCode, guessHistory, feedbackHistory);
        setLastHint(hint);
        setHintsUsed(prev => prev + 1);
        
        // Show hint for 5 seconds
        setTimeout(() => setLastHint(''), 5000);
    };

    // End game
    const endGame = (success) => {
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        setFinalScore(score);
        setGameState('finished');
        setShowCompletionModal(true);
        setShowSecretCode(true);
    };

    // Calculate completion percentage
    useEffect(() => {
        const progress = Math.min(100, (currentAttempt / maxAttempts) * 100);
        setCompletionPercentage(progress);
    }, [currentAttempt, maxAttempts]);

    // Calculate score
    const calculateScore = useCallback(() => {
        if (gameState !== 'playing') return score;

        const settings = difficultySettings[difficulty];
        
        // Base completion score (0-60 points) - based on attempts remaining
        const attemptsRemaining = maxAttempts - currentAttempt + 1;
        const completionScore = (attemptsRemaining / maxAttempts) * 60;

        // Accuracy bonus (0-40 points) - based on feedback quality
        let accuracyBonus = 0;
        if (feedbackHistory.length > 0) {
            const totalExactMatches = feedbackHistory.reduce((sum, feedback) => sum + feedback.exactMatches, 0);
            const maxPossibleMatches = feedbackHistory.length * codeLength;
            accuracyBonus = maxPossibleMatches > 0 ? (totalExactMatches / maxPossibleMatches) * 40 : 0;
        }

        // Time bonus (0-30 points)
        const timeUsed = settings.timeLimit - timeRemaining;
        const timeEfficiency = Math.max(0, 1 - (timeUsed / settings.timeLimit));
        const timeBonus = timeEfficiency * 30;

        // Speed bonus for quick solving (0-20 points)
        const speedBonus = currentAttempt < maxAttempts ? ((maxAttempts - currentAttempt) / maxAttempts) * 20 : 0;

        // Mistake penalty (subtract up to 15 points)
        const mistakePenalty = (mistakes / maxAttempts) * 15;

        // Hint penalty (subtract up to 10 points)
        const hintPenalty = (hintsUsed / maxHints) * 10;

        // Difficulty multiplier
        const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Medium' ? 1.0 : 1.2;

        // Deduction bonus for logical thinking (0-25 points)
        let deductionBonus = 0;
        if (feedbackHistory.length > 0) {
            const improvementRate = feedbackHistory.length > 1 ? 
                (feedbackHistory[feedbackHistory.length - 1].exactMatches - feedbackHistory[0].exactMatches) / feedbackHistory.length : 0;
            deductionBonus = Math.max(0, improvementRate * 25);
        }

        let finalScore = (completionScore + accuracyBonus + timeBonus + speedBonus + deductionBonus - mistakePenalty - hintPenalty) * difficultyMultiplier;

        // Apply scaling to make 200 very challenging
        finalScore = finalScore * 0.85;

        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [gameState, currentAttempt, maxAttempts, feedbackHistory, codeLength, timeRemaining, mistakes, hintsUsed, difficulty, score, maxHints]);

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
        generateNewPuzzle();
        setGameStartTime(Date.now());
    };

    // Handle reset game
    const handleReset = () => {
        initializeGame();
        setSecretCode([]);
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
    };

    // Get position button class
    const getPositionButtonClass = (position) => {
        const baseClass = 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg border-2 text-sm font-bold transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center';
        
        if (position === selectedPosition) {
            return baseClass + ' border-blue-500 bg-blue-100 ring-2 ring-blue-300 animate-pulse shadow-lg';
        } else if (currentGuess[position]) {
            return baseClass + ' border-gray-300 shadow-md hover:shadow-lg';
        } else {
            return baseClass + ' border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400';
        }
    };

    // Get color button class
    const getColorButtonClass = (color) => {
        const baseClass = 'w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg';
        const isSelected = currentGuess[selectedPosition] === color;
        
        if (isSelected) {
            return baseClass + ' border-white ring-4 ring-blue-300 animate-pulse';
        } else {
            return baseClass + ' border-gray-300 hover:border-gray-500';
        }
    };

    // Get feedback display
    const renderFeedback = (feedback, index) => {
        const exactPegs = Array(feedback.exactMatches).fill('exact');
        const colorPegs = Array(feedback.colorMatches).fill('color');
        const emptyPegs = Array(codeLength - feedback.totalCorrect).fill('empty');
        const allPegs = [...exactPegs, ...colorPegs, ...emptyPegs];

        return (
            <div className="flex flex-wrap gap-1 justify-center">
                {allPegs.map((pegType, pegIndex) => (
                    <div
                        key={pegIndex}
                        className={`w-3 h-3 rounded-full border ${
                            pegType === 'exact' ? 'bg-black border-black' :
                            pegType === 'color' ? 'bg-white border-black' :
                            'bg-gray-200 border-gray-300'
                        }`}
                        title={
                            pegType === 'exact' ? 'Correct color, correct position' :
                            pegType === 'color' ? 'Correct color, wrong position' :
                            'No match'
                        }
                    />
                ))}
            </div>
        );
    };

    // Custom stats for the framework
    const customStats = {
        attempts: currentAttempt,
        maxAttempts,
        hintsUsed,
        completionPercentage: Math.round(completionPercentage),
        accuracy: feedbackHistory.length > 0 ? 
            Math.round((feedbackHistory.reduce((sum, f) => sum + f.exactMatches, 0) / (feedbackHistory.length * codeLength)) * 100) : 0,
        correctGuesses,
        totalGuesses
    };

    return (
        <div>
            <Header unreadCount={3} />

            <GameFramework
                gameTitle="Mastermind Deduction"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Mastermind Deduction
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
                                        Guess the secret color code using logical deduction and feedback from each attempt.
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎚️ Difficulty Levels
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Easy:</strong> 4 colors, 6 options, 12 tries</li>
                                        <li>• <strong>Medium:</strong> 5 colors, 7 options, 10 tries</li>
                                        <li>• <strong>Hard:</strong> 6 colors, 8 options, 8 tries</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Feedback System
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• ⚫ Black peg: Right color, right position</li>
                                        <li>• ⚪ White peg: Right color, wrong position</li>
                                        <li>• 🔘 Gray peg: Color not in code</li>
                                        <li>• Use logic to deduce the code!</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎮 How to Play
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Click a position to select it</li>
                                        <li>• Choose colors to fill your guess</li>
                                        <li>• Submit and analyze the feedback</li>
                                        <li>• Use deduction to crack the code!</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Deductive Reasoning"
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
                            onClick={handleClearPosition}
                            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl"
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            <Eraser className="h-3 w-3 sm:h-4 sm:w-4" />
                            Clear
                        </button>

                        <button
                            onClick={() => setShowSecretCode(!showSecretCode)}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showSecretCode
                                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                                : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-xl'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            {showSecretCode ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                            {showSecretCode ? 'Hide' : 'Peek'} Code
                        </button>

                        <button
                            onClick={submitGuess}
                            disabled={currentGuess.some(color => color === null)}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${currentGuess.some(color => color === null)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                            Submit Guess
                        </button>
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-2xl px-2">
                        <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Attempt
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {currentAttempt}/{maxAttempts}
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
                                Code Length
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {codeLength} colors
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Hints Used
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {hintsUsed}/{maxHints}
                            </div>
                        </div>
                    </div>

                    {/* Secret Code Display (when peeking or game finished) */}
                    {showSecretCode && secretCode.length > 0 && (
                        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 max-w-md">
                            <h4 className="text-center text-sm font-semibold text-yellow-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Secret Code
                            </h4>
                            <div className="flex justify-center gap-2">
                                {secretCode.map((color, index) => (
                                    <div
                                        key={index}
                                        className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-lg"
                                        style={{ backgroundColor: mastermindEngine.colorHex[color] }}
                                        title={mastermindEngine.colorNames[color]}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Guess */}
                    <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-blue-300 max-w-md">
                        <h4 className="text-center text-lg font-semibold text-blue-800 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Current Guess (Attempt {currentAttempt})
                        </h4>
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {currentGuess.map((color, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePositionSelect(index)}
                                    className={getPositionButtonClass(index)}
                                    style={{ 
                                        backgroundColor: color ? mastermindEngine.colorHex[color] : undefined,
                                        fontFamily: 'Roboto, sans-serif'
                                    }}
                                    title={color ? mastermindEngine.colorNames[color] : `Position ${index + 1}`}
                                >
                                    {!color && (index + 1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-lg max-w-md">
                        <h4 className="text-center text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Select Color for Position {selectedPosition + 1}
                        </h4>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                            {availableColors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleColorSelect(color)}
                                    className={getColorButtonClass(color)}
                                    style={{ backgroundColor: mastermindEngine.colorHex[color] }}
                                    title={mastermindEngine.colorNames[color]}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Guess History */}
                    {guessHistory.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl w-full">
                            <h4 className="text-center text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Previous Guesses & Feedback
                            </h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {guessHistory.map((guess, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600 w-8">#{index + 1}</span>
                                            <div className="flex gap-1">
                                                {guess.map((color, colorIndex) => (
                                                    <div
                                                        key={colorIndex}
                                                        className="w-6 h-6 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: mastermindEngine.colorHex[color] }}
                                                        title={mastermindEngine.colorNames[color]}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs text-gray-600">
                                                <div>Exact: {feedbackHistory[index]?.exactMatches || 0}</div>
                                                <div>Color: {feedbackHistory[index]?.colorMatches || 0}</div>
                                            </div>
                                            {renderFeedback(feedbackHistory[index], index)}
                                        </div>
                                    </div>
                                ))}
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
                    {currentAttempt > maxAttempts * 0.75 && gameState === 'playing' && (
                        <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-pulse shadow-lg">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                Running out of attempts! Use your hints wisely.
                            </span>
                        </div>
                    )}

                    {gameState === 'finished' && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-pulse shadow-lg">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                Code cracked! Excellent deductive reasoning!
                            </span>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="text-center max-w-2xl text-xs sm:text-sm text-gray-600 px-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                        <p className="mb-2 leading-relaxed">
                            Click position buttons to select where to place colors. Use feedback to deduce the secret code through logical reasoning.
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
                    correctAnswers: correctGuesses,
                    totalQuestions: totalGuesses
                }}
            />
        </div>
    );
};

export default MastermindDeductionGame;