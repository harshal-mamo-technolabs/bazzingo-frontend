import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Brain, User, Cpu, Trophy, Lightbulb, CheckCircle, XCircle, Grid3X3, Zap, ChevronUp, ChevronDown } from 'lucide-react';

const TicTacToeGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesLost, setGamesLost] = useState(0);
  const [gamesDraw, setGamesDraw] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [moveStartTime, setMoveStartTime] = useState(0);
  const [gameDuration, setGameDuration] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameResult, setGameResult] = useState(null); // 'win', 'lose', 'draw', null
  const [winningLine, setWinningLine] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [aiSymbol, setAiSymbol] = useState('O');
  const [moveCount, setMoveCount] = useState(0);
  const [bestMove, setBestMove] = useState(null);
  const [showTicTacToeInstructions, setShowTicTacToeInstructions] = useState(true);
  
  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 300, lives: 5, hints: 3, aiStrength: 0.3, description: 'AI makes random moves 70% of the time' },
    Moderate: { timeLimit: 240, lives: 4, hints: 2, aiStrength: 0.6, description: 'AI plays strategically 60% of the time' },
    Hard: { timeLimit: 180, lives: 3, hints: 1, aiStrength: 0.9, description: 'AI plays optimally 90% of the time' }
  };

  // Winning combinations
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  // Check for winner
  const checkWinner = useCallback((currentBoard) => {
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combination };
      }
    }
    return null;
  }, []);

  // Check if board is full
  const isBoardFull = (currentBoard) => {
    return currentBoard.every(cell => cell !== null);
  };

  // Minimax algorithm for AI
  const minimax = useCallback((board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
    const winner = checkWinner(board);
    
    if (winner) {
      if (winner.winner === aiSymbol) return 10 - depth;
      if (winner.winner === playerSymbol) return depth - 10;
    }
    
    if (isBoardFull(board)) return 0;
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = aiSymbol;
          const evaluation = minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = playerSymbol;
          const evaluation = minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  }, [aiSymbol, playerSymbol, checkWinner]);

  // Get best move for AI
  const getBestMove = useCallback((currentBoard) => {
    let bestMove = -1;
    let bestValue = -Infinity;
    
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = aiSymbol;
        const moveValue = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        
        if (moveValue > bestValue) {
          bestMove = i;
          bestValue = moveValue;
        }
      }
    }
    
    return bestMove;
  }, [aiSymbol, minimax]);

  // Get random move
  const getRandomMove = (currentBoard) => {
    const availableMoves = currentBoard.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // AI move logic
  const makeAIMove = useCallback(() => {
    if (gameResult || isPlayerTurn) return;

    const settings = difficultySettings[difficulty];
    let aiMove;

    // Determine AI move based on difficulty
    if (Math.random() < settings.aiStrength) {
      // Strategic move
      aiMove = getBestMove([...board]);
    } else {
      // Random move
      aiMove = getRandomMove(board);
    }

    if (aiMove !== -1 && aiMove !== undefined) {
      setTimeout(() => {
        const newBoard = [...board];
        newBoard[aiMove] = aiSymbol;
        setBoard(newBoard);
        setMoveCount(prev => prev + 1);
        
        // Check for game end
        const winner = checkWinner(newBoard);
        if (winner) {
          handleGameEnd('lose', winner.line);
        } else if (isBoardFull(newBoard)) {
          handleGameEnd('draw');
        } else {
          setIsPlayerTurn(true);
          setMoveStartTime(Date.now());
        }
      }, 500); // AI thinking delay
    }
  }, [board, gameResult, isPlayerTurn, difficulty, aiSymbol, getBestMove, checkWinner]);

  // Handle player move
  const handlePlayerMove = (index) => {
    if (!isPlayerTurn || board[index] !== null || gameResult || gameState !== 'playing') return;

    const responseTime = Date.now() - moveStartTime;
    setTotalResponseTime(prev => prev + responseTime);

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);
    setMoveCount(prev => prev + 1);
    setIsPlayerTurn(false);

    // Check for game end
    const winner = checkWinner(newBoard);
    if (winner) {
      handleGameEnd('win', winner.line);
    } else if (isBoardFull(newBoard)) {
      handleGameEnd('draw');
    }
  };

  // Handle game end
  const handleGameEnd = (result, line = null) => {
    setGameResult(result);
    setWinningLine(line);
    setTotalGames(prev => prev + 1);

    let message = '';
    let type = '';

    switch (result) {
      case 'win':
        setGamesWon(prev => prev + 1);
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(current => Math.max(current, newStreak));
          return newStreak;
        });
        setCurrentLevel(prev => prev + 1);
        message = 'You Win! Great strategy!';
        type = 'win';
        break;
      case 'lose':
        setGamesLost(prev => prev + 1);
        setStreak(0);
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            const endTime = Date.now();
            const duration = Math.floor((endTime - gameStartTime) / 1000);
            setGameDuration(duration);
            setFinalScore(score);
            setGameState('finished');
            setShowCompletionModal(true);
          }
          return newLives;
        });
        message = 'AI Wins! Try a different strategy.';
        type = 'lose';
        break;
      case 'draw':
        setGamesDraw(prev => prev + 1);
        message = "It's a Draw! Well played!";
        type = 'draw';
        break;
    }

    setFeedbackMessage(message);
    setFeedbackType(type);
    setShowFeedback(true);

    setTimeout(() => {
      if (result !== 'lose' || lives > 1) {
        startNewGame();
      }
    }, 2500);
  };

  // Start new game
  const startNewGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameResult(null);
    setWinningLine(null);
    setShowFeedback(false);
    setMoveCount(0);
    setBestMove(null);
    setMoveStartTime(Date.now());
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !isPlayerTurn || gameResult) return;
    
    setHintsUsed(prev => prev + 1);
    const bestMove = getBestMove([...board]);
    setBestMove(bestMove);
    
    setTimeout(() => {
      setBestMove(null);
    }, 3000);
  };

  // Calculate score
  const calculateScore = useCallback(() => {
    if (totalGames === 0 || gameState !== 'playing') return score;
    
    const settings = difficultySettings[difficulty];
    const winRate = gamesWon / totalGames;
    const avgResponseTime = totalGames > 0 ? totalResponseTime / totalGames / 1000 : 0;
    
    // Base score from win rate (0-90 points)
    let baseScore = winRate * 90;
    
    // Time bonus (max 25 points)
    const idealTime = difficulty === 'Easy' ? 8 : difficulty === 'Moderate' ? 6 : 4;
    const timeBonus = Math.max(0, Math.min(25, (idealTime - avgResponseTime) * 3));
    
    // Streak bonus (max 30 points)
    const streakBonus = Math.min(maxStreak * 4, 30);
    
    // Level progression bonus (max 20 points)
    const levelBonus = Math.min(currentLevel * 1.5, 20);
    
    // Lives bonus (max 15 points)
    const livesBonus = (lives / settings.lives) * 15;
    
    // Hints penalty (subtract up to 15 points)
    const hintsPenalty = (hintsUsed / settings.hints) * 15;
    
    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;
    
    // Time remaining bonus (max 15 points)
    const timeRemainingBonus = Math.min(15, (timeRemaining / settings.timeLimit) * 15);
    
    let finalScore = (baseScore + timeBonus + streakBonus + levelBonus + livesBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;
    
    // Apply final modifier to make 200 very challenging
    finalScore = finalScore * 0.85;
    
    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [gamesWon, totalGames, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty, gameState, score]);

  // Update score only during active gameplay
  useEffect(() => {
    if (gameState === 'playing') {
      const newScore = calculateScore();
      setScore(newScore);
    }
  }, [calculateScore, gameState]);

  // AI move effect
  useEffect(() => {
    if (!isPlayerTurn && !gameResult && gameState === 'playing') {
      makeAIMove();
    }
  }, [isPlayerTurn, gameResult, gameState, makeAIMove]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            const endTime = Date.now();
            const duration = Math.floor((endTime - gameStartTime) / 1000);
            setGameDuration(duration);
            setFinalScore(score);
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, gameStartTime, score]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentLevel(1);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setGamesWon(0);
    setGamesLost(0);
    setGamesDraw(0);
    setTotalGames(0);
    setTotalResponseTime(0);
    setGameDuration(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
    startNewGame();
  };

  const handleReset = () => {
    initializeGame();
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameResult(null);
    setWinningLine(null);
    setShowFeedback(false);
    setMoveCount(0);
    setBestMove(null);
    setShowCompletionModal(false);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  // Prevent difficulty change during gameplay or when finished
  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') {
      setDifficulty(newDifficulty);
    }
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    lives,
    hintsUsed,
    gamesWon,
    gamesLost,
    gamesDraw,
    totalGames,
    winRate: totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0,
    averageResponseTime: totalGames > 0 ? Math.round(totalResponseTime / totalGames / 1000) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />
      
      <GameFramework
        gameTitle="Tic-Tac-Toe Strategy"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle icon */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowTicTacToeInstructions(!showTicTacToeInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Tic-Tac-Toe Strategy
                </h3>
                <span className="text-blue-900 text-xl">
                  {showTicTacToeInstructions
  ? <ChevronUp className="h-5 w-5 text-blue-900" />
  : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Instructions */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showTicTacToeInstructions ? '' : 'hidden'}`}>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Get three of your symbols in a row (horizontally, vertically, or diagonally) before the AI does.
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🤖 AI Difficulty
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• <strong>Easy:</strong> AI makes random moves 70% of time</li>
                    <li>• <strong>Moderate:</strong> AI plays strategically 60% of time</li>
                    <li>• <strong>Hard:</strong> AI plays optimally 90% of time</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    📊 Scoring
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Win rate and speed bonuses</li>
                    <li>• Streak multipliers for consecutive wins</li>
                    <li>• Level progression rewards</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    💡 Strategy
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Control the center square</li>
                    <li>• Block opponent's winning moves</li>
                    <li>• Create multiple winning threats</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Logic"
        gameState={gameState}
        setGameState={setGameState}
        score={gameState === 'finished' ? finalScore : score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={handleDifficultyChange}
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
                disabled={hintsUsed >= maxHints || !isPlayerTurn || gameResult}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  hintsUsed >= maxHints || !isPlayerTurn || gameResult
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
                Level
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
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
                Win Rate
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.winRate}%
              </div>
            </div>
          </div>

          {/* Player Selection */}
          {gameState === 'ready' && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Choose Your Symbol
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setPlayerSymbol('X');
                      setAiSymbol('O');
                    }}
                    className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                      playerSymbol === 'X'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                  >
                    <div className="text-2xl font-bold mb-1">X</div>
                    <div className="text-sm">You go first</div>
                  </button>
                  <button
                    onClick={() => {
                      setPlayerSymbol('O');
                      setAiSymbol('X');
                      setIsPlayerTurn(false);
                    }}
                    className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                      playerSymbol === 'O'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                  >
                    <div className="text-2xl font-bold mb-1">O</div>
                    <div className="text-sm">AI goes first</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Board */}
          <div className="w-full max-w-md mb-6">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              {/* Turn Indicator */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isPlayerTurn ? <User className="h-5 w-5 text-blue-600" /> : <Cpu className="h-5 w-5 text-red-600" />}
                  <span className="font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {gameResult ? 'Game Over' : isPlayerTurn ? 'Your Turn' : 'AI Thinking...'}
                  </span>
                </div>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  You: {playerSymbol} | AI: {aiSymbol}
                </div>
              </div>

              {/* Tic-Tac-Toe Grid */}
              <div className="grid grid-cols-3 gap-2 bg-gray-800 p-2 rounded-lg">
                {board.map((cell, index) => (
                  <button
                    key={index}
                    onClick={() => handlePlayerMove(index)}
                    disabled={!isPlayerTurn || cell !== null || gameResult || gameState !== 'playing'}
                    className={`
                      aspect-square bg-white rounded-lg flex items-center justify-center text-4xl font-bold
                      transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed
                      ${winningLine && winningLine.includes(index) ? 'bg-green-100 border-2 border-green-500' : ''}
                      ${bestMove === index ? 'bg-yellow-100 border-2 border-yellow-500 animate-pulse' : ''}
                      ${cell === playerSymbol ? 'text-blue-600' : cell === aiSymbol ? 'text-red-600' : 'text-gray-400'}
                    `}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {cell || (bestMove === index ? '💡' : '')}
                  </button>
                ))}
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {gamesWon}
                  </div>
                  <div className="text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Wins
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-semibold text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {gamesDraw}
                  </div>
                  <div className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Draws
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <div className="font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {gamesLost}
                  </div>
                  <div className="text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Losses
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-4 rounded-lg ${
              feedbackType === 'win' ? 'bg-green-100 text-green-800' : 
              feedbackType === 'lose' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'win' ? (
                  <Trophy className="h-6 w-6 text-green-600" />
                ) : feedbackType === 'lose' ? (
                  <XCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-yellow-600" />
                )}
                <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'win' ? 'Victory!' : feedbackType === 'lose' ? 'Defeat!' : 'Draw!'}
                </div>
              </div>
              <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackMessage}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Click on empty squares to place your symbol. Get three in a row to win!
              Use hints to see the AI's recommended move for strategic learning.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].description} | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints
            </div>
          </div>
        </div>
      </GameFramework>
      
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
        difficulty={difficulty}
        duration={gameDuration}
        customStats={{
          correctAnswers: gamesWon,
          totalQuestions: totalGames
        }}
      />
    </div>
  );
};

export default TicTacToeGame;