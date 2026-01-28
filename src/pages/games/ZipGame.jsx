import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import { ChevronUp, ChevronDown, Sparkles, Zap, Star, Trophy, AlertTriangle } from 'lucide-react';

// ============= SELF-CONTAINED STYLES =============
// All colors and styles are defined here - no external CSS dependencies

const COLORS = {
  // Core colors (HSL values converted to usable format)
  primary: '#FF6B3E',
  primaryLight: 'rgba(255, 107, 62, 0.2)',
  primaryForeground: '#FFFFFF',
  background: '#FFFFFF',
  foreground: '#1E293B',
  card: '#FFFFFF',
  cardForeground: '#1E293B',
  muted: '#E8EAED',
  mutedForeground: '#6B7280',
  border: '#E5E7EB',
  
  // Accent colors
  green: '#22C55E',
  greenLight: 'rgba(34, 197, 94, 0.2)',
  red: '#EF4444',
  redLight: 'rgba(239, 68, 68, 0.2)',
  blue: '#3B82F6',
  blueLight: 'rgba(59, 130, 246, 0.2)',
  purple: '#A855F7',
  purpleLight: 'rgba(168, 85, 247, 0.2)',
  yellow: '#FACC15',
  orange: '#F97316',
};

// All animations and custom CSS classes
const gameStyles = `
  @keyframes particleFade {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(2); }
  }
  @keyframes floatUp {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-40px) scale(1.5); }
  }
  @keyframes cellPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  @keyframes zipBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes zipPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes zipSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .zip-bounce { animation: zipBounce 0.6s ease-in-out infinite; }
  .zip-pulse { animation: zipPulse 2s ease-in-out infinite; }
  .zip-spin { animation: zipSpin 2s linear infinite; }
  .zip-pulse-fast { animation: pulse 1s ease-in-out infinite; }
`;

// Difficulty settings - focused on puzzle complexity
const difficultySettings = {
  Easy: { gridSize: 6, timeLimit: 180, targetCount: 6, maxMoves: 50 },
  Moderate: { gridSize: 7, timeLimit: 150, targetCount: 8, maxMoves: 70 },
  Hard: { gridSize: 8, timeLimit: 120, targetCount: 10, maxMoves: 90 },
};


// Generate a challenging puzzle with a guaranteed winding solution path
const generatePuzzle = (gridSize, targetCount) => {
  const grid = [];
  
  // Initialize empty grid
  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      grid[row][col] = {
        row,
        col,
        number: null,
        isOnSolutionPath: false,
        solutionIndex: null,
        isStart: false,
        isEnd: false,
        isBlocked: false,
      };
    }
  }

  // Use a guaranteed spiral + snake hybrid pattern that always covers enough cells
  const solutionPath = [];
  const visited = new Set();
  const getKey = (r, c) => `${r},${c}`;
  
  // Create a winding path using a modified spiral approach
  const directions = [
    { dr: 0, dc: 1 },  // right
    { dr: 1, dc: 0 },  // down
    { dr: 0, dc: -1 }, // left
    { dr: -1, dc: 0 }, // up
  ];
  
  let row = 0;
  let col = 0;
  let dirIndex = 0;
  const minPathLength = targetCount + 10;
  
  // Start position
  solutionPath.push({ row, col });
  visited.add(getKey(row, col));
  
  // Generate spiral path
  let stuckCount = 0;
  while (solutionPath.length < gridSize * gridSize && stuckCount < 4) {
    const dir = directions[dirIndex];
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    
    if (
      newRow >= 0 && newRow < gridSize &&
      newCol >= 0 && newCol < gridSize &&
      !visited.has(getKey(newRow, newCol))
    ) {
      row = newRow;
      col = newCol;
      solutionPath.push({ row, col });
      visited.add(getKey(row, col));
      stuckCount = 0;
    } else {
      // Turn right
      dirIndex = (dirIndex + 1) % 4;
      stuckCount++;
    }
  }
  
  // If path is too short, fill remaining with any unvisited neighbors
  if (solutionPath.length < minPathLength) {
    const getUnvisitedNeighbors = (r, c)=> {
      const neighbors = [];
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !visited.has(getKey(nr, nc))) {
          neighbors.push({ row: nr, col: nc });
        }
      }
      return neighbors;
    };
    
    let current = solutionPath[solutionPath.length - 1];
    let attempts = 0;
    while (solutionPath.length < minPathLength && attempts < 100) {
      const neighbors = getUnvisitedNeighbors(current.row, current.col);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        solutionPath.push(next);
        visited.add(getKey(next.row, next.col));
        current = next;
      } else {
        // Find any cell in path that has unvisited neighbors
        let found = false;
        for (let i = solutionPath.length - 1; i >= 0; i--) {
          const neighbors = getUnvisitedNeighbors(solutionPath[i].row, solutionPath[i].col);
          if (neighbors.length > 0) {
            current = solutionPath[i];
            found = true;
            break;
          }
        }
        if (!found) break;
      }
      attempts++;
    }
  }

  // Ensure path has at least targetCount cells
  if (solutionPath.length < targetCount) {
    console.warn('Path too short, regenerating...');
    return generatePuzzle(gridSize, targetCount);
  }

  // Mark solution path on grid
  solutionPath.forEach((pos, idx) => {
    if (grid[pos.row] && grid[pos.row][pos.col]) {
      grid[pos.row][pos.col].isOnSolutionPath = true;
      grid[pos.row][pos.col].solutionIndex = idx;
    }
  });

  // Place numbered targets along the solution path - with safety checks
  const safePathLength = solutionPath.length;
  const step = Math.max(1, Math.floor((safePathLength - 1) / (targetCount - 1)));
  const numberPositions = [0]; // Start at first position
  
  for (let i = 1; i < targetCount - 1; i++) {
    const basePos = i * step;
    const pos = Math.min(basePos, safePathLength - 2);
    if (!numberPositions.includes(pos) && pos > 0 && pos < safePathLength - 1) {
      numberPositions.push(pos);
    }
  }
  
  // Always add the last position
  if (!numberPositions.includes(safePathLength - 1)) {
    numberPositions.push(safePathLength - 1);
  }
  numberPositions.sort((a, b) => a - b);

  // Safely place numbers
  numberPositions.forEach((pathIdx, numIdx) => {
    if (pathIdx >= 0 && pathIdx < solutionPath.length) {
      const pos = solutionPath[pathIdx];
      if (pos && grid[pos.row] && grid[pos.row][pos.col]) {
        grid[pos.row][pos.col].number = numIdx + 1;
        if (numIdx === 0) grid[pos.row][pos.col].isStart = true;
        if (numIdx === numberPositions.length - 1) grid[pos.row][pos.col].isEnd = true;
      }
    }
  });

  // Add some blocked cells (obstacles) - only on cells NOT on solution path
  const blockedCount = Math.floor(gridSize * gridSize * 0.08);
  let blocked = 0;
  const maxAttempts = blockedCount * 20;
  
  for (let i = 0; i < maxAttempts && blocked < blockedCount; i++) {
    const r = Math.floor(Math.random() * gridSize);
    const c = Math.floor(Math.random() * gridSize);
    if (grid[r][c] && !grid[r][c].isOnSolutionPath && !grid[r][c].isBlocked) {
      grid[r][c].isBlocked = true;
      blocked++;
    }
  }

  return { grid, solutionPath };
};

const ZipGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const [grid, setGrid] = useState([]);
  const [solutionPath, setSolutionPath] = useState([]);
  const [playerPath, setPlayerPath] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [maxNumber, setMaxNumber] = useState(6);
  const [isComplete, setIsComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(null);
  const [particles, setParticles] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showNumberHit, setShowNumberHit] = useState(null);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [wrongMoves, setWrongMoves] = useState(0);
  const [movesUsed, setMovesUsed] = useState(0);
  
  const gridRef = useRef(null);
  
  const settings = useMemo(() => difficultySettings[difficulty], [difficulty]);
  
  // Larger cell sizes for better focus
  const cellSize = useMemo(() => {
    const baseSize = 64;
    return difficulty === 'Hard' ? 52 : difficulty === 'Moderate' ? 58 : baseSize;
  }, [difficulty]);

  // Create particle burst effect
  const createParticles = useCallback((x, y, count = 8, color) => {
    const colors = color ? [color] : [COLORS.primary, COLORS.yellow, COLORS.green, COLORS.blue, '#FF69B4'];
    const newParticles = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `${Date.now()}-${i}-${Math.random()}`,
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 800);
  }, []);

  const initializeGame = useCallback(() => {
    const { grid: newGrid, solutionPath: newSolution } = generatePuzzle(settings.gridSize, settings.targetCount);
    setGrid(newGrid);
    setSolutionPath(newSolution);
    setPlayerPath([]);
    setCurrentTarget(1);
    setMaxNumber(settings.targetCount);
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setIsComplete(false);
    setShowCelebration(false);
    setRecentlyAdded(null);
    setParticles([]);
    setStreak(0);
    setShowNumberHit(null);
    setWrongMoves(0);
    setMovesUsed(0);
  }, [settings]);

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0 && !isComplete) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, isComplete]);

  // Check win condition - reached the last number
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (currentTarget > maxNumber) {
      setIsComplete(true);
      setShowCelebration(true);
      
      // Calculate score based on efficiency
      const optimalMoves = solutionPath.length;
      const efficiency = Math.max(0, 1 - (movesUsed - optimalMoves) / optimalMoves);
      const timeBonus = Math.floor((timeRemaining / settings.timeLimit) * 50);
      const efficiencyBonus = Math.floor(efficiency * 100);
      const penaltyForWrongMoves = wrongMoves * 5;
      const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.3;
      
      const finalScore = Math.round(
        Math.max(0, (timeBonus + efficiencyBonus + 50 - penaltyForWrongMoves) * difficultyMultiplier)
      );
      setScore(Math.min(200, finalScore));
      
      setTimeout(() => {
        setGameState('finished');
      }, 2500);
    }
  }, [currentTarget, maxNumber, solutionPath.length, movesUsed, wrongMoves, settings, timeRemaining, difficulty, gameState]);

  const isAdjacent = (pos1, pos2) => {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const isInPath = (row, col) => {
    return playerPath.some((p) => p.row === row && p.col === col);
  };

  const getPathIndex = (row, col) => {
    return playerPath.findIndex((p) => p.row === row && p.col === col);
  };

  const addToPath = useCallback((row, col) => {
    if (gameState !== 'playing' || isComplete) return;
    
    const cell = grid[row]?.[col];
    if (!cell || cell.isBlocked) return;
    
    const clickedPos = { row, col };
    const gap = 6;
    const cellWithGap = cellSize + gap;
    const centerX = col * cellWithGap + cellSize / 2;
    const centerY = row * cellWithGap + cellSize / 2;
    
    // Starting the path
    if (playerPath.length === 0) {
      if (cell.number === 1) {
        setPlayerPath([clickedPos]);
        setCurrentTarget(2);
        setRecentlyAdded(clickedPos);
        setStreak(1);
        setMovesUsed(1);
        createParticles(centerX, centerY, 15);
        setShowNumberHit({ num: 1, x: centerX, y: centerY });
        setTimeout(() => setShowNumberHit(null), 600);
        setTimeout(() => setRecentlyAdded(null), 300);
      }
      return;
    }
    
    const lastPos = playerPath[playerPath.length - 1];
    
    // Clicking on existing path to undo
    const pathIdx = getPathIndex(row, col);
    if (pathIdx !== -1) {
      const newPath = playerPath.slice(0, pathIdx + 1);
      setPlayerPath(newPath);
      setStreak(0);
      
      let highestReached = 1;
      for (const pos of newPath) {
        const num = grid[pos.row][pos.col].number;
        if (num && num > highestReached) {
          highestReached = num;
        }
      }
      setCurrentTarget(highestReached + 1);
      return;
    }
    
    // Not adjacent - invalid
    if (!isAdjacent(lastPos, clickedPos)) return;
    
    // Can't step on wrong numbered cell
    if (cell.number !== null && cell.number !== currentTarget) {
      setWrongMoves(prev => prev + 1);
      createParticles(centerX, centerY, 8, COLORS.red);
      return;
    }
    
    // Valid move
    const newPath = [...playerPath, clickedPos];
    setPlayerPath(newPath);
    setMovesUsed(prev => prev + 1);
    setRecentlyAdded(clickedPos);
    setTimeout(() => setRecentlyAdded(null), 300);
    
    // Check if this is a numbered target
    if (cell.number === currentTarget) {
      setCurrentTarget(currentTarget + 1);
      setStreak(prev => prev + 1);
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 300);
      createParticles(centerX, centerY, 20 + streak * 3);
      setShowNumberHit({ num: cell.number, x: centerX, y: centerY });
      setTimeout(() => setShowNumberHit(null), 600);
    } else {
      // Regular cell - small feedback
      createParticles(centerX, centerY, 3);
    }
  }, [gameState, isComplete, grid, playerPath, currentTarget, cellSize, createParticles, streak]);

  const getCellFromPoint = useCallback((clientX, clientY) => {
    if (!gridRef.current) return null;
    
    const rect = gridRef.current.getBoundingClientRect();
    const padding = 20;
    const gap = 6;
    
    const x = clientX - rect.left - padding;
    const y = clientY - rect.top - padding;
    
    const cellWithGap = cellSize + gap;
    const col = Math.floor(x / cellWithGap);
    const row = Math.floor(y / cellWithGap);
    
    if (row >= 0 && row < settings.gridSize && col >= 0 && col < settings.gridSize) {
      return { row, col };
    }
    return null;
  }, [cellSize, settings.gridSize]);

  const handlePointerDown = useCallback((e) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    setIsDragging(true);
    const pos = getCellFromPoint(e.clientX, e.clientY);
    if (pos) {
      addToPath(pos.row, pos.col);
    }
  }, [gameState, getCellFromPoint, addToPath]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || gameState !== 'playing') return;
    const pos = getCellFromPoint(e.clientX, e.clientY);
    if (pos && !isInPath(pos.row, pos.col)) {
      addToPath(pos.row, pos.col);
    }
  }, [isDragging, gameState, getCellFromPoint, addToPath]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Generate SVG path lines
  const getPathLines = useMemo(() => {
    if (playerPath.length < 2) return null;
    
    const lines = [];
    const halfCell = cellSize / 2;
    const gap = 6;
    const cellWithGap = cellSize + gap;
    
    for (let i = 0; i < playerPath.length - 1; i++) {
      const from = playerPath[i];
      const to = playerPath[i + 1];
      
      const x1 = from.col * cellWithGap + halfCell;
      const y1 = from.row * cellWithGap + halfCell;
      const x2 = to.col * cellWithGap + halfCell;
      const y2 = to.row * cellWithGap + halfCell;
      
      lines.push(
        <line
          key={`line-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={COLORS.primary}
          strokeWidth="8"
          strokeLinecap="round"
          style={{
            transition: 'all 0.15s ease',
            filter: `drop-shadow(0 4px 8px ${COLORS.primaryLight})`,
          }}
        />
      );
    }
    
    return lines;
  }, [playerPath, cellSize]);

  const handleStart = () => {
    initializeGame();
  };

  const handleReset = () => {
    setGrid([]);
    setSolutionPath([]);
    setPlayerPath([]);
    setCurrentTarget(1);
    setScore(0);
    setIsComplete(false);
    setShowCelebration(false);
    setWrongMoves(0);
    setMovesUsed(0);
  };

  const handleGameComplete = (payload) => {
  };

  const isValidNextMove = (row, col) => {
    const cell = grid[row]?.[col];
    if (!cell || cell.isBlocked) return false;
    
    if (playerPath.length === 0) {
      return cell.number === 1;
    }
    
    const lastPos = playerPath[playerPath.length - 1];
    if (!isAdjacent(lastPos, { row, col })) return false;
    if (isInPath(row, col)) return false;
    if (cell.number !== null && cell.number !== currentTarget) return false;
    
    return true;
  };

  const customStats = {
    movesUsed,
    wrongMoves,
    optimalMoves: solutionPath.length,
    efficiency: solutionPath.length > 0 ? Math.round((solutionPath.length / Math.max(movesUsed, 1)) * 100) : 100,
  };

  const gap = 6;
  const gridPixelSize = settings.gridSize * (cellSize + gap) - gap;

  // Inline style helpers
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.background,
    },
    instructionsBox: {
      backgroundColor: COLORS.muted,
      borderRadius: '0.5rem',
      padding: '1.5rem',
    },
    instructionCard: {
      backgroundColor: COLORS.card,
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    instructionTitle: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: COLORS.primary,
      marginBottom: '0.5rem',
    },
    instructionText: {
      fontSize: '0.875rem',
      color: COLORS.mutedForeground,
    },
    statCard: (bgColor, borderColor) => ({
      textAlign: 'center',
      background: `linear-gradient(to bottom right, ${bgColor}, transparent)`,
      borderRadius: '0.75rem',
      padding: '0.75rem',
      border: `2px solid ${borderColor}`,
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    }),
    statLabel: {
      fontSize: '0.75rem',
      color: COLORS.mutedForeground,
      fontWeight: 500,
    },
    statValue: (color) => ({
      fontSize: '1.5rem',
      fontWeight: 700,
      color,
    }),
    gameBoard: {
      background: `linear-gradient(160deg, ${COLORS.card} 0%, ${COLORS.muted} 100%)`,
      boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.2), inset 0 2px 0 rgba(255,255,255,0.3)',
      width: gridPixelSize + 40,
      height: gridPixelSize + 40,
      borderRadius: '1.5rem',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      touchAction: 'none',
    },
    cell: (inPath, hasNumber, isLastInPath, isValidMove, isRecent, isCompletePath) => {
      let base = {
        borderRadius: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        position: 'relative',
        overflow: 'hidden',
        width: cellSize,
        height: cellSize,
        fontSize: cellSize > 55 ? '1.4rem' : '1.2rem',
      };

      if (inPath) {
        base.backgroundColor = COLORS.primary;
        base.color = COLORS.primaryForeground;
        base.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2)';
        base.transform = 'scale(1)';
      } else if (hasNumber) {
        base.background = `linear-gradient(to bottom right, ${COLORS.card}, ${COLORS.card}, ${COLORS.muted})`;
        base.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)';
        base.border = `2px solid ${COLORS.primary}40`;
      } else {
        base.backgroundColor = `${COLORS.card}E6`;
        base.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
        base.border = `1px solid ${COLORS.border}80`;
      }

      if (isLastInPath) {
        base.outline = `4px solid ${COLORS.primary}99`;
        base.outlineOffset = '2px';
        base.transform = 'scale(1.1)';
      }

      if (isValidMove && !hasNumber) {
        base.outline = `2px dashed ${COLORS.primary}4D`;
        base.backgroundColor = `${COLORS.primary}0D`;
      }

      if (isRecent) {
        base.transform = 'scale(1.15)';
      }

      return base;
    },
    blockedCell: {
      borderRadius: '0.75rem',
      backgroundColor: `${COLORS.muted}80`,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: cellSize,
      height: cellSize,
    },
    celebrationOverlay: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    },
    celebrationBox: {
      background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.orange}, ${COLORS.yellow})`,
      color: 'white',
      padding: '2rem 3rem',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
    },
    streakBadge: {
      background: `linear-gradient(to right, ${COLORS.yellow}, ${COLORS.orange}, ${COLORS.red})`,
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
    },
  };

  return (
    <div style={styles.container}>
      {/* Inject game-specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: gameStyles }} />
      <GameFramework
        gameTitle="ZIP - Path Puzzle"
        gameShortDescription="Find the hidden path! Connect numbered dots in order without wasting moves."
        gameDescription={
          <div style={{ margin: '0 auto', padding: '0 0.25rem', marginBottom: '0.5rem' }}>
            <div style={styles.instructionsBox}>
              <div
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '1rem', 
                  cursor: 'pointer' 
                }}
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.foreground }}>How to Play ZIP</h3>
                <span style={{ color: COLORS.foreground }}>
                  {showInstructions ? <ChevronUp style={{ height: 20, width: 20 }} /> : <ChevronDown style={{ height: 20, width: 20 }} />}
                </span>
              </div>

              {showInstructions && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem' 
                }}>
                  <div style={styles.instructionCard}>
                    <h4 style={styles.instructionTitle}>🎯 Objective</h4>
                    <p style={styles.instructionText}>
                      Find the hidden solution path! Connect all numbered dots (1→2→3...) with the fewest moves possible.
                    </p>
                  </div>

                  <div style={styles.instructionCard}>
                    <h4 style={styles.instructionTitle}>🧩 The Challenge</h4>
                    <ul style={{ ...styles.instructionText, listStyle: 'none', padding: 0, margin: 0 }}>
                      <li>• There's ONE optimal path</li>
                      <li>• Extra moves hurt your score</li>
                      <li>• Wrong numbered cells = penalty</li>
                      <li>• Blocked cells can't be crossed</li>
                    </ul>
                  </div>

                  <div style={styles.instructionCard}>
                    <h4 style={styles.instructionTitle}>📋 Controls</h4>
                    <ul style={{ ...styles.instructionText, listStyle: 'none', padding: 0, margin: 0 }}>
                      <li>• Drag/swipe to draw path</li>
                      <li>• Tap on path to undo</li>
                      <li>• Start from number 1</li>
                    </ul>
                  </div>

                  <div style={styles.instructionCard}>
                    <h4 style={styles.instructionTitle}>💡 Scoring</h4>
                    <ul style={{ ...styles.instructionText, listStyle: 'none', padding: 0, margin: 0 }}>
                      <li>• Fewer moves = higher score</li>
                      <li>• Speed bonus for fast completion</li>
                      <li>• Wrong moves cost points</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Logic"
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', padding: '0 1rem' }}>
          {/* Streak indicator */}
          {streak >= 2 && (
            <div className="zip-bounce" style={{ marginBottom: '1rem' }}>
              <div style={styles.streakBadge}>
                <Zap className="zip-pulse-fast" style={{ height: 20, width: 20 }} />
                <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                  {streak >= 4 ? '🔥 BLAZING!' : streak >= 3 ? '⚡ GREAT!' : '✨ NICE!'}
                </span>
                <span style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.875rem' 
                }}>{streak}x</span>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '0.75rem', 
            marginBottom: '1.5rem', 
            width: '100%', 
            maxWidth: '36rem',
            transform: pulseEffect ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}>
            <div style={styles.statCard(COLORS.primaryLight, `${COLORS.primary}4D`)}>
              <div style={styles.statLabel}>Next</div>
              <div style={{ ...styles.statValue(COLORS.primary), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                {currentTarget <= maxNumber ? (
                  <>
                    <Star className="zip-pulse" style={{ height: 16, width: 16 }} />
                    {currentTarget}
                  </>
                ) : (
                  <Trophy style={{ height: 24, width: 24, color: COLORS.yellow }} />
                )}
              </div>
            </div>
            <div style={styles.statCard(COLORS.blueLight, `${COLORS.blue}4D`)}>
              <div style={styles.statLabel}>Moves</div>
              <div style={styles.statValue(COLORS.blue)}>
                {movesUsed}
              </div>
            </div>
            <div style={styles.statCard(COLORS.greenLight, `${COLORS.green}4D`)}>
              <div style={styles.statLabel}>Optimal</div>
              <div style={styles.statValue(COLORS.green)}>
                {solutionPath.length}
              </div>
            </div>
            <div style={styles.statCard(
              wrongMoves > 0 ? COLORS.redLight : COLORS.purpleLight, 
              wrongMoves > 0 ? `${COLORS.red}4D` : `${COLORS.purple}4D`
            )}>
              <div style={{ ...styles.statLabel, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                {wrongMoves > 0 && <AlertTriangle style={{ height: 12, width: 12, color: COLORS.red }} />}
                Errors
              </div>
              <div style={styles.statValue(wrongMoves > 0 ? COLORS.red : COLORS.purple)}>
                {wrongMoves}
              </div>
            </div>
          </div>

          {/* Celebration overlay */}
          {showCelebration && (
            <div style={styles.celebrationOverlay}>
              <div className="zip-bounce" style={styles.celebrationBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Sparkles className="zip-spin" style={{ height: 48, width: 48 }} />
                  <Trophy style={{ height: 64, width: 64, color: '#FDE047' }} />
                  <Sparkles className="zip-spin" style={{ height: 48, width: 48 }} />
                </div>
                <span style={{ fontSize: '2.25rem', fontWeight: 700 }}>🎉 PUZZLE SOLVED! 🎉</span>
                <div style={{ fontSize: '1.25rem', opacity: 0.9 }}>
                  {movesUsed === solutionPath.length 
                    ? '⭐ PERFECT PATH!' 
                    : movesUsed <= solutionPath.length * 1.2 
                      ? '🌟 Great efficiency!' 
                      : 'Completed!'
                  }
                </div>
              </div>
            </div>
          )}

          {/* Game Board - Large and Focused */}
          <div style={{ marginBottom: '1.5rem', position: 'relative', touchAction: 'none' }}>
            <div
              ref={gridRef}
              style={styles.gameBoard}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* SVG Layer */}
              <svg
                style={{ position: 'absolute', pointerEvents: 'none', zIndex: 10, top: 20, left: 20 }}
                width={gridPixelSize}
                height={gridPixelSize}
              >
                {getPathLines}
                
                {/* Particles */}
                {particles.map((particle) => (
                  <circle
                    key={particle.id}
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.size}
                    fill={particle.color}
                    style={{
                      animation: 'particleFade 0.8s ease-out forwards',
                    }}
                  />
                ))}
                
                {/* Number hit indicator */}
                {showNumberHit && (
                  <text
                    x={showNumberHit.x}
                    y={showNumberHit.y - 35}
                    textAnchor="middle"
                    fill={COLORS.primary}
                    fontWeight="bold"
                    fontSize="24"
                    style={{ 
                      animation: 'floatUp 0.6s ease-out forwards',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  >
                    +{showNumberHit.num * 15}
                  </text>
                )}
              </svg>

              {/* Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${settings.gridSize}, ${cellSize}px)`,
                  gap: `${gap}px`,
                  position: 'relative',
                  zIndex: 20,
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const inPath = isInPath(rowIndex, colIndex);
                    const pathIdx = getPathIndex(rowIndex, colIndex);
                    const isLastInPath = pathIdx === playerPath.length - 1;
                    const isValidMove = !inPath && isValidNextMove(rowIndex, colIndex);
                    const isRecent = recentlyAdded?.row === rowIndex && recentlyAdded?.col === colIndex;
                    const hasNumber = cell.number !== null;
                    const isCompletePath = isComplete && inPath;
                    
                    if (cell.isBlocked) {
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          style={styles.blockedCell}
                        >
                          <div style={{ 
                            width: 12, 
                            height: 12, 
                            backgroundColor: `${COLORS.mutedForeground}33`, 
                            borderRadius: '50%' 
                          }} />
                        </div>
                      );
                    }
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`${isValidMove && hasNumber ? 'zip-pulse' : ''} ${isCompletePath ? 'zip-pulse' : ''}`}
                        style={styles.cell(inPath, hasNumber, isLastInPath, isValidMove, isRecent, isCompletePath)}
                      >
                        {/* Glow for numbered cells */}
                        {hasNumber && !inPath && (
                          <div 
                            style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '0.75rem',
                              opacity: 0.4,
                              background: cell.isStart 
                                ? `radial-gradient(circle, ${COLORS.green} 0%, transparent 70%)`
                                : cell.isEnd
                                  ? `radial-gradient(circle, ${COLORS.red} 0%, transparent 70%)`
                                  : `radial-gradient(circle, ${COLORS.primary} 0%, transparent 70%)`,
                            }}
                          />
                        )}
                        
                        {/* Number display */}
                        {hasNumber && (
                          <span style={{
                            zIndex: 10,
                            fontWeight: 800,
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                            color: inPath 
                              ? COLORS.primaryForeground 
                              : cell.isStart 
                                ? COLORS.green 
                                : cell.isEnd 
                                  ? COLORS.red 
                                  : COLORS.primary,
                          }}>
                            {cell.number}
                          </span>
                        )}
                        
                        {/* Path order indicator */}
                        {inPath && !hasNumber && (
                          <div style={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: `${COLORS.primaryForeground}66` 
                          }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ textAlign: 'center', maxWidth: '32rem' }}>
            <p style={{ fontSize: '1rem', color: COLORS.mutedForeground, marginBottom: '0.5rem', fontWeight: 500 }}>
              {playerPath.length === 0
                ? '👆 Start from the green number 1!'
                : isComplete
                ? '🎉 Amazing puzzle solving!'
                : `🔗 Find the path to ${currentTarget <= maxNumber ? `number ${currentTarget}` : 'complete!'}`
              }
            </p>
            <div style={{ fontSize: '0.875rem', color: `${COLORS.mutedForeground}B3` }}>
              {difficulty} • {settings.gridSize}×{settings.gridSize} grid • {settings.targetCount} checkpoints
              {movesUsed > solutionPath.length && (
                <span style={{ marginLeft: '0.5rem', color: COLORS.orange }}>
                  ({movesUsed - solutionPath.length} extra moves)
                </span>
              )}
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default ZipGame;
