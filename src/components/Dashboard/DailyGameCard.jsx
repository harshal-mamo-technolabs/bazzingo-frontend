import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import {OrangeHeadBrainIllustrationIcon, RoyalStarBadgeIcon} from "../../../public/dashboard/index.js";

const DailyGameCard = ({ onGameClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconRef = useRef(null);
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
        {/* Daily Games Streak */}
        <div className="w-full lg:w-[220px] flex-shrink-0">
          <div className="bg-[#d4f2c6] h-full rounded-lg p-4 text-black w-full max-w-full md:max-w-none md:w-auto lg:max-w-none lg:w-auto lg:p-3">
            {/* Top label */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-normal">Daily Games Streak</span>
              </div>
              {/* Tooltip Trigger */}
              <div
                  ref={iconRef}
                  className="relative cursor-pointer"
                  onClick={() => handleTooltipClick(setShowTooltip)}
              >
                <Info className="w-4 h-4 text-black" />
                {/* Tooltip Popup */}
                {showTooltip && (
                    <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md">
                      Play daily games to build your streak and unlock badges.
                    </div>
                )}
              </div>
            </div>

            {/* Image + Text (responsive for mobile, stacked for web) */}
            <div className="lg:hidden bg-white rounded-xl p-2 flex items-center space-x-3 mb-4">
              <img
                  src={OrangeHeadBrainIllustrationIcon}
                  alt="Head silhouette"
                  className="w-16 h-16 object-contain"
                  loading="lazy"
                  decoding="async"
              />
              <div>
                <div className="text-sm font-semibold text-black">Memory Match</div>
                <div className="mt-1">
                <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-md inline-block">
                  Mini Test, 5–10 Question
                </span>
                </div>
              </div>
            </div>

            {/* Web layout image + text block */}
            <div className="hidden lg:block">
              <div className="bg-[#f5f5f5] rounded-t-lg mb-0">
                <img
                    src={OrangeHeadBrainIllustrationIcon}
                    alt="Head silhouette"
                    className="w-full object-contain p-2"
                    loading="lazy"
                    decoding="async"
                />
              </div>
              <div className="bg-[#f5f5f5] rounded-b-lg px-2 py-0">
                <div className="text-sm font-semibold text-black">Memory Match</div>
                <div className="mt-1">
                <span className="bg-gray-300 border-1 border-gray-400 text-gray-800 text-xs mb-3 font-medium px-2 py-[3px] rounded-md inline-block">
                  Mini Test, 5–10 Question
                </span>
                </div>
              </div>
            </div>

            {/* Pagination dots */}
            {/* Dots */}
            <div className="flex justify-center space-x-2 md:mt-3 mt-1 mb-2 md:mb-4">
              <div className="w-2 h-2 rounded-full opacity-80 bg-[#00443e]"></div>
              <div className="w-2 h-2 bg-gray-900 rounded-full opacity-20"></div>
              <div className="w-2 h-2 bg-gray-900 rounded-full opacity-20"></div>
            </div>

            {/* Badge Row */}
            <div className="flex items-center space-x-0 mb-2 md:mb-4 px-0">
            <span className="mr-1 lg:inline">
              <img src={RoyalStarBadgeIcon} className="mr-1" alt="Medal" loading="lazy" decoding="async" />
            </span>
              <span className="text-[12px] lg:text-[12px] font-medium text-black">
              Get your achievement badges
            </span>
            </div>

            {/* Button */}
            <button
                onClick={onGameClick}
                className="w-full bg-[#00332e] hover:bg-[#00443e] text-white text-sm font-semibold py-2.5 rounded-md"
            >
              Play Now
            </button>
          </div>
        </div>
      </>
  );
};

export default memo(DailyGameCard);
