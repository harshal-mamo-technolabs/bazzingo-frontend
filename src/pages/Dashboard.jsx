import React, { useCallback, useState } from 'react';
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

const Dashboard = () => {

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showTooltipStats, setShowTooltipStats] = useState(false);
  const [showTooltipSuggest, setShowTooltipSuggest] = useState(false);

  const dailyGames = DAILY_GAMES;

  const handleGameClick = useCallback(
      (game) => {
        setIsModalOpen(false);
        navigate(game.path);
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
              <IQAndGamesSummary iqScore="125" totalGames="25"/>
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