import React from 'react';
import TranslatedText from '../TranslatedText.jsx';

const GameCard = ({ game, pillConfig, onClick, activeCategory }) => {
  const shouldShowAsFeatured = game.featured && activeCategory !== 'Problem Solving';

  return (
    <div
      onClick={() => onClick(game)}
      className={`
        group relative rounded-2xl p-3 sm:p-4 cursor-pointer min-w-0 overflow-hidden
        bg-white/80 backdrop-blur-sm border border-gray-200/50 box-border
        hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1
        transition-all duration-300 ease-out
        ${shouldShowAsFeatured
          ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2'
          : ''
        }
      `}
    >
      <div className="flex flex-col h-full min-h-0 min-w-0">
        <div
          className="relative flex items-center justify-center rounded-xl mb-2 sm:mb-3 overflow-hidden min-w-0 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${game.bgColor}dd 0%, ${game.bgColor} 100%)`,
            aspectRatio: '4/3',
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
            className="object-contain relative z-10 group-hover:scale-110 transition-all duration-300 w-[85%] h-[85%]"
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

        <div className="flex-shrink-0 min-w-0 overflow-hidden mt-auto">
          {shouldShowAsFeatured ? (
            <div className="min-w-0">
              <h3 className="leading-tight min-w-0 text-base md:text-[34px] line-clamp-2
                             group-hover:text-[#FF6B3E] transition-colors duration-300 mb-1"
                style={{ fontWeight: '600', fontFamily: 'Roboto, sans-serif', color: '#1F2937' }}>
                <TranslatedText text={game.title} />
              </h3>
              <p className="leading-tight overflow-hidden text-xs md:text-base line-clamp-2"
                style={{ fontWeight: '400', fontFamily: 'Roboto, sans-serif', color: '#6B7280' }}>
                {game.description}
              </p>
            </div>
          ) : (
            <div className="min-w-0">
              <h4 className="leading-snug min-w-0 text-[12px] sm:text-[13px] md:text-base line-clamp-2
                             group-hover:text-[#FF6B3E] transition-colors duration-300 mb-0.5"
                style={{ fontWeight: '700', fontFamily: 'Roboto, sans-serif', color: '#1F2937' }}>
                <TranslatedText text={game.title} />
              </h4>
              <p className="leading-tight text-[10px] md:text-sm flex items-center gap-1"
                style={{ fontWeight: '500', fontFamily: 'Roboto, sans-serif', color: '#6B7280' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6B3E] flex-shrink-0"></span>
                <span className="truncate"><TranslatedText text={game.category} /></span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
