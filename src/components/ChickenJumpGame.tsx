import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ArrowLeft, Award, Sparkles, Pause } from 'lucide-react';
import { soundManager } from '../utils/sound.ts';
import { GameRecord } from '../types.ts';

interface ChickenJumpGameProps {
  currentPoints: number;
  onPointsChange: (newPoints: number) => void;
  onRecordGame: (record: GameRecord) => void;
  onReturnToLobby: () => void;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: 'fence' | 'hay' | 'fox';
  passed: boolean;
}

interface CoinItem {
  x: number;
  y: number;
  collected: boolean;
  angle: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

export const ChickenJumpGame: React.FC<ChickenJumpGameProps> = ({
  currentPoints,
  onPointsChange,
  onRecordGame,
  onReturnToLobby,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameover'>('playing');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [seedsCollected, setSeedsCollected] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mutable Game Loop State in Ref to avoid re-render delays
  const engineRef = useRef({
    chicken: {
      x: 80,
      y: 260,
      vy: 0,
      width: 44,
      height: 44,
      jumpCount: 0,
      isGrounded: true,
      legCycle: 0,
      wingFlap: 0,
    },
    gravity: 0.65,
    jumpStrength: -11.5,
    groundY: 290,
    gameSpeed: 4.8,
    obstacles: [] as Obstacle[],
    coins: [] as CoinItem[],
    particles: [] as Particle[],
    clouds: [
      { x: 50, y: 40, s: 0.4, w: 70 },
      { x: 280, y: 70, s: 0.6, w: 90 },
      { x: 520, y: 35, s: 0.5, w: 80 },
      { x: 740, y: 60, s: 0.3, w: 60 },
    ],
    hillsOffset: 0,
    lastObstacleSpawn: 0,
    lastCoinSpawn: 0,
    frameCount: 0,
    currentScore: 0,
    currentDistance: 0,
    currentSeeds: 0,
    isOver: false,
    isPaused: false,
  });

  // Handle jump
  const handleJump = useCallback(() => {
    const e = engineRef.current;
    if (e.isOver || e.isPaused) return;

    if (e.chicken.isGrounded) {
      e.chicken.vy = e.jumpStrength;
      e.chicken.isGrounded = false;
      e.chicken.jumpCount = 1;
      e.chicken.wingFlap = 1;
      soundManager.playJump();

      // Jump dust particles
      for (let i = 0; i < 6; i++) {
        e.particles.push({
          x: e.chicken.x + 10,
          y: e.groundY + 10,
          vx: (Math.random() - 0.5) * 3 - 2,
          vy: -Math.random() * 2 - 0.5,
          color: '#d6c7a1',
          size: 3 + Math.random() * 3,
          alpha: 1,
        });
      }
    } else if (e.chicken.jumpCount === 1) {
      // Double jump / flap
      e.chicken.vy = e.jumpStrength * 0.9;
      e.chicken.jumpCount = 2;
      e.chicken.wingFlap = 2;
      soundManager.playFlap();

      // Feather particles
      for (let i = 0; i < 4; i++) {
        e.particles.push({
          x: e.chicken.x + 15,
          y: e.chicken.y + 20,
          vx: (Math.random() - 0.5) * 2 - 1,
          vy: Math.random() * 2 + 1,
          color: '#ffffff',
          size: 4,
          alpha: 1,
        });
      }
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.key === 'w' || ev.key === 'W') {
        ev.preventDefault();
        handleJump();
      } else if (ev.code === 'KeyP') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  const togglePause = () => {
    const e = engineRef.current;
    if (e.isOver) return;
    e.isPaused = !e.isPaused;
    setGameState(e.isPaused ? 'paused' : 'playing');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  const restartGame = () => {
    if (currentPoints < 20) {
      // Need points!
      alert('You need at least 20 points to start a run! Please return to the lobby and watch a rewarded ad.');
      return;
    }

    // Deduct 20 points for restarting
    onPointsChange(currentPoints - 20);

    const e = engineRef.current;
    e.chicken = {
      x: 80,
      y: 260,
      vy: 0,
      width: 44,
      height: 44,
      jumpCount: 0,
      isGrounded: true,
      legCycle: 0,
      wingFlap: 0,
    };
    e.gameSpeed = 4.8;
    e.obstacles = [];
    e.coins = [];
    e.particles = [];
    e.frameCount = 0;
    e.currentScore = 0;
    e.currentDistance = 0;
    e.currentSeeds = 0;
    e.isOver = false;
    e.isPaused = false;

    setScore(0);
    setDistance(0);
    setSeedsCollected(0);
    setGameState('playing');
  };

  // Main Canvas Render and Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = () => {
      const e = engineRef.current;
      const width = canvas.width;
      const height = canvas.height;

      if (!e.isPaused && !e.isOver) {
        e.frameCount++;
        e.currentDistance += Math.round(e.gameSpeed * 0.15);
        e.currentScore = Math.floor(e.currentDistance / 10) + e.currentSeeds * 25;
        e.gameSpeed = Math.min(9.5, 4.8 + Math.floor(e.currentDistance / 400) * 0.4);

        // Update state periodically for React UI
        if (e.frameCount % 5 === 0) {
          setScore(e.currentScore);
          setDistance(e.currentDistance);
          setSeedsCollected(e.currentSeeds);
        }

        // Chicken physics
        e.chicken.vy += e.gravity;
        e.chicken.y += e.chicken.vy;

        if (e.chicken.y >= e.groundY - e.chicken.height) {
          e.chicken.y = e.groundY - e.chicken.height;
          e.chicken.vy = 0;
          e.chicken.isGrounded = true;
          e.chicken.jumpCount = 0;
          e.chicken.wingFlap = 0;
        }

        e.chicken.legCycle += 0.3 * (e.gameSpeed / 4.8);

        // Cloud animation
        e.clouds.forEach((cloud) => {
          cloud.x -= cloud.s;
          if (cloud.x + cloud.w < 0) {
            cloud.x = width + Math.random() * 80;
            cloud.y = 30 + Math.random() * 80;
          }
        });

        // Hills parallax
        e.hillsOffset = (e.hillsOffset + e.gameSpeed * 0.3) % 400;

        // Obstacle Spawning
        if (e.frameCount - e.lastObstacleSpawn > 80 + Math.random() * 60) {
          const types: ('fence' | 'hay' | 'fox')[] = ['fence', 'hay', 'fox'];
          const type = types[Math.floor(Math.random() * types.length)];
          let oWidth = 32;
          let oHeight = 36;
          if (type === 'hay') {
            oWidth = 38;
            oHeight = 32;
          } else if (type === 'fox') {
            oWidth = 44;
            oHeight = 28;
          }

          e.obstacles.push({
            x: width + 20,
            width: oWidth,
            height: oHeight,
            type,
            passed: false,
          });
          e.lastObstacleSpawn = e.frameCount;
        }

        // Coin/Seed Spawning
        if (e.frameCount - e.lastCoinSpawn > 65 + Math.random() * 50) {
          const isHigh = Math.random() > 0.45;
          e.coins.push({
            x: width + 20,
            y: isHigh ? e.groundY - 80 - Math.random() * 30 : e.groundY - 40,
            collected: false,
            angle: 0,
          });
          e.lastCoinSpawn = e.frameCount;
        }

        // Move Obstacles & Check Collisions
        for (let i = e.obstacles.length - 1; i >= 0; i--) {
          const obs = e.obstacles[i];
          obs.x -= e.gameSpeed;

          // Hitbox check
          const chickenBox = {
            x: e.chicken.x + 8,
            y: e.chicken.y + 6,
            w: e.chicken.width - 16,
            h: e.chicken.height - 10,
          };
          const obsBox = {
            x: obs.x + 4,
            y: e.groundY - obs.height + 4,
            w: obs.width - 8,
            h: obs.height - 4,
          };

          if (
            chickenBox.x < obsBox.x + obsBox.w &&
            chickenBox.x + chickenBox.w > obsBox.x &&
            chickenBox.y < obsBox.y + obsBox.h &&
            chickenBox.y + chickenBox.h > obsBox.y
          ) {
            // Collision! Game Over!
            e.isOver = true;
            soundManager.playGameOver();
            setGameState('gameover');

            // Record to history
            const bonusEarned = e.currentSeeds * 2;
            const newPoints = currentPoints + bonusEarned;
            onPointsChange(newPoints);

            onRecordGame({
              id: Date.now().toString(),
              date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              score: e.currentScore,
              distance: e.currentDistance,
              seedsCollected: e.currentSeeds,
              pointsSpent: 20,
              pointsEarned: bonusEarned,
            });
            break;
          }

          if (obs.x + obs.width < 0) {
            e.obstacles.splice(i, 1);
          }
        }

        // Move Coins & Check Pickup
        for (let i = e.coins.length - 1; i >= 0; i--) {
          const coin = e.coins[i];
          coin.x -= e.gameSpeed;
          coin.angle += 0.08;

          // Pickup check
          const dist = Math.hypot(
            e.chicken.x + e.chicken.width / 2 - (coin.x + 10),
            e.chicken.y + e.chicken.height / 2 - (coin.y + 10)
          );

          if (dist < 28 && !coin.collected) {
            coin.collected = true;
            e.currentSeeds++;
            soundManager.playCoin();

            // Spawn golden sparkle particles
            for (let p = 0; p < 8; p++) {
              e.particles.push({
                x: coin.x + 10,
                y: coin.y + 10,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#fbbf24',
                size: 2.5 + Math.random() * 2.5,
                alpha: 1,
              });
            }

            e.coins.splice(i, 1);
          } else if (coin.x < -30) {
            e.coins.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = e.particles.length - 1; i >= 0; i--) {
          const p = e.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.035;
          if (p.alpha <= 0) {
            e.particles.splice(i, 1);
          }
        }
      }

      // -------------------------------------------------------------
      // RENDERING CANVAS GRAPHICS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, width, height);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#bae6fd');
      skyGrad.addColorStop(0.65, '#e0f2fe');
      skyGrad.addColorStop(1, '#fef9c3');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Sun
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(width - 70, 55, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
      ctx.beginPath();
      ctx.arc(width - 70, 55, 48, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      e.clouds.forEach((cloud) => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 16, 0, Math.PI * 2);
        ctx.arc(cloud.x + 18, cloud.y - 8, 22, 0, Math.PI * 2);
        ctx.arc(cloud.x + 40, cloud.y - 4, 18, 0, Math.PI * 2);
        ctx.arc(cloud.x + 55, cloud.y, 14, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant rolling hills
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, e.groundY);
      for (let x = 0; x <= width + 60; x += 40) {
        const hillY = e.groundY - 50 + Math.sin((x + e.hillsOffset) * 0.015) * 22;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(width, e.groundY);
      ctx.lineTo(0, e.groundY);
      ctx.fill();

      // Middleground green field
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(0, e.groundY);
      for (let x = 0; x <= width + 40; x += 30) {
        const fieldY = e.groundY - 24 + Math.sin((x + e.hillsOffset * 1.5) * 0.02) * 12;
        ctx.lineTo(x, fieldY);
      }
      ctx.lineTo(width, e.groundY);
      ctx.lineTo(0, e.groundY);
      ctx.fill();

      // Barn in the distance
      const barnX = ((width * 0.7 - e.hillsOffset * 0.4) % (width + 200)) - 80;
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(barnX, e.groundY - 50, 48, 36);
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(barnX - 6, e.groundY - 50);
      ctx.lineTo(barnX + 24, e.groundY - 70);
      ctx.lineTo(barnX + 54, e.groundY - 50);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(barnX + 16, e.groundY - 32, 16, 18);

      // Dirt Ground
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, e.groundY, width, height - e.groundY);

      // Lush Top Grass border
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, e.groundY - 4, width, 10);
      // Grass tufts
      ctx.fillStyle = '#16a34a';
      for (let g = 0; g < width; g += 24) {
        const tuftOffset = (g - (e.frameCount * e.gameSpeed) % 24);
        ctx.beginPath();
        ctx.moveTo(tuftOffset, e.groundY - 4);
        ctx.lineTo(tuftOffset + 4, e.groundY - 10);
        ctx.lineTo(tuftOffset + 8, e.groundY - 4);
        ctx.fill();
      }

      // Draw Collectible Corn Seeds
      e.coins.forEach((coin) => {
        const cx = coin.x + 10;
        const cy = coin.y + 10 + Math.sin(coin.angle * 2) * 4;

        ctx.save();
        ctx.translate(cx, cy);

        // Glow
        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Golden Corn Cob
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Green husk
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.moveTo(-4, 4);
        ctx.quadraticCurveTo(-10, 12, -2, 12);
        ctx.lineTo(0, 8);
        ctx.fill();

        ctx.restore();
      });

      // Draw Obstacles
      e.obstacles.forEach((obs) => {
        const oy = e.groundY - obs.height;

        if (obs.type === 'fence') {
          // Wooden rustic farm fence
          ctx.fillStyle = '#92400e';
          // Posts
          ctx.fillRect(obs.x + 4, oy, 6, obs.height);
          ctx.fillRect(obs.x + obs.width - 10, oy, 6, obs.height);
          // Horizontal slats
          ctx.fillRect(obs.x, oy + 8, obs.width, 5);
          ctx.fillRect(obs.x, oy + obs.height - 12, obs.width, 5);
          // Pointed tops
          ctx.beginPath();
          ctx.moveTo(obs.x + 4, oy);
          ctx.lineTo(obs.x + 7, oy - 4);
          ctx.lineTo(obs.x + 10, oy);
          ctx.fill();
        } else if (obs.type === 'hay') {
          // Round golden hay bale
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2, oy + obs.height / 2, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, oy + obs.height / 2, 8, 0, Math.PI * 2);
          ctx.stroke();
        } else if (obs.type === 'fox') {
          // Sneaky orange farm fox
          ctx.fillStyle = '#ea580c';
          // Body
          ctx.beginPath();
          ctx.ellipse(obs.x + 22, oy + 16, 18, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          // Head
          ctx.beginPath();
          ctx.arc(obs.x + 10, oy + 10, 9, 0, Math.PI * 2);
          ctx.fill();
          // Ears
          ctx.beginPath();
          ctx.moveTo(obs.x + 6, oy + 4);
          ctx.lineTo(obs.x + 9, oy - 4);
          ctx.lineTo(obs.x + 13, oy + 4);
          ctx.fill();
          // White muzzle
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(obs.x + 6, oy + 12, 4, 0, Math.PI * 2);
          ctx.fill();
          // Black nose
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.arc(obs.x + 4, oy + 11, 2, 0, Math.PI * 2);
          ctx.fill();
          // Fluffy tail
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.ellipse(obs.x + 38, oy + 12, 10, 6, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(obs.x + 44, oy + 10, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Particles
      e.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // -------------------------------------------------------------
      // DRAW THE CHICKEN!
      // -------------------------------------------------------------
      const ch = e.chicken;
      ctx.save();
      ctx.translate(ch.x + ch.width / 2, ch.y + ch.height / 2);

      // Tilt slightly based on jump velocity
      const tilt = Math.max(-0.4, Math.min(0.4, ch.vy * 0.04));
      ctx.rotate(tilt);

      // Running legs (if grounded)
      if (ch.isGrounded) {
        const leg1Angle = Math.sin(ch.legCycle) * 0.5;
        const leg2Angle = Math.sin(ch.legCycle + Math.PI) * 0.5;

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Leg 1
        ctx.beginPath();
        ctx.moveTo(-6, 12);
        ctx.lineTo(-6 + Math.sin(leg1Angle) * 10, 20);
        ctx.lineTo(-2 + Math.sin(leg1Angle) * 10, 20);
        ctx.stroke();

        // Leg 2
        ctx.beginPath();
        ctx.moveTo(4, 12);
        ctx.lineTo(4 + Math.sin(leg2Angle) * 10, 20);
        ctx.lineTo(8 + Math.sin(leg2Angle) * 10, 20);
        ctx.stroke();
      } else {
        // Tucked jump legs
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-4, 12);
        ctx.lineTo(2, 16);
        ctx.stroke();
      }

      // Round Body (White/Cream feather fluff)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f5f5f4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tail feathers
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.quadraticCurveTo(-26, -10, -22, 2);
      ctx.lineTo(-14, 6);
      ctx.fill();

      // Wing (Flapping when in air)
      const flapOffset = ch.isGrounded ? 0 : Math.sin(e.frameCount * 0.6) * 7;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(-2, 2 - flapOffset, 11, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.stroke();

      // Red Comb on Top
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(4, -18, 5, 0, Math.PI * 2);
      ctx.arc(9, -20, 5.5, 0, Math.PI * 2);
      ctx.arc(14, -17, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Red Wattle under beak
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(14, 8, 4, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Beak
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(24, 2);
      ctx.lineTo(14, 6);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      // Eye shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(9, -5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentPoints, onPointsChange, onRecordGame]);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto select-none">
      {/* Active Game Header Controls */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-white rounded-t-2xl shadow-md border-b border-stone-800">
        <button
          id="return-to-lobby-btn"
          onClick={onReturnToLobby}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Lobby
        </button>

        {/* HUD Stats */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>Score: {score}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>🌽 {seedsCollected}</span>
          </div>

          <div className="text-stone-300 text-xs hidden sm:inline">
            Dist: {distance}m
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title={gameState === 'paused' ? 'Resume' : 'Pause'}
          >
            {gameState === 'paused' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Stage Container */}
      <div 
        className="relative w-full overflow-hidden bg-sky-100 shadow-xl rounded-b-2xl border-x border-b border-stone-300 cursor-pointer"
        onClick={handleJump}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-auto block"
        />

        {/* Mobile Jump Overlay Helper */}
        <div className="absolute bottom-4 right-4 sm:hidden">
          <button
            id="mobile-jump-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleJump();
            }}
            className="w-16 h-16 rounded-full bg-amber-500/90 text-white font-bold text-sm shadow-lg active:scale-95 flex items-center justify-center border-2 border-white/60"
          >
            JUMP
          </button>
        </div>

        {/* Controls Hint */}
        <div className="absolute top-3 left-4 pointer-events-none text-[11px] text-stone-600 bg-white/70 px-2.5 py-1 rounded-full backdrop-blur-xs font-medium border border-white/40">
          Press Space / Tap to Jump & Double Jump!
        </div>

        {/* Paused Overlay */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 z-20">
            <h3 className="text-3xl font-extrabold mb-2 tracking-wide font-['Fredoka']">GAME PAUSED</h3>
            <p className="text-xs text-stone-300 mb-6">Take a quick breather!</p>
            <button
              onClick={togglePause}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Resume Game
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mb-3 text-3xl">
              🐔
            </div>

            <h3 className="text-3xl font-black mb-1 tracking-tight text-amber-300 font-['Fredoka']">
              CHICKEN CRASHED!
            </h3>
            <p className="text-xs text-stone-300 mb-5">You hit an obstacle in the farmyard.</p>

            {/* Run Score Breakdown */}
            <div className="w-full max-w-xs bg-stone-900/90 border border-stone-700 rounded-2xl p-4 mb-6 text-xs divide-y divide-stone-800">
              <div className="flex justify-between py-1.5">
                <span className="text-stone-400">Final Score:</span>
                <span className="font-bold text-amber-400 text-sm">{score}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-400">Distance Traveled:</span>
                <span className="font-semibold text-stone-200">{distance} meters</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-400">Seeds Collected:</span>
                <span className="font-semibold text-emerald-400">🌽 {seedsCollected} (+{seedsCollected * 2} pts)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-400">Run Cost:</span>
                <span className="font-semibold text-rose-400">-20 points</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm">
                <span className="text-stone-300">Remaining Balance:</span>
                <span className="text-amber-300">{currentPoints} Points</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <button
                id="play-again-btn"
                onClick={restartGame}
                disabled={currentPoints < 20}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  currentPoints >= 20
                    ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-amber-500/20 active:scale-95'
                    : 'bg-stone-700 text-stone-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Play Again (-20 Pts)
              </button>

              <button
                id="back-to-lobby-btn"
                onClick={onReturnToLobby}
                className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
              >
                Lobby
              </button>
            </div>

            {currentPoints < 20 && (
              <p className="text-[11px] text-amber-300/90 mt-3 text-center">
                Low points! Return to lobby and watch a rewarded ad to get +200 points.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
