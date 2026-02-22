
/**
 * Professional Web Audio API Synthesizer Utility
 * Designed for subtle, game-like sensory feedback.
 */

const getAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const playSound = (type: 'ignite' | 'complete' | 'collect' | 'tap') => {
  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.1, ctx.currentTime); // Keep it subtle

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    const now = ctx.currentTime;

    switch (type) {
      case 'tap':
        // A very short, high-pitched "tick" for interface taps
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'ignite':
        // A rising, powerful tech hum
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.8);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
        break;

      case 'complete':
        // A clean, high-tech success chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        
        // Second harmony note
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.frequency.setValueAtTime(1760, now + 0.1);
        gain2.gain.setValueAtTime(0, now + 0.1);
        gain2.gain.linearRampToValueAtTime(0.1, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.4);
        break;

      case 'collect':
        // Satisfying coin/crystal collection chirps
        const playCoin = (delay: number, freq: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(masterGain);
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + delay);
          g.gain.setValueAtTime(0, now + delay);
          g.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
          g.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);
          o.start(now + delay);
          o.stop(now + delay + 0.15);
        };
        playCoin(0, 950);
        playCoin(0.08, 1200);
        playCoin(0.16, 1500);
        break;
    }
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};
