import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import Header from '../../components/Header';
import { Search, Lightbulb, Target, CheckCircle, Sparkles, Zap, Star, Crown, Trophy, Flame, ChevronUp, ChevronDown } from 'lucide-react';

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
    const [particleEffects, setParticleEffects] = useState([]);
    const [comboMultiplier, setComboMultiplier] = useState(1);
    const [perfectStreak, setPerfectStreak] = useState(false);
    const [lastWordLength, setLastWordLength] = useState(0);
    const [powerUpActive, setPowerUpActive] = useState(false);
    const [showWordSearchInstructions, setShowWordSearchInstructions] = useState(true);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Word lists by category - expanded for more variety
    const wordLists = {
        Easy: [
            'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BIRD', 'FISH', 'BOOK', 'PLAY', 
            'JUMP', 'RUN', 'FAST', 'SLOW', 'BIG', 'SMALL', 'HAPPY', 'SAD', 'HOT', 'COLD',
            'RED', 'BLUE', 'GREEN', 'YELLOW', 'FUN', 'GAME', 'LOVE', 'FRIEND', 'HOME', 'FOOD'
        ],
        Moderate: [
            'HOUSE', 'MUSIC', 'HAPPY', 'LIGHT', 'OCEAN', 'MOUNTAIN', 'FLOWER', 'ANIMAL',
            'SCHOOL', 'FRIEND', 'FAMILY', 'NATURE', 'BEAUTY', 'SIMPLE', 'BRIGHT', 'STRONG',
            'WATER', 'EARTH', 'PLANET', 'COLOR', 'SOUND', 'SMILE', 'LAUGH', 'DANCE', 'SING',
            'LEARN', 'TEACH', 'PEACE', 'DREAM', 'MAGIC'
        ],
        Hard: [
            'KNOWLEDGE', 'ADVENTURE', 'CREATIVE', 'PEACEFUL', 'JOURNEY', 'WISDOM', 'HARMONY', 'FREEDOM',
            'CHALLENGE', 'DISCOVER', 'INSPIRATION', 'EXCELLENCE', 'BEAUTIFUL', 'WONDERFUL', 'AMAZING', 'FANTASTIC',
            'MYSTERIOUS', 'IMAGINATION', 'UNIVERSE', 'EXPLORATION', 'DISCOVERY', 'INTELLIGENCE', 'CURIOSITY', 'POSSIBILITY',
            'EXTRAORDINARY', 'PHENOMENAL', 'SPECTACULAR', 'MAGNIFICENT', 'ASTONISHING', 'BREATHTAKING'
        ]
    };

    // Difficulty settings - updated with your requirements
    const difficultySettings = {
        Easy: { gridSize: 10, wordCount: 8, timeLimit: 180, hints: 3, pointsPerWord: 25 },
        Moderate: { gridSize: 12, wordCount: 5, timeLimit: 240, hints: 2, pointsPerWord: 40 },
        Hard: { gridSize: 15, wordCount: 4, timeLimit: 300, hints: 1, pointsPerWord: 50 }
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
        const availableWords = [...wordLists[difficulty]]; // Create a copy to avoid mutation

        const grid = createEmptyGrid(size);
        const wordsToPlace = [];
        const wordPositions = [];

        // Select random words
        const selectedWords = [];
        for (let i = 0; i < wordCount; i++) {
            if (availableWords.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * availableWords.length);
            const word = availableWords[randomIndex];
            selectedWords.push(word);
            availableWords.splice(randomIndex, 1); // Remove to avoid duplicates
        }

        // Place words in grid
        selectedWords.forEach(word => {
            const directions = ['horizontal', 'vertical', 'diagonal', 'diagonalUp'];
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 200) { // Increased attempts for better placement
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
        setFoundWordCells([]);

        // Store word positions for validation
        window.wordPositions = wordPositions;
    }, [difficulty]);

   // Calculate score when words are found or game ends
// Calculate score when words are found or game ends - SIMPLIFIED VERSION
useEffect(() => {
    if (wordsToFind.length === 0 || gameState === 'ready') return;
    
    const settings = difficultySettings[difficulty];
    
    // Base score exactly as specified
    let newScore = foundWords.length * settings.pointsPerWord;
    
    // Only add bonuses when game is finished
    if (gameState === 'finished') {
        // Time bonus
        const timeBonus = Math.min(50, (timeRemaining / settings.timeLimit) * 50);
        newScore += timeBonus;
        
        // Streak bonus
        const streakBonus = Math.min(maxStreak * 3, 30);
        newScore += streakBonus;
        
        // Hints penalty
        const maxHints = settings.hints;
        const hintsUsed = maxHints - hints;
        const hintsPenalty = (hintsUsed / maxHints) * 20;
        newScore = Math.max(0, newScore - hintsPenalty);
        
        // Apply difficulty multiplier to bonuses only
        const difficultyMultiplier = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 1.2 : 1.5;
        const baseScore = foundWords.length * settings.pointsPerWord;
        const bonuses = (newScore - baseScore) * difficultyMultiplier;
        newScore = baseScore + bonuses;
    }
    
    // Cap at 200 points
    newScore = Math.min(200, Math.round(newScore));
    
    setScore(newScore);
}, [foundWords.length, gameState, difficulty, maxStreak, hints, timeRemaining, wordsToFind.length]);

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
            const wordLength = foundWord.length;
            setLastWordLength(wordLength);
            setAnimatingCells(selectedCells);
            setCelebrationAnimation(true);

            // Create particle effects
            const particles = selectedCells.map((cell, index) => ({
                id: Date.now() + index,
                x: cell.col * 40 + 20,
                y: cell.row * 40 + 20,
                color: ['#FFD700', '#FF6B3E', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 4)]
            }));
            setParticleEffects(particles);

            // Add to permanently found cells
            setFoundWordCells(prev => [...prev, ...selectedCells]);

            setFoundWords(prev => [...prev, foundWord]);
            setTotalWordsFound(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;

                // Check for perfect streak (5+ consecutive)
                if (newStreak >= 5) {
                    setPerfectStreak(true);
                    setTimeout(() => setPerfectStreak(false), 3000);
                }

                // Combo multiplier based on streak
                setComboMultiplier(Math.min(3, 1 + (newStreak - 1) * 0.2));

                setMaxStreak(current => Math.max(current, newStreak));
                return newStreak;
            });

            // Clear animations after delay
            setTimeout(() => {
                setAnimatingCells([]);
                setCelebrationAnimation(false);
                setParticleEffects([]);
            }, 1000);

            // Check if all words found
            if (foundWords.length + 1 === wordsToFind.length) {
                setTimeout(() => {
                    setGameState('finished');
                    setShowCompletionModal(true);
                }, 1000);
            }
        } else {
            setStreak(0);
            setComboMultiplier(1);
            setPerfectStreak(false);
        }

        setSelectedCells([]);
    };

    // Use hint
    const useHint = () => {
        if (hints <= 0 || gameState !== 'playing') return;

        setPowerUpActive(true);
        setTimeout(() => setPowerUpActive(false), 3000);

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
    setScore(0); // This line should already be there
    setTimeRemaining(settings.timeLimit);
    setHints(settings.hints);
    setStreak(0);
    setMaxStreak(0);
    setTotalWordsFound(0);
    setTotalTimeSpent(0);
    setFoundWords([]);
    setSelectedCells([]);
    setHintCells([]);
    setFoundWordCells([]);
    setAnimatingCells([]);
    setCelebrationAnimation(false);
    setParticleEffects([]);
    setComboMultiplier(1);
    setPerfectStreak(false);
    setLastWordLength(0);
    setPowerUpActive(false);
}, [difficulty]);

    const handleStart = () => {
        initializeGame();
        generateWordSearch();
        setGameState('playing');
    };

    const handleReset = () => {
        initializeGame();
        setGrid([]);
        setWordsToFind([]);
        setGameState('ready');
    };

    const handleGameComplete = (payload) => {
        console.log('Game completed:', payload);
    };

    const customStats = {
        wordsFound: foundWords.length,
        totalWords: wordsToFind.length,
        streak: maxStreak,
        comboMultiplier: Math.round(comboMultiplier * 100) / 100,
        hintsUsed: difficultySettings[difficulty].hints - hints,
        completionRate: wordsToFind.length > 0 ? Math.round((foundWords.length / wordsToFind.length) * 100) : 0,
        // Add this line to show base score calculation:
        baseScore: foundWords.length * difficultySettings[difficulty].pointsPerWord
    };

    return (
        <div>
            {gameState === 'ready' && <Header unreadCount={1} />}

            <GameFramework
                gameTitle="Word Search Master"
        gameShortDescription="Find hidden words in a letter grid. Test your pattern recognition and vocabulary skills!"
                gameDescription={
                    <div className="mx-auto px-1 mb-2">
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
                                        <li>• Easy: 8 words × 25 points</li>
                                        <li>• Medium: 5 words × 40 points</li>
                                        <li>• Hard: 4 words × 50 points</li>
                                        <li>• Max score: 200 points</li>
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
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Word Search Grid */}
                    <div className="flex-1 relative">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Word Search Grid
                            </h3>

                            {/* Combo Multiplier Display */}
                            {comboMultiplier > 1 && (
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                        <Zap className="inline w-4 h-4 mr-1" />
                                        {comboMultiplier.toFixed(1)}x COMBO!
                                    </div>
                                </div>
                            )}

                            {/* Perfect Streak Banner */}
                            {perfectStreak && (
                                <div className="absolute top-12 right-4 z-10">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
                                        <Crown className="inline w-4 h-4 mr-1" />
                                        PERFECT STREAK!
                                    </div>
                                </div>
                            )}

                            {grid.length > 0 && (
                                <div
                                    className="grid gap-0.5 sm:gap-1 mx-auto overflow-hidden"
                                    style={{
                                        gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
                                        maxWidth: '100%',
                                        width: 'min(500px, 100vw - 2rem)',
                                        aspectRatio: '1',
                                        position: 'relative'
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
                            border-2 cursor-pointer select-none transition-all duration-500 transform relative
                            min-w-0 min-h-0
                            ${isSelected
                                                            ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 border-blue-600 text-white shadow-2xl scale-110 shadow-blue-500/50 animate-pulse'
                                                            : isFoundWord
                                                                ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 border-green-600 text-white shadow-xl shadow-green-500/30 animate-pulse'
                                                                : isHinted
                                                                    ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 border-yellow-500 text-gray-900 shadow-2xl animate-bounce shadow-yellow-500/50'
                                                                    : `bg-gradient-to-br from-slate-50 via-white to-gray-50 border-gray-200 text-gray-800 
                                 hover:from-orange-100 hover:via-pink-50 hover:to-purple-100 
                                 hover:border-gradient-to-r hover:border-orange-300 
                                 hover:shadow-xl hover:scale-110 hover:shadow-orange-200/50
                                 hover:text-gray-900 hover:font-extrabold hover:rotate-3`
                                                        }
                            ${isAnimating ? 'animate-bounce bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-yellow-600 text-white shadow-2xl scale-125 shadow-yellow-500/60 animate-spin' : ''}
                            ${powerUpActive && isHinted ? 'animate-spin' : ''}
                          `}
                                                    style={{
                                                        fontSize: `min(${Math.max(0.6, 2.5 / grid.length)}rem, 0.875rem)`
                                                    }}
                                                    onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                                                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                                                    onMouseUp={handleCellMouseUp}
                                                >
                                                    {/* Shimmer Effect for Normal Cells */}
                                                    {!isSelected && !isFoundWord && !isHinted && !isAnimating && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 hover:opacity-100 hover:animate-pulse transition-opacity duration-300"></div>
                                                    )}

                                                    {/* Cell Background Pattern */}
                                                    <div className="absolute inset-0 opacity-10">
                                                        <div className="w-full h-full bg-gradient-to-br from-transparent via-white to-transparent"></div>
                                                    </div>

                                                    <span className={`relative z-10 ${isAnimating ? 'animate-pulse font-extrabold text-shadow-lg' : ''} ${isSelected ? 'animate-bounce' : ''}`}>
                                                        {letter}
                                                    </span>

                                                    {/* Enhanced Sparkle effect for found words */}
                                                    {isFoundWord && (
                                                        <div className="absolute top-0 right-0 animate-bounce">
                                                            <Sparkles className="w-3 h-3 text-yellow-300 animate-ping drop-shadow-lg" />
                                                        </div>
                                                    )}

                                                    {/* Glow effect for selected cells */}
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-blue-400/30 rounded-lg animate-pulse blur-sm"></div>
                                                    )}

                                                    {/* Magic sparkles for animating cells */}
                                                    {isAnimating && (
                                                        <>
                                                            <div className="absolute -top-1 -left-1 text-yellow-300 animate-ping">✨</div>
                                                            <div className="absolute -top-1 -right-1 text-orange-300 animate-ping delay-100">⭐</div>
                                                            <div className="absolute -bottom-1 -left-1 text-pink-300 animate-ping delay-200">💫</div>
                                                            <div className="absolute -bottom-1 -right-1 text-purple-300 animate-ping delay-300">🌟</div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* Particle Effects */}
                            {particleEffects.map((particle) => (
                                <div
                                    key={particle.id}
                                    className="absolute w-3 h-3 rounded-full animate-ping pointer-events-none shadow-lg"
                                    style={{
                                        backgroundColor: particle.color,
                                        left: particle.x,
                                        top: particle.y,
                                        animationDuration: '1.5s',
                                        boxShadow: `0 0 10px ${particle.color}`
                                    }}
                                />
                            ))}

                            {/* Celebration Animation */}
                            {celebrationAnimation && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                    <div className="text-8xl animate-bounce drop-shadow-2xl">🎉</div>
                                    <div className="absolute text-4xl animate-spin drop-shadow-lg">✨</div>
                                    <div className="absolute text-3xl animate-pulse drop-shadow-lg">🌟</div>
                                    <div className="absolute text-2xl animate-ping text-yellow-400 top-8 left-8">💫</div>
                                    <div className="absolute text-2xl animate-ping text-pink-400 top-8 right-8 delay-100">⭐</div>
                                    <div className="absolute text-2xl animate-ping text-purple-400 bottom-8 left-8 delay-200">🌈</div>
                                    <div className="absolute text-2xl animate-ping text-orange-400 bottom-8 right-8 delay-300">🔥</div>
                                    {lastWordLength >= 6 && (
                                        <div className="absolute top-16 text-2xl animate-bounce text-yellow-500 font-bold drop-shadow-lg bg-white/20 px-4 py-2 rounded-full">LONG WORD BONUS!</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="w-full lg:w-80 space-y-6 mt-6 lg:mt-0">
                        {/* Game Controls */}
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 shadow-lg border border-blue-100/50">
                            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <Zap className="inline w-4 h-4 mr-2" />Game Controls
                            </h4>

                            <div className="space-y-3">
                                <button
                                    onClick={useHint}
                                    disabled={hints <= 0}
                                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 ${hints > 0
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl shadow-yellow-500/25'
                                        : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed'
                                        }`}
                                    style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                                >
                                    <Lightbulb className={`h-4 w-4 ${powerUpActive ? 'animate-pulse' : ''}`} />
                                    Use Hint ({hints})
                                </button>

                                <div className="text-center text-xs sm:text-sm text-gray-600 bg-white/50 rounded-lg p-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    Hints will highlight a random unfound word for 3 seconds
                                </div>
                            </div>
                        </div>

                        {/* Words to Find */}
                        <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-5 shadow-lg border border-purple-100/50">
                            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <Star className="inline w-4 h-4 mr-2" />Words to Find ({foundWords.length}/{wordsToFind.length})
                            </h4>

                            <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                                {wordsToFind.map((word, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg flex items-center justify-between ${foundWords.includes(word)
                                            ? 'bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 text-green-800 shadow-lg transform scale-105 border border-green-200'
                                            : 'bg-gradient-to-r from-white via-slate-50 to-gray-50 text-gray-700 hover:from-orange-50 hover:via-pink-50 hover:to-purple-50 hover:shadow-md hover:scale-102 transition-all duration-300'
                                            }`}
                                    >
                                        <span className={`font-medium text-sm sm:text-base ${foundWords.includes(word) ? 'font-bold' : ''}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            {word}
                                            {foundWords.includes(word) && word.length >= 6 && (
                                                <Flame className="inline w-3 h-3 ml-1 text-orange-500" />
                                            )}
                                        </span>
                                        {foundWords.includes(word) && (
                                            <CheckCircle className="h-4 w-4 text-green-600 animate-pulse drop-shadow-sm" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Game Stats */}
                        <div className="bg-gradient-to-br from-slate-50 to-green-50 rounded-xl p-5 shadow-lg border border-green-100/50">
                            <h4 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <Trophy className="inline w-4 h-4 mr-2" />Game Stats
                            </h4>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Score:</span>
                                    <span className="font-bold">{score}/200</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Max Streak:</span>
                                    <span className="font-bold">{maxStreak}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Combo Multiplier:</span>
                                    <span className="font-bold">{comboMultiplier.toFixed(1)}x</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hints Used:</span>
                                    <span className="font-bold">{difficultySettings[difficulty].hints - hints}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Completion:</span>
                                    <span className="font-bold">{customStats.completionRate}%</span>
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