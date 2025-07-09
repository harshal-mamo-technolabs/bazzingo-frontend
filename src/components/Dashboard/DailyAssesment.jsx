import React from "react";
import { Info } from "lucide-react";

const DailyAssesment = ({ onAssesmentClick }) => {
    return (
        <>
        <div className="bg-[#f6c8bc] h-full rounded-lg text-black w-full max-w-full md:max-w-none md:w-auto lg:max-w-none lg:w-auto p-4 lg:p-3">

        {/* Top label */}
        <div className="flex items-center justify-between mb-3">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
      <span className="text-sm font-normal">Daily Quick Assesment</span>
    </div>
    <Info className='w-4 h-4' />
        </div>
         {/* Mobile Layout */}
        <div className="lg:hidden bg-white rounded-xl p-2 flex items-center space-x-3 mb-4">
    <img
      src="/vibrant-brain-icon.png"
      alt="Brain Icon"
      className="w-16 h-16 object-contain"
    />
    <div>
      <div className="text-sm font-semibold text-black">Memory Match</div>
      <div className="mt-1">
        <span className="bg-gray-300 border-1 border-gray-400 text-gray-800 text-xs font-medium px-3 py-1 rounded-md inline-block">
          Mini Test, 5–10 Question
        </span>
      </div>
    </div>
        </div>

          {/* Web Layout */}
          <div className="hidden lg:block">
    {/* Image box */}
    <div className="bg-[#f5f5f5] rounded-t-lg mb-0">
      <img
        src="/vibrant-brain-icon.png"
        alt="Brain Icon"
        className="w-full object-contain p-2"
      />
    </div>

    {/* Title & subtitle */}
    <div className="bg-[#f5f5f5] rounded-b-lg px-2 py-0">
      <div className="text-sm font-semibold text-black">Memory Match</div>
      <div className="mt-1">
        <span className="bg-gray-300 border-1 border-gray-400 text-gray-800 text-xs mb-3 font-medium px-2 py-[3px] rounded-md inline-block">
          Mini Test, 5–10 Question
        </span>
      </div>
    </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-2 md:mt-3 mt-1 mb-2 md:mb-4">
    <div className="w-2 h-2 rounded-full opacity-80 bg-[#00443e]"></div>
    <div className="w-2 h-2 bg-gray-900 rounded-full opacity-20"></div>
    <div className="w-2 h-2 bg-gray-900 rounded-full opacity-20"></div>
      </div>

       {/* Badge Row */}
      <div className="flex items-center space-x-0 md:mb-4 mb-2 px-0">
    <span className="mr-1 lg:inline"><img src='/medal-gold.png' className='mr-1'/></span>
    <span className="text-[12px] lg:text-[12px] font-medium text-black">Get your achievement badges</span>
      </div>

      {/* Button */}
      <button className="w-full bg-[#00332e] hover:bg-[#00443e] text-white text-sm font-semibold py-2.5 rounded-md" onClick={onAssesmentClick}>
      Play Now
      </button>
        </div>
        </>
    );
};
export default DailyAssesment;