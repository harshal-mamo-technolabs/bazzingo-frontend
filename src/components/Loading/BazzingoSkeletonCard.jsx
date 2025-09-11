import React from 'react';

const BazzingoSkeletonCard = ({ lines = 3, height = 140 }) => {
  return (
    <div className="bg-[#EEEEEE] rounded-lg p-4 shadow-sm border border-gray-200" style={{ height }}>
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-28 bg-gray-300 rounded animate-pulse" />
        <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-300 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export default BazzingoSkeletonCard;


