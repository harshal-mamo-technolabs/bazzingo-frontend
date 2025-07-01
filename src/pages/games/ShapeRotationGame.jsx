import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const ShapeRotationGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentShape, setCurrentShape] = useState(null);
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [choicesMade, setChoicesMade] = useState(0);
  const [correctChoices, setCorrectChoices] = useState(0);
  const [errors, setErrors] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

  // Shape definitions (simplified 2D representations)
  const shapes = [
    {
      id: 'L',
      name: 'L-Shape',
      pattern: [
        [1, 0],
        [1, 0],
        [1, 1]
      ]
    },
    {
      id: 'T',
      name: 'T-Shape',
      pattern: [
        [1, 1, 1],
        [0, 1, 0]
      ]
    },
    {
      id: 'Z',
      name: 'Z-Shape',
      pattern: [
        [1, 1, 0],
        [0, 1, 1]
      ]
    },
    {
      id: 'S',
      name: 'S-Shape',
      pattern: [
        [0, 1, 1],
        [1, 1, 0]
      ]
    },
    {
      id: 'J',
      name: 'J-Shape',
      pattern: [
        [0, 1],
        [0, 1],
        [1, 1]
      ]
    }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: { optionsCount: 3, timeLimit: 60, includeMirror: false },
    Moderate: { optionsCount: 4, timeLimit: 50, includeMirror: false },
    Hard: { optionsCount: 4, timeLimit: 40, includeMirror: true }
  };

  // Rotate pattern 90 degrees clockwise
  const rotatePattern = (pattern) => {
    const rows = pattern.length;
    const cols = pattern[0].length;
    const rotated = Array(cols).fill().map(() => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = pattern[i][j];
      }
    }

    return rotated;
  };

  // Mirror pattern horizontally
  const mirrorPattern = (pattern) => {
    return pattern.map(row => [...row].reverse());
  };

  // Generate rotated versions of a shape
  const generateRotations = (shape) => {
    const rotations = [shape.pattern];
    let current = shape.pattern;

    for (let i = 0; i < 3; i++) {
      current = rotatePattern(current);
      rotations.push(current);
    }

    return rotations;
  };

  // Check if two patterns are identical
  const patternsEqual = (pattern1, pattern2) => {
    if (pattern1.length !== pattern2.length) return false;
    if (pattern1[0].length !== pattern2[0].length) return false;

    for (let i = 0; i < pattern1.length; i++) {
      for (let j = 0; j < pattern1[0].length; j++) {
        if (pattern1[i][j] !== pattern2[i][j]) return false;
      }
    }

    return true;
  };

  // Generate new round
  const generateNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const baseShape = shapes[Math.floor(Math.random() * shapes.length)];

    // Generate target pattern (random rotation)
    const rotations = generateRotations(baseShape);
    const targetRotation = Math.floor(Math.random() * 4);
    const targetPattern = rotations[targetRotation];

    setCurrentShape({
      ...baseShape,
      pattern: targetPattern,
      rotation: targetRotation
    });

    // Generate options
    const newOptions = [];

    // Add correct answer (original shape)
    newOptions.push({
      id: 'correct',
      pattern: baseShape.pattern,
      isCorrect: true
    });

    // Add incorrect options
    const otherShapes = shapes.filter(s => s.id !== baseShape.id);
    while (newOptions.length < settings.optionsCount) {
      const randomShape = otherShapes[Math.floor(Math.random() * otherShapes.length)];
      let optionPattern = randomShape.pattern;

      // Sometimes rotate the incorrect options
      if (Math.random() > 0.5) {
        const rotations = generateRotations(randomShape);
        optionPattern = rotations[Math.floor(Math.random() * 4)];
      }

      // Add mirror for hard difficulty
      if (settings.includeMirror && Math.random() > 0.5) {
        optionPattern = mirrorPattern(optionPattern);
      }

      // Check if this option already exists
      const exists = newOptions.some(opt => patternsEqual(opt.pattern, optionPattern));
      if (!exists) {
        newOptions.push({
          id: `option-${newOptions.length}`,
          pattern: optionPattern,
          isCorrect: false
        });
      }
    }

    // Shuffle options
    const shuffledOptions = newOptions.sort(() => Math.random() - 0.5);
    setOptions(shuffledOptions);
    setCorrectAnswer(shuffledOptions.find(opt => opt.isCorrect));
  }, [difficulty]);

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (gameState !== 'playing') return;

    setChoicesMade(prev => prev + 1);

    if (option.isCorrect) {
      setCorrectChoices(prev => prev + 1);
    } else {
      setErrors(prev => prev + 1);
    }

    // Generate next round after short delay
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      generateNewRound();
    }, 1000);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setChoicesMade(0);
    setCorrectChoices(0);
    setErrors(0);
    setCurrentRound(1);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
  }, [difficulty]);

  // Calculate score
  useEffect(() => {
    if (choicesMade > 0) {
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;

      let newScore = 200 - (errors * 15 + timeUsed * 0.8);
      newScore = Math.max(0, Math.min(200, newScore));

      setScore(newScore);
    }
  }, [errors, timeRemaining, difficulty, choicesMade]);

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

  const handleStart = () => {
    initializeGame();
    generateNewRound();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    choicesMade,
    correctChoices,
    errors,
    time: difficultySettings[difficulty].timeLimit - timeRemaining
  };

  // Render pattern as grid
  const renderPattern = (pattern, size = 'normal') => {
    const cellSize = size === 'large' ? 'w-8 h-8' : 'w-6 h-6';

    return (
      <div className="inline-block">
        {pattern.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => (
              <div
                key={j}
                className={`${cellSize} border border-gray-300 ${cell ? 'bg-[#FF6B3E]' : 'bg-gray-100'
                  }`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Shape Rotation"
        gameDescription="Pick the candidate that matches the sample shape orientation!"
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
          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-lg">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Round
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentRound}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Correct
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctChoices}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Errors
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {errors}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {choicesMade > 0 ? Math.round((correctChoices / choicesMade) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Target Shape */}
          {currentShape && (
            <div className="mb-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Find the original shape that matches this rotated version:
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 inline-block">
                {renderPattern(currentShape.pattern, 'large')}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className="bg-white border-2 border-gray-300 rounded-lg p-4 hover:border-[#FF6B3E] hover:bg-orange-50 transition-colors"
              >
                <div className="text-center">
                  <div className="mb-2">
                    {renderPattern(option.pattern)}
                  </div>
                  <div className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Option {index + 1}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              The target shape has been rotated. Select the original shape that would create this pattern when rotated.
              {difficulty === 'Hard' && ' Watch out for mirrored decoys!'}
            </p>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default ShapeRotationGame;
