import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from './GameCard';

const GamesGrid = ({ games, pillConfig, activeCategory }) => {

  const navigate = useNavigate();

  return (
    <div className="mt-6 grid gap-3
                    grid-cols-2        /* mobile: 2 columns */
                    sm:grid-cols-2     /* small: 2 columns */
                    md:grid-cols-3     /* tablet: 3 columns */
                    lg:grid-cols-6     /* desktop: 6 columns */
                    auto-rows-fr"      /* Equal height rows */
      style={{
        gridAutoRows: 'minmax(150px, auto)'
      }}>
      {games.map(game => (
        <GameCard
          key={game.id}
          game={game}
          pillConfig={pillConfig}
          activeCategory={activeCategory}
          onClick={() => navigate(game.path)}
        />
      ))}
    </div>
  );
};

export default GamesGrid;
