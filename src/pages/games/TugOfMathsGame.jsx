import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Clock } from 'lucide-react';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

const tugImage = '/tug-of-war-players.png';

const GAME_DURATION = 300;
const TIME_PER_QUESTION = 10;
const ROPE_SEGMENTS = 5;

const generateQuestion = (difficulty) => {
  let a, b, answer, text;

  switch (difficulty) {
    case 'Easy':
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      if (Math.random() > 0.5) {
        answer = a + b;
        text = `${a} + ${b}`;
      } else {
        if (a < b) [a, b] = [b, a];
        answer = a - b;
        text = `${a} - ${b}`;
      }
      break;
    case 'Moderate':
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        answer = a * b;
        text = `${a} × ${b}`;
      } else {
        b = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 12) + 2;
        a = b * answer;
        text = `${a} ÷ ${b}`;
      }
      break;
    case 'Hard':
    default:
      const ops = ['+', '-', '×', '÷'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      switch (op) {
        case '+':
          a = Math.floor(Math.random() * 50) + 10;
          b = Math.floor(Math.random() * 50) + 10;
          answer = a + b;
          text = `${a} + ${b}`;
          break;
        case '-':
          a = Math.floor(Math.random() * 50) + 30;
          b = Math.floor(Math.random() * 30) + 1;
          answer = a - b;
          text = `${a} - ${b}`;
          break;
        case '×':
          a = Math.floor(Math.random() * 15) + 3;
          b = Math.floor(Math.random() * 15) + 3;
          answer = a * b;
          text = `${a} × ${b}`;
          break;
        case '÷':
        default:
          b = Math.floor(Math.random() * 12) + 2;
          answer = Math.floor(Math.random() * 15) + 2;
          a = b * answer;
          text = `${a} ÷ ${b}`;
          break;
      }
      break;
  }

  const options = new Set();
  options.add(answer);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = answer + (offset === 0 ? 1 : offset);
    if (wrong !== answer) options.add(wrong);
  }

  return {
    text,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

const DIFFICULTIES = ['Easy', 'Moderate', 'Hard'];

const TugOfMathsGame = () => {
  const location = useLocation();
  const [difficulty, setDifficulty] = useState('Easy');
  const [gameState, setGameState] = useState('menu');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ropePosition, setRopePosition] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [completionData, setCompletionData] = useState(null);

  const audioContextRef = useRef(null);
  const timerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const playingStateRef = useRef({ score: 0, computerScore: 0, ropePosition: 0, gameTimeLeft: GAME_DURATION, questionNumber: 0 });
  playingStateRef.current = { score, computerScore, ropePosition, gameTimeLeft, questionNumber };

  /* Daily game detection */
  useEffect(() => {
    const check = async () => {
      try {
        setCheckingDailyGame(true);
        const result = await getDailySuggestions();
        const games = result?.data?.suggestion?.games || [];
        const pathname = location.pathname || '';
        const normalizePath = (p = '') => (String(p).split('?')[0].split('#')[0].trim().replace(/\/+$/, '') || '/');
        const matched = games.find((g) => normalizePath(g?.gameId?.url) === normalizePath(pathname));
        if (matched?.difficulty) {
          const d = String(matched.difficulty).toLowerCase();
          const map = { easy: 'Easy', moderate: 'Moderate', hard: 'Hard' };
          if (map[d]) {
            setIsDailyGame(true);
            setDailyGameDifficulty(map[d]);
            setDifficulty(map[d]);
          }
        }
      } catch (e) {
        console.error('Daily check failed', e);
      } finally {
        setCheckingDailyGame(false);
      }
    };
    check();
  }, [location.pathname]);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((freq, duration, type = 'sine', volume = 0.15) => {
    if (!soundEnabled) return;
    try {
      const ctx = initAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, [soundEnabled, initAudio]);

  const playCorrectSound = useCallback(() => {
    [523, 659, 784].forEach((f, i) => setTimeout(() => playSound(f, 0.2, 'sine', 0.12), i * 80));
  }, [playSound]);

  const playWrongSound = useCallback(() => {
    [300, 250].forEach((f, i) => setTimeout(() => playSound(f, 0.3, 'sawtooth', 0.08), i * 150));
  }, [playSound]);

  const playTickSound = useCallback(() => {
    playSound(800, 0.05, 'square', 0.04);
  }, [playSound]);

  const playGameOverSound = useCallback(() => {
    [523, 494, 440, 392].forEach((f, i) => setTimeout(() => playSound(f, 0.3, 'triangle', 0.1), i * 200));
  }, [playSound]);

  const playVictorySound = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playSound(f, 0.3, 'sine', 0.12), i * 150));
  }, [playSound]);

  const nextQuestion = useCallback(() => {
    setCurrentQuestion(generateQuestion(difficulty));
    setTimeLeft(TIME_PER_QUESTION);
    setFeedback(null);
    setIsTransitioning(false);
  }, [difficulty]);

  const handleAnswer = useCallback((selected) => {
    if (feedback || isTransitioning || !currentQuestion) return;
    setIsTransitioning(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (selected === currentQuestion.answer) {
      setFeedback('correct');
      playCorrectSound();
      const points = difficulty === 'Easy' ? 25 : difficulty === 'Moderate' ? 30 : 40;
      setScore(prev => prev + points);
      setRopePosition(prev => Math.min(prev + 1, ROPE_SEGMENTS));
    } else {
      setFeedback('wrong');
      playWrongSound();
      const points = difficulty === 'Easy' ? 15 : difficulty === 'Moderate' ? 20 : 25;
      setComputerScore(prev => prev + points);
      setRopePosition(prev => Math.max(prev - 1, -ROPE_SEGMENTS));
    }

    setTimeout(() => {
      setQuestionNumber(prev => prev + 1);
    }, 1200);
  }, [feedback, isTransitioning, currentQuestion, difficulty, playCorrectSound, playWrongSound]);

  const handleTimeout = useCallback(() => {
    if (feedback || isTransitioning) return;
    setIsTransitioning(true);
    setFeedback('wrong');
    playWrongSound();
    const points = difficulty === 'Easy' ? 15 : difficulty === 'Moderate' ? 20 : 25;
    setComputerScore(prev => prev + points);
    setRopePosition(prev => Math.max(prev - 1, -ROPE_SEGMENTS));

    setTimeout(() => {
      setQuestionNumber(prev => prev + 1);
    }, 1200);
  }, [feedback, isTransitioning, difficulty, playWrongSound]);

  useEffect(() => {
    if (gameState !== 'playing' || isTransitioning || !currentQuestion) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        if (prev <= 4) playTickSound();
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, isTransitioning, currentQuestion, handleTimeout, playTickSound]);

  useEffect(() => {
    if (gameState === 'playing') nextQuestion();
  }, [questionNumber, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    gameTimerRef.current = setInterval(() => {
      setGameTimeLeft(prev => {
        if (prev <= 1) {
          if (gameTimerRef.current) clearInterval(gameTimerRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          const s = playingStateRef.current;
          setCompletionData({
            score: s.score,
            computerScore: s.computerScore,
            isVictory: s.ropePosition >= ROPE_SEGMENTS,
            difficulty,
            timeElapsed: GAME_DURATION,
            questionNumber: s.questionNumber,
          });
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (gameTimerRef.current) clearInterval(gameTimerRef.current); };
  }, [gameState, difficulty]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (ropePosition >= ROPE_SEGMENTS || ropePosition <= -ROPE_SEGMENTS) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      const isVictory = ropePosition >= ROPE_SEGMENTS;
      if (isVictory) playVictorySound();
      else playGameOverSound();
      setTimeout(() => {
        setCompletionData({
          score,
          computerScore,
          isVictory,
          difficulty,
          timeElapsed: GAME_DURATION - gameTimeLeft,
          questionNumber,
        });
        setGameState('finished');
      }, 800);
    }
  }, [ropePosition, gameState, score, computerScore, gameTimeLeft, questionNumber, difficulty, playVictorySound, playGameOverSound]);

  const handleStart = (selectedDifficulty) => {
    const d = selectedDifficulty ?? difficulty;
    setDifficulty(d);
    initAudio();
    setRopePosition(0);
    setQuestionNumber(0);
    setScore(0);
    setComputerScore(0);
    setGameTimeLeft(GAME_DURATION);
    setFeedback(null);
    setIsTransitioning(false);
    setCurrentQuestion(null);
    setCompletionData(null);
    setGameStartTime(Date.now());
    setGameState('playing');
    playSound(660, 0.2, 'triangle', 0.1);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setRopePosition(0);
    setQuestionNumber(0);
    setScore(0);
    setComputerScore(0);
    setGameTimeLeft(GAME_DURATION);
    setCurrentQuestion(null);
    setFeedback(null);
    setIsTransitioning(false);
    setCompletionData(null);
    setGameState('menu');
  };

  const ropePercent = ((ropePosition + ROPE_SEGMENTS) / (2 * ROPE_SEGMENTS)) * 100;

  const getDifficultyDesc = (d) => {
    switch (d) {
      case 'Easy': return 'Addition & Subtraction (1-20)';
      case 'Moderate': return 'Multiplication & Division';
      case 'Hard': return 'Mixed Operations (larger numbers)';
      default: return '';
    }
  };

  const availableDifficulties = isDailyGame && dailyGameDifficulty ? [dailyGameDifficulty] : DIFFICULTIES;

  const playingContent = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1,
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      color: '#e0e0e0',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', background: 'rgba(0,0,0,0.3)',
      }}>
        <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#e0e0e0', cursor: 'pointer', fontSize: 14, opacity: 0.8 }}>
          ☰ Menu
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#FF6B3E', margin: 0 }}>
          🎯 Tug of Maths
        </h1>
        <button onClick={() => setSoundEnabled(!soundEnabled)} style={{
          background: 'none', border: 'none', color: '#e0e0e0', cursor: 'pointer',
        }}>
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px 0', overflow: 'hidden' }}>
        {currentQuestion && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', padding: '0 16px', maxWidth: 700 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#aaa' }}>🤖 Computer</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{Math.min(computerScore, 200)}/200</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#aaa' }}>
                  ⏱ {Math.floor(gameTimeLeft / 60)}:{(gameTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 800,
                  color: timeLeft <= 3 ? '#ef4444' : '#FF6B3E',
                  animation: timeLeft <= 3 ? 'pulse 0.5s infinite' : 'none',
                }}>
                  <Clock size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {timeLeft}s
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#aaa' }}>🧑 You</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{Math.min(score, 200)}/200</div>
              </div>
            </div>

            <div style={{
              width: '100vw', marginLeft: 'calc(-50vw + 50%)', position: 'relative',
              flex: '1 1 0', minHeight: 0,
              background: 'rgba(0,0,0,0.15)', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 'clamp(30px, 6vh, 50px)',
                background: 'linear-gradient(180deg, #2d5a1e 0%, #1a3a10 100%)',
                borderTop: '2px solid #3a7a28',
              }} />

              <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: 3, height: '100%',
                background: 'repeating-linear-gradient(180deg, rgba(255,107,62,0.6) 0px, rgba(255,107,62,0.6) 6px, transparent 6px, transparent 12px)',
              }} />
              <div style={{
                position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                fontSize: 10, color: '#FF6B3E', fontWeight: 700, letterSpacing: 1,
                textTransform: 'uppercase', opacity: 0.7,
              }}>▼ CENTER ▼</div>

              <div style={{
                position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)',
                fontSize: 13, fontWeight: 800, color: '#ef4444', writingMode: 'vertical-lr',
                textOrientation: 'mixed', letterSpacing: 2, opacity: 0.7,
              }}>🤖 COMPUTER SIDE</div>
              <div style={{
                position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)',
                fontSize: 13, fontWeight: 800, color: '#22c55e', writingMode: 'vertical-lr',
                textOrientation: 'mixed', letterSpacing: 2, opacity: 0.7,
              }}>🧑 YOUR SIDE</div>

              <img
                src={tugImage}
                alt="Tug of War"
                style={{
                  position: 'absolute',
                  bottom: 'clamp(5px, 2vh, 20px)',
                  left: '50%',
                  height: 'clamp(80px, 25vh, 280px)',
                  transform: `translateX(calc(-50% + ${ropePosition * 5}%))`,
                  transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
            </div>

            {feedback && (
              <div style={{
                padding: '8px 24px', borderRadius: 10, fontWeight: 700, fontSize: 16,
                background: feedback === 'correct' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                color: feedback === 'correct' ? '#22c55e' : '#ef4444',
                border: `2px solid ${feedback === 'correct' ? '#22c55e' : '#ef4444'}`,
              }}>
                {feedback === 'correct' ? '✅ Correct! You pull the rope!' : `❌ Wrong! Answer: ${currentQuestion.answer}`}
              </div>
            )}

            <div style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 32px',
              textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>Solve this:</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>
                {currentQuestion.text} = ?
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 400, padding: '0 8px' }}>
              {currentQuestion.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} disabled={!!feedback} style={{
                  padding: '14px', borderRadius: 12, fontSize: 20, fontWeight: 700,
                  border: '2px solid rgba(255,255,255,0.15)',
                  background: feedback
                    ? opt === currentQuestion.answer
                      ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.08)',
                  color: feedback
                    ? opt === currentQuestion.answer ? '#22c55e' : '#888'
                    : 'white',
                  cursor: feedback ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );

  /* ═══ MENU ═══ */
  if (gameState === 'menu') {
    if (checkingDailyGame) {
      return (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e0e0e0', fontFamily: "'Segoe UI', sans-serif" }}>
          <div>Loading...</div>
        </div>
      );
    }
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#e0e0e0', fontFamily: "'Segoe UI', sans-serif", padding: 20 }}>
        <button
          onClick={() => setShowInstructions(true)}
          style={{ position: 'absolute', top: 20, right: 20, padding: '10px 20px', background: 'rgba(255,107,62,0.2)', border: '2px solid rgba(255,107,62,0.5)', borderRadius: 10, color: '#FF6B3E', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
        >
          📖 How to Play
        </button>

        {showInstructions && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowInstructions(false)}>
            <div style={{ background: 'linear-gradient(180deg, #1a1a2e, #16213e)', border: '2px solid #FF6B3E', borderRadius: 20, padding: 28, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', color: '#e0e0e0' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowInstructions(false)} style={{ float: 'right', background: 'none', border: 'none', color: '#e0e0e0', fontSize: 24, cursor: 'pointer' }}>×</button>
              <h2 style={{ marginTop: 0, color: '#FF6B3E' }}>🎯 Tug of Maths – How to Play</h2>
              <h3 style={{ fontSize: 16, color: '#aaa' }}>Objective</h3>
              <p>Battle the computer in a mental math tug-of-war! Answer correctly to pull the rope your way and win the game.</p>
              <h3 style={{ fontSize: 16, color: '#aaa' }}>How to Play</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>Answer math questions correctly.</li>
                <li>You have 10 seconds per question.</li>
                <li>Correct answers pull the rope toward you.</li>
                <li>Wrong answers (or time out) help the computer.</li>
              </ul>
              <h3 style={{ fontSize: 16, color: '#aaa' }}>Winning</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>Pull the rope completely to your side, or</li>
                <li>Have the highest score when time runs out.</li>
                <li>Maximum score: 200 points. Time limit: 5 minutes.</li>
              </ul>
              <h3 style={{ fontSize: 16, color: '#aaa' }}>Difficulty</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li><strong>Easy:</strong> Addition &amp; Subtraction (1–20)</li>
                <li><strong>Moderate:</strong> Multiplication &amp; Division</li>
                <li><strong>Hard:</strong> Mixed operations, larger numbers. Higher difficulty = more points!</li>
              </ul>
            </div>
          </div>
        )}

        <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: 8 }}>🪢</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 900, margin: 0, color: '#FF6B3E' }}>Tug of Maths</h1>
        <p style={{ opacity: 0.7, margin: '0 0 1rem', fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>Mental math tug-of-war</p>
        {isDailyGame && (
          <div style={{ marginBottom: 16, padding: '6px 16px', background: 'rgba(255,107,62,0.2)', border: '1px solid rgba(255,107,62,0.4)', borderRadius: 20, fontSize: 13, color: '#FF6B3E', fontWeight: 600 }}>
            🎯 Daily Challenge
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
          {availableDifficulties.map((d) => {
            const isSelected = difficulty === d;
            return (
              <button
                key={d}
                onClick={() => !isDailyGame && setDifficulty(d)}
                style={{
                  padding: '16px 20px', borderRadius: 14, border: isSelected ? '2px solid #FF6B3E' : '2px solid rgba(255,255,255,0.2)',
                  background: isSelected ? 'rgba(255,107,62,0.15)' : 'rgba(255,255,255,0.06)', color: '#e0e0e0', cursor: isDailyGame ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'all 0.2s', transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{d}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{getDifficultyDesc(d)}</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handleStart()}
          style={{ marginTop: 24, padding: '14px 48px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(135deg, #FF6B3E, #e55a2b)', color: '#fff', boxShadow: '0 4px 20px rgba(255,107,62,0.4)' }}
        >
          🚀 Start Game
        </button>
      </div>
    );
  }

  /* ═══ PLAYING or FINISHED (game + modal) ═══ */
  const timeElapsed = completionData?.timeElapsed ?? (gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0);

  return (
    <>
      {(gameState === 'playing' || gameState === 'finished') && playingContent}

      <GameCompletionModal
        isVisible={gameState === 'finished' && completionData != null}
        onClose={handleReset}
        gameTitle="Tug of Maths"
        score={completionData?.score ?? score}
        moves={completionData?.questionNumber ?? questionNumber}
        timeElapsed={timeElapsed}
        gameTimeLimit={GAME_DURATION}
        isVictory={completionData?.isVictory ?? false}
        difficulty={completionData?.difficulty ?? difficulty}
        customMessages={{
          perfectScore: 180,
          goodScore: 120,
          maxScore: 200,
          stats: `🤖 Computer: ${completionData?.computerScore ?? computerScore}/200 • 📊 Questions: ${completionData?.questionNumber ?? questionNumber} • ⏱ ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`,
        }}
      />
    </>
  );
};

export default TugOfMathsGame;
