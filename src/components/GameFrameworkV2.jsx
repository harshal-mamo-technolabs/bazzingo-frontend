import React, { useState, useEffect, useCallback } from 'react';
import { Play, ChevronUp, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { submitGameScore } from '../services/gameService';
import TranslatedText from './TranslatedText.jsx';
import GameCompletionModal from './games/GameCompletionModal.jsx';
import Header from './Header';

const GameFrameworkV2 = ({
  gameTitle,
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
  enableCompletionModal = true,
  instructionsSection = null,
  showHeader = true
}) => {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [eventDispatched, setEventDispatched] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const location = useLocation();
  const gameId = location.state?.gameId;

  useEffect(() => {
    if (location.state?.fromDailyGame && gameState === 'ready') {
      const formatted = location.state.difficulty.charAt(0).toUpperCase() + location.state.difficulty.slice(1);
      setDifficulty(formatted);
    }
  }, [location.state, gameState, setDifficulty]);

  useEffect(() => {
    if (gameState === 'finished' && !hasSubmitted) {
      const endTs = endTime || new Date().toISOString();
      setEndTime(endTs);
      setHasSubmitted(true);
      const normalizedScore = Math.max(0, Math.min(200, score));
      const submit = async () => {
        if (gameId) {
          try {
            setIsSubmitting(true);
            await submitGameScore(gameId, normalizedScore);
            if (!eventDispatched) {
              setEventDispatched(true);
              window.dispatchEvent(new CustomEvent('gameScoreSubmitted', {
                detail: { gameId, score: normalizedScore, success: true }
              }));
            }
          } catch (error) {
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
          if (!eventDispatched) {
            setEventDispatched(true);
            window.dispatchEvent(new CustomEvent('gameScoreSubmitted', {
              detail: { gameId: null, score: normalizedScore, success: false, error: 'No gameId found' }
            }));
          }
        }
        const payload = {
          category,
          difficulty,
          score: normalizedScore,
          duration: startTime && endTs ? Math.floor((new Date(endTs) - new Date(startTime)) / 1000) : 0,
          start_time: startTime,
          end_time: endTs,
          success: true,
          gameId,
          ...customStats
        };
        if (onGameComplete) onGameComplete(payload);
      };
      submit();
    }
  }, [gameState, hasSubmitted, endTime, score, eventDispatched, category, difficulty, startTime, gameId, customStats, onGameComplete]);

  const handleStart = useCallback(() => {
    const startTs = new Date().toISOString();
    setStartTime(startTs);
    setHasSubmitted(false);
    setEventDispatched(false);
    if (setGameState) setGameState('playing');
    if (onStart) onStart();
  }, [setGameState, onStart]);

  const handleReset = useCallback(() => {
    setStartTime(null);
    setEndTime(null);
    setHasSubmitted(false);
    setEventDispatched(false);
    if (setGameState) setGameState('ready');
    if (onReset) onReset();
  }, [setGameState, onReset]);

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
    <div className="min-h-screen bg-white">
      {gameState === 'ready' && (
        <div className="mx-auto">
          {showHeader && <Header unreadCount={3} />}
          <div className="px-2 lg:px-4 mt-4">
            <div className="bg-[#E8E8E8] rounded-lg p-3">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600"><TranslatedText text="Score" /></div>
                  <div className="text-xl font-semibold text-[#FF6B3E]">{Math.round(score)}/200</div>
                </div>
                <div className="text-center bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600"><TranslatedText text="Time" /></div>
                  <div className="text-xl font-semibold text-gray-900">{formatTime(timeRemaining)}</div>
                </div>
                <div className="text-center bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600"><TranslatedText text="Category" /></div>
                  <div className="text-lg font-semibold text-gray-900"><TranslatedText text={category} /></div>
                </div>
                <div className="text-center bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600"><TranslatedText text="Status" /></div>
                  <div className="text-lg font-semibold text-gray-900 capitalize"><TranslatedText text="Ready" /></div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 min-h-[300px] flex flex-col items-center justify-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{typeof gameTitle === 'string' ? <TranslatedText text={gameTitle} /> : gameTitle}</h3>
                <p className="text-gray-600 mb-6">{typeof gameShortDescription === 'string' ? <TranslatedText text={gameShortDescription} /> : gameShortDescription}</p>
                <button
                  onClick={handleStart}
                  className="bg-[#FF6B3E] text-white px-6 py-3 rounded-lg hover:bg-[#e55a35] transition-colors flex items-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  <TranslatedText text="Start Game" />
                </button>
              </div>
            </div>
          </div>
          {instructionsSection && (
            <div className="px-2 lg:px-4 mt-4">
              <div className="bg-[#E8E8E8] rounded-lg p-3">
                <div
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  <h3 className="text-lg font-semibold text-blue-900">
                    {typeof gameTitle === 'string'
                      ? <TranslatedText text={`How to Play ${gameTitle}`} />
                      : <TranslatedText text="How to Play" />}
                  </h3>
                  <span className="text-blue-900 text-xl">
                    {showInstructions
                      ? <ChevronUp className="h-5 w-5 text-blue-900" />
                      : <ChevronDown className="h-5 w-5 text-blue-900" />}
                  </span>
                </div>
                {showInstructions && (
                  <div>
                    {instructionsSection}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {gameState === 'playing' && (
        <div className="mx-auto px-0 lg:px-0 mt-0">
          {children}
        </div>
      )}
      {enableCompletionModal && (
        <GameCompletionModal
          isOpen={gameState === 'finished'}
          onClose={() => setGameState && setGameState('ready')}
          score={score}
        />
      )}
    </div>
  );
};

export default GameFrameworkV2;
