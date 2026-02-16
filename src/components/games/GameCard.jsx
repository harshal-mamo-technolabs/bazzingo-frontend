import React from 'react';
import TranslatedText from '../TranslatedText.jsx';

const GameCard = ({ game, pillConfig, onClick, activeCategory }) => {
  // Override featured styling if filtering by Problem Solving
  const shouldShowAsFeatured = game.featured && activeCategory !== 'Problem Solving';

  return (
    <div
      onClick={() => onClick(game)}
      className={`
        group relative rounded-2xl p-4 cursor-pointer
        bg-white/80 backdrop-blur-sm
        border border-gray-200/50
        hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1
        transition-all duration-300 ease-out
        ${shouldShowAsFeatured
          ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2'
          : ''
        }
      `}
      style={{
        aspectRatio: shouldShowAsFeatured ? '1/1' : '1/1',
        minHeight: shouldShowAsFeatured ? '200px' : '150px'
      }}
    >
      <div className="flex flex-col justify-between h-full min-h-0">
        {/* Image + coloured BG */}
        <div
          className="flex-1 relative flex items-center justify-center rounded-xl mb-3 overflow-hidden
                     transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${game.bgColor}dd 0%, ${game.bgColor} 100%)`,
            minHeight: shouldShowAsFeatured ? '140px' : '100px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2), inset 0 0 60px rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {game.trending && (
            <span
              className="absolute top-2 right-2 inline-block px-2 py-1 text-[9px] font-bold rounded-full
                         animate-pulse shadow-lg"
              style={{
                backgroundColor: pillConfig.Trending.bg,
                color: pillConfig.Trending.text
              }}
            >
              <TranslatedText text="🔥 Trending" />
            </span>
          )}
          <img
            src={game.icon}
            alt={game.title}
            className={`
              object-contain max-w-full max-h-full relative z-10
              group-hover:scale-110 transition-all duration-300
              ${shouldShowAsFeatured
                ? 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64'
                : 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28'
              }
            `}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              transition: 'filter 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(255,107,62,0.8)) drop-shadow(0 0 40px rgba(255,107,62,0.6))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
            }}
          />
        </div>

        {/* Title + Pill + Category/Description */}
        <div className="flex-shrink-0">
          {shouldShowAsFeatured ? (
            <div>
              <div className="flex items-start gap-2 mb-2">
                <h3 className="leading-tight flex-1 min-w-0 text-base md:text-[34px] 
                               group-hover:text-[#FF6B3E] transition-colors duration-300"
                  style={{
                    fontWeight: '600',
                    fontFamily: 'Roboto, sans-serif',
                    color: '#1F2937'
                  }}>
                  <TranslatedText text={game.title} />
                </h3>
              </div>
              <p className="leading-tight overflow-hidden text-xs md:text-base"
                style={{
                  fontWeight: '400',
                  fontFamily: 'Roboto, sans-serif',
                  color: '#6B7280',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                {game.description}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-start gap-1 mb-1">
                <h4 className="leading-tight flex-1 min-w-0 text-[13px] md:text-base
                               group-hover:text-[#FF6B3E] transition-colors duration-300"
                  style={{
                    fontWeight: '700',
                    fontFamily: 'Roboto, sans-serif',
                    color: '#1F2937'
                  }}>
                  <TranslatedText text={game.title} />
                </h4>
              </div>
              <p className="leading-tight text-[10px] md:text-sm flex items-center gap-1"
                style={{
                  fontWeight: '500',
                  fontFamily: 'Roboto, sans-serif',
                  color: '#6B7280'
                }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6B3E]"></span>
                <TranslatedText text={game.category} />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;