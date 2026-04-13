// frontend/src/utils/sound.ts
let audioElement: HTMLAudioElement | null = null;
let soundEnabled = localStorage.getItem('sound_enabled') !== 'false';

export const initNotificationSound = () => {
  if (typeof window !== 'undefined' && !audioElement) {
    audioElement = new Audio('/ding.wav');
    audioElement.volume = 0.5;
    audioElement.load();
  }
};

export const playNotificationSound = () => {
  if (!audioElement || !soundEnabled) return;
  audioElement.currentTime = 0;
  audioElement.play().catch(e => console.log('Sound play blocked:', e));
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  localStorage.setItem('sound_enabled', enabled.toString());
};

export const isSoundEnabled = () => soundEnabled;