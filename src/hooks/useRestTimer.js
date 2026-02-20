import { useState, useEffect, useCallback, useRef } from 'react';

export function useRestTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current);
            // Vibrate if supported
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft]);

  const start = useCallback((seconds) => {
    setTotalSeconds(seconds);
    setSecondsLeft(seconds);
    setIsRunning(true);
  }, []);

  const skip = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const adjust = useCallback((delta) => {
    setSecondsLeft(prev => {
      const next = Math.max(0, prev + delta);
      setTotalSeconds(t => Math.max(t, next));
      return next;
    });
  }, []);

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  return {
    isRunning,
    secondsLeft,
    totalSeconds,
    progress,
    start,
    skip,
    adjust,
  };
}
