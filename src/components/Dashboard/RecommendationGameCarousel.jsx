import React from "react";
import InfoTooltip from "../InfoToolTip.jsx";
import handleTooltipClick from "../../utils/toolTipHandler.js";

const RecommendationGameCarousel = ({showTooltipSuggest, setShowTooltipSuggest}) => {
    return (
        <>
          <div className="bg-[#fef3c7] rounded-lg p-3 shadow-sm border border-gray-100 w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-normal text-gray-900">Suggest for You</h3>
              <InfoTooltip
                  text="Personalized suggestions to help improve your performance."
                  visible={showTooltipSuggest}
                  onTrigger={() => handleTooltipClick(setShowTooltipSuggest)}
              />
            </div>

            <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-3 whitespace-nowrap scrollbar-hide">
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
            </div>
          </div>
        </>
    );
};
export default RecommendationGameCarousel;