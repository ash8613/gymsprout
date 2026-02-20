import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------
const SCORED_QUESTIONS = [
  {
    id: 1,
    dimension: "Training History",
    text: "How long have you been exercising regularly?",
    encouragement: "No wrong answers here -- everyone starts somewhere!",
    options: [
      { label: "Never", points: 0 },
      { label: "Less than 3 months", points: 0 },
      { label: "3 - 12 months", points: 1 },
      { label: "1 - 3 years", points: 2 },
      { label: "3+ years", points: 2 },
    ],
  },
  {
    id: 2,
    dimension: "Current Activity",
    text: "How many days per week are you physically active for 30+ minutes?",
    encouragement: "Any movement counts -- walks, playing with kids, all of it!",
    options: [
      { label: "0 days", points: 0 },
      { label: "1 - 2 days", points: 1 },
      { label: "3 - 4 days", points: 1 },
      { label: "5+ days", points: 2 },
    ],
  },
  {
    id: 3,
    dimension: "Exercise Knowledge",
    text: "Which of these is a compound exercise?",
    encouragement:
      "This is just to understand where you are -- no judgement at all!",
    options: [
      { label: "Bicep Curl", points: 0 },
      { label: "Leg Extension", points: 0 },
      { label: "Squat", points: 2 },
      { label: "I don't know", points: 0 },
    ],
  },
  {
    id: 4,
    dimension: "Exercise Knowledge",
    text: "What does '3 sets of 10 reps' mean?",
    encouragement: "Gym lingo can be confusing -- we'll teach you everything!",
    options: [
      { label: "No idea", points: 0 },
      { label: "I think I know", points: 1 },
      { label: "I know exactly what it means", points: 2 },
    ],
  },
  {
    id: 5,
    dimension: "Equipment Comfort",
    text: "Rate your comfort level with free weights",
    encouragement: "Honesty helps us build the perfect plan for you!",
    options: [
      { label: "Never used them", points: 0 },
      { label: "Slightly nervous", points: 0 },
      { label: "Comfortable", points: 1 },
      { label: "Very confident", points: 2 },
    ],
  },
  {
    id: 6,
    dimension: "Goal Alignment",
    text: "Have you ever followed a structured workout program?",
    encouragement: "Whether it's your first or fiftieth program -- we've got you!",
    options: [
      { label: "No", points: 0 },
      { label: "I've tried one before", points: 1 },
      { label: "Yes, I follow one regularly", points: 2 },
    ],
  },
];

const GOALS = [
  { label: "Fat Loss", emoji: "🔥" },
  { label: "Build Muscle", emoji: "💪" },
  { label: "Get Strong", emoji: "🏋️" },
  { label: "General Fitness", emoji: "❤️" },
  { label: "Build Endurance", emoji: "🏃" },
];

const TOTAL_STEPS = 8; // 6 scored + goal + name

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function classifyLevel(score) {
  if (score <= 4) return "Beginner";
  if (score <= 7) return "Intermediate";
  return "Advanced";
}

function levelMessage(level) {
  switch (level) {
    case "Beginner":
      return "You're a Perfect Beginner -- the best place to start!";
    case "Intermediate":
      return "Solid Intermediate -- you've got a great foundation!";
    case "Advanced":
      return "Advanced Athlete -- let's push your limits!";
    default:
      return "";
  }
}

function levelDescription(level) {
  switch (level) {
    case "Beginner":
      return "We'll start with the fundamentals and build your confidence step by step. Every expert was once a beginner, and you're already ahead by showing up!";
    case "Intermediate":
      return "You've already built solid habits. We'll help refine your technique and introduce progressions that keep you growing stronger every week.";
    case "Advanced":
      return "You know your way around the gym. We'll create challenging programs with advanced periodization to help you break through plateaus.";
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#2D6A4F]">
          Question {current + 1} of {total}
        </span>
        <span className="text-sm text-stone-400">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #2D6A4F, #40916C)",
          }}
        />
      </div>
    </div>
  );
}

function ScoredQuestion({ question, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = useCallback(
    (idx) => {
      if (selected !== null) return; // prevent double-tap
      setSelected(idx);
      setShowFeedback(true);
      // brief pause to show feedback then advance
      setTimeout(() => {
        onSelect(question.options[idx].points);
      }, 600);
    },
    [selected, onSelect, question.options]
  );

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      {/* Dimension badge */}
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wide uppercase rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F]">
        {question.dimension}
      </span>

      {/* Question text */}
      <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 text-center leading-snug mb-3">
        {question.text}
      </h2>

      {/* Encouragement */}
      <p className="text-stone-500 text-center text-sm mb-8 max-w-md">
        {question.encouragement}
      </p>

      {/* Options */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`
                w-full min-h-[56px] px-6 py-4 rounded-2xl text-left text-lg font-medium
                transition-all duration-200 cursor-pointer
                border-2
                ${
                  isSelected
                    ? "border-[#2D6A4F] bg-[#2D6A4F] text-white scale-[1.02] shadow-lg"
                    : selected !== null
                    ? "border-stone-200 bg-stone-100 text-stone-400 cursor-default"
                    : "border-stone-200 bg-white text-stone-700 hover:border-[#2D6A4F]/50 hover:shadow-md active:scale-[0.98]"
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Positive feedback */}
      {showFeedback && (
        <p className="mt-6 text-[#2D6A4F] font-semibold text-lg animate-fadeIn">
          Great choice!
        </p>
      )}
    </div>
  );
}

function GoalQuestion({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = useCallback(
    (goal) => {
      if (selected !== null) return;
      setSelected(goal);
      setShowFeedback(true);
      setTimeout(() => {
        onSelect(goal);
      }, 600);
    },
    [selected, onSelect]
  );

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wide uppercase rounded-full bg-[#F59E0B]/15 text-[#B45309]">
        Your Goal
      </span>

      <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 text-center leading-snug mb-3">
        What's your primary fitness goal?
      </h2>

      <p className="text-stone-500 text-center text-sm mb-8 max-w-md">
        Pick the one that excites you most -- you can always change it later!
      </p>

      <div className="w-full max-w-md flex flex-col gap-3">
        {GOALS.map((goal) => {
          const isSelected = selected === goal.label;
          return (
            <button
              key={goal.label}
              onClick={() => handleSelect(goal.label)}
              disabled={selected !== null}
              className={`
                w-full min-h-[56px] px-6 py-4 rounded-2xl text-left text-lg font-medium
                transition-all duration-200 cursor-pointer
                border-2 flex items-center gap-3
                ${
                  isSelected
                    ? "border-[#F59E0B] bg-[#F59E0B] text-white scale-[1.02] shadow-lg"
                    : selected !== null
                    ? "border-stone-200 bg-stone-100 text-stone-400 cursor-default"
                    : "border-stone-200 bg-white text-stone-700 hover:border-[#F59E0B]/50 hover:shadow-md active:scale-[0.98]"
                }
              `}
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {goal.emoji}
              </span>
              <span>{goal.label}</span>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <p className="mt-6 text-[#F59E0B] font-semibold text-lg animate-fadeIn">
          Awesome pick!
        </p>
      )}
    </div>
  );
}

function NameQuestion({ onSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wide uppercase rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F]">
        Almost There
      </span>

      <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 text-center leading-snug mb-3">
        What should we call you?
      </h2>

      <p className="text-stone-500 text-center text-sm mb-8 max-w-md">
        A first name, nickname, or whatever feels right -- this is your journey!
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex"
          autoFocus
          maxLength={30}
          className="
            w-full px-6 py-4 rounded-2xl text-lg font-medium text-stone-800
            bg-white border-2 border-stone-200
            placeholder:text-stone-300
            focus:outline-none focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10
            transition-all duration-200
          "
        />
        <button
          type="submit"
          disabled={name.trim().length === 0}
          className="
            w-full min-h-[56px] px-6 py-4 rounded-2xl text-lg font-bold
            transition-all duration-200 cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-[#2D6A4F] text-white hover:bg-[#236141] active:scale-[0.98]
            shadow-lg shadow-[#2D6A4F]/25
          "
        >
          See My Results
        </button>
      </form>
    </div>
  );
}

function ResultsScreen({ name, quizScore, level, goal, onComplete }) {
  const levelColors = {
    Beginner: { bg: "bg-emerald-50", ring: "ring-emerald-300", text: "text-[#2D6A4F]" },
    Intermediate: { bg: "bg-amber-50", ring: "ring-amber-300", text: "text-[#B45309]" },
    Advanced: { bg: "bg-violet-50", ring: "ring-violet-300", text: "text-violet-700" },
  };
  const colors = levelColors[level] || levelColors.Beginner;

  return (
    <div className="flex flex-col items-center animate-fadeIn text-center">
      {/* Celebration header */}
      <div className="text-5xl mb-4" role="img" aria-label="celebration">
        🎉
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-800 mb-2">
        Welcome, {name}!
      </h1>

      <p className="text-stone-500 mb-8 max-w-sm">
        We've crunched the numbers and here's your personalised starting point.
      </p>

      {/* Level card */}
      <div
        className={`
          w-full max-w-sm p-6 rounded-2xl mb-6
          ${colors.bg} ring-2 ${colors.ring}
        `}
      >
        <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-1">
          Your Level
        </p>
        <p className={`text-3xl font-extrabold mb-2 ${colors.text}`}>
          {level}
        </p>
        <p className={`text-lg font-semibold mb-3 ${colors.text}`}>
          {levelMessage(level)}
        </p>
        <p className="text-stone-600 text-sm leading-relaxed">
          {levelDescription(level)}
        </p>
      </div>

      {/* Stats row */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-stone-200">
          <p className="text-sm text-stone-400 mb-1">Quiz Score</p>
          <p className="text-2xl font-bold text-stone-800">
            {quizScore}
            <span className="text-base font-normal text-stone-400"> / 10</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200">
          <p className="text-sm text-stone-400 mb-1">Goal</p>
          <p className="text-lg font-bold text-stone-800 leading-tight">
            {goal}
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onComplete({ name, level, goal, quizScore })}
        className="
          w-full max-w-sm min-h-[56px] px-6 py-4 rounded-2xl text-lg font-bold
          bg-[#2D6A4F] text-white hover:bg-[#236141] active:scale-[0.98]
          transition-all duration-200 cursor-pointer
          shadow-lg shadow-[#2D6A4F]/25
        "
      >
        Let's Get Started
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function OnboardingQuiz({ onComplete }) {
  const [step, setStep] = useState(0); // 0-5: scored, 6: goal, 7: name, 8: results
  const [score, setScore] = useState(0);
  const [goal, setGoal] = useState(null);
  const [name, setName] = useState("");

  // Handle a scored answer (questions 0-5)
  const handleScoredAnswer = useCallback(
    (points) => {
      setScore((prev) => prev + points);
      setStep((prev) => prev + 1);
    },
    []
  );

  // Handle goal selection (step 6)
  const handleGoalSelect = useCallback((selectedGoal) => {
    setGoal(selectedGoal);
    setStep(7);
  }, []);

  // Handle name submission (step 7)
  const handleNameSubmit = useCallback((submittedName) => {
    setName(submittedName);
    setStep(8);
  }, []);

  // Cap the score at 10 -- the max possible from the 6 questions is 12 but the
  // design says 0-10, so we clamp just in case (the chosen questions actually
  // max at 12 with all-top answers but the spec says 0-10 total).
  const clampedScore = Math.min(score, 10);
  const level = classifyLevel(clampedScore);

  // ----- Results screen (step 8) -----
  if (step === 8) {
    return (
      <div className="min-h-dvh bg-[#FAFAF9] flex flex-col items-center justify-center px-4 py-10">
        <ResultsScreen
          name={name}
          quizScore={clampedScore}
          level={level}
          goal={goal}
          onComplete={onComplete}
        />
      </div>
    );
  }

  // ----- Quiz flow (steps 0-7) -----
  return (
    <div className="min-h-dvh bg-[#FAFAF9] flex flex-col px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        {/* Progress bar -- show for all 8 question steps */}
        <ProgressBar current={step} total={TOTAL_STEPS} />

        {/* Render current step */}
        <div className="flex-1 flex flex-col justify-center" key={step}>
          {step < 6 && (
            <ScoredQuestion
              question={SCORED_QUESTIONS[step]}
              onSelect={handleScoredAnswer}
            />
          )}

          {step === 6 && <GoalQuestion onSelect={handleGoalSelect} />}

          {step === 7 && <NameQuestion onSubmit={handleNameSubmit} />}
        </div>
      </div>

      {/* Subtle tailwind animation keyframe (inline style tag for fadeIn) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out both;
        }
      `}</style>
    </div>
  );
}
