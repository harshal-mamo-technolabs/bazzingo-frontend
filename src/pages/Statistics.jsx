import React, { useState, useEffect, useRef } from "react";
import { BellIcon, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import MainLayout from "../components/Layout/MainLayout";
import { RecentTest, TestScore } from "../components/Statistics";
import ProgressChart from "../components/Charts/ProgressChart";
import NoDataModal from "../components/Statistics/NoDataModal";
import SubscriptionBlocker from "../components/Subscription/SubscriptionBlocker";
import { useNavigate } from 'react-router-dom';
import { getWeeklyScores } from "../services/dashbaordService";
import { getGameStatistics } from "../services/dashbaordService";
import { getAssessmentStatistics } from "../services/dashbaordService";
import { getDailyAssessmentRecommendation } from "../services/dashbaordService";
import { getAllGames } from "../services/gameService.js";
import BazzingoLoader from "../components/Loading/BazzingoLoader";
import TimeRangeDropdown from "../components/Statistics/TimeRangeDropdown";
import AssessmentStripeElementsModal from '../components/assessments/AssessmentStripeElementsModal';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSubscriptionStatus, selectHasActiveSubscription, selectSubscriptionInitialized, selectSubscriptionLoading } from '../app/subscriptionSlice';
import { isSubscriptionGateEnabled, isComponentVisible } from "../config/accessControl";
import TranslatedText from "../components/TranslatedText.jsx";
import { useTranslateText } from "../hooks/useTranslate";
import { useI18n } from "../context/I18nContext.jsx";


const Statistics = () => {
  const [statsData, setStatsData] = useState([700, 800, 600, 950, 1250, 1100, 1300]);
  const [showChart, setShowChart] = useState(false);
  const navigate = useNavigate();
  const { language } = useI18n();
  const [randomGame, setRandomGame] = useState(null);
  
  // Redux subscription state
  const dispatch = useDispatch();
  const hasActiveSubscription = useSelector(selectHasActiveSubscription);
  const subscriptionInitialized = useSelector(selectSubscriptionInitialized);
  const subscriptionLoading = useSelector(selectSubscriptionLoading);
  const shouldEnforceStatisticsGate = isSubscriptionGateEnabled("statistics");

  // Translated static strings for this page
  const tPremiumTitle = useTranslateText("Premium Statistics");
  const tPremiumMessage = useTranslateText("Please subscribe to Bazzingo plan to access detailed statistics and analytics");
  const tPremiumButton = useTranslateText("Subscribe Now");

  const tUserProgressOverview = useTranslateText("User Progress Overview");
  const tUserProgressTooltip = useTranslateText("This chart shows how your visual breakdown of your cognitive skill scores across key areas.");
  const tLoadingAssessmentData = useTranslateText("Loading assessment data...");
  const tNoDataAvailable = useTranslateText("No data available");
  const tTakeAssessment = useTranslateText("Take Assessment");

  const tRankTooltip = useTranslateText("Summary of your rank and performance stats.");
  const tLoadingScoreBars = useTranslateText("Loading score bars...");
  const tTotalGamePlayed = useTranslateText("Total Game Played");
  const tBrainScoreIndex = useTranslateText("Brain Score Index");
  const tPushupYourRank = useTranslateText("Pushup your rank");

  const tProgressOverTime = useTranslateText("Progress Over Time");
  const tProgressTooltip = useTranslateText("This chart shows how your score improves over time based on your gameplay.");


  // Fetch subscription status when component mounts
  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

  // Fetch random game for left slide
useEffect(() => {
  const fetchRandomGame = async () => {
    try {
      const response = await getAllGames();
      if (response?.status === "success" && response.data?.games) {
        // Filter active games and select one random game
        const activeGames = response.data.games.filter(game => game.isActive);
        if (activeGames.length > 0) {
          const randomIndex = Math.floor(Math.random() * activeGames.length);
          setRandomGame(activeGames[randomIndex]);
        }
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  fetchRandomGame();
}, []);

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
    name:
      (language === "de"
        ? ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
        : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])[index],
    value,
  }));

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
  
  // Assessment recommendation state
  const [assessmentData, setAssessmentData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  // Callback function to receive IQ data from TestScore
  const handleIqDataLoaded = (iqData) => {
    setCurrentIq(iqData.currentIQ);
  };

  // Fetch assessment recommendation
  const fetchAssessmentRecommendation = async () => {
    try {
      const response = await getDailyAssessmentRecommendation();
      if (response?.status === 'success') {
        setAssessmentData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch assessment recommendation:', error);
    }
  };

  const getActualPrice = (unitAmount, currency) => {
    const amount = (unitAmount / 100).toFixed(2);
    return `${currency === 'EUR' ? '€' : '$'}${amount}`;
  };

  const getDescription = (isAvailReport, isAvailCertification) => {
    let description = "Try test to get detailed report to know better your performance";
    if (isAvailCertification) {
      description += " and the certificate to share";
    }
    return description;
  };

  const handleStartCertifiedTest = () => {
    if (!assessmentData) return;
    
    // Open the Stripe Elements payment modal
    setIsStripeModalOpen(true);
  };

  const handleCloseStripeModal = () => {
    setIsStripeModalOpen(false);
  };

  const slides = [
    {
      key: "left",
      content: (
        <div 
          className="bg-white h-[160px] md:w-[260px] lg:w-[230px] 2xl:w-[350px] rounded-lg p-4 flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {
            if (randomGame) {
              // Navigate to game with random difficulty
              const difficulties = ["easy", "medium", "hard"];
              const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
              
              navigate(randomGame.url, {
                state: {
                  fromRecommendation: true,
                  difficulty: randomDifficulty
                }
              });
            }
          }}
        >
          {randomGame ? (
            <>
              <div className="flex items-center gap-3">
                <img 
                  src={randomGame.thumbnail} 
                  alt={randomGame.name} 
                  className="w-10 h-10 object-contain" 
                />
                <div>
                  <p className="text-[14px] font-semibold text-gray-800">
                    <TranslatedText text={randomGame.name} />
                  </p>
                  <p className="text-[14px] text-gray-500"><TranslatedText text={randomGame.category} /></p>
                </div>
              </div>
              {/* <p className="text-[13px] text-gray-500">Improve your {randomGame.category.toLowerCase()} skills</p> */}
              <button className="mt-1 mb-5 w-full py-1.5 text-[12px] rounded-md bg-[#FF6B3D] text-white font-semibold">
                <TranslatedText text="Play Now" />
              </button>
            </>
          ) : (
            // Loading skeleton
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-full h-8 bg-gray-200 rounded animate-pulse mt-1 mb-5"></div>
            </>
          )}
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
                alt={assessmentData?.title || "Assessment"}
                className="w-10 h-10 rounded p-0"
              />
              <div>
                <p className="text-md lg:text-sm font-semibold text-gray-800">
                  {assessmentData?.title || "General Cognitive test"}
                </p>
                <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                  {assessmentData?.questions ? `${assessmentData.questions} Questions` : "Mini Test, 5-10 Question"} • Certified
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
                {assessmentData ? getDescription(assessmentData.isAvailReport, assessmentData.isAvailCertification) : "Get a certified result you can share on LinkedIn or with employers."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between mt-1 p-1 gap-2">
              <div className="text-xs text-gray-700 leading-4">
                <p className="text-[12px]">Only</p>
                <p className="text-[18px] font-bold text-black">
                  {assessmentData ? getActualPrice(assessmentData.price.unitAmount, assessmentData.price.currency) : "€0.99"}
                </p>
              </div>
              <button 
                className="px-4 py-1.5 text-[13px] bg-[#FF6B3D] min-w-[150px] text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartCertifiedTest}
                disabled={processing || !assessmentData}
              >
                {processing ? 'Processing...' : 'Start Certified Test'}
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

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
    fetchAssessmentRecommendation();
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

  // Check if default category has data when assessment stats are loaded
  useEffect(() => {
    if (assessmentStats && !isLoadingStats && subscriptionInitialized) {
      // Only check for data modal if user has active subscription
      if (hasActiveSubscription) {
        const categoryKey = activeCategory.toLowerCase().replace(' ', '-');
        const categoryData = assessmentStats.statistics[categoryKey];
        
        // If the current active category (default: IQ Test) has no data, show modal
        if (!categoryData || !categoryData.isDataPresent) {
          setShowNoDataModal(true);
        }
      }
    }
  }, [assessmentStats, isLoadingStats, activeCategory, hasActiveSubscription, subscriptionInitialized]);

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
    
    // Only check for data modal if user has active subscription
    if (hasActiveSubscription && assessmentStats) {
      const categoryKey = category.toLowerCase().replace(' ', '-');
      const categoryData = assessmentStats.statistics[categoryKey];
      
      if (!categoryData || !categoryData.isDataPresent) {
        setShowNoDataModal(true);
      }
    } else if (hasActiveSubscription && !assessmentStats) {
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
      <SubscriptionBlocker 
        showBlocker={shouldEnforceStatisticsGate && subscriptionInitialized && !hasActiveSubscription}
        title={tPremiumTitle}
        message={tPremiumMessage}
        buttonText={tPremiumButton}
      >
        <div className="bg-gray-50 min-h-screen">
          <main className="mx-auto px-4 lg:px-12 py-4 lg:py-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {/* Filter Buttons */}
          <div className="bg-[#EEEEEE] border border-gray-200 rounded-lg shadow-sm py-3 px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">

              {/* Left - Category Tabs */}
              <div className="w-full md:w-auto">
                <div className="grid grid-cols-3 gap-2 w-full md:flex md:flex-wrap md:justify-between md:gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`w-full md:w-auto px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-sm
                    ${activeCategory === category
                          ? 'border border-orange-500 text-orange-600 bg-[#F0E2DD]'
                          : 'text-gray-600 bg-white'
                        }`}
                    >
                      <TranslatedText text={category} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider for mobile */}
              <div className="h-px w-full bg-gray-300 md:hidden" />

              {/* Right - Dropdown */}
              <div className="w-full md:w-auto">
                <TimeRangeDropdown
                  options={timeRanges}
                  value={selectedTimeRange}
                  onChange={setSelectedTimeRange}
                  align="right"
                  width="w-full md:w-48"
                  className="w-full md:w-auto justify-between"
                  fullWidth
                />
              </div>

            </div>
          </div>


          {/* Statistics Section */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">

            <div className="xl:w-[500px] 2xl:w-[550px] lg:w-[290px] bg-[#EEEEEE] rounded-lg p-4 shadow-sm border border-gray-200 h-[330px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {tUserProgressOverview}
                </h3>
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
                      {tUserProgressTooltip}
                    </div>
                  )}
                </div>

              </div>

              <div className="w-full">
                {isLoadingStats ? (
                  <div className="flex items-center justify-center h-[250px]">
                    <BazzingoLoader message={tLoadingAssessmentData} compact />
                  </div>
                ) : !hasDataForCurrentCategory() ? (
                  <div className="flex items-center justify-center h-[250px] flex-col">
                    <div className="text-gray-500 text-sm mb-4">
                      {tNoDataAvailable}
                    </div>
                    <button 
                      onClick={() => navigate("/assessments")}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm"
                    >
                      <TranslatedText text="Take Assessment" />
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
                        {tRankTooltip}
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
                  <span>{tTotalGamePlayed}</span>
                  <span className="text-orange-500 font-bold">{totalPlayed}</span>
                </div>

                <hr className="mb-2 border-gray-300" />
                {/* Score Bars with loader */}
                {statsLoading ? (
                  <div className="flex items-center justify-center h-[160px]">
                    <BazzingoLoader message={tLoadingScoreBars} compact />
                  </div>
                ) : (
                  (scores.slice(0, 6)).map((score, index) => (
                    <div key={index} className="flex items-center mb-2 gap-2 w-full">
                      {/* Label */}
                      <span className="text-[11px] text-gray-800 w-[80px]">
                        <TranslatedText text={score.label} />
                      </span>

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
                  <span>{tBrainScoreIndex}</span>
                  <span>{brainIndex}</span>
                </div>

                {/* Button */}
                <button 
                  className="mt-4 w-full py-2 rounded-lg bg-[#ff5c33] hover:bg-[#ff3d0d] text-white text-xs font-medium shadow-md"
                  onClick={() => navigate('/games')}
                >
                  <div className="flex justify-center items-center gap-2">
                    {tPushupYourRank}
                    <span className="text-lg leading-none">→</span>
                  </div>
                </button>
              </div>
            </div>


            {/* Right Card - Already Implemented Chart */}
            <div className="flex-1 bg-[#EEEEEE] rounded-lg p-4 shadow-sm border border-gray-200 h-[330px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {tProgressOverTime}
                </h3>
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
                      {tProgressTooltip}
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
                  <TranslatedText text={`Certified ${activeCategory} Score`} />
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
                      <TranslatedText text={`Shows certified ${activeCategory.toLowerCase()} score and recent trend by date.`} />
                    </div>
                  )}
                </div>

                {/* Show only on mobile */}
                <div className="block md:hidden w-[40%] md:w-auto">
                  <button className="w-full md:w-auto px-4 py-1.5 rounded-lg text-[11px] md:text-sm font-medium text-gray-400 bg-white border border-gray-300 flex items-center justify-center md:justify-start space-x-1">
                    <span>
                      <TranslatedText
                        text={
                          (timeRanges.find(tr => tr.key === selectedTimeRange)?.label) ||
                          "Last 7 Days"
                        }
                      />
                    </span>
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
              {currentIq || '0'}

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
                  <TranslatedText text="Suggest for You" />
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
                        <TranslatedText text="Personalized suggestions to help improve your performance." />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Desktop layout - md and above */}
              <div className="hidden md:flex gap-4">
                <React.Fragment key={slides[0].key}>{slides[0].content}</React.Fragment>
                {isComponentVisible('statisticsCertifiedCard') ? (
                  <React.Fragment key={slides[1].key}>{slides[1].content}</React.Fragment>
                ) : (
                  // Empty placeholder to preserve layout width
                  <div className="bg-transparent h-[160px] md:w-[260px] lg:w-[230px] 2xl:w-[350px]" />
                )}
              </div>

              {/* Mobile layout - below md */}
              <div className="md:hidden w-full">
                {slides[0].content}
              </div>
            </div>

          </div>
          </main>
        </div>
        <NoDataModal isOpen={showNoDataModal} onClose={handleModalClose} onAssesmentClick={handleAssesmentClick} category={activeCategory} />
        
        {/* Stripe Elements Payment Modal */}
        {assessmentData && (
          <AssessmentStripeElementsModal
            isOpen={isStripeModalOpen}
            onClose={handleCloseStripeModal}
            assessment={{
              _id: assessmentData.assessmentId,
              id: assessmentData.assessmentId,
              title: assessmentData.title || 'Certified Test',
              name: assessmentData.title || 'Certified Test',
            }}
          />
        )}
      </SubscriptionBlocker>
    </MainLayout>
  );
};

export default Statistics;