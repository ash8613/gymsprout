import { useState } from "react";

const MUSCLE_GROUP_OPTIONS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "Calves",
  "Full Body",
];

const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Resistance Band",
  "Other",
];

const LEVEL_OPTIONS = ["beginner", "intermediate", "advanced"];

const DIFFICULTY_STYLES = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

const MUSCLE_GROUP_COLORS = {
  Chest: "bg-blue-100 text-blue-700",
  Back: "bg-purple-100 text-purple-700",
  Shoulders: "bg-orange-100 text-orange-700",
  Biceps: "bg-cyan-100 text-cyan-700",
  Triceps: "bg-teal-100 text-teal-700",
  Legs: "bg-rose-100 text-rose-700",
  Glutes: "bg-pink-100 text-pink-700",
  Core: "bg-yellow-100 text-yellow-700",
  Calves: "bg-indigo-100 text-indigo-700",
  "Full Body": "bg-emerald-100 text-emerald-700",
};

function ExerciseLibrary({
  exercises = [],
  onSelectExercise,
  onBack,
  userLevel = "beginner",
  selectionMode = false,
  onConfirmSelection,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const applyFilter = (filterType, value) => {
    if (filterType === "muscleGroup") {
      setMuscleGroupFilter(value);
      setActiveFilter("muscleGroup");
    } else if (filterType === "equipment") {
      setEquipmentFilter(value);
      setActiveFilter("equipment");
    } else if (filterType === "level") {
      setLevelFilter(value);
      setActiveFilter("level");
    }
    setOpenDropdown(null);
  };

  const clearFilters = () => {
    setActiveFilter("all");
    setMuscleGroupFilter("");
    setEquipmentFilter("");
    setLevelFilter("");
    setOpenDropdown(null);
  };

  const toggleExerciseSelection = (exercise) => {
    setSelectedExercises((prev) =>
      prev.some((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise]
    );
  };

  const handleConfirmSelection = () => {
    if (onConfirmSelection) {
      onConfirmSelection(selectedExercises);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (activeFilter === "muscleGroup" && muscleGroupFilter) {
      matchesFilter = exercise.muscleGroup === muscleGroupFilter;
    } else if (activeFilter === "equipment" && equipmentFilter) {
      matchesFilter = exercise.equipment === equipmentFilter;
    } else if (activeFilter === "level" && levelFilter) {
      matchesFilter = exercise.difficulty === levelFilter;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F5F5F0]">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Exercise Library</h1>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-2">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 focus:border-[#2D6A4F] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-500"
                aria-label="Clear search"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter chips row */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {/* All chip */}
          <button
            type="button"
            onClick={clearFilters}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === "all"
                ? "bg-[#2D6A4F] text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            All
          </button>

          {/* Muscle Group dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => toggleDropdown("muscleGroup")}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === "muscleGroup"
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {muscleGroupFilter || "Muscle Group"}
              <svg
                className={`w-3 h-3 transition-transform ${
                  openDropdown === "muscleGroup" ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openDropdown === "muscleGroup" && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 max-h-56 overflow-y-auto">
                {MUSCLE_GROUP_OPTIONS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => applyFilter("muscleGroup", group)}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                      muscleGroupFilter === group
                        ? "bg-emerald-50 text-[#2D6A4F] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Equipment dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => toggleDropdown("equipment")}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === "equipment"
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {equipmentFilter || "Equipment"}
              <svg
                className={`w-3 h-3 transition-transform ${
                  openDropdown === "equipment" ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openDropdown === "equipment" && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 max-h-56 overflow-y-auto">
                {EQUIPMENT_OPTIONS.map((equip) => (
                  <button
                    key={equip}
                    type="button"
                    onClick={() => applyFilter("equipment", equip)}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                      equipmentFilter === equip
                        ? "bg-emerald-50 text-[#2D6A4F] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {equip}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Level dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => toggleDropdown("level")}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === "level"
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {levelFilter
                ? levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)
                : "Level"}
              <svg
                className={`w-3 h-3 transition-transform ${
                  openDropdown === "level" ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openDropdown === "level" && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                {LEVEL_OPTIONS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => applyFilter("level", level)}
                    className={`w-full text-left px-4 py-2.5 text-xs capitalize transition-colors ${
                      levelFilter === level
                        ? "bg-emerald-50 text-[#2D6A4F] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200" />
      </div>

      {/* Close dropdown overlay */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdown(null)}
          aria-hidden="true"
        />
      )}

      {/* Results count */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs text-gray-400">
          {filteredExercises.length} exercise
          {filteredExercises.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Exercise list */}
      {filteredExercises.length > 0 ? (
        <div className="px-4 flex flex-col gap-3">
          {filteredExercises.map((exercise) => {
            const isSelected = selectedExercises.some(
              (e) => e.id === exercise.id
            );
            const muscleColor =
              MUSCLE_GROUP_COLORS[exercise.muscleGroup] ||
              "bg-gray-100 text-gray-700";
            const difficultyStyle =
              DIFFICULTY_STYLES[exercise.difficulty] ||
              "bg-gray-100 text-gray-600";

            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => {
                  if (selectionMode) {
                    toggleExerciseSelection(exercise);
                  } else {
                    onSelectExercise(exercise);
                  }
                }}
                className={`
                  w-full text-left bg-white rounded-xl shadow-sm p-4
                  transition-all duration-150 active:scale-[0.98]
                  ${
                    selectionMode && isSelected
                      ? "border-2 border-[#2D6A4F] bg-emerald-50/30"
                      : "border border-gray-100"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox in selection mode */}
                  {selectionMode && (
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#2D6A4F] border-[#2D6A4F]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
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
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Exercise name row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900">
                        {exercise.name}
                      </h3>
                      {exercise.isCustom && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Badges row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${muscleColor}`}
                      >
                        {exercise.muscleGroup}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${difficultyStyle}`}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>

                    {/* Equipment */}
                    {exercise.equipment && (
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {exercise.equipment}
                      </p>
                    )}
                  </div>

                  {/* Tap arrow (non-selection mode) */}
                  {!selectionMode && (
                    <svg
                      className="w-4 h-4 text-gray-300 mt-1 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="px-4 pt-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500">
            No exercises found
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try a different filter!
          </p>
        </div>
      )}

      {/* Floating confirm button in selection mode */}
      {selectionMode && selectedExercises.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F5F0] via-[#F5F5F0] to-transparent pt-8 z-20">
          <button
            type="button"
            onClick={handleConfirmSelection}
            className="w-full py-4 rounded-2xl text-base font-bold bg-[#2D6A4F] text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all duration-200"
          >
            Add {selectedExercises.length} exercise
            {selectedExercises.length !== 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}

export default ExerciseLibrary;
