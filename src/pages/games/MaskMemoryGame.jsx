import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { 
  difficultySettings, 
  getGameScenario, 
  checkMatch,
  calculateScore,
  getHint,
  shuffleArray // (kept in case used elsewhere; safe to remove if truly unused)
} from '../../utils/games/MaskMemory';
import TranslatedText from '../../components/TranslatedText.jsx';
import { useTranslateText } from '../../hooks/useTranslate';
import { 
  Eye, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  ChevronUp, 
  ChevronDown, 
  // Shuffle,  // ❌ removed
  Clock,
  Target,
  Star
} from 'lucide-react';

// Separate component for mask card to properly use hooks
const MaskCard = ({ mask, index, getCardClass, getCardContent, handleCardClick }) => {
  const maskTitle = mask ? useTranslateText(`${mask.name} mask`) : '';
  
  return (
    <div
      className={getCardClass(mask, index)}
      onClick={() => handleCardClick(index)}
      title={maskTitle}
    >
      <span className="select-none">
        {getCardContent(mask, index)}
      </span>
    </div>
  );
};

const MaskMemoryGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  
  // Translated strings for dynamic messages
  const correctFoundMaskText = useTranslateText("Correct! You found the {mask} mask!");
  const wrongNotSpecialText = useTranslateText("Wrong! The {mask} mask is not one of the special masks.");
  const alreadyFoundText = useTranslateText("You already found this special mask!");
  const perfectMatchText = useTranslateText("Perfect match! You found the {mask} pair!");
  const noMatchText = useTranslateText("No match! {mask1} and {mask2} don't match.");
  const pointsEarnedText = useTranslateText("points earned!");
  const maskText = useTranslateText("mask");
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [incorrectMatches, setIncorrectMatches] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  
  // Game state
  const [gameScenario, setGameScenario] = useState(null);
  const [masks, setMasks] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [gamePhase, setGamePhase] = useState('preview'); // preview, recall, complete
  const [previewTimeLeft, setPreviewTimeLeft] = useState(5000);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [turnStartTime, setTurnStartTime] = useState(0);
  const [specialMasksFound, setSpecialMasksFound] = useState([]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore(difficulty, correctMatches, incorrectMatches);
    setScore(newScore);
  }, [difficulty, correctMatches, incorrectMatches]);

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

  // Preview timer -> directly go to recall (no shuffle, no reordering)
  useEffect(() => {
    let interval;
    if (gamePhase === 'preview' && previewTimeLeft > 0) {
      interval = setInterval(() => {
        setPreviewTimeLeft(prev => {
          if (prev <= 100) {
            // End preview: flip all cards face down (positions unchanged), then recall
            setMasks(prevMasks => prevMasks.map(mask => ({ ...mask, isFlipped: false })));
            setGamePhase('recall');
            setTurnStartTime(Date.now());
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gamePhase, previewTimeLeft]);

  // Handle card selection
  const handleCardClick = useCallback((cardIndex) => {
    if (gamePhase !== 'recall' || showFeedback) return;
    
    const card = masks[cardIndex];
    if (!card || card.isMatched || flippedCards.includes(card.id)) return;

    if (difficulty === 'Hard') {
      // Special mask recall mode (positions unchanged, no shuffle)
      if (card.isSpecial && !specialMasksFound.includes(card.id)) {
        setSpecialMasksFound(prev => [...prev, card.id]);
        setCorrectMatches(prev => prev + 1);
        setFeedbackType('correct');
        setFeedbackMessage(correctFoundMaskText.replace('{mask}', card.name));
        setShowFeedback(true);
        
        // Check if all special masks are found
        if (specialMasksFound.length + 1 >= gameScenario.specialMasks.length) {
          setTimeout(() => {
            setGameState('finished');
            setShowCompletionModal(true);
          }, 2000);
        }
      } else if (!card.isSpecial) {
        setIncorrectMatches(prev => prev + 1);
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
        setFeedbackType('incorrect');
        setFeedbackMessage(wrongNotSpecialText.replace('{mask}', card.name));
        setShowFeedback(true);
      } else {
        setFeedbackType('incorrect');
        setFeedbackMessage(alreadyFoundText);
        setShowFeedback(true);
      }
      
      setTimeout(() => setShowFeedback(false), 2000);
    } else {
      // Regular pair matching mode (no shuffle; positions unchanged)
      const newFlippedCards = [...flippedCards, card.id];
      setFlippedCards(newFlippedCards);
      
      // Flip the selected card face up
      setMasks(prev => prev.map(m => 
        m.id === card.id ? { ...m, isFlipped: true } : m
      ));

      if (newFlippedCards.length === 2) {
        const card1 = masks.find(m => m.id === newFlippedCards[0]);
        const card2 = masks.find(m => m.id === newFlippedCards[1]);
        
        if (checkMatch(card1, card2)) {
          // Match found
          setCorrectMatches(prev => prev + 1);
          setMatchedPairs(prev => [...prev, card1.pairIndex]);
          setFeedbackType('correct');
          setFeedbackMessage(perfectMatchText.replace('{mask}', card1.name));
          
          // Mark cards as matched
          setMasks(prev => prev.map(m => 
            m.pairIndex === card1.pairIndex ? { ...m, isMatched: true } : m
          ));
          
          // Check if all pairs are matched
          if (matchedPairs.length + 1 >= difficultySettings[difficulty].pairCount) {
            setTimeout(() => {
              setGameState('finished');
              setShowCompletionModal(true);
            }, 2000);
          }
        } else {
          // No match
          setIncorrectMatches(prev => prev + 1);
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
          setFeedbackType('incorrect');
          setFeedbackMessage(noMatchText.replace('{mask1}', card1.name).replace('{mask2}', card2.name));
          
          // Flip cards back after delay
          setTimeout(() => {
            setMasks(prev => prev.map(m => 
              newFlippedCards.includes(m.id) ? { ...m, isFlipped: false } : m
            ));
          }, 1500);
        }
        
        setShowFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
          setFlippedCards([]);
        }, 2000);
      }
    }
  }, [gamePhase, showFeedback, masks, flippedCards, difficulty, specialMasksFound, gameScenario, matchedPairs]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gamePhase !== 'recall') return;
    setHintsUsed(prev => prev + 1);
    const hint = getHint(masks, flippedCards, difficulty);
    setHintMessage(hint);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 4000);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const scenario = getGameScenario(difficulty);
    
    setGameScenario(scenario);
    // Start with all cards visible (preview)
    setMasks(scenario.masks.map(mask => ({ ...mask, isFlipped: true })));
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCorrectMatches(0);
    setIncorrectMatches(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setFlippedCards([]);
    setMatchedPairs([]);
    setSelectedCards([]);
    setSpecialMasksFound([]);
    setGamePhase('preview');
    setPreviewTimeLeft(settings.previewTime);
    setShowFeedback(false);
    setShowHint(false);
    setTotalResponseTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    gamePhase,
    correctMatches,
    incorrectMatches,
    lives,
    hintsUsed,
    matchesNeeded: difficulty === 'Hard' ? gameScenario?.specialMasks?.length || 0 : difficultySettings[difficulty].pairCount,
    specialMasksFound: specialMasksFound.length,
    totalPairs: difficulty === 'Hard' ? 0 : difficultySettings[difficulty].pairCount
  };

  const getGridCols = () => {
    if (difficulty === 'Easy') return 'grid-cols-4';
    if (difficulty === 'Moderate') return 'grid-cols-5';
    return 'grid-cols-4';
  };

  const getCardContent = (mask, index) => {
    if (!mask) return '';
    if (gamePhase === 'preview' || mask.isFlipped || mask.isMatched) {
      return mask.emoji;
    }
    return '🎭';
    };

  const getCardClass = (mask, index) => {
    if (!mask) return 'w-16 h-16 bg-gray-200 rounded-lg border-2 border-gray-300';
    
    let baseClass = 'w-16 h-16 rounded-lg border-2 transition-all duration-300 cursor-pointer flex items-center justify-center text-2xl ';
    
    if (mask.isMatched) {
      baseClass += 'bg-green-100 border-green-400 ';
    } else if (mask.isFlipped || gamePhase === 'preview') {
      if (mask.isSpecial && difficulty === 'Hard') {
        baseClass += 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300 ';
      } else {
        baseClass += 'bg-blue-100 border-blue-400 ';
      }
    } else {
      baseClass += 'bg-purple-200 border-purple-400 hover:bg-purple-300 ';
    }
    
    if (specialMasksFound.includes(mask.id)) {
      baseClass += 'ring-4 ring-green-400 ';
    }
    
    return baseClass;
  };

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}
      
      <GameFramework
        gameTitle={<TranslatedText text="🎭 Mask Memory: Carnival Quest" />}
        gameShortDescription={<TranslatedText text="Test your visual memory by studying masked characters and then identifying them correctly. Challenge your recall abilities!" />}
        gameDescription={
          <div className="mx-auto px-1 mb-2">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <TranslatedText text="How to Play Mask Memory: Carnival Quest" />
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
                      🎭 <TranslatedText text="Objective" />
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <TranslatedText text="Memorize carnival masks during preview, then find matching pairs or recall special masks after they're hidden (no shuffle)." />
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🧠 <TranslatedText text="Memory Challenge" />
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• <TranslatedText text="Preview: Memorize mask positions" /></li>
                      <li>• <TranslatedText text="Recall: Cards flip face down but stay in the same place" /></li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 <TranslatedText text="Scoring" />
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• <TranslatedText text="Easy: +25 points per match" /></li>
                      <li>• <TranslatedText text="Moderate: +40 points per match" /></li>
                      <li>• <TranslatedText text="Hard: +50 points per special mask" /></li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 <TranslatedText text="Challenges" />
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• <TranslatedText text="Easy: 8 pairs to match" /></li>
                      <li>• <TranslatedText text="Moderate: 5 pairs to match" /></li>
                      <li>• <TranslatedText text="Hard: 4 special masks to recall" /></li>
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
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {gamePhase === 'recall' && (
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
                <TranslatedText text="Hint" /> ({maxHints - hintsUsed})
              </button>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <TranslatedText text="Phase" />
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E] capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {gamePhase}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <TranslatedText text="Lives" />
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'❤️'.repeat(lives)}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {difficulty === 'Hard' ? <TranslatedText text="Found" /> : <TranslatedText text="Matches" />}
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {difficulty === 'Hard' ? specialMasksFound.length : correctMatches}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {difficulty === 'Hard' ? <TranslatedText text="Target" /> : <TranslatedText text="Needed" />}
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {difficulty === 'Hard' ? gameScenario?.specialMasks?.length || 0 : difficultySettings[difficulty].pairCount}
              </div>
            </div>
          </div>

          {/* Phase Information */}
          {gamePhase === 'preview' && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <TranslatedText text="Preview Phase - Memorize the Masks!" />
                  </span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <TranslatedText text="Study the carnival masks carefully" />
                </h3>
                <p className="text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {difficulty === 'Hard' 
                    ? <TranslatedText text="Remember the positions of the highlighted special masks!" />
                    : <TranslatedText text="Remember where each mask is located so you can find matching pairs!" />
                  }
                </p>
                <div className="mt-2">
                  <div className="bg-blue-200 rounded-full h-2 w-full">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${((difficultySettings[difficulty].previewTime - previewTimeLeft) / difficultySettings[difficulty].previewTime) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    {Math.ceil(previewTimeLeft / 1000)} <TranslatedText text="seconds remaining" />
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* (Shuffle phase removed) */}

          {gamePhase === 'recall' && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-800" />
                  <span className="font-semibold text-green-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <TranslatedText text="Recall Phase - Find the Masks!" />
                  </span>
                </div>
                <p className="text-green-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {difficulty === 'Hard' 
                    ? <TranslatedText text="Click on the masks you remember being highlighted as special!" />
                    : <TranslatedText text="Click on masks to flip them and find matching pairs!" />
                  }
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
                    <TranslatedText text="Hint:" />
                  </span>
                </div>
                <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  <TranslatedText text={hintMessage} />
                </p>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-4 rounded-lg mb-6 ${
              feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <TranslatedText text={feedbackMessage} />
                </div>
              </div>
              {feedbackType === 'correct' && (
                <div className={`${feedbackType === 'correct' ? 'text-green-700' : 'text-red-700'} font-medium`}>
                  +{difficultySettings[difficulty].pointsPerMatch} <TranslatedText text="points earned!" />
                </div>
              )}
            </div>
          )}

          {/* Game Board */}
          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-300 mb-6">
            <div className={`grid ${getGridCols()} gap-3 max-w-lg mx-auto`}>
              {masks.map((mask, index) => (
                <MaskCard
                  key={mask ? mask.id : `empty-${index}`}
                  mask={mask}
                  index={index}
                  getCardClass={getCardClass}
                  getCardContent={getCardContent}
                  handleCardClick={handleCardClick}
                />
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              {difficulty === 'Hard' 
                ? <TranslatedText text="In Hard mode, memorize the special highlighted masks during preview, then click on them after they're hidden!" />
                : <TranslatedText text="Memorize the mask positions during preview, then click on cards to flip them and find matching pairs!" />
              }
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <TranslatedText text={difficulty} /> <TranslatedText text="Mode:" /> {difficulty === 'Hard' ? <>{difficultySettings[difficulty].pairCount} <TranslatedText text="special masks" /></> : <>{difficultySettings[difficulty].pairCount} <TranslatedText text="pairs" /></>} | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} <TranslatedText text="time limit" /> |
              {difficultySettings[difficulty].lives} <TranslatedText text="lives" /> | {difficultySettings[difficulty].hints} <TranslatedText text="hints" /> |
              {difficultySettings[difficulty].pointsPerMatch} <TranslatedText text="points per" /> {difficulty === 'Hard' ? <TranslatedText text="special mask" /> : <TranslatedText text="match" />}
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

export default MaskMemoryGame;
