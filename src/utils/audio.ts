/**
 * Synthesizes a soft, realistic paper page turn sound using the Web Audio API.
 * Requires no external audio files.
 */
let audioCtx: AudioContext | null = null;

export function playPageTurnSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // Create noise buffer for paper friction texture
    const bufferSize = audioCtx.sampleRate * 0.22; // ~220ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Pinkish shaped noise
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.08));
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Filter to paper swish frequencies (bandpass around 1200Hz - 2800Hz)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.18);
    filter.Q.setValueAtTime(1.2, now);

    // Gain envelope
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.09, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.22);
  } catch {
    // Audio context may be restricted before user gesture
  }
}
