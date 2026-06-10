import { useEffect, useRef, useState, MouseEvent, TouchEvent } from 'react';
import { SimulationSettings, Particle, LaunchRocket } from '../types';
import { generateShapeVelocities, getRandomColorFromPreset } from '../utils/shapes';
import { audioSystem } from '../utils/audio';

interface FireworksCanvasProps {
  settings: SimulationSettings;
}

export default function FireworksCanvas({ settings }: FireworksCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // States and refs to hold particles and rockets
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<LaunchRocket[]>([]);
  const settingsRef = useRef<SimulationSettings>(settings);
  
  // Track auto-trigger loop
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef<boolean>(false);
  const holdCoordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const holdTimerRef = useRef<number | null>(null);

  // FPS and system metrics for diagnostic overlay (if needed, elegant and minimalistic)
  const [fps, setFps] = useState<number>(60);
  const fpsIntervalRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // IDs tracking for unique elements
  const particleIdCounter = useRef<number>(0);
  const rocketIdCounter = useRef<number>(0);

  // Synchronize settings reference quickly without trigger re-renders
  useEffect(() => {
    settingsRef.current = settings;
    audioSystem.setEnabled(settings.soundEnabled);
    audioSystem.setVolume(settings.soundVolume);
  }, [settings]);

  // Handle continuous auto show firing
  useEffect(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    if (settings.autoMode) {
      const launchRandom = () => {
        if (!canvasRef.current) return;
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        
        // Launch 1 to 3 rockets simultaneously or sequentially
        const bursts = Math.floor(Math.random() * 2) + 1;
        for (let b = 0; b < bursts; b++) {
          const delay = b * 200 + Math.random() * 150;
          setTimeout(() => {
            const startX = Math.random() * (width - 150) + 75;
            // Target elevated in mid-sky
            const targetX = startX + (Math.random() - 0.5) * 150;
            const targetY = height * (0.15 + Math.random() * 0.45);
            launchRocket(startX, height, targetX, targetY);
          }, delay);
        }
      };

      // Tick initial and run intervals
      launchRandom();
      autoTimerRef.current = setInterval(launchRandom, settings.autoInterval);
    }

    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
      }
    };
  }, [settings.autoMode, settings.autoInterval]);

  // Setup Resize Observer for perfect fluid canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Launch a new rocket from bottom towards standard coords
  const launchRocket = (startX: number, startY: number, targetX: number, targetY: number) => {
    const s = settingsRef.current;
    const dy = targetY - startY;
    const dx = targetX - startX;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // speed scale based on height
    const speedFactor = (s.speed * 6) + (distance / 120);
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * speedFactor;
    const vy = Math.sin(angle) * speedFactor;

    // Pick vibrant colors for the launch trail
    const launchColor = getRandomColorFromPreset(s.colorPresetId, s.customColor);

    // Play whoosh sound
    audioSystem.playLaunch(distance / 500, s.speed);

    // Resolve random type choice to any of the specific visual firework types
    const types: ('sphere' | 'heart' | 'star' | 'spiral' | 'multistage' | 'text' | 'waterfall')[] = [
      'sphere', 'heart', 'star', 'spiral', 'multistage', 'text', 'waterfall'
    ];
    const resolvedType = s.type === 'random' ? types[Math.floor(Math.random() * types.length)] : s.type;

    const rocket: LaunchRocket = {
      id: rocketIdCounter.current++,
      startX,
      startY,
      x: startX,
      y: startY,
      targetX,
      targetY,
      vx,
      vy,
      progress: 0,
      speed: speedFactor,
      color: launchColor,
      trail: [],
      type: resolvedType,
      particleCount: s.particleCount,
      explosionSize: s.size,
      customText: s.customText,
      primaryColorHex: launchColor
    };

    rocketsRef.current.push(rocket);
  };

  // Triggers the beautiful structural explosion pattern
  const explodeRocket = (rocket: LaunchRocket) => {
    audioSystem.playExplosion(rocket.type, rocket.explosionSize);
    
    const count = Math.floor(rocket.particleCount);
    const speedMultiplier = rocket.explosionSize;
    const parentSettings = settingsRef.current;

    // Retrieve mathematical coordinates
    const velocities = generateShapeVelocities(
      rocket.type,
      count,
      speedMultiplier,
      parentSettings.colorPresetId,
      parentSettings.customColor,
      rocket.customText || parentSettings.customText
    );

    const newParticles: Particle[] = [];

    // Create a burst of sparks
    velocities.forEach((vel) => {
      const pId = particleIdCounter.current++;
      // Decay multiplier: randomized slightly for realistic scattered fading
      let localDecay = (0.007 + Math.random() * 0.015) * (1.1 - parentSettings.size * 0.05);
      let localGravity = parentSettings.gravity;
      let localTrail = Math.floor(5 + Math.random() * 10 * parentSettings.trailLength);

      // Enhance physical properties dynamically for weeping waterfall sparks
      if (vel.extraType === 'waterfall_drop') {
        localDecay *= 0.42; // Fall longer before fading out
        localGravity *= 1.45; // Drift downwards faster under heavy gravity weight
        localTrail = Math.floor((14 + Math.random() * 14) * parentSettings.trailLength);
      }

      newParticles.push({
        id: pId,
        x: rocket.x,
        y: rocket.y,
        vx: vel.vx,
        vy: vel.vy,
        color: vel.color || rocket.color,
        alpha: 1.0,
        decay: Math.max(0.003, Math.min(0.04, localDecay)),
        size: (1.5 + Math.random() * 2.2) * (parentSettings.size * 0.8),
        gravity: localGravity,
        friction: parentSettings.decay, // air drag
        trail: [],
        trailLength: localTrail,
        shimmer: vel.shimmer || (parentSettings.shimmerEffect && Math.random() > 0.6),
        sparkleChance: Math.random(),
        extraType: vel.extraType
      });
    });

    particlesRef.current.push(...newParticles);
  };

  // Trigger secondary bursts if rocket was 'crackler' type in multistage
  const triggerCracklerSubBurst = (p: Particle) => {
    const parentSettings = settingsRef.current;
    const burstsCount = Math.floor(5 + Math.random() * 8);
    const subParticles: Particle[] = [];

    // Quiet crackling sound is already handled by audioSystem delays in playExplosion,
    // but we can spawn the glowing sparks visually here.
    for (let i = 0; i < burstsCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 1.5) * parentSettings.size * 1.5;
      const col = getRandomColorFromPreset('gold'); // Golden sparkles

      subParticles.push({
        id: particleIdCounter.current++,
        x: p.x,
        y: p.y,
        vx: p.vx * 0.3 + Math.cos(angle) * speed,
        vy: p.vy * 0.3 + Math.sin(angle) * speed,
        color: col,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.02, // fades quickly
        size: 1.0 + Math.random() * 1.3,
        gravity: parentSettings.gravity * 0.7,
        friction: 0.96,
        trail: [],
        trailLength: 4,
        shimmer: true,
        sparkleChance: Math.random()
      });
    }

    particlesRef.current.push(...subParticles);
  };

  // Main high performance animation render loop
  useEffect(() => {
    let animationId: number;
    lastTimeRef.current = performance.now();

    const loop = (timestamp: number) => {
      // FPS measurement
      frameCountRef.current++;
      if (timestamp > lastTimeRef.current + 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (timestamp - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = timestamp;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        animationId = requestAnimationFrame(loop);
        return;
      }

      const screenWidth = canvas.width;
      const screenHeight = canvas.height;

      // Clear the screen fully for vectorized trailing line render (Zero ghosting!)
      ctx.clearRect(0, 0, screenWidth, screenHeight);

      // --- 1. RENDER & UPDATE ROCKETS ---
      const activeRockets = rocketsRef.current;
      const remainingRockets: LaunchRocket[] = [];

      for (let i = 0; i < activeRockets.length; i++) {
        const r = activeRockets[i];

        // Store trail
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 10) {
          r.trail.shift();
        }

        // Apply physics
        r.x += r.vx;
        r.y += r.vy;

        // Apply dynamic deceleration as it reaches target apex
        r.vx *= 0.98;
        r.vy *= 0.98;

        // Draw trail with elegant neon glow
        if (r.trail.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 2.0;
          ctx.lineCap = 'round';
          ctx.moveTo(r.trail[0].x, r.trail[0].y);
          for (let j = 1; j < r.trail.length; j++) {
            ctx.lineTo(r.trail[j].x, r.trail[j].y);
          }
          ctx.stroke();
        }

        // Check if rocket has reached target altitude or speed near zero
        const speedMagnitude = Math.sqrt(r.vx * r.vx + r.vy * r.vy);
        const reachedTargetVertical = r.vy >= -0.5 || r.y <= r.targetY;

        if (reachedTargetVertical || speedMagnitude < 1.0 || r.y <= 40) {
          // Detonate!
          explodeRocket(r);
        } else {
          // Draw rocket cap glow
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = r.color;
          ctx.fill();
          ctx.shadowBlur = 0; // reset shadow

          remainingRockets.push(r);
        }
      }
      rocketsRef.current = remainingRockets;

      // --- 2. RENDER & UPDATE PARTICLES ---
      const activeParticles = particlesRef.current;
      const remainingParticles: Particle[] = [];

      // Enable additive synthesis for real explosions!
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < activeParticles.length; i++) {
        const p = activeParticles[i];

        // Capture trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailLength) {
          p.trail.shift();
        }

        // Apply forces
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity; // Gravity pull

        p.x += p.vx;
        p.y += p.vy;

        // Fade out
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          // If multistage crackler shell, trigger secondary bursts upon death
          if (p.extraType === 'crackler') {
            triggerCracklerSubBurst(p);
          }
          continue; // discard particle
        }

        // Draw particle trail lines for high efficiency glow ribbons
        if (p.trail.length > 1) {
          ctx.beginPath();
          // Adjust opacity gradually across the length of the string
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.lineWidth = p.size * 0.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw main sparking head
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        let particleColor = p.color;
        
        // Custom twinkling glitter
        if (p.shimmer) {
          const rand = Math.random();
          if (rand > 0.5) {
            particleColor = '#ffffff'; // flashes white sparkles
          }
        }
        
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        remainingParticles.push(p);
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over'; // restore back to default
      particlesRef.current = remainingParticles;

      // --- 3. HANDLE PRESS-HOLD CONTINUOUS SPOTS ---
      if (isHoldingRef.current) {
        const now = timestamp;
        if (!holdTimerRef.current || now - holdTimerRef.current > 180) {
          holdTimerRef.current = now;
          // Launch towards hold cursor point
          const targetCoords = holdCoordsRef.current;
          // Spawn starting slightly randomly left or right of bottom center
          const sX = screenWidth / 2 + (Math.random() - 0.5) * 160;
          launchRocket(sX, screenHeight, targetCoords.x, targetCoords.y);
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Event interaction bindings for clicking / touching the playfield
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    isHoldingRef.current = true;
    holdCoordsRef.current = { x: clickX, y: clickY };
    holdTimerRef.current = performance.now();

    // Trigger immediate launch on touch
    const startX = rect.width / 2 + (Math.random() - 0.5) * 120;
    launchRocket(startX, rect.height, clickX, clickY);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isHoldingRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    holdCoordsRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseUpOrLeave = () => {
    isHoldingRef.current = false;
    holdTimerRef.current = null;
  };

  // Mobile Touch handlers
  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    // Prevent screen dragging scrolling during intense playing
    e.preventDefault();
    if (!canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const clickX = touch.clientX - rect.left;
    const clickY = touch.clientY - rect.top;

    isHoldingRef.current = true;
    holdCoordsRef.current = { x: clickX, y: clickY };
    holdTimerRef.current = performance.now();

    const startX = rect.width / 2 + (Math.random() - 0.5) * 100;
    launchRocket(startX, rect.height, clickX, clickY);
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    if (!isHoldingRef.current || !canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    holdCoordsRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Real-time interactive UI canvas */}
      <canvas
        ref={canvasRef}
        id="fireworks-canvas"
        className="absolute top-0 left-0 w-full h-full z-10 cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        onTouchCancel={handleMouseUpOrLeave}
      />
    </div>
  );
}
