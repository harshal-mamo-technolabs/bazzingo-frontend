import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight, Play, RotateCcw, Trophy, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

// ============================================================================
// COLORS & THEME
// ============================================================================
const THEME = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  cardShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
  accent: '#FF6B3E',
  success: '#22C55E',
  error: '#EF4444',
  glass: 'rgba(255, 255, 255, 0.1)',
};

const COLOR_PALETTE = [
  { name: 'RED', color: '#EF4444' },
  { name: 'BLUE', color: '#3B82F6' },
  { name: 'GREEN', color: '#22C55E' },
  { name: 'YELLOW', color: '#EAB308' },
  { name: 'PURPLE', color: '#A855F7' },
  { name: 'ORANGE', color: '#F97316' },
  { name: 'PINK', color: '#EC4899' },
  { name: 'CYAN', color: '#06B6D4' },
];

// ============================================================================
// CSS KEYFRAMES
// ============================================================================
const gameStyles = `
  @keyframes cardPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  @keyframes cardShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-10px); }
    80% { transform: translateX(10px); }
  }
  
  @keyframes cardSuccess {
    0% { transform: scale(1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); }
    50% { transform: scale(1.05); box-shadow: 0 25px 80px rgba(34, 197, 94, 0.5); }
    100% { transform: scale(1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); }
  }
  
  @keyframes floatScore {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
  }
  
  @keyframes slideIn {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes buttonPress {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(0.95); }
  }
  
  @keyframes streakPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.9; }
  }
  
  @keyframes confettiFall {
    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 62, 0.3); }
    50% { box-shadow: 0 0 40px rgba(255, 107, 62, 0.6); }
  }
  
  @keyframes floatBubble {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.1); }
  }
  
  @keyframes vsShine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

// ============================================================================
// SOUND UTILITY
// ============================================================================
const createSoundPlayer = () => {
  let audioContext = null;

  const getContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  };

  return {
    play: (type) => {
      try {
        const ctx = getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
          case 'correct':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, now);
            oscillator.frequency.setValueAtTime(659.25, now + 0.1);
            oscillator.frequency.setValueAtTime(783.99, now + 0.2);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
          case 'wrong':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.setValueAtTime(150, now + 0.15);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.setValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
          case 'click':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.setValueAtTime(0.01, now + 0.05);
            oscillator.start(now);
            oscillator.stop(now + 0.05);
            break;
          case 'streak':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, now);
            oscillator.frequency.setValueAtTime(554.37, now + 0.1);
            oscillator.frequency.setValueAtTime(659.25, now + 0.2);
            oscillator.frequency.setValueAtTime(880, now + 0.3);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.setValueAtTime(0.01, now + 0.4);
            oscillator.start(now);
            oscillator.stop(now + 0.4);
            break;
          case 'win':
            oscillator.type = 'sine';
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
              oscillator.frequency.setValueAtTime(freq, now + i * 0.15);
            });
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.setValueAtTime(0.01, now + 0.6);
            oscillator.start(now);
            oscillator.stop(now + 0.6);
            break;
          case 'lose':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.setValueAtTime(200, now + 0.2);
            oscillator.frequency.setValueAtTime(100, now + 0.4);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.setValueAtTime(0.01, now + 0.5);
            oscillator.start(now);
            oscillator.stop(now + 0.5);
            break;
          default:
            break;
        }
      } catch (e) {
        console.log('Sound not available');
      }
    }
  };
};

// ============================================================================
// DIFFICULTY SETTINGS
// ============================================================================
const DIFFICULTY_SETTINGS = {
  Easy: { time: 60, matchChance: 0.5, rounds: 15 },
  Moderate: { time: 45, matchChance: 0.45, rounds: 20 },
  Hard: { time: 30, matchChance: 0.4, rounds: 25 },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const ColorWordMatch = () => {
  const soundPlayer = useRef(createSoundPlayer());
  
  // Game state
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Current challenge
  const [leftColorName, setLeftColorName] = useState('');
  const [leftTextColor, setLeftTextColor] = useState('');
  const [rightTextColor, setRightTextColor] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  
  // Animation states
  const [cardAnimation, setCardAnimation] = useState('');
  const [floatingScores, setFloatingScores] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [buttonPressed, setButtonPressed] = useState(null);

  const settings = DIFFICULTY_SETTINGS[difficulty];

  // Play sound helper
  const playSound = useCallback((type) => {
    if (!isMuted) {
      soundPlayer.current.play(type);
    }
  }, [isMuted]);

  // Generate new challenge
  const generateChallenge = useCallback(() => {
    // Pick the color name that will appear on BOTH cards
    const targetColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    setLeftColorName(targetColor.name);
    
    // Left card: show color name in a RANDOM misleading ink color (to trick the user!)
    const leftInk = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    setLeftTextColor(leftInk.color);
    
    const shouldMatch = Math.random() < settings.matchChance;
    
    if (shouldMatch) {
      // Right card ink color MATCHES the color name
      setRightTextColor(targetColor.color);
      setIsMatch(true);
    } else {
      // Right card ink color does NOT match the color name
      let differentColor;
      do {
        differentColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
      } while (differentColor.name === targetColor.name);
      
      setRightTextColor(differentColor.color);
      setIsMatch(false);
    }
  }, [settings.matchChance]);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeRemaining(settings.time);
    setRound(1);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    setWrong(0);
    generateChallenge();
    playSound('click');
  }, [settings.time, generateChallenge, playSound]);

  // Handle answer
  const handleAnswer = useCallback((answer) => {
    if (gameState !== 'playing') return;
    
    const isCorrectAnswer = (answer === 'match' && isMatch) || (answer === 'no-match' && !isMatch);
    
    if (isCorrectAnswer) {
      playSound('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      
      // Score calculation
      const basePoints = 10;
      const streakBonus = Math.min(newStreak - 1, 5) * 2;
      const points = basePoints + streakBonus;
      setScore(prev => Math.min(200, prev + points));
      setCorrect(prev => prev + 1);
      
      setCardAnimation('cardSuccess');
      
      // Floating score
      setFloatingScores(prev => [...prev, {
        id: Date.now(),
        value: points,
        x: 50,
        y: 40
      }]);
      
      if (newStreak >= 3 && newStreak % 3 === 0) {
        playSound('streak');
      }
    } else {
      playSound('wrong');
      setStreak(0);
      setScore(prev => Math.max(0, prev - 5));
      setWrong(prev => prev + 1);
      setCardAnimation('cardShake');
      
      setFloatingScores(prev => [...prev, {
        id: Date.now(),
        value: -5,
        x: 50,
        y: 40
      }]);
    }
    
    setButtonPressed(answer === 'match' ? 'right' : 'left');
    setTimeout(() => setButtonPressed(null), 150);
    
    // Next round
    setTimeout(() => {
      setCardAnimation('');
      setRound(prev => prev + 1);
      generateChallenge();
    }, 400);
  }, [gameState, isMatch, streak, bestStreak, playSound, generateChallenge]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowLeft') {
        handleAnswer('no-match');
      } else if (e.key === 'ArrowRight') {
        handleAnswer('match');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleAnswer]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('finished');
          playSound('lose');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, playSound]);

  // Score-based completion
  useEffect(() => {
    if (gameState === 'playing' && score >= 200) {
      setGameState('finished');
      playSound('win');
    }
  }, [gameState, score, playSound]);

  // Victory confetti
  useEffect(() => {
    if (gameState === 'finished' && (score >= 100 || score >= 200)) {
      playSound('win');
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: COLOR_PALETTE[i % COLOR_PALETTE.length].color,
        left: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setConfetti(newConfetti);
    }
  }, [gameState, score, playSound]);

  // Clean up floating scores
  useEffect(() => {
    if (floatingScores.length > 0) {
      const timer = setTimeout(() => {
        setFloatingScores(prev => prev.slice(1));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [floatingScores]);

  // Reset game
  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setTimeRemaining(settings.time);
    setRound(0);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    setWrong(0);
    setConfetti([]);
    playSound('click');
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
          Determine if the ink color on the right matches the color name shown on the left card.
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Left card shows a color NAME</li>
          <li>• Right card shows text in colored INK</li>
          <li>• Decide if ink color matches the name</li>
          <li>• Use arrow keys or tap buttons</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• +10 points for correct answers</li>
          <li>• Streak bonus for consecutive wins</li>
          <li>• -5 points for wrong answers</li>
          <li>• Maximum score: 200 points</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Strategy
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Focus on the ink color, not the word</li>
          <li>• Ignore the misleading text color</li>
          <li>• Build streaks for bonus points</li>
          <li>• Stay calm under time pressure</li>
        </ul>
      </div>
    </div>
  );

  const playingContent = (
    <>
      <style>{gameStyles}</style>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: THEME.background,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        overflow: 'hidden',
      }}>
        {/* Confetti */}
        {confetti.map(c => (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: `${c.left}%`,
              top: 0,
              width: '10px',
              height: '10px',
              background: c.color,
              borderRadius: '2px',
              animation: `confettiFall 3s linear ${c.delay}s forwards`,
              zIndex: 100,
            }}
          />
        ))}
        
        {/* Floating Scores */}
        {floatingScores.map(fs => (
          <div
            key={fs.id}
            style={{
              position: 'absolute',
              left: `${fs.x}%`,
              top: `${fs.y}%`,
              transform: 'translateX(-50%)',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: fs.value > 0 ? THEME.success : THEME.error,
              animation: 'floatScore 0.8s ease-out forwards',
              zIndex: 50,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {fs.value > 0 ? '+' : ''}{fs.value}
          </div>
        ))}

        {/* Game Stats Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{
            background: THEME.glass,
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            color: 'white',
            textAlign: 'center',
            minWidth: '80px',
          }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Score</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: THEME.accent }}>{score}/200</div>
          </div>
          <div style={{
            background: THEME.glass,
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            color: 'white',
            textAlign: 'center',
            minWidth: '80px',
          }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Time</div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              color: timeRemaining <= 10 ? THEME.error : 'white',
            }}>{formatTime(timeRemaining)}</div>
          </div>
          <div style={{
            background: THEME.glass,
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            color: 'white',
            textAlign: 'center',
            minWidth: '80px',
          }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Round</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{round}</div>
          </div>
          {streak >= 3 && (
            <div style={{
              background: `linear-gradient(135deg, ${THEME.accent}, #ff8c5a)`,
              borderRadius: '12px',
              padding: '0.5rem 1rem',
              color: 'white',
              textAlign: 'center',
              animation: 'streakPulse 0.5s infinite',
            }}>
              <div style={{ fontSize: '0.75rem' }}>🔥 STREAK</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{streak}x</div>
            </div>
          )}
        </div>

        {/* Cards Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(1rem, 4vw, 3rem)',
          padding: '1rem',
        }}>
          {/* Left Card - Color Name */}
          <div style={{
            background: THEME.cardBg,
            borderRadius: '24px',
            padding: 'clamp(1.5rem, 4vw, 3rem)',
            boxShadow: THEME.cardShadow,
            minWidth: 'clamp(120px, 30vw, 200px)',
            minHeight: 'clamp(150px, 25vh, 250px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: cardAnimation ? cardAnimation + ' 0.4s ease-out' : 'cardPulse 3s infinite',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              Color Name
            </div>
            <div style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontWeight: 'bold',
              color: leftTextColor,
              textShadow: `0 2px 10px ${leftTextColor}40`,
            }}>
              {leftColorName}
            </div>
          </div>

          {/* VS Badge */}
          <div style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            backgroundSize: '200% 100%',
            animation: 'vsShine 2s linear infinite',
            padding: '0.5rem 1rem',
            borderRadius: '50%',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}>
            VS
          </div>

          {/* Right Card - Colored Text */}
          <div style={{
            background: THEME.cardBg,
            borderRadius: '24px',
            padding: 'clamp(1.5rem, 4vw, 3rem)',
            boxShadow: THEME.cardShadow,
            minWidth: 'clamp(120px, 30vw, 200px)',
            minHeight: 'clamp(150px, 25vh, 250px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: cardAnimation ? cardAnimation + ' 0.4s ease-out' : 'cardPulse 3s infinite',
            animationDelay: '0.1s',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              Ink Color
            </div>
            <div style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontWeight: 'bold',
              color: rightTextColor,
              textShadow: `0 2px 10px ${rightTextColor}40`,
            }}>
              {leftColorName}
            </div>
          </div>
        </div>

        {/* Question */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          fontSize: 'clamp(1rem, 3vw, 1.3rem)',
          marginBottom: '1rem',
        }}>
          Does the <strong>ink color</strong> match "<strong>{leftColorName}</strong>"?
        </div>

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          padding: '1rem',
          paddingBottom: '2rem',
        }}>
          <button
            onClick={() => handleAnswer('no-match')}
            style={{
              background: buttonPressed === 'left' 
                ? THEME.error 
                : `linear-gradient(135deg, ${THEME.error}, #f87171)`,
              border: 'none',
              borderRadius: '20px',
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(2rem, 6vw, 4rem)',
              color: 'white',
              fontSize: 'clamp(1rem, 3vw, 1.3rem)',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: `0 10px 30px ${THEME.error}60`,
              transform: buttonPressed === 'left' ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.1s',
            }}
          >
            <ArrowLeft size={24} />
            NO
          </button>
          
          <button
            onClick={() => handleAnswer('match')}
            style={{
              background: buttonPressed === 'right' 
                ? THEME.success 
                : `linear-gradient(135deg, ${THEME.success}, #4ade80)`,
              border: 'none',
              borderRadius: '20px',
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(2rem, 6vw, 4rem)',
              color: 'white',
              fontSize: 'clamp(1rem, 3vw, 1.3rem)',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: `0 10px 30px ${THEME.success}60`,
              transform: buttonPressed === 'right' ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.1s',
            }}
          >
            YES
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Keyboard hint */}
        <div style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.8rem',
          paddingBottom: '1rem',
        }}>
          Use ← → arrow keys or tap buttons
        </div>
      </div>
    </>
  );

  return (
    <GameFrameworkV2
      gameTitle="Color Word Match"
      gameShortDescription="Test your cognitive flexibility! Does the ink color match the color name? Don't let the misleading text color fool you!"
      category="Cognitive"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={startGame}
      onReset={resetGame}
      customStats={{ round, streak, bestStreak, correct, wrong }}
      enableCompletionModal={true}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
};

export default ColorWordMatch;
