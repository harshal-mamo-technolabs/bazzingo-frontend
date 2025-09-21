import React, { useState, useEffect } from "react";
import LeaderboardTable from "../components/Tables/LeadboardTable";
import MainLayout from "../components/Layout/MainLayout";
import TopRank from "../components/Charts/TopRank";
import SubscriptionBlocker from "../components/Subscription/SubscriptionBlocker";
import { getLeaderboard, getDailyStreakStatus } from "../services/dashbaordService";
import { useNavigate } from 'react-router-dom';
import { countries } from "../utils/constant";
import SelectMenu from "../components/Leaderboard/SelectMenu.jsx";
import { useSelector, useDispatch } from 'react-redux';
import { fetchSubscriptionStatus, selectHasActiveSubscription, selectSubscriptionInitialized, selectSubscriptionLoading, selectSubscriptionData } from '../app/subscriptionSlice';

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

const staticIconMap = {
  game: {
    icon: '/daily-puzzle-icon.png',
    alt: 'Daily Games',
    iconBg: 'bg-gray-100',
  },
  assessment: {
    icon: '/daily-assessment-icon.png',
    alt: 'Daily Assessments',
    iconBg: 'bg-gray-100',
  },
};

const Leadboard = () => {
  const unreadCount = 3;

  const [scope, setScope] = useState("global");
  const [country, setCountry] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [leaderboardData, setLeaderboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dailyStreakData, setDailyStreakData] = useState(null);
  const [streakLoading, setStreakLoading] = useState(false);
  
  // Redux subscription state
  const dispatch = useDispatch();
  const hasActiveSubscription = useSelector(selectHasActiveSubscription);
  const subscriptionInitialized = useSelector(selectSubscriptionInitialized);
  const subscriptionLoading = useSelector(selectSubscriptionLoading);
  const subscriptionData = useSelector(selectSubscriptionData);
  const navigate = useNavigate();

  // Build dropdown options
  const countryOptions = countries.map(c => ({ key: c, label: c }));
  const ageOptions = ["1-12","13-17","18-24","25-34","35-44","45-64","65-200"].map(a => ({ key: a, label: a }));

  // Fetch subscription status when component mounts
  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

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

  useEffect(() => {
    const loadDailyStreak = async () => {
      try {
        setStreakLoading(true);
        const res = await getDailyStreakStatus();
        
        // Check if both are null, don't set data
        if (!res.data.dailySuggestedGame && !res.data.dailySuggestedAssessment) {
          setDailyStreakData(null);
          return;
        }

        setDailyStreakData(res.data);
      } catch {
        setDailyStreakData(null);
      } finally {
        setStreakLoading(false);
      }
    };
    loadDailyStreak();
  }, []);

  // Process daily streak data for display
  const getProcessedActivities = () => {
    if (!dailyStreakData) return [];

    const activities = [];

    // Process games if available
    if (dailyStreakData.dailySuggestedGame) {
      const game = dailyStreakData.dailySuggestedGame;
      const completionPercentage = game.totalSuggestedGames > 0 
        ? Math.round((game.totalSubmitedGames / game.totalSuggestedGames) * 100)
        : 0;

      activities.push({
        type: 'game',
        label: 'Daily Games',
        pct: completionPercentage,
        totalSuggested: game.totalSuggestedGames,
        totalSubmitted: game.totalSubmitedGames,
        statusType: completionPercentage === 100 ? 'completed' : 'resume'
      });
    }

    // Process assessments if available
    if (dailyStreakData.dailySuggestedAssessment) {
      const assessment = dailyStreakData.dailySuggestedAssessment;
      const completionPercentage = assessment.totalSuggestedAssessments > 0 
        ? Math.round((assessment.totalSubmitedAssessments / assessment.totalSuggestedAssessments) * 100)
        : 0;

      activities.push({
        type: 'assessment',
        label: 'Daily Assessments',
        pct: completionPercentage,
        totalSuggested: assessment.totalSuggestedAssessments,
        totalSubmitted: assessment.totalSubmitedAssessments,
        statusType: completionPercentage === 100 ? 'completed' : 'resume'
      });
    }

    return activities;
  };

  const processedActivities = getProcessedActivities();
  const hasActivities = processedActivities.length > 0;

  return (
    <MainLayout unreadCount={unreadCount}>
      <SubscriptionBlocker 
        showBlocker={subscriptionInitialized && (
          // Block if no subscription OR currently on trial
          !hasActiveSubscription || subscriptionData.status === 'trialing'
        )}
        title={subscriptionData.status === 'trialing' ? 'Leaderboard unavailable on trial' : 'Premium Leaderboard'}
        message={subscriptionData.status === 'trialing'
          ? 'End your trial and activate the Silver Monthly plan to access Leaderboard rankings and compete with others.'
          : 'Please subscribe to Bazzingo plan to access leaderboard rankings and compete with other users'}
        buttonText={subscriptionData.status === 'trialing' ? 'End Trial Now' : 'Subscribe Now'}
        onSubscribe={subscriptionData.status === 'trialing' ? () => navigate('/subscription?action=end-trial&from=leaderboard') : undefined}
      >
        <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12 py-4 lg:py-7">
          {/* Filters */}
          <div className="bg-[#EEEEEE] border border-gray-200 rounded-lg shadow-sm py-3 mb-4 px-4">
            <div className="flex items-center justify-between">
              {/* Left - Tabs + Filters */}
              <div className="hidden md:flex items-center space-x-2">
                {/* Global */}
                <button
                  onClick={() => { setScope("global"); setCountry(""); setAgeGroup(""); }}
                  className={`px-4 py-1 rounded-lg text-[13px] font-medium shadow-sm ${
                    scope === "global" ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]" : "text-gray-600 bg-white"
                  }`}
                >
                  Global
                </button>

                {/* Country (custom dropdown) */}
                <SelectMenu
                  options={countryOptions}
                  value={country}
                  onChange={(val) => {
                    if (val) {
                      setScope("country");
                      setAgeGroup("");
                    } else {
                      if (!ageGroup) setScope("global");
                    }
                    setCountry(val);
                  }}
                  placeholder="Country"
                  searchable
                  clearable
                  align="left"
                  width="w-56"
                  maxHeightClass="max-h-80 md:max-h-96"   // cap height so it never covers the screen
                  buttonClassName={`${
                    country
                      ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]"
                      : "text-gray-600 bg-white"
                  }`}
                />

                {/* Age group (custom dropdown) */}
                <SelectMenu
                  options={ageOptions}
                  value={ageGroup}
                  onChange={(val) => {
                    if (val) {
                      setScope("age");
                      setCountry("");
                    } else {
                      if (!country) setScope("global");
                    }
                    setAgeGroup(val);
                  }}
                  placeholder="By Age"
                  clearable
                  align="left"
                  width="w-40"
                  maxHeightClass="max-h-72"
                  buttonClassName={`${
                    ageGroup
                      ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]"
                      : "text-gray-600 bg-white"
                  }`}
                />

                {/* Assessment / Game scopes */}
                <button
                  onClick={() => { setScope("assessment"); setCountry(""); setAgeGroup(""); }}
                  className={`px-4 py-1 rounded-lg text-[13px] font-medium shadow-sm ${
                    scope === "assessment" ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]" : "text-gray-600 bg-white"
                  }`}
                >
                  By Assessment
                </button>

                <button
                  onClick={() => { setScope("game"); setCountry(""); setAgeGroup(""); }}
                  className={`px-4 py-1 rounded-lg text-[13px] font-medium shadow-sm ${
                    scope === "game" ? "border border-orange-500 text-orange-600 bg-[#F0E2DD]" : "text-gray-600 bg-white"
                  }`}
                >
                  By Game
                </button>
              </div>

              {/* Mobile header */}
              <div className="flex w-full justify-between items-center md:hidden">
                <p className="text-md font-medium text-gray-800">Statistics</p>
                <img src="/Funnel.png" alt="Funnel Icon" className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:block">
            <div className="flex flex-col-reverse lg:flex-row gap-6">
              {/* Leaderboard table */}
              <div className="w-full lg:w-[750px] order-2 lg:order-1">
                {(() => {
                  const results = leaderboardData.results || [];

                  const [minAge, maxAge] = (() => {
                    if (!ageGroup) return [null, null];
                    const parts = ageGroup.split('-');
                    const min = parseInt(parts[0], 10);
                    const max = parseInt(parts[1], 10);
                    return [isNaN(min) ? null : min, isNaN(max) ? null : max];
                  })();

                  const matchesAgeGroup = (entry) => {
                    if (!ageGroup) return true;
                    if (entry.ageGroup && typeof entry.ageGroup === 'string') {
                      return entry.ageGroup === ageGroup;
                    }
                    if (typeof entry.age === 'number' && minAge !== null && maxAge !== null) {
                      return entry.age >= minAge && entry.age <= maxAge;
                    }
                    return true;
                  };

                  const filteredResults = results.filter((entry) => {
                    const countryOk = country ? String(entry.country).trim().toLowerCase() === country.trim().toLowerCase() : true;
                    const ageOk = matchesAgeGroup(entry);
                    return countryOk && ageOk;
                  });

                  return (
                    <LeaderboardTable 
                      data={filteredResults} 
                      currentUser={leaderboardData.currentUser}
                      scope={scope}
                      loading={loading}
                      selectedCountry={country}
                      selectedAgeGroup={ageGroup}
                    />
                  );
                })()}
              </div>

              {/* Right column */}
              <div className="w-full lg:w-[350px] flex flex-col gap-6 order-1 lg:order-2">
                <div className="order-1 lg:order-1">
                  <TopRank currentUser={leaderboardData.currentUser} />
                </div>

                {hasActivities && (
                  <div className="order-3 lg:order-2 bg-[#EEEEEE] rounded-lg p-2 md:p-3 shadow-sm h-[350px]">
                    <h3 className="text-[18px] font-semibold text-gray-900 md:ml-1 md:mt-1 mb-4">Recent Activity</h3>
                    <div className="space-y-4 mt-4">
                      {processedActivities.map((activity, idx) => {
                        const { icon, alt, iconBg } = staticIconMap[activity.type] || staticIconMap.game;
                        return (
                          <div key={idx} className="bg-[#F2F5F6] rounded-xl px-3 py-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-[105px]">
                              <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                                <img src={icon} alt={alt} className="w-10 h-10" />
                              </div>
                              <span className="text-[12px] font-medium text-gray-900 leading-tight max-w-[30px]">
                                {activity.label}
                              </span>
                            </div>

                            <div className="flex-1 mx-2 max-w-[190px]">
                              <ProgressBar percentage={activity.pct} />
                            </div>

                            <div className="flex items-center justify-end min-w-[20px]">
                              {activity.statusType === 'completed' ? (
                                <div className="flex items-center space-x-1 text-green-600 text-xs font-medium">
                                  <img src="/task-complete-icon.svg" alt="Completed" className="w-4 h-4" />
                                  <span>Completed</span>
                                </div>
                              ) : (
                                <button className="bg-[#edd9c6] text-orange-500 border border-orange-300 hover:bg-orange-100 px-4 py-[6px] rounded-md text-xs font-medium transition-colors">
                                  Pending
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex lg:hidden flex-col lg:flex-row gap-6">
            <div className="order-1 lg:order-2 w-full lg:w-[350px]">
              <TopRank currentUser={leaderboardData.currentUser} />
            </div>

            <div className="order-2 lg:order-1 w-full lg:w-[750px]">
              {(() => {
                const results = leaderboardData.results || [];

                const [minAge, maxAge] = (() => {
                  if (!ageGroup) return [null, null];
                  const parts = ageGroup.split('-');
                  const min = parseInt(parts[0], 10);
                  const max = parseInt(parts[1], 10);
                  return [isNaN(min) ? null : min, isNaN(max) ? null : max];
                })();

                const matchesAgeGroup = (entry) => {
                  if (!ageGroup) return true;
                  if (entry.ageGroup && typeof entry.ageGroup === 'string') {
                    return entry.ageGroup === ageGroup;
                  }
                  if (typeof entry.age === 'number' && minAge !== null && maxAge !== null) {
                    return entry.age >= minAge && entry.age <= maxAge;
                  }
                  return true;
                };

                const filteredResults = results.filter((entry) => {
                  const countryOk = country ? String(entry.country).trim().toLowerCase() === country.trim().toLowerCase() : true;
                  const ageOk = matchesAgeGroup(entry);
                  return countryOk && ageOk;
                });

                return (
                  <LeaderboardTable 
                    data={filteredResults} 
                    currentUser={leaderboardData.currentUser}
                    scope={scope}
                    loading={loading}
                    selectedCountry={country}
                    selectedAgeGroup={ageGroup}
                  />
                );
              })()}
            </div>

            {hasActivities && (
              <div className="order-3 lg:order-2 w-full lg:w-[350px]">
                <div className="bg-[#EEEEEE] rounded-lg p-2 md:p-6 shadow-sm h-[350px]">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4 mt-4">
                    {processedActivities.map((activity, idx) => {
                      const { icon, alt, iconBg } = staticIconMap[activity.type] || staticIconMap.game;
                      return (
                        <div key={idx} className="bg-[#F2F5F6] rounded-xl px-3 py-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                              <img src={icon} alt={alt} className="w-10 h-10" />
                            </div>
                            <span className="text-[12px] font-medium text-gray-900 leading-tight max-w-[30px]">
                              {activity.label}
                            </span>
                          </div>

                          <div className="flex-1 mx-2 max-w-[190px]">
                            <ProgressBar percentage={activity.pct} />
                          </div>

                          <div className="flex items-center justify-end min-w-[20px]">
                            {activity.statusType === 'completed' ? (
                              <div className="flex items-center space-x-1 text-green-600 text-xs font-medium">
                                <img src="/task-complete-icon.svg" alt="Completed" className="w-4 h-4" />
                                <span>Completed</span>
                              </div>
                            ) : (
                              <button className="bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 px-4 py-[6px] rounded-md text-xs font-medium transition-colors">
                                Pending
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </SubscriptionBlocker>
    </MainLayout>
  );
};

export default Leadboard;