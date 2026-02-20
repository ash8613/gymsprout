import { useState, useEffect, useCallback } from 'react';
import OnboardingQuiz from './pages/OnboardingQuiz';
import Dashboard from './pages/Dashboard';
import MuscleGroupSelector from './pages/MuscleGroupSelector';
import ExerciseLibrary from './pages/ExerciseLibrary';
import ActiveWorkout from './pages/ActiveWorkout';
import ProgressDashboard from './pages/ProgressDashboard';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import RestTimerBar from './components/RestTimerBar';
import Toast from './components/Toast';
import MilestoneModal from './components/MilestoneModal';
import { useRestTimer } from './hooks/useRestTimer';
import { db, seedExercises } from './data/db';
import {
  suggestExercises,
  getDefaultRestTime,
  getRepRange,
  getDefaultSets,
  calculateVolume,
  getEncouragingMessage,
  getDaysSince,
  formatDate,
} from './utils/suggestions';

export default function App() {
  // Core state
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [exercises, setExercises] = useState([]);
  const [settings, setSettings] = useState({
    restTimerAutoStart: true,
    restTimerDefault: 60,
    weightUnit: 'kg',
  });

  // Workout state
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [suggestedExercises, setSuggestedExercises] = useState([]);

  // Progress state
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [recentPRs, setRecentPRs] = useState([]);

  // UI state
  const [toast, setToast] = useState(null);
  const [milestone, setMilestone] = useState(null);

  // Rest timer
  const restTimer = useRestTimer();

  // Initialize app
  useEffect(() => {
    initApp();
  }, []);

  async function initApp() {
    try {
      await seedExercises();
      const allExercises = await db.exercises.toArray();
      setExercises(allExercises);

      const profiles = await db.userProfile.toArray();
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
        const savedSettings = localStorage.getItem('gymsprout_settings');
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        await loadProgressData();
      }
    } catch (err) {
      console.error('Init error:', err);
    }
    setLoading(false);
  }

  async function loadProgressData() {
    try {
      const workouts = await db.workouts.orderBy('date').reverse().toArray();
      const workoutsWithDetails = await Promise.all(
        workouts.slice(0, 20).map(async (w) => {
          const sets = await db.workoutSets.where('workoutId').equals(w.id).toArray();
          return {
            ...w,
            totalVolume: calculateVolume(sets),
            setCount: sets.length,
            exerciseCount: new Set(sets.map(s => s.exerciseId)).size,
          };
        })
      );
      setWorkoutHistory(workoutsWithDetails);

      const records = await db.progressRecords.toArray();
      const prMap = {};
      for (const r of records) {
        const ex = await db.exercises.get(r.exerciseId);
        const key = r.exerciseId;
        if (!prMap[key] || r.maxWeight > prMap[key].maxWeight) {
          prMap[key] = { ...r, exerciseName: ex?.name || 'Unknown' };
        }
      }
      const prList = Object.values(prMap);
      setPersonalRecords(prList);
      setRecentPRs(prList.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3));
    } catch (err) {
      console.error('Load progress error:', err);
    }
  }

  // Onboarding complete
  async function handleOnboardingComplete({ name, level, goal, quizScore }) {
    const profile = {
      name,
      level,
      goal,
      quizScore,
      createdAt: new Date().toISOString(),
      streakWeeks: 0,
      streakFreezeUsed: false,
      lastWorkoutDate: null,
      totalWorkouts: 0,
    };
    const id = await db.userProfile.add(profile);
    setUserProfile({ ...profile, id });
    setPage('dashboard');
  }

  // Start workout flow
  function handleStartWorkout() {
    setPage('muscle_select');
  }

  async function handleMuscleGroupsSelected(groups) {
    setSelectedMuscleGroups(groups);

    // Get recent exercise IDs to avoid repetition
    const recentWorkouts = await db.workouts.orderBy('date').reverse().limit(3).toArray();
    const recentSetsList = [];
    for (const w of recentWorkouts) {
      const sets = await db.workoutSets.where('workoutId').equals(w.id).toArray();
      recentSetsList.push(...sets);
    }
    const recentExIds = [...new Set(recentSetsList.map(s => s.exerciseId))];

    const suggested = suggestExercises(
      exercises,
      groups,
      userProfile.level,
      userProfile.goal,
      recentExIds
    );
    setSuggestedExercises(suggested);

    // Create workout session
    const workoutId = await db.workouts.add({
      date: new Date().toISOString(),
      muscleGroups: groups,
      duration: 0,
      notes: '',
      userId: userProfile.id,
    });

    const workoutExercises = suggested.map(ex => ({
      ...ex,
      sets: [],
    }));

    setActiveWorkout({
      id: workoutId,
      startTime: Date.now(),
      exercises: workoutExercises,
    });
    setPage('active_workout');
  }

  // Logging
  async function handleLogSet(exerciseId, { setNumber, weight, reps }) {
    if (!activeWorkout) return;

    await db.workoutSets.add({
      workoutId: activeWorkout.id,
      exerciseId,
      setNumber,
      weight,
      reps,
      difficultyRating: null,
    });

    // Update active workout state
    setActiveWorkout(prev => {
      const updated = { ...prev };
      updated.exercises = updated.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [...ex.sets, { setNumber, weight, reps, difficultyRating: null }],
          };
        }
        return ex;
      });
      return updated;
    });

    // Update progress record
    await updateProgressRecord(exerciseId, weight, reps);

    // Auto-start rest timer
    if (settings.restTimerAutoStart) {
      const restTime = getDefaultRestTime(userProfile.goal);
      restTimer.start(restTime);
    }

    // Show encouraging toast
    showToast(getEncouragingMessage('setLogged'));
  }

  async function updateProgressRecord(exerciseId, weight, reps) {
    const existing = await db.progressRecords
      .where('exerciseId')
      .equals(exerciseId)
      .toArray();

    const today = new Date().toISOString().split('T')[0];
    let isNewPR = false;

    if (existing.length === 0) {
      await db.progressRecords.add({
        exerciseId,
        date: today,
        maxWeight: weight,
        maxReps: reps,
        totalVolume: weight * reps,
        estimated1rm: 0,
      });
      isNewPR = true;
    } else {
      const best = existing.reduce((a, b) => a.maxWeight >= b.maxWeight ? a : b);
      if (weight > best.maxWeight || reps > best.maxReps) {
        await db.progressRecords.add({
          exerciseId,
          date: today,
          maxWeight: Math.max(weight, best.maxWeight),
          maxReps: Math.max(reps, best.maxReps),
          totalVolume: weight * reps,
          estimated1rm: 0,
        });
        isNewPR = true;
      }
    }

    if (isNewPR && userProfile.totalWorkouts > 0) {
      showToast(getEncouragingMessage('prAchieved'), 'pr');
      if (userProfile.totalWorkouts === 0) {
        setMilestone('firstPR');
      }
    }
  }

  async function handleRateDifficulty(exerciseId, rating) {
    if (!activeWorkout) return;

    // Update the last set's difficulty rating for this exercise
    const sets = await db.workoutSets
      .where('workoutId')
      .equals(activeWorkout.id)
      .toArray();

    const exerciseSets = sets.filter(s => s.exerciseId === exerciseId);
    if (exerciseSets.length > 0) {
      const lastSet = exerciseSets[exerciseSets.length - 1];
      await db.workoutSets.update(lastSet.id, { difficultyRating: rating });
    }

    // Update local state
    setActiveWorkout(prev => {
      const updated = { ...prev };
      updated.exercises = updated.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const updatedSets = [...ex.sets];
          if (updatedSets.length > 0) {
            updatedSets[updatedSets.length - 1] = {
              ...updatedSets[updatedSets.length - 1],
              difficultyRating: rating,
            };
          }
          return { ...ex, sets: updatedSets };
        }
        return ex;
      });
      return updated;
    });
  }

  async function handleFinishWorkout() {
    if (!activeWorkout) return;

    const duration = Math.round((Date.now() - activeWorkout.startTime) / 1000 / 60);
    await db.workouts.update(activeWorkout.id, { duration });

    // Update user profile
    const newTotalWorkouts = (userProfile.totalWorkouts || 0) + 1;
    const now = new Date();
    const lastDate = userProfile.lastWorkoutDate ? new Date(userProfile.lastWorkoutDate) : null;

    // Streak logic: streak increments if this is the first workout of the week
    let newStreak = userProfile.streakWeeks || 0;
    if (!lastDate) {
      newStreak = 1;
    } else {
      const daysSinceLast = getDaysSince(userProfile.lastWorkoutDate);
      if (daysSinceLast <= 7) {
        // Still within streak window
        const lastWeekNum = getWeekNumber(lastDate);
        const thisWeekNum = getWeekNumber(now);
        if (thisWeekNum > lastWeekNum) {
          newStreak += 1;
        }
      } else if (daysSinceLast <= 14 && !userProfile.streakFreezeUsed) {
        // Streak freeze: one missed week per month
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const updates = {
      totalWorkouts: newTotalWorkouts,
      lastWorkoutDate: now.toISOString(),
      streakWeeks: newStreak,
    };
    await db.userProfile.update(userProfile.id, updates);
    setUserProfile(prev => ({ ...prev, ...updates }));

    // Check milestones
    if (newTotalWorkouts === 1) {
      setMilestone('firstWorkout');
    } else if (newStreak === 1 && userProfile.streakWeeks === 0 && getDaysSince(userProfile.lastWorkoutDate) > 7) {
      setMilestone('comeBack');
    } else if (newStreak === 4) {
      setMilestone('firstMonth');
    } else if (newStreak === 12) {
      setMilestone('threeMonths');
    }

    restTimer.skip();
    setActiveWorkout(null);
    await loadProgressData();
    setPage('dashboard');
    showToast(getEncouragingMessage('workoutComplete'));
  }

  async function handleBackFromWorkout() {
    if (!activeWorkout) return;
    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
    if (totalSets > 0) {
      if (!window.confirm('You have logged sets. Discard this workout?')) return;
    }
    // Delete the unfinished workout from DB
    await db.workoutSets.where('workoutId').equals(activeWorkout.id).delete();
    await db.workouts.delete(activeWorkout.id);
    restTimer.skip();
    setActiveWorkout(null);
    setPage('dashboard');
  }

  function handleAddExerciseToWorkout() {
    setPage('exercise_picker');
  }

  function handleExerciseSelected(exercise) {
    if (!activeWorkout) return;
    setActiveWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...exercise, sets: [] }],
    }));
    setPage('active_workout');
  }

  async function handleAddCustomExercise(exerciseData) {
    const id = await db.exercises.add(exerciseData);
    const newExercise = { ...exerciseData, id };
    setExercises(prev => [...prev, newExercise]);
  }

  function handleExercisesConfirmed(selectedExercises) {
    if (!activeWorkout) return;
    const newExercises = selectedExercises.map(ex => ({ ...ex, sets: [] }));
    setActiveWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, ...newExercises],
    }));
    setPage('active_workout');
  }

  // Settings
  function handleUpdateSettings(updates) {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('gymsprout_settings', JSON.stringify(newSettings));
  }

  async function handleUpdateProfile(updates) {
    if (!userProfile) return;
    await db.userProfile.update(userProfile.id, updates);
    setUserProfile(prev => ({ ...prev, ...updates }));
  }

  function handleRetakeQuiz() {
    setUserProfile(null);
    setPage('onboarding');
  }

  async function handleResetData() {
    await db.delete();
    window.location.reload();
  }

  // Navigation
  function handleNavigate(targetPage) {
    if (activeWorkout && targetPage !== 'active_workout') {
      // Don't leave active workout without confirmation
      if (!window.confirm('You have an active workout. Leave without finishing?')) return;
      setActiveWorkout(null);
      restTimer.skip();
    }
    setPage(targetPage);
  }

  // Toast helper
  function showToast(message, type = 'success') {
    setToast({ message, type, key: Date.now() });
  }

  // Week number helper
  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }

  // Loading
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">GYMSPROUT</div>
          <div className="text-text-muted">Loading your workout buddy...</div>
        </div>
      </div>
    );
  }

  // Onboarding
  if (!userProfile) {
    return <OnboardingQuiz onComplete={handleOnboardingComplete} />;
  }

  // Compute dashboard data
  const workoutsThisWeek = workoutHistory.filter(w => {
    const d = getDaysSince(w.date);
    return d < 7;
  }).length;

  const workoutsThisMonth = workoutHistory.filter(w => {
    const d = getDaysSince(w.date);
    return d < 30;
  }).length;

  const dashboardPRs = recentPRs.map(pr => ({
    exerciseName: pr.exerciseName,
    type: 'weight',
    value: pr.maxWeight,
    date: pr.date,
  }));

  // Recent muscle groups for selector
  const recentMuscleGroups = [];
  const mgMap = {};
  for (const w of workoutHistory) {
    for (const mg of (w.muscleGroups || [])) {
      if (!mgMap[mg]) {
        mgMap[mg] = getDaysSince(w.date);
        recentMuscleGroups.push({ muscleGroup: mg, daysAgo: mgMap[mg] });
      }
    }
  }

  // Weekly volume for chart
  const weeklyVolume = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
    const weekWorkouts = workoutHistory.filter(w => {
      const d = getDaysSince(w.date);
      return d >= i * 7 && d < (i + 1) * 7;
    });
    const vol = weekWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    weeklyVolume.push({ week: `Week ${4 - i}`, volume: vol });
  }

  // Render current page
  function renderPage() {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            userProfile={userProfile}
            recentPRs={dashboardPRs}
            workoutsThisWeek={workoutsThisWeek}
            workoutsThisMonth={workoutsThisMonth}
            onStartWorkout={handleStartWorkout}
            onNavigate={handleNavigate}
          />
        );

      case 'muscle_select':
        return (
          <MuscleGroupSelector
            onSelectMuscleGroups={handleMuscleGroupsSelected}
            userLevel={userProfile.level}
            recentMuscleGroups={recentMuscleGroups}
          />
        );

      case 'active_workout':
        return activeWorkout ? (
          <ActiveWorkout
            workout={activeWorkout}
            onLogSet={handleLogSet}
            onRateDifficulty={handleRateDifficulty}
            onFinishWorkout={handleFinishWorkout}
            onAddExercise={handleAddExerciseToWorkout}
            onBack={handleBackFromWorkout}
            restTimer={{
              isRunning: restTimer.isRunning,
              secondsLeft: restTimer.secondsLeft,
              totalSeconds: restTimer.totalSeconds,
            }}
            onStartTimer={restTimer.start}
            onSkipTimer={restTimer.skip}
            onAdjustTimer={restTimer.adjust}
            userLevel={userProfile.level}
            userGoal={userProfile.goal}
          />
        ) : (
          <Dashboard
            userProfile={userProfile}
            recentPRs={dashboardPRs}
            workoutsThisWeek={workoutsThisWeek}
            workoutsThisMonth={workoutsThisMonth}
            onStartWorkout={handleStartWorkout}
            onNavigate={handleNavigate}
          />
        );

      case 'exercise_picker':
        return (
          <ExerciseLibrary
            exercises={exercises}
            onSelectExercise={handleExerciseSelected}
            onBack={() => setPage(activeWorkout ? 'active_workout' : 'dashboard')}
            userLevel={userProfile.level}
            selectionMode={!!activeWorkout}
            onConfirmSelection={handleExercisesConfirmed}
            onAddCustomExercise={handleAddCustomExercise}
          />
        );

      case 'exercises':
        return (
          <ExerciseLibrary
            exercises={exercises}
            onSelectExercise={() => {}}
            onBack={() => setPage('dashboard')}
            userLevel={userProfile.level}
            selectionMode={false}
            onConfirmSelection={() => {}}
            onAddCustomExercise={handleAddCustomExercise}
          />
        );

      case 'progress':
        return (
          <ProgressDashboard
            userProfile={userProfile}
            personalRecords={personalRecords}
            workoutHistory={workoutHistory}
            weeklyVolume={weeklyVolume}
            onViewWorkout={() => {}}
          />
        );

      case 'settings':
        return (
          <Settings
            userProfile={userProfile}
            settings={settings}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSettings={handleUpdateSettings}
            onRetakeQuiz={handleRetakeQuiz}
            onResetData={handleResetData}
          />
        );

      default:
        return null;
    }
  }

  const showNav = !['muscle_select', 'active_workout', 'exercise_picker', 'onboarding'].includes(page);

  return (
    <div className="h-full flex flex-col bg-bg">
      <div className={`flex-1 overflow-y-auto ${showNav ? 'pb-16' : ''}`}>
        {renderPage()}
      </div>

      {/* Rest timer bar */}
      {(restTimer.isRunning || restTimer.secondsLeft > 0) && (
        <RestTimerBar
          isRunning={restTimer.isRunning}
          secondsLeft={restTimer.secondsLeft}
          totalSeconds={restTimer.totalSeconds}
          onSkip={restTimer.skip}
          onAdjust={restTimer.adjust}
        />
      )}

      {/* Bottom nav */}
      {showNav && (
        <BottomNav activePage={page} onNavigate={handleNavigate} />
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* Milestone celebrations */}
      <MilestoneModal
        milestone={milestone}
        onClose={() => setMilestone(null)}
      />
    </div>
  );
}
