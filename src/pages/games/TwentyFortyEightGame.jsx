import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const Game2048 = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [grid, setGrid] = useState([]);
    const [highestTile, setHighestTile] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameScore, setGameScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [tilesCreated, setTilesCreated] = useState(0);
    const [tilesMerged, setTilesMerged] = useState(0);
    const [reachedTiles, setReachedTiles] = useState(new Set());

    // Difficulty settings
    const difficultySettings = {
        Easy: { timeLimit: 180, scoreMultiplier: 1.0, target: 128 },
        Moderate: { timeLimit: 120, scoreMultiplier: 1.2, target: 512 },
        Hard: { timeLimit: 90, scoreMultiplier: 1.5, target: 1024 }
    };

    // Initialize empty grid
    const initializeGrid = useCallback(() => {
        return Array(4).fill().map(() => Array(4).fill(0));
    }, []);

    // Add random tile (2 or 4)
    const addRandomTile = useCallback((currentGrid) => {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (currentGrid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            currentGrid[randomCell.row][randomCell.col] = value;
            setTilesCreated(prev => prev + 1);
        }

        return currentGrid;
    }, []);

    // Move tiles in a specific direction
    const moveTiles = useCallback((direction) => {
        if (gameState !== 'playing') return;

        const newGrid = grid.map(row => [...row]);
        let moved = false;
        let scoreIncrease = 0;
        let mergedCount = 0;

        // Helper function to move and merge a line
        const processLine = (line) => {
            const nonZero = line.filter(cell => cell !== 0);
            const merged = [];
            let i = 0;

            while (i < nonZero.length) {
                if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
                    const mergedValue = nonZero[i] * 2;
                    merged.push(mergedValue);
                    scoreIncrease += mergedValue;
                    mergedCount++;
                    setReachedTiles(prev => new Set([...prev, mergedValue]));
                    i += 2;
                } else {
                    merged.push(nonZero[i]);
                    i++;
                }
            }

            while (merged.length < 4) {
                merged.push(0);
            }

            return merged;
        };

        // Process each row/column based on direction
        for (let i = 0; i < 4; i++) {
            let line;

            switch (direction) {
                case 'left':
                    line = newGrid[i];
                    break;
                case 'right':
                    line = newGrid[i].slice().reverse();
                    break;
                case 'up':
                    line = [newGrid[0][i], newGrid[1][i], newGrid[2][i], newGrid[3][i]];
                    break;
                case 'down':
                    line = [newGrid[3][i], newGrid[2][i], newGrid[1][i], newGrid[0][i]];
                    break;
            }

            const originalLine = [...line];
            const processedLine = processLine(line);

            // Check if anything changed
            if (originalLine.some((cell, index) => cell !== processedLine[index])) {
                moved = true;
            }

            // Put the processed line back
            switch (direction) {
                case 'left':
                    newGrid[i] = processedLine;
                    break;
                case 'right':
                    newGrid[i] = processedLine.reverse();
                    break;
                case 'up':
                    processedLine.forEach((cell, j) => {
                        newGrid[j][i] = cell;
                    });
                    break;
                case 'down':
                    processedLine.forEach((cell, j) => {
                        newGrid[3 - j][i] = cell;
                    });
                    break;
            }
        }

        if (moved) {
            addRandomTile(newGrid);
            setGrid(newGrid);
            setMoves(prev => prev + 1);
            setGameScore(prev => prev + scoreIncrease);
            setTilesMerged(prev => prev + mergedCount);

            if (mergedCount > 0) {
                setStreak(prev => {
                    const newStreak = prev + 1;
                    setMaxStreak(current => Math.max(current, newStreak));
                    return newStreak;
                });
            } else {
                setStreak(0);
            }

            // Find highest tile
            const highest = Math.max(...newGrid.flat());
            setHighestTile(highest);

            // Check win condition
            if (highest >= difficultySettings[difficulty].target) {
                // Don't automatically end - let player continue playing
                // They can choose to continue or the timer will end the game
            }
        }
    }, [grid, gameState, difficulty, addRandomTile, difficultySettings]);

    // Check if game is over
    const checkGameOver = useCallback(() => {
        // Check for empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) return false;
            }
        }

        // Check for possible merges
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = grid[i][j];
                if (
                    (i < 3 && current === grid[i + 1][j]) ||
                    (j < 3 && current === grid[i][j + 1])
                ) {
                    return false;
                }
            }
        }

        return true;
    }, [grid, highestTile, difficulty, difficultySettings]);

    // Calculate final score (0-200)
    const calculateScore = useCallback(() => {
        if (moves === 0) return 0;

        const settings = difficultySettings[difficulty];

        // Base score from game score (0-80 points)
        const baseScore = Math.min(80, (gameScore / 10000) * 80);

        // Highest tile bonus (0-40 points)
        const tileBonus = Math.min(40, Math.log2(highestTile) * 3);

        // Efficiency bonus (0-30 points)
        const efficiency = gameScore / Math.max(moves, 1);
        const efficiencyBonus = Math.min(30, efficiency / 100);

        // Streak bonus (0-25 points)
        const streakBonus = Math.min(25, maxStreak * 2);

        // Time bonus (0-15 points)
        const timeBonus = Math.min(15, (timeRemaining / settings.timeLimit) * 15);

        // Variety bonus (0-10 points)
        const varietyBonus = Math.min(10, reachedTiles.size * 1.5);

        // Difficulty multiplier
        const difficultyMultiplier = settings.scoreMultiplier;

        let finalScore = (baseScore + tileBonus + efficiencyBonus + streakBonus + timeBonus + varietyBonus) * difficultyMultiplier;

        // Cap at 200
        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [gameScore, highestTile, moves, maxStreak, timeRemaining, difficulty, reachedTiles.size, difficultySettings]);

    // Update score whenever relevant values change
    useEffect(() => {
        const newScore = calculateScore();
        setScore(newScore);
    }, [calculateScore]);

    // Check game over condition
    useEffect(() => {
        if (gameState === 'playing' && timeRemaining > 0) {
            if (checkGameOver()) {
                // Add 2 second pause before ending the game
                setTimeout(() => {
                    setGameState('finished');
                }, 2000);
            }

            // Check if target is reached (win condition)
            if (highestTile >= difficultySettings[difficulty].target) {
                setTimeout(() => {
                    setGameState('finished');
                }, 2000);
            }
        }
    }, [gameState, checkGameOver, highestTile, difficulty, difficultySettings, timeRemaining]);

    // Timer countdown
    useEffect(() => {
        let interval;
        if (gameState === 'playing' && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Add 2 second pause before ending due to time
                        setTimeout(() => {
                            setGameState('finished');
                        }, 2000);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timeRemaining]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (gameState !== 'playing') return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    moveTiles('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moveTiles('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    moveTiles('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moveTiles('down');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, moveTiles]);

    // Touch controls
    useEffect(() => {
        if (gameState !== 'playing') return;

        let startX, startY;

        const handleTouchStart = (e) => {
            e.preventDefault(); // Prevent scrolling
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            e.preventDefault(); // Prevent scrolling during swipe
        };

        const handleTouchEnd = (e) => {
            e.preventDefault(); // Prevent scrolling
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            const minSwipeDistance = 30; // Minimum distance for a swipe

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                // Horizontal swipe
                if (deltaX > minSwipeDistance) {
                    moveTiles('right');
                } else if (deltaX < -minSwipeDistance) {
                    moveTiles('left');
                }
            } else if (Math.abs(deltaY) > minSwipeDistance) {
                // Vertical swipe
                if (deltaY > minSwipeDistance) {
                    moveTiles('down');
                } else if (deltaY < -minSwipeDistance) {
                    moveTiles('up');
                }
            }

            // Reset touch coordinates
            startX = null;
            startY = null;
        };

        const gameArea = document.getElementById('game-grid');
        if (gameArea) {
            gameArea.addEventListener('touchstart', handleTouchStart);
            gameArea.addEventListener('touchmove', handleTouchMove);
            gameArea.addEventListener('touchend', handleTouchEnd);

            return () => {
                gameArea.removeEventListener('touchstart', handleTouchStart);
                gameArea.removeEventListener('touchmove', handleTouchMove);
                gameArea.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [gameState, moveTiles]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];
        setScore(0);
        setGameScore(0);
        setTimeRemaining(settings.timeLimit);
        setMoves(0);
        setHighestTile(0);
        setStreak(0);
        setMaxStreak(0);
        setTilesCreated(0);
        setTilesMerged(0);
        setReachedTiles(new Set());

        const newGrid = initializeGrid();
        addRandomTile(newGrid);
        addRandomTile(newGrid);
        setGrid(newGrid);
    }, [difficulty, initializeGrid, addRandomTile, difficultySettings]);

    const handleStart = () => {
        initializeGame();
    };

    const handleReset = () => {
        initializeGame();
    };

    const handleGameComplete = (payload) => {
    };

    // Get tile color
    const getTileColor = (value) => {
        const colors = {
            2: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border-2 border-gray-300',
            4: 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 border-2 border-gray-400',
            8: 'bg-gradient-to-br from-orange-300 to-orange-400 text-white border-2 border-orange-500',
            16: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white border-2 border-orange-600',
            32: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-2 border-orange-700',
            64: 'bg-gradient-to-br from-red-500 to-red-600 text-white border-2 border-red-700',
            128: 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-2 border-yellow-600 ring-2 ring-yellow-300',
            256: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-2 border-yellow-700 ring-2 ring-yellow-400',
            512: 'bg-gradient-to-br from-yellow-600 to-amber-600 text-white border-2 border-amber-700 ring-2 ring-amber-400',
            1024: 'bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-green-700 ring-4 ring-green-300 animate-pulse',
            2048: 'bg-gradient-to-br from-green-600 to-emerald-600 text-white border-2 border-emerald-700 ring-4 ring-emerald-300 animate-pulse',
            4096: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-2 border-blue-700 ring-4 ring-blue-300 animate-pulse',
            8192: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-2 border-purple-700 ring-4 ring-purple-300 animate-pulse'
        };
        return colors[value] || 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-2 border-indigo-700 ring-4 ring-indigo-300 animate-pulse';
    };

    const customStats = {
        moves,
        highestTile,
        gameScore,
        streak: maxStreak,
        tilesCreated,
        tilesMerged,
        uniqueTiles: reachedTiles.size
    };

    return (
        <div>
            {gameState === 'ready' && <Header unreadCount={3} />}

            <GameFramework
                gameTitle="2048"
        gameShortDescription="Combine numbered tiles to reach 2048. Challenge your strategic planning and number manipulation skills!"
                gameDescription={
                    <div className="mx-auto px-1 mb-2">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                How to Play 2048
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 Objective
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Combine tiles with the same number to create bigger tiles. Reach the target tile to win!
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎮 Controls
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Arrow keys to move tiles</li>
                                        <li>• Swipe on mobile devices</li>
                                        <li>• Tiles merge when identical</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Scoring
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Points for merged tiles</li>
                                        <li>• Efficiency & speed bonuses</li>
                                        <li>• Streak multipliers</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💡 Tips
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Keep highest tile in corner</li>
                                        <li>• Plan moves ahead</li>
                                        <li>• Don't fill all spaces</li>
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
                    {/* Target Display - Prominent at top */}
                    <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl mb-4 sm:mb-6 px-2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4 text-center shadow-lg">
                            <div className="flex items-center justify-center gap-3">
                                <div className="text-xl sm:text-2xl">🎯</div>
                                <div>
                                    <div className="text-sm sm:text-lg font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        TARGET TILE TO WIN
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        {difficultySettings[difficulty].target}
                                    </div>
                                </div>
                                <div className="text-xl sm:text-2xl">🏆</div>
                            </div>
                        </div>
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 w-full max-w-sm sm:max-w-md md:max-w-2xl px-2">
                        <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-md border border-green-200">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Highest Tile
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {highestTile || 0}
                            </div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-md border border-purple-200">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Moves
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {moves}
                            </div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 shadow-md border border-yellow-200">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Streak
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-yellow-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {streak}
                            </div>
                        </div>
                    </div>

                    {/* Game Grid */}
                    <div
                        id="game-grid"
                        className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-2 sm:p-4 inline-block mb-4 sm:mb-6 shadow-2xl touch-none select-none"
                        style={{ touchAction: 'none' }}
                    >
                        <div className="grid grid-cols-4 gap-2 sm:gap-3">
                            {grid.map((row, i) =>
                                row.map((cell, j) => (
                                    <div
                                        key={`${i}-${j}`}
                                        className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${cell === 0 ? 'bg-gray-200 bg-opacity-50' : getTileColor(cell)
                                            } ${cell !== 0 ? 'animate-pulse' : ''}`}
                                        style={{
                                            animation: cell !== 0 ? 'none' : undefined,
                                            boxShadow: cell !== 0 ? '0 4px 8px rgba(0,0,0,0.2)' : undefined
                                        }}
                                    >
                                        {cell !== 0 && (
                                            <span className={`${cell >= 1000 ? 'text-xs sm:text-sm font-black' : 'font-black'} drop-shadow-sm`}>
                                                {cell}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Control Instructions */}
                    <div className="text-center max-w-sm sm:max-w-md md:max-w-2xl px-2">
                        <p className="text-sm sm:text-base text-gray-700 mb-4 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Use arrow keys or swipe to move tiles. When two tiles with the same number touch, they merge into one!
                        </p>

                        <div className="flex justify-center gap-2 sm:gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ArrowUp className="h-4 w-4" />
                                <ArrowDown className="h-4 w-4" />
                                <ArrowLeft className="h-4 w-4" />
                                <ArrowRight className="h-4 w-4" />
                                <span className="hidden sm:inline">Arrow Keys</span>
                                <span className="sm:hidden">Keys</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                📱 Touch & Swipe
                            </div>
                        </div>

                        <div className="text-xs sm:text-sm text-gray-600 font-semibold bg-gray-100 rounded-lg p-2 sm:p-3 mt-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            <div className="sm:inline">
                                🎯 <strong>TARGET: Reach {difficultySettings[difficulty].target} tile to win!</strong>
                            </div>
                            <div className="sm:inline sm:ml-2 block mt-1 sm:mt-0">
                                | {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit
                            </div>
                        </div>
                    </div>
                </div>
            </GameFramework>
        </div>
    );
};

export default Game2048;