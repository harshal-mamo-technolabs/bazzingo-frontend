import React, { useState, useEffect } from 'react';
import { getUserProgramScores } from '../../services/dashbaordService';
import BazzingoLoader from '../Loading/BazzingoLoader';

const TestScore = ({ onIqDataLoaded, activeCategory = 'IQ Test' }) => {
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      const response = await getUserProgramScores();
      setProgramData(response.data);
      
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
  };

  useEffect(() => {
    fetchProgramData();
  }, [activeCategory]);

  if (loading) {
    return (
      <div className="rounded-lg overflow-hidden h-[330px] flex items-center justify-center">
        <BazzingoLoader message="Fetching latest scores..." />
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

  const getCategoryData = () => {
    if (!programData || !programData.programScore) return null;
    
    const categoryMap = {
      'IQ Test': 'iq-test',
      'Driving License': 'driving-license',
      'Logic': 'logic'
    };
    
    const categoryKey = categoryMap[activeCategory];
    
    if (!categoryKey || !programData.programScore[categoryKey]) {
      return null;
    }
    
    return {...programData.programScore[categoryKey]};
  };

  const categoryData = getCategoryData();

  if (!categoryData) {
    return (
      <div className="flex justify-center items-center h-[100px]">
        <div className="text-sm text-gray-500">No {activeCategory.toLowerCase()} data available</div>
      </div>
    );
  }

  const createScoreMap = (scores) => {
    const map = {};
    
    if (scores && Array.isArray(scores)) {
      scores.forEach(score => {
        const dateObj = new Date(score.date);
        const dateKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
        
        // Keep the HIGHEST score for each date
        if (!map[dateKey] || score.programScore > map[dateKey]) {
          map[dateKey] = score.programScore;
        }
      });
    }
    
    return map;
  };

  // Function to format chart data to show last 7 days with gaps filled as 0
  const formatChartData = () => {
    const scoreMap = createScoreMap(categoryData.scores);
    const today = new Date();
    
    // Generate the last 7 days including today
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const chartDate = new Date(today);
      chartDate.setDate(today.getDate() - i);
      
      // Reset time part to avoid timezone issues
      chartDate.setHours(0, 0, 0, 0);
      
      const dateKey = `${chartDate.getFullYear()}-${(chartDate.getMonth() + 1).toString().padStart(2, '0')}-${chartDate.getDate().toString().padStart(2, '0')}`;
      
      // Use the score if available, otherwise 0
      const score = scoreMap[dateKey] || 0;
      
      chartData.push({
        date: chartDate,
        score: score,
        isEmpty: score === 0
      });
    }
    
    return chartData;
  };

  const chartData = formatChartData();
  
  // Calculate max value for chart scaling
  const allScores = chartData.map(item => item.score);
  if (categoryData.programScore > 0) {
    allScores.push(categoryData.programScore);
  }
  
  const chartMaxValue = allScores.length > 0 
    ? Math.max(...allScores, 100) * 1.9 // 20% padding
    : 100;

  return (
    <>
      <div className="flex justify-center items-end gap-2.5 mt-0 h-[90px] overflow-hidden px-1">
        {chartData.map((data, idx) => {
          const normalizedScore = Math.min(data.score, chartMaxValue);
          const barHeight = (normalizedScore / chartMaxValue) * 70;
          
          // Format date for display with abbreviated month
          const day = data.date.getDate();
          const month = data.date.toLocaleString('default', { month: 'short' });
          const formattedDate = `${day} ${month}`;
          
          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[30px]">
              <div
                className={`w-4 rounded-t transition-all duration-300 ${data.score > 0 ? 'bg-orange-500' : 'bg-gray-300'}`}
                style={{
                  height: `${barHeight}px`,
                  minHeight: data.score > 0 ? '3px' : '0px',
                }}
              ></div>
              <div className={`text-[12px] font-semibold mt-1 ${data.score > 0 ? '' : 'text-gray-400'}`}>
                {data.score > 0 ? data.score : '0'}
              </div>
              <div className="text-[10px] text-gray-600 whitespace-nowrap leading-tight">
                {formattedDate}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TestScore;