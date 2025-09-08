import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { IQAndGamesSummary, RecommendationGameCarousel, Calender, DailyGameCard, DailyAssessmentCard} from '../components/Dashboard';
import DailyGameModal from '../components/Dashboard/DailyGameModal.jsx';
import DailyAssessmentModal from '../components/Dashboard/DailyAssessmentModal.jsx';
import RecentActivity from '../components/Tables/RecentActivity';
import {DAILY_GAMES} from "../utils/dashboardUtills.js";
import {CognitiveFocusBrainIcon} from '../utils/dashboard-image.js';
import PageHeader from "../components/Dashboard/PageHeader.jsx";
import AssessmentHighlightCard from "../components/Dashboard/AssessmentHighlightCard.jsx";
import AssessmentUpsellCard from "../components/Dashboard/AssessmentUpsellCard.jsx";
import DashboardStatistics from "../components/Dashboard/DashboardStatistics.jsx";
import { getDashboardData, getDailyGames } from '../services/dashbaordService.js';


const Dashboard = () => {

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showTooltipStats, setShowTooltipStats] = useState(false);
  const [showTooltipSuggest, setShowTooltipSuggest] = useState(false);
  const [iqScore, setIqScore] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [dailyGames, setDailyGames] = useState([]); // initially empty

  //const dailyGames = DAILY_GAMES;

  useEffect(()=>{
    const fetchDashboardData = async ()=> {
      try{
        const response = await getDashboardData();
        if(response?.status === "success"){
          setIqScore(response.data.iq || 0);
          setTotalGames(response.data.uniqueGamesPlayed || 0);
        }
      }
      catch(err){
        console.error("Failed to fetch dashboard data: ",err);
      }
    };

    const fetchDailyGames = async () => {
      try {
        const res = await getDailyGames();
        if (res?.status === "success") {
          const mappedGames = res.data.suggestion.games.map((g) => ({
            id: g.gameId._id,
            title: g.gameId.name,
            icon: g.gameId.thumbnail,
            path: g.gameId.url,
            difficulty: g.difficulty,
          }));
          setDailyGames(mappedGames);
        }
      } catch (err) {
        console.error("Failed to fetch daily games:", err);
      }
    };

    fetchDashboardData();
    fetchDailyGames();
  },[]);

  // In Dashboard.jsx - Update the handleGameClick function
const handleGameClick = useCallback(
  (game) => {
    setIsModalOpen(false);
    // Pass difficulty via navigate state instead of just navigating to path
    navigate(game.path, { 
      state: { 
        fromDailyGame: true, 
        difficulty: game.difficulty 
      } 
    });
  },
  [navigate]
);

  const openAssessment = useCallback(() => {
    setSelectedAssessment({
      title: 'Memory Match',
      description: 'Mini Test, 5–10 Question',
      icon: CognitiveFocusBrainIcon,
    });
    setIsAssessmentModalOpen(true);
  }, []);

  const closeAssessment = useCallback(() => {
    setIsAssessmentModalOpen(false);
    setSelectedAssessment(null);
  }, []);

  return (
      <MainLayout>
        <div className="bg-gray-50 min-h-screen">
          <main
              className="mx-auto px-4 lg:px-12 py-4 lg:py-8"
              style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {/* Page header */}
            <PageHeader name="Alex" />

            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <IQAndGamesSummary iqScore={iqScore} totalGames={totalGames}/>
              <AssessmentHighlightCard />
              <AssessmentUpsellCard />
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row lg:gap-4 gap-4 mb-8 w-full">
                <DailyGameCard onGameClick={() => setIsModalOpen(true)} />
                <DailyAssessmentCard onAssessmentClick={openAssessment} />
                <Calender />

              <div className="flex flex-col gap-4 w-full lg:flex-1">
                <DashboardStatistics showTooltipStats={showTooltipStats} setShowTooltipStats={setShowTooltipStats} />
                <RecommendationGameCarousel showTooltipSuggest={showTooltipSuggest} setShowTooltipSuggest={setShowTooltipSuggest} />
              </div>
            </div>

            {/* Bottom Content */}
            <RecentActivity />

            {/* Modals */}
            <>
              <DailyGameModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  dailyGames={dailyGames}
                  onGameClick={handleGameClick}
              />
              <DailyAssessmentModal
                  isOpen={isAssessmentModalOpen}
                  selectedAssessment={selectedAssessment}
                  onClose={closeAssessment}
              />
            </>
          </main>
        </div>
      </MainLayout>
  );
};

export default Dashboard;