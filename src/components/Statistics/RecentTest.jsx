import React from "react";
import { Info } from "lucide-react";

const RecentTest = () =>{
    return (
        <>
         {/* Middle Card - Recent Tests */}
<div className="lg:w-[420px] h-[220px] bg-[#EEEEEE] rounded-xl p-4">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold text-gray-800">Recent Test</h3>
    <Info className="w-4 h-4 text-black" />
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