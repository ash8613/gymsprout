// Smart Suggestion Algorithm
// Priority: 1. User level, 2. User goal, 3. Exercise history, 4. Progressive overload

const REST_TIMES = {
  fat_loss: 45,
  hypertrophy: 75,
  strength: 150,
  general: 60,
  endurance: 35,
};

const GOAL_MAP = {
  'Fat Loss': 'fat_loss',
  'Build Muscle': 'hypertrophy',
  'Get Strong': 'strength',
  'General Fitness': 'general',
  'Build Endurance': 'endurance',
};

export function getDefaultRestTime(goal) {
  const key = GOAL_MAP[goal] || 'general';
  return REST_TIMES[key] || 60;
}

export function getRepRange(goal) {
  const key = GOAL_MAP[goal] || 'general';
  const ranges = {
    fat_loss: { min: 12, max: 15, default: 12 },
    hypertrophy: { min: 8, max: 12, default: 10 },
    strength: { min: 3, max: 5, default: 5 },
    general: { min: 8, max: 12, default: 10 },
    endurance: { min: 15, max: 20, default: 15 },
  };
  return ranges[key] || ranges.general;
}

export function getDefaultSets(level) {
  if (level === 'beginner') return 3;
  if (level === 'intermediate') return 4;
  return 4;
}

export function getExerciseCount(level) {
  if (level === 'beginner') return 3;
  if (level === 'intermediate') return 4;
  return 5;
}

export function suggestExercises(exercises, muscleGroups, userLevel, userGoal, recentExerciseIds = []) {
  // Filter by muscle group
  let pool = exercises.filter(e => muscleGroups.includes(e.muscleGroup));

  // Filter by difficulty based on user level
  const allowedDifficulties = {
    beginner: ['beginner'],
    intermediate: ['beginner', 'intermediate'],
    advanced: ['beginner', 'intermediate', 'advanced'],
  };
  const allowed = allowedDifficulties[userLevel] || allowedDifficulties.beginner;
  pool = pool.filter(e => allowed.includes(e.difficulty));

  // Prefer exercises matching user goal
  const goalKey = GOAL_MAP[userGoal] || 'general';
  pool.sort((a, b) => {
    const aMatch = a.goalTags && a.goalTags.includes(goalKey) ? 1 : 0;
    const bMatch = b.goalTags && b.goalTags.includes(goalKey) ? 1 : 0;
    return bMatch - aMatch;
  });

  // Deprioritize recently used exercises (last 3 sessions)
  const recentSet = new Set(recentExerciseIds);
  pool.sort((a, b) => {
    const aRecent = recentSet.has(a.id) ? 1 : 0;
    const bRecent = recentSet.has(b.id) ? 1 : 0;
    return aRecent - bRecent;
  });

  // For beginners, prioritize bodyweight and machine exercises
  if (userLevel === 'beginner') {
    pool.sort((a, b) => {
      const order = { bodyweight: 0, none: 0, machine: 1, cable: 2, dumbbells: 3, barbell: 4 };
      return (order[a.equipment] ?? 3) - (order[b.equipment] ?? 3);
    });
  }

  const count = getExerciseCount(userLevel);

  // Try to get variety across equipment types
  const selected = [];
  const usedNames = new Set();

  for (const ex of pool) {
    if (selected.length >= count) break;
    if (!usedNames.has(ex.name)) {
      selected.push(ex);
      usedNames.add(ex.name);
    }
  }

  return selected;
}

export function getProgressionSuggestion(difficultyRating, currentWeight, currentReps) {
  switch (difficultyRating) {
    case 1: // Too Easy
      return {
        type: 'increase_weight',
        message: 'That was easy! Try adding 2.5kg next time.',
        suggestedWeight: currentWeight + 2.5,
        suggestedReps: currentReps
      };
    case 2: // Easy
      return {
        type: 'increase_slightly',
        message: 'Nice work! Try adding 1.25kg or 1 more rep next session.',
        suggestedWeight: currentWeight + 1.25,
        suggestedReps: currentReps + 1
      };
    case 3: // Just Right
      return {
        type: 'maintain',
        message: 'Perfect challenge level. Keep this up!',
        suggestedWeight: currentWeight,
        suggestedReps: currentReps
      };
    case 4: // Tough
      return {
        type: 'maintain_recover',
        message: 'Tough session builds character. Same weight next time, you\'ll crush it.',
        suggestedWeight: currentWeight,
        suggestedReps: currentReps
      };
    case 5: // Maximum Effort
      return {
        type: 'decrease',
        message: 'Maximum effort! Consider slightly fewer reps or more rest next time.',
        suggestedWeight: currentWeight,
        suggestedReps: Math.max(currentReps - 1, 1)
      };
    default:
      return { type: 'maintain', message: '', suggestedWeight: currentWeight, suggestedReps: currentReps };
  }
}

export function calculateVolume(sets) {
  return sets.reduce((total, set) => total + (set.weight || 0) * (set.reps || 0), 0);
}

export function estimate1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  // Brzycki formula
  return Math.round(weight * (36 / (37 - reps)) * 10) / 10;
}

export function getDaysSince(dateString) {
  if (!dateString) return Infinity;
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getEncouragingMessage(context) {
  const messages = {
    setLogged: [
      "Set logged. You're stronger than yesterday.",
      "Nice one! Keep it up!",
      "That's the way! One set closer to your goals.",
      "Crushed it! Ready for the next one?",
      "Every set counts. You're doing amazing.",
    ],
    workoutComplete: [
      "Workout complete! You showed up and that's what matters.",
      "Another session in the books. Be proud!",
      "Done! Your future self thanks you.",
      "Great work today. Rest, recover, repeat.",
    ],
    prAchieved: [
      "NEW PERSONAL RECORD! You're officially stronger!",
      "PR ALERT! Look at you go!",
      "New record! The progress is real!",
    ],
    streakMilestone: [
      "Streak milestone! Consistency is your superpower.",
      "Look at that streak! You're building a habit.",
    ],
  };
  const pool = messages[context] || messages.setLogged;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest', emoji: '💪' },
  { id: 'back', name: 'Back', emoji: '🔙' },
  { id: 'shoulders', name: 'Shoulders', emoji: '🏋️' },
  { id: 'biceps', name: 'Biceps', emoji: '💪' },
  { id: 'triceps', name: 'Triceps', emoji: '💪' },
  { id: 'legs', name: 'Legs', emoji: '🦵' },
  { id: 'glutes', name: 'Glutes', emoji: '🍑' },
  { id: 'core', name: 'Core', emoji: '🎯' },
  { id: 'calves', name: 'Calves', emoji: '🦶' },
  { id: 'full_body', name: 'Full Body', emoji: '⚡' },
  { id: 'cardio', name: 'Cardio', emoji: '❤️‍🔥' },
];
