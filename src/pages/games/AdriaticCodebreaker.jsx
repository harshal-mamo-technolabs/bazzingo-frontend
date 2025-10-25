import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import IslandMap from './codebreaker/IslandMap';
import PuzzleCard from './codebreaker/PuzzleCard';
import PerformanceSummary from './codebreaker/PerformanceSummary';
import { 
  difficultySettings, 
  getPuzzlesByDifficulty, 
  calculateFinalScore, 
  validateAnswer,
  getHintForPuzzle
} from '../../utils/games/AdriaticCodebreaker';
import { 
  Map, 
  Anchor, 
  Compass, 
  Ship,
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

const AdriaticCodebreaker = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  
  // Game progress state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentPuzzles, setCurrentPuzzles] = useState([]);
  const [unlockedIslands, setUnlockedIslands] = useState(['Easy']);
  const [completedIslands, setCompletedIslands] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  
  // Current puzzle state
  const [currentHintUsed, setCurrentHintUsed] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // UI state
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const puzzles = getPuzzlesByDifficulty(difficulty);
    
    setCurrentPuzzles(puzzles);
    setCurrentPuzzleIndex(0);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCorrectAnswers(0);
    setHintsUsed(0);
    setWrongAttempts(0);
    setCurrentHintUsed(false);
    setCurrentAttempts(0);
    setShowFeedback(false);
    setShowSummary(false);
    
    // Reset unlocked islands based on difficulty
    if (difficulty === 'Easy') {
      setUnlockedIslands(['Easy']);
      setCompletedIslands([]);
    }
  }, [difficulty]);

  // Handle puzzle submission
  const handlePuzzleSubmit = (userAnswer) => {
    const currentPuzzle = currentPuzzles[currentPuzzleIndex];
    const isCorrect = validateAnswer(userAnswer, currentPuzzle.correctAnswer, currentPuzzle.type);
    
    setCurrentAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowFeedback(true);
      setFeedbackType('correct');
      setFeedbackMessage(`Excellent! The message reads: "${currentPuzzle.correctAnswer}"`);
      
      // Calculate points
      const points = currentHintUsed ? 10 : 20;
      setScore(prev => prev + points);
      
      // Move to next puzzle or complete island
      setTimeout(() => {
        if (currentPuzzleIndex + 1 >= currentPuzzles.length) {
          completeCurrentIsland();
        } else {
          moveToNextPuzzle();
        }
      }, 3000);
    } else {
      setWrongAttempts(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 10));
      setShowFeedback(true);
      setFeedbackType('incorrect');
      setFeedbackMessage('That\'s not quite right. Check your decoding and try again!');
      
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }
  };

  // Handle hint usage
  const handleHintUsage = () => {
    if (!currentHintUsed) {
      setCurrentHintUsed(true);
      setHintsUsed(prev => prev + 1);
    }
  };

  // Move to next puzzle
  const moveToNextPuzzle = () => {
    setCurrentPuzzleIndex(prev => prev + 1);
    setCurrentHintUsed(false);
    setCurrentAttempts(0);
    setShowFeedback(false);
  };

  // Complete current island
  const completeCurrentIsland = () => {
    const newCompletedIslands = [...completedIslands, difficulty];
    setCompletedIslands(newCompletedIslands);
    
    // Unlock next island
    if (difficulty === 'Easy' && !unlockedIslands.includes('Moderate')) {
      setUnlockedIslands(prev => [...prev, 'Moderate']);
    } else if (difficulty === 'Moderate' && !unlockedIslands.includes('Hard')) {
      setUnlockedIslands(prev => [...prev, 'Hard']);
    }
    
    // Check if all islands completed
    if (newCompletedIslands.length === 3) {
      endGame();
    } else {
      // Show island completion and return to map
      setGameState('ready');
      setShowFeedback(false);
    }
  };

  // End game
  const endGame = () => {
    setGameState('finished');
    setShowSummary(true);
    setTimeout(() => setShowCompletionModal(true), 1000);
  };

  // Handle island selection
  const handleIslandSelect = (selectedDifficulty) => {
    if (unlockedIslands.includes(selectedDifficulty)) {
      setDifficulty(selectedDifficulty);
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
    console.log('Adriatic Codebreaker completed:', payload);
  };

  // Calculate final results
  const { score: finalScore, rank } = calculateFinalScore(
    correctAnswers, 
    hintsUsed, 
    wrongAttempts, 
    difficulty
  );

  // Custom stats for GameFramework
  const customStats = {
    currentPuzzle: currentPuzzleIndex + 1,
    totalPuzzles: currentPuzzles.length,
    island: difficultySettings[difficulty].island,
    correctAnswers,
    hintsUsed,
    wrongAttempts,
    completedIslands: completedIslands.length,
    rank: gameState === 'finished' ? rank : 'In Progress'
  };

  const currentPuzzle = currentPuzzles[currentPuzzleIndex];

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}
      
      <GameFramework
        gameTitle="Adriatic Codebreaker"
        gameShortDescription="Decode secret messages using cipher techniques. Challenge your pattern recognition and cryptography skills!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Decode Naval Messages Across Croatian Islands
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
                      🏴‍☠️ Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Intercept and decode encrypted naval messages across three Croatian islands using historical ciphers.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔐 Cipher Types
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Caesar Cipher (letter shifts)</li>
                      <li>• Morse Code (dots & dashes)</li>
                      <li>• Symbol Cipher (Croatian symbols)</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• +20 points without hint</li>
                      <li>• +10 points with hint</li>
                      <li>• -10 points wrong attempt</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🏆 Victory
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Complete all 3 islands</li>
                      <li>• Score 120+ for victory</li>
                      <li>• Earn Gold/Silver/Bronze rank</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Logic"
        gameState={gameState}
        setGameState={setGameState}
        score={gameState === 'finished' ? finalScore : score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        <div className="flex flex-col items-center space-y-6">
          {/* Game State: Ready - Show Island Map */}
          {gameState === 'ready' && (
            <div className="w-full max-w-4xl">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Ship className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-blue-900">Choose Your Destination</h2>
                  <Compass className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-blue-700">
                  Select an island to begin intercepting encrypted naval messages
                </p>
              </div>
              
              <IslandMap
                currentIsland={difficulty}
                unlockedIslands={unlockedIslands}
                onIslandSelect={handleIslandSelect}
              />
              
              {/* Island info */}
              <div className="mt-6 bg-blue-100 border-2 border-blue-400 rounded-lg p-4 text-center">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  {difficultySettings[difficulty].island} Island
                </h3>
                <p className="text-blue-700 mb-3">
                  {difficultySettings[difficulty].description}
                </p>
                <div className="text-sm text-blue-600">
                  {difficultySettings[difficulty].puzzlesPerIsland} puzzles • 
                  {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
                  {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit
                </div>
              </div>
            </div>
          )}

          {/* Game State: Playing - Show Current Puzzle */}
          {gameState === 'playing' && currentPuzzle && (
            <div className="w-full max-w-4xl">
              {/* Progress indicator */}
              <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Anchor className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-blue-900">
                    {difficultySettings[difficulty].island} Island - Puzzle {currentPuzzleIndex + 1} of {currentPuzzles.length}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentPuzzleIndex + 1) / currentPuzzles.length) * 100}%` }}
                  />
                </div>
              </div>

              <PuzzleCard
                puzzle={currentPuzzle}
                onSubmit={handlePuzzleSubmit}
                onHint={handleHintUsage}
                hintUsed={currentHintUsed}
                showFeedback={showFeedback}
                feedbackType={feedbackType}
                feedbackMessage={feedbackMessage}
                attempts={currentAttempts}
              />
            </div>
          )}

          {/* Game State: Finished - Show Summary */}
          {gameState === 'finished' && showSummary && (
            <div className="w-full max-w-4xl">
              <PerformanceSummary
                finalScore={finalScore}
                rank={rank}
                correctAnswers={correctAnswers}
                totalPuzzles={currentPuzzles.length}
                hintsUsed={hintsUsed}
                wrongAttempts={wrongAttempts}
                completedIslands={completedIslands}
              />
            </div>
          )}
        </div>
      </GameFramework>

      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
      />
    </div>
  );
};

export default AdriaticCodebreaker;