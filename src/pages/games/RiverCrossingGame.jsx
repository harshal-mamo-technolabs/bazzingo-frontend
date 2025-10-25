import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { difficultySettings, getScenariosByDifficulty, calculateScore } from '../../utils/games/RiverCrossing';
import { Waves, Lightbulb, CheckCircle, XCircle, ArrowRight, Users, ChevronUp, ChevronDown, Navigation } from 'lucide-react';

const RiverCrossingGame = () => {
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
  const [selectedMove, setSelectedMove] = useState(null);
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

  // Handle move selection
  const handleMoveSelect = useCallback((moveId) => {
    if (gameState !== 'playing' || showFeedback || !currentScenarios[currentScenario]) return;

    const responseTime = Date.now() - scenarioStartTime;
    const currentScenarioData = currentScenarios[currentScenario];
    const isCorrect = moveId === currentScenarioData.correctMove;

    setSelectedMove(moveId);
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
          setSelectedMove(null);
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
          setSelectedMove(null);
        }
      }, 2500);
    }
  }, [gameState, showFeedback, currentScenario, scenarioStartTime, lives, currentScenarios]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentScenarios[currentScenario]) return;

    setHintsUsed(prev => prev + 1);
    
    const currentScenarioData = currentScenarios[currentScenario];
    setHintMessage(currentScenarioData.hint);

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
    setSelectedMove(null);
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
    console.log('River Crossing Game completed:', payload);
  };

  const customStats = {
    currentScenario: currentScenario + 1,
    totalScenarios: currentScenarios.length,
    streak: maxStreak,
    lives,
    hintsUsed,
    solvedScenarios,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0
  };

  const currentScenarioData = currentScenarios[currentScenario] || currentScenarios[0];

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}

      <GameFramework
        gameTitle="River Crossing Challenge"
        gameShortDescription="Help villagers, animals, or goods cross a river on a raft following specific rules and constraints."
        gameDescription={
          <div className="mx-auto px-1 mb-2">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play River Crossing Challenge
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
                      🚤 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Help villagers, animals, or goods cross a river on a raft following specific rules and constraints.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🧩 Strategy
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Read the crossing rules carefully</li>
                      <li>• Plan your moves step by step</li>
                      <li>• Choose who crosses first wisely</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 25 points per correct answer</li>
                      <li>• Medium: 40 points per correct answer</li>
                      <li>• Hard: 50 points per correct answer</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📝 Questions
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 different puzzles</li>
                      <li>• Medium: 5 different puzzles</li>
                      <li>• Hard: 4 different puzzles</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Gameacy"
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
                Puzzle
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
                Solved
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {solvedScenarios}
              </div>
            </div>
          </div>

          {/* Scenario Question */}
          {currentScenarioData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Waves className="h-5 w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    River Crossing #{currentScenario + 1} - {difficulty} Level
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

          {/* Rules Display */}
          {currentScenarioData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Crossing Rules:
                  </span>
                </div>
                <ul className="text-yellow-700 text-sm space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentScenarioData.rules.map((rule, index) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
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

          {/* River Visualization */}
          {currentScenarioData && (
            <div className="w-full max-w-6xl mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-6">
                {/* Left Side - Characters to Cross */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-green-100 rounded-lg p-4">
                    <h4 className="text-center font-semibold text-green-800 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🏠 Starting Side
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {currentScenarioData.characters.map((character) => (
                        <div key={character.id} className="text-center bg-white rounded-lg p-3">
                          <div className="text-3xl mb-1">{character.emoji}</div>
                          <div className="text-xs font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {character.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* River */}
                  <div className="bg-blue-300 rounded-lg p-4 flex flex-col items-center justify-center">
                    <Waves className="h-12 w-12 text-blue-600 mb-2" />
                    <h4 className="text-center font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🌊 River
                    </h4>
                    <div className="text-center text-blue-700 text-sm mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Only {currentScenarioData.raftCapacity || 2} can cross at once
                    </div>
                  </div>

                  {/* Right Side - Destination */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h4 className="text-center font-semibold text-purple-800 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Destination
                    </h4>
                    <div className="text-center text-gray-500 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Everyone needs to get here safely
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Move Options */}
          {currentScenarioData && !showFeedback && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <h4 className="text-center font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Who should cross the river first?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentScenarioData.moves.map((move) => (
                    <button
                      key={move.id}
                      onClick={() => handleMoveSelect(move.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                        selectedMove === move.id
                          ? 'border-[#FF6B3E] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{move.emoji}</div>
                        <div>
                          <div className="font-medium text-gray-900">{move.description}</div>
                          <div className="text-sm text-gray-600">{move.reasoning}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
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
                  {feedbackType === 'correct' ? 'Great Strategy!' : 'Wrong Move!'}
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
                  Moving to next puzzle...
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
              Read the crossing rules carefully and choose the best first move.
              Consider what happens when certain characters are left alone together.
              Use hints wisely when you're stuck on a tricky puzzle.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].questionCount} puzzles | 
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

export default RiverCrossingGame;