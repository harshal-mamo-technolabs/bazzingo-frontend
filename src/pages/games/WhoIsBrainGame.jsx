import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const WhoIsBrainGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [difficulty, setDifficulty] = useState('medium');

  // Game state
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [discoveredClues, setDiscoveredClues] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [availableHints, setAvailableHints] = useState(3);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      scenarios: 8,
      hints: 3,
      timeLimit: 420,
      complexity: 'Easy',
      description: 'Simple scenarios with obvious clues'
    },
    medium: {
      scenarios: 12,
      hints: 2,
      timeLimit: 300,
      complexity: 'Medium',
      description: 'Moderate complexity with hidden clues'
    },
    hard: {
      scenarios: 16,
      hints: 1,
      timeLimit: 240,
      complexity: 'Hard',
      description: 'Complex scenarios requiring careful observation'
    }
  };

  // Scenarios data
  const scenarios = [
    {
      id: 1,
      question: "Who is lying?",
      description: "Three friends claim they didn't eat the last cookie. Find the liar!",
      characters: [
        {
          id: 'alice',
          name: 'Alice',
          emoji: '👧',
          statement: "I was reading in my room all afternoon.",
          clues: {
            hands: { discovered: false, evidence: "Clean hands, no crumbs" },
            face: { discovered: false, evidence: "Calm expression, making eye contact" },
            clothes: { discovered: false, evidence: "No chocolate stains on shirt" },
            shoes: { discovered: false, evidence: "Clean shoes, was indoors" }
          },
          isCorrect: false
        },
        {
          id: 'bob',
          name: 'Bob',
          emoji: '👦',
          statement: "I was playing video games and never left my chair.",
          clues: {
            hands: { discovered: false, evidence: "Chocolate smudges on fingers!" },
            face: { discovered: false, evidence: "Avoiding eye contact, nervous" },
            clothes: { discovered: false, evidence: "Cookie crumbs on lap" },
            shoes: { discovered: false, evidence: "Shoes are clean" }
          },
          isCorrect: true
        },
        {
          id: 'charlie',
          name: 'Charlie',
          emoji: '🧒',
          statement: "I was outside playing soccer the whole time.",
          clues: {
            hands: { discovered: false, evidence: "Dirty from playing outside" },
            face: { discovered: false, evidence: "Honest expression, confident" },
            clothes: { discovered: false, evidence: "Grass stains on shirt" },
            shoes: { discovered: false, evidence: "Muddy shoes from outside" }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'bob',
      explanation: "Bob has chocolate on his fingers and cookie crumbs on his lap, contradicting his claim of never leaving his chair."
    },
    {
      id: 2,
      question: "Who is the thief?",
      description: "Someone stole money from the teacher's desk. Who took it?",
      characters: [
        {
          id: 'emma',
          name: 'Emma',
          emoji: '👩',
          statement: "I was in the library studying for my test.",
          clues: {
            hands: { discovered: false, evidence: "Ink stains from writing" },
            face: { discovered: false, evidence: "Tired from studying" },
            clothes: { discovered: false, evidence: "Books in backpack" },
            shoes: { discovered: false, evidence: "Library card in pocket" }
          },
          isCorrect: false
        },
        {
          id: 'david',
          name: 'David',
          emoji: '👨',
          statement: "I was in the cafeteria eating lunch with friends.",
          clues: {
            hands: { discovered: false, evidence: "Food crumbs on hands" },
            face: { discovered: false, evidence: "Relaxed and honest" },
            clothes: { discovered: false, evidence: "Lunch receipt in pocket" },
            shoes: { discovered: false, evidence: "Clean shoes" }
          },
          isCorrect: false
        },
        {
          id: 'sarah',
          name: 'Sarah',
          emoji: '👱‍♀️',
          statement: "I was in the bathroom fixing my makeup.",
          clues: {
            hands: { discovered: false, evidence: "Shaky hands, nervous" },
            face: { discovered: false, evidence: "Sweating, avoiding eye contact" },
            clothes: { discovered: false, evidence: "Bulge in pocket - money!" },
            shoes: { discovered: false, evidence: "Shoes are clean" }
          },
          isCorrect: true
        }
      ],
      correctAnswer: 'sarah',
      explanation: "Sarah has money bulging in her pocket and shows nervous behavior, indicating guilt."
    }
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setTimeRemaining(settings.timeLimit);
    setScore(0);
    setCurrentScenario(0);
    setSelectedCharacter(null);
    setDiscoveredClues([]);
    setShowFeedback(false);
    setCorrectAnswers(0);
    setTotalScenarios(0);
    setHintsUsed(0);
    setAvailableHints(settings.hints);
  }, [difficulty]);

  // Handle clue discovery
  const handleClueDiscovery = (characterId, clueType) => {
    const clueKey = `${characterId}-${clueType}`;
    if (!discoveredClues.includes(clueKey)) {
      setDiscoveredClues(prev => [...prev, clueKey]);
      setScore(prev => prev + 5);
    }
  };

  // Handle character selection
  const handleCharacterSelect = (characterId) => {
    if (showFeedback) return;

    setSelectedCharacter(characterId);
    const currentScenarioData = scenarios[currentScenario];
    const isCorrect = characterId === currentScenarioData.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 50);
    }

    setTotalScenarios(prev => prev + 1);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedCharacter(null);
      setDiscoveredClues([]);

      const settings = difficultySettings[difficulty];
      if (currentScenario + 1 >= Math.min(scenarios.length, settings.scenarios)) {
        setGameState('completed');
      } else {
        setCurrentScenario(prev => prev + 1);
      }
    }, 3000);
  };

  // Handle hint usage
  const handleUseHint = () => {
    if (availableHints > 0) {
      setAvailableHints(prev => prev - 1);
      setHintsUsed(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 10));

      // Reveal a random undiscovered clue
      const currentScenarioData = scenarios[currentScenario];
      const allClues = [];
      currentScenarioData.characters.forEach(char => {
        Object.keys(char.clues).forEach(clueType => {
          allClues.push(`${char.id}-${clueType}`);
        });
      });

      const undiscoveredClues = allClues.filter(clue => !discoveredClues.includes(clue));
      if (undiscoveredClues.length > 0) {
        const randomClue = undiscoveredClues[Math.floor(Math.random() * undiscoveredClues.length)];
        setDiscoveredClues(prev => [...prev, randomClue]);
      }
    }
  };

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
    console.log('Who Is Brain Game completed:', payload);
  };

  // Calculate performance metrics
  const calculateMetrics = () => {
    const accuracy = totalScenarios > 0 ? Math.round((correctAnswers / totalScenarios) * 100) : 0;
    const cluesFound = discoveredClues.length;

    return { accuracy, cluesFound };
  };

  // Custom stats
  const metrics = calculateMetrics();
  const customStats = {
    currentScenario: currentScenario + 1,
    totalScenarios: Math.min(scenarios.length, difficultySettings[difficulty].scenarios),
    correctAnswers,
    accuracy: metrics.accuracy,
    cluesFound: metrics.cluesFound,
    hintsUsed,
    availableHints
  };

  const currentScenarioData = scenarios[currentScenario] || scenarios[0];

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Who Is? Brain Game"
        gameDescription="Solve mystery scenarios by analyzing visual clues and character behavior"
        category="Deductive Reasoning"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                SCENARIO
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.currentScenario}/{customStats.totalScenarios}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CORRECT
              </div>
              <div className="text-lg sm:text-xl font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctAnswers}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ACCURACY
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.accuracy}%
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CLUES
              </div>
              <div className="text-lg sm:text-xl font-bold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {metrics.cluesFound}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                HINTS LEFT
              </div>
              <div className="text-lg sm:text-xl font-bold text-yellow-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {availableHints}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 col-span-2 sm:col-span-4 lg:col-span-2">
              <div className="text-xs font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                HINTS USED
              </div>
              <div className="text-lg sm:text-xl font-bold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {hintsUsed}
              </div>
            </div>
          </div>

          {/* Game State Display */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🕵️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {gameState === 'ready' ? 'Ready to Solve Mysteries?' : 'Detective Work Complete!'}
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {gameState === 'ready'
                  ? 'Analyze clues and solve mystery scenarios using deductive reasoning'
                  : `Final Score: ${score} points • Accuracy: ${metrics.accuracy}%`
                }
              </p>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default WhoIsBrainGame;
