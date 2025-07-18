import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import Header from '../../components/Header';
import { Search, Lightbulb, Target, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';

const WordSearchMaster = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(180);
    const [grid, setGrid] = useState([]);
    const [wordsToFind, setWordsToFind] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [hints, setHints] = useState(3);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [totalWordsFound, setTotalWordsFound] = useState(0);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const [hintCells, setHintCells] = useState([]);
    const [foundWordCells, setFoundWordCells] = useState([]);
    const [animatingCells, setAnimatingCells] = useState([]);
    const [celebrationAnimation, setCelebrationAnimation] = useState(false);
    const [showWordSearchInstructions, setShowWordSearchInstructions] = useState(true);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Word lists by category
    const wordLists = {
        Easy: [
            'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BIRD', 'FISH',
            'BOOK', 'PLAY', 'JUMP', 'RUN', 'FAST', 'SLOW', 'BIG', 'SMALL'
        ],
        Medium: [
            'HOUSE', 'MUSIC', 'HAPPY', 'LIGHT', 'OCEAN', 'MOUNTAIN', 'FLOWER', 'ANIMAL',
            'SCHOOL', 'FRIEND', 'FAMILY', 'NATURE', 'BEAUTY', 'SIMPLE', 'BRIGHT', 'STRONG'
        ],
        Hard: [
            'KNOWLEDGE', 'ADVENTURE', 'CREATIVE', 'PEACEFUL', 'JOURNEY', 'WISDOM', 'HARMONY', 'FREEDOM',
            'CHALLENGE', 'DISCOVER', 'INSPIRATION', 'EXCELLENCE', 'BEAUTIFUL', 'WONDERFUL', 'AMAZING', 'FANTASTIC'
        ]
    };

    // Difficulty settings
    const difficultySettings = {
        Easy: { gridSize: 10, wordCount: 6, timeLimit: 180, hints: 3 },
        Medium: { gridSize: 12, wordCount: 8, timeLimit: 240, hints: 2 },
        Hard: { gridSize: 15, wordCount: 10, timeLimit: 300, hints: 1 }
    };

    // Generate random letter
    const getRandomLetter = () => {
        return String.fromCharCode(65 + Math.floor(Math.random() * 26));
    };

    // Create empty grid
    const createEmptyGrid = (size) => {
        return Array(size).fill(null).map(() => Array(size).fill(''));
    };

    // Check if word can be placed at position in direction
    const canPlaceWord = (grid, word, row, col, direction) => {
        const size = grid.length;
        const directions = {
            horizontal: [0, 1],
            vertical: [1, 0],
            diagonal: [1, 1],
            diagonalUp: [-1, 1]
        };

        const [deltaRow, deltaCol] = directions[direction];

        for (let i = 0; i < word.length; i++) {
            const newRow = row + deltaRow * i;
            const newCol = col + deltaCol * i;

            if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
                return false;
            }

            if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
                return false;
            }
        }

        return true;
    };

    // Place word in grid
    const placeWord = (grid, word, row, col, direction) => {
        const directions = {
            horizontal: [0, 1],
            vertical: [1, 0],
            diagonal: [1, 1],
            diagonalUp: [-1, 1]
        };

        const [deltaRow, deltaCol] = directions[direction];
        const positions = [];

        for (let i = 0; i < word.length; i++) {
            const newRow = row + deltaRow * i;
            const newCol = col + deltaCol * i;
            grid[newRow][newCol] = word[i];
            positions.push({ row: newRow, col: newCol });
        }

        return positions;
    };

    // Generate word search grid
    const generateWordSearch = useCallback(() => {
        const settings = difficultySettings[difficulty];
        const size = settings.gridSize;
        const wordCount = settings.wordCount;
        const availableWords = wordLists[difficulty];

        const grid = createEmptyGrid(size);
        const wordsToPlace = [];
        const wordPositions = [];

        // Select random words
        const selectedWords = [...availableWords]
            .sort(() => Math.random() - 0.5)
            .slice(0, wordCount);

        // Place words in grid
        selectedWords.forEach(word => {
            const directions = ['horizontal', 'vertical', 'diagonal', 'diagonalUp'];
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                const direction = directions[Math.floor(Math.random() * directions.length)];
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);

                if (canPlaceWord(grid, word, row, col, direction)) {
                    const positions = placeWord(grid, word, row, col, direction);
                    wordsToPlace.push(word);
                    wordPositions.push({ word, positions });
                    placed = true;
                }

                attempts++;
            }
        });

        // Fill empty cells with random letters
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === '') {
                    grid[i][j] = getRandomLetter();
                }
            }
        }

        setGrid(grid);
        setWordsToFind(wordsToPlace);
        setFoundWords([]);
        setSelectedCells([]);
        setHintCells([]);

        // Store word positions for validation
        window.wordPositions = wordPositions;
    }, [difficulty]);

    // Calculate score
    const calculateScore = useCallback(() => {
        if (wordsToFind.length === 0) return 0;

        const settings = difficultySettings[difficulty];
        const completionRate = foundWords.length / wordsToFind.length;

        // Base score from completion (0-100 points)
        let baseScore = completionRate * 100;

        // Time bonus (max 40 points)
        const timeBonus = Math.min(40, (timeRemaining / settings.timeLimit) * 40);

        // Streak bonus (max 30 points)
        const streakBonus = Math.min(maxStreak * 5, 30);

        // Hints penalty (subtract up to 15 points)
        const maxHints = settings.hints;
        const hintsUsed = maxHints - hints;
        const hintsPenalty = (hintsUsed / maxHints) * 15;

        // Difficulty multiplier
        const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Medium' ? 1.0 : 1.2;

        // Speed bonus (max 15 points)
        const avgTimePerWord = foundWords.length > 0 ? totalTimeSpent / foundWords.length : 0;
        const speedBonus = Math.max(0, Math.min(15, (30 - avgTimePerWord) * 0.5));

        let finalScore = (baseScore + timeBonus + streakBonus + speedBonus - hintsPenalty) * difficultyMultiplier;

        // Apply final scaling to make 200 challenging but achievable
        finalScore = finalScore * 0.85;

        return Math.max(0, Math.min(200, Math.round(finalScore)));
    }, [foundWords.length, wordsToFind.length, timeRemaining, difficulty, maxStreak, hints, totalTimeSpent]);

    // Update score
    useEffect(() => {
        setScore(calculateScore());
    }, [calculateScore]);

    // Cell selection handlers
    const handleCellMouseDown = (row, col) => {
        if (gameState !== 'playing') return;

        setIsSelecting(true);
        setSelectedCells([{ row, col }]);
    };

    const handleCellMouseEnter = (row, col) => {
        if (!isSelecting || gameState !== 'playing') return;

        const start = selectedCells[0];
        if (!start) return;

        const cells = getLineCells(start.row, start.col, row, col);
        setSelectedCells(cells);
    };

    const handleCellMouseUp = () => {
        if (!isSelecting || gameState !== 'playing') return;

        setIsSelecting(false);
        checkSelectedWord();
    };

    // Get cells in a line between two points
    const getLineCells = (startRow, startCol, endRow, endCol) => {
        const cells = [];
        const deltaRow = endRow - startRow;
        const deltaCol = endCol - startCol;

        // Check if it's a valid line (horizontal, vertical, or diagonal)
        if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
            const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
            const stepRow = steps === 0 ? 0 : deltaRow / steps;
            const stepCol = steps === 0 ? 0 : deltaCol / steps;

            for (let i = 0; i <= steps; i++) {
                cells.push({
                    row: startRow + Math.round(stepRow * i),
                    col: startCol + Math.round(stepCol * i)
                });
            }
        }

        return cells;
    };

    // Check if selected cells form a word
    const checkSelectedWord = () => {
        if (selectedCells.length < 2) {
            setSelectedCells([]);
            return;
        }

        const selectedWord = selectedCells
            .map(cell => grid[cell.row][cell.col])
            .join('');

        const reverseWord = selectedWord.split('').reverse().join('');

        const foundWord = wordsToFind.find(word =>
            word === selectedWord || word === reverseWord
        );

        if (foundWord && !foundWords.includes(foundWord)) {
            // Word found!
            // Add animation to found cells
            setAnimatingCells(selectedCells);
            setCelebrationAnimation(true);

            // Add to permanently found cells
            setFoundWordCells(prev => [...prev, ...selectedCells]);

            setFoundWords(prev => [...prev, foundWord]);
            setTotalWordsFound(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                setMaxStreak(current => Math.max(current, newStreak));
                return newStreak;
            });

            // Clear animations after delay
            setTimeout(() => {
                setAnimatingCells([]);
                setCelebrationAnimation(false);
            }, 1000);

            // Check if all words found
            if (foundWords.length + 1 === wordsToFind.length) {
                setTimeout(() => {
                    setGameState('finished');
                }, 1000);
            }
        } else {
            setStreak(0);
        }

        setSelectedCells([]);
    };

    // Use hint
    const useHint = () => {
        if (hints <= 0 || gameState !== 'playing') return;

        const remainingWords = wordsToFind.filter(word => !foundWords.includes(word));
        if (remainingWords.length === 0) return;

        const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        const wordData = window.wordPositions?.find(wp => wp.word === randomWord);

        if (wordData) {
            setHintCells(wordData.positions);
            setHints(prev => prev - 1);

            // Clear hint after 3 seconds
            setTimeout(() => {
                setHintCells([]);
            }, 3000);
        }
    };

    // Timer countdown
    useEffect(() => {
        let interval;
        if (gameState === 'playing' && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setGameState('finished');
                        setShowCompletionModal(true);
                        return 0;
                    }
                    return prev - 1;
                });
                setTotalTimeSpent(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timeRemaining]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty];
        setScore(0);
        setTimeRemaining(settings.timeLimit);
        setHints(settings.hints);
        setStreak(0);
        setMaxStreak(0);
        setTotalWordsFound(0);
        setTotalTimeSpent(0);
        setFoundWords([]);
        setSelectedCells([]);
        setHintCells([]);
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        generateWordSearch();
    };

    const handleReset = () => {
        initializeGame();
        setGrid([]);
        setWordsToFind([]);
        setFoundWordCells([]);
        setAnimatingCells([]);
        setCelebrationAnimation(false);
    };

    const handleGameComplete = (payload) => {
        console.log('Game completed:', payload);
    };

    const customStats = {
        wordsFound: foundWords.length,
        totalWords: wordsToFind.length,
        streak: maxStreak,
        hintsUsed: difficultySettings[difficulty].hints - hints,
        completionRate: wordsToFind.length > 0 ? Math.round((foundWords.length / wordsToFind.length) * 100) : 0
    };

    return (
        <div>
            <Header unreadCount={1} />

            <GameFramework
                gameTitle="Word Search Master"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowWordSearchInstructions(!showWordSearchInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Word Search Master
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showWordSearchInstructions
                                        ? <ChevronUp className="h-5 w-5 text-blue-900" />
                                        : <ChevronDown className="h-5 w-5 text-blue-900" />}
                                </span>
                            </div>

                            {/* Instructions */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showWordSearchInstructions ? '' : 'hidden'}`}>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 Objective
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        Find all hidden words in the letter grid by selecting them with your mouse.
                                    </p>
                                </div>

                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🔍 How to Search
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Drag from first to last letter</li>
                                        <li>• Words can be horizontal, vertical, or diagonal</li>
                                        <li>• Words can be forwards or backwards</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        📊 Scoring
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Points for each word found</li>
                                        <li>• Time bonus for quick completion</li>
                                        <li>• Streak bonus for consecutive finds</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💡 Tips
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• Use hints sparingly - they're limited!</li>
                                        <li>• Look for patterns and common letters</li>
                                        <li>• Try different directions for each word</li>
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
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Word Search Grid */}
                    <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Word Search Grid
                            </h3>

                            {grid.length > 0 && (
                                <div
                                    className="grid gap-0.5 sm:gap-1 mx-auto overflow-hidden"
                                    style={{
                                        gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
                                        maxWidth: '100%',
                                        width: 'min(500px, 100vw - 2rem)',
                                        aspectRatio: '1'
                                    }}
                                    onMouseLeave={() => setIsSelecting(false)}
                                >
                                    {grid.map((row, rowIndex) =>
                                        row.map((letter, colIndex) => {
                                            const isSelected = selectedCells.some(cell =>
                                                cell.row === rowIndex && cell.col === colIndex
                                            );
                                            const isHinted = hintCells.some(cell =>
                                                cell.row === rowIndex && cell.col === colIndex
                                            );
                                            const isFoundWord = foundWordCells.some(cell =>
                                                cell.row === rowIndex && cell.col === colIndex
                                            );
                                            const isAnimating = animatingCells.some(cell =>
                                                cell.row === rowIndex && cell.col === colIndex
                                            );

                                            return (
                                                <div
                                                    key={`${rowIndex}-${colIndex}`}
                                                    className={`
                            aspect-square flex items-center justify-center text-xs sm:text-sm font-bold
                            border-2 cursor-pointer select-none transition-all duration-300 transform
                            min-w-0 min-h-0
                            ${isSelected
                                                            ? 'bg-gradient-to-br from-blue-400 to-blue-500 border-blue-600 text-white shadow-lg scale-105'
                                                            : isFoundWord
                                                                ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white shadow-md'
                                                                : isHinted
                                                                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-yellow-500 text-gray-800 shadow-lg animate-pulse'
                                                                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 text-gray-800 hover:from-orange-50 hover:to-orange-100 hover:border-orange-300 hover:shadow-md hover:scale-105'
                                                        }
                            ${isAnimating ? 'animate-bounce bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-600 text-white shadow-xl scale-110' : ''}
                          `}
                                                    style={{
                                                        fontSize: `min(${Math.max(0.6, 2.5 / grid.length)}rem, 0.875rem)`
                                                    }}
                                                    onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                                                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                                                    onMouseUp={handleCellMouseUp}
                                                >
                                                    <span className={`${isAnimating ? 'animate-pulse font-extrabold' : ''}`}>
                                                        {letter}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* Celebration Animation */}
                            {celebrationAnimation && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-6xl animate-bounce">🎉</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="w-full lg:w-80 space-y-4 mt-6 lg:mt-0">
                        {/* Game Controls */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Game Controls
                            </h4>

                            <div className="space-y-3">
                                <button
                                    onClick={useHint}
                                    disabled={hints <= 0}
                                    className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${hints > 0
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                                >
                                    <Lightbulb className="h-4 w-4" />
                                    Use Hint ({hints})
                                </button>

                                <div className="text-center text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Hints will highlight a random unfound word for 3 seconds
                                </div>
                            </div>
                        </div>

                        {/* Words to Find */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Words to Find ({foundWords.length}/{wordsToFind.length})
                            </h4>

                            <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                                {wordsToFind.map((word, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg flex items-center justify-between ${foundWords.includes(word)
                                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-md transform scale-105'
                                                : 'bg-gradient-to-r from-white to-gray-50 text-gray-700 hover:from-orange-50 hover:to-orange-100 hover:shadow-sm'
                                            }`}
                                    >
                                        <span className="font-medium text-sm sm:text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            {word}
                                        </span>
                                        {foundWords.includes(word) && (
                                            <CheckCircle className="h-4 w-4 text-green-600 animate-pulse" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Game Stats */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Game Stats
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className={`text-2xl font-bold text-[#FF6B3E] transition-all duration-300 ${streak > 0 ? 'animate-pulse' : ''}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        {streak}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        Current Streak
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold text-green-600 transition-all duration-300 ${maxStreak > streak && maxStreak > 0 ? 'animate-bounce' : ''}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        {maxStreak}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        Best Streak
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </GameFramework>
            <GameCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                score={score}
            />
        </div>
    );
};

export default WordSearchMaster;