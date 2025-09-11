import React from 'react';
import BrainLogo from "../../../public/vibrant-brain-icon.png"; // adjust path if needed

const BazzingoLoader = ({ message = 'Loading...', compact = false }) => {
  return (
    <div className={`w-full ${compact ? 'py-4' : 'py-10'} flex flex-col items-center justify-center`}>
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className="w-14 h-14 rounded-full border-4 border-[#ffd8cc] border-t-[#FF6B3D] animate-spin"
          style={{ animationDuration: '1.2s' }}
        />
        {/* Inner image instead of dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={BrainLogo}
            alt="Brain Logo"
            className="w-12 h-12 animate-pulse rounded-full" // small size + pulse animation
          />
        </div>
      </div>
      <div className="mt-3 text-[13px] text-gray-700 font-medium">{message}</div>
    </div>
  );
};

export default BazzingoLoader;
