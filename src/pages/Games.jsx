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

// Vibrant, impactful background colors with dark colors included
const backgroundColors = [
  // Vibrant colors
  '#FF6B6B', // Vibrant red
  '#4ECDC4', // Turquoise
  '#FFE66D', // Bright yellow
  '#A8E6CF', // Mint green
  '#FF8B94', // Coral pink
  '#C7CEEA', // Lavender
  '#FFDAC1', // Peach
  '#B4F8C8', // Light green
  '#FBE7C6', // Cream
  '#A0E7E5', // Aqua
  
  // Dark colors
  '#2C3E50', // Dark blue-gray
  '#34495E', // Slate gray
  '#1A1A2E', // Dark navy
  '#16213E', // Deep blue
  '#0F3460', // Navy blue
  '#533483', // Deep purple
  '#2D4059', // Dark slate
  '#1B262C', // Charcoal
  '#3E4149', // Dark gray
  '#2F4454', // Steel blue
  
  // More vibrant
  '#FFAEBC', // Rose
  '#B4A7D6', // Purple
  '#FFD3B6', // Light orange
  '#DCEDC1', // Pale green
  '#FFC8DD', // Pink
  '#BDE0FE', // Sky blue
  '#A2D2FF', // Light blue
  '#CDB4DB', // Mauve
  '#FFC6FF', // Light pink
  '#CAFFBF', // Lime
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
      <div className="text-[12px] relative min-h-screen overflow-hidden" style={{ fontFamily: 'Roboto, sans-serif' }}>
        {/* Gamified animated background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100"></div>
          
          {/* Floating game icons/shapes */}
          <div className="absolute inset-0 opacity-20">
            {/* Floating circles - like game bubbles */}
            <div className="absolute top-[10%] left-[5%] w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-float-slow"></div>
            <div className="absolute top-[60%] left-[15%] w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-float-medium"></div>
            <div className="absolute top-[30%] right-[10%] w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 animate-float-fast"></div>
            <div className="absolute bottom-[20%] right-[20%] w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 animate-float-slow"></div>
            <div className="absolute top-[80%] left-[40%] w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 animate-float-medium"></div>
            <div className="absolute top-[15%] right-[30%] w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-500 animate-float-fast"></div>
            
            {/* Game controller shapes */}
            <div className="absolute top-[40%] left-[25%] text-6xl animate-spin-slow opacity-30">🎮</div>
            <div className="absolute top-[70%] right-[15%] text-5xl animate-bounce-slow opacity-30">🎯</div>
            <div className="absolute top-[25%] left-[60%] text-4xl animate-pulse-slow opacity-30">⭐</div>
            <div className="absolute bottom-[30%] left-[10%] text-5xl animate-wiggle opacity-30">🏆</div>
            <div className="absolute top-[50%] right-[40%] text-4xl animate-bounce-slow opacity-30">🎲</div>
            <div className="absolute bottom-[15%] right-[5%] text-6xl animate-spin-slow opacity-30">🎪</div>
            
            {/* Pixel-style squares - retro gaming feel */}
            <div className="absolute top-[20%] left-[80%] w-8 h-8 bg-yellow-400 animate-pixel-bounce"></div>
            <div className="absolute top-[55%] left-[70%] w-6 h-6 bg-cyan-400 animate-pixel-bounce animation-delay-1000"></div>
            <div className="absolute bottom-[40%] left-[85%] w-10 h-10 bg-pink-400 animate-pixel-bounce animation-delay-2000"></div>
            <div className="absolute top-[35%] left-[5%] w-7 h-7 bg-green-400 animate-pixel-bounce animation-delay-1500"></div>
          </div>
          
          {/* Animated grid pattern - like game level background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, #8B5CF6 1px, transparent 1px),
                linear-gradient(to bottom, #8B5CF6 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              animation: 'grid-scroll 20s linear infinite'
            }}></div>
          </div>
          
          {/* Particle effects */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Power-up glow effects */}
          <div className="absolute top-10 left-10 w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow animation-delay-4000"></div>
        </div>

        <div className="mx-auto px-4 lg:px-12 py-4 relative">
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
        
        <style>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-40px) translateX(-10px); }
            75% { transform: translateY(-20px) translateX(10px); }
          }
          
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            33% { transform: translateY(-30px) translateX(15px) rotate(5deg); }
            66% { transform: translateY(-15px) translateX(-15px) rotate(-5deg); }
          }
          
          @keyframes float-fast {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-50px) scale(1.1); }
          }
          
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.5; }
          }
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
          
          @keyframes pixel-bounce {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(90deg); }
            50% { transform: translateY(-30px) rotate(180deg); }
            75% { transform: translateY(-15px) rotate(270deg); }
          }
          
          @keyframes grid-scroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(40px); }
          }
          
          @keyframes particle {
            0% { transform: translateY(0) scale(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) scale(1); opacity: 0; }
          }
          
          @keyframes pulse-glow {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.5; }
          }
          
          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
          
          .animate-float-medium {
            animation: float-medium 6s ease-in-out infinite;
          }
          
          .animate-float-fast {
            animation: float-fast 4s ease-in-out infinite;
          }
          
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
          
          .animate-wiggle {
            animation: wiggle 2s ease-in-out infinite;
          }
          
          .animate-pixel-bounce {
            animation: pixel-bounce 4s ease-in-out infinite;
          }
          
          .animate-particle {
            animation: particle linear infinite;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 6s ease-in-out infinite;
          }
          
          .animation-delay-1000 {
            animation-delay: 1s;
          }
          
          .animation-delay-1500 {
            animation-delay: 1.5s;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    </MainLayout>
  );
}