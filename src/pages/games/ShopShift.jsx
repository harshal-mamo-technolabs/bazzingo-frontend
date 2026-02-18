import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Volume2, VolumeX, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

import grandpaCartImage from '/grandma-cart.png';
const PRODUCT_TYPES = [
  { type: 'apple', icon: '🍎', label: 'Apples' },
  { type: 'banana', icon: '🍌', label: 'Bananas' },
  { type: 'orange', icon: '🍊', label: 'Oranges' },
  { type: 'grapes', icon: '🍇', label: 'Grapes' },
  { type: 'carrot', icon: '🥕', label: 'Carrots' },
  { type: 'broccoli', icon: '🥦', label: 'Broccoli' },
  { type: 'tomato', icon: '🍅', label: 'Tomatoes' },
  { type: 'cheese', icon: '🧀', label: 'Cheese' },
  { type: 'bread', icon: '🍞', label: 'Bread' },
  { type: 'milk', icon: '🥛', label: 'Milk' },
];

const ShopShiftGame = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [gameState, setGameState] = useState('menu'); // menu | playing | finished
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [currentRule, setCurrentRule] = useState({ type: 'product', value: 'banana', label: 'Bananas', icon: '🍌' });
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productPosition, setProductPosition] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [decisionMade, setDecisionMade] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [startTime, setStartTime] = useState(null);

  const audioContextRef = useRef(null);
  const productIdRef = useRef(0);
  const animationRef = useRef(null);

  const difficultySettings = useMemo(() => ({
    Easy: { time: 90, ruleChangeInterval: 20000, productSpeed: 5 },
    Moderate: { time: 75, ruleChangeInterval: 15000, productSpeed: 8 },
    Hard: { time: 60, ruleChangeInterval: 10000, productSpeed: 12 },
  }), []);

  const settings = difficultySettings[difficulty];

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

    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } else if (type === 'wrong') {
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === 'ruleChange') {
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  }, [isMuted]);

  const isProductOnSale = useCallback((product, rule) => {
    return product.type === rule.value;
  }, []);

  const spawnNextProduct = useCallback(() => {
    // ~45% chance to spawn a "buy" item (matches current sale), ~55% chance for "skip" items
    const shouldSpawnSaleItem = Math.random() < 0.45;
    
    let selectedType;
    if (shouldSpawnSaleItem) {
      // Spawn the current sale item
      selectedType = PRODUCT_TYPES.find(p => p.type === currentRule.value) || PRODUCT_TYPES[0];
    } else {
      // Spawn a non-sale item
      const nonSaleProducts = PRODUCT_TYPES.filter(p => p.type !== currentRule.value);
      selectedType = nonSaleProducts[Math.floor(Math.random() * nonSaleProducts.length)];
    }
    
    const newProduct = {
      id: productIdRef.current++,
      type: selectedType.type,
      icon: selectedType.icon,
      label: selectedType.label,
    };
    setCurrentProduct(newProduct);
    setProductPosition(100);
    setDecisionMade(false);
  }, [currentRule.value]);

  const handleDecision = useCallback((buyDecision) => {
    if (!currentProduct || gameState !== 'playing' || decisionMade) return;

    setDecisionMade(true);
    const shouldBuy = isProductOnSale(currentProduct, currentRule);
    const isCorrect = buyDecision === shouldBuy;

    if (isCorrect) {
      playSound('correct');
      setScore(s => Math.min(200, s + (buyDecision ? 10 : 5)));
      setCorrectCount(c => c + 1);
      setLastAction('correct');
    } else {
      playSound('wrong');
      setScore(s => Math.max(0, s - (buyDecision ? 5 : 8)));
      setWrongCount(c => c + 1);
      setLastAction('wrong');
    }

    setTimeout(() => setLastAction(null), 300);
    
    // Immediately spawn next product
    setTimeout(() => {
      setCurrentProduct(null);
      setTimeout(spawnNextProduct, 200);
    }, 100);
  }, [currentProduct, gameState, currentRule, isProductOnSale, playSound, decisionMade, spawnNextProduct]);

  // Handle product going off screen without decision
  const handleProductMissed = useCallback(() => {
    if (!currentProduct || decisionMade) return;
    
    playSound('wrong');
    setWrongCount(c => c + 1);
    setLastAction('wrong');
    setTimeout(() => setLastAction(null), 300);
    
    setCurrentProduct(null);
    setTimeout(spawnNextProduct, 200);
  }, [currentProduct, decisionMade, playSound, spawnNextProduct]);

  const changeRule = useCallback(() => {
    const availableProducts = PRODUCT_TYPES.filter(p => p.type !== currentRule.value);
    const newProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const newRule = {
      type: 'product',
      value: newProduct.type,
      label: newProduct.label,
      icon: newProduct.icon,
    };
    setCurrentRule(newRule);
    playSound('ruleChange');
  }, [currentRule, playSound]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || !currentProduct || decisionMade) return;
      if (e.key === 'ArrowLeft') handleDecision(false);
      if (e.key === 'ArrowRight') handleDecision(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentProduct, handleDecision, decisionMade]);

  // Rule change timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const ruleInterval = setInterval(changeRule, settings.ruleChangeInterval);
    return () => clearInterval(ruleInterval);
  }, [gameState, settings.ruleChangeInterval, changeRule]);

  // Timer
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

  // Product animation - moves from right to left
  useEffect(() => {
    if (gameState !== 'playing' || !currentProduct || decisionMade) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let lastTime = performance.now();
    
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 16.67; // normalize to 60fps
      lastTime = currentTime;
      
      setProductPosition(prev => {
        const newPos = prev - (settings.productSpeed * deltaTime * 0.1);
        
        // Product has gone off screen
        if (newPos < -20) {
          handleProductMissed();
          return -20;
        }
        
        return newPos;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, currentProduct, settings.productSpeed, decisionMade, handleProductMissed]);

  // Spawn first product when game starts
  useEffect(() => {
    if (gameState === 'playing' && !currentProduct) {
      const timeout = setTimeout(spawnNextProduct, 500);
      return () => clearTimeout(timeout);
    }
  }, [gameState, currentProduct, spawnNextProduct]);

  // Check if game is in daily suggestions
  useEffect(() => {
    const checkDailyGame = async () => {
      try {
        setCheckingDailyGame(true);
        const result = await getDailySuggestions();
        const games = result?.data?.suggestion?.games || [];
        const pathname = location.pathname || '';
        
        const normalizePath = (p = '') => {
          const base = String(p).split('?')[0].split('#')[0].trim();
          const noTrailing = base.replace(/\/+$/, '');
          return noTrailing || '/';
        };
        
        const matchedGame = games.find(
          (g) => normalizePath(g?.gameId?.url) === normalizePath(pathname)
        );
        
        if (matchedGame && matchedGame.difficulty) {
          const difficulty = matchedGame.difficulty.toLowerCase();
          // Map difficulty: easy -> Easy, moderate -> Moderate, hard -> Hard
          const difficultyMap = { 
            easy: 'Easy', 
            moderate: 'Moderate', 
            hard: 'Hard' 
          };
          const mappedDifficulty = difficultyMap[difficulty];
          
          if (mappedDifficulty) {
            setIsDailyGame(true);
            setDailyGameDifficulty(mappedDifficulty);
          }
        }
      } catch (error) {
        console.error('Error checking daily game:', error);
      } finally {
        setCheckingDailyGame(false);
      }
    };
    
    checkDailyGame();
  }, [location.pathname]);

  const handleStart = useCallback((selectedDifficulty = null) => {
    const diff = selectedDifficulty || difficulty;
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeRemaining(difficultySettings[diff].time);
    const randomProduct = PRODUCT_TYPES[Math.floor(Math.random() * PRODUCT_TYPES.length)];
    setCurrentRule({
      type: 'product',
      value: randomProduct.type,
      label: randomProduct.label,
      icon: randomProduct.icon,
    });
    productIdRef.current = 0;
    setCurrentProduct(null);
    setDecisionMade(false);
    setStartTime(Date.now());
    setGameState('playing');
  }, [difficulty, difficultySettings]);

  const handleReset = useCallback(() => {
    setGameState('menu');
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeRemaining(settings.time);
    setCurrentProduct(null);
    setDecisionMade(false);
    setStartTime(null);
  }, [settings.time]);

  // Handle URL parameter for auto-start (only if not daily game)
  useEffect(() => {
    if (isDailyGame || checkingDailyGame) return;
    
    const levelParam = searchParams.get('level');
    if (levelParam && ['easy', 'moderate', 'hard'].includes(levelParam.toLowerCase())) {
      const difficultyMap = { 
        easy: 'Easy', 
        moderate: 'Moderate', 
        hard: 'Hard' 
      };
      const mappedDifficulty = difficultyMap[levelParam.toLowerCase()];
      if (mappedDifficulty) {
        setDifficulty(mappedDifficulty);
        handleStart(mappedDifficulty);
      }
    }
  }, [searchParams, isDailyGame, checkingDailyGame, handleStart]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracy = correctCount + wrongCount > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
    : 0;

  useEffect(() => {
    if (gameState === 'playing' && score >= 200) {
      setGameState('finished');
    }
  }, [gameState, score]);

  const totalTimeElapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

  // Menu Screen
  if (gameState === 'menu' && !checkingDailyGame) {
    const availableDifficulties = isDailyGame && dailyGameDifficulty
      ? [dailyGameDifficulty]
      : ['Easy', 'Moderate', 'Hard'];

    const difficultyInfo = {
      Easy: { icon: '🛒', color: '#4CAF50', desc: '90 seconds • Slower products' },
      Moderate: { icon: '🏪', color: '#FF9800', desc: '75 seconds • Medium speed' },
      Hard: { icon: '🏬', color: '#F44336', desc: '60 seconds • Fast products' },
    };

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #87CEEB 0%, #B8D4E8 50%, #E8D4B8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto',
      }}>
        {/* How to Play Button */}
        <button
          onClick={() => setShowInstructions(true)}
          style={{
            position: 'absolute',
            top: 'clamp(16px, 3vw, 24px)',
            right: 'clamp(16px, 3vw, 24px)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)',
            color: '#fff',
            fontSize: 'clamp(13px, 2vw, 15px)',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          📖 How to Play
        </button>

        {/* Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'clamp(1rem, 3vw, 2rem)',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #FF6B3E, #E74C3C, #C0392B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
          }}>
            🛒 ShopShift
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            color: '#2C3E50',
            fontWeight: 600,
            opacity: 0.9,
          }}>
            Buy products on sale, skip the rest!
          </p>
        </div>

        {/* Daily Game Badge */}
        {isDailyGame && dailyGameDifficulty && (
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            padding: '8px 20px',
            borderRadius: '20px',
            marginBottom: '20px',
            fontSize: 'clamp(12px, 2vw, 14px)',
            fontWeight: 600,
            color: '#fff',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
          }}>
            🎯 Daily Challenge: {dailyGameDifficulty}
          </div>
        )}

        {/* Difficulty Selection */}
        <div style={{
          display: 'flex',
          gap: 'clamp(1rem, 3vw, 2rem)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '900px',
          marginBottom: '2rem',
        }}>
          {availableDifficulties.map((diff) => {
            const info = difficultyInfo[diff];
            return (
              <button
                key={diff}
                onClick={() => {
                  setDifficulty(diff);
                  handleStart(diff);
                }}
                style={{
                  background: `linear-gradient(135deg, ${info.color}dd, ${info.color}aa)`,
                  border: `3px solid ${info.color}`,
                  borderRadius: '20px',
                  padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(2rem, 4vw, 3rem)',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: 'clamp(180px, 25vw, 240px)',
                  boxShadow: `0 8px 24px ${info.color}44`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${info.color}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${info.color}44`;
                }}
              >
                <div style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', marginBottom: '0.5rem' }}>
                  {info.icon}
                </div>
                <div style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}>
                  {diff}
                </div>
                <div style={{
                  fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                  opacity: 0.9,
                }}>
                  {info.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Instructions Modal */}
        {showInstructions && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }} onClick={() => setShowInstructions(false)}>
            <div style={{
              background: 'linear-gradient(135deg, #87CEEB 0%, #B8D4E8 100%)',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 40px)',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#2C3E50',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              position: 'relative',
            }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowInstructions(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  color: '#2C3E50',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ✕
              </button>

              <h2 style={{
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 'bold',
                marginBottom: '8px',
                textAlign: 'center',
                color: '#2C3E50',
              }}>
                🛒 How to Play ShopShift
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '24px',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#4CAF50',
                  }}>
                    🎯 Objective
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#2C3E50',
                  }}>
                    Score points by correctly buying sale items and skipping non-sale items. Watch for changing rules and make quick decisions!
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#2196F3',
                  }}>
                    🎮 How to Play
                  </h3>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: '#2C3E50',
                    paddingLeft: '20px',
                  }}>
                    <li>Watch the sale sign for current deals</li>
                    <li>Click BUY or SKIP as products pass</li>
                    <li>Use ← → arrow keys for speed</li>
                    <li>Don't let products escape!</li>
                  </ul>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#FF9800',
                  }}>
                    📊 Scoring
                  </h3>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: '#2C3E50',
                    paddingLeft: '20px',
                  }}>
                    <li>+10 points for correct BUY</li>
                    <li>+5 points for correct SKIP</li>
                    <li>Penalties for wrong decisions</li>
                    <li>Maximum score: 200 points</li>
                  </ul>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#9C27B0',
                  }}>
                    💡 Strategy
                  </h3>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: '#2C3E50',
                    paddingLeft: '20px',
                  }}>
                    <li>Stay alert for rule changes</li>
                    <li>Decide quickly before time runs out</li>
                    <li>Higher difficulty = faster products</li>
                    <li>Keep your eyes on the sale sign</li>
                  </ul>
                </div>
              </div>

              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(255, 107, 62, 0.2)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 107, 62, 0.4)',
              }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#2C3E50',
                  textAlign: 'center',
                  fontWeight: 500,
                }}>
                  💡 <strong>Pro Tip:</strong> The sale sign changes periodically! Stay focused and react quickly. Building accuracy streaks helps maximize your score!
                </p>
              </div>

              <button
                onClick={() => setShowInstructions(false)}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                Got it! Let's Shop 🛒
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Loading State
  if (checkingDailyGame && gameState === 'menu') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #87CEEB 0%, #B8D4E8 50%, #E8D4B8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <div style={{ fontSize: '18px', color: '#2C3E50', opacity: 0.8 }}>Loading...</div>
        </div>
      </div>
    );
  }

  const playingContent = (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 107, 62, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 107, 62, 0.6); }
        }
        @keyframes shelf-scroll {
          0% { background-position-x: 0; }
          100% { background-position-x: -200px; }
        }
        @keyframes correct-flash {
          0%, 100% { background-color: rgba(34, 197, 94, 0); }
          50% { background-color: rgba(34, 197, 94, 0.15); }
        }
        @keyframes wrong-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes countdown-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .btn-3d {
          transition: all 0.15s ease;
          transform-style: preserve-3d;
        }
        .btn-3d:hover { transform: translateY(-2px); }
        .btn-3d:active { transform: translateY(2px); }
      `}</style>

      <div 
        className="fixed inset-0 w-full h-full overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #B8D4E8 50%, #E8D4B8 100%)',
          animation: lastAction === 'correct' ? 'correct-flash 0.3s ease' : 'none',
        }}
      >
        <div className="flex items-center justify-between p-2 sm:p-3 bg-black/20 backdrop-blur-sm shrink-0">
          <button
            onClick={() => {
              setGameState('menu');
              setCurrentProduct(null);
              setDecisionMade(false);
            }}
            className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
              timeRemaining <= 10 ? 'bg-red-500/40 text-white' : 'bg-white/20 text-white'
            }`}
              style={{ animation: timeRemaining <= 10 ? 'countdown-pulse 0.5s ease infinite' : 'none' }}
            >
              <Clock size={16} />
              <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/30 text-white">
              <Trophy size={16} />
              <span className="font-bold text-lg">{score}/200</span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/30 text-white text-sm">
                <CheckCircle size={14} />
                <span>{correctCount}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/30 text-white text-sm">
                <XCircle size={14} />
                <span>{wrongCount}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        <div className="flex justify-center py-2 sm:py-3 shrink-0">
          <div 
            className="relative px-4 py-2 rounded-xl text-white font-bold text-base sm:text-lg flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #2E3A6E 0%, #1a2454 100%)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
              animation: 'pulse-glow 2s ease infinite',
            }}
          >
            <span className="text-2xl sm:text-3xl">{currentRule.icon}</span>
            <div className="flex flex-col">
              <span className="text-primary text-xs uppercase tracking-wider">On Sale</span>
              <span>{currentRule.label}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent calc(100% / 5 - 8px),
                  #8B4513 calc(100% / 5 - 8px),
                  #8B4513 calc(100% / 5)
                )
              `,
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute w-full"
                style={{
                  top: `${(i * 20)}%`,
                  height: 'calc(20% - 8px)',
                  backgroundImage: `repeating-linear-gradient(90deg, 
                    transparent 0px, transparent 15px,
                    #E74C3C 15px, #E74C3C 30px, transparent 30px, transparent 35px,
                    #F39C12 35px, #F39C12 50px, transparent 50px, transparent 55px,
                    #9B59B6 55px, #9B59B6 70px, transparent 70px, transparent 75px,
                    #3498DB 75px, #3498DB 90px, transparent 90px, transparent 100px
                  )`,
                  backgroundSize: '200px 60%',
                  backgroundPosition: '0 center',
                  backgroundRepeat: 'repeat-x',
                  animation: 'shelf-scroll 3s linear infinite',
                }}
              />
            ))}
          </div>

          {currentProduct && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 z-20"
              style={{ 
                right: `${100 - productPosition}%`,
                transform: 'translateY(-50%)',
              }}
            >
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-2xl"
                style={{
                  border: '4px solid #4CAF50',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.1)',
                }}
              >
                <span className="text-3xl sm:text-4xl md:text-5xl">{currentProduct.icon}</span>
              </div>
            </div>
          )}

          <div 
            className="absolute bottom-0 left-4 sm:left-8 z-10"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            <img 
              src={grandpaCartImage} 
              alt="Grandpa with Cart" 
              className="h-32 sm:h-40 md:h-52 lg:h-64 object-contain"
            />
          </div>
        </div>

        <div className="flex sm:hidden justify-center gap-6 py-2 bg-black/20 shrink-0">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle size={16} />
            <span className="font-semibold">{correctCount}</span>
          </div>
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <XCircle size={16} />
            <span className="font-semibold">{wrongCount}</span>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-black/30 backdrop-blur-sm justify-center shrink-0">
          <button
            onClick={() => handleDecision(false)}
            disabled={!currentProduct || decisionMade}
            className="btn-3d flex-1 max-w-36 sm:max-w-44 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              boxShadow: (currentProduct && !decisionMade) ? '0 5px 0 #922B21, 0 8px 24px rgba(231,76,60,0.4)' : 'none',
            }}
          >
            ← Skip
          </button>
          <button
            onClick={() => handleDecision(true)}
            disabled={!currentProduct || decisionMade}
            className="btn-3d flex-1 max-w-36 sm:max-w-44 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
              boxShadow: (currentProduct && !decisionMade) ? '0 5px 0 #2E7D32, 0 8px 24px rgba(76,175,80,0.4)' : 'none',
            }}
          >
            Buy →
          </button>
        </div>
      </div>
    </>
  );

  // Game Completion Modal
  const isVictory = score >= 200 || (timeRemaining > 0 && score > 150);

  return (
    <>
      {gameState === 'playing' && playingContent}
      
      {/* Game Completion Modal */}
      <GameCompletionModal
        isVisible={gameState === 'finished'}
        onClose={handleReset}
        gameTitle="ShopShift"
        score={score}
        moves={correctCount + wrongCount}
        timeElapsed={totalTimeElapsed}
        gameTimeLimit={settings.time}
        isVictory={isVictory}
        difficulty={difficulty}
        customMessages={{
          perfectScore: 180,
          goodScore: 120,
          maxScore: 200,
          stats: `✅ Correct: ${correctCount} • ❌ Wrong: ${wrongCount} • 📊 Accuracy: ${accuracy}% • ⏱️ Time: ${formatTime(settings.time - timeRemaining)}`
        }}
      />
    </>
  );



};

export default ShopShiftGame;
