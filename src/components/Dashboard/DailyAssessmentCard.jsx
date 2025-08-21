import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

const DailyAssessmentCard = ({ onAssessmentClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef(null);

  const handleTooltipClick = useCallback((setTooltipFn) => {
    setTooltipFn(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTooltipFn(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
      <>
        <div className="w-full lg:w-[220px] flex-shrink-0">
          <div className="bg-[#f6c8bc] h-full rounded-lg text-black w-full max-w-full md:max-w-none md:w-auto lg:max-w-none lg:w-auto p-4 lg:p-3">
            {/* Top label */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-normal">Daily Quick Assesment</span>
              </div>

              {/* Tooltip Trigger */}
              <div
                  className="relative cursor-pointer"
                  onClick={() => handleTooltipClick(setShowTooltip)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleTooltipClick(setShowTooltip)}
                  aria-label="More info about Daily Quick Assessment"
              >
                <Info className="w-4 h-4 text-black" />
                {/* Tooltip Popup */}
                {showTooltip && (
                    <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md">
                      Quick daily test to boost memory and collect badges.
                    </div>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden bg-white rounded-xl p-2 flex items-center space-x-3 mb-4">
              <img
                  src="/vibrant-brain-icon.png"
                  alt="Brain Icon"
                  className="w-16 h-16 object-contain"
                  loading="lazy"
                  decoding="async"
              />
              <div>
                <div className="text-sm font-semibold text-black">Memory Match</div>
                <div className="mt-1">
                  {/* keeping `border-1` as-is to avoid visual changes */}
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
                    loading="lazy"
                    decoding="async"
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
            <span className="mr-1 lg:inline">
              <img src="/medal-gold.png" className="mr-1" alt="Medal" loading="lazy" decoding="async" />
            </span>
              <span className="text-[12px] lg:text-[12px] font-medium text-black">Get your achievement badges</span>
            </div>

            {/* Button */}
            <button
                className="w-full bg-[#00332e] hover:bg-[#00443e] text-white text-sm font-semibold py-2.5 rounded-md"
                onClick={onAssessmentClick}
                type="button"
            >
              Play Now
            </button>
          </div>
        </div>
      </>
  );
};

export default memo(DailyAssessmentCard);