import { useState } from "react";

const RATINGS = [
  { value: 1, emoji: "😞", label: "Poor" },
  { value: 2, emoji: "😕", label: "Okay" },
  { value: 3, emoji: "😊", label: "Good" },
  { value: 4, emoji: "😄", label: "Great" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

const CATEGORIES = [
  "General Feedback",
  "Bug Report",
  "Feature Request",
  "Exercise Suggestion",
  "UI / Design",
  "Other",
];

export default function FeedbackForm({ onBack, userName }) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState(userName || "");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const canSubmit = rating > 0 && message.trim().length > 0 && status === "idle";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("sending");

    try {
      const res = await fetch("https://formspree.io/f/xnjbbged", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonymous",
          rating: `${rating}/5 (${RATINGS.find((r) => r.value === rating)?.label})`,
          category: category || "General Feedback",
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="min-h-dvh bg-[#FAFAF9] flex flex-col">
        {/* Header */}
        <div className="bg-[#2D6A4F] px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-8 rounded-b-3xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 active:scale-95 transition-transform"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-extrabold text-white">Feedback</h1>
          </div>
        </div>

        {/* Success state */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">Thank you!</h2>
            <p className="text-sm text-stone-500 mb-8 leading-relaxed">
              Your feedback has been sent successfully.<br />
              It means a lot and helps us make GymSprout better!
            </p>
            <button
              type="button"
              onClick={onBack}
              className="
                px-8 py-3 rounded-2xl text-sm font-bold
                bg-[#2D6A4F] text-white shadow-lg shadow-emerald-900/20
                active:scale-[0.97] transition-all duration-150
              "
            >
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAFAF9] pb-8">
      {/* Header */}
      <div className="bg-[#2D6A4F] px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Send Feedback</h1>
            <p className="text-white/70 text-sm">Help us improve GymSprout</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 -mt-4 flex flex-col gap-4">
        {/* Rating */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 block px-1">
            How's your experience? *
          </label>
          <div className="flex justify-between gap-1">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRating(r.value)}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-3 rounded-xl
                  transition-all duration-150 active:scale-[0.95]
                  ${
                    rating === r.value
                      ? "bg-emerald-50 border-2 border-[#2D6A4F] shadow-sm"
                      : "bg-stone-50 border-2 border-transparent"
                  }
                `}
              >
                <span className="text-2xl">{r.emoji}</span>
                <span
                  className={`text-[10px] font-semibold ${
                    rating === r.value ? "text-[#2D6A4F]" : "text-stone-400"
                  }`}
                >
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 block px-1">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(category === cat ? "" : cat)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-semibold
                  transition-all duration-150 active:scale-[0.95]
                  ${
                    category === cat
                      ? "bg-[#2D6A4F] text-white"
                      : "bg-stone-100 text-stone-600"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 block px-1">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
            maxLength={50}
            className="
              w-full px-4 py-3 rounded-xl text-sm font-medium text-stone-800
              bg-stone-50 border border-stone-200
              focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10
              transition-all duration-200 placeholder:text-stone-300
            "
          />
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 block px-1">
            Your Feedback *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you think, report a bug, or suggest a feature..."
            rows={5}
            maxLength={1000}
            className="
              w-full px-4 py-3 rounded-xl text-sm font-medium text-stone-800
              bg-stone-50 border border-stone-200 resize-none
              focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10
              transition-all duration-200 placeholder:text-stone-300
            "
          />
          <p className="text-[10px] text-stone-300 mt-1.5 text-right px-1">
            {message.length}/1000
          </p>
        </div>

        {/* Error message */}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl">😔</span>
            <div>
              <p className="text-sm font-semibold text-red-700">
                Oops, something went wrong
              </p>
              <p className="text-xs text-red-600/70 mt-0.5">
                Please try again or reach out directly
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`
            w-full py-4 rounded-2xl text-base font-bold
            transition-all duration-200
            ${
              canSubmit
                ? "bg-[#2D6A4F] text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {status === "sending" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Sending...
            </span>
          ) : status === "error" ? (
            "Try Again"
          ) : (
            "Send Feedback"
          )}
        </button>

        <p className="text-[10px] text-stone-300 text-center pb-4">
          Your feedback is anonymous unless you provide your name
        </p>
      </form>
    </div>
  );
}
