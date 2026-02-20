import { useState, useEffect } from 'react';

export default function RestTimerBar({ isRunning, secondsLeft, totalSeconds, onSkip, onAdjust }) {
  if (!isRunning && secondsLeft === 0) return null;

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isDone = !isRunning && secondsLeft === 0;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
      <div className="bg-white rounded-2xl shadow-lg border border-border p-3 flex items-center gap-3 max-w-md mx-auto">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg width="52" height="52" className="-rotate-90">
            <circle
              cx="26" cy="26" r={radius}
              fill="none"
              stroke="#E7E5E4"
              strokeWidth="4"
            />
            <circle
              cx="26" cy="26" r={radius}
              fill="none"
              stroke={secondsLeft <= 5 ? '#EF4444' : '#2D6A4F'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text">
            {timeDisplay}
          </span>
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text">Rest Timer</p>
          <p className="text-xs text-text-muted">
            {secondsLeft <= 0 ? 'Time to go!' : 'Resting...'}
          </p>
        </div>

        {/* Adjust Buttons */}
        <button
          onClick={() => onAdjust(-15)}
          className="w-8 h-8 rounded-full bg-bg text-text-muted text-xs font-bold flex items-center justify-center active:bg-border"
        >
          -15
        </button>
        <button
          onClick={() => onAdjust(15)}
          className="w-8 h-8 rounded-full bg-bg text-text-muted text-xs font-bold flex items-center justify-center active:bg-border"
        >
          +15
        </button>

        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-semibold active:bg-primary-dark"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
