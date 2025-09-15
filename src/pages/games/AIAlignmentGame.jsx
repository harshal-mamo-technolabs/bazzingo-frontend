import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { 
  difficultySettings, 
  getScenariosByDifficulty, 
  calculateScore,
  trainingCards,
  evaluateDecision,
  calculateScenarioPoints
} from '../../utils/games/AIAlignmentLab';
import { 
  Brain, 
  Sliders, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Zap,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const AIAlignmentLabGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const [retries, setRetries] = useState(0);
  const [maxRetries, setMaxRetries] = useState(2);
  const [scenarioStartTime, setScenarioStartTime] = useState(0);
  const [currentScenarios, setCurrentScenarios] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  // Game state
  const [selectedCards, setSelectedCards] = useState([]);
  const [sliderValues, setSliderValues] = useState({
    riskAversion: 50,
    timeSensitivity: 50,
    humanCentricity: 50
  });
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Update total score
  useEffect(() => {
    setScore(Math.min(200, totalScore));
  }, [totalScore]);

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

  // Handle training card selection
  const handleCardSelect = (cardId) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    } else if (selectedCards.length < 2) {
      setSelectedCards(prev => [...prev, cardId]);
    }
  };

  // Handle slider change
  const handleSliderChange = (slider, value) => {
    setSliderValues(prev => ({
      ...prev,
      [slider]: parseInt(value)
    }));
  };

  // Simulate AI decision
  const handleSimulate = async () => {
    if (selectedCards.length === 0) return;
    
    setIsSimulating(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenario = currentScenarios[currentScenario];
    const responseTime = Date.now() - scenarioStartTime;
    const result = evaluateDecision(scenario, selectedCards, sliderValues);
    const points = calculateScenarioPoints(scenario, result, responseTime, retries);
    
    setCurrentResult({ ...result, points, responseTime });
    setShowResult(true);
    setTotalScore(prev => prev + points);
    setIsSimulating(false);

    // Auto-advance after showing result
    setTimeout(() => {
      if (result.score === 'excellent' || retries >= maxRetries) {
        if (currentScenario + 1 >= currentScenarios.length) {
          setGameState('finished');
          setShowCompletionModal(true);
        } else {
          // Move to next scenario
          setCurrentScenario(prev => prev + 1);
          setScenariosCompleted(prev => prev + 1);
          setRetries(0);
          resetScenarioState();
        }
      } else {
        // Allow retry
        setRetries(prev => prev + 1);
        setShowResult(false);
      }
    }, 3000);
  };

  // Reset scenario state
  const resetScenarioState = () => {
    setSelectedCards([]);
    setSliderValues({
      riskAversion: 50,
      timeSensitivity: 50,
      humanCentricity: 50
    });
    setShowResult(false);
    setCurrentResult(null);
    setScenarioStartTime(Date.now());
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const scenarios = getScenariosByDifficulty(difficulty);
    
    setCurrentScenarios(scenarios);
    setTotalScore(0);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentScenario(0);
    setScenariosCompleted(0);
    setRetries(0);
    setMaxRetries(settings.maxRetries);
    resetScenarioState();
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setScenarioStartTime(Date.now());
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('AI Alignment Lab Game completed:', payload);
  };

  const customStats = {
    scenariosCompleted: scenariosCompleted,
    totalScenarios: currentScenarios.length,
    retriesUsed: retries,
    maxRetries: maxRetries,
    cardsSelected: selectedCards.length,
    averageResponseTime: currentResult ? Math.round(currentResult.responseTime / 1000) : 0
  };

  const currentScenarioData = currentScenarios[currentScenario] || currentScenarios[0];

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="AI Alignment Lab"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play AI Alignment Lab
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
                      🤖 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Train AI systems by selecting values and adjusting behavior to make ethical decisions in complex scenarios.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Training
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Select 1-2 training cards</li>
                      <li>• Adjust 3 behavioral sliders</li>
                      <li>• Simulate AI decision making</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: Up to 60 points per scenario</li>
                      <li>• Moderate: Up to 70 points per scenario</li>
                      <li>• Hard: Up to 70 points per scenario</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎮 Levels
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: Daily Task AI (4 scenarios)</li>
                      <li>• Moderate: Logistics AI (3 scenarios)</li>
                      <li>• Hard: Ethical Dilemma AI (3 scenarios)</li>
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
          {/* Game Progress */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Scenario
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentScenario + 1}/{difficultySettings[difficulty].scenarios}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Retries
              </div>
              <div className="text-lg font-semibold text-orange-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {retries}/{maxRetries}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Cards
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {selectedCards.length}/2
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {difficulty}
              </div>
            </div>
          </div>

          {/* Current Scenario */}
          {currentScenarioData && (
            <div className="w-full max-w-5xl mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="text-4xl">{currentScenarioData.aiCharacter}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {currentScenarioData.title}
                    </h3>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Training: {currentScenarioData.aiName}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800 mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentScenarioData.description}
                </p>
                <p className="text-sm text-gray-600 italic" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentScenarioData.context}
                </p>
              </div>
            </div>
          )}

          {/* Training Cards */}
          <div className="w-full max-w-6xl mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Select Training Values (Choose 1-2 cards)
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {trainingCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => !showResult && !isSimulating && handleCardSelect(card.id)}
                  disabled={showResult || isSimulating}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-300 ${
                    selectedCards.includes(card.id)
                      ? `${card.color} border-current`
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                  } ${(showResult || isSimulating) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{card.icon}</span>
                    <span className="font-medium text-sm">{card.name}</span>
                  </div>
                  <p className="text-xs opacity-80">{card.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bias Sliders */}
          <div className="w-full max-w-4xl mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="h-5 w-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Adjust AI Behavior
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk Aversion */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Risk Aversion: {sliderValues.riskAversion}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValues.riskAversion}
                  onChange={(e) => !showResult && !isSimulating && handleSliderChange('riskAversion', e.target.value)}
                  disabled={showResult || isSimulating}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Risk-taking</span>
                  <span>Risk-averse</span>
                </div>
              </div>

              {/* Time Sensitivity */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Time Sensitivity: {sliderValues.timeSensitivity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValues.timeSensitivity}
                  onChange={(e) => !showResult && !isSimulating && handleSliderChange('timeSensitivity', e.target.value)}
                  disabled={showResult || isSimulating}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Deliberate</span>
                  <span>Urgent</span>
                </div>
              </div>

              {/* Human-Centricity */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Human-Centricity: {sliderValues.humanCentricity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValues.humanCentricity}
                  onChange={(e) => !showResult && !isSimulating && handleSliderChange('humanCentricity', e.target.value)}
                  disabled={showResult || isSimulating}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Logical</span>
                  <span>Human-focused</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simulate Button */}
          {!showResult && (
            <div className="mb-6">
              <button
                onClick={handleSimulate}
                disabled={selectedCards.length === 0 || isSimulating}
                className={`px-8 py-4 rounded-lg text-white font-medium flex items-center gap-3 transition-all duration-300 ${
                  selectedCards.length === 0 || isSimulating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: '18px' }}
              >
                {isSimulating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Simulating AI Decision...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Simulate AI Decision
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Display */}
          {showResult && currentResult && (
            <div className={`w-full max-w-3xl text-center p-6 rounded-lg border-2 ${
              currentResult.score === 'excellent' ? 'bg-green-50 border-green-300' :
              currentResult.score === 'good' ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                {currentResult.score === 'excellent' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : currentResult.score === 'good' ? (
                  <CheckCircle className="h-8 w-8 text-yellow-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <h3 className="text-2xl font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentResult.score === 'excellent' ? 'Excellent Alignment!' :
                   currentResult.score === 'good' ? 'Good Decision!' : 'Needs Improvement'}
                </h3>
              </div>
              
              <div className={`text-lg mb-4 ${
                currentResult.score === 'excellent' ? 'text-green-800' :
                currentResult.score === 'good' ? 'text-yellow-800' : 'text-red-800'
              }`} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {currentResult.result}
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  Points Earned: +{currentResult.points}
                </div>
                <div className="text-sm text-gray-600">
                  Response Time: {Math.round(currentResult.responseTime / 1000)}s
                </div>
              </div>

              {currentResult.score !== 'excellent' && retries < maxRetries && (
                <p className="text-gray-700 font-medium">
                  You can try again with different training values...
                </p>
              )}
              
              {currentResult.score === 'excellent' && currentScenario + 1 < currentScenarios.length && (
                <p className="text-green-700 font-medium">
                  Moving to next scenario...
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-3xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Select training values that align with the scenario's ethical requirements. 
              Adjust behavioral sliders to fine-tune the AI's decision-making process. 
              Each scenario has optimal configurations that lead to better outcomes.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].scenarios} scenarios | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].maxRetries} retries per scenario
            </div>
          </div>
        </div>
      </GameFramework>

      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
      />

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-track {
          background: linear-gradient(90deg, #EF4444, #F97316, #10B981);
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AIAlignmentLabGame;