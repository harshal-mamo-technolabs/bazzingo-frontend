import React, { useState, useEffect, useRef } from "react";
import { BellIcon, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import MainLayout from "../components/Layout/MainLayout";
import { RecentTest, TestScore } from "../components/Statistics";
import ProgressChart from "../components/Charts/ProgressChart";
import NoDataModal from "../components/Statistics/NoDataModal";
import { useNavigate } from 'react-router-dom';
import { getWeeklyScores } from "../services/dashbaordService";
import { getGameStatistics } from "../services/dashbaordService";
import { getAssessmentStatistics } from "../services/dashbaordService";
import BazzingoLoader from "../components/Loading/BazzingoLoader";
import TimeRangeDropdown from "../components/Statistics/TimeRangeDropdown";


const Statistics = () => {
  const [statsData, setStatsData] = useState([700, 800, 600, 950, 1250, 1100, 1300]);
  const xLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [showChart, setShowChart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowChart(true);
    const timer = setTimeout(() => {
      // setShowChart(true);
    }, 1000); // 1000ms = 1 second delay before rendering chart

    return () => clearTimeout(timer);
  }, []);

  // Fetch weekly scores for the right chart
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await getWeeklyScores();
        const scores = res?.data?.scores || {};
        const orderedDays = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ];
        const values = orderedDays.map((d) => scores[d] ?? 0);
        setStatsData(values);
      } catch (err) {
        // keep defaults if API fails
        console.error("Error loading weekly scores:", err);
      }
    };
    fetchScores();
  }, []);


  const CustomRadarTooltip = ({ active, payload, coordinate }) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        style={{
          position: "absolute",
          top: coordinate?.y ?? 0,
          left: coordinate?.x ?? 0,
          transform: "translate(-50%, -100%)",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(6px)",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#FF6C40",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {` ${payload[0].value}`}
      </div>
    );
  };



  const [showTooltip1, setShowTooltip1] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);
  const [showTooltip3, setShowTooltip3] = useState(false);
  const [showTooltip4, setShowTooltip4] = useState(false);
  const [showTooltip6, setShowTooltip6] = useState(false);
  const iconRef = useRef(null);

  const handleTooltipClick = (setTooltipFn) => {
    setTooltipFn(true);
    setTimeout(() => {
      setTooltipFn(false);
    }, 3000); // auto close in 3 seconds
  };


  // Transform data into Recharts format
  const chartData = statsData.map((value, index) => ({
    name: xLabels[index],
    value,
  }));

  const slides = [
    {
      key: "left",
      content: (
        <div className="bg-white h-[160px] md:w-[260px] lg:w-[230px] 2xl:w-[350px] rounded-lg p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/beep.png" alt="suggest" className="w-10 h-10" />
            <div>
              <p className="text-[14px] font-semibold text-gray-800">
                Reaction Sprint
              </p>
              <p className="text-[14px] text-gray-500">Logic</p>
            </div>
          </div>
          <p className="text-[13px] text-gray-500">Train your reflexes</p>
          <button className="mt-1 mb-5 w-full py-1.5 text-[12px] rounded-md bg-[#FF6B3D] text-white font-semibold">
            Play Now
          </button>
        </div>
      ),
    },
    {
      key: "right",
      content: (
        <div className="bg-white h-[160px] border border-orange-300 md:max-w-full 2xl:max-w-full lg:max-w-sm rounded-lg overflow-hidden shadow-sm w-full">
          <div className="bg-[#f5f5d6] w-full px-3 py-2">
            <div className="flex items-center gap-3">
              <img
                src="/brain_yellow.png"
                alt="gct"
                className="w-10 h-10 rounded p-0"
              />
              <div>
                <p className="text-md lg:text-sm font-semibold text-gray-800">
                  General Cognitive test
                </p>
                <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                  Mini Test, 5-10 Question
                </span>
              </div>
            </div>
          </div>
          <div className="p-2.5 flex flex-col justify-between gap-0">
            <div className="flex items-start gap-2 text-[13px] text-gray-700">
              <img
                src="/certificate-light.png"
                alt="certification"
                className="w-5 h-5"
              />
              <p className="text-[12px] 2xl:text-[14px]">
                Get a certified result you can share on LinkedIn or with employers.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between mt-1 p-1 gap-2">
              <div className="text-xs text-gray-700 leading-4">
                <p className="text-[12px]">Only</p>
                <p className="text-[18px] font-bold text-black">€0.99</p>
              </div>
              <button className="px-4 py-1.5 text-[13px] bg-[#FF6B3D] min-w-[150px] text-white rounded-md font-semibold">
                Start Certified Test
              </button>
            </div>

          </div>
        </div>
      ),
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prev) => (prev + 1) % slides.length);
  //   }, 100);
  //   return () => clearInterval(interval);
  // }, [slides.length]);

  const [rank, setRank] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [brainIndex, setBrainIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [progressValues, setProgressValues] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentIq, setCurrentIq] = useState(null);
  
  // Time range state - moved before useEffect that uses it
  const [selectedTimeRange, setSelectedTimeRange] = useState('last7Days');

  // Callback function to receive IQ data from TestScore
  const handleIqDataLoaded = (iqData) => {
    setCurrentIq(iqData.currentIQ);
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const res = await getGameStatistics();
        const gameStats = res?.data?.statistics;
        const overallRank = res?.data?.rank;
        
        // Get data for the selected time range
        const timeRangeData = gameStats?.[selectedTimeRange];
        
        if (timeRangeData) {
          setTotalPlayed(timeRangeData.totalGamePlayed || 0);
          setBrainIndex(timeRangeData.brainIndex || 0);
          setRank(timeRangeData.rank ?? overallRank ?? 0);
          const mapped = Object.entries(timeRangeData.statistics || {}).map(([label, value]) => ({ label, value }));
          setScores(mapped);
          setProgressValues(mapped.map(() => 0));
          setTimeout(() => {
            setProgressValues(mapped.map(s => s.value));
          }, 200);
        } else {
          setScores([]);
          setProgressValues([]);
        }
      } catch (e) {
        setScores([]);
        setProgressValues([]);
        setRank(0);
        setTotalPlayed(0);
        setBrainIndex(0);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [selectedTimeRange]); // Add selectedTimeRange as dependency

  // New state for assessment statistics
  const [assessmentStats, setAssessmentStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [activeCategory, setActiveCategory] = useState('IQ Test');
  
  const categories = ['IQ Test', 'Driving License', 'Logic'];
  const [showNoDataModal, setShowNoDataModal] = useState(false);

  // Time range options
  const timeRanges = [
    { key: 'today', label: 'Today' },
    { key: 'last7Days', label: 'Last 7 Days' },
    { key: 'last1Month', label: 'Last 1 Month' },
    { key: 'last3Months', label: 'Last 3 Months' },
    { key: 'last6Months', label: 'Last 6 Months' },
    { key: 'last1Year', label: 'Last 1 Year' }
  ];

  // Fetch assessment statistics
  useEffect(() => {
    const fetchAssessmentStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await getAssessmentStatistics();
        // API returns: { status: "success", data: { statistics: { ... } } }
        setAssessmentStats(response.data);
      } catch (error) {
        console.error("Error fetching assessment statistics:", error);
        // Set default empty stats structure
        setAssessmentStats({
          statistics: {
            "driving-license": { isDataPresent: false },
            "iq-test": { isDataPresent: false },
            "logic": { isDataPresent: false }
          }
        });
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchAssessmentStats();
  }, []);

  // Get current radar data based on selected category and time range
  const getRadarData = () => {
    if (!assessmentStats) return [];

    const categoryKey = activeCategory.toLowerCase().replace(' ', '-');
    const categoryData = assessmentStats.statistics[categoryKey];
    
    if (!categoryData || !categoryData[selectedTimeRange]) return [];

    const timeRangeData = categoryData[selectedTimeRange];
    return Object.entries(timeRangeData).map(([subject, value]) => ({
      subject: formatSubjectName(subject),
      value: value,
      fullScore: 100 // Assuming max score is 100 for each subject
    }));
  };

  // Format subject names for display
  const formatSubjectName = (subject) => {
    return subject.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Check if current category has data
  const hasDataForCurrentCategory = () => {
    if (!assessmentStats) return false;
    
    const categoryKey = activeCategory.toLowerCase().replace(' ', '-');
    const categoryData = assessmentStats.statistics[categoryKey];
    
    return categoryData && categoryData.isDataPresent;
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    
    if (assessmentStats) {
      const categoryKey = category.toLowerCase().replace(' ', '-');
      const categoryData = assessmentStats.statistics[categoryKey];
      
      if (!categoryData || !categoryData.isDataPresent) {
        setShowNoDataModal(true);
      }
    } else {
      // If assessmentStats is not loaded yet, show modal for any category without data
      setShowNoDataModal(true);
    }
  };

  // Handle modal close - switch to a category that has data
  const handleModalClose = () => {
    setShowNoDataModal(false);
    
    if (assessmentStats) {
      // Find the first category that has data
      const categoriesWithData = categories.find(category => {
        const categoryKey = category.toLowerCase().replace(' ', '-');
        const categoryData = assessmentStats.statistics[categoryKey];
        return categoryData && categoryData.isDataPresent;
      });
      
      if (categoriesWithData) {
        setActiveCategory(categoriesWithData);
      }
    }
  };

  const handleAssesmentClick = () => {
    navigate('/assessments');
  };

  return (
    <MainLayout unreadCount={3}>
      <div className="bg-gray-50 min-h-screen">
        <main className="mx-auto px-4 lg:px-12 py-4 lg:py-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {/* Filter Buttons */}
          <div className="bg-[#EEEEEE] border border-gray-200 rounded-lg shadow-sm py-3 px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">

              {/* Left - Category Tabs */}
              <div className="flex flex-wrap justify-between gap-2 md:gap-2 w-full md:w-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-sm
                  ${activeCategory === category
                        ? 'border border-orange-500 text-orange-600 bg-[#F0E2DD]'
                        : 'text-gray-600 bg-white'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Right - Dropdown */}
              <div className="w-full md:w-auto">
              <TimeRangeDropdown
                options={timeRanges}
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
                align="right"
                width="w-48" // tweak if you want a wider menu
              />
            </div>

            </div>
          </div>


          {/* Statistics Section */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">

            <div className="xl:w-[500px] 2xl:w-[550px] lg:w-[290px] bg-[#EEEEEE] rounded-lg p-4 shadow-sm border border-gray-200 h-[330px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">User Progress Overview</h3>
                {/* Tooltip Trigger */}
                <div
                  ref={iconRef}
                  className="relative cursor-pointer"
                  onClick={() => handleTooltipClick(setShowTooltip1)}
                >
                  <Info className="w-4 h-4 text-black" />

                  {/* Tooltip Popup */}
                  {showTooltip1 && (
                    <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md">
                      This chart shows how your Visual breakdown of your cognitive skill scores across key areas.
                    </div>
                  )}
                </div>

              </div>

              <div className="w-full">
                {isLoadingStats ? (
                  <div className="flex items-center justify-center h-[250px]">
                    <BazzingoLoader message="Loading assessment data..." compact />
                  </div>
                ) : !hasDataForCurrentCategory() ? (
                  <div className="flex items-center justify-center h-[250px] flex-col">
                    <div className="text-gray-500 text-sm mb-4">No data available</div>
                    <button 
                      onClick={() => setShowNoDataModal(true)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm"
                    >
                      Take Assessment
                    </button>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart
                      cx="45%"
                      cy="55%"
                      outerRadius="90%"
                      data={getRadarData()}
                    >
                      <defs>
                        <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF6C40" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#FF6C40" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>

                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 11, fill: '#333', fontWeight: 'bold' }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#f97316"
                        strokeWidth={2}
                        fill="url(#colorRadar)"
                        fillOpacity={1}
                        isAnimationActive={true}
                        animationDuration={3000}
                        animationEasing="ease-out"
                      />

                      <Tooltip content={<CustomRadarTooltip />} cursor={false} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>

            {/* Middle Card - Rank and Bars */}
            <div className="xl:w-[295px] 2xl:w-[300px] lg:w-[245px] bg-[#EEEEEE] border border-gray-200 rounded-lg shadow-sm h-[330px] overflow-hidden">

              {/* Gradient Header - touching top */}
              <div
                className="relative px-4 py-3 flex items-center justify-center gap-4 rounded-t-lg"
                style={{
                  background: 'linear-gradient(to right, #f1c0a0, #E34313, #f1c0a0)',
                }}
              >
                {/* Info Icon */}
                <div className="absolute top-2 right-2 text-black text-base cursor-pointer">
                  {/* Tooltip Trigger */}
                  <div
                    ref={iconRef}
                    className="relative cursor-pointer"
                    onClick={() => handleTooltipClick(setShowTooltip2)}
                  >
                    <Info className="w-4 h-4 text-black" />

                    {/* Tooltip Popup */}
                    {showTooltip2 && (
                      <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md">
                        Summary of your rank and performance stats.
                      </div>
                    )}
                  </div>
                </div>

                {/* Left Stars */}
                <div className="flex items-center gap-[0px] text-orange-800">
                  <span className="drop-shadow-md animate-pulse text-2xl xl:text-2xl lg:text-xl mt-5">★</span>
                  <span className="xl:text-3xl text-3xl lg:text-2xl mt-3 drop-shadow-md animate-pulse">★</span>
                  <span className="xl:text-4xl text-4xl lg:text-3xl mt-1 drop-shadow-md animate-pulse">★</span>
                </div>
                {/* Center Text */}
                <div className="flex flex-col items-center justify-center leading-tight text-white">
                  <span className="text-[10px]">Your Rank</span>
                  <span className="text-3xl font-bold">{rank}</span>
                </div>

                {/* Right Stars */}
                <div className="flex items-center gap-[0px] text-orange-800">
                  <span className="xl:text-4xl text-4xl lg:text-3xl mt-1 drop-shadow-md animate-pulse">★</span>
                  <span className="xl:text-3xl text-3xl lg:text-2xl mt-3 drop-shadow-md animate-pulse">★</span>
                  <span className="xl:text-2xl text-2xl lg:text-xl mt-5 drop-shadow-md animate-pulse">★</span>
                </div>
              </div>

              {/* Content below gradient */}
              <div className="p-4 pt-3">
                {/* Total Game Played */}
                <div className="flex justify-between items-center text-sm text-black font-medium mb-1">
                  <span>Total Game Played</span>
                  <span className="text-orange-500 font-bold">{totalPlayed}</span>
                </div>

                <hr className="mb-2 border-gray-300" />
                {/* Score Bars with loader */}
                {statsLoading ? (
                  <div className="flex items-center justify-center h-[160px]">
                    <BazzingoLoader message="Loading score bars..." compact />
                  </div>
                ) : (
                  (scores.slice(0, 6)).map((score, index) => (
                    <div key={index} className="flex items-center mb-2 gap-2 w-full">
                      {/* Label */}
                      <span className="text-[11px] text-gray-800 w-[80px]">{score.label}</span>

                      {/* Progress Bar */}
                      <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full shadow-md transition-all duration-2000 ease-out animate-pulse"
                          style={{
                            width: `${progressValues[index]}%`,
                            background: 'linear-gradient(to right, #c56b49, #f97316)',
                          }}
                        ></div>
                      </div>

                      {/* Score Value */}
                      <span className="text-[11px] text-gray-800 w-[30px] text-right">
                        {score.value}
                      </span>
                    </div>
                  ))
                )}

                

                {/* Brain Score Index */}
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between items-center text-xs font-semibold text-black">
                  <span>Brain Score Index</span>
                  <span>{brainIndex}</span>
                </div>

                {/* Button */}
                <button className="mt-4 w-full py-2 rounded-lg bg-[#ff5c33] hover:bg-[#ff3d0d] text-white text-xs font-medium shadow-md">
                  <div className="flex justify-center items-center gap-2">
                    Pushup your rank
                    <span className="text-lg leading-none">→</span>
                  </div>
                </button>
              </div>
            </div>


            {/* Right Card - Already Implemented Chart */}
            <div className="flex-1 bg-[#EEEEEE] rounded-lg p-4 shadow-sm border border-gray-200 h-[330px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Progress Over Time</h3>
                {/* Tooltip Trigger */}
                <div
                  ref={iconRef}
                  className="relative cursor-pointer"
                  onClick={() => handleTooltipClick(setShowTooltip3)}
                >
                  <Info className="w-4 h-4 text-black" />

                  {/* Tooltip Popup */}
                  {showTooltip3 && (
                    <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-transparent border border-gray-300 rounded shadow-lg">
                      This chart shows how your score improves over time based on your gameplay.
                    </div>
                  )}
                </div>
              </div>
              {/* Your existing chart component goes here */}
              {/* <ProgressChart /> or directly the Recharts code */}
              {/* Chart */}
              <div
                className={`relative h-52 mt-10 w-full transition-opacity duration-1500 ${showChart ? 'opacity-100' : 'opacity-0'
                  }`}
              >

                {showChart && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      height="100%"
                      margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="60%" stopColor="#FF6C40" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#FF6C40" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid stroke="#D5D5D5" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fontWeight: "bold", fill: "#333" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        height={20}
                      />
                      <YAxis
                        domain={[0, 2000]}
                        ticks={[100, 500, 1000, 1500, 2000]}
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <Tooltip content={<CustomRadarTooltip />} cursor={false} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#f97316"
                        fill="url(#colorValue)"
                        strokeWidth={2}
                        animationDuration={3000} // full 3 seconds animation
                        animationBegin={0}
                        isAnimationActive={true}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="flex lg:flex-row flex-col gap-4 mt-6">
            {/* Left Card - Certified IQ Test Score */}
            <div className="lg:w-[320px] bg-[#EEEEEE] rounded-xl p-5 h-[220px] shadow-sm flex flex-col justify-between overflow-hidden">
              {/* Header */}
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Certified IQ Test Score
                </h3>

                {/* Show on md+ */}
                {/* Tooltip Trigger */}
                <div
                  ref={iconRef}
                  className="relative cursor-pointer"
                  onClick={() => handleTooltipClick(setShowTooltip4)}
                >
                  <Info className="w-4 h-4 text-black hidden md:block cursor-pointer" />

                  {/* Tooltip Popup */}
                  {showTooltip4 && (
                    <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md">
                      Shows certified IQ score and recent trend by date.
                    </div>
                  )}
                </div>

                {/* Show only on mobile */}
                <div className="block md:hidden w-[40%] md:w-auto">
                  <button className="w-full md:w-auto px-4 py-1.5 rounded-lg text-[11px] md:text-sm font-medium text-gray-400 bg-white border border-gray-300 flex items-center justify-center md:justify-start space-x-1">
                    <span>Last 7 Days</span>
                    <svg
                      className="w-4 h-4 ml-1 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>


              {/* Score */}
              <div className="text-2xl font-bold text-orange-600">
              {currentIq || 'N/A'}

              </div>

              {/* Chart */}
              <TestScore onIqDataLoaded={handleIqDataLoaded} activeCategory={activeCategory} />
            </div>

            {/* Middle Card - Recent Tests */}
            <RecentTest />

            {/* Right Card - Suggest for You */}
            {/* Suggest for You Card Container */}
            <div className="flex-1 h-[220px] bg-[#EEEEEE] rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Suggest for You
                </h3>
                <button>
                  {/* Tooltip Trigger */}
                  <div
                    ref={iconRef}
                    className="relative cursor-pointer"
                    onClick={() => handleTooltipClick(setShowTooltip6)}
                  >
                    <Info className="w-4 h-4 text-black" />

                    {/* Tooltip Popup */}
                    {showTooltip6 && (
                      <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md">
                        Personalized suggestions to help improve your performance.
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Desktop layout - md and above */}
              <div className="hidden md:flex gap-4">
                {slides.map((slide) => (
                  <React.Fragment key={slide.key}>{slide.content}</React.Fragment>
                ))}
              </div>

              {/* Mobile layout - below md */}
              <div className="md:hidden w-full">
                {slides[currentIndex].content}
              </div>
            </div>

          </div>
        </main>
      </div>
      <NoDataModal isOpen={showNoDataModal} onClose={handleModalClose} onAssesmentClick={handleAssesmentClick} category={activeCategory} />
    </MainLayout>
  );
};

export default Statistics;