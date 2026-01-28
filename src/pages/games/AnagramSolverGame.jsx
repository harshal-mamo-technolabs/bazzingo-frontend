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

  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Optional stats
  const [longestWordFound, setLongestWordFound] = useState('');
  const [totalWordsFound, setTotalWordsFound] = useState(0);
  const [perfectWords, setPerfectWords] = useState(0);

  const feedbackTimeoutRef = useRef(null);

  // Updated difficulty settings with proper scoring
  const difficultySettings = {
    Easy: { 
      timeLimit: 300, 
      hints: 3, 
      letterCount: 6, 
      description: 'Short words with common letters',
      targetWords: 8,
      pointsPerWord: 25
    },
    Moderate: { 
      timeLimit: 240, 
      hints: 2, 
      letterCount: 7, 
      description: 'Mixed difficulty with longer possibilities',
      targetWords: 5,
      pointsPerWord: 40
    },
    Hard: { 
      timeLimit: 180, 
      hints: 1, 
      letterCount: 8, 
      description: 'Complex combinations and rare words',
      targetWords: 4,
      pointsPerWord: 50
    }
  };

  // Curated letter sets that produce the exact number of target words
  const letterSetsWithWords = {
    Easy: [
      { letters: 'STREAM', words: ['stream', 'master', 'smart', 'terms', 'teams', 'rates', 'tears', 'stare'] },
      { letters: 'HEARTS', words: ['hearts', 'haters', 'earths', 'breath', 'thread', 'heated', 'shared', 'trades'] },
      { letters: 'PLANTS', words: ['plants', 'splant', 'psalnt', 'slant', 'pants', 'snap', 'pant', 'taps'] },
      { letters: 'WINTER', words: ['winter', 'twiner', 'inter', 'write', 'twine', 'wire', 'tire', 'wine'] },
      { letters: 'GARDEN', words: ['garden', 'danger', 'ranged', 'grade', 'anger', 'range', 'dear', 'read'] },
      { letters: 'MOTHER', words: ['mother', 'thermo', 'other', 'metro', 'more', 'term', 'home', 'them'] },
      { letters: 'SIMPLE', words: ['simple', 'impels', 'limps', 'miles', 'smile', 'slime', 'lime', 'pile'] },
      { letters: 'FRIEND', words: ['friend', 'finder', 'fined', 'fire', 'find', 'rind', 'dire', 'ride'] },
      { letters: 'LISTEN', words: ['listen', 'silent', 'enlist', 'tinsel', 'inlet', 'lines', 'tiles', 'nest'] },
      { letters: 'DREAMS', words: ['dreams', 'dermas', 'madres', 'smear', 'dream', 'reads', 'dears', 'seam'] }
    ],
    Moderate: [
      { letters: 'PARENTS', words: ['parents', 'partner', 'present', 'pattern', 'entrap'] },
      { letters: 'ISLANDS', words: ['islands', 'sandils', 'lands', 'nails', 'snail'] },
      { letters: 'KITCHEN', words: ['kitchen', 'thicken', 'ethnic', 'think', 'thick'] },
      { letters: 'MACHINE', words: ['machine', 'anemic', 'cinema', 'manic', 'chain'] },
      { letters: 'CHAPTER', words: ['chapter', 'patcher', 'cheaper', 'peach', 'reach'] },
      { letters: 'PICTURE', words: ['picture', 'cuprite', 'price', 'cuter', 'truce'] },
      { letters: 'STORAGE', words: ['storage', 'gators', 'gratos', 'great', 'stage'] },
      { letters: 'CLIMATE', words: ['climate', 'coaltime', 'claim', 'metal', 'cleat'] },
      { letters: 'FREEDOM', words: ['freedom', 'formed', 'deform', 'fomed', 'more'] },
      { letters: 'PRINCES', words: ['princes', 'pincers', 'crisp', 'price', 'spine'] }
    ],
    Hard: [
      { letters: 'CREATION', words: ['creation', 'reaction', 'certain', 'notice'] },
      { letters: 'TRIANGLE', words: ['triangle', 'integral', 'relating', 'angler'] },
      { letters: 'STRENGTH', words: ['strength', 'lengths', 'hunter', 'strong'] },
      { letters: 'KEYBOARD', words: ['keyboard', 'boyarde', 'aboard', 'broad'] },
      { letters: 'HOSPITAL', words: ['hospital', 'phials', 'polish', 'postal'] },
      { letters: 'REPUBLIC', words: ['republic', 'public', 'price', 'cubic'] },
      { letters: 'SANDWICH', words: ['sandwich', 'windsach', 'wands', 'witch'] },
      { letters: 'ELEPHANT', words: ['elephant', 'petal', 'panel', 'plant'] },
      { letters: 'MOUNTAIN', words: ['mountain', 'amount', 'nation', 'mount'] },
      { letters: 'COMPUTER', words: ['computer', 'compute', 'router', 'court'] }
    ]
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
    const availableSets = letterSetsWithWords[difficulty];
    const selectedSet = availableSets[Math.floor(Math.random() * availableSets.length)];
    
    // Scramble the letters
    const letters = scrambleLetters(selectedSet.letters);
    
    // Set the exact words for this difficulty
    setPossibleWords(selectedSet.words);
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

    if (!possibleWords.includes(wordLower)) {
      showFeedbackMessage('Not a valid word or cannot be formed from available letters!', 'error');
      setCurrentWord('');
      return;
    }

    // Valid word found
    const settings = difficultySettings[difficulty];
    setFoundWords(prev => [...prev, wordLower]);
    setTotalWordsFound(prev => prev + 1);
    
    if (currentWord.length === scrambledLetters.length) {
      setPerfectWords(prev => prev + 1);
    }
    
    if (currentWord.length > longestWordFound.length) {
      setLongestWordFound(currentWord);
    }

    // Add fixed score for this word
    setScore(prev => prev + settings.pointsPerWord);
    showFeedbackMessage(`Great! +${settings.pointsPerWord} points`, 'success');
    setCurrentWord('');
  };

  const showFeedbackMessage = (message, type) => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setShowFeedback(true);

    // Clear any existing timeout
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    // Longer display for hints/info
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
      const settings = difficultySettings[difficulty];
      const maxScore = settings.targetWords * settings.pointsPerWord;
      setScore(maxScore);
      setFinalScore(maxScore);
      setGameState('finished');
      setShowCompletionModal(true);
    }
  }, [foundWords, possibleWords, gameState, gameStartTime, difficulty]);

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
  };

  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') setDifficulty(newDifficulty);
  };

  // Keyboard handling
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
      {gameState === 'ready' && <Header unreadCount={3} />}

      <GameFramework
        gameTitle="Anagram Solver"
        gameShortDescription="Rearrange letters to form valid words. Challenge your vocabulary and word recognition skills!"
        gameDescription={
          <div className="mx-auto px-1 mb-2">
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
                  <p className="text-sm text-blue-700">Find all valid words using the given letters. Each difficulty has different target numbers and scoring.</p>
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
                    <li>• Easy: 25 pts per word (8 total)</li>
                    <li>• Medium: 40 pts per word (5 total)</li>
                    <li>• Hard: 50 pts per word (4 total)</li>
                    <li>• Maximum score: 200 points</li>
                  </ul>
                </div>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Hints</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use hints if stuck</li>
                    <li>• Shuffle to see new patterns</li>
                    <li>• Find all words to win!</li>
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
                      {difficultySettings[difficulty].pointsPerWord} pts
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
              Find all {difficultySettings[difficulty].targetWords} words to score {difficultySettings[difficulty].targetWords * difficultySettings[difficulty].pointsPerWord} points!
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {difficulty} Mode: {difficultySettings[difficulty].description} |
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit | {difficultySettings[difficulty].hints} hints | {difficultySettings[difficulty].pointsPerWord} pts per word
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

export default AnagramSolverGame;