/* ==========================================================
   ROMANTIC CINEMATIC SOUNDTRACK ENGINE (Web Audio API)
   ========================================================== */

class RomanticSoundtrackEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentStep = 0;
    this.timerId = null;
    this.currentScene = 0;
    this.customAudioEl = document.getElementById('custom-audio');
    this.isUsingCustomAudio = false;

    // Musical parameters: D minor / F major cinematic emotional progression
    this.tempo = 62; // Slow, emotional rubato tempo (BPM)
    this.chordProgression = [
      // Dm9
      { root: 146.83, notes: [146.83, 220.00, 349.23, 523.25, 659.25], name: 'Dm9' },
      // Bbmaj7
      { root: 116.54, notes: [116.54, 174.61, 293.66, 440.00, 587.33], name: 'Bbmaj7' },
      // Fadd9
      { root: 87.31, notes: [87.31, 130.81, 220.00, 392.00, 523.25], name: 'Fadd9' },
      // Csus4 -> C
      { root: 130.81, notes: [130.81, 196.00, 261.63, 392.00, 587.33], name: 'Csus4' },
      // Gm7
      { root: 98.00, notes: [98.00, 146.83, 233.08, 349.23, 587.33], name: 'Gm7' },
      // Dm7
      { root: 146.83, notes: [146.83, 220.00, 349.23, 440.00, 523.25], name: 'Dm7' },
      // Bbmaj9
      { root: 116.54, notes: [116.54, 174.61, 293.66, 440.00, 659.25], name: 'Bbmaj9' },
      // C9 (Resolution)
      { root: 130.81, notes: [130.81, 196.00, 329.63, 392.00, 587.33], name: 'C9' }
    ];

    this.activeNodes = [];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    // Dynamic Compressor for warm cinematic mastering
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.015, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.35, this.ctx.currentTime);

    // Warm Convolution Reverb simulation
    this.reverbNode = this.createConcertHallReverb(2.8, 0.45);

    // Master filter to remove harsh highs and warm up lows
    this.warmthFilter = this.ctx.createBiquadFilter();
    this.warmthFilter.type = 'lowpass';
    this.warmthFilter.frequency.setValueAtTime(5500, this.ctx.currentTime);

    // Connect graph
    this.masterGain.connect(this.warmthFilter);
    this.warmthFilter.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
  }

  createConcertHallReverb(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      const decayFactor = Math.pow(1 - n / length, decay * 3);
      left[i] = (Math.random() * 2 - 1) * decayFactor;
      right[i] = (Math.random() * 2 - 1) * decayFactor;
    }

    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;

    const reverbGain = this.ctx.createGain();
    reverbGain.gain.setValueAtTime(0.42, this.ctx.currentTime);

    convolver.connect(reverbGain);
    reverbGain.connect(this.masterGain);

    return convolver;
  }

  start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isUsingCustomAudio && this.customAudioEl && this.customAudioEl.src) {
      this.customAudioEl.play().catch(e => console.warn('Custom audio playback notice:', e));
      this.isPlaying = true;
      return;
    }

    this.isPlaying = true;
    this.currentStep = 0;
    this.playScoreLoop();
  }

  playScoreLoop() {
    if (!this.isPlaying || this.isUsingCustomAudio) return;

    const chord = this.chordProgression[this.currentStep % this.chordProgression.length];
    const now = this.ctx.currentTime;
    const chordDuration = (60 / this.tempo) * 4; // 1 measure per chord

    // 1. Play Warm String Pad
    this.playStringEnsemble(chord.notes, now, chordDuration);

    // 2. Play Arpeggiated Piano
    this.playPianoPattern(chord.notes, now, chordDuration);

    // 3. Play Soft Chime Highlights on special scenes
    if (this.currentScene >= 2) {
      this.playChimes(chord.notes, now, chordDuration);
    }

    this.currentStep++;

    // Schedule next measure
    const nextMeasureMs = chordDuration * 1000 - 60;
    this.timerId = setTimeout(() => {
      this.playScoreLoop();
    }, nextMeasureMs);
  }

  // Romantic Piano Synthesizer
  playPianoNote(freq, startTime, duration = 3.5, velocity = 0.5) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const noteFilter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq, startTime);
    // Subtle natural acoustic detune
    osc2.frequency.setValueAtTime(freq * 1.001, startTime);

    // Filter to mimic felt piano hammer softening
    noteFilter.type = 'lowpass';
    const filterFreq = Math.min(freq * 4.5, 4500);
    noteFilter.frequency.setValueAtTime(filterFreq, startTime);
    noteFilter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration);

    // Envelope
    const gainVal = Math.min(velocity * 0.28, 0.4);
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(gainVal, startTime + 0.025);
    noteGain.gain.exponentialRampToValueAtTime(gainVal * 0.45, startTime + 0.5);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(noteFilter);
    osc2.connect(noteFilter);
    noteFilter.connect(noteGain);

    noteGain.connect(this.masterGain);
    if (this.reverbNode) {
      noteGain.connect(this.reverbNode);
    }

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
  }

  // Piano Arpeggio Pattern
  playPianoPattern(notes, startTime, duration) {
    const beat = duration / 8;
    // Emotional ascending/descending arpeggio sequence
    const pattern = [
      { noteIdx: 0, time: 0, vel: 0.65 },
      { noteIdx: 1, time: beat * 1.5, vel: 0.45 },
      { noteIdx: 2, time: beat * 2.5, vel: 0.5 },
      { noteIdx: 4, time: beat * 4, vel: 0.6 },
      { noteIdx: 3, time: beat * 5.2, vel: 0.48 },
      { noteIdx: 2, time: beat * 6.5, vel: 0.42 }
    ];

    pattern.forEach(p => {
      const noteFreq = notes[p.noteIdx % notes.length];
      const humanize = (Math.random() - 0.5) * 0.04;
      this.playPianoNote(noteFreq, startTime + p.time + humanize, 3.2, p.vel);
    });
  }

  // Warm Orchestral Strings Ensemble
  playStringEnsemble(notes, startTime, duration) {
    const ensembleGain = this.ctx.createGain();
    const ensembleFilter = this.ctx.createBiquadFilter();

    // Warm string filter
    ensembleFilter.type = 'lowpass';
    let baseCutoff = 800;
    if (this.currentScene >= 3) baseCutoff = 1300;
    if (this.currentScene >= 4) baseCutoff = 1800;

    ensembleFilter.frequency.setValueAtTime(baseCutoff * 0.7, startTime);
    ensembleFilter.frequency.linearRampToValueAtTime(baseCutoff, startTime + duration * 0.5);
    ensembleFilter.frequency.linearRampToValueAtTime(baseCutoff * 0.8, startTime + duration);

    // Warm envelope
    let targetVol = 0.12;
    if (this.currentScene >= 3) targetVol = 0.16;
    if (this.currentScene >= 4) targetVol = 0.22;

    ensembleGain.gain.setValueAtTime(0.0001, startTime);
    ensembleGain.gain.linearRampToValueAtTime(targetVol, startTime + 1.2);
    ensembleGain.gain.setValueAtTime(targetVol, startTime + duration - 0.8);
    ensembleGain.gain.linearRampToValueAtTime(0.0001, startTime + duration + 0.6);

    // Play 3 voice harmony
    const voices = [notes[0] * 0.5, notes[1], notes[3] || notes[2]];

    voices.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      // Subtle stereo detune
      const detune = (idx - 1) * 7.5;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.detune.setValueAtTime(detune, startTime);

      // Subtle vibrato LFO
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(4.8, startTime);
      vibratoGain.gain.setValueAtTime(2.5, startTime);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(startTime + 0.8);
      vibrato.stop(startTime + duration + 0.5);

      osc.connect(ensembleFilter);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.6);
    });

    ensembleFilter.connect(ensembleGain);
    ensembleGain.connect(this.masterGain);
    if (this.reverbNode) {
      ensembleGain.connect(this.reverbNode);
    }
  }

  // Romantic High Chimes & Celestial Sparkle
  playChimes(notes, startTime, duration) {
    if (Math.random() > 0.65) return;
    const chimeFreq = (notes[notes.length - 1] || 523.25) * 2;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(chimeFreq, startTime + duration * 0.5);

    gain.gain.setValueAtTime(0.0001, startTime + duration * 0.5);
    gain.gain.linearRampToValueAtTime(0.08, startTime + duration * 0.5 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.5 + 2.0);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.reverbNode) gain.connect(this.reverbNode);

    osc.start(startTime + duration * 0.5);
    osc.stop(startTime + duration * 0.5 + 2.2);
  }

  // Climax Swell (when arriving at Chapter IV / Proposal)
  playProposalSwell() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Harp-like ascending romantic sweep
    const harpNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    harpNotes.forEach((freq, i) => {
      this.playPianoNote(freq, now + i * 0.08, 3.5, 0.45);
    });

    // Swell strings volume
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(0.7, now);
      this.masterGain.gain.linearRampToValueAtTime(0.85, now + 2.0);
    }
  }

  // Triumphant Celebration when She Clicks "YES!"
  playYesCelebration() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Majestic C Major / F Major Triumphant chord
    const triumphNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    triumphNotes.forEach(freq => {
      this.playPianoNote(freq, now + 0.1, 5.0, 0.7);
    });

    // 2. Cascade of joyful wedding bells / celestial chime arpeggios
    for (let i = 0; i < 16; i++) {
      const bellFreq = 523.25 * Math.pow(1.05946, (i % 8) * 2);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(bellFreq, now + 0.2 + i * 0.12);

      gain.gain.setValueAtTime(0.0001, now + 0.2 + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2 + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2 + i * 0.12 + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      if (this.reverbNode) gain.connect(this.reverbNode);

      osc.start(now + 0.2 + i * 0.12);
      osc.stop(now + 0.2 + i * 0.12 + 2.0);
    }
  }

  // Gentle tactile chime for button clicks
  playGentleClick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  setScene(sceneIndex) {
    this.currentScene = sceneIndex;
    if (sceneIndex === 4) {
      this.playProposalSwell();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.7;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
    if (this.customAudioEl) {
      this.customAudioEl.muted = this.isMuted;
    }
    return this.isMuted;
  }

  duck() {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.6);
    }
  }

  unduck() {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 1.0);
    }
  }

  setCustomAudio(file) {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    this.customAudioEl.src = objectUrl;
    this.isUsingCustomAudio = true;
    if (this.isPlaying) {
      if (this.timerId) clearTimeout(this.timerId);
      this.customAudioEl.play();
    }
  }
}

// Global instance
window.soundtrack = new RomanticSoundtrackEngine();
