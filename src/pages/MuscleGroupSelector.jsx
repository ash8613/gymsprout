import { useState } from "react";

const MUSCLE_GROUPS = [
  { id: "chest", name: "Chest", emoji: "\uD83D\uDCAA" },
  { id: "back", name: "Back", emoji: "\uD83D\uDD19" },
  { id: "shoulders", name: "Shoulders", emoji: "\uD83C\uDFCB\uFE0F" },
  { id: "biceps", name: "Biceps", emoji: "\uD83D\uDCAA" },
  { id: "triceps", name: "Triceps", emoji: "\uD83D\uDCAA" },
  { id: "legs", name: "Legs", emoji: "\uD83E\uDDB5" },
  { id: "hamstrings", name: "Glutes & Hams", emoji: "\uD83C\uDF51" },
  { id: "core", name: "Core", emoji: "\uD83C\uDFAF" },
  { id: "calves", name: "Calves", emoji: "\uD83E\uDDB6" },
  { id: "full_body", name: "Full Body", emoji: "\u26A1" },
];

function MuscleGroupSelector({
  onSelectMuscleGroups,
  userLevel = "beginner",
  recentMuscleGroups = [],
}) {
  const [selected, setSelected] = useState([]);

  const getLastTrained = (muscleGroupId) => {
    const entry = recentMuscleGroups.find(
      (r) =>
        r.muscleGroup.toLowerCase().replace(/\s+/g, "") ===
        muscleGroupId.toLowerCase()
    );
    return entry || null;
  };

  const toggleSelection = (muscleGroupId) => {
    setSelected((prev) =>
      prev.includes(muscleGroupId)
        ? prev.filter((id) => id !== muscleGroupId)
        : [...prev, muscleGroupId]
    );
  };

  const handleStartWorkout = () => {
    onSelectMuscleGroups(selected);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-28">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Choose Muscle Groups
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select the muscle groups you want to train today
        </p>
      </div>

      {/* Beginner suggestion banner */}
      {userLevel === "beginner" && (
        <div className="mx-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="sparkles">
            ✨
          </span>
          <div>
            <p className="text-sm font-semibold text-[#2D6A4F]">
              New here? Try Full Body to start!
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              A great way to ease into your fitness journey
            </p>
          </div>
        </div>
      )}

      {/* Muscle group grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {MUSCLE_GROUPS.map((group) => {
          const isSelected = selected.includes(group.id);
          const lastTrained = getLastTrained(group.id);

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => toggleSelection(group.id)}
              className={`
                relative flex flex-col items-center justify-center
                bg-white rounded-2xl shadow-sm
                min-h-[120px] p-4
                transition-all duration-150 ease-in-out
                active:scale-[0.97]
                ${
                  isSelected
                    ? "border-2 border-[#2D6A4F] bg-emerald-50/40 shadow-md"
                    : "border-2 border-transparent"
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#2D6A4F] rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              <span className="text-3xl mb-2" role="img" aria-label={group.name}>
                {group.emoji}
              </span>
              <span
                className={`text-sm font-semibold ${
                  isSelected ? "text-[#2D6A4F]" : "text-gray-800"
                }`}
              >
                {group.name}
              </span>

              {/* Last trained info */}
              <span className="text-[11px] text-gray-400 mt-1 text-center leading-tight">
                {lastTrained
                  ? lastTrained.daysAgo === 0
                    ? "Trained today"
                    : lastTrained.daysAgo === 1
                    ? "Last trained 1 day ago"
                    : `Last trained ${lastTrained.daysAgo} days ago`
                  : "Not trained yet"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <div className="px-4 mt-4">
          <p className="text-xs text-gray-500 text-center">
            {selected.length} muscle group{selected.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
        </div>
      )}

      {/* Start Workout button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F5F0] via-[#F5F5F0] to-transparent pt-8">
        <button
          type="button"
          onClick={handleStartWorkout}
          disabled={selected.length === 0}
          className={`
            w-full py-4 rounded-2xl text-base font-bold
            transition-all duration-200
            ${
              selected.length > 0
                ? "bg-[#2D6A4F] text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {selected.length > 0
            ? `Start Workout (${selected.length} group${
                selected.length !== 1 ? "s" : ""
              })`
            : "Select at least 1 muscle group"}
        </button>
      </div>
    </div>
  );
}

export default MuscleGroupSelector;
