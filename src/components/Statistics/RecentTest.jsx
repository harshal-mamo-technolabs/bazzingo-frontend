import React,{useState, useRef} from "react";
import { Info } from "lucide-react";

const RecentTest = () =>{
  const [showTooltip, setShowTooltip] = useState(false);
  const iconRef = useRef(null);
  
  const handleTooltipClick = (setTooltipFn) => {
  setTooltipFn(true);
  setTimeout(() => {
    setTooltipFn(false);
  }, 3000); // auto close in 3 seconds
};
  
    return (
        <>
         {/* Middle Card - Recent Tests */}
<div className="lg:w-[420px] min-h-[220px] bg-[#EEEEEE] rounded-xl p-4">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold text-gray-800">Recent Test</h3>
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
                          This chart shows how your score improves over time based on your gameplay.
                        </div>
                      )}
                    </div>
  </div>
  <div className="space-y-3">
    {[24, 56].map((score, i) => (
      <div key={i} className="flex justify-between items-center bg-white rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/Brain_game.png" alt="test" className="w-10 h-10 rounded" />
          <div>
            <p className="text-sm font-medium text-gray-800 leading-none">General Cognitive Assessment</p>
            <p className="text-xs text-gray-500">Apr 20</p>
          </div>
        </div>
        <div className="text-lg font-bold text-black">{score}</div>
      </div>
    ))}
  </div>
</div>
        </>
    );
};
export default RecentTest;