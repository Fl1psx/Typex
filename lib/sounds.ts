type AudioContextConstructor = new () => AudioContext;

const ERROR_THROTTLE_MS = 100;

let audioContext: AudioContext | null = null;
let lastErrorAt = 0;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const browserWindow = window as typeof window & {
    webkitAudioContext?: AudioContextConstructor;
  };

  return window.AudioContext ?? browserWindow.webkitAudioContext ?? null;
}

function getNow() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function getContext(): AudioContext | null {
  const AudioContextClass = getAudioContextConstructor();

  if (!AudioContextClass) {
    return null;
  }

  try {
    audioContext ??= new AudioContextClass();

    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    return audioContext;
  } catch {
    return null;
  }
}

export function isAudioSupported() {
  return getAudioContextConstructor() !== null;
}

export function playError() {
  const nowMs = getNow();

  if (nowMs - lastErrorAt < ERROR_THROTTLE_MS) {
    return false;
  }

  const context = getContext();

  if (!context) {
    return false;
  }

  lastErrorAt = nowMs;

  try {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.linearRampToValueAtTime(170, now + 0.09);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.012);
    gain.gain.linearRampToValueAtTime(0, now + 0.09);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.095);

    return true;
  } catch {
    return false;
  }
}

export function playClick() {
  const context = getContext();

  if (!context) {
    return false;
  }

  try {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.002);
    gain.gain.linearRampToValueAtTime(0, now + 0.012);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.015);

    return true;
  } catch {
    return false;
  }
}
