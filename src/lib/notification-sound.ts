let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function playNotificationSound() {
  try {
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();

    const gain = ac.createGain();
    gain.connect(ac.destination);
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ac.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);

    const play = (freq: number, start: number, dur: number) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime + start);
      osc.connect(gain);
      osc.start(ac.currentTime + start);
      osc.stop(ac.currentTime + start + dur);
    };

    play(880, 0, 0.15);
    play(1100, 0.12, 0.15);
    play(1320, 0.24, 0.3);
  } catch {
    // Audio blocked in some browsers — silently ignore
  }
}
