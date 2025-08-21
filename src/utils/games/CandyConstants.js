export const candyTypes = {
  easy: ['🍎', '🍊', '🍋', '🍇', '🍓'],
  moderate: ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝'],
  hard: ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍑']
};

export const candyColors = {
  '🍎': 'bg-red-400',
  '🍊': 'bg-orange-400',
  '🍋': 'bg-yellow-400',
  '🍇': 'bg-purple-400',
  '🍓': 'bg-pink-400',
  '🥝': 'bg-green-400',
  '🍑': 'bg-red-500'
};

export const difficultySettings = {
  Easy: { gridSize: 5, timeLimit: 120, moves: 30, candyTypes: 5 },
  Moderate: { gridSize: 5, timeLimit: 100, moves: 25, candyTypes: 6 },
  Hard: { gridSize: 5, timeLimit: 80, moves: 20, candyTypes: 7 }
};

export const blobStyles = `
        @keyframes particleFloat {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--particle-x, 0), var(--particle-y, -50px)) scale(0);
          }
        }
        
        @keyframes explode {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes fallDown {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-explode {
          animation: explode 0.6s ease-out forwards;
        }
        
        .animate-fall {
          animation: fallDown 0.5s ease-out forwards;
        }
`;
