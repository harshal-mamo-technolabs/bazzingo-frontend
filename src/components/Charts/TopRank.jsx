import React from "react";
import { Info } from "lucide-react";


const TopRank = () => {
    return (
        <>
          {/* Middle Card - Rank and Bars */}
<div className="bg-[#EEEEEE] rounded-lg shadow-sm border border-gray-200 overflow-hidden">

  {/* Gradient Header - touching top */}
  <div
    className="relative px-4 py-3 flex items-center justify-center gap-4 rounded-t-lg"
    style={{
      background: 'linear-gradient(to right, #f1c0a0, #E34313, #f1c0a0)',
    }}
  >
    {/* Info Icon */}
    <div className="absolute top-2 right-2 text-black/70 text-base cursor-pointer">
      <Info className="w-4 h-4" />
    </div>

    {/* Left Stars */}
    <div className="flex items-center gap-[0px] text-orange-700">
      <span className="text-2xl mt-5">★</span>
      <span className="text-3xl mt-3">★</span>
      <span className="text-4xl mt-1">★</span>
    </div>

    {/* Center Text */}
    <div className="flex flex-col items-center justify-center leading-tight text-white">
      <span className="text-[10px]">Your Rank</span>
      <span className="text-3xl font-bold">250</span>
    </div>

    {/* Right Stars */}
    <div className="flex items-center gap-[0px] text-orange-700">
      <span className="text-4xl mt-1">★</span>
      <span className="text-3xl mt-3">★</span>
      <span className="text-2xl mt-5">★</span>
    </div>
  </div>

  {/* Content below gradient */}
  <div className="p-4 pt-3">
    {/* Total Game Played */}
    <div className="flex justify-between items-center text-sm text-black font-medium mb-1">
      <span>Total Game Played</span>
      <span className="text-orange-500 font-bold">25</span>
    </div>

    <hr className="mb-2 border-gray-300" />

    {/* Score Bars */}
    {['Speed', 'Attention', 'Memory', 'Flexibility', 'Troubleshooting'].map((label, index) => (
      <div key={index} className="flex items-center mb-2 gap-2 w-full">
        {/* Label */}
        <span className="text-[11px] text-gray-800 w-[80px]">{label}</span>

        {/* Progress Bar */}
        <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full"
            style={{
              width: '65%',
              background: 'linear-gradient(to right, #c56b49, #f97316)',
            }}
          ></div>
        </div>

        {/* Score Value */}
        <span className="text-[11px] text-gray-800 w-[30px] text-right">
          {index === 0 ? 1002 : 1001}
        </span>
      </div>
    ))}

    {/* Brain Score Index */}
    <hr className="my-2 border-gray-300" />
    <div className="flex justify-between items-center text-xs font-semibold text-black">
      <span>Brain Score Index</span>
      <span>1002</span>
    </div>

    {/* Button */}
    <button className="mt-4 w-full py-2 rounded-lg bg-[#ff5c33] hover:bg-[#ff3d0d] text-white text-xs font-medium shadow-md">
      <div className="flex justify-center items-center gap-2">
        Pushup your rank
        <span className="text-lg leading-none">→</span>
      </div>
    </button>
  </div>
</div>
    </>
    );
};

export default TopRank;