import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { ChevronUp, ChevronDown } from 'lucide-react';

const SequenceRecallGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [sequenceLength, setSequenceLength] = useState(0);
  const [correctPositions, setCorrectPositions] = useState(0);
  const [totalPositions, setTotalPositions] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSequenceInstructions, setShowSequenceInstructions] = useState(false);

  // Available colors
  const colors = [
    { id: 'red', color: '#EF4444', name: 'Red' },
    { id: 'blue', color: '#3B82F6', name: 'Blue' },
    { id: 'green', color: '#10B981', name: 'Green' },
    { id: 'yellow', color: '#F59E0B', name: 'Yellow' },
    { id: 'purple', color: '#8B5CF6', name: 'Purple' },
    { id: 'orange', color: '#F97316', name: 'Orange' }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: { previewTime: 2000, startLength: 3, maxLength: 6, timeLimit: 60 },
    Moderate: { previewTime: 1000, startLength: 4, maxLength: 8, timeLimit: 50 },
    Hard: { previewTime: 700, startLength: 5, maxLength: 10, timeLimit: 40 }
  };

  // Generate new sequence
  const generateSequence = useCallback((length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      newSequence.push(randomColor.id);
    }
    return newSequence;
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setCurrentLevel(1);
    setSequence([]);
    setPlayerSequence([]);
    setIsShowingSequence(false);
    setActiveColor(null);
    setSequenceLength(0);
    setCorrectPositions(0);
    setTotalPositions(0);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
  }, [difficulty]);

  // Start new round
  const startNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const length = Math.min(settings.startLength + currentLevel - 1, settings.maxLength);
    const newSequence = generateSequence(length);

    setSequence(newSequence);
    setPlayerSequence([]);
    setSequenceLength(length);
    setIsShowingSequence(true);
    setActiveColor(null);

    // Show sequence
    showSequence(newSequence, settings.previewTime);
  }, [currentLevel, difficulty, generateSequence]);

  // Show sequence animation
  const showSequence = (seq, previewTime) => {
    let index = 0;

    const showNext = () => {
      if (index < seq.length) {
        setActiveColor(seq[index]);
        setTimeout(() => {
          setActiveColor(null);
          setTimeout(() => {
            index++;
            showNext();
          }, 200);
        }, previewTime);
      } else {
        setIsShowingSequence(false);
      }
    };

    setTimeout(showNext, 500);
  };

  // Handle color selection
  const handleColorSelect = (colorId) => {
    if (gameState !== 'playing' || isShowingSequence) return;

    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);

    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      // Calculate correct positions
      let correct = 0;
      for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] === newPlayerSequence[i]) {
          correct++;
        }
      }

      setCorrectPositions(prev => prev + correct);
      setTotalPositions(prev => prev + sequence.length);

      // Check if perfect match
      if (correct === sequence.length) {
        // Perfect match - advance to next level
        setTimeout(() => {
          setCurrentLevel(prev => prev + 1);
          startNewRound();
        }, 1000);
      } else {
        // Imperfect match - show feedback and continue
        setTimeout(() => {
          startNewRound();
        }, 1500);
      }
    }
  };

  // Calculate score
  useEffect(() => {
    if (totalPositions > 0) {
      const accuracy = correctPositions / totalPositions;
      let newScore = accuracy * 200;

      // Time penalty
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;
      const expectedTime = settings.timeLimit * 0.8;
      if (timeUsed > expectedTime) {
        const penalty = (timeUsed - expectedTime) * 2;
        newScore -= penalty;
      }

      setScore(Math.max(0, Math.min(200, newScore)));
    }
  }, [correctPositions, totalPositions, timeRemaining, difficulty]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  const handleStart = () => {
    initializeGame();
    setTimeout(() => {
      startNewRound();
    }, 500);
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    sequenceLength,
    correctPositions,
    totalPositions
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Sequence Recall"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0 mt-8">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Toggle Header */}
              <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => setShowSequenceInstructions(!showSequenceInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Sequence Recall
                </h3>
                {showSequenceInstructions ? (
                  <ChevronUp className="text-blue-900" size={20} />
                ) : (
                  <ChevronDown className="text-blue-900" size={20} />
                )}
              </div>

              {/* Toggle Content */}
              {showSequenceInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Watch color sequences and reproduce them in the exact same order. Progress through levels with increasingly longer sequences.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔄 Gameplay
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Watch the color sequence carefully</li>
                      <li>• Click colors in the same order</li>
                      <li>• Correct sequence advances to next level</li>
                      <li>• Wrong sequence repeats the level</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Accuracy is key (120 points max)</li>
                      <li>• Level progression bonus (40 points)</li>
                      <li>• Time efficiency bonus (30 points)</li>
                      <li>• Mistakes reduce score (-2 each)</li>
                      <li>• Perfect game bonus (+10 points)</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      💡 Strategy
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Focus intensely during preview</li>
                      <li>• Use memory techniques</li>
                      <li>• Take your time clicking</li>
                      <li>• Avoid rushing between colors</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Memory"
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
          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Sequence
              </div>
              <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {playerSequence.length}/{sequence.length}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalPositions > 0 ? Math.round((correctPositions / totalPositions) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Status Display */}
          <div className="mb-6 text-center">
            {isShowingSequence && (
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Watch the sequence...
              </div>
            )}
            {!isShowingSequence && sequence.length > 0 && (
              <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Repeat the sequence ({playerSequence.length}/{sequence.length})
              </div>
            )}
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorSelect(color.id)}
                disabled={isShowingSequence}
                className={`
                  w-20 h-20 md:w-24 md:h-24 rounded-lg border-4 transition-all duration-200 flex items-center justify-center
                  ${activeColor === color.id
                    ? 'border-white shadow-lg scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${isShowingSequence ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
                style={{
                  backgroundColor: color.color,
                  opacity: isShowingSequence && activeColor !== color.id ? 0.5 : 1
                }}
              >
                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {color.name}
                </span>
              </button>
            ))}
          </div>

          {/* Player Sequence Display */}
          {playerSequence.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Your sequence:
              </div>
              <div className="flex gap-2">
                {playerSequence.map((colorId, index) => {
                  const color = colors.find(c => c.id === colorId);
                  return (
                    <div
                      key={index}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: color.color }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              {isShowingSequence
                ? 'Watch carefully and memorize the color sequence.'
                : 'Click the colors in the same order you saw them.'
              }
            </p>
          </div>
        </div>
      </GameFramework>
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
      />
    </div>
  );
};

export default SequenceRecallGame;
