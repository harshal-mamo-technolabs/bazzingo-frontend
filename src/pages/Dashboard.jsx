import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
import { getDashboardData, getDailyGames, getRecentAssessmentActivity, getUserProfile, getQuickAssessment } from '../services/dashbaordService.js';
import { isComponentVisible } from '../config/accessControl';

const Dashboard = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showTooltipStats, setShowTooltipStats] = useState(false);
  const [showTooltipSuggest, setShowTooltipSuggest] = useState(false);
  const [quickAssessmentTitle, setQuickAssessmentTitle] = useState('Memory Test'); // Default title

  // NEW: generic primary metric (either IQ or Driving Licence)
  const [primaryType, setPrimaryType] = useState('iq');       // 'iq' | 'drivingLicense'
  const [primaryScore, setPrimaryScore] = useState(0);

  const [totalGames, setTotalGames] = useState(0);
  const [dailyGames, setDailyGames] = useState([]); // initially empty
  // Add userData state
  const [userData, setUserData] = useState(null);
  const [isAssessmentCompleted, setIsAssessmentCompleted] = useState(false);
  const [hasOpenedModal, setHasOpenedModal] = useState(false); // 👈 new flag

  // Update the fetchUserProfile effect
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUserData(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

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
            isPlayed:g.isPlayed,
          }));
          setDailyGames(mappedGames);
        }
      } catch (err) {
        console.error("Failed to fetch daily games:", err);
      }
    };

    const fetchQuickAssessment = async () => {
      try {
        const response = await getQuickAssessment();
        if (response?.status === "success") {
          setQuickAssessmentTitle(response.data.assessment.title);
        }
      } catch (error) {
        console.error("Failed to fetch quick assessment:", error);
        // Keep default title if fetch fails
      }
    };

    fetchDashboardData();
    fetchDailyGames();
    fetchQuickAssessment();
  },[]);

  // In Dashboard.jsx - Update the handleGameClick function
  const handleGameClick = useCallback(
    (game) => {
      setIsModalOpen(false);
      // Pass difficulty and gameId via navigate state
      navigate(game.path, {
        state: {
          gameId: game.id, // Add gameId for score submission
          gameName: game.title,
          fromDailyGame: true,
          difficulty: game.difficulty
        }
      });
    },
    [navigate]
  );

  // Open modal automatically only if there is any game left to play
  useEffect(() => {
    if (dailyGames.length > 0 && !hasOpenedModal) {
      const allPlayed = dailyGames.every(g => g.isPlayed);
      if (!allPlayed) {
        setIsModalOpen(true);
      }
      setHasOpenedModal(true); // prevent opening again
    }
  }, [dailyGames, hasOpenedModal]);

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
      setIsAssessmentCompleted(completedTodayQuick);
      // if (completedTodayQuick) {
      //   toast.success("You've completed today's quick assessment!");
      //   return;
      // }
    } catch (err) {
      console.error('Failed to check recent quick assessment activity:', err);
    }
    
    // Fetch the latest assessment data for the modal
    try {
      const response = await getQuickAssessment();
      if (response?.status === "success") {
        setSelectedAssessment({
          title: response.data.assessment.title, // This will show in modal
          description: 'Mini Test, 5–10 Question',
          icon: CognitiveFocusBrainIcon,
        });
      } else {
        // Fallback if fetch fails
        setSelectedAssessment({
          title: quickAssessmentTitle,
          description: 'Mini Test, 5–10 Question',
          icon: CognitiveFocusBrainIcon,
        });
      }
    } catch (error) {
      console.error('Failed to fetch quick assessment for modal:', error);
      // Fallback if fetch fails
      setSelectedAssessment({
        title: quickAssessmentTitle,
        description: 'Mini Test, 5–10 Question',
        icon: CognitiveFocusBrainIcon,
      });
    }
    
    setIsAssessmentModalOpen(true);
  }, [quickAssessmentTitle]);

  const openHighlightAssessment = useCallback(async (assessmentData) => {
    try {
      // Check if assessment is already completed
      if (assessmentData.isCompleted) {
        toast.success(`You've already completed today's ${assessmentData.title || 'assessment'}. Great job!`);
        return;
      }
    } catch (err) {
      console.error('Failed to verify assessment completion status:', err);
    }
    
    // Open modal with assessment data
    setSelectedAssessment({
      title: assessmentData.title || 'Certified Cognitive Assessment',
      description: 'Mini Test, 5–10 Question',
      icon: CognitiveFocusBrainIcon,
      assessmentId: assessmentData.assessmentId,
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
          <PageHeader userData={userData} />

          {/* Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <IQAndGamesSummary
              primaryType={primaryType}
              primaryScore={primaryScore}
              totalGames={totalGames}
            />
            <AssessmentHighlightCard onAssessmentClick={openHighlightAssessment} />
            {isComponentVisible('dashboardCertifiedCard') && <AssessmentUpsellCard />}
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
                  toast.success('You have played all today\'s games!');
                } else {
                  setIsModalOpen(true);
                }
              } catch {
                setIsModalOpen(true);
              }
            }} games={dailyGames} />
            <DailyAssessmentCard title={quickAssessmentTitle} onAssessmentClick={openAssessment} />
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
              isCompleted={isAssessmentCompleted}
            />
          </>
        </main>
      </div>
    </MainLayout>
  );
};

export default Dashboard;