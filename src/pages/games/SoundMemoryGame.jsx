import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

const SoundMemoryGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeSound, setActiveSound] = useState(null);
  const [correctSequences, setCorrectSequences] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [audioContext, setAudioContext] = useState(null);

  // Audio context ref
  const audioContextRef = useRef(null);

  // Sound definitions with actual frequencies
  const sounds = [
    { id: 'low', name: 'Low Tone', color: '#EF4444', frequency: 220, emoji: '🔴' },
    { id: 'mid-low', name: 'Mid-Low', color: '#F97316', frequency: 330, emoji: '🟠' },
    { id: 'mid', name: 'Mid Tone', color: '#F59E0B', frequency: 440, emoji: '🟡' },
    { id: 'mid-high', name: 'Mid-High', color: '#10B981', frequency: 660, emoji: '🟢' },
    { id: 'high', name: 'High Tone', color: '#3B82F6', frequency: 880, emoji: '🔵' },
    { id: 'bell', name: 'Bell', color: '#8B5CF6', frequency: 1320, emoji: '🟣' }
  ];

  // Difficulty settings
  const difficultySettings = {
    Easy: { startLength: 3, maxLength: 6, soundCount: 4, playSpeed: 800, timeLimit: 60 },
    Moderate: { startLength: 4, maxLength: 8, soundCount: 5, playSpeed: 600, timeLimit: 50 },
    Hard: { startLength: 5, maxLength: 10, soundCount: 6, playSpeed: 400, timeLimit: 40 }
  };

  // Initialize audio context
  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        setAudioContext(audioContextRef.current);
      } catch (error) {
        console.warn('Audio not supported:', error);
      }
    }
  }, []);

  // Play sound with Web Audio API
  const playSound = useCallback((frequency, duration = 500) => {
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }, []);

  // Generate random sequence
  const generateSequence = useCallback((length, soundCount) => {
    const availableSounds = sounds.slice(0, soundCount);
    const newSequence = [];

    for (let i = 0; i < length; i++) {
      const randomSound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
      newSequence.push(randomSound.id);
    }

    return newSequence;
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setCurrentLevel(1);
    setSequence([]);
    setPlayerSequence([]);
    setIsPlayingSequence(false);
    setActiveSound(null);
    setCorrectSequences(0);
    setTotalAttempts(0);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    initializeAudio();
  }, [difficulty, initializeAudio]);

  // Start new round
  const startNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const sequenceLength = Math.min(
      settings.startLength + currentLevel - 1,
      settings.maxLength
    );

    const newSequence = generateSequence(sequenceLength, settings.soundCount);
    setSequence(newSequence);
    setPlayerSequence([]);
    setIsPlayingSequence(true);
    setActiveSound(null);

    // Play sequence
    playSequence(newSequence, settings.playSpeed);
  }, [currentLevel, difficulty, generateSequence]);

  // Play sequence with audio
  const playSequence = useCallback((seq, speed) => {
    let index = 0;

    const playNext = () => {
      if (index < seq.length) {
        const soundId = seq[index];
        const sound = sounds.find(s => s.id === soundId);

        setActiveSound(soundId);

        // Play the actual sound
        if (sound && audioContextRef.current) {
          playSound(sound.frequency, speed * 0.6);
        }

        setTimeout(() => {
          setActiveSound(null);
          setTimeout(() => {
            index++;
            playNext();
          }, 200);
        }, speed);
      } else {
        setIsPlayingSequence(false);
      }
    };

    setTimeout(playNext, 500);
  }, [playSound]);

  // Handle sound selection
  const handleSoundSelect = useCallback((soundId) => {
    if (gameState !== 'playing' || isPlayingSequence) return;

    // Play sound feedback
    const sound = sounds.find(s => s.id === soundId);
    if (sound && audioContextRef.current) {
      playSound(sound.frequency, 300);
    }

    const newPlayerSequence = [...playerSequence, soundId];
    setPlayerSequence(newPlayerSequence);

    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      setTotalAttempts(prev => prev + 1);

      // Check if correct
      const isCorrect = newPlayerSequence.every((sound, index) => sound === sequence[index]);

      if (isCorrect) {
        setCorrectSequences(prev => prev + 1);
        setCurrentLevel(prev => prev + 1);

        // Start next round after delay
        setTimeout(() => {
          startNewRound();
        }, 1500);
      } else {
        // Show feedback and restart round
        setTimeout(() => {
          startNewRound();
        }, 2000);
      }
    }
  }, [gameState, isPlayingSequence, playerSequence, sequence, playSound, startNewRound]);

  // Replay sequence
  const replaySequence = useCallback(() => {
    if (isPlayingSequence || sequence.length === 0) return;

    const settings = difficultySettings[difficulty];
    setPlayerSequence([]);
    setIsPlayingSequence(true);
    playSequence(sequence, settings.playSpeed);
  }, [isPlayingSequence, sequence, difficulty, playSequence]);

  // Calculate score
  useEffect(() => {
    if (totalAttempts > 0) {
      const accuracy = correctSequences / totalAttempts;
      const settings = difficultySettings[difficulty];
      const timeUsed = settings.timeLimit - timeRemaining;

      let newScore = accuracy * 200 - (timeUsed * 0.5);
      newScore = Math.max(0, Math.min(200, newScore));

      setScore(newScore);
    }
  }, [correctSequences, totalAttempts, timeRemaining, difficulty]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleStart = () => {
    initializeGame();
    setTimeout(() => {
      startNewRound();
    }, 500);
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Game completed:', payload);
  };

  const customStats = {
    correctSequences,
    totalAttempts,
    currentLevel
  };

  const getSoundClass = (soundId) => {
    const sound = sounds.find(s => s.id === soundId);
    const isActive = activeSound === soundId;
    const isInPlayerSequence = playerSequence.includes(soundId);

    let baseClass = 'relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 transition-all duration-300 flex items-center justify-center text-3xl cursor-pointer transform-gpu';

    if (isActive) {
      baseClass += ' border-white shadow-2xl scale-125 animate-pulse ring-4 ring-white ring-opacity-50';
    } else if (isInPlayerSequence) {
      baseClass += ' border-gray-300 opacity-70 scale-95';
    } else {
      baseClass += ' border-gray-200 hover:border-white hover:scale-110 hover:shadow-xl shadow-lg';
    }

    return baseClass;
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Sound Memory"
        gameDescription="Listen to the sound sequence and reproduce it in the correct order!"
        category="Memory"
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
          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-lg">
            <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 shadow-lg border border-orange-200">
              <div className="text-xs font-medium text-orange-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 Level
              </div>
              <div className="text-2xl font-bold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow-lg border border-blue-200">
              <div className="text-xs font-medium text-blue-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎵 Progress
              </div>
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {playerSequence.length}/{sequence.length}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-lg border border-green-200">
              <div className="text-xs font-medium text-green-600 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                ✅ Accuracy
              </div>
              <div className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {totalAttempts > 0 ? Math.round((correctSequences / totalAttempts) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Status Display */}
          <div className="mb-8 text-center">
            {isPlayingSequence && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
                <div className="text-lg font-semibold flex items-center justify-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <span className="text-2xl animate-pulse">🎵</span>
                  Listen to the sequence...
                  <span className="text-2xl animate-pulse">🎵</span>
                </div>
              </div>
            )}
            {!isPlayingSequence && sequence.length > 0 && (
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full shadow-lg">
                <div className="text-lg font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  🎯 Repeat the sequence ({playerSequence.length}/{sequence.length})
                </div>
              </div>
            )}
          </div>

          {/* Sound Buttons */}
          <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              {sounds.slice(0, difficultySettings[difficulty].soundCount).map((sound, index) => (
                <div key={sound.id} className="flex flex-col items-center">
                  <button
                    onClick={() => handleSoundSelect(sound.id)}
                    disabled={isPlayingSequence}
                    className={getSoundClass(sound.id)}
                    style={{
                      backgroundColor: sound.color,
                      background: `linear-gradient(135deg, ${sound.color}, ${sound.color}dd)`
                    }}
                  >
                    <span className="text-white font-bold drop-shadow-lg">
                      {sound.emoji}
                    </span>
                    {activeSound === sound.id && (
                      <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></div>
                    )}
                  </button>
                  <div className="mt-2 text-xs font-medium text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {sound.frequency}Hz
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Sequence Display */}
          {playerSequence.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-3 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎼 Your Sequence
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                {playerSequence.map((soundId, index) => {
                  const sound = sounds.find(s => s.id === soundId);
                  return (
                    <div
                      key={index}
                      className="relative w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110"
                      style={{
                        backgroundColor: sound.color,
                        background: `linear-gradient(135deg, ${sound.color}, ${sound.color}dd)`
                      }}
                    >
                      <span className="text-white text-lg font-bold drop-shadow">{sound.emoji}</span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Replay Button */}
          {!isPlayingSequence && sequence.length > 0 && (
            <button
              onClick={replaySequence}
              className="mb-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '600' }}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                Replay Sequence
                <span className="text-lg">🎵</span>
              </span>
            </button>
          )}

          {/* Sound Legend */}
          <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-3 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
              🎼 Sound Guide
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {sounds.slice(0, difficultySettings[difficulty].soundCount).map((sound) => (
                <div key={sound.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div
                    className="w-5 h-5 rounded-full shadow-sm border-2 border-white"
                    style={{
                      backgroundColor: sound.color,
                      background: `linear-gradient(135deg, ${sound.color}, ${sound.color}dd)`
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {sound.emoji} {sound.name}
                    </span>
                    <span className="text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {sound.frequency}Hz
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Status */}
          {!audioContext && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl text-center shadow-lg">
              <div className="text-sm font-semibold text-yellow-800 flex items-center justify-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <span className="text-lg animate-bounce">🔊</span>
                Audio will initialize when you start the game
                <span className="text-lg animate-bounce">🎵</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-lg">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200">
              <div className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                🎯 How to Play
              </div>
              <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {isPlayingSequence
                  ? '🎵 Listen carefully to the sound sequence. Each tone has a different pitch and color. Focus on the order!'
                  : '🎮 Click the sound buttons in the same order you heard them. Each button plays its unique tone. Use headphones for the best experience!'
                }
              </p>
              <div className="mt-3 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                💡 Tip: Higher frequencies = higher pitch sounds
              </div>
            </div>
          </div>
        </div>
      </GameFramework>
    </div>
  );
};

export default SoundMemoryGame;
