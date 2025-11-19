import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import TranslatedText from "../TranslatedText.jsx";

const DailyAssessmentCard = ({ onAssessmentClick, title, description, isCompleted=false }) => {
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
    <div className="relative w-full lg:w-[220px] flex-shrink-0">
      {/* ✅ Completed ribbon */}
      {isCompleted && (
        <div className="absolute right-[-18px] top-[12px] rotate-45 bg-gradient-to-r from-green-500 to-green-300 text-white font-semibold text-[10px] py-1 px-8 rounded-md shadow-md z-10">
          <TranslatedText text="COMPLETED" />
        </div>
      )}

      <div className="bg-[#f6c8bc] h-full rounded-lg text-black w-full max-w-full md:max-w-none md:w-auto lg:max-w-none lg:w-auto p-4 lg:p-3">
        {/* Top label */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm font-normal">
              <TranslatedText text="Daily Quick Assessment" />
            </span>
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
                <TranslatedText text="Quick daily test to boost memory and collect badges." />
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
            <div className="text-sm font-semibold text-black">
              <TranslatedText text={title} />
            </div>
            <div className="mt-1">
              <span className="bg-gray-300 border-1 border-gray-400 text-gray-800 text-xs font-medium px-3 py-1 rounded-md inline-block">
                <TranslatedText text="Mini Test, 5–10 Question" />
              </span>
            </div>
          </div>
        </div>

        {/* Web Layout */}
        <div className="hidden lg:block">
          <div className="bg-[#f5f5f5] rounded-t-lg mb-0">
            <img
              src="/vibrant-brain-icon.png"
              alt="Brain Icon"
              className="w-full object-contain p-2"
              loading="lazy"
              decoding="async"
            />
          </div>
            <div className="bg-[#f5f5f5] rounded-b-lg px-2 py-0">
            <div className="text-sm font-semibold text-black">
              <TranslatedText text={title} />
            </div>
            <div className="mt-1">
              <span className="bg-gray-300 border-1 border-gray-400 text-gray-800 text-xs mb-3 font-medium px-2 py-[3px] rounded-md inline-block">
                <TranslatedText text="Mini Test, 5–10 Question" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-0 md:mb-4 mb-2 px-0">
          <span className="mr-1 lg:inline">
            <img src="/medal-gold.png" className="mr-1" alt="Medal" loading="lazy" decoding="async" />
          </span>
          <span className="text-[12px] lg:text-[12px] font-medium text-black">
            <TranslatedText text="Get your achievement badges" />
          </span>
        </div>

        {/* ✅ Disabled button if completed */}
        <button
          className={`w-full text-white text-sm font-semibold py-2.5 rounded-md ${
            isCompleted ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00332e] hover:bg-[#00443e]'
          }`}
          onClick={() => {
            if (!isCompleted) onAssessmentClick();
          }}
          disabled={isCompleted}
          type="button"
        >
          {isCompleted ? (
            <TranslatedText text="Completed" />
          ) : (
            <TranslatedText text="Play Now" />
          )}
        </button>
      </div>
    </div>
  );
};

export default memo(DailyAssessmentCard);
