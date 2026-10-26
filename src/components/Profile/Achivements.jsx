import React, { useState, useEffect } from "react";
import { getRanksAndBadges } from "../../services/dashbaordService"; // Adjust path as needed
import TranslatedText from "../TranslatedText.jsx";
import InfoTooltip from "../InfoToolTip.jsx";
import handleTooltipClick from "../../utils/toolTipHandler.js";

const Achievements = () => {
  const [ranksAndBadges, setRanksAndBadges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTooltips, setShowTooltips] = useState({});

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
    "Brain Booster": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/BronzeBadge.png",
    "Consistent Thinker": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/LockedBadge.png",
    "Genius Certified": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GreenBadge.png",
    "Smart Start": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GoldBadge.png",
    
    // Engagement badges
    "Bazingo Believer": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/LockedBadge.png",
    "Early Adopter": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GreenBadge.png",
    
    // Game Achievement badges
    "Game Explorer": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GoldBadge.png",
    "Logic Master": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GoldBadge.png",
    "Memory Machine": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/BronzeBadge.png",
    "Reflex Ninja": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/LockedBadge.png",
    "Streak Starter": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GreenBadge.png",
    
    // Progress & Stats badges
    "First Milestone": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GoldBadge.png",
    "Improver": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/BronzeBadge.png",
    "Leaderboard Rookie": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GreenBadge.png",
    "Top 10 Champion": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/LockedBadge.png"
  };

  // Get country name from API (capitalize first letter)
const countryName = ranksAndBadges?.country
? ranksAndBadges.country.charAt(0).toUpperCase() + ranksAndBadges.country.slice(1)
: "India"; // fallback

  const leaderboardImages = {
    "Global": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/global.png",
    [countryName]: "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/Global2.png",
    "By Age": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/human.png",
    "By Assessment": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/search.png",
  };

  const sectionImages = {
    "Game Achievement Badges": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/mingcute_game-2-fill.png",
    "Assessment Achievement Badges": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/game-icons_brain.png",
    "Progress & Stats Achievement Badges": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/solar_chart-bold.png",
    "Engagement Achievement Badges": "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/gravity-ui_target-dart.png",
  };

  // Map API category names to UI category names (keep as strings for sectionImages lookup)
  const categoryMapping = {
    "game-achievement": "Game Achievement Badges",
    "assessment-achievement": "Assessment Achievement Badges",
    "progress-stats": "Progress & Stats Achievement Badges",
    "engagement": "Engagement Achievement Badges"
  };

  // Tooltip content for each badge category
  const getTooltipText = (categoryTitle) => {
    if (categoryTitle === "Game Achievement Badges") {
      return "Earn badges by playing games and achieving milestones in your gaming journey.";
    } else if (categoryTitle === "Assessment Achievement Badges") {
      return "Complete assessments and demonstrate your cognitive abilities to unlock these badges.";
    } else if (categoryTitle === "Progress & Stats Achievement Badges") {
      return "Track your progress and reach new heights to earn these achievement badges.";
    } else if (categoryTitle === "Engagement Achievement Badges") {
      return "Stay active and engaged with the platform to unlock these special badges.";
    }
    return "Complete activities to earn achievement badges.";
  };

  if (loading) {
    return <div className="p-4 text-center"><TranslatedText text="Loading achievements..." /></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500"><TranslatedText text="Failed to load achievements data" /></div>;
  }

  if (!ranksAndBadges) {
    return <div className="p-4 text-center"><TranslatedText text="No achievements data available" /></div>;
  }

  // Prepare sections data from API response
  const sections = Object.entries(ranksAndBadges.badge || {}).map(([category, badges]) => {
    const categoryTitle = categoryMapping[category] || category;
    return {
    title: categoryTitle,
    items: badges.map(badge => ({
      title: badge.title,
      isUnlocked: badge.isUnlocked,
      // Use the appropriate badge image based on title and unlock status
      image: badge.isUnlocked 
        ? (badgeImages[badge.title] || "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/GoldBadge.png") 
        : "https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/LockedBadge.png"
    })),
    earned: badges.filter(badge => badge.isUnlocked).length,
    total: badges.length,
    titleComponent: categoryTitle === "Game Achievement Badges" ? <TranslatedText text="Game Achievement Badges" /> :
                     categoryTitle === "Assessment Achievement Badges" ? <TranslatedText text="Assessment Achievement Badges" /> :
                     categoryTitle === "Progress & Stats Achievement Badges" ? <TranslatedText text="Progress & Stats Achievement Badges" /> :
                     categoryTitle === "Engagement Achievement Badges" ? <TranslatedText text="Engagement Achievement Badges" /> :
                     categoryTitle
  };
  });

  return (
    <>
      {/* Web layout */}
      <div className="hidden lg:block">
        <div className="bg-[#EEEEEE] p-3 rounded-lg space-y-3">
          {/* Leaderboard Rank Game */}
          <div>
            <div className="flex items-center gap-2">
              <img src="https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/mingcute_game-2-fill.png" className="mb-3 w-5 h-5" alt="Game Leaderboard Rank"/>
              <h3 className="text-[11px] text-gray-500 font-semibold mb-2"><TranslatedText text="Leaderboard Game Rank" /></h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: <TranslatedText text="Global" />, value: ranksAndBadges.gameGlobalRank },
                { label: countryName, value: ranksAndBadges.gameCountryRank },
                { label: <TranslatedText text="By Age" />, value: ranksAndBadges.gameAgeGroupRank }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-2 rounded-md flex flex-col items-left justify-center py-1"
                >
                  <img
                    src={leaderboardImages[typeof item.label === 'string' ? item.label : (item.label?.props?.text || 'Global')] || "/leaderboard/default.png"}
                    alt={typeof item.label === 'string' ? item.label : (item.label?.props?.text || 'Global')}
                    className="w-5 h-5 mb-0 object-contain"
                  />
                  <div className="text-[24px] font-bold">{item.value}</div>
                  <div className="text-[11px] text-gray-500 text-left">
                    {typeof item.label === 'string' ? item.label : item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Rank Assessment */}
          <div>
            <div className="flex items-center gap-2">
              <img src="https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/game-icons_brain.png" className="mb-3 w-5 h-5" alt="Assessment Leaderboard Rank"/>
              <h3 className="text-[11px] text-gray-500 font-semibold mb-2"><TranslatedText text="Leaderboard Assessment Rank" /></h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: <TranslatedText text="Global" />, value: ranksAndBadges.assessmentGlobalRank },
                { label: countryName, value: ranksAndBadges.assessmentCountryRank },
                { label: <TranslatedText text="By Age" />, value: ranksAndBadges.assessmentAgeGroupRank }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-2 rounded-md flex flex-col items-left justify-center py-1"
                >
                  <img
                    src={leaderboardImages[typeof item.label === 'string' ? item.label : (item.label?.props?.text || 'Global')] || "/leaderboard/default.png"}
                    alt={typeof item.label === 'string' ? item.label : (item.label?.props?.text || 'Global')}
                    className="w-5 h-5 mb-0 object-contain"
                  />
                  <div className="text-[24px] font-bold">{item.value}</div>
                  <div className="text-[11px] text-gray-500 text-left">
                    {typeof item.label === 'string' ? item.label : item.label}
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
                    {section.titleComponent || section.title} ({section.earned}/{section.total})
                  </h4>
                </div>
                <InfoTooltip
                  text={<TranslatedText text={getTooltipText(section.title)} />}
                  visible={showTooltips[section.title] || false}
                  onTrigger={() => handleTooltipClick((show) => {
                    setShowTooltips(prev => ({ ...prev, [section.title]: show }));
                  })}
                />
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
                      <TranslatedText text={badge.title} />
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
          {/* Leaderboard Rank Game */}
          <div>
            <div className="flex items-center gap-2">
              <img
                src="https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/mingcute_game-2-fill.png"
                className="mb-3 w-5 h-5"
                alt="Game Leaderboard Rank"
              />
              <h3 className="text-[11px] text-gray-500 font-semibold mb-2">
                <TranslatedText text="Leaderboard Game Rank" />
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: <TranslatedText text="Global" />, value: ranksAndBadges.gameGlobalRank },
                { label: countryName, value: ranksAndBadges.gameCountryRank },
                { label: <TranslatedText text="By Age" />, value: ranksAndBadges.gameAgeGroupRank }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-2 rounded-md flex flex-col items-left justify-center py-1"
                >
                  <img
                    src={leaderboardImages[typeof item.label === 'string' ? item.label : (item.label?.props?.text || 'Global')] || "/leaderboard/default.png"}
                    alt={typeof item.label === 'string' ? item.label : (item.label?.props?.text || 'Global')}
                    className="w-5 h-5 mb-0 object-contain"
                  />
                  <div className="text-[24px] font-bold">{item.value}</div>
                  <div className="text-[11px] text-gray-500 text-left">
                    {typeof item.label === 'string' ? item.label : item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Rank Assessment */}
          <div>
            <div className="flex items-center gap-2">
              <img
                src="https://testbrain-buzzinga.s3.eu-north-1.amazonaws.com/game-icons_brain.png"
                className="mb-3 w-5 h-5"
                alt="Assessment Leaderboard Rank"
              />
              <h3 className="text-[11px] text-gray-500 font-semibold mb-2">
                <TranslatedText text="Leaderboard Assessment Rank" />
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: <TranslatedText text="Global" />, value: ranksAndBadges.assessmentGlobalRank },
                { label: countryName, value: ranksAndBadges.assessmentCountryRank },
                { label: <TranslatedText text="By Age" />, value: ranksAndBadges.assessmentAgeGroupRank }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-2 rounded-md flex flex-col items-left justify-center py-1"
                >
                  <img
                    src={leaderboardImages[typeof item.label === 'string' ? item.label : (item.label?.props?.text || 'Global')] || "/leaderboard/default.png"}
                    alt={typeof item.label === 'string' ? item.label : (item.label?.props?.text || 'Global')}
                    className="w-5 h-5 mb-0 object-contain"
                  />
                  <div className="text-[24px] font-bold">{item.value}</div>
                  <div className="text-[11px] text-gray-500 text-left">
                    {typeof item.label === 'string' ? item.label : item.label}
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
                    {section.titleComponent || section.title} ({section.earned}/{section.total})
                  </h4>
                </div>
                <InfoTooltip
                  text={<TranslatedText text={getTooltipText(section.title)} />}
                  visible={showTooltips[section.title] || false}
                  onTrigger={() => handleTooltipClick((show) => {
                    setShowTooltips(prev => ({ ...prev, [section.title]: show }));
                  })}
                />
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
                      <TranslatedText text={badge.title} />
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