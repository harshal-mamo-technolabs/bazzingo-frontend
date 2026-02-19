import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from './GameCard';

const GamesGrid = ({ games, pillConfig, activeCategory }) => {
  const navigate = useNavigate();

  const handleGameClick = (game) => {
    navigate(game.path, { 
      state: { 
        gameId: game.gameId || game.id,
        gameName: game.title
      } 
    });
  };

  return (
    <div
      className="mt-6 w-full min-w-0 max-w-full grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 overflow-hidden"
    >
      {games.map(game => (
        <GameCard
          key={game.id}
          game={game}
          pillConfig={pillConfig}
          activeCategory={activeCategory}
          onClick={() => handleGameClick(game)}
        />
      ))}
    </div>
  );
};

export default GamesGrid;
