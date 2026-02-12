import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameFrameworkV2 from '../../components/GameFrameworkV2';

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

const DIFFICULTIES = {
  Easy: 0,
  Moderate: 1,
  Hard: 2,
};

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
let bgMusicAudio = null;

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

function startBackgroundMusic() {
  if (bgMusicAudio) return;
  bgMusicAudio = new Audio('/music/lofi.mp3');
  bgMusicAudio.volume = 0.3;
  bgMusicAudio.loop = true;
  bgMusicAudio.play().catch(err => console.log('Audio play failed:', err));
}

function stopBackgroundMusic() {
  if (bgMusicAudio) {
    bgMusicAudio.pause();
    bgMusicAudio.currentTime = 0;
    bgMusicAudio = null;
  }
}

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

/* ─────────────────── MAIN WRAPPER COMPONENT ─────────────────── */
export default function CastleDefenderGame() {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);

  const levelIdx = DIFFICULTIES[difficulty];

  const handleStart = useCallback(() => {
    getAudio();
    startBackgroundMusic();
    setScore(0);
    setTimeRemaining(TIME_LIMIT);
    setGameState('playing');
  }, []);

  const handleReset = useCallback(() => {
    stopBackgroundMusic();
    setScore(0);
    setTimeRemaining(TIME_LIMIT);
  }, []);

  useEffect(() => {
    if (gameState === 'finished') {
      stopBackgroundMusic();
    }
  }, [gameState]);

  // Instructions section
  const instructionsSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎯 Objective
        </h4>
        <p className="text-sm text-blue-700">
          Defend your castle from waves of enemies by strategically placing towers along the path
        </p>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🎮 How to Play
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click tower buttons to select</li>
          <li>• Place on empty ground tiles</li>
          <li>• Start waves when ready</li>
          <li>• Protect your castle!</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Towers
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 🏹 Archer: Fast attacks (50g)</li>
          <li>• 💣 Cannon: Splash damage (100g)</li>
          <li>• ❄️ Ice: Slows enemies (75g)</li>
          <li>• Earn gold by defeating enemies</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Difficulty
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Easy: Meadow 🌿 (5 waves)</li>
          <li>• Moderate: Forest 🌲 (7 waves)</li>
          <li>• Hard: Fortress 🏯 (10 waves)</li>
          <li>• Time limit: 3 minutes</li>
        </ul>
      </div>
    </div>
  );

  return (
    <GameFrameworkV2
      gameTitle="Castle Defender"
      gameShortDescription="Defend your castle with strategic tower placement"
      category="Strategy"
      gameState={gameState}
      setGameState={setGameState}
      score={score}
      timeRemaining={timeRemaining}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      onStart={handleStart}
      onReset={handleReset}
      instructionsSection={instructionsSection}
      showHeader={false}
    >
      <CastleDefenderCore
        key={levelIdx}
        levelIdx={levelIdx}
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        setScore={setScore}
        timeRemaining={timeRemaining}
        setTimeRemaining={setTimeRemaining}
      />
    </GameFrameworkV2>
  );
}

/* ─────────────────── CORE GAME COMPONENT (preserves all original CSS & graphics) ─────────────────── */
function CastleDefenderCore({ levelIdx, gameState, setGameState, score, setScore, timeRemaining, setTimeRemaining }) {
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
    if (gameState !== 'playing') return;
    
    stateRef.current = {
      phase:'placing', gold:level.startGold, castleHP:level.castleHP, maxHP:level.castleHP,
      wave:0, towers:[], enemies:[], projectiles:[], particles:[],
      selectedTower:null, timeLeft:TIME_LIMIT, score:0,
      spawnQueue:[], spawnTimer:0, lastTime:performance.now(),
      screenShake:0, waveAnnounce:'', waveAnnounceTimer:0, goldPopups:[], killStreak:0, streakTimer:0,
    };
    forceUpdate(n=>n+1);
  }, [level, gameState]);

  const getTileSize = useCallback(() => {
    if (!containerRef.current) return 48;
    const rect = containerRef.current.getBoundingClientRect();
    const tw = Math.floor((rect.width-20)/level.cols);
    const th = Math.floor((rect.height-20)/level.rows);
    return Math.max(28, Math.min(56, Math.min(tw, th)));
  }, [level]);

  // ── GAME LOOP ──
  useEffect(() => {
    const s = stateRef.current;
    if (!s || gameState !== 'playing') return;
    let running = true;

    const tick = (now) => {
      if (!running) return;
      const dt = Math.min((now - s.lastTime)/1000, 0.05);
      s.lastTime = now;

      // Streak decay
      if (s.streakTimer > 0) { s.streakTimer -= dt; if (s.streakTimer <= 0) s.killStreak = 0; }

      if (s.phase==='fighting'||s.phase==='waveComplete') {
        s.timeLeft -= dt;
        setTimeRemaining(Math.ceil(s.timeLeft));
        if (s.timeLeft <= 0) { 
          s.timeLeft=0; 
          s.phase='gameOver'; 
          sfx.defeat(); 
          setGameState('finished');
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
            sfx.castleHit();
            if(s.castleHP<=0) { s.phase='gameOver'; sfx.defeat(); setGameState('finished'); }
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
            if(t.type==='archer')sfx.arrow(); else if(t.type==='cannon')sfx.cannon(); else sfx.ice();
          }
        }

        // Move projectiles
        for (const p of s.projectiles) {
          const dx=p.tx-p.x, dy=p.ty-p.y, d=Math.sqrt(dx*dx+dy*dy);
          if (d < 0.2) {
            p.hit=true;
            if (p.special==='splash') {
              for(const e of s.enemies) { if(e.hp<=0)continue; if(dist([p.ty,p.tx],getEnemyPos(e,level.path))<1.5) { e.hp-=p.damage; sfx.hit(); }}
              for(let i=0;i<15;i++) s.particles.push(makeParticle(p.x,p.y,'#ff6600',0.7));
              for(let i=0;i<8;i++) s.particles.push(makeParticle(p.x,p.y,'#ffcc00',0.5));
            } else {
              const target=s.enemies.find(e=>e.id===p.targetId);
              if(target&&target.hp>0) {
                target.hp-=p.damage;
                if(p.special==='slow') { target.slowFactor=0.5; target.slowTimer=2; for(let i=0;i<8;i++) s.particles.push(makeParticle(p.x,p.y,'#4fc3f7',0.5)); }
                sfx.hit();
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
              s.gold+=e.reward; s.killStreak++; s.streakTimer=2;
              s.score += e.reward;
              setScore(s.score);
              const ep=getEnemyPos(e,level.path);
              s.goldPopups.push({x:ep[1],y:ep[0],amount:e.reward,timer:1.2,streak:s.killStreak});
              sfx.kill();
              for(let i=0;i<10;i++) s.particles.push(makeParticle(ep[1],ep[0],e.color,0.6));
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
            s.phase='levelComplete'; 
            const finalScore = Math.round(67*(s.castleHP/s.maxHP));
            s.score = finalScore;
            setScore(finalScore);
            sfx.victory();
            setGameState('finished');
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
  }, [level, getTileSize, gameState, setGameState, setScore, setTimeRemaining]);

  const startWave = () => {
    const s=stateRef.current;
    if(!s||(s.phase!=='placing'&&s.phase!=='waveComplete')) return;
    s.wave++; s.spawnQueue=level.waveGen(s.wave); s.spawnTimer=0;
    s.phase='fighting'; s.waveAnnounce=`⚔️ Wave ${s.wave}`; s.waveAnnounceTimer=1.5;
    sfx.wave(); forceUpdate(n=>n+1);
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
    sfx.place(); forceUpdate(n=>n+1);
  };

  const selectTower = (type) => {
    const s=stateRef.current;
    if(!s) return;
    s.selectedTower = s.selectedTower===type?null:type;
    forceUpdate(n=>n+1);
  };

  const s = stateRef.current;
  if (!s || gameState !== 'playing') return null;

  if (!orient) return (
    <div style={{position:'fixed',inset:0,background:'#0a0a1a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:20,zIndex:9999,textAlign:'center',padding:40,flexDirection:'column',gap:16}}>
      <div style={{fontSize:48}}>📱</div>
      <div style={{fontWeight:700}}>Please Rotate Your Device</div>
      <div style={{fontSize:14,color:'#888'}}>This game requires landscape orientation</div>
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
    <div style={{position:'fixed',inset:0,background:level.bgGrad,display:'flex',flexDirection:'column',fontFamily:'"Segoe UI",sans-serif',color:'#fff',overflow:'hidden',userSelect:'none'}}>
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
            const x=pos[1]*ts,y=pos[0]*ts,sz=ts*e.size;
            const icon=e.type==='soldier'?'🧑‍🌾':e.type==='knight'?'🛡️':'🐏';
            const hpPctE=e.hp/e.maxHp;
            return (
              <div key={e.id} style={{position:'absolute',left:x+ts/2-sz/2,top:y+ts/2-sz/2,width:sz,height:sz,zIndex:3,pointerEvents:'none',transition:'left 0.05s linear,top 0.05s linear'}}>
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
