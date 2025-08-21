import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const LexicalMemoryGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [difficulty, setDifficulty] = useState('medium');

  // Test state
  const [phase, setPhase] = useState('study'); // 'study', 'recognition'
  const [currentItem, setCurrentItem] = useState(0);
  const [studyItems, setStudyItems] = useState([]);
  const [recognitionItems, setRecognitionItems] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [itemStartTime, setItemStartTime] = useState(null);
  const [presentationMode, setPresentationMode] = useState('visual'); // 'visual', 'auditory'

  // Difficulty settings
  const difficultySettings = {
    easy: {
      studyItemCount: 8,
      recognitionItemCount: 16,
      studyTime: 3000,
      timeLimit: 420,
      complexity: 'Easy',
      description: 'Fewer items, longer study time, more recognition time'
    },
    medium: {
      studyItemCount: 12,
      recognitionItemCount: 24,
      studyTime: 2500,
      timeLimit: 300,
      complexity: 'Medium',
      description: 'Standard item count and timing'
    },
    hard: {
      studyItemCount: 16,
      recognitionItemCount: 32,
      studyTime: 2000,
      timeLimit: 240,
      complexity: 'Hard',
      description: 'More items, shorter study time, time pressure'
    }
  };

  // Object database for the test
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
    { id: 35, name: 'rainbow', category: 'nature', emoji: '🌈', color: '#8B5CF6' },
    { id: 36, name: 'fire', category: 'element', emoji: '🔥', color: '#EF4444' }
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

  // Generate study and recognition items
  const generateItems = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const shuffledObjects = shuffleArray(objectDatabase);

    // Select study items
    const study = shuffledObjects.slice(0, settings.studyItemCount);

    // Create recognition items (study items + distractors)
    const distractors = shuffledObjects.slice(settings.studyItemCount, settings.studyItemCount + (settings.recognitionItemCount - settings.studyItemCount));
    const recognition = shuffleArray([...study, ...distractors]);

    setStudyItems(study);
    setRecognitionItems(recognition);
  }, [difficulty, shuffleArray]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setPhase('study');
    setCurrentItem(0);
    setSelectedAnswers([]);
    setCorrectAnswers(0);
    setShowFeedback(false);
    setReactionTimes([]);
    generateItems();
  }, [difficulty, generateItems]);

  // Handle study phase progression
  const handleStudyNext = useCallback(() => {
    if (currentItem + 1 < studyItems.length) {
      setCurrentItem(prev => prev + 1);
    } else {
      setPhase('recognition');
      setCurrentItem(0);
      setItemStartTime(Date.now());
    }
  }, [currentItem, studyItems.length]);

  // Handle recognition selection
  const handleRecognitionSelect = useCallback((itemId, wasStudied) => {
    if (!itemStartTime || showFeedback) return;

    const reactionTime = Date.now() - itemStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);

    const isCorrect = wasStudied;
    setSelectedAnswers(prev => [...prev, { itemId, selected: true, correct: isCorrect }]);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + Math.max(5, 25 - Math.floor(reactionTime / 200)));
    }

    // Move to next item
    if (currentItem + 1 < recognitionItems.length) {
      setCurrentItem(prev => prev + 1);
      setItemStartTime(Date.now());
    } else {
      setGameState('completed');
    }
  }, [itemStartTime, showFeedback, currentItem, recognitionItems.length]);

  // Auto-advance study items
  useEffect(() => {
    if (gameState === 'playing' && phase === 'study') {
      const timer = setTimeout(() => {
        handleStudyNext();
      }, difficultySettings[difficulty].studyTime);

      return () => clearTimeout(timer);
    }
  }, [gameState, phase, currentItem, difficulty, handleStudyNext]);

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
    console.log('Game completed:', payload);
  };

  // Custom stats
  const customStats = {
    phase,
    currentItem: currentItem + 1,
    totalStudyItems: studyItems.length,
    totalRecognitionItems: recognitionItems.length,
    accuracy: selectedAnswers.length > 0 ? Math.round((correctAnswers / selectedAnswers.length) * 100) : 0,
    averageReactionTime: reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0,
    correctAnswers,
    presentationMode
  };

  // Get current item for display
  const getCurrentItem = () => {
    if (phase === 'study') {
      return studyItems[currentItem];
    } else {
      return recognitionItems[currentItem];
    }
  };

  const currentDisplayItem = getCurrentItem();
  const wasStudied = phase === 'recognition' && currentDisplayItem && studyItems.some(item => item.id === currentDisplayItem.id);

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Lexical Memory Test"
        gameDescription="Test your object recognition and lexical memory through visual and auditory presentation"
        category="Memory & Recognition"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
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
                {currentItem + 1}/{phase === 'study' ? customStats.totalStudyItems : customStats.totalRecognitionItems}
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
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CORRECT
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctAnswers}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                MODE
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {presentationMode}
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
                    {phase === 'study' ? 'Study Phase' : 'Recognition Phase'}
                  </h3>
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {phase === 'study'
                      ? `Memorize this object (${currentItem + 1}/${studyItems.length})`
                      : `Have you seen this object before? (${currentItem + 1}/${recognitionItems.length})`
                    }
                  </div>
                </div>

                {/* Item Display */}
                <div className="flex flex-col items-center mb-8">
                  <div
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center text-6xl sm:text-7xl mb-4 shadow-lg border-4"
                    style={{
                      backgroundColor: `${currentDisplayItem.color}20`,
                      borderColor: currentDisplayItem.color
                    }}
                  >
                    {currentDisplayItem.emoji}
                  </div>

                  <div className="text-center">
                    <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {currentDisplayItem.name.toUpperCase()}
                    </h4>
                    <div className="text-sm text-gray-500 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {currentDisplayItem.category}
                    </div>
                  </div>
                </div>

                {/* Study Phase Controls */}
                {phase === 'study' && (
                  <div className="text-center">
                    <div className="text-lg text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Study this object carefully...
                    </div>
                    <button
                      onClick={handleStudyNext}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Next Object
                    </button>
                  </div>
                )}

                {/* Recognition Phase Controls */}
                {phase === 'recognition' && (
                  <div className="text-center">
                    <div className="text-lg text-gray-700 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Did you see this object in the study phase?
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                      <button
                        onClick={() => handleRecognitionSelect(currentDisplayItem.id, true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 text-lg"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        ✓ YES, I saw it
                      </button>
                      <button
                        onClick={() => handleRecognitionSelect(currentDisplayItem.id, false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 text-lg"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        ✗ NO, it's new
                      </button>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready' ? 'Ready to Test Lexical Memory' : 'Test Complete'}
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameState === 'ready'
                    ? 'Test your object recognition and memory abilities'
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
                  Lexical Memory Test Instructions
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test your object recognition and lexical memory through two-phase assessment
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
                      Study Phase
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Carefully observe each object presented</li>
                    <li>• Memorize the object name and appearance</li>
                    <li>• Objects are shown for a limited time</li>
                    <li>• Focus on both visual and lexical features</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Recognition Phase
                    </h4>
                  </div>
                  <ul className="text-sm text-green-600 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <li>• Identify if you saw each object before</li>
                    <li>• Click "YES" if it was in the study phase</li>
                    <li>• Click "NO" if it's a new object</li>
                    <li>• Respond quickly and accurately</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Test Objectives
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div>
                    <strong>Lexical Memory:</strong> Ability to remember and recognize object names and categories
                  </div>
                  <div>
                    <strong>Visual Recognition:</strong> Identifying previously seen objects among distractors
                  </div>
                  <div>
                    <strong>Processing Speed:</strong> Quick and accurate recognition responses
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Controls: Study objects carefully in phase 1 • Make YES/NO recognition decisions in phase 2
                </div>
                <div className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tip: Pay attention to both the visual appearance and the object name during the study phase for better recognition.
                </div>
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default LexicalMemoryGame;
