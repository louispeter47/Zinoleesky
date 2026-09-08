/**
 * Afrobeats & Amapiano Web Audio Synthesizer Engine
 * Generates dynamic rhythmic percussion (shakers, log drums, rimshots, marimbas)
 * and rich platforming sound effects with precision beat synchronization.
 */

class AfrobeatAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.65;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Rhythm Sequencer
  private isPlayingMusic: boolean = false;
  private currentBpm: number = 108;
  private currentRealm: string = 'forest';
  private timerId: number | null = null;
  private currentStep: number = 0; // 0..15 (16th notes)
  private beatCallbacks: Array<(step: number, beat: number, isDownbeat: boolean) => void> = [];
  private lastBeatTime: number = 0;

  constructor() {
    // Lazy initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  private ensureContext(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return !!this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolumes(music: number, sfx: number) {
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public onBeat(cb: (step: number, beat: number, isDownbeat: boolean) => void) {
    this.beatCallbacks.push(cb);
    return () => {
      this.beatCallbacks = this.beatCallbacks.filter(c => c !== cb);
    };
  }

  // --- Beat Accuracy Checker ---
  public checkBeatAccuracy(): { rating: 'PERFECT' | 'GOOD' | 'MISS'; scoreBonus: number } {
    if (!this.ctx) return { rating: 'GOOD', scoreBonus: 10 };
    const secondsPerBeat = 60 / this.currentBpm;
    const now = this.ctx.currentTime;
    const timeSinceLast = (now - this.lastBeatTime) % secondsPerBeat;
    const offset = Math.min(timeSinceLast, secondsPerBeat - timeSinceLast);

    if (offset < 0.08) {
      return { rating: 'PERFECT', scoreBonus: 50 };
    } else if (offset < 0.16) {
      return { rating: 'GOOD', scoreBonus: 20 };
    }
    return { rating: 'MISS', scoreBonus: 0 };
  }

  public getBeatPhase(): number {
    if (!this.ctx) return 0;
    const secondsPerBeat = 60 / this.currentBpm;
    const phase = ((this.ctx.currentTime - this.lastBeatTime) % secondsPerBeat) / secondsPerBeat;
    return Math.max(0, Math.min(1, phase));
  }

  // --- Music Sequencer ---
  public startMusic(realmId: string = 'forest', bpm: number = 108) {
    this.ensureContext();
    this.currentRealm = realmId;
    this.currentBpm = bpm;
    this.isPlayingMusic = true;

    if (this.timerId !== null) {
      clearInterval(this.timerId);
    }

    this.currentStep = 0;
    const stepIntervalMs = (60 / this.currentBpm / 4) * 1000;

    this.timerId = window.setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx) return;
      this.playStep(this.currentStep);

      const beat = Math.floor(this.currentStep / 4);
      const isDownbeat = this.currentStep % 4 === 0;

      if (isDownbeat) {
        this.lastBeatTime = this.ctx.currentTime;
      }

      this.beatCallbacks.forEach(cb => cb(this.currentStep, beat, isDownbeat));
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepIntervalMs);
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // --- Synthetic Sound Generators ---

  // Afrobeats Shaker / Shekere
  private playShaker(time: number, accent: boolean = false) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(accent ? 8500 : 7000, time);
    filter.Q.setValueAtTime(2.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(accent ? 0.35 : 0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
  }

  // Amapiano Log Drum (808 pitch dropped sine with saturation)
  private playLogDrum(time: number, freq: number = 80, length: number = 0.28) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Rapid pitch drop characteristic of South African / Nigerian log drums
    osc.frequency.setValueAtTime(freq * 1.8, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, time + length);

    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + length);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + length);
  }

  // Afrobeats Rimshot / Clave
  private playRimshot(time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, time);
    osc.frequency.exponentialRampToValueAtTime(350, time + 0.035);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  // Melodic Marimba / Kalimba Pluck
  private playMarimba(time: number, freq: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  // Realm specific melodic sequences
  private playStep(step: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Shakers on every 16th note, accented on 0, 4, 8, 12 or syncopated
    const isAccent = step === 0 || step === 4 || step === 10 || step === 14;
    this.playShaker(now, isAccent);

    // Afro Clave / Rim on steps 4 and 12
    if (step === 4 || step === 12) {
      this.playRimshot(now);
    }

    // Log Drum Patterns according to Realm
    if (this.currentRealm === 'forest') {
      // 108 BPM Jungle Groove (F# Minor pentatonic)
      const scale = [185.0, 220.0, 246.94, 277.18, 329.63, 369.99]; // F#3, A3, B3, C#4, E4, F#4
      if (step === 0 || step === 6 || step === 10) {
        this.playLogDrum(now, step === 0 ? 80 : 92);
      }
      // Marimba melody riff
      if (step === 0) this.playMarimba(now, scale[0]);
      if (step === 3) this.playMarimba(now, scale[2]);
      if (step === 7) this.playMarimba(now, scale[3]);
      if (step === 11) this.playMarimba(now, scale[4]);
      if (step === 14) this.playMarimba(now, scale[1]);
    } else if (this.currentRealm === 'ocean') {
      // 105 BPM Oceanic Flow (D Major)
      const scale = [146.83, 164.81, 220.0, 293.66, 369.99];
      if (step === 0 || step === 7 || step === 12) {
        this.playLogDrum(now, 65, 0.35);
      }
      if (step === 2) this.playMarimba(now, scale[1] * 2);
      if (step === 6) this.playMarimba(now, scale[3]);
      if (step === 10) this.playMarimba(now, scale[2] * 2);
    } else if (this.currentRealm === 'space') {
      // 115 BPM Cosmic Funk (C Minor Synth)
      const scale = [130.81, 155.56, 196.0, 233.08, 261.63, 311.13];
      if (step === 0 || step === 3 || step === 8 || step === 11) {
        this.playLogDrum(now, 95, 0.2);
      }
      if (step % 2 === 0) {
        this.playMarimba(now, scale[(step / 2) % scale.length]);
      }
    } else if (this.currentRealm === 'underworld') {
      // 104 BPM Heavy Underworld Dub (E Minor Heavy)
      if (step === 0 || step === 8 || step === 14) {
        this.playLogDrum(now, 55, 0.4);
      }
      if (step === 4) this.playMarimba(now, 164.81);
      if (step === 12) this.playMarimba(now, 196.0);
    } else {
      // 112 BPM Motherland Earth / Lagos Celebration (A Major Afro-Highlife)
      const scale = [220.0, 277.18, 329.63, 440.0, 554.37];
      if (step === 0 || step === 4 || step === 7 || step === 10 || step === 13) {
        this.playLogDrum(now, 85, 0.25);
      }
      if (step === 0) this.playMarimba(now, scale[0]);
      if (step === 2) this.playMarimba(now, scale[1]);
      if (step === 6) this.playMarimba(now, scale[2]);
      if (step === 9) this.playMarimba(now, scale[3]);
      if (step === 12) this.playMarimba(now, scale[4]);
    }
  }

  // ================= SFX =================

  public playJump(isDouble: boolean = false, isBeatBoost: boolean = false) {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isBeatBoost ? 'sawtooth' : 'triangle';
    const startFreq = isBeatBoost ? 300 : isDouble ? 420 : 260;
    const endFreq = isBeatBoost ? 750 : isDouble ? 680 : 520;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playBounceDrum() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playCollectNote(combo: number = 0) {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic scale ascends with combo
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = notes[combo % notes.length];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playCollectVinyl() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Chime triad (Golden Vinyl unlock)
    [659.25, 830.61, 987.77, 1318.51].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playShootNote() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playCheckpoint() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Faith fanfare chord
    [440, 554.37, 659.25, 880].forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 0.7);
    });
  }

  public playDamage() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playEnemyDefeat() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playSecretRevealed() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  public playBossHit() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playVictoryFanfare() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [
      { f: 440, t: 0, d: 0.18 },
      { f: 554.37, t: 0.18, d: 0.18 },
      { f: 659.25, t: 0.36, d: 0.18 },
      { f: 880, t: 0.54, d: 0.6 },
    ];
    notes.forEach(n => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + n.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + n.d);
    });
  }
}

export const audio = new AfrobeatAudioEngine();
