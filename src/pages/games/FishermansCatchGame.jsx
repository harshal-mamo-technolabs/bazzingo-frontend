import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import {
  difficultySettings,
  getScenariosByDifficulty,
  calculateScore,
  generateFish,
  validateCatch
} from '../../utils/games/FishermansCatch';
import {
  Fish,
  Waves,
  Target,
  CheckCircle,
  XCircle,
  Lightbulb,
  ChevronUp,
  ChevronDown,
  Timer
} from 'lucide-react';

const FishermansCatchGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(160);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [correctCatches, setCorrectCatches] = useState(0);
  const [wrongCatches, setWrongCatches] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(2);
  const [currentScenarios, setCurrentScenarios] = useState([]);

  const [fish, setFish] = useState([]);
  const [catchSequence, setCatchSequence] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [scenarioStartTime, setScenarioStartTime] = useState(0);
  const [scenarioTimeRemaining, setScenarioTimeRemaining] = useState(0);
  const [isNetCasting, setIsNetCasting] = useState(false);
  const [netPosition, setNetPosition] = useState({ x: 0, y: 0 });

  const gameAreaRef = useRef();
  const animationRef = useRef();
  const lastFishSpawnRef = useRef(0);

  useEffect(() => {
    const newScore = calculateScore(difficulty, totalCorrect, totalWrong);
    setScore(newScore);
  }, [difficulty, totalCorrect, totalWrong]);

  useEffect(() => {
    if (gameState === 'playing' && score >= 200) {
      setGameState('finished');
      setShowCompletionModal(true);
    }
  }, [score, gameState]);

  const animate = useCallback(() => {
    if (gameState !== 'playing') return;
    const currentTime = Date.now();

    setFish(prevFish => {
      const containerWidth = gameAreaRef.current?.clientWidth || 800;
      return prevFish
        .map(f => ({
          ...f,
          x: f.x - f.speed
        }))
        .filter(f => f.x > -40 && !f.caught);
    });

    const sinceLast = currentTime - lastFishSpawnRef.current;
    const spawnInterval = 1200 + Math.random() * 2000;
    const needSpawn = sinceLast > spawnInterval;

    if (needSpawn) {
      lastFishSpawnRef.current = currentTime;
      const currentScenarioData = currentScenarios[currentScenario];
      if (currentScenarioData) {
        const newFish = generateFish(currentScenarioData, currentTime, difficulty);
        setFish(prevFish => {
          const containerWidth = gameAreaRef.current?.clientWidth || 800;
          const batch = newFish.slice(0, 3).map(f => ({ ...f, x: containerWidth + 40 }));
          return [...prevFish, ...batch];
        });
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [gameState, currentScenario, currentScenarios, difficulty]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, gameState]);

  const handleFishClick = useCallback((clickedFish) => {
    if (gameState !== 'playing' || clickedFish.caught || isNetCasting) return;

    const currentScenarioData = currentScenarios[currentScenario];
    if (!currentScenarioData) return;

    setIsNetCasting(true);
    setNetPosition({ x: clickedFish.x, y: clickedFish.y });

    setTimeout(() => {
      setIsNetCasting(false);

      setFish(prevFish =>
        prevFish.map(f => f.id === clickedFish.id ? { ...f, caught: true } : f)
      );

      const validation = validateCatch(clickedFish, currentScenarioData, catchSequence);

      if (validation.valid) {
        setCorrectCatches(prev => prev + 1);
        setTotalCorrect(prev => prev + 1);
        setCatchSequence(prev => [...prev, clickedFish]);
        setFeedbackType('success');
        setFeedbackMessage(validation.reason);

        const settings = difficultySettings[difficulty];
        if (correctCatches + 1 >= settings.catchesNeeded) {
          setTimeout(() => {
            if (currentScenario + 1 >= 4) {
              setGameState('finished');
              setShowCompletionModal(true);
            } else {
              nextScenario();
            }
          }, 1500);
        }
      } else {
        setWrongCatches(prev => prev + 1);
        setTotalWrong(prev => prev + 1);
        setFeedbackType('error');
        setFeedbackMessage(validation.reason);

        if (clickedFish.isBad) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setTimeout(() => {
                setGameState('finished');
                setShowCompletionModal(true);
              }, 1500);
            }
            return Math.max(0, newLives);
          });
        }
      }

      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);

    }, 300);
  }, [gameState, currentScenario, currentScenarios, difficulty, catchSequence, correctCatches, isNetCasting]);

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && scenarioTimeRemaining > 0) {
      interval = setInterval(() => {
        setScenarioTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            const nextIndex = currentScenario + 1;
            if (nextIndex >= 4) {
              setGameState('finished');
              setShowCompletionModal(true);
            } else {
              setCurrentScenario(nextIndex);
              setFish([]);
              setCatchSequence([]);
              setCorrectCatches(0);
              setWrongCatches(0);
              const settings = difficultySettings[difficulty];
              setScenarioTimeRemaining(settings.scenarioTime);
              setScenarioStartTime(Date.now());
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, scenarioTimeRemaining, currentScenario, difficulty]);

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

  const nextScenario = () => {
    const nextIndex = currentScenario + 1;
    if (nextIndex >= 4) {
      setGameState('finished');
      setShowCompletionModal(true);
      return;
    }

    const settings = difficultySettings[difficulty];
    setCurrentScenario(nextIndex);
    setFish([]);
    setCatchSequence([]);
    setCorrectCatches(0);
    setWrongCatches(0);
    setScenarioTimeRemaining(settings.scenarioTime);
    setScenarioStartTime(Date.now());
  };

  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;

    setHintsUsed(prev => prev + 1);

    const currentScenarioData = currentScenarios[currentScenario];
    if (currentScenarioData) {
      let hintMessage = '';
      if (currentScenarioData.target.color && !Array.isArray(currentScenarioData.target.color)) {
        hintMessage = `Look for ${currentScenarioData.target.color} colored fish!`;
      } else if (currentScenarioData.target.size && !Array.isArray(currentScenarioData.target.size)) {
        hintMessage = `Focus on ${currentScenarioData.target.size} sized fish!`;
      } else {
        hintMessage = 'Read the instruction carefully and avoid sharks and junk!';
      }

      setFeedbackType('hint');
      setFeedbackMessage(`💡 Hint: ${hintMessage}`);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  };

  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const scenarios = getScenariosByDifficulty(difficulty);

    setCurrentScenarios(scenarios);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentScenario(0);
    setCorrectCatches(0);
    setWrongCatches(0);
    setTotalCorrect(0);
    setTotalWrong(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setFish([]);
    setCatchSequence([]);
    setShowFeedback(false);

    if (scenarios[0]) {
      setScenarioTimeRemaining(settings.scenarioTime);
    }
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setScenarioStartTime(Date.now());
    lastFishSpawnRef.current = Date.now();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Fisherman\'s Catch Game completed:', payload);
  };

  const customStats = {
    currentScenario: currentScenario + 1,
    totalScenarios: 4,
    correctCatches,
    wrongCatches,
    lives,
    hintsUsed,
    catchSequence: catchSequence.length,
    accuracy: correctCatches + wrongCatches > 0 ? Math.round((correctCatches / (correctCatches + wrongCatches)) * 100) : 0
  };

  const currentScenarioData = currentScenarios[currentScenario] || currentScenarios[0];

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}
      <GameFramework
        gameTitle="🎣 Fisherman's Catch"
        gameShortDescription="Catch fish while avoiding obstacles. Challenge your timing and strategic thinking skills!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Fisherman's Catch
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎣 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Catch only the correct fish while avoiding sharks, boots, and junk items swimming by.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎮 Gameplay
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Click on fish to cast your net</li>
                      <li>• Follow the specific instructions</li>
                      <li>• Avoid dangerous sharks and junk</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 catches, +25/-10 points</li>
                      <li>• Moderate: 5 catches, +40/-20 points</li>
                      <li>• Hard: 4 catches, +50/-25 points</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      ⚡ Strategy
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Read instructions carefully</li>
                      <li>• Watch fish colors and sizes</li>
                      <li>• Use hints when stuck</li>
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
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {gameState === 'playing' && (
              <button
                onClick={useHint}
                disabled={hintsUsed >= maxHints}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  hintsUsed >= maxHints
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

          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Caught
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {correctCatches}/{difficultySettings[difficulty].catchesNeeded}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Lives
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'💖'.repeat(lives)}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.accuracy}%
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Scenario Time
              </div>
              <div className={`text-lg font-semibold ${scenarioTimeRemaining <= 5 ? 'text-red-600' : 'text-purple-600'}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                {scenarioTimeRemaining}s
              </div>
            </div>
          </div>

          {currentScenarioData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Scenario {currentScenario + 1} of 4 - {difficulty} Level
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentScenarioData.instruction}
                </h3>
                <p className="text-blue-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentScenarioData.description}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-blue-600">
                  <span className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {scenarioTimeRemaining}s remaining
                  </span>
                  <span className="flex items-center gap-1">
                    <Fish className="h-4 w-4" />
                    {correctCatches}/{difficultySettings[difficulty].catchesNeeded} needed
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="relative w-full max-w-5xl h-96 bg-gradient-to-b from-blue-200 to-blue-400 rounded-lg overflow-hidden border-4 border-blue-300 mb-6">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Waves className="h-full w-full text-blue-700" />
            </div>

            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl">
              🚣‍♂️
            </div>

            <div
              ref={gameAreaRef}
              className="relative w-full h-full cursor-crosshair"
              style={{ background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.5))' }}
            >
              {fish.map((fishItem) => (
                <div
                  key={fishItem.id}
                  className={`absolute transition-transform duration-300 cursor-pointer hover:scale-110 ${
                    fishItem.caught ? 'opacity-0' : ''
                  }`}
                  style={{
                    left: `${fishItem.x}px`,
                    top: `${fishItem.y}px`,
                    transform: `scale(${fishItem.scale})`,
                    zIndex: fishItem.isBad ? 10 : 5
                  }}
                  onClick={() => handleFishClick(fishItem)}
                >
                  <div className="relative">
                    <span className="text-3xl drop-shadow-sm">{fishItem.emoji}</span>
                    {fishItem.isBad && (
                      <div className="absolute -top-1 -right-1 text-red-500 text-xs">⚠️</div>
                    )}
                  </div>
                </div>
              ))}

              {isNetCasting && (
                <div
                  className="absolute pointer-events-none animate-ping"
                  style={{
                    left: `${netPosition.x - 15}px`,
                    top: `${netPosition.y - 15}px`,
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-400 opacity-75 flex items-center justify-center">
                    🕸️
                  </div>
                </div>
              )}
            </div>
          </div>

          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-4 rounded-lg mb-4 ${
              feedbackType === 'success' ? 'bg-green-100 text-green-800' :
              feedbackType === 'error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : feedbackType === 'error' ? (
                  <XCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                )}
                <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackMessage}
                </div>
              </div>
            </div>
          )}

          <div className="text-center max-w-3xl">
            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Click on the fish swimming by to cast your net. Follow the scenario instructions carefully.
              Watch out for sharks 🦈, boots 🥾, and other junk that will cost you points and lives!
            </p>
            <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <div>🐠 Small Fish</div>
              <div>🐟 Medium Fish</div>
              <div>🐡 Large Fish</div>
              <div>⚠️ Dangerous Items</div>
            </div>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].catchesNeeded} catches needed |
              {difficultySettings[difficulty].timeLimit}s total time (4 scenarios × {difficultySettings[difficulty].scenarioTime}s each) |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              +{difficultySettings[difficulty].pointsPerCorrect}/{difficultySettings[difficulty].pointsPerWrong} points
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

export default FishermansCatchGame;
