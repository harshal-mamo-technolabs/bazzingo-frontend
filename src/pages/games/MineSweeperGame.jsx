import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Bomb, Flag, Eye, Lightbulb, Trophy, Heart, Zap, ChevronUp, ChevronDown } from 'lucide-react';

const numberColors = {
    1: "text-blue-600",
    2: "text-green-600",
    3: "text-red-600",
    4: "text-purple-600",
    5: "text-yellow-600",
    6: "text-pink-600",
    7: "text-black",
    8: "text-gray-600"
};

const TapMinesweeperGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(180);
    const [lives, setLives] = useState(3);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);
    const [minesRevealed, setMinesRevealed] = useState(0);
    const [cellsRevealed, setCellsRevealed] = useState(0);
    const [flagsPlaced, setFlagsPlaced] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    // Game state
    const [board, setBoard] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [flagged, setFlagged] = useState([]);
    const [gameResult, setGameResult] = useState(null); // 'win', 'lose', null
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState('');
    const [hintCell, setHintCell] = useState(null);

    // Difficulty settings
    const difficultySettings = {
        Easy: {
            rows: 9,
            cols: 9,
            mines: 10,
            timeLimit: 180,
            lives: 3,
            hints: 3,
            description: '9x9 grid with 10 mines - Perfect for beginners'
        },
        Moderate: {
            rows: 9,
            cols: 9,
            mines: 20,
            timeLimit: 180,
            lives: 3,
            hints: 3,
            description: '9x9 grid with 20 mines - Balanced challenge'
        },
        Hard: {
            rows: 9,
            cols: 9,
            mines: 30,
            timeLimit: 180,
            lives: 3,
            hints: 3,
            description: '9x9 grid with 30 mines - Advanced level'
        }
    };


    // Initialize board
    const initializeBoard = useCallback((rows, cols, mines) => {
        // Create empty board
        const newBoard = Array(rows).fill().map(() => Array(cols).fill(0));
        const newRevealed = Array(rows).fill().map(() => Array(cols).fill(false));
        const newFlagged = Array(rows).fill().map(() => Array(cols).fill(false));

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);

            if (newBoard[row][col] !== -1) {
                newBoard[row][col] = -1; // -1 represents a mine
                minesPlaced++;

                // Update adjacent cells
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;

                        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && newBoard[newRow][newCol] !== -1) {
                            newBoard[newRow][newCol]++;
                        }
                    }
                }
            }
        }

        setBoard(newBoard);
        setRevealed(newRevealed);
        setFlagged(newFlagged);
    }, []);

    // Handle cell click (reveal)
    const handleCellClick = (row, col) => {
        if (gameState !== 'playing' || revealed[row][col] || flagged[row][col] || gameResult) {
            return;
        }

        const newRevealed = [...revealed];

        if (board[row][col] === -1) {
            // Hit a mine
            setMinesRevealed(prev => prev + 1);
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    // Game over
                    handleGameEnd('lose');
                } else {
                    showFeedbackToUser('Mine hit! Lives remaining: ' + newLives, 'lose');
                }
                return newLives;
            });

            // Reveal the mine
            newRevealed[row][col] = true;
        } else {
            // Safe cell - reveal it and possibly adjacent cells
            revealCell(row, col, newRevealed);
            setCellsRevealed(prev => prev + countRevealedCells(newRevealed));

            // Check win condition
            if (checkWinCondition(newRevealed)) {
                handleGameEnd('win');
            }
        }

        setRevealed(newRevealed);

        // Clear hint if it was used
        if (hintCell && hintCell.row === row && hintCell.col === col) {
            setHintCell(null);
        }
    };

    // Reveal cell and adjacent empty cells
    const revealCell = (row, col, revealedArray) => {
        const settings = difficultySettings[difficulty];
        if (row < 0 || row >= settings.rows || col < 0 || col >= settings.cols || revealedArray[row][col]) {
            return;
        }

        revealedArray[row][col] = true;

        // If cell is empty (0), reveal adjacent cells
        if (board[row][col] === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    revealCell(row + i, col + j, revealedArray);
                }
            }
        }
    };

    // Handle right click (flag)
    const handleCellRightClick = (e, row, col) => {
        e.preventDefault();

        if (gameState !== 'playing' || revealed[row][col] || gameResult) {
            return;
        }

        const newFlagged = [...flagged];
        newFlagged[row][col] = !newFlagged[row][col];
        setFlagged(newFlagged);

        setFlagsPlaced(prev => newFlagged[row][col] ? prev + 1 : prev - 1);
    };

    // Count revealed cells
    const countRevealedCells = (revealedArray) => {
        let count = 0;
        revealedArray.forEach(row => {
            row.forEach(cell => {
                if (cell) count++;
            });
        });
        return count;
    };

    // Check win condition
    const checkWinCondition = (revealedArray) => {
        const settings = difficultySettings[difficulty];
        const totalCells = settings.rows * settings.cols;
        const revealedCount = countRevealedCells(revealedArray);
        return revealedCount === totalCells - settings.mines;
    };

    // Show feedback to user
    const showFeedbackToUser = (message, type) => {
        setFeedbackMessage(message);
        setFeedbackType(type);
        setShowFeedback(true);

        setTimeout(() => {
            setShowFeedback(false);
        }, 2000);
    };

    // Handle game end
    const handleGameEnd = (result) => {
        setGameResult(result);
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        setFinalScore(score);
        setGameState('finished');

        let message = '';
        if (result === 'win') {
            message = 'Congratulations! All mines cleared!';
            showFeedbackToUser(message, 'win');
        } else {
            message = 'Game Over! Better luck next time.';
            showFeedbackToUser(message, 'lose');
        }

        setShowCompletionModal(true);
    };

    // Use hint
    const useHint = () => {
        if (hintsUsed >= maxHints || gameState !== 'playing' || gameResult) return;

        setHintsUsed(prev => prev + 1);

        // Find a safe cell to reveal
        const settings = difficultySettings[difficulty];
        const safeCells = [];

        for (let row = 0; row < settings.rows; row++) {
            for (let col = 0; col < settings.cols; col++) {
                if (!revealed[row][col] && !flagged[row][col] && board[row][col] !== -1) {
                    safeCells.push({ row, col });
                }
            }
        }

        if (safeCells.length > 0) {
            const randomSafeCell = safeCells[Math.floor(Math.random() * safeCells.length)];
            setHintCell(randomSafeCell);

            setTimeout(() => {
                setHintCell(null);
            }, 3000);
        }
    };

    // Calculate score
    const calculateScore = useCallback(() => {
        if (gameState !== 'playing') return score;

        const settings = difficultySettings[difficulty];
        const totalCells = settings.rows * settings.cols;
        const totalMines = settings.mines;
        const revealedCount = countRevealedCells(revealed);

        // Base score from revealed safe cells (0-80 points)
        const revealProgress = revealedCount / (totalCells - totalMines);
        let baseScore = revealProgress * 80;

        // Time bonus (max 40 points)
        const timeProgress = timeRemaining / settings.timeLimit;
        const timeBonus = timeProgress * 40;

        // Lives bonus (max 30 points)
        const livesBonus = (lives / settings.lives) * 30;

        // Hints penalty (subtract up to 20 points)
        const hintsPenalty = (hintsUsed / settings.hints) * 20;

        // Efficiency bonus (max 25 points) - fewer flags used is better
        const flagEfficiency = Math.max(0, (totalMines - flagsPlaced) / totalMines);
        const efficiencyBonus = flagEfficiency * 25;

        // Difficulty multiplier
        const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.3;

        // Mine avoidance bonus (max 15 points)
        const mineAvoidanceBonus = Math.max(0, (settings.lives - minesRevealed) / settings.lives) * 15;

        let finalScore = (baseScore + timeBonus + livesBonus + efficiencyBonus + mineAvoidanceBonus - hintsPenalty) * difficultyMultiplier;

        // Apply final modifier to make 200 very challenging
        finalScore = finalScore * 0.75;

        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [gameState, revealed, timeRemaining, lives, hintsUsed, flagsPlaced, minesRevealed, difficulty, score]);

    // Update score
    useEffect(() => {
        if (gameState === 'playing') {
            const newScore = calculateScore();
            setScore(newScore);
        }
    }, [calculateScore, gameState]);

    // Timer countdown
    useEffect(() => {
        let interval;
        if (gameState === 'playing' && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleGameEnd('lose');
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
        setTimeRemaining(settings.timeLimit);
        setLives(settings.lives);
        setMaxHints(settings.hints);
        setHintsUsed(0);
        setMinesRevealed(0);
        setCellsRevealed(0);
        setFlagsPlaced(0);
        setGameDuration(0);
        setGameResult(null);
        setShowFeedback(false);
        setHintCell(null);
        initializeBoard(settings.rows, settings.cols, settings.mines);
    }, [difficulty, initializeBoard]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
    };

    const handleReset = () => {
        initializeGame();
        setShowCompletionModal(false);
    };

    const handleGameComplete = (payload) => {
    };

    // Prevent difficulty change during gameplay
    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
        }
    };

    // Get cell display content
    const getCellContent = (row, col) => {
        if (flagged[row][col]) {
            return <Flag className="h-4 w-4 text-red-600" />;
        }

        if (!revealed[row][col]) {
            return '';
        }

        if (board[row][col] === -1) {
            return <Bomb className="h-4 w-4 text-red-600" />;
        }

        if (board[row][col] === 0) {
            return '';
        }

        return board[row][col];
    };

    // Get cell styling
    const getCellStyle = (row, col) => {
        const isRevealed = revealed[row][col];
        const isFlagged = flagged[row][col];
        const value = board[row][col];
        const isMine = value === -1;
        const isHint = hintCell && hintCell.row === row && hintCell.col === col;

        // base layout
        let classes = "msw-cell flex items-center justify-center cursor-pointer transition-all duration-200 text-xs sm:text-sm ";

        if (!isRevealed) {
            // unrevealed
            classes += "bg-gradient-to-br from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 shadow-inner border border-slate-400 ";
        }

        if (isFlagged && !isRevealed) {
            classes += "bg-gradient-to-br from-orange-200 to-orange-300 border-orange-400 ";
        }

        if (isRevealed && !isMine) {
            classes += "bg-gradient-to-br from-white to-slate-100 border border-slate-300 shadow ";
        }

        if (isRevealed && isMine) {
            classes += "bg-gradient-to-br from-red-400 to-red-600 text-white border border-red-600 mine ";
        }

        if (isHint && !isRevealed) {
            classes += "ring-4 ring-yellow-400 hint ";
        }

        if (isRevealed) {
            classes += "revealed ";
        }

        // number colors
        if (isRevealed && value > 0) {
            classes += numberColors[value] + " ";
        }

        return classes;
    };


    const customStats = {
        cellsRevealed,
        minesRevealed,
        flagsPlaced,
        lives,
        hintsUsed,
        efficiency: flagsPlaced > 0 ? Math.round((difficultySettings[difficulty].mines / flagsPlaced) * 100) : 100
    };

    const settings = difficultySettings[difficulty];

    return (
        <div>
            {gameState === 'ready' && <Header unreadCount={3} />}

            <GameFramework
                gameTitle="Tap Minesweeper"
        gameShortDescription="Clear mines safely by using numbers as clues. Test your logical deduction and risk assessment skills!"
                gameDescription={
                    <div className="mx-auto px-1 mb-2">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Tap Minesweeper
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showInstructions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </span>
                            </div>

                            {/* Instructions */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 Objective
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Reveal all safe cells without hitting mines. Numbers show how many mines are adjacent to that cell.
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🖱️ Controls
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Left Click:</strong> Reveal cell</li>
                                        <li>• <strong>Right Click:</strong> Flag suspected mine</li>
                                        <li>• <strong>Hint Button:</strong> Shows safe cell to click</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Difficulty
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Easy:</strong> 9x9, 10 mines</li>
                                        <li>• <strong>Medium:</strong> 9x9, 20 mines</li>
                                        <li>• <strong>Hard:</strong> 9x9, 30 mines</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💯 Scoring
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Safe cells revealed</li>
                                        <li>• Time remaining bonus</li>
                                        <li>• Lives preserved</li>
                                        <li>• Efficient flagging</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Problem Solving"
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
                    {/* Game Controls */}
                    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <button
                            onClick={useHint}
                            disabled={hintsUsed >= maxHints || gameResult}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints || gameResult
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                        >
                            <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                            Hint ({maxHints - hintsUsed})
                        </button>
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 w-full max-w-4xl px-2">
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Mines Left
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {settings.mines - flagsPlaced}
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Lives
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {'❤️'.repeat(lives)}
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Revealed
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {cellsRevealed}/{settings.rows * settings.cols - settings.mines}
                            </div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Flags
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {flagsPlaced}/{settings.mines}
                            </div>
                        </div>
                    </div>

                    {/* Game Board */}
                    <div className="w-full mb-4 sm:mb-6 px-2">
                        <div className="bg-white rounded-lg p-2 sm:p-4 shadow-lg border border-gray-200 overflow-x-auto">
                            <div
                                className="grid gap-0.5 sm:gap-1 mx-auto"
                                style={{
                                    gridTemplateColumns: `repeat(${settings.cols}, 1fr)`,
                                    maxWidth: 'fit-content'
                                }}
                            >
                                {board.map((row, rowIndex) =>
                                    row.map((cell, colIndex) => (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            className={getCellStyle(rowIndex, colIndex)}
                                            onClick={() => handleCellClick(rowIndex, colIndex)}
                                            onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                                            style={{
                                                minWidth: difficulty === 'Hard' ? '18px' : window.innerWidth < 640 ? '24px' : '30px',
                                                minHeight: difficulty === 'Hard' ? '18px' : window.innerWidth < 640 ? '24px' : '30px',
                                                fontSize: difficulty === 'Hard' ? '10px' : window.innerWidth < 640 ? '12px' : '14px'
                                            }}
                                        >
                                            {/* glossy highlight */}
                                            {!revealed[rowIndex][colIndex] && <span className="msw-gloss" />}

                                            {/* cell content */}
                                            {getCellContent(rowIndex, colIndex)}
                                        </div>

                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    {showFeedback && (
                        <div className={`w-full max-w-2xl text-center p-3 sm:p-4 rounded-lg mb-4 mx-2 ${feedbackType === 'win' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                                {feedbackType === 'win' ? (
                                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                ) : (
                                    <Bomb className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                )}
                                <div className="text-base sm:text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    {feedbackMessage}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="text-center max-w-2xl mt-4 sm:mt-6 px-4">
                        <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                            Left click to reveal cells, right click to flag mines. Numbers show adjacent mine count.
                            Use hints wisely to reveal safe cells when stuck!
                        </p>
                        <div className="mt-1 sm:mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {difficulty} Mode: {settings.description} |
                            {Math.floor(settings.timeLimit / 60)}:{String(settings.timeLimit % 60).padStart(2, '0')} time limit |
                            {settings.lives} lives | {settings.hints} hints
                        </div>
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
                    correctAnswers: cellsRevealed,
                    totalQuestions: settings.rows * settings.cols - settings.mines
                }}
            />
        </div>
    );
};

export default TapMinesweeperGame;