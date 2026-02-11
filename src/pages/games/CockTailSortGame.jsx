import { useState, useCallback, useEffect, useRef } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

// ─── PUZZLE DATA (hand-crafted, guaranteed solvable) ──────────────────────────
const PUZZLES = {
  Easy: {
    colors: 3, par: 12,
    tubes: [
      ['coral', 'ocean', 'mango', 'coral'],
      ['mango', 'coral', 'ocean', 'mango'],
      ['ocean', 'mango', 'coral', 'ocean'],
      [], []
    ]
  },
  Moderate: {
    colors: 5, par: 20,
    tubes: [
      ['coral', 'lime', 'ocean', 'grape'],
      ['pineapple', 'coral', 'lime', 'ocean'],
      ['grape', 'pineapple', 'coral', 'lime'],
      ['ocean', 'grape', 'pineapple', 'coral'],
      ['lime', 'ocean', 'grape', 'pineapple'],
      [], []
    ]
  },
  Hard: {
    colors: 7, par: 30,
    tubes: [
      ['coral', 'mango', 'ocean', 'berry'],
      ['lime', 'grape', 'pineapple', 'coral'],
      ['ocean', 'berry', 'mango', 'lime'],
      ['grape', 'pineapple', 'coral', 'ocean'],
      ['berry', 'mango', 'lime', 'grape'],
      ['pineapple', 'coral', 'ocean', 'berry'],
      ['mango', 'lime', 'grape', 'pineapple'],
      [], []
    ]
  }
};

const LIQUID_COLORS = {
  coral:     { bg: 'linear-gradient(180deg, #ff8a80, #e53935)', glow: '#ff5252' },
  ocean:     { bg: 'linear-gradient(180deg, #80d8ff, #0288d1)', glow: '#40c4ff' },
  mango:     { bg: 'linear-gradient(180deg, #ffcc80, #ef6c00)', glow: '#ffa726' },
  lime:      { bg: 'linear-gradient(180deg, #b9f6ca, #2e7d32)', glow: '#69f0ae' },
  grape:     { bg: 'linear-gradient(180deg, #ce93d8, #7b1fa2)', glow: '#ba68c8' },
  pineapple: { bg: 'linear-gradient(180deg, #fff59d, #f9a825)', glow: '#ffee58' },
  berry:     { bg: 'linear-gradient(180deg, #f48fb1, #c2185b)', glow: '#f06292' }
};

const MAX_LAYERS = 4;
const TIME_LIMIT = 180;

// ─── AUDIO ENGINE ─────────────────────────────────────────────────────────────
let audioCtx = null;
let masterGain = null;
let bgMusicOscillators = [];

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.value = 0.3;
}

function playTone(freq, duration, type = 'sine', vol = 0.2) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(g);
  g.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playPour() {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 1.5;
  const g = audioCtx.createGain();
  g.gain.value = 0.25;
  src.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  src.start();
}

function playSplash() {
  playTone(400, 0.12, 'sine', 0.3);
  setTimeout(() => playTone(300, 0.15, 'triangle', 0.2), 60);
  setTimeout(() => playTone(500, 0.08, 'sine', 0.15), 100);
}

function playThud() { playTone(80, 0.2, 'triangle', 0.2); playTone(100, 0.15, 'sine', 0.1); }

function startBackgroundMusic() {
  if (!audioCtx || bgMusicOscillators.length > 0) return;
  
  const bgGain = audioCtx.createGain();
  bgGain.gain.value = 0.06;
  bgGain.connect(masterGain);

  const chords = [[523, 659, 784], [349, 440, 523], [392, 493, 587], [523, 659, 784]];
  let idx = 0;
  
  function playChord() {
    if (bgMusicOscillators.length === 0) return;
    
    const chord = chords[idx % chords.length];
    chord.forEach(f => {
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      noteGain.gain.setValueAtTime(0, audioCtx.currentTime);
      noteGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.2);
      noteGain.gain.setValueAtTime(1, audioCtx.currentTime + 3.6);
      noteGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 4);
      osc.connect(noteGain);
      noteGain.connect(bgGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 4);
    });
    idx++;
    setTimeout(playChord, 4000);
  }
  
  bgMusicOscillators.push(true);
  playChord();
}

function stopBackgroundMusic() {
  bgMusicOscillators = [];
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLE_ID = 'cocktail-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes cs-lift { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-70px); opacity: 1; } }
    @keyframes cs-drop { 0% { transform: translateY(-70px); } 70% { transform: translateY(4px); } 100% { transform: translateY(0); } }
    @keyframes cs-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
    @keyframes cs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes cs-pour-arc {
      0% { transform: translate(0, 0) scale(1); opacity: 1; }
      30% { transform: translate(var(--pour-dx-mid), -80px) scale(1.2); opacity: 1; }
      70% { transform: translate(var(--pour-dx), -40px) scale(1); opacity: 0.9; }
      100% { transform: translate(var(--pour-dx), var(--pour-dy)) scale(0.8); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const CocktailSortGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [glasses, setGlasses] = useState([]);
  const [selectedGlass, setSelectedGlass] = useState(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const [shakeGlass, setShakeGlass] = useState(null);
  const [droppingGlass, setDroppingGlass] = useState(null);
  const [pourAnim, setPourAnim] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const glassRefs = useRef({});

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (gameState === 'finished') {
      stopBackgroundMusic();
    }
  }, [gameState]);

  const settings = PUZZLES[difficulty];

  const checkWin = useCallback((g) => {
    return g.every(glass => glass.length === 0 || (glass.length === MAX_LAYERS && glass.every(l => l === glass[0])));
  }, []);

  const initGame = useCallback(() => {
    setGlasses(settings.tubes.map(t => [...t]));
    setSelectedGlass(null);
    setMoves(0);
    setScore(0);
    setShakeGlass(null);
    setDroppingGlass(null);
    setPourAnim(null);
  }, [settings]);

  const handleStart = useCallback(() => {
    initAudio();
    startBackgroundMusic();
    initGame();
    setTimeRemaining(TIME_LIMIT);
    setGameState('playing');
  }, [initGame]);

  const handleReset = useCallback(() => {
    stopBackgroundMusic();
    initGame();
    setTimeRemaining(TIME_LIMIT);
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeRemaining]);

  // Check for victory
  useEffect(() => {
    if (gameState === 'playing' && glasses.length > 0 && checkWin(glasses)) {
      const par = settings.par;
      const s = Math.min(200, Math.round(200 * Math.min(1, par / Math.max(1, moves + 1))));
      setScore(s);
      setGameState('finished');
    }
  }, [glasses, gameState, checkWin, settings, moves]);

  const handleGlassTap = useCallback((idx) => {
    if (gameState !== 'playing' || pourAnim) return;
    const glass = glasses[idx];

    if (selectedGlass === null) {
      if (glass.length === 0) return;
      initAudio();
      playPour();
      setSelectedGlass(idx);
    } else if (selectedGlass === idx) {
      setSelectedGlass(null);
    } else {
      const srcGlass = glasses[selectedGlass];
      const layer = srcGlass[srcGlass.length - 1];
      const canDrop = glass.length < MAX_LAYERS && (glass.length === 0 || glass[glass.length - 1] === layer);

      if (canDrop) {
        setPourAnim({ color: layer, fromIdx: selectedGlass, toIdx: idx });
        playSplash();

        const newGlasses = glasses.map(g => [...g]);
        newGlasses[selectedGlass].pop();
        setGlasses(newGlasses);
        setSelectedGlass(null);

        setTimeout(() => {
          const finalGlasses = newGlasses.map(g => [...g]);
          finalGlasses[idx].push(layer);
          setGlasses(finalGlasses);
          setDroppingGlass(idx);
          setMoves(m => m + 1);
          setPourAnim(null);
          setTimeout(() => setDroppingGlass(null), 300);
        }, 500);
      } else {
        playThud();
        setShakeGlass(idx);
        setTimeout(() => setShakeGlass(null), 400);
      }
    }
  }, [gameState, glasses, selectedGlass, pourAnim]);

  // Instructions section
  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Sort all cocktail layers so each glass contains only one color
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tap a glass to select the top layer</li>
          <li>• Tap another glass to pour it there</li>
          <li>• Layers can only go on same color or empty</li>
          <li>• Use empty glasses strategically!</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Scoring
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Complete the puzzle to win</li>
          <li>• Fewer moves = higher score</li>
          <li>• Try to beat the par score</li>
          <li>• Maximum score: 200 points</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Difficulty
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Easy: 3 colors, 12 moves par</li>
          <li>• Moderate: 5 colors, 20 moves par</li>
          <li>• Hard: 7 colors, 30 moves par</li>
          <li>• Time limit: 3 minutes</li>
        </ul>
      </div>
    </div>
  );

  // Playing content
  const glassWidth = isLargeScreen ? 90 : 70;
  const layerHeight = isLargeScreen ? 48 : 38;
  const glassHeight = MAX_LAYERS * (layerHeight + 4) + 36;
  const glassGap = isLargeScreen ? 20 : 14;

  // Calculate pour animation position
  const pourElement = (() => {
    if (!pourAnim) return null;
    const fromEl = glassRefs.current[pourAnim.fromIdx];
    const toEl = glassRefs.current[pourAnim.toIdx];
    if (!fromEl || !toEl) return null;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;
    const c = LIQUID_COLORS[pourAnim.color];
    return { x: fromRect.left + fromRect.width / 2 - 18, y: fromRect.top - 30, dx, dy, c };
  })();

  const playingContent = (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      padding: '16px',
      background: 'linear-gradient(180deg, #4fc3f7 0%, #81d4fa 40%, #b3e5fc 70%, #e0f7fa 100%)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Sun */}
      <div style={{ 
        position: 'absolute', 
        top: '8%', 
        right: '15%', 
        width: 60, 
        height: 60, 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, #fff9c4, #ffee58, #ffa726)', 
        boxShadow: '0 0 40px rgba(255,238,88,0.6)' 
      }} />

      {/* Pour animation blob */}
      {pourElement && (
        <div style={{
          position: 'fixed',
          left: pourElement.x,
          top: pourElement.y,
          width: 36,
          height: 28,
          borderRadius: '50%',
          background: pourElement.c.bg,
          boxShadow: `0 0 20px ${pourElement.c.glow}88`,
          '--pour-dx': `${pourElement.dx}px`,
          '--pour-dx-mid': `${pourElement.dx / 2}px`,
          '--pour-dy': `${pourElement.dy + 60}px`,
          animation: 'cs-pour-arc 0.5s ease-in-out forwards',
          zIndex: 100,
          pointerEvents: 'none'
        }} />
      )}

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 20,
          color: '#fff',
          fontSize: 14,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: timeRemaining <= 30 ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            border: timeRemaining <= 30 ? '2px solid rgba(255,59,48,0.5)' : '2px solid rgba(255,255,255,0.3)',
          }}>
            <span>⏱️</span>
            <span style={{ fontWeight: 600, color: timeRemaining <= 30 ? '#ff3b30' : '#fff' }}>
              Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}>
            <span>👆</span>
            <span style={{ fontWeight: 600 }}>Moves: {moves}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}>
            <span>🎯</span>
            <span style={{ fontWeight: 600 }}>Par: {settings.par}</span>
          </div>
        </div>

        {/* Glasses */}
        <div style={{ 
          display: 'flex', 
          gap: glassGap, 
          alignItems: 'flex-end', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          maxWidth: '95vw', 
          padding: '24px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 20,
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)',
        }}>
          {glasses.map((glass, gi) => {
            const isSelected = selectedGlass === gi;
            const isShaking = shakeGlass === gi;
            return (
              <div
                key={gi}
                ref={el => glassRefs.current[gi] = el}
                onClick={() => handleGlassTap(gi)}
                style={{
                  width: glassWidth,
                  minHeight: glassHeight + 24,
                  cursor: 'pointer',
                  position: 'relative',
                  animation: isShaking ? 'cs-shake 0.4s ease' : isSelected ? 'cs-float 1.5s ease-in-out infinite' : 'none',
                  transition: 'filter 0.2s, transform 0.2s',
                  filter: isSelected ? 'drop-shadow(0 0 18px rgba(255,255,255,0.8))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {/* Glass rim */}
                <div style={{
                  width: glassWidth - 4,
                  height: 10,
                  margin: '0 auto',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.35)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                  position: 'relative',
                  zIndex: 3
                }} />
                {/* Glass body */}
                <div style={{
                  width: '100%',
                  height: glassHeight,
                  clipPath: 'polygon(5% 0%, 95% 0%, 85% 100%, 15% 100%)',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.15) 70%, rgba(255,255,255,0.06) 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  marginTop: -5,
                }}>
                  {/* Glass reflections */}
                  <div style={{
                    position: 'absolute', top: 0, left: '8%', width: '3px', height: '90%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), transparent)',
                    borderRadius: 2, zIndex: 5
                  }} />
                  <div style={{
                    position: 'absolute', top: '5%', left: '18%', width: '12%', height: '75%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08), transparent)',
                    borderRadius: 6, zIndex: 5,
                    filter: 'blur(1px)'
                  }} />
                  {/* Liquid layers */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    display: 'flex', flexDirection: 'column-reverse',
                    alignItems: 'center', padding: '6px 0'
                  }}>
                    {glass.map((layer, li) => {
                      const isTop = li === glass.length - 1;
                      const isLifted = isTop && isSelected;
                      const isDropping = isTop && droppingGlass === gi;
                      const c = LIQUID_COLORS[layer];
                      const widthPct = 62 + ((li + 1) / MAX_LAYERS) * 22;
                      return (
                        <div key={li} style={{
                          width: `${widthPct}%`,
                          height: layerHeight,
                          background: c.bg,
                          borderRadius: li === 0 ? '0 0 6px 6px' : '3px',
                          margin: '1.5px 0',
                          boxShadow: `inset 0 3px 8px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.2), 0 0 12px ${c.glow}55`,
                          animation: isLifted ? 'cs-lift 0.25s ease-out forwards' : isDropping ? 'cs-drop 0.3s ease-out' : 'none',
                          zIndex: isLifted ? 10 : 1,
                          position: 'relative',
                        }}>
                          {/* Liquid surface shine */}
                          <div style={{
                            position: 'absolute', top: 3, left: '8%', width: '55%', height: 4,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
                            borderRadius: 3
                          }} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Empty glass indicator */}
                  {glass.length === 0 && (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: 24, opacity: 0.2, color: '#fff' }}>+</span>
                    </div>
                  )}
                </div>
                {/* Glass stem */}
                <div style={{
                  width: 8, height: 18, background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.3), rgba(255,255,255,0.15))',
                  margin: '0 auto', borderRadius: '0 0 3px 3px'
                }} />
                {/* Glass base */}
                <div style={{
                  width: glassWidth * 0.65, height: 6,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15))',
                  margin: '0 auto', borderRadius: '0 0 4px 4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }} />
              </div>
            );
          })}
        </div>

        {/* Hint */}
        <div style={{
          marginTop: 20,
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          color: '#fff',
          fontSize: 14,
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)',
        }}>
          {selectedGlass !== null
            ? '🍹 Tap another glass to pour, or tap the same glass to cancel'
            : '🍹 Tap a glass to select the top layer'}
        </div>
      </div>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Cocktail Sort"
      gameShortDescription="Sort colorful cocktail layers into matching glasses"
      category="Puzzle"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      customStats={{ moves }}
      instructionsSection={instructionsSection}
    >
      {playingContent}
    </GameFrameworkV2>
  );
};

export default CocktailSortGame;
