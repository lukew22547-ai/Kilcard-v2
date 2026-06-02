import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import kilcardLogo from "@/assets/KilCard.png";

export const Route = createFileRoute("/intro")({
  head: () => ({
    meta: [
      { title: "Welcome to Kilcard — Track. Analyze. Improve." },
      { name: "description", content: "Kilcard makes it simple to track your golf rounds and stats. Welcome to smarter improvement." },
      { property: "og:title", content: "Welcome to Kilcard" },
      { property: "og:description", content: "Track every round, see your stats instantly, and build your golf history over time." },
    ],
  }),
  component: IntroPage,
});

const SLIDE_1_FEATURES = [
  "Log every hole in seconds",
  "See your stats after every round",
  "Build your full golf history",
];

const SLIDE_2_FEATURES = [
  "Break down where you lose strokes",
  "Highlight your weakest areas",
  "Suggest drills built for your game",
];

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IntroPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    // Stamp persistence flags
    localStorage.setItem("kilcard:intro-seen", "true");
    document.cookie = "kc_intro=1; max-age=31536000; path=/; SameSite=Lax";

    // If the user already has a valid Firebase session (e.g. iOS force-quit
    // cleared our cookies but kept the session), skip intro and go home.
    const unsub = onAuthStateChanged(auth, (user) => {
      const isGuest = localStorage.getItem("kilcard:guest") === "true";
      if (user || isGuest) {
        document.cookie = "kc_auth=1; max-age=31536000; path=/; SameSite=Lax";
        navigate({ to: "/" });
      }
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => setSlide((s) => Math.min(s + 1, 1)), []);
  const goPrev = useCallback(() => setSlide((s) => Math.max(s - 1, 0)), []);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].screenX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
  }

  function enterApp() {
    navigate({ to: "/auth" });
  }

  return (
    <div className="flex h-dvh flex-col bg-paper text-navy overflow-hidden select-none">

      {/* Slides */}
      <div
        className="relative flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >

          {/* ── Slide 1 — Welcome ── */}
          <div className="w-full shrink-0 flex flex-col items-center px-6 pt-14 pb-4 overflow-y-auto">

            {/* Logo */}
            <img
              src={kilcardLogo}
              alt="Kilcard"
              className="h-24 w-auto mix-blend-multiply mb-10"
            />

            {/* Headline */}
            <div className="text-center mb-10 w-full max-w-sm">
              <h1 className="font-display text-[52px] uppercase leading-none tracking-tight">
                Welcome to<br />KilCard
              </h1>
              <p className="mt-4 text-[16px] leading-relaxed text-navy/55">
                Track your game. Understand your stats.<br />Play better golf.
              </p>
            </div>

            {/* Feature cards */}
            <div className="w-full max-w-sm space-y-3">
              {SLIDE_1_FEATURES.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-4 rounded-2xl bg-white px-5 py-[15px] shadow-sm ring-1 ring-navy/8"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grass text-paper">
                    <Check />
                  </span>
                  <span className="text-[15px] font-medium text-navy">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Slide 2 — Caddie AI ── */}
          <div className="w-full shrink-0 flex flex-col items-center px-6 pt-14 pb-4 overflow-y-auto">

            {/* AI icon badge */}
            <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-navy shadow-md">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4Z"/>
                <path d="M9 12h.01M15 12h.01"/>
                <path d="M9.5 17c.83.63 1.94 1 3 1s2.17-.37 3-1" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>

            {/* Headline */}
            <div className="text-center mb-10 w-full max-w-sm">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-grass">
                Included Free
              </p>
              <h2 className="font-display text-[48px] uppercase leading-none tracking-tight">
                Your Caddie AI
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-navy/55">
                Your personal AI coach analyzes every round and tells you exactly what to work on.
              </p>
            </div>

            {/* Feature cards */}
            <div className="w-full max-w-sm space-y-3">
              {SLIDE_2_FEATURES.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-4 rounded-2xl bg-white px-5 py-[15px] shadow-sm ring-1 ring-navy/8"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grass text-paper">
                    <Check />
                  </span>
                  <span className="text-[15px] font-medium text-navy">{f}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div className="shrink-0 px-6 pb-10 pt-5">

        {/* Page dots */}
        <div className="mb-5 flex items-center justify-center gap-2">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={
                "h-[6px] rounded-full transition-all duration-300 " +
                (slide === i ? "w-6 bg-navy" : "w-[6px] bg-navy/20")
              }
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={slide === 0 ? goNext : enterApp}
          className="w-full rounded-2xl bg-grass py-[16px] text-[15px] font-semibold text-paper shadow-sm transition-all duration-200 active:scale-[0.98] hover:shadow-md"
        >
          {slide === 0 ? "Next" : "Get Started"}
        </button>

        {/* Back link on slide 2 */}
        {slide === 1 && (
          <button
            onClick={goPrev}
            className="mt-3 w-full py-2 text-[13px] font-medium text-navy/35 transition-colors hover:text-navy/60"
          >
            ← Back
          </button>
        )}
      </div>

    </div>
  );
}
