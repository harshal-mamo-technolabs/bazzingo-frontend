import React from 'react';
import { MapPin, Anchor, Crown, Mountain } from 'lucide-react';

const IslandMap = ({ currentIsland, unlockedIslands, onIslandSelect }) => {
  const islands = [
    {
      name: 'Pag',
      difficulty: 'Easy',
      position: { top: '20%', left: '30%' },
      icon: '🧂',
      description: 'Salt Island',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Hvar',
      difficulty: 'Moderate', 
      position: { top: '60%', left: '45%' },
      icon: '🌸',
      description: 'Lavender Island',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Brač',
      difficulty: 'Hard',
      position: { top: '70%', left: '60%' },
      icon: '🏛️',
      description: 'White Stone Island',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  const isIslandUnlocked = (island) => {
    return unlockedIslands.includes(island.difficulty);
  };

  const isCurrentIsland = (island) => {
    return currentIsland === island.difficulty;
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-sky-200 to-blue-400 rounded-lg overflow-hidden border-4 border-amber-600">
      {/* Sea waves pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-amber-100 border-2 border-amber-600 rounded-lg px-4 py-2 shadow-lg">
          <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Croatian Adriatic Islands
          </h3>
        </div>
      </div>

      {/* Islands */}
      {islands.map((island, index) => (
        <div
          key={island.name}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={island.position}
          onClick={() => isIslandUnlocked(island) && onIslandSelect(island.difficulty)}
        >
          {/* Island base */}
          <div className={`relative ${isIslandUnlocked(island) ? 'hover:scale-110' : 'opacity-50'} transition-all duration-300`}>
            {/* Island shape */}
            <div className={`w-16 h-12 rounded-full ${island.bgColor} border-2 ${isCurrentIsland(island) ? 'border-yellow-400 ring-4 ring-yellow-200' : 'border-amber-600'} shadow-lg`}>
              <div className="flex items-center justify-center h-full">
                <span className="text-2xl">{island.icon}</span>
              </div>
            </div>
            
            {/* Island name and status */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className={`text-sm font-bold ${island.color} bg-white px-2 py-1 rounded border shadow-sm`}>
                {island.name}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {island.description}
              </div>
            </div>

            {/* Lock indicator for locked islands */}
            {!isIslandUnlocked(island) && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <span className="text-xs">🔒</span>
              </div>
            )}

            {/* Current island indicator */}
            {isCurrentIsland(island) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  Current
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Decorative elements */}
      <div className="absolute bottom-4 left-4">
        <div className="text-amber-600 opacity-60">
          <Anchor className="h-8 w-8" />
        </div>
      </div>
      
      <div className="absolute top-8 right-8">
        <div className="text-yellow-400 opacity-80">
          <span className="text-2xl">🏰</span>
        </div>
      </div>

      <div className="absolute bottom-8 right-12">
        <div className="text-red-400 opacity-60">
          <span className="text-xl">⛵</span>
        </div>
      </div>

      {/* Compass rose */}
      <div className="absolute top-4 right-4">
        <div className="w-12 h-12 bg-amber-100 border-2 border-amber-600 rounded-full flex items-center justify-center">
          <div className="text-amber-800 font-bold text-xs">N</div>
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-amber-800"></div>
        </div>
      </div>
    </div>
  );
};

export default IslandMap;