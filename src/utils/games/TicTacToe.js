// Difficulty settings
export const difficultySettings = {
    Easy: { timeLimit: 300, lives: 5, hints: 3, aiStrength: 0.3, description: 'AI makes random moves 70% of the time' },
    Moderate: { timeLimit: 240, lives: 4, hints: 2, aiStrength: 0.6, description: 'AI plays strategically 60% of the time' },
    Hard: { timeLimit: 180, lives: 3, hints: 1, aiStrength: 0.9, description: 'AI plays optimally 90% of the time' }
  };

// Winning combinations
export const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

export const checkWinner = (currentBoard) => {
  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return { winner: currentBoard[a], line: combination };
    }
  }
  return null;
};

// Check if board is full
export const isBoardFull = (currentBoard) => {
    return currentBoard.every(cell => cell !== null);
  };

// Get random move
export const getRandomMove = (currentBoard) => {
    const availableMoves = currentBoard.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };