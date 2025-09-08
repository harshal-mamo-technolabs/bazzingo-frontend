import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import LeaderboardTable from "../components/Tables/LeadboardTable";
import MainLayout from "../components/Layout/MainLayout";
import TopRank from "../components/Charts/TopRank";
import { getLeaderboard } from "../services/dashbaordService";
import { countries } from "../utils/constant";

const ProgressBar = ({ percentage }) => (
  <div className="relative w-full lg:max-w-[150px] h-7 bg-white border border-gray-200 rounded-[5px] overflow-hidden">
    <div
      className="absolute inset-y-0 left-0 bg-[#fda98d] rounded-l-[5px] transition-all duration-500"
      style={{ width: `${percentage}%` }}
    />
    <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-gray-800 z-10">
      {percentage}%
    </div>
  </div>
);

const activities = [
  {
    icon: '/daily-puzzle-icon.png',
    alt: 'Daily Puzzle',
    label: 'Daily Puzzle',
    complete: '36/36',
    pct: 80,
    statusType: 'completed',
    iconBg: 'bg-gray-100',
  },
  {
    icon: '/daily-assessment-icon.png',
    alt: 'Daily Assessment',
    label: 'Daily Assessment',
    complete: '20/20',
    pct: 30,
    statusType: 'completed',
    iconBg: 'bg-gray-100',
  },
  {
    icon: '/maze-escape-activity-icon.png',
    alt: 'Mage Scape',
    label: 'Mage Scape',
    complete: '4/36',
    pct: 10,
    statusType: 'resume',
    iconBg: 'bg-blue-50',
  },
];

const Leadboard = () => {
  const unreadCount = 3;
  const [scope, setScope] = useState("global");
  const [country, setCountry] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [leaderboardData, setLeaderboardData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getLeaderboard({ scope, country, ageGroup, page: 1, limit: 25 });
        setLeaderboardData(res?.data || {});
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [scope, country, ageGroup]);

  return (
    <MainLayout unreadCount={unreadCount}>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
        {/* Main Content */}
        <div className="mx-auto px-4 lg:px-12 py-4 lg:py-7">
          {/* Filter Buttons */}
          <div className="bg-[#EEEEEE] border border-gray-200 rounded-lg shadow-sm py-3 mb-4 px-4">
            <div className="flex items-center justify-between">
              {/* Left - Category Tabs */}
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => { setScope("global"); setCountry(""); setAgeGroup(""); }}
                  className={`px-4 py-1 rounded-lg text-[13px] font-medium shadow-sm ${
                    scope === "global" ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]" 
                                      : "text-gray-600 bg-white"
                  }`}
                >
                  Global
                </button>

                <div className="relative">
                  <button
                    onClick={() => setScope("country")}
                    className={`px-4 py-1 rounded-lg text-[13px] font-medium shadow-sm ${
                      scope === "country" ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]" 
                                        : "text-gray-600 bg-white"
                    }`}
                  >
                    Country <ChevronDown className="inline-block ml-1" size={14} />
                  </button>
                  {scope === "country" && (
                    <select
                      className="absolute top-full left-0 mt-1 px-2 py-1 border rounded text-sm bg-white"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option value="">Select Country</option>
                      {countries.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setScope("age")}
                    className={`px-4 py-1 rounded-lg text-[13px] font-medium shadow-sm ${
                      scope === "age" ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]" 
                                    : "text-gray-600 bg-white"
                    }`}
                  >
                    By Age <ChevronDown className="inline-block ml-1" size={14} />
                  </button>
                  {scope === "age" && (
                    <select
                      className="absolute top-full left-0 mt-1 px-2 py-1 border rounded text-sm bg-white"
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                    >
                      <option value="">Select Age Group</option>
                      <option value="0-12">0-12</option>
                      <option value="13-17">13-17</option>
                      <option value="18-25">18-25</option>
                      <option value="25-34">25-34</option>
                      <option value="35-44">35-44</option>
                      <option value="45-64">45-64</option>
                      <option value="65-200">65+</option>
                    </select>
                  )}
                </div>

                <button
                  onClick={() => { setScope("assessment"); setCountry(""); setAgeGroup(""); }}
                  className={`px-4 py-1 rounded-lg text-[13px] font-medium shadow-sm ${
                    scope === "assessment" ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]" 
                                        : "text-gray-600 bg-white"
                  }`}
                >
                  By Assessment
                </button>
              </div>

              {/* Mobile layout: Statistics + Icon aligned at ends */}
              <div className="flex w-full justify-between items-center md:hidden">
                <p className="text-md font-medium text-gray-800">Statistics</p>
                <img src="/Funnel.png" alt="Funnel Icon" className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/*Visible on md+ screens only else hidden*/}
          <div className="hidden lg:block">
            <div className="flex flex-col-reverse lg:flex-row gap-6">
              {/* Left Column (Web): LeaderboardTable (Web middle), (Mobile middle) */}
              <div className="w-full lg:w-[750px] order-2 lg:order-1">
                <LeaderboardTable 
                  data={leaderboardData.results || []} 
                  currentUser={leaderboardData.currentUser}
                  scope={scope}
                  loading={loading}
                />
              </div>

              {/* Right Column (Web right), (Mobile top + bottom) */}
              <div className="w-full lg:w-[350px] flex flex-col gap-6 order-1 lg:order-2">
                {/* TopRank - top on mobile */}
                <div className="order-1 lg:order-1">
                  <TopRank currentUser={leaderboardData.currentUser} />
                </div>

                {/* Recent Activity - bottom on mobile */}
                <div className="order-3 lg:order-2 bg-[#EEEEEE] rounded-lg p-2 md:p-3 shadow-sm h-[350px]">
                  <h3 className="text-[18px] font-semibold text-gray-900 md:ml-1 md:mt-1 mb-4">Recent Activity</h3>
                  <div className="space-y-4 mt-4">
                    {activities.map(({ icon, alt, label, pct, statusType, iconBg }, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F2F5F6] rounded-xl px-3 py-4 flex items-center justify-between gap-3"
                      >
                        {/* Icon + Label */}
                        <div className="flex items-center gap-2 min-w-[105px]">
                          <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                            <img src={icon} alt={alt} className="w-10 h-10" />
                          </div>
                          <span className="text-[12px] font-medium text-gray-900 leading-tight max-w-[30px]">
                            {label}
                          </span>
                        </div>

                        {/* ProgressBar */}
                        <div className="flex-1 mx-2 max-w-[190px]">
                          <ProgressBar percentage={pct} />
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-end min-w-[20px]">
                          {statusType === 'completed' ? (
                            <div className="flex items-center space-x-1 text-green-600 text-xs font-medium">
                              <img src="/task-complete-icon.svg" alt="Completed" className="w-4 h-4" />
                              <span>Completed</span>
                            </div>
                          ) : (
                            <button className="bg-[#edd9c6] text-orange-500 border border-orange-300 hover:bg-orange-100 px-4 py-[6px] rounded-md text-xs font-medium transition-colors">
                              Resume
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*Visible on mobile only else hidden*/}
          <div className="flex lg:hidden flex-col lg:flex-row gap-6">
            {/* TopRank - Comes first on mobile, top right on desktop */}
            <div className="order-1 lg:order-2 w-full lg:w-[350px]">
              <TopRank currentUser={leaderboardData.currentUser} />
            </div>

            {/* Leaderboard - Second on mobile, left on desktop */}
            <div className="order-2 lg:order-1 w-full lg:w-[750px]">
              <LeaderboardTable 
                data={leaderboardData.results || []} 
                currentUser={leaderboardData.currentUser}
                scope={scope}
                loading={loading}
              />
            </div>

            {/* Recent Activity - Last on mobile, bottom right on desktop */}
            <div className="order-3 lg:order-2 w-full lg:w-[350px]">
              <div className="bg-[#EEEEEE] rounded-lg p-2 md:p-6 shadow-sm h-[350px]">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4 mt-4">
                  {activities.map(({ icon, alt, label, pct, statusType, iconBg }, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F2F5F6] rounded-xl px-3 py-4 flex items-center justify-between gap-3"
                    >
                      {/* Icon + Label */}
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div
                          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
                        >
                          <img src={icon} alt={alt} className="w-10 h-10" />
                        </div>
                        <span className="text-[12px] font-medium text-gray-900 leading-tight max-w-[30px]">
                          {label}
                        </span>
                      </div>

                      {/* ProgressBar */}
                      <div className="flex-1 mx-2 max-w-[190px]">
                        <ProgressBar percentage={pct} />
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-end min-w-[20px]">
                        {statusType === 'completed' ? (
                          <div className="flex items-center space-x-1 text-green-600 text-xs font-medium">
                            <img src="/task-complete-icon.svg" alt="Completed" className="w-4 h-4" />
                            <span>Completed</span>
                          </div>
                        ) : (
                          <button className="bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 px-4 py-[6px] rounded-md text-xs font-medium transition-colors">
                            Resume
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default Leadboard;