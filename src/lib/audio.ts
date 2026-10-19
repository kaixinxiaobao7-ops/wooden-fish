import type { Tone } from './game';

type AudioContextClass = new (contextOptions?: AudioContextOptions) => AudioContext;

function getAudioContextClass(): AudioContextClass | null {
  if (typeof window === 'undefined') return null;
  const legacy = window as unknown as { webkitAudioContext?: AudioContextClass };
  return window.AudioContext ?? legacy.webkitAudioContext ?? null;
}

/**
 * Tiny synthesized instrument. Every sound is generated at runtime so the
 * whole experience stays dependency-free, tiny and offline-friendly.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private volume = 0.75;

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.gainTarget(), this.ctx.currentTime, 0.02);
    }
  }

  private gainTarget(): number {
    // Perceptual curve: quiet settings stay genuinely quiet.
    return Math.pow(this.volume, 1.6) * 0.9;
  }

  private ensure(): AudioContext | null {
    if (!this.ctx) {
      const Ctor = getAudioContextClass();
      if (!Ctor) return null;
      try {
        const ctx = new Ctor({ latencyHint: 'interactive' });
        const master = ctx.createGain();
        master.gain.value = this.gainTarget();

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 24;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        master.connect(compressor);
        compressor.connect(ctx.destination);

        // Small wooden-room reverb, generated from decaying noise.
        const convolver = ctx.createConvolver();
        convolver.buffer = this.impulse(ctx, 0.55, 2.8);
        const wet = ctx.createGain();
        wet.gain.value = 0.16;
        master.connect(convolver);
        convolver.connect(wet);
        wet.connect(compressor);

        const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;

        this.ctx = ctx;
        this.master = master;
        this.noise = noise;
      } catch {
        return null;
      }
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  private impulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  play(tone: Tone = 'wood'): void {
    try {
      const ctx = this.ensure();
      if (!ctx || !this.master) return;
      if (tone === 'bell') this.bell(ctx);
      else if (tone === 'electronic') this.electronic(ctx);
      else this.wood(ctx);
    } catch {
      // Audio is an enhancement; never let it break the tap experience.
    }
  }

  /** Gentle ascending chime used when an achievement unlocks. */
  chime(): void {
    try {
      const ctx = this.ensure();
      if (!ctx || !this.master) return;
      const t0 = ctx.currentTime + 0.02;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const t = t0 + index * 0.11;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        osc.connect(gain);
        gain.connect(this.master as GainNode);
        osc.start(t);
        osc.stop(t + 1.15);
      });
    } catch {
      // ignore
    }
  }

  private wood(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const pitch = 1 + (Math.random() * 0.07 - 0.035);

    // Hollow low body.
    const low = ctx.createOscillator();
    const lowGain = ctx.createGain();
    low.type = 'sine';
    low.frequency.setValueAtTime(210 * pitch, t);
    low.frequency.exponentialRampToValueAtTime(118, t + 0.075);
    lowGain.gain.setValueAtTime(0.0001, t);
    lowGain.gain.exponentialRampToValueAtTime(0.5, t + 0.004);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    low.connect(lowGain);
    lowGain.connect(this.master as GainNode);
    low.start(t);
    low.stop(t + 0.12);

    // Main wooden resonance.
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(590 * pitch, t);
    body.frequency.exponentialRampToValueAtTime(430 * pitch, t + 0.11);
    bodyGain.gain.setValueAtTime(0.0001, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.55, t + 0.005);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    body.connect(bodyGain);
    bodyGain.connect(this.master as GainNode);
    body.start(t);
    body.stop(t + 0.17);

    // Higher mode that gives the "tok" its edge.
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(1180 * pitch, t);
    overtone.frequency.exponentialRampToValueAtTime(980 * pitch, t + 0.05);
    overtoneGain.gain.setValueAtTime(0.0001, t);
    overtoneGain.gain.exponentialRampToValueAtTime(0.2, t + 0.003);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    overtone.connect(overtoneGain);
    overtoneGain.connect(this.master as GainNode);
    overtone.start(t);
    overtone.stop(t + 0.09);

    // Mallet attack.
    if (this.noise) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noise;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.Q.value = 0.9;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.master as GainNode);
      noise.start(t);
      noise.stop(t + 0.05);
    }
  }

  private bell(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const partials = [
      { ratio: 1, gain: 0.42, decay: 1.7 },
      { ratio: 2.4, gain: 0.24, decay: 1.15 },
      { ratio: 3.86, gain: 0.14, decay: 0.8 },
      { ratio: 5.42, gain: 0.08, decay: 0.55 },
      { ratio: 7.1, gain: 0.05, decay: 0.36 },
    ];
    const base = 392 * (1 + (Math.random() * 0.02 - 0.01));
    partials.forEach((partial) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = base * partial.ratio;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(partial.gain, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + partial.decay);
      osc.connect(gain);
      gain.connect(this.master as GainNode);
      osc.start(t);
      osc.stop(t + partial.decay + 0.05);
    });

    if (this.noise) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noise;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 3200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.master as GainNode);
      noise.start(t);
      noise.stop(t + 0.08);
    }
  }

  private electronic(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.09);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.09);
    filter.Q.value = 6;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master as GainNode);
    osc.start(t);
    osc.stop(t + 0.14);

    const blip = ctx.createOscillator();
    const blipGain = ctx.createGain();
    blip.type = 'sine';
    blip.frequency.setValueAtTime(2200, t);
    blipGain.gain.setValueAtTime(0.09, t);
    blipGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    blip.connect(blipGain);
    blipGain.connect(this.master as GainNode);
    blip.start(t);
    blip.stop(t + 0.05);
  }

  dispose(): void {
    if (this.ctx) {
      void this.ctx.close().catch(() => undefined);
      this.ctx = null;
      this.master = null;
      this.noise = null;
    }
  }
}
