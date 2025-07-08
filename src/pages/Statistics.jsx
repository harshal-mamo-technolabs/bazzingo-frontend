import React, { useState, useEffect } from "react";
import { BellIcon, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import MainLayout from "../components/Layout/MainLayout";
import { RecentTest, TestScore } from "../components/Statistics";

const Statistics = () => {
  const [statsData, setStatsData] = useState([500, 900, 1200, 500, 1600, 700, 2000]);
  const xLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [slides.length]);


  return (
    <MainLayout unreadCount={3}>
      <div className="bg-gray-50 min-h-screen">
        <main className="mx-auto px-4 lg:px-12 py-4 lg:py-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {/* Filter Buttons */}
          <div className="bg-[#EEEEEE] border border-gray-200 rounded-lg shadow-sm py-3 px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">

              {/* Left - Category Tabs */}
              <div className="flex flex-wrap justify-between gap-2 md:gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-medium border border-orange-500 text-orange-600 bg-[#F0E2DD] shadow-sm">
                  IQ Test
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-gray-600 bg-white shadow-sm">
                  Driving License
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-gray-600 bg-white shadow-sm">
                  Logic
                </button>
              </div>

              {/* Right - Dropdown */}
              <div className="w-full md:w-auto">
                <button className="w-full md:w-auto px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-gray-700 md:gap-2 bg-white border border-gray-300 flex items-center justify-between">
                  <span>Last 7 Days</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>


            </div>
          </div>


          {/* Statistics Section */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">

            <div className="xl:w-[500px] 2xl:w-[550px] lg:w-[290px] bg-[#EEEEEE] rounded-lg p-4 shadow-sm border border-gray-200 h-[330px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">User Progress Overview</h3>
                <Info className="w-4 h-4 text-black" />
              </div>

              <div className="w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart cx="45%" cy="55%" outerRadius="90%" data={[
                    { subject: 'Pattern Recognition', A: 80 },
                    { subject: 'Spatial Orientation', A: 88 },
                    { subject: 'Visual Perception', A: 86 },
                    { subject: '', A: 119 }, // You may want to remove or replace the empty label
                    { subject: 'Logic', A: 120 },
                  ]}>
                    <defs>
                      <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6C40" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#FF6C40" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>

                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#333', fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 180]} tick={false} axisLine={false} />

                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#colorRadar)"
                      fillOpacity={1}
                    />
                  </RadarChart>
                </ResponsiveContainer>
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
                  <Info className="w-4 h-4" />
                </div>

                {/* Left Stars */}
                <div className="flex items-center gap-[0px] text-orange-700">
                  <span className="xl:text-2xl text-2xl lg:text-xl mt-5">★</span>
                  <span className="xl:text-3xl text-3xl lg:text-2xl mt-3">★</span>
                  <span className="xl:text-4xl text-4xl lg:text-3xl mt-1">★</span>
                </div>
                {/* Center Text */}
                <div className="flex flex-col items-center justify-center leading-tight text-white">
                  <span className="text-[10px]">Your Rank</span>
                  <span className="text-3xl font-bold">250</span>
                </div>

                {/* Right Stars */}
                <div className="flex items-center gap-[0px] text-orange-700">
                  <span className="xl:text-4xl text-4xl lg:text-3xl mt-1">★</span>
                  <span className="xl:text-3xl text-3xl lg:text-2xl mt-3">★</span>
                  <span className="xl:text-2xl text-2xl lg:text-xl mt-5">★</span>
                </div>
              </div>

              {/* Content below gradient */}
              <div className="p-4 pt-3">
                {/* Total Game Played */}
                <div className="flex justify-between items-center text-sm text-black font-medium mb-1">
                  <span>Total Game Played</span>
                  <span className="text-orange-500 font-bold">25</span>
                </div>

                <hr className="mb-2 border-gray-300" />

                {/* Score Bars */}
                {['Speed', 'Attention', 'Memory', 'Flexibility', 'Troubleshooting'].map((label, index) => (
                  <div key={index} className="flex items-center mb-2 gap-2 w-full">
                    {/* Label */}
                    <span className="text-[11px] text-gray-800 w-[80px]">{label}</span>

                    {/* Progress Bar */}
                    <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: '65%',
                          background: 'linear-gradient(to right, #c56b49, #f97316)',
                        }}
                      ></div>
                    </div>

                    {/* Score Value */}
                    <span className="text-[11px] text-gray-800 w-[30px] text-right">
                      {index === 0 ? 1002 : 1001}
                    </span>
                  </div>
                ))}

                {/* Brain Score Index */}
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between items-center text-xs font-semibold text-black">
                  <span>Brain Score Index</span>
                  <span>1002</span>
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
                <Info className="w-4 h-4 text-black" />
              </div>
              {/* Your existing chart component goes here */}
              {/* <ProgressChart /> or directly the Recharts code */}
              {/* Chart */}
              <div className="relative h-52 mt-10 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    height="100%"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }} // Remove extra space
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="60%" stopColor="#FF6C40" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#FF6C40" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>

                    {/* Grid only horizontal */}
                    <CartesianGrid stroke="#D5D5D5" strokeDasharray="3 3" vertical={false} />

                    {/* X-Axis */}
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fontWeight: 'bold', fill: '#333' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={20}
                    />

                    {/* Y-Axis */}
                    <YAxis
                      domain={[0, 2000]}
                      ticks={[100, 500, 1000, 1500, 2000]}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />

                    {/* Optional: Remove Tooltip if you don’t need it */}
                    {/* <Tooltip /> */}

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f97316"
                      fill="url(#colorValue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
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
                <Info className="hidden md:block w-4 h-4 text-black cursor-pointer" />

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
                125
              </div>

              {/* Chart */}
              <TestScore />
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
                  <Info className="w-4 h-4 text-black" />
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
    </MainLayout>
  );
};

export default Statistics;