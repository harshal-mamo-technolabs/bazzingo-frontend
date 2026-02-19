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
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
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
    background: '#ffffff',
    color: '#1a1a2e',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: `2px solid ${isVictory ? '#22c55e' : '#dc2626'}`,
    boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
    position: 'relative',
  }),

  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'rgba(0,0,0,0.06)',
    border: 'none',
    color: '#374151',
    fontSize: '18px',
    cursor: 'pointer',
    width: 32,
    height: 32,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: (isVictory) => ({
    fontSize: '1.5rem',
    fontWeight: 700,
    textAlign: 'center',
    color: isVictory ? '#15803d' : '#b91c1c',
    marginTop: 8,
  }),

  score: {
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#1f2937',
  },

  stats: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#4b5563',
  },

  suggestionBox: {
    background: '#f3f4f6',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: '1px solid #e5e7eb',
  },

  suggestionHeader: {
    fontWeight: 600,
    textAlign: 'center',
    fontSize: '0.95rem',
    color: '#374151',
  },

  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    background: '#ffffff',
    borderRadius: '10px',
    padding: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
    color: '#111827',
  },

  gameMeta: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: 2,
  },

  navBtn: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '18px',
    color: '#374151',
    cursor: 'pointer',
  },

  centerText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#6b7280',
  },

  mainBtn: (isVictory) => ({
    padding: '12px 20px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '1rem',
    background: isVictory ? '#22c55e' : '#dc2626',
    color: '#fff',
    boxShadow: isVictory ? '0 2px 8px rgba(34,197,94,0.3)' : '0 2px 8px rgba(220,38,38,0.3)',
  }),
};

export default GameCompletionModal;
