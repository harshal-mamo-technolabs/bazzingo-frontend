import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions, submitGameScore } from '../../services/gameService';

const GameCompletionModal = ({
  isVisible,
  onClose,
  gameTitle,
  score,
  moves,
  timeElapsed,
  gameTimeLimit,
  isVictory = false,
  difficulty = 'medium',
  stats = {},
  onMoreGames,
  customMessages = {},
}) => {
  const location = useLocation();
  const pathname = location?.pathname || '';

  const [dailySuggestions, setDailySuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [allDailyGamesPlayed, setAllDailyGamesPlayed] = useState(false);

  const submitStateRef = useRef({ inFlight: null, success: false });
  const currentDailyGameRef = useRef({ gameId: null, isPlayed: null });

  const maxScore = useMemo(() => {
    const raw = Number(customMessages?.maxScore ?? 200);
    return Number.isFinite(raw) ? raw : 200;
  }, [customMessages?.maxScore]);

  const normalizedScore = useMemo(() => {
    const raw = Number(score ?? 0);
    const s = Number.isFinite(raw) ? raw : 0;
    return Math.max(0, Math.min(maxScore, s));
  }, [score, maxScore]);

  const formatTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const normalizePath = useCallback((p = '') => {
    const base = String(p).split('?')[0].split('#')[0].trim();
    const noTrailing = base.replace(/\/+$/, '');
    return noTrailing || '/';
  }, []);

  const fetchDailySuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDailySuggestions();
      const games = result?.data?.suggestion?.games || [];
      const unplayed = games.filter((g) => !g?.isPlayed);
      setDailySuggestions(unplayed);
      setAllDailyGamesPlayed(games.length > 0 && unplayed.length === 0);

      const current = games.find(
        (g) =>
          normalizePath(g?.gameId?.url) === normalizePath(pathname)
      );
      currentDailyGameRef.current = {
        gameId: current?.gameId?._id || null,
        isPlayed:
          typeof current?.isPlayed === 'boolean' ? current.isPlayed : null,
      };

      return { games, unplayed, current };
    } catch {
      setError('Unable to load daily suggestions.');
      setAllDailyGamesPlayed(false);
      currentDailyGameRef.current = { gameId: null, isPlayed: null };
      return { games: [], unplayed: [], current: null };
    } finally {
      setLoading(false);
    }
  }, [normalizePath, pathname]);

  const submitScoreIfNeeded = useCallback(async () => {
    if (submitStateRef.current.success) return;
    if (submitStateRef.current.inFlight) return submitStateRef.current.inFlight;

    const { gameId, isPlayed } = currentDailyGameRef.current || {};

    // Only submit when this game exists in daily suggestions AND is not played yet.
    if (!gameId || isPlayed !== false) {
      submitStateRef.current.success = true;
      return;
    }

    submitStateRef.current.inFlight = (async () => {
      try {
        await submitGameScore(gameId, normalizedScore);
        submitStateRef.current.success = true;
        window.dispatchEvent(
          new CustomEvent('gameScoreSubmitted', {
            detail: { gameId, score: normalizedScore, success: true },
          })
        );
      } catch (err) {
        // allow retry on close / more games
        window.dispatchEvent(
          new CustomEvent('gameScoreSubmitted', {
            detail: {
              gameId,
              score: normalizedScore,
              success: false,
              error: err?.message || 'Failed to submit score',
            },
          })
        );
      } finally {
        submitStateRef.current.inFlight = null;
      }
    })();

    return submitStateRef.current.inFlight;
  }, [normalizedScore]);

  useEffect(() => {
    if (isVisible) {
      submitStateRef.current = { inFlight: null, success: false };
      currentDailyGameRef.current = { gameId: null, isPlayed: null };
      setError('');
      setIndex(0);
      setAllDailyGamesPlayed(false);

      const run = async () => {
        await fetchDailySuggestions();
        await submitScoreIfNeeded();
        await fetchDailySuggestions();
      };

      run();
    }
  }, [isVisible, fetchDailySuggestions, submitScoreIfNeeded]);

  const handleClose = async () => {
    await submitScoreIfNeeded();
    onClose();
  };

  const handleMoreGames = async () => {
    await submitScoreIfNeeded();
    if (onMoreGames) onMoreGames();
    else window.location.href = '/games';
  };

  if (!isVisible) return null;

  const game =
    dailySuggestions[Math.min(index, dailySuggestions.length - 1)];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal(isVictory)}>
        <button style={styles.closeBtn} onClick={handleClose}>
          ✕
        </button>

        {/* Title */}
        <div style={styles.title(isVictory)}>
          {isVictory ? '🏆 Victory!' : "⏰ Time's Up!"}
        </div>

        {/* Score */}
        <div style={styles.score}>
          Final Score: <strong>{score}</strong>/
          {customMessages.maxScore || '200'}
        </div>

        
        {/* Suggestions */}
        {!(allDailyGamesPlayed && !loading && !error) && (
          <div style={styles.suggestionBox}>
            <div style={styles.suggestionHeader}>
              🎮 Daily Game Suggestions
            </div>

            {loading ? (
              <div style={styles.centerText}>Loading...</div>
            ) : error ? (
              <div style={styles.centerText}>{error}</div>
            ) : dailySuggestions.length === 0 ? (
              <div style={styles.centerText}>
                No daily games left for today.
              </div>
            ) : (
              <>
                <div style={styles.card}>
                  <button
                    style={styles.navBtn}
                    onClick={() =>
                      setIndex(
                        (i) =>
                          (i - 1 + dailySuggestions.length) %
                          dailySuggestions.length
                      )
                    }
                  >
                    ‹
                  </button>

                  <div style={styles.cardContent}>
                    {game?.gameId?.thumbnail && (
                      <img
                        src={game.gameId.thumbnail}
                        alt={game.gameId.name}
                        style={styles.thumbnail}
                      />
                    )}
                    <div>
                      <div style={styles.gameName}>
                        {game?.gameId?.name}
                      </div>
                      <div style={styles.gameMeta}>
                        {game?.gameId?.category}
                      </div>
                      <div style={styles.gameMeta}>
                        Difficulty: {game?.difficulty || 'easy'}
                      </div>
                    </div>
                  </div>

                  <button
                    style={styles.navBtn}
                    onClick={() =>
                      setIndex(
                        (i) =>
                          (i + 1) % dailySuggestions.length
                      )
                    }
                  >
                    ›
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Button */}
        <button style={styles.mainBtn(isVictory)} onClick={handleMoreGames}>
          🎯 More Games
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    overflowY: 'auto',
    zIndex: 999,
  },

  modal: (isVictory) => ({
    width: '100%',
    maxWidth: '480px',
    background: isVictory
      ? 'linear-gradient(135deg,#1a1a2e,#0f3460)'
      : 'linear-gradient(135deg,#1a1a2e,#4a0e0e)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: `2px solid ${isVictory ? '#2ecc71' : '#e74c3c'}`,
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    position: 'relative',
  }),

  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
  },

  title: (isVictory) => ({
    fontSize: '1.5rem',
    fontWeight: 700,
    textAlign: 'center',
    color: isVictory ? '#2ecc71' : '#e74c3c',
  }),

  score: {
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: 600,
  },

  stats: {
    textAlign: 'center',
    fontSize: '0.9rem',
    opacity: 0.8,
  },

  suggestionBox: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  suggestionHeader: {
    fontWeight: 600,
    textAlign: 'center',
    fontSize: '0.95rem',
  },

  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '10px',
  },

  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },

  thumbnail: {
    width: '60px',
    height: '45px',
    objectFit: 'cover',
    borderRadius: '6px',
  },

  gameName: {
    fontWeight: 600,
    fontSize: '0.95rem',
  },

  gameMeta: {
    fontSize: '0.75rem',
    opacity: 0.7,
  },

  navBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    color: '#fff',
    cursor: 'pointer',
  },

  centerText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    opacity: 0.7,
  },

  mainBtn: (isVictory) => ({
    padding: '10px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    background: isVictory
      ? '#2ecc71'
      : '#e74c3c',
    color: '#fff',
  }),
};

export default GameCompletionModal;
