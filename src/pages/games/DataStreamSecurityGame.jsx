import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import TranslatedText from '../../components/TranslatedText.jsx';
import { useTranslateText } from '../../hooks/useTranslate';
import {
    Lock,
    Unlock,
    Eye,
    Brain,
    Zap,
    CheckCircle,
    XCircle,
    ChevronUp,
    ChevronDown,
    Timer,
    Cpu
} from 'lucide-react';

const DataStreamSecurityGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    
    // Translated strings for dynamic messages
    const securityLockBypassedText = useTranslateText('Security lock bypassed! Data stream authenticated.');
    const accessDeniedText = useTranslateText('Access denied! Pattern sequence broken.');
    const accessGrantedText = useTranslateText('ACCESS GRANTED');
    const accessDeniedLabelText = useTranslateText('ACCESS DENIED');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [currentPhase, setCurrentPhase] = useState('learning'); // 'learning', 'unlocking'
    const [lives, setLives] = useState(3);
    const [currentLockIndex, setCurrentLockIndex] = useState(0);
    const [correctUnlocks, setCorrectUnlocks] = useState(0);
    const [totalLocks, setTotalLocks] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [learningTimeLeft, setLearningTimeLeft] = useState(0);
    const [patternSequence, setPatternSequence] = useState([]);
    const [currentLock, setCurrentLock] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showInstructions, setShowInstructions] = useState(true);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);
    const [totalResponseTime, setTotalResponseTime] = useState(0);
    const [lockStartTime, setLockStartTime] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [streamAnimation, setStreamAnimation] = useState(true);
    const streamRef = useRef(null);
    const [streamWidth, setStreamWidth] = useState(800);

    // Track container width so animation distance matches the black surface only
    useEffect(() => {
        const updateWidth = () => {
            if (streamRef.current) {
                setStreamWidth(streamRef.current.clientWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Data stream colors and symbols
    const streamColors = ['#00ff41', '#0066ff', '#ff0066', '#ffff00', '#ff6600', '#9900ff'];
    const streamSymbols = ['◆', '●', '▲', '■', '◇', '☀'];

    // Difficulty settings - Updated as requested
    const difficultySettings = {
        Easy: {
            patternLength: 5,
            learningTime: 15,
            timeLimit: 120,
            lives: 3,
            lockCount: 8,
            streamSpeed: 2200,
            pointsPerCorrect: 25,
            description: '5-step patterns, 15s study time, 8 locks, 25 points each'
        },
        Moderate: {
            patternLength: 5,
            learningTime: 12,
            timeLimit: 120,
            lives: 3,
            lockCount: 5,
            streamSpeed: 1700,
            pointsPerCorrect: 40,
            description: '5-step patterns, 12s study time, 5 locks, 40 points each'
        },
        Hard: {
            patternLength: 5,
            learningTime: 10,
            timeLimit: 120,
            lives: 3,
            lockCount: 4,
            streamSpeed: 1400,
            pointsPerCorrect: 50,
            description: '5-step patterns, 10s study time, 4 locks, 50 points each'
        }
    };
    
    // Translated difficulty descriptions
    const easyDescription = useTranslateText('5-step patterns, 15s study time, 8 locks, 25 points each');
    const moderateDescription = useTranslateText('5-step patterns, 12s study time, 5 locks, 40 points each');
    const hardDescription = useTranslateText('5-step patterns, 10s study time, 4 locks, 50 points each');
    
    const getDifficultyDescription = (diff) => {
        if (diff === 'Easy') return easyDescription;
        if (diff === 'Moderate') return moderateDescription;
        return hardDescription;
    };

    // Generate pattern sequence
    const generatePattern = useCallback((length) => {
        const pattern = [];
        for (let i = 0; i < length; i++) {
            pattern.push({
                id: i,
                color: streamColors[Math.floor(Math.random() * streamColors.length)],
                symbol: streamSymbols[Math.floor(Math.random() * streamSymbols.length)]
            });
        }
        return pattern;
    }, []);

    // Generate security lock challenge
    const generateLock = useCallback((pattern, lockIndex) => {
        if (lockIndex >= pattern.length - 1) return null;

        // Get the current position in the pattern
        const currentElement = pattern[lockIndex];
        const nextElement = pattern[lockIndex + 1];

        // Create wrong options
        const wrongOptions = [];
        const availableColors = streamColors.filter(c => c !== nextElement.color);
        const availableSymbols = streamSymbols.filter(s => s !== nextElement.symbol);

        // Generate 3 wrong options
        for (let i = 0; i < 3; i++) {
            wrongOptions.push({
                color: availableColors[Math.floor(Math.random() * availableColors.length)],
                symbol: availableSymbols[Math.floor(Math.random() * availableSymbols.length)]
            });
        }

        // Shuffle all options
        const allOptions = [nextElement, ...wrongOptions].sort(() => Math.random() - 0.5);

        return {
            lockIndex: lockIndex + 1,
            currentElement,
            correctAnswer: nextElement,
            options: allOptions,
            sequence: pattern.slice(0, lockIndex + 1)
        };
    }, []);

    // Handle lock answer selection
    const handleAnswerSelect = (selectedOption) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(selectedOption);
        const responseTime = Date.now() - lockStartTime;
        setTotalResponseTime(prev => prev + responseTime);

        const isCorrect = selectedOption.color === currentLock.correctAnswer.color && 
                         selectedOption.symbol === currentLock.correctAnswer.symbol;

        if (isCorrect) {
            setCorrectUnlocks(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                setMaxStreak(current => Math.max(current, newStreak));
                return newStreak;
            });
            setFeedbackType('correct');
            setFeedbackMessage(securityLockBypassedText);
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
            setFeedbackMessage(accessDeniedText);
        }

        setShowFeedback(true);

        setTimeout(() => {
            setShowFeedback(false);
            if (lives > 1 || isCorrect) {
                nextLock();
            }
        }, 1500);
    };

    // Move to next lock
    const nextLock = () => {
        setSelectedAnswer(null);
        const nextIndex = currentLockIndex + 1;

        if (nextIndex >= totalLocks) {
            endGame();
            return;
        }

        setCurrentLockIndex(nextIndex);
        const nextLockData = generateLock(patternSequence, nextIndex);
        setCurrentLock(nextLockData);
        setLockStartTime(Date.now());
    };

    // End the game
    const endGame = () => {
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        setFinalScore(calculateScore());
        //setFinalScore(score);
        setGameState('finished');
        setShowCompletionModal(true);
        setStreamAnimation(false);
    };

    // Calculate score - Updated as requested
    const calculateScore = useCallback(() => {
        return correctUnlocks * difficultySettings[difficulty].pointsPerCorrect;
    }, [correctUnlocks, difficulty]);

    // Update score during gameplay
    useEffect(() => {
        if (gameState === 'playing') {
            setFinalScore(calculateScore());
        }
    }, [calculateScore, gameState]);

    // Timer management
    useEffect(() => {
        let interval;

        if (gameState === 'playing' && currentPhase === 'learning' && learningTimeLeft > 0) {
            interval = setInterval(() => {
                setLearningTimeLeft(prev => {
                    if (prev <= 1) {
                        setCurrentPhase('unlocking');
                        const firstLock = generateLock(patternSequence, 0);
                        setCurrentLock(firstLock);
                        setLockStartTime(Date.now());
                        setTotalLocks(Math.min(difficultySettings[difficulty].lockCount, patternSequence.length - 1));
                        setStreamAnimation(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (gameState === 'playing' && currentPhase === 'unlocking' && timeRemaining > 0) {
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
    }, [gameState, currentPhase, learningTimeLeft, timeRemaining, patternSequence, generateLock, difficulty]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];

        // Reset all state
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setLives(settings.lives);
        setCurrentPhase('learning');
        setCurrentLockIndex(0);
        setCorrectUnlocks(0);
        setTotalLocks(0);
        setStreak(0);
        setMaxStreak(0);
        setLearningTimeLeft(settings.learningTime);
        setTotalResponseTime(0);
        setGameDuration(0);
        setShowCompletionModal(false);
        setShowFeedback(false);
        setSelectedAnswer(null);
        setStreamAnimation(true);

        // Generate new pattern
        const newPattern = generatePattern(settings.patternLength);
        setPatternSequence(newPattern);
    }, [difficulty, generatePattern]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
        setGameState('playing');
    };

    const handleReset = () => {
        initializeGame();
        setCurrentLock(null);
        setGameState('ready');
    };

    const handleGameComplete = (payload) => {
    };

    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
        }
    };

    const customStats = {
        correctUnlocks,
        totalLocks: totalLocks || difficultySettings[difficulty].lockCount,
        accuracy: totalLocks > 0 ? Math.round((correctUnlocks / totalLocks) * 100) : 0,
        averageResponseTime: totalLocks > 0 ? Math.round(totalResponseTime / totalLocks / 1000) : 0,
        streak: maxStreak,
        lives
    };

    return (
        <div>
            <style>{`
                @keyframes dataFlow {
                    0% { transform: translateX(-100px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(calc(100vw + 100px)); opacity: 0; }
                }
                
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px currentColor; }
                    50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
                }
                
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    50% { transform: translateX(4px); }
                    75% { transform: translateX(-3px); }
                }
                
                .data-stream-item {
                    animation: dataFlow 3s linear infinite;
                }
                
                .glow-effect {
                    animation: glow 2s ease-in-out infinite;
                }
                
                .shake { 
                    animation: shake 0.4s ease; 
                }
                
                .cyber-grid {
                    background-image: 
                        linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>

            {gameState === 'ready' && <Header unreadCount={3} />}

            <GameFramework
                gameTitle={<TranslatedText text="Data Stream Security" />}
        gameShortDescription={<TranslatedText text="Protect data streams from cyber threats. Challenge your cybersecurity knowledge and strategic thinking!" />}
                gameDescription={
                    <div className="mx-auto px-1 mb-2">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    <TranslatedText text="How to Play Data Stream Security" />
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showInstructions
                                        ? <ChevronUp className="h-5 w-5 text-blue-900" />
                                        : <ChevronDown className="h-5 w-5 text-blue-900" />}
                                </span>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                                <div className='bg-white p-3 rounded-lg border-l-4 border-cyan-500'>
                                    <h4 className="text-sm font-medium text-cyan-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 <TranslatedText text="Game Objective" />
                                    </h4>
                                    <p className="text-sm text-cyan-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <TranslatedText text="Memorize a sequence of colored symbols and predict the next elements to unlock security systems." />
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg border-l-4 border-purple-500'>
                                    <h4 className="text-sm font-medium text-purple-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🌊 <TranslatedText text="Learning Phase" />
                                    </h4>
                                    <p className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <TranslatedText text="Carefully study the flowing data stream pattern. You'll have limited time to memorize the sequence." />
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg border-l-4 border-green-500'>
                                    <h4 className="text-sm font-medium text-green-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🔒 <TranslatedText text="Unlocking Phase" />
                                    </h4>
                                    <p className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <TranslatedText text="Predict the next symbol in the sequence to bypass security locks. Each correct answer earns points based on difficulty." />
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg border-l-4 border-orange-500'>
                                    <h4 className="text-sm font-medium text-orange-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🏆 <TranslatedText text="Scoring System" />
                                    </h4>
                                    <ul className="text-sm text-orange-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong><TranslatedText text="Easy" />:</strong> <TranslatedText text="25 points per correct answer" /></li>
                                        <li>• <strong><TranslatedText text="Moderate" />:</strong> <TranslatedText text="40 points per correct answer" /></li>
                                        <li>• <strong><TranslatedText text="Hard" />:</strong> <TranslatedText text="50 points per correct answer" /></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Gameacy"
                gameState={gameState}
                setGameState={setGameState}
                score={calculateScore()} //gameState === 'finished' ? finalScore : score}
                timeRemaining={timeRemaining}
                difficulty={difficulty}
                setDifficulty={handleDifficultyChange}
                onStart={handleStart}
                onReset={handleReset}
                onGameComplete={handleGameComplete}
                customStats={customStats}
            >
                <div className="flex flex-col items-center">
                    {/* Game Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 w-full max-w-2xl">
                        <div className="text-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                            <div className="text-sm text-red-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <TranslatedText text="Security Lives" />
                            </div>
                            <div className="text-lg font-bold text-red-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {'🔐'.repeat(lives)}
                            </div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                            <div className="text-sm text-green-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <TranslatedText text="Unlock Streak" />
                            </div>
                            <div className="text-lg font-bold text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {streak} 🔓
                            </div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="text-sm text-blue-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <TranslatedText text="Bypassed" />
                            </div>
                            <div className="text-lg font-bold text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {correctUnlocks}/{totalLocks || difficultySettings[difficulty].lockCount}
                            </div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                            <div className="text-sm text-purple-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <TranslatedText text="Status" />
                            </div>
                            <div className="text-lg font-bold text-purple-700 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <TranslatedText text={currentPhase} />
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
                                transition={{ duration: 0.35 }}
                                className="w-full max-w-4xl"
                            >
                                <div className="bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-300 rounded-lg p-6 mb-6 text-center cyber-grid">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <Eye className="h-6 w-6 text-cyan-600 glow-effect" />
                                        <h3 className="text-xl font-bold text-cyan-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            <TranslatedText text="Data Stream Analysis - Learning Phase" />
                                        </h3>
                                        <Cpu className="h-6 w-6 text-cyan-600 glow-effect" />
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-cyan-700 mb-3">
                                        <Timer className="h-5 w-5" />
                                        <span className="font-bold text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            <TranslatedText text="Scanning Time:" /> {learningTimeLeft}s
                                        </span>
                                    </div>
                                    <div className="h-3 bg-cyan-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{ width: `${(learningTimeLeft / difficultySettings[difficulty].learningTime) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                            transition={{ ease: 'linear' }}
                                        />
                                    </div>
                                </div>

                                {/* Data Stream Visualization */}
                                <div className="bg-black rounded-lg p-6 mb-6 min-h-[200px] relative overflow-hidden border-2 border-gray-700">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/20 to-transparent"></div>
                                    <h4 className="text-green-400 text-center mb-4 font-mono text-lg">
                                        &gt; <TranslatedText text="ANALYZING DATA STREAM PATTERN" /> &lt;
                                    </h4>
                                    
                                    {/* Flowing Data Stream */}
                                    {streamAnimation && (
                                        <div ref={streamRef} className="relative h-32 overflow-hidden">
                                            {patternSequence.map((item, index) => {
                                                // Slow down a bit more and ensure each symbol passes at least twice (repeat: 1)
                                                const durationSec = difficulty === 'Easy' ? 9 : difficulty === 'Moderate' ? 8 : 7;
                                                const stepDelay = difficulty === 'Easy' ? 1.0 : difficulty === 'Moderate' ? 0.85 : 0.7;
                                                const repeatDelay = 0; // no extra gap between loops
                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ x: -120, opacity: 0 }}
                                                        animate={{ x: streamWidth + 120, opacity: [0, 1, 1, 0] }}
                                                        transition={{
                                                            duration: durationSec,
                                                            delay: index * stepDelay,
                                                            repeat: 1,
                                                            repeatDelay
                                                        }}
                                                        className="absolute top-1/2 -translate-y-1/2"
                                                        style={{ 
                                                            color: item.color,
                                                            fontSize: '2rem',
                                                            fontWeight: 'bold',
                                                            textShadow: `0 0 10px ${item.color}`,
                                                            top: `${20 + (index % 3) * 30}px`
                                                        }}
                                                    >
                                                        {item.symbol}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Pattern Display */}
                                    <div className="mt-8 text-center">
                                        <div className="text-green-400 mb-2 font-mono"><TranslatedText text="PATTERN SEQUENCE:" /></div>
                                        <div className="flex justify-center gap-4 flex-wrap">
                                            {patternSequence.map((item, index) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-gray-800 rounded-lg p-3 border border-gray-600 glow-effect"
                                                    style={{ 
                                                        borderColor: item.color,
                                                        boxShadow: `0 0 10px ${item.color}40`
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <div 
                                                            className="text-2xl font-bold mb-1"
                                                            style={{ color: item.color }}
                                                        >
                                                            {item.symbol}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono">
                                                            #{index + 1}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Unlocking Phase */}
                        {currentPhase === 'unlocking' && currentLock && (
                            <motion.div
                                key="unlocking"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                className="w-full max-w-3xl"
                            >
                                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-6 mb-6 text-center cyber-grid">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <Lock className="h-6 w-6 text-purple-600 glow-effect" />
                                        <h3 className="text-xl font-bold text-purple-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            <TranslatedText text="Security Lock" /> #{currentLockIndex + 1}
                                        </h3>
                                        <Brain className="h-6 w-6 text-purple-600 glow-effect" />
                                    </div>
                                    <div className="text-purple-700">
                                        <span className="font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            <TranslatedText text="Lock" /> {currentLockIndex + 1} <TranslatedText text="of" /> {totalLocks}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-purple-200 rounded-full mt-3 overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{ width: `${((currentLockIndex + 1) / totalLocks) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>

                                {/* Current Sequence Display */}
                                <div className="bg-gray-900 rounded-lg p-6 mb-6 border-2 border-gray-700">
                                    <div className="text-green-400 text-center mb-4 font-mono">
                                        <TranslatedText text="CURRENT SEQUENCE:" />
                                    </div>
                                    <div className="flex justify-center gap-3 mb-4">
                                        {currentLock.sequence.map((item, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-800 rounded-lg p-3 border glow-effect"
                                                style={{ 
                                                    borderColor: item.color,
                                                    boxShadow: `0 0 10px ${item.color}40`
                                                }}
                                            >
                                                <div 
                                                    className="text-xl font-bold text-center"
                                                    style={{ color: item.color }}
                                                >
                                                    {item.symbol}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="bg-gray-800 rounded-lg p-3 border-2 border-dashed border-yellow-500 flex items-center justify-center">
                                            <div className="text-yellow-400 text-xl font-bold">?</div>
                                        </div>
                                    </div>
                                    <div className="text-yellow-400 text-center font-mono text-sm">
                                        <TranslatedText text="PREDICT NEXT ELEMENT TO UNLOCK SECURITY SYSTEM" />
                                    </div>
                                </div>

                                {/* Answer Options */}
                                <div className="grid grid-cols-2 gap-4">
                                    {currentLock.options.map((option, index) => {
                                        const isCorrect = option.color === currentLock.correctAnswer.color && 
                                                         option.symbol === currentLock.correctAnswer.symbol;
                                        const isSelected = selectedAnswer && 
                                                          selectedAnswer.color === option.color && 
                                                          selectedAnswer.symbol === option.symbol;
                                        
                                        return (
                                            <motion.button
                                                key={index}
                                                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                                                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                                                onClick={() => handleAnswerSelect(option)}
                                                disabled={selectedAnswer !== null}
                                                className={`
                                                    p-6 rounded-lg border-2 transition-all duration-300 text-center transform bg-gray-800
                                                    ${selectedAnswer === null
                                                        ? 'border-gray-600 hover:border-blue-400 hover:bg-gray-700'
                                                        : isSelected
                                                            ? isCorrect
                                                                ? 'border-green-500 bg-green-900 text-green-100 glow-effect'
                                                                : 'border-red-500 bg-red-900 text-red-100 shake'
                                                            : isCorrect
                                                                ? 'border-green-500 bg-green-900 text-green-100 glow-effect'
                                                                : 'border-gray-600 bg-gray-700 text-gray-400'
                                                    }
                                                `}
                                                style={{ 
                                                    borderColor: selectedAnswer === null ? option.color : undefined,
                                                    boxShadow: selectedAnswer === null ? `0 0 10px ${option.color}40` : undefined
                                                }}
                                            >
                                                <div 
                                                    className="text-4xl font-bold mb-2"
                                                    style={{ color: selectedAnswer === null ? option.color : undefined }}
                                                >
                                                    {option.symbol}
                                                </div>
                                                <div className="text-sm font-mono opacity-75">
                                                    <TranslatedText text="Option" /> {String.fromCharCode(65 + index)}
                                                </div>
                                                {selectedAnswer !== null && (
                                                    <div className="mt-2 text-lg">
                                                        {isCorrect ? <Unlock className="h-6 w-6 mx-auto" /> : 
                                                         isSelected ? <XCircle className="h-6 w-6 mx-auto" /> : ''}
                                                    </div>
                                                )}
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
                                className={`w-full max-w-2xl text-center p-6 rounded-lg mt-6 border-2 ${
                                    feedbackType === 'correct' 
                                        ? 'bg-green-900 text-green-100 border-green-500' 
                                        : 'bg-red-900 text-red-100 border-red-500'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    {feedbackType === 'correct' ? (
                                        <CheckCircle className="h-8 w-8 text-green-400" />
                                    ) : (
                                        <XCircle className="h-8 w-8 text-red-400" />
                                    )}
                                    <div className="text-xl font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        {feedbackType === 'correct' ? accessGrantedText : accessDeniedLabelText}
                                    </div>
                                    {feedbackType === 'correct' && <Zap className="h-8 w-8 text-yellow-400" />}
                                </div>
                                <div className="text-sm font-mono" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                    <TranslatedText text={feedbackMessage} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Game Instructions */}
                    <div className="text-center max-w-3xl mt-6">
                        <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                            {currentPhase === 'learning'
                                ? <TranslatedText text="Study the data stream pattern flowing across the screen. Memorize the sequence of colored symbols - you'll need to predict the next elements to unlock security systems!" />
                                : <TranslatedText text="Based on the memorized pattern, select the correct next element to bypass the security lock. Wrong answers will cost you a life!" />
                            }
                        </p>
                        <div className="mt-3 text-xs text-gray-500 bg-gray-100 rounded-lg p-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            <strong><TranslatedText text={difficulty} /> <TranslatedText text="Mode:" /></strong> {getDifficultyDescription(difficulty)} | 
                            {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} <TranslatedText text="time limit" /> | 
                            {difficultySettings[difficulty].lives} <TranslatedText text="lives" />
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
                            correctUnlocks,
                            totalLocks
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DataStreamSecurityGame;