import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Lightbulb, Shuffle, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react';

const AnagramSolverGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');

  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const [timeRemaining, setTimeRemaining] = useState(300);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameDuration, setGameDuration] = useState(0);

  // Game state
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState([]);
  const [possibleWords, setPossibleWords] = useState([]);

  // New scoring utility
  const [perWordPoints, setPerWordPoints] = useState(0);

  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Optional stats (not used in scoring now)
  const [longestWordFound, setLongestWordFound] = useState('');
  const [totalWordsFound, setTotalWordsFound] = useState(0);
  const [perfectWords, setPerfectWords] = useState(0);

  const feedbackTimeoutRef = useRef(null);


  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 300, hints: 3, letterCount: 6, description: 'Short words with common letters' },
    Medium: { timeLimit: 240, hints: 2, letterCount: 7, description: 'Mixed difficulty with longer possibilities' },
    Hard: { timeLimit: 180, hints: 1, letterCount: 8, description: 'Complex combinations and rare words' }
  };

  // Letter sets for different difficulties
  const letterSets = {
    Easy: ['RATES', 'HEART', 'EARTH', 'THROW', 'WORTH', 'SIGHT', 'LIGHT', 'MIGHT', 'RIGHT', 'FIGHT', 'WATER', 'STEAM', 'TEAMS', 'BEAST', 'FEAST', 'LEAST', 'SMART', 'DREAM', 'CREAM', 'BREAD'],
    Medium: ['STRANGE', 'PARENTS', 'PARTNER', 'MASTER', 'STREAM', 'DREAMS', 'BREATH', 'THREAD', 'SPREAD', 'BRIDGE', 'GARDEN', 'DANGER', 'FINGER', 'SINGER', 'WINTER', 'SPRING', 'STRONG', 'COURSE', 'SOURCE', 'FOREST'],
    Hard: ['CREATION', 'REACTION', 'CHILDREN', 'STRENGTH', 'TRIANGLE', 'STRUGGLE', 'PAINTING', 'TEACHING', 'LEARNING', 'THINKING', 'MONSTER', 'KITCHEN', 'CHICKEN', 'MACHINE', 'COMBINE', 'IMAGINE', 'KINGDOM', 'FREEDOM', 'CHAPTER', 'WEATHER']
  };

  // Scramble letters
  const scrambleLetters = (word) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
  };

  // Initialize new game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const availableSets = letterSets[difficulty];
    const selectedWord = availableSets[Math.floor(Math.random() * availableSets.length)];
    const letters = scrambleLetters(selectedWord);

    const possible = getValidWords(letters.join(''));
    setPossibleWords(possible);
    setPerWordPoints(possible.length > 0 ? 200 / possible.length : 0);

    setScrambledLetters(letters);
    setCurrentWord('');
    setFoundWords([]);
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setShowFeedback(false);
    setLongestWordFound('');
    setTotalWordsFound(0);
    setPerfectWords(0);
  }, [difficulty]);

  // Handle letter click
  const handleLetterClick = (index) => {
    if (gameState !== 'playing') return;
    const letter = scrambledLetters[index];
    setCurrentWord(prev => prev + letter.toLowerCase());
  };

  const handleBackspace = () => setCurrentWord(prev => prev.slice(0, -1));
  const clearWord = () => setCurrentWord('');

  // Submit word
  const submitWord = () => {
    if (!currentWord || currentWord.length < 3) {
      showFeedbackMessage('Words must be at least 3 letters long!', 'error');
      return;
    }
    const wordLower = currentWord.toLowerCase();

    if (foundWords.includes(wordLower)) {
      showFeedbackMessage('Word already found!', 'warning');
      return;
    }
    if (!isValidWord(currentWord)) {
      showFeedbackMessage('Not a valid word!', 'error');
      setCurrentWord('');
      return;
    }
    if (!possibleWords.includes(wordLower)) {
      showFeedbackMessage('Cannot be formed from available letters!', 'error');
      setCurrentWord('');
      return;
    }

    // Valid word
    setFoundWords(prev => [...prev, wordLower]);
    setTotalWordsFound(prev => prev + 1);
    if (currentWord.length === scrambledLetters.length) setPerfectWords(p => p + 1);
    if (currentWord.length > longestWordFound.length) setLongestWordFound(currentWord);

    // Add score for this word
    setScore(prev => prev + perWordPoints);
    showFeedbackMessage(`Great! +${perWordPoints.toFixed(2)} points`, 'success');
    setCurrentWord('');
  };

  const showFeedbackMessage = (message, type) => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setShowFeedback(true);

    // Clear any existing timeout so the new message isn't hidden early
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    // Longer display for hints/info (e.g., 4s), others 2s
    const duration = type === 'info' ? 4000 : 2000;

    feedbackTimeoutRef.current = setTimeout(() => {
      setShowFeedback(false);
      feedbackTimeoutRef.current = null;
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing') return;
    setHintsUsed(prev => prev + 1);
    const unfoundWords = possibleWords.filter(word => !foundWords.includes(word));
    if (unfoundWords.length > 0) {
      const hintWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
      showFeedbackMessage(`Hint: Try "${hintWord.toUpperCase()}"`, 'info');
    } else {
      showFeedbackMessage('You\'ve found all possible words!', 'success');
    }
  };

  const shuffleLetters = () => {
    if (gameState !== 'playing') return;
    setScrambledLetters(prev => scrambleLetters(prev.join('')));
  };

  // Finish when all words found
  useEffect(() => {
    if (
      gameState === 'playing' &&
      possibleWords.length > 0 &&
      foundWords.length === possibleWords.length
    ) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - gameStartTime) / 1000);
      setGameDuration(duration);
      setScore(200);
      setFinalScore(200);
      setGameState('finished');
      setShowCompletionModal(true);
    }
  }, [foundWords, possibleWords, gameState, gameStartTime]);

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            const endTime = Date.now();
            const duration = Math.floor((endTime - gameStartTime) / 1000);
            setGameDuration(duration);
            setFinalScore(score);
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, gameStartTime, score]);

  const handleStart = () => {
    initializeGame();
    setGameStartTime(Date.now());
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
    setShowCompletionModal(false);
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') setDifficulty(newDifficulty);
  };

  // Keyboard
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'Enter') submitWord();
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Escape') clearWord();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentWord]);

  const customStats = {
    totalWordsFound,
    possibleWords: possibleWords.length,
    longestWord: longestWordFound || 'None',
    perfectWords,
    hintsUsed,
    completionRate: possibleWords.length > 0 ? Math.round((foundWords.length / possibleWords.length) * 100) : 0
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Anagram Solver"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Anagram Solver
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions ? <ChevronUp className="h-5 w-5 text-blue-900" /> : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">🎯 Objective</h4>
                  <p className="text-sm text-blue-700">Find all valid words. Each correct word awards equal points.</p>
                </div>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">📝 How to Play</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Click letters to build words</li>
                    <li>• Press Enter to submit</li>
                    <li>• Backspace to delete, Escape to clear</li>
                  </ul>
                </div>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">📊 Scoring</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Total possible score: 200</li>
                    <li>• Points per word: Total possible words / 200</li>
                    <li>• Final score becomes 200 when all words found</li>
                  </ul>
                </div>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Hints</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use hints if stuck</li>
                    <li>• Shuffle to see new patterns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Critical Thinking"
        gameState={gameState}
        setGameState={setGameState}
        score={gameState === 'finished' ? Math.round(finalScore) : Math.round(score)}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={handleDifficultyChange}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        {/* Game Content */}
        <div className="flex flex-col items-center">

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            <button
              onClick={useHint}
              disabled={hintsUsed >= maxHints || gameState !== 'playing'}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${hintsUsed >= maxHints || gameState !== 'playing'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
            >
              <Lightbulb className="h-4 w-4" />
              Hint ({Math.max(0, maxHints - hintsUsed)})
            </button>

            <button
              onClick={shuffleLetters}
              disabled={gameState !== 'playing'}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 w-full max-w-3xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Found</div>
              <div className="text-lg font-semibold text-[#FF6B3E]">
                {foundWords.length}/{possibleWords.length}
              </div>
            </div>
          </div>

          {/* Letters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Available Letters
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {scrambledLetters.map((letter, index) => (
                <button
                  key={index}
                  onClick={() => handleLetterClick(index)}
                  disabled={gameState !== 'playing'}
                  className="w-12 h-12 bg-blue-500 text-white rounded-lg font-bold text-xl hover:bg-blue-600 transition-colors shadow-md disabled:bg-gray-300"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Current Word */}
          <div className="mb-6 w-full max-w-md">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-2">Current Word</div>
              <div className="text-2xl font-bold text-gray-800 h-8 flex items-center justify-center">
                {currentWord.toUpperCase() || '_'}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={handleBackspace}
                  disabled={!currentWord}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
                >
                  Backspace
                </button>
                <button
                  onClick={clearWord}
                  disabled={!currentWord}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300"
                >
                  Clear
                </button>
                <button
                  onClick={submitWord}
                  disabled={!currentWord}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`mb-6 p-4 rounded-lg w-full max-w-md text-center ${feedbackType === 'success' ? 'bg-green-100 text-green-800' :
              feedbackType === 'error' ? 'bg-red-100 text-red-800' :
                feedbackType === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
              }`}>
              <div className="flex items-center justify-center gap-2">
                {feedbackType === 'success' ? <CheckCircle className="h-5 w-5" /> :
                  feedbackType === 'error' ? <XCircle className="h-5 w-5" /> :
                    <Lightbulb className="h-5 w-5" />}
                <span className="font-semibold">{feedbackMessage}</span>
              </div>
            </div>
          )}

          {/* Found Words */}
          <div className="w-full max-w-4xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Found Words ({foundWords.length})
            </h3>
            {foundWords.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {foundWords.map((word, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center font-semibold ${word.length === scrambledLetters.length
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                      : word.length >= 6
                        ? 'bg-green-100 text-green-800'
                        : word.length >= 4
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    <div className="text-sm uppercase">{word}</div>
                    <div className="text-xs opacity-75">
                      {perWordPoints.toFixed(2)} pts
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No words found yet. Start building words with the letters above!
              </div>
            )}
          </div>

          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600">
              Each discovered word increases your score. Find them all for a total of 200 points!
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {difficulty} Mode: {difficultySettings[difficulty].description} |
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit | {difficultySettings[difficulty].hints} hints
            </div>
          </div>
        </div>
      </GameFramework>

      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={Math.round(finalScore)}
        difficulty={difficulty}
        duration={gameDuration}
        customStats={{
          wordsFound: totalWordsFound,
          possibleWords: possibleWords.length,
          completionRate: customStats.completionRate,
          longestWord: longestWordFound || 'None',
          perfectWords
        }}
      />
    </div>
  );
};

// Comprehensive word database for anagram game
const WORD_DATABASE = {
  // 3-letter words
  3: [
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BY', 'HOT',
    'ITS', 'WHO', 'DID', 'YES', 'HIS', 'HAS', 'HAD', 'LET', 'PUT', 'TOO', 'OLD', 'ANY', 'MAY', 'SAY', 'SHE', 'USE',
    'NOW', 'WAY', 'MAN', 'NEW', 'GET', 'MAY', 'DAY', 'OWN', 'SAW', 'HIM', 'TWO', 'HOW', 'BOY', 'DID', 'CAR', 'EAT',
    'FAR', 'SEA', 'EYE', 'RED', 'TOP', 'ARM', 'BAD', 'BIG', 'BOX', 'CUP', 'DOG', 'EGG', 'END', 'FUN', 'GOD', 'HIT',
    'JOB', 'KEY', 'LAW', 'LEG', 'LIE', 'LOT', 'LOW', 'MOM', 'NET', 'OIL', 'PEN', 'PIG', 'RUN', 'SIT', 'SIX', 'SUN',
    'TEN', 'TRY', 'WIN', 'BAT', 'BED', 'BEE', 'BIT', 'BUS', 'BUY', 'CAT', 'COW', 'CRY', 'CUT', 'DAD', 'DIG', 'DRY',
    'EAR', 'FLY', 'FOX', 'GUN', 'HAT', 'ICE', 'JOY', 'KID', 'LAD', 'LAY', 'MAP', 'MUD', 'NUT', 'PAY', 'PET', 'POT',
    'RAT', 'ROW', 'SKY', 'TEA', 'TIE', 'TOY', 'VAN', 'WAR', 'WET', 'ZOO', 'AGE', 'ART', 'BAG', 'BAR', 'BAY', 'BET',
    'BIN', 'BAD', 'COD', 'COG', 'DEN', 'DIM', 'DOT', 'DUE', 'FAN', 'FEW', 'FIG', 'FIT', 'FOG', 'GAP', 'GAS', 'GYM',
    'HEN', 'HID', 'HUG', 'INK', 'JAM', 'JAR', 'JET', 'LAP', 'LID', 'LOG', 'MAD', 'MIX', 'MOB', 'NAP', 'NOD', 'ODD',
    'PAD', 'PAN', 'PAW', 'PIT', 'RAG', 'RIM', 'RIP', 'ROD', 'RUB', 'RUG', 'SAD', 'SAG', 'SET', 'SIP', 'SOB', 'SOD',
    'TAB', 'TAG', 'TAP', 'TAR', 'TIP', 'TON', 'TUG', 'VET', 'WAD', 'WAG', 'WIG', 'YAM', 'YES', 'YET', 'ZAP', 'ZIP'
  ],

  // 4-letter words
  4: [
    'THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME',
    'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN',
    'THEM', 'WELL', 'WERE', 'WHAT', 'YEAR', 'WORK', 'BACK', 'CALL', 'CAME', 'EACH', 'EVEN', 'FIND', 'GIVE', 'HAND',
    'HIGH', 'KEEP', 'LAST', 'LEFT', 'LIFE', 'LIVE', 'LOOK', 'MADE', 'MOST', 'MOVE', 'MUST', 'NAME', 'NEED', 'NEXT',
    'ONLY', 'OPEN', 'PART', 'PLAY', 'RIGHT', 'SAID', 'SAME', 'SEEM', 'SHOW', 'SIDE', 'TELL', 'TURN', 'USED', 'WANT',
    'WAYS', 'WEEK', 'WENT', 'WORD', 'WORK', 'BEST', 'BOOK', 'BOTH', 'CASE', 'DOWN', 'EACH', 'FACT', 'FEEL', 'FORM',
    'GAME', 'GIRL', 'GOES', 'HELP', 'HOME', 'HOPE', 'IDEA', 'KEEP', 'KIND', 'KNEW', 'LAND', 'LATE', 'LEAD', 'MEAN',
    'MIND', 'NEAR', 'ONCE', 'ONLY', 'PLAN', 'REAL', 'ROOM', 'SEEN', 'SENT', 'SOON', 'SORT', 'STAY', 'STOP', 'SURE',
    'TALK', 'TEAM', 'TOLD', 'TOOK', 'TOWN', 'TREE', 'TRUE', 'TYPE', 'UPON', 'USED', 'WAIT', 'WALK', 'WARM', 'WIND',
    'WORD', 'WORE', 'YARD', 'AREA', 'ARMY', 'AWAY', 'BABY', 'BALL', 'BAND', 'BASE', 'BEAR', 'BEAT', 'BIRD', 'BLUE',
    'BODY', 'BORN', 'BUILD', 'BUSY', 'CARE', 'CARS', 'CHAIR', 'COME', 'COST', 'DARK', 'DATA', 'DEAD', 'DEAL', 'DEAR',
    'DOOR', 'DRAW', 'DROP', 'DRUG', 'ELSE', 'EVEN', 'EVER', 'FACE', 'FAIR', 'FALL', 'FAST', 'FEAR', 'FELT', 'FILL',
    'FINE', 'FIRE', 'FISH', 'FIVE', 'FLEW', 'FOOD', 'FOOT', 'FOUR', 'FREE', 'FULL', 'GAVE', 'GOES', 'GOLD', 'GONE',
    'HAIR', 'HALF', 'HALL', 'HARD', 'HEAD', 'HEAR', 'HELD', 'HILL', 'HOLD', 'HOPE', 'HOUR', 'HUGE', 'HURT', 'ITEM',
    'JOIN', 'JUMP', 'KILL', 'KING', 'LACK', 'LAKE', 'LEAD', 'LESS', 'LINE', 'LIST', 'LOST', 'LOVE', 'MAIN', 'MISS',
    'MOON', 'MORE', 'NEAR', 'NEWS', 'NICE', 'NOTE', 'PAID', 'PAST', 'PATH', 'PICK', 'POOR', 'PULL', 'PUSH', 'RACE',
    'RAIN', 'RANG', 'RATE', 'READ', 'RICH', 'RING', 'RISE', 'ROAD', 'ROCK', 'ROLE', 'ROLL', 'ROSE', 'RULE', 'SAFE',
    'SALE', 'SAVE', 'SEAL', 'SELL', 'SEND', 'SHIP', 'SHOP', 'SHOT', 'SICK', 'SING', 'SIZE', 'SKIN', 'SLIP', 'SLOW',
    'SOLD', 'SONG', 'SOUL', 'STAR', 'STEP', 'SWIM', 'TALL', 'TAPE', 'TASK', 'TEND', 'TEST', 'TEXT', 'THIN', 'TIED',
    'TIRE', 'TONE', 'TOOL', 'TOUR', 'TRIP', 'UNIT', 'VIEW', 'WALL', 'WAVE', 'WEAR', 'WEST', 'WIDE', 'WIFE', 'WILD',
    'WINE', 'WING', 'WISE', 'WISH', 'WOOD', 'ZONE', 'ABLE', 'ACID', 'AGED', 'ALSO', 'AREA', 'ASIA', 'BABY', 'BALL',
    'BAND', 'BANK', 'BASE', 'BATH', 'BEAM', 'BEAN', 'BEAR', 'BEAT', 'BEEN', 'BELL', 'BELT', 'BEND', 'BIKE', 'BILL',
    'BIRD', 'BLOW', 'BLUE', 'BOAT', 'BOMB', 'BONE', 'BOOM', 'BOOT', 'BORE', 'BOSS', 'BOWL', 'BULK', 'BURN', 'BUSH',
    'BUSY', 'BYTE', 'CAGE', 'CAKE', 'CALM', 'CAME', 'CAMP', 'CARD', 'CARE', 'CASH', 'CAST', 'CAVE', 'CELL', 'CHEF',
    'CHIN', 'CHIP', 'CITE', 'CITY', 'CLAY', 'CLIP', 'CLUB', 'COAL', 'COAT', 'CODE', 'COIN', 'COLD', 'COME', 'COOK',
    'COOL', 'COPY', 'CORD', 'CORN', 'COST', 'COSY', 'CREW', 'CROP', 'CROW', 'CUBE', 'CUTE', 'DAWN', 'DAYS', 'DEAD',
    'DEAF', 'DEAL', 'DEAN', 'DEAR', 'DEBT', 'DECK', 'DEEP', 'DEER', 'DESK', 'DIAL', 'DIET', 'DIRT', 'DISH', 'DOCK',
    'DOES', 'DOLL', 'DOOR', 'DOSE', 'DOWN', 'DRAG', 'DRAW', 'DREW', 'DROP', 'DRUM', 'DUCK', 'DULL', 'DUST', 'DUTY',
    'EACH', 'EARN', 'EASE', 'EAST', 'EASY', 'ECHO', 'EDGE', 'EDIT', 'ELSE', 'EMIT', 'EPIC', 'EVEN', 'EVER', 'EVIL',
    'EXAM', 'EXIT', 'EYED', 'FACE', 'FACT', 'FAIL', 'FAIR', 'FALL', 'FAME', 'FARE', 'FARM', 'FAST', 'FATE', 'FEAR',
    'FEED', 'FEEL', 'FEET', 'FELL', 'FELT', 'FILE', 'FILL', 'FILM', 'FIND', 'FINE', 'FIRE', 'FIRM', 'FISH', 'FIST',
    'FIVE', 'FLAG', 'FLAT', 'FLEE', 'FLEW', 'FLIP', 'FLOW', 'FOLK', 'FOOD', 'FOOL', 'FOOT', 'FORD', 'FORE', 'FORK',
    'FORM', 'FORT', 'FOUR', 'FREE', 'FROM', 'FUEL', 'FULL', 'FUND', 'GAIN', 'GAME', 'GATE', 'GAVE', 'GEAR', 'GENE',
    'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GLOW', 'GOAL', 'GOAT', 'GOES', 'GOLD', 'GOLF', 'GONE', 'GOOD', 'GRAB', 'GREW',
    'GREY', 'GRID', 'GROW', 'GULF', 'HAIR', 'HALF', 'HALL', 'HAND', 'HANG', 'HARD', 'HARM', 'HATE', 'HAVE', 'HEAD',
    'HEAL', 'HEAR', 'HEAT', 'HELD', 'HELL', 'HELP', 'HERE', 'HERO', 'HIDE', 'HIGH', 'HILL', 'HINT', 'HIRE', 'HOLD',
    'HOLE', 'HOME', 'HOOK', 'HOPE', 'HORN', 'HOST', 'HOUR', 'HUGE', 'HUNG', 'HUNT', 'HURT', 'ICON', 'IDEA', 'INCH',
    'INTO', 'IRON', 'ITEM', 'JAIL', 'JANE', 'JAZZ', 'JEAN', 'JOBS', 'JOIN', 'JOKE', 'JULY', 'JUMP', 'JUNE', 'JURY',
    'JUST', 'KEEN', 'KEEP', 'KEPT', 'KEYS', 'KICK', 'KILL', 'KIND', 'KING', 'KISS', 'KNEE', 'KNEW', 'KNOW', 'LACK',
    'LADY', 'LAID', 'LAKE', 'LAMP', 'LAND', 'LANE', 'LAST', 'LATE', 'LAZY', 'LEAD', 'LEAF', 'LEAN', 'LEFT', 'LENS',
    'LESS', 'LIED', 'LIFE', 'LIFT', 'LIKE', 'LINE', 'LINK', 'LION', 'LIST', 'LIVE', 'LOAD', 'LOAN', 'LOCK', 'LOGO',
    'LONG', 'LOOK', 'LORD', 'LOSE', 'LOSS', 'LOST', 'LOTS', 'LOUD', 'LOVE', 'LUCK', 'LUNG', 'MADE', 'MAIL', 'MAIN',
    'MAKE', 'MALE', 'MALL', 'MANY', 'MARK', 'MASS', 'MEAL', 'MEAN', 'MEAT', 'MEET', 'MENU', 'MESS', 'MICE', 'MILE',
    'MILK', 'MIND', 'MINE', 'MISS', 'MODE', 'MOOD', 'MOON', 'MORE', 'MOST', 'MOVE', 'MUCH', 'MUST', 'NAME', 'NAVY',
    'NEAR', 'NECK', 'NEED', 'NEWS', 'NEXT', 'NICE', 'NINE', 'NODE', 'NONE', 'NOON', 'NORM', 'NOTE', 'NUDE', 'OBEY',
    'ODDS', 'OKAY', 'ONCE', 'ONLY', 'ONTO', 'OPEN', 'ORAL', 'OVER', 'PACE', 'PACK', 'PAGE', 'PAID', 'PAIN', 'PAIR',
    'PALM', 'PARK', 'PART', 'PASS', 'PAST', 'PATH', 'PEAK', 'PICK', 'PILE', 'PINK', 'PIPE', 'PLAN', 'PLAY', 'PLOT',
    'PLUS', 'POEM', 'POET', 'POLL', 'POOL', 'POOR', 'PORT', 'POST', 'POUR', 'PULL', 'PURE', 'PUSH', 'QUIT', 'RACE',
    'RAIN', 'RANK', 'RARE', 'RATE', 'READ', 'REAL', 'REAR', 'RELY', 'RENT', 'REST', 'RICH', 'RIDE', 'RING', 'RISE',
    'RISK', 'ROAD', 'ROCK', 'ROLE', 'ROLL', 'ROOM', 'ROOT', 'ROPE', 'ROSE', 'RULE', 'RUNS', 'RUSH', 'SAFE', 'SAID',
    'SAIL', 'SAKE', 'SALE', 'SALT', 'SAME', 'SAND', 'SAVE', 'SEAL', 'SEAT', 'SEED', 'SEEK', 'SEEM', 'SEEN', 'SELF',
    'SELL', 'SEND', 'SENT', 'SHIP', 'SHOE', 'SHOP', 'SHOT', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIGN', 'SING', 'SITE',
    'SIZE', 'SKIN', 'SKIP', 'SLIP', 'SLOW', 'SNAP', 'SNOW', 'SOAP', 'SOFT', 'SOIL', 'SOLD', 'SOLE', 'SOME', 'SONG',
    'SOON', 'SORT', 'SOUL', 'SOUP', 'SPIN', 'SPOT', 'STAR', 'STAY', 'STEP', 'STIR', 'STOP', 'SUCH', 'SUIT', 'SUNG',
    'SURE', 'SWIM', 'TAKE', 'TALE', 'TALK', 'TALL', 'TANK', 'TAPE', 'TASK', 'TAXI', 'TEAM', 'TEAR', 'TELL', 'TEND',
    'TENT', 'TERM', 'TEST', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIN', 'THIS', 'THUS', 'TIDE', 'TIED',
    'TILE', 'TIME', 'TINY', 'TIRE', 'TOLD', 'TONE', 'TOOK', 'TOOL', 'TOPS', 'TORN', 'TOUR', 'TOWN', 'TREE', 'TREK',
    'TRIM', 'TRIP', 'TRUE', 'TUNE', 'TURN', 'TWIN', 'TYPE', 'UGLY', 'UNIT', 'UPON', 'USED', 'USER', 'VARY', 'VAST',
    'VERY', 'VIEW', 'VOTE', 'WAGE', 'WAIT', 'WAKE', 'WALK', 'WALL', 'WANT', 'WARD', 'WARM', 'WARN', 'WASH', 'WAVE',
    'WAYS', 'WEAK', 'WEAR', 'WEEK', 'WELL', 'WENT', 'WERE', 'WEST', 'WHAT', 'WHEN', 'WHOM', 'WIDE', 'WIFE', 'WILD',
    'WILL', 'WIND', 'WINE', 'WING', 'WIRE', 'WISE', 'WISH', 'WITH', 'WOKE', 'WOLF', 'WOOD', 'WOOL', 'WORD', 'WORE',
    'WORK', 'WORM', 'WORN', 'YARD', 'YEAH', 'YEAR', 'YOUR', 'ZERO', 'ZONE'
  ],

  // 5-letter words
  5: [
    'ABOUT', 'ABOVE', 'ABUSE', 'ADULT', 'AFTER', 'AGAIN', 'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT',
    'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY',
    'APART', 'APPLE', 'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARMED', 'ARMOR', 'ARRAY', 'ARROW', 'ASIDE', 'ASSET',
    'AUDIO', 'AUDIT', 'AVOID', 'AWARD', 'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN',
    'BEING', 'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLAST', 'BLIND', 'BLOCK', 'BLOOD',
    'BLOWN', 'BLUES', 'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRASS', 'BRAVE', 'BREAD', 'BREAK',
    'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CALIF', 'CARRY',
    'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF',
    'CHILD', 'CHINA', 'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK', 'CLOSE',
    'CLOUD', 'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH', 'CRAZY', 'CREAM', 'CRIME',
    'CROSS', 'CROWD', 'CROWN', 'CRUDE', 'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DATED', 'DEALT', 'DEATH', 'DEBUT',
    'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK', 'DREAM', 'DRESS', 'DRILL', 'DRINK',
    'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER',
    'ENTRY', 'EQUAL', 'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER',
    'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID', 'FOCUS',
    'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT', 'FRUIT', 'FULLY',
    'FUNNY', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE', 'GRADE', 'GRAIN', 'GRAND', 'GRANT', 'GRASS',
    'GRAVE', 'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'HAPPY', 'HARRY',
    'HEART', 'HEAVY', 'HENRY', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN', 'HURRY', 'IMAGE', 'INDEX', 'INNER', 'INPUT',
    'ISSUE', 'JAPAN', 'JIMMY', 'JOINT', 'JONES', 'JUDGE', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH',
    'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LEWIS', 'LIGHT', 'LIMIT', 'LINKS', 'LIVES',
    'LOCAL', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'LYING', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH', 'MARIA', 'MATCH',
    'MAYBE', 'MAYOR', 'MEANT', 'MEDIA', 'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH',
    'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVED', 'MOVIE', 'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT',
    'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUGHT',
    'PAINT', 'PANEL', 'PAPER', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO', 'PIANO', 'PIECE', 'PILOT',
    'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE',
    'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO',
    'RAISE', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY', 'REALM', 'REBEL', 'REFER', 'RELAX', 'REPAY', 'REPLY',
    'RIGHT', 'RIVAL', 'RIVER', 'ROBIN', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE',
    'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SETUP', 'SEVEN', 'SHALL', 'SHAPE', 'SHARE', 'SHARP', 'SHEET',
    'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT', 'SHOWN', 'SIGHT', 'SINCE', 'SIXTH',
    'SIXTY', 'SIZED', 'SKILL', 'SLEEP', 'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SNAP', 'SNOW',
    'SOLID', 'SOLVE', 'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT',
    'SPOKE', 'SPORT', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STEEP', 'STEER',
    'STEVE', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY',
    'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'TERMS',
    'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE',
    'THREE', 'THREW', 'THROW', 'THUMB', 'TIGER', 'TIGHT', 'TIMER', 'TIMES', 'TITLE', 'TODAY', 'TOPIC', 'TOTAL',
    'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIBE', 'TRICK', 'TRIED',
    'TRIES', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH', 'TWICE', 'TWIST', 'TYLER', 'UNCLE', 'UNDER', 'UNDUE', 'UNION',
    'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL',
    'VOCAL', 'VOICE', 'WASTE', 'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE',
    'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WRITE', 'WRONG', 'WROTE', 'YIELD',
    'YOUNG', 'YOURS', 'YOUTH'
  ],

  // 6+ letter words
  6: [
    'ACCEPT', 'ACCESS', 'ACROSS', 'ACTION', 'ACTIVE', 'ACTUAL', 'ADVICE', 'ADVISE', 'AFFECT', 'AFFORD', 'AFRAID',
    'AGENCY', 'AGENDA', 'ALMOST', 'ALWAYS', 'AMOUNT', 'ANIMAL', 'ANNUAL', 'ANSWER', 'ANYONE', 'ANYWAY', 'APPEAR',
    'AROUND', 'ARRIVE', 'ARTIST', 'ASSIST', 'ASSUME', 'ATTACK', 'ATTEND', 'AUGUST', 'AUTHOR', 'AVENUE', 'BACKED',
    'BARELY', 'BATTLE', 'BEAUTY', 'BECAME', 'BECOME', 'BEFORE', 'BEHALF', 'BEHAVE', 'BEHIND', 'BELONG', 'BERLIN',
    'BETTER', 'BEYOND', 'BISHOP', 'BORDER', 'BOTTLE', 'BOTTOM', 'BOUGHT', 'BRANCH', 'BREATH', 'BRIDGE', 'BRIEF',
    'BRIGHT', 'BRING', 'BRITAIN', 'BROKEN', 'BUDGET', 'BUFFER', 'BUREAU', 'BUTTON', 'CAMERA', 'CANCER', 'CANNOT',
    'CANVAS', 'CAREER', 'CASTLE', 'CASUAL', 'CAUGHT', 'CENTER', 'CENTRE', 'CHANCE', 'CHANGE', 'CHARGE', 'CHOICE',
    'CHOOSE', 'CHOSEN', 'CHROME', 'CHURCH', 'CIRCLE', 'CLIENT', 'CLOSED', 'CLOSER', 'COFFEE', 'COLUMN', 'COMBAT',
    'COMING', 'COMMIT', 'COMMON', 'COMPLY', 'COPPER', 'CORNER', 'COSTLY', 'COUNTY', 'COUPLE', 'COURSE', 'COVERS',
    'CREATE', 'CREDIT', 'CRISIS', 'CUSTOM', 'DAMAGE', 'DANGER', 'DEALER', 'DEBATE', 'DECADE', 'DECIDE', 'DEFEAT',
    'DEFEND', 'DEFINE', 'DEGREE', 'DEMAND', 'DEPEND', 'DEPUTY', 'DERIVE', 'DESIGN', 'DESIRE', 'DETAIL', 'DETECT',
    'DEVICE', 'DIFFER', 'DINNER', 'DIRECT', 'DOCTOR', 'DOLLAR', 'DOMAIN', 'DOUBLE', 'DRIVEN', 'DRIVER', 'DURING',
    'EASILY', 'EATING', 'EDITOR', 'EFFECT', 'EFFORT', 'EIGHTH', 'EITHER', 'ELEVEN', 'EMPIRE', 'EMPLOY', 'ENABLE',
    'ENDING', 'ENERGY', 'ENGINE', 'ENOUGH', 'ENSURE', 'ENTIRE', 'ENTITY', 'EQUITY', 'ESCAPE', 'ESTATE', 'ETHNIC',
    'EUROPE', 'EVEN', 'EVENTS', 'EVER', 'EVERY', 'EXACT', 'EXCEPT', 'EXCESS', 'EXPAND', 'EXPECT', 'EXPERT',
    'EXPORT', 'EXTEND', 'EXTENT', 'FABRIC', 'FACIAL', 'FACTOR', 'FAILED', 'FAIRLY', 'FALLEN', 'FAMILY', 'FAMOUS',
    'FATHER', 'FELLOW', 'FEMALE', 'FIGURE', 'FILING', 'FINGER', 'FINISH', 'FISCAL', 'FLIGHT', 'FLYING', 'FOLLOW',
    'FORBES', 'FORCED', 'FOREST', 'FORGET', 'FORMAT', 'FORMER', 'FOSTER', 'FOUGHT', 'FOURTH', 'FRANCE', 'FRENCH',
    'FRIEND', 'FUTURE', 'GADGET', 'GALAXY', 'GARDEN', 'GATHER', 'GENDER', 'GENTLE', 'GERMAN', 'GLOBAL', 'GOLDEN',
    'GROUND', 'GROWTH', 'GUILTY', 'HANDED', 'HANDLE', 'HAPPEN', 'HARDLY', 'HEADED', 'HEALTH', 'HOLDER', 'HONEST',
    'HOPING', 'HORROR', 'IMPACT', 'IMPORT', 'INCOME', 'INDEED', 'INJURY', 'INSIDE', 'INTENT', 'INVEST', 'ISLAND',
    'ITSELF', 'JERSEY', 'JOSEPH', 'JUNIOR', 'KILLED', 'KNIGHT', 'LAPTOP', 'LARGELY', 'LATTER', 'LAUNCH', 'LAWYER',
    'LEADER', 'LEAGUE', 'LENGTH', 'LESSON', 'LETTER', 'LIGHTS', 'LIKELY', 'LINKED', 'LIQUID', 'LISTEN', 'LITTLE',
    'LIVING', 'LOSING', 'LUCENT', 'LUXURY', 'MAKING', 'MANAGE', 'MANNER', 'MANUAL', 'MARGIN', 'MARINE', 'MARKED',
    'MARKET', 'MARTIN', 'MASTER', 'MATTER', 'MATURE', 'MAXIMUM', 'MEDIUM', 'MEMBER', 'MEMORY', 'MENTAL', 'MERELY',
    'MERGER', 'METHOD', 'MIDDLE', 'MILLER', 'MINING', 'MINUTE', 'MIRROR', 'MOBILE', 'MODERN', 'MODEST', 'MODULE',
    'MOMENT', 'MORRIS', 'MOSTLY', 'MOTHER', 'MOTION', 'MOVING', 'MURDER', 'MUSCLE', 'MUSEUM', 'MUTUAL', 'MYSELF',
    'NARROW', 'NATION', 'NATIVE', 'NATURE', 'NEARBY', 'NEARLY', 'NIGHTS', 'NOBODY', 'NORMAL', 'NOTICE', 'NOTION',
    'NUMBER', 'OBJECT', 'OBTAIN', 'OFFICE', 'OFFSET', 'ONLINE', 'OPTION', 'ORANGE', 'ORIGIN', 'OUTPUT', 'OXFORD',
    'PACKED', 'PALACE', 'PARENT', 'PARTLY', 'PASSED', 'PATENT', 'PAYING', 'PEACE', 'PEOPLE', 'PERIOD', 'PERMIT',
    'PERSON', 'PHRASE', 'PICKED', 'PIECES', 'PLACED', 'PLANET', 'PLAYED', 'PLAYER', 'PLEASE', 'PLENTY', 'POCKET',
    'POLICE', 'POLICY', 'POLISH', 'POOL', 'POPULAR', 'PORTER', 'PRETTY', 'PREVENT', 'PRINCE', 'PRISON', 'PROFIT',
    'PROPER', 'PROVE', 'PROVEN', 'PUBLIC', 'PURPLE', 'PURPOSE', 'PUSHED', 'RACHEL', 'RACING', 'RADIUS', 'RAISED',
    'RANDOM', 'RARELY', 'RATHER', 'RATING', 'READER', 'REALLY', 'REASON', 'REBEL', 'RECALL', 'RECENT', 'RECORD',
    'REDUCE', 'REFORM', 'REFUSE', 'REGARD', 'REGIME', 'REGION', 'RELATE', 'RELIEF', 'REMAIN', 'REMOTE', 'REMOVE',
    'REPAIR', 'REPEAT', 'REPLACE', 'REPLY', 'REPORT', 'RESCUE', 'RESULT', 'RETAIL', 'RETAIN', 'RETURN', 'REVEAL',
    'REVIEW', 'REWARD', 'RIDING', 'RISING', 'ROBUST', 'ROLLED', 'ROOMIE', 'RUBBER', 'RULING', 'RUNNING', 'SAFETY',
    'SAMPLE', 'SAVING', 'SAYING', 'SCHEME', 'SCHOOL', 'SCREEN', 'SCRIPT', 'SEARCH', 'SEASON', 'SECOND', 'SECRET',
    'SECTOR', 'SECURE', 'SEEING', 'SELECT', 'SENIOR', 'SERIES', 'SERVER', 'SETTLE', 'SETUP', 'SEVERE', 'SEXUAL',
    'SHADOW', 'SHARED', 'SHIELD', 'SHOULD', 'SHOWED', 'SHOWER', 'SIGNAL', 'SIGNED', 'SILENT', 'SILVER', 'SIMPLE',
    'SIMPLY', 'SINGLE', 'SISTER', 'SLIGHT', 'SMOOTH', 'SOCIAL', 'SOLELY', 'SOLVED', 'SOURCE', 'SOVIET', 'SPEECH',
    'SPIRIT', 'SPOKEN', 'SPREAD', 'SPRING', 'SQUARE', 'STABLE', 'STATED', 'STATIC', 'STATUS', 'STAYED', 'STEADY',
    'STOLEN', 'STRAIN', 'STRAND', 'STREAM', 'STREET', 'STRESS', 'STRICT', 'STRIKE', 'STRING', 'STRONG', 'STRUCK',
    'STUDIO', 'STUPID', 'SUBMIT', 'SUDDEN', 'SUFFER', 'SUMMER', 'SUMMIT', 'SUPPLY', 'SURELY', 'SURVEY', 'SWITCH',
    'SYMBOL', 'SYSTEM', 'TAKING', 'TALENT', 'TARGET', 'TAUGHT', 'TEMPLE', 'TENANT', 'TENDER', 'TENNIS', 'THANKS',
    'THEORY', 'THIRTY', 'THOUGH', 'THREAD', 'THREAT', 'THROWN', 'TICKET', 'TIMBER', 'TIMING', 'TISSUE', 'TITLED',
    'TOWARD', 'TRAVEL', 'TRYING', 'TWELVE', 'TWENTY', 'UNABLE', 'UNIQUE', 'UNITED', 'UNLESS', 'UNLIKE', 'UPDATE',
    'USEFUL', 'VALLEY', 'VARIED', 'VENDOR', 'VERSUS', 'VICTIM', 'WALKER', 'WEALTH', 'WEAPON', 'WEEKLY', 'WEIGHT',
    'WHOLLY', 'WINDOW', 'WINNER', 'WINTER', 'WITHIN', 'WITHOUT', 'WONDER', 'WOODEN', 'WORKER', 'WRIGHT', 'WRITER',
    'YELLOW'
  ]
};

// Function to get all possible words from given letters
const getValidWords = (letters, foundWords = []) => {
  const availableLetters = letters.toLowerCase().split('');
  const validWords = [];

  // Check each word length category
  Object.values(WORD_DATABASE).forEach(wordList => {
    wordList.forEach(word => {
      const wordLower = word.toLowerCase();

      // Skip if already found
      if (foundWords.includes(wordLower)) return;

      // Check if word can be formed from available letters
      if (canFormWord(wordLower, availableLetters)) {
        validWords.push(wordLower);
      }
    });
  });

  return validWords.sort((a, b) => b.length - a.length || a.localeCompare(b));
};

// Check if a word can be formed from available letters
const canFormWord = (word, availableLetters) => {
  const letterCount = {};

  // Count available letters
  availableLetters.forEach(letter => {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  });

  // Check if word can be formed
  for (let letter of word) {
    if (!letterCount[letter] || letterCount[letter] === 0) {
      return false;
    }
    letterCount[letter]--;
  }

  return true;
};

const isValidWord = (word) => {
  const wordUpper = word.toUpperCase();
  const wordLength = word.length;

  if (wordLength < 3) return false;

  const category = wordLength <= 4 ? wordLength : wordLength <= 5 ? 5 : 6;
  return WORD_DATABASE[category] && WORD_DATABASE[category].includes(wordUpper);
};

const getWordScore = (word) => {
  const length = word.length;
  if (length < 3) return 0;
  if (length === 3) return 1;
  if (length === 4) return 2;
  if (length === 5) return 4;
  if (length === 6) return 6;
  return Math.min(10, length); // Cap at 10 points for very long words
};

export default AnagramSolverGame;