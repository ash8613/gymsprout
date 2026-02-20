import { useEffect } from 'react';
import Confetti from './Confetti';

const MILESTONES = {
  firstWorkout: {
    title: 'First Workout Complete!',
    message: 'You did it! Your fitness journey starts now. Every expert was once a beginner.',
    emoji: '🎉',
  },
  firstWeek: {
    title: 'One Week Streak!',
    message: "A full week of working out. You're building a habit that will change your life.",
    emoji: '🔥',
  },
  firstMonth: {
    title: 'One Month Strong!',
    message: "30 days of showing up. Most people quit by now — you're not most people.",
    emoji: '💪',
  },
  firstPR: {
    title: 'Personal Record!',
    message: "You just set a new personal best. That's real, measurable progress!",
    emoji: '🏆',
  },
  firstWeightIncrease: {
    title: 'Weight Increase!',
    message: "You moved up in weight! Your body is adapting and getting stronger.",
    emoji: '📈',
  },
  newExercise: {
    title: 'New Exercise Unlocked!',
    message: "Trying new things takes courage. Way to expand your comfort zone!",
    emoji: '⭐',
  },
  comeBack: {
    title: 'Welcome Back!',
    message: "You came back after a break. That takes more strength than any lift.",
    emoji: '🤗',
  },
  threeMonths: {
    title: '3 Month Streak!',
    message: "Three months of consistency. You've officially made fitness a part of who you are.",
    emoji: '🔥🔥🔥',
  },
};

export default function MilestoneModal({ milestone, onClose }) {
  if (!milestone) return null;

  const data = MILESTONES[milestone] || {
    title: 'Achievement Unlocked!',
    message: 'You did something awesome!',
    emoji: '🎉',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <Confetti trigger={true} />
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">{data.emoji}</div>
        <h2 className="text-2xl font-bold text-primary mb-2">{data.title}</h2>
        <p className="text-text-muted mb-6 leading-relaxed">{data.message}</p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-white rounded-2xl font-semibold text-lg active:bg-primary-dark transition-colors"
        >
          Keep Going!
        </button>
      </div>
    </div>
  );
}

export { MILESTONES };
