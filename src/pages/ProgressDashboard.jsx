import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatVolume(volume) {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return volume.toLocaleString();
}

function getStreakFlames(weeks) {
  if (weeks <= 0) return "";
  if (weeks === 1) return "\uD83D\uDD25";
  if (weeks <= 3) return "\uD83D\uDD25\uD83D\uDD25";
  if (weeks <= 7) return "\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25";
  return "\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StreakSummary({ userProfile }) {
  const { name, streakWeeks, totalWorkouts } = userProfile;
  const flames = getStreakFlames(streakWeeks);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-stone-800 mb-4">
        Hey {name}, keep going!
      </h2>

      <div className="flex gap-4">
        {/* Streak card */}
        <div className="flex-1 bg-[#2D6A4F]/5 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1" role="img" aria-label="streak flames">
            {flames || "\u2014"}
          </div>
          <p className="text-2xl font-extrabold text-[#2D6A4F]">
            {streakWeeks}
          </p>
          <p className="text-xs font-medium text-[#2D6A4F]/70 uppercase tracking-wide mt-0.5">
            Week Streak
          </p>
        </div>

        {/* Total workouts card */}
        <div className="flex-1 bg-[#F59E0B]/5 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1" role="img" aria-label="muscle">
            {"\uD83D\uDCAA"}
          </div>
          <p className="text-2xl font-extrabold text-[#B45309]">
            {totalWorkouts}
          </p>
          <p className="text-xs font-medium text-[#B45309]/70 uppercase tracking-wide mt-0.5">
            Workouts
          </p>
        </div>
      </div>

      {streakWeeks > 0 && (
        <p className="text-sm text-[#2D6A4F] font-medium text-center mt-4">
          {streakWeeks === 1
            ? "You're on a roll! Keep it up this week!"
            : `${streakWeeks} weeks strong -- consistency is your superpower!`}
        </p>
      )}
      {streakWeeks === 0 && (
        <p className="text-sm text-stone-500 text-center mt-4">
          Start your first workout to begin your streak!
        </p>
      )}
    </div>
  );
}

function PersonalRecordsSection({ personalRecords, level }) {
  if (!personalRecords || personalRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">
          Personal Records
        </h2>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">{"\uD83C\uDFC6"}</div>
          <p className="text-stone-500 text-sm">
            No PRs yet -- they're coming!
          </p>
          <p className="text-stone-400 text-xs mt-1">
            Complete workouts to start setting records.
          </p>
        </div>
      </div>
    );
  }

  // Beginner: only show the latest PR
  // Intermediate: show up to 3
  // Advanced: show all with detailed stats
  const isAdvanced = level === "Advanced";
  const displayCount =
    level === "Beginner" ? 1 : level === "Intermediate" ? 3 : personalRecords.length;
  const displayRecords = personalRecords.slice(0, displayCount);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-stone-800 mb-4">
        Personal Records {"\uD83C\uDFC6"}
      </h2>

      <div className="flex flex-col gap-3">
        {displayRecords.map((pr, idx) => (
          <div
            key={`${pr.exerciseName}-${idx}`}
            className="flex items-center justify-between p-3 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/20"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-800 text-sm truncate">
                {pr.exerciseName}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {formatDate(pr.date)}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-3">
              <div className="text-right">
                <p className="text-sm font-bold text-[#B45309]">
                  {pr.maxWeight}kg x {pr.maxReps}
                </p>
                {isAdvanced && (
                  <p className="text-xs text-[#B45309]/70">
                    Vol: {formatVolume(pr.totalVolume)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-sm">
                {"\uD83E\uDD47"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VolumeChart({ weeklyVolume }) {
  if (!weeklyVolume || weeklyVolume.length < 2) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">
          Weekly Volume
        </h2>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">{"\uD83D\uDCCA"}</div>
          <p className="text-stone-500 text-sm">
            Train for 2 weeks to see your volume trend!
          </p>
        </div>
      </div>
    );
  }

  const maxVolume = Math.max(...weeklyVolume.map((w) => w.volume));
  const chartHeight = 140;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-stone-800 mb-4">
        Weekly Volume
      </h2>

      <div
        className="flex items-end gap-2 justify-between"
        style={{ height: chartHeight }}
        role="img"
        aria-label={`Bar chart showing weekly volume over ${weeklyVolume.length} weeks`}
      >
        {weeklyVolume.map((w, idx) => {
          const barHeight =
            maxVolume > 0
              ? Math.max((w.volume / maxVolume) * chartHeight, 4)
              : 4;
          const isMax = w.volume === maxVolume;

          return (
            <div
              key={`${w.week}-${idx}`}
              className="flex flex-col items-center flex-1"
            >
              {/* Volume label on top */}
              <span className="text-[10px] font-semibold text-stone-500 mb-1">
                {formatVolume(w.volume)}
              </span>

              {/* Bar */}
              <div
                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${
                  isMax
                    ? "bg-[#2D6A4F]"
                    : "bg-[#2D6A4F]/50"
                }`}
                style={{ height: barHeight }}
              />

              {/* Week label */}
              <span className="text-[10px] text-stone-400 mt-1.5 font-medium">
                {w.week}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutHistoryList({ workoutHistory, onViewWorkout }) {
  if (!workoutHistory || workoutHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">
          Workout History
        </h2>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">{"\uD83D\uDCDD"}</div>
          <p className="text-stone-500 text-sm">
            Your workout history will appear here after your first session.
          </p>
        </div>
      </div>
    );
  }

  const last10 = workoutHistory.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-stone-800 mb-4">
        Workout History
      </h2>

      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        {last10.map((workout) => (
          <button
            key={workout.id}
            onClick={() => onViewWorkout(workout.id)}
            className="
              w-full text-left p-4 rounded-xl border border-stone-100
              hover:bg-stone-50 hover:border-stone-200
              active:scale-[0.99] transition-all duration-150 cursor-pointer
            "
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-stone-800 text-sm">
                {formatDate(workout.date)}
              </p>
              <div className="flex items-center gap-1 text-xs text-stone-400">
                <span>{formatDuration(workout.duration)}</span>
                <span className="text-stone-300">{"\u00B7"}</span>
                <span>{workout.exerciseCount} exercises</span>
                <span className="text-stone-300">{"\u00B7"}</span>
                <span>{workout.setCount} sets</span>
              </div>
            </div>

            {/* Muscle group badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {workout.muscleGroups.map((mg) => (
                <span
                  key={mg}
                  className="
                    inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold
                    bg-[#2D6A4F]/10 text-[#2D6A4F] uppercase tracking-wide
                  "
                >
                  {mg}
                </span>
              ))}
            </div>

            <p className="text-xs text-stone-500">
              Total volume:{" "}
              <span className="font-semibold text-stone-700">
                {workout.totalVolume.toLocaleString()} kg
              </span>
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProgressDashboard({
  userProfile,
  personalRecords = [],
  workoutHistory = [],
  weeklyVolume = [],
  onViewWorkout,
}) {
  const level = userProfile?.level || "Beginner";

  const showVolumeChart = level === "Intermediate" || level === "Advanced";
  const showHistory = true; // all levels see history
  const showAllPRs = level !== "Beginner"; // beginner sees limited PRs

  // Encouragement message tailored to level
  const encouragement = useMemo(() => {
    switch (level) {
      case "Beginner":
        return "Every rep counts. You're building something amazing!";
      case "Intermediate":
        return "Your consistency is paying off. Keep pushing!";
      case "Advanced":
        return "Elite dedication. Time to chase new PRs!";
      default:
        return "Keep going!";
    }
  }, [level]);

  return (
    <div className="min-h-dvh bg-[#FAFAF9] pb-8">
      {/* Header */}
      <div className="bg-[#2D6A4F] px-4 pt-12 pb-8 rounded-b-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">
            Your Progress
          </h1>
          <p className="text-white/70 text-sm">{encouragement}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 flex flex-col gap-4">
        {/* Streak & Summary */}
        <StreakSummary userProfile={userProfile} />

        {/* Personal Records */}
        <PersonalRecordsSection personalRecords={personalRecords} level={level} />

        {/* Weekly Volume Chart (Intermediate+) */}
        {showVolumeChart && <VolumeChart weeklyVolume={weeklyVolume} />}

        {/* Beginner encouragement banner */}
        {level === "Beginner" && (
          <div className="bg-[#2D6A4F]/5 rounded-2xl p-5 text-center border border-[#2D6A4F]/10">
            <p className="text-[#2D6A4F] font-semibold text-sm mb-1">
              {"\uD83C\uDF1F"} Beginner Tip
            </p>
            <p className="text-stone-600 text-xs leading-relaxed">
              Focus on showing up consistently. As you log more workouts,
              you'll unlock volume charts and detailed PR tracking!
            </p>
          </div>
        )}

        {/* Workout History */}
        {showHistory && (
          <WorkoutHistoryList
            workoutHistory={workoutHistory}
            onViewWorkout={onViewWorkout}
          />
        )}
      </div>
    </div>
  );
}
