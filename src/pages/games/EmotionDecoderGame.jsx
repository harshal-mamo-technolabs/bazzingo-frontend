import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { difficultySettings, getScenariosByDifficulty, calculateScore } from '../../utils/games/EmotionDecoder';
import { 
  Play, 
  RotateCcw, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Brain,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const EmotionDecoderGame = () => {
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

  // Animation and emotion state
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [currentEmotionIndex, setCurrentEmotionIndex] = useState(0);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [taggedEmotions, setTaggedEmotions] = useState([]);
  const [canScrubTimeline, setCanScrubTimeline] = useState(false);

  const animationRef = useRef(null);
  //const timelineRef = useRef(null);
  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore(solvedScenarios, difficulty);
    setScore(newScore);
  }, [solvedScenarios, difficulty]);

  // Animation system
  const startAnimation = useCallback(() => {
    if (!currentScenarios[currentScenario]) return;
    
    setIsAnimationPlaying(true);
    setAnimationCompleted(false);
    setCurrentEmotionIndex(0);
    setAnimationProgress(0);
    setShowChoices(false);
    setCanScrubTimeline(false);
    
    const scenario = currentScenarios[currentScenario];
    const totalDuration = scenario.totalDuration;
    let startTime = Date.now();
    
    const animateEmotions = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      setAnimationProgress(progress);
      
      // Calculate current emotion index based on progress
      let cumulativeDuration = 0;
      let emotionIndex = 0;
      
      if (scenario.type === 'single') {
        for (let i = 0; i < scenario.emotionSequence.length; i++) {
          cumulativeDuration += scenario.emotionSequence[i].duration;
          if (elapsed < cumulativeDuration) {
            emotionIndex = i;
            break;
          }
          emotionIndex = i;
        }
      } else {
        // For group scenarios, use the first character's sequence for timing
        for (let i = 0; i < scenario.characters[0].emotionSequence.length; i++) {
          cumulativeDuration += scenario.characters[0].emotionSequence[i].duration;
          if (elapsed < cumulativeDuration) {
            emotionIndex = i;
            break;
          }
          emotionIndex = i;
        }
      }
      
      setCurrentEmotionIndex(emotionIndex);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateEmotions);
      } else {
        setIsAnimationPlaying(false);
        setAnimationCompleted(true);
        setShowChoices(true);
        setCanScrubTimeline(true);
        setScenarioStartTime(Date.now());
      }
    };
    
    animationRef.current = requestAnimationFrame(animateEmotions);
  }, [currentScenarios, currentScenario]);

  // Timeline scrubbing
  const scrubTimeline = (progress) => {
    if (!canScrubTimeline || !currentScenarios[currentScenario]) return;
    
    const scenario = currentScenarios[currentScenario];
    const totalDuration = scenario.totalDuration;
    const targetTime = progress * totalDuration;
    
    let cumulativeDuration = 0;
    let emotionIndex = 0;
    
    const emotionSequence = scenario.type === 'single' 
      ? scenario.emotionSequence 
      : scenario.characters[0].emotionSequence;
    
    for (let i = 0; i < emotionSequence.length; i++) {
      cumulativeDuration += emotionSequence[i].duration;
      if (targetTime < cumulativeDuration) {
        emotionIndex = i;
        break;
      }
      emotionIndex = i;
    }
    
    setCurrentEmotionIndex(emotionIndex);
    setAnimationProgress(progress);
  };

  // Handle answer selection
  const handleAnswerSelect = useCallback((answerIndex) => {
    if (gameState !== 'playing' || showFeedback || !currentScenarios[currentScenario]) return;

    const responseTime = Date.now() - scenarioStartTime;
    const currentScenarioData = currentScenarios[currentScenario];
    const isCorrect = answerIndex === currentScenarioData.correctAnswer;

    setSelectedAnswer(answerIndex);
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
          setSelectedAnswer(null);
          setShowFeedback(false);
          setAnimationCompleted(false);
          setShowChoices(false);
          setCanScrubTimeline(false);
          setTaggedEmotions([]);
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
          setSelectedAnswer(null);
        }
      }, 2500);
    }
  }, [gameState, showFeedback, currentScenario, scenarioStartTime, lives, currentScenarios]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentScenarios[currentScenario]) return;

    setHintsUsed(prev => prev + 1);
    
    const currentScenarioData = currentScenarios[currentScenario];
    const hints = currentScenarioData.hints;
    const hintIndex = Math.min(hintsUsed, hints.length - 1);
    
    setHintMessage(hints[hintIndex]);
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

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowHint(false);
    setIsAnimationPlaying(false);
    setAnimationCompleted(false);
    setShowChoices(false);
    setCanScrubTimeline(false);
    setTaggedEmotions([]);
    setCurrentEmotionIndex(0);
    setAnimationProgress(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Emotion Decoder Game completed:', payload);
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
    emotionsTagged: taggedEmotions.length
  };

  const currentScenarioData = currentScenarios[currentScenario] || currentScenarios[0];

  // Get current emotion for display
  const getCurrentEmotion = (characterIndex = 0) => {
    if (!currentScenarioData) return '😐';
    
    if (currentScenarioData.type === 'single') {
      const emotionData = currentScenarioData.emotionSequence[currentEmotionIndex];
      return emotionData ? emotionData.emotion : currentScenarioData.character.baseEmoji;
    } else {
      const character = currentScenarioData.characters[characterIndex];
      const emotionData = character.emotionSequence[currentEmotionIndex];
      return emotionData ? emotionData.emotion : character.baseEmoji;
    }
  };

  const getCurrentEmotionDescription = (characterIndex = 0) => {
    if (!currentScenarioData) return '';
    
    if (currentScenarioData.type === 'single') {
      const emotionData = currentScenarioData.emotionSequence[currentEmotionIndex];
      return emotionData ? emotionData.description : '';
    } else {
      const character = currentScenarioData.characters[characterIndex];
      const emotionData = character.emotionSequence[currentEmotionIndex];
      return emotionData ? emotionData.description : '';
    }
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Emotion Decoder"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Emotion Decoder
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
                      🎭 Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Watch emotional journeys and deduce what triggered the character's expressions and feelings.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      👀 Observation
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Watch 3-5 second emotional transitions</li>
                      <li>• Use timeline to review key moments</li>
                      <li>• Tag important emotional phases</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 25 points per correct answer</li>
                      <li>• Moderate: 40 points per correct answer</li>
                      <li>• Hard: 50 points per correct answer</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📝 Scenarios
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 single character emotions</li>
                      <li>• Moderate: 5 complex emotional journeys</li>
                      <li>• Hard: 4 group dynamics scenarios</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Emotional Intelligence"
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
            {gameState === 'playing' && !isAnimationPlaying && !animationCompleted && (
              <button
                onClick={startAnimation}
                className="px-6 py-3 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors flex items-center gap-2 font-medium"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <Play className="h-5 w-5" />
                Watch Emotion
              </button>
            )}
            
            {gameState === 'playing' && animationCompleted && (
              <button
                onClick={startAnimation}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <RotateCcw className="h-4 w-4" />
                Replay
              </button>
            )}

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
                Scenario
              </div>
              <div className="text-lg font-semibold text-[#F97316]" style={{ fontFamily: 'Roboto, sans-serif' }}>
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
                Tagged
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {taggedEmotions.length}
              </div>
            </div>
          </div>

          {/* Scenario Header */}
          {currentScenarioData && gameState === 'playing' && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-orange-800" />
                  <span className="font-semibold text-orange-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {currentScenarioData.type === 'single' ? 'Single Character' : 'Group Dynamics'} - {difficulty} Level
                  </span>
                </div>
                <h3 className="text-xl font-bold text-orange-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Decode the Emotional Journey
                </h3>
                <p className="text-orange-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  Watch the character's emotional expressions and determine what triggered this emotional response.
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

          {/* Character Display Area */}
          {currentScenarioData && gameState === 'playing' && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-8 min-h-[300px] flex flex-col items-center justify-center">
                {currentScenarioData.type === 'single' ? (
                  // Single Character Display
                  <div className="text-center">
                    <div className="text-8xl mb-4 transition-all duration-300 hover:scale-110">
                      {getCurrentEmotion()}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {currentScenarioData.character.name}
                    </h3>
                    {(isAnimationPlaying || animationCompleted) && (
                      <p className="text-gray-600 italic" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {getCurrentEmotionDescription()}
                      </p>
                    )}
                  </div>
                ) : (
                  // Group Characters Display
                  <div className="flex justify-center gap-12">
                    {currentScenarioData.characters.map((character, index) => (
                      <div key={character.name} className="text-center">
                        <div className="text-6xl mb-3 transition-all duration-300 hover:scale-110">
                          {getCurrentEmotion(index)}
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {character.name}
                        </h4>
                        {(isAnimationPlaying || animationCompleted) && (
                          <p className="text-sm text-gray-600 italic" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            {getCurrentEmotionDescription(index)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Animation Status */}
                {isAnimationPlaying && (
                  <div className="mt-6 flex items-center gap-2 text-orange-600">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Emotion in progress...
                    </span>
                  </div>
                )}
              </div>

              {/* Timeline Control */}
              {animationCompleted && canScrubTimeline && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Review Timeline
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={animationProgress}
                      onChange={(e) => scrubTimeline(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #F97316 0%, #F97316 ${animationProgress * 100}%, #e5e7eb ${animationProgress * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <span>Start</span>
                    <span>End</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Answer Choices */}
          {showChoices && currentScenarioData && !showFeedback && (
            <div className="w-full max-w-4xl mb-6">
              <div className="mb-4 text-center">
                <h4 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  What triggered this emotional response?
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentScenarioData.choices.map((choice, index) => (
                <button
    key={index}
    onClick={() => handleAnswerSelect(index)}
    className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
      selectedAnswer === index
        ? 'border-[#F97316] bg-orange-100'
        : 'bg-white border-gray-200 hover:border-[#F97316] hover:bg-orange-50'
    }`}
    style={{ fontFamily: 'Roboto, sans-serif' }}
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 bg-[#F97316] text-white rounded-full flex items-center justify-center text-sm font-medium">
        {String.fromCharCode(65 + index)}
      </div>
      <div className="text-gray-800">
        {choice}
      </div>
    </div>
                </button>
                ))}
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
                  {feedbackType === 'correct' ? 'Excellent Reading!' : 'Not Quite Right'}
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
                  Next emotional scenario loading...
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
              Watch the character's emotional journey carefully. Use the timeline to review key moments and tag important emotions. 
              Choose the trigger that best matches the emotional progression you observed.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].questionCount} scenarios | 
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

export default EmotionDecoderGame;