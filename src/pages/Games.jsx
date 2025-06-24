/* Games.jsx */
import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';

/* ── DATA (14 tiles, 1 featured) ─────────────────────────────────────────── */
const games = [
  { id: 1, title: 'Maze Escape', category: 'Gameacy', difficulty: 'Easy' },
  { id: 2, title: 'Concentration', category: 'Logic', difficulty: 'Hard' },
  {
    id: 3, title: 'Sequence Memory', category: 'Logic', difficulty: 'Hard',
    featured: true, trending: true,
    description: "Best game for the exercise of your mind it's help to focused your daily task"
  },
  { id: 4, title: 'Rapid Reflexes', category: 'Gameacy', difficulty: 'Easy' },
  { id: 5, title: 'Logical Path', category: 'Logic', difficulty: 'Medium' },

  { id: 6, title: 'Logical Path', category: 'Logic', difficulty: 'Medium' },
  { id: 7, title: 'Pattern Analysis', category: 'Gameacy', difficulty: 'Hard' },
  { id: 8, title: 'Concentration', category: 'Logic', difficulty: 'Hard' },
  { id: 9, title: 'Pattern Analysis', category: 'Gameacy', difficulty: 'Hard' },

  { id: 10, title: 'Word Recall', category: 'Logic', difficulty: 'Hard' },
  { id: 11, title: 'Rapid Reflexes', category: 'Gameacy', difficulty: 'Easy' },
  { id: 12, title: 'Numerical Grid', category: 'Logic', difficulty: 'Easy' },
  { id: 13, title: 'Reaction Sprint', category: 'Logic', difficulty: 'Hard' },
  { id: 14, title: 'Maze Escape', category: 'Gameacy', difficulty: 'Easy' },
  { id: 14, title: 'Maze Escape', category: 'Gameacy', difficulty: 'Easy' },
];

/* ── Filter-bar data ─────────────────────────────────────────────────────── */
const categories = [
  'All', 'Gameacy', 'Numerical Reasoning', 'Problem Solving', 'Critical Thinking', 'Logic',
];
const levels = ['Easy', 'Medium', 'Hard'];

/* difficulty-badge colours */
const diffColor = (d) =>
  d === 'Easy' ? 'bg-green-500' :
    d === 'Medium' ? 'bg-orange-500' :
      'bg-red-500';          // Hard

/* pill style helper */
const pill = (active) =>
  `shrink-0 rounded-lg px-6 py-2 text-[12px] font-semibold border-2
   ${active ? 'border-[#FF6B3E] text-[#FF6B3E]' : 'border-[#ECECEC] text-gray-700'} bg-white`;

/* ── COMPONENT ───────────────────────────────────────────────────────────── */
export default function Games() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('Easy');
  const unread = 3;

  return (
    <div className="min-h-screen bg-white font-inter text-[12px]">
      {/* ███ HEADER ███ */}
      <nav className="bg-[#F2F2F2] border-b border-gray-200">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-12">
          <div className="flex justify-between items-center h-[56px]">
            <h1 className="text-[24px] font-bold">
              <span className="text-[#FF6B3E]">B</span><span className="text-black">AZIN</span><span className="text-[#FF6B3E]">G</span><span className="text-[#FF6B3E]">O</span>
            </h1>
            <nav className="hidden lg:flex gap-7 text-[12px] font-medium">
              {['Games', 'Assessments', 'Statistics', 'Leaderboard'].map((t) =>
                <a key={t} href="#" className="text-gray-700 hover:text-gray-900">{t}</a>)}
            </nav>
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Bell className="h-[18px] w-[18px] text-gray-600" />
                {unread > 0 && (
                  <span className="absolute -top-[2px] -right-[2px] h-[12px] w-[12px] bg-[#FF6B3E] text-white text-[8px] rounded-full flex items-center justify-center">{unread}</span>
                )}
              </div>
              <div className="h-7 w-7 bg-black text-white rounded-full hidden lg:flex items-center justify-center font-medium">A</div>
              <Menu className="h-6 w-6 text-gray-600 lg:hidden" />
            </div>
          </div>
        </div>
      </nav>

      {/* ███ MAIN ███ */}
      <main className="max-w-[1500px] mx-auto px-4 lg:px-12 py-4">

        {/* ░░ Filter bar ░░ */}
        <div className="bg-[#F5F5F5] rounded-md p-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <span className="text-gray-900 font-semibold shrink-0">Categories</span>
          <span className="hidden sm:inline-block h-5 w-px bg-gray-300" />
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pr-1 sm:flex-wrap" style={{ scrollbarWidth: 'none' }}>
            {categories.map(c => (
              <button key={c} className={pill(activeCategory === c)} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>

          <span className="hidden sm:inline-block h-5 w-px bg-gray-300" />
          <span className="text-gray-900 font-semibold shrink-0">Levels</span>
          <span className="hidden sm:inline-block h-5 w-px bg-gray-300" />
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap items-center pr-1 sm:flex-wrap" style={{ scrollbarWidth: 'none' }}>
            {levels.map(l => (
              <button key={l} className={pill(activeLevel === l)} onClick={() => setActiveLevel(l)}>{l}</button>
            ))}
            <select className="border-2 border-[#ECECEC] rounded-lg bg-white px-6 py-2 text-gray-700 text-[12px] shrink-0">
              <option value="recent">Recent Played</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* ░░ Grid ░░ */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 grid-flow-dense auto-rows-[1fr]">
          {games.map(g => (
            <div
              key={g.id}
              className={`
                bg-[#E5E5E5] rounded-lg p-3 relative hover:shadow-lg transition-shadow
                ${g.featured ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}
              `}
            >
              {/* badges */}
              {g.trending && (
                <span className="absolute top-2 left-2 bg-[#FF6B3E] text-white px-2 py-[2px] text-[10px] font-bold rounded">Trending</span>
              )}
              <span className={`absolute top-2 right-2 ${diffColor(g.difficulty)} text-white px-2 py-[2px] text-[10px] font-bold rounded`}>
                {g.difficulty}
              </span>

              {/* icon + static info */}
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-center h-full">
                  <img
                    src="/daily-puzzle-icon.png"
                    alt=""
                    className={g.featured ? 'w-28 md:w-32' : 'w-20 md:w-24'}
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                {g.featured ? (
                  <div className="mt-2">
                    <h3 className="text-sm font-bold">{g.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{g.description}</p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <h4 className="text-xs font-semibold">{g.title}</h4>
                    <p className="text-[10px] text-gray-600">{g.category}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
