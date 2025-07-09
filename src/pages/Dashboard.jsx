import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Download, CheckCircle, Star, BellIcon, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'; import RecentActivity from '../components/Tables/RecentActivity';
import dayjs from "dayjs";
import MainLayout from '../components/Layout/MainLayout';
import { ScoreNGame, SuggestforYou, Calender, DailyGame, DailyAssesment } from '../components/Dashboard';
import ProgressChart from '../components/Charts/ProgressChart';
import DailyGameModal from '../components/games/DailyGameModal';
import AssessmentModal from "../components/assessments/AssessmentModal";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssesmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const handleAssessmentClick = (assessment) => {
    setSelectedAssessment(assessment);
    setIsAssessmentModalOpen(true);
  };

  const scrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(dayjs());

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");

  const daysInMonth = currentDate.daysInMonth();
  const startDay = startOfMonth.day(); // 0 (Sunday) - 6 (Saturday)
  const blankDays = (startDay + 6) % 7; // Shift Sunday to end

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];

  useEffect(() => {
    const container = scrollRef.current;

    // Only run on mobile view
    if (window.innerWidth < 768 && container) {
      const cards = container.querySelectorAll('.carousel-card');
      let index = 0;

      scrollIntervalRef.current = setInterval(() => {
        index = (index + 1) % cards.length;
        const scrollTo = cards[index].offsetLeft;
        container.scrollTo({
          left: scrollTo,
          behavior: 'smooth',
        });
      }, 2000);
    }

    return () => {
      clearInterval(scrollIntervalRef.current);
    };
  }, []);

  // Optional: simulate fetching from DB
  /*
  useEffect(() => {
    fetch("/api/statistics")
      .then(res => res.json())
      .then(data => setStatsData(data.chartPoints));
  }, []);
  */

  /*const [statsData, setStatsData] = useState([500, 900, 1200, 1500, 1600, 700, 1800]);
  const xLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Transform data into Recharts format
  const chartData = statsData.map((value, index) => ({
    name: xLabels[index],
    value,
  })); */

  const dailyGames = [{ id: 4, title: 'Sound Memory', category: 'Gameacy', difficulty: 'Easy', icon: './sound-memory-game.png', bgColor: '#ffffff', path: "/games/sound-memory-game" },
  { id: 5, title: 'Visual Memory Span', category: 'Logic', difficulty: 'Medium', icon: './whack-a-box-game.png', bgColor: '#1D1D1B', path: "/games/visual-memory-span-game" },
  { id: 6, title: 'Neural Network Builder Game', category: 'Logic', difficulty: 'Medium', icon: './Neural-Network-Builder-Game.png', bgColor: '#FFFFFF', path: "/games/neural-network-builder-game" }]

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <main className="mx-auto px-4 lg:px-12 py-4 lg:py-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {/* Welcome Section */}
          <div className='hidden md:block'>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Good Morning, <span className="text-orange-500">Alex</span>
                </h1>
              </div>
              <div className="flex items-center space-x-2 bg-transparent rounded-lg px-4 py-2">
                <img src="/calander.svg" alt="Calendar" className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold text-gray-600">
                  Last 7 Days
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Top Row - Cards with proper proportions */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <ScoreNGame />

            {/* Certified Cognitive Assessment - spans 1 column */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#ffece6] rounded-lg p-2 h-[140px] flex items-center">
              {/* Icon Area */}
              <div className="w-[110px] h-[110px] bg-[#ff5722] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <img
                  src="/head-silhouette-with-brain-placeholder.png"
                  alt="Head silhouette with brain"
                  className="w-[100px] h-[100px] object-contain"
                />
              </div>

              {/* Text Area */}
              <div className="flex flex-col justify-center">
                <div className="text-[16px] font-semibold text-gray-800 leading-snug">
                  Certified Cognitive Assessment
                </div>
                <div className="bg-[#e5cec8] text-black rounded-md px-2 py-[2px] text-[9px] border border-gray-400 font-medium inline-block mt-1 w-fit">
                  Mini Test, 5–10 Question
                </div>
              </div>
            </div>

            {/* Certified Test Card - spans 1 column */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 relative bg-white rounded-lg p-3 shadow-sm border border-orange-400 h-auto flex flex-col justify-between overflow-hidden">
              {/* Icon + Text */}
              {/* Medal Icon */}
              <img
                src="/medal.png"
                alt="Medal"
                className="w-9 h-9 object-contain mb-2 md:mb-0 mt-[-10px]"
              />
              <div className="flex items-start mb-2 md:mb-0 mt-0">
                <p className="text-[13px] text-gray-700 leading-snug">
                  Get a certified result you can share on LinkedIn or with employers.
                </p>
              </div>
              {/* Price + Button */}
              <div className="flex items-center gap-4 mt-2 mb-1">
                <div className="flex flex-col leading-none">
                  <span className="text-xs text-gray-500">Only</span>
                  <span className="text-md font-bold text-black">€0.99</span>
                </div>
                <button className="bg-[#ff6b35] hover:bg-[#ff5a1c] text-white text-xs w-full font-medium py-2 px-4 rounded-[5px] transition">
                  Start Certified Test
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row lg:gap-4 gap-4 mb-8 w-full">

            {/* Daily Games Streak */}
            <div className="w-full lg:w-[220px] flex-shrink-0">
              <DailyGame onGameClick={() => setIsModalOpen(true)} />
            </div>

            {/* Daily Quick Assessment */}
            <div className="w-full lg:w-[220px] flex-shrink-0">
              <DailyAssesment onAssesmentClick={handleAssessmentClick} />
            </div>

            {/* Calendar */}
            <div className="w-full lg:w-[280px] flex-shrink-0">
              <div className="bg-[#ffece6] rounded-lg p-3 shadow-sm border border-gray-100 h-full">
                <Calender />
              </div>
            </div>

            {/* Statistics + Suggest for You */}
            <div className="flex flex-col gap-4 w-full lg:flex-1">

              {/* Statistics Chart */}
              <div className="bg-[#EEEEEE] bg-opacity-30 rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-normal text-gray-900">Your statistics</h3>
                    <Info className="w-4 h-4" />
                  </div>
                  <button className="text-black hover:text-orange-600 font-medium text-sm flex items-center space-x-1">
                    <span>Check Now</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Chart */}
                <div className="relative h-40 w-full">
                  <ProgressChart />
                </div>
              </div>

              {/* Suggest for You */}
              <div className="bg-[#fef3c7] rounded-lg p-3 shadow-sm border border-gray-100 w-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-normal text-gray-900">Suggest for You</h3>
                  <Info className="w-4 h-4" />
                </div>

                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto md:grid md:grid-cols-2 gap-3 whitespace-nowrap scrollbar-hide"
                >
                  <SuggestforYou />
                </div>
              </div>

            </div>

          </div>

          <h3 className="text-2xl font-semibold text-gray-900 mb-0">Recent Activity</h3>

          {/* Recent Activity */}
          <RecentActivity />

          <DailyGameModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            dailyGames={dailyGames}
          />
          <AssessmentModal
          isOpen={isAssesmentModalOpen}
          selectedAssessment={selectedAssessment}
          onClose={() => setIsAssessmentModalOpen(false)}
        />

        </main>
      </div>
    </MainLayout>
  );
}

export default Dashboard;