class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.muted = false;
    this.audioContext = null;
  }

  init() {
    if (typeof window === 'undefined') return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  createBeep(frequency, duration, volume = 0.3) {
    if (!this.audioContext || this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playBoost() {
    this.createBeep(800, 0.2, 0.4);
    setTimeout(() => this.createBeep(1000, 0.15, 0.3), 100);
  }

  playShield() {
    this.createBeep(600, 0.3, 0.3);
    setTimeout(() => this.createBeep(700, 0.3, 0.3), 150);
  }

  playMalus() {
    this.createBeep(200, 0.4, 0.4);
  }

  playBonus() {
    this.createBeep(1200, 0.15, 0.3);
    setTimeout(() => this.createBeep(1400, 0.15, 0.3), 100);
  }

  playRaceStart() {
    this.createBeep(440, 0.2, 0.5);
    setTimeout(() => this.createBeep(440, 0.2, 0.5), 300);
    setTimeout(() => this.createBeep(440, 0.2, 0.5), 600);
    setTimeout(() => this.createBeep(880, 0.4, 0.6), 900);
  }

  playRaceEnd() {
    const notes = [523, 587, 659, 698, 784];
    notes.forEach((note, i) => {
      setTimeout(() => this.createBeep(note, 0.2, 0.4), i * 150);
    });
  }

  playCountdown() {
    this.createBeep(440, 0.15, 0.4);
  }

  playLapMarker() {
    this.createBeep(1000, 0.1, 0.2);
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.music) {
      this.music.muted = this.muted;
    }
    return this.muted;
  }

  cleanup() {
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const audioManager = new AudioManager();

export function initAudio() {
  audioManager.init();
}

export function playBoostSound() {
  audioManager.playBoost();
}

export function playShieldSound() {
  audioManager.playShield();
}

export function playMalusSound() {
  audioManager.playMalus();
}

export function playBonusSound() {
  audioManager.playBonus();
}

export function playRaceStartSound() {
  audioManager.playRaceStart();
}

export function playRaceEndSound() {
  audioManager.playRaceEnd();
}

export function playCountdownSound() {
  audioManager.playCountdown();
}
