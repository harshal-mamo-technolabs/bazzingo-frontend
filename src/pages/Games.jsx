import React, { useState, useMemo, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import FilterBar from '../components/games/FilterBar';
import GamesGrid from '../components/games/GamesGrid';
import DailyGameModal from '../components/Dashboard/DailyGameModal.jsx';
import { getAllGames } from '../services/gameService';
import BazzingoLoader from "../components/Loading/BazzingoLoader";
import TranslatedText from '../components/TranslatedText.jsx';
import { useTranslateText } from '../hooks/useTranslate';

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

// Random background colors including all current colors plus black and white
const backgroundColors = [
  '#D5EBFF', // Light blue
  '#D8F0E4', // Light green
  '#FFF2CC', // Light yellow
  '#F0E6FF', // Light purple
  '#FFE6E6', // Light pink
  '#F5F5F5', // Light gray
  '#000000', // Black
  '#FFFFFF', // White
  '#FF6B3E', // Orange
  '#E8E8E8', // Gray
  '#FFD700', // Gold
  '#FF69B4', // Hot pink
  '#00CED1', // Dark turquoise
  '#32CD32', // Lime green
  '#FFA500', // Orange
  '#9370DB', // Medium purple
];

// Function to get random background color ensuring no repetition
const getRandomBgColor = (gameId, usedColors = new Set()) => {
  // Create a deterministic "random" selection based on game ID
  const hash = gameId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Get available colors (not used yet)
  const availableColors = backgroundColors.filter(color => !usedColors.has(color));
  
  // If all colors are used, reset and start over
  if (availableColors.length === 0) {
    usedColors.clear();
    return backgroundColors[Math.abs(hash) % backgroundColors.length];
  }
  
  // Select color based on hash
  const selectedColor = availableColors[Math.abs(hash) % availableColors.length];
  usedColors.add(selectedColor);
  
  return selectedColor;
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
          // Track used colors to avoid repetition
          const usedColors = new Set();
          
          // Transform API data to match component structure
          const transformedGames = response.data.games.map(game => ({
            id: game._id,
            gameId: game._id, // Keep original ID for API calls
            title: game.name,
            category: game.category,
            difficulty: 'Easy', // Default difficulty, can be dynamic
            icon: game.thumbnail,
            bgColor: getRandomBgColor(game._id, usedColors), // Random background color
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

  const loadingMessage = useTranslateText('Loading games...');
  const errorMessage = useTranslateText(error || 'Failed to load games');

  if (loading) {
    return (
      <MainLayout unreadCount={unread}>
        <div className="mx-auto px-4 lg:px-12 py-4">
          <div className="p-6">
            <BazzingoLoader message={loadingMessage} />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout unreadCount={unread}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">{errorMessage}</div>
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