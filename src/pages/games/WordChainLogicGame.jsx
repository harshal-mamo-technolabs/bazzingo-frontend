import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Link, Lightbulb, CheckCircle, XCircle, Target, Zap, ChevronUp, ChevronDown } from 'lucide-react';

const WordChainLogicGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [correctChains, setCorrectChains] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(0);

  // Game state
  const [availableWords, setAvailableWords] = useState([]);
  const [currentChain, setCurrentChain] = useState([]);
  const [targetChainLength, setTargetChainLength] = useState(3);
  const [connectionType, setConnectionType] = useState('letter');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [validConnections, setValidConnections] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showWordChainInstructions, setShowWordChainInstructions] = useState(true);

  // Word database organized by difficulty and connection type
  const wordDatabase = {
    easy: {
      letter: [
        'CAT', 'TAB', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT',
        'DOG', 'GOT', 'HOT', 'LOT', 'NOT', 'POT', 'ROT', 'COT',
        'SUN', 'RUN', 'FUN', 'GUN', 'BUN', 'NUN', 'PUN', 'TUN',
        'RED', 'BED', 'LED', 'FED', 'WED', 'TED', 'NED', 'ZED'
      ],
      meaning: [
        'HAPPY', 'JOY', 'SMILE', 'LAUGH', 'GLAD', 'CHEER',
        'SAD', 'CRY', 'TEAR', 'WEEP', 'BLUE', 'DOWN',
        'BIG', 'LARGE', 'HUGE', 'GIANT', 'VAST', 'WIDE',
        'SMALL', 'TINY', 'MINI', 'LITTLE', 'SHORT', 'THIN'
      ],
      category: [
        'APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'BERRY', 'PEACH',
        'DOG', 'CAT', 'BIRD', 'FISH', 'MOUSE', 'HORSE',
        'RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'WHITE',
        'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'
      ]
    },
    moderate: {
      letter: [
        'CHAIN', 'BRAIN', 'TRAIN', 'PLAIN', 'GRAIN', 'STAIN',
        'LIGHT', 'NIGHT', 'RIGHT', 'SIGHT', 'FIGHT', 'MIGHT',
        'SOUND', 'ROUND', 'FOUND', 'BOUND', 'MOUND', 'POUND',
        'THINK', 'DRINK', 'BLINK', 'CLINK', 'FLINK', 'SLINK'
      ],
      meaning: [
        'BRILLIANT', 'SMART', 'CLEVER', 'WISE', 'GENIUS', 'BRIGHT',
        'DIFFICULT', 'HARD', 'TOUGH', 'COMPLEX', 'TRICKY', 'ROUGH',
        'BEAUTIFUL', 'PRETTY', 'LOVELY', 'GORGEOUS', 'STUNNING', 'ELEGANT',
        'ANCIENT', 'OLD', 'VINTAGE', 'CLASSIC', 'HISTORIC', 'AGED'
      ],
      category: [
        'VIOLIN', 'PIANO', 'GUITAR', 'DRUMS', 'FLUTE', 'TRUMPET',
        'DOCTOR', 'TEACHER', 'LAWYER', 'ENGINEER', 'NURSE', 'CHEF',
        'MOUNTAIN', 'RIVER', 'OCEAN', 'FOREST', 'DESERT', 'VALLEY',
        'SCIENCE', 'MATH', 'HISTORY', 'ART', 'MUSIC', 'ENGLISH'
      ]
    },
    hard: {
      letter: [
        'PHILOSOPHY', 'PSYCHOLOGY', 'TECHNOLOGY', 'METHODOLOGY', 'TERMINOLOGY', 'CHRONOLOGY',
        'MAGNIFICENT', 'SIGNIFICANT', 'INDEPENDENT', 'TRANSPARENT', 'CONSISTENT', 'PERSISTENT',
        'EXTRAORDINARY', 'REVOLUTIONARY', 'CONTEMPORARY', 'COMPLEMENTARY', 'DOCUMENTARY', 'ELEMENTARY',
        'SOPHISTICATED', 'DIFFERENTIATE', 'AUTHENTICATE', 'COMMUNICATE', 'DEMONSTRATE', 'CONCENTRATE'
      ],
      meaning: [
        'PERSPICACIOUS', 'ASTUTE', 'SHREWD', 'DISCERNING', 'PERCEPTIVE', 'INSIGHTFUL',
        'EPHEMERAL', 'TRANSIENT', 'FLEETING', 'TEMPORARY', 'MOMENTARY', 'BRIEF',
        'UBIQUITOUS', 'OMNIPRESENT', 'PERVASIVE', 'WIDESPREAD', 'UNIVERSAL', 'COMMON',
        'SERENDIPITOUS', 'FORTUITOUS', 'AUSPICIOUS', 'PROVIDENTIAL', 'LUCKY', 'FAVORABLE'
      ],
      category: [
        'QUANTUM', 'PARTICLE', 'ELECTRON', 'NEUTRON', 'PROTON', 'ATOM',
        'RENAISSANCE', 'BAROQUE', 'CLASSICAL', 'ROMANTIC', 'MODERN', 'CONTEMPORARY',
        'DEMOCRACY', 'REPUBLIC', 'MONARCHY', 'OLIGARCHY', 'AUTOCRACY', 'THEOCRACY',
        'METAPHOR', 'SIMILE', 'ALLEGORY', 'SYMBOLISM', 'IRONY', 'PARADOX'
      ]
    }
  };

  // Connection validation rules
  const validateConnection = (word1, word2, type) => {
    switch (type) {
      case 'letter':
        // Check if words share at least 2 consecutive letters
        for (let i = 0; i < word1.length - 1; i++) {
          const substring = word1.substring(i, i + 2);
          if (word2.includes(substring)) return true;
        }
        // Or if last letter of word1 matches first letter of word2
        return word1[word1.length - 1] === word2[0];
        
      case 'meaning':
        // Predefined synonym/antonym relationships
        const meaningGroups = [
          ['HAPPY', 'JOY', 'SMILE', 'LAUGH', 'GLAD', 'CHEER'],
          ['SAD', 'CRY', 'TEAR', 'WEEP', 'BLUE', 'DOWN'],
          ['BIG', 'LARGE', 'HUGE', 'GIANT', 'VAST', 'WIDE'],
          ['SMALL', 'TINY', 'MINI', 'LITTLE', 'SHORT', 'THIN'],
          ['BRILLIANT', 'SMART', 'CLEVER', 'WISE', 'GENIUS', 'BRIGHT'],
          ['DIFFICULT', 'HARD', 'TOUGH', 'COMPLEX', 'TRICKY', 'ROUGH'],
          ['BEAUTIFUL', 'PRETTY', 'LOVELY', 'GORGEOUS', 'STUNNING', 'ELEGANT'],
          ['ANCIENT', 'OLD', 'VINTAGE', 'CLASSIC', 'HISTORIC', 'AGED'],
          ['PERSPICACIOUS', 'ASTUTE', 'SHREWD', 'DISCERNING', 'PERCEPTIVE', 'INSIGHTFUL'],
          ['EPHEMERAL', 'TRANSIENT', 'FLEETING', 'TEMPORARY', 'MOMENTARY', 'BRIEF'],
          ['UBIQUITOUS', 'OMNIPRESENT', 'PERVASIVE', 'WIDESPREAD', 'UNIVERSAL', 'COMMON'],
          ['SERENDIPITOUS', 'FORTUITOUS', 'AUSPICIOUS', 'PROVIDENTIAL', 'LUCKY', 'FAVORABLE']
        ];
        return meaningGroups.some(group => group.includes(word1) && group.includes(word2));
        
      case 'category':
        // Predefined category relationships
        const categoryGroups = [
          ['APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'BERRY', 'PEACH'], // Fruits
          ['DOG', 'CAT', 'BIRD', 'FISH', 'MOUSE', 'HORSE'], // Animals
          ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'WHITE'], // Colors
          ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'], // Numbers
          ['VIOLIN', 'PIANO', 'GUITAR', 'DRUMS', 'FLUTE', 'TRUMPET'], // Instruments
          ['DOCTOR', 'TEACHER', 'LAWYER', 'ENGINEER', 'NURSE', 'CHEF'], // Professions
          ['MOUNTAIN', 'RIVER', 'OCEAN', 'FOREST', 'DESERT', 'VALLEY'], // Geography
          ['SCIENCE', 'MATH', 'HISTORY', 'ART', 'MUSIC', 'ENGLISH'], // Subjects
          ['QUANTUM', 'PARTICLE', 'ELECTRON', 'NEUTRON', 'PROTON', 'ATOM'], // Physics
          ['RENAISSANCE', 'BAROQUE', 'CLASSICAL', 'ROMANTIC', 'MODERN', 'CONTEMPORARY'], // Art Periods
          ['DEMOCRACY', 'REPUBLIC', 'MONARCHY', 'OLIGARCHY', 'AUTOCRACY', 'THEOCRACY'], // Government
          ['METAPHOR', 'SIMILE', 'ALLEGORY', 'SYMBOLISM', 'IRONY', 'PARADOX'] // Literary Devices
        ];
        return categoryGroups.some(group => group.includes(word1) && group.includes(word2));
        
      default:
        return false;
    }
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 120, lives: 5, hints: 3, chainLength: 3, connectionTypes: ['letter'] },
    Moderate: { timeLimit: 100, lives: 4, hints: 2, chainLength: 4, connectionTypes: ['letter', 'meaning', 'category'] },
    Hard: { timeLimit: 80, lives: 3, hints: 1, chainLength: 5, connectionTypes: ['letter', 'meaning', 'category'] }
  };

  // Generate new round
  const generateNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const difficultyLevel = difficulty.toLowerCase();
    const availableTypes = settings.connectionTypes;
    const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    setConnectionType(selectedType);
    setTargetChainLength(settings.chainLength);
    
    // Get words for the selected type and difficulty
    const wordsForType = wordDatabase[difficultyLevel][selectedType];
    
    // Select random words ensuring some can form valid chains
    const selectedWords = [];
    const numWords = Math.min(12, wordsForType.length);
    
    // Shuffle and select words
    const shuffledWords = [...wordsForType].sort(() => Math.random() - 0.5);
    selectedWords.push(...shuffledWords.slice(0, numWords));
    
    setAvailableWords(selectedWords);
    setCurrentChain([]);
    setSelectedWord(null);
    setShowFeedback(false);
    setRoundStartTime(Date.now());
    
    // Calculate valid connections for hints
    const connections = [];
    for (let i = 0; i < selectedWords.length; i++) {
      for (let j = i + 1; j < selectedWords.length; j++) {
        if (validateConnection(selectedWords[i], selectedWords[j], selectedType)) {
          connections.push([selectedWords[i], selectedWords[j]]);
        }
      }
    }
    setValidConnections(connections);
  }, [difficulty]);

  // Calculate score
  const calculateScore = useCallback(() => {
    if (totalAttempts === 0) return 0;
    
    const settings = difficultySettings[difficulty];
    const successRate = correctChains / totalAttempts;
    const avgResponseTime = totalResponseTime / totalAttempts / 1000;
    
    // Base score from success rate (0-80 points)
    let baseScore = successRate * 80;
    
    // Time bonus (max 25 points)
    const idealTime = difficulty === 'Easy' ? 15 : difficulty === 'Moderate' ? 20 : 25;
    const timeBonus = Math.max(0, Math.min(25, (idealTime - avgResponseTime) * 2));
    
    // Streak bonus (max 30 points)
    const streakBonus = Math.min(maxStreak * 3, 30);
    
    // Level progression bonus (max 20 points)
    const levelBonus = Math.min(currentLevel * 1.2, 20);
    
    // Lives bonus (max 15 points)
    const livesBonus = (lives / settings.lives) * 15;
    
    // Hints penalty (subtract up to 15 points)
    const hintsPenalty = (hintsUsed / settings.hints) * 15;
    
    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Moderate' ? 1.0 : 1.2;
    
    // Time remaining bonus (max 15 points)
    const timeRemainingBonus = Math.min(15, (timeRemaining / settings.timeLimit) * 15);
    
    let finalScore = (baseScore + timeBonus + streakBonus + levelBonus + livesBonus + timeRemainingBonus - hintsPenalty) * difficultyMultiplier;
    
    // Apply final modifier to make 200 very challenging
    finalScore = finalScore * 0.82;
    
    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [correctChains, totalAttempts, totalResponseTime, currentLevel, lives, hintsUsed, maxStreak, timeRemaining, difficulty]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle word selection
  const handleWordSelect = (word) => {
    if (gameState !== 'playing' || showFeedback) return;
    
    if (selectedWord === word) {
      setSelectedWord(null);
      return;
    }
    
    if (currentChain.length === 0) {
      // First word in chain
      setCurrentChain([word]);
      setSelectedWord(null);
      setAvailableWords(prev => prev.filter(w => w !== word));
    } else if (selectedWord) {
      // Try to connect selectedWord to the chain
      const lastWordInChain = currentChain[currentChain.length - 1];
      if (validateConnection(lastWordInChain, selectedWord, connectionType)) {
        const newChain = [...currentChain, selectedWord];
        setCurrentChain(newChain);
        setAvailableWords(prev => prev.filter(w => w !== selectedWord));
        setSelectedWord(null);
        
        // Check if chain is complete
        if (newChain.length >= targetChainLength) {
          handleChainComplete(newChain);
        }
      } else {
        // Invalid connection
        handleInvalidConnection();
      }
    } else {
      setSelectedWord(word);
    }
  };

  // Handle chain completion
  const handleChainComplete = (chain) => {
    const responseTime = Date.now() - roundStartTime;
    setShowFeedback(true);
    setFeedbackType('correct');
    setFeedbackMessage(`Excellent! You created a ${chain.length}-word chain!`);
    setTotalAttempts(prev => prev + 1);
    setCorrectChains(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);
    setStreak(prev => {
      const newStreak = prev + 1;
      setMaxStreak(current => Math.max(current, newStreak));
      return newStreak;
    });
    setCurrentLevel(prev => prev + 1);
    
    setTimeout(() => {
      generateNewRound();
    }, 2000);
  };

  // Handle invalid connection
  const handleInvalidConnection = () => {
    setShowFeedback(true);
    setFeedbackType('incorrect');
    setFeedbackMessage(`Those words don't connect via ${connectionType}!`);
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + (Date.now() - roundStartTime));
    setStreak(0);
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameState('finished');
        setShowCompletionModal(true);
      }
      return newLives;
    });
    setSelectedWord(null);
    
    setTimeout(() => {
      setShowFeedback(false);
    }, 1500);
  };

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || validConnections.length === 0) return;
    
    setHintsUsed(prev => prev + 1);
    
    // Show a valid connection
    const randomConnection = validConnections[Math.floor(Math.random() * validConnections.length)];
    const [word1, word2] = randomConnection;
    
    // Highlight the words briefly
    const elements = document.querySelectorAll(`[data-word="${word1}"], [data-word="${word2}"]`);
    elements.forEach(el => {
      if (el) {
        el.style.boxShadow = '0 0 20px #FFD700';
        el.style.transform = 'scale(1.05)';
      }
    });
    
    setTimeout(() => {
      elements.forEach(el => {
        if (el) {
          el.style.boxShadow = '';
          el.style.transform = '';
        }
      });
    }, 3000);
  };

  // Reset chain
  const resetChain = () => {
    if (gameState !== 'playing') return;
    
    // Return chain words to available words
    setAvailableWords(prev => [...prev, ...currentChain].sort());
    setCurrentChain([]);
    setSelectedWord(null);
  };

  // Timer countdown
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

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentLevel(1);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setCorrectChains(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    generateNewRound();
  };

  const handleReset = () => {
    initializeGame();
    setAvailableWords([]);
    setCurrentChain([]);
    setSelectedWord(null);
    setShowFeedback(false);
    setValidConnections([]);
  };

  const handleGameComplete = (payload) => {
  };

  const customStats = {
    currentLevel,
    streak: maxStreak,
    lives,
    hintsUsed,
    correctChains,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    connectionType,
    chainLength: targetChainLength
  };

  const getConnectionTypeDescription = (type) => {
    switch (type) {
      case 'letter': return 'Connect words that share letters or letter patterns';
      case 'meaning': return 'Connect words with similar or related meanings';
      case 'category': return 'Connect words that belong to the same category';
      default: return 'Connect related words';
    }
  };

  return (
    <div>
      {gameState === 'ready' && <Header unreadCount={3} />}
      
      <GameFramework
        gameTitle="Word Chain Logic"
        gameShortDescription="Create word chains by connecting related words. Challenge your vocabulary and associative thinking!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
  <div className="bg-[#E8E8E8] rounded-lg p-6">
    {/* Header with toggle icon */}
    <div
      className="flex items-center justify-between mb-4 cursor-pointer"
      onClick={() => setShowWordChainInstructions(!showWordChainInstructions)}
    >
      <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
        How to Play Word Chain Logic
      </h3>
      <span className="text-blue-900 text-xl">
       {showWordChainInstructions
  ? <ChevronUp className="h-5 w-5 text-blue-900" />
  : <ChevronDown className="h-5 w-5 text-blue-900" />}
      </span>
    </div>

    {/* Toggle content */}
    {showWordChainInstructions && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            🎯 Objective
          </h4>
          <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            Create logical word chains by connecting words through shared letters, meanings, or categories.
          </p>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            🔗 Connection Types
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• <strong>Letter:</strong> Shared letter patterns</li>
            <li>• <strong>Meaning:</strong> Synonyms/related words</li>
            <li>• <strong>Category:</strong> Same group/theme</li>
          </ul>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            📊 Scoring
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• Chain completion bonuses</li>
            <li>• Speed and accuracy rewards</li>
            <li>• Streak multipliers</li>
          </ul>
        </div>

        <div className='bg-white p-3 rounded-lg'>
          <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            💡 Strategy
          </h4>
          <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <li>• Plan your chain path</li>
            <li>• Use hints for tough connections</li>
            <li>• Think about word relationships</li>
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
        {/* Game Content */}
        <div className="flex flex-col items-center">
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {gameState === 'playing' && (
              <>
                <button
                  onClick={useHint}
                  disabled={hintsUsed >= maxHints}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    hintsUsed >= maxHints
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <Lightbulb className="h-4 w-4" />
                  Hint ({maxHints - hintsUsed})
                </button>
                
                <button
                  onClick={resetChain}
                  className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                >
                  <Target className="h-4 w-4" />
                  Reset Chain
                </button>
              </>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
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
                {streak}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Success Rate
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalAttempts > 0 ? Math.round((correctChains / totalAttempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Connection Type Info */}
          {connectionType && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Link className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800 capitalize" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {connectionType} Connections
                  </span>
                </div>
                <p className="text-blue-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {getConnectionTypeDescription(connectionType)}
                </p>
                <p className="text-blue-600 text-xs mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Target chain length: {targetChainLength} words
                </p>
              </div>
            </div>
          )}

          {/* Current Chain Display */}
          {currentChain.length > 0 && (
            <div className="w-full max-w-4xl mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Current Chain ({currentChain.length}/{targetChainLength})
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-2">
                {currentChain.map((word, index) => (
                  <React.Fragment key={index}>
                    <div className="bg-green-100 border-2 border-green-500 rounded-lg px-4 py-2">
                      <span className="font-semibold text-green-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {word}
                      </span>
                    </div>
                    {index < currentChain.length - 1 && (
                      <Zap className="h-4 w-4 text-green-600" />
                    )}
                  </React.Fragment>
                ))}
                {currentChain.length < targetChainLength && (
                  <>
                    <Zap className="h-4 w-4 text-gray-400" />
                    <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg px-4 py-2">
                      <span className="text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Next word?
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Available Words */}
          {availableWords.length > 0 && (
            <div className="w-full max-w-4xl mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Available Words
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableWords.map((word) => (
                  <button
                    key={word}
                    data-word={word}
                    onClick={() => handleWordSelect(word)}
                    disabled={showFeedback}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      selectedWord === word
                        ? 'border-[#FF6B3E] bg-orange-50 transform scale-105'
                        : 'border-gray-300 bg-white hover:border-[#FF6B3E] hover:bg-orange-50'
                    } ${showFeedback ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {word}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`w-full max-w-2xl text-center p-4 rounded-lg ${
              feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Chain Complete!' : 'Invalid Connection!'}
                </div>
              </div>
              <div className="text-sm" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {feedbackMessage}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              {currentChain.length === 0 
                ? 'Click a word to start your chain, then select words that connect logically.'
                : selectedWord 
                  ? `Click another word to try connecting "${selectedWord}" to your chain.`
                  : 'Select a word to add to your chain or reset to start over.'
              }
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {targetChainLength}-word chains | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:{String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints
            </div>
          </div>
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

export default WordChainLogicGame;