import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Brain, CheckCircle, XCircle, Lightbulb, Trophy, Clock, Target, ChevronUp, ChevronDown } from 'lucide-react';

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
            id: 25,
            premise1: "All mammals are warm-blooded.",
            premise2: "Dolphins are mammals.",
            conclusion: "Dolphins are warm-blooded.",
            isValid: true,
            explanation: "All A are B; X is A; therefore X is B (valid)."
        },
        {
            id: 26,
            premise1: "All cups have handles.",
            premise2: "This mug has a handle.",
            conclusion: "This mug is a cup.",
            isValid: false,
            explanation: "Affirming the consequent: having a handle doesn't make it a cup."
        },
        {
            id: 27,
            premise1: "No insects are vertebrates.",
            premise2: "All bees are insects.",
            conclusion: "No bees are vertebrates.",
            isValid: true,
            explanation: "No A are B; All C are A; therefore No C are B (valid)."
        },
        {
            id: 28,
            premise1: "Some cars are electric.",
            premise2: "All electric vehicles need power.",
            conclusion: "Some cars need power.",
            isValid: true,
            explanation: "Some A are B; All B are C; therefore Some A are C (valid)."
        },
        {
            id: 29,
            premise1: "All squares have four sides.",
            premise2: "This shape has four sides.",
            conclusion: "This shape is a square.",
            isValid: false,
            explanation: "Converse error: having four sides doesn't imply being a square."
        },
        {
            id: 30,
            premise1: "All teachers read books.",
            premise2: "Maria reads books.",
            conclusion: "Maria is a teacher.",
            isValid: false,
            explanation: "Undistributed middle: from 'reads books' you can't infer 'teacher'."
        },
        {
            id: 31,
            premise1: "All triangles are polygons.",
            premise2: "All polygons are shapes.",
            conclusion: "All triangles are shapes.",
            isValid: true,
            explanation: "All A are B; All B are C; therefore All A are C (valid)."
        }
    ],
    Medium: [
        {
            id: 9,
            premise1: "Some politicians are honest.",
            premise2: "All honest people are trustworthy.",
            conclusion: "Some politicians are trustworthy.",
            isValid: true,
            explanation: "This follows the pattern: Some A are B, All B are C, therefore Some A are C (valid)."
        },
        {
            id: 10,
            premise1: "All squares are rectangles.",
            premise2: "Some rectangles are not squares.",
            conclusion: "Some rectangles are squares.",
            isValid: true,
            explanation: "If all squares are rectangles, then at least some rectangles must be squares."
        },
        {
            id: 11,
            premise1: "No vegetarians eat meat.",
            premise2: "Some healthy people are vegetarians.",
            conclusion: "Some healthy people do not eat meat.",
            isValid: true,
            explanation: "This combines universal negative with particular affirmative validly."
        },
        {
            id: 12,
            premise1: "All geniuses are creative.",
            premise2: "Some creative people are not recognized.",
            conclusion: "Some geniuses are not recognized.",
            isValid: false,
            explanation: "This commits the fallacy of the undistributed middle term."
        },
        {
            id: 13,
            premise1: "Some books are educational.",
            premise2: "All educational materials are valuable.",
            conclusion: "Some books are valuable.",
            isValid: true,
            explanation: "This follows the valid pattern: Some A are B, All B are C, therefore Some A are C."
        },
        {
            id: 14,
            premise1: "All professional athletes are disciplined.",
            premise2: "No lazy people are disciplined.",
            conclusion: "No professional athletes are lazy.",
            isValid: true,
            explanation: "This follows the pattern: All A are B, No C are B, therefore No A are C (valid)."
        },
        {
            id: 15,
            premise1: "Some scientists are Nobel laureates.",
            premise2: "All Nobel laureates are brilliant.",
            conclusion: "All scientists are brilliant.",
            isValid: false,
            explanation: "This commits the fallacy of hasty generalization from 'some' to 'all'."
        },
        {
            id: 16,
            premise1: "All effective medicines are tested.",
            premise2: "Some herbal remedies are not tested.",
            conclusion: "Some herbal remedies are not effective medicines.",
            isValid: true,
            explanation: "This follows from the contrapositive: if not tested, then not effective medicine."
        },
        {
            id: 32,
            premise1: "Some artists are painters.",
            premise2: "All painters use brushes.",
            conclusion: "Some artists use brushes.",
            isValid: true,
            explanation: "Some A are B; All B are C; therefore Some A are C (valid)."
        },
        {
            id: 33,
            premise1: "All metals conduct electricity.",
            premise2: "Some coins are metals.",
            conclusion: "Some coins conduct electricity.",
            isValid: true,
            explanation: "All A are B; Some C are A; therefore Some C are B (valid)."
        },
        {
            id: 34,
            premise1: "All writers are readers.",
            premise2: "Some readers are not critics.",
            conclusion: "Some writers are not critics.",
            isValid: false,
            explanation: "Undistributed middle: 'some readers not critics' need not be writers."
        },
        {
            id: 35,
            premise1: "Some programmers are gamers.",
            premise2: "No gamers are early sleepers.",
            conclusion: "Some programmers are not early sleepers.",
            isValid: true,
            explanation: "Some A are B; No B are C; therefore Some A are not C (valid)."
        },
        {
            id: 36,
            premise1: "All fruits are healthy.",
            premise2: "Some snacks are fruits.",
            conclusion: "Some snacks are healthy.",
            isValid: true,
            explanation: "All A are B; Some C are A; therefore Some C are B (valid)."
        },
        {
            id: 37,
            premise1: "All poets are imaginative.",
            premise2: "Some imaginative people are not practical.",
            conclusion: "Some poets are not practical.",
            isValid: false,
            explanation: "Undistributed middle: 'imaginative' doesn't connect poets to 'not practical'."
        },
        {
            id: 38,
            premise1: "No reptiles have fur.",
            premise2: "Some animals have fur.",
            conclusion: "Some animals are not reptiles.",
            isValid: true,
            explanation: "No A are B; Some C are B; therefore Some C are not A (valid)."
        },
        {
            id: 39,
            premise1: "All engineers like mathematics.",
            premise2: "All mathematicians like puzzles.",
            conclusion: "All engineers like puzzles.",
            isValid: false,
            explanation: "Undistributed middle: no link from 'like mathematics' to 'like puzzles'."
        },
        {
            id: 40,
            premise1: "Some students are diligent.",
            premise2: "All diligent people succeed.",
            conclusion: "Some students succeed.",
            isValid: true,
            explanation: "Some A are B; All B are C; therefore Some A are C (valid)."
        },
        {
            id: 41,
            premise1: "All squares are rectangles.",
            premise2: "All rectangles are quadrilaterals.",
            conclusion: "All squares are quadrilaterals.",
            isValid: true,
            explanation: "All A are B; All B are C; therefore All A are C (valid)."
        }
    ],
    Hard: [
        {
            id: 17,
            premise1: "All things that promote happiness are good.",
            premise2: "Some pleasures do not promote happiness.",
            conclusion: "Some pleasures are not good.",
            isValid: true,
            explanation: "This uses the contrapositive: if something doesn't promote happiness, it's not good."
        },
        {
            id: 18,
            premise1: "No circular arguments are valid.",
            premise2: "Some invalid arguments are persuasive.",
            conclusion: "Some circular arguments are persuasive.",
            isValid: false,
            explanation: "This commits the fallacy of the undistributed middle term."
        },
        {
            id: 19,
            premise1: "All rational decisions are based on evidence.",
            premise2: "Some intuitive choices are not based on evidence.",
            conclusion: "Some intuitive choices are not rational decisions.",
            isValid: true,
            explanation: "This follows from contraposition: not evidence-based implies not rational."
        },
        {
            id: 20,
            premise1: "Some complex problems have simple solutions.",
            premise2: "All simple solutions are elegant.",
            conclusion: "Some complex problems have elegant solutions.",
            isValid: true,
            explanation: "This follows the pattern: Some A have B, All B are C, therefore Some A have C."
        },
        {
            id: 21,
            premise1: "All meaningful statements are either analytic or synthetic.",
            premise2: "Some philosophical propositions are not analytic.",
            conclusion: "Some philosophical propositions are synthetic.",
            isValid: false,
            explanation: "This assumes philosophical propositions are meaningful statements, which isn't stated."
        },
        {
            id: 22,
            premise1: "No contradictory statements can both be true.",
            premise2: "All paradoxes contain contradictory statements.",
            conclusion: "No paradoxes can be entirely true.",
            isValid: true,
            explanation: "This follows the pattern: No A can be B, All C contain A, therefore No C can be B."
        },
        {
            id: 23,
            premise1: "All sustainable practices consider future generations.",
            premise2: "Some profitable activities do not consider future generations.",
            conclusion: "Some profitable activities are not sustainable practices.",
            isValid: true,
            explanation: "This uses contraposition: if it doesn't consider future generations, it's not sustainable."
        },
        {
            id: 24,
            premise1: "Some ethical theories are consequentialist.",
            premise2: "All consequentialist theories focus on outcomes.",
            conclusion: "All ethical theories focus on outcomes.",
            isValid: false,
            explanation: "This commits the fallacy of hasty generalization from 'some' to 'all'."
        },
        {
            id: 42,
            premise1: "All just actions are permissible.",
            premise2: "Some punishments are not permissible.",
            conclusion: "Some punishments are not just actions.",
            isValid: true,
            explanation: "All A are B; Some C are not B; therefore Some C are not A (valid)."
        },
        {
            id: 43,
            premise1: "No coherent theories are self-contradictory.",
            premise2: "Some proposed theories are self-contradictory.",
            conclusion: "Some proposed theories are not coherent.",
            isValid: true,
            explanation: "No A are B; Some C are B; therefore Some C are not A (valid)."
        },
        {
            id: 44,
            premise1: "All knowledge requires justification.",
            premise2: "Some true beliefs lack justification.",
            conclusion: "Some true beliefs are not knowledge.",
            isValid: true,
            explanation: "All A are B; Some C are not B; therefore Some C are not A (valid)."
        },
        {
            id: 45,
            premise1: "Some norms are culturally relative.",
            premise2: "All culturally relative norms vary across societies.",
            conclusion: "Some norms vary across societies.",
            isValid: true,
            explanation: "Some A are B; All B are C; therefore Some A are C (valid)."
        },
        {
            id: 46,
            premise1: "All obligations imply ability ('ought' implies 'can').",
            premise2: "Some demands do not imply ability.",
            conclusion: "Some demands are not obligations.",
            isValid: true,
            explanation: "All A are B; Some C are not B; therefore Some C are not A (valid)."
        },
        {
            id: 47,
            premise1: "All necessary truths hold in every possible world.",
            premise2: "Some mathematical conjectures do not hold in every possible world.",
            conclusion: "Some mathematical conjectures are not necessary truths.",
            isValid: true,
            explanation: "All A are B; Some C are not B; therefore Some C are not A (valid)."
        },
        {
            id: 48,
            premise1: "No perfectly rational agents act akratically.",
            premise2: "Some humans act akratically.",
            conclusion: "Some humans are not perfectly rational agents.",
            isValid: true,
            explanation: "No A are B; Some C are B; therefore Some C are not A (valid)."
        },
        {
            id: 49,
            premise1: "All explanations increase understanding.",
            premise2: "Some metaphors increase understanding.",
            conclusion: "Some metaphors are explanations.",
            isValid: false,
            explanation: "Converse error: from 'all explanations increase understanding' we can't infer the reverse."
        },
        {
            id: 50,
            premise1: "Some beliefs are incorrigible.",
            premise2: "All incorrigible beliefs are self-justifying.",
            conclusion: "Some beliefs are self-justifying.",
            isValid: true,
            explanation: "Some A are B; All B are C; therefore Some A are C (valid)."
        },
        {
            id: 51,
            premise1: "All evidence-based policies are revisable.",
            premise2: "Some dogmas are not revisable.",
            conclusion: "Some dogmas are not evidence-based policies.",
            isValid: true,
            explanation: "All A are B; Some C are not B; therefore Some C are not A (valid)."
        },
        {
            id: 52,
            premise1: "All consistent sets of statements can be modeled.",
            premise2: "Some paradoxes cannot be modeled.",
            conclusion: "Some paradoxes are not consistent sets of statements.",
            isValid: true,
            explanation: "All A are B; Some C are not B; therefore Some C are not A (valid)."
        },
        {
            id: 53,
            premise1: "All transparent decisions are accountable.",
            premise2: "Some opaque decisions are not accountable.",
            conclusion: "Some opaque decisions are not transparent decisions.",
            isValid: true,
            explanation: "All A are B; Some C are not B; therefore Some C are not A (valid)."
        }
    ]
};

const getRandomSyllogisms = (difficulty, count = 10) => {
    const syllogisms = syllogismData[difficulty] || syllogismData.Easy;
    const shuffled = [...syllogisms].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

const getRandomSyllogism = (difficulty) => {
    const syllogisms = syllogismData[difficulty] || syllogismData.Easy;
    return syllogisms[Math.floor(Math.random() * syllogisms.length)];
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
    const [maxQuestions, setMaxQuestions] = useState(20);
    const [usedQuestionIds, setUsedQuestionIds] = useState(new Set());

    const POINTS_PER_QUESTION = useMemo(() => {
        return 200 / (maxQuestions || 1);
    }, [maxQuestions]);

    const scoreRef = useRef(0);
    useEffect(() => { scoreRef.current = score; }, [score]);

    // Difficulty settings
    const difficultySettings = {
        Easy: { timeLimit: 300, hints: 3, questionsCount: 15, description: 'Basic syllogisms with clear logical patterns' },
        Medium: { timeLimit: 240, hints: 2, questionsCount: 18, description: 'Moderate complexity with some tricky logical structures' },
        Hard: { timeLimit: 180, hints: 1, questionsCount: 20, description: 'Complex philosophical and abstract reasoning' }
    };

    // Load next question
    const loadNextQuestion = useCallback(() => {
        let newQuestion;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            newQuestion = getRandomSyllogism(difficulty);
            attempts++;
        } while (usedQuestionIds.has(newQuestion.id) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            // If we've exhausted questions, end the game
            handleGameEnd();
            return;
        }

        setUsedQuestionIds(prev => new Set(prev.add(newQuestion.id)));
        setCurrentQuestion(newQuestion);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowExplanation(false);
        setQuestionStartTime(Date.now());
        setQuestionNumber(prev => prev + 1);
    }, [difficulty, usedQuestionIds]);

    // Handle answer selection
    const handleAnswerSelect = (answer) => {
        if (selectedAnswer !== null || showFeedback) return;

        const responseTime = Date.now() - questionStartTime;
        setTotalResponseTime((prev) => prev + responseTime);
        setSelectedAnswer(answer);
        setTotalQuestions((prev) => prev + 1);

        const isCorrect = answer === currentQuestion.isValid;

        // Compute if this is the last question BEFORE any async operations
        const isLast = questionNumber >= difficultySettings[difficulty].questionsCount;

        // Compute the next score locally from the ref so we don't rely on stale state
        let nextScoreLocal = scoreRef.current;

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

            nextScoreLocal = Math.max(
                0,
                +(scoreRef.current - POINTS_PER_QUESTION).toFixed(2)
            );

            setStreak(0);
            setFeedbackType('incorrect');
            setFeedbackMessage('Incorrect. Study the explanation.');
        }

        // Commit the computed score to state AND the ref
        setScore(nextScoreLocal);
        scoreRef.current = nextScoreLocal;

        setShowFeedback(true);
        setShowExplanation(true);

        // Auto advance or end after a short delay
        setTimeout(() => {
            if (isLast) {
                // Pass the exact final score so the modal shows 200 (or whatever the final is)
                handleGameEnd(nextScoreLocal);
            } else {
                loadNextQuestion();
            }
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
        const settings = difficultySettings[difficulty];
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
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
        loadNextQuestion();
    };

    const handleReset = () => {
        initializeGame();
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowExplanation(false);
    };

    const handleGameComplete = (payload) => {
        console.log('Game completed:', payload);
    };

    // Prevent difficulty change during gameplay
    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
        }
    };

    const customStats = {
        correctAnswers,
        totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        streak: maxStreak,
        hintsUsed,
        questionNumber,
        averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0
    };

    return (
        <div>
            <Header unreadCount={3} />

            <GameFramework
                gameTitle="Syllogism Solver Game"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
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
                                        <li>• Each correct answer: +{POINTS_PER_QUESTION.toFixed(2)} points</li>
                                        <li>• Each wrong answer: −{POINTS_PER_QUESTION.toFixed(2)} points (score never goes below 0)</li>
                                        <li>• Max score: 200 points</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💡 Difficulty
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Easy:</strong> Basic logical patterns</li>
                                        <li>• <strong>Medium:</strong> Moderate complexity</li>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Question
                            </div>
                            <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {questionNumber}/{maxQuestions}
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Correct
                            </div>
                            <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {correctAnswers}/{totalQuestions}
                            </div>
                        </div>
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
                                Accuracy
                            </div>
                            <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {customStats.accuracy}%
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
                                        The correct answer is: <strong>{currentQuestion.isValid ? 'Valid' : 'Invalid'}</strong>
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
                    accuracy: customStats.accuracy
                }}
            />
        </div>
    );
};

export default SyllogismGame;