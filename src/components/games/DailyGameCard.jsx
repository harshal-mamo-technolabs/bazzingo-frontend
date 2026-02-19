import React from 'react';
import TranslatedText from '../TranslatedText.jsx';

const DEFAULT_CARD_BG = '#6366f1';

const DailyGameCard = ({ game, isMobile = false, onGameClick }) => {
  const bgColor = game.bgColor || DEFAULT_CARD_BG;

  if (isMobile) {
    return (
      <div className="group relative overflow-hidden flex items-center gap-4 p-3 rounded-2xl bg-[#eeeeee] hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5">
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

        <div
          className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${bgColor}dd 0%, ${bgColor} 100%)`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            if (game.isPlayed) return;
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2), inset 0 0 60px rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          }}
        >
          <img
            src={game.icon}
            alt={game.title}
            className="object-contain w-[85%] h-[85%] transition-all duration-300 group-hover:scale-110"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
            onMouseEnter={(e) => {
              if (game.isPlayed) return;
              e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(255,107,62,0.8)) drop-shadow(0 0 40px rgba(255,107,62,0.6))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[#FF6B3E] transition-colors duration-300">
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
    <div
      className="group relative overflow-hidden flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl min-h-0 cursor-pointer transition-all duration-300 ease-out hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1"
      onClick={() => !game.isPlayed && onGameClick?.(game)}
    >
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
            rounded-md shadow-md z-10
          "
        >
          <TranslatedText text="COMPLETED" />
        </div>
      )}

      {/* Image container - same as Games grid: gradient, aspect ratio, hover scale + glow */}
      <div
        className="relative flex items-center justify-center rounded-xl mb-3 w-full overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${bgColor}dd 0%, ${bgColor} 100%)`,
          aspectRatio: '4/3',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          if (game.isPlayed) return;
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2), inset 0 0 60px rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        <img
          src={game.icon}
          alt={game.title}
          className="object-contain relative z-10 w-[85%] h-[85%] transition-all duration-300 group-hover:scale-110"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
            transition: 'filter 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (game.isPlayed) return;
            e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(255,107,62,0.8)) drop-shadow(0 0 40px rgba(255,107,62,0.6))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
          }}
        />
      </div>

      <h3 className="mb-2 text-base font-semibold text-gray-900 group-hover:text-[#FF6B3E] transition-colors duration-300 min-w-0 text-center">
        <TranslatedText text={game.title} />
      </h3>

      <button
        disabled={game.isPlayed}
        onClick={(e) => { e.stopPropagation(); !game.isPlayed && onGameClick?.(game); }}
        className={`w-full py-2.5 mt-auto font-medium rounded-xl transition-colors 
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
