import React from 'react';

const GameCard = ({ game, pillConfig, onClick }) => {
  return (
    <div
      onClick={() => onClick(game)}
      className={`
        bg-[#E5E5E5] rounded-lg p-3 relative hover:shadow-lg transition-shadow cursor-pointer
        ${game.featured
          ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2'
          : ''
        }
      `}
      style={{
        aspectRatio: game.featured ? '1/1' : '1/1',
        minHeight: game.featured ? '200px' : '150px'
      }}
    >
      <div className="flex flex-col justify-between h-full min-h-0">
        {/* Image + coloured BG */}
        <div
          className="flex-1 relative flex items-center justify-center rounded-lg mb-2"
          style={{
            backgroundColor: game.bgColor,
            minHeight: game.featured ? '120px' : '80px'
          }}
        >
          {game.trending && (
            <span
              className="absolute top-1 right-1 inline-block px-1.5 py-0.5 text-[8px] font-semibold rounded-full"
              style={{
                backgroundColor: pillConfig.Trending.bg,
                color: pillConfig.Trending.text
              }}
            >
              #Trending
            </span>
          )}
          <img
            src={game.icon}
            alt={game.title}
            className={`
              object-contain max-w-full max-h-full
              ${game.featured
                ? 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40'
                : 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16'
              }
            `}
          />
        </div>

        {/* Title + Pill + Category/Description */}
        <div className="flex-shrink-0">
          {game.featured ? (
            <div>
              <div className="flex items-start gap-2 mb-2">
                <h3 className="leading-tight flex-1 min-w-0 text-base md:text-[34px]"
                  style={{
                    fontWeight: '500',
                    fontFamily: 'Roboto, sans-serif',
                    color: '#000000'
                  }}>
                  {game.title}
                </h3>
                <span
                  className="inline-block px-2 py-1 text-[10px] font-semibold rounded-full border flex-shrink-0"
                  style={{
                    backgroundColor: pillConfig[game.difficulty].bg,
                    borderColor: pillConfig[game.difficulty].border,
                    color: pillConfig[game.difficulty].text
                  }}
                >
                  {game.difficulty}
                </span>
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
                <h4 className="leading-tight flex-1 min-w-0 text-[13px] md:text-base"
                  style={{
                    fontWeight: '600',
                    fontFamily: 'Roboto, sans-serif',
                    color: '#000000'
                  }}>
                  {game.title}
                </h4>
                <span
                  className="inline-block px-1.5 py-0.5 text-[8px] font-semibold rounded-full border flex-shrink-0"
                  style={{
                    backgroundColor: pillConfig[game.difficulty].bg,
                    borderColor: pillConfig[game.difficulty].border,
                    color: pillConfig[game.difficulty].text
                  }}
                >
                  {game.difficulty}
                </span>
              </div>
              <p className="leading-tight text-[10px] md:text-sm"
                style={{
                  fontWeight: '500',
                  fontFamily: 'Roboto, sans-serif',
                  color: '#6B7280'
                }}>
                {game.category}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
