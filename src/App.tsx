import { useState, useRef } from 'react';
import { SimulationSettings, FireworkType } from './types';
import BackgroundSky from './components/BackgroundSky';
import FireworksCanvas from './components/FireworksCanvas';
import ControlsPanel from './components/ControlsPanel';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, HelpCircle, X, Volume2, Info, Moon } from 'lucide-react';
import { audioSystem } from './utils/audio';

export default function App() {
  const [settings, setSettings] = useState<SimulationSettings>({
    type: 'random',
    colorPresetId: 'all',
    customColor: '#10b981',
    particleCount: 180,
    size: 1.4,
    speed: 1.0,
    gravity: 0.05,
    decay: 0.97,
    trailLength: 1.2,
    soundEnabled: true,
    soundVolume: 0.5,
    autoMode: true, // starts with automatic show on load
    autoInterval: 1400,
    customText: '2026',
    showClouds: true,
    showCityscape: true,
    showConstellations: true,
    shimmerEffect: true
  });

  // Track if user has closed the first interaction intro screen (important for Web Audio context activation)
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(true);

  // Trigger manual launch immediately centered at a random width launching from center bottom
  const triggerManualLaunch = (type: FireworkType) => {
    const canvasElement = document.getElementById('fireworks-canvas') as HTMLCanvasElement;
    if (!canvasElement) return;

    const width = canvasElement.width;
    const height = canvasElement.height;

    // Pick a starting point slightly scattered around bottom center
    const startX = width / 2 + (Math.random() - 0.5) * 120;
    // Target somewhere in upper-mid sky
    const targetX = width / 2 + (Math.random() - 0.5) * width * 0.5;
    const targetY = height * (0.15 + Math.random() * 0.45);

    // Call internal launcher via synthetic click simulated event
    // Or we can trigger it programmatically if we expose a ref,
    // which is easily done by dispatching an event on the canvas itself!
    // Simply dispatching CustomEvent is elegant and completely decouples layers
    const event = new CustomEvent('manual-launch', {
      detail: { startX, startY: height, targetX, targetY, type }
    });
    canvasElement.dispatchEvent(event);
  };

  const handleStartShow = () => {
    // Resume audio context inside click handler to unblock browser sound blockages
    audioSystem.setEnabled(settings.soundEnabled);
    audioSystem.setVolume(settings.soundVolume);
    setHasInteracted(true);
    
    // Play sound indicators
    setTimeout(() => {
      audioSystem.playExplosion('sphere', 1.0);
    }, 400);
  };

  const handleSettingsChange = (update: Partial<SimulationSettings>) => {
    setSettings((prev) => ({ ...prev, ...update }));
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#020205] text-[#f1f5f9] font-sans">
      
      {/* 1. Starry Scenery, Clouds, and City Skyline */}
      <BackgroundSky
        showStars={settings.showConstellations}
        showClouds={settings.showClouds}
        showCityscape={settings.showCityscape}
      />

      {/* 2. Full-screen Interactive Firework Playing Canvas space */}
      <FireworksCanvas settings={settings} />

      {/* 4. Floating Quick Help Pill at top center */}
      {hasInteracted && showHelp && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto bg-slate-950/80 border border-slate-900 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 shadow-lg"
          >
            <span className="text-[10px] md:text-xs font-semibold text-slate-300 tracking-wide">
              💡 Chạm/Click lên trời để bắn • Nhấn giữ để bắn liên hồi
            </span>
            <button 
              onClick={() => setShowHelp(false)}
              className="p-0.5 hover:bg-slate-800 rounded-full cursor-pointer text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      )}

      {/* 5. Glassmorphism Controls Panel overlay */}
      {hasInteracted && (
        <ControlsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onLaunchManual={() => {
            // Find canvas and fire
            const canvas = document.getElementById('fireworks-canvas') as HTMLCanvasElement;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              const width = rect.width;
              // Simulate click launch event
              const customEv = new MouseEvent('mousedown', {
                clientX: rect.left + width / 2 + (Math.random() - 0.5) * 120,
                clientY: rect.top + rect.height * (0.2 + Math.random() * 0.35),
                bubbles: true
              });
              canvas.dispatchEvent(customEv);
              setTimeout(() => {
                const upEv = new MouseEvent('mouseup', { bubbles: true });
                canvas.dispatchEvent(upEv);
              }, 50);
            }
          }}
        />
      )}

      {/* 6. Audio Indicator Quick Info (Bottom-right corner) */}
      {hasInteracted && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 cursor-pointer pointer-events-auto bg-slate-950/80 border border-slate-900/40 px-3.5 py-1.5 rounded-full backdrop-blur-sm select-none shadow-md transition-all hover:border-indigo-500/40"
          onClick={() => handleSettingsChange({ soundEnabled: !settings.soundEnabled })}
        >
          <Volume2 className={`w-3.5 h-3.5 ${settings.soundEnabled ? 'text-indigo-400 animate-pulse' : 'text-gray-500'}`} />
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300">
            SOUND: {settings.soundEnabled ? 'ACTIVE' : 'MUTED'}
          </span>
        </div>
      )}

      {/* 7. Welcoming / Audio Initialization Screen overlay */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95"
          >
            {/* Ambient Background Glow inside Welcome Modal */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-around opacity-35 pointer-events-none">
              <div className="w-[300px] h-[300px] rounded-full bg-indigo-500/20 filter blur-[100px] animate-pulse" />
              <div className="w-[280px] h-[280px] rounded-full bg-violet-500/10 filter blur-[90px]" />
            </div>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full max-w-lg bg-slate-900/50 border border-slate-800/80 p-6 md:p-8 rounded-3xl text-center shadow-2xl backdrop-blur-xl flex flex-col items-center"
            >
              {/* Dynamic Logo Sparks with Elegant Indigo theme */}
              <div className="relative mb-5 flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 border border-indigo-500/40 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                <Moon className="absolute -top-1 -right-1 w-4 h-4 text-amber-300" />
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-wide mb-3 bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                AETHER PYRO
              </h2>
              
              <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-md mx-auto">
                Chào mừng bạn đến với mô phỏng pháo hoa nghệ thuật độc đáo. 
                Hãy kích hoạt hệ thống để sẵn sàng thưởng thức các vụ nổ rực rỡ và âm vang sống động.
              </p>

              {/* Enter Button */}
              <button
                onClick={handleStartShow}
                className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-400 hover:via-purple-400 hover:to-violet-500 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-white fill-white" />
                Khởi Động Trình Diễn
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
