import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, Flag, Bomb, Trophy, Play, RotateCcw, Sparkles, Clock, Target } from 'lucide-react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

const COLORS = {
  primary: '#FF6B3E',
  skyTop: '#667eea',
  skyMid: '#764ba2',
  skyBottom: '#f093fb',
  grassTop: '#84fab0',
  grassBottom: '#8fd3f4',
  cellUnrevealed: 'linear-gradient(145deg, #6366f1, #4f46e5)',
  cellRevealed: 'linear-gradient(145deg, #fef3c7, #fde68a)',
  cellMine: 'linear-gradient(145deg, #ef4444, #dc2626)',
  cellFlagged: 'linear-gradient(145deg, #f59e0b, #d97706)',
  numbers: ['', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#1f2937', '#6b7280'],
};

const CONFETTI_COLORS = ['#FF6B3E', '#FFD700', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];

const Minesweeper = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [grid, setGrid] = useState([]);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [explosions, setExplosions] = useState([]);
  const [floatingScores, setFloatingScores] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [streak, setStreak] = useState(0);

  const audioContextRef = useRef(null);
  const explosionIdRef = useRef(0);
  const floatingIdRef = useRef(0);

  const difficultySettings = useMemo(() => ({
    Easy: { rows: 8, cols: 8, mines: 10, time: 300 },
    Moderate: { rows: 10, cols: 10, mines: 20, time: 240 },
    Hard: { rows: 12, cols: 10, mines: 30, time: 180 },
  }), []);

  const settings = difficultySettings[difficulty];

  const playSound = useCallback((type) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'reveal':
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
      case 'flag':
        oscillator.frequency.setValueAtTime(500, ctx.currentTime);
        oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'explosion':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
      case 'win':
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.25);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.25);
        });
        return;
      case 'click':
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      default:
        break;
    }
  }, []);

  const createEmptyGrid = useCallback(() => {
    return Array(settings.rows).fill(null).map(() =>
      Array(settings.cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    );
  }, [settings.rows, settings.cols]);

  const placeMines = useCallback((grid, excludeRow, excludeCol) => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;

    while (minesPlaced < settings.mines) {
      const row = Math.floor(Math.random() * settings.rows);
      const col = Math.floor(Math.random() * settings.cols);
      const isExcluded = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;

      if (!newGrid[row][col].isMine && !isExcluded) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let r = 0; r < settings.rows; r++) {
      for (let c = 0; c < settings.cols; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < settings.rows && nc >= 0 && nc < settings.cols && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].adjacentMines = count;
        }
      }
    }

    return newGrid;
  }, [settings.mines, settings.rows, settings.cols]);

  const revealCell = useCallback((grid, row, col) => {
    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    let revealed = 0;

    const reveal = (r, c) => {
      if (r < 0 || r >= settings.rows || c < 0 || c >= settings.cols) return;
      if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged) return;

      newGrid[r][c].isRevealed = true;
      revealed++;

      if (newGrid[r][c].adjacentMines === 0 && !newGrid[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }
    };

    reveal(row, col);
    return { newGrid, revealed };
  }, [settings.rows, settings.cols]);

  const addFloatingScore = useCallback((x, y, value) => {
    const id = floatingIdRef.current++;
    setFloatingScores(prev => [...prev, { id, x, y, value }]);
    setTimeout(() => setFloatingScores(prev => prev.filter(s => s.id !== id)), 1000);
  }, []);

  const addExplosion = useCallback((row, col) => {
    const id = explosionIdRef.current++;
    setExplosions(prev => [...prev, { id, row, col }]);
    setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== id)), 600);
  }, []);

  const spawnConfetti = useCallback(() => {
    const newConfetti = [];
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      });
    }
    setConfetti(newConfetti);
  }, []);

  const handleCellClick = useCallback((row, col, e) => {
    if (gameState !== 'playing') return;

    const cell = grid[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    let currentGrid = grid;

    if (firstClick) {
      currentGrid = placeMines(grid, row, col);
      setFirstClick(false);
    }

    if (currentGrid[row][col].isMine) {
      playSound('explosion');
      addExplosion(row, col);
      setStreak(0);

      const newGrid = currentGrid.map(r => r.map(c => ({
        ...c,
        isRevealed: c.isMine ? true : c.isRevealed
      })));
      setGrid(newGrid);
      setGameWon(false);

      setTimeout(() => setGameState('finished'), 600);
    } else {
      playSound('reveal');
      const { newGrid, revealed } = revealCell(currentGrid, row, col);
      setGrid(newGrid);

      const newRevealedCount = revealedCount + revealed;
      setRevealedCount(newRevealedCount);

      const points = revealed * 3 + (streak >= 3 ? 5 : 0);
      setScore(prev => Math.min(200, prev + points));
      setStreak(prev => prev + 1);

      const rect = e.target.getBoundingClientRect();
      addFloatingScore(rect.left + rect.width / 2, rect.top, points);

      const totalSafeCells = settings.rows * settings.cols - settings.mines;
      if (newRevealedCount >= totalSafeCells) {
        playSound('win');
        setGameWon(true);
        setScore(prev => Math.min(200, prev + Math.floor(timeRemaining / 3)));
        spawnConfetti();
        setTimeout(() => setGameState('finished'), 800);
      }
    }
  }, [gameState, grid, firstClick, placeMines, revealCell, revealedCount, settings, playSound, addExplosion, addFloatingScore, streak, timeRemaining, spawnConfetti]);

  const handleCellRightClick = useCallback((e, row, col) => {
    e.preventDefault();
    if (gameState !== 'playing') return;

    const cell = grid[row][col];
    if (cell.isRevealed) return;

    playSound('flag');

    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    newGrid[row][col].isFlagged = !cell.isFlagged;
    setGrid(newGrid);
    setFlagsPlaced(prev => cell.isFlagged ? prev - 1 : prev + 1);
  }, [gameState, grid, playSound]);

  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const handleTouchStart = useCallback((row, col) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (gameState !== 'playing') return;
      const cell = grid[row][col];
      if (cell.isRevealed) return;
      playSound('flag');
      const newGrid = grid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].isFlagged = !cell.isFlagged;
      setGrid(newGrid);
      setFlagsPlaced(prev => cell.isFlagged ? prev - 1 : prev + 1);
    }, 500);
  }, [gameState, grid, playSound]);

  const handleTouchEnd = useCallback((row, col, e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPress.current) {
      handleCellClick(row, col, e);
    }
  }, [handleCellClick]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeRemaining(settings.time);
    setGrid(createEmptyGrid());
    setFlagsPlaced(0);
    setRevealedCount(0);
    setFirstClick(true);
    setGameWon(false);
    setExplosions([]);
    setFloatingScores([]);
    setConfetti([]);
    setStreak(0);
    setGameState('playing');
  }, [settings.time, createEmptyGrid]);

  const cellSize = useMemo(() => {
    const maxWidth = Math.min(window.innerWidth - 32, 450);
    const maxHeight = window.innerHeight * 0.55;
    const sizeFromWidth = Math.floor(maxWidth / settings.cols) - 4;
    const sizeFromHeight = Math.floor(maxHeight / settings.rows) - 4;
    return Math.max(28, Math.min(sizeFromWidth, sizeFromHeight, 42));
  }, [settings.rows, settings.cols]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Reveal all safe cells without hitting mines. Numbers show how many mines are adjacent to that cell.
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tap cells to reveal them</li>
          <li>• Long-press or right-click to flag</li>
          <li>• Numbers show adjacent mine count</li>
          <li>• Reveal all safe cells to win!</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Points for each cell revealed</li>
          <li>• Streak bonus for consecutive reveals</li>
          <li>• Time bonus for quick completion</li>
          <li>• Maximum score: 200 points</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Strategy
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Start with corners and edges</li>
          <li>• Use numbers to deduce mine locations</li>
          <li>• Flag suspected mines immediately</li>
          <li>• Look for patterns and logical deductions</li>
        </ul>
      </div>
    </div>
  );

  const cssAnimation = `
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(5deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes cellReveal {
      0% { transform: scale(0.8) rotateY(90deg); }
      50% { transform: scale(1.1) rotateY(0deg); }
      100% { transform: scale(1) rotateY(0deg); }
    }
    @keyframes cellPop {
      0% { transform: scale(1); }
      50% { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    @keyframes explosion {
      0% { transform: scale(0); opacity: 1; }
      50% { transform: scale(2); opacity: 0.8; }
      100% { transform: scale(3); opacity: 0; }
    }
    @keyframes floatUp {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-60px) scale(1.3); opacity: 0; }
    }
    @keyframes flagWave {
      0%, 100% { transform: rotate(-8deg); }
      50% { transform: rotate(8deg); }
    }
    @keyframes confettiFall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    @keyframes cloudFloat {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(calc(100vw + 100%)); }
    }
    @keyframes streakPulse {
      0%, 100% { transform: scale(1); text-shadow: 0 0 10px rgba(255,107,62,0.5); }
      50% { transform: scale(1.1); text-shadow: 0 0 20px rgba(255,107,62,0.8); }
    }
    @keyframes victoryGlow {
      0%, 100% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); }
      50% { box-shadow: 0 0 60px rgba(34, 197, 94, 0.8); }
    }
    .cell-hover:hover { 
      transform: scale(1.08) translateY(-2px); 
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
    .cell-hover:active { 
      transform: scale(0.95); 
    }
    .btn-3d {
      transition: all 0.15s ease;
    }
    .btn-3d:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    .btn-3d:active {
      transform: translateY(0);
    }
  `;

  const playingContent = (
    <>
      <style>{cssAnimation}</style>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `linear-gradient(180deg, ${COLORS.skyTop} 0%, ${COLORS.skyMid} 40%, ${COLORS.grassTop} 70%, ${COLORS.grassBottom} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Floating clouds */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`cloud-${i}`}
            style={{
              position: 'absolute',
              top: `${5 + i * 8}%`,
              left: 0,
              width: `${80 + i * 20}px`,
              height: `${30 + i * 10}px`,
              background: 'rgba(255,255,255,0.25)',
              borderRadius: '50px',
              filter: 'blur(6px)',
              animation: `cloudFloat ${25 + i * 5}s linear infinite`,
              animationDelay: `${i * 6}s`,
            }}
          />
        ))}

        {/* Game Stats Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 14px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 600,
          }}>
            <Clock size={18} />
            {formatTime(timeRemaining)}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 14px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 600,
          }}>
            <Trophy size={18} />
            {score}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 14px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 600,
          }}>
            <Bomb size={18} />
            {settings.mines - flagsPlaced}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 14px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 600,
          }}>
            <Target size={18} />
            {revealedCount}
          </div>
        </div>

        {/* Streak indicator */}
        {streak >= 3 && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: `linear-gradient(135deg, ${COLORS.primary}, #ffd700)`,
            padding: '8px 20px',
            borderRadius: '20px',
            color: 'white',
            fontWeight: 700,
            fontSize: '14px',
            animation: 'streakPulse 0.5s ease-in-out infinite',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 100,
          }}>
            <Sparkles size={16} />
            {streak} Streak! 🔥
          </div>
        )}

        {/* Game Grid Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${settings.cols}, ${cellSize}px)`,
              gap: '4px',
              padding: '16px',
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 15px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const getCellStyle = () => {
                  const base = {
                    width: cellSize,
                    height: cellSize,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: cellSize * 0.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    userSelect: 'none',
                  };

                  if (cell.isRevealed) {
                    if (cell.isMine) {
                      return {
                        ...base,
                        background: COLORS.cellMine,
                        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4)',
                        animation: 'cellReveal 0.3s ease-out',
                      };
                    }
                    return {
                      ...base,
                      background: COLORS.cellRevealed,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                      color: COLORS.numbers[cell.adjacentMines],
                      animation: 'cellReveal 0.3s ease-out',
                    };
                  }

                  if (cell.isFlagged) {
                    return {
                      ...base,
                      background: COLORS.cellFlagged,
                      boxShadow: '0 4px 12px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
                    };
                  }

                  return {
                    ...base,
                    background: COLORS.cellUnrevealed,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                  };
                };

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={!cell.isRevealed ? 'cell-hover' : ''}
                    style={getCellStyle()}
                    onClick={(e) => !cell.isFlagged && handleCellClick(rowIndex, colIndex, e)}
                    onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                    onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
                    onTouchEnd={(e) => handleTouchEnd(rowIndex, colIndex, e)}
                  >
                    {cell.isRevealed && cell.isMine && <Bomb size={cellSize * 0.5} color="white" />}
                    {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && cell.adjacentMines}
                    {!cell.isRevealed && cell.isFlagged && (
                      <div style={{ animation: 'flagWave 0.6s ease-in-out infinite' }}>
                        <Flag size={cellSize * 0.45} color="white" fill="white" />
                      </div>
                    )}

                    {/* Shine overlay */}
                    {!cell.isRevealed && !cell.isFlagged && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
                        pointerEvents: 'none',
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Explosions */}
        {explosions.map(exp => (
          <div
            key={exp.id}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ff6b3e, #ef4444, transparent)',
              animation: 'explosion 0.6s ease-out forwards',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          />
        ))}

        {/* Floating Scores */}
        {floatingScores.map(s => (
          <div
            key={s.id}
            style={{
              position: 'fixed',
              left: s.x,
              top: s.y,
              color: '#ffd700',
              fontWeight: 800,
              fontSize: '24px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              animation: 'floatUp 1s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            +{s.value}
          </div>
        ))}

        {/* Footer instruction */}
        <div style={{
          padding: '12px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '13px',
        }}>
          Tap to reveal • Long-press to flag 🚩
        </div>
      </div>
    </>
  );

  return (
    <GameFrameworkV2
      gameTitle="Minesweeper"
      gameShortDescription="Reveal all safe cells without hitting mines. Numbers show how many mines are adjacent to each cell. Test your logic and deduction skills!"
      category="Puzzle"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={startGame}
      onReset={() => {
        setScore(0);
        setTimeRemaining(settings.time);
        setGrid(createEmptyGrid());
        setFlagsPlaced(0);
        setRevealedCount(0);
        setFirstClick(true);
        setGameWon(false);
        setExplosions([]);
        setFloatingScores([]);
        setConfetti([]);
        setStreak(0);
        setGameState('ready');
      }}
      customStats={{ flagsPlaced, revealedCount, streak }}
      enableCompletionModal={true}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
};

export default Minesweeper;
