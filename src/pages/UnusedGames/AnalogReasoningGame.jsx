import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Brain, Lightbulb, CheckCircle, XCircle, Clock, Target, ChevronUp, ChevronDown } from 'lucide-react';

const AnalogicalReasoningGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [solvedAnalogies, setSolvedAnalogies] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [analogyStartTime, setAnalogyStartTime] = useState(0);

  // Game state
  const [currentAnalogy, setCurrentAnalogy] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showGameInstructions, setShowGameInstructions] = useState(true);

  // Analogy database by difficulty and type
  const analogyDatabase = {
    easy: {
      semantic: [
        { a: 'Cat', b: 'Meow', c: 'Dog', answer: 'Bark', options: ['Bark', 'Purr', 'Chirp', 'Moo'], relationship: 'animal sounds', hint: 'Think about the sounds these animals make' },
        { a: 'Hot', b: 'Cold', c: 'Big', answer: 'Small', options: ['Small', 'Tiny', 'Large', 'Huge'], relationship: 'opposites', hint: 'These words are opposites of each other' },
        { a: 'Bird', b: 'Fly', c: 'Fish', answer: 'Swim', options: ['Swim', 'Walk', 'Run', 'Jump'], relationship: 'natural abilities', hint: 'Consider how each animal moves in their natural habitat' },
        { a: 'Day', b: 'Night', c: 'Summer', answer: 'Winter', options: ['Winter', 'Spring', 'Fall', 'Rain'], relationship: 'seasonal opposites', hint: 'Think about opposite times or seasons' },
        { a: 'Happy', b: 'Sad', c: 'Up', answer: 'Down', options: ['Down', 'Left', 'Right', 'Forward'], relationship: 'directional opposites', hint: 'These are opposite directions or emotions' },
        { a: 'Book', b: 'Read', c: 'Song', answer: 'Listen', options: ['Listen', 'Write', 'Draw', 'Dance'], relationship: 'actions with objects', hint: 'What do you do with each of these things?' },
        { a: 'Rain', b: 'Wet', c: 'Sun', answer: 'Hot', options: ['Hot', 'Cold', 'Dark', 'Bright'], relationship: 'cause and effect', hint: 'What effect does each weather condition have?' },
        { a: 'Teacher', b: 'School', c: 'Doctor', answer: 'Hospital', options: ['Hospital', 'Home', 'Store', 'Park'], relationship: 'profession and workplace', hint: 'Where does each professional work?' }
      ],
      numerical: [
        { a: '2', b: '4', c: '3', answer: '6', options: ['6', '5', '7', '9'], relationship: 'multiplication by 2', hint: 'Look at how the first number relates to the second' },
        { a: '1', b: '3', c: '2', answer: '4', options: ['4', '5', '6', '3'], relationship: 'add 2', hint: 'What operation turns the first number into the second?' },
        { a: '10', b: '5', c: '8', answer: '4', options: ['4', '3', '6', '2'], relationship: 'division by 2', hint: 'The second number is half of the first' },
        { a: '5', b: '25', c: '3', answer: '9', options: ['9', '6', '12', '15'], relationship: 'square', hint: 'Think about mathematical operations like squaring' }
      ],
      patterns: [
        { a: 'ABC', b: 'DEF', c: 'GHI', answer: 'JKL', options: ['JKL', 'MNO', 'HIJ', 'KLM'], relationship: 'sequential letters', hint: 'Follow the alphabetical sequence' },
        { a: 'Red', b: 'Stop', c: 'Green', answer: 'Go', options: ['Go', 'Wait', 'Slow', 'Fast'], relationship: 'traffic light meanings', hint: 'Think about traffic light signals' }
      ]
    },
    moderate: {
      semantic: [
        { a: 'Pen', b: 'Write', c: 'Brush', answer: 'Paint', options: ['Paint', 'Draw', 'Color', 'Sketch'], relationship: 'tool and primary function', hint: 'What is the main purpose of each tool?' },
        { a: 'Library', b: 'Quiet', c: 'Concert', answer: 'Loud', options: ['Loud', 'Silent', 'Peaceful', 'Calm'], relationship: 'place and typical sound level', hint: 'Consider the expected noise level in each location' },
        { a: 'Seed', b: 'Tree', c: 'Egg', answer: 'Bird', options: ['Bird', 'Nest', 'Fly', 'Wing'], relationship: 'beginning to mature form', hint: 'Think about what each starting form grows into' },
        { a: 'Architect', b: 'Blueprint', c: 'Chef', answer: 'Recipe', options: ['Recipe', 'Kitchen', 'Food', 'Cook'], relationship: 'professional and their planning document', hint: 'What document does each professional use to plan their work?' },
        { a: 'Moon', b: 'Tide', c: 'Wind', answer: 'Wave', options: ['Wave', 'Storm', 'Breeze', 'Current'], relationship: 'natural force and water effect', hint: 'How does each natural phenomenon affect water?' },
        { a: 'Key', b: 'Lock', c: 'Password', answer: 'Computer', options: ['Computer', 'Phone', 'Account', 'Security'], relationship: 'access method and what it unlocks', hint: 'What does each method help you access?' },
        { a: 'Thermometer', b: 'Temperature', c: 'Scale', answer: 'Weight', options: ['Weight', 'Height', 'Length', 'Size'], relationship: 'instrument and measurement', hint: 'What does each instrument measure?' },
        { a: 'Captain', b: 'Ship', c: 'Pilot', answer: 'Plane', options: ['Plane', 'Car', 'Train', 'Boat'], relationship: 'operator and vehicle', hint: 'What vehicle does each professional operate?' }
      ],
      numerical: [
        { a: '3', b: '9', c: '4', answer: '16', options: ['16', '12', '8', '20'], relationship: 'square', hint: 'The second number is the square of the first' },
        { a: '12', b: '6', c: '20', answer: '10', options: ['10', '15', '5', '25'], relationship: 'half', hint: 'The second number is half of the first' },
        { a: '7', b: '14', c: '9', answer: '18', options: ['18', '16', '20', '15'], relationship: 'double', hint: 'The pattern involves doubling' },
        { a: '100', b: '10', c: '64', answer: '8', options: ['8', '6', '4', '12'], relationship: 'square root', hint: 'Think about square roots' },
        { a: '15', b: '3', c: '25', answer: '5', options: ['5', '10', '15', '20'], relationship: 'divide by 5', hint: 'What do you divide the first number by to get the second?' }
      ],
      patterns: [
        { a: 'Monday', b: 'Wednesday', c: 'Tuesday', answer: 'Thursday', options: ['Thursday', 'Friday', 'Saturday', 'Sunday'], relationship: 'skip one day', hint: 'Look at the pattern of days being skipped' },
        { a: 'Triangle', b: '3', c: 'Square', answer: '4', options: ['4', '5', '6', '8'], relationship: 'shape and number of sides', hint: 'Count the sides of each shape' },
        { a: 'January', b: 'Winter', c: 'July', answer: 'Summer', options: ['Summer', 'Spring', 'Fall', 'Autumn'], relationship: 'month and season', hint: 'What season does each month belong to?' }
      ]
    },
    hard: {
      semantic: [
        { a: 'Metamorphosis', b: 'Butterfly', c: 'Photosynthesis', answer: 'Plant', options: ['Plant', 'Leaf', 'Tree', 'Flower'], relationship: 'biological process and organism', hint: 'Which organisms undergo these specific biological processes?' },
        { a: 'Conductor', b: 'Orchestra', c: 'Director', answer: 'Movie', options: ['Movie', 'Theater', 'Actor', 'Stage'], relationship: 'leader and creative work', hint: 'What creative work does each leader guide the creation of?' },
        { a: 'Stethoscope', b: 'Heartbeat', c: 'Telescope', answer: 'Stars', options: ['Stars', 'Moon', 'Space', 'Sky'], relationship: 'instrument and what it observes', hint: 'What specific things are observed using these instruments?' },
        { a: 'Democracy', b: 'Vote', c: 'Monarchy', answer: 'Crown', options: ['Crown', 'King', 'Rule', 'Power'], relationship: 'government system and symbol', hint: 'What symbol represents each form of government?' },
        { a: 'Hypothesis', b: 'Experiment', c: 'Question', answer: 'Research', options: ['Research', 'Answer', 'Study', 'Investigation'], relationship: 'starting point and method', hint: 'What method is used to address each starting point?' },
        { a: 'Renaissance', b: 'Art', c: 'Industrial Revolution', answer: 'Technology', options: ['Technology', 'Machines', 'Factory', 'Innovation'], relationship: 'historical period and main development', hint: 'What was the main area of development in each historical period?' },
        { a: 'Catalyst', b: 'Reaction', c: 'Inspiration', answer: 'Creativity', options: ['Creativity', 'Art', 'Ideas', 'Innovation'], relationship: 'trigger and result', hint: 'What does each trigger cause to happen?' },
        { a: 'Symphony', b: 'Movement', c: 'Novel', answer: 'Chapter', options: ['Chapter', 'Page', 'Story', 'Book'], relationship: 'artistic work and structural division', hint: 'How is each artistic work divided into sections?' }
      ],
      numerical: [
        { a: '2', b: '8', c: '3', answer: '27', options: ['27', '9', '18', '24'], relationship: 'cube', hint: 'Think about cubing numbers (n³)' },
        { a: '144', b: '12', c: '169', answer: '13', options: ['13', '14', '15', '16'], relationship: 'square root', hint: 'The second number is the square root of the first' },
        { a: '1', b: '1', c: '2', answer: '4', options: ['4', '3', '5', '6'], relationship: 'fibonacci sequence', hint: 'This follows a famous mathematical sequence' },
        { a: '81', b: '9', c: '125', answer: '25', options: ['25', '15', '20', '30'], relationship: 'fourth root then square', hint: 'Find the fourth root, then square it' },
        { a: '24', b: '4', c: '120', answer: '5', options: ['5', '6', '8', '10'], relationship: 'factorial', hint: 'The first number is the factorial of the second' }
      ],
      patterns: [
        { a: 'Sonnet', b: '14', c: 'Haiku', answer: '3', options: ['3', '5', '7', '4'], relationship: 'poem type and line count', hint: 'How many lines does each type of poem traditionally have?' },
        { a: 'Equinox', b: 'Equal', c: 'Solstice', answer: 'Extreme', options: ['Extreme', 'Long', 'Short', 'Different'], relationship: 'astronomical event and daylight characteristic', hint: 'What characterizes daylight during each astronomical event?' },
        { a: 'Allegro', b: 'Fast', c: 'Adagio', answer: 'Slow', options: ['Slow', 'Medium', 'Loud', 'Soft'], relationship: 'musical tempo and speed', hint: 'These are musical terms describing tempo' }
      ]
    }
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 180, lives: 5, hints: 3, analogiesNeeded: 8 },
    Moderate: { timeLimit: 150, lives: 4, hints: 2, analogiesNeeded: 10 },
    Hard: { timeLimit: 120, lives: 3, hints: 1, analogiesNeeded: 12 }
  };

  // Generate new analogy
  const generateNewAnalogy = useCallback(() => {
    const difficultyLevel = difficulty.toLowerCase();
    const categories = Object.keys(analogyDatabase[difficultyLevel]);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const analogies = analogyDatabase[difficultyLevel][selectedCategory];
    const selectedAnalogy = analogies[Math.floor(Math.random() * analogies.length)];

    // Shuffle options
    const shuffledOptions = [...selectedAnalogy.options].sort(() => Math.random() - 0.5);

    setCurrentAnalogy({
      ...selectedAnalogy,
      category: selectedCategory,
      options: shuffledOptions
    });

    setSelectedAnswer('');
    setShowFeedback(false);
    setShowHint(false);
    setAnalogyStartTime(Date.now());
  }, [difficulty]);

  // Calculate score
  const calculateScore = useCallback(() => {
    if (totalAttempts === 0 || solvedAnalogies === 0) return 0;

    const settings = difficultySettings[difficulty];
    const successRate = solvedAnalogies / totalAttempts;
    const avgResponseTime = totalResponseTime / totalAttempts / 1000;

    // Base score from success rate (0-70 points)
    let baseScore = successRate * 70;

    // Time bonus (max 30 points)
    const idealTime = difficulty === 'Easy' ? 20 : difficulty === 'Moderate' ? 15 : 12;
    const timeBonus = Math.max(0, Math.min(30, (idealTime - avgResponseTime) * 2));

    // Streak bonus (max 35 points)
    const streakBonus = Math.min(maxStreak * 3.5, 35);

    // Level progression bonus (max 25 points)
    const levelBonus = Math.min(currentLevel * 1.8, 25);

    // Lives bonus (max 20 points)
    const livesBonus = (lives / settings.lives) * 20;

    // Hints penalty (subtract up to 20 points)
    const hintsPenalty = (hintsUsed / settings.hints) * 20;

    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.85 : difficulty === 'Moderate' ? 1.0 : 1.15;

    // Time remaining bonus (max 20 points)
    const timeRemainingBonus = Math.min(20, (timeRemaining / settings.timeLimit) * 20);

    let finalScore = (baseScore + timeBonus + streakBonus + levelBonus + livesBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;

    // Apply additional constraints to prevent easy 200 score
    finalScore = finalScore * 0.82;

    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [solvedAnalogies, totalAttempts, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle answer submission
  const handleSubmit = useCallback((answer) => {
    if (gameState !== 'playing' || showFeedback || !currentAnalogy) return;

    const responseTime = Date.now() - analogyStartTime;
    const isCorrect = answer === currentAnalogy.answer;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    if (isCorrect) {
      setFeedbackType('correct');
      setSolvedAnalogies(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setCurrentLevel(prev => prev + 1);

      setTimeout(() => {
        if (currentLevel >= difficultySettings[difficulty].analogiesNeeded) {
          setGameState('finished');
          setShowCompletionModal(true);
        } else {
          generateNewAnalogy();
        }
      }, 2500);
    } else {
      setFeedbackType('incorrect');
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('finished');
          setShowCompletionModal(true);
        }
        return Math.max(0, newLives);
      });

      setTimeout(() => {
        setShowFeedback(false);
      }, 2500);
    }
  }, [gameState, showFeedback, currentAnalogy, analogyStartTime, generateNewAnalogy, currentLevel, difficulty]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentAnalogy) return;

    setHintsUsed(prev => prev + 1);
    setHintMessage(currentAnalogy.hint);
    setShowHint(true);

    setTimeout(() => {
      setShowHint(false);
    }, 6000);
  };

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

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentLevel(1);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setSolvedAnalogies(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    generateNewAnalogy();
  };

  const handleReset = () => {
    initializeGame();
    setCurrentAnalogy(null);
    setSelectedAnswer('');
    setShowFeedback(false);
    setShowHint(false);
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    lives,
    hintsUsed,
    solvedAnalogies,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    category: currentAnalogy?.category || 'N/A'
  };

  const getRelationshipDescription = (relationship) => {
    const descriptions = {
      'animal sounds': 'Animals and their sounds',
      'opposites': 'Opposite concepts',
      'natural abilities': 'Natural behaviors',
      'seasonal opposites': 'Opposite seasons/times',
      'directional opposites': 'Opposite directions',
      'actions with objects': 'Actions performed with items',
      'cause and effect': 'Cause and result relationship',
      'profession and workplace': 'Jobs and work locations',
      'multiplication by 2': 'Multiply by 2',
      'add 2': 'Add 2 to the number',
      'division by 2': 'Divide by 2',
      'square': 'Square the number',
      'sequential letters': 'Alphabetical sequence',
      'traffic light meanings': 'Traffic signal meanings'
    };
    return descriptions[relationship] || relationship;
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Analogical Reasoning"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowGameInstructions(!showGameInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Analogical Reasoning
                </h3>
                <span className="text-blue-900 text-xl">
                  {showGameInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Toggle Content */}
              {showGameInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Complete A:B :: C:? analogies by finding the relationship between A and B, then applying it to C.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔗 Relationships
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• <strong>Semantic:</strong> Word meanings</li>
                      <li>• <strong>Numerical:</strong> Math patterns</li>
                      <li>• <strong>Patterns:</strong> Sequences</li>
                      <li>• <strong>Logical:</strong> Cause & effect</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Accuracy is key</li>
                      <li>• Speed bonuses</li>
                      <li>• Streak multipliers</li>
                      <li>• Hint penalties</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      💡 Strategy
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Identify the relationship first</li>
                      <li>• Think logically</li>
                      <li>• Use hints wisely</li>
                      <li>• Build winning streaks</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Logic"
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
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {gameState === 'playing' && (
              <button
                onClick={useHint}
                disabled={hintsUsed >= maxHints}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
              >
                <Lightbulb className="h-4 w-4" />
                Hint ({maxHints - hintsUsed})
              </button>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Lives
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'❤️'.repeat(lives)}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streak}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Progress
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {solvedAnalogies}/{difficultySettings[difficulty].analogiesNeeded}
              </div>
            </div>
          </div>

          {/* Current Analogy Display */}
          {currentAnalogy && (
            <div className="w-full max-w-4xl mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold text-blue-800 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentAnalogy.category} Analogy
                  </span>
                </div>

                <div className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentAnalogy.a} : {currentAnalogy.b} :: {currentAnalogy.c} : ?
                </div>

                <p className="text-blue-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  Find the relationship between "{currentAnalogy.a}" and "{currentAnalogy.b}", then apply it to "{currentAnalogy.c}"
                </p>
              </div>
            </div>
          )}

          {/* Hint Display */}
          {showHint && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hint:
                  </span>
                </div>
                <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {hintMessage}
                </p>
              </div>
            </div>
          )}

          {/* Answer Options */}
          {currentAnalogy && !showFeedback && (
            <div className="w-full max-w-2xl mb-6">
              <div className="grid grid-cols-2 gap-4">
                {currentAnalogy.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(option)}
                    className="p-4 text-lg font-semibold bg-white border-2 border-gray-300 rounded-lg hover:border-[#FF6B3E] hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B3E] focus:border-transparent"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentAnalogy && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg ${feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Excellent!' : 'Incorrect!'}
                </div>
              </div>
              <div className="text-sm mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackType === 'correct'
                  ? `Correct! The answer is "${currentAnalogy.answer}".`
                  : `You selected "${selectedAnswer}". The correct answer is "${currentAnalogy.answer}".`
                }
              </div>
              <div className="text-xs bg-white bg-opacity-50 rounded p-2 mt-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <strong>Relationship:</strong> {getRelationshipDescription(currentAnalogy.relationship)}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Analyze the relationship between the first two terms, then find the option that maintains the same relationship with the third term.
              Think about meanings, patterns, and logical connections.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              Complete {difficultySettings[difficulty].analogiesNeeded} analogies to win
            </div>
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

export default AnalogicalReasoningGame;