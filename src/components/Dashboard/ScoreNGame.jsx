import React from "react";

const ScoreNGame = () => {
    return (
        <>
         {/* Desktop View (unchanged) */}
      <div className="hidden sm:flex col-span-1 md:col-span-2 bg-white rounded-lg px-6 py-6 shadow-sm border border-gray-100 h-[140px] items-center justify-between">
        {/* IQ Score Section */}
        <div className="flex items-center gap-8">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-700 text-xs font-medium">Your IQ</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-700 text-xs font-medium">Score</span>
        <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-600 font-bold">i</span>
        </div>
      </div>
      <div className="text-4xl font-bold text-gray-900 leading-none">125</div>
    </div>

    {/* Brain Icon */}
    <div className="flex items-center justify-center">
      <img src="/Group17.png" alt="Brain" className="w-18 h-[90px] object-contain" />
    </div>

    {/* Certificate Icon */}
    <div className="flex items-center justify-center">
      <img src="/Frame-certi.png" alt="Download Certificate" className="w-18 h-[90px] object-contain" />
    </div>
        </div>
        {/* Total Games Section */}
        <div className="flex items-center gap-4">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-700 text-xs font-medium">Total Game</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-700 text-xs font-medium">Played</span>
        <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-600 font-bold">i</span>
        </div>
      </div>
      <div className="text-4xl font-bold text-gray-900 leading-none">25</div>
    </div>

    {/* Puzzle Icon */}
    <div className="flex items-center justify-center">
      <img src="/Simplification.png" alt="Puzzle" className="w-18 h-[70px] object-contain" />
    </div>
          </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-100 space-y-4">
  {/* Top Row: IQ Score and Total Game Played */}
  <div className="flex justify-between items-center">
    {/* IQ Score */}
      <img src="/Group17.png" alt="Brain" className="w-10 h-10 mb-1" />
    <div className="flex flex-col items-center">
      <p className="text-xs text-gray-700 font-medium">Your IQ Score</p>
      <p className="text-2xl font-bold text-gray-900">125</p>
    </div>

    {/* Total Game Played */}
      <img src="/Simplification.png" alt="Puzzle" className="w-10 h-10 mb-1" />
    <div className="flex flex-col items-center">
      <p className="text-xs text-gray-700 font-medium text-center">Total Game Played</p>
      <p className="text-2xl font-bold text-gray-900">25</p>
    </div>
  </div>

  {/* Download Certificate Button */}
  <div className="flex justify-center">
    <button className="bg-[#d4dcdc] w-full justify-center text-[#003135] font-semibold text-sm rounded-md px-4 py-2 flex items-center gap-2">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 14a1 1 0 001 1h12a1 1 0 001-1v-1H3v1zm4-2h6v-2h3L10 3 4 10h3v2z" />
      </svg>
      Download Certificate
    </button>
  </div>
      </div>
        </>
    );
};
export default ScoreNGame;