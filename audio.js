/* ==========================================================
   ROMANTIC CINEMATIC SOUNDTRACK ENGINE (Muted / Silent Mode)
   ========================================================== */

class RomanticSoundtrackEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isMuted = true;
    this.currentTrack = 'none';

    this.audioElement = document.getElementById('custom-audio');
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
  }

  init() {
    // No-op
  }

  start() {
    // No sound
    this.isPlaying = false;
  }

  setTrack() {}
  playSelectedAudioTrack() {}
  playPianoScoreLoop() {}
  playGrandPianoNote() {}
  playPianoArpeggios() {}
  playLyricalMelody() {}
  playRomanticStrings() {}
  playCelestialChimes() {}
  playProposalSwell() {}
  playYesCelebration() {}
  playGentleClick() {}
  setScene() {}
  toggleMute() { return true; }
  duck() {}
  unduck() {}
  setCustomAudio() {}
}

// Global instance
window.soundtrack = new RomanticSoundtrackEngine();
