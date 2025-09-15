import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { difficultySettings, getScenariosByDifficulty, calculateScore } from '../../utils/games/BorderlineBrain';
import { Eye, Lightbulb, CheckCircle, XCircle, Plane, ChevronUp, ChevronDown, Flag, UtensilsCrossed, Shirt, Coins } from 'lucide-react';

const BorderlineBrainsGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [scenarioStartTime, setScenarioStartTime] = useState(0);
  const [currentScenarios, setCurrentScenarios] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Game state
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [discoveredClues, setDiscoveredClues] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore(difficulty, correctAnswers, wrongAnswers);
    setScore(newScore);
  }, [difficulty, correctAnswers, wrongAnswers]);

  // Handle clue discovery
  const handleClueDiscovery = useCallback((clueType) => {
    if (!discoveredClues.includes(clueType)) {
      setDiscoveredClues(prev => [...prev, clueType]);
    }
  }, [discoveredClues]);

  // Handle country selection
  const handleCountrySelect = useCallback((countryName) => {
    if (gameState !== 'playing' || showFeedback || !currentScenarios[currentScenario]) return;

    const responseTime = Date.now() - scenarioStartTime;
    const currentScenarioData = currentScenarios[currentScenario];
    const isCorrect = countryName === currentScenarioData.correctAnswer;

    setSelectedCountry(countryName);
    setShowFeedback(true);
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    if (isCorrect) {
      setFeedbackType('correct');
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });

      setTimeout(() => {
        if (currentScenario + 1 >= currentScenarios.length) {
          setGameState('finished');
        } else {
          setCurrentScenario(prev => prev + 1);
          setSelectedCountry(null);
          setDiscoveredClues([]);
          setShowFeedback(false);
          setScenarioStartTime(Date.now());
        }
      }, 2500);
    } else {
      setFeedbackType('incorrect');
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            setGameState('finished');
          }, 2000);
        }
        return Math.max(0, newLives);
      });

      setTimeout(() => {
        if (lives > 1) {
          setShowFeedback(false);
          setSelectedCountry(null);
        }
      }, 2500);
    }
  }, [gameState, showFeedback, currentScenario, scenarioStartTime, lives, currentScenarios]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentScenarios[currentScenario]) return;

    setHintsUsed(prev => prev + 1);
    
    const currentScenarioData = currentScenarios[currentScenario];
    const correctCountry = currentScenarioData.correctAnswer;
    
    // Find an undiscovered clue
    const clueTypes = ['flag', 'food', 'clothing', 'currency'];
    const undiscoveredClues = clueTypes.filter(clueType => !discoveredClues.includes(clueType));

    if (undiscoveredClues.length > 0) {
      const hintClue = undiscoveredClues[0];
      setDiscoveredClues(prev => [...prev, hintClue]);
      setHintMessage(`Check the traveler's ${hintClue} - it contains important evidence about ${correctCountry}!`);
    } else {
      setHintMessage(`This traveler is from ${correctCountry} - look at all the cultural evidence!`);
    }

    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 4000);
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
    const scenarios = getScenariosByDifficulty(difficulty);
    
    setCurrentScenarios(scenarios);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentScenario(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
    setSelectedCountry(null);
    setDiscoveredClues([]);
    setShowFeedback(false);
    setShowHint(false);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setScenarioStartTime(Date.now());
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Borderline Brains Game completed:', payload);
  };

  const customStats = {
    currentScenario: currentScenario + 1,
    totalScenarios: currentScenarios.length,
    streak: maxStreak,
    lives,
    hintsUsed,
    correctAnswers,
    wrongAnswers,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    cluesDiscovered: discoveredClues.length
  };

  const currentScenarioData = currentScenarios[currentScenario] || currentScenarios[0];

  const getClueIcon = (clueType) => {
    switch (clueType) {
      case 'flag': return <Flag className="h-3 w-3" />;
      case 'food': return <UtensilsCrossed className="h-3 w-3" />;
      case 'clothing': return <Shirt className="h-3 w-3" />;
      case 'currency': return <Coins className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const getCountryFlag = (country) => {
    const flagMap = {
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'France': '🇫🇷',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'Germany': '🇩🇪',
      'Austria': '🇦🇹',
      'Netherlands': '🇳🇱',
      'Portugal': '🇵🇹',
      'Mexico': '🇲🇽',
      'Egypt': '🇪🇬',
      'Morocco': '🇲🇦',
      'Tunisia': '🇹🇳',
      'India': '🇮🇳',
      'Pakistan': '🇵🇰',
      'Bangladesh': '🇧🇩',
      'United Kingdom': '🇬🇧',
      'Ireland': '🇮🇪',
      'Australia': '🇦🇺',
      'Belgium': '🇧🇪',
      'Switzerland': '🇨🇭',
      'Slovenia': '🇸🇮',
      'Russia': '🇷🇺',
      'Ukraine': '🇺🇦',
      'Belarus': '🇧🇾',
      'North Korea': '🇰🇵',
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷',
      'Colombia': '🇨🇴',
      'Saudi Arabia': '🇸🇦',
      'UAE': '🇦🇪',
      'Qatar': '🇶🇦',
      'Norway': '🇳🇴',
      'Sweden': '🇸🇪',
      'Finland': '🇫🇮',
      'Ethiopia': '🇪🇹',
      'Kenya': '🇰🇪',
      'Uganda': '🇺🇬',
      'Myanmar': '🇲🇲',
      'Poland': '🇵🇱',
      'Czech Republic': '🇨🇿'
    };
    return flagMap[country] || '🌍';
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="🌍 Borderline Brains"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Borderline Brains
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Toggle Content */}
              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🛂 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      You're a customs officer! Examine travelers' belongings to identify their country of origin from visual clues.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔍 Investigation
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Examine flag patches and symbols</li>
                      <li>• Check for traditional food evidence</li>
                      <li>• Inspect clothing and cultural items</li>
                      <li>• Look for currency clues</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: +25 correct, -10 wrong</li>
                      <li>• Moderate: +40 correct, -20 wrong</li>
                      <li>• Hard: +50 correct, -25 wrong</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      ✈️ Travelers
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 travelers to process</li>
                      <li>• Moderate: 5 travelers to process</li>
                      <li>• Hard: 4 travelers to process</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Critical Thinking"
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
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Traveler
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentScenario + 1}/{difficultySettings[difficulty].questionCount}
              </div>
            </div>
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
                Clues Found
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {discoveredClues.length}/4
              </div>
            </div>
          </div>

          {/* Scenario Header */}
          {currentScenarioData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Plane className="h-5 w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Customs Control - Traveler #{currentScenario + 1} ({difficulty} Level)
                  </span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Where is this traveler from?
                </h3>
                <p className="text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  Examine their belongings for clues about their country of origin. Look for cultural evidence!
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
                    Customs Hint:
                  </span>
                </div>
                <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {hintMessage}
                </p>
              </div>
            </div>
          )}

          {/* Traveler Card */}
          {currentScenarioData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
                {/* Traveler Header */}
                <div className="text-center mb-6">
                  <div className="text-8xl mb-4">{currentScenarioData.traveler.emoji}</div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentScenarioData.traveler.name}
                  </h4>
                  <p className="text-lg text-gray-600 italic" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    "{currentScenarioData.traveler.statement}"
                  </p>
                </div>

                {/* Clue Investigation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(currentScenarioData.traveler.clues).map(([clueType, clue]) => {
                    const isDiscovered = discoveredClues.includes(clueType);
                    
                    return (
                      <button
                        key={clueType}
                        onClick={() => handleClueDiscovery(clueType)}
                        disabled={showFeedback}
                        className={`p-4 rounded border transition-colors ${
                          isDiscovered
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {getClueIcon(clueType)}
                          <span className="capitalize font-medium text-sm">{clueType}</span>
                        </div>
                        {isDiscovered ? (
                          <div className="text-xs mt-2 font-medium">
                            {clue.evidence}
                          </div>
                        ) : (
                          <div className="text-xs mt-2 text-gray-500">
                            Click to examine
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Country Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentScenarioData.countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      disabled={showFeedback}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        selectedCountry === country
                          ? country === currentScenarioData.correctAnswer
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-red-500 bg-red-50 text-red-800'
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                      } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl">{getCountryFlag(country)}</span>
                        <span className="font-semibold text-lg">{country}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentScenarioData && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg ${
              feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Customs Approved! ✅' : 'Further Investigation Needed! ❌'}
                </div>
              </div>
              <div className="text-sm mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {currentScenarioData.explanation}
              </div>
              {feedbackType === 'correct' && (
                <div className="text-green-700 font-medium mb-2">
                  +{difficultySettings[difficulty].pointsPerQuestion} points earned!
                </div>
              )}
              {feedbackType === 'incorrect' && (
                <div className="text-red-700 font-medium mb-2">
                  -{difficultySettings[difficulty].penalty} points lost
                </div>
              )}
              {feedbackType === 'correct' && currentScenario + 1 < currentScenarios.length && (
                <p className="text-green-700 font-medium">
                  Processing next traveler...
                </p>
              )}
              {feedbackType === 'incorrect' && lives > 1 && (
                <p className="text-red-700 font-medium">
                  Lives remaining: {lives - 1}
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              🛂 Click on clue categories (Flag, Food, Clothing, Currency) to examine evidence.
              Look for cultural indicators that reveal the traveler's country of origin.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].questionCount} travelers | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              +{difficultySettings[difficulty].pointsPerQuestion}/-{difficultySettings[difficulty].penalty} points
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

export default BorderlineBrainsGame;