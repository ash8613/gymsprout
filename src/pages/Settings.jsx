import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOALS = [
  "Fat Loss",
  "Build Muscle",
  "Get Strong",
  "General Fitness",
  "Build Endurance",
];

const LEVEL_COLORS = {
  Beginner: {
    bg: "bg-emerald-50",
    text: "text-[#2D6A4F]",
    border: "border-emerald-200",
  },
  Intermediate: {
    bg: "bg-amber-50",
    text: "text-[#B45309]",
    border: "border-amber-200",
  },
  Advanced: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
};

const REST_MIN = 15;
const REST_MAX = 300;
const REST_STEP = 15;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRestTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ children }) {
  return (
    <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 px-1">
      {children}
    </h2>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800">{label}</p>
        {description && (
          <p className="text-xs text-stone-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-7 w-12 items-center rounded-full
        transition-colors duration-200 cursor-pointer
        ${checked ? "bg-[#2D6A4F]" : "bg-stone-300"}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}

function ProfileSection({ userProfile, onUpdateProfile }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name || "");

  const levelStyle = LEVEL_COLORS[userProfile.level] || LEVEL_COLORS.Beginner;

  const handleSaveName = useCallback(() => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0 && trimmed !== userProfile.name) {
      onUpdateProfile({ name: trimmed });
    } else {
      setNameInput(userProfile.name);
    }
    setEditingName(false);
  }, [nameInput, userProfile.name, onUpdateProfile]);

  const handleNameKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSaveName();
      if (e.key === "Escape") {
        setNameInput(userProfile.name);
        setEditingName(false);
      }
    },
    [handleSaveName, userProfile.name]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <SectionHeader>Profile</SectionHeader>

      {/* Name */}
      <SettingRow label="Name" description="Tap to edit your display name">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleNameKeyDown}
              autoFocus
              maxLength={30}
              className="
                w-32 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-800
                bg-stone-50 border border-stone-200
                focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10
                transition-all duration-200
              "
            />
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="
              px-3 py-1.5 rounded-lg text-sm font-medium text-stone-700
              bg-stone-50 hover:bg-stone-100 active:scale-[0.97]
              transition-all duration-150 cursor-pointer
            "
          >
            {userProfile.name}
          </button>
        )}
      </SettingRow>

      {/* Level badge */}
      <SettingRow label="Level" description="Based on your quiz results">
        <span
          className={`
            inline-block px-3 py-1 rounded-full text-xs font-bold border
            ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}
          `}
        >
          {userProfile.level}
        </span>
      </SettingRow>

      {/* Goal */}
      <SettingRow label="Goal" description="Your primary fitness objective">
        <select
          value={userProfile.goal}
          onChange={(e) => onUpdateProfile({ goal: e.target.value })}
          className="
            px-3 py-1.5 rounded-lg text-sm font-medium text-stone-700
            bg-stone-50 border border-stone-200
            focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10
            transition-all duration-200 cursor-pointer appearance-none
            pr-8 bg-no-repeat bg-[length:16px] bg-[right_8px_center]
          "
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          }}
        >
          {GOALS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </SettingRow>
    </div>
  );
}

function WorkoutSettingsSection({ settings, onUpdateSettings }) {
  const handleRestChange = useCallback(
    (delta) => {
      const next = Math.min(
        REST_MAX,
        Math.max(REST_MIN, settings.restTimerDefault + delta)
      );
      onUpdateSettings({ restTimerDefault: next });
    },
    [settings.restTimerDefault, onUpdateSettings]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <SectionHeader>Workout Settings</SectionHeader>

      {/* Rest timer auto-start */}
      <SettingRow
        label="Auto-start Rest Timer"
        description="Automatically start the timer after completing a set"
      >
        <Toggle
          checked={settings.restTimerAutoStart}
          onChange={(val) => onUpdateSettings({ restTimerAutoStart: val })}
        />
      </SettingRow>

      <div className="border-t border-stone-100" />

      {/* Default rest time */}
      <SettingRow
        label="Default Rest Time"
        description={`${REST_MIN}s -- ${formatRestTime(REST_MAX)}`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRestChange(-REST_STEP)}
            disabled={settings.restTimerDefault <= REST_MIN}
            className="
              w-8 h-8 rounded-lg flex items-center justify-center
              bg-stone-100 text-stone-600 font-bold text-lg
              hover:bg-stone-200 active:scale-[0.93]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-150 cursor-pointer
            "
            aria-label="Decrease rest time"
          >
            -
          </button>

          <span className="w-16 text-center text-sm font-bold text-stone-800">
            {formatRestTime(settings.restTimerDefault)}
          </span>

          <button
            onClick={() => handleRestChange(REST_STEP)}
            disabled={settings.restTimerDefault >= REST_MAX}
            className="
              w-8 h-8 rounded-lg flex items-center justify-center
              bg-stone-100 text-stone-600 font-bold text-lg
              hover:bg-stone-200 active:scale-[0.93]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-150 cursor-pointer
            "
            aria-label="Increase rest time"
          >
            +
          </button>
        </div>
      </SettingRow>

      <div className="border-t border-stone-100" />

      {/* Weight unit */}
      <SettingRow label="Weight Unit" description="Used across all exercises">
        <div className="flex rounded-lg overflow-hidden border border-stone-200">
          <button
            onClick={() => onUpdateSettings({ weightUnit: "kg" })}
            className={`
              px-4 py-1.5 text-sm font-semibold transition-all duration-150 cursor-pointer
              ${
                settings.weightUnit === "kg"
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white text-stone-500 hover:bg-stone-50"
              }
            `}
          >
            kg
          </button>
          <button
            onClick={() => onUpdateSettings({ weightUnit: "lbs" })}
            className={`
              px-4 py-1.5 text-sm font-semibold transition-all duration-150 cursor-pointer
              ${
                settings.weightUnit === "lbs"
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white text-stone-500 hover:bg-stone-50"
              }
            `}
          >
            lbs
          </button>
        </div>
      </SettingRow>
    </div>
  );
}

function AccountActionsSection({ onRetakeQuiz, onResetData }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetClick = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const handleConfirmReset = useCallback(() => {
    setShowResetConfirm(false);
    onResetData();
  }, [onResetData]);

  const handleCancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <SectionHeader>Account</SectionHeader>

      <div className="flex flex-col gap-2">
        {/* Retake Quiz */}
        <button
          onClick={onRetakeQuiz}
          className="
            w-full py-3 px-4 rounded-xl text-sm font-semibold text-left
            text-[#2D6A4F] bg-[#2D6A4F]/5 hover:bg-[#2D6A4F]/10
            active:scale-[0.99] transition-all duration-150 cursor-pointer
            flex items-center justify-between
          "
        >
          <span>Retake Level Quiz</span>
          <span className="text-[#2D6A4F]/50">{"\u203A"}</span>
        </button>

        {/* Export Data */}
        <button
          onClick={() => {}}
          className="
            w-full py-3 px-4 rounded-xl text-sm font-semibold text-left
            text-stone-700 bg-stone-50 hover:bg-stone-100
            active:scale-[0.99] transition-all duration-150 cursor-pointer
            flex items-center justify-between
          "
        >
          <span>Export Data</span>
          <span className="text-stone-400">{"\u203A"}</span>
        </button>

        {/* Reset All Data */}
        {!showResetConfirm ? (
          <button
            onClick={handleResetClick}
            className="
              w-full py-3 px-4 rounded-xl text-sm font-semibold text-left
              text-red-600 bg-red-50 hover:bg-red-100
              active:scale-[0.99] transition-all duration-150 cursor-pointer
              flex items-center justify-between
            "
          >
            <span>Reset All Data</span>
            <span className="text-red-400">{"\u203A"}</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
            <p className="text-sm font-bold text-red-700 mb-1">
              Are you sure?
            </p>
            <p className="text-xs text-red-600/70 mb-4">
              This will permanently delete all your workout data, personal
              records, and settings. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelReset}
                className="
                  flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold
                  bg-white text-stone-700 border border-stone-200
                  hover:bg-stone-50 active:scale-[0.97]
                  transition-all duration-150 cursor-pointer
                "
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="
                  flex-1 py-2.5 px-4 rounded-xl text-sm font-bold
                  bg-red-600 text-white
                  hover:bg-red-700 active:scale-[0.97]
                  transition-all duration-150 cursor-pointer
                "
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Settings({
  userProfile,
  settings,
  onUpdateProfile,
  onUpdateSettings,
  onRetakeQuiz,
  onResetData,
}) {
  return (
    <div className="min-h-dvh bg-[#FAFAF9] pb-8">
      {/* Header */}
      <div className="bg-[#2D6A4F] px-4 pt-12 pb-8 rounded-b-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Settings</h1>
          <p className="text-white/70 text-sm">
            Customize your GymSprout experience
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 flex flex-col gap-4">
        <ProfileSection
          userProfile={userProfile}
          onUpdateProfile={onUpdateProfile}
        />

        <WorkoutSettingsSection
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />

        <AccountActionsSection
          onRetakeQuiz={onRetakeQuiz}
          onResetData={onResetData}
        />

        {/* About footer */}
        <div className="text-center py-6">
          <p className="text-xs text-stone-400 font-medium">
            GymSprout v1.0 -- Your First Gym Friend
          </p>
          <p className="text-[10px] text-stone-300 mt-1">
            Built with care for every fitness journey
          </p>
        </div>
      </div>
    </div>
  );
}
