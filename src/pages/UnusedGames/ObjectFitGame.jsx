import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const ObjectFitGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [shapeOptions, setShapeOptions] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [correctFits, setCorrectFits] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedShape, setSelectedShape] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Professional 2D shape definitions with enhanced styling
  const shapes2D = [
    {
      id: 'circle',
      name: 'Circle',
      icon: '●',
      path: 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10',
      color: '#2563EB',
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      description: 'Perfect round shape'
    },
    {
      id: 'square',
      name: 'Square',
      icon: '■',
      path: 'M20,20 L80,20 L80,80 L20,80 Z',
      color: '#DC2626',
      gradient: 'from-red-500 via-red-600 to-red-700',
      description: 'Four equal sides'
    },
    {
      id: 'triangle',
      name: 'Triangle',
      icon: '▲',
      path: 'M50,15 L85,75 L15,75 Z',
      color: '#059669',
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      description: 'Three-sided polygon'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: '▬',
      path: 'M15,30 L85,30 L85,70 L15,70 Z',
      color: '#D97706',
      gradient: 'from-amber-500 via-amber-600 to-amber-700',
      description: 'Four sides, opposite equal'
    },
    {
      id: 'diamond',
      name: 'Diamond',
      icon: '◆',
      path: 'M50,15 L75,50 L50,85 L25,50 Z',
      color: '#7C3AED',
      gradient: 'from-violet-500 via-violet-600 to-violet-700',
      description: 'Rotated square shape'
    },
    {
      id: 'hexagon',
      name: 'Hexagon',
      icon: '⬢',
      path: 'M50,10 L75,30 L75,70 L50,90 L25,70 L25,30 Z',
      color: '#EA580C',
      gradient: 'from-orange-500 via-orange-600 to-orange-700',
      description: 'Six-sided polygon'
    }
  ];

  // Professional 3D object definitions
  const shapes3D = [
    {
      id: 'cube',
      name: 'Cube',
      icon: '⬛',
      emoji: '🟦',
      color: '#2563EB',
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      description: 'Six square faces',
      properties: '6 faces, 12 edges, 8 vertices'
    },
    {
      id: 'sphere',
      name: 'Sphere',
      icon: '●',
      emoji: '🔵',
      color: '#0891B2',
      gradient: 'from-cyan-500 via-cyan-600 to-cyan-700',
      description: 'Perfect round ball',
      properties: 'Curved surface, no edges'
    },
    {
      id: 'pyramid',
      name: 'Pyramid',
      icon: '▲',
      emoji: '🔺',
      color: '#059669',
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      description: 'Triangular base with apex',
      properties: '4 faces, 6 edges, 4 vertices'
    },
    {
      id: 'cylinder',
      name: 'Cylinder',
      icon: '⬜',
      emoji: '🟢',
      color: '#16A34A',
      gradient: 'from-green-500 via-green-600 to-green-700',
      description: 'Circular base with height',
      properties: '3 faces, 2 edges, 0 vertices'
    },
    {
      id: 'cone',
      name: 'Cone',
      icon: '🔶',
      emoji: '🔶',
      color: '#D97706',
      gradient: 'from-amber-500 via-amber-600 to-amber-700',
      description: 'Circular base with pointed top',
      properties: '2 faces, 1 edge, 1 vertex'
    },
    {
      id: 'prism',
      name: 'Prism',
      icon: '▬',
      emoji: '🟪',
      color: '#7C3AED',
      gradient: 'from-violet-500 via-violet-600 to-violet-700',
      description: 'Rectangular base with height',
      properties: '6 faces, 12 edges, 8 vertices'
    }
  ];

  // Enhanced difficulty settings
  const difficultySettings = {
    Easy: { is3D: false, optionsCount: 3, timeLimit: 60, shapeCount: 4 },
    Moderate: { is3D: false, optionsCount: 4, timeLimit: 50, shapeCount: 5 },
    Hard: { is3D: true, optionsCount: 4, timeLimit: 40, shapeCount: 6 }
  };

  // Create professional sparkle effect
  const createSparkleEffect = useCallback((isCorrect) => {
    const sparkleCount = isCorrect ? 10 : 5;
    const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      color: isCorrect ? '#10B981' : '#EF4444',
      symbol: isCorrect ? '✨' : '💫'
    }));

    setSparkles(prev => [...prev, ...newSparkles]);

    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 2000);
  }, []);

  // Enhanced slot shape definitions with professional styling
  const slotShapes = {
    '2D': [
      {
        id: 'circle-slot',
        shape: 'circle',
        name: 'Circle Slot',
        icon: '○',
        path: 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10',
        description: 'Fits circular objects',
        gradient: 'from-blue-100 via-blue-200 to-blue-300'
      },
      {
        id: 'square-slot',
        shape: 'square',
        name: 'Square Slot',
        icon: '□',
        path: 'M20,20 L80,20 L80,80 L20,80 Z',
        description: 'Fits square objects',
        gradient: 'from-red-100 via-red-200 to-red-300'
      },
      {
        id: 'triangle-slot',
        shape: 'triangle',
        name: 'Triangle Slot',
        icon: '△',
        path: 'M50,15 L85,75 L15,75 Z',
        description: 'Fits triangular objects',
        gradient: 'from-emerald-100 via-emerald-200 to-emerald-300'
      },
      {
        id: 'rectangle-slot',
        shape: 'rectangle',
        name: 'Rectangle Slot',
        icon: '▭',
        path: 'M15,30 L85,30 L85,70 L15,70 Z',
        description: 'Fits rectangular objects',
        gradient: 'from-amber-100 via-amber-200 to-amber-300'
      },
      {
        id: 'diamond-slot',
        shape: 'diamond',
        name: 'Diamond Slot',
        icon: '◇',
        path: 'M50,15 L75,50 L50,85 L25,50 Z',
        description: 'Fits diamond objects',
        gradient: 'from-violet-100 via-violet-200 to-violet-300'
      },
      {
        id: 'hexagon-slot',
        shape: 'hexagon',
        name: 'Hexagon Slot',
        icon: '⬡',
        path: 'M50,10 L75,30 L75,70 L50,90 L25,70 L25,30 Z',
        description: 'Fits hexagonal objects',
        gradient: 'from-orange-100 via-orange-200 to-orange-300'
      }
    ],
    '3D': [
      {
        id: 'cube-slot',
        shape: 'cube',
        name: 'Cube Slot',
        icon: '⬜',
        description: 'Fits cubic objects',
        properties: 'For 6-faced objects',
        gradient: 'from-blue-100 via-blue-200 to-blue-300'
      },
      {
        id: 'sphere-slot',
        shape: 'sphere',
        name: 'Sphere Slot',
        icon: '⚪',
        description: 'Fits spherical objects',
        properties: 'For round objects',
        gradient: 'from-cyan-100 via-cyan-200 to-cyan-300'
      },
      {
        id: 'pyramid-slot',
        shape: 'pyramid',
        name: 'Pyramid Slot',
        icon: '🔺',
        description: 'Fits pyramid objects',
        properties: 'For triangular base objects',
        gradient: 'from-emerald-100 via-emerald-200 to-emerald-300'
      },
      {
        id: 'cylinder-slot',
        shape: 'cylinder',
        name: 'Cylinder Slot',
        icon: '⬜',
        description: 'Fits cylindrical objects',
        properties: 'For circular base objects',
        gradient: 'from-green-100 via-green-200 to-green-300'
      },
      {
        id: 'cone-slot',
        shape: 'cone',
        name: 'Cone Slot',
        icon: '🔶',
        description: 'Fits cone objects',
        properties: 'For pointed objects',
        gradient: 'from-amber-100 via-amber-200 to-amber-300'
      },
      {
        id: 'prism-slot',
        shape: 'prism',
        name: 'Prism Slot',
        icon: '▬',
        description: 'Fits prism objects',
        properties: 'For rectangular objects',
        gradient: 'from-violet-100 via-violet-200 to-violet-300'
      }
    ]
  };

  // Generate enhanced new round with better logic
  const generateNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const shapeSet = settings.is3D ? shapes3D : shapes2D;
    const slotSet = slotShapes[settings.is3D ? '3D' : '2D'];

    // Select random slot from available shapes
    const availableSlots = slotSet.slice(0, settings.shapeCount);
    const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
    setCurrentSlot(randomSlot);

    // Find correct shape
    const correctShape = shapeSet.find(shape => shape.id === randomSlot.shape);

    // Generate wrong options from available shapes
    const availableShapes = shapeSet.slice(0, settings.shapeCount);
    const wrongShapes = availableShapes.filter(shape => shape.id !== randomSlot.shape);

    // Select random wrong shapes
    const selectedWrongShapes = [];
    const shuffledWrong = wrongShapes.sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(settings.optionsCount - 1, shuffledWrong.length); i++) {
      selectedWrongShapes.push(shuffledWrong[i]);
    }

    // Combine correct and wrong options, then shuffle
    const allOptions = [correctShape, ...selectedWrongShapes].sort(() => Math.random() - 0.5);
    setShapeOptions(allOptions);
    setSelectedShape(null);
    setShowResult(false);
  }, [difficulty]);

  // Enhanced shape selection handler
  const handleShapeSelect = useCallback((shape) => {
    if (gameState !== 'playing' || showResult) return;

    setSelectedShape(shape);
    setAttempts(prev => prev + 1);
    setShowResult(true);

    const isCorrect = shape.id === currentSlot.shape;

    if (isCorrect) {
      setCorrectFits(prev => prev + 1);
      createSparkleEffect(true);
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    } else {
      setErrors(prev => prev + 1);
      createSparkleEffect(false);
    }

    // Generate next round after delay
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      generateNewRound();
    }, 2500);
  }, [gameState, showResult, currentSlot, createSparkleEffect, generateNewRound]);

  // Enhanced game initialization
  const initializeGame = useCallback(() => {
    setAttempts(0);
    setErrors(0);
    setCorrectFits(0);
    setCurrentRound(1);
    setScore(0);
    setTimeRemaining(difficultySettings[difficulty].timeLimit);
    setSelectedShape(null);
    setShowResult(false);
    setSparkles([]);
    setPulseEffect(false);
  }, [difficulty]);

  // Enhanced scoring using Spatial Awareness formula
  useEffect(() => {
    if (attempts > 0) {
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;
      const accuracy = correctFits / attempts;

      // Spatial formula: Base score - (errors × penalty + time × factor) + accuracy bonus
      let newScore = 200 - (errors * 12 + timeUsed * 0.6) + (accuracy * 50);
      newScore = Math.max(0, Math.min(200, newScore));

      setScore(Math.round(newScore));
    }
  }, [attempts, errors, correctFits, timeRemaining, difficulty]);

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

  // Game handlers
  const handleStart = () => {
    initializeGame();
    generateNewRound();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    attempts,
    errors,
    correctFits,
    time: difficultySettings[difficulty].timeLimit - timeRemaining
  };

  // Enhanced 2D shape rendering with professional styling
  const renderShape2D = (shape, isSelected = false, isCorrect = null) => {
    let containerClass = `w-full h-full p-4 rounded-2xl border-4 transition-all duration-300 transform-gpu ${isSelected && isCorrect !== null
      ? isCorrect
        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-100 shadow-2xl shadow-green-500/50 scale-105'
        : 'border-red-400 bg-gradient-to-br from-red-50 to-rose-100 shadow-2xl shadow-red-500/50 scale-95'
      : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 hover:shadow-xl hover:scale-105'
      }`;

    return (
      <div className={containerClass}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <defs>
            <linearGradient id={`gradient-${shape.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={shape.color} />
              <stop offset="100%" stopColor={`${shape.color}CC`} />
            </linearGradient>
          </defs>
          <path
            d={shape.path}
            fill={`url(#gradient-${shape.id})`}
            stroke="#374151"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
        </svg>
      </div>
    );
  };

  // Enhanced 3D shape rendering with professional styling
  const renderShape3D = (shape, isSelected = false, isCorrect = null) => {
    let containerClass = `w-full h-full p-4 rounded-2xl border-4 transition-all duration-300 transform-gpu flex flex-col items-center justify-center ${isSelected && isCorrect !== null
      ? isCorrect
        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-100 shadow-2xl shadow-green-500/50 scale-105'
        : 'border-red-400 bg-gradient-to-br from-red-50 to-rose-100 shadow-2xl shadow-red-500/50 scale-95'
      : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 hover:shadow-xl hover:scale-105'
      }`;

    return (
      <div className={containerClass}>
        <div className="text-5xl mb-2 drop-shadow-lg">{shape.emoji}</div>
        <div className="text-xs text-center text-gray-700 font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {shape.description}
        </div>
        <div className="text-xs text-center text-gray-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {shape.properties}
        </div>
      </div>
    );
  };

  // Enhanced slot rendering with professional styling
  const renderSlot = (slot) => {
    const settings = difficultySettings[difficulty];
    const isPulsing = pulseEffect;

    let containerClass = `w-full h-full rounded-3xl border-4 border-dashed transition-all duration-500 ${isPulsing ? 'animate-pulse scale-110' : ''
      }`;

    if (settings.is3D) {
      return (
        <div className={`${containerClass} border-slate-400 bg-gradient-to-br ${slot.gradient} shadow-2xl p-6 flex flex-col items-center justify-center`}>
          <div className="text-4xl mb-3 drop-shadow-lg">{slot.icon}</div>
          <div className="text-lg text-center text-slate-800 font-bold mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {slot.name}
          </div>
          <div className="text-sm text-center text-slate-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {slot.description}
          </div>
          <div className="text-xs text-center text-slate-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {slot.properties}
          </div>
        </div>
      );
    } else {
      return (
        <div className={`${containerClass} border-slate-400 bg-gradient-to-br ${slot.gradient} shadow-2xl p-6`}>
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">{slot.icon}</div>
            <div className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {slot.name}
            </div>
            <div className="text-sm text-slate-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {slot.description}
            </div>
          </div>
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
            <path
              d={slot.path}
              fill="none"
              stroke="#475569"
              strokeWidth="4"
              strokeDasharray="8,4"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      );
    }
  };

  return (
    <div>
      <Header unreadCount={3} />

      {/* Professional Particle Effects */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {sparkles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-ping font-bold"
            style={{
              left: particle.x,
              top: particle.y,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              color: particle.color,
              fontSize: '28px'
            }}
          >
            {particle.symbol}
          </div>
        ))}
      </div>

      <GameFramework
        gameTitle="Object Fit"
        gameDescription="Analyze the slot and select the perfect shape that fits!"
        category="Spatial Awareness"
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
        {/* Game Content */}
        <div className="flex flex-col items-center">
          {/* Enhanced Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs font-bold text-blue-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 ROUND
              </div>
              <div className="text-3xl font-black text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentRound}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-2xl p-4 shadow-xl border-2 border-green-200">
              <div className="text-xs font-bold text-green-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ✅ CORRECT
              </div>
              <div className="text-3xl font-black text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctFits}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-red-50 via-rose-50 to-red-100 rounded-2xl p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs font-bold text-red-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ❌ ERRORS
              </div>
              <div className="text-3xl font-black text-red-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {errors}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs font-bold text-purple-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 ACCURACY
              </div>
              <div className="text-3xl font-black text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {attempts > 0 ? Math.round((correctFits / attempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Enhanced Slot Display */}
          {currentSlot && (
            <div className="mb-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 text-white px-8 py-4 rounded-xl shadow-2xl border border-slate-600">
                  <span className="text-3xl font-bold">🎯</span>
                  <div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      TARGET SLOT
                    </div>
                    <div className="text-sm opacity-90 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Find the perfect fit
                    </div>
                  </div>
                  <span className="text-3xl font-bold">🎯</span>
                </div>
              </div>
              <div className="w-48 h-48 mx-auto">
                {renderSlot(currentSlot)}
              </div>
            </div>
          )}

          {/* Enhanced Shape Options */}
          <div className={`grid gap-6 mb-8 ${difficultySettings[difficulty].optionsCount === 3 ? 'grid-cols-3' : 'grid-cols-2'} max-w-4xl`}>
            {shapeOptions.map((shape, index) => (
              <button
                key={shape.id}
                onClick={() => handleShapeSelect(shape)}
                disabled={showResult}
                className="transform transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="w-32 h-32 mb-3">
                    {difficultySettings[difficulty].is3D
                      ? renderShape3D(
                        shape,
                        selectedShape?.id === shape.id,
                        selectedShape?.id === shape.id ? (shape.id === currentSlot.shape) : null
                      )
                      : renderShape2D(
                        shape,
                        selectedShape?.id === shape.id,
                        selectedShape?.id === shape.id ? (shape.id === currentSlot.shape) : null
                      )
                    }
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-gray-200">
                    <div className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {shape.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {shape.description}
                    </div>
                    {showResult && selectedShape?.id === shape.id && (
                      <div className={`text-sm font-semibold mt-2 ${shape.id === currentSlot.shape ? 'text-green-600' : 'text-red-600'
                        }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {shape.id === currentSlot.shape ? '✅ Perfect Fit!' : '❌ Wrong Shape'}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Beautiful Legend */}
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-2 border-gray-200 max-w-3xl">
            <div className="text-center mb-4">
              <div className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🧩 Shape Analysis Guide
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-bold text-blue-700 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    TARGET SLOT
                  </div>
                </div>
                <div className="text-sm text-blue-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Analyze the slot's shape, size, and properties. This is what you need to match perfectly.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-bold text-emerald-700 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    SHAPE OPTIONS
                  </div>
                </div>
                <div className="text-sm text-emerald-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Compare each shape's properties with the target slot to find the perfect match.
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Instructions */}
          <div className="text-center max-w-4xl">
            <div className="p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-2xl shadow-2xl border-2 border-slate-300">
              <div className="text-3xl font-bold text-slate-800 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🧩 SPATIAL REASONING MASTERY
              </div>
              <p className="text-lg text-slate-700 leading-relaxed mb-8" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Examine the target slot carefully and identify which {difficultySettings[difficulty].is3D ? '3D object' : '2D shape'} would fit perfectly.
                Consider <span className="font-bold text-slate-900 bg-yellow-200 px-2 py-1 rounded">shape geometry, dimensions, and spatial properties</span> to make the correct match.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-blue-300 hover:border-blue-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-blue-600">📐</div>
                  <div className="font-bold text-blue-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>GEOMETRIC ANALYSIS</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Study the slot's geometric properties and match them with the correct shape
                  </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-emerald-300 hover:border-emerald-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-emerald-600">🎯</div>
                  <div className="font-bold text-emerald-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>PERFECT MATCHING</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Find the shape that fits exactly - no gaps, no overlaps, perfect alignment
                  </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <div className="text-3xl mb-3 font-bold text-orange-600">⚡</div>
                  <div className="font-bold text-orange-700 mb-2 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>SPATIAL THINKING</div>
                  <div className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Develop 3D visualization skills and spatial reasoning abilities
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-300">
                <div className="text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  🎮 Current Mode: {difficultySettings[difficulty].is3D ? '3D Objects' : '2D Shapes'} |
                  Options: {difficultySettings[difficulty].optionsCount} |
                  Shapes Available: {difficultySettings[difficulty].shapeCount}
                </div>
                <div className="text-xs text-slate-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  💡 Tip: {difficultySettings[difficulty].is3D
                    ? 'Consider the 3D properties like faces, edges, and vertices when matching objects'
                    : 'Focus on the outline, angles, and proportions of the 2D shapes'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default ObjectFitGame;
