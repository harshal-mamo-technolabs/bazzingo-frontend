import React, { useState, useEffect, useCallback } from 'react';
import { getUserProgramScores } from '../../services/dashbaordService';
import BazzingoLoader from '../Loading/BazzingoLoader';

const TestScore = ({ onIqDataLoaded, activeCategory = 'IQ Test', selectedTimeRange = 'last7Days' }) => {
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchProgramData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserProgramScores();
      setProgramData(response.data);
      
      // Call the callback function with the current program score for the active category
      if (onIqDataLoaded) {
        const categoryMap = {
          'IQ Test': 'iq-test',
          'Driving License': 'driving-license',
          'Logic': 'logic'
        };
        
        const categoryKey = categoryMap[activeCategory];
        if (categoryKey && response.data.programScore[categoryKey]) {
          onIqDataLoaded({
            currentIQ: response.data.programScore[categoryKey].programScore
          });
        }
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch program scores:", err);
      setError("Failed to load program scores");
    } finally {
      setLoading(false);
    }
  }, [onIqDataLoaded, activeCategory]);

  useEffect(() => {
    fetchProgramData();
  }, [fetchProgramData]);

  // Filter scores based on selected time range
  const filterScoresByTimeRange = (scores) => {
    if (!scores || !Array.isArray(scores)) return [];
    
    const now = new Date();
    let startDate;
    
    switch (selectedTimeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last7Days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last1Month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'last1Year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return scores;
    }
    
    return scores.filter(score => {
      const scoreDate = new Date(score.date);
      return scoreDate >= startDate;
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg overflow-hidden h-[330px] flex items-center justify-center">
        <BazzingoLoader message="Fetching today's stats..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg overflow-hidden h-[330px] flex items-center justify-center">
        <BazzingoLoader message="Failed to load scores" />
      </div>
    );
  }

  // Get data for the current category
  const getCategoryData = () => {
    if (!programData || !programData.programScore) return null;
    
    // Map category names to API keys
    const categoryMap = {
      'IQ Test': 'iq-test',
      'Driving License': 'driving-license',
      'Logic': 'logic'
    };
    
    const categoryKey = categoryMap[activeCategory];
    
    if (!categoryKey || !programData.programScore[categoryKey]) {
      return null;
    }
    
    const categoryData = {...programData.programScore[categoryKey]};
    
    // Filter scores based on time range
    categoryData.scores = filterScoresByTimeRange(categoryData.scores);
    
    return categoryData;
  };

  const categoryData = getCategoryData();

  if (!categoryData) {
    return (
      <div className="flex justify-center items-center h-[100px]">
        <div className="text-sm text-gray-500">No {activeCategory.toLowerCase()} data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center items-end gap-3 mt-0 h-[100px] overflow-hidden">
        {(() => {
          // Always show exactly 6 bars
          const totalBars = 6;
          
          // API returns scores with most recent first, but we need to display oldest to newest
          // So we reverse the array to get chronological order
          const chronologicalScores = [...categoryData.scores].reverse();
          const historicalScores = chronologicalScores.slice(0, totalBars);
          const historicalCount = historicalScores.length;
          
          // Calculate how many current score bars we need to show
          const currentScoreBarsCount = Math.max(0, totalBars - historicalCount);
          
          // Get the most recent date from historical scores to continue from
          let lastDate = historicalCount > 0 
            ? new Date(historicalScores[historicalCount - 1].date) // Most recent date is last in chronological array
            : new Date(); // If no historical data, start from today
          
          // Calculate max value for chart scaling
          const allScores = historicalScores.map(item => item.programScore);
          
          // Always include current score for scaling, even if no historical data
          if (categoryData.programScore > 0) {
            allScores.push(categoryData.programScore);
          }
          
          const chartMaxValue = Math.max(...allScores, 100) * 1.9; // Add 20% padding
          
          return (
            <>
              {/* Render historical scores in chronological order */}
              {historicalScores.map((item, idx) => {
                const score = item.programScore;
                const normalizedScore = Math.min(score, chartMaxValue);
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
                      {score}
                    </div>
                    <div className="text-[10px] text-gray-600 whitespace-nowrap">
                      {formattedDate}
                    </div>
                  </div>
                );
              })}
              
              {/* Render current score bars for remaining slots with forward dates */}
              {Array.from({ length: currentScoreBarsCount }).map((_, idx) => {
                const normalizedScore = Math.min(categoryData.programScore, chartMaxValue);
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
                      {categoryData.programScore}
                    </div>
                    <div className="text-[10px] text-gray-600 whitespace-nowrap">
                      {formattedDate}
                    </div>
                  </div>
                );
              })}
              
              {/* If no historical data and no current score bars, show at least one bar with current score */}
              {historicalCount === 0 && currentScoreBarsCount === 0 && categoryData.programScore > 0 && (
                <div className="flex flex-col items-center">
                  <div
                    className="w-5 bg-orange-500 rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${Math.min(categoryData.programScore, chartMaxValue) / chartMaxValue * 100}px`,
                    }}
                  ></div>
                  <div className="text-xs font-semibold mt-1">
                    {categoryData.programScore}
                  </div>
                  <div className="text-[10px] text-gray-600 whitespace-nowrap">
                    Today
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </>
  );
};

export default TestScore;