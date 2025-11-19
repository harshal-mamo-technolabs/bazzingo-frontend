import React from 'react';
import TranslatedText from '../TranslatedText.jsx';

const DailyGameCard = ({ game, isMobile = false, onGameClick }) => {
  if (isMobile) {
    return (
      <div className="relative overflow-hidden flex items-center gap-4 p-2 rounded-2xl bg-[#eeeeee] hover:bg-gray-100 transition-colors">
        {/* ✅ Completed ribbon for mobile */}
        {game.isPlayed && (
          <div
            className="
              absolute right-[-20px] top-[18px]
              rotate-45
              bg-gradient-to-r from-green-500 to-green-300
              text-white font-semibold
              text-[9px] sm:text-[10px]
              py-1 px-6 sm:px-8
              rounded-md shadow-md
            "
          >
            <TranslatedText text="COMPLETED" />
          </div>
        )}

        <div className="flex-shrink-0 w-20 h-20 p-4 bg-white rounded-xl flex items-center justify-center">
          <img
            src={game.icon}
            alt={game.title}
            className="object-contain w-16 h-24"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-sm sm:text-base font-semibold text-gray-900">
            <TranslatedText text={game.title} />
          </h3>
          <button
            disabled={game.isPlayed}
            className={`w-2/5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors 
              ${
                game.isPlayed
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-[#FF6B3E] hover:bg-[#E55A35] text-white'
              }`}
            onClick={() => !game.isPlayed && onGameClick?.(game)}
          >
            <TranslatedText text="Play" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden flex flex-col items-center p-2 bg-gray-100 rounded-lg">
      {/* ✅ Completed ribbon for desktop */}
      {game.isPlayed && (
        <div
          className="
            absolute right-[-28px] top-[25px]
            rotate-45
            bg-gradient-to-r from-green-500 to-green-300
            text-white font-semibold
            text-[10px] md:text-[11px]
            py-1 px-6 md:px-8
            rounded-md shadow-md
          "
        >
          <TranslatedText text="COMPLETED" />
        </div>
      )}

      <div className="flex items-center justify-center w-full p-4 mb-2 bg-white rounded-lg">
        <img
          src={game.icon}
          alt={game.title}
          className="object-contain w-16 h-24"
        />
      </div>

      <h3 className="mb-2 text-base font-semibold text-gray-900">
        <TranslatedText text={game.title} />
      </h3>

      <button
        disabled={game.isPlayed}
        onClick={() => !game.isPlayed && onGameClick?.(game)}
        className={`w-full py-2 mt-auto font-medium rounded-lg transition-colors 
          ${
            game.isPlayed
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-[#FF6B3E] hover:bg-[#E55A35] text-white'
          }`}
      >
        <TranslatedText text="Play" />
      </button>
    </div>
  );
};

export default DailyGameCard;
