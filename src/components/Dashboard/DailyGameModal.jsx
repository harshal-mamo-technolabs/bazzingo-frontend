import React from 'react';
import DailyGameCard from '../games/DailyGameCard.jsx';
import TranslatedText from '../TranslatedText.jsx';

const DailyGameModal = ({ isOpen, onClose, dailyGames, onGameClick }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="
            bg-white rounded-2xl shadow-lg
            w-[90%]          /* phones */
            sm:w-4/5         /* ≥640 px  */
            md:w-2/3         /* ≥768 px  */
            lg:w-[40%]       /* ≥1024 px */
            max-h-[90vh] overflow-y-auto
          "
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  <TranslatedText text="Daily Game" />
                </h2>
                <p className="mt-3 text-sm font-medium text-gray-600">
                  <TranslatedText text="3 Games Streak" />
                </p>
              </div>

              <button
                className="
                  bg-gray-100 hover:bg-gray-200
                  text-gray-700 text-sm font-medium
                  px-4 py-2 rounded-xl transition-colors
                "
                onClick={onClose}
              >
                <TranslatedText text="Skip" />
              </button>
            </div>
          </div>

          {/* Game tiles */}
          <div className="px-6">
            {/* Mobile: stacked cards */}
            <div className="sm:hidden space-y-4">
              {dailyGames.map(game => (
                <DailyGameCard
                  key={game.id}
                  game={game}           // contains .isPlayed
                  isMobile={true}
                  onGameClick={onGameClick}
                />
              ))}
            </div>

            {/* Tablet / Desktop: 3-column grid - larger gap for zoomed cards + animations */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {dailyGames.map(game => (
                <DailyGameCard
                  key={game.id}
                  game={game}           // contains .isPlayed
                  isMobile={false}
                  onGameClick={onGameClick}
                />
              ))}
            </div>
          </div>

          {/* bottom padding so last card isn't flush */}
          <div className="h-6" />
        </div>
      </div>
    </>
  );
};

export default DailyGameModal;
