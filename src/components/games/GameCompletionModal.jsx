import React from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const GameCompletionModal = ({ isOpen, onClose, score = 85 }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handlePlayGame = (gamePath) => {
    onClose()
    navigate(gamePath)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="
        relative bg-white rounded-lg shadow-xl
  w-[90vw]       /* xs/mobile */
  md:w-[70vw]    /* tablets */
  lg:w-[28vw]    /* desktop */
  md:max-h-[55vh]/* tablet cap */
  lg:max-h-[80vh]/* desktop cap */
  h-auto
  overflow-y-auto
      ">
        {/* Sunny effect + badge + pill */}
        <div className="relative w-full h-30 md:h-35 lg:h-35">
          {/* Rays background */}
          <div
            className="absolute inset-0 rounded-t-lg bg-cover bg-center"
            style={{ backgroundImage: 'url(/sunny-effect.png)' }}
          />

          {/* Gold badge */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
            {score === 0 ? (
              <img
                src="/smile.png"
                alt="Smile badge"
                className="object-contain w-16 h-16 md:w-20 md:h-20 lg:w-16 lg:h-16"
              />
            ) : (
              <img
                src="/conquer.png"
                alt="Conquer badge"
                className="object-contain w-16 h-16 md:w-20 md:h-20 lg:w-16 lg:h-16"
              />
            )}
          </div>

          {/* “Assessment Complete” pill */}

        </div>

        <div className="w-full text-center lg:mt-2 md:mt-5">
          <span className="inline-block bg-[#FF6947] text-white text-sm font-medium px-8 py-2 lg:py-1 rounded-full">
            Daily Game Complete
          </span>
        </div>

        <div className="w-full text-center mt-2">
    {score === 0 ? (
    <span className="text-center text-3xl font-bold italic text-[#208900]">
     Just the Begining!
    </span>
  ) : (
    <span className="text-center text-3xl font-bold italic text-[#208900]">
      Nice Job!
    </span>
  )}
</div>


        <div className="mt-4 mx-5">
          <div className="bg-[#FFF4F2] border border-[#FF6947] rounded-lg p-4">
            <p className="text-center text-lg font-semibold text-gray-800">
              Your Score
            </p>
            <p className="text-center text-5xl font-bold text-[#FF6947] mt-2">
              {score}
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-200 mx-5 mt-6 mb-4" />

        <div className="px-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Continue Your Daily Streak
          </h3>
        </div>

        {/* Game Cards */}
        <div className="px-5 space-y-3 mb-6">
          {/* Word Chain logic Game */}
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <img
                  src="/games-icon/word-chain-logic.png"
                  alt="word chain logic game"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-800">Word Chain Logic</h4>
              </div>
            </div>
            <button
              onClick={() => handlePlayGame('/games/word-chain-logic-game')}
              className="bg-[#FF6947] text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-[#e55a3a] transition-colors"
            >
              Play
            </button>
          </div>

          {/* Resource Allocation Game */}
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <img
                  src="/games-icon/resource-allocation-strategy.png"
                  alt="Resource Allocation Game"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-800">Resource Allocation Game</h4>
              </div>
            </div>
            <button
              onClick={() => handlePlayGame('/games/resource-allocation-strategy-game')}
              className="bg-[#FF6947] text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-[#e55a3a] transition-colors"
            >
              Play
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default GameCompletionModal
