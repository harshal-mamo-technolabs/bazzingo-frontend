import React, { useState } from 'react';
import Header from '../components/Header';
import FilterBar from '../components/games/FilterBar';
import GamesGrid from '../components/games/GamesGrid';
import DailyGameModal from '../components/games/DailyGameModal';

const games = [
  { id: 1, title: 'Maze Escape', category: 'Gameacy', difficulty: 'Easy', icon: './maze-escape-icon.png', bgColor: '#D5EBFF' },
  { id: 2, title: 'Concentration', category: 'Logic', difficulty: 'Hard', icon: './maze-escape-icon.png', bgColor: '#D8F0E4' },
  {
    id: 3,
    title: 'Sequence Memory',
    category: 'Logic',
    difficulty: 'Hard',
    featured: true,
    trending: true,
    description: "Best game for the exercise of your mind—it'll help you focus your daily tasks.",
    icon: './maze-escape-icon.png',
    bgColor: '#CDE8E1',
  },
  { id: 4, title: 'Rapid Reflexes', category: 'Gameacy', difficulty: 'Easy', icon: './maze-escape-icon.png', bgColor: '#1D1D1B' },
  { id: 5, title: 'Logical Path', category: 'Logic', difficulty: 'Medium', icon: './maze-escape-icon.png', bgColor: '#FFFFFF' },
  { id: 6, title: 'Logical Path', category: 'Logic', difficulty: 'Medium', icon: './maze-escape-icon.png', bgColor: '#FFFFFF' },
  { id: 7, title: 'Pattern Analysis', category: 'Gameacy', difficulty: 'Hard', icon: './maze-escape-icon.png', bgColor: '#D4E8DC' },
  { id: 8, title: 'Concentration', category: 'Logic', difficulty: 'Hard', icon: './maze-escape-icon.png', bgColor: '#D8F0E4' },
  { id: 9, title: 'Pattern Analysis', category: 'Gameacy', difficulty: 'Hard', icon: './maze-escape-icon.png', bgColor: '#D4E8DC' },
  { id: 10, title: 'Word Recall', category: 'Logic', difficulty: 'Hard', icon: './maze-escape-icon.png', bgColor: '#FFFFFF' },
  { id: 11, title: 'Rapid Reflexes', category: 'Gameacy', difficulty: 'Easy', icon: './maze-escape-icon.png', bgColor: '#1D1D1B' },
  { id: 12, title: 'Numerical Grid', category: 'Logic', difficulty: 'Easy', icon: './maze-escape-icon.png', bgColor: '#D0F2E8' },
  { id: 13, title: 'Reaction Sprint', category: 'Logic', difficulty: 'Hard', icon: './maze-escape-icon.png', bgColor: '#1D1D1B' },
  { id: 14, title: 'Maze Escape', category: 'Gameacy', difficulty: 'Easy', icon: './maze-escape-icon.png', bgColor: '#D5EBFF' },
  { id: 15, title: 'Maze Escape', category: 'Gameacy', difficulty: 'Easy', icon: './maze-escape-icon.png', bgColor: '#D5EBFF' },
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
    <div className="min-h-screen bg-white text-[12px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <Header unreadCount={unread} />

      <main className="mx-auto px-4 lg:px-12 py-4">
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
          onGameClick={() => setIsModalOpen(true)}
        />
      </main>

      <DailyGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dailyGames={dailyGames}
      />
    </div>
  );
}