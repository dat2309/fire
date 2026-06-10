export type FireworkType = 'random' | 'sphere' | 'heart' | 'star' | 'spiral' | 'multistage' | 'text' | 'waterfall';

export interface FireworkColorPreset {
  id: string;
  name: string;
  colors: string[]; // List of HSL values or Hex strings
}

export interface SimulationSettings {
  type: FireworkType;
  colorPresetId: string; // 'random', 'multi', 'gold', 'neon', etc.
  customColor: string; // Hex color if choosing exact custom color
  particleCount: number; // 50 to 400
  size: number; // 0.8 to 2.5 (size factor of explosion)
  speed: number; // 0.5 to 2.0 (speed of rocket & particles)
  gravity: number; // 0.02 to 0.15
  decay: number; // 0.95 to 0.99 (air resistance coefficient)
  trailLength: number; // 0.05 to 0.3 (opacity overlay for trailing blur)
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  autoMode: boolean; // Turn on automatic fireworks show
  autoInterval: number; // ms between automatic launches
  customText: string; // Dynamic text to render for 'text' pháo hoa
  showClouds: boolean;
  showCityscape: boolean;
  showConstellations: boolean;
  shimmerEffect: boolean; // extra twinkling sparks
}

export interface Particle {
  id: number;
  idAttribute?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string; // Hex, HSL, or RGB string
  alpha: number;
  decay: number; // Fade speed (0.005 to 0.03)
  size: number;
  gravity: number;
  friction: number;
  trail: { x: number; y: number }[];
  trailLength: number;
  shimmer: boolean;
  sparkleChance: number;
  extraType?: 'crackler' | 'standard' | 'waterfall_drop';
}

export interface LaunchRocket {
  id: number;
  idAttribute?: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  progress: number;
  speed: number;
  color: string;
  trail: { x: number; y: number }[];
  type: FireworkType;
  particleCount: number;
  explosionSize: number;
  customText?: string;
  primaryColorHex: string; // Keeptrack of actual launch color
}

export interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

export interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  alpha: number;
}
