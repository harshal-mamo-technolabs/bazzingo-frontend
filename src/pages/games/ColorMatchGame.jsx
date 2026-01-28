import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import { Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

// ============= COLORS =============
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
  
  // Tile colors for matching
  tiles: [
    { name: 'Red', hex: '#EF4444', glow: 'rgba(239, 68, 68, 0.5)' },
    { name: 'Orange', hex: '#F97316', glow: 'rgba(249, 115, 22, 0.5)' },
    { name: 'Yellow', hex: '#EAB308', glow: 'rgba(234, 179, 8, 0.5)' },
    { name: 'Green', hex: '#22C55E', glow: 'rgba(34, 197, 94, 0.5)' },
    { name: 'Blue', hex: '#3B82F6', glow: 'rgba(59, 130, 246, 0.5)' },
    { name: 'Purple', hex: '#A855F7', glow: 'rgba(168, 85, 247, 0.5)' },
  ],
};

// ============= CSS KEYFRAMES =============
const gameStyles = `
  @keyframes cardFlip {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(90deg); }
    100% { transform: rotateY(0deg); }
  }
  
  @keyframes matchPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 20px var(--glow-color); }
    50% { transform: scale(1.05); box-shadow: 0 0 40px var(--glow-color); }
  }
  
  @keyframes wrongShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }
  
  @keyframes floatScore {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-50px) scale(1.5); }
  }
  
  @keyframes sparkle {
    0% { opacity: 1; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
    100% { opacity: 0; transform: scale(0) rotate(360deg); }
  }
  
  @keyframes previewPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  @keyframes countdownPop {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .tile-flip {
    animation: cardFlip 0.3s ease-in-out;
  }
  
  .tile-match {
    animation: matchPulse 0.6s ease-in-out;
  }
  
  .tile-wrong {
    animation: wrongShake 0.4s ease-in-out;
  }
  
  .float-score {
    animation: floatScore 0.8s ease-out forwards;
  }
  
  .sparkle {
    animation: sparkle 0.6s ease-out forwards;
  }
  
  .preview-pulse {
    animation: previewPulse 0.5s ease-in-out infinite;
  }
  
  .countdown-pop {
    animation: countdownPop 0.5s ease-out;
  }
`;

// ============= DIFFICULTY SETTINGS =============
// Same 4x4 grid for all levels, difficulty = time limit
const difficultySettings = {
  Easy: { cols: 4, rows: 4, pairs: 8, previewTime: 3000, colors: 4, timeLimit: 120 },
  Moderate: { cols: 4, rows: 4, pairs: 8, previewTime: 2000, colors: 4, timeLimit: 90 },
  Hard: { cols: 4, rows: 4, pairs: 8, previewTime: 1000, colors: 4, timeLimit: 60 },
};

// ============= MAIN COMPONENT =============
const ColorMatchGame = () => {
  // Game state
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [tiles, setTiles] = useState([]);
  const [flippedTiles, setFlippedTiles] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongMatches, setWrongMatches] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(difficultySettings['Easy'].timeLimit);
  const [isPreview, setIsPreview] = useState(false);
  const [previewCountdown, setPreviewCountdown] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [floatingScores, setFloatingScores] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Refs
  const audioContextRef = useRef(null);
  const timerRef = useRef(null);
  const gridRef = useRef(null);

  // Get current settings
  const settings = difficultySettings[difficulty];

  // Keep the timer display in sync with selected difficulty while on the ready screen
  useEffect(() => {
    if (gameState === 'ready') {
      setTimeRemaining(settings.timeLimit);
    }
  }, [gameState, settings.timeLimit]);

  // ============= RESPONSIVE CELL SIZE =============
  // Maximize grid to fill available play area
  const cellSize = useMemo(() => {
    if (typeof window === 'undefined') return 70;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 48; // Total horizontal padding
    const gap = 7;
    
    // Calculate available space
    // Slightly smaller cap to prevent edge clipping on Moderate/Hard layouts
    const availableWidth = Math.min(vw - padding, 380);
    const availableHeight = vh - 380; // Account for header, stats bar, controls
    
    // Calculate cell size to fill available space
    // 20 = grid padding (10px * 2)
    const widthBasedSize = Math.floor((availableWidth - (settings.cols - 1) * gap - 20) / settings.cols);
    const heightBasedSize = Math.floor((availableHeight - (settings.rows - 1) * gap - 20) / settings.rows);
    
    // Use the smaller dimension to ensure grid fits, but maximize it
    const size = Math.min(widthBasedSize, heightBasedSize);
    return Math.max(50, Math.min(80, size));
  }, [settings.cols, settings.rows]);

  // ============= AUDIO SYSTEM =============
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type) => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      switch (type) {
        case 'flip':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;
          
        case 'match':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(523, now);
          oscillator.frequency.setValueAtTime(659, now + 0.1);
          oscillator.frequency.setValueAtTime(784, now + 0.2);
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
          
        case 'wrong':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(200, now);
          oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;
          
        case 'streak':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(600, now);
          oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
          gainNode.gain.setValueAtTime(0.12, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
          
        case 'victory':
          const notes = [523, 659, 784, 1047];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            gain.gain.setValueAtTime(0.15, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.3);
          });
          break;
          
        case 'gameover':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, now);
          oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          oscillator.start(now);
          oscillator.stop(now + 0.5);
          break;
        default:
          break;
      }
    } catch (e) {
    }
  }, [isMuted, getAudioContext]);

  // ============= BOARD GENERATION =============
  const generateBoard = useCallback(() => {
    const { pairs, colors } = settings;
    const colorIndices = [];
    
    // Create pairs of colors
    for (let i = 0; i < pairs; i++) {
      const colorIndex = i % colors;
      colorIndices.push(colorIndex, colorIndex);
    }
    
    // Shuffle using Fisher-Yates
    for (let i = colorIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorIndices[i], colorIndices[j]] = [colorIndices[j], colorIndices[i]];
    }
    
    // Create tiles
    const newTiles = colorIndices.map((colorIndex, id) => ({
      id,
      colorIndex,
      isRevealed: false,
      isMatched: false,
    }));
    
    setTiles(newTiles);
    setFlippedTiles([]);
    setMatchedPairs(0);
    setScore(0);
    setStreak(0);
    setWrongMatches(0);
    setTimeRemaining(settings.timeLimit);
    setFloatingScores([]);
    setSparkles([]);
    setIsChecking(false);
  }, [settings]);

  // ============= START GAME =============
  const handleStart = useCallback(() => {
    generateBoard();
    setIsPreview(true);
    setPreviewCountdown(Math.ceil(settings.previewTime / 1000));
    
    // Show all tiles during preview
    setTiles(prev => prev.map(tile => ({ ...tile, isRevealed: true })));
    
    // Countdown during preview
    let countdown = Math.ceil(settings.previewTime / 1000);
    const countdownInterval = setInterval(() => {
      countdown--;
      setPreviewCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    // Hide tiles after preview
    setTimeout(() => {
      setTiles(prev => prev.map(tile => ({ ...tile, isRevealed: false })));
      setIsPreview(false);
      setGameState('playing');
    }, settings.previewTime);
  }, [generateBoard, settings.previewTime]);

  // ============= TIMER =============
  useEffect(() => {
    if (gameState === 'playing' && !isPreview) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            playSound('gameover');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, isPreview, playSound]);

  // ============= CHECK WIN CONDITION =============
  useEffect(() => {
    if (matchedPairs === settings.pairs && gameState === 'playing') {
      // Calculate final score with time bonus
      const timeBonus = Math.floor(timeRemaining * 0.5);
      setScore(prev => Math.min(200, prev + timeBonus));
      playSound('victory');
      
      setTimeout(() => {
        setGameState('finished');
      }, 500);
    }
  }, [matchedPairs, settings.pairs, gameState, timeRemaining, playSound]);

  // ============= ADD FLOATING SCORE =============
  const addFloatingScore = useCallback((value, tileId) => {
    const tileElement = gridRef.current?.querySelector(`[data-tile-id="${tileId}"]`);
    if (!tileElement) return;
    
    const rect = tileElement.getBoundingClientRect();
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (!gridRect) return;
    
    const x = rect.left - gridRect.left + rect.width / 2;
    const y = rect.top - gridRect.top;
    
    const id = Date.now() + Math.random();
    setFloatingScores(prev => [...prev, { id, value, x, y }]);
    
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 800);
  }, []);

  // ============= ADD SPARKLES =============
  const addSparkles = useCallback((tileId, color) => {
    const tileElement = gridRef.current?.querySelector(`[data-tile-id="${tileId}"]`);
    if (!tileElement) return;
    
    const rect = tileElement.getBoundingClientRect();
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (!gridRect) return;
    
    const centerX = rect.left - gridRect.left + rect.width / 2;
    const centerY = rect.top - gridRect.top + rect.height / 2;
    
    const newSparkles = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 30;
      newSparkles.push({
        id: Date.now() + i + Math.random(),
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        color,
      });
    }
    
    setSparkles(prev => [...prev, ...newSparkles]);
    
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 600);
  }, []);

  // ============= HANDLE TILE CLICK =============
  const handleTileClick = useCallback((tileId) => {
    if (gameState !== 'playing' || isPreview || isChecking) return;
    
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.isMatched || tile.isRevealed) return;
    if (flippedTiles.length >= 2) return;
    
    playSound('flip');
    
    // Reveal the tile
    setTiles(prev => prev.map(t => 
      t.id === tileId ? { ...t, isRevealed: true } : t
    ));
    
    const newFlipped = [...flippedTiles, tileId];
    setFlippedTiles(newFlipped);
    
    // Check for match when 2 tiles are flipped
    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [firstId, secondId] = newFlipped;
      const firstTile = tiles.find(t => t.id === firstId);
      const secondTile = tiles.find(t => t.id === secondId);
      
      if (firstTile && secondTile && firstTile.colorIndex === secondTile.colorIndex) {
        // Match found!
        const newStreak = streak + 1;
        const basePoints = 15;
        const streakBonus = newStreak >= 3 ? Math.floor(basePoints * 0.5 * (newStreak - 2)) : 0;
        const points = basePoints + streakBonus;
        
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            t.id === firstId || t.id === secondId ? { ...t, isMatched: true } : t
          ));
          setMatchedPairs(prev => prev + 1);
          setScore(prev => Math.min(200, prev + points));
          setStreak(newStreak);
          setFlippedTiles([]);
          setIsChecking(false);
          
          playSound(newStreak >= 3 ? 'streak' : 'match');
          addFloatingScore(points, secondId);
          addSparkles(firstId, COLORS.tiles[firstTile.colorIndex].hex);
          addSparkles(secondId, COLORS.tiles[secondTile.colorIndex].hex);
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            t.id === firstId || t.id === secondId ? { ...t, isRevealed: false } : t
          ));
          setScore(prev => Math.max(0, prev - 5));
          setStreak(0);
          setWrongMatches(prev => prev + 1);
          setFlippedTiles([]);
          setIsChecking(false);
          
          playSound('wrong');
        }, 800);
      }
    }
  }, [gameState, isPreview, isChecking, tiles, flippedTiles, streak, playSound, addFloatingScore, addSparkles]);

  // ============= RESET GAME =============
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTiles([]);
    setFlippedTiles([]);
    setMatchedPairs(0);
    setScore(0);
    setStreak(0);
    setWrongMatches(0);
    setTimeRemaining(difficultySettings[difficulty].timeLimit);
    setIsPreview(false);
    setFloatingScores([]);
    setSparkles([]);
    setIsChecking(false);
  }, [difficulty]);

  // ============= STYLES =============
  const gap = 7;
  const gridWidth = settings.cols * cellSize + (settings.cols - 1) * gap + 20;
  const gridHeight = settings.rows * cellSize + (settings.rows - 1) * gap + 20;
  
  
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '8px',
      width: '100%',
      height: '100%',
      minHeight: '400px',
    },
    statsBar: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      width: '100%',
      maxWidth: `${gridWidth}px`,
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
    gridContainer: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      width: '100%',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${settings.cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${settings.rows}, ${cellSize}px)`,
      gap: `${gap}px`,
      padding: '10px',
      backgroundColor: COLORS.gridBg,
      borderRadius: '16px',
      position: 'relative',
      border: `2px solid ${COLORS.cardBorder}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      boxSizing: 'border-box',
    },
    tile: (tile, isFlipping) => ({
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      borderRadius: '10px',
      cursor: tile.isMatched || tile.isRevealed || isPreview ? 'default' : 'pointer',
      border: `2px solid ${tile.isMatched ? COLORS.tiles[tile.colorIndex].hex : '#cbd5e1'}`,
      backgroundColor: tile.isRevealed || tile.isMatched 
        ? COLORS.tiles[tile.colorIndex].hex 
        : COLORS.cardBack,
      boxShadow: tile.isMatched 
        ? `0 0 16px ${COLORS.tiles[tile.colorIndex].glow}`
        : tile.isRevealed 
          ? `0 4px 12px rgba(0,0,0,0.15)`
          : '0 2px 6px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      transform: isFlipping ? 'rotateY(90deg)' : 'rotateY(0deg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    previewBadge: {
      position: 'absolute',
      top: '-50px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: '8px 20px',
      backgroundColor: COLORS.accent,
      borderRadius: '12px',
      zIndex: 10,
      boxShadow: '0 4px 20px rgba(255, 107, 62, 0.4)',
    },
    previewText: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#ffffff',
    },
    countdown: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ffffff',
    },
    floatingScore: {
      position: 'absolute',
      fontSize: '18px',
      fontWeight: 'bold',
      color: COLORS.success,
      pointerEvents: 'none',
      zIndex: 20,
    },
    sparkle: {
      position: 'absolute',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 20,
    },
    streakBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      backgroundColor: COLORS.accent,
      borderRadius: '16px',
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#ffffff',
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
            How to Play Color Rush
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
                Find matching pairs of colored tiles before time runs out!
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎮 How to Play
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• Click tiles to reveal colors</li>
                <li>• Match 2 tiles of the same color</li>
                <li>• Wrong match flips tiles back</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                📊 Scoring
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• +15 points per match</li>
                <li>• Streaks grant bonus points</li>
                <li>• Wrong match deducts 5 points</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                💡 Strategy
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <li>• Use preview to memorize positions</li>
                <li>• Start with corners and edges</li>
                <li>• Maintain streaks with careful picks</li>
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
        gameTitle="Color Rush"
        gameDescription={gameDescription}
        gameShortDescription="Match colorful tile pairs before time runs out! Memorize, match, and build streaks for high scores."
        category="Memory"
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        onReset={handleReset}
        customStats={{
          matchedPairs,
          wrongMatches,
          streak,
        }}
      >
        <div style={styles.container}>
          {/* Stats Bar */}
          <div style={styles.statsBar}>
            <div style={styles.statBadge}>
              🎯 {matchedPairs}/{settings.pairs} pairs
            </div>
            <div style={styles.statBadge}>
              ❌ {wrongMatches} misses
            </div>
            {streak >= 3 && (
              <div style={styles.streakBadge} className="countdown-pop">
                🔥 {streak} streak!
              </div>
            )}
            <button
              style={styles.muteButton}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Game Grid */}
          <div style={styles.gridContainer}>
            <div ref={gridRef} style={styles.grid}>
              {tiles.map((tile) => (
                <div
                  key={tile.id}
                  data-tile-id={tile.id}
                  style={styles.tile(tile, flippedTiles.includes(tile.id) && !tile.isRevealed)}
                  onClick={() => handleTileClick(tile.id)}
                  className={
                    tile.isMatched ? 'tile-match' : 
                    (flippedTiles.includes(tile.id) && !tiles.find(t => t.id === tile.id)?.isRevealed) ? 'tile-wrong' : ''
                  }
                />
              ))}
              
              {/* Preview Badge - No overlay, just a floating badge */}
              {isPreview && (
                <div style={styles.previewBadge} className="countdown-pop">
                  <div style={styles.previewText}>Memorize!</div>
                  <div style={styles.countdown} key={`countdown-${previewCountdown}`}>
                    {previewCountdown}
                  </div>
                </div>
              )}
              
              {/* Floating Scores */}
              {floatingScores.map((fs) => (
                <div
                  key={fs.id}
                  style={{
                    ...styles.floatingScore,
                    left: `${fs.x}px`,
                    top: `${fs.y}px`,
                    transform: 'translateX(-50%)',
                  }}
                  className="float-score"
                >
                  +{fs.value}
                </div>
              ))}
              
              {/* Sparkles */}
              {sparkles.map((sparkle) => (
                <div
                  key={sparkle.id}
                  style={{
                    ...styles.sparkle,
                    left: `${sparkle.x}px`,
                    top: `${sparkle.y}px`,
                    backgroundColor: sparkle.color,
                  }}
                  className="sparkle"
                />
              ))}
            </div>
          </div>
        </div>
      </GameFramework>
    </>
  );
};

export default ColorMatchGame;
