import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { 
  difficultySettings, 
  getScenariosByDifficulty, 
  calculateScore, 
  generateFish, 
  validateCatch,
  fishTypes 
} from '../../utils/games/FishermansCatch';
import { 
  Fish, 
  Anchor, 
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
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [correctCatches, setCorrectCatches] = useState(0);
  const [wrongCatches, setWrongCatches] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(2);
  const [currentScenarios, setCurrentScenarios] = useState([]);
  
  // Game state
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

  // Update score whenever catches change
  useEffect(() => {
    const newScore = calculateScore(difficulty, correctCatches, wrongCatches);
    setScore(newScore);
  }, [difficulty, correctCatches, wrongCatches]);

  // Animation loop for fish movement
  const animate = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const currentTime = Date.now();
    
    setFish(prevFish => {
      return prevFish
        .map(f => ({
          ...f,
          x: f.x + f.speed
        }))
        .filter(f => f.x < 800 && !f.caught); // Remove fish that swam off screen or were caught
    });
    
    // Spawn new fish periodically
    if (currentTime - lastFishSpawnRef.current > 2000 + Math.random() * 3000) {
      lastFishSpawnRef.current = currentTime;
      const currentScenarioData = currentScenarios[currentScenario];
      if (currentScenarioData) {
        const newFish = generateFish(currentScenarioData, currentTime, difficulty);
        setFish(prevFish => [...prevFish, ...newFish.slice(0, 2)]); // Add 1-2 fish at a time
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

  // Handle fish catching
  const handleFishClick = useCallback((clickedFish) => {
    if (gameState !== 'playing' || clickedFish.caught || isNetCasting) return;
    
    const currentScenarioData = currentScenarios[currentScenario];
    if (!currentScenarioData) return;
    
    // Cast net animation
    setIsNetCasting(true);
    setNetPosition({ x: clickedFish.x, y: clickedFish.y });
    
    setTimeout(() => {
      setIsNetCasting(false);
      
      // Mark fish as caught
      setFish(prevFish => 
        prevFish.map(f => f.id === clickedFish.id ? { ...f, caught: true } : f)
      );
      
      // Validate catch
      const validation = validateCatch(clickedFish, currentScenarioData, catchSequence);
      
      if (validation.valid) {
        setCorrectCatches(prev => prev + 1);
        setCatchSequence(prev => [...prev, clickedFish]);
        setFeedbackType('success');
        setFeedbackMessage(validation.reason);
        
        // Check if scenario is complete
        const settings = difficultySettings[difficulty];
        if (correctCatches + 1 >= settings.catchesNeeded) {
          setTimeout(() => {
            if (currentScenario + 1 >= currentScenarios.length) {
              setGameState('finished');
              setShowCompletionModal(true);
            } else {
              nextScenario();
            }
          }, 1500);
        }
      } else {
        setWrongCatches(prev => prev + 1);
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

  // Scenario timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && scenarioTimeRemaining > 0) {
      interval = setInterval(() => {
        setScenarioTimeRemaining(prev => {
          if (prev <= 1) {
            nextScenario();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, scenarioTimeRemaining]);

  // Main timer
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

  // Next scenario
  const nextScenario = () => {
    if (currentScenario + 1 >= currentScenarios.length) {
      setGameState('finished');
      setShowCompletionModal(true);
      return;
    }
    
    setCurrentScenario(prev => prev + 1);
    setFish([]);
    setCatchSequence([]);
    setCorrectCatches(0);
    setWrongCatches(0);
    
    const nextScenarioData = currentScenarios[currentScenario + 1];
    if (nextScenarioData) {
      setScenarioTimeRemaining(nextScenarioData.duration);
      setScenarioStartTime(Date.now());
    }
  };

  // Use hint
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

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const scenarios = getScenariosByDifficulty(difficulty);
    
    setCurrentScenarios(scenarios);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentScenario(0);
    setCorrectCatches(0);
    setWrongCatches(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setFish([]);
    setCatchSequence([]);
    setShowFeedback(false);
    
    if (scenarios[0]) {
      setScenarioTimeRemaining(scenarios[0].duration);
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
    totalScenarios: currentScenarios.length,
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
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="🎣 Fisherman's Catch"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
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

              {/* Toggle Content */}
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
        category="Quick Reflexes"
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

          {/* Game Stats */}
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

          {/* Current Scenario Instruction */}
          {currentScenarioData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Scenario {currentScenario + 1} - {difficulty} Level
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

          {/* Fishing Area */}
          <div className="relative w-full max-w-5xl h-96 bg-gradient-to-b from-blue-200 to-blue-400 rounded-lg overflow-hidden border-4 border-blue-300 mb-6">
            {/* Water waves background */}
            <div className="absolute inset-0 opacity-20">
              <Waves className="h-full w-full text-blue-600" />
            </div>
            
            {/* Boat */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl">
              🚣‍♂️
            </div>
            
            {/* Fishing Area */}
            <div 
              ref={gameAreaRef}
              className="relative w-full h-full cursor-crosshair"
              style={{ background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.5))' }}
            >
              {/* Fish */}
              {fish.map((fishItem) => (
                <div
                  key={fishItem.id}
                  className={`absolute transition-all duration-300 cursor-pointer hover:scale-110 ${
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
                    <span className="text-2xl">{fishItem.emoji}</span>
                    {fishItem.isBad && (
                      <div className="absolute -top-1 -right-1 text-red-500 text-xs">⚠️</div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Net casting animation */}
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

          {/* Feedback */}
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

          {/* Instructions */}
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
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
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