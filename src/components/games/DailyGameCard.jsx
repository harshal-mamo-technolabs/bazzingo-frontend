import React from 'react';

const DailyGameCard = ({ game, isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="flex items-center gap-4 p-2 rounded-2xl bg-[#eeeeee] hover:bg-gray-100 transition-colors">
        <div className="flex-shrink-0 w-20 h-20 p-4 bg-white rounded-xl flex items-center justify-center">
          <img src={game.icon} alt={game.title} className="object-contain w-16 h-24" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-base font-semibold text-gray-900">{game.title}</h3>
          <button className="w-2/5 py-2 text-sm font-medium text-white rounded-xl bg-[#FF6B3E] hover:bg-[#E55A35] transition-colors">
            Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-2 bg-gray-100 rounded-lg">
      <div className="flex items-center justify-center w-full p-4 mb-2 bg-white rounded-lg">
        <img src={game.icon} alt={game.title} className="object-contain w-16 h-24" />
      </div>

      <h3 className="mb-2 text-base font-semibold text-gray-900">{game.title}</h3>

      <button className="w-full py-2 mt-auto font-medium text-white rounded-lg bg-[#FF6B3E] hover:bg-[#E55A35]">
        Play
      </button>
    </div>
  );
};

export default DailyGameCard;
