type SoundType = 'success' | 'error' | 'pop' | 'celebration';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || (window as Window & {
    webkitAudioContext?: typeof AudioContext;
  }).webkitAudioContext;

  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  return audioContext;
};

export const playSound = async (type: SoundType) => {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    await context.resume();
  }

  const time = context.currentTime;

  if (type === 'celebration') {
    [0, 0.15, 0.3, 0.45, 0.6, 0.75].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(
        [523, 587, 659, 784, 880, 1047][index],
        time + offset,
      );
      gain.gain.setValueAtTime(0.12, time + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, time + offset + 0.4);
      oscillator.start(time + offset);
      oscillator.stop(time + offset + 0.4);
    });
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);

  if (type === 'success') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, time);
    oscillator.frequency.exponentialRampToValueAtTime(1000, time + 0.1);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    oscillator.start(time);
    oscillator.stop(time + 0.5);
    return;
  }

  if (type === 'error') {
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, time);
    oscillator.frequency.linearRampToValueAtTime(100, time + 0.3);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.3);
    oscillator.start(time);
    oscillator.stop(time + 0.3);
    return;
  }

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(800, time);
  gain.gain.setValueAtTime(0.1, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  oscillator.start(time);
  oscillator.stop(time + 0.1);
};
