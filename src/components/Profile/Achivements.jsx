import React from "react";
import { Info } from "lucide-react";


const Achievements = () => {
  
const badgeImages = {
  "Logic Master": "/GoldBadge.png",
  "Memory Machine": "/BronzeBadge.png",
  "Reflex Ninja": "/GreenBadge.png",
  "Streak Starter": "/LockedBadge.png",
  "Game Explorer": "/LockedBadge.png",

  "Smart Start": "/GoldBadge.png",
  "Brain Booster": "/BronzeBadge.png",
  "Genius Certified": "/GreenBadge.png",
  "Category Pro": "/LockedBadge.png",
  "Consistent Thinker": "/LockedBadge.png",

  "First Milestone": "/GoldBadge.png",
  "Improver": "/BronzeBadge.png",
  "Leaderboard Rookie": "/GreenBadge.png",
  "Leaderboard Climber": "/LockedBadge.png",
  "Top 10 Champion": "/LockedBadge.png",

  "Bazingo Believer": "/GoldBadge.png",
  "Community Star": "/BronzeBadge.png",
  "Early Adopter": "/GreenBadge.png",
};

const leaderboardImages = {
  "Global": "/global.png",
  "India": "/Global2.png",
  "By Age": "/human.png",
  "By Assessment": "/search.png",
};

const sectionImages = {
  "Game Achievement Badges": "/mingcute_game-2-fill.png",
  "Assessment Achievement Badges": "/game-icons_brain.png",
  "Progress & Stats Achievement Badges": "/solar_chart-bold.png",
  "Engagement Achievement Badges": "/gravity-ui_target-dart.png",
};
    return (
        <>
        {/*Web layout*/}
        <div className="hidden lg:block">
          <div className="bg-[#EEEEEE] p-3 rounded-lg space-y-3">
    {/* Leaderboard Rank */}
    <div>
      <div className="flex items-center gap-2">
      <img src="/solar_ranking-bold.png" className="mb-3 w-5 h-5" alt="Leaderboard Rank"/>
      <h3 className="text-[11px] text-gray-500 font-semibold mb-2">Your Leaderboard Rank</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
  {["Global", "India", "By Age", "By Assessment"].map((label, i) => (
    <div
      key={i}
      className="bg-white p-2 rounded-md flex flex-col items-left justify-center py-1"
    >
      <img
        src={leaderboardImages[label] || "/leaderboard/default.png"}
        alt={label}
        className="w-5 h-5 mb-0 object-contain"
      />
      <div className="text-[24px] font-bold">250</div>
      <div className="text-[11px] text-gray-500 text-left">{label}</div>
    </div>
  ))}
</div>
    </div>

    {[
  {
    title: "Game Achievement Badges",
    items: [
      "Logic Master",
      "Memory Machine",
      "Reflex Ninja",
      "Streak Starter",
      "Game Explorer",
    ],
    earned: 3,
  },
  {
    title: "Assessment Achievement Badges",
    items: [
      "Smart Start",
      "Brain Booster",
      "Genius Certified",
      "Category Pro",
      "Consistent Thinker",
    ],
    earned: 3,
  },
  {
    title: "Progress & Stats Achievement Badges",
    items: [
      "First Milestone",
      "Improver",
      "Leaderboard Rookie",
      "Leaderboard Climber",
      "Top 10 Champion",
    ],
    earned: 3,
  },
  {
    title: "Engagement Achievement Badges",
    items: ["Bazingo Believer", "Community Star", "Early Adopter"],
    earned: 3,
  },
].map((section, i) => (
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
      {section.title}
    </h4>
  </div>
  <Info className="w-3.5 h-3.5 text-gray-600" />
</div>

    <div className="flex flex-wrap gap-3">
      {section.items.map((label, j) => (
        <div
          key={j}
          className={`w-16 flex flex-col items-center text-center text-[10px] font-medium ${
            j < section.earned ? "text-gray-800" : "text-gray-400"
          }`}
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src={badgeImages[label] || "/badges/default.png"}
              alt={label}
              className="w-12 h-12 object-contain"
            />
          </div>
          <span
            className={`block mt-1 leading-tight ${
              label.length > 12 ? "text-[9px]" : ""
            }`}
          >
            {label}
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
          {["Global", "India", "By Age", "By Assessment"].map((label, i) => (
            <div
              key={i}
              className="bg-white p-2 rounded-md flex flex-col items-left justify-center py-1"
            >
              <img
                src={leaderboardImages[label] || "/leaderboard/default.png"}
                alt={label}
                className="w-5 h-5 mb-0 object-contain"
              />
              <div className="text-[24px] font-bold">250</div>
              <div className="text-[11px] text-gray-500 text-left">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {[
        {
          title: "Game Achievement Badges",
          items: [
            "Logic Master",
            "Memory Machine",
            "Reflex Ninja",
            "Streak Starter",
            "Game Explorer",
          ],
          earned: 3,
        },
        {
          title: "Assessment Achievement Badges",
          items: [
            "Smart Start",
            "Brain Booster",
            "Genius Certified",
            "Category Pro",
            "Consistent Thinker",
          ],
          earned: 3,
        },
        {
          title: "Progress & Stats Achievement Badges",
          items: [
            "First Milestone",
            "Improver",
            "Leaderboard Rookie",
            "Leaderboard Climber",
            "Top 10 Champion",
          ],
          earned: 3,
        },
        {
          title: "Engagement Achievement Badges",
          items: ["Bazingo Believer", "Community Star", "Early Adopter"],
          earned: 3,
        },
      ].map((section, i) => (
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
                {section.title}
              </h4>
            </div>
            <Info className="w-3.5 h-3.5 text-gray-600" />
          </div>

          <div className="flex flex-wrap gap-3">
            {section.items.map((label, j) => (
              <div
                key={j}
                className={`w-16 flex flex-col items-center text-center text-[10px] font-medium ${
                  j < section.earned ? "text-gray-800" : "text-gray-400"
                }`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <img
                    src={badgeImages[label] || "/badges/default.png"}
                    alt={label}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span
                  className={`block mt-1 leading-tight ${
                    label.length > 12 ? "text-[9px]" : ""
                  }`}
                >
                  {label}
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