import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { submitGameScore } from '../services/gameService';
import TranslatedText from './TranslatedText.jsx';

const GameFramework = ({
  gameTitle,
  gameDescription,
  gameShortDescription,
  category,
  onGameComplete,
  children,
  gameState,
  setGameState,
  score,
  timeRemaining,
  difficulty,
  setDifficulty,
  onStart,
  onReset,
  customStats = {},
  modifiedPadding = "p-6"
}) => {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [eventDispatched, setEventDispatched] = useState(false);
  const location = useLocation();

  // Get gameId from navigation state
  const gameId = location.state?.gameId;

  // Handle daily game difficulty from navigation state
  useEffect(() => {
    if (location.state?.fromDailyGame && gameState === 'ready') {
      // Capitalize first letter to match your system
      const formattedDifficulty = location.state.difficulty.charAt(0).toUpperCase() + 
                                 location.state.difficulty.slice(1);
      setDifficulty(formattedDifficulty);
    }
  }, [location.state, gameState, setDifficulty]);

  // Auto-submit score when game state changes to finished
  useEffect(() => {
    if (gameState === 'finished' && !hasSubmitted && gameId) {
      handleGameEnd(true); // Assume success if game reached finished state
    }
  }, [gameState, hasSubmitted, gameId]);

  // Timer management
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        // Timer is managed by parent component
      }, 1000);
    } else if (timeRemaining <= 0 && gameState === 'playing') {
      handleGameEnd(false);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  const handleGameEnd = useCallback(async (success) => {
    if (hasSubmitted) return; // Prevent duplicate submissions
    
    const endTimeStamp = new Date().toISOString();
    setEndTime(endTimeStamp);
    setHasSubmitted(true);

    // Calculate duration
    const duration = startTime ? Math.floor((new Date(endTimeStamp) - new Date(startTime)) / 1000) : 0;

    // Normalize score to 0-200 range
    const normalizedScore = Math.max(0, Math.min(200, score));

    // Submit score to API if gameId is available
    let scoreSubmitted = false;
    if (gameId) {
      try {
        setIsSubmitting(true);
        console.log('Submitting score:', { gameId, score: normalizedScore });
        await submitGameScore(gameId, normalizedScore);
        console.log('Score submitted successfully');
        scoreSubmitted = true;
        
        // Dispatch custom event to notify GameCompletionModal (only once)
        if (!eventDispatched) {
          setEventDispatched(true);
          window.dispatchEvent(new CustomEvent('gameScoreSubmitted', {
            detail: { gameId, score: normalizedScore, success: true }
          }));
        }
      } catch (error) {
        console.error('Failed to submit score:', error);
        // You might want to show a user-friendly error message here
        
        // Dispatch event even on failure so modal can proceed (only once)
        if (!eventDispatched) {
          setEventDispatched(true);
          window.dispatchEvent(new CustomEvent('gameScoreSubmitted', {
            detail: { gameId, score: normalizedScore, success: false, error: error.message }
          }));
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.warn('No gameId found, score not submitted');
      
      // Dispatch event even when no gameId so modal can proceed (only once)
      if (!eventDispatched) {
        setEventDispatched(true);
        window.dispatchEvent(new CustomEvent('gameScoreSubmitted', {
          detail: { gameId: null, score: normalizedScore, success: false, error: 'No gameId found' }
        }));
      }
    }

    // Prepare payload according to specifications
    const payload = {
      category,
      difficulty,
      score: normalizedScore,
      duration,
      start_time: startTime,
      end_time: endTimeStamp,
      success,
      gameId,
      scoreSubmitted, // Include score submission status
      ...customStats
    };

    if (onGameComplete) {
      onGameComplete(payload);
    }
  }, [category, difficulty, score, startTime, customStats, onGameComplete, gameId, hasSubmitted]);

  const handleStart = () => {
    const startTimeStamp = new Date().toISOString();
    setStartTime(startTimeStamp);
    setGameState('playing');
    setHasSubmitted(false); // Reset submission flag
    setEventDispatched(false); // Reset event dispatch flag
    if (onStart) onStart();
  };

  const handleReset = () => {
    setStartTime(null);
    setEndTime(null);
    setGameState('ready');
    setHasSubmitted(false); // Reset submission flag
    setEventDispatched(false); // Reset event dispatch flag
    if (onReset) onReset();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Roboto, sans-serif' }}>
      {/* Header - Only show when game is ready */}
      {/* {gameState === 'ready' && (
        <div className="mx-auto px-1 lg:px-12 py-4 lg:py-8">
          <div className="flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2 text-gray-600 cursor-pointer" onClick={() => window.history.back()} />
            <h1 className="text-gray-900 font-medium lg:font-bold" style={{ fontSize: 'clamp(18px, 2vw, 20px)' }}>
              {gameTitle}
            </h1>
          </div>
        </div>
      )} */}

      {/* Game Container */}
      <div className="mx-auto px-1 lg:px-2 mt-4">
        <div className="bg-[#E8E8E8] rounded-lg p-2">
          {/* Game Controls */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              {/* Difficulty Selector */}
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={gameState !== 'ready' || location.state?.fromDailyGame}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Difficulty Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>

              {/* Daily Challenge Indicator */}
              {location.state?.fromDailyGame && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  <TranslatedText text="Daily Challenge" />
                </span>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
              >
                <RotateCcw className="h-4 w-4" />
                <TranslatedText text="Reset" />
              </button>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <TranslatedText text="Score" />
              </div>
              <div className="text-xl font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(score)}/200
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <TranslatedText text="Time" />
              </div>
              <div className={`text-xl font-semibold ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-900'}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                {formatTime(timeRemaining)}
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <TranslatedText text="Category" />
              </div>
              <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <TranslatedText text={category} />
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                <TranslatedText text="Status" />
              </div>
              <div className="text-lg font-semibold text-gray-900 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {isSubmitting ? <TranslatedText text="Submitting..." /> : <TranslatedText text={gameState} />}
              </div>
            </div>
          </div>

          {/* Game Area */}
          <div className={`bg-white rounded-lg p-2 min-h-[400px]`}>
            {gameState === 'ready' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {gameTitle}
                </h3>
                <p className="text-gray-600 mb-6" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {
                  gameShortDescription 
                    ? (typeof gameShortDescription === 'string' ? <TranslatedText text={gameShortDescription} /> : gameShortDescription)
                    : <TranslatedText text='Select your difficulty level and click "Start Game" to begin.' />}
                </p>
                <button
                  onClick={handleStart}
                  className="bg-[#FF6B3E] text-white px-6 py-3 rounded-lg hover:bg-[#e55a35] transition-colors flex items-center gap-2"
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <Play className="h-5 w-5" />
                  <TranslatedText text="Start Game" />
                </button>
              </div>
            )}

            {gameState === 'playing' && children}

            {gameState === 'finished' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Trophy className="h-16 w-16 text-[#FF6B3E] mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <TranslatedText text="Game Complete!" />
                </h3>
                <div className="text-lg text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  <TranslatedText text="Final Score:" /> <span className="font-semibold text-[#FF6B3E]">{Math.round(score)}/200</span>
                </div>
                {isSubmitting && (
                  <div className="text-sm text-gray-600 mb-2">
                    <TranslatedText text="Submitting score..." />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-600"><TranslatedText text="Duration" /></div>
                    <div className="font-semibold">{endTime && startTime ? Math.floor((new Date(endTime) - new Date(startTime)) / 1000) : 0}s</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-600"><TranslatedText text="Difficulty" /></div>
                    <div className="font-semibold"><TranslatedText text={difficulty} /></div>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-[#FF6B3E] text-white px-6 py-3 rounded-lg hover:bg-[#e55a35] transition-colors"
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <TranslatedText text="Play Again" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-gray-600 text-base mx-auto px-1 lg:px-2 mt-4" style={{ fontWeight: '400' }}>
        {typeof gameDescription === 'string' ? <TranslatedText text={gameDescription} /> : gameDescription}
      </div>
    </div>
  );
};

export default GameFramework;
