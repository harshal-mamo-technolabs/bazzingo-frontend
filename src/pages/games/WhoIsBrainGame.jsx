import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { difficultySettings, getScenariosByDifficulty, calculateScore } from '../../utils/games/WhoIsBrain';
import { Eye, Lightbulb, CheckCircle, XCircle, Lock, Unlock, Search, ChevronUp, ChevronDown, Users } from 'lucide-react';

const WhoIsBrainGame = () => {
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
  const [solvedScenarios, setSolvedScenarios] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [scenarioStartTime, setScenarioStartTime] = useState(0);
  const [currentScenarios, setCurrentScenarios] = useState([]);

  // Game state
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [discoveredClues, setDiscoveredClues] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);


  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore(difficulty, solvedScenarios);
    setScore(newScore);
  }, [difficulty, solvedScenarios]);

  // Handle clue discovery
  const handleClueDiscovery = useCallback((characterId, clueType) => {
    const clueKey = `${characterId}-${clueType}`;
    if (!discoveredClues.includes(clueKey)) {
      setDiscoveredClues(prev => [...prev, clueKey]);
    }
  }, [discoveredClues]);

  // Handle character selection
  const handleCharacterSelect = useCallback((characterId) => {
    if (gameState !== 'playing' || showFeedback || !currentScenarios[currentScenario]) return;

    const responseTime = Date.now() - scenarioStartTime;
    const currentScenarioData = currentScenarios[currentScenario];
    const isCorrect = characterId === currentScenarioData.correctAnswer;

    setSelectedCharacter(characterId);
    setShowFeedback(true);
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    if (isCorrect) {
      setFeedbackType('correct');
      setSolvedScenarios(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });

      setTimeout(() => {
        if (currentScenario + 1 >= currentScenarios.length) {
          setGameState('finished');
          setShowCompletionModal(true);
        } else {
          setCurrentScenario(prev => prev + 1);
          setSelectedCharacter(null);
          setDiscoveredClues([]);
          setShowFeedback(false);
          setScenarioStartTime(Date.now());
        }
      }, 2500);
    } else {
      setFeedbackType('incorrect');
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            setGameState('finished');
            setShowCompletionModal(true);
          }, 2000);
        }
        return Math.max(0, newLives);
      });

      setTimeout(() => {
        if (lives > 1) {
          setShowFeedback(false);
          setSelectedCharacter(null);
        }
      }, 2500);
    }
  }, [gameState, showFeedback, currentScenario, scenarioStartTime, lives, currentScenarios]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentScenarios[currentScenario]) return;

    setHintsUsed(prev => prev + 1);
    
    const currentScenarioData = currentScenarios[currentScenario];
    const correctCharacter = currentScenarioData.characters.find(char => char.isCorrect);
    
    if (correctCharacter) {
      // Find a suspicious clue that hasn't been discovered
      const suspiciousClues = Object.entries(correctCharacter.clues)
        .filter(([clueType, clue]) => {
          const clueKey = `${correctCharacter.id}-${clueType}`;
          return clue.suspicious && !discoveredClues.includes(clueKey);
        });

      if (suspiciousClues.length > 0) {
        const [clueType] = suspiciousClues[0];
        const clueKey = `${correctCharacter.id}-${clueType}`;
        setDiscoveredClues(prev => [...prev, clueKey]);
        setHintMessage(`Check ${correctCharacter.name}'s ${clueType} - there's something suspicious there!`);
      } else {
        setHintMessage(`Focus on ${correctCharacter.name} - they show signs of deception.`);
      }
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
    setSolvedScenarios(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
    setSelectedCharacter(null);
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
    console.log('Who Is Brain Game completed:', payload);
  };

  const customStats = {
    currentScenario: currentScenario + 1,
    totalScenarios: currentScenarios.length,
    streak: maxStreak,
    lives,
    hintsUsed,
    solvedScenarios,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    cluesDiscovered: discoveredClues.length
  };

  const currentScenarioData = currentScenarios[currentScenario] || currentScenarios[0];

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Who Is? Brain Game"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Who Is? Brain Game
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
                      🕵️ Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Analyze characters and discover clues to identify who is lying, stealing, or guilty in each scenario.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔍 Investigation
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Click on body parts to examine clues</li>
                      <li>• Look for suspicious evidence</li>
                      <li>• Compare statements to evidence</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 25 points per correct answer</li>
                      <li>• Moderate: 28 points per correct answer</li>
                      <li>• Hard: 40 points per correct answer</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📝 Questions
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 different questions</li>
                      <li>• Moderate: 7 different questions</li>
                      <li>• Hard: 5 different questions</li>
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
                Question
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
                {discoveredClues.length}
              </div>
            </div>
          </div>

          {/* Scenario Question */}
          {currentScenarioData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Search className="h-5 w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Mystery #{currentScenario + 1} - {difficulty} Level
                  </span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentScenarioData.question}
                </h3>
                <p className="text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentScenarioData.description}
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

          {/* Characters */}
          {currentScenarioData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-6">
              {currentScenarioData.characters.map((character) => (
                <div
                  key={character.id}
                  className={`bg-white border-2 rounded-lg p-6 transition-all duration-300 ${
                    selectedCharacter === character.id
                      ? character.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${showFeedback ? 'pointer-events-none' : 'cursor-pointer hover:shadow-lg'}`}
                  //onClick={() => handleCharacterSelect(character.id)}
                >
                  {/* Character Header */}
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{character.emoji}</div>
                    <h4 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {character.name}
                    </h4>
                    <p className="text-sm text-gray-600 italic mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      "{character.statement}"
                    </p>
                  </div>

                  {/* Clue Investigation */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(character.clues).map(([clueType, clue]) => {
                      const clueKey = `${character.id}-${clueType}`;
                      const isDiscovered = discoveredClues.includes(clueKey);
                      
                      return (
                        <button
                          key={clueType}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClueDiscovery(character.id, clueType);
                          }}
                          disabled={showFeedback}
                          className={`p-2 rounded border text-xs transition-colors ${
                            isDiscovered
                              ? clue.suspicious
                                ? 'bg-red-100 border-red-300 text-red-800'
                                : 'bg-green-100 border-green-300 text-green-800'
                              : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                          }`}
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Eye className="h-3 w-3" />
                            <span className="capitalize font-medium">{clueType}</span>
                          </div>
                          {isDiscovered && (
                            <div className="text-xs mt-1">
                              {clue.evidence}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selection Button */}
                  {!showFeedback && (
                    <button
                      onClick={() => handleCharacterSelect(character.id)}
                      className="w-full mt-4 bg-[#FF6B3E] text-white py-2 rounded-lg hover:bg-[#e55a35] transition-colors font-medium"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Select {character.name}
                    </button>
                  )}
                </div>
              ))}
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
                  {feedbackType === 'correct' ? 'Correct!' : 'Wrong Choice!'}
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
              {feedbackType === 'correct' && currentScenario + 1 < currentScenarios.length && (
                <p className="text-green-700 font-medium">
                  Moving to next scenario...
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
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Click on character body parts (hands, face, clothes, behavior) to discover clues.
              Look for suspicious evidence that contradicts their statements.
              Use hints wisely to reveal important clues when you're stuck.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].questionCount} questions | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              {difficultySettings[difficulty].pointsPerQuestion} points per correct answer
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

export default WhoIsBrainGame;