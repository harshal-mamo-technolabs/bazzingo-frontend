import React from 'react';
import { Trophy, Star, Award, Anchor } from 'lucide-react';

const PerformanceSummary = ({ 
  finalScore, 
  rank, 
  correctAnswers, 
  totalPuzzles, 
  hintsUsed, 
  wrongAttempts,
  completedIslands 
}) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 'Gold': return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'Silver': return <Award className="h-8 w-8 text-gray-400" />;
      case 'Bronze': return <Star className="h-8 w-8 text-amber-600" />;
      default: return <Anchor className="h-8 w-8 text-blue-500" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Gold': return 'from-yellow-400 to-yellow-600';
      case 'Silver': return 'from-gray-300 to-gray-500';
      case 'Bronze': return 'from-amber-400 to-amber-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getRankMessage = (rank) => {
    switch (rank) {
      case 'Gold': return 'Outstanding! You are a master codebreaker worthy of the Venetian admiralty!';
      case 'Silver': return 'Excellent work! Your skills would serve well in the Croatian naval forces!';
      case 'Bronze': return 'Good effort! You show promise as an apprentice codebreaker!';
      default: return 'Keep practicing! Every great codebreaker started somewhere!';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-600 rounded-lg p-8 max-w-2xl mx-auto">
      {/* Header with nautical theme */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <span className="text-4xl">🏴‍☠️</span>
          <h2 className="text-3xl font-bold text-blue-900">Mission Complete!</h2>
          <span className="text-4xl">⚓</span>
        </div>
        <p className="text-blue-700 text-lg">
          You have successfully navigated the Croatian Adriatic waters!
        </p>
      </div>

      {/* Rank display */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${getRankColor(rank)} text-white px-8 py-4 rounded-full shadow-lg`}>
          {getRankIcon(rank)}
          <div>
            <div className="text-sm font-medium opacity-90">Codebreaker Rank</div>
            <div className="text-2xl font-bold">{rank}</div>
          </div>
        </div>
        <p className="text-blue-700 mt-4 italic">
          {getRankMessage(rank)}
        </p>
      </div>

      {/* Score display */}
      <div className="bg-white border-2 border-blue-400 rounded-lg p-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{finalScore}</div>
          <div className="text-blue-800 font-semibold">Final Score</div>
          <div className="text-sm text-gray-600 mt-1">out of 200 points</div>
        </div>
      </div>

      {/* Detailed statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{correctAnswers}</div>
          <div className="text-green-600 text-sm">Puzzles Solved</div>
          <div className="text-xs text-gray-600">out of {totalPuzzles}</div>
        </div>
        
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">{hintsUsed}</div>
          <div className="text-yellow-600 text-sm">Hints Used</div>
          <div className="text-xs text-gray-600">navigation aids</div>
        </div>
        
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{wrongAttempts}</div>
          <div className="text-red-600 text-sm">Wrong Attempts</div>
          <div className="text-xs text-gray-600">navigation errors</div>
        </div>
        
        <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{completedIslands.length}</div>
          <div className="text-blue-600 text-sm">Islands Explored</div>
          <div className="text-xs text-gray-600">Croatian coastline</div>
        </div>
      </div>

      {/* Islands completed */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="text-xl">🏝️</span>
          Islands Successfully Explored
        </h3>
        <div className="flex justify-center gap-4">
          {completedIslands.map((island, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-1">
                {island === 'Easy' ? '🧂' : island === 'Moderate' ? '🌸' : '🏛️'}
              </div>
              <div className="text-sm font-semibold text-amber-700">
                {island === 'Easy' ? 'Pag' : island === 'Moderate' ? 'Hvar' : 'Brač'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical note */}
      <div className="bg-stone-100 border-2 border-stone-400 rounded-lg p-4 text-center">
        <div className="text-stone-700 text-sm italic">
          "The Croatian coast has been a crossroads of civilizations for millennia. 
          From Roman emperors to Venetian merchants, many have used codes to protect their secrets 
          along these ancient trade routes."
        </div>
        <div className="text-xs text-stone-500 mt-2">
          - Maritime History of the Adriatic
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary;