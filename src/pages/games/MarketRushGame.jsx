import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import {
  difficultySettings,
  stallTypes,
  generateCustomers,
  calculateCustomerScore,
  calculateBonusPoints,
  calculateTotalScore
} from '../../utils/games/MarketRush';
import {
  ShoppingCart,
  Clock,
  Lightbulb,
  CheckCircle,
  XCircle,
  Star,
  Users,
  Package,
  Timer,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const MarketRushGame = () => {
  // Game state
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [selectedStall, setSelectedStall] = useState('fruits');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(100);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);

  // Game progress
  const [customers, setCustomers] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(0);
  const [servedCustomers, setServedCustomers] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0); // Keep for UI but always 0
  const [maxStreak, setMaxStreak] = useState(0); // Keep for UI but always 0
  const [totalCustomerScore, setTotalCustomerScore] = useState(0);

  // Current customer state
  const [orderVisible, setOrderVisible] = useState(true);
  const [orderTimer, setOrderTimer] = useState(0);
  const [playerOrder, setPlayerOrder] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  // UI state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const newCustomers = generateCustomers(selectedStall, difficulty, 1);

    // Reset everything to prevent random scores
    setCustomers(newCustomers);
    setTimeRemaining(settings.timeLimit);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setCurrentCustomer(0);
    setServedCustomers(0);
    setPerfectStreak(0);
    setMaxStreak(0);
    setTotalCustomerScore(0);
    setScore(0); // Explicitly reset score to 0
    setPlayerOrder([]);
    setOrderVisible(true);
    setOrderTimer(settings.orderDisplayTime);
    setShowFeedback(false);
    setShowHint(false);
    setHintUsed(false);
  }, [difficulty, selectedStall]);

  // Timer management
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Order visibility timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && orderVisible && orderTimer > 0) {
      interval = setInterval(() => {
        setOrderTimer(prev => {
          if (prev <= 1) {
            setOrderVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, orderVisible, orderTimer]);

  // Handle product selection
  const handleProductSelect = (product) => {
    if (showFeedback || !customers[currentCustomer]) return;

    const existingItemIndex = playerOrder.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
      // Increase quantity
      const newOrder = [...playerOrder];
      newOrder[existingItemIndex] = {
        ...newOrder[existingItemIndex],
        quantity: newOrder[existingItemIndex].quantity + 1
      };
      setPlayerOrder(newOrder);
    } else {
      // Add new item
      setPlayerOrder(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  // Remove item from order
  const removeFromOrder = (productId) => {
    setPlayerOrder(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === productId);
      if (existingItemIndex >= 0) {
        const newOrder = [...prev];
        if (newOrder[existingItemIndex].quantity > 1) {
          newOrder[existingItemIndex] = {
            ...newOrder[existingItemIndex],
            quantity: newOrder[existingItemIndex].quantity - 1
          };
        } else {
          newOrder.splice(existingItemIndex, 1);
        }
        return newOrder;
      }
      return prev;
    });
  };

  // Serve customer
  const serveCustomer = () => {
    if (showFeedback || !customers[currentCustomer]) return;

    const customer = customers[currentCustomer];
    const scoreResult = calculateCustomerScore(customer, playerOrder);

    setShowFeedback(true);
    setFeedbackData(scoreResult);
    setTotalCustomerScore(prev => prev + scoreResult.points);

    // Keep streaks at 0 for new scoring system
    setPerfectStreak(0);
    setMaxStreak(0);

    // Update lives for wrong orders - lives are separate from points now
    if (scoreResult.type === 'wrong_order' || scoreResult.type === 'fake_customer_served' || scoreResult.type === 'no_service') {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            setGameState('finished');
            setShowCompletionModal(true);
          }, 2000);
        }
        return Math.max(0, newLives);
      });
    }

    setTimeout(() => {
      if (currentCustomer + 1 >= customers.length) {
        // Game completed
        const bonusPoints = calculateBonusPoints(); // Always returns 0 now
        const finalScore = calculateTotalScore(totalCustomerScore + scoreResult.points, bonusPoints);
        setScore(finalScore);
        setGameState('finished');
        setShowCompletionModal(true);
      } else {
        // Next customer
        setCurrentCustomer(prev => prev + 1);
        setServedCustomers(prev => prev + 1);
        setPlayerOrder([]);
        setOrderVisible(true);
        setOrderTimer(difficultySettings[difficulty].orderDisplayTime);
        setShowFeedback(false);
        setHintUsed(false);
      }
    }, 3000);
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || orderVisible) return;

    setHintsUsed(prev => prev + 1);
    setHintUsed(true);
    setOrderVisible(true);
    setShowHint(true);

    setTimeout(() => {
      setOrderVisible(false);
      setShowHint(false);
    }, 3000);
  };

  // Update score when totalCustomerScore changes
  useEffect(() => {
    const bonusPoints = calculateBonusPoints(); // Always returns 0 now
    const currentScore = calculateTotalScore(totalCustomerScore, bonusPoints);
    setScore(currentScore);
  }, [totalCustomerScore]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    setGameState('ready');
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Market Rush Game completed:', payload);
  };

  const customStats = {
    currentCustomer: currentCustomer + 1,
    totalCustomers: customers.length,
    streak: maxStreak, // Always 0 now but keeping for UI
    lives,
    hintsUsed,
    servedCustomers,
    stallType: selectedStall
  };

  const currentCustomerData = customers[currentCustomer];

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Market Rush: Village Bazaar"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Market Rush: Village Bazaar
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Toggle Content */}
              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🏪 Your Stall
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Choose your market stall type and serve customers authentic Croatian products from your village bazaar.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      👥 Memory Challenge
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Customer orders appear for 4-6 seconds</li>
                      <li>• Remember the items and quantities</li>
                      <li>• Serve in the correct order</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 New Scoring System
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 25 pts per correct order</li>
                      <li>• Moderate: 40 pts per correct order</li>
                      <li>• Hard: 50 pts per correct order</li>
                      <li>• Wrong orders lose 1 life only</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🎯 Difficulty Levels
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 customers, 6s display time</li>
                      <li>• Moderate: 5 customers, 5s display time</li>
                      <li>• Hard: 4 customers, fake customers, 4s display time</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Logic"
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        <div className="flex flex-col items-center">
          {/* Stall Selection (only in ready state) */}
          {gameState === 'ready' && (
            <div className="w-full max-w-4xl mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Choose Your Market Stall
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.values(stallTypes).map(stall => (
                  <button
                    key={stall.id}
                    onClick={() => setSelectedStall(stall.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedStall === stall.id
                        ? 'border-[#FF6B3E] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div className="text-4xl mb-2">{stall.icon}</div>
                    <div className="font-semibold text-sm">{stall.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game Controls */}
          {gameState === 'playing' && (
            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
              <button
                onClick={useHint}
                disabled={hintsUsed >= maxHints || orderVisible}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  hintsUsed >= maxHints || orderVisible
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
              >
                <Lightbulb className="h-4 w-4" />
                Show Order ({maxHints - hintsUsed})
              </button>
            </div>
          )}

          {/* Game Stats */}
          {gameState === 'playing' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 w-full max-w-2xl">
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Customer
                </div>
                <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentCustomer + 1}/{customers.length}
                </div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Lives
                </div>
                <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {'❤️'.repeat(lives)}
                </div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Streak
                </div>
                <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {perfectStreak}
                </div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Order Timer
                </div>
                <div className={`text-lg font-semibold ${orderVisible ? 'text-blue-600' : 'text-gray-400'}`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {orderVisible ? orderTimer : '--'}
                </div>
              </div>
            </div>
          )}

          {/* Current Customer */}
          {gameState === 'playing' && currentCustomerData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-6xl">{currentCustomerData.emoji}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {currentCustomerData.name}
                    </h3>
                    {currentCustomerData.isFake && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                        Suspicious Customer
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Order */}
                {orderVisible && !currentCustomerData.isFake && (
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <ShoppingCart className="h-5 w-5 text-blue-800" />
                      <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Customer wants:
                      </span>
                      {showHint && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          HINT USED
                        </span>
                      )}
                    </div>
                    <div className="flex justify-center items-center gap-4 flex-wrap">
                      {currentCustomerData.order.map((item, index) => (
                        <div key={index} className="flex items-center gap-1 bg-gray-50 rounded-lg p-2">
                          <div className="text-2xl">{item.icon}</div>
                          <div className="text-sm font-medium">
                            {item.quantity > 1 && (
                              <span className="bg-[#FF6B3E] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!orderVisible && !currentCustomerData.isFake && (
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Timer className="h-5 w-5" />
                      <span style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Order is now hidden - remember what they wanted!
                      </span>
                    </div>
                  </div>
                )}

                {currentCustomerData.isFake && (
                  <div className="bg-red-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-red-800">
                      <span style={{ fontFamily: 'Roboto, sans-serif' }}>
                        This customer seems suspicious... Don't serve them!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Selection */}
          {gameState === 'playing' && !showFeedback && (
            <div className="w-full max-w-6xl mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Available Products - {stallTypes[selectedStall].name}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {stallTypes[selectedStall].products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-[#FF6B3E] hover:bg-orange-50 transition-all"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <div className="text-3xl mb-1">{product.icon}</div>
                    <div className="text-xs font-medium">{product.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Player's Current Order */}
          {gameState === 'playing' && !showFeedback && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Customer's Basket
                </h4>
                {playerOrder.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Empty basket - tap products above to add them
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-3 flex-wrap mb-4">
                    {playerOrder.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                        <div className="text-2xl">{item.icon}</div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">x{item.quantity}</span>
                          <button
                            onClick={() => removeFromOrder(item.id)}
                            className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            −
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setPlayerOrder([])}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                  >
                    Clear Basket
                  </button>
                  <button
                    onClick={serveCustomer}
                    className="bg-[#FF6B3E] text-white px-6 py-2 rounded-lg hover:bg-[#e55a35] transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Serve Customer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentCustomerData && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg ${
              feedbackData.type === 'correct_order' || feedbackData.type === 'fake_customer_ignored' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackData.type === 'correct_order' || feedbackData.type === 'fake_customer_ignored' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackData.type === 'correct_order' || feedbackData.type === 'fake_customer_ignored' ? 'Great Service!' : 'Wrong Order!'}
                </div>
              </div>
              <div className="text-sm mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackData.type === 'correct_order' && 'Perfect! You served the exact order the customer wanted.'}
                {feedbackData.type === 'wrong_order' && 'Wrong items or quantities. You lost a life but can try again!'}
                {feedbackData.type === 'fake_customer_ignored' && 'Good job! You correctly ignored the suspicious customer.'}
                {feedbackData.type === 'fake_customer_served' && 'Oops! That was a fake customer - you lost a life.'}
                {feedbackData.type === 'no_service' && 'You didn\'t serve anything - you lost a life.'}
              </div>
              <div className={`font-medium mb-2 ${feedbackData.points > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {feedbackData.points > 0 ? `+${feedbackData.points} points` : 'No points earned'}
              </div>
              {currentCustomer + 1 < customers.length ? (
                <p className="text-gray-700 font-medium">
                  Next customer coming up...
                </p>
              ) : (
                <p className="text-gray-700 font-medium">
                  Market day complete!
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          {gameState === 'playing' && (
            <div className="text-center max-w-2xl mt-6">
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                Remember customer orders before they disappear! Serve exactly what they want to earn points.
                Wrong orders cost a life but no points are deducted.
              </p>
              <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {difficulty} Mode: {difficultySettings[difficulty].customerCount} customers | 
                {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
                {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
                {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints
              </div>
            </div>
          )}
        </div>
      </GameFramework>
      
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
      />
    </div>
  );
};

export default MarketRushGame;