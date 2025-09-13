import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InfoTooltip from "../InfoToolTip.jsx";
import handleTooltipClick from "../../utils/toolTipHandler.js";
import { getAllGames } from "../../services/gameService.js";

const RecommendationGameCarousel = ({showTooltipSuggest, setShowTooltipSuggest}) => {
    const [games, setGames] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await getAllGames();
                if (response?.status === "success" && response.data?.games) {
                    // Filter active games and select two random ones
                    const activeGames = response.data.games.filter(game => game.isActive);
                    const randomGames = getRandomGames(activeGames, 2);
                    setGames(randomGames);
                }
            } catch (error) {
                console.error("Error fetching games:", error);
            }
        };

        fetchGames();
    }, []);

    // Function to get random games from the array
    const getRandomGames = (gamesArray, count) => {
        const shuffled = [...gamesArray].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // Function to get difficulty badge (random for now, can be enhanced)
    const getDifficultyBadge = () => {
        const difficulties = [
            { label: "Easy", class: "bg-green-100 text-green-800" },
            { label: "Medium", class: "bg-yellow-100 text-yellow-800" },
            { label: "Hard", class: "bg-red-100 text-red-800" }
        ];
        return difficulties[Math.floor(Math.random() * difficulties.length)];
    };

    // Handle game click with difficulty and navigation
    const handleGameClick = useCallback((game) => {
        const difficulty = getDifficultyBadge().label.toLowerCase();
        
        // Navigate to game with difficulty parameter
        navigate(game.url, {
            state: {
                fromRecommendation: true,
                difficulty: difficulty
            }
        });
    }, [navigate]);

    return (
        <>
          <div className="bg-[#fef3c7] rounded-lg p-3 shadow-sm border border-gray-100 w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-normal text-gray-900">Suggest for You</h3>
              <InfoTooltip
                  text="Personalized suggestions to help improve your performance."
                  visible={showTooltipSuggest}
                  onTrigger={() => handleTooltipClick(setShowTooltipSuggest)}
              />
            </div>

            <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-3 whitespace-nowrap scrollbar-hide">
              {games.map((game) => {
                const difficulty = getDifficultyBadge();
                
                return (
                  <div 
                    key={game._id} 
                    className="carousel-card inline-block md:w-[95%] w-[70%] mr-3 bg-white rounded-md p-2 shrink-0 h-[170px] md:h-auto cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleGameClick(game)}
                  >
                    <div className="bg-[#dceeff] rounded-md p-3 mb-2 flex justify-center items-center">
                      <img 
                        src={game.thumbnail} 
                        alt={game.name} 
                        className="w-20 h-20 md:w-10 md:h-10 object-contain" 
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-800 mb-1">
                      {game.name}
                      <span className={`ml-2 text-[10px] ${difficulty.class} px-2 py-[1px] rounded-full`}>
                        {difficulty.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">{game.category}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
    );
};
export default RecommendationGameCarousel;