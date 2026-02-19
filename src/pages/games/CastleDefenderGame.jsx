import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getDailySuggestions } from '../../services/gameService';
import GameCompletionModal from '../../components/Game/GameCompletionModal';
import { useTranslateText } from '../../hooks/useTranslate';

/* ─────────────────────── CONSTANTS ─────────────────────── */
const TOWER_DEFS = {
  archer: { name:'Archer', cost:50, damage:10, range:3, cooldown:0.8, color:'#c9952e', accent:'#ffe082', special:'fast', desc:'Fast attack' },
  cannon: { name:'Cannon', cost:100, damage:30, range:2.5, cooldown:2.0, color:'#78909c', accent:'#ff8a65', special:'splash', desc:'Splash dmg' },
  ice:    { name:'Ice',    cost:75,  damage:5,  range:3, cooldown:1.5, color:'#4fc3f7', accent:'#b3e5fc', special:'slow', desc:'Slows 50%' },
};

const ENEMY_DEFS = {
  soldier: { name:'Soldier', hp:50,  speed:1.0, reward:10, color:'#66bb6a', size:0.45 },
  knight:  { name:'Knight',  hp:120, speed:0.7, reward:25, color:'#42a5f5', size:0.55 },
  ram:     { name:'Siege Ram',hp:300, speed:0.4, reward:50, color:'#ef5350', size:0.7  },
};

const PROJ_SPEED = 8;
const PARTICLE_MAX = 300;
const TIME_LIMIT = 180;
const MAX_SCORE = 200;

/* ─────────────────── LEVEL DEFINITIONS ─────────────────── */
const LEVELS = [
  {
    name:'Meadow', cols:12, rows:8, startGold:200, castleHP:20, waves:5,
    path:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[2,5],[3,5],[3,4],[3,3],[3,2],[3,1],[4,1],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],[5,9],[5,10],[5,11],[6,11],[7,11]],
    waveGen:(w)=>Array.from({length:4+w*2},()=>({type:'soldier'})),
    bgGrad:'linear-gradient(180deg,#5b8bd4 0%,#7ec88a 50%,#4a7c3f 100%)',
    groundColor:'#5a8f4a', pathColor:'#8d7b64', pathBorder:'#6b5d4a',
    icon:'🌿',
  },
  {
    name:'Forest', cols:14, rows:9, startGold:250, castleHP:25, waves:7,
    path:[[0,0],[1,0],[2,0],[2,1],[2,2],[2,3],[2,4],[1,4],[0,4],[0,5],[0,6],[0,7],[0,8],[1,8],[2,8],[2,9],[2,10],[2,11],[2,12],[2,13],[3,13],[4,13],[4,12],[4,11],[4,10],[4,9],[4,8],[4,7],[4,6],[4,5],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[7,13],[8,13]],
    waveGen:(w)=>{
      const arr=[];
      for(let i=0;i<3+w;i++) arr.push({type:'soldier'});
      for(let i=0;i<(w>=2?Math.floor(w/2):0);i++) arr.push({type:'knight'});
      return arr;
    },
    bgGrad:'linear-gradient(180deg,#1a3a0a 0%,#0f2a05 60%,#071a02 100%)',
    groundColor:'#2d5016', pathColor:'#5a4a3a', pathBorder:'#3e3428',
    icon:'🌲',
  },
  {
    name:'Fortress', cols:16, rows:10, startGold:300, castleHP:30, waves:10,
    path:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11],[0,12],[0,13],[0,14],[0,15],[1,15],[2,15],[2,14],[2,13],[2,12],[2,11],[2,10],[2,9],[2,8],[2,7],[2,6],[2,5],[2,4],[2,3],[2,2],[2,1],[2,0],[3,0],[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[5,13],[6,13],[6,12],[6,11],[6,10],[6,9],[6,8],[6,7],[6,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,6],[8,7],[8,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[8,15],[9,15]],
    waveGen:(w)=>{
      const arr=[];
      for(let i=0;i<2+w;i++) arr.push({type:'soldier'});
      for(let i=0;i<(w>=2?Math.floor(w/2)+1:0);i++) arr.push({type:'knight'});
      for(let i=0;i<(w>=5?Math.floor((w-4)/2):0);i++) arr.push({type:'ram'});
      return arr;
    },
    bgGrad:'linear-gradient(180deg,#0d0d2b 0%,#16213e 50%,#1a1a3e 100%)',
    groundColor:'#22224a', pathColor:'#4a3f5c', pathBorder:'#332a44',
    icon:'🏯',
  },
];

/* ─────────────────── AUDIO ENGINE ─────────────────── */
let audioCtx = null;
const getAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};
const playTone = (freq, dur, type='sine', vol=0.15) => {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch(e) {}
};
const sfx = {
  place:()=>playTone(120,0.2,'triangle',0.2),
  arrow:()=>playTone(800,0.1,'sawtooth',0.08),
  cannon:()=>playTone(60,0.3,'square',0.2),
  ice:()=>playTone(1200,0.15,'sine',0.1),
  hit:()=>playTone(200,0.1,'square',0.1),
  kill:()=>{playTone(600,0.1,'sine',0.12);setTimeout(()=>playTone(900,0.08,'sine',0.1),100);},
  wave:()=>{playTone(440,0.15,'sawtooth',0.15);setTimeout(()=>playTone(660,0.2,'sawtooth',0.15),150);},
  castleHit:()=>playTone(80,0.4,'sawtooth',0.25),
  victory:()=>{[523,659,784].forEach((f,i)=>setTimeout(()=>playTone(f,0.3,'sine',0.15),i*200));},
  defeat:()=>{[400,300,200].forEach((f,i)=>setTimeout(()=>playTone(f,0.4,'sawtooth',0.15),i*300));},
};

/* ─────────────────── HELPERS ─────────────────── */
const dist = (a,b) => Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2);
const lerp = (a,b,t) => a + (b-a)*t;
const uid = (()=>{let i=0;return()=>++i;})();

/* ─────────────────── CSS KEYFRAMES ─────────────────── */
const CSS = `
@keyframes twinkle{0%{opacity:0.2}100%{opacity:1}}
@keyframes bannerIn{0%{transform:translate(-50%,-50%) scale(0.3);opacity:0}40%{transform:translate(-50%,-50%) scale(1.15);opacity:1}100%{transform:translate(-50%,-50%) scale(1)}}
@keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}
@keyframes pulseGlow{0%{box-shadow:0 0 8px rgba(255,215,0,0.3)}50%{box-shadow:0 0 20px rgba(255,215,0,0.6)}100%{box-shadow:0 0 8px rgba(255,215,0,0.3)}}
@keyframes towerBob{0%{transform:translateY(0)}50%{transform:translateY(-2px)}100%{transform:translateY(0)}}
@keyframes rangeRing{0%{opacity:0.25}50%{opacity:0.15}100%{opacity:0.25}}
@keyframes spawnPulse{0%{box-shadow:inset 0 0 8px #ff000066}50%{box-shadow:inset 0 0 18px #ff0000aa}100%{box-shadow:inset 0 0 8px #ff000066}}
@keyframes castlePulse{0%{box-shadow:inset 0 0 10px #ffd70044}50%{box-shadow:inset 0 0 22px #ffd70088}100%{box-shadow:inset 0 0 10px #ffd70044}}
@keyframes hpFlash{0%{filter:brightness(1)}50%{filter:brightness(1.8)}100%{filter:brightness(1)}}
@keyframes slideUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
@keyframes victoryBurst{0%{transform:translate(-50%,-50%) scale(0);opacity:0}50%{transform:translate(-50%,-50%) scale(1.2);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
@keyframes defeatShake{0%{transform:translate(-50%,-50%)}25%{transform:translate(calc(-50% + 5px),-50%)}50%{transform:translate(calc(-50% - 5px),-50%)}75%{transform:translate(calc(-50% + 3px),-50%)}100%{transform:translate(-50%,-50%)}}
`;

/* ─────────────────── COMPONENT ─────────────────── */
export default function CastleDefender() {
  const location = useLocation();
  const [screen, setScreen] = useState('menu');
  const [levelIdx, setLevelIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [levelScores, setLevelScores] = useState([0,0,0]);
  const [resultData, setResultData] = useState(null);
  const [dailyGameLevel, setDailyGameLevel] = useState(null);
  const [isDailyGame, setIsDailyGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkingDailyGame, setCheckingDailyGame] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [finalStats, setFinalStats] = useState(null);

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
          // Map difficulty: easy -> Level 0 (Meadow), moderate -> Level 1 (Forest), hard -> Level 2 (Fortress)
          const difficultyMap = { 
            easy: 0, 
            moderate: 1, 
            hard: 2 
          };
          const mappedLevel = difficultyMap[difficulty];
          
          if (mappedLevel !== undefined) {
            setIsDailyGame(true);
            setDailyGameLevel(mappedLevel);
          }
        }
      } catch (error) {
        console.error('Error checking daily game:', error);
      } finally {
        setCheckingDailyGame(false);
      }
    };
    
    checkDailyGame();
  }, [location.pathname]);

  const startLevel = (idx) => { 
    setLevelIdx(idx); 
    setScreen('game');
    setGameStartTime(Date.now());
  };
  
  const onLevelEnd = (score, won, stats) => {
    const ns = [...levelScores]; 
    ns[levelIdx] = Math.max(ns[levelIdx], score);
    setLevelScores(ns); 
    const total = ns.reduce((a,b)=>a+b,0); 
    setTotalScore(total);
    setFinalStats(stats);
    setResultData({ score, won, levelIdx, totalScore: total });
    setScreen('finished');
  };

  const handleCloseModal = () => {
    // Go back to menu when modal closes
    setScreen('menu');
    setResultData(null);
    setFinalStats(null);
    setGameStartTime(null);
  };

  if (screen === 'menu') {
    return (
      <MenuScreen 
        startLevel={startLevel} 
        levelScores={levelScores} 
        totalScore={totalScore}
        isDailyGame={isDailyGame}
        dailyGameLevel={dailyGameLevel}
        checkingDailyGame={checkingDailyGame}
        showInstructions={showInstructions}
        setShowInstructions={setShowInstructions}
      />
    );
  }
  
  const timeElapsed = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
  const level = resultData ? LEVELS[resultData.levelIdx] : LEVELS[levelIdx];
  
  return (
    <>
      {/* Keep GameScreen visible in background when modal shows */}
      {(screen === 'game' || screen === 'finished') && (
        <GameScreen 
          key={levelIdx} 
          levelIdx={levelIdx} 
          onEnd={onLevelEnd} 
          muted={muted} 
          setMuted={setMuted} 
          goMenu={()=>setScreen('menu')} 
        />
      )}
      
      {/* Game Completion Modal */}
      <GameCompletionModal
        isVisible={screen === 'finished' && resultData !== null}
        onClose={handleCloseModal}
        gameTitle="Castle Defender"
        score={resultData?.score || 0}
        moves={finalStats?.wavesCompleted || 0}
        timeElapsed={timeElapsed}
        gameTimeLimit={TIME_LIMIT}
        isVictory={resultData?.won || false}
        difficulty={resultData?.levelIdx === 0 ? 'Easy' : resultData?.levelIdx === 1 ? 'Moderate' : 'Hard'}
        customMessages={{
          perfectScore: 60,
          goodScore: 40,
          maxScore: 200,
          stats: `🏰 Castle HP: ${finalStats?.castleHP || 0}/${finalStats?.maxHP || 0} • 🌊 Waves: ${finalStats?.wavesCompleted || 0}/${level?.waves || 0} • 💰 Gold Earned: ${finalStats?.goldEarned || 0}`
        }}
      />
    </>
  );
}

/* ─────────────────── MENU SCREEN ─────────────────── */
function MenuScreen({ startLevel, levelScores, totalScore, isDailyGame, dailyGameLevel, checkingDailyGame, showInstructions, setShowInstructions }) {
  const [orient, setOrient] = useState(true);
  const [hoveredLevel, setHoveredLevel] = useState(null);

  useEffect(() => {
    const check = () => setOrient(window.innerWidth >= window.innerHeight || window.innerWidth > 900);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Deterministic stars - must be called before any conditional returns
  const stars = useMemo(() => Array.from({length:50}, (_,i) => ({
    top: ((i*17+7)%100), left: ((i*31+13)%100),
    size: 1 + (i%3), delay: (i*0.7)%5, dur: 2+(i%4),
  })), []);

  // Filter levels based on daily game status - must be called before any conditional returns
  const availableLevels = useMemo(() => {
    return isDailyGame && dailyGameLevel !== null 
      ? [LEVELS[dailyGameLevel]]
      : LEVELS;
  }, [isDailyGame, dailyGameLevel]);
  
  const levelIndices = useMemo(() => {
    return isDailyGame && dailyGameLevel !== null
      ? [dailyGameLevel]
      : [0, 1, 2];
  }, [isDailyGame, dailyGameLevel]);

  if (!orient) return (
    <div style={{position:'fixed',inset:0,background:'#0a0a1a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:20,zIndex:9999,textAlign:'center',padding:40,flexDirection:'column',gap:16}}>
      <div style={{fontSize:48}}>📱</div>
      <div style={{fontWeight:700}}>Please Rotate Your Device</div>
      <div style={{fontSize:14,color:'#888'}}>This game requires landscape orientation</div>
    </div>
  );


  if (checkingDailyGame) {
    return (
      <div style={{position:'fixed',inset:0,background:'linear-gradient(180deg,#050510 0%,#0d1030 30%,#1a1040 60%,#2a1808 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"Segoe UI",sans-serif',color:'#fff'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:16}}>⚔️</div>
          <div style={{fontSize:18,color:'#c9952e'}}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:'fixed',inset:0,background:'linear-gradient(180deg,#050510 0%,#0d1030 30%,#1a1040 60%,#2a1808 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'"Segoe UI",sans-serif',color:'#fff',overflow:'hidden'}}>
      <style>{CSS}</style>

      {/* How to Play Button */}
      <button
        onClick={() => setShowInstructions(true)}
        style={{
          position:'absolute',top:20,right:20,zIndex:10,
          padding:'10px 20px',background:'rgba(201,149,46,0.15)',border:'2px solid rgba(201,149,46,0.4)',
          borderRadius:10,color:'#c9952e',cursor:'pointer',fontSize:14,fontWeight:700,
          transition:'all 0.3s',display:'flex',alignItems:'center',gap:8,
          boxShadow:'0 4px 12px rgba(0,0,0,0.3)'
        }}
        onMouseEnter={e=>{e.currentTarget.style.background='rgba(201,149,46,0.25)';e.currentTarget.style.transform='scale(1.05)';}}
        onMouseLeave={e=>{e.currentTarget.style.background='rgba(201,149,46,0.15)';e.currentTarget.style.transform='scale(1)';}}
      >
        📖 How to Play
      </button>

      {/* Instructions Modal */}
      {showInstructions && (
        <div style={{
          position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(4px)',
          display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,
          padding:20
        }} onClick={() => setShowInstructions(false)}>
          <div style={{
            background:'linear-gradient(135deg,#1a1208,#2a1a0a)',border:'2px solid #c9952e',
            borderRadius:20,padding:32,maxWidth:600,maxHeight:'90vh',overflowY:'auto',
            color:'#fff',position:'relative',boxShadow:'0 0 40px rgba(201,149,46,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                position:'absolute',top:16,right:16,background:'rgba(255,255,255,0.1)',
                border:'none',borderRadius:'50%',width:32,height:32,color:'#fff',
                cursor:'pointer',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',
                transition:'all 0.2s'
              }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            >
              ×
            </button>
            <h2 style={{fontSize:28,fontWeight:900,marginBottom:20,color:'#ffd700',textAlign:'center'}}>
              ⚔️ How to Play Castle Defender
            </h2>
            <div style={{fontSize:15,lineHeight:1.8,color:'#ddd'}}>
              <div style={{marginBottom:20}}>
                <h3 style={{fontSize:18,fontWeight:700,color:'#c9952e',marginBottom:8}}>🎯 Objective</h3>
                <p>Defend your castle from waves of enemies by strategically placing towers along the path. Survive all waves and keep your castle's HP above zero!</p>
              </div>
              <div style={{marginBottom:20}}>
                <h3 style={{fontSize:18,fontWeight:700,color:'#c9952e',marginBottom:8}}>🏹 How to Play</h3>
                <ul style={{paddingLeft:20,margin:0}}>
                  <li style={{marginBottom:8}}><strong>Select a Tower:</strong> Click on a tower type at the bottom (Archer 🏹, Cannon 💣, or Ice ❄️)</li>
                  <li style={{marginBottom:8}}><strong>Place Towers:</strong> Click on empty ground tiles (not on the path) to place your selected tower</li>
                  <li style={{marginBottom:8}}><strong>Start Waves:</strong> Click "Start Wave" when ready. Towers automatically target and attack enemies</li>
                  <li style={{marginBottom:8}}><strong>Earn Gold:</strong> Defeat enemies to earn gold, which you can use to buy more towers</li>
                  <li style={{marginBottom:8}}><strong>Survive:</strong> Complete all waves before time runs out and keep your castle alive!</li>
                </ul>
              </div>
              <div style={{marginBottom:20}}>
                <h3 style={{fontSize:18,fontWeight:700,color:'#c9952e',marginBottom:8}}>🏰 Tower Types</h3>
                <ul style={{paddingLeft:20,margin:0}}>
                  <li style={{marginBottom:8}}><strong>Archer 🏹:</strong> Fast attack, moderate damage (50 gold)</li>
                  <li style={{marginBottom:8}}><strong>Cannon 💣:</strong> Slow but powerful splash damage (100 gold)</li>
                  <li style={{marginBottom:8}}><strong>Ice ❄️:</strong> Slows enemies by 50% (75 gold)</li>
                </ul>
              </div>
              <div style={{marginBottom:20}}>
                <h3 style={{fontSize:18,fontWeight:700,color:'#c9952e',marginBottom:8}}>⭐ Scoring</h3>
                <p>Your score is based on how much castle HP remains at the end. Maximum score is 200 points!</p>
              </div>
              <div>
                <h3 style={{fontSize:18,fontWeight:700,color:'#c9952e',marginBottom:8}}>💡 Pro Tip</h3>
                <p>Place towers near corners and intersections for maximum coverage. Use Ice towers to slow down tough enemies, and Cannons for groups!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated stars */}
      {stars.map((s,i) => (
        <div key={i} style={{position:'absolute',top:`${s.top}%`,left:`${s.left}%`,width:s.size,height:s.size,borderRadius:'50%',background:'#fff',animation:`twinkle ${s.dur}s ${s.delay}s infinite alternate`}} />
      ))}

      {/* Castle silhouette - improved */}
      <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:'min(500px,80vw)',height:220,opacity:0.6}}>
        {/* Left tower */}
        <div style={{position:'absolute',bottom:0,left:'15%',width:'12%',height:170,background:'linear-gradient(180deg,#1a1a3a,#12122a)',borderRadius:'3px 3px 0 0'}}>
          <div style={{position:'absolute',top:-8,left:-4,width:'calc(100% + 8px)',height:12,background:'#1a1a3a',display:'flex',justifyContent:'space-between'}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:'18%',height:12,background:'#12122a'}} />)}
          </div>
        </div>
        {/* Main gate */}
        <div style={{position:'absolute',bottom:0,left:'35%',width:'30%',height:130,background:'linear-gradient(180deg,#1a1a3a,#12122a)',borderRadius:'3px 3px 0 0'}}>
          <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:'45%',height:'55%',background:'#06060f',borderRadius:'45% 45% 0 0'}} />
          <div style={{position:'absolute',top:-8,left:-4,width:'calc(100% + 8px)',height:12,background:'#1a1a3a',display:'flex',justifyContent:'space-between'}}>
            {[0,1,2,3,4,5].map(i=><div key={i} style={{width:'12%',height:12,background:'#12122a'}} />)}
          </div>
        </div>
        {/* Right tower */}
        <div style={{position:'absolute',bottom:0,right:'15%',width:'12%',height:190,background:'linear-gradient(180deg,#1a1a3a,#12122a)',borderRadius:'3px 3px 0 0'}}>
          <div style={{position:'absolute',top:-8,left:-4,width:'calc(100% + 8px)',height:12,background:'#1a1a3a',display:'flex',justifyContent:'space-between'}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:'18%',height:12,background:'#12122a'}} />)}
          </div>
          {/* Flag */}
          <div style={{position:'absolute',top:-30,left:'50%',width:2,height:28,background:'#555'}}>
            <div style={{position:'absolute',top:2,left:2,width:16,height:10,background:'linear-gradient(135deg,#c0392b,#e74c3c)',clipPath:'polygon(0 0,100% 50%,0 100%)'}} />
          </div>
        </div>
      </div>

      {/* Moon */}
      <div style={{position:'absolute',top:'8%',right:'15%',width:60,height:60,borderRadius:'50%',background:'radial-gradient(circle at 40% 40%,#ffeedd,#ddc89a)',boxShadow:'0 0 40px #ffeedd44,0 0 80px #ffeedd22',opacity:0.7}} />

      {/* Title */}
      <div style={{zIndex:1,textAlign:'center',marginBottom:50}}>
        <h1 style={{fontSize:'clamp(32px,6vw,64px)',fontWeight:900,textShadow:'0 0 40px rgba(255,180,0,0.4),0 0 80px rgba(255,120,0,0.2),0 4px 12px rgba(0,0,0,0.9)',letterSpacing:4,marginBottom:6,lineHeight:1.1}}>
          ⚔️ CASTLE DEFENDER
        </h1>
        <p style={{fontSize:'clamp(12px,2vw,20px)',color:'#c9952e',fontWeight:700,letterSpacing:8,textTransform:'uppercase',textShadow:'0 0 20px rgba(201,149,46,0.3)'}}>Logic Siege</p>
        {isDailyGame && (
          <div style={{marginTop:12,padding:'6px 16px',background:'rgba(201,149,46,0.2)',border:'1px solid rgba(201,149,46,0.4)',borderRadius:20,display:'inline-block',fontSize:13,color:'#ffd700',fontWeight:600}}>
            🎯 Daily Challenge
          </div>
        )}
      </div>

      {/* Level cards */}
      <div style={{display:'flex',gap:24,flexWrap:'wrap',justifyContent:'center',zIndex:1,padding:'0 20px'}}>
        {availableLevels.map((lv,idx) => {
          const i = levelIndices[idx];
          const sc = levelScores[i];
          const st = sc >= 60 ? 3 : sc >= 40 ? 2 : sc > 0 ? 1 : 0;
          const hovered = hoveredLevel === i;
          return (
            <button key={i} onClick={()=>startLevel(i)}
              onMouseEnter={()=>setHoveredLevel(i)} onMouseLeave={()=>setHoveredLevel(null)}
              style={{
                background: hovered ? 'linear-gradient(135deg,#3a2810,#4a3820)' : 'linear-gradient(135deg,#1a1208,#2a1a0a)',
                border:`2px solid ${hovered ? '#ffd700' : '#5a4418'}`,borderRadius:16,padding:'24px 32px',color:'#fff',cursor:'pointer',minWidth:200,
                transition:'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                transform: hovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
                boxShadow: hovered ? '0 12px 40px rgba(255,180,0,0.2),0 0 0 1px rgba(255,215,0,0.1)' : '0 4px 16px rgba(0,0,0,0.4)',
                animation:'slideUp 0.5s ease-out both',
                animationDelay:`${idx*0.12}s`,
                position:'relative',overflow:'hidden',
              }}>
              {/* Shimmer */}
              {hovered && <div style={{position:'absolute',inset:0,background:'linear-gradient(105deg,transparent 40%,rgba(255,215,0,0.06) 50%,transparent 60%)',pointerEvents:'none'}} />}
              <div style={{fontSize:32,marginBottom:6}}>{lv.icon}</div>
              <div style={{fontSize:12,color:'#887755',fontWeight:600,letterSpacing:2,textTransform:'uppercase'}}>Level {i+1}</div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:6,letterSpacing:1}}>{lv.name}</div>
              <div style={{fontSize:13,color:'#887755',marginBottom:10}}>{lv.waves} waves • {lv.cols}×{lv.rows}</div>
              <div style={{fontSize:20,letterSpacing:4}}>
                {[0,1,2].map(j=><span key={j} style={{filter:j<st?'':'grayscale(1) opacity(0.3)'}}>{j<st?'⭐':'☆'}</span>)}
              </div>
              {sc > 0 && <div style={{fontSize:12,color:'#c9952e',marginTop:6,fontWeight:700}}>{sc} pts</div>}
            </button>
          );
        })}
      </div>

      {totalScore > 0 && (
        <div style={{marginTop:36,fontSize:15,color:'#887755',zIndex:1,textAlign:'center'}}>
          Total Score: <span style={{color:'#ffd700',fontWeight:700,fontSize:18}}>{totalScore}</span>
          <span style={{color:'#555'}}> / {MAX_SCORE}</span>
        </div>
      )}
    </div>
  );
}


/* ─────────────────── GAME SCREEN ─────────────────── */
function GameScreen({ levelIdx, onEnd, muted, setMuted, goMenu }) {
  const level = LEVELS[levelIdx];
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const containerRef = useRef(null);
  const [, forceUpdate] = useState(0);
  const [orient, setOrient] = useState(true);
  const [hoverCell, setHoverCell] = useState(null);

  useEffect(() => {
    const check = () => setOrient(window.innerWidth >= window.innerHeight || window.innerWidth > 900);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const pathSet = useRef(new Set());
  useEffect(() => { pathSet.current = new Set(level.path.map(p=>p[0]+','+p[1])); }, [level]);

  useEffect(() => {
    stateRef.current = {
      phase:'placing', gold:level.startGold, castleHP:level.castleHP, maxHP:level.castleHP,
      wave:0, towers:[], enemies:[], projectiles:[], particles:[],
      selectedTower:null, timeLeft:TIME_LIMIT, score:0,
      spawnQueue:[], spawnTimer:0, lastTime:performance.now(),
      screenShake:0, waveAnnounce:'', waveAnnounceTimer:0, goldPopups:[], killStreak:0, streakTimer:0,
      totalGoldEarned:0, // Track total gold earned from kills
    };
    forceUpdate(n=>n+1);
  }, [level]);

  const getTileSize = useCallback(() => {
    if (!containerRef.current) return 48;
    const rect = containerRef.current.getBoundingClientRect();
    const tw = Math.floor((rect.width-20)/level.cols);
    const th = Math.floor((rect.height-20)/level.rows);
    return Math.max(28, Math.min(56, Math.min(tw, th)));
  }, [level]);

  // Track if we've already called onEnd to prevent multiple calls
  const endCalledRef = useRef(false);
  
  // Reset endCalledRef when level changes
  useEffect(() => {
    endCalledRef.current = false;
  }, [levelIdx]);

  // ── GAME LOOP ──
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    let running = true;

    const tick = (now) => {
      if (!running) return;
      const dt = Math.min((now - s.lastTime)/1000, 0.02);
      s.lastTime = now;

      // Streak decay
      if (s.streakTimer > 0) { s.streakTimer -= dt; if (s.streakTimer <= 0) s.killStreak = 0; }

      if (s.phase==='fighting'||s.phase==='waveComplete') {
        s.timeLeft -= dt;
        if (s.timeLeft <= 0) { 
          s.timeLeft=0; 
          s.phase='gameOver'; 
          if(!muted)sfx.defeat(); 
          // Auto-trigger completion modal
          if (!endCalledRef.current) {
            endCalledRef.current = true;
            setTimeout(() => {
              onEnd(s.score, false, {
                wavesCompleted: s.wave,
                castleHP: s.castleHP,
                maxHP: s.maxHP,
                goldEarned: s.totalGoldEarned || 0
              });
            }, 800);
          }
          forceUpdate(n=>n+1); 
          return; 
        }
      }

      if (s.phase === 'fighting') {
        // Spawn
        if (s.spawnQueue.length > 0) {
          s.spawnTimer -= dt;
          if (s.spawnTimer <= 0) {
            const ed = s.spawnQueue.shift();
            const base = ENEMY_DEFS[ed.type];
            s.enemies.push({id:uid(),type:ed.type,hp:base.hp,maxHp:base.hp,progress:0,speed:base.speed,color:base.color,size:base.size,reward:base.reward,slowTimer:0,slowFactor:1});
            s.spawnTimer = 0.6;
          }
        }

        // Move enemies
        for (const e of s.enemies) {
          e.progress += e.speed*e.slowFactor*dt*2;
          if (e.slowTimer>0) { e.slowTimer-=dt; if(e.slowTimer<=0) e.slowFactor=1; }
          if (e.progress >= level.path.length-1) {
            e.hp=0; s.castleHP-=1; s.screenShake=0.3;
            if(!muted)sfx.castleHit();
            if(s.castleHP<=0) { 
              s.phase='gameOver'; 
              if(!muted)sfx.defeat();
              // Auto-trigger completion modal
              if (!endCalledRef.current) {
                endCalledRef.current = true;
                setTimeout(() => {
                  onEnd(s.score, false, {
                    wavesCompleted: s.wave,
                    castleHP: s.castleHP,
                    maxHP: s.maxHP,
                    goldEarned: s.totalGoldEarned || 0
                  });
                }, 800);
              }
            }
          }
        }

        // Tower targeting
        for (const t of s.towers) {
          t.cooldownLeft -= dt;
          if (t.cooldownLeft > 0) continue;
          const def = TOWER_DEFS[t.type];
          let best=null, bestProg=-1;
          for (const e of s.enemies) {
            if (e.hp<=0) continue;
            const ep=getEnemyPos(e,level.path);
            if (dist([t.row+0.5,t.col+0.5],ep) <= def.range && e.progress>bestProg) { best=e; bestProg=e.progress; }
          }
          if (best) {
            t.cooldownLeft = def.cooldown;
            const ep=getEnemyPos(best,level.path);
            s.projectiles.push({id:uid(),type:t.type,x:t.col+0.5,y:t.row+0.5,tx:ep[1],ty:ep[0],damage:def.damage,targetId:best.id,special:def.special});
            if(!muted) { if(t.type==='archer')sfx.arrow(); else if(t.type==='cannon')sfx.cannon(); else sfx.ice(); }
          }
        }

        // Move projectiles
        for (const p of s.projectiles) {
          const dx=p.tx-p.x, dy=p.ty-p.y, d=Math.sqrt(dx*dx+dy*dy);
          if (d < 0.2) {
            p.hit=true;
            if (p.special==='splash') {
              for(const e of s.enemies) { if(e.hp<=0)continue; if(dist([p.ty,p.tx],getEnemyPos(e,level.path))<1.5) { e.hp-=p.damage; if(!muted)sfx.hit(); }}
              for(let i=0;i<15;i++) s.particles.push(makeParticle(p.x,p.y,'#ff6600',0.7));
              for(let i=0;i<8;i++) s.particles.push(makeParticle(p.x,p.y,'#ffcc00',0.5));
            } else {
              const target=s.enemies.find(e=>e.id===p.targetId);
              if(target&&target.hp>0) {
                target.hp-=p.damage;
                if(p.special==='slow') { target.slowFactor=0.5; target.slowTimer=2; for(let i=0;i<8;i++) s.particles.push(makeParticle(p.x,p.y,'#4fc3f7',0.5)); }
                if(!muted)sfx.hit();
              }
              for(let i=0;i<5;i++) s.particles.push(makeParticle(p.x,p.y,'#ffcc00',0.35));
            }
          } else {
            p.x+=(dx/d)*PROJ_SPEED*dt; p.y+=(dy/d)*PROJ_SPEED*dt;
          }
        }

        // Remove dead enemies
        const alive=[];
        for (const e of s.enemies) {
          if (e.hp<=0) {
            if (e.hp!==-999) {
              s.gold+=e.reward; s.totalGoldEarned+=e.reward; s.killStreak++; s.streakTimer=2;
              const ep=getEnemyPos(e,level.path);
              s.goldPopups.push({x:ep[1],y:ep[0],amount:e.reward,timer:1.2,streak:s.killStreak});
              if(!muted)sfx.kill();
              for(let i=0;i<10;i++) s.particles.push(makeParticle(ep[1],ep[0],e.color,0.6));
              // Death burst
              for(let i=0;i<6;i++) s.particles.push(makeParticle(ep[1],ep[0],'#fff',0.3));
            }
            e.hp=-999;
          } else alive.push(e);
        }
        s.enemies=alive;
        s.projectiles=s.projectiles.filter(p=>!p.hit);

        // Wave complete check
        if (s.spawnQueue.length===0 && s.enemies.length===0 && s.phase==='fighting') {
          if (s.wave>=level.waves) {
            s.phase='levelComplete'; s.score=Math.round(200*(s.castleHP/s.maxHP));
            if(!muted)sfx.victory();
            // Auto-trigger completion modal
            if (!endCalledRef.current) {
              endCalledRef.current = true;
              setTimeout(() => {
                onEnd(s.score, true, {
                  wavesCompleted: s.wave,
                  castleHP: s.castleHP,
                  maxHP: s.maxHP,
                  goldEarned: s.totalGoldEarned || 0
                });
              }, 800);
            }
          } else {
            s.phase='waveComplete'; s.waveAnnounce=`Wave ${s.wave} Complete!`; s.waveAnnounceTimer=2;
          }
        }
      }

      // Announce timer
      if (s.waveAnnounceTimer>0) { s.waveAnnounceTimer-=dt; if(s.waveAnnounceTimer<=0) { s.waveAnnounce=''; if(s.phase==='waveComplete') s.phase='placing'; }}

      // Particles
      for(const p of s.particles) { p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt; }
      s.particles=s.particles.filter(p=>p.life>0).slice(-PARTICLE_MAX);

      // Gold popups
      for(const g of s.goldPopups) { g.y-=dt*0.8; g.timer-=dt; }
      s.goldPopups=s.goldPopups.filter(g=>g.timer>0);

      if(s.screenShake>0) s.screenShake-=dt;

      forceUpdate(n=>n+1);
      animRef.current=requestAnimationFrame(tick);
    };
    animRef.current=requestAnimationFrame(tick);
    return()=>{running=false;cancelAnimationFrame(animRef.current);};
  }, [level, muted, getTileSize]);

  const startWave = () => {
    const s=stateRef.current;
    if(!s||(s.phase!=='placing'&&s.phase!=='waveComplete')) return;
    s.wave++; s.spawnQueue=level.waveGen(s.wave); s.spawnTimer=0;
    s.phase='fighting'; s.waveAnnounce=`⚔️ Wave ${s.wave}`; s.waveAnnounceTimer=1.5;
    if(!muted)sfx.wave(); forceUpdate(n=>n+1);
  };

  const placeTower = (row,col) => {
    const s=stateRef.current;
    if(!s||!s.selectedTower) return;
    if(s.phase!=='placing'&&s.phase!=='waveComplete') return;
    if(pathSet.current.has(row+','+col)) return;
    if(s.towers.some(t=>t.row===row&&t.col===col)) return;
    const def=TOWER_DEFS[s.selectedTower];
    if(s.gold<def.cost) return;
    s.gold-=def.cost;
    s.towers.push({id:uid(),type:s.selectedTower,row,col,cooldownLeft:0});
    if(!muted)sfx.place(); forceUpdate(n=>n+1);
  };

  const selectTower = (type) => {
    const s=stateRef.current;
    if(!s) return;
    s.selectedTower = s.selectedTower===type?null:type;
    forceUpdate(n=>n+1);
  };

  const s = stateRef.current;
  if (!s) return null;

  if (!orient) return (
    <div style={{position:'fixed',inset:0,background:'#0a0a1a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:20,zIndex:9999,textAlign:'center',padding:40,flexDirection:'column',gap:16}}>
      <div style={{fontSize:48}}>📱</div>
      <div style={{fontWeight:700}}>Please Rotate Your Device</div>
    </div>
  );

  const ts = getTileSize();
  const gridW = level.cols*ts, gridH = level.rows*ts;
  const shakeX = s.screenShake>0?(Math.random()-0.5)*8:0;
  const shakeY = s.screenShake>0?(Math.random()-0.5)*8:0;
  const castleCell = level.path[level.path.length-1];
  const spawnCell = level.path[0];
  const canPlace = s.phase==='placing'||s.phase==='waveComplete';
  const hpPct = s.castleHP/s.maxHP;
  const timePct = s.timeLeft/TIME_LIMIT;

  return (
    <div style={{position:'fixed',inset:0,background:level.bgGrad,display:'flex',flexDirection:'column',fontFamily:'"Segoe UI",sans-serif',color:'#fff',overflow:'hidden',userSelect:'none',zIndex:1}}>
      <style>{CSS}</style>

      {/* ── HUD ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 20px',background:'linear-gradient(180deg,rgba(0,0,0,0.75),rgba(0,0,0,0.5))',backdropFilter:'blur(8px)',borderBottom:'1px solid rgba(255,215,0,0.1)',flexWrap:'wrap',gap:8,minHeight:48}}>
        <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
          {/* Castle HP */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:18}}>🏰</span>
            <div style={{width:100,height:10,background:'rgba(255,255,255,0.1)',borderRadius:5,overflow:'hidden',border:'1px solid rgba(255,255,255,0.15)'}}>
              <div style={{width:`${hpPct*100}%`,height:'100%',background:hpPct>0.5?'linear-gradient(90deg,#4caf50,#66bb6a)':hpPct>0.25?'linear-gradient(90deg,#ff9800,#ffa726)':'linear-gradient(90deg,#ef5350,#f44336)',borderRadius:5,transition:'width 0.3s',animation:hpPct<=0.25?'hpFlash 0.5s infinite':''}} />
            </div>
            <span style={{fontSize:13,fontWeight:700,color:hpPct>0.5?'#66bb6a':hpPct>0.25?'#ffa726':'#ef5350',minWidth:36}}>{s.castleHP}/{s.maxHP}</span>
          </div>
          {/* Gold */}
          <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(255,215,0,0.08)',padding:'4px 12px',borderRadius:8,border:'1px solid rgba(255,215,0,0.15)'}}>
            <span style={{fontSize:16}}>💰</span>
            <span style={{fontSize:15,fontWeight:800,color:'#ffd700'}}>{s.gold}</span>
          </div>
          {/* Wave */}
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:14}}>🌊</span>
            <span style={{fontSize:14,fontWeight:700}}>Wave {s.wave}<span style={{color:'#666'}}>/{level.waves}</span></span>
          </div>
          {/* Timer */}
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:14}}>⏱️</span>
            <div style={{width:60,height:6,background:'rgba(255,255,255,0.1)',borderRadius:3,overflow:'hidden'}}>
              <div style={{width:`${timePct*100}%`,height:'100%',background:timePct>0.3?'#4fc3f7':'#ef5350',borderRadius:3,transition:'width 0.5s'}} />
            </div>
            <span style={{fontSize:13,fontWeight:700,color:timePct>0.3?'#4fc3f7':'#ef5350'}}>{Math.ceil(s.timeLeft)}s</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {s.killStreak>=3 && <span style={{fontSize:13,color:'#ff9800',fontWeight:700,animation:'pulseGlow 1s infinite'}}>🔥 x{s.killStreak}</span>}
          <button onClick={()=>setMuted(!muted)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'5px 12px',color:'#fff',cursor:'pointer',fontSize:14,transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
            {muted?'🔇':'🔊'}
          </button>
          <button onClick={goMenu} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'5px 12px',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
            ✕ Menu
          </button>
        </div>
      </div>

      {/* ── GRID ── */}
      <div ref={containerRef} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'relative',width:gridW,height:gridH,transform:`translate(${shakeX}px,${shakeY}px)`,borderRadius:4,overflow:'hidden',boxShadow:'0 0 60px rgba(0,0,0,0.5)'}}>
          {/* Cells */}
          {Array.from({length:level.rows}).map((_,r) =>
            Array.from({length:level.cols}).map((_,c) => {
              const isPath = pathSet.current.has(r+','+c);
              const isCastle = r===castleCell[0]&&c===castleCell[1];
              const isSpawn = r===spawnCell[0]&&c===spawnCell[1];
              const hasTower = s.towers.some(t=>t.row===r&&t.col===c);
              const canPlaceHere = s.selectedTower&&!isPath&&!hasTower&&canPlace&&s.gold>=TOWER_DEFS[s.selectedTower].cost;
              const isHovered = hoverCell&&hoverCell[0]===r&&hoverCell[1]===c;

              return (
                <div key={r+','+c}
                  onClick={()=>placeTower(r,c)}
                  onMouseEnter={()=>setHoverCell([r,c])}
                  onMouseLeave={()=>setHoverCell(null)}
                  style={{
                    position:'absolute',left:c*ts,top:r*ts,width:ts,height:ts,boxSizing:'border-box',
                    background:isCastle?'linear-gradient(135deg,#5c4033,#3e2723)':
                      isSpawn?'linear-gradient(135deg,#5c1010,#3a0808)':
                      isPath?`linear-gradient(135deg,${level.pathColor},${level.pathBorder})`:
                      canPlaceHere&&isHovered?'rgba(255,255,100,0.25)':
                      `linear-gradient(135deg,${level.groundColor},${level.groundColor}cc)`,
                    border:isPath?`1px solid ${level.pathBorder}`:canPlaceHere?'1px dashed rgba(255,215,0,0.3)':'1px solid rgba(255,255,255,0.05)',
                    cursor:canPlaceHere?'pointer':'default',
                    transition:'background 0.2s, border-color 0.2s',
                    animation:isCastle?'castlePulse 3s infinite':isSpawn?'spawnPulse 2s infinite':'',
                  }}>
                  {isCastle && <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:ts*0.55,filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>🏰</div>}
                  {isSpawn && <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:ts*0.4,filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>⚔️</div>}
                </div>
              );
            })
          )}

          {/* Tower range indicators */}
          {s.selectedTower && hoverCell && !pathSet.current.has(hoverCell[0]+','+hoverCell[1]) && canPlace && (
            <div style={{
              position:'absolute',
              left:(hoverCell[1]+0.5)*ts - TOWER_DEFS[s.selectedTower].range*ts,
              top:(hoverCell[0]+0.5)*ts - TOWER_DEFS[s.selectedTower].range*ts,
              width:TOWER_DEFS[s.selectedTower].range*2*ts,
              height:TOWER_DEFS[s.selectedTower].range*2*ts,
              borderRadius:'50%',
              border:`2px solid ${TOWER_DEFS[s.selectedTower].color}55`,
              background:`radial-gradient(circle,${TOWER_DEFS[s.selectedTower].color}11,transparent 70%)`,
              pointerEvents:'none',zIndex:1,
              animation:'rangeRing 2s infinite',
            }} />
          )}

          {/* Towers */}
          {s.towers.map(t => {
            const def=TOWER_DEFS[t.type];
            const icon=t.type==='archer'?'🏹':t.type==='cannon'?'💣':'❄️';
            const firing = t.cooldownLeft > def.cooldown*0.7;
            return (
              <div key={t.id} style={{position:'absolute',left:t.col*ts,top:t.row*ts,width:ts,height:ts,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',zIndex:2}}>
                <div style={{
                  width:ts*0.78,height:ts*0.78,borderRadius:'50%',
                  background:`radial-gradient(circle at 35% 35%,${def.accent},${def.color})`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:ts*0.38,
                  boxShadow:`0 0 ${ts*0.3}px ${def.color}44, inset 0 -2px 4px rgba(0,0,0,0.3)`,
                  border:`2px solid ${def.accent}88`,
                  animation:firing?'':'towerBob 3s ease-in-out infinite',
                  transform:firing?'scale(1.1)':'',
                  transition:'transform 0.1s',
                }}>
                  {icon}
                </div>
              </div>
            );
          })}

          {/* Enemies */}
          {s.enemies.map(e => {
            const pos=getEnemyPos(e,level.path);
            const sz=ts*e.size;
            const x=pos[1]*ts+ts/2-sz/2,y=pos[0]*ts+ts/2-sz/2;
            const icon=e.type==='soldier'?'🧑‍🌾':e.type==='knight'?'🛡️':'🐏';
            const hpPctE=e.hp/e.maxHp;
            return (
              <div
                key={e.id}
                style={{
                  position:'absolute',
                  left:0,
                  top:0,
                  width:sz,
                  height:sz,
                  transform:`translate(${x}px,${y}px)`,
                  transition:'transform 0.1s linear',
                  willChange:'transform',
                  zIndex:3,
                  pointerEvents:'none',
                }}
              >
                <div style={{fontSize:sz*0.7,textAlign:'center',lineHeight:1,filter:e.slowFactor<1?'hue-rotate(180deg) brightness(1.3)':'',transition:'filter 0.3s'}}>{icon}</div>
                {/* HP bar */}
                <div style={{position:'absolute',top:-8,left:'50%',transform:'translateX(-50%)',width:Math.max(sz,20),height:5,background:'rgba(0,0,0,0.6)',borderRadius:3,overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <div style={{width:`${hpPctE*100}%`,height:'100%',background:hpPctE>0.6?'linear-gradient(90deg,#4caf50,#81c784)':hpPctE>0.3?'linear-gradient(90deg,#ff9800,#ffb74d)':'linear-gradient(90deg,#f44336,#ef5350)',borderRadius:3,transition:'width 0.15s'}} />
                </div>
                {e.slowFactor<1 && <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',fontSize:10,filter:'drop-shadow(0 0 3px #4fc3f7)'}}>❄️</div>}
              </div>
            );
          })}

          {/* Projectiles */}
          {s.projectiles.map(p => {
            const x=p.x*ts,y=p.y*ts;
            const sz=p.type==='cannon'?8:6;
            const color=p.type==='archer'?'#daa520':p.type==='cannon'?'#ff8a65':'#4fc3f7';
            const glow=p.type==='cannon'?'0 0 10px #ff6600':'0 0 8px '+color;
            return (
              <div key={p.id} style={{position:'absolute',left:x-sz/2,top:y-sz/2,width:sz,height:sz,borderRadius:'50%',background:color,boxShadow:glow,zIndex:4,pointerEvents:'none'}} />
            );
          })}

          {/* Particles */}
          {s.particles.map((p,i) => (
            <div key={i} style={{position:'absolute',left:p.x*ts,top:p.y*ts,width:3+Math.random()*3,height:3+Math.random()*3,borderRadius:'50%',background:p.color,opacity:Math.max(0,p.life/p.maxLife),pointerEvents:'none',zIndex:5,boxShadow:`0 0 4px ${p.color}`}} />
          ))}

          {/* Gold popups */}
          {s.goldPopups.map((g,i) => (
            <div key={i} style={{position:'absolute',left:g.x*ts,top:g.y*ts,pointerEvents:'none',zIndex:6,animation:'floatUp 1.2s ease-out forwards'}}>
              <span style={{color:'#ffd700',fontSize:g.streak>=3?16:14,fontWeight:800,textShadow:'0 0 6px rgba(0,0,0,0.8),0 0 12px rgba(255,215,0,0.3)'}}>
                +{g.amount}💰
                {g.streak>=3 && <span style={{color:'#ff9800',fontSize:11}}> x{g.streak}</span>}
              </span>
            </div>
          ))}

          {/* Wave announcement */}
          {s.waveAnnounce && (
            <div style={{position:'absolute',top:'50%',left:'50%',zIndex:10,pointerEvents:'none',animation:'bannerIn 0.6s ease-out'}}>
              <div style={{transform:'translate(-50%,-50%)',background:'linear-gradient(135deg,rgba(0,0,0,0.85),rgba(20,15,10,0.9))',border:'2px solid rgba(255,215,0,0.4)',borderRadius:16,padding:'16px 48px',textAlign:'center',boxShadow:'0 0 60px rgba(255,180,0,0.15)'}}>
                <div style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:900,color:'#ffd700',textShadow:'0 0 20px rgba(255,215,0,0.5)',letterSpacing:2}}>{s.waveAnnounce}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── GAME OVER / LEVEL COMPLETE ── */}
      {/* Old overlay removed - now using GameCompletionModal */}
      {(s.phase==='gameOver'||s.phase==='levelComplete') && (
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.3)',backdropFilter:'blur(2px)',zIndex:19,pointerEvents:'none'}} />
      )}

      {/* ── TOWER BAR ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px 20px',background:'linear-gradient(0deg,rgba(0,0,0,0.8),rgba(0,0,0,0.6))',borderTop:'1px solid rgba(255,215,0,0.08)',flexWrap:'wrap'}}>
        {Object.entries(TOWER_DEFS).map(([key,def]) => {
          const sel=s.selectedTower===key;
          const afford=s.gold>=def.cost;
          const icon=key==='archer'?'🏹':key==='cannon'?'💣':'❄️';
          return (
            <button key={key} onClick={()=>canPlace&&selectTower(key)}
              style={{
                padding:'10px 18px',borderRadius:10,cursor:canPlace&&afford?'pointer':'not-allowed',
                background:sel?'linear-gradient(135deg,#3a2810,#4a3820)':'rgba(255,255,255,0.04)',
                border:sel?'2px solid #ffd700':'2px solid rgba(255,255,255,0.08)',
                color:afford?'#fff':'#555',opacity:canPlace?1:0.4,
                transition:'all 0.25s',fontSize:14,fontWeight:700,
                boxShadow:sel?'0 0 16px rgba(255,215,0,0.15),inset 0 0 8px rgba(255,215,0,0.05)':'none',
                display:'flex',alignItems:'center',gap:8,
              }}>
              <span style={{fontSize:20}}>{icon}</span>
              <div style={{textAlign:'left'}}>
                <div>{def.name} <span style={{color:afford?'#ffd700':'#555',fontWeight:800}}>{def.cost}g</span></div>
                <div style={{fontSize:10,color:'#777',fontWeight:400}}>{def.desc}</div>
              </div>
            </button>
          );
        })}
        <div style={{width:1,height:36,background:'rgba(255,255,255,0.1)',margin:'0 4px'}} />
        <button onClick={startWave}
          disabled={!canPlace}
          style={{
            padding:'12px 28px',borderRadius:10,fontSize:15,fontWeight:800,letterSpacing:1,
            background:canPlace?'linear-gradient(135deg,#b71c1c,#e53935)':'rgba(255,255,255,0.05)',
            border:canPlace?'2px solid #ef5350':'2px solid rgba(255,255,255,0.08)',
            color:canPlace?'#fff':'#555',cursor:canPlace?'pointer':'not-allowed',
            boxShadow:canPlace?'0 0 20px rgba(229,57,53,0.2)':'none',
            transition:'all 0.3s',
          }}
          onMouseEnter={e=>{if(canPlace)e.currentTarget.style.transform='scale(1.05)';}}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
          ⚔️ Start Wave {s.wave+1}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── UTILITY ─────────────────── */
function getEnemyPos(enemy, path) {
  const p=Math.min(enemy.progress,path.length-1);
  const idx=Math.floor(p),frac=p-idx;
  if(idx>=path.length-1) return [path[path.length-1][0],path[path.length-1][1]];
  return [lerp(path[idx][0],path[idx+1][0],frac),lerp(path[idx][1],path[idx+1][1],frac)];
}
function makeParticle(x,y,color,life) {
  return {x,y,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4,color,life,maxLife:life};
}
