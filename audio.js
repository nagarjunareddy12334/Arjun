/* ==========================================================
   ROMANTIC CINEMATIC SOUNDTRACK ENGINE (Arjun & Ammu)
   - Real MP3 Audio Playback for Arjun's Created Song
   - Upgraded Romantic Grand Piano & Strings Acoustic Engine
   - Smart Audio Ducking for Video Playback
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

    // Track Mode: 'arjun_song' | 'romantic_piano' | 'ammu_short' | 'voice_note'
    this.currentTrack = 'arjun_song';

    // HTML5 Audio element for MP3 playback
    this.audioElement = document.getElementById('custom-audio');
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.id = 'custom-audio';
      document.body.appendChild(this.audioElement);
    }
    this.audioElement.loop = true;
    this.audioElement.preload = 'auto';

    // Available audio tracks
    this.trackSources = {
      'arjun_song': 'assets/arjun_song_full.mp3',
      'romantic_piano': null, // Uses procedural Grand Piano synth
      'ammu_short': 'assets/arjun_song_for_ammu.mp3',
      'voice_note': 'assets/arjun_voice_audio.mp3'
    };

    // Musical parameters for Romantic Grand Piano: F Major / D Minor emotional ballad
    this.tempo = 54; // Romantic slow rubato ballad tempo (BPM)
    this.chordProgression = [
      // 1. Fmaj9 (Tender awakening)
      {
        bass: 87.31, // F2
        harmony: [130.81, 174.61, 220.00, 329.63, 392.00], // C3, F3, A3, E4, G4
        melody: [523.25, 659.25, 587.33, 523.25], // C5, E5, D5, C5
        name: 'Fmaj9'
      },
      // 2. Dm9 (Deep emotional warmth)
      {
        bass: 73.42, // D2
        harmony: [110.00, 146.83, 220.00, 261.63, 329.63], // A2, D3, A3, C4, E4
        melody: [440.00, 523.25, 659.25, 587.33], // A4, C5, E5, D5
        name: 'Dm9'
      },
      // 3. Bbmaj9 (Lush soaring longing)
      {
        bass: 58.27, // Bb1
        harmony: [116.54, 174.61, 220.00, 293.66, 349.23], // Bb2, F3, A3, D4, F4
        melody: [587.33, 698.46, 659.25, 587.33], // D5, F5, E5, D5
        name: 'Bbmaj9'
      },
      // 4. Csus4 -> C9 (Gentle romantic suspension & release)
      {
        bass: 65.41, // C2
        harmony: [130.81, 196.00, 261.63, 349.23, 392.00], // C3, G3, C4, F4, G4
        melody: [523.25, 587.33, 440.00, 392.00], // C5, D5, A4, G4
        name: 'Csus4'
      },
      // 5. Gm9 (Intimate vulnerability)
      {
        bass: 49.00, // G1
        harmony: [98.00, 146.83, 220.00, 261.63, 349.23], // G2, D3, A3, C4, F4
        melody: [440.00, 523.25, 440.00, 392.00], // A4, C5, A4, G4
        name: 'Gm9'
      },
      // 6. Am7 (Soft reflection)
      {
        bass: 55.00, // A1
        harmony: [110.00, 164.81, 220.00, 261.63, 329.63], // A2, E3, A3, C4, E4
        melody: [523.25, 587.33, 659.25, 523.25], // C5, D5, E5, C5
        name: 'Am7'
      },
      // 7. Bbmaj7(#11) (Celestial magical starlight)
      {
        bass: 58.27, // Bb1
        harmony: [116.54, 174.61, 246.94, 293.66, 440.00], // Bb2, F3, B3(#11), D4, A4
        melody: [659.25, 783.99, 698.46, 587.33], // E5, G5, F5, D5
        name: 'Bbmaj7(#11)'
      },
      // 8. Fadd9 / A (Warm emotional homecoming)
      {
        bass: 55.00, // A1
        harmony: [110.00, 174.61, 220.00, 261.63, 392.00], // A2, F3, A3, C4, G4
        melody: [523.25, 440.00, 349.23, 392.00], // C5, A4, F4, G4
        name: 'Fadd9'
      }
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.72, this.ctx.currentTime);

    // Warm Dynamic Mastering Compressor
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(32, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(3.8, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.012, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.4, this.ctx.currentTime);

    // Concert Hall Convolution Reverb
    this.reverbNode = this.createConcertHallReverb(4.2, 0.38);

    // Warm Lowpass Filter (eliminates electronic harshness)
    this.warmthFilter = this.ctx.createBiquadFilter();
    this.warmthFilter.type = 'lowpass';
    this.warmthFilter.frequency.setValueAtTime(6200, this.ctx.currentTime);

    // Master Connect Graph
    this.masterGain.connect(this.warmthFilter);
    this.warmthFilter.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
  }

  // Realistic Concert Hall Reverb simulation
  createConcertHallReverb(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      const decayFactor = Math.pow(1 - n / length, decay * 3.2);
      // Soft stereo dispersion
      left[i] = (Math.random() * 2 - 1) * decayFactor;
      right[i] = (Math.random() * 2 - 1) * decayFactor;
    }

    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;

    const reverbGain = this.ctx.createGain();
    reverbGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

    convolver.connect(reverbGain);
    reverbGain.connect(this.masterGain);

    return convolver;
  }

  start() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;

    if (this.currentTrack === 'romantic_piano') {
      if (this.audioElement) this.audioElement.pause();
      this.currentStep = 0;
      this.playPianoScoreLoop();
    } else {
      this.playSelectedAudioTrack();
    }
  }

  playSelectedAudioTrack() {
    const src = this.trackSources[this.currentTrack] || this.trackSources['arjun_song'];
    if (!src) return;

    if (this.audioElement.src !== window.location.origin + '/' + src && !this.audioElement.src.endsWith(src)) {
      this.audioElement.src = src;
    }

    this.audioElement.volume = this.isMuted ? 0 : 0.85;
    this.audioElement.play().catch(e => {
      console.log('Audio autoplay note (requires click):', e);
    });
  }

  // Set Track (Switch between Arjun's Song, Romantic Piano, Voice Note)
  setTrack(trackKey) {
    this.currentTrack = trackKey;

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (!this.isPlaying) return;

    if (trackKey === 'romantic_piano') {
      if (this.audioElement) this.audioElement.pause();
      this.currentStep = 0;
      this.playPianoScoreLoop();
    } else {
      this.playSelectedAudioTrack();
    }
  }

  // ----------------------------------------------------------
  // UPGRADED ROMANTIC GRAND PIANO SYNTHESIS
  // ----------------------------------------------------------
  playPianoScoreLoop() {
    if (!this.isPlaying || this.currentTrack !== 'romantic_piano') return;

    const chord = this.chordProgression[this.currentStep % this.chordProgression.length];
    const now = this.ctx.currentTime;
    const chordDuration = (60 / this.tempo) * 4; // 1 measure per chord (~4.4 sec)

    // 1. Warm Cello & Strings Pad
    this.playRomanticStrings(chord.bass, chord.harmony, now, chordDuration);

    // 2. Romantic Grand Piano: Deep Bass Octave
    this.playGrandPianoNote(chord.bass, now, 5.0, 0.7);
    this.playGrandPianoNote(chord.bass * 2, now + 0.03, 4.5, 0.55);

    // 3. Arpeggiated Mid-Voice Harmony (Felt Piano Voicing)
    this.playPianoArpeggios(chord.harmony, now, chordDuration);

    // 4. Singing Romantic Melody Line
    this.playLyricalMelody(chord.melody, now, chordDuration);

    // 5. Celestial Chimes in Later Scenes
    if (this.currentScene >= 2) {
      this.playCelestialChimes(chord.harmony, now, chordDuration);
    }

    this.currentStep++;

    const nextMeasureMs = chordDuration * 1000 - 80;
    this.timerId = setTimeout(() => {
      this.playPianoScoreLoop();
    }, nextMeasureMs);
  }

  // High-Fidelity Romantic Grand Piano Voice
  playGrandPianoNote(freq, startTime, duration = 3.8, velocity = 0.5) {
    if (!this.ctx) return;

    // Dual sound oscillators (Fundamental + Soft Triangle Hammer Harmonic)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    const noteGain = this.ctx.createGain();
    const feltFilter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc3.type = 'sine';

    osc1.frequency.setValueAtTime(freq, startTime);
    // Subtle natural acoustic detune for warm grand piano chorus
    osc2.frequency.setValueAtTime(freq * 1.0012, startTime);
    osc3.frequency.setValueAtTime(freq * 2.002, startTime); // 1st overtone

    // Soft Felt Piano Filter with dynamic hammer softening
    feltFilter.type = 'lowpass';
    const initialCutoff = Math.min(freq * 4.8, 5200);
    feltFilter.frequency.setValueAtTime(initialCutoff, startTime);
    feltFilter.frequency.exponentialRampToValueAtTime(freq * 1.8, startTime + duration * 0.7);

    // Multi-stage Piano Key Envelope
    const gainPeak = Math.min(velocity * 0.32, 0.42);
    noteGain.gain.setValueAtTime(0.0001, startTime);
    // Fast hammer attack (18ms)
    noteGain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.018);
    // Initial singing strike decay
    noteGain.gain.exponentialRampToValueAtTime(gainPeak * 0.55, startTime + 0.4);
    // Natural acoustic resonance fade
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Overtone level
    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.18, startTime);
    osc3.connect(overtoneGain);
    overtoneGain.connect(feltFilter);

    osc1.connect(feltFilter);
    osc2.connect(feltFilter);
    feltFilter.connect(noteGain);

    noteGain.connect(this.masterGain);
    if (this.reverbNode) {
      noteGain.connect(this.reverbNode);
    }

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
    osc3.stop(startTime + duration + 0.1);
  }

  // Flowing Arpeggiated Piano Pattern (Ballad Style)
  playPianoArpeggios(notes, startTime, duration) {
    const beat = duration / 8;
    const pattern = [
      { idx: 0, time: beat * 0.8, vel: 0.45 },
      { idx: 1, time: beat * 1.8, vel: 0.48 },
      { idx: 2, time: beat * 2.8, vel: 0.52 },
      { idx: 3, time: beat * 4.2, vel: 0.55 },
      { idx: 2, time: beat * 5.4, vel: 0.46 },
      { idx: 1, time: beat * 6.6, vel: 0.42 }
    ];

    pattern.forEach(p => {
      const noteFreq = notes[p.idx % notes.length];
      const humanize = (Math.random() - 0.5) * 0.035; // gentle rubato touch
      this.playGrandPianoNote(noteFreq, startTime + p.time + humanize, 3.4, p.vel);
    });
  }

  // Singing Lyrical Piano Melody
  playLyricalMelody(melodyNotes, startTime, duration) {
    const stepTime = duration / melodyNotes.length;
    melodyNotes.forEach((freq, i) => {
      const noteTime = startTime + i * stepTime + (Math.random() - 0.5) * 0.04;
      const velocity = 0.58 + (i % 2 === 0 ? 0.08 : -0.04);
      this.playGrandPianoNote(freq, noteTime, 3.8, velocity);
    });
  }

  // Warm Orchestral Strings & Cello Pad
  playRomanticStrings(bassFreq, harmonyNotes, startTime, duration) {
    const padGain = this.ctx.createGain();
    const padFilter = this.ctx.createBiquadFilter();

    padFilter.type = 'lowpass';
    const cutoff = this.currentScene >= 4 ? 1600 : 950;
    padFilter.frequency.setValueAtTime(cutoff * 0.8, startTime);
    padFilter.frequency.linearRampToValueAtTime(cutoff, startTime + duration * 0.5);

    const padVolume = this.currentScene >= 4 ? 0.16 : 0.10;
    padGain.gain.setValueAtTime(0.0001, startTime);
    padGain.gain.linearRampToValueAtTime(padVolume, startTime + 1.2);
    padGain.gain.setValueAtTime(padVolume, startTime + duration - 0.9);
    padGain.gain.linearRampToValueAtTime(0.0001, startTime + duration + 0.6);

    const stringVoices = [bassFreq * 2, harmonyNotes[0], harmonyNotes[2] || harmonyNotes[1]];
    stringVoices.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.detune.setValueAtTime((idx - 1) * 6, startTime);

      // Subtle warm vibrato LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.6, startTime);
      lfoGain.gain.setValueAtTime(2.2, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(startTime + 0.6);
      lfo.stop(startTime + duration + 0.5);

      osc.connect(padFilter);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.6);
    });

    padFilter.connect(padGain);
    padGain.connect(this.masterGain);
    if (this.reverbNode) {
      padGain.connect(this.reverbNode);
    }
  }

  // Celestial High Chimes & Harp Sparkle
  playCelestialChimes(notes, startTime, duration) {
    if (Math.random() > 0.6) return;
    const chimeFreq = (notes[notes.length - 1] || 523.25) * 2;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(chimeFreq, startTime + duration * 0.45);

    gain.gain.setValueAtTime(0.0001, startTime + duration * 0.45);
    gain.gain.linearRampToValueAtTime(0.09, startTime + duration * 0.45 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.45 + 2.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.reverbNode) gain.connect(this.reverbNode);

    osc.start(startTime + duration * 0.45);
    osc.stop(startTime + duration * 0.45 + 2.4);
  }

  // Climax Swell (Scene 4: Proposal Moment)
  playProposalSwell() {
    if (this.currentTrack === 'romantic_piano' && this.ctx) {
      const now = this.ctx.currentTime;
      // Ascending romantic harp arpeggio
      const harpNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      harpNotes.forEach((freq, i) => {
        this.playGrandPianoNote(freq, now + i * 0.08, 4.0, 0.6);
      });

      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(0.72, now);
        this.masterGain.gain.linearRampToValueAtTime(0.9, now + 2.0);
      }
    }
  }

  // Triumphant Wedding Bells Celebration (Scene 5: She Said YES!)
  playYesCelebration() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Majestic chord
    const triumphNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    triumphNotes.forEach(freq => {
      this.playGrandPianoNote(freq, now + 0.1, 5.5, 0.75);
    });

    // Cascade of joyful celestial bells
    for (let i = 0; i < 16; i++) {
      const bellFreq = 523.25 * Math.pow(1.05946, (i % 8) * 2);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(bellFreq, now + 0.2 + i * 0.11);

      gain.gain.setValueAtTime(0.0001, now + 0.2 + i * 0.11);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2 + i * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2 + i * 0.11 + 1.9);

      osc.connect(gain);
      gain.connect(this.masterGain);
      if (this.reverbNode) gain.connect(this.reverbNode);

      osc.start(now + 0.2 + i * 0.11);
      osc.stop(now + 0.2 + i * 0.11 + 2.1);
    }
  }

  // Gentle tactile chime for button clicks
  playGentleClick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1975.53, now + 0.08);

    gain.gain.setValueAtTime(0.05, now);
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
      const targetGain = this.isMuted ? 0 : 0.72;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
    if (this.audioElement) {
      this.audioElement.muted = this.isMuted;
    }
    return this.isMuted;
  }

  duck() {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.5);
    }
    if (this.audioElement && !this.isMuted) {
      this.audioElement.volume = 0.08;
    }
  }

  unduck() {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.72, this.ctx.currentTime + 0.8);
    }
    if (this.audioElement && !this.isMuted) {
      this.audioElement.volume = 0.85;
    }
  }

  setCustomAudio(file) {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    this.audioElement.src = objectUrl;
    this.currentTrack = 'custom';
    if (this.isPlaying) {
      if (this.timerId) clearTimeout(this.timerId);
      this.audioElement.play();
    }
  }
}

// Global instance
window.soundtrack = new RomanticSoundtrackEngine();
