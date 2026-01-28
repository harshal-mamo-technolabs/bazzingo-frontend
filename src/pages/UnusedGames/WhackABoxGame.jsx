import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const WhackABoxGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [grid, setGrid] = useState(Array(9).fill(null));
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseHits, setFalseHits] = useState(0);
  const [lightsTotal, setLightsTotal] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [sparkles, setSparkles] = useState([]);

  // Difficulty settings
  const difficultySettings = {
    Easy: { lightDuration: 1500, spawnInterval: 800, decoyProbability: 0, timeLimit: 60 },
    Moderate: { lightDuration: 1200, spawnInterval: 600, decoyProbability: 0.1, timeLimit: 50 },
    Hard: { lightDuration: 1000, spawnInterval: 400, decoyProbability: 0.2, timeLimit: 40 }
  };

  // Create sparkle effect
  const createSparkle = useCallback((x, y) => {
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5
    }));

    setSparkles(prev => [...prev, ...newSparkles]);

    // Remove sparkles after animation
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1000);
  }, []);

  // Light a random box
  const lightBox = useCallback(() => {
    if (gameState !== 'playing') return;

    const settings = difficultySettings[difficulty];
    const emptyPositions = grid.map((cell, index) => cell === null ? index : null).filter(pos => pos !== null);

    if (emptyPositions.length === 0) return;

    const randomPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    const isDecoy = Math.random() < settings.decoyProbability;
    const lightType = isDecoy ? 'decoy' : 'target';
    const startTime = Date.now();

    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[randomPosition] = { type: lightType, startTime };
      return newGrid;
    });

    setLightsTotal(prev => prev + 1);

    // Auto-remove light after duration
    setTimeout(() => {
      setGrid(prev => {
        const newGrid = [...prev];
        if (newGrid[randomPosition] && newGrid[randomPosition].startTime === startTime) {
          // Light expired without being clicked
          if (newGrid[randomPosition].type === 'target') {
            setMisses(prevMisses => prevMisses + 1);
            setCombo(0); // Break combo on miss
          }
          newGrid[randomPosition] = null;
        }
        return newGrid;
      });
    }, settings.lightDuration);
  }, [gameState, difficulty, grid]);

  // Handle box click
  const handleBoxClick = (position, event) => {
    if (gameState !== 'playing') return;

    const box = grid[position];

    if (box) {
      const reactionTime = Date.now() - box.startTime;
      setReactionTimes(prev => [...prev, reactionTime]);

      // Get click position for sparkle effect
      const rect = event.target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      if (box.type === 'target') {
        setHits(prev => prev + 1);
        setCombo(prev => {
          const newCombo = prev + 1;
          setMaxCombo(current => Math.max(current, newCombo));
          return newCombo;
        });
        createSparkle(x, y);
      } else if (box.type === 'decoy') {
        setFalseHits(prev => prev + 1);
        setCombo(0); // Break combo on false hit
      }

      // Remove the light
      setGrid(prev => {
        const newGrid = [...prev];
        newGrid[position] = null;
        return newGrid;
      });
    }
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    setGrid(Array(9).fill(null));
    setHits(0);
    setMisses(0);
    setFalseHits(0);
    setLightsTotal(0);
    setReactionTimes([]);
    setCombo(0);
    setMaxCombo(0);
    setSparkles([]);
    setScore(0);
    setTimeRemaining(difficultySettings[difficulty].timeLimit);
  }, [difficulty]);

  // Start lighting sequence
  const startLightingSequence = useCallback(() => {
    const settings = difficultySettings[difficulty];

    const interval = setInterval(() => {
      if (gameState === 'playing') {
        lightBox();
      } else {
        clearInterval(interval);
      }
    }, settings.spawnInterval);

    return interval;
  }, [gameState, difficulty, lightBox]);

  // Calculate score using reflex formula
  useEffect(() => {
  if (hits === 0) {
    setScore(0);
    return;
  }

  const avgReactionTime = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    : 500;

  let reactionFactor;
  if (avgReactionTime <= 200) reactionFactor = 5;
  else if (avgReactionTime <= 300) reactionFactor = 4;
  else if (avgReactionTime <= 400) reactionFactor = 3;
  else if (avgReactionTime <= 500) reactionFactor = 2;
  else reactionFactor = 1;

  const comboBonus = maxCombo * 2;
  const totalMisses = misses + falseHits;

  const scoreWithoutPenalties = (reactionFactor * hits) + comboBonus;

  const penalty = totalMisses * 3;
  const rawScore = scoreWithoutPenalties - penalty;

  const newScore = Math.max(0, rawScore);

  setScore(Math.min(200, newScore));
}, [hits, misses, falseHits, reactionTimes, maxCombo]);


  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Start game sequence
  useEffect(() => {
    let lightingInterval;
    if (gameState === 'playing') {
      lightingInterval = startLightingSequence();
    }
    return () => {
      if (lightingInterval) clearInterval(lightingInterval);
    };
  }, [gameState, startLightingSequence]);

  const handleStart = () => {
    initializeGame();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const customStats = {
    lightsTotal,
    hits,
    misses,
    falseHits,
    maxCombo
  };

  const getBoxClass = (position) => {
    const box = grid[position];
    let baseClass = 'relative aspect-square border-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center text-4xl font-bold overflow-hidden transform-gpu';

    if (box) {
      if (box.type === 'target') {
        baseClass += ' bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 border-green-300 text-white animate-pulse shadow-2xl shadow-green-500/50 scale-110 ring-4 ring-green-300 ring-opacity-75';
      } else if (box.type === 'decoy') {
        baseClass += ' bg-gradient-to-br from-red-400 via-rose-500 to-red-600 border-red-300 text-white animate-pulse shadow-2xl shadow-red-500/50 scale-110 ring-4 ring-red-300 ring-opacity-75';
      }
    } else {
      baseClass += ' bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 border-slate-300 hover:border-slate-400 hover:shadow-lg hover:scale-105 shadow-md';
    }

    return baseClass;
  };

  const getComboClass = () => {
    if (combo === 0) return 'opacity-0 scale-75';
    if (combo >= 10) return 'text-purple-600 animate-bounce scale-125';
    if (combo >= 5) return 'text-blue-600 animate-pulse scale-110';
    return 'text-green-600 scale-100';
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Whack-a-Box"
        gameDescription="Hit the glowing green boxes as fast as you can! Avoid the red decoys!"
        category="Reflexes"
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
        {/* Sparkle Effects */}
        <div className="fixed inset-0 pointer-events-none z-50">
          {sparkles.map((sparkle) => (
            <div
              key={sparkle.id}
              className="absolute text-yellow-400 animate-ping"
              style={{
                left: sparkle.x,
                top: sparkle.y,
                transform: `rotate(${sparkle.rotation}deg) scale(${sparkle.scale})`,
                fontSize: '24px'
              }}
            >
              ✨
            </div>
          ))}
        </div>

        {/* Game Content */}
        <div className="flex flex-col items-center">
          {/* Enhanced Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
            <div className="text-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-2xl p-4 shadow-xl border-2 border-green-200">
              <div className="text-xs font-bold text-green-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 HITS
              </div>
              <div className="text-3xl font-black text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {hits}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 rounded-2xl p-4 shadow-xl border-2 border-orange-200">
              <div className="text-xs font-bold text-orange-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                😴 MISSES
              </div>
              <div className="text-3xl font-black text-orange-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {misses}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-red-50 via-rose-50 to-red-100 rounded-2xl p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs font-bold text-red-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ❌ FALSE HITS
              </div>
              <div className="text-3xl font-black text-red-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {falseHits}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs font-bold text-purple-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ⚡ AVG TIME
              </div>
              <div className="text-3xl font-black text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {avgReactionTime}ms
              </div>
            </div>
          </div>

          {/* Combo Display */}
          <div className={`mb-6 transition-all duration-300 ${getComboClass()}`}>
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-full shadow-2xl border-4 border-white">
              <div className="text-center">
                <div className="text-sm font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  🔥 COMBO
                </div>
                <div className="text-4xl font-black" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {combo}
                </div>
                <div className="text-xs opacity-90" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Best: {maxCombo}
                </div>
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="mb-8 p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-3xl shadow-2xl border-4 border-slate-200">
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              {grid.map((box, index) => (
                <button
                  key={index}
                  onClick={(e) => handleBoxClick(index, e)}
                  className={getBoxClass(index)}
                  style={{ width: '90px', height: '90px' }}
                >
                  {box && (
                    <>
                      <span className="relative z-10 drop-shadow-lg">
                        {box.type === 'target' ? '🎯' : '💀'}
                      </span>
                      {box.type === 'target' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                      )}
                      {box.type === 'decoy' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent opacity-20 animate-pulse"></div>
                      )}
                    </>
                  )}
                  {!box && (
                    <div className="text-slate-400 text-2xl opacity-50">
                      ⬜
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Beautiful Legend */}
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-2 border-gray-200 max-w-md">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎮 Game Guide
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                  🎯
                </div>
                <div>
                  <div className="font-bold text-green-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    TARGET
                  </div>
                  <div className="text-xs text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Click fast!
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                  💀
                </div>
                <div>
                  <div className="font-bold text-red-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    DECOY
                  </div>
                  <div className="text-xs text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Avoid!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Instructions */}
          <div className="text-center max-w-2xl">
            <div className="p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-200">
              <div className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🚀 How to Master Whack-a-Box
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Click the <span className="font-bold text-green-600">🎯 green boxes</span> as quickly as possible when they light up.
                Avoid the <span className="font-bold text-red-600">💀 red decoy boxes</span> - they'll break your combo and cost points!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <div className="font-bold text-blue-600 mb-1">⚡ Speed Bonus</div>
                  <div className="text-gray-600">Faster reactions = higher scores</div>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <div className="font-bold text-purple-600 mb-1">🔥 Combo System</div>
                  <div className="text-gray-600">Chain hits for massive bonuses</div>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <div className="font-bold text-orange-600 mb-1">🎯 Precision</div>
                  <div className="text-gray-600">Accuracy matters more than speed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default WhackABoxGame;
