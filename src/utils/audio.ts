/**
 * Web Audio API Synthesizer for Firework Sound Effects
 * Synthesizes realistic explosion and launch sounds dynamically at runtime keying off settings.
 */

class FireworkAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Audio Context is initialized lazily upon user interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.error('Failed to initialize Web Audio API for fireworks:', e);
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setEnabled(val: boolean) {
    this.enabled = val;
    if (val) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  }

  /**
   * Sound of rocket flying upwards (Whoosh Sound + Launch Mortar Bass Thunk)
   */
  playLaunch(duration: number = 0.8, pitch: number = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Scale launch volume for strong and clear audibility
    const launchVol = this.volume * 1.3;

    // 1. MORTAR THUMP & PUFF (The ground-level pop of launching the shell)
    try {
      const launchOsc = this.ctx.createOscillator();
      const launchGain = this.ctx.createGain();
      launchOsc.type = 'sine';
      launchOsc.frequency.setValueAtTime(160 * pitch, t);
      launchOsc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

      launchGain.gain.setValueAtTime(1.4 * launchVol, t);
      launchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      launchOsc.connect(launchGain);
      launchGain.connect(this.masterGain);
      launchOsc.start(t);
      launchOsc.stop(t + 0.16);
    } catch (_) {}

    try {
      // Noise puff for realistic gunpowder combustion sound on launch
      const puffBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
      const puffData = puffBuffer.getChannelData(0);
      for (let i = 0; i < puffData.length; i++) {
        puffData[i] = Math.random() * 2 - 1;
      }
      const puffSource = this.ctx.createBufferSource();
      puffSource.buffer = puffBuffer;

      const puffFilter = this.ctx.createBiquadFilter();
      puffFilter.type = 'lowpass';
      puffFilter.frequency.setValueAtTime(220, t);

      const puffGain = this.ctx.createGain();
      puffGain.gain.setValueAtTime(0.9 * launchVol, t);
      puffGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      puffSource.connect(puffFilter);
      puffFilter.connect(puffGain);
      puffGain.connect(this.masterGain);
      puffSource.start(t);
      puffSource.stop(t + 0.15);
    } catch (_) {}

    // 2. SHARP ASCENDING WHISTLE SINE WAVE
    try {
      const whistleOsc = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.setValueAtTime(550 * pitch, t);
      whistleOsc.frequency.exponentialRampToValueAtTime(2200 * pitch, t + duration);

      whistleGain.gain.setValueAtTime(0.001, t);
      whistleGain.gain.linearRampToValueAtTime(0.45 * launchVol, t + duration * 0.2);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      whistleOsc.connect(whistleGain);
      whistleGain.connect(this.masterGain);
      whistleOsc.start(t);
      whistleOsc.stop(t + duration + 0.05);
    } catch (_) {}

    // 3. RESONANT WHISTLING NOISE WHOOSH (Beautiful burning fuse/climbing sound)
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(3200, t + duration);
      noiseFilter.Q.setValueAtTime(3.8, t); // Highly resonant for whistle flavor

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.linearRampToValueAtTime(0.85 * launchVol, t + duration * 0.15);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + duration);
    } catch (_) {}
  }

  /**
   * Exploding sound (The main firework boom)
   */
  playExplosion(type: string, volumeScale: number = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Scale up slightly for extra satisfying intensity
    const finalVol = this.volume * volumeScale * 1.35;
    const isWaterfall = type === 'waterfall';

    // --- PART 1: THE CRISP INITIAL BURST/CRACK ---
    // High frequency mechanical snapping burst of the paper shell
    try {
      const crackBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackData.length; i++) {
        crackData[i] = Math.random() * 2 - 1;
      }
      const crackNode = this.ctx.createBufferSource();
      crackNode.buffer = crackBuffer;

      const crackFilter = this.ctx.createBiquadFilter();
      crackFilter.type = 'highpass';
      crackFilter.frequency.setValueAtTime(isWaterfall ? 900 : 1400, t);

      const crackGain = this.ctx.createGain();
      const crackGainVal = isWaterfall ? 0.22 * finalVol : 0.45 * finalVol;
      crackGain.gain.setValueAtTime(crackGainVal, t);
      crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      crackNode.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(this.masterGain);
      crackNode.start(t);
      crackNode.stop(t + 0.08);
    } catch (_) {}

    // --- PART 2: THE POWERFUL BASS SHOCKWAVE ---
    // Deep physical acoustic air compression
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(isWaterfall ? 110 : 145, t);
    subOsc.frequency.exponentialRampToValueAtTime(10, t + 0.38);

    const subBaseVol = isWaterfall ? 0.65 * finalVol : 1.15 * finalVol;
    subGain.gain.setValueAtTime(subBaseVol, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.42);

    // Dynamic puff shockwave (lowpass thump)
    try {
      const thumpBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
      const thumpData = thumpBuffer.getChannelData(0);
      for (let i = 0; i < thumpData.length; i++) {
        thumpData[i] = Math.random() * 2 - 1;
      }
      const thumpSource = this.ctx.createBufferSource();
      thumpSource.buffer = thumpBuffer;

      const thumpFilter = this.ctx.createBiquadFilter();
      thumpFilter.type = 'lowpass';
      thumpFilter.frequency.setValueAtTime(isWaterfall ? 180 : 300, t);
      thumpFilter.frequency.exponentialRampToValueAtTime(35, t + 0.22);

      const thumpGain = this.ctx.createGain();
      const thumpGainVal = isWaterfall ? 0.35 * finalVol : 0.65 * finalVol;
      thumpGain.gain.setValueAtTime(thumpGainVal, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      thumpSource.connect(thumpFilter);
      thumpFilter.connect(thumpGain);
      thumpGain.connect(this.masterGain);
      thumpSource.start(t);
      thumpSource.stop(t + 0.3);
    } catch (_) {}

    // --- PART 3: THE CINEMATIC OUTDOOR ROLLING ECHO ---
    // Simulates grand rolling rumbling reflects from ground and cloud structures
    try {
      const echoDelay = 0.03;
      const echoDuration = 1.8;
      const echoBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * echoDuration, this.ctx.sampleRate);
      const echoData = echoBuffer.getChannelData(0);
      for (let i = 0; i < echoData.length; i++) {
        echoData[i] = Math.random() * 2 - 1;
      }
      const echoSource = this.ctx.createBufferSource();
      echoSource.buffer = echoBuffer;

      const echoFilter = this.ctx.createBiquadFilter();
      echoFilter.type = 'bandpass';
      echoFilter.frequency.setValueAtTime(90, t + echoDelay);
      echoFilter.frequency.linearRampToValueAtTime(40, t + echoDuration);
      echoFilter.Q.setValueAtTime(1.0, t);

      const echoGain = this.ctx.createGain();
      echoGain.gain.setValueAtTime(0, t);
      const echoVol = isWaterfall ? 0.2 * finalVol : 0.4 * finalVol;
      echoGain.gain.linearRampToValueAtTime(echoVol, t + echoDelay + 0.06);
      echoGain.gain.exponentialRampToValueAtTime(0.001, t + echoDuration);

      echoSource.connect(echoFilter);
      echoFilter.connect(echoGain);
      echoGain.connect(this.masterGain);
      echoSource.start(t + echoDelay);
      echoSource.stop(t + echoDuration);
    } catch (_) {}
  }

  private playSecondarySpark(startTime: number, volume: number) {
    if (!this.ctx || !this.masterGain) return;
    const t = startTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.2);

    oscGain.gain.setValueAtTime(volume, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);

    // Mini crackle scheduled natively
    this.playCrackles(t, 3, volume * 1.5);
  }

  /**
   * Generates minor crisp crackling sparkles (crack-crack-pop)
   */
  private playCrackles(startTime: number, count: number, maxVol: number) {
    if (!this.ctx || !this.masterGain) return;

    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 0.6;
      const t = startTime + delay;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100 + Math.random() * 900, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(maxVol * (0.3 + Math.random() * 0.7), t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  /**
   * Plays a majestic, long-lasting continuous shimmering rain sizzle
   * and high-density crackling cascade to simulate waterfall ("Rain") effects.
   */
  private playWaterfallCascade(startTime: number, duration: number, maxVol: number) {
    if (!this.ctx || !this.masterGain) return;

    const t = startTime;

    // 1. Glistening continuous background hiss (falling hot embers whispering)
    try {
      const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let j = 0; j < noiseData.length; j++) {
        noiseData[j] = Math.random() * 2 - 1;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1600, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(650, t + duration);
      noiseFilter.Q.setValueAtTime(2.2, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0, t);
      // Soft swell of the burning rain noise
      noiseGain.gain.linearRampToValueAtTime(0.18 * maxVol, t + 0.12);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noiseSource.start(t);
      noiseSource.stop(t + duration);
    } catch (_) {}

    // 2. High density falling pop-crackles (individual sparks crisping as they fall)
    const count = 75;
    for (let i = 0; i < count; i++) {
      const delay = Math.random() * duration;
      const tPop = startTime + delay;
      const progress = delay / duration;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Lower pitches as they descend further under gravity
      const baseFreq = 1650 - progress * 750 + (Math.random() - 0.5) * 350;
      osc.type = Math.random() > 0.45 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, tPop);

      // Volume fades out gracefully towards the bottom of the waterfall
      const colVol = maxVol * Math.max(0.04, (1.0 - progress * 0.8) * (0.12 + Math.random() * 0.65));

      gain.gain.setValueAtTime(0, tPop);
      gain.gain.linearRampToValueAtTime(colVol, tPop + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, tPop + 0.03 + Math.random() * 0.025);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(tPop);
      osc.stop(tPop + 0.07);
    }
  }
}

function dur(seconds: number): number {
  return seconds;
}

export const audioSystem = new FireworkAudioEngine();
