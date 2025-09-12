import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { IQAndGamesSummary, RecommendationGameCarousel, Calender, DailyGameCard, DailyAssessmentCard} from '../components/Dashboard';
import DailyGameModal from '../components/Dashboard/DailyGameModal.jsx';
import DailyAssessmentModal from '../components/Dashboard/DailyAssessmentModal.jsx';
import NoticeModal from '../components/common/NoticeModal.jsx';
import RecentActivity from '../components/Tables/RecentActivity';
import {DAILY_GAMES} from "../utils/dashboardUtills.js";
import {CognitiveFocusBrainIcon} from '../utils/dashboard-image.js';
import PageHeader from "../components/Dashboard/PageHeader.jsx";
import AssessmentHighlightCard from "../components/Dashboard/AssessmentHighlightCard.jsx";
import AssessmentUpsellCard from "../components/Dashboard/AssessmentUpsellCard.jsx";
import DashboardStatistics from "../components/Dashboard/DashboardStatistics.jsx";
import { getDashboardData, getDailyGames, getRecentAssessmentActivity } from '../services/dashbaordService.js';

const Dashboard = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [notice, setNotice] = useState({ open: false, title: '', message: '' });
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showTooltipStats, setShowTooltipStats] = useState(false);
  const [showTooltipSuggest, setShowTooltipSuggest] = useState(false);

  // NEW: generic primary metric (either IQ or Driving Licence)
  const [primaryType, setPrimaryType] = useState('iq');       // 'iq' | 'drivingLicense'
  const [primaryScore, setPrimaryScore] = useState(0);

  const [totalGames, setTotalGames] = useState(0);
  const [dailyGames, setDailyGames] = useState([]); // initially empty

  useEffect(()=>{
    const extractScore = (val) => {
      if (val == null) return undefined;
      if (typeof val === 'number') return val;
      if (typeof val === 'object' && typeof val.score === 'number') return val.score;
      return undefined;
    };

    const fetchDashboardData = async ()=> {
      try{
        const response = await getDashboardData();
        if(response?.status === "success"){
          const data = response.data || {};
          const dlScore = extractScore(data.drivingLicense);
          const iqScore = extractScore(data.iq);

          if (typeof dlScore === 'number') {
            setPrimaryType('drivingLicense');
            setPrimaryScore(dlScore);
          } else {
            setPrimaryType('iq');
            setPrimaryScore(typeof iqScore === 'number' ? iqScore : 0);
          }

          setTotalGames(data.uniqueGamesPlayed ?? 0);
        }
      }
      catch(err){
        console.error("Failed to fetch dashboard data: ",err);
        // sensible fallbacks
        setPrimaryType('iq');
        setPrimaryScore(0);
        setTotalGames(0);
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

  const openAssessment = useCallback(async () => {
    try {
      // Check if today's quick assessment already completed using recent activity
      const recent = await getRecentAssessmentActivity();
      const scores = recent?.data?.scores || [];
      const todayStr = new Date().toDateString();
      const completedTodayQuick = scores.some(s => {
        const d = new Date(s.submittedAt);
        return s.type === 'quick' && d.toDateString() === todayStr;
      });
      if (completedTodayQuick) {
        setNotice({ open: true, title: 'Congratulations!', message: "You've completed today’s quick assessment." });
        return;
      }
    } catch {}
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
            <IQAndGamesSummary
              primaryType={primaryType}
              primaryScore={primaryScore}
              totalGames={totalGames}
            />
            <AssessmentHighlightCard />
            <AssessmentUpsellCard />
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row lg:gap-4 gap-4 mb-8 w-full">
            <DailyGameCard onGameClick={async () => {
              try {
                const res = await getDailyGames();
                const suggestion = res?.data?.suggestion;
                const allPlayed = Array.isArray(suggestion?.games)
                  ? suggestion.games.every(g => g.isPlayed)
                  : false;
                if (allPlayed) {
                  setNotice({ open: true, title: 'Congratulations!', message: 'You have played all today’s games.' });
                } else {
                  setIsModalOpen(true);
                }
              } catch (e) {
                setIsModalOpen(true);
              }
            }} games={dailyGames} />
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
            <NoticeModal
              isOpen={notice.open}
              onClose={() => setNotice({ open: false, title: '', message: '' })}
              title={notice.title}
              message={notice.message}
            />
          </>
        </main>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
