import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import {
    ChevronUp,
    ChevronDown,
    RotateCcw,
    SkipForward,
    Lightbulb,
    Trophy,
    Target,
    Move,
    Star
} from 'lucide-react';

/* ===========================
   Levels (small maps)
   Legend:
   # = wall
   ' ' (space) = floor
   . = target
   $ = crate
   * = crate on target
   @ = player
   + = player on target
   =========================== */

const LEVELS = {
    Easy: [
        // Slightly tighter rooms, must route around to avoid cornering
        {
            name: "Side Slide",
            par: 12,
            map: `
########
# .   .#
#   $$ #
#  #   #
#  @   #
########`,
            // Push upper crate right then up; circle around for second
            solution: "URRUURRULLDDRRUU"
        },
        {
            name: "Loop Back",
            par: 14,
            map: `
########
#  .  .#
#  $$  #
# #  # #
#  @   #
########`,
            solution: "URRUURDLLURRULU"
        },
        {
            name: "Spiral",
            par: 16,
            map: `
########
# .   .#
#  #   #
# $$   #
#  @   #
########`,
            solution: "URRURRUULLDDRRUU"
        },
        {
            name: "Offset Pair",
            par: 16,
            map: `
########
# .    #
#  $$ .#
#   #  #
# @    #
########`,
            solution: "URRUURRULLDDRRUU"
        },
        {
            name: "Pinch Push",
            par: 17,
            map: `
########
# .  #.#
# $$   #
#   #  #
# @    #
########`,
            solution: "URRUURDLLURRULUU"
        }
    ],

    Moderate: [
        // 3 crates with order constraints and chokepoints
        {
            name: "Three Up",
            par: 20,
            map: `
########
# . . .#
#   $  #
# $$   #
#  @   #
########`,
            solution: "URRULURRDLLURRUU"
        },
        {
            name: "Narrow Neck",
            par: 22,
            map: `
########
# . .  #
#  #$  #
# $$   #
# @    #
########`,
            solution: "URRULDLURRUURDLU"
        },
        {
            name: "Forked Hall",
            par: 24,
            map: `
#########
# .  . .#
#  #$#  #
# $$    #
#  @    #
#########`,
            solution: "URRUULDRURDLLURRUU"
        },
        {
            name: "Corner Gate",
            par: 24,
            map: `
########
# .# . #
# $$#  #
#  $   #
# @    #
########`,
            solution: "URRULURRDLLURRUU"
        },
        {
            name: "Figure-8",
            par: 26,
            map: `
########
# . . .#
#  #   #
# $$$  #
#  @   #
########`,
            solution: "URRULURRDLLURRUURD"
        }
    ],

    Hard: [
        // 3–4 crates; tighter corridors; deliberate ordering
        {
            name: "Packed Row",
            par: 28,
            map: `
#########
# . . . #
# $$$   #
#  @    #
#########`,
            solution: "URRULURRDLLURRUURDLU"
        },
        {
            name: "Switchbacks",
            par: 30,
            map: `
#########
# . . . #
#  # #  #
# $$$   #
#  @    #
#########`,
            solution: "URRULURRDLLURRUURDDLU"
        },
        {
            name: "Tight Corners",
            par: 32,
            map: `
#########
# .# .#.#
# $$$   #
#  @    #
#########`,
            solution: "URRULURRDLLURRUURDLUR"
        },
        {
            name: "Zig Chamber",
            par: 34,
            map: `
#########
# . . . #
#  ##   #
# $$$   #
#  @    #
#########`,
            solution: "URRULURRDLLURRUURDLURD"
        },
        {
            name: "Double Funnel",
            par: 36,
            map: `
#########
# . . . #
# # # # #
# $$$$  #
#  @    #
#########`,
            solution: "URRULURRDLLURRUURDLURDRU"
        }
    ]
};

/* ===========================
   Utils (contained in this file)
   =========================== */

// Accepts either a string map (multiline template string) or an array of rows.
const parseLevel = (mapOrRows) => {
    let rows;

    if (Array.isArray(mapOrRows)) {
        rows = mapOrRows;
    } else if (typeof mapOrRows === 'string') {
        // Normalize: remove \r, split lines, expand tabs to spaces, strip empty/indent-only lines
        rows = mapOrRows
            .replace(/\r/g, '')
            .split('\n')
            .map(l => l.replace(/\t/g, ' '))
            .filter(l => l.trim().length > 0);
    } else {
        throw new Error('parseLevel: expected string or array');
    }

    const h = rows.length;
    const w = rows.reduce((m, r) => Math.max(m, r.length), 1); // at least 1
    const grid = Array.from({ length: h }, () => Array(w).fill(' '));

    const targets = [];
    const crates = [];
    let player = { x: 0, y: 0 };

    for (let y = 0; y < h; y++) {
        const row = (rows[y] || '').padEnd(w, ' ');
        for (let x = 0; x < w; x++) {
            const ch = row[x];
            switch (ch) {
                case '#': grid[y][x] = '#'; break;
                case '.': targets.push({ x, y }); break;
                case '$': crates.push({ x, y }); break;
                case '*': crates.push({ x, y }); targets.push({ x, y }); break;
                case '@': player = { x, y }; break;
                case '+': player = { x, y }; targets.push({ x, y }); break;
                default: /* space/floor */ break;
            }
        }
    }

    return { grid, player, crates, targets };
};

const isWall = (grid, x, y) => {
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return true;
    return grid[y][x] === '#';
};

const hasCrateAt = (crates, x, y) => crates.some(c => c.x === x && c.y === y);

const canMove = (grid, player, nextPos, crates) => {
    const { x, y } = nextPos;
    if (isWall(grid, x, y)) return false;
    // if crate at next, need to be able to push it
    if (hasCrateAt(crates, x, y)) {
        const dx = x - player.x;
        const dy = y - player.y;
        const beyondX = x + dx;
        const beyondY = y + dy;
        if (isWall(grid, beyondX, beyondY)) return false;
        if (hasCrateAt(crates, beyondX, beyondY)) return false;
    }
    return true;
};

const canPushCrate = (grid, crateNewPos, crates) => {
    const { x, y } = crateNewPos;
    if (isWall(grid, x, y)) return false;
    if (hasCrateAt(crates, x, y)) return false;
    return true;
};

const isOnTarget = (targets, x, y) => targets.some(t => t.x === x && t.y === y);

const isLevelComplete = (crates, targets) =>
    crates.length > 0 && crates.every(c => isOnTarget(targets, c.x, c.y));

// Keyboard → direction vector
const getDirectionFromKeys = (key) => {
    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            return { x: 0, y: -1 };
        case 'ArrowDown':
        case 's':
        case 'S':
            return { x: 0, y: 1 };
        case 'ArrowLeft':
        case 'a':
        case 'A':
            return { x: -1, y: 0 };
        case 'ArrowRight':
        case 'd':
        case 'D':
            return { x: 1, y: 0 };
        default:
            return null;
    }
};

// 0–200 scoring
// Factors: completion ratio, move efficiency (sumPar/totalMoves), time efficiency, difficulty multiplier
const computeScore0to200 = ({
    completedLevels,
    totalLevels,
    totalMoves,
    sumPar,
    timeRemaining,
    timeLimit,
    difficulty
}) => {
    const completionRatio = totalLevels > 0 ? completedLevels / totalLevels : 0; // 0..1
    const moveEfficiency = totalMoves > 0 ? Math.min(1, sumPar / totalMoves) : 1; // >1 capped to 1
    const timeEfficiency = timeLimit > 0 ? Math.max(0, Math.min(1, timeRemaining / timeLimit)) : 0;

    // weights: completion 100, moves 60, time 40 (total 200 pre-multiplier)
    let raw = completionRatio * 100 + moveEfficiency * 60 + timeEfficiency * 40;

    const diffMult = difficulty === 'Hard' ? 1.1 : difficulty === 'Moderate' ? 1.0 : 0.9;
    let final = raw * diffMult;

    // cap & gentle hard-cap
    final = Math.max(0, Math.min(200, final * 0.97));
    return Math.round(final);
};

/* ===========================
   In-file Grid Component
   =========================== */

const SokobanGridInline = ({
    grid,
    player,
    crates,
    targets,
    animatingPlayer,
    animatingCrate,
    cellSize = 48
}) => {
    const h = grid.length;
    const w = grid[0]?.length || 0;
    const styleCell = {
        width: cellSize,
        height: cellSize
    };

    const isCrateAt = (x, y) => crates.some(c => c.x === x && c.y === y);
    const isPlayerAt = (x, y) => player.x === x && player.y === y;

    return (
        <div
            className="inline-block p-2 bg-gray-200 rounded-lg border-2 border-gray-800"
            style={{ lineHeight: 0 }}
        >
            {Array.from({ length: h }).map((_, y) => (
                <div key={y} className="flex">
                    {Array.from({ length: w }).map((_, x) => {
                        const wall = grid[y][x] === '#';
                        const target = isOnTarget(targets, x, y);
                        const crate = isCrateAt(x, y);
                        const playerHere = isPlayerAt(x, y);

                        return (
                            <div
                                key={`${x}-${y}`}
                                className={`relative border border-gray-400 ${wall ? 'bg-gray-700' : 'bg-white'}`}
                                style={styleCell}
                            >
                                {/* target dot */}
                                {!wall && target && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                    </div>
                                )}
                                {/* crate */}
                                {!wall && crate && (
                                    <div
                                        className={`absolute inset-1 rounded-md border ${animatingCrate && animatingCrate.x === x && animatingCrate.y === y ? 'animate-pulse' : ''
                                            }`}
                                        style={{ background: 'linear-gradient(to bottom, #f59e0b, #b45309)', borderColor: '#f59e0b' }}
                                        title="Crate"
                                    />
                                )}
                                {/* player */}
                                {!wall && playerHere && (
                                    <div
                                        className={`absolute inset-1 rounded-md border ${animatingPlayer ? 'animate-pulse' : ''}`}
                                        style={{ background: 'linear-gradient(to bottom, #3b82f6, #1e40af)', borderColor: '#3b82f6' }}
                                        title="You"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

/* ===========================
   Main Game
   =========================== */

const SokobanMicroGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');

    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(300);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    // Game state
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [levels, setLevels] = useState([]);
    const [grid, setGrid] = useState([['#']]);
    const [player, setPlayer] = useState({ x: 0, y: 0 });
    const [crates, setCrates] = useState([]);
    const [targets, setTargets] = useState([]);
    const [moves, setMoves] = useState(0);
    const [levelMoves, setLevelMoves] = useState(0);
    const [completedLevels, setCompletedLevels] = useState(0);
    const [totalMoves, setTotalMoves] = useState(0);
    const [undoStack, setUndoStack] = useState([]);
    const [animatingPlayer, setAnimatingPlayer] = useState(false);
    const [animatingCrate, setAnimatingCrate] = useState(null);
    const [celebrationMode, setCelebrationMode] = useState(false);

    const difficultySettings = {
        Easy: { timeLimit: 300, maxLevels: 5 },
        Moderate: { timeLimit: 240, maxLevels: 5 },
        Hard: { timeLimit: 180, maxLevels: 5 }
    };

    const sumPar = useMemo(
        () => (levels || []).reduce((acc, l) => acc + (l.par || 0), 0),
        [levels]
    );

    // Load levels on difficulty change
    useEffect(() => {
        const list = LEVELS[difficulty] || LEVELS.Easy;
        setLevels(list.slice(0, difficultySettings[difficulty].maxLevels));
        setCurrentLevelIndex(0);
    }, [difficulty]);

    // Load a level into state
    const loadLevel = useCallback(() => {
        if (!levels || levels.length === 0 || currentLevelIndex >= levels.length) return;
        const lvl = levels[currentLevelIndex];
        const parsed = parseLevel(lvl.map);
        setGrid(parsed.grid);
        setPlayer(parsed.player);
        setCrates(parsed.crates);
        setTargets(parsed.targets);
        setLevelMoves(0);
        setUndoStack([]);
        setCelebrationMode(false);
    }, [levels, currentLevelIndex]);

    // Whenever level list or index changes, load it
    useEffect(() => {
        loadLevel();
    }, [loadLevel]);

    // Key input
    useEffect(() => {
        const onKeyDown = (e) => {
            if (gameState !== 'playing') return;
            const dir = getDirectionFromKeys(e.key);
            if (dir) {
                e.preventDefault();
                movePlayer(dir);
            } else if (e.key === 'u' || e.key === 'U') {
                e.preventDefault();
                undoMove();
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                loadLevel();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [gameState, loadLevel, player, grid, crates]);

    // Save state for undo
    const saveState = () => {
        setUndoStack(prev => [
            ...prev,
            {
                player: { ...player },
                crates: crates.map(c => ({ ...c })),
                levelMoves
            }
        ]);
    };

    const undoMove = () => {
        if (undoStack.length === 0) return;
        const last = undoStack[undoStack.length - 1];
        setPlayer(last.player);
        setCrates(last.crates);
        setLevelMoves(last.levelMoves);
        setMoves(m => Math.max(0, m - 1));
        setTotalMoves(m => Math.max(0, m - 1));
        setUndoStack(prev => prev.slice(0, -1));
    };

    // Perform movement
    const movePlayer = useCallback((direction) => {
        if (gameState !== 'playing' || celebrationMode) return;

        const next = { x: player.x + direction.x, y: player.y + direction.y };
        if (!canMove(grid, player, next, crates)) return;

        // If we will push a crate, ensure target beyond valid
        const crateToMove = crates.find(c => c.x === next.x && c.y === next.y);

        // snapshot for undo
        saveState();

        if (crateToMove) {
            const crateNext = { x: next.x + direction.x, y: next.y + direction.y };
            if (!canPushCrate(grid, crateNext, crates)) return;

            setAnimatingCrate(crateToMove);
            setTimeout(() => setAnimatingCrate(null), 160);

            setCrates(prev =>
                prev.map(c => (c === crateToMove ? { ...c, x: crateNext.x, y: crateNext.y } : c))
            );
        }

        setAnimatingPlayer(true);
        setTimeout(() => setAnimatingPlayer(false), 160);

        setPlayer(next);
        setMoves(m => m + 1);
        setLevelMoves(m => m + 1);
        setTotalMoves(m => m + 1);
    }, [gameState, celebrationMode, player, grid, crates]);

    // Level completion check
    useEffect(() => {
        if (gameState === 'playing' && isLevelComplete(crates, targets)) {
            setCelebrationMode(true);
            setTimeout(() => {
                const done = completedLevels + 1;
                setCompletedLevels(done);

                // next or finish
                if (currentLevelIndex + 1 >= levels.length) {
                    setFinalScore(score);
                    setGameState('finished');
                    setShowCompletionModal(true);
                } else {
                    setCurrentLevelIndex(i => i + 1);
                }
            }, 800);
        }
    }, [crates, targets, gameState, completedLevels, currentLevelIndex, levels.length, score]);

    // Scoring (live)
    useEffect(() => {
        if (gameState !== 'playing') return;
        const settings = difficultySettings[difficulty] || difficultySettings.Easy;
        const newScore = computeScore0to200({
            completedLevels,
            totalLevels: levels.length,
            totalMoves,
            sumPar,
            timeRemaining,
            timeLimit: settings.timeLimit,
            difficulty
        });
        setScore(newScore);
    }, [gameState, completedLevels, levels.length, totalMoves, sumPar, timeRemaining, difficulty]);

    // Timer
    useEffect(() => {
        let id;
        if (gameState === 'playing' && timeRemaining > 0) {
            id = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setFinalScore(score);
                        setGameState('finished');
                        setShowCompletionModal(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(id);
    }, [gameState, timeRemaining, score]);

    // Init/restart
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty] || difficultySettings.Easy;
        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setCurrentLevelIndex(0);
        setMoves(0);
        setLevelMoves(0);
        setCompletedLevels(0);
        setTotalMoves(0);
        setUndoStack([]);
        setCelebrationMode(false);
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
        // ensure level shown
        setTimeout(() => loadLevel(), 0);
    };

    const handleReset = () => {
        initializeGame();
        setShowCompletionModal(false);
        setTimeout(() => loadLevel(), 0);
    };

    const handleGameComplete = (payload) => {
        // optional callback hook
        console.log('Sokoban Micro completed:', payload);
    };

    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
        }
    };

    const currentLevel = levels[currentLevelIndex] || null;

    const customStats = {
        currentLevel: currentLevelIndex + 1,
        totalLevels: levels.length,
        levelMoves,
        totalMoves,
        levelsCompleted: completedLevels,
        undoCount: undoStack.length,
        efficiencyPct:
            totalMoves > 0 && sumPar > 0 ? Math.round(Math.min(1, sumPar / totalMoves) * 100) : 100
    };

    return (
        <div>
            <Header unreadCount={3} />

            <GameFramework
                gameTitle="Sokoban Micro"
                gameDescription={
                    <div className="mx-auto px-4 lg:px-0 mb-0">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    How to Play Sokoban Micro
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showInstructions ? <ChevronUp className="h-5 w-5 text-blue-900" /> : <ChevronDown className="h-5 w-5 text-blue-900" />}
                                </span>
                            </div>

                            {/* Instructions */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">🎯 Objective</h4>
                                    <p className="text-sm text-blue-700">
                                        Push all the crates (📦) onto the red target spots (🔴) to complete each level.
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">🎮 Controls</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• <strong>WASD</strong> or <strong>Arrow Keys</strong> to move</li>
                                        <li>• <strong>U</strong> to undo last move</li>
                                        <li>• <strong>R</strong> to restart level</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">📊 Scoring</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Completion, move efficiency, and time bonuses</li>
                                        <li>• Difficulty multiplier (Hard &gt; Moderate &gt; Easy)</li>
                                        <li>• Max score: 200</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Avoid pushing crates into corners</li>
                                        <li>• Plan a path for each crate before pushing</li>
                                        <li>• Use undo liberally to explore ideas</li>
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
                <div className="flex flex-col items-center">
                    {/* Level Info & controls */}
                    <div className="w-full max-w-4xl mb-6">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-blue-800">
                                        Level {currentLevelIndex + 1}/{levels.length}
                                    </span>
                                    {currentLevel && (
                                        <span className="text-xs text-blue-600 ml-2">
                                            "{currentLevel.name}"
                                        </span>
                                    )}
                                </div>
                                <div className="bg-green-100 px-4 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-green-800">
                                        Par: {currentLevel?.par || 0} moves
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={undoMove}
                                    disabled={undoStack.length === 0}
                                    className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${undoStack.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                        }`}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Undo
                                </button>

                                <button
                                    onClick={loadLevel}
                                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                                >
                                    <SkipForward className="h-4 w-4" />
                                    Restart
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center bg-white rounded-lg p-3">
                                <Move className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                <div className="text-sm text-gray-600">Level Moves</div>
                                <div className="text-lg font-semibold text-blue-600">{levelMoves}</div>
                            </div>

                            <div className="text-center bg-white rounded-lg p-3">
                                <Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
                                <div className="text-sm text-gray-600">Completed</div>
                                <div className="text-lg font-semibold text-green-600">{completedLevels}</div>
                            </div>

                            <div className="text-center bg-white rounded-lg p-3">
                                <Trophy className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                                <div className="text-sm text-gray-600">Total Moves</div>
                                <div className="text-lg font-semibold text-purple-600">{totalMoves}</div>
                            </div>

                            <div className="text-center bg-white rounded-lg p-3">
                                <Star className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                                <div className="text-sm text-gray-600">Efficiency</div>
                                <div className="text-lg font-semibold text-orange-600">
                                    {customStats.efficiencyPct}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Board */}
                    <div className="relative mb-6">
                        {celebrationMode && (
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10">
                                <div className="bg-green-500 text-white px-4 py-2 rounded-lg animate-bounce">
                                    🎉 Level Complete! 🎉
                                </div>
                            </div>
                        )}
                        <SokobanGridInline
                            grid={grid}
                            player={player}
                            crates={crates}
                            targets={targets}
                            animatingPlayer={animatingPlayer}
                            animatingCrate={animatingCrate}
                            cellSize={48}
                        />
                    </div>

                    {/* Quick help */}
                    <div className="text-center max-w-2xl">
                        <p className="text-sm text-gray-600 mb-2">
                            Use <strong>WASD</strong> / <strong>Arrow Keys</strong> to move. Push crates (📦) onto targets (🔴).
                        </p>
                        <p className="text-xs text-gray-500">
                            Press <strong>U</strong> to undo, <strong>R</strong> to restart the level.
                            Complete all {levels.length} levels to finish!
                        </p>
                    </div>

                    {/* Mobile controls */}
                    <div className="md:hidden mt-6 grid grid-cols-3 gap-2 w-48">
                        <div></div>
                        <button
                            onTouchStart={() => movePlayer({ x: 0, y: -1 })}
                            className="bg-blue-500 text-white p-3 rounded-lg active:bg-blue-600"
                        >
                            ↑
                        </button>
                        <div></div>

                        <button
                            onTouchStart={() => movePlayer({ x: -1, y: 0 })}
                            className="bg-blue-500 text-white p-3 rounded-lg active:bg-blue-600"
                        >
                            ←
                        </button>
                        <button
                            onTouchStart={() => movePlayer({ x: 0, y: 1 })}
                            className="bg-blue-500 text-white p-3 rounded-lg active:bg-blue-600"
                        >
                            ↓
                        </button>
                        <button
                            onTouchStart={() => movePlayer({ x: 1, y: 0 })}
                            className="bg-blue-500 text-white p-3 rounded-lg active:bg-blue-600"
                        >
                            →
                        </button>
                    </div>
                </div>
            </GameFramework>

            <GameCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                score={finalScore}
                difficulty={difficulty}
                duration={gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0}
                customStats={{
                    levelsCompleted: completedLevels,
                    totalMoves: totalMoves
                }}
            />
        </div>
    );
};

export default SokobanMicroGame;
