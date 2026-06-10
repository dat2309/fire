import { Particle } from '../types';

/**
 * Generates particle velocity and angle configurations based on firework type
 */

// Helper to convert full hex or presets into an actual array of vibrant colors
const HSL_PRESETS: { [key: string]: string[] } = {
  all: [
    'hsl(0, 100%, 65%)',     // Neon Pink
    'hsl(30, 100%, 60%)',    // Neon Orange
    'hsl(55, 100%, 55%)',    // Vibrant Yellow
    'hsl(120, 100%, 60%)',   // Neon Green
    'hsl(180, 100%, 55%)',   // Cyan Blue
    'hsl(250, 100%, 70%)',   // Purple Violet
    'hsl(280, 100%, 65%)',   // Magenta
    'hsl(330, 85%, 60%)',    // Sunset Pink
  ],
  gold: [
    'hsl(42, 100%, 62%)',    // Classic Gold
    'hsl(36, 100%, 55%)',    // Deep Amber
    'hsl(48, 100%, 70%)',    // White Gold
    'hsl(50, 100%, 50%)',    // Pure Gold
    'hsl(45, 90%, 40%)',     // Bronze Accent
  ],
  neon: [
    'hsl(315, 100%, 60%)',   // Shocking Pink
    'hsl(175, 100%, 50%)',   // Acid Cyan
    'hsl(85, 100%, 55%)',    // Lime Spark
    'hsl(200, 100%, 55%)',   // Sky Glow
    'hsl(285, 100%, 65%)',   // Cyber Purple
  ],
  cyanBlue: [
    'hsl(180, 100%, 50%)',   // Electric Cyan
    'hsl(195, 100%, 55%)',   // Sky Cyan
    'hsl(215, 100%, 60%)',   // Vibrant Ice
    'hsl(230, 100%, 60%)',   // Royal Indigo
    'hsl(185, 90%, 70%)',    // Pastel Aqua
  ],
  sunset: [
    'hsl(0, 100%, 60%)',     // Neon Red
    'hsl(15, 100%, 55%)',    // Tangerine
    'hsl(35, 100%, 55%)',    // Sun Yellow
    'hsl(335, 100%, 60%)',   // Hot Magenta
    'hsl(300, 100%, 50%)',   // Vivid Orchid
  ],
  emerald: [
    'hsl(120, 100%, 55%)',   // Mint Neon
    'hsl(140, 100%, 50%)',   // Emerald Green
    'hsl(160, 100%, 50%)',   // Seafoam Neon
    'hsl(95, 100%, 55%)',    // Bright Olive
    'hsl(130, 80%, 40%)',    // Deep Forest Glow
  ]
};

export function getRandomColorFromPreset(presetId: string, customHex?: string): string {
  if (presetId === 'custom' && customHex) {
    return customHex;
  }
  
  const preset = HSL_PRESETS[presetId] || HSL_PRESETS.all;
  return preset[Math.floor(Math.random() * preset.length)];
}

interface Velocity {
  vx: number;
  vy: number;
  color?: string;
  extraType?: 'crackler' | 'standard' | 'waterfall_drop';
  shimmer?: boolean;
}

/**
 * Create physical dynamics for particles based on requested shape
 */
export function generateShapeVelocities(
  type: string,
  baseCount: number,
  baseSpeed: number,
  presetId: string,
  customHex?: string,
  customText?: string
): Velocity[] {
  const velocities: Velocity[] = [];
  const primaryColor = getRandomColorFromPreset(presetId, customHex);
  
  switch (type) {
    case 'sphere': {
      // Standard circular ring-blast with outer high-velocity and inner randomized sparks
      for (let i = 0; i < baseCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Normal force distribution
        const localGrad = Math.random();
        // Rings layer effect
        const speedMultiplier = (0.3 + localGrad * 0.7) * (Math.random() > 0.85 ? 1.25 : 1.0);
        const speed = baseSpeed * speedMultiplier * 4.5;
        
        // Random coloring for multi preset
        const col = presetId === 'multi' 
          ? getRandomColorFromPreset('all') 
          : getRandomColorFromPreset(presetId, customHex);

        velocities.push({
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: col,
          shimmer: Math.random() > 0.75
        });
      }
      break;
    }
    
    case 'heart': {
      // Parametric Heart Equation:
      // x = 16 * sin^3(t)
      // y = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
      for (let i = 0; i < baseCount; i++) {
        // Distribute strictly over parametric range
        const t = (i / baseCount) * Math.PI * 2 + (Math.random() * 0.05);
        
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        // Inject slight randomness to make the heart have some depth (thickness)
        const densityFactor = 0.7 + Math.random() * 0.3;
        const scale = baseSpeed * 0.25 * densityFactor;
        
        const col = presetId === 'multi' 
          ? getRandomColorFromPreset('all') 
          : getRandomColorFromPreset(presetId, customHex);

        velocities.push({
          vx: hx * scale,
          vy: hy * scale,
          color: col
        });
      }
      break;
    }

    case 'star': {
      // 5-pointed star points calculated by interpolation between inner/outer corners
      const points = 5;
      const step = Math.PI / points;
      const outerR = 5 * baseSpeed;
      const innerR = 2 * baseSpeed;

      // Draw outlines and fill interior
      for (let i = 0; i < baseCount; i++) {
        // Calculate point index
        const index = Math.floor(Math.random() * points * 2);
        const nextIndex = (index + 1) % (points * 2);

        const r1 = index % 2 === 0 ? outerR : innerR;
        const r2 = nextIndex % 2 === 0 ? outerR : innerR;

        const a1 = index * step - Math.PI / 2;
        const a2 = nextIndex * step - Math.PI / 2;

        const x1 = Math.cos(a1) * r1;
        const y1 = Math.sin(a1) * r1;
        const x2 = Math.cos(a2) * r2;
        const y2 = Math.sin(a2) * r2;

        // Linear interpolation along outer edge of star segment
        const lerpVal = Math.random();
        const vx = x1 + (x2 - x1) * lerpVal;
        const vy = y1 + (y2 - y1) * lerpVal;

        // Apply a multiplier so it expands
        const expansionFactor = 0.8 + Math.random() * 0.4;
        
        const col = presetId === 'multi'
          ? getRandomColorFromPreset('all')
          : getRandomColorFromPreset(presetId, customHex);

        velocities.push({
          vx: vx * expansionFactor,
          vy: vy * expansionFactor,
          color: col,
          shimmer: true
        });
      }
      break;
    }

    case 'spiral': {
      // Archimedean Spiral pattern $r = a * \theta$ with dynamic rotational angle
      const spiralsCount = 3; // number of legs
      for (let i = 0; i < baseCount; i++) {
        // Distribute along spiral arms
        const percentage = i / baseCount;
        const theta = percentage * Math.PI * 4; // Multiple rotations
        const armIndex = i % spiralsCount;
        const offsetAngle = (armIndex * Math.PI * 2) / spiralsCount;
        
        const finalAngle = theta + offsetAngle;
        const r = percentage * baseSpeed * 4.5 + (Math.random() * 0.3);

        const col = presetId === 'multi' 
          ? getRandomColorFromPreset('all') 
          : getRandomColorFromPreset(presetId, customHex);

        velocities.push({
          vx: Math.cos(finalAngle) * r,
          vy: Math.sin(finalAngle) * r,
          color: col,
          shimmer: Math.random() > 0.6
        });
      }
      break;
    }

    case 'multistage': {
      // Multi-stage spawns primary central ring and secondary heavy rocket-shells
      // High speed rocket shell particles that will explode in the frame later,
      // plus standard immediate ring explosion particles. We mark some particles
      // as 'crackler' types which act as sub-bursts.
      for (let i = 0; i < baseCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const isShell = Math.random() > 0.75;
        
        const speedMultiplier = isShell ? (1.2 + Math.random() * 0.4) : (0.4 + Math.random() * 0.5);
        const speed = baseSpeed * speedMultiplier * 4.0;
        
        const col = presetId === 'multi' 
          ? getRandomColorFromPreset('all') 
          : getRandomColorFromPreset(presetId, customHex);

        velocities.push({
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: col,
          extraType: isShell ? 'crackler' : 'standard',
          shimmer: isShell
        });
      }
      break;
    }

    case 'waterfall': {
      // Waterfall / Rain (Kamuro) effect: particles shoot slightly upwards and outwards,
      // then hang in the air and cascade downwards with long golden glowing tails like a weeping willow.
      for (let i = 0; i < baseCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Mild horizontal drift to create a wide hanging curtain
        const vx = (Math.random() - 0.5) * baseSpeed * 2.8;
        // Launch upwards and slightly downwards to form a full dome initially
        const vy = (Math.random() - 0.75) * baseSpeed * 1.8;

        const col = presetId === 'multi'
          ? getRandomColorFromPreset('all')
          : getRandomColorFromPreset(presetId, customHex);

        velocities.push({
          vx,
          vy,
          color: col,
          extraType: 'waterfall_drop',
          shimmer: Math.random() > 0.35 // Higher shimmer rate for glistening water droplets
        });
      }
      break;
    }

    case 'text': {
      // Fire letters: Render text onto hidden offscreen canvas, sample pixel densities,
      // and map them into particle velocities!
      const text = (customText || 'WOW').trim().substring(0, 10);
      const points = sampleTextCoordinates(text);
      
      if (points.length === 0) {
        // Fallback to sphere if text parse returned null or failed
        return generateShapeVelocities('sphere', baseCount, baseSpeed, presetId, customHex);
      }

      // Generate particles by drawing coordinates randomly from our sampled points pool
      for (let i = 0; i < baseCount; i++) {
        const pt = points[i % points.length];
        // Inject tiny dispersal noise so letters expand and twinkle realistically
        const noiseX = (Math.random() - 0.5) * 0.15;
        const noiseY = (Math.random() - 0.5) * 0.15;
        
        // Scale vector out from center
        const scale = baseSpeed * 0.65;
        
        const col = presetId === 'multi' 
          ? getRandomColorFromPreset('all') 
          : getRandomColorFromPreset(presetId, customHex);

        velocities.push({
          vx: (pt.x + noiseX) * scale,
          vy: (pt.y + noiseY) * scale,
          color: col,
          shimmer: Math.random() > 0.6
        });
      }
      break;
    }

    default: {
      // Default to standard spherical
      return generateShapeVelocities('sphere', baseCount, baseSpeed, presetId, customHex);
    }
  }

  return velocities;
}

/**
 * Samples pixel locations on a virtual offscreen canvas to arrange particles into readable text letters!
 * Returns coordinates normalized between [-5, 5] centered at (0, 0).
 */
function sampleTextCoordinates(text: string): { x: number; y: number }[] {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Style typography
    ctx.font = 'bold 20px "Inter", "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    const coords: { x: number; y: number }[] = [];

    // Sample pixels: Step by 1 or 2 to control density
    const step = 2;
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const index = (y * canvas.width + x) * 4;
        const r = pixels[index];
        // If white pixel is detected, save its relative location
        if (r > 128) {
          // Normalize around center
          const rx = (x - canvas.width / 2) / 6.0;
          const ry = (y - canvas.height / 2) / 6.0;
          coords.push({ x: rx, y: ry });
        }
      }
    }
    return coords;
  } catch (e) {
    console.error('Error rendering text coordinates to canvas:', e);
    return [];
  }
}
