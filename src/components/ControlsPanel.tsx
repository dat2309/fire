import { useState } from 'react';
import { SimulationSettings, FireworkType } from '../types';
import { 
  Volume2, VolumeX, Sparkles, Sliders, Settings2, Play, Pause, 
  Layers, Smile, Palette, Compass, RefreshCw, Eye, EyeOff, Layout, Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ControlsPanelProps {
  settings: SimulationSettings;
  onChange: (update: Partial<SimulationSettings>) => void;
  onLaunchManual: (type: FireworkType) => void;
}

export default function ControlsPanel({ settings, onChange, onLaunchManual }: ControlsPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'shapes' | 'styling' | 'physics' | 'scene'>('shapes');

  const shapeOptions: { id: FireworkType; label: string; icon: string; desc: string }[] = [
    { id: 'random', label: 'Ngẫu Nhiên', icon: '🎲', desc: 'Sự kết hợp ngẫu hứng của các loại pháo' },
    { id: 'sphere', label: 'Pháo Tròn', icon: '✨', desc: 'Bản sắc hình tròn cổ điển tỏa rộng' },
    { id: 'heart', label: 'Trái Tim', icon: '❤️', desc: 'Kiểu dáng lãng mạn lấp lánh' },
    { id: 'star', label: 'Ngôi Sao', icon: '⭐', desc: 'Nổi bật với cấu trúc 5 góc sắc bén' },
    { id: 'spiral', label: 'Xoắn Ốc', icon: '🌀', desc: 'Các tia pháo bung ra theo cung xoáy' },
    { id: 'multistage', label: 'Nhiều Tầng', icon: '🎇', desc: 'Kích nổ vỏ dồn dập, nổ tiếp tầng hai' },
    { id: 'text', label: 'Pháo Chữ', icon: '🔠', desc: 'Nổ bung ra các kí tự chữ tuỳ chọn' },
    { id: 'waterfall', label: 'Thác Nước', icon: '🌊', desc: 'Các hạt pháo rơi từ trên cao xuống như thác nước lấp lánh' },
  ];

  const presets = [
    {
      name: 'Lễ Hội Đa Sắc',
      settings: {
        type: 'sphere' as FireworkType,
        colorPresetId: 'all',
        particleCount: 260,
        size: 1.6,
        speed: 1.2,
        gravity: 0.05,
        shimmerEffect: true,
      }
    },
    {
      name: 'Ngôi Sao Vàng Kim',
      settings: {
        type: 'star' as FireworkType,
        colorPresetId: 'gold',
        particleCount: 200,
        size: 1.8,
        speed: 1.4,
        gravity: 0.04,
        shimmerEffect: true,
      }
    },
    {
      name: 'Ánh Dương Hoàng Hôn',
      settings: {
        type: 'heart' as FireworkType,
        colorPresetId: 'sunset',
        particleCount: 220,
        size: 1.5,
        speed: 1.1,
        gravity: 0.06,
        shimmerEffect: false,
      }
    },
    {
      name: 'Cyber Neon tương lai',
      settings: {
        type: 'spiral' as FireworkType,
        colorPresetId: 'neon',
        particleCount: 240,
        size: 1.3,
        speed: 1.3,
        gravity: 0.03,
        shimmerEffect: true,
      }
    },
    {
      name: 'Pháo Hoa Chữ Sinh Động',
      settings: {
        type: 'text' as FireworkType,
        colorPresetId: 'cyanBlue',
        particleCount: 300,
        size: 1.8,
        speed: 1.0,
        gravity: 0.04,
        customText: '2026',
        shimmerEffect: true,
      }
    }
  ];

  return (
    <>
      {/* Floating Gear Button (Visible when closed or on mobile dynamically) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          id="toggle-settings-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 hover:border-indigo-500/30 rounded-full shadow-lg backdrop-blur-md cursor-pointer transition-all active:scale-95"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Settings2 className={`w-5 h-5 text-indigo-400 ${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-300`} />
          <span className="text-xs font-bold tracking-wide">
            {isOpen ? 'Đóng Bảng' : 'Tùy Chỉnh Pháo'}
          </span>
        </motion.button>
      </div>

      {/* Control Configuration Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            id="control-hud-panel"
            className="fixed top-20 right-4 z-40 w-full max-w-[400px] max-h-[80vh] overflow-y-auto bg-slate-950/80 border border-slate-800/60 hover:border-indigo-500/30 text-slate-100 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col focus:outline-none transition-all duration-300"
          >
            {/* Header Status */}
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black tracking-wide flex items-center gap-1.5 text-slate-100">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Bảng Điều Khiển Mỹ Thuật
                </h2>
                <p className="text-[9px] text-gray-400 mt-0.5 font-mono">
                  CHẠM HOẶC DI CHUỘT LÊN TRỜI ĐỂ BẮN PHÁO
                </p>
              </div>

              {/* Sound toggle embedded quickly in header */}
              <button
                onClick={() => onChange({ soundEnabled: !settings.soundEnabled })}
                className={`p-2 rounded-full cursor-pointer transition-colors ${
                  settings.soundEnabled ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                }`}
                title={settings.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Sub Tabs navigation inside Glass Card */}
            <div className="flex border-b border-slate-900 bg-slate-950/40 select-none">
              {(
                [
                  { id: 'shapes', label: 'Kiểu Pháo', icon: Compass },
                  { id: 'styling', label: 'Bộ Màu', icon: Palette },
                  { id: 'physics', label: 'Vật Lý', icon: Sliders },
                  { id: 'scene', label: 'Bối Cảnh', icon: Layout }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 text-[11px] font-bold flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'text-indigo-400 border-indigo-400 bg-slate-900/30'
                        : 'text-gray-400 border-transparent hover:text-white hover:bg-slate-900/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content panel */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              
              {/* TAB 1: SHAPES AND TYPES */}
              {activeTab === 'shapes' && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    Chọn hình dáng pháo hoa hoạt động
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {shapeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onChange({ type: opt.id })}
                        className={`p-3 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border text-left cursor-pointer transition-all group flex flex-col justify-between ${
                          settings.type === opt.id
                            ? 'border-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.2)] bg-slate-900'
                            : 'border-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                          <span className="text-xs font-bold text-slate-200">{opt.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-2 block leading-snug">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Text Editor Input (Shows only if Custom Text is selected) */}
                  <AnimatePresence>
                    {settings.type === 'text' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden bg-slate-900/40 p-3.5 rounded-xl border border-dashed border-slate-800/60"
                      >
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                          <Type className="w-3.5 h-3.5 text-indigo-400" />
                          Nhập từ khoá pháo nổ (Tối đa 8 ký tự):
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          value={settings.customText}
                          onChange={(e) => onChange({ customText: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 uppercase tracking-widest font-mono font-bold"
                          placeholder="LOVE, 2026, CHAO"
                        />
                        <span className="text-[10px] text-gray-500 mt-1 block">
                          Tip: Bạn có thể nhập emoji như ✨, ❤️ để nổ hình siêu lạ mắt!
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Manual instant launch button */}
                  <div className="pt-2 border-t border-slate-900">
                    <button
                      onClick={() => onLaunchManual(settings.type)}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-400 hover:via-purple-400 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                    >
                      Bắn Pháo Ngay Lập Tức 🚀
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: COLORS AND TEXTURES */}
              {activeTab === 'styling' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Chọn Gam Màu Thẩm Mỹ
                  </h3>

                  <div className="space-y-2.5">
                    {(
                      [
                        { id: 'all', name: 'Đa Sắc Neon', preview: 'bg-gradient-to-r from-pink-500 via-yellow-400 to-teal-400' },
                        { id: 'gold', name: 'Hoàng Gia Vàng Kim', preview: 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700' },
                        { id: 'neon', name: 'Cyberpunk Cyber-Neon', preview: 'bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400' },
                        { id: 'cyanBlue', name: 'Đông Băng Bắc Cực', preview: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600' },
                        { id: 'sunset', name: 'Hồng Hoàng Hôn', preview: 'bg-gradient-to-r from-red-500 via-orange-400 to-fuchsia-500' },
                        { id: 'emerald', name: 'Sinh Khí Lục Bảo', preview: 'bg-gradient-to-r from-green-400 via-teal-500 to-emerald-600' },
                      ] as const
                    ).map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => onChange({ colorPresetId: preset.id })}
                        className={`w-full p-2.5 bg-slate-900/40 hover:bg-slate-900 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          settings.colorPresetId === preset.id
                            ? 'border-indigo-500/80 bg-slate-900/80 text-white font-medium'
                            : 'border-slate-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs">{preset.name}</span>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-14 h-3.5 rounded-full ${preset.preview} shadow-sm`} />
                          <div className={`w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center ${settings.colorPresetId === preset.id ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent'}`}>
                            {settings.colorPresetId === preset.id && <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />}
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* Custom Hex Color picker */}
                    <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="custom-color-radio"
                          checked={settings.colorPresetId === 'custom'}
                          onChange={() => onChange({ colorPresetId: 'custom' })}
                          className="accent-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="custom-color-radio" className="text-xs cursor-pointer text-slate-300">
                          Tự chọn màu đơn sắc:
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="text-gray-400 text-xs">{settings.customColor}</span>
                        <input
                          type="color"
                          value={settings.customColor}
                          onChange={(e) => onChange({ customColor: e.target.value, colorPresetId: 'custom' })}
                          className="w-7 h-7 bg-transparent rounded cursor-pointer border-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Extra glimmer settings */}
                  <div className="pt-2 border-t border-slate-900 space-y-3">
                    <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        Bật lấp lánh kim tuyến (Glitter/Shimmer)
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.shimmerEffect}
                        onChange={(e) => onChange({ shimmerEffect: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 bg-slate-900 border-slate-800/80 accent-indigo-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: PHYSICS ENGINE ADJUSTMENT */}
              {activeTab === 'physics' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-900">
                    Vật lý & Tần số bay
                  </h3>

                  {/* Slider: Size */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Kích Thước Vụ Nổ</span>
                      <span className="font-mono text-indigo-400 font-bold">{settings.size.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.8}
                      max={2.5}
                      step={0.1}
                      value={settings.size}
                      onChange={(e) => onChange({ size: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider: Speed factor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Tốc Độ & Độ Phủ Chiều Cao</span>
                      <span className="font-mono text-indigo-400 font-bold">{settings.speed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.6}
                      max={2.0}
                      step={0.1}
                      value={settings.speed}
                      onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider: Density particles count */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Mật Độ Số Lượng Tia lửa</span>
                      <span className="font-mono text-indigo-400 font-bold">{settings.particleCount} tia</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={350}
                      step={10}
                      value={settings.particleCount}
                      onChange={(e) => onChange({ particleCount: parseInt(e.target.value) })}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider: Gravity constraint */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Trọng Lực Trái Đất</span>
                      <span className="font-mono text-indigo-400 font-bold">{settings.gravity.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.02}
                      max={0.15}
                      step={0.01}
                      value={settings.gravity}
                      onChange={(e) => onChange({ gravity: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider: Deceleration air resistance friction */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Lực Cản Không Khí (Ma Sát)</span>
                      <span className="font-mono text-indigo-400 font-bold">{(1 - settings.decay).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.94}
                      max={0.992}
                      step={0.004}
                      value={settings.decay}
                      onChange={(e) => onChange({ decay: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Alpha trails setting */}
                  <div className="space-y-1.5 pt-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Thời Gian Đuôi Bụi Pháo sáng</span>
                      <span className="font-mono text-indigo-400 font-bold">{(settings.trailLength * 10).toFixed(0)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.4}
                      max={2.5}
                      step={0.1}
                      value={settings.trailLength}
                      onChange={(e) => onChange({ trailLength: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SCENERY & AUTO MODE */}
              {activeTab === 'scene' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Bầu Trời & Trình Diễn Tự Động
                  </h3>

                  {/* Auto Play Fireworks section */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Tự Động Trình Diễn</span>
                        <span className="text-[10px] text-gray-400 block">Tự động bắn nhiều loại pháo ngẫu nhiên</span>
                      </div>
                      
                      <button
                        onClick={() => onChange({ autoMode: !settings.autoMode })}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          settings.autoMode 
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                        }`}
                      >
                        {settings.autoMode ? (
                          <>
                            <Pause className="w-3.5 h-3.5 mr-0.5" /> Dừng
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 mr-0.5" /> Bắt đầu
                          </>
                        )}
                      </button>
                    </div>

                    {/* Auto fired intervals */}
                    <AnimatePresence>
                      {settings.autoMode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 pt-2 border-t border-slate-800/60"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Tần Suất Kích Nổ</span>
                            <span className="font-mono text-indigo-400 font-medium">Bắn mỗi {(settings.autoInterval / 1000).toFixed(1)} giây</span>
                          </div>
                          <input
                            type="range"
                            min={400}
                            max={3000}
                            step={200}
                            value={settings.autoInterval}
                            onChange={(e) => onChange({ autoInterval: parseInt(e.target.value) })}
                            className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Scenery visibility controls */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Hiển Thị Bối Cảnh</span>
                    
                    {/* Stars */}
                    <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                      <span className="text-slate-300 flex items-center gap-2">
                        <Smile className="w-4 h-4 text-amber-300" /> Bầu trời sao lấp lánh (Twinkly Stars)
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.showConstellations}
                        onChange={(e) => onChange({ showConstellations: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-800 accent-indigo-500 cursor-pointer"
                      />
                    </label>

                    {/* Clouds */}
                    <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                      <span className="text-slate-300 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-cyan-400" /> Mây trôi lơ lửng nhẹ nhàng
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.showClouds}
                        onChange={(e) => onChange({ showClouds: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-800 accent-indigo-500 cursor-pointer"
                      />
                    </label>

                    {/* City Silhouette */}
                    <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                      <span className="text-slate-300 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-violet-400" /> Bóng thành phố đô thị bên dưới
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.showCityscape}
                        onChange={(e) => onChange({ showCityscape: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-800 accent-indigo-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION: PRESET MACROS */}
              <div className="pt-4 border-t border-slate-900 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Bản Phối Trưng Bày Có Sẵn</span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => onChange(p.settings)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 rounded-lg cursor-pointer transition-all"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer usage tip */}
            <div className="p-3 bg-slate-900/40 border-t border-slate-900 text-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                Độ Trực Quan Khoảng 60 FPS • Sáng Tạo Đặc Sắc
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
