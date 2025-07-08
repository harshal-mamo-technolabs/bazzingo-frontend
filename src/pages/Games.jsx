import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import FilterBar from '../components/games/FilterBar';
import GamesGrid from '../components/games/GamesGrid';
import DailyGameModal from '../components/games/DailyGameModal';

const games = [
  { id: 1, title: 'Whack a Box', category: 'Gameacy', difficulty: 'Easy', icon: './whack-a-box-game.png', bgColor: '#D5EBFF', path: "/games/whack-a-box-game" },
  { id: 2, title: 'Tile Switch', category: 'Logic', difficulty: 'Hard', icon: './tile-switch-game.png', bgColor: '#D8F0E4', path: "/games/tile-switch-game" },
  {
    id: 3,
    title: 'Tower of Hanoi',
    category: 'Logic',
    difficulty: 'Hard',
    featured: true,
    trending: true,
    description: "Best game for the exercise of your mind—it'll help you focus your daily tasks.",
    icon: './tower-of-hanoi-game.png',
    bgColor: '#ffffff',
    path: '/games/tower-of-hanoi-game'
  },
  { id: 4, title: 'Sound Memory', category: 'Gameacy', difficulty: 'Easy', icon: './sound-memory-game.png', bgColor: '#ffffff', path: "/games/sound-memory-game" },
  { id: 5, title: 'Visual Memory Span', category: 'Logic', difficulty: 'Medium', icon: './whack-a-box-game.png', bgColor: '#1D1D1B', path: "/games/visual-memory-span-game" },
  { id: 6, title: 'Neural Network Builder Game', category: 'Logic', difficulty: 'Medium', icon: './Neural-Network-Builder-Game.png', bgColor: '#FFFFFF', path: "/games/neural-network-builder-game" },
  { id: 7, title: 'Cognative Load Balancer', category: 'Gameacy', difficulty: 'Hard', icon: './games-icon/image7.png', bgColor: '#D4E8DC', path: "/games/cognitive-load-balancer-game" },
  { id: 8, title: 'Mental Rotation 3D', category: 'Logic', difficulty: 'Hard', icon: './games-icon/image8.png', bgColor: '#D8F0E4', path: "/games/mental-rotation-3d-game" },
  { id: 9, title: 'N-Back', category: 'Gameacy', difficulty: 'Hard', icon: './games-icon/image9.png', bgColor: '#D4E8DC', path: "/games/n-back-game" },
  { id: 10, title: 'Cognative Pattern Weaver', category: 'Logic', difficulty: 'Hard', icon: './games-icon/image1.png', bgColor: '#FFFFFF', path: "/games/cognitive-pattern-weaver-game" },
  { id: 11, title: 'Metacognitive Strategy Navigator', category: 'Gameacy', difficulty: 'Easy', icon: './games-icon/image2.png', bgColor: '#1D1D1B', path: "/games/metacognitive-strategy-navigator-game" },
  { id: 12, title: 'Number Flip', category: 'Logic', difficulty: 'Easy', icon: './games-icon/image3-main.png', bgColor: '#D0F2E8', path: "/games/number-flip-game" },
  { id: 13, title: 'Sequance Recall', category: 'Logic', difficulty: 'Hard', icon: './games-icon/image4.png', bgColor: '#1D1D1B', path: "/games/sequence-recall-game" },
  { id: 14, title: 'Tap Challange', category: 'Gameacy', difficulty: 'Easy', icon: './tap-challenge-game.png', bgColor: '#D5EBFF', path: "/games/tap-challenge-game" },
  { id: 15, title: 'Block Stacking', category: 'Gameacy', difficulty: 'Easy', icon: './games-icon/image6.png', bgColor: '#D5EBFF', path: "/games/block-stacking-game" },
];

const categories = [
  'All', 'Gameacy', 'Numerical Reasoning',
  'Problem Solving', 'Critical Thinking', 'Logic',
];
const levels = ['Easy', 'Medium', 'Hard'];

const pillConfig = {
  Easy: { bg: '#cfe0cc', border: '#1A7212', text: '#1A7212' },
  Medium: { bg: '#ead3bf', border: '#e18a27', text: '#db6804' },
  Hard: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' },
  Trending: { bg: '#FF6B3E', border: '#FF6B3E', text: '#000000' }
};

export default function Games() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('Easy');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const unread = 3;

  const dailyGames = games.slice(0, 3);

  return (
    <MainLayout unreadCount={unread}>
      <div className="text-[12px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12 py-4">
          <FilterBar
            categories={categories}
            levels={levels}
            activeCategory={activeCategory}
            activeLevel={activeLevel}
            onCategoryChange={setActiveCategory}
            onLevelChange={setActiveLevel}
          />

          <GamesGrid
            games={games}
            pillConfig={pillConfig}
          // onGameClick={() => setIsModalOpen(true)}
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