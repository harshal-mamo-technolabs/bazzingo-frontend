import React, { useState, useEffect } from 'react';
import { getUserIqScores } from '../../services/dashbaordService';
import BazzingoLoader from '../Loading/BazzingoLoader';

const TestScore = ({ onIqDataLoaded }) => { // Add callback prop
  const [iqData, setIqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchIqData = async () => {
      try {
        setLoading(true);
        const response = await getUserIqScores();
        setIqData(response.data);
        
        // Call the callback function with the IQ data
        if (onIqDataLoaded) {
          onIqDataLoaded(response.data);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch IQ scores:", err);
        setError("Failed to load IQ scores");
      } finally {
        setLoading(false);
      }
    };

    fetchIqData();
  }, [onIqDataLoaded]); // Add callback to dependency array

  if (loading) {
    return (
      <div className="rounded-lg overflow-hidden h-[330px] flex items-center justify-center">
        <BazzingoLoader message="Fetching today's stats..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg  overflow-hidden h-[330px] flex items-center justify-center">
        <BazzingoLoader message="Failed to load IQ scores" />
      </div>
    );
  }

  if (!iqData || !iqData.iqScores || iqData.iqScores.length === 0) {
    return (
      <div className="flex justify-center items-center h-[100px]">
        <div className="text-sm text-gray-500">No IQ test data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center items-end gap-3 mt-0 h-[100px] overflow-hidden">
        {(() => {
          // Always show exactly 7 bars
          const totalBars = 6;
          
          // API returns scores with most recent first, but we need to display oldest to newest
          // So we reverse the array to get chronological order
          const chronologicalScores = [...iqData.iqScores].reverse();
          const historicalScores = chronologicalScores.slice(0, totalBars);
          const historicalCount = historicalScores.length;
          
          // Calculate how many current IQ bars we need to show
          const currentIqBarsCount = Math.max(0, totalBars - historicalCount);
          
          // Get the most recent date from historical scores to continue from
          let lastDate = historicalCount > 0 
            ? new Date(historicalScores[historicalCount - 1].date) // Most recent date is last in chronological array
            : new Date(); // If no historical data, start from today
          
          // Calculate max value for chart scaling (include current IQ if needed)
          const allScores = historicalScores.map(item => item.iqScore);
          if (currentIqBarsCount > 0) {
            allScores.push(iqData.currentIQ);
          }
          const chartMaxValue = Math.max(...allScores, 100) * 1.9; // Add 20% padding
          
          return (
            <>
              {/* Render historical scores in chronological order */}
              {historicalScores.map((item, idx) => {
                const normalizedScore = Math.min(item.iqScore, chartMaxValue);
                const barHeight = (normalizedScore / chartMaxValue) * 100;
                
                // Format date to short format (e.g., "11 Sep")
                const dateObj = new Date(item.date);
                const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`;
                
                return (
                  <div key={item._id || idx} className="flex flex-col items-center">
                    <div
                      className="w-5 bg-orange-500 rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${barHeight}px`,
                      }}
                    ></div>
                    <div className="text-xs font-semibold mt-1">
                      {item.iqScore}
                    </div>
                    <div className="text-[10px] text-gray-600 whitespace-nowrap">
                      {formattedDate}
                    </div>
                  </div>
                );
              })}
              
              {/* Render current IQ bars for remaining slots with forward dates */}
              {Array.from({ length: currentIqBarsCount }).map((_, idx) => {
                const normalizedScore = Math.min(iqData.currentIQ, chartMaxValue);
                const barHeight = (normalizedScore / chartMaxValue) * 100;
                
                // Calculate the next date (one day after the previous date)
                const nextDate = new Date(lastDate);
                nextDate.setDate(nextDate.getDate() + 1); // Go forward one day for the next bar
                lastDate = nextDate; // Update for the next iteration
                
                // Format date to short format (e.g., "11 Sep")
                const formattedDate = `${nextDate.getDate()} ${nextDate.toLocaleString('default', { month: 'short' })}`;
                
                return (
                  <div key={`current-${idx}`} className="flex flex-col items-center">
                    <div
                      className="w-5 bg-orange-500 rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${barHeight}px`,
                      }}
                    ></div>
                    <div className="text-xs font-semibold mt-1">
                      {iqData.currentIQ}
                    </div>
                    <div className="text-[10px] text-gray-600 whitespace-nowrap">
                      {formattedDate}
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}
      </div>
    </>
  );
};

export default TestScore;