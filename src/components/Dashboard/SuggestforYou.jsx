import React from "react";

const SuggestforYou = () => {
    return (
        <>
          {/* Maze Escape */}
      <div className="carousel-card inline-block md:w-[95%] w-[70%] mr-3 bg-white rounded-md p-2 shrink-0 h-[170px] md:h-auto">
        <div className="bg-[#dceeff] rounded-md p-3 mb-2 flex justify-center items-center">
          <img src="/maze-escape-icon.png" alt="Maze Escape" className="w-20 h-20 md:w-10 md:h-10" />
        </div>
        <div className="text-xs font-semibold text-gray-800 mb-1">
          Maze Escape
          <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-2 py-[1px] rounded-full">Easy</span>
        </div>
        <p className="text-[11px] text-gray-500">Gamecay</p>
      </div>

      {/* Concentration */}
      <div className="carousel-card inline-block md:w-[95%] w-[70%] mr-3 bg-white rounded-md p-2 shrink-0 h-[170px] md:h-auto">
        <div className="bg-[#d5f4ee] rounded-md p-3 mb-2 flex justify-center items-center">
          <img src="/concentration-icon.png" alt="Concentration" className="w-20 h-20 md:w-10 md:h-10" />
        </div>
        <div className="text-xs font-semibold text-gray-800 mb-1">
          Concentration
          <span className="ml-2 text-[10px] bg-red-100 text-red-800 px-2 py-[1px] rounded-full">Hard</span>
        </div>
        <p className="text-[11px] text-gray-500">Logic</p>
      </div>
        </>
    );
};
export default SuggestforYou;