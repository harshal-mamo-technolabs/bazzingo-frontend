import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import FilterBar from '../components/games/FilterBar';
import GamesGrid from '../components/games/GamesGrid';
import DailyGameModal from '../components/games/DailyGameModal';

const games = [
  { id: 1, title: 'Code Breaking Cipher', category: 'Logic', difficulty: 'Easy', icon: './games-icon/code-breaking-ciper.png', bgColor: '#D5EBFF', path: "/games/code-breaking-cipher-game" },
  { id: 2, title: 'Logic Grid Solver', category: 'Logic', difficulty: 'Hard', icon: './games-icon/logic-grid-solver.png', bgColor: '#D8F0E4', path: "/games/logic-grid-solver-game" },
  {
    id: 3,
    title: 'Probability Prediction',
    category: 'Numerical Reasoning',
    difficulty: 'Hard',
    featured: true,
    trending: true,
    description: "Best game for the exercise of your mind—it'll help you focus your daily tasks.",
    icon: './games-icon/probability-prediction.png',
    bgColor: '#ffffff',
    path: '/games/probability-prediction-game'
  },
  { id: 4, title: 'Resource Allocation Strategy', category: 'Critical Thinking', difficulty: 'Easy', icon: './games-icon/resource-allocation-strategy.png', bgColor: '#ffffff', path: "/games/resource-allocation-strategy-game" },
  { id: 5, title: 'Word Chain Logic', category: 'Logic', difficulty: 'Medium', icon: './games-icon/word-chain-logic.png', bgColor: '#1D1D1B', path: "/games/word-chain-logic-game" },
  { id: 6, title: 'Mathematical Deduction', category: 'Numerical Reasoning', difficulty: 'Medium', icon: './games-icon/mathematical-deduction.png', bgColor: '#FFFFFF', path: "/games/math-deduction-game" },
  { id: 7, title: 'Cognative Load Balancer', category: 'Gameacy', difficulty: 'Hard', icon: './games-icon/image7.png', bgColor: '#D4E8DC', path: "/games/cognitive-load-balancer-game" },
  { id: 8, title: 'Word Match Master', category: 'Problem Solving', difficulty: 'Hard', icon: './games-icon/word-search-master.png', bgColor: '#1D1D1B', path: "/games/word-search-master-game" },
  { id: 9, title: 'Tic Tac Toe', category: 'Gameacy', difficulty: 'Hard', icon: './games-icon/TicTacToe.png', bgColor: '#D4E8DC', path: "/games/tic-tac-toe-game" },
  { id: 10, title: '2028', category: 'Problem Solving', difficulty: 'Hard', icon: './games-icon/2048.png', bgColor: '#FFFFFF', path: "/games/2048-game" },
  { id: 11, title: 'Metacognitive Strategy Navigator', category: 'Gameacy', difficulty: 'Easy', icon: './games-icon/image2.png', bgColor: '#1D1D1B', path: "/games/metacognitive-strategy-navigator-game" },
  { id: 12, title: 'Number Flip', category: 'Logic', difficulty: 'Easy', icon: './games-icon/image3-main.png', bgColor: '#D0F2E8', path: "/games/number-flip-game" },
  { id: 13, title: 'Sequance Recall', category: 'Logic', difficulty: 'Hard', icon: './games-icon/image4.png', bgColor: '#1D1D1B', path: "/games/sequence-recall-game" },
  { id: 14, title: 'Tap Challange', category: 'Gameacy', difficulty: 'Easy', icon: './tap-challenge-game.png', bgColor: '#D5EBFF', path: "/games/tap-challenge-game" },
  { id: 15, title: 'Sudoku Master', category: 'Problem Solving', difficulty: 'Easy', icon: './games-icon/sudoku-master-game.png', bgColor: '#ffffff', path: "/games/sudoku-master-game" },
];

const categories = [
  'All', 'Gameacy', 'Numerical Reasoning',
  'Problem Solving', 'Critical Thinking', 'Logic',
];
//const levels = ['Easy', 'Medium', 'Hard'];

const pillConfig = {
  Easy: { bg: '#cfe0cc', border: '#1A7212', text: '#1A7212' },
  Medium: { bg: '#ead3bf', border: '#e18a27', text: '#db6804' },
  Hard: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' },
  Trending: { bg: '#FF6B3E', border: '#FF6B3E', text: '#000000' }
};

export default function Games() {
  const [activeCategory, setActiveCategory] = useState('All');
  //const [activeLevel, setActiveLevel] = useState('Easy');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const unread = 3;

  const dailyGames = games.slice(0, 3);

  return (
    <MainLayout unreadCount={unread}>
      <div className="text-[12px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12 py-4">
          <FilterBar
            categories={categories}
            //levels={levels}
            activeCategory={activeCategory}
            //activeLevel={activeLevel}
            onCategoryChange={setActiveCategory}
          //onLevelChange={setActiveLevel}
          />

          <GamesGrid
            games={games}
            pillConfig={pillConfig}
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