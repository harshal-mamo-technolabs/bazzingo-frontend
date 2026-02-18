import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  red: { main: '#E53935', light: '#EF5350', dark: '#C62828' },
  blue: { main: '#1E88E5', light: '#42A5F5', dark: '#1565C0' },
  yellow: { main: '#FDD835', light: '#FFEE58', dark: '#F9A825' },
  green: { main: '#43A047', light: '#66BB6A', dark: '#2E7D32' },
  purple: { main: '#8E24AA', light: '#AB47BC', dark: '#6A1B9A' },
  orange: { main: '#FB8C00', light: '#FFA726', dark: '#EF6C00' },
  pink: { main: '#EC407A', light: '#F06292', dark: '#C2185B' },
  cyan: { main: '#00ACC1', light: '#26C6DA', dark: '#00838F' },
};

const COUNTDOWN_DURATION = 1;
const TOTAL_POINTS = 200;
const TIME_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
// const TIME_LIMIT_MS = 1000;
const LEVEL_CONFIGS = {
  easy: { difficulty: 'easy', trainCount: 3, trainSpeed: 0.003, releaseInterval: 5000 },
  moderate: { difficulty: 'moderate', trainCount: 4, trainSpeed: 0.0045, releaseInterval: 4000 },
  hard: { difficulty: 'hard', trainCount: 5, trainSpeed: 0.006, releaseInterval: 3000 },
};

// ============================================================================
// TRACK LAYOUTS
// ============================================================================

const createTrackLayout = (width, height, stationCount = 8) => {
  const cy = height / 2;
  const startX = width * 0.05;
  const entryGate = { x: startX, y: cy };

  if (stationCount <= 3) {
    const nodes = {
      start: { x: startX, y: cy },
      n1: { x: width * 0.2, y: cy },
      s1: { x: width * 0.35, y: cy },
      upper: { x: width * 0.75, y: height * 0.2 },
      s2_pos: { x: width * 0.55, y: cy + height * 0.12 },
      lower_a: { x: width * 0.85, y: cy },
      lower_b: { x: width * 0.85, y: height * 0.8 },
    };

    const tracks = [
      { id: 't_entry', from: nodes.start, to: nodes.n1, nextTracks: ['t_to_s1'] },
      { id: 't_to_s1', from: nodes.n1, to: nodes.s1, nextTracks: [] },
      { id: 't_s1_up', from: nodes.s1, to: nodes.upper, nextTracks: [] },
      { id: 't_s1_down', from: nodes.s1, to: nodes.s2_pos, nextTracks: [] },
      { id: 't_s2_a', from: nodes.s2_pos, to: nodes.lower_a, nextTracks: [] },
      { id: 't_s2_b', from: nodes.s2_pos, to: nodes.lower_b, nextTracks: [] },
    ];

    const switches = [
      { id: 's1', position: nodes.s1, state: 0, inputTrack: 't_to_s1', outputTracks: ['t_s1_up', 't_s1_down'], directions: ['RED', 'SWITCH →'] },
      { id: 's2', position: nodes.s2_pos, state: 0, inputTrack: 't_s1_down', outputTracks: ['t_s2_a', 't_s2_b'], directions: ['BLUE', 'GREEN'] },
    ];

    const stations = [
      { id: 'st_red', color: 'red', colorName: 'red', position: nodes.upper, trackId: 't_s1_up' },
      { id: 'st_blue', color: 'blue', colorName: 'blue', position: nodes.lower_a, trackId: 't_s2_a' },
      { id: 'st_green', color: 'green', colorName: 'green', position: nodes.lower_b, trackId: 't_s2_b' },
    ];

    return { tracks, switches, stations, entryGate, nodes };
  }

  if (stationCount <= 4) {
    const nodes = {
      start: { x: startX, y: cy },
      n1: { x: width * 0.18, y: cy },
      s1: { x: width * 0.3, y: cy },
      s2_pos: { x: width * 0.5, y: height * 0.28 },
      s3_pos: { x: width * 0.5, y: height * 0.72 },
      st_a: { x: width * 0.82, y: height * 0.15 },
      st_b: { x: width * 0.82, y: height * 0.42 },
      st_c: { x: width * 0.82, y: height * 0.58 },
      st_d: { x: width * 0.82, y: height * 0.85 },
    };

    const tracks = [
      { id: 't_entry', from: nodes.start, to: nodes.n1, nextTracks: ['t_to_s1'] },
      { id: 't_to_s1', from: nodes.n1, to: nodes.s1, nextTracks: [] },
      { id: 't_s1_up', from: nodes.s1, to: nodes.s2_pos, nextTracks: [] },
      { id: 't_s1_down', from: nodes.s1, to: nodes.s3_pos, nextTracks: [] },
      { id: 't_s2_a', from: nodes.s2_pos, to: nodes.st_a, nextTracks: [] },
      { id: 't_s2_b', from: nodes.s2_pos, to: nodes.st_b, nextTracks: [] },
      { id: 't_s3_a', from: nodes.s3_pos, to: nodes.st_c, nextTracks: [] },
      { id: 't_s3_b', from: nodes.s3_pos, to: nodes.st_d, nextTracks: [] },
    ];

    const switches = [
      { id: 's1', position: nodes.s1, state: 0, inputTrack: 't_to_s1', outputTracks: ['t_s1_up', 't_s1_down'], directions: ['↑ UP', '↓ DOWN'] },
      { id: 's2', position: nodes.s2_pos, state: 0, inputTrack: 't_s1_up', outputTracks: ['t_s2_a', 't_s2_b'], directions: ['RED', 'BLUE'] },
      { id: 's3', position: nodes.s3_pos, state: 0, inputTrack: 't_s1_down', outputTracks: ['t_s3_a', 't_s3_b'], directions: ['YELLOW', 'GREEN'] },
    ];

    const stations = [
      { id: 'st_red', color: 'red', colorName: 'red', position: nodes.st_a, trackId: 't_s2_a' },
      { id: 'st_blue', color: 'blue', colorName: 'blue', position: nodes.st_b, trackId: 't_s2_b' },
      { id: 'st_yellow', color: 'yellow', colorName: 'yellow', position: nodes.st_c, trackId: 't_s3_a' },
      { id: 'st_green', color: 'green', colorName: 'green', position: nodes.st_d, trackId: 't_s3_b' },
    ];

    return { tracks, switches, stations, entryGate, nodes };
  }

  if (stationCount <= 5) {
    const nodes = {
      start: { x: startX, y: cy },
      n1: { x: width * 0.15, y: cy },
      s1: { x: width * 0.25, y: cy },
      s2_pos: { x: width * 0.42, y: height * 0.28 },
      s3_pos: { x: width * 0.42, y: height * 0.72 },
      st_a: { x: width * 0.78, y: height * 0.12 },
      st_b: { x: width * 0.78, y: height * 0.38 },
      st_c: { x: width * 0.65, y: height * 0.58 },
      s4_pos: { x: width * 0.62, y: height * 0.82 },
      st_d: { x: width * 0.85, y: height * 0.68 },
      st_e: { x: width * 0.85, y: height * 0.9 },
    };

    const tracks = [
      { id: 't_entry', from: nodes.start, to: nodes.n1, nextTracks: ['t_to_s1'] },
      { id: 't_to_s1', from: nodes.n1, to: nodes.s1, nextTracks: [] },
      { id: 't_s1_up', from: nodes.s1, to: nodes.s2_pos, nextTracks: [] },
      { id: 't_s1_down', from: nodes.s1, to: nodes.s3_pos, nextTracks: [] },
      { id: 't_s2_a', from: nodes.s2_pos, to: nodes.st_a, nextTracks: [] },
      { id: 't_s2_b', from: nodes.s2_pos, to: nodes.st_b, nextTracks: [] },
      { id: 't_s3_a', from: nodes.s3_pos, to: nodes.st_c, nextTracks: [] },
      { id: 't_s3_b', from: nodes.s3_pos, to: nodes.s4_pos, nextTracks: [] },
      { id: 't_s4_a', from: nodes.s4_pos, to: nodes.st_d, nextTracks: [] },
      { id: 't_s4_b', from: nodes.s4_pos, to: nodes.st_e, nextTracks: [] },
    ];

    const switches = [
      { id: 's1', position: nodes.s1, state: 0, inputTrack: 't_to_s1', outputTracks: ['t_s1_up', 't_s1_down'], directions: ['↑ UP', '↓ DOWN'] },
      { id: 's2', position: nodes.s2_pos, state: 0, inputTrack: 't_s1_up', outputTracks: ['t_s2_a', 't_s2_b'], directions: ['RED', 'BLUE'] },
      { id: 's3', position: nodes.s3_pos, state: 0, inputTrack: 't_s1_down', outputTracks: ['t_s3_a', 't_s3_b'], directions: ['YELLOW', 'SWITCH →'] },
      { id: 's4', position: nodes.s4_pos, state: 0, inputTrack: 't_s3_b', outputTracks: ['t_s4_a', 't_s4_b'], directions: ['GREEN', 'PURPLE'] },
    ];

    const stations = [
      { id: 'st_red', color: 'red', colorName: 'red', position: nodes.st_a, trackId: 't_s2_a' },
      { id: 'st_blue', color: 'blue', colorName: 'blue', position: nodes.st_b, trackId: 't_s2_b' },
      { id: 'st_yellow', color: 'yellow', colorName: 'yellow', position: nodes.st_c, trackId: 't_s3_a' },
      { id: 'st_green', color: 'green', colorName: 'green', position: nodes.st_d, trackId: 't_s4_a' },
      { id: 'st_purple', color: 'purple', colorName: 'purple', position: nodes.st_e, trackId: 't_s4_b' },
    ];

    return { tracks, switches, stations, entryGate, nodes };
  }

  // Full 8-station layout
  const scale = Math.min(width, height) / 900;
  const nodes = {
    start: { x: startX, y: cy },
    n1: { x: 160 * scale, y: cy },
    s1: { x: 260 * scale, y: cy },
    n2a: { x: 360 * scale, y: cy - 140 * scale },
    s2: { x: 460 * scale, y: cy - 140 * scale },
    n2b: { x: 360 * scale, y: cy + 140 * scale },
    s3: { x: 460 * scale, y: cy + 140 * scale },
    n3a: { x: 560 * scale, y: cy - 220 * scale },
    n3b: { x: 560 * scale, y: cy - 60 * scale },
    n3c: { x: 560 * scale, y: cy + 60 * scale },
    n3d: { x: 560 * scale, y: cy + 220 * scale },
    st_purple: { x: 720 * scale, y: 80 * scale },
    st_pink: { x: 720 * scale, y: 180 * scale },
    st_red: { x: width - 80 * scale, y: 140 * scale },
    st_blue: { x: width - 80 * scale, y: cy - 60 * scale },
    st_yellow: { x: width - 80 * scale, y: cy + 60 * scale },
    st_green: { x: width - 80 * scale, y: height - 140 * scale },
    st_cyan: { x: 720 * scale, y: height - 180 * scale },
    st_orange: { x: 720 * scale, y: height - 80 * scale },
  };

  const tracks = [
    { id: 't_entry', from: nodes.start, to: nodes.n1, nextTracks: ['t_to_s1'] },
    { id: 't_to_s1', from: nodes.n1, to: nodes.s1, nextTracks: [] },
    { id: 't_s1_up', from: nodes.s1, to: nodes.n2a, nextTracks: ['t_to_s2'] },
    { id: 't_to_s2', from: nodes.n2a, to: nodes.s2, nextTracks: [] },
    { id: 't_s1_down', from: nodes.s1, to: nodes.n2b, nextTracks: ['t_to_s3'] },
    { id: 't_to_s3', from: nodes.n2b, to: nodes.s3, nextTracks: [] },
    { id: 't_s2_up', from: nodes.s2, to: nodes.n3a, nextTracks: ['t_to_purple', 't_to_pink'] },
    { id: 't_s2_down', from: nodes.s2, to: nodes.n3b, nextTracks: ['t_to_red', 't_to_blue'] },
    { id: 't_s3_up', from: nodes.s3, to: nodes.n3c, nextTracks: ['t_to_yellow', 't_to_green'] },
    { id: 't_s3_down', from: nodes.s3, to: nodes.n3d, nextTracks: ['t_to_cyan', 't_to_orange'] },
    { id: 't_to_purple', from: nodes.n3a, to: nodes.st_purple, nextTracks: [] },
    { id: 't_to_pink', from: nodes.n3a, to: nodes.st_pink, nextTracks: [] },
    { id: 't_to_red', from: nodes.n3b, to: nodes.st_red, nextTracks: [] },
    { id: 't_to_blue', from: nodes.n3b, to: nodes.st_blue, nextTracks: [] },
    { id: 't_to_yellow', from: nodes.n3c, to: nodes.st_yellow, nextTracks: [] },
    { id: 't_to_green', from: nodes.n3c, to: nodes.st_green, nextTracks: [] },
    { id: 't_to_cyan', from: nodes.n3d, to: nodes.st_cyan, nextTracks: [] },
    { id: 't_to_orange', from: nodes.n3d, to: nodes.st_orange, nextTracks: [] },
  ];

  const switches = [
    { id: 's1', position: nodes.s1, state: 0, inputTrack: 't_to_s1', outputTracks: ['t_s1_up', 't_s1_down'], directions: ['↑ UP', '↓ DOWN'] },
    { id: 's2', position: nodes.s2, state: 0, inputTrack: 't_to_s2', outputTracks: ['t_s2_up', 't_s2_down'], directions: ['↖ PURPLE/PINK', '↗ RED/BLUE'] },
    { id: 's3', position: nodes.s3, state: 0, inputTrack: 't_to_s3', outputTracks: ['t_s3_up', 't_s3_down'], directions: ['↗ YELLOW/GREEN', '↘ CYAN/ORANGE'] },
    { id: 's4', position: nodes.n3a, state: 0, inputTrack: 't_s2_up', outputTracks: ['t_to_purple', 't_to_pink'], directions: ['PURPLE', 'PINK'] },
    { id: 's5', position: nodes.n3b, state: 0, inputTrack: 't_s2_down', outputTracks: ['t_to_red', 't_to_blue'], directions: ['RED', 'BLUE'] },
    { id: 's6', position: nodes.n3c, state: 0, inputTrack: 't_s3_up', outputTracks: ['t_to_yellow', 't_to_green'], directions: ['YELLOW', 'GREEN'] },
    { id: 's7', position: nodes.n3d, state: 0, inputTrack: 't_s3_down', outputTracks: ['t_to_cyan', 't_to_orange'], directions: ['CYAN', 'ORANGE'] },
  ];

  const stations = [
    { id: 'st_red', color: 'red', colorName: 'red', position: nodes.st_red, trackId: 't_to_red' },
    { id: 'st_blue', color: 'blue', colorName: 'blue', position: nodes.st_blue, trackId: 't_to_blue' },
    { id: 'st_yellow', color: 'yellow', colorName: 'yellow', position: nodes.st_yellow, trackId: 't_to_yellow' },
    { id: 'st_green', color: 'green', colorName: 'green', position: nodes.st_green, trackId: 't_to_green' },
    { id: 'st_purple', color: 'purple', colorName: 'purple', position: nodes.st_purple, trackId: 't_to_purple' },
    { id: 'st_orange', color: 'orange', colorName: 'orange', position: nodes.st_orange, trackId: 't_to_orange' },
    { id: 'st_pink', color: 'pink', colorName: 'pink', position: nodes.st_pink, trackId: 't_to_pink' },
    { id: 'st_cyan', color: 'cyan', colorName: 'cyan', position: nodes.st_cyan, trackId: 't_to_cyan' },
  ];

  return { tracks, switches, stations, entryGate, nodes };
};

// ============================================================================
// COMPONENT
// ============================================================================

const TrainOfThought = () => {
  const containerRef = useRef(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [layout, setLayout] = useState(() => createTrackLayout(1200, 800));
  const [switches, setSwitches] = useState(layout.switches);
  const [trains, setTrains] = useState([]);
  const [gameState, setGameState] = useState({
    phase: 'menu',
    score: 0,
    timeElapsed: 0,
    correctDeliveries: 0,
    wrongDeliveries: 0,
  });
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [trainQueue, setTrainQueue] = useState([]);
  const [releasedCount, setReleasedCount] = useState(0);
  const [hoveredSwitch, setHoveredSwitch] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [autoStartLevel, setAutoStartLevel] = useState(null);
  const [dailyGameDifficulty, setDailyGameDifficulty] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);

  const animationRef = useRef();
  const lastTimeRef = useRef(0);
  const trainReleaseTimerRef = useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
        setIsSmallScreen(clientWidth < 900 || clientHeight < 500);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const checkOrientation = () => {
      const isSmall = window.innerWidth < 768;
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(isSmall && portrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const getStationCountForDifficulty = useCallback((difficulty, small) => {
    if (!small) return 8;
    switch (difficulty) {
      case 'easy': return 3;
      case 'moderate': return 4;
      case 'hard': return 5;
      default: return 8;
    }
  }, []);

  const initializeTrainQueue = useCallback((stationColors, trainCount) => {
    const shuffled = [...stationColors].sort(() => Math.random() - 0.5);
    setTrainQueue(shuffled.slice(0, trainCount));
  }, []);

  const startGame = useCallback((difficulty) => {
    const config = LEVEL_CONFIGS[difficulty];
    setCurrentDifficulty(difficulty);
    
    const stationCount = getStationCountForDifficulty(difficulty, isSmallScreen);
    const newLayout = createTrackLayout(dimensions.width, dimensions.height, stationCount);
    setLayout(newLayout);
    setSwitches(newLayout.switches);
    setTrains([]);
    setReleasedCount(0);
    trainReleaseTimerRef.current = 0;
    lastTimeRef.current = 0;
    setCountdown(COUNTDOWN_DURATION);
    
    const availableColors = newLayout.stations.map(s => s.colorName);
    initializeTrainQueue(availableColors, config.trainCount);
    
    setGameState({
      phase: 'countdown',
      score: 0,
      timeElapsed: 0,
      correctDeliveries: 0,
      wrongDeliveries: 0,
    });
  }, [dimensions, isSmallScreen, initializeTrainQueue, getStationCountForDifficulty]);

  // Check if game is in daily suggestions
  useEffect(() => {
    const checkDailyGame = async () => {
      try {
        setCheckingDailyGame(true);
        const result = await getDailySuggestions();
        const games = result?.data?.suggestion?.games || [];
        const pathname = location.pathname || '';
        
        const normalizePath = (p = '') => {
          const base = String(p).split('?')[0].split('#')[0].trim();
          const noTrailing = base.replace(/\/+$/, '');
          return noTrailing || '/';
        };
        
        const matchedGame = games.find(
          (g) => normalizePath(g?.gameId?.url) === normalizePath(pathname)
        );
        
        if (matchedGame && matchedGame.difficulty) {
          const difficulty = matchedGame.difficulty.toLowerCase();
          if (['easy', 'moderate', 'hard'].includes(difficulty)) {
            setIsDailyGame(true);
            setDailyGameDifficulty(difficulty);
          }
        }
      } catch (error) {
        console.error('Error checking daily game:', error);
      } finally {
        setCheckingDailyGame(false);
      }
    };
    
    checkDailyGame();
  }, [location.pathname, startGame]);

  // Handle URL parameter for auto-start (only if not daily game)
  useEffect(() => {
    if (isDailyGame || checkingDailyGame) return;
    
    const levelParam = searchParams.get('level');
    if (levelParam && ['easy', 'moderate', 'hard'].includes(levelParam.toLowerCase())) {
      setAutoStartLevel(levelParam.toLowerCase());
      startGame(levelParam.toLowerCase());
    }
  }, [searchParams, startGame, isDailyGame, checkingDailyGame]);

  useEffect(() => {
    if (gameState.phase !== 'countdown') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setGameState((s) => ({ ...s, phase: 'playing' }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.phase]);

  const getTrack = useCallback((trackId) => {
    return layout.tracks.find((t) => t.id === trackId);
  }, [layout.tracks]);

  const getPositionOnTrack = useCallback((track, progress) => {
    return {
      x: track.from.x + (track.to.x - track.from.x) * progress,
      y: track.from.y + (track.to.y - track.from.y) * progress,
    };
  }, []);

  const getAngleOnTrack = useCallback((track) => {
    const dx = track.to.x - track.from.x;
    const dy = track.to.y - track.from.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, []);

  const findNextTrack = useCallback((currentTrackId) => {
    for (const sw of switches) {
      if (sw.inputTrack === currentTrackId) {
        return sw.state === 0 ? sw.outputTracks[0] : sw.outputTracks[1];
      }
    }

    const currentTrack = getTrack(currentTrackId);
    if (currentTrack && currentTrack.nextTracks.length > 0) {
      return currentTrack.nextTracks[0];
    }

    return null;
  }, [switches, getTrack]);

  const checkStationArrival = useCallback((train) => {
    for (const station of layout.stations) {
      const dx = train.position.x - station.position.x;
      const dy = train.position.y - station.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 40) {
        return station;
      }
    }
    return null;
  }, [layout.stations]);

  const releaseTrain = useCallback(() => {
    if (!currentDifficulty) return;
    if (releasedCount >= trainQueue.length) return;

    const colorName = trainQueue[releasedCount];
    const color = COLORS[colorName];
    const targetStation = layout.stations.find((s) => s.colorName === colorName);

    if (!targetStation || !color) return;

    const firstTrack = getTrack('t_entry');
    const initialAngle = firstTrack ? getAngleOnTrack(firstTrack) : 0;

    const config = LEVEL_CONFIGS[currentDifficulty];

    const newTrain = {
      id: `train_${colorName}_${Date.now()}`,
      color: color.main,
      colorName,
      position: { ...layout.entryGate },
      currentTrackId: 't_entry',
      progress: 0,
      speed: config.trainSpeed,
      status: 'moving',
      targetStationId: targetStation.id,
      angle: initialAngle,
    };

    setTrains((prev) => [...prev, newTrain]);
    setReleasedCount((prev) => prev + 1);
  }, [currentDifficulty, releasedCount, trainQueue, layout.stations, layout.entryGate, getTrack, getAngleOnTrack]);

  useEffect(() => {
    if (gameState.phase !== 'playing' || !currentDifficulty) return;

    const config = LEVEL_CONFIGS[currentDifficulty];

    const gameLoop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setGameState((prev) => {
        const newTimeElapsed = prev.timeElapsed + deltaTime;
        if (newTimeElapsed >= TIME_LIMIT_MS && prev.phase === 'playing') {
          return {
            ...prev,
            phase: 'ended',
            timeElapsed: TIME_LIMIT_MS,
          };
        }
        return { ...prev, timeElapsed: newTimeElapsed };
      });

      trainReleaseTimerRef.current += deltaTime;
      if (trainReleaseTimerRef.current >= config.releaseInterval && releasedCount < trainQueue.length) {
        releaseTrain();
        trainReleaseTimerRef.current = 0;
      }

      setTrains((prevTrains) => {
        let trainsUpdated = prevTrains.map((train) => {
          if (train.status !== 'moving') return train;

          const currentTrack = getTrack(train.currentTrackId);
          if (!currentTrack) return train;

          let newProgress = train.progress + train.speed;
          let newTrackId = train.currentTrackId;
          let newPosition = train.position;
          let newAngle = train.angle;

          if (newProgress >= 1) {
            const nextTrackId = findNextTrack(train.currentTrackId);
            if (nextTrackId) {
              const nextTrack = getTrack(nextTrackId);
              if (nextTrack) {
                newTrackId = nextTrackId;
                newProgress = 0;
                newPosition = { ...nextTrack.from };
                newAngle = getAngleOnTrack(nextTrack);
              }
            } else {
              newProgress = 1;
              newPosition = getPositionOnTrack(currentTrack, 1);
            }
          } else {
            newPosition = getPositionOnTrack(currentTrack, newProgress);
            newAngle = getAngleOnTrack(currentTrack);
          }

          return {
            ...train,
            progress: newProgress,
            currentTrackId: newTrackId,
            position: newPosition,
            angle: newAngle,
          };
        });

        trainsUpdated = trainsUpdated.map((train) => {
          if (train.status !== 'moving') return train;

          const arrivedStation = checkStationArrival(train);
          if (arrivedStation) {
            const isCorrect = arrivedStation.colorName === train.colorName;
            
            setGameState((prev) => ({
              ...prev,
              correctDeliveries: prev.correctDeliveries + (isCorrect ? 1 : 0),
              wrongDeliveries: prev.wrongDeliveries + (isCorrect ? 0 : 1),
              score: Math.min(200, prev.score + (isCorrect ? Math.floor(TOTAL_POINTS / trainQueue.length) : 0)),
            }));

            return {
              ...train,
              status: isCorrect ? 'arrived' : 'wrong',
            };
          }
          return train;
        });

        return trainsUpdated;
      });

      setTrains((currentTrains) => {
        const allFinished = currentTrains.length === trainQueue.length && 
          currentTrains.every((t) => t.status === 'arrived' || t.status === 'wrong');
        
        if (allFinished && currentTrains.length > 0) {
          setGameState((prev) => {
            if (prev.phase === 'ended') return prev;
            return {
              ...prev,
              phase: 'ended',
            };
          });
        }
        return currentTrains;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (releasedCount === 0) {
      releaseTrain();
    }

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.phase, trainQueue.length, releasedCount, releaseTrain, getTrack, findNextTrack, getPositionOnTrack, getAngleOnTrack, checkStationArrival, currentDifficulty]);

  const toggleSwitch = (switchId) => {
    setSwitches((prev) =>
      prev.map((sw) =>
        sw.id === switchId ? { ...sw, state: sw.state === 0 ? 1 : 0 } : sw
      )
    );
  };

  const backToMenu = () => {
    setGameState((prev) => ({ ...prev, phase: 'menu' }));
    setCurrentDifficulty(null);
    setTrains([]);
  };

  const playAgain = () => {
    if (currentDifficulty) {
      startGame(currentDifficulty);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (ms) => {
    const remaining = Math.max(0, TIME_LIMIT_MS - ms);
    return formatTime(remaining);
  };

  const getSwitchColor = (sw) => {
    const direction = sw.directions[sw.state];
    if (direction.includes('PURPLE')) return COLORS.purple.main;
    if (direction.includes('PINK')) return COLORS.pink.main;
    if (direction.includes('RED')) return COLORS.red.main;
    if (direction.includes('BLUE')) return COLORS.blue.main;
    if (direction.includes('YELLOW')) return COLORS.yellow.main;
    if (direction.includes('GREEN')) return COLORS.green.main;
    if (direction.includes('CYAN')) return COLORS.cyan.main;
    if (direction.includes('ORANGE')) return COLORS.orange.main;
    if (direction.includes('UP')) return '#4CAF50';
    if (direction.includes('DOWN')) return '#FF9800';
    return '#4CAF50';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { main: '#4CAF50', light: '#81C784', dark: '#2E7D32' };
      case 'moderate': return { main: '#FF9800', light: '#FFB74D', dark: '#EF6C00' };
      case 'hard': return { main: '#F44336', light: '#E57373', dark: '#C62828' };
      default: return { main: '#4CAF50', light: '#81C784', dark: '#2E7D32' };
    }
  };

  const timeRemainingMs = TIME_LIMIT_MS - gameState.timeElapsed;
  const isTimeLow = timeRemainingMs < 60000 && timeRemainingMs > 0;

  const isCompact = dimensions.width < 700 || dimensions.height < 400;
  const stationSize = isCompact ? 0.6 : 1;
  const switchRadius = isCompact ? 18 : 28;
  const switchRadiusHover = isCompact ? 22 : 32;
  const trainScale = isCompact ? 0.7 : 1;

  return (
    <div ref={containerRef} style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(180deg, #1a4a3a 0%, #0d2a20 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
    }}>
      {/* ROTATE DEVICE OVERLAY */}
      {isPortrait && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #1a3a5f 0%, #0a1a2f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '40px',
        }}>
          <div style={{
            textAlign: 'center',
            color: '#ffffff',
          }}>
            <div style={{ fontSize: '80px', marginBottom: '24px', animation: 'spin 2s ease-in-out infinite' }}>
              📱
            </div>
            <style>{`@keyframes spin { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(90deg); } }`}</style>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>
              Please Rotate Your Device
            </div>
            <p style={{ fontSize: '16px', opacity: 0.8, maxWidth: '300px', margin: '0 auto', lineHeight: 1.6 }}>
              🚂 Train of Thought is best played in landscape mode. Please turn your device sideways to play!
            </p>
          </div>
        </div>
      )}

      {/* LEVEL SELECTION MENU */}
      {gameState.phase === 'menu' && !checkingDailyGame && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #1a3a5f 0%, #0a1a2f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
        }}>
          <div style={{
            textAlign: 'center',
            color: '#ffffff',
            maxWidth: '900px',
            padding: isCompact ? '16px' : '40px',
          }}>
            <div style={{ fontSize: isCompact ? '28px' : '52px', marginBottom: '8px', fontWeight: 'bold' }}>
              🚂 Train of Thought
            </div>
            <p style={{ marginBottom: '8px', opacity: 0.8, fontSize: isCompact ? '13px' : '18px' }}>
              Route colored trains to matching stations by controlling the track switches!
            </p>
            <p style={{ marginBottom: isCompact ? '20px' : '40px', opacity: 0.6, fontSize: isCompact ? '11px' : '14px' }}>
              ⏱️ You have 5 minutes to route all trains correctly.
              {isSmallScreen && ' (Simplified map for your screen)'}
            </p>

            {/* Daily Game Badge */}
            {isDailyGame && dailyGameDifficulty && (
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                padding: '8px 20px',
                borderRadius: '20px',
                marginBottom: '20px',
                fontSize: isCompact ? '12px' : '14px',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
              }}>
                🎯 Daily Challenge: {dailyGameDifficulty.charAt(0).toUpperCase() + dailyGameDifficulty.slice(1)}
              </div>
            )}

            <h2 style={{ fontSize: isCompact ? '18px' : '28px', marginBottom: isCompact ? '12px' : '24px', color: '#ffd700' }}>
              {autoStartLevel 
                ? `Playing: ${autoStartLevel.charAt(0).toUpperCase() + autoStartLevel.slice(1)}` 
                : 'Select Difficulty'}
            </h2>
            {/* How to Play Button */}
            {!isDailyGame && (
              <button
                onClick={() => setShowInstructions(true)}
                style={{
                  position: 'absolute',
                  top: isCompact ? '16px' : '24px',
                  right: isCompact ? '16px' : '24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: isCompact ? '10px 16px' : '12px 24px',
                  color: '#fff',
                  fontSize: isCompact ? '13px' : '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  zIndex: 301,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                📖 How to Play
              </button>
            )}

            <div style={{ display: 'flex', gap: isCompact ? '12px' : '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {isDailyGame && dailyGameDifficulty
                ? [dailyGameDifficulty].map((diff) => {
                    const colors = getDifficultyColor(diff);
                    const config = LEVEL_CONFIGS[diff];
                    const stCount = getStationCountForDifficulty(diff, isSmallScreen);
                    return (
                      <button
                        key={diff}
                        onClick={() => startGame(diff)}
                        style={{
                          background: `linear-gradient(180deg, ${colors.light} 0%, ${colors.main} 50%, ${colors.dark} 100%)`,
                          border: 'none',
                          borderRadius: isCompact ? '10px' : '16px',
                          padding: isCompact ? '14px 24px' : '30px 50px',
                          cursor: 'pointer',
                          color: '#fff',
                          fontSize: isCompact ? '16px' : '22px',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                          textAlign: 'center',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
                          e.currentTarget.style.boxShadow = `0 10px 30px ${colors.main}55`;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
                        }}
                      >
                        <div style={{ fontSize: isCompact ? '24px' : '40px', marginBottom: '4px' }}>
                          {diff === 'easy' ? '🌱' : diff === 'moderate' ? '⚡' : '🔥'}
                        </div>
                        {diff}
                        <div style={{ fontSize: isCompact ? '10px' : '13px', opacity: 0.9, marginTop: '4px', fontWeight: 'normal' }}>
                          {config.trainCount} trains • {stCount} stations
                        </div>
                      </button>
                    );
                  })
                : autoStartLevel
                  ? [autoStartLevel].map((diff) => {
                      const colors = getDifficultyColor(diff);
                      const config = LEVEL_CONFIGS[diff];
                      const stCount = getStationCountForDifficulty(diff, isSmallScreen);
                      return (
                        <div
                          key={diff}
                          style={{
                            background: `linear-gradient(180deg, ${colors.light} 0%, ${colors.main} 50%, ${colors.dark} 100%)`,
                            borderRadius: isCompact ? '10px' : '16px',
                            padding: isCompact ? '14px 24px' : '30px 50px',
                            color: '#fff',
                            fontSize: isCompact ? '16px' : '22px',
                            fontWeight: 'bold',
                            textTransform: 'capitalize',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: isCompact ? '24px' : '40px', marginBottom: '4px' }}>
                            {diff === 'easy' ? '🌱' : diff === 'moderate' ? '⚡' : '🔥'}
                          </div>
                          {diff}
                          <div style={{ fontSize: isCompact ? '10px' : '13px', opacity: 0.9, marginTop: '4px', fontWeight: 'normal' }}>
                            {config.trainCount} trains • {stCount} stations
                          </div>
                        </div>
                      );
                    })
                  : ['easy', 'moderate', 'hard'].map((diff) => {
                    const colors = getDifficultyColor(diff);
                    const config = LEVEL_CONFIGS[diff];
                    const stCount = getStationCountForDifficulty(diff, isSmallScreen);
                    return (
                      <button
                        key={diff}
                        onClick={() => startGame(diff)}
                        style={{
                          background: `linear-gradient(180deg, ${colors.light} 0%, ${colors.main} 50%, ${colors.dark} 100%)`,
                          border: 'none',
                          borderRadius: isCompact ? '10px' : '16px',
                          padding: isCompact ? '14px 24px' : '30px 50px',
                          cursor: 'pointer',
                          color: '#fff',
                          fontSize: isCompact ? '16px' : '22px',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
                          e.currentTarget.style.boxShadow = `0 10px 30px ${colors.main}55`;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
                        }}
                      >
                        <div style={{ fontSize: isCompact ? '24px' : '40px', marginBottom: '4px' }}>
                          {diff === 'easy' ? '🌱' : diff === 'moderate' ? '⚡' : '🔥'}
                        </div>
                        {diff}
                        <div style={{ fontSize: isCompact ? '10px' : '13px', opacity: 0.9, marginTop: '4px', fontWeight: 'normal' }}>
                          {config.trainCount} trains • {stCount} stations
                        </div>
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>
      )}

      {/* Loading Check */}
      {checkingDailyGame && gameState.phase === 'menu' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #1a3a5f 0%, #0a1a2f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
        }}>
          <div style={{
            textAlign: 'center',
            color: '#ffffff',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚂</div>
            <div style={{ fontSize: '18px', opacity: 0.8 }}>Loading...</div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }} onClick={() => setShowInstructions(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a3a5f 0%, #0a1a2f 100%)',
            borderRadius: '20px',
            padding: isCompact ? '20px' : '40px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            position: 'relative',
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ✕
            </button>

            <h2 style={{
              fontSize: isCompact ? '24px' : '32px',
              fontWeight: 'bold',
              marginBottom: '8px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              🚂 How to Play Train of Thought
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isCompact ? '1fr' : 'repeat(2, 1fr)',
              gap: '20px',
              marginTop: '24px',
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#4CAF50',
                }}>
                  🎯 Objective
                </h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  opacity: 0.9,
                }}>
                  Route colored trains to their matching colored stations by controlling track switches. Get all trains to the correct stations within the time limit!
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#2196F3',
                }}>
                  🎮 Controls
                </h3>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  opacity: 0.9,
                  paddingLeft: '20px',
                }}>
                  <li>Click on switches to change track direction</li>
                  <li>Each switch has two possible routes</li>
                  <li>Watch the colored indicators on switches</li>
                  <li>Plan your route before trains arrive</li>
                </ul>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#FF9800',
                }}>
                  📊 Scoring
                </h3>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  opacity: 0.9,
                  paddingLeft: '20px',
                }}>
                  <li>Correct delivery: Earn points</li>
                  <li>Wrong station: No points</li>
                  <li>Maximum score: 200 points</li>
                  <li>Time limit: 5 minutes</li>
                </ul>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#9C27B0',
                }}>
                  💡 Difficulty Levels
                </h3>
                <ul style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  opacity: 0.9,
                  paddingLeft: '20px',
                }}>
                  <li><strong>Easy:</strong> 3 trains, slower speed</li>
                  <li><strong>Moderate:</strong> 4 trains, medium speed</li>
                  <li><strong>Hard:</strong> 5 trains, faster speed</li>
                  <li>More trains = higher challenge!</li>
                </ul>
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(76, 175, 80, 0.15)',
              borderRadius: '12px',
              border: '1px solid rgba(76, 175, 80, 0.3)',
            }}>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.6',
                opacity: 0.95,
                textAlign: 'center',
                fontWeight: 500,
              }}>
                💡 <strong>Pro Tip:</strong> Look at the "NEXT" queue at the bottom to see upcoming trains. Plan your switch positions in advance for maximum efficiency!
              </p>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              Got it! Let's Play 🚂
            </button>
          </div>
        </div>
      )}

      {/* GAME CANVAS */}
      {gameState.phase !== 'menu' && (
        <svg style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}>
          <defs>
            {Object.entries(COLORS).map(([name, colors]) => (
              <linearGradient key={`grad-${name}`} id={`train-gradient-${name}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.light} />
                <stop offset="50%" stopColor={colors.main} />
                <stop offset="100%" stopColor={colors.dark} />
              </linearGradient>
            ))}
            
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Draw tracks - gravel bed */}
          {layout.tracks.map((track) => (
            <line
              key={`bed-${track.id}`}
              x1={track.from.x}
              y1={track.from.y}
              x2={track.to.x}
              y2={track.to.y}
              stroke="#3a3a3a"
              strokeWidth={isCompact ? 12 : 18}
              strokeLinecap="round"
            />
          ))}

          {/* Draw tracks - rails */}
          {layout.tracks.map((track) => (
            <g key={`rails-${track.id}`}>
              <line
                x1={track.from.x}
                y1={track.from.y}
                x2={track.to.x}
                y2={track.to.y}
                stroke="#666"
                strokeWidth={isCompact ? 3 : 4}
                strokeLinecap="round"
              />
              <line
                x1={track.from.x}
                y1={track.from.y}
                x2={track.to.x}
                y2={track.to.y}
                stroke="#888"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 8"
              />
            </g>
          ))}

          {/* Draw active track highlight for switches */}
          {switches.map((sw) => {
            const activeTrackId = sw.state === 0 ? sw.outputTracks[0] : sw.outputTracks[1];
            const activeTrack = getTrack(activeTrackId);
            if (!activeTrack) return null;
            return (
              <line
                key={`active-${sw.id}`}
                x1={activeTrack.from.x}
                y1={activeTrack.from.y}
                x2={activeTrack.to.x}
                y2={activeTrack.to.y}
                stroke={getSwitchColor(sw)}
                strokeWidth={isCompact ? 4 : 6}
                strokeLinecap="round"
                opacity="0.6"
              />
            );
          })}

          {/* Draw entry gate */}
          <g transform={`translate(${layout.entryGate.x}, ${layout.entryGate.y})`}>
            <rect x={-30 * stationSize} y={-40 * stationSize} width={60 * stationSize} height={80 * stationSize} fill="#2a2a2a" rx="4" stroke="#555" strokeWidth="2" />
            <rect x={-20 * stationSize} y={-10 * stationSize} width={40 * stationSize} height={50 * stationSize} fill="#1a1a1a" rx="2" />
            <text x={0} y={-25 * stationSize} textAnchor="middle" fill="#ffd700" fontSize={isCompact ? 8 : 10} fontWeight="bold">GATE</text>
          </g>

          {/* Draw stations */}
          {layout.stations.map((station) => {
            const colors = COLORS[station.color];
            if (!colors) return null;
            const s = stationSize;
            return (
              <g key={station.id} transform={`translate(${station.position.x}, ${station.position.y}) scale(${s})`}>
                <rect x={-50} y={20} width={100} height={10} fill="#555" rx="2" />
                <rect x={-45} y={-30} width={90} height={50} fill={colors.main} rx="4" stroke={colors.dark} strokeWidth="2" />
                <polygon points={`-55,-30 0,-55 55,-30`} fill={colors.dark} />
                <rect x={-12} y={-15} width={24} height={35} fill="#1a1a1a" rx="3" />
                <rect x={-38} y={-22} width={18} height={14} fill="#87ceeb" rx="2" />
                <rect x={20} y={-22} width={18} height={14} fill="#87ceeb" rx="2" />
                <rect x={-30} y={-52} width={60} height={18} fill="#ffffff" rx="3" stroke={colors.main} strokeWidth="2" />
                <text x={0} y={-39} textAnchor="middle" fill={colors.dark} fontSize="11" fontWeight="bold">
                  {station.colorName.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Draw switches */}
          {switches.map((sw) => {
            const isHovered = hoveredSwitch === sw.id;
            const currentDirection = sw.directions[sw.state];
            const switchColor = getSwitchColor(sw);
            const r = isHovered ? switchRadiusHover : switchRadius;
            const innerR = isCompact ? 12 : 18;
            
            return (
              <g
                key={sw.id}
                onClick={() => toggleSwitch(sw.id)}
                onMouseEnter={() => setHoveredSwitch(sw.id)}
                onMouseLeave={() => setHoveredSwitch(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={sw.position.x}
                  cy={sw.position.y}
                  r={r}
                  fill="rgba(0,0,0,0.8)"
                  stroke={switchColor}
                  strokeWidth={isCompact ? 3 : 4}
                  filter={isHovered ? "url(#glow)" : undefined}
                />
                <circle
                  cx={sw.position.x}
                  cy={sw.position.y}
                  r={innerR}
                  fill={switchColor}
                />
                <text
                  x={sw.position.x}
                  y={sw.position.y + 5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isCompact ? 10 : 14}
                  fontWeight="bold"
                >
                  {sw.state === 0 ? '◀' : '▶'}
                </text>
                <rect
                  x={sw.position.x - (isCompact ? 32 : 45)}
                  y={sw.position.y + (isCompact ? 22 : 32)}
                  width={isCompact ? 64 : 90}
                  height={isCompact ? 16 : 22}
                  fill="rgba(0,0,0,0.9)"
                  rx="4"
                  stroke={switchColor}
                  strokeWidth="2"
                />
                <text
                  x={sw.position.x}
                  y={sw.position.y + (isCompact ? 34 : 47)}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isCompact ? 8 : 10}
                  fontWeight="bold"
                >
                  {currentDirection}
                </text>
                {isHovered && !isCompact && (
                  <text
                    x={sw.position.x}
                    y={sw.position.y - 38}
                    textAnchor="middle"
                    fill="#ffff00"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    CLICK TO SWITCH
                  </text>
                )}
              </g>
            );
          })}

          {/* Draw trains */}
          {trains.map((train) => {
            const colorData = COLORS[train.colorName];
            if (!colorData) return null;
            
            return (
              <g 
                key={train.id} 
                transform={`translate(${train.position.x}, ${train.position.y}) rotate(${train.angle}) scale(${trainScale})`}
                filter="url(#shadow)"
              >
                <rect
                  x={-28}
                  y={-16}
                  width="56"
                  height="32"
                  fill={`url(#train-gradient-${train.colorName})`}
                  rx="8"
                  stroke={train.status === 'arrived' ? '#00FF00' : train.status === 'wrong' ? '#FF0000' : '#fff'}
                  strokeWidth={train.status === 'moving' ? 2 : 4}
                />
                <rect x={22} y={-12} width="12" height="24" fill={colorData.dark} rx="4" />
                <rect x={-22} y={-12} width="36" height="14" fill="#87ceeb" rx="3" opacity="0.9" />
                <rect x={-20} y={-10} width="32" height="4" fill="#fff" rx="2" opacity="0.4" />
                <circle cx={-14} cy={16} r="7" fill="#222" stroke="#444" strokeWidth="2" />
                <circle cx={14} cy={16} r="7" fill="#222" stroke="#444" strokeWidth="2" />
                <rect x={16} y={-24} width="10" height="12" fill={colorData.dark} rx="2" />
                <rect x={-20} y={2} width="40" height="12" fill="rgba(0,0,0,0.5)" rx="2" />
                <text x="0" y="11" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
                  {train.colorName.toUpperCase()}
                </text>
                {train.status !== 'moving' && (
                  <g transform="translate(0, -30)">
                    <circle r="12" fill={train.status === 'arrived' ? '#4CAF50' : '#F44336'} stroke="#fff" strokeWidth="2" />
                    <text y="4" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
                      {train.status === 'arrived' ? '✓' : '✗'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      )}

      {/* HUD */}
      {gameState.phase === 'playing' && currentDifficulty && (
        <>
          <div style={{
            position: 'absolute',
            top: isCompact ? '8px' : '20px',
            left: isCompact ? '8px' : '20px',
            display: 'flex',
            gap: isCompact ? '6px' : '16px',
            zIndex: 100,
            flexWrap: 'wrap',
          }}>
            {[
              { icon: '📊', label: 'Difficulty', value: currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1) },
              { icon: '⏱️', label: 'Time Left', value: formatTimeRemaining(gameState.timeElapsed), highlight: isTimeLow }
            ].map((item, idx) => (
              <div key={idx} style={{
                background: 'rgba(0,0,0,0.85)',
                padding: isCompact ? '6px 10px' : '12px 20px',
                borderRadius: isCompact ? '8px' : '12px',
                border: `2px solid ${item.highlight ? '#F44336' : 'rgba(255,255,255,0.2)'}`,
              }}>
                <div style={{ fontSize: isCompact ? '9px' : '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontSize: isCompact ? '14px' : '22px', color: item.highlight ? '#F44336' : '#ffffff', fontWeight: 'bold' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Train Queue */}
          <div style={{
            position: 'absolute',
            bottom: isCompact ? '8px' : '20px',
            left: isCompact ? '8px' : '20px',
            display: 'flex',
            alignItems: 'center',
            gap: isCompact ? '6px' : '12px',
            background: 'rgba(0,0,0,0.85)',
            padding: isCompact ? '6px 10px' : '12px 20px',
            borderRadius: isCompact ? '8px' : '12px',
            border: '2px solid rgba(255,255,255,0.2)',
            zIndex: 100,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: isCompact ? '10px' : '14px', fontWeight: 'bold' }}>NEXT:</span>
            {trainQueue.slice(releasedCount, releasedCount + 5).map((colorName, idx) => {
              const colors = COLORS[colorName];
              if (!colors) return null;
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: isCompact ? '28px' : '44px',
                    height: isCompact ? '18px' : '28px',
                    background: `linear-gradient(180deg, ${colors.light} 0%, ${colors.main} 50%, ${colors.dark} 100%)`,
                    borderRadius: '4px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    opacity: idx === 0 ? 1 : 0.5,
                    transform: idx === 0 ? 'scale(1.15)' : 'scale(1)',
                  }} />
                  {idx === 0 && (
                    <div style={{ color: '#fff', fontSize: isCompact ? '7px' : '9px', marginTop: '2px', fontWeight: 'bold' }}>
                      {colorName.toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        
        </>
      )}
      
      {/* Countdown Overlay */}
      {gameState.phase === 'countdown' && currentDifficulty && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #1a3a5f 0%, #0a1a2f 100%)',
            borderRadius: isCompact ? '16px' : '24px',
            padding: isCompact ? '15px 25px' : '30px 40px',
            textAlign: 'center',
            color: '#ffffff',
            border: '2px solid rgba(255,255,255,0.2)',
          }}>
            <div style={{ fontSize: isCompact ? '18px' : '32px', marginBottom: '6px', fontWeight: 'bold' }}>
              🚂 Train of Thought
            </div>
            <div style={{
              fontSize: isCompact ? '10px' : '14px',
              marginBottom: '8px',
              padding: '4px 16px',
              background: getDifficultyColor(currentDifficulty).main,
              borderRadius: '16px',
              display: 'inline-block',
            }}>
              {currentDifficulty.toUpperCase()} • {LEVEL_CONFIGS[currentDifficulty].trainCount} Trains • 5 min
            </div>
            <p style={{ marginBottom: '12px', opacity: 0.8, fontSize: isCompact ? '10px' : '14px', maxWidth: '400px', lineHeight: 1.4 }}>
              Route each colored train to its matching station by clicking switches!
            </p>
            <div style={{
              fontSize: isCompact ? '48px' : '80px',
              fontWeight: 'bold',
              color: '#ffd700',
            }}>
              {countdown}
            </div>
          </div>
        </div>
      )}

      {/* End Game Modal */}
      <GameCompletionModal
        isVisible={gameState.phase === 'ended'}
        onClose={backToMenu}
        gameTitle="Train of Thought"
        score={gameState.score}
        moves={null}
        timeElapsed={gameState.timeElapsed}
        gameTimeLimit={TIME_LIMIT_MS / 1000}
        isVictory={gameState.wrongDeliveries === 0 && gameState.correctDeliveries === trainQueue.length}
        customMessages={{
          perfectScore: 180,
          goodScore: 120,
          maxScore: 200,
          stats: `✅ Correct: ${gameState.correctDeliveries}/${trainQueue.length} • ❌ Wrong: ${gameState.wrongDeliveries} • ⏱️ Time: ${formatTime(gameState.timeElapsed)}`
        }}
      />
    </div>
  );
};

export default TrainOfThought;
