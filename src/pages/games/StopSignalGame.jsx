import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { ArrowRight, Square, Timer, Target, TrendingUp, ChevronUp, ChevronDown, Zap, Award, Star } from 'lucide-react';

const StopSignalGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(300);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    // Game-specific state
    const [currentSignal, setCurrentSignal] = useState(null);
    const [signalStartTime, setSignalStartTime] = useState(0);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [trialNumber, setTrialNumber] = useState(0);
    const [totalTrials, setTotalTrials] = useState(0);
    const [goTrials, setGoTrials] = useState(0);
    const [stopTrials, setStopTrials] = useState(0);
    const [correctGo, setCorrectGo] = useState(0);
    const [correctStop, setCorrectStop] = useState(0);
    const [missedGo, setMissedGo] = useState(0);
    const [failedStop, setFailedStop] = useState(0);
    const [reactionTimes, setReactionTimes] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [feedbackType, setFeedbackType] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [nextTrialTimeout, setNextTrialTimeout] = useState(null);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [particles, setParticles] = useState([]);
    const [isSignalAnimating, setIsSignalAnimating] = useState(false);
    const [scoreAnimation, setScoreAnimation] = useState(0);
    const [lastScoreGain, setLastScoreGain] = useState(0);

    const stopTimeoutRef = useRef(null);
    const missTimeoutRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const gameEndTimeRef = useRef(null);
    const particleRef = useRef(null);

    const difficultySettings = {
        Easy: {
            timeLimit: 300,
            stopSignalDelay: 250,
            stopProbability: 0.25,
            maxReactionTime: 1500,
            trialInterval: 2000,
            description: 'Longer reaction time, fewer stop signals',
            color: 'from-green-400 to-emerald-600',
            bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100'
        },
        Medium: {
            timeLimit: 240,
            stopSignalDelay: 200,
            stopProbability: 0.30,
            maxReactionTime: 1200,
            trialInterval: 1700,
            description: 'Moderate timing, balanced stop signals',
            color: 'from-yellow-400 to-orange-600',
            bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100'
        },
        Hard: {
            timeLimit: 180,
            stopSignalDelay: 150,
            stopProbability: 0.35,
            maxReactionTime: 1000,
            trialInterval: 1500,
            description: 'Fast timing, frequent stop signals',
            color: 'from-red-400 to-rose-600',
            bgColor: 'bg-gradient-to-br from-red-50 to-rose-100'
        }
    };

    // Particle system
    const createParticles = (type, count = 15) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Math.random(),
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 8 + 4,
                color: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
                velocity: {
                    x: (Math.random() - 0.5) * 10,
                    y: (Math.random() - 0.5) * 10
                },
                life: 1,
                decay: Math.random() * 0.02 + 0.01
            });
        }
        setParticles(newParticles);

        // Clear particles after animation
        setTimeout(() => setParticles([]), 2000);
    };

    const animateScore = (gain) => {
        setLastScoreGain(gain);
        setScoreAnimation(1);
        setTimeout(() => setScoreAnimation(0), 1000);
    };

    const handleResponse = useCallback(() => {
        if (!isWaitingForResponse || !currentSignal) return;

        const reactionTime = Date.now() - signalStartTime;
        const settings = difficultySettings[difficulty];

        setIsWaitingForResponse(false);
        setIsSignalAnimating(true);

        if (currentSignal === 'go') {
            setCorrectGo(prev => prev + 1);
            setReactionTimes(prev => [...prev, reactionTime]);
            setStreak(prev => {
                const newStreak = prev + 1;
                setBestStreak(current => Math.max(current, newStreak));
                return newStreak;
            });

            const scoreGain = Math.max(5, Math.floor(20 - (reactionTime / 100)));
            animateScore(scoreGain);

            setFeedback(`Excellent! ${reactionTime}ms`);
            setFeedbackType('success');
            createParticles('success', 20);
        } else if (currentSignal === 'stop') {
            setFailedStop(prev => prev + 1);
            setStreak(0);
            setFeedback('Failed to stop!');
            setFeedbackType('error');
            createParticles('error', 10);
        }

        setShowFeedback(true);
        setTimeout(() => {
            setShowFeedback(false);
            setIsSignalAnimating(false);
        }, 1000);

        clearTimeout(stopTimeoutRef.current);
        clearTimeout(missTimeoutRef.current);

        setTimeout(() => {
            startNextTrial();
        }, 1200);
    }, [isWaitingForResponse, currentSignal, signalStartTime, difficulty]);

    const handleMissedResponse = useCallback(() => {
        if (!isWaitingForResponse || !currentSignal) return;

        setIsWaitingForResponse(false);
        setIsSignalAnimating(true);

        if (currentSignal === 'go') {
            setMissedGo(prev => prev + 1);
            setStreak(0);
            setFeedback('Too slow!');
            setFeedbackType('error');
            createParticles('error', 8);
        } else if (currentSignal === 'stop') {
            setCorrectStop(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                setBestStreak(current => Math.max(current, newStreak));
                return newStreak;
            });

            animateScore(15);
            setFeedback('Perfect stop!');
            setFeedbackType('success');
            createParticles('success', 25);
        }

        setShowFeedback(true);
        setTimeout(() => {
            setShowFeedback(false);
            setIsSignalAnimating(false);
        }, 1000);

        clearTimeout(stopTimeoutRef.current);
        clearTimeout(missTimeoutRef.current);

        setTimeout(() => {
            startNextTrial();
        }, 1200);
    }, [isWaitingForResponse, currentSignal]);

    const startNextTrial = useCallback(() => {
        if (gameState !== 'playing') return;

        const settings = difficultySettings[difficulty];
        const isStopTrial = Math.random() < settings.stopProbability;

        setTrialNumber(prev => prev + 1);
        setTotalTrials(prev => prev + 1);
        setCurrentSignal(null);
        setIsWaitingForResponse(false);
        setFeedback('');
        setShowFeedback(false);

        const timeout = setTimeout(() => {
            setCurrentSignal('go');
            setSignalStartTime(Date.now());
            setIsWaitingForResponse(true);
            setGoTrials(prev => prev + 1);

            if (isStopTrial) {
                stopTimeoutRef.current = setTimeout(() => {
                    setCurrentSignal(prev => {
                        if (prev === 'go') {
                            setStopTrials(p => p + 1);
                            setGoTrials(p => p - 1);
                            return 'stop';
                        }
                        return prev;
                    });
                }, settings.stopSignalDelay);
            }

            missTimeoutRef.current = setTimeout(handleMissedResponse, settings.maxReactionTime);
        }, settings.trialInterval);

        setNextTrialTimeout(timeout);
    }, [gameState, difficulty, handleMissedResponse]);

    const calculateScore = useCallback(() => {
        if (totalTrials === 0) return 0;

        const settings = difficultySettings[difficulty];
        const goAccuracy = goTrials > 0 ? correctGo / goTrials : 0;
        const goScore = goAccuracy * 60;

        const stopAccuracy = stopTrials > 0 ? correctStop / stopTrials : 1;
        const stopScore = stopAccuracy * 80;

        const avgReactionTime = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : settings.maxReactionTime;
        const idealTime = difficulty === 'Easy' ? 400 : difficulty === 'Medium' ? 350 : 300;
        const timeBonus = Math.max(0, Math.min(40, (idealTime - Math.min(avgReactionTime, idealTime)) / idealTime * 40));

        const completionBonus = Math.min(20, totalTrials * 0.5);
        const streakBonus = Math.min(15, bestStreak * 2);
        const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Medium' ? 1.0 : 1.2;

        let finalScore = (goScore + stopScore + timeBonus + completionBonus + streakBonus) * difficultyMultiplier;
        finalScore = finalScore * 0.75;
        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [totalTrials, goTrials, stopTrials, correctGo, correctStop, reactionTimes, difficulty, bestStreak]);

    useEffect(() => {
        if (gameState === 'playing') {
            setScore(calculateScore());
        }
    }, [calculateScore, gameState]);

    // High-precision timer derived from absolute end time (prevents freezes/drift)
    useEffect(() => {
        // Cleanup any previous interval
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        if (gameState === 'playing' && gameStartTime) {
            const settings = difficultySettings[difficulty];
            // On fresh start, if end time isn't set, set it
            if (!gameEndTimeRef.current) {
                gameEndTimeRef.current = gameStartTime + settings.timeLimit * 1000;
            }

            const tick = () => {
                const now = Date.now();
                const msLeft = Math.max(0, gameEndTimeRef.current - now);
                const secondsLeft = Math.ceil(msLeft / 1000);
                setTimeRemaining(secondsLeft);

                if (msLeft <= 0) {
                    // End game
                    const duration = Math.floor((now - gameStartTime) / 1000);
                    setGameDuration(duration);
                    setFinalScore(calculateScore());
                    setGameState('finished');
                    setShowCompletionModal(true);
                    createParticles('success', 30);

                    // Clear any pending trial timers
                    if (nextTrialTimeout) {
                        clearTimeout(nextTrialTimeout);
                    }
                    clearTimeout(stopTimeoutRef.current);
                    clearTimeout(missTimeoutRef.current);

                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }
            };

            // Set initial value immediately for responsive UI
            tick();
            timerIntervalRef.current = setInterval(tick, 250);
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [gameState, gameStartTime, difficulty, calculateScore, nextTrialTimeout]);

    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setTrialNumber(0);
        setTotalTrials(0);
        setGoTrials(0);
        setStopTrials(0);
        setCorrectGo(0);
        setCorrectStop(0);
        setMissedGo(0);
        setFailedStop(0);
        setReactionTimes([]);
        setCurrentSignal(null);
        setIsWaitingForResponse(false);
        setFeedback('');
        setShowFeedback(false);
        setGameDuration(0);
        setStreak(0);
        setBestStreak(0);
        setParticles([]);
        clearTimeout(stopTimeoutRef.current);
        clearTimeout(missTimeoutRef.current);
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        const now = Date.now();
        setGameStartTime(now);
        const settings = difficultySettings[difficulty];
        gameEndTimeRef.current = now + settings.timeLimit * 1000;
    };

    useEffect(() => {
        if (gameState === 'playing') {
            const id = setTimeout(() => startNextTrial(), 1000);
            return () => clearTimeout(id);
        }
    }, [gameState, startNextTrial]);

    const handleReset = () => {
        initializeGame();
        setCurrentSignal(null);
        setIsWaitingForResponse(false);
        setShowCompletionModal(false);

        if (nextTrialTimeout) {
            clearTimeout(nextTrialTimeout);
            setNextTrialTimeout(null);
        }
        clearTimeout(stopTimeoutRef.current);
        clearTimeout(missTimeoutRef.current);
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        gameEndTimeRef.current = null;
    };

    const handleGameComplete = (payload) => {
        console.log('Game completed:', payload);
    };

    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
        }
    };

    const customStats = {
        totalTrials,
        goTrials,
        stopTrials,
        correctGo,
        correctStop,
        missedGo,
        failedStop,
        goAccuracy: goTrials > 0 ? Math.round((correctGo / goTrials) * 100) : 0,
        stopAccuracy: stopTrials > 0 ? Math.round((correctStop / stopTrials) * 100) : 0,
        avgReactionTime: reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0,
        streak,
        bestStreak
    };

    return (
        <div className="relative overflow-hidden">
            {gameState === 'ready' && <Header unreadCount={3} />}

            {/* Animated Background */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-pulse"></div>
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-40 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Particle System */}
            {particles.length > 0 && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className="absolute animate-pulse"
                            style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                backgroundColor: particle.color,
                                borderRadius: '50%',
                                opacity: particle.life,
                                transform: `translate(${particle.velocity.x * 20}px, ${particle.velocity.y * 20}px)`,
                                animation: 'float 2s ease-out forwards'
                            }}
                        />
                    ))}
                </div>
            )}

            <GameFramework
                gameTitle="⚡ Stop Signal Reaction Game"
        gameShortDescription="Control impulses and stop at the right time. Challenge your self-control and reaction inhibition!"
                gameDescription={
                    <div className="mx-auto px-1 mb-2">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900">
                                    How to Play Stop Signal Reaction Game
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showInstructions ? <ChevronUp className="h-5 w-5 text-blue-900" /> : <ChevronDown className="h-5 w-5 text-blue-900" />}
                                </span>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">🎯 Objective</h4>
                                    <p className="text-sm text-blue-700">
                                        Click the green GO signal, but do nothing if it changes to a red STOP signal.
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">⚡ Signals</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• <strong>Green Arrow:</strong> Click it quickly</li>
                                        <li>• <strong>Red Square:</strong> Do NOT click</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">📊 Scoring</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Go accuracy (60 points max)</li>
                                        <li>• Stop accuracy (80 points max)</li>
                                        <li>• Speed bonus for fast reactions</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">🎚️ Difficulty</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• <strong>Easy:</strong> Longer time, fewer stops</li>
                                        <li>• <strong>Medium:</strong> Balanced timing</li>
                                        <li>• <strong>Hard:</strong> Fast timing, more stops</li>
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
                {/* Enhanced Game Content */}
                <div className="flex flex-col items-center space-y-8">
                    {/* Premium Stats Dashboard */}

                    {/* Premium Game Area */}
                    <div className="w-full max-w-4xl">
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-12 shadow-2xl border border-slate-200/50 backdrop-blur-sm min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">

                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full animate-ping"></div>
                                <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-400 rounded-full animate-ping animation-delay-1000"></div>
                                <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-pink-400 rounded-full animate-ping animation-delay-2000"></div>
                            </div>

                            {/* Score Animation */}
                            {scoreAnimation > 0 && lastScoreGain > 0 && (
                                <div className="absolute top-4 right-4 text-2xl font-bold text-green-600 animate-bounce z-10">
                                    +{lastScoreGain}
                                </div>
                            )}

                            {/* Signal Display */}
                            <div className="mb-12 relative">
                                {currentSignal === 'go' && (
                                    <div
                                        className={`flex flex-col items-center cursor-pointer transform transition-all duration-300 ${isSignalAnimating ? 'scale-110' : 'hover:scale-105'}`}
                                        onClick={handleResponse}
                                    >
                                        <div className="relative">
                                            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-8 shadow-2xl animate-pulse">
                                                <ArrowRight className="h-20 w-20 text-white drop-shadow-lg" />
                                            </div>
                                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
                                            <div className="absolute inset-0 bg-green-300 rounded-full animate-ping opacity-20 animation-delay-300"></div>
                                        </div>
                                        <div className="text-3xl font-bold text-green-600 mt-6 animate-bounce">GO!</div>
                                        <div className="text-sm text-green-700 mt-2 bg-green-100 px-4 py-2 rounded-full shadow-md">
                                            Click me now! ⚡
                                        </div>
                                    </div>
                                )}

                                {currentSignal === 'stop' && (
                                    <div
                                        className={`flex flex-col items-center cursor-not-allowed transform transition-all duration-300 ${isSignalAnimating ? 'scale-110 rotate-6' : ''}`}
                                        onClick={handleResponse}
                                    >
                                        <div className="relative">
                                            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-8 shadow-2xl animate-bounce">
                                                <Square className="h-20 w-20 text-white fill-current drop-shadow-lg" />
                                            </div>
                                            <div className="absolute inset-0 bg-red-400 rounded-2xl animate-ping opacity-40"></div>
                                            <div className="absolute -inset-2 bg-red-300 rounded-2xl animate-ping opacity-20 animation-delay-200"></div>
                                        </div>
                                        <div className="text-3xl font-bold text-red-600 mt-6 animate-pulse">STOP!</div>
                                        <div className="text-sm text-red-700 mt-2 bg-red-100 px-4 py-2 rounded-full shadow-md">
                                            Resist the urge! 🛑
                                        </div>
                                    </div>
                                )}

                                {!currentSignal && gameState === 'playing' && (
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <div className="bg-gradient-to-br from-gray-200 to-slate-300 rounded-full p-8 shadow-xl">
                                                <Timer className="h-20 w-20 text-gray-600 animate-spin" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-700 mt-6">Get Ready...</div>
                                        <div className="text-sm text-gray-600 mt-2 bg-gray-100 px-4 py-2 rounded-full shadow-md">
                                            Prepare your reflexes 🎯
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Feedback */}
                            {showFeedback && (
                                <div
                                    className={`absolute top-4 right-4 text-center p-4 rounded-xl shadow-xl backdrop-blur-sm border z-20 pointer-events-none
      ${feedbackType === 'success'
                                            ? 'bg-gradient-to-br from-green-100 to-emerald-200 text-green-800 border-green-300'
                                            : feedbackType === 'error'
                                                ? 'bg-gradient-to-br from-red-100 to-rose-200 text-red-800 border-red-300'
                                                : 'bg-gradient-to-br from-yellow-100 to-orange-200 text-yellow-800 border-yellow-300'
                                        }`}
                                >
                                    <div className="text-xl font-bold mb-1">{feedback}</div>
                                    {feedbackType === 'success' && (
                                        <div className="text-xs">
                                            {streak > 1 && `🔥 ${streak} streak!`}
                                            {lastScoreGain > 0 && ` +${lastScoreGain} points`}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </GameFramework >

            <GameCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                score={finalScore}
                difficulty={difficulty}
                duration={gameDuration}
                customStats={{
                    correctAnswers: correctGo + correctStop,
                    totalQuestions: totalTrials,
                    bestStreak
                }}
            />

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes float {
                    0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(-100px) scale(0) rotate(360deg); opacity: 0; }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-300 {
                    animation-delay: 300ms;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-200 {
                    animation-delay: 200ms;
                }
            `}</style>
        </div >
    );
};

export default StopSignalGame;