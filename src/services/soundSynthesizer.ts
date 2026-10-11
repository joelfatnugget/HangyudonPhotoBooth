export interface SoundSynthesizerOptions {
  initialMuted?: boolean;
}

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor(options: SoundSynthesizerOptions = {}) {
    this.muted = options.initialMuted ?? false;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public playBubblePop(): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      // Cute bubble chirp: rapid sweep up then down
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350 + Math.random() * 150, startTime);
      osc.frequency.exponentialRampToValueAtTime(750 + Math.random() * 200, startTime + 0.06);
      osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.12);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.13);
      return true;
    } catch {
      return false;
    }
  }

  public playCountdownTick(isFinal: boolean = false): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime;

      osc.type = 'sine';
      const freq = isFinal ? 880 : 587.33; // High pitch A5 for final, D5 for ticks
      osc.frequency.setValueAtTime(freq, startTime);

      const duration = isFinal ? 0.25 : 0.08;
      gain.gain.setValueAtTime(isFinal ? 0.35 : 0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
      return true;
    } catch {
      return false;
    }
  }

  public playShutter(): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    try {
      // Camera mechanical snap sound using noise burst + click
      const bufferSize = ctx.sampleRate * 0.06;
      let buffer: AudioBuffer | null = null;
      if (ctx.createBuffer) {
        buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }
      }

      if (buffer) {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        noiseSource.connect(gain);
        gain.connect(ctx.destination);
        noiseSource.start(ctx.currentTime);
      } else {
        // Fallback tone click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
      return true;
    } catch {
      return false;
    }
  }

  public playFanfare(): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    try {
      // Cute marimba/chime arpeggio: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.36);
      });
      return true;
    } catch {
      return false;
    }
  }
}
