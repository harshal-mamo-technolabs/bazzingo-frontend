import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';

/* ───────── CONFIG ───────── */
const DIFF = {
  Easy: { relocate: 400, timeLimit: 60, size: 60 },
  Moderate: { relocate: 300, timeLimit: 50, size: 50 },
  Hard: { relocate: 200, timeLimit: 40, size: 40 },
};

/* ───────── COMPONENT ───────── */
const TapChallengeGame = () => {
  /* refs */
  const containerRef = useRef(null);
  const relocateInterval = useRef(null);
  const countdownInterval = useRef(null);
  const targetShownAt = useRef(null);

  /* state */
  const [gameState, setGameState] = useState('ready');     // ready | playing | finished
  const [difficulty, setDifficulty] = useState('Easy');

  const [timeLeft, setTimeLeft] = useState(DIFF.Easy.timeLimit);
  const [pos, setPos] = useState({ x: 50, y: 50 }); // px
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [rTimes, setRTimes] = useState([]);
  const [score, setScore] = useState(0);

  /* ───────── helpers ───────── */
  const resetTimers = () => {
    clearInterval(relocateInterval.current);
    clearInterval(countdownInterval.current);
  };

  /* random position inside container */
  const randomPos = useCallback(() => {
    const box = containerRef.current.getBoundingClientRect();
    const size = DIFF[difficulty].size;
    return {
      x: Math.random() * (box.width - size) + size / 2,
      y: Math.random() * (box.height - size) + size / 2,
    };
  }, [difficulty]);

  /* move target */
  const moveTarget = useCallback(() => {
    if (gameState !== 'playing') return;
    setPos(randomPos());
    targetShownAt.current = Date.now();
  }, [gameState, randomPos]);

  /* ───────── hit / miss ───────── */
  const registerHit = useCallback(() => {
    if (gameState !== 'playing') return;
    const rt = Date.now() - targetShownAt.current;
    setHits(h => h + 1);
    setRTimes(arr => [...arr, rt]);
    moveTarget();                                    // hop immediately
  }, [gameState, moveTarget]);

  const registerMiss = useCallback(
    (e) => {
      if (gameState !== 'playing') return;
      const box = containerRef.current.getBoundingClientRect();
      const size = DIFF[difficulty].size;
      const cx = pos.x;
      const cy = pos.y;

      const clickX = e.clientX - box.left;
      const clickY = e.clientY - box.top;
      const dist = Math.hypot(clickX - cx, clickY - cy);

      if (dist > size / 2) setMisses(m => m + 1);
    },
    [gameState, pos, difficulty]
  );

  /* ───────── start game ───────── */
  const startGame = () => {
    resetTimers();
    const { relocate, timeLimit } = DIFF[difficulty];

    setHits(0); setMisses(0); setRTimes([]); setScore(0);
    setTimeLeft(timeLimit);
    setGameState('playing');

    moveTarget();                                          // first target

    relocateInterval.current = setInterval(moveTarget, relocate);

    countdownInterval.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('finished');
          resetTimers();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  /* ───────── scoring ───────── */
  useEffect(() => {
    if (hits + misses === 0) return;

    const avgRT = rTimes.length
      ? rTimes.reduce((a, b) => a + b, 0) / rTimes.length
      : 1000;

    let factor = 1;
    if (avgRT <= 150) factor = 5;
    else if (avgRT <= 250) factor = 4;
    else if (avgRT <= 350) factor = 3;
    else if (avgRT <= 500) factor = 2;

    let raw = factor * hits - misses * 10;
    setScore(Math.max(0, Math.min(200, raw)));
  }, [hits, misses, rTimes]);

  /* ───────── payload on finish ───────── */
  const onComplete = payload => console.log(payload);

  useEffect(() => {
    if (gameState !== 'finished') return;
    resetTimers();
    const avg = rTimes.length
      ? Math.round(rTimes.reduce((a, b) => a + b, 0) / rTimes.length)
      : 0;

    onComplete({
      category: 'Reflexes',
      difficulty,
      score,
      duration: DIFF[difficulty].timeLimit - timeLeft,
      hits,
      misses,
      avgReactionMs: avg,
      success: true,
    });
  }, [gameState]);

  /* ───────── derived ───────── */
  const avgRT = rTimes.length
    ? Math.round(rTimes.reduce((a, b) => a + b, 0) / rTimes.length)
    : 0;

  /* ───────── UI ───────── */
  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Tap Challenge"
        gameDescription="Tap the moving circle as fast as you can!"
        category="Reflexes"
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        timeRemaining={timeLeft}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={startGame}
        onReset={() => { resetTimers(); setGameState('ready'); }}
        onGameComplete={onComplete}
        customStats={{ hits, misses, avgReactionMs: avgRT }}
      >
        <div className="flex flex-col items-center">

          {/* stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md">
            {[
              ['Hits', hits, 'text-green-600'],
              ['Misses', misses, 'text-red-600'],
              ['Avg ms', avgRT, 'text-blue-600'],
            ].map(([lab, val, cls]) => (
              <div key={lab} className="text-center bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">{lab}</div>
                <div className={`text-lg font-semibold ${cls}`}>{val}</div>
              </div>
            ))}
          </div>

          {/* playfield */}
          <div
            ref={containerRef}
            onClick={registerMiss}
            className="relative bg-gray-100 border-2 border-gray-300 rounded-lg mx-auto cursor-crosshair"
            style={{ width: 400, height: 300 }}
          >
            {/* target */}
            {gameState === 'playing' && (
              <button
                onClick={(e) => { e.stopPropagation(); registerHit(); }}
                className="absolute rounded-full bg-[#FF6B3E] border-4 border-white shadow-lg hover:bg-[#e55a35] transition-colors"
                style={{
                  width: DIFF[difficulty].size,
                  height: DIFF[difficulty].size,
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%,-50%)',
                }}
              />
            )}

            {gameState === 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Click **Start** to begin
              </div>
            )}
          </div>

          {/* instructions */}
          <p className="mt-6 text-sm text-gray-600 text-center max-w-md">
            Tap the orange circle as soon as it appears. The faster your average
            reaction, the higher the score – but each miss costs 10 points!
          </p>
        </div>
      </GameFramework>
    </div>
  );
};

export default TapChallengeGame;
