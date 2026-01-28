import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Brain, CheckCircle, XCircle, Lightbulb, Trophy, Clock, Target, ChevronUp, ChevronDown, Heart } from 'lucide-react';

const syllogismData = {
    Easy: [
        {
            id: 1,
            premise1: "All cats are animals.",
            premise2: "All animals need food.",
            conclusion: "All cats need food.",
            isValid: true,
            explanation: "This follows the pattern: All A are B, All B are C, therefore All A are C (valid syllogism)."
        },
        {
            id: 2,
            premise1: "All birds can fly.",
            premise2: "Penguins are birds.",
            conclusion: "Penguins can fly.",
            isValid: false,
            explanation: "While the logic structure is valid, the first premise is factually incorrect (not all birds can fly)."
        },
        {
            id: 3,
            premise1: "All roses are flowers.",
            premise2: "All flowers are plants.",
            conclusion: "All roses are plants.",
            isValid: true,
            explanation: "This is a valid categorical syllogism following the AAA-1 pattern."
        },
        {
            id: 4,
            premise1: "No fish are mammals.",
            premise2: "All whales are mammals.",
            conclusion: "No whales are fish.",
            isValid: true,
            explanation: "This follows the pattern: No A are B, All C are B, therefore No C are A (valid)."
        },
        {
            id: 5,
            premise1: "All dogs are loyal.",
            premise2: "Some pets are dogs.",
            conclusion: "Some pets are loyal.",
            isValid: true,
            explanation: "This follows the pattern: All A are B, Some C are A, therefore Some C are B (valid)."
        },
        {
            id: 6,
            premise1: "All cars have wheels.",
            premise2: "This bicycle has wheels.",
            conclusion: "This bicycle is a car.",
            isValid: false,
            explanation: "This commits the fallacy of affirming the consequent. Having wheels doesn't make something a car."
        },
        {
            id: 7,
            premise1: "All students study hard.",
            premise2: "John is a student.",
            conclusion: "John studies hard.",
            isValid: true,
            explanation: "This follows the valid pattern: All A are B, X is A, therefore X is B."
        },
        {
            id: 8,
            premise1: "No reptiles are warm-blooded.",
            premise2: "All snakes are reptiles.",
            conclusion: "No snakes are warm-blooded.",
            isValid: true,
            explanation: "This follows the pattern: No A are B, All C are A, therefore No C are B (valid)."
        },
        {
            id: 9,
            premise1: "All mammals are warm-blooded.",
            premise2: "Dolphins are mammals.",
            conclusion: "Dolphins are warm-blooded.",
            isValid: true,
            explanation: "All A are B; X is A; therefore X is B (valid)."
        },
        {
            id: 10,
            premise1: "All cups have handles.",
            premise2: "This mug has a handle.",
            conclusion: "This mug is a cup.",
            isValid: false,
            explanation: "Affirming the consequent: having a handle doesn't make it a cup."
        }
    ],
    Moderate: [
        {
            id: 1,
            premise1: "Some politicians are honest.",
            premise2: "All honest people are trustworthy.",
            conclusion: "Some politicians are trustworthy.",
            isValid: true,
            explanation: "This follows the pattern: Some A are B, All B are C, therefore Some A are C (valid)."
        },
        {
            id: 2,
            premise1: "All squares are rectangles.",
            premise2: "Some rectangles are not squares.",
            conclusion: "Some rectangles are squares.",
            isValid: true,
            explanation: "If all squares are rectangles, then at least some rectangles must be squares."
        },
        {
            id: 3,
            premise1: "No vegetarians eat meat.",
            premise2: "Some healthy people are vegetarians.",
            conclusion: "Some healthy people do not eat meat.",
            isValid: true,
            explanation: "This combines universal negative with particular affirmative validly."
        },
        {
            id: 4,
            premise1: "All geniuses are creative.",
            premise2: "Some creative people are not recognized.",
            conclusion: "Some geniuses are not recognized.",
            isValid: false,
            explanation: "This commits the fallacy of the undistributed middle term."
        },
        {
            id: 5,
            premise1: "Some books are educational.",
            premise2: "All educational materials are valuable.",
            conclusion: "Some books are valuable.",
            isValid: true,
            explanation: "This follows the valid pattern: Some A are B, All B are C, therefore Some A are C."
        },
        {
            id: 6,
            premise1: "All professional athletes are disciplined.",
            premise2: "No lazy people are disciplined.",
            conclusion: "No professional athletes are lazy.",
            isValid: true,
            explanation: "This follows the pattern: All A are B, No C are B, therefore No A are C (valid)."
        },
        {
            id: 7,
            premise1: "Some scientists are Nobel laureates.",
            premise2: "All Nobel laureates are brilliant.",
            conclusion: "All scientists are brilliant.",
            isValid: false,
            explanation: "This commits the fallacy of hasty generalization from 'some' to 'all'."
        },
        {
            id: 8,
            premise1: "All effective medicines are tested.",
            premise2: "Some herbal remedies are not tested.",
            conclusion: "Some herbal remedies are not effective medicines.",
            isValid: true,
            explanation: "This follows from the contrapositive: if not tested, then not effective medicine."
        }
    ],
    Hard: [
        {
            id: 1,
            premise1: "All things that promote happiness are good.",
            premise2: "Some pleasures do not promote happiness.",
            conclusion: "Some pleasures are not good.",
            isValid: true,
            explanation: "This uses the contrapositive: if something doesn't promote happiness, it's not good."
        },
        {
            id: 2,
            premise1: "No circular arguments are valid.",
            premise2: "Some invalid arguments are persuasive.",
            conclusion: "Some circular arguments are persuasive.",
            isValid: false,
            explanation: "This commits the fallacy of the undistributed middle term."
        },
        {
            id: 3,
            premise1: "All rational decisions are based on evidence.",
            premise2: "Some intuitive choices are not based on evidence.",
            conclusion: "Some intuitive choices are not rational decisions.",
            isValid: true,
            explanation: "This follows from contraposition: not evidence-based implies not rational."
        },
        {
            id: 4,
            premise1: "Some complex problems have simple solutions.",
            premise2: "All simple solutions are elegant.",
            conclusion: "Some complex problems have elegant solutions.",
            isValid: true,
            explanation: "This follows the pattern: Some A have B, All B are C, therefore Some A have C."
        },
        {
            id: 5,
            premise1: "All meaningful statements are either analytic or synthetic.",
            premise2: "Some philosophical propositions are not analytic.",
            conclusion: "Some philosophical propositions are synthetic.",
            isValid: false,
            explanation: "This assumes philosophical propositions are meaningful statements, which isn't stated."
        }
    ]
};

const SyllogismGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(300);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);
    const [totalResponseTime, setTotalResponseTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [maxQuestions, setMaxQuestions] = useState(10);
    const [usedQuestionIds, setUsedQuestionIds] = useState(new Set());
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
    const [lives, setLives] = useState(3);

    const DIFFICULTY_ALIASES = { Moderate: 'Moderate', easy: 'Easy', hard: 'Hard' };
    const normalizeDifficulty = (d) => DIFFICULTY_ALIASES[d] || d;

    // Updated difficulty settings with your requested values
    const difficultySettings = {
        Easy: { 
            timeLimit: 150, 
            hints: 3, 
            questionsCount: 10, 
            pointsPerQuestion: 20,
            description: 'Basic syllogisms with clear logical patterns' 
        },
        Moderate: { 
            timeLimit: 120, 
            hints: 2, 
            questionsCount: 8, 
            pointsPerQuestion: 25,
            description: 'Moderate complexity with some tricky logical structures' 
        },
        Hard: { 
            timeLimit: 90, 
            hints: 1, 
            questionsCount: 5, 
            pointsPerQuestion: 40,
            description: 'Complex philosophical and abstract reasoning' 
        }
    };

    const POINTS_PER_QUESTION = useMemo(() => {
        const settings = difficultySettings[difficulty] || difficultySettings.Easy;
        return settings.pointsPerQuestion;
    }, [difficulty]);

    const scoreRef = useRef(0);
    useEffect(() => { scoreRef.current = score; }, [score]);

    // Initialize available questions when difficulty changes
    useEffect(() => {
        if (gameState === 'ready') {
            const diffKey = normalizeDifficulty(difficulty);
            const questions = syllogismData[diffKey] || syllogismData.Easy;
            setAvailableQuestions([...questions]);
            
            // Reset timer for the new difficulty
            const settings = difficultySettings[diffKey] || difficultySettings.Easy;
            setTimeRemaining(settings.timeLimit);
        }
    }, [difficulty, gameState]);

    // Load next question
    const loadNextQuestion = useCallback(() => {
        const diffKey = normalizeDifficulty(difficulty);
        const settings = difficultySettings[diffKey] || difficultySettings.Easy;
        
        // Check if game should end due to no lives
        if (lives <= 0) {
            handleGameEnd();
            return;
        }
        
        // Check if game should end due to no more questions
        if (availableQuestions.length === 0) {
            handleGameEnd();
            return;
        }

        // Check if we've reached the maximum number of questions
        if (questionNumber >= settings.questionsCount) {
            handleGameEnd();
            return;
        }

        // Get a random question from available questions
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const newQuestion = availableQuestions[randomIndex];
        
        // Remove this question from available questions
        setAvailableQuestions(prev => {
            const updated = [...prev];
            updated.splice(randomIndex, 1);
            return updated;
        });

        setUsedQuestionIds(prev => new Set(prev.add(newQuestion.id)));
        setCurrentQuestion(newQuestion);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowExplanation(false);
        setIsCorrectAnswer(null);
        setQuestionStartTime(Date.now());
        setQuestionNumber(prev => prev + 1);
    }, [difficulty, availableQuestions, lives, questionNumber]);

    // Handle answer selection
    const handleAnswerSelect = (answer) => {
        if (selectedAnswer !== null || showFeedback) return;

        const responseTime = Date.now() - questionStartTime;
        setTotalResponseTime((prev) => prev + responseTime);
        setSelectedAnswer(answer);
        setTotalQuestions((prev) => prev + 1);

        const isCorrect = answer === currentQuestion.isValid;
        setIsCorrectAnswer(isCorrect);
        const isLast = questionNumber >= maxQuestions - 1;

        let nextScoreLocal = scoreRef.current;
        let newLives = lives;

        if (isCorrect) {
            setCorrectAnswers((prev) => prev + 1);
            nextScoreLocal = Math.min(
                200,
                +(scoreRef.current + POINTS_PER_QUESTION).toFixed(2)
            );

            setStreak((prev) => {
                const newStreak = prev + 1;
                setMaxStreak((current) => Math.max(current, newStreak));
                return newStreak;
            });

            setFeedbackType('correct');
            setFeedbackMessage('Correct! Well reasoned.');
        } else {
            setWrongAnswers((prev) => prev + 1);
            newLives = lives - 1;
            setLives(newLives);
            
            setStreak(0);
            setFeedbackType('incorrect');
            setFeedbackMessage('Incorrect. You lost a life.');
        }

        setScore(nextScoreLocal);
        scoreRef.current = nextScoreLocal;

        setShowFeedback(true);
        setShowExplanation(true);

        setTimeout(() => {
            // Check if game should end due to no lives
            if (newLives <= 0) {
                handleGameEnd(nextScoreLocal);
                return;
            }
            
            // Check if we've reached the maximum number of questions
            if (isLast) {
                handleGameEnd(nextScoreLocal);
                return;
            }
            
            // Check if there are no more questions
            if (availableQuestions.length <= 1) {
                handleGameEnd(nextScoreLocal);
                return;
            }
            
            loadNextQuestion();
        }, 3000);
    };

    // Use hint
    const useHint = () => {
        if (hintsUsed >= maxHints || showFeedback) return;

        setHintsUsed(prev => prev + 1);
        setShowExplanation(true);

        setTimeout(() => {
            if (!showFeedback) {
                setShowExplanation(false);
            }
        }, 5000);
    };

    // Handle game end
    const handleGameEnd = (finalOverride) => {
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        const final = typeof finalOverride === 'number' ? finalOverride : scoreRef.current;
        setFinalScore(Math.round(final));
        setGameState('finished');
        setShowCompletionModal(true);
    };

    // Timer countdown
    useEffect(() => {
        let interval;
        if (gameState === 'playing' && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleGameEnd();
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
        const diffKey = normalizeDifficulty(difficulty);
        const settings = difficultySettings[diffKey] || difficultySettings.Easy;

        // Reset all questions for the selected difficulty
        const questions = syllogismData[diffKey] || syllogismData.Easy;
        setAvailableQuestions([...questions]);
        
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setQuestionNumber(0);
        setCorrectAnswers(0);
        setTotalQuestions(0);
        setStreak(0);
        setMaxStreak(0);
        setHintsUsed(0);
        setMaxHints(settings.hints);
        setMaxQuestions(settings.questionsCount);
        setWrongAnswers(0);
        setUsedQuestionIds(new Set());
        setTotalResponseTime(0);
        setGameDuration(0);
        setShowCompletionModal(false);
        setIsCorrectAnswer(null);
        setLives(3);
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
        setGameState('playing');
        loadNextQuestion();
    };

    const handleReset = () => {
        initializeGame();
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowExplanation(false);
        setGameState('ready');
    };

    const handleGameComplete = (payload) => {
    };

    // Prevent difficulty change during gameplay
    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
            
            // Reset timer for the new difficulty
            const settings = difficultySettings[newDifficulty] || difficultySettings.Easy;
            setTimeRemaining(settings.timeLimit);
        }
    };

    const customStats = {
        correctAnswers,
        totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        streak: maxStreak,
        hintsUsed,
        questionNumber,
        averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0,
        livesRemaining: lives
    };

    return (
        <div>
            {gameState === 'ready' && <Header unreadCount={3} />}

            <GameFramework
                gameTitle="Syllogism Solver Game"
        gameShortDescription="Solve logical arguments using premises and conclusions. Challenge your deductive reasoning skills!"
                gameDescription={
                    <div className="mx-auto px-1 mb-2">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Syllogism Solver
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
                                        Analyze two premises and determine if the conclusion logically follows. Choose "Valid" or "Invalid" based on logical reasoning.
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🧠 Logic Rules
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Valid: Conclusion must follow from premises</li>
                                        <li>• Invalid: Conclusion doesn't logically follow</li>
                                        <li>• Focus on structure, not just truth</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Scoring
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Easy: 10 questions, 20 points each</li>
                                        <li>• Moderate: 8 questions, 25 points each</li>
                                        <li>• Hard: 5 questions, 40 points each</li>
                                        <li>• You have 3 lives - lose one for each wrong answer</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💡 Difficulty
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Easy:</strong> Basic logical patterns</li>
                                        <li>• <strong>Moderate:</strong> Medium complexity</li>
                                        <li>• <strong>Hard:</strong> Abstract reasoning</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Logic"
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
                <div className="max-w-4xl mx-auto">
                    {/* Game Controls */}
                    <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                        {gameState === 'playing' && (
                            <button
                                onClick={useHint}
                                disabled={hintsUsed >= maxHints || showFeedback}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints || showFeedback
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Question
                            </div>
                            <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {questionNumber}/{maxQuestions}
                            </div>
                        </div>
                        {/* <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Correct
                            </div>
                            <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {correctAnswers}/{totalQuestions}
                            </div>
                        </div> */}
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Streak
                            </div>
                            <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {streak}
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Points
                            </div>
                            <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {score.toFixed(0)}
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Lives
                            </div>
                            <div className="text-lg font-semibold text-red-600 flex justify-center items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Heart 
                                        key={i} 
                                        className={`h-5 w-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    {currentQuestion && (
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="h-6 w-6 text-[#FF6B3E]" />
                                <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Question {questionNumber}
                                </h3>
                                <span className="text-sm text-gray-500 ml-auto">
                                    {POINTS_PER_QUESTION} points
                                </span>
                            </div>

                            {/* Premises and Conclusion */}
                            <div className="space-y-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        Premise 1:
                                    </h4>
                                    <p className="text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        {currentQuestion.premise1}
                                    </p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        Premise 2:
                                    </h4>
                                    <p className="text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        {currentQuestion.premise2}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        Conclusion:
                                    </h4>
                                    <p className="text-gray-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        {currentQuestion.conclusion}
                                    </p>
                                </div>
                            </div>

                            {/* Answer Buttons */}
                            <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
                                {[
                                    { label: 'Valid', value: true, icon: <CheckCircle /> },
                                    { label: 'Invalid', value: false, icon: <XCircle /> }
                                ].map(({ label, value, icon }) => {
                                    const isSel = selectedAnswer === value;
                                    const correct = currentQuestion?.isValid === value;
                                    // base classes + responsive width
                                    const base =
                                        'w-full md:w-auto px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-transform';
                                    let colorClasses = 'bg-gray-300 text-gray-500';
                                    if (selectedAnswer === null) {
                                        colorClasses =
                                            value === true
                                                ? 'bg-green-500 text-white hover:scale-105'
                                                : 'bg-red-500 text-white hover:scale-105';
                                    } else if (isSel) {
                                        colorClasses = correct
                                            ? 'bg-green-600 text-white'
                                            : 'bg-red-600 text-white';
                                    }
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => handleAnswerSelect(value)}
                                            disabled={selectedAnswer !== null}
                                            className={`${base} ${colorClasses}`}
                                        >
                                            {React.cloneElement(icon, { className: 'h-5 w-5' })}
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback */}
                            {showFeedback && (
                                <div className={`rounded-lg p-4 mb-4 ${feedbackType === 'correct' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {feedbackType === 'correct' ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        <span className={`font-semibold ${feedbackType === 'correct' ? 'text-green-800' : 'text-red-800'
                                            }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            {feedbackMessage}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${feedbackType === 'correct' ? 'text-green-700' : 'text-red-700'
                                        }`} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        {isCorrectAnswer ? `+${POINTS_PER_QUESTION} points` : `You have ${lives} ${lives === 1 ? 'life' : 'lives'} remaining`}
                                    </p>
                                </div>
                            )}

                            {/* Explanation */}
                            {showExplanation && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                                        <h4 className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            Explanation
                                        </h4>
                                    </div>
                                    <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        {currentQuestion.explanation}
                                    </p>
                                </div>
                            )}
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
                    accuracy: customStats.accuracy,
                    livesRemaining: lives
                }}
            />
        </div>
    );
};

export default SyllogismGame;