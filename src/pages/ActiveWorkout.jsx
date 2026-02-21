import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Encouraging messages shown after logging a set ──────────────────────────
const ENCOURAGEMENTS = [
  "Set logged. You're stronger than yesterday.",
  "Nice one! Keep it up!",
  "Crushed it! On to the next.",
  "That's the spirit! Rest up.",
  "Solid rep work! You're building something great.",
  "One set closer to your goals.",
  "Consistency is king. Great set!",
  "You showed up today. That's already a win.",
];

// ─── Difficulty rating options ───────────────────────────────────────────────
const DIFFICULTY_OPTIONS = [
  { emoji: '\u{1F60E}', label: 'Too Easy', value: 1 },
  { emoji: '\u{1F60A}', label: 'Easy', value: 2 },
  { emoji: '\u{1F44D}', label: 'Just Right', value: 3 },
  { emoji: '\u{1F4AA}', label: 'Tough', value: 4 },
  { emoji: '\u{1F525}', label: 'Maximum', value: 5 },
];

// ─── Format seconds as mm:ss ─────────────────────────────────────────────────
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ─── Circular Progress Ring (SVG) ────────────────────────────────────────────
function CircularProgress({ secondsLeft, totalSeconds, size = 56, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      className="transform -rotate-90"
      aria-hidden="true"
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-white/20"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-white transition-[stroke-dashoffset] duration-1000 ease-linear"
      />
    </svg>
  );
}

// ─── Toast Component ─────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        bg-primary text-white px-5 py-3 rounded-2xl shadow-lg
        text-sm font-medium text-center max-w-[90vw]
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

// ─── Stepper Button ──────────────────────────────────────────────────────────
function StepperButton({ onClick, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="
        min-w-[44px] min-h-[44px] flex items-center justify-center
        bg-primary/10 text-primary font-bold text-lg
        rounded-xl active:bg-primary/20 active:scale-95
        transition-all duration-150 select-none
      "
    >
      {children}
    </button>
  );
}

// ─── Set Logging Inline Form ─────────────────────────────────────────────────
function SetLoggingForm({ exerciseId, lastSet, nextSetNumber, onLog }) {
  const [weight, setWeight] = useState(lastSet ? lastSet.weight : 0);
  const [reps, setReps] = useState(lastSet ? lastSet.reps : 10);

  // Sync defaults when lastSet changes (e.g. after logging a set)
  useEffect(() => {
    if (lastSet) {
      setWeight(lastSet.weight);
      setReps(lastSet.reps);
    }
  }, [lastSet]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLog(exerciseId, {
      setNumber: nextSetNumber,
      weight: Math.max(0, weight),
      reps: Math.max(1, reps),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-slide-up bg-bg rounded-2xl p-4 mt-3 border border-border"
    >
      <p className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wide">
        Set {nextSetNumber}
      </p>

      {/* Weight row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-text-muted w-12 shrink-0">Weight</span>
        <StepperButton
          onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
          ariaLabel="Decrease weight by 2.5 kg"
        >
          -
        </StepperButton>
        <div className="flex-1 relative">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            className="
              w-full text-center text-lg font-bold bg-white
              border border-border rounded-xl py-2.5 min-h-[44px]
              focus:outline-none focus:ring-2 focus:ring-primary/30
            "
            aria-label="Weight in kilograms"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">kg</span>
        </div>
        <StepperButton
          onClick={() => setWeight((w) => w + 2.5)}
          ariaLabel="Increase weight by 2.5 kg"
        >
          +
        </StepperButton>
      </div>

      {/* Reps row */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-text-muted w-12 shrink-0">Reps</span>
        <StepperButton
          onClick={() => setReps((r) => Math.max(1, r - 1))}
          ariaLabel="Decrease reps by 1"
        >
          -
        </StepperButton>
        <div className="flex-1">
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value, 10) || 1)}
            className="
              w-full text-center text-lg font-bold bg-white
              border border-border rounded-xl py-2.5 min-h-[44px]
              focus:outline-none focus:ring-2 focus:ring-primary/30
            "
            aria-label="Number of reps"
          />
        </div>
        <StepperButton
          onClick={() => setReps((r) => r + 1)}
          ariaLabel="Increase reps by 1"
        >
          +
        </StepperButton>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="
          w-full min-h-[52px] bg-success text-white font-bold text-base
          rounded-2xl active:scale-[0.97] active:brightness-90
          transition-all duration-150 shadow-sm
        "
      >
        Log Set
      </button>
    </form>
  );
}

// ─── Difficulty Rater ────────────────────────────────────────────────────────
function DifficultyRater({ exerciseId, currentRating, onRate }) {
  return (
    <div className="animate-slide-up mt-3">
      <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
        How did that feel?
      </p>
      <div className="flex gap-1.5">
        {DIFFICULTY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onRate(exerciseId, opt.value)}
            aria-label={opt.label}
            className={`
              flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl
              min-h-[44px] transition-all duration-150 active:scale-95
              ${
                currentRating === opt.value
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-border text-text hover:bg-primary/5'
              }
            `}
          >
            <span className="text-xl" role="img" aria-hidden="true">
              {opt.emoji}
            </span>
            <span className="text-[10px] font-medium leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Exercise Card ───────────────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  onLogSet,
  onRateDifficulty,
  onStartTimer,
  showToast,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const loggedSets = exercise.sets || [];
  const lastSet = loggedSets.length > 0 ? loggedSets[loggedSets.length - 1] : null;
  const nextSetNumber = loggedSets.length + 1;
  const showDifficultyRater = loggedSets.length >= 2;

  const handleLog = useCallback(
    (exerciseId, setData) => {
      onLogSet(exerciseId, setData);
      setIsFormOpen(false);
      showToast();
      // Auto-start 90-second rest timer after logging
      onStartTimer(90);
    },
    [onLogSet, onStartTimer, showToast]
  );

  // Muscle group badge colour mapping
  const badgeColor = {
    chest: 'bg-red-100 text-red-700',
    back: 'bg-blue-100 text-blue-700',
    legs: 'bg-purple-100 text-purple-700',
    shoulders: 'bg-orange-100 text-orange-700',
    arms: 'bg-teal-100 text-teal-700',
    core: 'bg-yellow-100 text-yellow-800',
    cardio: 'bg-rose-100 text-rose-700',
  };
  const badge =
    badgeColor[(exercise.muscleGroup || '').toLowerCase()] ||
    'bg-gray-100 text-gray-700';

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-base text-text leading-tight">
            {exercise.name}
          </h3>
          {exercise.equipment && (
            <p className="text-xs text-text-muted mt-0.5">{exercise.equipment}</p>
          )}
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge}`}
        >
          {exercise.muscleGroup}
        </span>
      </div>

      {/* Logged sets table */}
      {loggedSets.length > 0 && (
        <div className="mb-3">
          <div className="grid grid-cols-3 text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 px-1">
            <span>Set</span>
            <span className="text-center">Weight</span>
            <span className="text-right">Reps</span>
          </div>
          {loggedSets.map((s, idx) => (
            <div
              key={s.setNumber}
              className={`
                grid grid-cols-3 text-sm font-medium py-2 px-1
                ${idx === loggedSets.length - 1 ? 'animate-slide-up' : ''}
                ${idx % 2 === 0 ? 'bg-bg/60 rounded-lg' : ''}
              `}
            >
              <span className="text-text-muted">{s.setNumber}</span>
              <span className="text-center">{s.weight} kg</span>
              <span className="text-right">{s.reps}</span>
            </div>
          ))}
        </div>
      )}

      {/* Difficulty rater (2+ sets) */}
      {showDifficultyRater && (
        <DifficultyRater
          exerciseId={exercise.id}
          currentRating={exercise.difficultyRating || null}
          onRate={onRateDifficulty}
        />
      )}

      {/* Add Set button / inline form */}
      {isFormOpen ? (
        <SetLoggingForm
          exerciseId={exercise.id}
          lastSet={lastSet}
          nextSetNumber={nextSetNumber}
          onLog={handleLog}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="
            mt-3 w-full min-h-[44px] border-2 border-dashed border-primary/30
            text-primary font-semibold text-sm rounded-2xl
            flex items-center justify-center gap-2
            active:bg-primary/5 active:scale-[0.98]
            transition-all duration-150
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Set
        </button>
      )}
    </div>
  );
}

// ─── Rest Timer Bar (sticky bottom) ─────────────────────────────────────────
function RestTimerBar({ restTimer, onSkipTimer, onAdjustTimer }) {
  if (!restTimer || !restTimer.isRunning) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-primary text-white
        shadow-[0_-4px_20px_rgba(0,0,0,0.15)]
        animate-slide-up
      "
    >
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Circular progress + time */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <CircularProgress
              secondsLeft={restTimer.secondsLeft}
              totalSeconds={restTimer.totalSeconds}
              size={52}
              strokeWidth={4}
            />
            <span className="absolute text-xs font-bold">
              {formatTime(restTimer.secondsLeft)}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold">Rest Timer</p>
            <p className="text-xs text-white/70">
              {formatTime(restTimer.secondsLeft)} remaining
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdjustTimer(-15)}
            aria-label="Subtract 15 seconds"
            className="
              min-w-[44px] min-h-[44px] rounded-xl bg-white/15
              text-white text-xs font-bold
              flex items-center justify-center
              active:bg-white/25 transition-colors
            "
          >
            -15s
          </button>
          <button
            type="button"
            onClick={() => onAdjustTimer(15)}
            aria-label="Add 15 seconds"
            className="
              min-w-[44px] min-h-[44px] rounded-xl bg-white/15
              text-white text-xs font-bold
              flex items-center justify-center
              active:bg-white/25 transition-colors
            "
          >
            +15s
          </button>
          <button
            type="button"
            onClick={onSkipTimer}
            aria-label="Skip rest timer"
            className="
              min-w-[44px] min-h-[44px] rounded-xl bg-white/25
              text-white text-xs font-bold
              flex items-center justify-center
              active:bg-white/35 transition-colors
            "
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ActiveWorkout Component ────────────────────────────────────────────
export default function ActiveWorkout({
  workout,
  onLogSet,
  onRateDifficulty,
  onFinishWorkout,
  onAddExercise,
  onBack,
  restTimer,
  onStartTimer,
  onSkipTimer,
  onAdjustTimer,
  userLevel,
  userGoal,
}) {
  // ── Elapsed time tracker ───────────────────────────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Toast state ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback(() => {
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message: msg });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // ── Finish confirmation ────────────────────────────────────────────────────
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const exercises = workout?.exercises || [];
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
  const exercisesWithSets = exercises.filter((ex) => (ex.sets?.length || 0) > 0).length;

  // Extra bottom padding when rest timer is showing
  const hasActiveTimer = restTimer?.isRunning;

  return (
    <div className="min-h-screen bg-bg pb-28">
      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* ── Workout Summary Bar (sticky top) ──────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Back button + Stats */}
            <div className="flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="
                  min-w-[36px] min-h-[36px] flex items-center justify-center
                  rounded-xl bg-border/50 text-text-muted
                  active:scale-95 active:bg-border transition-all duration-150
                "
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <p className="font-bold text-text text-lg leading-none">{totalSets}</p>
                <p className="text-[11px] text-text-muted">Sets</p>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <p className="font-bold text-text text-lg leading-none">
                  {exercisesWithSets}/{exercises.length}
                </p>
                <p className="text-[11px] text-text-muted">Exercises</p>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <p className="font-bold text-text text-lg leading-none font-mono">
                  {formatTime(elapsedSeconds)}
                </p>
                <p className="text-[11px] text-text-muted">Elapsed</p>
              </div>
            </div>

            {/* Finish button */}
            {!showFinishConfirm ? (
              <button
                type="button"
                onClick={() => setShowFinishConfirm(true)}
                className="
                  min-h-[44px] px-4 bg-danger text-white
                  font-semibold text-sm rounded-xl
                  active:scale-95 active:brightness-90
                  transition-all duration-150
                "
              >
                Finish
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-slide-up">
                <span className="text-xs text-text-muted">Sure?</span>
                <button
                  type="button"
                  onClick={() => setShowFinishConfirm(false)}
                  className="
                    min-h-[44px] px-3 bg-border text-text
                    font-semibold text-sm rounded-xl
                    active:scale-95 transition-all
                  "
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFinishConfirm(false);
                    onFinishWorkout();
                  }}
                  className="
                    min-h-[44px] px-3 bg-danger text-white
                    font-bold text-sm rounded-xl
                    active:scale-95 transition-all
                  "
                >
                  Yes, Finish
                </button>
              </div>
            )}
          </div>

          {/* User context hint */}
          {userGoal && (
            <p className="text-[11px] text-text-muted mt-1.5 truncate">
              {userLevel && (
                <span className="capitalize font-medium">{userLevel}</span>
              )}
              {userLevel && userGoal && ' \u00B7 '}
              Goal: {userGoal}
            </p>
          )}
        </div>
      </div>

      {/* ── Exercise Cards ────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 space-y-4">
        {exercises.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3" role="img" aria-label="Flexing bicep">
              {'\u{1F4AA}'}
            </p>
            <p className="text-text-muted font-medium">
              No exercises yet. Add one to get started!
            </p>
          </div>
        )}

        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onLogSet={onLogSet}
            onRateDifficulty={onRateDifficulty}
            onStartTimer={onStartTimer}
            showToast={showToast}
          />
        ))}

        {/* ── Add Exercise Button ─────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onAddExercise}
          className="
            w-full min-h-[52px] bg-primary/5 border-2 border-dashed border-primary/25
            text-primary font-semibold text-sm rounded-2xl
            flex items-center justify-center gap-2
            active:bg-primary/10 active:scale-[0.98]
            transition-all duration-150
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Exercise
        </button>

        {/* Spacer when timer is active */}
        {hasActiveTimer && <div className="h-20" />}
      </div>

      {/* ── Rest Timer Bar (sticky bottom) ────────────────────────────────── */}
      <RestTimerBar
        restTimer={restTimer}
        onSkipTimer={onSkipTimer}
        onAdjustTimer={onAdjustTimer}
      />
    </div>
  );
}
