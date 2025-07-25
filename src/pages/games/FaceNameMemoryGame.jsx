import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import {
    Brain,
    Eye,
    CheckCircle,
    XCircle,
    ChevronUp,
    ChevronDown,
    Timer
} from 'lucide-react';

const FaceNameMemoryGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [lives, setLives] = useState(3);
    const [currentPhase, setCurrentPhase] = useState('learning'); // 'learning', 'testing'
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [learningTimeLeft, setLearningTimeLeft] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [totalResponseTime, setTotalResponseTime] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showInstructions, setShowInstructions] = useState(true);
    const [faces, setFaces] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    // Face data with diverse names and compressed Pexels images
    const faceDatabase = [
        { id: 1, name: 'Sarah Johnson', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 2, name: 'Michael Chen', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 3, name: 'Emily Rodriguez', image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 4, name: 'David Thompson', image: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 5, name: 'Priya Patel', image: 'https://images.pexels.com/photos/1499327/pexels-photo-1499327.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 6, name: 'James Wilson', image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 7, name: 'Anna Kowalski', image: 'https://images.pexels.com/photos/1122868/pexels-photo-1122868.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 8, name: 'Carlos Garcia', image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 9, name: 'Lisa Zhang', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 10, name: 'Ahmed Hassan', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 11, name: 'Sophie Martin', image: 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' },
        { id: 12, name: 'Robert Kim', image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' }
    ];

    // Difficulty settings
    const difficultySettings = {
        Easy: {
            faceCount: 6,
            learningTime: 15,
            timeLimit: 120,
            lives: 3,
            description: '6 faces, 15s learning time'
        },
        Medium: {
            faceCount: 8,
            learningTime: 15,
            timeLimit: 120,
            lives: 3,
            description: '8 faces, 15s learning time'
        },
        Hard: {
            faceCount: 10,
            learningTime: 15,
            timeLimit: 120,
            lives: 3,
            description: '10 faces, 15s learning time'
        }
    };

    // Generate questions from faces
    const generateQuestion = useCallback((faceList, questionIndex) => {
        if (questionIndex >= faceList.length) return null;

        const correctFace = faceList[questionIndex];
        const wrongOptions = faceDatabase
            .filter(face => !faceList.some(f => f.id === face.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = [correctFace, ...wrongOptions]
            .sort(() => Math.random() - 0.5);

        return {
            face: correctFace,
            options: allOptions,
            correctAnswer: correctFace.name
        };
    }, []); // faceDatabase static

    // Handle answer selection
    const handleAnswerSelect = (selectedName) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(selectedName);
        const responseTime = Date.now() - questionStartTime;
        setTotalResponseTime(prev => prev + responseTime);

        const isCorrect = selectedName === currentQuestion.correctAnswer;

        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                setMaxStreak(current => Math.max(current, newStreak));
                return newStreak;
            });
            setFeedbackType('correct');
            setFeedbackMessage('Correct! Great memory!');
        } else {
            setStreak(0);
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    endGame();
                }
                return newLives;
            });
            setFeedbackType('incorrect');
            setFeedbackMessage(`Incorrect! That was ${currentQuestion.correctAnswer}.`);
        }

        setShowFeedback(true);

        setTimeout(() => {
            setShowFeedback(false);
            if (lives > 1 || isCorrect) {
                nextQuestion();
            }
        }, 1500);
    };

    // Move to next question
    const nextQuestion = () => {
        setSelectedAnswer(null);
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= faces.length) {
            endGame();
            return;
        }

        setCurrentQuestionIndex(nextIndex);
        const nextQ = generateQuestion(faces, nextIndex);
        setCurrentQuestion(nextQ);
        setQuestionStartTime(Date.now());
    };

    // End the game
    const endGame = () => {
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        setFinalScore(score);
        setGameState('finished');
        setShowCompletionModal(true);
    };

    // Calculate score based on multiple factors
    const calculateScore = useCallback(() => {
        if (totalQuestions === 0 || gameState !== 'playing') return score;

        const settings = difficultySettings[difficulty];
        const accuracy = correctAnswers / totalQuestions;
        const avgResponseTime = totalQuestions > 0 ? totalResponseTime / totalQuestions / 1000 : 0;

        // Base score from accuracy (0-70 points)
        let baseScore = accuracy * 70;

        // Speed bonus (max 25 points)
        const idealResponseTime = difficulty === 'Easy' ? 6 : difficulty === 'Medium' ? 5 : 4;
        const speedBonus = Math.max(0, Math.min(25, (idealResponseTime - avgResponseTime) * 4));

        // Streak bonus (max 30 points)
        const streakBonus = Math.min(maxStreak * 3, 30);

        // Lives bonus (max 20 points)
        const livesBonus = (lives / settings.lives) * 20;

        // Time remaining bonus (max 25 points)
        const timeRemainingBonus = Math.min(25, (timeRemaining / settings.timeLimit) * 25);

        // Difficulty multiplier
        const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Medium' ? 1.0 : 1.2;

        // Perfect game bonus
        const perfectBonus = (accuracy === 1.0 && lives === settings.lives) ? 20 : 0;

        let finalScore = (baseScore + speedBonus + streakBonus + livesBonus + timeRemainingBonus + perfectBonus) * difficultyMultiplier;

        // Apply final modifier to make 200 very challenging
        finalScore = finalScore * 0.85;

        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [correctAnswers, totalQuestions, totalResponseTime, lives, maxStreak, timeRemaining, difficulty, gameState, score]);

    // Update score during gameplay
    useEffect(() => {
        if (gameState === 'playing') {
            const newScore = calculateScore();
            setScore(newScore);
        }
    }, [calculateScore, gameState]);

    // Timer management
    useEffect(() => {
        let interval;

        if (gameState === 'playing' && currentPhase === 'learning' && learningTimeLeft > 0) {
            interval = setInterval(() => {
                setLearningTimeLeft(prev => {
                    if (prev <= 1) {
                        setCurrentPhase('testing');
                        const firstQuestion = generateQuestion(faces, 0);
                        setCurrentQuestion(firstQuestion);
                        setQuestionStartTime(Date.now());
                        setTotalQuestions(faces.length);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (gameState === 'playing' && currentPhase === 'testing' && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [gameState, currentPhase, learningTimeLeft, timeRemaining, faces, generateQuestion]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];

        // Reset all game state
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setLives(settings.lives);
        setCurrentPhase('learning');
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setTotalQuestions(0);
        setStreak(0);
        setMaxStreak(0);
        setLearningTimeLeft(settings.learningTime);
        setTotalResponseTime(0);
        setGameDuration(0);
        setShowCompletionModal(false);
        setShowFeedback(false);
        setSelectedAnswer(null);

        // Select random faces for this game
        const selectedFaces = faceDatabase
            .sort(() => Math.random() - 0.5)
            .slice(0, settings.faceCount);

        setFaces(selectedFaces);

        // Preload images
        selectedFaces.forEach(face => {
            const img = new Image();
            img.src = face.image;
        });
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
        setGameState('playing');
    };

    const handleReset = () => {
        initializeGame();
        setCurrentQuestion(null);
        setGameState('ready');
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
        averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0,
        streak: maxStreak,
        lives
    };

    return (
        <div>
            {/* Shake animation CSS */}
            <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-3px); }
        }
        .shake { animation: shake 0.4s ease; }
      `}</style>

            <Header unreadCount={3} />

            <GameFramework
                gameTitle="Face Name Memory"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Face Name Memory
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
                                        👥 Learning Phase
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Study the faces and names carefully. You have 15 seconds before testing begins.
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🧠 Testing Phase
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Select the correct name for each face shown. You have 3 lives - lose them all and the game ends!
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Scoring System
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Accuracy and speed bonuses</li>
                                        <li>• Streak multipliers</li>
                                        <li>• Lives and time remaining bonuses</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 Difficulty Levels
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Easy:</strong> 6 faces, 15s study time</li>
                                        <li>• <strong>Medium:</strong> 8 faces, 15s study time</li>
                                        <li>• <strong>Hard:</strong> 10 faces, 15s study time</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Memory"
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
                <div className="flex flex-col items-center">
                    {/* Game Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-2xl">
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
                                Correct
                            </div>
                            <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {correctAnswers}/{totalQuestions || faces.length}
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Learning Phase */}
                        {currentPhase === 'learning' && (
                            <motion.div
                                key="learning"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className="w-full max-w-4xl"
                            >
                                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Eye className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            Learning Phase - Study These Faces
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-blue-700">
                                        <Timer className="h-4 w-4" />
                                        <span className="font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            Time Remaining: {learningTimeLeft}s
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-2 bg-blue-200 rounded mt-3 overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{ width: `${(learningTimeLeft / difficultySettings[difficulty].learningTime) * 100}%` }}
                                            className="h-full bg-blue-500"
                                            transition={{ ease: 'linear' }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {faces.map((face, index) => (
                                        <motion.div
                                            key={face.id}
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.07, type: 'spring', stiffness: 200 }}
                                            className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 text-center transition transform hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <img
                                                src={face.image}
                                                alt={face.name}
                                                loading="lazy"
                                                className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-gray-200"
                                            />
                                            <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                {face.name}
                                            </div>
                                            <div className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                Person #{index + 1}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Testing Phase */}
                        {currentPhase === 'testing' && currentQuestion && (
                            <motion.div
                                key="testing"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className="w-full max-w-2xl"
                            >
                                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Brain className="h-5 w-5 text-green-600" />
                                        <h3 className="text-lg font-semibold text-green-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            Testing Phase - Who Is This Person?
                                        </h3>
                                    </div>
                                    <div className="text-green-700">
                                        <span className="font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            Question {currentQuestionIndex + 1} of {faces.length}
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-2 bg-green-200 rounded mt-3 overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{ width: `${(timeRemaining / difficultySettings[difficulty].timeLimit) * 100}%` }}
                                            className="h-full bg-green-500"
                                            transition={{ ease: 'linear' }}
                                        />
                                    </div>
                                </div>

                                {/* Current Face */}
                                <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-6 text-center">
                                    <img
                                        src={currentQuestion.face.image}
                                        alt="Person to identify"
                                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                                    />
                                    <div className="text-lg font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        What is this person's name?
                                    </div>
                                </div>

                                {/* Answer Options */}
                                <div className="grid grid-cols-1 gap-3">
                                    {currentQuestion.options.map((option) => {
                                        const isCorrect = option.name === currentQuestion.correctAnswer;
                                        const isSelected = selectedAnswer === option.name;
                                        return (
                                            <motion.button
                                                key={option.id}
                                                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                                                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                                                onClick={() => handleAnswerSelect(option.name)}
                                                disabled={selectedAnswer !== null}
                                                className={`
                          p-4 rounded-lg border-2 transition-all duration-300 text-left transform
                          ${selectedAnswer === null
                                                        ? 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                                                        : isSelected
                                                            ? isCorrect
                                                                ? 'border-green-500 bg-green-100 text-green-800 animate-pulse'
                                                                : 'border-red-500 bg-red-100 text-red-800 shake'
                                                            : isCorrect
                                                                ? 'border-green-500 bg-green-100 text-green-800'
                                                                : 'border-gray-300 bg-gray-100 text-gray-500'
                                                    }
                        `}
                                                style={{ fontFamily: 'Roboto, sans-serif' }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{option.name}</span>
                                                    {selectedAnswer !== null && (
                                                        <span className="text-sm">
                                                            {isCorrect ? '✓' : isSelected ? '✗' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Feedback */}
                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className={`w-full max-w-2xl text-center p-4 rounded-lg mt-6 ${feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    {feedbackType === 'correct' ? (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    )}
                                    <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        {feedbackType === 'correct' ? 'Correct!' : 'Incorrect!'}
                                    </div>
                                </div>
                                <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                    {feedbackMessage}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Instructions */}
                    <div className="text-center max-w-2xl mt-6">
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                            {currentPhase === 'learning'
                                ? 'Study each face and name carefully. You\'ll be tested on your memory after the timer runs out!'
                                : 'Look at the face and select the correct name from the options below. Be quick but accurate!'
                            }
                        </p>
                        <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {difficulty} Mode: {difficultySettings[difficulty].description} | {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit | {difficultySettings[difficulty].lives} lives
                        </div>
                    </div>
                </div>
            </GameFramework>

            <AnimatePresence>
                {showCompletionModal && (
                    <GameCompletionModal
                        isOpen={showCompletionModal}
                        onClose={() => setShowCompletionModal(false)}
                        score={finalScore}
                        difficulty={difficulty}
                        duration={gameDuration}
                        customStats={{
                            correctAnswers,
                            totalQuestions
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FaceNameMemoryGame;
