import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDailySuggestions } from '../../services/gameService'
import BazzingoLoader from '../Loading/BazzingoLoader'
import TranslatedText from '../TranslatedText.jsx'

const GameCompletionModal = ({ isOpen, onClose, score = 85 }) => {
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [allGamesPlayed, setAllGamesPlayed] = useState(false)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      // Reset states when modal opens
      setScoreSubmitted(false);
      setAllGamesPlayed(false);
      hasFetchedRef.current = false;
      
      // Listen for score submission completion event
      const handleScoreSubmitted = (event) => {
        console.log('Score submission completed, fetching daily suggestions', event.detail);
        setScoreSubmitted(true);
        if (!hasFetchedRef.current) {
          hasFetchedRef.current = true;
          fetchDailySuggestions();
        }
      };
      
      // Listen for the custom event
      window.addEventListener('gameScoreSubmitted', handleScoreSubmitted);
      
      // Fallback: if no event is received within 3 seconds, fetch anyway
      const fallbackTimer = setTimeout(() => {
        console.log('Fallback: fetching daily suggestions after timeout');
        setScoreSubmitted(true);
        if (!hasFetchedRef.current) {
          hasFetchedRef.current = true;
          fetchDailySuggestions();
        }
      }, 3000);
      
      return () => {
        window.removeEventListener('gameScoreSubmitted', handleScoreSubmitted);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isOpen]) // Removed scoreSubmitted from dependencies to prevent loops

  const fetchDailySuggestions = async () => {
    try {
      console.log('Fetching daily suggestions...');
      setLoading(true)
      const response = await getDailySuggestions()
      console.log('Daily suggestions response:', response);
      if (response.status === 'success' && response.data.suggestion) {
        const allGames = response.data.suggestion.games;
        // Filter only unplayed games
        const unplayedGames = allGames.filter(game => !game.isPlayed)
        console.log('Total games:', allGames.length, 'Unplayed games:', unplayedGames.length);
        
        if (unplayedGames.length === 0 && allGames.length > 0) {
          // All games have been played
          console.log('All daily games completed! Showing completion message.');
          setAllGamesPlayed(true);
          setSuggestions([]);
        } else {
          console.log('Found unplayed games, showing suggestions.');
          setAllGamesPlayed(false);
          setSuggestions(unplayedGames)
        }
      }
    } catch (error) {
      console.error('Error fetching daily suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const handlePlayGame = (game) => {
    onClose()
    navigate(game.gameId.url, {
      state: {
        gameId: game.gameId._id,
        gameName: game.gameId.name,
        fromDailyGame: true,
        difficulty: game.difficulty
      }
    })
  }

  const handleClose = () => {
    onClose()
    if (allGamesPlayed) {
      navigate('/games')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />

      {/* Modal - Fixed sizing to maintain original UI */}
      <div className="
        relative bg-white rounded-lg shadow-xl
        w-[90vw]       /* xs/mobile */
        md:w-[70vw]    /* tablets */
        lg:w-[28vw]    /* desktop */
        max-h-[80vh]   /* consistent max height */
        overflow-y-auto
      ">
        {/* Sunny effect + badge + pill */}
        <div className="relative w-full h-32">
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
        </div>

        <div className="w-full text-center mt-2">
          <span className="inline-block bg-[#FF6947] text-white text-sm font-medium px-8 py-2 rounded-full">
            <TranslatedText text="Daily Game Complete" />
          </span>
        </div>

        <div className="w-full text-center mt-2">
          {score === 0 ? (
            <span className="text-center text-3xl font-bold italic text-[#208900]">
              <TranslatedText text="Just the Beginning!" />
            </span>
          ) : (
            <span className="text-center text-3xl font-bold italic text-[#208900]">
              <TranslatedText text="Nice Job!" />
            </span>
          )}
        </div>

        <div className="mt-4 mx-5">
          <div className="bg-[#FFF4F2] border border-[#FF6947] rounded-lg p-4">
            <p className="text-center text-lg font-semibold text-gray-800">
              <TranslatedText text="Your Score" />
            </p>
            <p className="text-center text-5xl font-bold text-[#FF6947] mt-2">
              {score}
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-200 mx-5 mt-6 mb-4" />

        <div className="px-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <TranslatedText text="Continue Your Daily Streak" />
          </h3>
        </div>

        {/* Game Cards - Limited height with scroll */}
        <div className="px-5 space-y-3 mb-6 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="py-8">
              <BazzingoLoader message={<TranslatedText text="Loading daily suggestions..." />} compact={true} />
            </div>
          ) : allGamesPlayed ? (
            <div className="py-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2"><TranslatedText text="Daily Streak Complete!" /></h3>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div key={suggestion.gameId._id} className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <img
                      src={suggestion.gameId.thumbnail}
                      alt={suggestion.gameId.name}
                      className="w-8 h-8"
                      onError={(e) => {
                        e.target.src = '/games-icon/default-game-icon.png' // fallback image
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-800"><TranslatedText text={suggestion.gameId.name}/></h4>
                    <span className="text-xs text-gray-600 capitalize"><TranslatedText text={suggestion.difficulty}/></span>
                  </div>
                </div>
                  <button
                  onClick={() => handlePlayGame(suggestion)}
                  className="bg-[#FF6947] text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-[#e55a3a] transition-colors"
                >
                  <TranslatedText text="Play" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-8">
              <BazzingoLoader message={<TranslatedText text="Loading daily suggestions..." />} compact={true} />
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default GameCompletionModal
