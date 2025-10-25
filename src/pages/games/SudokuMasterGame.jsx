import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Lightbulb, Eraser, Eye, EyeOff, ChevronUp, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

class SudokuGenerator {
    constructor() {
        this.size = 9;
        this.empty = 0;
    }

    // Create an empty 9x9 grid
    createEmptyGrid() {
        return Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    }

    // Check if a number is valid in a specific position
    isValid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < this.size; x++) {
            if (grid[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < this.size; x++) {
            if (grid[x][col] === num) return false;
        }

        // Check 3x3 box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) return false;
            }
        }

        return true;
    }

    // Solve sudoku using backtracking
    solveSudoku(grid) {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.solveSudoku(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Fill the diagonal 3x3 boxes
    fillDiagonal(grid) {
        for (let i = 0; i < this.size; i += 3) {
            this.fillBox(grid, i, i);
        }
    }

    // Fill a 3x3 box
    fillBox(grid, row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!this.unUsedInBox(grid, row, col, num));
                grid[row + i][col + j] = num;
            }
        }
    }

    // Check if number is unused in 3x3 box
    unUsedInBox(grid, rowStart, colStart, num) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[rowStart + i][colStart + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    // Fill remaining cells
    fillRemaining(grid, i, j) {
        if (j >= this.size && i < this.size - 1) {
            i = i + 1;
            j = 0;
        }
        if (i >= this.size && j >= this.size) {
            return true;
        }
        if (i < 3) {
            if (j < 3) {
                j = 3;
            }
        } else if (i < this.size - 3) {
            if (j === Math.floor(i / 3) * 3) {
                j = j + 3;
            }
        } else {
            if (j === this.size - 3) {
                i = i + 1;
                j = 0;
                if (i >= this.size) {
                    return true;
                }
            }
        }

        for (let num = 1; num <= this.size; num++) {
            if (this.isValid(grid, i, j, num)) {
                grid[i][j] = num;
                if (this.fillRemaining(grid, i, j + 1)) {
                    return true;
                }
                grid[i][j] = 0;
            }
        }
        return false;
    }

    // Remove numbers to create puzzle
    removeNumbers(grid, cellsToRemove) {
        let count = cellsToRemove;
        while (count !== 0) {
            const cellId = Math.floor(Math.random() * 81);
            const i = Math.floor(cellId / 9);
            const j = cellId % 9;
            if (grid[i][j] !== 0) {
                count--;
                grid[i][j] = 0;
            }
        }
    }

    // Generate a complete Sudoku puzzle
    generateCompletePuzzle() {
        const grid = this.createEmptyGrid();

        // Fill diagonal 3x3 boxes
        this.fillDiagonal(grid);

        // Fill remaining cells
        this.fillRemaining(grid, 0, 3);

        return grid;
    }

    // Generate puzzle with given difficulty
    generatePuzzle(difficulty = 'Medium') {
        const completedGrid = this.generateCompletePuzzle();
        const puzzleGrid = completedGrid.map(row => [...row]);

        // Define difficulty levels (cells to remove)
        const cellsToRemove = {
            'Easy': 40,     // Remove 40 cells (41 filled)
            'Medium': 50,   // Remove 50 cells (31 filled)
            'Hard': 60      // Remove 60 cells (21 filled)
        };

        this.removeNumbers(puzzleGrid, cellsToRemove[difficulty] || 50);

        return {
            puzzle: puzzleGrid,
            solution: completedGrid
        };
    }

    // Check if current state is valid (no conflicts)
    isValidState(grid) {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (grid[row][col] !== 0) {
                    const temp = grid[row][col];
                    grid[row][col] = 0;
                    if (!this.isValid(grid, row, col, temp)) {
                        grid[row][col] = temp;
                        return false;
                    }
                    grid[row][col] = temp;
                }
            }
        }
        return true;
    }

    // Check if puzzle is completed
    isComplete(grid) {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (grid[row][col] === 0) {
                    return false;
                }
            }
        }
        return this.isValidState(grid);
    }

    // Get hint for a specific cell
    getHint(puzzle, solution, row, col) {
        if (puzzle[row][col] === 0) {
            return solution[row][col];
        }
        return null;
    }

    // Get conflicts for current grid state
    getConflicts(grid) {
        const conflicts = [];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (grid[row][col] !== 0) {
                    // Check for conflicts
                    const num = grid[row][col];

                    // Check row conflicts
                    for (let c = 0; c < this.size; c++) {
                        if (c !== col && grid[row][c] === num) {
                            conflicts.push({ row, col });
                            conflicts.push({ row, col: c });
                        }
                    }

                    // Check column conflicts
                    for (let r = 0; r < this.size; r++) {
                        if (r !== row && grid[r][col] === num) {
                            conflicts.push({ row, col });
                            conflicts.push({ row: r, col });
                        }
                    }

                    // Check box conflicts
                    const startRow = row - (row % 3);
                    const startCol = col - (col % 3);
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            const currentRow = startRow + i;
                            const currentCol = startCol + j;
                            if ((currentRow !== row || currentCol !== col) &&
                                grid[currentRow][currentCol] === num) {
                                conflicts.push({ row, col });
                                conflicts.push({ row: currentRow, col: currentCol });
                            }
                        }
                    }
                }
            }
        }

        // Remove duplicates
        return conflicts.filter((conflict, index, self) =>
            index === self.findIndex(c => c.row === conflict.row && c.col === conflict.col)
        );
    }
}

// aliases can stay here or above the component
const DIFFICULTY_ALIASES = { Moderate: 'Medium', medium: 'Medium', easy: 'Easy', hard: 'Hard' };
const normalizeDifficulty = (d) => DIFFICULTY_ALIASES[d] || d;

const SudokuGame = () => {
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

    // Sudoku game state
    const [sudokuGenerator] = useState(new SudokuGenerator());
    const [puzzle, setPuzzle] = useState([]);
    const [solution, setSolution] = useState([]);
    const [currentGrid, setCurrentGrid] = useState([]);
    const [initialGrid, setInitialGrid] = useState([]);
    const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
    const [conflicts, setConflicts] = useState([]);
    const [showConflicts, setShowConflicts] = useState(true);
    const [filledCells, setFilledCells] = useState(0);
    const [totalCells] = useState(81);
    const [correctMoves, setCorrectMoves] = useState(0);
    const [totalMoves, setTotalMoves] = useState(0);

    const diffKey = useMemo(() => normalizeDifficulty(difficulty), [difficulty]);


    // Difficulty settings
    const difficultySettings = {
        Easy: {
            timeLimit: 1800, // 30 minutes
            maxHints: 5,
            maxMistakes: 8,
            description: '40 cells to fill, generous hints and mistakes allowed',
            cellsToFill: 40
        },
        Medium: {
            timeLimit: 1200, // 20 minutes
            maxHints: 3,
            maxMistakes: 5,
            description: '50 cells to fill, moderate hints and mistakes',
            cellsToFill: 50
        },
        Hard: {
            timeLimit: 900, // 15 minutes
            maxHints: 2,
            maxMistakes: 3,
            description: '60 cells to fill, limited hints and mistakes',
            cellsToFill: 60
        }
    };

    // Initialize game with difficulty settings
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[diffKey] || difficultySettings.Medium;
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setMaxHints(settings.maxHints);
        setMaxMistakes(settings.maxMistakes);
        setMistakes(0);
        setHintsUsed(0);
        setCorrectMoves(0);
        setTotalMoves(0);
        setCompletionPercentage(0);
        setConflicts([]);
        setSelectedCell({ row: -1, col: -1 });
    }, [diffKey]);

    // Generate new puzzle
    const generateNewPuzzle = useCallback(() => {
        const { puzzle: newPuzzle, solution: newSolution } = sudokuGenerator.generatePuzzle(diffKey);
        setPuzzle(newPuzzle);
        setSolution(newSolution);
        setCurrentGrid(newPuzzle.map(row => [...row]));
        setInitialGrid(newPuzzle.map(row => [...row]));

        // Count initially filled cells
        const initialFilled = newPuzzle.flat().filter(cell => cell !== 0).length;
        setFilledCells(initialFilled);
    }, [diffKey, sudokuGenerator]);

    // Handle cell selection
    const handleCellClick = (row, col) => {
        if (gameState !== 'playing') return;
        if (initialGrid[row][col] !== 0) return; // Can't select pre-filled cells

        setSelectedCell({ row, col });
    };

    // Handle number input
    const handleNumberInput = (number) => {
        if (gameState !== 'playing' || selectedCell.row === -1 || selectedCell.col === -1) return;
        if (initialGrid[selectedCell.row][selectedCell.col] !== 0) return;

        const newGrid = [...currentGrid];
        const previousValue = newGrid[selectedCell.row][selectedCell.col];
        newGrid[selectedCell.row][selectedCell.col] = number;

        setCurrentGrid(newGrid);
        setTotalMoves(prev => prev + 1);

        // Check if move is correct
        const isCorrect = number === solution[selectedCell.row][selectedCell.col];

        if (isCorrect) {
            setCorrectMoves(prev => prev + 1);
            // Update filled cells count
            if (previousValue === 0) {
                setFilledCells(prev => prev + 1);
            }
        } else {
            setMistakes(prev => {
                const newMistakes = prev + 1;
                if (newMistakes >= maxMistakes) {
                    // Game over due to too many mistakes
                    endGame(false);
                }
                return newMistakes;
            });
        }

        // Check for conflicts
        const newConflicts = sudokuGenerator.getConflicts(newGrid);
        setConflicts(newConflicts);

        // Check if puzzle is completed
        if (sudokuGenerator.isComplete(newGrid)) {
            endGame(true);
        }

        // Move to next empty cell
        moveToNextCell();
    };

    // Clear selected cell
    const handleClearCell = () => {
        if (gameState !== 'playing' || selectedCell.row === -1 || selectedCell.col === -1) return;
        if (initialGrid[selectedCell.row][selectedCell.col] !== 0) return;

        const newGrid = [...currentGrid];
        if (newGrid[selectedCell.row][selectedCell.col] !== 0) {
            newGrid[selectedCell.row][selectedCell.col] = 0;
            setCurrentGrid(newGrid);
            setFilledCells(prev => prev - 1);

            // Update conflicts
            const newConflicts = sudokuGenerator.getConflicts(newGrid);
            setConflicts(newConflicts);
        }
    };

    // Use hint
    const useHint = () => {
        if (gameState !== 'playing' || hintsUsed >= maxHints) return;
        if (selectedCell.row === -1 || selectedCell.col === -1) return;
        if (initialGrid[selectedCell.row][selectedCell.col] !== 0) return;

        const hint = sudokuGenerator.getHint(currentGrid, solution, selectedCell.row, selectedCell.col);
        if (hint) {
            handleNumberInput(hint);
            setHintsUsed(prev => prev + 1);
        }
    };

    // Move to next empty cell
    const moveToNextCell = () => {
        const { row, col } = selectedCell;

        // Find next empty cell
        for (let r = row; r < 9; r++) {
            const startCol = r === row ? col + 1 : 0;
            for (let c = startCol; c < 9; c++) {
                if (initialGrid[r][c] === 0 && currentGrid[r][c] === 0) {
                    setSelectedCell({ row: r, col: c });
                    return;
                }
            }
        }

        // If no cell found, search from beginning
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (initialGrid[r][c] === 0 && currentGrid[r][c] === 0) {
                    setSelectedCell({ row: r, col: c });
                    return;
                }
            }
        }
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
        const settings = difficultySettings[diffKey] || difficultySettings.Medium;
        const totalToFill = settings.cellsToFill;
        const currentFilled = filledCells - (81 - totalToFill); // Subtract pre-filled cells
        const percentage = Math.max(0, Math.min(100, (currentFilled / totalToFill) * 100));
        setCompletionPercentage(percentage);
    }, [filledCells, diffKey]);

    // Calculate score
    const calculateScore = useCallback(() => {
        if (gameState !== 'playing') return score;

        const settings = difficultySettings[diffKey] || difficultySettings.Medium;

        // Base completion score (0-80 points)
        const completionScore = (completionPercentage / 100) * 80;

        // Accuracy bonus (0-40 points)
        const accuracy = totalMoves > 0 ? correctMoves / totalMoves : 0;
        const accuracyBonus = accuracy * 40;

        // Time bonus (0-30 points)
        const timeUsed = settings.timeLimit - timeRemaining;
        const timeEfficiency = Math.max(0, 1 - (timeUsed / settings.timeLimit));
        const timeBonus = timeEfficiency * 30;

        // Mistake penalty (subtract up to 20 points)
        const mistakePenalty = (mistakes / settings.maxMistakes) * 20;

        // Hint penalty (subtract up to 15 points)
        const hintPenalty = (hintsUsed / settings.maxHints) * 15;

        // Difficulty multiplier
        const difficultyMultiplier = diffKey === 'Easy' ? 0.8 : diffKey === 'Medium' ? 1.0 : 1.2;

        // Speed bonus for fast completion (0-15 points)
        const avgTimePerCell = totalMoves > 0 ? timeUsed / totalMoves : 0;
        const speedBonus = Math.max(0, Math.min(15, (30 - avgTimePerCell) * 0.5));

        let finalScore = (completionScore + accuracyBonus + timeBonus + speedBonus - mistakePenalty - hintPenalty) * difficultyMultiplier;

        // Apply scaling to make 200 very challenging
        finalScore = finalScore * 0.9;

        return Math.round(Math.max(0, Math.min(200, finalScore)));
    }, [gameState, completionPercentage, totalMoves, correctMoves, timeRemaining, mistakes, hintsUsed, diffKey, score]);

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
        setPuzzle([]);
        setSolution([]);
        setCurrentGrid([]);
        setInitialGrid([]);
        setShowCompletionModal(false);
        setSelectedCell({ row: -1, col: -1 });
        setFilledCells(0);
    };

    // Handle difficulty change
    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(normalizeDifficulty(newDifficulty));
        }
    };

    // Handle game complete
    const handleGameComplete = (payload) => {
        console.log('Sudoku game completed:', payload);
    };

    // Get cell class names
    const getCellClassName = (row, col) => {
        const baseClass = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-gray-400 flex items-center justify-center text-sm sm:text-lg md:text-xl font-medium cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95';
        const isPreFilled = initialGrid[row] && initialGrid[row][col] !== 0;
        const isSelected = selectedCell.row === row && selectedCell.col === col;
        const hasConflict = conflicts.some(c => c.row === row && c.col === col);
        const isEmpty = currentGrid[row] && currentGrid[row][col] === 0;

        let className = baseClass;

        // Background colors
        if (isSelected) {
            className += ' bg-blue-200 border-blue-500 shadow-lg ring-2 ring-blue-300 animate-pulse';
        } else if (hasConflict && showConflicts) {
            className += ' bg-red-100 border-red-400 animate-bounce';
        } else if (isPreFilled) {
            className += ' bg-gray-100';
        } else {
            className += ' bg-white hover:bg-blue-50 hover:shadow-md';
        }

        // Text colors
        if (isPreFilled) {
            className += ' text-gray-900 font-bold cursor-default';
        } else if (hasConflict && showConflicts) {
            className += ' text-red-600 font-bold';
        } else {
            className += ' text-blue-600 font-semibold';
        }

        // Borders for 3x3 boxes
        if (row % 3 === 0) className += ' border-t-2 border-t-gray-800';
        if (col % 3 === 0) className += ' border-l-2 border-l-gray-800';
        if (row === 8) className += ' border-b-2 border-b-gray-800';
        if (col === 8) className += ' border-r-2 border-r-gray-800';

        return className;
    };

    // Custom stats for the framework
    const customStats = {
        mistakes,
        hintsUsed,
        completionPercentage: Math.round(completionPercentage),
        accuracy: totalMoves > 0 ? Math.round((correctMoves / totalMoves) * 100) : 100,
        filledCells,
        totalCells: (difficultySettings[diffKey] || difficultySettings.Medium).cellsToFill
    };

    return (
        <div>
            {gameState === 'ready' && <Header unreadCount={3} />}

            <GameFramework
                gameTitle="Sudoku Master"
        gameShortDescription="Fill the 9x9 grid with numbers 1-9 following Sudoku rules. Challenge your logical reasoning and patience!"
                gameDescription={
                    <div className="mx-auto px-1 mb-2">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Sudoku Master
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
                                        Fill the 9×9 grid so each row, column, and 3×3 box contains digits 1-9 exactly once.
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎚️ Difficulty Levels
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong>Easy:</strong> 40 cells, 30min, 5 hints</li>
                                        <li>• <strong>Medium:</strong> 50 cells, 20min, 3 hints</li>
                                        <li>• <strong>Hard:</strong> 60 cells, 15min, 2 hints</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Scoring System
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Completion progress (80pts max)</li>
                                        <li>• Accuracy bonus (40pts max)</li>
                                        <li>• Speed & time bonuses (45pts max)</li>
                                        <li>• Mistake & hint penalties</li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎮 How to Play
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Click a cell to select it</li>
                                        <li>• Use number buttons to fill cells</li>
                                        <li>• Red highlights show conflicts</li>
                                        <li>• Use hints when stuck</li>
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
                <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                    {/* Game Controls */}
                    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 px-2">
                        <button
                            onClick={useHint}
                            disabled={hintsUsed >= maxHints || selectedCell.row === -1}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints || selectedCell.row === -1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                            Hint ({maxHints - hintsUsed})
                        </button>

                        <button
                            onClick={handleClearCell}
                            disabled={selectedCell.row === -1}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCell.row === -1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            <Eraser className="h-3 w-3 sm:h-4 sm:w-4" />
                            Clear
                        </button>

                        <button
                            onClick={() => setShowConflicts(!showConflicts)}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showConflicts
                                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                                : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-xl'
                                }`}
                            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
                        >
                            {showConflicts ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                            {showConflicts ? 'Hide' : 'Show'} Conflicts
                        </button>
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-2xl px-2">
                        <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
                            <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Progress
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {Math.round(completionPercentage)}%
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
                                Filled
                            </div>
                            <div className="text-sm sm:text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {filledCells}/81
                            </div>
                        </div>
                    </div>

                    {/* Sudoku Grid */}
                    {currentGrid.length > 0 && (
                        <div className="bg-white p-2 sm:p-4 rounded-lg shadow-xl border-2 border-gray-800 transition-all duration-500 hover:shadow-2xl">
                            <div className="grid grid-cols-9 gap-0 max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                                {currentGrid.map((row, rowIndex) =>
                                    row.map((cell, colIndex) => (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            className={getCellClassName(rowIndex, colIndex)}
                                            onClick={() => handleCellClick(rowIndex, colIndex)}
                                            style={{
                                                animation: cell !== 0 && !initialGrid[rowIndex][colIndex] ? 'fadeInScale 0.3s ease-out' : 'none'
                                            }}
                                        >
                                            {cell !== 0 ? cell : ''}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Number Input Pad */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xs sm:max-w-sm px-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                            <button
                                key={number}
                                onClick={() => handleNumberInput(number)}
                                disabled={selectedCell.row === -1 || selectedCell.col === -1}
                                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg border-2 text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300 transform hover:scale-110 active:scale-95 ${selectedCell.row === -1 || selectedCell.col === -1
                                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-500 shadow-md hover:shadow-lg'
                                    }`}
                                style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                                {number}
                            </button>
                        ))}
                    </div>

                    {/* Status Messages */}
                    {conflicts.length > 0 && showConflicts && (
                        <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-bounce shadow-lg">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
                            </span>
                        </div>
                    )}

                    {completionPercentage === 100 && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-pulse shadow-lg">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                                Puzzle completed! Great job!
                            </span>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="text-center max-w-2xl text-xs sm:text-sm text-gray-600 px-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                        <p className="mb-2 leading-relaxed">
                            Click on an empty cell and use the number pad to fill it. Each row, column, and 3×3 box must contain all digits 1-9.
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
                    correctAnswers: correctMoves,
                    totalQuestions: totalMoves
                }}
            />
        </div>
    );
};

export default SudokuGame;