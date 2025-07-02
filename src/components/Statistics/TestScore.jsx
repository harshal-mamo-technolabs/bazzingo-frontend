import React from 'react';

const TestScore = () => {
    return (
        <>
    <div className="flex justify-center items-end gap-3 mt-0 h-[100px] overflow-hidden">
        {(() => {
        const data = [
        { date: '20 Apr', score: 180 },
        { date: '21 Apr', score: 200 },
        { date: '22 Apr', score: 85 },
        { date: '23 Apr', score: 160 },
        { date: '24 Apr', score: 25 },
        { date: '25 Apr', score: 50 },
        { date: '26 Apr', score: 95 },
        ];
        const chartMaxValue = 350; // logical chart max
        return data.map((item, idx) => {
        const normalizedScore = Math.min(item.score, chartMaxValue);
        const barHeight = (normalizedScore / chartMaxValue) * 100;
        return (
          <div key={idx} className="flex flex-col items-center">
            <div
              className="w-5 bg-orange-500 rounded-t-lg transition-all duration-300"
              style={{
                height: `${barHeight}px`,
              }}
            ></div>
            <div className="text-xs font-semibold mt-1">
              {item.score}
            </div>
            <div className="text-[10px] text-gray-600">
              {item.date}
            </div>
          </div>
        );
      });
    })()}
    </div>
        </>
    );
};
export default TestScore;