/**
 * Web Audio API Calming Ghibli / Japanese Zen Garden Soundscape Synthesizer
 * Plays soothing pentatonic tones (Insen / Yo scale) and gentle ambient breeze.
 */

class CalmingAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
    this.intervalId = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Japanese Hirajoshi / Pentatonic Frequencies (D, Eb, G, A, Bb)
    const scale = [146.83, 155.56, 196.00, 220.00, 233.08, 293.66, 311.13, 392.00];

    // Background Drone (Warm Ghibli Twilight Bass 146.83Hz)
    const drone = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(146.83, this.ctx.currentTime);
    droneGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    drone.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone.start();
    this.oscillators.push(drone);

    // Random Peaceful Koto / Bamboo Flute Plucks
    this.intervalId = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;

      const freq = scale[Math.floor(Math.random() * scale.length)];
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = Math.random() > 0.4 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 3.1);
    }, 2400);

    this.isPlaying = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch(e){}
    });
    this.oscillators = [];
    this.isPlaying = false;
  }
}

export const calmingAudio = new CalmingAudioEngine();
