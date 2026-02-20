import { useState, useEffect } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysSinceDate(dateString) {
  if (!dateString) return null;
  const last = new Date(dateString);
  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getWelcomeMessage(totalWorkouts, lastWorkoutDate) {
  if (!totalWorkouts || totalWorkouts === 0) {
    return "Ready for your first workout? Let's do this!";
  }
  const days = daysSinceDate(lastWorkoutDate);
  if (days === null) return "Ready for your first workout? Let's do this!";
  if (days === 0) return 'Great session today! Rest up and recover.';
  if (days <= 2) return "The hardest part is showing up. You're already here.";
  if (days <= 5) return 'Your gym sprout misses you. Even a quick session counts!';
  return 'Welcome back. No judgment, just gains.';
}

function getStreakFlames(weeks) {
  if (weeks >= 8) return '\u{1F525}\u{1F525}\u{1F525}';
  if (weeks >= 4) return '\u{1F525}\u{1F525}';
  if (weeks >= 1) return '\u{1F525}';
  return '';
}

function formatPRValue(type, value) {
  if (type === 'weight') return `${value}kg`;
  if (type === 'reps') return `${value} reps`;
  if (type === 'volume') return `${value}kg vol`;
  return `${value}`;
}

const MUSCLE_SUGGESTIONS = {
  beginner: [
    { group: 'full body', emoji: '\u{1F4AA}', message: 'How about a full body session?' },
    { group: 'upper body', emoji: '\u{1F3CB}\u{FE0F}', message: 'Time for some upper body work!' },
    { group: 'lower body', emoji: '\u{1F9B5}', message: 'Leg day is calling!' },
  ],
  intermediate: [
    { group: 'chest', emoji: '\u{1F4AA}', message: 'How about a chest day?' },
    { group: 'back', emoji: '\u{1F3CB}\u{FE0F}', message: 'Time to build that back!' },
    { group: 'legs', emoji: '\u{1F9B5}', message: 'Time for some legs?' },
    { group: 'shoulders', emoji: '\u{1F64C}', message: 'Shoulder day today?' },
  ],
  advanced: [
    { group: 'chest & triceps', emoji: '\u{1F4AA}', message: 'Push day — chest and triceps!' },
    { group: 'back & biceps', emoji: '\u{1F3CB}\u{FE0F}', message: 'Pull day — back and biceps!' },
    { group: 'legs', emoji: '\u{1F9B5}', message: 'Time for some legs?' },
    { group: 'shoulders & arms', emoji: '\u{1F64C}', message: 'Shoulders and arms today!' },
  ],
};

function getTodaySuggestion(level) {
  const key = level && MUSCLE_SUGGESTIONS[level] ? level : 'beginner';
  const options = MUSCLE_SUGGESTIONS[key];
  const dayIndex = new Date().getDay();
  return options[dayIndex % options.length];
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon, label, value, subtext, delay }) {
  return (
    <div
      className="animate-slide-up min-w-[140px] flex-1 rounded-2xl bg-card p-4 shadow-sm"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="mb-1 text-2xl">{icon}</div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-sm font-medium text-text-muted">{label}</p>
      {subtext && <p className="mt-0.5 text-xs text-text-muted">{subtext}</p>}
    </div>
  );
}

function PRBadge({ pr, index }) {
  const accentColors = [
    'from-amber-400 to-orange-400',
    'from-emerald-400 to-teal-400',
    'from-violet-400 to-purple-400',
  ];

  return (
    <div
      className="animate-slide-up flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm"
      style={{ animationDelay: `${(index + 1) * 80}ms`, animationFillMode: 'both' }}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentColors[index % accentColors.length]} text-lg text-white`}
      >
        {'\u{1F3C6}'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-text">
          New PR! {pr.exerciseName}
        </p>
        <p className="text-sm text-text-muted">
          {formatPRValue(pr.type, pr.value)}
        </p>
      </div>
      <div className="text-xl">{'\u{1F389}'}</div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export default function Dashboard({
  userProfile = {},
  recentPRs = [],
  workoutsThisWeek = 0,
  workoutsThisMonth = 0,
  onStartWorkout = () => {},
  onNavigate = () => {},
}) {
  const {
    name = 'there',
    level = 'beginner',
    goal = 3,
    streakWeeks = 0,
    totalWorkouts = 0,
    lastWorkoutDate = null,
  } = userProfile;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const welcomeMsg = getWelcomeMessage(totalWorkouts, lastWorkoutDate);
  const flames = getStreakFlames(streakWeeks);
  const suggestion = getTodaySuggestion(level);
  const displayPRs = recentPRs.slice(0, 3);
  const weeklyGoal = 3;

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="px-4 pt-6">
        {/* ── Welcome Header ─────────────────────────────────────────── */}
        <header
          className={`mb-6 transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <h1 className="text-2xl font-bold text-text">
            Hey {name}!
          </h1>
          <p className="mt-1 text-base text-text-muted">
            {welcomeMsg}
          </p>
        </header>

        {/* ── Streak Display ─────────────────────────────────────────── */}
        <div
          className="animate-slide-up mb-6 rounded-2xl bg-card p-4 shadow-sm"
          style={{ animationDelay: '50ms', animationFillMode: 'both' }}
        >
          {streakWeeks > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{flames}</span>
              <div>
                <p className="text-lg font-bold text-text">
                  Week {streakWeeks} streak!
                </p>
                <p className="text-sm text-text-muted">
                  Keep it going, you&apos;re on fire!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{'\u{1F31F}'}</span>
              <div>
                <p className="text-lg font-bold text-text">
                  Start your streak this week!
                </p>
                <p className="text-sm text-text-muted">
                  Complete a workout to begin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Quick Start Button ─────────────────────────────────────── */}
        <div
          className="animate-slide-up mb-6 text-center"
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          <button
            onClick={onStartWorkout}
            className="animate-pulse-glow w-full rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-md transition-transform active:scale-[0.98]"
          >
            Start Workout
          </button>
          <p className="mt-2 text-sm text-text-muted">
            Choose your muscle group and let&apos;s go
          </p>
        </div>

        {/* ── Stats Cards Row ────────────────────────────────────────── */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatCard
            icon={'\u{1F3CB}\u{FE0F}'}
            label="Total Workouts"
            value={totalWorkouts}
            delay={150}
          />
          <StatCard
            icon={'\u{1F4C5}'}
            label="This Week"
            value={`${workoutsThisWeek}/${weeklyGoal}`}
            subtext={
              workoutsThisWeek >= weeklyGoal
                ? 'Goal hit!'
                : `${weeklyGoal - workoutsThisWeek} more to go`
            }
            delay={200}
          />
          <StatCard
            icon={'\u{1F4CA}'}
            label="This Month"
            value={workoutsThisMonth}
            delay={250}
          />
          <StatCard
            icon={'\u{1F525}'}
            label="Streak"
            value={streakWeeks > 0 ? `${streakWeeks}w` : '—'}
            subtext={streakWeeks > 0 ? 'weeks' : 'No streak yet'}
            delay={300}
          />
        </div>

        {/* ── Recent PRs ─────────────────────────────────────────────── */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">Recent PRs</h2>
            {displayPRs.length > 0 && (
              <button
                onClick={() => onNavigate('progress')}
                className="text-sm font-medium text-primary"
              >
                See all
              </button>
            )}
          </div>

          {displayPRs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {displayPRs.map((pr, i) => (
                <PRBadge key={`${pr.exerciseName}-${pr.date}-${i}`} pr={pr} index={i} />
              ))}
            </div>
          ) : (
            <div
              className="animate-slide-up rounded-2xl bg-card p-5 text-center shadow-sm"
              style={{ animationDelay: '350ms', animationFillMode: 'both' }}
            >
              <p className="text-3xl">{'\u{1F3AF}'}</p>
              <p className="mt-2 font-medium text-text">
                Your first PR is waiting. Let&apos;s get it!
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Complete a workout to start tracking records.
              </p>
            </div>
          )}
        </section>

        {/* ── Today's Suggestion ──────────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-text">
            Today&apos;s Suggestion
          </h2>
          <button
            onClick={onStartWorkout}
            className="animate-slide-up flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all active:scale-[0.98]"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
              {suggestion.emoji}
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-text">{suggestion.message}</p>
              <p className="text-sm text-text-muted">
                Tap to start a {suggestion.group} workout
              </p>
            </div>
            <svg
              className="h-5 w-5 shrink-0 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </section>

        {/* ── Quick Navigation ────────────────────────────────────────── */}
        <nav
          className="animate-slide-up flex gap-3"
          style={{ animationDelay: '450ms', animationFillMode: 'both' }}
        >
          {[
            { page: 'exercises', icon: '\u{1F4D6}', label: 'Exercises' },
            { page: 'progress', icon: '\u{1F4C8}', label: 'Progress' },
            { page: 'settings', icon: '\u{2699}\u{FE0F}', label: 'Settings' },
          ].map(({ page, icon, label }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-card py-3 shadow-sm transition-all active:scale-[0.97]"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium text-text-muted">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
