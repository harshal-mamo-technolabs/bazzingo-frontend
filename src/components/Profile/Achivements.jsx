import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { getRanksAndBadges } from "../../services/dashbaordService"; // Adjust path as needed

const Achievements = () => {
  const [ranksAndBadges, setRanksAndBadges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getRanksAndBadges();
        setRanksAndBadges(data.data);
      } catch (err) {
        setError("Failed to load achievements data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Static image mappings - updated to match the API badge titles
  const badgeImages = {
    // Assessment Achievement badges
    "Brain Booster": "/BronzeBadge.png",
    "Consistent Thinker": "/LockedBadge.png",
    "Genius Certified": "/GreenBadge.png",
    "Smart Start": "/GoldBadge.png",
    
    // Engagement badges
    "Bazingo Believer": "/LockedBadge.png",
    "Early Adopter": "/GreenBadge.png",
    
    // Game Achievement badges
    "Game Explorer": "/GoldBadge.png",
    "Logic Master": "/GoldBadge.png",
    "Memory Machine": "/BronzeBadge.png",
    "Reflex Ninja": "/LockedBadge.png",
    "Streak Starter": "/GreenBadge.png",
    
    // Progress & Stats badges
    "First Milestone": "/GoldBadge.png",
    "Improver": "/BronzeBadge.png",
    "Leaderboard Rookie": "/GreenBadge.png",
    "Top 10 Champion": "/LockedBadge.png"
  };

  // Get country name from API (capitalize first letter)
const countryName = ranksAndBadges?.country
? ranksAndBadges.country.charAt(0).toUpperCase() + ranksAndBadges.country.slice(1)
: "India"; // fallback

  const leaderboardImages = {
    "Global": "/global.png",
    [countryName]: "/Global2.png",
    "By Age": "/human.png",
    "By Assessment": "/search.png",
  };

  const sectionImages = {
    "Game Achievement Badges": "/mingcute_game-2-fill.png",
    "Assessment Achievement Badges": "/game-icons_brain.png",
    "Progress & Stats Achievement Badges": "/solar_chart-bold.png",
    "Engagement Achievement Badges": "/gravity-ui_target-dart.png",
  };

  // Map API category names to UI category names
  const categoryMapping = {
    "game-achievement": "Game Achievement Badges",
    "assessment-achievement": "Assessment Achievement Badges",
    "progress-stats": "Progress & Stats Achievement Badges",
    "engagement": "Engagement Achievement Badges"
  };

  if (loading) {
    return <div className="p-4 text-center">Loading achievements...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!ranksAndBadges) {
    return <div className="p-4 text-center">No achievements data available</div>;
  }

  // Prepare sections data from API response
  const sections = Object.entries(ranksAndBadges.badge || {}).map(([category, badges]) => ({
    title: categoryMapping[category] || category,
    items: badges.map(badge => ({
      title: badge.title,
      isUnlocked: badge.isUnlocked,
      // Use the appropriate badge image based on title and unlock status
      image: badge.isUnlocked 
        ? (badgeImages[badge.title] || "/GoldBadge.png") 
        : "/LockedBadge.png"
    })),
    earned: badges.filter(badge => badge.isUnlocked).length,
    total: badges.length
  }));

  return (
    <>
      {/* Web layout */}
      <div className="hidden lg:block">
        <div className="bg-[#EEEEEE] p-3 rounded-lg space-y-3">
          {/* Leaderboard Rank */}
          <div>
            <div className="flex items-center gap-2">
              <img src="/solar_ranking-bold.png" className="mb-3 w-5 h-5" alt="Leaderboard Rank"/>
              <h3 className="text-[11px] text-gray-500 font-semibold mb-2">Your Leaderboard Rank</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Global", value: ranksAndBadges.globalRank },
                { label: [countryName], value: ranksAndBadges.countyRank },
                { label: "By Age", value: ranksAndBadges.byAgeRank },
                { label: "By Assessment", value: ranksAndBadges.byAssessment }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-2 rounded-md flex flex-col items-left justify-center py-1"
                >
                  <img
                    src={leaderboardImages[item.label] || "/leaderboard/default.png"}
                    alt={item.label}
                    className="w-5 h-5 mb-0 object-contain"
                  />
                  <div className="text-[24px] font-bold">{item.value}</div>
                  <div className="text-[11px] text-gray-500 text-left">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {sections.map((section, i) => (
            <div key={i}>
              <hr className="my-2.5 border-t border-gray-300" />
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <img
                    src={sectionImages[section.title] || "/section-icons/default.png"}
                    alt={section.title}
                    className="w-5 h-5"
                  />
                  <h4 className="text-[12px] text-gray-500 font-semibold">
                    {section.title} ({section.earned}/{section.total})
                  </h4>
                </div>
                <Info className="w-3.5 h-3.5 text-gray-600" />
              </div>

              <div className="flex flex-wrap gap-3">
                {section.items.map((badge, j) => (
                  <div
                    key={j}
                    className={`w-16 flex flex-col items-center text-center text-[10px] font-medium ${
                      badge.isUnlocked ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img
                        src={badge.image}
                        alt={badge.title}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <span
                      className={`block mt-1 leading-tight ${
                        badge.title.length > 12 ? "text-[9px]" : ""
                      }`}
                    >
                      {badge.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>  
      </div>
      
      {/* Mobile layout */}
      <div className="block lg:hidden">
        <div className="bg-[#EEEEEE] p-3 rounded-lg space-y-3">
          {/* leaderboard rank */}
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/solar_ranking-bold.png"
                className="mb-3 w-5 h-5"
                alt="Leaderboard Rank"
              />
              <h3 className="text-[11px] text-gray-500 font-semibold mb-2">
                Your Leaderboard Rank
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Global", value: ranksAndBadges.globalRank },
                { label: [countryName], value: ranksAndBadges.countyRank },
                { label: "By Age", value: ranksAndBadges.byAgeRank },
                { label: "By Assessment", value: ranksAndBadges.byAssessment }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-2 rounded-md flex flex-col items-left justify-center py-1"
                >
                  <img
                    src={leaderboardImages[item.label] || "/leaderboard/default.png"}
                    alt={item.label}
                    className="w-5 h-5 mb-0 object-contain"
                  />
                  <div className="text-[24px] font-bold">{item.value}</div>
                  <div className="text-[11px] text-gray-500 text-left">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {sections.map((section, i) => (
            <div key={i}>
              <hr className="my-2.5 border-t border-gray-300" />
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <img
                    src={sectionImages[section.title] || "/section-icons/default.png"}
                    alt={section.title}
                    className="w-5 h-5"
                  />
                  <h4 className="text-[12px] text-gray-500 font-semibold">
                    {section.title} ({section.earned}/{section.total})
                  </h4>
                </div>
                <Info className="w-3.5 h-3.5 text-gray-600" />
              </div>

              <div className="flex flex-wrap gap-3">
                {section.items.map((badge, j) => (
                  <div
                    key={j}
                    className={`w-16 flex flex-col items-center text-center text-[10px] font-medium ${
                      badge.isUnlocked ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img
                        src={badge.image}
                        alt={badge.title}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <span
                      className={`block mt-1 leading-tight ${
                        badge.title.length > 12 ? "text-[9px]" : ""
                      }`}
                    >
                      {badge.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>   
      </div>
    </>
  );
};

export default Achievements;