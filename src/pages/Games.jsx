import React, { useState, useMemo, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import FilterBar from '../components/games/FilterBar';
import GamesGrid from '../components/games/GamesGrid';
import DailyGameModal from '../components/Dashboard/DailyGameModal.jsx';
import { getAllGames } from '../services/gameService';
import BazzingoLoader from "../components/Loading/BazzingoLoader";

const categories = [
  'All', 'Gameacy',
  'Problem Solving', 'Critical Thinking', 'Logic', 'Memory', 
];

const pillConfig = {
  Easy: { bg: '#cfe0cc', border: '#1A7212', text: '#1A7212' },
  Medium: { bg: '#ead3bf', border: '#e18a27', text: '#db6804' },
  Hard: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' },
  Trending: { bg: '#FF6B3E', border: '#FF6B3E', text: '#000000' }
};

// Category-wise background colors
const getCategoryBgColor = (category) => {
  switch (category) {
    case 'Logic':
      return '#D5EBFF'; // Light blue
    case 'Problem Solving':
      return '#D8F0E4'; // Light green
    case 'Critical Thinking':
      return '#FFF2CC'; // Light yellow
    case 'Memory':
      return '#F0E6FF'; // Light purple
    case 'Gameacy':
      return '#FFE6E6'; // Light pink
    default:
      return '#F5F5F5'; // Light gray
  }
};

export default function Games() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unread = 3;

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await getAllGames();
        if (response.status === 'success') {
          // Transform API data to match component structure
          const transformedGames = response.data.games.map(game => ({
            id: game._id,
            gameId: game._id, // Keep original ID for API calls
            title: game.name,
            category: game.category,
            difficulty: 'Easy', // Default difficulty, can be dynamic
            icon: game.thumbnail,
            bgColor: getCategoryBgColor(game.category), // Category-wise background color
            path: game.url
          }));
          setGames(transformedGames);
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const dailyGames = games.slice(0, 3);

  // Filter games based on active category
  const filteredGames = useMemo(() => {
    if (activeCategory === 'All') {
      return games;
    }
    return games.filter(game => game.category === activeCategory);
  }, [activeCategory, games]);

  if (loading) {
    return (
      <MainLayout unreadCount={unread}>
        <div className="mx-auto px-4 lg:px-12 py-4">
          <div className="p-6">
            <BazzingoLoader message="Loading games..." />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout unreadCount={unread}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout unreadCount={unread}>
      <div className="text-[12px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12 py-4">
          <FilterBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <GamesGrid
            games={filteredGames}
            pillConfig={pillConfig}
            activeCategory={activeCategory}
            onGameClick={() => setIsModalOpen(true)}
          />
        </div>

        <DailyGameModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          dailyGames={dailyGames}
        />
      </div>
    </MainLayout>
  );
}