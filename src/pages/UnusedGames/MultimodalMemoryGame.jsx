import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const MultimodalMemoryGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(360);
  const [difficulty, setDifficulty] = useState('medium');

  // Test state
  const [phase, setPhase] = useState('presentation'); // 'presentation', 'testing'
  const [currentItem, setCurrentItem] = useState(0);
  const [presentationItems, setPresentationItems] = useState([]);
  const [testItems, setTestItems] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [itemStartTime, setItemStartTime] = useState(null);
  const [currentPresentationMode, setCurrentPresentationMode] = useState('visual');

  // Difficulty settings
  const difficultySettings = {
    easy: {
      presentationCount: 12,
      testCount: 18,
      presentationTime: 3000,
      timeLimit: 480,
      complexity: 'Easy',
      description: 'Fewer items, longer presentation time, more response time'
    },
    medium: {
      presentationCount: 16,
      testCount: 24,
      presentationTime: 2500,
      timeLimit: 360,
      complexity: 'Medium',
      description: 'Standard item count and timing'
    },
    hard: {
      presentationCount: 20,
      testCount: 30,
      presentationTime: 2000,
      timeLimit: 300,
      complexity: 'Hard',
      description: 'More items, shorter presentation time, time pressure'
    }
  };

  // Object database
  const objectDatabase = [
    { id: 1, name: 'apple', category: 'fruit', emoji: '🍎', color: '#EF4444' },
    { id: 2, name: 'banana', category: 'fruit', emoji: '🍌', color: '#F59E0B' },
    { id: 3, name: 'car', category: 'vehicle', emoji: '🚗', color: '#3B82F6' },
    { id: 4, name: 'house', category: 'building', emoji: '🏠', color: '#10B981' },
    { id: 5, name: 'tree', category: 'nature', emoji: '🌳', color: '#059669' },
    { id: 6, name: 'book', category: 'object', emoji: '📚', color: '#8B5CF6' },
    { id: 7, name: 'phone', category: 'technology', emoji: '📱', color: '#6B7280' },
    { id: 8, name: 'chair', category: 'furniture', emoji: '🪑', color: '#92400E' },
    { id: 9, name: 'dog', category: 'animal', emoji: '🐕', color: '#DC2626' },
    { id: 10, name: 'cat', category: 'animal', emoji: '🐱', color: '#F97316' },
    { id: 11, name: 'flower', category: 'nature', emoji: '🌸', color: '#EC4899' },
    { id: 12, name: 'clock', category: 'object', emoji: '🕐', color: '#374151' },
    { id: 13, name: 'bicycle', category: 'vehicle', emoji: '🚲', color: '#1F2937' },
    { id: 14, name: 'pizza', category: 'food', emoji: '🍕', color: '#B45309' },
    { id: 15, name: 'computer', category: 'technology', emoji: '💻', color: '#4B5563' },
    { id: 16, name: 'guitar', category: 'instrument', emoji: '🎸', color: '#7C2D12' },
    { id: 17, name: 'ball', category: 'toy', emoji: '⚽', color: '#065F46' },
    { id: 18, name: 'lamp', category: 'furniture', emoji: '💡', color: '#FCD34D' },
    { id: 19, name: 'fish', category: 'animal', emoji: '🐟', color: '#0EA5E9' },
    { id: 20, name: 'bread', category: 'food', emoji: '🍞', color: '#A16207' },
    { id: 21, name: 'camera', category: 'technology', emoji: '📷', color: '#1F2937' },
    { id: 22, name: 'shoe', category: 'clothing', emoji: '👟', color: '#374151' },
    { id: 23, name: 'umbrella', category: 'object', emoji: '☂️', color: '#1E40AF' },
    { id: 24, name: 'butterfly', category: 'animal', emoji: '🦋', color: '#7C3AED' },
    { id: 25, name: 'mountain', category: 'nature', emoji: '⛰️', color: '#6B7280' },
    { id: 26, name: 'key', category: 'object', emoji: '🔑', color: '#D97706' },
    { id: 27, name: 'airplane', category: 'vehicle', emoji: '✈️', color: '#0284C7' },
    { id: 28, name: 'cake', category: 'food', emoji: '🎂', color: '#EC4899' },
    { id: 29, name: 'glasses', category: 'object', emoji: '👓', color: '#374151' },
    { id: 30, name: 'star', category: 'symbol', emoji: '⭐', color: '#FCD34D' },
    { id: 31, name: 'heart', category: 'symbol', emoji: '❤️', color: '#DC2626' },
    { id: 32, name: 'moon', category: 'nature', emoji: '🌙', color: '#6B7280' },
    { id: 33, name: 'sun', category: 'nature', emoji: '☀️', color: '#F59E0B' },
    { id: 34, name: 'cloud', category: 'nature', emoji: '☁️', color: '#9CA3AF' },
    { id: 35, name: 'rainbow', category: 'nature', emoji: '🌈', color: '#8B5CF6' }
  ];

  // Shuffle array utility
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Generate presentation and test items
  const generateItems = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const shuffledObjects = shuffleArray(objectDatabase);

    // Create presentation items with alternating visual/auditory modes
    const presentation = shuffledObjects.slice(0, settings.presentationCount).map((obj, index) => ({
      ...obj,
      presentationMode: index % 2 === 0 ? 'visual' : 'auditory',
      presentationIndex: index
    }));

    // Create test items (presented items + new items)
    const newItems = shuffledObjects.slice(settings.presentationCount, settings.presentationCount + (settings.testCount - settings.presentationCount));
    const testItemsArray = shuffleArray([
      ...presentation.map(item => ({ ...item, status: 'presented', correctAnswer: item.presentationMode })),
      ...newItems.map(item => ({ ...item, status: 'new', correctAnswer: 'new' }))
    ]).slice(0, settings.testCount);

    setPresentationItems(presentation);
    setTestItems(testItemsArray);
  }, [difficulty, shuffleArray]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setPhase('presentation');
    setCurrentItem(0);
    setSelectedAnswers([]);
    setCorrectAnswers(0);
    setShowFeedback(false);
    setReactionTimes([]);
    generateItems();
  }, [difficulty, generateItems]);

  // Handle presentation phase progression
  const handlePresentationNext = useCallback(() => {
    if (currentItem + 1 < presentationItems.length) {
      setCurrentItem(prev => prev + 1);
    } else {
      setPhase('testing');
      setCurrentItem(0);
      setItemStartTime(Date.now());
    }
  }, [currentItem, presentationItems.length]);

  // Handle test selection
  const handleTestSelect = useCallback((answer) => {
    if (!itemStartTime || showFeedback) return;

    const reactionTime = Date.now() - itemStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);

    const currentTestItem = testItems[currentItem];
    const isCorrect = answer === currentTestItem.correctAnswer;

    setSelectedAnswers(prev => [...prev, {
      itemId: currentTestItem.id,
      selected: answer,
      correct: isCorrect,
      correctAnswer: currentTestItem.correctAnswer
    }]);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + Math.max(5, 30 - Math.floor(reactionTime / 200)));
    }

    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);

      if (currentItem + 1 < testItems.length) {
        setCurrentItem(prev => prev + 1);
        setItemStartTime(Date.now());
      } else {
        setGameState('completed');
      }
    }, 1500);
  }, [itemStartTime, showFeedback, currentItem, testItems]);

  // Auto-advance presentation items
  useEffect(() => {
    if (gameState === 'playing' && phase === 'presentation') {
      const timer = setTimeout(() => {
        handlePresentationNext();
      }, difficultySettings[difficulty].presentationTime);

      return () => clearTimeout(timer);
    }
  }, [gameState, phase, currentItem, difficulty, handlePresentationNext]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('completed');
    }
  }, [gameState, timeRemaining]);

  // Game handlers
  const handleStart = () => {
    setGameState('playing');
  };

  const handleReset = () => {
    setGameState('ready');
    initializeGame();
  };

  const handleGameComplete = (payload) => {
  };

  // Custom stats
  const customStats = {
    phase,
    currentItem: currentItem + 1,
    totalPresentationItems: presentationItems.length,
    totalTestItems: testItems.length,
    accuracy: selectedAnswers.length > 0 ? Math.round((correctAnswers / selectedAnswers.length) * 100) : 0,
    averageReactionTime: reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0,
    correctAnswers
  };

  // Get current item for display
  const getCurrentItem = () => {
    if (phase === 'presentation') {
      return presentationItems[currentItem];
    } else {
      return testItems[currentItem];
    }
  };

  const currentDisplayItem = getCurrentItem();

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Multimodal Lexical Memory Test"
        gameDescription="Test your ability to distinguish between visual and auditory object presentations"
        category="Multimodal Memory"
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
          {/* Professional Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-5xl">
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                PHASE
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {phase}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                PROGRESS
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentItem + 1}/{phase === 'presentation' ? customStats.totalPresentationItems : customStats.totalTestItems}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ACCURACY
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.accuracy}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                REACTION TIME
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.averageReactionTime}ms
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CORRECT
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctAnswers}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="w-full max-w-4xl mb-6 sm:mb-8">
            {currentDisplayItem && gameState === 'playing' && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                {/* Phase Header */}
                <div className="text-center mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {phase === 'presentation' ? 'Presentation Phase' : 'Testing Phase'}
                  </h3>
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {phase === 'presentation'
                      ? `Remember this object (${currentItem + 1}/${presentationItems.length})`
                      : `How was this object presented? (${currentItem + 1}/${testItems.length})`
                    }
                  </div>
                </div>

                {/* Item Display */}
                <div className="flex flex-col items-center mb-8">
                  {phase === 'presentation' ? (
                    // Presentation Phase Display
                    <div className="text-center">
                      {currentDisplayItem.presentationMode === 'visual' ? (
                        <div>
                          <div
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center text-6xl sm:text-7xl mb-4 shadow-lg border-4 mx-auto"
                            style={{
                              backgroundColor: `${currentDisplayItem.color}20`,
                              borderColor: currentDisplayItem.color
                            }}
                          >
                            {currentDisplayItem.emoji}
                          </div>
                          <div className="text-sm text-blue-600 font-semibold mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            👁️ VISUAL PRESENTATION
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl mb-4 shadow-lg border-4 mx-auto bg-purple-100 border-purple-500">
                            🔊
                          </div>
                          <div className="text-sm text-purple-600 font-semibold mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            🔊 AUDITORY PRESENTATION
                          </div>
                          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            "{currentDisplayItem.name.toUpperCase()}"
                          </div>
                        </div>
                      )}

                      <div className="text-lg text-gray-600 mt-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Remember this {currentDisplayItem.presentationMode} presentation...
                      </div>
                    </div>
                  ) : (
                    // Testing Phase Display
                    <div className="text-center">
                      <div
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center text-6xl sm:text-7xl mb-4 shadow-lg border-4 mx-auto"
                        style={{
                          backgroundColor: `${currentDisplayItem.color}20`,
                          borderColor: currentDisplayItem.color
                        }}
                      >
                        {currentDisplayItem.emoji}
                      </div>

                      <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {currentDisplayItem.name.toUpperCase()}
                      </h4>

                      <div className="text-lg text-gray-700 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        How was this object presented before?
                      </div>

                      {/* Test Response Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <button
                          onClick={() => handleTestSelect('new')}
                          disabled={showFeedback}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors duration-200 text-base"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          🆕 NEW<br />
                          <span className="text-sm opacity-90">First time seeing</span>
                        </button>
                        <button
                          onClick={() => handleTestSelect('visual')}
                          disabled={showFeedback}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors duration-200 text-base"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          👁️ VISUAL<br />
                          <span className="text-sm opacity-90">Shown as picture</span>
                        </button>
                        <button
                          onClick={() => handleTestSelect('auditory')}
                          disabled={showFeedback}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors duration-200 text-base"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          🔊 AUDITORY<br />
                          <span className="text-sm opacity-90">Heard as word</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Presentation Phase Controls */}
                {phase === 'presentation' && (
                  <div className="text-center">
                    <button
                      onClick={handlePresentationNext}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Next Object
                    </button>
                  </div>
                )}

                {/* Feedback */}
                {showFeedback && phase === 'testing' && (
                  <div className="text-center mt-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${selectedAnswers[selectedAnswers.length - 1]?.correct
                      ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {selectedAnswers[selectedAnswers.length - 1]?.correct ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className="font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {selectedAnswers[selectedAnswers.length - 1]?.correct ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Game State Display */}
            {gameState !== 'playing' && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready' ? 'Ready to Test Multimodal Memory' : 'Test Complete'}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready'
                    ? 'Test your ability to distinguish between visual and auditory presentations'
                    : `Final Score: ${score} points with ${customStats.accuracy}% accuracy`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Multimodal Lexical Memory Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your ability to distinguish between visual and auditory object presentations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Presentation Phase
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Objects are presented in two ways:</li>
                    <li>• Visual: You see the object image</li>
                    <li>• Auditory: You hear the object name</li>
                    <li>• Remember both the object and how it was presented</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Testing Phase
                    </h4>
                  </div>
                  <ul className="text-sm text-purple-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Choose how each object was presented:</li>
                    <li>• NEW: Object not seen before</li>
                    <li>• VISUAL: Previously shown as picture</li>
                    <li>• AUDITORY: Previously heard as word</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test Objectives
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>
                    <strong>Multimodal Memory:</strong> Distinguishing between visual and auditory presentations
                  </div>
                  <div>
                    <strong>Source Memory:</strong> Remembering how information was originally presented
                  </div>
                  <div>
                    <strong>Recognition:</strong> Identifying new vs. previously presented items
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Pay attention to presentation mode • Choose NEW/VISUAL/AUDITORY in testing phase
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: Focus on both the object identity and the presentation modality for accurate source memory.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default MultimodalMemoryGame;
