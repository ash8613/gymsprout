import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Confetti({ trigger }) {
  useEffect(() => {
    if (trigger) {
      // Fire confetti from both sides
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ['#2D6A4F', '#F59E0B', '#22C55E', '#FBBF24', '#40916C'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [trigger]);

  return null;
}
