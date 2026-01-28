import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import { Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

// ============== COLORS ==============
const COLORS = {
  background: '#f8fafc',
  cardBack: '#e2e8f0',
  cardBackHover: '#cbd5e1',
  cardBorder: '#94a3b8',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  accent: '#FF6B3E',
  success: '#22c55e',
  warning: '#facc15',
  gridBg: '#f1f5f9',
  card: '#ffffff',
  muted: '#E8EAED',
  mutedForeground: '#6B7280',
  towerPole: '#94a3b8',
  towerBase: '#64748b',
  diskColors: [
    { hex: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)' },
    { hex: '#F97316', glow: 'rgba(249, 115, 22, 0.4)' },
    { hex: '#EAB308', glow: 'rgba(234, 179, 8, 0.4)' },
    { hex: '#22C55E', glow: 'rgba(34, 197, 94, 0.4)' },
    { hex: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' },
    { hex: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)' },
    { hex: '#EC4899', glow: 'rgba(236, 72, 153, 0.4)' },
  ],
};

// ============== CSS KEYFRAMES ==============
const gameStyles = `
  @keyframes diskDrop {
    0% { transform: translateY(-15px); opacity: 0.8; }
    60% { transform: translateY(3px); }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes diskLift {
    0% { transform: scale(1); box-shadow: 0 3px 8px rgba(0,0,0,0.15); }
    100% { transform: scale(1.08) translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.25); }
  }
  
  @keyframes towerPulse {
    0%, 100% { box-shadow: 0 0 0 rgba(255, 107, 62, 0); }
    50% { box-shadow: 0 0 20px rgba(255, 107, 62, 0.5); }
  }
  
  @keyframes victoryBurst {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  @keyframes sparkle {
    0% { opacity: 1; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
    100% { opacity: 0; transform: scale(0) rotate(360deg); }
  }
  
  @keyframes invalidShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  @keyframes floatUp {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-40px); opacity: 0; }
  }
  
  .disk-dragging {
    animation: diskLift 0.15s ease forwards;
    cursor: grabbing !important;
    z-index: 1000 !important;
    pointer-events: none;
  }
  
  .tower-highlight {
    animation: towerPulse 0.8s ease infinite;
  }
  
  .disk-drop {
    animation: diskDrop 0.25s ease-out forwards;
  }
  
  .invalid-move {
    animation: invalidShake 0.3s ease;
  }
  
  .victory-disk {
    animation: victoryBurst 0.5s ease infinite;
  }
  
  .float-score {
    animation: floatUp 0.8s ease-out forwards;
  }
  
  .sparkle {
    animation: sparkle 0.6s ease-out forwards;
  }
`;

// ============== SOUND UTILITY ==============
const createAudioContext = () => {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
};

const playSound = (type, isMuted) => {
  if (isMuted) return;
  const ctx = createAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  switch (type) {
    case 'pickup':
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
      break;
    case 'drop':
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
      break;
    case 'invalid':
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
      break;
    case 'move':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(659, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
      break;
    case 'victory':
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
      break;
  }
};

// ============== DIFFICULTY SETTINGS ==============
const DIFFICULTY_SETTINGS = {
  Easy: { disks: 3, time: 180 },
  Moderate: { disks: 4, time: 180 },
  Hard: { disks: 5, time: 180 },
};

// ============== MAIN COMPONENT ==============
const TowerOfHanoi = () => {
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
  const [showInstructions, setShowInstructions] = useState(true);
  const [dragPosition, setDragPosition] = useState(null);
  
  const containerRef = useRef(null);
  const gameAreaRef = useRef(null);

  const settings = DIFFICULTY_SETTINGS[difficulty];
  const optimalMoves = Math.pow(2, settings.disks) - 1;

  // Inject styles
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = gameStyles;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  // Update time when difficulty changes in ready state
  useEffect(() => {
    if (gameState === 'ready') {
      setTimeRemaining(DIFFICULTY_SETTINGS[difficulty].time);
    }
  }, [difficulty, gameState]);

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
  }, [settings.disks]);

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
      playSound('victory', isMuted);
      
      // Calculate score
      const efficiency = Math.max(0, 1 - (moves - optimalMoves) / optimalMoves);
      const timeBonus = timeRemaining / settings.time;
      const finalScore = Math.round((efficiency * 150) + (timeBonus * 50));
      setScore(Math.min(200, Math.max(0, finalScore)));
      
      setTimeout(() => setGameState('finished'), 1500);
    }
  }, [towers, gameState, settings.disks, moves, optimalMoves, timeRemaining, settings.time, isMuted]);

  // Responsive sizing
  const dimensions = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 600;
    const availableWidth = Math.min(vw - 32, 520);
    const availableHeight = Math.min(vh - 420, 280);
    const towerWidth = Math.floor((availableWidth - 24) / 3);
    const maxDiskWidth = Math.min(towerWidth - 16, 120);
    const diskHeight = Math.min(28, Math.floor((availableHeight - 60) / (settings.disks + 1)));
    return { availableWidth, availableHeight, towerWidth, maxDiskWidth, diskHeight };
  }, [settings.disks]);

  // Get disk width based on size
  const getDiskWidth = useCallback((size) => {
    const minWidth = 35;
    const step = (dimensions.maxDiskWidth - minWidth) / settings.disks;
    return minWidth + (size * step);
  }, [dimensions.maxDiskWidth, settings.disks]);

  // Check if move is valid
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
    const towerX = (towerIndex + 0.5) * dimensions.towerWidth + 12;
    const towerY = dimensions.availableHeight - 40;
    
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      x: towerX + (Math.random() - 0.5) * 40,
      y: towerY + (Math.random() - 0.5) * 20,
      color,
    }));
    
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 600);
  }, [dimensions]);

  // Add floating score
  const addFloatingScore = useCallback((value, towerIndex) => {
    const towerX = (towerIndex + 0.5) * dimensions.towerWidth + 12;
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingScores(prev => [...prev, { id, value, x: towerX, y: 50 }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(f => f.id !== id));
    }, 800);
  }, [dimensions.towerWidth]);

  // Move disk
  const moveDisk = useCallback((fromTower, toTower) => {
    if (!isValidMove(fromTower, toTower)) {
      playSound('invalid', isMuted);
      setInvalidTower(toTower);
      setTimeout(() => setInvalidTower(null), 300);
      return false;
    }

    playSound('move', isMuted);
    const disk = towers[fromTower][towers[fromTower].length - 1];
    
    setTowers(prev => {
      const newTowers = prev.map(t => [...t]);
      const movedDisk = newTowers[fromTower].pop();
      newTowers[toTower].push(movedDisk);
      return newTowers;
    });
    setMoves(m => m + 1);
    
    addSparkles(toTower, COLORS.diskColors[disk.size - 1].hex);
    addFloatingScore('+1', toTower);
    
    return true;
  }, [isValidMove, towers, isMuted, addSparkles, addFloatingScore]);

  // Get tower index from position
  const getTowerFromPosition = useCallback((clientX) => {
    if (!gameAreaRef.current) return null;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const towerIndex = Math.floor(relativeX / (dimensions.towerWidth));
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
    playSound('pickup', isMuted);
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setDragState({ diskId: topDisk.id, fromTower: towerIndex, isDragging: true });
    setDragPosition({ x: clientX, y: clientY });
  }, [gameState, towers, isMuted]);

  const handleDragMove = useCallback((e) => {
    if (!dragState.isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
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

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const toTower = getTowerFromPosition(clientX);
    
    if (toTower !== null && toTower !== dragState.fromTower) {
      if (moveDisk(dragState.fromTower, toTower)) {
        playSound('drop', isMuted);
      }
    }

    setDragState({ diskId: null, fromTower: null, isDragging: false });
    setHighlightedTower(null);
    setDragPosition(null);
  }, [dragState, getTowerFromPosition, moveDisk, isMuted]);

  // Global event listeners for drag
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
    setTimeRemaining(settings.time);
  };

  const handleReset = () => {
    initGame();
    setTimeRemaining(settings.time);
  };

  // Get dragged disk info
  const draggedDisk = useMemo(() => {
    if (!dragState.isDragging || dragState.fromTower === null) return null;
    const tower = towers[dragState.fromTower];
    return tower[tower.length - 1];
  }, [dragState, towers]);

  

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '8px',
      width: '100%',
      height: '100%',
      minHeight: '350px',
    },
    statsBar: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      width: '100%',
      maxWidth: `${dimensions.availableWidth}px`,
    },
    statBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      backgroundColor: COLORS.cardBack,
      borderRadius: '16px',
      fontSize: '14px',
      color: COLORS.textPrimary,
      border: `1px solid ${COLORS.cardBorder}`,
    },
    muteButton: {
      padding: '8px',
      backgroundColor: COLORS.cardBack,
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: '8px',
      cursor: 'pointer',
      color: COLORS.textPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    gameArea: {
      position: 'relative',
      width: dimensions.availableWidth,
      height: dimensions.availableHeight,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      padding: '12px',
      borderRadius: '16px',
      boxSizing: 'border-box',
    },
    tower: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: dimensions.towerWidth - 8,
      height: '100%',
      position: 'relative',
    },
    towerPole: {
      position: 'absolute',
      bottom: '18px',
      width: '10px',
      height: `${dimensions.availableHeight - 50}px`,
      background: `linear-gradient(180deg, ${COLORS.towerPole} 0%, ${COLORS.towerBase} 100%)`,
      borderRadius: '5px 5px 0 0',
      boxShadow: '0 0 8px rgba(0,0,0,0.1)',
    },
    towerBase: {
      position: 'absolute',
      bottom: '8px',
      width: '85%',
      height: '12px',
      background: COLORS.towerBase,
      borderRadius: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    },
    towerLabel: {
      position: 'absolute',
      bottom: '-22px',
      fontSize: '13px',
      color: COLORS.textSecondary,
      fontWeight: 'bold',
    },
    disksContainer: {
      display: 'flex',
      flexDirection: 'column-reverse',
      alignItems: 'center',
      position: 'absolute',
      bottom: '20px',
      gap: '2px',
    },
    disk: {
      borderRadius: '6px',
      cursor: 'grab',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '12px',
      color: '#fff',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
      transition: 'box-shadow 0.15s ease',
      userSelect: 'none',
      touchAction: 'none',
    },
    ghostDisk: {
      position: 'fixed',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '12px',
      color: '#fff',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      pointerEvents: 'none',
      zIndex: 1000,
      transform: 'translate(-50%, -50%)',
    },
    sparkle: {
      position: 'absolute',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 20,
    },
    floatingScore: {
      position: 'absolute',
      fontSize: '16px',
      fontWeight: 'bold',
      color: COLORS.success,
      pointerEvents: 'none',
      zIndex: 20,
      transform: 'translateX(-50%)',
    },
    hint: {
      textAlign: 'center',
      color: COLORS.textSecondary,
      fontSize: '13px',
      maxWidth: '400px',
    },
  };

  // ============= GAME DESCRIPTION =============
  const gameDescription = (
    <div className="mx-auto px-1 mb-2">
      <div className="bg-[#E8E8E8] rounded-lg p-6">
        <div
          className="flex items-center justify-between mb-4 cursor-pointer"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
            How to Play Tower of Hanoi
          </h3>
          <span className="text-blue-900 text-xl">
            {showInstructions
              ? <ChevronUp className="h-5 w-5 text-blue-900" />
              : <ChevronDown className="h-5 w-5 text-blue-900" />}
          </span>
        </div>
        {showInstructions && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 Objective
              </h4>
              <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Move the entire stack of disks from Tower A to Tower C.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎮 How to Play
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• Drag the top disk from one tower to another</li>
                <li>• Only one disk can be moved at a time</li>
                <li>• A larger disk cannot be placed on a smaller disk</li>
                <li>• Goal: rebuild the stack on the rightmost tower</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                📊 Scoring
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• Fewer moves = higher efficiency</li>
                <li>• Optimal moves: 2ⁿ − 1</li>
                <li>• Time bonus applied on completion</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                💡 Strategy
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• Think recursively: move n−1 disks to spare</li>
                <li>• Free the smallest disk to unlock progress</li>
                <li>• Visualize the final stack before each move</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {gameState === 'ready' && <Header unreadCount={3} />}
      <style>{gameStyles}</style>
      <GameFramework
        gameTitle="Tower of Hanoi"
        gameDescription={gameDescription}
        gameShortDescription="Move all disks to the rightmost tower using drag and drop!"
        category="Logic"
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        onReset={handleReset}
        customStats={{ moves, optimalMoves }}
      >
        <div style={styles.container} ref={containerRef}>
          {/* Stats Bar */}
          <div style={styles.statsBar}>
            <div style={styles.statBadge}>
              🎯 Moves: {moves}
            </div>
            <div style={styles.statBadge}>
              ⭐ Optimal: {optimalMoves}
            </div>
            <div style={styles.statBadge}>
              💿 Disks: {settings.disks}
            </div>
            <button
              style={styles.muteButton}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Game Area */}
          <div ref={gameAreaRef} style={styles.gameArea}>
            {towers.map((tower, towerIndex) => (
              <div
                key={towerIndex}
                style={{
                  ...styles.tower,
                  ...(highlightedTower === towerIndex && dragState.fromTower !== towerIndex
                    ? { filter: 'brightness(1.1)' }
                    : {}),
                }}
                className={highlightedTower === towerIndex && dragState.fromTower !== towerIndex ? 'tower-highlight' : ''}
              >
                <div style={styles.towerPole} />
                <div style={styles.towerBase} />
                <div style={styles.towerLabel}>
                  {towerIndex === 0 ? 'A' : towerIndex === 1 ? 'B' : 'C'}
                </div>
                
                <div style={styles.disksContainer}>
                  {tower.map((disk, diskIndex) => {
                    const isTopDisk = diskIndex === tower.length - 1;
                    const isDragging = dragState.diskId === disk.id && dragState.isDragging;
                    const diskWidth = getDiskWidth(disk.size);
                    const diskColor = COLORS.diskColors[disk.size - 1];
                    
                    return (
                      <div
                        key={disk.id}
                        style={{
                          ...styles.disk,
                          width: `${diskWidth}px`,
                          height: `${dimensions.diskHeight}px`,
                          background: `linear-gradient(135deg, ${diskColor.hex} 0%, ${diskColor.hex}dd 100%)`,
                          cursor: isTopDisk && gameState === 'playing' ? 'grab' : 'default',
                          opacity: isDragging ? 0.3 : 1,
                          zIndex: diskIndex,
                          boxShadow: `0 3px 8px rgba(0,0,0,0.15)`,
                        }}
                        className={`
                          ${isVictory ? 'victory-disk' : ''}
                          ${invalidTower === towerIndex ? 'invalid-move' : ''}
                        `}
                        onMouseDown={(e) => isTopDisk && handleDragStart(e, towerIndex)}
                        onTouchStart={(e) => isTopDisk && handleDragStart(e, towerIndex)}
                      >
                        {disk.size}
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
                style={{
                  ...styles.floatingScore,
                  left: `${fs.x}px`,
                  top: `${fs.y}px`,
                }}
                className="float-score"
              >
                {fs.value}
              </div>
            ))}

            {/* Sparkles */}
            {sparkles.map(sparkle => (
              <div
                key={sparkle.id}
                style={{
                  ...styles.sparkle,
                  left: sparkle.x,
                  top: sparkle.y,
                  backgroundColor: sparkle.color,
                }}
                className="sparkle"
              />
            ))}
          </div>

          {/* Hint */}
          <div style={styles.hint}>
            💡 Drag disks from tower to tower. Smaller disks must always be on top!
          </div>
        </div>
      </GameFramework>

      {/* Ghost disk that follows cursor */}
      {dragState.isDragging && draggedDisk && dragPosition && (
        <div
          style={{
            ...styles.ghostDisk,
            left: dragPosition.x,
            top: dragPosition.y,
            width: `${getDiskWidth(draggedDisk.size)}px`,
            height: `${dimensions.diskHeight}px`,
            background: `linear-gradient(135deg, ${COLORS.diskColors[draggedDisk.size - 1].hex} 0%, ${COLORS.diskColors[draggedDisk.size - 1].hex}dd 100%)`,
            boxShadow: `0 12px 24px rgba(0,0,0,0.3), 0 0 16px ${COLORS.diskColors[draggedDisk.size - 1].glow}`,
          }}
          className="disk-dragging"
        >
          {draggedDisk.size}
        </div>
      )}
    </>
  );
};

export default TowerOfHanoi;
