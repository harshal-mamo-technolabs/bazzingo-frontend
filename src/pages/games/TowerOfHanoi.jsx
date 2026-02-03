import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Play, RotateCcw, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

const COLORS = {
  primary: '#FF6B3E',
  skyTop: '#87CEEB',
  skyBottom: '#E0F4FF',
  grass: '#7CB342',
  grassDark: '#558B2F',
  wood: '#8D6E63',
  woodDark: '#5D4037',
  woodLight: '#A1887F',
  stone: '#9E9E9E',
  stoneDark: '#757575',
  text: '#2D3748',
  textLight: '#718096',
  white: '#FFFFFF',
  success: '#48BB78',
  gold: '#F6E05E',
  diskColors: [
    { bg: 'linear-gradient(180deg, #FF6B6B 0%, #C53030 100%)', shine: '#FEB2B2', shadow: '#9B2C2C' },
    { bg: 'linear-gradient(180deg, #F6AD55 0%, #C05621 100%)', shine: '#FBD38D', shadow: '#9C4221' },
    { bg: 'linear-gradient(180deg, #68D391 0%, #276749 100%)', shine: '#9AE6B4', shadow: '#22543D' },
    { bg: 'linear-gradient(180deg, #63B3ED 0%, #2B6CB0 100%)', shine: '#90CDF4', shadow: '#2C5282' },
    { bg: 'linear-gradient(180deg, #B794F4 0%, #6B46C1 100%)', shine: '#D6BCFA', shadow: '#553C9A' },
    { bg: 'linear-gradient(180deg, #FC8181 0%, #C53030 100%)', shine: '#FED7D7', shadow: '#9B2C2C' },
    { bg: 'linear-gradient(180deg, #4FD1C5 0%, #234E52 100%)', shine: '#81E6D9', shadow: '#1D4044' },
  ],
};

const DIFFICULTY_SETTINGS = {
  Easy: { disks: 3, time: 180 },
  Moderate: { disks: 4, time: 180 },
  Hard: { disks: 5, time: 180 },
};

const TowerOfHanoiGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [towers, setTowers] = useState([[], [], []]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [dragState, setDragState] = useState({ diskId: null, fromTower: null, isDragging: false });
  const [highlightedTower, setHighlightedTower] = useState(null);
  const [invalidTower, setInvalidTower] = useState(null);
  const [sparkles, setSparkles] = useState([]);
  const [floatingScores, setFloatingScores] = useState([]);
  const [isVictory, setIsVictory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [dragPosition, setDragPosition] = useState(null);
  const [confetti, setConfetti] = useState([]);

  const gameAreaRef = useRef(null);
  const audioContextRef = useRef(null);

  const settings = DIFFICULTY_SETTINGS[difficulty];
  const optimalMoves = Math.pow(2, settings.disks) - 1;

  // Sound system
  const playSound = useCallback((type) => {
    if (isMuted) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'pickup':
        oscillator.frequency.setValueAtTime(500, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
        break;
      case 'drop':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'invalid':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(120, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'move':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
        break;
      case 'victory':
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.25);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.25);
        });
        break;
      default:
        break;
    }
  }, [isMuted]);

  // Responsive dimensions
  const dimensions = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 600;
    const availableWidth = Math.min(vw - 32, 800);
    const availableHeight = Math.min(vh - 320, 350);
    const towerWidth = Math.floor((availableWidth - 60) / 3);
    const maxDiskWidth = Math.min(towerWidth - 24, 140);
    const diskHeight = Math.min(32, Math.floor((availableHeight - 100) / (settings.disks + 1)));
    const poleHeight = Math.min(availableHeight - 80, diskHeight * (settings.disks + 2));
    return { availableWidth, availableHeight, towerWidth, maxDiskWidth, diskHeight, poleHeight };
  }, [settings.disks]);

  const getDiskWidth = useCallback((size) => {
    const minWidth = 45;
    const step = (dimensions.maxDiskWidth - minWidth) / settings.disks;
    return minWidth + (size * step);
  }, [dimensions.maxDiskWidth, settings.disks]);

  // Initialize game
  const initGame = useCallback(() => {
    const numDisks = settings.disks;
    const initialTower = [];
    for (let i = numDisks; i >= 1; i--) {
      initialTower.push({ id: i, size: i });
    }
    setTowers([initialTower, [], []]);
    setMoves(0);
    setScore(0);
    setIsVictory(false);
    setDragState({ diskId: null, fromTower: null, isDragging: false });
    setDragPosition(null);
    setTimeRemaining(settings.time);
  }, [settings.disks, settings.time]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || timeRemaining <= 0) return;
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
  }, [gameState, timeRemaining]);

  // Check victory
  useEffect(() => {
    if (gameState === 'playing' && towers[2].length === settings.disks) {
      setIsVictory(true);
      playSound('victory');
      
      // Create confetti
      const newConfetti = [];
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          id: `confetti-${i}-${Date.now()}`,
          x: Math.random() * 100,
          delay: Math.random() * 0.8,
          duration: 2 + Math.random() * 2,
          color: ['#FF6B6B', '#F6AD55', '#68D391', '#63B3ED', '#B794F4', '#F6E05E'][Math.floor(Math.random() * 6)],
          size: 6 + Math.random() * 8,
        });
      }
      setConfetti(newConfetti);
      setTimeout(() => setConfetti([]), 4000);
      
      // Calculate score
      const efficiency = Math.max(0, 1 - (moves - optimalMoves) / optimalMoves);
      const timeBonus = timeRemaining / settings.time;
      const finalScore = Math.round((efficiency * 150) + (timeBonus * 50));
      setScore(Math.min(200, Math.max(0, finalScore)));
      
      // Set game to finished after a short delay to show victory animation
      setTimeout(() => setGameState('finished'), 1500);
    }
  }, [towers, gameState, settings.disks, moves, optimalMoves, timeRemaining, settings.time, playSound]);

  // Check valid move
  const isValidMove = useCallback((fromTower, toTower) => {
    if (fromTower === toTower) return false;
    const sourceTower = towers[fromTower];
    const targetTower = towers[toTower];
    if (sourceTower.length === 0) return false;
    const movingDisk = sourceTower[sourceTower.length - 1];
    if (targetTower.length === 0) return true;
    const topDisk = targetTower[targetTower.length - 1];
    return movingDisk.size < topDisk.size;
  }, [towers]);

  // Add sparkles
  const addSparkles = useCallback((towerIndex, color) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const towerCenterX = (towerIndex + 0.5) * dimensions.towerWidth + 30;
    
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      x: towerCenterX + (Math.random() - 0.5) * 50,
      y: dimensions.availableHeight - 80 + (Math.random() - 0.5) * 30,
      color,
    }));
    
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 500);
  }, [dimensions]);

  // Add floating score
  const addFloatingScore = useCallback((value, towerIndex) => {
    const towerX = (towerIndex + 0.5) * dimensions.towerWidth + 30;
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingScores(prev => [...prev, { id, value, x: towerX, y: 60 }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(f => f.id !== id));
    }, 700);
  }, [dimensions.towerWidth]);

  // Move disk
  const moveDisk = useCallback((fromTower, toTower) => {
    if (!isValidMove(fromTower, toTower)) {
      playSound('invalid');
      setInvalidTower(toTower);
      setTimeout(() => setInvalidTower(null), 300);
      return false;
    }

    playSound('move');
    const disk = towers[fromTower][towers[fromTower].length - 1];
    
    setTowers(prev => {
      const newTowers = prev.map(t => [...t]);
      const movedDisk = newTowers[fromTower].pop();
      newTowers[toTower].push(movedDisk);
      return newTowers;
    });
    setMoves(m => m + 1);
    
    addSparkles(toTower, COLORS.diskColors[disk.size - 1].shine);
    addFloatingScore('✓', toTower);
    
    return true;
  }, [isValidMove, towers, playSound, addSparkles, addFloatingScore]);

  // Get tower from position
  const getTowerFromPosition = useCallback((clientX) => {
    if (!gameAreaRef.current) return null;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const towerIndex = Math.floor(relativeX / dimensions.towerWidth);
    if (towerIndex >= 0 && towerIndex < 3) return towerIndex;
    return null;
  }, [dimensions.towerWidth]);

  // Drag handlers
  const handleDragStart = useCallback((e, towerIndex) => {
    if (gameState !== 'playing') return;
    const tower = towers[towerIndex];
    if (tower.length === 0) return;

    e.preventDefault();
    const topDisk = tower[tower.length - 1];
    playSound('pickup');
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragState({ diskId: topDisk.id, fromTower: towerIndex, isDragging: true });
    setDragPosition({ x: clientX, y: clientY });
  }, [gameState, towers, playSound]);

  const handleDragMove = useCallback((e) => {
    if (!dragState.isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragPosition({ x: clientX, y: clientY });
    
    const towerIndex = getTowerFromPosition(clientX);
    if (towerIndex !== null && towerIndex !== dragState.fromTower) {
      setHighlightedTower(towerIndex);
    } else {
      setHighlightedTower(null);
    }
  }, [dragState.isDragging, dragState.fromTower, getTowerFromPosition]);

  const handleDragEnd = useCallback((e) => {
    if (!dragState.isDragging || dragState.fromTower === null) {
      setDragState({ diskId: null, fromTower: null, isDragging: false });
      setDragPosition(null);
      return;
    }

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const toTower = getTowerFromPosition(clientX);
    
    if (toTower !== null && toTower !== dragState.fromTower) {
      if (moveDisk(dragState.fromTower, toTower)) {
        playSound('drop');
      }
    }

    setDragState({ diskId: null, fromTower: null, isDragging: false });
    setHighlightedTower(null);
    setDragPosition(null);
  }, [dragState, getTowerFromPosition, moveDisk, playSound]);

  // Global event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  const handleStart = () => {
    initGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initGame();
    setGameState('ready');
  };

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
          Move all disks from tower A to tower C following the classic rules.
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Drag and drop disks between towers</li>
          <li>• Only move one disk at a time</li>
          <li>• Never place larger disk on smaller</li>
          <li>• Complete in minimum moves for bonus</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Efficiency bonus for optimal moves</li>
          <li>• Time bonus for quick completion</li>
          <li>• Maximum score: 200 points</li>
          <li>• Optimal = 2ⁿ - 1 moves</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Strategy
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Plan moves ahead</li>
          <li>• Use tower B as temporary storage</li>
          <li>• Start with smallest disk</li>
          <li>• Practice with fewer disks first</li>
        </ul>
      </div>
    </div>
  );

  // Get dragged disk
  const draggedDisk = useMemo(() => {
    if (!dragState.isDragging || dragState.fromTower === null) return null;
    const tower = towers[dragState.fromTower];
    return tower[tower.length - 1];
  }, [dragState, towers]);

  const cssAnimation = `
    @keyframes diskBounce {
      0% { transform: translateY(-30px) scaleY(1); opacity: 0; }
      50% { transform: translateY(5px) scaleY(0.95); }
      70% { transform: translateY(-3px) scaleY(1.02); }
      100% { transform: translateY(0) scaleY(1); opacity: 1; }
    }
    @keyframes diskLift {
      0% { transform: scale(1) rotate(0deg); }
      100% { transform: scale(1.15) rotate(-2deg); }
    }
    @keyframes poleGlow {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 107, 62, 0.3)); }
      50% { filter: drop-shadow(0 0 20px rgba(255, 107, 62, 0.7)); }
    }
    @keyframes victoryBounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-8px) scale(1.08); }
    }
    @keyframes sparkleFloat {
      0% { transform: scale(0) rotate(0deg); opacity: 1; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
      100% { transform: scale(0) rotate(360deg) translateY(-20px); opacity: 0; }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      20% { transform: translateX(-6px) rotate(-2deg); }
      40% { transform: translateX(6px) rotate(2deg); }
      60% { transform: translateX(-4px) rotate(-1deg); }
      80% { transform: translateX(4px) rotate(1deg); }
    }
    @keyframes floatUp {
      0% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
      100% { transform: translateX(-50%) translateY(-50px) scale(1.3); opacity: 0; }
    }
    @keyframes confettiFall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    @keyframes cloudFloat {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(20px); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .disk-dragging {
      animation: diskLift 0.12s ease-out forwards;
      cursor: grabbing !important;
      z-index: 1000 !important;
    }
    .tower-highlight {
      animation: poleGlow 0.5s ease-in-out infinite;
    }
    .disk-drop {
      animation: diskBounce 0.35s ease-out forwards;
    }
    .invalid-move {
      animation: shake 0.35s ease;
    }
    .victory-disk {
      animation: victoryBounce 0.5s ease-in-out infinite;
    }
    .float-score {
      animation: floatUp 0.7s ease-out forwards;
    }
    .sparkle {
      animation: sparkleFloat 0.5s ease-out forwards;
    }
    .confetti {
      animation: confettiFall var(--duration) linear forwards;
      animation-delay: var(--delay);
    }
    .cloud {
      animation: cloudFloat 8s ease-in-out infinite;
    }
    .btn-bounce:hover { transform: scale(1.05); }
    .btn-bounce:active { transform: scale(0.98); }
  `;

  // Render wooden pole
  const renderPole = (towerIndex) => {
    const isHighlighted = highlightedTower === towerIndex && dragState.fromTower !== towerIndex;
    return (
      <div
        className={isHighlighted ? 'tower-highlight' : ''}
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '16px',
          height: `${dimensions.poleHeight}px`,
          background: `linear-gradient(90deg, ${COLORS.woodDark} 0%, ${COLORS.wood} 30%, ${COLORS.woodLight} 50%, ${COLORS.wood} 70%, ${COLORS.woodDark} 100%)`,
          borderRadius: '8px 8px 0 0',
          boxShadow: isHighlighted 
            ? `0 0 20px rgba(255, 107, 62, 0.6), inset -2px 0 4px rgba(0,0,0,0.2)` 
            : 'inset -2px 0 4px rgba(0,0,0,0.2)',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* Pole top cap */}
        <div style={{
          position: 'absolute',
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24px',
          height: '12px',
          background: `linear-gradient(180deg, ${COLORS.woodLight} 0%, ${COLORS.wood} 100%)`,
          borderRadius: '12px 12px 4px 4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
    );
  };

  // Render base
  const renderBase = () => (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      height: '14px',
      background: `linear-gradient(180deg, ${COLORS.wood} 0%, ${COLORS.woodDark} 100%)`,
      borderRadius: '4px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.1)',
    }} />
  );

  const playingContent = (
    <>
      <style>{cssAnimation}</style>
      <div 
        className="fixed inset-0 w-full h-full overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${COLORS.skyTop} 0%, ${COLORS.skyBottom} 60%, ${COLORS.grass} 60%, ${COLORS.grassDark} 100%)`,
        }}
      >
        {/* Game Stats Bar */}
        <div style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
        }}>
          {[
            { icon: '⏱️', label: formatTime(timeRemaining), highlight: timeRemaining <= 30 },
            { icon: '🎯', label: `${moves} moves` },
            { icon: '⭐', label: `${optimalMoves} optimal` },
            { icon: '🏆', label: `${score}/200`, primary: true },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: stat.primary 
                  ? `linear-gradient(135deg, ${COLORS.primary} 0%, #E53E3E 100%)`
                  : COLORS.white,
                borderRadius: '20px',
                color: stat.primary ? COLORS.white : stat.highlight ? '#E53E3E' : COLORS.text,
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <span>{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Decorative clouds */}
        <div className="cloud" style={{ position: 'absolute', top: '8%', left: '10%', fontSize: '40px', opacity: 0.8 }}>☁️</div>
        <div className="cloud" style={{ position: 'absolute', top: '5%', right: '15%', fontSize: '50px', opacity: 0.7, animationDelay: '-3s' }}>☁️</div>
        <div className="cloud" style={{ position: 'absolute', top: '15%', left: '60%', fontSize: '35px', opacity: 0.6, animationDelay: '-5s' }}>☁️</div>

        {/* Confetti */}
        {confetti.map(c => (
          <div
            key={c.id}
            className="confetti"
            style={{
              position: 'absolute',
              left: `${c.x}%`,
              top: 0,
              width: `${c.size}px`,
              height: `${c.size}px`,
              backgroundColor: c.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              '--delay': `${c.delay}s`,
              '--duration': `${c.duration}s`,
              zIndex: 100,
            }}
          />
        ))}

        {/* Main Game Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          position: 'relative',
        }}>
          <div
            ref={gameAreaRef}
            style={{
              width: dimensions.availableWidth,
              height: dimensions.availableHeight,
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-end',
              padding: '20px',
              position: 'relative',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              boxSizing: 'border-box',
            }}
          >
            {/* Towers */}
            {towers.map((tower, towerIndex) => (
              <div
                key={towerIndex}
                className={invalidTower === towerIndex ? 'invalid-move' : ''}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  width: dimensions.towerWidth - 16,
                  height: '100%',
                  position: 'relative',
                }}
              >
                {renderPole(towerIndex)}
                {renderBase()}
                
                {/* Tower Label */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  fontSize: '14px',
                  color: COLORS.woodDark,
                  fontWeight: 800,
                  background: 'rgba(255,255,255,0.8)',
                  padding: '2px 10px',
                  borderRadius: '8px',
                }}>
                  {['A', 'B', 'C'][towerIndex]}
                </div>
                
                {/* Disks */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: '34px',
                  gap: '2px',
                }}>
                  {tower.map((disk, diskIndex) => {
                    const isTopDisk = diskIndex === tower.length - 1;
                    const isDragging = dragState.diskId === disk.id && dragState.isDragging;
                    const diskWidth = getDiskWidth(disk.size);
                    const diskStyle = COLORS.diskColors[disk.size - 1];
                    
                    return (
                      <div
                        key={disk.id}
                        className={isVictory ? 'victory-disk' : ''}
                        style={{
                          width: `${diskWidth}px`,
                          height: `${dimensions.diskHeight}px`,
                          background: diskStyle.bg,
                          borderRadius: '10px',
                          cursor: isTopDisk && gameState === 'playing' ? 'grab' : 'default',
                          opacity: isDragging ? 0.4 : 1,
                          zIndex: diskIndex,
                          boxShadow: `
                            0 ${Math.max(3, dimensions.diskHeight / 6)}px 0 ${diskStyle.shadow},
                            0 ${Math.max(6, dimensions.diskHeight / 3)}px 12px rgba(0,0,0,0.2),
                            inset 0 2px 4px rgba(255,255,255,0.4)
                          `,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          userSelect: 'none',
                          touchAction: 'none',
                          transition: 'opacity 0.1s ease',
                        }}
                        onMouseDown={(e) => isTopDisk && handleDragStart(e, towerIndex)}
                        onTouchStart={(e) => isTopDisk && handleDragStart(e, towerIndex)}
                      >
                        {/* Shine effect */}
                        <div style={{
                          position: 'absolute',
                          top: '3px',
                          left: '10%',
                          width: '80%',
                          height: '6px',
                          background: `linear-gradient(90deg, transparent 0%, ${diskStyle.shine}88 50%, transparent 100%)`,
                          borderRadius: '4px',
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Floating Scores */}
            {floatingScores.map((fs) => (
              <div
                key={fs.id}
                className="float-score"
                style={{
                  position: 'absolute',
                  left: `${fs.x}px`,
                  top: `${fs.y}px`,
                  fontSize: '24px',
                  fontWeight: 800,
                  color: COLORS.success,
                  pointerEvents: 'none',
                  zIndex: 30,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {fs.value}
              </div>
            ))}

            {/* Sparkles */}
            {sparkles.map(sparkle => (
              <div
                key={sparkle.id}
                className="sparkle"
                style={{
                  position: 'absolute',
                  left: sparkle.x,
                  top: sparkle.y,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: sparkle.color,
                  boxShadow: `0 0 10px ${sparkle.color}`,
                  pointerEvents: 'none',
                  zIndex: 25,
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer / Instructions */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{
            textAlign: 'center',
            color: COLORS.text,
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Sparkles size={16} color={COLORS.primary} />
            Drag disks between towers • Smaller disks must stay on top!
          </div>
        </div>
      </div>

      {/* Ghost Disk */}
      {dragState.isDragging && draggedDisk && dragPosition && (
        <div
          className="disk-dragging"
          style={{
            position: 'fixed',
            left: dragPosition.x,
            top: dragPosition.y,
            width: `${getDiskWidth(draggedDisk.size)}px`,
            height: `${dimensions.diskHeight}px`,
            background: COLORS.diskColors[draggedDisk.size - 1].bg,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1000,
            transform: 'translate(-50%, -50%)',
            boxShadow: `
              0 15px 35px rgba(0,0,0,0.35),
              0 0 25px ${COLORS.diskColors[draggedDisk.size - 1].shine}88,
              inset 0 2px 4px rgba(255,255,255,0.4)
            `,
          }}
        >
          {/* Shine effect */}
          <div style={{
            position: 'absolute',
            top: '3px',
            left: '10%',
            width: '80%',
            height: '6px',
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.diskColors[draggedDisk.size - 1].shine}88 50%, transparent 100%)`,
            borderRadius: '4px',
          }} />
        </div>
      )}
    </>
  );

  return (
    <GameFrameworkV2
      gameTitle="Tower of Hanoi"
      gameShortDescription="Move all disks from tower A to tower C following the classic rules. Only one disk at a time, and never place a larger disk on a smaller one!"
      category="Puzzle"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{ moves, optimalMoves }}
      enableCompletionModal={true}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
};

export default TowerOfHanoiGame;
