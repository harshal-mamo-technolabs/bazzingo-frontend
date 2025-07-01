import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const NumberFlipGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Difficulty settings
  const difficultySettings = {
    Easy: { rows: 3, cols: 4, pairs: 6, timeLimit: 60 },
    Moderate: { rows: 4, cols: 4, pairs: 8, timeLimit: 50 },
    Hard: { rows: 4, cols: 6, pairs: 12, timeLimit: 40 }
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const totalCards = settings.pairs * 2;

    // Create pairs of numbers
    const numbers = [];
    for (let i = 1; i <= settings.pairs; i++) {
      numbers.push(i, i);
    }

    // Shuffle cards
    const shuffledCards = numbers.sort(() => Math.random() - 0.5).map((number, index) => ({
      id: index,
      number,
      isFlipped: false,
      isMatched: false
    }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setAttempts(0);
    setMatches(0);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setIsProcessing(false);
  }, [difficulty]);

  // Handle card flip
  const handleCardFlip = (cardId) => {
    if (gameState !== 'playing' || isProcessing) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];

    // Update card state
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setIsProcessing(true);
      setAttempts(prev => prev + 1);

      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard.number === secondCard.number) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            (c.id === firstCardId || c.id === secondCardId)
              ? { ...c, isMatched: true }
              : c
          ));
          setMatchedPairs(prev => new Set([...prev, firstCard.number]));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          setIsProcessing(false);
        }, 500);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            (c.id === firstCardId || c.id === secondCardId)
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    } else {
      setFlippedCards(newFlippedCards);
    }
  };

  // Calculate score
  useEffect(() => {
    if (attempts > 0) {
      const accuracy = matches / attempts;
      let newScore = accuracy * 200;

      // Time penalty: 1 point for every 3 seconds overtime
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;
      const expectedTime = settings.timeLimit * 0.7; // Expected completion time
      if (timeUsed > expectedTime) {
        const overtime = timeUsed - expectedTime;
        newScore -= Math.floor(overtime / 3);
      }

      setScore(Math.max(0, Math.min(200, newScore)));
    }
  }, [attempts, matches, timeRemaining, difficulty]);

  // Check win condition
  useEffect(() => {
    const settings = difficultySettings[difficulty];
    if (matches === settings.pairs && gameState === 'playing') {
      setGameState('finished');
    }
  }, [matches, difficulty, gameState]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
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
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
    // Here you would typically send the payload to your analytics service
  };

  const getGridCols = () => {
    const settings = difficultySettings[difficulty];
    return `grid-cols-${settings.cols}`;
  };

  const customStats = {
    attempts,
    matches,
    accuracy: attempts > 0 ? matches / attempts : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Number Flip"
        gameDescription="Match all hidden pairs of numbered cards before time runs out!"
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
          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Attempts
              </div>
              <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {attempts}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Matches
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {matches}/{difficultySettings[difficulty].pairs}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {attempts > 0 ? Math.round((matches / attempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Card Grid */}
          <div
            className={`grid gap-2 max-w-2xl mx-auto ${difficulty === 'Easy' ? 'grid-cols-4' :
              difficulty === 'Moderate' ? 'grid-cols-4' : 'grid-cols-6'
              }`}
          >
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardFlip(card.id)}
                disabled={card.isFlipped || card.isMatched || isProcessing}
                className={`
                  aspect-square w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 transition-all duration-300 flex items-center justify-center text-lg font-bold
                  ${card.isMatched
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : card.isFlipped
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-gray-200 border-gray-400 text-gray-400 hover:bg-gray-300 cursor-pointer'
                  }
                  ${isProcessing ? 'cursor-not-allowed' : ''}
                `}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {card.isFlipped || card.isMatched ? card.number : '?'}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center max-w-md">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Click cards to flip them. Match pairs of identical numbers.
              {flippedCards.length === 1 && ' Select another card to check for a match.'}
            </p>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default NumberFlipGame;
