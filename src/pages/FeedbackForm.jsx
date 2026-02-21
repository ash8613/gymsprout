import { useState, useRef } from "react";

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
  const [attachment, setAttachment] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef(null);

  const canSubmit = rating > 0 && message.trim().length > 0 && status === "idle";

  function handleAttach(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachment(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function removeAttachment() {
    setAttachment(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmitAttempt(e) {
    e.preventDefault();
    if (!canSubmit) {
      setShowValidation(true);
      return;
    }
    handleSubmit();
  }

  async function handleSubmit() {
    setStatus("sending");

    try {
      const formData = new FormData();
      formData.append("name", name.trim() || "Anonymous");
      formData.append(
        "rating",
        `${rating}/5 (${RATINGS.find((r) => r.value === rating)?.label})`
      );
      formData.append("category", category || "General Feedback");
      formData.append("message", message.trim());
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const res = await fetch("https://formspree.io/f/xnjbbged", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
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
      <form onSubmit={handleSubmitAttempt} className="px-4 -mt-4 flex flex-col gap-4">
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
                onClick={() => { setRating(r.value); if (showValidation) setShowValidation(false); }}
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
          {showValidation && rating === 0 && (
            <p className="text-xs text-red-500 font-medium mt-2 px-1">Please select a rating</p>
          )}
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

        {/* Message + Attachment */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 block px-1">
            Your Feedback *
          </label>
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (showValidation && e.target.value.trim()) setShowValidation(false); }}
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
          <div className="flex items-center justify-between mt-1.5 px-1">
            <p className="text-[10px] text-stone-300">
              {message.length}/1000
            </p>
          </div>

          {showValidation && message.trim().length === 0 && (
            <p className="text-xs text-red-500 font-medium mt-1 px-1">Please write your feedback</p>
          )}

          {/* Attachment area */}
          <div className="mt-3 pt-3 border-t border-stone-100">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAttach}
              className="hidden"
            />

            {preview ? (
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Attachment preview"
                    className="w-20 h-20 rounded-xl object-cover border border-stone-200"
                  />
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="
                      absolute -top-2 -right-2 w-6 h-6 rounded-full
                      bg-red-500 text-white text-xs font-bold
                      flex items-center justify-center
                      shadow-sm active:scale-90 transition-transform
                    "
                    aria-label="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-stone-600 truncate">
                    {attachment?.name}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {attachment ? `${(attachment.size / 1024).toFixed(0)} KB` : ""}
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                  w-full flex items-center justify-center gap-2
                  py-3 rounded-xl border-2 border-dashed border-stone-200
                  text-xs font-semibold text-stone-400
                  active:bg-stone-50 active:scale-[0.98] transition-all duration-150
                "
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Attach Screenshot (optional)
              </button>
            )}
          </div>
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
          className={`
            w-full py-4 rounded-2xl text-base font-bold
            transition-all duration-200
            ${
              canSubmit
                ? "bg-[#2D6A4F] text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                : "bg-gray-200 text-gray-400"
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
