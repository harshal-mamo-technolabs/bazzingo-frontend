import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown, Lightbulb, Heart, Target, Clock, Trophy, Zap } from 'lucide-react';

// nonogramGenerator.js

/**
 * @typedef {Object} NonogramPuzzle
 * @property {boolean[][]} solution
 * @property {number[][]} rowClues
 * @property {number[][]} colClues
 * @property {number} size
 */

export class NonogramGenerator {
    /**
     * Generate a puzzle and its clues.
     * @param {number} size
     * @param {'Easy'|'Medium'|'Hard'} difficulty
     * @returns {NonogramPuzzle}
     */
    static generatePuzzle(size, difficulty) {
        // Start from a random grid (probability varies by difficulty)
        const solution = [];
        for (let i = 0; i < size; i++) {
            solution[i] = [];
            for (let j = 0; j < size; j++) {
                let probability = 0.5;
                if (difficulty === 'Easy') probability = 0.4;
                else if (difficulty === 'Medium') probability = 0.5;
                else if (difficulty === 'Hard') probability = 0.6;

                solution[i][j] = Math.random() < probability;
            }
        }

        // Overwrite with a clean, solvable pattern
        this.ensureValidPuzzle(solution, size, difficulty);

        // Build clues
        const rowClues = this.generateRowClues(solution);
        const colClues = this.generateColClues(solution);

        return { solution, rowClues, colClues, size };
    }

    /**
     * Overwrite the random grid with a curated pattern for the given size.
     */
    static ensureValidPuzzle(solution, size, difficulty) {
        const patterns = this.getPatterns(size, difficulty);
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        // Copy chosen pattern into the solution (same size)
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                solution[i][j] = pattern[i][j];
            }
        }
    }

    /**
     * Return a pool of patterns for the requested size.
     * Easy (5x5) now includes many bases + all symmetries (deduped).
     */
    static getPatterns(size, _difficulty) {
        if (size === 5) {
            // Exactly five curated 5×5 puzzles
            const cross = [
                [false, false, true, false, false],
                [false, false, true, false, false],
                [true, true, true, true, true],
                [false, false, true, false, false],
                [false, false, true, false, false],
            ];

            const diamond = [
                [false, false, true, false, false],
                [false, true, true, true, false],
                [true, true, true, true, true],
                [false, true, true, true, false],
                [false, false, true, false, false],
            ];

            const ring = [
                [true, true, true, true, true],
                [true, false, false, false, true],
                [true, false, false, false, true],
                [true, false, false, false, true],
                [true, true, true, true, true],
            ];

            const xShape = [
                [true, false, false, false, true],
                [false, true, false, true, false],
                [false, false, true, false, false],
                [false, true, false, true, false],
                [true, false, false, false, true],
            ];

            const arrowRight = [
                [false, false, true, false, false],
                [false, false, true, true, false],
                [true, true, true, false, false],
                [false, false, true, true, false],
                [false, false, true, false, false],
            ];

            // Return exactly five patterns
            return [cross, diamond, ring, xShape, arrowRight];
        }

        // Keep your existing pools for other sizes
        if (size === 8) {
            return [
                this.generateCheckerboardPattern(8),
                this.generateBorderPattern(8),
                this.generateXPattern(8),
            ];
        }

        // 10×10 or any other size
        return [
            this.generateComplexPattern(size),
            this.generateSpiralPattern(size),
            this.generateRandomPattern(size),
        ];
    }

    // ========= Pattern transform helpers & symmetry expansion =========
    static serialize(grid) {
        return grid.map(r => r.map(c => (c ? '1' : '0')).join('')).join('|');
    }
    static clone(grid) {
        return grid.map(r => r.slice());
    }
    static rotate90(grid) {
        const n = grid.length;
        const out = Array.from({ length: n }, () => Array(n).fill(false));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                out[j][n - 1 - i] = grid[i][j];
            }
        }
        return out;
    }
    static reflectH(grid) {
        const n = grid.length;
        const out = this.clone(grid);
        for (let i = 0; i < n; i++) out[i] = out[i].slice().reverse();
        return out;
    }
    static reflectV(grid) {
        const n = grid.length;
        const out = this.clone(grid);
        for (let i = 0; i < Math.floor(n / 2); i++) {
            const t = out[i];
            out[i] = out[n - 1 - i];
            out[n - 1 - i] = t;
        }
        return out;
    }
    static allSymmetries(grid) {
        const r0 = this.clone(grid);
        const r1 = this.rotate90(r0);
        const r2 = this.rotate90(r1);
        const r3 = this.rotate90(r2);
        const m0 = this.reflectH(r0);
        const m1 = this.reflectH(r1);
        const m2 = this.reflectH(r2);
        const m3 = this.reflectH(r3);

        const seen = new Set();
        const uniq = [];
        [r0, r1, r2, r3, m0, m1, m2, m3].forEach(g => {
            const key = this.serialize(g);
            if (!seen.has(key)) {
                seen.add(key);
                uniq.push(g);
            }
        });
        return uniq;
    }
    static expandWithSymmetries(patterns) {
        const seen = new Set();
        const out = [];
        patterns.forEach(p => {
            this.allSymmetries(p).forEach(g => {
                const key = this.serialize(g);
                if (!seen.has(key)) {
                    seen.add(key);
                    out.push(g);
                }
            });
        });
        return out;
    }

    // ======================= Pattern generators =======================
    static generateCheckerboardPattern(size) {
        const pattern = [];
        for (let i = 0; i < size; i++) {
            pattern[i] = [];
            for (let j = 0; j < size; j++) {
                pattern[i][j] = (i + j) % 2 === 0;
            }
        }
        return pattern;
    }

    static generateBorderPattern(size) {
        const pattern = [];
        for (let i = 0; i < size; i++) {
            pattern[i] = [];
            for (let j = 0; j < size; j++) {
                pattern[i][j] = i === 0 || i === size - 1 || j === 0 || j === size - 1;
            }
        }
        return pattern;
    }

    static generateXPattern(size) {
        const pattern = [];
        for (let i = 0; i < size; i++) {
            pattern[i] = [];
            for (let j = 0; j < size; j++) {
                pattern[i][j] = i === j || i === size - 1 - j;
            }
        }
        return pattern;
    }

    static generateComplexPattern(size) {
        const pattern = [];
        for (let i = 0; i < size; i++) {
            pattern[i] = [];
            for (let j = 0; j < size; j++) {
                pattern[i][j] = (i * j) % 3 === 0 || Math.abs(i - j) <= 1;
            }
        }
        return pattern;
    }

    static generateSpiralPattern(size) {
        const pattern = Array(size)
            .fill(null)
            .map(() => Array(size).fill(false));

        let top = 0, bottom = size - 1, left = 0, right = size - 1;
        let value = true;

        while (top <= bottom && left <= right) {
            for (let i = left; i <= right; i++) pattern[top][i] = value; // top row
            top++;

            for (let i = top; i <= bottom; i++) pattern[i][right] = value; // right col
            right--;

            if (top <= bottom) {
                for (let i = right; i >= left; i--) pattern[bottom][i] = value; // bottom row
                bottom--;
            }

            if (left <= right) {
                for (let i = bottom; i >= top; i--) pattern[i][left] = value; // left col
                left++;
            }

            value = !value; // alternate bands
        }

        return pattern;
    }

    static generateRandomPattern(size) {
        const pattern = [];
        for (let i = 0; i < size; i++) {
            pattern[i] = [];
            for (let j = 0; j < size; j++) {
                pattern[i][j] = Math.random() < 0.6;
            }
        }
        return pattern;
    }

    // ============================ Clues ==============================
    static generateRowClues(solution) {
        const rowClues = [];

        for (let row = 0; row < solution.length; row++) {
            const clues = [];
            let count = 0;

            for (let col = 0; col < solution[row].length; col++) {
                if (solution[row][col]) {
                    count++;
                } else {
                    if (count > 0) {
                        clues.push(count);
                        count = 0;
                    }
                }
            }
            if (count > 0) clues.push(count);

            rowClues.push(clues.length === 0 ? [0] : clues);
        }

        return rowClues;
    }

    static generateColClues(solution) {
        const colClues = [];

        for (let col = 0; col < solution[0].length; col++) {
            const clues = [];
            let count = 0;

            for (let row = 0; row < solution.length; row++) {
                if (solution[row][col]) {
                    count++;
                } else {
                    if (count > 0) {
                        clues.push(count);
                        count = 0;
                    }
                }
            }
            if (count > 0) clues.push(count);

            colClues.push(clues.length === 0 ? [0] : clues);
        }

        return colClues;
    }

    // =========================== Validation ==========================
    static validateSolution(userGrid, solution) {
        for (let i = 0; i < solution.length; i++) {
            for (let j = 0; j < solution[i].length; j++) {
                const userCell = userGrid[i][j];
                const solutionCell = solution[i][j];

                if (solutionCell && userCell !== 'filled') return false;
                if (!solutionCell && userCell === 'filled') return false;
            }
        }
        return true;
    }

    static isComplete(userGrid, solution) {
        for (let i = 0; i < solution.length; i++) {
            for (let j = 0; j < solution[i].length; j++) {
                if (solution[i][j] && userGrid[i][j] !== 'filled') return false;
            }
        }
        return true;
    }

    static getNextHint(userGrid, solution) {
        // Find the first unfilled cell that should be filled
        for (let i = 0; i < solution.length; i++) {
            for (let j = 0; j < solution[i].length; j++) {
                if (solution[i][j] && userGrid[i][j] !== 'filled') {
                    return { row: i, col: j };
                }
            }
        }
        return null;
    }
}

// ================= DYNAMIC SCORING CONSTANTS (after class) =================
const EASY_TOTAL_PUZZLES = NonogramGenerator.getPatterns(5).length;
const POINTS_PER_PUZZLE = 200 / EASY_TOTAL_PUZZLES;

const NonogramGrid = ({
    size, userGrid, onCellClick, rowClues, colClues, hintCell, mistakes, isGameActive
}) => {
    const maxRowClueLength = Math.max(...rowClues.map(c => c.length));
    const maxColClueLength = Math.max(...colClues.map(c => c.length));

    const cellSize = 'clamp(26px, 4.2vmin, 44px)';

    const handleCellClick = (row, col, event) => {
        event.preventDefault();
        if (!isGameActive) return;

        const button = event.button === 0 ? 'left' : 'right';
        onCellClick(row, col, button);
    };

    const getCellClass = (row, col) => {
        const cell = userGrid[row][col];
        const isHint = hintCell && hintCell.row === row && hintCell.col === col;
        const isMistake = mistakes.some(m => m.row === row && m.col === col);

        let baseClass = `
            aspect-square border border-slate-300 flex items-center justify-center 
            text-lg font-bold cursor-pointer transition-all duration-300 
            transform hover:scale-105 active:scale-95
            hover:shadow-md active:shadow-lg
        `;

        if (cell === 'filled') {
            baseClass += ' bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-inner hover:from-slate-600 hover:to-slate-800';
        } else if (cell === 'crossed') {
            baseClass += ' bg-gradient-to-br from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200';
        } else {
            baseClass += ' bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300';
        }

        if (isHint) {
            baseClass += ' animate-pulse bg-gradient-to-br from-yellow-200 to-yellow-300 border-yellow-500 border-2 shadow-lg';
        }

        if (isMistake) {
            baseClass += ' animate-bounce bg-gradient-to-br from-red-200 to-red-300 border-red-500 border-2 shadow-lg';
        }

        if (row % 5 === 0 && row !== 0) baseClass += ' border-t-2 border-t-slate-500';
        if (col % 5 === 0 && col !== 0) baseClass += ' border-l-2 border-l-slate-500';

        return baseClass;
    };

    return (
        <div className="inline-block bg-white p-2 sm:p-4 md:p-6 rounded-xl shadow-2xl border border-slate-200">
            <div
                className="grid gap-0"
                style={{
                    gridTemplateColumns: `repeat(${maxRowClueLength}, max-content) 2px repeat(${size}, ${cellSize})`,
                    gridTemplateRows: `repeat(${maxColClueLength}, max-content) 2px repeat(${size}, ${cellSize})`
                }}
            >
                {/* Top-left empty corner */}
                <div
                    className="bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300"
                    style={{ gridColumn: `1 / ${maxRowClueLength + 1}`, gridRow: `1 / ${maxColClueLength + 1}`, zIndex: 0 }}
                />

                {/* Column clues */}
                {colClues.map((clues, colIndex) => (
                    <div
                        key={`col-clue-${colIndex}`}
                        className="
            flex flex-col items-center justify-end p-1
            bg-gradient-to-b from-blue-50 to-blue-100
            text-xs sm:text-sm font-semibold text-blue-800
            border border-slate-300
          "
                        style={{
                            gridColumn: `${maxRowClueLength + 2 + colIndex}`,
                            gridRow: `1 / ${maxColClueLength + 1}`,
                            whiteSpace: 'nowrap',
                            lineHeight: 1.1,
                            zIndex: 2
                        }}
                    >
                        {clues.map((clue, clueIndex) => (
                            <div key={clueIndex} className="mb-0.5 px-1 py-0.5 rounded bg-blue-200 text-blue-900">
                                {clue}
                            </div>
                        ))}
                    </div>
                ))}

                {/* Horizontal separator */}
                <div
                    className="bg-gradient-to-r from-slate-500 to-slate-600"
                    style={{ gridColumn: '1 / -1', gridRow: `${maxColClueLength + 1}`, height: '2px', zIndex: 1 }}
                />

                {/* Row clues + grid */}
                {userGrid.map((row, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        {/* Row clues */}
                        <div
                            className="
              flex items-center justify-end p-1
              bg-gradient-to-r from-purple-50 to-purple-100
              text-xs sm:text-sm font-semibold text-purple-800
              border border-slate-300
            "
                            style={{
                                gridColumn: `1 / ${maxRowClueLength + 1}`,
                                gridRow: `${maxColClueLength + 2 + rowIndex}`,
                                whiteSpace: 'nowrap',
                                lineHeight: 1.1,
                                zIndex: 2
                            }}
                        >
                            {rowClues[rowIndex].map((clue, clueIndex) => (
                                <span key={clueIndex} className="ml-0.5 px-1 py-0.5 rounded bg-purple-200 text-purple-900">
                                    {clue}
                                </span>
                            ))}
                        </div>

                        {/* Vertical separator */}
                        <div
                            className="bg-gradient-to-b from-slate-500 to-slate-600"
                            style={{ gridColumn: `${maxRowClueLength + 1}`, gridRow: `${maxColClueLength + 2 + rowIndex}`, width: '2px', zIndex: 1 }}
                        />

                        {/* Cells */}
                        {row.map((cell, colIndex) => (
                            <div
                                key={`cell-${rowIndex}-${colIndex}`}
                                className={`${getCellClass(rowIndex, colIndex)}`}
                                style={{
                                    gridColumn: `${maxRowClueLength + 2 + colIndex}`,
                                    gridRow: `${maxColClueLength + 2 + rowIndex}`,
                                    width: cellSize,
                                    height: cellSize,
                                    zIndex: 0
                                }}
                                onClick={e => handleCellClick(rowIndex, colIndex, e)}
                                onContextMenu={e => { e.preventDefault(); handleCellClick(rowIndex, colIndex, e); }}
                            >
                                {cell === 'filled' && <span className="animate-fadeIn">■</span>}
                                {cell === 'crossed' && <span className="animate-fadeIn text-red-500">✕</span>}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

NonogramGrid.propTypes = {
    size: PropTypes.number.isRequired,
    userGrid: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.oneOf(['filled', 'crossed', null]))
    ).isRequired,
    onCellClick: PropTypes.func.isRequired,
    rowClues: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    colClues: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    hintCell: PropTypes.shape({
        row: PropTypes.number.isRequired,
        col: PropTypes.number.isRequired
    }),
    mistakes: PropTypes.arrayOf(
        PropTypes.shape({
            row: PropTypes.number.isRequired,
            col: PropTypes.number.isRequired
        })
    ).isRequired,
    isGameActive: PropTypes.bool.isRequired
};

const NonogramGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [lives, setLives] = useState(3);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);
    const [mistakes, setMistakes] = useState([]);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    // Game state
    const [puzzle, setPuzzle] = useState(null);
    const [userGrid, setUserGrid] = useState([]);
    const [hintCell, setHintCell] = useState(null);
    const [totalCells, setTotalCells] = useState(0);
    const [correctCells, setCorrectCells] = useState(0);
    const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);

    // Animation states
    const [scoreAnimation, setScoreAnimation] = useState(false);
    const [livesAnimation, setLivesAnimation] = useState(false);
    const [completionAnimation, setCompletionAnimation] = useState(false);

    const DIFFICULTY_KEYS = ['Easy', 'Medium', 'Hard'];

    const normalizeDifficulty = (d) => {
        let v = d;
        if (typeof v !== 'string') {
            v = d?.value ?? d?.target?.value ?? d?.label ?? '';
        }
        v = String(v).trim();
        const proper = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
        return DIFFICULTY_KEYS.includes(proper) ? proper : 'Medium';
    };

    const getSettings = (d) => {
        const key = normalizeDifficulty(d);
        return difficultySettings[key];
    };

    // Difficulty settings
    const difficultySettings = {
        Easy: { size: 5, timeLimit: 120, lives: 5, hints: 5, description: '5×5 grid – standard time' },
        Medium: { size: 5, timeLimit: 120, lives: 4, hints: 4, description: '5×5 grid – reduced time' },
        Hard: { size: 5, timeLimit: 120, lives: 3, hints: 3, description: '5×5 grid – minimal time' }
    };

    // Generate new puzzle
    const generateNewPuzzle = useCallback(() => {
        const settings = difficultySettings[difficulty];
        const newPuzzle = NonogramGenerator.generatePuzzle(
            settings.size,
            'Easy' // force Easy grid generation
        );
        setPuzzle(newPuzzle);

        // Initialize user grid
        const newUserGrid = [];
        for (let i = 0; i < settings.size; i++) {
            newUserGrid[i] = [];
            for (let j = 0; j < settings.size; j++) {
                newUserGrid[i][j] = null;
            }
        }
        setUserGrid(newUserGrid);

        // Count total cells that need to be filled
        const total = newPuzzle.solution.flat().filter(cell => cell).length;
        setTotalCells(total);
        setCorrectCells(0);

        setMistakes([]);
        setHintCell(null);
    }, [difficulty]);

    // Handle cell click
    const handleCellClick = (row, col, button) => {
        if (!puzzle || gameState !== 'playing') return;

        const newUserGrid = [...userGrid];
        const currentCell = newUserGrid[row][col];
        const solutionCell = puzzle.solution[row][col];

        if (button === 'left') {
            // Left click: fill/unfill
            if (currentCell === 'filled') {
                newUserGrid[row][col] = null;
                if (solutionCell) {
                    setCorrectCells(prev => prev - 1);
                }
            } else {
                newUserGrid[row][col] = 'filled';
                if (solutionCell) {
                    setCorrectCells(prev => prev + 1);
                } else {
                    // Wrong move
                    setMistakes(prev => [...prev, { row, col }]);
                    setLives(prev => {
                        const newLives = prev - 1;
                        setLivesAnimation(true);
                        setTimeout(() => setLivesAnimation(false), 600);

                        if (newLives <= 0) {
                            handleGameEnd(false);
                        }
                        return newLives;
                    });

                    // Remove mistake after 2 seconds
                    setTimeout(() => {
                        setMistakes(prev => prev.filter(m => !(m.row === row && m.col === col)));
                    }, 2000);
                }
            }
        } else {
            // Right click: cross/uncross
            if (currentCell === 'crossed') {
                newUserGrid[row][col] = null;
            } else if (currentCell !== 'filled') {
                newUserGrid[row][col] = 'crossed';
            }
        }

        setUserGrid(newUserGrid);

        // Check if puzzle is complete
        if (NonogramGenerator.isComplete(newUserGrid, puzzle.solution)) {
            // SCORING: add fixed points per completed puzzle (any difficulty),
            // based on Easy pool size (dynamic).
            setScore(prev => {
                const next = Math.min(200, prev + POINTS_PER_PUZZLE);
                setScoreAnimation(true);
                setTimeout(() => setScoreAnimation(false), 600);
                return next;
            });

            setCompletionAnimation(true);
            setPuzzlesCompleted(prev => prev + 1);
            setTimeout(() => {
                setCompletionAnimation(false);
                generateNewPuzzle();
            }, 1500);
        }
    };

    // Use hint
    const useHint = () => {
        if (!puzzle || hintsUsed >= maxHints || gameState !== 'playing') return;

        setHintsUsed(prev => prev + 1);
        const hint = NonogramGenerator.getNextHint(userGrid, puzzle.solution);

        if (hint) {
            setHintCell(hint);
            setTimeout(() => {
                setHintCell(null);
            }, 3000);
        }
    };

    // Handle game end
    const handleGameEnd = (success) => {
        const endTime = Date.now();
        const duration = Math.floor((endTime - gameStartTime) / 1000);
        setGameDuration(duration);
        setFinalScore(Math.min(200, score)); // final score is accumulated, capped at 200
        setGameState('finished');
        setShowCompletionModal(true);
    };

    // Timer countdown
    useEffect(() => {
        let intervalId;
        if (gameState === 'playing' && timeRemaining > 0) {
            intervalId = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleGameEnd(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [gameState, timeRemaining, gameStartTime, score]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const settings = getSettings(difficulty);
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setLives(settings.lives);
        setMaxHints(settings.hints);
        setHintsUsed(0);
        setMistakes([]);
        setCorrectCells(0);
        setPuzzlesCompleted(0);
        setGameDuration(0);
        setScoreAnimation(false);
        setLivesAnimation(false);
        setCompletionAnimation(false);
        generateNewPuzzle();
    }, [difficulty, generateNewPuzzle]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
    };

    const handleReset = () => {
        initializeGame();
        setShowCompletionModal(false);
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
        correctCells,
        totalCells,
        accuracy: totalCells > 0 ? Math.round((correctCells / totalCells) * 100) : 0,
        puzzlesCompleted,
        hintsUsed,
        lives
    };

    const settings = getSettings(difficulty);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <Header unreadCount={3} />

            <GameFramework
                gameTitle="Nonogram Picross"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3
                                    className="text-lg font-semibold text-blue-900"
                                    style={{ fontFamily: "Roboto, sans-serif" }}
                                >
                                    How to Play Nonogram Picross
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showInstructions ? (
                                        <ChevronUp className="h-5 w-5 text-blue-900" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-blue-900" />
                                    )}
                                </span>
                            </div>

                            {/* Instructions */}
                            <div
                                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? "" : "hidden"
                                    }`}
                            >
                                {/* Objective */}
                                <div className="bg-white p-3 rounded-lg">
                                    <h4
                                        className="text-sm font-medium text-blue-800 mb-2"
                                        style={{ fontFamily: "Roboto, sans-serif" }}
                                    >
                                        🧩 Objective
                                    </h4>
                                    <p
                                        className="text-sm text-blue-700"
                                        style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400 }}
                                    >
                                        Fill in cells to reveal a hidden picture using number clues for each
                                        row and column.
                                    </p>
                                </div>

                                {/* Controls */}
                                <div className="bg-white p-3 rounded-lg">
                                    <h4
                                        className="text-sm font-medium text-blue-800 mb-2"
                                        style={{ fontFamily: "Roboto, sans-serif" }}
                                    >
                                        🎮 Controls
                                    </h4>
                                    <ul
                                        className="text-sm text-blue-700 space-y-1"
                                        style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400 }}
                                    >
                                        <li>
                                            • <strong>Left click:</strong> Fill/unfill cell
                                        </li>
                                        <li>
                                            • <strong>Right click:</strong> Mark as crossed
                                        </li>
                                        <li>• Numbers show consecutive cells</li>
                                    </ul>
                                </div>

                                {/* Scoring */}
                                <div className="bg-white p-3 rounded-lg">
                                    <h4
                                        className="text-sm font-medium text-blue-800 mb-2"
                                        style={{ fontFamily: "Roboto, sans-serif" }}
                                    >
                                        📊 Scoring
                                    </h4>
                                    <ul
                                        className="text-sm text-blue-700 space-y-1"
                                        style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400 }}
                                    >
                                        <li>
                                            • Easy pool detected: <strong>{EASY_TOTAL_PUZZLES}</strong> puzzles
                                        </li>
                                        <li>
                                            • +<strong>{POINTS_PER_PUZZLE.toFixed(2)}</strong> points per
                                            completed puzzle
                                        </li>
                                        <li>• Score capped at 200 (applies to all difficulties)</li>
                                    </ul>
                                </div>

                                {/* Strategy */}
                                <div className="bg-white p-3 rounded-lg">
                                    <h4
                                        className="text-sm font-medium text-blue-800 mb-2"
                                        style={{ fontFamily: "Roboto, sans-serif" }}
                                    >
                                        💡 Strategy
                                    </h4>
                                    <ul
                                        className="text-sm text-blue-700 space-y-1"
                                        style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400 }}
                                    >
                                        <li>• Start with largest numbers</li>
                                        <li>• Use crossing out strategically</li>
                                        <li>• Look for patterns in clues</li>
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
                <div className="flex flex-col items-center px-4 lg:px-0">
                    {/* Game Controls */}
                    {gameState === 'playing' && (
                        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                            <button
                                onClick={useHint}
                                disabled={hintsUsed >= maxHints}
                                className={`
                                    px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 
                                    transform hover:scale-105 active:scale-95 font-semibold
                                    ${hintsUsed >= maxHints
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700 shadow-lg hover:shadow-xl'
                                    }
                                `}
                                style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                                <Lightbulb className="h-4 w-4" />
                                Hint ({maxHints - hintsUsed})
                            </button>
                        </div>
                    )}

                    {/* Game Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full max-w-4xl">
                        <div className={`text-center bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-red-200 ${livesAnimation ? 'animate-pulse' : ''}`}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Lives
                                </div>
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {'❤️'.repeat(lives)}
                            </div>
                        </div>

                        <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-blue-200">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-blue-500" />
                                <div className="text-xs sm:text-sm text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Accuracy
                                </div>
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {customStats.accuracy}%
                            </div>
                        </div>

                        <div className={`text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-green-200 ${completionAnimation ? 'animate-bounce' : ''}`}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-green-500" />
                                <div className="text-xs sm:text-sm text-green-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Completed
                                </div>
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {puzzlesCompleted}
                            </div>
                        </div>

                        <div className={`text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-purple-200 ${scoreAnimation ? 'animate-pulse' : ''}`}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-purple-500" />
                                <div className="text-xs sm:text-sm text-purple-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Progress
                                </div>
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {totalCells > 0 ? Math.round((correctCells / totalCells) * 100) : 0}%
                            </div>
                        </div>
                    </div>

                    {/* Game Grid */}
                    {puzzle && (
                        <div className="mb-6 flex justify-center w-full overflow-x-auto">
                            <NonogramGrid
                                size={puzzle.size}
                                userGrid={userGrid}
                                onCellClick={handleCellClick}
                                rowClues={puzzle.rowClues}
                                colClues={puzzle.colClues}
                                hintCell={hintCell}
                                mistakes={mistakes}
                                isGameActive={gameState === 'playing'}
                            />
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="text-center max-w-2xl px-4">
                        <p className="text-sm text-slate-700 mb-2 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            <strong className="text-blue-600">Left click</strong> to fill cells, <strong className="text-red-600">right click</strong> to mark as crossed out.
                        </p>
                        <p className="text-sm text-slate-600 mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                            Numbers show consecutive filled cells in each row and column.
                        </p>

                        <div className="mt-2 text-xs text-slate-500 bg-white rounded-lg p-3 shadow-sm border border-slate-200" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            <span className="font-semibold text-slate-700">{normalizeDifficulty(difficulty)} Mode:</span> {settings.description} |
                            <span className="mx-1">⏱️</span>{Math.floor(settings.timeLimit / 60)}:{String(settings.timeLimit % 60).padStart(2, '0')} time limit |
                            <span className="mx-1">❤️</span>{settings.lives} lives |
                            <span className="mx-1">💡</span>{settings.hints} hints
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
                    correctAnswers: correctCells,
                    totalQuestions: totalCells
                }}
            />
        </div>
    );
};

export default NonogramGame;
